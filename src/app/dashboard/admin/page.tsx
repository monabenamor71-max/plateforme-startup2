"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BASE = "http://localhost:3001";

type Tab =
  | "dashboard" | "experts" | "startups"
  | "temoignages" | "contacts" | "histoire" | "blog"
  | "formations" | "demandes";

const SERVICES_AVEC_EXPERT = ["consulting", "audit-sur-site", "nos-plateformes", "personnalise"];

const SERVICE_META: Record<string, { label: string; icon: string; color: string; domaines: string[] }> = {
  consulting:        { label: "Consulting Stratégique", icon: "📊", color: "#3B82F6", domaines: ["Stratégie","Management","Finance","Entrepreneuriat"] },
  "audit-sur-site":  { label: "Audit sur Site",         icon: "🔍", color: "#8B5CF6", domaines: ["Audit","Qualité","Management","Droit & Conformité"] },
  formations:        { label: "Formations",              icon: "🎓", color: "#F7B500", domaines: [] },
  formation:         { label: "Formation",               icon: "🎓", color: "#F7B500", domaines: [] },
  "nos-plateformes": { label: "Nos Plateformes",         icon: "💻", color: "#10B981", domaines: ["IA & Digital","Management","Stratégie"] },
  personnalise:      { label: "Personnalisé",             icon: "✍️", color: "#EF4444", domaines: [] },
};

const calculerExperience = (anneeDebut: number | string | null | undefined): string => {
  if (!anneeDebut) return "";
  const annee = typeof anneeDebut === "string" ? parseInt(anneeDebut, 10) : anneeDebut;
  if (isNaN(annee)) return "";
  const ans = new Date().getFullYear() - annee;
  if (ans < 0) return "";
  return `${ans} ${ans > 1 ? "ans" : "an"}`;
};

const afficherExperience = (expert: any): string => {
  if (expert.annee_debut_experience) {
    const c = calculerExperience(expert.annee_debut_experience);
    return `Année de début : ${expert.annee_debut_experience} (${c} d'expérience)`;
  }
  if (expert.experience) return expert.experience;
  return "Non renseignée";
};

function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: string }) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    green:  { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" },
    red:    { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" },
    yellow: { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
    blue:   { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    purple: { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE" },
    gray:   { bg: "#F9FAFB", text: "#6B7280", border: "#E5E7EB" },
    orange: { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    teal:   { bg: "#F0FDFA", text: "#0D9488", border: "#99F6E4" },
  };
  const c = map[color] || map.gray;
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Kpi({ icon, label, value, color, sub, onClick }: any) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#fff", border: `1.5px solid ${hov ? color : "#EEF2F7"}`, borderRadius: 16, padding: "20px 22px", display: "flex", gap: 16, alignItems: "flex-start", cursor: onClick ? "pointer" : "default", transition: "all .18s", boxShadow: hov ? `0 8px 28px ${color}22` : "none" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#0A2540", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: "#7D8FAA", marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 3 }}>{sub}</div>}
      </div>
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

function Avatar({ nom, prenom, photo, size = 36 }: any) {
  const [err, setErr] = useState(false);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg,#0A2540,#1a3f6f)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid #F7B500", fontSize: size * 0.34, color: "#F7B500", fontWeight: 800 }}>
      {photo && !err
        ? <img src={`${BASE}/uploads/photos/${photo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setErr(true)} />
        : (prenom?.[0] || "") + (nom?.[0] || "")}
    </div>
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

function HField({ label, cle, type = "text", rows = 0, hf, setHF, placeholder = "" }: any) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase" as const, letterSpacing: "1px", display: "block", marginBottom: 5 }}>{label}</label>
      {rows > 0
        ? <textarea className="inp" rows={rows} value={hf(cle)} onChange={(e: any) => setHF(cle, e.target.value)} placeholder={placeholder} style={{ resize: "vertical" as const }} />
        : <input type={type} className="inp" value={hf(cle)} onChange={(e: any) => setHF(cle, e.target.value)} placeholder={placeholder} />}
    </div>
  );
}

function DashboardView({ experts, startups, temoignages, demandes, formations, setTab }: any) {
  const expertValides  = experts.filter((e: any) => e.statut === "valide").length;
  const startupValides = startups.filter((s: any) => s.statut === "valide").length;
  const enAttente      = [...experts, ...startups].filter((x: any) => x.statut === "en_attente").length;
  const temosPublies   = temoignages.filter((t: any) => t.statut === "valide");
  const avgNote        = temosPublies.length > 0 ? (temosPublies.reduce((s: number, t: any) => s + (t.note || 5), 0) / temosPublies.length).toFixed(1) : "—";
  const repartitionEtoiles = [5, 4, 3, 2, 1].map(n => ({ n, count: temosPublies.filter((t: any) => t.note === n).length }));
  const serviceMap: Record<string, number> = {};
  demandes.forEach((d: any) => { const k = d.service || "Autre"; serviceMap[k] = (serviceMap[k] || 0) + 1; });
  const topServices = Object.entries(serviceMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxSvc = topServices.length ? topServices[0][1] : 1;
  const domaineMap: Record<string, number> = {};
  experts.forEach((e: any) => { const k = e.domaine || "Autre"; domaineMap[k] = (domaineMap[k] || 0) + 1; });
  const topDomaines = Object.entries(domaineMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const secteurMap: Record<string, number> = {};
  startups.forEach((s: any) => { const k = s.secteur || "Autre"; secteurMap[k] = (secteurMap[k] || 0) + 1; });
  const topSecteurs = Object.entries(secteurMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const demandeStatuts = ["en_attente", "acceptee", "en_cours", "terminee", "refusee"].map(s => ({
    label: { en_attente: "En attente", acceptee: "Acceptée", en_cours: "En cours", terminee: "Terminée", refusee: "Refusée" }[s] || s,
    count: demandes.filter((d: any) => d.statut === s).length,
    color: { en_attente: "#F7B500", acceptee: "#22C55E", en_cours: "#3B82F6", terminee: "#10B981", refusee: "#EF4444" }[s] || "#94A3B8",
  }));
  const totalDemandes = demandes.length;

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0A2540", marginBottom: 16 }}>Vue d'ensemble</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          <Kpi icon="⏳" label="En attente validation" value={enAttente} color="#F7B500" sub="Experts + Startups" onClick={() => setTab("experts")} />
          <Kpi icon="📋" label="Demandes de service" value={totalDemandes} color="#8B5CF6" sub={`${demandes.filter((d: any) => d.statut === "en_attente").length} en attente`} onClick={() => setTab("demandes")} />
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
            ].map((row, i) => (
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
            {demandeStatuts.map((s, i) => (
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <SectionCard title="🛠️ Services les plus demandés">
          {topServices.length === 0
            ? <div style={{ textAlign: "center", color: "#94A3B8", padding: "20px 0", fontSize: 13 }}>Aucune donnée</div>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topServices.map(([svc, count], i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", width: 16, textAlign: "right" }}>#{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>{SERVICE_META[svc]?.label || svc}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#8B5CF6" }}>{count}</span>
                      </div>
                      <ProgressBar pct={(count / maxSvc) * 100} color={["#8B5CF6","#3B82F6","#F7B500","#10B981","#EF4444","#F97316"][i]} />
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </SectionCard>
        <SectionCard title="⭐ Satisfaction clients">
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <MiniDonut pct={avgNote !== "—" ? Math.round((parseFloat(avgNote) / 5) * 100) : 0} color="#F7B500" size={72} />
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <SectionCard title="🎯 Experts par domaine" action={<button onClick={() => setTab("experts")} style={{ fontSize: 12, color: "#8B5CF6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir tout →</button>}>
          {topDomaines.length === 0
            ? <div style={{ textAlign: "center", color: "#94A3B8", padding: "20px 0", fontSize: 13 }}>Aucun expert</div>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topDomaines.map(([domaine, count], i) => {
                  const colors = ["#8B5CF6","#3B82F6","#10B981","#F7B500","#EF4444"];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i], flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 500, color: "#334155" }}>{domaine}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: colors[i] }}>{count}</span>
                        </div>
                        <ProgressBar pct={experts.length > 0 ? (count / experts.length) * 100 : 0} color={colors[i]} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </SectionCard>
        <SectionCard title="🚀 Startups par secteur" action={<button onClick={() => setTab("startups")} style={{ fontSize: 12, color: "#F7B500", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Voir tout →</button>}>
          {topSecteurs.length === 0
            ? <div style={{ textAlign: "center", color: "#94A3B8", padding: "20px 0", fontSize: 13 }}>Aucune startup</div>
            : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topSecteurs.map(([secteur, count], i) => {
                  const colors = ["#F7B500","#10B981","#3B82F6","#8B5CF6","#EF4444"];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i], flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 500, color: "#334155" }}>{secteur}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: colors[i] }}>{count}</span>
                        </div>
                        <ProgressBar pct={startups.length > 0 ? (count / startups.length) * 100 : 0} color={colors[i]} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
        </SectionCard>
      </div>
      <SectionCard title="📋 Dernières demandes reçues" action={<button onClick={() => setTab("demandes")} style={{ fontSize: 12, color: "#8B5CF6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Gérer toutes →</button>}>
        {demandes.length === 0
          ? <div style={{ textAlign: "center", color: "#94A3B8", padding: "28px 0", fontSize: 13 }}>Aucune demande</div>
          : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC" }}>
                    {["Client / Startup","Service","Formation","Date","Statut"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase", borderBottom: "1.5px solid #EEF2F7" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {demandes.slice(0, 8).map((d: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F8FAFC" }}>
                      <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#0A2540" }}>
                        {d.user?.prenom} {d.user?.nom}
                        {d.user?.startup?.nom_startup && <span style={{ fontSize: 11, color: "#64748B", display: "block" }}>🏢 {d.user.startup.nom_startup}</span>}
                      </td>
                      <td style={{ padding: "11px 14px" }}><Badge color="purple">{SERVICE_META[d.service]?.label || d.service || "Personnalisé"}</Badge></td>
                      <td style={{ padding: "11px 14px", fontSize: 12, color: "#7C3AED" }}>{d.formation ? d.formation.titre : "—"}</td>
                      <td style={{ padding: "11px 14px", fontSize: 11, color: "#94A3B8" }}>{new Date(d.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <Badge color={d.statut === "en_attente" ? "yellow" : d.statut === "acceptee" || d.statut === "terminee" ? "green" : d.statut === "en_cours" ? "blue" : "red"}>
                          {d.statut === "en_attente" ? "⏳ Attente" : d.statut === "acceptee" ? "✅ Acceptée" : d.statut === "en_cours" ? "🔄 En cours" : d.statut === "terminee" ? "✅ Terminée" : "❌ Refusée"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </SectionCard>
    </div>
  );
}

function ModalDemande({ demande, experts, commentaireAdmin, setCommentaireAdmin, onChangerStatut, onNotifierExperts, onAssignerExpert, onAccepterFormation, onRefuserFormation, onClose }: any) {
  const svc = demande?.service || "";
  const isFormation = svc === "formations" || svc === "formation";
  const needsExpert = SERVICES_AVEC_EXPERT.includes(svc);
  const meta = SERVICE_META[svc] || { label: svc, icon: "🛠️", color: "#3B82F6", domaines: [] };

  const expertsValides = experts.filter((e: any) => e.statut === "valide");
  const expertsFiltres = meta.domaines.length > 0
    ? expertsValides.filter((e: any) => meta.domaines.some((d: string) => e.domaine?.toLowerCase().includes(d.toLowerCase())))
    : expertsValides;
  const expertsAffiches = expertsFiltres.length > 0 ? expertsFiltres : expertsValides;

  const expertsNotifiesIds: number[] = demande?.experts_notifies || [];
  const expertsAcceptesIds: number[] = demande?.experts_acceptes || [];
  const expertsAcceptes = experts.filter((e: any) => expertsAcceptesIds.includes(e.id));

  const [selectedExperts, setSelectedExperts] = useState<number[]>([]);
  const [etape, setEtape] = useState<"selection" | "assignation">(expertsAcceptesIds.length > 0 ? "assignation" : "selection");
  const [showDescModal, setShowDescModal] = useState(false);
  const [descExpert, setDescExpert] = useState<any>(null);

  const formation = demande?.formation;
  const placesRestantes = formation?.places_limitees ? (formation?.places_disponibles ?? 0) : null;
  const peutAccepter = !isFormation || !formation?.places_limitees || (placesRestantes !== null && placesRestantes > 0);

  const toggleExpert = (id: number) => setSelectedExperts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg,${meta.color},${meta.color}cc)`, padding: "22px 26px", position: "sticky", top: 0, borderRadius: "20px 20px 0 0", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{meta.icon}</div>
              <div>
                <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "1.5px" }}>Demande de service</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 19 }}>{meta.label}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.18)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "22px 26px", maxHeight: "80vh", overflowY: "auto" }}>
          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 18, border: "1px solid #EEF2F7" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540", marginBottom: 12 }}>👤 Informations du client</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Nom complet",  val: `${demande.user?.prenom || ""} ${demande.user?.nom || ""}` },
                { label: "Email",        val: demande.user?.email || "—" },
                { label: "Téléphone",    val: demande.telephone || demande.user?.telephone || "—" },
                { label: "Startup",      val: demande.user?.startup?.nom_startup || "—" },
                { label: "Secteur",      val: demande.user?.startup?.secteur || "—" },
                { label: "Localisation", val: demande.user?.startup?.localisation || "—" },
              ].map((row, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "10px 14px", border: "1px solid #E8EEF6" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: 4 }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 18, border: "1px solid #EEF2F7" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540", marginBottom: 12 }}>📋 Détails de la demande</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <Badge color={demande.statut === "en_attente" ? "yellow" : demande.statut === "acceptee" || demande.statut === "terminee" ? "green" : demande.statut === "en_cours" ? "blue" : "red"}>
                {demande.statut === "en_attente" ? "⏳ En attente" : demande.statut === "acceptee" ? "✅ Acceptée" : demande.statut === "refusee" ? "❌ Refusée" : demande.statut === "en_cours" ? "🔄 En cours" : "✅ Terminée"}
              </Badge>
              <span style={{ fontSize: 11, color: "#94A3B8" }}>{new Date(demande.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              {demande.expert_assigne && <Badge color="teal">👤 {demande.expert_assigne?.user?.prenom} {demande.expert_assigne?.user?.nom}</Badge>}
            </div>
            {demande.description && (
              <div style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", marginBottom: 10, border: "1px solid #E8EEF6", fontSize: 13.5, color: "#334155", lineHeight: 1.75 }}>
                {demande.description}
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {demande.delai    && <Badge color="green">⏱ {demande.delai}</Badge>}
              {demande.objectif && <Badge color="gray">🎯 {demande.objectif}</Badge>}
              {demande.telephone && <Badge color="yellow">📞 {demande.telephone}</Badge>}
            </div>
          </div>

          {isFormation && formation && (
            <div style={{ background: "#F3E8FF", border: "2px solid #DDD6FE", borderRadius: 14, padding: "18px 20px", marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#6B21A8", marginBottom: 12 }}>
                🎓 Formation demandée : <span style={{ color: "#7C3AED" }}>{formation.titre}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: formation.places_limitees ? "repeat(3,1fr)" : "repeat(2,1fr)", gap: 12, marginBottom: 12 }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", textAlign: "center", border: "1px solid #DDD6FE" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" as const, marginBottom: 4 }}>Places limitées</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#6B21A8" }}>{formation.places_limitees ? "Oui" : "Non"}</div>
                </div>
                {formation.places_limitees && (
                  <>
                    <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", textAlign: "center", border: "1px solid #DDD6FE" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" as const, marginBottom: 4 }}>Places restantes</div>
                      <div style={{ fontSize: 30, fontWeight: 900, color: (placesRestantes || 0) > 0 ? "#22C55E" : "#EF4444" }}>{placesRestantes ?? 0}</div>
                    </div>
                    <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", textAlign: "center", border: "1px solid #DDD6FE" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" as const, marginBottom: 4 }}>Statut</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: (placesRestantes || 0) > 0 ? "#10B981" : "#EF4444" }}>
                        {(placesRestantes || 0) > 0 ? "✅ Disponibles" : "❌ Complète"}
                      </div>
                    </div>
                  </>
                )}
                {!formation.places_limitees && (
                  <div style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", textAlign: "center", border: "1px solid #DDD6FE" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" as const, marginBottom: 4 }}>Capacité</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>♾️ Illimitée</div>
                  </div>
                )}
              </div>
              {!peutAccepter && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#DC2626", fontWeight: 600 }}>
                  ⚠️ Formation complète — impossible d'accepter cette demande.
                </div>
              )}
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
                    <span>🟢 Experts validés — domaine : <strong>{meta.domaines.join(", ") || "tous"}</strong></span>
                    <span style={{ fontWeight: 700, color: "#0A2540" }}>{expertsAffiches.length} expert(s)</span>
                  </div>
                  <div style={{ maxHeight: 260, overflowY: "auto" }}>
                    {expertsAffiches.length === 0
                      ? (
                        <div style={{ padding: "28px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>😔</div>
                          Aucun expert valide dans ce domaine
                        </div>
                      )
                      : expertsAffiches.map((ex: any) => {
                        const alreadyNotified = expertsNotifiesIds.includes(ex.id);
                        const isSelected = selectedExperts.includes(ex.id);
                        return (
                          <div key={ex.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #F8FAFC", background: isSelected ? "#EFF6FF" : "#fff" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <input type="checkbox" checked={isSelected} disabled={alreadyNotified}
                                onChange={() => { if (!alreadyNotified) toggleExpert(ex.id); }}
                                style={{ cursor: alreadyNotified ? "not-allowed" : "pointer", width: 16, height: 16, accentColor: "#F7B500" }} />
                              <Avatar nom={ex.user?.nom} prenom={ex.user?.prenom} photo={ex.photo} size={38} />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13.5, color: "#0A2540" }}>{ex.user?.prenom} {ex.user?.nom}</div>
                                <div style={{ fontSize: 11, color: "#64748B" }}>{ex.domaine || "Expert"} · {ex.localisation || "—"}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button className="btn btn-gray" style={{ fontSize: 12, padding: "4px 8px" }}
                                onClick={() => { setDescExpert(ex); setShowDescModal(true); }}>📄 Voir</button>
                              {alreadyNotified
                                ? <Badge color={expertsAcceptesIds.includes(ex.id) ? "green" : "yellow"}>{expertsAcceptesIds.includes(ex.id) ? "✅ A accepté" : "⏳ Notifié"}</Badge>
                                : <Badge color="gray">Non notifié</Badge>
                              }
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                  {selectedExperts.length > 0 && (
                    <div style={{ padding: "12px 16px", background: "#EFF6FF", borderTop: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: "#1D4ED8", fontWeight: 600 }}>{selectedExperts.length} expert(s) sélectionné(s)</span>
                      <button className="btn btn-primary" style={{ fontSize: 13, padding: "8px 20px" }}
                        onClick={() => { onNotifierExperts(demande.id, selectedExperts); setSelectedExperts([]); setEtape("assignation"); }}>
                        📤 Envoyer les notifications
                      </button>
                    </div>
                  )}
                </div>
              )}

              {etape === "assignation" && (
                <div>
                  {expertsAcceptesIds.length === 0
                    ? (
                      <div style={{ padding: "32px", textAlign: "center", color: "#94A3B8" }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "#0A2540", marginBottom: 6 }}>En attente des réponses</div>
                        <div style={{ fontSize: 13 }}>Les experts notifiés doivent accepter ou refuser depuis leur espace.</div>
                        <button className="btn btn-s" style={{ marginTop: 14, fontSize: 12 }} onClick={() => setEtape("selection")}>← Retour à la sélection</button>
                      </div>
                    )
                    : (
                      <>
                        <div style={{ padding: "12px 16px", background: "#DCFCE7", fontSize: 12, color: "#166534", fontWeight: 700 }}>
                          ✅ {expertsAcceptesIds.length} expert(s) ont accepté — Choisissez-en un pour l'assigner
                        </div>
                        {expertsAcceptes.map((ex: any) => {
                          const isAssigned = demande.expert_assigne_id === ex.id;
                          return (
                            <div key={ex.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #F0FDF4", background: isAssigned ? "#DCFCE7" : "#fff" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <Avatar nom={ex.user?.nom} prenom={ex.user?.prenom} photo={ex.photo} size={42} />
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>{ex.user?.prenom} {ex.user?.nom}</div>
                                  <div style={{ fontSize: 12, color: "#64748B" }}>{ex.domaine || "Expert"}</div>
                                  <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 700 }}>✅ A accepté la mission</div>
                                </div>
                              </div>
                              {isAssigned
                                ? <Badge color="green">✅ Assigné</Badge>
                                : <button className="btn btn-green" style={{ fontSize: 13, padding: "9px 18px" }} onClick={() => onAssignerExpert(demande.id, ex.id, commentaireAdmin)}>👤 Assigner</button>
                              }
                            </div>
                          );
                        })}
                      </>
                    )
                  }
                </div>
              )}
            </div>
          )}

          <div style={{ background: "#F8FAFC", border: "1px solid #EEF2F7", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontWeight: 700, color: "#0A2540", fontSize: 14, marginBottom: 14 }}>⚙️ Actions administrateur</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase" as const, letterSpacing: "1px", display: "block", marginBottom: 6 }}>Message pour le client</label>
              <textarea className="inp" rows={3} placeholder="Réponse visible par le client..." value={commentaireAdmin} onChange={(e: any) => setCommentaireAdmin(e.target.value)} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              {demande.statut === "en_attente" && (
                isFormation ? (
                  <>
                    <button className="btn btn-green" style={{ flex: 1, justifyContent: "center" }}
                      disabled={!peutAccepter}
                      onClick={() => peutAccepter && onAccepterFormation(demande.id)}>
                      {peutAccepter ? "✅ Accepter (décrémente les places)" : "❌ Formation complète"}
                    </button>
                    <button className="btn btn-red" style={{ flex: 1, justifyContent: "center" }} onClick={() => onRefuserFormation(demande.id)}>❌ Refuser</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-green" style={{ flex: 1, justifyContent: "center" }} onClick={() => onChangerStatut(demande.id, "acceptee")}>✅ Accepter</button>
                    <button className="btn btn-red"   style={{ flex: 1, justifyContent: "center" }} onClick={() => onChangerStatut(demande.id, "refusee")}>❌ Refuser</button>
                  </>
                )
              )}
              {isFormation && demande.statut === "acceptee" && (
                <button className="btn btn-red" style={{ flex: 1, justifyContent: "center" }} onClick={() => onRefuserFormation(demande.id)}>↩️ Annuler (rendre la place)</button>
              )}
              {!isFormation && demande.statut === "acceptee" && (
                <button className="btn btn-blue" style={{ flex: 1, justifyContent: "center" }} onClick={() => onChangerStatut(demande.id, "en_cours")}>🔄 Passer En cours</button>
              )}
              {demande.statut === "en_cours" && (
                <button className="btn btn-green" style={{ flex: 1, justifyContent: "center" }} onClick={() => onChangerStatut(demande.id, "terminee")}>✅ Marquer terminée</button>
              )}
              {commentaireAdmin && (
                <button className="btn btn-gray" style={{ flex: 1, justifyContent: "center" }} onClick={() => onChangerStatut(demande.id, demande.statut)}>💾 Sauvegarder message</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDescModal && descExpert && (
        <div className="modal-bg" onClick={() => setShowDescModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={(e: any) => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "18px 24px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar nom={descExpert.user?.nom} prenom={descExpert.user?.prenom} photo={descExpert.photo} size={44} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>{descExpert.user?.prenom} {descExpert.user?.nom}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)" }}>{descExpert.domaine || "Expert"}</div>
                </div>
              </div>
              <button onClick={() => setShowDescModal(false)} style={{ background: "rgba(255,255,255,.2)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: "24px 28px" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: 4 }}>📌 Expérience</div>
                <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.7, background: "#F8FAFC", borderRadius: 12, padding: "14px 18px" }}>{afficherExperience(descExpert)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: 4 }}>📖 Compétences</div>
                <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.7, background: "#F8FAFC", borderRadius: 12, padding: "14px 18px" }}>{descExpert.description || "Aucune description fournie"}</div>
              </div>
              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                <button className="btn btn-gray" onClick={() => setShowDescModal(false)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardAdmin() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sideCollapsed, setSideCollapsed] = useState(false);

  const [experts,     setExperts]     = useState<any[]>([]);
  const [startups,    setStartups]    = useState<any[]>([]);
  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [articles,    setArticles]    = useState<any[]>([]);
  const [contactMsgs, setContactMsgs] = useState<any[]>([]);
  const [formations,  setFormations]  = useState<any[]>([]);
  const [demandes,    setDemandes]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [toast,       setToast]       = useState({ text: "", ok: true });
  const [selected,    setSelected]    = useState<any>(null);

  // ── Article state (avec gestion "Autre" pour catégorie) ──
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle,   setEditingArticle]   = useState<any>(null);
  const [articleForm,      setArticleForm]       = useState<any>({ titre: "", description: "", type: "article", categorie: "", duree_lecture: "", statut: "brouillon", image: "" });
  const [articleImageFile, setArticleImageFile]  = useState<File | null>(null);
  const [articlePdfFile,   setArticlePdfFile]    = useState<File | null>(null);
  const [imagePreview,     setImagePreview]      = useState("");
  const [pdfName,          setPdfName]           = useState("");
  const [categorieAutre,   setCategorieAutre]    = useState(false);
  const [categoriePersonnalise, setCategoriePersonnalise] = useState("");

  // Liste des catégories prédéfinies (avec option "Autre")
  const categoriesPredefinies = [
    "Développement",
    "Intelligence artificielle",
    "Business",
    "Sécurité",
    "Design",
    "Autre"
  ];

  // ── Formation state ──
  const [showFormationModal,    setShowFormationModal]    = useState(false);
  const [editingFormation,      setEditingFormation]      = useState<any>(null);
  const [formationForm,         setFormationForm]         = useState({ titre: "", description: "", domaine: "", formateur: "", type: "payant", prix: "", places_limitees: false, places_disponibles: "", duree: "", mode: "en_ligne", localisation: "", certifiante: false, statut: "brouillon", a_la_une: false, dateDebut: "", dateFin: "", niveau: "", lien_formation: "", gratuit: false });
  const [formationImageFile,    setFormationImageFile]    = useState<File | null>(null);
  const [formationImagePreview, setFormationImagePreview] = useState("");

  const [hForm,   setHForm]   = useState<any>({});
  const [savingH, setSavingH] = useState(false);

  const [replyModal,   setReplyModal]   = useState<any>({ open: false, messageId: 0, email: "", nom: "", prenom: "" });
  const [replyText,    setReplyText]    = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const [selectedDemande,    setSelectedDemande]    = useState<any>(null);
  const [commentaireAdmin,   setCommentaireAdmin]   = useState("");
  const [demandeStatutFilt,  setDemandeStatutFilt]  = useState("tous");
  const [demandeServiceFilt, setDemandeServiceFilt] = useState("tous");

  const tk   = () => typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const hdr  = () => ({ Authorization: `Bearer ${tk()}` });
  const hdrJ = () => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" });

  function notify(text: string, ok = true) { setToast({ text, ok }); setTimeout(() => setToast({ text: "", ok: true }), 3200); }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (!raw) { router.replace("/connexion"); return; }
    try { const u = JSON.parse(raw); if (u.role !== "admin") { router.replace("/"); return; } } catch { router.replace("/connexion"); return; }
    loadAll(); loadHistoire(); loadArticles(); loadContactMessages(); loadFormations(); loadDemandes();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [e, s, t] = await Promise.all([
        fetch(`${BASE}/admin/experts?_=${Date.now()}`,   { headers: hdr() }).then(r => r.json()),
        fetch(`${BASE}/admin/startups?_=${Date.now()}`,  { headers: hdr() }).then(r => r.json()),
        fetch(`${BASE}/temoignages/all?_=${Date.now()}`, { headers: hdr() }).then(r => r.json()),
      ]);
      setExperts(Array.isArray(e) ? e : []);
      setStartups(Array.isArray(s) ? s : []);
      setTemoignages(Array.isArray(t) ? t : []);
    } catch {}
    setLoading(false);
  }

  async function loadFormations() {
    try {
      const r = await fetch(`${BASE}/formations/admin/all?_=${Date.now()}`, { headers: hdr() });
      if (r.ok) {
        const data = await r.json();
        setFormations(Array.isArray(data) ? data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []);
      } else setFormations([]);
    } catch { setFormations([]); }
  }

  async function loadDemandes() {
    try {
      const r = await fetch(`${BASE}/demandes-service/all?_=${Date.now()}`, { headers: hdr() });
      if (!r.ok) { notify(`Erreur ${r.status}`, false); setDemandes([]); return; }
      const data = await r.json();
      setDemandes(Array.isArray(data) ? data : []);
    } catch { notify("Impossible de charger les demandes", false); setDemandes([]); }
  }

  async function loadHistoire() { try { const r = await fetch(`${BASE}/histoire?_=${Date.now()}`); if (r.ok) setHForm(await r.json()); } catch {} }
  async function loadArticles() { try { const r = await fetch(`${BASE}/articles/admin/all?_=${Date.now()}`, { headers: hdr() }); if (r.ok) setArticles(await r.json()); } catch {} }
  async function loadContactMessages() { try { const r = await fetch(`${BASE}/contact/admin/messages?_=${Date.now()}`, { headers: hdr() }); if (r.ok) setContactMsgs(await r.json()); } catch {} }

  const hf  = (k: string) => hForm[k] || "";
  const setHF = (k: string, v: string) => setHForm((p: any) => ({ ...p, [k]: v }));

  async function saveHistoire(e: React.FormEvent) {
    e.preventDefault(); setSavingH(true);
    try { const r = await fetch(`${BASE}/histoire`, { method: "PUT", headers: hdrJ(), body: JSON.stringify(hForm) }); if (r.ok) { notify("✅ Page mise à jour !"); loadHistoire(); } else notify("Erreur", false); } catch { notify("Erreur réseau", false); }
    setSavingH(false);
  }

  async function valider(type: string, id: number) { const r = await fetch(`${BASE}/admin/${type}/${id}/valider?_=${Date.now()}`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("✅ Validé !"); setSelected(null); loadAll(); } else notify("Erreur", false); }
  async function refuser(type: string, id: number) { const r = await fetch(`${BASE}/admin/${type}/${id}/refuser?_=${Date.now()}`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("Refusé"); setSelected(null); loadAll(); } else notify("Erreur", false); }
  async function validerModification(id: number) { const r = await fetch(`${BASE}/experts/${id}/valider-modification?_=${Date.now()}`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("✅ Modif validée"); loadAll(); } else notify("Erreur", false); }
  async function refuserModification(id: number) { const r = await fetch(`${BASE}/experts/${id}/refuser-modification?_=${Date.now()}`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("Modif refusée"); loadAll(); } else notify("Erreur", false); }
  async function validerTemo(id: number) { const r = await fetch(`${BASE}/temoignages/${id}/valider?_=${Date.now()}`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("✅ Publié !"); loadAll(); } else notify("Erreur", false); }
  async function refuserTemo(id: number) { const r = await fetch(`${BASE}/temoignages/${id}/refuser?_=${Date.now()}`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("Refusé"); loadAll(); } else notify("Erreur", false); }
  async function supprimerTemo(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/temoignages/${id}?_=${Date.now()}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("Supprimé"); loadAll(); } else notify("Erreur", false); }
  async function marquerLu(id: number) { const r = await fetch(`${BASE}/contact/admin/messages/${id}/lu?_=${Date.now()}`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("Lu"); loadContactMessages(); } else notify("Erreur", false); }
  async function supprimerMessage(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/contact/admin/messages/${id}?_=${Date.now()}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("Supprimé"); loadContactMessages(); } else notify("Erreur", false); }

  async function envoyerReponse(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) { notify("Écrivez une réponse", false); return; }
    setSendingReply(true);
    try {
      const r = await fetch(`${BASE}/contact/admin/messages/${replyModal.messageId}/repondre`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ reponse: replyText }) });
      if (r.ok) { notify("✅ Envoyé !"); setReplyModal({ open: false, messageId: 0, email: "", nom: "", prenom: "" }); setReplyText(""); loadContactMessages(); } else notify("Erreur", false);
    } catch { notify("Erreur", false); }
    setSendingReply(false);
  }

  async function changerStatutDemande(id: number, statut: string) {
    const body: any = { statut };
    if (commentaireAdmin) body.commentaire_admin = commentaireAdmin;
    const r = await fetch(`${BASE}/demandes-service/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify(body) });
    if (r.ok) { notify(`✅ Statut → ${statut}`); setSelectedDemande(null); setCommentaireAdmin(""); await loadDemandes(); await loadFormations(); }
    else notify("Erreur", false);
  }

  async function accepterFormationDemande(demandeId: number) {
    try {
      const r = await fetch(`${BASE}/demandes-service/formation/${demandeId}/accept`, { method: "PATCH", headers: hdrJ() });
      if (r.ok) {
        const data = await r.json();
        notify(`✅ Acceptée ! Places restantes : ${data.placesRestantes ?? "illimitées"}`);
        setSelectedDemande(null); setCommentaireAdmin("");
        await loadDemandes(); await loadFormations();
      } else {
        const err = await r.json();
        notify(`❌ ${err.message || "Erreur"}`, false);
      }
    } catch { notify("Erreur réseau", false); }
  }

  async function refuserFormationDemande(demandeId: number) {
    if (!confirm("Refuser cette demande ? Si déjà acceptée, la place sera restituée.")) return;
    try {
      const r = await fetch(`${BASE}/demandes-service/formation/${demandeId}/reject`, { method: "PATCH", headers: hdrJ() });
      if (r.ok) { notify("✅ Demande refusée"); setSelectedDemande(null); setCommentaireAdmin(""); await loadDemandes(); await loadFormations(); }
      else { const err = await r.json(); notify(`❌ ${err.message || "Erreur"}`, false); }
    } catch { notify("Erreur réseau", false); }
  }

  async function notifierExperts(demandeId: number, expertIds: number[]) {
    try {
      const r = await fetch(`${BASE}/demandes-service/${demandeId}/notifier-experts`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ expert_ids: expertIds }) });
      if (r.ok) { notify(`✅ ${expertIds.length} expert(s) notifié(s) !`); await loadDemandes(); }
      else notify("Erreur envoi notifications", false);
    } catch { notify("Erreur réseau", false); }
  }

  async function assignerExpert(demandeId: number, expertId: number, commentaire: string) {
    const body: any = { expert_id: expertId };
    if (commentaire) body.commentaire = commentaire;
    try {
      const r = await fetch(`${BASE}/demandes-service/${demandeId}/assigner`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify(body) });
      if (r.ok) { notify("✅ Expert assigné !"); setSelectedDemande(null); setCommentaireAdmin(""); await loadDemandes(); }
      else { const text = await r.text(); notify(`Erreur ${r.status}: ${text}`, false); }
    } catch { notify("Impossible de contacter le serveur", false); }
  }

  // ── Article CRUD (avec gestion "Autre" pour catégorie) ──
  function resetArticleForm() {
    setEditingArticle(null); setArticleImageFile(null); setArticlePdfFile(null);
    setImagePreview(""); setPdfName("");
    setCategorieAutre(false);
    setCategoriePersonnalise("");
    setArticleForm({ titre: "", description: "", type: "article", categorie: "", duree_lecture: "", statut: "brouillon", image: "" });
  }

  function ouvrirEditionArticle(a: any) {
    setEditingArticle(a);
    setArticleForm({ titre: a.titre || "", description: a.description || "", type: a.type || "article", categorie: a.categorie || "", duree_lecture: a.duree_lecture || "", statut: a.statut || "brouillon", image: a.image || "" });
    if (a.image) setImagePreview(`${BASE}/uploads/articles-img/${a.image}`);
    if (a.pdf)   setPdfName(a.pdf);
    // Vérifier si la catégorie existe dans la liste prédéfinie
    if (a.categorie && !categoriesPredefinies.includes(a.categorie)) {
      setCategorieAutre(true);
      setCategoriePersonnalise(a.categorie);
    } else {
      setCategorieAutre(false);
      setCategoriePersonnalise("");
    }
    setShowArticleModal(true);
  }

  async function sauvegarderArticle(e: React.FormEvent) {
    e.preventDefault();
    // Déterminer la valeur finale de la catégorie
    let categorieFinale = articleForm.categorie;
    if (categorieAutre) {
      categorieFinale = categoriePersonnalise;
      if (!categorieFinale.trim()) {
        notify("Veuillez saisir un nom de catégorie personnalisé", false);
        return;
      }
    }
    const fd = new FormData();
    Object.entries(articleForm).forEach(([k, v]) => { if (v !== null && v !== undefined && k !== "categorie") fd.append(k, String(v)); });
    fd.append("categorie", categorieFinale);
    if (articleImageFile) fd.append("image", articleImageFile);
    if (articlePdfFile)   fd.append("pdf", articlePdfFile);
    const url = editingArticle ? `${BASE}/articles/admin/${editingArticle.id}` : `${BASE}/articles/admin/create`;
    const r = await fetch(url, { method: editingArticle ? "PUT" : "POST", headers: hdr(), body: fd });
    if (r.ok) { notify(editingArticle ? "✅ Modifié !" : "✅ Créé !"); setShowArticleModal(false); resetArticleForm(); loadArticles(); }
    else notify("Erreur", false);
  }

  async function publierArticle(id: number) { const r = await fetch(`${BASE}/articles/admin/${id}/publier`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("✅ Publié !"); loadArticles(); } else notify("Erreur", false); }
  async function supprimerArticle(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/articles/admin/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("Supprimé"); loadArticles(); } else notify("Erreur", false); }

  // ── Formation CRUD ──
  async function sauvegarderFormation(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formationForm).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, String(v)); });
    if (formationImageFile) fd.append("image", formationImageFile);
    const url = editingFormation ? `${BASE}/formations/admin/${editingFormation.id}` : `${BASE}/formations/admin/create`;
    const r = await fetch(url, { method: editingFormation ? "PUT" : "POST", headers: hdr(), body: fd });
    if (r.ok) { notify(editingFormation ? "✅ Modifié !" : "✅ Créé !"); setShowFormationModal(false); resetFormationForm(); loadFormations(); }
    else notify("Erreur", false);
  }

  async function publierFormation(id: number) { const r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (r.ok) { notify("✅ Formation publiée !"); loadFormations(); } else notify("Erreur", false); }
  async function archiverFormation(id: number) { const r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "archive" }) }); if (r.ok) { notify("📦 Formation archivée"); loadFormations(); } else notify("Erreur", false); }
  async function refuserFormation(id: number) { if (!confirm("Refuser et supprimer cette formation ?")) return; const r = await fetch(`${BASE}/formations/admin/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("❌ Formation refusée"); loadFormations(); } else notify("Erreur", false); }
  async function supprimerFormation(id: number) { if (!confirm("Supprimer définitivement ?")) return; const r = await fetch(`${BASE}/formations/admin/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("✅ Supprimé"); loadFormations(); } else notify("Erreur", false); }

  function resetFormationForm() {
    setEditingFormation(null); setFormationImageFile(null); setFormationImagePreview("");
    setFormationForm({ titre: "", description: "", domaine: "", formateur: "", type: "payant", prix: "", places_limitees: false, places_disponibles: "", duree: "", mode: "en_ligne", localisation: "", certifiante: false, statut: "brouillon", a_la_une: false, dateDebut: "", dateFin: "", niveau: "", lien_formation: "", gratuit: false });
  }

  // ── Compteurs sidebar ──
  const enAttenteExperts   = experts.filter(e => e.statut === "en_attente");
  const enAttenteStartups  = startups.filter(s => s.statut === "en_attente");
  const modificationsAtt   = experts.filter(e => e.modification_demandee);
  const temosAttente       = temoignages.filter(t => t.statut === "en_attente");
  const msgsNonLus         = contactMsgs.filter(m => !m.is_read).length;
  const brouillons         = articles.filter(a => a.statut === "brouillon").length;
  const formationsBrouillons = formations.filter(f => f.statut === "brouillon").length;
  const formationsEnAttente  = formations.filter(f => f.statut === "en_attente").length;
  const demandesEnAttente    = demandes.filter(d => d.statut === "en_attente").length;
  const totalNotifs = enAttenteExperts.length + enAttenteStartups.length + modificationsAtt.length + temosAttente.length + brouillons + formationsBrouillons + formationsEnAttente + msgsNonLus + demandesEnAttente;

  const filteredDemandes = demandes.filter(d => {
    const ms  = demandeStatutFilt  === "tous" || d.statut  === demandeStatutFilt;
    const msv = demandeServiceFilt === "tous" || d.service === demandeServiceFilt;
    return ms && msv;
  });

  const navItems: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "dashboard",   label: "Tableau de bord",  icon: "📊" },
    { id: "demandes",    label: "Demandes",          icon: "📋", count: demandesEnAttente },
    { id: "experts",     label: "Experts",           icon: "🎯", count: enAttenteExperts.length },
    { id: "startups",    label: "Startups",          icon: "🚀", count: enAttenteStartups.length },
    { id: "temoignages", label: "Témoignages",       icon: "⭐", count: temosAttente.length },
    { id: "contacts",    label: "Messages",          icon: "📩", count: msgsNonLus },
    { id: "histoire",    label: "Page À propos",     icon: "📖" },
    { id: "blog",        label: "Blog",              icon: "📝", count: brouillons },
    { id: "formations",  label: "Formations",        icon: "📚", count: formationsEnAttente + formationsBrouillons },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=DM+Mono:wght@400;500&display=swap');
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
        .btn-s{background:#F1F5F9;color:#475569;}.btn-s:hover{background:#E2E8F0;}
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
      `}</style>

      {/* Toast */}
      {toast.text && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.ok ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${toast.ok ? "#A7F3D0" : "#FECACA"}`, borderLeft: `4px solid ${toast.ok ? "#059669" : "#DC2626"}`, color: toast.ok ? "#059669" : "#DC2626", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 13, boxShadow: "0 8px 32px rgba(0,0,0,.12)", display: "flex", alignItems: "center", gap: 8 }}>
          {toast.text}
        </div>
      )}

      {/* Modal expert/startup details */}
      {selected && (
        <div className="modal-bg" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e: any) => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFE", position: "sticky", top: 0, borderRadius: "20px 20px 0 0" }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>{selected.type === "expert" ? "👤 Détails Expert" : "🚀 Détails Startup"}</span>
              <button className="btn btn-gray" style={{ padding: "5px 10px" }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: "14px 18px", background: "#F8FAFC", borderRadius: 14 }}>
                <Avatar nom={selected.data.user?.nom} prenom={selected.data.user?.prenom} photo={selected.data.photo} size={60} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#0A2540" }}>{selected.data.user?.prenom} {selected.data.user?.nom}</div>
                  <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{selected.data.user?.email}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {selected.data.statut === "en_attente" && <Badge color="yellow">⏳ En attente</Badge>}
                    {selected.data.statut === "valide"     && <Badge color="green">✅ Validé</Badge>}
                    {selected.data.statut === "refuse"     && <Badge color="red">❌ Refusé</Badge>}
                    {selected.data.modification_demandee   && <Badge color="yellow">⚠️ Modif demandée</Badge>}
                  </div>
                </div>
              </div>
              {selected.type === "expert" ? (
                <>
                  {[["Domaine", selected.data.domaine], ["Expérience", afficherExperience(selected.data)], ["Localisation", selected.data.localisation], ["Téléphone", selected.data.user?.telephone], ["Description", selected.data.description]].map(([l, v]) => (
                    <div key={l as string} className="info-row"><span className="info-lbl">{l}</span><span className="info-val">{v || "—"}</span></div>
                  ))}
                  <div className="info-row"><span className="info-lbl">CV</span><span className="info-val">{selected.data.cv ? <a href={`${BASE}/uploads/cv/${selected.data.cv}`} target="_blank" className="file-link">📄 CV</a> : <span style={{ color: "#B8C4D6" }}>Aucun</span>}</span></div>
                  <div className="info-row"><span className="info-lbl">Portfolio</span><span className="info-val">{selected.data.portfolio ? <a href={`${BASE}/uploads/portfolio/${selected.data.portfolio}`} target="_blank" className="file-link">📁 Portfolio</a> : <span style={{ color: "#B8C4D6" }}>Aucun</span>}</span></div>
                  {selected.data.modification_demandee && selected.data.modifications_en_attente && (
                    <div style={{ marginTop: 16, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: "#B45309", marginBottom: 10 }}>⚠️ Modifications en attente</div>
                      {(() => { try { return Object.entries(JSON.parse(selected.data.modifications_en_attente)).map(([k, v]) => (<div key={k} style={{ display: "flex", gap: 10, padding: "4px 0", fontSize: 13 }}><span style={{ color: "#92400E", fontWeight: 700, width: 100, flexShrink: 0 }}>{k}</span><span>{String(v)}</span></div>)); } catch { return null; } })()}
                      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        <button className="btn btn-green" onClick={() => { validerModification(selected.data.id); setSelected(null); }}>✅ Valider</button>
                        <button className="btn btn-red" onClick={() => { refuserModification(selected.data.id); setSelected(null); }}>❌ Refuser</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                [["Startup", selected.data.nom_startup], ["Secteur", selected.data.secteur], ["Taille", selected.data.taille], ["Fonction", selected.data.fonction], ["Site web", selected.data.site_web], ["Localisation", selected.data.localisation], ["Téléphone", selected.data.user?.telephone], ["Description", selected.data.description]].map(([l, v]) => (
                  <div key={l as string} className="info-row"><span className="info-lbl">{l}</span><span className="info-val">{v || "—"}</span></div>
                ))
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

      {/* Modal demande */}
      {selectedDemande && (
        <ModalDemande
          demande={selectedDemande}
          experts={experts}
          commentaireAdmin={commentaireAdmin}
          setCommentaireAdmin={setCommentaireAdmin}
          onChangerStatut={changerStatutDemande}
          onNotifierExperts={notifierExperts}
          onAssignerExpert={assignerExpert}
          onAccepterFormation={accepterFormationDemande}
          onRefuserFormation={refuserFormationDemande}
          onClose={() => { setSelectedDemande(null); setCommentaireAdmin(""); }}
        />
      )}

      {/* Modal réponse contact */}
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

      {/* Modal formation */}
      {showFormationModal && (
        <div className="modal-bg" onClick={() => { setShowFormationModal(false); resetFormationForm(); }}>
          <div className="modal" style={{ maxWidth: 720 }} onClick={(e: any) => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFE", position: "sticky", top: 0, borderRadius: "20px 20px 0 0" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{editingFormation ? "✏️ Modifier la formation" : "📚 Nouvelle formation"}</span>
              <button className="btn btn-gray" style={{ padding: "5px 10px" }} onClick={() => { setShowFormationModal(false); resetFormationForm(); }}>✕</button>
            </div>
            <form onSubmit={sauvegarderFormation} style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1/-1" }} className="fg"><label className="lbl">Titre *</label><input className="inp" required value={formationForm.titre} onChange={e => setFormationForm({ ...formationForm, titre: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Domaine *</label><select className="inp" required value={formationForm.domaine} onChange={e => setFormationForm({ ...formationForm, domaine: e.target.value })}><option value="">Sélectionner...</option>{["Marketing","Finance","IA & Digital","RH & Organisation","Stratégie","Management","Droit & Conformité","Entrepreneuriat"].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="fg"><label className="lbl">Formateur</label><input className="inp" value={formationForm.formateur} onChange={e => setFormationForm({ ...formationForm, formateur: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Mode</label><select className="inp" value={formationForm.mode} onChange={e => setFormationForm({ ...formationForm, mode: e.target.value })}><option value="en_ligne">💻 En ligne</option><option value="presentiel">🏢 Présentiel</option></select></div>
                <div className="fg"><label className="lbl">Statut</label><select className="inp" value={formationForm.statut} onChange={e => setFormationForm({ ...formationForm, statut: e.target.value })}><option value="brouillon">📝 Brouillon</option><option value="publie">✅ Publié</option><option value="archive">📦 Archivé</option></select></div>
                <div className="fg"><label className="lbl">Durée</label><input className="inp" value={formationForm.duree} onChange={e => setFormationForm({ ...formationForm, duree: e.target.value })} placeholder="Ex: 3 jours" /></div>
                <div className="fg"><label className="lbl">Niveau</label><select className="inp" value={formationForm.niveau} onChange={e => setFormationForm({ ...formationForm, niveau: e.target.value })}><option value="">Sélectionner...</option>{["Débutant","Intermédiaire","Avancé"].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                <div className="fg"><label className="lbl">Date début</label><input type="date" className="inp" value={formationForm.dateDebut} onChange={e => setFormationForm({ ...formationForm, dateDebut: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Date fin</label><input type="date" className="inp" value={formationForm.dateFin} onChange={e => setFormationForm({ ...formationForm, dateFin: e.target.value })} /></div>
                {formationForm.mode === "presentiel" && <div className="fg"><label className="lbl">Localisation</label><input className="inp" value={formationForm.localisation} onChange={e => setFormationForm({ ...formationForm, localisation: e.target.value })} /></div>}
                <div className="fg"><label className="lbl">Lien formation</label><input className="inp" value={formationForm.lien_formation} onChange={e => setFormationForm({ ...formationForm, lien_formation: e.target.value })} placeholder="https://..." /></div>
                <div className="fg"><label className="lbl">Type tarif</label><select className="inp" value={formationForm.type} onChange={e => setFormationForm({ ...formationForm, type: e.target.value })}><option value="gratuit">🎁 Gratuit</option><option value="payant">💰 Payant</option></select></div>
                {formationForm.type === "payant" && <div className="fg"><label className="lbl">Prix (DT)</label><input className="inp" value={formationForm.prix} onChange={e => setFormationForm({ ...formationForm, prix: e.target.value })} /></div>}
                <div className="fg"><label className="lbl">Options</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}><input type="checkbox" checked={formationForm.certifiante} onChange={e => setFormationForm({ ...formationForm, certifiante: e.target.checked })} /> Certifiante</label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}><input type="checkbox" checked={formationForm.places_limitees} onChange={e => setFormationForm({ ...formationForm, places_limitees: e.target.checked })} /> Places limitées</label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}><input type="checkbox" checked={formationForm.gratuit} onChange={e => setFormationForm({ ...formationForm, gratuit: e.target.checked })} /> Gratuite</label>
                  </div>
                </div>
                {formationForm.places_limitees && <div className="fg"><label className="lbl">Nb places</label><input className="inp" type="number" min="1" value={formationForm.places_disponibles} onChange={e => setFormationForm({ ...formationForm, places_disponibles: e.target.value })} /></div>}
                <div style={{ gridColumn: "1/-1" }} className="fg"><label className="lbl">Description *</label><textarea className="inp" required rows={4} value={formationForm.description} onChange={e => setFormationForm({ ...formationForm, description: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Image</label>
                  <label className="upload-zone">
                    <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setFormationImageFile(e.target.files[0]); setFormationImagePreview(URL.createObjectURL(e.target.files[0])); } }} style={{ display: "none" }} />
                    {formationImagePreview ? <img src={formationImagePreview} style={{ maxWidth: "100%", maxHeight: 80, borderRadius: 7 }} /> : <><div style={{ fontSize: 22 }}>🖼️</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Uploader une image</div></>}
                  </label>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                <button type="button" className="btn btn-gray" onClick={() => { setShowFormationModal(false); resetFormationForm(); }}>Annuler</button>
                <button type="submit" className="btn btn-green" style={{ padding: "9px 22px" }}>{editingFormation ? "💾 Modifier" : "✅ Créer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL ARTICLE — avec option "Autre" pour catégorie ══ */}
      {showArticleModal && (
        <div className="modal-bg" onClick={() => { setShowArticleModal(false); resetArticleForm(); }}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={(e: any) => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "20px 24px", borderRadius: "20px 20px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(247,181,0,.2)", border: "1.5px solid rgba(247,181,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📝</div>
                <div>
                  <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "1.5px" }}>Gestion du blog</div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>{editingArticle ? "Modifier l'article" : "Nouvel article"}</div>
                </div>
              </div>
              <button className="btn btn-gray" style={{ padding: "5px 10px", color: "#fff", background: "rgba(255,255,255,.12)" }} onClick={() => { setShowArticleModal(false); resetArticleForm(); }}>✕</button>
            </div>
            <form onSubmit={sauvegarderArticle} style={{ padding: "24px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Titre */}
                <div style={{ gridColumn: "1/-1" }} className="fg">
                  <label className="lbl">Titre *</label>
                  <input className="inp" required value={articleForm.titre} onChange={e => setArticleForm({ ...articleForm, titre: e.target.value })} placeholder="Titre de l'article" />
                </div>
                {/* Type */}
                <div className="fg">
                  <label className="lbl">Type</label>
                  <select className="inp" value={articleForm.type} onChange={e => setArticleForm({ ...articleForm, type: e.target.value })}>
                    <option value="article">Article</option>
                    <option value="conseil">Conseil</option>
                  </select>
                </div>
                {/* Catégorie (avec option "Autre") */}
                <div className="fg">
                  <label className="lbl">Catégorie</label>
                  <select className="inp" value={categorieAutre ? "Autre" : (articleForm.categorie || "")} onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Autre") {
                      setCategorieAutre(true);
                      setArticleForm({ ...articleForm, categorie: "" });
                    } else {
                      setCategorieAutre(false);
                      setArticleForm({ ...articleForm, categorie: val });
                      setCategoriePersonnalise("");
                    }
                  }}>
                    <option value="">Sélectionner une catégorie</option>
                    {categoriesPredefinies.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {categorieAutre && (
                    <input
                      type="text"
                      className="inp"
                      style={{ marginTop: 8 }}
                      placeholder="Saisissez votre catégorie personnalisée"
                      value={categoriePersonnalise}
                      onChange={(e) => setCategoriePersonnalise(e.target.value)}
                    />
                  )}
                </div>
                {/* Durée lecture */}
                <div className="fg">
                  <label className="lbl">Durée de lecture</label>
                  <input className="inp" value={articleForm.duree_lecture} onChange={e => setArticleForm({ ...articleForm, duree_lecture: e.target.value })} placeholder="5 min" />
                </div>
                {/* Statut */}
                <div className="fg">
                  <label className="lbl">Statut de publication</label>
                  <select className="inp" value={articleForm.statut} onChange={e => setArticleForm({ ...articleForm, statut: e.target.value })}>
                    <option value="brouillon">📝 Brouillon</option>
                    <option value="publie">✅ Publié</option>
                    <option value="archive">📦 Archivé</option>
                  </select>
                </div>
                {/* Description */}
                <div style={{ gridColumn: "1/-1" }} className="fg">
                  <label className="lbl">Description / Résumé *</label>
                  <textarea className="inp" required rows={3} value={articleForm.description} onChange={e => setArticleForm({ ...articleForm, description: e.target.value })} placeholder="Résumé visible dans la liste des articles..." />
                </div>
              </div>

              {/* Section fichiers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 4 }}>
                {/* Image de couverture */}
                <div>
                  <label className="lbl" style={{ marginBottom: 8 }}>Image de couverture</label>
                  <label className="upload-zone" style={{ minHeight: 110 }}>
                    <input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setArticleImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); } }} style={{ display: "none" }} />
                    {imagePreview
                      ? <img src={imagePreview} style={{ maxWidth: "100%", maxHeight: 90, borderRadius: 8, objectFit: "cover" }} />
                      : (
                        <>
                          <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#64748B" }}>Cliquer pour uploader</div>
                          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 3 }}>JPG, PNG, WEBP — max 5 Mo</div>
                        </>
                      )
                    }
                  </label>
                  {imagePreview && (
                    <button type="button" style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#DC2626", fontFamily: "inherit" }}
                      onClick={() => { setArticleImageFile(null); setImagePreview(""); }}>
                      🗑 Supprimer l'image
                    </button>
                  )}
                </div>

                {/* Fichier PDF */}
                <div>
                  <label className="lbl" style={{ marginBottom: 8 }}>Contenu de l'article (PDF)</label>
                  <label className="upload-zone" style={{ minHeight: 110 }}>
                    <input type="file" accept="application/pdf" onChange={e => { if (e.target.files?.[0]) { setArticlePdfFile(e.target.files[0]); setPdfName(e.target.files[0].name); } }} style={{ display: "none" }} />
                    {pdfName
                      ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                          <div style={{ fontSize: 32 }}>📄</div>
                          <div className="pdf-chip">{pdfName.length > 28 ? pdfName.slice(0, 26) + "…" : pdfName}</div>
                          <div style={{ fontSize: 11, color: "#94A3B8" }}>PDF sélectionné</div>
                        </div>
                      )
                      : (
                        <>
                          <div style={{ fontSize: 28, marginBottom: 6 }}>📄</div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "#64748B" }}>Uploader un PDF</div>
                          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 3 }}>Format PDF uniquement — max 20 Mo</div>
                        </>
                      )
                    }
                  </label>
                  {pdfName && (
                    <button type="button" style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#DC2626", fontFamily: "inherit" }}
                      onClick={() => { setArticlePdfFile(null); setPdfName(""); }}>
                      🗑 Retirer le PDF
                    </button>
                  )}
                  {editingArticle?.pdf && !pdfName && (
                    <a href={`${BASE}/uploads/articles-pdf/${editingArticle.pdf}`} target="_blank" className="file-link" style={{ marginTop: 8, display: "inline-flex" }}>
                      📄 Voir le PDF actuel
                    </a>
                  )}
                </div>
              </div>

              <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 12, padding: "12px 16px", marginTop: 18, fontSize: 13, color: "#0369A1" }}>
                💡 Le PDF contiendra le contenu complet de l'article. Il sera consultable par les membres après publication.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-gray" onClick={() => { setShowArticleModal(false); resetArticleForm(); }}>Annuler</button>
                <button type="submit" className="btn btn-green" style={{ padding: "9px 22px" }}>{editingArticle ? "💾 Enregistrer" : "✅ Créer l'article"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Layout principal avec sidebar */}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <aside style={{ width: sideCollapsed ? 64 : 230, background: "#0A2540", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0, transition: "width .22s cubic-bezier(.22,1,.36,1)", overflow: "hidden" }}>
          <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#F7B500", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#0A2540", fontSize: 11, flexShrink: 0 }}>BEH</div>
            {!sideCollapsed && <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 13.5, lineHeight: 1.2 }}>Espace Admin</div><div style={{ color: "rgba(255,255,255,.35)", fontSize: 10.5 }}>Business Expert Hub</div></div>}
          </div>
          <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
            {navItems.map(item => {
              const isActive = tab === item.id;
              return (
                <button key={item.id} onClick={() => setTab(item.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#F7B500" : "rgba(255,255,255,.55)", background: isActive ? "rgba(247,181,0,.12)" : "transparent", transition: "all .16s", marginBottom: 2, justifyContent: sideCollapsed ? "center" : "flex-start", position: "relative", textAlign: "left" as const }}>
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
            <button onClick={() => setSideCollapsed(!sideCollapsed)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: sideCollapsed ? "center" : "flex-start", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.4)", background: "transparent", marginBottom: 4 }}><span style={{ fontSize: 16 }}>{sideCollapsed ? "→" : "←"}</span>{!sideCollapsed && <span>Réduire</span>}</button>
            <button onClick={() => { if (typeof window !== "undefined") { localStorage.clear(); router.push("/"); } }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: sideCollapsed ? "center" : "flex-start", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.4)", background: "transparent" }}><span style={{ fontSize: 16 }}>🚪</span>{!sideCollapsed && <span>Déconnexion</span>}</button>
          </div>
        </aside>

        {/* Contenu principal */}
        <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          {/* Topbar */}
          <div style={{ background: "#fff", borderBottom: "1px solid #EEF2F7", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>{navItems.find(n => n.id === tab)?.icon} {navItems.find(n => n.id === tab)?.label}</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {totalNotifs > 0 && <div style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid #FDE68A", borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>🔔 {totalNotifs} notification{totalNotifs > 1 ? "s" : ""}</div>}
              <button className="btn btn-gray" style={{ fontSize: 12 }} onClick={() => { loadAll(); loadDemandes(); loadArticles(); loadFormations(); loadContactMessages(); }}>🔄 Actualiser</button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 80, textAlign: "center", color: "#8A9AB5", fontSize: 15 }}>⏳ Chargement...</div>
          ) : (
            <>
              {tab === "dashboard" && <DashboardView experts={experts} startups={startups} temoignages={temoignages} demandes={demandes} formations={formations} setTab={setTab} />}

              {/* Demandes */}
              {tab === "demandes" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>📋 Demandes de services</h2>
                      <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{filteredDemandes.length} demande{filteredDemandes.length > 1 ? "s" : ""} · {demandesEnAttente} en attente</div>
                    </div>
                    <button className="btn btn-gray" onClick={loadDemandes} style={{ fontSize: 12 }}>🔄 Rafraîchir</button>
                  </div>
                  <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8A9AB5", textTransform: "uppercase" as const, marginBottom: 8 }}>Statut</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {[{ v: "tous", l: "Tous" }, { v: "en_attente", l: "⏳ En attente" }, { v: "acceptee", l: "✅ Acceptées" }, { v: "en_cours", l: "🔄 En cours" }, { v: "terminee", l: "✅ Terminées" }, { v: "refusee", l: "❌ Refusées" }].map(f => (
                            <button key={f.v} className={`pill-f${demandeStatutFilt === f.v ? " on" : ""}`} onClick={() => setDemandeStatutFilt(f.v)}>{f.l}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#8A9AB5", textTransform: "uppercase" as const, marginBottom: 8 }}>Service</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {[{ v: "tous", l: "Tous" }, ...Object.entries(SERVICE_META).filter(([k]) => k !== "formation").map(([v, m]) => ({ v, l: m.label }))].map(f => (
                            <button key={f.v} className={`pill-f${demandeServiceFilt === f.v ? " on" : ""}`} onClick={() => setDemandeServiceFilt(f.v)}>{f.l}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {filteredDemandes.length === 0
                    ? <div className="card" style={{ padding: "60px 0", textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📋</div><div style={{ fontWeight: 600, fontSize: 15 }}>Aucune demande</div></div>
                    : filteredDemandes.map((d: any) => {
                      const meta = SERVICE_META[d.service] || { label: d.service || "Personnalisé", icon: "✍️", color: "#6B7280", domaines: [] };
                      const isFormation = d.service === "formation" || d.service === "formations";
                      const nbAcceptes = d.experts_acceptes?.length || 0;
                      const nbNotifies = d.experts_notifies?.length || 0;
                      return (
                        <div key={d.id} className="card" style={{ borderLeft: `4px solid ${d.statut === "en_attente" ? "#F7B500" : d.statut === "acceptee" || d.statut === "terminee" ? "#10B981" : d.statut === "en_cours" ? "#3B82F6" : "#9CA3AF"}`, padding: "18px 20px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                                <div style={{ width: 42, height: 42, borderRadius: 11, background: `${meta.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{meta.icon}</div>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 14.5, color: "#0A2540" }}>{meta.label}</div>
                                  <div style={{ fontSize: 12, color: "#64748B" }}>
                                    {d.user?.prenom} {d.user?.nom}
                                    {d.user?.startup?.nom_startup && <span style={{ marginLeft: 6, fontWeight: 600, color: "#0A2540" }}>🏢 {d.user.startup.nom_startup}</span>}
                                    <span style={{ marginLeft: 6 }}>· {new Date(d.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
                                  </div>
                                </div>
                              </div>
                              {isFormation && d.formation && (
                                <div style={{ marginBottom: 8 }}>
                                  <span style={{ background: "#F3E8FF", color: "#7C3AED", borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>🎓 {d.formation.titre}</span>
                                  {d.formation.places_limitees && (
                                    <span style={{ marginLeft: 8, background: (d.formation.places_disponibles ?? 0) > 0 ? "#ECFDF5" : "#FEF2F2", color: (d.formation.places_disponibles ?? 0) > 0 ? "#059669" : "#DC2626", borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
                                      🎟️ {d.formation.places_disponibles ?? 0} place(s)
                                    </span>
                                  )}
                                </div>
                              )}
                              {d.description && <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{d.description}</p>}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 8 }}>
                                {d.delai    && <Badge color="green">⏱ {d.delai}</Badge>}
                                {d.telephone && <Badge color="yellow">📞 {d.telephone}</Badge>}
                                {d.expert_assigne && <Badge color="teal">👤 {d.expert_assigne?.user?.prenom} {d.expert_assigne?.user?.nom}</Badge>}
                                {SERVICES_AVEC_EXPERT.includes(d.service) && nbNotifies > 0 && <Badge color="blue">📬 {nbNotifies} notifié(s)</Badge>}
                                {SERVICES_AVEC_EXPERT.includes(d.service) && nbAcceptes > 0 && <Badge color="orange">🎯 {nbAcceptes} acceptation(s)</Badge>}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                              <Badge color={d.statut === "en_attente" ? "yellow" : d.statut === "acceptee" || d.statut === "terminee" ? "green" : d.statut === "en_cours" ? "blue" : "red"}>
                                {d.statut === "en_attente" ? "⏳ En attente" : d.statut === "acceptee" ? "✅ Acceptée" : d.statut === "en_cours" ? "🔄 En cours" : d.statut === "terminee" ? "✅ Terminée" : "❌ Refusée"}
                              </Badge>
                              <button className="btn btn-blue" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => { setSelectedDemande(d); setCommentaireAdmin(d.commentaire_admin || ""); }}>⚙️ Gérer</button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              )}

              {/* Experts */}
              {tab === "experts" && (
                <div style={{ padding: "24px 28px" }}>
                  {modificationsAtt.length > 0 && (
                    <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 14, padding: "18px 22px", marginBottom: 18 }}>
                      <div style={{ fontWeight: 700, color: "#B45309", fontSize: 14, marginBottom: 12 }}>⚠️ Modifications en attente ({modificationsAtt.length})</div>
                      {modificationsAtt.map((e: any) => (
                        <div key={e.id} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar nom={e.user?.nom} prenom={e.user?.prenom} photo={e.photo} size={38} />
                            <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{e.user?.prenom} {e.user?.nom}</div><div style={{ fontSize: 11, color: "#8A9AB5" }}>{e.user?.email}</div></div>
                          </div>
                          <div style={{ display: "flex", gap: 7 }}>
                            <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => validerModification(e.id)}>✅ Valider</button>
                            <button className="btn btn-red"   style={{ fontSize: 12 }} onClick={() => refuserModification(e.id)}>❌ Refuser</button>
                            <button className="btn btn-blue"  style={{ fontSize: 12 }} onClick={() => setSelected({ type: "expert", data: e })}>👁 Détails</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><span style={{ fontWeight: 700, fontSize: 14.5 }}>🎯 Experts ({experts.length}) · {enAttenteExperts.length} en attente</span></div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th>Expert</th>
                          <th>Email</th>
                          <th>Domaine</th>
                          <th>Localisation</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {experts.length === 0 && (
                          <tr>
                            <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>
                              Aucun expert
                            </td>
                          </tr>
                        )}
                        {experts.length > 0 && experts.map((e: any) => (
                          <tr key={e.id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Avatar nom={e.user?.nom} prenom={e.user?.prenom} photo={e.photo} size={32} />
                                <span style={{ fontWeight: 600 }}>{e.user?.prenom} {e.user?.nom}</span>
                              </div>
                            </td>
                            <td style={{ color: "#64748B" }}>{e.user?.email}</td>
                            <td>{e.domaine || "—"}</td>
                            <td>{e.localisation || "—"}</td>
                            <td>
                              {e.statut === "valide" ? (
                                <Badge color="green">✅ Validé</Badge>
                              ) : e.statut === "en_attente" ? (
                                <Badge color="yellow">⏳ Attente</Badge>
                              ) : (
                                <Badge color="red">❌ Refusé</Badge>
                              )}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  className="btn btn-blue"
                                  style={{ fontSize: 12, padding: "5px 11px" }}
                                  onClick={() => setSelected({ type: "expert", data: e })}
                                >
                                  👁 Voir
                                </button>
                                {e.statut === "en_attente" && (
                                  <>
                                    <button
                                      className="btn btn-green"
                                      style={{ fontSize: 12, padding: "5px 9px" }}
                                      onClick={() => valider("experts", e.id)}
                                    >
                                      ✅
                                    </button>
                                    <button
                                      className="btn btn-red"
                                      style={{ fontSize: 12, padding: "5px 9px" }}
                                      onClick={() => refuser("experts", e.id)}
                                    >
                                      ❌
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Startups */}
              {tab === "startups" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><span style={{ fontWeight: 700, fontSize: 14.5 }}>🚀 Startups ({startups.length}) · {enAttenteStartups.length} en attente</span></div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th>Responsable</th>
                          <th>Email</th>
                          <th>Startup</th>
                          <th>Secteur</th>
                          <th>Taille</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {startups.length === 0 && (
                          <tr>
                            <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>
                              Aucune startup
                            </td>
                          </tr>
                        )}
                        {startups.length > 0 && startups.map((s: any) => (
                          <tr key={s.id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Avatar nom={s.user?.nom} prenom={s.user?.prenom} size={32} />
                                <span style={{ fontWeight: 600 }}>{s.user?.prenom} {s.user?.nom}</span>
                              </div>
                            </td>
                            <td style={{ color: "#64748B" }}>{s.user?.email}</td>
                            <td style={{ fontWeight: 600 }}>{s.nom_startup || "—"}</td>
                            <td>{s.secteur || "—"}</td>
                            <td>{s.taille || "—"}</td>
                            <td>
                              {s.statut === "valide" ? (
                                <Badge color="green">✅ Validé</Badge>
                              ) : s.statut === "en_attente" ? (
                                <Badge color="yellow">⏳ Attente</Badge>
                              ) : (
                                <Badge color="red">❌ Refusé</Badge>
                              )}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  className="btn btn-blue"
                                  style={{ fontSize: 12, padding: "5px 11px" }}
                                  onClick={() => setSelected({ type: "startup", data: s })}
                                >
                                  👁 Voir
                                </button>
                                {s.statut === "en_attente" && (
                                  <>
                                    <button
                                      className="btn btn-green"
                                      style={{ fontSize: 12, padding: "5px 9px" }}
                                      onClick={() => valider("startups", s.id)}
                                    >
                                      ✅
                                    </button>
                                    <button
                                      className="btn btn-red"
                                      style={{ fontSize: 12, padding: "5px 9px" }}
                                      onClick={() => refuser("startups", s.id)}
                                    >
                                      ❌
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Témoignages */}
              {tab === "temoignages" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                    <div><h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>⭐ Témoignages ({temoignages.length})</h2><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{temosAttente.length} en attente · {temoignages.filter((t: any) => t.statut === "valide").length} publiés</div></div>
                  </div>
                  {temoignages.length === 0 ? <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 16, padding: "60px 0", textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div><div style={{ fontWeight: 600 }}>Aucun témoignage</div></div> : temoignages.map((t: any) => (
                    <div key={t.id} style={{ background: "#fff", border: `1.5px solid ${t.statut === "en_attente" ? "#FDE68A" : t.statut === "valide" ? "#A7F3D0" : "#E5E7EB"}`, borderLeft: `4px solid ${t.statut === "en_attente" ? "#F7B500" : t.statut === "valide" ? "#10B981" : "#D1D5DB"}`, borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <Avatar nom={t.user?.nom} prenom={t.user?.prenom} size={38} />
                            <div><div style={{ fontWeight: 700, fontSize: 14 }}>{t.user?.prenom} {t.user?.nom}</div><div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= (t.note || 5) ? "#F7B500" : "#D1D5DB", fontSize: 14 }}>★</span>)}<span style={{ fontSize: 11, color: "#94A3B8" }}>· {new Date(t.createdAt).toLocaleDateString("fr-FR")}</span></div></div>
                          </div>
                          <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px" }}><p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.72, fontStyle: "italic", margin: 0 }}>"{t.texte}"</p></div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end", flexShrink: 0 }}>
                          {t.statut === "en_attente" && <Badge color="yellow">⏳ En attente</Badge>}
                          {t.statut === "valide"     && <Badge color="green">✅ Publié</Badge>}
                          {t.statut === "refuse"     && <Badge color="red">❌ Refusé</Badge>}
                          <div style={{ display: "flex", gap: 6 }}>
                            {t.statut === "en_attente" && <><button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => validerTemo(t.id)}>✅ Publier</button><button className="btn btn-red" style={{ fontSize: 12 }} onClick={() => refuserTemo(t.id)}>❌</button></>}
                            <button className="btn btn-gray" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => supprimerTemo(t.id)}>🗑</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Contacts */}
              {tab === "contacts" && (
                <div style={{ padding: "24px 28px" }}>
                  <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540", marginBottom: 20 }}>📩 Messages reçus ({contactMsgs.length}) · {msgsNonLus} non lus</h2>
                  {contactMsgs.length === 0 ? <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 16, padding: "60px 0", textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📭</div><div style={{ fontWeight: 600 }}>Aucun message</div></div> : contactMsgs.map((msg: any) => (
                    <div key={msg.id} style={{ background: "#fff", border: `1.5px solid ${msg.is_read ? "#EEF2F7" : "#FDE68A"}`, borderLeft: `4px solid ${msg.is_read ? "#E2E8F0" : "#F7B500"}`, borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}><div style={{ width: 42, height: 42, borderRadius: "50%", background: "#0A2540", color: "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17 }}>{msg.prenom?.[0]?.toUpperCase() || "?"}</div><div><div style={{ fontWeight: 700, fontSize: 14.5 }}>{msg.prenom} {msg.nom}</div><div style={{ fontSize: 12, color: "#8A9AB5" }}>{msg.email}</div></div>{!msg.is_read && <Badge color="yellow">NOUVEAU</Badge>}</div>
                          <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}><div style={{ fontSize: 12, color: "#64748B", marginBottom: 5 }}>📌 <strong>{msg.sujet}</strong></div><p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.7, margin: 0 }}>{msg.message}</p></div>
                          <div style={{ fontSize: 11, color: "#B8C4D6" }}>{new Date(msg.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
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

              {/* Histoire */}
              {tab === "histoire" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                    <div><h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>📖 Page "À propos"</h2><p style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>Contenu synchronisé avec la base de données</p></div>
                  </div>
                  <form onSubmit={saveHistoire} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {[
                      { title: "🏠 Section Héro", content: (<><div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14 }}><HField label="Année de création" cle="annee_creation" hf={hf} setHF={setHF} placeholder="2019" /></div><HField label="Description héro" cle="description_hero" rows={3} hf={hf} setHF={setHF} /></>) },
                      { title: "👁 Vision", content: (<><HField label="Description vision" cle="description_vision" rows={3} hf={hf} setHF={setHF} /><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>{[1, 2, 3, 4].map(n => <HField key={n} label={`Point ${n}`} cle={`vision_point${n}`} hf={hf} setHF={setHF} />)}</div></>) },
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
                      <div style={{ padding: "16px 20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{[1, 2, 3, 4, 5, 6].map(n => (
                          <div key={n} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", border: "1px solid #EEF2F7" }}>
                            <div style={{ fontWeight: 700, color: "#F7B500", marginBottom: 10, fontSize: 12 }}>Étape {n}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 10, marginBottom: 10 }}><HField label="Année" cle={`timeline${n}_year`} hf={hf} setHF={setHF} /><HField label="Titre" cle={`timeline${n}_title`} hf={hf} setHF={setHF} /></div>
                            <HField label="Description" cle={`timeline${n}_desc`} rows={2} hf={hf} setHF={setHF} />
                          </div>
                        ))}</div>
                      </div>
                    </div>
                    <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
                      <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><span style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>⭐ Valeurs — 3 valeurs</span></div>
                      <div style={{ padding: "16px 20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>{[1, 2, 3].map(n => (
                          <div key={n} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", border: "1px solid #EEF2F7" }}>
                            <div style={{ fontWeight: 700, color: "#F7B500", marginBottom: 10, fontSize: 12 }}>Valeur {n}</div>
                            <HField label="Titre" cle={`valeur${n}_titre`} hf={hf} setHF={setHF} />
                            <HField label="Description" cle={`valeur${n}_desc`} rows={3} hf={hf} setHF={setHF} />
                            <div style={{ marginBottom: 12 }}>
                              <label style={{ fontSize: 11, fontWeight: 700, color: "#7D8FAA", textTransform: "uppercase" as const, letterSpacing: "1px", display: "block", marginBottom: 5 }}>Couleur</label>
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><input className="inp" value={hf(`valeur${n}_color`)} onChange={e => setHF(`valeur${n}_color`, (e.target as any).value)} placeholder="#F7B500" style={{ flex: 1 }} /><input type="color" value={hf(`valeur${n}_color`) || "#F7B500"} onChange={e => setHF(`valeur${n}_color`, (e.target as any).value)} style={{ width: 38, height: 34, borderRadius: 8, border: "1.5px solid #E2E8F0", cursor: "pointer", padding: 2 }} /></div>
                            </div>
                          </div>
                        ))}</div>
                      </div>
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

              {/* Blog */}
              {tab === "blog" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                    <div><h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>📝 Blog ({articles.length})</h2><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{articles.filter((a: any) => a.statut === "publie").length} publiés · {brouillons} brouillons</div></div>
                    <button className="btn btn-green" style={{ padding: "9px 20px" }} onClick={() => { resetArticleForm(); setShowArticleModal(true); }}>📝 Nouvel article</button>
                  </div>
                  {articles.length === 0
                    ? <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 16, padding: "60px 0", textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📝</div><div style={{ fontWeight: 600 }}>Aucun article</div></div>
                    : articles.map((a: any) => (
                      <div key={a.id} style={{ background: "#fff", border: `1.5px solid ${a.statut === "publie" ? "#A7F3D0" : "#EEF2F7"}`, borderLeft: `4px solid ${a.statut === "publie" ? "#10B981" : "#94A3B8"}`, borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540", marginBottom: 7 }}>{a.titre}</div>
                            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                              <Badge color="blue">{a.type}</Badge>
                              {a.categorie && <Badge color="gray">{a.categorie}</Badge>}
                              {a.duree_lecture && <Badge color="gray">⏱ {a.duree_lecture}</Badge>}
                              {a.pdf && <Badge color="orange">📄 PDF joint</Badge>}
                            </div>
                            {a.description && <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65, marginBottom: 6 }}>{a.description}</p>}
                            <div style={{ fontSize: 11, color: "#B8C4D6" }}>{new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} · {a.vues || 0} vues</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end", flexShrink: 0 }}>
                            {a.statut === "publie"    && <Badge color="green">✅ Publié</Badge>}
                            {a.statut === "brouillon" && <Badge color="yellow">📝 Brouillon</Badge>}
                            {a.statut === "archive"   && <Badge color="gray">📦 Archivé</Badge>}
                            <div style={{ display: "flex", gap: 6 }}>
                              {a.statut === "brouillon" && <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => publierArticle(a.id)}>✅ Publier</button>}
                              <button className="btn btn-blue" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => ouvrirEditionArticle(a)}>✏️</button>
                              <button className="btn btn-red"  style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => supprimerArticle(a.id)}>🗑</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* Formations */}
              {tab === "formations" && (
                <div style={{ padding: "24px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0A2540" }}>📚 Formations ({formations.length})</h2>
                      <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>
                        {formations.filter((f: any) => f.statut === "publie").length} publiées · {formations.filter((f: any) => f.statut === "en_attente").length} en attente · {formations.filter((f: any) => f.statut === "brouillon").length} brouillons
                      </div>
                    </div>
                    <button className="btn btn-green" style={{ padding: "9px 20px" }} onClick={() => { resetFormationForm(); setShowFormationModal(true); }}>📚 Nouvelle formation</button>
                  </div>
                  {formations.length === 0
                    ? <div style={{ background: "#fff", border: "1.5px solid #EEF2F7", borderRadius: 16, padding: "60px 0", textAlign: "center", color: "#94A3B8" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📚</div><div style={{ fontWeight: 600 }}>Aucune formation</div></div>
                    : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        {formations.map((f: any) => {
                          const borderColor = f.statut === "publie" ? "#A7F3D0" : f.statut === "en_attente" ? "#FDE68A" : f.statut === "brouillon" ? "#FDE68A" : "#D1D5DB";
                          const barColor   = f.statut === "publie" ? "#10B981" : f.statut === "en_attente" ? "#F7B500" : "#94A3B8";
                          return (
                            <div key={f.id} style={{ background: "#fff", border: `1.5px solid ${borderColor}`, borderRadius: 14, overflow: "hidden" }}>
                              <div style={{ height: 4, background: barColor }} />
                              <div style={{ padding: "16px 18px" }}>
                                <div style={{ display: "flex", gap: 12 }}>
                                  {f.image && <img src={`${BASE}/uploads/formations/${f.image}`} style={{ width: 76, height: 76, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} onError={(e: any) => e.currentTarget.style.display = "none"} />}
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                                      {f.statut === "publie"     && <Badge color="green">✅ Publiée</Badge>}
                                      {f.statut === "en_attente" && <Badge color="yellow">📝 En attente (expert)</Badge>}
                                      {f.statut === "brouillon"  && <Badge color="yellow">📝 Brouillon</Badge>}
                                      {f.statut === "archive"    && <Badge color="gray">📦 Archivée</Badge>}
                                      {f.certifiante             && <Badge color="purple">🎓 Certifiante</Badge>}
                                      {f.expertId                && <Badge color="teal">👤 Expert</Badge>}
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>{f.titre}</div>
                                    {f.domaine    && <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>📁 {f.domaine}</div>}
                                    {f.formateur  && <div style={{ fontSize: 12, color: "#64748B" }}>👨‍🏫 {f.formateur}</div>}
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 6 }}>
                                      {f.gratuit ? <span style={{ fontSize: 11, color: "#22C55E" }}>🎁 Gratuit</span> : f.prix && <span style={{ fontSize: 11, color: "#F7B500" }}>💰 {f.prix} DT</span>}
                                      {f.duree && <span style={{ fontSize: 11, color: "#64748B" }}>⏱ {f.duree}</span>}
                                      {f.places_limitees
                                        ? <span style={{ fontSize: 11, fontWeight: 700, color: (f.places_disponibles ?? 0) > 0 ? "#22C55E" : "#EF4444" }}>🎟️ {f.places_disponibles ?? 0} place(s)</span>
                                        : <span style={{ fontSize: 11, color: "#64748B" }}>🎟️ Illimitées</span>
                                      }
                                    </div>
                                  </div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                                  {f.statut === "en_attente" && (
                                    <>
                                      <button className="btn btn-green" onClick={() => publierFormation(f.id)}>✅ Publier</button>
                                      <button className="btn btn-red"   onClick={() => refuserFormation(f.id)}>❌ Refuser</button>
                                    </>
                                  )}
                                  {f.statut === "brouillon" && <button className="btn btn-green" onClick={() => publierFormation(f.id)}>✅ Publier</button>}
                                  {f.statut === "publie"    && <button className="btn btn-gray"  onClick={() => archiverFormation(f.id)}>📦 Archiver</button>}
                                  <button className="btn btn-blue" onClick={() => {
                                    setEditingFormation(f);
                                    setFormationForm({ titre: f.titre || "", description: f.description || "", domaine: f.domaine || "", formateur: f.formateur || "", type: f.type || "payant", prix: f.prix || "", places_limitees: f.places_limitees || false, places_disponibles: f.places_disponibles || "", duree: f.duree || "", mode: f.mode || "en_ligne", localisation: f.localisation || "", certifiante: f.certifiante || false, statut: f.statut || "brouillon", a_la_une: f.a_la_une || false, dateDebut: f.dateDebut || "", dateFin: f.dateFin || "", niveau: f.niveau || "", lien_formation: f.lien_formation || "", gratuit: f.gratuit || false });
                                    if (f.image) setFormationImagePreview(`${BASE}/uploads/formations/${f.image}`);
                                    setShowFormationModal(true);
                                  }}>✏️ Modifier</button>
                                  <button className="btn btn-red" onClick={() => supprimerFormation(f.id)}>🗑</button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  }
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}