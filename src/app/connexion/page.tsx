"use client";

import { useState } from "react";
import Link from "next/link";

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

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setDebug(`Réponse reçue (status ${res.status})`);

      if (!res.ok) {
        throw new Error(data.message || "Erreur de connexion");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user?.role;
      setDebug(`Rôle détecté : ${role}`);

      // Redirection selon le rôle
      if (role === "admin") {
        window.location.href = "/dashboard/admin";
      } else if (role === "expert") {
        window.location.href = "/dashboard/expert";
      } else if (role === "startup") {
        window.location.href = "/dashboard/startup";
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message);
      setDebug(`Erreur : ${err.message}`);
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Outfit',sans-serif;}
        .pg{min-height:100vh;background:linear-gradient(135deg,#F0F4F8,#E8EEF6);display:flex;align-items:center;justify-content:center;padding:40px 24px;}
        .card{background:#fff;border:1px solid #DDE4EF;border-radius:24px;padding:44px;width:100%;max-width:480px;box-shadow:0 8px 40px rgba(10,37,64,.1);}
        .logo-row{display:flex;align-items:center;gap:12px;margin-bottom:28px;}
        .logo-box{width:42px;height:42px;background:#0A2540;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#F7B500;}
        .title{font-size:24px;font-weight:800;color:#0A2540;margin-bottom:6px;}
        .subtitle{font-size:13.5px;color:#8A9AB5;margin-bottom:28px;}
        .lbl{font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px;}
        .password-wrapper{position:relative;margin-bottom:16px;}
        .inp{width:100%;background:#F7F9FC;border:1.5px solid #DDE4EF;border-radius:11px;padding:12px 48px 12px 16px;font-family:'Outfit',sans-serif;font-size:14px;color:#0A2540;outline:none;transition:border-color .2s,box-shadow .2s;}
        .inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.12);}
        .toggle-pwd{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;color:#8A9AB5;transition:opacity 0.2s;}
        .toggle-pwd:hover{opacity:0.7;}
        .toggle-pwd svg{width:20px;height:20px;stroke:currentColor;stroke-width:1.5;fill:none;}
        .err{background:#FEF2F2;border:1px solid #FECACA;border-left:4px solid #EF4444;border-radius:12px;padding:13px 16px;font-size:13px;color:#DC2626;margin-bottom:20px;}
        .debug{background:#EFF6FF;border:1px solid #93C5FD;border-left:4px solid #3B82F6;border-radius:12px;padding:10px 14px;font-size:12px;color:#1E40AF;margin-bottom:16px;}
        .btn{width:100%;background:#0A2540;color:#fff;border:none;border-radius:12px;padding:15px;font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;}
        .btn:hover:not(:disabled){background:#F7B500;color:#0A2540;}
        .btn:disabled{opacity:.55;cursor:not-allowed;}
        .forgot-link{display:block;text-align:right;margin-top:-8px;margin-bottom:20px;}
        .forgot-link a{font-size:12px;color:#8A9AB5;text-decoration:none;transition:color .2s;}
        .forgot-link a:hover{color:#F7B500;}
        .row{text-align:center;margin-top:20px;font-size:13.5px;color:#8A9AB5;}
        .row a{color:#F7B500;font-weight:700;text-decoration:none;}
      `}</style>

      <div className="pg">
        <div className="card">
          <div className="logo-row">
            <div className="logo-box">BEH</div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#0A2540" }}>
              Business <span style={{ color: "#F7B500" }}>Expert</span> Hub
            </span>
          </div>

          <div className="title">Se connecter</div>
          <div className="subtitle">Accédez à votre espace BEH</div>

          {error && <div className="err">{error}</div>}
          {debug && <div className="debug">{debug}</div>}

          <form onSubmit={handleSubmit}>
            <label className="lbl">Email</label>
            <input
              className="inp"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nom@email.com"
              required
              autoComplete="email"
              style={{ paddingRight: "16px" }}
            />

            <label className="lbl">Mot de passe</label>
            <div className="password-wrapper">
              <input
                className="inp"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-pwd"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? (
                  // Œil barré (masquer)
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2L22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M6.71277 6.7226C4.03899 8.29876 2 11 2 12C2 12 5 18 12 18C13.5397 18 14.8975 17.644 16.0537 17.052M9.88447 9.87586C9.3279 10.4043 9 11.1525 9 12C9 13.6569 10.3431 15 12 15C12.8509 15 13.6023 14.6686 14.1315 14.108M21 12C21 12 18 6 12 6C11.2945 6 10.6347 6.10273 10 6.28481" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M17.5 6.5L20 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M15 15L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  // Œil ouvert (afficher)
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                )}
              </button>
            </div>

            <div className="forgot-link">
              <Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter →"}
            </button>
          </form>

          <div className="row">
            Pas de compte ?{" "}
            <Link href="/inscription">S'inscrire</Link>
          </div>
        </div>
      </div>
    </>
  );
}