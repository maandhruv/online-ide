import json, time, os, redis
import judge
import config

r = redis.Redis.from_url(config.REDIS_URL, decode_responses=True)

def run_once():
    item = r.blpop("queue:runs", timeout=5)
    if not item:
        return
    _, data = item
    job = json.loads(data)
    sub_id = job["id"]
    kind = job["kind"]
    code = job["source_code"]
    problem_id = job["problem_id"]

    try:
        problem = judge.load_problem(problem_id)
        tests = problem["public_tests"] if kind == "public" else (problem["public_tests"] + problem["private_tests"])
        result = judge.judge_io(code, tests)
        r.hset(f"result:{sub_id}", mapping={
            "status": "DONE",
            "verdict": result["verdict"],
            "results": json.dumps(result["results"])
        })
    except Exception as e:
        r.hset(f"result:{sub_id}", mapping={
            "status": "DONE",
            "verdict": "ERROR",
            "results": json.dumps([{"test_index": -1, "status": "RTE", "stdout": "", "stderr": str(e), "expected": ""}])
        })


def main():
    print("Runner started. Waiting for jobs…")
    while True:
        run_once()

if __name__ == "__main__":
    print("Runner starting up…")
    judge.ensure_base_image()
    main()
