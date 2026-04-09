"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import Link from "next/link";
import {
  FaBullseye, FaRocket, FaHandsHelping, FaStar, FaArrowRight,
  FaUsers, FaAward, FaChartLine, FaGlobe, FaCheck, FaQuoteLeft,
  FaLinkedin, FaTwitter, FaEnvelope,
} from "react-icons/fa";

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

const navServices = [
  { label:"Consulting",     slug:"consulting"     },
  { label:"Audit sur site", slug:"audit-sur-site" },
  { label:"Accompagnement", slug:"accompagnement" },
  { label:"Formations",     slug:"formations"     },
];

// Valeurs par défaut si la base n'est pas encore chargée
const DEFAULTS = {
  annee_creation: "2019",
  description_hero: "Depuis 2019, nous connectons les startups les plus ambitieuses aux meilleurs experts pour transformer leurs visions en succès mesurables.",
  description_vision: "Notre vision est de créer un écosystème où chaque startup innovante a accès aux mêmes ressources humaines d'exception que les grandes entreprises.",
  vision_point1: "Accès universel à l'expertise de haut niveau",
  vision_point2: "Réseau pan-africain et européen d'ici 2027",
  vision_point3: "Technologie au service de la mise en relation",
  vision_point4: "1 000 startups accompagnées à l'horizon 2027",
  citation: "Nous ne faisons pas que connecter des experts et des startups. Nous créons les success stories de demain.",
  citation_auteur: "Ahmed Benslimane",
  citation_role: "CEO & Co-fondateur",
  mission_titre: "Offrir un accès privilégié à l'expertise",
  mission_desc: "Offrir aux startups un accès privilégié à des experts certifiés.",
  timeline1_year:"2019", timeline1_title:"Fondation",          timeline1_desc:"Création de Business Expert Hub par une équipe de consultants passionnés.",
  timeline2_year:"2020", timeline2_title:"Premiers succès",    timeline2_desc:"Accompagnement de nos 20 premières startups.",
  timeline3_year:"2021", timeline3_title:"Expansion digitale", timeline3_desc:"Lancement de la plateforme digitale.",
  timeline4_year:"2022", timeline4_title:"Reconnaissance",     timeline4_desc:"Obtention du label Meilleure plateforme d'accompagnement startup.",
  timeline5_year:"2023", timeline5_title:"Scale-up",           timeline5_desc:"Dépassement des 100 startups accompagnées.",
  timeline6_year:"2024", timeline6_title:"Leader régional",    timeline6_desc:"Consolidation de notre position de référence.",
  valeur1_titre:"Excellence",   valeur1_desc:"Nous sélectionnons rigoureusement chaque expert pour garantir un niveau d'accompagnement exceptionnel.", valeur1_color:"#F7B500",
  valeur2_titre:"Transparence", valeur2_desc:"Chaque interaction, chaque contrat, chaque résultat est documenté et partagé.",                          valeur2_color:"#22C55E",
  valeur3_titre:"Engagement",   valeur3_desc:"Votre succès est notre succès. Nous nous impliquons bien au-delà de la prestation.",                      valeur3_color:"#3B82F6",
  contact_email:"+216 00 000 000", contact_telephone:"+216 00 000 000", contact_adresse:"Tunis, Tunisie",
};

export default function APropos() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [nbExperts,  setNbExperts]  = useState<number|null>(null);
  const [nbStartups, setNbStartups] = useState<number|null>(null);
  const [h, setH] = useState<any>(DEFAULTS);

  function get(key: string) { return h?.[key] || (DEFAULTS as any)[key] || ""; }

  function loadStats() {
    fetch(`${BASE}/experts/liste`).then(r => r.ok?r.json():[]).then(d => setNbExperts(Array.isArray(d)?d.length:0)).catch(() => setNbExperts(0));
    fetch(`${BASE}/startups/liste`).then(r => r.ok?r.json():[]).then(d => setNbStartups(Array.isArray(d)?d.length:0)).catch(() => setNbStartups(0));
  }

  useEffect(() => {
    const hash = window.location.hash.replace("#","");
    if (["vision","mission","valeurs"].includes(hash)) {
      setTimeout(() => { const el = document.getElementById(hash); if (el) el.scrollIntoView({behavior:"smooth",block:"start"}); }, 350);
    }
    // Charger les données histoire
    fetch(`${BASE}/histoire`).then(r => r.ok?r.json():null).then(d => { if(d) setH(d); }).catch(() => {});
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const timeline = [1,2,3,4,5,6].map(n => ({
    year: get(`timeline${n}_year`), title: get(`timeline${n}_title`), desc: get(`timeline${n}_desc`),
  })).filter(t => t.year && t.title);

  const valeurs = [1,2,3].map(n => ({
    titre: get(`valeur${n}_titre`), desc: get(`valeur${n}_desc`), color: get(`valeur${n}_color`) || "#F7B500",
    icon: n===1 ? <FaAward/> : n===2 ? <FaGlobe/> : <FaHandsHelping/>,
  }));

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
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
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
        .stat-card{transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s;cursor:default}
        .stat-card:hover{transform:translateY(-10px)!important}
        .val-card{transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s}
        .val-card:hover{transform:translateY(-10px);box-shadow:0 28px 60px rgba(10,37,64,.14)!important}
        .timeline-dot{transition:transform .3s,box-shadow .3s}
        .timeline-item:hover .timeline-dot{transform:scale(1.2);box-shadow:0 0 0 8px rgba(247,181,0,.15)}
        .timeline-item:hover .timeline-box{border-color:rgba(247,181,0,.35)!important}
        .timeline-box{transition:border-color .3s}
        .bc-link{color:rgba(255,255,255,.45);text-decoration:none;font-size:13px;transition:color .2s}
        .bc-link:hover{color:#F7B500}
        #vision,#mission,#valeurs{scroll-margin-top:90px}
      `}</style>

      {/* ════ HEADER ════ */}
      <header className="bg-white sticky top-0 z-[100]" style={{boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
        <div className="max-w-[1280px] mx-auto px-6 h-[82px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="12" fill="#0A2540"/><rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial,sans-serif">BEH</text></svg>
            <span className="font-black text-[18px] text-[#0A2540] tracking-[-0.4px]">Business <span className="text-[#F7B500]">Expert</span> Hub</span>
          </Link>
          <nav className="flex gap-7 items-center">
            <Link href="/"         className="nav-link">Accueil</Link>
            <Link href="/a-propos" className="nav-link" style={{color:"#F7B500",fontWeight:700}}>À propos</Link>
            <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <Link href="/services" className="nav-link font-semibold">Services ▾</Link>
              {servicesOpen && (
                <ul className="absolute top-[calc(100%+8px)] left-0 bg-white rounded-xl list-none p-[6px_0] m-0 z-[200] min-w-[200px]" style={{boxShadow:"0 8px 32px rgba(0,0,0,0.12)",border:"1px solid rgba(10,37,64,0.06)"}}>
                  {navServices.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>)}
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
      <section className="relative bg-[#0A2540] text-white overflow-hidden" style={{minHeight:540}}>
        {[{w:420,r:60,delay:"0s"},{w:270,r:150,delay:"1.4s"},{w:150,r:222,delay:"2.6s"}].map((d,i) => (
          <div key={i} className="diamond-float absolute pointer-events-none" style={{width:d.w,height:d.w,right:d.r,top:"50%",transform:"translateY(-50%) rotate(45deg)",background:`rgba(255,255,255,${0.045+i*0.01})`,border:"1px solid rgba(255,255,255,0.08)",animationDelay:d.delay}}/>
        ))}
        <div className="absolute pointer-events-none" style={{width:240,height:240,left:-75,bottom:-75,transform:"rotate(45deg)",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}/>
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"radial-gradient(rgba(255,255,255,0.02) 1px,transparent 1px)",backgroundSize:"44px 44px"}}/>
        <div className="absolute pointer-events-none" style={{top:-80,left:"28%",width:640,height:640,borderRadius:"50%",background:"radial-gradient(circle,rgba(247,181,0,0.07) 0%,transparent 65%)"}}/>

        <div className="hero-c relative z-10 max-w-[1280px] mx-auto px-8 py-24">
          <div className="flex items-center gap-2 mb-8">
            <Link href="/" className="bc-link">Accueil</Link>
            <span className="text-white/30 text-[13px]">/</span>
            <span className="text-[#F7B500] font-semibold text-[13px]">À propos</span>
          </div>
          <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[12px] tracking-[3px] uppercase px-5 py-1.5 rounded-full mb-7">Notre histoire &amp; ADN</span>
          <h1 className="font-black m-0 mb-6 leading-[1.08]" style={{fontSize:"clamp(42px,6vw,76px)"}}>
            Qui est <span className="shimmer">Business Expert Hub</span>&nbsp;?
          </h1>Nous connectons les entreprises et les particuliers aux meilleurs experts pour transformer leurs projets en succès mesurables.
          <p className="text-[17px] text-white/78 max-w-[620px] leading-[1.85] mb-10">{get("description_hero")}</p>
          <div className="flex flex-wrap gap-4">
            <a href="#vision"  className="btn-gold">Notre Vision <FaArrowRight size={12}/></a>
            <a href="#mission" className="btn-outline">Notre Mission <FaArrowRight size={12}/></a>
            <a href="#valeurs" className="btn-outline">Nos Valeurs <FaArrowRight size={12}/></a>
          </div>
        </div>
      </section>

      {/* ════ STATS ════ */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-[960px] mx-auto">
         
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24}}>

            {/* Année */}
            <FadeUp delay={0}>
              <div className="stat-card rounded-[22px] p-8 text-center relative overflow-hidden" style={{background:"linear-gradient(160deg,#f0f9ff,#fff)",border:"1.5px solid rgba(59,130,246,0.18)",boxShadow:"0 6px 24px rgba(59,130,246,0.07)"}}>
                <div className="absolute top-0 left-0 right-0 h-[4px]" style={{background:"linear-gradient(90deg,#3B82F6,#60a5fa)"}}/>
                <div style={{width:58,height:58,borderRadius:15,background:"linear-gradient(135deg,#3B82F6,#2563eb)",boxShadow:"0 6px 18px rgba(59,130,246,0.28)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:22}}><FaAward style={{color:"#fff"}}/></div>
                <div className="font-black leading-none mb-2" style={{fontSize:46,color:"#2563eb"}}>{get("annee_creation")}</div>
                <div className="font-black text-[#0A2540] text-[16px] mb-1">Année de création</div>
              </div>
            </FadeUp>

            {/* Experts */}
            <FadeUp delay={0.14}>
              <div className="stat-card rounded-[22px] p-8 text-center relative overflow-hidden" style={{background:"linear-gradient(160deg,#f3f0ff,#fff)",border:"1.5px solid rgba(139,92,246,0.18)",boxShadow:"0 6px 24px rgba(139,92,246,0.07)"}}>
                <div className="absolute top-0 left-0 right-0 h-[4px]" style={{background:"linear-gradient(90deg,#8B5CF6,#a78bfa)"}}/>
                <div style={{width:58,height:58,borderRadius:15,background:"linear-gradient(135deg,#8B5CF6,#7c3aed)",boxShadow:"0 6px 18px rgba(139,92,246,0.28)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:22}}><FaStar style={{color:"#fff"}}/></div>
                <div className={`font-black leading-none mb-2 ${nbExperts!==null?"count-pop":""}`} style={{fontSize:46,color:"#7c3aed",minHeight:56,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {nbExperts===null ? <div style={{width:32,height:32,border:"3px solid #8B5CF6",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite"}}/> : <span>{nbExperts}+</span>}
                </div>
                <div className="font-black text-[#0A2540] text-[16px] mb-1">Experts validés</div>
                
              </div>
            </FadeUp>

            {/* Startups */}
            <FadeUp delay={0.28}>
              <div className="stat-card rounded-[22px] p-8 text-center relative overflow-hidden" style={{background:"linear-gradient(160deg,#fffbeb,#fff)",border:"1.5px solid rgba(247,181,0,0.22)",boxShadow:"0 6px 24px rgba(247,181,0,0.07)"}}>
                <div className="absolute top-0 left-0 right-0 h-[4px]" style={{background:"linear-gradient(90deg,#F7B500,#fbbf24)"}}/>
                <div style={{width:58,height:58,borderRadius:15,background:"linear-gradient(135deg,#F7B500,#e6a800)",boxShadow:"0 6px 18px rgba(247,181,0,0.28)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:22}}><FaRocket style={{color:"#0A2540"}}/></div>
                <div className={`font-black leading-none mb-2 ${nbStartups!==null?"count-pop":""}`} style={{fontSize:46,color:"#D97706",minHeight:56,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {nbStartups===null ? <div style={{width:32,height:32,border:"3px solid #F7B500",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite"}}/> : <span>{nbStartups}+</span>}
                </div>
                <div className="font-black text-[#0A2540] text-[16px] mb-1">Startups validées</div>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"#ECFDF5",color:"#059669",borderRadius:99,padding:"3px 10px",fontSize:11,fontWeight:700}}>
                </div>
              </div>
            </FadeUp>

          </div>
        
        </div>
      </section>

      {/* ════ VISION ════ */}
      <section id="vision" className="py-24 px-6 relative overflow-hidden" style={{background:"linear-gradient(160deg,#0A2540 0%,#0f3460 100%)"}}>
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full pointer-events-none" style={{background:"radial-gradient(circle,rgba(247,181,0,0.08) 0%,transparent 65%)"}}/>

        <div className="max-w-[1200px] mx-auto relative z-10 grid grid-cols-2 gap-16 items-center">
          <FadeUp>
            <span className="inline-block text-[#F7B500] font-bold text-[11px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-6" style={{border:"1px solid rgba(247,181,0,0.35)"}}>Vision</span>
            <h2 className="font-black text-white m-0 mb-6 leading-[1.12]" style={{fontSize:"clamp(32px,4vw,56px)"}}>
              Devenir la <span className="text-[#F7B500]">référence</span> en accompagnement de startups
            </h2>
            <p className="text-white/68 text-[16px] leading-[1.88] mb-10">{get("description_vision")}</p>
            <div className="flex flex-col gap-3">
              {[get("vision_point1"),get("vision_point2"),get("vision_point3"),get("vision_point4")].filter(Boolean).map((item,i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-[#0A2540] flex-shrink-0" style={{background:"#F7B500"}}><FaCheck/></div>
                  <span className="text-white/80 text-[15px] font-semibold">{item}</span>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.22}>
            <div className="relative">
              <div className="rounded-[26px] relative overflow-hidden" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",padding:"48px 40px",backdropFilter:"blur(6px)"}}>
                <div className="absolute top-0 left-0 right-0 h-1" style={{background:"linear-gradient(90deg,#F7B500,transparent)"}}/>
                <FaQuoteLeft style={{color:"rgba(247,181,0,0.18)",fontSize:44,marginBottom:24}}/>
                <blockquote className="text-white/90 text-[19px] font-bold leading-[1.65] m-0 mb-8 italic">
                  &ldquo;{get("citation")}&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-[#F7B500] text-[16px] flex-shrink-0" style={{background:"linear-gradient(135deg,#0A2540,#1a4080)",border:"2.5px solid rgba(247,181,0,0.4)"}}>
                    {get("citation_auteur").split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-black text-[15px]">{get("citation_auteur")}</div>
                    <div className="text-[#F7B500] text-[13px] font-semibold">{get("citation_role")}</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-7 -right-7 w-[110px] h-[110px] rounded-[22px] pointer-events-none" style={{background:"rgba(247,181,0,0.08)",border:"1px solid rgba(247,181,0,0.15)",transform:"rotate(18deg)"}}/>
              <div className="absolute -top-5 -left-5 w-[70px] h-[70px] rounded-[16px] pointer-events-none" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",transform:"rotate(-12deg)"}}/>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════ MISSION ════ */}
      <section id="mission" className="py-24 px-6 relative overflow-hidden" style={{background:"linear-gradient(160deg,#f8faff 0%,#ffffff 55%,#fffdf0 100%)"}}>
        <div className="absolute pointer-events-none rounded-full" style={{top:-100,left:-100,width:500,height:500,background:"radial-gradient(circle,rgba(247,181,0,0.07) 0%,transparent 70%)"}}/>
        <div className="max-w-[1200px] mx-auto relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[11px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-5">Mission</span>
            <h2 className="font-black text-[#0A2540] m-0 mb-4 leading-[1.12]" style={{fontSize:"clamp(32px,4vw,56px)"}}>
              {get("mission_titre") || "Offrir un accès"} <span className="text-[#F7B500]">privilégié</span> à l&apos;expertise
            </h2>
            <p className="text-gray-500 text-[16px] max-w-[600px] mx-auto leading-[1.8]">{get("mission_desc")}</p>
          </FadeUp>
          <div className="grid grid-cols-3 gap-7">
            {[
              { icon:<FaBullseye/>, title:"Structurer", color:"#F7B500", desc:"Nous aidons les startups à poser des bases solides : stratégie, business model, organisation interne et processus scalables.", items:["Diagnostic stratégique complet","Business model canvas","Organisation & gouvernance"] },
              { icon:<FaRocket/>,   title:"Accélérer",  color:"#3B82F6", desc:"Grâce à nos experts marketing, tech et commercial, nous boostons votre croissance avec des méthodes éprouvées.", items:["Growth hacking & acquisition","Optimisation produit & UX","Scalabilité commerciale"] },
              { icon:<FaChartLine/>,title:"Financer",   color:"#22C55E", desc:"Nous connectons les startups à notre réseau de VCs, family offices et fonds pour faciliter les levées.", items:["Préparation pitch & deck","Accès réseau investisseurs","Accompagnement due diligence"] },
            ].map((item,i) => (
              <FadeUp key={i} delay={i*0.15}>
                <div className="val-card bg-white rounded-[22px] overflow-hidden h-full" style={{boxShadow:"0 6px 32px rgba(10,37,64,0.07)",border:"1px solid rgba(10,37,64,0.06)"}}>
                  <div className="h-[5px]" style={{background:`linear-gradient(90deg,${item.color},${item.color}55)`}}/>
                  <div style={{padding:"36px 32px"}}>
                    <div className="w-[64px] h-[64px] rounded-[18px] flex items-center justify-center text-[26px] mb-6" style={{background:`linear-gradient(135deg,${item.color}22,${item.color}0a)`,border:`1.5px solid ${item.color}44`,color:item.color}}>{item.icon}</div>
                    <h3 className="text-[22px] font-black text-[#0A2540] mb-3">{item.title}</h3>
                    <p className="text-gray-500 leading-[1.8] text-[15px] mb-6">{item.desc}</p>
                    <div className="flex flex-col gap-2.5">
                      {item.items.map((pt,j) => (
                        <div key={j} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white flex-shrink-0" style={{background:item.color}}><FaCheck/></div>
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
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"radial-gradient(rgba(255,255,255,0.022) 1px,transparent 1px)",backgroundSize:"38px 38px"}}/>
        <div className="max-w-[840px] mx-auto relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="inline-block text-[#F7B500] font-bold text-[11px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-5" style={{border:"1px solid rgba(247,181,0,0.3)"}}>Notre parcours</span>
            <h2 className="font-black text-white m-0 leading-[1.12]" style={{fontSize:"clamp(30px,4vw,52px)"}}>
              Notre histoire &amp; <span className="text-[#F7B500]">de succès</span>
            </h2>
          </FadeUp>
          <div className="relative">
            <div className="absolute left-[27px] top-[28px] bottom-[28px] w-[2px] pointer-events-none" style={{background:"linear-gradient(to bottom,#F7B500,rgba(247,181,0,0.08))"}}/>
            {timeline.map((item,i) => (
              <FadeUp key={i} delay={i*0.1}>
                <div className="timeline-item relative flex gap-7 mb-8 last:mb-0">
                  <div className="flex-shrink-0 relative z-10">
                    <div className="timeline-dot w-[56px] h-[56px] rounded-full flex items-center justify-center font-black text-[#0A2540] text-[13px]" style={{background:"linear-gradient(135deg,#F7B500,#e6a800)",boxShadow:"0 4px 18px rgba(247,181,0,0.4)"}}>
                      {item.year.slice(2)}
                    </div>
                  </div>
                  <div className="timeline-box flex-1 rounded-[16px] p-6" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
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
      <section id="valeurs" className="py-24 px-6 relative overflow-hidden" style={{background:"linear-gradient(160deg,#f8faff 0%,#ffffff 100%)"}}>
        <div className="absolute pointer-events-none rounded-full" style={{bottom:-100,right:-100,width:520,height:520,background:"radial-gradient(circle,rgba(247,181,0,0.06) 0%,transparent 70%)"}}/>
        <div className="max-w-[1200px] mx-auto relative z-10">
          <FadeUp className="text-center mb-16">
            <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[11px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-5">Valeurs</span>
            <h2 className="font-black text-[#0A2540] m-0 mb-4 leading-[1.12]" style={{fontSize:"clamp(32px,4vw,56px)"}}>
              Les valeurs qui nous <span className="text-[#F7B500]">définissent</span>
            </h2>
          </FadeUp>
          <div className="grid grid-cols-3 gap-8">
            {valeurs.map((val,i) => (
              <FadeUp key={i} delay={i*0.18}>
                <div className="val-card bg-white rounded-[24px] overflow-hidden h-full" style={{boxShadow:"0 6px 32px rgba(10,37,64,0.08)",border:"1px solid rgba(10,37,64,0.06)"}}>
                  <div className="h-[6px]" style={{background:`linear-gradient(90deg,${val.color},${val.color}55)`}}/>
                  <div style={{padding:"42px 36px"}}>
                    <div className="w-[70px] h-[70px] rounded-[20px] flex items-center justify-center text-[28px] mb-7" style={{background:`linear-gradient(135deg,${val.color}22,${val.color}0a)`,border:`1.5px solid ${val.color}44`,color:val.color}}>
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

      {/* ════ CTA ════ */}
      <section className="py-20 px-6 relative overflow-hidden" style={{background:"linear-gradient(135deg,#0A2540 0%,#0f3460 100%)"}}>
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)",backgroundSize:"36px 36px"}}/>
        <div className="max-w-[700px] mx-auto relative z-10 text-center">
          <FadeUp>
            <h2 className="font-black text-white m-0 mb-5 leading-[1.12]" style={{fontSize:"clamp(28px,4vw,48px)"}}>Prêt à nous rejoindre ?</h2>
            <p className="text-white/65 text-[16px] leading-[1.85] mb-10">Que vous soyez expert ou startup, rejoignez notre écosystème et bénéficiez d&apos;un accompagnement sur mesure.</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/inscription" className="btn-gold">Rejoindre BEH <FaArrowRight size={12}/></Link>
              <Link href="/contact" className="btn-outline">Nous contacter <FaArrowRight size={12}/></Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer className="bg-[#081B33] text-white pt-16 pb-8 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-4 gap-10 mb-14">
            <div>
              <Link href="/" className="flex items-center gap-3 no-underline mb-5">
                <svg width="40" height="40" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="12" fill="#0A2540"/><rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial,sans-serif">BEH</text></svg>
                <span className="font-black text-[15px] text-white">Business <span className="text-[#F7B500]">Expert</span> Hub</span>
              </Link>
              <p className="text-white/38 text-[13px] leading-[1.75]">Plateforme de mise en relation entre startups ambitieuses et experts certifiés.</p>
            </div>
            <div>
              <h4 className="text-white font-black text-[13px] uppercase tracking-wider mb-5">Navigation</h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {[["Accueil","/"],["À propos","/a-propos"],["Services","/services"],["Experts","/experts"],["Blog","/blog"],["Contact","/contact"]].map(([label,href]) => (
                  <li key={href}><Link href={href} className="text-white/42 text-[14px] no-underline hover:text-[#F7B500] transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-[13px] uppercase tracking-wider mb-5">Services</h4>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {navServices.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="text-white/42 text-[14px] no-underline hover:text-[#F7B500] transition-colors">{s.label}</Link></li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-[13px] uppercase tracking-wider mb-5">Contact</h4>
              <div className="flex flex-col gap-3 text-white/42 text-[14px] mb-6">
                <span>📧 {get("contact_email") || "contact@beh.com"}</span>
                <span>📞 {get("contact_telephone") || "+216 00 000 000"}</span>
                <span>📍 {get("contact_adresse") || "Tunis, Tunisie"}</span>
              </div>
              <div className="flex gap-3">
                {[<FaLinkedin key="li"/>,<FaTwitter key="tw"/>,<FaEnvelope key="em"/>].map((icon,i) => (
                  <div key={i} className="w-9 h-9 rounded-[8px] flex items-center justify-center text-[#F7B500] text-[14px] cursor-pointer transition-all hover:scale-110" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>{icon}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.07] pt-8 flex items-center justify-between flex-wrap gap-4">
            <p className="m-0 text-white/28 text-[13px]">© 2026 Business Expert Hub — Tous droits réservés</p>
            <div className="flex gap-6">
              {["Mentions légales","Politique de confidentialité","CGU"].map(item => (
                <Link key={item} href="#" className="text-white/28 text-[12px] no-underline hover:text-[#F7B500] transition-colors">{item}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}