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

    const isoBirthDate = new Date(birthDate).toISOString();
    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Birth Date ISO:", isoBirthDate);

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
        backgroundColor: "#0f0f0f",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
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
          Register
        </h1>

        <p
          style={{
            margin: 0,
            textAlign: "center",
            color: "#b3b3b3",
            fontSize: "14px",
          }}
        >
          Create your account to continue
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ color: "white", fontSize: "14px" }}>First Name</label>
          <input
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
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
          <label style={{ color: "white", fontSize: "14px" }}>Last Name</label>
          <input
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ color: "white", fontSize: "14px" }}>Birth Date</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
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
          onClick={handleRegister}
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
          {loading ? "Registering..." : "Register"}
        </button>
        <p style={{ color: "#b3b3b3", fontSize: "14px", textAlign: "center" }}>
  Already have an account?{" "}
  <span
    style={{ color: "white", cursor: "pointer", textDecoration: "underline" }}
    onClick={() => router.push("/login")}
  >
    Login
  </span>
</p>
      </div>
    </main>
  );
}