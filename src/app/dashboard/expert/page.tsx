"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const BASE = "http://localhost:3001";
type Tab = "dashboard"|"profil"|"messages"|"rendezvous"|"disponibilites"|"formations"|"demandes";

export default function DashboardExpert() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [expert, setExpert] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [messages, setMessages] = useState<any[]>([]);
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [dispos, setDispos] = useState<any[]>([]);
  const [mesFormations, setMesFormations] = useState<any[]>([]);
  const [demandesAssignees, setDemandesAssignees] = useState<any[]>([]);
  const [toast, setToast] = useState({ text:"", ok:true });
  const [editingProfil, setEditingProfil] = useState(false);
  const [savingProfil, setSavingProfil] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [convMessages, setConvMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [dispoModal, setDispoModal] = useState(false);
  const [newDispo, setNewDispo] = useState({ date:"", heureDebut:"", heureFin:"" });
  const [showFormModal, setShowFormModal] = useState(false);
  const [formPropoData, setFormPropoData] = useState({
    titre:"", description:"", duree:"", localisation:"",
    en_ligne:false, lien_formation:"", nom_formateur:"",
    places_limitees:"", niveau:"", prix:0, gratuit:false, image:""
  });
  const [form, setForm] = useState({
    domaine:"", description:"", localisation:"",
    telephone:"", experience:"", disponible:true,
  });
  const msgEndRef = useRef<HTMLDivElement>(null);

  const tk  = () => localStorage.getItem("token") || "";
  const hdr = () => ({ Authorization:`Bearer ${tk()}` });
  const hdrJ= () => ({ Authorization:`Bearer ${tk()}`, "Content-Type":"application/json" });

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { router.push("/connexion"); return; }
    const p = JSON.parse(u);
    if (p.role !== "expert") { router.push("/"); return; }
    setUser(p);
    loadProfile();
    loadMessages();
    loadRdvs();
    loadMesFormations();
    loadDemandesAssignees();
  }, []);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [convMessages]);

  function notify(text:string, ok=true) {
    setToast({ text, ok });
    setTimeout(()=>setToast({text:"",ok:true}), 3500);
  }

  async function loadDemandesAssignees() {
    try {
      const r = await fetch(`${BASE}/demandes-service/expert/assignees`, { headers:hdr() });
      if (r.ok) setDemandesAssignees(await r.json());
    } catch(e) {}
  }

  async function loadProfile() {
    try {
      const r = await fetch(`${BASE}/experts/moi`, { headers:hdr() });
      if (r.ok) {
        const d = await r.json();
        setExpert(d);
        if (d.photo) setPhotoUrl(`${BASE}/uploads/photos/${d.photo}?t=${Date.now()}`);
        else setPhotoUrl("");
        setForm({
          domaine:d.domaine||"", description:d.description||"",
          localisation:d.localisation||"", telephone:d.telephone||"",
          experience:d.experience||"", disponible:d.disponibilite!=="non disponible",
        });
        if (d.id) loadDispos(d.id);
      }
    } catch(e) {}
  }

  async function loadMessages() {
    try {
      const r = await fetch(`${BASE}/messages/expert`, { headers:hdr() });
      if (r.ok) setMessages(await r.json()); else setMessages([]);
    } catch(e) { setMessages([]); }
  }

  async function loadConversation(userId:number) {
    try {
      const r = await fetch(`${BASE}/messages/conversation/${userId}`, { headers:hdr() });
      if (r.ok) setConvMessages(await r.json());
    } catch(e) {}
  }

  async function loadRdvs() {
    try {
      const r = await fetch(`${BASE}/rendez-vous/expert`, { headers:hdr() });
      if (r.ok) setRdvs(await r.json()); else setRdvs([]);
    } catch(e) { setRdvs([]); }
  }

  async function loadDispos(id:number) {
    try {
      const r = await fetch(`${BASE}/disponibilites/expert/${id}`, { headers:hdr() });
      if (r.ok) setDispos(await r.json()); else setDispos([]);
    } catch(e) { setDispos([]); }
  }

  async function loadMesFormations() {
    try {
      const r = await fetch(`${BASE}/services-plateforme/expert/mes-formations`, { headers:hdr() });
      if (r.ok) setMesFormations(await r.json());
    } catch(e) {}
  }

  async function saveProfil(e:React.FormEvent) {
    e.preventDefault(); setSavingProfil(true);
    try {
      const r = await fetch(`${BASE}/experts/profil`, { method:"PUT", headers:hdrJ(), body:JSON.stringify(form) });
      if (r.ok) { notify("✅ Modification envoyée à l'admin !"); setEditingProfil(false); loadProfile(); }
      else notify("Erreur sauvegarde", false);
    } catch(e) { notify("Erreur", false); }
    setSavingProfil(false);
  }

  async function uploadPhoto(e:React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    try {
      const r = await fetch(`${BASE}/experts/photo`, { method:"POST", headers:hdr(), body:fd });
      if (r.ok) { notify("Photo mise à jour ✅"); await loadProfile(); }
      else notify("Erreur upload", false);
    } catch(e) { notify("Erreur", false); }
    setUploading(false);
  }

  async function envoyerReponse() {
    if (!replyText.trim() || !selectedConv) return;
    try {
      const r = await fetch(`${BASE}/messages`, { method:"POST", headers:hdrJ(), body:JSON.stringify({ receiver_id:selectedConv.otherId, contenu:replyText }) });
      if (r.ok) { setReplyText(""); loadConversation(selectedConv.otherId); loadMessages(); }
      else notify("Erreur envoi", false);
    } catch(e) { notify("Erreur", false); }
  }

  async function saveDispo(e:React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch(`${BASE}/disponibilites`, { method:"POST", headers:hdrJ(), body:JSON.stringify(newDispo) });
      if (r.ok) { notify("Créneau ajouté ✅"); setDispoModal(false); setNewDispo({date:"",heureDebut:"",heureFin:""}); if (expert?.id) loadDispos(expert.id); }
      else notify("Erreur", false);
    } catch(e) { notify("Erreur", false); }
  }

  async function deleteDispo(id:number) {
    if (!confirm("Supprimer ce créneau ?")) return;
    try {
      const r = await fetch(`${BASE}/disponibilites/${id}`, { method:"DELETE", headers:hdr() });
      if (r.ok) { notify("Supprimé"); if (expert?.id) loadDispos(expert.id); }
    } catch(e) { notify("Erreur", false); }
  }

  async function confirmerRdv(id:number) {
    try {
      const r = await fetch(`${BASE}/rendez-vous/${id}/confirmer`, { method:"PUT", headers:hdr() });
      if (r.ok) { notify("✅ Rendez-vous confirmé !"); loadRdvs(); }
    } catch(e) { notify("Erreur", false); }
  }

  async function annulerRdv(id:number) {
    try {
      const r = await fetch(`${BASE}/rendez-vous/${id}/annuler`, { method:"PUT", headers:hdr() });
      if (r.ok) { notify("Rendez-vous annulé"); loadRdvs(); }
    } catch(e) { notify("Erreur", false); }
  }

  async function proposerFormation(e:React.FormEvent) {
    e.preventDefault();
    try {
      const r = await fetch(`${BASE}/services-plateforme/expert/proposer`, {
        method:"POST", headers:hdrJ(),
        body:JSON.stringify({ ...formPropoData, type:"formation" }),
      });
      if (r.ok) {
        notify("✅ Formation proposée ! En attente de validation admin.");
        setShowFormModal(false);
        setFormPropoData({ titre:"", description:"", duree:"", localisation:"", en_ligne:false, lien_formation:"", nom_formateur:"", places_limitees:"", niveau:"", prix:0, gratuit:false, image:"" });
        loadMesFormations();
      } else notify("Erreur", false);
    } catch(e) { notify("Erreur", false); }
  }

  const conversations = messages.reduce((acc:any, m:any) => {
    const otherId = m.sender_id===user?.id ? m.receiver_id : m.sender_id;
    const otherName = m.sender_id===user?.id
      ? `${m.receiver?.prenom||""} ${m.receiver?.nom||""}`.trim()
      : `${m.sender?.prenom||""} ${m.sender?.nom||""}`.trim();
    if (!acc[otherId]) acc[otherId] = { otherId, otherName, messages:[], unread:0 };
    acc[otherId].messages.push(m);
    if (!m.lu && m.receiver_id===user?.id) acc[otherId].unread++;
    return acc;
  }, {});
  const convList = Object.values(conversations);
  const unreadTotal = messages.filter((m:any)=>!m.lu && m.receiver_id===user?.id).length;
  const rdvEnAttente = rdvs.filter(r=>r.statut==="en_attente");
  const formationsAttente = mesFormations.filter(f=>f.statut==="en_attente").length;

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
        .btn-gr{background:#ECFDF5;color:#059669;}.btn-gr:hover{background:#059669;color:#fff;}
        .btn-r{background:#FEF2F2;color:#DC2626;}.btn-r:hover{background:#DC2626;color:#fff;}
        .btn-bl{background:#EFF6FF;color:#1D4ED8;}.btn-bl:hover{background:#1D4ED8;color:#fff;}
        .btn:disabled{opacity:.55;cursor:not-allowed;}
        .tab{background:none;border:none;cursor:pointer;padding:14px 4px;font-size:13px;font-weight:500;color:#7D8FAA;border-bottom:2px solid transparent;font-family:'Outfit',sans-serif;transition:all .2s;}
        .tab.active{color:#0A2540;border-bottom-color:#F7B500;font-weight:700;}
        .inp{width:100%;background:#F7F9FC;border:1.5px solid #DDE4EF;border-radius:10px;padding:11px 14px;font-family:'Outfit',sans-serif;font-size:13.5px;color:#0A2540;outline:none;transition:border-color .18s;}
        .inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.1);}
        textarea.inp{resize:vertical;min-height:90px;}
        select.inp{appearance:none;cursor:pointer;}
        .lbl{font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px;}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px);}
        .modal{background:#fff;border-radius:20px;width:100%;max-width:560px;box-shadow:0 24px 80px rgba(10,37,64,.2);overflow:hidden;}
        .bw{background:#FFF8E1;color:#B45309;border:1px solid #F7B500;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .bo{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .bn{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
      `}</style>

      {/* Toast */}
      {toast.text && (
        <div style={{position:"fixed",top:20,right:20,zIndex:999,background:toast.ok?"#ECFDF5":"#FEF2F2",border:`1px solid ${toast.ok?"#A7F3D0":"#FECACA"}`,borderLeft:`3px solid ${toast.ok?"#059669":"#DC2626"}`,color:toast.ok?"#059669":"#DC2626",borderRadius:10,padding:"12px 18px",fontWeight:600,fontSize:13,boxShadow:"0 8px 24px rgba(0,0,0,.1)"}}>
          {toast.text}
        </div>
      )}

      {/* Modal Disponibilité */}
      {dispoModal && (
        <div className="modal-bg" onClick={()=>setDispoModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{padding:"18px 24px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontWeight:700,fontSize:16,color:"#0A2540"}}>🕐 Ajouter un créneau</span>
              <button className="btn btn-s" style={{padding:"6px 10px"}} onClick={()=>setDispoModal(false)}>✕</button>
            </div>
            <form onSubmit={saveDispo}>
              <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
                <div><label className="lbl">Date</label><input type="date" className="inp" value={newDispo.date} onChange={e=>setNewDispo({...newDispo,date:e.target.value})} required/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div><label className="lbl">Heure début</label><input type="time" className="inp" value={newDispo.heureDebut} onChange={e=>setNewDispo({...newDispo,heureDebut:e.target.value})} required/></div>
                  <div><label className="lbl">Heure fin</label><input type="time" className="inp" value={newDispo.heureFin} onChange={e=>setNewDispo({...newDispo,heureFin:e.target.value})} required/></div>
                </div>
              </div>
              <div style={{padding:"14px 24px",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"flex-end",gap:10}}>
                <button type="button" className="btn btn-s" onClick={()=>setDispoModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-g">✅ Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Proposer Formation */}
      {showFormModal && (
        <div className="modal-bg" onClick={()=>setShowFormModal(false)}>
          <div className="modal" style={{maxWidth:640,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"18px 24px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#FAFBFE",position:"sticky",top:0}}>
              <span style={{fontWeight:700,fontSize:16,color:"#0A2540"}}>📚 Proposer une formation</span>
              <button className="btn btn-s" style={{padding:"6px 10px"}} onClick={()=>setShowFormModal(false)}>✕</button>
            </div>
            <form onSubmit={proposerFormation}>
              <div style={{padding:24,display:"flex",flexDirection:"column",gap:14}}>
                <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#1D4ED8"}}>
                  ℹ️ Votre formation sera soumise à l'admin pour validation avant d'être publiée sur la page formations.
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <div style={{gridColumn:"1/-1"}}><label className="lbl">Titre *</label><input className="inp" required value={formPropoData.titre} onChange={e=>setFormPropoData({...formPropoData,titre:e.target.value})} placeholder="Ex: Formation React & Next.js"/></div>
                  <div><label className="lbl">Prix (DT)</label><input className="inp" type="number" min="0" value={formPropoData.prix||0} onChange={e=>setFormPropoData({...formPropoData,prix:+e.target.value})}/></div>
                  <div><label className="lbl">Durée</label><input className="inp" value={formPropoData.duree} onChange={e=>setFormPropoData({...formPropoData,duree:e.target.value})} placeholder="Ex: 2 jours, 16h..."/></div>
                  <div><label className="lbl">Niveau</label>
                    <select className="inp" value={formPropoData.niveau} onChange={e=>setFormPropoData({...formPropoData,niveau:e.target.value})}>
                      <option value="">Sélectionner...</option>
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                    </select>
                  </div>
                  <div><label className="lbl">Localisation</label><input className="inp" value={formPropoData.localisation} onChange={e=>setFormPropoData({...formPropoData,localisation:e.target.value})} placeholder="Ex: Tunis, Sfax..."/></div>
                  <div><label className="lbl">Lien formation (URL)</label><input className="inp" value={formPropoData.lien_formation} onChange={e=>setFormPropoData({...formPropoData,lien_formation:e.target.value})} placeholder="https://zoom.us/..."/></div>
                  <div><label className="lbl">Places limitées (0 = illimité)</label><input className="inp" type="number" min="0" value={formPropoData.places_limitees||""} onChange={e=>setFormPropoData({...formPropoData,places_limitees:e.target.value})}/></div>
                  <div style={{display:"flex",flexDirection:"column",gap:10,justifyContent:"flex-end"}}>
                    <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:600,color:"#0A2540"}}>
                      <input type="checkbox" checked={formPropoData.en_ligne} onChange={e=>setFormPropoData({...formPropoData,en_ligne:e.target.checked})} style={{width:16,height:16}}/>
                      💻 Formation en ligne
                    </label>
                    <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,fontWeight:600,color:"#0A2540"}}>
                      <input type="checkbox" checked={formPropoData.gratuit} onChange={e=>setFormPropoData({...formPropoData,gratuit:e.target.checked})} style={{width:16,height:16}}/>
                      🎁 Formation gratuite
                    </label>
                  </div>
                  <div style={{gridColumn:"1/-1"}}><label className="lbl">Description *</label><textarea className="inp" required rows={4} value={formPropoData.description} onChange={e=>setFormPropoData({...formPropoData,description:e.target.value})} placeholder="Décrivez votre formation, les objectifs, le contenu..."/></div>
                  <div style={{gridColumn:"1/-1"}}><label className="lbl">Image (URL)</label><input className="inp" value={formPropoData.image||""} onChange={e=>setFormPropoData({...formPropoData,image:e.target.value})} placeholder="https://..."/></div>
                </div>
              </div>
              <div style={{padding:"14px 24px",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"flex-end",gap:10}}>
                <button type="button" className="btn btn-s" onClick={()=>setShowFormModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-g" style={{padding:"11px 22px"}}>📤 Soumettre à l'admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{background:"#0A2540",height:62,padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(10,37,64,.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,background:"#F7B500",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:"#0A2540"}}>BEH</div>
          <div>
            <div style={{color:"#fff",fontWeight:700,fontSize:14}}>Espace Expert</div>
            <div style={{color:"rgba(255,255,255,.4)",fontSize:11}}>{user?.prenom} {user?.nom}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {(unreadTotal>0||rdvEnAttente.length>0||demandesAssignees.length>0) && (
            <div style={{background:"#F7B500",color:"#0A2540",borderRadius:99,padding:"4px 12px",fontSize:12,fontWeight:800}}>
              🔔 {unreadTotal+rdvEnAttente.length+demandesAssignees.length} notifications
            </div>
          )}
          <button className="btn btn-s" style={{color:"rgba(255,255,255,.7)",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)"}} onClick={()=>{localStorage.clear();router.push("/");}}>
            Déconnexion
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8EEF6"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",display:"flex",gap:16,overflowX:"auto"}}>
          {[
            {id:"dashboard",      label:"🏠 Accueil"},
            {id:"profil",         label:"👤 Profil"},
            {id:"messages",       label:`💬 Messages${unreadTotal>0?` (${unreadTotal})`:""}`},
            {id:"rendezvous",     label:`📅 RDV${rdvEnAttente.length>0?` (${rdvEnAttente.length})`:""}`},
            {id:"disponibilites", label:"🕐 Disponibilités"},
            {id:"formations",     label:`📚 Mes formations${formationsAttente>0?` (${formationsAttente})`:""}`},
            {id:"demandes",       label:`📋 Mes missions${demandesAssignees.length>0?` (${demandesAssignees.length})`:""}`},
          ].map(t=>(
            <button key={t.id} className={`tab${tab===t.id?" active":""}`} onClick={()=>{setTab(t.id as Tab);setSelectedConv(null);}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main style={{maxWidth:1100,margin:"0 auto",padding:"28px 24px"}}>

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard" && (
          <div>
            {rdvEnAttente.length>0 && (
              <div style={{background:"linear-gradient(135deg,#EFF6FF,#DBEAFE)",border:"1px solid #93C5FD",borderRadius:16,padding:"16px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
                <div style={{fontSize:28}}>📅</div>
                <div>
                  <div style={{fontWeight:700,color:"#1D4ED8",fontSize:14}}>{rdvEnAttente.length} rendez-vous en attente de réponse</div>
                  <button className="btn btn-s" style={{marginTop:6,fontSize:12}} onClick={()=>setTab("rendezvous")}>Voir les rendez-vous →</button>
                </div>
              </div>
            )}
            {unreadTotal>0 && (
              <div style={{background:"linear-gradient(135deg,#ECFDF5,#D1FAE5)",border:"1px solid #A7F3D0",borderRadius:16,padding:"16px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
                <div style={{fontSize:28}}>💬</div>
                <div>
                  <div style={{fontWeight:700,color:"#059669",fontSize:14}}>{unreadTotal} message{unreadTotal>1?"s":""} non lu{unreadTotal>1?"s":""}</div>
                  <button className="btn btn-s" style={{marginTop:6,fontSize:12}} onClick={()=>setTab("messages")}>Voir les messages →</button>
                </div>
              </div>
            )}
            {demandesAssignees.length>0 && (
              <div style={{background:"linear-gradient(135deg,#FFF8E1,#FFF3CD)",border:"1px solid #F7B500",borderRadius:16,padding:"16px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
                <div style={{fontSize:28}}>📋</div>
                <div>
                  <div style={{fontWeight:700,color:"#B45309",fontSize:14}}>{demandesAssignees.length} mission{demandesAssignees.length>1?"s":""} assignée{demandesAssignees.length>1?"s":""}</div>
                  <button className="btn btn-s" style={{marginTop:6,fontSize:12}} onClick={()=>setTab("demandes")}>Voir mes missions →</button>
                </div>
              </div>
            )}
            {expert?.modification_demandee && (
              <div style={{background:"linear-gradient(135deg,#FFF8E1,#FFF3CD)",border:"1px solid #F7B500",borderRadius:16,padding:"16px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
                <div style={{fontSize:28}}>⏳</div>
                <div>
                  <div style={{fontWeight:700,color:"#B45309",fontSize:14}}>Modification de profil en attente de validation admin</div>
                  <div style={{color:"#92400E",fontSize:12,marginTop:2}}>L'admin va examiner vos modifications sous peu.</div>
                </div>
              </div>
            )}
            {expert?.statut==="valide" && !expert?.modification_demandee && (
              <div style={{background:"linear-gradient(135deg,#ECFDF5,#D1FAE5)",border:"1px solid #A7F3D0",borderRadius:16,padding:"16px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
                <div style={{fontSize:28}}>✅</div>
                <div style={{fontWeight:700,color:"#059669",fontSize:14}}>Profil validé — Vous êtes visible sur la plateforme</div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:20}}>
              {[
                {label:"Messages",       val:messages.length,    color:"#10B981",icon:"💬"},
                {label:"Non lus",        val:unreadTotal,        color:"#EF4444",icon:"🔔"},
                {label:"RDV en attente", val:rdvEnAttente.length,color:"#3B82F6",icon:"📅"},
                {label:"Mes missions",   val:demandesAssignees.length,color:"#F7B500",icon:"📋"},
              ].map((s,i)=>(
                <div key={i} className="card" style={{padding:"18px 20px",display:"flex",alignItems:"center",gap:14}}>
                  <div style={{fontSize:28}}>{s.icon}</div>
                  <div>
                    <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.val}</div>
                    <div style={{fontSize:11,color:"#8A9AB5",marginTop:2}}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{padding:"20px 24px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <span style={{fontWeight:700,fontSize:15,color:"#0A2540"}}>Mon profil</span>
                <button className="btn btn-s" onClick={()=>setTab("profil")}>✏️ Modifier</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <div style={{position:"relative",flexShrink:0}}>
                  <div style={{width:56,height:56,borderRadius:"50%",border:"3px solid #F7B500",overflow:"hidden",background:"#0A2540",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {photoUrl ? <img src={photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>setPhotoUrl("")}/> : <span style={{color:"#F7B500",fontWeight:800,fontSize:18}}>{user?.prenom?.[0]}{user?.nom?.[0]}</span>}
                  </div>
                  <label style={{position:"absolute",bottom:0,right:0,width:20,height:20,background:"#F7B500",borderRadius:"50%",border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:uploading?"wait":"pointer",fontSize:10}}>
                    📷<input type="file" accept="image/*" onChange={uploadPhoto} style={{display:"none"}} disabled={uploading}/>
                  </label>
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:16,color:"#0A2540"}}>{user?.prenom} {user?.nom}</div>
                  <div style={{fontSize:13,color:"#8A9AB5"}}>{expert?.domaine||"Domaine non renseigné"}</div>
                  <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                    {expert?.statut==="valide"&&!expert?.modification_demandee&&<span className="bo">✅ Validé</span>}
                    {expert?.statut==="en_attente"&&<span className="bw">⏳ En attente</span>}
                    {expert?.modification_demandee&&<span className="bw">⚠️ Modif en attente</span>}
                    {expert?.localisation&&<span style={{fontSize:11,color:"#6B7280"}}>📍 {expert.localisation}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ PROFIL ══ */}
        {tab==="profil" && (
          <div style={{maxWidth:700,margin:"0 auto"}}>
            <div className="card" style={{padding:"24px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:20}}>
                <div style={{position:"relative",flexShrink:0}}>
                  <div style={{width:88,height:88,borderRadius:"50%",overflow:"hidden",border:"3px solid #F7B500",background:"#0A2540",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {photoUrl ? <img src={photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>setPhotoUrl("")}/> : <span style={{color:"#F7B500",fontWeight:800,fontSize:28}}>{user?.prenom?.[0]}{user?.nom?.[0]}</span>}
                  </div>
                  <label style={{position:"absolute",bottom:0,right:0,width:28,height:28,background:"#F7B500",borderRadius:"50%",border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:uploading?"wait":"pointer",fontSize:13}}>
                    {uploading?"⏳":"📷"}<input type="file" accept="image/*" onChange={uploadPhoto} style={{display:"none"}} disabled={uploading}/>
                  </label>
                </div>
                <div>
                  <div style={{fontWeight:800,fontSize:18,color:"#0A2540"}}>{user?.prenom} {user?.nom}</div>
                  <div style={{fontSize:13,color:"#8A9AB5",marginTop:2}}>{user?.email}</div>
                  <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
                    {expert?.statut==="valide"&&!expert?.modification_demandee&&<span className="bo">✅ Validé</span>}
                    {expert?.statut==="en_attente"&&<span className="bw">⏳ En attente</span>}
                    {expert?.modification_demandee&&<span className="bw">⚠️ Modification en attente de validation</span>}
                  </div>
                  <div style={{fontSize:11,color:"#8A9AB5",marginTop:6}}>Cliquez 📷 pour changer la photo</div>
                </div>
              </div>
            </div>

            {expert?.modification_demandee && (
              <div style={{background:"#FFF8E1",border:"1px solid #F7B500",borderRadius:12,padding:"14px 18px",marginBottom:16}}>
                <div style={{fontWeight:700,color:"#B45309",fontSize:13}}>⚠️ Vos modifications sont en attente de validation par l'admin</div>
              </div>
            )}

            <div className="card" style={{overflow:"hidden"}}>
              <div style={{padding:"16px 24px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#FAFBFE"}}>
                <span style={{fontWeight:700,fontSize:15,color:"#0A2540"}}>Informations professionnelles</span>
                {!editingProfil && (
                  <button className="btn btn-g" onClick={()=>setEditingProfil(true)} disabled={!!expert?.modification_demandee}>
                    {expert?.modification_demandee?"⏳ En attente...":"✏️ Modifier"}
                  </button>
                )}
              </div>
              {editingProfil ? (
                <form onSubmit={saveProfil}>
                  <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
                    <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#1D4ED8"}}>
                      ℹ️ Vos modifications seront soumises à l'admin pour validation avant publication.
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <div><label className="lbl">Domaine *</label><input className="inp" type="text" value={form.domaine} onChange={e=>setForm({...form,domaine:e.target.value})} required/></div>
                      <div><label className="lbl">Expérience</label>
                        <select className="inp" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})}>
                          <option value="">Sélectionner...</option>
                          {["1-2 ans","3-5 ans","5-8 ans","8-12 ans","12+ ans"].map(v=><option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                    <div><label className="lbl">Description</label><textarea className="inp" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <div><label className="lbl">Localisation</label><input className="inp" type="text" value={form.localisation} onChange={e=>setForm({...form,localisation:e.target.value})}/></div>
                      <div><label className="lbl">Téléphone</label><input className="inp" type="tel" value={form.telephone} onChange={e=>setForm({...form,telephone:e.target.value})}/></div>
                    </div>
                    <div>
                      <label className="lbl" style={{marginBottom:10}}>Disponibilité</label>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        {[{val:true,label:"✅ Disponible"},{val:false,label:"❌ Non disponible"}].map(opt=>(
                          <div key={String(opt.val)} onClick={()=>setForm({...form,disponible:opt.val})}
                            style={{border:`1.5px solid ${form.disponible===opt.val?"#F7B500":"#DDE4EF"}`,borderRadius:10,padding:"12px",cursor:"pointer",background:form.disponible===opt.val?"rgba(247,181,0,.06)":"#F7F9FC"}}>
                            <div style={{fontWeight:700,fontSize:13,color:"#0A2540"}}>{opt.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{padding:"14px 24px",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"flex-end",gap:10}}>
                    <button type="button" className="btn btn-s" onClick={()=>setEditingProfil(false)}>Annuler</button>
                    <button type="submit" className="btn btn-g" disabled={savingProfil}>{savingProfil?"Envoi...":"📤 Envoyer pour validation"}</button>
                  </div>
                </form>
              ) : (
                <div style={{padding:24}}>
                  {[
                    {lbl:"Nom complet",  val:`${user?.prenom} ${user?.nom}`},
                    {lbl:"Email",        val:user?.email},
                    {lbl:"Téléphone",    val:expert?.telephone||"-"},
                    {lbl:"Domaine",      val:expert?.domaine||"-"},
                    {lbl:"Expérience",   val:expert?.experience||"-"},
                    {lbl:"Localisation", val:expert?.localisation||"-"},
                    {lbl:"Disponibilité",val:expert?.disponibilite||"-"},
                    {lbl:"Description",  val:expert?.description||"-"},
                  ].map((row,i)=>(
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

        {/* ══ MESSAGES ══ */}
        {tab==="messages" && (
          <div className="card" style={{overflow:"hidden",display:"grid",gridTemplateColumns:"280px 1fr",height:580}}>
            <div style={{borderRight:"1px solid #E8EEF6",overflowY:"auto",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"13px 16px",borderBottom:"1px solid #F1F5F9",fontWeight:700,fontSize:13,color:"#0A2540",background:"#FAFBFE",flexShrink:0}}>
                💬 Conversations ({convList.length})
              </div>
              {convList.length===0 ? (
                <div style={{padding:40,textAlign:"center",color:"#8A9AB5",fontSize:13}}><div style={{fontSize:32,marginBottom:8}}>💬</div>Aucune conversation</div>
              ) : convList.map((c:any)=>{
                const last = c.messages[c.messages.length-1];
                return (
                  <div key={c.otherId} onClick={()=>{setSelectedConv(c);loadConversation(c.otherId);}}
                    style={{padding:"12px 14px",cursor:"pointer",borderBottom:"1px solid #F1F5F9",background:selectedConv?.otherId===c.otherId?"#FFFBEB":"transparent",borderLeft:selectedConv?.otherId===c.otherId?"3px solid #F7B500":"3px solid transparent",transition:"all .15s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:38,height:38,borderRadius:"50%",background:"#0A2540",color:"#F7B500",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>
                        {c.otherName.split(" ").map((w:string)=>w[0]||"").join("").slice(0,2).toUpperCase()||"?"}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <span style={{fontWeight:600,fontSize:13,color:"#0A2540"}}>{c.otherName||"Inconnu"}</span>
                          {c.unread>0&&<span style={{background:"#F7B500",color:"#0A2540",borderRadius:99,padding:"1px 7px",fontSize:11,fontWeight:800}}>{c.unread}</span>}
                        </div>
                        <div style={{fontSize:12,color:"#8A9AB5",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{last?.contenu||""}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedConv ? (
              <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
                <div style={{padding:"12px 18px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",gap:12,background:"#FAFBFE",flexShrink:0}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"#0A2540",color:"#F7B500",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13}}>
                    {selectedConv.otherName.split(" ").map((w:string)=>w[0]||"").join("").slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:"#0A2540"}}>{selectedConv.otherName}</div>
                    <div style={{fontSize:11,color:"#8A9AB5"}}>Startup</div>
                  </div>
                </div>
                <div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:10}}>
                  {convMessages.length===0 ? <div style={{textAlign:"center",color:"#B8C4D6",padding:20}}>Aucun message</div>
                  : convMessages.map((m:any)=>{
                    const isMe = m.sender_id===user?.id;
                    return (
                      <div key={m.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start"}}>
                        <div style={{background:isMe?"#0A2540":"#F1F5F9",color:isMe?"#fff":"#0A2540",borderRadius:isMe?"14px 14px 2px 14px":"14px 14px 14px 2px",padding:"10px 14px",fontSize:13.5,maxWidth:"75%"}}>
                          <div>{m.contenu}</div>
                          <div style={{fontSize:10,opacity:.45,marginTop:4}}>{new Date(m.createdAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={msgEndRef}/>
                </div>
                <div style={{padding:"12px 16px",borderTop:"1px solid #F1F5F9",display:"flex",gap:10,flexShrink:0}}>
                  <input className="inp" style={{flex:1}} placeholder="Écrire un message..." value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&envoyerReponse()}/>
                  <button className="btn btn-g" onClick={envoyerReponse} disabled={!replyText.trim()}>📤</button>
                </div>
              </div>
            ) : (
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",color:"#B8C4D6",fontSize:14,flexDirection:"column",gap:12}}>
                <div style={{fontSize:48}}>💬</div>
                <div style={{fontWeight:600,color:"#8A9AB5"}}>Sélectionnez une conversation</div>
              </div>
            )}
          </div>
        )}

        {/* ══ RENDEZ-VOUS ══ */}
        {tab==="rendezvous" && (
          <div>
            {rdvEnAttente.length>0 && (
              <div style={{marginBottom:24}}>
                <div style={{fontWeight:700,fontSize:15,color:"#0A2540",marginBottom:12}}>⏳ En attente de votre réponse ({rdvEnAttente.length})</div>
                {rdvEnAttente.map(r=>(
                  <div key={r.id} className="card" style={{padding:"16px 22px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,borderLeft:"4px solid #F7B500"}}>
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <div style={{width:44,height:44,borderRadius:"50%",background:"#0A2540",color:"#F7B500",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16}}>
                        {r.client?.prenom?.[0]}{r.client?.nom?.[0]}
                      </div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:"#0A2540"}}>{r.client?.prenom} {r.client?.nom}</div>
                        <div style={{fontSize:13,color:"#6B7280",marginTop:2}}>📅 {new Date(r.date_rdv).toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
                        <div style={{fontSize:12,color:"#8A9AB5"}}>🕐 {new Date(r.date_rdv).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn btn-gr" onClick={()=>confirmerRdv(r.id)}>✅ Confirmer</button>
                      <button className="btn btn-r" onClick={()=>annulerRdv(r.id)}>❌ Refuser</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{fontWeight:700,fontSize:15,color:"#0A2540",marginBottom:12}}>📋 Tous mes rendez-vous ({rdvs.length})</div>
            {rdvs.length===0 ? (
              <div className="card" style={{padding:40,textAlign:"center",color:"#8A9AB5"}}><div style={{fontSize:40,marginBottom:12}}>📅</div><div style={{fontWeight:700,fontSize:16}}>Aucun rendez-vous</div></div>
            ) : rdvs.map(r=>(
              <div key={r.id} className="card" style={{padding:"14px 20px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:"#0A2540",color:"#F7B500",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14}}>{r.client?.prenom?.[0]}{r.client?.nom?.[0]}</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,color:"#0A2540"}}>{r.client?.prenom} {r.client?.nom}</div>
                    <div style={{fontSize:12,color:"#8A9AB5"}}>{new Date(r.date_rdv).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})}</div>
                  </div>
                </div>
                <span style={{background:r.statut==="confirme"?"#ECFDF5":r.statut==="annule"?"#FEF2F2":"#FFF8E1",color:r.statut==="confirme"?"#059669":r.statut==="annule"?"#DC2626":"#B45309",border:`1px solid ${r.statut==="confirme"?"#A7F3D0":r.statut==="annule"?"#FECACA":"#F7B500"}`,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700}}>
                  {r.statut==="confirme"?"✅ Confirmé":r.statut==="annule"?"❌ Annulé":"⏳ En attente"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ══ DISPONIBILITÉS ══ */}
        {tab==="disponibilites" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:16,color:"#0A2540"}}>🕐 Mes créneaux disponibles</div>
              <button className="btn btn-g" onClick={()=>setDispoModal(true)}>+ Ajouter un créneau</button>
            </div>
            {dispos.length===0 ? (
              <div className="card" style={{padding:52,textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:12}}>📅</div>
                <div style={{fontWeight:700,color:"#0A2540",fontSize:16,marginBottom:6}}>Aucun créneau défini</div>
                <div style={{fontSize:13,color:"#8A9AB5",marginBottom:20}}>Ajoutez vos disponibilités pour que les startups puissent prendre rendez-vous.</div>
                <button className="btn btn-g" onClick={()=>setDispoModal(true)}>+ Ajouter maintenant</button>
              </div>
            ) : dispos.map(d=>(
              <div key={d.id} className="card" style={{padding:"14px 20px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:40,height:40,background:"rgba(247,181,0,.12)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🕐</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,color:"#0A2540"}}>{new Date(d.date).toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
                    <div style={{fontSize:13,color:"#6B7280",marginTop:2}}>{d.heureDebut?.slice(0,5)} → {d.heureFin?.slice(0,5)}</div>
                  </div>
                </div>
                <button className="btn btn-r" onClick={()=>deleteDispo(d.id)}>🗑</button>
              </div>
            ))}
          </div>
        )}

        {/* ══ MES FORMATIONS ══ */}
        {tab==="formations" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontWeight:700,fontSize:17,color:"#0A2540"}}>📚 Mes formations proposées</div>
                <div style={{fontSize:13,color:"#8A9AB5",marginTop:2}}>{mesFormations.length} formation{mesFormations.length>1?"s":""} · {mesFormations.filter(f=>f.statut==="publie").length} publiées · {mesFormations.filter(f=>f.statut==="en_attente").length} en attente</div>
              </div>
              <button className="btn btn-g" style={{padding:"11px 22px",fontSize:14}} onClick={()=>setShowFormModal(true)}>
                ➕ Proposer une formation
              </button>
            </div>

            {mesFormations.length===0 ? (
              <div className="card" style={{padding:52,textAlign:"center"}}>
                <div style={{fontSize:48,marginBottom:14}}>📚</div>
                <div style={{fontWeight:700,color:"#0A2540",fontSize:16,marginBottom:6}}>Aucune formation proposée</div>
                <div style={{fontSize:13,color:"#8A9AB5",marginBottom:20}}>Proposez votre première formation. Elle sera visible après validation de l'admin.</div>
                <button className="btn btn-g" onClick={()=>setShowFormModal(true)}>➕ Proposer une formation</button>
              </div>
            ) : mesFormations.map(f=>(
              <div key={f.id} className="card" style={{padding:"18px 22px",marginBottom:14,borderLeft:`4px solid ${f.statut==="publie"?"#22C55E":f.statut==="refuse"?"#EF4444":"#F7B500"}`}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:16,color:"#0A2540",marginBottom:6}}>{f.titre}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:8}}>
                      {f.gratuit||f.prix===0 ? <span style={{background:"#ECFDF5",color:"#059669",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>🎁 Gratuit</span> : <span style={{background:"#EFF6FF",color:"#1D4ED8",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>💰 {f.prix} DT</span>}
                      {f.duree&&<span style={{background:"#FFF8E1",color:"#B45309",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>⏱ {f.duree}</span>}
                      {f.niveau&&<span style={{background:"#F3F0FF",color:"#7C3AED",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>{f.niveau}</span>}
                      {f.en_ligne&&<span style={{background:"#ECFDF5",color:"#059669",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>💻 En ligne</span>}
                      {f.localisation&&!f.en_ligne&&<span style={{background:"#F0FDF4",color:"#16a34a",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>📍 {f.localisation}</span>}
                      {f.lien_formation&&<a href={f.lien_formation} target="_blank" style={{background:"#EFF6FF",color:"#1D4ED8",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600,textDecoration:"none"}}>🔗 Lien</a>}
                      {f.places_limitees&&<span style={{background:"#FEF2F2",color:"#DC2626",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>👥 {f.places_limitees} places max</span>}
                    </div>
                    {f.description&&<p style={{fontSize:13.5,color:"#64748B",lineHeight:1.75,margin:0}}>{f.description}</p>}
                    {f.commentaire_admin&&(
                      <div style={{marginTop:10,background:f.statut==="publie"?"#ECFDF5":f.statut==="refuse"?"#FEF2F2":"#FFF8E1",border:`1px solid ${f.statut==="publie"?"#A7F3D0":f.statut==="refuse"?"#FECACA":"#F7B500"}`,borderRadius:10,padding:"10px 14px"}}>
                        <div style={{fontSize:11,fontWeight:700,color:f.statut==="publie"?"#059669":f.statut==="refuse"?"#DC2626":"#B45309",textTransform:"uppercase" as const,marginBottom:4}}>
                          📩 Commentaire de l'admin
                        </div>
                        <div style={{fontSize:13.5,color:"#334155"}}>{f.commentaire_admin}</div>
                      </div>
                    )}
                    <div style={{fontSize:11,color:"#8A9AB5",marginTop:8}}>Soumis le {new Date(f.createdAt).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</div>
                  </div>
                  <div style={{flexShrink:0}}>
                    <span style={{
                      background:f.statut==="publie"?"#ECFDF5":f.statut==="refuse"?"#FEF2F2":"#FFF8E1",
                      color:f.statut==="publie"?"#059669":f.statut==="refuse"?"#DC2626":"#B45309",
                      border:`1px solid ${f.statut==="publie"?"#A7F3D0":f.statut==="refuse"?"#FECACA":"#F7B500"}`,
                      borderRadius:99,padding:"6px 14px",fontSize:12.5,fontWeight:700,display:"inline-block",whiteSpace:"nowrap" as const
                    }}>
                      {f.statut==="publie"?"✅ Publiée sur le site":f.statut==="refuse"?"❌ Refusée":"⏳ En attente de validation"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ DEMANDES ASSIGNÉES (MES MISSIONS) ══ */}
        {tab==="demandes" && (
          <div>
            <div style={{fontWeight:700,fontSize:17,color:"#0A2540",marginBottom:6}}>📋 Mes missions assignées</div>
            <div style={{fontSize:13,color:"#8A9AB5",marginBottom:20}}>{demandesAssignees.length} mission{demandesAssignees.length>1?"s":""} assignée{demandesAssignees.length>1?"s":""}</div>
            {demandesAssignees.length===0 ? (
              <div className="card" style={{padding:52,textAlign:"center"}}>
                <div style={{fontSize:48,marginBottom:14}}>📋</div>
                <div style={{fontWeight:700,color:"#0A2540",fontSize:16,marginBottom:6}}>Aucune mission assignée</div>
                <div style={{fontSize:13,color:"#8A9AB5"}}>L'admin vous assignera des demandes clients adaptées à votre expertise.</div>
              </div>
            ) : demandesAssignees.map(d=>(
              <div key={d.id} className="card" style={{padding:"18px 22px",marginBottom:14,borderLeft:`4px solid ${d.statut==="en_cours"?"#3B82F6":d.statut==="terminee"?"#8B5CF6":"#F7B500"}`}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <div style={{width:40,height:40,borderRadius:"50%",background:"#0A2540",color:"#F7B500",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,flexShrink:0}}>{d.user?.prenom?.[0]}{d.user?.nom?.[0]}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:15,color:"#0A2540"}}>{d.user?.prenom} {d.user?.nom}</div>
                        <div style={{fontSize:11,color:"#8A9AB5"}}>{d.user?.email}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:8}}>
                      <span style={{background:"#EFF6FF",color:"#1D4ED8",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:700}}>🛠️ {d.service}</span>
                      {d.budget&&<span style={{background:"#F0FDF4",color:"#16a34a",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>💰 {d.budget}</span>}
                      {d.delai&&<span style={{background:"#FFF8E1",color:"#B45309",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>⏱ {d.delai}</span>}
                      {d.telephone&&<span style={{background:"#F1F5F9",color:"#374151",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600}}>📞 {d.telephone}</span>}
                    </div>
                    {d.description&&<p style={{fontSize:13.5,color:"#475569",lineHeight:1.75,margin:"0 0 8px",background:"#F8FAFC",padding:"10px 12px",borderRadius:8,border:"1px solid #E8EEF6"}}>{d.description}</p>}
                    {d.objectif&&<p style={{fontSize:13,color:"#7C3AED",margin:0,fontWeight:600}}>🎯 Objectif : {d.objectif}</p>}
                    {d.note_suivi&&<div style={{marginTop:8,background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:8,padding:"8px 12px",fontSize:13,color:"#1D4ED8"}}>📩 Note admin : {d.note_suivi}</div>}
                    <div style={{fontSize:11,color:"#8A9AB5",marginTop:8}}>Assignée le {new Date(d.createdAt).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</div>
                  </div>
                  <div style={{flexShrink:0}}>
                    <span style={{
                      background:d.statut==="en_cours"?"#EFF6FF":d.statut==="terminee"?"#F3F0FF":"#FFF8E1",
                      color:d.statut==="en_cours"?"#1D4ED8":d.statut==="terminee"?"#7C3AED":"#B45309",
                      borderRadius:99,padding:"6px 14px",fontSize:12.5,fontWeight:700,display:"inline-block",whiteSpace:"nowrap" as const
                    }}>
                      {d.statut==="en_cours"?"🔄 En cours":d.statut==="terminee"?"✔️ Terminée":"⏳ En attente"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </>
  );
}