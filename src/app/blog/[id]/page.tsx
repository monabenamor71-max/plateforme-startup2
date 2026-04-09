"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft, FaCalendarAlt, FaClock, FaLock, FaEye,
  FaDownload, FaTag, FaChartLine, FaShare, FaBookmark,
  FaLinkedin, FaTwitter, FaFacebook, FaCheckCircle,
  FaFilePdf,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

interface Article {
  id: number;
  titre: string;
  description: string;
  contenu: string;
  type: string;
  categorie: string;
  tags: string[];
  couleur_point: string;
  duree_lecture: string;
  statut: string;
  acces_prive: boolean;
  tres_tendance: boolean;
  image: string;
  fichier_pdf: string;
  vues: number;
  createdAt: string;
}

interface Comment {
  id: number;
  comment: string;
  nom: string;
  email: string;
  createdAt: string;
}

/* ── Mock ── */
const MOCK: Article = {
  id: 1,
  titre: "5 stratégies pour accélérer votre croissance startup",
  description: "La croissance est un objectif clé pour toute startup.",
  contenu: `
    <p>La croissance est un objectif clé pour toute startup. Cependant, atteindre une croissance rapide nécessite une stratégie bien définie.</p>
    <h2>1. Comprendre votre marché</h2>
    <p>Analysez votre cible et identifiez les besoins réels de vos clients pour proposer une offre adaptée.</p>
    <h2>2. Optimiser votre produit</h2>
    <p>Améliorez continuellement votre produit en fonction des retours utilisateurs.</p>
    <h2>3. Mettre en place une stratégie marketing efficace</h2>
    <p>Utilisez le marketing digital pour atteindre un maximum de clients potentiels.</p>
    <ul><li>SEO</li><li>Publicité en ligne</li><li>Réseaux sociaux</li></ul>
    <h2>4. Automatiser vos processus</h2>
    <p>L'automatisation permet de gagner du temps et d'augmenter la productivité.</p>
    <h2>5. S'entourer des bons experts</h2>
    <p>Collaborer avec des experts peut accélérer considérablement votre croissance.</p>
    <blockquote>Une bonne stratégie aujourd'hui vaut mieux qu'une opportunité demain.</blockquote>
  `,
  type: "Article", categorie: "Croissance",
  tags: ["Startup", "Stratégie", "Marketing", "Growth"],
  couleur_point: "#3B82F6", duree_lecture: "5 min",
  statut: "publié", acces_prive: false, tres_tendance: true,
  image: "", fichier_pdf: "guide-croissance-startup.pdf",
  vues: 1240, createdAt: new Date().toISOString(),
};

/* ── Hooks ── */
function useReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setP(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return p;
}

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView] as const;
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(20px)",
      transition: `opacity .6s cubic-bezier(.22,1,.36,1) ${delay}s, transform .6s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN
══════════════════════════════════════════ */
export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle]   = useState<Article | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [pdfUrl, setPdfUrl]     = useState<string | null>(null);
  const [saved, setSaved]       = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [approvedComments, setApprovedComments] = useState<Comment[]>([]);

  /* comment form */
  const [form, setForm]         = useState({ comment: "", nom: "", email: "", site: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [formError, setFormError]   = useState("");

  const progress = useReadingProgress();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${BASE}/articles/public/${id}`, { headers });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setArticle(data);
        if (data.fichier_pdf) checkPdfAccess(data.id);
      } catch {
        setArticle(MOCK);
        setPdfUrl(`${BASE}/uploads/articles-pdf/${MOCK.fichier_pdf}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Charger les commentaires approuvés
  useEffect(() => {
    if (!article?.id) return;
    const loadApprovedComments = async () => {
      try {
        const res = await fetch(`${BASE}/comments/article/${article.id}`);
        if (res.ok) {
          const data = await res.json();
          setApprovedComments(data);
        }
      } catch (error) {
        console.error("Erreur chargement commentaires:", error);
      }
    };
    loadApprovedComments();
  }, [article?.id]);

  const checkPdfAccess = async (articleId: number) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: HeadersInit = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const res  = await fetch(`${BASE}/articles/${articleId}/pdf-access`, { headers });
      const data = await res.json();
      if (data.fichier)      setPdfUrl(`${BASE}/uploads/articles-pdf/${data.fichier}`);
      else if (data.requiresAuth) setPdfUrl("auth_required");
    } catch {
      setPdfUrl(`${BASE}/uploads/articles-pdf/${MOCK.fichier_pdf}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.comment.trim()) { setFormError("Le commentaire est obligatoire."); return; }
    if (!form.nom.trim())     { setFormError("Le nom est obligatoire."); return; }
    if (!form.email.trim())   { setFormError("L'adresse e-mail est obligatoire."); return; }
    setFormError("");
    setSubmitting(true);
    
    try {
      const articleId = article?.id;
      if (!articleId) {
        throw new Error("ID article manquant");
      }
      
      const response = await fetch(`${BASE}/comments/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          comment: form.comment,
          nom: form.nom,
          email: form.email,
          site: form.site || "",
          articleId: articleId,
        }),
      });
      
      const data = await response.json();
      console.log("Réponse du serveur:", data);
      
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi");
      }
      
      setSubmitted(true);
      setForm({ comment: "", nom: "", email: "", site: "" });
    } catch (error) {
      console.error("Erreur:", error);
      setFormError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="ap"><style>{CSS}</style>
      <div className="ap-center-page">
        <div className="ap-spinner" />
        <p className="ap-load-txt">Chargement de l'article…</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !article) return (
    <div className="ap"><style>{CSS}</style>
      <div className="ap-center-page">
        <div style={{ fontSize: 52, marginBottom: 18 }}>📄</div>
        <h1 className="ap-empty-title">{error || "Article non trouvé"}</h1>
        <p className="ap-empty-sub">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
        <Link href="/blog" className="ap-btn-dark"><FaArrowLeft size={12} /> Retour au blog</Link>
      </div>
    </div>
  );

  /* ── Private gate ── */
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (article.acces_prive && !token) return (
    <div className="ap"><style>{CSS}</style>
      <div className="ap-gate-page">
        <div className="ap-gate-card">
          <div className="ap-gate-lock"><FaLock /></div>
          <div className="ap-gate-pill">Accès réservé aux membres</div>
          <h1 className="ap-gate-title">Cet article est réservé<br /><span>aux membres BEH</span></h1>
          <p className="ap-gate-sub">Créez un compte gratuit pour accéder à cet article et à toute notre bibliothèque de ressources exclusives.</p>
          <div className="ap-gate-perks">
            {["Accès à tous les articles premium", "Ressources & outils exclusifs", "Réseau d'experts certifiés"].map((p, i) => (
              <div key={i} className="ap-perk"><FaCheckCircle className="ap-perk-check" />{p}</div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            <Link href="/inscription" className="ap-btn-gold">Créer un compte gratuit</Link>
            <Link href="/connexion"   className="ap-btn-outline">Déjà membre ? Se connecter</Link>
          </div>
          <Link href="/blog" style={{ fontSize: 13, color: "#94A3B8", textDecoration: "none" }}>← Retour au blog</Link>
        </div>
      </div>
    </div>
  );

  const dateFormatted = new Date(article.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="ap">
      <style>{CSS}</style>

      {/* Progress */}
      <div className="ap-progress" style={{ width: `${progress}%` }} />

      {/* ── HERO ── */}
      <div className="ap-hero">
        {article.image
          ? <img src={`${BASE}/uploads/articles-img/${article.image}`} alt={article.titre} className="ap-hero-img"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          : <div className="ap-hero-ph">
              <div className="ap-hero-ph-icon"><FaChartLine /></div>
            </div>
        }
        <div className="ap-hero-ov" />
        <div className="ap-hero-cnt">
          {/* top row */}
          <div className="ap-hero-top">
            <Link href="/blog" className="ap-back">
              <FaArrowLeft size={12} /> Retour aux articles
            </Link>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ position: "relative" }}>
                <button className="ap-act-btn" onClick={() => setShareOpen(!shareOpen)}><FaShare size={13} /></button>
                {shareOpen && (
                  <div className="ap-share-dd">
                    {[
                      { icon: <FaLinkedin />, label: "LinkedIn", href: `https://linkedin.com/shareArticle?url=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}` },
                      { icon: <FaTwitter />,  label: "Twitter",  href: `https://twitter.com/intent/tweet?url=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}` },
                      { icon: <FaFacebook />, label: "Facebook", href: `https://facebook.com/sharer/sharer.php?u=${typeof window !== "undefined" ? encodeURIComponent(window.location.href) : ""}` },
                    ].map((s, i) => (
                      <a key={i} href={s.href} target="_blank" rel="noreferrer" className="ap-share-item">{s.icon}{s.label}</a>
                    ))}
                  </div>
                )}
              </div>
              <button className={`ap-act-btn${saved ? " ap-act-saved" : ""}`} onClick={() => setSaved(!saved)}>
                <FaBookmark size={13} />
              </button>
            </div>
          </div>

          {/* badges */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            <span className="ap-cat-badge" style={{ background: article.couleur_point || "#3B82F6" }}>
              {article.categorie || article.type}
            </span>
            {article.tres_tendance && <span className="ap-trend">🔥 Très tendance</span>}
            {article.acces_prive   && <span className="ap-priv-badge"><FaLock size={9} /> Membres</span>}
          </div>

          <h1 className="ap-hero-title">{article.titre}</h1>

          {/* meta */}
          <div className="ap-meta">
            <div className="ap-author">
              <div className="ap-avatar">BEH</div>
              <div>
                <div className="ap-author-name">Business Expert Hub</div>
                <div className="ap-author-role">Équipe éditoriale</div>
              </div>
            </div>
            <div className="ap-meta-sep" />
            <span className="ap-meta-item"><FaCalendarAlt size={11} />{dateFormatted}</span>
            <span className="ap-meta-item"><FaClock size={11} />{article.duree_lecture || "5 min"} de lecture</span>
            <span className="ap-meta-item"><FaEye size={11} />{article.vues?.toLocaleString()} vues</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="ap-body">

        {/* ── MAIN ── */}
        <main className="ap-main">
          <FadeUp>
            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="ap-tags">
                <FaTag size={11} style={{ color: "#94A3B8", flexShrink: 0 }} />
                {article.tags.map((t, i) => <span key={i} className="ap-tag">{t}</span>)}
              </div>
            )}

            {/* Article content */}
            <div
              className="ap-prose"
              dangerouslySetInnerHTML={{ __html: article.contenu || `<p>${article.description}</p>` }}
            />

            {/* ── PDF DOWNLOAD (inside article, after content) ── */}
            {article.fichier_pdf && (
              <div className="ap-pdf-inline">
                <div className="ap-pdf-inline-left">
                  <div className="ap-pdf-inline-icon"><FaFilePdf /></div>
                  <div>
                    <div className="ap-pdf-inline-title">Télécharger cet article en PDF</div>
                    <div className="ap-pdf-inline-sub">Version complète · Lecture hors ligne · Gratuit</div>
                  </div>
                </div>
                {pdfUrl && pdfUrl !== "auth_required" ? (
                  <a href={pdfUrl} download className="ap-pdf-dl-btn">
                    <FaDownload size={14} /> Télécharger le PDF
                  </a>
                ) : pdfUrl === "auth_required" ? (
                  <Link href="/connexion" className="ap-pdf-dl-btn ap-pdf-dl-locked">
                    <FaLock size={13} /> Se connecter pour télécharger
                  </Link>
                ) : (
                  <a href={`${BASE}/uploads/articles-pdf/${article.fichier_pdf}`} download className="ap-pdf-dl-btn">
                    <FaDownload size={14} /> Télécharger le PDF
                  </a>
                )}
              </div>
            )}
          </FadeUp>

          {/* ── AFFICHAGE DES COMMENTAIRES APPROUVÉS ── */}
          {approvedComments.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#0A2540",
                marginBottom: 20,
                paddingBottom: 10,
                borderBottom: "2px solid #F7B500"
              }}>
                💬 Commentaires ({approvedComments.length})
              </h3>
              {approvedComments.map((comment) => (
                <div key={comment.id} style={{
                  background: "#F8FAFC",
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 12,
                  border: "1px solid #E2E8F0"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#0A2540",
                      color: "#F7B500",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14
                    }}>
                      {comment.nom?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0A2540" }}>{comment.nom}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>
                        {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: 0 }}>
                    {comment.comment}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── COMMENT FORM ── */}
          <FadeUp delay={0.08}>
            <div className="ap-comment-box">
              <h3 className="ap-com-title">Laisser un commentaire</h3>
              <p className="ap-com-notice">
                Votre adresse e-mail ne sera pas publiée. Les champs obligatoires sont indiqués avec <span className="ap-req">*</span>
              </p>

              {submitted ? (
                <div className="ap-com-success">
                  <FaCheckCircle style={{ flexShrink: 0 }} />
                  Votre commentaire a bien été envoyé. Il sera visible après modération.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="ap-com-form" noValidate>
                  {/* Commentaire textarea */}
                  <div className="ap-field">
                    <textarea
                      className="ap-textarea"
                      placeholder={`Commentaire *`}
                      rows={7}
                      value={form.comment}
                      onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                    />
                  </div>

                  {/* Row: Nom / Email / Site */}
                  <div className="ap-fields-row">
                    <input
                      className="ap-input"
                      placeholder="Nom *"
                      value={form.nom}
                      onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                    />
                    <input
                      className="ap-input"
                      type="email"
                      placeholder="Email *"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    />
                    <input
                      className="ap-input"
                      placeholder="Site Web"
                      value={form.site}
                      onChange={e => setForm(p => ({ ...p, site: e.target.value }))}
                    />
                  </div>

                  {formError && <p className="ap-form-error">{formError}</p>}

                  <button type="submit" className="ap-com-submit" disabled={submitting}>
                    {submitting
                      ? <><div className="ap-btn-spin" /> Publication en cours…</>
                      : "Publier le commentaire"
                    }
                  </button>
                </form>
              )}
            </div>
          </FadeUp>
        </main>

        {/* ── SIDEBAR ── */}
        <aside className="ap-sidebar">

          {/* PDF sidebar card */}
          {article.fichier_pdf && (
            <FadeUp>
              <div className="ap-sb-pdf">
                <div className="ap-sb-pdf-glow" />
                <div className="ap-sb-pdf-icon"><FaFilePdf /></div>
                <div className="ap-sb-pdf-tag">Ressource PDF</div>
                <h3 className="ap-sb-pdf-title">Télécharger l'article</h3>
                <p className="ap-sb-pdf-text">
                  Obtenez la version PDF complète pour la lire hors ligne, la partager ou l'imprimer.
                </p>
                {pdfUrl && pdfUrl !== "auth_required" ? (
                  <a href={pdfUrl} download className="ap-sb-pdf-btn">
                    <FaDownload size={14} /> Télécharger le PDF
                  </a>
                ) : pdfUrl === "auth_required" ? (
                  <div className="ap-sb-locked">
                    <FaLock size={13} />
                    <div>
                      <div className="ap-sb-locked-title">Réservé aux membres</div>
                      <Link href="/connexion" className="ap-sb-locked-link">Se connecter →</Link>
                    </div>
                  </div>
                ) : (
                  <a href={`${BASE}/uploads/articles-pdf/${article.fichier_pdf}`} download className="ap-sb-pdf-btn">
                    <FaDownload size={14} /> Télécharger le PDF
                  </a>
                )}
                <div className="ap-sb-pdf-footer">
                  <span>📄 PDF gratuit</span>
                  <span>🔒 Sécurisé</span>
                </div>
              </div>
            </FadeUp>
          )}

          {/* Newsletter */}
          <FadeUp delay={0.08}>
            <div className="ap-sb-nl">
              <div className="ap-sb-nl-icon">✉️</div>
              <h3 className="ap-sb-nl-title">Restez informé</h3>
              <p className="ap-sb-nl-text">
                Recevez chaque semaine les meilleures ressources pour accélérer votre startup.
              </p>
              <Link href="/inscription" className="ap-btn-gold-sm">S'inscrire gratuitement</Link>
            </div>
          </FadeUp>

          {/* Meta */}
          <FadeUp delay={0.12}>
            <div className="ap-sb-meta">
              <div className="ap-sb-meta-title">Informations</div>
              {[
                ["Catégorie", article.categorie, article.couleur_point || "#3B82F6"],
                ["Lecture",   article.duree_lecture || "5 min", null],
                ["Vues",      article.vues?.toLocaleString(), null],
                ["Publié le", dateFormatted, null],
              ].map(([label, val, color], i) => (
                <div key={i} className="ap-sb-meta-row">
                  <span className="ap-sb-meta-label">{label}</span>
                  <span className="ap-sb-meta-val" style={color ? { color: color as string } : {}}>{val}</span>
                </div>
              ))}
            </div>
          </FadeUp>

        </aside>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   CSS
══════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }

  .ap { font-family:'Plus Jakarta Sans',sans-serif; background:#F1F5F9; min-height:100vh; color:#334155; }

  /* Progress bar */
  .ap-progress {
    position:fixed; top:0; left:0; height:3px; z-index:9999;
    background:linear-gradient(90deg,#3B82F6,#F7B500);
    transition:width .1s linear; border-radius:0 2px 2px 0;
  }

  /* Centered pages */
  .ap-center-page {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; min-height:70vh; gap:14px;
    padding:40px 24px; text-align:center;
  }
  .ap-spinner { width:42px; height:42px; border:3px solid #E2E8F0; border-top-color:#F7B500; border-radius:50%; animation:spin .8s linear infinite; }
  .ap-load-txt { color:#94A3B8; font-size:14px; font-weight:500; }
  .ap-empty-title { font-size:26px; font-weight:900; color:#0A2540; margin:0 0 10px; }
  .ap-empty-sub { color:#64748B; margin:0 0 28px; line-height:1.7; max-width:480px; }

  /* Gate */
  .ap-gate-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:60px 24px; background:linear-gradient(135deg,#F8FAFF,#EFF6FF); }
  .ap-gate-card { background:white; border-radius:26px; padding:52px 44px; max-width:500px; width:100%; text-align:center; box-shadow:0 24px 72px rgba(10,37,64,.1); border:1.5px solid rgba(59,130,246,.1); }
  .ap-gate-lock { width:66px; height:66px; border-radius:50%; background:#EFF6FF; color:#3B82F6; display:flex; align-items:center; justify-content:center; font-size:24px; margin:0 auto 16px; border:2px solid rgba(59,130,246,.2); }
  .ap-gate-pill { display:inline-block; background:#EFF6FF; color:#1D4ED8; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase; padding:5px 14px; border-radius:50px; margin-bottom:16px; }
  .ap-gate-title { font-size:25px; font-weight:900; color:#0A2540; line-height:1.2; margin:0 0 12px; }
  .ap-gate-title span { color:#3B82F6; }
  .ap-gate-sub { color:#64748B; font-size:14px; line-height:1.8; margin:0 0 22px; }
  .ap-gate-perks { display:flex; flex-direction:column; gap:9px; background:#F8FAFF; border-radius:14px; padding:18px 22px; margin-bottom:22px; text-align:left; border:1.5px solid rgba(59,130,246,.08); }
  .ap-perk { display:flex; align-items:center; gap:9px; font-size:13px; font-weight:600; color:#334155; }
  .ap-perk-check { color:#22C55E; font-size:14px; flex-shrink:0; }

  /* Hero */
  .ap-hero { position:relative; height:500px; overflow:hidden; }
  .ap-hero-img { width:100%; height:100%; object-fit:cover; }
  .ap-hero-ph { width:100%; height:100%; background:linear-gradient(135deg,#0A2540,#1a3a6e); display:flex; align-items:center; justify-content:center; }
  .ap-hero-ph-icon { width:90px; height:90px; border-radius:26px; background:rgba(59,130,246,.18); border:2px solid rgba(59,130,246,.3); color:#60A5FA; display:flex; align-items:center; justify-content:center; font-size:36px; }
  .ap-hero-ov { position:absolute; inset:0; background:linear-gradient(180deg,rgba(10,37,64,.2) 0%,rgba(10,37,64,.88) 100%); }
  .ap-hero-cnt { position:absolute; inset:0; padding:36px max(5%,32px); display:flex; flex-direction:column; justify-content:space-between; color:white; }
  .ap-hero-top { display:flex; align-items:center; justify-content:space-between; }
  .ap-back { display:inline-flex; align-items:center; gap:8px; color:rgba(255,255,255,.7); text-decoration:none; font-size:13px; font-weight:600; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15); padding:8px 16px; border-radius:8px; transition:all .2s; }
  .ap-back:hover { background:rgba(255,255,255,.2); color:white; }
  .ap-act-btn { width:38px; height:38px; border-radius:10px; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2); color:white; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .2s; }
  .ap-act-btn:hover { background:rgba(255,255,255,.22); }
  .ap-act-saved { background:#F7B500 !important; border-color:#F7B500 !important; color:#0A2540 !important; }
  .ap-share-dd { position:absolute; top:calc(100% + 8px); right:0; background:white; border-radius:12px; overflow:hidden; min-width:155px; z-index:100; box-shadow:0 12px 40px rgba(0,0,0,.15); border:1px solid rgba(0,0,0,.07); }
  .ap-share-item { display:flex; align-items:center; gap:9px; padding:10px 15px; color:#0A2540; text-decoration:none; font-size:13px; font-weight:600; transition:background .15s; }
  .ap-share-item:hover { background:#F8FAFC; }
  .ap-cat-badge { padding:4px 12px; border-radius:99px; font-size:11px; font-weight:800; color:white; }
  .ap-trend { background:#FFF8E1; color:#B45309; padding:4px 12px; border-radius:99px; font-size:11px; font-weight:700; }
  .ap-priv-badge { background:rgba(255,255,255,.15); color:white; padding:4px 12px; border-radius:99px; font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:5px; }
  .ap-hero-title { font-size:clamp(24px,4.5vw,46px); font-weight:900; line-height:1.1; margin:0; max-width:820px; }
  .ap-meta { display:flex; align-items:center; gap:18px; flex-wrap:wrap; }
  .ap-author { display:flex; align-items:center; gap:10px; }
  .ap-avatar { width:40px; height:40px; border-radius:11px; background:#F7B500; color:#0A2540; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900; }
  .ap-author-name { font-size:13px; font-weight:700; color:white; }
  .ap-author-role { font-size:11px; color:rgba(255,255,255,.5); }
  .ap-meta-sep { width:1px; height:20px; background:rgba(255,255,255,.2); }
  .ap-meta-item { display:flex; align-items:center; gap:6px; font-size:13px; color:rgba(255,255,255,.65); font-weight:500; }

  /* Body layout */
  .ap-body { max-width:1200px; margin:0 auto; padding:52px 28px 80px; display:grid; grid-template-columns:minmax(0,1fr) 300px; gap:30px; align-items:start; }
  .ap-main { display:flex; flex-direction:column; gap:24px; }

  /* Tags */
  .ap-tags { display:flex; align-items:center; gap:7px; flex-wrap:wrap; padding-bottom:16px; border-bottom:1.5px solid #E2E8F0; }
  .ap-tag { background:#F1F5F9; color:#475569; padding:4px 12px; border-radius:7px; font-size:12px; font-weight:600; border:1px solid #E2E8F0; }

  /* Prose */
  .ap-prose { background:white; border-radius:20px; padding:44px 50px; box-shadow:0 2px 14px rgba(10,37,64,.05); border:1.5px solid rgba(10,37,64,.06); font-size:16px; line-height:1.85; color:#334155; }
  .ap-prose p { margin:0 0 1.4em; }
  .ap-prose h2 { font-size:20px; font-weight:900; color:#0A2540; margin:2em 0 .7em; padding-bottom:.45em; border-bottom:2.5px solid #F7B500; display:flex; align-items:center; gap:10px; }
  .ap-prose h2::before { content:''; display:inline-block; width:4px; min-height:20px; background:#3B82F6; border-radius:2px; }
  .ap-prose h3 { font-size:17px; font-weight:800; color:#0A2540; margin:1.5em 0 .55em; }
  .ap-prose ul { margin:0 0 1.4em; padding:18px 22px; list-style:none; background:#F8FAFF; border-radius:13px; border:1.5px solid rgba(59,130,246,.1); }
  .ap-prose ul li { display:flex; align-items:flex-start; gap:10px; padding:5px 0; font-size:14.5px; font-weight:500; }
  .ap-prose ul li::before { content:''; display:inline-block; width:7px; height:7px; border-radius:50%; background:#3B82F6; margin-top:7px; flex-shrink:0; }
  .ap-prose blockquote { margin:1.8em 0; padding:26px 30px; border-radius:16px; background:linear-gradient(135deg,#0A2540,#1a3a6e); border-left:none; position:relative; overflow:hidden; }
  .ap-prose blockquote::before { content:'"'; position:absolute; top:-10px; left:18px; font-size:96px; font-weight:900; color:rgba(247,181,0,.14); line-height:1; font-family:Georgia,serif; }
  .ap-prose blockquote p,.ap-prose blockquote { color:white; font-size:16px; font-weight:600; line-height:1.7; font-style:italic; margin:0; }
  .ap-prose a { color:#3B82F6; font-weight:600; }
  .ap-prose strong { color:#0A2540; font-weight:800; }

  /* PDF inline banner */
  .ap-pdf-inline {
    display:flex; align-items:center; justify-content:space-between; gap:16px;
    background:white; border-radius:16px; padding:20px 24px;
    border:1.5px solid rgba(59,130,246,.15);
    box-shadow:0 2px 12px rgba(10,37,64,.05);
  }
  .ap-pdf-inline-left { display:flex; align-items:center; gap:14px; }
  .ap-pdf-inline-icon {
    width:46px; height:46px; border-radius:13px; flex-shrink:0;
    background:#EFF6FF; color:#3B82F6; display:flex; align-items:center; justify-content:center; font-size:20px;
  }
  .ap-pdf-inline-title { font-size:14px; font-weight:800; color:#0A2540; margin-bottom:3px; }
  .ap-pdf-inline-sub { font-size:12px; color:#94A3B8; font-weight:500; }
  .ap-pdf-dl-btn {
    display:inline-flex; align-items:center; gap:8px;
    background:#0A2540; color:#F7B500;
    padding:11px 22px; border-radius:10px;
    text-decoration:none; font-weight:800; font-size:13px;
    white-space:nowrap; flex-shrink:0; transition:all .22s;
  }
  .ap-pdf-dl-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(10,37,64,.2); }
  .ap-pdf-dl-locked { background:#F1F5F9; color:#475569; }

  /* Comment box */
  .ap-comment-box {
    background:white; border-radius:20px; padding:40px 44px;
    border:1.5px solid rgba(10,37,64,.06);
    box-shadow:0 2px 14px rgba(10,37,64,.05);
  }
  .ap-com-title { font-size:22px; font-weight:900; color:#0A2540; margin:0 0 8px; }
  .ap-com-notice { font-size:13px; font-style:italic; color:#64748B; margin:0 0 28px; line-height:1.6; }
  .ap-req { color:#EF4444; font-style:normal; }
  .ap-com-success {
    display:flex; align-items:flex-start; gap:10px;
    background:#F0FDF4; color:#15803D; border:1.5px solid #BBF7D0;
    border-radius:12px; padding:16px 18px; font-size:14px; font-weight:600;
    line-height:1.6;
  }
  .ap-com-form { display:flex; flex-direction:column; gap:16px; }

  .ap-field { display:flex; flex-direction:column; }
  .ap-textarea {
    width:100%; padding:14px 16px; border-radius:10px;
    border:1.5px solid #D1D5DB; font-family:inherit; font-size:14px;
    color:#0A2540; background:#FAFAFA; outline:none; resize:vertical;
    transition:border-color .2s, background .2s;
    box-sizing:border-box;
  }
  .ap-textarea:focus { border-color:#3B82F6; background:white; box-shadow:0 0 0 3px rgba(59,130,246,.1); }
  .ap-textarea::placeholder { color:#9CA3AF; }

  .ap-fields-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }
  .ap-input {
    padding:11px 14px; border-radius:10px;
    border:1.5px solid #D1D5DB; font-family:inherit; font-size:14px;
    color:#0A2540; background:#FAFAFA; outline:none;
    transition:border-color .2s, background .2s;
  }
  .ap-input:focus { border-color:#3B82F6; background:white; box-shadow:0 0 0 3px rgba(59,130,246,.1); }
  .ap-input::placeholder { color:#9CA3AF; }

  .ap-form-error { font-size:13px; color:#EF4444; margin:0; font-weight:600; }

  .ap-com-submit {
    display:inline-flex; align-items:center; gap:9px;
    background:#0A2540; color:#F7B500;
    padding:13px 30px; border-radius:11px; border:none;
    font-family:inherit; font-size:14px; font-weight:800;
    cursor:pointer; align-self:flex-start;
    transition:all .22s;
  }
  .ap-com-submit:hover:not(:disabled) { background:#1a3a6e; transform:translateY(-2px); box-shadow:0 8px 22px rgba(10,37,64,.2); }
  .ap-com-submit:disabled { opacity:.6; cursor:not-allowed; }
  .ap-btn-spin { width:15px; height:15px; border:2px solid rgba(247,181,0,.3); border-top-color:#F7B500; border-radius:50%; animation:spin .7s linear infinite; }

  /* Sidebar */
  .ap-sidebar { position:sticky; top:80px; display:flex; flex-direction:column; gap:16px; }

  /* Sidebar PDF card */
  .ap-sb-pdf { background:linear-gradient(135deg,#0A2540,#1a3a6e); border-radius:20px; padding:26px 24px; color:white; position:relative; overflow:hidden; }
  .ap-sb-pdf-glow { position:absolute; top:0; right:0; width:170px; height:170px; background:radial-gradient(circle,rgba(247,181,0,.13),transparent 70%); pointer-events:none; }
  .ap-sb-pdf-icon { width:48px; height:48px; border-radius:14px; background:rgba(255,255,255,.14); display:flex; align-items:center; justify-content:center; font-size:20px; color:#F7B500; margin-bottom:12px; position:relative; z-index:1; }
  .ap-sb-pdf-tag { display:inline-block; background:rgba(247,181,0,.18); color:#FCD34D; font-size:10px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; padding:3px 10px; border-radius:6px; margin-bottom:10px; position:relative; z-index:1; }
  .ap-sb-pdf-title { font-size:15px; font-weight:900; margin:0 0 8px; position:relative; z-index:1; }
  .ap-sb-pdf-text { font-size:12.5px; color:rgba(255,255,255,.58); line-height:1.65; margin:0 0 18px; position:relative; z-index:1; }
  .ap-sb-pdf-btn { display:flex; align-items:center; justify-content:center; gap:9px; background:#F7B500; color:#0A2540; padding:12px 16px; border-radius:11px; border:none; font-family:inherit; font-size:13px; font-weight:800; cursor:pointer; width:100%; text-decoration:none; transition:all .22s; position:relative; z-index:1; box-sizing:border-box; }
  .ap-sb-pdf-btn:hover { transform:translateY(-2px); box-shadow:0 10px 26px rgba(247,181,0,.38); }
  .ap-sb-locked { display:flex; align-items:center; gap:11px; background:rgba(255,255,255,.1); border:1.5px solid rgba(255,255,255,.18); border-radius:10px; padding:12px 14px; position:relative; z-index:1; color:rgba(255,255,255,.65); font-size:13px; }
  .ap-sb-locked-title { font-weight:700; color:white; font-size:13px; }
  .ap-sb-locked-link { color:#FCD34D; font-size:12px; font-weight:700; text-decoration:none; }
  .ap-sb-pdf-footer { display:flex; justify-content:space-between; margin-top:14px; font-size:11px; color:rgba(255,255,255,.38); font-weight:600; position:relative; z-index:1; }

  /* Sidebar newsletter */
  .ap-sb-nl { background:white; border-radius:18px; padding:22px 20px; border:1.5px solid rgba(10,37,64,.07); text-align:center; }
  .ap-sb-nl-icon { font-size:30px; margin-bottom:9px; }
  .ap-sb-nl-title { font-size:14px; font-weight:900; color:#0A2540; margin:0 0 7px; }
  .ap-sb-nl-text { font-size:12.5px; color:#64748B; line-height:1.65; margin:0 0 15px; }

  /* Sidebar meta */
  .ap-sb-meta { background:white; border-radius:18px; padding:20px; border:1.5px solid rgba(10,37,64,.07); }
  .ap-sb-meta-title { font-size:11px; font-weight:800; color:#0A2540; margin-bottom:14px; text-transform:uppercase; letter-spacing:1.2px; }
  .ap-sb-meta-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #F1F5F9; }
  .ap-sb-meta-row:last-child { border-bottom:none; }
  .ap-sb-meta-label { font-size:12px; color:#94A3B8; font-weight:600; }
  .ap-sb-meta-val { font-size:12.5px; color:#334155; font-weight:700; }

  /* Common buttons */
  .ap-btn-dark { display:inline-flex; align-items:center; gap:8px; background:#0A2540; color:#F7B500; padding:12px 22px; border-radius:10px; text-decoration:none; font-weight:700; font-size:14px; }
  .ap-btn-gold { display:block; text-align:center; background:#F7B500; color:#0A2540; padding:13px 24px; border-radius:12px; text-decoration:none; font-weight:800; font-size:14px; box-shadow:0 6px 18px rgba(247,181,0,.28); transition:all .22s; }
  .ap-btn-gold:hover { transform:translateY(-2px); box-shadow:0 12px 30px rgba(247,181,0,.38); }
  .ap-btn-gold-sm { display:inline-block; background:#F7B500; color:#0A2540; padding:10px 20px; border-radius:9px; text-decoration:none; font-weight:800; font-size:13px; transition:all .2s; }
  .ap-btn-gold-sm:hover { transform:translateY(-2px); }
  .ap-btn-outline { display:block; text-align:center; background:white; color:#0A2540; padding:12px 24px; border-radius:12px; text-decoration:none; font-weight:700; font-size:14px; border:2px solid rgba(10,37,64,.12); transition:all .2s; }
  .ap-btn-outline:hover { border-color:#3B82F6; color:#3B82F6; }

  /* Responsive */
  @media (max-width:960px) {
    .ap-body { grid-template-columns:1fr; }
    .ap-sidebar { position:static; }
    .ap-prose { padding:28px 24px; }
    .ap-comment-box { padding:28px 24px; }
    .ap-hero { height:420px; }
  }
  @media (max-width:640px) {
    .ap-hero { height:380px; }
    .ap-prose { padding:20px 16px; }
    .ap-body { padding:28px 16px 60px; }
    .ap-fields-row { grid-template-columns:1fr; }
    .ap-pdf-inline { flex-direction:column; align-items:flex-start; }
    .ap-comment-box { padding:22px 18px; }
  }
`;