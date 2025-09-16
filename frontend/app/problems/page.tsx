"use client";
import React from "react";
import Link from "next/link";
import { listProblems } from "../api-client";

export default function ProblemsPage() {
  const [items, setItems] = React.useState<{id:string; title:string; difficulty?: string}[]>([]);
  const [err, setErr] = React.useState<string|null>(null);

  React.useEffect(() => {
    listProblems().then(res => setItems(res.items)).catch(e => setErr(String(e)));
  }, []);

  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#e4e4e4',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <header style={{
          marginBottom: '1.5rem',
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.75rem'
          }}>Practice Problems</h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#a0a0a0',
            marginBottom: '2.5rem'
          }}>Master data structures and algorithms with our curated collection of coding challenges.</p>
        </header>
        
        {err && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: 'rgba(220, 38, 38, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '0.375rem'
          }}>
            <p style={{ color: '#f87171' }}>{err}</p>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {items.map(p => (
            <div 
              key={p.id} 
              style={{
                borderRadius: '1rem',
                border: '1px solid #222',
                overflow: 'hidden',
                background: '#111',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              className="problem-card"
            >
              <Link 
                href={`/problems/${p.id}`}
                style={{
                  display: 'block',
                  padding: '1.5rem',
                  textDecoration: 'none',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: 'white',
                      marginBottom: '0.5rem'
                    }}>{p.title}</h2>
                    <div style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <span style={{
                        backgroundColor: '#783f04',
                        color: '#ffb366',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '2rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}>Medium</span>
                      <span style={{
                        color: '#666',
                        fontSize: '0.875rem',
                      }}>Problem #{p.id}</span>
                    </div>
                  </div>
                  <div style={{
                    color: '#666',
                    fontSize: '1.5rem',
                  }}>›</div>
                </div>
                <p style={{
                  color: '#999',
                  fontSize: '1rem',
                  marginTop: '1.5rem'
                }}>Practice your problem-solving skills with this medium level challenge.</p>
                <div style={{
                  marginTop: '2rem'
                }}>
                  <button style={{
                    backgroundColor: '#4f46e5', // Updated to match landing page button color
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.75rem 0',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background-color 0.2s ease'
                  }}>Start Solving</button>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        {items.length === 0 && !err && (
          <div style={{
            height: '10rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              color: '#a1a1aa',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>Loading problems...</div>
          </div>
        )}
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #0a0a0a;
        }

        .problem-card:hover {
          transform: translateY(-3px);
          border-color: #333;
        }
        
        .problem-card button:hover {
          background-color: #4338ca;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
}