"use client";
import { useState } from "react";
import Link from "next/link";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F2F5F9", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ maxWidth: "420px", width: "100%", background: "#fff", borderRadius: "20px", padding: "44px 40px", boxShadow: "0 4px 32px rgba(10,37,64,.07)", border: "1px solid #DDE4EF" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "11px", marginBottom: "32px" }}>
          <div style={{ width: 40, height: 40, background: "#0A2540", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#F7B500" }}>
            BEH
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#0A2540" }}>
            Business <span style={{ color: "#F7B500" }}>Expert</span> Hub
          </span>
        </div>

        <div style={{ height: 1, background: "#EDF1F7", marginBottom: 28 }} />

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0A2540", marginBottom: 6 }}>Mot de passe oublié</h1>
        <p style={{ fontSize: 13, color: "#8A9AB5", marginBottom: 28 }}>
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A2540", marginBottom: 8 }}>Email envoyé !</h2>
            <p style={{ fontSize: 13, color: "#8A9AB5", marginBottom: 24 }}>
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
            </p>
            <Link href="/connexion" style={{ color: "#F7B500", fontWeight: 600, textDecoration: "none" }}>
              ← Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#7D8FAA", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 7 }}>
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  background: "#F7F9FC",
                  border: "1.5px solid #DDE4EF",
                  borderRadius: 11,
                  padding: "13px 16px",
                  fontSize: 14,
                  color: "#0A2540",
                  outline: "none"
                }}
                placeholder="votre@email.com"
              />
            </div>

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderLeft: "3px solid #EF4444", borderRadius: 10, padding: "11px 14px", fontSize: 13, color: "#DC2626", marginBottom: 18 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#94A3B8" : "#0A2540",
                color: "#fff",
                border: "none",
                borderRadius: 11,
                padding: "14px",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                marginBottom: 22
              }}
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
            </button>

            <div style={{ textAlign: "center" }}>
              <Link href="/connexion" style={{ fontSize: 12, color: "#8A9AB5", textDecoration: "none" }}>
                ← Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}