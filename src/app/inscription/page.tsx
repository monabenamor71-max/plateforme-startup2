"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Inscription() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    prenom: "", nom: "", email: "", telephone: "",
    password: "", role: "startup",
    nomStartup: "", secteur: "", taille: "",
    domaine: "", experience: "", localisation: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (formData.role === "expert" && !cvFile) throw new Error("Le CV est obligatoire pour les experts");
      const baseUrl = "http://localhost:3001";
      let url: string;
      let options: RequestInit = { method: "POST" };

      if (formData.role === "startup") {
        url = baseUrl + "/auth/register/startup";
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify({
          email: formData.email, password: formData.password,
          nom: formData.nom, prenom: formData.prenom,
          telephone: formData.telephone, secteur: formData.secteur, taille: formData.taille,
        });
      } else {
        url = baseUrl + "/auth/register/expert";
        const fd = new FormData();
        fd.append("email", formData.email); fd.append("password", formData.password);
        fd.append("nom", formData.nom); fd.append("prenom", formData.prenom);
        fd.append("telephone", formData.telephone); fd.append("domaine", formData.domaine);
        fd.append("experience", formData.experience); fd.append("localisation", formData.localisation);
        if (cvFile) fd.append("cv", cvFile);
        options.body = fd;
      }

      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription");

      if (data.access_token && data.user) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        const routes: Record<string, string> = { startup: "/dashboard/startup", expert: "/dashboard/expert" };
        router.push(routes[data.user.role] || "/");
      } else {
        router.push("/connexion?registered=true");
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
          padding: 32px 24px;
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
          padding: 40px 40px;
          width: 100%;
          max-width: 560px;
          box-shadow: 0 4px 32px rgba(10,37,64,.07);
        }

        .logo-row {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 28px;
        }
        .logo-box {
          width: 40px; height: 40px;
          background: #0A2540;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #F7B500;
          flex-shrink: 0;
        }
        .logo-name { font-size: 15px; font-weight: 700; color: #0A2540; }
        .logo-name span { color: #F7B500; }

        .divider { height: 1px; background: #EDF1F7; margin-bottom: 24px; }

        .title { font-size: 22px; font-weight: 700; color: #0A2540; margin-bottom: 4px; }
        .subtitle { font-size: 13px; color: #8A9AB5; margin-bottom: 24px; }

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

        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
        .lbl {
          font-size: 11px; font-weight: 600; color: #7D8FAA;
          text-transform: uppercase; letter-spacing: 1px;
        }
        .inp-wrap { position: relative; }
        .inp {
          width: 100%;
          background: #F7F9FC;
          border: 1.5px solid #DDE4EF;
          border-radius: 11px;
          padding: 12px 16px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; color: #0A2540;
          outline: none;
          transition: border-color .18s, box-shadow .18s, background .18s;
        }
        .inp::placeholder { color: #B8C4D6; }
        .inp:focus {
          border-color: #F7B500;
          box-shadow: 0 0 0 3px rgba(247,181,0,.12);
          background: #fff;
        }
        select.inp { appearance: none; cursor: pointer; }
        .eye-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #A8B8CC; display: flex; align-items: center;
          padding: 4px; transition: color .18s;
        }
        .eye-btn:hover { color: #F7B500; }

        /* Sélecteur de rôle */
        .role-select {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          margin-bottom: 14px;
        }
        .role-opt {
          border: 1.5px solid #DDE4EF;
          border-radius: 12px;
          padding: 14px 16px;
          cursor: pointer;
          background: #F7F9FC;
          transition: all .2s;
          display: flex; align-items: center; gap: 10px;
        }
        .role-opt.active {
          border-color: #F7B500;
          background: rgba(247,181,0,.06);
          box-shadow: 0 0 0 3px rgba(247,181,0,.1);
        }
        .role-icon {
          width: 36px; height: 36px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          background: #EDF1F7;
          flex-shrink: 0;
          transition: background .2s;
        }
        .role-opt.active .role-icon { background: rgba(247,181,0,.18); }
        .role-lbl { font-size: 14px; font-weight: 600; color: #0A2540; }
        .role-sub { font-size: 11px; color: #8A9AB5; margin-top: 2px; }

        /* Section conditionnelle */
        .section-sep {
          border-top: 1px solid #EDF1F7;
          margin: 18px 0 18px;
          display: flex; align-items: center; gap: 10px;
        }
        .section-sep-lbl {
          font-size: 11px; font-weight: 700; color: #8A9AB5;
          text-transform: uppercase; letter-spacing: 1.5px;
          white-space: nowrap;
        }
        .section-sep-line { flex: 1; height: 1px; background: #EDF1F7; }

        /* Upload CV */
        .file-zone {
          border: 1.5px dashed #DDE4EF;
          border-radius: 11px;
          padding: 18px 16px;
          background: #F7F9FC;
          text-align: center;
          cursor: pointer;
          transition: all .2s;
          position: relative;
        }
        .file-zone:hover, .file-zone.has-file {
          border-color: #F7B500;
          background: rgba(247,181,0,.04);
        }
        .file-zone input {
          position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
        }
        .file-icon { font-size: 24px; margin-bottom: 6px; }
        .file-lbl { font-size: 13px; font-weight: 600; color: #0A2540; }
        .file-sub { font-size: 11px; color: #8A9AB5; margin-top: 3px; }
        .file-name { font-size: 12px; color: #F7B500; font-weight: 600; margin-top: 6px; }

        .btn {
          width: 100%;
          background: #0A2540;
          color: #fff;
          border: none;
          border-radius: 11px;
          padding: 14px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 20px;
          transition: background .2s, transform .18s, box-shadow .18s;
          box-shadow: 0 4px 16px rgba(10,37,64,.18);
        }
        .btn:hover:not(:disabled) {
          background: #F7B500; color: #0A2540;
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

        .login-row {
          text-align: center; margin-top: 20px;
          font-size: 13px; color: #8A9AB5;
        }
        .login-row a { color: #F7B500; font-weight: 700; text-decoration: none; }
        .login-row a:hover { text-decoration: underline; }

        .secure-row {
          display: flex; align-items: center; justify-content: center;
          gap: 5px; margin-top: 16px;
          font-size: 11px; color: #C2CEDC;
        }
      `}</style>

      <div className="pg">

        {/* Retour */}
        <Link href="/" className="back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Retour à l'accueil
        </Link>

        <div className="card">

          {/* Logo */}
          <div className="logo-row">
            <div className="logo-box">BEH</div>
            <span className="logo-name">Business <span>Expert</span> Hub</span>
          </div>

          <div className="divider" />

          <div className="title">Créer un compte</div>
          <div className="subtitle">Rejoignez la plateforme en quelques minutes</div>

          {error && (
            <div className="err-box">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Prénom + Nom */}
            <div className="grid2">
              <div className="field">
                <label className="lbl">Prénom</label>
                <input className="inp" type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Votre prénom" required />
              </div>
              <div className="field">
                <label className="lbl">Nom</label>
                <input className="inp" type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Votre nom" required />
              </div>
            </div>

            {/* Email */}
            <div className="field">
              <label className="lbl">Adresse e-mail</label>
              <input className="inp" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="nom@entreprise.com" required />
            </div>

            {/* Téléphone */}
            <div className="field">
              <label className="lbl">Téléphone</label>
              <input className="inp" type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="+216 00 000 000" />
            </div>

            {/* Mot de passe */}
            <div className="field">
              <label className="lbl">Mot de passe</label>
              <div className="inp-wrap">
                <input
                  className="inp" type={showPass ? "text" : "password"}
                  name="password" value={formData.password} onChange={handleChange}
                  placeholder="••••••••" required style={{ paddingRight: 44 }}
                />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Sélecteur rôle */}
            <div className="field" style={{ marginBottom: 8 }}>
              <label className="lbl" style={{ marginBottom: 10 }}>Vous êtes</label>
              <div className="role-select">
                {[
                  { val: "startup", icon: "🚀", lbl: "Startup", sub: "Je cherche des experts" },
                  { val: "expert",  icon: "🎯", lbl: "Expert",  sub: "J'accompagne des startups" },
                ].map(r => (
                  <div
                    key={r.val}
                    className={`role-opt${formData.role === r.val ? " active" : ""}`}
                    onClick={() => setFormData({ ...formData, role: r.val })}
                  >
                    <div className="role-icon">{r.icon}</div>
                    <div>
                      <div className="role-lbl">{r.lbl}</div>
                      <div className="role-sub">{r.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Champs Startup ── */}
            {formData.role === "startup" && (
              <>
                <div className="section-sep">
                  <div className="section-sep-line" />
                  <span className="section-sep-lbl">Votre startup</span>
                  <div className="section-sep-line" />
                </div>
                <div className="field">
                  <label className="lbl">Nom de la startup</label>
                  <input className="inp" type="text" name="nomStartup" value={formData.nomStartup} onChange={handleChange} placeholder="Ex: TechVenture SAS" />
                </div>
                <div className="grid2">
                  <div className="field">
                    <label className="lbl">Secteur</label>
                    <input className="inp" type="text" name="secteur" value={formData.secteur} onChange={handleChange} placeholder="Ex: FinTech, EdTech…" />
                  </div>
                  <div className="field">
                    <label className="lbl">Effectif</label>
                    <select className="inp" name="taille" value={formData.taille} onChange={handleChange}>
                      <option value="">Sélectionner…</option>
                      <option value="1-5">1-5 personnes</option>
                      <option value="6-10">6-10 personnes</option>
                      <option value="11-50">11-50 personnes</option>
                      <option value="51-200">51-200 personnes</option>
                      <option value="200+">200+ personnes</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* ── Champs Expert ── */}
            {formData.role === "expert" && (
              <>
                <div className="section-sep">
                  <div className="section-sep-line" />
                  <span className="section-sep-lbl">Profil expert</span>
                  <div className="section-sep-line" />
                </div>
                <div className="field">
                  <label className="lbl">Domaine d'expertise</label>
                  <input className="inp" type="text" name="domaine" value={formData.domaine} onChange={handleChange} placeholder="Ex: Marketing Digital, Finance…" />
                </div>
                <div className="grid2">
                  <div className="field">
                    <label className="lbl">Expérience</label>
                    <select className="inp" name="experience" value={formData.experience} onChange={handleChange}>
                      <option value="">Sélectionner…</option>
                      <option value="1-2 ans">1-2 ans</option>
                      <option value="3-5 ans">3-5 ans</option>
                      <option value="5-8 ans">5-8 ans</option>
                      <option value="8-12 ans">8-12 ans</option>
                      <option value="12+ ans">12+ ans</option>
                    </select>
                  </div>
                  <div className="field">
                    <label className="lbl">Localisation</label>
                    <input className="inp" type="text" name="localisation" value={formData.localisation} onChange={handleChange} placeholder="Ex: Tunis, Sfax…" />
                  </div>
                </div>
                <div className="field">
                  <label className="lbl">CV (PDF ou Word) *</label>
                  <div className={`file-zone${cvFile ? " has-file" : ""}`}>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={e => e.target.files?.[0] && setCvFile(e.target.files[0])} required />
                    <div className="file-icon">📄</div>
                    {cvFile ? (
                      <div className="file-name">✅ {cvFile.name}</div>
                    ) : (
                      <>
                        <div className="file-lbl">Cliquez pour uploader votre CV</div>
                        <div className="file-sub">PDF, DOC, DOCX — max 10 Mo</div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Bouton */}
            <button type="submit" className="btn" disabled={loading}>
              {loading ? (
                <><div className="spinner" /> Inscription en cours…</>
              ) : (
                <>
                  Créer mon compte
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </>
              )}
            </button>

          </form>

          <div className="login-row">
            Déjà un compte ?{" "}
            <Link href="/connexion">Se connecter</Link>
          </div>

          <div className="secure-row">
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Connexion sécurisée SSL · Données protégées
          </div>

        </div>
      </div>
    </>
  );
}