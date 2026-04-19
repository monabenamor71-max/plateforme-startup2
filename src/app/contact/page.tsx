"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock,
  FaChevronDown, FaGlobe, FaCheck, FaPaperPlane,
  FaCheckCircle, FaUser, FaBuilding, FaComment,
  FaArrowRight, // ← AJOUTÉ (manquant)
} from "react-icons/fa";

// ==================== TRADUCTIONS ====================

type Lang = "fr" | "en";

const T: Record<Lang, Record<string, string>> = {
  fr: {
    // Header
    nav_home: "Accueil",
    nav_about: "À propos",
    nav_services: "Services",
    nav_experts: "Experts",
    nav_blog: "Blog",
    nav_contact: "Contact",
    btn_login: "Connexion",
    btn_signup: "S'inscrire",
    // Hero
    hero_title: "Contactez-nous",
    hero_desc: "Une question ? Un projet ? Notre équipe est à votre écoute pour vous accompagner.",
    // Contact form
    form_title: "Envoyez-nous un message",
    form_name: "Nom complet",
    form_name_placeholder: "Jean Dupont",
    form_email: "Adresse e-mail",
    form_email_placeholder: "jean.dupont@exemple.com",
    form_company: "Entreprise / Startup",
    form_company_placeholder: "Nom de votre structure",
    form_message: "Message",
    form_message_placeholder: "Décrivez votre projet ou votre demande...",
    form_subject: "Sujet",
    subject_options: [
      "Demande d'information",
      "Devenir expert",
      "Accompagnement startup",
      "Partenariat",
      "Autre",
    ],
    form_btn_send: "Envoyer le message",
    form_sending: "Envoi en cours...",
    form_success: "Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.",
    form_error: "Une erreur est survenue. Veuillez réessayer.",
    // Contact info
    info_title: "Informations de contact",
    info_email: "contact@beh.com",
    info_phone: "+216 00 000 000",
    info_address: "Tunis, Tunisie",
    info_hours: "Lun - Ven : 9h00 - 18h00",
    // CTA
    cta_title: "Vous êtes expert ou startup ?",
    cta_desc: "Rejoignez notre écosystème et bénéficiez d'un accompagnement sur mesure.",
    cta_btn_expert: "Devenir expert",
    cta_btn_startup: "Inscrire ma startup",
    // Footer
    footer_desc: "Plateforme de mise en relation entre startups ambitieuses et experts certifiés.",
    footer_nav: "Navigation",
    footer_services: "Services",
    footer_about: "À propos",
    footer_legal: "Mentions légales",
    footer_privacy: "Confidentialité",
    footer_cgu: "CGU",
    footer_copy: "© 2026 Business Expert Hub · Tous droits réservés",
  },
  en: {
    // Header
    nav_home: "Home",
    nav_about: "About",
    nav_services: "Services",
    nav_experts: "Experts",
    nav_blog: "Blog",
    nav_contact: "Contact",
    btn_login: "Login",
    btn_signup: "Sign up",
    // Hero
    hero_title: "Contact us",
    hero_desc: "A question? A project? Our team is here to listen and support you.",
    // Contact form
    form_title: "Send us a message",
    form_name: "Full name",
    form_name_placeholder: "John Doe",
    form_email: "Email address",
    form_email_placeholder: "john.doe@example.com",
    form_company: "Company / Startup",
    form_company_placeholder: "Your organization name",
    form_message: "Message",
    form_message_placeholder: "Describe your project or request...",
    form_subject: "Subject",
    subject_options: [
      "Information request",
      "Become an expert",
      "Startup support",
      "Partnership",
      "Other",
    ],
    form_btn_send: "Send message",
    form_sending: "Sending...",
    form_success: "Message sent successfully! We will get back to you shortly.",
    form_error: "An error occurred. Please try again.",
    // Contact info
    info_title: "Contact information",
    info_email: "contact@beh.com",
    info_phone: "+216 00 000 000",
    info_address: "Tunis, Tunisia",
    info_hours: "Mon - Fri: 9:00 AM - 6:00 PM",
    // CTA
    cta_title: "Are you an expert or a startup?",
    cta_desc: "Join our ecosystem and benefit from personalized support.",
    cta_btn_expert: "Become an expert",
    cta_btn_startup: "Register my startup",
    // Footer
    footer_desc: "Matching platform connecting ambitious startups with certified experts.",
    footer_nav: "Navigation",
    footer_services: "Services",
    footer_about: "About",
    footer_legal: "Legal notice",
    footer_privacy: "Privacy policy",
    footer_cgu: "Terms of use",
    footer_copy: "© 2026 Business Expert Hub · All rights reserved",
  },
};

// ==================== SÉLECTEUR DE LANGUE ====================

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const LANGS: { code: Lang; label: string; short: string }[] = [
    { code: "fr", label: "Français", short: "FR" },
    { code: "en", label: "English", short: "EN" },
  ];

  function select(code: Lang) {
    setLang(code);
    setOpen(false);
    if (typeof window !== "undefined") localStorage.setItem("beh_lang", code);
  }

  const current = LANGS.find(l => l.code === lang)!;

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "transparent",
          border: "none",
          padding: "6px 8px",
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13.5, fontWeight: 600,
          color: "#374151",
          borderRadius: 8,
          transition: "color .18s, background .18s",
          outline: "none",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "#0A2540"; e.currentTarget.style.background = "#F3F4F6"; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "transparent"; } }}
      >
        <FaGlobe size={15} style={{ color: "#6B7280", flexShrink: 0 }} />
        <span style={{ letterSpacing: ".3px" }}>{current.short}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#fff", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(10,37,64,.13)",
          border: "1px solid #E5E7EB",
          overflow: "hidden", minWidth: 140, zIndex: 400,
          animation: "langDrop .15s cubic-bezier(.22,1,.36,1)",
        }}>
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => select(l.code)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px",
                background: l.code === lang ? "#F9FAFB" : "transparent",
                border: "none", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13.5,
                fontWeight: l.code === lang ? 700 : 500,
                color: l.code === lang ? "#0A2540" : "#6B7280",
                transition: "background .12s, color .12s",
                textAlign: "left",
              }}
              onMouseEnter={e => { if (l.code !== lang) { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#374151"; } }}
              onMouseLeave={e => { if (l.code !== lang) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6B7280"; } }}
            >
              <FaGlobe size={13} style={{ color: l.code === lang ? "#F7B500" : "#9CA3AF", flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{l.label}</span>
              {l.code === lang && (
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaCheck size={7} style={{ color: "#F7B500" }} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== CONSTANTES ====================

const SERVICES = [
  { label: "Consulting", slug: "consulting" },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Accompagnement", slug: "accompagnement" },
  { label: "Formations", slug: "formations" },
];

export default function ContactPage() {
  const [lang, setLang] = useState<Lang>("fr");
  const [navOpen, setNavOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "Demande d'information",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("beh_lang") as Lang | null;
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);

  const tr = T[lang];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const response = await fetch("http://localhost:3001/contact/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", company: "", subject: "Demande d'information", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 4000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #F7B500; color: #0A2540; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes langDrop { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

        .nav-l { color: #374151; text-decoration: none; font-size: 14px; font-weight: 500; transition: color .18s; }
        .nav-l:hover { color: #F7B500; }
        .nav-l.act { color: #0A2540; font-weight: 700; }
        .drp-i { display: block; padding: 9px 16px; color: #374151; text-decoration: none; font-size: 13.5px; font-weight: 500; transition: background .12s, color .12s; }
        .drp-i:hover { background: #FFFBEB; color: #F7B500; }

        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #374151;
          outline: none;
          transition: border-color .18s, box-shadow .18s;
          background: #fff;
        }
        .form-input:focus, .form-textarea:focus, .form-select:focus {
          border-color: #0A2540;
          box-shadow: 0 0 0 3px rgba(10,37,64,.07);
        }
        .form-textarea { resize: vertical; min-height: 120px; }

        .info-card {
          background: #fff;
          border-radius: 20px;
          padding: 20px;
          border: 1px solid #E5E7EB;
          transition: transform .28s, box-shadow .28s;
        }
        .info-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(10,37,64,.08);
          border-color: rgba(247,181,0,.3);
        }

        .btn-primary {
          background: #0A2540;
          color: #F7B500;
          border: none;
          border-radius: 12px;
          padding: 14px 24px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: all .22s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary:hover {
          background: #F7B500;
          color: #0A2540;
          transform: translateY(-2px);
        }
        .btn-outline {
          background: transparent;
          border: 2px solid #0A2540;
          color: #0A2540;
          border-radius: 12px;
          padding: 12px 24px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all .22s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-outline:hover {
          background: #F7B500;
          border-color: #F7B500;
          transform: translateY(-2px);
        }
      `}</style>

      {/* HEADER */}
      <header style={{ background: "#fff", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #F1F5F9", boxShadow: "0 1px 0 #EEF2F7,0 4px 16px rgba(10,37,64,.05)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 28px", height: 74, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, background: "#0A2540", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial,sans-serif", fontWeight: 900, fontSize: 13, color: "#F7B500" }}>BEH</div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 17, color: "#0A2540" }}>Business <span style={{ color: "#F7B500" }}>Expert</span> Hub</span>
          </Link>
          <nav style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <Link href="/" className="nav-l">{tr.nav_home}</Link>
            <Link href="/a-propos" className="nav-l">{tr.nav_about}</Link>
            <div style={{ position: "relative" }} onMouseEnter={() => setNavOpen(true)} onMouseLeave={() => setNavOpen(false)}>
              <span className="nav-l" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>{tr.nav_services} <FaChevronDown size={9} /></span>
              {navOpen && (
                <ul style={{ position: "absolute", top: "calc(100% + 10px)", left: 0, background: "#fff", borderRadius: 14, listStyle: "none", padding: "6px", margin: 0, zIndex: 200, minWidth: 200, boxShadow: "0 12px 44px rgba(10,37,64,.12)", border: "1px solid #F1F5F9" }}>
                  {SERVICES.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="drp-i">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nav-l">{tr.nav_experts}</Link>
            <Link href="/blog" className="nav-l">{tr.nav_blog}</Link>
            <Link href="/contact" className="nav-l act">{tr.nav_contact}</Link>
          </nav>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <LangSwitcher lang={lang} setLang={setLang} />
            <div style={{ width: 1, height: 24, background: "#E5E7EB", margin: "0 4px" }} />
            <Link href="/connexion" style={{ padding: "9px 20px", border: "1.5px solid rgba(10,37,64,.18)", borderRadius: 9, color: "#0A2540", fontWeight: 600, fontSize: 13.5, textDecoration: "none", transition: "all .18s", fontFamily: "'DM Sans',sans-serif" }}>{tr.btn_login}</Link>
            <Link href="/inscription" style={{ padding: "9px 20px", background: "#F7B500", borderRadius: 9, color: "#0A2540", fontWeight: 800, fontSize: 13.5, textDecoration: "none", transition: "all .18s", fontFamily: "'DM Sans',sans-serif" }}>{tr.btn_signup}</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ position: "relative", background: "#0A2540", overflow: "hidden", minHeight: 220 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1400&q=80')", backgroundSize: "cover", backgroundPosition: "center", opacity: .18 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(10,37,64,.95) 0%,rgba(10,37,64,.8) 100%)" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 28px 56px", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, opacity: .7 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.45)", textDecoration: "none", fontSize: 12.5 }}>{tr.nav_home}</Link>
            <span style={{ color: "rgba(255,255,255,.25)" }}>›</span>
            <span style={{ color: "#F7B500", fontSize: 12.5, fontWeight: 600 }}>{tr.nav_contact}</span>
          </div>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(32px,4.5vw,48px)", fontWeight: 800, color: "#F7B500", lineHeight: 1.2, marginBottom: 12 }}>
            {tr.hero_title}
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.65)", maxWidth: 520, lineHeight: 1.75 }}>
            {tr.hero_desc}
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 28px 80px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 48 }}>
        
        {/* FORMULAIRE */}
        <div>
          <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E5E7EB", padding: "32px 36px", boxShadow: "0 4px 20px rgba(10,37,64,.04)" }}>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 800, color: "#0A2540", marginBottom: 8 }}>{tr.form_title}</h2>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 28 }}>Remplissez le formulaire ci-dessous, nous vous répondrons sous 48h.</p>

            {status === "success" && (
              <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 12, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10, color: "#059669" }}>
                <FaCheckCircle size={18} /> {tr.form_success}
              </div>
            )}
            {status === "error" && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10, color: "#DC2626" }}>
                ⚠️ {tr.form_error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>{tr.form_name} *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input" placeholder={tr.form_name_placeholder} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>{tr.form_email} *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="form-input" placeholder={tr.form_email_placeholder} />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>{tr.form_company}</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className="form-input" placeholder={tr.form_company_placeholder} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>{tr.form_subject}</label>
                <select name="subject" value={formData.subject} onChange={handleChange} className="form-select">
                  {tr.subject_options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>{tr.form_message} *</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required className="form-textarea" placeholder={tr.form_message_placeholder} />
              </div>
              <button type="submit" disabled={status === "sending"} className="btn-primary" style={{ width: "100%", justifyContent: "center", opacity: status === "sending" ? 0.7 : 1 }}>
                {status === "sending" ? tr.form_sending : <><FaPaperPlane /> {tr.form_btn_send}</>}
              </button>
            </form>
          </div>
        </div>

        {/* SIDEBAR INFOS */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="info-card">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(247,181,0,.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 22, color: "#F7B500" }}>
              <FaEnvelope />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0A2540", marginBottom: 8 }}>Email</h3>
            <a href="mailto:contact@beh.com" style={{ color: "#6B7280", textDecoration: "none", fontSize: 14, transition: "color .2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#F7B500")} onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>
              {tr.info_email}
            </a>
          </div>

          <div className="info-card">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(247,181,0,.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 22, color: "#F7B500" }}>
              <FaPhone />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0A2540", marginBottom: 8 }}>Téléphone</h3>
            <a href="tel:+21600000000" style={{ color: "#6B7280", textDecoration: "none", fontSize: 14, transition: "color .2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#F7B500")} onMouseLeave={e => (e.currentTarget.style.color = "#6B7280")}>
              {tr.info_phone}
            </a>
          </div>

          <div className="info-card">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(247,181,0,.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 22, color: "#F7B500" }}>
              <FaMapMarkerAlt />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0A2540", marginBottom: 8 }}>Adresse</h3>
            <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>{tr.info_address}</p>
          </div>

          <div className="info-card">
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(247,181,0,.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 22, color: "#F7B500" }}>
              <FaClock />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0A2540", marginBottom: 8 }}>Horaires</h3>
            <p style={{ color: "#6B7280", fontSize: 14, margin: 0 }}>{tr.info_hours}</p>
          </div>
        </aside>
      </main>

      {/* CTA SECTION */}
      <section style={{ background: "#0A2540", padding: "64px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.02) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: "#fff", marginBottom: 14 }}>
            {tr.cta_title}
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", lineHeight: 1.75, marginBottom: 32 }}>
            {tr.cta_desc}
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/inscription?type=expert">
              <button className="btn-primary" style={{ background: "#F7B500", color: "#0A2540" }}>
                {tr.cta_btn_expert} <FaArrowRight size={12} />
              </button>
            </Link>
            <Link href="/inscription?type=startup">
              <button className="btn-outline" style={{ borderColor: "#F7B500", color: "#F7B500" }}>
                {tr.cta_btn_startup} <FaArrowRight size={12} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#05101E", padding: "48px 28px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, background: "#0A2540", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial,sans-serif", fontWeight: 900, fontSize: 12, color: "#F7B500" }}>BEH</div>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 15, color: "#fff" }}>Business <span style={{ color: "#F7B500" }}>Expert</span> Hub</span>
              </Link>
              <p style={{ color: "rgba(255,255,255,.3)", fontSize: 13, lineHeight: 1.78 }}>{tr.footer_desc}</p>
            </div>
            {[
              { title: tr.footer_nav, links: [[tr.nav_home, "/"],[tr.nav_about, "/a-propos"],[tr.nav_services, "/services"],[tr.nav_experts, "/experts"],[tr.nav_blog, "/blog"],[tr.nav_contact, "/contact"]] },
              { title: tr.footer_services, links: SERVICES.map(s => [s.label, `/services/${s.slug}`]) },
              { title: tr.footer_about, links: [["Qui sommes-nous ?", "/a-propos"],["Notre mission", "/a-propos#mission"],["Carrières", "#"],["Presse", "#"]] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.28)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 18 }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {col.links.map(([label, href]) => (
                    <Link key={label} href={href} style={{ color: "rgba(255,255,255,.38)", fontSize: 13.5, textDecoration: "none", transition: "color .2s" }}
                      onMouseEnter={e => (e.target as HTMLElement).style.color = "#F7B500"}
                      onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(255,255,255,.38)"}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ color: "rgba(255,255,255,.2)", fontSize: 13 }}>{tr.footer_copy}</p>
            <div style={{ display: "flex", gap: 22 }}>
              {[tr.footer_legal, tr.footer_privacy, tr.footer_cgu].map(item => (
                <Link key={item} href="#" style={{ color: "rgba(255,255,255,.2)", fontSize: 12.5, textDecoration: "none" }}>{item}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}