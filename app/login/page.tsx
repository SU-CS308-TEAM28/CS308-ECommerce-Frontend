"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = () => {
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    const redirectPath = searchParams.get("redirect");

    setTimeout(() => {
      setLoading(false);

      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push("/");
      }
    }, 1000);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f0f0f",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#1a1a1a",
          padding: "40px 30px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <h1
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "32px",
            fontWeight: "bold",
            color: "white",
          }}
        >
          Login
        </h1>

        <p
          style={{
            margin: 0,
            textAlign: "center",
            color: "#b3b3b3",
            fontSize: "14px",
          }}
        >
          Enter your email and password to continue
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ color: "white", fontSize: "14px" }}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #333",
              backgroundColor: "#262626",
              color: "white",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ color: "white", fontSize: "14px" }}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #333",
              backgroundColor: "#262626",
              color: "white",
              outline: "none",
            }}
          />
        </div>

        {error && (
          <p
            style={{
              color: "#ff4d4f",
              margin: 0,
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          style={{
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: loading ? "#666" : "#ffffff",
            color: "#000000",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "0.2s",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p style={{ color: "#b3b3b3", fontSize: "14px", textAlign: "center" }}>
  Don’t have an account?{" "}
  <span
    style={{ color: "white", cursor: "pointer", textDecoration: "underline" }}
    onClick={() => router.push("/register")}
  >
    Register
  </span>
</p>
      </div>
    </main>
  );
}