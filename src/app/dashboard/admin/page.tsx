"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BASE = "http://localhost:3001";

export default function DashboardAdmin() {
  const router = useRouter();
  const [tab, setTab] = useState<"experts"|"startups"|"users">("experts");
  const [experts, setExperts] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ text: "", ok: true });
  const [selected, setSelected] = useState<any>(null);

  const tk = () => localStorage.getItem("token") || "";
  const hdr = () => ({ Authorization: `Bearer ${tk()}` });

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) { router.push("/connexion"); return; }
    const u = JSON.parse(user);
    if (u.role !== "admin") { router.push("/"); return; }
    loadAll();
  }, []);

  function notify(text: string, ok = true) {
    setToast({ text, ok });
    setTimeout(() => setToast({ text: "", ok: true }), 3000);
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [e, s, u] = await Promise.all([
        fetch(`${BASE}/admin/experts`, { headers: hdr() }).then(r => r.json()),
        fetch(`${BASE}/admin/startups`, { headers: hdr() }).then(r => r.json()),
        fetch(`${BASE}/admin/users`,   { headers: hdr() }).then(r => r.json()),
      ]);
      setExperts(Array.isArray(e) ? e : []);
      setStartups(Array.isArray(s) ? s : []);
      setUsers(Array.isArray(u) ? u : []);
    } catch(err) { console.error(err); }
    setLoading(false);
  }

  async function valider(type: string, id: number) {
    const r = await fetch(`${BASE}/admin/${type}/${id}/valider`, { method:"PATCH", headers:hdr() });
    if (r.ok) { notify("✅ Validé ! Email envoyé."); setSelected(null); loadAll(); }
    else notify("Erreur", false);
  }

  async function refuser(type: string, id: number) {
    const r = await fetch(`${BASE}/admin/${type}/${id}/refuser`, { method:"PATCH", headers:hdr() });
    if (r.ok) { notify("❌ Refusé."); setSelected(null); loadAll(); }
    else notify("Erreur", false);
  }

  async function supprimerUser(id: number) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    const r = await fetch(`${BASE}/admin/users/${id}`, { method:"DELETE", headers:hdr() });
    if (r.ok) { notify("Supprimé"); loadAll(); }
    else notify("Erreur", false);
  }

  async function validerModification(id: number) {
    const r = await fetch(`${BASE}/experts/${id}/valider-modification`, { method:"PATCH", headers:hdr() });
    if (r.ok) { notify("✅ Modification validée !"); loadAll(); }
    else notify("Erreur", false);
  }

  async function refuserModification(id: number) {
    const r = await fetch(`${BASE}/experts/${id}/refuser-modification`, { method:"PATCH", headers:hdr() });
    if (r.ok) { notify("Modification refusée"); loadAll(); }
    else notify("Erreur", false);
  }

  function Avatar({ nom, prenom, photo, size=38 }: { nom?:string; prenom?:string; photo?:string; size?:number }) {
    const initials = (prenom?.[0]||"") + (nom?.[0]||"");
    const [imgError, setImgError] = useState(false);
    return (
      <div style={{width:size,height:size,borderRadius:"50%",overflow:"hidden",background:"#0A2540",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"2px solid #F7B500"}}>
        {photo && !imgError ? (
          <img
            src={`${BASE}/uploads/photos/${photo}?t=${Date.now()}`}
            alt="photo"
            style={{width:"100%",height:"100%",objectFit:"cover"}}
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{color:"#F7B500",fontWeight:800,fontSize:size*0.35}}>{initials || "?"}</span>
        )}
      </div>
    );
  }

  const enAttenteExperts  = experts.filter(e => e.statut === "en_attente");
  const enAttenteStartups = startups.filter(s => s.statut === "en_attente");
  const modificationsAttente = experts.filter(e => e.modification_demandee);
  const totalAttente = enAttenteExperts.length + enAttenteStartups.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Outfit',sans-serif;background:#F2F5F9;}
        .card{background:#fff;border:1px solid #E8EEF6;border-radius:16px;}
        .btn{font-family:'Outfit',sans-serif;font-weight:600;border:none;border-radius:8px;cursor:pointer;padding:9px 18px;font-size:13px;transition:all .18s;display:inline-flex;align-items:center;gap:6px;}
        .btn-green{background:#ECFDF5;color:#059669;}.btn-green:hover{background:#059669;color:#fff;}
        .btn-red{background:#FEF2F2;color:#DC2626;}.btn-red:hover{background:#DC2626;color:#fff;}
        .btn-blue{background:#EFF6FF;color:#1D4ED8;}.btn-blue:hover{background:#1D4ED8;color:#fff;}
        .btn-gray{background:#F1F5F9;color:#475569;}.btn-gray:hover{background:#E2E8F0;}
        .badge-wait{background:#FFF8E1;color:#B45309;border:1px solid #F7B500;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .badge-ok{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .badge-no{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .badge-modif{background:#FFF8E1;color:#B45309;border:1px solid #F7B500;border-radius:99px;padding:2px 8px;font-size:10px;font-weight:700;}
        .tab{background:none;border:none;cursor:pointer;padding:14px 4px;font-size:13px;font-weight:500;color:#7D8FAA;border-bottom:2px solid transparent;font-family:'Outfit',sans-serif;transition:all .2s;}
        .tab.active{color:#0A2540;border-bottom-color:#F7B500;font-weight:700;}
        table{width:100%;border-collapse:collapse;}
        th{text-align:left;font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;padding:10px 16px;border-bottom:2px solid #F1F5F9;}
        td{padding:12px 16px;border-bottom:1px solid #F7F9FC;font-size:13.5px;color:#0A2540;vertical-align:middle;}
        tr:last-child td{border-bottom:none;}
        tr:hover td{background:#FAFBFE;}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px);}
        .modal{background:#fff;border-radius:20px;width:100%;max-width:600px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(10,37,64,.2);}
        .info-row{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #F1F5F9;}
        .info-row:last-child{border-bottom:none;}
        .info-lbl{font-size:11px;color:#8A9AB5;font-weight:700;text-transform:uppercase;width:130px;flex-shrink:0;padding-top:2px;}
        .info-val{font-size:14px;color:#0A2540;font-weight:500;}
      `}</style>

      {/* Toast */}
      {toast.text && (
        <div style={{position:"fixed",top:20,right:20,zIndex:999,background:toast.ok?"#ECFDF5":"#FEF2F2",border:`1px solid ${toast.ok?"#A7F3D0":"#FECACA"}`,borderLeft:`3px solid ${toast.ok?"#059669":"#DC2626"}`,color:toast.ok?"#059669":"#DC2626",borderRadius:10,padding:"12px 18px",fontWeight:600,fontSize:13,boxShadow:"0 8px 24px rgba(0,0,0,.1)"}}>
          {toast.text}
        </div>
      )}

      {/* Modal détails */}
      {selected && (
        <div className="modal-bg" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{padding:"18px 24px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#FAFBFE",position:"sticky",top:0}}>
              <span style={{fontWeight:700,fontSize:16,color:"#0A2540"}}>
                {selected.type === "expert" ? "👤 Détails Expert" : "🚀 Détails Startup"}
              </span>
              <button className="btn btn-gray" style={{padding:"6px 10px"}} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{padding:"20px 24px"}}>
              {/* Photo + infos */}
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,padding:"16px",background:"#F7F9FC",borderRadius:12}}>
                <Avatar
                  nom={selected.data.user?.nom}
                  prenom={selected.data.user?.prenom}
                  photo={selected.data.photo}
                  size={64}
                />
                <div>
                  <div style={{fontWeight:700,fontSize:18,color:"#0A2540"}}>{selected.data.user?.prenom} {selected.data.user?.nom}</div>
                  <div style={{fontSize:13,color:"#8A9AB5"}}>{selected.data.user?.email}</div>
                  <div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap"}}>
                    {selected.data.statut==="en_attente" && <span className="badge-wait">⏳ En attente</span>}
                    {selected.data.statut==="valide"     && <span className="badge-ok">✅ Validé</span>}
                    {selected.data.statut==="refuse"     && <span className="badge-no">❌ Refusé</span>}
                    {selected.data.modification_demandee && <span className="badge-modif">⚠️ Modif en attente</span>}
                  </div>
                </div>
              </div>

              {selected.type === "expert" ? (
                <>
                  <div className="info-row"><span className="info-lbl">Domaine</span><span className="info-val">{selected.data.domaine||"-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Expérience</span><span className="info-val">{selected.data.experience||"-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Localisation</span><span className="info-val">{selected.data.localisation||"-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Téléphone</span><span className="info-val">{selected.data.user?.telephone||"-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Disponibilité</span><span className="info-val">{selected.data.disponibilite||"-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Description</span><span className="info-val">{selected.data.description||"-"}</span></div>
                  <div className="info-row">
                    <span className="info-lbl">CV</span>
                    <span className="info-val">
                      {selected.data.cv ? (
                        <a href={`${BASE}/uploads/cv/${selected.data.cv}`} target="_blank"
                          style={{background:"#EFF6FF",color:"#1D4ED8",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:600,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6}}>
                          📄 Télécharger CV
                        </a>
                      ) : <span style={{color:"#B8C4D6"}}>Aucun CV</span>}
                    </span>
                  </div>

                  {/* Modifications en attente */}
                  {selected.data.modification_demandee && selected.data.modifications_en_attente && (
                    <div style={{marginTop:16,background:"#FFF8E1",border:"1px solid #F7B500",borderRadius:12,padding:"16px"}}>
                      <div style={{fontWeight:700,color:"#B45309",marginBottom:10}}>⚠️ Modifications en attente</div>
                      {(() => {
                        try {
                          const mods = JSON.parse(selected.data.modifications_en_attente);
                          return Object.entries(mods).map(([k,v]) => (
                            <div key={k} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:"1px solid #FDE68A"}}>
                              <span style={{fontSize:11,color:"#92400E",fontWeight:700,textTransform:"uppercase" as const,width:120,flexShrink:0}}>{k}</span>
                              <span style={{fontSize:13,color:"#0A2540"}}>{String(v)}</span>
                            </div>
                          ));
                        } catch(e) { return null; }
                      })()}
                      <div style={{display:"flex",gap:10,marginTop:14}}>
                        <button className="btn btn-green" onClick={() => { validerModification(selected.data.id); setSelected(null); }}>
                          ✅ Valider modifications
                        </button>
                        <button className="btn btn-red" onClick={() => { refuserModification(selected.data.id); setSelected(null); }}>
                          ❌ Refuser modifications
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="info-row"><span className="info-lbl">Startup</span><span className="info-val">{selected.data.nom_startup||"-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Secteur</span><span className="info-val">{selected.data.secteur||"-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Taille</span><span className="info-val">{selected.data.taille||"-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Fonction</span><span className="info-val">{selected.data.fonction||"-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Site web</span><span className="info-val">{selected.data.site_web||"-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Localisation</span><span className="info-val">{selected.data.localisation||"-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Téléphone</span><span className="info-val">{selected.data.user?.telephone||"-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Description</span><span className="info-val">{selected.data.description||"-"}</span></div>
                </>
              )}
            </div>

            {selected.data.statut === "en_attente" && (
              <div style={{padding:"16px 24px",borderTop:"1px solid #F1F5F9",display:"flex",gap:12,justifyContent:"flex-end",position:"sticky",bottom:0,background:"#fff"}}>
                <button className="btn btn-red" onClick={() => refuser(selected.type==="expert"?"experts":"startups", selected.data.id)}>
                  ❌ Refuser
                </button>
                <button className="btn btn-green" onClick={() => valider(selected.type==="expert"?"experts":"startups", selected.data.id)}>
                  ✅ Valider et envoyer email
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{background:"#0A2540",height:62,padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(10,37,64,.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,background:"#F7B500",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:"#0A2540"}}>BEH</div>
          <div>
            <div style={{color:"#fff",fontWeight:700,fontSize:14}}>Espace Admin</div>
            <div style={{color:"rgba(255,255,255,.4)",fontSize:11}}>Gestion plateforme BEH</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {(totalAttente + modificationsAttente.length) > 0 && (
            <div style={{background:"#F7B500",color:"#0A2540",borderRadius:99,padding:"5px 14px",fontSize:12,fontWeight:800}}>
              🔔 {totalAttente + modificationsAttente.length} notifications
            </div>
          )}
          <button className="btn btn-gray" style={{color:"rgba(255,255,255,.7)",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)"}}
            onClick={() => { localStorage.clear(); router.push("/"); }}>
            Déconnexion
          </button>
        </div>
      </header>

      <main style={{maxWidth:1200,margin:"0 auto",padding:"28px 24px"}}>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
          {[
            { label:"Utilisateurs", val:users.length,    color:"#3B82F6", icon:"👥" },
            { label:"Experts",      val:experts.length,  color:"#8B5CF6", icon:"🎯" },
            { label:"Startups",     val:startups.length, color:"#F7B500", icon:"🚀" },
            { label:"En attente",   val:totalAttente,    color:"#EF4444", icon:"⏳" },
          ].map((s,i) => (
            <div key={i} className="card" style={{padding:"20px 24px",display:"flex",alignItems:"center",gap:16}}>
              <div style={{fontSize:32}}>{s.icon}</div>
              <div>
                <div style={{fontSize:28,fontWeight:800,color:s.color,lineHeight:1}}>{s.val}</div>
                <div style={{fontSize:12,color:"#8A9AB5",marginTop:4}}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Modifications en attente */}
        {modificationsAttente.length > 0 && (
          <div style={{background:"#FFF8E1",border:"1px solid #F7B500",borderRadius:16,padding:"20px 24px",marginBottom:24}}>
            <div style={{fontWeight:700,color:"#B45309",fontSize:15,marginBottom:14}}>
              ⚠️ Modifications de profil en attente ({modificationsAttente.length})
            </div>
            {modificationsAttente.map(e => {
              let mods: any = {};
              try { mods = JSON.parse(e.modifications_en_attente || '{}'); } catch(err) {}
              return (
                <div key={e.id} style={{background:"#fff",borderRadius:12,padding:"16px",marginBottom:10,border:"1px solid #E8EEF6"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <Avatar nom={e.user?.nom} prenom={e.user?.prenom} photo={e.photo} size={40} />
                      <div>
                        <div style={{fontWeight:700,color:"#0A2540",fontSize:14}}>{e.user?.prenom} {e.user?.nom}</div>
                        <div style={{fontSize:12,color:"#8A9AB5"}}>{e.user?.email}</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:6}}>
                          {Object.entries(mods).map(([k,v]) => (
                            <div key={k} style={{background:"#F7F9FC",borderRadius:6,padding:"3px 8px",fontSize:11}}>
                              <span style={{color:"#8A9AB5"}}>{k}: </span>
                              <span style={{color:"#0A2540",fontWeight:600}}>{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn btn-green" onClick={() => validerModification(e.id)}>✅ Valider</button>
                      <button className="btn btn-red" onClick={() => refuserModification(e.id)}>❌ Refuser</button>
                      <button className="btn btn-blue" onClick={() => setSelected({ type:"expert", data:e })}>👁 Détails</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="card" style={{overflow:"hidden"}}>
          <div style={{borderBottom:"1px solid #E8EEF6",padding:"0 24px",display:"flex",gap:24}}>
            {[
              { id:"experts",  label:"Experts",      count:enAttenteExperts.length },
              { id:"startups", label:"Startups",     count:enAttenteStartups.length },
              { id:"users",    label:"Utilisateurs", count:0 },
            ].map(t => (
              <button key={t.id} className={`tab${tab===t.id?" active":""}`} onClick={() => setTab(t.id as any)}>
                {t.label}
                {t.count > 0 && (
                  <span style={{background:"#F7B500",color:"#0A2540",borderRadius:99,padding:"1px 7px",fontSize:11,fontWeight:800,marginLeft:6}}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{padding:60,textAlign:"center",color:"#8A9AB5"}}>⏳ Chargement...</div>
          ) : tab === "experts" ? (
            <table>
              <thead>
                <tr>
                  <th>Expert</th>
                  <th>Email</th>
                  <th>Domaine</th>
                  <th>Localisation</th>
                  <th>CV</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {experts.length === 0 ? (
                  <tr><td colSpan={7} style={{textAlign:"center",color:"#8A9AB5",padding:40}}>Aucun expert</td></tr>
                ) : experts.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <Avatar nom={e.user?.nom} prenom={e.user?.prenom} photo={e.photo} size={38} />
                        <div>
                          <div style={{fontWeight:600}}>{e.user?.prenom} {e.user?.nom}</div>
                          <div style={{fontSize:11,color:"#8A9AB5"}}>{e.user?.telephone||""}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{color:"#6B7280"}}>{e.user?.email}</td>
                    <td>{e.domaine||"-"}</td>
                    <td>{e.localisation||"-"}</td>
                    <td>
                      {e.cv ? (
                        <a href={`${BASE}/uploads/cv/${e.cv}`} target="_blank"
                          style={{background:"#EFF6FF",color:"#1D4ED8",borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:600,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4}}>
                          📄 CV
                        </a>
                      ) : <span style={{color:"#B8C4D6",fontSize:12}}>-</span>}
                    </td>
                    <td>
                      <div style={{display:"flex",flexDirection:"column",gap:4}}>
                        {e.statut==="en_attente" && <span className="badge-wait">⏳ En attente</span>}
                        {e.statut==="valide"     && <span className="badge-ok">✅ Validé</span>}
                        {e.statut==="refuse"     && <span className="badge-no">❌ Refusé</span>}
                        {e.modification_demandee && <span className="badge-modif">⚠️ Modif</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        <button className="btn btn-blue" onClick={() => setSelected({ type:"expert", data:e })}>👁 Détails</button>
                        {e.statut==="en_attente" && (
                          <>
                            <button className="btn btn-green" onClick={() => valider("experts", e.id)}>✅</button>
                            <button className="btn btn-red" onClick={() => refuser("experts", e.id)}>❌</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          ) : tab === "startups" ? (
            <table>
              <thead>
                <tr>
                  <th>Responsable</th>
                  <th>Email</th>
                  <th>Startup</th>
                  <th>Secteur</th>
                  <th>Fonction</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {startups.length === 0 ? (
                  <tr><td colSpan={7} style={{textAlign:"center",color:"#8A9AB5",padding:40}}>Aucune startup</td></tr>
                ) : startups.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <Avatar nom={s.user?.nom} prenom={s.user?.prenom} photo={s.photo} size={38} />
                        <div>
                          <div style={{fontWeight:600}}>{s.user?.prenom} {s.user?.nom}</div>
                          <div style={{fontSize:11,color:"#8A9AB5"}}>{s.user?.telephone||""}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{color:"#6B7280"}}>{s.user?.email}</td>
                    <td style={{fontWeight:600}}>{s.nom_startup||"-"}</td>
                    <td>{s.secteur||"-"}</td>
                    <td>{s.fonction||"-"}</td>
                    <td>
                      {s.statut==="en_attente" && <span className="badge-wait">⏳ En attente</span>}
                      {s.statut==="valide"     && <span className="badge-ok">✅ Validé</span>}
                      {s.statut==="refuse"     && <span className="badge-no">❌ Refusé</span>}
                    </td>
                    <td>
                      <div style={{display:"flex",gap:6}}>
                        <button className="btn btn-blue" onClick={() => setSelected({ type:"startup", data:s })}>👁 Détails</button>
                        {s.statut==="en_attente" && (
                          <>
                            <button className="btn btn-green" onClick={() => valider("startups", s.id)}>✅</button>
                            <button className="btn btn-red" onClick={() => refuser("startups", s.id)}>❌</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          ) : (
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={5} style={{textAlign:"center",color:"#8A9AB5",padding:40}}>Aucun utilisateur</td></tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <Avatar nom={u.nom} prenom={u.prenom} size={38} />
                        <div style={{fontWeight:600}}>{u.prenom} {u.nom}</div>
                      </div>
                    </td>
                    <td style={{color:"#6B7280"}}>{u.email}</td>
                    <td>
                      <span style={{background:"#EFF6FF",color:"#1D4ED8",borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700}}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.statut==="actif"      && <span className="badge-ok">Actif</span>}
                      {u.statut==="en_attente" && <span className="badge-wait">En attente</span>}
                      {u.statut==="inactif"    && <span className="badge-no">Inactif</span>}
                    </td>
                    <td>
                      <button className="btn btn-red" onClick={() => supprimerUser(u.id)}>🗑 Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}