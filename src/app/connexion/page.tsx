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
  const [showPass, setShowPass] = useState(false);

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
      if (!res.ok) throw new Error(data.message || "Email ou mot de passe incorrect");
      if (data.access_token && data.user) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        const routes: Record<string, string> = {
          startup: "/dashboard/startup",
          expert: "/dashboard/expert",
          admin: "/dashboard/admin",
        };
        router.push(routes[data.user.role] || "/");
      } else {
        throw new Error("Réponse invalide du serveur");
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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pg {
          min-height: 100vh;
          background: #F2F5F9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'Outfit', sans-serif;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 24px;
          padding: 9px 18px;
          border-radius: 8px;
          background: #0A2540;
          border: none;
          transition: all .2s;
        }
        .back-btn:hover {
          background: #F7B500;
          color: #0A2540;
          transform: translateX(-2px);
        }

        .card {
          background: #fff;
          border: 1px solid #DDE4EF;
          border-radius: 20px;
          padding: 44px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 4px 32px rgba(10,37,64,.07);
        }

        .logo-row {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 32px;
        }
        .logo-box {
          width: 40px; height: 40px;
          background: #0A2540;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #F7B500;
          letter-spacing: .3px;
          flex-shrink: 0;
        }
        .logo-name {
          font-size: 15px;
          font-weight: 700;
          color: #0A2540;
        }
        .logo-name span { color: #F7B500; }

        .divider { height: 1px; background: #EDF1F7; margin-bottom: 28px; }

        .title {
          font-size: 22px;
          font-weight: 700;
          color: #0A2540;
          margin-bottom: 6px;
        }
        .subtitle {
          font-size: 13px;
          color: #8A9AB5;
          margin-bottom: 28px;
        }

        .err-box {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-left: 3px solid #EF4444;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px;
          color: #DC2626;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lbl {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #7D8FAA;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 7px;
        }
        .field { margin-bottom: 16px; }

        .inp-wrap { position: relative; }
        .inp {
          width: 100%;
          background: #F7F9FC;
          border: 1.5px solid #DDE4EF;
          border-radius: 11px;
          padding: 13px 16px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          color: #0A2540;
          outline: none;
          transition: border-color .18s, box-shadow .18s, background .18s;
        }
        .inp::placeholder { color: #B8C4D6; }
        .inp:focus {
          border-color: #F7B500;
          box-shadow: 0 0 0 3px rgba(247,181,0,.12);
          background: #fff;
        }
        .eye-btn {
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: #A8B8CC;
          display: flex; align-items: center;
          padding: 4px;
          transition: color .18s;
        }
        .eye-btn:hover { color: #F7B500; }

        .forgot-row {
          text-align: right;
          margin-bottom: 22px;
        }
        .forgot-row a {
          font-size: 12px;
          color: #8A9AB5;
          text-decoration: none;
          transition: color .18s;
        }
        .forgot-row a:hover { color: #F7B500; }

        .btn {
          width: 100%;
          background: #0A2540;
          color: #fff;
          border: none;
          border-radius: 11px;
          padding: 14px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background .2s, transform .18s, box-shadow .18s;
          box-shadow: 0 4px 16px rgba(10,37,64,.18);
        }
        .btn:hover:not(:disabled) {
          background: #F7B500;
          color: #0A2540;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(247,181,0,.28);
        }
        .btn:disabled { opacity: .6; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }

        .register-row {
          text-align: center;
          margin-top: 22px;
          font-size: 13px;
          color: #8A9AB5;
        }
        .register-row a {
          color: #F7B500;
          font-weight: 700;
          text-decoration: none;
        }
        .register-row a:hover { text-decoration: underline; }

        .secure-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-top: 18px;
          font-size: 11px;
          color: #C2CEDC;
        }
      `}</style>

      <div className="pg">

        {/* Bouton retour */}
        <Link href="/" className="back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Retour à l'accueil
        </Link>

        {/* Carte */}
        <div className="card">

          <div className="logo-row">
            <div className="logo-box">BEH</div>
            <span className="logo-name">Business <span>Expert</span> Hub</span>
          </div>

          <div className="divider" />

          <div className="title">Connexion</div>
          <div className="subtitle">Accédez à votre tableau de bord</div>

          {error && (
            <div className="err-box">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="field">
              <label className="lbl">Adresse e-mail</label>
              <div className="inp-wrap">
                <input
                  type="email"
                  className="inp"
                  placeholder="nom@entreprise.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="lbl">Mot de passe</label>
              <div className="inp-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  className="inp"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: 44 }}
                />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="forgot-row">
  <Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
</div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? (
                <><div className="spinner" /> Connexion…</>
              ) : (
                <>
                  Se connecter
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>

          </form>

          <div className="register-row">
            Pas encore de compte ?{" "}
            <Link href="/inscription">S'inscrire gratuitement</Link>
          </div>

          <div className="secure-row">
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Connexion sécurisée SSL
          </div>

        </div>
      </div>
    </>
  );
}