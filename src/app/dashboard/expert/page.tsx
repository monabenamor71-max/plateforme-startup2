"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "dashboard" | "profil" | "rendezvous" | "disponibilites" | "messages";

export default function DashboardExpert() {
  const router = useRouter();
  const [user,              setUser]              = useState<any>(null);
  const [expert,            setExpert]            = useState<any>(null);
  const [tab,               setTab]               = useState<Tab>("dashboard");
  const [rdvs,              setRdvs]              = useState<any[]>([]);
  const [dispos,            setDispos]            = useState<any[]>([]);
  const [messages,          setMessages]          = useState<any[]>([]);
  const [convActive,        setConvActive]        = useState<any>(null);
  const [replyText,         setReplyText]         = useState("");
  const [sendingMsg,        setSendingMsg]        = useState(false);
  const [toast,             setToast]             = useState({ text: "", ok: true });
  const [editingProfil,     setEditingProfil]     = useState(false);
  const [savingProfil,      setSavingProfil]      = useState(false);
  const [uploading,         setUploading]         = useState(false);
  const [photoUrl,          setPhotoUrl]          = useState<string>("");
  const [dispoModal,        setDispoModal]        = useState(false);
  const [newDispo,          setNewDispo]          = useState({ date: "", heureDebut: "", heureFin: "" });
  const [form, setForm] = useState({
    domaine: "", description: "", localisation: "",
    telephone: "", experience: "", disponible: true,
  });

  const tk   = () => localStorage.getItem("token") || "";
  const hdr  = () => ({ Authorization: `Bearer ${tk()}` });
  const hdrJ = () => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" });
  const BASE = "http://localhost:3001";

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { router.push("/connexion"); return; }
    const p = JSON.parse(u);
    if (p.role !== "expert") { router.push("/"); return; }
    setUser(p);
    loadProfile();
    loadRdvs();
    loadMessages();
  }, []);

  function notify(text: string, ok = true) {
    setToast({ text, ok });
    setTimeout(() => setToast({ text: "", ok: true }), 3500);
  }

  async function loadProfile() {
    try {
      const r = await fetch(`${BASE}/experts/moi`, { headers: hdr() });
      if (r.ok) {
        const d = await r.json();
        setExpert(d);
        setPhotoUrl(d.photo ? `${BASE}/uploads/photos/${d.photo}?t=${Date.now()}` : "");
        setForm({
          domaine:      d.domaine      || "",
          description:  d.description  || "",
          localisation: d.localisation || "",
          telephone:    d.telephone    || "",
          experience:   d.experience   || "",
          disponible:   d.disponibilite !== "non disponible",
        });
        if (d.id) loadDispos(d.id);
      }
    } catch(e) { console.log(e); }
  }

  async function loadRdvs() {
    try {
      const r = await fetch(`${BASE}/rendez-vous/expert`, { headers: hdr() });
      if (r.ok) setRdvs(await r.json()); else setRdvs([]);
    } catch(e) { setRdvs([]); }
  }

  async function loadMessages() {
    try {
      const r = await fetch(`${BASE}/messages`, { headers: hdr() });
      if (r.ok) setMessages(await r.json()); else setMessages([]);
    } catch(e) { setMessages([]); }
  }

  async function loadDispos(id: number) {
    try {
      const r = await fetch(`${BASE}/disponibilites/expert/${id}`, { headers: hdr() });
      if (r.ok) setDispos(await r.json()); else setDispos([]);
    } catch(e) { setDispos([]); }
  }

  async function saveProfil(e: React.FormEvent) {
    e.preventDefault(); setSavingProfil(true);
    try {
      const r = await fetch(`${BASE}/experts/profil`, {
        method: "PUT", headers: hdrJ(), body: JSON.stringify(form),
      });
      if (r.ok) { notify("✅ Modification envoyée à l'admin pour validation !"); setEditingProfil(false); loadProfile(); }
      else notify("Erreur sauvegarde", false);
    } catch(e) { notify("Erreur", false); }
    setSavingProfil(false);
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("photo", file);
    try {
      const r = await fetch(`${BASE}/experts/photo`, { method: "POST", headers: hdr(), body: fd });
      const data = await r.json();
      if (r.ok) { notify("Photo mise à jour ✅"); await loadProfile(); }
      else notify("Erreur upload: " + (data.message || ""), false);
    } catch(e) { notify("Erreur connexion", false); }
    setUploading(false);
  }

  async function saveDispo(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch(`${BASE}/disponibilites`, {
        method: "POST", headers: hdrJ(), body: JSON.stringify(newDispo),
      });
      if (r.ok) {
        notify("Créneau ajouté ✅"); setDispoModal(false);
        setNewDispo({ date: "", heureDebut: "", heureFin: "" });
        if (expert?.id) loadDispos(expert.id);
      } else notify("Erreur", false);
    } catch(e) { notify("Erreur", false); }
  }

  async function deleteDispo(id: number) {
    if (!confirm("Supprimer ce créneau ?")) return;
    try {
      const r = await fetch(`${BASE}/disponibilites/${id}`, { method: "DELETE", headers: hdr() });
      if (r.ok) { notify("Supprimé"); if (expert?.id) loadDispos(expert.id); }
    } catch(e) { notify("Erreur", false); }
  }

  async function confirmerRdv(id: number) {
    try {
      const r = await fetch(`${BASE}/rendez-vous/${id}/confirmer`, { method: "PUT", headers: hdr() });
      if (r.ok) { notify("Confirmé ✅"); loadRdvs(); }
    } catch(e) { notify("Erreur", false); }
  }

  async function annulerRdv(id: number) {
    try {
      const r = await fetch(`${BASE}/rendez-vous/${id}/annuler`, { method: "PUT", headers: hdr() });
      if (r.ok) { notify("Annulé"); loadRdvs(); }
    } catch(e) { notify("Erreur", false); }
  }

  async function sendReply() {
    if (!replyText.trim() || !convActive) return;
    setSendingMsg(true);
    try {
      const r = await fetch(`${BASE}/messages`, {
        method: "POST", headers: hdrJ(),
        body: JSON.stringify({ receiver_id: convActive.otherId, contenu: replyText }),
      });
      if (r.ok) { setReplyText(""); await loadMessages(); }
      else notify("Erreur envoi", false);
    } catch(e) { notify("Erreur", false); }
    setSendingMsg(false);
  }

  const rdvFuturs = rdvs.filter(r => r.statut !== "annule");
  const rdvEnAttente = rdvFuturs.filter(r => r.statut === "en_attente").length;

  // Grouper messages par conversation
  const convMap: Record<number, any> = {};
  for (const m of messages) {
    const otherId   = m.sender_id === user?.id ? m.receiver_id : m.sender_id;
    const otherUser = m.sender_id === user?.id ? m.receiver    : m.sender;
    const nom = `${otherUser?.prenom || ""} ${otherUser?.nom || ""}`.trim() || "Startup";
    if (!convMap[otherId]) convMap[otherId] = { otherId, nom, msgs: [] };
    convMap[otherId].msgs.push(m);
  }
  const convList = Object.values(convMap) as any[];
  const nbMsgsNonLus = convList.length;

  const convMessages = convActive
    ? messages.filter(m =>
        (m.sender_id === user?.id && m.receiver_id === convActive.otherId) ||
        (m.sender_id === convActive.otherId && m.receiver_id === user?.id)
      )
    : [];

  function AvatarComp({ name, photo, size = 44 }: { name: string; photo?: string; size?: number }) {
    const [err, setErr] = useState(false);
    const ini = (name || "?").split(" ").filter(Boolean).map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "EX";
    if (photo && !err) {
      return (
        <img src={photo} alt={name}
          style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", border:"2px solid #E8EEF6", flexShrink:0 }}
          onError={() => setErr(true)} />
      );
    }
    return (
      <div style={{ width:size, height:size, borderRadius:"50%", background:"#0A2540", color:"#F7B500", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:size*0.34, flexShrink:0 }}>
        {ini}
      </div>
    );
  }

  function Avatar({ size = 64 }: { size?: number }) {
    return (
      <div style={{ position:"relative", flexShrink:0 }}>
        <div style={{ width:size, height:size, borderRadius:"50%", border:"3px solid #F7B500", overflow:"hidden", background:"#0A2540", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {photoUrl ? (
            <img src={photoUrl} alt="photo" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={() => setPhotoUrl("")} />
          ) : (
            <span style={{ color:"#F7B500", fontWeight:800, fontSize:size*0.35 }}>{user?.prenom?.[0]}{user?.nom?.[0]}</span>
          )}
        </div>
        <label style={{ position:"absolute", bottom:0, right:0, width:size*0.35, height:size*0.35, background:"#F7B500", borderRadius:"50%", border:"2px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:uploading?"wait":"pointer", fontSize:size*0.18 }}>
          {uploading ? "⏳" : "📷"}
          <input type="file" accept="image/*" onChange={uploadPhoto} style={{ display:"none" }} disabled={uploading} />
        </label>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Cormorant+Garamond:wght@600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Outfit',sans-serif;background:#EEF2F7;color:#1E293B;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fade{animation:fadeUp .35s cubic-bezier(.22,1,.36,1);}
        .card{background:#fff;border:1px solid #DDE5F0;border-radius:16px;box-shadow:0 2px 8px rgba(10,37,64,.04);}

        /* Buttons */
        .btn{font-family:'Outfit',sans-serif;font-weight:700;border:none;border-radius:10px;cursor:pointer;padding:10px 20px;font-size:13px;transition:all .2s;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;}
        .btn-p{background:#0A2540;color:#fff;}.btn-p:hover{background:#F7B500;color:#0A2540;transform:translateY(-1px);}
        .btn-g{background:#F7B500;color:#0A2540;box-shadow:0 4px 14px rgba(247,181,0,.25);}.btn-g:hover{background:#e6a800;transform:translateY(-1px);}
        .btn-s{background:#F1F5FB;color:#475569;border:1px solid #DDE5F0;}.btn-s:hover{background:#E2EAF4;}
        .btn-gr{background:#ECFDF5;color:#059669;}.btn-gr:hover{background:#059669;color:#fff;}
        .btn-r{background:#FEF2F2;color:#DC2626;}.btn-r:hover{background:#DC2626;color:#fff;}
        .btn-sm{padding:7px 14px!important;font-size:12px!important;}
        .btn:disabled{opacity:.45;cursor:not-allowed;transform:none!important;}

        /* Tabs */
        .tab{background:none;border:none;cursor:pointer;padding:16px 4px;font-size:13.5px;font-weight:500;color:#94A3B8;border-bottom:2.5px solid transparent;font-family:'Outfit',sans-serif;transition:all .2s;white-space:nowrap;}
        .tab.active{color:#0A2540;border-bottom-color:#F7B500;font-weight:700;}
        .tab:hover:not(.active){color:#334155;}

        /* Form */
        .inp{width:100%;background:#F8FAFC;border:1.5px solid #DDE5F0;border-radius:10px;padding:12px 16px;font-family:'Outfit',sans-serif;font-size:13.5px;color:#0A2540;outline:none;transition:border-color .18s,box-shadow .18s;}
        .inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.11);}
        .inp::placeholder{color:#B8C8DC;}
        textarea.inp{resize:vertical;min-height:90px;line-height:1.6;}
        select.inp{appearance:none;cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A8B8CC' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;}
        .lbl{font-size:11px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1.2px;display:block;margin-bottom:6px;}

        /* Modal */
        .modal-bg{position:fixed;inset:0;background:rgba(6,14,26,.6);backdrop-filter:blur(8px);z-index:300;display:flex;align-items:center;justify-content:center;padding:24px;}
        .modal{background:#fff;border-radius:22px;width:100%;max-width:500px;overflow:hidden;box-shadow:0 32px 80px rgba(10,37,64,.25);}

        /* Badges */
        .badge-ok{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;border-radius:99px;padding:3px 12px;font-size:11px;font-weight:700;}
        .badge-wait{background:#FFF8E1;color:#B45309;border:1px solid #F7B500;border-radius:99px;padding:3px 12px;font-size:11px;font-weight:700;}
        .badge-modif{background:#FFF8E1;color:#B45309;border:1px solid #F7B500;border-radius:99px;padding:3px 12px;font-size:11px;font-weight:700;}
        .badge-rdv{background:#EFF6FF;color:#2563EB;border-radius:99px;padding:3px 12px;font-size:11px;font-weight:700;}

        /* Messages */
        .conv-row{padding:14px 18px;cursor:pointer;border-bottom:1px solid #F1F5FB;transition:background .15s;display:flex;align-items:center;gap:12px;}
        .conv-row:hover{background:#F8FAFC;}
        .conv-row.active{background:#FFFBEB;border-left:3px solid #F7B500;}
        .bubble-me{background:#0A2540;color:#fff;border-radius:18px 18px 4px 18px;padding:11px 16px;font-size:13.5px;max-width:72%;word-break:break-word;line-height:1.55;box-shadow:0 3px 12px rgba(10,37,64,.2);}
        .bubble-other{background:#F1F5FB;color:#1E293B;border-radius:18px 18px 18px 4px;padding:11px 16px;font-size:13.5px;max-width:72%;word-break:break-word;line-height:1.55;border:1px solid #DDE5F0;}
        .msg-time{font-size:10px;opacity:.45;margin-top:4px;}
      `}</style>

      {/* ── TOAST ── */}
      {toast.text && (
        <div className="fade" style={{ position:"fixed", top:22, right:22, zIndex:999, background:toast.ok?"#F0FDF4":"#FFF1F2", border:`1px solid ${toast.ok?"#BBF7D0":"#FECDD3"}`, borderLeft:`4px solid ${toast.ok?"#22C55E":"#F43F5E"}`, color:toast.ok?"#166534":"#9F1239", borderRadius:12, padding:"13px 20px", fontWeight:600, fontSize:13.5, boxShadow:"0 12px 36px rgba(0,0,0,.1)", minWidth:260 }}>
          {toast.text}
        </div>
      )}

      {/* ── MODAL DISPO ── */}
      {dispoModal && (
        <div className="modal-bg" onClick={() => setDispoModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding:"20px 28px", borderBottom:"1px solid #F1F5FB", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#FAFBFE" }}>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:20, color:"#0A2540" }}>Ajouter un créneau</span>
              <button className="btn btn-s btn-sm" onClick={() => setDispoModal(false)}>Fermer</button>
            </div>
            <form onSubmit={saveDispo}>
              <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:18 }}>
                <div>
                  <label className="lbl">Date *</label>
                  <input type="date" className="inp" value={newDispo.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setNewDispo({ ...newDispo, date: e.target.value })} required />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div>
                    <label className="lbl">Heure début *</label>
                    <input type="time" className="inp" value={newDispo.heureDebut}
                      onChange={e => setNewDispo({ ...newDispo, heureDebut: e.target.value })} required />
                  </div>
                  <div>
                    <label className="lbl">Heure fin *</label>
                    <input type="time" className="inp" value={newDispo.heureFin}
                      onChange={e => setNewDispo({ ...newDispo, heureFin: e.target.value })} required />
                  </div>
                </div>
              </div>
              <div style={{ padding:"16px 28px", borderTop:"1px solid #F1F5FB", display:"flex", justifyContent:"flex-end", gap:10, background:"#FAFBFE" }}>
                <button type="button" className="btn btn-s" onClick={() => setDispoModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-g">Ajouter le créneau</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════ HEADER ════════ */}
      <header style={{ background:"#0A2540", height:64, padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 20px rgba(10,37,64,.4)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ background:"#F7B500", borderRadius:9, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12, color:"#0A2540" }}>BEH</div>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:17, color:"#fff" }}>Business Expert Hub</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,.4)" }}>Espace Expert — {user?.prenom} {user?.nom}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {expert?.statut === "valide" && !expert?.modification_demandee && (
            <span style={{ background:"rgba(16,185,129,.15)", border:"1px solid rgba(16,185,129,.3)", borderRadius:99, padding:"4px 14px", fontSize:11, fontWeight:700, color:"#34D399" }}>✓ Compte validé</span>
          )}
          {expert?.statut === "en_attente" && (
            <span style={{ background:"rgba(247,181,0,.15)", border:"1px solid rgba(247,181,0,.3)", borderRadius:99, padding:"4px 14px", fontSize:11, fontWeight:700, color:"#F7B500" }}>⏳ En attente de validation</span>
          )}
          {expert?.modification_demandee && (
            <span style={{ background:"rgba(247,181,0,.15)", border:"1px solid rgba(247,181,0,.3)", borderRadius:99, padding:"4px 14px", fontSize:11, fontWeight:700, color:"#F7B500" }}>⚠️ Modif en attente</span>
          )}
          <button className="btn btn-s btn-sm"
            style={{ color:"rgba(255,255,255,.7)", background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)" }}
            onClick={() => { localStorage.clear(); router.push("/"); }}>
            Déconnexion
          </button>
        </div>
      </header>

      {/* ════════ TABS ════════ */}
      <div style={{ background:"#fff", borderBottom:"1px solid #DDE5F0" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 32px", display:"flex", gap:28 }}>
          {([
            { id:"dashboard",      label:"Tableau de bord" },
            { id:"profil",         label:"Mon profil" },
            { id:"rendezvous",     label:"Rendez-vous",    badge: rdvEnAttente > 0 ? rdvEnAttente : null },
            { id:"disponibilites", label:"Disponibilités", badge: dispos.length > 0 ? dispos.length : null },
            { id:"messages",       label:"Messages",       badge: nbMsgsNonLus > 0 ? nbMsgsNonLus : null },
          ] as any[]).map(t => (
            <button key={t.id} className={`tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
              {t.badge && (
                <span style={{ background:tab===t.id?"#F7B500":"#EEF2F7", color:tab===t.id?"#0A2540":"#64748B", borderRadius:99, padding:"1px 8px", fontSize:11, fontWeight:800, marginLeft:4 }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ════════ MAIN ════════ */}
      <main style={{ maxWidth:1200, margin:"0 auto", padding:"32px" }}>

        {/* ══ DASHBOARD ══ */}
        {tab === "dashboard" && (
          <div className="fade">
            {/* Bannières statut */}
            {expert?.modification_demandee && (
              <div style={{ background:"linear-gradient(135deg,#FFF8E1,#FEF3C7)", border:"1px solid rgba(247,181,0,.4)", borderRadius:16, padding:"20px 26px", marginBottom:20, display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ fontSize:32 }}>⚠️</div>
                <div>
                  <div style={{ fontWeight:700, color:"#B45309", fontSize:15 }}>Modification en attente de validation</div>
                  <div style={{ color:"#92400E", fontSize:13, marginTop:4 }}>Vos modifications sont en cours d'examen par l'administrateur.</div>
                </div>
              </div>
            )}
            {expert?.statut === "en_attente" && !expert?.modification_demandee && (
              <div style={{ background:"linear-gradient(135deg,#FFF8E1,#FEF3C7)", border:"1px solid rgba(247,181,0,.4)", borderRadius:16, padding:"20px 26px", marginBottom:20, display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ fontSize:32 }}>⏳</div>
                <div>
                  <div style={{ fontWeight:700, color:"#B45309", fontSize:15 }}>Profil en attente de validation</div>
                  <div style={{ color:"#92400E", fontSize:13, marginTop:4 }}>L'administrateur va examiner votre profil. Vous recevrez un email dès la validation.</div>
                </div>
              </div>
            )}
            {expert?.statut === "valide" && !expert?.modification_demandee && (
              <div style={{ background:"linear-gradient(135deg,#ECFDF5,#D1FAE5)", border:"1px solid rgba(16,185,129,.3)", borderRadius:16, padding:"20px 26px", marginBottom:20, display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ fontSize:32 }}>✅</div>
                <div>
                  <div style={{ fontWeight:700, color:"#065F46", fontSize:15 }}>Votre profil est validé !</div>
                  <div style={{ color:"#047857", fontSize:13, marginTop:4 }}>Vous êtes visible sur la plateforme. Les startups peuvent vous contacter.</div>
                </div>
              </div>
            )}

            {/* Hero profil */}
            <div className="card" style={{ padding:"26px 30px", marginBottom:22, background:"linear-gradient(135deg,#0A2540 0%,#0f3464 100%)", border:"none", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-50, right:-50, width:200, height:200, borderRadius:"50%", background:"rgba(247,181,0,.06)", pointerEvents:"none" }} />
              <div style={{ display:"flex", alignItems:"center", gap:20, position:"relative", zIndex:2 }}>
                <Avatar size={72} />
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:24, color:"#fff", lineHeight:1.2 }}>
                    {user?.prenom} {user?.nom}
                  </div>
                  <div style={{ fontSize:14, color:"rgba(255,255,255,.55)", marginTop:4 }}>{expert?.domaine || "Domaine non renseigné"}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:10 }}>
                    {expert?.experience   && <span style={{ background:"rgba(255,255,255,.1)", color:"rgba(255,255,255,.8)", borderRadius:8, padding:"3px 10px", fontSize:12 }}>💼 {expert.experience}</span>}
                    {expert?.localisation && <span style={{ background:"rgba(255,255,255,.1)", color:"rgba(255,255,255,.8)", borderRadius:8, padding:"3px 10px", fontSize:12 }}>📍 {expert.localisation}</span>}
                  </div>
                </div>
                <button className="btn btn-g" onClick={() => setTab("profil")}>✏️ Modifier le profil</button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:22 }}>
              {[
                { label:"RDV à venir",    val:rdvFuturs.length,   color:"#3B82F6", icon:"📅" },
                { label:"En attente",     val:rdvEnAttente,       color:"#F59E0B", icon:"⏳" },
                { label:"Disponibilités", val:dispos.length,      color:"#10B981", icon:"🕐" },
                { label:"Conversations",  val:convList.length,    color:"#8B5CF6", icon:"💬" },
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding:"18px 22px" }}>
                  <div style={{ fontSize:30, marginBottom:10 }}>{s.icon}</div>
                  <div style={{ fontSize:32, fontWeight:800, color:s.color, lineHeight:1 }}>{s.val}</div>
                  <div style={{ fontSize:12.5, color:"#64748B", marginTop:6 }}>{s.label}</div>
                  <div style={{ height:3, borderRadius:99, background:"#EEF2F7", marginTop:10, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:s.color, width:`${Math.min((s.val/10)*100,100)}%`, borderRadius:99 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* RDV récents */}
            {rdvFuturs.length > 0 && (
              <div className="card" style={{ padding:"22px 28px", marginBottom:22 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:20, color:"#0A2540" }}>Prochains rendez-vous</div>
                  <button className="btn btn-s btn-sm" onClick={() => setTab("rendezvous")}>Voir tous</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {rdvFuturs.slice(0, 3).map(r => {
                    const nomStartup = `${r.startup?.user?.prenom || ""} ${r.startup?.user?.nom || ""}`.trim() || "Startup";
                    return (
                      <div key={r.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", background:"#F8FAFC", borderRadius:12, border:"1px solid #E8EEF8" }}>
                        <AvatarComp name={nomStartup} size={42} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:600, fontSize:14, color:"#0A2540" }}>{nomStartup}</div>
                          <div style={{ fontSize:12, color:"#64748B", marginTop:2 }}>
                            {new Date(r.date_rdv).toLocaleDateString("fr-FR", { weekday:"short", day:"numeric", month:"short" })}
                            {r.heure ? ` à ${r.heure}` : ""}
                          </div>
                        </div>
                        <span className={r.statut === "confirme" ? "badge-ok" : r.statut === "en_attente" ? "badge-wait" : ""}>{r.statut === "confirme" ? "✅ Confirmé" : r.statut === "en_attente" ? "⏳ En attente" : r.statut}</span>
                        {r.statut === "en_attente" && (
                          <div style={{ display:"flex", gap:6 }}>
                            <button className="btn btn-gr btn-sm" onClick={() => confirmerRdv(r.id)}>Confirmer</button>
                            <button className="btn btn-r btn-sm" onClick={() => annulerRdv(r.id)}>Refuser</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Aperçu messages */}
            {convList.length > 0 && (
              <div className="card" style={{ padding:"22px 28px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:20, color:"#0A2540" }}>Messages récents</div>
                  <button className="btn btn-s btn-sm" onClick={() => setTab("messages")}>Voir tous</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {convList.slice(0, 4).map((c: any) => {
                    const last = c.msgs[c.msgs.length - 1];
                    return (
                      <div key={c.otherId} onClick={() => { setConvActive(c); setTab("messages"); }}
                        style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px", background:"#F8FAFC", borderRadius:12, border:"1px solid #E8EEF8", cursor:"pointer", transition:"background .15s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="#FFFBEB"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="#F8FAFC"}>
                        <AvatarComp name={c.nom} size={42} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:600, fontSize:14, color:"#0A2540" }}>{c.nom}</div>
                          <div style={{ fontSize:12, color:"#64748B", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{last?.contenu}</div>
                        </div>
                        <div style={{ fontSize:11, color:"#B8C8DC" }}>
                          {last ? new Date(last.createdAt).toLocaleDateString("fr-FR", { day:"numeric", month:"short" }) : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ PROFIL ══ */}
        {tab === "profil" && (
          <div className="fade" style={{ maxWidth:740, margin:"0 auto" }}>

            {/* Card photo */}
            <div className="card" style={{ padding:"24px", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                <Avatar size={88} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:19, color:"#0A2540" }}>{user?.prenom} {user?.nom}</div>
                  <div style={{ fontSize:13, color:"#8A9AB5", marginTop:2 }}>{user?.email}</div>
                  <div style={{ marginTop:10, display:"flex", gap:8, flexWrap:"wrap" }}>
                    {expert?.statut === "valide" && !expert?.modification_demandee && <span className="badge-ok">✅ Validé</span>}
                    {expert?.statut === "en_attente" && <span className="badge-wait">⏳ En attente</span>}
                    {expert?.modification_demandee && <span className="badge-modif">⚠️ Modification en attente</span>}
                  </div>
                  {uploading && <div style={{ marginTop:8, fontSize:12, color:"#8A9AB5" }}>⏳ Upload en cours...</div>}
                  <div style={{ marginTop:6, fontSize:12, color:"#94A3B8" }}>Cliquez sur 📷 pour changer la photo de profil</div>
                </div>
              </div>
            </div>

            {/* Alerte modification */}
            {expert?.modification_demandee && (
              <div style={{ background:"#FFF8E1", border:"1px solid #F7B500", borderRadius:12, padding:"14px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:20 }}>⚠️</div>
                <div>
                  <div style={{ fontWeight:700, color:"#B45309", fontSize:13 }}>Modifications en attente de validation</div>
                  <div style={{ fontSize:12, color:"#92400E", marginTop:2 }}>Vos modifications seront appliquées après validation par l'admin.</div>
                </div>
              </div>
            )}

            {/* Formulaire profil */}
            <div className="card" style={{ overflow:"hidden" }}>
              <div style={{ padding:"18px 28px", borderBottom:"1px solid #F1F5FB", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#FAFBFE" }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:20, color:"#0A2540" }}>Informations professionnelles</span>
                {!editingProfil && (
                  <button className="btn btn-g" onClick={() => setEditingProfil(true)} disabled={!!expert?.modification_demandee}>
                    {expert?.modification_demandee ? "⏳ En attente..." : "✏️ Modifier"}
                  </button>
                )}
              </div>

              {editingProfil ? (
                <form onSubmit={saveProfil}>
                  <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:18 }}>
                    <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#1D4ED8" }}>
                      ℹ️ Vos modifications seront soumises à l'administrateur pour validation avant d'être publiées.
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                      <div>
                        <label className="lbl">Domaine *</label>
                        <input className="inp" type="text" placeholder="Ex: Marketing Digital" value={form.domaine}
                          onChange={e => setForm({ ...form, domaine: e.target.value })} required />
                      </div>
                      <div>
                        <label className="lbl">Expérience</label>
                        <select className="inp" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}>
                          <option value="">Sélectionner...</option>
                          {["1-2 ans","3-5 ans","5-8 ans","8-12 ans","12+ ans"].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="lbl">Description</label>
                      <textarea className="inp" placeholder="Présentez votre parcours et vos expertises..." value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                      <div>
                        <label className="lbl">Localisation</label>
                        <input className="inp" type="text" placeholder="Ex: Tunis, Sfax..." value={form.localisation}
                          onChange={e => setForm({ ...form, localisation: e.target.value })} />
                      </div>
                      <div>
                        <label className="lbl">Téléphone</label>
                        <input className="inp" type="tel" placeholder="+216 00 000 000" value={form.telephone}
                          onChange={e => setForm({ ...form, telephone: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="lbl" style={{ marginBottom:10 }}>Disponibilité</label>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                        {[
                          { val:true,  label:"✅ Disponible",     sub:"Visible sur la plateforme" },
                          { val:false, label:"❌ Non disponible", sub:"Masqué temporairement" },
                        ].map(opt => (
                          <div key={String(opt.val)} onClick={() => setForm({ ...form, disponible: opt.val })}
                            style={{ border:`1.5px solid ${form.disponible===opt.val?"#F7B500":"#DDE5F0"}`, borderRadius:12, padding:"13px 16px", cursor:"pointer", background:form.disponible===opt.val?"rgba(247,181,0,.05)":"#F8FAFC", transition:"all .18s" }}>
                            <div style={{ fontWeight:700, fontSize:13, color:"#0A2540" }}>{opt.label}</div>
                            <div style={{ fontSize:11.5, color:"#94A3B8", marginTop:3 }}>{opt.sub}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding:"16px 28px", borderTop:"1px solid #F1F5FB", display:"flex", justifyContent:"flex-end", gap:10, background:"#FAFBFE" }}>
                    <button type="button" className="btn btn-s" onClick={() => setEditingProfil(false)}>Annuler</button>
                    <button type="submit" className="btn btn-p" disabled={savingProfil}>
                      {savingProfil ? "Envoi en cours..." : "📤 Envoyer pour validation"}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ padding:"20px 28px" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    {[
                      { lbl:"Nom complet",   val:`${user?.prenom} ${user?.nom}` },
                      { lbl:"Email",         val:user?.email },
                      { lbl:"Téléphone",     val:expert?.telephone    || "—" },
                      { lbl:"Domaine",       val:expert?.domaine      || "—" },
                      { lbl:"Expérience",    val:expert?.experience   || "—" },
                      { lbl:"Localisation",  val:expert?.localisation || "—" },
                      { lbl:"Disponibilité", val:expert?.disponibilite || "—" },
                      { lbl:"Statut",        val:expert?.statut       || "—" },
                    ].map((row, i) => (
                      <div key={i} style={{ background:"#F8FAFC", border:"1px solid #EEF2F9", borderRadius:10, padding:"12px 16px" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", textTransform:"uppercase" as const, letterSpacing:1, marginBottom:4 }}>{row.lbl}</div>
                        <div style={{ fontSize:13.5, color:"#0A2540", fontWeight:500 }}>{row.val}</div>
                      </div>
                    ))}
                  </div>
                  {expert?.description && (
                    <div style={{ marginTop:14, background:"#F8FAFC", border:"1px solid #EEF2F9", borderRadius:10, padding:"14px 16px" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", textTransform:"uppercase" as const, letterSpacing:1, marginBottom:6 }}>Description</div>
                      <div style={{ fontSize:13.5, color:"#334155", lineHeight:1.7 }}>{expert.description}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ RENDEZ-VOUS ══ */}
        {tab === "rendezvous" && (
          <div className="fade">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:26, color:"#0A2540" }}>Mes rendez-vous</div>
                <div style={{ fontSize:13, color:"#94A3B8", marginTop:4 }}>{rdvFuturs.length} rendez-vous actif{rdvFuturs.length > 1 ? "s" : ""}</div>
              </div>
            </div>
            {rdvFuturs.length === 0 ? (
              <div className="card" style={{ padding:"64px 40px", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:22, color:"#0A2540", marginBottom:8 }}>Aucun rendez-vous</div>
                <div style={{ fontSize:14, color:"#94A3B8" }}>Les demandes de rendez-vous des startups apparaîtront ici.</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {rdvFuturs.map(r => {
                  const nomStartup = `${r.startup?.user?.prenom || ""} ${r.startup?.user?.nom || ""}`.trim() || "Startup";
                  return (
                    <div key={r.id} className="card" style={{ padding:"20px 26px" }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
                        <AvatarComp name={nomStartup} size={52} />
                        <div style={{ flex:1, minWidth:200 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6, flexWrap:"wrap" }}>
                            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:20, color:"#0A2540" }}>{nomStartup}</span>
                            <span className={r.statut === "confirme" ? "badge-ok" : r.statut === "en_attente" ? "badge-wait" : ""}>
                              {r.statut === "confirme" ? "✅ Confirmé" : r.statut === "en_attente" ? "⏳ En attente" : r.statut}
                            </span>
                          </div>
                          <div style={{ fontSize:13, color:"#64748B", display:"flex", gap:18, flexWrap:"wrap" }}>
                            <span>📅 {new Date(r.date_rdv).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}</span>
                            {r.heure && <span>🕐 {r.heure}</span>}
                          </div>
                          {r.motif && (
                            <div style={{ marginTop:10, background:"#F8FAFC", border:"1px solid #EEF2F9", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#475569" }}>
                              <span style={{ fontWeight:600, color:"#334155" }}>Objet : </span>{r.motif}
                            </div>
                          )}
                        </div>
                        {r.statut === "en_attente" && (
                          <div style={{ display:"flex", gap:8 }}>
                            <button className="btn btn-gr" onClick={() => confirmerRdv(r.id)}>✅ Confirmer</button>
                            <button className="btn btn-r"  onClick={() => annulerRdv(r.id)}>✕ Refuser</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ DISPONIBILITÉS ══ */}
        {tab === "disponibilites" && (
          <div className="fade">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:26, color:"#0A2540" }}>Mes disponibilités</div>
                <div style={{ fontSize:13, color:"#94A3B8", marginTop:4 }}>{dispos.length} créneau{dispos.length > 1 ? "x" : ""} défini{dispos.length > 1 ? "s" : ""}</div>
              </div>
              <button className="btn btn-g" onClick={() => setDispoModal(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Ajouter un créneau
              </button>
            </div>
            {dispos.length === 0 ? (
              <div className="card" style={{ padding:"64px 40px", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🕐</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:22, color:"#0A2540", marginBottom:8 }}>Aucun créneau défini</div>
                <div style={{ fontSize:14, color:"#94A3B8", marginBottom:20 }}>Ajoutez vos disponibilités pour que les startups puissent réserver.</div>
                <button className="btn btn-g" onClick={() => setDispoModal(true)}>Ajouter maintenant</button>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
                {dispos.map(d => (
                  <div key={d.id} className="card" style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:46, height:46, background:"rgba(247,181,0,.12)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🕐</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:14, color:"#0A2540" }}>
                        {new Date(d.date).toLocaleDateString("fr-FR", { weekday:"short", day:"numeric", month:"long" })}
                      </div>
                      <div style={{ fontSize:12.5, color:"#64748B", marginTop:3 }}>
                        {(d.heureDebut || "").slice(0,5)} → {(d.heureFin || "").slice(0,5)}
                      </div>
                    </div>
                    <button className="btn btn-r btn-sm" onClick={() => deleteDispo(d.id)} style={{ padding:"6px 10px" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ MESSAGES ══ */}
        {tab === "messages" && (
          <div className="fade card" style={{ overflow:"hidden", display:"grid", gridTemplateColumns:"300px 1fr", minHeight:580 }}>

            {/* ── Liste des conversations ── */}
            <div style={{ borderRight:"1px solid #EEF2F9", overflowY:"auto" }}>
              <div style={{ padding:"16px 20px", borderBottom:"1px solid #F1F5FB", background:"linear-gradient(135deg,#FAFBFE,#F4F7FB)" }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:18, color:"#0A2540" }}>Messages</div>
                <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>
                  {convList.length} conversation{convList.length > 1 ? "s" : ""} avec des startups
                </div>
              </div>

              {convList.length === 0 ? (
                <div style={{ padding:"52px 20px", textAlign:"center" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
                  <div style={{ fontWeight:600, color:"#0A2540", fontSize:14, marginBottom:6 }}>Aucun message</div>
                  <div style={{ fontSize:13, color:"#94A3B8", lineHeight:1.6 }}>Les startups peuvent vous contacter depuis vos profils publics.</div>
                </div>
              ) : (
                convList.map((c: any) => {
                  const last = c.msgs[c.msgs.length - 1];
                  const isActive = convActive?.otherId === c.otherId;
                  return (
                    <div key={c.otherId} className={`conv-row${isActive ? " active" : ""}`}
                      onClick={() => setConvActive(c)}>
                      <AvatarComp name={c.nom} size={42} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:13.5, color:"#0A2540" }}>{c.nom}</div>
                        <div style={{ fontSize:12, color:"#94A3B8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:2 }}>
                          {last?.sender_id === user?.id ? "Vous : " : ""}{last?.contenu}
                        </div>
                      </div>
                      <div style={{ fontSize:11, color:"#C2CEDC", flexShrink:0 }}>
                        {last ? new Date(last.createdAt).toLocaleDateString("fr-FR", { day:"numeric", month:"short" }) : ""}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Zone de messagerie ── */}
            {!convActive ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, color:"#C2CEDC", padding:48, textAlign:"center" }}>
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, color:"#94A3B8" }}>Sélectionnez une conversation</div>
                <div style={{ fontSize:13, color:"#B8C8DC", lineHeight:1.6 }}>
                  Choisissez une startup dans la liste pour lire et répondre à ses messages.
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column" }}>

                {/* En-tête conversation */}
                <div style={{ padding:"14px 24px", borderBottom:"1px solid #EEF2F9", display:"flex", alignItems:"center", gap:14, background:"linear-gradient(135deg,#FAFBFE,#F4F7FB)" }}>
                  <AvatarComp name={convActive.nom} size={44} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:"#0A2540" }}>{convActive.nom}</div>
                    <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>Startup BEH</div>
                  </div>
                  <button className="btn btn-s btn-sm" onClick={() => setConvActive(null)} style={{ padding:"6px 10px" }}>✕</button>
                </div>

                {/* Messages */}
                <div style={{ flex:1, overflowY:"auto", padding:"20px 22px", display:"flex", flexDirection:"column", gap:12, minHeight:300, maxHeight:420 }}>
                  {convMessages.length === 0 ? (
                    <div style={{ textAlign:"center", color:"#B8C8DC", fontSize:13.5, padding:"40px 0" }}>Aucun message dans cette conversation.</div>
                  ) : convMessages.map((m: any, i: number) => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <div key={i} style={{ display:"flex", justifyContent:isMe ? "flex-end" : "flex-start" }}>
                        <div>
                          <div className={isMe ? "bubble-me" : "bubble-other"}>
                            {m.contenu}
                          </div>
                          <div className="msg-time" style={{ textAlign:isMe?"right":"left" }}>
                            {new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Zone de réponse */}
                <div style={{ padding:"14px 20px", borderTop:"1px solid #EEF2F9", background:"#FAFBFE" }}>
                  <div style={{ background:"#fff", border:"1.5px solid #DDE5F0", borderRadius:14, padding:"12px 16px", display:"flex", alignItems:"flex-end", gap:10, transition:"border-color .18s" }}
                    onFocus={() => {}} >
                    <textarea
                      className="inp"
                      style={{ border:"none", background:"transparent", padding:0, minHeight:44, maxHeight:120, flex:1, fontSize:14, boxShadow:"none", outline:"none", resize:"none" }}
                      placeholder="Rédigez votre réponse..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
                      }}
                      rows={1}
                    />
                    <button className="btn btn-p" style={{ padding:"9px 18px", flexShrink:0 }}
                      onClick={sendReply} disabled={sendingMsg || !replyText.trim()}>
                      {sendingMsg
                        ? <div style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
                        : <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                            Envoyer
                          </>
                      }
                    </button>
                  </div>
                  <div style={{ fontSize:11, color:"#B8C8DC", marginTop:7, textAlign:"right" }}>
                    Entrée pour envoyer · Shift+Entrée pour nouvelle ligne
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </>
  );
}