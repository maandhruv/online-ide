"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#0a0a0a",
      color: "white",
      margin: 0,
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Hero section */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 1rem",
        maxWidth: "72rem",
        margin: "0 auto",
        textAlign: "center",
      }}>
        <h1 style={{
          fontSize: "3rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
          background: "linear-gradient(to right, #4f46e5, #9f7aea)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          color: "transparent",
        }}>
          Master Coding Interviews
        </h1>
        
        <p style={{
          fontSize: "1.25rem",
          color: "#d1d5db",
          marginBottom: "2.5rem",
          maxWidth: "48rem",
        }}>
          Practice data structures and algorithms with our curated collection of interview problems. 
          Code, run, and debug in our online IDE.
        </p>
        
        <div style={{
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          <button 
            onClick={() => router.push("/problems")}
            style={{
              backgroundColor: "#4f46e5",
              color: "white",
              padding: "0.75rem 2rem",
              borderRadius: "0.375rem",
              fontSize: "1.125rem",
              fontWeight: "500",
              border: "none",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#4338ca"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4f46e5"}
          >
            Start Practicing
          </button>
          
          <button 
            style={{
              backgroundColor: "transparent",
              color: "#4f46e5",
              padding: "0.75rem 2rem",
              borderRadius: "0.375rem",
              fontSize: "1.125rem",
              fontWeight: "500",
              border: "1px solid #4f46e5",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(79, 70, 229, 0.1)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            Learn More
          </button>
        </div>
      </div>
      
      {/* Features section */}
      <div style={{
        padding: "4rem 1rem",
        backgroundColor: "#111",
      }}>
        <div style={{
          maxWidth: "72rem",
          margin: "0 auto",
        }}>
          <h2 style={{
            fontSize: "2.25rem",
            fontWeight: "bold",
            marginBottom: "3rem",
            textAlign: "center",
          }}>Why Choose InterviewKit?</h2>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
          }}>
            {/* Feature 1 */}
            <div style={{
              backgroundColor: "#0a0a0a",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #222",
            }}>
              <div style={{
                color: "#4f46e5",
                fontSize: "2rem",
                marginBottom: "1rem",
              }}>📚</div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}>Curated Problems</h3>
              <p style={{
                color: "#9ca3af",
              }}>Carefully selected problems that cover all common interview patterns and topics.</p>
            </div>
            
            {/* Feature 2 */}
            <div style={{
              backgroundColor: "#0a0a0a",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #222",
            }}>
              <div style={{
                color: "#4f46e5",
                fontSize: "2rem",
                marginBottom: "1rem",
              }}>⚡</div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}>Interactive IDE</h3>
              <p style={{
                color: "#9ca3af",
              }}>Code and test your solutions with our built-in development environment.</p>
            </div>
            
            {/* Feature 3 */}
            <div style={{
              backgroundColor: "#0a0a0a",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #222",
            }}>
              <div style={{
                color: "#4f46e5",
                fontSize: "2rem",
                marginBottom: "1rem",
              }}>🚀</div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
              }}>Learn by Doing</h3>
              <p style={{
                color: "#9ca3af",
              }}>Get immediate feedback and detailed explanations for each problem.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer style={{
        backgroundColor: "#0a0a0a",
        borderTop: "1px solid #222",
        padding: "2rem 1rem",
      }}>
        <div style={{
          maxWidth: "72rem",
          margin: "0 auto",
          textAlign: "center",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
          }}>
            <div style={{
              color: "#4f46e5",
              marginRight: "0.5rem",
              fontSize: "1.25rem",
            }}>
              &lt;/&gt;
            </div>
            <h2 style={{
              fontSize: "1.125rem",
              fontWeight: "bold",
              margin: 0,
            }}>InterviewKit</h2>
          </div>
          <p style={{
            color: "#6b7280",
            fontSize: "0.875rem",
          }}>
            &copy; {new Date().getFullYear()} InterviewKit. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #0a0a0a;
        }
      `}</style>
    </div>
  );
}