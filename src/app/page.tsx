"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaQuoteLeft, FaChevronLeft, FaChevronRight,
  FaEnvelope, FaArrowRight, FaLock, FaCheck,
  FaCalendarAlt, FaFacebookF, FaInstagram, FaLinkedinIn,
  FaChevronDown, FaMapMarkerAlt, FaPhone, FaEye, FaEyeSlash,
  FaRocket, FaUserPlus,
} from "react-icons/fa";

// ════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════
interface ExpertAPI {
  id: number; user_id: number; nom: string; prenom: string;
  domaine: string; description: string; experience: string;
  localisation: string; tarif: string; disponible: boolean;
  note: number; nb_avis: number; photo?: string;
  user?: { nom: string; prenom: string; email: string };
}
interface Dispo { id: number; date: string; heure: string; }
interface TemoAPI {
  id: number; texte: string; statut: string;
  user?: { nom: string; prenom: string; role: string };
  startup?: { nom_startup: string; fonction: string; secteur: string };
  createdAt: string;
}

// ════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════
function useInView(thr = 0.12): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); o.disconnect(); }
    }, { threshold: thr });
    o.observe(el); return () => o.disconnect();
  }, [thr]);
  return [ref, v];
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? "none" : "translateY(36px)",
      transition: `opacity .85s cubic-bezier(.22,1,.36,1) ${delay}s, transform .85s cubic-bezier(.22,1,.36,1) ${delay}s`
    }}>{children}</div>
  );
}

function getName(ex: ExpertAPI) {
  const p = ex.user?.prenom || ex.prenom || "";
  const n = ex.user?.nom || ex.nom || "";
  return `${p} ${n}`.trim() || ex.domaine || "Expert";
}
function getIni(ex: ExpertAPI) {
  const p = ex.user?.prenom || ex.prenom || "";
  const n = ex.user?.nom || ex.nom || "";
  return ((p[0] || "") + (n[0] || "")).toUpperCase() || "EX";
}
function getTemoInfo(t: TemoAPI) {
  const pr = t.user?.prenom || ""; const nm = t.user?.nom || "";
  const full = `${pr} ${nm}`.trim() || "Client BEH";
  const ini = ((pr[0] || "") + (nm[0] || "")).toUpperCase() || "??";
  const st = t.startup?.nom_startup || "";
  const fn = t.startup?.fonction || (t.user?.role === "expert" ? "Expert BEH" : "");
  let sub = "";
  if (fn && st) sub = `${fn} — ${st}`;
  else if (fn) sub = fn;
  else if (st) sub = st;
  else if (t.user?.role === "expert") sub = "Expert BEH";
  else sub = "Startup BEH";
  return { full, ini, sub };
}

// ════════════════════════════════════════════════════════
// CONSTANTES
// ════════════════════════════════════════════════════════
const ADN_COLORS = ["#3B82F6", "#F7B500", "#10B981"];
const ADN_IMGS   = ["/vision.png", "/mission.png", "/valeurs.png"];
const ADN_ANCHORS = ["vision", "mission", "valeurs"];
const ADN_ITEMS = [
  { title: "Notre Vision",  body: "Devenir la référence absolue en accompagnement de startups innovantes, en connectant les meilleurs experts aux projets les plus ambitieux de demain." },
  { title: "Notre Mission", body: "Offrir aux startups un accès privilégié à des experts certifiés pour structurer leur stratégie, accélérer leur croissance et réussir leurs levées de fonds." },
  { title: "Nos Valeurs",   body: "Excellence, transparence et engagement humain. Chaque accompagnement est unique et conçu pour maximiser l'impact durable de votre entreprise." },
];
const SERVICES = [
  { label: "Consulting",     slug: "consulting"     },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Accompagnement", slug: "accompagnement" },
  { label: "Formations",     slug: "formations"     },
];
const LOGOS = [
  "/logos/partenaire1.png", "/logos/partenaire2.png", "/logos/partenaire3.png",
  "/logos/partenaire4.png", "/logos/partenaire5.png", "/logos/partenaire6.png",
  "/logos/partenaire7.png",
];

// ════════════════════════════════════════════════════════
// COMPOSANT POPUP INSCRIPTION
// ════════════════════════════════════════════════════════
function SignupPopup({ onClose }: { onClose: () => void }) {
  const [email,    setEmail]    = useState("");
  const [pass,     setPass]     = useState("");
  const [showPass, setShowPass] = useState(false);
  const [step,     setStep]     = useState<"form" | "success">("form");

  const strength = pass.length === 0 ? 0 : pass.length < 6 ? 1 : pass.length < 10 ? 2 : 3;
  const strColor = ["", "#EF4444", "#F59E0B", "#10B981"][strength];
  const strLabel = ["", "Faible", "Moyen", "Fort"][strength];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("beh_popup_dismissed", "1");
    setStep("success");
    setTimeout(() => { window.location.href = "/inscription"; }, 1500);
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      {/* Overlay */}
      <div style={{ position:"absolute", inset:0, background:"rgba(4,12,24,.82)", backdropFilter:"blur(12px)" }} onClick={onClose} />

      {/* Carte */}
      <div style={{
        position:"relative", zIndex:10, width:"100%", maxWidth:960,
        borderRadius:28, overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 1fr",
        boxShadow:"0 40px 120px rgba(0,0,0,.65)", animation:"popIn .4s cubic-bezier(.22,1,.36,1)"
      }}>
        {/* ── Panneau gauche ── */}
        <div style={{
          background:"linear-gradient(145deg,#0A2540 0%,#0f3564 50%,#1a4a80 100%)",
          padding:"52px 44px", display:"flex", flexDirection:"column",
          justifyContent:"space-between", position:"relative", overflow:"hidden"
        }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"rgba(247,181,0,.07)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-40, left:-40, width:160, height:160, borderRadius:"50%", background:"rgba(247,181,0,.05)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize:"36px 36px", pointerEvents:"none" }} />

          <div style={{ position:"relative", zIndex:2 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(247,181,0,.15)", border:"1px solid rgba(247,181,0,.3)", borderRadius:99, padding:"5px 14px", marginBottom:28 }}>
              <FaRocket size={10} style={{ color:"#F7B500" }} />
              <span style={{ fontSize:10.5, fontWeight:800, letterSpacing:"2px", textTransform:"uppercase", color:"#F7B500" }}>Plateforme exclusive</span>
            </div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(28px,3vw,40px)", fontWeight:700, color:"#fff", lineHeight:1.15, marginBottom:14 }}>
              Rejoignez notre plateforme
            </h2>
            <p style={{ fontSize:14.5, color:"rgba(255,255,255,.5)", lineHeight:1.8, marginBottom:36 }}>
              Accédez à nos experts, services et opportunités exclusives
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {["Accès aux profils experts", "Réservation de rendez-vous", "Conseils stratégiques exclusifs"].map((p, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:26, height:26, borderRadius:8, background:"rgba(247,181,0,.18)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <FaCheck size={10} style={{ color:"#F7B500" }} />
                  </div>
                  <span style={{ fontSize:14, color:"rgba(255,255,255,.7)", fontWeight:500 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position:"relative", zIndex:2, display:"flex", alignItems:"center", gap:10, marginTop:40 }}>
            <svg width="32" height="32" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="10" fill="rgba(247,181,0,.15)" />
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="13" fontWeight="900" fontFamily="Arial">BEH</text>
            </svg>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:600, fontSize:14, color:"rgba(255,255,255,.45)" }}>Business Expert Hub</span>
          </div>
        </div>

        {/* ── Panneau droit ── */}
        <div style={{ background:"#fff", padding:"48px 44px", display:"flex", flexDirection:"column", justifyContent:"center", position:"relative" }}>

          {step === "success" ? (
            <div style={{ textAlign:"center", padding:"20px 0" }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#10B981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", boxShadow:"0 8px 28px rgba(16,185,129,.3)" }}>
                <FaCheck size={28} style={{ color:"#fff" }} />
              </div>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color:"#0A2540", marginBottom:10 }}>Bienvenue !</h3>
              <p style={{ fontSize:14, color:"#64748B", lineHeight:1.7 }}>Redirection en cours...</p>
              <div style={{ marginTop:20, height:3, borderRadius:99, background:"#EEF2F7", overflow:"hidden" }}>
                <div style={{ height:"100%", background:"#10B981", animation:"progress 1.4s linear forwards", borderRadius:99 }} />
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom:28 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#F7B500,#e6a800)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <FaUserPlus size={15} style={{ color:"#0A2540" }} />
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"1.5px" }}>Inscription gratuite</div>
                    <div style={{ fontSize:17, fontWeight:800, color:"#0A2540", marginTop:1 }}>Créer votre compte</div>
                  </div>
                </div>
              </div>

              <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={{ fontSize:11.5, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:6 }}>E-mail</label>
                  <div style={{ position:"relative" }}>
                    <FaEnvelope style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#94A3B8", fontSize:13 }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Votre adresse e-mail" required
                      style={{ width:"100%", background:"#F8FAFC", border:"1.5px solid #E2EAF4", borderRadius:11, padding:"12px 14px 12px 38px", fontFamily:"'Outfit',sans-serif", fontSize:14, color:"#0A2540", outline:"none", transition:"border-color .18s" }}
                      onFocus={e => e.currentTarget.style.borderColor = "#F7B500"}
                      onBlur={e  => e.currentTarget.style.borderColor = "#E2EAF4"}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize:11.5, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"1px", display:"block", marginBottom:6 }}>Mot de passe</label>
                  <div style={{ position:"relative" }}>
                    <FaLock style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#94A3B8", fontSize:13 }} />
                    <input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="Créer un mot de passe" required
                      style={{ width:"100%", background:"#F8FAFC", border:"1.5px solid #E2EAF4", borderRadius:11, padding:"12px 40px 12px 38px", fontFamily:"'Outfit',sans-serif", fontSize:14, color:"#0A2540", outline:"none", transition:"border-color .18s" }}
                      onFocus={e => e.currentTarget.style.borderColor = "#F7B500"}
                      onBlur={e  => e.currentTarget.style.borderColor = "#E2EAF4"}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#94A3B8", display:"flex", alignItems:"center", padding:4 }}>
                      {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  {pass.length > 0 && (
                    <div style={{ marginTop:7, display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ flex:1, height:3, borderRadius:99, background:"#EEF2F7", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:99, background:strColor, width:`${strength*33}%`, transition:"width .3s,background .3s" }} />
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, color:strColor }}>{strLabel}</span>
                    </div>
                  )}
                </div>

                <button type="submit"
                  style={{ background:"linear-gradient(135deg,#0A2540,#163d72)", color:"#F7B500", border:"none", borderRadius:11, padding:"14px", fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:4, boxShadow:"0 6px 20px rgba(10,37,64,.25)", transition:"all .22s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="linear-gradient(135deg,#F7B500,#e6a800)"; e.currentTarget.style.color="#0A2540"; e.currentTarget.style.transform="translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="linear-gradient(135deg,#0A2540,#163d72)"; e.currentTarget.style.color="#F7B500"; e.currentTarget.style.transform="translateY(0)"; }}>
                  <FaRocket size={13} /> Créer mon compte gratuitement
                </button>

                <div style={{ display:"flex", alignItems:"center", gap:12, margin:"4px 0" }}>
                  <div style={{ flex:1, height:1, background:"#EEF2F7" }} />
                  <span style={{ fontSize:12, color:"#94A3B8", fontWeight:500 }}>ou</span>
                  <div style={{ flex:1, height:1, background:"#EEF2F7" }} />
                </div>

                <Link href="/connexion">
                  <button type="button"
                    style={{ width:"100%", background:"transparent", color:"#334155", border:"1.5px solid #E2EAF4", borderRadius:11, padding:"12px", fontFamily:"'Outfit',sans-serif", fontWeight:600, fontSize:14, cursor:"pointer", transition:"all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor="#0A2540"; e.currentTarget.style.color="#0A2540"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor="#E2EAF4"; e.currentTarget.style.color="#334155"; }}>
                    J&apos;ai déjà un compte — Se connecter
                  </button>
                </Link>
              </form>

              <div style={{ marginTop:16, textAlign:"center" }}>
                <p style={{ fontSize:11.5, color:"#94A3B8", lineHeight:1.7 }}>
                  En vous inscrivant, vous acceptez nos{" "}
                  <Link href="#" style={{ color:"#F7B500", fontWeight:600, textDecoration:"none" }}>conditions d&apos;utilisation</Link>
                </p>
                <button onClick={onClose}
                  style={{ marginTop:10, background:"none", border:"none", cursor:"pointer", fontSize:12.5, color:"#B8C4D6", fontFamily:"'Outfit',sans-serif", textDecoration:"underline", textUnderlineOffset:2, transition:"color .18s" }}
                  onMouseEnter={e => e.currentTarget.style.color="#64748B"}
                  onMouseLeave={e => e.currentTarget.style.color="#B8C4D6"}>
                  Continuer en tant que visiteur
                </button>
              </div>
            </>
          )}

          <button onClick={onClose}
            style={{ position:"absolute", top:16, right:18, background:"none", border:"none", fontSize:18, color:"#CBD5E1", cursor:"pointer", lineHeight:1, transition:"color .18s", zIndex:20 }}
            onMouseEnter={e => e.currentTarget.style.color="#0A2540"}
            onMouseLeave={e => e.currentTarget.style.color="#CBD5E1"}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════
export default function Home() {
  const [servOpen,  setServOpen]  = useState(false);
  const [tIdx,      setTIdx]      = useState(0);
  const [tAnim,     setTAnim]     = useState(false);
  const [mail,      setMail]      = useState("");
  const [sent,      setSent]      = useState(false);
  const [modal,     setModal]     = useState(false);
  const [experts,   setExperts]   = useState<ExpertAPI[]>([]);
  const [dispos,    setDispos]    = useState<Record<number, Dispo[]>>({});
  const [loading,   setLoading]   = useState(true);
  const [temos,     setTemos]     = useState<TemoAPI[]>([]);
  const [temoLoad,  setTemoLoad]  = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const popupShown = useRef(false);

  // ── Popup auto ──
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("beh_popup_dismissed")) return;
    const timer = setTimeout(() => {
      if (!popupShown.current) { popupShown.current = true; setShowPopup(true); }
    }, 8000);
    const onScroll = () => {
      if (popupShown.current) return;
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (pct >= 0.45) { popupShown.current = true; setShowPopup(true); }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, []);

  // ── Experts ──
  useEffect(() => {
    fetch("http://localhost:3001/experts").then(r => r.ok ? r.json() : [])
      .then(async (d: ExpertAPI[]) => {
        if (Array.isArray(d) && d.length > 0) {
          const s = d.slice(0, 4); setExperts(s);
          const m: Record<number, Dispo[]> = {};
          await Promise.allSettled(s.map(async ex => {
            const r = await fetch(`http://localhost:3001/disponibilites/expert/${ex.id}`).catch(() => null);
            m[ex.id] = r?.ok ? await r.json() : [];
          }));
          setDispos(m);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  // ── Témoignages ──
  useEffect(() => {
    fetch("http://localhost:3001/temoignages/publics").then(r => r.ok ? r.json() : [])
      .then((d: TemoAPI[]) => { if (Array.isArray(d)) setTemos(d); setTemoLoad(false); })
      .catch(() => setTemoLoad(false));
  }, []);

  useEffect(() => {
    if (!temos.length) return;
    const t = setInterval(() => { if (!tAnim) setTIdx(p => (p + 1) % temos.length); }, 5500);
    return () => clearInterval(t);
  }, [temos.length, tAnim]);

  function goT(i: number) {
    if (tAnim || !temos.length) return;
    setTAnim(true); setTimeout(() => { setTIdx(i); setTAnim(false); }, 280);
  }

  const curTemo = temos[tIdx % Math.max(temos.length, 1)];
  const tInfo   = curTemo ? getTemoInfo(curTemo) : null;

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", color:"#2D3748" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .st  { font-family:'Cormorant Garamond',serif; font-weight:700; line-height:1.1; color:#0A2540; font-size:clamp(34px,4vw,58px); }
        .st em { font-style:italic; color:#F7B500; }
        .ey  { display:inline-flex; align-items:center; gap:8px; font-size:10.5px; font-weight:800; letter-spacing:3px; text-transform:uppercase; color:#F7B500; }
        .ey::before { content:''; display:block; width:24px; height:2px; background:#F7B500; border-radius:2px; }
        .bg  { display:inline-flex; align-items:center; gap:8px; background:#F7B500; color:#0A2540; border:none; border-radius:10px; padding:13px 26px; font-family:inherit; font-size:14px; font-weight:800; cursor:pointer; transition:all .22s; text-decoration:none; }
        .bg:hover  { background:#e6a800; transform:translateY(-3px); box-shadow:0 12px 32px rgba(247,181,0,.35); }
        .bd  { display:inline-flex; align-items:center; gap:8px; background:#0A2540; color:#fff; border:none; border-radius:10px; padding:13px 26px; font-family:inherit; font-size:14px; font-weight:700; cursor:pointer; transition:all .22s; text-decoration:none; }
        .bd:hover  { background:#F7B500; color:#0A2540; transform:translateY(-3px); }
        .bol { display:inline-flex; align-items:center; gap:8px; background:transparent; color:#fff; border:1.5px solid rgba(255,255,255,.28); border-radius:10px; padding:13px 26px; font-family:inherit; font-size:14px; font-weight:600; cursor:pointer; transition:all .22s; text-decoration:none; }
        .bol:hover { border-color:#F7B500; color:#F7B500; transform:translateY(-3px); }
        .bno { border:2px solid #0A2540; color:#0A2540; background:transparent; padding:9px 22px; border-radius:9px; font-weight:700; font-size:13.5px; cursor:pointer; transition:all .22s; font-family:inherit; }
        .bno:hover { background:#F7B500; border-color:#F7B500; }
        .bns { background:#F7B500; color:#0A2540; border:none; padding:9px 22px; border-radius:9px; font-weight:800; font-size:13.5px; cursor:pointer; transition:all .22s; font-family:inherit; }
        .bns:hover { background:#e6a800; box-shadow:0 8px 20px rgba(247,181,0,.38); }
        .nl  { color:#475569; text-decoration:none; font-size:14.5px; font-weight:500; transition:color .2s; }
        .nl:hover { color:#F7B500; }
        .di  { display:block; padding:10px 18px; color:#334155; text-decoration:none; font-size:14px; font-weight:500; transition:background .15s,color .15s; white-space:nowrap; }
        .di:hover { background:#FFFBEB; color:#F7B500; }
        .ac-card { background:#fff; border-radius:22px; overflow:hidden; border:1px solid rgba(10,37,64,.07); box-shadow:0 4px 24px rgba(10,37,64,.07); display:flex; flex-direction:column; transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s,border-color .4s; }
        .ac-card:hover { transform:translateY(-12px); box-shadow:0 36px 72px rgba(10,37,64,.15); border-color:rgba(247,181,0,.3); }
        .ac-card:hover .ai { transform:scale(1.06); }
        .ai  { transition:transform .8s cubic-bezier(.22,1,.36,1); }
        .ec  { background:#fff; border-radius:16px; border:1px solid #EEF2F7; box-shadow:0 2px 12px rgba(10,37,64,.05); display:flex; flex-direction:column; transition:transform .32s cubic-bezier(.22,1,.36,1),box-shadow .32s,border-color .32s; }
        .ec:hover { transform:translateY(-6px); box-shadow:0 20px 48px rgba(10,37,64,.11); border-color:rgba(247,181,0,.35); }
        .sb  { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:15px; text-decoration:none; transition:all .22s; border:none; cursor:pointer; }
        .sb:hover { transform:translateY(-4px); box-shadow:0 10px 24px rgba(0,0,0,.25); }
        @keyframes marqueeLeft  { 0%{transform:translateX(0)}    100%{transform:translateX(-50%)} }
        @keyframes marqueeRight { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)}    }
        .mL { display:flex; align-items:center; gap:64px; width:max-content; animation:marqueeLeft  25s linear infinite; }
        .mR { display:flex; align-items:center; gap:64px; width:max-content; animation:marqueeRight 25s linear infinite; }
        .mL:hover,.mR:hover { animation-play-state:paused; }
        @keyframes popIn    { from{opacity:0;transform:scale(.94) translateY(24px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes progress { from{width:0} to{width:100%} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes hzoom    { 0%{transform:scale(1.08)} 100%{transform:scale(1)} }
        @keyframes hfi      { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        .hi { animation:hzoom 2.2s cubic-bezier(.22,1,.36,1) forwards; }
        .hc > * { animation:hfi .9s cubic-bezier(.22,1,.36,1) both; }
        .hc > *:nth-child(1){animation-delay:.04s}
        .hc > *:nth-child(2){animation-delay:.16s}
        .hc > *:nth-child(3){animation-delay:.3s}
        .hc > *:nth-child(4){animation-delay:.46s}
      `}</style>

      {/* ════════ POPUP ════════ */}
      {showPopup && (
        <SignupPopup onClose={() => {
          localStorage.setItem("beh_popup_dismissed", "1");
          setShowPopup(false);
        }} />
      )}

      {/* ════════ MODAL EXPERT ════════ */}
      {modal && (
        <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:24, background:"rgba(6,14,26,.75)", backdropFilter:"blur(10px)" }}
          onClick={() => setModal(false)}>
          <div style={{ background:"#fff", borderRadius:28, padding:"52px 44px", maxWidth:440, width:"100%", textAlign:"center", position:"relative", boxShadow:"0 48px 120px rgba(10,37,64,.32)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width:68, height:68, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, color:"#0A2540", margin:"0 auto 22px", background:"linear-gradient(135deg,#F7B500,#e6a800)", boxShadow:"0 10px 28px rgba(247,181,0,.32)" }}>
              <FaLock />
            </div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color:"#0A2540", marginBottom:12 }}>Accès réservé</h2>
            <p style={{ color:"#64748B", fontSize:14.5, lineHeight:1.8, marginBottom:28 }}>Créez un compte gratuit ou connectez-vous pour accéder aux profils experts et réserver un rendez-vous.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <Link href="/inscription" onClick={() => setModal(false)}>
                <button style={{ width:"100%", background:"#0A2540", color:"#F7B500", border:"none", borderRadius:11, padding:"14px", fontFamily:"inherit", fontWeight:800, fontSize:15, cursor:"pointer" }}>Créer un compte</button>
              </Link>
              <Link href="/connexion" onClick={() => setModal(false)}>
                <button style={{ width:"100%", background:"transparent", color:"#0A2540", border:"1.5px solid #E2EAF4", borderRadius:11, padding:"12px", fontFamily:"inherit", fontWeight:600, fontSize:14, cursor:"pointer" }}>Se connecter</button>
              </Link>
            </div>
            <button onClick={() => setModal(false)} style={{ position:"absolute", top:14, right:18, background:"none", border:"none", fontSize:22, color:"#CBD5E1", cursor:"pointer", lineHeight:1 }}>✕</button>
          </div>
        </div>
      )}

      {/* ════════════════ HEADER ════════════════ */}
      <header style={{ background:"#fff", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 0 #EEF2F7,0 4px 18px rgba(10,37,64,.05)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 28px", height:76, display:"flex", alignItems:"center", justifyContent:"space-between", gap:20 }}>

          {/* Logo */}
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:11, textDecoration:"none", flexShrink:0 }}>
            <svg width="40" height="40" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="11" fill="#0A2540" />
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900" fontFamily="Arial">BEH</text>
            </svg>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:19, color:"#0A2540" }}>
              Business <em style={{ color:"#F7B500" }}>Expert</em> Hub
            </span>
          </Link>

          {/* Navigation */}
          <nav style={{ display:"flex", gap:20, alignItems:"center", flex:1, justifyContent:"center" }}>
            <Link href="/" className="nl" style={{ color:"#F7B500", fontWeight:700 }}>Accueil</Link>
            <Link href="/a-propos" className="nl">À propos</Link>
            <div style={{ position:"relative" }} onMouseEnter={() => setServOpen(true)} onMouseLeave={() => setServOpen(false)}>
              <span className="nl" style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                Services <FaChevronDown size={9} />
              </span>
              {servOpen && (
                <ul style={{ position:"absolute", top:"calc(100% + 10px)", left:0, background:"#fff", borderRadius:14, listStyle:"none", padding:"8px", margin:0, zIndex:200, minWidth:210, boxShadow:"0 16px 48px rgba(10,37,64,.14)", border:"1px solid #EEF2F7" }}>
                  {SERVICES.map(s => (
                    <li key={s.slug}><Link href={`/services/${s.slug}`} className="di">{s.label}</Link></li>
                  ))}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nl">Experts</Link>
            <Link href="/blog"    className="nl">Blog</Link>
            <Link href="/contact" className="nl">Contact</Link>
          </nav>

          {/* CTA */}
          <div style={{ display:"flex", gap:10, alignItems:"center", flexShrink:0 }}>
            <Link href="/connexion"><button className="bno">Connexion</button></Link>
            <Link href="/inscription"><button className="bns">S&apos;inscrire</button></Link>
          </div>
        </div>
      </header>

      {/* ════════════════ HERO ════════════════ */}
      <section style={{ position:"relative", color:"#fff", overflow:"hidden", minHeight:660 }}>
        <div style={{ position:"absolute", inset:0, zIndex:0 }}>
          <Image src="/image.png" alt="Hero" fill priority className="hi" style={{ objectFit:"cover" }} sizes="100vw" />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(108deg,rgba(6,14,26,.96) 0%,rgba(10,30,60,.8) 44%,rgba(10,37,64,.18) 100%)" }} />
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,.022) 1px,transparent 1px)", backgroundSize:"48px 48px", pointerEvents:"none" }} />
        </div>
        <div className="hc" style={{ position:"relative", zIndex:10, maxWidth:1280, margin:"0 auto", padding:"130px 32px 150px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:9, marginBottom:28, background:"rgba(247,181,0,.1)", border:"1px solid rgba(247,181,0,.22)", borderRadius:99, padding:"6px 16px 6px 10px" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#F7B500", display:"inline-block" }} />
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:"2.5px", textTransform:"uppercase", color:"#F7B500" }}>Cabinet de consulting & conseil</span>
          </div>
          <h1 style={{ fontSize:"clamp(36px,5vw,56px)", fontWeight:700, marginBottom:24, lineHeight:1.1 }}>
            Propulsez votre <span style={{ color:"#F7B500" }}>startup</span><br />vers l'excellence
          </h1>
          <p style={{ fontSize:16.5, color:"rgba(255,255,255,.7)", maxWidth:500, lineHeight:1.9, marginBottom:44 }}>
            Plateforme d&apos;experts spécialisée dans l&apos;accompagnement stratégique des startups et entreprises en croissance.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
            <Link href="/services" className="bg">Découvrir nos services <FaArrowRight size={12} /></Link>
            <Link href="/contact"  className="bol">Contactez-nous <FaArrowRight size={12} /></Link>
          </div>
        </div>
      </section>

      {/* ════════════════ ADN ════════════════ */}
      <section style={{ padding:"110px 28px", overflow:"hidden", position:"relative", background:"#F8FAFC" }}>
        <div style={{ fontFamily:"'Inter',sans-serif", color:"#2D3748" }}>
          <Image src="/image1.png" alt="bg" fill style={{ objectFit:"cover", opacity:.04 }} sizes="100vw" />
        </div>
        <div style={{ position:"relative", zIndex:10, maxWidth:1200, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:72 }}>
              <h2 className="text-center font-bold text-5xl leading-tight mb-6 text-[#0A2540]">
                <span className="text-[#F7B500]">Notre </span> ADN
              </h2>
            </div>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {ADN_ITEMS.map((card, i) => (
              <Reveal key={i} delay={i * .13}>
                <div className="ac-card" style={{ height:"100%" }}>
                  <div style={{ position:"relative", overflow:"hidden", height:220 }}>
                    <Image src={ADN_IMGS[i]} alt={card.title} fill className="ai" style={{ objectFit:"cover" }} sizes="400px" />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent 25%,rgba(10,37,64,.68) 100%)" }} />
                    <div style={{ position:"absolute", bottom:16, left:20, right:20 }}>
                      <h3 style={{ position:"absolute", bottom:20, left:20, color:"white", fontSize:18, fontWeight:700 }}>{card.title}</h3>
                    </div>
                  </div>
                  <div style={{ padding:"22px 24px 24px", display:"flex", flexDirection:"column", flex:1 }}>
                    <div style={{ width:32, height:3, borderRadius:2, background:ADN_COLORS[i], marginBottom:14 }} />
                    <p style={{ fontSize:13.5, color:"#64748B", lineHeight:1.85, flex:1, marginBottom:20 }}>{card.body}</p>
                    <Link href={`/a-propos#${ADN_ANCHORS[i]}`}>
                      <button style={{ display:"inline-flex", alignItems:"center", gap:6, fontFamily:"inherit", fontWeight:700, fontSize:13, padding:"9px 16px", borderRadius:9, border:"none", cursor:"pointer", background:`${ADN_COLORS[i]}18`, color:ADN_COLORS[i], transition:"all .2s" }}>
                        En savoir plus <FaArrowRight size={10} />
                      </button>
                    </Link>
                  </div>
                  <div style={{ height:3, background:`linear-gradient(90deg,${ADN_COLORS[i]},${ADN_COLORS[i]}22)` }} />
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={.42}>
            <div style={{ textAlign:"center", marginTop:56 }}>
              <Link href="/a-propos" className="bd">En savoir plus sur nous <FaArrowRight size={12} /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════ EXPERTS ════════════════ */}
      <section style={{ padding:"100px 28px", position:"relative", overflow:"hidden", background:"#FFFFFF" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(0,0,0,.02) 1px,transparent 1px)", backgroundSize:"44px 44px", pointerEvents:"none" }} />
        <div style={{ maxWidth:1240, margin:"0 auto", position:"relative", zIndex:10 }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:68 }}>
              <span className="ey" style={{ justifyContent:"center", marginBottom:16 }}>Notre équipe</span>
              <h2 className="text-center font-bold text-5xl leading-tight mb-6 text-[#0A2540]">
                Nos <span className="text-[#F7B500]">Experts</span> certifiés
              </h2>
            </div>
          </Reveal>

          {loading ? (
            <div style={{ textAlign:"center", padding:"72px 0" }}>
              <div style={{ width:42, height:42, border:"3px solid #F7B500", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto" }} />
            </div>
          ) : experts.length === 0 ? (
            <div style={{ textAlign:"center", padding:"72px 0", color:"#94A3B8", fontSize:15 }}>Aucun expert disponible pour le moment.</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(278px,1fr))", gap:20 }}>
              {experts.map((ex, i) => {
                const name = getName(ex); const ini = getIni(ex); const dsp = dispos[ex.id] || [];
                return (
                  <Reveal key={ex.id} delay={i * .09}>
                    <div className="ec" style={{ height:"100%", borderRadius:16, overflow:"hidden", display:"flex", flexDirection:"column" }}>

                      {/* Bande colorée supérieure — verte si dispo, grise sinon */}
                      <div style={{ height:3, background: ex.disponible ? "linear-gradient(90deg,#0A2540,#F7B500)" : "#E2E8F0", flexShrink:0 }} />

                      <div style={{ padding:"24px 24px 0", flex:1, display:"flex", flexDirection:"column" }}>

                        {/* En-tête : avatar + nom + badge dispo */}
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:18 }}>

                          <div style={{ display:"flex", alignItems:"center", gap:13 }}>
                            {/* Avatar carré, initiales ou photo */}
                            <div style={{ width:48, height:48, borderRadius:10, overflow:"hidden", flexShrink:0, background:"#0A2540", display:"flex", alignItems:"center", justifyContent:"center", color:"#F7B500", fontWeight:700, fontSize:15, letterSpacing:.5 }}>
                              {ex.photo
                                ? <img src={`http://localhost:3001/uploads/photos/${ex.photo}`} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                                : ini}
                            </div>
                            <div>
                              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, color:"#0A2540", fontSize:18, margin:"0 0 4px", lineHeight:1.2 }}>{name}</h3>
                              <span style={{ fontSize:11, fontWeight:600, color:"#92400E", background:"#FEF3C7", borderRadius:5, padding:"2px 8px", letterSpacing:.2 }}>
                                {ex.domaine || "Expert"}
                              </span>
                            </div>
                          </div>

                          {/* Badge disponibilité — texte seul, sobre */}
                          <span style={{
                            fontSize:10.5, fontWeight:600, padding:"3px 9px", borderRadius:5, flexShrink:0, marginTop:2,
                            background: ex.disponible ? "#F0FDF4" : "#F8FAFC",
                            color:      ex.disponible ? "#15803D"  : "#94A3B8",
                            border:    `1px solid ${ex.disponible ? "#BBF7D0" : "#E2E8F0"}`
                          }}>
                            {ex.disponible ? "Disponible" : "Occupé"}
                          </span>
                        </div>

                        {/* Séparateur fin */}
                        <div style={{ height:"0.5px", background:"#F1F5F9", marginBottom:16 }} />

                        {/* Description courte */}
                        {ex.description && (
                          <p style={{ fontSize:13, color:"#64748B", lineHeight:1.75, marginBottom:16, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                            {ex.description}
                          </p>
                        )}

                        {/* Méta données : tableau clé / valeur, propre et lisible */}
                        {(ex.experience || ex.localisation || ex.tarif) && (
                          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                            {ex.experience && (
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                <span style={{ fontSize:11.5, color:"#94A3B8", fontWeight:500 }}>Expérience</span>
                                <span style={{ fontSize:12, color:"#334155", fontWeight:600 }}>{ex.experience}</span>
                              </div>
                            )}
                            {ex.localisation && (
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                <span style={{ fontSize:11.5, color:"#94A3B8", fontWeight:500 }}>Localisation</span>
                                <span style={{ fontSize:12, color:"#334155", fontWeight:600 }}>{ex.localisation}</span>
                              </div>
                            )}
                            {ex.tarif && (
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                <span style={{ fontSize:11.5, color:"#94A3B8", fontWeight:500 }}>Tarif</span>
                                <span style={{ fontSize:12, color:"#0A2540", fontWeight:700 }}>{ex.tarif}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Créneaux disponibles */}
                        {dsp.length > 0 && (
                          <div style={{ marginBottom:16 }}>
                            <p style={{ fontSize:10, fontWeight:700, color:"#CBD5E1", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:7 }}>Prochains créneaux</p>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                              {dsp.slice(0, 3).map((d, idx) => (
                                <span key={idx} style={{ fontSize:11, background:"#F8FAFC", color:"#475569", padding:"4px 9px", borderRadius:5, fontWeight:500, border:"1px solid #E2E8F0" }}>
                                  {new Date(d.date).toLocaleDateString("fr-FR", { day:"numeric", month:"short" })} · {(d.heure || "").slice(0, 5)}
                                </span>
                              ))}
                              {dsp.length > 3 && (
                                <span style={{ fontSize:11, color:"#94A3B8", alignSelf:"center" }}>+{dsp.length - 3}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer de la carte : deux boutons textuels */}
                      <div style={{ padding:"14px 24px 22px", display:"flex", gap:8, marginTop:"auto" }}>
                        <button
                          onClick={() => setModal(true)}
                          style={{ flex:1, fontFamily:"inherit", fontSize:13, fontWeight:700, background:"#0A2540", color:"#fff", border:"none", borderRadius:9, padding:"11px 16px", cursor:"pointer", letterSpacing:.2, transition:"background .22s, color .22s" }}
                          onMouseEnter={e => { e.currentTarget.style.background="#F7B500"; e.currentTarget.style.color="#0A2540"; }}
                          onMouseLeave={e => { e.currentTarget.style.background="#0A2540"; e.currentTarget.style.color="#fff"; }}>
                          Voir le profil
                        </button>
                        <button
                          onClick={() => setModal(true)}
                          style={{ padding:"11px 18px", background:"transparent", border:"1.5px solid #E2E8F0", borderRadius:9, fontFamily:"inherit", fontSize:13, fontWeight:600, color:"#334155", cursor:"pointer", whiteSpace:"nowrap", transition:"border-color .22s, color .22s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor="#0A2540"; e.currentTarget.style.color="#0A2540"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor="#E2E8F0"; e.currentTarget.style.color="#334155"; }}>
                          Réserver
                        </button>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}

          <Reveal delay={.38}>
            <div style={{ textAlign:"center", marginTop:52 }}>
              <Link href="/experts" className="bg">Voir tous nos experts <FaArrowRight size={12} /></Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════ PARTENAIRES ════════════════ */}
      <section style={{ padding:"72px 0", background:"#FFFFFF", overflow:"hidden" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 28px", marginBottom:48 }}>
          <Reveal>
            <div style={{ textAlign:"center" }}>
              <h2 className="text-center font-bold text-5xl leading-tight mb-6 text-[#0A2540]">
                Nos <span className="text-[#F7B500]">Partenaires</span>
              </h2>
            </div>
          </Reveal>
        </div>

        {/* Ligne 1 — vers la gauche */}
        <div style={{ overflow:"hidden", position:"relative", marginBottom:32 }}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:120, background:"linear-gradient(90deg,#FFFFFF,transparent)", zIndex:10, pointerEvents:"none" }} />
          <div style={{ position:"absolute", right:0, top:0, bottom:0, width:120, background:"linear-gradient(270deg,#FFFFFF,transparent)", zIndex:10, pointerEvents:"none" }} />
          <div className="mL">
            {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
              <img key={`r1-${i}`} src={logo} alt={`Partner ${i % LOGOS.length + 1}`}
                style={{ height:62, width:"auto", maxWidth:170, objectFit:"contain", flexShrink:0, opacity:.7, transition:"opacity .3s,transform .3s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.opacity="1"; (e.currentTarget as HTMLImageElement).style.transform="scale(1.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.opacity=".7"; (e.currentTarget as HTMLImageElement).style.transform="scale(1)"; }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }}
              />
            ))}
          </div>
        </div>

        {/* Ligne 2 — vers la droite */}
        <div style={{ overflow:"hidden", position:"relative" }}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:120, background:"linear-gradient(90deg,#FFFFFF,transparent)", zIndex:10, pointerEvents:"none" }} />
          <div style={{ position:"absolute", right:0, top:0, bottom:0, width:120, background:"linear-gradient(270deg,#FFFFFF,transparent)", zIndex:10, pointerEvents:"none" }} />
          <div className="mR">
            {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
              <img key={`r2-${i}`} src={logo} alt={`Partner ${i % LOGOS.length + 1}`}
                style={{ height:62, width:"auto", maxWidth:170, objectFit:"contain", flexShrink:0, opacity:.7, transition:"opacity .3s,transform .3s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.opacity="1"; (e.currentTarget as HTMLImageElement).style.transform="scale(1.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.opacity=".7"; (e.currentTarget as HTMLImageElement).style.transform="scale(1)"; }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TÉMOIGNAGES ════════════════ */}
      <section style={{ padding:"100px 28px", background:"#FFFFFF" }}>
        <div style={{ maxWidth:900, margin:"0 auto", width:"100%" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              <span className="ey" style={{ justifyContent:"center", marginBottom:16 }}>Témoignages</span>
              <h2 className="text-center font-bold text-5xl leading-tight mb-6 text-[#0A2540]">
                Ce que disent nos <span className="text-[#F7B500]">clients</span>
              </h2>
            </div>
          </Reveal>

          {temoLoad && (
            <div style={{ textAlign:"center", padding:"60px 0" }}>
              <div style={{ width:42, height:42, border:"3px solid #F7B500", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto" }} />
            </div>
          )}

          {!temoLoad && temos.length === 0 && (
            <div style={{ background:"#0A2540", borderRadius:28, padding:"60px 40px", textAlign:"center", maxWidth:600, margin:"0 auto", border:"1px solid rgba(247,181,0,.2)" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>💬</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:700, color:"#fff", marginBottom:12 }}>Aucun témoignage pour l&apos;instant</div>
              <div style={{ fontSize:14, color:"rgba(255,255,255,.7)", lineHeight:1.7 }}>Les témoignages apparaîtront ici après validation.</div>
            </div>
          )}

          {!temoLoad && temos.length > 0 && tInfo && (
            <div style={{ width:"100%" }}>
              <Reveal delay={.14}>
                <div style={{ display:"flex", justifyContent:"center", width:"100%" }}>
                  <div style={{ background:"#0A2540", borderRadius:28, padding:"48px 56px", boxShadow:"0 20px 48px -12px rgba(0,0,0,.08)", position:"relative", border:"1px solid rgba(247,181,0,.2)", maxWidth:800, width:"100%", margin:"0 auto", opacity:tAnim?0:1, transform:tAnim?"scale(.97)":"scale(1)", transition:"all .3s ease" }}>
                    <FaQuoteLeft style={{ position:"absolute", top:32, left:40, fontSize:42, color:"rgba(247,181,0,.15)" }} />
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", color:"#fff", lineHeight:1.8, textAlign:"center", marginBottom:36, fontSize:"clamp(18px,2.2vw,24px)", fontWeight:500 }}>
                      &ldquo;{curTemo?.texte}&rdquo;
                    </p>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ width:64, height:64, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#0A2540", fontWeight:700, fontSize:20, margin:"0 auto 16px", background:"linear-gradient(135deg,#F7B500,#e6a800)", boxShadow:"0 8px 20px rgba(247,181,0,.3)" }}>
                        {tInfo.ini}
                      </div>
                      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, color:"#fff", fontSize:20, marginBottom:6 }}>{tInfo.full}</div>
                      <div style={{ color:"#F7B500", fontSize:13, fontWeight:600, letterSpacing:.8, textTransform:"uppercase" }}>{tInfo.sub}</div>
                    </div>
                  </div>
                </div>
              </Reveal>

              {temos.length > 1 && (
                <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:16, marginTop:40 }}>
                  <button onClick={() => goT((tIdx - 1 + temos.length) % temos.length)}
                    style={{ width:48, height:48, background:"#0A2540", color:"#fff", borderRadius:"50%", border:"1px solid rgba(247,181,0,.3)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background="#F7B500"; e.currentTarget.style.color="#0A2540"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="#0A2540"; e.currentTarget.style.color="#fff"; }}>
                    <FaChevronLeft />
                  </button>
                  <div style={{ display:"flex", justifyContent:"center", gap:10, alignItems:"center" }}>
                    {temos.map((_, i) => (
                      <button key={i} onClick={() => goT(i)}
                        style={{ height:8, borderRadius:99, border:"none", cursor:"pointer", padding:0, transition:"all .3s", width:i===tIdx?32:8, background:i===tIdx?"#F7B500":"rgba(10,37,64,.2)" }} />
                    ))}
                  </div>
                  <button onClick={() => goT((tIdx + 1) % temos.length)}
                    style={{ width:48, height:48, background:"#0A2540", color:"#fff", borderRadius:"50%", border:"1px solid rgba(247,181,0,.3)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background="#F7B500"; e.currentTarget.style.color="#0A2540"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="#0A2540"; e.currentTarget.style.color="#fff"; }}>
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════ NEWSLETTER ════════════════ */}
      <section style={{ padding:"88px 28px", background:"#FFFFFF" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          <Reveal>
            <div style={{ borderRadius:24, overflow:"hidden", background:"#FFF8E1", boxShadow:"0 24px 60px rgba(0,0,0,.08)", position:"relative", padding:"52px 48px", textAlign:"center" }}>
              <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(247,181,0,.08) 1px,transparent 1px)", backgroundSize:"36px 36px", pointerEvents:"none" }} />
              <div style={{ position:"relative", zIndex:10 }}>
                <div style={{ width:64, height:64, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, color:"#0A2540", background:"linear-gradient(135deg,#F7B500,#e6a800)", boxShadow:"0 8px 20px rgba(247,181,0,.28)", margin:"0 auto 24px" }}>
                  <FaEnvelope />
                </div>
                <span className="ey" style={{ justifyContent:"center", marginBottom:16 }}>Newsletter</span>
                <h2 style={{ fontSize:24, fontWeight:700, color:"#0A2540", marginBottom:16 }}>Restez <span style={{ color:"#F7B500" }}>informé</span></h2>
                <p style={{ color:"#64748B", fontSize:15, lineHeight:1.8, maxWidth:500, margin:"0 auto 32px" }}>
                  Recevez nos actualités et ressources exclusives pour accélérer la croissance de votre startup.
                </p>
                {sent ? (
                  <div style={{ maxWidth:450, margin:"0 auto", borderRadius:14, padding:"20px 24px", color:"#059669", fontSize:16, fontWeight:700, background:"#ECFDF5", border:"1px solid #A7F3D0", textAlign:"center" }}>
                    <FaCheck style={{ marginBottom:8, fontSize:22, display:"block", margin:"0 auto 8px" }} />
                    Vous êtes inscrit avec succès.
                  </div>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); if (mail) { setSent(true); setMail(""); } }}
                    style={{ maxWidth:450, margin:"0 auto", display:"flex", flexDirection:"column", gap:12 }}>
                    <input type="email" value={mail} onChange={e => setMail(e.target.value)}
                      placeholder="Votre adresse e-mail" required
                      style={{ width:"100%", padding:"16px 20px", border:"1.5px solid #0A2540", borderRadius:14, fontSize:14, outline:"none", transition:"all .2s", backgroundColor:"#FFFFFF", fontFamily:"'Outfit',sans-serif" }}
                      onFocus={e => { e.currentTarget.style.borderColor="#F7B500"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(247,181,0,.1)"; }}
                      onBlur={e  => { e.currentTarget.style.borderColor="#0A2540";  e.currentTarget.style.boxShadow="none"; }}
                    />
                    <button type="submit"
                      style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"16px", background:"#0A2540", color:"#F7B500", borderRadius:14, fontSize:14, fontWeight:600, cursor:"pointer", border:"none", fontFamily:"'Outfit',sans-serif", transition:"all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background="#F7B500"; e.currentTarget.style.color="#0A2540"; }}
                      onMouseLeave={e => { e.currentTarget.style.background="#0A2540"; e.currentTarget.style.color="#F7B500"; }}>
                      S&apos;inscrire <FaArrowRight size={12} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer style={{ background:"#05101E", color:"#fff", padding:"64px 28px 0" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr 1fr 1.2fr", gap:48, paddingBottom:52, borderBottom:"1px solid rgba(255,255,255,.06)" }}>

            {/* Col 1 */}
            <div>
              <Link href="/" style={{ display:"flex", alignItems:"center", gap:11, textDecoration:"none", marginBottom:20 }}>
                <svg width="36" height="36" viewBox="0 0 46 46" fill="none">
                  <rect width="46" height="46" rx="10" fill="#0A2540" />
                  <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900" fontFamily="Arial">BEH</text>
                </svg>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:16, color:"#fff" }}>
                  Business <em style={{ color:"#F7B500" }}>Expert</em> Hub
                </span>
              </Link>
              <p style={{ color:"rgba(255,255,255,.28)", fontSize:13.5, lineHeight:1.9, marginBottom:28, maxWidth:280 }}>
                Plateforme premium de mise en relation entre startups ambitieuses et experts certifiés.
              </p>
              <div>
                <div style={{ fontSize:10.5, fontWeight:700, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:"1.8px", marginBottom:14 }}>Réseaux sociaux</div>
                <div style={{ display:"flex", gap:10 }}>
                  {[
                    { Icon: FaFacebookF,  href:"https://facebook.com",  bg:"#1877F2",                                                                    label:"Facebook"  },
                    { Icon: FaInstagram,  href:"https://instagram.com", bg:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",             label:"Instagram" },
                    { Icon: FaLinkedinIn, href:"https://linkedin.com",  bg:"#0A66C2",                                                                    label:"LinkedIn"  },
                  ].map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                      className="sb" style={{ background:s.bg, color:"#fff" }}>
                      <s.Icon />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Col 2 — Navigation */}
            <div>
              <h4 style={{ color:"rgba(255,255,255,.4)", fontWeight:700, fontSize:10.5, textTransform:"uppercase", letterSpacing:"1.8px", marginBottom:20 }}>Navigation</h4>
              <ul style={{ listStyle:"none", padding:0, display:"flex", flexDirection:"column", gap:12 }}>
                {[["Accueil","/"],["À propos","/a-propos"],["Services","/services"],["Experts","/experts"],["Blog","/blog"],["Contact","/contact"]].map(([l,h]) => (
                  <li key={l}>
                    <Link href={h} style={{ color:"rgba(255,255,255,.32)", fontSize:14, textDecoration:"none", display:"flex", alignItems:"center", gap:8, transition:"color .2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color="#F7B500"}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color="rgba(255,255,255,.32)"}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background:"rgba(247,181,0,.4)", flexShrink:0 }} />{l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Services */}
            <div>
              <h4 style={{ color:"rgba(255,255,255,.4)", fontWeight:700, fontSize:10.5, textTransform:"uppercase", letterSpacing:"1.8px", marginBottom:20 }}>Services</h4>
              <ul style={{ listStyle:"none", padding:0, display:"flex", flexDirection:"column", gap:12 }}>
                {SERVICES.map(s => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} style={{ color:"rgba(255,255,255,.32)", fontSize:14, textDecoration:"none", display:"flex", alignItems:"center", gap:8, transition:"color .2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color="#F7B500"}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color="rgba(255,255,255,.32)"}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background:"rgba(247,181,0,.4)", flexShrink:0 }} />{s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Contact */}
            <div>
              <h4 style={{ color:"rgba(255,255,255,.4)", fontWeight:700, fontSize:10.5, textTransform:"uppercase", letterSpacing:"1.8px", marginBottom:20 }}>Contact</h4>
              <ul style={{ listStyle:"none", padding:0, display:"flex", flexDirection:"column", gap:16 }}>
                {[
                  { Icon: FaEnvelope,     text:"contact@beh.com", href:"mailto:contact@beh.com" },
                  { Icon: FaPhone,        text:"+216 00 000 000", href:"tel:+21600000000"       },
                  { Icon: FaMapMarkerAlt, text:"Tunis, Tunisie",  href:"#"                      },
                ].map((item, i) => (
                  <li key={i}>
                    <a href={item.href} style={{ color:"rgba(255,255,255,.32)", fontSize:13.5, textDecoration:"none", display:"flex", alignItems:"center", gap:12, transition:"color .2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color="#F7B500"}
                      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color="rgba(255,255,255,.32)"}>
                      <div style={{ width:34, height:34, borderRadius:9, background:"rgba(255,255,255,.06)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:13 }}>
                        <item.Icon />
                      </div>
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bas du footer */}
          <div style={{ padding:"22px 0 28px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <p style={{ margin:0, color:"rgba(255,255,255,.18)", fontSize:12.5 }}>© 2026 Business Expert Hub. Tous droits réservés.</p>
            <div style={{ display:"flex", gap:20 }}>
              {["Mentions légales","Confidentialité"].map(l => (
                <Link key={l} href="#" style={{ color:"rgba(255,255,255,.18)", fontSize:12.5, textDecoration:"none", transition:"color .2s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color="#F7B500"}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color="rgba(255,255,255,.18)"}>
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}