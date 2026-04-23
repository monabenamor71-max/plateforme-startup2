"use client";

import { useState } from "react";
import Link from "next/link";
import { getCsrfToken } from "@/lib/csrf";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDebug("Envoi de la requête...");

    const csrfToken = getCsrfToken();

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken || "",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setDebug(`Réponse reçue (status ${res.status})`);

      if (!res.ok) {
        throw new Error(data.message || "Erreur de connexion");
      }

      // ✅ Correction : utiliser la bonne clé 'access_token'
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user?.role;
      setDebug(`Rôle détecté : ${role}`);

      if (role === "admin") window.location.href = "/dashboard/admin";
      else if (role === "expert") window.location.href = "/dashboard/expert";
      else if (role === "startup") window.location.href = "/dashboard/startup";
      else window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
      setDebug(`Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#0A2540] rounded-xl flex items-center justify-center text-xs font-black text-[#F7B500]">
            BEH
          </div>
          <span className="text-base font-bold text-[#0A2540]">
            Business <span className="text-[#F7B500]">Expert</span> Hub
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-[#0A2540] mb-1">Se connecter</h1>
        <p className="text-sm text-gray-500 mb-6">Accédez à votre espace BEH</p>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        {debug && (
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-3 rounded-md mb-4 text-xs">
            {debug}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F7B500] focus:ring-1 focus:ring-[#F7B500]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#F7B500] focus:ring-1 focus:ring-[#F7B500]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link href="/mot-de-passe-oublie" className="text-xs text-gray-500 hover:text-[#F7B500]">
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A2540] text-white font-bold py-2.5 rounded-lg hover:bg-[#F7B500] hover:text-[#0A2540] transition disabled:opacity-50"
          >
            {loading ? "Connexion en cours..." : "Se connecter →"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas de compte ?{" "}
          <Link href="/inscription" className="text-[#F7B500] font-bold">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}