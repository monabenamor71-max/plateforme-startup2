"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaChartLine, FaSearchPlus, FaHandsHelping, FaGraduationCap, FaArrowRight, FaCheckCircle } from "react-icons/fa";

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
  return <div ref={ref} style={{ opacity:inView?1:0, transform:inView?"translateY(0)":"translateY(44px)", transition:`opacity .75s cubic-bezier(.22,1,.36,1) ${delay}s,transform .75s cubic-bezier(.22,1,.36,1) ${delay}s` }}>{children}</div>;
}

const SERVICES = [
  { slug:"consulting",     icon:<FaChartLine/>,    color:"#3B82F6", badge:"Stratégie",     title:"Consulting",     desc:"Accompagnement personnalisé des entreprises et des clients pour améliorer leur performance à travers une approche structurée et orientée résultats.", points:["Analyse des besoins et définition des objectifs","Élaboration d'une stratégie et plan d'action","Suivi de la mise en œuvre et optimisation"] },
  { slug:"audit-sur-site", icon:<FaSearchPlus/>,   color:"#8B5CF6", badge:"Terrain",       title:"Audit sur site", desc:"Évaluation complète de vos activités et processus directement sur site afin d’identifier les axes d’amélioration et garantir la conformité.",   points:["Analyse initiale et cadrage de la mission","Audit terrain et collecte des données","Rapport détaillé avec recommandations"] },
  { slug:"nos-plateformes", icon:<FaHandsHelping/>, color:"#F7B500", badge:"Suivi continu", title:"Nos plateformes", desc:"Nous accompagnons les clients dans la conception et le développement de plateformes digitales et d’applications performantes, évolutives et adaptées à leurs besoins spécifiques.",        points:["Conception et développement de plateformes web","Création d'applications mobiles et systèmes métiers","Intégration et optimisation des solutions digitales"] },
  { slug:"formations",     icon:<FaGraduationCap/>,color:"#22C55E", badge:"Certif.",       title:"Formations",     desc:"Programmes certifiants sur mesure pour vos équipes + podcasts exclusifs avec des experts et investisseurs.",                  points:["Présentiel & distanciel","Certifications reconnues","Podcasts & masterclasses"] },
];

export default function ServicesPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="font-[Plus_Jakarta_Sans,sans-serif] text-gray-700 bg-[#fafbff]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes floatY{0%,100%{transform:translateY(-50%) rotate(45deg)}50%{transform:translateY(calc(-50% - 14px)) rotate(45deg)}}
        @keyframes fadeSlideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
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

      <header className="bg-white sticky top-0 z-[100]" style={{boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <svg width="44" height="44" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="12" fill="#0A2540"/><rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial">BEH</text></svg>
            <div className="font-black text-[18px] text-[#0A2540]">Business <span className="text-[#F7B500]">Expert</span> Hub</div>
          </Link>
          <nav className="flex gap-7 items-center">
            <Link href="/" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">Accueil</Link>
            <Link href="/a-propos" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">À propos</Link>
            <div className="relative" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
              <span className="text-[#F7B500] font-bold text-[15px] cursor-pointer">Services ▾</span>
              {open && <ul className="absolute top-full left-0 bg-white rounded-xl min-w-[220px] list-none p-[8px_0] m-0 z-[200]" style={{boxShadow:"0 8px 30px rgba(0,0,0,0.12)",animation:"fadeSlideDown .2s ease"}}>
                {SERVICES.map(s=><li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item"><span style={{color:s.color,fontSize:15}}>{s.icon}</span>{s.title}</Link></li>)}
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

      <section className="text-white relative overflow-hidden" style={{background:"linear-gradient(135deg,#0A2540 0%,#0d3060 60%,#081B33 100%)",padding:"80px 24px 90px"}}>
        {[{w:360,r:-60,d:"0s"},{w:220,r:80,d:"1.4s"},{w:120,r:130,d:"0.7s"}].map((d,i)=>(
          <div key={i} className="diamond-float absolute pointer-events-none" style={{width:d.w,height:d.w,right:d.r,top:"50%",transform:"translateY(-50%) rotate(45deg)",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",animationDelay:d.d}}/>
        ))}
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-6 text-[13px] text-white/50">
            <Link href="/" className="text-white/50 no-underline hover:text-[#F7B500]">Accueil</Link><span>›</span>
            <span className="text-[#F7B500] font-semibold">Nos Services</span>
          </div>
          <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[12px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-[22px]">Notre offre</span>
          <h1 className="font-black m-0 mb-5 leading-[1.1]" style={{fontSize:"clamp(36px,5vw,60px)"}}>Nos <span className="text-[#F7B500]">Services</span></h1>
          <p className="text-[18px] text-white/75 max-w-[620px] leading-[1.75] m-0">Notre plateforme propose une diversité de services destinés à accompagner les entreprises et les particuliers, grâce à l’intervention d’experts qualifiés dans différents domaines.</p>
          <div className="flex gap-10 mt-11 flex-wrap">
            {[["4","Services disponibles"],["80+","Experts certifiés"],["150+","Startups accompagnées"]].map(([v,l])=>(
              <div key={l}><div className="text-[32px] font-black text-[#F7B500]">{v}</div><div className="text-[13px] text-white/50 mt-[3px]">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[90px] px-6 max-w-[1200px] mx-auto">
        <FadeUp><div className="text-center mb-16">
          <h2 className="font-black text-[#0A2540] m-0 mb-3.5" style={{fontSize:"clamp(28px,3.5vw,44px)"}}>Choisissez votre <span className="text-[#F7B500]">service</span></h2>
          <p className="text-gray-500 text-[15px] max-w-[560px] mx-auto">Des solutions sur mesure pour accompagner votre startup à chaque étape de sa croissance</p>
        </div></FadeUp>
        <div className="grid grid-cols-2 gap-8">
          {SERVICES.map((svc,i)=>(
            <FadeUp key={svc.slug} delay={i*0.1}>
              <Link href={`/services/${svc.slug}`} className="no-underline block h-full">
                <div className="svc-card h-full">
                  <div className="h-[5px]" style={{background:`linear-gradient(90deg,${svc.color},transparent)`}}/>
                  <div className="flex-1 flex flex-col" style={{padding:"36px 32px"}}>
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-[62px] h-[62px] rounded-2xl flex items-center justify-center text-[26px]" style={{background:`linear-gradient(135deg,${svc.color}22,${svc.color}44)`,color:svc.color,border:`1.5px solid ${svc.color}33`}}>{svc.icon}</div>
                      <div className="flex items-center gap-3">
                        <span className="bg-[#0A2540]/[0.06] text-gray-500 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-[1px]">{svc.badge}</span>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background:`${svc.color}15`,border:`1.5px solid ${svc.color}30`}}>
                          <FaArrowRight className="arrow-ic text-[11px]" style={{color:svc.color}}/>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-[22px] font-black text-[#0A2540] m-0 mb-3">{svc.title}</h3>
                    <p className="text-gray-500 leading-[1.75] text-[15px] mb-6 flex-1">{svc.desc}</p>
                    <ul className="list-none p-0 m-0 mb-7 flex flex-col gap-2.5">
                      {svc.points.map((p,j)=>(
                        <li key={j} className="flex items-center gap-2 text-[13px] text-gray-700 font-semibold">
                          <FaCheckCircle className="flex-shrink-0 text-[12px]" style={{color:svc.color}}/>{p}
                        </li>
                      ))}
                    </ul>
                    <div className="card-btn self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] font-bold text-[14px] text-white" style={{background:"#0A2540"}}>
                      Voir le service <FaArrowRight className="arrow-ic" size={12}/>
                    </div>
                  </div>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
      </section>

     
      <footer className="bg-[#081B33] text-white py-7 px-6 text-center">
        <p className="m-0 mb-1.5 text-[14px]">© 2026 Business Expert Hub</p>
        <p className="text-white/40 text-[13px] m-0">Plateforme de mise en relation startups &amp; experts — Tarifs en Dinar Tunisien (DT)</p>
      </footer>
    </div>
  );
}