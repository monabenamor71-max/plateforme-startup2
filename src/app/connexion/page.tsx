"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Connexion() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
    const res = await fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erreur de connexion");

    // 🔧 FORCER LE RÔLE ADMIN POUR CET EMAIL (à retirer après correction BDD)
    if (email === "admin@gmail.com") {
      data.user.role = "admin";
    }

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirection
    const role = data.user?.role;
    if (role === "admin") {
      window.location.href = "/dashboard/admin";
    } else {
      const routes: Record<string, string> = {
        admin: "/dashboard/admin",
        expert: "/dashboard/expert",
        startup: "/dashboard/startup",
        client: "/dashboard/client",
      };
      window.location.href = routes[role] ?? "/";
    }
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
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
        .inp{width:100%;background:#F7F9FC;border:1.5px solid #DDE4EF;border-radius:11px;padding:12px 16px;font-family:'Outfit',sans-serif;font-size:14px;color:#0A2540;outline:none;margin-bottom:16px;transition:border-color .2s,box-shadow .2s;}
        .inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.12);}
        .err{background:#FEF2F2;border:1px solid #FECACA;border-left:4px solid #EF4444;border-radius:12px;padding:13px 16px;font-size:13px;color:#DC2626;margin-bottom:20px;}
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
            />

            <label className="lbl">Mot de passe</label>
            <input
              className="inp"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <div className="forgot-link">
              <Link href="/forgot-password">Mot de passe oublié ?</Link>
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Connexion en cours..." : "Se connecter →"}
            </button>
          </form>

          <div className="row">
            Pas de compte ?{" "}
            <Link href="/inscription">{"S'inscrire"}</Link>
          </div>
        </div>
      </div>
    </>
  );
}