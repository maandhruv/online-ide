"use client";
import React from "react";
import Link from "next/link";
import { listProblems } from "../api-client";

export default function ProblemsPage() {
  const [items, setItems] = React.useState<{id:string; title:string}[]>([]);
  const [err, setErr] = React.useState<string|null>(null);

  React.useEffect(() => {
    listProblems().then(res => setItems(res.items)).catch(e => setErr(String(e)));
  }, []);

  return (
    <main style={{ maxWidth: 800, margin: "20px auto", padding: 16 }}>
      <h1>Problems</h1>
      {err && <p style={{color:"crimson"}}>{err}</p>}
      <ul>
        {items.map(p => (
          <li key={p.id} style={{margin:"8px 0"}}>
            <Link href={`/problems/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
