"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaTimesCircle, FaArrowRight,
} from "react-icons/fa";

export default function Connexion() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // ✅ Vérification correcte
      if (!response.ok) {
        setError("Email ou mot de passe incorrect.");
        setLoading(false);
        return;
      }

      const result = await response.json();

      localStorage.setItem('token', result.token || '');
      const payload = JSON.parse(atob(result.token.split('.')[1]));
      localStorage.setItem('user', JSON.stringify({
        nom: payload.nom,
        prenom: payload.prenom,
        email,
        role: payload.role,
      }));

      setLoading(false);

      // ✅ Redirection selon le rôle
      window.location.href = payload.role === 'expert'
        ? '/dashboard/expert'
        : payload.role === 'admin'
        ? '/dashboard/admin'
        : '/dashboard/startup';

    } catch {
      setError("Impossible de contacter le serveur. Vérifiez que le backend est lancé.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #EBF1FA 0%, #F4F7FB 40%, #EEF3F9 70%, #E8EFF8 100%)",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .aurora { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .aurora::before {
          content: ''; position: absolute;
          width: 900px; height: 900px; top: -300px; right: -200px;
          background: radial-gradient(ellipse, rgba(182,139,68,0.07) 0%, transparent 70%);
          border-radius: 50%; animation: drift 18s ease-in-out infinite alternate;
        }
        .aurora::after {
          content: ''; position: absolute;
          width: 600px; height: 600px; bottom: -150px; left: -100px;
          background: radial-gradient(ellipse, rgba(59,130,246,0.09) 0%, transparent 70%);
          border-radius: 50%; animation: drift 22s ease-in-out infinite alternate-reverse;
        }
        @keyframes drift { from { transform: translate(0,0) scale(1); } to { transform: translate(40px,30px) scale(1.08); } }

        .grid-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(30,64,175,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,64,175,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .card {
          position: relative; z-index: 10;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(28px) saturate(1.4);
          -webkit-backdrop-filter: blur(28px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.95);
          border-radius: 20px;
          padding: 52px 48px 44px;
          box-shadow: 0 8px 40px rgba(30,64,175,0.08), 0 2px 8px rgba(30,64,175,0.05), inset 0 1px 0 rgba(255,255,255,1);
          animation: slideUp 0.65s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes slideUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }

        .field-wrap { position: relative; }
        .field-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: #94A3B8; font-size: 13px; pointer-events: none; transition: color .2s;
        }
        .inp {
          font-family: 'DM Sans', sans-serif; width: 100%;
          background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px;
          padding: 14px 16px 14px 44px; font-size: 14px; color: #1E293B; outline: none;
          transition: border-color .22s, background .22s, box-shadow .22s; letter-spacing: 0.01em;
        }
        .inp::placeholder { color: #CBD5E1; }
        .inp:focus {
          border-color: rgba(182,139,68,0.6); background: #FFFDF7;
          box-shadow: 0 0 0 3px rgba(182,139,68,0.10);
        }
        .inp:focus ~ .field-icon,
        .field-wrap:focus-within .field-icon { color: rgba(182,139,68,0.85); }
        .inp-err { border-color: rgba(239,68,68,0.5) !important; }

        .lbl {
          font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 600;
          color: #64748B; letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 8px; display: block;
        }

        .btn-primary {
          font-family: 'DM Sans', sans-serif; width: 100%;
          background: linear-gradient(135deg, #C9A84C 0%, #B6893F 50%, #9A6F2E 100%);
          color: #0F1923; border: none; border-radius: 10px; padding: 15px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          letter-spacing: 0.08em; text-transform: uppercase;
          transition: transform .2s, box-shadow .2s, filter .2s;
          box-shadow: 0 8px 28px rgba(182,139,68,0.28); position: relative; overflow: hidden;
        }
        .btn-primary::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%);
          pointer-events: none;
        }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 38px rgba(182,139,68,0.38); filter: brightness(1.06); }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: .55; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { width: 18px; height: 18px; border: 2px solid rgba(15,25,35,0.3); border-top-color: #0F1923; border-radius: 50%; animation: spin .7s linear infinite; }

        .divider { display: flex; align-items: center; gap: 14px; margin: 28px 0; }
        .divider-line { flex: 1; height: 1px; background: #E2E8F0; }
        .divider-text { font-family: 'DM Sans', sans-serif; font-size: 11px; color: #94A3B8; letter-spacing: 0.1em; text-transform: uppercase; }

        .error-box {
          background: #FEF2F2; border: 1px solid #FECACA; border-radius: 9px;
          padding: 12px 16px; display: flex; align-items: center; gap: 9px; margin-bottom: 24px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; color: #DC2626;
        }

        .nav-link { color: #64748B; text-decoration: none; font-family: 'DM Sans', sans-serif; font-size: 13px; transition: color .2s; }
        .nav-link:hover { color: #1E293B; }
        .nav-link span { color: #B6893F; font-weight: 600; }

        .forgot { font-family: 'DM Sans', sans-serif; font-size: 12px; color: rgba(182,139,68,0.8); text-decoration: none; transition: color .2s; }
        .forgot:hover { color: #C9A84C; }

        .register-link { color: #64748B; font-family: 'DM Sans', sans-serif; font-size: 13.5px; text-align: center; }
        .register-link a { color: #B6893F; text-decoration: none; font-weight: 600; transition: color .2s; }
        .register-link a:hover { color: #C9A84C; }

        .gold-line { width: 36px; height: 2px; background: linear-gradient(90deg, #C9A84C, transparent); margin: 0 auto 20px; }
      `}</style>

      <div className="aurora" />
      <div className="grid-overlay" />

      {/* HEADER */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 40px", position: "relative", zIndex: 20 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none" }}>
          <div style={{
            width: 40, height: 40, border: "1px solid rgba(182,139,68,0.4)", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(182,139,68,0.07)",
          }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 15, color: "#B6893F", letterSpacing: "0.05em" }}>BEH</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 17, color: "#1E293B", letterSpacing: "0.03em", lineHeight: 1.1 }}>Business Expert Hub</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#94A3B8", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>Experts & Startups</div>
          </div>
        </Link>
        <Link href="/inscription" className="nav-link">
          Pas de compte ? <span>S'inscrire</span>
        </Link>
      </header>

      {/* MAIN */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px 64px", position: "relative", zIndex: 10 }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div className="card">

            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div className="gold-line" />
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontWeight: 600,
                color: "#1E293B", letterSpacing: "0.02em", lineHeight: 1.1, marginBottom: 10,
              }}>
                Connexion
              </h1>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94A3B8", letterSpacing: "0.02em" }}>
                Accédez à votre espace personnel
              </p>
            </div>

            {error && (
              <div className="error-box">
                <FaTimesCircle style={{ flexShrink: 0 }} size={13} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label className="lbl">Adresse email</label>
                <div className="field-wrap">
                  <input
                    type="email" placeholder="votre@email.com" value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    className={`inp${error ? " inp-err" : ""}`} autoComplete="email"
                  />
                  <FaEnvelope className="field-icon" />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <label className="lbl" style={{ margin: 0 }}>Mot de passe</label>
                  <a href="#" className="forgot">Mot de passe oublié ?</a>
                </div>
                <div className="field-wrap" style={{ position: "relative" }}>
                  <input
                    type={showPwd ? "text" : "password"} placeholder="••••••••••••" value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    className={`inp${error ? " inp-err" : ""}`} style={{ paddingRight: 44 }}
                    autoComplete="current-password"
                  />
                  <FaLock className="field-icon" />
                  <button
                    type="button" onClick={() => setShowPwd(p => !p)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#CBD5E1", cursor: "pointer", padding: 4, transition: "color .2s", display: "flex" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(182,139,68,0.8)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#CBD5E1")}
                  >
                    {showPwd ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 6 }}>
                {loading ? <div className="spinner" /> : <><span>Se connecter</span><FaArrowRight size={12} /></>}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">ou</span>
              <div className="divider-line" />
            </div>

            <p className="register-link">
              Pas encore de compte ?{" "}
              <Link href="/inscription">S'inscrire gratuitement</Link>
            </p>
          </div>

          <p style={{ textAlign: "center", marginTop: 22, fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#94A3B8", letterSpacing: "0.06em" }}>
            Données protégées — conformité RGPD
          </p>
        </div>
      </main>
    </div>
  );
}