const BASE = "http://localhost:8000";

export async function fetchProblem() {
  const r = await fetch(`${BASE}/problem`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load problem");
  return r.json();
}

export async function runSample(source_code: string) {
  const r = await fetch(`${BASE}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_code })
  });
  if (!r.ok) throw new Error("Run failed");
  return r.json();
}

export async function submitAll(source_code: string) {
  const r = await fetch(`${BASE}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_code })
  });
  if (!r.ok) throw new Error("Submit failed");
  return r.json();
}
