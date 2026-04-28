"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError("");
    const url = `https://playly-backend-production.up.railway.app/auth/${mode}`;
    const body =
      mode === "register" ? { name, email, password } : { email, password };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/");
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#060810;font-family:'DM Sans',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center}
        .wrap{width:100%;max-width:400px;padding:24px}
        .logo{font-family:'Bebas Neue',sans-serif;font-size:48px;background:linear-gradient(135deg,#00D4FF,#00E599);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:8px}
        .subtitle{color:#4A6070;font-size:14px;letter-spacing:2px;text-transform:uppercase;margin-bottom:40px}
        .tabs{display:flex;gap:4px;background:#0E1318;border-radius:12px;padding:4px;margin-bottom:32px}
        .tab{flex:1;padding:10px;border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;background:transparent;color:#4A6070}
        .tab.active{background:#1C2730;color:#F0F4F8}
        .field{margin-bottom:16px}
        .label{font-size:12px;color:#4A6070;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px}
        .input{width:100%;background:#0E1318;border:1px solid #1C2730;border-radius:10px;padding:14px 16px;color:#F0F4F8;font-family:'DM Sans',sans-serif;font-size:15px;outline:none}
        .error{background:#FF3B3B11;border:1px solid #FF3B3B33;border-radius:10px;padding:12px 16px;color:#FF6B6B;font-size:13px;margin-bottom:16px}
        .btn{width:100%;background:linear-gradient(135deg,#00D4FF,#00E599);border:none;border-radius:10px;padding:16px;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;color:#060810;cursor:pointer;margin-top:8px}
        .back{display:block;text-align:center;margin-top:20px;color:#2A3A48;font-size:13px;cursor:pointer}
      `}</style>
      <div className="wrap">
        <div className="logo">Playly</div>
        <div className="subtitle">NYC Sports Platform</div>
        <div className="tabs">
          <button
            className={`tab ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Sign In
          </button>
          <button
            className={`tab ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            Sign Up
          </button>
        </div>
        {mode === "register" && (
          <div className="field">
            <div className="label">Name</div>
            <input
              className="input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}
        <div className="field">
          <div className="label">Email</div>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <div className="label">Password</div>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn" onClick={submit} disabled={loading}>
          {loading
            ? "Loading..."
            : mode === "login"
              ? "Sign In →"
              : "Create Account →"}
        </button>
        <span className="back" onClick={() => router.push("/")}>
          ← Back to games
        </span>
      </div>
    </>
  );
}
