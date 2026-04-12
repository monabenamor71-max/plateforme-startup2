"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaGraduationCap, FaMapMarkerAlt, FaUsers, FaClock,
  FaCertificate, FaArrowRight, FaSearch, FaFilter,
  FaLaptop, FaBuilding, FaTimes, FaCheckCircle, FaLock,
  FaMicrophone, FaPlay, FaCalendarAlt,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

const NAV = [
  { label:"Consulting",     slug:"consulting"     },
  { label:"Audit sur site", slug:"audit-sur-site" },
  { label:"Nos plateformes ", slug:"nos-plateformes" },
  { label:"Formations",     slug:"formations"     },
];

const MODE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  presentiel: { label: "Présentiel", icon: <FaBuilding />, color: "#3B82F6" },
  en_ligne:   { label: "En ligne",   icon: <FaLaptop />,   color: "#22C55E" },
};

function useInView(thr = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: thr });
    o.observe(el); return () => o.disconnect();
  }, []);
  return [ref, v] as const;
}
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{ opacity: v?1:0, transform: v?"none":"translateY(22px)", transition: `opacity .65s cubic-bezier(.22,1,.36,1) ${delay}s, transform .65s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

export default function FormationsPage() {
  const router = useRouter();
  const [navOpen, setNavOpen]   = useState(false);
  const [activeTab, setActiveTab] = useState<"formations"|"podcasts">("formations");
  const [formations, setFormations] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [domaineFilter, setDomaineFilter] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [podSearch, setPodSearch] = useState("");
  const [selectedFormation, setSelectedFormation] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user  = localStorage.getItem("user");
    setIsLoggedIn(!!(token && user));
    loadFormations();
    loadPodcasts();
  }, []);

  async function loadFormations() {
    try {
      const res = await fetch(`${BASE}/formations/public`);
      if (res.ok) {
        const data = await res.json();
        const f = Array.isArray(data) ? data.filter((f: any) => f.statut === "publie" && (f.categorie !== "podcast" || !f.categorie)) : [];
        setFormations(f);
      }
    } catch (error) {
      console.error("Erreur chargement formations", error);
    }
    setLoading(false);
  }

  async function loadPodcasts() {
    try {
      const res = await fetch(`${BASE}/formations/public`);
      if (res.ok) {
        const data = await res.json();
        const p = Array.isArray(data) ? data.filter((p: any) => p.statut === "publie" && p.categorie === "podcast") : [];
        setPodcasts(p);
      }
    } catch (error) {
      console.error("Erreur chargement podcasts", error);
    }
  }

  const filteredFormations = formations.filter(f => {
    const matchDomaine = domaineFilter === "Tous" || f.domaine === domaineFilter;
    const matchSearch  = !searchQuery  || f.titre?.toLowerCase().includes(searchQuery.toLowerCase()) || f.description?.toLowerCase().includes(searchQuery.toLowerCase()) || f.formateur?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDomaine && matchSearch;
  });

  const formationsByDomaine: Record<string, any[]> = {};
  if (domaineFilter === "Tous") {
    filteredFormations.forEach(f => {
      const d = f.domaine || "Autres";
      if (!formationsByDomaine[d]) formationsByDomaine[d] = [];
      formationsByDomaine[d].push(f);
    });
  }

  const domainesDisponibles = ["Tous", ...Array.from(new Set(formations.map(f => f.domaine || "Autres"))).filter(Boolean).sort()];
  const podcastDomaines = ["Tous", ...Array.from(new Set(podcasts.map(p => p.domaine || "Autres"))).filter(Boolean).sort()];
  const filteredPodcasts = podcasts.filter(p => {
    const matchDomaine = domaineFilter === "Tous" || p.domaine === domaineFilter;
    const matchSearch  = !podSearch || p.titre?.toLowerCase().includes(podSearch.toLowerCase()) || p.description?.toLowerCase().includes(podSearch.toLowerCase());
    return matchDomaine && matchSearch;
  });

  function handleAcceder(formation: any) {
    if (isLoggedIn) {
      router.push(`/dashboard/startup?formation=${formation.id}`);
    } else {
      router.push("/inscription");
    }
  }

  function getPrixLabel(prix: any) {
    if (!prix || prix === 0 || prix === "0") return "Gratuit";
    return "Payant";
  }

  function placesRestantes(f: any) {
    if (!f.places_limitees) return null;
    return f.places_disponibles ?? 0;
  }

  // Helper pour formater une date YYYY-MM-DD en affichage lisible
  function formatDate(dateStr: string) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#374151", background:"#fff", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        /* ── Hero animations ── */
        @keyframes heroTextIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes heroImgIn{from{opacity:0;transform:scale(1.06)}to{opacity:1;transform:scale(1)}}
        @keyframes floatImg{0%,100%{transform:translateY(0px) rotate(-2deg)}50%{transform:translateY(-18px) rotate(-2deg)}}
        @keyframes pulseRing{0%,100%{opacity:.25;transform:scale(1)}50%{opacity:.08;transform:scale(1.12)}}
        @keyframes shimmerBadge{0%{background-position:200% center}100%{background-position:-200% center}}
        @keyframes fadeSlideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes floatY{0%,100%{transform:translateY(-50%) rotate(45deg)}50%{transform:translateY(calc(-50% - 14px)) rotate(45deg)}}

        .hero-text-1{animation:heroTextIn .7s cubic-bezier(.22,1,.36,1) .1s both}
        .hero-text-2{animation:heroTextIn .7s cubic-bezier(.22,1,.36,1) .25s both}
        .hero-text-3{animation:heroTextIn .7s cubic-bezier(.22,1,.36,1) .4s both}
        .hero-text-4{animation:heroTextIn .7s cubic-bezier(.22,1,.36,1) .55s both}
        .hero-img-wrap{animation:heroImgIn 1s cubic-bezier(.22,1,.36,1) .2s both}
        .hero-img-float{animation:floatImg 7s ease-in-out 1.2s infinite}
        .pulse-ring{animation:pulseRing 4s ease-in-out infinite}
        .diamond-float{animation:floatY 7s ease-in-out infinite}

        .drop-item{display:flex;align-items:center;gap:10px;padding:10px 18px;color:#0A2540;text-decoration:none;font-size:14px;font-weight:600;transition:background .15s}
        .drop-item:hover{background:#FFFBEB}
        .btn-conn{border:2px solid #0A2540;color:#0A2540;background:transparent;padding:9px 22px;border-radius:9px;font-weight:700;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-conn:hover{background:#F7B500;border-color:#F7B500;transform:translateY(-2px)}
        .btn-insc{background:#F7B500;color:#0A2540;border:2px solid #F7B500;padding:9px 22px;border-radius:9px;font-weight:800;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-insc:hover{background:#e6a800;transform:translateY(-2px)}
        .formation-card,.podcast-card{background:#fff;border:1.5px solid #E8EEF6;border-radius:20px;overflow:hidden;transition:all .3s cubic-bezier(.22,1,.36,1);cursor:pointer;}
        .formation-card:hover{transform:translateY(-8px);box-shadow:0 24px 56px rgba(10,37,64,.13);border-color:rgba(247,181,0,.4);}
        .podcast-card:hover{transform:translateY(-8px);box-shadow:0 24px 56px rgba(139,92,246,.13);border-color:rgba(139,92,246,.4);}
        .pill{border:1.5px solid #E2E8F0;border-radius:99px;padding:7px 16px;font-size:13px;font-weight:600;cursor:pointer;background:#fff;color:#64748B;transition:all .22s;font-family:inherit;white-space:nowrap;}
        .pill:hover{border-color:#F7B500;color:#B45309;background:#FFFBEB;}
        .pill.active{background:#F7B500;color:#0A2540;border-color:#F7B500;font-weight:700;}
        .modal-overlay{position:fixed;inset:0;background:rgba(10,37,64,.6);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);}
        .modal-box{background:#fff;border-radius:24px;width:100%;max-width:660px;max-height:90vh;overflow-y:auto;box-shadow:0 28px 80px rgba(10,37,64,.25);}
        .badge-places{display:inline-flex;align-items:center;gap:4px;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .main-tab{background:none;border:none;cursor:pointer;font-family:inherit;font-size:17px;font-weight:700;color:#94A3B8;padding:14px 0;border-bottom:3px solid transparent;transition:all .22s;margin-right:32px;}
        .main-tab.on{color:#0A2540;border-bottom-color:#F7B500;}

        /* Hero image decorative card */
        .hero-deco-card{background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18);border-radius:16px;backdrop-filter:blur(8px);padding:14px 18px;display:flex;align-items:center;gap:12px;}
      `}</style>

      {/* ── Header ── */}
      <header style={{ background:"#fff", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(0,0,0,.07)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", height:72, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:11, textDecoration:"none" }}>
            <svg width="44" height="44" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="12" fill="#0A2540"/>
              <rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15"/>
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial">BEH</text>
            </svg>
            <div style={{ fontWeight:900, fontSize:18, color:"#0A2540" }}>Business <span style={{ color:"#F7B500" }}>Expert</span> Hub</div>
          </Link>
          <nav style={{ display:"flex", gap:24, alignItems:"center" }}>
            <Link href="/" style={{ color:"#0A2540", textDecoration:"none", fontSize:15, fontWeight:500 }}>Accueil</Link>
            <Link href="/a-propos" style={{ color:"#0A2540", textDecoration:"none", fontSize:15, fontWeight:500 }}>À propos</Link>
            <div style={{ position:"relative" }} onMouseEnter={()=>setNavOpen(true)} onMouseLeave={()=>setNavOpen(false)}>
              <span style={{ color:"#F7B500", fontWeight:700, fontSize:15, cursor:"pointer" }}>Services ▾</span>
              {navOpen && (
                <ul style={{ position:"absolute", top:"calc(100% + 8px)", left:0, background:"#fff", borderRadius:14, listStyle:"none", padding:"8px 0", zIndex:200, minWidth:210, boxShadow:"0 8px 30px rgba(0,0,0,.12)", animation:"fadeSlideDown .2s ease" }}>
                  {NAV.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" style={{ color:"#0A2540", textDecoration:"none", fontSize:15, fontWeight:500 }}>Experts</Link>
            <Link href="/blog" style={{ color:"#0A2540", textDecoration:"none", fontSize:15, fontWeight:500 }}>Blog</Link>
            <Link href="/contact" style={{ color:"#0A2540", textDecoration:"none", fontSize:15, fontWeight:500 }}>Contact</Link>
          </nav>
          <div style={{ display:"flex", gap:10 }}>
            <Link href="/connexion"><button className="btn-conn">Connexion</button></Link>
            <Link href="/inscription"><button className="btn-insc">{"S'inscrire"}</button></Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ background:"linear-gradient(135deg,#0A2540 0%,#0f3060 60%,#0A2540 100%)", padding:"72px 24px 80px", position:"relative", overflow:"hidden", color:"#fff" }}>
        {/* Decorative diamonds */}
        {[{w:380,r:-60,d:"0s"},{w:220,r:120,d:"1.8s"}].map((d,i)=>(
          <div key={i} className="diamond-float" style={{ position:"absolute", width:d.w, height:d.w, right:d.r, top:"50%", transform:"translateY(-50%) rotate(45deg)", background:"rgba(247,181,0,.05)", border:"1px solid rgba(247,181,0,.1)", pointerEvents:"none", animationDelay:d.d }}/>
        ))}

        <div style={{ maxWidth:1200, margin:"0 auto", position:"relative", zIndex:10 }}>
          {/* Breadcrumb */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:32, fontSize:13, color:"rgba(255,255,255,.5)" }}>
            <Link href="/" style={{ color:"rgba(255,255,255,.5)", textDecoration:"none" }}>Accueil</Link><span>›</span>
            <Link href="/services" style={{ color:"rgba(255,255,255,.5)", textDecoration:"none" }}>Services</Link><span>›</span>
            <span style={{ color:"#F7B500", fontWeight:600 }}>Formations & Podcasts</span>
          </div>

          {/* Two-column layout: text left, image right */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"center" }}>

            {/* Left – text */}
            <div>
              <div className="hero-text-1" style={{ display:"inline-flex", alignItems:"center", gap:10, background:"rgba(247,181,0,.12)", border:"1px solid rgba(247,181,0,.3)", borderRadius:99, padding:"7px 18px", marginBottom:24 }}>
                <FaGraduationCap style={{ color:"#F7B500", fontSize:14 }} />
                <span style={{ color:"#F7B500", fontWeight:700, fontSize:12, letterSpacing:"2px", textTransform:"uppercase" }}>Apprentissage continu</span>
              </div>

              <h1 className="hero-text-2" style={{ fontWeight:900, fontSize:"clamp(32px,4vw,56px)", margin:"0 0 18px", lineHeight:1.08, color:"#fff" }}>
                Formations &<br/><span style={{ color:"#F7B500" }}>Podcasts</span>
              </h1>

              <p className="hero-text-3" style={{ fontSize:16, color:"rgba(255,255,255,.72)", lineHeight:1.85, maxWidth:480, marginBottom:32 }}>
                Des formations certifiantes et des podcasts exclusifs animés par nos experts. Accédez à toutes les ressources après inscription gratuite.
              </p>

              <div className="hero-text-4" style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)", borderRadius:99, padding:"9px 18px" }}>
                  <FaCheckCircle style={{ color:"#4ADE80", fontSize:13 }} />
                  <span style={{ fontSize:13, color:"rgba(255,255,255,.85)", fontWeight:600 }}>{formations.length} formations</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)", borderRadius:99, padding:"9px 18px" }}>
                  <FaMicrophone style={{ color:"#A78BFA", fontSize:13 }} />
                  <span style={{ fontSize:13, color:"rgba(255,255,255,.85)", fontWeight:600 }}>{podcasts.length} podcasts</span>
                </div>
                {!isLoggedIn && (
                  <Link href="/inscription" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#F7B500", color:"#0A2540", padding:"11px 24px", borderRadius:10, fontWeight:800, fontSize:14, textDecoration:"none" }}>
                    <FaLock style={{ fontSize:12 }} /> S'inscrire
                  </Link>
                )}
              </div>
            </div>

            {/* Right – animated illustration */}
            <div className="hero-img-wrap" style={{ display:"flex", justifyContent:"center", alignItems:"center", position:"relative" }}>
              {/* Pulse ring */}
              <div className="pulse-ring" style={{ position:"absolute", width:340, height:340, borderRadius:"50%", border:"2px solid rgba(247,181,0,.35)", pointerEvents:"none" }} />
              <div className="pulse-ring" style={{ position:"absolute", width:420, height:420, borderRadius:"50%", border:"1px solid rgba(247,181,0,.15)", pointerEvents:"none", animationDelay:"1.5s" }} />

              {/* Main image frame */}
              <div className="hero-img-float" style={{ position:"relative", zIndex:2 }}>
                <div style={{ width:300, height:300, borderRadius:32, overflow:"hidden", border:"3px solid rgba(247,181,0,.35)", boxShadow:"0 32px 80px rgba(0,0,0,.45)" }}>
                  {/* SVG illustration (same as original) */}
                  <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display:"block" }}>
                    <rect width="300" height="300" fill="#0D1F36"/>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M30 0L0 0 0 30" fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="1"/>
                    </pattern>
                    <rect width="300" height="300" fill="url(#grid)"/>
                    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#F7B500" stopOpacity="0.18"/>
                      <stop offset="100%" stopColor="#F7B500" stopOpacity="0"/>
                    </radialGradient>
                    <rect width="300" height="300" fill="url(#glow)"/>
                    <rect x="72" y="145" width="156" height="100" rx="10" fill="#1a3a6e"/>
                    <rect x="72" y="145" width="156" height="6" rx="3" fill="#F7B500" opacity="0.7"/>
                    <rect x="78" y="155" width="70" height="82" rx="4" fill="#152d54"/>
                    {[0,1,2,3,4].map(i=>(<rect key={i} x="86" y={168+i*12} width={50} height="3" rx="1.5" fill="rgba(255,255,255,.18)"/>))}
                    <rect x="152" y="155" width="70" height="82" rx="4" fill="#1e4080"/>
                    {[0,1,2,3].map(i=>(<rect key={i} x="160" y={168+i*12} width={55} height="3" rx="1.5" fill="rgba(255,255,255,.22)"/>))}
                    <rect x="160" y="216" width="42" height="3" rx="1.5" fill="#F7B500" opacity="0.6"/>
                    <rect x="147" y="151" width="6" height="86" rx="3" fill="#0A2540"/>
                    <polygon points="150,68 196,88 150,108 104,88" fill="#F7B500" opacity="0.95"/>
                    <rect x="188" y="88" width="4" height="32" rx="2" fill="#F7B500" opacity="0.8"/>
                    <circle cx="192" cy="122" r="6" fill="#F7B500" opacity="0.8"/>
                    <rect x="142" y="60" width="16" height="28" rx="4" fill="#F7B500" opacity="0.75"/>
                    <rect x="147" y="56" width="6" height="14" rx="3" fill="#F7B500"/>
                    <circle cx="62" cy="110" r="5" fill="#F7B500" opacity="0.6"/>
                    <circle cx="62" cy="110" r="2.5" fill="#F7B500"/>
                    <circle cx="238" cy="130" r="4" fill="#A78BFA" opacity="0.7"/>
                    <circle cx="238" cy="130" r="2" fill="#A78BFA"/>
                    <circle cx="90" cy="180" r="3" fill="#4ADE80" opacity="0.5"/>
                    <rect x="200" y="168" width="52" height="40" rx="8" fill="#1e3a5f" stroke="rgba(247,181,0,.4)" strokeWidth="1.5"/>
                    <circle cx="226" cy="181" r="8" fill="none" stroke="#F7B500" strokeWidth="1.5" opacity="0.8"/>
                    <path d="M222 181 L225 184 L230 178" stroke="#F7B500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
                    <rect x="208" y="194" width="36" height="3" rx="1.5" fill="rgba(255,255,255,.2)"/>
                    <rect x="214" y="200" width="24" height="3" rx="1.5" fill="rgba(255,255,255,.12)"/>
                    <circle cx="56" cy="168" r="3" fill="#4ADE80" opacity="0.8"/>
                    <path d="M48 162 Q56 156 64 162" stroke="#4ADE80" strokeWidth="1.5" fill="none" opacity="0.6" strokeLinecap="round"/>
                    <path d="M44 157 Q56 148 68 157" stroke="#4ADE80" strokeWidth="1" fill="none" opacity="0.3" strokeLinecap="round"/>
                    <rect x="88" y="258" width="124" height="22" rx="11" fill="rgba(247,181,0,.15)" stroke="rgba(247,181,0,.3)" strokeWidth="1"/>
                    <text x="150" y="273" textAnchor="middle" fill="#F7B500" fontSize="10" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="2">CERTIFIÉ BEH</text>
                  </svg>
                </div>

                {/* Floating badges */}
                <div style={{ position:"absolute", top:-18, left:-24, background:"rgba(10,37,64,.9)", border:"1px solid rgba(247,181,0,.4)", borderRadius:14, padding:"10px 14px", backdropFilter:"blur(8px)", whiteSpace:"nowrap" }}>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,.5)", fontWeight:600, marginBottom:2 }}>Taux de satisfaction</div>
                  <div style={{ fontSize:18, fontWeight:900, color:"#F7B500", lineHeight:1 }}>94%</div>
                </div>
                <div style={{ position:"absolute", bottom:-16, right:-20, background:"rgba(139,92,246,.2)", border:"1px solid rgba(139,92,246,.4)", borderRadius:14, padding:"10px 14px", backdropFilter:"blur(8px)", whiteSpace:"nowrap" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <FaMicrophone style={{ color:"#A78BFA", fontSize:13 }} />
                    <div>
                      <div style={{ fontSize:10, color:"rgba(255,255,255,.5)", fontWeight:600 }}>Podcasts exclusifs</div>
                      <div style={{ fontSize:15, fontWeight:800, color:"#C4B5FD", lineHeight:1.2 }}>{podcasts.length > 0 ? podcasts.length : "+"} épisodes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Onglets ── */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px" }}>
        <div style={{ borderBottom:"2px solid #F1F5F9", marginBottom:32, marginTop:32, display:"flex" }}>
          <button className={`main-tab${activeTab==="formations"?" on":""}`} onClick={()=>setActiveTab("formations")}>
            <FaGraduationCap style={{ marginRight:8, fontSize:15 }} />Formations
            {formations.length > 0 && <span style={{ background:"#F7B500", color:"#0A2540", borderRadius:99, padding:"1px 8px", fontSize:11, fontWeight:800, marginLeft:8 }}>{formations.length}</span>}
          </button>
          <button className={`main-tab${activeTab==="podcasts"?" on":""}`} onClick={()=>setActiveTab("podcasts")}>
            <FaMicrophone style={{ marginRight:8, fontSize:15 }} />Podcasts
            {podcasts.length > 0 && <span style={{ background:"#8B5CF6", color:"#fff", borderRadius:99, padding:"1px 8px", fontSize:11, fontWeight:800, marginLeft:8 }}>{podcasts.length}</span>}
          </button>
        </div>
      </div>

      {/* ── Contenu principal ── */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px 40px" }}>

        {/* ── FORMATIONS ── */}
        {activeTab === "formations" && (
          <>
            <FadeUp>
              <div style={{ background:"#F8FAFC", border:"1px solid #E8EEF6", borderRadius:18, padding:"20px 22px", marginBottom:28 }}>
                <div style={{ position:"relative", marginBottom:16 }}>
                  <FaSearch style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#94A3B8", fontSize:14 }} />
                  <input
                    placeholder="Rechercher une formation, un formateur..."
                    value={searchQuery}
                    onChange={e=>setSearchQuery(e.target.value)}
                    style={{ width:"100%", paddingLeft:40, paddingRight:16, paddingTop:12, paddingBottom:12, border:"1.5px solid #E2E8F0", borderRadius:12, fontSize:14, fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#fff", outline:"none" }}
                    onFocus={e=>(e.target as HTMLInputElement).style.borderColor="#F7B500"}
                    onBlur={e=>(e.target as HTMLInputElement).style.borderColor="#E2E8F0"}
                  />
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8 }}>
                    <FaFilter style={{ marginRight:5, fontSize:10 }} />Domaine
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {domainesDisponibles.map(d => (
                      <button key={d} className={`pill${domaineFilter===d?" active":""}`} onClick={()=>setDomaineFilter(d)}>{d}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop:12, fontSize:13, color:"#64748B" }}>
                  <strong style={{ color:"#0A2540" }}>{filteredFormations.length}</strong> formation{filteredFormations.length!==1?"s":""} trouvée{filteredFormations.length!==1?"s":""}
                </div>
              </div>
            </FadeUp>

            {loading ? (
              <div style={{ textAlign:"center", padding:"80px 0" }}>
                <div style={{ width:44, height:44, border:"3px solid #F7B500", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 16px" }}/>
                <div style={{ color:"#64748B", fontSize:14 }}>Chargement des formations...</div>
              </div>
            ) : filteredFormations.length === 0 ? (
              <div style={{ textAlign:"center", padding:"80px 0" }}>
                <div style={{ fontSize:52, marginBottom:16 }}>🎓</div>
                <div style={{ fontWeight:700, fontSize:18, color:"#0A2540", marginBottom:8 }}>Aucune formation trouvée</div>
                <div style={{ color:"#64748B", fontSize:14 }}>Essayez de modifier vos filtres de recherche</div>
              </div>
            ) : domaineFilter === "Tous" ? (
              Object.entries(formationsByDomaine).map(([domaine, fList]) => (
                <div key={domaine} style={{ marginBottom:48 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, borderBottom:"2px solid #F1F5F9", paddingBottom:10 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#F7B500,#e6a800)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#0A2540" }}>
                      <FaGraduationCap />
                    </div>
                    <h2 style={{ fontWeight:800, fontSize:20, color:"#0A2540", margin:0 }}>{domaine}</h2>
                    <span style={{ background:"#E8EEF6", borderRadius:99, padding:"2px 8px", fontSize:12, color:"#64748B" }}>{fList.length}</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:22 }}>
                    {fList.map(f => (
                      <FormationCard
                        key={f.id}
                        f={f}
                        onSelect={setSelectedFormation}
                        onAcceder={handleAcceder}
                        isLoggedIn={isLoggedIn}
                        getPrixLabel={getPrixLabel}
                        placesRestantes={placesRestantes}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:22 }}>
                {filteredFormations.map(f => (
                  <FormationCard
                    key={f.id}
                    f={f}
                    onSelect={setSelectedFormation}
                    onAcceder={handleAcceder}
                    isLoggedIn={isLoggedIn}
                    getPrixLabel={getPrixLabel}
                    placesRestantes={placesRestantes}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PODCASTS ── */}
        {activeTab === "podcasts" && (
          <>
            <FadeUp>
              <div style={{ background:"#F8FAFC", border:"1px solid #E8EEF6", borderRadius:18, padding:"20px 22px", marginBottom:28 }}>
                <div style={{ position:"relative", marginBottom:16 }}>
                  <FaSearch style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#94A3B8", fontSize:14 }} />
                  <input
                    placeholder="Rechercher un podcast, un expert..."
                    value={podSearch}
                    onChange={e=>setPodSearch(e.target.value)}
                    style={{ width:"100%", paddingLeft:40, paddingRight:16, paddingTop:12, paddingBottom:12, border:"1.5px solid #E2E8F0", borderRadius:12, fontSize:14, fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#fff", outline:"none" }}
                    onFocus={e=>(e.target as HTMLInputElement).style.borderColor="#8B5CF6"}
                    onBlur={e=>(e.target as HTMLInputElement).style.borderColor="#E2E8F0"}
                  />
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:8 }}>
                    <FaFilter style={{ marginRight:5, fontSize:10 }} />Domaine
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {podcastDomaines.map(d => (
                      <button key={d} className={`pill${domaineFilter===d?" active":""}`} onClick={()=>setDomaineFilter(d)}>{d}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop:12, fontSize:13, color:"#64748B" }}>
                  <strong style={{ color:"#0A2540" }}>{filteredPodcasts.length}</strong> podcast{filteredPodcasts.length!==1?"s":""} trouvé{filteredPodcasts.length!==1?"s":""}
                </div>
              </div>
            </FadeUp>

            {filteredPodcasts.length === 0 ? (
              <div style={{ textAlign:"center", padding:"80px 0" }}>
                <div style={{ fontSize:52, marginBottom:16 }}>🎙️</div>
                <div style={{ fontWeight:700, fontSize:18, color:"#0A2540", marginBottom:8 }}>Aucun podcast trouvé</div>
                <div style={{ color:"#64748B", fontSize:14 }}>Essayez de modifier vos filtres de recherche</div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:22 }}>
                {filteredPodcasts.map(p => (
                  <PodcastCard
                    key={p.id}
                    p={p}
                    onAcceder={handleAcceder}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal détail formation (avec dates) ── */}
      {selectedFormation && (
        <div className="modal-overlay" onClick={()=>setSelectedFormation(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div style={{ position:"relative", height:180, background:"linear-gradient(135deg,#0A2540,#1a3a6e)", overflow:"hidden", borderRadius:"24px 24px 0 0" }}>
              {selectedFormation.image && (
                <img src={`${BASE}/uploads/formations/${selectedFormation.image}`} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.5 }} />
              )}
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(10,37,64,.9),transparent)" }} />
              <button onClick={()=>setSelectedFormation(null)}
                style={{ position:"absolute", top:16, right:16, width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.25)", color:"#fff", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <FaTimes />
              </button>
              <div style={{ position:"absolute", bottom:16, left:20, right:60 }}>
                <div style={{ display:"flex", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                  {selectedFormation.domaine && (
                    <span style={{ background:"#F7B500", color:"#0A2540", borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{selectedFormation.domaine}</span>
                  )}
                  {selectedFormation.certifiante && (
                    <span style={{ background:"rgba(34,197,94,.2)", color:"#4ADE80", border:"1px solid rgba(34,197,94,.35)", borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:700 }}>
                      <FaCertificate style={{ marginRight:4, fontSize:10 }} />Certifiante
                    </span>
                  )}
                </div>
                <div style={{ color:"#fff", fontWeight:800, fontSize:19, lineHeight:1.2 }}>{selectedFormation.titre}</div>
              </div>
            </div>
            <div style={{ padding:"24px 28px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                {[
                  { icon:<FaUsers/>, label:"Formateur", val:selectedFormation.formateur||"BEH Expert", color:"#3B82F6" },
                  { icon:<FaClock/>, label:"Durée", val:selectedFormation.duree||"Non précisée", color:"#F7B500" },
                  { icon:MODE_LABELS[selectedFormation.mode]?.icon||<FaLaptop/>, label:"Mode", val:MODE_LABELS[selectedFormation.mode]?.label||selectedFormation.mode||"En ligne", color:MODE_LABELS[selectedFormation.mode]?.color||"#22C55E" },
                  { icon:<FaMapMarkerAlt/>, label:"Lieu", val:selectedFormation.localisation||"En ligne", color:"#8B5CF6" },
                ].map((row, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background:"#F8FAFC", borderRadius:12, padding:"12px 14px" }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:`${row.color}15`, color:row.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{row.icon}</div>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"1px" }}>{row.label}</div>
                      <div style={{ fontSize:13.5, fontWeight:600, color:"#0A2540" }}>{row.val}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Affichage des dates dans la modale */}
              {(selectedFormation.dateDebut || selectedFormation.dateFin) && (
                <div style={{ background:"#F0F9FF", borderRadius:12, padding:"14px 18px", marginBottom:20, border:"1px solid #BAE6FD" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                    {selectedFormation.dateDebut && (
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <FaCalendarAlt style={{ color:"#0284C7", fontSize:14 }} />
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:"#0369A1", textTransform:"uppercase" }}>Date de début</div>
                          <div style={{ fontWeight:700, color:"#0A2540" }}>{formatDate(selectedFormation.dateDebut)}</div>
                        </div>
                      </div>
                    )}
                    {selectedFormation.dateFin && (
                      <>
                        <div style={{ width:1, height:30, background:"#BAE6FD" }} />
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <FaCalendarAlt style={{ color:"#0284C7", fontSize:14 }} />
                          <div>
                            <div style={{ fontSize:10, fontWeight:700, color:"#0369A1", textTransform:"uppercase" }}>Date de fin</div>
                            <div style={{ fontWeight:700, color:"#0A2540" }}>{formatDate(selectedFormation.dateFin)}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedFormation.description && (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontWeight:700, color:"#0A2540", fontSize:14, marginBottom:8 }}>À propos de cette formation</div>
                  <p style={{ fontSize:14, color:"#475569", lineHeight:1.8, margin:0 }}>{selectedFormation.description}</p>
                </div>
              )}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#F8FAFC", borderRadius:14, padding:"16px 18px", marginBottom:20 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", marginBottom:4 }}>Tarif</div>
                  <div style={{ fontSize:26, fontWeight:900, color: selectedFormation.prix ? "#0A2540" : "#22C55E" }}>
                    {getPrixLabel(selectedFormation.prix)}
                  </div>
                </div>
                {selectedFormation.places_limitees && (
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", marginBottom:4 }}>Places restantes</div>
                    <div style={{ fontSize:22, fontWeight:900, color: (selectedFormation.places_disponibles||0) > 5 ? "#22C55E" : "#EF4444" }}>
                      {selectedFormation.places_disponibles ?? 0}
                    </div>
                  </div>
                )}
              </div>
              {isLoggedIn ? (
                <button onClick={()=>{setSelectedFormation(null);handleAcceder(selectedFormation);}}
                  style={{ width:"100%", background:"linear-gradient(135deg,#F7B500,#e6a800)", color:"#0A2540", border:"none", borderRadius:14, padding:"16px", fontWeight:900, fontSize:16, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                  <FaArrowRight /> Accéder à la formation
                </button>
              ) : (
                <div>
                  <Link href="/inscription" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, width:"100%", background:"linear-gradient(135deg,#F7B500,#e6a800)", color:"#0A2540", borderRadius:14, padding:"16px", fontWeight:900, fontSize:15, textDecoration:"none", marginBottom:10 }}>
                    <FaCheckCircle /> {"S'inscrire gratuitement pour accéder"}
                  </Link>
                  <div style={{ textAlign:"center", fontSize:12, color:"#64748B" }}>
                    Déjà inscrit ? <Link href="/connexion" style={{ color:"#3B82F6", fontWeight:700 }}>Se connecter</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer style={{ background:"#081B33", color:"#fff", padding:"28px 24px", textAlign:"center", marginTop:64 }}>
        <p style={{ margin:"0 0 4px", fontSize:14 }}>© 2026 Business Expert Hub</p>
        <p style={{ color:"rgba(255,255,255,.4)", fontSize:13, margin:0 }}>Formations certifiantes et podcasts exclusifs</p>
      </footer>
    </div>
  );
}

// ── Composant carte formation (avec dates) ──
function FormationCard({ f, onSelect, onAcceder, isLoggedIn, getPrixLabel, placesRestantes, formatDate }: any) {
  const places = placesRestantes(f);
  const modeInfo = MODE_LABELS[f.mode] || { label: f.mode || "En ligne", icon: <FaLaptop />, color: "#22C55E" };
  const prixLabel = getPrixLabel(f.prix);

  return (
    <div className="formation-card">
      <div style={{ height:140, position:"relative", background:"linear-gradient(135deg,#0A2540,#1a3a6e)", overflow:"hidden" }}>
        {f.image && (
          <img src={`${BASE}/uploads/formations/${f.image}`} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.6 }} />
        )}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(10,37,64,.85),rgba(10,37,64,.2))" }} />
        <div style={{ position:"absolute", top:12, left:12, display:"flex", gap:6, flexWrap:"wrap" }}>
          {f.certifiante && (
            <span style={{ background:"#F7B500", color:"#0A2540", borderRadius:99, padding:"3px 9px", fontSize:10, fontWeight:800, display:"inline-flex", alignItems:"center", gap:4 }}>
              <FaCertificate style={{ fontSize:9 }} />CERTIFIANTE
            </span>
          )}
        </div>
        <div style={{ position:"absolute", top:12, right:12, background:"rgba(0,0,0,.4)", backdropFilter:"blur(4px)", borderRadius:99, padding:"4px 10px", fontSize:11, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ color:modeInfo.color, fontSize:10 }}>{modeInfo.icon}</span>
          {modeInfo.label}
        </div>
        <div style={{ position:"absolute", bottom:12, right:12 }}>
          <span style={{ background: f.prix ? "rgba(10,37,64,.85)" : "rgba(34,197,94,.85)", backdropFilter:"blur(4px)", color: f.prix ? "#F7B500" : "#fff", borderRadius:99, padding:"5px 12px", fontSize:13, fontWeight:900 }}>
            {prixLabel}
          </span>
        </div>
      </div>
      <div style={{ padding:"18px 18px 16px" }}>
        {f.domaine && (
          <div style={{ fontSize:11, fontWeight:700, color:"#F7B500", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:6 }}>{f.domaine}</div>
        )}
        <h3 style={{ fontWeight:800, color:"#0A2540", fontSize:15.5, lineHeight:1.35, marginBottom:8, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {f.titre}
        </h3>
        {f.description && (
          <p style={{ fontSize:13, color:"#64748B", lineHeight:1.7, marginBottom:12, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
            {f.description}
          </p>
        )}
        <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:14, fontSize:12, color:"#64748B" }}>
          {f.formateur && (
            <span style={{ display:"flex", alignItems:"center", gap:4 }}>
              <FaUsers style={{ color:"#94A3B8", fontSize:11 }} />{f.formateur}
            </span>
          )}
          {f.duree && (
            <span style={{ display:"flex", alignItems:"center", gap:4 }}>
              <FaClock style={{ color:"#94A3B8", fontSize:11 }} />{f.duree}
            </span>
          )}
          {f.localisation && f.mode !== "en_ligne" && (
            <span style={{ display:"flex", alignItems:"center", gap:4 }}>
              <FaMapMarkerAlt style={{ color:"#94A3B8", fontSize:11 }} />{f.localisation}
            </span>
          )}
        </div>

        {/* Affichage des dates sur la carte */}
        {(f.dateDebut || f.dateFin) && (
          <div style={{ marginBottom:12, fontSize:11, color:"#1D4ED8", background:"#EFF6FF", padding:"6px 10px", borderRadius:8, display:"inline-flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <FaCalendarAlt style={{ fontSize:10 }} />
            {f.dateDebut && <span>Début : {formatDate(f.dateDebut)}</span>}
            {f.dateDebut && f.dateFin && <span>•</span>}
            {f.dateFin && <span>Fin : {formatDate(f.dateFin)}</span>}
          </div>
        )}

        {places !== null && (
          <div style={{ marginBottom:12 }}>
            <span className="badge-places" style={{ background: places > 5 ? "#ECFDF5" : places > 0 ? "#FFF8E1" : "#FEF2F2", color: places > 5 ? "#059669" : places > 0 ? "#B45309" : "#DC2626", border:`1px solid ${places > 5 ? "#A7F3D0" : places > 0 ? "#F7B500" : "#FECACA"}` }}>
              <FaUsers style={{ fontSize:10 }} />
              {places > 0 ? `${places} place${places>1?"s":""} restante${places>1?"s":""}` : "Complet"}
            </span>
          </div>
        )}
        <div style={{ display:"flex", gap:8, marginTop:4 }}>
          <button
            onClick={()=>onSelect(f)}
            style={{ flex:1, background:"#EFF6FF", color:"#1D4ED8", border:"1px solid #BFDBFE", borderRadius:10, padding:"10px", fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
          >
            En savoir plus
          </button>
          <button
            onClick={e=>{e.stopPropagation(); onAcceder(f);}}
            style={{ flex:1, background: isLoggedIn ? "linear-gradient(135deg,#0A2540,#1a3a6e)" : "#F7B500", color: isLoggedIn ? "#fff" : "#0A2540", border:"none", borderRadius:10, padding:"10px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
          >
            {isLoggedIn ? "Accéder" : "S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Composant carte podcast (inchangé) ──
function PodcastCard({ p, onAcceder, isLoggedIn }: any) {
  return (
    <div className="podcast-card" onClick={() => onAcceder(p)}>
      <div style={{ display:"flex", gap:0 }}>
        <div style={{ width:160, flexShrink:0, background:"linear-gradient(135deg,#2d1b5e,#4c1d95)", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {p.image ? (
            <img src={`${BASE}/uploads/formations/${p.image}`} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.7 }} />
          ) : (
            <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(139,92,246,.35)", border:"2px solid rgba(139,92,246,.5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <FaMicrophone style={{ color:"#C4B5FD", fontSize:24 }} />
            </div>
          )}
        </div>
        <div style={{ flex:1, padding:"18px 18px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <span style={{ background:"#F3F0FF", color:"#7C3AED", borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:700 }}>🎙️ Podcast</span>
            {p.domaine && <span style={{ background:"#F8FAFC", color:"#64748B", borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:600 }}>{p.domaine}</span>}
          </div>
          <h3 style={{ fontWeight:800, color:"#0A2540", fontSize:16, lineHeight:1.3, marginBottom:6 }}>{p.titre}</h3>
          {p.description && (
            <p style={{ fontSize:13, color:"#64748B", lineHeight:1.6, marginBottom:12, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
              {p.description}
            </p>
          )}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginTop:8 }}>
            <div style={{ display:"flex", gap:10, fontSize:12, color:"#8A9AB5" }}>
              {p.formateur && <span><FaUsers style={{ fontSize:10, marginRight:3 }} />{p.formateur}</span>}
              {p.duree_podcast && <span><FaClock style={{ fontSize:10, marginRight:3 }} />{p.duree_podcast}</span>}
            </div>
            <button
              onClick={(e)=>{e.stopPropagation(); onAcceder(p);}}
              style={{ background: isLoggedIn ? "#8B5CF6" : "#F7B500", color: isLoggedIn ? "#fff" : "#0A2540", border:"none", borderRadius:10, padding:"9px 18px", fontWeight:800, fontSize:13, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:7 }}>
              {isLoggedIn ? <><FaPlay style={{ fontSize:11 }} />Écouter</> : <><FaLock style={{ fontSize:11 }} />{"S'inscrire"}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}