"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaHandsHelping, FaArrowRight, FaArrowLeft, FaCheckCircle, FaChartLine, FaSearchPlus, FaGraduationCap, FaUsers, FaTrophy, FaClock, FaStar, FaChevronDown, FaRocket } from "react-icons/fa";

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
  return <div ref={ref} style={{ opacity:inView?1:0, transform:inView?"translateY(0)":"translateY(36px)", transition:`opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s,transform .7s cubic-bezier(.22,1,.36,1) ${delay}s` }}>{children}</div>;
}

const COLOR = "#F7B500";
const STEPS = [
  { num:1, icon:"🤝", title:"Onboarding & cadrage",       desc:"Découverte de votre projet, définition des objectifs et des KPI de succès. Affectation de votre expert dédié sous 48h." },
  { num:2, icon:"📋", title:"Plan d'action personnalisé", desc:"Élaboration d'une feuille de route sur mesure avec jalons, priorités et ressources mobilisées." },
  { num:3, icon:"🎯", title:"Coaching hebdomadaire",       desc:"Sessions de travail régulières avec votre expert : suivi des actions, déblocage d'obstacles, adaptation du plan." },
  { num:4, icon:"📊", title:"Reporting & ajustements",     desc:"Revues mensuelles structurées : KPI, retours d'expérience, pivots stratégiques si nécessaire." },
  { num:5, icon:"🏆", title:"Bilan & capitalisation",      desc:"Clôture de l'accompagnement avec bilan complet, recommandations pour la suite et transfert de compétences." },
];
const INCLUS = ["Expert dédié tout au long du parcours","Sessions hebdomadaires (1h/semaine)","Accès à la plateforme BEH","Reporting mensuel structuré","Réseau partenaires & investisseurs","Support illimité par messagerie","Révisions du plan d'action incluses","Accès aux ressources premium"];
const FORMULES = [
  { name:"Starter", prix:"490€", duree:"/mois", desc:"Pour les startups en phase de démarrage",    points:["1 expert dédié","2 sessions/mois","Accès plateforme","Support messagerie"],                                               color:"#3B82F6", featured:false },
  { name:"Growth",  prix:"890€", duree:"/mois", desc:"Pour les startups en phase de croissance",   points:["1 expert senior dédié","4 sessions/mois","Reporting mensuel","Réseau partenaires","Support prioritaire"],              color:"#F7B500", featured:true  },
  { name:"Scale",   prix:"1 490€",duree:"/mois",desc:"Pour les startups en phase de scaling",      points:["2 experts dédiés","Sessions illimitées","Dashboard temps réel","Accès investisseurs","Strategic board mensuel"],       color:"#8B5CF6", featured:false },
];
const OTHERS = [
  { slug:"consulting",     icon:<FaChartLine/>,   color:"#3B82F6", title:"Consulting",    badge:"Stratégie" },
  { slug:"audit-sur-site", icon:<FaSearchPlus/>,  color:"#8B5CF6", title:"Audit sur site",badge:"Terrain"   },
  { slug:"formations",     icon:<FaGraduationCap/>,color:"#22C55E",title:"Formations",    badge:"Certif."   },
];
const NAV = [{label:"Consulting",slug:"consulting"},{label:"Audit sur site",slug:"audit-sur-site"},{label:"Accompagnement",slug:"accompagnement"},{label:"Formations",slug:"formations"}];

export default function AccompagnementPage() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<number|null>(null);
  return (
    <div className="font-[Plus_Jakarta_Sans,sans-serif] text-gray-700 bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes floatY{0%,100%{transform:translateY(-50%) rotate(45deg)}50%{transform:translateY(calc(-50% - 14px)) rotate(45deg)}}
        @keyframes fadeSlideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes heroIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        .diamond-float{animation:floatY 7s ease-in-out infinite}
        .h1,.h2,.h3,.h4{animation:heroIn .8s cubic-bezier(.22,1,.36,1) both}
        .h1{animation-delay:.08s}.h2{animation-delay:.2s}.h3{animation-delay:.32s}.h4{animation-delay:.44s}
        .sc{border:2px solid rgba(247,181,0,.18);border-radius:20px;background:white;transition:all .32s cubic-bezier(.22,1,.36,1);cursor:pointer;box-shadow:0 2px 14px rgba(10,37,64,.05)}
        .sc:hover,.sc.on{border-color:#F7B500;background:rgba(247,181,0,.03);transform:translateX(6px);box-shadow:0 10px 36px rgba(247,181,0,.18)}
        .sn{width:52px;height:52px;border-radius:16px;background:rgba(247,181,0,.12);border:2px solid rgba(247,181,0,.28);color:#b88900;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;flex-shrink:0;transition:all .3s}
        .sc:hover .sn,.sc.on .sn{background:#F7B500;color:#0A2540;border-color:#F7B500;box-shadow:0 6px 20px rgba(247,181,0,.45)}
        .sd{max-height:0;overflow:hidden;opacity:0;transition:max-height .4s cubic-bezier(.22,1,.36,1),opacity .3s,margin-top .3s}
        .sc.on .sd{max-height:100px;opacity:1;margin-top:10px}
        .incl{display:flex;align-items:center;gap:12px;padding:12px 18px;border-radius:12px;background:#fffdf0;border:1px solid rgba(247,181,0,.15);transition:all .25s}
        .incl:hover{background:rgba(247,181,0,.08);border-color:rgba(247,181,0,.35);transform:translateX(5px)}
        .oc{border:1.5px solid rgba(10,37,64,.08);border-radius:16px;background:white;padding:22px;transition:all .3s;text-decoration:none;display:block;box-shadow:0 2px 12px rgba(10,37,64,.05)}
        .oc:hover{transform:translateY(-7px);box-shadow:0 20px 44px rgba(10,37,64,.12)}
        .drop-item{display:flex;align-items:center;gap:10px;padding:10px 18px;color:#0A2540;text-decoration:none;font-size:14px;font-weight:600;transition:background .15s}
        .drop-item:hover{background:#FFFBEB}
        .btn-conn{border:2px solid #0A2540;color:#0A2540;background:transparent;padding:9px 22px;border-radius:9px;font-weight:700;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-conn:hover{background:#F7B500;border-color:#F7B500;transform:translateY(-2px)}
        .btn-insc{background:#F7B500;color:#0A2540;border:2px solid #F7B500;padding:9px 22px;border-radius:9px;font-weight:800;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-insc:hover{background:#e6a800;transform:translateY(-2px);box-shadow:0 8px 22px rgba(247,181,0,.38)}
        .bar{width:4px;border-radius:99px;background:#F7B500;flex-shrink:0}
      `}</style>

      <header className="bg-white sticky top-0 z-[100]" style={{boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <svg width="44" height="44" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="12" fill="#0A2540"/><rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial" letterSpacing="0.5">BEH</text></svg>
            <div><div className="font-black text-[18px] text-[#0A2540] leading-none">Business <span className="text-[#F7B500]">Expert</span> Hub</div><div className="text-[10px] text-gray-400 uppercase tracking-[0.8px] mt-[3px] font-semibold">Plateforme Experts &amp; Startups</div></div>
          </Link>
          <nav className="flex gap-7 items-center">
            <Link href="/" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">Accueil</Link>
            <Link href="/a-propos" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">À propos</Link>
            <div className="relative" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
              <span className="text-[#F7B500] font-bold text-[15px] cursor-pointer">Services ▾</span>
              {open && <ul className="absolute top-full left-0 bg-white rounded-xl min-w-[210px] list-none p-[8px_0] m-0 z-[200]" style={{boxShadow:"0 8px 30px rgba(0,0,0,.12)",animation:"fadeSlideDown .2s ease"}}>
                {NAV.map(s=><li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>)}
              </ul>}
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

      <section className="relative text-white overflow-hidden" style={{background:"linear-gradient(135deg,#0A2540 0%,#1a2e0a 50%,#0a2010 100%)",padding:"80px 24px 100px"}}>
        {[{w:400,r:-80,d:"0s"},{w:240,r:110,d:"1.5s"}].map((d,i)=>(
          <div key={i} className="diamond-float absolute pointer-events-none" style={{width:d.w,height:d.w,right:d.r,top:"50%",transform:"translateY(-50%) rotate(45deg)",background:"rgba(247,181,0,0.07)",border:"1px solid rgba(247,181,0,0.12)",animationDelay:d.d}}/>
        ))}
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-7 text-[13px] text-white/50">
            <Link href="/" className="text-white/50 no-underline hover:text-[#F7B500]">Accueil</Link><span>›</span>
            <Link href="/services" className="text-white/50 no-underline hover:text-[#F7B500]">Services</Link><span>›</span>
            <span className="text-[#F7B500] font-semibold">Accompagnement</span>
          </div>
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <div className="h1 flex items-center gap-3 mb-7">
                <div className="w-[58px] h-[58px] rounded-[18px] flex items-center justify-center text-[24px]" style={{background:"rgba(247,181,0,0.18)",border:"1.5px solid rgba(247,181,0,0.35)",color:"#F7B500"}}><FaHandsHelping/></div>
                <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[12px] tracking-[3px] uppercase px-4 py-2 rounded-full">Suivi continu</span>
              </div>
              <h1 className="h2 font-black m-0 mb-6 leading-[1.05]" style={{fontSize:"clamp(38px,5vw,64px)"}}>Accompagnement<br/><span className="text-[#F7B500]">personnalisé</span></h1>
              <p className="h3 text-[17px] text-white/70 leading-[1.85] mb-9 max-w-[500px]">Un expert dédié à vos côtés tout au long de votre parcours de croissance. Coaching, stratégie et réseau pour atteindre vos objectifs.</p>
              <div className="h4 flex gap-3 flex-wrap">
                <Link href="/inscription" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[12px] font-black text-[15px] no-underline text-[#0A2540]" style={{background:"#F7B500"}}>Démarrer maintenant <FaArrowRight size={13}/></Link>
                <Link href="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[12px] font-bold text-[15px] no-underline text-white" style={{background:"rgba(255,255,255,0.08)",border:"2px solid rgba(255,255,255,0.22)"}}>Nous contacter</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{icon:<FaUsers/>,val:"120+",label:"Startups suivies",c:"#F7B500"},{icon:<FaTrophy/>,val:"92%",label:"Objectifs atteints",c:"#22C55E"},{icon:<FaClock/>,val:"48h",label:"Délai d'affectation",c:"#3B82F6"},{icon:<FaStar/>,val:"5★",label:"Note moyenne",c:"#EF4444"}].map((s,i)=>(
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
        <FadeUp><section className="py-16 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-8"><div className="bar h-8"/><h2 className="font-black text-[#0A2540] m-0 text-[26px]">Ce qui est inclus</h2></div>
          <div className="grid grid-cols-2 gap-3">
            {INCLUS.map((item,i)=>(
              <div key={i} className="incl">
                <div className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0" style={{background:"rgba(247,181,0,0.12)",border:"1px solid rgba(247,181,0,0.25)"}}><FaCheckCircle style={{color:"#b88900",fontSize:13}}/></div>
                <span className="font-semibold text-[14px] text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </section></FadeUp>

        <section className="py-16 border-b border-gray-100">
          <FadeUp>
            <div className="flex items-center gap-3 mb-2"><div className="bar h-8"/><h2 className="font-black text-[#0A2540] m-0 text-[26px]">Notre processus d&apos;accompagnement</h2></div>
            <p className="text-gray-500 text-[15px] mb-10 pl-4">5 étapes pour un suivi structuré et efficace — cliquez pour les détails</p>
          </FadeUp>
          <div className="relative">
            <div className="absolute pointer-events-none" style={{left:25,top:26,bottom:26,width:2,background:"linear-gradient(to bottom,#F7B500,rgba(247,181,0,0.1))"}}/>
            <div className="flex flex-col gap-4">
              {STEPS.map((s,i)=>(
                <FadeUp key={i} delay={i*0.09}>
                  <div className={`sc ${step===i?"on":""}`} style={{padding:"22px 26px"}} onClick={()=>setStep(step===i?null:i)}>
                    <div className="flex items-start gap-4">
                      <div className="sn">{s.num}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3"><span className="text-[22px] leading-none">{s.icon}</span><h3 className="font-black text-[#0A2540] m-0 text-[17px] leading-snug">{s.title}</h3></div>
                          <FaChevronDown className="text-gray-400 flex-shrink-0 transition-transform duration-300" style={{transform:step===i?"rotate(180deg)":"rotate(0deg)",fontSize:14}}/>
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

        {/* FORMULES */}
        <FadeUp><section className="py-16 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2"><div className="bar h-8"/><h2 className="font-black text-[#0A2540] m-0 text-[26px]">Nos formules</h2></div>
          <p className="text-gray-500 text-[15px] mb-10 pl-4">Choisissez la formule adaptée à votre stade de développement</p>
          <div className="grid grid-cols-3 gap-6">
            {FORMULES.map((f,i)=>(
              <div key={i} className="rounded-[22px] border-[2px] p-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-2"
                style={{borderColor:f.featured?"#F7B500":"rgba(10,37,64,0.1)",boxShadow:f.featured?"0 12px 40px rgba(247,181,0,0.2)":"0 4px 20px rgba(10,37,64,0.06)",background:"white"}}>
                {f.featured && <div className="absolute top-0 right-0 text-[11px] font-black tracking-[2px] uppercase px-4 py-2 rounded-bl-[14px]" style={{background:"#F7B500",color:"#0A2540"}}>⭐ Populaire</div>}
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-5 text-[16px]" style={{background:`${f.color}15`,color:f.color}}><FaRocket/></div>
                <div className="font-black text-[#0A2540] text-[18px] mb-1">{f.name}</div>
                <div className="text-gray-500 text-[13px] mb-5">{f.desc}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-[34px] font-black" style={{color:f.color}}>{f.prix}</span>
                  <span className="text-gray-400 text-[14px]">{f.duree}</span>
                </div>
                <ul className="list-none p-0 m-0 flex flex-col gap-2.5 mb-7">
                  {f.points.map((p,j)=><li key={j} className="flex items-center gap-2 text-[13px] text-gray-700 font-semibold"><FaCheckCircle style={{color:f.color,fontSize:12,flexShrink:0}}/>{p}</li>)}
                </ul>
                <Link href="/inscription" className="block text-center py-3 rounded-[11px] font-black text-[14px] no-underline transition-all"
                  style={f.featured?{background:"#F7B500",color:"#0A2540"}:{background:"rgba(10,37,64,0.06)",color:"#0A2540",border:"1.5px solid rgba(10,37,64,0.12)"}}>
                  Choisir cette formule
                </Link>
              </div>
            ))}
          </div>
        </section></FadeUp>

        <FadeUp><section className="py-16 border-b border-gray-100">
          <div className="rounded-[26px] overflow-hidden relative" style={{background:"linear-gradient(135deg,#0A2540,#1a2e0a)",padding:"52px 56px"}}>
            <div className="absolute top-0 right-0 w-[340px] h-[340px] pointer-events-none" style={{background:"radial-gradient(circle,rgba(247,181,0,0.12) 0%,transparent 65%)"}}/>
            <div className="relative z-10 flex items-center justify-between gap-8">
              <div>
                <h3 className="font-black text-white text-[28px] m-0 mb-3">Prêt à être <span className="text-[#F7B500]">accompagné ?</span></h3>
                <p className="text-white/55 text-[16px] m-0 max-w-[460px] leading-[1.7]">Votre expert dédié est affecté sous 48h. Premier entretien de cadrage offert.</p>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0">
                <Link href="/inscription" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[12px] font-black text-[15px] no-underline text-[#0A2540] whitespace-nowrap" style={{background:"#F7B500"}}>Démarrer maintenant <FaArrowRight size={13}/></Link>
                <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-[12px] font-bold text-[14px] no-underline text-white whitespace-nowrap" style={{background:"rgba(255,255,255,0.08)",border:"1.5px solid rgba(255,255,255,0.2)"}}>Poser une question</Link>
              </div>
            </div>
          </div>
        </section></FadeUp>

        <FadeUp><section className="py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3"><div className="bar h-8"/><h2 className="font-black text-[#0A2540] m-0 text-[22px]">Autres services</h2></div>
            <Link href="/services" className="flex items-center gap-2 font-bold text-[14px] no-underline hover:underline text-[#F7B500]"><FaArrowLeft size={11}/>Tous les services</Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {OTHERS.map((s,i)=>(
              <Link key={i} href={`/services/${s.slug}`} className="oc">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[16px]" style={{background:`${s.color}15`,color:s.color}}>{s.icon}</div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-[1px]" style={{background:`${s.color}12`,color:s.color}}>{s.badge}</span>
                </div>
                <div className="font-black text-[#0A2540] text-[15px] mb-2">{s.title}</div>
                <div className="flex items-center gap-1.5 text-[13px] font-bold" style={{color:s.color}}>Découvrir <FaArrowRight size={10}/></div>
              </Link>
            ))}
          </div>
        </section></FadeUp>
      </div>

      <footer className="bg-[#081B33] text-white py-7 px-6 text-center">
        <p className="m-0 mb-1.5 text-[14px]">© 2026 Business Expert Hub</p>
        <p className="text-white/40 text-[13px] m-0">Plateforme de mise en relation startups &amp; experts</p>
      </footer>
    </div>
  );
}