"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaFacebookF, FaLinkedinIn, FaInstagram,
  FaArrowRight, FaCheckCircle, FaTimesCircle,
  FaPaperPlane, FaClock, FaWhatsapp,
} from "react-icons/fa";

/* ══════════════════════════════════════
   HOOK SCROLL
══════════════════════════════════════ */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView] as const;
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(40px)",
      transition: `opacity .75s cubic-bezier(.22,1,.36,1) ${delay}s, transform .75s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>{children}</div>
  );
}

/* ══════════════════════════════════════
   DONNÉES
══════════════════════════════════════ */
const SUBJECTS = [
  "Question générale",
  "Demande de consulting",
  "Inscription expert",
  "Partenariat",
  "Support technique",
  "Autre",
];

const SOCIALS = [
  { icon: <FaFacebookF />,  label: "Facebook",  href: "#", color: "#1877F2", bg: "rgba(24,119,242,0.1)"  },
  { icon: <FaLinkedinIn />, label: "LinkedIn",  href: "#", color: "#0A66C2", bg: "rgba(10,102,194,0.1)"  },
  { icon: <FaInstagram />,  label: "Instagram", href: "#", color: "#E1306C", bg: "rgba(225,48,108,0.1)"  },
  { icon: <FaWhatsapp />,   label: "WhatsApp",  href: "#", color: "#25D366", bg: "rgba(37,211,102,0.1)"  },
];

const INFOS = [
  {
    icon: <FaEnvelope />,
    label: "Email",
    value: "contact@business-expert-hub.com",
    sub: "Réponse sous 24h",
    color: "#F7B500",
    href: "mailto:contact@business-expert-hub.com",
  },
  {
    icon: <FaPhone />,
    label: "Téléphone",
    value: "+216 71 000 000",
    sub: "Lun–Ven, 9h–18h",
    color: "#3B82F6",
    href: "tel:+21671000000",
  },
  {
    icon: <FaMapMarkerAlt />,
    label: "Adresse",
    value: "Lac 2, Tunis, Tunisie",
    sub: "Siège social",
    color: "#22C55E",
    href: "https://maps.google.com",
  },
  {
    icon: <FaClock />,
    label: "Horaires",
    value: "Lun–Ven : 9h – 18h",
    sub: "Sam : 9h – 13h",
    color: "#8B5CF6",
    href: null,
  },
];

const navServices = [
  { label: "Consulting",     slug: "consulting"     },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Accompagnement", slug: "accompagnement" },
  { label: "Formations",     slug: "formations"     },
 
];

/* ══════════════════════════════════════
   PAGE
══════════════════════════════════════ */
export default function ContactPage() {
  const [servicesOpen, setServicesOpen] = useState(false);

  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", sujet: "", message: "",
  });
  const [errors, setErrors]     = useState<Partial<typeof form>>({});
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  function update(field: keyof typeof form, val: string) {
    setForm(p => ({ ...p, [field]: val }));
    setErrors(p => ({ ...p, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<typeof form> = {};
    if (!form.nom.trim())     e.nom     = "Le nom est obligatoire.";
    if (!form.prenom.trim())  e.prenom  = "Le prénom est obligatoire.";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Email invalide.";
    if (!form.sujet)          e.sujet   = "Veuillez choisir un sujet.";
    if (form.message.trim().length < 20) e.message = "Le message doit contenir au moins 20 caractères.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
    setSuccess(true);
  }

  return (
    <div className="font-[Plus_Jakarta_Sans,sans-serif] text-gray-700 min-h-screen bg-[#fafbff]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes floatY {
          0%,100% { transform: translateY(-50%) rotate(45deg); }
          50%      { transform: translateY(calc(-50% - 14px)) rotate(45deg); }
        }
        @keyframes fadeSlideDown {
          from { opacity:0; transform:translateY(-10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(247,181,0,0.4); }
          50%      { box-shadow: 0 0 0 10px rgba(247,181,0,0); }
        }
        @keyframes successIn {
          from { opacity:0; transform: scale(0.88) translateY(24px); }
          to   { opacity:1; transform: scale(1)    translateY(0); }
        }

        .diamond-float { animation: floatY 7s ease-in-out infinite; }

        .contact-input {
          width: 100%;
          background: rgba(10,37,64,0.04);
          border: 1.5px solid rgba(10,37,64,0.11);
          border-radius: 12px;
          padding: 13px 16px 13px 46px;
          font-size: 14.5px;
          color: #0A2540;
          outline: none;
          transition: border-color .22s, box-shadow .22s, background .22s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .contact-input::placeholder { color: #9CA3AF; }
        .contact-input:focus {
          border-color: #F7B500;
          box-shadow: 0 0 0 4px rgba(247,181,0,0.12);
          background: white;
        }
        .contact-input.err {
          border-color: #EF4444;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.10);
        }
        .contact-input-no-icon { padding-left: 16px; }

        .select-input {
          width: 100%; appearance: none;
          background: rgba(10,37,64,0.04)
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath fill='%236B7280' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")
            no-repeat right 16px center;
          border: 1.5px solid rgba(10,37,64,0.11);
          border-radius: 12px;
          padding: 13px 40px 13px 46px;
          font-size: 14.5px; color: #0A2540; outline: none; cursor: pointer;
          transition: border-color .22s, box-shadow .22s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .select-input:focus {
          border-color: #F7B500;
          box-shadow: 0 0 0 4px rgba(247,181,0,0.12);
          background-color: white;
        }
        .select-input.err { border-color: #EF4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.10); }

        .textarea-input {
          width: 100%; resize: vertical; min-height: 140px;
          background: rgba(10,37,64,0.04);
          border: 1.5px solid rgba(10,37,64,0.11);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 14.5px; color: #0A2540; outline: none; line-height: 1.7;
          transition: border-color .22s, box-shadow .22s, background .22s;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .textarea-input::placeholder { color: #9CA3AF; }
        .textarea-input:focus {
          border-color: #F7B500;
          box-shadow: 0 0 0 4px rgba(247,181,0,0.12);
          background: white;
        }
        .textarea-input.err { border-color: #EF4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.10); }

        .btn-submit {
          width: 100%; background: #F7B500; color: #0A2540;
          border: none; border-radius: 12px;
          padding: 15px; font-size: 16px; font-weight: 800;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: transform .22s ease, box-shadow .22s ease, background .22s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .btn-submit:hover:not(:disabled) {
          background: #e6a800;
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(247,181,0,0.42);
        }
        .btn-submit:disabled { opacity: .72; cursor: not-allowed; }

        .spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(10,37,64,0.22);
          border-top-color: #0A2540;
          border-radius: 50%;
          animation: spin .75s linear infinite;
        }

        .info-card {
          background: white;
          border-radius: 18px;
          border: 1.5px solid rgba(10,37,64,0.07);
          padding: 24px 20px;
          box-shadow: 0 4px 20px rgba(10,37,64,0.07);
          transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
          text-decoration: none;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .info-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 42px rgba(10,37,64,0.12);
          border-color: rgba(247,181,0,0.3);
        }

        .social-btn {
          width: 50px; height: 50px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; cursor: pointer; text-decoration: none;
          transition: transform .25s ease, box-shadow .25s ease;
          border: 1.5px solid rgba(10,37,64,0.08);
        }
        .social-btn:hover { transform: translateY(-4px) scale(1.08); box-shadow: 0 10px 24px rgba(0,0,0,0.12); }

        .btn-conn {
          border: 2px solid #0A2540; color: #0A2540; background: transparent;
          padding: 9px 22px; border-radius: 9px; font-weight: 700; font-size: 14px;
          cursor: pointer; transition: all .22s; font-family: inherit;
        }
        .btn-conn:hover { background: #F7B500; border-color: #F7B500; transform: translateY(-2px); }

        .btn-insc {
          background: #F7B500; color: #0A2540; border: 2px solid #F7B500;
          padding: 9px 22px; border-radius: 9px; font-weight: 800; font-size: 14px;
          cursor: pointer; transition: all .22s; font-family: inherit;
        }
        .btn-insc:hover { background: #e6a800; transform: translateY(-2px); box-shadow: 0 8px 22px rgba(247,181,0,0.38); }

        .drop-item {
          display: block; padding: 10px 16px;
          color: #0A2540; text-decoration: none;
          font-size: 14px; font-weight: 600;
          transition: background .15s; white-space: nowrap;
        }
        .drop-item:hover { background: #FFFBEB; }

        .success-card { animation: successIn .45s cubic-bezier(.22,1,.36,1) both; }
        .pulse-btn    { animation: pulseGlow 2.2s ease-in-out infinite; }
      `}</style>

      {/* ══════════════════════════════════
          HEADER
      ══════════════════════════════════ */}
      <header
        className="bg-white sticky top-0 z-[100]"
        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
      >
        <div className="max-w-[1280px] mx-auto px-6 h-[76px] flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline">
            <svg width="44" height="44" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="12" fill="#0A2540"/>
              <rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15"/>
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial" letterSpacing="0.5">BEH</text>
            </svg>
            <div>
              <div className="font-black text-[18px] text-[#0A2540] leading-none tracking-[-0.4px]">
                Business <span className="text-[#F7B500]">Expert</span> Hub
              </div>
             
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex gap-7 items-center">
            <Link href="/"         className="text-[#0A2540] no-underline text-[15px] font-medium transition-colors hover:text-[#F7B500]">Accueil</Link>
            <Link href="/a-propos" className="text-[#0A2540] no-underline text-[15px] font-medium transition-colors hover:text-[#F7B500]">À propos</Link>
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <Link href="/services" className="text-[#0A2540] no-underline text-[15px] font-semibold transition-colors hover:text-[#F7B500]">
                Services ▾
              </Link>
              {servicesOpen && (
                <ul
                  className="absolute top-[calc(100%+8px)] left-0 bg-white rounded-xl list-none p-[6px_0] m-0 z-[200] min-w-[200px]"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: "1px solid rgba(10,37,64,0.06)", animation: "fadeSlideDown .2s ease" }}
                >
                  {navServices.map(s => (
                    <li key={s.slug}>
                      <Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link href="/experts" className="text-[#0A2540] no-underline text-[15px] font-medium transition-colors hover:text-[#F7B500]">Experts</Link>
            <Link href="/blog"    className="text-[#0A2540] no-underline text-[15px] font-medium transition-colors hover:text-[#F7B500]">Blog</Link>
            <Link href="/contact" className="text-[#F7B500] no-underline text-[15px] font-bold">Contact</Link>
          </nav>

          <div className="flex gap-3">
            <Link href="/connexion">  <button className="btn-conn">Connexion</button>  </Link>
            <Link href="/inscription"><button className="btn-insc">{"S'inscrire"}</button></Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: "linear-gradient(135deg,#0A2540 0%,#0d3060 55%,#081B33 100%)", padding: "80px 24px 96px" }}
      >
        {/* Losanges déco */}
        {[
          { w: 340, right: -50,  delay: "0s"   },
          { w: 200, right: 90,   delay: "1.6s" },
          { w: 110, right: 140,  delay: "0.8s" },
        ].map((d, i) => (
          <div
            key={i}
            className="diamond-float absolute pointer-events-none"
            style={{
              width: d.w, height: d.w, right: d.right, top: "50%",
              transform: "translateY(-50%) rotate(45deg)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              animationDelay: d.delay,
            }}
          />
        ))}
        <div
          className="absolute pointer-events-none"
          style={{ bottom: -60, left: -60, width: 240, height: 240, transform: "rotate(45deg)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        />
        {/* Lueur centrale */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(247,181,0,0.07) 0%,transparent 65%)" }}
        />

        <div className="max-w-[1280px] mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-[13px] text-white/50">
            <Link href="/" className="text-white/50 no-underline transition-colors hover:text-[#F7B500]">Accueil</Link>
            <span>›</span>
            <span className="text-[#F7B500] font-semibold">Contact</span>
          </div>

          <div className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[12px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-[22px]">
            Contactez-nous
          </div>

          <h1 className="font-black m-0 mb-5 leading-[1.1]" style={{ fontSize: "clamp(38px,5vw,64px)" }}>
            Parlons de votre <span className="text-[#F7B500]">projet</span>
          </h1>
          <p className="text-[17px] text-white/75 max-w-[560px] leading-[1.8] m-0">
            Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner vers les meilleurs experts.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════
          INFOS DE CONTACT (4 cartes)
      ══════════════════════════════════ */}
      <section className="max-w-[1280px] mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-4 gap-5">
          {INFOS.map((info, i) => (
            <FadeUp key={i} delay={i * 0.1}>
              {info.href ? (
                <a href={info.href} target="_blank" rel="noopener noreferrer" className="info-card">
                  <InfoCardContent info={info} />
                </a>
              ) : (
                <div className="info-card cursor-default">
                  <InfoCardContent info={info} />
                </div>
              )}
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          CONTENU PRINCIPAL : Formulaire + Sidebar
      ══════════════════════════════════ */}
      <section className="max-w-[1280px] mx-auto px-6 py-20">
        <div className="grid gap-10" style={{ gridTemplateColumns: "1fr 400px" }}>

          {/* ─── FORMULAIRE ─── */}
          <FadeUp>
            <div
              className="bg-white rounded-3xl"
              style={{ padding: "52px 48px", boxShadow: "0 8px 48px rgba(10,37,64,0.09)", border: "1.5px solid rgba(10,37,64,0.07)" }}
            >
              {success ? (
                /* ── SUCCÈS ── */
                <div className="success-card text-center py-10">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-7 text-[40px] text-white pulse-btn"
                    style={{ background: "linear-gradient(135deg,#22C55E,#16a34a)", boxShadow: "0 12px 36px rgba(34,197,94,0.38)" }}
                  >
                    ✓
                  </div>
                  <h2 className="text-[28px] font-black text-[#0A2540] mb-3">Message envoyé !</h2>
                  <p className="text-gray-500 text-[16px] leading-relaxed max-w-[380px] mx-auto mb-10">
                    Merci <strong className="text-[#0A2540]">{form.prenom} {form.nom}</strong> ! Notre équipe vous répondra sous 24h à l&apos;adresse <strong className="text-[#F7B500]">{form.email}</strong>.
                  </p>
                  <button
                    onClick={() => { setSuccess(false); setForm({ nom:"",prenom:"",email:"",sujet:"",message:"" }); }}
                    className="inline-flex items-center gap-2 bg-[#0A2540] text-white border-none rounded-xl px-8 py-3.5 font-bold text-[15px] cursor-pointer transition-all duration-200 hover:bg-[#F7B500] hover:text-[#0A2540] hover:-translate-y-0.5"
                    style={{ fontFamily: "inherit" }}
                  >
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-9">
                    <h2 className="text-[26px] font-black text-[#0A2540] mb-2">Envoyez-nous un message</h2>
                    <p className="text-gray-500 text-[15px]">Tous les champs marqués <span className="text-red-500">*</span> sont obligatoires.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Nom / Prénom */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField label="Nom *" icon="👤" error={errors.nom}>
                        <input
                          type="text" placeholder="Votre nom"
                          value={form.nom} onChange={e => update("nom", e.target.value)}
                          className={`contact-input${errors.nom ? " err" : ""}`}
                        />
                      </FormField>
                      <FormField label="Prénom *" icon="👤" error={errors.prenom}>
                        <input
                          type="text" placeholder="Votre prénom"
                          value={form.prenom} onChange={e => update("prenom", e.target.value)}
                          className={`contact-input${errors.prenom ? " err" : ""}`}
                        />
                      </FormField>
                    </div>

                    {/* Email */}
                    <FormField label="Adresse email *" error={errors.email}>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[14px] pointer-events-none" />
                        <input
                          type="email" placeholder="votre@email.com"
                          value={form.email} onChange={e => update("email", e.target.value)}
                          className={`contact-input${errors.email ? " err" : ""}`}
                        />
                      </div>
                    </FormField>

                    {/* Sujet */}
                    <FormField label="Sujet *" error={errors.sujet}>
                      <div className="relative">
                        <FaPaperPlane className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px] pointer-events-none z-10" />
                        <select
                          value={form.sujet} onChange={e => update("sujet", e.target.value)}
                          className={`select-input${errors.sujet ? " err" : ""}`}
                        >
                          <option value="">Choisir un sujet…</option>
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </FormField>

                    {/* Message */}
                    <FormField label="Message *" error={errors.message}>
                      <textarea
                        placeholder="Décrivez votre demande en détail (min. 20 caractères)…"
                        value={form.message} onChange={e => update("message", e.target.value)}
                        className={`textarea-input${errors.message ? " err" : ""}`}
                      />
                      <div className="flex justify-end mt-1">
                        <span className={`text-[12px] font-medium ${form.message.length >= 20 ? "text-green-500" : "text-gray-400"}`}>
                          {form.message.length} / 20 min
                        </span>
                      </div>
                    </FormField>

                    {/* Submit */}
                    <button type="submit" className="btn-submit" disabled={loading}>
                      {loading
                        ? <><div className="spinner" /> Envoi en cours…</>
                        : <>Envoyer le message <FaArrowRight size={14} /></>
                      }
                    </button>
                  </form>
                </>
              )}
            </div>
          </FadeUp>

          {/* ─── SIDEBAR ─── */}
          <div className="flex flex-col gap-6">

            {/* Réseaux sociaux */}
            <FadeUp delay={0.15}>
              <div
                className="bg-white rounded-2xl p-7"
                style={{ boxShadow: "0 4px 24px rgba(10,37,64,0.08)", border: "1.5px solid rgba(10,37,64,0.07)" }}
              >
                <h3 className="text-[18px] font-black text-[#0A2540] mb-1.5">Nos réseaux sociaux</h3>
                <p className="text-gray-500 text-[13px] mb-5">Suivez-nous pour ne rien manquer</p>
                <div className="grid grid-cols-2 gap-3">
                  {SOCIALS.map((s, i) => (
                    <a
                      key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="social-btn flex items-center gap-3 w-full rounded-2xl px-4 py-3 no-underline"
                      style={{ background: s.bg, border: `1.5px solid ${s.color}22`, color: s.color, fontSize: 14 }}
                    >
                      <span className="text-[18px]">{s.icon}</span>
                      <span className="font-bold text-[13px]" style={{ color: "#0A2540" }}>{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Localisation carte */}
            <FadeUp delay={0.25}>
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 4px 24px rgba(10,37,64,0.08)", border: "1.5px solid rgba(10,37,64,0.07)" }}
              >
                {/* Carte simulée (iframe Google Maps) */}
                <div className="relative" style={{ height: 200 }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3193.5!2d10.2264!3d36.8517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzbCsDUxJzA2LjEiTiAxMMKwMTMnMzUuMCJF!5e0!3m2!1sfr!2stn!4v1234567890"
                    width="100%" height="200"
                    style={{ border: 0 }}
                    allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localisation Business Expert Hub"
                  />
                  {/* Badge au-dessus de la carte */}
                  <div
                    className="absolute top-3 left-3 flex items-center gap-2 bg-white rounded-xl px-3 py-2"
                    style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
                  >
                    <FaMapMarkerAlt className="text-[#F7B500] text-[14px]" />
                    <span className="text-[12px] font-bold text-[#0A2540]">Lac 2, Tunis</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[14px] flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}
                    >
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <div className="font-black text-[#0A2540] text-[14px]">Siège social</div>
                      <div className="text-gray-500 text-[13px] mt-0.5 leading-relaxed">
                        Lac 2, Tunis, Tunisie<br />
                        Immeuble Business Center
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-[#0A2540] text-white no-underline rounded-xl py-2.5 text-[13px] font-bold transition-all duration-200 hover:bg-[#F7B500] hover:text-[#0A2540] hover:-translate-y-0.5"
                  >
                    <FaMapMarkerAlt size={12} /> Ouvrir dans Maps
                  </a>
                </div>
              </div>
            </FadeUp>

            {/* Disponibilité */}
            <FadeUp delay={0.35}>
              <div
                className="bg-[#0A2540] rounded-2xl p-7 relative overflow-hidden"
                style={{ boxShadow: "0 8px 30px rgba(10,37,64,0.25)" }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle,rgba(247,181,0,0.12) 0%,transparent 70%)", transform: "translate(30%,-30%)" }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400 relative">
                      <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-60" />
                    </div>
                    <span className="text-green-400 text-[12px] font-bold uppercase tracking-[2px]">En ligne</span>
                  </div>
                  <h3 className="text-white font-black text-[17px] mb-2">Besoin d'une réponse rapide ?</h3>
                  <p className="text-white/55 text-[13px] leading-relaxed mb-5">
                    Notre équipe répond généralement sous <strong className="text-[#F7B500]">2 heures</strong> pendant les horaires ouvrés.
                  </p>
                  <a
                    href="tel:+21671000000"
                    className="flex items-center justify-center gap-2 bg-[#F7B500] text-[#0A2540] no-underline rounded-xl py-3 font-black text-[14px] transition-all duration-200 hover:bg-[#e6a800] hover:-translate-y-0.5"
                    style={{ boxShadow: "0 6px 20px rgba(247,181,0,0.30)" }}
                  >
                    <FaPhone size={13} /> Appelez maintenant
                  </a>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FAQ RAPIDE
      ══════════════════════════════════ */}
      <section
        className="py-20 px-6"
        style={{ background: "linear-gradient(160deg,#f0f6ff 0%,#ffffff 100%)" }}
      >
        <div className="max-w-[1280px] mx-auto">
          <FadeUp className="text-center mb-14">
            <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[12px] tracking-[3px] uppercase px-[18px] py-1.5 rounded-full mb-5">
              FAQ
            </span>
            <h2 className="font-black text-[#0A2540] m-0 mb-3 leading-[1.15]" style={{ fontSize: "clamp(26px,3.5vw,40px)" }}>
              Questions <span className="text-[#F7B500]">fréquentes</span>
            </h2>
            <p className="text-gray-500 text-[16px] max-w-[420px] mx-auto">
              Quelques réponses avant de nous contacter
            </p>
          </FadeUp>

          <div className="grid grid-cols-3 gap-6">
            {[
              { q: "Quel est le délai de réponse ?",           a: "Nous répondons à toutes les demandes dans un délai de 24h ouvrées, souvent bien avant." },
              { q: "Puis-je réserver un expert directement ?", a: "Oui, après inscription vous pouvez consulter les profils et envoyer une demande de mission." },
              { q: "Les consultations sont-elles gratuites ?", a: "Un premier échange de 30 min est offert pour évaluer vos besoins avant toute facturation." },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.12}>
                <div
                  className="bg-white rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
                  style={{ boxShadow: "0 4px 20px rgba(10,37,64,0.07)", border: "1.5px solid rgba(10,37,64,0.07)" }}
                >
                  <FaCheckCircle className="text-[#F7B500] text-[18px] mb-4" />
                  <h4 className="text-[15px] font-black text-[#0A2540] mb-2.5 leading-snug">{item.q}</h4>
                  <p className="text-gray-500 text-[14px] leading-relaxed m-0">{item.a}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer className="bg-[#081B33] text-white py-8 px-6 text-center">
        <p className="m-0 mb-2 text-[14px] font-semibold">© 2026 Business Expert Hub</p>
        <p className="text-white/40 text-[13px] m-0">Plateforme de mise en relation startups & experts</p>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════
   SOUS-COMPOSANTS
══════════════════════════════════════ */
function InfoCardContent({ info }: { info: typeof INFOS[number] }) {
  return (
    <>
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-[18px] flex-shrink-0"
        style={{ background: `${info.color}18`, color: info.color }}
      >
        {info.icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[1.5px] mb-1">{info.label}</div>
        <div className="font-black text-[#0A2540] text-[14px] leading-snug">{info.value}</div>
        <div className="text-gray-400 text-[12px] mt-0.5">{info.sub}</div>
      </div>
    </>
  );
}

function FormField({
  label, icon, error, children,
}: { label: string; icon?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-bold text-gray-700 tracking-[0.3px]">
        {icon && <span className="mr-1.5">{icon}</span>}{label}
      </label>
      {children}
      {error && (
        <span className="text-[12px] text-red-500 flex items-center gap-1.5 font-semibold">
          <FaTimesCircle size={11} /> {error}
        </span>
      )}
    </div>
  );
}