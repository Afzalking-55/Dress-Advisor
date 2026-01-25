"use client";

import { useState } from "react";

export default function TestAnalyzePage() {
  const [uid, setUid] = useState("");
  const [itemId, setItemId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function testAnalyze() {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/analyze-deterministic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, itemId, imageUrl }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Test Analyze API</h1>

      <div style={{ marginTop: 20 }}>
        <input
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          placeholder="uid"
          style={{ padding: 10, width: "100%", marginBottom: 10 }}
        />
        <input
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          placeholder="itemId"
          style={{ padding: 10, width: "100%", marginBottom: 10 }}
        />
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="imageUrl"
          style={{ padding: 10, width: "100%", marginBottom: 10 }}
        />

        <button
          onClick={testAnalyze}
          disabled={loading}
          style={{
            padding: 12,
            width: "100%",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Testing..." : "Test Analyze"}
        </button>
      </div>

      {result && (
        <pre style={{ marginTop: 20, background: "#111", color: "#0f0", padding: 12 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
