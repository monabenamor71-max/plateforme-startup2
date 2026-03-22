"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaQuoteLeft, FaChevronLeft, FaChevronRight,
  FaEnvelope, FaArrowRight, FaLock, FaCheck,
  FaCalendarAlt,
} from "react-icons/fa";

interface ExpertAPI {
  id: number; user_id: number;
  nom: string; prenom: string;
  domaine: string; description: string;
  experience: string; localisation: string;
  tarif: string; disponible: boolean;
  note: number; nb_avis: number;
  photo?: string;
  user?: { nom: string; prenom: string; email: string };
}
interface Dispo { id: number; date: string; heure: string; }
interface TemoAPI {
  id: number;
  texte: string;
  statut: string;
  user?: { nom: string; prenom: string; role: string };
  startup?: { nom_startup: string; fonction: string; secteur: string };
  createdAt: string;
}

function useInView(threshold = 0.12): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "none" : "translateY(40px)",
      transition: `opacity .9s cubic-bezier(.22,1,.36,1) ${delay}s, transform .9s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>{children}</div>
  );
}

const ADN_CARDS = [
  { title: "Notre Vision",  anchor: "vision",  image: "/vision.png",  color: "#3B82F6", desc: "Devenir la référence absolue en accompagnement de startups innovantes, en connectant les meilleurs experts aux projets les plus ambitieux de demain." },
  { title: "Notre Mission", anchor: "mission", image: "/mission.png", color: "#F7B500", desc: "Offrir aux startups un accès privilégié à des experts certifiés pour structurer leur stratégie, accélérer leur croissance et réussir leurs levées de fonds." },
  { title: "Nos Valeurs",   anchor: "valeurs", image: "/valeurs.png", color: "#10B981", desc: "Excellence, transparence et engagement humain. Chaque accompagnement est unique et conçu pour maximiser l'impact durable de votre entreprise." },
];

const LOGOS = [
  "/logos/partenaire1.png",
  "/logos/partenaire2.png",
  "/logos/partenaire3.png",
  "/logos/partenaire4.png",
  "/logos/partenaire5.png",
  "/logos/partenaire6.png",
  "/logos/partenaire7.png",
];

const NAV_SERVICES = [
  { label: "Consulting",     slug: "consulting"     },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Accompagnement", slug: "accompagnement" },
  { label: "Formations",     slug: "formations"     },
];

function getName(ex: ExpertAPI) {
  const p = ex.user?.prenom || ex.prenom || "";
  const n = ex.user?.nom    || ex.nom    || "";
  return `${p} ${n}`.trim() || ex.domaine || "Expert";
}
function getIni(ex: ExpertAPI) {
  const p = ex.user?.prenom || ex.prenom || "";
  const n = ex.user?.nom    || ex.nom    || "";
  return ((p[0] || "") + (n[0] || "")).toUpperCase() || "EX";
}

// Extraire les infos d'un témoignage pour l'affichage
function getTemoInfo(t: TemoAPI) {
  const prenom     = t.user?.prenom     || "";
  const nom        = t.user?.nom        || "";
  const nomComplet = `${prenom} ${nom}`.trim() || "Client BEH";
  const ini        = ((prenom[0] || "") + (nom[0] || "")).toUpperCase() || "??";
  const nomStartup = t.startup?.nom_startup || "";
  const fonction   = t.startup?.fonction   || (t.user?.role === "expert" ? "Expert BEH" : "");
  // Ligne affichée sous le nom : "CEO / Fondateur — TechVenture"
  let subtitle = "";
  if (fonction && nomStartup)   subtitle = `${fonction} — ${nomStartup}`;
  else if (fonction)             subtitle = fonction;
  else if (nomStartup)           subtitle = nomStartup;
  else if (t.user?.role === "expert") subtitle = "Expert BEH";
  else                           subtitle = "Startup BEH";
  return { nomComplet, ini, subtitle };
}

export default function Home() {
  const [servOpen, setServOpen]       = useState(false);
  const [tActive, setTActive]         = useState(0);
  const [tAnim, setTAnim]             = useState(false);
  const [mail, setMail]               = useState("");
  const [sent, setSent]               = useState(false);
  const [modal, setModal]             = useState(false);
  const [experts, setExperts]         = useState<ExpertAPI[]>([]);
  const [dispos, setDispos]           = useState<Record<number, Dispo[]>>({});
  const [loading, setLoading]         = useState(true);
  const [temoignages, setTemoignages] = useState<TemoAPI[]>([]);
  const [temoLoading, setTemoLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/experts")
      .then(r => r.ok ? r.json() : [])
      .then(async (d: ExpertAPI[]) => {
        if (Array.isArray(d) && d.length > 0) {
          const s = d.slice(0, 4);
          setExperts(s);
          const map: Record<number, Dispo[]> = {};
          await Promise.allSettled(s.map(async ex => {
            const r = await fetch(`http://localhost:3001/disponibilites/expert/${ex.id}`).catch(() => null);
            map[ex.id] = r && r.ok ? await r.json() : [];
          }));
          setDispos(map);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Charger UNIQUEMENT les témoignages validés par l'admin
  useEffect(() => {
    fetch("http://localhost:3001/temoignages/publics")
      .then(r => r.ok ? r.json() : [])
      .then((d: TemoAPI[]) => {
        if (Array.isArray(d)) setTemoignages(d);
        setTemoLoading(false);
      })
      .catch(() => setTemoLoading(false));
  }, []);

  useEffect(() => {
    if (temoignages.length === 0) return;
    const t = setInterval(() => {
      if (!tAnim) setTActive(p => (p + 1) % temoignages.length);
    }, 5500);
    return () => clearInterval(t);
  }, [temoignages.length, tAnim]);

  function goT(i: number) {
    if (tAnim || temoignages.length === 0) return;
    setTAnim(true);
    setTimeout(() => { setTActive(i); setTAnim(false); }, 280);
  }

  const currentTemo = temoignages[tActive % Math.max(temoignages.length, 1)];
  const temoInfo    = currentTemo ? getTemoInfo(currentTemo) : null;

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", color: "#2D3748" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:10.5px; font-weight:800; letter-spacing:3px; text-transform:uppercase; color:#F7B500; }
        .eyebrow::before { content:''; display:block; width:26px; height:2px; background:#F7B500; border-radius:2px; }

        .sec-title { font-family:'Cormorant Garamond',serif; font-weight:700; line-height:1.1; color:#0A2540; font-size:clamp(34px,4vw,58px); }
        .sec-title em { font-style:italic; color:#F7B500; }
        .sec-title-light { color:white; }
        .sec-title-light em { color:#F7B500; }

        .btn-gold { display:inline-flex; align-items:center; gap:9px; background:#F7B500; color:#0A2540; border:none; border-radius:10px; padding:14px 28px; font-family:inherit; font-size:14px; font-weight:800; cursor:pointer; transition:transform .22s,box-shadow .22s,background .22s; text-decoration:none; letter-spacing:.2px; }
        .btn-gold:hover { background:#e6a800; transform:translateY(-3px); box-shadow:0 14px 36px rgba(247,181,0,.35); }
        .btn-dark { display:inline-flex; align-items:center; gap:9px; background:#0A2540; color:white; border:none; border-radius:10px; padding:14px 28px; font-family:inherit; font-size:14px; font-weight:700; cursor:pointer; transition:transform .22s,box-shadow .22s,background .22s; text-decoration:none; }
        .btn-dark:hover { background:#F7B500; color:#0A2540; transform:translateY(-3px); box-shadow:0 14px 36px rgba(10,37,64,.25); }
        .btn-outline-light { display:inline-flex; align-items:center; gap:9px; background:transparent; color:white; border:1.5px solid rgba(255,255,255,.3); border-radius:10px; padding:14px 28px; font-family:inherit; font-size:14px; font-weight:600; cursor:pointer; transition:all .22s; text-decoration:none; }
        .btn-outline-light:hover { border-color:#F7B500; color:#F7B500; transform:translateY(-3px); }
        .btn-nav-outline { border:2px solid #0A2540; color:#0A2540; background:transparent; padding:9px 22px; border-radius:9px; font-weight:700; font-size:14px; cursor:pointer; transition:all .22s; font-family:inherit; }
        .btn-nav-outline:hover { background:#F7B500; border-color:#F7B500; transform:translateY(-2px); }
        .btn-nav-solid { background:#F7B500; color:#0A2540; border:2px solid #F7B500; padding:9px 22px; border-radius:9px; font-weight:800; font-size:14px; cursor:pointer; transition:all .22s; font-family:inherit; }
        .btn-nav-solid:hover { background:#e6a800; transform:translateY(-2px); box-shadow:0 8px 22px rgba(247,181,0,.38); }

        .nl { color:#0A2540; text-decoration:none; font-size:15px; font-weight:500; transition:color .2s; }
        .nl:hover { color:#F7B500; }
        .di { display:block; padding:10px 16px; color:#0A2540; text-decoration:none; font-size:14px; font-weight:600; transition:background .15s; white-space:nowrap; }
        .di:hover { background:#FFFBEB; }

        @keyframes hzoom { 0%{transform:scale(1.08)} 100%{transform:scale(1)} }
        .hero-img { animation:hzoom 2.2s cubic-bezier(.22,1,.36,1) forwards; }
        @keyframes hfi { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        .hc>* { animation:hfi .9s cubic-bezier(.22,1,.36,1) both; }
        .hc>*:nth-child(1){animation-delay:.05s} .hc>*:nth-child(2){animation-delay:.18s}
        .hc>*:nth-child(3){animation-delay:.32s} .hc>*:nth-child(4){animation-delay:.48s}
        @keyframes mi { from{opacity:0;transform:scale(.92) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .mbox { animation:mi .32s cubic-bezier(.22,1,.36,1); }
        @keyframes spin { to{transform:rotate(360deg)} }

        .adn-card { background:white; border-radius:24px; overflow:hidden; border:1px solid rgba(10,37,64,.07); box-shadow:0 6px 32px rgba(10,37,64,.08); display:flex; flex-direction:column; transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s,border-color .4s; }
        .adn-card:hover { transform:translateY(-14px); box-shadow:0 40px 80px rgba(10,37,64,.16); border-color:rgba(247,181,0,.25); }
        .adn-card:hover .adn-img { transform:scale(1.06); }
        .adn-img { transition:transform .8s cubic-bezier(.22,1,.36,1); }
        .xc { background:white; border-radius:20px; border:1px solid rgba(10,37,64,.07); box-shadow:0 4px 22px rgba(10,37,64,.07); display:flex; flex-direction:column; transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s,border-color .35s; }
        .xc:hover { transform:translateY(-10px); box-shadow:0 28px 64px rgba(10,37,64,.14); border-color:rgba(247,181,0,.3); }

        .tab { width:48px; height:48px; border-radius:50%; background:#0A2540; border:none; color:white; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(10,37,64,.2); transition:all .22s; position:absolute; top:50%; transform:translateY(-50%); }
        .tab:hover { background:#F7B500; color:#0A2540; transform:translateY(-50%) scale(1.1); }

        .nli { flex:1; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.15); border-radius:10px; padding:14px 20px; color:white; font-size:15px; outline:none; transition:border-color .2s; font-family:inherit; }
        .nli:focus { border-color:rgba(247,181,0,.6); }
        .nli::placeholder { color:rgba(255,255,255,.35); }
      `}</style>

      {/* ── MODAL ── */}
      {modal && (
        <div style={{ position:"fixed", inset:0, zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:24, background:"rgba(10,37,64,.72)", backdropFilter:"blur(8px)" }} onClick={() => setModal(false)}>
          <div className="mbox" style={{ background:"white", borderRadius:28, padding:"52px 44px", maxWidth:440, width:"100%", textAlign:"center", position:"relative", boxShadow:"0 40px 100px rgba(10,37,64,.3)" }} onClick={e => e.stopPropagation()}>
            <div style={{ width:72, height:72, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, color:"#0A2540", margin:"0 auto 22px", background:"linear-gradient(135deg,#F7B500,#e6a800)", boxShadow:"0 12px 32px rgba(247,181,0,.35)" }}><FaLock /></div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color:"#0A2540", marginBottom:12 }}>Inscription requise</h2>
            <p style={{ color:"#64748B", fontSize:14.5, lineHeight:1.75, marginBottom:28 }}>Pour consulter le profil de cet expert ou réserver un rendez-vous, créez un compte gratuit ou connectez-vous.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <Link href="/inscription" onClick={() => setModal(false)}><button style={{ width:"100%", background:"#F7B500", color:"#0A2540", border:"none", borderRadius:11, padding:14, fontFamily:"inherit", fontWeight:800, fontSize:15, cursor:"pointer" }}>Créer un compte gratuitement</button></Link>
              <Link href="/connexion" onClick={() => setModal(false)}><button style={{ width:"100%", background:"transparent", color:"#0A2540", border:"1.5px solid rgba(10,37,64,.14)", borderRadius:11, padding:12, fontFamily:"inherit", fontWeight:600, fontSize:14, cursor:"pointer" }}>J'ai déjà un compte — Connexion</button></Link>
            </div>
            <button onClick={() => setModal(false)} style={{ position:"absolute", top:14, right:18, background:"none", border:"none", fontSize:24, color:"#CBD5E1", cursor:"pointer" }}>×</button>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{ background:"white", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 0 rgba(10,37,64,.08),0 4px 20px rgba(10,37,64,.06)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 28px", height:78, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:12, textDecoration:"none" }}>
            <svg width="42" height="42" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="11" fill="#0A2540"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900" fontFamily="Arial" letterSpacing="0.5">BEH</text></svg>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:20, color:"#0A2540", letterSpacing:"-.3px" }}>Business <em style={{ color:"#F7B500" }}>Expert</em> Hub</span>
          </Link>
          <nav style={{ display:"flex", gap:28, alignItems:"center" }}>
            <Link href="/" className="nl" style={{ color:"#F7B500", fontWeight:700 }}>Accueil</Link>
            <Link href="/a-propos" className="nl">À propos</Link>
            <div style={{ position:"relative" }} onMouseEnter={() => setServOpen(true)} onMouseLeave={() => setServOpen(false)}>
              <span className="nl" style={{ fontWeight:600, cursor:"pointer" }}>Services ▾</span>
              {servOpen && (
                <ul style={{ position:"absolute", top:"calc(100% + 10px)", left:0, background:"white", borderRadius:12, listStyle:"none", padding:"8px 0", margin:0, zIndex:200, minWidth:210, boxShadow:"0 12px 40px rgba(0,0,0,.12)", border:"1px solid rgba(10,37,64,.06)" }}>
                  {NAV_SERVICES.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="di">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nl">Experts</Link>
            <Link href="/blog" className="nl">Blog</Link>
            <Link href="/contact" className="nl">Contact</Link>
          </nav>
          <div style={{ display:"flex", gap:10 }}>
            <Link href="/connexion"><button className="btn-nav-outline">Connexion</button></Link>
            <Link href="/inscription"><button className="btn-nav-solid">S'inscrire</button></Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position:"relative", color:"white", overflow:"hidden", minHeight:660 }}>
        <div style={{ position:"absolute", inset:0, zIndex:0 }}>
          <Image src="/image.png" alt="Hero" fill priority className="hero-img" style={{ objectFit:"cover" }} sizes="100vw" />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(108deg,rgba(6,14,26,.97) 0%,rgba(10,30,60,.82) 42%,rgba(10,37,64,.2) 100%)" }} />
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize:"48px 48px", pointerEvents:"none" }} />
        </div>
        <div className="hc" style={{ position:"relative", zIndex:10, maxWidth:1280, margin:"0 auto", padding:"130px 32px 150px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:28, background:"rgba(247,181,0,.12)", border:"1px solid rgba(247,181,0,.25)", borderRadius:99, padding:"7px 16px 7px 12px" }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#F7B500", display:"inline-block" }} />
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"2.5px", textTransform:"uppercase", color:"#F7B500" }}>Cabinet de consulting & conseil</span>
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, margin:"0 0 24px", lineHeight:1.05, fontSize:"clamp(52px,7vw,90px)", maxWidth:680 }}>
            Propulsez votre{" "}
            <em style={{ color:"#F7B500", fontStyle:"italic" }}>startup</em>
            <br />vers l'excellence
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,.72)", maxWidth:520, lineHeight:1.9, marginBottom:44 }}>
            Plateforme d'experts spécialisée dans l'accompagnement stratégique des startups et entreprises en croissance.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:14 }}>
            <Link href="/services" className="btn-gold">Découvrir nos services <FaArrowRight size={12} /></Link>
            <Link href="/contact" className="btn-outline-light">Contactez-nous <FaArrowRight size={12} /></Link>
          </div>
        </div>
      </section>

      {/* ── ADN ── */}
      <section style={{ padding:"120px 28px", overflow:"hidden", position:"relative", background:"#FAFBFC" }}>
        <div style={{ position:"absolute", inset:0, zIndex:0 }}>
          <Image src="/image1.png" alt="bg" fill style={{ objectFit:"cover", opacity:.05 }} sizes="100vw" />
        </div>
        <div style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", marginBottom:80 }}>
              <h2 className="sec-title" style={{ marginBottom:16 }}>L'<em>ADN</em> de notre cabinet</h2>
            </div>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:28 }}>
            {ADN_CARDS.map((card, i) => (
              <Reveal key={i} delay={i * .14}>
                <div className="adn-card" style={{ height:"100%" }}>
                  <div style={{ position:"relative", overflow:"hidden", height:230 }}>
                    <Image src={card.image} alt={card.title} fill className="adn-img" style={{ objectFit:"cover" }} sizes="400px" />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent 30%,rgba(10,37,64,.65) 100%)" }} />
                    <div style={{ position:"absolute", bottom:18, left:20, right:20 }}>
                      <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color:"white", margin:0 }}>{card.title}</h3>
                    </div>
                  </div>
                  <div style={{ padding:"24px 26px 26px", display:"flex", flexDirection:"column", flex:1 }}>
                    <div style={{ width:36, height:3, borderRadius:2, background:card.color, marginBottom:16 }} />
                    <p style={{ fontSize:14, color:"#64748B", lineHeight:1.85, flex:1, marginBottom:22 }}>{card.desc}</p>
                    <Link href={`/a-propos#${card.anchor}`}>
                      <button style={{ display:"inline-flex", alignItems:"center", gap:7, fontFamily:"inherit", fontWeight:700, fontSize:13, padding:"10px 18px", borderRadius:9, border:"none", cursor:"pointer", background:`${card.color}16`, color:card.color, transition:"all .2s" }}>
                        En savoir plus <FaArrowRight size={10} />
                      </button>
                    </Link>
                  </div>
                  <div style={{ height:3, background:`linear-gradient(90deg,${card.color},${card.color}28)` }} />
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={.45}>
            <div style={{ textAlign:"center", marginTop:60 }}>
              <Link href="/a-propos" className="btn-dark">En savoir plus sur nous <FaArrowRight size={12} /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── EXPERTS ── */}
      <section style={{ padding:"104px 28px", position:"relative", overflow:"hidden", background:"linear-gradient(160deg,#060e18 0%,#0b1f3a 50%,#060e18 100%)" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,.02) 1px,transparent 1px)", backgroundSize:"44px 44px", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:800, height:800, borderRadius:"50%", background:"radial-gradient(circle,rgba(247,181,0,.04) 0%,transparent 65%)", pointerEvents:"none" }} />
        <div style={{ maxWidth:1240, margin:"0 auto", position:"relative", zIndex:10 }}>
          <Reveal>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", marginBottom:72 }}>
              <span className="eyebrow" style={{ marginBottom:18 }}>Notre équipe</span>
              <h2 className="sec-title sec-title-light" style={{ marginBottom:14 }}>Nos <em>Experts</em> certifiés</h2>
            </div>
          </Reveal>
          {loading ? (
            <div style={{ textAlign:"center", padding:"72px 0" }}>
              <div style={{ width:44, height:44, border:"3px solid #F7B500", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto" }} />
            </div>
          ) : experts.length === 0 ? (
            <div style={{ textAlign:"center", padding:"72px 0", color:"rgba(255,255,255,.25)", fontSize:15 }}>Aucun expert disponible pour le moment.</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:22 }}>
              {experts.map((ex, i) => {
                const name = getName(ex);
                const ini  = getIni(ex);
                const dsp  = dispos[ex.id] || [];
                return (
                  <Reveal key={ex.id} delay={i * .1}>
                    <div className="xc" style={{ height:"100%" }}>
                      <div style={{ padding:"20px 20px 0" }}>
                        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
                          <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99, background:ex.disponible?"#ECFDF5":"#F9FAFB", color:ex.disponible?"#059669":"#9CA3AF" }}>
                            {ex.disponible ? "● Disponible" : "● Occupé"}
                          </span>
                        </div>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:14 }}>
                          <div style={{ width:60, height:60, borderRadius:"50%", overflow:"hidden", flexShrink:0, background:"#0A2540", display:"flex", alignItems:"center", justifyContent:"center", color:"#F7B500", fontWeight:800, fontSize:19, border:"2px solid rgba(247,181,0,.4)" }}>
                            {ex.photo ? <img src={`http://localhost:3001/uploads/photos/${ex.photo}`} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : ini}
                          </div>
                          <div>
                            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, color:"#0A2540", fontSize:19, margin:"0 0 5px", lineHeight:1.2 }}>{name}</h3>
                            <span style={{ display:"inline-block", background:"#EFF6FF", color:"#2563EB", borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{ex.domaine || "Expert"}</span>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                          {ex.experience   && <span style={{ fontSize:11.5, color:"#64748B", background:"#F7F9FC", border:"1px solid #E8EEF6", borderRadius:6, padding:"3px 8px" }}>💼 {ex.experience}</span>}
                          {ex.localisation && <span style={{ fontSize:11.5, color:"#64748B", background:"#F7F9FC", border:"1px solid #E8EEF6", borderRadius:6, padding:"3px 8px" }}>📍 {ex.localisation}</span>}
                          {ex.tarif        && <span style={{ fontSize:11.5, color:"#B45309", background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:6, padding:"3px 8px" }}>💰 {ex.tarif}</span>}
                        </div>
                        {ex.description && (
                          <p style={{ fontSize:13, color:"#64748B", lineHeight:1.7, marginBottom:14, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{ex.description}</p>
                        )}
                        {dsp.length > 0 && (
                          <div style={{ marginBottom:14 }}>
                            <p style={{ fontSize:10.5, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Prochains créneaux</p>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                              {dsp.slice(0, 3).map((d, idx) => (
                                <span key={idx} style={{ fontSize:11, background:"#EFF6FF", color:"#2563EB", padding:"3px 8px", borderRadius:6, fontWeight:500, display:"inline-flex", alignItems:"center", gap:4 }}>
                                  <FaCalendarAlt size={9} />
                                  {new Date(d.date).toLocaleDateString("fr-FR", { day:"numeric", month:"short" })} {(d.heure || "").slice(0, 5)}
                                </span>
                              ))}
                              {dsp.length > 3 && <span style={{ fontSize:11, color:"#9CA3AF", alignSelf:"center" }}>+{dsp.length - 3}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ padding:"12px 20px 20px", borderTop:"1px solid #F1F5F9", marginTop:"auto", display:"flex", gap:8 }}>
                        <button onClick={() => setModal(true)} style={{ flex:1, fontFamily:"inherit", fontSize:13, fontWeight:700, background:"#0A2540", color:"#fff", border:"none", borderRadius:10, padding:"11px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"background .2s,color .2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background="#F7B500"; e.currentTarget.style.color="#0A2540"; }}
                          onMouseLeave={e => { e.currentTarget.style.background="#0A2540"; e.currentTarget.style.color="#fff"; }}>
                          Voir le profil <FaArrowRight size={11} />
                        </button>
                        <button onClick={() => setModal(true)} style={{ width:44, height:44, fontFamily:"inherit", background:"#F7F9FC", border:"1px solid #E8EEF6", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#64748B", transition:"all .2s" }}
                          onMouseEnter={e => { e.currentTarget.style.background="#F7B500"; e.currentTarget.style.color="#0A2540"; }}
                          onMouseLeave={e => { e.currentTarget.style.background="#F7F9FC"; e.currentTarget.style.color="#64748B"; }}>
                          <FaCalendarAlt size={13} />
                        </button>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
          <Reveal delay={.4}>
            <div style={{ textAlign:"center", marginTop:56 }}>
              <Link href="/experts" className="btn-gold">Voir tous nos experts <FaArrowRight size={12} /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PARTENAIRES ── */}
      <section style={{ padding:"80px 0", background:"white", overflow:"hidden" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 28px" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:56 }}>
              <h2 className="sec-title">Nos <em>Partenaires</em></h2>
            </div>
          </Reveal>
          <div style={{ position:"relative", display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => { const el=document.getElementById("logos-slider"); if(el) el.scrollBy({left:-300,behavior:"smooth"}); }}
              style={{ width:44, height:44, borderRadius:"50%", background:"#0A2540", border:"none", color:"white", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 16px rgba(10,37,64,.2)", transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="#F7B500";e.currentTarget.style.color="#0A2540";}}
              onMouseLeave={e=>{e.currentTarget.style.background="#0A2540";e.currentTarget.style.color="white";}}>‹</button>
            <div id="logos-slider" style={{ display:"flex", alignItems:"center", gap:40, overflowX:"auto", scrollbarWidth:"none", flex:1, padding:"10px 0" }}>
              <style>{`#logos-slider::-webkit-scrollbar{display:none;}`}</style>
              {LOGOS.map((logo, i) => (
                <img key={i} src={logo} alt={`Partenaire ${i+1}`}
                  style={{ height:65, width:"auto", maxWidth:180, objectFit:"contain", flexShrink:0, transition:"transform .3s" }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLImageElement).style.transform="scale(1.08)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLImageElement).style.transform="scale(1)";}}
                  onError={e=>{(e.currentTarget as HTMLImageElement).style.display="none";}}
                />
              ))}
            </div>
            <button onClick={() => { const el=document.getElementById("logos-slider"); if(el) el.scrollBy({left:300,behavior:"smooth"}); }}
              style={{ width:44, height:44, borderRadius:"50%", background:"#0A2540", border:"none", color:"white", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 16px rgba(10,37,64,.2)", transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="#F7B500";e.currentTarget.style.color="#0A2540";}}
              onMouseLeave={e=>{e.currentTarget.style.background="#0A2540";e.currentTarget.style.color="white";}}>›</button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TÉMOIGNAGES — affiche : Nom, Fonction, Startup
      ══════════════════════════════════════════════ */}
      <section style={{ padding:"104px 28px", position:"relative", overflow:"hidden", background:"linear-gradient(160deg,#0A2540 0%,#0f3060 100%)" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none" }} />
        <div style={{ maxWidth:860, margin:"0 auto", position:"relative", zIndex:10 }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:64 }}>
              <span className="eyebrow" style={{ justifyContent:"center", marginBottom:18 }}>Témoignages</span>
              <h2 className="sec-title sec-title-light">Ce que disent nos <em>clients</em></h2>
            </div>
          </Reveal>

          {temoLoading && (
            <div style={{ textAlign:"center", padding:"40px 0" }}>
              <div style={{ width:36, height:36, border:"3px solid #F7B500", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto" }} />
            </div>
          )}

          {!temoLoading && temoignages.length === 0 && (
            <div style={{ textAlign:"center", padding:"48px 0" }}>
              <div style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, padding:"40px 32px", display:"inline-block" }}>
                <div style={{ fontSize:40, marginBottom:16 }}>💬</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:"white", marginBottom:10 }}>Aucun témoignage pour l'instant</div>
                <div style={{ fontSize:14, color:"rgba(255,255,255,.4)", lineHeight:1.7 }}>Les témoignages de nos clients apparaîtront ici après validation.</div>
              </div>
            </div>
          )}

          {!temoLoading && temoignages.length > 0 && temoInfo && (
            <>
              <Reveal delay={.15}>
                <div style={{ position:"relative" }}>
                  <div style={{ background:"white", borderRadius:24, padding:"52px 64px 44px", boxShadow:"0 12px 60px rgba(0,0,0,.25)", opacity:tAnim?0:1, transform:tAnim?"scale(.97)":"scale(1)", transition:"opacity .28s ease,transform .28s ease", position:"relative", minHeight:200 }}>
                    <FaQuoteLeft style={{ position:"absolute", top:28, left:44, fontSize:40, color:"rgba(247,181,0,.15)" }} />

                    {/* Texte du témoignage */}
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", color:"#334155", lineHeight:1.85, textAlign:"center", marginBottom:36, fontSize:"clamp(17px,2.2vw,22px)", fontWeight:500 }}>
                      &ldquo;{currentTemo?.texte}&rdquo;
                    </p>

                    {/* Auteur avec nom, fonction, startup */}
                    <div style={{ textAlign:"center" }}>
                      {/* Avatar initiales */}
                      <div style={{ width:54, height:54, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#F7B500", fontWeight:900, fontSize:17, margin:"0 auto 14px", background:"linear-gradient(135deg,#0A2540,#1a4080)", boxShadow:"0 4px 16px rgba(10,37,64,.25)" }}>
                        {temoInfo.ini}
                      </div>

                      {/* Nom complet */}
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, color:"#0A2540", fontSize:19, marginBottom:6 }}>
                        {temoInfo.nomComplet}
                      </div>

                      {/* Fonction — Nom de la startup */}
                      <div style={{ color:"#F7B500", fontSize:13.5, fontWeight:700, letterSpacing:.5 }}>
                        {temoInfo.subtitle}
                      </div>
                    </div>
                  </div>

                  {temoignages.length > 1 && (
                    <>
                      <button className="tab" style={{ left:-26 }} onClick={() => goT((tActive - 1 + temoignages.length) % temoignages.length)}><FaChevronLeft /></button>
                      <button className="tab" style={{ right:-26 }} onClick={() => goT((tActive + 1) % temoignages.length)}><FaChevronRight /></button>
                    </>
                  )}
                </div>
              </Reveal>

              {temoignages.length > 1 && (
                <div style={{ display:"flex", justifyContent:"center", gap:10, marginTop:36 }}>
                  {temoignages.map((_, i) => (
                    <button key={i} onClick={() => goT(i)} style={{ height:9, borderRadius:99, border:"none", cursor:"pointer", padding:0, transition:"all .3s", width:i===tActive?28:9, background:i===tActive?"#F7B500":"rgba(255,255,255,.22)" }} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section style={{ padding:"96px 28px", background:"#F8FAFC" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <Reveal>
            <div style={{ borderRadius:28, overflow:"hidden", background:"linear-gradient(135deg,#0A2540 0%,#1a4080 100%)", padding:"80px 64px", boxShadow:"0 24px 64px rgba(10,37,64,.2)", position:"relative" }}>
              <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize:"36px 36px", pointerEvents:"none" }} />
              <div style={{ maxWidth:560, margin:"0 auto", position:"relative", zIndex:10, textAlign:"center" }}>
                <div style={{ width:60, height:60, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", fontSize:24, color:"#0A2540", background:"linear-gradient(135deg,#F7B500,#e6a800)", boxShadow:"0 8px 24px rgba(247,181,0,.3)" }}><FaEnvelope /></div>
                <span className="eyebrow" style={{ justifyContent:"center", marginBottom:16 }}>Newsletter</span>
                <h2 className="sec-title sec-title-light" style={{ marginBottom:14 }}>Restez <em>informé</em></h2>
                <p style={{ color:"rgba(255,255,255,.45)", fontSize:15, marginBottom:40, lineHeight:1.75 }}>Recevez nos dernières actualités, conseils et ressources pour accélérer la croissance de votre startup.</p>
                {sent ? (
                  <div style={{ borderRadius:14, padding:"24px 28px", color:"#4ade80", fontSize:17, fontWeight:700, background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.3)" }}>✅ Merci ! Vous êtes bien inscrit.</div>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); if (mail) { setSent(true); setMail(""); } }} style={{ display:"flex", gap:10, maxWidth:480, margin:"0 auto" }}>
                    <input type="email" value={mail} onChange={e => setMail(e.target.value)} placeholder="Votre adresse email..." required className="nli" />
                    <button type="submit" className="btn-gold" style={{ flexShrink:0, padding:"14px 22px" }}>S'inscrire</button>
                  </form>
                )}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:28, marginTop:28 }}>
                  {["2 500+ abonnés","1 email / semaine","100% gratuit"].map((item, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:6, color:"rgba(255,255,255,.38)", fontSize:12.5 }}>
                      <FaCheck style={{ color:"#F7B500", fontSize:9 }} />{item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"#060E1C", color:"white", padding:"64px 28px 32px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:44, marginBottom:56 }}>
            <div>
              <Link href="/" style={{ display:"flex", alignItems:"center", gap:11, textDecoration:"none", marginBottom:18 }}>
                <svg width="38" height="38" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="10" fill="#0A2540"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900" fontFamily="Arial" letterSpacing="0.5">BEH</text></svg>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:16, color:"white" }}>Business <em style={{ color:"#F7B500" }}>Expert</em> Hub</span>
              </Link>
              <p style={{ color:"rgba(255,255,255,.3)", fontSize:13, lineHeight:1.85 }}>Plateforme de mise en relation entre startups et experts certifiés.</p>
            </div>
            {[
              { title:"Navigation", links:[["Accueil","/"],["À propos","/a-propos"],["Services","/services"],["Experts","/experts"],["Blog","/blog"],["Contact","/contact"]] },
              { title:"Services",   links:NAV_SERVICES.map(s => [s.label, `/services/${s.slug}`]) },
              { title:"Contact",    links:[["contact@beh.com","#"],["+216 00 000 000","#"],["Tunis, Tunisie","#"]] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color:"rgba(255,255,255,.45)", fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:18 }}>{col.title}</h4>
                <ul style={{ listStyle:"none", padding:0, display:"flex", flexDirection:"column", gap:11 }}>
                  {col.links.map(([l, h]) => (
                    <li key={l}><Link href={h} style={{ color:"rgba(255,255,255,.35)", fontSize:14, textDecoration:"none" }}>{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:28 }}>
            <p style={{ margin:0, color:"rgba(255,255,255,.2)", fontSize:13 }}>© 2026 Business Expert Hub — Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </div>
  );
}