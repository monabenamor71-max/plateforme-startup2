"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaGraduationCap, FaArrowRight, FaArrowLeft, FaCheckCircle,
  FaChartLine, FaSearchPlus, FaHandsHelping,
  FaUsers, FaTrophy, FaClock, FaStar, FaChevronDown,
  FaMicrophone, FaPlay, FaHeadphones, FaCalendarAlt, FaLock,
  FaChalkboardTeacher, FaLaptop, FaBuilding, FaUserTie,
  FaTicketAlt, FaInfoCircle, FaCalendarCheck, FaMapMarkerAlt,
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

// PROGRAMMES COMPLETS
const PROGRAMMES = [
  // Formations GRATUITES
  { 
    id:1, cat:"Gratuit", title:"Introduction au No-Code", duree:"2h", niveau:"Débutant", certif:false, gratuit:true,
    description:"Découvrez les bases du développement sans code pour créer des applications rapidement.",
    date:"15 Avril 2026", heure:"14h00 - 16h00", format:"En ligne", formateur:"Karim Ben Ali",
    image:"/formations/nocode.jpg", placesLimit: true,
    contenu:[
      "Introduction au No-Code et ses avantages",
      "Présentation des principales plateformes No-Code (Bubble, Airtable, Webflow)",
      "Création d'une application simple sans code",
      "Bonnes pratiques et limites du No-Code"
    ],
    objectifs:[
      "Comprendre ce qu'est le No-Code et son impact sur le développement",
      "Identifier les outils No-Code adaptés à vos besoins",
      "Créer une application fonctionnelle sans écrire une ligne de code",
      "Savoir quand utiliser ou ne pas utiliser le No-Code"
    ],
    prerequis:"Aucun prérequis technique nécessaire",
    lienZoom:"https://zoom.us/j/123456789",
    supportUrl:"/formations/supports/nocode-intro.pdf"
  },
  { 
    id:2, cat:"Gratuit", title:"Fondamentaux du Lean Startup", duree:"3h", niveau:"Débutant", certif:false, gratuit:true,
    description:"Apprenez les principes du Lean Startup pour valider vos idées rapidement.",
    date:"22 Avril 2026", heure:"10h00 - 13h00", format:"En ligne", formateur:"Sofia Mansouri",
    image:"/formations/lean-startup.jpg", placesLimit: true,
    contenu:[
      "Les 3 piliers du Lean Startup (Build-Measure-Learn)",
      "Comment valider une idée avant de développer un produit",
      "MVP : définition et stratégies de création",
      "Analyser les feedbacks et pivoter"
    ],
    objectifs:[
      "Maîtriser la méthodologie Lean Startup",
      "Savoir créer un MVP efficace",
      "Apprendre à analyser les retours utilisateurs",
      "Comprendre quand et comment pivoter"
    ],
    prerequis:"Aucun prérequis, ouvert à tous",
    lienZoom:"https://zoom.us/j/987654321",
    supportUrl:"/formations/supports/lean-startup.pdf"
  },
  // Formations PAYANTES
  { 
    id:3, cat:"Management", title:"Leadership & Management d'équipe", duree:"2 jours", niveau:"Tous niveaux", certif:true, gratuit:false,
    description:"Développez vos compétences en leadership et management d'équipe.",
    date:"5-6 Mai 2026", heure:"09h00 - 17h00", format:"Présentiel", formateur:"Dr. Mohamed Ben Salem", prix:590,
    lieu:"Tunis - Centre Urbain Nord", image:"/formations/leadership.jpg", placesLimit: true,
    contenu:[
      "Les fondamentaux du leadership",
      "Communication et intelligence émotionnelle",
      "Gestion des conflits et prise de décision",
      "Motivation et engagement des équipes",
      "Leadership situationnel et agile"
    ],
    objectifs:[
      "Développer une vision stratégique de leadership",
      "Maîtriser les techniques de communication d'équipe",
      "Savoir gérer les conflits et situations difficiles",
      "Créer une culture d'entreprise performante"
    ],
    prerequis:"Expérience en management d'équipe souhaitée",
    supportUrl:"/formations/supports/leadership.pdf"
  },
  { 
    id:4, cat:"Finance", title:"Finance pour non-financiers", duree:"1 jour", niveau:"Débutant", certif:true, gratuit:false,
    description:"Maîtrisez les bases de la finance pour piloter votre entreprise.",
    date:"12 Mai 2026", heure:"09h00 - 17h00", format:"Présentiel", formateur:"Nadia Kacem", prix:390,
    lieu:"Sfax - Technopole", image:"/formations/finance.jpg", placesLimit: true,
    contenu:[
      "Les états financiers : bilan, compte de résultat",
      "Analyse de la rentabilité et des coûts",
      "Le besoin en fonds de roulement (BFR)",
      "Prévisionnels et tableaux de bord"
    ],
    objectifs:[
      "Lire et interpréter les documents financiers",
      "Analyser la santé financière de son entreprise",
      "Construire des prévisions financières",
      "Piloter la performance avec des indicateurs clés"
    ],
    prerequis:"Aucune connaissance financière préalable",
    supportUrl:"/formations/supports/finance.pdf"
  },
  { 
    id:5, cat:"Stratégie", title:"Business Model & Stratégie d'entreprise", duree:"3 jours", niveau:"Intermédiaire", certif:true, gratuit:false,
    description:"Construisez un business model solide et une stratégie gagnante.",
    date:"19-21 Mai 2026", heure:"09h00 - 17h00", format:"Hybride", formateur:"Karim Ben Hassen", prix:890,
    lieu:"En ligne / Tunis", image:"/formations/strategie.jpg", placesLimit: true,
    contenu:[
      "Analyse stratégique et diagnostic",
      "Modèles économiques innovants",
      "Plan d'action stratégique",
      "Mesure de la performance stratégique"
    ],
    objectifs:[
      "Maîtriser les outils d'analyse stratégique",
      "Concevoir un business model innovant",
      "Élaborer un plan stratégique opérationnel",
      "Piloter la mise en œuvre de la stratégie"
    ],
    prerequis:"Connaissances de base en gestion d'entreprise",
    supportUrl:"/formations/supports/strategie.pdf"
  },
  { 
    id:6, cat:"Commercial", title:"Techniques de vente & négociation", duree:"2 jours", niveau:"Tous niveaux", certif:false, gratuit:false,
    description:"Améliorez vos techniques de vente et de négociation.",
    date:"2-3 Juin 2026", heure:"09h00 - 17h00", format:"Présentiel", formateur:"Amel Ben Amor", prix:490,
    lieu:"Tunis - Lac", image:"/formations/commercial.jpg", placesLimit: true,
    contenu:[
      "Les étapes clés du processus de vente",
      "Techniques de découverte des besoins",
      "Gestion des objections",
      "Négociation et conclusion de la vente"
    ],
    objectifs:[
      "Maîtriser les techniques de vente avancées",
      "Apprendre à gérer efficacement les objections",
      "Développer des stratégies de négociation gagnantes",
      "Améliorer son taux de transformation"
    ],
    prerequis:"Expérience commerciale souhaitée",
    supportUrl:"/formations/supports/commercial.pdf"
  },
  { 
    id:7, cat:"Digital", title:"Marketing Digital & Growth Hacking", duree:"2 jours", niveau:"Intermédiaire", certif:true, gratuit:false,
    description:"Maîtrisez les stratégies de marketing digital et growth hacking.",
    date:"9-10 Juin 2026", heure:"14h00 - 18h00", format:"En ligne", formateur:"Youssef Tazi", prix:690,
    lieu:"En ligne (Zoom)", image:"/formations/digital.jpg", placesLimit: true,
    contenu:[
      "Stratégie de contenu et SEO",
      "Réseaux sociaux et publicité digitale",
      "Email marketing et automation",
      "Growth hacking et acquisition"
    ],
    objectifs:[
      "Élaborer une stratégie marketing digital complète",
      "Maîtriser les leviers d'acquisition",
      "Utiliser les outils de growth hacking",
      "Optimiser le ROI des campagnes digitales"
    ],
    prerequis:"Bases du marketing digital",
    lienZoom:"https://zoom.us/j/555666777",
    supportUrl:"/formations/supports/digital.pdf"
  },
  { 
    id:8, cat:"RH", title:"Recrutement & Marque employeur", duree:"1 jour", niveau:"Tous niveaux", certif:false, gratuit:false,
    description:"Attirez et recrutez les meilleurs talents pour votre entreprise.",
    date:"16 Juin 2026", heure:"09h00 - 17h00", format:"Présentiel", formateur:"Leila Ben Ahmed", prix:450,
    lieu:"Tunis - Centre Urbain", image:"/formations/rh.jpg", placesLimit: true,
    contenu:[
      "Stratégie de marque employeur",
      "Sourcing et attractivité des talents",
      "Processus de recrutement et évaluation",
      "Onboarding et fidélisation"
    ],
    objectifs:[
      "Construire une marque employeur forte",
      "Optimiser les processus de recrutement",
      "Attirer et recruter les meilleurs talents",
      "Fidéliser les collaborateurs"
    ],
    prerequis:"Expérience en gestion des ressources humaines",
    supportUrl:"/formations/supports/rh.pdf"
  },
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

const getFormatIcon = (format: string) => {
  if (format === "En ligne") return "💻 En ligne";
  if (format === "Présentiel") return "🏢 Présentiel";
  return "🎯 Hybride";
};

export default function FormationsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"formations"|"podcasts">("formations");
  const [expandedFormation, setExpandedFormation] = useState<number | null>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inscriptions, setInscriptions] = useState<number[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: string} | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      const savedInscriptions = localStorage.getItem('inscriptions');
      if (savedInscriptions) {
        setInscriptions(JSON.parse(savedInscriptions));
      }
    }
  }, []);

  const handleInscription = async (formation: any) => {
    // Formations gratuites : redirection directe vers la page détail
    if (formation.gratuit) {
      router.push(`/formations/${formation.id}`);
      return;
    }

    // Formations payantes : vérifier connexion
    if (!isLoggedIn) {
      setSelectedFormation(formation);
      setShowLoginModal(true);
      return;
    }

    if (inscriptions.includes(formation.id)) {
      setMessage({ text: "Vous êtes déjà inscrit à cette formation", type: "info" });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newInscriptions = [...inscriptions, formation.id];
      setInscriptions(newInscriptions);
      localStorage.setItem('inscriptions', JSON.stringify(newInscriptions));
      setMessage({ text: `✅ Inscription réussie à "${formation.title}" !`, type: "success" });
      setTimeout(() => {
        router.push(`/formations/${formation.id}`);
      }, 1500);
      setLoading(false);
    }, 1000);
  };

  const toggleExpand = (id: number) => {
    setExpandedFormation(expandedFormation === id ? null : id);
  };

  return (
    <div className="font-[Plus_Jakarta_Sans,sans-serif] text-gray-700 bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeSlideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes heroIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes tabIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .h1,.h2,.h3,.h4{animation:heroIn .8s cubic-bezier(.22,1,.36,1) both}
        .h1{animation-delay:.08s}.h2{animation-delay:.2s}.h3{animation-delay:.32s}.h4{animation-delay:.44s}
        .tab-content{animation:tabIn .35s cubic-bezier(.22,1,.36,1)}

        .tab-btn{padding:12px 28px;border-radius:12px;font-weight:800;font-size:15px;cursor:pointer;border:2px solid transparent;transition:all .25s}
        .tab-btn.active-f{background:#22C55E;color:white;box-shadow:0 6px 20px rgba(34,197,94,.3)}
        .tab-btn.active-p{background:#EF4444;color:white;box-shadow:0 6px 20px rgba(239,68,68,.3)}
        .tab-btn.inactive{background:rgba(10,37,64,0.05);color:#0A2540;border-color:rgba(10,37,64,0.1)}
        .tab-btn.inactive:hover{background:rgba(10,37,64,0.09)}

        .pro-card{background:white;border-radius:24px;overflow:hidden;transition:all .4s;box-shadow:0 8px 30px rgba(0,0,0,0.05)}
        .pro-card:hover{transform:translateY(-8px);box-shadow:0 25px 45px -12px rgba(0,0,0,0.2)}
        .pro-card-image{position:relative;height:200px;overflow:hidden}
        .pro-card-image img{width:100%;height:100%;object-fit:cover;transition:transform .6s}
        .pro-card:hover .pro-card-image img{transform:scale(1.05)}
        .pro-card-badge{position:absolute;top:16px;right:16px;z-index:10}
        .pro-card-cat{position:absolute;bottom:16px;left:16px;z-index:10}
        .pro-card-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 0%,rgba(0,0,0,0.5) 100%)}
        .pro-card-content{padding:20px}
        .pro-card-title{font-size:18px;font-weight:800;color:#0A2540;margin-bottom:8px}
        .pro-card-desc{font-size:12px;color:#64748B;margin-bottom:16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .info-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:#F8FAFC;border-radius:30px;font-size:11px;font-weight:600;color:#475569}
        .places-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:#FEF3C7;color:#F59E0B;border-radius:30px;font-size:11px;font-weight:700}
        .expand-btn{background:transparent;border:none;color:#22C55E;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;padding:8px 0}
        .expand-btn:hover{color:#F7B500}
        .expanded-content{max-height:0;overflow:hidden;transition:max-height 0.4s ease-out}
        .expanded-content.show{max-height:280px;transition:max-height 0.5s ease-in}
        .pod-card{border:1.5px solid rgba(239,68,68,.12);border-radius:20px;background:white;padding:20px;transition:all .3s;cursor:pointer}
        .pod-card:hover{transform:translateY(-4px);box-shadow:0 15px 35px rgba(239,68,68,.12);border-color:rgba(239,68,68,.3)}
        .oc-card{border:1px solid #E8EDF2;border-radius:20px;background:white;padding:24px;transition:all .3s;text-decoration:none;display:block}
        .oc-card:hover{transform:translateY(-5px);box-shadow:0 20px 35px -12px rgba(0,0,0,0.1);border-color:#F7B500}
        .btn-primary{background:#F7B500;color:#0A2540;border:none;border-radius:14px;padding:12px 20px;font-weight:800;font-size:14px;cursor:pointer;width:100%}
        .btn-primary:hover{background:#e6a800;transform:translateY(-2px)}
        .btn-success{background:#22C55E;color:white;border:none;border-radius:14px;padding:12px 20px;font-weight:800;width:100%}
        .drop-item{display:flex;align-items:center;gap:10px;padding:10px 18px;color:#0A2540;text-decoration:none;font-size:14px;font-weight:600}
        .drop-item:hover{background:#FFFBEB}
        .btn-conn{border:2px solid #0A2540;color:#0A2540;background:transparent;padding:9px 22px;border-radius:9px;font-weight:700;font-size:14px;cursor:pointer}
        .btn-conn:hover{background:#F7B500;border-color:#F7B500}
        .btn-insc{background:#F7B500;color:#0A2540;border:2px solid #F7B500;padding:9px 22px;border-radius:9px;font-weight:800;font-size:14px;cursor:pointer}
        .btn-insc:hover{background:#e6a800}
        .notification{animation:slideIn .3s ease-out}
        @keyframes slideIn{from{opacity:0;transform:translateX(100px)}to{opacity:1;transform:translateX(0)}}
      `}</style>

      {/* HEADER */}
      <header className="bg-white sticky top-0 z-[100]" style={{boxShadow:"0 2px 12px rgba(0,0,0,0.07)"}}>
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <svg width="44" height="44" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="12" fill="#0A2540"/>
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900">BEH</text>
            </svg>
            <div>
              <div className="font-black text-[18px] text-[#0A2540] leading-none">Business <span className="text-[#F7B500]">Expert</span> Hub</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-[0.8px] mt-[3px] font-semibold">Plateforme Experts & Startups</div>
            </div>
          </Link>
          <nav className="flex gap-7 items-center">
            <Link href="/" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">Accueil</Link>
            <Link href="/a-propos" className="text-[#0A2540] no-underline text-[15px] font-medium hover:text-[#F7B500]">À propos</Link>
            <div className="relative" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
              <span className="text-[#F7B500] font-bold text-[15px] cursor-pointer">Services ▾</span>
              {open && (
                <ul className="absolute top-full left-0 bg-white rounded-xl min-w-[210px] list-none p-[8px_0] m-0 z-[200]" style={{boxShadow:"0 8px 30px rgba(0,0,0,.12)"}}>
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
            <Link href="/inscription"><button className="btn-insc">S'inscrire</button></Link>
          </div>
        </div>
      </header>

      {/* MODAL CONNEXION */}
      {showLoginModal && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)"}} onClick={()=>setShowLoginModal(false)}>
          <div style={{background:"white",borderRadius:32,padding:"40px",maxWidth:400,width:"100%",textAlign:"center"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#F7B500,#e6a800)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><FaLock size={28} color="#0A2540" /></div>
            <h3 style={{fontSize:22,fontWeight:700,color:"#0A2540",marginBottom:12}}>Inscription obligatoire</h3>
            <p style={{color:"#64748B",fontSize:14,lineHeight:1.6,marginBottom:24}}>Pour accéder à <strong>"{selectedFormation?.title}"</strong>, vous devez d'abord créer un compte ou vous connecter.</p>
            <div style={{display:"flex",gap:12,flexDirection:"column"}}>
              <Link href="/inscription"><button style={{width:"100%",background:"#0A2540",color:"#F7B500",border:"none",borderRadius:14,padding:"14px",fontWeight:700,fontSize:15,cursor:"pointer"}}>Créer un compte gratuitement</button></Link>
              <Link href="/connexion"><button style={{width:"100%",background:"transparent",color:"#0A2540",border:"1.5px solid #E2EAF4",borderRadius:14,padding:"12px",fontWeight:600,fontSize:14,cursor:"pointer"}}>Se connecter</button></Link>
              <button onClick={()=>setShowLoginModal(false)} style={{background:"none",border:"none",color:"#94A3B8",fontSize:13,cursor:"pointer",marginTop:8}}>Continuer en tant que visiteur</button>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE NOTIFICATION */}
      {message && (
        <div className="notification" style={{position:"fixed",bottom:24,right:24,zIndex:1000,padding:"12px 20px",borderRadius:12,background:message.type==="success"?"#22C55E":"#EF4444",color:"white",fontSize:14,fontWeight:500,boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}>
          {message.text}
        </div>
      )}

      {/* HERO */}
      <section className="relative text-white overflow-hidden" style={{background:"linear-gradient(135deg,#0A2540 0%,#0a2e1a 55%,#081B10 100%)",padding:"80px 24px 100px"}}>
        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-7 text-[13px] text-white/50">
            <Link href="/" className="text-white/50 no-underline hover:text-[#F7B500]">Accueil</Link><span>›</span>
            <Link href="/services" className="text-white/50 no-underline hover:text-[#F7B500]">Services</Link><span>›</span>
            <span style={{color:"#4ADE80"}} className="font-semibold">Formations & Podcasts</span>
          </div>

          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <div className="h1 flex items-center gap-3 mb-7">
                <div className="w-[58px] h-[58px] rounded-[18px] flex items-center justify-center text-[24px]" style={{background:"rgba(34,197,94,0.18)",border:"1.5px solid rgba(34,197,94,0.35)",color:"#4ADE80"}}><FaGraduationCap/></div>
                <div className="flex flex-col gap-1.5">
                  <span className="inline-block bg-[#22C55E] text-white font-black text-[11px] tracking-[2.5px] uppercase px-3 py-1 rounded-full">Certifications</span>
                  <span className="inline-block bg-[#EF4444] text-white font-black text-[11px] tracking-[2.5px] uppercase px-3 py-1 rounded-full">Podcasts exclusifs</span>
                </div>
              </div>
              <h1 className="h2 font-black m-0 mb-6 leading-[1.05]" style={{fontSize:"clamp(36px,5vw,62px)"}}>Formations<br/><span style={{color:"#4ADE80"}}>& Podcasts</span></h1>
              <p className="h3 text-[17px] text-white/70 leading-[1.85] mb-9 max-w-[500px]">Montez en compétences avec nos programmes certifiants sur mesure. Inspirez-vous avec nos podcasts exclusifs.</p>
              <div className="h4 flex gap-3 flex-wrap">
                <Link href="/inscription" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[12px] font-black text-[15px] no-underline text-[#0A2540]" style={{background:"#F7B500"}}>S'inscrire à une formation <FaArrowRight size={13}/></Link>
                <Link href="/contact" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[12px] font-bold text-[15px] no-underline text-white" style={{background:"rgba(255,255,255,0.08)",border:"2px solid rgba(255,255,255,0.22)"}}>Nous contacter</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{val:"600+", label:"Apprenants formés"},{val:"18",label:"Certifications"},{val:"30+",label:"Épisodes podcast"},{val:"5★",label:"Note moyenne"}].map((s,i)=>(
                <div key={i} className="rounded-[18px] p-5" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)"}}>
                  <div className="text-[26px] font-black text-white leading-none mb-1">{s.val}</div>
                  <div className="text-[12px] text-white/45 font-semibold leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6">

        {/* TABS */}
        <section className="py-16">
          <FadeUp>
            <div className="flex items-center gap-4 mb-10">
              <button className={`tab-btn ${tab==="formations"?"active-f":"inactive"}`} onClick={()=>setTab("formations")}><FaGraduationCap className="inline mr-2"/>Programmes de formation</button>
              <button className={`tab-btn ${tab==="podcasts"?"active-p":"inactive"}`} onClick={()=>setTab("podcasts")}><FaMicrophone className="inline mr-2"/>Podcasts exclusifs</button>
            </div>
          </FadeUp>

          {/* FORMATIONS */}
          {tab === "formations" && (
            <div className="tab-content">
              <FadeUp>
                <div className="mb-8">
                  <h2 className="font-black text-[#0A2540] text-[28px] mb-2">Nos programmes de formation</h2>
                  <p className="text-gray-500"><span className="inline-flex items-center gap-1 bg-[#22C55E] text-white px-3 py-1 rounded-full text-xs font-bold mr-2">🎁 GRATUIT</span> Deux formations gratuites accessibles immédiatement</p>
                  <p className="text-gray-400 text-[13px]"><span className="inline-flex items-center gap-1 bg-[#F7B500] text-[#0A2540] px-2 py-0.5 rounded-full text-xs font-bold mr-2">💰 PAYANT</span> Inscription obligatoire - Places limitées</p>
                </div>
              </FadeUp>
              
              <div className="grid grid-cols-2 gap-6">
                {PROGRAMMES.map((p,i)=>(
                  <FadeUp key={i} delay={i*0.05}>
                    <div className={`pro-card ${p.gratuit ? 'border-2 border-[#22C55E]' : ''}`}>
                      <div className="pro-card-image">
                        <Image src={p.image} alt={p.title} width={600} height={200} style={{width:"100%",height:"200px",objectFit:"cover"}} onError={e=>{e.currentTarget.src="/formations/placeholder.jpg"}}/>
                        <div className="pro-card-overlay"/>
                        <div className="pro-card-badge">
                          {p.gratuit ? (
                            <span className="inline-flex items-center gap-1 bg-[#22C55E] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">🎁 Gratuit</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-[#F7B500] text-[#0A2540] px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">💰 Payant</span>
                          )}
                        </div>
                        <div className="pro-card-cat">
                          <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#0A2540] px-3 py-1 rounded-full text-[11px] font-bold">{p.cat}</span>
                        </div>
                      </div>
                      
                      <div className="pro-card-content">
                        <h3 className="pro-card-title">{p.title}</h3>
                        <p className="pro-card-desc">{p.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="info-chip"><FaCalendarCheck size={10}/> {p.date}</span>
                          <span className="info-chip"><FaClock size={10}/> {p.heure}</span>
                          <span className="info-chip">{getFormatIcon(p.format)}</span>
                        </div>
                        
                        {p.placesLimit && !p.gratuit && (
                          <div className="mb-3">
                            <span className="places-badge"><FaTicketAlt size={10}/> Places limitées</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex gap-2">
                            <span className="text-[11px] text-gray-500">⏱️ {p.duree}</span>
                            <span className="text-[11px] text-gray-500">🎯 {p.niveau}</span>
                          </div>
                          {p.certif && !p.gratuit && (
                            <span className="text-[10px] font-bold text-[#F7B500] bg-[#FFFBEB] px-2 py-1 rounded-full">🏅 Certifiant</span>
                          )}
                        </div>
                        
                        <button className="expand-btn" onClick={() => toggleExpand(p.id)}>
                          <FaInfoCircle size={12}/> {expandedFormation === p.id ? "Voir moins" : "En savoir plus"}
                        </button>
                        
                        <div className={`expanded-content ${expandedFormation === p.id ? 'show' : ''}`}>
                          <div className="pt-4 mt-2 border-t border-gray-100">
                            <div className="space-y-2 mb-4">
                              <p className="text-[12px] text-gray-600 flex items-center gap-2"><FaUserTie size={12}/> Formateur: <strong>{p.formateur}</strong></p>
                              {p.lieu && <p className="text-[12px] text-gray-600 flex items-center gap-2"><FaMapMarkerAlt size={12}/> Lieu: {p.lieu}</p>}
                              {p.placesLimit && !p.gratuit && (
                                <p className="text-[12px] text-gray-600 flex items-center gap-2"><FaTicketAlt size={12}/> Places limitées - Inscription rapide</p>
                              )}
                            </div>
                            
                            {p.gratuit ? (
                              <button onClick={() => handleInscription(p)} className="btn-primary">🎁 Accéder gratuitement <FaArrowRight size={12}/></button>
                            ) : (
                              <button onClick={() => handleInscription(p)} disabled={loading || (isLoggedIn && inscriptions.includes(p.id))} className={isLoggedIn && inscriptions.includes(p.id) ? "btn-success" : "btn-primary"}>
                                {loading ? "Chargement..." : isLoggedIn && inscriptions.includes(p.id) ? "✓ Déjà inscrit" : "🔓 Accéder à la formation"}
                                <FaArrowRight size={12} className="ml-2"/>
                              </button>
                            )}
                            {!p.gratuit && !isLoggedIn && !inscriptions.includes(p.id) && (
                              <p className="text-center text-[10px] text-gray-400 mt-2">🔒 Inscription obligatoire pour accéder à cette formation</p>
                            )}
                          </div>
                        </div>
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
              <FadeUp><h2 className="font-black text-[#0A2540] text-[28px] mb-2">Podcasts exclusifs</h2></FadeUp>
              <div className="flex gap-3 mb-8 flex-wrap">
                {["Spotify","Apple Podcasts","Deezer","YouTube Music","Amazon Music"].map((p,i)=>(
                  <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold border" style={{background:"rgba(239,68,68,0.06)",borderColor:"rgba(239,68,68,0.2)",color:"#991b1b"}}>🎧 {p}</span>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                {PODCASTS.map((pod,i)=>(
                  <FadeUp key={i} delay={i*0.07}>
                    <div className="pod-card">
                      <div className="flex items-center gap-5">
                        <div className="w-[64px] h-[64px] rounded-[16px] flex flex-col items-center justify-center flex-shrink-0" style={{background:"linear-gradient(135deg,rgba(239,68,68,0.12),rgba(239,68,68,0.06))",border:"1.5px solid rgba(239,68,68,0.18)"}}>
                          <span className="text-[10px] font-black" style={{color:"#EF4444"}}>{pod.num}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-[#0A2540] text-[15px] mb-1">{pod.title}</h3>
                          <p className="text-gray-500 text-[13px] font-semibold mb-2">Avec <span className="text-gray-700">{pod.guest}</span></p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-[12px] text-gray-400">⏱️ {pod.duree}</span>
                            {pod.tags.map((t,j)=>(
                              <span key={j} className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{background:"rgba(239,68,68,0.08)",color:"#991b1b"}}>{t}</span>
                            ))}
                          </div>
                        </div>
                        <div className="play-btn flex-shrink-0">▶️</div>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>
              <FadeUp>
                <div className="mt-8 rounded-[20px] p-6 flex items-center justify-between gap-6" style={{background:"linear-gradient(135deg,rgba(239,68,68,0.07),rgba(239,68,68,0.03))",border:"1.5px solid rgba(239,68,68,0.15)"}}>
                  <div><div className="font-black text-[#0A2540] text-[17px] mb-1">Proposer un sujet ou être invité ?</div><div className="text-gray-500 text-[14px]">Contactez notre équipe éditoriale</div></div>
                  <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-[10px] font-black text-[14px] no-underline text-white" style={{background:"#EF4444"}}>Nous contacter <FaArrowRight size={12}/></Link>
                </div>
              </FadeUp>
            </div>
          )}
        </section>

        {/* CTA */}
        <FadeUp>
          <section className="py-16">
            <div className="rounded-[28px] overflow-hidden relative" style={{background:"linear-gradient(135deg,#0a2e1a,#0A2540)",padding:"52px 56px"}}>
              <div className="relative z-10 flex items-center justify-between gap-8">
                <div>
                  <h3 className="font-black text-white text-[28px] m-0 mb-3">Prêt à <span style={{color:"#4ADE80"}}>former vos équipes</span> ?</h3>
                  <p className="text-white/55 text-[16px] m-0 max-w-[500px]">Programmes certifiants sur mesure + accès illimité à tous nos podcasts exclusifs.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link href="/inscription" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[12px] font-black text-[15px] no-underline text-[#0A2540]" style={{background:"#F7B500"}}>S'inscrire maintenant <FaArrowRight size={13}/></Link>
                  <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-[12px] font-bold text-[14px] no-underline text-white" style={{background:"rgba(255,255,255,0.08)",border:"1.5px solid rgba(255,255,255,0.2)"}}>Demander un devis</Link>
                </div>
              </div>
            </div>
          </section>
        </FadeUp>

        {/* AUTRES SERVICES */}
        <FadeUp>
          <section className="py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-black text-[#0A2540] text-[22px]">Autres services</h2>
              <Link href="/services" className="flex items-center gap-2 font-bold text-[14px] hover:underline" style={{color:COLOR}}><FaArrowLeft size={11}/>Tous les services</Link>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {OTHERS.map((s,i)=>(
                <Link key={i} href={`/services/${s.slug}`} className="oc-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[18px]" style={{background:`${s.color}15`,color:s.color}}>{s.icon}</div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase" style={{background:`${s.color}12`,color:s.color}}>{s.badge}</span>
                  </div>
                  <div className="font-black text-[#0A2540] text-[16px] mb-1">{s.title}</div>
                  <div className="flex items-center gap-1.5 text-[13px] font-bold" style={{color:s.color}}>Découvrir <FaArrowRight size={10}/></div>
                </Link>
              ))}
            </div>
          </section>
        </FadeUp>
      </div>

      <footer className="bg-[#081B33] text-white py-8 px-6 text-center">
        <p className="m-0 text-[14px]">© 2026 Business Expert Hub</p>
        <p className="text-white/40 text-[12px] mt-1">Plateforme de mise en relation startups & experts</p>
      </footer>
    </div>
  );
}