"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const BASE = "http://localhost:3001";
type Tab = "dashboard"|"profil"|"messages"|"rendezvous"|"formations"|"demandes"|"devis";

// Génération des années pour le select
const currentYear = new Date().getFullYear();
const ANNEE_DEBUT_EXPERIENCE = Array.from(
  { length: currentYear - 1970 + 1 },
  (_, i) => 1970 + i
).reverse();

export default function DashboardExpert() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [expert, setExpert] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [messages, setMessages] = useState<any[]>([]);
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [mesFormations, setMesFormations] = useState<any[]>([]);
  const [demandesAssignees, setDemandesAssignees] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [toast, setToast] = useState({ text:"", ok:true });
  const [editingProfil, setEditingProfil] = useState(false);
  const [savingProfil, setSavingProfil] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [convMessages, setConvMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formPropoData, setFormPropoData] = useState({
    titre:"", description:"", duree:"", localisation:"",
    en_ligne:false, lien_formation:"",
    prix:0, gratuit:false,
    certifiante:false, dateDebut:"", dateFin:"", domaine:"",
    places_limitees: false, places_disponibles: 0,
  });
  const [form, setForm] = useState({
    domaine:"", description:"", localisation:"",
    telephone:"", annee_debut_experience:"",
  });
  const [experienceCalculee, setExperienceCalculee] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);

  // États pour les devis
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [devisMission, setDevisMission] = useState<any>(null);
  const [devisForm, setDevisForm] = useState({ montant: "", description: "", delai: "" });
  const [mesDevis, setMesDevis] = useState<any[]>([]);
  const [sendingDevis, setSendingDevis] = useState(false);

  const tk = () => localStorage.getItem("token") || "";
  const hdr = () => ({ Authorization: `Bearer ${tk()}` });
  const hdrJ = () => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" });

  // Rechargement périodique
  useEffect(() => {
    const interval = setInterval(() => {
      if (tab === "dashboard" || tab === "demandes") {
        loadDemandesAssignees();
        loadNotifications();
        loadMessages();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [tab]);

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
    loadNotifications();
    loadMesDevis();
  }, []);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [convMessages]);

  function notify(text:string, ok=true) {
    setToast({ text, ok });
    setTimeout(()=>setToast({text:"",ok:true}), 3500);
  }

  const calculerExperience = (annee: string | number | null | undefined): string => {
    if (!annee) return "";
    const anneeNum = typeof annee === "string" ? parseInt(annee, 10) : annee;
    if (isNaN(anneeNum)) return "";
    const ans = currentYear - anneeNum;
    if (ans < 0) return "";
    return `${ans} ${ans > 1 ? "ans" : "an"}`;
  };

  const handleAnneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const annee = e.target.value;
    setForm({ ...form, annee_debut_experience: annee });
    setExperienceCalculee(calculerExperience(annee));
  };

  // ─── CHARGEMENT DES DONNÉES ─────────────────────────────────────────────
  async function loadDemandesAssignees() {
    try {
      const r = await fetch(`${BASE}/demandes-service/expert/assignees`, { headers: hdr() });
      if (r.ok) setDemandesAssignees(await r.json());
      else setDemandesAssignees([]);
    } catch(e) { setDemandesAssignees([]); }
  }

  async function loadNotifications() {
    try {
      const r = await fetch(`${BASE}/demandes-service/expert/notifications`, { headers: hdr() });
      if (r.ok) setNotifications(await r.json());
      else setNotifications([]);
    } catch(e) { setNotifications([]); }
  }

  async function loadProfile() {
    try {
      const r = await fetch(`${BASE}/experts/moi`, { headers:hdr() });
      if (r.ok) {
        const d = await r.json();
        setExpert(d);
        if (d.photo) setPhotoUrl(`${BASE}/uploads/photos/${d.photo}?t=${Date.now()}`);
        else setPhotoUrl("");
        const annee = d.annee_debut_experience ? String(d.annee_debut_experience) : "";
        setForm({
          domaine: d.domaine || "",
          description: d.description || "",
          localisation: d.localisation || "",
          telephone: d.telephone || "",
          annee_debut_experience: annee,
        });
        setExperienceCalculee(calculerExperience(annee));
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

  async function loadMesFormations() {
    try {
      const res = await fetch(`${BASE}/formations/expert/mes-formations`, { headers: hdr() });
      if (!res.ok) {
        console.error(`Erreur HTTP ${res.status}`);
        setMesFormations([]);
        return;
      }
      const data = await res.json();
      setMesFormations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMesFormations([]);
    }
  }

  async function loadMesDevis() {
    try {
      const r = await fetch(`${BASE}/devis/expert/mes-devis`, { headers: hdr() });
      if (r.ok) setMesDevis(await r.json());
      else setMesDevis([]);
    } catch(e) { setMesDevis([]); }
  }

  // ─── ACTIONS ────────────────────────────────────────────────────────────
  async function creerDevis(e: React.FormEvent) {
    e.preventDefault();
    if (!devisForm.montant || !devisForm.description) {
      notify("Veuillez remplir le montant et la description", false);
      return;
    }
    setSendingDevis(true);
    try {
      const payload = {
        demande_id: devisMission.id,
        montant: parseFloat(devisForm.montant),
        description: devisForm.description,
        delai: devisForm.delai,
      };
      const r = await fetch(`${BASE}/devis`, { method: "POST", headers: hdrJ(), body: JSON.stringify(payload) });
      if (r.ok) {
        notify("✅ Devis envoyé !");
        setShowDevisModal(false);
        setDevisForm({ montant: "", description: "", delai: "" });
        loadMesDevis();
      } else {
        const err = await r.text();
        notify(`Erreur: ${err}`, false);
      }
    } catch(e) { notify("Erreur réseau", false); }
    setSendingDevis(false);
  }

  async function saveProfil(e:React.FormEvent) {
    e.preventDefault();
    if (!form.annee_debut_experience) {
      notify("Veuillez sélectionner une année de début d'expérience", false);
      return;
    }
    setSavingProfil(true);
    try {
      const payload = {
        ...form,
        annee_debut_experience: parseInt(form.annee_debut_experience, 10),
      };
      const r = await fetch(`${BASE}/experts/profil`, {
        method:"PUT",
        headers:hdrJ(),
        body:JSON.stringify(payload)
      });
      if (r.ok) {
        notify("✅ Modification envoyée à l'admin !");
        setEditingProfil(false);
        loadProfile();
      } else {
        const err = await r.text();
        notify(`Erreur: ${err}`, false);
      }
    } catch(e) { notify("Erreur", false); }
    setSavingProfil(false);
  }

  async function uploadPhoto(e:React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("photo", file);
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

  function resetFormModal() {
    setFormPropoData({
      titre:"", description:"", duree:"", localisation:"",
      en_ligne:false, lien_formation:"",
      prix:0, gratuit:false,
      certifiante:false, dateDebut:"", dateFin:"", domaine: expert?.domaine || "",
      places_limitees: false, places_disponibles: 0,
    });
    setFormImageFile(null);
    setFormImagePreview("");
  }

  async function proposerFormation(e:React.FormEvent) {
    e.preventDefault();
    if (!formPropoData.titre || !formPropoData.description) {
      notify("Veuillez remplir le titre et la description", false);
      return;
    }
    if (formPropoData.places_limitees && (!formPropoData.places_disponibles || formPropoData.places_disponibles <= 0)) {
      notify("Veuillez indiquer un nombre de places disponibles (>0)", false);
      return;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("titre", formPropoData.titre);
      formData.append("description", formPropoData.description);
      formData.append("duree", formPropoData.duree);
      formData.append("localisation", formPropoData.localisation);
      formData.append("en_ligne", String(formPropoData.en_ligne));
      formData.append("lien_formation", formPropoData.lien_formation);
      const nomFormateur = `${expert?.user?.prenom || user?.prenom || ''} ${expert?.user?.nom || user?.nom || ''}`.trim();
      formData.append("nom_formateur", nomFormateur);
      formData.append("domaine", formPropoData.domaine);
      formData.append("prix", String(formPropoData.prix));
      formData.append("gratuit", String(formPropoData.gratuit));
      formData.append("certifiante", String(formPropoData.certifiante));
      formData.append("dateDebut", formPropoData.dateDebut);
      formData.append("dateFin", formPropoData.dateFin);
      formData.append("type", "formation");
      formData.append("places_limitees", String(formPropoData.places_limitees));
      formData.append("places_disponibles", String(formPropoData.places_disponibles));
      if (formImageFile) formData.append("image", formImageFile);

      const r = await fetch(`${BASE}/formations/expert/proposer`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tk()}` },
        body: formData,
      });
      if (r.ok) {
        notify("✅ Formation proposée ! En attente de validation admin.");
        setShowFormModal(false);
        resetFormModal();
        await loadMesFormations();
      } else {
        const err = await r.text();
        notify(`Erreur: ${err}`, false);
      }
    } catch(e) {
      console.error("Erreur lors de la proposition :", e);
      notify("Erreur réseau", false);
    }
    setUploadingImage(false);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFormImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFormImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function accepterNotification(demandeId: number) {
    try {
      const r = await fetch(`${BASE}/demandes-service/${demandeId}/accepter-mission`, { method: 'PATCH', headers: hdrJ() });
      if (r.ok) {
        notify("✅ Vous avez accepté la mission ! L'admin va vous assigner.");
        await loadNotifications();
        await loadDemandesAssignees();
      } else notify("Erreur", false);
    } catch(e) { notify("Erreur réseau", false); }
  }

  async function refuserNotification(demandeId: number) {
    try {
      const r = await fetch(`${BASE}/demandes-service/${demandeId}/refuser-mission`, { method: 'PATCH', headers: hdrJ() });
      if (r.ok) {
        notify("❌ Mission refusée");
        await loadNotifications();
      } else notify("Erreur", false);
    } catch(e) { notify("Erreur réseau", false); }
  }

  // ─── CALCULS POUR L'INTERFACE ───────────────────────────────────────────
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

  const S = `
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
    .inp:disabled{opacity:.5;cursor:not-allowed;}
    textarea.inp{resize:vertical;min-height:90px;}
    select.inp{appearance:none;cursor:pointer;}
    .lbl{font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px;}
    .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px);}
    .modal{background:#fff;border-radius:20px;width:100%;max-width:640px;box-shadow:0 24px 80px rgba(10,37,64,.2);overflow:hidden;}
    .bw{background:#FFF8E1;color:#B45309;border:1px solid #F7B500;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
    .bo{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
    .bn{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
    .bc{background:#F3F0FF;color:#7C3AED;border:1px solid #DDD6FE;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
    .section-divider{height:1px;background:#F1F5F9;margin:20px 0;}
    .check-row{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13.5px;font-weight:600;color:#0A2540;}
    .check-row input{width:16px;height:16px;accent-color:#F7B500;cursor:pointer;}
    .img-preview{width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #E8EEF6;}
    .upload-zone{border:2px dashed #DDE4EF;border-radius:10px;padding:20px;text-align:center;cursor:pointer;transition:all .18s;}
    .upload-zone:hover{border-color:#F7B500;background:#FFFBEB;}
  `;

  return (
    <>
      <style>{S}</style>

      {/* Toast */}
      {toast.text && (
        <div style={{position:"fixed",top:20,right:20,zIndex:999,background:toast.ok?"#ECFDF5":"#FEF2F2",border:`1px solid ${toast.ok?"#A7F3D0":"#FECACA"}`,borderLeft:`3px solid ${toast.ok?"#059669":"#DC2626"}`,color:toast.ok?"#059669":"#DC2626",borderRadius:10,padding:"12px 18px",fontWeight:600,fontSize:13,boxShadow:"0 8px 24px rgba(0,0,0,.1)"}}>
          {toast.text}
        </div>
      )}

      {/* Modal proposer formation */}
      {showFormModal && (
        <div className="modal-bg" onClick={()=>{setShowFormModal(false);resetFormModal();}}>
          <div className="modal" style={{maxWidth:700,maxHeight:"92vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"18px 24px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#FAFBFE",position:"sticky",top:0,zIndex:10}}>
              <div><div style={{fontWeight:700,fontSize:16,color:"#0A2540"}}>📚 Proposer une formation</div><div style={{fontSize:12,color:"#8A9AB5",marginTop:2}}>En attente de validation par l'administrateur</div></div>
              <button className="btn btn-s" style={{padding:"6px 10px"}} onClick={()=>{setShowFormModal(false);resetFormModal();}}>✕</button>
            </div>
            <form onSubmit={proposerFormation}>
              <div style={{padding:24,display:"flex",flexDirection:"column",gap:0}}>
                <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#1D4ED8",marginBottom:20}}>
                  ℹ️ Votre formation sera soumise à l'admin pour validation avant d'être publiée.
                </div>
                {/* Section 1 : Informations essentielles */}
                <div style={{fontWeight:700,fontSize:13,color:"#0A2540",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:24,height:24,background:"#0A2540",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"#F7B500",fontSize:12,fontWeight:800}}>1</div>
                  Informations essentielles
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:8}}>
                  <div style={{gridColumn:"1/-1"}}><label className="lbl">Titre *</label><input className="inp" required value={formPropoData.titre} onChange={e=>setFormPropoData({...formPropoData,titre:e.target.value})} placeholder="Ex: Formation React & Next.js avancé"/></div>
                  <div><label className="lbl">Domaine</label><input className="inp" value={formPropoData.domaine} disabled /></div>
                  <div><label className="lbl">Formateur / Expert</label><input className="inp" value={`${user?.prenom || ''} ${user?.nom || ''}`} disabled /></div>
                  <div style={{gridColumn:"1/-1"}}><label className="lbl">Description *</label><textarea className="inp" required rows={4} value={formPropoData.description} onChange={e=>setFormPropoData({...formPropoData,description:e.target.value})} placeholder="Décrivez votre formation, les objectifs, le contenu, les prérequis..."/></div>
                </div>
                <div className="section-divider"/>
                {/* Section 2 : Modalités & dates */}
                <div style={{fontWeight:700,fontSize:13,color:"#0A2540",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:24,height:24,background:"#0A2540",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"#F7B500",fontSize:12,fontWeight:800}}>2</div>
                  Modalités & planning
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:8}}>
                  <div><label className="lbl">Date début</label><input type="date" className="inp" value={formPropoData.dateDebut} onChange={e=>setFormPropoData({...formPropoData,dateDebut:e.target.value})}/></div>
                  <div><label className="lbl">Date fin</label><input type="date" className="inp" value={formPropoData.dateFin} min={formPropoData.dateDebut||undefined} onChange={e=>setFormPropoData({...formPropoData,dateFin:e.target.value})}/></div>
                  <div><label className="lbl">Durée</label><input className="inp" value={formPropoData.duree} onChange={e=>setFormPropoData({...formPropoData,duree:e.target.value})} placeholder="Ex: 2 jours, 16h..."/></div>
                  <div><label className="lbl">Localisation</label><input className="inp" value={formPropoData.localisation} onChange={e=>setFormPropoData({...formPropoData,localisation:e.target.value})} placeholder="Ex: Tunis, Sfax..." disabled={formPropoData.en_ligne}/></div>
                  <div><label className="lbl">Lien formation</label><input className="inp" value={formPropoData.lien_formation} onChange={e=>setFormPropoData({...formPropoData,lien_formation:e.target.value})} placeholder="https://zoom.us/..."/></div>
                </div>
                <div style={{display:"flex",gap:20,flexWrap:"wrap",marginBottom:8}}>
                  <label className="check-row"><input type="checkbox" checked={formPropoData.en_ligne} onChange={e=>setFormPropoData({...formPropoData,en_ligne:e.target.checked,localisation:e.target.checked?"":formPropoData.localisation})}/> 💻 En ligne</label>
                  <label className="check-row"><input type="checkbox" checked={formPropoData.certifiante} onChange={e=>setFormPropoData({...formPropoData,certifiante:e.target.checked})}/> 🎓 Certifiante</label>
                </div>
                <div className="section-divider"/>
                {/* Section 3 : Tarification */}
                <div style={{fontWeight:700,fontSize:13,color:"#0A2540",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:24,height:24,background:"#0A2540",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"#F7B500",fontSize:12,fontWeight:800}}>3</div>
                  Tarification
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:8}}>
                  <div><label className="lbl">Prix (DT)</label><input className="inp" type="number" min="0" value={formPropoData.prix||0} disabled={formPropoData.gratuit} onChange={e=>setFormPropoData({...formPropoData,prix:+e.target.value})}/></div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"flex-start"}}><label className="check-row"><input type="checkbox" checked={formPropoData.gratuit} onChange={e=>setFormPropoData({...formPropoData,gratuit:e.target.checked,prix:e.target.checked?0:formPropoData.prix})}/> 🎁 Gratuite</label></div>
                </div>
                <div className="section-divider"/>
                {/* Section 4 : Places limitées */}
                <div style={{fontWeight:700,fontSize:13,color:"#0A2540",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:24,height:24,background:"#0A2540",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"#F7B500",fontSize:12,fontWeight:800}}>4</div>
                  Places disponibles
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:8}}>
                  <label className="check-row"><input type="checkbox" checked={formPropoData.places_limitees} onChange={e=>setFormPropoData({...formPropoData, places_limitees: e.target.checked, places_disponibles: e.target.checked ? 1 : 0})}/> 🔢 Places limitées</label>
                  {formPropoData.places_limitees && (
                    <div><label className="lbl">Nombre de places</label><input type="number" min="1" className="inp" value={formPropoData.places_disponibles} onChange={e=>setFormPropoData({...formPropoData, places_disponibles: parseInt(e.target.value)||0})}/></div>
                  )}
                </div>
                <div className="section-divider"/>
                {/* Section 5 : Image */}
                <div style={{fontWeight:700,fontSize:13,color:"#0A2540",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:24,height:24,background:"#0A2540",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",color:"#F7B500",fontSize:12,fontWeight:800}}>5</div>
                  Image de couverture
                </div>
                {formImagePreview ? (
                  <div style={{display:"flex",alignItems:"center",gap:16,padding:"14px",background:"#F8FAFC",borderRadius:10,border:"1px solid #E8EEF6"}}>
                    <img src={formImagePreview} alt="Aperçu" className="img-preview"/>
                    <div><div style={{fontSize:13,fontWeight:600,color:"#0A2540",marginBottom:8}}>Image sélectionnée</div><button type="button" className="btn btn-r" style={{padding:"6px 12px",fontSize:12}} onClick={()=>{setFormImageFile(null);setFormImagePreview("");}}>✕ Supprimer</button></div>
                  </div>
                ) : (
                  <label className="upload-zone">
                    <div style={{fontSize:28,marginBottom:8}}>🖼️</div>
                    <div style={{fontSize:13,fontWeight:600,color:"#8A9AB5",marginBottom:4}}>Cliquer pour choisir une image</div>
                    <div style={{fontSize:11,color:"#B8C4D6"}}>JPG, PNG — max 2 Mo</div>
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{display:"none"}}/>
                  </label>
                )}
              </div>
              <div style={{padding:"14px 24px",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#FAFBFE",position:"sticky",bottom:0}}>
                <div style={{fontSize:12,color:"#8A9AB5"}}>{formPropoData.titre ? `📚 ${formPropoData.titre}` : "Aucun titre saisi"}{formPropoData.dateDebut && formPropoData.dateFin && (<span style={{marginLeft:10,color:"#6B7280"}}>📅 {new Date(formPropoData.dateDebut).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} → {new Date(formPropoData.dateFin).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span>)}</div>
                <div style={{display:"flex",gap:10}}>
                  <button type="button" className="btn btn-s" onClick={()=>{setShowFormModal(false);resetFormModal();}}>Annuler</button>
                  <button type="submit" className="btn btn-g" disabled={uploadingImage} style={{padding:"11px 22px"}}>{uploadingImage ? "⏳ Envoi en cours..." : "📤 Soumettre à l'admin"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal devis */}
      {showDevisModal && devisMission && (
        <div className="modal-bg" onClick={() => setShowDevisModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>📄 Créer un devis</span>
              <button className="btn btn-s" onClick={() => setShowDevisModal(false)}>✕</button>
            </div>
            <form onSubmit={creerDevis} style={{ padding: "24px" }}>
              <div style={{ marginBottom: 16 }}><label className="lbl">Mission</label><input className="inp" value={devisMission.service || "Mission"} disabled /></div>
              <div style={{ marginBottom: 16 }}><label className="lbl">Montant (DT) *</label><input type="number" className="inp" placeholder="Ex: 1250" value={devisForm.montant} onChange={e => setDevisForm({ ...devisForm, montant: e.target.value })} required /></div>
              <div style={{ marginBottom: 16 }}><label className="lbl">Description du devis *</label><textarea className="inp" rows={3} placeholder="Détail des prestations, livrables..." value={devisForm.description} onChange={e => setDevisForm({ ...devisForm, description: e.target.value })} required /></div>
              <div style={{ marginBottom: 20 }}><label className="lbl">Délai (optionnel)</label><input className="inp" placeholder="Ex: 15 jours, 2 semaines..." value={devisForm.delai} onChange={e => setDevisForm({ ...devisForm, delai: e.target.value })} /></div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" className="btn btn-s" onClick={() => setShowDevisModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-g" disabled={sendingDevis}>{sendingDevis ? "⏳ Envoi..." : "📤 Envoyer le devis"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{background:"#0A2540",height:62,padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(10,37,64,.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,background:"#F7B500",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:"#0A2540"}}>BEH</div>
          <div><div style={{color:"#fff",fontWeight:700,fontSize:14}}>Espace Expert</div><div style={{color:"rgba(255,255,255,.4)",fontSize:11}}>{user?.prenom} {user?.nom}</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {notifications.length > 0 && (<div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifModal(true)}><span style={{ fontSize: 20 }}>🔔</span><span style={{ position: 'absolute', top: -5, right: -10, background: '#EF4444', color: '#fff', borderRadius: 99, padding: '2px 6px', fontSize: 10, fontWeight: 700 }}>{notifications.length}</span></div>)}
          {(unreadTotal>0||rdvEnAttente.length>0||demandesAssignees.length>0) && (<div style={{background:"#F7B500",color:"#0A2540",borderRadius:99,padding:"4px 12px",fontSize:12,fontWeight:800}}>🔔 {unreadTotal+rdvEnAttente.length+demandesAssignees.length} notifications</div>)}
          <button className="btn btn-s" style={{color:"rgba(255,255,255,.7)",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)"}} onClick={()=>{localStorage.clear();router.push("/");}}>Déconnexion</button>
        </div>
      </header>

      {/* Modale des notifications détaillées */}
      {showNotifModal && (
        <div className="modal-bg" onClick={() => setShowNotifModal(false)}>
          <div className="modal" style={{ maxWidth: 650, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: "#0A2540" }}>🔔 Nouvelles demandes ({notifications.length})</span>
              <button className="btn btn-s" onClick={() => setShowNotifModal(false)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              {notifications.length === 0 ? (<div style={{ textAlign: 'center', color: '#8A9AB5', padding: '40px 0' }}>Aucune notification</div>) : notifications.map(notif => {
                const serviceLabel = notif.service === "formation" ? "Formation" : notif.service;
                return (
                  <div key={notif.id} style={{ background: "#F8FAFC", borderRadius: 16, marginBottom: 20, border: "1px solid #E8EEF6", overflow: "hidden" }}>
                    <div style={{ background: "#fff", padding: "16px 20px", borderBottom: "1px solid #F1F5F9" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ background: "#EFF6FF", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "#1D4ED8" }}>{serviceLabel}</span><span style={{ fontSize: 12, color: "#8A9AB5" }}>{new Date(notif.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span></div>
                        <div style={{ display: "flex", gap: 8 }}><button className="btn btn-gr" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => accepterNotification(notif.id)}>✅ Accepter</button><button className="btn btn-r" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => refuserNotification(notif.id)}>❌ Refuser</button></div>
                      </div>
                    </div>
                    <div style={{ padding: "16px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}><div style={{ width: 40, height: 40, borderRadius: "50%", background: "#0A2540", color: "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{notif.user?.prenom?.[0]}{notif.user?.nom?.[0]}</div><div><div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>{notif.user?.prenom} {notif.user?.nom}</div><div style={{ fontSize: 12, color: "#64748B" }}>{notif.user?.startup?.nom_startup || "Startup"}</div></div></div>
                      <div style={{ marginBottom: 12 }}><div style={{ fontWeight: 600, fontSize: 12, color: "#7D8FAA", marginBottom: 4 }}>📝 Besoin :</div><p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.7, background: "#fff", padding: "10px 12px", borderRadius: 10, border: "1px solid #E8EEF6" }}>{notif.description || "Aucune description fournie"}</p></div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>{notif.delai && <span className="bw">⏱ {notif.delai}</span>}{notif.objectif && <span className="bc">🎯 {notif.objectif}</span>}{notif.type_application && <span style={{ background: "#E0F2FE", color: "#0369A1", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>💻 Type : {notif.type_application}</span>}{notif.telephone && <span className="bw">📞 {notif.telephone}</span>}</div>
                      <div style={{ fontSize: 12, color: "#8A9AB5", borderTop: "1px solid #F1F5F9", paddingTop: 10, marginTop: 6 }}>Demande reçue le {new Date(notif.createdAt).toLocaleString("fr-FR")}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8EEF6"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",display:"flex",gap:16,overflowX:"auto"}}>
          {[
            {id:"dashboard", label:"🏠 Accueil"},
            {id:"profil", label:"👤 Profil"},
            {id:"messages", label:`💬 Messages${unreadTotal>0?` (${unreadTotal})`:""}`},
            {id:"rendezvous", label:`📅 RDV${rdvEnAttente.length>0?` (${rdvEnAttente.length})`:""}`},
            {id:"formations", label:`📚 Mes formations${formationsAttente>0?` (${formationsAttente})`:""}`},
            {id:"demandes", label:`📋 Mes missions${demandesAssignees.length>0?` (${demandesAssignees.length})`:""}`},
            {id:"devis", label:`📄 Mes devis${mesDevis.length>0?` (${mesDevis.length})`:""}`},
          ].map(t=>(
            <button key={t.id} className={`tab${tab===t.id?" active":""}`} onClick={()=>{setTab(t.id as Tab);setSelectedConv(null);}}>{t.label}</button>
          ))}
        </div>
      </div>

      <main style={{maxWidth:1100,margin:"0 auto",padding:"28px 24px"}}>
        {/* DASHBOARD */}
        {tab==="dashboard" && (
          <div>
            {rdvEnAttente.length>0 && (<div style={{background:"linear-gradient(135deg,#EFF6FF,#DBEAFE)",border:"1px solid #93C5FD",borderRadius:16,padding:"16px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}><div style={{fontSize:28}}>📅</div><div><div style={{fontWeight:700,color:"#1D4ED8",fontSize:14}}>{rdvEnAttente.length} rendez-vous en attente de réponse</div><button className="btn btn-s" style={{marginTop:6,fontSize:12}} onClick={()=>setTab("rendezvous")}>Voir les rendez-vous →</button></div></div>)}
            {unreadTotal>0 && (<div style={{background:"linear-gradient(135deg,#ECFDF5,#D1FAE5)",border:"1px solid #A7F3D0",borderRadius:16,padding:"16px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}><div style={{fontSize:28}}>💬</div><div><div style={{fontWeight:700,color:"#059669",fontSize:14}}>{unreadTotal} message{unreadTotal>1?"s":""} non lu{unreadTotal>1?"s":""}</div><button className="btn btn-s" style={{marginTop:6,fontSize:12}} onClick={()=>setTab("messages")}>Voir les messages →</button></div></div>)}
            {demandesAssignees.length>0 && (<div style={{background:"linear-gradient(135deg,#FFF8E1,#FFF3CD)",border:"1px solid #F7B500",borderRadius:16,padding:"16px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}><div style={{fontSize:28}}>📋</div><div><div style={{fontWeight:700,color:"#B45309",fontSize:14}}>{demandesAssignees.length} mission{demandesAssignees.length>1?"s":""} assignée{demandesAssignees.length>1?"s":""}</div><button className="btn btn-s" style={{marginTop:6,fontSize:12}} onClick={()=>setTab("demandes")}>Voir mes missions →</button></div></div>)}
            {expert?.modification_demandee && (<div style={{background:"linear-gradient(135deg,#FFF8E1,#FFF3CD)",border:"1px solid #F7B500",borderRadius:16,padding:"16px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}><div style={{fontSize:28}}>⏳</div><div><div style={{fontWeight:700,color:"#B45309",fontSize:14}}>Modification de profil en attente de validation admin</div><div style={{color:"#92400E",fontSize:12,marginTop:2}}>L'admin va examiner vos modifications sous peu.</div></div></div>)}
            {expert?.statut==="valide" && !expert?.modification_demandee && (<div style={{background:"linear-gradient(135deg,#ECFDF5,#D1FAE5)",border:"1px solid #A7F3D0",borderRadius:16,padding:"16px 24px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}><div style={{fontSize:28}}>✅</div><div style={{fontWeight:700,color:"#059669",fontSize:14}}>Profil validé — Vous êtes visible sur la plateforme</div></div>)}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:20}}>
              {[{label:"Messages", val:messages.length, color:"#10B981",icon:"💬"},{label:"Non lus", val:unreadTotal, color:"#EF4444",icon:"🔔"},{label:"RDV en attente", val:rdvEnAttente.length, color:"#3B82F6",icon:"📅"},{label:"Mes missions", val:demandesAssignees.length, color:"#F7B500",icon:"📋"}].map((s,i)=>(
                <div key={i} className="card" style={{padding:"18px 20px",display:"flex",alignItems:"center",gap:14}}><div style={{fontSize:28}}>{s.icon}</div><div><div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.val}</div><div style={{fontSize:11,color:"#8A9AB5",marginTop:2}}>{s.label}</div></div></div>
              ))}
            </div>
            <div className="card" style={{padding:"20px 24px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}><span style={{fontWeight:700,fontSize:15,color:"#0A2540"}}>Mon profil</span><button className="btn btn-s" onClick={()=>setTab("profil")}>✏️ Modifier</button></div>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <div style={{position:"relative",flexShrink:0}}><div style={{width:56,height:56,borderRadius:"50%",border:"3px solid #F7B500",overflow:"hidden",background:"#0A2540",display:"flex",alignItems:"center",justifyContent:"center"}}>{photoUrl ? <img src={photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>setPhotoUrl("")}/> : <span style={{color:"#F7B500",fontWeight:800,fontSize:18}}>{user?.prenom?.[0]}{user?.nom?.[0]}</span>}</div><label style={{position:"absolute",bottom:0,right:0,width:20,height:20,background:"#F7B500",borderRadius:"50%",border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:uploading?"wait":"pointer",fontSize:10}}>📷<input type="file" accept="image/*" onChange={uploadPhoto} style={{display:"none"}} disabled={uploading}/></label></div>
                <div><div style={{fontWeight:700,fontSize:16,color:"#0A2540"}}>{user?.prenom} {user?.nom}</div><div style={{fontSize:13,color:"#8A9AB5"}}>{expert?.domaine||"Domaine non renseigné"}</div><div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>{expert?.statut==="valide"&&!expert?.modification_demandee&&<span className="bo">✅ Validé</span>}{expert?.statut==="en_attente"&&<span className="bw">⏳ En attente</span>}{expert?.modification_demandee&&<span className="bw">⚠️ Modif en attente</span>}{expert?.localisation&&<span style={{fontSize:11,color:"#6B7280"}}>📍 {expert.localisation}</span>}</div></div>
              </div>
            </div>
          </div>
        )}

        {/* PROFIL */}
        {tab==="profil" && (
          <div style={{maxWidth:700,margin:"0 auto"}}>
            <div className="card" style={{padding:"24px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:20}}>
                <div style={{position:"relative",flexShrink:0}}><div style={{width:88,height:88,borderRadius:"50%",overflow:"hidden",border:"3px solid #F7B500",background:"#0A2540",display:"flex",alignItems:"center",justifyContent:"center"}}>{photoUrl ? <img src={photoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>setPhotoUrl("")}/> : <span style={{color:"#F7B500",fontWeight:800,fontSize:28}}>{user?.prenom?.[0]}{user?.nom?.[0]}</span>}</div><label style={{position:"absolute",bottom:0,right:0,width:28,height:28,background:"#F7B500",borderRadius:"50%",border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:uploading?"wait":"pointer",fontSize:13}}>{uploading?"⏳":"📷"}<input type="file" accept="image/*" onChange={uploadPhoto} style={{display:"none"}} disabled={uploading}/></label></div>
                <div><div style={{fontWeight:800,fontSize:18,color:"#0A2540"}}>{user?.prenom} {user?.nom}</div><div style={{fontSize:13,color:"#8A9AB5",marginTop:2}}>{user?.email}</div><div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>{expert?.statut==="valide"&&!expert?.modification_demandee&&<span className="bo">✅ Validé</span>}{expert?.statut==="en_attente"&&<span className="bw">⏳ En attente</span>}{expert?.modification_demandee&&<span className="bw">⚠️ Modification en attente de validation</span>}</div><div style={{fontSize:11,color:"#8A9AB5",marginTop:6}}>Cliquez 📷 pour changer la photo</div></div>
              </div>
            </div>
            {expert?.modification_demandee && (<div style={{background:"#FFF8E1",border:"1px solid #F7B500",borderRadius:12,padding:"14px 18px",marginBottom:16}}><div style={{fontWeight:700,color:"#B45309",fontSize:13}}>⚠️ Vos modifications sont en attente de validation par l'admin</div></div>)}
            <div className="card" style={{overflow:"hidden"}}>
              <div style={{padding:"16px 24px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#FAFBFE"}}><span style={{fontWeight:700,fontSize:15,color:"#0A2540"}}>Informations professionnelles</span>{!editingProfil && (<button className="btn btn-g" onClick={()=>setEditingProfil(true)} disabled={!!expert?.modification_demandee}>{expert?.modification_demandee?"⏳ En attente...":"✏️ Modifier"}</button>)}</div>
              {editingProfil ? (
                <form onSubmit={saveProfil}>
                  <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
                    <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#1D4ED8"}}>ℹ️ Vos modifications seront soumises à l'admin pour validation avant publication.</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <div><label className="lbl">Domaine *</label><input className="inp" type="text" value={form.domaine} onChange={e=>setForm({...form,domaine:e.target.value})} required/></div>
                      <div><label className="lbl">Année de début d'expérience *</label>
                        <select className="inp" value={form.annee_debut_experience} onChange={handleAnneeChange} required>
                          <option value="">Sélectionnez l'année de début</option>
                          {ANNEE_DEBUT_EXPERIENCE.map(an => (
                            <option key={an} value={an}>{an}</option>
                          ))}
                        </select>
                        {experienceCalculee && (
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#10B981", marginTop: 6 }}>
                            ➡️ Expérience : {experienceCalculee}
                          </div>
                        )}
                      </div>
                    </div>
                    <div><label className="lbl">Description</label><textarea className="inp" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}><div><label className="lbl">Localisation</label><input className="inp" type="text" value={form.localisation} onChange={e=>setForm({...form,localisation:e.target.value})}/></div><div><label className="lbl">Téléphone</label><input className="inp" type="tel" value={form.telephone} onChange={e=>setForm({...form,telephone:e.target.value})}/></div></div>
                  </div>
                  <div style={{padding:"14px 24px",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"flex-end",gap:10}}><button type="button" className="btn btn-s" onClick={()=>setEditingProfil(false)}>Annuler</button><button type="submit" className="btn btn-g" disabled={savingProfil}>{savingProfil?"Envoi...":"📤 Envoyer pour validation"}</button></div>
                </form>
              ) : (
                <div style={{padding:24}}>
                  {[
                    {lbl:"Nom complet", val:`${user?.prenom} ${user?.nom}`},
                    {lbl:"Email", val:user?.email},
                    {lbl:"Téléphone", val:expert?.telephone||"-"},
                    {lbl:"Domaine", val:expert?.domaine||"-"},
                    {lbl:"Année de début", val:expert?.annee_debut_experience ? `${expert.annee_debut_experience} (${calculerExperience(expert.annee_debut_experience)} d'expérience)` : "Non renseignée"},
                    {lbl:"Localisation", val:expert?.localisation||"-"},
                    {lbl:"Description", val:expert?.description||"-"}
                  ].map((row,i)=>(
                    <div key={i} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid #F1F5F9"}}><div style={{fontSize:11,color:"#8A9AB5",fontWeight:700,textTransform:"uppercase" as const,width:120,flexShrink:0,paddingTop:2}}>{row.lbl}</div><div style={{fontSize:14,color:"#0A2540"}}>{row.val}</div></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {tab==="messages" && (
          <div className="card" style={{overflow:"hidden",display:"grid",gridTemplateColumns:"280px 1fr",height:580}}>
            <div style={{borderRight:"1px solid #E8EEF6",overflowY:"auto",display:"flex",flexDirection:"column"}}><div style={{padding:"13px 16px",borderBottom:"1px solid #F1F5F9",fontWeight:700,fontSize:13,color:"#0A2540",background:"#FAFBFE",flexShrink:0}}>💬 Conversations ({convList.length})</div>
              {convList.length===0 ? (<div style={{padding:40,textAlign:"center",color:"#8A9AB5",fontSize:13}}><div style={{fontSize:32,marginBottom:8}}>💬</div>Aucune conversation</div>) : convList.map((c:any)=>{const last=c.messages[c.messages.length-1];return (<div key={c.otherId} onClick={()=>{setSelectedConv(c);loadConversation(c.otherId);}} style={{padding:"12px 14px",cursor:"pointer",borderBottom:"1px solid #F1F5F9",background:selectedConv?.otherId===c.otherId?"#FFFBEB":"transparent",borderLeft:selectedConv?.otherId===c.otherId?"3px solid #F7B500":"3px solid transparent",transition:"all .15s"}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:38,height:38,borderRadius:"50%",background:"#0A2540",color:"#F7B500",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>{c.otherName.split(" ").map((w:string)=>w[0]||"").join("").slice(0,2).toUpperCase()||"?"}</div><div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontWeight:600,fontSize:13,color:"#0A2540"}}>{c.otherName||"Inconnu"}</span>{c.unread>0&&<span style={{background:"#F7B500",color:"#0A2540",borderRadius:99,padding:"1px 7px",fontSize:11,fontWeight:800}}>{c.unread}</span>}</div><div style={{fontSize:12,color:"#8A9AB5",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{last?.contenu||""}</div></div></div></div>);})}
            </div>
            {selectedConv ? (
              <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
                <div style={{padding:"12px 18px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",gap:12,background:"#FAFBFE",flexShrink:0}}><div style={{width:36,height:36,borderRadius:"50%",background:"#0A2540",color:"#F7B500",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13}}>{selectedConv.otherName.split(" ").map((w:string)=>w[0]||"").join("").slice(0,2).toUpperCase()}</div><div><div style={{fontWeight:700,fontSize:14,color:"#0A2540"}}>{selectedConv.otherName}</div><div style={{fontSize:11,color:"#8A9AB5"}}>Startup</div></div></div>
                <div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:10}}>{convMessages.length===0 ? <div style={{textAlign:"center",color:"#B8C4D6",padding:20}}>Aucun message</div> : convMessages.map((m:any)=>{const isMe=m.sender_id===user?.id;return (<div key={m.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start"}}><div style={{background:isMe?"#0A2540":"#F1F5F9",color:isMe?"#fff":"#0A2540",borderRadius:isMe?"14px 14px 2px 14px":"14px 14px 14px 2px",padding:"10px 14px",fontSize:13.5,maxWidth:"75%"}}><div>{m.contenu}</div><div style={{fontSize:10,opacity:.45,marginTop:4}}>{new Date(m.createdAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div></div></div>);})}<div ref={msgEndRef}/></div>
                <div style={{padding:"12px 16px",borderTop:"1px solid #F1F5F9",display:"flex",gap:10,flexShrink:0}}><input className="inp" style={{flex:1}} placeholder="Écrire un message..." value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&envoyerReponse()}/><button className="btn btn-g" onClick={envoyerReponse} disabled={!replyText.trim()}>📤</button></div>
              </div>
            ) : (
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",color:"#B8C4D6",fontSize:14,flexDirection:"column",gap:12}}><div style={{fontSize:48}}>💬</div><div style={{fontWeight:600,color:"#8A9AB5"}}>Sélectionnez une conversation</div></div>
            )}
          </div>
        )}

        {/* RENDEZ-VOUS */}
        {tab==="rendezvous" && (
          <div>
            {rdvEnAttente.length>0 && (<div style={{marginBottom:24}}><div style={{fontWeight:700,fontSize:15,color:"#0A2540",marginBottom:12}}>⏳ En attente de votre réponse ({rdvEnAttente.length})</div>{rdvEnAttente.map(r=>(
              <div key={r.id} className="card" style={{padding:"16px 22px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,borderLeft:"4px solid #F7B500"}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}><div style={{width:44,height:44,borderRadius:"50%",background:"#0A2540",color:"#F7B500",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16}}>{r.client?.prenom?.[0]}{r.client?.nom?.[0]}</div><div><div style={{fontWeight:700,fontSize:14,color:"#0A2540"}}>{r.client?.prenom} {r.client?.nom}</div><div style={{fontSize:13,color:"#6B7280",marginTop:2}}>📅 {new Date(r.date_rdv).toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div><div style={{fontSize:12,color:"#8A9AB5"}}>🕐 {new Date(r.date_rdv).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div></div></div>
                <div style={{display:"flex",gap:8}}><button className="btn btn-gr" onClick={()=>confirmerRdv(r.id)}>✅ Confirmer</button><button className="btn btn-r" onClick={()=>annulerRdv(r.id)}>❌ Refuser</button></div>
              </div>
            ))}</div>)}
            <div style={{fontWeight:700,fontSize:15,color:"#0A2540",marginBottom:12}}>📋 Tous mes rendez-vous ({rdvs.length})</div>
            {rdvs.length===0 ? (<div className="card" style={{padding:40,textAlign:"center",color:"#8A9AB5"}}><div style={{fontSize:40,marginBottom:12}}>📅</div><div style={{fontWeight:700,fontSize:16}}>Aucun rendez-vous</div></div>) : rdvs.map(r=>(
              <div key={r.id} className="card" style={{padding:"14px 20px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,borderRadius:"50%",background:"#0A2540",color:"#F7B500",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14}}>{r.client?.prenom?.[0]}{r.client?.nom?.[0]}</div><div><div style={{fontWeight:600,fontSize:14,color:"#0A2540"}}>{r.client?.prenom} {r.client?.nom}</div><div style={{fontSize:12,color:"#8A9AB5"}}>{new Date(r.date_rdv).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})}</div></div></div>
                <span style={{background:r.statut==="confirme"?"#ECFDF5":r.statut==="annule"?"#FEF2F2":"#FFF8E1",color:r.statut==="confirme"?"#059669":r.statut==="annule"?"#DC2626":"#B45309",border:`1px solid ${r.statut==="confirme"?"#A7F3D0":r.statut==="annule"?"#FECACA":"#F7B500"}`,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700}}>{r.statut==="confirme"?"✅ Confirmé":r.statut==="annule"?"❌ Annulé":"⏳ En attente"}</span>
              </div>
            ))}
          </div>
        )}

        {/* MES FORMATIONS */}
        {tab === "formations" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540" }}>📚 Mes formations proposées</div>
                <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>
                  {mesFormations.length} formation{mesFormations.length > 1 ? "s" : ""} ·{" "}
                  {mesFormations.filter(f => f.statut === "publie").length} publiées ·{" "}
                  {mesFormations.filter(f => f.statut === "en_attente").length} en attente
                </div>
              </div>
              <button className="btn btn-g" style={{ padding: "11px 22px", fontSize: 14 }} onClick={() => setShowFormModal(true)}>
                ➕ Proposer une formation
              </button>
            </div>

            {mesFormations.length === 0 ? (
              <div className="card" style={{ padding: 52, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>📚</div>
                <div style={{ fontWeight: 700, color: "#0A2540", fontSize: 16, marginBottom: 6 }}>Aucune formation proposée</div>
                <div style={{ fontSize: 13, color: "#8A9AB5", marginBottom: 20 }}>Proposez votre première formation. Elle sera visible après validation de l'admin.</div>
                <button className="btn btn-g" onClick={() => setShowFormModal(true)}>➕ Proposer une formation</button>
              </div>
            ) : (
              mesFormations.map(f => (
                <div
                  key={f.id}
                  className="card"
                  style={{
                    padding: "18px 22px",
                    marginBottom: 14,
                    borderLeft: `4px solid ${f.statut === "publie" ? "#22C55E" : f.statut === "refuse" ? "#EF4444" : "#F7B500"}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540", marginBottom: 6 }}>{f.titre}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}>
                        {f.gratuit || f.prix === 0 ? (
                          <span className="bo">🎁 Gratuit</span>
                        ) : (
                          <span className="bw">💰 {f.prix} DT</span>
                        )}
                        {f.duree && <span className="bw">⏱ {f.duree}</span>}
                        {f.certifiante && <span className="bc">🎓 Certifiante</span>}
                        {f.en_ligne && <span className="bo">💻 En ligne</span>}
                        {f.localisation && !f.en_ligne && <span className="bo">📍 {f.localisation}</span>}
                        {f.domaine && <span className="bw">📁 {f.domaine}</span>}
                        {f.places_limitees && (
                          <span className="bw">🎟️ {f.places_disponibles} place{f.places_disponibles > 1 ? "s" : ""} restante{f.places_disponibles > 1 ? "s" : ""}</span>
                        )}
                      </div>
                      {(f.dateDebut || f.dateFin) && (
                        <div style={{ fontSize: 12.5, color: "#6B7280", marginBottom: 8 }}>
                          {f.dateDebut && <span>📅 Début : {new Date(f.dateDebut).toLocaleDateString("fr-FR")}</span>}
                          {f.dateFin && <span style={{ marginLeft: 12 }}>🏁 Fin : {new Date(f.dateFin).toLocaleDateString("fr-FR")}</span>}
                        </div>
                      )}
                      {f.description && <p style={{ fontSize: 13.5, color: "#64748B", lineHeight: 1.75 }}>{f.description}</p>}
                      {f.image && (
                        <img
                          src={`${BASE}/uploads/formations/${f.image}`}
                          style={{ maxHeight: 80, borderRadius: 8, marginTop: 8 }}
                          alt=""
                        />
                      )}
                      {f.commentaire_admin && (
                        <div style={{ marginTop: 10, background: "#FFF8E1", padding: "8px 12px", borderRadius: 8 }}>
                          <strong>📩 Admin :</strong> {f.commentaire_admin}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 8 }}>
                        Soumis le {new Date(f.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <div>
                      <span className={`${f.statut === "publie" ? "bo" : f.statut === "refuse" ? "bn" : "bw"}`}>
                        {f.statut === "publie"
                          ? "✅ Publiée"
                          : f.statut === "refuse"
                          ? "❌ Refusée"
                          : "⏳ En attente"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* MES MISSIONS ASSIGNÉES */}
        {tab==="demandes" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540" }}>📋 Mes missions assignées</div><button className="btn btn-s" onClick={() => { loadNotifications(); loadDemandesAssignees(); }}>🔄 Rafraîchir</button></div>
            <div style={{ fontSize: 13, color: "#8A9AB5", marginBottom: 20 }}>{demandesAssignees.length} mission{demandesAssignees.length > 1 ? "s" : ""} assignée{demandesAssignees.length > 1 ? "s" : ""}</div>
            {demandesAssignees.length === 0 ? (
              <div className="card" style={{ padding: 52, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 14 }}>📋</div><div style={{ fontWeight: 700, color: "#0A2540", fontSize: 16, marginBottom: 6 }}>Aucune mission assignée</div><div style={{ fontSize: 13, color: "#8A9AB5" }}>L'admin vous assignera des demandes clients adaptées à votre expertise.</div></div>
            ) : demandesAssignees.map(d => (
              <div key={d.id} className="card" style={{ padding: "18px 22px", marginBottom: 14, borderLeft: `4px solid ${d.statut === "en_cours" ? "#3B82F6" : d.statut === "terminee" ? "#8B5CF6" : "#F7B500"}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}><div style={{ width: 40, height: 40, borderRadius: "50%", background: "#0A2540", color: "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{d.user?.prenom?.[0]}{d.user?.nom?.[0]}</div><div><div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>{d.user?.prenom} {d.user?.nom}</div><div style={{ fontSize: 11, color: "#8A9AB5" }}>{d.user?.email}</div></div></div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}><span style={{ background: "#EFF6FF", color: "#1D4ED8", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>🛠️ {d.service}</span>{d.budget && <span style={{ background: "#F0FDF4", color: "#16a34a", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>💰 {d.budget}</span>}{d.delai && <span style={{ background: "#FFF8E1", color: "#B45309", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>⏱ {d.delai}</span>}{d.telephone && <span style={{ background: "#F1F5F9", color: "#374151", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>📞 {d.telephone}</span>}</div>
                    {d.description && <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.75, margin: "0 0 8px", background: "#F8FAFC", padding: "10px 12px", borderRadius: 8, border: "1px solid #E8EEF6" }}>{d.description}</p>}
                    {d.objectif && <p style={{ fontSize: 13, color: "#7C3AED", margin: 0, fontWeight: 600 }}>🎯 Objectif : {d.objectif}</p>}
                    {d.note_suivi && <div style={{ marginTop: 8, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#1D4ED8" }}>📩 Note admin : {d.note_suivi}</div>}
                    <div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 8 }}>Assignée le {new Date(d.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                  </div>
                  <div style={{ flexShrink: 0, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <button className="btn btn-bl" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => { setDevisMission(d); setDevisForm({ montant: "", description: "", delai: "" }); setShowDevisModal(true); }}>📄 Créer un devis</button>
                    <span style={{ background: d.statut === "en_cours" ? "#EFF6FF" : d.statut === "terminee" ? "#F3F0FF" : "#FFF8E1", color: d.statut === "en_cours" ? "#1D4ED8" : d.statut === "terminee" ? "#7C3AED" : "#B45309", borderRadius: 99, padding: "6px 14px", fontSize: 12.5, fontWeight: 700, display: "inline-block", whiteSpace: "nowrap" as const }}>{d.statut === "en_cours" ? "🔄 En cours" : d.statut === "terminee" ? "✔️ Terminée" : "⏳ En attente"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MES DEVIS */}
        {tab === "devis" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540", marginBottom: 6 }}>📄 Mes devis envoyés</div>
            <div style={{ fontSize: 13, color: "#8A9AB5", marginBottom: 20 }}>{mesDevis.length} devis{mesDevis.length > 1 ? "s" : ""}</div>
            {mesDevis.length === 0 ? (
              <div className="card" style={{ padding: 52, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 14 }}>📄</div><div style={{ fontWeight: 700, color: "#0A2540", fontSize: 16, marginBottom: 6 }}>Aucun devis</div><div style={{ fontSize: 13, color: "#8A9AB5" }}>Créez des devis depuis vos missions assignées.</div></div>
            ) : mesDevis.map(d => (
              <div key={d.id} className="card" style={{ padding: "18px 22px", marginBottom: 14, borderLeft: `4px solid ${d.statut === "accepte" ? "#22C55E" : d.statut === "refuse" ? "#EF4444" : "#F7B500"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div><div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>Devis #{d.id} - {d.demande?.service || "Mission"}</div><div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Client : {d.demande?.user?.prenom} {d.demande?.user?.nom}</div><div style={{ fontSize: 13, fontWeight: 700, color: "#F7B500", marginTop: 6 }}>💰 {d.montant} DT</div>{d.description && <p style={{ fontSize: 13, color: "#475569", marginTop: 8, background: "#F8FAFC", padding: "8px 12px", borderRadius: 8 }}>{d.description}</p>}{d.delai && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>⏱ Délai : {d.delai}</div>}<div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 8 }}>Envoyé le {new Date(d.createdAt).toLocaleDateString("fr-FR")}</div></div>
                  <div><span style={{ background: d.statut === "accepte" ? "#ECFDF5" : d.statut === "refuse" ? "#FEF2F2" : "#FFF8E1", color: d.statut === "accepte" ? "#059669" : d.statut === "refuse" ? "#DC2626" : "#B45309", borderRadius: 99, padding: "6px 14px", fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>{d.statut === "accepte" ? "✅ Accepté" : d.statut === "refuse" ? "❌ Refusé" : "⏳ En attente"}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}