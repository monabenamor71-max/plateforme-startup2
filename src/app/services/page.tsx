"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FaChartLine, FaSearchPlus, FaHandsHelping, FaGraduationCap,
  FaArrowRight, FaCheckCircle, FaGlobe, FaChevronDown, FaCheck,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

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
    hero_badge: "Notre offre",
    hero_title: "Nos",
    hero_title_highlight: "Services",
    hero_desc: "Notre plateforme propose une diversité de services destinés à accompagner les entreprises et les particuliers, grâce à l’intervention d’experts qualifiés dans différents domaines.",
    stats_services: "Services disponibles",
    stats_experts: "Experts certifiés",
    stats_startups: "Startups accompagnées",
    // Section
    section_title: "Choisissez votre",
    section_title_highlight: "service",
    section_desc: "Des solutions sur mesure pour accompagner votre startup à chaque étape de sa croissance",
    // Cards
    card_consulting_title: "Consulting",
    card_consulting_desc: "Accompagnement personnalisé des entreprises et des clients pour améliorer leur performance à travers une approche structurée et orientée résultats.",
    card_consulting_point1: "Analyse des besoins et définition des objectifs",
    card_consulting_point2: "Élaboration d'une stratégie et plan d'action",
    card_consulting_point3: "Suivi de la mise en œuvre et optimisation",
    card_audit_title: "Audit sur site",
    card_audit_desc: "Évaluation complète de vos activités et processus directement sur site afin d’identifier les axes d’amélioration et garantir la conformité.",
    card_audit_point1: "Analyse initiale et cadrage de la mission",
    card_audit_point2: "Audit terrain et collecte des données",
    card_audit_point3: "Rapport détaillé avec recommandations",
    card_plateformes_title: "Nos plateformes",
    card_plateformes_desc: "Nous accompagnons les clients dans la conception et le développement de plateformes digitales et d’applications performantes, évolutives et adaptées à leurs besoins spécifiques.",
    card_plateformes_point1: "Conception et développement de plateformes web",
    card_plateformes_point2: "Création d'applications mobiles et systèmes métiers",
    card_plateformes_point3: "Intégration et optimisation des solutions digitales",
    card_formations_title: "Formations",
    card_formations_desc: "Programmes certifiants sur mesure pour vos équipes + podcasts exclusifs avec des experts et investisseurs.",
    card_formations_point1: "Présentiel & distanciel",
    card_formations_point2: "Certifications reconnues",
    card_formations_point3: "Podcasts & masterclasses",
    card_btn: "Voir le service",
    // Footer
    footer_copy: "© 2026 Business Expert Hub",
    footer_tagline: "Plateforme de mise en relation startups & experts — Tarifs en Dinar Tunisien (DT)",
  },
  en: {
    nav_home: "Home",
    nav_about: "About",
    nav_services: "Services",
    nav_experts: "Experts",
    nav_blog: "Blog",
    nav_contact: "Contact",
    btn_login: "Login",
    btn_signup: "Sign up",
    hero_badge: "Our offer",
    hero_title: "Our",
    hero_title_highlight: "Services",
    hero_desc: "Our platform offers a variety of services designed to support companies and individuals, through the intervention of qualified experts in various fields.",
    stats_services: "Services available",
    stats_experts: "Certified experts",
    stats_startups: "Startups supported",
    section_title: "Choose your",
    section_title_highlight: "service",
    section_desc: "Tailored solutions to support your startup at every stage of its growth",
    card_consulting_title: "Consulting",
    card_consulting_desc: "Personalized support for companies and clients to improve their performance through a structured and results-oriented approach.",
    card_consulting_point1: "Needs analysis and goal setting",
    card_consulting_point2: "Strategy development and action plan",
    card_consulting_point3: "Implementation monitoring and optimization",
    card_audit_title: "On-site Audit",
    card_audit_desc: "Complete evaluation of your activities and processes directly on site to identify areas for improvement and ensure compliance.",
    card_audit_point1: "Initial analysis and mission scoping",
    card_audit_point2: "Field audit and data collection",
    card_audit_point3: "Detailed report with recommendations",
    card_plateformes_title: "Our platforms",
    card_plateformes_desc: "We support clients in the design and development of high-performance, scalable digital platforms and applications tailored to their specific needs.",
    card_plateformes_point1: "Web platform design and development",
    card_plateformes_point2: "Mobile app and business system creation",
    card_plateformes_point3: "Digital solution integration and optimization",
    card_formations_title: "Trainings",
    card_formations_desc: "Custom certified programs for your teams + exclusive podcasts with experts and investors.",
    card_formations_point1: "In-person & remote",
    card_formations_point2: "Recognized certifications",
    card_formations_point3: "Podcasts & masterclasses",
    card_btn: "View service",
    footer_copy: "© 2026 Business Expert Hub",
    footer_tagline: "Startup & expert matching platform — Prices in Tunisian Dinar (DT)",
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

  const LANGS: { code: Lang; flag: string; label: string; short: string }[] = [
    { code: "fr", flag: "🇫🇷", label: "Français", short: "FR" },
    { code: "en", flag: "🇬🇧", label: "English",  short: "EN" },
  ];

  const current = LANGS.find(l => l.code === lang)!;

  function select(code: Lang) {
    setLang(code);
    setOpen(false);
    if (typeof window !== "undefined") localStorage.setItem("beh_lang", code);
  }

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          background: open ? "#F7F9FC" : "#fff",
          border: `1.5px solid ${open ? "#0A2540" : "#E2EAF4"}`,
          borderRadius: 10, padding: "7px 13px",
          cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
          fontSize: 13, fontWeight: 700, color: "#0A2540",
          transition: "all .18s", outline: "none",
          boxShadow: open ? "0 4px 16px rgba(10,37,64,.10)" : "none",
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.borderColor = "#0A2540"; e.currentTarget.style.background = "#F7F9FC"; } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = "#E2EAF4"; e.currentTarget.style.background = "#fff"; } }}
      >
        <span style={{
          width: 22, height: 22, borderRadius: 6,
          background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, lineHeight: 1, flexShrink: 0,
        }}>{current.flag}</span>
        <span style={{ letterSpacing: ".5px" }}>{current.short}</span>
        <FaChevronDown size={9} style={{ color: "#94A3B8", transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          background: "#fff", borderRadius: 14,
          boxShadow: "0 16px 48px rgba(10,37,64,.16)",
          border: "1.5px solid #EEF2F7",
          overflow: "hidden", minWidth: 160, zIndex: 400,
          animation: "langDrop .18s cubic-bezier(.22,1,.36,1)",
        }}>
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => select(l.code)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "11px 16px", background: l.code === lang ? "#F7F9FC" : "transparent",
                border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif",
                fontSize: 14, fontWeight: l.code === lang ? 700 : 500,
                color: l.code === lang ? "#0A2540" : "#475569",
                transition: "background .15s,color .15s", textAlign: "left",
              }}
              onMouseEnter={e => { if (l.code !== lang) e.currentTarget.style.background = "#F8FAFC"; }}
              onMouseLeave={e => { if (l.code !== lang) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: 7,
                background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, flexShrink: 0,
              }}>{l.flag}</span>
              <span style={{ flex: 1 }}>{l.label}</span>
              {l.code === lang && (
                <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaCheck size={8} style={{ color: "#F7B500" }} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== HOOKS ====================

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, inView] as const;
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, inView] = useInView();
  return <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(44px)", transition: `opacity .75s cubic-bezier(.22,1,.36,1) ${delay}s,transform .75s cubic-bezier(.22,1,.36,1) ${delay}s` }}>{children}</div>;
}

// ==================== PAGE SERVICES ====================

export default function ServicesPage() {
  const [lang, setLang] = useState<Lang>("fr");
  const [open, setOpen] = useState(false);
  const [nbExperts, setNbExperts] = useState<number | null>(null);
  const [nbStartups, setNbStartups] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("beh_lang") as Lang | null;
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);

  const tr = T[lang];

  // Charger les statistiques (experts et startups validés)
  useEffect(() => {
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
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Données des services avec traductions
  const servicesData = [
    {
      slug: "consulting",
      icon: <FaChartLine />,
      color: "#3B82F6",
      badge: "Stratégie",
      title: tr.card_consulting_title,
      desc: tr.card_consulting_desc,
      points: [tr.card_consulting_point1, tr.card_consulting_point2, tr.card_consulting_point3]
    },
    {
      slug: "audit-sur-site",
      icon: <FaSearchPlus />,
      color: "#8B5CF6",
      badge: "Terrain",
      title: tr.card_audit_title,
      desc: tr.card_audit_desc,
      points: [tr.card_audit_point1, tr.card_audit_point2, tr.card_audit_point3]
    },
    {
      slug: "nos-plateformes",
      icon: <FaHandsHelping />,
      color: "#F7B500",
      badge: "Suivi continu",
      title: tr.card_plateformes_title,
      desc: tr.card_plateformes_desc,
      points: [tr.card_plateformes_point1, tr.card_plateformes_point2, tr.card_plateformes_point3]
    },
    {
      slug: "formations",
      icon: <FaGraduationCap />,
      color: "#22C55E",
      badge: "Certif.",
      title: tr.card_formations_title,
      desc: tr.card_formations_desc,
      points: [tr.card_formations_point1, tr.card_formations_point2, tr.card_formations_point3]
    }
  ];

  return (
    <div className="font-[Plus_Jakarta_Sans,sans-serif] text-gray-700 bg-[#fafbff]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes floatY{0%,100%{transform:translateY(-50%) rotate(45deg)}50%{transform:translateY(calc(-50% - 14px)) rotate(45deg)}}
        @keyframes fadeSlideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes langDrop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .diamond-float{animation:floatY 7s ease-in-out infinite}
        .svc-card{background:white;border-radius:22px;border:1.5px solid rgba(10,37,64,0.07);box-shadow:0 4px 24px rgba(10,37,64,0.07);overflow:hidden;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s,border-color .35s;display:flex;flex-direction:column;height:100%;}
        .svc-card:hover{transform:translateY(-10px);box-shadow:0 24px 56px rgba(10,37,64,0.14);border-color:rgba(247,181,0,0.38)}
        .svc-card:hover .card-btn{background:#F7B500!important;color:#0A2540!important;}
        .svc-card:hover .arrow-ic{transform:translateX(5px)}
        .arrow-ic{transition:transform .25s}
        .drop-item{display:flex;align-items:center;gap:10px;padding:10px 18px;color:#0A2540;text-decoration:none;font-size:14px;font-weight:600;transition:background .15s}
        .drop-item:hover{background:#FFFBEB}
        .btn-conn{border:2px solid #0A2540;color:#0A2540;background:transparent;padding:9px 22px;border-radius:9px;font-weight:700;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-conn:hover{background:#F7B500;border-color:#F7B500;transform:translateY(-2px)}
        .btn-insc{background:#F7B500;color:#0A2540;border:2px solid #F7B500;padding:9px 22px;border-radius:9px;font-weight:800;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-insc:hover{background:#e6a800;transform:translateY(-2px)}
      `}</style>

      {/* HEADER */}
      <header className="bg-white sticky top-0 z-[100]" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <svg width="44" height="44" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="12" fill="#0A2540"/><rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial">BEH</text></svg>
            <div className="font-black text-[18px] text-[#0A2540]">Business <span className="text-[#F7B500]">Expert</span> Hub</div>
          </Link>
          <nav className="flex gap-7 items-center">
            <Link href="/" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">{tr.nav_home}</Link>
            <Link href="/a-propos" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">{tr.nav_about}</Link>
            <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
              <span className="text-[#F7B500] font-bold text-[15px] cursor-pointer">{tr.nav_services} ▾</span>
              {open && <ul className="absolute top-full left-0 bg-white rounded-xl min-w-[220px] list-none p-[8px_0] m-0 z-[200]" style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)", animation: "fadeSlideDown .2s ease" }}>
                {servicesData.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item"><span style={{ color: s.color, fontSize: 15 }}>{s.icon}</span>{s.title}</Link></li>)}
              </ul>}
            </div>
            <Link href="/experts" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">{tr.nav_experts}</Link>
            <Link href="/blog" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">{tr.nav_blog}</Link>
            <Link href="/contact" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">{tr.nav_contact}</Link>
          </nav>
          <div className="flex gap-3 items-center">
            <LangSwitcher lang={lang} setLang={setLang} />
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <Link href="/connexion"><button className="btn-conn">{tr.btn_login}</button></Link>
            <Link href="/inscription"><button className="btn-insc">{tr.btn_signup}</button></Link>
          </div>
        </div>
      </header>

      {/* HERO AVEC STATISTIQUES DYNAMIQUES */}
      <section className="text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0A2540 0%,#0d3060 60%,#081B33 100%)", padding: "80px 24px 90px" }}>
        {[{ w: 360, r: -60, d: "0s" }, { w: 220, r: 80, d: "1.4s" }, { w: 120, r: 130, d: "0.7s" }].map((d, i) => (
          <div key={i} className="diamond-float absolute pointer-events-none" style={{ width: d.w, height: d.w, right: d.r, top: "50%", transform: "translateY(-50%) rotate(45deg)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", animationDelay: d.d }} />
        ))}
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-6 text-[13px] text-white/50">
            <Link href="/" className="text-white/50 no-underline hover:text-[#F7B500]">{tr.nav_home}</Link><span>›</span>
            <span className="text-[#F7B500] font-semibold">{tr.nav_services}</span>
          </div>
          <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[12px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-[22px]">{tr.hero_badge}</span>
          <h1 className="font-black m-0 mb-5 leading-[1.1]" style={{ fontSize: "clamp(36px,5vw,60px)" }}>{tr.hero_title} <span className="text-[#F7B500]">{tr.hero_title_highlight}</span></h1>
          <p className="text-[18px] text-white/75 max-w-[620px] leading-[1.75] m-0">{tr.hero_desc}</p>
          <div className="flex gap-10 mt-11 flex-wrap">
            <div><div className="text-[32px] font-black text-[#F7B500]">4</div><div className="text-[13px] text-white/50 mt-[3px]">{tr.stats_services}</div></div>
            <div>
              <div className="text-[32px] font-black text-[#F7B500]">
                {nbExperts !== null ? nbExperts : <span className="inline-block w-6 h-6 border-2 border-[#F7B500] border-t-transparent rounded-full animate-spin" />}
              </div>
              <div className="text-[13px] text-white/50 mt-[3px]">{tr.stats_experts}</div>
            </div>
            <div>
              <div className="text-[32px] font-black text-[#F7B500]">
                {nbStartups !== null ? nbStartups : <span className="inline-block w-6 h-6 border-2 border-[#F7B500] border-t-transparent rounded-full animate-spin" />}
              </div>
              <div className="text-[13px] text-white/50 mt-[3px]">{tr.stats_startups}</div>
            </div>
          </div>
        </div>
      </section>

      {/* GRILLE DES SERVICES */}
      <section className="py-[90px] px-6 max-w-[1200px] mx-auto">
        <FadeUp><div className="text-center mb-16">
          <h2 className="font-black text-[#0A2540] m-0 mb-3.5" style={{ fontSize: "clamp(28px,3.5vw,44px)" }}>{tr.section_title} <span className="text-[#F7B500]">{tr.section_title_highlight}</span></h2>
          <p className="text-gray-500 text-[15px] max-w-[560px] mx-auto">{tr.section_desc}</p>
        </div></FadeUp>
        <div className="grid grid-cols-2 gap-8">
          {servicesData.map((svc, i) => (
            <FadeUp key={svc.slug} delay={i * 0.1}>
              <Link href={`/services/${svc.slug}`} className="no-underline block h-full">
                <div className="svc-card h-full">
                  <div className="h-[5px]" style={{ background: `linear-gradient(90deg,${svc.color},transparent)` }} />
                  <div className="flex-1 flex flex-col" style={{ padding: "36px 32px" }}>
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-[62px] h-[62px] rounded-2xl flex items-center justify-center text-[26px]" style={{ background: `linear-gradient(135deg,${svc.color}22,${svc.color}44)`, color: svc.color, border: `1.5px solid ${svc.color}33` }}>{svc.icon}</div>
                      <div className="flex items-center gap-3">
                        <span className="bg-[#0A2540]/[0.06] text-gray-500 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-[1px]">{svc.badge}</span>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${svc.color}15`, border: `1.5px solid ${svc.color}30` }}>
                          <FaArrowRight className="arrow-ic text-[11px]" style={{ color: svc.color }} />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-[22px] font-black text-[#0A2540] m-0 mb-3">{svc.title}</h3>
                    <p className="text-gray-500 leading-[1.75] text-[15px] mb-6 flex-1">{svc.desc}</p>
                    <ul className="list-none p-0 m-0 mb-7 flex flex-col gap-2.5">
                      {svc.points.map((p, j) => (
                        <li key={j} className="flex items-center gap-2 text-[13px] text-gray-700 font-semibold">
                          <FaCheckCircle className="flex-shrink-0 text-[12px]" style={{ color: svc.color }} />{p}
                        </li>
                      ))}
                    </ul>
                    <div className="card-btn self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] font-bold text-[14px] text-white" style={{ background: "#0A2540" }}>
                      {tr.card_btn} <FaArrowRight className="arrow-ic" size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#081B33] text-white py-7 px-6 text-center">
        <p className="m-0 mb-1.5 text-[14px]">{tr.footer_copy}</p>
        <p className="text-white/40 text-[13px] m-0">{tr.footer_tagline}</p>
      </footer>
    </div>
  );
}