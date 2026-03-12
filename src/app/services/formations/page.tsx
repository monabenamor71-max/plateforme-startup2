"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FaGraduationCap, FaArrowRight, FaArrowLeft, FaCheckCircle,
  FaChartLine, FaSearchPlus, FaHandsHelping,
  FaUsers, FaTrophy, FaClock, FaStar, FaChevronDown,
  FaMicrophone, FaPlay, FaHeadphones, FaCalendarAlt,
} from "react-icons/fa";

function useInView(threshold = 0.1) {
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
  return (
    <div ref={ref} style={{ opacity:inView?1:0, transform:inView?"translateY(0)":"translateY(36px)", transition:`opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s,transform .7s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

const COLOR = "#22C55E";
const COLOR2 = "#EF4444"; // couleur podcasts

const STEPS = [
  { num:1, icon:"🎯", title:"Analyse des besoins",          desc:"Audit des compétences actuelles, définition des objectifs pédagogiques et du périmètre de la formation." },
  { num:2, icon:"📐", title:"Conception du programme",      desc:"Élaboration sur mesure du contenu, des supports et des modalités d'évaluation par nos experts certifiés." },
  { num:3, icon:"🎓", title:"Délivrance de la formation",   desc:"Sessions en présentiel ou distanciel, avec mises en situation réelles et ateliers pratiques interactifs." },
  { num:4, icon:"📋", title:"Évaluation & certification",   desc:"Tests de compétences, remise des certificats reconnus et rapport d'avancement individuel." },
  { num:5, icon:"🔄", title:"Suivi post-formation",         desc:"Accompagnement des apprenants à J+30 et J+90 pour ancrer les acquis et mesurer l'impact terrain." },
];

const PROGRAMMES = [
  { cat:"Management",       title:"Leadership & Management d'équipe",      duree:"2 jours",  niveau:"Tous niveaux",  certif:true  },
  { cat:"Finance",          title:"Finance pour non-financiers",             duree:"1 jour",   niveau:"Débutant",      certif:true  },
  { cat:"Stratégie",        title:"Business Model & Stratégie d'entreprise",duree:"3 jours",  niveau:"Intermédiaire", certif:true  },
  { cat:"Commercial",       title:"Techniques de vente & négociation",       duree:"2 jours",  niveau:"Tous niveaux",  certif:false },
  { cat:"Digital",          title:"Marketing Digital & Growth Hacking",      duree:"2 jours",  niveau:"Intermédiaire", certif:true  },
  { cat:"RH",               title:"Recrutement & Marque employeur",          duree:"1 jour",   niveau:"Tous niveaux",  certif:false },
];

const PODCASTS = [
  { num:"EP.01", title:"Lever des fonds : ce que les investisseurs ne disent pas",     guest:"Karim Benali — Partner VC",      duree:"52 min", tags:["Financement","VC","Levée"] },
  { num:"EP.02", title:"Scale sans casser la culture d'entreprise",                    guest:"Sofia Mansouri — CEO @ScaleUp",   duree:"44 min", tags:["Culture","RH","Croissance"] },
  { num:"EP.03", title:"De 0 à 1M€ de CA en 18 mois : la méthode terrain",            guest:"Youssef Tazi — Fondateur @GrowX", duree:"61 min", tags:["Stratégie","CA","Growth"] },
  { num:"EP.04", title:"Pricing & Valeur : arrêtez de vous brader",                    guest:"Leila Osman — Consultante",       duree:"38 min", tags:["Pricing","Valeur","SaaS"] },
  { num:"EP.05", title:"L'audit qui a sauvé notre startup",                            guest:"Ahmed Benslimane — COO @BEH",     duree:"47 min", tags:["Audit","Conformité","Ops"] },
  { num:"EP.06", title:"Recruter des A-players sans budget RH",                        guest:"Nadia Khalil — DRH @FastTrack",   duree:"55 min", tags:["Recrutement","Talent","RH"] },
];

const OTHERS = [
  { slug:"consulting",     icon:<FaChartLine/>,   color:"#3B82F6", title:"Consulting",    badge:"Stratégie" },
  { slug:"audit-sur-site", icon:<FaSearchPlus/>,  color:"#8B5CF6", title:"Audit sur site",badge:"Terrain"   },
  { slug:"accompagnement", icon:<FaHandsHelping/>,color:"#F7B500", title:"Accompagnement",badge:"Suivi"     },
];
const NAV = [
  {label:"Consulting",slug:"consulting"},{label:"Audit sur site",slug:"audit-sur-site"},
  {label:"Accompagnement",slug:"accompagnement"},{label:"Formations",slug:"formations"},
];

export default function FormationsPage() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<number|null>(null);
  const [tab, setTab] = useState<"formations"|"podcasts">("formations");

  return (
    <div className="font-[Plus_Jakarta_Sans,sans-serif] text-gray-700 bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes floatY{0%,100%{transform:translateY(-50%) rotate(45deg)}50%{transform:translateY(calc(-50% - 14px)) rotate(45deg)}}
        @keyframes fadeSlideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes heroIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tabIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .diamond-float{animation:floatY 7s ease-in-out infinite}
        .h1,.h2,.h3,.h4{animation:heroIn .8s cubic-bezier(.22,1,.36,1) both}
        .h1{animation-delay:.08s}.h2{animation-delay:.2s}.h3{animation-delay:.32s}.h4{animation-delay:.44s}
        .tab-content{animation:tabIn .35s cubic-bezier(.22,1,.36,1)}

        /* Steps */
        .sc{border:2px solid ${COLOR}22;border-radius:20px;background:white;transition:all .32s cubic-bezier(.22,1,.36,1);cursor:pointer;box-shadow:0 2px 14px rgba(10,37,64,.05)}
        .sc:hover,.sc.on{border-color:${COLOR};background:${COLOR}05;transform:translateX(6px);box-shadow:0 10px 36px ${COLOR}20}
        .sn{width:52px;height:52px;border-radius:16px;background:${COLOR}15;border:2px solid ${COLOR}30;color:#166534;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;flex-shrink:0;transition:all .3s}
        .sc:hover .sn,.sc.on .sn{background:${COLOR};color:white;border-color:${COLOR};box-shadow:0 6px 20px ${COLOR}50}
        .sd{max-height:0;overflow:hidden;opacity:0;transition:max-height .4s cubic-bezier(.22,1,.36,1),opacity .3s,margin-top .3s}
        .sc.on .sd{max-height:100px;opacity:1;margin-top:10px}

        /* Tab switcher */
        .tab-btn{padding:12px 28px;border-radius:12px;font-weight:800;font-size:15px;cursor:pointer;border:2px solid transparent;transition:all .25s;font-family:inherit}
        .tab-btn.active-f{background:#22C55E;color:white;box-shadow:0 6px 20px rgba(34,197,94,.3)}
        .tab-btn.active-p{background:#EF4444;color:white;box-shadow:0 6px 20px rgba(239,68,68,.3)}
        .tab-btn.inactive{background:rgba(10,37,64,0.05);color:#0A2540;border-color:rgba(10,37,64,0.1)}
        .tab-btn.inactive:hover{background:rgba(10,37,64,0.09)}

        /* Programme cards */
        .prog-card{border:1.5px solid rgba(34,197,94,.15);border-radius:18px;background:white;padding:22px;transition:all .3s;box-shadow:0 2px 12px rgba(10,37,64,.05)}
        .prog-card:hover{transform:translateY(-5px);box-shadow:0 18px 40px rgba(34,197,94,.14);border-color:rgba(34,197,94,.4)}

        /* Podcast cards */
        .pod-card{border:1.5px solid rgba(239,68,68,.12);border-radius:18px;background:white;padding:24px;transition:all .3s;box-shadow:0 2px 12px rgba(10,37,64,.05);cursor:pointer}
        .pod-card:hover{transform:translateY(-5px);box-shadow:0 18px 40px rgba(239,68,68,.14);border-color:rgba(239,68,68,.4)}
        .pod-card:hover .play-btn{background:#EF4444!important;color:white!important;box-shadow:0 6px 18px rgba(239,68,68,.35)}
        .play-btn{width:44px;height:44px;border-radius:50%;background:rgba(239,68,68,.1);border:2px solid rgba(239,68,68,.25);color:#EF4444;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .3s}

        /* Other cards */
        .oc{border:1.5px solid rgba(10,37,64,.08);border-radius:16px;background:white;padding:22px;transition:all .3s;text-decoration:none;display:block;box-shadow:0 2px 12px rgba(10,37,64,.05)}
        .oc:hover{transform:translateY(-7px);box-shadow:0 20px 44px rgba(10,37,64,.12)}
        .drop-item{display:flex;align-items:center;gap:10px;padding:10px 18px;color:#0A2540;text-decoration:none;font-size:14px;font-weight:600;transition:background .15s}
        .drop-item:hover{background:#FFFBEB}
        .btn-conn{border:2px solid #0A2540;color:#0A2540;background:transparent;padding:9px 22px;border-radius:9px;font-weight:700;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-conn:hover{background:#F7B500;border-color:#F7B500;transform:translateY(-2px)}
        .btn-insc{background:#F7B500;color:#0A2540;border:2px solid #F7B500;padding:9px 22px;border-radius:9px;font-weight:800;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-insc:hover{background:#e6a800;transform:translateY(-2px);box-shadow:0 8px 22px rgba(247,181,0,.38)}
        .bar-g{width:4px;border-radius:99px;background:#22C55E;flex-shrink:0}
        .bar-r{width:4px;border-radius:99px;background:#EF4444;flex-shrink:0}
      `}</style>

      {/* ── HEADER ── */}
      <header className="bg-white sticky top-0 z-[100]" style={{boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <svg width="44" height="44" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="12" fill="#0A2540"/>
              <rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15"/>
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial" letterSpacing="0.5">BEH</text>
            </svg>
            <div>
              <div className="font-black text-[18px] text-[#0A2540] leading-none">Business <span className="text-[#F7B500]">Expert</span> Hub</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-[0.8px] mt-[3px] font-semibold">Plateforme Experts &amp; Startups</div>
            </div>
          </Link>
          <nav className="flex gap-7 items-center">
            <Link href="/" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">Accueil</Link>
            <Link href="/a-propos" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">À propos</Link>
            <div className="relative" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
              <span className="text-[#F7B500] font-bold text-[15px] cursor-pointer">Services ▾</span>
              {open && (
                <ul className="absolute top-full left-0 bg-white rounded-xl min-w-[210px] list-none p-[8px_0] m-0 z-[200]"
                  style={{boxShadow:"0 8px 30px rgba(0,0,0,.12)",animation:"fadeSlideDown .2s ease"}}>
                  {NAV.map(s=><li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">Experts</Link>
            <Link href="/blog" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">Blog</Link>
            <Link href="/contact" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">Contact</Link>
          </nav>
          <div className="flex gap-3">
            <Link href="/connexion"><button className="btn-conn">Connexion</button></Link>
            <Link href="/inscription"><button className="btn-insc">{"S'inscrire"}</button></Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative text-white overflow-hidden"
        style={{background:"linear-gradient(135deg,#0A2540 0%,#0a2e1a 55%,#081B10 100%)",padding:"80px 24px 100px"}}>
        {[{w:420,r:-80,d:"0s"},{w:250,r:110,d:"1.5s"},{w:130,r:200,d:"0.8s"}].map((d,i)=>(
          <div key={i} className="diamond-float absolute pointer-events-none"
            style={{width:d.w,height:d.w,right:d.r,top:"50%",transform:"translateY(-50%) rotate(45deg)",
              background:"rgba(34,197,94,0.06)",border:"1px solid rgba(34,197,94,0.12)",animationDelay:d.d}}/>
        ))}
        {/* Glow rouge podcast */}
        <div className="absolute pointer-events-none" style={{bottom:-60,left:80,width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(239,68,68,0.07) 0%,transparent 65%)"}}/>
        <div className="absolute pointer-events-none" style={{top:-80,left:"30%",width:450,height:450,borderRadius:"50%",background:"radial-gradient(circle,rgba(34,197,94,0.07) 0%,transparent 65%)"}}/>

        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-7 text-[13px] text-white/50">
            <Link href="/" className="text-white/50 no-underline hover:text-[#F7B500]">Accueil</Link><span>›</span>
            <Link href="/services" className="text-white/50 no-underline hover:text-[#F7B500]">Services</Link><span>›</span>
            <span style={{color:"#4ADE80"}} className="font-semibold">Formations & Podcasts</span>
          </div>

          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              {/* Badge double */}
              <div className="h1 flex items-center gap-3 mb-7">
                <div className="w-[58px] h-[58px] rounded-[18px] flex items-center justify-center text-[24px]"
                  style={{background:"rgba(34,197,94,0.18)",border:"1.5px solid rgba(34,197,94,0.35)",color:"#4ADE80"}}>
                  <FaGraduationCap/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="inline-block bg-[#22C55E] text-white font-black text-[11px] tracking-[2.5px] uppercase px-3 py-1 rounded-full">Certifications</span>
                  <span className="inline-block bg-[#EF4444] text-white font-black text-[11px] tracking-[2.5px] uppercase px-3 py-1 rounded-full">Podcasts exclusifs</span>
                </div>
              </div>

              <h1 className="h2 font-black m-0 mb-6 leading-[1.05]" style={{fontSize:"clamp(36px,5vw,62px)"}}>
                Formations<br/><span style={{color:"#4ADE80"}}>& Podcasts</span>
              </h1>
              <p className="h3 text-[17px] text-white/70 leading-[1.85] mb-9 max-w-[500px]">
                Montez en compétences avec nos programmes certifiants sur mesure. Inspirez-vous avec nos podcasts exclusifs animés par des experts et investisseurs reconnus.
              </p>
              <div className="h4 flex gap-3 flex-wrap">
                <Link href="/inscription"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[12px] font-black text-[15px] no-underline text-[#0A2540]"
                  style={{background:"#F7B500"}}>
                  S&apos;inscrire à une formation <FaArrowRight size={13}/>
                </Link>
                <Link href="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[12px] font-bold text-[15px] no-underline text-white"
                  style={{background:"rgba(255,255,255,0.08)",border:"2px solid rgba(255,255,255,0.22)"}}>
                  Nous contacter
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {icon:<FaUsers/>,      val:"600+", label:"Apprenants formés",      c:"#22C55E"},
                {icon:<FaTrophy/>,     val:"18",   label:"Certifications délivrées",c:"#F7B500"},
                {icon:<FaHeadphones/>, val:"30+",  label:"Épisodes podcast",        c:"#EF4444"},
                {icon:<FaStar/>,       val:"5★",   label:"Note moyenne formations", c:"#3B82F6"},
              ].map((s,i)=>(
                <div key={i} className="rounded-[18px] p-5" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3 text-[14px]" style={{background:`${s.c}25`,color:s.c}}>{s.icon}</div>
                  <div className="text-[26px] font-black text-white leading-none mb-1">{s.val}</div>
                  <div className="text-[12px] text-white/45 font-semibold leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6">

        {/* ── MÉTHODOLOGIE ── */}
        <section className="py-16 border-b border-gray-100">
          <FadeUp>
            <div className="flex items-center gap-3 mb-2"><div className="bar-g h-8"/><h2 className="font-black text-[#0A2540] m-0 text-[26px]">Notre approche pédagogique</h2></div>
            <p className="text-gray-500 text-[15px] mb-10 pl-4">5 étapes pour une formation qui transforme réellement vos équipes</p>
          </FadeUp>
          <div className="relative">
            <div className="absolute pointer-events-none" style={{left:25,top:26,bottom:26,width:2,background:"linear-gradient(to bottom,#22C55E,rgba(34,197,94,0.08))"}}/>
            <div className="flex flex-col gap-4">
              {STEPS.map((s,i)=>(
                <FadeUp key={i} delay={i*0.09}>
                  <div className={`sc ${step===i?"on":""}`} style={{padding:"22px 26px"}} onClick={()=>setStep(step===i?null:i)}>
                    <div className="flex items-start gap-4">
                      <div className="sn">{s.num}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-[22px] leading-none">{s.icon}</span>
                            <h3 className="font-black text-[#0A2540] m-0 text-[17px] leading-snug">{s.title}</h3>
                          </div>
                          <FaChevronDown className="text-gray-400 flex-shrink-0 transition-transform duration-300"
                            style={{transform:step===i?"rotate(180deg)":"rotate(0deg)",fontSize:14}}/>
                        </div>
                        <div className="sd"><p className="text-gray-500 m-0 text-[14px] leading-[1.78]">{s.desc}</p></div>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── TAB FORMATIONS / PODCASTS ── */}
        <section className="py-16 border-b border-gray-100">
          <FadeUp>
            {/* Switcher */}
            <div className="flex items-center gap-4 mb-10">
              <button
                className={`tab-btn ${tab==="formations"?"active-f":"inactive"}`}
                onClick={()=>setTab("formations")}>
                <FaGraduationCap className="inline mr-2 mb-[2px]"/>Programmes de formation
              </button>
              <button
                className={`tab-btn ${tab==="podcasts"?"active-p":"inactive"}`}
                onClick={()=>setTab("podcasts")}>
                <FaMicrophone className="inline mr-2 mb-[2px]"/>Podcasts exclusifs
              </button>
            </div>
          </FadeUp>

          {/* FORMATIONS */}
          {tab === "formations" && (
            <div className="tab-content">
              <FadeUp>
                <div className="flex items-center gap-3 mb-8"><div className="bar-g h-8"/><h2 className="font-black text-[#0A2540] m-0 text-[24px]">Nos programmes certifiants</h2></div>
              </FadeUp>
              <div className="grid grid-cols-2 gap-5">
                {PROGRAMMES.map((p,i)=>(
                  <FadeUp key={i} delay={i*0.07}>
                    <div className="prog-card">
                      <div className="flex items-start justify-between mb-4">
                        <span className="inline-block text-[11px] font-black tracking-[2px] uppercase px-3 py-1 rounded-full"
                          style={{background:"rgba(34,197,94,0.1)",color:"#166534",border:"1px solid rgba(34,197,94,0.2)"}}>
                          {p.cat}
                        </span>
                        {p.certif && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F7B500] bg-[#FFFBEB] border border-[#F7B500]/30 px-2.5 py-1 rounded-full">
                            🏅 Certifiant
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-[#0A2540] text-[16px] mb-4 leading-snug">{p.title}</h3>
                      <div className="flex items-center gap-4 text-[13px] text-gray-500 font-semibold">
                        <span className="flex items-center gap-1.5"><FaClock style={{color:"#22C55E",fontSize:12}}/>{p.duree}</span>
                        <span className="flex items-center gap-1.5"><FaUsers style={{color:"#22C55E",fontSize:12}}/>{p.niveau}</span>
                      </div>
                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <Link href="/inscription" className="inline-flex items-center gap-1.5 text-[13px] font-black no-underline"
                          style={{color:"#22C55E"}}>
                          S&apos;inscrire <FaArrowRight size={10}/>
                        </Link>
                        <Link href="/contact" className="text-[13px] font-semibold text-gray-400 no-underline hover:text-gray-600">
                          En savoir plus →
                        </Link>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>
          )}

          {/* PODCASTS */}
          {tab === "podcasts" && (
            <div className="tab-content">
              <FadeUp>
                <div className="flex items-center gap-3 mb-3"><div className="bar-r h-8"/><h2 className="font-black text-[#0A2540] m-0 text-[24px]">Podcasts exclusifs</h2></div>
                <p className="text-gray-500 text-[15px] mb-8 pl-4">Épisodes bi-mensuels avec des entrepreneurs, experts et investisseurs — disponibles sur toutes les plateformes</p>
              </FadeUp>

              {/* Plateformes */}
              <div className="flex gap-3 mb-8 flex-wrap">
                {["Spotify","Apple Podcasts","Deezer","YouTube Music","Amazon Music"].map((p,i)=>(
                  <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold border"
                    style={{background:"rgba(239,68,68,0.06)",borderColor:"rgba(239,68,68,0.2)",color:"#991b1b"}}>
                    <FaHeadphones style={{fontSize:11}}/>{p}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                {PODCASTS.map((pod,i)=>(
                  <FadeUp key={i} delay={i*0.07}>
                    <div className="pod-card">
                      <div className="flex items-center gap-5">
                        {/* Numéro épisode */}
                        <div className="w-[64px] h-[64px] rounded-[16px] flex flex-col items-center justify-center flex-shrink-0"
                          style={{background:"linear-gradient(135deg,rgba(239,68,68,0.12),rgba(239,68,68,0.06))",border:"1.5px solid rgba(239,68,68,0.18)"}}>
                          <FaMicrophone style={{color:"#EF4444",fontSize:16,marginBottom:4}}/>
                          <span className="text-[10px] font-black" style={{color:"#EF4444"}}>{pod.num}</span>
                        </div>
                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-[#0A2540] text-[15px] mb-1 leading-snug">{pod.title}</h3>
                          <p className="text-gray-500 text-[13px] font-semibold mb-2">Avec <span className="text-gray-700">{pod.guest}</span></p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1 text-[12px] text-gray-400 font-semibold">
                              <FaClock style={{fontSize:10}}/>{pod.duree}
                            </span>
                            {pod.tags.map((t,j)=>(
                              <span key={j} className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                                style={{background:"rgba(239,68,68,0.08)",color:"#991b1b",border:"1px solid rgba(239,68,68,0.15)"}}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* Bouton play */}
                        <div className="play-btn flex-shrink-0">
                          <FaPlay style={{fontSize:14,marginLeft:2}}/>
                        </div>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>

              {/* CTA podcast */}
              <FadeUp>
                <div className="mt-8 rounded-[20px] p-6 flex items-center justify-between gap-6"
                  style={{background:"linear-gradient(135deg,rgba(239,68,68,0.07),rgba(239,68,68,0.03))",border:"1.5px solid rgba(239,68,68,0.15)"}}>
                  <div>
                    <div className="font-black text-[#0A2540] text-[17px] mb-1">Proposer un sujet ou être invité ?</div>
                    <div className="text-gray-500 text-[14px]">Contactez notre équipe éditoriale pour participer à nos prochains épisodes.</div>
                  </div>
                  <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] font-black text-[14px] no-underline text-white whitespace-nowrap"
                    style={{background:"#EF4444"}}>
                    Nous contacter <FaArrowRight size={12}/>
                  </Link>
                </div>
              </FadeUp>
            </div>
          )}
        </section>

        {/* ── CTA FORMATIONS ── */}
        <FadeUp>
          <section className="py-16 border-b border-gray-100">
            <div className="rounded-[26px] overflow-hidden relative"
              style={{background:"linear-gradient(135deg,#0a2e1a,#0A2540)",padding:"52px 56px"}}>
              <div className="absolute top-0 right-0 w-[340px] h-[340px] pointer-events-none"
                style={{background:"radial-gradient(circle,rgba(34,197,94,0.12) 0%,transparent 65%)"}}/>
              <div className="absolute bottom-0 left-0 w-[260px] h-[260px] pointer-events-none"
                style={{background:"radial-gradient(circle,rgba(239,68,68,0.08) 0%,transparent 65%)"}}/>
              <div className="relative z-10 flex items-center justify-between gap-8">
                <div>
                  <h3 className="font-black text-white text-[28px] m-0 mb-3">
                    Prêt à <span style={{color:"#4ADE80"}}>former vos équipes</span> et <span style={{color:"#FCA5A5"}}>vous inspirer ?</span>
                  </h3>
                  <p className="text-white/55 text-[16px] m-0 max-w-[500px] leading-[1.7]">
                    Programmes certifiants sur mesure + accès illimité à tous nos podcasts exclusifs.
                  </p>
                </div>
                <div className="flex flex-col gap-3 flex-shrink-0">
                  <Link href="/inscription"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[12px] font-black text-[15px] no-underline text-[#0A2540] whitespace-nowrap"
                    style={{background:"#F7B500"}}>
                    S&apos;inscrire maintenant <FaArrowRight size={13}/>
                  </Link>
                  <Link href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-[12px] font-bold text-[14px] no-underline text-white whitespace-nowrap"
                    style={{background:"rgba(255,255,255,0.08)",border:"1.5px solid rgba(255,255,255,0.2)"}}>
                    Demander un devis
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </FadeUp>

        {/* ── AUTRES SERVICES ── */}
        <FadeUp>
          <section className="py-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3"><div className="bar-g h-8"/><h2 className="font-black text-[#0A2540] m-0 text-[22px]">Autres services</h2></div>
              <Link href="/services" className="flex items-center gap-2 font-bold text-[14px] no-underline hover:underline"
                style={{color:COLOR}}><FaArrowLeft size={11}/>Tous les services</Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {OTHERS.map((s,i)=>(
                <Link key={i} href={`/services/${s.slug}`} className="oc">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[16px]"
                      style={{background:`${s.color}15`,color:s.color}}>{s.icon}</div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-[1px]"
                      style={{background:`${s.color}12`,color:s.color}}>{s.badge}</span>
                  </div>
                  <div className="font-black text-[#0A2540] text-[15px] mb-2">{s.title}</div>
                  <div className="flex items-center gap-1.5 text-[13px] font-bold" style={{color:s.color}}>
                    Découvrir <FaArrowRight size={10}/>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </FadeUp>

      </div>

      <footer className="bg-[#081B33] text-white py-7 px-6 text-center">
        <p className="m-0 mb-1.5 text-[14px]">© 2026 Business Expert Hub</p>
        <p className="text-white/40 text-[13px] m-0">Plateforme de mise en relation startups &amp; experts</p>
      </footer>
    </div>
  );
}