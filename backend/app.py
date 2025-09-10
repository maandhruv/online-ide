from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
import judge

app = FastAPI(title="DSA IDE Backend")

# CORS: allow local Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RunBody(BaseModel):
    source_code: str

@app.get("/")
def root():
    return {"ok": True, "msg": "DSA IDE backend up. Try /problem"}

@app.get("/problem")
def get_problem():
    p = judge.load_problem()
    # only expose public tests to the frontend for "Run sample"
    public_count = len(p["public_tests"])
    return {
        "id": p["id"],
        "title": p["title"],
        "statement": p["statement"],
        "constraints": p["constraints"],
        "public_count": public_count
    }

@app.post("/run")
def run_public(body: RunBody):
    p = judge.load_problem()
    result = judge.judge_io(body.source_code, p["public_tests"])
    return result

@app.post("/submit")
def run_all(body: RunBody):
    p = judge.load_problem()
    all_tests = p["public_tests"] + p["private_tests"]
    result = judge.judge_io(body.source_code, all_tests)
    return result
