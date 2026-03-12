"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaArrowRight, FaSearch, FaClock, FaChevronRight } from "react-icons/fa";

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, inView] as const;
}
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{ opacity: inView?1:0, transform: inView?"translateY(0)":"translateY(24px)", transition: `opacity .6s cubic-bezier(.22,1,.36,1) ${delay}s, transform .6s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

const CATS = ["Tous", "Stratégie", "Financement", "Croissance", "Management", "Tech & Produit"];
const COLORS: Record<string, string> = {
  "Stratégie": "#3B82F6", "Financement": "#8B5CF6",
  "Croissance": "#22C55E", "Management": "#F7B500", "Tech & Produit": "#EF4444",
};

const ARTICLES = [
  { id:1,  cat:"Stratégie",    title:"Comment bâtir un Business Model solide avant de lever des fonds",      author:"Ahmed Benslimane", date:"28 fév",  readTime:"8 min",  featured:true  },
  { id:2,  cat:"Financement",  title:"Les 7 critères que regardent vraiment les VCs en seed",                author:"Karim Benali",     date:"24 fév",  readTime:"6 min",  featured:false },
  { id:3,  cat:"Croissance",   title:"De 0 à 1M€ ARR : la roadmap des startups SaaS qui réussissent",       author:"Sofia Mansouri",   date:"20 fév",  readTime:"9 min",  featured:false },
  { id:4,  cat:"Management",   title:"OKR pour startups : implémenter sans tuer la culture d'équipe",        author:"Leila Osman",      date:"16 fév",  readTime:"7 min",  featured:false },
  { id:5,  cat:"Tech & Produit",title:"Product-Market Fit : comment savoir si vous l'avez vraiment",         author:"Youssef Tazi",     date:"12 fév",  readTime:"5 min",  featured:false },
  { id:6,  cat:"Stratégie",    title:"Audit organisationnel : pourquoi le faire avant d'embaucher",          author:"Ahmed Benslimane", date:"8 fév",   readTime:"6 min",  featured:false },
  { id:7,  cat:"Financement",  title:"Valorisation pre-money : méthodes et pièges à éviter",                author:"Karim Benali",     date:"4 fév",   readTime:"10 min", featured:false },
  { id:8,  cat:"Croissance",   title:"Cold outreach B2B : le guide pour obtenir 35% de taux de réponse",    author:"Sofia Mansouri",   date:"1 fév",   readTime:"8 min",  featured:false },
  { id:9,  cat:"Management",   title:"Le système de feedback continu qui remplace les revues annuelles",     author:"Leila Osman",      date:"27 jan",  readTime:"6 min",  featured:false },
];

const NAV_SVC = [
  {label:"Consulting",slug:"consulting"},{label:"Audit sur site",slug:"audit-sur-site"},
  {label:"Accompagnement",slug:"accompagnement"},{label:"Formations",slug:"formations"},
];

export default function BlogPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [cat, setCat] = useState("Tous");
  const [q, setQ] = useState("");

  const filtered = ARTICLES.filter(a =>
    (cat === "Tous" || a.cat === cat) &&
    (q === "" || a.title.toLowerCase().includes(q.toLowerCase()))
  );

  const featured = ARTICLES[0];
  const rest = filtered.filter(a => !a.featured || cat !== "Tous" || q !== "");

  return (
    <div className="font-[Plus_Jakarta_Sans,sans-serif] bg-white min-h-screen text-[#0A2540]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes fd{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .drop-item{display:flex;align-items:center;gap:10px;padding:10px 18px;color:#0A2540;text-decoration:none;font-size:14px;font-weight:600;transition:background .15s}
        .drop-item:hover{background:#FFFBEB}
        .btn-conn{border:2px solid #0A2540;color:#0A2540;background:transparent;padding:9px 22px;border-radius:9px;font-weight:700;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-conn:hover{background:#F7B500;border-color:#F7B500;transform:translateY(-2px)}
        .btn-insc{background:#F7B500;color:#0A2540;border:2px solid #F7B500;padding:9px 22px;border-radius:9px;font-weight:800;font-size:14px;cursor:pointer;transition:all .22s;font-family:inherit}
        .btn-insc:hover{background:#e6a800;transform:translateY(-2px)}

        /* card */
        .card{border-bottom:1px solid #f0f0f0;transition:background .2s;cursor:pointer}
        .card:hover{background:#fafbff}
        .card:hover .card-arrow{opacity:1;transform:translateX(0)}
        .card-arrow{opacity:0;transform:translateX(-4px);transition:all .2s}

        /* search */
        .si{background:#f7f8fa;border:1.5px solid #eaedf2;border-radius:10px;padding:11px 16px 11px 42px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:500;color:#0A2540;outline:none;width:100%;transition:border-color .2s,box-shadow .2s}
        .si:focus{border-color:#3B82F6;box-shadow:0 0 0 3px rgba(59,130,246,.1);background:white}
        .si::placeholder{color:#b0b7c3}

        /* pill */
        .pill{padding:7px 16px;border-radius:50px;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid #eaedf2;background:white;color:#6b7280;transition:all .2s;font-family:inherit;white-space:nowrap}
        .pill:hover{border-color:#cbd5e1;color:#0A2540}
        .pill.on{border-color:transparent}

        /* featured */
        .feat{border-radius:20px;overflow:hidden;border:1.5px solid #eaedf2;transition:box-shadow .3s,transform .3s}
        .feat:hover{box-shadow:0 16px 48px rgba(10,37,64,.10);transform:translateY(-3px)}

        /* nl */
        .nl-i{background:#ffffff12;border:1.5px solid #ffffff22;border-radius:10px;padding:11px 16px;color:white;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:500;outline:none;flex:1;transition:border-color .2s}
        .nl-i:focus{border-color:#F7B500}
        .nl-i::placeholder{color:#ffffff44}
      `}</style>

      {/* ── HEADER ── */}
      <header className="bg-white sticky top-0 z-50 border-b border-[#f0f0f0]">
        <div className="max-w-[1200px] mx-auto px-6 h-[70px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <svg width="40" height="40" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="12" fill="#0A2540"/>
              <rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.15"/>
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="15" fontWeight="900" fontFamily="Arial">BEH</text>
            </svg>
            <div>
              <div className="font-black text-[17px] text-[#0A2540] leading-none">Business <span className="text-[#F7B500]">Expert</span> Hub</div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.8px] mt-[3px]">Plateforme Experts &amp; Startups</div>
            </div>
          </Link>
          <nav className="flex gap-6 items-center">
            <Link href="/" className="text-[#0A2540] no-underline text-[14px] font-medium hover:text-[#F7B500] transition-colors">Accueil</Link>
            <Link href="/a-propos" className="text-[#0A2540] no-underline text-[14px] font-medium hover:text-[#F7B500] transition-colors">À propos</Link>
            <div className="relative" onMouseEnter={()=>setNavOpen(true)} onMouseLeave={()=>setNavOpen(false)}>
              <span className="text-[#0A2540] text-[14px] font-medium cursor-pointer hover:text-[#F7B500] transition-colors">Services ▾</span>
              {navOpen && <ul className="absolute top-full left-0 bg-white rounded-xl min-w-[200px] list-none p-[6px_0] m-0 z-[200] border border-gray-100" style={{boxShadow:"0 8px 30px rgba(0,0,0,.10)",animation:"fd .2s ease"}}>
                {NAV_SVC.map(s=><li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>)}
              </ul>}
            </div>
            <Link href="/experts" className="text-[#0A2540] no-underline text-[14px] font-medium hover:text-[#F7B500] transition-colors">Experts</Link>
            <span className="text-[#F7B500] text-[14px] font-black">Blog</span>
            <Link href="/contact" className="text-[#0A2540] no-underline text-[14px] font-medium hover:text-[#F7B500] transition-colors">Contact</Link>
          </nav>
          <div className="flex gap-3">
            <Link href="/connexion"><button className="btn-conn">Connexion</button></Link>
            <Link href="/inscription"><button className="btn-insc">{"S'inscrire"}</button></Link>
          </div>
        </div>
      </header>

      {/* ── PAGE HEADER ── */}
      <div className="border-b border-[#f0f0f0]" style={{padding:"52px 24px 44px"}}>
        <div className="max-w-[1200px] mx-auto">
          <FadeUp>
            <div className="flex items-center gap-2 mb-5 text-[13px] text-gray-400">
              <Link href="/" className="hover:text-[#F7B500] transition-colors no-underline text-gray-400">Accueil</Link>
              <span>›</span>
              <span className="text-[#0A2540] font-semibold">Blog</span>
            </div>
            <div className="flex items-end justify-between gap-8">
              <div>
                <h1 className="font-black m-0 mb-3 leading-[1.08] text-[#0A2540]" style={{fontSize:"clamp(32px,4vw,52px)",letterSpacing:"-1.2px"}}>
                  Blog &amp; Ressources
                </h1>
                <p className="text-gray-500 text-[16px] m-0 max-w-[480px] leading-[1.7]">
                  Stratégie, financement, croissance — les méthodes terrain de nos experts pour scaler votre startup.
                </p>
              </div>
              <div className="flex gap-10 flex-shrink-0">
                {[["24","Articles"],["8","Auteurs"],["2.5k","Lecteurs/mois"]].map(([v,l])=>(
                  <div key={l} className="text-right">
                    <div className="font-black text-[28px] text-[#0A2540] leading-none">{v}</div>
                    <div className="text-[12px] text-gray-400 font-semibold mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-12">

        {/* ── ARTICLE FEATURED (affiché seulement sans filtre) ── */}
        {cat === "Tous" && q === "" && (
          <FadeUp>
            <Link href={`/blog/${featured.id}`} className="no-underline block feat mb-14 group">
              <div className="grid grid-cols-[1fr_340px]">
                {/* Visuel */}
                <div className="relative flex flex-col justify-end p-10" style={{
                  background:"linear-gradient(135deg,#0A2540 0%,#1a3a6e 70%,#0d2850 100%)",
                  minHeight:280,
                }}>
                  {/* motif */}
                  <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"radial-gradient(rgba(255,255,255,0.018) 1px,transparent 1px)",backgroundSize:"28px 28px"}}/>
                  <div className="absolute top-8 right-8 w-24 h-24 pointer-events-none" style={{border:"1px solid rgba(247,181,0,0.12)",transform:"rotate(45deg)",borderRadius:4}}/>
                  <div className="relative z-10">
                    <span className="inline-block bg-[#F7B500] text-[#0A2540] font-black text-[10px] tracking-[2.5px] uppercase px-3 py-1.5 rounded-full mb-4">
                      À la une
                    </span>
                    <h2 className="font-black text-white m-0 leading-[1.2]" style={{fontSize:"clamp(18px,2vw,24px)",maxWidth:480}}>
                      {featured.title}
                    </h2>
                  </div>
                </div>
                {/* Méta */}
                <div className="bg-white p-8 flex flex-col justify-between border-l border-[#f0f0f0]">
                  <div>
                    <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-5"
                      style={{background:`${COLORS[featured.cat]}12`,color:COLORS[featured.cat],border:`1px solid ${COLORS[featured.cat]}25`}}>
                      {featured.cat}
                    </span>
                    <div className="text-[13px] text-gray-500 mb-1 font-semibold">{featured.author}</div>
                    <div className="flex items-center gap-3 text-[12px] text-gray-400 font-semibold">
                      <span>{featured.date} 2026</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><FaClock style={{fontSize:10}}/> {featured.readTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-black text-[14px]" style={{color:COLORS[featured.cat]}}>
                    Lire l&apos;article
                    <FaArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1"/>
                  </div>
                </div>
              </div>
            </Link>
          </FadeUp>
        )}

        {/* ── FILTRES ── */}
        <FadeUp delay={0.05}>
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-[320px]">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b0b7c3]" style={{fontSize:13}}/>
              <input className="si" placeholder="Rechercher…" value={q} onChange={e=>setQ(e.target.value)}/>
            </div>
            {/* Pills */}
            <div className="flex gap-2 flex-wrap">
              {CATS.map(c=>{
                const on = c === cat;
                const col = c==="Tous" ? "#0A2540" : COLORS[c];
                return (
                  <button key={c} className={`pill ${on?"on":""}`} onClick={()=>setCat(c)}
                    style={on ? {background:col,color:"white",borderColor:col} : {}}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </FadeUp>

        {/* ── LISTE ARTICLES ── */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <div className="text-[44px] mb-3">🔍</div>
            <div className="font-bold text-[16px]">Aucun article trouvé</div>
          </div>
        ) : (
          <div>
            <FadeUp delay={0.08}>
              <div className="text-[13px] text-gray-400 font-semibold mb-4">
                {filtered.length} article{filtered.length>1?"s":""}{cat!=="Tous"&&<> · <span className="font-black" style={{color:COLORS[cat]}}>{cat}</span></>}
              </div>
            </FadeUp>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-6">
              {(cat==="Tous" && q==="" ? rest : filtered).map((art,i)=>{
                const col = COLORS[art.cat] ?? "#3B82F6";
                return (
                  <FadeUp key={art.id} delay={i*0.06}>
                    <Link href={`/blog/${art.id}`} className="no-underline block h-full group">
                      <article className="bg-white rounded-[16px] h-full flex flex-col overflow-hidden border border-[#eaedf2] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(10,37,64,0.10)] hover:border-[#d8dce8]">
                        {/* Bande */}
                        <div className="h-[3px]" style={{background:`linear-gradient(90deg,${col},${col}44)`}}/>
                        <div className="p-6 flex-1 flex flex-col">
                          {/* Cat */}
                          <span className="inline-block text-[10px] font-black tracking-[1.5px] uppercase px-2.5 py-1 rounded-full mb-4 self-start"
                            style={{background:`${col}10`,color:col,border:`1px solid ${col}22`}}>
                            {art.cat}
                          </span>
                          {/* Titre */}
                          <h3 className="font-black text-[#0A2540] m-0 mb-3 leading-[1.35] flex-1 transition-colors duration-200 group-hover:text-[#3B82F6]"
                            style={{fontSize:15}}>
                            {art.title}
                          </h3>
                          {/* Footer */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#f5f5f7]">
                            <div>
                              <div className="text-[11px] font-bold text-[#0A2540]">{art.author.split(" ")[0]}</div>
                              <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 mt-0.5">
                                <FaClock style={{fontSize:9}}/>{art.date} · {art.readTime}
                              </div>
                            </div>
                            <FaChevronRight style={{color:col,fontSize:13}} className="transition-transform duration-200 group-hover:translate-x-1"/>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── NEWSLETTER ── */}
      <section className="px-6 pb-16">
        <div className="max-w-[1200px] mx-auto">
          <FadeUp>
            <div className="rounded-[22px] overflow-hidden relative px-12 py-12"
              style={{background:"linear-gradient(135deg,#0A2540,#0d3060)"}}>
              <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
                style={{background:"radial-gradient(circle,rgba(247,181,0,0.1) 0%,transparent 65%)"}}/>
              <div className="relative z-10 flex items-center justify-between gap-12">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[2px] text-[#F7B500] mb-3">Newsletter</div>
                  <h3 className="font-black text-white m-0 mb-2 leading-snug" style={{fontSize:"clamp(20px,2.5vw,28px)"}}>
                    Une analyse stratégique<br/>chaque semaine
                  </h3>
                  <p className="text-white/50 text-[14px] m-0 max-w-[340px]">Moins de bruit, plus de valeur. +1 200 abonnés.</p>
                </div>
                <div className="flex gap-3 flex-shrink-0 min-w-[400px]">
                  <input type="email" placeholder="votre@email.com" className="nl-i"/>
                  <button className="px-6 py-3 rounded-[10px] font-black text-[14px] text-[#0A2540] flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(247,181,0,.4)]"
                    style={{background:"#F7B500"}}>
                    S&apos;abonner
                  </button>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#081B33] text-white py-7 px-6 text-center">
        <p className="m-0 mb-1.5 text-[14px]">© 2026 Business Expert Hub</p>
        <p className="text-white/40 text-[13px] m-0">Plateforme de mise en relation startups &amp; experts</p>
      </footer>
    </div>
  );
}