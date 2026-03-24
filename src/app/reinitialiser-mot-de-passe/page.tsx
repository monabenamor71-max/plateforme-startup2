"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ReinitialiserMotDePasse() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/connexion"), 3000);
      } else {
        const data = await response.json();
        setError(data.message || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "#F2F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "20px", textAlign: "center" }}>
          <h2>Lien invalide</h2>
          <p>Le lien de réinitialisation est invalide ou a expiré.</p>
          <Link href="/mot-de-passe-oublie">Demander un nouveau lien</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F2F5F9", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "420px", width: "100%", background: "white", borderRadius: "20px", padding: "44px 40px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Nouveau mot de passe</h1>
        
        {success ? (
          <div>
            <p>Mot de passe modifié avec succès !</p>
            <Link href="/connexion">Se connecter</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "12px", marginBottom: "16px", border: "1px solid #ccc", borderRadius: "8px" }}
            />
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "12px", marginBottom: "16px", border: "1px solid #ccc", borderRadius: "8px" }}
            />
            {error && <p style={{ color: "red", marginBottom: "16px" }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: "#F7B500", border: "none", borderRadius: "8px", fontWeight: "bold" }}>
              {loading ? "Chargement..." : "Réinitialiser"}
            </button>
            <Link href="/connexion" style={{ display: "block", textAlign: "center", marginTop: "16px", color: "#F7B500" }}>
              Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}