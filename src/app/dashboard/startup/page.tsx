"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaArrowRight, FaQuoteLeft, FaChevronLeft, FaChevronRight,
  FaBullseye, FaRocket, FaGraduationCap, FaSearch, FaPaperPlane,
  FaCheck, FaCamera, FaComments, FaCalendar, FaStar, FaCheckCircle,
  FaChartLine, FaSearchPlus, FaDesktop, FaPlay, FaMicrophone,
  FaUsers, FaClock, FaCertificate, FaExternalLinkAlt, FaTimes,
  FaMobile, FaLaptopCode, FaEdit, FaTrash, FaSave, FaHeadphones,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaLinkedin, FaGlobe,
  FaBriefcase, FaShieldAlt, FaAward, FaCheckDouble, FaSpinner,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

const SERVICES_INFO: Record<string, any> = {
  consulting: {
    label: "Consulting Stratégique", icon: <FaChartLine />, color: "#3B82F6", badge: "Stratégie",
    desc: "Structurez et optimisez votre entreprise pour améliorer votre performance globale.",
    duree: "2 à 8 semaines",
    points: ["Audit stratégique complet", "Business model review", "Roadmap actionnable", "Suivi mensuel inclus"],
  },
  "audit-sur-site": {
    label: "Audit sur Site", icon: <FaSearchPlus />, color: "#8B5CF6", badge: "Terrain",
    desc: "Nos experts se déplacent dans vos locaux pour un diagnostic terrain approfondi.",
    duree: "1 à 5 jours",
    points: ["Diagnostic terrain", "Analyse processus", "Rapport détaillé", "Plan d'action prioritaire"],
  },
  formations: {
    label: "Formations & Podcasts", icon: <FaGraduationCap />, color: "#F59E0B", badge: "Certif.",
    desc: "Programmes certifiants sur mesure + podcasts exclusifs avec des experts.",
    duree: "1 jour à 3 mois",
    points: ["Contenu sur mesure", "Formateurs certifiés", "Certification incluse", "Support post-formation"],
  },
  "nos-plateformes": {
    label: "Nos Plateformes", icon: <FaDesktop />, color: "#10B981", badge: "Digital",
    desc: "Solutions digitales sur mesure : applications web et mobile.",
    duree: "4 à 16 semaines",
    points: ["Application Web", "Application Mobile", "Support & maintenance"],
  },
};

const PLATFORM_TYPES = [
  { id: "web-app", label: "Application Web", icon: <FaLaptopCode />, color: "#8B5CF6", desc: "Plateforme web sur mesure, tableau de bord, portail client" },
  { id: "mobile", label: "Application Mobile", icon: <FaMobile />, color: "#F59E0B", desc: "iOS & Android, app native ou cross-platform" },
];

const MODE_LABELS: Record<string, { label: string; color: string }> = {
  presentiel: { label: "Présentiel", color: "#3B82F6" },
  en_ligne: { label: "En ligne", color: "#10B981" },
  hybride: { label: "Hybride", color: "#8B5CF6" },
};

const ADN_ITEMS = [
  { title: "Notre Vision", body: "Devenir la référence absolue en accompagnement de startups innovantes.", color: "#3B82F6", anchor: "vision" },
  { title: "Notre Mission", body: "Offrir aux startups un accès privilégié à des experts certifiés.", color: "#F59E0B", anchor: "mission" },
  { title: "Nos Valeurs", body: "Excellence, transparence et engagement humain.", color: "#10B981", anchor: "valeurs" },
];

// ─── STATUTS DEMANDES ─────────────────────────────────────────────────────────
const S_COLOR: Record<string, string> = {
  en_attente: "#F59E0B",
  valide: "#10B981",
  refuse: "#EF4444",
  confirme: "#10B981",
  annule: "#EF4444",
  acceptee: "#10B981",
  en_cours: "#3B82F6",
  terminee: "#10B981",
  refusee: "#EF4444",
};

const S_LABEL: Record<string, string> = {
  en_attente: "⏳ En attente",
  valide: "✅ Validé",
  refuse: "❌ Refusé",
  confirme: "✅ Confirmé",
  annule: "❌ Annulé",
  acceptee: "✅ Acceptée",
  en_cours: "🔄 Expert en cours de sélection",
  terminee: "✅ Terminée",
  refusee: "❌ Refusée",
};

const DOMAINES_LIST = [
  "Marketing Digital", "Finance / Comptabilité", "Ressources Humaines",
  "Développement Web / Mobile", "Design UI/UX", "Stratégie Commerciale",
  "Logistique / Supply Chain", "Intelligence Artificielle / Data", "Autre",
];

type Tab = "accueil" | "services" | "profil" | "experts" | "rdv" | "messages" | "temoignages" | "mes-demandes" | "mes-devis";

function useInView(thr = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: thr });
    o.observe(el);
    return () => o.disconnect();
  }, [thr]);
  return [ref, v] as const;
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(32px)", transition: `opacity .75s cubic-bezier(.22,1,.36,1) ${delay}s, transform .75s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

// ─── BADGE STATUT RDV ─────────────────────────────────────────────────────────
function RdvStatusBadge({ statut }: { statut: string }) {
  const configs: Record<string, { bg: string; color: string; border: string; icon: string; label: string }> = {
    en_attente: { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A", icon: "⏳", label: "En attente" },
    confirme:   { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7", icon: "✅", label: "Confirmé" },
    annule:     { bg: "#FEF2F2", color: "#7F1D1D", border: "#FCA5A5", icon: "✕", label: "Annulé" },
    refuse:     { bg: "#FEF2F2", color: "#7F1D1D", border: "#FCA5A5", icon: "✕", label: "Refusé" },
  };
  const c = configs[statut] || { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1", icon: "•", label: statut };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 99, padding: "5px 13px", fontSize: 12, fontWeight: 700, letterSpacing: "0.3px" }}>
      <span style={{ fontSize: 11 }}>{c.icon}</span> {c.label}
    </span>
  );
}

// ─── BADGE STATUT DEVIS ───────────────────────────────────────────────────────
function DevisStatusBadge({ statut }: { statut: string }) {
  const configs: Record<string, { bg: string; color: string; border: string; label: string; dot: string }> = {
    en_attente: { bg: "linear-gradient(135deg,#FFFBEB,#FEF3C7)", color: "#92400E", border: "#FDE68A", label: "En attente de réponse", dot: "#F59E0B" },
    accepte:    { bg: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", color: "#065F46", border: "#6EE7B7", label: "Devis accepté", dot: "#10B981" },
    refuse:     { bg: "linear-gradient(135deg,#FEF2F2,#FEE2E2)", color: "#7F1D1D", border: "#FCA5A5", label: "Devis refusé", dot: "#EF4444" },
  };
  const c = configs[statut] || { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1", label: statut, dot: "#94A3B8" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 99, padding: "6px 14px", fontSize: 12.5, fontWeight: 700 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, display: "inline-block", flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

// ─── CARTE EXPERT DANS DEVIS ─────────────────────────────────────────────────
function ExpertMiniCard({ expert, BASE }: { expert: any; BASE: string }) {
  if (!expert) return null;
  const user = expert.user || {};
  return (
    <div style={{ background: "linear-gradient(135deg,#0A2540 0%,#1a3f6f 100%)", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, overflow: "hidden", background: "rgba(247,181,0,.15)", border: "2px solid rgba(247,181,0,.4)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {expert.photo
          ? <img src={`${BASE}/uploads/photos/${expert.photo}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" onError={e => (e.currentTarget.style.display = "none")} />
          : <span style={{ color: "#F59E0B", fontWeight: 900, fontSize: 18 }}>{user.prenom?.[0]}{user.nom?.[0]}</span>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{user.prenom} {user.nom}</div>
        {expert.domaine && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(245,158,11,.18)", border: "1px solid rgba(245,158,11,.35)", borderRadius: 99, padding: "2px 9px", marginTop: 4 }}>
            <FaBriefcase style={{ color: "#F59E0B", fontSize: 9 }} />
            <span style={{ color: "#FCD34D", fontSize: 11, fontWeight: 700 }}>{expert.domaine}</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          {user.email && <span style={{ color: "rgba(255,255,255,.55)", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><FaEnvelope style={{ fontSize: 9 }} />{user.email}</span>}
          {expert.localisation && <span style={{ color: "rgba(255,255,255,.55)", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><FaMapMarkerAlt style={{ fontSize: 9 }} />{expert.localisation}</span>}
        </div>
      </div>
      {expert.annee_debut_experience && (
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          <div style={{ color: "#F59E0B", fontWeight: 900, fontSize: 20 }}>{new Date().getFullYear() - expert.annee_debut_experience}+</div>
          <div style={{ color: "rgba(255,255,255,.5)", fontSize: 10, fontWeight: 600 }}>ans exp.</div>
        </div>
      )}
    </div>
  );
}

// ─── CARTE DEVIS PROFESSIONNELLE ──────────────────────────────────────────────
function DevisCard({ devis, experts, onAccepter, onRefuser, onContactExpert, onRdvExpert }: {
  devis: any; experts: any[];
  onAccepter: (id: number) => void;
  onRefuser: (id: number) => void;
  onContactExpert: (ex: any) => void;
  onRdvExpert: (ex: any) => void;
}) {
  const expert = devis.expert;
  const expertFull = experts.find(e => e.id === expert?.id) || expert;
  const isPending = devis.statut === "en_attente";
  const isAccepted = devis.statut === "accepte";
  const isRefused = devis.statut === "refuse";

  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      overflow: "hidden",
      border: isPending ? "1.5px solid #FDE68A" : isAccepted ? "1.5px solid #6EE7B7" : "1.5px solid #FCA5A5",
      boxShadow: isPending ? "0 4px 24px rgba(245,158,11,.08)" : isAccepted ? "0 4px 24px rgba(16,185,129,.08)" : "0 4px 24px rgba(239,68,68,.05)",
      marginBottom: 18,
      transition: "all .3s",
    }}>
      <div style={{ height: 4, background: isPending ? "linear-gradient(90deg,#F59E0B,#FCD34D)" : isAccepted ? "linear-gradient(90deg,#10B981,#6EE7B7)" : "linear-gradient(90deg,#EF4444,#FCA5A5)" }} />
      <div style={{ padding: "20px 24px" }}>
        <ExpertMiniCard expert={expertFull} BASE={BASE} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", border: "1px solid #E8EEF6" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Montant proposé</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#0A2540", letterSpacing: "-0.5px" }}>{devis.montant?.toLocaleString("fr-TN")} <span style={{ fontSize: 14, fontWeight: 600, color: "#64748B" }}>DT</span></div>
          </div>
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", border: "1px solid #E8EEF6" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Statut</div>
            <DevisStatusBadge statut={devis.statut} />
          </div>
        </div>
        {devis.description && (
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", marginBottom: 14, border: "1px solid #E8EEF6" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Description du devis</div>
            <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.75, margin: 0 }}>{devis.description}</p>
          </div>
        )}
        {devis.delai && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 99, padding: "5px 12px", marginBottom: 14, fontSize: 12, color: "#1D4ED8", fontWeight: 600 }}>
            <FaClock style={{ fontSize: 10 }} /> Délai estimé : {devis.delai}
          </div>
        )}
        <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: isPending ? 16 : 0 }}>
          Reçu le {new Date(devis.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </div>
        {isPending && (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => onAccepter(devis.id)}
              style={{ flex: 1, background: "linear-gradient(135deg,#10B981,#059669)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 20px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 16px rgba(16,185,129,.35)", transition: "all .2s" }}
              onMouseOver={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseOut={e => (e.currentTarget.style.transform = "none")}
            >
              <FaCheckDouble /> Accepter ce devis
            </button>
            <button
              onClick={() => onRefuser(devis.id)}
              style={{ flex: 1, background: "#fff", color: "#DC2626", border: "1.5px solid #FECACA", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}
              onMouseOver={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "none"; }}
            >
              <FaTimes /> Refuser
            </button>
          </div>
        )}
        {isAccepted && (
          <div style={{ background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", borderRadius: 14, padding: "16px 18px", border: "1px solid #6EE7B7" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaCheckDouble style={{ color: "#fff", fontSize: 13 }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: "#065F46", fontSize: 14 }}>Devis accepté !</div>
                <div style={{ fontSize: 12, color: "#047857" }}>Contactez l'expert pour démarrer la collaboration</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => onContactExpert(expertFull)} style={{ flex: 1, background: "#0A2540", color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <FaComments /> Envoyer un message
              </button>
              <button onClick={() => onRdvExpert(expertFull)} style={{ flex: 1, background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 10, padding: "10px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <FaCalendar /> Prendre un RDV
              </button>
            </div>
          </div>
        )}
        {isRefused && (
          <div style={{ background: "#FEF2F2", borderRadius: 12, padding: "12px 16px", border: "1px solid #FECACA", display: "flex", alignItems: "center", gap: 10 }}>
            <FaTimes style={{ color: "#DC2626", fontSize: 16, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: "#7F1D1D", fontSize: 13 }}>Devis refusé</div>
              <div style={{ fontSize: 12, color: "#B91C1C" }}>Vous pouvez contacter l'expert pour en discuter</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CARTE RDV PROFESSIONNELLE ────────────────────────────────────────────────
function RdvCard({ rdv, onModifier, onAnnuler }: {
  rdv: any;
  onModifier: (r: any) => void;
  onAnnuler: (id: number) => void;
}) {
  const isConfirmed = rdv.statut === "confirme";
  const isCancelled = rdv.statut === "annule" || rdv.statut === "refuse";
  const isPending = rdv.statut === "en_attente";
  const borderColor = isPending ? "#FDE68A" : isConfirmed ? "#6EE7B7" : "#FCA5A5";
  const accentColor = isPending ? "#F59E0B" : isConfirmed ? "#10B981" : "#EF4444";
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: `1.5px solid ${borderColor}`, overflow: "hidden", marginBottom: 12, transition: "all .3s" }}>
      <div style={{ height: 3, background: `linear-gradient(90deg,${accentColor},${accentColor}66)` }} />
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accentColor}18`, border: `1.5px solid ${accentColor}33`, display: "flex", alignItems: "center", justifyContent: "center", color: accentColor, flexShrink: 0 }}>
                <FaCalendar style={{ fontSize: 15 }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: "#0A2540", fontSize: 14.5 }}>{rdv.expert?.user?.prenom} {rdv.expert?.user?.nom}</div>
                {rdv.expert?.domaine && (
                  <div style={{ fontSize: 11, color: "#92400E", background: "#FEF3C7", borderRadius: 99, padding: "1px 8px", display: "inline-block", marginTop: 2, fontWeight: 700 }}>{rdv.expert.domaine}</div>
                )}
              </div>
            </div>
            {rdv.sujet && <div style={{ fontSize: 13, color: "#475569", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: accentColor }}>📌</span> {rdv.sujet}</div>}
            <div style={{ fontSize: 12.5, color: "#64748B", display: "flex", alignItems: "center", gap: 5 }}>
              <FaClock style={{ fontSize: 10, color: accentColor }} />
              {new Date(rdv.date_rdv).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
            <RdvStatusBadge statut={rdv.statut} />
            {isPending && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => onModifier(rdv)} style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 8, padding: "6px 12px", fontSize: 11.5, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5, transition: "all .2s" }} onMouseOver={e => { e.currentTarget.style.background = "#DBEAFE"; }} onMouseOut={e => { e.currentTarget.style.background = "#EFF6FF"; }}>
                  <FaEdit style={{ fontSize: 10 }} /> Modifier
                </button>
                <button onClick={() => onAnnuler(rdv.id)} style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 8, padding: "6px 12px", fontSize: 11.5, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, display: "flex", alignItems: "center", gap: 5, transition: "all .2s" }} onMouseOver={e => { e.currentTarget.style.background = "#FEE2E2"; }} onMouseOut={e => { e.currentTarget.style.background = "#FEF2F2"; }}>
                  <FaTrash style={{ fontSize: 10 }} /> Annuler
                </button>
              </div>
            )}
            {isConfirmed && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 99, padding: "4px 12px", fontSize: 11, color: "#065F46", fontWeight: 600 }}>
                <FaCheckCircle style={{ fontSize: 10 }} /> RDV confirmé par l'expert
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL FORMATION ─────────────────────────────────────────────────────────
function FormationModal({ formation, onClose, demanderFormation, demandeExiste, annulerDemandeFormation }: {
  formation: any; onClose: () => void;
  demanderFormation: (id: number, titre: string) => void;
  demandeExiste: boolean;
  annulerDemandeFormation: (formationId: number) => void;
}) {
  const modeInfo = MODE_LABELS[formation.mode] || { label: "En ligne", color: "#10B981" };
  const isFull = formation.places_limitees && formation.places_disponibles <= 0;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ position: "relative", height: 190, background: "linear-gradient(135deg,#0A2540,#1a3a6e)", overflow: "hidden", borderRadius: "24px 24px 0 0" }}>
          {formation.image && <img src={`${BASE}/uploads/formations/${formation.image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .5 }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,37,64,.92),transparent)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaTimes /></button>
          <div style={{ position: "absolute", bottom: 16, left: 20, right: 60 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              {formation.domaine && <span style={{ background: "#F59E0B", color: "#0A2540", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{formation.domaine}</span>}
              {formation.certifiante && <span style={{ background: "rgba(34,197,94,.2)", color: "#4ADE80", border: "1px solid rgba(34,197,94,.35)", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}><FaCertificate style={{ marginRight: 3, fontSize: 10 }} />Certifiante</span>}
            </div>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 19, lineHeight: 1.25 }}>{formation.titre}</div>
          </div>
        </div>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Formateur", val: formation.formateur || "BEH Expert", color: "#3B82F6" },
              { label: "Durée", val: formation.duree || "Non précisée", color: "#F59E0B" },
              { label: "Mode", val: modeInfo.label, color: modeInfo.color },
              { label: "Lieu", val: formation.localisation || "En ligne", color: "#8B5CF6" },
            ].map((row, i) => (
              <div key={i} style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${row.color}18`, color: row.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 700 }}>●</div>
                <div><div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px" }}>{row.label}</div><div style={{ fontSize: 13.5, fontWeight: 600, color: "#0A2540" }}>{row.val}</div></div>
              </div>
            ))}
          </div>
          {formation.description && <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8, margin: "0 0 20px" }}>{formation.description}</p>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
            <div><div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Prix</div><div style={{ fontSize: 26, fontWeight: 900, color: formation.prix ? "#0A2540" : "#10B981" }}>{formation.prix ? `${formation.prix} DT` : "Gratuit"}</div></div>
            {formation.places_limitees ? (
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Places restantes</div><div style={{ fontSize: 22, fontWeight: 900, color: formation.places_disponibles > 5 ? "#10B981" : formation.places_disponibles > 0 ? "#F59E0B" : "#EF4444" }}>{formation.places_disponibles}</div></div>
            ) : (
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 4 }}>Places</div><div style={{ fontSize: 18, fontWeight: 700, color: "#10B981" }}>Illimitées</div></div>
            )}
          </div>
          {demandeExiste ? (
            <button onClick={() => { onClose(); annulerDemandeFormation(formation.id); }} style={{ width: "100%", background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 14, padding: "16px", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><FaTrash /> Annuler la demande</button>
          ) : (
            <button onClick={() => { onClose(); demanderFormation(formation.id, formation.titre); }} disabled={isFull} style={{ width: "100%", background: isFull ? "#E2E8F0" : "linear-gradient(135deg,#F59E0B,#D97706)", color: isFull ? "#64748B" : "#fff", border: "none", borderRadius: 14, padding: "16px", fontWeight: 900, fontSize: 15, cursor: isFull ? "not-allowed" : "pointer" }}>{isFull ? "❌ Complet" : <><FaArrowRight /> Demander cette formation</>}</button>
          )}
        </div>
      </div>
    </div>
  );
}

function PodcastModal({ podcast, onClose, navigateToFormationsTab }: { podcast: any; onClose: () => void; navigateToFormationsTab: () => void }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ position: "relative", height: 190, background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", overflow: "hidden", borderRadius: "24px 24px 0 0" }}>
          {podcast.image && <img src={`${BASE}/uploads/podcasts-images/${podcast.image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .45 }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(45,27,94,.92),transparent)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaTimes /></button>
          <div style={{ position: "absolute", bottom: 20, left: 20, right: 60 }}>
            <span style={{ background: "#7C3AED", color: "#fff", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>🎙️ Podcast</span>
            <div style={{ color: "#fff", fontWeight: 900, fontSize: 18, marginTop: 8 }}>{podcast.titre}</div>
          </div>
        </div>
        <div style={{ padding: "24px 28px" }}>
          {podcast.description && <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8, margin: "0 0 20px" }}>{podcast.description}</p>}
          <button onClick={() => { onClose(); navigateToFormationsTab(); }} style={{ width: "100%", background: "linear-gradient(135deg,#7C3AED,#6D28D9)", color: "#fff", border: "none", borderRadius: 14, padding: "16px", fontWeight: 900, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><FaPlay /> Demander l'accès</button>
        </div>
      </div>
    </div>
  );
}

function FormationCard({ f, onSelect, demanderFormation, demandeExiste, annulerDemandeFormation }: { f: any; onSelect: (f: any) => void; demanderFormation: (id: number, titre: string) => void; demandeExiste: boolean; annulerDemandeFormation: (formationId: number) => void }) {
  const modeInfo = MODE_LABELS[f.mode] || { label: f.mode || "En ligne", color: "#10B981" };
  const isFull = f.places_limitees && f.places_disponibles <= 0;
  return (
    <div className="form-card" onClick={() => onSelect(f)}>
      <div style={{ height: 130, position: "relative", background: "linear-gradient(135deg,#0A2540,#1a3a6e)", overflow: "hidden" }}>
        {f.image && <img src={`${BASE}/uploads/formations/${f.image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .55 }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,37,64,.85),rgba(10,37,64,.2))" }} />
        <div style={{ position: "absolute", top: 10, left: 10 }}>{f.certifiante && <span style={{ background: "#F59E0B", color: "#0A2540", borderRadius: 99, padding: "2px 8px", fontSize: 9.5, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 3 }}><FaCertificate style={{ fontSize: 8 }} />CERTIF.</span>}</div>
        <div style={{ position: "absolute", bottom: 10, right: 10 }}><span style={{ background: f.prix ? "rgba(10,37,64,.85)" : "rgba(16,185,129,.85)", color: f.prix ? "#F59E0B" : "#fff", borderRadius: 99, padding: "4px 10px", fontSize: 12, fontWeight: 800 }}>{f.prix ? `${f.prix} DT` : "Gratuit"}</span></div>
      </div>
      <div style={{ padding: "14px 14px 12px" }}>
        {f.domaine && <div style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 5 }}>{f.domaine}</div>}
        <h3 style={{ fontWeight: 800, color: "#0A2540", fontSize: 14, lineHeight: 1.3, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.titre}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, fontSize: 11, color: "#64748B" }}>
          {f.formateur && <span><FaUsers style={{ fontSize: 9 }} /> {f.formateur}</span>}
          {f.duree && <span><FaClock style={{ fontSize: 9 }} /> {f.duree}</span>}
          {f.places_limitees ? (f.places_disponibles > 0 ? <span style={{ color: "#F59E0B" }}>🎟️ {f.places_disponibles} place{f.places_disponibles > 1 ? "s" : ""}</span> : <span style={{ color: "#EF4444" }}>❌ Complet</span>) : <span style={{ color: "#10B981" }}>♾️ Illimité</span>}
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          <button style={{ flex: 1, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 9, padding: "8px", fontWeight: 700, fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }} onClick={e => { e.stopPropagation(); onSelect(f); }}>En savoir +</button>
          {demandeExiste ? (
            <button style={{ flex: 1, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 9, padding: "8px", fontWeight: 700, fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }} onClick={e => { e.stopPropagation(); annulerDemandeFormation(f.id); }}><FaTrash /> Annuler</button>
          ) : (
            <button disabled={isFull} style={{ flex: 1, background: isFull ? "#E2E8F0" : "#F59E0B", color: isFull ? "#64748B" : "#0A2540", border: "none", borderRadius: 9, padding: "8px", fontWeight: 700, fontSize: 11.5, cursor: isFull ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }} onClick={e => { e.stopPropagation(); demanderFormation(f.id, f.titre); }}>{isFull ? "Complet" : "Demander"}</button>
          )}
        </div>
      </div>
    </div>
  );
}

function PodcastCard({ p, onSelect }: { p: any; onSelect: (p: any) => void }) {
  return (
    <div className="pod-card" onClick={() => onSelect(p)}>
      <div style={{ display: "flex" }}>
        <div style={{ width: 140, flexShrink: 0, background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140 }}>
          {p.image && <img src={`${BASE}/uploads/podcasts-images/${p.image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .65, position: "absolute", inset: 0 }} />}
          <div style={{ position: "relative", zIndex: 2, width: 50, height: 50, borderRadius: "50%", background: "rgba(139,92,246,.3)", border: "2px solid rgba(139,92,246,.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaMicrophone style={{ color: "#C4B5FD", fontSize: 20 }} /></div>
        </div>
        <div style={{ flex: 1, padding: "16px 16px 14px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}><span style={{ background: "#F3F0FF", color: "#7C3AED", borderRadius: 99, padding: "3px 9px", fontSize: 10.5, fontWeight: 700 }}>🎙️ Podcast</span>{p.domaine && <span style={{ background: "#F8FAFC", color: "#64748B", borderRadius: 99, padding: "3px 9px", fontSize: 10.5, fontWeight: 600 }}>{p.domaine}</span>}</div>
          <h3 style={{ fontWeight: 800, color: "#0A2540", fontSize: 14.5, lineHeight: 1.3, marginBottom: 7 }}>{p.titre}</h3>
          {p.description && <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.65, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, fontSize: 11.5, color: "#8A9AB5" }}>{p.auteur && <span><FaUsers style={{ fontSize: 10, marginRight: 3 }} />{p.auteur}</span>}</div>
            <button className="btn btn-purple" style={{ fontSize: 11.5, padding: "7px 14px" }} onClick={e => { e.stopPropagation(); onSelect(p); }}><FaPlay style={{ fontSize: 10 }} /> Voir détails</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlateformesModal({ onClose, startup, demandeForm, setDemandeForm, envoyerDemande, sendingDemande }: { onClose: () => void; startup: any; demandeForm: any; setDemandeForm: (f: any) => void; envoyerDemande: (e: React.FormEvent) => void; sendingDemande: boolean }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [localForm, setLocalForm] = useState({ description: "", delai: "", objectif: startup?.secteur || "", telephone: startup?.user?.telephone || "", budget: "", fonctionnalites: [] as string[], technologie: "" });
  const FONCTIONNALITES = ["Authentification & rôles", "Tableau de bord analytique", "Notifications push/email", "Paiement en ligne", "Chat / Messagerie", "Import/Export Excel", "API REST", "Mode hors-ligne", "Multi-langues", "Rapports PDF"];
  const toggleFonct = (f: string) => setLocalForm(prev => ({ ...prev, fonctionnalites: prev.fonctionnalites.includes(f) ? prev.fonctionnalites.filter(x => x !== f) : [...prev.fonctionnalites, f] }));
  const selectedPlatform = PLATFORM_TYPES.find(p => p.id === selectedType);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const desc = `[${selectedPlatform?.label || "Plateforme"}]\n${localForm.description}\n\nFonctionnalités: ${localForm.fonctionnalites.join(", ")}\nBudget estimé: ${localForm.budget}\nTechnologie préférée: ${localForm.technologie}`;
    setDemandeForm({ ...demandeForm, description: desc, delai: localForm.delai, objectif: localForm.objectif, telephone: localForm.telephone, type_application: selectedPlatform?.label || "" });
    envoyerDemande(e);
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#0A2540,#0f3460)", padding: "24px 28px 0", borderRadius: "24px 24px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(16,185,129,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#10B981" }}><FaDesktop /></div>
              <div><div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Service</div><div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>Nos Plateformes Digitales</div></div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><FaTimes /></button>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {[1,2,3,4].map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: step > s ? "#10B981" : step === s ? "#F59E0B" : "rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", color: step >= s ? "#0A2540" : "rgba(255,255,255,.4)", fontWeight: 800, fontSize: 12, transition: "all .3s" }}>{step > s ? "✓" : s}</div>
                  <div style={{ fontSize: 10, color: step >= s ? "#fff" : "rgba(255,255,255,.3)", paddingBottom: 10, whiteSpace: "nowrap" }}>{["Infos","Type","Détails","Récap"][i]}</div>
                </div>
                {i < 3 && <div style={{ height: 2, flex: 1, background: step > s ? "#10B981" : "rgba(255,255,255,.1)", marginBottom: 20, transition: "all .3s" }} />}
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
          {step === 1 && (<div><h3 style={{ fontWeight: 800, fontSize: 16, color: "#0A2540", marginBottom: 16 }}>Décrivez votre projet</h3><div style={{ marginBottom: 14 }}><label className="lbl">Description *</label><textarea className="inp" rows={4} required value={localForm.description} onChange={e => setLocalForm({ ...localForm, description: e.target.value })} placeholder="Décrivez votre projet..." /></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}><div><label className="lbl">Secteur</label><input className="inp" value={localForm.objectif} onChange={e => setLocalForm({ ...localForm, objectif: e.target.value })} /></div><div><label className="lbl">Téléphone</label><input className="inp" type="tel" value={localForm.telephone} onChange={e => setLocalForm({ ...localForm, telephone: e.target.value })} /></div></div></div>)}
          {step === 2 && (<div><h3 style={{ fontWeight: 800, fontSize: 16, color: "#0A2540", marginBottom: 16 }}>Type de projet</h3><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{PLATFORM_TYPES.map(pt => (<div key={pt.id} onClick={() => setSelectedType(pt.id)} style={{ border: `2px solid ${selectedType === pt.id ? pt.color : "#E2E8F0"}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", background: selectedType === pt.id ? `${pt.color}08` : "#FAFBFE", transition: "all .2s", display: "flex", gap: 12 }}><div style={{ width: 38, height: 38, borderRadius: 10, background: `${pt.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: pt.color, flexShrink: 0 }}>{pt.icon}</div><div><div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540" }}>{pt.label}</div><div style={{ fontSize: 11.5, color: "#64748B" }}>{pt.desc}</div></div></div>))}</div></div>)}
          {step === 3 && (<div><h3 style={{ fontWeight: 800, fontSize: 16, color: "#0A2540", marginBottom: 16 }}>Spécifications</h3><div style={{ marginBottom: 16 }}><label className="lbl">Fonctionnalités souhaitées</label><div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{FONCTIONNALITES.map(f => <button key={f} type="button" onClick={() => toggleFonct(f)} style={{ border: `1.5px solid ${localForm.fonctionnalites.includes(f) ? "#10B981" : "#E2E8F0"}`, borderRadius: 99, padding: "5px 12px", cursor: "pointer", background: localForm.fonctionnalites.includes(f) ? "#ECFDF5" : "#fff", color: localForm.fonctionnalites.includes(f) ? "#059669" : "#64748B", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>{localForm.fonctionnalites.includes(f) ? "✓ " : ""}{f}</button>)}</div></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}><div><label className="lbl">Délai</label><select className="inp" value={localForm.delai} onChange={e => setLocalForm({ ...localForm, delai: e.target.value })}><option value="">Sélectionner...</option>{["Urgent (< 2 semaines)", "1 mois", "2 à 3 mois", "3 à 6 mois", "Flexible"].map(d => <option key={d}>{d}</option>)}</select></div><div><label className="lbl">Budget (DT)</label><select className="inp" value={localForm.budget} onChange={e => setLocalForm({ ...localForm, budget: e.target.value })}><option value="">Sélectionner...</option>{["< 5 000 DT", "5 000 – 15 000 DT", "15 000 – 50 000 DT", "> 50 000 DT", "À définir"].map(b => <option key={b}>{b}</option>)}</select></div></div></div>)}
          {step === 4 && (<div><h3 style={{ fontWeight: 800, fontSize: 16, color: "#0A2540", marginBottom: 16 }}>Récapitulatif</h3><div style={{ background: "#F8FAFC", borderRadius: 14, padding: "18px", border: "1px solid #E2E8F0" }}>{selectedPlatform && <div style={{ fontWeight: 700, color: "#0A2540", marginBottom: 12 }}>{selectedPlatform.label}</div>}<p style={{ fontSize: 13, color: "#475569" }}>{localForm.description}</p></div><div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 12, padding: "12px 16px", marginTop: 14, fontSize: 13, color: "#0369A1" }}>📞 Notre équipe vous contactera sous <strong>24h</strong>.</div></div>)}
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 20 }}>
            <div style={{ fontSize: 12, color: "#94A3B8", alignSelf: "center" }}>Étape {step}/4</div>
            <div style={{ display: "flex", gap: 10 }}>
              {step > 1 && <button type="button" className="btn btn-outline" onClick={() => setStep(s => s - 1)}>← Précédent</button>}
              {step < 4 ? <button type="button" className="btn btn-gold" onClick={() => { if (step === 1 && !localForm.description) return; if (step === 2 && !selectedType) return; setStep(s => s + 1); }}>Suivant →</button> : <button type="submit" className="btn btn-gold" disabled={sendingDemande}>{sendingDemande ? "⏳ Envoi..." : <><FaPaperPlane /> Envoyer</>}</button>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function GenericServiceModal({ serviceSlug, onClose, demandeForm, setDemandeForm, envoyerDemande, sendingDemande }: { serviceSlug: string; onClose: () => void; demandeForm: any; setDemandeForm: (f: any) => void; envoyerDemande: (e: React.FormEvent) => void; sendingDemande: boolean }) {
  const svc = SERVICES_INFO[serviceSlug];
  const needDomaine = serviceSlug === "consulting" || serviceSlug === "audit-sur-site";
  const [localDomaine, setLocalDomaine] = useState("");
  const [domaineAutre, setDomaineAutre] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalDomaine = localDomaine;
    if (localDomaine === "Autre") { if (!domaineAutre.trim()) { alert("Précisez le domaine"); return; } finalDomaine = domaineAutre.trim(); }
    if (needDomaine && !finalDomaine) { alert("Sélectionnez un domaine"); return; }
    setDemandeForm({ ...demandeForm, domaine: finalDomaine });
    envoyerDemande(e);
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg,${svc?.color || "#3B82F6"},${svc?.color || "#3B82F6"}99)`, padding: "28px 32px", borderRadius: "24px 24px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 48, height: 48, borderRadius: 13, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff" }}>{svc?.icon}</div><div><div style={{ color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Demander ce service</div><div style={{ color: "#fff", fontWeight: 900, fontSize: 20 }}>{svc?.label}</div></div></div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>✕</button>
          </div>
          {svc && <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>{svc.points.map((p: string) => <span key={p} style={{ background: "rgba(255,255,255,.18)", color: "#fff", borderRadius: 99, padding: "3px 10px", fontSize: 11.5, fontWeight: 600 }}>✓ {p}</span>)}</div>}
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
          {needDomaine && (<div style={{ marginBottom: 14 }}><label className="lbl">Domaine d'intervention *</label><select className="inp" required value={localDomaine} onChange={e => { setLocalDomaine(e.target.value); if (e.target.value !== "Autre") setDomaineAutre(""); }}><option value="">Sélectionnez...</option>{DOMAINES_LIST.map(d => <option key={d}>{d}</option>)}</select>{localDomaine === "Autre" && <input className="inp" style={{ marginTop: 8 }} placeholder="Précisez..." value={domaineAutre} onChange={e => setDomaineAutre(e.target.value)} required />}</div>)}
          <div style={{ marginBottom: 14 }}><label className="lbl">Description *</label><textarea className="inp" rows={4} required value={demandeForm.description} onChange={e => setDemandeForm({ ...demandeForm, description: e.target.value })} placeholder="Décrivez votre besoin..." /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}><div><label className="lbl">Délai</label><select className="inp" value={demandeForm.delai} onChange={e => setDemandeForm({ ...demandeForm, delai: e.target.value })}><option value="">Sélectionner...</option>{["Urgent (< 2 semaines)", "1 mois", "2 à 3 mois", "3 à 6 mois", "Flexible"].map(d => <option key={d}>{d}</option>)}</select></div><div><label className="lbl">Objectif</label><input className="inp" value={demandeForm.objectif} onChange={e => setDemandeForm({ ...demandeForm, objectif: e.target.value })} placeholder="Ex: Améliorer ma performance" /></div></div>
          <div style={{ marginBottom: 14 }}><label className="lbl">Téléphone</label><input className="inp" type="tel" value={demandeForm.telephone} onChange={e => setDemandeForm({ ...demandeForm, telephone: e.target.value })} placeholder="+216 XX XXX XXX" /></div>
          <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 12, padding: "12px 16px", marginBottom: 18, fontSize: 13, color: "#0369A1" }}>📞 Notre équipe vous contacte sous <strong>24h</strong>.</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button type="button" className="btn btn-outline" onClick={onClose}>Annuler</button><button type="submit" className="btn btn-gold" disabled={sendingDemande}>{sendingDemande ? "⏳..." : <><FaPaperPlane /> Envoyer</>}</button></div>
        </form>
      </div>
    </div>
  );
}

function EditDemandeModal({ demande, onClose, onUpdate }: { demande: any; onClose: () => void; onUpdate: (id: number, data: any) => void }) {
  const [description, setDescription] = useState(demande.description || "");
  const [delai, setDelai] = useState(demande.delai || "");
  const [objectif, setObjectif] = useState(demande.objectif || "");
  const [telephone, setTelephone] = useState(demande.telephone || "");
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between" }}><div style={{ fontWeight: 700, fontSize: 16 }}>✏️ Modifier la demande</div><button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}><FaTimes /></button></div>
        <div style={{ padding: "20px 22px" }}>
          <div style={{ marginBottom: 14 }}><label className="lbl">Description</label><textarea className="inp" rows={4} value={description} onChange={e => setDescription(e.target.value)} required /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}><div><label className="lbl">Délai</label><select className="inp" value={delai} onChange={e => setDelai(e.target.value)}><option value="">Sélectionner...</option>{["Urgent (< 2 semaines)", "1 mois", "2 à 3 mois", "3 à 6 mois", "Flexible"].map(d => <option key={d}>{d}</option>)}</select></div><div><label className="lbl">Objectif</label><input className="inp" value={objectif} onChange={e => setObjectif(e.target.value)} /></div></div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Téléphone</label><input className="inp" type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} /></div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button className="btn btn-outline" onClick={onClose}>Annuler</button><button className="btn btn-gold" onClick={() => onUpdate(demande.id, { description, delai, objectif, telephone })}><FaSave /> Enregistrer</button></div>
        </div>
      </div>
    </div>
  );
}

function EditRdvModal({ rdv, onClose, onUpdate }: { rdv: any; onClose: () => void; onUpdate: (id: number, data: { date_rdv: string; sujet: string }) => void }) {
  const [dateRdv, setDateRdv] = useState(rdv.date_rdv.slice(0, 16));
  const [sujet, setSujet] = useState(rdv.sujet || "");
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between" }}><div style={{ fontWeight: 700, fontSize: 16 }}>✏️ Modifier le rendez-vous</div><button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}><FaTimes /></button></div>
        <div style={{ padding: "20px 22px" }}>
          <div style={{ marginBottom: 14 }}><label className="lbl">Sujet *</label><input className="inp" value={sujet} onChange={e => setSujet(e.target.value)} required /></div>
          <div style={{ marginBottom: 18 }}><label className="lbl">Date & heure *</label><input className="inp" type="datetime-local" value={dateRdv} onChange={e => setDateRdv(e.target.value)} required min={new Date().toISOString().slice(0, 16)} /></div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button className="btn btn-outline" onClick={onClose}>Annuler</button><button className="btn btn-gold" onClick={() => onUpdate(rdv.id, { date_rdv: dateRdv, sujet })}><FaSave /> Enregistrer</button></div>
        </div>
      </div>
    </div>
  );
}

function ExpertCard({ e, isSectorMatch, onMessage, onRdv, BASE }: { e: any; isSectorMatch: boolean; onMessage: () => void; onRdv: () => void; BASE: string }) {
  return (
    <div className="expert-card" style={{ borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", border: isSectorMatch ? "1.5px solid rgba(245,158,11,.45)" : "1.5px solid #E8EEF6" }}>
      {isSectorMatch && <div style={{ position: "absolute", top: 10, left: 10, zIndex: 5, background: "#F59E0B", color: "#0A2540", borderRadius: 99, padding: "3px 9px", fontSize: 10, fontWeight: 800 }}>⭐ Recommandé</div>}
      <div style={{ height: 3, background: "linear-gradient(90deg,#0A2540,#F59E0B)" }} />
      <div style={{ position: "relative", height: 150, background: "linear-gradient(135deg,#0A2540,#1a3f6f)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {e.photo ? <img src={`${BASE}/uploads/photos/${e.photo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={ev => (ev.currentTarget.style.display = "none")} /> : <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(245,158,11,.2)", border: "3px solid #F59E0B", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B", fontWeight: 800, fontSize: 22 }}>{e.user?.prenom?.[0]}{e.user?.nom?.[0]}</div>}
      </div>
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ fontWeight: 700, fontSize: 14.5, color: "#0A2540", marginBottom: 4 }}>{e.user?.prenom} {e.user?.nom}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", background: "#FEF3C7", borderRadius: 6, padding: "2px 8px", display: "inline-block", marginBottom: 8 }}>{e.domaine || "Expert"}</div>
        {e.description && <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.7, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{e.description}</p>}
        <div style={{ display: "flex", gap: 7, marginTop: "auto" }}>
          <button className="btn btn-dark" style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "8px" }} onClick={onMessage}><FaComments /> Message</button>
          <button className="btn btn-gold" style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "8px" }} onClick={onRdv}><FaCalendar /> RDV</button>
        </div>
      </div>
    </div>
  );
}

// ─── BADGE STATUT DEMANDE ENRICHI ────────────────────────────────────────────
function DemandStatutBadge({ statut }: { statut: string }) {
  const configs: Record<string, { bg: string; color: string; border: string; icon: string; label: string }> = {
    en_attente: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A", icon: "⏳", label: "En attente" },
    acceptee:   { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0", icon: "✅", label: "Acceptée" },
    en_cours:   { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", icon: "🔄", label: "Expert en cours de sélection" },
    terminee:   { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0", icon: "🏁", label: "Terminée" },
    refusee:    { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", icon: "❌", label: "Refusée" },
    refuse:     { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", icon: "❌", label: "Refusée" },
    valide:     { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0", icon: "✅", label: "Validée" },
  };
  const c = configs[statut] || { bg: "#F1F5F9", color: "#475569", border: "#CBD5E1", icon: "•", label: statut };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 99, padding: "5px 13px", fontSize: 12, fontWeight: 700, letterSpacing: "0.2px" }}>
      <span>{c.icon}</span> {c.label}
    </span>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function DashboardStartup() {
  const router = useRouter();

  const [realUser, setRealUser] = useState<any>(null);
  const [startup, setStartup] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("accueil");
  const [serviceTab, setServiceTab] = useState<"catalogue" | "formations" | "podcasts" | "personnalise">("catalogue");

  const [experts, setExperts] = useState<any[]>([]);
  const [pubExperts, setPubExperts] = useState<any[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(false);
  const [expertsError, setExpertsError] = useState<string | null>(null);
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [propositions, setPropositions] = useState<any[]>([]);
  const [propositionsVues, setPropositionsVues] = useState<Set<number>>(new Set());

  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [newMsg, setNewMsg] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);

  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [pubTemos, setPubTemos] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [mesDevis, setMesDevis] = useState<any[]>([]);
  const [toast, setToast] = useState({ text: "", ok: true });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [editProfil, setEditProfil] = useState({ nom_startup: "", secteur: "", taille: "", site_web: "", description: "", fonction: "", localisation: "" });
  const [rdvForm, setRdvForm] = useState({ expert_id: "", date_rdv: "", sujet: "" });
  const [expertFilter, setExpertFilter] = useState("");
  const [tIdx, setTIdx] = useState(0);
  const [tAnim, setTAnim] = useState(false);
  const [newTemo, setNewTemo] = useState("");
  const [newTemoNote, setNewTemoNote] = useState(5);
  const [sendingTemo, setSendingTemo] = useState(false);

  const [selectedFormation, setSelectedFormation] = useState<any>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<any>(null);
  const [serviceModal, setServiceModal] = useState<string | null>(null);
  const [showPlateformesModal, setShowPlateformesModal] = useState(false);
  const [editingDemande, setEditingDemande] = useState<any>(null);
  const [editingRdv, setEditingRdv] = useState<any>(null);
  const [sendingDemande, setSendingDemande] = useState(false);
  const [formationsLoading, setFormationsLoading] = useState(false);
  const [domaineFilter, setDomaineFilter] = useState("Tous");
  const [formSearch, setFormSearch] = useState("");
  const [demandeForm, setDemandeForm] = useState({ service: "", description: "", delai: "", objectif: "", telephone: "", type_application: "", domaine: "" });
  const [customService, setCustomService] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const tk = useCallback(() => localStorage.getItem("access_token") || "", []);
  const hdr = useCallback(() => ({ Authorization: `Bearer ${tk()}` }), [tk]);
  const hdrJ = useCallback(() => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" }), [tk]);

  function notify(text: string, ok = true) { setToast({ text, ok }); setTimeout(() => setToast({ text: "", ok: true }), 3500); }
  const forceLogout = useCallback(() => { localStorage.removeItem("access_token"); localStorage.removeItem("user"); window.location.href = "/connexion"; }, []);

  const loadStartupData = useCallback(async (currentToken: string) => {
    const authHdr = { Authorization: `Bearer ${currentToken}` };
    const ts = `?_=${Date.now()}`;
    const res = await fetch(`${BASE}/startups/moi${ts}`, { headers: authHdr });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const s = await res.json();
    if (!s) throw new Error("NO_STARTUP");
    setStartup(s);
    setEditProfil({ nom_startup: s.nom_startup || "", secteur: s.secteur || "", taille: s.taille || "", site_web: s.site_web || "", description: s.description || "", fonction: s.fonction || "", localisation: s.localisation || "" });
    const [rdvRes, demandeRes, temoRes] = await Promise.all([
      fetch(`${BASE}/rendez-vous/startup${ts}`, { headers: authHdr }),
      fetch(`${BASE}/demandes-service/mes-demandes${ts}`, { headers: authHdr }),
      fetch(`${BASE}/temoignages/mes-temoignages${ts}`, { headers: authHdr }),
    ]);
    setRdvs(rdvRes.ok ? await rdvRes.json() : []);
    setDemandes(demandeRes.ok ? await demandeRes.json() : []);
    setTemoignages(temoRes.ok ? await temoRes.json() : []);
    return s;
  }, []);

  const loadRecommendedExperts = useCallback(async () => {
    setLoadingExperts(true);
    setExpertsError(null);
    let list: any[] = [];
    try {
      if (!startup?.secteur) {
        const fb = await fetch(`${BASE}/experts/liste`);
        if (fb.ok) list = await fb.json();
        else throw new Error('Fallback failed');
      } else {
        const res = await fetch(`${BASE}/startups/experts-recommandes`, { headers: hdr() });
        if (res.ok) { list = await res.json(); if (!Array.isArray(list)) list = []; }
        else throw new Error(`Primary failed with status ${res.status}`);
      }
    } catch (err) {
      try { const fb = await fetch(`${BASE}/experts/liste`); if (fb.ok) list = await fb.json(); else throw new Error('Fallback also failed'); }
      catch (fallbackErr) { setExpertsError('Impossible de charger la liste des experts.'); setLoadingExperts(false); return; }
    }
    if (startup?.secteur && list.length) {
      const s = startup.secteur.toLowerCase().trim();
      const match = list.filter(ex => (ex.domaine || '').toLowerCase().includes(s) || s.includes((ex.domaine || '').toLowerCase()));
      const other = list.filter(ex => !match.find(m => m.id === ex.id));
      list = [...match, ...other];
    }
    setExperts(list);
    setPubExperts(list.slice(0, 4));
    setLoadingExperts(false);
  }, [hdr, startup?.secteur]);

  const loadPropositions = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/messages/mes-messages`, { headers: hdr() });
      if (!res.ok) return;
      const messages = await res.json();
      const props: any[] = [];
      for (const m of messages) {
        if (m.contenu?.startsWith("__RDV_PROPOSAL__") && m.receiver_id === realUser?.id) {
          try {
            const lines = m.contenu.split("\n");
            const obj: any = { id: m.id, createdAt: m.createdAt };
            for (const line of lines) {
              if (line.startsWith("rdv_id:")) obj.rdv_id = parseInt(line.replace("rdv_id:", "").trim());
              if (line.startsWith("nouvelle_date:")) obj.nouvelle_date = line.replace("nouvelle_date:", "").trim();
              if (line.startsWith("date_formatted:")) obj.date_formatted = line.replace("date_formatted:", "").trim();
              if (line.startsWith("raison:")) obj.raison = line.replace("raison:", "").trim();
            }
            obj.expert_name = m.sender ? `${m.sender.prenom || ""} ${m.sender.nom || ""}`.trim() : "Expert";
            obj.sender_id = m.sender_id;
            if (obj.rdv_id && obj.nouvelle_date) props.push(obj);
          } catch { /* ignorer */ }
        }
      }
      setPropositions(props);
    } catch { /* silencieux */ }
  }, [hdr, realUser?.id]);

  const repondreProposition = useCallback(async (proposition: any, accepter: boolean) => {
    if (!confirm(accepter ? "Accepter ce nouveau créneau ?" : "Refuser cette proposition ?")) return;
    if (accepter) {
      try {
        const res = await fetch(`${BASE}/rendez-vous/${proposition.rdv_id}/accepter-proposition`, { method: "PUT", headers: hdrJ(), body: JSON.stringify({ nouvelle_date: proposition.nouvelle_date }) });
        if (res.ok) { notify("✅ Créneau accepté ! Le RDV est mis à jour."); await loadStartupData(tk()); }
        else { await fetch(`${BASE}/rendez-vous/${proposition.rdv_id}`, { method: "PUT", headers: hdrJ(), body: JSON.stringify({ date_rdv: proposition.nouvelle_date }) }); notify("✅ Créneau accepté !"); await loadStartupData(tk()); }
      } catch { notify("Erreur réseau", false); }
    } else {
      try {
        await fetch(`${BASE}/messages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ receiver_id: proposition.sender_id, contenu: `❌ Proposition de créneau refusée pour le RDV #${proposition.rdv_id}.` }) });
        notify("❌ Proposition refusée. L'expert a été notifié.");
      } catch { notify("Erreur réseau", false); }
    }
    setPropositions(prev => prev.filter(p => p.id !== proposition.id));
    setPropositionsVues(prev => { const next = new Set(prev); next.add(proposition.id); return next; });
  }, [hdrJ, hdr, tk, loadStartupData]);

  const loadAllMessages = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/messages/mes-messages`, { headers: hdr() });
      if (!res.ok) return;
      const msgs = await res.json();
      const chatMsgs = msgs.filter((m: any) => !m.contenu?.startsWith("__RDV_PROPOSAL__"));
      setAllMessages(chatMsgs);
      if (selectedExpert) {
        const expertId = selectedExpert.user_id || selectedExpert.user?.id;
        setConversation(chatMsgs.filter((m: any) => (m.sender_id === expertId && m.receiver_id === realUser?.id) || (m.sender_id === realUser?.id && m.receiver_id === expertId)).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      }
    } catch { /* silencieux */ }
  }, [hdr, realUser?.id, selectedExpert]);

  const loadConversation = useCallback(async (expertUserId: number) => {
    const expert = experts.find(e => (e.user_id || e.user?.id) === expertUserId);
    if (expert) { setSelectedExpert(expert); await loadAllMessages(); }
  }, [experts, loadAllMessages]);

  const handleTabChange = useCallback((newTab: Tab) => {
    setTab(newTab);
    if (newTab === "messages") {
      fetch(`${BASE}/messages/mark-all-read`, { method: "PATCH", headers: hdr() }).catch(() => {});
      setAllMessages(prev => prev.map(m => ({ ...m, lu: true })));
    }
    if (newTab === "rdv") {
      setPropositionsVues(prev => { const next = new Set(prev); propositions.forEach(p => next.add(p.id)); return next; });
    }
  }, [hdr, propositions]);

  const unreadMsgCount = allMessages.filter(m => m.receiver_id === realUser?.id && !m.lu).length;
  const unreadPropositions = propositions.filter(p => !propositionsVues.has(p.id)).length;
  const pendingRdvCount = rdvs.filter(r => r.statut === "en_attente").length;
  const demandesEnAttente = demandes.filter(d => d.statut === "en_attente").length;
  const demandesEnCours = demandes.filter(d => d.statut === "en_cours").length;
  const mesDevisEnAttente = mesDevis.filter(d => d.statut === "en_attente").length; // ✅ AJOUT

  const showMsgBadge = tab !== "messages" && unreadMsgCount > 0;
  const showRdvBadge = tab !== "rdv" && (unreadPropositions > 0 || pendingRdvCount > 0);

  const uploadPhoto = async () => { if (!photoFile) return; const fd = new FormData(); fd.append("photo", photoFile); const r = await fetch(`${BASE}/startups/photo`, { method: "POST", headers: hdr(), body: fd }); if (r.ok) { notify("✅ Photo mise à jour !"); await loadStartupData(tk()); setPhotoFile(null); setPhotoPreview(""); } else notify("Erreur upload", false); };
  const saveProfil = async () => { const r = await fetch(`${BASE}/startups/profil`, { method: "PUT", headers: hdrJ(), body: JSON.stringify(editProfil) }); if (r.ok) { notify("✅ Profil sauvegardé !"); await loadStartupData(tk()); } else notify("❌ Erreur", false); };
  const prendreRdv = async () => { if (!rdvForm.expert_id || !rdvForm.date_rdv || !rdvForm.sujet) { notify("Remplissez tous les champs", false); return; } const r = await fetch(`${BASE}/rendez-vous`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ expert_id: Number(rdvForm.expert_id), date_rdv: rdvForm.date_rdv, sujet: rdvForm.sujet }) }); if (r.ok) { notify("✅ RDV demandé !"); setRdvForm({ expert_id: "", date_rdv: "", sujet: "" }); await loadStartupData(tk()); } else notify("❌ Erreur", false); };
  const modifierRdv = async (rdvId: number, data: { date_rdv: string; sujet: string }) => { const r = await fetch(`${BASE}/rendez-vous/${rdvId}`, { method: "PUT", headers: hdrJ(), body: JSON.stringify(data) }); if (r.ok) { notify("✅ RDV modifié !"); await loadStartupData(tk()); setEditingRdv(null); } else notify("❌ Erreur", false); };
  const annulerRdv = async (rdvId: number) => { if (!confirm("Annuler ce RDV ?")) return; const r = await fetch(`${BASE}/rendez-vous/${rdvId}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("✅ RDV supprimé"); await loadStartupData(tk()); } else notify("❌ Erreur", false); };

  const envoyerTemoignage = async () => {
    if (!newTemo.trim()) { notify("Veuillez écrire votre témoignage", false); return; }
    setSendingTemo(true);
    try {
      const r = await fetch(`${BASE}/temoignages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ texte: newTemo, note: newTemoNote }) });
      if (r.ok) {
        notify("⭐ Témoignage envoyé avec succès ! Il sera publié après validation par notre équipe.", true);
        setNewTemo(""); setNewTemoNote(5);
        await loadStartupData(tk());
        setTimeout(() => { const el = document.getElementById("mes-temoignages"); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 300);
      } else { const err = await r.json(); notify(err.message || "❌ Erreur lors de l'envoi. Veuillez réessayer.", false); }
    } catch { notify("❌ Erreur réseau. Vérifiez votre connexion.", false); }
    finally { setSendingTemo(false); }
  };

  const envoyerDemande = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demandeForm.description) { notify("Décrivez votre besoin", false); return; }
    let svc = demandeForm.service;
    if (svc === "Autre service" && customService.trim()) svc = customService.trim();
    setSendingDemande(true);
    try {
      const r = await fetch(`${BASE}/demandes-service`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ service: svc, description: demandeForm.description, delai: demandeForm.delai, objectif: demandeForm.objectif, telephone: demandeForm.telephone, type_application: demandeForm.type_application, domaine: demandeForm.domaine }) });
      if (r.ok) {
        notify("✅ Demande envoyée !");
        setServiceModal(null); setShowPlateformesModal(false);
        setDemandeForm({ service: "", description: "", delai: "", objectif: "", telephone: "", type_application: "", domaine: "" });
        setCustomService(""); setShowCustomInput(false);
        const nd = await fetch(`${BASE}/demandes-service/mes-demandes`, { headers: hdr() });
        if (nd.ok) setDemandes(await nd.json());
        setTimeout(() => setTab("mes-demandes"), 800);
      } else notify("❌ Erreur", false);
    } catch { notify("❌ Erreur réseau", false); }
    finally { setSendingDemande(false); }
  };

  const modifierDemande = async (id: number, data: any) => { const r = await fetch(`${BASE}/demandes-service/${id}`, { method: "PUT", headers: hdrJ(), body: JSON.stringify(data) }); if (r.ok) { notify("✅ Modifiée !"); const res = await fetch(`${BASE}/demandes-service/mes-demandes`, { headers: hdr() }); if (res.ok) setDemandes(await res.json()); setEditingDemande(null); } else notify("❌ Erreur", false); };
  const supprimerDemande = async (id: number) => { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/demandes-service/client/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("✅ Supprimée"); const res = await fetch(`${BASE}/demandes-service/mes-demandes`, { headers: hdr() }); if (res.ok) setDemandes(await res.json()); } else notify("❌ Erreur", false); };
  const demandeExistePourFormation = (id: number) => demandes.some(d => d.service === "formation" && (d.formationId === id || d.formation?.id === id));
  const demanderFormation = async (id: number, titre: string) => { const r = await fetch(`${BASE}/demandes-service/formation/${id}`, { method: "POST", headers: hdr() }); if (r.ok) { notify(`✅ Demande pour "${titre}" !`); const res = await fetch(`${BASE}/demandes-service/mes-demandes`, { headers: hdr() }); if (res.ok) setDemandes(await res.json()); loadFormationsData(); } else { const err = await r.json(); notify(`❌ ${err.message}`, false); } };
  const annulerDemandeFormation = async (formationId: number) => { const d = demandes.find(x => x.service === "formation" && (x.formationId === formationId || x.formation?.id === formationId)); if (!d) return; if (!confirm("Annuler ?")) return; const r = await fetch(`${BASE}/demandes-service/client/${d.id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("✅ Annulée !"); const res = await fetch(`${BASE}/demandes-service/mes-demandes`, { headers: hdr() }); if (res.ok) setDemandes(await res.json()); loadFormationsData(); } };
  const openService = (slug: string) => { const tel = startup?.user?.telephone || ""; if (slug === "nos-plateformes") { setDemandeForm({ ...demandeForm, service: "nos-plateformes", telephone: tel, type_application: "", domaine: "" }); setShowPlateformesModal(true); } else if (slug === "formations") { navigateToServicesTab("formations"); } else { setDemandeForm({ ...demandeForm, service: slug, telephone: tel, type_application: "", domaine: "" }); setServiceModal(slug); } };
  const accepterDevis = async (devisId: number) => { const r = await fetch(`${BASE}/devis/${devisId}/client-statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "accepte" }) }); if (r.ok) { notify("✅ Devis accepté !"); await loadMesDevis(); } else notify("❌ Erreur", false); };
  const refuserDevis = async (devisId: number) => { if (!confirm("Refuser ce devis ?")) return; const r = await fetch(`${BASE}/devis/${devisId}/client-statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) }); if (r.ok) { notify("❌ Devis refusé"); loadMesDevis(); } else notify("Erreur", false); };
  const navigateToServicesTab = useCallback((subTab: "catalogue" | "formations" | "podcasts" | "personnalise") => { setTab("services"); setServiceTab(subTab); }, []);
  const loadPublicTestimonials = useCallback(async () => { const r = await fetch(`${BASE}/temoignages/publics`); if (r.ok) setPubTemos(await r.json()); }, []);
  const loadFormationsData = useCallback(async () => { setFormationsLoading(true); try { const fR = await fetch(`${BASE}/formations/public`); if (fR.ok) setFormations(await fR.json()); else setFormations([]); const pR = await fetch(`${BASE}/podcasts/public`); if (pR.ok) setPodcasts(await pR.json()); else setPodcasts([]); } catch { setFormations([]); setPodcasts([]); } finally { setFormationsLoading(false); } }, []);
  const loadMesDevis = useCallback(async () => { try { const r = await fetch(`${BASE}/devis/client/mes-devis`, { headers: hdr() }); setMesDevis(r.ok ? await r.json() : []); } catch { setMesDevis([]); } }, [hdr]);

  useEffect(() => {
    const token = tk();
    if (!token) { router.replace("/connexion"); return; }
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (!res.ok) { localStorage.removeItem("access_token"); localStorage.removeItem("user"); router.replace("/connexion"); throw new Error(); }
        const user = await res.json();
        if (user.role !== "startup") { localStorage.removeItem("access_token"); localStorage.removeItem("user"); router.replace(user.role === "expert" ? "/dashboard/expert" : user.role === "admin" ? "/dashboard/admin" : "/"); return; }
        setRealUser(user); localStorage.setItem("user", JSON.stringify(user)); await loadStartupData(token);
      })
      .catch(() => setError("Impossible de charger vos données."))
      .finally(() => setLoadingAuth(false));
  }, []);

  useEffect(() => { if (startup?.secteur) loadRecommendedExperts(); }, [startup?.secteur, loadRecommendedExperts]);
  useEffect(() => { if (realUser?.id) loadPropositions(); }, [realUser?.id, loadPropositions]);
  useEffect(() => { if (tab === "messages") { loadAllMessages(); const i = setInterval(() => loadAllMessages(), 5000); return () => clearInterval(i); } }, [tab, loadAllMessages]);
  useEffect(() => { const i = setInterval(async () => { const r = await fetch(`${BASE}/rendez-vous/startup`, { headers: hdr() }); if (r.ok) setRdvs(await r.json()); await loadPropositions(); }, 30000); return () => clearInterval(i); }, [hdr, loadPropositions]);
  useEffect(() => { loadFormationsData(); loadPublicTestimonials(); loadMesDevis(); }, []);
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation]);
  useEffect(() => { if (!pubTemos.length) return; const t = setInterval(() => { if (!tAnim) setTIdx(p => (p + 1) % pubTemos.length); }, 5000); return () => clearInterval(t); }, [pubTemos.length, tAnim]);
  function goT(i: number) { if (tAnim || !pubTemos.length) return; setTAnim(true); setTimeout(() => { setTIdx(i); setTAnim(false); }, 280); }

  // Polling demandes toutes les 30s pour capter changement de statut
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BASE}/demandes-service/mes-demandes?_=${Date.now()}`, { headers: hdr() });
        if (res.ok) setDemandes(await res.json());
      } catch { /* silencieux */ }
    }, 30000);
    return () => clearInterval(interval);
  }, [hdr]);

  const photoUrl = startup?.photo ? `${BASE}/uploads/photos/${startup.photo}` : null;
  const initials = realUser ? (realUser.prenom?.[0] || "") + (realUser.nom?.[0] || "") : "?";
  const startupSecteurNorm = (startup?.secteur || "").toLowerCase().trim();
  const filteredExperts = experts.filter(e => !expertFilter || e.user?.nom?.toLowerCase().includes(expertFilter.toLowerCase()) || e.domaine?.toLowerCase().includes(expertFilter.toLowerCase())).map(e => ({ ...e, _sectorMatch: startupSecteurNorm && ((e.domaine || "").toLowerCase().includes(startupSecteurNorm) || startupSecteurNorm.includes((e.domaine || "").toLowerCase())) }));
  const curTemo = pubTemos[tIdx % Math.max(pubTemos.length, 1)];
  const domainesDisponibles = ["Tous", ...Array.from(new Set(formations.map(f => f.domaine || "Autres"))).filter(Boolean).sort()];
  const filteredFormations = formations.filter(f => (domaineFilter === "Tous" || f.domaine === domaineFilter) && (!formSearch || f.titre?.toLowerCase().includes(formSearch.toLowerCase()) || f.description?.toLowerCase().includes(formSearch.toLowerCase())));
  const formsByDomaine: Record<string, any[]> = {};
  filteredFormations.forEach(f => { const d = f.domaine || "Autres"; if (!formsByDomaine[d]) formsByDomaine[d] = []; formsByDomaine[d].push(f); });
  const filteredPodcasts = podcasts.filter(p => (domaineFilter === "Tous" || p.domaine === domaineFilter) && (!formSearch || p.titre?.toLowerCase().includes(formSearch.toLowerCase())));

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "accueil", label: "Accueil", icon: "🏠" },
    { id: "services", label: "Services", icon: "🛠️" },
    { id: "profil", label: "Mon Profil", icon: "👤" },
    { id: "experts", label: "Experts", icon: "⭐" },
    { id: "rdv", label: "Rendez-vous", icon: "📅" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "temoignages", label: "Témoignages", icon: "🌟" },
    { id: "mes-demandes", label: "Mes Demandes", icon: "📋" },
    { id: "mes-devis", label: "Mes Devis", icon: "📄" },
  ];

  if (loadingAuth) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}>
      <div style={{ textAlign: "center" }}><div style={{ width: 48, height: 48, border: "4px solid #F59E0B", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} /><div style={{ color: "#0A2540", fontWeight: 600 }}>Vérification des accès...</div></div>
    </div>
  );
  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 500, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>Erreur</div>
        <div style={{ color: "#64748B", marginBottom: 24 }}>{error}</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => window.location.reload()} style={{ background: "#F59E0B", color: "#0A2540", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700, cursor: "pointer" }}>Réessayer</button>
          <button onClick={forceLogout} style={{ background: "#0A2540", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700, cursor: "pointer" }}>Se reconnecter</button>
        </div>
      </div>
    </div>
  );
  if (!realUser || !startup) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F0F4FA;}
        .btn{font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;border:none;border-radius:10px;cursor:pointer;padding:10px 20px;font-size:13.5px;transition:all .2s;display:inline-flex;align-items:center;gap:7px;}
        .btn-gold{background:#F59E0B;color:#0A2540;}.btn-gold:hover{background:#D97706;transform:translateY(-2px);box-shadow:0 8px 20px rgba(245,158,11,.3);}
        .btn-dark{background:#0A2540;color:#fff;}.btn-dark:hover{background:#F59E0B;color:#0A2540;transform:translateY(-2px);}
        .btn-outline{background:transparent;border:2px solid #E8EEF6;color:#475569;}.btn-outline:hover{border-color:#F59E0B;color:#D97706;}
        .btn-green{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;}.btn-green:hover{background:#059669;color:#fff;}
        .btn-red{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;}.btn-red:hover{background:#DC2626;color:#fff;}
        .btn-purple{background:#F3F0FF;color:#7C3AED;border:1px solid #DDD6FE;}.btn-purple:hover{background:#7C3AED;color:#fff;}
        .card{background:#fff;border:1px solid #E8EEF6;border-radius:18px;overflow:hidden;}
        .inp{width:100%;background:#F7F9FC;border:1.5px solid #E2E8F0;border-radius:10px;padding:11px 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#0A2540;outline:none;transition:border-color .2s;}
        .inp:focus{border-color:#F59E0B;box-shadow:0 0 0 3px rgba(245,158,11,.1);}
        textarea.inp{resize:vertical;min-height:90px;}
        .lbl{font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px;}
        .svc-card{background:#fff;border:1.5px solid #E8EEF6;border-radius:20px;overflow:hidden;transition:transform .32s cubic-bezier(.22,1,.36,1),box-shadow .32s,border-color .32s;cursor:pointer;}
        .svc-card:hover{transform:translateY(-8px);box-shadow:0 24px 56px rgba(10,37,64,.12);border-color:rgba(245,158,11,.4);}
        .expert-card{background:#fff;border:1.5px solid #E8EEF6;border-radius:16px;transition:transform .28s,box-shadow .28s;}
        .expert-card:hover{transform:translateY(-5px);box-shadow:0 14px 36px rgba(10,37,64,.1);}
        .adn-card{background:#fff;border-radius:20px;border:1.5px solid rgba(10,37,64,.07);box-shadow:0 4px 20px rgba(10,37,64,.05);overflow:hidden;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s;cursor:pointer;}
        .adn-card:hover{transform:translateY(-8px);box-shadow:0 28px 60px rgba(10,37,64,.12);}
        .tab-btn{background:none;border:none;cursor:pointer;padding:11px 8px;font-size:12.5px;font-weight:600;color:#8A9AB5;border-bottom:2.5px solid transparent;font-family:'Plus Jakarta Sans',sans-serif;transition:all .2s;white-space:nowrap;display:flex;align-items:center;gap:5px;}
        .tab-btn.on{color:#0A2540;border-bottom-color:#F59E0B;font-weight:800;}
        .sub-tab{background:none;border:none;cursor:pointer;padding:9px 18px;font-size:13px;font-weight:600;color:#64748B;border-radius:99px;font-family:'Plus Jakarta Sans',sans-serif;transition:all .2s;white-space:nowrap;}
        .sub-tab.on{background:#F59E0B;color:#0A2540;font-weight:700;}
        .pill{border:1.5px solid #E2E8F0;border-radius:99px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;background:#fff;color:#64748B;transition:all .22s;white-space:nowrap;}
        .pill:hover{border-color:#F59E0B;color:#92400E;background:#FFFBEB;}
        .pill.active{background:#F59E0B;color:#0A2540;border-color:#F59E0B;font-weight:700;}
        .form-card{background:#fff;border:1.5px solid #E8EEF6;border-radius:18px;overflow:hidden;transition:all .3s cubic-bezier(.22,1,.36,1);cursor:pointer;}
        .form-card:hover{transform:translateY(-7px);box-shadow:0 20px 48px rgba(10,37,64,.12);border-color:rgba(245,158,11,.4);}
        .pod-card{background:#fff;border:1.5px solid #E8EEF6;border-radius:16px;overflow:hidden;transition:all .3s;cursor:pointer;}
        .pod-card:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(139,92,246,.15);border-color:rgba(139,92,246,.35);}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.65);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(6px);}
        .modal-box{background:#fff;border-radius:24px;width:100%;max-width:660px;max-height:92vh;overflow-y:auto;box-shadow:0 32px 80px rgba(10,37,64,.28);}
        .prop-card{background:#fff;border:1.5px solid #FDE68A;border-radius:16px;padding:18px 20px;margin-bottom:14px;border-left:4px solid #F59E0B;box-shadow:0 4px 16px rgba(245,158,11,.08);}
        .en-cours-banner{background:linear-gradient(135deg,#EFF6FF,#DBEAFE);border:1.5px solid #93C5FD;border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:12px;animation:pulseBlue 2s infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes pulseBlue{0%,100%{box-shadow:0 0 0 0 rgba(59,130,246,.15)}50%{box-shadow:0 0 0 8px rgba(59,130,246,0)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes spin360{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .stat-card{background:linear-gradient(135deg,#0A2540,#1a3f6f);border-radius:16px;padding:18px 20px;color:#fff;position:relative;overflow:hidden;}
        .stat-card::before{content:'';position:absolute;top:-20px;right:-20px;width:80px;height:80px;background:rgba(245,158,11,.1);border-radius:50%;}
      `}</style>

      {toast.text && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.ok ? "#ECFDF5" : "#FEF2F2", border: `1.5px solid ${toast.ok ? "#A7F3D0" : "#FECACA"}`, borderLeft: `4px solid ${toast.ok ? "#059669" : "#DC2626"}`, color: toast.ok ? "#059669" : "#DC2626", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 13, boxShadow: "0 8px 28px rgba(0,0,0,.12)", animation: "fadeInUp .3s ease" }}>
          {toast.text}
        </div>
      )}

      {selectedFormation && <FormationModal formation={selectedFormation} onClose={() => setSelectedFormation(null)} demanderFormation={demanderFormation} demandeExiste={demandeExistePourFormation(selectedFormation.id)} annulerDemandeFormation={annulerDemandeFormation} />}
      {selectedPodcast && <PodcastModal podcast={selectedPodcast} onClose={() => setSelectedPodcast(null)} navigateToFormationsTab={() => navigateToServicesTab("formations")} />}
      {serviceModal && serviceModal !== "nos-plateformes" && <GenericServiceModal serviceSlug={serviceModal} onClose={() => setServiceModal(null)} demandeForm={demandeForm} setDemandeForm={setDemandeForm} envoyerDemande={envoyerDemande} sendingDemande={sendingDemande} />}
      {showPlateformesModal && <PlateformesModal onClose={() => setShowPlateformesModal(false)} startup={startup} demandeForm={demandeForm} setDemandeForm={setDemandeForm} envoyerDemande={envoyerDemande} sendingDemande={sendingDemande} />}
      {editingDemande && editingDemande.service !== "formation" && <EditDemandeModal demande={editingDemande} onClose={() => setEditingDemande(null)} onUpdate={modifierDemande} />}
      {editingRdv && <EditRdvModal rdv={editingRdv} onClose={() => setEditingRdv(null)} onUpdate={modifierRdv} />}

      {/* HEADER */}
      <header style={{ background: "linear-gradient(135deg,#0A2540 0%,#0f3460 100%)", height: 64, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(10,37,64,.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#F59E0B,#D97706)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, color: "#0A2540", boxShadow: "0 4px 12px rgba(245,158,11,.4)" }}>BEH</div>
          <div>
            <div style={{ color: "rgba(255,255,255,.5)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px" }}>Espace Startup</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{startup?.nom_startup || `${realUser?.prenom} ${realUser?.nom}`}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {demandesEnCours > 0 && (
            <button onClick={() => handleTabChange("mes-demandes")} style={{ background: "rgba(59,130,246,.15)", border: "1px solid rgba(59,130,246,.3)", color: "#93C5FD", borderRadius: 99, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, animation: "pulse 2s infinite" }}>
              🔄 {demandesEnCours} expert{demandesEnCours > 1 ? "s" : ""} en cours de sélection
            </button>
          )}
          {demandesEnAttente > 0 && (
            <button onClick={() => handleTabChange("mes-demandes")} style={{ background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.3)", color: "#F59E0B", borderRadius: 99, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
              🔔 {demandesEnAttente} en attente
            </button>
          )}
          <button onClick={forceLogout} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.65)", borderRadius: 9, padding: "7px 16px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13, transition: "all .2s" }}>
            Déconnexion
          </button>
        </div>
      </header>

      {/* ONGLETS */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8EEF6", position: "sticky", top: 64, zIndex: 90, boxShadow: "0 1px 8px rgba(10,37,64,.04)" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px", display: "flex", gap: 2, overflowX: "auto" }}>
          {TABS.map(t => {
            let badge: number | null = null;
            if (t.id === "messages" && showMsgBadge) badge = unreadMsgCount;
            if (t.id === "rdv" && showRdvBadge) badge = unreadPropositions + pendingRdvCount;
            if (t.id === "mes-demandes" && tab !== "mes-demandes" && (demandesEnAttente > 0 || demandesEnCours > 0)) badge = demandesEnAttente + demandesEnCours;
            if (t.id === "mes-devis" && tab !== "mes-devis" && mesDevisEnAttente > 0) badge = mesDevisEnAttente;
            return (
              <button key={t.id} className={`tab-btn${tab === t.id ? " on" : ""}`} onClick={() => handleTabChange(t.id)}>
                {t.icon} {t.label}
                {badge !== null && badge > 0 && (
                  <span style={{ background: t.id === "mes-demandes" ? (demandesEnCours > 0 ? "#3B82F6" : "#F59E0B") : "#EF4444", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 800, marginLeft: 2 }}>{badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 24px" }}>
        {/* ACCUEIL */}
        {tab === "accueil" && (
          <div>
            <section style={{ position: "relative", overflow: "hidden", minHeight: 440, borderRadius: 20 }}>
              <div style={{ position: "absolute", inset: 0 }}>
                <Image src="/image.png" alt="" fill priority style={{ objectFit: "cover" }} sizes="100vw" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(108deg,rgba(6,14,26,.96) 0%,rgba(10,30,60,.82) 45%,rgba(10,37,64,.15) 100%)" }} />
              </div>
              <div style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "80px 36px 90px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 22, background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)", borderRadius: 99, padding: "5px 16px 5px 10px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B", animation: "pulse 2s infinite", display: "inline-block" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#F59E0B" }}>Bienvenue, {realUser?.prenom} 👋</span>
                </div>
                <h1 style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 900, color: "#fff", marginBottom: 18, lineHeight: 1.08, letterSpacing: "-1px" }}>
                  Propulsez votre <span style={{ color: "#F59E0B" }}>startup</span><br />vers l'excellence
                </h1>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,.68)", maxWidth: 480, lineHeight: 1.9, marginBottom: 30 }}>
                  Accédez à nos experts certifiés, services exclusifs et ressources réservées aux membres BEH.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <button className="btn btn-gold" style={{ padding: "13px 26px", fontSize: 14 }} onClick={() => handleTabChange("services")}>Explorer les services <FaArrowRight size={12} /></button>
                  <button className="btn" style={{ padding: "13px 26px", fontSize: 14, background: "rgba(255,255,255,.1)", border: "1.5px solid rgba(255,255,255,.2)", color: "#fff" }} onClick={() => handleTabChange("experts")}>Nos experts <FaArrowRight size={12} /></button>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap" }}>
                  {[{ label: "Demandes", value: demandes.length, sub: "envoyées" }, { label: "Rendez-vous", value: rdvs.length, sub: "planifiés" }, { label: "Devis", value: mesDevis.length, sub: "reçus" }].map((s, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 12, padding: "12px 18px", backdropFilter: "blur(8px)" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#F59E0B" }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>{s.label} {s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section style={{ padding: "64px 28px", background: "#F8FAFC", marginTop: 20, borderRadius: 20 }}>
              <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <Reveal><div style={{ textAlign: "center", marginBottom: 44 }}><h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(28px,4vw,44px)", color: "#0A2540" }}>Notre <span style={{ fontStyle: "italic", color: "#F59E0B" }}>ADN</span></h2></div></Reveal>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                  {ADN_ITEMS.map((card, i) => (
                    <Reveal key={i} delay={i * .1}>
                      <div className="adn-card" onClick={() => window.open(`/a-propos#${card.anchor}`, "_blank")}>
                        <div style={{ height: 4, background: `linear-gradient(90deg,${card.color},${card.color}55)` }} />
                        <div style={{ padding: "22px 22px 20px" }}>
                          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${card.color}15`, border: `1.5px solid ${card.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 18, color: card.color }}>{i === 0 ? <FaBullseye /> : i === 1 ? <FaRocket /> : <FaStar />}</div>
                          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, color: "#0A2540", fontSize: 20, marginBottom: 8 }}>{card.title}</h3>
                          <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.82, marginBottom: 12 }}>{card.body}</p>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: card.color }}>En savoir plus <FaArrowRight size={9} /></div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>

            <section style={{ padding: "64px 28px", background: "#fff", marginTop: 20, borderRadius: 20 }}>
              <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <Reveal>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(24px,3vw,38px)", color: "#0A2540" }}>Experts <span style={{ fontStyle: "italic", color: "#F59E0B" }}>recommandés</span></h2>
                      {startup?.secteur && <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Sélectionnés pour : <strong style={{ color: "#0A2540" }}>{startup.secteur}</strong></p>}
                    </div>
                    <button className="btn btn-dark" onClick={() => handleTabChange("experts")} style={{ padding: "10px 20px" }}>Tous les experts <FaArrowRight size={11} /></button>
                  </div>
                </Reveal>
                {loadingExperts ? <div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ width: 38, height: 38, border: "3px solid #F59E0B", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} /></div>
                  : pubExperts.length === 0 ? <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>Aucun expert trouvé.</div>
                  : <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
                    {pubExperts.map((ex, i) => {
                      const d = (ex.domaine || "").toLowerCase();
                      const isMatch = startupSecteurNorm && (d.includes(startupSecteurNorm) || startupSecteurNorm.includes(d));
                      return <Reveal key={ex.id} delay={i * .07}><ExpertCard e={ex} isSectorMatch={isMatch} onMessage={() => { setSelectedExpert(ex); handleTabChange("messages"); loadConversation(ex.user_id || ex.user?.id); }} onRdv={() => { setRdvForm({ ...rdvForm, expert_id: String(ex.id), sujet: "" }); handleTabChange("rdv"); }} BASE={BASE} /></Reveal>;
                    })}
                  </div>}
              </div>
            </section>

            {pubTemos.length > 0 && (
              <section style={{ padding: "64px 28px", background: "#F8FAFC", marginTop: 20, borderRadius: 20 }}>
                <div style={{ maxWidth: 780, margin: "0 auto" }}>
                  <Reveal><div style={{ textAlign: "center", marginBottom: 36 }}><h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(24px,4vw,38px)", color: "#0A2540" }}>Ce que disent nos <span style={{ fontStyle: "italic", color: "#F59E0B" }}>clients</span></h2></div></Reveal>
                  {curTemo && (
                    <>
                      <div style={{ background: "#0A2540", borderRadius: 22, padding: "36px 44px", position: "relative", opacity: tAnim ? 0 : 1, transition: "all .3s" }}>
                        <FaQuoteLeft style={{ position: "absolute", top: 22, left: 28, fontSize: 32, color: "rgba(245,158,11,.15)" }} />
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= (curTemo.note || 5) ? "#F59E0B" : "#334155", fontSize: 20 }}>★</span>)}</div>
                        <p style={{ fontStyle: "italic", color: "#fff", lineHeight: 1.8, textAlign: "center", marginBottom: 24, fontSize: "clamp(15px,2vw,19px)" }}>&ldquo;{curTemo.texte}&rdquo;</p>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#F59E0B,#D97706)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: "#0A2540", margin: "0 auto 10px" }}>{curTemo.user?.prenom?.[0]}{curTemo.user?.nom?.[0]}</div>
                          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{curTemo.user?.prenom} {curTemo.user?.nom}</div>
                          <div style={{ color: "#F59E0B", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginTop: 4 }}>{curTemo.startup?.nom_startup || "Startup BEH"}</div>
                        </div>
                      </div>
                      {pubTemos.length > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
                          <button onClick={() => goT((tIdx - 1 + pubTemos.length) % pubTemos.length)} style={{ width: 36, height: 36, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(245,158,11,.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><FaChevronLeft size={12} /></button>
                          <div style={{ display: "flex", gap: 6 }}>{pubTemos.map((_, i) => <button key={i} onClick={() => goT(i)} style={{ height: 6, width: i === tIdx ? 22 : 6, borderRadius: 99, border: "none", cursor: "pointer", background: i === tIdx ? "#F59E0B" : "rgba(10,37,64,.2)", transition: "all .3s" }} />)}</div>
                          <button onClick={() => goT((tIdx + 1) % pubTemos.length)} style={{ width: 36, height: 36, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(245,158,11,.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><FaChevronRight size={12} /></button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
            )}

            <section style={{ padding: "56px 28px", background: "linear-gradient(135deg,#0A2540,#0f3460)", marginTop: 20, borderRadius: 20 }}>
              <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
                <Reveal>
                  <h2 style={{ fontWeight: 900, color: "#fff", fontSize: "clamp(22px,4vw,36px)", marginBottom: 12 }}>Prêt à accélérer ?</h2>
                  <p style={{ color: "rgba(255,255,255,.6)", fontSize: 14, lineHeight: 1.85, marginBottom: 28 }}>Explorez nos services et trouvez l'accompagnement sur mesure pour votre startup.</p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                    <button className="btn btn-gold" style={{ padding: "13px 28px", fontSize: 14 }} onClick={() => handleTabChange("services")}>Voir les services <FaArrowRight size={12} /></button>
                    <button className="btn" style={{ padding: "13px 28px", fontSize: 14, background: "rgba(255,255,255,.08)", border: "1.5px solid rgba(255,255,255,.2)", color: "#fff" }} onClick={() => handleTabChange("experts")}>Nos experts <FaArrowRight size={12} /></button>
                  </div>
                </Reveal>
              </div>
            </section>
          </div>
        )}

        {/* SERVICES */}
        {tab === "services" && (
          <div>
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E8EEF6", padding: "12px 18px", marginBottom: 24, display: "flex", gap: 6, overflowX: "auto", flexWrap: "wrap" }}>
              {[{ id: "catalogue", label: "📦 Catalogue" }, { id: "formations", label: `🎓 Formations${formations.length ? ` (${formations.length})` : ""}` }, { id: "podcasts", label: `🎙️ Podcasts${podcasts.length ? ` (${podcasts.length})` : ""}` }, { id: "personnalise", label: "✍️ Personnalisée" }].map(st => (
                <button key={st.id} className={`sub-tab${serviceTab === st.id ? " on" : ""}`} onClick={() => setServiceTab(st.id as any)}>{st.label}</button>
              ))}
            </div>

            {serviceTab === "catalogue" && (
              <div>
                <div style={{ background: "linear-gradient(135deg,#0A2540,#0f3460)", borderRadius: 18, padding: "28px 32px", marginBottom: 22, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, background: "rgba(245,158,11,.07)", borderRadius: "50%" }} />
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <span style={{ background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.3)", color: "#F59E0B", fontWeight: 700, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", padding: "4px 14px", borderRadius: 99, display: "inline-block", marginBottom: 14 }}>Nos Services</span>
                    <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 24, marginBottom: 8 }}>Choisissez votre <span style={{ color: "#F59E0B" }}>accompagnement</span></h2>
                    <p style={{ color: "rgba(255,255,255,.6)", fontSize: 14 }}>Réponse garantie sous 24h. Sur mesure pour votre startup.</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
                  {Object.entries(SERVICES_INFO).map(([slug, svc]) => (
                    <div key={slug} className="svc-card" onClick={() => openService(slug)}>
                      <div style={{ height: 4, background: `linear-gradient(90deg,${svc.color},${svc.color}55)` }} />
                      <div style={{ padding: "22px 22px 18px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                          <div style={{ width: 52, height: 52, borderRadius: 14, background: `${svc.color}12`, border: `1.5px solid ${svc.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: svc.color }}>{svc.icon}</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ background: `${svc.color}15`, color: svc.color, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{svc.badge}</span>
                            <a href={`/services/${slug}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ width: 28, height: 28, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", textDecoration: "none" }}><FaExternalLinkAlt size={10} /></a>
                          </div>
                        </div>
                        <h3 style={{ fontWeight: 800, color: "#0A2540", fontSize: 17, marginBottom: 7 }}>{svc.label}</h3>
                        <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.75, marginBottom: 14 }}>{svc.desc}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>{svc.points.map((p: string) => <span key={p} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 99, padding: "2px 9px", fontSize: 11, color: "#475569", fontWeight: 600 }}>✓ {p}</span>)}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 11.5, color: "#8A9AB5", fontWeight: 600 }}>⏱ {svc.duree}</span>
                          <button className="btn btn-gold" style={{ padding: "9px 18px", fontSize: 12.5 }} onClick={e => { e.stopPropagation(); openService(slug); }}><FaPaperPlane size={11} /> Demander</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {serviceTab === "formations" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
                  <div><h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540", marginBottom: 4 }}>🎓 Formations disponibles</h2><p style={{ fontSize: 13, color: "#64748B" }}>{filteredFormations.length} formation{filteredFormations.length !== 1 ? "s" : ""}</p></div>
                  <button className="btn btn-gold" onClick={() => openService("formations")}><FaPaperPlane size={11} /> Formation personnalisée</button>
                </div>
                <div style={{ background: "#F8FAFC", border: "1px solid #E8EEF6", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
                  <div style={{ position: "relative", marginBottom: 12 }}><FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 13 }} /><input className="inp" placeholder="Rechercher..." style={{ paddingLeft: 36 }} value={formSearch} onChange={e => setFormSearch(e.target.value)} /></div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>{domainesDisponibles.map(d => <button key={d} className={`pill${domaineFilter === d ? " active" : ""}`} onClick={() => setDomaineFilter(d)}>{d}</button>)}</div>
                </div>
                {formationsLoading ? <div style={{ textAlign: "center", padding: "60px 0" }}><div style={{ width: 40, height: 40, border: "3px solid #F59E0B", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} /></div>
                  : filteredFormations.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0" }}><div style={{ fontSize: 48, marginBottom: 14 }}>🎓</div><div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540", marginBottom: 8 }}>Aucune formation trouvée</div><button className="btn btn-gold" onClick={() => openService("formations")}><FaPaperPlane size={11} /> Demande personnalisée</button></div>
                  : domaineFilter === "Tous" ? Object.entries(formsByDomaine).map(([domaine, fList]) => (
                    <div key={domaine} style={{ marginBottom: 36 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, borderBottom: "2px solid #F1F5F9", paddingBottom: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#F59E0B,#D97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff" }}><FaGraduationCap /></div>
                        <h3 style={{ fontWeight: 800, fontSize: 17, color: "#0A2540", margin: 0 }}>{domaine}</h3>
                        <span style={{ background: "#E8EEF6", borderRadius: 99, padding: "2px 8px", fontSize: 11, color: "#64748B" }}>{fList.length}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>{fList.map(f => <FormationCard key={f.id} f={f} onSelect={setSelectedFormation} demanderFormation={demanderFormation} demandeExiste={demandeExistePourFormation(f.id)} annulerDemandeFormation={annulerDemandeFormation} />)}</div>
                    </div>
                  )) : <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>{filteredFormations.map(f => <FormationCard key={f.id} f={f} onSelect={setSelectedFormation} demanderFormation={demanderFormation} demandeExiste={demandeExistePourFormation(f.id)} annulerDemandeFormation={annulerDemandeFormation} />)}</div>}
              </div>
            )}

            {serviceTab === "podcasts" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div><h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540", marginBottom: 4 }}>🎙️ Podcasts exclusifs</h2><p style={{ fontSize: 13, color: "#64748B" }}>{filteredPodcasts.length} podcast{filteredPodcasts.length !== 1 ? "s" : ""}</p></div>
                  <button className="btn btn-purple" onClick={() => openService("formations")}><FaPaperPlane size={11} /> Demander l'accès</button>
                </div>
                {filteredPodcasts.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0" }}><div style={{ fontSize: 48, marginBottom: 14 }}>🎙️</div><div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540" }}>Aucun podcast disponible</div></div>
                  : <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }}>{filteredPodcasts.map(p => <PodcastCard key={p.id} p={p} onSelect={setSelectedPodcast} />)}</div>}
              </div>
            )}

            {serviceTab === "personnalise" && (
              <div style={{ maxWidth: 720, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}><div style={{ fontSize: 48, marginBottom: 14 }}>✍️</div><h2 style={{ fontWeight: 800, fontSize: 22, color: "#0A2540", marginBottom: 8 }}>Demande personnalisée</h2><p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.8, maxWidth: 520, margin: "0 auto" }}>Décrivez votre besoin spécifique et notre équipe vous propose une solution sur mesure.</p></div>
                <div className="card">
                  <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>📋 Formulaire de demande</div></div>
                  <form onSubmit={envoyerDemande} style={{ padding: "24px" }}>
                    <div style={{ marginBottom: 14 }}><label className="lbl">Type de service</label><select className="inp" value={demandeForm.service || ""} onChange={e => { const val = e.target.value; setDemandeForm({ ...demandeForm, service: val }); setShowCustomInput(val === "Autre service"); if (val !== "Autre service") setCustomService(""); }}><option value="">Sélectionner...</option>{["Formation sur mesure", "Développement d'application", "Audit spécialisé", "Consulting avancé", "Autre service"].map(s => <option key={s}>{s}</option>)}</select></div>
                    {showCustomInput && <div style={{ marginBottom: 14 }}><label className="lbl">Précisez</label><input className="inp" value={customService} onChange={e => setCustomService(e.target.value)} required={demandeForm.service === "Autre service"} /></div>}
                    <div style={{ marginBottom: 14 }}><label className="lbl">Description *</label><textarea className="inp" rows={5} required value={demandeForm.description} onChange={e => setDemandeForm({ ...demandeForm, description: e.target.value })} placeholder="Expliquez votre contexte et vos besoins..." /></div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}><div><label className="lbl">Délai</label><select className="inp" value={demandeForm.delai} onChange={e => setDemandeForm({ ...demandeForm, delai: e.target.value })}><option value="">Sélectionner...</option>{["Urgent (< 2 semaines)", "1 mois", "2 à 3 mois", "3 à 6 mois", "Flexible"].map(d => <option key={d}>{d}</option>)}</select></div><div><label className="lbl">Objectif</label><input className="inp" value={demandeForm.objectif} onChange={e => setDemandeForm({ ...demandeForm, objectif: e.target.value })} /></div></div>
                    <div style={{ marginBottom: 14 }}><label className="lbl">Téléphone</label><input className="inp" type="tel" value={demandeForm.telephone} onChange={e => setDemandeForm({ ...demandeForm, telephone: e.target.value })} placeholder="+216 XX XXX XXX" /></div>
                    <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 12, padding: "12px 16px", marginBottom: 18, fontSize: 13, color: "#0369A1" }}>📞 Notre équipe vous contactera sous <strong>24h</strong>.</div>
                    <button type="submit" className="btn btn-gold" disabled={sendingDemande} style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: 15 }}>{sendingDemande ? "⏳ Envoi..." : <><FaPaperPlane /> Envoyer ma demande</>}</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PROFIL */}
        {tab === "profil" && (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "28px 24px", display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", background: "rgba(245,158,11,.15)", border: "3px solid #F59E0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {photoPreview ? <img src={photoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : photoUrl ? <img src={photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" onError={e => (e.currentTarget.style.display = "none")} /> : <span style={{ color: "#F59E0B", fontWeight: 900, fontSize: 26 }}>{initials}</span>}
                  </div>
                  <label style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, background: "#F59E0B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #0A2540" }}>
                    <FaCamera style={{ fontSize: 11, color: "#0A2540" }} />
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
                  </label>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>{realUser?.prenom} {realUser?.nom}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 3 }}>{startup?.nom_startup || "Startup"} · {realUser?.email}</div>
                  {startup?.secteur && <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.3)", borderRadius: 99, padding: "3px 10px", marginTop: 8, color: "#F59E0B", fontSize: 12, fontWeight: 600 }}><FaBriefcase style={{ fontSize: 10 }} /> {startup.secteur}</div>}
                  {photoFile && <button className="btn btn-gold" style={{ fontSize: 12, padding: "7px 14px", marginTop: 12 }} onClick={uploadPhoto}><FaCheck /> Sauvegarder la photo</button>}
                </div>
              </div>
            </div>
            <div className="card">
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>Informations de la startup</div></div>
              <div style={{ padding: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div><label className="lbl">Nom de la startup</label><input className="inp" value={editProfil.nom_startup || ""} onChange={e => setEditProfil({ ...editProfil, nom_startup: e.target.value })} placeholder="Ex: TechVision" /></div>
                  <div><label className="lbl">Secteur</label><input className="inp" value={editProfil.secteur || ""} onChange={e => setEditProfil({ ...editProfil, secteur: e.target.value })} placeholder="Ex: Fintech" /></div>
                  <div><label className="lbl">Fonction</label><input className="inp" value={editProfil.fonction || ""} onChange={e => setEditProfil({ ...editProfil, fonction: e.target.value })} placeholder="Ex: CEO" /></div>
                  <div><label className="lbl">Taille équipe</label><select className="inp" value={editProfil.taille || ""} onChange={e => setEditProfil({ ...editProfil, taille: e.target.value })}><option value="">Sélectionner</option>{["1-5", "6-15", "16-50", "51-100", "100+"].map(t => <option key={t} value={t}>{t} personnes</option>)}</select></div>
                  <div><label className="lbl">Site web</label><input className="inp" value={editProfil.site_web || ""} onChange={e => setEditProfil({ ...editProfil, site_web: e.target.value })} placeholder="https://..." /></div>
                  <div><label className="lbl">Localisation</label><input className="inp" value={editProfil.localisation || ""} onChange={e => setEditProfil({ ...editProfil, localisation: e.target.value })} placeholder="Ex: Tunis" /></div>
                </div>
                <div style={{ marginBottom: 20 }}><label className="lbl">Description</label><textarea className="inp" rows={4} value={editProfil.description || ""} onChange={e => setEditProfil({ ...editProfil, description: e.target.value })} placeholder="Décrivez votre startup..." /></div>
                <button className="btn btn-gold" style={{ padding: "12px 28px" }} onClick={saveProfil}><FaCheck /> Sauvegarder les modifications</button>
              </div>
            </div>
          </div>
        )}

        {/* EXPERTS */}
        {tab === "experts" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200 }}><FaSearch style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#B8C4D6", fontSize: 13 }} /><input className="inp" placeholder="Rechercher par nom ou domaine..." style={{ paddingLeft: 38 }} value={expertFilter} onChange={e => setExpertFilter(e.target.value)} /></div>
              <div style={{ color: "#8A9AB5", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{filteredExperts.length} expert{filteredExperts.length > 1 ? "s" : ""}</div>
              {startup?.secteur && <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 99, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#92400E" }}>⭐ Recommandés pour : <strong>{startup.secteur}</strong></div>}
            </div>
            {loadingExperts ? <div style={{ textAlign: "center", padding: "40px 0" }}><div style={{ width: 38, height: 38, border: "3px solid #F59E0B", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} /></div>
              : expertsError ? <div style={{ textAlign: "center", color: "#DC2626", padding: "40px 0" }}>{expertsError} <button onClick={loadRecommendedExperts} className="btn btn-outline" style={{ marginLeft: 10 }}>Réessayer</button></div>
              : filteredExperts.some(e => e._sectorMatch) && filteredExperts.some(e => !e._sectorMatch) && !expertFilter ? (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}><div style={{ height: 2, flex: 1, background: "linear-gradient(90deg,#F59E0B,#FDE68A)" }} /><span style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 99, padding: "4px 14px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>⭐ Experts de votre secteur — {startup?.secteur}</span><div style={{ height: 2, flex: 1, background: "linear-gradient(90deg,#FDE68A,transparent)" }} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginBottom: 36 }}>{filteredExperts.filter(e => e._sectorMatch).map(e => <ExpertCard key={e.id} e={e} isSectorMatch={true} onMessage={() => { setSelectedExpert(e); handleTabChange("messages"); loadConversation(e.user_id || e.user?.id); }} onRdv={() => { setRdvForm({ ...rdvForm, expert_id: String(e.id), sujet: "" }); handleTabChange("rdv"); }} BASE={BASE} />)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}><div style={{ height: 2, flex: 1, background: "#E8EEF6" }} /><span style={{ background: "#F8FAFC", color: "#64748B", borderRadius: 99, padding: "4px 14px", fontSize: 12, fontWeight: 700, border: "1px solid #E2E8F0", whiteSpace: "nowrap" }}>Autres experts</span><div style={{ height: 2, flex: 1, background: "#E8EEF6" }} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>{filteredExperts.filter(e => !e._sectorMatch).map(e => <ExpertCard key={e.id} e={e} isSectorMatch={false} onMessage={() => { setSelectedExpert(e); handleTabChange("messages"); loadConversation(e.user_id || e.user?.id); }} onRdv={() => { setRdvForm({ ...rdvForm, expert_id: String(e.id), sujet: "" }); handleTabChange("rdv"); }} BASE={BASE} />)}</div>
                </div>
              ) : filteredExperts.length === 0 ? <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>Aucun expert trouvé.</div>
              : <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>{filteredExperts.map(e => <ExpertCard key={e.id} e={e} isSectorMatch={e._sectorMatch} onMessage={() => { setSelectedExpert(e); handleTabChange("messages"); loadConversation(e.user_id || e.user?.id); }} onRdv={() => { setRdvForm({ ...rdvForm, expert_id: String(e.id), sujet: "" }); handleTabChange("rdv"); }} BASE={BASE} />)}</div>}
          </div>
        )}

        {/* RENDEZ-VOUS */}
        {tab === "rdv" && (
          <div>
            {propositions.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📅</div>
                  <div><h3 style={{ fontWeight: 800, fontSize: 16, color: "#0A2540" }}>Propositions de nouveau créneau</h3><div style={{ fontSize: 12, color: "#8A9AB5" }}>Des experts ont proposé de nouveaux créneaux</div></div>
                  <span style={{ background: "#F59E0B", color: "#0A2540", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 800, marginLeft: "auto" }}>{propositions.length}</span>
                </div>
                {propositions.map((prop, idx) => (
                  <div key={prop.id || `prop-${idx}`} className="prop-card">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#0A2540", color: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{prop.expert_name?.[0] || "E"}</div>
                          <div><div style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>{prop.expert_name || "Expert"}</div><div style={{ fontSize: 11, color: "#92400E" }}>Reçu le {new Date(prop.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</div></div>
                        </div>
                        <div style={{ background: "#FFFBEB", borderRadius: 10, padding: "12px 14px", marginBottom: prop.raison ? 8 : 0, border: "1px solid #FDE68A" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.8px" }}>Nouveau créneau proposé</div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#0A2540" }}>📅 {prop.date_formatted || new Date(prop.nouvelle_date).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                        {prop.raison && prop.raison !== "Non précisée" && <div style={{ fontSize: 12, color: "#64748B", marginTop: 6, fontStyle: "italic" }}>💬 Raison : {prop.raison}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button className="btn btn-green" style={{ fontSize: 13 }} onClick={() => repondreProposition(prop, true)}>✅ Accepter</button>
                        <button className="btn btn-red" style={{ fontSize: 13 }} onClick={() => repondreProposition(prop, false)}>❌ Refuser</button>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ height: 1, background: "#E8EEF6", margin: "8px 0 24px" }} />
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20 }}>
              <div className="card">
                <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>📅 Prendre un rendez-vous</div></div>
                <div style={{ padding: "24px" }}>
                  <div style={{ marginBottom: 14 }}><label className="lbl">Expert *</label><select className="inp" value={rdvForm.expert_id} onChange={e => setRdvForm({ ...rdvForm, expert_id: e.target.value })}><option value="">Sélectionner un expert...</option>{experts.map(e => <option key={e.id} value={e.id}>{e.user?.prenom} {e.user?.nom} — {e.domaine || "Expert"}</option>)}</select></div>
                  <div style={{ marginBottom: 14 }}><label className="lbl">Sujet *</label><input className="inp" type="text" placeholder="Ex: Stratégie commerciale..." value={rdvForm.sujet} onChange={e => setRdvForm({ ...rdvForm, sujet: e.target.value })} /></div>
                  <div style={{ marginBottom: 20 }}><label className="lbl">Date & heure *</label><input className="inp" type="datetime-local" value={rdvForm.date_rdv} onChange={e => setRdvForm({ ...rdvForm, date_rdv: e.target.value })} min={new Date().toISOString().slice(0, 16)} /></div>
                  <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center", padding: "13px" }} onClick={prendreRdv}><FaCalendar /> Confirmer le rendez-vous</button>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>Mes rendez-vous ({rdvs.length})</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />En attente</span>
                    <span style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />Confirmé</span>
                  </div>
                </div>
                {rdvs.length === 0 ? (
                  <div className="card" style={{ padding: "40px 0", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📅</div><div style={{ fontWeight: 600, color: "#8A9AB5", fontSize: 14 }}>Aucun rendez-vous planifié</div></div>
                ) : rdvs.map(r => <RdvCard key={r.id} rdv={r} onModifier={setEditingRdv} onAnnuler={annulerRdv} />)}
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 16, height: "calc(100vh - 200px)" }}>
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9", fontWeight: 700, fontSize: 14, color: "#0A2540", background: "#FAFBFE" }}>Experts ({experts.length})</div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {experts.map(e => {
                  const expertUserId = e.user_id || e.user?.id;
                  const unread = allMessages.filter(m => m.sender_id === expertUserId && m.receiver_id === realUser?.id && !m.lu).length;
                  return (
                    <div key={e.id} onClick={() => { setSelectedExpert(e); loadConversation(expertUserId); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", cursor: "pointer", background: selectedExpert?.id === e.id ? "#FFFBEB" : "transparent", borderLeft: selectedExpert?.id === e.id ? "3px solid #F59E0B" : "3px solid transparent", transition: "all .15s" }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid #F59E0B" }}>{e.photo ? <img src={`${BASE}/uploads/photos/${e.photo}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ color: "#F59E0B", fontWeight: 800, fontSize: 11 }}>{e.user?.prenom?.[0]}{e.user?.nom?.[0]}</span>}</div>
                      <div style={{ overflow: "hidden", flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 12.5, color: "#0A2540", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.user?.prenom} {e.user?.nom}</div>
                        <div style={{ fontSize: 11, color: "#8A9AB5" }}>{e.domaine || "Expert"}</div>
                      </div>
                      {unread > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 99, padding: "2px 6px", fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{unread}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>
              {!selectedExpert ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#8A9AB5" }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>💬</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540", marginBottom: 5 }}>Sélectionnez un expert</div>
                  <div style={{ fontSize: 13 }}>pour démarrer une conversation</div>
                </div>
              ) : (
                <>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 12, background: "#FAFBFE" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #F59E0B" }}>{selectedExpert.photo ? <img src={`${BASE}/uploads/photos/${selectedExpert.photo}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ color: "#F59E0B", fontWeight: 800, fontSize: 13 }}>{selectedExpert.user?.prenom?.[0]}{selectedExpert.user?.nom?.[0]}</span>}</div>
                    <div><div style={{ fontWeight: 700, color: "#0A2540", fontSize: 14 }}>{selectedExpert.user?.prenom} {selectedExpert.user?.nom}</div><div style={{ fontSize: 12, color: "#8A9AB5" }}>{selectedExpert.domaine || "Expert"}</div></div>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 9 }}>
                    {conversation.length === 0 && <div style={{ textAlign: "center", color: "#8A9AB5", padding: "36px 0", fontSize: 13 }}>Démarrez la conversation !</div>}
                    {conversation.map(m => {
                      const isMe = m.sender_id === realUser?.id;
                      return (
                        <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
                          <div style={{ background: isMe ? "linear-gradient(135deg,#0A2540,#1a4080)" : "#F0F4FA", color: isMe ? "#fff" : "#0A2540", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 15px", maxWidth: 420, fontSize: 13.5, lineHeight: 1.65 }}>
                            {m.contenu}
                            <div style={{ fontSize: 10, opacity: .55, marginTop: 3, textAlign: "right" }}>{new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                          </div>
                          {isMe && <button onClick={async () => { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/messages/${m.id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("✅ Supprimé"); await loadAllMessages(); } }} style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E1", fontSize: 12 }}><FaTrash /></button>}
                        </div>
                      );
                    })}
                    <div ref={msgEndRef} />
                  </div>
                  <div style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 9, background: "#FAFBFE" }}>
                    <input className="inp" placeholder="Votre message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={async e => { if (e.key === "Enter" && newMsg.trim() && selectedExpert) { const rid = selectedExpert.user_id || selectedExpert.user?.id; const r = await fetch(`${BASE}/messages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ receiver_id: rid, contenu: newMsg }) }); if (r.ok) { setNewMsg(""); await loadAllMessages(); } } }} style={{ flex: 1 }} />
                    <button className="btn btn-gold" style={{ padding: "10px 16px" }} onClick={async () => { if (!newMsg.trim() || !selectedExpert) return; const rid = selectedExpert.user_id || selectedExpert.user?.id; const r = await fetch(`${BASE}/messages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ receiver_id: rid, contenu: newMsg }) }); if (r.ok) { setNewMsg(""); await loadAllMessages(); } }}><FaPaperPlane /></button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TÉMOIGNAGES */}
        {tab === "temoignages" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card">
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>✍️ Partager mon expérience</div></div>
              <div style={{ padding: "24px" }}>
                <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#0369A1" }}>💡 Votre témoignage sera examiné avant publication.</div>
                <label className="lbl" style={{ marginBottom: 8 }}>Votre note</label>
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>{[1,2,3,4,5].map(s => <span key={s} onClick={() => setNewTemoNote(s)} style={{ fontSize: 30, cursor: "pointer", color: s <= newTemoNote ? "#F59E0B" : "#E2E8F0", transition: "color .2s", lineHeight: 1 }}>★</span>)}<span style={{ fontSize: 13, color: "#F59E0B", fontWeight: 600, marginLeft: 8, alignSelf: "center" }}>{newTemoNote}/5</span></div>
                <label className="lbl">Votre témoignage</label>
                <textarea className="inp" rows={5} placeholder="Partagez votre expérience avec BEH..." value={newTemo} onChange={e => setNewTemo(e.target.value)} style={{ marginBottom: 16 }} />
                <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center", padding: "12px" }} onClick={envoyerTemoignage} disabled={sendingTemo}>
                  {sendingTemo ? "⏳ Envoi en cours..." : <><FaPaperPlane /> Envoyer mon témoignage</>}
                </button>
              </div>
            </div>
            <div className="card" id="mes-temoignages">
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>Mes témoignages ({temoignages.length})</div></div>
              <div style={{ padding: "16px", maxHeight: 460, overflowY: "auto" }}>
                {temoignages.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: "#8A9AB5" }}>Aucun témoignage</div>
                  : temoignages.map(t => (
                    <div key={t.id} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", marginBottom: 10, border: "1px solid #E8EEF6" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", gap: 2 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= (t.note || 5) ? "#F59E0B" : "#E2E8F0", fontSize: 15 }}>★</span>)}<span style={{ fontSize: 11, color: "#94A3B8", marginLeft: 5 }}>{new Date(t.createdAt).toLocaleDateString("fr-FR")}</span></div>
                        <span style={{ background: t.statut === "valide" ? "#ECFDF5" : t.statut === "refuse" ? "#FEF2F2" : "#FFF8E1", color: t.statut === "valide" ? "#059669" : t.statut === "refuse" ? "#DC2626" : "#B45309", borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>{t.statut === "valide" ? "✅ Publié" : t.statut === "refuse" ? "❌ Refusé" : "⏳ En attente"}</span>
                      </div>
                      <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.72, fontStyle: "italic", margin: 0 }}>"{t.texte}"</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* MES DEMANDES */}
        {tab === "mes-demandes" && (
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 22, color: "#0A2540" }}>📋 Mes demandes de service</h2>
                <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 3 }}>{demandes.length} demande{demandes.length > 1 ? "s" : ""}</div>
              </div>
              <button className="btn btn-gold" onClick={() => { setTab("services"); setServiceTab("catalogue"); }}><FaPaperPlane /> Nouvelle demande</button>
            </div>

            {demandesEnCours > 0 && (
              <div className="en-cours-banner" style={{ marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: 20, height: 20, border: "3px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin360 1s linear infinite" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: "#1D4ED8", fontSize: 14 }}>
                    🔄 {demandesEnCours} demande{demandesEnCours > 1 ? "s" : ""} en cours de traitement
                  </div>
                  <div style={{ fontSize: 13, color: "#3B82F6", marginTop: 2 }}>
                    Notre équipe est en train de sélectionner le meilleur expert pour votre demande. Vous serez notifié dès qu'un expert sera assigné.
                  </div>
                </div>
              </div>
            )}

            {demandes.length === 0 ? (
              <div className="card" style={{ padding: "80px 0", textAlign: "center" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#0A2540", marginBottom: 8 }}>Aucune demande</div>
                <div style={{ color: "#8A9AB5", fontSize: 14, marginBottom: 24 }}>Explorez nos services et faites votre première demande</div>
                <button className="btn btn-gold" onClick={() => setTab("services")} style={{ padding: "12px 24px", fontSize: 14 }}><FaRocket /> Voir les services</button>
              </div>
            ) : demandes.map(d => {
              const isEnCours = d.statut === "en_cours";
              return (
                <div key={d.id} className="card" style={{
                  marginBottom: 14,
                  borderLeft: `4px solid ${S_COLOR[d.statut] || "#94A3B8"}`,
                  border: isEnCours ? "1.5px solid #93C5FD" : undefined,
                  background: isEnCours ? "linear-gradient(135deg,#F0F9FF,#EFF6FF)" : "#fff",
                  transition: "all .3s",
                }}>
                  <div style={{ padding: "20px 24px" }}>
                    {isEnCours && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(59,130,246,.1)", border: "1px solid #BFDBFE", borderRadius: 10, padding: "8px 14px", marginBottom: 14 }}>
                        <div style={{ width: 14, height: 14, border: "2.5px solid #3B82F6", borderTopColor: "transparent", borderRadius: "50%", animation: "spin360 1s linear infinite", flexShrink: 0 }} />
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1D4ED8" }}>Notre équipe recherche activement le meilleur expert pour vous</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540", marginBottom: 3 }}>{SERVICES_INFO[d.service]?.label || d.service}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 8 }}>{new Date(d.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                        {d.domaine && (
                          <div style={{ marginBottom: 6 }}>
                            <span style={{ background: "#EFF6FF", color: "#1D4ED8", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>🎯 {d.domaine}</span>
                          </div>
                        )}
                        {d.expert_assigne && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 99, padding: "4px 12px", marginBottom: 8, fontSize: 12, color: "#065F46", fontWeight: 600 }}>
                            <FaCheckCircle style={{ fontSize: 10 }} /> Expert assigné : {d.expert_assigne?.user?.prenom} {d.expert_assigne?.user?.nom}
                          </div>
                        )}
                        <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.7, maxWidth: 600 }}>{d.description}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        <DemandStatutBadge statut={d.statut} />
                        {d.statut === "en_attente" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            {d.service !== "formation" && (
                              <button className="btn btn-outline" style={{ padding: "5px 12px", fontSize: 11.5 }} onClick={() => setEditingDemande(d)}><FaEdit /> Modifier</button>
                            )}
                            <button style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 9, padding: "5px 12px", fontSize: 11.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit", fontWeight: 700 }} onClick={() => supprimerDemande(d.id)}><FaTrash /> Supprimer</button>
                          </div>
                        )}
                        {isEnCours && (
                          <div style={{ fontSize: 11, color: "#3B82F6", fontWeight: 600, textAlign: "right" }}>
                            Mis à jour : {new Date(d.updatedAt || d.createdAt).toLocaleDateString("fr-FR")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MES DEVIS */}
        {tab === "mes-devis" && (
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 22, color: "#0A2540" }}>📄 Devis reçus</h2>
                <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 3 }}>
                  {mesDevis.length} devis · {mesDevisEnAttente > 0 && <span style={{ color: "#F59E0B", fontWeight: 700 }}>{mesDevisEnAttente} en attente de réponse</span>}
                </div>
              </div>
              <button className="btn btn-outline" onClick={loadMesDevis} style={{ fontSize: 13 }}>🔄 Actualiser</button>
            </div>
            {mesDevis.length === 0 ? (
              <div className="card" style={{ padding: "80px 0", textAlign: "center" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>📄</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: "#0A2540", marginBottom: 8 }}>Aucun devis reçu</div>
                <div style={{ color: "#8A9AB5", fontSize: 14 }}>Les devis envoyés par vos experts apparaîtront ici</div>
              </div>
            ) : (
              <>
                {mesDevis.filter(d => d.statut === "en_attente").length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <div style={{ height: 2, flex: 1, background: "linear-gradient(90deg,#F59E0B,#FDE68A)" }} />
                      <span style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 99, padding: "4px 14px", fontSize: 12, fontWeight: 700, border: "1px solid #FDE68A", whiteSpace: "nowrap" }}>⏳ En attente de votre réponse</span>
                      <div style={{ height: 2, flex: 1, background: "linear-gradient(90deg,#FDE68A,transparent)" }} />
                    </div>
                    {mesDevis.filter(d => d.statut === "en_attente").map(devis => (
                      <DevisCard key={devis.id} devis={devis} experts={experts} onAccepter={accepterDevis} onRefuser={refuserDevis} onContactExpert={ex => { setSelectedExpert(ex); handleTabChange("messages"); loadConversation(ex.user_id || ex.user?.id); }} onRdvExpert={ex => { setRdvForm({ ...rdvForm, expert_id: String(ex.id), sujet: "Suite au devis accepté" }); handleTabChange("rdv"); }} />
                    ))}
                  </div>
                )}
                {mesDevis.filter(d => d.statut !== "en_attente").length > 0 && (
                  <div>
                    {mesDevis.filter(d => d.statut === "en_attente").length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "20px 0 16px" }}>
                        <div style={{ height: 1, flex: 1, background: "#E8EEF6" }} />
                        <span style={{ color: "#94A3B8", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Historique</span>
                        <div style={{ height: 1, flex: 1, background: "#E8EEF6" }} />
                      </div>
                    )}
                    {mesDevis.filter(d => d.statut !== "en_attente").map(devis => (
                      <DevisCard key={devis.id} devis={devis} experts={experts} onAccepter={accepterDevis} onRefuser={refuserDevis} onContactExpert={ex => { setSelectedExpert(ex); handleTabChange("messages"); loadConversation(ex.user_id || ex.user?.id); }} onRdvExpert={ex => { setRdvForm({ ...rdvForm, expert_id: String(ex.id), sujet: "Suite au devis accepté" }); handleTabChange("rdv"); }} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <footer style={{ background: "#0A2540", color: "#fff", padding: "32px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,.08)", marginTop: 40 }}>
        <div style={{ maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#F59E0B,#D97706)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, color: "#0A2540" }}>BEH</div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Business Expert Hub</span>
          </div>
          <p style={{ margin: "0 0 6px", fontSize: 13, color: "rgba(255,255,255,.4)" }}>© 2026 Business Expert Hub · Tous droits réservés</p>
          <p style={{ color: "rgba(255,255,255,.25)", fontSize: 12, margin: 0 }}>Tarifs en Dinar Tunisien (HT) — Essai gratuit 7 jours · Sans engagement</p>
        </div>
      </footer>
    </>
  );
}