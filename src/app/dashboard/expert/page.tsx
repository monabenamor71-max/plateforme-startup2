"use client";
import { useEffect, useState } from "react";

type Tab = "dashboard" | "profil" | "messages" | "rendezvous" | "disponibilites";

const I = {
  dashboard: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  profil:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  message:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  calendar:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  clock:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  logout:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  edit:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  save:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  camera:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  check:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x:         () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  send:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  plus:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>,
  close:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  bell:      () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  map:       () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  brief:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  dollar:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  phone:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.74a16 16 0 0 0 6 6l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.46 16z"/></svg>,
};

function Avatar({ name, size=40, photo }: { name:string; size?:number; photo?:string }) {
  const ini = name.split(" ").map(w=>w[0]||"").join("").toUpperCase().slice(0,2)||"?";
  const colors = ["#1D4ED8","#7C3AED","#059669","#DC2626","#D97706","#0891B2","#BE185D"];
  const bg = colors[(ini.charCodeAt(0)||0)%colors.length];
  if (photo) return <img src={`http://localhost:3001/uploads/photos/${photo}`} alt="avatar" style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>;
  return <div style={{width:size,height:size,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:size*0.38,flexShrink:0}}>{ini}</div>;
}

function Badge({ label, color }: { label:string; color:"green"|"amber"|"red"|"blue"|"gray" }) {
  const m: Record<string,string[]> = {green:["#ECFDF5","#059669","#A7F3D0"],amber:["#FFFBEB","#D97706","#FDE68A"],red:["#FEF2F2","#DC2626","#FECACA"],blue:["#EFF6FF","#1D4ED8","#BFDBFE"],gray:["#F9FAFB","#6B7280","#E5E7EB"]};
  const [bg,txt,bdr]=m[color];
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:bg,color:txt,border:`1px solid ${bdr}`,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700}}><span style={{width:5,height:5,borderRadius:"50%",background:txt}}/>{label}</span>;
}

export default function DashboardExpert() {
  const [user,setUser]         = useState<any>(null);
  const [expert,setExpert]     = useState<any>(null);
  const [tab,setTab]           = useState<Tab>("dashboard");
  const [messages,setMessages] = useState<any[]>([]);
  const [rdvs,setRdvs]         = useState<any[]>([]);
  const [dispos,setDispos]     = useState<any[]>([]);
  const [toast,setToast]       = useState({text:"",ok:true});
  const [selectedConv,setSelectedConv] = useState<any>(null);
  const [replyText,setReplyText]       = useState("");
  const [sending,setSending]           = useState(false);

  // Profil
  const [editingProfil,setEditingProfil] = useState(false);
  const [savingProfil,setSavingProfil]   = useState(false);
  const [uploading,setUploading]         = useState(false);
  const [form,setForm] = useState({domaine:"",description:"",localisation:"",telephone:"",experience:"",tarif:"",disponible:true});

  // Dispo modal
  const [dispoModal,setDispoModal]       = useState(false);
  const [newDispo,setNewDispo]           = useState({date:"",heureDebut:"",heureFin:""});
  const [creatingDispo,setCreatingDispo] = useState(false);

  const tk  = ()=>localStorage.getItem("token")||"";
  const hdr = ()=>({Authorization:`Bearer ${tk()}`});
  const hdrJ= ()=>({Authorization:`Bearer ${tk()}`,"Content-Type":"application/json"});

  useEffect(()=>{
    const u=localStorage.getItem("user");
    if(!u){window.location.href="/connexion";return;}
    const p=JSON.parse(u);
    if(p.role!=="expert"){window.location.href="/";return;}
    setUser(p);
    loadProfile();
    loadMessages();
    loadRdvs();
  },[]);

  function notify(text:string,ok=true){setToast({text,ok});setTimeout(()=>setToast({text:"",ok:true}),3500);}

  async function loadProfile(){
    const r=await fetch("http://localhost:3001/experts/moi",{headers:hdr()});
    if(r.ok){
      const d=await r.json();
      setExpert(d);
      setForm({domaine:d.domaine||"",description:d.description||"",localisation:d.localisation||"",telephone:d.telephone||"",experience:d.experience||"",tarif:d.tarif||"",disponible:d.disponible!==false});
      if(d.id) loadDispos(d.id);
    }
  }
  async function loadMessages(){
    const r=await fetch("http://localhost:3001/messages/expert",{headers:hdr()}).catch(()=>null);
    if(r?.ok) setMessages(await r.json()); else setMessages([]);
  }
  async function loadRdvs(){
    const r=await fetch("http://localhost:3001/rendez-vous/expert",{headers:hdr()}).catch(()=>null);
    if(r?.ok) setRdvs(await r.json()); else setRdvs([]);
  }
  async function loadDispos(id:number){
    const r=await fetch(`http://localhost:3001/disponibilites/expert/${id}`,{headers:hdr()}).catch(()=>null);
    if(r?.ok) setDispos(await r.json()); else setDispos([]);
  }
  async function saveProfil(e:React.FormEvent){
    e.preventDefault(); setSavingProfil(true);
    const r=await fetch("http://localhost:3001/experts/profil",{method:"PUT",headers:hdrJ(),body:JSON.stringify(form)});
    r.ok?(notify("Profil mis à jour ✅"),setEditingProfil(false),loadProfile()):notify("Erreur sauvegarde",false);
    setSavingProfil(false);
  }
  async function uploadPhoto(e:React.ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0]; if(!file) return;
    setUploading(true);
    const fd=new FormData(); fd.append("photo",file);
    const r=await fetch("http://localhost:3001/experts/photo",{method:"POST",headers:hdr(),body:fd});
    r.ok?(notify("Photo mise à jour ✅"),loadProfile()):notify("Erreur upload",false);
    setUploading(false);
  }
  async function saveDispo(e:React.FormEvent){
    e.preventDefault(); setCreatingDispo(true);
    const r=await fetch("http://localhost:3001/disponibilites",{method:"POST",headers:hdrJ(),body:JSON.stringify(newDispo)});
    if(r.ok){notify("Créneau ajouté ✅");setDispoModal(false);setNewDispo({date:"",heureDebut:"",heureFin:""});expert?.id&&loadDispos(expert.id);}
    else notify("Erreur",false);
    setCreatingDispo(false);
  }
  async function deleteDispo(id:number){
    if(!confirm("Supprimer ce créneau ?")) return;
    const r=await fetch(`http://localhost:3001/disponibilites/${id}`,{method:"DELETE",headers:hdr()});
    r.ok?(notify("Supprimé"),expert?.id&&loadDispos(expert.id)):notify("Erreur",false);
  }
  async function confirmerRdv(id:number){const r=await fetch(`http://localhost:3001/rendez-vous/${id}/confirmer`,{method:"PUT",headers:hdr()});r.ok?(notify("Confirmé ✅"),loadRdvs()):notify("Erreur",false);}
  async function annulerRdv(id:number){const r=await fetch(`http://localhost:3001/rendez-vous/${id}/annuler`,{method:"PUT",headers:hdr()});r.ok?(notify("Annulé"),loadRdvs()):notify("Erreur",false);}
  async function envoyerReponse(){
    if(!replyText.trim()||!selectedConv) return; setSending(true);
    const r=await fetch("http://localhost:3001/messages",{method:"POST",headers:hdrJ(),body:JSON.stringify({destinataire_id:selectedConv.clientId,contenu:replyText})});
    if(r.ok){setReplyText("");loadMessages();}else notify("Erreur envoi",false);
    setSending(false);
  }

  const convMap=messages.reduce((acc,m)=>{
    const otherId=m.sender_id===user?.id?m.receiver_id:m.sender_id;
    if(!acc[otherId]) acc[otherId]={clientId:otherId,clientName:`${m.sender?.prenom||""} ${m.sender?.nom||""}`.trim(),messages:[]};
    acc[otherId].messages.push(m);
    return acc;
  },{} as Record<number,any>);
  const convList=Object.values(convMap) as any[];
  const unread=messages.filter(m=>!m.lu&&m.sender_id!==user?.id).length;
  const rdvFuturs=rdvs.filter(r=>new Date(r.date_rdv)>new Date()&&r.statut!=="annulé");
  const rdvPasses=rdvs.filter(r=>new Date(r.date_rdv)<=new Date()||r.statut==="annulé");
  const profilPct=[expert?.domaine,expert?.description,expert?.tarif,expert?.localisation,expert?.experience].filter(Boolean).length;
  const profilComplet=profilPct===5;

  if(!user) return null;

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Outfit',sans-serif;background:#F2F5F9;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
        .fade{animation:fadeIn .3s ease;}
        .card{background:#fff;border:1px solid #E8EEF6;border-radius:16px;}
        .card-h{transition:box-shadow .2s,border-color .2s;}
        .card-h:hover{box-shadow:0 8px 28px rgba(10,37,64,.09);border-color:rgba(247,181,0,.25);}
        .btn{font-family:'Outfit',sans-serif;font-weight:600;border:none;border-radius:9px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-size:13px;padding:9px 16px;transition:all .18s;}
        .btn-p{background:#0A2540;color:#fff;}.btn-p:hover{background:#F7B500;color:#0A2540;}
        .btn-g{background:#F7B500;color:#0A2540;box-shadow:0 4px 14px rgba(247,181,0,.22);}.btn-g:hover{background:#e6a800;transform:translateY(-1px);}
        .btn-s{background:#F1F5F9;color:#475569;}.btn-s:hover{background:#E2E8F0;}
        .btn-gr{background:#ECFDF5;color:#059669;}.btn-gr:hover{background:#059669;color:#fff;}
        .btn-r{background:#FEF2F2;color:#DC2626;}.btn-r:hover{background:#DC2626;color:#fff;}
        .btn:disabled{opacity:.55;cursor:not-allowed;transform:none!important;}
        .tab-btn{font-family:'Outfit',sans-serif;background:none;border:none;cursor:pointer;padding:14px 2px;font-size:13px;font-weight:500;color:#7D8FAA;border-bottom:2px solid transparent;transition:all .2s;display:flex;align-items:center;gap:6px;white-space:nowrap;}
        .tab-btn.active{color:#0A2540;border-bottom-color:#F7B500;font-weight:700;}
        .tab-btn:hover:not(.active){color:#0A2540;}
        .inp{width:100%;background:#F7F9FC;border:1.5px solid #DDE4EF;border-radius:10px;padding:11px 14px;font-family:'Outfit',sans-serif;font-size:13.5px;color:#0A2540;outline:none;transition:border-color .18s,box-shadow .18s;}
        .inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.1);background:#fff;}
        .inp::placeholder{color:#B8C4D6;}
        textarea.inp{resize:vertical;min-height:90px;}
        select.inp{appearance:none;cursor:pointer;}
        .lbl{font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px;}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px);}
        .modal{background:#fff;border-radius:20px;width:100%;max-width:480px;box-shadow:0 24px 80px rgba(10,37,64,.2);overflow:hidden;}
        .info-row{display:flex;align-items:flex-start;gap:10px;padding:12px 0;border-bottom:1px solid #F1F5F9;}
        .info-row:last-child{border-bottom:none;}
        .info-icon{width:30px;height:30px;border-radius:8px;background:#F7F9FC;border:1px solid #E8EEF6;display:flex;align-items:center;justify-content:center;color:#7D8FAA;flex-shrink:0;margin-top:2px;}
        .msg-me{background:#0A2540;color:#fff;border-radius:14px 14px 2px 14px;padding:10px 14px;font-size:13.5px;max-width:70%;}
        .msg-other{background:#F1F5F9;color:#0A2540;border-radius:14px 14px 14px 2px;padding:10px 14px;font-size:13.5px;max-width:70%;}
        .prog{height:6px;border-radius:99px;background:#E8EEF6;overflow:hidden;}
        .prog-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#F7B500,#D97706);transition:width .5s ease;}
      `}</style>

      {/* Toast */}
      {toast.text&&(
        <div className="fade" style={{position:"fixed",top:20,right:20,zIndex:999,background:toast.ok?"#ECFDF5":"#FEF2F2",border:`1px solid ${toast.ok?"#A7F3D0":"#FECACA"}`,borderLeft:`3px solid ${toast.ok?"#059669":"#DC2626"}`,color:toast.ok?"#059669":"#DC2626",borderRadius:10,padding:"12px 18px",fontWeight:600,fontSize:13,boxShadow:"0 8px 24px rgba(0,0,0,.1)"}}>
          {toast.text}
        </div>
      )}

      {/* Modal dispo */}
      {dispoModal&&(
        <div className="modal-bg" onClick={()=>setDispoModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{padding:"18px 24px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontWeight:700,fontSize:16,color:"#0A2540"}}>Ajouter un créneau</span>
              <button className="btn btn-s" style={{padding:"6px 8px"}} onClick={()=>setDispoModal(false)}><I.close/></button>
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
                <button type="submit" className="btn btn-g" disabled={creatingDispo}>{creatingDispo?"Ajout…":"Ajouter"}</button>
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
            <div style={{color:"rgba(255,255,255,.35)",fontSize:11}}>{user.prenom} {user.nom}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button style={{position:"relative",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,padding:8,color:"rgba(255,255,255,.7)",cursor:"pointer",display:"flex"}}>
            <I.bell/>
            {unread>0&&<span style={{position:"absolute",top:4,right:4,width:8,height:8,background:"#F7B500",borderRadius:"50%",border:"2px solid #0A2540"}}/>}
          </button>
          <button className="btn" onClick={()=>{localStorage.clear();window.location.href="/";}} style={{background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.7)",border:"1px solid rgba(255,255,255,.12)",fontSize:12}}>
            <I.logout/> Déconnexion
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{background:"#fff",borderBottom:"1px solid #E8EEF6"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px",display:"flex",gap:20}}>
          {([
            {id:"dashboard",     label:"Accueil",         icon:I.dashboard, badge:null},
            {id:"profil",        label:"Mon Profil",      icon:I.profil,    badge:!profilComplet?"!":null},
            {id:"messages",      label:"Messages",        icon:I.message,   badge:unread>0?unread:null},
            {id:"rendezvous",    label:"Rendez-vous",     icon:I.calendar,  badge:rdvFuturs.length>0?rdvFuturs.length:null},
            {id:"disponibilites",label:"Disponibilités",  icon:I.clock,     badge:null},
          ] as any[]).map(t=>(
            <button key={t.id} className={`tab-btn${tab===t.id?" active":""}`} onClick={()=>{setTab(t.id);setSelectedConv(null);}}>
              <t.icon/>{t.label}
              {t.badge!==null&&(
                <span style={{background:tab===t.id?"#F7B500":"#F1F5F9",color:tab===t.id?"#0A2540":"#7D8FAA",borderRadius:99,padding:"1px 7px",fontSize:11,fontWeight:800}}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main style={{maxWidth:1200,margin:"0 auto",padding:"28px 24px"}}>

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard"&&(
          <div className="fade">
            {/* Bannière complétion */}
            {!profilComplet&&(
              <div style={{background:"linear-gradient(135deg,#0A2540,#1a3f6f)",borderRadius:16,padding:"20px 24px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div>
                  <div style={{color:"#F7B500",fontWeight:700,fontSize:14,marginBottom:4}}>⚡ Complétez votre profil pour être visible</div>
                  <div style={{color:"rgba(255,255,255,.5)",fontSize:13}}>Un profil complet augmente vos chances d'être sélectionné par les startups.</div>
                  <div style={{marginTop:10}}>
                    <div className="prog" style={{width:220}}><div className="prog-fill" style={{width:`${profilPct/5*100}%`}}/></div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:4}}>{profilPct}/5 informations renseignées</div>
                  </div>
                </div>
                <button className="btn btn-g" onClick={()=>setTab("profil")}>Compléter mon profil →</button>
              </div>
            )}

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16,marginBottom:20}}>
              {[
                {label:"Messages",      val:messages.length,  sub:`${unread} non lus`,   color:"#3B82F6",icon:I.message},
                {label:"RDV à venir",   val:rdvFuturs.length, sub:`${rdvs.filter(r=>r.statut==="en_attente").length} en attente`, color:"#10B981",icon:I.calendar},
                {label:"Disponibilités",val:dispos.length,    sub:"créneaux définis",     color:"#F7B500",icon:I.clock},
                {label:"Profil",        val:expert?.valide?"✓":"⏳", sub:expert?.valide?"Validé":"En attente admin", color:expert?.valide?"#059669":"#D97706",icon:I.profil},
              ].map((s,i)=>(
                <div key={i} className="card card-h" style={{padding:"18px 20px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <div style={{width:34,height:34,borderRadius:9,background:`${s.color}18`,display:"flex",alignItems:"center",justifyContent:"center",color:s.color}}><s.icon/></div>
                    <span style={{fontSize:26,fontWeight:800,color:s.color}}>{s.val}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:"#0A2540"}}>{s.label}</div>
                  <div style={{fontSize:11.5,color:"#8A9AB5",marginTop:3}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Aperçu profil */}
            <div className="card" style={{padding:"20px 24px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <span style={{fontWeight:700,fontSize:15,color:"#0A2540"}}>Mon profil</span>
                <button className="btn btn-s" style={{fontSize:12}} onClick={()=>setTab("profil")}><I.edit/> Modifier</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                <div style={{position:"relative"}}>
                  <Avatar name={`${user.prenom} ${user.nom}`} size={60} photo={expert?.photo}/>
                  <label style={{position:"absolute",bottom:0,right:0,width:22,height:22,background:"#F7B500",borderRadius:"50%",border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#0A2540"}}>
                    <I.camera/><input type="file" accept="image/*" onChange={uploadPhoto} style={{display:"none"}}/>
                  </label>
                </div>
                <div style={{flex:1,minWidth:160}}>
                  <div style={{fontWeight:700,fontSize:17,color:"#0A2540"}}>{user.prenom} {user.nom}</div>
                  <div style={{fontSize:13,color:"#8A9AB5",marginTop:2}}>{expert?.domaine||"Domaine non renseigné"}</div>
                  <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                    {expert?.valide?<Badge label="Profil validé" color="green"/>:<Badge label="En attente" color="amber"/>}
                    {expert?.disponible&&<Badge label="Disponible" color="blue"/>}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {expert?.localisation&&<span style={{fontSize:12,color:"#6B7280",display:"flex",alignItems:"center",gap:5}}><I.map/>{expert.localisation}</span>}
                  {expert?.experience&&<span style={{fontSize:12,color:"#6B7280",display:"flex",alignItems:"center",gap:5}}><I.brief/>{expert.experience}</span>}
                  {expert?.tarif&&<span style={{fontSize:12,color:"#6B7280",display:"flex",alignItems:"center",gap:5}}><I.dollar/>{expert.tarif}</span>}
                </div>
              </div>
            </div>

            {convList.length>0&&(
              <div className="card" style={{padding:"18px 22px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <span style={{fontWeight:700,fontSize:15,color:"#0A2540"}}>Dernières conversations</span>
                  <button className="btn btn-s" style={{fontSize:12}} onClick={()=>setTab("messages")}>Voir tout →</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {convList.slice(0,3).map((c:any)=>{
                    const last=c.messages[c.messages.length-1];
                    return(
                      <div key={c.clientId} onClick={()=>{setTab("messages");setSelectedConv(c);}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,background:"#F7F9FC",border:"1px solid #E8EEF6",cursor:"pointer"}}>
                        <Avatar name={c.clientName} size={34}/>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:13.5,color:"#0A2540"}}>{c.clientName}</div>
                          <div style={{fontSize:12,color:"#8A9AB5",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{last.contenu}</div>
                        </div>
                        <div style={{fontSize:11,color:"#B8C4D6"}}>{new Date(last.createdAt).toLocaleDateString("fr-FR")}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ PROFIL ══ */}
        {tab==="profil"&&(
          <div className="fade" style={{maxWidth:720,margin:"0 auto"}}>
            {/* Photo + identité */}
            <div className="card" style={{padding:"24px 28px",marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
                <div style={{position:"relative",flexShrink:0}}>
                  <div style={{width:88,height:88,borderRadius:"50%",overflow:"hidden",border:"3px solid #F7B500",background:"#0A2540",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {expert?.photo?(
                      <img src={`http://localhost:3001/uploads/photos/${expert.photo}`} alt="photo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    ):(
                      <span style={{color:"#F7B500",fontWeight:800,fontSize:26}}>{user?.prenom?.[0]}{user?.nom?.[0]}</span>
                    )}
                  </div>
                  <label style={{position:"absolute",bottom:0,right:0,width:28,height:28,background:"#F7B500",borderRadius:"50%",border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:uploading?"wait":"pointer",color:"#0A2540"}}>
                    <I.camera/><input type="file" accept="image/*" onChange={uploadPhoto} style={{display:"none"}} disabled={uploading}/>
                  </label>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:19,color:"#0A2540"}}>{user?.prenom} {user?.nom}</div>
                  <div style={{fontSize:13,color:"#8A9AB5",marginTop:2}}>{user?.email}</div>
                  <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                    {expert?.valide?<Badge label="Profil validé" color="green"/>:<Badge label="En attente de validation" color="amber"/>}
                    {expert?.disponible&&<Badge label="Disponible" color="blue"/>}
                  </div>
                </div>
                {!editingProfil&&(
                  <button className="btn btn-g" onClick={()=>setEditingProfil(true)}><I.edit/> Modifier</button>
                )}
              </div>
              {uploading&&<div style={{marginTop:10,fontSize:12,color:"#8A9AB5"}}>⏳ Upload en cours…</div>}
            </div>

            {/* Barre de complétion */}
            {!profilComplet&&(
              <div style={{background:"rgba(247,181,0,.08)",border:"1px solid rgba(247,181,0,.2)",borderRadius:12,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#D97706",marginBottom:6}}>Profil incomplet — {profilPct}/5 champs renseignés</div>
                  <div className="prog"><div className="prog-fill" style={{width:`${profilPct/5*100}%`}}/></div>
                </div>
                <button className="btn btn-g" onClick={()=>setEditingProfil(true)}><I.edit/> Compléter</button>
              </div>
            )}

            {/* Formulaire ou vue */}
            {editingProfil?(
              <div className="card" style={{overflow:"hidden"}}>
                <div style={{padding:"16px 24px",borderBottom:"1px solid #F1F5F9",fontWeight:700,fontSize:15,color:"#0A2540",background:"#FAFBFE"}}>Modifier mes informations</div>
                <form onSubmit={saveProfil}>
                  <div style={{padding:24,display:"flex",flexDirection:"column",gap:18}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <div><label className="lbl">Domaine d'expertise *</label><input className="inp" type="text" placeholder="Ex: Marketing Digital" value={form.domaine} onChange={e=>setForm({...form,domaine:e.target.value})} required/></div>
                      <div><label className="lbl">Expérience</label>
                        <select className="inp" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})}>
                          <option value="">Sélectionner…</option>
                          {["1-2 ans","3-5 ans","5-8 ans","8-12 ans","12+ ans"].map(v=><option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                    <div><label className="lbl">Description *</label><textarea className="inp" placeholder="Présentez-vous en quelques lignes…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                      <div><label className="lbl">Localisation *</label><input className="inp" type="text" placeholder="Ex: Tunis, Sfax…" value={form.localisation} onChange={e=>setForm({...form,localisation:e.target.value})}/></div>
                      <div><label className="lbl">Téléphone</label><input className="inp" type="tel" placeholder="+216 00 000 000" value={form.telephone} onChange={e=>setForm({...form,telephone:e.target.value})}/></div>
                    </div>
                    <div><label className="lbl">Tarif horaire *</label><input className="inp" type="text" placeholder="Ex: 150 DT/h" value={form.tarif} onChange={e=>setForm({...form,tarif:e.target.value})}/></div>
                    <div>
                      <label className="lbl" style={{marginBottom:10}}>Disponibilité</label>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                        {[{val:true,label:"✅ Disponible",desc:"Ouvert aux nouvelles missions"},{val:false,label:"❌ Non disponible",desc:"Je ne prends pas de missions"}].map(opt=>(
                          <div key={String(opt.val)} onClick={()=>setForm({...form,disponible:opt.val})} style={{border:`1.5px solid ${form.disponible===opt.val?"#F7B500":"#DDE4EF"}`,borderRadius:10,padding:"12px 14px",cursor:"pointer",background:form.disponible===opt.val?"rgba(247,181,0,.06)":"#F7F9FC",transition:"all .18s"}}>
                            <div style={{fontWeight:700,fontSize:13,color:"#0A2540"}}>{opt.label}</div>
                            <div style={{fontSize:11.5,color:"#8A9AB5",marginTop:3}}>{opt.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{padding:"14px 24px",borderTop:"1px solid #F1F5F9",display:"flex",justifyContent:"flex-end",gap:10}}>
                    <button type="button" className="btn btn-s" onClick={()=>setEditingProfil(false)}>Annuler</button>
                    <button type="submit" className="btn btn-g" disabled={savingProfil}>
                      {savingProfil?<><div style={{width:13,height:13,border:"2px solid rgba(10,37,64,.2)",borderTopColor:"#0A2540",borderRadius:"50%",animation:"spin .7s linear infinite"}}/> Enregistrement…</>:<><I.save/> Enregistrer</>}
                    </button>
                  </div>
                </form>
              </div>
            ):(
              <div className="card" style={{overflow:"hidden"}}>
                <div style={{padding:"16px 24px",borderBottom:"1px solid #F1F5F9",fontWeight:700,fontSize:15,color:"#0A2540",background:"#FAFBFE"}}>Informations professionnelles</div>
                <div style={{padding:"4px 24px 12px"}}>
                  {[
                    {icon:I.brief, lbl:"Domaine",     val:expert?.domaine      ||"Non renseigné"},
                    {icon:I.brief, lbl:"Expérience",  val:expert?.experience   ||"Non renseignée"},
                    {icon:I.dollar,lbl:"Tarif",       val:expert?.tarif        ||"Non renseigné"},
                    {icon:I.map,   lbl:"Localisation",val:expert?.localisation ||"Non renseignée"},
                    {icon:I.phone, lbl:"Téléphone",   val:expert?.telephone    ||"Non renseigné"},
                  ].map((row,i)=>(
                    <div key={i} className="info-row">
                      <div className="info-icon"><row.icon/></div>
                      <div>
                        <div style={{fontSize:11,color:"#8A9AB5",fontWeight:600,textTransform:"uppercase",letterSpacing:.8,marginBottom:3}}>{row.lbl}</div>
                        <div style={{fontSize:14,color:"#0A2540",fontWeight:500}}>{row.val}</div>
                      </div>
                    </div>
                  ))}
                  {expert?.description&&(
                    <div className="info-row">
                      <div className="info-icon"><I.profil/></div>
                      <div>
                        <div style={{fontSize:11,color:"#8A9AB5",fontWeight:600,textTransform:"uppercase",letterSpacing:.8,marginBottom:3}}>Description</div>
                        <div style={{fontSize:13.5,color:"#374151",lineHeight:1.7}}>{expert.description}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ MESSAGES ══ */}
        {tab==="messages"&&(
          <div className="fade card" style={{overflow:"hidden",display:"grid",gridTemplateColumns:"270px 1fr",height:560}}>
            <div style={{borderRight:"1px solid #E8EEF6",overflowY:"auto"}}>
              <div style={{padding:"13px 16px",borderBottom:"1px solid #F1F5F9",fontWeight:700,fontSize:13,color:"#0A2540",background:"#FAFBFE"}}>Conversations</div>
              {convList.length===0?(
                <div style={{padding:40,textAlign:"center",color:"#8A9AB5",fontSize:13}}>Aucune conversation</div>
              ):convList.map((c:any)=>{
                const last=c.messages[c.messages.length-1];
                const nb=c.messages.filter((m:any)=>!m.lu&&m.sender_id!==user.id).length;
                return(
                  <div key={c.clientId} onClick={()=>setSelectedConv(c)} style={{padding:"12px 14px",cursor:"pointer",borderBottom:"1px solid #F1F5F9",background:selectedConv?.clientId===c.clientId?"#FFFBEB":"transparent",transition:"background .15s"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <Avatar name={c.clientName} size={36}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <span style={{fontWeight:600,fontSize:13,color:"#0A2540"}}>{c.clientName}</span>
                          {nb>0&&<span style={{background:"#F7B500",color:"#0A2540",borderRadius:99,padding:"1px 7px",fontSize:11,fontWeight:800}}>{nb}</span>}
                        </div>
                        <div style={{fontSize:12,color:"#8A9AB5",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{last.contenu}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedConv?(
              <div style={{display:"flex",flexDirection:"column"}}>
                <div style={{padding:"12px 18px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",gap:12,background:"#FAFBFE"}}>
                  <Avatar name={selectedConv.clientName} size={36}/>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:"#0A2540"}}>{selectedConv.clientName}</div>
                    <div style={{fontSize:11.5,color:"#8A9AB5"}}>Client</div>
                  </div>
                </div>
                <div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:10}}>
                  {selectedConv.messages.map((m:any)=>{
                    const isMe=m.sender_id===user.id;
                    return(
                      <div key={m.id} style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start"}}>
                        <div className={isMe?"msg-me":"msg-other"}>
                          <div>{m.contenu}</div>
                          <div style={{fontSize:10,opacity:.45,marginTop:4}}>{new Date(m.createdAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{padding:"12px 16px",borderTop:"1px solid #F1F5F9",display:"flex",gap:10}}>
                  <input className="inp" style={{flex:1}} placeholder="Écrire un message…" value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&envoyerReponse()}/>
                  <button className="btn btn-g" onClick={envoyerReponse} disabled={sending||!replyText.trim()}><I.send/> Envoyer</button>
                </div>
              </div>
            ):(
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",color:"#B8C4D6",fontSize:14}}>Sélectionnez une conversation</div>
            )}
          </div>
        )}

        {/* ══ RENDEZ-VOUS ══ */}
        {tab==="rendezvous"&&(
          <div className="fade">
            <div style={{fontWeight:700,fontSize:16,color:"#0A2540",marginBottom:14}}>Rendez-vous à venir</div>
            {rdvFuturs.length===0?(
              <div className="card" style={{padding:40,textAlign:"center",color:"#8A9AB5",marginBottom:20}}>Aucun rendez-vous à venir</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
                {rdvFuturs.map(r=>(
                  <div key={r.id} className="card card-h" style={{padding:"16px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <Avatar name={`${r.client?.prenom||""} ${r.client?.nom||""}`} size={44}/>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:"#0A2540"}}>{r.client?.prenom} {r.client?.nom}</div>
                        <div style={{fontSize:13,color:"#6B7280",marginTop:2}}>{new Date(r.date_rdv).toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
                        <div style={{fontSize:12,color:"#8A9AB5",marginTop:2}}>{new Date(r.date_rdv).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn btn-gr" onClick={()=>confirmerRdv(r.id)}><I.check/> Confirmer</button>
                      <button className="btn btn-r"  onClick={()=>annulerRdv(r.id)}><I.x/> Annuler</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{fontWeight:700,fontSize:16,color:"#0A2540",marginBottom:14}}>Historique</div>
            {rdvPasses.length===0?(
              <div className="card" style={{padding:40,textAlign:"center",color:"#8A9AB5"}}>Aucun historique</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {rdvPasses.map(r=>(
                  <div key={r.id} className="card" style={{padding:"13px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:13.5,color:"#0A2540"}}>{r.client?.prenom} {r.client?.nom}</div>
                      <div style={{fontSize:12,color:"#8A9AB5"}}>{new Date(r.date_rdv).toLocaleDateString("fr-FR")}</div>
                    </div>
                    <Badge label={r.statut} color={r.statut==="confirmé"?"green":r.statut==="annulé"?"red":"amber"}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ DISPONIBILITÉS ══ */}
        {tab==="disponibilites"&&(
          <div className="fade">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <div style={{fontWeight:700,fontSize:16,color:"#0A2540"}}>Mes créneaux disponibles</div>
              <button className="btn btn-g" onClick={()=>setDispoModal(true)}><I.plus/> Ajouter un créneau</button>
            </div>
            {dispos.length===0?(
              <div className="card" style={{padding:52,textAlign:"center"}}>
                <div style={{fontSize:40,marginBottom:12}}>📅</div>
                <div style={{fontWeight:700,color:"#0A2540",fontSize:16,marginBottom:6}}>Aucun créneau défini</div>
                <div style={{fontSize:13,color:"#8A9AB5",marginBottom:20}}>Ajoutez vos disponibilités pour que les startups puissent prendre rendez-vous.</div>
                <button className="btn btn-g" onClick={()=>setDispoModal(true)}><I.plus/> Ajouter maintenant</button>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {dispos.map(d=>(
                  <div key={d.id} className="card card-h" style={{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{display:"flex",alignItems:"center",gap:14}}>
                      <div style={{width:40,height:40,background:"rgba(247,181,0,.12)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#D97706"}}><I.clock/></div>
                      <div>
                        <div style={{fontWeight:600,fontSize:14,color:"#0A2540"}}>{new Date(d.date).toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
                        <div style={{fontSize:13,color:"#6B7280",marginTop:2}}>{d.heureDebut?.slice(0,5)} → {d.heureFin?.slice(0,5)}</div>
                      </div>
                    </div>
                    <button className="btn btn-r" style={{padding:"8px 10px"}} onClick={()=>deleteDispo(d.id)}><I.trash/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </>
  );
}