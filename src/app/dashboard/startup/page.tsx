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
} from "react-icons/fa";

const BASE = "http://localhost:3001";

// ─── CONSTANTES ──────────────────────────────────────────────────────────────

const SERVICES_INFO: Record<string, any> = {
  consulting: {
    label: "Consulting Stratégique", icon: <FaChartLine />, color: "#3B82F6", badge: "Stratégie",
    desc: "Structurez et optimisez votre entreprise pour améliorer votre performance globale.",
    duree: "2 à 8 semaines",
    points: ["Audit stratégique complet","Business model review","Roadmap actionnable","Suivi mensuel inclus"],
  },
  "audit-sur-site": {
    label: "Audit sur Site", icon: <FaSearchPlus />, color: "#8B5CF6", badge: "Terrain",
    desc: "Nos experts se déplacent dans vos locaux pour un diagnostic terrain approfondi.",
    duree: "1 à 5 jours",
    points: ["Diagnostic terrain","Analyse processus","Rapport détaillé","Plan d'action prioritaire"],
  },
  formations: {
    label: "Formations & Podcasts", icon: <FaGraduationCap />, color: "#F7B500", badge: "Certif.",
    desc: "Programmes certifiants sur mesure + podcasts exclusifs avec des experts.",
    duree: "1 jour à 3 mois",
    points: ["Contenu sur mesure","Formateurs certifiés","Certification incluse","Support post-formation"],
  },
  "nos-plateformes": {
    label: "Nos Plateformes", icon: <FaDesktop />, color: "#10B981", badge: "Digital",
    desc: "Solutions digitales sur mesure : ERP, CRM, gestion de projets.",
    duree: "4 à 16 semaines",
    points: ["Solution ERP complète","CRM & relation client","Gestion de projets","Support & maintenance"],
  },
};

const MODE_LABELS: Record<string, { label: string; color: string }> = {
  presentiel: { label: "Présentiel", color: "#3B82F6" },
  en_ligne:   { label: "En ligne",   color: "#22C55E" },
  hybride:    { label: "Hybride",    color: "#8B5CF6" },
};

const ADN_ITEMS = [
  { title:"Notre Vision",  body:"Devenir la référence absolue en accompagnement de startups innovantes.", color:"#3B82F6", anchor:"vision" },
  { title:"Notre Mission", body:"Offrir aux startups un accès privilégié à des experts certifiés.", color:"#F7B500", anchor:"mission" },
  { title:"Nos Valeurs",   body:"Excellence, transparence et engagement humain.", color:"#10B981", anchor:"valeurs" },
];

const S_COLOR: Record<string, string> = {
  en_attente:"#F7B500", valide:"#22C55E", refuse:"#EF4444",
  confirme:"#22C55E", annule:"#EF4444", acceptee:"#22C55E",
  en_cours:"#3B82F6", terminee:"#10B981", refusee:"#EF4444",
};
const S_LABEL: Record<string, string> = {
  en_attente:"⏳ En attente", valide:"✅ Validé", refuse:"❌ Refusé",
  confirme:"✅ Confirmé", annule:"❌ Annulé", acceptee:"✅ Acceptée",
  en_cours:"🔄 En cours", terminee:"✅ Terminée", refusee:"❌ Refusée",
};

type Tab = "accueil"|"services"|"profil"|"experts"|"rdv"|"messages"|"temoignages"|"mes-demandes";

// ─── HOOKS ───────────────────────────────────────────────────────────────────

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

// ─── SOUS-COMPOSANT CARTE FORMATION ─────────────────────────────────────────

function FormationCard({ f, onSelect, demanderFormation, demandeExiste }: { f: any; onSelect: (f: any) => void; demanderFormation: (id: number, titre: string) => void; demandeExiste: boolean }) {
  const modeInfo = MODE_LABELS[f.mode] || { label: f.mode || "En ligne", color: "#22C55E" };
  return (
    <div className="form-card" onClick={() => onSelect(f)}>
      <div style={{ height: 130, position: "relative", background: "linear-gradient(135deg,#0A2540,#1a3a6e)", overflow: "hidden" }}>
        {f.image && <img src={`${BASE}/uploads/formations/${f.image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .55 }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,37,64,.85),rgba(10,37,64,.2))" }} />
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 5 }}>
          {f.certifiante && <span style={{ background: "#F7B500", color: "#0A2540", borderRadius: 99, padding: "2px 8px", fontSize: 9.5, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 3 }}><FaCertificate style={{ fontSize: 8 }} />CERTIF.</span>}
        </div>
        <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,.4)", backdropFilter: "blur(4px)", borderRadius: 99, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: "#fff" }}>
          <span style={{ color: modeInfo.color }}>● </span>{modeInfo.label}
        </div>
        <div style={{ position: "absolute", bottom: 10, right: 10 }}>
          <span style={{ background: f.prix ? "rgba(10,37,64,.85)" : "rgba(34,197,94,.85)", backdropFilter: "blur(4px)", color: f.prix ? "#F7B500" : "#fff", borderRadius: 99, padding: "4px 10px", fontSize: 12, fontWeight: 800 }}>
            {f.prix ? `${f.prix} DT` : "Gratuit"}
          </span>
        </div>
      </div>
      <div style={{ padding: "14px 14px 12px" }}>
        {f.domaine && <div style={{ fontSize: 10, fontWeight: 700, color: "#F7B500", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 5 }}>{f.domaine}</div>}
        <h3 style={{ fontWeight: 800, color: "#0A2540", fontSize: 14, lineHeight: 1.3, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.titre}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, fontSize: 11, color: "#64748B" }}>
          {f.formateur && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><FaUsers style={{ fontSize: 9 }} />{f.formateur}</span>}
          {f.duree && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><FaClock style={{ fontSize: 9 }} />{f.duree}</span>}
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          <button style={{ flex: 1, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 9, padding: "8px", fontWeight: 700, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
            onClick={e => { e.stopPropagation(); onSelect(f); }}>En savoir +</button>
          {demandeExiste ? (
            <button disabled style={{ flex: 1, background: "#E2E8F0", color: "#64748B", border: "none", borderRadius: 9, padding: "8px", fontWeight: 700, fontSize: 11.5, cursor: "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <FaCheckCircle /> Déjà demandé
            </button>
          ) : (
            <button style={{ flex: 1, background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 9, padding: "8px", fontWeight: 700, fontSize: 11.5, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
              onClick={e => { e.stopPropagation(); demanderFormation(f.id, f.titre); }}>Demander</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

export default function DashboardStartup() {
  const router = useRouter();

  // ── Auth state ──
  const [user,    setUser]    = useState<any>(null);
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ── Navigation ──
  const [tab,        setTab]        = useState<Tab>("accueil");
  const [serviceTab, setServiceTab] = useState<"catalogue"|"formations"|"podcasts"|"plateformes"|"personnalise">("catalogue");

  // ── Data ──
  const [experts,      setExperts]      = useState<any[]>([]);
  const [pubExperts,   setPubExperts]   = useState<any[]>([]);
  const [rdvs,         setRdvs]         = useState<any[]>([]);
  const [conversation, setConversation] = useState<any[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [newMsg,       setNewMsg]       = useState("");
  const [temoignages,  setTemoignages]  = useState<any[]>([]);
  const [pubTemos,     setPubTemos]     = useState<any[]>([]);
  const [demandes,     setDemandes]     = useState<any[]>([]);
  const [formations,   setFormations]   = useState<any[]>([]);
  const [podcasts,     setPodcasts]     = useState<any[]>([]);

  // ── UI state ──
  const [toast,       setToast]       = useState({ text: "", ok: true });
  const [photoFile,   setPhotoFile]   = useState<File | null>(null);
  const [photoPreview,setPhotoPreview]= useState("");
  const [editProfil,  setEditProfil]  = useState<any>({ nom_startup:"",secteur:"",taille:"",site_web:"",description:"",fonction:"",localisation:"" });
  const [rdvForm,     setRdvForm]     = useState({ expert_id:"", date_rdv:"" });
  const [expertFilter,setExpertFilter]= useState("");
  const [tIdx,        setTIdx]        = useState(0);
  const [tAnim,       setTAnim]       = useState(false);
  const [newTemo,     setNewTemo]     = useState("");
  const [newTemoNote, setNewTemoNote] = useState(5);
  const [selectedFormation, setSelectedFormation] = useState<any>(null);
  const [serviceModal, setServiceModal] = useState<string|null>(null);
  const [sendingDemande, setSendingDemande] = useState(false);
  const [formationsLoading, setFormationsLoading] = useState(false);
  const [domaineFilter, setDomaineFilter] = useState("Tous");
  const [formSearch,    setFormSearch]    = useState("");
  const [demandeForm, setDemandeForm] = useState({ service:"",description:"",delai:"",objectif:"",telephone:"" });

  const msgEndRef = useRef<HTMLDivElement>(null);

  // ── Helpers ──
  const tk   = useCallback(() => localStorage.getItem("token") || "", []);
  const hdr  = useCallback(() => ({ Authorization: `Bearer ${tk()}` }), [tk]);
  const hdrJ = useCallback(() => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" }), [tk]);

  function notify(text: string, ok = true) {
    setToast({ text, ok });
    setTimeout(() => setToast({ text: "", ok: true }), 3500);
  }

  // ── Déconnexion propre ──
  const forceLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setStartup(null);
    setDemandes([]);
    setExperts([]);
    setRdvs([]);
    setTemoignages([]);
    setConversation([]);
    window.location.href = "/connexion";
  }, []);

  // ── Scroll messages ──
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation]);

  // ── Carousel témoignages ──
  useEffect(() => {
    if (!pubTemos.length) return;
    const t = setInterval(() => { if (!tAnim) setTIdx(p => (p + 1) % pubTemos.length); }, 5000);
    return () => clearInterval(t);
  }, [pubTemos.length, tAnim]);

  function goT(i: number) {
    if (tAnim || !pubTemos.length) return;
    setTAnim(true);
    setTimeout(() => { setTIdx(i); setTAnim(false); }, 280);
  }

  // ── Chargement des données startup (protégé par token) ──
  const loadStartupData = useCallback(async (currentToken: string) => {
    const authHdr = { Authorization: `Bearer ${currentToken}` };
    const ts = `?_=${Date.now()}`;
    const res = await fetch(`${BASE}/startups/moi${ts}`, { headers: authHdr });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) throw new Error("AUTH_EXPIRED");
      throw new Error(`HTTP ${res.status}`);
    }
    const s = await res.json();
    if (!s) throw new Error("NO_STARTUP");
    setStartup(s);
    setEditProfil({
      nom_startup: s.nom_startup || "", secteur: s.secteur || "", taille: s.taille || "",
      site_web: s.site_web || "", description: s.description || "",
      fonction: s.fonction || "", localisation: s.localisation || "",
    });

    const [rdvRes, demandeRes, temoRes] = await Promise.all([
      fetch(`${BASE}/rendez-vous/startup${ts}`,          { headers: authHdr }),
      fetch(`${BASE}/demandes-service/mes-demandes${ts}`,{ headers: authHdr }),
      fetch(`${BASE}/temoignages/mes-temoignages${ts}`,  { headers: authHdr }),
    ]);
    setRdvs(rdvRes.ok ? await rdvRes.json() : []);
    setDemandes(demandeRes.ok ? await demandeRes.json() : []);
    setTemoignages(temoRes.ok ? await temoRes.json() : []);
  }, []);

  const loadPublicData = useCallback(async () => {
    const ts = `?_=${Date.now()}`;
    const [eRes, tRes] = await Promise.all([
      fetch(`${BASE}/experts/liste${ts}`),
      fetch(`${BASE}/temoignages/publics${ts}`),
    ]);
    const e = eRes.ok ? await eRes.json() : [];
    const t = tRes.ok ? await tRes.json() : [];
    const mapE = (ex: any) => ({ ...ex, disponible: ex.disponibilite === "disponible" });
    setExperts(Array.isArray(e) ? e.map(mapE) : []);
    setPubExperts(Array.isArray(e) ? e.slice(0, 4).map(mapE) : []);
    setPubTemos(Array.isArray(t) ? t : []);
  }, []);

  const loadFormationsData = useCallback(async () => {
    setFormationsLoading(true);
    try {
      const res = await fetch(`${BASE}/formations/public?_=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setFormations(data.filter((f: any) => f.statut === "publie" && (!f.categorie || f.categorie !== "podcast")));
          setPodcasts(data.filter((f: any) => f.statut === "publie" && f.categorie === "podcast"));
        }
      }
    } catch {}
    setFormationsLoading(false);
  }, []);

  // ── Initialisation unique ──
  useEffect(() => {
    const token   = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) { router.push("/connexion"); return; }
    let parsed: any;
    try { parsed = JSON.parse(userStr); } catch { router.push("/connexion"); return; }
    if (parsed.role !== "startup") { router.push("/"); return; }
    setUser(parsed);
    setLoading(true);
    setError(null);
    Promise.all([
      loadStartupData(token),
      loadPublicData(),
      loadFormationsData(),
    ])
      .catch(err => {
        if (err.message === "AUTH_EXPIRED") { forceLogout(); return; }
        setError("Impossible de charger vos données. Veuillez rafraîchir.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadDemandes = useCallback(async () => {
    const r = await fetch(`${BASE}/demandes-service/mes-demandes?_=${Date.now()}`, { headers: hdr() });
    if (r.ok) setDemandes(await r.json());
  }, [hdr]);

  async function loadConversation(expertUserId: number) {
    try {
      const c = await fetch(`${BASE}/messages/conversation/${expertUserId}?_=${Date.now()}`, { headers: hdr() }).then(r => r.json());
      setConversation(Array.isArray(c) ? c : []);
    } catch {}
  }

  // ── Actions profil ──
  async function uploadPhoto() {
    if (!photoFile) return;
    const fd = new FormData(); fd.append("photo", photoFile);
    const r = await fetch(`${BASE}/startups/photo`, { method: "POST", headers: { Authorization: `Bearer ${tk()}` }, body: fd });
    if (r.ok) { notify("✅ Photo mise à jour !"); await loadStartupData(tk()); setPhotoFile(null); setPhotoPreview(""); }
    else notify("Erreur upload", false);
  }

  async function saveProfil() {
    try {
      const r = await fetch(`${BASE}/startups/profil`, { method: "PUT", headers: hdrJ(), body: JSON.stringify(editProfil) });
      if (r.ok) { notify("✅ Profil sauvegardé !"); await loadStartupData(tk()); }
      else { const t = await r.text(); notify(`❌ Erreur : ${t}`, false); }
    } catch { notify("❌ Erreur réseau", false); }
  }

  // ── RDV ──
  async function prendreRdv() {
    if (!rdvForm.expert_id || !rdvForm.date_rdv) { notify("Remplissez tous les champs", false); return; }
    const r = await fetch(`${BASE}/rendez-vous`, { method: "POST", headers: hdrJ(), body: JSON.stringify(rdvForm) });
    if (r.ok) { notify("✅ RDV demandé !"); setRdvForm({ expert_id: "", date_rdv: "" }); await loadStartupData(tk()); }
    else notify("Erreur", false);
  }

  // ── Messages ──
  async function envoyerMessage() {
    if (!newMsg.trim() || !selectedExpert) return;
    const rid = selectedExpert.user_id || selectedExpert.user?.id;
    const r = await fetch(`${BASE}/messages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ receiver_id: rid, contenu: newMsg }) });
    if (r.ok) { setNewMsg(""); loadConversation(rid); }
  }

  // ── Témoignages ──
  async function envoyerTemoignage() {
    if (!newTemo.trim()) { notify("Écrivez votre témoignage", false); return; }
    const r = await fetch(`${BASE}/temoignages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ texte: newTemo, note: newTemoNote }) });
    if (r.ok) { notify("✅ Témoignage envoyé !"); setNewTemo(""); setNewTemoNote(5); await loadStartupData(tk()); }
    else notify("Erreur", false);
  }

  // ── Demandes service ──
  async function envoyerDemande(e: React.FormEvent) {
    e.preventDefault();
    if (!demandeForm.description) { notify("Décrivez votre besoin", false); return; }
    setSendingDemande(true);
    try {
      const r = await fetch(`${BASE}/demandes-service`, { method: "POST", headers: hdrJ(), body: JSON.stringify(demandeForm) });
      if (r.ok) {
        notify("✅ Demande envoyée ! Notre équipe vous contacte sous 24h.");
        setServiceModal(null);
        setDemandeForm({ service: "", description: "", delai: "", objectif: "", telephone: "" });
        await reloadDemandes();
        setTimeout(() => setTab("mes-demandes"), 800);
      } else notify("Erreur envoi", false);
    } catch { notify("Erreur", false); }
    setSendingDemande(false);
  }

  function demandeExistePourFormation(formationId: number): boolean {
    return demandes.some(d => d.service === "formation" && (d.formationId === formationId || d.formation?.id === formationId));
  }

  async function demanderFormation(formationId: number, titre: string) {
    if (demandeExistePourFormation(formationId)) { notify("❌ Vous avez déjà demandé cette formation.", false); return; }
    const r = await fetch(`${BASE}/demandes-service/formation/${formationId}`, { method: "POST", headers: hdr() });
    if (r.ok) { notify(`✅ Demande envoyée pour "${titre}" !`); await reloadDemandes(); }
    else { const err = await r.text(); notify(`Erreur : ${err}`, false); }
  }

  function openService(slug: string) {
    setDemandeForm({ ...demandeForm, service: slug, telephone: startup?.user?.telephone || "" });
    setServiceModal(slug);
  }

  // ── Computed ──
  const photoUrl = startup?.photo ? `${BASE}/uploads/photos/${startup.photo}` : null;
  const initials = user ? (user.prenom?.[0] || "") + (user.nom?.[0] || "") : "?";
  const filteredExperts = experts.filter(e => !expertFilter || e.user?.nom?.toLowerCase().includes(expertFilter.toLowerCase()) || e.domaine?.toLowerCase().includes(expertFilter.toLowerCase()));
  const demandesEnAttente = demandes.filter(d => d.statut === "en_attente").length;
  const curTemo = pubTemos[tIdx % Math.max(pubTemos.length, 1)];
  const domainesDisponibles = ["Tous", ...Array.from(new Set(formations.map(f => f.domaine || "Autres"))).filter(Boolean).sort()];
  const filteredFormations = formations.filter(f => {
    const matchD = domaineFilter === "Tous" || f.domaine === domaineFilter;
    const matchS = !formSearch || f.titre?.toLowerCase().includes(formSearch.toLowerCase()) || f.description?.toLowerCase().includes(formSearch.toLowerCase());
    return matchD && matchS;
  });
  const formsByDomaine: Record<string, any[]> = {};
  filteredFormations.forEach(f => { const d = f.domaine || "Autres"; if (!formsByDomaine[d]) formsByDomaine[d] = []; formsByDomaine[d].push(f); });

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "accueil",      label: "Accueil",      icon: "🏠" },
    { id: "services",     label: "Services",     icon: "🛠️" },
    { id: "profil",       label: "Mon Profil",   icon: "👤" },
    { id: "experts",      label: "Experts",      icon: "⭐" },
    { id: "rdv",          label: "Rendez-vous",  icon: "📅" },
    { id: "messages",     label: "Messages",     icon: "💬" },
    { id: "temoignages",  label: "Témoignages",  icon: "🌟" },
    { id: "mes-demandes", label: "Mes Demandes", icon: "📋" },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // RENDU PRINCIPAL
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "4px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ color: "#0A2540", fontWeight: 600 }}>Chargement de votre espace...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 500, textAlign: "center", border: "1px solid #FEE2E2" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>Erreur de chargement</div>
        <div style={{ color: "#64748B", marginBottom: 24 }}>{error}</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => window.location.reload()} style={{ background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Réessayer</button>
          <button onClick={forceLogout} style={{ background: "#0A2540", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Se reconnecter</button>
        </div>
      </div>
    </div>
  );

  if (!user || !startup) return null;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDU PRINCIPAL (suite)
  // ─────────────────────────────────────────────────────────────────────────

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
        .btn-green{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;}.btn-green:hover{background:#059669;color:#fff;}
        .btn-purple{background:#F3F0FF;color:#7C3AED;border:1px solid #DDD6FE;}.btn-purple:hover{background:#7C3AED;color:#fff;}
        .card{background:#fff;border:1px solid #E8EEF6;border-radius:18px;overflow:hidden;}
        .inp{width:100%;background:#F7F9FC;border:1.5px solid #E2E8F0;border-radius:10px;padding:11px 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#0A2540;outline:none;transition:border-color .2s;}
        .inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.1);}
        textarea.inp{resize:vertical;min-height:90px;}
        .lbl{font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px;}
        .svc-card{background:#fff;border:1.5px solid #E8EEF6;border-radius:20px;overflow:hidden;transition:transform .32s cubic-bezier(.22,1,.36,1),box-shadow .32s,border-color .32s;cursor:pointer;}
        .svc-card:hover{transform:translateY(-8px);box-shadow:0 24px 56px rgba(10,37,64,.13);border-color:rgba(247,181,0,.4);}
        .expert-card{background:#fff;border:1.5px solid #E8EEF6;border-radius:16px;transition:transform .28s,box-shadow .28s,border-color .28s;}
        .expert-card:hover{transform:translateY(-5px);box-shadow:0 14px 36px rgba(10,37,64,.1);border-color:rgba(59,130,246,.3);}
        .adn-card{background:#fff;border-radius:20px;border:1.5px solid rgba(10,37,64,.07);box-shadow:0 4px 20px rgba(10,37,64,.06);overflow:hidden;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s;cursor:pointer;}
        .adn-card:hover{transform:translateY(-8px);box-shadow:0 28px 60px rgba(10,37,64,.13);}
        .msg-me{background:linear-gradient(135deg,#0A2540,#1a4080);color:#fff;border-radius:18px 18px 4px 18px;padding:10px 15px;max-width:72%;font-size:13.5px;line-height:1.65;}
        .msg-other{background:#F0F4FA;color:#0A2540;border-radius:18px 18px 18px 4px;padding:10px 15px;max-width:72%;font-size:13.5px;line-height:1.65;}
        .tab-btn{background:none;border:none;cursor:pointer;padding:11px 8px;font-size:12.5px;font-weight:600;color:#8A9AB5;border-bottom:2.5px solid transparent;font-family:'Plus Jakarta Sans',sans-serif;transition:all .2s;white-space:nowrap;display:flex;align-items:center;gap:5px;}
        .tab-btn.on{color:#0A2540;border-bottom-color:#F7B500;font-weight:800;}
        .sub-tab{background:none;border:none;cursor:pointer;padding:9px 18px;font-size:13px;font-weight:600;color:#64748B;border-radius:99px;font-family:'Plus Jakarta Sans',sans-serif;transition:all .2s;white-space:nowrap;}
        .sub-tab.on{background:#F7B500;color:#0A2540;font-weight:700;}
        .pill{border:1.5px solid #E2E8F0;border-radius:99px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;background:#fff;color:#64748B;transition:all .22s;font-family:'Plus Jakarta Sans',sans-serif;white-space:nowrap;}
        .pill:hover{border-color:#F7B500;color:#B45309;background:#FFFBEB;}
        .pill.active{background:#F7B500;color:#0A2540;border-color:#F7B500;font-weight:700;}
        .form-card{background:#fff;border:1.5px solid #E8EEF6;border-radius:18px;overflow:hidden;transition:all .3s cubic-bezier(.22,1,.36,1);cursor:pointer;}
        .form-card:hover{transform:translateY(-7px);box-shadow:0 20px 48px rgba(10,37,64,.13);border-color:rgba(247,181,0,.4);}
        .pod-card{background:#fff;border:1.5px solid #E8EEF6;border-radius:16px;overflow:hidden;transition:all .3s;cursor:pointer;}
        .pod-card:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(139,92,246,.15);border-color:rgba(139,92,246,.35);}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.6);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);}
        .modal-box{background:#fff;border-radius:24px;width:100%;max-width:660px;max-height:92vh;overflow-y:auto;box-shadow:0 28px 80px rgba(10,37,64,.25);}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      `}</style>

      {/* ── Toast ── */}
      {toast.text && (
        <div style={{ position:"fixed",top:20,right:20,zIndex:9999,background:toast.ok?"#ECFDF5":"#FEF2F2",border:`1.5px solid ${toast.ok?"#A7F3D0":"#FECACA"}`,borderLeft:`4px solid ${toast.ok?"#059669":"#DC2626"}`,color:toast.ok?"#059669":"#DC2626",borderRadius:12,padding:"13px 20px",fontWeight:700,fontSize:13,boxShadow:"0 8px 28px rgba(0,0,0,.12)" }}>
          {toast.text}
        </div>
      )}

      {/* ── Modal Formation détail ── */}
      {selectedFormation && (
        <div className="modal-bg" onClick={() => setSelectedFormation(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ position:"relative",height:180,background:"linear-gradient(135deg,#0A2540,#1a3a6e)",overflow:"hidden",borderRadius:"24px 24px 0 0" }}>
              {selectedFormation.image && <img src={`${BASE}/uploads/formations/${selectedFormation.image}`} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",opacity:.5 }} />}
              <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,37,64,.9),transparent)" }} />
              <button onClick={() => setSelectedFormation(null)} style={{ position:"absolute",top:16,right:16,width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.25)",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><FaTimes /></button>
              <div style={{ position:"absolute",bottom:16,left:20,right:60 }}>
                {selectedFormation.domaine && <span style={{ background:"#F7B500",color:"#0A2540",borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700,marginRight:8 }}>{selectedFormation.domaine}</span>}
                {selectedFormation.certifiante && <span style={{ background:"rgba(34,197,94,.2)",color:"#4ADE80",border:"1px solid rgba(34,197,94,.35)",borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700 }}><FaCertificate style={{ marginRight:4,fontSize:10 }} />Certifiante</span>}
                <div style={{ color:"#fff",fontWeight:800,fontSize:18,lineHeight:1.2,marginTop:8 }}>{selectedFormation.titre}</div>
              </div>
            </div>
            <div style={{ padding:"24px 28px" }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20 }}>
                {[
                  { label:"Formateur", val:selectedFormation.formateur||"BEH Expert", color:"#3B82F6" },
                  { label:"Durée",     val:selectedFormation.duree||"Non précisée",   color:"#F7B500" },
                  { label:"Mode",      val:MODE_LABELS[selectedFormation.mode]?.label||"En ligne", color:MODE_LABELS[selectedFormation.mode]?.color||"#22C55E" },
                  { label:"Lieu",      val:selectedFormation.localisation||"En ligne", color:"#8B5CF6" },
                ].map((row, i) => (
                  <div key={i} style={{ background:"#F8FAFC",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:28,height:28,borderRadius:8,background:`${row.color}15`,color:row.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700,fontSize:11 }}>•</div>
                    <div>
                      <div style={{ fontSize:10,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"1px" }}>{row.label}</div>
                      <div style={{ fontSize:13.5,fontWeight:600,color:"#0A2540" }}>{row.val}</div>
                    </div>
                  </div>
                ))}
              </div>
              {selectedFormation.description && <p style={{ fontSize:14,color:"#475569",lineHeight:1.8,margin:"0 0 20px" }}>{selectedFormation.description}</p>}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"#F8FAFC",borderRadius:14,padding:"16px 18px",marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:4 }}>Prix</div>
                  <div style={{ fontSize:26,fontWeight:900,color:selectedFormation.prix?"#0A2540":"#22C55E" }}>{selectedFormation.prix?`${selectedFormation.prix} DT`:"Gratuit"}</div>
                </div>
                {selectedFormation.places_limitees && (
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",marginBottom:4 }}>Places restantes</div>
                    <div style={{ fontSize:22,fontWeight:900,color:(selectedFormation.places_disponibles||0)>5?"#22C55E":"#EF4444" }}>{selectedFormation.places_disponibles??0}</div>
                  </div>
                )}
              </div>
              {demandeExistePourFormation(selectedFormation.id) ? (
                <button disabled style={{ width:"100%",background:"#E2E8F0",color:"#64748B",border:"none",borderRadius:14,padding:"16px",fontWeight:900,fontSize:15,cursor:"not-allowed",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
                  <FaCheckCircle /> Déjà demandé
                </button>
              ) : (
                <button onClick={() => { setSelectedFormation(null); demanderFormation(selectedFormation.id, selectedFormation.titre); }}
                  style={{ width:"100%",background:"linear-gradient(135deg,#F7B500,#e6a800)",color:"#0A2540",border:"none",borderRadius:14,padding:"16px",fontWeight:900,fontSize:15,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}>
                  <FaArrowRight /> Demander cette formation
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal demande service ── */}
      {serviceModal && (
        <div className="modal-bg" onClick={() => setServiceModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ background:`linear-gradient(135deg,${SERVICES_INFO[serviceModal]?.color||"#3B82F6"},${SERVICES_INFO[serviceModal]?.color||"#3B82F6"}bb)`,padding:"28px 32px",position:"relative",overflow:"hidden",borderRadius:"24px 24px 0 0" }}>
              <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.05) 1px,transparent 1px)",backgroundSize:"28px 28px" }} />
              <div style={{ position:"relative",zIndex:2 }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ width:48,height:48,borderRadius:13,background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:"#fff" }}>{SERVICES_INFO[serviceModal]?.icon||"🛠️"}</div>
                    <div>
                      <div style={{ color:"rgba(255,255,255,.7)",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"1.5px" }}>Demander ce service</div>
                      <div style={{ color:"#fff",fontWeight:900,fontSize:20 }}>{SERVICES_INFO[serviceModal]?.label||serviceModal}</div>
                    </div>
                  </div>
                  <button onClick={() => setServiceModal(null)} style={{ background:"rgba(255,255,255,.15)",border:"none",borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",fontSize:16,fontWeight:700 }}>✕</button>
                </div>
                {SERVICES_INFO[serviceModal] && <>
                  <p style={{ color:"rgba(255,255,255,.8)",fontSize:13.5,lineHeight:1.75,marginBottom:14 }}>{SERVICES_INFO[serviceModal].desc}</p>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
                    {SERVICES_INFO[serviceModal].points.map((p: string) => (
                      <span key={p} style={{ background:"rgba(255,255,255,.18)",color:"#fff",borderRadius:99,padding:"4px 12px",fontSize:11.5,fontWeight:600 }}>✓ {p}</span>
                    ))}
                  </div>
                </>}
              </div>
            </div>
            <form onSubmit={envoyerDemande} style={{ padding:"28px 32px" }}>
              <div style={{ marginBottom:16 }}>
                <label className="lbl">Description de votre besoin *</label>
                <textarea className="inp" rows={4} placeholder="Décrivez votre projet, vos objectifs..." required value={demandeForm.description} onChange={e => setDemandeForm({ ...demandeForm, description: e.target.value })} />
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
                <div>
                  <label className="lbl">Délai souhaité</label>
                  <select className="inp" value={demandeForm.delai} onChange={e => setDemandeForm({ ...demandeForm, delai: e.target.value })}>
                    <option value="">Sélectionner...</option>
                    {["Urgent (< 2 semaines)","1 mois","2 à 3 mois","3 à 6 mois","Flexible"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Objectif principal</label>
                  <input className="inp" placeholder="Ex: Améliorer mes performances" value={demandeForm.objectif} onChange={e => setDemandeForm({ ...demandeForm, objectif: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label className="lbl">Téléphone</label>
                <input className="inp" type="tel" placeholder="+216 XX XXX XXX" value={demandeForm.telephone} onChange={e => setDemandeForm({ ...demandeForm, telephone: e.target.value })} />
              </div>
              <div style={{ background:"#F0F9FF",border:"1px solid #BAE6FD",borderRadius:12,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#0369A1" }}>
                📞 Notre équipe vous contactera sous <strong>24h</strong> pour confirmer votre besoin.
              </div>
              <div style={{ display:"flex",gap:12,justifyContent:"flex-end" }}>
                <button type="button" className="btn btn-outline" onClick={() => setServiceModal(null)}>Annuler</button>
                <button type="submit" className="btn btn-gold" disabled={sendingDemande} style={{ padding:"12px 28px",fontSize:14 }}>
                  {sendingDemande ? "⏳ Envoi..." : <><FaPaperPlane /> Envoyer ma demande</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header style={{ background:"#0A2540",height:62,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(10,37,64,.3)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:34,height:34,background:"#F7B500",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:"#0A2540" }}>BEH</div>
          <div>
            <div style={{ color:"#fff",fontWeight:700,fontSize:14 }}>Espace Startup</div>
            <div style={{ color:"rgba(255,255,255,.4)",fontSize:11 }}>{startup?.nom_startup || `${user?.prenom} ${user?.nom}`}</div>
          </div>
        </div>
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          {demandesEnAttente > 0 && <div style={{ background:"#F7B500",color:"#0A2540",borderRadius:99,padding:"4px 12px",fontSize:12,fontWeight:800 }}>🔔 {demandesEnAttente} en attente</div>}
          <button onClick={forceLogout} style={{ background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",color:"rgba(255,255,255,.7)",borderRadius:9,padding:"7px 16px",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:13 }}>Déconnexion</button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div style={{ background:"#fff",borderBottom:"1px solid #E8EEF6",position:"sticky",top:62,zIndex:90 }}>
        <div style={{ maxWidth:1300,margin:"0 auto",padding:"0 24px",display:"flex",gap:4,overflowX:"auto" }}>
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn${tab === t.id ? " on" : ""}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
              {t.id === "mes-demandes" && demandesEnAttente > 0 && (
                <span style={{ background:"#F7B500",color:"#0A2540",borderRadius:99,padding:"1px 6px",fontSize:10,fontWeight:800,marginLeft:2 }}>{demandesEnAttente}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenu principal ── */}
      <div style={{ maxWidth:1300,margin:"0 auto",padding:"32px 24px" }}>

        {/* ════ ACCUEIL ════ (inchangé) */}
        {tab === "accueil" && (
          <div>
            <section style={{ position:"relative",overflow:"hidden",minHeight:440 }}>
              <div style={{ position:"absolute",inset:0 }}>
                <Image src="/image.png" alt="" fill priority style={{ objectFit:"cover" }} sizes="100vw" />
                <div style={{ position:"absolute",inset:0,background:"linear-gradient(108deg,rgba(6,14,26,.95) 0%,rgba(10,30,60,.78) 44%,rgba(10,37,64,.18) 100%)" }} />
              </div>
              <div style={{ position:"relative",zIndex:10,maxWidth:1280,margin:"0 auto",padding:"80px 32px 90px" }}>
                <div style={{ display:"inline-flex",alignItems:"center",gap:8,marginBottom:20,background:"rgba(247,181,0,.1)",border:"1px solid rgba(247,181,0,.22)",borderRadius:99,padding:"5px 16px 5px 10px" }}>
                  <span style={{ width:7,height:7,borderRadius:"50%",background:"#F7B500",animation:"pulse 2s infinite",display:"inline-block" }} />
                  <span style={{ fontSize:11,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",color:"#F7B500" }}>Bienvenue, {user?.prenom} 👋</span>
                </div>
                <h1 style={{ fontSize:"clamp(28px,4vw,48px)",fontWeight:900,color:"#fff",marginBottom:16,lineHeight:1.1 }}>
                  Propulsez votre <span style={{ color:"#F7B500" }}>startup</span><br />vers l'excellence
                </h1>
                <p style={{ fontSize:15,color:"rgba(255,255,255,.72)",maxWidth:480,lineHeight:1.9,marginBottom:28 }}>
                  Accédez à nos experts, services exclusifs et ressources réservées aux membres BEH.
                </p>
                <div style={{ display:"flex",flexWrap:"wrap",gap:12 }}>
                  <button className="btn btn-gold" style={{ padding:"12px 24px",fontSize:14 }} onClick={() => setTab("services")}>Voir les services <FaArrowRight size={12} /></button>
                  <button className="btn btn-dark" style={{ padding:"12px 24px",fontSize:14,border:"2px solid rgba(255,255,255,.2)" }} onClick={() => setTab("experts")}>Nos experts <FaArrowRight size={12} /></button>
                </div>
              </div>
            </section>

            <section style={{ padding:"64px 28px",background:"#F8FAFC" }}>
              <div style={{ maxWidth:1200,margin:"0 auto" }}>
                <Reveal><div style={{ textAlign:"center",marginBottom:44 }}><h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:"clamp(28px,4vw,44px)",color:"#0A2540" }}>Notre <span style={{ fontStyle:"italic",color:"#F7B500" }}>ADN</span></h2></div></Reveal>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20 }}>
                  {ADN_ITEMS.map((card, i) => (
                    <Reveal key={i} delay={i * .1}>
                      <div className="adn-card" onClick={() => window.open(`/a-propos#${card.anchor}`, "_blank")}>
                        <div style={{ height:4,background:`linear-gradient(90deg,${card.color},${card.color}44)` }} />
                        <div style={{ padding:"22px 22px 20px" }}>
                          <div style={{ width:42,height:42,borderRadius:12,background:`${card.color}15`,border:`1.5px solid ${card.color}30`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,fontSize:18,color:card.color }}>
                            {i === 0 ? <FaBullseye /> : i === 1 ? <FaRocket /> : <FaStar />}
                          </div>
                          <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontWeight:700,color:"#0A2540",fontSize:20,marginBottom:8 }}>{card.title}</h3>
                          <p style={{ fontSize:13,color:"#64748B",lineHeight:1.82,marginBottom:12 }}>{card.body}</p>
                          <div style={{ display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,color:card.color }}>En savoir plus <FaArrowRight size={9} /></div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>

            <section style={{ padding:"64px 28px",background:"#fff" }}>
              <div style={{ maxWidth:1200,margin:"0 auto" }}>
                <Reveal>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:36,flexWrap:"wrap",gap:12 }}>
                    <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:"clamp(24px,3vw,38px)",color:"#0A2540" }}>Nos <span style={{ fontStyle:"italic",color:"#F7B500" }}>experts</span> certifiés</h2>
                    <button className="btn btn-dark" onClick={() => setTab("experts")} style={{ padding:"10px 20px" }}>Voir tous <FaArrowRight size={11} /></button>
                  </div>
                </Reveal>
                {pubExperts.length === 0 ? (
                  <div style={{ textAlign:"center",padding:"40px 0",color:"#94A3B8" }}>
                    <div style={{ width:38,height:38,border:"3px solid #F7B500",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 12px" }} />Chargement...
                  </div>
                ) : (
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18 }}>
                    {pubExperts.map((ex, i) => (
                      <Reveal key={ex.id} delay={i * .07}>
                        <div className="expert-card" style={{ borderRadius:16,overflow:"hidden",display:"flex",flexDirection:"column" }}>
                          <div style={{ height:3,background:ex.disponible?"linear-gradient(90deg,#0A2540,#F7B500)":"#E2E8F0" }} />
                          <div style={{ height:150,background:"linear-gradient(135deg,#0A2540,#1a3f6f)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden" }}>
                            {ex.photo ? <img src={`${BASE}/uploads/photos/${ex.photo}`} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} /> : <div style={{ width:60,height:60,borderRadius:"50%",background:"rgba(247,181,0,.2)",border:"3px solid #F7B500",display:"flex",alignItems:"center",justifyContent:"center",color:"#F7B500",fontWeight:800,fontSize:22 }}>{ex.user?.prenom?.[0]}{ex.user?.nom?.[0]}</div>}
                          </div>
                          <div style={{ padding:"13px 14px",flex:1,display:"flex",flexDirection:"column" }}>
                            <div style={{ fontWeight:700,fontSize:14,color:"#0A2540",marginBottom:4 }}>{ex.user?.prenom} {ex.user?.nom}</div>
                            <div style={{ fontSize:11,fontWeight:700,color:"#92400E",background:"#FEF3C7",borderRadius:5,padding:"2px 7px",display:"inline-block",marginBottom:10 }}>{ex.domaine||"Expert"}</div>
                            <div style={{ display:"flex",gap:6,marginTop:"auto" }}>
                              <button className="btn btn-dark" style={{ flex:1,justifyContent:"center",fontSize:11,padding:"7px" }} onClick={() => { setSelectedExpert(ex); setTab("messages"); loadConversation(ex.user_id||ex.user?.id); }}>💬</button>
                              <button className="btn btn-gold" style={{ flex:1,justifyContent:"center",fontSize:11,padding:"7px" }} onClick={() => { setRdvForm({ ...rdvForm, expert_id: String(ex.id) }); setTab("rdv"); }}>📅</button>
                            </div>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {pubTemos.length > 0 && (
              <section style={{ padding:"64px 28px",background:"#F8FAFC" }}>
                <div style={{ maxWidth:780,margin:"0 auto" }}>
                  <Reveal><div style={{ textAlign:"center",marginBottom:36 }}><h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontWeight:700,fontSize:"clamp(24px,4vw,38px)",color:"#0A2540" }}>Ce que disent nos <span style={{ fontStyle:"italic",color:"#F7B500" }}>clients</span></h2></div></Reveal>
                  {curTemo && <>
                    <div style={{ background:"#0A2540",borderRadius:22,padding:"36px 44px",position:"relative",border:"1px solid rgba(247,181,0,.18)",opacity:tAnim?0:1,transform:tAnim?"scale(.97)":"scale(1)",transition:"all .3s" }}>
                      <FaQuoteLeft style={{ position:"absolute",top:22,left:28,fontSize:32,color:"rgba(247,181,0,.15)" }} />
                      <div style={{ display:"flex",justifyContent:"center",marginBottom:16 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color:s<=(curTemo.note||5)?"#F7B500":"#334155",fontSize:20 }}>★</span>)}</div>
                      <p style={{ fontStyle:"italic",color:"#fff",lineHeight:1.8,textAlign:"center",marginBottom:24,fontSize:"clamp(15px,2vw,19px)",fontWeight:500 }}>&ldquo;{curTemo.texte}&rdquo;</p>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#F7B500,#e6a800)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:15,color:"#0A2540",margin:"0 auto 10px" }}>{curTemo.user?.prenom?.[0]}{curTemo.user?.nom?.[0]}</div>
                        <div style={{ color:"#fff",fontWeight:700,fontSize:15 }}>{curTemo.user?.prenom} {curTemo.user?.nom}</div>
                        <div style={{ color:"#F7B500",fontSize:11,fontWeight:600,letterSpacing:1,textTransform:"uppercase",marginTop:4 }}>{curTemo.startup?.nom_startup||"Startup BEH"}</div>
                      </div>
                    </div>
                    {pubTemos.length > 1 && (
                      <div style={{ display:"flex",justifyContent:"center",alignItems:"center",gap:12,marginTop:20 }}>
                        <button onClick={() => goT((tIdx-1+pubTemos.length)%pubTemos.length)} style={{ width:36,height:36,background:"#0A2540",color:"#fff",borderRadius:"50%",border:"1px solid rgba(247,181,0,.3)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background="#F7B500"} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="#0A2540"}><FaChevronLeft size={12} /></button>
                        <div style={{ display:"flex",gap:6 }}>{pubTemos.map((_, i) => <button key={i} onClick={() => goT(i)} style={{ height:6,width:i===tIdx?22:6,borderRadius:99,border:"none",cursor:"pointer",background:i===tIdx?"#F7B500":"rgba(10,37,64,.2)",transition:"all .3s" }} />)}</div>
                        <button onClick={() => goT((tIdx+1)%pubTemos.length)} style={{ width:36,height:36,background:"#0A2540",color:"#fff",borderRadius:"50%",border:"1px solid rgba(247,181,0,.3)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background="#F7B500"} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="#0A2540"}><FaChevronRight size={12} /></button>
                      </div>
                    )}
                  </>}
                </div>
              </section>
            )}

            <section style={{ padding:"56px 28px",background:"linear-gradient(135deg,#0A2540,#0f3460)" }}>
              <div style={{ maxWidth:600,margin:"0 auto",textAlign:"center" }}>
                <Reveal>
                  <h2 style={{ fontWeight:900,color:"#fff",fontSize:"clamp(22px,4vw,36px)",marginBottom:12 }}>Prêt à accélérer ?</h2>
                  <p style={{ color:"rgba(255,255,255,.65)",fontSize:14,lineHeight:1.85,marginBottom:28 }}>Explorez nos services et trouvez l'accompagnement parfait pour votre startup.</p>
                  <div style={{ display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap" }}>
                    <button className="btn btn-gold" style={{ padding:"13px 28px",fontSize:14 }} onClick={() => setTab("services")}>Voir les services <FaArrowRight size={12} /></button>
                    <button className="btn" style={{ padding:"13px 28px",fontSize:14,background:"rgba(255,255,255,.1)",border:"2px solid rgba(255,255,255,.25)",color:"#fff" }} onClick={() => setTab("experts")}>Nos experts <FaArrowRight size={12} /></button>
                  </div>
                </Reveal>
              </div>
            </section>
          </div>
        )}

        {/* ════ SERVICES ════ (inchangé) */}
        {tab === "services" && (
          <div>
            <div style={{ background:"#fff",borderRadius:16,border:"1px solid #E8EEF6",padding:"14px 20px",marginBottom:24,display:"flex",gap:8,overflowX:"auto",flexWrap:"wrap" }}>
              {[
                { id:"catalogue",    label:"📦 Catalogue Services",   badge:"" },
                { id:"formations",   label:"🎓 Formations",            badge:formations.length>0?String(formations.length):"" },
                { id:"podcasts",     label:"🎙️ Podcasts",              badge:podcasts.length>0?String(podcasts.length):"" },
                { id:"plateformes",  label:"💻 Nos Plateformes",       badge:"" },
                { id:"personnalise", label:"✍️ Demande personnalisée",  badge:"" },
              ].map(st => (
                <button key={st.id} className={`sub-tab${serviceTab === st.id ? " on" : ""}`} onClick={() => setServiceTab(st.id as any)}>
                  {st.label}
                  {st.badge && <span style={{ background:serviceTab===st.id?"rgba(10,37,64,.2)":"#F7B500",color:"#0A2540",borderRadius:99,padding:"1px 7px",fontSize:10,fontWeight:800,marginLeft:5 }}>{st.badge}</span>}
                </button>
              ))}
            </div>

            {serviceTab === "catalogue" && (
              <div>
                <div style={{ background:"linear-gradient(135deg,#0A2540,#0f3460)",borderRadius:18,padding:"28px 32px",marginBottom:22,position:"relative",overflow:"hidden" }}>
                  <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(rgba(255,255,255,.022) 1px,transparent 1px)",backgroundSize:"32px 32px" }} />
                  <div style={{ position:"relative",zIndex:2 }}>
                    <span style={{ background:"rgba(247,181,0,.15)",border:"1px solid rgba(247,181,0,.3)",color:"#F7B500",fontWeight:700,fontSize:11,letterSpacing:"2px",textTransform:"uppercase",padding:"4px 14px",borderRadius:99,display:"inline-block",marginBottom:14 }}>Nos Services</span>
                    <h2 style={{ color:"#fff",fontWeight:900,fontSize:24,marginBottom:8 }}>Choisissez votre <span style={{ color:"#F7B500" }}>service</span></h2>
                    <p style={{ color:"rgba(255,255,255,.65)",fontSize:14,lineHeight:1.8,maxWidth:560 }}>En tant que membre, demandez n'importe quel service. Notre équipe vous répond sous 24h.</p>
                  </div>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:20,marginBottom:22 }}>
                  {Object.entries(SERVICES_INFO).map(([slug, svc]) => (
                    <div key={slug} className="svc-card" onClick={() => openService(slug)}>
                      <div style={{ height:4,background:`linear-gradient(90deg,${svc.color},${svc.color}44)` }} />
                      <div style={{ padding:"22px 22px 18px" }}>
                        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14 }}>
                          <div style={{ width:52,height:52,borderRadius:13,background:`${svc.color}15`,border:`1.5px solid ${svc.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:svc.color }}>{svc.icon}</div>
                          <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                            <span style={{ background:`${svc.color}15`,color:svc.color,borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700 }}>{svc.badge}</span>
                            <a href={`/services/${slug}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ width:30,height:30,borderRadius:"50%",background:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748B",textDecoration:"none",transition:"all .2s" }} onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background="#F7B500"; (e.currentTarget as HTMLAnchorElement).style.color="#0A2540"; }} onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background="#F1F5F9"; (e.currentTarget as HTMLAnchorElement).style.color="#64748B"; }}>
                              <FaExternalLinkAlt size={11} />
                            </a>
                          </div>
                        </div>
                        <h3 style={{ fontWeight:800,color:"#0A2540",fontSize:17,marginBottom:7 }}>{svc.label}</h3>
                        <p style={{ color:"#64748B",fontSize:13,lineHeight:1.75,marginBottom:14 }}>{svc.desc}</p>
                        <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:16 }}>
                          {svc.points.map((p: string) => <span key={p} style={{ background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:99,padding:"2px 9px",fontSize:11,color:"#475569",fontWeight:600 }}>✓ {p}</span>)}
                        </div>
                        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                          <span style={{ fontSize:11.5,color:"#8A9AB5",fontWeight:600 }}>⏱ {svc.duree}</span>
                          <button className="btn btn-gold" style={{ padding:"9px 18px",fontSize:12.5 }} onClick={e => { e.stopPropagation(); openService(slug); }}><FaPaperPlane size={11} /> Demander</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {serviceTab === "formations" && (
              <div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:12 }}>
                  <div><h2 style={{ fontWeight:800,fontSize:20,color:"#0A2540",marginBottom:4 }}>🎓 Formations disponibles</h2><p style={{ fontSize:13,color:"#64748B" }}>{filteredFormations.length} formation{filteredFormations.length!==1?"s":""}</p></div>
                  <button className="btn btn-gold" onClick={() => openService("formations")} style={{ padding:"10px 20px",fontSize:13 }}><FaPaperPlane size={11} /> Formation personnalisée</button>
                </div>
                <div style={{ background:"#F8FAFC",border:"1px solid #E8EEF6",borderRadius:14,padding:"16px 18px",marginBottom:20 }}>
                  <div style={{ position:"relative",marginBottom:12 }}>
                    <FaSearch style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#94A3B8",fontSize:13 }} />
                    <input className="inp" placeholder="Rechercher une formation..." style={{ paddingLeft:36 }} value={formSearch} onChange={e => setFormSearch(e.target.value)} />
                  </div>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
                    {domainesDisponibles.map(d => <button key={d} className={`pill${domaineFilter===d?" active":""}`} onClick={() => setDomaineFilter(d)}>{d}</button>)}
                  </div>
                </div>
                {formationsLoading ? (
                  <div style={{ textAlign:"center",padding:"60px 0" }}><div style={{ width:40,height:40,border:"3px solid #F7B500",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 12px" }} /><div style={{ color:"#64748B",fontSize:14 }}>Chargement...</div></div>
                ) : filteredFormations.length === 0 ? (
                  <div style={{ textAlign:"center",padding:"60px 0" }}><div style={{ fontSize:48,marginBottom:14 }}>🎓</div><div style={{ fontWeight:700,fontSize:17,color:"#0A2540",marginBottom:8 }}>Aucune formation trouvée</div><button className="btn btn-gold" onClick={() => openService("formations")}><FaPaperPlane size={11} /> Demande personnalisée</button></div>
                ) : domaineFilter === "Tous" ? (
                  Object.entries(formsByDomaine).map(([domaine, fList]) => (
                    <div key={domaine} style={{ marginBottom:36 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16,borderBottom:"2px solid #F1F5F9",paddingBottom:10 }}>
                        <div style={{ width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#F7B500,#e6a800)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#0A2540" }}><FaGraduationCap /></div>
                        <h3 style={{ fontWeight:800,fontSize:17,color:"#0A2540",margin:0 }}>{domaine}</h3>
                        <span style={{ background:"#E8EEF6",borderRadius:99,padding:"2px 8px",fontSize:11,color:"#64748B" }}>{fList.length}</span>
                      </div>
                      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18 }}>
                        {fList.map(f => <FormationCard key={f.id} f={f} onSelect={setSelectedFormation} demanderFormation={demanderFormation} demandeExiste={demandeExistePourFormation(f.id)} />)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18 }}>
                    {filteredFormations.map(f => <FormationCard key={f.id} f={f} onSelect={setSelectedFormation} demanderFormation={demanderFormation} demandeExiste={demandeExistePourFormation(f.id)} />)}
                  </div>
                )}
              </div>
            )}

            {serviceTab === "podcasts" && (
              <div>
                <h2 style={{ fontWeight:800,fontSize:20,color:"#0A2540",marginBottom:4 }}>🎙️ Podcasts exclusifs</h2>
                <p style={{ fontSize:13,color:"#64748B",marginBottom:20 }}>{podcasts.length} podcast{podcasts.length!==1?"s":""} disponibles</p>
                {podcasts.length === 0 ? (
                  <div style={{ textAlign:"center",padding:"60px 0" }}><div style={{ fontSize:48,marginBottom:14 }}>🎙️</div><div style={{ fontWeight:700,fontSize:17,color:"#0A2540" }}>Aucun podcast disponible</div></div>
                ) : (
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:18 }}>
                    {podcasts.map(p => (
                      <div key={p.id} className="pod-card">
                        <div style={{ display:"flex",gap:0 }}>
                          <div style={{ width:140,flexShrink:0,background:"linear-gradient(135deg,#2d1b5e,#4c1d95)",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",minHeight:140 }}>
                            {p.image && <img src={`${BASE}/uploads/formations/${p.image}`} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",opacity:.65,position:"absolute",inset:0 }} />}
                            <div style={{ position:"relative",zIndex:2,width:50,height:50,borderRadius:"50%",background:"rgba(139,92,246,.3)",border:"2px solid rgba(139,92,246,.5)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                              <FaMicrophone style={{ color:"#C4B5FD",fontSize:20 }} />
                            </div>
                          </div>
                          <div style={{ flex:1,padding:"16px 16px 14px" }}>
                            <div style={{ display:"flex",gap:6,marginBottom:8,flexWrap:"wrap" }}>
                              <span style={{ background:"#F3F0FF",color:"#7C3AED",borderRadius:99,padding:"3px 9px",fontSize:10.5,fontWeight:700 }}>🎙️ Podcast</span>
                              {p.domaine && <span style={{ background:"#F8FAFC",color:"#64748B",borderRadius:99,padding:"3px 9px",fontSize:10.5,fontWeight:600 }}>{p.domaine}</span>}
                            </div>
                            <h3 style={{ fontWeight:800,color:"#0A2540",fontSize:14.5,lineHeight:1.3,marginBottom:7 }}>{p.titre}</h3>
                            {p.description && <p style={{ fontSize:12,color:"#64748B",lineHeight:1.65,marginBottom:12 }}>{p.description}</p>}
                            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap" }}>
                              <div style={{ display:"flex",gap:8,fontSize:11.5,color:"#8A9AB5" }}>
                                {p.formateur && <span><FaUsers style={{ fontSize:10,marginRight:3 }} />{p.formateur}</span>}
                                {p.duree && <span><FaClock style={{ fontSize:10,marginRight:3 }} />{p.duree}</span>}
                              </div>
                              <button className="btn btn-purple" style={{ fontSize:11.5,padding:"7px 14px" }} onClick={() => openService("formations")}><FaPlay style={{ fontSize:10 }} /> Accéder</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {serviceTab === "plateformes" && (
              <div>
                <h2 style={{ fontWeight:800,fontSize:20,color:"#0A2540",marginBottom:4 }}>💻 Nos Plateformes Digitales</h2>
                <p style={{ fontSize:13,color:"#64748B",marginBottom:20 }}>Solutions ERP, CRM et gestion de projets sur mesure</p>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginBottom:24 }}>
                  {[
                    { slug:"erp",    title:"ERP & Ressources",    icon:"📊",color:"#F7B500",desc:"Centralisez ventes, stock, RH et comptabilité.",features:["Dashboard temps réel","Gestion stocks","Module RH","Facturation auto"] },
                    { slug:"crm",    title:"CRM & Relation Client",icon:"👥",color:"#3B82F6",desc:"Archivez clients, suivez objectifs, fidélisez.",features:["Suivi clients complet","Objectifs commerciaux","KPI en direct","Relance automatique"] },
                    { slug:"projets",title:"Gestion de Projets",   icon:"🗂️",color:"#10B981",desc:"Kanban, Gantt et analyses de performance.",features:["Tableau Kanban","Planning Gantt","Rapports équipes","Reporting auto"] },
                  ].map(pl => (
                    <div key={pl.slug} style={{ background:"#fff",border:`1.5px solid ${pl.color}30`,borderRadius:18,overflow:"hidden",transition:"all .3s" }} onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform="translateY(-6px)"; (e.currentTarget as HTMLDivElement).style.boxShadow=`0 20px 48px ${pl.color}20`; }} onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform="translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow="none"; }}>
                      <div style={{ height:5,background:`linear-gradient(90deg,${pl.color},${pl.color}66)` }} />
                      <div style={{ padding:"20px 20px 18px" }}>
                        <div style={{ width:48,height:48,borderRadius:13,background:`${pl.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:12 }}>{pl.icon}</div>
                        <h3 style={{ fontWeight:800,color:"#0A2540",fontSize:16,marginBottom:7 }}>{pl.title}</h3>
                        <p style={{ fontSize:13,color:"#64748B",lineHeight:1.7,marginBottom:14 }}>{pl.desc}</p>
                        <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:16 }}>
                          {pl.features.map(f => <div key={f} style={{ display:"flex",alignItems:"center",gap:7,fontSize:12.5,color:"#475569" }}><FaCheckCircle style={{ color:pl.color,fontSize:11,flexShrink:0 }} />{f}</div>)}
                        </div>
                        <div style={{ display:"flex",gap:8 }}>
                          <button className="btn btn-gold" style={{ flex:1,justifyContent:"center",fontSize:12.5,padding:"9px" }} onClick={() => openService("nos-plateformes")}>Démo gratuite</button>
                          <button className="btn btn-outline" style={{ flex:1,justifyContent:"center",fontSize:12.5,padding:"9px" }} onClick={() => openService("nos-plateformes")}>Essai 7j</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {serviceTab === "personnalise" && (
              <div style={{ maxWidth:720,margin:"0 auto" }}>
                <div style={{ textAlign:"center",marginBottom:28 }}>
                  <div style={{ fontSize:48,marginBottom:14 }}>✍️</div>
                  <h2 style={{ fontWeight:800,fontSize:22,color:"#0A2540",marginBottom:8 }}>Demande personnalisée</h2>
                  <p style={{ fontSize:14,color:"#64748B",lineHeight:1.8,maxWidth:520,margin:"0 auto" }}>Vous avez un besoin spécifique ? Décrivez-le et notre équipe vous proposera une solution sur mesure.</p>
                </div>
                <div className="card">
                  <div style={{ padding:"18px 24px",borderBottom:"1px solid #F1F5F9",background:"#FAFBFE" }}>
                    <div style={{ fontWeight:700,fontSize:16,color:"#0A2540" }}>📋 Formulaire de demande personnalisée</div>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); setDemandeForm({ ...demandeForm, service:"personnalise" }); setServiceModal("personnalise"); }} style={{ padding:"24px" }}>
                    <div style={{ marginBottom:16 }}>
                      <label className="lbl">Type de service souhaité</label>
                      <select className="inp" value={demandeForm.service||""} onChange={e => setDemandeForm({ ...demandeForm, service: e.target.value })}>
                        <option value="">Sélectionner...</option>
                        {["Formation sur mesure","Développement d'application","Audit spécialisé","Consulting avancé","Coaching dirigeant","Autre service"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom:16 }}>
                      <label className="lbl">Décrivez votre besoin *</label>
                      <textarea className="inp" rows={5} placeholder="Expliquez votre contexte, vos contraintes..." required value={demandeForm.description} onChange={e => setDemandeForm({ ...demandeForm, description: e.target.value })} />
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
                      <div>
                        <label className="lbl">Délai souhaité</label>
                        <select className="inp" value={demandeForm.delai} onChange={e => setDemandeForm({ ...demandeForm, delai: e.target.value })}>
                          <option value="">Sélectionner...</option>
                          {["Urgent (< 2 semaines)","1 mois","2 à 3 mois","3 à 6 mois","Flexible"].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="lbl">Objectif principal</label>
                        <input className="inp" placeholder="Ex: Digitaliser mon entreprise" value={demandeForm.objectif} onChange={e => setDemandeForm({ ...demandeForm, objectif: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ marginBottom:16 }}>
                      <label className="lbl">Téléphone</label>
                      <input className="inp" type="tel" placeholder="+216 XX XXX XXX" value={demandeForm.telephone} onChange={e => setDemandeForm({ ...demandeForm, telephone: e.target.value })} />
                    </div>
                    <div style={{ background:"#F0F9FF",border:"1px solid #BAE6FD",borderRadius:12,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#0369A1" }}>
                      📞 Notre équipe vous contactera sous <strong>24h</strong>.
                    </div>
                    <button type="submit" className="btn btn-gold" style={{ width:"100%",justifyContent:"center",padding:"14px",fontSize:15 }}><FaPaperPlane /> Envoyer ma demande personnalisée</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ MES DEMANDES (avec expert assigné et boutons de contact) ════ */}
        {tab === "mes-demandes" && (
          <div style={{ maxWidth:1000,margin:"0 auto" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12 }}>
              <div>
                <h2 style={{ fontWeight:800,fontSize:22,color:"#0A2540" }}>📋 Mes demandes de service</h2>
                <div style={{ fontSize:13,color:"#8A9AB5",marginTop:3 }}>{demandes.length} demande{demandes.length>1?"s":""}</div>
              </div>
              <button className="btn btn-gold" onClick={() => { setTab("services"); setServiceTab("catalogue"); }} style={{ padding:"11px 20px" }}><FaPaperPlane /> Nouvelle demande</button>
            </div>
            {demandes.length === 0 ? (
              <div style={{ background:"#fff",border:"1px solid #E8EEF6",borderRadius:18,padding:"80px 0",textAlign:"center" }}>
                <div style={{ fontSize:52,marginBottom:16 }}>📋</div>
                <div style={{ fontWeight:700,fontSize:18,color:"#0A2540",marginBottom:8 }}>Aucune demande</div>
                <div style={{ color:"#8A9AB5",fontSize:14,marginBottom:24 }}>Explorez nos services et faites votre première demande</div>
                <button className="btn btn-gold" onClick={() => setTab("services")} style={{ padding:"12px 24px",fontSize:14 }}><FaRocket /> Voir les services</button>
              </div>
            ) : demandes.map(d => (
              <div key={d.id} style={{ background:"#fff",border:`1.5px solid ${d.statut==="en_attente"?"#FDE68A":d.statut==="valide"||d.statut==="acceptee"||d.statut==="terminee"?"#A7F3D0":"#E8EEF6"}`,borderRadius:16,padding:"20px 24px",marginBottom:14 }}>
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                      <div style={{ width:42,height:42,borderRadius:12,background:`${SERVICES_INFO[d.service]?.color||"#3B82F6"}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:SERVICES_INFO[d.service]?.color||"#3B82F6",flexShrink:0 }}>{SERVICES_INFO[d.service]?.icon||"🛠️"}</div>
                      <div>
                        <div style={{ fontWeight:700,fontSize:15,color:"#0A2540" }}>{SERVICES_INFO[d.service]?.label||d.service||"Service personnalisé"}</div>
                        <div style={{ fontSize:12,color:"#8A9AB5" }}>{new Date(d.createdAt).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}</div>
                      </div>
                    </div>
                    {d.description && <p style={{ fontSize:13.5,color:"#475569",lineHeight:1.75,marginBottom:12,background:"#F8FAFC",borderRadius:10,padding:"10px 14px" }}>{d.description}</p>}
                    <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                      {d.delai     && <span style={{ background:"#F0FDF4",color:"#16a34a",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600 }}>⏱ {d.delai}</span>}
                      {d.telephone && <span style={{ background:"#FFF8E1",color:"#B45309",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600 }}>📞 {d.telephone}</span>}
                      {d.objectif  && <span style={{ background:"#F3F4F6",color:"#374151",borderRadius:99,padding:"3px 10px",fontSize:12,fontWeight:600 }}>🎯 {d.objectif}</span>}
                    </div>
                    {/* Affichage de l'expert assigné */}
                    {d.expert_assigne && (
                      <div style={{ marginTop:14, background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                          <div style={{ width:36,height:36,borderRadius:"50%",overflow:"hidden",background:"#0A2540",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #F7B500" }}>
                            {d.expert_assigne.photo ? <img src={`${BASE}/uploads/photos/${d.expert_assigne.photo}`} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" /> : <span style={{ color:"#F7B500",fontWeight:800 }}>{d.expert_assigne.user?.prenom?.[0]}{d.expert_assigne.user?.nom?.[0]}</span>}
                          </div>
                          <div>
                            <div style={{ fontWeight:700,fontSize:13,color:"#0A2540" }}>Expert assigné : {d.expert_assigne.user?.prenom} {d.expert_assigne.user?.nom}</div>
                            <div style={{ fontSize:11,color:"#64748B" }}>{d.expert_assigne.domaine||"Expert"}</div>
                          </div>
                        </div>
                        <div style={{ display:"flex",gap:8 }}>
                          <button className="btn btn-dark" style={{ fontSize:12,padding:"6px 12px" }} onClick={() => { setSelectedExpert(d.expert_assigne); setTab("messages"); loadConversation(d.expert_assigne.user_id||d.expert_assigne.user?.id); }}><FaComments /> Contacter</button>
                          <button className="btn btn-gold" style={{ fontSize:12,padding:"6px 12px" }} onClick={() => { setRdvForm({ ...rdvForm, expert_id: String(d.expert_assigne.id) }); setTab("rdv"); }}><FaCalendar /> Prendre RDV</button>
                        </div>
                      </div>
                    )}
                    {d.commentaire_admin && (
                      <div style={{ marginTop:14,background:d.statut==="valide"||d.statut==="acceptee"?"#ECFDF5":"#FEF2F2",border:`1px solid ${d.statut==="valide"||d.statut==="acceptee"?"#A7F3D0":"#FECACA"}`,borderRadius:10,padding:"12px 16px" }}>
                        <div style={{ fontSize:11,fontWeight:700,color:d.statut==="valide"||d.statut==="acceptee"?"#059669":"#DC2626",textTransform:"uppercase",marginBottom:5 }}>📩 Réponse BEH</div>
                        <div style={{ fontSize:13.5,color:"#334155",lineHeight:1.7 }}>{d.commentaire_admin}</div>
                      </div>
                    )}
                  </div>
                  <span style={{ background:`${S_COLOR[d.statut]||"#6B7280"}18`,color:S_COLOR[d.statut]||"#6B7280",border:`1px solid ${S_COLOR[d.statut]||"#E2E8F0"}50`,borderRadius:99,padding:"6px 16px",fontSize:12.5,fontWeight:700,whiteSpace:"nowrap",flexShrink:0 }}>
                    {S_LABEL[d.statut]||d.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════ PROFIL ════ */}
        {tab === "profil" && (
          <div style={{ maxWidth:720,margin:"0 auto" }}>
            <div className="card" style={{ padding:"24px",marginBottom:20,display:"flex",alignItems:"center",gap:20 }}>
              <div style={{ position:"relative",flexShrink:0 }}>
                <div style={{ width:80,height:80,borderRadius:"50%",overflow:"hidden",background:"#0A2540",display:"flex",alignItems:"center",justifyContent:"center",border:"3px solid #F7B500" }}>
                  {photoPreview ? <img src={photoPreview} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" />
                    : photoUrl ? <img src={photoUrl} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" onError={e => (e.currentTarget.style.display="none")} />
                    : <span style={{ color:"#F7B500",fontWeight:900,fontSize:26 }}>{initials}</span>}
                </div>
                <label style={{ position:"absolute",bottom:-2,right:-2,width:26,height:26,background:"#F7B500",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:"2px solid #fff" }}>
                  <FaCamera style={{ fontSize:11,color:"#0A2540" }} />
                  <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
                </label>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800,fontSize:18,color:"#0A2540" }}>{user?.prenom} {user?.nom}</div>
                <div style={{ fontSize:13,color:"#8A9AB5",marginTop:3 }}>{startup?.nom_startup||"Startup"} · {user?.email}</div>
                {photoFile && <button className="btn btn-gold" style={{ fontSize:12,padding:"7px 14px",marginTop:10 }} onClick={uploadPhoto}><FaCheck /> Sauvegarder la photo</button>}
              </div>
            </div>
            <div className="card">
              <div style={{ padding:"18px 24px",borderBottom:"1px solid #F1F5F9",background:"#FAFBFE" }}>
                <div style={{ fontWeight:700,fontSize:16,color:"#0A2540" }}>Informations de la startup</div>
              </div>
              <div style={{ padding:"24px" }}>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
                  <div><label className="lbl">Nom de la startup</label><input className="inp" value={editProfil.nom_startup||""} onChange={e => setEditProfil({ ...editProfil, nom_startup: e.target.value })} placeholder="Ex: TechVision" /></div>
                  <div><label className="lbl">Secteur</label><input className="inp" value={editProfil.secteur||""} onChange={e => setEditProfil({ ...editProfil, secteur: e.target.value })} placeholder="Ex: Fintech" /></div>
                  <div><label className="lbl">Fonction</label><input className="inp" value={editProfil.fonction||""} onChange={e => setEditProfil({ ...editProfil, fonction: e.target.value })} placeholder="Ex: CEO" /></div>
                  <div>
                    <label className="lbl">Taille équipe</label>
                    <select className="inp" value={editProfil.taille||""} onChange={e => setEditProfil({ ...editProfil, taille: e.target.value })}>
                      <option value="">Sélectionner</option>
                      {["1-5","6-15","16-50","51-100","100+"].map(t => <option key={t} value={t}>{t} personnes</option>)}
                    </select>
                  </div>
                  <div><label className="lbl">Site web</label><input className="inp" value={editProfil.site_web||""} onChange={e => setEditProfil({ ...editProfil, site_web: e.target.value })} placeholder="https://..." /></div>
                  <div><label className="lbl">Localisation</label><input className="inp" value={editProfil.localisation||""} onChange={e => setEditProfil({ ...editProfil, localisation: e.target.value })} placeholder="Ex: Tunis" /></div>
                </div>
                <div style={{ marginBottom:20 }}>
                  <label className="lbl">Description</label>
                  <textarea className="inp" rows={4} value={editProfil.description||""} onChange={e => setEditProfil({ ...editProfil, description: e.target.value })} placeholder="Décrivez votre startup..." />
                </div>
                <button className="btn btn-gold" style={{ padding:"12px 28px" }} onClick={saveProfil}><FaCheck /> Sauvegarder</button>
              </div>
            </div>
          </div>
        )}

        {/* ════ EXPERTS ════ */}
        {tab === "experts" && (
          <div>
            <div style={{ display:"flex",gap:12,marginBottom:20,alignItems:"center" }}>
              <div style={{ position:"relative",flex:1 }}>
                <FaSearch style={{ position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:"#B8C4D6",fontSize:13 }} />
                <input className="inp" placeholder="Rechercher par nom ou domaine..." style={{ paddingLeft:38 }} value={expertFilter} onChange={e => setExpertFilter(e.target.value)} />
              </div>
              <div style={{ color:"#8A9AB5",fontSize:13,fontWeight:600,whiteSpace:"nowrap" }}>{filteredExperts.length} expert{filteredExperts.length>1?"s":""}</div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18 }}>
              {filteredExperts.map(e => (
                <div key={e.id} className="expert-card" style={{ borderRadius:18,overflow:"hidden",display:"flex",flexDirection:"column" }}>
                  <div style={{ height:4,background:"linear-gradient(90deg,#0A2540,#F7B500)" }} />
                  <div style={{ position:"relative",height:155,background:"linear-gradient(135deg,#0A2540,#1a3f6f)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden" }}>
                    {e.photo ? <img src={`${BASE}/uploads/photos/${e.photo}`} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} onError={ev => (ev.currentTarget.style.display="none")} />
                      : <div style={{ width:60,height:60,borderRadius:"50%",background:"rgba(247,181,0,.2)",border:"3px solid #F7B500",display:"flex",alignItems:"center",justifyContent:"center",color:"#F7B500",fontWeight:800,fontSize:22 }}>{e.user?.prenom?.[0]}{e.user?.nom?.[0]}</div>}
                  </div>
                  <div style={{ padding:"14px 16px",flex:1,display:"flex",flexDirection:"column" }}>
                    <div style={{ fontWeight:700,fontSize:14.5,color:"#0A2540",marginBottom:4 }}>{e.user?.prenom} {e.user?.nom}</div>
                    <div style={{ fontSize:11,fontWeight:700,color:"#92400E",background:"#FEF3C7",borderRadius:6,padding:"2px 8px",display:"inline-block",marginBottom:10 }}>{e.domaine||"Expert"}</div>
                    {e.description && <p style={{ fontSize:12,color:"#64748B",lineHeight:1.7,marginBottom:10,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{e.description}</p>}
                    <div style={{ marginBottom:8,display:"flex",justifyContent:"flex-end" }}>
                      <span style={{ fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:99,background:e.disponible?"#ECFDF5":"#F9FAFB",color:e.disponible?"#059669":"#9CA3AF" }}>{e.disponible?"● Disponible":"● Occupé"}</span>
                    </div>
                    <div style={{ display:"flex",gap:7,marginTop:"auto" }}>
                      <button className="btn btn-dark" style={{ flex:1,justifyContent:"center",fontSize:12,padding:"8px" }} onClick={() => { setSelectedExpert(e); setTab("messages"); loadConversation(e.user_id||e.user?.id); }}><FaComments /> Message</button>
                      <button className="btn btn-gold" style={{ flex:1,justifyContent:"center",fontSize:12,padding:"8px" }} onClick={() => { setRdvForm({ ...rdvForm, expert_id: String(e.id) }); setTab("rdv"); }}><FaCalendar /> RDV</button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredExperts.length === 0 && <div style={{ gridColumn:"1/-1",textAlign:"center",padding:"60px 0",color:"#94A3B8" }}>Aucun expert trouvé</div>}
            </div>
          </div>
        )}

        {/* ════ RDV ════ */}
        {tab === "rdv" && (
          <div style={{ display:"grid",gridTemplateColumns:"360px 1fr",gap:20 }}>
            <div className="card">
              <div style={{ padding:"18px 24px",borderBottom:"1px solid #F1F5F9",background:"#FAFBFE" }}>
                <div style={{ fontWeight:700,fontSize:16,color:"#0A2540" }}>📅 Prendre un RDV</div>
              </div>
              <div style={{ padding:"24px" }}>
                <div style={{ marginBottom:14 }}>
                  <label className="lbl">Expert *</label>
                  <select className="inp" value={rdvForm.expert_id} onChange={e => setRdvForm({ ...rdvForm, expert_id: e.target.value })}>
                    <option value="">Sélectionner...</option>
                    {experts.map(e => <option key={e.id} value={e.id}>{e.user?.prenom} {e.user?.nom} — {e.domaine||"Expert"}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom:20 }}>
                  <label className="lbl">Date & heure *</label>
                  <input className="inp" type="datetime-local" value={rdvForm.date_rdv} onChange={e => setRdvForm({ ...rdvForm, date_rdv: e.target.value })} min={new Date().toISOString().slice(0, 16)} />
                </div>
                <button className="btn btn-gold" style={{ width:"100%",justifyContent:"center",padding:"13px" }} onClick={prendreRdv}><FaCalendar /> Confirmer le RDV</button>
              </div>
            </div>
            <div className="card">
              <div style={{ padding:"18px 24px",borderBottom:"1px solid #F1F5F9",background:"#FAFBFE" }}>
                <div style={{ fontWeight:700,fontSize:16,color:"#0A2540" }}>Mes rendez-vous ({rdvs.length})</div>
              </div>
              <div style={{ padding:"16px",maxHeight:480,overflowY:"auto" }}>
                {rdvs.length === 0 ? <div style={{ padding:40,textAlign:"center",color:"#8A9AB5" }}>Aucun rendez-vous</div>
                  : rdvs.map(r => (
                    <div key={r.id} style={{ background:"#F8FAFC",borderRadius:12,padding:"14px 16px",marginBottom:10,border:"1px solid #E8EEF6" }}>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                        <div>
                          <div style={{ fontWeight:700,color:"#0A2540",fontSize:14 }}>{r.expert?.user?.prenom} {r.expert?.user?.nom}</div>
                          <div style={{ fontSize:12,color:"#8A9AB5",marginTop:3 }}>📅 {new Date(r.date_rdv).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})}</div>
                        </div>
                        <span style={{ background:`${S_COLOR[r.statut]||"#E2E8F0"}18`,color:S_COLOR[r.statut]||"#6B7280",borderRadius:99,padding:"4px 12px",fontSize:11.5,fontWeight:700 }}>{S_LABEL[r.statut]||r.statut}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ MESSAGES ════ */}
        {tab === "messages" && (
          <div style={{ display:"grid",gridTemplateColumns:"250px 1fr",gap:16,height:"calc(100vh - 200px)" }}>
            <div className="card" style={{ display:"flex",flexDirection:"column" }}>
              <div style={{ padding:"14px 16px",borderBottom:"1px solid #F1F5F9",fontWeight:700,fontSize:14,color:"#0A2540",background:"#FAFBFE" }}>Experts ({experts.length})</div>
              <div style={{ overflowY:"auto",flex:1 }}>
                {experts.map(e => (
                  <div key={e.id} onClick={() => { setSelectedExpert(e); loadConversation(e.user_id||e.user?.id); }}
                    style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 14px",cursor:"pointer",background:selectedExpert?.id===e.id?"#FFFBEB":"transparent",borderLeft:selectedExpert?.id===e.id?"3px solid #F7B500":"3px solid transparent",transition:"all .15s" }}>
                    <div style={{ width:34,height:34,borderRadius:"50%",overflow:"hidden",background:"#0A2540",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"2px solid #F7B500" }}>
                      {e.photo ? <img src={`${BASE}/uploads/photos/${e.photo}`} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" onError={ev => (ev.currentTarget.style.display="none")} /> : <span style={{ color:"#F7B500",fontWeight:800,fontSize:11 }}>{e.user?.prenom?.[0]}{e.user?.nom?.[0]}</span>}
                    </div>
                    <div style={{ overflow:"hidden" }}>
                      <div style={{ fontWeight:600,fontSize:12.5,color:"#0A2540",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{e.user?.prenom} {e.user?.nom}</div>
                      <div style={{ fontSize:11,color:"#8A9AB5" }}>{e.domaine||"Expert"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ display:"flex",flexDirection:"column" }}>
              {!selectedExpert ? (
                <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#8A9AB5" }}>
                  <div style={{ fontSize:44,marginBottom:12 }}>💬</div>
                  <div style={{ fontWeight:700,fontSize:15,color:"#0A2540",marginBottom:5 }}>Sélectionnez un expert</div>
                  <div style={{ fontSize:13 }}>pour démarrer une conversation</div>
                </div>
              ) : (
                <>
                  <div style={{ padding:"14px 18px",borderBottom:"1px solid #F1F5F9",display:"flex",alignItems:"center",gap:12,background:"#FAFBFE" }}>
                    <div style={{ width:36,height:36,borderRadius:"50%",overflow:"hidden",background:"#0A2540",display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #F7B500" }}>
                      {selectedExpert.photo ? <img src={`${BASE}/uploads/photos/${selectedExpert.photo}`} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" onError={ev => (ev.currentTarget.style.display="none")} /> : <span style={{ color:"#F7B500",fontWeight:800,fontSize:13 }}>{selectedExpert.user?.prenom?.[0]}{selectedExpert.user?.nom?.[0]}</span>}
                    </div>
                    <div>
                      <div style={{ fontWeight:700,color:"#0A2540",fontSize:14 }}>{selectedExpert.user?.prenom} {selectedExpert.user?.nom}</div>
                      <div style={{ fontSize:12,color:"#8A9AB5" }}>{selectedExpert.domaine||"Expert"}</div>
                    </div>
                  </div>
                  <div style={{ flex:1,overflowY:"auto",padding:"14px 18px",display:"flex",flexDirection:"column",gap:9 }}>
                    {conversation.length === 0 && <div style={{ textAlign:"center",color:"#8A9AB5",padding:"36px 0",fontSize:13 }}>Démarrez la conversation !</div>}
                    {conversation.map(m => {
                      const isMe = m.sender_id === user?.id;
                      return (
                        <div key={m.id} style={{ display:"flex",justifyContent:isMe?"flex-end":"flex-start" }}>
                          <div className={isMe?"msg-me":"msg-other"}>
                            {m.contenu}
                            <div style={{ fontSize:10,opacity:.55,marginTop:3,textAlign:"right" }}>{new Date(m.createdAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={msgEndRef} />
                  </div>
                  <div style={{ padding:"12px 16px",borderTop:"1px solid #F1F5F9",display:"flex",gap:9 }}>
                    <input className="inp" placeholder="Votre message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key==="Enter" && envoyerMessage()} style={{ flex:1 }} />
                    <button className="btn btn-gold" style={{ padding:"10px 16px" }} onClick={envoyerMessage}><FaPaperPlane /></button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ════ TÉMOIGNAGES ════ */}
        {tab === "temoignages" && (
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
            <div className="card">
              <div style={{ padding:"18px 24px",borderBottom:"1px solid #F1F5F9",background:"#FAFBFE" }}>
                <div style={{ fontWeight:700,fontSize:16,color:"#0A2540" }}>✍️ Partager mon expérience</div>
              </div>
              <div style={{ padding:"24px" }}>
                <div style={{ background:"#F0F9FF",border:"1px solid #BAE6FD",borderRadius:12,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#0369A1" }}>💡 Votre témoignage sera examiné avant d'être publié.</div>
                <label className="lbl" style={{ marginBottom:8 }}>Votre note</label>
                <div style={{ display:"flex",gap:4,marginBottom:16 }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} onClick={() => setNewTemoNote(s)} style={{ fontSize:30,cursor:"pointer",color:s<=newTemoNote?"#F7B500":"#E2E8F0",transition:"transform .1s,color .2s",display:"inline-block",lineHeight:1 }} onMouseEnter={e => (e.currentTarget as HTMLSpanElement).style.transform="scale(1.2)"} onMouseLeave={e => (e.currentTarget as HTMLSpanElement).style.transform="scale(1)"}>★</span>
                  ))}
                  <span style={{ fontSize:13,color:"#F7B500",fontWeight:600,marginLeft:8,alignSelf:"center" }}>{newTemoNote}/5</span>
                </div>
                <label className="lbl">Votre témoignage</label>
                <textarea className="inp" rows={5} placeholder="Partagez votre expérience avec BEH..." value={newTemo} onChange={e => setNewTemo(e.target.value)} style={{ marginBottom:16 }} />
                <button className="btn btn-gold" style={{ width:"100%",justifyContent:"center",padding:"12px" }} onClick={envoyerTemoignage}><FaPaperPlane /> Envoyer</button>
              </div>
            </div>
            <div className="card">
              <div style={{ padding:"18px 24px",borderBottom:"1px solid #F1F5F9",background:"#FAFBFE" }}>
                <div style={{ fontWeight:700,fontSize:16,color:"#0A2540" }}>Mes témoignages ({temoignages.length})</div>
              </div>
              <div style={{ padding:"16px",maxHeight:460,overflowY:"auto" }}>
                {temoignages.length === 0 ? <div style={{ padding:40,textAlign:"center",color:"#8A9AB5" }}>Aucun témoignage</div>
                  : temoignages.map(t => (
                    <div key={t.id} style={{ background:"#F8FAFC",borderRadius:12,padding:"14px 16px",marginBottom:10,border:"1px solid #E8EEF6" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                        <div style={{ display:"flex",gap:2 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color:s<=(t.note||5)?"#F7B500":"#E2E8F0",fontSize:15 }}>★</span>)}<span style={{ fontSize:11,color:"#94A3B8",marginLeft:5 }}>{new Date(t.createdAt).toLocaleDateString("fr-FR")}</span></div>
                        <span style={{ background:t.statut==="valide"?"#ECFDF5":t.statut==="refuse"?"#FEF2F2":"#FFF8E1",color:t.statut==="valide"?"#059669":t.statut==="refuse"?"#DC2626":"#B45309",borderRadius:99,padding:"2px 9px",fontSize:11,fontWeight:700 }}>
                          {t.statut==="valide"?"✅ Publié":t.statut==="refuse"?"❌ Refusé":"⏳ En attente"}
                        </span>
                      </div>
                      <p style={{ fontSize:13.5,color:"#334155",lineHeight:1.72,fontStyle:"italic",margin:0 }}>"{t.texte}"</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer style={{ background:"#0A2540",color:"#fff",padding:"32px",textAlign:"center",borderTop:"1px solid rgba(255,255,255,0.1)" }}>
        <p style={{ margin:"0 0 6px",fontSize:13,color:"rgba(255,255,255,0.7)" }}>© 2026 Business Expert Hub</p>
        <p style={{ color:"rgba(255,255,255,0.35)",fontSize:12,margin:0 }}>Tarifs en Dinar Tunisien (HT) — Essai gratuit 7 jours · Sans engagement</p>
      </footer>
    </>
  );
}