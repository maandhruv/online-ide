import os, io, tarfile, tempfile, shutil, json
import docker

PY_IMAGE = "python:3.11-slim"
CPU_LIMIT = 1              # 1 vCPU (nano_cpus = 1e9)
MEM_LIMIT = "256m"
PID_LIMIT = 256
TIMEOUT_SEC = 2

client = docker.from_env()

def ensure_base_image():
    try:
        client.images.pull(PY_IMAGE)
    except Exception as e:
        print("WARN: failed to pull base image via SDK:", e)

def _make_tar(files: dict) -> bytes:
    """
    Create a tar archive (as bytes) with {container_path: file_bytes}.
    Example: {"/work/main.py": b"...", "/tmp/_in": b"..."}
    """
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w") as tar:
        for path, data in files.items():
            # Tar needs relative names inside archive
            rel = path.lstrip("/")
            info = tarfile.TarInfo(name=rel)
            info.size = len(data)
            info.mtime = int(os.path.getmtime(__file__)) if os.path.exists(__file__) else 0
            info.mode = 0o644
            tar.addfile(info, io.BytesIO(data))
    buf.seek(0)
    return buf.read()

def run_in_sandbox(source_code: str, stdin_data: str) -> dict:
    """
    Run user code inside a Docker container WITHOUT host bind mounts.
    We copy files in with put_archive and redirect stdin from /tmp/_in.
    """
    container = None
    try:
        # Create container (filesystem writable so we can copy files in)
        container = client.containers.create(
            image=PY_IMAGE,
            command=["/bin/sh", "-lc", "python /work/main.py < /tmp/_in"],
            working_dir="/work",
            network="none",                 # disable networking
            mem_limit=MEM_LIMIT,
            pids_limit=PID_LIMIT,
            nano_cpus=int(CPU_LIMIT * 1e9),
            security_opt=["no-new-privileges:true"],
            tty=False,
            stdin_open=False,
            detach=True,
        )

        # Copy main.py and input into container
        tar_bytes = _make_tar({
            "/work/main.py": source_code.encode("utf-8"),
            "/tmp/_in": stdin_data.encode("utf-8"),
        })
        # put_archive destination is the root ("/"); paths inside tar are absolute-stripped
        container.put_archive(path="/", data=tar_bytes)

        # Start and wait with timeout
        container.start()
        try:
            result = container.wait(timeout=TIMEOUT_SEC)  # may raise ReadTimeout on TLE
            status_code = result.get("StatusCode", 137)
        except Exception:
            # Timeout → force kill; treat as TLE
            try:
                container.kill()
            except Exception:
                pass
            status_code = 137  # conventional non-zero; we'll map to TLE below

        stdout = container.logs(stdout=True, stderr=False).decode("utf-8", "replace")
        stderr = container.logs(stdout=False, stderr=True).decode("utf-8", "replace")

        ok = (status_code == 0)
        status = "OK" if ok else ("TLE" if status_code in (137, 143) else "RTE")
        return {"ok": ok, "stdout": stdout, "stderr": stderr, "status": status}

    except docker.errors.APIError as e:
        return {"ok": False, "stdout": "", "stderr": f"Docker API error: {e.explanation}", "status": "RTE"}
    except Exception as e:
        msg = str(e)
        if "timed out" in msg.lower():
            return {"ok": False, "stdout": "", "stderr": "Time limit exceeded", "status": "TLE"}
        return {"ok": False, "stdout": "", "stderr": f"Runner error: {e}", "status": "RTE"}
    finally:
        try:
            if container:
                container.remove(force=True)
        except Exception:
            pass

def normalize(s: str) -> str:
    lines = [line.rstrip() for line in s.strip().splitlines()]
    return "\n".join(lines) + ("\n" if lines else "")

def judge_io(source_code: str, tests: list) -> dict:
    results = []
    all_pass = True
    for idx, t in enumerate(tests):
        res = run_in_sandbox(source_code, t["input"])
        out_norm = normalize(res["stdout"])
        exp_norm = normalize(t["output"])
        passed = (res["status"] == "OK" and out_norm == exp_norm)
        if not passed:
            all_pass = False
        results.append({
            "test_index": idx,
            "status": "PASSED" if passed else res["status"] if res["status"] != "OK" else "WA",
            "stdout": res["stdout"],
            "stderr": res["stderr"],
            "expected": t["output"]
        })
    return {"verdict": "ACCEPTED" if all_pass else "REJECTED", "results": results}

def load_problem():
    with open(os.path.join(os.path.dirname(__file__), "problems", "two_sum.json"), "r", encoding="utf-8") as f:
        return json.load(f)

ensure_base_image()
