import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav style={{
      backgroundColor: "#0a0a0a",
      borderBottom: "1px solid #222",
      padding: "0.75rem 1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <div style={{
            color: "#4f46e5",
            marginRight: "0.5rem",
            fontSize: "1.75rem",
          }}>
            &lt;/&gt;
          </div>
          <h1 style={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            margin: 0,
            color: "white",
          }}>InterviewKit</h1>
        </Link>
      </div>
      
      <Link 
        href="/problems"
        style={{
          backgroundColor: "#4f46e5",
          color: "white",
          padding: "0.5rem 1rem",
          borderRadius: "0.375rem",
          textDecoration: "none",
          transition: "background-color 0.2s",
        }}
      >
        Practice Problems
      </Link>
    </nav>
  );
}