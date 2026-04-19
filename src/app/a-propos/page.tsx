"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import Link from "next/link";
import {
  FaBullseye, FaRocket, FaHandsHelping, FaStar, FaArrowRight,
  FaUsers, FaAward, FaChartLine, FaGlobe, FaCheck, FaQuoteLeft,
  FaLinkedin, FaTwitter, FaEnvelope, FaChevronDown,
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
    hero_badge: "Notre histoire & ADN",
    hero_title: "Qui est",
    hero_title_highlight: "Business Expert Hub",
    hero_desc: "Depuis 2019, nous connectons les startups les plus ambitieuses aux meilleurs experts pour transformer leurs visions en succès mesurables.",
    hero_cta_vision: "Notre Vision",
    hero_cta_mission: "Notre Mission",
    hero_cta_valeurs: "Nos Valeurs",
    // Stats
    stat_creation: "Année de création",
    stat_experts: "Experts certifiés",
    stat_startups: "Startups accompagnées",
    // Vision
    vision_badge: "Vision",
    vision_title: "Devenir la",
    vision_title_highlight: "référence",
    vision_title_end: "en accompagnement de startups",
    vision_desc: "Notre vision est de créer un écosystème où chaque startup innovante a accès aux mêmes ressources humaines d'exception que les grandes entreprises.",
    vision_point1: "Accès universel à l'expertise de haut niveau",
    vision_point2: "Réseau pan-africain et européen d'ici 2027",
    vision_point3: "Technologie au service de la mise en relation",
    vision_point4: "1 000 startups accompagnées à l'horizon 2027",
    citation: "Nous ne faisons pas que connecter des experts et des startups. Nous créons les success stories de demain.",
    citation_auteur: "Ahmed Benslimane",
    citation_role: "CEO & Co-fondateur",
    // Mission
    mission_badge: "Mission",
    mission_title: "Offrir un accès",
    mission_title_highlight: "privilégié",
    mission_title_end: "à l'expertise",
    mission_desc: "Offrir aux startups un accès privilégié à des experts certifiés pour structurer leur stratégie, accélérer leur croissance et réussir leurs levées de fonds.",
    mission_card1_title: "Structurer",
    mission_card1_desc: "Nous aidons les startups à poser des bases solides : stratégie, business model, organisation interne et processus scalables.",
    mission_card1_item1: "Diagnostic stratégique complet",
    mission_card1_item2: "Business model canvas",
    mission_card1_item3: "Organisation & gouvernance",
    mission_card2_title: "Accélérer",
    mission_card2_desc: "Grâce à nos experts marketing, tech et commercial, nous boostons votre croissance avec des méthodes éprouvées.",
    mission_card2_item1: "Growth hacking & acquisition",
    mission_card2_item2: "Optimisation produit & UX",
    mission_card2_item3: "Scalabilité commerciale",
    mission_card3_title: "Financer",
    mission_card3_desc: "Nous connectons les startups à notre réseau de VCs, family offices et fonds pour faciliter les levées.",
    mission_card3_item1: "Préparation pitch & deck",
    mission_card3_item2: "Accès réseau investisseurs",
    mission_card3_item3: "Accompagnement due diligence",
    // Timeline
    timeline_badge: "Notre parcours",
    timeline_title: "Notre histoire &",
    timeline_title_highlight: "succès",
    timeline1_title: "Fondation",
    timeline1_desc: "Création de Business Expert Hub par une équipe de consultants passionnés.",
    timeline2_title: "Premiers succès",
    timeline2_desc: "Accompagnement de nos 20 premières startups.",
    timeline3_title: "Expansion digitale",
    timeline3_desc: "Lancement de la plateforme digitale.",
    timeline4_title: "Reconnaissance",
    timeline4_desc: "Obtention du label Meilleure plateforme d'accompagnement startup.",
    timeline5_title: "Scale-up",
    timeline5_desc: "Dépassement des 100 startups accompagnées.",
    timeline6_title: "Leader régional",
    timeline6_desc: "Consolidation de notre position de référence.",
    // Valeurs
    valeurs_badge: "Valeurs",
    valeurs_title: "Les valeurs qui nous",
    valeurs_title_highlight: "définissent",
    valeur1_titre: "Excellence",
    valeur1_desc: "Nous sélectionnons rigoureusement chaque expert pour garantir un niveau d'accompagnement exceptionnel.",
    valeur2_titre: "Transparence",
    valeur2_desc: "Chaque interaction, chaque contrat, chaque résultat est documenté et partagé.",
    valeur3_titre: "Engagement",
    valeur3_desc: "Votre succès est notre succès. Nous nous impliquons bien au-delà de la prestation.",
    // CTA
    cta_title: "Prêt à nous rejoindre ?",
    cta_desc: "Que vous soyez expert ou startup, rejoignez notre écosystème et bénéficiez d'un accompagnement sur mesure.",
    cta_btn: "Rejoindre BEH",
    cta_btn_contact: "Nous contacter",
    // Footer
    foot_desc: "Plateforme de mise en relation entre startups ambitieuses et experts certifiés.",
    foot_nav: "Navigation",
    foot_services: "Services",
    foot_contact: "Contact",
    foot_legal: "Mentions légales",
    foot_privacy: "Politique de confidentialité",
    foot_cgu: "CGU",
    foot_copy: "© 2026 Business Expert Hub — Tous droits réservés",
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
    hero_badge: "Our story & DNA",
    hero_title: "Who is",
    hero_title_highlight: "Business Expert Hub",
    hero_desc: "Since 2019, we connect the most ambitious startups with the best experts to turn their visions into measurable success.",
    hero_cta_vision: "Our Vision",
    hero_cta_mission: "Our Mission",
    hero_cta_valeurs: "Our Values",
    // Stats
    stat_creation: "Year of creation",
    stat_experts: "Certified experts",
    stat_startups: "Startups supported",
    // Vision
    vision_badge: "Vision",
    vision_title: "Become the",
    vision_title_highlight: "reference",
    vision_title_end: "in startup support",
    vision_desc: "Our vision is to create an ecosystem where every innovative startup has access to the same exceptional human resources as large companies.",
    vision_point1: "Universal access to high-level expertise",
    vision_point2: "Pan-African and European network by 2027",
    vision_point3: "Technology at the service of connection",
    vision_point4: "1,000 startups supported by 2027",
    citation: "We don't just connect experts and startups. We create tomorrow's success stories.",
    citation_auteur: "Ahmed Benslimane",
    citation_role: "CEO & Co-founder",
    // Mission
    mission_badge: "Mission",
    mission_title: "Provide",
    mission_title_highlight: "privileged",
    mission_title_end: "access to expertise",
    mission_desc: "Give startups privileged access to certified experts to structure their strategy, accelerate growth and succeed in fundraising.",
    mission_card1_title: "Structure",
    mission_card1_desc: "We help startups build solid foundations: strategy, business model, internal organization and scalable processes.",
    mission_card1_item1: "Complete strategic diagnosis",
    mission_card1_item2: "Business model canvas",
    mission_card1_item3: "Organization & governance",
    mission_card2_title: "Accelerate",
    mission_card2_desc: "With our marketing, tech and sales experts, we boost your growth using proven methods.",
    mission_card2_item1: "Growth hacking & acquisition",
    mission_card2_item2: "Product & UX optimization",
    mission_card2_item3: "Commercial scalability",
    mission_card3_title: "Fund",
    mission_card3_desc: "We connect startups with our network of VCs, family offices and funds to facilitate fundraising.",
    mission_card3_item1: "Pitch & deck preparation",
    mission_card3_item2: "Investor network access",
    mission_card3_item3: "Due diligence support",
    // Timeline
    timeline_badge: "Our journey",
    timeline_title: "Our story &",
    timeline_title_highlight: "success",
    timeline1_title: "Foundation",
    timeline1_desc: "Creation of Business Expert Hub by a team of passionate consultants.",
    timeline2_title: "First successes",
    timeline2_desc: "Supporting our first 20 startups.",
    timeline3_title: "Digital expansion",
    timeline3_desc: "Launch of the digital platform.",
    timeline4_title: "Recognition",
    timeline4_desc: "Obtaining the label Best startup support platform.",
    timeline5_title: "Scale-up",
    timeline5_desc: "Exceeding 100 startups supported.",
    timeline6_title: "Regional leader",
    timeline6_desc: "Consolidating our position as a reference.",
    // Valeurs
    valeurs_badge: "Values",
    valeurs_title: "The values that",
    valeurs_title_highlight: "define us",
    valeur1_titre: "Excellence",
    valeur1_desc: "We rigorously select each expert to guarantee an exceptional level of support.",
    valeur2_titre: "Transparency",
    valeur2_desc: "Every interaction, every contract, every result is documented and shared.",
    valeur3_titre: "Commitment",
    valeur3_desc: "Your success is our success. We get involved far beyond the service.",
    // CTA
    cta_title: "Ready to join us?",
    cta_desc: "Whether you are an expert or a startup, join our ecosystem and benefit from personalized support.",
    cta_btn: "Join BEH",
    cta_btn_contact: "Contact us",
    // Footer
    foot_desc: "Platform connecting ambitious startups with certified experts.",
    foot_nav: "Navigation",
    foot_services: "Services",
    foot_contact: "Contact",
    foot_legal: "Legal notice",
    foot_privacy: "Privacy policy",
    foot_cgu: "Terms of use",
    foot_copy: "© 2026 Business Expert Hub — All rights reserved",
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
          fontFamily: "'Outfit', sans-serif",
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
                fontFamily: "'Outfit', sans-serif",
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

const BASE = "http://localhost:3001";

function useInView(threshold = 0.12): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function FadeUp({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0px)" : "translateY(44px)",
      transition: `opacity 0.78s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.78s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>{children}</div>
  );
}

// ==================== PAGE À PROPOS ====================

export default function APropos() {
  const [lang, setLang] = useState<Lang>("fr");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("beh_lang") as Lang | null;
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);
  const tr = T[lang];

  const [servicesOpen, setServicesOpen] = useState(false);
  const [nbExperts, setNbExperts] = useState<number | null>(null);
  const [nbStartups, setNbStartups] = useState<number | null>(null);
  const [histoire, setHistoire] = useState<any>({});

  // Valeurs par défaut pour les champs pouvant venir de l'API
  const defaults = {
    annee_creation: "2019",
    description_hero: tr.hero_desc,
    description_vision: tr.vision_desc,
    vision_point1: tr.vision_point1,
    vision_point2: tr.vision_point2,
    vision_point3: tr.vision_point3,
    vision_point4: tr.vision_point4,
    citation: tr.citation,
    citation_auteur: tr.citation_auteur,
    citation_role: tr.citation_role,
    mission_titre: tr.mission_title,
    mission_desc: tr.mission_desc,
    timeline1_year: "2019", timeline1_title: tr.timeline1_title, timeline1_desc: tr.timeline1_desc,
    timeline2_year: "2020", timeline2_title: tr.timeline2_title, timeline2_desc: tr.timeline2_desc,
    timeline3_year: "2021", timeline3_title: tr.timeline3_title, timeline3_desc: tr.timeline3_desc,
    timeline4_year: "2022", timeline4_title: tr.timeline4_title, timeline4_desc: tr.timeline4_desc,
    timeline5_year: "2023", timeline5_title: tr.timeline5_title, timeline5_desc: tr.timeline5_desc,
    timeline6_year: "2024", timeline6_title: tr.timeline6_title, timeline6_desc: tr.timeline6_desc,
    valeur1_titre: tr.valeur1_titre, valeur1_desc: tr.valeur1_desc, valeur1_color: "#F7B500",
    valeur2_titre: tr.valeur2_titre, valeur2_desc: tr.valeur2_desc, valeur2_color: "#22C55E",
    valeur3_titre: tr.valeur3_titre, valeur3_desc: tr.valeur3_desc, valeur3_color: "#3B82F6",
    contact_email: "contact@beh.com",
    contact_telephone: "+216 00 000 000",
    contact_adresse: "Tunis, Tunisie",
  };

  const get = (key: string) => histoire?.[key] || (defaults as any)[key] || "";

  const loadStats = () => {
    fetch(`${BASE}/experts/liste`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const valides = Array.isArray(data) ? data.filter((e: any) => e.statut === "valide").length : 0;
        setNbExperts(valides);
      })
      .catch(() => setNbExperts(0));
    fetch(`${BASE}/startups/liste`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const valides = Array.isArray(data) ? data.filter((s: any) => s.statut === "valide").length : 0;
        setNbStartups(valides);
      })
      .catch(() => setNbStartups(0));
  };

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (["vision", "mission", "valeurs"].includes(hash)) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    }
    fetch(`${BASE}/histoire`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setHistoire(d); })
      .catch(() => {});
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const timeline = [1, 2, 3, 4, 5, 6].map(n => ({
    year: get(`timeline${n}_year`),
    title: get(`timeline${n}_title`),
    desc: get(`timeline${n}_desc`),
  })).filter(t => t.year && t.title);

  const valeurs = [1, 2, 3].map(n => ({
    titre: get(`valeur${n}_titre`),
    desc: get(`valeur${n}_desc`),
    color: get(`valeur${n}_color`) || "#F7B500",
    icon: n === 1 ? <FaAward /> : n === 2 ? <FaGlobe /> : <FaHandsHelping />,
  }));

  const navServices = [
    { label: tr.nav_services === "Services" ? "Consulting" : "Consulting", slug: "consulting" },
    { label: "Audit sur site", slug: "audit-sur-site" },
    { label: "Accompagnement", slug: "accompagnement" },
    { label: "Formations", slug: "formations" },
  ];

  return (
    <div className="font-[Plus_Jakarta_Sans,sans-serif] text-gray-700 bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes floatY{0%,100%{transform:translateY(-50%) rotate(45deg)}50%{transform:translateY(calc(-50% - 14px)) rotate(45deg)}}
        .diamond-float{animation:floatY 6s ease-in-out infinite}
        @keyframes heroIn{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:translateY(0)}}
        .hero-c>*{animation:heroIn .85s cubic-bezier(.22,1,.36,1) both}
        .hero-c>*:nth-child(1){animation-delay:.10s}
        .hero-c>*:nth-child(2){animation-delay:.22s}
        .hero-c>*:nth-child(3){animation-delay:.35s}
        .hero-c>*:nth-child(4){animation-delay:.48s}
        .hero-c>*:nth-child(5){animation-delay:.60s}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        .shimmer{background:linear-gradient(90deg,#F7B500 0%,#fff8c0 40%,#F7B500 60%,#e6a800 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3.2s linear infinite}
        @keyframes countPop{0%{transform:scale(.85);opacity:0}100%{transform:scale(1);opacity:1}}
        .count-pop{animation:countPop .5s cubic-bezier(.22,1,.36,1) both}
        .nav-link{color:#0A2540;text-decoration:none;font-size:15px;font-weight:500;transition:color .2s}
        .nav-link:hover{color:#F7B500}
        .drop-item{display:block;padding:10px 16px;color:#0A2540;text-decoration:none;font-size:14px;font-weight:600;transition:background .15s;white-space:nowrap}
        .drop-item:hover{background:#FFFBEB}
        .btn-gold{display:inline-flex;align-items:center;gap:8px;background:#F7B500;color:#0A2540;border:none;border-radius:10px;padding:13px 28px;font-weight:800;font-size:15px;cursor:pointer;font-family:inherit;transition:transform .22s,box-shadow .22s,background .22s;text-decoration:none}
        .btn-gold:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(247,181,0,.38);background:#e6a800}
        .btn-outline{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#F7B500;border:2px solid #F7B500;border-radius:10px;padding:13px 28px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit;transition:transform .22s,background .22s;text-decoration:none}
        .btn-outline:hover{transform:translateY(-3px);background:rgba(247,181,0,.1)}
        .btn-conn{border:2px solid #0A2540;color:#0A2540;background:transparent;padding:9px 22px;border-radius:9px;font-weight:700;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-conn:hover{background:#F7B500;border-color:#F7B500;transform:translateY(-2px)}
        .btn-insc{background:#F7B500;color:#0A2540;border:2px solid #F7B500;padding:9px 22px;border-radius:9px;font-weight:800;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-insc:hover{background:#e6a800;transform:translateY(-2px)}
        .val-card{transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s}
        .val-card:hover{transform:translateY(-10px);box-shadow:0 28px 60px rgba(10,37,64,.14)!important}
        .timeline-dot{transition:transform .3s,box-shadow .3s}
        .timeline-item:hover .timeline-dot{transform:scale(1.2);box-shadow:0 0 0 8px rgba(247,181,0,.15)}
        .timeline-item:hover .timeline-box{border-color:rgba(247,181,0,.35)!important}
        .timeline-box{transition:border-color .3s}
        .bc-link{color:rgba(255,255,255,.45);text-decoration:none;font-size:13px;transition:color .2s}
        .bc-link:hover{color:#F7B500}
        #vision,#mission,#valeurs{scroll-margin-top:90px}
        @keyframes langDrop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* HEADER */}
      <header className="bg-white sticky top-0 z-[100]" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
        <div className="max-w-[1280px] mx-auto px-6 h-[82px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="12" fill="#0A2540" />
              <rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15" />
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial,sans-serif">BEH</text>
            </svg>
            <span className="font-black text-[18px] text-[#0A2540] tracking-[-0.4px]">Business <span className="text-[#F7B500]">Expert</span> Hub</span>
          </Link>
          <nav className="flex gap-7 items-center">
            <Link href="/" className="nav-link">{tr.nav_home}</Link>
            <Link href="/a-propos" className="nav-link" style={{ color: "#F7B500", fontWeight: 700 }}>{tr.nav_about}</Link>
            <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <Link href="/services" className="nav-link font-semibold">{tr.nav_services} ▾</Link>
              {servicesOpen && (
                <ul className="absolute top-[calc(100%+8px)] left-0 bg-white rounded-xl list-none p-[6px_0] m-0 z-[200] min-w-[200px]" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid rgba(10,37,64,0.06)" }}>
                  {navServices.map(s => (
                    <li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>
                  ))}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nav-link">{tr.nav_experts}</Link>
            <Link href="/blog" className="nav-link">{tr.nav_blog}</Link>
            <Link href="/contact" className="nav-link">{tr.nav_contact}</Link>
          </nav>
          <div className="flex gap-3 items-center">
            <LangSwitcher lang={lang} setLang={setLang} />
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <Link href="/connexion"><button className="btn-conn">{tr.btn_login}</button></Link>
            <Link href="/inscription"><button className="btn-insc">{tr.btn_signup}</button></Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-[#0A2540] text-white overflow-hidden" style={{ minHeight: 540 }}>
        {[{ w: 420, r: 60, delay: "0s" }, { w: 270, r: 150, delay: "1.4s" }, { w: 150, r: 222, delay: "2.6s" }].map((d, i) => (
          <div key={i} className="diamond-float absolute pointer-events-none" style={{ width: d.w, height: d.w, right: d.r, top: "50%", transform: "translateY(-50%) rotate(45deg)", background: `rgba(255,255,255,${0.045 + i * 0.01})`, border: "1px solid rgba(255,255,255,0.08)", animationDelay: d.delay }} />
        ))}
        <div className="absolute pointer-events-none" style={{ width: 240, height: 240, left: -75, bottom: -75, transform: "rotate(45deg)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
        <div className="absolute pointer-events-none" style={{ top: -80, left: "28%", width: 640, height: 640, borderRadius: "50%", background: "radial-gradient(circle,rgba(247,181,0,0.07) 0%,transparent 65%)" }} />

        <div className="hero-c relative z-10 max-w-[1280px] mx-auto px-8 py-24">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="bc-link">{tr.nav_home}</Link>
            <span className="text-white/30 text-[13px]">/</span>
            <span className="text-[#F7B500] font-semibold text-[13px]">{tr.nav_about}</span>
          </div>
          <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[12px] tracking-[3px] uppercase px-5 py-1.5 rounded-full mb-7">{tr.hero_badge}</span>
          <h1 className="font-black m-0 mb-6 leading-[1.08]" style={{ fontSize: "clamp(42px,6vw,76px)" }}>
            {tr.hero_title} <span className="shimmer">{tr.hero_title_highlight}</span>&nbsp;?
          </h1>
          <p className="text-[17px] text-white/78 max-w-[620px] leading-[1.85] mb-10">{get("description_hero")}</p>
          <div className="flex flex-wrap gap-4">
            <a href="#vision" className="btn-gold">{tr.hero_cta_vision} <FaArrowRight size={12} /></a>
            <a href="#mission" className="btn-outline">{tr.hero_cta_mission} <FaArrowRight size={12} /></a>
            <a href="#valeurs" className="btn-outline">{tr.hero_cta_valeurs} <FaArrowRight size={12} /></a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 px-6 bg-white border-y border-gray-100">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex flex-wrap justify-between items-stretch">
            <div className="flex-1 text-center px-6 py-4 border-r border-gray-100 last:border-r-0">
              <div className="text-5xl font-black text-[#F7B500] mb-2">{get("annee_creation")}</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{tr.stat_creation}</div>
            </div>
            <div className="flex-1 text-center px-6 py-4 border-r border-gray-100 last:border-r-0">
              <div className={`text-5xl font-black text-[#F7B500] mb-2 ${nbExperts !== null ? "count-pop" : ""}`}>
                {nbExperts === null ? (
                  <div className="inline-block w-8 h-8 border-2 border-[#F7B500] border-t-transparent rounded-full animate-spin" />
                ) : (
                  nbExperts
                )}
              </div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{tr.stat_experts}</div>
            </div>
            <div className="flex-1 text-center px-6 py-4">
              <div className={`text-5xl font-black text-[#F7B500] mb-2 ${nbStartups !== null ? "count-pop" : ""}`}>
                {nbStartups === null ? (
                  <div className="inline-block w-8 h-8 border-2 border-[#F7B500] border-t-transparent rounded-full animate-spin" />
                ) : (
                  nbStartups
                )}
              </div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{tr.stat_startups}</div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section id="vision" className="py-24 px-6 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0A2540 0%,#0f3460 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(247,181,0,0.08) 0%,transparent 65%)" }} />

        <div className="max-w-[1200px] mx-auto relative z-10 grid grid-cols-2 gap-16 items-center">
          <FadeUp>
            <span className="inline-block text-[#F7B500] font-bold text-[11px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-6" style={{ border: "1px solid rgba(247,181,0,0.35)" }}>{tr.vision_badge}</span>
            <h2 className="font-black text-white m-0 mb-6 leading-[1.12]" style={{ fontSize: "clamp(32px,4vw,56px)" }}>
              {tr.vision_title} <span className="text-[#F7B500]">{tr.vision_title_highlight}</span> {tr.vision_title_end}
            </h2>
            <p className="text-white/68 text-[16px] leading-[1.88] mb-10">{get("description_vision")}</p>
            <div className="flex flex-col gap-3">
              {[get("vision_point1"), get("vision_point2"), get("vision_point3"), get("vision_point4")].filter(Boolean).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-[#0A2540] flex-shrink-0" style={{ background: "#F7B500" }}><FaCheck /></div>
                  <span className="text-white/80 text-[15px] font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.22}>
            <div className="relative">
              <div className="rounded-[26px] relative overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "48px 40px", backdropFilter: "blur(6px)" }}>
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg,#F7B500,transparent)" }} />
                <FaQuoteLeft style={{ color: "rgba(247,181,0,0.18)", fontSize: 44, marginBottom: 24 }} />
                <blockquote className="text-white/90 text-[19px] font-bold leading-[1.65] m-0 mb-8 italic">
                  &ldquo;{get("citation")}&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-[#F7B500] text-[16px] flex-shrink-0" style={{ background: "linear-gradient(135deg,#0A2540,#1a4080)", border: "2.5px solid rgba(247,181,0,0.4)" }}>
                    {get("citation_auteur").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-black text-[15px]">{get("citation_auteur")}</div>
                    <div className="text-[#F7B500] text-[13px] font-semibold">{get("citation_role")}</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-7 -right-7 w-[110px] h-[110px] rounded-[22px] pointer-events-none" style={{ background: "rgba(247,181,0,0.08)", border: "1px solid rgba(247,181,0,0.15)", transform: "rotate(18deg)" }} />
              <div className="absolute -top-5 -left-5 w-[70px] h-[70px] rounded-[16px] pointer-events-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", transform: "rotate(-12deg)" }} />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* MISSION */}
      <section id="mission" className="py-24 px-6 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#f8faff 0%,#ffffff 55%,#fffdf0 100%)" }}>
        <div className="absolute pointer-events-none rounded-full" style={{ top: -100, left: -100, width: 500, height: 500, background: "radial-gradient(circle,rgba(247,181,0,0.07) 0%,transparent 70%)" }} />
        <div className="max-w-[1200px] mx-auto relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[11px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-5">{tr.mission_badge}</span>
            <h2 className="font-black text-[#0A2540] m-0 mb-4 leading-[1.12]" style={{ fontSize: "clamp(32px,4vw,56px)" }}>
              {tr.mission_title} <span className="text-[#F7B500]">{tr.mission_title_highlight}</span> {tr.mission_title_end}
            </h2>
            <p className="text-gray-500 text-[16px] max-w-[600px] mx-auto leading-[1.8]">{get("mission_desc")}</p>
          </FadeUp>
          <div className="grid grid-cols-3 gap-7">
            {[
              { icon: <FaBullseye />, title: tr.mission_card1_title, color: "#F7B500", desc: tr.mission_card1_desc, items: [tr.mission_card1_item1, tr.mission_card1_item2, tr.mission_card1_item3] },
              { icon: <FaRocket />, title: tr.mission_card2_title, color: "#3B82F6", desc: tr.mission_card2_desc, items: [tr.mission_card2_item1, tr.mission_card2_item2, tr.mission_card2_item3] },
              { icon: <FaChartLine />, title: tr.mission_card3_title, color: "#22C55E", desc: tr.mission_card3_desc, items: [tr.mission_card3_item1, tr.mission_card3_item2, tr.mission_card3_item3] },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.15}>
                <div className="val-card bg-white rounded-[22px] overflow-hidden h-full" style={{ boxShadow: "0 6px 32px rgba(10,37,64,0.07)", border: "1px solid rgba(10,37,64,0.06)" }}>
                  <div className="h-[5px]" style={{ background: `linear-gradient(90deg,${item.color},${item.color}55)` }} />
                  <div style={{ padding: "36px 32px" }}>
                    <div className="w-[64px] h-[64px] rounded-[18px] flex items-center justify-center text-[26px] mb-6" style={{ background: `linear-gradient(135deg,${item.color}22,${item.color}0a)`, border: `1.5px solid ${item.color}44`, color: item.color }}>{item.icon}</div>
                    <h3 className="text-[22px] font-black text-[#0A2540] mb-3">{item.title}</h3>
                    <p className="text-gray-500 leading-[1.8] text-[15px] mb-6">{item.desc}</p>
                    <div className="flex flex-col gap-2.5">
                      {item.items.map((pt, j) => (
                        <div key={j} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white flex-shrink-0" style={{ background: item.color }}><FaCheck /></div>
                          <span className="text-gray-600 text-[13px] font-semibold">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-24 px-6 bg-[#0A2540] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.022) 1px,transparent 1px)", backgroundSize: "38px 38px" }} />
        <div className="max-w-[840px] mx-auto relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="inline-block text-[#F7B500] font-bold text-[11px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-5" style={{ border: "1px solid rgba(247,181,0,0.3)" }}>{tr.timeline_badge}</span>
            <h2 className="font-black text-white m-0 leading-[1.12]" style={{ fontSize: "clamp(30px,4vw,52px)" }}>
              {tr.timeline_title} <span className="text-[#F7B500]">{tr.timeline_title_highlight}</span>
            </h2>
          </FadeUp>
          <div className="relative">
            <div className="absolute left-[27px] top-[28px] bottom-[28px] w-[2px] pointer-events-none" style={{ background: "linear-gradient(to bottom,#F7B500,rgba(247,181,0,0.08))" }} />
            {timeline.map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="timeline-item relative flex gap-7 mb-8 last:mb-0">
                  <div className="flex-shrink-0 relative z-10">
                    <div className="timeline-dot w-[56px] h-[56px] rounded-full flex items-center justify-center font-black text-[#0A2540] text-[13px]" style={{ background: "linear-gradient(135deg,#F7B500,#e6a800)", boxShadow: "0 4px 18px rgba(247,181,0,0.4)" }}>
                      {item.year.slice(2)}
                    </div>
                  </div>
                  <div className="timeline-box flex-1 rounded-[16px] p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[#F7B500] font-black text-[13px]">{item.year}</span>
                      <span className="w-1 h-1 rounded-full bg-white/25" />
                      <span className="text-white font-bold text-[16px]">{item.title}</span>
                    </div>
                    <p className="text-white/52 text-[14px] leading-[1.78] m-0">{item.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* VALEURS */}
      <section id="valeurs" className="py-24 px-6 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#f8faff 0%,#ffffff 100%)" }}>
        <div className="absolute pointer-events-none rounded-full" style={{ bottom: -100, right: -100, width: 520, height: 520, background: "radial-gradient(circle,rgba(247,181,0,0.06) 0%,transparent 70%)" }} />
        <div className="max-w-[1200px] mx-auto relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[11px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-5">{tr.valeurs_badge}</span>
            <h2 className="font-black text-[#0A2540] m-0 mb-4 leading-[1.12]" style={{ fontSize: "clamp(32px,4vw,56px)" }}>
              {tr.valeurs_title} <span className="text-[#F7B500]">{tr.valeurs_title_highlight}</span>
            </h2>
          </FadeUp>
          <div className="grid grid-cols-3 gap-8">
            {valeurs.map((val, i) => (
              <FadeUp key={i} delay={i * 0.18}>
                <div className="val-card bg-white rounded-[24px] overflow-hidden h-full" style={{ boxShadow: "0 6px 32px rgba(10,37,64,0.08)", border: "1px solid rgba(10,37,64,0.06)" }}>
                  <div className="h-[6px]" style={{ background: `linear-gradient(90deg,${val.color},${val.color}55)` }} />
                  <div style={{ padding: "42px 36px" }}>
                    <div className="w-[70px] h-[70px] rounded-[20px] flex items-center justify-center text-[28px] mb-7" style={{ background: `linear-gradient(135deg,${val.color}22,${val.color}0a)`, border: `1.5px solid ${val.color}44`, color: val.color }}>
                      {val.icon}
                    </div>
                    <h3 className="text-[26px] font-black text-[#0A2540] mb-4">{val.titre}</h3>
                    <p className="text-gray-500 leading-[1.82] text-[15px]">{val.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0A2540 0%,#0f3460 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "36px 36px" }} />
        <div className="max-w-[700px] mx-auto relative z-10 text-center">
          <FadeUp>
            <h2 className="font-black text-white m-0 mb-5 leading-[1.12]" style={{ fontSize: "clamp(28px,4vw,48px)" }}>{tr.cta_title}</h2>
            <p className="text-white/65 text-[16px] leading-[1.85] mb-10">{tr.cta_desc}</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/inscription" className="btn-gold">{tr.cta_btn} <FaArrowRight size={12} /></Link>
              <Link href="/contact" className="btn-outline">{tr.cta_btn_contact} <FaArrowRight size={12} /></Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#081B33] text-white pt-16 pb-8 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-4 gap-10 mb-14">
            <div>
              <Link href="/" className="flex items-center gap-3 no-underline mb-5">
                <svg width="40" height="40" viewBox="0 0 46 46" fill="none">
                  <rect width="46" height="46" rx="12" fill="#0A2540" />
                  <rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15" />
                  <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial,sans-serif">BEH</text>
                </svg>
                <span className="font-black text-[15px] text-white">Business <span className="text-[#F7B500]">Expert</span> Hub</span>
              </Link>
              <p className="text-white/38 text-[13px] leading-[1.75]">{tr.foot_desc}</p>
            </div>
            <div>
              <h4 className="text-white font-black text-[13px] uppercase tracking-wider mb-5">{tr.foot_nav}</h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {[
                  [tr.nav_home, "/"],
                  [tr.nav_about, "/a-propos"],
                  [tr.nav_services, "/services"],
                  [tr.nav_experts, "/experts"],
                  [tr.nav_blog, "/blog"],
                  [tr.nav_contact, "/contact"],
                ].map(([label, href]) => (
                  <li key={href}><Link href={href} className="text-white/42 text-[14px] no-underline hover:text-[#F7B500] transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-[13px] uppercase tracking-wider mb-5">{tr.foot_services}</h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {navServices.map(s => (
                  <li key={s.slug}><Link href={`/services/${s.slug}`} className="text-white/42 text-[14px] no-underline hover:text-[#F7B500] transition-colors">{s.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-[13px] uppercase tracking-wider mb-5">{tr.foot_contact}</h4>
              <div className="flex flex-col gap-3 text-white/42 text-[14px] mb-6">
                <span>📧 {get("contact_email")}</span>
                <span>📞 {get("contact_telephone")}</span>
                <span>📍 {get("contact_adresse")}</span>
              </div>
              <div className="flex gap-3">
                {[<FaLinkedin key="li" />, <FaTwitter key="tw" />, <FaEnvelope key="em" />].map((icon, i) => (
                  <div key={i} className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[#F7B500] text-[14px] cursor-pointer transition-all hover:scale-110" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>{icon}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.07] pt-8 flex items-center justify-between flex-wrap gap-4">
            <p className="m-0 text-white/28 text-[13px]">{tr.foot_copy}</p>
            <div className="flex gap-6">
              {[tr.foot_legal, tr.foot_privacy, tr.foot_cgu].map(item => (
                <Link key={item} href="#" className="text-white/28 text-[12px] no-underline hover:text-[#F7B500] transition-colors">{item}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}