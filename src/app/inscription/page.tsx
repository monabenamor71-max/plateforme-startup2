"use client";
import { useState, useRef } from "react";
import Link from "next/link";

/* ══════════════════════════════════════
   SVG ICONS
══════════════════════════════════════ */
const IconUser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 7 10-7"/>
  </svg>
);
const IconLock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconPhone = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.42a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconBriefcase = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconEye = ({ open }: { open: boolean }) => open ? (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconCheckCircle = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconX = ({ color = "currentColor" }: { color?: string }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);
const IconUpload = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const IconRocket = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);
const IconShield = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* ══════════════════════════════════════
   TYPES
══════════════════════════════════════ */
type Role = "Startup" | "Expert";
interface FormData {
  nom: string; prenom: string; tel: string; email: string;
  password: string; confirmPassword: string;
  role: Role; domaine: string; cv: File | null;
}

/* ══════════════════════════════════════
   FIELD COMPONENT
══════════════════════════════════════ */
function Field({ label, icon, error, children }: {
  label: string; icon?: React.ReactNode; error?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none", zIndex: 1, display: "flex" }}>
            {icon}
          </span>
        )}
        {children}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: "#EF4444", display: "flex", alignItems: "center", gap: 5, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
          <IconX color="#EF4444" /> {error}
        </span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
export default function Inscription() {
  const [formData, setFormData] = useState<FormData>({
    nom: "", prenom: "", tel: "", email: "",
    password: "", confirmPassword: "",
    role: "Startup", domaine: "", cv: null,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [step, setStep]               = useState<1 | 2>(1);
  const [serverError, setServerError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function update(field: keyof FormData, value: string | File | null) {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    setServerError("");
  }

  function validateStep1(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!formData.nom.trim()) errs.nom = "Le nom est obligatoire.";
    if (!formData.prenom.trim()) errs.prenom = "Le prénom est obligatoire.";
    if (!formData.tel.match(/^[+]?[\d\s\-]{8,15}$/)) errs.tel = "Numéro invalide.";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Adresse email invalide.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};

    // ✅ Mot de passe simple — minimum 6 caractères
    if (formData.password.length < 6) errs.password = "Mot de passe minimum 6 caractères.";
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Les mots de passe ne correspondent pas.";

    if (formData.role === "Expert") {
      if (!formData.domaine.trim()) errs.domaine = "Le domaine est obligatoire pour les experts.";
      if (!formData.cv) errs.cv = "Le CV (PDF) est obligatoire pour les experts.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    setServerError("");
    try {
      const response = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom, prenom: formData.prenom,
          tel: formData.tel, email: formData.email,
          password: formData.password,
          role: formData.role.toLowerCase(),
          domaine: formData.domaine || undefined,
        }),
      });

      // ✅ Vérification correcte
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        if (response.status === 409) {
          setFieldErrors({ email: "Cet email est déjà utilisé." });
          setStep(1);
        } else {
          setServerError(result.message || "Une erreur est survenue. Veuillez réessayer.");
        }
        setLoading(false);
        return;
      }

      const result = await response.json();

      // ✅ Sauvegarde dans localStorage
      localStorage.setItem("token", result.token || "");
      localStorage.setItem("user", JSON.stringify({
        nom: formData.nom, prenom: formData.prenom,
        email: formData.email, role: formData.role.toLowerCase(),
        domaine: formData.domaine || "",
      }));

      setLoading(false);

      // ✅ Redirection selon le rôle
      window.location.href = formData.role === "Expert"
        ? "/dashboard/expert"
        : "/dashboard/startup";

    } catch {
      setServerError("Impossible de contacter le serveur. Vérifiez que le backend est lancé.");
      setLoading(false);
    }
  }

  const inp = (field: keyof FormData, extraRight = false): React.CSSProperties => ({
    fontFamily: "'DM Sans', sans-serif",
    width: "100%",
    paddingLeft: 44,
    paddingRight: extraRight ? 46 : 16,
    paddingTop: 14, paddingBottom: 14,
    background: "#F8FAFC",
    border: `1.5px solid ${fieldErrors[field] ? "rgba(239,68,68,0.5)" : "#E2E8F0"}`,
    borderRadius: 10,
    fontSize: 14,
    color: "#1E293B",
    outline: "none",
    transition: "border-color .22s, background .22s, box-shadow .22s",
    letterSpacing: "0.01em",
  });

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
        .aurora { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
        .aurora::before { content:''; position:absolute; width:900px; height:900px; top:-300px; right:-200px; background:radial-gradient(ellipse,rgba(182,139,68,0.07) 0%,transparent 70%); border-radius:50%; animation:drift 18s ease-in-out infinite alternate; }
        .aurora::after { content:''; position:absolute; width:600px; height:600px; bottom:-150px; left:-100px; background:radial-gradient(ellipse,rgba(59,130,246,0.09) 0%,transparent 70%); border-radius:50%; animation:drift 22s ease-in-out infinite alternate-reverse; }
        @keyframes drift { from{transform:translate(0,0) scale(1);} to{transform:translate(40px,30px) scale(1.08);} }
        .grid-overlay { position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(30,64,175,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(30,64,175,0.04) 1px,transparent 1px); background-size:60px 60px; }
        .card { position:relative; z-index:10; background:rgba(255,255,255,0.85); backdrop-filter:blur(28px) saturate(1.4); border:1px solid rgba(255,255,255,0.95); border-radius:20px; padding:44px 44px 40px; box-shadow:0 8px 40px rgba(30,64,175,0.08),0 2px 8px rgba(30,64,175,0.05),inset 0 1px 0 rgba(255,255,255,1); animation:slideUp 0.65s cubic-bezier(.22,1,.36,1) both; }
        @keyframes slideUp { from{opacity:0;transform:translateY(28px);} to{opacity:1;transform:translateY(0);} }
        .inp-field { transition:border-color .22s, background .22s, box-shadow .22s; }
        .inp-field:focus { border-color:rgba(182,139,68,0.6) !important; background:#FFFDF7 !important; box-shadow:0 0 0 3px rgba(182,139,68,0.10) !important; }
        .btn-primary { font-family:'DM Sans',sans-serif; width:100%; background:linear-gradient(135deg,#C9A84C 0%,#B6893F 50%,#9A6F2E 100%); color:#0F1923; border:none; border-radius:10px; padding:15px; font-size:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; letter-spacing:0.08em; text-transform:uppercase; transition:transform .2s,box-shadow .2s,filter .2s; box-shadow:0 8px 28px rgba(182,139,68,0.28); position:relative; overflow:hidden; }
        .btn-primary::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.18) 0%,transparent 60%); pointer-events:none; }
        .btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 14px 38px rgba(182,139,68,0.38); filter:brightness(1.06); }
        .btn-primary:disabled { opacity:.55; cursor:not-allowed; }
        .btn-secondary { font-family:'DM Sans',sans-serif; width:100%; background:transparent; color:#64748B; border:1.5px solid #E2E8F0; border-radius:10px; padding:13px; font-size:14px; font-weight:600; cursor:pointer; transition:all .2s; letter-spacing:0.04em; }
        .btn-secondary:hover { border-color:rgba(182,139,68,0.5); color:#B6893F; background:rgba(182,139,68,0.04); }
        @keyframes spin { to{transform:rotate(360deg);} }
        .spinner { width:18px; height:18px; border:2px solid rgba(15,25,35,0.3); border-top-color:#0F1923; border-radius:50%; animation:spin .7s linear infinite; }
        .role-card { cursor:pointer; transition:all .22s; }
        .role-card:hover { transform:translateY(-2px); }
        .upload-zone { cursor:pointer; transition:all .22s; }
        .upload-zone:hover { border-color:rgba(182,139,68,0.5) !important; background:rgba(182,139,68,0.04) !important; }
        .eye-btn { transition:color .15s; }
        .eye-btn:hover { color:rgba(182,139,68,0.8) !important; }
        .nav-link { color:#64748B; text-decoration:none; font-family:'DM Sans',sans-serif; font-size:13px; transition:color .2s; }
        .nav-link:hover { color:#1E293B; }
        .nav-link span { color:#B6893F; font-weight:600; }
        .gold-line { width:36px; height:2px; background:linear-gradient(90deg,#C9A84C,transparent); margin:0 auto 20px; }
        .lbl { font-family:'DM Sans',sans-serif; font-size:11.5px; font-weight:600; color:#64748B; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:8px; display:block; }
        input::placeholder { color:#CBD5E1; }
      `}</style>

      <div className="aurora" />
      <div className="grid-overlay" />

      {/* HEADER */}
      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"24px 40px", position:"relative", zIndex:20 }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:14, textDecoration:"none" }}>
          <div style={{ width:40, height:40, border:"1px solid rgba(182,139,68,0.4)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(182,139,68,0.07)" }}>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:15, color:"#B6893F" }}>BEH</span>
          </div>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:17, color:"#1E293B" }}>Business Expert Hub</div>
            <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10, color:"#94A3B8", letterSpacing:"0.15em", textTransform:"uppercase", marginTop:2 }}>Experts & Startups</div>
          </div>
        </Link>
        <Link href="/connexion" className="nav-link">
          Déjà un compte ? <span>Se connecter</span>
        </Link>
      </header>

      {/* MAIN */}
      <main style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 24px 48px", position:"relative", zIndex:10 }}>
        <div style={{ width:"100%", maxWidth:500 }}>
          <div className="card">

            {/* TITRE */}
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div className="gold-line" />
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:600, color:"#1E293B", marginBottom:8 }}>
                Créer votre compte
              </h1>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#94A3B8" }}>
                Accédez à toutes nos formations, podcasts et experts
              </p>
            </div>

            {/* STEPPER */}
            <div style={{ display:"flex", alignItems:"center", marginBottom:28 }}>
              {[1, 2].map((s, i) => (
                <div key={s} style={{ display:"flex", alignItems:"center", flex: i === 0 ? 1 : undefined }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <div style={{
                      width:30, height:30, borderRadius:"50%",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, fontWeight:700,
                      background: step > s ? "linear-gradient(135deg,#C9A84C,#B6893F)" : step === s ? "#1E293B" : "#F1F5F9",
                      color: step >= s ? (step > s ? "#0F1923" : "#C9A84C") : "#94A3B8",
                      border: step === s ? "2px solid rgba(182,139,68,0.4)" : "2px solid transparent",
                      fontFamily:"'DM Sans',sans-serif",
                    }}>
                      {step > s ? <IconCheck /> : s}
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, whiteSpace:"nowrap", color: step >= s ? "#1E293B" : "#94A3B8", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", textTransform:"uppercase" }}>
                      {s === 1 ? "Informations" : "Sécurité & Rôle"}
                    </span>
                  </div>
                  {i === 0 && (
                    <div style={{ flex:1, height:1, margin:"0 10px", marginBottom:16, borderRadius:99, background: step > 1 ? "linear-gradient(90deg,#C9A84C,rgba(182,139,68,0.3))" : "#E2E8F0" }} />
                  )}
                </div>
              ))}
            </div>

            {/* ══════════ ÉTAPE 1 ══════════ */}
            {step === 1 && (
              <form onSubmit={e => { e.preventDefault(); if (validateStep1()) setStep(2); }} style={{ display:"flex", flexDirection:"column", gap:16 }}>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Field label="Nom" icon={<IconUser />} error={fieldErrors.nom}>
                    <input className="inp-field" type="text" placeholder="Votre nom" value={formData.nom} onChange={e => update("nom", e.target.value)} style={inp("nom")} />
                  </Field>
                  <Field label="Prénom" icon={<IconUser />} error={fieldErrors.prenom}>
                    <input className="inp-field" type="text" placeholder="Votre prénom" value={formData.prenom} onChange={e => update("prenom", e.target.value)} style={inp("prenom")} />
                  </Field>
                </div>

                <Field label="Téléphone" icon={<IconPhone />} error={fieldErrors.tel}>
                  <input className="inp-field" type="tel" placeholder="+216 XX XXX XXX" value={formData.tel} onChange={e => update("tel", e.target.value)} style={inp("tel")} />
                </Field>

                <Field label="Adresse e-mail" icon={<IconMail />} error={fieldErrors.email}>
                  <input className="inp-field" type="email" placeholder="vous@email.com" value={formData.email} onChange={e => update("email", e.target.value)} style={inp("email")} />
                </Field>

                <div style={{ background:"rgba(182,139,68,0.06)", borderRadius:12, padding:"14px 16px", border:"1px solid rgba(182,139,68,0.18)" }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"#B6893F", marginBottom:8, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em", textTransform:"uppercase" }}>
                    En créant un compte vous accédez à :
                  </p>
                  {["🎓 Toutes les formations vidéos et PDF", "🎙️ Tous les podcasts exclusifs", "👥 Profils complets des experts", "📅 Réservation de rendez-vous"].map((item, i) => (
                    <p key={i} style={{ fontSize:12, color:"#64748B", fontFamily:"'DM Sans',sans-serif", marginBottom:3 }}>{item}</p>
                  ))}
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop:4 }}>
                  Continuer <IconArrow />
                </button>

              </form>
            )}

            {/* ══════════ ÉTAPE 2 ══════════ */}
            {step === 2 && (
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {serverError && (
                  <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:9, padding:"12px 16px", display:"flex", alignItems:"center", gap:9, fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#DC2626" }}>
                    <IconX color="#DC2626" /> {serverError}
                  </div>
                )}

                {/* Rôle */}
                <div>
                  <label className="lbl">Vous êtes…</label>
                  <div style={{ display:"flex", gap:12 }}>
                    {(["Startup", "Expert"] as Role[]).map(r => (
                      <div key={r} className="role-card" onClick={() => update("role", r)} style={{
                        flex:1, border:`1.5px solid ${formData.role === r ? "rgba(182,139,68,0.6)" : "#E2E8F0"}`,
                        borderRadius:12, padding:"18px 14px", textAlign:"center",
                        background: formData.role === r ? "rgba(182,139,68,0.06)" : "#FAFAFA",
                        boxShadow: formData.role === r ? "0 4px 16px rgba(182,139,68,0.14)" : "none",
                      }}>
                        <div style={{ color: formData.role === r ? "#B6893F" : "#94A3B8", marginBottom:8, display:"flex", justifyContent:"center" }}>
                          {r === "Startup" ? <IconRocket /> : <IconBriefcase />}
                        </div>
                        <div style={{ fontWeight:700, fontSize:14, color: formData.role === r ? "#1E293B" : "#6B7280", fontFamily:"'DM Sans',sans-serif" }}>{r}</div>
                        <div style={{ fontSize:11, color:"#94A3B8", marginTop:2, fontFamily:"'DM Sans',sans-serif" }}>
                          {r === "Startup" ? "Chercher des experts" : "Proposer vos services"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Champs Expert */}
                {formData.role === "Expert" && (
                  <>
                    <Field label="Domaine d'expertise" icon={<IconBriefcase />} error={fieldErrors.domaine}>
                      <input className="inp-field" type="text" placeholder="Ex: Marketing, Finance, Tech…" value={formData.domaine} onChange={e => update("domaine", e.target.value)} style={inp("domaine")} />
                    </Field>
                    <div>
                      <label className="lbl">CV (PDF)</label>
                      <div className="upload-zone" onClick={() => fileRef.current?.click()} style={{
                        border:`1.5px dashed ${formData.cv ? "rgba(182,139,68,0.6)" : fieldErrors.cv ? "rgba(239,68,68,0.5)" : "#CBD5E1"}`,
                        borderRadius:10, padding:"20px 16px", textAlign:"center",
                        background: formData.cv ? "rgba(182,139,68,0.05)" : "#FAFAFA",
                      }}>
                        <input ref={fileRef} type="file" accept=".pdf" style={{ display:"none" }} onChange={e => { if (e.target.files?.[0]) update("cv", e.target.files[0]); }} />
                        {formData.cv ? (
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                            <IconCheckCircle color="#B6893F" />
                            <div style={{ textAlign:"left" }}>
                              <div style={{ fontWeight:700, color:"#1E293B", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>{formData.cv.name}</div>
                              <div style={{ fontSize:11, color:"#64748B", fontFamily:"'DM Sans',sans-serif" }}>Cliquer pour changer</div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ color:"#94A3B8", display:"flex", justifyContent:"center", marginBottom:8 }}><IconUpload /></div>
                            <div style={{ fontWeight:600, color:"#64748B", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>Glisser ou cliquer pour uploader</div>
                            <div style={{ fontSize:11, color:"#94A3B8", marginTop:3, fontFamily:"'DM Sans',sans-serif" }}>PDF uniquement · 5 Mo max</div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* ✅ Mot de passe simple */}
                <Field label="Mot de passe" icon={<IconLock />} error={fieldErrors.password}>
                  <input
                    className="inp-field"
                    type={showPwd ? "text" : "password"}
                    placeholder="Minimum 6 caractères"
                    value={formData.password}
                    onChange={e => update("password", e.target.value)}
                    style={inp("password", true)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPwd(p => !p)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#CBD5E1", cursor:"pointer", padding:4, display:"flex" }}>
                    <IconEye open={showPwd} />
                  </button>
                </Field>

                {/* ✅ Confirmer mot de passe */}
                <Field label="Confirmer le mot de passe" icon={<IconLock />} error={fieldErrors.confirmPassword}>
                  <input
                    className="inp-field"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Répétez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={e => update("confirmPassword", e.target.value)}
                    style={inp("confirmPassword", true)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(p => !p)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#CBD5E1", cursor:"pointer", padding:4, display:"flex" }}>
                    <IconEye open={showConfirm} />
                  </button>
                  {formData.confirmPassword && !fieldErrors.confirmPassword && (
                    <div style={{ position:"absolute", right:42, top:"50%", transform:"translateY(-50%)" }}>
                      {formData.password === formData.confirmPassword
                        ? <IconCheckCircle color="#B6893F" />
                        : <IconX color="#EF4444" />}
                    </div>
                  )}
                </Field>

                {/* CGU */}
                <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer" }}>
                  <input type="checkbox" required style={{ width:15, height:15, marginTop:2, flexShrink:0, accentColor:"#B6893F", cursor:"pointer" }} />
                  <span style={{ fontSize:13, color:"#64748B", lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>
                    J&apos;accepte les{" "}
                    <a href="#" style={{ color:"#B6893F", fontWeight:600, textDecoration:"none" }}>Conditions d&apos;utilisation</a>
                    {" "}et la{" "}
                    <a href="#" style={{ color:"#B6893F", fontWeight:600, textDecoration:"none" }}>Politique de confidentialité</a>
                  </span>
                </label>

                {/* Boutons */}
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:4 }}>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? <div className="spinner" /> : <><IconCheckCircle color="#0F1923" /> Créer mon compte</>}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                    ← Retour
                  </button>
                </div>

              </form>
            )}

            <div style={{ display:"flex", alignItems:"center", gap:14, margin:"24px 0 0" }}>
              <div style={{ flex:1, height:1, background:"#E2E8F0" }} />
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#94A3B8", letterSpacing:"0.1em", textTransform:"uppercase" }}>ou</span>
              <div style={{ flex:1, height:1, background:"#E2E8F0" }} />
            </div>

            <p style={{ textAlign:"center", marginTop:16, fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:"#64748B" }}>
              Déjà un compte ?{" "}
              <Link href="/connexion" style={{ color:"#B6893F", fontWeight:600, textDecoration:"none" }}>Se connecter</Link>
            </p>

          </div>

          <div style={{ textAlign:"center", marginTop:20, fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"#94A3B8", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
            <IconShield /> Données protégées — conformité RGPD
          </div>
        </div>
      </main>
    </div>
  );
}