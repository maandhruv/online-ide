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
def solve():
    #your code here

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

  const getStatusColor = (status: string) => {
    switch(status) {
      case "PASSED": return "#4ade80";
      case "FAILED": return "#ef4444";
      default: return "#f59e0b";
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch(verdict) {
      case "Accepted": return "#4ade80";
      case "Wrong Answer": return "#ef4444";
      default: return "#f59e0b";
    }
  };

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#e4e4e4',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem'
    }}>
      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        paddingBottom: '2rem'
      }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ 
            fontSize: '2.25rem', 
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem'
          }}>{problem?.title || "Loading…"}</h1>
          
          {problem ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                background: '#111',
                border: '1px solid #222',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>{problem.statement}</p>
                <div style={{
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #222',
                  color: '#888',
                  fontSize: '0.875rem'
                }}>
                  <strong style={{ color: '#aaa' }}>Constraints:</strong> {problem.constraints}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#111',
              borderRadius: '0.5rem',
              animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
              <p>Loading problem details...</p>
            </div>
          )}
        </header>

        <div style={{
          background: '#111',
          border: '1px solid #222',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>
          <Editor 
            height="50vh" 
            defaultLanguage="python"
            theme="vs-dark"
            value={code} 
            onChange={(v) => setCode(v || "")}
            options={{ 
              fontSize: 14, 
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16 }
            }}
          />
        </div>

        <div style={{ 
          display: "flex", 
          gap: 12, 
          margin: "1rem 0",
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <button 
            onClick={() => run("public")}
            disabled={loading}
            style={{
              backgroundColor: '#2d3748',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.375rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '1rem' }}>▶</span> Run sample
          </button>
          
          <button 
            onClick={() => run("all")}
            disabled={loading}
            style={{
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.375rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ fontSize: '1rem' }}>✓</span> Submit
          </button>
          
          {loading && (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              color: '#a0a0a0',
              fontSize: '0.875rem'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #a0a0a0',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                marginRight: '0.5rem',
                animation: 'spin 1s linear infinite'
              }}></div>
              Running...
            </div>
          )}
        </div>

        {err && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'rgba(220, 38, 38, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '0.375rem',
            marginBottom: '1rem'
          }}>
            <pre style={{ 
              color: '#f87171', 
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontSize: '0.875rem'
            }}>{err}</pre>
          </div>
        )}

        {result && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600',
                color: 'white',
                margin: 0
              }}>Verdict:</h3>
              <span style={{ 
                color: getVerdictColor(result.verdict),
                fontWeight: '600'
              }}>{result.verdict}</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {result.results.map((t) => (
                <div 
                  key={t.test_index} 
                  style={{ 
                    border: `1px solid ${t.status === 'PASSED' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    borderRadius: '0.5rem',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderBottom: t.status === 'PASSED' ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: t.status === 'PASSED' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                  }}>
                    <div>
                      <b style={{ color: 'white' }}>Test #{t.test_index}</b>
                    </div>
                    <div style={{
                      color: getStatusColor(t.status),
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}>{t.status}</div>
                  </div>

                  <details style={{ background: '#151515' }}>
                    <summary style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      color: '#a0a0a0',
                      fontSize: '0.875rem',
                      userSelect: 'none'
                    }}>
                      Show details
                    </summary>
                    <div style={{ padding: '0 1rem 1rem' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ color: '#a0a0a0', margin: '0 0 0.25rem', fontSize: '0.75rem' }}>EXPECTED:</p>
                        <pre style={{ 
                          margin: 0, 
                          backgroundColor: '#1a1a1a', 
                          padding: '0.75rem',
                          borderRadius: '0.25rem',
                          overflow: 'auto',
                          fontSize: '0.875rem'
                        }}>{t.expected}</pre>
                      </div>
                      
                      <div style={{ marginBottom: t.stderr ? '1rem' : 0 }}>
                        <p style={{ color: '#a0a0a0', margin: '0 0 0.25rem', fontSize: '0.75rem' }}>YOUR OUTPUT:</p>
                        <pre style={{ 
                          margin: 0, 
                          backgroundColor: '#1a1a1a', 
                          padding: '0.75rem',
                          borderRadius: '0.25rem',
                          overflow: 'auto',
                          fontSize: '0.875rem'
                        }}>{t.stdout}</pre>
                      </div>
                      
                      {t.stderr && (
                        <div>
                          <p style={{ color: '#f87171', margin: '0 0 0.25rem', fontSize: '0.75rem' }}>STDERR:</p>
                          <pre style={{ 
                            margin: 0, 
                            backgroundColor: '#1a1a1a', 
                            padding: '0.75rem',
                            borderRadius: '0.25rem',
                            overflow: 'auto',
                            fontSize: '0.875rem',
                            color: '#f87171'
                          }}>{t.stderr}</pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #0a0a0a;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}