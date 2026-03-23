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
// TRADUCTIONS
// ════════════════════════════════════════════════════════
const T = {
  fr: {
    langLabel: "Français", flag: "🇫🇷",
    nav: {
      accueil: "Accueil", apropos: "À propos", services: "Services",
      experts: "Experts", blog: "Blog", contact: "Contact",
      connexion: "Connexion", inscrire: "S'inscrire"
    },
    hero: {
      badge: "Cabinet de consulting & conseil",
      h1a: "Propulsez votre", h1b: "startup", h1c: "vers l'excellence",
      sub: "Plateforme d'experts spécialisée dans l'accompagnement stratégique des startups et entreprises en croissance.",
      cta1: "Découvrir nos services", cta2: "Contactez-nous"
    },
    adn: {
      eyebrow: "Qui sommes-nous", h2a: "L'", h2b: "ADN", h2c: " de notre cabinet",
      more: "En savoir plus sur nous",
      items: [
        { title: "Notre Vision", body: "Devenir la référence absolue en accompagnement de startups innovantes, en connectant les meilleurs experts aux projets les plus ambitieux de demain.", btn: "En savoir plus" },
        { title: "Notre Mission", body: "Offrir aux startups un accès privilégié à des experts certifiés pour structurer leur stratégie, accélérer leur croissance et réussir leurs levées de fonds.", btn: "En savoir plus" },
        { title: "Nos Valeurs", body: "Excellence, transparence et engagement humain. Chaque accompagnement est unique et conçu pour maximiser l'impact durable de votre entreprise.", btn: "En savoir plus" }
      ]
    },
    experts: {
      eyebrow: "Notre équipe", h2a: "Nos ", h2b: "Experts", h2c: " certifiés",
      empty: "Aucun expert disponible pour le moment.",
      profil: "Voir le profil", tous: "Voir tous nos experts",
      dispo: "● Disponible", occupe: "● Occupé", creneaux: "Prochains créneaux"
    },
    partenaires: { h2a: "Nos ", h2b: "Partenaires" },
    temo: {
      eyebrow: "Témoignages", h2a: "Ce que disent nos ", h2b: "clients",
      empty: "Aucun témoignage pour l'instant",
      emptyDesc: "Les témoignages apparaîtront ici après validation."
    },
    nl: {
      eyebrow: "Newsletter", h2a: "Restez ", h2b: "informé",
      sub: "Recevez nos actualités et ressources exclusives pour accélérer la croissance de votre startup.",
      ph: "Votre adresse e-mail", btn: "S'abonner", ok: "Vous êtes inscrit avec succès."
    },
    modal: {
      title: "Accès réservé",
      sub: "Créez un compte gratuit ou connectez-vous pour accéder aux profils experts et réserver un rendez-vous.",
      b1: "Créer un compte", b2: "Se connecter"
    },
    footer: {
      desc: "Plateforme premium de mise en relation entre startups ambitieuses et experts certifiés.",
      colNav: "Navigation", colServ: "Services", colContact: "Contact", colSocial: "Réseaux sociaux",
      rights: "© 2026 Business Expert Hub. Tous droits réservés.",
      legal: "Mentions légales", privacy: "Confidentialité"
    },
    services: [
      { label: "Consulting", slug: "consulting" },
      { label: "Audit sur site", slug: "audit-sur-site" },
      { label: "Accompagnement", slug: "accompagnement" },
      { label: "Formations", slug: "formations" }
    ],
    popup: {
      badge: "Plateforme exclusive",
      title: "Rejoignez notre plateforme",
      subtitle: "Accédez à nos experts, services et opportunités exclusives",
      emailPh: "Votre adresse e-mail",
      passPh: "Créer un mot de passe",
      btnSignup: "Créer mon compte gratuitement",
      btnLogin: "J'ai déjà un compte — Se connecter",
      later: "Continuer en tant que visiteur",
      perks: ["Accès aux profils experts", "Réservation de rendez-vous", "Conseils stratégiques exclusifs"],
      terms: "En vous inscrivant, vous acceptez nos",
      termsLink: "conditions d'utilisation",
    },
  },
  en: {
    langLabel: "English", flag: "🇬🇧",
    nav: {
      accueil: "Home", apropos: "About", services: "Services",
      experts: "Experts", blog: "Blog", contact: "Contact",
      connexion: "Sign in", inscrire: "Get started"
    },
    hero: {
      badge: "Consulting & advisory firm",
      h1a: "Propel your", h1b: "startup", h1c: "to excellence",
      sub: "Expert platform specialized in the strategic support of startups and growing businesses.",
      cta1: "Discover our services", cta2: "Contact us"
    },
    adn: {
      eyebrow: "Who we are", h2a: "Our cabinet's ", h2b: "DNA", h2c: "",
      more: "Learn more about us",
      items: [
        { title: "Our Vision", body: "To become the absolute reference in supporting innovative startups, connecting the best experts with the most ambitious projects of tomorrow.", btn: "Learn more" },
        { title: "Our Mission", body: "To give startups privileged access to certified experts to structure their strategy, accelerate their growth and succeed in their fundraising.", btn: "Learn more" },
        { title: "Our Values", body: "Excellence, transparency and human commitment. Each support is unique and designed to maximize the lasting impact of your business.", btn: "Learn more" }
      ]
    },
    experts: {
      eyebrow: "Our team", h2a: "Our certified ", h2b: "Experts", h2c: "",
      empty: "No experts available at the moment.",
      profil: "View profile", tous: "View all experts",
      dispo: "● Available", occupe: "● Busy", creneaux: "Next slots"
    },
    partenaires: { h2a: "Our ", h2b: "Partners" },
    temo: {
      eyebrow: "Testimonials", h2a: "What our ", h2b: "clients say",
      empty: "No testimonials yet",
      emptyDesc: "Client testimonials will appear here after validation."
    },
    nl: {
      eyebrow: "Newsletter", h2a: "Stay ", h2b: "informed",
      sub: "Receive our exclusive news and resources to accelerate your startup's growth.",
      ph: "Your email address", btn: "Subscribe", ok: "You have been successfully subscribed."
    },
    modal: {
      title: "Access required",
      sub: "Create a free account or sign in to access expert profiles and book appointments.",
      b1: "Create an account", b2: "Sign in"
    },
    footer: {
      desc: "Premium platform connecting ambitious startups with certified experts.",
      colNav: "Navigation", colServ: "Services", colContact: "Contact", colSocial: "Follow us",
      rights: "© 2026 Business Expert Hub. All rights reserved.",
      legal: "Legal notice", privacy: "Privacy policy"
    },
    services: [
      { label: "Consulting", slug: "consulting" },
      { label: "On-site audit", slug: "audit-sur-site" },
      { label: "Coaching", slug: "accompagnement" },
      { label: "Training", slug: "formations" }
    ],
    popup: {
      badge: "Exclusive platform",
      title: "Join our platform",
      subtitle: "Access our experts, services and exclusive opportunities",
      emailPh: "Your email address",
      passPh: "Create a password",
      btnSignup: "Create my free account",
      btnLogin: "I already have an account — Sign in",
      later: "Continue as a visitor",
      perks: ["Access to expert profiles", "Appointment booking", "Exclusive strategic advice"],
      terms: "By signing up, you agree to our",
      termsLink: "terms of service",
    },
  },
} as const;

type Lang = "fr" | "en";

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
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); o.disconnect(); }
    }, { threshold: thr });
    o.observe(el);
    return () => o.disconnect();
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
    }}>
      {children}
    </div>
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
  const pr = t.user?.prenom || "";
  const nm = t.user?.nom || "";
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
const ADN_IMGS = ["/vision.png", "/mission.png", "/valeurs.png"];
const ADN_ANCHORS = ["vision", "mission", "valeurs"];
const LOGOS = [
  "/logos/partenaire1.png", "/logos/partenaire2.png", "/logos/partenaire3.png",
  "/logos/partenaire4.png", "/logos/partenaire5.png", "/logos/partenaire6.png",
  "/logos/partenaire7.png"
];

// ════════════════════════════════════════════════════════
// COMPOSANT POPUP INSCRIPTION
// ════════════════════════════════════════════════════════
function SignupPopup({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const tr = T[lang].popup;
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const passStrength = pass.length === 0 ? 0 : pass.length < 6 ? 1 : pass.length < 10 ? 2 : 3;
  const strColors = ["", "#EF4444", "#F59E0B", "#10B981"];
  const strLabels = ["", "Faible", "Moyen", "Fort"];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem("beh_popup_dismissed", "1");
    setStep("success");
    setTimeout(() => { window.location.href = "/inscription"; }, 1500);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,12,24,.82)", backdropFilter: "blur(12px)" }} onClick={onClose} />
      <div style={{
        position: "relative", zIndex: 10, width: "100%", maxWidth: 960, borderRadius: 28,
        overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr",
        boxShadow: "0 40px 120px rgba(0,0,0,.6)", animation: "popIn .4s cubic-bezier(.22,1,.36,1)"
      }}>
        {/* Panneau gauche */}
        <div style={{
          background: "linear-gradient(145deg,#0A2540 0%,#0f3564 50%,#1a4a80 100%)",
          padding: "52px 44px", display: "flex", flexDirection: "column",
          justifyContent: "space-between", position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(247,181,0,.07)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(247,181,0,.05)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)", backgroundSize: "36px 36px" }} />
          
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(247,181,0,.15)", border: "1px solid rgba(247,181,0,.3)", borderRadius: 99, padding: "5px 14px", marginBottom: 28 }}>
              <FaRocket size={10} style={{ color: "#F7B500" }} />
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", color: "#F7B500" }}>{tr.badge}</span>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,3vw,40px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: 14 }}>
              {tr.title}
            </h2>
            <p style={{ fontSize: 14.5, color: "rgba(255,255,255,.5)", lineHeight: 1.8, marginBottom: 36 }}>{tr.subtitle}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {tr.perks.map((perk, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(247,181,0,.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaCheck size={10} style={{ color: "#F7B500" }} />
                  </div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,.7)", fontWeight: 500 }}>{perk}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 10, marginTop: 40 }}>
            <svg width="32" height="32" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="10" fill="rgba(247,181,0,.15)" /><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="13" fontWeight="900" fontFamily="Arial">BEH</text></svg>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,.45)" }}>Business Expert Hub</span>
          </div>
        </div>

        {/* Panneau droit - Formulaire */}
        <div style={{ background: "#fff", padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {step === "success" ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#10B981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 28px rgba(16,185,129,.3)" }}>
                <FaCheck size={28} style={{ color: "#fff" }} />
              </div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#0A2540", marginBottom: 10 }}>
                {lang === "fr" ? "Bienvenue !" : "Welcome!"}
              </h3>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7 }}>
                {lang === "fr" ? "Redirection en cours..." : "Redirecting..."}
              </p>
              <div style={{ marginTop: 20, height: 3, borderRadius: 99, background: "#EEF2F7", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#10B981", animation: "progress 1.4s linear forwards", borderRadius: 99 }} />
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaUserPlus size={15} style={{ color: "#0A2540" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px" }}>
                      {lang === "fr" ? "Inscription gratuite" : "Free registration"}
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#0A2540", marginTop: 1 }}>
                      {lang === "fr" ? "Créer votre compte" : "Create your account"}
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>
                    {lang === "fr" ? "E-mail" : "Email"}
                  </label>
                  <div style={{ position: "relative" }}>
                    <FaEnvelope style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 13 }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={tr.emailPh} required
                      style={{ width: "100%", background: "#F8FAFC", border: "1.5px solid #E2EAF4", borderRadius: 11, padding: "12px 14px 12px 38px", fontSize: 14, outline: "none" }}
                      onFocus={e => e.currentTarget.style.borderColor = "#F7B500"}
                      onBlur={e => e.currentTarget.style.borderColor = "#E2EAF4"} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 6 }}>
                    {lang === "fr" ? "Mot de passe" : "Password"}
                  </label>
                  <div style={{ position: "relative" }}>
                    <FaLock style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 13 }} />
                    <input type={showPass ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder={tr.passPh} required
                      style={{ width: "100%", background: "#F8FAFC", border: "1.5px solid #E2EAF4", borderRadius: 11, padding: "12px 40px 12px 38px", fontSize: 14, outline: "none" }}
                      onFocus={e => e.currentTarget.style.borderColor = "#F7B500"}
                      onBlur={e => e.currentTarget.style.borderColor = "#E2EAF4"} />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                      {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  {pass.length > 0 && (
                    <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 3, borderRadius: 99, background: "#EEF2F7", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 99, background: strColors[passStrength], width: `${passStrength * 33}%`, transition: "width .3s" }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: strColors[passStrength] }}>{strLabels[passStrength]}</span>
                    </div>
                  )}
                </div>

                <button type="submit"
                  style={{ background: "linear-gradient(135deg,#0A2540,#163d72)", color: "#F7B500", border: "none", borderRadius: 11, padding: "14px", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .22s", marginTop: 4 }}>
                  <FaRocket size={13} />{tr.btnSignup}
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "#EEF2F7" }} />
                  <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>ou</span>
                  <div style={{ flex: 1, height: 1, background: "#EEF2F7" }} />
                </div>

                <Link href="/connexion">
                  <button type="button"
                    style={{ width: "100%", background: "transparent", color: "#334155", border: "1.5px solid #E2EAF4", borderRadius: 11, padding: "12px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    {tr.btnLogin}
                  </button>
                </Link>
              </form>

              <div style={{ marginTop: 16, textAlign: "center" }}>
                <p style={{ fontSize: 11.5, color: "#94A3B8", lineHeight: 1.7 }}>
                  {tr.terms} <Link href="#" style={{ color: "#F7B500", fontWeight: 600, textDecoration: "none" }}>{tr.termsLink}</Link>
                </p>
                <button onClick={onClose}
                  style={{ marginTop: 10, background: "none", border: "none", cursor: "pointer", fontSize: 12.5, color: "#B8C4D6", textDecoration: "underline" }}>
                  {tr.later}
                </button>
              </div>
            </>
          )}
          <button onClick={onClose}
            style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", fontSize: 18, color: "#CBD5E1", cursor: "pointer", zIndex: 20 }}>
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
  const [lang, setLang] = useState<Lang>("fr");
  const [langOpen, setLangOpen] = useState(false);
  const [servOpen, setServOpen] = useState(false);
  const [tIdx, setTIdx] = useState(0);
  const [tAnim, setTAnim] = useState(false);
  const [mail, setMail] = useState("");
  const [sent, setSent] = useState(false);
  const [modal, setModal] = useState(false);
  const [experts, setExperts] = useState<ExpertAPI[]>([]);
  const [dispos, setDispos] = useState<Record<number, Dispo[]>>({});
  const [loading, setLoading] = useState(true);
  const [temos, setTemos] = useState<TemoAPI[]>([]);
  const [temoLoad, setTemoLoad] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const popupShownRef = useRef(false);

  const tr = T[lang];

  // Popup logic
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("beh_popup_dismissed");
      if (dismissed) return;
    }

    const timer = setTimeout(() => {
      if (!popupShownRef.current) {
        popupShownRef.current = true;
        setShowPopup(true);
      }
    }, 8000);

    const handleScroll = () => {
      if (popupShownRef.current) return;
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      const pct = total > 0 ? scrolled / total : 0;
      if (pct >= 0.45) {
        popupShownRef.current = true;
        setShowPopup(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function closePopup() {
    localStorage.setItem("beh_popup_dismissed", "1");
    setShowPopup(false);
  }

  // Fetch data
  useEffect(() => {
    fetch("http://localhost:3001/experts")
      .then(r => r.ok ? r.json() : [])
      .then(async (d: ExpertAPI[]) => {
        if (Array.isArray(d) && d.length > 0) {
          const s = d.slice(0, 4);
          setExperts(s);
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

  useEffect(() => {
    fetch("http://localhost:3001/temoignages/publics")
      .then(r => r.ok ? r.json() : [])
      .then((d: TemoAPI[]) => {
        if (Array.isArray(d)) setTemos(d);
        setTemoLoad(false);
      }).catch(() => setTemoLoad(false));
  }, []);

  useEffect(() => {
    if (temos.length === 0) return;
    const t = setInterval(() => {
      if (!tAnim) setTIdx(p => (p + 1) % temos.length);
    }, 5500);
    return () => clearInterval(t);
  }, [temos.length, tAnim]);

  function goT(i: number) {
    if (tAnim || temos.length === 0) return;
    setTAnim(true);
    setTimeout(() => {
      setTIdx(i);
      setTAnim(false);
    }, 280);
  }

  const curTemo = temos[tIdx % Math.max(temos.length, 1)];
  const tInfo = curTemo ? getTemoInfo(curTemo) : null;

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", color: "#2D3748" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .st{font-family:'Cormorant Garamond',serif;font-weight:700;line-height:1.1;color:#0A2540;font-size:clamp(34px,4vw,58px);}
        .st em{font-style:italic;color:#F7B500;}
        .ey{display:inline-flex;align-items:center;gap:8px;font-size:10.5px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#F7B500;}
        .ey::before{content:'';display:block;width:24px;height:2px;background:#F7B500;border-radius:2px;}
        .bg{display:inline-flex;align-items:center;gap:8px;background:#F7B500;color:#0A2540;border:none;border-radius:10px;padding:13px 26px;font-size:14px;font-weight:800;cursor:pointer;transition:all .22s;text-decoration:none;}
        .bg:hover{background:#e6a800;transform:translateY(-3px);box-shadow:0 12px 32px rgba(247,181,0,.35);}
        .bd{display:inline-flex;align-items:center;gap:8px;background:#0A2540;color:#fff;border:none;border-radius:10px;padding:13px 26px;font-size:14px;font-weight:700;cursor:pointer;transition:all .22s;text-decoration:none;}
        .bd:hover{background:#F7B500;color:#0A2540;transform:translateY(-3px);}
        .bol{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.28);border-radius:10px;padding:13px 26px;font-size:14px;font-weight:600;cursor:pointer;transition:all .22s;text-decoration:none;}
        .bol:hover{border-color:#F7B500;color:#F7B500;transform:translateY(-3px);}
        .bno{border:2px solid #0A2540;color:#0A2540;background:transparent;padding:9px 22px;border-radius:9px;font-weight:700;font-size:13.5px;cursor:pointer;}
        .bno:hover{background:#F7B500;border-color:#F7B500;}
        .bns{background:#F7B500;color:#0A2540;border:none;padding:9px 22px;border-radius:9px;font-weight:800;font-size:13.5px;cursor:pointer;}
        .bns:hover{background:#e6a800;box-shadow:0 8px 20px rgba(247,181,0,.38);}
        .nl{color:#475569;text-decoration:none;font-size:14.5px;font-weight:500;transition:color .2s;}
        .nl:hover{color:#F7B500;}
        .di{display:block;padding:10px 18px;color:#334155;text-decoration:none;font-size:14px;font-weight:500;white-space:nowrap;}
        .di:hover{background:#FFFBEB;color:#F7B500;}
        .lt{display:inline-flex;align-items:center;gap:7px;background:#F8FAFC;border:1.5px solid #E2EAF4;border-radius:9px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;}
        .lt:hover,.lt.op{border-color:#0A2540;background:#0A2540;color:#F7B500;}
        .ld{position:absolute;top:calc(100% + 8px);right:0;background:#fff;border-radius:14px;padding:8px;min-width:170px;box-shadow:0 16px 48px rgba(10,37,64,.18);border:1px solid #E8EEF6;z-index:400;}
        .lo{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:9px;font-size:13.5px;font-weight:600;cursor:pointer;}
        .lo:hover{background:#FFFBEB;color:#F7B500;}
        .lo.ac{background:#F7F9FC;color:#0A2540;}
        .ac-card{background:#fff;border-radius:22px;overflow:hidden;border:1px solid rgba(10,37,64,.07);box-shadow:0 4px 24px rgba(10,37,64,.07);transition:transform .4s,box-shadow .4s;}
        .ac-card:hover{transform:translateY(-12px);box-shadow:0 36px 72px rgba(10,37,64,.15);border-color:rgba(247,181,0,.3);}
        .ec{background:#fff;border-radius:18px;border:1px solid rgba(10,37,64,.07);box-shadow:0 4px 20px rgba(10,37,64,.06);transition:transform .32s,box-shadow .32s;}
        .ec:hover{transform:translateY(-8px);box-shadow:0 24px 60px rgba(10,37,64,.13);border-color:rgba(247,181,0,.3);}
        .sb{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:15px;text-decoration:none;transition:all .22s;border:none;cursor:pointer;}
        .sb:hover{transform:translateY(-4px);box-shadow:0 10px 24px rgba(0,0,0,.25);}
        @keyframes marqueeLeft{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes marqueeRight{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
        @keyframes popIn{from{opacity:0;transform:scale(.94) translateY(24px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes progress{from{width:0}to{width:100%}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .hi{animation:hzoom 2.2s forwards;} @keyframes hzoom{0%{transform:scale(1.08)}100%{transform:scale(1)}}
        .hc>*{animation:hfi .9s both;} @keyframes hfi{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
        .hc>*:nth-child(1){animation-delay:.04s}.hc>*:nth-child(2){animation-delay:.16s}
        .hc>*:nth-child(3){animation-delay:.3s}.hc>*:nth-child(4){animation-delay:.46s}
      `}</style>

      {/* Popup inscription */}
      {showPopup && <SignupPopup lang={lang} onClose={closePopup} />}

      {/* Modal expert */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(6,14,26,.75)", backdropFilter: "blur(10px)" }} onClick={() => setModal(false)}>
          <div style={{ background: "#fff", borderRadius: 28, padding: "52px 44px", maxWidth: 440, width: "100%", textAlign: "center", position: "relative", boxShadow: "0 48px 120px rgba(10,37,64,.32)" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 22px", background: "linear-gradient(135deg,#F7B500,#e6a800)" }}><FaLock /></div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#0A2540", marginBottom: 12 }}>{tr.modal.title}</h2>
            <p style={{ color: "#64748B", fontSize: 14.5, lineHeight: 1.8, marginBottom: 28 }}>{tr.modal.sub}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/inscription" onClick={() => setModal(false)}><button style={{ width: "100%", background: "#0A2540", color: "#F7B500", border: "none", borderRadius: 11, padding: "14px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>{tr.modal.b1}</button></Link>
              <Link href="/connexion" onClick={() => setModal(false)}><button style={{ width: "100%", background: "transparent", color: "#0A2540", border: "1.5px solid #E2EAF4", borderRadius: 11, padding: "12px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>{tr.modal.b2}</button></Link>
            </div>
            <button onClick={() => setModal(false)} style={{ position: "absolute", top: 14, right: 18, background: "none", border: "none", fontSize: 22, color: "#CBD5E1", cursor: "pointer" }}>✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background: "#fff", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 0 #EEF2F7,0 4px 18px rgba(10,37,64,.05)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 28px", height: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0 }}>
            <svg width="40" height="40" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="11" fill="#0A2540" /><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900" fontFamily="Arial">BEH</text></svg>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 19, color: "#0A2540" }}>Business <em style={{ color: "#F7B500" }}>Expert</em> Hub</span>
          </Link>
          <nav style={{ display: "flex", gap: 20, alignItems: "center", flex: 1, justifyContent: "center" }}>
            <Link href="/" className="nl" style={{ color: "#F7B500", fontWeight: 700 }}>{tr.nav.accueil}</Link>
            <Link href="/a-propos" className="nl">{tr.nav.apropos}</Link>
            <div style={{ position: "relative" }} onMouseEnter={() => setServOpen(true)} onMouseLeave={() => setServOpen(false)}>
              <span className="nl" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>{tr.nav.services}<FaChevronDown size={9} /></span>
              {servOpen && (
                <ul style={{ position: "absolute", top: "calc(100% + 10px)", left: 0, background: "#fff", borderRadius: 14, listStyle: "none", padding: "8px", margin: 0, zIndex: 200, minWidth: 210, boxShadow: "0 16px 48px rgba(10,37,64,.14)", border: "1px solid #EEF2F7" }}>
                  {tr.services.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="di">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nl">{tr.nav.experts}</Link>
            <Link href="/blog" className="nl">{tr.nav.blog}</Link>
            <Link href="/contact" className="nl">{tr.nav.contact}</Link>
          </nav>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <div style={{ position: "relative" }} onMouseLeave={() => setLangOpen(false)}>
              <button className={`lt${langOpen ? " op" : ""}`} onClick={() => setLangOpen(!langOpen)}>
                <span style={{ fontSize: 17 }}>{T[lang].flag}</span>
                <span>{T[lang].langLabel}</span>
                <FaChevronDown size={9} style={{ transition: "transform .2s", transform: langOpen ? "rotate(180deg)" : "none" }} />
              </button>
              {langOpen && (
                <div className="ld">
                  {(["fr", "en"] as Lang[]).map(l => (
                    <div key={l} className={`lo${lang === l ? " ac" : ""}`} onClick={() => { setLang(l); setLangOpen(false); }}>
                      <span style={{ fontSize: 19 }}>{T[l].flag}</span>
                      <span style={{ flex: 1 }}>{T[l].langLabel}</span>
                      {lang === l && <span style={{ color: "#F7B500", fontSize: 13, fontWeight: 800 }}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link href="/connexion"><button className="bno">{tr.nav.connexion}</button></Link>
            <Link href="/inscription"><button className="bns">{tr.nav.inscrire}</button></Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ position: "relative", color: "#fff", overflow: "hidden", minHeight: 660 }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image src="/image.png" alt="Hero" fill priority className="hi" style={{ objectFit: "cover" }} sizes="100vw" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(108deg,rgba(6,14,26,.96) 0%,rgba(10,30,60,.8) 44%,rgba(10,37,64,.18) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.022) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        </div>
        <div className="hc" style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "130px 32px 150px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 28, background: "rgba(247,181,0,.1)", border: "1px solid rgba(247,181,0,.22)", borderRadius: 99, padding: "6px 16px 6px 10px" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F7B500", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase", color: "#F7B500" }}>{tr.hero.badge}</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, margin: "0 0 24px", lineHeight: 1.05, fontSize: "clamp(50px,7vw,88px)", maxWidth: 700 }}>
            {tr.hero.h1a} <em style={{ color: "#F7B500", fontStyle: "italic" }}>{tr.hero.h1b}</em><br />{tr.hero.h1c}
          </h1>
          <p style={{ fontSize: 16.5, color: "rgba(255,255,255,.7)", maxWidth: 500, lineHeight: 1.9, marginBottom: 44 }}>{tr.hero.sub}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link href="/services" className="bg">{tr.hero.cta1}<FaArrowRight size={12} /></Link>
            <Link href="/contact" className="bol">{tr.hero.cta2}<FaArrowRight size={12} /></Link>
          </div>
        </div>
      </section>

      {/* ADN Section */}
      <section style={{ padding: "110px 28px", overflow: "hidden", position: "relative", background: "#F8FAFC" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}><Image src="/image1.png" alt="bg" fill style={{ objectFit: "cover", opacity: .04 }} sizes="100vw" /></div>
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 72 }}>
              <span className="ey" style={{ marginBottom: 16, justifyContent: "center" }}>{tr.adn.eyebrow}</span>
              <h2 className="st" style={{ marginTop: 14 }}>{tr.adn.h2a}<em>{tr.adn.h2b}</em>{tr.adn.h2c}</h2>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {tr.adn.items.map((card, i) => (
              <Reveal key={i} delay={i * .13}>
                <div className="ac-card" style={{ height: "100%" }}>
                  <div style={{ position: "relative", overflow: "hidden", height: 220 }}>
                    <Image src={ADN_IMGS[i]} alt={card.title} fill className="ai" style={{ objectFit: "cover" }} sizes="400px" />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 25%,rgba(10,37,64,.68) 100%)" }} />
                    <div style={{ position: "absolute", bottom: 16, left: 20, right: 20 }}><h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>{card.title}</h3></div>
                  </div>
                  <div style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ width: 32, height: 3, borderRadius: 2, background: ADN_COLORS[i], marginBottom: 14 }} />
                    <p style={{ fontSize: 13.5, color: "#64748B", lineHeight: 1.85, flex: 1, marginBottom: 20 }}>{card.body}</p>
                    <Link href={`/a-propos#${ADN_ANCHORS[i]}`}>
                      <button style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13, padding: "9px 16px", borderRadius: 9, border: "none", cursor: "pointer", background: `${ADN_COLORS[i]}18`, color: ADN_COLORS[i] }}>{card.btn}<FaArrowRight size={10} /></button>
                    </Link>
                  </div>
                  <div style={{ height: 3, background: `linear-gradient(90deg,${ADN_COLORS[i]},${ADN_COLORS[i]}22)` }} />
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={.42}><div style={{ textAlign: "center", marginTop: 56 }}><Link href="/a-propos" className="bd">{tr.adn.more}<FaArrowRight size={12} /></Link></div></Reveal>
        </div>
      </section>

      {/* Experts Section */}
      <section style={{ padding: "100px 28px", position: "relative", overflow: "hidden", background: "#FFFFFF" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(0,0,0,.02) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
        <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 68 }}>
              <span className="ey" style={{ justifyContent: "center", marginBottom: 16 }}>{tr.experts.eyebrow}</span>
              <h2 className="st" style={{ marginTop: 14 }}>{tr.experts.h2a}<em>{tr.experts.h2b}</em>{tr.experts.h2c}</h2>
            </div>
          </Reveal>
          {loading ? (
            <div style={{ textAlign: "center", padding: "72px 0" }}><div style={{ width: 42, height: 42, border: "3px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} /></div>
          ) : experts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "72px 0", color: "#94A3B8", fontSize: 15 }}>{tr.experts.empty}</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(278px,1fr))", gap: 20 }}>
              {experts.map((ex, i) => {
                const name = getName(ex);
                const ini = getIni(ex);
                const dsp = dispos[ex.id] || [];
                return (
                  <Reveal key={ex.id} delay={i * .09}>
                    <div className="ec" style={{ height: "100%" }}>
                      <div style={{ padding: "18px 18px 0" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: ex.disponible ? "#ECFDF5" : "#F9FAFB", color: ex.disponible ? "#059669" : "#9CA3AF" }}>
                            {ex.disponible ? tr.experts.dispo : tr.experts.occupe}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 13, marginBottom: 13 }}>
                          <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 800, fontSize: 18, border: "2px solid rgba(247,181,0,.38)" }}>
                            {ex.photo ? <img src={`http://localhost:3001/uploads/photos/${ex.photo}`} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : ini}
                          </div>
                          <div>
                            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, color: "#0A2540", fontSize: 18, margin: "0 0 4px", lineHeight: 1.2 }}>{name}</h3>
                            <span style={{ display: "inline-block", background: "#EFF6FF", color: "#2563EB", borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 700 }}>{ex.domaine || "Expert"}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 11 }}>
                          {ex.experience && <span style={{ fontSize: 11, color: "#64748B", background: "#F7F9FC", border: "1px solid #E8EEF6", borderRadius: 6, padding: "3px 8px" }}>💼 {ex.experience}</span>}
                          {ex.localisation && <span style={{ fontSize: 11, color: "#64748B", background: "#F7F9FC", border: "1px solid #E8EEF6", borderRadius: 6, padding: "3px 8px" }}>📍 {ex.localisation}</span>}
                          {ex.tarif && <span style={{ fontSize: 11, color: "#B45309", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 6, padding: "3px 8px" }}>💰 {ex.tarif}</span>}
                        </div>
                        {ex.description && <p style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.7, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{ex.description}</p>}
                        {dsp.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{tr.experts.creneaux}</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {dsp.slice(0, 3).map((d, idx) => (
                                <span key={idx} style={{ fontSize: 10.5, background: "#EFF6FF", color: "#2563EB", padding: "3px 7px", borderRadius: 5, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 3 }}>
                                  <FaCalendarAlt size={8} />{new Date(d.date).toLocaleDateString(lang === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "short" })} {(d.heure || "").slice(0, 5)}
                                </span>
                              ))}
                              {dsp.length > 3 && <span style={{ fontSize: 10.5, color: "#9CA3AF", alignSelf: "center" }}>+{dsp.length - 3}</span>}
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "11px 18px 18px", borderTop: "1px solid #F1F5F9", marginTop: "auto", display: "flex", gap: 7 }}>
                        <button onClick={() => setModal(true)} style={{ flex: 1, fontSize: 12.5, fontWeight: 700, background: "#0A2540", color: "#fff", border: "none", borderRadius: 9, padding: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                          {tr.experts.profil}<FaArrowRight size={10} />
                        </button>
                        <button onClick={() => setModal(true)} style={{ width: 40, height: 40, background: "#F7F9FC", border: "1px solid #E8EEF6", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }}>
                          <FaCalendarAlt size={13} />
                        </button>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
          <Reveal delay={.38}><div style={{ textAlign: "center", marginTop: 52 }}><Link href="/experts" className="bg">{tr.experts.tous}<FaArrowRight size={12} /></Link></div></Reveal>
        </div>
      </section>
{/* Partenaires Section */}
      <section style={{ padding: "72px 0", background: "#FFFFFF", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", marginBottom: 48 }}>
          <Reveal><div style={{ textAlign: "center" }}><h2 className="st" style={{ color: "#0A2540" }}>{tr.partenaires.h2a}<em style={{ color: "#F7B500" }}>{tr.partenaires.h2b}</em></h2></div></Reveal>
        </div>
        
        <div style={{ overflow: "hidden", position: "relative", marginBottom: 32 }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(90deg,#FFFFFF,transparent)", zIndex: 10 }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(270deg,#FFFFFF,transparent)", zIndex: 10 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 64, width: "max-content", animation: "marqueeLeft 25s linear infinite" }}>
            {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
              <img key={`row1-${i}`} src={logo} alt={`Partner ${i % LOGOS.length + 1}`}
                style={{ height: 62, width: "auto", maxWidth: 170, objectFit: "contain", flexShrink: 0, opacity: .7, transition: "opacity .3s,transform .3s" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = ".7"; e.currentTarget.style.transform = "scale(1)"; }} />
            ))}
          </div>
        </div>

        <div style={{ overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(90deg,#FFFFFF,transparent)", zIndex: 10 }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 120, background: "linear-gradient(270deg,#FFFFFF,transparent)", zIndex: 10 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 64, width: "max-content", animation: "marqueeRight 25s linear infinite" }}>
            {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
              <img key={`row2-${i}`} src={logo} alt={`Partner ${i % LOGOS.length + 1}`}
                style={{ height: 62, width: "auto", maxWidth: 170, objectFit: "contain", flexShrink: 0, opacity: .7, transition: "opacity .3s,transform .3s" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = ".7"; e.currentTarget.style.transform = "scale(1)"; }} />
            ))}
          </div>
        </div>
      </section>

    {/* ════════════════ TÉMOIGNAGES ════════════════ */}
      <section style={{ padding: "100px 28px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <span className="ey" style={{ justifyContent: "center", marginBottom: 16 }}>{tr.temo.eyebrow}</span>
              <h2 className="st" style={{ marginTop: 14, color: "#0A2540" }}>{tr.temo.h2a}<em style={{ color: "#F7B500" }}>{tr.temo.h2b}</em></h2>
            </div>
          </Reveal>

          {temoLoad && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: 42, height: 42, border: "3px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} />
            </div>
          )}

          {!temoLoad && temos.length === 0 && (
            <div style={{ 
              background: "#0A2540", 
              borderRadius: 28, 
              padding: "60px 40px", 
              textAlign: "center", 
              boxShadow: "0 8px 24px rgba(0,0,0,.04)", 
              border: "1px solid rgba(247,181,0,.2)",
              maxWidth: "600px",
              margin: "0 auto"
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{tr.temo.empty}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1.7 }}>{tr.temo.emptyDesc}</div>
            </div>
          )}

          {!temoLoad && temos.length > 0 && tInfo && (
            <div style={{ width: "100%" }}>
              <Reveal delay={0.14}>
                <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                  <div
                    style={{
                      background: "#0A2540",
                      borderRadius: 28,
                      padding: "48px 56px",
                      boxShadow: "0 20px 48px -12px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      position: "relative",
                      border: "1px solid rgba(247,181,0,.2)",
                      maxWidth: "800px",
                      width: "100%",
                      margin: "0 auto",
                      opacity: tAnim ? 0 : 1,
                      transform: tAnim ? "scale(0.97)" : "scale(1)"
                    }}
                  >
                    <FaQuoteLeft style={{ position: "absolute", top: 32, left: 40, fontSize: 42, color: "rgba(247,181,0,.15)" }} />
                    
                    <p style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontStyle: "italic",
                      color: "#fff",
                      lineHeight: 1.8,
                      textAlign: "center",
                      marginBottom: 36,
                      fontSize: "clamp(18px, 2.2vw, 24px)",
                      fontWeight: 500
                    }}>
                      &ldquo;{curTemo?.texte}&rdquo;
                    </p>
                    
                    <div style={{ textAlign: "center" }}>
                      <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#0A2540",
                        fontWeight: 700,
                        fontSize: 20,
                        margin: "0 auto 16px",
                        background: "linear-gradient(135deg, #F7B500, #e6a800)",
                        boxShadow: "0 8px 20px rgba(247,181,0,0.3)"
                      }}>
                        {tInfo.ini}
                      </div>
                      <div style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontWeight: 700,
                        color: "#fff",
                        fontSize: 20,
                        marginBottom: 6
                      }}>
                        {tInfo.full}
                      </div>
                      <div style={{
                        color: "#F7B500",
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: 0.8,
                        textTransform: "uppercase"
                      }}>
                        {tInfo.sub}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
              
              {temos.length > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "40px" }}>
                  <button 
                    style={{
                      width: 48,
                      height: 48,
                      background: "#0A2540",
                      color: "#fff",
                      borderRadius: "50%",
                      border: "1px solid rgba(247,181,0,.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onClick={() => goT((tIdx - 1 + temos.length) % temos.length)}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#F7B500";
                      e.currentTarget.style.color = "#0A2540";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#0A2540";
                      e.currentTarget.style.color = "#fff";
                    }}
                  >
                    <FaChevronLeft />
                  </button>
                  
                  <div style={{ display: "flex", justifyContent: "center", gap: "10px", alignItems: "center" }}>
                    {temos.map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => goT(i)} 
                        style={{
                          height: 8,
                          borderRadius: 99,
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          transition: "all 0.3s",
                          width: i === tIdx ? 32 : 8,
                          background: i === tIdx ? "#F7B500" : "rgba(255,255,255,0.3)"
                        }}
                      />
                    ))}
                  </div>
                  
                  <button 
                    style={{
                      width: 48,
                      height: 48,
                      background: "#0A2540",
                      color: "#fff",
                      borderRadius: "50%",
                      border: "1px solid rgba(247,181,0,.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onClick={() => goT((tIdx + 1) % temos.length)}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#F7B500";
                      e.currentTarget.style.color = "#0A2540";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#0A2540";
                      e.currentTarget.style.color = "#fff";
                    }}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      {/* Newsletter Section */}
      <section style={{ padding: "88px 28px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Reveal>
            <div style={{ borderRadius: 24, overflow: "hidden", background: "#FFF8E1", boxShadow: "0 24px 60px rgba(0,0,0,.08)", position: "relative", padding: "52px 48px", textAlign: "center" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(247,181,0,.08) 1px,transparent 1px)", backgroundSize: "36px 36px" }} />
              <div style={{ position: "relative", zIndex: 10 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#0A2540", background: "linear-gradient(135deg,#F7B500,#e6a800)", boxShadow: "0 8px 20px rgba(247,181,0,.28)", margin: "0 auto 24px" }}>
                  <FaEnvelope />
                </div>
                <span className="ey" style={{ marginBottom: 16, justifyContent: "center" }}>{tr.nl.eyebrow}</span>
                <h2 className="st" style={{ fontSize: "clamp(30px,4vw,44px)", marginTop: 12, marginBottom: 16, color: "#0A2540" }}>
                  {tr.nl.h2a}<em style={{ color: "#F7B500" }}>{tr.nl.h2b}</em>
                </h2>
                <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.8, maxWidth: 500, margin: "0 auto 32px" }}>{tr.nl.sub}</p>
                {sent ? (
                  <div style={{ maxWidth: 450, margin: "0 auto", borderRadius: 14, padding: "20px 24px", color: "#059669", fontSize: 16, fontWeight: 700, background: "#ECFDF5", border: "1px solid #A7F3D0", textAlign: "center" }}>
                    <FaCheck style={{ marginBottom: 8, fontSize: 22 }} /><br />{tr.nl.ok}
                  </div>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); if (mail) { setSent(true); setMail(""); } }} style={{ maxWidth: 450, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
                    <input type="email" value={mail} onChange={e => setMail(e.target.value)} placeholder={tr.nl.ph} required
                      style={{ width: "100%", padding: "16px 20px", border: "1.5px solid #0A2540", borderRadius: 14, fontSize: 14, outline: "none", transition: "all .2s", backgroundColor: "#FFFFFF" }}
                      onFocus={e => { e.currentTarget.style.borderColor = "#F7B500"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(247,181,0,0.1)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "#0A2540"; e.currentTarget.style.boxShadow = "none"; }} />
                    <button type="submit" style={{ justifyContent: "center", padding: "16px", background: "#0A2540", color: "#F7B500", borderRadius: 14, fontSize: 14, fontWeight: 600, transition: "all 0.2s" }}>
                      S'inscrire <FaArrowRight size={12} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#05101E", color: "#fff", padding: "64px 28px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1.2fr", gap: 48, paddingBottom: 52, borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            <div>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", marginBottom: 20 }}>
                <svg width="36" height="36" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="10" fill="#0A2540" /><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900" fontFamily="Arial">BEH</text></svg>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>Business <em style={{ color: "#F7B500" }}>Expert</em> Hub</span>
              </Link>
              <p style={{ color: "rgba(255,255,255,.28)", fontSize: 13.5, lineHeight: 1.9, marginBottom: 28, maxWidth: 280 }}>{tr.footer.desc}</p>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,.3)", textTransform: "uppercase", letterSpacing: "1.8px", marginBottom: 14 }}>{tr.footer.colSocial}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { Icon: FaFacebookF, href: "https://facebook.com", bg: "#1877F2", label: "Facebook" },
                    { Icon: FaInstagram, href: "https://instagram.com", bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", label: "Instagram" },
                    { Icon: FaLinkedinIn, href: "https://linkedin.com", bg: "#0A66C2", label: "LinkedIn" },
                  ].map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label} className="sb" style={{ background: s.bg, color: "#fff" }}><s.Icon /></a>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h4 style={{ color: "rgba(255,255,255,.4)", fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "1.8px", marginBottom: 20 }}>{tr.footer.colNav}</h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {[[tr.nav.accueil, "/"], [tr.nav.apropos, "/a-propos"], [tr.nav.services, "/services"], [tr.nav.experts, "/experts"], [tr.nav.blog, "/blog"], [tr.nav.contact, "/contact"]].map(([l, h]) => (
                  <li key={l}><Link href={h} style={{ color: "rgba(255,255,255,.32)", fontSize: 14, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(247,181,0,.4)" }} />{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: "rgba(255,255,255,.4)", fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "1.8px", marginBottom: 20 }}>{tr.footer.colServ}</h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {tr.services.map(s => (
                  <li key={s.slug}><Link href={`/services/${s.slug}`} style={{ color: "rgba(255,255,255,.32)", fontSize: 14, textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(247,181,0,.4)" }} />{s.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ color: "rgba(255,255,255,.4)", fontWeight: 700, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "1.8px", marginBottom: 20 }}>{tr.footer.colContact}</h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { Icon: FaEnvelope, text: "contact@beh.com", href: "mailto:contact@beh.com" },
                  { Icon: FaPhone, text: "+216 00 000 000", href: "tel:+21600000000" },
                  { Icon: FaMapMarkerAlt, text: "Tunis, Tunisie", href: "#" },
                ].map((item, i) => (
                  <li key={i}><a href={item.href} style={{ color: "rgba(255,255,255,.32)", fontSize: 13.5, textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}><item.Icon /></div>{item.text}
                  </a></li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ padding: "22px 0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ margin: 0, color: "rgba(255,255,255,.18)", fontSize: 12.5 }}>{tr.footer.rights}</p>
            <div style={{ display: "flex", gap: 20 }}>
              {[tr.footer.legal, tr.footer.privacy].map(l => (
                <Link key={l} href="#" style={{ color: "rgba(255,255,255,.18)", fontSize: 12.5, textDecoration: "none" }}>{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}