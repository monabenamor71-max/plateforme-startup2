"use client";
import { useEffect, useState } from "react";

const IconUsers = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
const IconExpert = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>);
const IconStats = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>);
const IconCheck = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
const IconX = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const IconTrash = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>);
const IconLogout = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const IconSearch = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>);
const IconRefresh = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>);
const IconEye = () => (<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
const IconClose = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);

export default function DashboardAdmin() {
  const [user, setUser]             = useState<any>(null);
  const [activeTab, setActiveTab]   = useState<"stats"|"users"|"experts">("stats");
  const [users, setUsers]           = useState<any[]>([]);
  const [experts, setExperts]       = useState<any[]>([]);
  const [stats, setStats]           = useState<any>(null);
  const [loading, setLoading]       = useState(false);
  const [msg, setMsg]               = useState({ text: "", type: "" });
  const [search, setSearch]         = useState("");
  const [filterRole, setFilterRole] = useState("tous");
  const [filterValide, setFilterValide] = useState("tous");
  const [modalUser, setModalUser]   = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { window.location.href = '/connexion'; return; }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'admin') { window.location.href = '/'; return; }
    setUser(parsed);
    loadStats();
  }, []);

  const token = () => localStorage.getItem('token');

  function showMsg(text: string, type = "success") {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3500);
  }

  async function loadStats() {
    try {
      const res = await fetch('http://localhost:3001/admin/stats', { headers: { 'Authorization': `Bearer ${token()}` } });
      setStats(await res.json());
    } catch {}
  }

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/admin/users', { headers: { 'Authorization': `Bearer ${token()}` } });
      setUsers(await res.json());
    } catch {}
    setLoading(false);
  }

  async function loadExperts() {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/admin/experts', { headers: { 'Authorization': `Bearer ${token()}` } });
      setExperts(await res.json());
    } catch {}
    setLoading(false);
  }

  async function validerExpert(id: number) {
    await fetch(`http://localhost:3001/admin/experts/${id}/valider`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token()}` } });
    showMsg("Expert validé ✅"); loadExperts(); loadStats();
  }

  async function refuserExpert(id: number) {
    await fetch(`http://localhost:3001/admin/experts/${id}/refuser`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token()}` } });
    showMsg("Expert refusé", "warning"); loadExperts();
  }

  async function supprimerUser(id: number, nom: string) {
    if (!confirm(`Supprimer ${nom} ? Cette action est irréversible.`)) return;
    await fetch(`http://localhost:3001/admin/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token()}` } });
    showMsg("Utilisateur supprimé"); loadUsers(); loadStats(); setModalUser(null);
  }

  async function toggleUser(id: number, isActive: boolean) {
    const route = isActive ? 'desactiver' : 'activer';
    await fetch(`http://localhost:3001/admin/users/${id}/${route}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token()}` } });
    showMsg(isActive ? "Utilisateur désactivé" : "Utilisateur activé ✅"); loadUsers();
  }

  function changeTab(tab: "stats"|"users"|"experts") {
    setActiveTab(tab); setSearch(""); setFilterRole("tous"); setFilterValide("tous");
    if (tab === "users") loadUsers();
    if (tab === "experts") loadExperts();
  }

  function logout() { localStorage.clear(); window.location.href = '/'; }

  const filteredUsers = users.filter(u => {
    const matchSearch = `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "tous" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const filteredExperts = experts.filter(e => {
    const matchSearch = `${e.domaine || ''} ${e.localisation || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchValide = filterValide === "tous" || (filterValide === "valide" ? e.valide : !e.valide);
    return matchSearch && matchValide;
  });

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#F0F4F8", fontFamily: "'DM Sans',sans-serif", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }

        .nav-item { display:flex; align-items:center; gap:12px; padding:12px 20px; color:rgba(255,255,255,0.5); font-size:13.5px; font-weight:500; cursor:pointer; transition:all .2s; border:none; background:none; width:100%; text-align:left; font-family:'DM Sans',sans-serif; border-left:3px solid transparent; border-radius:0 10px 10px 0; margin:1px 0; }
        .nav-item:hover { color:white; background:rgba(255,255,255,0.07); }
        .nav-item.active { color:#C9A84C; background:rgba(182,139,68,0.12); border-left-color:#C9A84C; }

        .card { background:white; border-radius:14px; box-shadow:0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04); }
        .stat-card { background:white; border-radius:14px; padding:22px; box-shadow:0 1px 3px rgba(0,0,0,0.05); transition:all .2s; }
        .stat-card:hover { transform:translateY(-2px); box-shadow:0 6px 24px rgba(0,0,0,0.08); }

        table { width:100%; border-collapse:collapse; }
        th { padding:12px 16px; text-align:left; font-size:11px; font-weight:700; color:#94A3B8; letter-spacing:0.08em; text-transform:uppercase; background:#F8FAFC; border-bottom:1px solid #E2E8F0; }
        td { padding:13px 16px; font-size:13px; color:#1E293B; border-bottom:1px solid #F1F5F9; vertical-align:middle; }
        tr:last-child td { border-bottom:none; }
        tr:hover td { background:#FAFBFD; }

        .badge { display:inline-flex; align-items:center; gap:4px; border-radius:20px; padding:3px 10px; font-size:11px; font-weight:700; }
        .bg { background:#ECFDF5; color:#059669; }
        .br { background:#FEF2F2; color:#DC2626; }
        .bo { background:#FFFBEB; color:#D97706; }
        .bb { background:#EFF6FF; color:#2563EB; }
        .bp { background:#F5F3FF; color:#7C3AED; }
        .bgr { background:#F1F5F9; color:#64748B; }

        .btn { font-family:'DM Sans',sans-serif; border-radius:8px; padding:7px 12px; font-size:12px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all .18s; border:1px solid transparent; white-space:nowrap; }
        .bs { background:#ECFDF5; color:#059669; border-color:#A7F3D0; }
        .bs:hover { background:#D1FAE5; }
        .bd { background:#FEF2F2; color:#DC2626; border-color:#FECACA; }
        .bd:hover { background:#FEE2E2; }
        .bw { background:#FFFBEB; color:#D97706; border-color:#FDE68A; }
        .bw:hover { background:#FEF3C7; }
        .bi { background:#EFF6FF; color:#2563EB; border-color:#BFDBFE; }
        .bi:hover { background:#DBEAFE; }
        .bghost { background:white; color:#64748B; border-color:#E2E8F0; }
        .bghost:hover { background:#F8FAFC; }

        .search-inp { font-family:'DM Sans',sans-serif; padding:10px 14px 10px 38px; border:1.5px solid #E2E8F0; border-radius:10px; font-size:13px; color:#1E293B; outline:none; background:white; width:250px; transition:all .2s; }
        .search-inp:focus { border-color:rgba(182,139,68,0.5); box-shadow:0 0 0 3px rgba(182,139,68,0.08); }

        .sel { font-family:'DM Sans',sans-serif; padding:10px 14px; border:1.5px solid #E2E8F0; border-radius:10px; font-size:13px; color:#1E293B; outline:none; background:white; cursor:pointer; }
        .sel:focus { border-color:rgba(182,139,68,0.5); }

        .ftab { font-family:'DM Sans',sans-serif; padding:8px 14px; border-radius:8px; font-size:12.5px; font-weight:600; cursor:pointer; border:1.5px solid #E2E8F0; transition:all .2s; background:white; color:#64748B; }
        .ftab:hover { border-color:#CBD5E1; color:#1E293B; }
        .ftab.factive { background:#1E293B; color:white; border-color:#1E293B; }

        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:100; display:flex; align-items:center; justify-content:center; padding:24px; backdrop-filter:blur(4px); }
        .modal { background:white; border-radius:18px; padding:28px; max-width:460px; width:100%; box-shadow:0 24px 60px rgba(0,0,0,0.2); }

        .avatar { display:flex; align-items:center; justify-content:center; font-weight:700; font-family:'DM Sans',sans-serif; flex-shrink:0; }

        @keyframes slideIn { from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
        .msg-anim { animation:slideIn .25s ease; }

        .btn-logout-side { font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:10px; color:rgba(255,255,255,0.45); font-size:13px; font-weight:500; background:none; border:none; cursor:pointer; padding:11px 14px; border-radius:10px; width:100%; transition:all .2s; }
        .btn-logout-side:hover { background:rgba(255,255,255,0.06); color:white; }
      `}</style>

      {/* ══════════ SIDEBAR ══════════ */}
      <aside style={{ width: 230, background: "linear-gradient(180deg,#0F172A 0%,#1E293B 100%)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40 }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 36, height: 36, border: "1px solid rgba(182,139,68,0.4)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(182,139,68,0.1)", flexShrink: 0 }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 13, color: "#C9A84C" }}>BEH</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 14, color: "white", lineHeight: 1.2 }}>Business Expert Hub</div>
              <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>Admin</div>
            </div>
          </div>
        </div>

        {/* Admin */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
          <div className="avatar" style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#C9A84C,#B6893F)", color: "#0F1923", fontSize: 12 }}>
            A
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>Admin BEH</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Administrateur</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 8px" }}>
          <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.22)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, padding: "6px 14px 8px" }}>
            Menu
          </div>
          <button className={`nav-item ${activeTab === "stats" ? "active" : ""}`} onClick={() => changeTab("stats")}>
            <IconStats /> Tableau de bord
          </button>
          <button className={`nav-item ${activeTab === "users" ? "active" : ""}`} onClick={() => changeTab("users")}>
            <IconUsers /> Utilisateurs
            {stats && <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: "2px 8px", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{stats.totalUsers}</span>}
          </button>
          <button className={`nav-item ${activeTab === "experts" ? "active" : ""}`} onClick={() => changeTab("experts")}>
            <IconExpert /> Experts
            {stats?.expertsEnAttente > 0 && <span style={{ marginLeft: "auto", background: "rgba(245,158,11,0.2)", borderRadius: 20, padding: "2px 8px", fontSize: 11, color: "#F59E0B" }}>{stats.expertsEnAttente}</span>}
          </button>
        </nav>

        {/* Logout */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={logout} className="btn-logout-side">
            <IconLogout /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN ══════════ */}
      <div style={{ marginLeft: 230, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* TOP BAR */}
        <header style={{ background: "white", padding: "14px 28px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 21, fontWeight: 600, color: "#1E293B" }}>
              {activeTab === "stats" && "Tableau de bord"}
              {activeTab === "users" && "Gestion des utilisateurs"}
              {activeTab === "experts" && "Gestion des experts"}
            </h1>
            <p style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 1 }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {(activeTab === "users" || activeTab === "experts") && (
            <button className="btn bghost" onClick={() => activeTab === "users" ? loadUsers() : loadExperts()}>
              <IconRefresh /> Actualiser
            </button>
          )}
        </header>

        <div style={{ padding: "24px 28px", flex: 1 }}>

          {/* MESSAGE */}
          {msg.text && (
            <div className="msg-anim" style={{ background: msg.type === "warning" ? "#FFFBEB" : "#ECFDF5", border: `1px solid ${msg.type === "warning" ? "#FDE68A" : "#A7F3D0"}`, color: msg.type === "warning" ? "#D97706" : "#059669", borderRadius: 10, padding: "12px 16px", marginBottom: 18, fontWeight: 600, fontSize: 13 }}>
              {msg.text}
            </div>
          )}

          {/* ══ STATS ══ */}
          {activeTab === "stats" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", gap: 14, marginBottom: 24 }}>
                {[
                  { label: "Total inscrits",   value: stats?.totalUsers      || 0, icon: "👥", color: "#3B82F6", bg: "#EFF6FF" },
                  { label: "Experts",          value: stats?.totalExperts    || 0, icon: "💼", color: "#B6893F", bg: "#FEF3C7" },
                  { label: "Startups",         value: stats?.totalStartups   || 0, icon: "🚀", color: "#10B981", bg: "#ECFDF5" },
                  { label: "Experts validés",  value: stats?.expertsValides  || 0, icon: "✅", color: "#059669", bg: "#ECFDF5" },
                  { label: "En attente",       value: stats?.expertsEnAttente || 0, icon: "⏳", color: "#D97706", bg: "#FFFBEB" },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 12 }}>{s.icon}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: "'Cormorant Garamond',serif", lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 5, fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="card" style={{ padding: 22 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 600, color: "#1E293B", marginBottom: 14 }}>Accès rapide</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <button className="btn bi" style={{ justifyContent: "flex-start", padding: "11px 14px", fontSize: 13 }} onClick={() => changeTab("users")}>
                      <IconUsers /> Gérer les utilisateurs
                    </button>
                    <button className="btn bw" style={{ justifyContent: "flex-start", padding: "11px 14px", fontSize: 13 }} onClick={() => changeTab("experts")}>
                      <IconExpert /> Valider les experts {stats?.expertsEnAttente > 0 && `(${stats.expertsEnAttente})`}
                    </button>
                  </div>
                </div>
                <div className="card" style={{ padding: 22 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 600, color: "#1E293B", marginBottom: 14 }}>Résumé</h3>
                  {[
                    { label: "Taux de validation", value: stats?.totalExperts > 0 ? `${Math.round((stats.expertsValides / stats.totalExperts) * 100)}%` : "0%", color: "#059669" },
                    { label: "Experts en attente", value: stats?.expertsEnAttente || 0, color: "#D97706" },
                    { label: "Total utilisateurs", value: stats?.totalUsers || 0, color: "#3B82F6" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? "1px solid #F1F5F9" : "none" }}>
                      <span style={{ fontSize: 13, color: "#64748B" }}>{item.label}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ USERS ══ */}
          {activeTab === "users" && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}><IconSearch /></span>
                  <input className="search-inp" placeholder="Rechercher un utilisateur..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="sel" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                  <option value="tous">Tous les rôles</option>
                  <option value="startup">Startup</option>
                  <option value="expert">Expert</option>
                  <option value="admin">Admin</option>
                </select>
                <span style={{ fontSize: 12.5, color: "#94A3B8" }}>{filteredUsers.length} résultat{filteredUsers.length > 1 ? "s" : ""}</span>
              </div>

              <div className="card" style={{ overflow: "hidden" }}>
                {loading ? (
                  <div style={{ padding: 48, textAlign: "center", color: "#94A3B8" }}>Chargement...</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table>
                      <thead><tr>
                        <th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Date</th><th>Actions</th>
                      </tr></thead>
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={u.id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div className="avatar" style={{ width: 34, height: 34, borderRadius: 9, background: u.role === 'admin' ? "#FEF2F2" : u.role === 'expert' ? "#EFF6FF" : "#ECFDF5", color: u.role === 'admin' ? "#DC2626" : u.role === 'expert' ? "#2563EB" : "#059669", fontSize: 12 }}>
                                  {u.prenom?.[0]}{u.nom?.[0]}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{u.prenom} {u.nom}</div>
                                  <div style={{ fontSize: 11, color: "#94A3B8" }}>#{u.id}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ color: "#64748B" }}>{u.email}</td>
                            <td><span className={`badge ${u.role === 'admin' ? 'br' : u.role === 'expert' ? 'bb' : 'bg'}`}>{u.role}</span></td>
                            <td><span className={`badge ${u.isActive ? 'bg' : 'bgr'}`}>{u.isActive ? '● Actif' : '● Inactif'}</span></td>
                            <td style={{ color: "#94A3B8", fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                            <td>
                              {u.role !== 'admin' ? (
                                <div style={{ display: "flex", gap: 5 }}>
                                  <button className="btn bi" onClick={() => setModalUser(u)}><IconEye /></button>
                                  <button className={`btn ${u.isActive ? 'bw' : 'bs'}`} onClick={() => toggleUser(u.id, u.isActive)}>
                                    {u.isActive ? '🔒' : '🔓'}
                                  </button>
                                  <button className="btn bd" onClick={() => supprimerUser(u.id, `${u.prenom} ${u.nom}`)}>
                                    <IconTrash />
                                  </button>
                                </div>
                              ) : <span style={{ fontSize: 11, color: "#CBD5E1" }}>Protégé</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredUsers.length === 0 && <div style={{ padding: 48, textAlign: "center", color: "#94A3B8" }}>Aucun utilisateur trouvé</div>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ EXPERTS ══ */}
          {activeTab === "experts" && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}><IconSearch /></span>
                  <input className="search-inp" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className={`ftab ${filterValide === 'tous' ? 'factive' : ''}`} onClick={() => setFilterValide('tous')}>Tous ({experts.length})</button>
                  <button className={`ftab ${filterValide === 'attente' ? 'factive' : ''}`} onClick={() => setFilterValide('attente')}>⏳ En attente ({experts.filter(e => !e.valide).length})</button>
                  <button className={`ftab ${filterValide === 'valide' ? 'factive' : ''}`} onClick={() => setFilterValide('valide')}>✅ Validés ({experts.filter(e => e.valide).length})</button>
                </div>
              </div>

              <div className="card" style={{ overflow: "hidden" }}>
                {loading ? (
                  <div style={{ padding: 48, textAlign: "center", color: "#94A3B8" }}>Chargement...</div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table>
                      <thead><tr>
                        <th>ID Expert</th><th>Domaine</th><th>Localisation</th><th>Tarif</th><th>Expérience</th><th>Statut</th><th>Actions</th>
                      </tr></thead>
                      <tbody>
                        {filteredExperts.map(e => (
                          <tr key={e.id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div className="avatar" style={{ width: 34, height: 34, borderRadius: 9, background: "#EFF6FF", color: "#2563EB", fontSize: 12 }}>#{e.id}</div>
                                <div style={{ fontSize: 11.5, color: "#64748B" }}>User #{e.user_id}</div>
                              </div>
                            </td>
                            <td><span style={{ fontWeight: 600 }}>{e.domaine || '—'}</span></td>
                            <td style={{ color: "#64748B" }}>{e.localisation || '—'}</td>
                            <td>{e.tarif ? <span className="badge bp">{e.tarif}</span> : <span style={{ color: "#CBD5E1", fontSize: 12 }}>—</span>}</td>
                            <td style={{ color: "#64748B" }}>{e.experience || '—'}</td>
                            <td><span className={`badge ${e.valide ? 'bg' : 'bo'}`}>{e.valide ? '✅ Validé' : '⏳ En attente'}</span></td>
                            <td>
                              {!e.valide ? (
                                <button className="btn bs" onClick={() => validerExpert(e.id)}><IconCheck /> Valider</button>
                              ) : (
                                <button className="btn bw" onClick={() => refuserExpert(e.id)}><IconX /> Refuser</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredExperts.length === 0 && <div style={{ padding: 48, textAlign: "center", color: "#94A3B8" }}>Aucun expert trouvé</div>}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ══ MODAL DÉTAILS USER ══ */}
      {modalUser && (
        <div className="modal-overlay" onClick={() => setModalUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 21, fontWeight: 600, color: "#1E293B" }}>Détails utilisateur</h2>
              <button onClick={() => setModalUser(null)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: "7px 8px", cursor: "pointer", color: "#64748B", display: "flex" }}><IconClose /></button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: "#F8FAFC", borderRadius: 12, marginBottom: 20 }}>
              <div className="avatar" style={{ width: 48, height: 48, borderRadius: 12, background: "#EFF6FF", color: "#2563EB", fontSize: 16 }}>
                {modalUser.prenom?.[0]}{modalUser.nom?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#1E293B" }}>{modalUser.prenom} {modalUser.nom}</div>
                <div style={{ fontSize: 13, color: "#64748B" }}>{modalUser.email}</div>
              </div>
              <span className={`badge ${modalUser.role === 'expert' ? 'bb' : 'bg'}`} style={{ marginLeft: "auto" }}>{modalUser.role}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { label: "ID",          value: `#${modalUser.id}` },
                { label: "Téléphone",   value: modalUser.tel || "Non renseigné" },
                { label: "Domaine",     value: modalUser.domaine || "Non renseigné" },
                { label: "Statut",      value: modalUser.isActive ? "✅ Actif" : "❌ Inactif" },
                { label: "Inscription", value: new Date(modalUser.createdAt).toLocaleDateString('fr-FR') },
              ].map((item, i, arr) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                  <span style={{ fontSize: 13, color: "#94A3B8" }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button className={`btn ${modalUser.isActive ? 'bw' : 'bs'}`} style={{ flex: 1, justifyContent: "center", padding: 12 }}
                onClick={() => { toggleUser(modalUser.id, modalUser.isActive); setModalUser(null); }}>
                {modalUser.isActive ? '🔒 Désactiver' : '🔓 Activer'}
              </button>
              <button className="btn bd" style={{ flex: 1, justifyContent: "center", padding: 12 }}
                onClick={() => supprimerUser(modalUser.id, `${modalUser.prenom} ${modalUser.nom}`)}>
                <IconTrash /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}