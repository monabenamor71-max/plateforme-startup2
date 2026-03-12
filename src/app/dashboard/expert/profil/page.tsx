"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

/* ══════════════════════════════════════
   ICONS
══════════════════════════════════════ */
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconSave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconBriefcase = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconDollar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

/* ══════════════════════════════════════
   FIELD COMPONENT
══════════════════════════════════════ */
function Field({ label, icon, children, hint }: {
  label: string; icon?: React.ReactNode;
  children: React.ReactNode; hint?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", letterSpacing: "0.10em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
        {icon} {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "#94A3B8", fontFamily: "'DM Sans',sans-serif" }}>{hint}</p>}
    </div>
  );
}

/* ══════════════════════════════════════
   PAGE
══════════════════════════════════════ */
export default function ProfilExpert() {
  const [user, setUser]       = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const [profil, setProfil] = useState({
    domaine:      "",
    description:  "",
    experience:   "",
    localisation: "",
    tarif:        "",
    disponible:   true,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '/connexion';
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'expert') {
      window.location.href = '/dashboard/startup';
      return;
    }
    setUser(parsed);
    if (parsed.domaine) setProfil(p => ({ ...p, domaine: parsed.domaine }));
  }, []);

  function update(field: string, value: string | boolean) {
    setProfil(prev => ({ ...prev, [field]: value }));
    setError("");
    setSuccess(false);
  }

  function logout() {
    localStorage.clear();
    window.location.href = '/';
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    // Validations
    if (!profil.domaine.trim())     { setError("Le domaine est obligatoire."); return; }
    if (!profil.description.trim()) { setError("La description est obligatoire."); return; }
    if (!profil.tarif.trim())       { setError("Le tarif est obligatoire."); return; }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token');

      // ✅ Token manquant — afficher erreur sans rediriger
      if (!token) {
        setError("Session expirée. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/experts/profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profil),
      });

      // ✅ Erreur HTTP
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        console.error('Erreur backend:', response.status, result);
        setError(`Erreur ${response.status} : ${result.message || 'Veuillez réessayer.'}`);
        setLoading(false);
        return;
      }

      // ✅ Succès — rester sur la page
      console.log('Profil sauvegardé avec succès');
      setSuccess(true);
      setLoading(false);

      // Scroll vers le haut pour voir le message
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('Erreur réseau:', err);
      setError("Impossible de contacter le serveur. Vérifiez que le backend est lancé.");
      setLoading(false);
    }
  }

  if (!user) return null;

  const inputStyle = (hasError = false): React.CSSProperties => ({
    fontFamily: "'DM Sans',sans-serif",
    width: "100%",
    padding: "13px 16px",
    background: "#F8FAFC",
    border: `1.5px solid ${hasError ? "rgba(239,68,68,0.5)" : "#E2E8F0"}`,
    borderRadius: 10,
    fontSize: 14,
    color: "#1E293B",
    outline: "none",
    transition: "all .22s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#EBF1FA 0%,#F4F7FB 40%,#EEF3F9 70%,#E8EFF8 100%)", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .aurora { position:fixed; inset:0; pointer-events:none; overflow:hidden; z-index:0; }
        .aurora::before { content:''; position:absolute; width:700px; height:700px; top:-200px; right:-150px; background:radial-gradient(ellipse,rgba(182,139,68,0.06) 0%,transparent 70%); border-radius:50%; animation:drift 18s ease-in-out infinite alternate; }
        .aurora::after { content:''; position:absolute; width:500px; height:500px; bottom:-100px; left:-80px; background:radial-gradient(ellipse,rgba(59,130,246,0.07) 0%,transparent 70%); border-radius:50%; animation:drift 22s ease-in-out infinite alternate-reverse; }
        @keyframes drift { from{transform:translate(0,0);} to{transform:translate(30px,20px);} }
        .grid-overlay { position:fixed; inset:0; pointer-events:none; z-index:0; background-image:linear-gradient(rgba(30,64,175,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(30,64,175,0.03) 1px,transparent 1px); background-size:60px 60px; }
        .card { background:rgba(255,255,255,0.88); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.95); border-radius:18px; box-shadow:0 4px 24px rgba(30,64,175,0.07); }
        .inp { transition: border-color .22s, box-shadow .22s, background .22s; }
        .inp:focus { border-color:rgba(182,139,68,0.6) !important; box-shadow:0 0 0 3px rgba(182,139,68,0.10) !important; background:white !important; outline:none; }
        .btn-save { font-family:'DM Sans',sans-serif; background:linear-gradient(135deg,#C9A84C,#B6893F); color:#0F1923; border:none; border-radius:10px; padding:14px 28px; font-size:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; letter-spacing:0.06em; text-transform:uppercase; transition:all .2s; box-shadow:0 6px 20px rgba(182,139,68,0.25); }
        .btn-save:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 28px rgba(182,139,68,0.35); }
        .btn-save:disabled { opacity:.6; cursor:not-allowed; }
        .btn-logout { background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); color:white; border-radius:10px; padding:8px 16px; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; transition:all .2s; font-family:'DM Sans',sans-serif; }
        .btn-logout:hover { background:rgba(255,255,255,0.25); }
        @keyframes spin { to{transform:rotate(360deg);} }
        .spinner { width:16px; height:16px; border:2px solid rgba(15,25,35,0.3); border-top-color:#0F1923; border-radius:50%; animation:spin .7s linear infinite; }
        textarea { resize:vertical; min-height:100px; }
        select { appearance:none; cursor:pointer; }
      `}</style>

      <div className="aurora" />
      <div className="grid-overlay" />

      {/* HEADER */}
      <header style={{ background: "linear-gradient(135deg,#1E293B,#0F172A)", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 20px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 38, height: 38, border: "1px solid rgba(182,139,68,0.5)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(182,139,68,0.1)" }}>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 14, color: "#C9A84C" }}>BEH</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 16, color: "white" }}>Business Expert Hub</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Mon Profil</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            <strong style={{ color: "white" }}>{user.prenom} {user.nom}</strong>
          </span>
          <button onClick={logout} className="btn-logout">
            <IconLogout /> Déconnexion
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "36px 24px", position: "relative", zIndex: 10 }}>

        {/* RETOUR */}
        <Link href="/dashboard/expert" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.9)", borderRadius: 10, padding: "9px 16px", color: "#1E293B", textDecoration: "none", fontSize: 13, fontWeight: 600, marginBottom: 24, backdropFilter: "blur(10px)" }}>
          <IconArrowLeft /> Retour au dashboard
        </Link>

        {/* TITRE */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 600, color: "#1E293B", marginBottom: 6 }}>
            Mon Profil Expert
          </h1>
          <p style={{ color: "#64748B", fontSize: 14 }}>
            Complétez votre profil pour être visible par les clients et accélérer votre validation.
          </p>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ✅ Message Succès */}
          {success && (
            <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, color: "#059669" }}>
              <div style={{ width: 32, height: 32, background: "rgba(16,185,129,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <IconCheck />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Profil sauvegardé avec succès ✅</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Vos informations ont été mises à jour dans la base de données.</div>
              </div>
            </div>
          )}

          {/* ❌ Message Erreur */}
          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", color: "#DC2626", fontSize: 13, fontWeight: 600 }}>
              ❌ {error}
            </div>
          )}

          {/* INFOS PERSONNELLES */}
          <div className="card" style={{ padding: "28px 32px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, color: "#1E293B", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #F1F5F9" }}>
              Informations personnelles
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Nom" icon={<IconUser />}>
                <input
                  className="inp" type="text" value={user.nom} disabled
                  style={{ ...inputStyle(), background: "#F1F5F9", color: "#94A3B8", cursor: "not-allowed" }}
                />
              </Field>
              <Field label="Prénom" icon={<IconUser />}>
                <input
                  className="inp" type="text" value={user.prenom} disabled
                  style={{ ...inputStyle(), background: "#F1F5F9", color: "#94A3B8", cursor: "not-allowed" }}
                />
              </Field>
            </div>
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 10 }}>
              ℹ️ Ces informations sont liées à votre compte et ne peuvent pas être modifiées ici.
            </p>
          </div>

          {/* PROFIL PROFESSIONNEL */}
          <div className="card" style={{ padding: "28px 32px" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, color: "#1E293B", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #F1F5F9" }}>
              Profil professionnel
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              <Field label="Domaine d'expertise *" icon={<IconBriefcase />} hint="Ex: Marketing Digital, Finance, Tech, RH...">
                <input
                  className="inp" type="text"
                  placeholder="Ex: Marketing Digital"
                  value={profil.domaine}
                  onChange={e => update("domaine", e.target.value)}
                  style={inputStyle(!profil.domaine && !!error)}
                />
              </Field>

              <Field label="Description / À propos *" icon={<IconUser />} hint="Présentez-vous en quelques lignes">
                <textarea
                  className="inp"
                  placeholder="Décrivez votre expérience, vos compétences et ce que vous pouvez apporter aux startups..."
                  value={profil.description}
                  onChange={e => update("description", e.target.value)}
                  style={{ ...inputStyle(!profil.description && !!error), padding: "13px 16px", minHeight: 120 }}
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Années d'expérience" icon={<IconClock />}>
                  <select
                    className="inp"
                    value={profil.experience}
                    onChange={e => update("experience", e.target.value)}
                    style={{ ...inputStyle(), paddingRight: 16 }}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="1-2 ans">1-2 ans</option>
                    <option value="3-5 ans">3-5 ans</option>
                    <option value="5-8 ans">5-8 ans</option>
                    <option value="8-12 ans">8-12 ans</option>
                    <option value="12+ ans">12+ ans</option>
                  </select>
                </Field>
                <Field label="Localisation" icon={<IconMapPin />}>
                  <input
                    className="inp" type="text"
                    placeholder="Ex: Tunis, Sfax..."
                    value={profil.localisation}
                    onChange={e => update("localisation", e.target.value)}
                    style={inputStyle()}
                  />
                </Field>
              </div>

              <Field label="Tarif horaire *" icon={<IconDollar />} hint="Ex: 150 DT/h ou 200 DT/h">
                <input
                  className="inp" type="text"
                  placeholder="Ex: 150 DT/h"
                  value={profil.tarif}
                  onChange={e => update("tarif", e.target.value)}
                  style={inputStyle(!profil.tarif && !!error)}
                />
              </Field>

              {/* Disponibilité */}
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "#64748B", letterSpacing: "0.10em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif", display: "block", marginBottom: 10 }}>
                  Disponibilité
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { value: true,  label: "✅ Disponible",     desc: "Je suis disponible pour de nouvelles missions" },
                    { value: false, label: "❌ Non disponible", desc: "Je ne prends pas de nouvelles missions" },
                  ].map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => update("disponible", opt.value)}
                      style={{
                        flex: 1,
                        border: `1.5px solid ${profil.disponible === opt.value ? "rgba(182,139,68,0.6)" : "#E2E8F0"}`,
                        borderRadius: 12, padding: "14px 16px", cursor: "pointer",
                        background: profil.disponible === opt.value ? "rgba(182,139,68,0.06)" : "#FAFAFA",
                        transition: "all .2s",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1E293B", marginBottom: 4 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* BOUTONS */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 40 }}>
            <Link href="/dashboard/expert" style={{ background: "transparent", color: "#64748B", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "13px 24px", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center" }}>
              Annuler
            </Link>
            <button type="submit" disabled={loading} className="btn-save">
              {loading ? <div className="spinner" /> : <><IconSave /> Sauvegarder le profil</>}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}