"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "experts" | "startups" | "users" | "temoignages";

const I = {
  experts:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  startups:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  users:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  temoignages: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  check:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  trash:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  eye:         () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  ban:         () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  logout:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  search:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  refresh:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  globe:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
};

function Avatar({ initials, size = 40 }: { initials: string; size?: number }) {
  const colors = ["#0A2540","#1D4ED8","#7C3AED","#059669","#DC2626","#D97706","#0891B2","#BE185D"];
  const bg = colors[(initials.charCodeAt(0)||0) % colors.length];
  return <div style={{ width:size, height:size, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:size*0.38, flexShrink:0 }}>{(initials||"?").toUpperCase()}</div>;
}

function Badge({ type }: { type: "valide"|"attente"|"refuse"|"actif"|"inactif" }) {
  const map = {
    valide:  { bg:"#ECFDF5", color:"#059669", border:"#A7F3D0", label:"Validé" },
    attente: { bg:"#FFFBEB", color:"#D97706", border:"#FDE68A", label:"En attente" },
    refuse:  { bg:"#FEF2F2", color:"#DC2626", border:"#FECACA", label:"Refusé" },
    actif:   { bg:"#EFF6FF", color:"#1D4ED8", border:"#BFDBFE", label:"Actif" },
    inactif: { bg:"#F9FAFB", color:"#6B7280", border:"#E5E7EB", label:"Inactif" },
  };
  const s = map[type];
  return <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:700 }}><span style={{ width:6, height:6, borderRadius:"50%", background:s.color, display:"inline-block" }} />{s.label}</span>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin]           = useState<any>(null);
  const [tab, setTab]               = useState<Tab>("experts");
  const [experts, setExperts]       = useState<any[]>([]);
  const [startups, setStartups]     = useState<any[]>([]);
  const [users, setUsers]           = useState<any[]>([]);
  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [toast, setToast]           = useState({ text:"", ok:true });
  const [modal, setModal]           = useState<any>(null);

  const tk      = () => localStorage.getItem("token") || "";
  const hdr     = () => ({ Authorization:`Bearer ${tk()}` });
  const hdrJson = () => ({ Authorization:`Bearer ${tk()}`, "Content-Type":"application/json" });

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { router.push("/connexion"); return; }
    const p = JSON.parse(u);
    if (p.role !== "admin") { router.push("/"); return; }
    setAdmin(p);
    loadAll();
  }, []);

  function notify(text: string, ok=true) {
    setToast({ text, ok });
    setTimeout(() => setToast({ text:"", ok:true }), 3500);
  }

  async function loadAll() {
    setLoading(true);
    await Promise.allSettled([fetchExperts(), fetchStartups(), fetchUsers(), fetchTemoignages()]);
    setLoading(false);
  }

  async function fetchExperts() {
    const r = await fetch("http://localhost:3001/admin/experts", { headers:hdr() });
    if (r.ok) setExperts(await r.json());
  }
  async function fetchStartups() {
    const r = await fetch("http://localhost:3001/admin/startups", { headers:hdr() }).catch(()=>null);
    if (r?.ok) setStartups(await r.json());
  }
  async function fetchUsers() {
    const r = await fetch("http://localhost:3001/admin/users", { headers:hdr() });
    if (r.ok) setUsers(await r.json());
  }
  async function fetchTemoignages() {
    // Route correcte : GET /temoignages (pas /admin/temoignages)
    const r = await fetch("http://localhost:3001/temoignages", { headers:hdr() });
    if (r.ok) {
      const d = await r.json();
      setTemoignages(Array.isArray(d) ? d : []);
    }
  }

  async function validerExpert(id: number) {
    const r = await fetch(`http://localhost:3001/admin/experts/${id}/valider`, { method:"PUT", headers:hdr() });
    r.ok ? notify("Expert validé ✅") : notify("Erreur", false);
    fetchExperts();
  }
  async function refuserExpert(id: number) {
    const r = await fetch(`http://localhost:3001/admin/experts/${id}/refuser`, { method:"PUT", headers:hdr() });
    r.ok ? notify("Expert retiré") : notify("Erreur", false);
    fetchExperts();
  }
  async function supprimerUser(id: number, nom: string) {
    if (!confirm(`Supprimer ${nom} ?`)) return;
    const r = await fetch(`http://localhost:3001/admin/users/${id}`, { method:"DELETE", headers:hdr() });
    r.ok ? notify("Utilisateur supprimé") : notify("Erreur", false);
    loadAll();
  }

  // Routes correctes pour témoignages : /temoignages/:id/valider etc.
  async function publierTemo(id: number) {
    const r = await fetch(`http://localhost:3001/temoignages/${id}/valider`, { method:"PUT", headers:hdr() });
    r.ok ? notify("Témoignage publié ✅") : notify("Erreur", false);
    fetchTemoignages();
  }
  async function refuserTemo(id: number) {
    const r = await fetch(`http://localhost:3001/temoignages/${id}/refuser`, { method:"PUT", headers:hdr() });
    r.ok ? notify("Témoignage refusé") : notify("Erreur", false);
    fetchTemoignages();
  }
  async function supprimerTemo(id: number) {
    if (!confirm("Supprimer ce témoignage ?")) return;
    const r = await fetch(`http://localhost:3001/temoignages/${id}`, { method:"DELETE", headers:hdr() });
    r.ok ? notify("Supprimé") : notify("Erreur", false);
    fetchTemoignages();
  }

  function ini(prenom?: string, nom?: string) {
    return ((prenom?.[0]||"")+(nom?.[0]||"")).toUpperCase() || "?";
  }

  const filteredExperts  = experts.filter(e => { const q=search.toLowerCase(); const m=!q||`${e.user?.prenom} ${e.user?.nom} ${e.domaine}`.toLowerCase().includes(q); const s=filterStatus==="tous"||(filterStatus==="valide"&&e.valide)||(filterStatus==="attente"&&!e.valide); return m&&s; });
  const filteredStartups = startups.filter(s => { const q=search.toLowerCase(); return !q||`${s.user?.prenom} ${s.user?.nom} ${s.secteur}`.toLowerCase().includes(q); });
  const filteredUsers    = users.filter(u => { const q=search.toLowerCase(); return !q||`${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(q); });
  const filteredTemos    = temoignages.filter(t => { const q=search.toLowerCase(); const m=!q||`${t.user?.prenom} ${t.user?.nom} ${t.texte}`.toLowerCase().includes(q); const s=filterStatus==="tous"||(filterStatus==="valide"&&t.statut==="valide")||(filterStatus==="attente"&&t.statut==="en_attente"); return m&&s; });

  const temoEnAttente    = temoignages.filter(t => t.statut==="en_attente").length;
  const expertsEnAttente = experts.filter(e => !e.valide).length;

  const tabs = [
    { id:"experts",     label:"Experts",      count:experts.length,    badge:expertsEnAttente>0?expertsEnAttente:null, icon:I.experts },
    { id:"startups",    label:"Startups",     count:startups.length,   badge:null, icon:I.startups },
    { id:"users",       label:"Utilisateurs", count:users.length,      badge:null, icon:I.users },
    { id:"temoignages", label:"Témoignages",  count:temoignages.length, badge:temoEnAttente>0?temoEnAttente:null, icon:I.temoignages },
  ];

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#F2F5F9", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Outfit',sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:44, height:44, border:"3px solid #F7B500", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 16px" }} />
        <p style={{ color:"#8A9AB5", fontSize:14 }}>Chargement…</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Outfit',sans-serif;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
        .fade{animation:fadeIn .3s ease;}
        .card{background:#fff;border:1px solid #E8EEF6;border-radius:16px;transition:transform .25s,box-shadow .25s,border-color .25s;}
        .card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(10,37,64,.08);border-color:rgba(247,181,0,.25);}
        .inp{background:#F7F9FC;border:1.5px solid #DDE4EF;border-radius:10px;padding:10px 14px;font-family:'Outfit',sans-serif;font-size:13.5px;color:#0A2540;outline:none;transition:border-color .18s,box-shadow .18s;}
        .inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.1);}
        .inp::placeholder{color:#B8C4D6;}
        .btn{font-family:'Outfit',sans-serif;font-weight:600;border:none;border-radius:9px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;padding:8px 14px;transition:all .18s;}
        .btn-green{background:#ECFDF5;color:#059669;} .btn-green:hover{background:#059669;color:#fff;}
        .btn-red{background:#FEF2F2;color:#DC2626;} .btn-red:hover{background:#DC2626;color:#fff;}
        .btn-amber{background:#FFFBEB;color:#D97706;} .btn-amber:hover{background:#D97706;color:#fff;}
        .btn-slate{background:#F1F5F9;color:#475569;} .btn-slate:hover{background:#475569;color:#fff;}
        .btn-primary{background:#0A2540;color:#fff;} .btn-primary:hover{background:#F7B500;color:#0A2540;}
        .btn-gold{background:#F7B500;color:#0A2540;} .btn-gold:hover{background:#e6a800;}
        .btn-outline-red{background:transparent;color:#DC2626;border:1.5px solid #FECACA;} .btn-outline-red:hover{background:#FEF2F2;}
        .tbl{width:100%;border-collapse:collapse;}
        .tbl th{background:#F7F9FC;color:#7D8FAA;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:12px 16px;text-align:left;border-bottom:1px solid #E8EEF6;}
        .tbl td{padding:13px 16px;border-bottom:1px solid #F1F5F9;font-size:13.5px;color:#374151;vertical-align:middle;}
        .tbl tr:last-child td{border-bottom:none;}
        .tbl tr:hover td{background:#FAFBFE;}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px);}
        .modal{background:#fff;border-radius:20px;width:100%;max-width:540px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(10,37,64,.2);}
        .temo-card{background:#fff;border:1px solid #E8EEF6;border-radius:14px;padding:20px 24px;transition:box-shadow .2s;}
        .temo-card:hover{box-shadow:0 4px 16px rgba(10,37,64,.07);}
      `}</style>

      {/* TOAST */}
      {toast.text && (
        <div className="fade" style={{ position:"fixed", top:24, right:24, zIndex:999, background:toast.ok?"#ECFDF5":"#FEF2F2", border:`1px solid ${toast.ok?"#A7F3D0":"#FECACA"}`, borderLeft:`3px solid ${toast.ok?"#059669":"#DC2626"}`, color:toast.ok?"#059669":"#DC2626", borderRadius:10, padding:"12px 18px", fontWeight:600, fontSize:13, boxShadow:"0 8px 24px rgba(0,0,0,.1)" }}>
          {toast.text}
        </div>
      )}

      {/* MODAL DÉTAIL */}
      {modal && (
        <div className="modal-bg" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding:"22px 28px", borderBottom:"1px solid #F1F5F9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <h3 style={{ fontSize:18, fontWeight:700, color:"#0A2540" }}>{modal._type==="expert"?"Profil expert":"Profil startup"}</h3>
              <button onClick={() => setModal(null)} className="btn btn-slate" style={{ padding:"6px 8px" }}>✕</button>
            </div>
            <div style={{ padding:"24px 28px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:22 }}>
                <Avatar initials={ini(modal.user?.prenom, modal.user?.nom)} size={56} />
                <div>
                  <div style={{ fontSize:18, fontWeight:700, color:"#0A2540" }}>{modal.user?.prenom} {modal.user?.nom}</div>
                  <div style={{ fontSize:13, color:"#8A9AB5", marginTop:3 }}>{modal.user?.email}</div>
                  {modal._type==="expert" && <div style={{ marginTop:6 }}><Badge type={modal.valide?"valide":"attente"} /></div>}
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {[
                  ["Téléphone", modal.user?.telephone||modal.user?.tel||"—"],
                  modal._type==="expert" ? ["Domaine", modal.domaine||"—"] : ["Secteur", modal.secteur||"—"],
                  modal._type==="expert" ? ["Expérience", modal.experience||"—"] : ["Taille", modal.taille||"—"],
                  modal._type==="expert" ? ["Localisation", modal.localisation||"—"] : null,
                  modal._type==="expert" ? ["Tarif", modal.tarif||"—"] : null,
                ].filter(Boolean).map(([k,v]:any) => (
                  <div key={k} style={{ display:"flex", gap:12 }}>
                    <span style={{ fontSize:11.5, fontWeight:700, color:"#7D8FAA", textTransform:"uppercase", letterSpacing:1, minWidth:110 }}>{k}</span>
                    <span style={{ fontSize:13.5, color:"#374151" }}>{v}</span>
                  </div>
                ))}
                {modal.description && (
                  <div>
                    <div style={{ fontSize:11.5, fontWeight:700, color:"#7D8FAA", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Description</div>
                    <div style={{ background:"#F7F9FC", borderRadius:10, padding:"12px 14px", fontSize:13.5, color:"#374151", lineHeight:1.7 }}>{modal.description}</div>
                  </div>
                )}
              </div>
              {modal._type==="expert" && (
                <div style={{ display:"flex", gap:10, marginTop:22 }}>
                  {!modal.valide
                    ? <button className="btn btn-green" style={{ flex:1, justifyContent:"center", padding:"11px" }} onClick={() => { validerExpert(modal.id); setModal(null); }}><I.check /> Valider</button>
                    : <button className="btn btn-amber" style={{ flex:1, justifyContent:"center", padding:"11px" }} onClick={() => { refuserExpert(modal.id); setModal(null); }}><I.ban /> Retirer</button>
                  }
                  <button className="btn btn-red" style={{ flex:1, justifyContent:"center", padding:"11px" }} onClick={() => { supprimerUser(modal.user?.id, `${modal.user?.prenom} ${modal.user?.nom}`); setModal(null); }}><I.trash /> Supprimer</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ minHeight:"100vh", background:"#F2F5F9", fontFamily:"'Outfit',sans-serif" }}>

        {/* HEADER */}
        <header style={{ background:"#0A2540", padding:"0 32px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(10,37,64,.3)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:36, height:36, background:"#F7B500", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:12, color:"#0A2540" }}>BEH</div>
            <div>
              <div style={{ color:"#fff", fontWeight:700, fontSize:15 }}>Espace Administrateur</div>
              <div style={{ color:"rgba(255,255,255,.35)", fontSize:11 }}>{admin?.email}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn" onClick={loadAll} style={{ background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.7)", border:"1px solid rgba(255,255,255,.12)" }}><I.refresh /> Actualiser</button>
            <button className="btn" onClick={() => { localStorage.clear(); router.push("/"); }} style={{ background:"rgba(255,255,255,.08)", color:"rgba(255,255,255,.7)", border:"1px solid rgba(255,255,255,.12)" }}><I.logout /> Déconnexion</button>
          </div>
        </header>

        <div style={{ maxWidth:1300, margin:"0 auto", padding:"28px 24px" }}>

          {/* STATS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
            {[
              { label:"Experts",      val:experts.length,      sub:`${expertsEnAttente} en attente`, color:"#3B82F6" },
              { label:"Startups",     val:startups.length,     sub:"inscrits",                       color:"#10B981" },
              { label:"Utilisateurs", val:users.length,        sub:"comptes",                        color:"#8B5CF6" },
              { label:"Témoignages",  val:temoEnAttente,       sub:"en attente de validation",       color:"#F7B500" },
            ].map((s,i) => (
              <div key={i} className="card" style={{ padding:"20px 22px" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#7D8FAA", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>{s.label}</div>
                <div style={{ fontSize:32, fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:12, color:"#8A9AB5", marginTop:6 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ONGLETS */}
          <div style={{ display:"flex", gap:6, background:"#fff", border:"1px solid #E8EEF6", borderRadius:14, padding:6, marginBottom:20 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id as Tab); setSearch(""); setFilterStatus("tous"); }} className="btn"
                style={{ flex:1, justifyContent:"center", padding:"10px 16px", background:tab===t.id?"#0A2540":"transparent", color:tab===t.id?"#fff":"#5C7090", borderRadius:10, fontWeight:tab===t.id?700:500 }}>
                <t.icon />
                <span>{t.label}</span>
                {t.badge && <span style={{ background:tab===t.id?"rgba(255,255,255,.2)":"#F1F5F9", color:tab===t.id?"#fff":"#7D8FAA", borderRadius:99, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{t.badge}</span>}
              </button>
            ))}
          </div>

          {/* FILTRES */}
          <div className="card" style={{ padding:"14px 18px", marginBottom:20, display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ position:"relative", flex:1 }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#B8C4D6" }}><I.search /></span>
              <input className="inp" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} style={{ width:"100%", paddingLeft:36 }} />
            </div>
            {(tab==="experts"||tab==="temoignages") && (
              <select className="inp" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ minWidth:160, cursor:"pointer" }}>
                <option value="tous">Tous les statuts</option>
                <option value="valide">Validés</option>
                <option value="attente">En attente</option>
              </select>
            )}
            <div style={{ fontSize:12, color:"#8A9AB5", whiteSpace:"nowrap" }}>
              <strong style={{ color:"#0A2540" }}>
                {tab==="experts"?filteredExperts.length:tab==="startups"?filteredStartups.length:tab==="users"?filteredUsers.length:filteredTemos.length}
              </strong> résultat(s)
            </div>
          </div>

          {/* ══ EXPERTS ══ */}
          {tab === "experts" && (
            <div className="fade" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
              {filteredExperts.length === 0
                ? <div className="card" style={{ padding:48, textAlign:"center", color:"#8A9AB5", gridColumn:"1/-1" }}>Aucun expert trouvé</div>
                : filteredExperts.map(ex => (
                  <div key={ex.id} className="card" style={{ padding:20 }}>
                    <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:14 }}>
                      <Avatar initials={ini(ex.user?.prenom, ex.user?.nom)} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:15, color:"#0A2540" }}>{ex.user?.prenom} {ex.user?.nom}</div>
                        <div style={{ fontSize:12.5, color:"#8A9AB5", marginTop:2 }}>{ex.domaine||"—"}</div>
                        <div style={{ marginTop:6 }}><Badge type={ex.valide?"valide":"attente"} /></div>
                      </div>
                    </div>
                    {ex.description && <p style={{ fontSize:13, color:"#6B7280", lineHeight:1.6, marginBottom:14, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{ex.description}</p>}
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
                      {ex.localisation && <span style={{ fontSize:11.5, color:"#8A9AB5", background:"#F7F9FC", border:"1px solid #E8EEF6", borderRadius:6, padding:"3px 8px" }}>📍 {ex.localisation}</span>}
                      {ex.tarif        && <span style={{ fontSize:11.5, color:"#8A9AB5", background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:6, padding:"3px 8px" }}>💰 {ex.tarif}</span>}
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      {!ex.valide
                        ? <button className="btn btn-green" style={{ flex:1, justifyContent:"center" }} onClick={() => validerExpert(ex.id)}><I.check /> Valider</button>
                        : <button className="btn btn-amber" style={{ flex:1, justifyContent:"center" }} onClick={() => refuserExpert(ex.id)}><I.ban /> Retirer</button>
                      }
                      <button className="btn btn-slate" onClick={() => setModal({...ex, _type:"expert"})}><I.eye /></button>
                      <button className="btn btn-red" onClick={() => supprimerUser(ex.user?.id, `${ex.user?.prenom} ${ex.user?.nom}`)}><I.trash /></button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* ══ STARTUPS ══ */}
          {tab === "startups" && (
            <div className="fade" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
              {filteredStartups.length === 0
                ? <div className="card" style={{ padding:48, textAlign:"center", color:"#8A9AB5", gridColumn:"1/-1" }}>Aucune startup</div>
                : filteredStartups.map(s => (
                  <div key={s.id} className="card" style={{ padding:20 }}>
                    <div style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:14 }}>
                      <Avatar initials={ini(s.user?.prenom, s.user?.nom)} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:15, color:"#0A2540" }}>{s.user?.prenom} {s.user?.nom}</div>
                        <div style={{ fontSize:12.5, color:"#8A9AB5", marginTop:2 }}>{s.secteur||"—"}</div>
                        {s.taille && <div style={{ fontSize:11.5, color:"#8A9AB5", marginTop:4 }}>👥 {s.taille}</div>}
                      </div>
                    </div>
                    <div style={{ fontSize:12.5, color:"#6B7280", marginBottom:14 }}>📧 {s.user?.email}</div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button className="btn btn-slate" style={{ flex:1, justifyContent:"center" }} onClick={() => setModal({...s, _type:"startup"})}><I.eye /> Voir</button>
                      <button className="btn btn-red" onClick={() => supprimerUser(s.user?.id, `${s.user?.prenom} ${s.user?.nom}`)}><I.trash /></button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* ══ UTILISATEURS ══ */}
          {tab === "users" && (
            <div className="fade card" style={{ overflow:"hidden" }}>
              <table className="tbl">
                <thead>
                  <tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0
                    ? <tr><td colSpan={5} style={{ textAlign:"center", padding:48, color:"#8A9AB5" }}>Aucun utilisateur</td></tr>
                    : filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <Avatar initials={ini(u.prenom, u.nom)} size={34} />
                            <span style={{ fontWeight:600, color:"#0A2540" }}>{u.prenom} {u.nom}</span>
                          </div>
                        </td>
                        <td style={{ color:"#6B7280" }}>{u.email}</td>
                        <td>
                          <span style={{ display:"inline-block", background:u.role==="admin"?"#EDE9FE":u.role==="expert"?"#EFF6FF":"#ECFDF5", color:u.role==="admin"?"#7C3AED":u.role==="expert"?"#1D4ED8":"#059669", borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{u.role}</span>
                        </td>
                        <td><Badge type={u.isActive?"actif":"inactif"} /></td>
                        <td>
                          <button className="btn btn-red" onClick={() => supprimerUser(u.id, `${u.prenom} ${u.nom}`)}><I.trash /> Supprimer</button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}

          {/* ══ TÉMOIGNAGES ══ */}
          {tab === "temoignages" && (
            <div className="fade">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:20, color:"#0A2540" }}>Gestion des témoignages</div>
                  <div style={{ fontSize:13, color:"#94A3B8", marginTop:3 }}>
                    {temoEnAttente} en attente — {temoignages.filter(t=>t.statut==="valide").length} publiés
                  </div>
                </div>
              </div>

              {filteredTemos.length === 0 ? (
                <div className="card" style={{ padding:64, textAlign:"center" }}>
                  <div style={{ fontWeight:700, color:"#0A2540", fontSize:18, marginBottom:8 }}>Aucun témoignage</div>
                  <div style={{ fontSize:14, color:"#94A3B8" }}>Les témoignages soumis apparaîtront ici.</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  {filteredTemos.map(t => {
                    const prenom = t.user?.prenom || "—";
                    const nom    = t.user?.nom    || "";
                    const isValide = t.statut === "valide";
                    const isAttente = t.statut === "en_attente";
                    return (
                      <div key={t.id} className="temo-card" style={{ borderLeft:`4px solid ${isValide?"#10B981":isAttente?"#F59E0B":"#EF4444"}` }}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                          <Avatar initials={ini(prenom, nom)} size={44} />
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, flexWrap:"wrap" }}>
                              <span style={{ fontWeight:700, fontSize:15, color:"#0A2540" }}>{prenom} {nom}</span>
                              <span style={{ fontSize:11.5, color:"#94A3B8" }}>{t.user?.role}</span>
                              <Badge type={isValide?"valide":isAttente?"attente":"refuse"} />
                              <span style={{ fontSize:11, color:"#94A3B8", marginLeft:"auto" }}>
                                {t.createdAt ? new Date(t.createdAt).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}) : ""}
                              </span>
                            </div>
                            <p style={{ fontSize:14, color:"#374151", lineHeight:1.75, fontStyle:"italic", background:"#F7F9FC", borderRadius:10, padding:"12px 16px", borderLeft:"3px solid #E8EEF6" }}>
                              "{t.texte}"
                            </p>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:8, marginTop:14, justifyContent:"flex-end" }}>
                          {isAttente && (
                            <button className="btn btn-green" onClick={() => publierTemo(t.id)} style={{ padding:"9px 18px" }}>
                              <I.check /> Publier sur le site
                            </button>
                          )}
                          {isValide && (
                            <span style={{ fontSize:12.5, color:"#059669", fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
                              <I.globe /> Publié sur la page d'accueil
                            </span>
                          )}
                          {isValide && (
                            <button className="btn btn-amber" onClick={() => refuserTemo(t.id)}>Dépublier</button>
                          )}
                          <button className="btn btn-red" onClick={() => supprimerTemo(t.id)} style={{ padding:"9px 14px" }}>
                            <I.trash /> Supprimer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}