const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function listProblems() {
  const r = await fetch(`${BASE}/problems`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load problems");
  return r.json() as Promise<{ items: { id: string; title: string }[] }>;
}

export async function fetchProblem(problem_id: string) {
  const r = await fetch(`${BASE}/problems/${problem_id}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load problem");
  return r.json();
}

export async function enqueueRun(problem_id: string, source_code: string, kind: "public" | "all") {
  const r = await fetch(`${BASE}/${kind === "public" ? "run" : "submit"}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem_id, source_code }),
  });
  if (!r.ok) throw new Error("enqueue failed");
  return r.json() as Promise<{ submission_id: string }>;
}

export async function fetchResult(submission_id: string) {
  const r = await fetch(`${BASE}/result/${submission_id}`, { cache: "no-store" });
  if (!r.ok) throw new Error("result fetch failed");
  return r.json();
}
