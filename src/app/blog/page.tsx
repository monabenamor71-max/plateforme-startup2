"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowRight, FaSearch, FaClock, FaEye,
  FaLock, FaFilePdf, FaChevronDown, FaFilter,
  FaFire, FaTag, FaTimes, FaCalendarAlt,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

const CATEGORIES = [
  "Toutes","Finance & Marchés","IA & Digital","RH & Organisation",
  "Stratégie","Startup","Management","Marketing","Droit & Conformité","Économie",
];

const TYPES = [
  { val:"", label:"Tout" },
  { val:"article", label:"Articles" },
  { val:"conseil", label:"Conseils" },
  { val:"nouveaute", label:"Nouveautés" },
];

export default function BlogPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("Toutes");
  const [typeFilter, setTypeFilter] = useState("");
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockArticle, setLockArticle] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("user");
    setIsLoggedIn(!!u);
    fetch(`${BASE}/articles/publics`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { setArticles(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function handleArticleClick(article: any) {
    if (article.acces_prive && !isLoggedIn) {
      setLockArticle(article);
      setShowLockModal(true);
      return;
    }
    router.push(`/blog/${article.id}`);
  }

  const SERVICES = [
    { label:"Consulting", slug:"consulting" },
    { label:"Audit sur site", slug:"audit-sur-site" },
    { label:"Accompagnement", slug:"accompagnement" },
    { label:"Formations", slug:"formations" },
  ];

  const filtered = articles.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.titre?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      (a.tags || []).some((t: string) => t.toLowerCase().includes(q)) ||
      a.categorie?.toLowerCase().includes(q);
    const matchCat = categorie === "Toutes" || a.categorie === categorie;
    const matchType = !typeFilter || a.type === typeFilter;
    return matchSearch && matchCat && matchType;
  });

  const tendance = filtered.filter(a => a.tres_tendance);
  const autres = filtered.filter(a => !a.tres_tendance);

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:"#fff", minHeight:"100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::selection{background:#F7B500;color:#0A2540;}
        .nl{color:#475569;text-decoration:none;font-size:14.5px;font-weight:500;transition:color .2s;}
        .nl:hover{color:#F7B500;}
        .di{display:block;padding:10px 18px;color:#334155;text-decoration:none;font-size:14px;font-weight:500;transition:background .15s,color .15s;white-space:nowrap;}
        .di:hover{background:#FFFBEB;color:#F7B500;}
        .bno{border:2px solid #0A2540;color:#0A2540;background:transparent;padding:9px 22px;border-radius:9px;font-weight:700;font-size:13.5px;cursor:pointer;transition:all .22s;font-family:inherit;}
        .bno:hover{background:#F7B500;border-color:#F7B500;}
        .bns{background:#F7B500;color:#0A2540;border:none;padding:9px 22px;border-radius:9px;font-weight:800;font-size:13.5px;cursor:pointer;transition:all .22s;font-family:inherit;}
        .bns:hover{background:#e6a800;box-shadow:0 8px 20px rgba(247,181,0,.38);}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .card-animation{animation:fadeIn .5s cubic-bezier(.22,1,.36,1) both;}
        .search-inp{width:100%;background:#F8FAFC;border:1.5px solid #E2EAF4;border-radius:12px;padding:13px 16px 13px 44px;font-family:'Outfit',sans-serif;font-size:14px;color:#0A2540;outline:none;transition:all .2s;}
        .search-inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.1);background:#fff;}
        .cat-btn{border:1.5px solid #E2EAF4;border-radius:99px;padding:7px 16px;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;background:#fff;color:#475569;white-space:nowrap;}
        .cat-btn.active,.cat-btn:hover{border-color:#0A2540;background:#0A2540;color:#fff;}
        .type-btn{border:1.5px solid #E2EAF4;border-radius:8px;padding:8px 16px;font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;background:#fff;color:#475569;}
        .type-btn.active{border-color:#F7B500;background:#FFF8E1;color:#B45309;}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.6);z-index:999;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(8px);}
        .art-card{background:#fff;border-radius:20px;overflow:hidden;border:1px solid rgba(10,37,64,.07);box-shadow:0 4px 20px rgba(10,37,64,.06);display:flex;flex-direction:column;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s,border-color .35s;text-decoration:none;height:100%;}
        .art-card:hover{transform:translateY(-8px);box-shadow:0 28px 60px rgba(10,37,64,.14);border-color:rgba(247,181,0,.3);}
        .art-card:hover .art-img{transform:scale(1.05);}
        .art-img{transition:transform .6s cubic-bezier(.22,1,.36,1);width:100%;height:100%;object-fit:cover;}
      `}</style>

      {/* Modal accès réservé */}
      {showLockModal && (
        <div className="modal-bg" onClick={() => setShowLockModal(false)}>
          <div style={{
            background:"#fff", borderRadius:24, padding:"44px 40px",
            maxWidth:420, width:"100%", textAlign:"center",
            boxShadow:"0 40px 100px rgba(10,37,64,.3)",
            position:"relative",
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowLockModal(false)}
              style={{ position:"absolute", top:14, right:16, background:"none", border:"none", fontSize:20, color:"#CBD5E1", cursor:"pointer" }}>
              <FaTimes />
            </button>
            <div style={{
              width:72, height:72, borderRadius:"50%",
              background:"linear-gradient(135deg,#F7B500,#e6a800)",
              display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 20px",
              boxShadow:"0 10px 28px rgba(247,181,0,.3)",
            }}>
              <FaLock size={26} style={{ color:"#0A2540" }} />
            </div>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:800, color:"#0A2540", marginBottom:10 }}>
              Contenu réservé aux membres
            </h3>
            <p style={{ color:"#64748B", fontSize:14.5, lineHeight:1.75, marginBottom:8 }}>
              <strong style={{ color:"#0A2540" }}>« {lockArticle?.titre} »</strong>
            </p>
            <p style={{ color:"#64748B", fontSize:14, lineHeight:1.75, marginBottom:28 }}>
              Créez un compte gratuit ou connectez-vous pour accéder à cet article
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <Link href="/inscription" onClick={() => setShowLockModal(false)}>
                <button style={{ width:"100%", background:"#0A2540", color:"#F7B500", border:"none", borderRadius:11, padding:"14px", fontFamily:"inherit", fontWeight:800, fontSize:15, cursor:"pointer" }}>
                  Créer un compte gratuit
                </button>
              </Link>
              <Link href="/connexion" onClick={() => setShowLockModal(false)}>
                <button style={{ width:"100%", background:"transparent", color:"#0A2540", border:"1.5px solid #E2EAF4", borderRadius:11, padding:"12px", fontFamily:"inherit", fontWeight:600, fontSize:14, cursor:"pointer" }}>
                  Se connecter
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background:"#fff", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 0 #EEF2F7,0 4px 18px rgba(10,37,64,.05)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 28px", height:76, display:"flex", alignItems:"center", justifyContent:"space-between", gap:20 }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:11, textDecoration:"none", flexShrink:0 }}>
            <svg width="40" height="40" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="11" fill="#0A2540" />
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900" fontFamily="Arial">BEH</text>
            </svg>
            <span style={{ fontWeight:700, fontSize:18, color:"#0A2540" }}>
              Business <span style={{ color:"#F7B500" }}>Expert</span> Hub
            </span>
          </Link>
          <nav style={{ display:"flex", gap:20, alignItems:"center", flex:1, justifyContent:"center" }}>
            <Link href="/" className="nl">Accueil</Link>
            <Link href="/a-propos" className="nl">À propos</Link>
            <div style={{ position:"relative" }} onMouseEnter={() => setNavOpen(true)} onMouseLeave={() => setNavOpen(false)}>
              <span className="nl" style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                Services <FaChevronDown size={9} />
              </span>
              {navOpen && (
                <ul style={{ position:"absolute", top:"calc(100% + 10px)", left:0, background:"#fff", borderRadius:14, listStyle:"none", padding:"8px", margin:0, zIndex:200, minWidth:210, boxShadow:"0 16px 48px rgba(10,37,64,.14)", border:"1px solid #EEF2F7" }}>
                  {SERVICES.map(s => (
                    <li key={s.slug}><Link href={`/services/${s.slug}`} className="di">{s.label}</Link></li>
                  ))}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nl">Experts</Link>
            <Link href="/blog" className="nl" style={{ color:"#F7B500", fontWeight:700 }}>Blog</Link>
            <Link href="/contact" className="nl">Contact</Link>
          </nav>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexShrink:0 }}>
            <Link href="/connexion"><button className="bno">Connexion</button></Link>
            <Link href="/inscription"><button className="bns">S&apos;inscrire</button></Link>
          </div>
        </div>
      </header>

      {/* Hero Blog */}
      <section style={{
        background:"linear-gradient(135deg,#0A2540 0%,#1a3f6f 60%,#0d2850 100%)",
        padding:"64px 28px 52px",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,.02) 1px,transparent 1px)", backgroundSize:"44px 44px", pointerEvents:"none" }} />
        <div style={{ maxWidth:1200, margin:"0 auto", position:"relative", zIndex:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:20, opacity:.7 }}>
            <Link href="/" style={{ color:"rgba(255,255,255,.5)", textDecoration:"none", fontSize:13 }}>Accueil</Link>
            <span style={{ color:"rgba(255,255,255,.3)" }}>›</span>
            <span style={{ color:"#F7B500", fontSize:13, fontWeight:600 }}>Blog</span>
          </div>
          <h1 style={{
            fontFamily:"'Fraunces',serif",
            fontSize:"clamp(36px,5vw,64px)",
            fontWeight:900, color:"#fff",
            lineHeight:1.1, marginBottom:16,
          }}>
            Insights &amp; <span style={{ color:"#F7B500", fontStyle:"italic" }}>Expertises</span>
          </h1>
          <p style={{ fontSize:16, color:"rgba(255,255,255,.6)", maxWidth:520, lineHeight:1.85, marginBottom:36 }}>
            Articles, conseils et analyses de nos experts pour accélérer la croissance de votre startup.
          </p>

         

          {/* Stats */}
          <div style={{ display:"flex", gap:28, marginTop:28 }}>
            <div><span style={{ fontSize:22, fontWeight:800, color:"#F7B500" }}>{articles.length}</span><span style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginLeft:6 }}>articles publiés</span></div>
          </div>
        </div>
      </section>

      {/* Filtres */}
      <div style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", padding:"0 28px", position:"sticky", top:76, zIndex:90, boxShadow:"0 2px 12px rgba(10,37,64,.04)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"14px 0", display:"flex", alignItems:"center", gap:16, overflowX:"auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
            <FaFilter size={11} style={{ color:"#94A3B8" }} />
            <span style={{ fontSize:12, color:"#94A3B8", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px" }}>Filtrer</span>
          </div>
          <div style={{ display:"flex", gap:6, flexShrink:0 }}>
            {TYPES.map(t => (
              <button key={t.val} className={`type-btn${typeFilter===t.val?" active":""}`} onClick={() => setTypeFilter(t.val)}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ width:1, height:24, background:"#E2EAF4", flexShrink:0 }} />
          <div style={{ display:"flex", gap:6, overflowX:"auto" }}>
            {CATEGORIES.map(c => (
              <button key={c} className={`cat-btn${categorie===c?" active":""}`} onClick={() => setCategorie(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal - Cartes avec images */}
      <main style={{ maxWidth:1200, margin:"0 auto", padding:"48px 28px 80px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ width:40, height:40, border:"3px solid #F7B500", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 16px" }} />
            <div style={{ color:"#94A3B8", fontSize:14 }}>Chargement des articles...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:52, marginBottom:16 }}>📝</div>
            <div style={{ fontWeight:700, fontSize:18, color:"#0A2540", marginBottom:8 }}>Aucun article trouvé</div>
            <div style={{ color:"#94A3B8", fontSize:14 }}>Essayez d'autres filtres ou mots-clés</div>
            <button onClick={() => { setSearch(""); setCategorie("Toutes"); setTypeFilter(""); }}
              style={{ marginTop:20, background:"#0A2540", color:"#fff", border:"none", borderRadius:9, padding:"10px 22px", fontFamily:"inherit", fontWeight:700, fontSize:13, cursor:"pointer" }}>
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            {/* Section Très tendance */}
            {tendance.length > 0 && (
              <div style={{ marginBottom:48 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
                  <FaFire style={{ color:"#F7B500", fontSize:18 }} />
                  <h2 style={{ fontSize:20, fontWeight:800, color:"#0A2540" }}>🔥 Très tendance</h2>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:28 }}>
                  {tendance.map((art, i) => (
                    <div key={art.id} className="card-animation" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="art-card" onClick={() => handleArticleClick(art)} style={{ cursor: "pointer" }}>
                        <div style={{ position:"relative", height:200, background:"linear-gradient(135deg,#0A2540,#1a3f6f)", overflow:"hidden", flexShrink:0 }}>
                          {art.image ? (
                            <img src={`${BASE}/uploads/articles-img/${art.image}`} alt={art.titre} className="art-img" />
                          ) : (
                            <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, background:"#0A2540" }}>📝</div>
                          )}
                          <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent 40%,rgba(10,37,64,.6) 100%)" }} />
                          <div style={{ position:"absolute", top:12, left:12 }}>
                            <span style={{ background:"#F7B500", color:"#0A2540", borderRadius:99, padding:"4px 12px", fontSize:11, fontWeight:700 }}>
                              {art.categorie || art.type || "Article"}
                            </span>
                          </div>
                          <div style={{ position:"absolute", bottom:12, right:12, display:"flex", alignItems:"center", gap:5, background:"rgba(10,37,64,.75)", backdropFilter:"blur(8px)", borderRadius:99, padding:"3px 10px" }}>
                            <FaClock size={10} style={{ color:"#F7B500" }} />
                            <span style={{ fontSize:11, color:"#fff", fontWeight:600 }}>{art.duree_lecture || "5 min"}</span>
                          </div>
                        </div>
                        <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                            <FaCalendarAlt size={11} style={{ color:"#94A3B8" }} />
                            <span style={{ fontSize:11, color:"#94A3B8" }}>{new Date(art.createdAt).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" })}</span>
                            <span style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:3 }}>
                              <FaEye size={10} style={{ color:"#94A3B8" }} />
                              <span style={{ fontSize:11, color:"#94A3B8" }}>{art.vues || 0}</span>
                            </span>
                          </div>
                          <h3 style={{ fontSize:16, fontWeight:800, color:"#0A2540", marginBottom:8, lineHeight:1.35 }}>{art.titre}</h3>
                          <p style={{ fontSize:12.5, color:"#64748B", lineHeight:1.65, marginBottom:12, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{art.description}</p>
                          <div style={{ marginTop:"auto", display:"flex", alignItems:"center", gap:6, color:"#F7B500", fontSize:12, fontWeight:700 }}>
                            Lire l'article <FaArrowRight size={10} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section Autres articles */}
            {autres.length > 0 && (
              <div>
                <div style={{ marginBottom:24 }}>
                  <h2 style={{ fontSize:20, fontWeight:800, color:"#0A2540" }}>📖 Tous les articles</h2>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:28 }}>
                  {autres.map((art, i) => (
                    <div key={art.id} className="card-animation" style={{ animationDelay: `${(tendance.length + i) * 0.1}s` }}>
                      <div className="art-card" onClick={() => handleArticleClick(art)} style={{ cursor: "pointer" }}>
                        <div style={{ position:"relative", height:200, background:"linear-gradient(135deg,#0A2540,#1a3f6f)", overflow:"hidden", flexShrink:0 }}>
                          {art.image ? (
                            <img src={`${BASE}/uploads/articles-img/${art.image}`} alt={art.titre} className="art-img" />
                          ) : (
                            <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, background:"#0A2540" }}>📝</div>
                          )}
                          <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent 40%,rgba(10,37,64,.6) 100%)" }} />
                          <div style={{ position:"absolute", top:12, left:12 }}>
                            <span style={{ background:art.couleur_point || "#3B82F6", color:"#fff", borderRadius:99, padding:"4px 12px", fontSize:11, fontWeight:700 }}>
                              {art.categorie || art.type || "Article"}
                            </span>
                          </div>
                          <div style={{ position:"absolute", bottom:12, right:12, display:"flex", alignItems:"center", gap:5, background:"rgba(10,37,64,.75)", backdropFilter:"blur(8px)", borderRadius:99, padding:"3px 10px" }}>
                            <FaClock size={10} style={{ color:"#F7B500" }} />
                            <span style={{ fontSize:11, color:"#fff", fontWeight:600 }}>{art.duree_lecture || "5 min"}</span>
                          </div>
                        </div>
                        <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                            <FaCalendarAlt size={11} style={{ color:"#94A3B8" }} />
                            <span style={{ fontSize:11, color:"#94A3B8" }}>{new Date(art.createdAt).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" })}</span>
                            <span style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:3 }}>
                              <FaEye size={10} style={{ color:"#94A3B8" }} />
                              <span style={{ fontSize:11, color:"#94A3B8" }}>{art.vues || 0}</span>
                            </span>
                          </div>
                          <h3 style={{ fontSize:16, fontWeight:800, color:"#0A2540", marginBottom:8, lineHeight:1.35 }}>{art.titre}</h3>
                          <p style={{ fontSize:12.5, color:"#64748B", lineHeight:1.65, marginBottom:12, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{art.description}</p>
                          <div style={{ marginTop:"auto", display:"flex", alignItems:"center", gap:6, color:"#F7B500", fontSize:12, fontWeight:700 }}>
                            Lire l'article <FaArrowRight size={10} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Résultat recherche */}
            {search && (
              <div style={{ marginTop:32, padding:"12px 18px", background:"#F8FAFC", borderRadius:10, fontSize:13, color:"#64748B", textAlign:"center" }}>
                <strong style={{ color:"#0A2540" }}>{filtered.length}</strong> résultat{filtered.length>1?"s":""} pour « <strong style={{ color:"#F7B500" }}>{search}</strong> »
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background:"#05101E", color:"rgba(255,255,255,.25)", padding:"28px", textAlign:"center", fontSize:13 }}>
        © 2026 Business Expert Hub · Tous droits réservés
      </footer>
    </div>
  );
}