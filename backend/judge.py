import os, io, tarfile, json
import docker

# --- Sandbox limits ---
PY_IMAGE   = "python:3.11-slim"
CPU_LIMIT  = 1            # 1 vCPU -> nano_cpus = 1e9
MEM_LIMIT  = "256m"
PID_LIMIT  = 256
TIMEOUT_SEC = 2

_client = None
def get_client():
    """Lazy-create docker client so API can import this module without /var/run/docker.sock."""
    global _client
    if _client is None:
        _client = docker.from_env()
    return _client

def ensure_base_image():
    try:
        get_client().images.pull(PY_IMAGE)
    except Exception as e:
        print("WARN: failed to pull base image via SDK:", e)

def _make_tar(files: dict) -> bytes:
    """Build a tarball (as bytes) to copy files into the sandbox container."""
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w") as tar:
        for path, data in files.items():
            rel = path.lstrip("/")
            info = tarfile.TarInfo(name=rel)
            info.size = len(data)
            info.mode = 0o644
            tar.addfile(info, io.BytesIO(data))
    buf.seek(0)
    return buf.read()

def run_in_sandbox(source_code: str, stdin_data: str) -> dict:
    """Run user code in an ephemeral container. No host bind mounts; we copy files in."""
    client = get_client()
    container = None
    try:
        container = client.containers.create(
            image=PY_IMAGE,
            command=["/bin/sh", "-lc", "python /work/main.py < /tmp/_in"],
            working_dir="/work",
            network="none",
            mem_limit=MEM_LIMIT,
            pids_limit=PID_LIMIT,
            nano_cpus=int(CPU_LIMIT * 1e9),
            security_opt=["no-new-privileges:true"],
            tty=False, stdin_open=False, detach=True,
        )

        tar_bytes = _make_tar({
            "/work/main.py": source_code.encode("utf-8"),
            "/tmp/_in": stdin_data.encode("utf-8"),
        })
        container.put_archive(path="/", data=tar_bytes)

        container.start()
        try:
            result = container.wait(timeout=TIMEOUT_SEC)  # may raise on timeout
            code = result.get("StatusCode", 137)
        except Exception:
            try: container.kill()
            except Exception: pass
            code = 137  # treat as TLE

        stdout = container.logs(stdout=True,  stderr=False).decode("utf-8", "replace")
        stderr = container.logs(stdout=False, stderr=True ).decode("utf-8", "replace")
        ok = (code == 0)
        status = "OK" if ok else ("TLE" if code in (137, 143) else "RTE")
        return {"ok": ok, "stdout": stdout, "stderr": stderr, "status": status}
    except Exception as e:
        return {"ok": False, "stdout": "", "stderr": f"Runner error: {e}", "status": "RTE"}
    finally:
        try:
            if container: container.remove(force=True)
        except Exception:
            pass

def normalize(s: str) -> str:
    lines = [line.rstrip() for line in s.strip().splitlines()]
    return ("\n".join(lines) + "\n") if lines else ""

def judge_io(source_code: str, tests: list) -> dict:
    """I/O judge: feed stdin, compare stdout to expected (normalized)."""
    results, all_pass = [], True
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

# ... keep the rest of judge.py exactly as we finalized earlier ...

def load_problem(problem_id: str):
    """Load a problem JSON by id from ./problems directory."""
    base = os.path.join(os.path.dirname(__file__), "problems")
    path = os.path.join(base, f"{problem_id}.json")
    if not os.path.exists(path):
        # allow mapping by slug filenames that may contain dashes already
        # also try to find by scanning
        for name in os.listdir(base):
            if name.endswith(".json"):
                with open(os.path.join(base, name), "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if data.get("id") == problem_id:
                        return data
        raise FileNotFoundError(f"Problem not found: {problem_id}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def list_problems():
    base = os.path.join(os.path.dirname(__file__), "problems")
    items = []
    for name in sorted(os.listdir(base)):
        if name.endswith(".json"):
            with open(os.path.join(base, name), "r", encoding="utf-8") as f:
                p = json.load(f)
                items.append({"id": p["id"], "title": p["title"]})
    return items

