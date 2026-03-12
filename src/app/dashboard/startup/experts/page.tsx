"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaArrowLeft, FaSearch, FaStar, FaEnvelope,
  FaCalendar, FaLinkedin, FaBriefcase, FaSignOutAlt,
} from "react-icons/fa";

/* ══════════════════════════════════════
   DONNÉES FICTIVES DES EXPERTS
   (plus tard viendra de la base de données)
══════════════════════════════════════ */
const EXPERTS = [
  {
    id: 1,
    nom: "Ben Salem",
    prenom: "Karim",
    domaine: "Marketing Digital",
    description: "Expert en stratégie digitale avec 10 ans d'expérience. Spécialisé dans la croissance des startups B2B.",
    note: 4.9,
    avis: 48,
    tarif: "150 DT/h",
    disponible: true,
    tags: ["SEO", "Google Ads", "Social Media"],
    initiales: "KB",
    couleur: "#3B82F6",
  },
  {
    id: 2,
    nom: "Mansour",
    prenom: "Sara",
    domaine: "Finance & Levée de fonds",
    description: "Ancienne directrice financière. Accompagne les startups dans leur levée de fonds et structuration financière.",
    note: 4.8,
    avis: 35,
    tarif: "200 DT/h",
    disponible: true,
    tags: ["Business Plan", "Investissement", "CFO"],
    initiales: "SM",
    couleur: "#A855F7",
  },
  {
    id: 3,
    nom: "Trabelsi",
    prenom: "Ahmed",
    domaine: "Tech & Développement",
    description: "Développeur full-stack senior. Expert en architecture logicielle et transformation digitale.",
    note: 4.7,
    avis: 62,
    tarif: "120 DT/h",
    disponible: false,
    tags: ["React", "Node.js", "Cloud AWS"],
    initiales: "AT",
    couleur: "#22C55E",
  },
  {
    id: 4,
    nom: "Karoui",
    prenom: "Youssef",
    domaine: "RH & Management",
    description: "Consultant RH avec expertise dans la structuration des équipes et la culture d'entreprise.",
    note: 4.6,
    avis: 29,
    tarif: "130 DT/h",
    disponible: true,
    tags: ["Recrutement", "Culture", "Team Building"],
    initiales: "YK",
    couleur: "#F97316",
  },
  {
    id: 5,
    nom: "Bouaziz",
    prenom: "Lina",
    domaine: "Legal & Juridique",
    description: "Avocate spécialisée en droit des affaires et propriété intellectuelle pour startups.",
    note: 4.9,
    avis: 41,
    tarif: "180 DT/h",
    disponible: true,
    tags: ["Contrats", "IP", "RGPD"],
    initiales: "LB",
    couleur: "#F43F5E",
  },
  {
    id: 6,
    nom: "Chaabane",
    prenom: "Omar",
    domaine: "Ventes & Business Dev",
    description: "Expert en développement commercial. A aidé plus de 30 startups à accélérer leurs ventes.",
    note: 4.7,
    avis: 53,
    tarif: "140 DT/h",
    disponible: false,
    tags: ["B2B Sales", "CRM", "Partenariats"],
    initiales: "OC",
    couleur: "#0EA5E9",
  },
];

/* ══════════════════════════════════════
   PAGE EXPERTS
══════════════════════════════════════ */
export default function ExpertsDashboard() {
  const [user, setUser]       = useState<any>(null);
  const [search, setSearch]   = useState("");
  const [filtre, setFiltre]   = useState("Tous");
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { window.location.href = '/connexion'; return; }
    setUser(JSON.parse(userData));
  }, []);

  function logout() {
    localStorage.clear();
    window.location.href = '/';
  }

  const domaines = ["Tous", "Marketing Digital", "Finance & Levée de fonds", "Tech & Développement", "RH & Management", "Legal & Juridique", "Ventes & Business Dev"];

  const filtres = EXPERTS.filter(e => {
    const matchSearch = `${e.prenom} ${e.nom} ${e.domaine}`.toLowerCase().includes(search.toLowerCase());
    const matchFiltre = filtre === "Tous" || e.domaine === filtre;
    return matchSearch && matchFiltre;
  });

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
        .expert-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid #F1F5F9; transition: all .25s; cursor: pointer; }
        .expert-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-3px); }
        .tag { background: #F1F5F9; color: #475569; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600; }
        .filtre-btn { border: 1.5px solid #E2E8F0; border-radius: 20px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; background: white; color: #64748B; transition: all .2s; }
        .filtre-btn.active { background: #0A2540; color: #F7B500; border-color: #0A2540; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: white; border-radius: 20px; padding: 32px; max-width: 560px; width: 100%; max-height: 90vh; overflow-y: auto; }
      `}</style>

      {/* HEADER */}
      <header style={{ background: "#0A2540", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "#F7B500", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#0A2540", fontWeight: 900, fontSize: 13 }}>BEH</div>
          <span style={{ color: "white", fontWeight: 700 }}>Business Expert Hub</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Bonjour, <strong style={{ color: "white" }}>{user.prenom}</strong></span>
          <button onClick={logout} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: "8px 16px", color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700 }}>
            <FaSignOutAlt /> Déconnexion
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* RETOUR + TITRE */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/dashboard/startup" style={{ background: "white", border: "1px solid #E2E8F0", borderRadius: 10, padding: "8px 12px", color: "#0A2540", textDecoration: "none", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700 }}>
            <FaArrowLeft /> Retour
          </Link>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0A2540", margin: 0 }}>Nos Experts</h1>
            <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>{filtres.length} expert(s) disponible(s)</p>
          </div>
        </div>

        {/* RECHERCHE */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <FaSearch style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input
            type="text"
            placeholder="Rechercher un expert par nom ou domaine..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "14px 16px 14px 44px", border: "1.5px solid #E2E8F0", borderRadius: 12, fontSize: 14, outline: "none", background: "white" }}
          />
        </div>

        {/* FILTRES */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {domaines.map(d => (
            <button key={d} className={`filtre-btn${filtre === d ? " active" : ""}`} onClick={() => setFiltre(d)}>
              {d}
            </button>
          ))}
        </div>

        {/* GRILLE EXPERTS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {filtres.map(expert => (
            <div key={expert.id} className="expert-card" onClick={() => setSelected(expert)}>

              {/* Avatar + Nom */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: expert.couleur, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 18, flexShrink: 0 }}>
                  {expert.initiales}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: "#0A2540", margin: "0 0 2px" }}>{expert.prenom} {expert.nom}</h3>
                  <p style={{ fontSize: 13, color: "#64748B", margin: 0, fontWeight: 600 }}>{expert.domaine}</p>
                </div>
                <div style={{ background: expert.disponible ? "#F0FDF4" : "#FFF1F2", color: expert.disponible ? "#16A34A" : "#DC2626", borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>
                  {expert.disponible ? "✅ Disponible" : "❌ Occupé"}
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6, marginBottom: 14 }}>
                {expert.description.substring(0, 100)}...
              </p>

              {/* Tags */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {expert.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>

              {/* Note + Tarif */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #F1F5F9", paddingTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FaStar style={{ color: "#F7B500" }} />
                  <span style={{ fontWeight: 900, color: "#0A2540", fontSize: 14 }}>{expert.note}</span>
                  <span style={{ color: "#94A3B8", fontSize: 12 }}>({expert.avis} avis)</span>
                </div>
                <span style={{ fontWeight: 900, color: "#0A2540", fontSize: 14 }}>{expert.tarif}</span>
              </div>

              {/* Bouton voir profil */}
              <button
                style={{ width: "100%", marginTop: 14, background: "#0A2540", color: "#F7B500", border: "none", borderRadius: 10, padding: "10px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                onClick={e => { e.stopPropagation(); setSelected(expert); }}
              >
                Voir le profil complet →
              </button>
            </div>
          ))}
        </div>

        {/* Aucun résultat */}
        {filtres.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ color: "#0A2540", fontWeight: 900 }}>Aucun expert trouvé</h3>
            <p style={{ color: "#94A3B8" }}>Essayez un autre terme de recherche</p>
          </div>
        )}
      </main>

      {/* MODAL PROFIL COMPLET */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>

            {/* Header modal */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: selected.couleur, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 22 }}>
                {selected.initiales}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0A2540", margin: "0 0 4px" }}>{selected.prenom} {selected.nom}</h2>
                <p style={{ color: "#64748B", margin: 0, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <FaBriefcase style={{ color: selected.couleur }} /> {selected.domaine}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontWeight: 700, color: "#64748B" }}>✕</button>
            </div>

            {/* Statut */}
            <div style={{ background: selected.disponible ? "#F0FDF4" : "#FFF1F2", borderRadius: 10, padding: "10px 16px", marginBottom: 20, color: selected.disponible ? "#16A34A" : "#DC2626", fontWeight: 700, fontSize: 14 }}>
              {selected.disponible ? "✅ Disponible pour de nouvelles missions" : "❌ Actuellement non disponible"}
            </div>

            {/* Description complète */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ color: "#0A2540", fontWeight: 800, marginBottom: 8 }}>À propos</h4>
              <p style={{ color: "#64748B", lineHeight: 1.7, fontSize: 14 }}>{selected.description}</p>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ color: "#0A2540", fontWeight: 800, marginBottom: 8 }}>Compétences</h4>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {selected.tags.map((tag: string) => (
                  <span key={tag} className="tag" style={{ background: "#EFF6FF", color: "#3B82F6" }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Note + Tarif */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 1, background: "#FFFBEB", borderRadius: 12, padding: "16px", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
                  <FaStar style={{ color: "#F7B500" }} />
                  <span style={{ fontSize: 22, fontWeight: 900, color: "#0A2540" }}>{selected.note}</span>
                </div>
                <p style={{ color: "#94A3B8", fontSize: 12, margin: 0 }}>{selected.avis} avis clients</p>
              </div>
              <div style={{ flex: 1, background: "#F0F9FF", borderRadius: 12, padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#0A2540", marginBottom: 4 }}>{selected.tarif}</div>
                <p style={{ color: "#94A3B8", fontSize: 12, margin: 0 }}>Tarif horaire</p>
              </div>
            </div>

            {/* Boutons action */}
            <div style={{ display: "flex", gap: 12 }}>
              <Link
                href="/dashboard/startup/rendez-vous"
                style={{ flex: 1, background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 900, cursor: "pointer", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <FaCalendar /> Prendre RDV
              </Link>
              <Link
                href="/dashboard/startup/messages"
                style={{ flex: 1, background: "#0A2540", color: "white", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 900, cursor: "pointer", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <FaEnvelope /> Envoyer message
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}