"use client";
import { useEffect, useState } from "react";

type Tab = "dashboard" | "experts" | "messages" | "rendezvous" | "temoignage";

function Avatar({ name, size = 40, photo }: { name: string; size?: number; photo?: string }) {
  const ini = (name||"?").split(" ").map(w=>w[0]||"").join("").toUpperCase().slice(0,2)||"?";
  const palettes: [string,string][] = [
    ["#0A2540","#F7B500"],["#1e3a8a","#93c5fd"],["#14532d","#86efac"],
    ["#581c87","#d8b4fe"],["#7f1d1d","#fca5a5"],["#164e63","#67e8f9"],
  ];
  const [bg,fg] = palettes[(ini.charCodeAt(0)||0)%palettes.length];
  const [imgError, setImgError] = useState(false);
  if (photo && !imgError)
    return <img src={`http://localhost:3001/uploads/photos/${photo}`} alt={name} style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", flexShrink:0, border:"2px solid #E2EAF4" }} onError={()=>setImgError(true)} />;
  return <div style={{ width:size, height:size, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", color:fg, fontWeight:800, fontSize:size*0.35, flexShrink:0 }}>{ini}</div>;
}

function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string,[string,string]> = {
    en_attente:["#FFFBEB","#B45309"], confirme:["#ECFDF5","#065F46"],
    annule:["#FEF2F2","#991B1B"], disponible:["#ECFDF5","#065F46"], occupe:["#F9FAFB","#6B7280"],
  };
  const [bg,color] = map[statut]||map.en_attente;
  const labels: Record<string,string> = { en_attente:"En attente", confirme:"Confirmé", annule:"Annulé", disponible:"Disponible", occupe:"Occupé" };
  return <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:bg, color, borderRadius:99, padding:"4px 11px", fontSize:11, fontWeight:700 }}><span style={{ width:6, height:6, borderRadius:"50%", background:color, flexShrink:0 }}/>{labels[statut]||statut}</span>;
}

export default function DashboardStartup() {
  const [user,setUser]                       = useState<any>(null);
  const [startup,setStartup]                 = useState<any>(null);
  const [tab,setTab]                         = useState<Tab>("dashboard");
  const [experts,setExperts]                 = useState<any[]>([]);
  const [messages,setMessages]               = useState<any[]>([]);
  const [rdvs,setRdvs]                       = useState<any[]>([]);
  const [toast,setToast]                     = useState({ text:"", ok:true });
  const [selectedExpert,setSelectedExpert]   = useState<any>(null);
  const [newMsg,setNewMsg]                   = useState("");
  const [sending,setSending]                 = useState(false);
  const [searchExpert,setSearchExpert]       = useState("");
  const [temoText,setTemoText]               = useState("");
  const [sendingTemo,setSendingTemo]         = useState(false);
  const [temoSent,setTemoSent]               = useState(false);
  const [selectedConv,setSelectedConv]       = useState<any>(null);
  const [rdvModal,setRdvModal]               = useState(false);
  const [rdvExpert,setRdvExpert]             = useState<any>(null);
  const [rdvForm,setRdvForm]                 = useState({ date_rdv:"", heure:"", motif:"" });
  const [sendingRdv,setSendingRdv]           = useState(false);

  const tk      = () => localStorage.getItem("token")||"";
  const hdr     = () => ({ Authorization:`Bearer ${tk()}` });
  const hdrJson = () => ({ Authorization:`Bearer ${tk()}`, "Content-Type":"application/json" });

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { window.location.href="/connexion"; return; }
    const p = JSON.parse(u);
    if (p.role !== "startup") { window.location.href="/"; return; }
    setUser(p);
    loadAll();
    loadStartupProfile();
  }, []);

  function notify(text:string, ok=true) {
    setToast({text,ok});
    setTimeout(()=>setToast({text:"",ok:true}),3500);
  }

  async function loadAll() { loadExperts(); loadMessages(); loadRdvs(); }

  async function loadStartupProfile() {
    const r = await fetch("http://localhost:3001/startups/moi", { headers:hdr() }).catch(()=>null);
    if (r?.ok) setStartup(await r.json());
  }

  async function loadExperts() {
    const r = await fetch("http://localhost:3001/experts").catch(()=>null);
    if (r?.ok) setExperts(await r.json());
  }
  async function loadMessages() {
    const r = await fetch("http://localhost:3001/messages", { headers:hdr() }).catch(()=>null);
    if (r?.ok) setMessages(await r.json());
  }
  async function loadRdvs() {
    const r = await fetch("http://localhost:3001/rendez-vous/startup", { headers:hdr() }).catch(()=>null);
    if (r?.ok) setRdvs(await r.json());
  }

  function getExpertUserId(ex:any):number|null {
    if (ex.user?.id) return Number(ex.user.id);
    if (ex.user_id)  return Number(ex.user_id);
    return null;
  }
  function getExpertName(ex:any):string {
    const p = ex.user?.prenom||ex.prenom||"";
    const n = ex.user?.nom||ex.nom||"";
    return `${p} ${n}`.trim()||ex.domaine||"Expert";
  }

  async function envoyerMessage() {
    if (!newMsg.trim()) { notify("Écrivez un message",false); return; }
    if (!selectedExpert) { notify("Sélectionnez un expert",false); return; }
    const receiverId = getExpertUserId(selectedExpert);
    if (!receiverId) { notify("Identifiant expert introuvable",false); return; }
    setSending(true);
    const r = await fetch("http://localhost:3001/messages",{method:"POST",headers:hdrJson(),body:JSON.stringify({receiver_id:receiverId,contenu:newMsg})});
    if (r.ok) { notify("Message envoyé"); setNewMsg(""); await loadMessages(); }
    else { const e=await r.json().catch(()=>({})); notify(e.message||"Erreur",false); }
    setSending(false);
  }

  async function envoyerDepuisConv() {
    if (!newMsg.trim()||!selectedConv) return;
    setSending(true);
    const r = await fetch("http://localhost:3001/messages",{method:"POST",headers:hdrJson(),body:JSON.stringify({receiver_id:selectedConv.id,contenu:newMsg})});
    if (r.ok) { notify("Message envoyé"); setNewMsg(""); loadMessages(); }
    else notify("Erreur",false);
    setSending(false);
  }

  async function reserverRdv() {
    if (!rdvForm.date_rdv||!rdvForm.heure) { notify("Veuillez remplir la date et l'heure",false); return; }
    if (!rdvExpert) return;
    setSendingRdv(true);
    const r = await fetch("http://localhost:3001/rendez-vous",{method:"POST",headers:hdrJson(),body:JSON.stringify({expert_id:rdvExpert.id,date_rdv:rdvForm.date_rdv,heure:rdvForm.heure,motif:rdvForm.motif})});
    if (r.ok) { notify("Demande de rendez-vous envoyée"); setRdvModal(false); setRdvForm({date_rdv:"",heure:"",motif:""}); loadRdvs(); }
    else { const e=await r.json().catch(()=>({})); notify(e.message||"Erreur",false); }
    setSendingRdv(false);
  }

  async function envoyerTemoignage() {
    if (!temoText.trim()) return;
    setSendingTemo(true);
    const r = await fetch("http://localhost:3001/temoignages",{method:"POST",headers:hdrJson(),body:JSON.stringify({texte:temoText})});
    if (r.ok) { notify("Témoignage soumis pour validation ✅"); setTemoText(""); setTemoSent(true); }
    else { const e=await r.json().catch(()=>({})); notify(e.message||"Erreur",false); }
    setSendingTemo(false);
  }

  const conversations = messages.reduce((acc,m) => {
    if (!user) return acc;
    const otherId   = m.sender_id===user.id?m.receiver_id:m.sender_id;
    const otherUser = m.sender_id===user.id?m.receiver:m.sender;
    const otherName = `${otherUser?.prenom||""} ${otherUser?.nom||""}`.trim()||"Expert";
    if (!acc[otherId]) acc[otherId]={id:otherId,name:otherName,messages:[]};
    acc[otherId].messages.push(m);
    return acc;
  },{} as Record<number,any>);
  const convList = Object.values(conversations) as any[];

  const convMessages = selectedExpert
    ? messages.filter(m=>{const eid=getExpertUserId(selectedExpert);return (m.sender_id===user?.id&&m.receiver_id===eid)||(m.sender_id===eid&&m.receiver_id===user?.id);})
    : selectedConv
    ? messages.filter(m=>(m.sender_id===user?.id&&m.receiver_id===selectedConv.id)||(m.sender_id===selectedConv.id&&m.receiver_id===user?.id))
    : [];

  const filteredExperts = experts.filter(e=>{
    const q=searchExpert.toLowerCase();
    return !q||getExpertName(e).toLowerCase().includes(q)||(e.domaine||"").toLowerCase().includes(q);
  });

  const rdvActifs    = rdvs.filter(r=>r.statut!=="annule");
  const rdvAnnules   = rdvs.filter(r=>r.statut==="annule");
  const rdvEnAttente = rdvActifs.filter(r=>r.statut==="en_attente").length;

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Outfit',sans-serif;background:#EEF2F7;color:#1E293B;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(12px);}to{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        .fade{animation:fadeUp .4s cubic-bezier(.22,1,.36,1);}
        .card{background:#fff;border:1px solid #DDE5F0;border-radius:16px;box-shadow:0 2px 8px rgba(10,37,64,.04);}
        .btn{font-family:'Outfit',sans-serif;font-weight:700;border:none;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:all .2s;}
        .btn-primary{background:#0A2540;color:#fff;padding:11px 22px;font-size:13.5px;}
        .btn-primary:hover{background:#F7B500;color:#0A2540;transform:translateY(-2px);box-shadow:0 8px 20px rgba(10,37,64,.18);}
        .btn-accent{background:#F7B500;color:#0A2540;padding:11px 22px;font-size:13.5px;box-shadow:0 4px 14px rgba(247,181,0,.3);}
        .btn-accent:hover{background:#E6A800;transform:translateY(-2px);box-shadow:0 8px 24px rgba(247,181,0,.4);}
        .btn-outline{background:transparent;color:#475569;border:1.5px solid #DDE5F0;padding:10px 18px;font-size:13px;}
        .btn-outline:hover{background:#F7F9FC;border-color:#B8C8DC;}
        .btn-sm{padding:7px 14px!important;font-size:12px!important;}
        .btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important;box-shadow:none!important;}
        .nav-tab{font-family:'Outfit',sans-serif;background:none;border:none;cursor:pointer;padding:16px 4px;font-size:13.5px;font-weight:500;color:#94A3B8;border-bottom:2.5px solid transparent;transition:all .2s;white-space:nowrap;}
        .nav-tab.active{color:#0A2540;border-bottom-color:#F7B500;font-weight:700;}
        .nav-tab:hover:not(.active){color:#334155;}
        .field{width:100%;background:#F8FAFC;border:1.5px solid #DDE5F0;border-radius:10px;padding:12px 16px;font-family:'Outfit',sans-serif;font-size:14px;color:#0A2540;outline:none;transition:border-color .18s,box-shadow .18s,background .18s;}
        .field:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.12);background:#fff;}
        .field::placeholder{color:#B8C8DC;}
        textarea.field{resize:vertical;min-height:120px;line-height:1.7;}
        .lbl{font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;letter-spacing:1.2px;display:block;margin-bottom:7px;}
        .ex-card{background:#fff;border:1.5px solid #DDE5F0;border-radius:14px;padding:18px 20px;cursor:pointer;transition:all .22s cubic-bezier(.22,1,.36,1);}
        .ex-card:hover{border-color:#F7B500;box-shadow:0 8px 24px rgba(247,181,0,.14);transform:translateY(-3px);}
        .ex-card.sel{border-color:#F7B500;background:rgba(247,181,0,.025);}
        .bubble-me{background:#0A2540;color:#fff;border-radius:16px 16px 4px 16px;padding:11px 16px;font-size:13.5px;max-width:70%;word-break:break-word;line-height:1.55;box-shadow:0 4px 14px rgba(10,37,64,.22);}
        .bubble-other{background:#F1F5FB;color:#1E293B;border-radius:16px 16px 16px 4px;padding:11px 16px;font-size:13.5px;max-width:70%;word-break:break-word;line-height:1.55;border:1px solid #DDE5F0;}
        .conv-row{padding:14px 18px;cursor:pointer;border-bottom:1px solid #F1F5FB;transition:background .15s;}
        .conv-row:hover{background:#FAFBFE;}
        .conv-row.active{background:#FFFBEB;border-left:3px solid #F7B500;}
        .modal-overlay{position:fixed;inset:0;z-index:300;background:rgba(6,14,26,.65);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px;}
        .modal-box{background:#fff;border-radius:22px;width:100%;max-width:520px;box-shadow:0 32px 100px rgba(10,37,64,.28);overflow:hidden;animation:modalIn .32s cubic-bezier(.22,1,.36,1);}
        .rdv-card{background:#fff;border:1px solid #DDE5F0;border-radius:14px;padding:20px 24px;transition:box-shadow .2s,border-color .2s;}
        .rdv-card:hover{box-shadow:0 8px 28px rgba(10,37,64,.08);border-color:#C5D0DF;}
        .stat-card{background:#fff;border:1px solid #DDE5F0;border-radius:16px;padding:20px 22px;transition:box-shadow .2s,border-color .2s;}
        .stat-card:hover{box-shadow:0 6px 20px rgba(10,37,64,.07);border-color:rgba(247,181,0,.25);}
        .tag{display:inline-flex;align-items:center;font-size:11px;font-weight:600;padding:3px 9px;border-radius:6px;background:#F1F5FB;color:#475569;}
        .tag-gold{background:#FFFBEB;color:#B45309;}
        .tag-blue{background:#EFF6FF;color:#1D4ED8;}
        .profile-info-row{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:#F8FAFC;border:1px solid #EEF2F9;}
        .profile-info-label{font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:1px;min-width:80px;}
        .profile-info-value{font-size:13.5px;color:#0A2540;font-weight:600;}
      `}</style>

      {/* TOAST */}
      {toast.text && (
        <div className="fade" style={{ position:"fixed", top:24, right:24, zIndex:999, background:toast.ok?"#F0FDF4":"#FFF1F2", border:`1px solid ${toast.ok?"#BBF7D0":"#FECDD3"}`, borderLeft:`4px solid ${toast.ok?"#22C55E":"#F43F5E"}`, color:toast.ok?"#166534":"#9F1239", borderRadius:12, padding:"14px 22px", fontWeight:600, fontSize:13.5, boxShadow:"0 12px 36px rgba(0,0,0,.12)", minWidth:280 }}>
          {toast.text}
        </div>
      )}

      {/* MODAL RDV */}
      {rdvModal && rdvExpert && (
        <div className="modal-overlay" onClick={()=>setRdvModal(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div style={{ padding:"22px 28px", borderBottom:"1px solid #F1F5FB", display:"flex", alignItems:"center", justifyContent:"space-between", background:"linear-gradient(135deg,#FAFBFE,#F4F7FB)" }}>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:"#0A2540" }}>Demande de rendez-vous</div>
                <div style={{ fontSize:13, color:"#64748B", marginTop:4 }}>avec {getExpertName(rdvExpert)}</div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={()=>setRdvModal(false)}>Fermer</button>
            </div>
            <div style={{ padding:"16px 28px", borderBottom:"1px solid #F1F5FB", display:"flex", alignItems:"center", gap:14 }}>
              <Avatar name={getExpertName(rdvExpert)} size={52} photo={rdvExpert.photo} />
              <div>
                <div style={{ fontWeight:700, fontSize:16, color:"#0A2540" }}>{getExpertName(rdvExpert)}</div>
                <div style={{ fontSize:13, color:"#64748B", marginTop:3 }}>{rdvExpert.domaine}</div>
                {rdvExpert.tarif && <div style={{ fontSize:12.5, color:"#B45309", marginTop:5, fontWeight:600 }}>{rdvExpert.tarif}</div>}
              </div>
            </div>
            <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:18 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div><label className="lbl">Date *</label><input type="date" className="field" value={rdvForm.date_rdv} min={new Date().toISOString().split("T")[0]} onChange={e=>setRdvForm({...rdvForm,date_rdv:e.target.value})} /></div>
                <div><label className="lbl">Heure *</label><input type="time" className="field" value={rdvForm.heure} onChange={e=>setRdvForm({...rdvForm,heure:e.target.value})} /></div>
              </div>
              <div><label className="lbl">Objet de la réunion</label><textarea className="field" style={{ minHeight:90 }} placeholder="Décrivez les sujets à aborder…" value={rdvForm.motif} onChange={e=>setRdvForm({...rdvForm,motif:e.target.value})} /></div>
              <div style={{ background:"#F0F6FF", border:"1px solid #BFDBFE", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#1D4ED8" }}>Votre demande sera transmise à l'expert qui confirmera le créneau.</div>
            </div>
            <div style={{ padding:"16px 28px", borderTop:"1px solid #F1F5FB", display:"flex", justifyContent:"flex-end", gap:10, background:"#FAFBFE" }}>
              <button className="btn btn-outline" onClick={()=>setRdvModal(false)}>Annuler</button>
              <button className="btn btn-accent" onClick={reserverRdv} disabled={sendingRdv||!rdvForm.date_rdv||!rdvForm.heure}>
                {sendingRdv?<><div style={{ width:14, height:14, border:"2px solid rgba(10,37,64,.2)", borderTopColor:"#0A2540", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>Envoi…</>:"Envoyer la demande"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background:"#0A2540", height:64, padding:"0 36px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(10,37,64,.4)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ background:"#F7B500", borderRadius:9, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12, color:"#0A2540" }}>BEH</div>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:17, color:"#fff" }}>Business Expert Hub</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>
              Espace Startup — {user.prenom} {user.nom}
              {startup?.fonction && <span style={{ marginLeft:8, background:"rgba(247,181,0,.15)", color:"#F7B500", borderRadius:99, padding:"1px 8px", fontSize:10, fontWeight:700 }}>{startup.fonction}</span>}
            </div>
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={()=>{ localStorage.clear(); window.location.href="/"; }} style={{ color:"rgba(255,255,255,.65)", borderColor:"rgba(255,255,255,.15)", fontSize:12 }}>
          Déconnexion
        </button>
      </header>

      {/* NAVIGATION */}
      <div style={{ background:"#fff", borderBottom:"1px solid #DDE5F0" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 32px", display:"flex", gap:28 }}>
          {([
            { id:"dashboard",  label:"Tableau de bord" },
            { id:"experts",    label:"Trouver un expert" },
            { id:"messages",   label:"Messages",    badge:convList.length>0?convList.length:null },
            { id:"rendezvous", label:"Rendez-vous",  badge:rdvEnAttente>0?rdvEnAttente:null },
            { id:"temoignage", label:"Témoignage" },
          ] as any[]).map(t=>(
            <button key={t.id} className={`nav-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
              {t.label}
              {t.badge&&<span style={{ background:tab===t.id?"#F7B500":"#F0F4F8", color:tab===t.id?"#0A2540":"#64748B", borderRadius:99, padding:"1px 8px", fontSize:11, fontWeight:800, marginLeft:4 }}>{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth:1200, margin:"0 auto", padding:"32px" }}>

        {/* ══ TABLEAU DE BORD ══ */}
        {tab==="dashboard" && (
          <div className="fade">
            {/* Bannière avec fonction */}
            <div style={{ background:"linear-gradient(130deg,#0A2540 0%,#0f3464 55%,#1a4080 100%)", borderRadius:20, padding:"36px 40px", marginBottom:26, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-40, right:-40, width:240, height:240, borderRadius:"50%", background:"rgba(247,181,0,.05)", pointerEvents:"none" }}/>
              <div style={{ position:"relative", zIndex:2, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:20 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:800, letterSpacing:"3px", textTransform:"uppercase", color:"#F7B500", marginBottom:12 }}>Espace Startup</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(26px,3vw,38px)", fontWeight:700, color:"#fff", lineHeight:1.15, marginBottom:8 }}>
                    Bonjour, {user.prenom}
                  </div>
                  {/* Fonction affichée */}
                  {startup?.fonction && (
                    <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(247,181,0,.15)", border:"1px solid rgba(247,181,0,.3)", borderRadius:99, padding:"4px 14px", marginBottom:12 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:"#F7B500", letterSpacing:.5 }}>{startup.fonction}</span>
                    </div>
                  )}
                  <div style={{ fontSize:14.5, color:"rgba(255,255,255,.5)", lineHeight:1.7, maxWidth:480 }}>
                    Accédez aux meilleurs experts et réservez un rendez-vous pour accélérer votre croissance.
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <button className="btn btn-accent" onClick={()=>setTab("experts")} style={{ padding:"13px 26px" }}>Trouver un expert</button>
                  <button className="btn btn-outline" onClick={()=>setTab("rendezvous")} style={{ color:"rgba(255,255,255,.7)", borderColor:"rgba(255,255,255,.2)", padding:"13px 22px" }}>Mes rendez-vous</button>
                </div>
              </div>
            </div>

            {/* Profil rapide avec fonction */}
            {startup && (
              <div className="card" style={{ padding:"20px 24px", marginBottom:22, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
                <Avatar name={`${user.prenom} ${user.nom}`} size={52} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:17, color:"#0A2540", marginBottom:6 }}>{user.prenom} {user.nom}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {startup.fonction && <span className="tag tag-blue">💼 {startup.fonction}</span>}
                    {startup.secteur  && <span className="tag">🏢 {startup.secteur}</span>}
                    {startup.taille   && <span className="tag">👥 {startup.taille}</span>}
                    {user.email       && <span className="tag">📧 {user.email}</span>}
                    {user.telephone   && <span className="tag">📞 {user.telephone}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:26 }}>
              {[
                { label:"Experts disponibles", val:experts.filter(e=>e.disponible).length, color:"#2563EB" },
                { label:"Messages envoyés",    val:messages.filter(m=>m.sender_id===user?.id).length, color:"#059669" },
                { label:"Rendez-vous actifs",  val:rdvActifs.length, color:"#7C3AED" },
                { label:"Conversations",       val:convList.length, color:"#D97706" },
              ].map((s,i)=>(
                <div key={i} className="stat-card">
                  <div style={{ fontSize:36, fontWeight:800, color:s.color, lineHeight:1, marginBottom:10 }}>{s.val}</div>
                  <div style={{ fontSize:13.5, fontWeight:600, color:"#334155" }}>{s.label}</div>
                  <div style={{ height:3, borderRadius:99, background:"#EEF2F7", marginTop:12, overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:99, background:s.color, width:`${Math.min((s.val/10)*100,100)}%` }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Experts disponibles */}
            {experts.filter(e=>e.disponible).length>0 && (
              <div className="card" style={{ padding:"24px 28px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                  <div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:20, color:"#0A2540" }}>Experts disponibles</div>
                    <div style={{ fontSize:13, color:"#94A3B8", marginTop:3 }}>Prêts à accompagner votre projet</div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={()=>setTab("experts")}>Voir tous</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {experts.filter(e=>e.disponible).slice(0,4).map((ex,i)=>{
                    const name=getExpertName(ex);
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderRadius:12, background:"#F8FAFC", border:"1px solid #E8EEF8" }}>
                        <Avatar name={name} size={46} photo={ex.photo} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:14.5, color:"#0A2540" }}>{name}</div>
                          <div style={{ fontSize:12.5, color:"#64748B", marginTop:2 }}>{ex.domaine}</div>
                        </div>
                        {ex.tarif && <span className="tag tag-gold">{ex.tarif}</span>}
                        <div style={{ display:"flex", gap:8 }}>
                          <button className="btn btn-outline btn-sm" onClick={()=>{ setSelectedExpert(ex); setTab("experts"); }}>Message</button>
                          <button className="btn btn-accent btn-sm" onClick={()=>{ setRdvExpert(ex); setRdvModal(true); }}>Rendez-vous</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ EXPERTS ══ */}
        {tab==="experts" && (
          <div className="fade" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            <div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:24, color:"#0A2540", marginBottom:18 }}>Nos experts certifiés</div>
              <input className="field" placeholder="Rechercher par nom ou domaine…" value={searchExpert} onChange={e=>setSearchExpert(e.target.value)} style={{ marginBottom:14 }} />
              <div style={{ display:"flex", flexDirection:"column", gap:12, maxHeight:620, overflowY:"auto" }}>
                {filteredExperts.length===0
                  ? <div style={{ textAlign:"center", padding:"56px 0", color:"#94A3B8" }}>Aucun expert correspondant</div>
                  : filteredExperts.map((ex,i)=>{
                    const name=getExpertName(ex);
                    return (
                      <div key={i} className={`ex-card${selectedExpert?.id===ex.id?" sel":""}`}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                          <Avatar name={name} size={52} photo={ex.photo} />
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                              <span style={{ fontWeight:700, fontSize:15, color:"#0A2540" }}>{name}</span>
                              <StatusBadge statut={ex.disponible?"disponible":"occupe"} />
                            </div>
                            <div style={{ fontSize:13, color:"#475569", marginBottom:10 }}>{ex.domaine}</div>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                              {ex.localisation&&<span className="tag">📍 {ex.localisation}</span>}
                              {ex.experience&&<span className="tag">💼 {ex.experience}</span>}
                              {ex.tarif&&<span className="tag tag-gold">💰 {ex.tarif}</span>}
                            </div>
                          </div>
                        </div>
                        {ex.description&&<div style={{ marginTop:12, fontSize:13, color:"#64748B", lineHeight:1.65, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{ex.description}</div>}
                        <div style={{ display:"flex", gap:8, marginTop:14, paddingTop:14, borderTop:"1px solid #F1F5FB" }}>
                          <button className="btn btn-primary" style={{ flex:1, fontSize:12.5, padding:"9px 14px" }} onClick={()=>setSelectedExpert(ex)}>Envoyer un message</button>
                          <button className="btn btn-accent" style={{ flex:1, fontSize:12.5, padding:"9px 14px" }} onClick={()=>{ setRdvExpert(ex); setRdvModal(true); }}>Réserver un rendez-vous</button>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>

            <div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:24, color:"#0A2540", marginBottom:18 }}>Messagerie</div>
              {!selectedExpert ? (
                <div className="card" style={{ padding:"64px 40px", textAlign:"center" }}>
                  <div style={{ width:60, height:60, borderRadius:16, background:"#F0F4F8", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div style={{ fontWeight:700, color:"#0A2540", fontSize:16, marginBottom:8 }}>Aucun expert sélectionné</div>
                  <div style={{ fontSize:13.5, color:"#94A3B8" }}>Choisissez un expert pour démarrer une conversation.</div>
                </div>
              ) : (
                <div className="card" style={{ overflow:"hidden", display:"flex", flexDirection:"column" }}>
                  <div style={{ padding:"16px 22px", background:"linear-gradient(135deg,#FAFBFE,#F4F7FB)", borderBottom:"1px solid #EEF2F9", display:"flex", alignItems:"center", gap:14 }}>
                    <Avatar name={getExpertName(selectedExpert)} size={46} photo={selectedExpert.photo} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:15, color:"#0A2540" }}>{getExpertName(selectedExpert)}</div>
                      <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>{selectedExpert.domaine}</div>
                    </div>
                    <button className="btn btn-accent btn-sm" onClick={()=>{ setRdvExpert(selectedExpert); setRdvModal(true); }}>Rendez-vous</button>
                    <button className="btn btn-outline btn-sm" style={{ padding:"7px 10px" }} onClick={()=>setSelectedExpert(null)}>✕</button>
                  </div>
                  <div style={{ padding:"18px 20px", minHeight:240, maxHeight:320, overflowY:"auto", display:"flex", flexDirection:"column", gap:10 }}>
                    {convMessages.length===0
                      ? <div style={{ textAlign:"center", color:"#B8C8DC", fontSize:13.5, padding:"36px 0" }}>Aucun message. Commencez la conversation.</div>
                      : convMessages.map((m,i)=>{
                        const isMe=m.sender_id===user?.id;
                        return (
                          <div key={i} style={{ display:"flex", justifyContent:isMe?"flex-end":"flex-start" }}>
                            <div className={isMe?"bubble-me":"bubble-other"}>
                              <div>{m.contenu}</div>
                              <div style={{ fontSize:10, opacity:.4, marginTop:5 }}>{new Date(m.createdAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                  <div style={{ padding:"14px 18px", borderTop:"1px solid #EEF2F9", display:"flex", gap:10, background:"#FAFBFE" }}>
                    <input className="field" style={{ flex:1 }} placeholder="Rédigez votre message…" value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&envoyerMessage()} />
                    <button className="btn btn-primary" onClick={envoyerMessage} disabled={sending||!newMsg.trim()}>{sending?"Envoi…":"Envoyer"}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ MESSAGES ══ */}
        {tab==="messages" && (
          <div className="fade card" style={{ overflow:"hidden", display:"grid", gridTemplateColumns:"300px 1fr", minHeight:540 }}>
            <div style={{ borderRight:"1px solid #EEF2F9", overflowY:"auto" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid #F1F5FB", background:"linear-gradient(135deg,#FAFBFE,#F4F7FB)" }}>
                <div style={{ fontWeight:700, fontSize:14, color:"#0A2540" }}>Conversations</div>
                <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>{convList.length} discussion{convList.length>1?"s":""}</div>
              </div>
              {convList.length===0
                ? <div style={{ padding:"52px 24px", textAlign:"center" }}>
                    <div style={{ fontWeight:600, color:"#0A2540", fontSize:14, marginBottom:8 }}>Aucune conversation</div>
                    <div style={{ fontSize:13, color:"#94A3B8", marginBottom:18 }}>Contactez un expert pour démarrer.</div>
                    <button className="btn btn-accent btn-sm" onClick={()=>setTab("experts")}>Trouver un expert</button>
                  </div>
                : convList.map((c:any)=>{
                  const last=c.messages[c.messages.length-1];
                  const ex=experts.find(e=>(e.user?.id||e.user_id)===c.id);
                  return (
                    <div key={c.id} className={`conv-row${selectedConv?.id===c.id?" active":""}`} onClick={()=>{ setSelectedConv(c); setSelectedExpert(null); }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <Avatar name={c.name} size={40} photo={ex?.photo} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:13.5, color:"#0A2540" }}>{c.name}</div>
                          <div style={{ fontSize:12, color:"#94A3B8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:2 }}>{last?.contenu}</div>
                        </div>
                      </div>
                      <div style={{ fontSize:11, color:"#B8C8DC", marginTop:6 }}>{last?new Date(last.createdAt).toLocaleDateString("fr-FR"):""}</div>
                    </div>
                  );
                })
              }
            </div>

            {selectedConv ? (
              <div style={{ display:"flex", flexDirection:"column" }}>
                <div style={{ padding:"16px 22px", borderBottom:"1px solid #EEF2F9", display:"flex", alignItems:"center", gap:14, background:"linear-gradient(135deg,#FAFBFE,#F4F7FB)" }}>
                  <Avatar name={selectedConv.name} size={42} photo={experts.find(e=>(e.user?.id||e.user_id)===selectedConv.id)?.photo} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:"#0A2540" }}>{selectedConv.name}</div>
                    <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>Expert BEH</div>
                  </div>
                  <button className="btn btn-accent btn-sm" onClick={()=>{ const ex=experts.find(e=>(e.user?.id||e.user_id)===selectedConv.id); if(ex){setRdvExpert(ex);setRdvModal(true);}else notify("Expert introuvable",false); }}>
                    Réserver un rendez-vous
                  </button>
                </div>
                <div style={{ flex:1, overflowY:"auto", padding:"20px 22px", display:"flex", flexDirection:"column", gap:10, minHeight:300 }}>
                  {messages.filter(m=>(m.sender_id===user?.id&&m.receiver_id===selectedConv.id)||(m.sender_id===selectedConv.id&&m.receiver_id===user?.id)).map((m,i)=>{
                    const isMe=m.sender_id===user?.id;
                    return (
                      <div key={i} style={{ display:"flex", justifyContent:isMe?"flex-end":"flex-start" }}>
                        <div className={isMe?"bubble-me":"bubble-other"}>
                          <div>{m.contenu}</div>
                          <div style={{ fontSize:10, opacity:.4, marginTop:5 }}>{new Date(m.createdAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding:"14px 18px", borderTop:"1px solid #EEF2F9", display:"flex", gap:10, background:"#FAFBFE" }}>
                  <input className="field" style={{ flex:1 }} placeholder="Rédigez votre message…" value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&envoyerDepuisConv()} />
                  <button className="btn btn-primary" disabled={sending||!newMsg.trim()} onClick={envoyerDepuisConv}>Envoyer</button>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, color:"#B8C8DC" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <div style={{ fontSize:14, fontWeight:500 }}>Sélectionnez une conversation</div>
              </div>
            )}
          </div>
        )}

        {/* ══ RENDEZ-VOUS ══ */}
        {tab==="rendezvous" && (
          <div className="fade">
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:26, flexWrap:"wrap", gap:14 }}>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:28, color:"#0A2540" }}>Mes rendez-vous</div>
                <div style={{ fontSize:13.5, color:"#94A3B8", marginTop:5 }}>{rdvActifs.length} actif{rdvActifs.length>1?"s":""} — {rdvEnAttente} en attente</div>
              </div>
              <button className="btn btn-accent" onClick={()=>setTab("experts")} style={{ padding:"12px 24px" }}>Nouveau rendez-vous</button>
            </div>

            {rdvActifs.length===0
              ? <div className="card" style={{ padding:"72px 40px", textAlign:"center", marginBottom:24 }}>
                  <div style={{ width:64, height:64, borderRadius:18, background:"#F0F4F8", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <div style={{ fontWeight:700, color:"#0A2540", fontSize:18, marginBottom:10 }}>Aucun rendez-vous planifié</div>
                  <button className="btn btn-accent" onClick={()=>setTab("experts")} style={{ padding:"13px 30px" }}>Parcourir les experts</button>
                </div>
              : <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:32 }}>
                  {rdvActifs.map(r=>{
                    const expertName=r.expert?.user?`${r.expert.user.prenom||""} ${r.expert.user.nom||""}`.trim():r.expert?.domaine||"Expert";
                    return (
                      <div key={r.id} className="rdv-card">
                        <div style={{ display:"flex", alignItems:"flex-start", gap:18, flexWrap:"wrap" }}>
                          <Avatar name={expertName} size={54} photo={r.expert?.photo} />
                          <div style={{ flex:1, minWidth:200 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6, flexWrap:"wrap" }}>
                              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:20, color:"#0A2540" }}>{expertName}</span>
                              <StatusBadge statut={r.statut} />
                            </div>
                            {r.expert?.domaine&&<div style={{ fontSize:13.5, color:"#475569", marginBottom:12 }}>{r.expert.domaine}</div>}
                            <div style={{ display:"flex", gap:22, flexWrap:"wrap" }}>
                              <div><div className="lbl" style={{ marginBottom:3 }}>Date</div><div style={{ fontSize:14, color:"#0A2540", fontWeight:600 }}>{new Date(r.date_rdv).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div></div>
                              {r.heure&&<div><div className="lbl" style={{ marginBottom:3 }}>Heure</div><div style={{ fontSize:14, color:"#0A2540", fontWeight:600 }}>{r.heure}</div></div>}
                            </div>
                            {r.motif&&<div style={{ marginTop:12, fontSize:13.5, color:"#475569", background:"#F8FAFC", borderRadius:10, padding:"10px 14px", borderLeft:"3px solid #DDE5F0" }}><span style={{ fontWeight:700, color:"#334155" }}>Objet — </span>{r.motif}</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
            }

            {rdvAnnules.length>0 && (
              <>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:20, color:"#94A3B8", marginBottom:14 }}>Annulés</div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {rdvAnnules.map(r=>{
                    const expertName=r.expert?.user?`${r.expert.user.prenom||""} ${r.expert.user.nom||""}`.trim():"Expert";
                    return (
                      <div key={r.id} style={{ background:"#F9FAFB", border:"1px solid #E2E8F0", borderRadius:12, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                          <Avatar name={expertName} size={40} photo={r.expert?.photo} />
                          <div>
                            <div style={{ fontWeight:600, fontSize:14, color:"#64748B" }}>{expertName}</div>
                            <div style={{ fontSize:12.5, color:"#94A3B8", marginTop:3 }}>{new Date(r.date_rdv).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</div>
                          </div>
                        </div>
                        <StatusBadge statut="annule" />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ TÉMOIGNAGE ══ */}
        {tab==="temoignage" && (
          <div className="fade" style={{ maxWidth:640 }}>
            {temoSent ? (
              <div className="card" style={{ padding:"56px 40px", textAlign:"center" }}>
                <div style={{ width:72, height:72, borderRadius:"50%", background:"#ECFDF5", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:32 }}>✅</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:24, color:"#0A2540", marginBottom:12 }}>Témoignage soumis</div>
                <div style={{ fontSize:14, color:"#64748B", lineHeight:1.7, maxWidth:400, margin:"0 auto 28px" }}>Votre témoignage a été transmis à l'équipe BEH. Il sera publié sur le site après validation par l'administrateur.</div>
                <button className="btn btn-primary" onClick={()=>setTemoSent(false)} style={{ padding:"12px 28px" }}>Soumettre un autre témoignage</button>
              </div>
            ) : (
              <div className="card" style={{ padding:"36px 40px" }}>
                <div style={{ marginBottom:28, paddingBottom:24, borderBottom:"1px solid #F1F5FB" }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:26, color:"#0A2540", marginBottom:8 }}>Partager votre expérience</div>
                  <div style={{ fontSize:14, color:"#64748B", lineHeight:1.7 }}>Votre témoignage est précieux. Après validation par l'admin, il sera publié sur la page d'accueil.</div>
                </div>
                <div style={{ marginBottom:20 }}>
                  <label className="lbl">Votre témoignage</label>
                  <textarea className="field" placeholder="Décrivez votre expérience avec Business Expert Hub — la qualité des experts, les résultats obtenus, vos recommandations…" value={temoText} onChange={e=>setTemoText(e.target.value)} maxLength={500} style={{ minHeight:150 }} />
                </div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontSize:12.5, color:"#94A3B8" }}>{temoText.length} / 500 caractères</div>
                    <div style={{ height:4, width:120, borderRadius:99, background:"#EEF2F7", marginTop:6, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:99, background:temoText.length>400?"#F7B500":"#0A2540", width:`${(temoText.length/500)*100}%`, transition:"width .3s,background .3s" }}/>
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={envoyerTemoignage} disabled={sendingTemo||!temoText.trim()} style={{ padding:"12px 28px" }}>
                    {sendingTemo?"Envoi en cours…":"Soumettre le témoignage"}
                  </button>
                </div>
              </div>
            )}
            <div style={{ marginTop:16, background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:14, padding:"16px 20px", fontSize:13.5, color:"#1D4ED8", lineHeight:1.7 }}>
              Votre témoignage sera publié sous votre prénom et votre rôle. Les informations personnelles ne seront pas divulguées.
            </div>
          </div>
        )}

      </main>
    </>
  );
}