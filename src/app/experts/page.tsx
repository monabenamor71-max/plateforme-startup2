"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaStar, FaArrowRight, FaSearch,
  FaChartLine, FaCode, FaUsers,
  FaLightbulb, FaThLarge, FaLock, FaEnvelope,
  FaCalendarAlt, FaBullhorn,
} from "react-icons/fa";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
    <div ref={ref} className={className} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(36px)", transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

type Domain = "tous" | "finance" | "marketing" | "management" | "it" | "strategie";

const DOMAINS = [
  { label: "Tous",       value: "tous"       as Domain, icon: <FaThLarge />,   color: "#0A2540" },
  { label: "Finance",    value: "finance"    as Domain, icon: <FaChartLine />, color: "#3B82F6" },
  { label: "Marketing",  value: "marketing"  as Domain, icon: <FaBullhorn />,  color: "#F7B500" },
  { label: "Management", value: "management" as Domain, icon: <FaUsers />,     color: "#22C55E" },
  { label: "IT",         value: "it"         as Domain, icon: <FaCode />,      color: "#8B5CF6" },
  { label: "Stratégie",  value: "strategie"  as Domain, icon: <FaLightbulb />, color: "#06B6D4" },
];

const navServices = [
  { label: "Consulting",     slug: "consulting"     },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Accompagnement", slug: "accompagnement" },
  { label: "Formations",     slug: "formations"     },
];

function mapDomain(domaine: string): Domain {
  const d = (domaine || "").toLowerCase();
  if (d.includes("finan"))                            return "finance";
  if (d.includes("marketing"))                        return "marketing";
  if (d.includes("manage") || d.includes("rh"))      return "management";
  if (d.includes("tech") || d.includes("it") || d.includes("info")) return "it";
  if (d.includes("strat") || d.includes("business")) return "strategie";
  return "tous";
}

export default function ExpertsPage() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [activeDomain, setActiveDomain] = useState<Domain>("tous");
  const [search, setSearch]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [experts, setExperts]   = useState<any[]>([]);
  const [dispos, setDispos]     = useState<Record<number, any[]>>({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    loadExperts();
  }, []);

  async function loadExperts() {
    setLoading(true);
    setError("");
    try {
      // ✅ Route correcte — retourne les experts avec valide: true
      const res = await fetch("http://localhost:3001/experts");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) { setError("Format de données incorrect"); setLoading(false); return; }

      const transformed = data.map((e: any) => ({
        id:          e.id,
        initials:    ((e.user?.prenom?.[0] || e.prenom?.[0] || "") + (e.user?.nom?.[0] || e.nom?.[0] || "")).toUpperCase(),
        name:        `${e.user?.prenom || e.prenom || ""} ${e.user?.nom || e.nom || ""}`.trim(),
        title:       e.domaine || "",
        domain:      mapDomain(e.domaine || ""),
        domainLabel: e.domaine || "",
        bio:         e.description || "",
        experience:  e.experience || "",
        tarif:       e.tarif || "",
        localisation: e.localisation || "",
        disponible:  e.disponible,
        photo:       e.photo || null,
      }));

      setExperts(transformed);

      // Charger les disponibilités
      const map: Record<number, any[]> = {};
      await Promise.allSettled(
        transformed.map(async (ex) => {
          const r = await fetch(`http://localhost:3001/disponibilites/expert/${ex.id}`).catch(() => null);
          map[ex.id] = r && r.ok ? await r.json() : [];
        })
      );
      setDispos(map);
    } catch (err: any) {
      setError("Erreur lors du chargement des experts");
    } finally {
      setLoading(false);
    }
  }

  const filtered = experts.filter(e => {
    const matchDomain = activeDomain === "tous" || e.domain === activeDomain;
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.title.toLowerCase().includes(q) || e.localisation.toLowerCase().includes(q);
    return matchDomain && matchSearch;
  });

  function formatCreneau(d: any) {
    const date = new Date(d.date);
    const jour = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    return `${jour} ${(d.heureDebut || d.heure || "").slice(0, 5)}`;
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#374151", minHeight: "100vh", background: "#f7f9fc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes heroZoom { 0% { transform: scale(1.08); } 100% { transform: scale(1); } }
        .hero-bg { animation: heroZoom 2s cubic-bezier(.22,1,.36,1) forwards; }
        @keyframes hfi { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        .hci { animation: hfi .85s cubic-bezier(.22,1,.36,1) both; }
        .hci-1 { animation-delay:.1s; } .hci-2 { animation-delay:.25s; } .hci-3 { animation-delay:.4s; }
        @keyframes modalIn { from { opacity:0; transform:scale(.92) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
        .modal-box { animation: modalIn .3s cubic-bezier(.22,1,.36,1); }
        .nav-link { color:#0A2540; text-decoration:none; font-size:15px; font-weight:500; transition:color .2s; }
        .nav-link:hover { color:#F7B500; }
        .drop-item { display:block; padding:10px 16px; color:#0A2540; text-decoration:none; font-size:14px; font-weight:600; transition:background .15s; white-space:nowrap; }
        .drop-item:hover { background:#FFFBEB; }
        .btn-conn { border:2px solid #0A2540; color:#0A2540; background:transparent; padding:9px 22px; border-radius:9px; font-weight:700; font-size:14px; cursor:pointer; transition:all .22s; font-family:inherit; }
        .btn-conn:hover { background:#F7B500; border-color:#F7B500; transform:translateY(-2px); }
        .btn-insc { background:#F7B500; color:#0A2540; border:2px solid #F7B500; padding:9px 22px; border-radius:9px; font-weight:800; font-size:14px; cursor:pointer; transition:all .22s; font-family:inherit; }
        .btn-insc:hover { background:#e6a800; transform:translateY(-2px); }
        .domain-pill { display:flex; align-items:center; gap:7px; padding:10px 20px; border-radius:99px; font-size:13.5px; font-weight:700; cursor:pointer; border:2px solid rgba(10,37,64,.10); background:white; color:#374151; transition:all .22s; white-space:nowrap; }
        .domain-pill:hover { border-color:#F7B500; color:#0A2540; background:#FFFBEB; transform:translateY(-2px); }
        .domain-pill.active { background:#0A2540; color:#F7B500; border-color:#0A2540; transform:translateY(-2px); }
        .search-box { width:100%; background:white; border:1.5px solid rgba(10,37,64,.10); border-radius:14px; padding:13px 16px 13px 48px; font-size:15px; color:#0A2540; outline:none; transition:border-color .22s, box-shadow .22s; font-family:inherit; }
        .search-box::placeholder { color:#9CA3AF; }
        .search-box:focus { border-color:#F7B500; box-shadow:0 0 0 4px rgba(247,181,0,.12); }
        .expert-card { background:white; border-radius:22px; border:1.5px solid rgba(10,37,64,.07); box-shadow:0 4px 22px rgba(10,37,64,.07); overflow:hidden; transition:transform .32s cubic-bezier(.22,1,.36,1), box-shadow .32s, border-color .32s; display:flex; flex-direction:column; }
        .expert-card:hover { transform:translateY(-10px); box-shadow:0 24px 56px rgba(10,37,64,.14); border-color:rgba(247,181,0,.4); }
        .chip { display:inline-flex; align-items:center; background:#EFF6FF; color:#2563EB; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:500; white-space:nowrap; }
        @keyframes ping2 { 0%{transform:scale(1);opacity:.7;} 100%{transform:scale(1.9);opacity:0;} }
        .ping-dot { position:relative; }
        .ping-dot::after { content:''; position:absolute; inset:-3px; border-radius:50%; border:2px solid #22C55E; animation:ping2 1.8s ease-out infinite; }
      `}</style>

      {/* ── MODAL ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(10,37,64,.65)", backdropFilter: "blur(6px)" }} onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ background: "white", borderRadius: 28, width: "100%", maxWidth: 460, padding: "48px 44px", position: "relative", boxShadow: "0 32px 80px rgba(10,37,64,.28)" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#0A2540", margin: "0 auto 20px", boxShadow: "0 10px 28px rgba(247,181,0,.35)" }}><FaLock /></div>
            {selectedExpert && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f7f9fc", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", overflow: "hidden", background: "#0A2540", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 800, fontSize: 14 }}>
                  {selectedExpert.photo ? <img src={`http://localhost:3001/uploads/photos/${selectedExpert.photo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : selectedExpert.initials}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: "#0A2540", fontSize: 15 }}>{selectedExpert.name}</div>
                  <div style={{ color: "#8A9AB5", fontSize: 12 }}>{selectedExpert.title}</div>
                </div>
              </div>
            )}
            <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0A2540", marginBottom: 10, textAlign: "center" }}>Inscription requise</h2>
            <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.75, marginBottom: 28, textAlign: "center" }}>Pour consulter ce profil ou réserver un rendez-vous, créez un compte gratuit ou connectez-vous.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Link href="/inscription" onClick={() => setShowModal(false)}>
                <button style={{ width: "100%", background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 12, padding: 14, fontFamily: "inherit", fontWeight: 900, fontSize: 15, cursor: "pointer" }}>Créer un compte gratuit</button>
              </Link>
              <Link href="/connexion" onClick={() => setShowModal(false)}>
                <button style={{ width: "100%", background: "transparent", color: "#0A2540", border: "1.5px solid rgba(10,37,64,.15)", borderRadius: 12, padding: 12, fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>J'ai déjà un compte — Connexion</button>
              </Link>
            </div>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 14, right: 18, background: "none", border: "none", fontSize: 24, color: "#CBD5E1", cursor: "pointer" }}>×</button>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{ background: "white", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 76, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <svg width="44" height="44" viewBox="0 0 46 46" fill="none"><rect width="46" height="46" rx="12" fill="#0A2540"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial" letterSpacing="0.5">BEH</text></svg>
            <span style={{ fontWeight: 900, fontSize: 18, color: "#0A2540" }}>Business <span style={{ color: "#F7B500" }}>Expert</span> Hub</span>
          </Link>
          <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
            <Link href="/" className="nav-link">Accueil</Link>
            <Link href="/a-propos" className="nav-link">À propos</Link>
            <div style={{ position: "relative" }} onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <Link href="/services" className="nav-link" style={{ fontWeight: 600 }}>Services ▾</Link>
              {servicesOpen && (
                <ul style={{ position: "absolute", top: "calc(100%+8px)", left: 0, background: "white", borderRadius: 12, listStyle: "none", padding: "6px 0", margin: 0, zIndex: 200, minWidth: 200, boxShadow: "0 8px 32px rgba(0,0,0,.12)", border: "1px solid rgba(10,37,64,.06)" }}>
                  {navServices.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nav-link" style={{ color: "#F7B500", fontWeight: 700 }}>Experts</Link>
            <Link href="/blog" className="nav-link">Blog</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
          </nav>
          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/connexion"><button className="btn-conn">Connexion</button></Link>
            <Link href="/inscription"><button className="btn-insc">S'inscrire</button></Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", color: "white", minHeight: 520 }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image src="/ex1.jpg" alt="Experts" fill priority className="hero-bg" style={{ objectFit: "cover", objectPosition: "center top" }} sizes="100vw" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,37,64,.95) 0%, rgba(10,37,64,.82) 40%, transparent 100%)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.018) 1px,transparent 1px)", backgroundSize: "44px 44px", pointerEvents: "none" }} />
        </div>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "88px 24px 110px", position: "relative", zIndex: 10 }}>
          <div className="hci hci-1" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, color: "rgba(255,255,255,.5)" }}>
            <Link href="/" style={{ color: "rgba(255,255,255,.5)", textDecoration: "none" }}>Accueil</Link>
            <span>›</span>
            <span style={{ color: "#F7B500", fontWeight: 600 }}>Nos Experts</span>
          </div>
          <div style={{ maxWidth: 680 }}>
            <div className="hci hci-2">
              <span style={{ display: "inline-block", background: "#F7B500", color: "#0A2540", fontWeight: 900, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", padding: "6px 18px", borderRadius: 99, marginBottom: 20 }}>Experts certifiés</span>
            </div>
            <h1 className="hci hci-3" style={{ fontWeight: 900, margin: "0 0 16px", lineHeight: 1.1, fontSize: "clamp(40px,5vw,64px)" }}>
              Nos <span style={{ color: "#F7B500" }}>Experts</span>
            </h1>
            <p className="hci hci-3" style={{ fontSize: 17, color: "rgba(255,255,255,.8)", lineHeight: 1.8, margin: 0 }}>
              Des professionnels validés pour accompagner votre startup dans chaque domaine clé.
            </p>
          </div>
        </div>
      </section>

      {/* ── FILTRES ── */}
      <section style={{ background: "white", position: "sticky", top: 76, zIndex: 50, boxShadow: "0 4px 20px rgba(10,37,64,.06)", borderBottom: "1px solid rgba(10,37,64,.07)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
              <FaSearch style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 13, pointerEvents: "none" }} />
              <input type="text" placeholder="Rechercher un expert, une compétence…" value={search} onChange={e => setSearch(e.target.value)} className="search-box" />
              {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 13 }}>✕</button>}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {DOMAINS.map(d => (
                <button key={d.value} onClick={() => setActiveDomain(d.value)} className={`domain-pill${activeDomain === d.value ? " active" : ""}`}>
                  <span style={{ fontSize: 12 }}>{d.icon}</span> {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GRILLE ── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 24px" }}>
        <FadeUp style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontWeight: 900, color: "#0A2540", margin: "0 0 6px", fontSize: "clamp(22px,3vw,32px)" }}>
              {activeDomain === "tous" ? "Tous nos experts" : `Experts en ${DOMAINS.find(d => d.value === activeDomain)?.label}`}
            </h2>
            <p style={{ color: "#6B7280", fontSize: 15, margin: 0 }}>
              {loading ? "Chargement…" : `${filtered.length} expert${filtered.length > 1 ? "s" : ""} trouvé${filtered.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Link href="/inscription">
            <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0A2540", color: "white", border: "none", borderRadius: 12, padding: "12px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all .2s", fontFamily: "inherit" }}
              onMouseEnter={e => { (e.target as any).style.background = "#F7B500"; (e.target as any).style.color = "#0A2540"; }}
              onMouseLeave={e => { (e.target as any).style.background = "#0A2540"; (e.target as any).style.color = "white"; }}>
              Devenir expert <FaArrowRight size={12} />
            </button>
          </Link>
        </FadeUp>

        {loading ? (
          <div style={{ textAlign: "center", padding: "96px 0" }}>
            <div style={{ width: 44, height: 44, border: "3px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#8A9AB5", fontSize: 15 }}>Chargement des experts…</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#DC2626" }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontWeight: 900, color: "#0A2540", marginBottom: 8 }}>Aucun expert trouvé</h3>
            <p style={{ color: "#9CA3AF", fontSize: 15, marginBottom: 24 }}>Essayez un autre terme ou sélectionnez un autre domaine.</p>
            <button onClick={() => { setSearch(""); setActiveDomain("tous"); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Réinitialiser</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {filtered.map((ex, i) => (
              <FadeUp key={ex.id} delay={i * 0.07}>
                <div className="expert-card" style={{ height: "100%" }}>
                  <div style={{ padding: 22, flex: 1, display: "flex", flexDirection: "column" }}>

                    {/* Badge dispo */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: ex.disponible ? "#ECFDF5" : "#F9FAFB", color: ex.disponible ? "#059669" : "#9CA3AF" }}>
                        {ex.disponible ? "● Disponible" : "● Occupé"}
                      </span>
                    </div>

                    {/* Avatar + nom */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 800, fontSize: 20, border: "2px solid #F7B500" }}>
                        {ex.photo ? <img src={`http://localhost:3001/uploads/photos/${ex.photo}`} alt={ex.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : ex.initials}
                      </div>
                      <div>
                        <h3 style={{ fontWeight: 800, color: "#0A2540", fontSize: 16, margin: "0 0 4px" }}>{ex.name}</h3>
                        <span style={{ display: "inline-block", background: "#EFF6FF", color: "#2563EB", borderRadius: 99, padding: "3px 10px", fontSize: 11.5, fontWeight: 700 }}>{ex.domainLabel || "Expert"}</span>
                      </div>
                    </div>

                    {/* Infos */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      {ex.experience && <span style={{ fontSize: 12, color: "#6B7280", background: "#F7F9FC", border: "1px solid #E8EEF6", borderRadius: 6, padding: "3px 8px" }}>💼 {ex.experience}</span>}
                      {ex.localisation && <span style={{ fontSize: 12, color: "#6B7280", background: "#F7F9FC", border: "1px solid #E8EEF6", borderRadius: 6, padding: "3px 8px" }}>📍 {ex.localisation}</span>}
                      {ex.tarif && <span style={{ fontSize: 12, color: "#D97706", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 6, padding: "3px 8px" }}>💰 {ex.tarif}</span>}
                    </div>

                    {/* Bio */}
                    {ex.bio && <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>{ex.bio}</p>}

                    {/* Créneaux */}
                    {dispos[ex.id] && dispos[ex.id].length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#8A9AB5", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Prochains créneaux</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {dispos[ex.id].slice(0, 3).map((d, idx) => (
                            <span key={idx} className="chip"><FaCalendarAlt size={9} style={{ marginRight: 4 }} />{formatCreneau(d)}</span>
                          ))}
                          {dispos[ex.id].length > 3 && <span style={{ fontSize: 11, color: "#9CA3AF", alignSelf: "center" }}>+{dispos[ex.id].length - 3}</span>}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                      <button onClick={() => { setSelectedExpert(ex); setShowModal(true); }} style={{ flex: 1, background: "#0A2540", color: "white", border: "none", borderRadius: 10, padding: "11px", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .2s" }}
                        onMouseEnter={e => { (e.currentTarget as any).style.background = "#F7B500"; (e.currentTarget as any).style.color = "#0A2540"; }}
                        onMouseLeave={e => { (e.currentTarget as any).style.background = "#0A2540"; (e.currentTarget as any).style.color = "white"; }}>
                        Voir le profil <FaArrowRight size={11} />
                      </button>
                      <button onClick={() => { setSelectedExpert(ex); setShowModal(true); }} style={{ width: 42, height: 42, background: "#F7F9FC", border: "1px solid #E8EEF6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280", transition: "all .2s" }}
                        onMouseEnter={e => { (e.currentTarget as any).style.background = "#F7B500"; (e.currentTarget as any).style.color = "#0A2540"; }}
                        onMouseLeave={e => { (e.currentTarget as any).style.background = "#F7F9FC"; (e.currentTarget as any).style.color = "#6B7280"; }}>
                        <FaCalendarAlt size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section style={{ background: "#0A2540", padding: "80px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.022) 1px,transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />
        <FadeUp style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
          <h2 style={{ fontWeight: 900, color: "white", margin: "0 0 14px", lineHeight: 1.15, fontSize: "clamp(26px,4vw,44px)" }}>
            Vous êtes expert ?<br /><span style={{ color: "#F7B500" }}>Rejoignez notre réseau</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,.45)", fontSize: 15, lineHeight: 1.75, marginBottom: 32 }}>
            Intégrez la plateforme BEH et connectez-vous avec des startups qui ont besoin de vos compétences.
          </p>
          <Link href="/inscription">
            <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 12, padding: "16px 32px", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 28px rgba(247,181,0,.35)" }}>
              Candidater comme expert <FaArrowRight size={14} />
            </button>
          </Link>
        </FadeUp>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#081B33", color: "white", padding: "28px 24px", textAlign: "center" }}>
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600 }}>© 2026 Business Expert Hub</p>
        <p style={{ color: "rgba(255,255,255,.35)", fontSize: 13, margin: 0 }}>Plateforme de mise en relation startups &amp; experts</p>
      </footer>
    </div>
  );
}