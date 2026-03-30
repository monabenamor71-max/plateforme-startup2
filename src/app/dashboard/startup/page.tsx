"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "dashboard" | "profil" | "experts" | "rendezvous" | "messages";

export default function DashboardStartup() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [startup, setStartup] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [experts, setExperts] = useState<any[]>([]);
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [toast, setToast] = useState({ text: "", ok: true });
  const [editingProfil, setEditingProfil] = useState(false);
  const [savingProfil, setSavingProfil] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [rdvDate, setRdvDate] = useState("");
  const [rdvModal, setRdvModal] = useState(false);
  const [msgModal, setMsgModal] = useState(false);
  const [msgExpert, setMsgExpert] = useState<any>(null);
  const [msgText, setMsgText] = useState("");
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [convMessages, setConvMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [form, setForm] = useState({
    nom_startup: "", secteur: "", taille: "", site_web: "",
    description: "", fonction: "", localisation: "",
  });

  const tk = () => localStorage.getItem("token") || "";
  const hdr = () => ({ Authorization: `Bearer ${tk()}` });
  const hdrJ = () => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" });
  const BASE = "http://localhost:3001";

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { router.push("/connexion"); return; }
    const p = JSON.parse(u);
    if (p.role !== "startup") { router.push("/"); return; }
    setUser(p);
    loadProfile();
    loadExperts();
    loadRdvs();
    loadMessages();
  }, []);

  function notify(text: string, ok = true) {
    setToast({ text, ok });
    setTimeout(() => setToast({ text: "", ok: true }), 3000);
  }

  async function loadProfile() {
    try {
      const r = await fetch(`${BASE}/startups/moi`, { headers: hdr() });
      if (r.ok) {
        const d = await r.json();
        setStartup(d);
        setForm({
          nom_startup: d.nom_startup || "",
          secteur: d.secteur || "",
          taille: d.taille || "",
          site_web: d.site_web || "",
          description: d.description || "",
          fonction: d.fonction || "",
          localisation: d.localisation || "",
        });
      }
    } catch(e) { console.log(e); }
  }

  async function loadExperts() {
    try {
      const r = await fetch(`${BASE}/experts/liste`, { headers: hdr() });
      if (r.ok) setExperts(await r.json());
      else setExperts([]);
    } catch(e) { setExperts([]); }
  }

  async function loadRdvs() {
    try {
      const r = await fetch(`${BASE}/rendez-vous/startup`, { headers: hdr() });
      if (r.ok) setRdvs(await r.json());
      else setRdvs([]);
    } catch(e) { setRdvs([]); }
  }

  async function loadMessages() {
    try {
      const r = await fetch(`${BASE}/messages/mes-messages`, { headers: hdr() });
      if (r.ok) setMessages(await r.json());
      else setMessages([]);
    } catch(e) { setMessages([]); }
  }

  async function loadConversation(userId: number) {
    try {
      const r = await fetch(`${BASE}/messages/conversation/${userId}`, { headers: hdr() });
      if (r.ok) setConvMessages(await r.json());
    } catch(e) { console.log(e); }
  }

  async function saveProfil(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfil(true);
    try {
      const r = await fetch(`${BASE}/startups/profil`, {
        method: "PUT", headers: hdrJ(), body: JSON.stringify(form),
      });
      if (r.ok) { notify("Profil mis à jour ✅"); setEditingProfil(false); loadProfile(); }
      else notify("Erreur sauvegarde", false);
    } catch(e) { notify("Erreur", false); }
    setSavingProfil(false);
  }

  async function prendreRdv() {
    if (!rdvDate || !selectedExpert) return;
    try {
      const r = await fetch(`${BASE}/rendez-vous`, {
        method: "POST", headers: hdrJ(),
        body: JSON.stringify({ expert_id: selectedExpert.id, date_rdv: rdvDate }),
      });
      if (r.ok) { notify("Rendez-vous demandé ✅"); setRdvModal(false); setRdvDate(""); loadRdvs(); }
      else notify("Erreur", false);
    } catch(e) { notify("Erreur", false); }
  }

  async function envoyerMessage() {
    if (!msgText.trim() || !msgExpert) return;
    try {
      const expertUser = msgExpert.user_id || msgExpert.id;
      const r = await fetch(`${BASE}/messages`, {
        method: "POST", headers: hdrJ(),
        body: JSON.stringify({ receiver_id: expertUser, contenu: msgText }),
      });
      if (r.ok) { notify("Message envoyé ✅"); setMsgModal(false); setMsgText(""); loadMessages(); }
      else notify("Erreur envoi", false);
    } catch(e) { notify("Erreur", false); }
  }

  async function envoyerReponse() {
    if (!replyText.trim() || !selectedConv) return;
    try {
      const r = await fetch(`${BASE}/messages`, {
        method: "POST", headers: hdrJ(),
        body: JSON.stringify({ receiver_id: selectedConv.otherId, contenu: replyText }),
      });
      if (r.ok) {
        setReplyText("");
        loadConversation(selectedConv.otherId);
        loadMessages();
      } else notify("Erreur envoi", false);
    } catch(e) { notify("Erreur", false); }
  }

  async function annulerRdv(id: number) {
    if (!confirm("Annuler ce rendez-vous ?")) return;
    try {
      const r = await fetch(`${BASE}/rendez-vous/${id}/annuler`, { method: "PUT", headers: hdr() });
      if (r.ok) { notify("Annulé"); loadRdvs(); }
    } catch(e) { notify("Erreur", false); }
  }

  // Grouper messages par conversation
  const conversations = messages.reduce((acc: any, m: any) => {
    const otherId = m.sender_id === user?.id ? m.receiver_id : m.sender_id;
    const otherName = m.sender_id === user?.id
      ? `${m.receiver?.prenom || ""} ${m.receiver?.nom || ""}`.trim()
      : `${m.sender?.prenom || ""} ${m.sender?.nom || ""}`.trim();
    if (!acc[otherId]) acc[otherId] = { otherId, otherName, messages: [], unread: 0 };
    acc[otherId].messages.push(m);
    if (!m.lu && m.receiver_id === user?.id) acc[otherId].unread++;
    return acc;
  }, {});
  const convList = Object.values(conversations);
  const unreadTotal = messages.filter((m: any) => !m.lu && m.receiver_id === user?.id).length;

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Outfit',sans-serif;background:#F2F5F9;}
        .card{background:#fff;border:1px solid #E8EEF6;border-radius:16px;}
        .btn{font-family:'Outfit',sans-serif;font-weight:600;border:none;border-radius:8px;cursor:pointer;padding:9px 18px;font-size:13px;transition:all .18s;display:inline-flex;align-items:center;gap:6px;}
        .btn-p{background:#0A2540;color:#fff;}.btn-p:hover{background:#F7B500;color:#0A2540;}
        .btn-g{background:#F7B500;color:#0A2540;}.btn-g:hover{background:#e6a800;}
        .btn-s{background:#F1F5F9;color:#475569;}.btn-s:hover{background:#E2E8F0;}
        .btn-r{background:#FEF2F2;color:#DC2626;}.btn-r:hover{background:#DC2626;color:#fff;}
        .btn-b{background:#EFF6FF;color:#1D4ED8;}.btn-b:hover{background:#1D4ED8;color:#fff;}
        .btn:disabled{opacity:.55;cursor:not-allowed;}
        .tab{background:none;border:none;cursor:pointer;padding:14px 4px;font-size:13px;font-weight:500;color:#7D8FAA;border-bottom:2px solid transparent;font-family:'Outfit',sans-serif;transition:all .2s;}
        .tab.active{color:#0A2540;border-bottom-color:#F7B500;font-weight:700;}
        .inp{width:100%;background:#F7F9FC;border:1.5px solid #DDE4EF;border-radius:10px;padding:11px 14px;font-family:'Outfit',sans-serif;font-size:13.5px;color:#0A2540;outline:none;transition:border-color .18s;}
        .inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.1);}
        textarea.inp{resize:vertical;min-height:90px;}
        select.inp{appearance:none;cursor:pointer;}
        .lbl{font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px;}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px);}
        .modal{background:#fff;border-radius:20px;width:100%;max-width:520px;box-shadow:0 24px 80px rgba(10,37,64,.2);overflow:hidden;}
        .badge-ok{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .badge-wait{background:#FFF8E1;color:#B45309;border:1px solid #F7B500;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .avatar{width:44px;height:44px;border-radius:50%;background:#0A2540;color:#F7B500;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;flex-shrink:0;}
        .expert-card{background:#fff;border:1px solid #E8EEF6;border-radius:16px;padding:20px;transition:all .2s;}
        .expert-card:hover{box-shadow:0 8px 28px rgba(10,37,64,.1);border-color:rgba(247,181,0,.3);}
        .msg-me{background:#0A2540;color:#fff;border-radius:14px 14px 2px 14px;padding:10px 14px;font-size:13.5px;max-width:75%;}
        .msg-other{background:#F1F5F9;color:#0A2540;border-radius:14px 14px 14px 2px;padding:10px 14px;font-size:13.5px;max-width:75%;}
      `}</style>

      {/* Toast */}
      {toast.text && (
        <div style={{position:"fixed",top:20,right:20,zIndex:999,background:toast.ok?"#ECFDF5":"#FEF2F2",border:`1px solid ${toast.ok?"#A7F3D0":"#FECACA"}`,borderLeft:`3px solid ${toast.ok?"#059669":"#DC2626"}`,color:toast.ok?"#059669":"#DC2626",borderRadius:10,padding:"12px 18px",fontWeight:600,fontSize:13,boxShadow:"0 8px 24px rgba(0,0,0,.1)"}}>
          {toast.text}
        </div>
      )}

      {/* Modal RDV */}
      {rdvModal && selectedExpert && (
        <div className="modal-bg" onClick={() => setRdvModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{padding:"18px 24px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontWeight:700,fontSize:16,color:"#0A2540"}}>📅 Prendre rendez-vous</span>
              <button className="btn btn-s" style={{padding:"6px 10px"}} onClick={() => setRdvModal(false)}>✕</button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,padding:16,background:"#F7F9FC",borderRadius:12}}>
                <div className="avatar" style={{width:52,height:52,fontSize:18}}>
                  {selectedExpert.user?.prenom?.[0]}{selectedExpert.user?.nom?.[0]}
                </div>
                <div>
                  <div style={{fontWeight:700,color:"#0A2540",fontSize:15}}>{selectedExpert.user?.prenom} {selectedExpert.user?.nom}</div>
                  <div style={{fontSize:13,color:"#8A9AB5"}}>{selectedExpert.domaine}</div>
                  {selectedExpert.localisation && <div style={{fontSize:12,color:"#6B7280"}}>📍 {selectedExpert.localisation}</div>}
                </div>
              </div>
              <label className="lbl">Date et heure du rendez-vous</label>
              <input type="datetime-local" className="inp" value={rdvDate} onChange={e => setRdvDate(e.target.value)} />
            </div>
            <div style={{padding:"14px 24px",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"flex-end",gap:10}}>
              <button className="btn btn-s" onClick={() => setRdvModal(false)}>Annuler</button>
              <button className="btn btn-g" onClick={prendreRdv} disabled={!rdvDate}>📅 Confirmer le RDV</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Message */}
      {msgModal && msgExpert && (
        <div className="modal-bg" onClick={() => setMsgModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{padding:"18px 24px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontWeight:700,fontSize:16,color:"#0A2540"}}>💬 Envoyer un message</span>
              <button className="btn btn-s" style={{padding:"6px 10px"}} onClick={() => setMsgModal(false)}>✕</button>
            </div>
            <div style={{padding:24}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,padding:16,background:"#F7F9FC",borderRadius:12}}>
                <div className="avatar" style={{width:52,height:52,fontSize:18}}>
                  {msgExpert.user?.prenom?.[0]}{msgExpert.user?.nom?.[0]}
                </div>
                <div>
                  <div style={{fontWeight:700,color:"#0A2540",fontSize:15}}>{msgExpert.user?.prenom} {msgExpert.user?.nom}</div>
                  <div style={{fontSize:13,color:"#8A9AB5"}}>{msgExpert.domaine}</div>
                </div>
              </div>
              <label className="lbl">Votre message</label>
              <textarea className="inp" style={{minHeight:120}} placeholder="Écrivez votre message ici..." value={msgText} onChange={e => setMsgText(e.target.value)} />
            </div>
            <div style={{padding:"14px 24px",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"flex-end",gap:10}}>
              <button className="btn btn-s" onClick={() => { setMsgModal(false); setMsgText(""); }}>Annuler</button>
              <button className="btn btn-p" onClick={envoyerMessage} disabled={!msgText.trim()}>📤 Envoyer</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{background:"#0A2540",height:62,padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(10,37,64,.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,background:"#F7B500",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:"#0A2540"}}>BEH</div>
          <div>
            <div style={{color:"#fff",fontWeight:700,fontSize:14}}>Espace Startup</div>
            <div style={{color:"rgba(255,255,255,.4)",fontSize:11}}>{startup?.nom_startup || `${user?.prenom} ${user?.nom}`}</div>
          </div>
        </div>
        <button className="btn btn-s" style={{color:"rgba(255,255,255,.7)",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)"}}
          onClick={() => { localStorage.clear(); router.push("/"); }}>
          Déconnexion
        </button>
      </header>

      {/* Tabs */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8EEF6"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",display:"flex",gap:24}}>
          {[
            { id:"dashboard",  label:"🏠 Accueil" },
            { id:"profil",     label:"🚀 Mon Profil" },
            { id:"experts",    label:`🎯 Experts (${experts.length})` },
            { id:"rendezvous", label:`📅 RDV (${rdvs.length})` },
            { id:"messages",   label:`💬 Messages${unreadTotal > 0 ? ` (${unreadTotal})` : ""}` },
          ].map(t => (
            <button key={t.id} className={`tab${tab===t.id?" active":""}`} onClick={() => { setTab(t.id as Tab); setSelectedConv(null); }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main style={{maxWidth:1100,margin:"0 auto",padding:"28px 24px"}}>

        {/* ══ DASHBOARD ══ */}
        {tab === "dashboard" && (
          <div>
            {startup?.statut === "en_attente" && (
              <div style={{background:"linear-gradient(135deg,#FFF8E1,#FFF3CD)",border:"1px solid #F7B500",borderRadius:16,padding:"20px 24px",marginBottom:20,display:"flex",alignItems:"center",gap:16}}>
                <div style={{fontSize:32}}>⏳</div>
                <div>
                  <div style={{fontWeight:700,color:"#B45309",fontSize:15}}>Compte en attente de validation</div>
                  <div style={{color:"#92400E",fontSize:13,marginTop:4}}>Vous recevrez un email dès la validation.</div>
                </div>
              </div>
            )}
            {startup?.statut === "valide" && (
              <div style={{background:"linear-gradient(135deg,#ECFDF5,#D1FAE5)",border:"1px solid #A7F3D0",borderRadius:16,padding:"20px 24px",marginBottom:20,display:"flex",alignItems:"center",gap:16}}>
                <div style={{fontSize:32}}>✅</div>
                <div>
                  <div style={{fontWeight:700,color:"#059669",fontSize:15}}>Compte validé !</div>
                  <div style={{color:"#065F46",fontSize:13,marginTop:4}}>Vous pouvez contacter des experts et prendre des rendez-vous.</div>
                </div>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:20}}>
              {[
                { label:"Experts", val:experts.length, color:"#8B5CF6", icon:"🎯" },
                { label:"RDV",     val:rdvs.length,    color:"#3B82F6", icon:"📅" },
                { label:"Messages",val:messages.length,color:"#10B981", icon:"💬" },
                { label:"Non lus", val:unreadTotal,    color:"#EF4444", icon:"🔔" },
              ].map((s,i) => (
                <div key={i} className="card" style={{padding:"20px 24px",display:"flex",alignItems:"center",gap:16}}>
                  <div style={{fontSize:28}}>{s.icon}</div>
                  <div>
                    <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.val}</div>
                    <div style={{fontSize:12,color:"#8A9AB5",marginTop:4}}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Experts récents */}
            {experts.length > 0 && (
              <div className="card" style={{padding:"20px 24px",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                  <span style={{fontWeight:700,fontSize:15,color:"#0A2540"}}>Experts disponibles</span>
                  <button className="btn btn-s" onClick={() => setTab("experts")}>Voir tous →</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
                  {experts.slice(0,3).map(e => (
                    <div key={e.id} style={{background:"#F7F9FC",borderRadius:12,padding:"14px",border:"1px solid #E8EEF6"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                        <div className="avatar" style={{width:38,height:38,fontSize:13}}>
                          {e.photo ? <img src={`${BASE}/uploads/photos/${e.photo}`} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"50%"}}/> : `${e.user?.prenom?.[0]}${e.user?.nom?.[0]}`}
                        </div>
                        <div>
                          <div style={{fontWeight:600,fontSize:13,color:"#0A2540"}}>{e.user?.prenom} {e.user?.nom}</div>
                          <div style={{fontSize:11,color:"#8A9AB5"}}>{e.domaine}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button className="btn btn-s" style={{flex:1,justifyContent:"center",fontSize:11,padding:"6px"}}
                          onClick={() => { setMsgExpert(e); setMsgModal(true); }}>
                          💬
                        </button>
                        <button className="btn btn-g" style={{flex:1,justifyContent:"center",fontSize:11,padding:"6px"}}
                          onClick={() => { setSelectedExpert(e); setRdvModal(true); }}>
                          📅
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ PROFIL ══ */}
        {tab === "profil" && (
          <div style={{maxWidth:700,margin:"0 auto"}}>
            <div className="card" style={{overflow:"hidden"}}>
              <div style={{padding:"18px 24px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#FAFBFE"}}>
                <span style={{fontWeight:700,fontSize:15,color:"#0A2540"}}>Profil Startup</span>
                {!editingProfil && <button className="btn btn-g" onClick={() => setEditingProfil(true)}>✏️ Modifier</button>}
              </div>
              {editingProfil ? (
                <form onSubmit={saveProfil}>
                  <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <div><label className="lbl">Nom startup *</label><input className="inp" type="text" value={form.nom_startup} onChange={e => setForm({...form,nom_startup:e.target.value})} required /></div>
                      <div><label className="lbl">Secteur</label><input className="inp" type="text" value={form.secteur} onChange={e => setForm({...form,secteur:e.target.value})} /></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <div><label className="lbl">Fonction</label>
                        <select className="inp" value={form.fonction} onChange={e => setForm({...form,fonction:e.target.value})}>
                          <option value="">Sélectionner...</option>
                          {["CEO / Fondateur","Co-fondateur","CTO","CFO","Directeur Commercial","Autre"].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div><label className="lbl">Effectif</label>
                        <select className="inp" value={form.taille} onChange={e => setForm({...form,taille:e.target.value})}>
                          <option value="">Sélectionner...</option>
                          {["1-5","6-10","11-50","51-200","200+"].map(v => <option key={v} value={v}>{v} personnes</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <div><label className="lbl">Site web</label><input className="inp" type="text" value={form.site_web} onChange={e => setForm({...form,site_web:e.target.value})} /></div>
                      <div><label className="lbl">Localisation</label><input className="inp" type="text" value={form.localisation} onChange={e => setForm({...form,localisation:e.target.value})} /></div>
                    </div>
                    <div><label className="lbl">Description</label><textarea className="inp" value={form.description} onChange={e => setForm({...form,description:e.target.value})} /></div>
                  </div>
                  <div style={{padding:"14px 24px",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"flex-end",gap:10}}>
                    <button type="button" className="btn btn-s" onClick={() => setEditingProfil(false)}>Annuler</button>
                    <button type="submit" className="btn btn-g" disabled={savingProfil}>{savingProfil?"Enregistrement...":"💾 Enregistrer"}</button>
                  </div>
                </form>
              ) : (
                <div style={{padding:24}}>
                  {[
                    { lbl:"Responsable", val:`${user?.prenom} ${user?.nom}` },
                    { lbl:"Email",       val:user?.email },
                    { lbl:"Startup",     val:startup?.nom_startup||"-" },
                    { lbl:"Secteur",     val:startup?.secteur||"-" },
                    { lbl:"Fonction",    val:startup?.fonction||"-" },
                    { lbl:"Effectif",    val:startup?.taille||"-" },
                    { lbl:"Site web",    val:startup?.site_web||"-" },
                    { lbl:"Localisation",val:startup?.localisation||"-" },
                    { lbl:"Description", val:startup?.description||"-" },
                    { lbl:"Statut",      val:startup?.statut||"-" },
                  ].map((row,i) => (
                    <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid #F1F5F9"}}>
                      <div style={{fontSize:11,color:"#8A9AB5",fontWeight:700,textTransform:"uppercase" as const,width:120,flexShrink:0,paddingTop:2}}>{row.lbl}</div>
                      <div style={{fontSize:14,color:"#0A2540"}}>{row.val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ EXPERTS ══ */}
        {tab === "experts" && (
          <div>
            <div style={{fontWeight:700,fontSize:16,color:"#0A2540",marginBottom:16}}>🎯 Experts disponibles</div>
            {experts.length === 0 ? (
              <div className="card" style={{padding:40,textAlign:"center",color:"#8A9AB5"}}>
                <div style={{fontSize:40,marginBottom:12}}>🎯</div>
                <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Aucun expert disponible</div>
              </div>
            ) : (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
                {experts.map(e => (
                  <div key={e.id} className="expert-card">
                    {/* Photo */}
                    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                      <div style={{width:60,height:60,borderRadius:"50%",overflow:"hidden",background:"#0A2540",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #F7B500",flexShrink:0}}>
                        {e.photo ? (
                          <img src={`${BASE}/uploads/photos/${e.photo}`} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={(ev) => { (ev.currentTarget as HTMLImageElement).style.display="none"; }}/>
                        ) : (
                          <span style={{color:"#F7B500",fontWeight:800,fontSize:20}}>{e.user?.prenom?.[0]}{e.user?.nom?.[0]}</span>
                        )}
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:15,color:"#0A2540"}}>{e.user?.prenom} {e.user?.nom}</div>
                        <div style={{fontSize:12,color:"#8A9AB5",marginTop:2}}>{e.domaine || "-"}</div>
                        <span className="badge-ok" style={{marginTop:6,display:"inline-block"}}>✅ Disponible</span>
                      </div>
                    </div>

                    {/* Infos */}
                    <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
                      {e.experience  && <div style={{fontSize:12,color:"#6B7280"}}>💼 {e.experience}</div>}
                      {e.localisation && <div style={{fontSize:12,color:"#6B7280"}}>📍 {e.localisation}</div>}
                      {e.description  && <div style={{fontSize:12,color:"#6B7280",lineHeight:1.5}}>{e.description.substring(0,100)}{e.description.length>100?"...":""}</div>}
                    </div>

                    {/* Boutons */}
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn btn-s" style={{flex:1,justifyContent:"center"}}
                        onClick={() => { setMsgExpert(e); setMsgModal(true); }}>
                        💬 Message
                      </button>
                      <button className="btn btn-g" style={{flex:1,justifyContent:"center"}}
                        onClick={() => { setSelectedExpert(e); setRdvModal(true); }}>
                        📅 Rendez-vous
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ RENDEZ-VOUS ══ */}
        {tab === "rendezvous" && (
          <div>
            <div style={{fontWeight:700,fontSize:16,color:"#0A2540",marginBottom:16}}>📅 Mes rendez-vous</div>
            {rdvs.length === 0 ? (
              <div className="card" style={{padding:40,textAlign:"center",color:"#8A9AB5"}}>
                <div style={{fontSize:40,marginBottom:12}}>📅</div>
                <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Aucun rendez-vous</div>
                <button className="btn btn-g" style={{marginTop:12}} onClick={() => setTab("experts")}>🎯 Voir les experts</button>
              </div>
            ) : rdvs.map(r => (
              <div key={r.id} className="card" style={{padding:"16px 22px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div className="avatar">{r.expert?.user?.prenom?.[0]}{r.expert?.user?.nom?.[0]}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:"#0A2540"}}>{r.expert?.user?.prenom} {r.expert?.user?.nom}</div>
                    <div style={{fontSize:12,color:"#8A9AB5"}}>{r.expert?.domaine}</div>
                    <div style={{fontSize:13,color:"#6B7280",marginTop:4}}>
                      {new Date(r.date_rdv).toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{background:r.statut==="confirme"?"#ECFDF5":r.statut==="annule"?"#FEF2F2":"#FFF8E1",color:r.statut==="confirme"?"#059669":r.statut==="annule"?"#DC2626":"#B45309",border:`1px solid ${r.statut==="confirme"?"#A7F3D0":r.statut==="annule"?"#FECACA":"#F7B500"}`,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700}}>
                    {r.statut==="confirme"?"✅ Confirmé":r.statut==="annule"?"❌ Annulé":"⏳ En attente"}
                  </span>
                  {r.statut!=="annule" && (
                    <button className="btn btn-r" style={{fontSize:12,padding:"6px 12px"}} onClick={() => annulerRdv(r.id)}>Annuler</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ MESSAGES ══ */}
        {tab === "messages" && (
          <div className="card" style={{overflow:"hidden",display:"grid",gridTemplateColumns:"280px 1fr",height:560}}>
            {/* Liste conversations */}
            <div style={{borderRight:"1px solid #E8EEF6",overflowY:"auto"}}>
              <div style={{padding:"13px 16px",borderBottom:"1px solid #F1F5F9",fontWeight:700,fontSize:13,color:"#0A2540",background:"#FAFBFE"}}>
                Conversations
              </div>
              {convList.length === 0 ? (
                <div style={{padding:40,textAlign:"center",color:"#8A9AB5",fontSize:13}}>Aucune conversation</div>
              ) : convList.map((c: any) => {
                const last = c.messages[c.messages.length - 1];
                return (
                  <div key={c.otherId}
                    onClick={() => { setSelectedConv(c); loadConversation(c.otherId); }}
                    style={{padding:"12px 14px",cursor:"pointer",borderBottom:"1px solid #F1F5F9",background:selectedConv?.otherId===c.otherId?"#FFFBEB":"transparent"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div className="avatar" style={{width:36,height:36,fontSize:13}}>
                        {c.otherName.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <span style={{fontWeight:600,fontSize:13,color:"#0A2540"}}>{c.otherName}</span>
                          {c.unread > 0 && <span style={{background:"#F7B500",color:"#0A2540",borderRadius:99,padding:"1px 7px",fontSize:11,fontWeight:800}}>{c.unread}</span>}
                        </div>
                        <div style={{fontSize:12,color:"#8A9AB5",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{last?.contenu}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Zone conversation */}
            {selectedConv ? (
              <div style={{display:"flex",flexDirection:"column"}}>
                <div style={{padding:"12px 18px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",gap:12,background:"#FAFBFE"}}>
                  <div className="avatar" style={{width:36,height:36,fontSize:13}}>
                    {selectedConv.otherName.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div style={{fontWeight:700,fontSize:14,color:"#0A2540"}}>{selectedConv.otherName}</div>
                </div>
                <div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:10}}>
                  {convMessages.map((m: any) => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <div key={m.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start"}}>
                        <div className={isMe?"msg-me":"msg-other"}>
                          <div>{m.contenu}</div>
                          <div style={{fontSize:10,opacity:.45,marginTop:4}}>
                            {new Date(m.createdAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{padding:"12px 16px",borderTop:"1px solid #F1F5F9",display:"flex",gap:10}}>
                  <input className="inp" style={{flex:1}} placeholder="Écrire un message..." value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key==="Enter" && envoyerReponse()} />
                  <button className="btn btn-g" onClick={envoyerReponse} disabled={!replyText.trim()}>📤 Envoyer</button>
                </div>
              </div>
            ) : (
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",color:"#B8C4D6",fontSize:14,flexDirection:"column",gap:12}}>
                <div style={{fontSize:40}}>💬</div>
                <div>Sélectionnez une conversation</div>
                <button className="btn btn-g" onClick={() => setTab("experts")}>Contacter un expert</button>
              </div>
            )}
          </div>
        )}

      </main>
    </>
  );
}