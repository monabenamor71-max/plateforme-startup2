"use client";

import { useState } from "react";
import Link from "next/link";
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const BASE = "http://localhost:3001";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.message || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg,#0A2540,#0f3460)",
      padding: "20px"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 24,
        padding: "48px 40px",
        maxWidth: 480,
        width: "100%",
        boxShadow: "0 24px 60px rgba(0,0,0,.2)"
      }}>
        <Link href="/connexion" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#64748B", textDecoration: "none", marginBottom: 24 }}>
          <FaArrowLeft size={12} /> Retour
        </Link>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#10B981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px"
            }}>
              <FaCheckCircle size={32} color="#fff" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0A2540", marginBottom: 12 }}>
              Email envoyé !
            </h2>
            <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.<br />
              Vérifiez votre boîte de réception (et vos spams).
            </p>
            <Link href="/connexion">
              <button style={{
                background: "#F7B500",
                color: "#0A2540",
                border: "none",
                borderRadius: 10,
                padding: "12px 24px",
                fontWeight: 700,
                cursor: "pointer",
                width: "100%"
              }}>
                Retour à la connexion
              </button>
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0A2540", marginBottom: 8 }}>
              Mot de passe oublié ?
            </h2>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            {error && (
              <div style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 20,
                color: "#DC2626",
                fontSize: 13
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#334155", display: "block", marginBottom: 8 }}>
                  Adresse email
                </label>
                <div style={{ position: "relative" }}>
                  <FaEnvelope style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 42px",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: 10,
                      fontSize: 14,
                      outline: "none",
                      fontFamily: "inherit"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#F7B500"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#E2E8F0"}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: "#0A2540",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "14px",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  transition: "all .2s"
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#F7B500";
                    e.currentTarget.style.color = "#0A2540";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#0A2540";
                  e.currentTarget.style.color = "#fff";
                }}
              >
                {loading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
              </button>
            </form>

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <Link href="/connexion" style={{ color: "#F7B500", fontSize: 13, textDecoration: "none" }}>
                Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}