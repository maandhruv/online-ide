const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export async function fetchProblem() {
  const r = await fetch(`${BASE}/problem`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load problem");
  return r.json();
}

export async function enqueueRun(source_code: string, kind: "public" | "all") {
  const r = await fetch(`${BASE}/${kind === "public" ? "run" : "submit"}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_code }),
  });
  if (!r.ok) throw new Error("enqueue failed");
  return r.json() as Promise<{ submission_id: string }>;
}

export async function fetchResult(submission_id: string) {
  const r = await fetch(`${BASE}/result/${submission_id}`, { cache: "no-store" });
  if (!r.ok) throw new Error("result fetch failed");
  return r.json();
}
