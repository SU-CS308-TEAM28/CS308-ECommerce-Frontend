"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const responseText = await response.text();

      let data: any = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: responseText };
      }

      if (response.ok) {
        if (data.data.user) {
          login(data.data.user);
        }

        const redirectPath = searchParams.get("redirect");

        if (redirectPath) {
          router.push(redirectPath);
        } else {
          router.push("/");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Could not connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #061826 0%, #0a2340 45%, #0b2f5b 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "rgba(10, 18, 30, 0.92)",
          padding: "40px 30px",
          borderRadius: "18px",
          boxShadow: "0 10px 35px rgba(0, 0, 0, 0.35)",
          border: "1px solid rgba(45, 170, 225, 0.25)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "8px",
          }}
        >
          <img
            src="/MainLogo.png"
            alt="TeknoCS Logo"
            style={{
              width: "190px",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>

        <h1
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "30px",
            fontWeight: "bold",
            color: "#ffffff",
          }}
        >
          Login
        </h1>

        <p
          style={{
            margin: 0,
            textAlign: "center",
            color: "#b9c7d6",
            fontSize: "14px",
          }}
        >
          Enter your email and password to continue
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ color: "#dce8f5", fontSize: "14px" }}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #2DAAE1",
              backgroundColor: "#10243a",
              color: "white",
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ color: "#dce8f5", fontSize: "14px" }}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #2DAAE1",
              backgroundColor: "#10243a",
              color: "white",
              outline: "none",
            }}
          />
        </div>

        {error && (
          <p
            style={{
              color: "#ff6b6b",
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
            borderRadius: "10px",
            border: "none",
            backgroundColor: loading ? "#5d7f92" : "#2DAAE1",
            color: "#ffffff",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "0.2s",
            marginTop: "4px",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p
          style={{
            color: "#b9c7d6",
            fontSize: "14px",
            textAlign: "center",
            margin: 0,
          }}
        >
          Don’t have an account?{" "}
          <span
            style={{
              color: "#6ed6ff",
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: 500,
            }}
            onClick={() => router.push("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </main>
  );
}