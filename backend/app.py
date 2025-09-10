from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json, os, time, uuid, redis
import judge

REDIS_URL = os.environ.get("REDIS_URL", "redis://redis:6379/0")
r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

app = FastAPI(title="DSA IDE API (Queue)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://127.0.0.1:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

class RunBody(BaseModel):
    source_code: str

@app.get("/")
def root():
    return {"ok": True, "msg": "DSA IDE API up. Use /problem, /run, /submit, /result/{id}"}

@app.get("/problem")
def get_problem():
    p = judge.load_problem()
    return {
        "id": p["id"], "title": p["title"],
        "statement": p["statement"], "constraints": p["constraints"],
        "public_count": len(p["public_tests"])
    }

def enqueue_job(kind: str, source_code: str) -> str:
    sub_id = str(uuid.uuid4())
    job = {
        "id": sub_id,
        "kind": kind,              # "public" or "all"
        "source_code": source_code
    }
    # result key defaults to PENDING
    r.hset(f"result:{sub_id}", mapping={"status": "PENDING"})
    # push to queue (FIFO)
    r.rpush("queue:runs", json.dumps(job))
    return sub_id

@app.post("/run")
def run_public(body: RunBody):
    sub_id = enqueue_job("public", body.source_code)
    return {"submission_id": sub_id}

@app.post("/submit")
def run_all(body: RunBody):
    sub_id = enqueue_job("all", body.source_code)
    return {"submission_id": sub_id}

@app.get("/result/{submission_id}")
def get_result(submission_id: str):
    key = f"result:{submission_id}"
    if not r.exists(key):
        return {"status": "UNKNOWN", "error": "No such submission id"}
    data = r.hgetall(key)
    # If finished, payload will contain json fields: verdict, results
    resp = {"status": data.get("status", "PENDING")}
    if data.get("status") == "DONE":
        resp["verdict"] = data.get("verdict")
        # results stored as JSON string to keep it simple
        if "results" in data:
            resp["results"] = json.loads(data["results"])
    return resp
