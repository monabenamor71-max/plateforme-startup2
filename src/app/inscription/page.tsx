"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Inscription() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    prenom: "", nom: "", email: "", telephone: "",
    password: "", confirmPassword: "", role: "startup",
    // Startup
    nom_startup: "", secteur: "", taille: "", fonction: "",
    // Expert
    domaine: "", experience: "", localisation: "", tarif: "", description: "",
  });
  const [cvFile, setCvFile]           = useState<File | null>(null);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (formData.password !== formData.confirmPassword)
        throw new Error("Les mots de passe ne correspondent pas");
      if (formData.password.length < 6)
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      if (formData.role === "expert" && !cvFile)
        throw new Error("Le CV est obligatoire pour les experts");

      let url: string;
      let options: RequestInit = { method: "POST" };

      if (formData.role === "startup") {
        url = "http://localhost:3001/auth/register/startup";
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify({
          email:       formData.email,
          password:    formData.password,
          nom:         formData.nom,
          prenom:      formData.prenom,
          telephone:   formData.telephone,
          nom_startup: formData.nom_startup,
          secteur:     formData.secteur,
          taille:      formData.taille,
          fonction:    formData.fonction,
        });
      } else {
        url = "http://localhost:3001/auth/register/expert";
        const fd = new FormData();
        fd.append("email",        formData.email);
        fd.append("password",     formData.password);
        fd.append("nom",          formData.nom);
        fd.append("prenom",       formData.prenom);
        fd.append("telephone",    formData.telephone);
        fd.append("domaine",      formData.domaine);
        fd.append("experience",   formData.experience);
        fd.append("localisation", formData.localisation);
        fd.append("tarif",        formData.tarif);
        fd.append("description",  formData.description);
        if (cvFile) fd.append("cv", cvFile);
        options.body = fd;
      }

      const res  = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription");

      if (data.access_token && data.user) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        const routes: Record<string, string> = {
          startup: "/dashboard/startup",
          expert:  "/dashboard/expert",
          admin:   "/dashboard/admin",
        };
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

  const passStrength = formData.password.length === 0 ? 0 : formData.password.length < 6 ? 1 : formData.password.length < 10 ? 2 : 3;
  const passColors   = ["", "#EF4444", "#F59E0B", "#10B981"];
  const passLabels   = ["", "Trop court", "Moyen", "Fort"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Outfit',sans-serif;}
        .pg{min-height:100vh;background:linear-gradient(135deg,#F0F4F8 0%,#E8EEF6 100%);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:40px 24px;font-family:'Outfit',sans-serif;}
        .back-btn{display:inline-flex;align-items:center;gap:7px;color:#fff;font-size:13px;font-weight:600;text-decoration:none;margin-bottom:28px;padding:9px 18px;border-radius:8px;background:#0A2540;border:none;cursor:pointer;transition:all .2s;}
        .back-btn:hover{background:#F7B500;color:#0A2540;transform:translateX(-2px);}
        .card{background:#fff;border:1px solid #DDE4EF;border-radius:24px;padding:44px 44px;width:100%;max-width:640px;box-shadow:0 8px 40px rgba(10,37,64,.1);}
        .logo-row{display:flex;align-items:center;gap:12px;margin-bottom:28px;}
        .logo-box{width:42px;height:42px;background:#0A2540;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#F7B500;flex-shrink:0;}
        .logo-name{font-size:16px;font-weight:700;color:#0A2540;}
        .logo-name em{color:#F7B500;font-style:normal;}
        .divider{height:1px;background:#EDF1F7;margin-bottom:28px;}
        .title{font-size:24px;font-weight:800;color:#0A2540;margin-bottom:6px;}
        .subtitle{font-size:13.5px;color:#8A9AB5;margin-bottom:28px;line-height:1.6;}
        .err-box{background:#FEF2F2;border:1px solid #FECACA;border-left:4px solid #EF4444;border-radius:12px;padding:13px 16px;font-size:13px;color:#DC2626;margin-bottom:20px;display:flex;align-items:flex-start;gap:10px;line-height:1.5;}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .field-group{display:flex;flex-direction:column;gap:7px;margin-bottom:16px;}
        .lbl{font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;letter-spacing:1.2px;}
        .inp-wrap{position:relative;}
        .inp{width:100%;background:#F7F9FC;border:1.5px solid #DDE4EF;border-radius:11px;padding:12px 16px;font-family:'Outfit',sans-serif;font-size:14px;color:#0A2540;outline:none;transition:border-color .18s,box-shadow .18s,background .18s;}
        .inp::placeholder{color:#B8C4D6;}
        .inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.12);background:#fff;}
        select.inp{appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A8B8CC' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;padding-right:38px;}
        textarea.inp{resize:vertical;min-height:90px;line-height:1.65;}
        .eye-btn{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#A8B8CC;display:flex;align-items:center;padding:4px;transition:color .18s;}
        .eye-btn:hover{color:#F7B500;}
        .role-select{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
        .role-opt{border:1.5px solid #DDE4EF;border-radius:14px;padding:16px 18px;cursor:pointer;background:#F7F9FC;transition:all .2s;display:flex;align-items:center;gap:12px;}
        .role-opt.active{border-color:#F7B500;background:rgba(247,181,0,.05);box-shadow:0 0 0 3px rgba(247,181,0,.12);}
        .role-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;background:#EDF1F7;flex-shrink:0;transition:background .2s;}
        .role-opt.active .role-icon{background:rgba(247,181,0,.2);}
        .role-lbl{font-size:14.5px;font-weight:700;color:#0A2540;}
        .role-sub{font-size:11.5px;color:#8A9AB5;margin-top:2px;}
        .section-title{font-size:11px;font-weight:800;color:#F7B500;text-transform:uppercase;letter-spacing:2px;display:flex;align-items:center;gap:10px;margin:22px 0 18px;}
        .section-title::after{content:'';flex:1;height:1px;background:#EDF1F7;}
        .file-zone{border:1.5px dashed #DDE4EF;border-radius:12px;padding:20px 18px;background:#F7F9FC;text-align:center;cursor:pointer;transition:all .2s;position:relative;}
        .file-zone:hover,.file-zone.has-file{border-color:#F7B500;background:rgba(247,181,0,.04);}
        .file-zone input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}
        .submit-btn{width:100%;background:#0A2540;color:#fff;border:none;border-radius:12px;padding:15px;font-family:'Outfit',sans-serif;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:24px;transition:background .2s,transform .18s,box-shadow .18s;box-shadow:0 4px 20px rgba(10,37,64,.2);}
        .submit-btn:hover:not(:disabled){background:#F7B500;color:#0A2540;transform:translateY(-2px);box-shadow:0 8px 28px rgba(247,181,0,.3);}
        .submit-btn:disabled{opacity:.55;cursor:not-allowed;}
        @keyframes spin{to{transform:rotate(360deg);}}
        .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:currentColor;border-radius:50%;animation:spin .7s linear infinite;}
        .login-row{text-align:center;margin-top:22px;font-size:13.5px;color:#8A9AB5;}
        .login-row a{color:#F7B500;font-weight:700;text-decoration:none;}
        .login-row a:hover{text-decoration:underline;}
        .secure-row{display:flex;align-items:center;justify-content:center;gap:5px;margin-top:16px;font-size:11px;color:#C2CEDC;}
      `}</style>

      <div className="pg">
        <Link href="/" className="back-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Retour à l'accueil
        </Link>

        <div className="card">
          <div className="logo-row">
            <div className="logo-box">BEH</div>
            <span className="logo-name">Business <em>Expert</em> Hub</span>
          </div>
          <div className="divider" />
          <div className="title">Créer un compte</div>
          <div className="subtitle">Rejoignez la plateforme BEH et accédez à des experts certifiés.</div>

          {error && (
            <div className="err-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Prénom + Nom */}
            <div className="grid2">
              <div className="field-group">
                <label className="lbl">Prénom *</label>
                <input className="inp" type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Votre prénom" required />
              </div>
              <div className="field-group">
                <label className="lbl">Nom *</label>
                <input className="inp" type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Votre nom" required />
              </div>
            </div>

            {/* Email */}
            <div className="field-group">
              <label className="lbl">Adresse e-mail *</label>
              <input className="inp" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="nom@entreprise.com" required />
            </div>

            {/* Téléphone */}
            <div className="field-group">
              <label className="lbl">Téléphone</label>
              <input className="inp" type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="+216 00 000 000" />
            </div>

            {/* Mot de passe + Confirmation */}
            <div className="grid2">
              <div className="field-group">
                <label className="lbl">Mot de passe *</label>
                <div className="inp-wrap">
                  <input className="inp" type={showPass?"text":"password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required style={{ paddingRight:44 }} />
                  <button type="button" className="eye-btn" onClick={()=>setShowPass(!showPass)} tabIndex={-1}>
                    {showPass
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {passStrength > 0 && (
                  <div style={{ marginTop:6 }}>
                    <div style={{ height:3, borderRadius:99, background:"#EDF1F7", overflow:"hidden", marginBottom:4 }}>
                      <div style={{ height:"100%", borderRadius:99, background:passColors[passStrength], width:`${passStrength*33}%`, transition:"width .3s,background .3s" }} />
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, color:passColors[passStrength] }}>{passLabels[passStrength]}</span>
                  </div>
                )}
              </div>
              <div className="field-group">
                <label className="lbl">Confirmer *</label>
                <div className="inp-wrap">
                  <input className="inp" type={showConfirm?"text":"password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required style={{ paddingRight:44, borderColor:formData.confirmPassword&&formData.confirmPassword!==formData.password?"#EF4444":undefined }} />
                  <button type="button" className="eye-btn" onClick={()=>setShowConfirm(!showConfirm)} tabIndex={-1}>
                    {showConfirm
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                  <span style={{ fontSize:11, color:"#EF4444", fontWeight:600 }}>Ne correspondent pas</span>
                )}
              </div>
            </div>

            {/* Sélecteur rôle */}
            <div className="field-group" style={{ marginBottom:6 }}>
              <label className="lbl" style={{ marginBottom:10 }}>Vous êtes *</label>
              <div className="role-select">
                {[
                  { val:"startup", icon:"🚀", lbl:"Startup",  sub:"Je cherche des experts" },
                  { val:"expert",  icon:"🎯", lbl:"Expert",   sub:"J'accompagne des startups" },
                ].map(r => (
                  <div key={r.val} className={`role-opt${formData.role===r.val?" active":""}`} onClick={()=>setFormData({...formData,role:r.val})}>
                    <div className="role-icon">{r.icon}</div>
                    <div>
                      <div className="role-lbl">{r.lbl}</div>
                      <div className="role-sub">{r.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ CHAMPS STARTUP ══ */}
            {formData.role === "startup" && (
              <>
                <div className="section-title">Informations startup</div>

                {/* Nom de la startup */}
                <div className="field-group">
                  <label className="lbl">Nom de la startup *</label>
                  <input className="inp" type="text" name="nom_startup" value={formData.nom_startup} onChange={handleChange} placeholder="Ex: TechVenture, InnoSaas, StartHub…" required />
                </div>

                {/* Fonction */}
                <div className="field-group">
                  <label className="lbl">Votre fonction *</label>
                  <select className="inp" name="fonction" value={formData.fonction} onChange={handleChange} required>
                    <option value="">Sélectionner votre fonction…</option>
                    <option value="CEO / Fondateur">CEO / Fondateur</option>
                    <option value="Co-fondateur">Co-fondateur</option>
                    <option value="Directeur Général">Directeur Général</option>
                    <option value="Directeur Financier (CFO)">Directeur Financier (CFO)</option>
                    <option value="Directeur Technique (CTO)">Directeur Technique (CTO)</option>
                    <option value="Directeur Commercial">Directeur Commercial</option>
                    <option value="Directeur Marketing">Directeur Marketing</option>
                    <option value="Responsable Produit">Responsable Produit</option>
                    <option value="Chef de projet">Chef de projet</option>
                    <option value="Business Developer">Business Developer</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                {/* Secteur + Taille */}
                <div className="grid2">
                  <div className="field-group">
                    <label className="lbl">Secteur d'activité</label>
                    <input className="inp" type="text" name="secteur" value={formData.secteur} onChange={handleChange} placeholder="Ex: FinTech, EdTech, SaaS…" />
                  </div>
                  <div className="field-group">
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

            {/* ══ CHAMPS EXPERT ══ */}
            {formData.role === "expert" && (
              <>
                <div className="section-title">Profil expert</div>
                <div className="field-group">
                  <label className="lbl">Domaine d'expertise *</label>
                  <input className="inp" type="text" name="domaine" value={formData.domaine} onChange={handleChange} placeholder="Ex: Marketing Digital, Finance, RH…" required />
                </div>
                <div className="grid2">
                  <div className="field-group">
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
                  <div className="field-group">
                    <label className="lbl">Localisation</label>
                    <input className="inp" type="text" name="localisation" value={formData.localisation} onChange={handleChange} placeholder="Ex: Tunis, Sfax, Sousse…" />
                  </div>
                </div>
                <div className="field-group">
                  <label className="lbl">Tarif horaire</label>
                  <input className="inp" type="text" name="tarif" value={formData.tarif} onChange={handleChange} placeholder="Ex: 150 DT/h" />
                </div>
                <div className="field-group">
                  <label className="lbl">Description / Bio</label>
                  <textarea className="inp" name="description" value={formData.description} onChange={handleChange} placeholder="Présentez votre parcours et vos expertises…" />
                </div>
                <div className="field-group">
                  <label className="lbl">CV (PDF ou Word) *</label>
                  <div className={`file-zone${cvFile?" has-file":""}`}>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={e=>e.target.files?.[0]&&setCvFile(e.target.files[0])} />
                    <div style={{ fontSize:28, marginBottom:8 }}>📄</div>
                    {cvFile
                      ? <div style={{ fontSize:12.5, color:"#059669", fontWeight:600 }}>✅ {cvFile.name}</div>
                      : <>
                          <div style={{ fontSize:13.5, fontWeight:600, color:"#0A2540" }}>Cliquez pour uploader votre CV</div>
                          <div style={{ fontSize:11.5, color:"#8A9AB5", marginTop:4 }}>PDF, DOC, DOCX — max 10 Mo</div>
                        </>
                    }
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading
                ? <><div className="spinner" /> Inscription en cours…</>
                : <>Créer mon compte <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
              }
            </button>
          </form>

          <div className="login-row">
            Déjà un compte ? <Link href="/connexion">Se connecter</Link>
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