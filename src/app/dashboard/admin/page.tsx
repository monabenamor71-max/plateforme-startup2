// app/dashboard/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BASE = "http://localhost:3001";
type Tab = "experts" | "startups" | "users" | "temoignages" | "contacts" | "histoire" | "blog" | "commentaires" | "formations" | "demandes";

function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? "#F7B500" : "#E2E8F0", fontSize: size }}>★</span>
      ))}
    </div>
  );
}

export default function DashboardAdmin() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("experts");

  // Data
  const [experts, setExperts] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [contactMsgs, setContactMsgs] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);

  // Stats
  const [nbExperts, setNbExperts] = useState<number>(0);
  const [nbStartups, setNbStartups] = useState<number>(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ text: "", ok: true });
  const [selected, setSelected] = useState<any>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [articleForm, setArticleForm] = useState<any>({
    titre: "", description: "", contenu: "", type: "article",
    categorie: "", tags: "", duree_lecture: "", statut: "brouillon", image: "",
  });
  const [articleImageFile, setArticleImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  // Formations
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [editingFormation, setEditingFormation] = useState<any>(null);
  const [formationForm, setFormationForm] = useState({
    titre: "",
    description: "",
    domaine: "",
    formateur: "",
    type: "payant",
    prix: "",
    places_limitees: false,
    places_disponibles: "",
    duree: "",
    mode: "en_ligne",
    localisation: "",
    certifiante: false,
    statut: "brouillon",
    a_la_une: false,
  });
  const [formationImageFile, setFormationImageFile] = useState<File | null>(null);
  const [formationImagePreview, setFormationImagePreview] = useState("");

  // Histoire / À propos
  const [hForm, setHForm] = useState<any>({});
  const [savingH, setSavingH] = useState(false);

  // Contact reply modal
  const [replyModal, setReplyModal] = useState<{ open: boolean; messageId: number; email: string; nom: string; prenom: string }>({
    open: false, messageId: 0, email: "", nom: "", prenom: "",
  });
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Demandes service – réponse
  const [replyDemandeModal, setReplyDemandeModal] = useState<{ open: boolean; demandeId: number; startupNom: string; email: string }>({
    open: false, demandeId: 0, startupNom: "", email: "",
  });
  const [replyDemandeText, setReplyDemandeText] = useState("");
  const [sendingReplyDemande, setSendingReplyDemande] = useState(false);

  const tk = () => (typeof window !== "undefined" ? localStorage.getItem("token") || "" : "");
  const hdr = () => ({ Authorization: `Bearer ${tk()}` });
  const hdrJ = () => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" });

  function notify(text: string, ok = true) {
    setToast({ text, ok });
    setTimeout(() => setToast({ text: "", ok: true }), 3200);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.replace("/connexion");
      return;
    }
    try {
      const user = JSON.parse(raw);
      if (user.role !== "admin") {
        router.replace("/");
        return;
      }
      loadAll();
      loadHistoire();
      loadArticles();
      loadComments();
      loadContactMessages();
      loadStats();
      loadFormations();
      loadDemandes();
    } catch (e) {
      router.replace("/connexion");
    }
  }, [router]);

  async function loadStats() {
    try {
      const [e, s] = await Promise.all([
        fetch(`${BASE}/experts/liste`).then(r => (r.ok ? r.json() : [])),
        fetch(`${BASE}/startups/liste`).then(r => (r.ok ? r.json() : [])),
      ]);
      setNbExperts(Array.isArray(e) ? e.length : 0);
      setNbStartups(Array.isArray(s) ? s.length : 0);
    } catch {}
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [e, s, u, t] = await Promise.all([
        fetch(`${BASE}/admin/experts`, { headers: hdr() }).then(r => r.json()),
        fetch(`${BASE}/admin/startups`, { headers: hdr() }).then(r => r.json()),
        fetch(`${BASE}/admin/users`, { headers: hdr() }).then(r => r.json()),
        fetch(`${BASE}/temoignages/all`, { headers: hdr() }).then(r => r.json()),
      ]);
      setExperts(Array.isArray(e) ? e : []);
      setStartups(Array.isArray(s) ? s : []);
      setUsers(Array.isArray(u) ? u.filter((usr: any) => usr.role !== "admin") : []);
      setTemoignages(Array.isArray(t) ? t : []);
    } catch {}
    setLoading(false);
  }

  async function loadFormations() {
    try {
      const r = await fetch(`${BASE}/formations/admin/all`, { headers: hdr() });
      if (r.ok) setFormations(await r.json());
    } catch {}
  }

  async function loadDemandes() {
    try {
      const r = await fetch(`${BASE}/demandes-service/all`, { headers: hdr() });
      if (r.ok) {
        const data = await r.json();
        setDemandes(Array.isArray(data) ? data : []);
      } else {
        console.error("Erreur chargement demandes", await r.text());
      }
    } catch (e) {
      console.error("Erreur réseau loadDemandes", e);
    }
  }

  async function loadHistoire() {
    try {
      const r = await fetch(`${BASE}/histoire`);
      if (r.ok) setHForm(await r.json());
    } catch {}
  }

  async function loadArticles() {
    try {
      const r = await fetch(`${BASE}/articles/admin/all`, { headers: hdr() });
      if (r.ok) setArticles(await r.json());
    } catch {}
  }

  async function loadComments() {
    try {
      const r = await fetch(`${BASE}/comments/admin/en-attente`, { headers: hdr() });
      if (r.ok) setComments(await r.json());
    } catch {}
  }

  async function loadContactMessages() {
    try {
      const r = await fetch(`${BASE}/contact/admin/messages`, { headers: hdr() });
      if (r.ok) setContactMsgs(await r.json());
    } catch {}
  }

  // Formations CRUD
  async function sauvegarderFormation(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formationForm).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, String(v));
    });
    if (formationImageFile) fd.append("image", formationImageFile);
    const url = editingFormation ? `${BASE}/formations/admin/${editingFormation.id}` : `${BASE}/formations/admin/create`;
    const method = editingFormation ? "PUT" : "POST";
    const r = await fetch(url, { method, headers: hdr(), body: fd });
    if (r.ok) {
      notify(editingFormation ? "✅ Formation modifiée !" : "✅ Formation créée !");
      setShowFormationModal(false);
      resetFormationForm();
      loadFormations();
    } else notify("Erreur", false);
  }

  async function publierFormation(id: number) {
    const r = await fetch(`${BASE}/formations/admin/${id}/statut`, {
      method: "PATCH",
      headers: hdrJ(),
      body: JSON.stringify({ statut: "publie" }),
    });
    if (r.ok) {
      notify("✅ Formation publiée !");
      loadFormations();
    } else notify("Erreur", false);
  }

  async function archiverFormation(id: number) {
    const r = await fetch(`${BASE}/formations/admin/${id}/statut`, {
      method: "PATCH",
      headers: hdrJ(),
      body: JSON.stringify({ statut: "archive" }),
    });
    if (r.ok) {
      notify("📦 Formation archivée");
      loadFormations();
    } else notify("Erreur", false);
  }

  async function supprimerFormation(id: number) {
    if (!confirm("Supprimer cette formation ?")) return;
    const r = await fetch(`${BASE}/formations/admin/${id}`, { method: "DELETE", headers: hdr() });
    if (r.ok) {
      notify("Supprimé");
      loadFormations();
    } else notify("Erreur", false);
  }

  function resetFormationForm() {
    setEditingFormation(null);
    setFormationImageFile(null);
    setFormationImagePreview("");
    setFormationForm({
      titre: "",
      description: "",
      domaine: "",
      formateur: "",
      type: "payant",
      prix: "",
      places_limitees: false,
      places_disponibles: "",
      duree: "",
      mode: "en_ligne",
      localisation: "",
      certifiante: false,
      statut: "brouillon",
      a_la_une: false,
    });
  }

  function ouvrirAjoutFormation() {
    resetFormationForm();
    setShowFormationModal(true);
  }

  function ouvrirEditionFormation(f: any) {
    setEditingFormation(f);
    setFormationForm({
      titre: f.titre || "",
      description: f.description || "",
      domaine: f.domaine || "",
      formateur: f.formateur || "",
      type: f.type || "payant",
      prix: f.prix || "",
      places_limitees: f.places_limitees || false,
      places_disponibles: f.places_disponibles || "",
      duree: f.duree || "",
      mode: f.mode || "en_ligne",
      localisation: f.localisation || "",
      certifiante: f.certifiante || false,
      statut: f.statut || "brouillon",
      a_la_une: f.a_la_une || false,
    });
    if (f.image) setFormationImagePreview(`${BASE}/uploads/formations/${f.image}`);
    setShowFormationModal(true);
  }

  // Demandes service (génériques)
  async function repondreDemande(demandeId: number, reponse: string) {
    const r = await fetch(`${BASE}/demandes-service/admin/${demandeId}/repondre`, {
      method: "POST",
      headers: hdrJ(),
      body: JSON.stringify({ reponse }),
    });
    if (r.ok) {
      notify("✅ Réponse envoyée !");
      loadDemandes();
    } else notify("Erreur", false);
  }

  // NOUVELLES FONCTIONS pour les demandes de formation
  async function accepterDemandeFormation(demandeId: number) {
    try {
      const r = await fetch(`${BASE}/demandes-service/formation/${demandeId}/accept`, {
        method: "PATCH",
        headers: hdrJ(),
      });
      const data = await r.json();
      if (r.ok) {
        notify("✅ Demande acceptée, place réservée !");
        loadDemandes();
        loadFormations(); // Met à jour les places disponibles
      } else {
        notify(data.message || `Erreur ${r.status}`, false);
      }
    } catch (err) {
      console.error("Erreur réseau", err);
      notify("Erreur de connexion au serveur", false);
    }
  }

  async function refuserDemandeFormation(demandeId: number) {
    try {
      const r = await fetch(`${BASE}/demandes-service/formation/${demandeId}/reject`, {
        method: "PATCH",
        headers: hdrJ(),
      });
      const data = await r.json();
      if (r.ok) {
        notify("❌ Demande refusée");
        loadDemandes();
      } else {
        notify(data.message || `Erreur ${r.status}`, false);
      }
    } catch (err) {
      notify("Erreur de connexion", false);
    }
  }

  async function changerStatutDemande(demandeId: number, statut: string) {
    const r = await fetch(`${BASE}/demandes-service/admin/${demandeId}/statut`, {
      method: "PATCH",
      headers: hdrJ(),
      body: JSON.stringify({ statut }),
    });
    if (r.ok) {
      notify(`Statut mis à jour : ${statut}`);
      loadDemandes();
    } else notify("Erreur", false);
  }

  // Histoire
  async function saveHistoire(e: React.FormEvent) {
    e.preventDefault();
    setSavingH(true);
    try {
      const r = await fetch(`${BASE}/histoire`, {
        method: "PUT",
        headers: hdrJ(),
        body: JSON.stringify(hForm),
      });
      if (r.ok) {
        notify("✅ Page À propos mise à jour !");
        loadHistoire();
      } else notify("Erreur sauvegarde", false);
    } catch {
      notify("Erreur réseau", false);
    }
    setSavingH(false);
  }

  function hf(key: string) {
    return hForm[key] || "";
  }
  function setHF(key: string, val: string) {
    setHForm((p: any) => ({ ...p, [key]: val }));
  }

  // Experts / Startups / Users / Témoignages / Contact / Blog / Commentaires (inchangés)
  async function valider(type: string, id: number) {
    const r = await fetch(`${BASE}/admin/${type}/${id}/valider`, { method: "PATCH", headers: hdr() });
    if (r.ok) {
      notify("✅ Validé !");
      setSelected(null);
      loadAll();
    } else notify("Erreur", false);
  }
  async function refuser(type: string, id: number) {
    const r = await fetch(`${BASE}/admin/${type}/${id}/refuser`, { method: "PATCH", headers: hdr() });
    if (r.ok) {
      notify("❌ Refusé.");
      setSelected(null);
      loadAll();
    } else notify("Erreur", false);
  }
  async function validerModification(id: number) {
    const r = await fetch(`${BASE}/experts/${id}/valider-modification`, { method: "PATCH", headers: hdr() });
    if (r.ok) {
      notify("✅ Modification validée !");
      loadAll();
    } else notify("Erreur", false);
  }
  async function refuserModification(id: number) {
    const r = await fetch(`${BASE}/experts/${id}/refuser-modification`, { method: "PATCH", headers: hdr() });
    if (r.ok) {
      notify("Modification refusée");
      loadAll();
    } else notify("Erreur", false);
  }
  async function supprimerUser(id: number) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    const r = await fetch(`${BASE}/admin/users/${id}`, { method: "DELETE", headers: hdr() });
    if (r.ok) {
      notify("✅ Utilisateur supprimé");
      loadAll();
    } else notify("Erreur", false);
  }
  async function validerTemo(id: number) {
    const r = await fetch(`${BASE}/temoignages/${id}/valider`, { method: "PATCH", headers: hdr() });
    if (r.ok) {
      notify("✅ Témoignage publié !");
      loadAll();
    } else notify("Erreur", false);
  }
  async function refuserTemo(id: number) {
    const r = await fetch(`${BASE}/temoignages/${id}/refuser`, { method: "PATCH", headers: hdr() });
    if (r.ok) {
      notify("Témoignage refusé");
      loadAll();
    } else notify("Erreur", false);
  }
  async function supprimerTemo(id: number) {
    if (!confirm("Supprimer ce témoignage ?")) return;
    const r = await fetch(`${BASE}/temoignages/${id}`, { method: "DELETE", headers: hdr() });
    if (r.ok) {
      notify("Supprimé");
      loadAll();
    } else notify("Erreur", false);
  }
  async function marquerLu(id: number) {
    const r = await fetch(`${BASE}/contact/admin/messages/${id}/lu`, { method: "PATCH", headers: hdr() });
    if (r.ok) {
      notify("✅ Marqué lu");
      loadContactMessages();
    } else notify("Erreur", false);
  }
  async function supprimerMessage(id: number) {
    if (!confirm("Supprimer ce message ?")) return;
    const r = await fetch(`${BASE}/contact/admin/messages/${id}`, { method: "DELETE", headers: hdr() });
    if (r.ok) {
      notify("✅ Supprimé");
      loadContactMessages();
    } else notify("Erreur", false);
  }
  async function envoyerReponse(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) {
      notify("Écrivez une réponse", false);
      return;
    }
    setSendingReply(true);
    try {
      const r = await fetch(`${BASE}/contact/admin/messages/${replyModal.messageId}/repondre`, {
        method: "POST",
        headers: hdrJ(),
        body: JSON.stringify({ reponse: replyText }),
      });
      if (r.ok) {
        notify("✅ Réponse envoyée !");
        setReplyModal({ open: false, messageId: 0, email: "", nom: "", prenom: "" });
        setReplyText("");
        loadContactMessages();
      } else notify("Erreur envoi", false);
    } catch {
      notify("Erreur", false);
    }
    setSendingReply(false);
  }

  // Blog
  function resetArticleForm() {
    setEditingArticle(null);
    setArticleImageFile(null);
    setImagePreview("");
    setArticleForm({
      titre: "",
      description: "",
      contenu: "",
      type: "article",
      categorie: "",
      tags: "",
      duree_lecture: "",
      statut: "brouillon",
      image: "",
    });
  }
  function ouvrirEditionArticle(a: any) {
    setEditingArticle(a);
    setArticleForm({
      titre: a.titre || "",
      description: a.description || "",
      contenu: a.contenu || "",
      type: a.type || "article",
      categorie: a.categorie || "",
      tags: Array.isArray(a.tags) ? a.tags.join(", ") : a.tags || "",
      duree_lecture: a.duree_lecture || "",
      statut: a.statut || "brouillon",
      image: a.image || "",
    });
    if (a.image) setImagePreview(`${BASE}/uploads/articles-img/${a.image}`);
    setShowArticleModal(true);
  }
  async function sauvegarderArticle(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(articleForm).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, String(v));
    });
    if (articleImageFile) fd.append("image", articleImageFile);
    const url = editingArticle ? `${BASE}/articles/admin/${editingArticle.id}` : `${BASE}/articles/admin/create`;
    const method = editingArticle ? "PUT" : "POST";
    const r = await fetch(url, { method, headers: hdr(), body: fd });
    if (r.ok) {
      notify(editingArticle ? "✅ Article modifié !" : "✅ Article créé !");
      setShowArticleModal(false);
      resetArticleForm();
      loadArticles();
    } else notify("Erreur", false);
  }
  async function publierArticle(id: number) {
    const r = await fetch(`${BASE}/articles/admin/${id}/publier`, { method: "PATCH", headers: hdr() });
    if (r.ok) {
      notify("✅ Article publié !");
      loadArticles();
    } else notify("Erreur", false);
  }
  async function supprimerArticle(id: number) {
    if (!confirm("Supprimer cet article ?")) return;
    const r = await fetch(`${BASE}/articles/admin/${id}`, { method: "DELETE", headers: hdr() });
    if (r.ok) {
      notify("Supprimé");
      loadArticles();
    } else notify("Erreur", false);
  }

  // Commentaires
  async function approuverComment(id: number) {
    const r = await fetch(`${BASE}/comments/admin/${id}/approuver`, { method: "PATCH", headers: hdr() });
    if (r.ok) {
      notify("✅ Approuvé !");
      loadComments();
    } else notify("Erreur", false);
  }
  async function refuserComment(id: number) {
    const r = await fetch(`${BASE}/comments/admin/${id}/refuser`, { method: "PATCH", headers: hdr() });
    if (r.ok) {
      notify("❌ Refusé");
      loadComments();
    } else notify("Erreur", false);
  }
  async function supprimerComment(id: number) {
    if (!confirm("Supprimer ce commentaire ?")) return;
    const r = await fetch(`${BASE}/comments/admin/${id}`, { method: "DELETE", headers: hdr() });
    if (r.ok) {
      notify("🗑 Supprimé");
      loadComments();
    } else notify("Erreur", false);
  }

  function Avatar({ nom, prenom, photo, size = 38 }: any) {
    const [err, setErr] = useState(false);
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid #F7B500" }}>
        {photo && !err ? (
          <img src={`${BASE}/uploads/photos/${photo}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setErr(true)} />
        ) : (
          <span style={{ color: "#F7B500", fontWeight: 800, fontSize: size * 0.35 }}>
            {(prenom?.[0] || "") + (nom?.[0] || "")}
          </span>
        )}
      </div>
    );
  }

  const enAttenteExperts = experts.filter(e => e.statut === "en_attente");
  const enAttenteStartups = startups.filter(s => s.statut === "en_attente");
  const modificationsAttente = experts.filter(e => e.modification_demandee);
  const temosAttente = temoignages.filter(t => t.statut === "en_attente");
  const msgsNonLus = contactMsgs.filter(m => !m.is_read).length;
  const brouillons = articles.filter(a => a.statut === "brouillon").length;
  const formationsBrouillons = formations.filter(f => f.statut === "brouillon").length;
  const demandesEnAttente = demandes.filter(d => d.statut === "en_attente").length;
  const totalAttente = enAttenteExperts.length + enAttenteStartups.length + demandesEnAttente;

  const S = { background: "#fff", border: "1px solid #E8EEF6", borderRadius: 14, padding: "20px 22px", marginBottom: 16 };
  const secTitle = (icon: string, text: string) => (
    <div style={{ fontWeight: 700, color: "#0A2540", fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, paddingBottom: 10, borderBottom: "1px solid #F1F5F9" }}>
      <span style={{ fontSize: 18 }}>{icon}</span> {text}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Outfit',sans-serif;background:#F2F5F9;}
        .card{background:#fff;border:1px solid #E8EEF6;border-radius:16px;}
        .btn{font-family:'Outfit',sans-serif;font-weight:600;border:none;border-radius:8px;cursor:pointer;padding:9px 18px;font-size:13px;transition:all .18s;display:inline-flex;align-items:center;gap:6px;}
        .btn-green{background:#ECFDF5;color:#059669;}.btn-green:hover{background:#059669;color:#fff;}
        .btn-red{background:#FEF2F2;color:#DC2626;}.btn-red:hover{background:#DC2626;color:#fff;}
        .btn-blue{background:#EFF6FF;color:#1D4ED8;}.btn-blue:hover{background:#1D4ED8;color:#fff;}
        .btn-gray{background:#F1F5F9;color:#475569;}.btn-gray:hover{background:#E2E8F0;}
        .btn-gold{background:#FFF8E1;color:#B45309;}.btn-gold:hover{background:#F7B500;color:#0A2540;}
        .badge-wait{background:#FFF8E1;color:#B45309;border:1px solid #F7B500;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .badge-ok{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .badge-no{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .badge-modif{background:#FFF8E1;color:#B45309;border:1px solid #F7B500;border-radius:99px;padding:2px 8px;font-size:10px;font-weight:700;}
        .tab{background:none;border:none;cursor:pointer;padding:13px 4px;font-size:13px;font-weight:500;color:#7D8FAA;border-bottom:2px solid transparent;font-family:'Outfit',sans-serif;transition:all .2s;white-space:nowrap;}
        .tab.active{color:#0A2540;border-bottom-color:#F7B500;font-weight:700;}
        table{width:100%;border-collapse:collapse;}
        th{text-align:left;font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;padding:10px 16px;border-bottom:2px solid #F1F5F9;}
        td{padding:12px 16px;border-bottom:1px solid #F7F9FC;font-size:13.5px;color:#0A2540;vertical-align:middle;}
        tr:last-child td{border-bottom:none;}
        tr:hover td{background:#FAFBFE;}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.5);z-index:200;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px);}
        .modal{background:#fff;border-radius:20px;width:100%;max-width:760px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(10,37,64,.2);}
        .info-row{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #F1F5F9;}
        .info-lbl{font-size:11px;color:#8A9AB5;font-weight:700;text-transform:uppercase;width:130px;flex-shrink:0;padding-top:2px;}
        .info-val{font-size:14px;color:#0A2540;font-weight:500;word-break:break-word;}
        .file-link{background:#EFF6FF;color:#1D4ED8;border-radius:8px;padding:6px 14px;font-size:13px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:6px;}
        .file-link:hover{background:#1D4ED8;color:#fff;}
        .inp{width:100%;padding:11px 13px;border:1.5px solid #E2E8F0;border-radius:10px;font-family:'Outfit',sans-serif;font-size:13px;transition:border-color .2s;background:#FAFBFE;}
        .inp:focus{outline:none;border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.1);}
        .lbl{font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:5px;}
        .fg{margin-bottom:12px;}
        .bo{background:#ECFDF5;color:#059669;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .bw{background:#FFF8E1;color:#B45309;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .ba{background:#F1F5F9;color:#64748B;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
      `}</style>

      {/* Toast */}
      {toast.text && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: toast.ok ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${toast.ok ? "#A7F3D0" : "#FECACA"}`, borderLeft: `3px solid ${toast.ok ? "#059669" : "#DC2626"}`, color: toast.ok ? "#059669" : "#DC2626", borderRadius: 10, padding: "12px 18px", fontWeight: 600, fontSize: 13, boxShadow: "0 8px 24px rgba(0,0,0,.1)" }}>
          {toast.text}
        </div>
      )}

      {/* Modal Formation */}
      {showFormationModal && (
        <div className="modal-bg" onClick={() => { setShowFormationModal(false); resetFormationForm(); }}>
          <div className="modal" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFE" }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>
                {editingFormation ? "✏️ Modifier la formation" : "➕ Nouvelle formation"}
              </span>
              <button className="btn btn-gray" onClick={() => { setShowFormationModal(false); resetFormationForm(); }}>✕</button>
            </div>
            <form onSubmit={sauvegarderFormation} style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1/-1" }} className="fg">
                  <label className="lbl">Titre *</label>
                  <input className="inp" required value={formationForm.titre} onChange={e => setFormationForm({ ...formationForm, titre: e.target.value })} />
                </div>
                <div className="fg"><label className="lbl">Domaine *</label>
                  <select className="inp" value={formationForm.domaine} onChange={e => setFormationForm({ ...formationForm, domaine: e.target.value })} required>
                    <option value="">Sélectionner un domaine</option>
                    <option value="Marketing">📢 Marketing</option>
                    <option value="Finance">💰 Finance</option>
                    <option value="IA & Digital">🤖 IA & Digital</option>
                    <option value="RH & Organisation">👥 RH & Organisation</option>
                    <option value="Stratégie">🎯 Stratégie</option>
                    <option value="Management">📊 Management</option>
                    <option value="Droit & Conformité">⚖️ Droit & Conformité</option>
                    <option value="Entrepreneuriat">🚀 Entrepreneuriat</option>
                  </select>
                </div>
                <div className="fg"><label className="lbl">Formateur</label><input className="inp" value={formationForm.formateur} onChange={e => setFormationForm({ ...formationForm, formateur: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Statut</label>
                  <select className="inp" value={formationForm.statut} onChange={e => setFormationForm({ ...formationForm, statut: e.target.value })}>
                    <option value="brouillon">📝 Brouillon</option>
                    <option value="publie">✅ Publié</option>
                    <option value="archive">📦 Archivé</option>
                  </select>
                </div>
                <div className="fg"><label className="lbl">Type de tarif</label>
                  <select className="inp" value={formationForm.type} onChange={e => setFormationForm({ ...formationForm, type: e.target.value })}>
                    <option value="gratuit">🎁 Gratuit</option>
                    <option value="payant">💰 Payant</option>
                  </select>
                </div>
                {formationForm.type === "payant" && (
                  <div className="fg"><label className="lbl">Prix (DT)</label><input className="inp" value={formationForm.prix} onChange={e => setFormationForm({ ...formationForm, prix: e.target.value })} /></div>
                )}
                <div className="fg"><label className="lbl">Mode</label>
                  <select className="inp" value={formationForm.mode} onChange={e => setFormationForm({ ...formationForm, mode: e.target.value })}>
                    <option value="en_ligne">💻 En ligne</option>
                    <option value="presentiel">🏢 Présentiel</option>
                  </select>
                </div>
                {formationForm.mode === "presentiel" && (
                  <div className="fg"><label className="lbl">Localisation</label><input className="inp" value={formationForm.localisation} onChange={e => setFormationForm({ ...formationForm, localisation: e.target.value })} /></div>
                )}
                <div className="fg"><label className="lbl">Durée</label><input className="inp" value={formationForm.duree} onChange={e => setFormationForm({ ...formationForm, duree: e.target.value })} /></div>
                <div className="fg"><div style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="checkbox" checked={formationForm.certifiante} onChange={e => setFormationForm({ ...formationForm, certifiante: e.target.checked })} /><label>Certifiante</label></div></div>
                <div className="fg"><div style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="checkbox" checked={formationForm.places_limitees} onChange={e => setFormationForm({ ...formationForm, places_limitees: e.target.checked })} /><label>Places limitées</label></div></div>
                {formationForm.places_limitees && (
                  <div className="fg"><label className="lbl">Places disponibles</label><input className="inp" type="number" value={formationForm.places_disponibles} onChange={e => setFormationForm({ ...formationForm, places_disponibles: e.target.value })} /></div>
                )}
                <div style={{ gridColumn: "1/-1" }} className="fg"><label className="lbl">Description *</label><textarea className="inp" required rows={4} value={formationForm.description} onChange={e => setFormationForm({ ...formationForm, description: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Image</label><div style={{ border: "1.5px dashed #DDE4EF", borderRadius: 10, padding: 14, background: "#F7F9FC", position: "relative", cursor: "pointer" }}><input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setFormationImageFile(e.target.files[0]); setFormationImagePreview(URL.createObjectURL(e.target.files[0])); } }} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} /><div style={{ textAlign: "center" }}>{formationImagePreview ? <img src={formationImagePreview} style={{ maxWidth: "100%", maxHeight: 100, borderRadius: 8 }} /> : <><div style={{ fontSize: 24 }}>🖼️</div><div>Uploader une image</div></>}</div></div></div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}><button type="button" className="btn btn-gray" onClick={() => { setShowFormationModal(false); resetFormationForm(); }}>Annuler</button><button type="submit" className="btn btn-green">{editingFormation ? "💾 Modifier" : "✅ Créer"}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Réponse contact */}
      {replyModal.open && (
        <div className="modal-bg" onClick={() => setReplyModal({ ...replyModal, open: false })}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFE" }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>✉️ Répondre à {replyModal.prenom} {replyModal.nom}</span>
              <button className="btn btn-gray" onClick={() => setReplyModal({ ...replyModal, open: false })}>✕</button>
            </div>
            <form onSubmit={envoyerReponse} style={{ padding: "24px" }}>
              <div className="fg"><label className="lbl">Email destinataire</label><input className="inp" value={replyModal.email} disabled style={{ background: "#F8FAFC" }} /></div>
              <div className="fg"><label className="lbl">Votre réponse *</label><textarea className="inp" rows={5} placeholder="Écrivez votre réponse..." value={replyText} onChange={e => setReplyText(e.target.value)} required style={{ resize: "vertical" }} /></div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}><button type="button" className="btn btn-gray" onClick={() => setReplyModal({ ...replyModal, open: false })}>Annuler</button><button type="submit" className="btn btn-green" disabled={sendingReply}>{sendingReply ? "⏳ Envoi..." : "📤 Envoyer"}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Réponse demande de service */}
      {replyDemandeModal.open && (
        <div className="modal-bg" onClick={() => setReplyDemandeModal({ ...replyDemandeModal, open: false })}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFE" }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>📝 Répondre à la demande de {replyDemandeModal.startupNom}</span>
              <button className="btn btn-gray" onClick={() => setReplyDemandeModal({ ...replyDemandeModal, open: false })}>✕</button>
            </div>
            <form onSubmit={async (e) => { e.preventDefault(); if (!replyDemandeText.trim()) { notify("Écrivez une réponse", false); return; } setSendingReplyDemande(true); await repondreDemande(replyDemandeModal.demandeId, replyDemandeText); setReplyDemandeModal({ open: false, demandeId: 0, startupNom: "", email: "" }); setReplyDemandeText(""); setSendingReplyDemande(false); }} style={{ padding: "24px" }}>
              <div className="fg"><label className="lbl">Email de la startup</label><input className="inp" value={replyDemandeModal.email} disabled style={{ background: "#F8FAFC" }} /></div>
              <div className="fg"><label className="lbl">Votre réponse *</label><textarea className="inp" rows={5} placeholder="Écrivez votre réponse (statut, informations complémentaires, etc.)..." value={replyDemandeText} onChange={e => setReplyDemandeText(e.target.value)} required style={{ resize: "vertical" }} /></div>
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}><button type="button" className="btn btn-gray" onClick={() => setReplyDemandeModal({ ...replyDemandeModal, open: false })}>Annuler</button><button type="submit" className="btn btn-green" disabled={sendingReplyDemande}>{sendingReplyDemande ? "⏳ Envoi..." : "📤 Envoyer"}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modal détails expert/startup (inchangé) */}
      {selected && (
        <div className="modal-bg" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFE", position: "sticky", top: 0 }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>{selected.type === "expert" ? "👤 Détails Expert" : "🚀 Détails Startup"}</span>
              <button className="btn btn-gray" style={{ padding: "6px 10px" }} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: 16, background: "#F7F9FC", borderRadius: 12 }}>
                <Avatar nom={selected.data.user?.nom} prenom={selected.data.user?.prenom} photo={selected.data.photo} size={64} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#0A2540" }}>{selected.data.user?.prenom} {selected.data.user?.nom}</div>
                  <div style={{ fontSize: 13, color: "#8A9AB5" }}>{selected.data.user?.email}</div>
                  <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {selected.data.statut === "en_attente" && <span className="badge-wait">⏳ En attente</span>}
                    {selected.data.statut === "valide" && <span className="badge-ok">✅ Validé</span>}
                    {selected.data.statut === "refuse" && <span className="badge-no">❌ Refusé</span>}
                    {selected.data.modification_demandee && <span className="badge-modif">⚠️ Modif</span>}
                  </div>
                </div>
              </div>
              {selected.type === "expert" ? (
                <>
                  <div className="info-row"><span className="info-lbl">Domaine</span><span className="info-val">{selected.data.domaine || "-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Expérience</span><span className="info-val">{selected.data.experience || "-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Localisation</span><span className="info-val">{selected.data.localisation || "-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Téléphone</span><span className="info-val">{selected.data.user?.telephone || "-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Disponibilité</span><span className="info-val">{selected.data.disponibilite || "Non renseignée"}</span></div>
                  <div className="info-row"><span className="info-lbl">Description</span><span className="info-val">{selected.data.description || "-"}</span></div>
                  <div className="info-row"><span className="info-lbl">CV</span><span className="info-val">{selected.data.cv ? <a href={`${BASE}/uploads/cv/${selected.data.cv}`} target="_blank" className="file-link">📄 Télécharger le CV</a> : <span style={{ color: "#B8C4D6" }}>Aucun CV</span>}</span></div>
                  <div className="info-row"><span className="info-lbl">Portfolio</span><span className="info-val">{selected.data.portfolio ? <a href={`${BASE}/uploads/portfolio/${selected.data.portfolio}`} target="_blank" className="file-link">📁 Portfolio</a> : <span style={{ color: "#B8C4D6" }}>Aucun</span>}</span></div>
                  {selected.data.modification_demandee && selected.data.modifications_en_attente && (
                    <div style={{ marginTop: 16, background: "#FFF8E1", border: "1px solid #F7B500", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: "#B45309", marginBottom: 10 }}>⚠️ Modifications demandées</div>
                      {(() => {
                        try {
                          return Object.entries(JSON.parse(selected.data.modifications_en_attente)).map(([k, v]) => (
                            <div key={k} style={{ display: "flex", gap: 10, padding: "5px 0" }}>
                              <span style={{ fontSize: 11, color: "#92400E", fontWeight: 700, width: 100 }}>{k}</span>
                              <span style={{ fontSize: 13 }}>{String(v)}</span>
                            </div>
                          ));
                        } catch { return null; }
                      })()}
                      <div style={{ display: "flex", gap: 10, marginTop: 12 }}><button className="btn btn-green" onClick={() => { validerModification(selected.data.id); setSelected(null); }}>✅ Valider</button><button className="btn btn-red" onClick={() => { refuserModification(selected.data.id); setSelected(null); }}>❌ Refuser</button></div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="info-row"><span className="info-lbl">Startup</span><span className="info-val">{selected.data.nom_startup || "-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Secteur</span><span className="info-val">{selected.data.secteur || "-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Taille</span><span className="info-val">{selected.data.taille || "-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Fonction</span><span className="info-val">{selected.data.fonction || "-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Site web</span><span className="info-val">{selected.data.site_web || "-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Localisation</span><span className="info-val">{selected.data.localisation || "-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Téléphone</span><span className="info-val">{selected.data.user?.telephone || "-"}</span></div>
                  <div className="info-row"><span className="info-lbl">Description</span><span className="info-val">{selected.data.description || "-"}</span></div>
                </>
              )}
            </div>
            {selected.type === "expert" && selected.data.statut === "en_attente" && (
              <div style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 12, justifyContent: "flex-end", background: "#fff" }}>
                <button className="btn btn-red" onClick={() => refuser("experts", selected.data.id)}>❌ Refuser</button>
                <button className="btn btn-green" onClick={() => valider("experts", selected.data.id)}>✅ Valider</button>
              </div>
            )}
            {selected.type === "startup" && selected.data.statut === "en_attente" && (
              <div style={{ padding: "16px 24px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 12, justifyContent: "flex-end", background: "#fff" }}>
                <button className="btn btn-red" onClick={() => refuser("startups", selected.data.id)}>❌ Refuser</button>
                <button className="btn btn-green" onClick={() => valider("startups", selected.data.id)}>✅ Valider</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Article */}
      {showArticleModal && (
        <div className="modal-bg" onClick={() => { setShowArticleModal(false); resetArticleForm(); }}>
          <div className="modal" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFBFE", position: "sticky", top: 0 }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>{editingArticle ? "✏️ Modifier l'article" : "📝 Nouvel article"}</span>
              <button className="btn btn-gray" onClick={() => { setShowArticleModal(false); resetArticleForm(); }}>✕</button>
            </div>
            <form onSubmit={sauvegarderArticle} style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1/-1" }} className="fg"><label className="lbl">Titre *</label><input className="inp" required value={articleForm.titre} onChange={e => setArticleForm({ ...articleForm, titre: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Type</label><select className="inp" value={articleForm.type} onChange={e => setArticleForm({ ...articleForm, type: e.target.value })}><option value="article">Article</option><option value="conseil">Conseil</option><option value="nouveaute">Nouveauté</option></select></div>
                <div className="fg"><label className="lbl">Catégorie</label><select className="inp" value={articleForm.categorie} onChange={e => setArticleForm({ ...articleForm, categorie: e.target.value })}><option value="">Sélectionner...</option>{["Finance & Marchés", "IA & Digital", "RH & Organisation", "Stratégie", "Startup", "Management", "Marketing", "Droit & Conformité", "Économie"].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="fg"><label className="lbl">Tags (virgule)</label><input className="inp" value={articleForm.tags} onChange={e => setArticleForm({ ...articleForm, tags: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Durée de lecture</label><input className="inp" value={articleForm.duree_lecture} onChange={e => setArticleForm({ ...articleForm, duree_lecture: e.target.value })} /></div>
                <div className="fg"><label className="lbl">Statut</label><select className="inp" value={articleForm.statut} onChange={e => setArticleForm({ ...articleForm, statut: e.target.value })}><option value="brouillon">Brouillon</option><option value="publie">Publié</option><option value="archive">Archivé</option></select></div>
                <div style={{ gridColumn: "1/-1" }} className="fg"><label className="lbl">Description *</label><textarea className="inp" required rows={3} value={articleForm.description} onChange={e => setArticleForm({ ...articleForm, description: e.target.value })} /></div>
                <div style={{ gridColumn: "1/-1" }} className="fg"><label className="lbl">Contenu (HTML supporté)</label><textarea className="inp" rows={8} value={articleForm.contenu} onChange={e => setArticleForm({ ...articleForm, contenu: e.target.value })} style={{ fontFamily: "monospace", fontSize: 12.5 }} /><div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>Balises supportées : &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;blockquote&gt;</div></div>
                <div className="fg"><label className="lbl">Image de couverture</label><div style={{ border: "1.5px dashed #DDE4EF", borderRadius: 10, padding: 14, background: "#F7F9FC", position: "relative", cursor: "pointer" }}><input type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) { setArticleImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); } }} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} /><div style={{ textAlign: "center" }}>{imagePreview ? <img src={imagePreview} style={{ maxWidth: "100%", maxHeight: 100, borderRadius: 8, objectFit: "cover" }} /> : <><div style={{ fontSize: 24, marginBottom: 6 }}>🖼️</div><div style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>Uploader une image</div><div style={{ fontSize: 11, color: "#8A9AB5" }}>JPG, PNG, WebP</div></>}</div></div></div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}><button type="button" className="btn btn-gray" onClick={() => { setShowArticleModal(false); resetArticleForm(); }}>Annuler</button><button type="submit" className="btn btn-green">{editingArticle ? "💾 Modifier" : "✅ Créer"}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: "#0A2540", height: 62, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, background: "#F7B500", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#0A2540", fontSize: 12 }}>BEH</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700 }}>Espace Admin</div>
            <div style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }}>Gestion plateforme BEH</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(totalAttente + modificationsAttente.length + temosAttente.length + brouillons + formationsBrouillons + comments.length + msgsNonLus) > 0 && (
            <div style={{ background: "#F7B500", color: "#0A2540", borderRadius: 99, padding: "5px 14px", fontSize: 12, fontWeight: 800 }}>
              🔔 {totalAttente + modificationsAttente.length + temosAttente.length + brouillons + formationsBrouillons + comments.length + msgsNonLus} notifications
            </div>
          )}
          <button className="btn btn-gray" style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.7)" }}
            onClick={() => { if (typeof window !== "undefined") { localStorage.clear(); router.push("/"); } }}>
            Déconnexion
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Utilisateurs", val: users.length, color: "#3B82F6", icon: "👥" },
            { label: "Experts", val: nbExperts, color: "#8B5CF6", icon: "🎯" },
            { label: "Startups", val: nbStartups, color: "#F7B500", icon: "🚀" },
            { label: "En attente", val: totalAttente, color: "#EF4444", icon: "⏳" },
            { label: "Témoignages", val: temoignages.length, color: "#10B981", icon: "⭐" },
            { label: "Msg non lus", val: msgsNonLus, color: "#F97316", icon: "📩" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 26 }}>{s.icon}</div>
              <div><div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div><div style={{ fontSize: 11, color: "#8A9AB5" }}>{s.label}</div></div>
            </div>
          ))}
        </div>

        {/* Modifications en attente */}
        {modificationsAttente.length > 0 && (
          <div style={{ background: "#FFF8E1", border: "1px solid #F7B500", borderRadius: 16, padding: "20px 24px", marginBottom: 24 }}>
            <div style={{ fontWeight: 700, color: "#B45309", marginBottom: 14 }}>⚠️ Modifications en attente ({modificationsAttente.length})</div>
            {modificationsAttente.map(e => (
              <div key={e.id} style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 10, border: "1px solid #E8EEF6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar nom={e.user?.nom} prenom={e.user?.prenom} photo={e.photo} size={40} />
                    <div><div style={{ fontWeight: 700 }}>{e.user?.prenom} {e.user?.nom}</div><div style={{ fontSize: 12, color: "#8A9AB5" }}>{e.user?.email}</div></div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-green" onClick={() => validerModification(e.id)}>✅ Valider</button>
                    <button className="btn btn-red" onClick={() => refuserModification(e.id)}>❌ Refuser</button>
                    <button className="btn btn-blue" onClick={() => setSelected({ type: "expert", data: e })}>👁 Détails</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TABS */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ borderBottom: "1px solid #E8EEF6", padding: "0 20px", display: "flex", gap: 16, overflowX: "auto" }}>
            {[
              { id: "experts", label: "🎯 Experts", count: enAttenteExperts.length },
              { id: "startups", label: "🚀 Startups", count: enAttenteStartups.length },
              { id: "users", label: "👥 Utilisateurs", count: 0 },
              { id: "temoignages", label: "⭐ Témoignages", count: temosAttente.length },
              { id: "contacts", label: "📩 Messages", count: msgsNonLus },
              { id: "histoire", label: "📖 Page À propos", count: 0 },
              { id: "blog", label: "📝 Blog", count: brouillons },
              { id: "commentaires", label: "💬 Commentaires", count: comments.length },
              { id: "formations", label: "📚 Formations", count: formationsBrouillons },
              { id: "demandes", label: "📋 Demandes service", count: demandesEnAttente },
            ].map(t => (
              <button key={t.id} className={`tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id as Tab)}>
                {t.label}
                {t.count > 0 && <span style={{ background: "#F7B500", color: "#0A2540", borderRadius: 99, padding: "1px 7px", fontSize: 11, marginLeft: 6 }}>{t.count}</span>}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "#8A9AB5" }}>⏳ Chargement...</div>
          ) : tab === "experts" ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th>Expert</th><th>Email</th><th>Domaine</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {experts.map(e => (
                  <tr key={e.id}>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar nom={e.user?.nom} prenom={e.user?.prenom} photo={e.photo} size={38} /><div>{e.user?.prenom} {e.user?.nom}</div></div></td>
                    <td>{e.user?.email}</td>
                    <td>{e.domaine || "-"}</td>
                    <td>{e.statut === "en_attente" ? <span className="badge-wait">⏳ En attente</span> : e.statut === "valide" ? <span className="badge-ok">✅ Validé</span> : <span className="badge-no">❌ Refusé</span>}</td>
                    <td><button className="btn btn-blue" onClick={() => setSelected({ type: "expert", data: e })}>👁 Détails</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === "startups" ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th>Responsable</th><th>Email</th><th>Startup</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {startups.map(s => (
                  <tr key={s.id}>
                    <td>{s.user?.prenom} {s.user?.nom}</td>
                    <td>{s.user?.email}</td>
                    <td>{s.nom_startup || "-"}</td>
                    <td>{s.statut === "en_attente" ? <span className="badge-wait">⏳ En attente</span> : s.statut === "valide" ? <span className="badge-ok">✅ Validé</span> : <span className="badge-no">❌ Refusé</span>}</td>
                    <td><button className="btn btn-blue" onClick={() => setSelected({ type: "startup", data: s })}>👁 Détails</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === "users" ? (
            <div style={{ padding: "20px 24px" }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 20 }}>👥 Utilisateurs ({users.length})</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar nom={u.nom} prenom={u.prenom} photo={u.photo} size={38} /><div>{u.prenom} {u.nom}</div></div></td>
                      <td>{u.email}</td>
                      <td><span style={{ background: u.role === "expert" ? "#8B5CF6" : u.role === "startup" ? "#10B981" : "#6B7280", color: "#fff", borderRadius: 99, padding: "2px 10px", fontSize: 11 }}>{u.role === "expert" ? "Expert" : u.role === "startup" ? "Startup" : "Client"}</span></td>
                      <td>{u.statut === "actif" ? <span className="badge-ok">✅ Actif</span> : u.statut === "en_attente" ? <span className="badge-wait">⏳ En attente</span> : <span className="badge-no">❌ Inactif</span>}</td>
                      <td><button className="btn btn-red" onClick={() => supprimerUser(u.id)}>🗑 Supprimer</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : tab === "temoignages" ? (
            <div style={{ padding: "20px 24px" }}>
              {temoignages.map(t => (
                <div key={t.id} style={{ background: t.statut === "en_attente" ? "#FFF8E1" : "#F7F9FC", border: t.statut === "en_attente" ? "1px solid #F7B500" : "1px solid #E8EEF6", borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><StarDisplay rating={t.note || 5} size={16} /><span style={{ fontSize: 12, color: "#F7B500", fontWeight: 600 }}>{(t.note || 5)}.0/5</span></div>
                  <p style={{ fontStyle: "italic", color: "#334155", marginBottom: 12, fontSize: 14, lineHeight: 1.65 }}>"{t.texte}"</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div><strong>{t.user?.prenom} {t.user?.nom}</strong><span style={{ color: "#8A9AB5", fontSize: 12, marginLeft: 8 }}>{t.user?.email}</span></div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {t.statut === "en_attente" && <><button className="btn btn-green" onClick={() => validerTemo(t.id)}>✅ Publier</button><button className="btn btn-red" onClick={() => refuserTemo(t.id)}>❌ Refuser</button></>}
                      <button className="btn btn-red" onClick={() => supprimerTemo(t.id)}>🗑 Supprimer</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : tab === "contacts" ? (
            <div style={{ padding: "20px 24px" }}>
              {contactMsgs.length === 0 ? <div style={{ padding: 60, textAlign: "center", color: "#8A9AB5" }}>📭 Aucun message</div> : contactMsgs.map(msg => (
                <div key={msg.id} style={{ background: msg.is_read ? "#fff" : "#FFF8E1", border: `1px solid ${msg.is_read ? "#E8EEF6" : "#F7B500"}`, borderLeft: `4px solid ${msg.is_read ? "#E8EEF6" : "#F7B500"}`, borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#0A2540", color: "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18 }}>{msg.prenom?.[0]?.toUpperCase() || "?"}</div>
                        <div><div style={{ fontWeight: 700 }}>{msg.prenom} {msg.nom}</div><div style={{ fontSize: 12, color: "#8A9AB5" }}>{msg.email}</div></div>
                      </div>
                      <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 16px", marginBottom: 8 }}>
                        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 5 }}>📌 Sujet : <strong>{msg.sujet}</strong></div>
                        <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, margin: 0 }}>{msg.message}</p>
                      </div>
                      <div style={{ fontSize: 11, color: "#B8C4D6" }}>📅 {new Date(msg.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "flex-start" }}>
                      {!msg.is_read && <button className="btn btn-green" onClick={() => marquerLu(msg.id)}>✅ Lu</button>}
                      <button className="btn btn-blue" onClick={() => setReplyModal({ open: true, messageId: msg.id, email: msg.email, nom: msg.nom, prenom: msg.prenom })}>✉️ Répondre</button>
                      <button className="btn btn-red" onClick={() => supprimerMessage(msg.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : tab === "histoire" ? (
            <div style={{ padding: "24px 28px" }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 20 }}>📖 Modifier la page "À propos"</div>
              <form onSubmit={saveHistoire}>
                <div style={S}>{secTitle("🏠", "Section Héro")}<div className="fg"><label className="lbl">Année de création</label><input className="inp" value={hf("annee_creation")} onChange={e => setHF("annee_creation", e.target.value)} /></div><div className="fg"><label className="lbl">Description héro</label><textarea className="inp" rows={3} value={hf("description_hero")} onChange={e => setHF("description_hero", e.target.value)} /></div></div>
                <div style={S}>{secTitle("👁", "Vision")}<div className="fg"><label className="lbl">Description vision</label><textarea className="inp" rows={3} value={hf("description_vision")} onChange={e => setHF("description_vision", e.target.value)} /></div>{[1, 2, 3, 4].map(n => <div key={n} className="fg"><label className="lbl">Point vision {n}</label><input className="inp" value={hf(`vision_point${n}`)} onChange={e => setHF(`vision_point${n}`, e.target.value)} /></div>)}</div>
                <div style={S}>{secTitle("💬", "Citation")}<div className="fg"><label className="lbl">Citation</label><textarea className="inp" rows={2} value={hf("citation")} onChange={e => setHF("citation", e.target.value)} /></div><div className="fg"><label className="lbl">Auteur</label><input className="inp" value={hf("citation_auteur")} onChange={e => setHF("citation_auteur", e.target.value)} /></div><div className="fg"><label className="lbl">Rôle</label><input className="inp" value={hf("citation_role")} onChange={e => setHF("citation_role", e.target.value)} /></div></div>
                <div style={S}>{secTitle("🎯", "Mission")}<div className="fg"><label className="lbl">Titre mission</label><input className="inp" value={hf("mission_titre")} onChange={e => setHF("mission_titre", e.target.value)} /></div><div className="fg"><label className="lbl">Description mission</label><textarea className="inp" rows={3} value={hf("mission_desc")} onChange={e => setHF("mission_desc", e.target.value)} /></div></div>
                <div style={S}>{secTitle("📅", "Timeline")}<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{[1, 2, 3, 4, 5, 6].map(n => <div key={n} style={{ background: "#F8FAFC", borderRadius: 12, padding: 12 }}><div className="fg"><label className="lbl">Année {n}</label><input className="inp" value={hf(`timeline${n}_year`)} onChange={e => setHF(`timeline${n}_year`, e.target.value)} /></div><div className="fg"><label className="lbl">Titre {n}</label><input className="inp" value={hf(`timeline${n}_title`)} onChange={e => setHF(`timeline${n}_title`, e.target.value)} /></div><div className="fg"><label className="lbl">Description {n}</label><textarea className="inp" rows={2} value={hf(`timeline${n}_desc`)} onChange={e => setHF(`timeline${n}_desc`, e.target.value)} /></div></div>)}</div></div>
                <div style={S}>{secTitle("⭐", "Valeurs")}<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>{[1, 2, 3].map(n => <div key={n} style={{ background: "#F8FAFC", borderRadius: 12, padding: 12 }}><div className="fg"><label className="lbl">Titre {n}</label><input className="inp" value={hf(`valeur${n}_titre`)} onChange={e => setHF(`valeur${n}_titre`, e.target.value)} /></div><div className="fg"><label className="lbl">Description {n}</label><textarea className="inp" rows={3} value={hf(`valeur${n}_desc`)} onChange={e => setHF(`valeur${n}_desc`, e.target.value)} /></div><div className="fg"><label className="lbl">Couleur</label><input className="inp" value={hf(`valeur${n}_color`)} onChange={e => setHF(`valeur${n}_color`, e.target.value)} /></div></div>)}</div></div>
                <div style={S}>{secTitle("📞", "Contact")}<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}><div className="fg"><label className="lbl">Email</label><input className="inp" value={hf("contact_email")} onChange={e => setHF("contact_email", e.target.value)} /></div><div className="fg"><label className="lbl">Téléphone</label><input className="inp" value={hf("contact_telephone")} onChange={e => setHF("contact_telephone", e.target.value)} /></div><div className="fg"><label className="lbl">Adresse</label><input className="inp" value={hf("contact_adresse")} onChange={e => setHF("contact_adresse", e.target.value)} /></div></div></div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}><button type="submit" className="btn btn-green" disabled={savingH}>{savingH ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}</button></div>
              </form>
            </div>
          ) : tab === "blog" ? (
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}><div><div style={{ fontWeight: 700, fontSize: 17 }}>📝 Gestion du Blog</div><div style={{ fontSize: 13, color: "#8A9AB5" }}>{articles.length} article · {articles.filter(a => a.statut === "publie").length} publiés · {brouillons} brouillons</div></div><button className="btn btn-green" onClick={() => { resetArticleForm(); setShowArticleModal(true); }}>📝 Nouvel article</button></div>
              {articles.map(a => (
                <div key={a.id} style={{ background: "#F8FAFC", borderRadius: 14, padding: "18px 20px", marginBottom: 12, border: `1.5px solid ${a.statut === "publie" ? "#A7F3D0" : a.statut === "brouillon" ? "#E8EEF6" : "#DDE4EF"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{a.titre}</div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}><span style={{ background: "#EFF6FF", color: "#1D4ED8", borderRadius: 99, padding: "2px 10px", fontSize: 11 }}>{a.type}</span>{a.categorie && <span style={{ background: "#F1F5F9", color: "#475569", borderRadius: 99, padding: "2px 10px", fontSize: 11 }}>{a.categorie}</span>}{a.duree_lecture && <span style={{ background: "#F1F5F9", color: "#64748B", borderRadius: 99, padding: "2px 10px", fontSize: 11 }}>⏱ {a.duree_lecture}</span>}</div>
                      <p style={{ fontSize: 13, color: "#64748B" }}>{a.description}</p>
                      <div style={{ fontSize: 11, color: "#B8C4D6", marginTop: 5 }}>{new Date(a.createdAt).toLocaleDateString()} · {a.vues || 0} vues</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      {a.statut === "publie" && <span className="bo">✅ Publié</span>}
                      {a.statut === "brouillon" && <span className="bw">📝 Brouillon</span>}
                      {a.statut === "archive" && <span className="ba">📦 Archivé</span>}
                      <div style={{ display: "flex", gap: 6 }}>
                        {a.statut === "brouillon" && <button className="btn btn-green" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => publierArticle(a.id)}>✅ Publier</button>}
                        <button className="btn btn-blue" onClick={() => ouvrirEditionArticle(a)}>✏️</button>
                        <button className="btn btn-red" onClick={() => supprimerArticle(a.id)}>🗑</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : tab === "commentaires" ? (
            <div style={{ padding: "20px 24px" }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 20 }}>💬 Commentaires en attente ({comments.length})</div>
              {comments.map(c => (
                <div key={c.id} style={{ background: "#FFF8E1", borderRadius: 14, padding: "18px 20px", marginBottom: 12, border: "1px solid #F7B500" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#0A2540", color: "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{c.nom?.[0]?.toUpperCase() || "?"}</div>
                        <div><div style={{ fontWeight: 700 }}>{c.nom}</div><div style={{ fontSize: 12, color: "#8A9AB5" }}>{c.email} · {new Date(c.createdAt).toLocaleDateString()}</div></div>
                      </div>
                      <div style={{ background: "#fff", borderRadius: 10, padding: "12px 16px", border: "1px solid #E8EEF6" }}><p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{c.comment}</p></div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>📝 Article ID : {c.articleId}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-green" onClick={() => approuverComment(c.id)}>✅ Approuver</button>
                      <button className="btn btn-red" onClick={() => refuserComment(c.id)}>❌ Refuser</button>
                      <button className="btn btn-gray" onClick={() => supprimerComment(c.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : tab === "formations" ? (
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}><div><div style={{ fontWeight: 700, fontSize: 17 }}>📚 Formations ({formations.length})</div><div style={{ fontSize: 13, color: "#8A9AB5" }}>{formations.filter(f => f.statut === "publie").length} publiées · {formationsBrouillons} brouillons</div></div><button className="btn btn-green" onClick={ouvrirAjoutFormation}>➕ Nouvelle formation</button></div>
              {formations.length === 0 ? <div style={{ padding: 60, textAlign: "center", color: "#8A9AB5" }}>📚 Aucune formation</div> : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
                  {formations.map(f => (
                    <div key={f.id} style={{ background: "#F8FAFC", borderRadius: 14, padding: 16, border: `1px solid ${f.statut === "publie" ? "#A7F3D0" : f.statut === "brouillon" ? "#F7B500" : "#DDE4EF"}` }}>
                      <div style={{ display: "flex", gap: 12 }}>
                        {f.image && <img src={`${BASE}/uploads/formations/${f.image}`} style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover" }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}><span style={{ background: "#F7B500", color: "#fff", borderRadius: 99, padding: "2px 8px", fontSize: 11 }}>📚 Formation</span>{f.statut === "publie" && <span className="bo">✅ Publié</span>}{f.statut === "brouillon" && <span className="bw">📝 Brouillon</span>}</div>
                          <div style={{ fontWeight: 700 }}>{f.titre}</div>
                          {f.domaine && <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>📁 {f.domaine}</div>}
                          {f.formateur && <div style={{ fontSize: 12, color: "#64748B" }}>👨‍🏫 {f.formateur}</div>}
                          <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8 }}>{f.type === "gratuit" ? <span style={{ fontSize: 11, color: "#22C55E" }}>🎁 Gratuit</span> : f.prix && <span style={{ fontSize: 11, color: "#F7B500" }}>💰 {f.prix} DT</span>}{f.duree && <span style={{ fontSize: 11, color: "#64748B" }}>⏱ {f.duree}</span>}{f.mode === "en_ligne" ? <span style={{ fontSize: 11, color: "#3B82F6" }}>💻 En ligne</span> : <span style={{ fontSize: 11, color: "#10B981" }}>🏢 Présentiel</span>}{f.localisation && <span style={{ fontSize: 11, color: "#64748B" }}>📍 {f.localisation}</span>}{f.certifiante && <span style={{ fontSize: 11, color: "#8B5CF6" }}>🎓 Certifiante</span>}{f.places_limitees && <span style={{ fontSize: 11, color: "#EF4444" }}>🎟️ Places limitées ({f.places_disponibles || 0})</span>}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                        {f.statut === "brouillon" && <button className="btn btn-green" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => publierFormation(f.id)}>✅ Publier</button>}
                        {f.statut === "publie" && <button className="btn btn-gray" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => archiverFormation(f.id)}>📦 Archiver</button>}
                        <button className="btn btn-blue" onClick={() => ouvrirEditionFormation(f)}>✏️</button>
                        <button className="btn btn-red" onClick={() => supprimerFormation(f.id)}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : tab === "demandes" ? (
            <div style={{ padding: "20px 24px" }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 20 }}>📋 Demandes de service ({demandes.length})</div>
              {demandes.length === 0 ? (
                <div style={{ padding: 60, textAlign: "center", color: "#8A9AB5" }}>📋 Aucune demande</div>
              ) : (
                demandes.map(d => {
                  const isFormationReq = d.service === "formation";
                  return (
                    <div key={d.id} style={{ background: "#fff", border: `1.5px solid ${d.statut === "en_attente" ? "#F7B500" : d.statut === "acceptee" ? "#A7F3D0" : "#E8EEF6"}`, borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>
                            Service demandé : <span style={{ color: "#F7B500" }}>
                              {isFormationReq ? "📚 Formation" : (d.service || "Personnalisé")}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: "#8A9AB5" }}>
                            Startup : <strong>{d.startup?.nom_startup || d.startup?.user?.prenom || "N/A"}</strong> · {new Date(d.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span style={{ background: d.statut === "en_attente" ? "#FFF8E1" : d.statut === "acceptee" ? "#ECFDF5" : "#FEF2F2", color: d.statut === "en_attente" ? "#B45309" : d.statut === "acceptee" ? "#059669" : "#DC2626", borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
                            {d.statut === "en_attente" ? "⏳ En attente" : d.statut === "acceptee" ? "✅ Acceptée" : "❌ Refusée"}
                          </span>
                        </div>
                      </div>

                      {/* Affichage spécifique pour les demandes de formation */}
                      {isFormationReq && d.formation && (
                        <div style={{ marginTop: 10, marginBottom: 12, background: "#F3E8FF", borderRadius: 10, padding: "10px 14px", border: "1px solid #DDD6FE" }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#6B21A5" }}>🎓 Formation demandée : {d.formation.titre}</div>
                          {d.formation.places_limitees && (
                            <div style={{ fontSize: 12, marginTop: 4 }}>
                              Places restantes : <strong style={{ color: d.formation.places_disponibles > 0 ? "#22C55E" : "#EF4444" }}>{d.formation.places_disponibles ?? 0}</strong>
                            </div>
                          )}
                          {d.formation.prix && <div style={{ fontSize: 12, marginTop: 2 }}>Prix : {d.formation.prix} DT {d.formation.type === "gratuit" && "(Gratuit)"}</div>}
                        </div>
                      )}

                      {/* Description pour les autres services */}
                      {!isFormationReq && d.description && (
                        <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px 16px", marginBottom: 12 }}>
                          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>📝 Description</div>
                          <p style={{ fontSize: 14, color: "#0A2540", lineHeight: 1.6 }}>{d.description}</p>
                        </div>
                      )}

                      {/* Infos communes */}
                      {(d.budget || d.delai || d.objectif || d.telephone) && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                          {d.budget && <span className="badge-ok">💰 {d.budget}</span>}
                          {d.delai && <span className="badge-ok">⏱ {d.delai}</span>}
                          {d.objectif && <span className="badge-ok">🎯 {d.objectif}</span>}
                          {d.telephone && <span className="badge-ok">📞 {d.telephone}</span>}
                        </div>
                      )}

                      {d.commentaire_admin && (
                        <div style={{ background: "#EFF6FF", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: "#1D4ED8", fontWeight: 700, marginBottom: 4 }}>📩 Réponse admin :</div>
                          <p style={{ fontSize: 13.5, color: "#0A2540" }}>{d.commentaire_admin}</p>
                        </div>
                      )}

                      {/* Boutons d'action */}
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        {d.statut === "en_attente" && (
                          <>
                            {isFormationReq ? (
                              <>
                                <button className="btn btn-green" onClick={() => accepterDemandeFormation(d.id)}>✅ Accepter</button>
                                <button className="btn btn-red" onClick={() => refuserDemandeFormation(d.id)}>❌ Refuser</button>
                              </>
                            ) : (
                              <>
                                <button className="btn btn-green" onClick={() => changerStatutDemande(d.id, "acceptee")}>✅ Accepter</button>
                                <button className="btn btn-red" onClick={() => changerStatutDemande(d.id, "refusee")}>❌ Refuser</button>
                                <button className="btn btn-blue" onClick={() => setReplyDemandeModal({ open: true, demandeId: d.id, startupNom: d.startup?.nom_startup || "Startup", email: d.startup?.user?.email || "" })}>✉️ Répondre</button>
                              </>
                            )}
                          </>
                        )}
                        {(d.statut === "acceptee" || d.statut === "refusee") && (
                          <button className="btn btn-gray" disabled style={{ opacity: 0.6 }}>
                            {d.statut === "acceptee" ? "✅ Traitée" : "❌ Refusée"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}