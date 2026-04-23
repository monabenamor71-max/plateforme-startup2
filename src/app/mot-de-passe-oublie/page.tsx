"use client";

import { useState } from "react";
import Link from "next/link";
import { getCsrfToken } from "@/lib/csrf";

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

    const csrfToken = getCsrfToken();

    try {
      const res = await fetch(`${BASE}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken || "",
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setError(data.message || "Une erreur est survenue");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] to-[#0f3460] flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <Link href="/connexion" className="inline-flex items-center gap-2 text-gray-500 text-sm mb-6 hover:text-[#F7B500]">
          ← Retour
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-white text-2xl">✉️</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0A2540] mb-2">Code envoyé !</h2>
            <p className="text-gray-500 text-sm mb-6">
              Un code de réinitialisation à 6 chiffres a été envoyé à <strong>{email}</strong>.<br />
              Vérifiez votre boîte (et les spams).<br />
              Le code expire dans 15 minutes.
            </p>
            <Link href={`/verifier-code?email=${encodeURIComponent(email)}`}>
              <button className="w-full bg-[#F7B500] text-[#0A2540] font-bold py-2.5 rounded-lg hover:bg-[#e6a800] transition">
                Saisir le code
              </button>
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-[#0A2540] mb-1">Mot de passe oublié ?</h2>
            <p className="text-gray-500 text-sm mb-6">
              Entrez votre adresse email. Nous vous enverrons un code de réinitialisation.
            </p>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                  <input
                    type="email"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#F7B500]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0A2540] text-white font-bold py-2.5 rounded-lg hover:bg-[#F7B500] hover:text-[#0A2540] transition disabled:opacity-50"
              >
                {loading ? "Envoi en cours..." : "Envoyer le code"}
              </button>
            </form>

            <div className="text-center mt-6">
              <Link href="/connexion" className="text-[#F7B500] text-sm">
                Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}