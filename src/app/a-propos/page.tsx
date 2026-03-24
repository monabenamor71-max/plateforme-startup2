"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import Link from "next/link";
import {
  FaBullseye,
  FaRocket,
  FaHandsHelping,
  FaStar,
  FaArrowRight,
  FaUsers,
  FaAward,
  FaChartLine,
  FaGlobe,
  FaCheck,
  FaQuoteLeft,
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
} from "react-icons/fa";

/* ══════════════════════════════════════════
   HOOK INVIEW
══════════════════════════════════════════ */
function useInView(threshold = 0.12): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0px)" : "translateY(44px)",
        transition: `opacity 0.78s cubic-bezier(.22,1,.36,1) ${delay}s,
                     transform 0.78s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════
   DONNÉES
══════════════════════════════════════════ */
const navServices = [
  { label: "Consulting",     slug: "consulting"     },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Accompagnement", slug: "accompagnement" },
  { label: "Formations",     slug: "formations"     },
  
];

const stats = [
  { num: "2019",  label: "Année de création",      icon: <FaAward />     },
  { num: "200+",  label: "Startups accompagnées",  icon: <FaUsers />     },
  { num: "50+",   label: "Experts certifiés",      icon: <FaStar />      },
  { num: "94%",   label: "Taux de satisfaction",   icon: <FaStar />      },
];

const timeline = [
  { year: "2019", title: "Fondation",         desc: "Création de Business Expert Hub par une équipe de consultants passionnés par l'écosystème startup et convaincus que l'expertise doit être accessible à tous." },
  { year: "2020", title: "Premiers succès",   desc: "Accompagnement de nos 20 premières startups et constitution d'un réseau d'experts certifiés dans les domaines Finance, Marketing et Tech." },
  { year: "2021", title: "Expansion digitale",desc: "Lancement de la plateforme digitale et ouverture à l'international avec des partenaires en Europe et en Afrique subsaharienne." },
  { year: "2022", title: "Reconnaissance",    desc: "Obtention du label « Meilleure plateforme d'accompagnement startup » et dépassement des 50 missions réussies." },
  { year: "2023", title: "Scale-up",          desc: "Dépassement des 100 startups accompagnées et lancement des programmes de formation certifiants pour fondateurs et équipes." },
  { year: "2024", title: "Leader régional",   desc: "Consolidation de notre position de référence : 200+ startups, 50+ experts, 12M€ de levées facilitées dans 15+ pays." },
];

const team = [
  { name: "Ahmed Benslimane", role: "CEO & Co-fondateur",         xp: "15 ans", initials: "AB", tags: ["Stratégie", "Finance"],  quote: "L'expertise doit être le moteur de chaque startup ambitieuse." },
  { name: "Sara El Idrissi",  role: "COO & Co-fondatrice",        xp: "12 ans", initials: "SE", tags: ["Opérations", "RH"],      quote: "La structure opérationnelle est la colonne vertébrale du succès." },
  { name: "Mehdi Fassi",      role: "CTO",                        xp: "10 ans", initials: "MF", tags: ["Tech", "Produit"],       quote: "La technologie bien utilisée multiplie l'impact humain." },
  { name: "Nadia Chraibi",    role: "Directrice Partenariats",    xp: "9 ans",  initials: "NC", tags: ["BizDev", "VC"],          quote: "Les bonnes connexions changent la trajectoire d'une startup." },
];

const valuesDetails = [
  {
    icon: <FaAward />,
    title: "Excellence",
    color: "#F7B500",
  
    desc: "Nous sélectionnons rigoureusement chaque expert pour garantir un niveau d'accompagnement exceptionnel. La qualité n'est pas un objectif — c'est notre standard minimum.",
    points: [
      "Certification obligatoire pour chaque expert",
      "Évaluation continue des missions et résultats",
      "Processus qualité rigoureux à chaque étape",
    ],
  },
  {
    icon: <FaGlobe />,
    title: "Transparence",
    color: "#22C55E",
   
    desc: "Chaque interaction, chaque contrat, chaque résultat est documenté et partagé. Nous croyons que la confiance durable se construit dans la clarté totale.",
    points: [
      "Reporting détaillé de chaque mission",
      "Tarification claire sans surprise",
      "Feedback bidirectionnel systématique",
    ],
  },
  {
    icon: <FaHandsHelping />,
    title: "Engagement",
    color: "#3B82F6",
    badge: "",
    desc: "Votre succès est notre succès. Nous nous impliquons bien au-delà de la prestation pour devenir de véritables partenaires de votre croissance à long terme.",
    points: [
      "Suivi post-mission inclus dans chaque contrat",
      "Réseau activé pour chaque client",
      "Objectifs partagés et mesurables",
    ],
  },
];

const partners = [
  { name: "TechVentures",  sector: "Fonds d'investissement" },
  { name: "InnoHub",       sector: "Incubateur" },
  { name: "StartupNation", sector: "Accélérateur" },
  { name: "CapitalGrow",   sector: "Private Equity" },
  { name: "AfricaTech",    sector: "Réseau startup" },
  { name: "EuroFund",      sector: "Financement EU" },
  { name: "DigitalNext",   sector: "Transformation digitale" },
  { name: "GrowthLab",     sector: "Studio de croissance" },
];

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
export default function APropos() {
  const [servicesOpen, setServicesOpen] = useState(false);

  /* Scroll vers l'ancre au chargement */
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (["vision", "mission", "valeurs"].includes(hash)) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    }
  }, []);

  return (
    <div className="font-[Plus_Jakarta_Sans,sans-serif] text-gray-700 bg-white">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        @keyframes floatY {
          0%,100% { transform: translateY(-50%) rotate(45deg); }
          50%      { transform: translateY(calc(-50% - 14px)) rotate(45deg); }
        }
        .diamond-float { animation: floatY 6s ease-in-out infinite; }

        @keyframes heroIn {
          from { opacity:0; transform:translateY(36px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        .hero-c > * { animation: heroIn .85s cubic-bezier(.22,1,.36,1) both; }
        .hero-c > *:nth-child(1){ animation-delay:.10s; }
        .hero-c > *:nth-child(2){ animation-delay:.22s; }
        .hero-c > *:nth-child(3){ animation-delay:.35s; }
        .hero-c > *:nth-child(4){ animation-delay:.48s; }
        .hero-c > *:nth-child(5){ animation-delay:.60s; }

        @keyframes shimmer {
          0%  { background-position: -200% center; }
          100%{ background-position:  200% center; }
        }
        .shimmer {
          background: linear-gradient(90deg,#F7B500 0%,#fff8c0 40%,#F7B500 60%,#e6a800 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3.2s linear infinite;
        }

        @keyframes marquee {
          0%  { transform:translateX(0); }
          100%{ transform:translateX(-50%); }
        }
        .marquee-track {
          display:flex; gap:20px; width:max-content;
          animation: marquee 28s linear infinite;
        }
        .marquee-track:hover{ animation-play-state:paused; }

        /* Nav */
        .nav-link{ color:#0A2540; text-decoration:none; font-size:15px; font-weight:500; transition:color .2s; }
        .nav-link:hover{ color:#F7B500; }
        .drop-item{ display:block; padding:10px 16px; color:#0A2540; text-decoration:none; font-size:14px; font-weight:600; transition:background .15s; white-space:nowrap; }
        .drop-item:hover{ background:#FFFBEB; }

        /* Buttons */
        .btn-gold{
          display:inline-flex; align-items:center; gap:8px;
          background:#F7B500; color:#0A2540; border:none; border-radius:10px;
          padding:13px 28px; font-weight:800; font-size:15px; cursor:pointer; font-family:inherit;
          transition:transform .22s ease, box-shadow .22s ease, background .22s ease;
          text-decoration:none;
        }
        .btn-gold:hover{ transform:translateY(-3px); box-shadow:0 10px 30px rgba(247,181,0,.38); background:#e6a800; }

        .btn-outline{
          display:inline-flex; align-items:center; gap:8px;
          background:transparent; color:#F7B500; border:2px solid #F7B500; border-radius:10px;
          padding:13px 28px; font-weight:700; font-size:15px; cursor:pointer; font-family:inherit;
          transition:transform .22s ease, background .22s ease; text-decoration:none;
        }
        .btn-outline:hover{ transform:translateY(-3px); background:rgba(247,181,0,.1); }

        .btn-conn{
          border:2px solid #0A2540; color:#0A2540; background:transparent;
          padding:9px 22px; border-radius:9px; font-weight:700; font-size:14px;
          cursor:pointer; transition:all .22s; font-family:inherit;
        }
        .btn-conn:hover{ background:#F7B500; border-color:#F7B500; transform:translateY(-2px); box-shadow:0 6px 18px rgba(247,181,0,.30); }

        .btn-insc{
          background:#F7B500; color:#0A2540; border:2px solid #F7B500;
          padding:9px 22px; border-radius:9px; font-weight:800; font-size:14px;
          cursor:pointer; transition:all .22s; font-family:inherit;
        }
        .btn-insc:hover{ background:#e6a800; border-color:#e6a800; transform:translateY(-2px); box-shadow:0 8px 22px rgba(247,181,0,.40); }

        /* Cards hover */
        .stat-card{ transition:transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; }
        .stat-card:hover{ transform:translateY(-8px); box-shadow:0 20px 48px rgba(10,37,64,.12) !important; }

        .val-card{ transition:transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; }
        .val-card:hover{ transform:translateY(-10px); box-shadow:0 28px 60px rgba(10,37,64,.14) !important; }

        .team-card{ transition:all .35s cubic-bezier(.22,1,.36,1); }
        .team-card:hover{ transform:translateY(-8px); border-color:rgba(247,181,0,.5) !important; box-shadow:0 20px 48px rgba(10,37,64,.12); }
        .team-card:hover .team-reveal{ opacity:1 !important; transform:translateY(0) !important; }

        .partner-card:hover{ border-color:rgba(247,181,0,.5) !important; background:rgba(247,181,0,.07) !important; }

        .timeline-dot{ transition:transform .3s ease, box-shadow .3s ease; }
        .timeline-item:hover .timeline-dot{ transform:scale(1.2); box-shadow:0 0 0 8px rgba(247,181,0,.15); }
        .timeline-item:hover .timeline-box{ border-color:rgba(247,181,0,.35) !important; }
        .timeline-box{ transition:border-color .3s ease; }

        /* Breadcrumb */
        .bc-link{ color:rgba(255,255,255,.45); text-decoration:none; font-size:13px; transition:color .2s; }
        .bc-link:hover{ color:#F7B500; }

        /* scroll-margin for anchors */
        #vision, #mission, #valeurs { scroll-margin-top: 90px; }
      `}</style>

      {/* ════ HEADER ════ */}
      <header className="bg-white sticky top-0 z-[100]"
        style={{ boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
        <div className="max-w-[1280px] mx-auto px-6 h-[82px] flex items-center justify-between">

          <Link href="/" className="flex items-center gap-3 no-underline">
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="12" fill="#0A2540"/>
              <rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15"/>
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
                fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial,sans-serif" letterSpacing="0.5">
                BEH
              </text>
            </svg>
            <div className="flex flex-col leading-none">
              <span className="font-black text-[18px] text-[#0A2540] tracking-[-0.4px]">
                Business <span className="text-[#F7B500]">Expert</span> Hub
              </span>
             
            </div>
          </Link>

          <nav className="flex gap-7 items-center">
            <Link href="/"         className="nav-link">Accueil</Link>
            <Link href="/a-propos" className="nav-link" style={{ color:"#F7B500", fontWeight:700 }}>À propos</Link>
            <div className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}>
              <Link href="/services" className="nav-link font-semibold">Services ▾</Link>
              {servicesOpen && (
                <ul className="absolute top-[calc(100%+8px)] left-0 bg-white rounded-xl list-none p-[6px_0] m-0 z-[200] min-w-[200px]"
                  style={{ boxShadow:"0 8px 32px rgba(0,0,0,0.12)", border:"1px solid rgba(10,37,64,0.06)" }}>
                  {navServices.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nav-link">Experts</Link>
            <Link href="/blog"    className="nav-link">Blog</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
          </nav>

          <div className="flex gap-3">
            <Link href="/connexion">  <button className="btn-conn">Connexion</button></Link>
            <Link href="/inscription"><button className="btn-insc">{"S'inscrire"}</button></Link>
          </div>
        </div>
      </header>

      {/* ════ HERO ════ */}
      <section className="relative bg-[#0A2540] text-white overflow-hidden" style={{ minHeight:540 }}>
        {[
          { w:420, r:60,  delay:"0s"   },
          { w:270, r:150, delay:"1.4s" },
          { w:150, r:222, delay:"2.6s" },
        ].map((d,i) => (
          <div key={i} className="diamond-float absolute pointer-events-none"
            style={{ width:d.w, height:d.w, right:d.r, top:"50%",
              transform:"translateY(-50%) rotate(45deg)",
              background:`rgba(255,255,255,${0.045 + i*0.01})`,
              border:"1px solid rgba(255,255,255,0.08)",
              animationDelay:d.delay }}/>
        ))}
        <div className="absolute pointer-events-none"
          style={{ width:240, height:240, left:-75, bottom:-75, transform:"rotate(45deg)",
            background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}/>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:"radial-gradient(rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize:"44px 44px" }}/>
        <div className="absolute pointer-events-none"
          style={{ top:-80, left:"28%", width:640, height:640, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(247,181,0,0.07) 0%,transparent 65%)" }}/>

        <div className="hero-c relative z-10 max-w-[1280px] mx-auto px-8 py-24">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="bc-link">Accueil</Link>
            <span className="text-white/30 text-[13px]">/</span>
            <span className="text-[#F7B500] font-semibold text-[13px]">À propos</span>
          </div>

          <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[12px]
            tracking-[3px] uppercase px-5 py-1.5 rounded-full mb-7">
            Notre histoire &amp; ADN
          </span>

          <h1 className="font-black m-0 mb-6 leading-[1.08]"
            style={{ fontSize:"clamp(42px,6vw,76px)" }}>
            Qui est{" "}
            <span className="shimmer">Business Expert Hub</span>&nbsp;?
          </h1>

          <p className="text-[17px] text-white/78 max-w-[620px] leading-[1.85] mb-10">
            Depuis 2019, nous connectons les startups les plus ambitieuses aux meilleurs experts
            pour transformer leurs visions en succès mesurables. Découvrez notre histoire,
            notre mission et les valeurs qui nous animent chaque jour.
          </p>

          <div className="flex flex-wrap gap-4 mb-14">
            <a href="#vision"  className="btn-gold">Notre Vision <FaArrowRight size={12}/></a>
            <a href="#mission" className="btn-outline">Notre Mission <FaArrowRight size={12}/></a>
            <a href="#valeurs" className="btn-outline">Nos Valeurs <FaArrowRight size={12}/></a>
          </div>

       
        </div>
      </section>

      {/* ════ STATS ════ */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-[1200px] mx-auto grid grid-cols-6 gap-5">
          {stats.map((s,i) => (
            <FadeUp key={i} delay={i*0.08}>
              <div className="stat-card text-center rounded-[18px] py-7 px-4"
                style={{ background:"linear-gradient(160deg,#f0f6ff,#fff)",
                  border:"1px solid rgba(10,37,64,0.07)",
                  boxShadow:"0 4px 18px rgba(10,37,64,0.06)" }}>
                <div className="w-11 h-11 rounded-[12px] flex items-center justify-center mx-auto mb-3 text-[15px] text-[#F7B500]"
                  style={{ background:"linear-gradient(135deg,#0A2540,#1a4080)" }}>
                  {s.icon}
                </div>
                <div className="text-[28px] font-black text-[#0A2540] leading-none mb-1">{s.num}</div>
                <div className="text-[12px] text-gray-500 font-semibold leading-snug">{s.label}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ════ VISION ════ */}
      <section id="vision" className="py-24 px-6 relative overflow-hidden"
        style={{ background:"linear-gradient(160deg,#0A2540 0%,#0f3460 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:"radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize:"40px 40px" }}/>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle,rgba(247,181,0,0.08) 0%,transparent 65%)" }}/>

        <div className="max-w-[1200px] mx-auto relative z-10 grid grid-cols-2 gap-16 items-center">
          <FadeUp>
            <span className="inline-block text-[#F7B500] font-bold text-[11px] tracking-[3px]
              uppercase px-[18px] py-1.5 rounded-full mb-6"
              style={{ border:"1px solid rgba(247,181,0,0.35)" }}>
              Vision
            </span>
            <h2 className="font-black text-white m-0 mb-6 leading-[1.12]"
              style={{ fontSize:"clamp(32px,4vw,56px)" }}>
              Devenir la{" "}
              <span className="text-[#F7B500]">référence</span>{" "}
              en accompagnement de startups
            </h2>
            <p className="text-white/68 text-[16px] leading-[1.88] mb-6">
              Notre vision est de créer un écosystème où chaque startup innovante a accès aux mêmes ressources
              humaines d&apos;exception que les grandes entreprises. Nous croyons que l&apos;expertise ne devrait
              jamais être un privilège réservé aux grandes structures.
            </p>
            <p className="text-white/68 text-[16px] leading-[1.88] mb-10">
              D&apos;ici 2027, Business Expert Hub ambitionne d&apos;être présent dans 20+ pays et d&apos;avoir
              accompagné plus de 1 000 startups vers leur première levée de fonds ou leur expansion internationale.
            </p>
            <div className="flex flex-col gap-3 mb-10">
              {[
                "Accès universel à l'expertise de haut niveau",
                "Réseau pan-africain et européen d'ici 2027",
                "Technologie au service de la mise en relation",
                "1 000 startups accompagnées à l'horizon 2027",
              ].map((item,i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]
                    text-[#0A2540] flex-shrink-0" style={{ background:"#F7B500" }}>
                    <FaCheck/>
                  </div>
                  <span className="text-white/80 text-[15px] font-semibold">{item}</span>
                </div>
              ))}
            </div>
            <Link href="/contact" className="btn-gold">
              Nous rejoindre <FaArrowRight size={12}/>
            </Link>
          </FadeUp>

          <FadeUp delay={0.22}>
            <div className="relative">
              <div className="rounded-[26px] relative overflow-hidden"
                style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                  padding:"48px 40px", backdropFilter:"blur(6px)" }}>
                <div className="absolute top-0 left-0 right-0 h-1"
                  style={{ background:"linear-gradient(90deg,#F7B500,transparent)" }}/>
                <FaQuoteLeft style={{ color:"rgba(247,181,0,0.18)", fontSize:44, marginBottom:24 }}/>
                <blockquote className="text-white/90 text-[19px] font-bold leading-[1.65] m-0 mb-8 italic">
                  &ldquo;Nous ne faisons pas que connecter des experts et des startups.
                  Nous créons les success stories de demain.&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center
                    font-black text-[#F7B500] text-[16px] flex-shrink-0"
                    style={{ background:"linear-gradient(135deg,#0A2540,#1a4080)",
                      border:"2.5px solid rgba(247,181,0,0.4)" }}>
                    AB
                  </div>
                  <div>
                    <div className="text-white font-black text-[15px]">Ahmed Benslimane</div>
                    <div className="text-[#F7B500] text-[13px] font-semibold">CEO &amp; Co-fondateur</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-7 -right-7 w-[110px] h-[110px] rounded-[22px] pointer-events-none"
                style={{ background:"rgba(247,181,0,0.08)", border:"1px solid rgba(247,181,0,0.15)", transform:"rotate(18deg)" }}/>
              <div className="absolute -top-5 -left-5 w-[70px] h-[70px] rounded-[16px] pointer-events-none"
                style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", transform:"rotate(-12deg)" }}/>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════ MISSION ════ */}
      <section id="mission" className="py-24 px-6 relative overflow-hidden"
        style={{ background:"linear-gradient(160deg,#f8faff 0%,#ffffff 55%,#fffdf0 100%)" }}>
        <div className="absolute pointer-events-none rounded-full"
          style={{ top:-100, left:-100, width:500, height:500,
            background:"radial-gradient(circle,rgba(247,181,0,0.07) 0%,transparent 70%)" }}/>
        <div className="absolute pointer-events-none rounded-full"
          style={{ bottom:-80, right:-80, width:400, height:400,
            background:"radial-gradient(circle,rgba(10,37,64,0.04) 0%,transparent 70%)" }}/>

        <div className="max-w-[1200px] mx-auto relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[11px]
              tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-5">
             Mission
            </span>
            <h2 className="font-black text-[#0A2540] m-0 mb-4 leading-[1.12]"
              style={{ fontSize:"clamp(32px,4vw,56px)" }}>
              Offrir un accès{" "}
              <span className="text-[#F7B500]">privilégié</span>{" "}
              à l&apos;expertise
            </h2>
           
          </FadeUp>

          <div className="grid grid-cols-3 gap-7 mb-16">
            {[
              { icon:<FaBullseye/>, title:"Structurer", color:"#F7B500",
                desc:"Nous aidons les startups à poser des bases solides : stratégie, business model, organisation interne et processus scalables prêts pour la croissance.",
                items:["Diagnostic stratégique complet","Business model canvas","Organisation & gouvernance"] },
              { icon:<FaRocket/>,   title:"Accélérer",  color:"#3B82F6",
                desc:"Grâce à nos experts marketing, tech et commercial, nous boostons votre croissance avec des méthodes éprouvées et des résultats mesurables rapidement.",
                items:["Growth hacking & acquisition","Optimisation produit & UX","Scalabilité commerciale"] },
              { icon:<FaChartLine/>,title:"Financer",   color:"#22C55E",
                desc:"Nous connectons les startups à notre réseau de VCs, family offices et fonds pour faciliter les levées pré-seed, seed et Série A avec un dossier solide.",
                items:["Préparation pitch & deck","Accès réseau investisseurs","Accompagnement due diligence"] },
            ].map((item,i) => (
              <FadeUp key={i} delay={i*0.15}>
                <div className="val-card bg-white rounded-[22px] overflow-hidden h-full"
                  style={{ boxShadow:"0 6px 32px rgba(10,37,64,0.07)", border:"1px solid rgba(10,37,64,0.06)" }}>
                  <div className="h-[5px]"
                    style={{ background:`linear-gradient(90deg,${item.color},${item.color}55)` }}/>
                  <div style={{ padding:"36px 32px" }}>
                    <div className="w-[64px] h-[64px] rounded-[18px] flex items-center justify-center text-[26px] mb-6"
                      style={{ background:`linear-gradient(135deg,${item.color}22,${item.color}0a)`,
                        border:`1.5px solid ${item.color}44`, color:item.color }}>
                      {item.icon}
                    </div>
                    <h3 className="text-[22px] font-black text-[#0A2540] mb-3">{item.title}</h3>
                    <p className="text-gray-500 leading-[1.8] text-[15px] mb-6">{item.desc}</p>
                    <div className="flex flex-col gap-2.5">
                      {item.items.map((pt,j) => (
                        <div key={j} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center
                            text-[9px] text-white flex-shrink-0"
                            style={{ background:item.color }}>
                            <FaCheck/>
                          </div>
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

      {/* ════ TIMELINE ════ */}
      <section className="py-24 px-6 bg-[#0A2540] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:"radial-gradient(rgba(255,255,255,0.022) 1px,transparent 1px)", backgroundSize:"38px 38px" }}/>
        <div className="max-w-[840px] mx-auto relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="inline-block text-[#F7B500] font-bold text-[11px] tracking-[3px]
              uppercase px-[18px] py-1.5 rounded-full mb-5"
              style={{ border:"1px solid rgba(247,181,0,0.3)" }}>
              Notre parcours
            </span>
            <h2 className="font-black text-white m-0 leading-[1.12]"
              style={{ fontSize:"clamp(30px,4vw,52px)" }}>
              5 ans d&apos;histoire &amp;{" "}
              <span className="text-[#F7B500]">de succès</span>
            </h2>
          </FadeUp>

          <div className="relative">
            <div className="absolute left-[27px] top-[28px] bottom-[28px] w-[2px] pointer-events-none"
              style={{ background:"linear-gradient(to bottom,#F7B500,rgba(247,181,0,0.08))" }}/>
            {timeline.map((item,i) => (
              <FadeUp key={i} delay={i*0.1}>
                <div className="timeline-item relative flex gap-7 mb-8 last:mb-0">
                  <div className="flex-shrink-0 relative z-10">
                    <div className="timeline-dot w-[56px] h-[56px] rounded-full flex items-center
                      justify-center font-black text-[#0A2540] text-[13px]"
                      style={{ background:"linear-gradient(135deg,#F7B500,#e6a800)",
                        boxShadow:"0 4px 18px rgba(247,181,0,0.4)" }}>
                      {item.year.slice(2)}
                    </div>
                  </div>
                  <div className="timeline-box flex-1 rounded-[16px] p-6"
                    style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[#F7B500] font-black text-[13px]">{item.year}</span>
                      <span className="w-1 h-1 rounded-full bg-white/25"/>
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

      {/* ════ VALEURS ════ */}
      <section id="valeurs" className="py-24 px-6 relative overflow-hidden"
        style={{ background:"linear-gradient(160deg,#f8faff 0%,#ffffff 100%)" }}>
        <div className="absolute pointer-events-none rounded-full"
          style={{ bottom:-100, right:-100, width:520, height:520,
            background:"radial-gradient(circle,rgba(247,181,0,0.06) 0%,transparent 70%)" }}/>

        <div className="max-w-[1200px] mx-auto relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[11px]
              tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-5">
             Valeurs
            </span>
            <h2 className="font-black text-[#0A2540] m-0 mb-4 leading-[1.12]"
              style={{ fontSize:"clamp(32px,4vw,56px)" }}>
              Les valeurs qui nous{" "}
              <span className="text-[#F7B500]">définissent</span>
            </h2>
            
          </FadeUp>

          <div className="grid grid-cols-3 gap-8">
            {valuesDetails.map((val,i) => (
              <FadeUp key={i} delay={i*0.18}>
                <div className="val-card bg-white rounded-[24px] overflow-hidden h-full"
                  style={{ boxShadow:"0 6px 32px rgba(10,37,64,0.08)", border:"1px solid rgba(10,37,64,0.06)" }}>
                  <div className="h-[6px]"
                    style={{ background:`linear-gradient(90deg,${val.color},${val.color}55)` }}/>
                  <div style={{ padding:"42px 36px" }}>
                    <div className="flex items-center justify-between mb-7">
                      <div className="w-[70px] h-[70px] rounded-[20px] flex items-center justify-center text-[28px]"
                        style={{ background:`linear-gradient(135deg,${val.color}22,${val.color}0a)`,
                          border:`1.5px solid ${val.color}44`, color:val.color }}>
                        {val.icon}
                      </div>
                      <span className="text-[52px] font-black leading-none select-none"
                        style={{ color:`${val.color}12` }}>
                        {val.badge}
                      </span>
                    </div>
                    <h3 className="text-[26px] font-black text-[#0A2540] mb-4">{val.title}</h3>
                    <p className="text-gray-500 leading-[1.82] text-[15px] mb-7">{val.desc}</p>
                    <div className="flex flex-col gap-3">
                      {val.points.map((pt,j) => (
                        <div key={j} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center
                            text-[9px] text-white flex-shrink-0 mt-[2px]"
                            style={{ background:val.color }}>
                            <FaCheck/>
                          </div>
                          <span className="text-gray-600 text-[14px] font-semibold leading-snug">{pt}</span>
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

      

      {/* ════ CTA FINAL ════ */}
      <section className="py-24 px-6 bg-white">
        <FadeUp>
          <div className="max-w-[800px] mx-auto rounded-[28px] overflow-hidden relative"
            style={{ background:"linear-gradient(135deg,#0A2540,#1a4080)",
              boxShadow:"0 24px 64px rgba(10,37,64,0.22)", padding:"72px 64px" }}>
            <div className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full pointer-events-none"
              style={{ background:"radial-gradient(circle,rgba(247,181,0,0.1) 0%,transparent 65%)" }}/>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage:"radial-gradient(rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize:"32px 32px" }}/>
            <div className="text-center relative z-10">
              <div className="w-[70px] h-[70px] rounded-[20px] flex items-center justify-center
                mx-auto mb-7 text-[#0A2540] text-[28px]"
                style={{ background:"linear-gradient(135deg,#F7B500,#e6a800)", boxShadow:"0 10px 28px rgba(247,181,0,0.38)" }}>
                <FaHandsHelping/>
              </div>
              <h2 className="font-black text-white m-0 mb-4 leading-[1.12]"
                style={{ fontSize:"clamp(28px,4vw,48px)" }}>
                Prêt à rejoindre{" "}
                <span className="text-[#F7B500]">l&apos;aventure</span>&nbsp;?
              </h2>
              <p className="text-white/60 text-[16px] leading-[1.8] mb-10 max-w-[520px] mx-auto">
                Que vous soyez une startup en quête d&apos;expertise ou un expert souhaitant rejoindre notre réseau,
                nous serions ravis de vous accueillir et de construire ensemble le succès de demain.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/inscription" className="btn-gold">
                  {"S'inscrire gratuitement"} <FaArrowRight size={12}/>
                </Link>
                <Link href="/contact" className="btn-outline">
                  Nous contacter <FaArrowRight size={12}/>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-8 mt-10 flex-wrap">
                {[
                  { icon:"✅", label:"Inscription gratuite" },
                  { icon:"⚡", label:"Matching en 48h"      },
                  { icon:"🔒", label:"Données sécurisées"   },
                ].map((item,i) => (
                  <div key={i} className="flex items-center gap-2 text-white/40 text-[13px]">
                    <span>{item.icon}</span>
                    <span className="font-semibold">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════ FOOTER ════ */}
      <footer className="bg-[#081B33] text-white pt-16 pb-8 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-4 gap-10 mb-14">
            <div>
              <Link href="/" className="flex items-center gap-3 no-underline mb-5">
                <svg width="40" height="40" viewBox="0 0 46 46" fill="none">
                  <rect width="46" height="46" rx="12" fill="#0A2540"/>
                  <rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15"/>
                  <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
                    fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial,sans-serif" letterSpacing="0.5">BEH</text>
                </svg>
                <span className="font-black text-[15px] text-white">
                  Business <span className="text-[#F7B500]">Expert</span> Hub
                </span>
              </Link>
              <p className="text-white/38 text-[13px] leading-[1.75]">
                Plateforme de mise en relation entre startups ambitieuses et experts certifiés.
              </p>
            </div>
            <div>
              <h4 className="text-white font-black text-[13px] uppercase tracking-wider mb-5">Navigation</h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {[["Accueil","/"],["À propos","/a-propos"],["Services","/services"],
                  ["Experts","/experts"],["Blog","/blog"],["Contact","/contact"]].map(([label,href]) => (
                  <li key={href}>
                    <Link href={href} className="text-white/42 text-[14px] no-underline hover:text-[#F7B500] transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-[13px] uppercase tracking-wider mb-5">Services</h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {navServices.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className="text-white/42 text-[14px] no-underline hover:text-[#F7B500] transition-colors">{s.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-[13px] uppercase tracking-wider mb-5">Contact</h4>
              <div className="flex flex-col gap-3 text-white/42 text-[14px] mb-6">
                <span>📧 contact@beh.com</span>
                <span>📞 +212 6 00 00 00 00</span>
                <span>📍 Casablanca, Maroc</span>
              </div>
              <div className="flex gap-3">
                {[<FaLinkedin key="li"/>, <FaTwitter key="tw"/>, <FaEnvelope key="em"/>].map((icon,i) => (
                  <div key={i} className="w-9 h-9 rounded-[8px] flex items-center justify-center
                    text-[#F7B500] text-[14px] cursor-pointer transition-all hover:scale-110 hover:bg-white/12"
                    style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)" }}>
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.07] pt-8 flex items-center justify-between flex-wrap gap-4">
            <p className="m-0 text-white/28 text-[13px]">© 2026 Business Expert Hub — Tous droits réservés</p>
            <div className="flex gap-6">
              {["Mentions légales","Politique de confidentialité","CGU"].map((item) => (
                <Link key={item} href="#"
                  className="text-white/28 text-[12px] no-underline hover:text-[#F7B500] transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}