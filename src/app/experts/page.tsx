"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaStar, FaArrowRight, FaSearch,
  FaChartLine, FaCode, FaUsers,
  FaLightbulb, FaThLarge, FaLock, FaEnvelope,
  FaCalendarAlt, FaBullhorn,
} from "react-icons/fa";

/* ══════════════════════════════════════
   HOOK SCROLL
══════════════════════════════════════ */
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView] as const;
}

function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(36px)",
      transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>{children}</div>
  );
}

/* ══════════════════════════════════════
   TYPES & DONNÉES
══════════════════════════════════════ */
type Domain = "tous" | "finance" | "marketing" | "management" | "it" | "strategie";

interface Expert {
  id: number;
  initials: string;
  bgColor: string;
  accentColor: string;
  name: string;
  title: string;
  domain: Domain;
  domainLabel: string;
  bio: string;
  tags: string[];
  rating: number;
  reviews: number;
  missions: number;
  xp: string;
  available: boolean;
}

const EXPERTS: Expert[] = [
  {
    id: 1, initials: "SM", bgColor: "#0A2540", accentColor: "#3B82F6",
    name: "Sofia Mansouri", title: "Expert Finance & Levée de fonds",
    domain: "finance", domainLabel: "Finance",
    bio: "Expert en levée de fonds et stratégie financière. Accompagne les startups de la Seed à la Série B avec une approche structurée et orientée résultats.",
    tags: ["Venture Capital", "M&A", "CFO as a Service"],
    rating: 5.0, reviews: 61, missions: 67, xp: "12 ans", available: true,
  },
  {
    id: 2, initials: "KB", bgColor: "#1a1a2e", accentColor: "#F7B500",
    name: "Karim Benali", title: "Expert Marketing Digital",
    domain: "marketing", domainLabel: "Marketing",
    bio: "Spécialiste en growth hacking et acquisition client digital. A multiplié par 5 le trafic de +40 startups grâce à des stratégies SEO et social ads ciblées.",
    tags: ["Growth Hacking", "SEO", "Social Ads"],
    rating: 4.9, reviews: 38, missions: 42, xp: "8 ans", available: true,
  },
  {
    id: 3, initials: "LO", bgColor: "#0A2540", accentColor: "#22C55E",
    name: "Leila Osman", title: "Expert RH & Management",
    domain: "management", domainLabel: "Management",
    bio: "Consultante RH stratégique spécialisée dans la construction d'équipes performantes et la mise en place d'OKR pour startups en phase de croissance.",
    tags: ["Recrutement Tech", "OKR", "Culture d'entreprise"],
    rating: 4.7, reviews: 33, missions: 38, xp: "9 ans", available: true,
  },
  {
    id: 4, initials: "YT", bgColor: "#1a0a2e", accentColor: "#8B5CF6",
    name: "Youssef Tazi", title: "Expert Tech & Produit",
    domain: "it", domainLabel: "IT",
    bio: "CTO freelance spécialisé en architecture SaaS et lancement MVP. A livré +50 produits digitaux de la conception au go-live en mode agile.",
    tags: ["SaaS Architecture", "MVP", "CTO as a Service"],
    rating: 4.8, reviews: 49, missions: 55, xp: "10 ans", available: false,
  },
  {
    id: 5, initials: "NB", bgColor: "#0A2540", accentColor: "#06B6D4",
    name: "Nour Ben Salah", title: "Expert Stratégie & Business",
    domain: "strategie", domainLabel: "Stratégie",
    bio: "Ancienne consultante McKinsey reconvertie dans l'accompagnement startup. Aide les fondateurs à clarifier leur vision et exécuter des stratégies go-to-market efficaces.",
    tags: ["Go-to-Market", "Business Plan", "Board Advisory"],
    rating: 5.0, reviews: 44, missions: 52, xp: "14 ans", available: true,
  },
  {
    id: 6, initials: "AR", bgColor: "#1a1510", accentColor: "#EF4444",
    name: "Amine Rhouma", title: "Expert Juridique & Conformité",
    domain: "strategie", domainLabel: "Stratégie",
    bio: "Avocat d'affaires spécialisé startup. Accompagne les fondateurs dans leurs structurations juridiques, levées de fonds et contrats SaaS complexes.",
    tags: ["Droit des sociétés", "RGPD", "Contrats SaaS"],
    rating: 4.9, reviews: 27, missions: 31, xp: "11 ans", available: true,
  },
  {
    id: 7, initials: "MT", bgColor: "#0A2540", accentColor: "#F59E0B",
    name: "Mehdi Trabelsi", title: "Expert Business Development",
    domain: "marketing", domainLabel: "Marketing",
    bio: "Expert en développement commercial B2B et expansion internationale. A ouvert des marchés Europe, MENA et Afrique subsaharienne pour 25+ startups.",
    tags: ["Sales Strategy", "Partenariats B2B", "CRM"],
    rating: 4.6, reviews: 22, missions: 28, xp: "7 ans", available: false,
  },
  {
    id: 8, initials: "SC", bgColor: "#1a0a18", accentColor: "#EC4899",
    name: "Sana Cherif", title: "Expert Communication & Brand",
    domain: "marketing", domainLabel: "Marketing",
    bio: "Spécialiste en stratégie de marque pour startups Tech. Construit la notoriété et l'image de +20 startups depuis leur phase early-stage.",
    tags: ["Brand Strategy", "Content Marketing", "PR"],
    rating: 4.8, reviews: 19, missions: 24, xp: "6 ans", available: true,
  },
  {
    id: 9, initials: "HM", bgColor: "#0a1a10", accentColor: "#10B981",
    name: "Hichem Mrad", title: "Expert Finance & Contrôle de gestion",
    domain: "finance", domainLabel: "Finance",
    bio: "Directeur financier de transition pour PME et startups. Expert en modélisation financière, tableaux de bord et optimisation de la trésorerie.",
    tags: ["Contrôle de gestion", "Trésorerie", "Reporting CFO"],
    rating: 4.9, reviews: 31, missions: 36, xp: "10 ans", available: true,
  },
];

const DOMAINS: { label: string; value: Domain; icon: React.ReactNode; color: string }[] = [
  { label: "Tous",       value: "tous",       icon: <FaThLarge />,   color: "#0A2540" },
  { label: "Finance",    value: "finance",    icon: <FaChartLine />, color: "#3B82F6" },
  { label: "Marketing",  value: "marketing",  icon: <FaBullhorn />,  color: "#F7B500" },
  { label: "Management", value: "management", icon: <FaUsers />,     color: "#22C55E" },
  { label: "IT",         value: "it",         icon: <FaCode />,      color: "#8B5CF6" },
  { label: "Stratégie",  value: "strategie",  icon: <FaLightbulb />, color: "#06B6D4" },
];

const STATS = [
  { value: "80+",  label: "Experts certifiés"        },
  { value: "4.9★", label: "Note moyenne"              },
  { value: "500+", label: "Missions réalisées"        },
  { value: "48h",  label: "Mise en relation garantie" },
];

const navServices = [
  { label: "Consulting",     slug: "consulting"     },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Accompagnement", slug: "accompagnement" },
  { label: "Formations",     slug: "formations"     },
];

/* ══════════════════════════════════════
   PAGE
══════════════════════════════════════ */
export default function ExpertsPage() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [activeDomain, setActiveDomain] = useState<Domain>("tous");
  const [search, setSearch]             = useState("");
  const [showModal, setShowModal]       = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);

  const filtered = EXPERTS.filter(e => {
    const matchDomain = activeDomain === "tous" || e.domain === activeDomain;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.name.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q));
    return matchDomain && matchSearch;
  });

  function openModal(expert: Expert) {
    setSelectedExpert(expert);
    setShowModal(true);
  }

  return (
    <div className="font-[Plus_Jakarta_Sans,sans-serif] text-gray-700 min-h-screen bg-[#f7f9fc]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }

        /* ── Hero bg zoom ── */
        @keyframes heroExpertZoom {
          0%   { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .hero-expert-bg {
          animation: heroExpertZoom 2s cubic-bezier(.22,1,.36,1) forwards;
        }

        /* ── Hero content staggered fade-in ── */
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hci { animation: heroFadeIn 0.85s cubic-bezier(.22,1,.36,1) both; }
        .hci-1 { animation-delay: 0.15s; }
        .hci-2 { animation-delay: 0.28s; }
        .hci-3 { animation-delay: 0.42s; }
        .hci-4 { animation-delay: 0.58s; }

        @keyframes fadeIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes modalIn {
          from { opacity:0; transform:scale(0.92) translateY(20px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(24px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes ping {
          0%   { transform:scale(1); opacity:.7; }
          100% { transform:scale(1.9); opacity:0; }
        }

        .modal-box   { animation: modalIn .32s cubic-bezier(.22,1,.36,1); }
        .card-appear { animation: cardIn .45s cubic-bezier(.22,1,.36,1) both; }

        .nav-link { color:#0A2540; text-decoration:none; font-size:15px; font-weight:500; transition:color .2s; }
        .nav-link:hover { color:#F7B500; }
        .drop-item { display:block; padding:10px 16px; color:#0A2540; text-decoration:none; font-size:14px; font-weight:600; transition:background .15s; white-space:nowrap; }
        .drop-item:hover { background:#FFFBEB; }
        .btn-conn { border:2px solid #0A2540; color:#0A2540; background:transparent; padding:9px 22px; border-radius:9px; font-weight:700; font-size:14px; cursor:pointer; transition:all .22s; font-family:inherit; }
        .btn-conn:hover { background:#F7B500; border-color:#F7B500; transform:translateY(-2px); }
        .btn-insc { background:#F7B500; color:#0A2540; border:2px solid #F7B500; padding:9px 22px; border-radius:9px; font-weight:800; font-size:14px; cursor:pointer; transition:all .22s; font-family:inherit; }
        .btn-insc:hover { background:#e6a800; transform:translateY(-2px); box-shadow:0 8px 22px rgba(247,181,0,0.38); }

        .domain-pill { display:flex; align-items:center; gap:7px; padding:10px 20px; border-radius:99px; font-size:13.5px; font-weight:700; cursor:pointer; border:2px solid rgba(10,37,64,0.10); background:white; color:#374151; transition:all .22s ease; white-space:nowrap; box-shadow:0 2px 8px rgba(10,37,64,0.05); }
        .domain-pill:hover { border-color:#F7B500; color:#0A2540; background:#FFFBEB; transform:translateY(-2px); box-shadow:0 6px 16px rgba(247,181,0,0.18); }
        .domain-pill.active { background:#0A2540; color:#F7B500; border-color:#0A2540; box-shadow:0 6px 18px rgba(10,37,64,0.25); transform:translateY(-2px); }

        .expert-card { background:white; border-radius:22px; border:1.5px solid rgba(10,37,64,0.07); box-shadow:0 4px 22px rgba(10,37,64,0.07); overflow:hidden; transition:transform .32s cubic-bezier(.22,1,.36,1), box-shadow .32s ease, border-color .32s ease; display:flex; flex-direction:column; }
        .expert-card:hover { transform:translateY(-10px); box-shadow:0 24px 56px rgba(10,37,64,0.14); border-color:rgba(247,181,0,0.4); }
        .expert-card:hover .cta-btn { background:#F7B500 !important; color:#0A2540 !important; }

        .search-box { width:100%; background:white; border:1.5px solid rgba(10,37,64,0.10); border-radius:14px; padding:13px 16px 13px 48px; font-size:15px; color:#0A2540; outline:none; transition:border-color .22s, box-shadow .22s; font-family:'Plus Jakarta Sans',sans-serif; box-shadow:0 2px 10px rgba(10,37,64,0.05); }
        .search-box::placeholder { color:#9CA3AF; }
        .search-box:focus { border-color:#F7B500; box-shadow:0 0 0 4px rgba(247,181,0,0.12); }

        .ping-dot { position:relative; }
        .ping-dot::after { content:''; position:absolute; inset:-3px; border-radius:50%; border:2px solid #22C55E; animation:ping 1.8s ease-out infinite; }
      `}</style>

      {/* ══════════════════════════════
          MODAL
      ══════════════════════════════ */}
      {showModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-6"
          style={{ background: "rgba(10,37,64,0.65)", backdropFilter: "blur(5px)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-box bg-white rounded-3xl w-full max-w-[460px] relative"
            style={{ padding: "52px 44px", boxShadow: "0 32px 80px rgba(10,37,64,0.28)" }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="w-[68px] h-[68px] rounded-full flex items-center justify-center text-[28px] text-[#0A2540] mx-auto mb-6"
              style={{ background: "linear-gradient(135deg,#F7B500,#e6a800)", boxShadow: "0 10px 28px rgba(247,181,0,0.35)" }}
            >
              <FaLock />
            </div>

            {selectedExpert && (
              <div className="flex items-center gap-3 bg-[#f7f9fc] rounded-2xl p-4 mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-black text-[16px] flex-shrink-0"
                  style={{ background: selectedExpert.bgColor, color: selectedExpert.accentColor }}
                >
                  {selectedExpert.initials}
                </div>
                <div>
                  <div className="font-black text-[#0A2540] text-[15px]">{selectedExpert.name}</div>
                  <div className="text-gray-500 text-[12px]">{selectedExpert.title}</div>
                </div>
              </div>
            )}

            <h2 className="text-[22px] font-black text-[#0A2540] mb-2 text-center">Inscription requise</h2>
            <p className="text-gray-500 text-[14px] leading-relaxed mb-8 text-center">
              Pour consulter ce profil, contacter cet expert ou réserver un rendez-vous, créez un compte gratuit ou connectez-vous.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/inscription" onClick={() => setShowModal(false)}>
                <button
                  className="w-full bg-[#F7B500] text-[#0A2540] border-none rounded-xl py-3.5 font-black text-[15px] cursor-pointer transition-all duration-200 hover:bg-[#e6a800] hover:-translate-y-0.5"
                  style={{ fontFamily: "inherit", boxShadow: "0 6px 20px rgba(247,181,0,0.30)" }}
                >
                  Créer un compte gratuit
                </button>
              </Link>
              <Link href="/connexion" onClick={() => setShowModal(false)}>
                <button
                  className="w-full bg-transparent text-[#0A2540] rounded-xl py-3 font-bold text-[15px] cursor-pointer transition-all duration-200 hover:bg-[#0A2540]/[0.05] hover:-translate-y-0.5"
                  style={{ fontFamily: "inherit", border: "1.5px solid rgba(10,37,64,0.15)" }}
                >
                  {"J'ai déjà un compte — Connexion"}
                </button>
              </Link>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-5 bg-transparent border-none text-[24px] text-gray-300 cursor-pointer transition-colors hover:text-gray-600 leading-none"
            >×</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════
          HEADER
      ══════════════════════════════ */}
      <header className="bg-white sticky top-0 z-[100]" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
        <div className="max-w-[1280px] mx-auto px-6 h-[76px] flex items-center justify-between">

          <Link href="/" className="flex items-center gap-3 no-underline">
            <svg width="44" height="44" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="12" fill="#0A2540"/>
              <rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15"/>
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial" letterSpacing="0.5">BEH</text>
            </svg>
            <div className="font-black text-[18px] text-[#0A2540] leading-none tracking-[-0.4px]">
              Business <span className="text-[#F7B500]">Expert</span> Hub
            </div>
          </Link>

          <nav className="flex gap-7 items-center">
            <Link href="/"         className="nav-link">Accueil</Link>
            <Link href="/a-propos" className="nav-link">À propos</Link>
            <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <Link href="/services" className="nav-link font-semibold">Services ▾</Link>
              {servicesOpen && (
                <ul
                  className="absolute top-[calc(100%+8px)] left-0 bg-white rounded-xl list-none p-[6px_0] m-0 z-[200] min-w-[200px]"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid rgba(10,37,64,0.06)", animation: "fadeIn .2s ease" }}
                >
                  {navServices.map(s => (
                    <li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>
                  ))}
                </ul>
              )}
            </div>
            <Link href="/experts" style={{ color: "#F7B500", fontWeight: 700 }} className="nav-link">Experts</Link>
            <Link href="/blog"    className="nav-link">Blog</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
          </nav>

          <div className="flex gap-3">
            <Link href="/connexion">  <button className="btn-conn">Connexion</button>    </Link>
            <Link href="/inscription"><button className="btn-insc">{"S'inscrire"}</button></Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════
          HERO — expert.png en arrière-plan
      ══════════════════════════════ */}
      <section className="relative overflow-hidden text-white" style={{ minHeight: 520 }}>

        {/* Image de fond */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/ex1.jpg"
            alt="Experts background"
            fill
            priority
            className="hero-expert-bg"
            style={{ objectFit: "cover", objectPosition: "center top" }}
            sizes="100vw"
          />
          {/* Overlay dégradé : très opaque à gauche → transparent à droite */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, rgba(10,37,64,0.95) 0%, rgba(10,37,64,0.82) 40%, rgba(10,37,64,0.50) 70%, rgba(10,37,64,0.20) 100%)",
            }}
          />
          {/* Grain subtil */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          {/* Lueur dorée */}
          <div
            className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(247,181,0,0.07) 0%,transparent 65%)" }}
          />
        </div>

        {/* Contenu */}
        <div className="max-w-[1280px] mx-auto px-6 relative z-10" style={{ padding: "88px 24px 110px" }}>

          {/* Breadcrumb */}
          <div className="hci hci-1 flex items-center gap-2 mb-6 text-[13px] text-white/50">
            <Link href="/" className="text-white/50 no-underline hover:text-[#F7B500] transition-colors">Accueil</Link>
            <span>›</span>
            <span className="text-[#F7B500] font-semibold">Nos Experts</span>
          </div>

          <div className="max-w-[680px]">
            <div className="hci hci-2">
              <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[12px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-5">
                Experts certifiés
              </span>
            </div>

            <h1
              className="hci hci-3 font-black m-0 mb-5 leading-[1.1]"
              style={{ fontSize: "clamp(40px,5vw,64px)", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
            >
              Nos <span className="text-[#F7B500]">Experts</span>
            </h1>

            <p className="hci hci-3 text-[17px] text-white/80 leading-[1.8]">
              Des professionnels certifiés pour vous accompagner dans chaque domaine. Trouvez l&apos;expert idéal pour votre startup et accélérez votre croissance.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FILTRES + SEARCH
      ══════════════════════════════ */}
      <section
        className="bg-white border-b border-[#0A2540]/[0.07] sticky top-[76px] z-50"
        style={{ boxShadow: "0 4px 20px rgba(10,37,64,0.06)" }}
      >
        <div className="max-w-[1280px] mx-auto px-6 py-5">
          <div className="flex items-center gap-5 flex-wrap">

            <div className="relative flex-1 min-w-[260px]">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[14px] pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher un expert, une compétence…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-box"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer text-[14px]"
                >✕</button>
              )}
            </div>

            <div className="w-px h-8 bg-[#0A2540]/[0.10] hidden sm:block" />

            <div className="flex items-center gap-2.5 flex-wrap">
              {DOMAINS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setActiveDomain(d.value)}
                  className={`domain-pill${activeDomain === d.value ? " active" : ""}`}
                >
                  <span className="text-[13px]">{d.icon}</span>
                  {d.label}
                  {d.value !== "tous" && (
                    <span className="text-[11px] font-black opacity-60">
                      ({EXPERTS.filter(e => e.domain === d.value).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          GRILLE EXPERTS
      ══════════════════════════════ */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">

        <FadeUp className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="font-black text-[#0A2540] m-0 mb-1.5" style={{ fontSize: "clamp(22px,3vw,32px)" }}>
              {activeDomain === "tous" ? "Tous nos experts" : `Experts en ${DOMAINS.find(d => d.value === activeDomain)?.label}`}
            </h2>
            <p className="text-gray-500 text-[15px] m-0">
              <span className="font-black text-[#0A2540]">{filtered.length}</span> expert{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
              {search && <span> pour &ldquo;<span className="text-[#F7B500] font-bold">{search}</span>&rdquo;</span>}
            </p>
          </div>
          <Link href="/inscription">
            <button
              className="inline-flex items-center gap-2 bg-[#0A2540] text-white border-none rounded-xl px-6 py-3 font-bold text-[14px] cursor-pointer transition-all duration-200 hover:bg-[#F7B500] hover:text-[#0A2540] hover:-translate-y-0.5"
              style={{ fontFamily: "inherit", boxShadow: "0 4px 16px rgba(10,37,64,0.20)" }}
            >
              Devenir expert <FaArrowRight size={12} />
            </button>
          </Link>
        </FadeUp>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-[56px] mb-4">🔍</div>
            <h3 className="text-[20px] font-black text-[#0A2540] mb-2">Aucun expert trouvé</h3>
            <p className="text-gray-500 text-[15px]">Essayez un autre terme de recherche ou sélectionnez un autre domaine.</p>
            <button
              onClick={() => { setSearch(""); setActiveDomain("tous"); }}
              className="mt-6 inline-flex items-center gap-2 bg-[#F7B500] text-[#0A2540] border-none rounded-xl px-6 py-3 font-bold text-[14px] cursor-pointer"
              style={{ fontFamily: "inherit" }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-7">
            {filtered.map((expert, i) => (
              <FadeUp key={expert.id} delay={i * 0.08}>
                <ExpertCard expert={expert} onContact={() => openModal(expert)} />
              </FadeUp>
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════════════════
          CTA BAS DE PAGE
      ══════════════════════════════ */}
      <section className="bg-[#0A2540] py-20 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(247,181,0,0.07) 0%,transparent 65%)" }}
        />

        <FadeUp className="max-w-[640px] mx-auto text-center relative z-10">
          <span className="inline-block border border-[#F7B500]/35 text-[#F7B500] font-bold text-[12px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-6">
            Rejoignez-nous
          </span>
          <h2 className="font-black text-white m-0 mb-4 leading-[1.15]" style={{ fontSize: "clamp(28px,4vw,46px)" }}>
            Vous êtes expert ?<br />
            <span className="text-[#F7B500]">Rejoignez notre réseau</span>
          </h2>
          <p className="text-white/55 text-[16px] leading-relaxed mb-10">
            Intégrez la plateforme Business Expert Hub et connectez-vous avec des startups qui ont besoin de vos compétences.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/inscription">
              <button
                className="inline-flex items-center gap-2 bg-[#F7B500] text-[#0A2540] border-none rounded-xl px-8 py-4 font-black text-[15px] cursor-pointer transition-all duration-200 hover:bg-[#e6a800] hover:-translate-y-0.5"
                style={{ fontFamily: "inherit", boxShadow: "0 8px 24px rgba(247,181,0,0.35)" }}
              >
                Candidater comme expert <FaArrowRight size={14} />
              </button>
            </Link>
            <Link href="/contact">
              <button
                className="inline-flex items-center gap-2 bg-transparent text-white border border-white/25 rounded-xl px-8 py-4 font-bold text-[15px] cursor-pointer transition-all duration-200 hover:border-white/60 hover:-translate-y-0.5"
                style={{ fontFamily: "inherit" }}
              >
                En savoir plus
              </button>
            </Link>
          </div>
        </FadeUp>
      </section>

      {/* ══════════════════════════════
          FOOTER
      ══════════════════════════════ */}
      <footer className="bg-[#081B33] text-white py-8 px-6 text-center">
        <p className="m-0 mb-2 text-[14px] font-semibold">© 2026 Business Expert Hub</p>
        <p className="text-white/40 text-[13px] m-0">Plateforme de mise en relation startups &amp; experts</p>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════
   COMPOSANT CARTE EXPERT
══════════════════════════════════════ */
function ExpertCard({ expert, onContact }: { expert: Expert; onContact: () => void }) {
  return (
    <div className="expert-card card-appear h-full">

      <div className="h-[5px]" style={{ background: `linear-gradient(90deg,${expert.accentColor},transparent)` }} />

      <div className="relative px-6 pt-6 pb-5">
        <div className="absolute top-5 right-5">
          {expert.available ? (
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 ping-dot" />
              <span className="text-green-700 text-[11px] font-bold">Disponible</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
              <span className="text-gray-500 text-[11px] font-bold">Occupé</span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-4">
          <div
            className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center font-black text-[22px] flex-shrink-0"
            style={{
              background: `linear-gradient(135deg,${expert.bgColor},${expert.bgColor}dd)`,
              color: expert.accentColor,
              border: `2px solid ${expert.accentColor}30`,
            }}
          >
            {expert.initials}
          </div>
          <div className="min-w-0 pt-1">
            <h3 className="font-black text-[#0A2540] text-[16px] m-0 mb-0.5 leading-snug">{expert.name}</h3>
            <p className="text-gray-500 text-[13px] font-semibold m-0 leading-snug">{expert.title}</p>
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-[10px]" style={{ color: i < Math.round(expert.rating) ? "#F7B500" : "#E5E7EB" }} />
              ))}
              <span className="text-[12px] font-bold text-[#0A2540] ml-1">{expert.rating.toFixed(1)}</span>
              <span className="text-[12px] text-gray-400 ml-0.5">({expert.reviews} avis)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mb-4">
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[1px]"
          style={{ background: `${expert.accentColor}15`, color: expert.accentColor }}
        >
          {expert.domainLabel}
        </span>
      </div>

      <div className="px-6 flex-1">
        <p className="text-gray-600 text-[13.5px] leading-[1.7] m-0 mb-5">{expert.bio}</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {expert.tags.map(t => (
            <span key={t} className="text-[11px] font-bold px-2.5 py-1 rounded-full text-gray-600"
              style={{ background: "rgba(10,37,64,0.06)" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { v: expert.missions, l: "Missions"   },
            { v: expert.xp,       l: "Expérience" },
            { v: expert.reviews,  l: "Avis"       },
          ].map(s => (
            <div key={s.l} className="bg-[#f7f9fc] rounded-xl py-2.5 text-center border border-[#0A2540]/[0.05]">
              <div className="font-black text-[#0A2540] text-[14px] leading-none">{s.v}</div>
              <div className="text-gray-400 text-[10px] font-semibold mt-0.5 uppercase tracking-[0.5px]">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onContact}
            className="cta-btn flex-1 bg-[#0A2540] text-white border-none rounded-xl py-[11px] font-bold text-[13px] cursor-pointer flex items-center justify-center gap-2 transition-all duration-250"
            style={{ fontFamily: "inherit" }}
          >
            Voir le profil <FaArrowRight size={11} />
          </button>
          <button
            onClick={onContact}
            className="w-11 h-11 bg-[#f7f9fc] border border-[#0A2540]/[0.08] rounded-xl flex items-center justify-center text-gray-500 cursor-pointer transition-all duration-200 hover:bg-[#F7B500] hover:text-[#0A2540] hover:border-[#F7B500] flex-shrink-0"
            title="Contacter"
          >
            <FaEnvelope size={13} />
          </button>
          <button
            onClick={onContact}
            className="w-11 h-11 bg-[#f7f9fc] border border-[#0A2540]/[0.08] rounded-xl flex items-center justify-center text-gray-500 cursor-pointer transition-all duration-200 hover:bg-[#F7B500] hover:text-[#0A2540] hover:border-[#F7B500] flex-shrink-0"
            title="Prendre rendez-vous"
          >
            <FaCalendarAlt size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}