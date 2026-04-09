"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaArrowRight, FaQuoteLeft, FaChevronLeft, FaChevronRight,
  FaBullseye, FaRocket, FaHandsHelping, FaGraduationCap,
  FaSearch, FaPaperPlane, FaCheck, FaCamera, FaComments,
  FaCalendar, FaStar, FaCheckCircle, FaChartLine,
  FaSearchPlus, FaLock, FaUserPlus,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

const SERVICES_INFO: Record<string, any> = {
  consulting: {
    label: "Consulting Stratégique",
    icon: <FaChartLine />,
    color: "#3B82F6",
    badge: "Stratégie",
    desc: "Diagnostic complet, définition de la stratégie et roadmap sur mesure avec nos experts certifiés.",
    duree: "2 à 8 semaines",
    budgets: ["< 5 000 DT", "5 000 – 15 000 DT", "15 000 – 30 000 DT", "> 30 000 DT"],
    points: ["Audit stratégique complet", "Business model review", "Roadmap actionnable", "Suivi mensuel inclus"],
  },
  "audit-sur-site": {
    label: "Audit sur Site",
    icon: <FaSearchPlus />,
    color: "#8B5CF6",
    badge: "Terrain",
    desc: "Nos experts se déplacent dans vos locaux pour un diagnostic terrain approfondi de vos opérations.",
    duree: "1 à 5 jours",
    budgets: ["< 3 000 DT", "3 000 – 8 000 DT", "8 000 – 20 000 DT", "> 20 000 DT"],
    points: ["Diagnostic terrain", "Analyse processus", "Rapport détaillé", "Plan d'action prioritaire"],
  },
  accompagnement: {
    label: "Accompagnement",
    icon: <FaHandsHelping />,
    color: "#22C55E",
    badge: "Suivi continu",
    desc: "Un expert dédié à vos côtés sur le long terme pour vous guider dans chaque étape de votre croissance.",
    duree: "3 à 12 mois",
    budgets: ["< 2 000 DT/mois", "2 000 – 5 000 DT/mois", "5 000 – 10 000 DT/mois", "> 10 000 DT/mois"],
    points: ["Expert dédié", "Réunions hebdomadaires", "Accès réseau exclusif", "Reporting mensuel"],
  },
  formations: {
    label: "Formations",
    icon: <FaGraduationCap />,
    color: "#F7B500",
    badge: "Certif.",
    desc: "Programmes de formation certifiants pour vos équipes et fondateurs sur les compétences clés.",
    duree: "1 jour à 3 mois",
    budgets: ["< 1 500 DT", "1 500 – 4 000 DT", "4 000 – 10 000 DT", "> 10 000 DT"],
    points: ["Contenu sur mesure", "Formateurs certifiés", "Certification incluse", "Support post-formation"],
  },
};

const ADN_ITEMS = [
  { title: "Notre Vision",  body: "Devenir la référence absolue en accompagnement de startups innovantes, en connectant les meilleurs experts aux projets les plus ambitieux.", color: "#3B82F6", anchor: "vision" },
  { title: "Notre Mission", body: "Offrir aux startups un accès privilégié à des experts certifiés pour structurer leur stratégie, accélérer leur croissance et réussir leurs levées.", color: "#F7B500", anchor: "mission" },
  { title: "Nos Valeurs",   body: "Excellence, transparence et engagement humain. Chaque accompagnement est unique et conçu pour maximiser l'impact durable de votre entreprise.", color: "#10B981", anchor: "valeurs" },
];

type Tab = "accueil" | "services" | "profil" | "experts" | "rdv" | "messages" | "temoignages" | "mes-demandes";

function useInView(thr = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: thr });
    o.observe(el); return () => o.disconnect();
  }, []);
  return [ref, v] as const;
}
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(28px)", transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

// Composant d'étoiles réutilisable
function StarRating({ rating, onRate, onHover, size = 28, showLabel = false }: { rating: number; onRate?: (n: number) => void; onHover?: (n: number) => void; size?: number; showLabel?: boolean }) {
  const [hover, setHover] = useState(0);
  const displayHover = onHover !== undefined ? hover : 0;
  const currentRating = displayHover > 0 ? displayHover : rating;
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => onRate && onRate(star)}
            onMouseEnter={() => onHover && setHover(star)}
            onMouseLeave={() => onHover && setHover(0)}
            style={{
              fontSize: size,
              cursor: onRate ? "pointer" : "default",
              color: star <= currentRating ? "#F7B500" : "#E2E8F0",
              transition: "transform 0.1s, color 0.2s",
              display: "inline-block",
            }}
          >
            ★
          </span>
        ))}
      </div>
      {showLabel && (
        <span style={{ fontSize: size * 0.5, color: "#F7B500", fontWeight: 600, marginLeft: 6 }}>
          {rating.toFixed(1)}/5
        </span>
      )}
    </div>
  );
}

export default function DashboardStartup() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("accueil");
  const [user, setUser] = useState<any>(null);
  const [startup, setStartup] = useState<any>(null);
  const [experts, setExperts] = useState<any[]>([]);
  const [pubExperts, setPubExperts] = useState<any[]>([]);
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [newMsg, setNewMsg] = useState("");
  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [pubTemos, setPubTemos] = useState<any[]>([]);
  const [tIdx, setTIdx] = useState(0);
  const [tAnim, setTAnim] = useState(false);
  const [newTemo, setNewTemo] = useState("");
  const [newTemoNote, setNewTemoNote] = useState(5);
  const [hoveredNote, setHoveredNote] = useState(0);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [toast, setToast] = useState({ text: "", ok: true });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [editProfil, setEditProfil] = useState<any>({});
  const [rdvForm, setRdvForm] = useState({ expert_id: "", date_rdv: "" });
  const [serviceModal, setServiceModal] = useState<string | null>(null);
  const [demandeForm, setDemandeForm] = useState({ service: "", description: "", budget: "", delai: "", objectif: "", telephone: "" });
  const [sendingDemande, setSendingDemande] = useState(false);
  const [expertFilter, setExpertFilter] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);

  const tk = () => typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const hdr = () => ({ Authorization: `Bearer ${tk()}` });
  const hdrJ = () => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" });

  function notify(text: string, ok = true) {
    setToast({ text, ok });
    setTimeout(() => setToast({ text: "", ok: true }), 3500);
  }

  useEffect(() => {
    const u = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!u) { router.push("/connexion"); return; }
    const p = JSON.parse(u);
    if (p.role !== "startup") { router.push("/"); return; }
    setUser(p);
    loadAll();
    loadPub();
  }, []);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation]);

  useEffect(() => {
    if (!pubTemos.length) return;
    const t = setInterval(() => { if (!tAnim) setTIdx(p => (p + 1) % pubTemos.length); }, 5000);
    return () => clearInterval(t);
  }, [pubTemos.length, tAnim]);

  function goT(i: number) {
    if (tAnim || !pubTemos.length) return;
    setTAnim(true); setTimeout(() => { setTIdx(i); setTAnim(false); }, 280);
  }

  async function loadAll() {
    try {
      const [s, e, r, d, t, m] = await Promise.all([
        fetch(`${BASE}/startups/moi`, { headers: hdr() }).then(r => r.ok ? r.json() : null),
        fetch(`${BASE}/experts/liste`).then(r => r.ok ? r.json() : []),
        fetch(`${BASE}/rendez-vous/startup`, { headers: hdr() }).then(r => r.ok ? r.json() : []),
        fetch(`${BASE}/demandes-service/mes-demandes`, { headers: hdr() }).then(r => r.ok ? r.json() : []),
        fetch(`${BASE}/temoignages/mes-temoignages`, { headers: hdr() }).then(r => r.ok ? r.json() : []),
        fetch(`${BASE}/messages/mes-messages`, { headers: hdr() }).then(r => r.ok ? r.json() : []),
      ]);
      if (s) { setStartup(s); setEditProfil(s); }
      setExperts(Array.isArray(e) ? e : []);
      setRdvs(Array.isArray(r) ? r : []);
      setDemandes(Array.isArray(d) ? d : []);
      setTemoignages(Array.isArray(t) ? t : []);
      setMessages(Array.isArray(m) ? m : []);
    } catch (e) { console.error(e); }
  }

  async function loadPub() {
    try {
      const [e, t] = await Promise.all([
        fetch(`${BASE}/experts/liste`).then(r => r.ok ? r.json() : []),
        fetch(`${BASE}/temoignages/publics`).then(r => r.ok ? r.json() : []),
      ]);
      setPubExperts(Array.isArray(e) ? e.slice(0, 4) : []);
      setPubTemos(Array.isArray(t) ? t : []);
    } catch (e) { }
  }

  async function loadConversation(expertUserId: number) {
    try {
      const c = await fetch(`${BASE}/messages/conversation/${expertUserId}`, { headers: hdr() }).then(r => r.json());
      setConversation(Array.isArray(c) ? c : []);
    } catch (e) { }
  }

  async function uploadPhoto() {
    if (!photoFile) return;
    const fd = new FormData(); fd.append("photo", photoFile);
    const r = await fetch(`${BASE}/startups/photo`, { method: "POST", headers: { Authorization: `Bearer ${tk()}` }, body: fd });
    if (r.ok) { notify("✅ Photo mise à jour !"); loadAll(); setPhotoFile(null); setPhotoPreview(""); }
    else notify("Erreur upload", false);
  }

  async function saveProfil() {
    const r = await fetch(`${BASE}/startups/profil`, { method: "PUT", headers: hdrJ(), body: JSON.stringify(editProfil) });
    if (r.ok) { notify("✅ Profil sauvegardé !"); loadAll(); }
    else notify("Erreur", false);
  }

  async function prendreRdv() {
    if (!rdvForm.expert_id || !rdvForm.date_rdv) { notify("Remplissez tous les champs", false); return; }
    const r = await fetch(`${BASE}/rendez-vous`, { method: "POST", headers: hdrJ(), body: JSON.stringify(rdvForm) });
    if (r.ok) { notify("✅ RDV demandé !"); setRdvForm({ expert_id: "", date_rdv: "" }); loadAll(); }
    else notify("Erreur", false);
  }

  async function envoyerMessage() {
    if (!newMsg.trim() || !selectedExpert) return;
    const rid = selectedExpert.user_id || selectedExpert.user?.id;
    const r = await fetch(`${BASE}/messages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ receiver_id: rid, contenu: newMsg }) });
    if (r.ok) { setNewMsg(""); loadConversation(rid); }
  }

  async function envoyerTemoignage() {
    if (!newTemo.trim()) { notify("Écrivez votre témoignage", false); return; }
    const r = await fetch(`${BASE}/temoignages`, { 
      method: "POST", 
      headers: hdrJ(), 
      body: JSON.stringify({ texte: newTemo, note: newTemoNote }) 
    });
    if (r.ok) { 
      notify("✅ Témoignage envoyé !"); 
      setNewTemo(""); 
      setNewTemoNote(5);
      loadAll(); 
    } else notify("Erreur", false);
  }

  async function envoyerDemande(e: React.FormEvent) {
    e.preventDefault();
    if (!demandeForm.description) { notify("Décrivez votre besoin", false); return; }
    setSendingDemande(true);
    try {
      const r = await fetch(`${BASE}/demandes-service`, { method: "POST", headers: hdrJ(), body: JSON.stringify(demandeForm) });
      if (r.ok) {
        notify("✅ Demande envoyée ! Notre équipe vous contacte sous 24h.");
        setServiceModal(null);
        setDemandeForm({ service: "", description: "", budget: "", delai: "", objectif: "", telephone: "" });
        loadAll();
        setTimeout(() => setTab("mes-demandes"), 800);
      } else notify("Erreur envoi", false);
    } catch (e) { notify("Erreur", false); }
    setSendingDemande(false);
  }

  function openService(slug: string) {
    setDemandeForm({ ...demandeForm, service: slug });
    setServiceModal(slug);
  }

  const photoUrl = startup?.photo ? `${BASE}/uploads/photos/${startup.photo}` : null;
  const initials = user ? (user.prenom?.[0] || "") + (user.nom?.[0] || "") : "?";
  const filteredExperts = experts.filter(e =>
    !expertFilter || e.user?.nom?.toLowerCase().includes(expertFilter.toLowerCase()) || e.domaine?.toLowerCase().includes(expertFilter.toLowerCase())
  );
  const demandesEnAttente = demandes.filter(d => d.statut === "en_attente").length;
  const curTemo = pubTemos[tIdx % Math.max(pubTemos.length, 1)];

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "accueil",      label: "Accueil",       icon: "🏠" },
    { id: "services",     label: "Services",      icon: "🛠️" },
    { id: "profil",       label: "Mon Profil",    icon: "👤" },
    { id: "experts",      label: "Experts",       icon: "⭐" },
    { id: "rdv",          label: "Rendez-vous",   icon: "📅" },
    { id: "messages",     label: "Messages",      icon: "💬" },
    { id: "temoignages",  label: "Témoignages",   icon: "🌟" },
    { id: "mes-demandes", label: "Mes Demandes",  icon: "📋" },
  ];

  const S_COLOR: Record<string, string> = { en_attente: "#F7B500", valide: "#22C55E", refuse: "#EF4444", confirme: "#22C55E", annule: "#EF4444" };
  const S_LABEL: Record<string, string> = { en_attente: "En attente", valide: "Validé ✅", refuse: "Refusé ❌", confirme: "Confirmé ✅", annule: "Annulé ❌" };

  if (!user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F0F4FA;}
        .btn{font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;border:none;border-radius:10px;cursor:pointer;padding:10px 20px;font-size:13.5px;transition:all .2s;display:inline-flex;align-items:center;gap:7px;}
        .btn-gold{background:#F7B500;color:#0A2540;}.btn-gold:hover{background:#e6a800;transform:translateY(-2px);box-shadow:0 8px 20px rgba(247,181,0,.3);}
        .btn-dark{background:#0A2540;color:#fff;}.btn-dark:hover{background:#F7B500;color:#0A2540;transform:translateY(-2px);}
        .btn-outline{background:transparent;border:2px solid #E8EEF6;color:#475569;}.btn-outline:hover{border-color:#F7B500;color:#F7B500;}
        .card{background:#fff;border:1px solid #E8EEF6;border-radius:18px;overflow:hidden;}
        .inp{width:100%;background:#F7F9FC;border:1.5px solid #E2E8F0;border-radius:10px;padding:11px 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#0A2540;outline:none;transition:border-color .2s;}
        .inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.1);}
        textarea.inp{resize:vertical;min-height:90px;}
        .lbl{font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px;}
        .svc-card{background:#fff;border:1.5px solid #E8EEF6;border-radius:20px;overflow:hidden;transition:transform .32s cubic-bezier(.22,1,.36,1),box-shadow .32s,border-color .32s;}
        .svc-card:hover{transform:translateY(-8px);box-shadow:0 24px 56px rgba(10,37,64,.13);border-color:rgba(247,181,0,.4);}
        .expert-card{background:#fff;border:1.5px solid #E8EEF6;border-radius:16px;transition:transform .28s,box-shadow .28s,border-color .28s;}
        .expert-card:hover{transform:translateY(-5px);box-shadow:0 14px 36px rgba(10,37,64,.1);border-color:rgba(59,130,246,.3);}
        .adn-card{background:#fff;border-radius:20px;border:1.5px solid rgba(10,37,64,.07);box-shadow:0 4px 20px rgba(10,37,64,.06);overflow:hidden;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s;}
        .adn-card:hover{transform:translateY(-8px);box-shadow:0 28px 60px rgba(10,37,64,.13);}
        .msg-me{background:linear-gradient(135deg,#0A2540,#1a4080);color:#fff;border-radius:18px 18px 4px 18px;padding:10px 15px;max-width:72%;font-size:13.5px;line-height:1.65;}
        .msg-other{background:#F0F4FA;color:#0A2540;border-radius:18px 18px 18px 4px;padding:10px 15px;max-width:72%;font-size:13.5px;line-height:1.65;}
        .tab-btn{background:none;border:none;cursor:pointer;padding:11px 8px;font-size:12.5px;font-weight:600;color:#8A9AB5;border-bottom:2.5px solid transparent;font-family:'Plus Jakarta Sans',sans-serif;transition:all .2s;white-space:nowrap;display:flex;align-items:center;gap:5px;}
        .tab-btn.on{color:#0A2540;border-bottom-color:#F7B500;font-weight:800;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      `}</style>

      {/* Toast */}
      {toast.text && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: toast.ok ? "#ECFDF5" : "#FEF2F2", border: `1.5px solid ${toast.ok ? "#A7F3D0" : "#FECACA"}`, borderLeft: `4px solid ${toast.ok ? "#059669" : "#DC2626"}`, color: toast.ok ? "#059669" : "#DC2626", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 13, boxShadow: "0 8px 28px rgba(0,0,0,.12)" }}>
          {toast.text}
        </div>
      )}

      {/* Modal demande service */}
      {serviceModal && SERVICES_INFO[serviceModal] && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,37,64,.6)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(5px)" }} onClick={() => setServiceModal(null)}>
          <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 620, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 28px 80px rgba(10,37,64,.22)" }} onClick={e => e.stopPropagation()}>
            <div style={{ background: `linear-gradient(135deg,${SERVICES_INFO[serviceModal].color},${SERVICES_INFO[serviceModal].color}bb)`, padding: "28px 32px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.05) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 13, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff" }}>{SERVICES_INFO[serviceModal].icon}</div>
                    <div>
                      <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Demander ce service</div>
                      <div style={{ color: "#fff", fontWeight: 900, fontSize: 20 }}>{SERVICES_INFO[serviceModal].label}</div>
                    </div>
                  </div>
                  <button onClick={() => setServiceModal(null)} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16, fontWeight: 700 }}>✕</button>
                </div>
                <p style={{ color: "rgba(255,255,255,.8)", fontSize: 13.5, lineHeight: 1.75 }}>{SERVICES_INFO[serviceModal].desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 14 }}>
                  {SERVICES_INFO[serviceModal].points.map((p: string) => (
                    <span key={p} style={{ background: "rgba(255,255,255,.18)", color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11.5, fontWeight: 600 }}>✓ {p}</span>
                  ))}
                </div>
              </div>
            </div>
            <form onSubmit={envoyerDemande} style={{ padding: "28px 32px" }}>
              <div style={{ marginBottom: 16 }}>
                <label className="lbl">Description de votre besoin *</label>
                <textarea className="inp" rows={4} placeholder="Décrivez votre projet, vos objectifs, votre situation actuelle..." required value={demandeForm.description} onChange={e => setDemandeForm({ ...demandeForm, description: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label className="lbl">Budget estimé (DT)</label>
                  <select className="inp" value={demandeForm.budget} onChange={e => setDemandeForm({ ...demandeForm, budget: e.target.value })}>
                    <option value="">Sélectionner...</option>
                    {SERVICES_INFO[serviceModal].budgets.map((b: string) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Délai souhaité</label>
                  <select className="inp" value={demandeForm.delai} onChange={e => setDemandeForm({ ...demandeForm, delai: e.target.value })}>
                    <option value="">Sélectionner...</option>
                    {["Urgent (< 2 semaines)", "1 mois", "2 à 3 mois", "3 à 6 mois", "Flexible"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                <div>
                  <label className="lbl">Objectif principal</label>
                  <input className="inp" placeholder="Ex: Préparer une levée de fonds" value={demandeForm.objectif} onChange={e => setDemandeForm({ ...demandeForm, objectif: e.target.value })} />
                </div>
                <div>
                  <label className="lbl">Téléphone</label>
                  <input className="inp" type="tel" placeholder="+216 XX XXX XXX" value={demandeForm.telephone} onChange={e => setDemandeForm({ ...demandeForm, telephone: e.target.value })} />
                </div>
              </div>
              <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#0369A1" }}>
                📞 Notre équipe vous contactera sous <strong>24h</strong> pour confirmer votre besoin.
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-outline" onClick={() => setServiceModal(null)}>Annuler</button>
                <button type="submit" className="btn btn-gold" disabled={sendingDemande} style={{ padding: "12px 28px", fontSize: 14 }}>
                  {sendingDemande ? "⏳ Envoi..." : <><FaPaperPlane /> Envoyer ma demande</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background: "#0A2540", height: 62, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(10,37,64,.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, background: "#F7B500", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#0A2540" }}>BEH</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Espace Startup</div>
            <div style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }}>{startup?.nom_startup || `${user?.prenom} ${user?.nom}`}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {demandesEnAttente > 0 && (
            <div style={{ background: "#F7B500", color: "#0A2540", borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 800 }}>🔔 {demandesEnAttente} en attente</div>
          )}
          <button onClick={() => { if (typeof window !== "undefined") { localStorage.clear(); router.push("/"); } }} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)", borderRadius: 9, padding: "7px 16px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13 }}>Déconnexion</button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8EEF6", position: "sticky", top: 62, zIndex: 90 }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px", display: "flex", gap: 4, overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn${tab === t.id ? " on" : ""}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
              {t.id === "mes-demandes" && demandesEnAttente > 0 && (
                <span style={{ background: "#F7B500", color: "#0A2540", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 800, marginLeft: 2 }}>{demandesEnAttente}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══ ACCUEIL ══ */}
      {tab === "accueil" && (
        <div>
          <section style={{ position: "relative", overflow: "hidden", minHeight: 480 }}>
            <div style={{ position: "absolute", inset: 0 }}>
              <Image src="/image.png" alt="" fill priority style={{ objectFit: "cover" }} sizes="100vw" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(108deg,rgba(6,14,26,.95) 0%,rgba(10,30,60,.78) 44%,rgba(10,37,64,.18) 100%)" }} />
            </div>
            <div style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "90px 32px 100px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, background: "rgba(247,181,0,.1)", border: "1px solid rgba(247,181,0,.22)", borderRadius: 99, padding: "5px 16px 5px 10px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F7B500", animation: "pulse 2s infinite", display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#F7B500" }}>Bienvenue, {user?.prenom} 👋</span>
              </div>
              <h1 style={{ fontSize: "clamp(30px,5vw,52px)", fontWeight: 900, color: "#fff", marginBottom: 18, lineHeight: 1.1 }}>
                Propulsez votre <span style={{ color: "#F7B500" }}>startup</span><br />vers l&apos;excellence
              </h1>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,.72)", maxWidth: 480, lineHeight: 1.9, marginBottom: 32 }}>
                Accédez à nos experts certifiés, nos services et tout ce dont votre startup a besoin pour croître.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <button className="btn btn-gold" style={{ padding: "13px 26px", fontSize: 15 }} onClick={() => setTab("services")}>Voir les services <FaArrowRight size={13} /></button>
                <button className="btn btn-dark" style={{ padding: "13px 26px", fontSize: 15, border: "2px solid rgba(255,255,255,.2)" }} onClick={() => setTab("experts")}>Nos experts <FaArrowRight size={13} /></button>
              </div>
            </div>
          </section>

          <section style={{ padding: "72px 28px", background: "#F8FAFC" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <Reveal>
                <div style={{ textAlign: "center", marginBottom: 52 }}>
                  <p style={{ color: "#F7B500", fontWeight: 700, fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 8 }}>Notre philosophie</p>
                  <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(30px,4vw,48px)", color: "#0A2540" }}>Notre <span style={{ fontStyle: "italic", color: "#F7B500" }}>ADN</span></h2>
                </div>
              </Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }}>
                {ADN_ITEMS.map((card, i) => (
                  <Reveal key={i} delay={i * .12}>
                    <div className="adn-card" style={{ cursor: "pointer" }} onClick={() => window.open(`/a-propos#${card.anchor}`, "_blank")}>
                      <div style={{ height: 5, background: `linear-gradient(90deg,${card.color},${card.color}44)` }} />
                      <div style={{ padding: "28px 26px" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${card.color}15`, border: `1.5px solid ${card.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontSize: 22, color: card.color }}>
                          {i === 0 ? <FaBullseye /> : i === 1 ? <FaRocket /> : <FaStar />}
                        </div>
                        <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, color: "#0A2540", fontSize: 22, marginBottom: 10 }}>{card.title}</h3>
                        <p style={{ fontSize: 13.5, color: "#64748B", lineHeight: 1.82, marginBottom: 16 }}>{card.body}</p>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: card.color }}>En savoir plus <FaArrowRight size={10} /></div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: "72px 28px", background: "#fff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <Reveal>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <p style={{ color: "#F7B500", fontWeight: 700, fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 8 }}>Notre équipe</p>
                    <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(26px,3.5vw,42px)", color: "#0A2540" }}>Nos <span style={{ fontStyle: "italic", color: "#F7B500" }}>experts</span> certifiés</h2>
                  </div>
                  <button className="btn btn-dark" onClick={() => setTab("experts")} style={{ padding: "11px 22px" }}>Voir tous <FaArrowRight size={12} /></button>
                </div>
              </Reveal>
              {pubExperts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#94A3B8" }}>
                  <div style={{ width: 40, height: 40, border: "3px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 14px" }} />Chargement...
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }}>
                  {pubExperts.map((ex, i) => (
                    <Reveal key={ex.id} delay={i * .08}>
                      <div className="expert-card" style={{ borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ height: 4, background: ex.disponible ? "linear-gradient(90deg,#0A2540,#F7B500)" : "#E2E8F0" }} />
                        <div style={{ position: "relative", height: 160, background: "linear-gradient(135deg,#0A2540,#1a3f6f)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          {ex.photo ? <img src={`${BASE}/uploads/photos/${ex.photo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                            <div style={{ width: 66, height: 66, borderRadius: "50%", background: "rgba(247,181,0,.2)", border: "3px solid #F7B500", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 800, fontSize: 24 }}>{ex.user?.prenom?.[0]}{ex.user?.nom?.[0]}</div>}
                        </div>
                        <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540", marginBottom: 3 }}>{ex.user?.prenom} {ex.user?.nom}</div>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: "#92400E", background: "#FEF3C7", borderRadius: 6, padding: "2px 8px", display: "inline-block", marginBottom: 10 }}>{ex.domaine || "Expert"}</div>
                          <div style={{ display: "flex", gap: 7, marginTop: "auto" }}>
                            <button className="btn btn-dark" style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "8px" }} onClick={() => { setSelectedExpert(ex); setTab("messages"); loadConversation(ex.user_id || ex.user?.id); }}>💬</button>
                            <button className="btn btn-gold" style={{ flex: 1, justifyContent: "center", fontSize: 12, padding: "8px" }} onClick={() => { setRdvForm({ ...rdvForm, expert_id: String(ex.id) }); setTab("rdv"); }}>📅</button>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* TÉMOIGNAGES AVEC ÉTOILES SUR ACCUEIL */}
          {pubTemos.length > 0 && (
            <section style={{ padding: "72px 28px", background: "#F8FAFC" }}>
              <div style={{ maxWidth: 820, margin: "0 auto" }}>
                <Reveal>
                  <div style={{ textAlign: "center", marginBottom: 44 }}>
                    <p style={{ color: "#F7B500", fontWeight: 700, fontSize: 11, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 8 }}>Témoignages</p>
                    <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(26px,4vw,42px)", color: "#0A2540" }}>Ce que disent nos <span style={{ fontStyle: "italic", color: "#F7B500" }}>clients</span></h2>
                  </div>
                </Reveal>
                {curTemo && (
                  <>
                    <div style={{ background: "#0A2540", borderRadius: 24, padding: "40px 48px", position: "relative", border: "1px solid rgba(247,181,0,.18)", opacity: tAnim ? 0 : 1, transform: tAnim ? "scale(.97)" : "scale(1)", transition: "all .3s" }}>
                      <FaQuoteLeft style={{ position: "absolute", top: 24, left: 32, fontSize: 36, color: "rgba(247,181,0,.15)" }} />
                      
                      {/* Étoiles affichées au-dessus du témoignage */}
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                        <StarRating rating={curTemo.note || 5} size={24} showLabel={true} />
                      </div>
                      
                      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", color: "#fff", lineHeight: 1.82, textAlign: "center", marginBottom: 28, fontSize: "clamp(16px,2vw,21px)", fontWeight: 500 }}>
                        &ldquo;{curTemo.texte}&rdquo;
                      </p>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#0A2540", margin: "0 auto 12px" }}>
                          {curTemo.user?.prenom?.[0]}{curTemo.user?.nom?.[0]}
                        </div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{curTemo.user?.prenom} {curTemo.user?.nom}</div>
                        <div style={{ color: "#F7B500", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>
                          {curTemo.startup?.nom_startup || "Startup BEH"}
                        </div>
                      </div>
                    </div>
                    {pubTemos.length > 1 && (
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 24 }}>
                        <button onClick={() => goT((tIdx - 1 + pubTemos.length) % pubTemos.length)} style={{ width: 40, height: 40, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(247,181,0,.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "#F7B500"} onMouseLeave={e => e.currentTarget.style.background = "#0A2540"}><FaChevronLeft /></button>
                        <div style={{ display: "flex", gap: 6 }}>
                          {pubTemos.map((_, i) => <button key={i} onClick={() => goT(i)} style={{ height: 7, width: i === tIdx ? 26 : 7, borderRadius: 99, border: "none", cursor: "pointer", background: i === tIdx ? "#F7B500" : "rgba(10,37,64,.2)", transition: "all .3s" }} />)}
                        </div>
                        <button onClick={() => goT((tIdx + 1) % pubTemos.length)} style={{ width: 40, height: 40, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(247,181,0,.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "#F7B500"} onMouseLeave={e => e.currentTarget.style.background = "#0A2540"}><FaChevronRight /></button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          )}

          <section style={{ padding: "64px 28px", background: "linear-gradient(135deg,#0A2540,#0f3460)" }}>
            <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
              <Reveal>
                <h2 style={{ fontWeight: 900, color: "#fff", fontSize: "clamp(24px,4vw,40px)", marginBottom: 14 }}>Prêt à accélérer votre croissance ?</h2>
                <p style={{ color: "rgba(255,255,255,.65)", fontSize: 15, lineHeight: 1.85, marginBottom: 32 }}>Explorez nos services et trouvez l'accompagnement parfait pour votre startup.</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                  <button className="btn btn-gold" style={{ padding: "14px 30px", fontSize: 15 }} onClick={() => setTab("services")}>Voir les services <FaArrowRight size={13} /></button>
                  <button className="btn" style={{ padding: "14px 30px", fontSize: 15, background: "rgba(255,255,255,.1)", border: "2px solid rgba(255,255,255,.25)", color: "#fff" }} onClick={() => setTab("experts")}>Nos experts <FaArrowRight size={13} /></button>
                </div>
              </Reveal>
            </div>
          </section>
        </div>
      )}

      {/* ══ SERVICES ══ */}
      {tab === "services" && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ background: "linear-gradient(135deg,#0A2540,#0f3460)", borderRadius: 20, padding: "36px 40px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.022) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <span style={{ background: "rgba(247,181,0,.15)", border: "1px solid rgba(247,181,0,.3)", color: "#F7B500", fontWeight: 700, fontSize: 11, letterSpacing: "2px", textTransform: "uppercase", padding: "4px 14px", borderRadius: 99, display: "inline-block", marginBottom: 16 }}>Nos Services</span>
              <h1 style={{ color: "#fff", fontWeight: 900, fontSize: 30, marginBottom: 10, lineHeight: 1.15 }}>Choisissez votre <span style={{ color: "#F7B500" }}>service</span></h1>
              <p style={{ color: "rgba(255,255,255,.65)", fontSize: 15, lineHeight: 1.8, maxWidth: 520 }}>En tant que membre, vous pouvez demander n'importe quel service. Notre équipe vous répond sous 24h.</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 22, marginBottom: 28 }}>
            {Object.entries(SERVICES_INFO).map(([slug, svc]) => (
              <div key={slug} className="svc-card" onClick={() => openService(slug)} style={{ cursor: "pointer" }}>
                <div style={{ height: 5, background: `linear-gradient(90deg,${svc.color},${svc.color}44)` }} />
                <div style={{ padding: "28px 28px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                    <div style={{ width: 58, height: 58, borderRadius: 15, background: `${svc.color}15`, border: `1.5px solid ${svc.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: svc.color }}>{svc.icon}</div>
                    <span style={{ background: `${svc.color}15`, color: svc.color, borderRadius: 99, padding: "4px 12px", fontSize: 11.5, fontWeight: 700 }}>{svc.badge}</span>
                  </div>
                  <h3 style={{ fontWeight: 800, color: "#0A2540", fontSize: 19, marginBottom: 8 }}>{svc.label}</h3>
                  <p style={{ color: "#64748B", fontSize: 13.5, lineHeight: 1.78, marginBottom: 16 }}>{svc.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
                    {svc.points.map((p: string) => (
                      <span key={p} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 99, padding: "3px 10px", fontSize: 11.5, color: "#475569", fontWeight: 600 }}>✓ {p}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#8A9AB5", fontWeight: 600 }}>⏱ {svc.duree}</span>
                    <button className="btn btn-gold" style={{ padding: "10px 20px", fontSize: 13 }} onClick={e => { e.stopPropagation(); openService(slug); }}>
                      <FaPaperPlane size={12} /> Demander
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 18, padding: "24px 28px" }}>
            <h3 style={{ fontWeight: 800, color: "#0A2540", fontSize: 16, marginBottom: 18 }}>✅ Nos garanties membres</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {[
                { icon: "⚡", title: "Réponse 24h",       desc: "Contactés sous 24h ouvrées" },
                { icon: "🎯", title: "Experts certifiés", desc: "Sélectionnés par BEH" },
                { icon: "📊", title: "Résultats mesurables", desc: "Objectifs clairs" },
                { icon: "🔒", title: "Confidentialité",   desc: "Données strictement privées" },
              ].map(g => (
                <div key={g.title} style={{ background: "#fff", borderRadius: 12, padding: "16px", border: "1px solid #E8EEF6", textAlign: "center" }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{g.icon}</div>
                  <div style={{ fontWeight: 700, color: "#0A2540", fontSize: 13.5, marginBottom: 5 }}>{g.title}</div>
                  <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6 }}>{g.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ MES DEMANDES ══ */}
      {tab === "mes-demandes" && (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: 22, color: "#0A2540" }}>📋 Mes demandes de service</h2>
              <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 3 }}>{demandes.length} demande{demandes.length > 1 ? "s" : ""}</div>
            </div>
            <button className="btn btn-gold" onClick={() => setTab("services")} style={{ padding: "11px 22px" }}><FaPaperPlane /> Nouvelle demande</button>
          </div>
          {demandes.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #E8EEF6", borderRadius: 18, padding: "80px 0", textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#0A2540", marginBottom: 8 }}>Aucune demande</div>
              <div style={{ color: "#8A9AB5", fontSize: 14, marginBottom: 24 }}>Explorez nos services et faites votre première demande</div>
              <button className="btn btn-gold" onClick={() => setTab("services")} style={{ padding: "12px 28px", fontSize: 15 }}><FaRocket /> Voir les services</button>
            </div>
          ) : demandes.map(d => (
            <div key={d.id} style={{ background: "#fff", border: `1.5px solid ${d.statut === "en_attente" ? "#F7B500" : d.statut === "valide" ? "#A7F3D0" : "#FECACA"}`, borderRadius: 16, padding: "20px 24px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${SERVICES_INFO[d.service]?.color || "#3B82F6"}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: SERVICES_INFO[d.service]?.color || "#3B82F6", flexShrink: 0 }}>{SERVICES_INFO[d.service]?.icon || "🛠️"}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15.5, color: "#0A2540" }}>{SERVICES_INFO[d.service]?.label || d.service}</div>
                      <div style={{ fontSize: 12, color: "#8A9AB5" }}>{new Date(d.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                    </div>
                  </div>
                  {d.description && <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.75, marginBottom: 12, background: "#F8FAFC", borderRadius: 10, padding: "10px 14px" }}>{d.description}</p>}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {d.budget    && <span style={{ background: "#EFF6FF", color: "#1D4ED8", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>💰 {d.budget}</span>}
                    {d.delai     && <span style={{ background: "#F0FDF4", color: "#16a34a", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>⏱ {d.delai}</span>}
                    {d.telephone && <span style={{ background: "#FFF8E1", color: "#B45309", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>📞 {d.telephone}</span>}
                    {d.objectif  && <span style={{ background: "#F3F4F6", color: "#374151", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>🎯 {d.objectif}</span>}
                  </div>
                  {d.commentaire_admin && (
                    <div style={{ marginTop: 14, background: d.statut === "valide" ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${d.statut === "valide" ? "#A7F3D0" : "#FECACA"}`, borderRadius: 10, padding: "12px 16px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: d.statut === "valide" ? "#059669" : "#DC2626", textTransform: "uppercase", marginBottom: 5 }}>📩 Réponse BEH</div>
                      <div style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.7 }}>{d.commentaire_admin}</div>
                    </div>
                  )}
                </div>
                <span style={{ background: d.statut === "en_attente" ? "#FFF8E1" : d.statut === "valide" ? "#ECFDF5" : "#FEF2F2", color: d.statut === "en_attente" ? "#B45309" : d.statut === "valide" ? "#059669" : "#DC2626", border: `1px solid ${d.statut === "en_attente" ? "#F7B500" : d.statut === "valide" ? "#A7F3D0" : "#FECACA"}`, borderRadius: 99, padding: "6px 16px", fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {d.statut === "en_attente" ? "⏳ En attente" : d.statut === "valide" ? "✅ Acceptée" : "❌ Refusée"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ AUTRES ONGLETS ══ */}
      {["profil", "experts", "rdv", "messages", "temoignages"].includes(tab) && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

          {/* PROFIL */}
          {tab === "profil" && (
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              <div className="card" style={{ padding: "24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #F7B500" }}>
                    {photoPreview ? <img src={photoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                      : photoUrl ? <img src={photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" onError={e => (e.currentTarget.style.display = "none")} />
                        : <span style={{ color: "#F7B500", fontWeight: 900, fontSize: 26 }}>{initials}</span>}
                  </div>
                  <label style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, background: "#F7B500", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #fff" }}>
                    <FaCamera style={{ fontSize: 11, color: "#0A2540" }} />
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
                  </label>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "#0A2540" }}>{user?.prenom} {user?.nom}</div>
                  <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 3 }}>{startup?.nom_startup || "Startup"} · {user?.email}</div>
                  {photoFile && <button className="btn btn-gold" style={{ fontSize: 12, padding: "7px 14px", marginTop: 10 }} onClick={uploadPhoto}><FaCheck /> Sauvegarder la photo</button>}
                </div>
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>Informations de la startup</div>
                </div>
                <div style={{ padding: "24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    <div><label className="lbl">Nom de la startup</label><input className="inp" value={editProfil.nom_startup || ""} onChange={e => setEditProfil({ ...editProfil, nom_startup: e.target.value })} placeholder="Ex: TechVision" /></div>
                    <div><label className="lbl">Secteur</label><input className="inp" value={editProfil.secteur || ""} onChange={e => setEditProfil({ ...editProfil, secteur: e.target.value })} placeholder="Ex: Fintech..." /></div>
                    <div><label className="lbl">Fonction</label><input className="inp" value={editProfil.fonction || ""} onChange={e => setEditProfil({ ...editProfil, fonction: e.target.value })} placeholder="Ex: CEO" /></div>
                    <div><label className="lbl">Taille équipe</label>
                      <select className="inp" value={editProfil.taille || ""} onChange={e => setEditProfil({ ...editProfil, taille: e.target.value })}>
                        <option value="">Sélectionner</option>
                        {["1-5", "6-15", "16-50", "51-100", "100+"].map(t => <option key={t} value={t}>{t} personnes</option>)}
                      </select>
                    </div>
                    <div><label className="lbl">Site web</label><input className="inp" value={editProfil.site_web || ""} onChange={e => setEditProfil({ ...editProfil, site_web: e.target.value })} placeholder="https://..." /></div>
                    <div><label className="lbl">Localisation</label><input className="inp" value={editProfil.localisation || ""} onChange={e => setEditProfil({ ...editProfil, localisation: e.target.value })} placeholder="Ex: Tunis" /></div>
                  </div>
                  <div style={{ marginBottom: 20 }}><label className="lbl">Description</label><textarea className="inp" rows={4} value={editProfil.description || ""} onChange={e => setEditProfil({ ...editProfil, description: e.target.value })} placeholder="Décrivez votre startup..." /></div>
                  <button className="btn btn-gold" style={{ padding: "12px 28px" }} onClick={saveProfil}><FaCheck /> Sauvegarder</button>
                </div>
              </div>
            </div>
          )}

          {/* EXPERTS */}
          {tab === "experts" && (
            <div>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <FaSearch style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#B8C4D6", fontSize: 13 }} />
                  <input className="inp" placeholder="Rechercher par nom ou domaine..." style={{ paddingLeft: 38 }} value={expertFilter} onChange={e => setExpertFilter(e.target.value)} />
                </div>
                <div style={{ color: "#8A9AB5", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{filteredExperts.length} expert{filteredExperts.length > 1 ? "s" : ""}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
                {filteredExperts.map(e => (
                  <div key={e.id} className="expert-card" style={{ borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ height: 4, background: "linear-gradient(90deg,#0A2540,#F7B500)" }} />
                    <div style={{ position: "relative", height: 160, background: "linear-gradient(135deg,#0A2540,#1a3f6f)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {e.photo ? <img src={`${BASE}/uploads/photos/${e.photo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={ev => (ev.currentTarget.style.display = "none")} />
                        : <div style={{ width: 66, height: 66, borderRadius: "50%", background: "rgba(247,181,0,.2)", border: "3px solid #F7B500", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 800, fontSize: 24 }}>{e.user?.prenom?.[0]}{e.user?.nom?.[0]}</div>}
                    </div>
                    <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540", marginBottom: 3 }}>{e.user?.prenom} {e.user?.nom}</div>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#92400E", background: "#FEF3C7", borderRadius: 6, padding: "2px 8px", display: "inline-block", marginBottom: 10 }}>{e.domaine || "Expert"}</div>
                      {e.description && <p style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.7, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{e.description}</p>}
                      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                        <button className="btn btn-dark" style={{ flex: 1, justifyContent: "center", fontSize: 12.5, padding: "9px" }} onClick={() => { setSelectedExpert(e); setTab("messages"); loadConversation(e.user_id || e.user?.id); }}><FaComments /> Message</button>
                        <button className="btn btn-gold" style={{ flex: 1, justifyContent: "center", fontSize: 12.5, padding: "9px" }} onClick={() => { setRdvForm({ ...rdvForm, expert_id: String(e.id) }); setTab("rdv"); }}><FaCalendar /> RDV</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RDV */}
          {tab === "rdv" && (
            <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20 }}>
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>📅 Prendre un RDV</div>
                </div>
                <div style={{ padding: "24px" }}>
                  <div style={{ marginBottom: 14 }}><label className="lbl">Expert *</label>
                    <select className="inp" value={rdvForm.expert_id} onChange={e => setRdvForm({ ...rdvForm, expert_id: e.target.value })}>
                      <option value="">Sélectionner...</option>
                      {experts.map(e => <option key={e.id} value={e.id}>{e.user?.prenom} {e.user?.nom} — {e.domaine || "Expert"}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 20 }}><label className="lbl">Date & heure *</label>
                    <input className="inp" type="datetime-local" value={rdvForm.date_rdv} onChange={e => setRdvForm({ ...rdvForm, date_rdv: e.target.value })} min={new Date().toISOString().slice(0, 16)} />
                  </div>
                  <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center", padding: "13px" }} onClick={prendreRdv}><FaCalendar /> Confirmer</button>
                </div>
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>Mes rendez-vous ({rdvs.length})</div>
                </div>
                <div style={{ padding: "16px", maxHeight: 480, overflowY: "auto" }}>
                  {rdvs.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: "#8A9AB5" }}>Aucun rendez-vous</div>
                    : rdvs.map(r => (
                      <div key={r.id} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", marginBottom: 10, border: "1px solid #E8EEF6" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0A2540", fontSize: 14 }}>{r.expert?.user?.prenom} {r.expert?.user?.nom}</div>
                            <div style={{ fontSize: 12, color: "#8A9AB5", marginTop: 3 }}>📅 {new Date(r.date_rdv).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</div>
                          </div>
                          <span style={{ background: `${S_COLOR[r.statut] || "#E2E8F0"}18`, color: S_COLOR[r.statut] || "#6B7280", borderRadius: 99, padding: "4px 12px", fontSize: 11.5, fontWeight: 700 }}>
                            {S_LABEL[r.statut] || r.statut}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {tab === "messages" && (
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, height: "calc(100vh - 200px)" }}>
              <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1F5F9", fontWeight: 700, fontSize: 14, color: "#0A2540", background: "#FAFBFE" }}>Experts</div>
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {experts.map(e => (
                    <div key={e.id} onClick={() => { setSelectedExpert(e); loadConversation(e.user_id || e.user?.id); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", cursor: "pointer", background: selectedExpert?.id === e.id ? "#FFFBEB" : "transparent", borderLeft: selectedExpert?.id === e.id ? "3px solid #F7B500" : "3px solid transparent", transition: "all .15s" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid #F7B500" }}>
                        {e.photo ? <img src={`${BASE}/uploads/photos/${e.photo}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" onError={ev => (ev.currentTarget.style.display = "none")} /> : <span style={{ color: "#F7B500", fontWeight: 800, fontSize: 12 }}>{e.user?.prenom?.[0]}{e.user?.nom?.[0]}</span>}
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#0A2540", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.user?.prenom} {e.user?.nom}</div>
                        <div style={{ fontSize: 11.5, color: "#8A9AB5" }}>{e.domaine || "Expert"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {!selectedExpert ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#8A9AB5" }}>
                    <div style={{ fontSize: 48, marginBottom: 14 }}>💬</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540", marginBottom: 6 }}>Sélectionnez un expert</div>
                    <div style={{ fontSize: 13 }}>pour démarrer une conversation</div>
                  </div>
                ) : (
                  <>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 12, background: "#FAFBFE" }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", overflow: "hidden", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #F7B500" }}>
                        {selectedExpert.photo ? <img src={`${BASE}/uploads/photos/${selectedExpert.photo}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" onError={ev => (ev.currentTarget.style.display = "none")} /> : <span style={{ color: "#F7B500", fontWeight: 800, fontSize: 14 }}>{selectedExpert.user?.prenom?.[0]}{selectedExpert.user?.nom?.[0]}</span>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#0A2540", fontSize: 14 }}>{selectedExpert.user?.prenom} {selectedExpert.user?.nom}</div>
                        <div style={{ fontSize: 12, color: "#8A9AB5" }}>{selectedExpert.domaine || "Expert"}</div>
                      </div>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {conversation.length === 0 && <div style={{ textAlign: "center", color: "#8A9AB5", padding: "40px 0", fontSize: 13 }}>Démarrez la conversation !</div>}
                      {conversation.map(m => {
                        const isMe = m.sender_id === user?.id;
                        return (
                          <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                            <div className={isMe ? "msg-me" : "msg-other"}>
                              {m.contenu}
                              <div style={{ fontSize: 10, opacity: .55, marginTop: 3, textAlign: "right" }}>{new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={msgEndRef} />
                    </div>
                    <div style={{ padding: "12px 18px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 10 }}>
                      <input className="inp" placeholder="Votre message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && envoyerMessage()} style={{ flex: 1 }} />
                      <button className="btn btn-gold" style={{ padding: "10px 18px" }} onClick={envoyerMessage}><FaPaperPlane /></button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TÉMOIGNAGES AVEC ÉTOILES */}
          {tab === "temoignages" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Formulaire d'envoi avec étoiles */}
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>✍️ Partager mon expérience</div>
                </div>
                <div style={{ padding: "24px" }}>
                  <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#0369A1" }}>
                    💡 Votre témoignage sera examiné avant d'être publié sur la page d'accueil.
                  </div>
                  
                  {/* Sélection des étoiles */}
                  <label className="lbl">Votre note (étoiles)</label>
                  <div style={{ marginBottom: 20 }}>
                    <StarRating 
                      rating={newTemoNote} 
                      onRate={setNewTemoNote} 
                      onHover={setHoveredNote} 
                      size={34} 
                    />
                    <div style={{ marginTop: 8, fontSize: 13, color: "#8A9AB5" }}>
                      {newTemoNote === 1 && "★ Très insatisfait"}
                      {newTemoNote === 2 && "★★ Insatisfait"}
                      {newTemoNote === 3 && "★★★ Neutre"}
                      {newTemoNote === 4 && "★★★★ Satisfait"}
                      {newTemoNote === 5 && "★★★★★ Très satisfait"}
                    </div>
                  </div>
                  
                  <label className="lbl">Votre témoignage</label>
                  <textarea 
                    className="inp" 
                    rows={6} 
                    placeholder="Partagez votre expérience avec BEH..." 
                    value={newTemo} 
                    onChange={e => setNewTemo(e.target.value)} 
                    style={{ marginBottom: 16 }} 
                  />
                  <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center", padding: "12px" }} onClick={envoyerTemoignage}>
                    <FaPaperPlane /> Envoyer mon témoignage
                  </button>
                </div>
              </div>
              
              {/* Liste des témoignages avec étoiles */}
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>Mes témoignages ({temoignages.length})</div>
                </div>
                <div style={{ padding: "16px", maxHeight: 500, overflowY: "auto" }}>
                  {temoignages.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "#8A9AB5" }}>Aucun témoignage</div>
                  ) : (
                    temoignages.map(t => (
                      <div key={t.id} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", marginBottom: 12, border: "1px solid #E8EEF6" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                          <div style={{ fontSize: 11, color: "#8A9AB5" }}>{new Date(t.createdAt).toLocaleDateString("fr-FR")}</div>
                          <span style={{ 
                            background: t.statut === "valide" ? "#ECFDF5" : t.statut === "refuse" ? "#FEF2F2" : "#FFF8E1", 
                            color: t.statut === "valide" ? "#059669" : t.statut === "refuse" ? "#DC2626" : "#B45309", 
                            borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700 
                          }}>
                            {t.statut === "valide" ? "✅ Publié" : t.statut === "refuse" ? "❌ Refusé" : "⏳ En attente"}
                          </span>
                        </div>
                        {/* Affichage des étoiles */}
                        <div style={{ marginBottom: 10 }}>
                          <StarRating rating={t.note || 5} size={18} showLabel={true} />
                        </div>
                        <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.72, fontStyle: "italic", margin: 0 }}>"{t.texte}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}