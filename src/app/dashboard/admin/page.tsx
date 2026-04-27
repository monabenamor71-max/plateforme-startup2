"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaPlay, FaMicrophone, FaTimes, FaSync, FaPlus, FaEdit, FaTrash, FaEye,
  FaCheck, FaStar, FaCalendar, FaClock, FaMapMarkerAlt, FaCertificate,
  FaUsers, FaLink, FaInfoCircle, FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight
} from "react-icons/fa";

const BASE = "http://localhost:3001";

type Tab =
  | "dashboard" | "experts" | "startups" | "temoignages" | "contacts"
  | "histoire" | "blog" | "formations" | "podcasts" | "demandes" | "medias";

type DemandeTypeFilter = "tous" | "services" | "formations_pub" | "podcasts_pub";

// ========== COMPOSANTS D'AIDE ==========
function HField({ label, cle, type = "text", rows = 0, hf, setHF, placeholder = "" }: any) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 5 }}>{label}</label>
      {rows > 0
        ? <textarea className="inp" rows={rows} value={hf(cle)} onChange={(e: any) => setHF(cle, e.target.value)} placeholder={placeholder} style={{ resize: "vertical" }} />
        : <input type={type} className="inp" value={hf(cle)} onChange={(e: any) => setHF(cle, e.target.value)} placeholder={placeholder} />}
    </div>
  );
}

function Kpi({ icon, label, value, color, sub, onClick }: any) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#fff", border: `1.5px solid ${hov ? color : "#EEF2F7"}`, borderRadius: 16, padding: "20px 22px", display: "flex", gap: 16, alignItems: "flex-start", cursor: onClick ? "pointer" : "default", transition: "all .18s", boxShadow: hov ? `0 8px 28px ${color}22` : "none" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div><div style={{ fontSize: 26, fontWeight: 800, color: "#0A2540", lineHeight: 1 }}>{value}</div><div style={{ fontSize: 12.5, color: "#7D8FAA", marginTop: 3 }}>{label}</div>{sub && <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 3 }}>{sub}</div>}</div>
    </div>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 6, background: "#EEF2F7", borderRadius: 99, overflow: "hidden", flex: 1 }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: color, borderRadius: 99, transition: "width .8s" }} />
    </div>
  );
}

function MiniDonut({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF2F7" strokeWidth={7} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={7} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dasharray .8s" }} />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="#0A2540">{pct}%</text>
    </svg>
  );
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFE" }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>{title}</span>
        {action}
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

function DashboardView({ experts, startups, temoignages, demandes, formationsProposees, podcastsProposees, setTab }: any) {
  const expertValides  = experts.filter((e: any) => e.statut === "valide").length;
  const startupValides = startups.filter((s: any) => s.statut === "valide").length;
  const enAttente      = [...experts, ...startups].filter((x: any) => x.statut === "en_attente").length;
  const temosPublies   = temoignages.filter((t: any) => t.statut === "valide");
  const avgNote        = temosPublies.length > 0 ? (temosPublies.reduce((s: number, t: any) => s + (t.note || 5), 0) / temosPublies.length).toFixed(1) : "—";
  const repartitionEtoiles = [5,4,3,2,1].map(n => ({ n, count: temosPublies.filter((t: any) => t.note === n).length }));
  const serviceMap: Record<string, number> = {};
  demandes.forEach((d: any) => { const k = d.service || "Autre"; serviceMap[k] = (serviceMap[k] || 0) + 1; });
  const topServices = Object.entries(serviceMap).sort((a,b) => b[1] - a[1]).slice(0,6);
  const maxSvc = topServices.length ? topServices[0][1] : 1;
  const demandeStatuts = ["en_attente","acceptee","refusee"].map(s => ({
    label: { en_attente:"En attente", acceptee:"Acceptée", refusee:"Refusée" }[s] || s,
    count: demandes.filter((d: any) => d.statut === s).length,
    color: { en_attente:"#F7B500", acceptee:"#22C55E", refusee:"#EF4444" }[s] || "#94A3B8",
  }));
  const totalDemandes = demandes.length + formationsProposees.length + podcastsProposees.length;
  const pubAttente = formationsProposees.length + podcastsProposees.length;

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0A2540", marginBottom: 16 }}>Vue d'ensemble</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          <Kpi icon="⏳" label="En attente validation" value={enAttente} color="#F7B500" sub="Experts + Startups" onClick={() => setTab("experts")} />
          <Kpi icon="📋" label="Demandes de service" value={demandes.length} color="#8B5CF6" sub={`${demandes.filter((d: any) => d.statut === "en_attente").length} en attente`} onClick={() => setTab("demandes")} />
          <Kpi icon="📚" label="Publications à valider" value={pubAttente} color="#3B82F6" sub="Formations & Podcasts" onClick={() => setTab("demandes")} />
          <Kpi icon="⭐" label="Note satisfaction" value={avgNote !== "—" ? `${avgNote}/5` : "—"} color="#F7B500" sub={`${temosPublies.length} avis publiés`} onClick={() => setTab("temoignages")} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <SectionCard title="👤 Comptes par rôle" action={<button onClick={() => setTab("experts")} style={{ fontSize: 12, color: "#3B82F6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir tout →</button>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Experts validés",   count: expertValides,  total: experts.length,              color: "#8B5CF6", icon: "🎯" },
              { label: "Startups validées",  count: startupValides, total: startups.length,             color: "#F7B500", icon: "🚀" },
              { label: "En attente",         count: enAttente,      total: experts.length + startups.length, color: "#EF4444", icon: "⏳" },
            ].map((row,i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{row.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.count}<span style={{ color: "#94A3B8", fontWeight: 400 }}>/{row.total}</span></span>
                  </div>
                  <ProgressBar pct={row.total > 0 ? (row.count / row.total) * 100 : 0} color={row.color} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="📋 Statuts des demandes" action={<button onClick={() => setTab("demandes")} style={{ fontSize: 12, color: "#8B5CF6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Gérer →</button>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {demandeStatuts.map((s,i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12.5, color: "#475569", fontWeight: 500 }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.count}</span>
                  </div>
                  <ProgressBar pct={totalDemandes > 0 ? (s.count / totalDemandes) * 100 : 0} color={s.color} />
                </div>
              </div>
            ))}
            {totalDemandes === 0 && <div style={{ textAlign: "center", color: "#94A3B8", padding: "20px 0", fontSize: 13 }}>Aucune demande</div>}
          </div>
        </SectionCard>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <SectionCard title="🛠️ Services les plus demandés">
          {topServices.length === 0
            ? <div style={{ textAlign: "center", color: "#94A3B8", padding: "20px 0", fontSize: 13 }}>Aucune donnée</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topServices.map(([svc, count], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", width: 16, textAlign: "right" }}>#{i+1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>{svc}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#8B5CF6" }}>{count}</span>
                      </div>
                      <ProgressBar pct={(count / maxSvc) * 100} color={["#8B5CF6","#3B82F6","#F7B500","#10B981","#EF4444","#F97316"][i]} />
                    </div>
                  </div>
                ))}
              </div>
          }
        </SectionCard>
        <SectionCard title="⭐ Satisfaction clients">
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <MiniDonut pct={avgNote !== "—" ? Math.round((parseFloat(avgNote)/5)*100) : 0} color="#F7B500" size={72} />
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 6, fontWeight: 600 }}>Satisfaction</div>
            </div>
            <div style={{ flex: 1 }}>
              {repartitionEtoiles.map(({ n, count }) => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: "#94A3B8", width: 14, textAlign: "right" }}>{n}</span>
                  <span style={{ color: "#F7B500", fontSize: 12 }}>★</span>
                  <ProgressBar pct={temosPublies.length > 0 ? (count / temosPublies.length) * 100 : 0} color="#F7B500" />
                  <span style={{ fontSize: 11, color: "#94A3B8", width: 20, textAlign: "right" }}>{count}</span>
                </div>
              ))}
              {temosPublies.length === 0 && <div style={{ color: "#94A3B8", fontSize: 13, padding: "10px 0" }}>Aucun avis</div>}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ========== MODALE DEMANDE DE SERVICE ==========
function ModalDemande({ demande, experts, commentaireAdmin, setCommentaireAdmin, onChangerStatut, onNotifierExperts, onAssignerExpert, onAccepterFormation, onRefuserFormation, onClose, getDemandeDomaine, setSelectedExpertProfile }: any) {
  const svc = demande?.service || "";
  const isFormation = svc === "formations" || svc === "formation";
  const needsExpert = ["consulting", "audit-sur-site", "nos-plateformes", "personnalise"].includes(svc);
  const demandeDomaine = getDemandeDomaine(demande);
  const expertsValides = experts.filter((e: any) => e.statut === "valide");
  let expertsFiltres = expertsValides;
  if (demandeDomaine && demandeDomaine !== "Autre" && demandeDomaine !== "Personnalisé") {
    const domaineLower = demandeDomaine.toLowerCase().trim();
    expertsFiltres = expertsValides.filter((e: any) => (e.domaine || "").toLowerCase().trim() === domaineLower);
  }
  const expertsNotifiesIds: number[] = demande?.experts_notifies || [];
  const expertsAcceptesIds: number[] = demande?.experts_acceptes || [];
  const expertsAcceptes = experts.filter((e: any) => expertsAcceptesIds.includes(e.id));
  const [selectedExperts, setSelectedExperts] = useState<number[]>([]);
  const [etape, setEtape] = useState<"selection" | "assignation">(expertsAcceptesIds.length > 0 ? "assignation" : "selection");
  const formation = demande?.formation;
  const placesRestantes = formation?.places_limitees ? (formation?.places_disponibles ?? 0) : null;
  const peutAccepter = !isFormation || !formation?.places_limitees || (placesRestantes !== null && placesRestantes > 0);
  const toggleExpert = (id: number) => setSelectedExperts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "22px 26px", position: "sticky", top: 0, borderRadius: "20px 20px 0 0", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, background: "rgba(247,181,0,.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📋</div>
              <div><div style={{ color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Demande de service</div><div style={{ color: "#fff", fontWeight: 800, fontSize: 19 }}>{svc}</div></div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.18)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "22px 26px", maxHeight: "80vh", overflowY: "auto" }}>
          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 18, border: "1px solid #EEF2F7" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540", marginBottom: 12 }}>👤 Informations du client</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Nom complet", val: `${demande.user?.prenom || ""} ${demande.user?.nom || ""}` },
                { label: "Email", val: demande.user?.email || "—" },
                { label: "Téléphone", val: demande.telephone || demande.user?.telephone || "—" },
                { label: "Startup", val: demande.user?.startup?.nom_startup || "—" },
                { label: "Secteur", val: demande.user?.startup?.secteur || "—" },
                { label: "Domaine recherché", val: demandeDomaine },
              ].map((row, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", border: "1px solid #E8EEF6" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 18, border: "1px solid #EEF2F7" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540", marginBottom: 12 }}>📋 Détails de la demande</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <span className="badge" style={{ background: demande.statut === "en_attente" ? "#FFFBEB" : demande.statut === "acceptee" ? "#ECFDF5" : "#FEF2F2", color: demande.statut === "en_attente" ? "#B45309" : demande.statut === "acceptee" ? "#059669" : "#DC2626" }}>
                {demande.statut === "en_attente" ? "⏳ En attente" : demande.statut === "acceptee" ? "✅ Acceptée" : "❌ Refusée"}
              </span>
              {demande.expert_assigne && <span className="badge" style={{ background: "#F0FDFA", color: "#0D9488" }}>👤 {demande.expert_assigne?.user?.prenom} {demande.expert_assigne?.user?.nom}</span>}
            </div>
            {demande.description && <div style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", marginBottom: 10, border: "1px solid #E8EEF6", fontSize: 13.5, color: "#334155", lineHeight: 1.75 }}>{demande.description}</div>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {demande.delai && <span className="badge" style={{ background: "#ECFDF5", color: "#059669" }}>⏱ {demande.delai}</span>}
              {demande.objectif && <span className="badge" style={{ background: "#F1F5F9", color: "#64748B" }}>🎯 {demande.objectif}</span>}
              {demande.telephone && <span className="badge" style={{ background: "#FFFBEB", color: "#B45309" }}>📞 {demande.telephone}</span>}
            </div>
          </div>
          {isFormation && formation && (
            <div style={{ background: "#F3E8FF", border: "2px solid #DDD6FE", borderRadius: 14, padding: "18px 20px", marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#6B21A8", marginBottom: 12 }}>🎓 Formation : <span style={{ color: "#7C3AED" }}>{formation.titre}</span></div>
              {!peutAccepter && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#DC2626", fontWeight: 600 }}>⚠️ Formation complète — impossible d'accepter.</div>}
            </div>
          )}
          {needsExpert && demande.statut === "en_attente" && (
            <div style={{ border: "1.5px solid #EEF2F7", borderRadius: 14, overflow: "hidden", marginBottom: 18 }}>
              <div style={{ display: "flex", borderBottom: "1px solid #EEF2F7", background: "#FAFBFE" }}>
                <button onClick={() => setEtape("selection")} style={{ flex: 1, padding: "12px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: etape === "selection" ? 700 : 500, color: etape === "selection" ? "#0A2540" : "#94A3B8", background: "transparent", borderBottom: etape === "selection" ? "2.5px solid #F7B500" : "2.5px solid transparent" }}>
                  📤 Étape 1 — Notifier des experts
                </button>
                <button onClick={() => setEtape("assignation")} style={{ flex: 1, padding: "12px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: etape === "assignation" ? 700 : 500, color: etape === "assignation" ? "#0A2540" : "#94A3B8", background: "transparent", borderBottom: etape === "assignation" ? "2.5px solid #22C55E" : "2.5px solid transparent" }}>
                  ✅ Étape 2 — Assigner {expertsAcceptesIds.length > 0 && `(${expertsAcceptesIds.length})`}
                </button>
              </div>
              {etape === "selection" && (
                <div>
                  <div style={{ padding: "12px 16px", background: "#F1F5F9", fontSize: 12, color: "#64748B", display: "flex", justifyContent: "space-between" }}>
                    <span>Domaine : <strong>{demandeDomaine}</strong></span>
                    <span style={{ fontWeight: 700, color: "#0A2540" }}>{expertsFiltres.length} expert(s)</span>
                  </div>
                  <div style={{ maxHeight: 260, overflowY: "auto" }}>
                    {expertsFiltres.length === 0
                      ? <div style={{ padding: "28px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>Aucun expert dans ce domaine</div>
                      : expertsFiltres.map((ex: any) => {
                          const alreadyNotified = expertsNotifiesIds.includes(ex.id);
                          const isSelected = selectedExperts.includes(ex.id);
                          return (
                            <div key={ex.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #F8FAFC", background: isSelected ? "#EFF6FF" : "#fff" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <input type="checkbox" checked={isSelected} disabled={alreadyNotified} onChange={() => { if (!alreadyNotified) toggleExpert(ex.id); }} style={{ cursor: alreadyNotified ? "not-allowed" : "pointer", width: 16, height: 16, accentColor: "#F7B500" }} />
                                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 700 }}>{ex.user?.prenom?.[0]}{ex.user?.nom?.[0]}</div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "#0A2540" }}>{ex.user?.prenom} {ex.user?.nom}</div>
                                  <div style={{ fontSize: 11, color: "#64748B" }}>{ex.domaine || "Expert"} · {ex.localisation || "—"}</div>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <button className="btn btn-gray" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setSelectedExpertProfile(ex)}>👤 Profil</button>
                                {alreadyNotified ? <span className="badge" style={{ background: expertsAcceptesIds.includes(ex.id) ? "#ECFDF5" : "#FFFBEB", color: expertsAcceptesIds.includes(ex.id) ? "#059669" : "#B45309" }}>{expertsAcceptesIds.includes(ex.id) ? "✅ Accepté" : "⏳ Notifié"}</span> : <span className="badge" style={{ background: "#F1F5F9", color: "#64748B" }}>Non notifié</span>}
                              </div>
                            </div>
                          );
                        })
                    }
                  </div>
                  {selectedExperts.length > 0 && (
                    <div style={{ padding: "12px 16px", background: "#EFF6FF", borderTop: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: "#1D4ED8", fontWeight: 600 }}>{selectedExperts.length} sélectionné(s)</span>
                      <button className="btn btn-primary" style={{ fontSize: 13, padding: "8px 20px" }} onClick={() => { onNotifierExperts(demande.id, selectedExperts); setSelectedExperts([]); setEtape("assignation"); }}>📤 Notifier</button>
                    </div>
                  )}
                </div>
              )}
              {etape === "assignation" && (
                <div>
                  {expertsAcceptesIds.length === 0
                    ? <div style={{ padding: "32px", textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div><div style={{ fontWeight: 600, fontSize: 14, color: "#0A2540", marginBottom: 6 }}>En attente des réponses</div><button className="btn btn-gray" style={{ marginTop: 14, fontSize: 12 }} onClick={() => setEtape("selection")}>← Retour</button></div>
                    : <>
                        <div style={{ padding: "12px 16px", background: "#DCFCE7", fontSize: 12, color: "#166534", fontWeight: 700 }}>✅ {expertsAcceptesIds.length} expert(s) ont accepté</div>
                        {expertsAcceptes.map((ex: any) => {
                          const isAssigned = demande.expert_assigne_id === ex.id;
                          return (
                            <div key={ex.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #F0FDF4", background: isAssigned ? "#DCFCE7" : "#fff" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 700 }}>{ex.user?.prenom?.[0]}{ex.user?.nom?.[0]}</div>
                                <div><div style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>{ex.user?.prenom} {ex.user?.nom}</div><div style={{ fontSize: 12, color: "#64748B" }}>{ex.domaine}</div></div>
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                {isAssigned ? <span className="badge" style={{ background: "#ECFDF5", color: "#059669" }}>✅ Assigné</span> : <button className="btn btn-green" style={{ fontSize: 13, padding: "9px 18px" }} onClick={() => onAssignerExpert(demande.id, ex.id, commentaireAdmin)}>👤 Assigner</button>}
                              </div>
                            </div>
                          );
                        })}
                      </>
                  }
                </div>
              )}
            </div>
          )}
          <div style={{ background: "#F8FAFC", border: "1px solid #EEF2F7", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontWeight: 700, color: "#0A2540", fontSize: 14, marginBottom: 14 }}>⚙️ Actions administrateur</div>
            <div style={{ marginBottom: 14 }}>
              <label className="lbl">Message pour le client</label>
              <textarea className="inp" rows={3} placeholder="Réponse visible par le client..." value={commentaireAdmin} onChange={(e: any) => setCommentaireAdmin(e.target.value)} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {demande.statut === "en_attente" && (
                isFormation ? (
                  <>
                    <button className="btn btn-green" style={{ flex: 1, justifyContent: "center" }} disabled={!peutAccepter} onClick={() => peutAccepter && onAccepterFormation(demande.id)}>{peutAccepter ? "✅ Accepter" : "❌ Formation complète"}</button>
                    <button className="btn btn-red" style={{ flex: 1, justifyContent: "center" }} onClick={() => onRefuserFormation(demande.id)}>❌ Refuser</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-green" style={{ flex: 1, justifyContent: "center" }} onClick={() => onChangerStatut(demande.id, "acceptee")}>✅ Accepter</button>
                    <button className="btn btn-red" style={{ flex: 1, justifyContent: "center" }} onClick={() => onChangerStatut(demande.id, "refusee")}>❌ Refuser</button>
                  </>
                )
              )}
              {!isFormation && demande.statut === "acceptee" && <button className="btn btn-blue" style={{ flex: 1, justifyContent: "center" }} onClick={() => onChangerStatut(demande.id, "en_cours")}>🔄 En cours</button>}
              {demande.statut === "en_cours" && <button className="btn btn-green" style={{ flex: 1, justifyContent: "center" }} onClick={() => onChangerStatut(demande.id, "terminee")}>✅ Terminée</button>}
              {commentaireAdmin && <button className="btn btn-gray" style={{ flex: 1, justifyContent: "center" }} onClick={() => onChangerStatut(demande.id, demande.statut)}>💾 Sauvegarder message</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== MODALE VALIDATION FORMATION PROPOSÉE PAR EXPERT ==========
function ModalFormationValidation({ formation, onPublier, onRefuser, onClose }: {
  formation: any; onPublier: (id: number) => void; onRefuser: (id: number) => void; onClose: () => void;
}) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#1a1a2e,#7C3AED)", padding: "22px 26px", borderRadius: "20px 20px 0 0", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📚</div>
              <div>
                <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Demande de publication — Expert</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>Valider la formation</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.18)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "22px 26px", maxHeight: "80vh", overflowY: "auto" }}>
          {formation.image && (
            <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 18, height: 180, position: "relative" }}>
              <img src={`${BASE}/uploads/formations/${formation.image}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.6), transparent)" }} />
              <div style={{ position: "absolute", bottom: 14, left: 16, color: "#fff", fontWeight: 800, fontSize: 18 }}>{formation.titre}</div>
            </div>
          )}
          {formation.expert && (
            <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", borderRadius: 14, padding: "16px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(247,181,0,.2)", border: "2px solid #F7B500", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                {formation.expert?.user?.prenom?.[0]}{formation.expert?.user?.nom?.[0]}
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,.5)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>Proposé par l'expert</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{formation.expert?.user?.prenom} {formation.expert?.user?.nom}</div>
                <div style={{ color: "rgba(255,255,255,.5)", fontSize: 12 }}>{formation.expert?.user?.email} · {formation.expert?.domaine}</div>
              </div>
            </div>
          )}
          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 18, border: "1px solid #EEF2F7" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540", marginBottom: 12 }}>📚 Détails de la formation</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[
                { label: "Titre", val: formation.titre || "—" },
                { label: "Domaine", val: formation.domaine || "—" },
                { label: "Formateur", val: formation.formateur || "—" },
                { label: "Mode", val: formation.mode || "—" },
                { label: "Durée", val: formation.duree || "—" },
                { label: "Prix", val: formation.prix ? `${formation.prix} DT` : "Gratuit" },
                { label: "Places", val: formation.places_limitees ? `${formation.places_disponibles} places` : "Illimitées" },
                { label: "Certifiante", val: formation.certifiante ? "✅ Oui" : "Non" },
              ].map((row, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", border: "1px solid #E8EEF6" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>{row.val}</div>
                </div>
              ))}
            </div>
            {formation.description && (
              <div style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #E8EEF6" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Description</div>
                <div style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.75 }}>{formation.description}</div>
              </div>
            )}
          </div>
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, color: "#92400E", fontSize: 13 }}>En attente de validation</div>
              <div style={{ fontSize: 12, color: "#B45309" }}>Soumis le {new Date(formation.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-green" style={{ flex: 1, justifyContent: "center", padding: "13px", fontSize: 15, fontWeight: 800 }} onClick={() => onPublier(formation.id)}>✅ Publier cette formation</button>
            <button className="btn btn-red" style={{ flex: 1, justifyContent: "center", padding: "13px", fontSize: 15, fontWeight: 800 }} onClick={() => onRefuser(formation.id)}>❌ Refuser</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== MODALE VALIDATION PODCAST PROPOSÉ PAR EXPERT ==========
function ModalPodcastValidation({ podcast, onPublier, onRefuser, onClose }: {
  podcast: any; onPublier: (id: number) => void; onRefuser: (id: number) => void; onClose: () => void;
}) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", padding: "22px 26px", borderRadius: "20px 20px 0 0", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎙️</div>
              <div>
                <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Demande de publication — Expert</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>Valider le podcast</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.18)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "22px 26px", maxHeight: "80vh", overflowY: "auto" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
            <div style={{ width: 90, height: 90, borderRadius: 16, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {podcast.image ? <img src={`${BASE}/uploads/podcasts-images/${podcast.image}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontSize: 32, color: "#C4B5FD" }}>🎙️</span>}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#0A2540" }}>{podcast.titre}</div>
              {podcast.auteur && <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>🎙️ {podcast.auteur}</div>}
              {podcast.domaine && <span className="badge" style={{ background: "#F3E8FF", color: "#7C3AED", marginTop: 6, display: "inline-block" }}>{podcast.domaine}</span>}
            </div>
          </div>
          {podcast.expert && (
            <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", borderRadius: 14, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(247,181,0,.2)", border: "2px solid #F7B500", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                {podcast.expert?.user?.prenom?.[0]}{podcast.expert?.user?.nom?.[0]}
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,.5)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>Proposé par l'expert</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{podcast.expert?.user?.prenom} {podcast.expert?.user?.nom}</div>
                <div style={{ color: "rgba(255,255,255,.5)", fontSize: 12 }}>{podcast.expert?.domaine}</div>
              </div>
            </div>
          )}
          {podcast.description && (
            <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", marginBottom: 18, border: "1px solid #E8EEF6" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Description</div>
              <div style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.75 }}>{podcast.description}</div>
            </div>
          )}
          {podcast.url_audio && (
            <div style={{ background: "#F3E8FF", borderRadius: 12, padding: "14px 16px", marginBottom: 18, border: "1px solid #DDD6FE" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>🎧 Écouter l'épisode</div>
              <audio ref={audioRef} src={`${BASE}/uploads/podcasts-audio/${podcast.url_audio}`} preload="metadata" controls style={{ width: "100%" }} />
            </div>
          )}
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, color: "#92400E", fontSize: 13 }}>En attente de validation</div>
              <div style={{ fontSize: 12, color: "#B45309" }}>Soumis le {new Date(podcast.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-green" style={{ flex: 1, justifyContent: "center", padding: "13px", fontSize: 15, fontWeight: 800 }} onClick={() => onPublier(podcast.id)}>✅ Publier ce podcast</button>
            <button className="btn btn-red" style={{ flex: 1, justifyContent: "center", padding: "13px", fontSize: 15, fontWeight: 800 }} onClick={() => onRefuser(podcast.id)}>❌ Refuser</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== MODALE AJOUT / ÉDITION FORMATION (ADMIN) ==========
function FormationFormModal({ formation, onClose, onSave }: { formation?: any; onClose: () => void; onSave: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titre: formation?.titre || "",
    description: formation?.description || "",
    domaine: formation?.domaine || "",
    formateur: formation?.formateur || "",
    mode: formation?.mode || "en_ligne",
    duree: formation?.duree || "",
    localisation: formation?.localisation || "",
    niveau: formation?.niveau || "",
    lien_formation: formation?.lien_formation || "",
    dateDebut: formation?.dateDebut?.split("T")[0] || "",
    dateFin: formation?.dateFin?.split("T")[0] || "",
    type: formation?.type || "payant",
    gratuit: formation?.gratuit || false,
    prix: formation?.prix || "",
    places_limitees: formation?.places_limitees || false,
    places_disponibles: formation?.places_disponibles || "",
    certifiante: formation?.certifiante || false,
    statut: formation?.statut || "publie",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(formation?.image ? `${BASE}/uploads/formations/${formation.image}` : "");

  const DOMAINES = ["Marketing Digital","Finance / Comptabilité","Ressources Humaines","Développement Web / Mobile","Design UI/UX","Stratégie Commerciale","Logistique / Supply Chain","Intelligence Artificielle / Data","Management","Communication","Juridique","Autre"];
  const MODES = [{ value: "en_ligne", label: "💻 En ligne" }, { value: "presentiel", label: "🏢 Présentiel" }, { value: "hybride", label: "🌐 Hybride" }];
  const NIVEAUX = ["Débutant","Intermédiaire","Avancé","Tous niveaux"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) { alert("Le titre est requis"); return; }
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, String(v)); });
    if (imageFile) fd.append("image", imageFile);
    const url = formation ? `${BASE}/formations/admin/${formation.id}` : `${BASE}/formations/admin/create`;
    const method = formation ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }, body: fd });
      if (res.ok) { onSave(); onClose(); } else alert("Erreur d'enregistrement");
    } catch { alert("Erreur réseau"); }
    setLoading(false);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 760 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#0A2540 0%,#1a4a8a 100%)", padding: 0, borderRadius: "20px 20px 0 0", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(90deg,rgba(247,181,0,.15),transparent)", padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, background: "rgba(247,181,0,.25)", border: "2px solid rgba(247,181,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📚</div>
                <div>
                  <div style={{ color: "rgba(255,255,255,.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Administration — Formations</div>
                  <div style={{ fontWeight: 900, fontSize: 20, color: "#fff" }}>{formation ? "✏️ Modifier la formation" : "➕ Créer une nouvelle formation"}</div>
                  <div style={{ color: "#F7B500", fontSize: 11, fontWeight: 600, marginTop: 3 }}>✅ Publiée directement sans validation expert</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
            </div>
          </div>
          <div style={{ height: 4, background: "linear-gradient(90deg,#F7B500,#FFD700,rgba(255,215,0,0))" }} />
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "26px 30px", maxHeight: "72vh", overflowY: "auto" }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 6, height: 20, background: "#F7B500", borderRadius: 3 }} />
              <div style={{ fontWeight: 800, fontSize: 13, color: "#0A2540", textTransform: "uppercase", letterSpacing: "0.5px" }}>Informations principales</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginBottom: 12 }}>
              <div><label className="lbl">Titre de la formation *</label><input className="inp" required value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Ex : Maîtriser le Marketing Digital" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label className="lbl">Domaine</label><select className="inp" value={form.domaine} onChange={e => setForm({ ...form, domaine: e.target.value })}><option value="">Sélectionner un domaine</option>{DOMAINES.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
              <div><label className="lbl">Formateur / Intervenant</label><input className="inp" value={form.formateur} onChange={e => setForm({ ...form, formateur: e.target.value })} placeholder="Nom du formateur" /></div>
              <div><label className="lbl">Niveau</label><select className="inp" value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })}><option value="">Sélectionner un niveau</option>{NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
              <div><label className="lbl">Durée</label><input className="inp" value={form.duree} onChange={e => setForm({ ...form, duree: e.target.value })} placeholder="Ex: 2 jours, 40h..." /></div>
            </div>
            <div style={{ marginTop: 12 }}><label className="lbl">Description complète</label><textarea className="inp" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Décrivez le contenu, objectifs, public cible..." /></div>
          </div>
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 6, height: 20, background: "#3B82F6", borderRadius: 3 }} />
              <div style={{ fontWeight: 800, fontSize: 13, color: "#0A2540", textTransform: "uppercase", letterSpacing: "0.5px" }}>Modalités & Planning</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
              {MODES.map(m => (
                <div key={m.value} onClick={() => setForm({ ...form, mode: m.value })} style={{ border: `2px solid ${form.mode === m.value ? "#F7B500" : "#E2E8F0"}`, borderRadius: 11, padding: "12px 14px", cursor: "pointer", background: form.mode === m.value ? "#FFFBEB" : "#fff", textAlign: "center", transition: "all .2s" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540" }}>{m.label}</div>
                  {form.mode === m.value && <div style={{ color: "#F7B500", fontSize: 10, fontWeight: 700, marginTop: 3 }}>✓ Sélectionné</div>}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label className="lbl">Localisation</label><input className="inp" value={form.localisation} onChange={e => setForm({ ...form, localisation: e.target.value })} placeholder="Ex: Tunis, Paris..." disabled={form.mode === "en_ligne"} /></div>
              <div><label className="lbl">Lien formation (URL)</label><input className="inp" type="url" value={form.lien_formation} onChange={e => setForm({ ...form, lien_formation: e.target.value })} placeholder="https://..." /></div>
              <div><label className="lbl">Date de début</label><input className="inp" type="date" value={form.dateDebut} onChange={e => setForm({ ...form, dateDebut: e.target.value })} /></div>
              <div><label className="lbl">Date de fin</label><input className="inp" type="date" value={form.dateFin} onChange={e => setForm({ ...form, dateFin: e.target.value })} /></div>
            </div>
          </div>
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 6, height: 20, background: "#10B981", borderRadius: 3 }} />
              <div style={{ fontWeight: 800, fontSize: 13, color: "#0A2540", textTransform: "uppercase", letterSpacing: "0.5px" }}>Tarif & Accès</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[{ value: "gratuit", label: "🎁 Gratuit", desc: "Accès libre" }, { value: "payant", label: "💰 Payant", desc: "Avec tarif défini" }].map(t => (
                <div key={t.value} onClick={() => setForm({ ...form, type: t.value, gratuit: t.value === "gratuit" })} style={{ border: `2px solid ${form.type === t.value ? "#F7B500" : "#E2E8F0"}`, borderRadius: 11, padding: "13px 16px", cursor: "pointer", background: form.type === t.value ? "#FFFBEB" : "#fff", transition: "all .2s" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{t.desc}</div>
                  {form.type === t.value && <div style={{ color: "#F7B500", fontSize: 10, fontWeight: 700, marginTop: 4 }}>✓ Sélectionné</div>}
                </div>
              ))}
            </div>
            {form.type === "payant" && <div style={{ marginBottom: 14 }}><label className="lbl">Prix (DT) *</label><input className="inp" type="number" min="0" step="0.5" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} placeholder="Ex: 299" /></div>}
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 14 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: form.certifiante ? "#FFFBEB" : "#F8FAFC", border: `1.5px solid ${form.certifiante ? "#F7B500" : "#E2E8F0"}`, borderRadius: 10, padding: "10px 16px" }}>
                <div onClick={() => setForm({ ...form, certifiante: !form.certifiante })} style={{ width: 42, height: 22, background: form.certifiante ? "#F7B500" : "#D1D5DB", borderRadius: 99, position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2, left: form.certifiante ? 20 : 2, width: 18, height: 18, background: "#fff", borderRadius: "50%", transition: "left .2s" }} />
                </div>
                <div><div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540" }}>🎓 Formation certifiante</div><div style={{ fontSize: 11, color: "#64748B" }}>Certificat délivré aux participants</div></div>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: form.places_limitees ? "#FFFBEB" : "#F8FAFC", border: `1.5px solid ${form.places_limitees ? "#F7B500" : "#E2E8F0"}`, borderRadius: 10, padding: "10px 16px" }}>
                <div onClick={() => setForm({ ...form, places_limitees: !form.places_limitees })} style={{ width: 42, height: 22, background: form.places_limitees ? "#F7B500" : "#D1D5DB", borderRadius: 99, position: "relative", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2, left: form.places_limitees ? 20 : 2, width: 18, height: 18, background: "#fff", borderRadius: "50%", transition: "left .2s" }} />
                </div>
                <div><div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540" }}>🎟️ Places limitées</div><div style={{ fontSize: 11, color: "#64748B" }}>Nombre max de participants</div></div>
              </label>
            </div>
            {form.places_limitees && <div><label className="lbl">Nombre de places disponibles *</label><input className="inp" type="number" min="1" value={form.places_disponibles} onChange={e => setForm({ ...form, places_disponibles: e.target.value })} placeholder="Ex: 20" /></div>}
          </div>
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 6, height: 20, background: "#8B5CF6", borderRadius: 3 }} />
              <div style={{ fontWeight: 800, fontSize: 13, color: "#0A2540", textTransform: "uppercase", letterSpacing: "0.5px" }}>Publication & Médias</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label className="lbl">Statut de publication</label><select className="inp" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}><option value="publie">✅ Publié immédiatement</option><option value="brouillon">📝 Brouillon</option><option value="archive">📦 Archivé</option></select></div>
              <div><label className="lbl">Image de couverture</label><label className="upload-zone" style={{ minHeight: 80, display: "flex", alignItems: "center", justifyContent: "center" }}><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />{imagePreview ? <img src={imagePreview} style={{ maxHeight: 60, borderRadius: 6 }} alt="" /> : <div style={{ textAlign: "center" }}><div style={{ fontSize: 22 }}>🖼️</div><div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>Cliquer pour uploader</div></div>}</label></div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8, borderTop: "1px solid #F1F5F9" }}>
            <button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-gold" disabled={loading} style={{ padding: "11px 32px", fontSize: 14 }}>{loading ? "⏳ Enregistrement..." : (formation ? "💾 Modifier la formation" : "✅ Créer et publier")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== MODALE AJOUT / ÉDITION PODCAST (ADMIN) ==========
function PodcastFormModal({ podcast, onClose, onSave }: { podcast?: any; onClose: () => void; onSave: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ titre: podcast?.titre || "", description: podcast?.description || "", domaine: podcast?.domaine || "", auteur: podcast?.auteur || "", statut: podcast?.statut || "publie" });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(podcast?.image ? `${BASE}/uploads/podcasts-images/${podcast.image}` : "");
  const [audioName, setAudioName] = useState(podcast?.url_audio ? podcast.url_audio : "");
  const DOMAINES = ["Marketing Digital","Finance / Comptabilité","Ressources Humaines","Développement Web / Mobile","Design UI/UX","Stratégie Commerciale","Logistique / Supply Chain","Intelligence Artificielle / Data","Management","Communication","Juridique","Autre"];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) { alert("Le titre est requis"); return; }
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (audioFile) fd.append("audio_file", audioFile);
    if (imageFile) fd.append("image_file", imageFile);
    const url = podcast ? `${BASE}/admin/podcasts/${podcast.id}` : `${BASE}/admin/podcasts/create`;
    const method = podcast ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }, body: fd });
      if (res.ok) { onSave(); onClose(); } else alert("Erreur d'enregistrement");
    } catch { alert("Erreur réseau"); }
    setLoading(false);
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#1a0a3a 0%,#3b1d8a 100%)", padding: 0, borderRadius: "20px 20px 0 0", overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(90deg,rgba(167,139,250,.2),transparent)", padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, background: "rgba(167,139,250,.25)", border: "2px solid rgba(167,139,250,.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🎙️</div>
                <div>
                  <div style={{ color: "rgba(255,255,255,.55)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Administration — Podcasts</div>
                  <div style={{ fontWeight: 900, fontSize: 20, color: "#fff" }}>{podcast ? "✏️ Modifier le podcast" : "➕ Créer un nouveau podcast"}</div>
                  <div style={{ color: "#C4B5FD", fontSize: 11, fontWeight: 600, marginTop: 3 }}>✅ Publié directement sans validation expert</div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
            </div>
          </div>
          <div style={{ height: 4, background: "linear-gradient(90deg,#7C3AED,#A78BFA,rgba(167,139,250,0))" }} />
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "26px 30px" }}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><div style={{ width: 6, height: 20, background: "#7C3AED", borderRadius: 3 }} /><div style={{ fontWeight: 800, fontSize: 13, color: "#0A2540", textTransform: "uppercase" }}>Informations du podcast</div></div>
            <div style={{ marginBottom: 12 }}><label className="lbl">Titre du podcast *</label><input className="inp" required value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Ex : Les secrets du business digital" /></div>
            <div style={{ marginBottom: 12 }}><label className="lbl">Description</label><textarea className="inp" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Décrivez le contenu et les thèmes abordés..." /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label className="lbl">Auteur / Animateur</label><input className="inp" value={form.auteur} onChange={e => setForm({ ...form, auteur: e.target.value })} placeholder="Nom de l'animateur" /></div>
              <div><label className="lbl">Domaine / Thématique</label><select className="inp" value={form.domaine} onChange={e => setForm({ ...form, domaine: e.target.value })}><option value="">Sélectionner un domaine</option>{DOMAINES.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            </div>
          </div>
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><div style={{ width: 6, height: 20, background: "#A78BFA", borderRadius: 3 }} /><div style={{ fontWeight: 800, fontSize: 13, color: "#0A2540", textTransform: "uppercase" }}>Fichiers médias</div></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label className="lbl">Fichier audio (MP3)</label><label className="upload-zone" style={{ minHeight: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}><input type="file" accept="audio/mpeg" onChange={e => { const f = e.target.files?.[0]; if (f) { setAudioFile(f); setAudioName(f.name); } }} style={{ display: "none" }} />{audioName ? <div style={{ textAlign: "center" }}><div style={{ fontSize: 26 }}>🔊</div><div style={{ fontSize: 11, color: "#059669", fontWeight: 600, marginTop: 4 }}>✅ {audioName.length > 24 ? audioName.slice(0, 22) + "…" : audioName}</div></div> : <div style={{ textAlign: "center" }}><div style={{ fontSize: 26 }}>🎵</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>Cliquer pour uploader</div></div>}</label></div>
              <div><label className="lbl">Image de couverture</label><label className="upload-zone" style={{ minHeight: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />{imagePreview ? <img src={imagePreview} style={{ maxHeight: 70, borderRadius: 8 }} alt="" /> : <div style={{ textAlign: "center" }}><div style={{ fontSize: 26 }}>🖼️</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>Cliquer pour uploader</div></div>}</label></div>
            </div>
          </div>
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}><div style={{ width: 6, height: 20, background: "#10B981", borderRadius: 3 }} /><div style={{ fontWeight: 800, fontSize: 13, color: "#0A2540", textTransform: "uppercase" }}>Publication</div></div>
            <div><label className="lbl">Statut de publication</label><select className="inp" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}><option value="publie">✅ Publié immédiatement</option><option value="brouillon">📝 Brouillon</option><option value="archive">📦 Archivé</option></select></div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8, borderTop: "1px solid #F1F5F9" }}>
            <button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn" style={{ background: "#7C3AED", color: "#fff", padding: "11px 32px", fontSize: 14, fontWeight: 700, borderRadius: 10 }} disabled={loading}>{loading ? "⏳ Enregistrement..." : (podcast ? "💾 Modifier le podcast" : "✅ Créer et publier")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== COMPOSANT DEMANDES REDESIGNÉ ==========
function DemandesView({
  demandes, formations, podcasts, experts,
  formationsEnAttenteExpert, podcastsEnAttenteExpert,
  onOpenDemande, onPublierFormationExpert, onRefuserFormationExpert,
  onPublierPodcastExpert, onRefuserPodcastExpert,
  onSetFormationValidation, onSetPodcastValidation,
}: any) {
  const [activeTab, setActiveTab] = useState<"services" | "formations" | "podcasts">("services");
  const [statutFilter, setStatutFilter] = useState("tous");
  const [searchQ, setSearchQ] = useState("");

  const filteredServices = demandes.filter((d: any) => {
    const q = searchQ.toLowerCase();
    const statutOk = statutFilter === "tous" || d.statut === statutFilter;
    const searchOk = !q || (d.service || "").toLowerCase().includes(q) || (d.user?.prenom || "").toLowerCase().includes(q) || (d.user?.nom || "").toLowerCase().includes(q);
    return statutOk && searchOk;
  });

  const statutColors: any = {
    en_attente: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", icon: "⏳", label: "En attente" },
    acceptee:   { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0", icon: "✅", label: "Acceptée" },
    refusee:    { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA", icon: "❌", label: "Refusée" },
    en_cours:   { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", icon: "🔄", label: "En cours" },
    terminee:   { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0", icon: "🏁", label: "Terminée" },
  };

  const tabs = [
    { id: "services",   label: "Demandes de service",  icon: "🛠️",  count: demandes.length,                    urgentCount: demandes.filter((d: any) => d.statut === "en_attente").length },
    { id: "formations", label: "Formations à valider",  icon: "📚",  count: formationsEnAttenteExpert.length,   urgentCount: formationsEnAttenteExpert.length },
    { id: "podcasts",   label: "Podcasts à valider",    icon: "🎙️", count: podcastsEnAttenteExpert.length,    urgentCount: podcastsEnAttenteExpert.length },
  ] as const;

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* En-tête */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0A2540", letterSpacing: "-0.5px" }}>Centre de gestion des demandes</h2>
            <p style={{ fontSize: 13.5, color: "#64748B", marginTop: 4 }}>Traitez les demandes de service clients et validez les publications soumises par les experts.</p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {(formationsEnAttenteExpert.length + podcastsEnAttenteExpert.length + demandes.filter((d: any) => d.statut === "en_attente").length) > 0 && (
              <div style={{ background: "linear-gradient(135deg,#FEF3C7,#FFFBEB)", border: "1.5px solid #FDE68A", borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F7B500", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#92400E" }}>
                  {formationsEnAttenteExpert.length + podcastsEnAttenteExpert.length + demandes.filter((d: any) => d.statut === "en_attente").length} action{(formationsEnAttenteExpert.length + podcastsEnAttenteExpert.length + demandes.filter((d: any) => d.statut === "en_attente").length) > 1 ? "s" : ""} requise{(formationsEnAttenteExpert.length + podcastsEnAttenteExpert.length + demandes.filter((d: any) => d.statut === "en_attente").length) > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats rapides */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 20 }}>
          {[
            { label: "Demandes service",  value: demandes.length, pending: demandes.filter((d: any) => d.statut === "en_attente").length, color: "#8B5CF6", icon: "🛠️" },
            { label: "Formations expert", value: formationsEnAttenteExpert.length, pending: formationsEnAttenteExpert.length, color: "#F59E0B", icon: "📚" },
            { label: "Podcasts expert",   value: podcastsEnAttenteExpert.length,   pending: podcastsEnAttenteExpert.length,   color: "#7C3AED", icon: "🎙️" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: `${s.color}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#0A2540", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{s.label}</div>
              </div>
              {s.pending > 0 && (
                <div style={{ background: `${s.color}18`, color: s.color, borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 800 }}>
                  {s.pending} en attente
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Onglets */}
      <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 18, overflow: "hidden" }}>
        {/* Tab header */}
        <div style={{ display: "flex", borderBottom: "1.5px solid #EEF2F7", background: "#FAFBFE" }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: "16px 20px", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 13.5, fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? "#0A2540" : "#94A3B8",
                background: "transparent",
                borderBottom: activeTab === tab.id ? "2.5px solid #F7B500" : "2.5px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all .18s",
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.urgentCount > 0 && (
                <span style={{
                  background: activeTab === tab.id ? "#F7B500" : "#EF4444",
                  color: activeTab === tab.id ? "#0A2540" : "#fff",
                  borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 800,
                  minWidth: 22, textAlign: "center",
                }}>{tab.urgentCount}</span>
              )}
              {tab.urgentCount === 0 && tab.count > 0 && (
                <span style={{ background: "#F1F5F9", color: "#64748B", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ===== ONGLET DEMANDES DE SERVICE ===== */}
        {activeTab === "services" && (
          <div>
            {/* Filtres */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 14 }}>🔍</span>
                <input
                  className="inp"
                  style={{ paddingLeft: 36 }}
                  placeholder="Rechercher par service, client..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { v: "tous",       l: "Tous",        color: "#64748B" },
                  { v: "en_attente", l: "⏳ En attente", color: "#B45309" },
                  { v: "acceptee",   l: "✅ Acceptée",  color: "#059669" },
                  { v: "en_cours",   l: "🔄 En cours",  color: "#1D4ED8" },
                  { v: "refusee",    l: "❌ Refusée",   color: "#DC2626" },
                  { v: "terminee",   l: "🏁 Terminée",  color: "#15803D" },
                ].map(f => (
                  <button
                    key={f.v}
                    onClick={() => setStatutFilter(f.v)}
                    style={{
                      border: `1.5px solid ${statutFilter === f.v ? f.color : "#E2E8F0"}`,
                      borderRadius: 99, padding: "5px 14px", fontSize: 12, fontWeight: 600,
                      cursor: "pointer", background: statutFilter === f.v ? `${f.color}14` : "#fff",
                      color: statutFilter === f.v ? f.color : "#64748B",
                      transition: "all .16s", fontFamily: "inherit",
                    }}
                  >{f.l}</button>
                ))}
              </div>
            </div>

            {/* Liste */}
            <div style={{ padding: "16px 20px" }}>
              {filteredServices.length === 0 ? (
                <div style={{ padding: "56px 0", textAlign: "center", color: "#94A3B8" }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>📭</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#64748B" }}>Aucune demande trouvée</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>Modifiez vos filtres ou revenez plus tard.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredServices.map((d: any) => {
                    const s = statutColors[d.statut] || statutColors.en_attente;
                    return (
                      <div
                        key={d.id}
                        style={{
                          border: `1.5px solid ${d.statut === "en_attente" ? "#FDE68A" : "#EEF2F7"}`,
                          borderRadius: 14, padding: "18px 20px",
                          background: d.statut === "en_attente" ? "#FFFCF0" : "#fff",
                          transition: "all .18s", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,.07)")}
                        onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                      >
                        {/* Icone service */}
                        <div style={{
                          width: 46, height: 46, borderRadius: 13,
                          background: d.statut === "en_attente" ? "#FFFBEB" : "#F8FAFC",
                          border: `1.5px solid ${d.statut === "en_attente" ? "#FDE68A" : "#EEF2F7"}`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
                        }}>🛠️</div>

                        {/* Info principale */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                            <span style={{ fontWeight: 700, fontSize: 14.5, color: "#0A2540" }}>{d.service}</span>
                            <span style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}`, borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                              {s.icon} {s.label}
                            </span>
                            {d.expert_assigne && (
                              <span style={{ background: "#F0FDFA", color: "#0D9488", border: "1px solid #99F6E4", borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                                👤 {d.expert_assigne?.user?.prenom} {d.expert_assigne?.user?.nom}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 12.5, color: "#64748B", display: "flex", alignItems: "center", gap: 5 }}>
                              <span>👤</span> {d.user?.prenom} {d.user?.nom}
                            </span>
                            {d.user?.startup?.nom_startup && (
                              <span style={{ fontSize: 12.5, color: "#64748B", display: "flex", alignItems: "center", gap: 5 }}>
                                <span>🚀</span> {d.user.startup.nom_startup}
                              </span>
                            )}
                            <span style={{ fontSize: 12, color: "#94A3B8" }}>
                              📅 {new Date(d.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            {d.delai && <span style={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>⏱ {d.delai}</span>}
                          </div>
                          {d.description && (
                            <p style={{ fontSize: 12.5, color: "#475569", marginTop: 7, lineHeight: 1.6, overflow: "hidden", maxHeight: 38, WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical" }}>
                              {d.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: 12.5, padding: "8px 18px", whiteSpace: "nowrap" }}
                            onClick={() => onOpenDemande(d)}
                          >
                            ⚙️ Gérer la demande
                          </button>
                          {d.statut === "en_attente" && (
                            <div style={{ fontSize: 11, color: "#B45309", fontWeight: 600, textAlign: "right" }}>Action requise</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== ONGLET FORMATIONS À VALIDER ===== */}
        {activeTab === "formations" && (
          <div>
            {formationsEnAttenteExpert.length === 0 ? (
              <div style={{ padding: "72px 0", textAlign: "center", color: "#94A3B8" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#334155", marginBottom: 6 }}>Tout est à jour !</div>
                <div style={{ fontSize: 13 }}>Aucune formation en attente de validation.</div>
              </div>
            ) : (
              <div style={{ padding: "20px" }}>
                <div style={{ background: "linear-gradient(135deg,#FFFBEB,#FEF3C7)", border: "1.5px solid #FDE68A", borderRadius: 14, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>⚠️</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#92400E", fontSize: 13.5 }}>{formationsEnAttenteExpert.length} formation{formationsEnAttenteExpert.length > 1 ? "s" : ""} soumise{formationsEnAttenteExpert.length > 1 ? "s" : ""} par des experts nécessite{formationsEnAttenteExpert.length === 1 ? "" : "nt"} votre validation</div>
                    <div style={{ fontSize: 12, color: "#B45309", marginTop: 2 }}>Après validation, elles apparaîtront automatiquement dans l'onglet Formations.</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {formationsEnAttenteExpert.map((f: any) => (
                    <div key={f.id} style={{ border: "1.5px solid #DDD6FE", borderRadius: 16, overflow: "hidden", background: "#fff" }}>
                      {/* Header coloré */}
                      <div style={{ background: "linear-gradient(135deg,#F3E8FF,#EDE9FE)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {f.image ? (
                            <img src={`${BASE}/uploads/formations/${f.image}`} style={{ width: 52, height: 52, borderRadius: 11, objectFit: "cover", flexShrink: 0 }} alt="" />
                          ) : (
                            <div style={{ width: 52, height: 52, borderRadius: 11, background: "linear-gradient(135deg,#7C3AED,#5B21B6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>📚</div>
                          )}
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540" }}>{f.titre}</div>
                            <div style={{ fontSize: 12, color: "#6B21A8", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ background: "#7C3AED", color: "#fff", borderRadius: 6, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>EXPERT</span>
                              <span>{f.expert?.user?.prenom} {f.expert?.user?.nom}</span>
                              <span style={{ color: "#94A3B8" }}>·</span>
                              <span style={{ color: "#64748B" }}>{f.expert?.domaine}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "#B45309" }}>
                          ⏳ En attente · {new Date(f.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </div>

                      {/* Détails */}
                      <div style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                          {f.domaine && <span style={{ background: "#EEF2F7", color: "#475569", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>📁 {f.domaine}</span>}
                          {f.mode && <span style={{ background: "#EEF2F7", color: "#475569", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{f.mode === "en_ligne" ? "💻 En ligne" : f.mode === "presentiel" ? "🏢 Présentiel" : "🌐 Hybride"}</span>}
                          {f.duree && <span style={{ background: "#EEF2F7", color: "#475569", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>⏱ {f.duree}</span>}
                          {f.certifiante && <span style={{ background: "#F3E8FF", color: "#7C3AED", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>🎓 Certifiante</span>}
                          {f.gratuit ? <span style={{ background: "#ECFDF5", color: "#059669", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>🎁 Gratuit</span> : f.prix ? <span style={{ background: "#FFFBEB", color: "#B45309", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>💰 {f.prix} DT</span> : null}
                          {f.places_limitees && <span style={{ background: "#EFF6FF", color: "#1D4ED8", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>🎟️ {f.places_disponibles} places</span>}
                        </div>
                        {f.description && <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, marginBottom: 14, overflow: "hidden", maxHeight: 58 }}>{f.description}</p>}

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 10, borderTop: "1px solid #F3E8FF", paddingTop: 14, flexWrap: "wrap" }}>
                          <button
                            onClick={() => onSetFormationValidation(f)}
                            style={{ flex: 1, minWidth: 140, padding: "10px 16px", border: "1.5px solid #DDD6FE", borderRadius: 10, background: "#F3E8FF", color: "#7C3AED", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                          >
                            👁 Examiner en détail
                          </button>
                          <button
                            onClick={() => onPublierFormationExpert(f.id)}
                            style={{ flex: 1, minWidth: 140, padding: "10px 16px", border: "1.5px solid #A7F3D0", borderRadius: 10, background: "#ECFDF5", color: "#059669", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                          >
                            ✅ Valider & publier
                          </button>
                          <button
                            onClick={() => onRefuserFormationExpert(f.id)}
                            style={{ padding: "10px 16px", border: "1.5px solid #FECACA", borderRadius: 10, background: "#FEF2F2", color: "#DC2626", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                          >
                            ❌ Refuser
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== ONGLET PODCASTS À VALIDER ===== */}
        {activeTab === "podcasts" && (
          <div>
            {podcastsEnAttenteExpert.length === 0 ? (
              <div style={{ padding: "72px 0", textAlign: "center", color: "#94A3B8" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#334155", marginBottom: 6 }}>Tout est à jour !</div>
                <div style={{ fontSize: 13 }}>Aucun podcast en attente de validation.</div>
              </div>
            ) : (
              <div style={{ padding: "20px" }}>
                <div style={{ background: "linear-gradient(135deg,#FAF5FF,#F3E8FF)", border: "1.5px solid #DDD6FE", borderRadius: 14, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>🎙️</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#6B21A8", fontSize: 13.5 }}>{podcastsEnAttenteExpert.length} podcast{podcastsEnAttenteExpert.length > 1 ? "s" : ""} soumis par des experts — en attente de validation</div>
                    <div style={{ fontSize: 12, color: "#7C3AED", marginTop: 2 }}>Écoutez avant de publier. Après validation, ils apparaîtront dans l'onglet Podcasts.</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {podcastsEnAttenteExpert.map((p: any) => (
                    <div key={p.id} style={{ border: "1.5px solid #DDD6FE", borderRadius: 16, overflow: "hidden", background: "#fff" }}>
                      {/* Header */}
                      <div style={{ background: "linear-gradient(135deg,#FAF5FF,#F3E8FF)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 56, height: 56, borderRadius: 13, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#4c1d95,#2d1b5e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {p.image ? <img src={`${BASE}/uploads/podcasts-images/${p.image}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontSize: 26, color: "#C4B5FD" }}>🎙️</span>}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540" }}>{p.titre}</div>
                            <div style={{ fontSize: 12, color: "#6B21A8", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ background: "#7C3AED", color: "#fff", borderRadius: 6, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>EXPERT</span>
                              <span>{p.expert?.user?.prenom} {p.expert?.user?.nom}</span>
                              {p.auteur && <><span style={{ color: "#94A3B8" }}>·</span><span style={{ color: "#64748B" }}>{p.auteur}</span></>}
                            </div>
                          </div>
                        </div>
                        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "#B45309" }}>
                          ⏳ En attente · {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </div>

                      {/* Contenu */}
                      <div style={{ padding: "14px 18px" }}>
                        {p.domaine && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ background: "#F3E8FF", color: "#7C3AED", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>📁 {p.domaine}</span>
                          </div>
                        )}
                        {p.description && <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, marginBottom: 12 }}>{p.description}</p>}

                        {/* Player audio intégré */}
                        {p.url_audio && (
                          <div style={{ background: "#F3E8FF", borderRadius: 10, padding: "10px 14px", marginBottom: 14, border: "1px solid #DDD6FE" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>🎧 Écouter</div>
                            <audio src={`${BASE}/uploads/podcasts-audio/${p.url_audio}`} preload="metadata" controls style={{ width: "100%", height: 36 }} />
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 10, borderTop: "1px solid #F3E8FF", paddingTop: 14, flexWrap: "wrap" }}>
                          <button
                            onClick={() => onSetPodcastValidation(p)}
                            style={{ flex: 1, minWidth: 140, padding: "10px 16px", border: "1.5px solid #DDD6FE", borderRadius: 10, background: "#F3E8FF", color: "#7C3AED", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                          >
                            🎧 Écouter & examiner
                          </button>
                          <button
                            onClick={() => onPublierPodcastExpert(p.id)}
                            style={{ flex: 1, minWidth: 140, padding: "10px 16px", border: "1.5px solid #A7F3D0", borderRadius: 10, background: "#ECFDF5", color: "#059669", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                          >
                            ✅ Valider & publier
                          </button>
                          <button
                            onClick={() => onRefuserPodcastExpert(p.id)}
                            style={{ padding: "10px 16px", border: "1.5px solid #FECACA", borderRadius: 10, background: "#FEF2F2", color: "#DC2626", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                          >
                            ❌ Refuser
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ========== COMPOSANT PRINCIPAL ==========
export default function DashboardAdmin() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [realUser, setRealUser] = useState<any>(null);

  const [experts, setExperts] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [contactMsgs, setContactMsgs] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [medias, setMedias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ text: "", ok: true });
  const [selected, setSelected] = useState<any>(null);
  const [selectedDemande, setSelectedDemande] = useState<any>(null);
  const [commentaireAdmin, setCommentaireAdmin] = useState("");
  const [selectedExpertProfile, setSelectedExpertProfile] = useState<any>(null);

  const [selectedFormationValidation, setSelectedFormationValidation] = useState<any>(null);
  const [selectedPodcastValidation, setSelectedPodcastValidation] = useState<any>(null);

  const [showFormationForm, setShowFormationForm] = useState(false);
  const [editingFormation, setEditingFormation] = useState<any>(null);
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<any>(null);

  const [hForm, setHForm] = useState<any>({});
  const [savingH, setSavingH] = useState(false);
  const [replyModal, setReplyModal] = useState<any>({ open: false, messageId: 0, email: "", nom: "", prenom: "" });
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [articleForm, setArticleForm] = useState<any>({ titre: "", description: "", type: "article", categorie: "", duree_lecture: "", statut: "brouillon", image: "" });
  const [articleImageFile, setArticleImageFile] = useState<File | null>(null);
  const [articlePdfFile, setArticlePdfFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [categorieAutre, setCategorieAutre] = useState(false);
  const [categoriePersonnalise, setCategoriePersonnalise] = useState("");
  const categoriesPredefinies = ["Développement","Intelligence artificielle","Business","Sécurité","Design","Autre"];

  const hf = (k: string) => hForm[k] || "";
  const setHF = (k: string, v: string) => setHForm((p: any) => ({ ...p, [k]: v }));
  const token = () => (typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "");
  const hdr = () => ({ Authorization: `Bearer ${token()}` });
  const hdrJ = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });
  function notify(text: string, ok = true) { setToast({ text, ok }); setTimeout(() => setToast({ text: "", ok: true }), 3200); }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = token();
    if (!t) { router.replace("/connexion"); return; }
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
      .then(async (res) => {
        if (!res.ok) { localStorage.removeItem("access_token"); router.replace("/connexion"); return; }
        const user = await res.json();
        if (user.role !== "admin") { localStorage.removeItem("access_token"); router.replace("/connexion"); return; }
        setRealUser(user);
        loadAll(); loadHistoire(); loadArticles(); loadContactMessages();
        loadFormations(); loadPodcasts(); loadDemandes(); loadMedias();
      })
      .catch(() => { localStorage.removeItem("access_token"); router.replace("/connexion"); })
      .finally(() => setLoadingAuth(false));
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [e, s, t] = await Promise.all([
        fetch(`${BASE}/admin/experts?_=${Date.now()}`, { headers: hdr() }).then(r => r.json()),
        fetch(`${BASE}/admin/startups?_=${Date.now()}`, { headers: hdr() }).then(r => r.json()),
        fetch(`${BASE}/temoignages/all?_=${Date.now()}`, { headers: hdr() }).then(r => r.json()),
      ]);
      setExperts(Array.isArray(e) ? e : []);
      setStartups(Array.isArray(s) ? s : []);
      setTemoignages(Array.isArray(t) ? t : []);
    } catch { notify("Erreur chargement", false); }
    setLoading(false);
  }
  async function loadFormations() { try { const r = await fetch(`${BASE}/formations/admin/all?_=${Date.now()}`, { headers: hdr() }); setFormations(r.ok ? await r.json() : []); } catch { setFormations([]); } }
  async function loadPodcasts() { try { const r = await fetch(`${BASE}/admin/podcasts/all?_=${Date.now()}`, { headers: hdr() }); setPodcasts(r.ok ? await r.json() : []); } catch { setPodcasts([]); } }
  async function loadDemandes() { try { const r = await fetch(`${BASE}/demandes-service/all?_=${Date.now()}`, { headers: hdr() }); setDemandes(r.ok ? (await r.json()) : []); } catch { setDemandes([]); } }
  async function loadHistoire() { try { const r = await fetch(`${BASE}/histoire?_=${Date.now()}`); if (r.ok) setHForm(await r.json()); } catch {} }
  async function loadArticles() { try { const r = await fetch(`${BASE}/articles/admin/all?_=${Date.now()}`, { headers: hdr() }); if (r.ok) setArticles(await r.json()); } catch {} }
  async function loadContactMessages() { try { const r = await fetch(`${BASE}/contact/messages?_=${Date.now()}`, { headers: hdr() }); if (r.ok) setContactMsgs(await r.json()); } catch {} }
  async function loadMedias() { try { const r = await fetch(`${BASE}/admin/medias/all`, { headers: hdr() }); setMedias(r.ok ? await r.json() : []); } catch { setMedias([]); } }

  async function valider(type: string, id: number) { const r = await fetch(`${BASE}/admin/${type}/${id}/valider`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("✅ Validé !"); setSelected(null); loadAll(); } else notify("Erreur", false); }
  async function refuser(type: string, id: number) { const r = await fetch(`${BASE}/admin/${type}/${id}/refuser`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("Refusé"); setSelected(null); loadAll(); } else notify("Erreur", false); }
  async function validerModification(id: number) { const r = await fetch(`${BASE}/experts/${id}/valider-modification`, { method: "PATCH", headers: hdr() }); if (r.ok) notify("✅ Modif validée"); else notify("Erreur", false); loadAll(); }
  async function refuserModification(id: number) { const r = await fetch(`${BASE}/experts/${id}/refuser-modification`, { method: "PATCH", headers: hdr() }); if (r.ok) notify("Modif refusée"); else notify("Erreur", false); loadAll(); }
  async function validerTemo(id: number) { const r = await fetch(`${BASE}/temoignages/${id}/valider`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("✅ Publié !"); loadAll(); } else notify("Erreur", false); }
  async function refuserTemo(id: number) { const r = await fetch(`${BASE}/temoignages/${id}/refuser`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("Refusé"); loadAll(); } else notify("Erreur", false); }
  async function supprimerTemo(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/temoignages/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) notify("Supprimé"); loadAll(); }
  async function marquerLu(id: number) { const r = await fetch(`${BASE}/contact/messages/${id}/lu`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("Lu"); loadContactMessages(); } else notify("Erreur", false); }
  async function supprimerMessage(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/contact/messages/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("Supprimé"); loadContactMessages(); } else notify("Erreur", false); }
  async function saveHistoire(e: React.FormEvent) { e.preventDefault(); setSavingH(true); try { const r = await fetch(`${BASE}/histoire`, { method: "PUT", headers: hdrJ(), body: JSON.stringify(hForm) }); if (r.ok) notify("✅ Mis à jour !"); else notify("Erreur", false); } catch { notify("Erreur réseau", false); } setSavingH(false); }
  async function envoyerReponse(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) { notify("Écrivez une réponse", false); return; }
    setSendingReply(true);
    try {
      const r = await fetch(`${BASE}/contact/messages/${replyModal.messageId}/repondre`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ reponse: replyText }) });
      if (r.ok) { notify("✅ Envoyé !"); setReplyModal({ open: false, messageId: 0, email: "", nom: "", prenom: "" }); setReplyText(""); loadContactMessages(); } else notify("Erreur", false);
    } catch { notify("Erreur", false); }
    setSendingReply(false);
  }

  async function changerStatutDemande(id: number, statut: string) {
    const body: any = { statut };
    if (commentaireAdmin) body.commentaire_admin = commentaireAdmin;
    const r = await fetch(`${BASE}/demandes-service/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify(body) });
    if (r.ok) { notify(`✅ Statut → ${statut}`); setSelectedDemande(null); setCommentaireAdmin(""); loadDemandes(); } else notify("Erreur", false);
  }
  async function accepterFormationDemande(demandeId: number) {
    const r = await fetch(`${BASE}/demandes-service/formation/${demandeId}/accept`, { method: "PATCH", headers: hdrJ() });
    if (r.ok) { notify("✅ Acceptée"); setSelectedDemande(null); loadDemandes(); loadFormations(); } else notify("Erreur", false);
  }
  async function refuserFormationDemande(demandeId: number) {
    if (!confirm("Refuser ?")) return;
    const r = await fetch(`${BASE}/demandes-service/formation/${demandeId}/reject`, { method: "PATCH", headers: hdrJ() });
    if (r.ok) { notify("Refusée"); setSelectedDemande(null); loadDemandes(); loadFormations(); } else notify("Erreur", false);
  }
  async function notifierExperts(demandeId: number, expertIds: number[]) {
    const r = await fetch(`${BASE}/demandes-service/${demandeId}/notifier-experts`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ expert_ids: expertIds }) });
    if (r.ok) notify(`✅ ${expertIds.length} notifié(s)`); else notify("Erreur", false);
    loadDemandes();
  }
  async function assignerExpert(demandeId: number, expertId: number, commentaire: string) {
    const body: any = { expert_id: expertId };
    if (commentaire) body.commentaire = commentaire;
    const r = await fetch(`${BASE}/demandes-service/${demandeId}/assigner`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify(body) });
    if (r.ok) { notify("✅ Expert assigné"); setSelectedDemande(null); loadDemandes(); } else notify("Erreur", false);
  }
  function getDemandeDomaine(demande: any): string {
    if (demande.domaine) return demande.domaine;
    const match = demande.description?.match(/\[Domaine:\s*([^\]]+)\]/i);
    return match ? match[1] : "Autre";
  }

  async function publierFormationExpert(id: number) {
    try {
      let r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) });
      if (!r.ok) r = await fetch(`${BASE}/formations/expert/statut/${id}`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) });
      if (r.ok) { notify("✅ Formation publiée !"); setSelectedFormationValidation(null); await loadFormations(); } else notify("Erreur lors de la publication", false);
    } catch { notify("Erreur réseau", false); }
  }
  async function refuserFormationExpert(id: number) {
    if (!confirm("Refuser cette formation ?")) return;
    try {
      let r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) });
      if (!r.ok) r = await fetch(`${BASE}/formations/expert/statut/${id}`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) });
      if (r.ok) { notify("Formation refusée"); setSelectedFormationValidation(null); await loadFormations(); } else notify("Erreur", false);
    } catch { notify("Erreur réseau", false); }
  }
  async function publierPodcastExpert(id: number) {
    try {
      let r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) });
      if (!r.ok) r = await fetch(`${BASE}/podcasts/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) });
      if (r.ok) { notify("✅ Podcast publié !"); setSelectedPodcastValidation(null); await loadPodcasts(); } else notify("Erreur lors de la publication", false);
    } catch { notify("Erreur réseau", false); }
  }
  async function refuserPodcastExpert(id: number) {
    if (!confirm("Refuser ce podcast ?")) return;
    try {
      let r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) });
      if (!r.ok) r = await fetch(`${BASE}/podcasts/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) });
      if (r.ok) { notify("Podcast refusé"); setSelectedPodcastValidation(null); await loadPodcasts(); } else notify("Erreur", false);
    } catch { notify("Erreur réseau", false); }
  }

  async function publierFormation(id: number) { const r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (r.ok) notify("✅ Publiée"); else notify("Erreur", false); loadFormations(); }
  async function archiverFormation(id: number) { const r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "archive" }) }); if (r.ok) notify("📦 Archivée"); else notify("Erreur", false); loadFormations(); }
  async function supprimerFormation(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/formations/admin/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("✅ Supprimée"); loadFormations(); } else notify("Erreur", false); }
  async function publierPodcast(id: number) { const r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (r.ok) notify("✅ Publié"); else notify("Erreur", false); loadPodcasts(); }
  async function archiverPodcast(id: number) { const r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "archive" }) }); if (r.ok) notify("📦 Archivé"); else notify("Erreur", false); loadPodcasts(); }
  async function supprimerPodcast(id: number) { if (!confirm("Supprimer ?")) return; let r = await fetch(`${BASE}/admin/podcasts/${id}`, { method: "DELETE", headers: hdr() }); if (!r.ok) r = await fetch(`${BASE}/podcasts/admin/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("✅ Supprimé"); loadPodcasts(); } else notify("Erreur", false); }

  function resetArticleForm() { setEditingArticle(null); setArticleImageFile(null); setArticlePdfFile(null); setImagePreview(""); setPdfName(""); setCategorieAutre(false); setCategoriePersonnalise(""); setArticleForm({ titre: "", description: "", type: "article", categorie: "", duree_lecture: "", statut: "brouillon", image: "" }); }
  function ouvrirEditionArticle(a: any) { setEditingArticle(a); setArticleForm({ titre: a.titre, description: a.description, type: a.type, categorie: a.categorie, duree_lecture: a.duree_lecture, statut: a.statut, image: a.image }); if (a.image) setImagePreview(`${BASE}/uploads/articles-img/${a.image}`); if (a.pdf) setPdfName(a.pdf); setCategorieAutre(!!a.categorie && !categoriesPredefinies.includes(a.categorie)); if (a.categorie && !categoriesPredefinies.includes(a.categorie)) setCategoriePersonnalise(a.categorie); setShowArticleModal(true); }
  async function sauvegarderArticle(e: React.FormEvent) {
    e.preventDefault();
    let categorieFinale = articleForm.categorie;
    if (categorieAutre) { categorieFinale = categoriePersonnalise; if (!categorieFinale.trim()) { notify("Saisissez une catégorie", false); return; } }
    const fd = new FormData();
    Object.entries(articleForm).forEach(([k, v]) => { if (v !== null && v !== undefined && k !== "categorie") fd.append(k, String(v)); });
    fd.append("categorie", categorieFinale);
    if (articleImageFile) fd.append("image", articleImageFile);
    if (articlePdfFile) fd.append("pdf", articlePdfFile);
    const url = editingArticle ? `${BASE}/articles/admin/${editingArticle.id}` : `${BASE}/articles/admin/create`;
    const r = await fetch(url, { method: editingArticle ? "PUT" : "POST", headers: hdr(), body: fd });
    if (r.ok) { notify(editingArticle ? "✅ Modifié" : "✅ Créé"); setShowArticleModal(false); resetArticleForm(); loadArticles(); } else notify("Erreur", false);
  }
  async function publierArticle(id: number) { const r = await fetch(`${BASE}/articles/admin/${id}/publier`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("✅ Publié"); loadArticles(); } else notify("Erreur", false); }
  async function supprimerArticle(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/articles/admin/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("Supprimé"); loadArticles(); } else notify("Erreur", false); }

  const enAttenteExperts  = experts.filter(e => e.statut === "en_attente");
  const enAttenteStartups = startups.filter(s => s.statut === "en_attente");
  const modificationsAtt  = experts.filter(e => e.modification_demandee);
  const temosAttente      = temoignages.filter(t => t.statut === "en_attente");
  const msgsNonLus        = contactMsgs.filter(m => !m.is_read).length;
  const brouillons        = articles.filter(a => a.statut === "brouillon").length;

  const formationsEnAttenteExpert = formations.filter(f => f.statut === "en_attente" && f.expert_id);
  const podcastsEnAttenteExpert   = podcasts.filter(p => p.statut === "en_attente" && (p.expert_id || p.expert));
  const toutes_formations_onglet  = formations.filter(f => !(f.statut === "en_attente" && f.expert_id));
  const tous_podcasts_onglet      = podcasts.filter(p => !(p.statut === "en_attente" && (p.expert_id || p.expert)));

  const totalNotifs = enAttenteExperts.length + enAttenteStartups.length + modificationsAtt.length + temosAttente.length + brouillons + formationsEnAttenteExpert.length + podcastsEnAttenteExpert.length + msgsNonLus + demandes.filter(d => d.statut === "en_attente").length;

  const navItems: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "dashboard",   label: "Tableau de bord", icon: "📊" },
    { id: "demandes",    label: "Demandes",        icon: "📋", count: demandes.filter(d => d.statut === "en_attente").length + formationsEnAttenteExpert.length + podcastsEnAttenteExpert.length },
    { id: "experts",     label: "Experts",         icon: "🎯", count: enAttenteExperts.length },
    { id: "startups",    label: "Startups",        icon: "🚀", count: enAttenteStartups.length },
    { id: "temoignages", label: "Témoignages",     icon: "⭐", count: temosAttente.length },
    { id: "contacts",    label: "Messages",        icon: "📩", count: msgsNonLus },
    { id: "histoire",    label: "Page À propos",   icon: "📖" },
    { id: "blog",        label: "Blog",            icon: "📝", count: brouillons },
    { id: "formations",  label: "Formations",      icon: "📚" },
    { id: "podcasts",    label: "Podcasts",        icon: "🎙️" },
    { id: "medias",      label: "Médias & Vidéos", icon: "🎬" },
  ];

  if (loadingAuth) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F1F4F9" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "4px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ color: "#0A2540", fontWeight: 600 }}>Vérification des accès...</div>
      </div>
    </div>
  );
  if (!realUser || realUser.role !== "admin") return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:#F1F4F9;color:#0A2540;}
        .inp{width:100%;padding:10px 13px;border:1.5px solid #E2E8F0;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:13px;transition:border-color .18s;background:#FAFBFE;color:#0A2540;outline:none;}
        .inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.1);}
        textarea.inp{resize:vertical;}
        .inp:disabled{background:#F1F5F9;color:#94A3B8;cursor:not-allowed;}
        .lbl{font-size:10.5px;font-weight:700;color:#8A9AB5;text-transform:uppercase;letter-spacing:1.2px;display:block;margin-bottom:5px;}
        .fg{margin-bottom:12px;}
        .btn{font-family:'DM Sans',sans-serif;font-weight:600;border:none;border-radius:9px;cursor:pointer;padding:8px 16px;font-size:13px;transition:all .16s;display:inline-flex;align-items:center;gap:6px;line-height:1.4;}
        .btn-primary{background:#0A2540;color:#F7B500;}.btn-primary:hover{background:#F7B500;color:#0A2540;}
        .btn-green{background:#ECFDF5;color:#059669;}.btn-green:hover{background:#059669;color:#fff;}
        .btn-red{background:#FEF2F2;color:#DC2626;}.btn-red:hover{background:#DC2626;color:#fff;}
        .btn-blue{background:#EFF6FF;color:#1D4ED8;}.btn-blue:hover{background:#1D4ED8;color:#fff;}
        .btn-gray{background:#F1F5F9;color:#475569;}.btn-gray:hover{background:#E2E8F0;}
        .btn-gold{background:#F7B500;color:#0A2540;font-weight:700;}.btn-gold:hover{background:#e6a800;}
        .btn-outline{background:transparent;border:1.5px solid #E2E8F0;color:#475569;}.btn-outline:hover{border-color:#0A2540;color:#0A2540;}
        .btn-purple{background:#F3E8FF;color:#7C3AED;border:1px solid #DDD6FE;}.btn-purple:hover{background:#7C3AED;color:#fff;}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.55);z-index:500;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(6px);}
        .modal{background:#fff;border-radius:20px;width:100%;max-width:700px;max-height:92vh;overflow-y:auto;box-shadow:0 32px 80px rgba(10,37,64,.25);}
        .info-row{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #F8FAFC;}
        .info-lbl{font-size:11px;color:#8A9AB5;font-weight:700;text-transform:uppercase;width:120px;flex-shrink:0;padding-top:2px;}
        .info-val{font-size:13.5px;color:#0A2540;word-break:break-word;}
        .file-link{background:#EFF6FF;color:#1D4ED8;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:5px;}
        .file-link:hover{background:#1D4ED8;color:#fff;}
        table{width:100%;border-collapse:collapse;}
        th{text-align:left;font-size:10.5px;font-weight:700;color:#8A9AB5;text-transform:uppercase;padding:10px 16px;border-bottom:2px solid #F1F5F9;letter-spacing:.5px;}
        td{padding:12px 16px;border-bottom:1px solid #F8FAFC;font-size:13px;color:#0A2540;vertical-align:middle;}
        tr:last-child td{border-bottom:none;}
        tr:hover td{background:#FAFBFE;}
        .pill-f{border:1.5px solid #E2E8F0;border-radius:99px;padding:5px 13px;font-size:12px;font-weight:600;cursor:pointer;background:#fff;color:#64748B;transition:all .18s;font-family:'DM Sans',sans-serif;white-space:nowrap;}
        .pill-f:hover{border-color:#F7B500;color:#B45309;}
        .pill-f.on{background:#F7B500;color:#0A2540;border-color:#F7B500;font-weight:700;}
        ::-webkit-scrollbar{width:6px;height:6px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:99px;}
        .card{background:#fff;border:1.5px solid #EEF2F7;border-radius:14px;padding:18px 20px;margin-bottom:14px;}
        .upload-zone{display:block;border:2px dashed #D1D5DB;border-radius:10px;padding:16px;background:#F8FAFC;cursor:pointer;text-align:center;transition:border-color .2s;}
        .upload-zone:hover{border-color:#F7B500;}
        .pdf-chip{display:inline-flex;align-items:center;gap:8px;background:#FEF3C7;border:1.5px solid #FDE68A;border-radius:99px;padding:6px 14px;font-size:12.5px;font-weight:700;color:#92400E;}
        .badge{display:inline-flex;align-items:center;gap:4px;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .formation-source-badge{background:linear-gradient(135deg,#7C3AED,#5B21B6);color:#fff;border-radius:99px;padding:2px 10px;font-size:10px;font-weight:700;display:inline-flex;align-items:center;gap:4px;}
        .podcast-source-badge{background:linear-gradient(135deg,#4c1d95,#2d1b5e);color:#fff;border-radius:99px;padding:2px 10px;font-size:10px;font-weight:700;display:inline-flex;align-items:center;gap:4px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .fade-in{animation:fadeIn .3s ease;}
      `}</style>

      {toast.text && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.ok ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${toast.ok ? "#A7F3D0" : "#FECACA"}`, borderLeft: `4px solid ${toast.ok ? "#059669" : "#DC2626"}`, color: toast.ok ? "#059669" : "#DC2626", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 13, boxShadow: "0 8px 28px rgba(0,0,0,.12)", maxWidth: 380 }}>
          {toast.text}
        </div>
      )}

      {/* MODALES */}
      {selected && (
        <div className="modal-bg" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e: any) => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFE", borderRadius: "20px 20px 0 0" }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>{selected.type === "expert" ? "👤 Détails Expert" : "🚀 Détails Startup"}</span>
              <button className="btn btn-gray" style={{ padding: "5px 10px" }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: "14px 18px", background: "#F8FAFC", borderRadius: 14 }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #F7B500", fontSize: 20, color: "#F7B500", fontWeight: 800 }}>{selected.data.user?.prenom?.[0]}{selected.data.user?.nom?.[0]}</div>
                <div><div style={{ fontWeight: 800, fontSize: 18, color: "#0A2540" }}>{selected.data.user?.prenom} {selected.data.user?.nom}</div><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{selected.data.user?.email}</div></div>
              </div>
              {selected.type === "expert" ? (
                <>
                  <div className="info-row"><span className="info-lbl">Domaine</span><span className="info-val">{selected.data.domaine || "—"}</span></div>
                  <div className="info-row"><span className="info-lbl">Expérience</span><span className="info-val">{selected.data.annee_debut_experience ? `${new Date().getFullYear() - selected.data.annee_debut_experience} ans` : "—"}</span></div>
                  <div className="info-row"><span className="info-lbl">Localisation</span><span className="info-val">{selected.data.localisation || "—"}</span></div>
                  <div className="info-row"><span className="info-lbl">Téléphone</span><span className="info-val">{selected.data.user?.telephone || "—"}</span></div>
                  <div className="info-row"><span className="info-lbl">Description</span><span className="info-val">{selected.data.description || "—"}</span></div>
                  {selected.data.cv && <div className="info-row"><span className="info-lbl">CV</span><span className="info-val"><a href={`${BASE}/uploads/cv/${selected.data.cv}`} target="_blank" className="file-link">📄 CV</a></span></div>}
                </>
              ) : (
                <>
                  <div className="info-row"><span className="info-lbl">Startup</span><span className="info-val">{selected.data.nom_startup || "—"}</span></div>
                  <div className="info-row"><span className="info-lbl">Secteur</span><span className="info-val">{selected.data.secteur || "—"}</span></div>
                  <div className="info-row"><span className="info-lbl">Taille</span><span className="info-val">{selected.data.taille || "—"}</span></div>
                  <div className="info-row"><span className="info-lbl">Fonction</span><span className="info-val">{selected.data.fonction || "—"}</span></div>
                  <div className="info-row"><span className="info-lbl">Site web</span><span className="info-val">{selected.data.site_web || "—"}</span></div>
                  <div className="info-row"><span className="info-lbl">Description</span><span className="info-val">{selected.data.description || "—"}</span></div>
                </>
              )}
            </div>
            {selected.data.statut === "en_attente" && (
              <div style={{ padding: "14px 24px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 10, justifyContent: "flex-end", background: "#FAFBFE", borderRadius: "0 0 20px 20px" }}>
                <button className="btn btn-red" onClick={() => refuser(selected.type === "expert" ? "experts" : "startups", selected.data.id)}>❌ Refuser</button>
                <button className="btn btn-green" onClick={() => valider(selected.type === "expert" ? "experts" : "startups", selected.data.id)}>✅ Valider & envoyer email</button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedDemande && (
        <ModalDemande
          demande={selectedDemande} experts={experts}
          commentaireAdmin={commentaireAdmin} setCommentaireAdmin={setCommentaireAdmin}
          onChangerStatut={changerStatutDemande} onNotifierExperts={notifierExperts}
          onAssignerExpert={assignerExpert} onAccepterFormation={accepterFormationDemande}
          onRefuserFormation={refuserFormationDemande}
          onClose={() => { setSelectedDemande(null); setCommentaireAdmin(""); }}
          getDemandeDomaine={getDemandeDomaine} setSelectedExpertProfile={setSelectedExpertProfile}
        />
      )}

      {selectedFormationValidation && (
        <ModalFormationValidation
          formation={selectedFormationValidation}
          onPublier={publierFormationExpert}
          onRefuser={refuserFormationExpert}
          onClose={() => setSelectedFormationValidation(null)}
        />
      )}

      {selectedPodcastValidation && (
        <ModalPodcastValidation
          podcast={selectedPodcastValidation}
          onPublier={publierPodcastExpert}
          onRefuser={refuserPodcastExpert}
          onClose={() => setSelectedPodcastValidation(null)}
        />
      )}

      {showFormationForm && (
        <FormationFormModal
          formation={editingFormation}
          onClose={() => { setShowFormationForm(false); setEditingFormation(null); }}
          onSave={() => loadFormations()}
        />
      )}

      {showPodcastForm && (
        <PodcastFormModal
          podcast={editingPodcast}
          onClose={() => { setShowPodcastForm(false); setEditingPodcast(null); }}
          onSave={() => loadPodcasts()}
        />
      )}

      {showArticleModal && (
        <div className="modal-bg" onClick={() => { setShowArticleModal(false); resetArticleForm(); }}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={(e: any) => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "20px 24px", borderRadius: "20px 20px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>{editingArticle ? "✏️ Modifier l'article" : "📝 Nouvel article"}</div>
              <button className="btn btn-gray" style={{ padding: "5px 10px", color: "#fff", background: "rgba(255,255,255,.12)" }} onClick={() => { setShowArticleModal(false); resetArticleForm(); }}>✕</button>
            </div>
            <form onSubmit={sauvegarderArticle} style={{ padding: "24px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1/-1" }} className="fg"><label className="lbl">Titre *</label><input className="inp" required value={articleForm.titre} onChange={e => setArticleForm({ ...articleForm, titre: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Type</label><select className="inp" value={articleForm.type} onChange={e => setArticleForm({ ...articleForm, type: e.target.value })}><option value="article">Article</option><option value="conseil">Conseil</option></select></div>
                <div className="fg"><label className="lbl">Catégorie</label>
                  <select className="inp" value={categorieAutre ? "Autre" : (articleForm.categorie || "")} onChange={(e) => { const val = e.target.value; if (val === "Autre") { setCategorieAutre(true); setArticleForm({ ...articleForm, categorie: "" }); } else { setCategorieAutre(false); setArticleForm({ ...articleForm, categorie: val }); setCategoriePersonnalise(""); } }}>
                    <option value="">Sélectionner une catégorie</option>
                    {categoriesPredefinies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {categorieAutre && <input type="text" className="inp" style={{ marginTop: 8 }} placeholder="Catégorie personnalisée" value={categoriePersonnalise} onChange={e => setCategoriePersonnalise(e.target.value)} />}
                </div>
                <div className="fg"><label className="lbl">Durée de lecture</label><input className="inp" value={articleForm.duree_lecture} onChange={e => setArticleForm({ ...articleForm, duree_lecture: e.target.value })} placeholder="5 min" /></div>
                <div className="fg"><label className="lbl">Statut</label><select className="inp" value={articleForm.statut} onChange={e => setArticleForm({ ...articleForm, statut: e.target.value })}><option value="brouillon">📝 Brouillon</option><option value="publie">✅ Publié</option><option value="archive">📦 Archivé</option></select></div>
                <div style={{ gridColumn: "1/-1" }} className="fg"><label className="lbl">Description / Résumé *</label><textarea className="inp" required rows={3} value={articleForm.description} onChange={e => setArticleForm({ ...articleForm, description: e.target.value })} /></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 4 }}>
                <div><label className="lbl" style={{ marginBottom: 8 }}>Image de couverture</label><label className="upload-zone" style={{ minHeight: 110 }}><input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setArticleImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); } }} style={{ display: "none" }} />{imagePreview ? <img src={imagePreview} style={{ maxWidth: "100%", maxHeight: 90, borderRadius: 8, objectFit: "cover" }} /> : <><div style={{ fontSize: 28 }}>🖼️</div><div style={{ fontSize: 12.5, color: "#64748B", marginTop: 6 }}>Cliquer pour uploader</div></>}</label></div>
                <div><label className="lbl" style={{ marginBottom: 8 }}>Contenu (PDF)</label><label className="upload-zone" style={{ minHeight: 110 }}><input type="file" accept="application/pdf" onChange={e => { if (e.target.files?.[0]) { setArticlePdfFile(e.target.files[0]); setPdfName(e.target.files[0].name); } }} style={{ display: "none" }} />{pdfName ? <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}><div style={{ fontSize: 32 }}>📄</div><div className="pdf-chip">{pdfName.length > 28 ? pdfName.slice(0, 26) + "…" : pdfName}</div></div> : <><div style={{ fontSize: 28 }}>📄</div><div style={{ fontSize: 12.5, color: "#64748B", marginTop: 6 }}>Uploader un PDF</div></>}</label></div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-gray" onClick={() => { setShowArticleModal(false); resetArticleForm(); }}>Annuler</button>
                <button type="submit" className="btn btn-green">{editingArticle ? "💾 Enregistrer" : "✅ Créer l'article"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {replyModal.open && (
        <div className="modal-bg" onClick={() => setReplyModal({ ...replyModal, open: false })}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={(e: any) => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFE", borderRadius: "20px 20px 0 0" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>✉️ Répondre à {replyModal.prenom} {replyModal.nom}</span>
              <button className="btn btn-gray" style={{ padding: "5px 10px" }} onClick={() => setReplyModal({ ...replyModal, open: false })}>✕</button>
            </div>
            <form onSubmit={envoyerReponse} style={{ padding: "22px 24px" }}>
              <div className="fg"><label className="lbl">Email</label><input className="inp" value={replyModal.email} disabled style={{ background: "#F8FAFC", color: "#64748B" }} /></div>
              <div className="fg"><label className="lbl">Votre réponse *</label><textarea className="inp" rows={6} placeholder="Votre réponse..." value={replyText} onChange={e => setReplyText(e.target.value)} required /></div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-gray" onClick={() => setReplyModal({ ...replyModal, open: false })}>Annuler</button>
                <button type="submit" className="btn btn-green" disabled={sendingReply}>{sendingReply ? "⏳ Envoi..." : "📤 Envoyer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LAYOUT PRINCIPAL */}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={{ width: sideCollapsed ? 64 : 230, background: "#0A2540", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0, transition: "width .22s cubic-bezier(.22,1,.36,1)", overflow: "hidden" }}>
          <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#F7B500", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#0A2540", fontSize: 11, flexShrink: 0 }}>BEH</div>
            {!sideCollapsed && <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 13.5 }}>Espace Admin</div><div style={{ color: "rgba(255,255,255,.35)", fontSize: 10.5 }}>Business Expert Hub</div></div>}
          </div>
          <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
            {navItems.map(item => {
              const isActive = tab === item.id;
              return (
                <button key={item.id} onClick={() => setTab(item.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#F7B500" : "rgba(255,255,255,.55)", background: isActive ? "rgba(247,181,0,.12)" : "transparent", transition: "all .16s", marginBottom: 2, justifyContent: sideCollapsed ? "center" : "flex-start", position: "relative" }}>
                  <span style={{ fontSize: 17, flexShrink: 0 }}>{item.icon}</span>
                  {!sideCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                  {item.count != null && item.count > 0 && (
                    <span style={{ background: "#F7B500", color: "#0A2540", borderRadius: 99, padding: sideCollapsed ? "1px 4px" : "1px 7px", fontSize: 10, fontWeight: 800, position: sideCollapsed ? "absolute" : "static", top: sideCollapsed ? 6 : undefined, right: sideCollapsed ? 6 : undefined, lineHeight: 1.6 }}>{item.count}</span>
                  )}
                </button>
              );
            })}
          </nav>
          <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
            <button onClick={() => setSideCollapsed(!sideCollapsed)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: sideCollapsed ? "center" : "flex-start", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.4)", background: "transparent", marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{sideCollapsed ? "→" : "←"}</span>{!sideCollapsed && <span>Réduire</span>}
            </button>
            <button onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("user"); router.push("/"); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: sideCollapsed ? "center" : "flex-start", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, color: "rgba(255,255,255,.4)", background: "transparent" }}>
              <span style={{ fontSize: 16 }}>🚪</span>{!sideCollapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </aside>

        <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          <div style={{ background: "#fff", borderBottom: "1px solid #EEF2F7", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>{navItems.find(n => n.id === tab)?.icon} {navItems.find(n => n.id === tab)?.label}</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {totalNotifs > 0 && <div style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid #FDE68A", borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>🔔 {totalNotifs} notification{totalNotifs > 1 ? "s" : ""}</div>}
              <button className="btn btn-gray" style={{ fontSize: 12 }} onClick={() => { loadAll(); loadDemandes(); loadArticles(); loadFormations(); loadPodcasts(); loadContactMessages(); loadMedias(); }}>🔄 Actualiser</button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 80, textAlign: "center", color: "#8A9AB5", fontSize: 15 }}>⏳ Chargement...</div>
          ) : (
            <>
              {tab === "dashboard" && <DashboardView experts={experts} startups={startups} temoignages={temoignages} demandes={demandes} formationsProposees={formationsEnAttenteExpert} podcastsProposees={podcastsEnAttenteExpert} setTab={setTab} />}

              {/* ===== ONGLET DEMANDES REDESIGNÉ ===== */}
              {tab === "demandes" && (
                <DemandesView
                  demandes={demandes}
                  formations={formations}
                  podcasts={podcasts}
                  experts={experts}
                  formationsEnAttenteExpert={formationsEnAttenteExpert}
                  podcastsEnAttenteExpert={podcastsEnAttenteExpert}
                  onOpenDemande={(d: any) => { setSelectedDemande(d); setCommentaireAdmin(d.commentaire_admin || ""); }}
                  onPublierFormationExpert={publierFormationExpert}
                  onRefuserFormationExpert={refuserFormationExpert}
                  onPublierPodcastExpert={publierPodcastExpert}
                  onRefuserPodcastExpert={refuserPodcastExpert}
                  onSetFormationValidation={setSelectedFormationValidation}
                  onSetPodcastValidation={setSelectedPodcastValidation}
                />
              )}

              {/* ===== ONGLET EXPERTS ===== */}
              {tab === "experts" && (
                <div style={{ padding: "24px 28px" }}>
                  {modificationsAtt.length > 0 && (
                    <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 14, padding: "18px 22px", marginBottom: 18 }}>
                      <div style={{ fontWeight: 700, color: "#B45309", fontSize: 14, marginBottom: 12 }}>⚠️ Modifications en attente ({modificationsAtt.length})</div>
                      {modificationsAtt.map((e: any) => (
                        <div key={e.id} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 800 }}>{e.user?.prenom?.[0]}{e.user?.nom?.[0]}</div>
                            <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{e.user?.prenom} {e.user?.nom}</div><div style={{ fontSize: 11, color: "#8A9AB5" }}>{e.user?.email}</div></div>
                          </div>
                          <div style={{ display: "flex", gap: 7 }}>
                            <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => validerModification(e.id)}>✅ Valider</button>
                            <button className="btn btn-red" style={{ fontSize: 12 }} onClick={() => refuserModification(e.id)}>❌ Refuser</button>
                            <button className="btn btn-blue" style={{ fontSize: 12 }} onClick={() => setSelected({ type: "expert", data: e })}>👁 Détails</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><span style={{ fontWeight: 700, fontSize: 14.5 }}>🎯 Experts ({experts.length}) · {enAttenteExperts.length} en attente</span></div>
                    <table>
                      <thead>
                        <tr><th>Expert</th><th>Email</th><th>Domaine</th><th>Localisation</th><th>Statut</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {experts.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Aucun expert</td></tr>}
                        {experts.map((e: any) => (
                          <tr key={e.id}>
                            <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 700 }}>{e.user?.prenom?.[0]}{e.user?.nom?.[0]}</div><span style={{ fontWeight: 600 }}>{e.user?.prenom} {e.user?.nom}</span></div></td>
                            <td style={{ color: "#64748B" }}>{e.user?.email}</td>
                            <td>{e.domaine || "—"}</td>
                            <td>{e.localisation || "—"}</td>
                            <td>{e.statut === "valide" ? <span className="badge" style={{ background: "#ECFDF5", color: "#059669" }}>✅ Validé</span> : e.statut === "en_attente" ? <span className="badge" style={{ background: "#FFFBEB", color: "#B45309" }}>⏳ Attente</span> : <span className="badge" style={{ background: "#FEF2F2", color: "#DC2626" }}>❌ Refusé</span>}</td>
                            <td><div style={{ display: "flex", gap: 6 }}><button className="btn btn-blue" style={{ fontSize: 12, padding: "5px 11px" }} onClick={() => setSelected({ type: "expert", data: e })}>👁 Voir</button>{e.statut === "en_attente" && <><button className="btn btn-green" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => valider("experts", e.id)}>✅</button><button className="btn btn-red" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => refuser("experts", e.id)}>❌</button></>}</div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== ONGLET STARTUPS ===== */}
              {tab === "startups" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><span style={{ fontWeight: 700, fontSize: 14.5 }}>🚀 Startups ({startups.length}) · {enAttenteStartups.length} en attente</span></div>
                    <table>
                      <thead>
                        <tr><th>Responsable</th><th>Email</th><th>Startup</th><th>Secteur</th><th>Taille</th><th>Statut</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {startups.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 40 }}>Aucune startup</td></tr>}
                        {startups.map((s: any) => (
                          <tr key={s.id}>
                            <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 700 }}>{s.user?.prenom?.[0]}{s.user?.nom?.[0]}</div><span style={{ fontWeight: 600 }}>{s.user?.prenom} {s.user?.nom}</span></div></td>
                            <td>{s.user?.email}</td>
                            <td style={{ fontWeight: 600 }}>{s.nom_startup || "—"}</td>
                            <td>{s.secteur || "—"}</td>
                            <td>{s.taille || "—"}</td>
                            <td>{s.statut === "valide" ? <span className="badge" style={{ background: "#ECFDF5", color: "#059669" }}>✅ Validé</span> : s.statut === "en_attente" ? <span className="badge" style={{ background: "#FFFBEB", color: "#B45309" }}>⏳ Attente</span> : <span className="badge" style={{ background: "#FEF2F2", color: "#DC2626" }}>❌ Refusé</span>}</td>
                            <td><div style={{ display: "flex", gap: 6 }}><button className="btn btn-blue" style={{ fontSize: 12, padding: "5px 11px" }} onClick={() => setSelected({ type: "startup", data: s })}>👁 Voir</button>{s.statut === "en_attente" && <><button className="btn btn-green" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => valider("startups", s.id)}>✅</button><button className="btn btn-red" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => refuser("startups", s.id)}>❌</button></>}</div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ===== ONGLET TÉMOIGNAGES ===== */}
              {tab === "temoignages" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div><h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>⭐ Témoignages ({temoignages.length})</h2><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{temosAttente.length} en attente · {temoignages.filter((t: any) => t.statut === "valide").length} publiés</div></div>
                  </div>
                  {temoignages.length === 0 ? (
                    <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "#94A3B8" }}>⭐ Aucun témoignage</div>
                  ) : temoignages.map((t: any) => (
                    <div key={t.id} className="card" style={{ borderLeft: `4px solid ${t.statut === "en_attente" ? "#F7B500" : t.statut === "valide" ? "#10B981" : "#D1D5DB"}`, padding: "18px 20px", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 700 }}>{t.user?.prenom?.[0]}{t.user?.nom?.[0]}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.user?.prenom} {t.user?.nom}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                                {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= (t.note || 5) ? "#F7B500" : "#D1D5DB", fontSize: 14 }}>★</span>)}
                                <span style={{ fontSize: 11, color: "#94A3B8" }}>· {new Date(t.createdAt).toLocaleDateString("fr-FR")}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px" }}><p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.72, fontStyle: "italic", margin: 0 }}>"{t.texte}"</p></div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end", flexShrink: 0 }}>
                          <span className="badge" style={{ background: t.statut === "en_attente" ? "#FFFBEB" : t.statut === "valide" ? "#ECFDF5" : "#FEF2F2", color: t.statut === "en_attente" ? "#B45309" : t.statut === "valide" ? "#059669" : "#DC2626" }}>
                            {t.statut === "en_attente" ? "⏳" : t.statut === "valide" ? "✅" : "❌"} {t.statut === "valide" ? "Publié" : t.statut === "refuse" ? "Refusé" : "En attente"}
                          </span>
                          <div style={{ display: "flex", gap: 6 }}>
                            {t.statut === "en_attente" && (<><button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => validerTemo(t.id)}>✅ Publier</button><button className="btn btn-red" style={{ fontSize: 12 }} onClick={() => refuserTemo(t.id)}>❌</button></>)}
                            <button className="btn btn-gray" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => supprimerTemo(t.id)}>🗑</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ===== ONGLET CONTACTS ===== */}
              {tab === "contacts" && (
                <div style={{ padding: "24px 28px" }}>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540", marginBottom: 20 }}>📩 Messages reçus ({contactMsgs.length}) · {msgsNonLus} non lus</h2>
                  {contactMsgs.length === 0 ? (
                    <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "#94A3B8" }}>📭 Aucun message</div>
                  ) : contactMsgs.map((msg: any) => (
                    <div key={msg.id} className="card" style={{ borderLeft: `4px solid ${msg.is_read ? "#E2E8F0" : "#F7B500"}`, padding: "18px 20px", marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#0A2540", color: "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{msg.prenom?.[0]?.toUpperCase() || "?"}</div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{msg.prenom} {msg.nom}</div>
                              <div style={{ fontSize: 12, color: "#8A9AB5" }}>{msg.email}</div>
                            </div>
                            {!msg.is_read && <span className="badge" style={{ background: "#FFFBEB", color: "#B45309" }}>NOUVEAU</span>}
                          </div>
                          <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 5 }}>📌 <strong>{msg.subject}</strong></div>
                            <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.7, margin: 0 }}>{msg.message}</p>
                          </div>
                          {msg.admin_reply && (
                            <div style={{ background: "#EFF6FF", borderRadius: 10, padding: "12px 14px", borderLeft: "3px solid #3B82F6" }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8", marginBottom: 5 }}>✉️ Réponse envoyée</div>
                              <p style={{ fontSize: 13, color: "#1E3A8A", lineHeight: 1.7, margin: 0 }}>{msg.admin_reply}</p>
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 7, flexDirection: "column", alignItems: "flex-end" }}>
                          {!msg.is_read && <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => marquerLu(msg.id)}>✅ Lu</button>}
                          <button className="btn btn-blue" style={{ fontSize: 12 }} onClick={() => setReplyModal({ open: true, messageId: msg.id, email: msg.email, nom: msg.nom, prenom: msg.prenom })}>✉️ Répondre</button>
                          <button className="btn btn-red" style={{ fontSize: 12 }} onClick={() => supprimerMessage(msg.id)}>🗑</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ===== ONGLET HISTOIRE ===== */}
              {tab === "histoire" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ marginBottom: 24 }}><h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>📖 Page "À propos"</h2><p style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>Contenu synchronisé avec la base de données</p></div>
                  <form onSubmit={saveHistoire}>
                    <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
                      <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><span style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>🏠 Section Héro</span></div>
                      <div style={{ padding: "16px 20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14 }}><HField label="Année de création" cle="annee_creation" hf={hf} setHF={setHF} placeholder="2019" /></div>
                        <HField label="Description héro" cle="description_hero" rows={3} hf={hf} setHF={setHF} />
                      </div>
                    </div>
                    <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
                      <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><span style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>👁 Vision</span></div>
                      <div style={{ padding: "16px 20px" }}>
                        <HField label="Description vision" cle="description_vision" rows={3} hf={hf} setHF={setHF} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                          {[1,2,3,4].map(n => <HField key={n} label={`Point ${n}`} cle={`vision_point${n}`} hf={hf} setHF={setHF} />)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "8px 0 4px" }}>
                      <button type="button" className="btn btn-gray" onClick={loadHistoire}>🔄 Annuler</button>
                      <button type="submit" className="btn btn-green" disabled={savingH} style={{ padding: "10px 28px", fontSize: 14 }}>{savingH ? "⏳ Sauvegarde..." : "💾 Sauvegarder tout"}</button>
                    </div>
                  </form>
                </div>
              )}

              {/* ===== ONGLET BLOG ===== */}
              {tab === "blog" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div><h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>📝 Blog ({articles.length})</h2><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{articles.filter((a: any) => a.statut === "publie").length} publiés · {brouillons} brouillons</div></div>
                    <button className="btn btn-green" style={{ padding: "9px 20px" }} onClick={() => { resetArticleForm(); setShowArticleModal(true); }}>📝 Nouvel article</button>
                  </div>
                  {articles.length === 0 ? (
                    <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "#94A3B8" }}>📝 Aucun article</div>
                  ) : articles.map((a: any) => (
                    <div key={a.id} className="card" style={{ borderLeft: `4px solid ${a.statut === "publie" ? "#10B981" : "#94A3B8"}`, padding: "18px 20px", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540", marginBottom: 7 }}>{a.titre}</div>
                          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                            <span className="badge" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{a.type}</span>
                            {a.categorie && <span className="badge" style={{ background: "#F1F5F9", color: "#64748B" }}>{a.categorie}</span>}
                            {a.duree_lecture && <span className="badge" style={{ background: "#F1F5F9", color: "#64748B" }}>⏱ {a.duree_lecture}</span>}
                            {a.pdf && <span className="badge" style={{ background: "#FFFBEB", color: "#B45309" }}>📄 PDF</span>}
                          </div>
                          {a.description && <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65 }}>{a.description}</p>}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end", flexShrink: 0 }}>
                          {a.statut === "publie" ? <span className="badge" style={{ background: "#ECFDF5", color: "#059669" }}>✅ Publié</span> : a.statut === "brouillon" ? <span className="badge" style={{ background: "#FFFBEB", color: "#B45309" }}>📝 Brouillon</span> : <span className="badge" style={{ background: "#F1F5F9", color: "#64748B" }}>📦 Archivé</span>}
                          <div style={{ display: "flex", gap: 6 }}>
                            {a.statut === "brouillon" && <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => publierArticle(a.id)}>✅ Publier</button>}
                            <button className="btn btn-blue" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => ouvrirEditionArticle(a)}>✏️</button>
                            <button className="btn btn-red" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => supprimerArticle(a.id)}>🗑</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ===== ONGLET FORMATIONS ===== */}
              {tab === "formations" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>📚 Gestion des Formations</h2>
                      <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>
                        {toutes_formations_onglet.filter(f => f.statut === "publie").length} publiées · {toutes_formations_onglet.filter(f => f.statut === "brouillon").length} brouillons · {toutes_formations_onglet.filter(f => f.statut === "archive").length} archivées
                        {formationsEnAttenteExpert.length > 0 && <span style={{ marginLeft: 8, background: "#FFFBEB", color: "#B45309", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>⏳ {formationsEnAttenteExpert.length} en attente (onglet Demandes)</span>}
                      </div>
                    </div>
                    <button className="btn btn-gold" style={{ padding: "10px 22px", fontSize: 14 }} onClick={() => { setEditingFormation(null); setShowFormationForm(true); }}>➕ Ajouter une formation</button>
                  </div>
                  {toutes_formations_onglet.length === 0 ? (
                    <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 16, padding: "60px 0", textAlign: "center", color: "#94A3B8" }}>
                      <div style={{ fontSize: 44, marginBottom: 12 }}>📚</div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Aucune formation</div>
                      <div style={{ fontSize: 13, marginBottom: 20 }}>Créez votre première formation ou validez les propositions des experts dans l'onglet Demandes.</div>
                      <button className="btn btn-gold" onClick={() => { setEditingFormation(null); setShowFormationForm(true); }}>➕ Créer une formation</button>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
                      {toutes_formations_onglet.map((f: any) => (
                        <div key={f.id} style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 14, padding: "18px 20px", position: "relative" }}>
                          {f.expert_id && <div style={{ position: "absolute", top: 12, right: 12 }}><span className="formation-source-badge">🎓 Expert</span></div>}
                          <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
                            {f.image ? <img src={`${BASE}/uploads/formations/${f.image}`} style={{ width: 68, height: 68, borderRadius: 11, objectFit: "cover", flexShrink: 0 }} alt="" /> : <div style={{ width: 68, height: 68, borderRadius: 11, background: "linear-gradient(135deg,#0A2540,#1a3f6f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>📚</div>}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 800, fontSize: 14.5, color: "#0A2540", marginBottom: 4, paddingRight: f.expert_id ? 80 : 0 }}>{f.titre}</div>
                              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>{f.domaine || "—"} · {f.formateur || "—"}{f.expert && <span style={{ color: "#7C3AED" }}> · {f.expert?.user?.prenom} {f.expert?.user?.nom}</span>}</div>
                              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                <span className="badge" style={{ background: f.statut === "publie" ? "#ECFDF5" : f.statut === "brouillon" ? "#FFFBEB" : f.statut === "refuse" ? "#FEF2F2" : "#F1F5F9", color: f.statut === "publie" ? "#059669" : f.statut === "brouillon" ? "#B45309" : f.statut === "refuse" ? "#DC2626" : "#64748B" }}>{f.statut === "publie" ? "✅ Publiée" : f.statut === "brouillon" ? "📝 Brouillon" : f.statut === "refuse" ? "❌ Refusée" : "📦 Archivée"}</span>
                                {f.certifiante && <span className="badge" style={{ background: "#F3E8FF", color: "#7C3AED" }}>🎓 Certifiante</span>}
                                {f.gratuit ? <span className="badge" style={{ background: "#ECFDF5", color: "#059669" }}>🎁 Gratuit</span> : f.prix ? <span className="badge" style={{ background: "#FFFBEB", color: "#B45309" }}>💰 {f.prix} DT</span> : null}
                              </div>
                            </div>
                          </div>
                          {f.description && <p style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.6, marginBottom: 12, maxHeight: 48, overflow: "hidden" }}>{f.description}</p>}
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", borderTop: "1px solid #F1F5F9", paddingTop: 12 }}>
                            {f.statut !== "publie" && f.statut !== "refuse" && <button className="btn btn-green" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => publierFormation(f.id)}>✅ Publier</button>}
                            {f.statut === "publie" && <button className="btn btn-gray" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => archiverFormation(f.id)}>📦 Archiver</button>}
                            {!f.expert_id && <button className="btn btn-blue" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => { setEditingFormation(f); setShowFormationForm(true); }}>✏️ Modifier</button>}
                            <button className="btn btn-red" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => supprimerFormation(f.id)}>🗑 Supprimer</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ===== ONGLET PODCASTS ===== */}
              {tab === "podcasts" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>🎙️ Gestion des Podcasts</h2>
                      <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>
                        {tous_podcasts_onglet.filter(p => p.statut === "publie").length} publiés · {tous_podcasts_onglet.filter(p => p.statut === "brouillon").length} brouillons · {tous_podcasts_onglet.filter(p => p.statut === "archive").length} archivés
                        {podcastsEnAttenteExpert.length > 0 && <span style={{ marginLeft: 8, background: "#FFFBEB", color: "#B45309", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>⏳ {podcastsEnAttenteExpert.length} en attente (onglet Demandes)</span>}
                      </div>
                    </div>
                    <button className="btn" style={{ background: "#7C3AED", color: "#fff", padding: "10px 22px", fontSize: 14, fontWeight: 700, borderRadius: 10 }} onClick={() => { setEditingPodcast(null); setShowPodcastForm(true); }}>➕ Ajouter un podcast</button>
                  </div>
                  {tous_podcasts_onglet.length === 0 ? (
                    <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 16, padding: "60px 0", textAlign: "center", color: "#94A3B8" }}>
                      <div style={{ fontSize: 44, marginBottom: 12 }}>🎙️</div>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Aucun podcast</div>
                      <div style={{ fontSize: 13, marginBottom: 20 }}>Créez votre premier podcast ou validez les propositions des experts dans l'onglet Demandes.</div>
                      <button className="btn" style={{ background: "#7C3AED", color: "#fff", padding: "10px 22px", fontSize: 14, fontWeight: 700, borderRadius: 10 }} onClick={() => { setEditingPodcast(null); setShowPodcastForm(true); }}>➕ Créer un podcast</button>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
                      {tous_podcasts_onglet.map((p: any) => (
                        <div key={p.id} style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 14, padding: "18px 20px", position: "relative" }}>
                          {(p.expert_id || p.expert) && <div style={{ position: "absolute", top: 12, right: 12 }}><span className="podcast-source-badge">🎙️ Expert</span></div>}
                          <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 11, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {p.image ? <img src={`${BASE}/uploads/podcasts-images/${p.image}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontSize: 26, color: "#C4B5FD" }}>🎙️</span>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 800, fontSize: 14.5, color: "#0A2540", marginBottom: 4, paddingRight: (p.expert_id || p.expert) ? 80 : 0 }}>{p.titre}</div>
                              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>{p.auteur || "—"} · {p.domaine || "—"}{p.expert && <span style={{ color: "#7C3AED" }}> · {p.expert?.user?.prenom} {p.expert?.user?.nom}</span>}</div>
                              <div style={{ display: "flex", gap: 5 }}>
                                <span className="badge" style={{ background: p.statut === "publie" ? "#ECFDF5" : p.statut === "brouillon" ? "#FFFBEB" : p.statut === "refuse" ? "#FEF2F2" : "#F1F5F9", color: p.statut === "publie" ? "#059669" : p.statut === "brouillon" ? "#B45309" : p.statut === "refuse" ? "#DC2626" : "#64748B" }}>{p.statut === "publie" ? "✅ Publié" : p.statut === "brouillon" ? "📝 Brouillon" : p.statut === "refuse" ? "❌ Refusé" : "📦 Archivé"}</span>
                              </div>
                            </div>
                          </div>
                          {p.description && <p style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.6, marginBottom: 12, maxHeight: 48, overflow: "hidden" }}>{p.description}</p>}
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", borderTop: "1px solid #F1F5F9", paddingTop: 12 }}>
                            {p.statut !== "publie" && p.statut !== "refuse" && <button className="btn btn-green" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => publierPodcast(p.id)}>✅ Publier</button>}
                            {p.statut === "publie" && <button className="btn btn-gray" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => archiverPodcast(p.id)}>📦 Archiver</button>}
                            {!(p.expert_id || p.expert) && <button className="btn btn-blue" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => { setEditingPodcast(p); setShowPodcastForm(true); }}>✏️ Modifier</button>}
                            <button className="btn btn-red" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => supprimerPodcast(p.id)}>🗑 Supprimer</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ===== ONGLET MÉDIAS ===== */}
              {tab === "medias" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>🎬 Médias & Vidéos ({medias.length})</h2>
                    <button className="btn btn-green" onClick={() => alert("Modale ajout média à implémenter")}>➕ Ajouter</button>
                  </div>
                  {medias.length === 0 ? (
                    <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div><div style={{ fontWeight: 600 }}>Aucun média</div></div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                      {medias.map((m: any) => (
                        <div key={m.id} className="card" style={{ overflow: "hidden", padding: 0 }}>
                          <div style={{ height: 140, background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 32 }}>{m.type === "video" ? <FaPlay /> : <FaMicrophone />}</div>
                          <div style={{ padding: "14px 16px" }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{m.titre}</div>
                            <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{m.description?.slice(0, 80)}</div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                              <span className="badge" style={{ background: m.statut === "publie" ? "#ECFDF5" : "#FFFBEB", color: m.statut === "publie" ? "#059669" : "#B45309" }}>{m.statut === "publie" ? "✅ Publié" : "📝 Brouillon"}</span>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className="btn btn-outline" style={{ padding: "4px 8px", fontSize: 11 }}>✏️</button>
                                <button className="btn btn-red" style={{ padding: "4px 8px", fontSize: 11 }}>🗑</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}