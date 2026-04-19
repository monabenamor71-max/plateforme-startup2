"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaStar, FaArrowRight, FaSearch,
  FaChartLine, FaCode, FaUsers,
  FaLightbulb, FaThLarge, FaLock, FaEnvelope,
  FaCalendarAlt, FaBullhorn, FaGlobe, FaChevronDown, FaCheck,
} from "react-icons/fa";

// ==================== TRADUCTIONS ====================

type Lang = "fr" | "en";

const T: Record<Lang, Record<string, string>> = {
  fr: {
    // Header
    nav_home: "Accueil",
    nav_about: "À propos",
    nav_services: "Services",
    nav_experts: "Experts",
    nav_blog: "Blog",
    nav_contact: "Contact",
    btn_login: "Connexion",
    btn_signup: "S'inscrire",
    // Hero
    hero_badge: "Experts certifiés",
    hero_title: "Nos",
    hero_title_highlight: "Experts",
    hero_desc: "Des experts qualifiés pour répondre à vos besoins dans différents domaines professionnels.",
    // Filters
    filter_placeholder: "Rechercher un expert, une compétence…",
    filter_domain: "Domaine",
    filter_all: "Tous",
    filter_finance: "Finance",
    filter_marketing: "Marketing",
    filter_management: "Management",
    filter_it: "IT",
    filter_cyber: "Cybersécurité",
    filter_results: "expert trouvé",
    filter_results_plural: "experts trouvés",
    filter_no_results: "Aucun expert trouvé",
    filter_no_results_desc: "Essayez un autre terme ou sélectionnez un autre domaine.",
    filter_reset: "Réinitialiser",
    // CTA top
    btn_become_expert: "Devenir expert",
    // Cards
    exp_label: "Expérience",
    location: "📍 {loc}",
    price: "💰 {price}",
    upcoming_slots: "Prochains créneaux",
    view_profile: "Voir le profil",
    // Modal
    modal_title: "Inscription requise",
    modal_desc: "Pour consulter ce profil ou réserver un rendez-vous, créez un compte gratuit ou connectez-vous.",
    modal_create: "Créer un compte gratuit",
    modal_login: "J'ai déjà un compte — Connexion",
    // CTA bottom
    cta_title: "Vous êtes expert ?",
    cta_title_highlight: "Rejoignez notre réseau",
    cta_desc: "Intégrez la plateforme BEH et connectez-vous avec des startups qui ont besoin de vos compétences.",
    cta_btn: "Candidater comme expert",
    // Footer
    footer_copy: "© 2026 Business Expert Hub",
    footer_tagline: "Plateforme de mise en relation startups & experts",
    // Loading / error
    loading: "Chargement des experts…",
    error: "Erreur lors du chargement des experts",
  },
  en: {
    // Header
    nav_home: "Home",
    nav_about: "About",
    nav_services: "Services",
    nav_experts: "Experts",
    nav_blog: "Blog",
    nav_contact: "Contact",
    btn_login: "Login",
    btn_signup: "Sign up",
    // Hero
    hero_badge: "Certified experts",
    hero_title: "Our",
    hero_title_highlight: "Experts",
    hero_desc: "Qualified experts to meet your needs in various professional fields.",
    // Filters
    filter_placeholder: "Search for an expert, skill…",
    filter_domain: "Domain",
    filter_all: "All",
    filter_finance: "Finance",
    filter_marketing: "Marketing",
    filter_management: "Management",
    filter_it: "IT",
    filter_cyber: "Cybersecurity",
    filter_results: "expert found",
    filter_results_plural: "experts found",
    filter_no_results: "No expert found",
    filter_no_results_desc: "Try another term or select another domain.",
    filter_reset: "Reset",
    // CTA top
    btn_become_expert: "Become an expert",
    // Cards
    exp_label: "Experience",
    location: "📍 {loc}",
    price: "💰 {price}",
    upcoming_slots: "Upcoming slots",
    view_profile: "View profile",
    // Modal
    modal_title: "Registration required",
    modal_desc: "To view this profile or book an appointment, create a free account or log in.",
    modal_create: "Create a free account",
    modal_login: "Already have an account — Log in",
    // CTA bottom
    cta_title: "Are you an expert?",
    cta_title_highlight: "Join our network",
    cta_desc: "Join the BEH platform and connect with startups that need your skills.",
    cta_btn: "Apply as an expert",
    // Footer
    footer_copy: "© 2026 Business Expert Hub",
    footer_tagline: "Startup & expert matching platform",
    // Loading / error
    loading: "Loading experts…",
    error: "Error loading experts",
  },
};

// ==================== SÉLECTEUR DE LANGUE ====================

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const LANGS: { code: Lang; label: string; short: string }[] = [
    { code: "fr", label: "Français", short: "FR" },
    { code: "en", label: "English", short: "EN" },
  ];

  function select(code: Lang) {
    setLang(code);
    setOpen(false);
    if (typeof window !== "undefined") localStorage.setItem("beh_lang", code);
  }

  const current = LANGS.find(l => l.code === lang)!;

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "transparent",
          border: "none",
          padding: "6px 8px",
          cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 13.5, fontWeight: 600,
          color: "#374151",
          borderRadius: 8,
          transition: "color .18s, background .18s",
          outline: "none",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "#0A2540"; e.currentTarget.style.background = "#F3F4F6"; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "transparent"; } }}
      >
        <FaGlobe size={15} style={{ color: "#6B7280", flexShrink: 0 }} />
        <span style={{ letterSpacing: ".3px" }}>{current.short}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#fff", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(10,37,64,.13)",
          border: "1px solid #E5E7EB",
          overflow: "hidden", minWidth: 140, zIndex: 400,
          animation: "langDrop .15s cubic-bezier(.22,1,.36,1)",
        }}>
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => select(l.code)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px",
                background: l.code === lang ? "#F9FAFB" : "transparent",
                border: "none", cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 13.5,
                fontWeight: l.code === lang ? 700 : 500,
                color: l.code === lang ? "#0A2540" : "#6B7280",
                transition: "background .12s, color .12s",
                textAlign: "left",
              }}
              onMouseEnter={e => { if (l.code !== lang) { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#374151"; } }}
              onMouseLeave={e => { if (l.code !== lang) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6B7280"; } }}
            >
              <FaGlobe size={13} style={{ color: l.code === lang ? "#F7B500" : "#9CA3AF", flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{l.label}</span>
              {l.code === lang && (
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaCheck size={7} style={{ color: "#F7B500" }} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== HOOKS & HELPERS ====================

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView] as const;
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(36px)", transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

type Domain = "tous" | "finance" | "marketing" | "management" | "it" | "strategie";

const DOMAINS_BASE = [
  { value: "tous",       icon: <FaThLarge />,   color: "#0A2540" },
  { value: "finance",    icon: <FaChartLine />, color: "#3B82F6" },
  { value: "marketing",  icon: <FaBullhorn />,  color: "#F7B500" },
  { value: "management", icon: <FaUsers />,     color: "#22C55E" },
  { value: "it",         icon: <FaCode />,      color: "#8B5CF6" },
  { value: "strategie",  icon: <FaLightbulb />, color: "#06B6D4" },
];

const navServices = [
  { label: "Consulting",     slug: "consulting"     },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Accompagnement", slug: "accompagnement" },
  { label: "Formations",     slug: "formations"     },
];

function mapDomain(domaine: string): Domain {
  const d = (domaine || "").toLowerCase();
  if (d.includes("finan"))                            return "finance";
  if (d.includes("marketing"))                        return "marketing";
  if (d.includes("manage") || d.includes("rh"))      return "management";
  if (d.includes("tech") || d.includes("it") || d.includes("info")) return "it";
  if (d.includes("cyber") || d.includes("sécurité")) return "strategie";
  return "tous";
}

const calculerExperience = (anneeDebut: number | null | undefined): string => {
  if (!anneeDebut) return "";
  const currentYear = new Date().getFullYear();
  const ans = currentYear - anneeDebut;
  if (ans < 0) return "";
  return `${ans} ${ans > 1 ? "ans" : "an"}`;
};

const getExperienceText = (ex: any): string => {
  if (ex.annee_debut_experience) {
    const expCalculee = calculerExperience(ex.annee_debut_experience);
    if (expCalculee) return `${expCalculee} d'expérience`;
    return "Expérience non renseignée";
  }
  if (ex.experience) return ex.experience;
  return "Non renseignée";
};

// Helper pour formater les créneaux selon la langue
function formatCreneau(d: any, lang: Lang) {
  const date = new Date(d.date);
  const locale = lang === "fr" ? "fr-FR" : "en-GB";
  const jour = date.toLocaleDateString(locale, { day: "numeric", month: "short" });
  return `${jour} ${(d.heureDebut || d.heure || "").slice(0, 5)}`;
}

export default function ExpertsPage() {
  const [lang, setLang] = useState<Lang>("fr");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("beh_lang") as Lang | null;
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);
  const tr = T[lang];

  const [servicesOpen, setServicesOpen] = useState(false);
  const [activeDomain, setActiveDomain] = useState<Domain>("tous");
  const [search, setSearch]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [experts, setExperts]   = useState<any[]>([]);
  const [dispos, setDispos]     = useState<Record<number, any[]>>({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    loadExperts();
  }, []);

  async function loadExperts() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/experts");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) { setError("Format de données incorrect"); setLoading(false); return; }

      const transformed = data.map((e: any) => ({
        id:          e.id,
        initials:    ((e.user?.prenom?.[0] || e.prenom?.[0] || "") + (e.user?.nom?.[0] || e.nom?.[0] || "")).toUpperCase(),
        name:        `${e.user?.prenom || e.prenom || ""} ${e.user?.nom || e.nom || ""}`.trim(),
        title:       e.domaine || "",
        domain:      mapDomain(e.domaine || ""),
        domainLabel: e.domaine || "",
        bio:         e.description || "",
        experience:  e.experience || "",
        annee_debut_experience: e.annee_debut_experience || null,
        tarif:       e.tarif || "",
        localisation: e.localisation || "",
        photo:       e.photo || null,
      }));

      setExperts(transformed);

      const map: Record<number, any[]> = {};
      await Promise.allSettled(
        transformed.map(async (ex) => {
          const r = await fetch(`http://localhost:3001/disponibilites/expert/${ex.id}`).catch(() => null);
          map[ex.id] = r && r.ok ? await r.json() : [];
        })
      );
      setDispos(map);
    } catch (err: any) {
      setError(tr.error);
    } finally {
      setLoading(false);
    }
  }

  const filtered = experts.filter(e => {
    const matchDomain = activeDomain === "tous" || e.domain === activeDomain;
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.title.toLowerCase().includes(q) || e.localisation.toLowerCase().includes(q);
    return matchDomain && matchSearch;
  });

  // Domaines avec libellés traduits
  const domainsTranslated = DOMAINS_BASE.map(d => ({
    ...d,
    label: d.value === "tous" ? tr.filter_all
          : d.value === "finance" ? tr.filter_finance
          : d.value === "marketing" ? tr.filter_marketing
          : d.value === "management" ? tr.filter_management
          : d.value === "it" ? tr.filter_it
          : tr.filter_cyber,
  }));

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#374151", minHeight: "100vh", background: "#f7f9fc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes heroZoom { 0% { transform: scale(1.08); } 100% { transform: scale(1); } }
        .hero-bg { animation: heroZoom 2s cubic-bezier(.22,1,.36,1) forwards; }
        @keyframes hfi { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        .hci { animation: hfi .85s cubic-bezier(.22,1,.36,1) both; }
        .hci-1 { animation-delay:.1s; } .hci-2 { animation-delay:.25s; } .hci-3 { animation-delay:.4s; }
        @keyframes modalIn { from { opacity:0; transform:scale(.92) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .modal-box { animation: modalIn .3s cubic-bezier(.22,1,.36,1); }
        @keyframes langDrop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .nav-link { color:#0A2540; text-decoration:none; font-size:15px; font-weight:500; transition:color .2s; }
        .nav-link:hover { color:#F7B500; }
        .drop-item { display:block; padding:10px 16px; color:#0A2540; text-decoration:none; font-size:14px; font-weight:600; transition:background .15s; white-space:nowrap; }
        .drop-item:hover { background:#FFFBEB; }
        .btn-conn { border:2px solid #0A2540; color:#0A2540; background:transparent; padding:9px 22px; border-radius:9px; font-weight:700; font-size:14px; cursor:pointer; transition:all .22s; font-family:inherit; }
        .btn-conn:hover { background:#F7B500; border-color:#F7B500; transform:translateY(-2px); }
        .btn-insc { background:#F7B500; color:#0A2540; border:2px solid #F7B500; padding:9px 22px; border-radius:9px; font-weight:800; font-size:14px; cursor:pointer; transition:all .22s; font-family:inherit; }
        .btn-insc:hover { background:#e6a800; transform:translateY(-2px); }
        .domain-pill { display:flex; align-items:center; gap:7px; padding:10px 20px; border-radius:99px; font-size:13.5px; font-weight:700; cursor:pointer; border:2px solid rgba(10,37,64,.10); background:white; color:#374151; transition:all .22s; white-space:nowrap; }
        .domain-pill:hover { border-color:#F7B500; color:#0A2540; background:#FFFBEB; transform:translateY(-2px); }
        .domain-pill.active { background:#0A2540; color:#F7B500; border-color:#0A2540; transform:translateY(-2px); }
        .search-box { width:100%; background:white; border:1.5px solid rgba(10,37,64,.10); border-radius:14px; padding:13px 16px 13px 48px; font-size:15px; color:#0A2540; outline:none; transition:border-color .22s, box-shadow .22s; font-family:inherit; }
        .search-box::placeholder { color:#9CA3AF; }
        .search-box:focus { border-color:#F7B500; box-shadow:0 0 0 4px rgba(247,181,0,.12); }
        .expert-card { background:white; border-radius:22px; border:1.5px solid rgba(10,37,64,.07); box-shadow:0 4px 22px rgba(10,37,64,.07); overflow:hidden; transition:transform .32s cubic-bezier(.22,1,.36,1), box-shadow .32s, border-color .32s; display:flex; flex-direction:column; }
        .expert-card:hover { transform:translateY(-10px); box-shadow:0 24px 56px rgba(10,37,64,.14); border-color:rgba(247,181,0,.4); }
        .chip { display:inline-flex; align-items:center; background:#EFF6FF; color:#2563EB; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:500; white-space:nowrap; }
        @keyframes ping2 { 0%{transform:scale(1);opacity:.7;} 100%{transform:scale(1.9);opacity:0;} }
        .ping-dot { position:relative; }
        .ping-dot::after { content:''; position:absolute; inset:-3px; border-radius:50%; border:2px solid #22C55E; animation:ping2 1.8s ease-out infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(10,37,64,.65)", backdropFilter: "blur(6px)" }} onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ background: "white", borderRadius: 28, width: "100%", maxWidth: 460, padding: "48px 44px", position: "relative", boxShadow: "0 32px 80px rgba(10,37,64,.28)" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#0A2540", margin: "0 auto 20px", boxShadow: "0 10px 28px rgba(247,181,0,.35)" }}><FaLock /></div>
            {selectedExpert && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f7f9fc", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", overflow: "hidden", background: "#0A2540", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 800, fontSize: 14 }}>
                  {selectedExpert.photo ? <img src={`http://localhost:3001/uploads/photos/${selectedExpert.photo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : selectedExpert.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: "#0A2540", fontSize: 15 }}>{selectedExpert.name}</div>
                  <div style={{ color: "#8A9AB5", fontSize: 12 }}>{selectedExpert.title}</div>
                </div>
              </div>
            )}
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0A2540", marginBottom: 10, textAlign: "center" }}>{tr.modal_title}</h2>
            <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.75, marginBottom: 28, textAlign: "center" }}>{tr.modal_desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/inscription" onClick={() => setShowModal(false)}>
                <button style={{ width: "100%", background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 12, padding: 14, fontFamily: "inherit", fontWeight: 900, fontSize: 15, cursor: "pointer" }}>{tr.modal_create}</button>
              </Link>
              <Link href="/connexion" onClick={() => setShowModal(false)}>
                <button style={{ width: "100%", background: "transparent", color: "#0A2540", border: "1.5px solid rgba(10,37,64,.15)", borderRadius: 12, padding: 12, fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>{tr.modal_login}</button>
              </Link>
            </div>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 14, right: 18, background: "none", border: "none", fontSize: 24, color: "#CBD5E1", cursor: "pointer" }}>×</button>
          </div>
        </div>
      )}

      {/* HEADER AVEC TRADUCTIONS ET SÉLECTEUR DE LANGUE */}
      <header style={{ background: "white", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 76, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <svg width="44" height="44" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="12" fill="#0A2540"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial" letterSpacing="0.5">BEH</text></svg>
            <span style={{ fontWeight: 900, fontSize: 18, color: "#0A2540" }}>Business <span style={{ color: "#F7B500" }}>Expert</span> Hub</span>
          </Link>
          <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <Link href="/" className="nav-link">{tr.nav_home}</Link>
            <Link href="/a-propos" className="nav-link">{tr.nav_about}</Link>
            <div style={{ position: "relative" }} onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <Link href="/services" className="nav-link" style={{ fontWeight: 600 }}>{tr.nav_services} ▾</Link>
              {servicesOpen && (
                <ul style={{ position: "absolute", top: "calc(100%+8px)", left: 0, background: "white", borderRadius: 12, listStyle: "none", padding: "6px 0", margin: 0, zIndex: 200, minWidth: 200, boxShadow: "0 8px 32px rgba(0,0,0,.12)", border: "1px solid rgba(10,37,64,.06)" }}>
                  {navServices.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nav-link" style={{ color: "#F7B500", fontWeight: 700 }}>{tr.nav_experts}</Link>
            <Link href="/blog" className="nav-link">{tr.nav_blog}</Link>
            <Link href="/contact" className="nav-link">{tr.nav_contact}</Link>
          </nav>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <LangSwitcher lang={lang} setLang={setLang} />
            <div style={{ width: 1, height: 24, background: "#E5E7EB", margin: "0 4px" }} />
            <Link href="/connexion"><button className="btn-conn">{tr.btn_login}</button></Link>
            <Link href="/inscription"><button className="btn-insc">{tr.btn_signup}</button></Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", color: "white", minHeight: 520 }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image src="/ex1.jpg" alt="Experts" fill priority className="hero-bg" style={{ objectFit: "cover", objectPosition: "center top" }} sizes="100vw" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,37,64,.95) 0%, rgba(10,37,64,.82) 40%, transparent 100%)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none" }} />
        </div>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "88px 24px 110px", position: "relative", zIndex: 10 }}>
          <div className="hci hci-1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "rgba(255,255,255,.5)" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none" }}>{tr.nav_home}</Link>
            <span>›</span>
            <span style={{ color: "#F7B500", fontWeight: 600 }}>{tr.nav_experts}</span>
          </div>
          <div style={{ maxWidth: 680 }}>
            <div className="hci hci-2">
              <span style={{ display: "inline-block", background: "#F7B500", color: "#0A2540", fontWeight: 900, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", padding: "6px 18px", borderRadius: 99, marginBottom: 20 }}>{tr.hero_badge}</span>
            </div>
            <h1 className="hci hci-3" style={{ fontWeight: 900, margin: "0 0 16px", lineHeight: 1.1, fontSize: "clamp(40px,5vw,64px)" }}>
              {tr.hero_title} <span style={{ color: "#F7B500" }}>{tr.hero_title_highlight}</span>
            </h1>
            <p className="hci hci-3" style={{ fontSize: 17, color: "rgba(255,255,255,.8)", lineHeight: 1.8, margin: 0 }}>
              {tr.hero_desc}
            </p>
          </div>
        </div>
      </section>

      {/* FILTRES */}
      <section style={{ background: "white", position: "sticky", top: 76, zIndex: 50, boxShadow: "0 4px 20px rgba(10,37,64,.06)", borderBottom: "1px solid rgba(10,37,64,.07)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
              <FaSearch style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 13, pointerEvents: "none" }} />
              <input type="text" placeholder={tr.filter_placeholder} value={search} onChange={e => setSearch(e.target.value)} className="search-box" />
              {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 13 }}>✕</button>}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {domainsTranslated.map(d => (
                <button key={d.value} onClick={() => setActiveDomain(d.value as Domain)} className={`domain-pill${activeDomain === d.value ? " active" : ""}`}>
                  <span style={{ fontSize: 12 }}>{d.icon}</span> {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GRILLE */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 24px" }}>
        <FadeUp style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontWeight: 900, color: "#0A2540", margin: "0 0 6px", fontSize: "clamp(22px,3vw,32px)" }}>
              {activeDomain === "tous" ? tr.filter_all : domainsTranslated.find(d => d.value === activeDomain)?.label}
            </h2>
            <p style={{ color: "#6B7280", fontSize: 15, margin: 0 }}>
              {loading ? tr.loading : `${filtered.length} ${filtered.length > 1 ? tr.filter_results_plural : tr.filter_results}`}
            </p>
          </div>
          <Link href="/inscription">
            <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0A2540", color: "white", border: "none", borderRadius: 12, padding: "12px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all .2s", fontFamily: "inherit" }}
              onMouseEnter={e => { (e.target as any).style.background = "#F7B500"; (e.target as any).style.color = "#0A2540"; }}
              onMouseLeave={e => { (e.target as any).style.background = "#0A2540"; (e.target as any).style.color = "white"; }}>
              {tr.btn_become_expert} <FaArrowRight size={12} />
            </button>
          </Link>
        </FadeUp>

        {loading ? (
          <div style={{ textAlign: "center", padding: "96px 0" }}>
            <div style={{ width: 44, height: 44, border: "3px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#8A9AB5", fontSize: 15 }}>{tr.loading}</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#DC2626" }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontWeight: 900, color: "#0A2540", marginBottom: 8 }}>{tr.filter_no_results}</h3>
            <p style={{ color: "#9CA3AF", fontSize: 15, marginBottom: 24 }}>{tr.filter_no_results_desc}</p>
            <button onClick={() => { setSearch(""); setActiveDomain("tous"); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>{tr.filter_reset}</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {filtered.map((ex, i) => (
              <FadeUp key={ex.id} delay={i * 0.07}>
                <div className="expert-card" style={{ height: "100%" }}>
                  <div style={{ padding: 22, flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, background: "#F0FDF4", color: "#059669", padding: "4px 12px", borderRadius: 99 }}>
                          💼 {tr.exp_label} : {getExperienceText(ex)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 800, fontSize: 20, border: "2px solid #F7B500" }}>
                        {ex.photo ? <img src={`http://localhost:3001/uploads/photos/${ex.photo}`} alt={ex.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : ex.initials}
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 800, color: "#0A2540", fontSize: 16, margin: "0 0 4px" }}>{ex.name}</h3>
                        <span style={{ display: "inline-block", background: "#EFF6FF", color: "#2563EB", borderRadius: 99, padding: "3px 10px", fontSize: 11.5, fontWeight: 700 }}>{ex.domainLabel || "Expert"}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      {ex.localisation && <span style={{ fontSize: 12, color: "#6B7280", background: "#F7F9FC", border: "1px solid #E8EEF6", borderRadius: 6, padding: "3px 8px" }}>{tr.location.replace("{loc}", ex.localisation)}</span>}
                      {ex.tarif && <span style={{ fontSize: 12, color: "#D97706", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 6, padding: "3px 8px" }}>{tr.price.replace("{price}", ex.tarif)}</span>}
                    </div>
                    {ex.bio && <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>{ex.bio}</p>}
                    {dispos[ex.id] && dispos[ex.id].length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#8A9AB5", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{tr.upcoming_slots}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {dispos[ex.id].slice(0, 3).map((d, idx) => (
                            <span key={idx} className="chip"><FaCalendarAlt size={9} style={{ marginRight: 4 }} />{formatCreneau(d, lang)}</span>
                          ))}
                          {dispos[ex.id].length > 3 && <span style={{ fontSize: 11, color: "#9CA3AF", alignSelf: "center" }}>+{dispos[ex.id].length - 3}</span>}
                        </div>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                      <button onClick={() => { setSelectedExpert(ex); setShowModal(true); }} style={{ flex: 1, background: "#0A2540", color: "white", border: "none", borderRadius: 10, padding: "11px", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .2s" }}
                        onMouseEnter={e => { (e.currentTarget as any).style.background = "#F7B500"; (e.currentTarget as any).style.color = "#0A2540"; }}
                        onMouseLeave={e => { (e.currentTarget as any).style.background = "#0A2540"; (e.currentTarget as any).style.color = "white"; }}>
                        {tr.view_profile} <FaArrowRight size={11} />
                      </button>
                      <button onClick={() => { setSelectedExpert(ex); setShowModal(true); }} style={{ width: 42, height: 42, background: "#F7F9FC", border: "1px solid #E8EEF6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280", transition: "all .2s" }}
                        onMouseEnter={e => { (e.currentTarget as any).style.background = "#F7B500"; (e.currentTarget as any).style.color = "#0A2540"; }}
                        onMouseLeave={e => { (e.currentTarget as any).style.background = "#F7F9FC"; (e.currentTarget as any).style.color = "#6B7280"; }}>
                        <FaCalendarAlt size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        )}
      </section>

      {/* CTA BOTTOM */}
      <section style={{ background: "#0A2540", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.022) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
          <FadeUp>
            <h2 style={{ fontWeight: 900, color: "white", margin: "0 0 14px", lineHeight: 1.15, fontSize: "clamp(26px,4vw,44px)" }}>
              {tr.cta_title}<br /><span style={{ color: "#F7B500" }}>{tr.cta_title_highlight}</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,.45)", fontSize: 15, lineHeight: 1.75, marginBottom: 32 }}>
              {tr.cta_desc}
            </p>
            <Link href="/inscription">
              <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 12, padding: "16px 32px", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 28px rgba(247,181,0,.35)" }}>
                {tr.cta_btn} <FaArrowRight size={14} />
              </button>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#081B33", color: "white", padding: "28px 24px", textAlign: "center" }}>
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600 }}>{tr.footer_copy}</p>
        <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13, margin: 0 }}>{tr.footer_tagline}</p>
      </footer>
    </div>
  );
}