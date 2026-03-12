"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconMessage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function DashboardExpert() {
  const [user, setUser]     = useState<any>(null);
  const [valide, setValide] = useState<boolean | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { window.location.href = '/connexion'; return; }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'expert') { window.location.href = '/dashboard/startup'; return; }
    setUser(parsed);

    // ✅ Vérifie le statut de validation depuis le backend
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:3001/experts/moi', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      setValide(data.valide === true || data.valide === 1);
    })
    .catch(() => setValide(false));
  }, []);

  function logout() {
    localStorage.clear();
    window.location.href = '/';
  }

  if (!user) return null;

  const menuItems = [
    { href: "/dashboard/expert/profil", icon: <IconUser />, titre: "Mon Profil", desc: "Gérez vos informations et portfolio", bg: "rgba(182,139,68,0.08)", color: "#B6893F", badge: "Compléter", badgeColor: "#F59E0B" },
    { href: "/dashboard/expert/disponibilites", icon: <IconCalendar />, titre: "Disponibilités", desc: "Gérez votre agenda et créneaux", bg: "rgba(59,130,246,0.08)", color: "#3B82F6", badge: null, badgeColor: "" },
    { href: "/dashboard/expert/messages", icon: <IconMessage />, titre: "Messages", desc: "Consultez vos demandes clients", bg: "rgba(16,185,129,0.08)", color: "#10B981", badge: "3 nouveaux", badgeColor: "#10B981" },
    { href: "/dashboard/expert/statistiques", icon: <IconChart />, titre: "Statistiques", desc: "Suivez vos performances", bg: "rgba(139,92,246,0.08)", color: "#8B5CF6", badge: null, badgeColor: "" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#EBF1FA 0%,#F4F7FB 40%,#EEF3F9 70%,#E8EFF8 100%)", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .aurora { position:fixed; inset:0; pointer-events:none; overflow:hidden; z-index:0; }
        .aurora::before { content:''; position:absolute; width:700px; height:700px; top:-200px; right:-150px; background:radial-gradient(ellipse,rgba(182,139,68,0.06) 0%,transparent 70%); border-radius:50%; animation:drift 18s ease-in-out infinite alternate; }
        .aurora::after { content:''; position:absolute; width:500px; height:500px; bottom:-100px; left:-80px; background:radial-gradient(ellipse,rgba(59,130,246,0.07) 0%,transparent 70%); border-radius:50%; animation:drift 22s ease-in-out infinite alternate-reverse; }
        @keyframes drift { from{transform:translate(0,0);} to{transform:translate(30px,20px);} }
        .grid-overlay { position:fixed; inset:0; pointer-events:none; z-index:0; background-image:linear-gradient(rgba(30,64,175,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(30,64,175,0.03) 1px,transparent 1px); background-size:60px 60px; }
        .card { background:rgba(255,255,255,0.85); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.9); border-radius:16px; transition:all .25s; cursor:pointer; text-decoration:none; display:block; }
        .card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(30,64,175,0.10); }
        .stat-card { background:rgba(255,255,255,0.85); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,0.9); border-radius:14px; padding:20px 24px; }
        .btn-logout { background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); color:white; border-radius:10px; padding:8px 16px; cursor:pointer; display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; transition:all .2s; font-family:'DM Sans',sans-serif; }
        .btn-logout:hover { background:rgba(255,255,255,0.25); }
        .badge-attente { display:inline-flex; align-items:center; gap:6px; background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.3); color:#D97706; border-radius:20px; padding:5px 14px; font-size:12px; font-weight:600; }
        .badge-valide { display:inline-flex; align-items:center; gap:6px; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); color:#059669; border-radius:20px; padding:5px 14px; font-size:12px; font-weight:600; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .loading-dot { animation:pulse 1.5s ease-in-out infinite; }
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
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Espace Expert</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: 8, color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>
            <IconBell />
          </button>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
            Bonjour, <strong style={{ color: "white" }}>{user.prenom} {user.nom}</strong>
          </span>
          <button onClick={logout} className="btn-logout">
            <IconLogout /> Déconnexion
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 10 }}>

        {/* ✅ BANNIÈRE STATUT CHARGEMENT */}
        {valide === null && (
          <div style={{ background: "rgba(255,255,255,0.5)", border: "1px solid #E2E8F0", borderRadius: 14, padding: "16px 24px", marginBottom: 24 }}>
            <span className="loading-dot" style={{ fontSize: 13, color: "#94A3B8" }}>⏳ Vérification du statut...</span>
          </div>
        )}

        {/* ✅ BANNIÈRE VALIDÉ */}
        {valide === true && (
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 14, padding: "18px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, color: "#059669", fontSize: 15, marginBottom: 3 }}>
                Profil validé par l'admin
              </div>
              <div style={{ fontSize: 13, color: "#64748B" }}>
                Félicitations ! Vous êtes maintenant visible par tous les clients sur la plateforme.
              </div>
            </div>
          </div>
        )}

        {/* ✅ BANNIÈRE EN ATTENTE */}
        {valide === false && (
          <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "18px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>⏳</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#D97706", fontSize: 15, marginBottom: 3 }}>
                Profil en attente de validation
              </div>
              <div style={{ fontSize: 13, color: "#64748B" }}>
                Complétez votre profil pour accélérer la validation. Une fois validé, vous serez visible par les clients.
              </div>
            </div>
            <Link href="/dashboard/expert/profil" style={{ flexShrink: 0, background: "linear-gradient(135deg,#C9A84C,#B6893F)", color: "#0F1923", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
              <IconCheck /> Compléter
            </Link>
          </div>
        )}

        {/* BIENVENUE */}
        <div style={{ background: "linear-gradient(135deg,#1E293B,#0F172A)", borderRadius: 20, padding: "32px 36px", marginBottom: 32, color: "white", border: "1px solid rgba(182,139,68,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div style={{ width: 48, height: 48, background: "rgba(182,139,68,0.2)", border: "1px solid rgba(182,139,68,0.4)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 18, color: "#C9A84C" }}>
                    {user.prenom?.[0]}{user.nom?.[0]}
                  </span>
                </div>
                <div>
                  <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 600, margin: 0 }}>
                    Bonjour, {user.prenom} {user.nom}
                  </h1>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>{user.email}</p>
                </div>
              </div>
              {/* ✅ Badge dynamique */}
              {valide === true && <span className="badge-valide">✅ Profil validé</span>}
              {valide === false && <span className="badge-attente">⏳ En attente de validation</span>}
            </div>
            <Link href="/dashboard/expert/profil" style={{ background: "linear-gradient(135deg,#C9A84C,#B6893F)", color: "#0F1923", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans',sans-serif" }}>
              {valide ? "Modifier mon profil" : "Compléter mon profil"} <IconArrow />
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Rendez-vous", value: "0", icon: "📅", color: "#3B82F6" },
            { label: "Messages reçus", value: "0", icon: "📩", color: "#10B981" },
            { label: "Avis clients", value: "0", icon: "⭐", color: "#F59E0B" },
            { label: "Note moyenne", value: "—", icon: "📊", color: "#8B5CF6" },
          ].map((stat, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, fontFamily: "'Cormorant Garamond',serif" }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* MENU CARDS */}
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: "#1E293B", marginBottom: 20 }}>
          Mon espace
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {menuItems.map((item, i) => (
            <Link key={i} href={item.href} className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", color: item.color }}>
                  {item.icon}
                </div>
                {item.badge && (
                  <span style={{ background: `${item.badgeColor}18`, color: item.badgeColor, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, border: `1px solid ${item.badgeColor}30` }}>
                    {item.badge}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>{item.titre}</h3>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>{item.desc}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, color: item.color, fontSize: 13, fontWeight: 600 }}>
                Accéder <IconArrow />
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}