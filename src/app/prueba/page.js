"use client";

import { useState } from "react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", email, password }),
    });

    // const data = await response.json();
    // setMessage(data.message);
    console.log(response);
  };

  const handleLogin = async () => {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      setToken(data.token);
    }
    setMessage(data.message);
  };

  const handleLogout = () => {
    setToken(null);
    setMessage("Cierre de sesión exitoso");
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "1rem" }}>
      <h1>Autenticación</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (token) handleLogout();
        }}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Email:</label>
          <input
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>Contraseña:</label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {!token ? (
            <>
              <button
                type='button'
                onClick={handleRegister}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#0070f3",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}>
                Registrar
              </button>
              <button
                type='button'
                onClick={handleLogin}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#0070f3",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}>
                Iniciar Sesión
              </button>
            </>
          ) : (
            <button
              type='submit'
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#f00",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}>
              Cerrar Sesión
            </button>
          )}
        </div>
      </form>
      {message && (
        <p style={{ marginTop: "1rem", color: token ? "green" : "red" }}>
          {message}
        </p>
      )}
      {token && (
        <div style={{ marginTop: "1rem", wordWrap: "break-word" }}>
          <strong>Token:</strong>
          <p>{token}</p>
        </div>
      )}
    </div>
  );
}
