"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = () => {
    setError("");

    if (!firstName || !lastName || !email || !password || !birthDate) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push("/login");
    }, 1000);
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
          maxWidth: "440px",
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
          Register
        </h1>

        <p
          style={{
            margin: 0,
            textAlign: "center",
            color: "#b9c7d6",
            fontSize: "14px",
          }}
        >
          Create your account to continue
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ color: "#dce8f5", fontSize: "14px" }}>
            First Name
          </label>
          <input
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
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
          <label style={{ color: "#dce8f5", fontSize: "14px" }}>
            Last Name
          </label>
          <input
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ color: "#dce8f5", fontSize: "14px" }}>
            Birth Date
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
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
          onClick={handleRegister}
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
          {loading ? "Registering..." : "Register"}
        </button>

        <p
          style={{
            color: "#b9c7d6",
            fontSize: "14px",
            textAlign: "center",
            margin: 0,
          }}
        >
          Already have an account?{" "}
          <span
            style={{
              color: "#6ed6ff",
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: 500,
            }}
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </main>
  );
}