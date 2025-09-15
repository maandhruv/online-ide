"use client";

import React from "react";
import { useParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import { fetchProblem, enqueueRun, fetchResult } from "../../api-client";

type Result = {
  verdict: string;
  results: { test_index: number; status: string; stdout: string; stderr: string; expected: string }[];
};

const STARTER = `# Implement solve() reading stdin and printing result.
# (Starter works for Two Sum. Adjust per problem.)
def solve():
    import sys
    data = sys.stdin.read().strip().split()
    if not data: 
        print()
        return
    # default: echo input (many problems will need edits)
    print(" ".join(data))

if __name__ == "__main__":
    solve()
`;

export default function ProblemIDE() {
  const params = useParams<{ id: string }>();
  const problemId = params.id;
  const [code, setCode] = React.useState(STARTER);
  const [loading, setLoading] = React.useState(false);
  const [problem, setProblem] = React.useState<any>(null);
  const [result, setResult] = React.useState<Result | null>(null);
  const [err, setErr] = React.useState<string|null>(null);

  React.useEffect(() => {
    setErr(null); setResult(null);
    fetchProblem(problemId)
      .then(setProblem)
      .catch(e => setErr(String(e)));
  }, [problemId]);

  async function pollResult(id: string) {
    while (true) {
      const res = await fetchResult(id);
      if (res.status === "DONE") return res;
      await new Promise(r => setTimeout(r, 800));
    }
  }

  async function run(kind: "public" | "all") {
    setLoading(true); setErr(null); setResult(null);
    try {
      const { submission_id } = await enqueueRun(problemId, code, kind);
      const final = await pollResult(submission_id);
      setResult({ verdict: final.verdict, results: final.results });
    } catch (e: any) {
      setErr(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: "20px auto", padding: 16 }}>
      <h1>{problem?.title || "Loading…"}</h1>
      {problem ? (
        <div style={{marginBottom:16}}>
          <p>{problem.statement}</p>
          <small>Constraints: {problem.constraints}</small>
        </div>
      ) : <p>Loading problem…</p>}

      <Editor height="45vh" defaultLanguage="python"
        value={code} onChange={(v)=>setCode(v||"")}
        options={{ fontSize: 14, minimap: { enabled: false } }}
      />

      <div style={{ display:"flex", gap:12, margin:"12px 0" }}>
        <button onClick={()=>run("public")} disabled={loading}>▶ Run sample</button>
        <button onClick={()=>run("all")} disabled={loading}>✅ Submit</button>
        {loading && <span>Running…</span>}
      </div>

      {err && <pre style={{ color: "crimson" }}>{err}</pre>}

      {result && (
        <div style={{ marginTop: 12 }}>
          <h3>Verdict: {result.verdict}</h3>
          {result.results.map((t) => (
            <div key={t.test_index} style={{ border:"1px solid #ccc", padding:8, marginTop:8 }}>
              <b>Test #{t.test_index}</b> — Status: {t.status}
              <details>
                <summary>Show details</summary>
                <p><b>Expected</b>:</p><pre>{t.expected}</pre>
                <p><b>Your Output</b>:</p><pre>{t.stdout}</pre>
                {t.stderr && (<><p><b>stderr</b>:</p><pre>{t.stderr}</pre></>)}
              </details>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
