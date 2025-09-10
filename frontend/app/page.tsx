"use client";

import React from "react";
import Editor from "@monaco-editor/react";
import { fetchProblem, runSample, submitAll } from "./api-client";

const STARTER = `# Implement solve() reading stdin and printing result.
# Input:
# n
# a1 a2 ... an
# target
# Output: i j (0-based, i<j) or -1 -1

def solve():
    import sys
    data = sys.stdin.read().strip().split()
    n = int(data[0])
    arr = list(map(int, data[1:1+n]))
    target = int(data[1+n])

    seen = {}
    for i, x in enumerate(arr):
        y = target - x
        if y in seen:
            print(seen[y], i)
            return
        seen[x] = i
    print(-1, -1)

if __name__ == "__main__":
    solve()
`;

type Result = {
  verdict: string;
  results: { test_index: number; status: string; stdout: string; stderr: string; expected: string }[];
};

export default function Page() {
  const [code, setCode] = React.useState(STARTER);
  const [loading, setLoading] = React.useState(false);
  const [problem, setProblem] = React.useState<any>(null);
  const [result, setResult] = React.useState<Result | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchProblem()
      .then(setProblem)
      .catch((e) => setErr(String(e)));
  }, []);

  async function onRun() {
    setLoading(true); setErr(null); setResult(null);
    try {
      const r = await runSample(code);
      setResult(r);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit() {
    setLoading(true); setErr(null); setResult(null);
    try {
      const r = await submitAll(code);
      setResult(r);
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: "20px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Two Sum (0-based indices)</h1>
      {problem ? (
        <div style={{ marginBottom: 16 }}>
          <p>{problem.statement}</p>
          <small>Constraints: {problem.constraints}</small>
        </div>
      ) : <p>Loading problem…</p>}

      <Editor
        height="45vh"
        defaultLanguage="python"
        value={code}
        onChange={(v) => setCode(v || "")}
        options={{ fontSize: 14, minimap: { enabled: false } }}
      />

      <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
        <button onClick={onRun} disabled={loading}>▶ Run sample</button>
        <button onClick={onSubmit} disabled={loading}>✅ Submit</button>
        {loading && <span>Running…</span>}
      </div>

      {err && <pre style={{ color: "crimson" }}>{err}</pre>}

      {result && (
        <div style={{ marginTop: 12 }}>
          <h3>Verdict: {result.verdict}</h3>
          {result.results.map((t) => (
            <div key={t.test_index} style={{ border: "1px solid #ccc", padding: 8, marginTop: 8 }}>
              <b>Test #{t.test_index}</b> — Status: {t.status}
              <details>
                <summary>Show details</summary>
                <p><b>Expected</b>:</p>
                <pre>{t.expected}</pre>
                <p><b>Your Output</b>:</p>
                <pre>{t.stdout}</pre>
                {t.stderr && (<><p><b>stderr</b>:</p><pre>{t.stderr}</pre></>)}
              </details>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
