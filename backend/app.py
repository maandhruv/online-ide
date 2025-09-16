from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json, os, uuid, redis, judge
import config

r = redis.Redis.from_url(config.REDIS_URL, decode_responses=True)

app = FastAPI(title="DSA IDE API (Queue, Multi-problem)")

# Get allowed origins from environment or use defaults
FRONTEND_URLS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

class RunBody(BaseModel):
    problem_id: str
    source_code: str

@app.get("/")
def root():
    return {"ok": True}

@app.get("/problems")
def get_problems():
    return {"items": judge.list_problems()}

@app.get("/problems/{pid}")
def get_problem(pid: str):
    try:
        p = judge.load_problem(pid)
    except Exception:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {
        "id": p["id"], "title": p["title"],
        "statement": p["statement"], "constraints": p["constraints"],
        "public_count": len(p["public_tests"])
    }

def enqueue_job(kind: str, problem_id: str, source_code: str) -> str:
    sub_id = str(uuid.uuid4())
    r.hset(f"result:{sub_id}", mapping={"status": "PENDING"})
    r.rpush("queue:runs", json.dumps({
        "id": sub_id, "kind": kind,
        "problem_id": problem_id,
        "source_code": source_code
    }))
    return sub_id

@app.post("/run")
def run_public(body: RunBody):
    # validate problem exists quickly
    try: judge.load_problem(body.problem_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {"submission_id": enqueue_job("public", body.problem_id, body.source_code)}

@app.post("/submit")
def run_all(body: RunBody):
    try: judge.load_problem(body.problem_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {"submission_id": enqueue_job("all", body.problem_id, body.source_code)}

@app.get("/result/{submission_id}")
def get_result(submission_id: str):
    key = f"result:{submission_id}"
    if not r.exists(key):
        return {"status": "UNKNOWN", "error": "No such submission id"}
    data = r.hgetall(key)
    resp = {"status": data.get("status", "PENDING")}
    if data.get("status") == "DONE":
        resp["verdict"] = data.get("verdict")
        if "results" in data:
            resp["results"] = json.loads(data["results"])
    return resp
