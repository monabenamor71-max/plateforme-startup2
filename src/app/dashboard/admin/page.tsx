"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaGraduationCap, FaMicrophone, FaSearch, FaFilter, FaTimes,
  FaCheckCircle, FaLock, FaPlay, FaCalendarAlt, FaUsers, FaClock,
  FaMapMarkerAlt, FaCertificate, FaArrowRight, FaEdit, FaTrash,
  FaEye, FaPlus, FaChartLine, FaBullhorn, FaEnvelope, FaStar,
  FaComments, FaBuilding, FaLaptop, FaGlobe, FaChevronDown, FaCheck,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

type Tab =
  | "dashboard" | "experts" | "startups" | "temoignages" | "contacts"
  | "histoire" | "blog" | "formations" | "demandes" | "medias" | "podcasts";

// ─── SOUS-ONGLETS DEMANDES ────────────────────────────────────────────────────
// "services"   → demandes de service classiques (consulting, audit, etc.)
// "formations" → demandes de publication d'une formation soumise par un expert
// "podcasts"   → demandes de publication d'un podcast soumis par un expert
type DemandeTypeFilter = "tous" | "services" | "formations_pub" | "podcasts_pub";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
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

function DashboardView({ experts, startups, temoignages, demandes, formations, podcasts, formationsDemandes, podcastsDemandes, setTab }: any) {
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
  const totalDemandes = demandes.length + formationsDemandes.length + podcastsDemandes.length;
  const totalFormations = formations.length;
  const totalPodcasts = podcasts.length;
  const pubAttente = formationsDemandes.filter((f: any) => f.statut === "en_attente").length + podcastsDemandes.filter((p: any) => p.statut === "en_attente").length;

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0A2540", marginBottom: 16 }}>Vue d'ensemble</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          <Kpi icon="⏳" label="En attente validation" value={enAttente} color="#F7B500" sub="Experts + Startups" onClick={() => setTab("experts")} />
          <Kpi icon="📋" label="Demandes de service" value={demandes.length} color="#8B5CF6" sub={`${demandes.filter((d: any) => d.statut === "en_attente").length} en attente`} onClick={() => setTab("demandes")} />
          <Kpi icon="📚" label="Publications à valider" value={pubAttente} color="#3B82F6" sub={`Formations & Podcasts`} onClick={() => setTab("demandes")} />
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

// ─── MODALE DEMANDE DE SERVICE ────────────────────────────────────────────────
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

// ─── MODALE FORMATION ADMIN ────────────────────────────────────────────────────
function ModalFormationAdmin({ formation, onPublier, onRefuser, onClose }: {
  formation: any;
  onPublier: (id: number) => void;
  onRefuser: (id: number) => void;
  onClose: () => void;
}) {
  const BASE_LOCAL = "http://localhost:3001";
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#1a1a2e,#7C3AED)", padding: "22px 26px", borderRadius: "20px 20px 0 0", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📚</div>
              <div>
                <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Demande de publication</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>Formation proposée</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.18)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "22px 26px", maxHeight: "80vh", overflowY: "auto" }}>
          {/* Image */}
          {formation.image && (
            <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 18, height: 180, position: "relative" }}>
              <img src={`${BASE_LOCAL}/uploads/formations/${formation.image}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.6), transparent)" }} />
              <div style={{ position: "absolute", bottom: 14, left: 16, color: "#fff", fontWeight: 800, fontSize: 18 }}>{formation.titre}</div>
            </div>
          )}

          {/* Expert proposant */}
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

          {/* Détails formation */}
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

          {/* Statut actuel */}
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, color: "#92400E", fontSize: 13 }}>En attente de validation</div>
              <div style={{ fontSize: 12, color: "#B45309" }}>Soumis le {new Date(formation.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="btn btn-green"
              style={{ flex: 1, justifyContent: "center", padding: "13px", fontSize: 15, fontWeight: 800 }}
              onClick={() => onPublier(formation.id)}
            >
              ✅ Publier cette formation
            </button>
            <button
              className="btn btn-red"
              style={{ flex: 1, justifyContent: "center", padding: "13px", fontSize: 15, fontWeight: 800 }}
              onClick={() => onRefuser(formation.id)}
            >
              ❌ Refuser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODALE PODCAST ADMIN ──────────────────────────────────────────────────────
function ModalPodcastAdmin({ podcast, onPublier, onRefuser, onClose }: {
  podcast: any;
  onPublier: (id: number) => void;
  onRefuser: (id: number) => void;
  onClose: () => void;
}) {
  const BASE_LOCAL = "http://localhost:3001";
  const audioRef = React.useRef<HTMLAudioElement>(null);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", padding: "22px 26px", borderRadius: "20px 20px 0 0", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎙️</div>
              <div>
                <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Demande de publication</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>Podcast proposé</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.18)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "22px 26px", maxHeight: "80vh", overflowY: "auto" }}>
          {/* Couverture + titre */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
            <div style={{ width: 90, height: 90, borderRadius: 16, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {podcast.image
                ? <img src={`${BASE_LOCAL}/uploads/podcasts-images/${podcast.image}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                : <span style={{ fontSize: 32, color: "#C4B5FD" }}>🎙️</span>
              }
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#0A2540" }}>{podcast.titre}</div>
              {podcast.auteur && <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>🎙️ {podcast.auteur}</div>}
              {podcast.domaine && <span className="badge" style={{ background: "#F3E8FF", color: "#7C3AED", marginTop: 6, display: "inline-block" }}>{podcast.domaine}</span>}
            </div>
          </div>

          {/* Expert proposant */}
          {podcast.expert && (
            <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", borderRadius: 14, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(247,181,0,.2)", border: "2px solid #F7B500", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                {podcast.expert?.user?.prenom?.[0]}{podcast.expert?.user?.nom?.[0]}
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,.5)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>Proposé par</div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{podcast.expert?.user?.prenom} {podcast.expert?.user?.nom}</div>
                <div style={{ color: "rgba(255,255,255,.5)", fontSize: 12 }}>{podcast.expert?.domaine}</div>
              </div>
            </div>
          )}

          {/* Description */}
          {podcast.description && (
            <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", marginBottom: 18, border: "1px solid #E8EEF6" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Description</div>
              <div style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.75 }}>{podcast.description}</div>
            </div>
          )}

          {/* Lecteur audio */}
          {podcast.url_audio && (
            <div style={{ background: "#F3E8FF", borderRadius: 12, padding: "14px 16px", marginBottom: 18, border: "1px solid #DDD6FE" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>🎧 Écouter l'épisode</div>
              <audio ref={audioRef} src={`${BASE_LOCAL}/uploads/podcasts-audio/${podcast.url_audio}`} preload="metadata" controls style={{ width: "100%" }} />
            </div>
          )}

          {/* Statut */}
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 16px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, color: "#92400E", fontSize: 13 }}>En attente de validation</div>
              <div style={{ fontSize: 12, color: "#B45309" }}>Soumis le {new Date(podcast.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-green" style={{ flex: 1, justifyContent: "center", padding: "13px", fontSize: 15, fontWeight: 800 }} onClick={() => onPublier(podcast.id)}>✅ Publier ce podcast</button>
            <button className="btn btn-red" style={{ flex: 1, justifyContent: "center", padding: "13px", fontSize: 15, fontWeight: 800 }} onClick={() => onRefuser(podcast.id)}>❌ Refuser</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// On doit importer React pour useRef dans la modale
import React from "react";

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
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

  // Filtres onglet demandes
  const [demandeTypeFilter, setDemandeTypeFilter] = useState<DemandeTypeFilter>("tous");
  const [demandeStatutFilt, setDemandeStatutFilt] = useState("tous");
  const [demandeServiceFilt, setDemandeServiceFilt] = useState("tous");

  // Modale formation/podcast proposés
  const [selectedFormationPub, setSelectedFormationPub] = useState<any>(null);
  const [selectedPodcastPub, setSelectedPodcastPub] = useState<any>(null);

  // Modal article
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

  // Modal formation admin
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [editingFormation, setEditingFormation] = useState<any>(null);
  const [formationForm, setFormationForm] = useState({
    titre: "", description: "", domaine: "", formateur: "", type: "payant", prix: "",
    places_limitees: false, places_disponibles: "", duree: "", mode: "en_ligne",
    localisation: "", certifiante: false, statut: "brouillon", a_la_une: false,
    dateDebut: "", dateFin: "", niveau: "", lien_formation: "", gratuit: false
  });
  const [formationImageFile, setFormationImageFile] = useState<File | null>(null);
  const [formationImagePreview, setFormationImagePreview] = useState("");

  const [hForm, setHForm] = useState<any>({});
  const [savingH, setSavingH] = useState(false);
  const [replyModal, setReplyModal] = useState<any>({ open: false, messageId: 0, email: "", nom: "", prenom: "" });
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const hf = (k: string) => hForm[k] || "";
  const setHF = (k: string, v: string) => setHForm((p: any) => ({ ...p, [k]: v }));
  const token = () => (typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "");
  const hdr = () => ({ Authorization: `Bearer ${token()}` });
  const hdrJ = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });
  function notify(text: string, ok = true) { setToast({ text, ok }); setTimeout(() => setToast({ text: "", ok: true }), 3200); }

  // ─── AUTH ──────────────────────────────────────────────────────────────────
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

  // ─── CHARGEMENT ────────────────────────────────────────────────────────────
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

  async function loadFormations() {
    try {
      const r = await fetch(`${BASE}/formations/admin/all?_=${Date.now()}`, { headers: hdr() });
      setFormations(r.ok ? await r.json() : []);
    } catch { setFormations([]); }
  }

  async function loadPodcasts() {
    try {
      const r = await fetch(`${BASE}/admin/podcasts/all?_=${Date.now()}`, { headers: hdr() });
      setPodcasts(r.ok ? await r.json() : []);
    } catch { setPodcasts([]); }
  }

  async function loadDemandes() {
    try {
      const r = await fetch(`${BASE}/demandes-service/all?_=${Date.now()}`, { headers: hdr() });
      setDemandes(r.ok ? (await r.json()) : []);
    } catch { setDemandes([]); }
  }

  async function loadHistoire() { try { const r = await fetch(`${BASE}/histoire?_=${Date.now()}`); if (r.ok) setHForm(await r.json()); } catch {} }
  async function loadArticles() { try { const r = await fetch(`${BASE}/articles/admin/all?_=${Date.now()}`, { headers: hdr() }); if (r.ok) setArticles(await r.json()); } catch {} }
  async function loadContactMessages() { try { const r = await fetch(`${BASE}/contact/messages?_=${Date.now()}`, { headers: hdr() }); if (r.ok) setContactMsgs(await r.json()); } catch {} }
  async function loadMedias() { try { const r = await fetch(`${BASE}/admin/medias/all`, { headers: hdr() }); setMedias(r.ok ? await r.json() : []); } catch { setMedias([]); } }

  // ─── ACTIONS COMPTES ───────────────────────────────────────────────────────
  async function valider(type: string, id: number) {
    const r = await fetch(`${BASE}/admin/${type}/${id}/valider`, { method: "PATCH", headers: hdr() });
    if (r.ok) { notify("✅ Validé !"); setSelected(null); loadAll(); } else notify("Erreur", false);
  }
  async function refuser(type: string, id: number) {
    const r = await fetch(`${BASE}/admin/${type}/${id}/refuser`, { method: "PATCH", headers: hdr() });
    if (r.ok) { notify("Refusé"); setSelected(null); loadAll(); } else notify("Erreur", false);
  }
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

  // ─── ACTIONS DEMANDES ──────────────────────────────────────────────────────
  async function changerStatutDemande(id: number, statut: string) {
    const body: any = { statut };
    if (commentaireAdmin) body.commentaire_admin = commentaireAdmin;
    const r = await fetch(`${BASE}/demandes-service/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify(body) });
    if (r.ok) { notify(`✅ Statut → ${statut}`); setSelectedDemande(null); setCommentaireAdmin(""); loadDemandes(); } else notify("Erreur", false);
  }
  async function accepterFormationDemande(demandeId: number) {
    const r = await fetch(`${BASE}/demandes-service/formation/${demandeId}/accept`, { method: "PATCH", headers: hdrJ() });
    if (r.ok) { notify("✅ Acceptée"); setSelectedDemande(null); setCommentaireAdmin(""); loadDemandes(); loadFormations(); } else notify("Erreur", false);
  }
  async function refuserFormationDemande(demandeId: number) {
    if (!confirm("Refuser ?")) return;
    const r = await fetch(`${BASE}/demandes-service/formation/${demandeId}/reject`, { method: "PATCH", headers: hdrJ() });
    if (r.ok) { notify("Refusée"); setSelectedDemande(null); setCommentaireAdmin(""); loadDemandes(); loadFormations(); } else notify("Erreur", false);
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
    if (r.ok) { notify("✅ Expert assigné"); setSelectedDemande(null); setCommentaireAdmin(""); loadDemandes(); } else notify("Erreur", false);
  }
  function getDemandeDomaine(demande: any): string {
    if (demande.domaine) return demande.domaine;
    const match = demande.description?.match(/\[Domaine:\s*([^\]]+)\]/i);
    return match ? match[1] : "Autre";
  }

  // ─── ACTIONS FORMATIONS PROPOSÉES ─────────────────────────────────────────
  // Publier une formation proposée par un expert → change statut "en_attente" → "publie"
  // et l'ajoute dans l'onglet formations
  async function publierFormationProposee(id: number) {
    try {
      // Essai endpoint dédié
      let r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) });
      if (!r.ok) {
        // Fallback endpoint expert
        r = await fetch(`${BASE}/podcasts/expert/statut/${id}`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) });
      }
      if (r.ok) {
        notify("✅ Formation publiée ! Elle apparaît maintenant dans l'onglet Formations.");
        setSelectedFormationPub(null);
        await loadFormations();
      } else {
        notify("Erreur lors de la publication", false);
      }
    } catch { notify("Erreur réseau", false); }
  }

  async function refuserFormationProposee(id: number) {
    if (!confirm("Refuser cette formation ?")) return;
    try {
      let r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) });
      if (!r.ok) r = await fetch(`${BASE}/formations/expert/statut/${id}`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) });
      if (r.ok) { notify("Formation refusée"); setSelectedFormationPub(null); await loadFormations(); }
      else notify("Erreur", false);
    } catch { notify("Erreur réseau", false); }
  }

  async function supprimerFormationProposee(id: number) {
    if (!confirm("Supprimer définitivement cette formation ?")) return;
    try {
      const r = await fetch(`${BASE}/formations/admin/${id}`, { method: "DELETE", headers: hdr() });
      if (r.ok) { notify("✅ Supprimée"); await loadFormations(); }
      else notify("Erreur", false);
    } catch { notify("Erreur réseau", false); }
  }

  // ─── ACTIONS PODCASTS PROPOSÉS ─────────────────────────────────────────────
  async function publierPodcastPropose(id: number) {
    try {
      let r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) });
      if (!r.ok) r = await fetch(`${BASE}/podcasts/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) });
      if (r.ok) {
        notify("✅ Podcast publié ! Il apparaît maintenant dans l'onglet Podcasts.");
        setSelectedPodcastPub(null);
        await loadPodcasts();
      } else notify("Erreur lors de la publication", false);
    } catch { notify("Erreur réseau", false); }
  }

  async function refuserPodcastPropose(id: number) {
    if (!confirm("Refuser ce podcast ?")) return;
    try {
      let r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) });
      if (!r.ok) r = await fetch(`${BASE}/podcasts/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) });
      if (r.ok) { notify("Podcast refusé"); setSelectedPodcastPub(null); await loadPodcasts(); }
      else notify("Erreur", false);
    } catch { notify("Erreur réseau", false); }
  }

  async function supprimerPodcastPropose(id: number) {
    if (!confirm("Supprimer ce podcast ?")) return;
    try {
      let r = await fetch(`${BASE}/admin/podcasts/${id}`, { method: "DELETE", headers: hdr() });
      if (!r.ok) r = await fetch(`${BASE}/podcasts/admin/${id}`, { method: "DELETE", headers: hdr() });
      if (r.ok) { notify("✅ Supprimé"); await loadPodcasts(); }
      else notify("Erreur", false);
    } catch { notify("Erreur réseau", false); }
  }

  // ─── ACTIONS FORMATIONS (onglet formations) ────────────────────────────────
  async function sauvegarderFormation(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formationForm).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, String(v)); });
    if (formationImageFile) fd.append("image", formationImageFile);
    const url = editingFormation ? `${BASE}/formations/admin/${editingFormation.id}` : `${BASE}/formations/admin/create`;
    const r = await fetch(url, { method: editingFormation ? "PUT" : "POST", headers: hdr(), body: fd });
    if (r.ok) { notify(editingFormation ? "✅ Modifié" : "✅ Créé"); setShowFormationModal(false); resetFormationForm(); loadFormations(); } else notify("Erreur", false);
  }
  async function publierFormation(id: number) { const r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (r.ok) notify("✅ Publiée"); else notify("Erreur", false); loadFormations(); }
  async function archiverFormation(id: number) { const r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "archive" }) }); if (r.ok) notify("📦 Archivée"); else notify("Erreur", false); loadFormations(); }
  async function supprimerFormation(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/formations/admin/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("✅ Supprimée"); loadFormations(); } else notify("Erreur", false); }
  function resetFormationForm() { setEditingFormation(null); setFormationImageFile(null); setFormationImagePreview(""); setFormationForm({ titre: "", description: "", domaine: "", formateur: "", type: "payant", prix: "", places_limitees: false, places_disponibles: "", duree: "", mode: "en_ligne", localisation: "", certifiante: false, statut: "brouillon", a_la_une: false, dateDebut: "", dateFin: "", niveau: "", lien_formation: "", gratuit: false }); }

  // ─── ACTIONS ARTICLES ──────────────────────────────────────────────────────
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

  // ─── DONNÉES DÉRIVÉES ──────────────────────────────────────────────────────
  const enAttenteExperts  = experts.filter(e => e.statut === "en_attente");
  const enAttenteStartups = startups.filter(s => s.statut === "en_attente");
  const modificationsAtt  = experts.filter(e => e.modification_demandee);
  const temosAttente      = temoignages.filter(t => t.statut === "en_attente");
  const msgsNonLus        = contactMsgs.filter(m => !m.is_read).length;
  const brouillons        = articles.filter(a => a.statut === "brouillon").length;

  // Formations et podcasts proposés par les experts (statut en_attente = pas encore publiés)
  // On distingue ceux "proposés" (créés par un expert) vs ceux créés par l'admin directement
  const formationsProposees = formations.filter(f => f.statut === "en_attente" && f.expert_id);
  const podcastsProposees   = podcasts.filter(p => p.statut === "en_attente" && (p.expert_id || p.expert));
  // Formations/podcasts créés par l'admin (brouillon/publie/archive sans expert_id)
  const formationsAdmin     = formations.filter(f => !f.expert_id || f.statut !== "en_attente");
  const podcastsAdmin       = podcasts.filter(p => !(p.expert_id || p.expert) || p.statut !== "en_attente");

  const pubAttente = formationsProposees.length + podcastsProposees.length;
  const demandesServicesEnAttente = demandes.filter(d => d.statut === "en_attente").length;
  const totalNotifs = enAttenteExperts.length + enAttenteStartups.length + modificationsAtt.length + temosAttente.length + brouillons + pubAttente + msgsNonLus + demandesServicesEnAttente;

  // Filtrage onglet demandes
  const demandesServices = demandes; // demandes de service classiques
  const allDemandesForFilter = [
    ...demandesServices.map(d => ({ ...d, _type: "service" })),
    ...formationsProposees.map(f => ({ ...f, _type: "formation_pub", service: "Publication Formation", statut: f.statut, user: f.expert?.user, description: f.description, createdAt: f.createdAt })),
    ...podcastsProposees.map(p => ({ ...p, _type: "podcast_pub", service: "Publication Podcast", statut: p.statut, user: p.expert?.user, description: p.description, createdAt: p.createdAt })),
  ];

  const filteredDemandes = allDemandesForFilter.filter(d => {
    const typeOk = demandeTypeFilter === "tous"
      || (demandeTypeFilter === "services" && d._type === "service")
      || (demandeTypeFilter === "formations_pub" && d._type === "formation_pub")
      || (demandeTypeFilter === "podcasts_pub" && d._type === "podcast_pub");
    const statutOk = demandeStatutFilt === "tous" || d.statut === demandeStatutFilt;
    const serviceOk = demandeServiceFilt === "tous" || d.service === demandeServiceFilt || d._type === demandeServiceFilt;
    return typeOk && statutOk && serviceOk;
  });

  const navItems: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "dashboard",   label: "Tableau de bord", icon: "📊" },
    { id: "demandes",    label: "Demandes",        icon: "📋", count: demandesServicesEnAttente + pubAttente },
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
        .lbl{font-size:10.5px;font-weight:700;color:#8A9AB5;text-transform:uppercase;letter-spacing:1.2px;display:block;margin-bottom:5px;}
        .fg{margin-bottom:12px;}
        .btn{font-family:'DM Sans',sans-serif;font-weight:600;border:none;border-radius:9px;cursor:pointer;padding:8px 16px;font-size:13px;transition:all .16s;display:inline-flex;align-items:center;gap:6px;line-height:1.4;}
        .btn-primary{background:#0A2540;color:#F7B500;}.btn-primary:hover{background:#F7B500;color:#0A2540;}
        .btn-green{background:#ECFDF5;color:#059669;}.btn-green:hover{background:#059669;color:#fff;}
        .btn-red{background:#FEF2F2;color:#DC2626;}.btn-red:hover{background:#DC2626;color:#fff;}
        .btn-blue{background:#EFF6FF;color:#1D4ED8;}.btn-blue:hover{background:#1D4ED8;color:#fff;}
        .btn-gray{background:#F1F5F9;color:#475569;}.btn-gray:hover{background:#E2E8F0;}
        .btn-gold{background:#FFFBEB;color:#B45309;}.btn-gold:hover{background:#F7B500;color:#0A2540;}
        .btn-outline{background:transparent;border:1.5px solid #E2E8F0;color:#475569;}.btn-outline:hover{border-color:#0A2540;color:#0A2540;}
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
        .demande-type-btn{border:none;border-radius:10px;cursor:pointer;padding:10px 16px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;transition:all .18s;display:flex;align-items:center;gap:7px;background:#F1F5F9;color:#475569;}
        .demande-type-btn.active{background:#0A2540;color:#F7B500;font-weight:700;}
        .demande-type-btn:hover:not(.active){background:#E2E8F0;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .fade-in{animation:fadeIn .3s ease;}
      `}</style>

      {toast.text && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.ok ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${toast.ok ? "#A7F3D0" : "#FECACA"}`, borderLeft: `4px solid ${toast.ok ? "#059669" : "#DC2626"}`, color: toast.ok ? "#059669" : "#DC2626", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 13, boxShadow: "0 8px 28px rgba(0,0,0,.12)" }}>
          {toast.text}
        </div>
      )}

      {/* ── MODALE EXPERT/STARTUP ── */}
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
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#0A2540" }}>{selected.data.user?.prenom} {selected.data.user?.nom}</div>
                  <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{selected.data.user?.email}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {selected.data.statut === "en_attente" && <span className="badge" style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }}>⏳ En attente</span>}
                    {selected.data.statut === "valide"     && <span className="badge" style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}>✅ Validé</span>}
                    {selected.data.statut === "refuse"     && <span className="badge" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>❌ Refusé</span>}
                    {selected.data.modification_demandee   && <span className="badge" style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }}>⚠️ Modif demandée</span>}
                  </div>
                </div>
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

      {/* ── MODALE DEMANDE SERVICE ── */}
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

      {/* ── MODALE FORMATION PROPOSÉE ── */}
      {selectedFormationPub && (
        <ModalFormationAdmin
          formation={selectedFormationPub}
          onPublier={publierFormationProposee}
          onRefuser={refuserFormationProposee}
          onClose={() => setSelectedFormationPub(null)}
        />
      )}

      {/* ── MODALE PODCAST PROPOSÉ ── */}
      {selectedPodcastPub && (
        <ModalPodcastAdmin
          podcast={selectedPodcastPub}
          onPublier={publierPodcastPropose}
          onRefuser={refuserPodcastPropose}
          onClose={() => setSelectedPodcastPub(null)}
        />
      )}

      {/* ── MODALE RÉPONSE CONTACT ── */}
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

      {/* ── MODALE FORMATION ADMIN ── */}
      {showFormationModal && (
        <div className="modal-bg" onClick={() => { setShowFormationModal(false); resetFormationForm(); }}>
          <div className="modal" style={{ maxWidth: 720 }} onClick={(e: any) => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFE", position: "sticky", top: 0, borderRadius: "20px 20px 0 0" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{editingFormation ? "✏️ Modifier" : "📚 Nouvelle formation"}</span>
              <button className="btn btn-gray" style={{ padding: "5px 10px" }} onClick={() => { setShowFormationModal(false); resetFormationForm(); }}>✕</button>
            </div>
            <form onSubmit={sauvegarderFormation} style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1/-1" }} className="fg"><label className="lbl">Titre *</label><input className="inp" required value={formationForm.titre} onChange={e => setFormationForm({ ...formationForm, titre: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Domaine</label><input className="inp" value={formationForm.domaine} onChange={e => setFormationForm({ ...formationForm, domaine: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Formateur</label><input className="inp" value={formationForm.formateur} onChange={e => setFormationForm({ ...formationForm, formateur: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Mode</label><select className="inp" value={formationForm.mode} onChange={e => setFormationForm({ ...formationForm, mode: e.target.value })}><option value="en_ligne">💻 En ligne</option><option value="presentiel">🏢 Présentiel</option></select></div>
                <div className="fg"><label className="lbl">Statut</label><select className="inp" value={formationForm.statut} onChange={e => setFormationForm({ ...formationForm, statut: e.target.value })}><option value="brouillon">📝 Brouillon</option><option value="publie">✅ Publié</option><option value="archive">📦 Archivé</option></select></div>
                <div className="fg"><label className="lbl">Durée</label><input className="inp" value={formationForm.duree} onChange={e => setFormationForm({ ...formationForm, duree: e.target.value })} placeholder="Ex: 3 jours" /></div>
                <div className="fg"><label className="lbl">Niveau</label><select className="inp" value={formationForm.niveau} onChange={e => setFormationForm({ ...formationForm, niveau: e.target.value })}><option value="">Sélectionner...</option>{["Débutant","Intermédiaire","Avancé"].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                <div className="fg"><label className="lbl">Type tarif</label><select className="inp" value={formationForm.type} onChange={e => setFormationForm({ ...formationForm, type: e.target.value })}><option value="gratuit">🎁 Gratuit</option><option value="payant">💰 Payant</option></select></div>
                {formationForm.type === "payant" && <div className="fg"><label className="lbl">Prix (DT)</label><input className="inp" value={formationForm.prix} onChange={e => setFormationForm({ ...formationForm, prix: e.target.value })} /></div>}
                <div className="fg"><label className="lbl">Options</label><div style={{ display: "flex", flexDirection: "column", gap: 8 }}><label><input type="checkbox" checked={formationForm.certifiante} onChange={e => setFormationForm({ ...formationForm, certifiante: e.target.checked })} /> Certifiante</label><label><input type="checkbox" checked={formationForm.places_limitees} onChange={e => setFormationForm({ ...formationForm, places_limitees: e.target.checked })} /> Places limitées</label></div></div>
                {formationForm.places_limitees && <div className="fg"><label className="lbl">Nb places</label><input className="inp" type="number" min="1" value={formationForm.places_disponibles} onChange={e => setFormationForm({ ...formationForm, places_disponibles: e.target.value })} /></div>}
                <div style={{ gridColumn: "1/-1" }} className="fg"><label className="lbl">Description *</label><textarea className="inp" required rows={4} value={formationForm.description} onChange={e => setFormationForm({ ...formationForm, description: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Image</label><label className="upload-zone"><input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setFormationImageFile(e.target.files[0]); setFormationImagePreview(URL.createObjectURL(e.target.files[0])); } }} style={{ display: "none" }} />{formationImagePreview ? <img src={formationImagePreview} style={{ maxWidth: "100%", maxHeight: 80, borderRadius: 7 }} /> : <><div style={{ fontSize: 22 }}>🖼️</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Uploader une image</div></>}</label></div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                <button type="button" className="btn btn-gray" onClick={() => { setShowFormationModal(false); resetFormationForm(); }}>Annuler</button>
                <button type="submit" className="btn btn-green">{editingFormation ? "💾 Modifier" : "✅ Créer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODALE ARTICLE ── */}
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

      {/* ── LAYOUT ── */}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* SIDEBAR */}
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

        {/* CONTENU */}
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
              {/* DASHBOARD */}
              {tab === "dashboard" && (
                <DashboardView experts={experts} startups={startups} temoignages={temoignages} demandes={demandes} formations={formationsAdmin} podcasts={podcastsAdmin} formationsDemandes={formationsProposees} podcastsDemandes={podcastsProposees} setTab={setTab} />
              )}

              {/* ═══════════ ONGLET DEMANDES ═══════════ */}
              {tab === "demandes" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540", marginBottom: 4 }}>📋 Toutes les demandes</h2>
                    <div style={{ fontSize: 13, color: "#8A9AB5" }}>
                      {demandesServices.length} demande{demandesServices.length > 1 ? "s" : ""} de service · {formationsProposees.length} formation{formationsProposees.length > 1 ? "s" : ""} à valider · {podcastsProposees.length} podcast{podcastsProposees.length > 1 ? "s" : ""} à valider
                    </div>
                  </div>

                  {/* ─── FILTRES TYPE ─── */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                    {[
                      { id: "tous" as DemandeTypeFilter, label: "Toutes les demandes", icon: "📋", count: allDemandesForFilter.length },
                      { id: "services" as DemandeTypeFilter, label: "Demandes de service", icon: "🛠️", count: demandesServices.length },
                      { id: "formations_pub" as DemandeTypeFilter, label: "Formations à valider", icon: "📚", count: formationsProposees.length, highlight: formationsProposees.filter(f => f.statut === "en_attente").length > 0 },
                      { id: "podcasts_pub" as DemandeTypeFilter, label: "Podcasts à valider", icon: "🎙️", count: podcastsProposees.length, highlight: podcastsProposees.filter(p => p.statut === "en_attente").length > 0 },
                    ].map(t => (
                      <button key={t.id} className={`demande-type-btn${demandeTypeFilter === t.id ? " active" : ""}`} onClick={() => setDemandeTypeFilter(t.id)}>
                        <span>{t.icon}</span>
                        <span>{t.label}</span>
                        {t.count > 0 && (
                          <span style={{ background: demandeTypeFilter === t.id ? "rgba(247,181,0,.3)" : (t.highlight ? "#EF4444" : "#E2E8F0"), color: demandeTypeFilter === t.id ? "#F7B500" : (t.highlight ? "#fff" : "#475569"), borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 800 }}>{t.count}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* ─── FILTRES STATUT (uniquement pour services) ─── */}
                  {(demandeTypeFilter === "tous" || demandeTypeFilter === "services") && (
                    <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
                      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8A9AB5", textTransform: "uppercase", marginBottom: 8 }}>Statut</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {[{ v: "tous", l: "Tous" }, { v: "en_attente", l: "⏳ En attente" }, { v: "acceptee", l: "✅ Acceptée" }, { v: "refusee", l: "❌ Refusée" }].map(f => (
                              <button key={f.v} className={`pill-f${demandeStatutFilt === f.v ? " on" : ""}`} onClick={() => setDemandeStatutFilt(f.v)}>{f.l}</button>
                            ))}
                          </div>
                        </div>
                        {demandeTypeFilter === "services" && (
                          <div>
                            <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8A9AB5", textTransform: "uppercase", marginBottom: 8 }}>Type de service</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {[{ v: "tous", l: "Tous" }, { v: "consulting", l: "Consulting" }, { v: "audit-sur-site", l: "Audit" }, { v: "formations", l: "Formations" }, { v: "nos-plateformes", l: "Plateformes" }, { v: "personnalise", l: "Personnalisé" }].map(f => (
                                <button key={f.v} className={`pill-f${demandeServiceFilt === f.v ? " on" : ""}`} onClick={() => setDemandeServiceFilt(f.v)}>{f.l}</button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ─── LISTE ─── */}
                  {filteredDemandes.length === 0 ? (
                    <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "#94A3B8" }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>Aucune demande</div>
                    </div>
                  ) : filteredDemandes.map((d: any, idx) => {
                    // Carte pour les formations proposées
                    if (d._type === "formation_pub") {
                      return (
                        <div key={`form-${d.id}`} className="card fade-in" style={{ borderLeft: `4px solid ${d.statut === "en_attente" ? "#8B5CF6" : d.statut === "publie" ? "#10B981" : "#EF4444"}`, padding: "18px 20px", marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                                <div style={{ width: 42, height: 42, borderRadius: 11, background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📚</div>
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: 14.5, color: "#0A2540" }}>{d.titre}</div>
                                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                                    <span className="badge" style={{ background: "#F3E8FF", color: "#7C3AED", marginRight: 6 }}>Publication Formation</span>
                                    {d.expert && <span>Proposé par {d.expert?.user?.prenom} {d.expert?.user?.nom}</span>}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                                {d.domaine && <span className="badge" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>📁 {d.domaine}</span>}
                                {d.formateur && <span className="badge" style={{ background: "#F1F5F9", color: "#64748B" }}>👨‍🏫 {d.formateur}</span>}
                                {d.prix ? <span className="badge" style={{ background: "#FFFBEB", color: "#B45309" }}>💰 {d.prix} DT</span> : <span className="badge" style={{ background: "#ECFDF5", color: "#059669" }}>🎁 Gratuit</span>}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                              <span className="badge" style={{ background: d.statut === "en_attente" ? "#FFFBEB" : d.statut === "publie" ? "#ECFDF5" : "#FEF2F2", color: d.statut === "en_attente" ? "#B45309" : d.statut === "publie" ? "#059669" : "#DC2626" }}>
                                {d.statut === "en_attente" ? "⏳ À valider" : d.statut === "publie" ? "✅ Publié" : "❌ Refusé"}
                              </span>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className="btn btn-blue" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => setSelectedFormationPub(d)}>👁 Examiner</button>
                                {d.statut === "en_attente" && (
                                  <>
                                    <button className="btn btn-green" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => publierFormationProposee(d.id)}>✅ Publier</button>
                                    <button className="btn btn-red" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => refuserFormationProposee(d.id)}>❌ Refuser</button>
                                  </>
                                )}
                                <button className="btn btn-gray" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => supprimerFormationProposee(d.id)}>🗑</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Carte pour les podcasts proposés
                    if (d._type === "podcast_pub") {
                      return (
                        <div key={`pod-${d.id}`} className="card fade-in" style={{ borderLeft: `4px solid ${d.statut === "en_attente" ? "#7C3AED" : d.statut === "publie" ? "#10B981" : "#EF4444"}`, padding: "18px 20px", marginBottom: 12 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                                {d.image ? <img src={`${BASE}/uploads/podcasts-images/${d.image}`} style={{ width: 42, height: 42, borderRadius: 11, objectFit: "cover", flexShrink: 0 }} alt="" /> : <div style={{ width: 42, height: 42, borderRadius: 11, background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🎙️</div>}
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: 14.5, color: "#0A2540" }}>{d.titre}</div>
                                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                                    <span className="badge" style={{ background: "#F3E8FF", color: "#7C3AED", marginRight: 6 }}>Publication Podcast</span>
                                    {d.expert && <span>Proposé par {d.expert?.user?.prenom} {d.expert?.user?.nom}</span>}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                                {d.domaine && <span className="badge" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>📁 {d.domaine}</span>}
                                {d.auteur && <span className="badge" style={{ background: "#F1F5F9", color: "#64748B" }}>🎙️ {d.auteur}</span>}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                              <span className="badge" style={{ background: d.statut === "en_attente" ? "#FFFBEB" : d.statut === "publie" ? "#ECFDF5" : "#FEF2F2", color: d.statut === "en_attente" ? "#B45309" : d.statut === "publie" ? "#059669" : "#DC2626" }}>
                                {d.statut === "en_attente" ? "⏳ À valider" : d.statut === "publie" ? "✅ Publié" : "❌ Refusé"}
                              </span>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className="btn btn-blue" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => setSelectedPodcastPub(d)}>👁 Écouter & valider</button>
                                {d.statut === "en_attente" && (
                                  <>
                                    <button className="btn btn-green" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => publierPodcastPropose(d.id)}>✅ Publier</button>
                                    <button className="btn btn-red" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => refuserPodcastPropose(d.id)}>❌ Refuser</button>
                                  </>
                                )}
                                <button className="btn btn-gray" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => supprimerPodcastPropose(d.id)}>🗑</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Carte demande de service classique
                    return (
                      <div key={`svc-${d.id}`} className="card fade-in" style={{ borderLeft: `4px solid ${d.statut === "en_attente" ? "#F7B500" : d.statut === "acceptee" ? "#10B981" : "#EF4444"}`, padding: "18px 20px", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                              <div style={{ width: 42, height: 42, borderRadius: 11, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📋</div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14.5, color: "#0A2540" }}>{d.service}</div>
                                <div style={{ fontSize: 12, color: "#64748B" }}>
                                  {d.user?.prenom} {d.user?.nom}
                                  {d.user?.startup?.nom_startup && <span style={{ marginLeft: 6, fontWeight: 600, color: "#0A2540" }}>🏢 {d.user.startup.nom_startup}</span>}
                                  <span style={{ marginLeft: 6 }}>· {new Date(d.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
                                </div>
                                <div style={{ marginTop: 4 }}>
                                  <span className="badge" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>🎯 {getDemandeDomaine(d)}</span>
                                </div>
                              </div>
                            </div>
                            {d.description && <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{d.description}</p>}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                              {d.delai    && <span className="badge" style={{ background: "#ECFDF5", color: "#059669" }}>⏱ {d.delai}</span>}
                              {d.telephone && <span className="badge" style={{ background: "#FFFBEB", color: "#B45309" }}>📞 {d.telephone}</span>}
                              {d.expert_assigne && <span className="badge" style={{ background: "#F0FDFA", color: "#0D9488" }}>👤 {d.expert_assigne?.user?.prenom} {d.expert_assigne?.user?.nom}</span>}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                            <span className="badge" style={{ background: d.statut === "en_attente" ? "#FFFBEB" : d.statut === "acceptee" ? "#ECFDF5" : "#FEF2F2", color: d.statut === "en_attente" ? "#B45309" : d.statut === "acceptee" ? "#059669" : "#DC2626" }}>
                              {d.statut === "en_attente" ? "⏳ En attente" : d.statut === "acceptee" ? "✅ Acceptée" : "❌ Refusée"}
                            </span>
                            <button className="btn btn-blue" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => { setSelectedDemande(d); setCommentaireAdmin(d.commentaire_admin || ""); }}>⚙️ Gérer</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ═══════════ EXPERTS ═══════════ */}
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
                      <thead><tr><th>Expert</th><th>Email</th><th>Domaine</th><th>Localisation</th><th>Statut</th><th>Actions</th></tr></thead>
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

              {/* ═══════════ STARTUPS ═══════════ */}
              {tab === "startups" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><span style={{ fontWeight: 700, fontSize: 14.5 }}>🚀 Startups ({startups.length}) · {enAttenteStartups.length} en attente</span></div>
                    <table>
                      <thead><tr><th>Responsable</th><th>Email</th><th>Startup</th><th>Secteur</th><th>Taille</th><th>Statut</th><th>Actions</th></tr></thead>
                      <tbody>
                        {startups.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Aucune startup</td></tr>}
                        {startups.map((s: any) => (
                          <tr key={s.id}>
                            <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 700 }}>{s.user?.prenom?.[0]}{s.user?.nom?.[0]}</div><span style={{ fontWeight: 600 }}>{s.user?.prenom} {s.user?.nom}</span></div></td>
                            <td style={{ color: "#64748B" }}>{s.user?.email}</td>
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

              {/* ═══════════ TÉMOIGNAGES ═══════════ */}
              {tab === "temoignages" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div><h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>⭐ Témoignages ({temoignages.length})</h2><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{temosAttente.length} en attente · {temoignages.filter((t: any) => t.statut === "valide").length} publiés</div></div>
                  </div>
                  {temoignages.length === 0 ? <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div><div style={{ fontWeight: 600 }}>Aucun témoignage</div></div> : temoignages.map((t: any) => (
                    <div key={t.id} className="card" style={{ borderLeft: `4px solid ${t.statut === "en_attente" ? "#F7B500" : t.statut === "valide" ? "#10B981" : "#D1D5DB"}`, padding: "18px 20px", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}><div style={{ width: 38, height: 38, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 700 }}>{t.user?.prenom?.[0]}{t.user?.nom?.[0]}</div><div><div style={{ fontWeight: 700, fontSize: 14 }}>{t.user?.prenom} {t.user?.nom}</div><div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= (t.note || 5) ? "#F7B500" : "#D1D5DB", fontSize: 14 }}>★</span>)}<span style={{ fontSize: 11, color: "#94A3B8" }}>· {new Date(t.createdAt).toLocaleDateString("fr-FR")}</span></div></div></div>
                          <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px" }}><p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.72, fontStyle: "italic", margin: 0 }}>"{t.texte}"</p></div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end", flexShrink: 0 }}>
                          <span className="badge" style={{ background: t.statut === "en_attente" ? "#FFFBEB" : t.statut === "valide" ? "#ECFDF5" : "#FEF2F2", color: t.statut === "en_attente" ? "#B45309" : t.statut === "valide" ? "#059669" : "#DC2626" }}>{t.statut === "en_attente" ? "⏳" : t.statut === "valide" ? "✅" : "❌"} {t.statut === "valide" ? "Publié" : t.statut === "refuse" ? "Refusé" : "En attente"}</span>
                          <div style={{ display: "flex", gap: 6 }}>{t.statut === "en_attente" && <><button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => validerTemo(t.id)}>✅ Publier</button><button className="btn btn-red" style={{ fontSize: 12 }} onClick={() => refuserTemo(t.id)}>❌</button></>}<button className="btn btn-gray" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => supprimerTemo(t.id)}>🗑</button></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ═══════════ MESSAGES CONTACT ═══════════ */}
              {tab === "contacts" && (
                <div style={{ padding: "24px 28px" }}>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540", marginBottom: 20 }}>📩 Messages reçus ({contactMsgs.length}) · {msgsNonLus} non lus</h2>
                  {contactMsgs.length === 0 ? (
                    <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📭</div><div style={{ fontWeight: 600 }}>Aucun message</div></div>
                  ) : contactMsgs.map((msg: any) => (
                    <div key={msg.id} className="card" style={{ borderLeft: `4px solid ${msg.is_read ? "#E2E8F0" : "#F7B500"}`, padding: "18px 20px", marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#0A2540", color: "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{msg.prenom?.[0]?.toUpperCase() || "?"}</div>
                            <div><div style={{ fontWeight: 700, fontSize: 14.5 }}>{msg.prenom} {msg.nom}</div><div style={{ fontSize: 12, color: "#8A9AB5" }}>{msg.email}</div></div>
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

              {/* ═══════════ HISTOIRE ═══════════ */}
              {tab === "histoire" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ marginBottom: 24 }}><h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>📖 Page "À propos"</h2><p style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>Contenu synchronisé avec la base de données</p></div>
                  <form onSubmit={saveHistoire} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {[
                      { title: "🏠 Section Héro", content: (<><div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14 }}><HField label="Année de création" cle="annee_creation" hf={hf} setHF={setHF} placeholder="2019" /></div><HField label="Description héro" cle="description_hero" rows={3} hf={hf} setHF={setHF} /></>) },
                      { title: "👁 Vision", content: (<><HField label="Description vision" cle="description_vision" rows={3} hf={hf} setHF={setHF} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>{[1,2,3,4].map(n => <HField key={n} label={`Point ${n}`} cle={`vision_point${n}`} hf={hf} setHF={setHF} />)}</div></>) },
                      { title: "💬 Citation", content: (<><HField label="Texte de la citation" cle="citation" rows={2} hf={hf} setHF={setHF} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><HField label="Auteur" cle="citation_auteur" hf={hf} setHF={setHF} /><HField label="Rôle" cle="citation_role" hf={hf} setHF={setHF} /></div></>) },
                      { title: "🎯 Mission", content: (<><HField label="Titre" cle="mission_titre" hf={hf} setHF={setHF} /><HField label="Description" cle="mission_desc" rows={3} hf={hf} setHF={setHF} /></>) },
                    ].map(section => (
                      <div key={section.title} style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
                        <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><span style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>{section.title}</span></div>
                        <div style={{ padding: "16px 20px" }}>{section.content}</div>
                      </div>
                    ))}
                    <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
                      <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><span style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>📅 Timeline — 6 étapes</span></div>
                      <div style={{ padding: "16px 20px" }}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{[1,2,3,4,5,6].map(n => (<div key={n} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", border: "1px solid #EEF2F7" }}><div style={{ fontWeight: 700, color: "#F7B500", marginBottom: 10, fontSize: 12 }}>Étape {n}</div><div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 10, marginBottom: 10 }}><HField label="Année" cle={`timeline${n}_year`} hf={hf} setHF={setHF} /><HField label="Titre" cle={`timeline${n}_title`} hf={hf} setHF={setHF} /></div><HField label="Description" cle={`timeline${n}_desc`} rows={2} hf={hf} setHF={setHF} /></div>))}</div></div>
                    </div>
                    <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
                      <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><span style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>⭐ Valeurs — 3 valeurs</span></div>
                      <div style={{ padding: "16px 20px" }}><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>{[1,2,3].map(n => (<div key={n} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", border: "1px solid #EEF2F7" }}><div style={{ fontWeight: 700, color: "#F7B500", marginBottom: 10, fontSize: 12 }}>Valeur {n}</div><HField label="Titre" cle={`valeur${n}_titre`} hf={hf} setHF={setHF} /><HField label="Description" cle={`valeur${n}_desc`} rows={3} hf={hf} setHF={setHF} /><div style={{ marginBottom: 12 }}><label className="lbl">Couleur</label><div style={{ display: "flex", gap: 8, alignItems: "center" }}><input className="inp" value={hf(`valeur${n}_color`)} onChange={e => setHF(`valeur${n}_color`, e.target.value)} placeholder="#F7B500" style={{ flex: 1 }} /><input type="color" value={hf(`valeur${n}_color`) || "#F7B500"} onChange={e => setHF(`valeur${n}_color`, e.target.value)} style={{ width: 38, height: 34, borderRadius: 8, border: "1.5px solid #E2E8F0", cursor: "pointer", padding: 2 }} /></div></div></div>))}</div></div>
                    </div>
                    <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
                      <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><span style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>📞 Informations de contact</span></div>
                      <div style={{ padding: "16px 20px" }}><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}><HField label="Email" cle="contact_email" type="email" hf={hf} setHF={setHF} placeholder="contact@beh.com" /><HField label="Téléphone" cle="contact_telephone" hf={hf} setHF={setHF} placeholder="+216 00 000 000" /><HField label="Adresse" cle="contact_adresse" hf={hf} setHF={setHF} placeholder="Tunis, Tunisie" /></div></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, padding: "8px 0 4px" }}>
                      <button type="button" className="btn btn-gray" onClick={loadHistoire}>🔄 Annuler</button>
                      <button type="submit" className="btn btn-green" disabled={savingH} style={{ padding: "10px 28px", fontSize: 14 }}>{savingH ? "⏳ Sauvegarde..." : "💾 Sauvegarder tout"}</button>
                    </div>
                  </form>
                </div>
              )}

              {/* ═══════════ BLOG ═══════════ */}
              {tab === "blog" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div><h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>📝 Blog ({articles.length})</h2><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{articles.filter((a: any) => a.statut === "publie").length} publiés · {brouillons} brouillons</div></div>
                    <button className="btn btn-green" style={{ padding: "9px 20px" }} onClick={() => { resetArticleForm(); setShowArticleModal(true); }}>📝 Nouvel article</button>
                  </div>
                  {articles.length === 0 ? <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📝</div><div style={{ fontWeight: 600 }}>Aucun article</div></div> : articles.map((a: any) => (
                    <div key={a.id} className="card" style={{ borderLeft: `4px solid ${a.statut === "publie" ? "#10B981" : "#94A3B8"}`, padding: "18px 20px", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540", marginBottom: 7 }}>{a.titre}</div><div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}><span className="badge" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{a.type}</span>{a.categorie && <span className="badge" style={{ background: "#F1F5F9", color: "#64748B" }}>{a.categorie}</span>}{a.duree_lecture && <span className="badge" style={{ background: "#F1F5F9", color: "#64748B" }}>⏱ {a.duree_lecture}</span>}{a.pdf && <span className="badge" style={{ background: "#FFFBEB", color: "#B45309" }}>📄 PDF</span>}</div>{a.description && <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65 }}>{a.description}</p>}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end", flexShrink: 0 }}>{a.statut === "publie" ? <span className="badge" style={{ background: "#ECFDF5", color: "#059669" }}>✅ Publié</span> : a.statut === "brouillon" ? <span className="badge" style={{ background: "#FFFBEB", color: "#B45309" }}>📝 Brouillon</span> : <span className="badge" style={{ background: "#F1F5F9", color: "#64748B" }}>📦 Archivé</span>}<div style={{ display: "flex", gap: 6 }}>{a.statut === "brouillon" && <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => publierArticle(a.id)}>✅ Publier</button>}<button className="btn btn-blue" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => ouvrirEditionArticle(a)}>✏️</button><button className="btn btn-red" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => supprimerArticle(a.id)}>🗑</button></div></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ═══════════ FORMATIONS ═══════════ */}
              {tab === "formations" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>📚 Formations ({formations.length})</h2>
                      <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>
                        {formations.filter(f => f.statut === "publie").length} publiées · {formations.filter(f => f.statut === "brouillon").length} brouillons · {formationsProposees.length} en attente de validation
                      </div>
                    </div>
                    <button className="btn btn-green" style={{ padding: "9px 20px" }} onClick={() => { resetFormationForm(); setShowFormationModal(true); }}>📚 Nouvelle formation</button>
                  </div>

                  {/* Info si des formations proposées existent */}
                  {formationsProposees.length > 0 && (
                    <div style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: 14, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>⏳</span>
                        <div><div style={{ fontWeight: 700, color: "#92400E", fontSize: 13 }}>{formationsProposees.length} formation{formationsProposees.length > 1 ? "s" : ""} proposée{formationsProposees.length > 1 ? "s" : ""} par des experts en attente de validation</div><div style={{ fontSize: 12, color: "#B45309" }}>Rendez-vous dans l'onglet Demandes → Formations à valider</div></div>
                      </div>
                      <button className="btn btn-gold" onClick={() => { setTab("demandes"); setDemandeTypeFilter("formations_pub"); }}>Voir les demandes →</button>
                    </div>
                  )}

                  {formations.filter(f => !f.expert_id || f.statut !== "en_attente").length === 0 ? (
                    <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📚</div><div style={{ fontWeight: 600 }}>Aucune formation</div></div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      {formationsAdmin.map((f: any) => {
                        const borderColor = f.statut === "publie" ? "#A7F3D0" : "#EEF2F7";
                        const barColor = f.statut === "publie" ? "#10B981" : "#94A3B8";
                        return (
                          <div key={f.id} style={{ background: "#fff", border: `1.5px solid ${borderColor}`, borderRadius: 14, overflow: "hidden" }}>
                            <div style={{ height: 4, background: barColor }} />
                            <div style={{ padding: "16px 18px" }}>
                              <div style={{ display: "flex", gap: 12 }}>
                                {f.image && <img src={`${BASE}/uploads/formations/${f.image}`} style={{ width: 76, height: 76, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />}
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                                    <span className="badge" style={{ background: f.statut === "publie" ? "#ECFDF5" : "#F1F5F9", color: f.statut === "publie" ? "#059669" : "#64748B" }}>{f.statut === "publie" ? "✅ Publiée" : "📝 Brouillon"}</span>
                                    {f.certifiante && <span className="badge" style={{ background: "#F3E8FF", color: "#7C3AED" }}>🎓 Certifiante</span>}
                                    {f.expert_id && <span className="badge" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>Expert</span>}
                                  </div>
                                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>{f.titre}</div>
                                  {f.domaine && <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>📁 {f.domaine}</div>}
                                  {f.formateur && <div style={{ fontSize: 12, color: "#64748B" }}>👨‍🏫 {f.formateur}</div>}
                                  <div style={{ display: "flex", gap: 7, marginTop: 6 }}>
                                    {f.prix ? <span style={{ fontSize: 11, color: "#F7B500" }}>💰 {f.prix} DT</span> : <span style={{ fontSize: 11, color: "#22C55E" }}>🎁 Gratuit</span>}
                                    {f.places_limitees ? <span style={{ fontSize: 11, fontWeight: 700, color: (f.places_disponibles ?? 0) > 0 ? "#22C55E" : "#EF4444" }}>🎟️ {f.places_disponibles ?? 0} place(s)</span> : <span style={{ fontSize: 11, color: "#64748B" }}>🎟️ Illimitées</span>}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                                {f.statut !== "publie" && <button className="btn btn-green" onClick={() => publierFormation(f.id)}>✅ Publier</button>}
                                {f.statut === "publie" && <button className="btn btn-gray" onClick={() => archiverFormation(f.id)}>📦 Archiver</button>}
                                <button className="btn btn-blue" onClick={() => { setEditingFormation(f); setFormationForm({ titre: f.titre || "", description: f.description || "", domaine: f.domaine || "", formateur: f.formateur || "", type: f.type || "payant", prix: f.prix || "", places_limitees: f.places_limitees || false, places_disponibles: f.places_disponibles || "", duree: f.duree || "", mode: f.mode || "en_ligne", localisation: f.localisation || "", certifiante: f.certifiante || false, statut: f.statut || "brouillon", a_la_une: f.a_la_une || false, dateDebut: f.dateDebut || "", dateFin: f.dateFin || "", niveau: f.niveau || "", lien_formation: f.lien_formation || "", gratuit: f.gratuit || false }); if (f.image) setFormationImagePreview(`${BASE}/uploads/formations/${f.image}`); setShowFormationModal(true); }}>✏️ Modifier</button>
                                <button className="btn btn-red" onClick={() => supprimerFormation(f.id)}>🗑</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════ PODCASTS ═══════════ */}
              {tab === "podcasts" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>🎙️ Podcasts ({podcasts.length})</h2>
                      <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>
                        {podcasts.filter(p => p.statut === "publie").length} publiés · {podcastsProposees.length} en attente de validation
                      </div>
                    </div>
                    <button className="btn btn-green" onClick={() => alert("Implémentez la modale d'ajout de podcast")}>➕ Ajouter</button>
                  </div>

                  {/* Info si des podcasts proposés existent */}
                  {podcastsProposees.length > 0 && (
                    <div style={{ background: "#F5F3FF", border: "1.5px solid #DDD6FE", borderRadius: 14, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>⏳</span>
                        <div><div style={{ fontWeight: 700, color: "#6B21A8", fontSize: 13 }}>{podcastsProposees.length} podcast{podcastsProposees.length > 1 ? "s" : ""} proposé{podcastsProposees.length > 1 ? "s" : ""} par des experts en attente</div><div style={{ fontSize: 12, color: "#7C3AED" }}>Rendez-vous dans l'onglet Demandes → Podcasts à valider</div></div>
                      </div>
                      <button className="btn" style={{ background: "#7C3AED", color: "#fff", fontSize: 12 }} onClick={() => { setTab("demandes"); setDemandeTypeFilter("podcasts_pub"); }}>Voir les demandes →</button>
                    </div>
                  )}

                  {podcastsAdmin.length === 0 ? (
                    <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🎙️</div><div style={{ fontWeight: 600 }}>Aucun podcast publié</div></div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
                      {podcastsAdmin.map((p: any) => (
                        <div key={p.id} className="card" style={{ overflow: "hidden" }}>
                          <div style={{ display: "flex", gap: 12, padding: "14px" }}>
                            {p.image ? <img src={`${BASE}/uploads/podcasts-images/${p.image}`} style={{ width: 70, height: 70, borderRadius: 12, objectFit: "cover" }} /> : <div style={{ width: 70, height: 70, borderRadius: 12, background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎙️</div>}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: 14 }}>{p.titre}</div>
                              {p.auteur && <div style={{ fontSize: 12, color: "#64748B" }}>{p.auteur}</div>}
                              {p.domaine && <span className="badge" style={{ background: "#F3E8FF", color: "#7C3AED", marginTop: 4, display: "inline-block" }}>{p.domaine}</span>}
                            </div>
                          </div>
                          <div style={{ padding: "8px 14px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="badge" style={{ background: p.statut === "publie" ? "#ECFDF5" : "#FFFBEB", color: p.statut === "publie" ? "#059669" : "#B45309" }}>{p.statut === "publie" ? "✅ Publié" : "📝 Brouillon"}</span>
                            <div style={{ display: "flex", gap: 6 }}>
                              {p.statut !== "publie" && <button className="btn btn-green" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => publierPodcastPropose(p.id)}>✅ Publier</button>}
                              <button className="btn btn-outline" style={{ padding: "4px 10px", fontSize: 11 }}>✏️</button>
                              <button className="btn btn-red" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => supprimerPodcastPropose(p.id)}>🗑</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════ MÉDIAS ═══════════ */}
              {tab === "medias" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>🎬 Médias & Vidéos ({medias.length})</h2>
                    <button className="btn btn-green" onClick={() => alert("Implémentez la modale d'ajout de média")}>➕ Ajouter</button>
                  </div>
                  {medias.length === 0 ? (
                    <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div><div style={{ fontWeight: 600 }}>Aucun média</div></div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                      {medias.map((m: any) => (
                        <div key={m.id} className="card" style={{ overflow: "hidden" }}>
                          <div style={{ height: 160, background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 32 }}>{m.type === "video" ? <FaPlay /> : <FaMicrophone />}</div>
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