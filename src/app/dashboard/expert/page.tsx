"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaArrowRight, FaQuoteLeft, FaChevronLeft, FaChevronRight,
  FaBullseye, FaRocket, FaGraduationCap, FaSearch, FaPaperPlane,
  FaCheck, FaCamera, FaComments, FaCalendar, FaStar, FaCheckCircle,
  FaChartLine, FaSearchPlus, FaDesktop, FaPlay, FaMicrophone,
  FaUsers, FaClock, FaCertificate, FaExternalLinkAlt, FaTimes,
  FaMobile, FaLaptopCode, FaEdit, FaTrash, FaSave, FaHeadphones,
  FaPlus, FaUpload, FaFileAudio, FaImage,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const ADN_ITEMS = [
  { title: "Notre Vision", body: "Devenir la référence absolue en accompagnement de startups innovantes.", color: "#3B82F6", anchor: "vision" },
  { title: "Notre Mission", body: "Offrir aux startups un accès privilégié à des experts certifiés.", color: "#F7B500", anchor: "mission" },
  { title: "Nos Valeurs", body: "Excellence, transparence et engagement humain.", color: "#10B981", anchor: "valeurs" },
];

const S_COLOR: Record<string, string> = {
  en_attente: "#F7B500", valide: "#22C55E", refuse: "#EF4444",
  confirme: "#22C55E", annule: "#EF4444", acceptee: "#22C55E",
  en_cours: "#3B82F6", terminee: "#10B981", refusee: "#EF4444",
};

const S_LABEL: Record<string, string> = {
  en_attente: "⏳ En attente", valide: "✅ Validé", refuse: "❌ Refusé",
  confirme: "✅ Confirmé", annule: "❌ Annulé", acceptee: "✅ Acceptée",
  en_cours: "🔄 En cours", terminee: "✅ Terminée", refusee: "❌ Refusée",
};

type Tab = "accueil" | "profil" | "formations" | "podcasts" | "demandes" | "devis" | "messages" | "temoignages";

// ─── HOOKS ────────────────────────────────────────────────────────────────────

function useInView(thr = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: thr });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return [ref, v] as const;
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "none" : "translateY(28px)", transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${delay}s, transform .7s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

// ─── MODAL FORMATION (proposition) ───────────────────────────────────────────

function FormationModal({ formation, onClose }: { formation: any; onClose: () => void }) {
  const modeInfo = { label: formation.mode === "presentiel" ? "Présentiel" : "En ligne", color: formation.mode === "presentiel" ? "#3B82F6" : "#22C55E" };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ position: "relative", height: 180, background: "linear-gradient(135deg,#0A2540,#1a3a6e)", overflow: "hidden", borderRadius: "24px 24px 0 0" }}>
          {formation.image && <img src={`${BASE}/uploads/formations/${formation.image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: .5 }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,37,64,.9),transparent)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)", color: "#fff", fontSize: 16, cursor: "pointer" }}><FaTimes /></button>
          <div style={{ position: "absolute", bottom: 16, left: 20, right: 60 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              {formation.domaine && <span style={{ background: "#F7B500", color: "#0A2540", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{formation.domaine}</span>}
              {formation.certifiante && <span style={{ background: "rgba(34,197,94,.2)", color: "#4ADE80", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}><FaCertificate style={{ marginRight: 3 }} />Certifiante</span>}
              <span style={{ background: "rgba(0,0,0,.35)", backdropFilter: "blur(4px)", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: "#fff" }}>● {modeInfo.label}</span>
            </div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 19 }}>{formation.titre}</div>
          </div>
        </div>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Formateur", val: formation.formateur || "Vous", color: "#3B82F6" },
              { label: "Durée", val: formation.duree || "Non précisée", color: "#F7B500" },
              { label: "Mode", val: modeInfo.label, color: modeInfo.color },
              { label: "Lieu", val: formation.localisation || "En ligne", color: "#8B5CF6" },
            ].map((row, i) => (
              <div key={i} style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${row.color}18`, color: row.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 700 }}>●</div>
                <div><div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>{row.label}</div><div style={{ fontSize: 13.5, fontWeight: 600, color: "#0A2540" }}>{row.val}</div></div>
              </div>
            ))}
          </div>
          {formation.description && <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8, marginBottom: 20 }}>{formation.description}</p>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
            <div><div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Prix</div><div style={{ fontSize: 26, fontWeight: 900, color: formation.prix ? "#0A2540" : "#22C55E" }}>{formation.prix ? `${formation.prix} DT` : "Gratuit"}</div></div>
            {formation.places_limitees ? <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Places restantes</div><div style={{ fontSize: 22, fontWeight: 900, color: formation.places_disponibles > 0 ? "#22C55E" : "#EF4444" }}>{formation.places_disponibles ?? 0}</div></div> : <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Places</div><div style={{ fontSize: 18, fontWeight: 700, color: "#10B981" }}>Illimitées</div></div>}
          </div>
          <button className="btn btn-gray" style={{ width: "100%", justifyContent: "center" }} onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL PODCAST (détail / écoute) ─────────────────────────────────────────

function PodcastDetailModal({ podcast, onClose }: { podcast: any; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => { if (audioRef.current) audioRef.current.load(); }, [podcast]);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", padding: "20px 24px", borderRadius: "20px 20px 0 0", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "none", cursor: "pointer", color: "#fff" }}>✕</button>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {podcast.image ? <img src={`${BASE}/uploads/podcasts-images/${podcast.image}`} style={{ width: 70, height: 70, borderRadius: 12, objectFit: "cover" }} /> : <div style={{ width: 70, height: 70, borderRadius: 12, background: "rgba(139,92,246,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaMicrophone style={{ fontSize: 32, color: "#C4B5FD" }} /></div>}
            <div><div style={{ color: "rgba(255,255,255,.7)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Podcast</div><div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>{podcast.titre}</div>{podcast.auteur && <div style={{ color: "rgba(255,255,255,.6)", fontSize: 13, marginTop: 4 }}>🎙️ {podcast.auteur}</div>}</div>
          </div>
        </div>
        <div style={{ padding: "24px 28px" }}>
          {podcast.description && <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8, marginBottom: 20 }}>{podcast.description}</p>}
          <audio ref={audioRef} src={`${BASE}/uploads/podcasts-audio/${podcast.url_audio}`} preload="metadata" style={{ width: "100%", marginBottom: 16 }} controls />
          <button className="btn btn-gray" style={{ width: "100%", justifyContent: "center" }} onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL CRÉATION PODCAST ───────────────────────────────────────────────────

function CreatePodcastModal({ onClose, onSuccess, expertData }: { onClose: () => void; onSuccess: () => void; expertData: any }) {
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [auteur, setAuteur] = useState("");
  const [domaine, setDomaine] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expertData) {
      const fullName = `${expertData.user?.prenom || ""} ${expertData.user?.nom || ""}`.trim();
      if (fullName) setAuteur(fullName);
      if (expertData.domaine) setDomaine(expertData.domaine);
    }
  }, [expertData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre || !audioFile) { alert("Titre et fichier audio requis"); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("titre", titre);
    fd.append("description", description);
    fd.append("auteur", auteur);
    fd.append("domaine", domaine);
    fd.append("audio_file", audioFile);
    if (imageFile) fd.append("image_file", imageFile);
    try {
      const res = await fetch(`${BASE}/podcasts/expert/proposer`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: fd,
      });
      if (res.ok) { onSuccess(); onClose(); } else alert("Erreur lors de la proposition");
    } catch { alert("Erreur réseau"); }
    setLoading(false);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", padding: "18px 24px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(139,92,246,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}><FaMicrophone /></div><div><div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, textTransform: "uppercase" }}>Proposer un podcast</div><div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>Nouveau podcast</div></div></div>
          <button className="btn btn-gray" style={{ padding: "5px 10px", background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
          <div style={{ marginBottom: 16 }}><label className="lbl">Titre *</label><input className="inp" required value={titre} onChange={e => setTitre(e.target.value)} /></div>
          <div style={{ marginBottom: 16 }}><label className="lbl">Description</label><textarea className="inp" rows={3} value={description} onChange={e => setDescription(e.target.value)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div><label className="lbl">Auteur / Animateur</label><input className="inp" value={auteur} onChange={e => setAuteur(e.target.value)} placeholder="Votre nom ou invité" /></div>
            <div><label className="lbl">Domaine</label><input className="inp" value={domaine} onChange={e => setDomaine(e.target.value)} placeholder="Ex: Marketing Digital" /></div>
          </div>
          <div style={{ marginBottom: 16 }}><label className="lbl">Fichier audio (MP3) *</label><label className="upload-zone" style={{ minHeight: 80 }}><input type="file" accept="audio/mpeg" onChange={e => { const f = e.target.files?.[0]; if (f) { setAudioFile(f); setAudioPreview(f.name); } }} style={{ display: "none" }} />{audioPreview ? <span>✅ {audioPreview}</span> : <><FaFileAudio /> Cliquer pour uploader un MP3</>}</label></div>
          <div style={{ marginBottom: 16 }}><label className="lbl">Image de couverture</label><label className="upload-zone" style={{ minHeight: 80 }}><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />{imagePreview ? <img src={imagePreview} style={{ maxHeight: 60, borderRadius: 6 }} /> : <><FaImage /> Cliquer pour uploader une image</>}</label></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}><button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button><button type="submit" className="btn btn-green" disabled={loading}>{loading ? "⏳ Envoi..." : "✅ Proposer"}</button></div>
        </form>
      </div>
    </div>
  );
}

// ─── MODAL MODIFICATION PODCAST ──────────────────────────────────────────────

function EditPodcastModal({ podcast, onClose, onSuccess, expertData }: { podcast: any; onClose: () => void; onSuccess: () => void; expertData: any }) {
  const [titre, setTitre] = useState(podcast.titre || "");
  const [description, setDescription] = useState(podcast.description || "");
  const [auteur, setAuteur] = useState(podcast.auteur || "");
  const [domaine, setDomaine] = useState(podcast.domaine || "");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (podcast.image) setImagePreview(`${BASE}/uploads/podcasts-images/${podcast.image}`);
  }, [podcast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre) { alert("Le titre est requis"); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("titre", titre);
    fd.append("description", description);
    fd.append("auteur", auteur);
    fd.append("domaine", domaine);
    if (audioFile) fd.append("audio_file", audioFile);
    if (imageFile) fd.append("image_file", imageFile);
    try {
      const res = await fetch(`${BASE}/podcasts/expert/modifier/${podcast.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        body: fd,
      });
      if (res.ok) { onSuccess(); onClose(); } else alert("Erreur lors de la modification");
    } catch { alert("Erreur réseau"); }
    setLoading(false);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", padding: "18px 24px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(139,92,246,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}><FaMicrophone /></div><div><div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, textTransform: "uppercase" }}>Modifier le podcast</div><div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>{podcast.titre}</div></div></div>
          <button className="btn btn-gray" style={{ padding: "5px 10px", background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
          <div style={{ marginBottom: 16 }}><label className="lbl">Titre *</label><input className="inp" required value={titre} onChange={e => setTitre(e.target.value)} /></div>
          <div style={{ marginBottom: 16 }}><label className="lbl">Description</label><textarea className="inp" rows={3} value={description} onChange={e => setDescription(e.target.value)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div><label className="lbl">Auteur / Animateur</label><input className="inp" value={auteur} onChange={e => setAuteur(e.target.value)} placeholder="Votre nom ou invité" /></div>
            <div><label className="lbl">Domaine</label><input className="inp" value={domaine} onChange={e => setDomaine(e.target.value)} placeholder="Ex: Marketing Digital" /></div>
          </div>
          <div style={{ marginBottom: 16 }}><label className="lbl">Fichier audio (MP3) (laisser vide pour conserver l'actuel)</label><label className="upload-zone" style={{ minHeight: 80 }}><input type="file" accept="audio/mpeg" onChange={e => { const f = e.target.files?.[0]; if (f) { setAudioFile(f); setAudioPreview(f.name); } }} style={{ display: "none" }} />{audioPreview ? <span>✅ {audioPreview}</span> : (podcast.url_audio ? <span>🔊 Fichier actuel : {podcast.url_audio}</span> : <><FaFileAudio /> Cliquer pour uploader</>)}</label></div>
          <div style={{ marginBottom: 16 }}><label className="lbl">Image de couverture (laisser vide pour conserver l'actuelle)</label><label className="upload-zone" style={{ minHeight: 80 }}><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />{imagePreview ? <img src={imagePreview} style={{ maxHeight: 60, borderRadius: 6 }} /> : (podcast.image ? <span>🖼️ Image actuelle</span> : <span>📸 Cliquer pour uploader</span>)}</label></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}><button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button><button type="submit" className="btn btn-green" disabled={loading}>{loading ? "⏳ Envoi..." : "💾 Enregistrer"}</button></div>
        </form>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export default function DashboardExpert() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [expert, setExpert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("accueil");

  // États spécifiques
  const [formations, setFormations] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [demandesAssignees, setDemandesAssignees] = useState<any[]>([]);
  const [mesDevis, setMesDevis] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<any>(null);
  const [newMsg, setNewMsg] = useState("");
  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [pubTemos, setPubTemos] = useState<any[]>([]);
  const [tIdx, setTIdx] = useState(0);
  const [tAnim, setTAnim] = useState(false);
  const [toast, setToast] = useState({ text: "", ok: true });
  const [selectedFormation, setSelectedFormation] = useState<any>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<any>(null);
  const [showCreatePodcastModal, setShowCreatePodcastModal] = useState(false);
  const [showEditPodcastModal, setShowEditPodcastModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<any>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [editProfil, setEditProfil] = useState({ domaine: "", description: "", localisation: "", telephone: "", annee_debut_experience: "" });
  const [devisMission, setDevisMission] = useState<any>(null);
  const [devisForm, setDevisForm] = useState({ montant: "", description: "", delai: "" });
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [newTemo, setNewTemo] = useState("");
  const [newTemoNote, setNewTemoNote] = useState(5);
  const msgEndRef = useRef<HTMLDivElement>(null);

  const tk = useCallback(() => localStorage.getItem("access_token") || "", []);
  const hdr = useCallback(() => ({ Authorization: `Bearer ${tk()}` }), [tk]);
  const hdrJ = useCallback(() => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" }), [tk]);

  function notify(text: string, ok = true) { setToast({ text, ok }); setTimeout(() => setToast({ text: "", ok: true }), 3200); }

  const forceLogout = useCallback(() => { localStorage.clear(); window.location.href = "/connexion"; }, []);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation]);

  useEffect(() => {
    if (!pubTemos.length) return;
    const t = setInterval(() => { if (!tAnim) setTIdx(p => (p + 1) % pubTemos.length); }, 5000);
    return () => clearInterval(t);
  }, [pubTemos.length, tAnim]);

  function goT(i: number) { if (tAnim || !pubTemos.length) return; setTAnim(true); setTimeout(() => { setTIdx(i); setTAnim(false); }, 280); }

  async function loadExpertData() {
    try {
      const [expertRes, formationsRes, podcastsRes, demandesRes, devisRes, temoignagesRes, pubTemosRes] = await Promise.all([
        fetch(`${BASE}/experts/moi`, { headers: hdr() }),
        fetch(`${BASE}/formations/expert/mes-formations`, { headers: hdr() }),
        fetch(`${BASE}/podcasts/expert/mes-podcasts`, { headers: hdr() }),
        fetch(`${BASE}/demandes-service/expert/assignees`, { headers: hdr() }),
        fetch(`${BASE}/devis/expert/mes-devis`, { headers: hdr() }),
        fetch(`${BASE}/temoignages/mes-temoignages`, { headers: hdr() }),
        fetch(`${BASE}/temoignages/publics`),
      ]);
      if (!expertRes.ok) throw new Error("Erreur chargement expert");
      const exp = await expertRes.json();
      setExpert(exp);
      setUser(exp.user);
      setEditProfil({ domaine: exp.domaine || "", description: exp.description || "", localisation: exp.localisation || "", telephone: exp.user?.telephone || "", annee_debut_experience: exp.annee_debut_experience?.toString() || "" });
      setFormations(formationsRes.ok ? await formationsRes.json() : []);
      setPodcasts(podcastsRes.ok ? await podcastsRes.json() : []);
      setDemandesAssignees(demandesRes.ok ? await demandesRes.json() : []);
      setMesDevis(devisRes.ok ? await devisRes.json() : []);
      setTemoignages(temoignagesRes.ok ? await temoignagesRes.json() : []);
      setPubTemos(pubTemosRes.ok ? await pubTemosRes.json() : []);
    } catch (err: any) {
      if (err.message === "AUTH_EXPIRED") forceLogout();
      else setError("Impossible de charger vos données.");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) { router.push("/connexion"); return; }
    let parsed: any;
    try { parsed = JSON.parse(userStr); } catch { router.push("/connexion"); return; }
    if (parsed.role !== "expert") { router.push("/"); return; }
    setUser(parsed);
    setLoading(true);
    loadExpertData();
  }, []);

  async function updatePhoto() {
    if (!photoFile) return;
    const fd = new FormData(); fd.append("photo", photoFile);
    const r = await fetch(`${BASE}/experts/photo`, { method: "POST", headers: { Authorization: `Bearer ${tk()}` }, body: fd });
    if (r.ok) { notify("✅ Photo mise à jour !"); await loadExpertData(); setPhotoFile(null); setPhotoPreview(""); }
    else notify("Erreur upload", false);
  }

  async function updateProfile() {
    const r = await fetch(`${BASE}/experts/profil`, { method: "PUT", headers: hdrJ(), body: JSON.stringify(editProfil) });
    if (r.ok) { notify("✅ Profil mis à jour !"); await loadExpertData(); }
    else notify("Erreur", false);
  }

  async function loadConversation(startupUserId: number) {
    const c = await fetch(`${BASE}/messages/conversation/${startupUserId}`, { headers: hdr() }).then(r => r.json());
    setConversation(Array.isArray(c) ? c : []);
  }

  async function sendMessage() {
    if (!newMsg.trim() || !selectedStartup) return;
    const r = await fetch(`${BASE}/messages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ receiver_id: selectedStartup.user_id, contenu: newMsg }) });
    if (r.ok) { setNewMsg(""); loadConversation(selectedStartup.user_id); }
    else notify("Erreur", false);
  }

  async function deleteMessage(msgId: number) {
    if (!confirm("Supprimer ce message ?")) return;
    const r = await fetch(`${BASE}/messages/${msgId}`, { method: "DELETE", headers: hdr() });
    if (r.ok) { notify("✅ Message supprimé"); if (selectedStartup) loadConversation(selectedStartup.user_id); }
    else notify("Erreur", false);
  }

  async function createDevis(e: React.FormEvent) {
    e.preventDefault();
    if (!devisMission) return;
    const r = await fetch(`${BASE}/devis`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ demande_id: devisMission.id, montant: parseInt(devisForm.montant), description: devisForm.description, delai: devisForm.delai }) });
    if (r.ok) { notify("✅ Devis envoyé !"); setShowDevisModal(false); setDevisMission(null); await loadExpertData(); }
    else notify("Erreur", false);
  }

  async function updateMissionStatus(demandeId: number, statut: string) {
    const r = await fetch(`${BASE}/demandes-service/${demandeId}/statut-expert`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut }) });
    if (r.ok) { notify(`✅ Mission ${statut === "en_cours" ? "en cours" : "terminée"} !`); await loadExpertData(); }
    else notify("Erreur", false);
  }

  async function envoyerTemoignage() {
    if (!newTemo.trim()) { notify("Écrivez votre témoignage", false); return; }
    const r = await fetch(`${BASE}/temoignages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ texte: newTemo, note: newTemoNote }) });
    if (r.ok) { notify("✅ Témoignage envoyé !"); setNewTemo(""); setNewTemoNote(5); await loadExpertData(); }
    else notify("Erreur", false);
  }

  async function handleDeletePodcast(id: number) {
    if (!confirm("Supprimer définitivement ce podcast ?")) return;
    try {
      const res = await fetch(`${BASE}/podcasts/expert/supprimer/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tk()}` },
      });
      if (res.ok) {
        notify("✅ Podcast supprimé !");
        await loadExpertData();
      } else {
        notify("Erreur lors de la suppression", false);
      }
    } catch {
      notify("Erreur réseau", false);
    }
  }

  const photoUrl = expert?.photo ? `${BASE}/uploads/photos/${expert.photo}` : null;
  const initials = user ? (user.prenom?.[0] || "") + (user.nom?.[0] || "") : "?";
  const curTemo = pubTemos[tIdx % Math.max(pubTemos.length, 1)];

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "accueil", label: "Accueil", icon: "🏠" },
    { id: "profil", label: "Mon Profil", icon: "👤" },
    { id: "formations", label: "Mes Formations", icon: "📚" },
    { id: "podcasts", label: "Mes Podcasts", icon: "🎙️" },
    { id: "demandes", label: "Missions", icon: "📋" },
    { id: "devis", label: "Mes Devis", icon: "📄" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "temoignages", label: "Témoignages", icon: "🌟" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}>
      <div style={{ textAlign: "center" }}><div style={{ width: 48, height: 48, border: "4px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} /><div style={{ color: "#0A2540", fontWeight: 600 }}>Chargement...</div></div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ padding: 32, maxWidth: 500, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>Erreur</div>
        <div style={{ color: "#64748B", marginBottom: 24 }}>{error}</div>
        <button className="btn btn-gold" onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F0F4FA;}
        .btn{font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;border:none;border-radius:10px;cursor:pointer;padding:10px 20px;font-size:13.5px;transition:all .2s;display:inline-flex;align-items:center;gap:7px;}
        .btn-gold{background:#F7B500;color:#0A2540;}.btn-gold:hover{background:#e6a800;transform:translateY(-2px);}
        .btn-dark{background:#0A2540;color:#fff;}.btn-dark:hover{background:#F7B500;color:#0A2540;}
        .btn-outline{background:transparent;border:2px solid #E8EEF6;color:#475569;}.btn-outline:hover{border-color:#F7B500;color:#F7B500;}
        .btn-green{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;}.btn-green:hover{background:#059669;color:#fff;}
        .btn-purple{background:#F3F0FF;color:#7C3AED;border:1px solid #DDD6FE;}.btn-purple:hover{background:#7C3AED;color:#fff;}
        .btn-gray{background:#F1F5F9;color:#475569;}.btn-gray:hover{background:#E2E8F0;}
        .btn-bl{background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;}.btn-bl:hover{background:#1D4ED8;color:#fff;}
        .card{background:#fff;border:1px solid #E8EEF6;border-radius:18px;overflow:hidden;}
        .inp{width:100%;background:#F7F9FC;border:1.5px solid #E2E8F0;border-radius:10px;padding:11px 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#0A2540;outline:none;}
        .inp:focus{border-color:#F7B500;}
        textarea.inp{resize:vertical;min-height:90px;}
        .lbl{font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px;}
        .tab-btn{background:none;border:none;cursor:pointer;padding:11px 8px;font-size:12.5px;font-weight:600;color:#8A9AB5;border-bottom:2.5px solid transparent;font-family:inherit;transition:all .2s;white-space:nowrap;display:flex;align-items:center;gap:5px;}
        .tab-btn.on{color:#0A2540;border-bottom-color:#F7B500;font-weight:800;}
        .msg-me{background:linear-gradient(135deg,#0A2540,#1a4080);color:#fff;border-radius:18px 18px 4px 18px;padding:10px 15px;max-width:72%;font-size:13.5px;line-height:1.65;}
        .msg-other{background:#F0F4FA;color:#0A2540;border-radius:18px 18px 18px 4px;padding:10px 15px;max-width:72%;font-size:13.5px;line-height:1.65;}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.6);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);}
        .modal-box{background:#fff;border-radius:24px;width:100%;max-width:660px;max-height:92vh;overflow-y:auto;box-shadow:0 28px 80px rgba(10,37,64,.25);}
        .upload-zone{display:block;border:2px dashed #D1D5DB;border-radius:10px;padding:16px;background:#F8FAFC;cursor:pointer;text-align:center;transition:border-color .2s;}
        .upload-zone:hover{border-color:#F7B500;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .badge{display:inline-flex;align-items:center;gap:4px;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .bo{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;}
        .bn{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;}
        .bw{background:#FFFBEB;color:#B45309;border:1px solid #FDE68A;border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;}
      `}</style>

      {toast.text && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.ok ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${toast.ok ? "#A7F3D0" : "#FECACA"}`, borderLeft: `4px solid ${toast.ok ? "#059669" : "#DC2626"}`, color: toast.ok ? "#059669" : "#DC2626", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 13, boxShadow: "0 8px 28px rgba(0,0,0,.12)" }}>
          {toast.text}
        </div>
      )}

      {selectedFormation && <FormationModal formation={selectedFormation} onClose={() => setSelectedFormation(null)} />}
      {selectedPodcast && <PodcastDetailModal podcast={selectedPodcast} onClose={() => setSelectedPodcast(null)} />}
      {showCreatePodcastModal && expert && (
        <CreatePodcastModal
          onClose={() => setShowCreatePodcastModal(false)}
          onSuccess={loadExpertData}
          expertData={expert}
        />
      )}
      {showEditPodcastModal && editingPodcast && expert && (
        <EditPodcastModal
          podcast={editingPodcast}
          onClose={() => { setShowEditPodcastModal(false); setEditingPodcast(null); }}
          onSuccess={loadExpertData}
          expertData={expert}
        />
      )}
      {showDevisModal && devisMission && (
        <div className="modal-bg" onClick={() => setShowDevisModal(false)}>
          <div className="modal-box" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "18px 24px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>📄 Créer un devis</div>
              <button onClick={() => setShowDevisModal(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
            <form onSubmit={createDevis} style={{ padding: "24px" }}>
              <div style={{ marginBottom: 16 }}><label className="lbl">Montant (DT) *</label><input className="inp" type="number" required value={devisForm.montant} onChange={e => setDevisForm({ ...devisForm, montant: e.target.value })} /></div>
              <div style={{ marginBottom: 16 }}><label className="lbl">Description du devis</label><textarea className="inp" rows={3} value={devisForm.description} onChange={e => setDevisForm({ ...devisForm, description: e.target.value })} /></div>
              <div style={{ marginBottom: 20 }}><label className="lbl">Délai (optionnel)</label><input className="inp" placeholder="Ex: 2 semaines" value={devisForm.delai} onChange={e => setDevisForm({ ...devisForm, delai: e.target.value })} /></div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button type="button" className="btn btn-gray" onClick={() => setShowDevisModal(false)}>Annuler</button><button type="submit" className="btn btn-green">Envoyer le devis</button></div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: "#0A2540", height: 62, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, background: "#F7B500", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#0A2540" }}>BEH</div>
          <div><div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Espace Expert</div><div style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }}>{user?.prenom} {user?.nom}</div></div>
        </div>
        <button onClick={forceLogout} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)", borderRadius: 9, padding: "7px 16px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13 }}>Déconnexion</button>
      </header>

      {/* ONGLETS */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8EEF6", position: "sticky", top: 62, zIndex: 90, overflowX: "auto" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px", display: "flex", gap: 4 }}>
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn${tab === t.id ? " on" : ""}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 24px" }}>
        {/* ACCUEIL */}
        {tab === "accueil" && (
          <div>
            <section style={{ position: "relative", overflow: "hidden", minHeight: 380 }}>
              <div style={{ position: "absolute", inset: 0 }}><Image src="/image.png" alt="" fill priority style={{ objectFit: "cover" }} /><div style={{ position: "absolute", inset: 0, background: "linear-gradient(108deg,rgba(6,14,26,.95) 0%,rgba(10,30,60,.78) 44%,rgba(10,37,64,.18) 100%)" }} /></div>
              <div style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "60px 32px 70px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, background: "rgba(247,181,0,.1)", border: "1px solid rgba(247,181,0,.22)", borderRadius: 99, padding: "5px 16px 5px 10px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F7B500", animation: "pulse 2s infinite" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#F7B500" }}>Bienvenue, {user?.prenom} 👋</span>
                </div>
                <h1 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#fff", marginBottom: 16, lineHeight: 1.1 }}>Accompagnez les <span style={{ color: "#F7B500" }}>startups</span><br />vers l'excellence</h1>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,.72)", maxWidth: 480, lineHeight: 1.9, marginBottom: 28 }}>Proposez vos formations, podcasts, et accompagnez les startups dans leur croissance.</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="btn btn-gold" onClick={() => setTab("formations")}>📚 Gérer mes formations</button>
                  <button className="btn btn-purple" onClick={() => setTab("podcasts")}>🎙️ Gérer mes podcasts</button>
                </div>
              </div>
            </section>

            <section style={{ padding: "48px 28px", background: "#F8FAFC" }}>
              <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
                <Reveal><div style={{ marginBottom: 36 }}><h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(28px,4vw,44px)", color: "#0A2540" }}>Notre <span style={{ fontStyle: "italic", color: "#F7B500" }}>ADN</span></h2></div></Reveal>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                  {ADN_ITEMS.map((card, i) => (
                    <Reveal key={i} delay={i * .1}>
                      <div className="adn-card" style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(10,37,64,.07)", padding: "22px 22px 20px", cursor: "pointer" }} onClick={() => window.open(`/a-propos#${card.anchor}`, "_blank")}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${card.color}15`, border: `1.5px solid ${card.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 18, color: card.color }}>{i === 0 ? <FaBullseye /> : i === 1 ? <FaRocket /> : <FaStar />}</div>
                        <h3 style={{ fontWeight: 700, color: "#0A2540", fontSize: 20, marginBottom: 8 }}>{card.title}</h3>
                        <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.82 }}>{card.body}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>

            {pubTemos.length > 0 && (
              <section style={{ padding: "48px 28px", background: "#fff" }}>
                <div style={{ maxWidth: 780, margin: "0 auto" }}>
                  <div style={{ textAlign: "center", marginBottom: 36 }}><h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(24px,4vw,38px)", color: "#0A2540" }}>Ce que disent nos <span style={{ color: "#F7B500" }}>clients</span></h2></div>
                  {curTemo && (
                    <div style={{ background: "#0A2540", borderRadius: 22, padding: "36px 44px", position: "relative", opacity: tAnim ? 0 : 1, transform: tAnim ? "scale(.97)" : "scale(1)", transition: "all .3s" }}>
                      <FaQuoteLeft style={{ position: "absolute", top: 22, left: 28, fontSize: 32, color: "rgba(247,181,0,.15)" }} />
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= (curTemo.note || 5) ? "#F7B500" : "#334155", fontSize: 20 }}>★</span>)}</div>
                      <p style={{ fontStyle: "italic", color: "#fff", lineHeight: 1.8, textAlign: "center", marginBottom: 24, fontSize: "clamp(15px,2vw,19px)" }}>&ldquo;{curTemo.texte}&rdquo;</p>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: "#0A2540", margin: "0 auto 10px" }}>{curTemo.user?.prenom?.[0]}{curTemo.user?.nom?.[0]}</div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{curTemo.user?.prenom} {curTemo.user?.nom}</div>
                        <div style={{ color: "#F7B500", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginTop: 4 }}>{curTemo.startup?.nom_startup || "Startup BEH"}</div>
                      </div>
                    </div>
                  )}
                  {pubTemos.length > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
                      <button onClick={() => goT((tIdx - 1 + pubTemos.length) % pubTemos.length)} style={{ width: 36, height: 36, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(247,181,0,.3)" }}><FaChevronLeft size={12} /></button>
                      <div style={{ display: "flex", gap: 6 }}>{pubTemos.map((_, i) => <button key={i} onClick={() => goT(i)} style={{ height: 6, width: i === tIdx ? 22 : 6, borderRadius: 99, background: i === tIdx ? "#F7B500" : "rgba(10,37,64,.2)", transition: "all .3s" }} />)}</div>
                      <button onClick={() => goT((tIdx + 1) % pubTemos.length)} style={{ width: 36, height: 36, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(247,181,0,.3)" }}><FaChevronRight size={12} /></button>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* PROFIL */}
        {tab === "profil" && (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div className="card" style={{ padding: "24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #F7B500" }}>
                  {photoPreview ? <img src={photoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : photoUrl ? <img src={photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#F7B500", fontWeight: 900, fontSize: 26 }}>{initials}</span>}
                </div>
                <label style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, background: "#F7B500", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #fff" }}>
                  <FaCamera style={{ fontSize: 11, color: "#0A2540" }} />
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
                </label>
              </div>
              <div><div style={{ fontWeight: 800, fontSize: 18, color: "#0A2540" }}>{user?.prenom} {user?.nom}</div><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 3 }}>{user?.email}</div>{photoFile && <button className="btn btn-gold" style={{ fontSize: 12, padding: "7px 14px", marginTop: 10 }} onClick={updatePhoto}><FaCheck /> Sauvegarder la photo</button>}</div>
            </div>
            <div className="card">
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>Informations professionnelles</div></div>
              <div style={{ padding: "24px" }}>
                <div style={{ marginBottom: 16 }}><label className="lbl">Domaine d'expertise</label><input className="inp" value={editProfil.domaine} onChange={e => setEditProfil({ ...editProfil, domaine: e.target.value })} placeholder="Ex: Marketing Digital" /></div>
                <div style={{ marginBottom: 16 }}><label className="lbl">Année de début d'expérience</label><input className="inp" type="number" value={editProfil.annee_debut_experience} onChange={e => setEditProfil({ ...editProfil, annee_debut_experience: e.target.value })} placeholder="2020" /></div>
                <div style={{ marginBottom: 16 }}><label className="lbl">Localisation</label><input className="inp" value={editProfil.localisation} onChange={e => setEditProfil({ ...editProfil, localisation: e.target.value })} placeholder="Tunis, Tunisie" /></div>
                <div style={{ marginBottom: 16 }}><label className="lbl">Téléphone</label><input className="inp" value={editProfil.telephone} onChange={e => setEditProfil({ ...editProfil, telephone: e.target.value })} placeholder="+216 XX XXX XXX" /></div>
                <div style={{ marginBottom: 20 }}><label className="lbl">Description / Compétences</label><textarea className="inp" rows={4} value={editProfil.description} onChange={e => setEditProfil({ ...editProfil, description: e.target.value })} placeholder="Décrivez votre expertise..." /></div>
                <button className="btn btn-gold" onClick={updateProfile}><FaSave /> Sauvegarder</button>
              </div>
            </div>
          </div>
        )}

        {/* MES FORMATIONS */}
        {tab === "formations" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div><h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540" }}>📚 Mes formations proposées</h2><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{formations.length} formation{formations.length > 1 ? "s" : ""}</div></div>
              <button className="btn btn-gold" onClick={() => router.push("/expert/proposer-formation")}>➕ Proposer une formation</button>
            </div>
            {formations.length === 0 ? (
              <div className="card" style={{ padding: 60, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>📚</div><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>Aucune formation proposée</div><button className="btn btn-gold" style={{ marginTop: 16 }} onClick={() => router.push("/expert/proposer-formation")}>Proposer une formation</button></div>
            ) : formations.map(f => (
              <div key={f.id} className="card" style={{ marginBottom: 14, padding: "18px 22px", borderLeft: `4px solid ${f.statut === "publie" ? "#10B981" : f.statut === "refuse" ? "#EF4444" : "#F7B500"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div><div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>{f.titre}</div><div style={{ fontSize: 12, color: "#64748B", marginTop: 3 }}>📁 {f.domaine || "Non spécifié"} · 👨‍🏫 {f.formateur || "Vous"}</div><div style={{ fontSize: 13, color: "#475569", marginTop: 6, maxWidth: 600 }}>{f.description?.slice(0, 120)}...</div>{f.commentaire_admin && <div style={{ marginTop: 10, background: "#FFF8E1", padding: "8px 12px", borderRadius: 8, fontSize: 12 }}><strong>📩 Admin :</strong> {f.commentaire_admin}</div>}<div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 8 }}>Soumis le {new Date(f.createdAt).toLocaleDateString("fr-FR")}</div></div>
                  <div><span className={`${f.statut === "publie" ? "bo" : f.statut === "refuse" ? "bn" : "bw"}`}>{f.statut === "publie" ? "✅ Publiée" : f.statut === "refuse" ? "❌ Refusée" : "⏳ En attente"}</span><button className="btn btn-gray" style={{ marginTop: 8, width: "100%" }} onClick={() => setSelectedFormation(f)}>👁 Détails</button></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MES PODCASTS (avec modification et suppression) */}
        {tab === "podcasts" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div><h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540" }}>🎙️ Mes podcasts proposés</h2><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{podcasts.length} podcast{podcasts.length > 1 ? "s" : ""}</div></div>
              <button className="btn btn-purple" onClick={() => setShowCreatePodcastModal(true)}>➕ Proposer un podcast</button>
            </div>
            {podcasts.length === 0 ? (
              <div className="card" style={{ padding: 60, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>🎙️</div><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>Aucun podcast proposé</div><button className="btn btn-purple" style={{ marginTop: 16 }} onClick={() => setShowCreatePodcastModal(true)}>Proposer un podcast</button></div>
            ) : podcasts.map(p => (
              <div key={p.id} className="card" style={{ marginBottom: 14, padding: "18px 22px", borderLeft: `4px solid ${p.statut === "publie" ? "#10B981" : p.statut === "refuse" ? "#EF4444" : "#F7B500"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>{p.titre}</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 3 }}>🎙️ {p.auteur || "Animateur inconnu"} · 📁 {p.domaine || "Non spécifié"}</div>
                    <div style={{ fontSize: 13, color: "#475569", marginTop: 6, maxWidth: 600 }}>{p.description?.slice(0, 120)}...</div>
                    <div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 8 }}>Soumis le {new Date(p.createdAt).toLocaleDateString("fr-FR")}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexDirection: "column" }}>
                    <span className={`${p.statut === "publie" ? "bo" : p.statut === "refuse" ? "bn" : "bw"}`}>
                      {p.statut === "publie" ? "✅ Publié" : p.statut === "refuse" ? "❌ Refusé" : "⏳ En attente"}
                    </span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-blue" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => { setEditingPodcast(p); setShowEditPodcastModal(true); }}>
                        <FaEdit /> Modifier
                      </button>
                      <button className="btn btn-red" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => handleDeletePodcast(p.id)}>
                        <FaTrash /> Supprimer
                      </button>
                      <button className="btn btn-gray" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setSelectedPodcast(p)}>
                        <FaHeadphones /> Écouter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MISSIONS ASSIGNÉES */}
        {tab === "demandes" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540" }}>📋 Mes missions assignées</div><button className="btn btn-s" onClick={loadExpertData}>🔄 Rafraîchir</button></div>
            <div style={{ fontSize: 13, color: "#8A9AB5", marginBottom: 20 }}>{demandesAssignees.length} mission{demandesAssignees.length > 1 ? "s" : ""} assignée{demandesAssignees.length > 1 ? "s" : ""}</div>
            {demandesAssignees.length === 0 ? (
              <div className="card" style={{ padding: 52, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 14 }}>📋</div><div style={{ fontWeight: 700, color: "#0A2540", fontSize: 16, marginBottom: 6 }}>Aucune mission assignée</div><div style={{ fontSize: 13, color: "#8A9AB5" }}>L'admin vous assignera des demandes clients adaptées à votre expertise.</div></div>
            ) : demandesAssignees.map(d => (
              <div key={d.id} className="card" style={{ padding: "18px 22px", marginBottom: 14, borderLeft: `4px solid ${d.statut === "en_cours" ? "#3B82F6" : d.statut === "terminee" ? "#8B5CF6" : "#F7B500"}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}><div style={{ width: 40, height: 40, borderRadius: "50%", background: "#0A2540", color: "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{d.user?.prenom?.[0]}{d.user?.nom?.[0]}</div><div><div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>{d.user?.prenom} {d.user?.nom}</div><div style={{ fontSize: 11, color: "#8A9AB5" }}>{d.user?.email}</div></div></div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}><span className="badge" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>🛠️ {d.service}</span>{d.budget && <span className="badge" style={{ background: "#ECFDF5", color: "#059669" }}>💰 {d.budget}</span>}{d.delai && <span className="badge" style={{ background: "#FFF8E1", color: "#B45309" }}>⏱ {d.delai}</span>}{d.telephone && <span className="badge" style={{ background: "#F1F5F9", color: "#374151" }}>📞 {d.telephone}</span>}</div>
                    {d.description && <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.75, margin: "0 0 8px", background: "#F8FAFC", padding: "10px 12px", borderRadius: 8 }}>{d.description}</p>}
                    {d.objectif && <p style={{ fontSize: 13, color: "#7C3AED", margin: 0, fontWeight: 600 }}>🎯 Objectif : {d.objectif}</p>}
                    {d.note_suivi && <div style={{ marginTop: 8, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#1D4ED8" }}>📩 Note admin : {d.note_suivi}</div>}
                    <div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 8 }}>Assignée le {new Date(d.createdAt).toLocaleDateString("fr-FR")}</div>
                  </div>
                  <div style={{ flexShrink: 0, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <button className="btn btn-bl" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => { setDevisMission(d); setDevisForm({ montant: "", description: "", delai: "" }); setShowDevisModal(true); }}>📄 Créer un devis</button>
                    {d.statut === "en_attente" && <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => updateMissionStatus(d.id, "en_cours")}>🔄 Démarrer la mission</button>}
                    {d.statut === "en_cours" && <button className="btn btn-purple" style={{ fontSize: 12 }} onClick={() => updateMissionStatus(d.id, "terminee")}>✔️ Marquer terminée</button>}
                    <span className="badge" style={{ background: d.statut === "en_cours" ? "#EFF6FF" : d.statut === "terminee" ? "#F3F0FF" : "#FFF8E1", color: d.statut === "en_cours" ? "#1D4ED8" : d.statut === "terminee" ? "#7C3AED" : "#B45309" }}>{d.statut === "en_cours" ? "🔄 En cours" : d.statut === "terminee" ? "✔️ Terminée" : "⏳ En attente"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MES DEVIS */}
        {tab === "devis" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540", marginBottom: 6 }}>📄 Mes devis envoyés</div>
            <div style={{ fontSize: 13, color: "#8A9AB5", marginBottom: 20 }}>{mesDevis.length} devis{mesDevis.length > 1 ? "s" : ""}</div>
            {mesDevis.length === 0 ? (
              <div className="card" style={{ padding: 52, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 14 }}>📄</div><div style={{ fontWeight: 700, color: "#0A2540", fontSize: 16, marginBottom: 6 }}>Aucun devis</div><div style={{ fontSize: 13, color: "#8A9AB5" }}>Créez des devis depuis vos missions assignées.</div></div>
            ) : mesDevis.map(d => (
              <div key={d.id} className="card" style={{ padding: "18px 22px", marginBottom: 14, borderLeft: `4px solid ${d.statut === "accepte" ? "#22C55E" : d.statut === "refuse" ? "#EF4444" : "#F7B500"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div><div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>Devis #{d.id} - {d.demande?.service || "Mission"}</div><div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Client : {d.demande?.user?.prenom} {d.demande?.user?.nom}</div><div style={{ fontSize: 13, fontWeight: 700, color: "#F7B500", marginTop: 6 }}>💰 {d.montant} DT</div>{d.description && <p style={{ fontSize: 13, color: "#475569", marginTop: 8, background: "#F8FAFC", padding: "8px 12px", borderRadius: 8 }}>{d.description}</p>}{d.delai && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>⏱ Délai : {d.delai}</div>}<div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 8 }}>Envoyé le {new Date(d.createdAt).toLocaleDateString("fr-FR")}</div></div>
                  <div><span className={`${d.statut === "accepte" ? "bo" : d.statut === "refuse" ? "bn" : "bw"}`}>{d.statut === "accepte" ? "✅ Accepté" : d.statut === "refuse" ? "❌ Refusé" : "⏳ En attente"}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 16, height: "calc(100vh - 200px)" }}>
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9", fontWeight: 700, background: "#FAFBFE" }}>Clients ({demandesAssignees.map(d => d.user).filter(u => u).length})</div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {demandesAssignees.map(d => d.user && (
                  <div key={d.user.id} onClick={() => { setSelectedStartup(d.user); loadConversation(d.user.id); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", cursor: "pointer", background: selectedStartup?.id === d.user.id ? "#FFFBEB" : "transparent", borderLeft: selectedStartup?.id === d.user.id ? "3px solid #F7B500" : "3px solid transparent" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid #F7B500", color: "#F7B500", fontWeight: 800, fontSize: 11 }}>{d.user.prenom?.[0]}{d.user.nom?.[0]}</div>
                    <div><div style={{ fontWeight: 600, fontSize: 12.5, color: "#0A2540" }}>{d.user.prenom} {d.user.nom}</div><div style={{ fontSize: 11, color: "#8A9AB5" }}>{d.service}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>
              {!selectedStartup ? <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#8A9AB5" }}><div style={{ fontSize: 44, marginBottom: 12 }}>💬</div><div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>Sélectionnez un client</div></div> : (
                <>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 12, background: "#FAFBFE" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 800, fontSize: 13 }}>{selectedStartup.prenom?.[0]}{selectedStartup.nom?.[0]}</div>
                    <div><div style={{ fontWeight: 700, color: "#0A2540", fontSize: 14 }}>{selectedStartup.prenom} {selectedStartup.nom}</div><div style={{ fontSize: 12, color: "#8A9AB5" }}>Startup</div></div>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 9 }}>
                    {conversation.length === 0 && <div style={{ textAlign: "center", color: "#8A9AB5", padding: "36px 0" }}>Démarrez la conversation !</div>}
                    {conversation.map(m => {
                      const isMe = m.sender_id === user?.id;
                      return (
                        <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "center", gap: 8 }}>
                          <div className={isMe ? "msg-me" : "msg-other"}>{m.contenu}<div style={{ fontSize: 10, opacity: .55, marginTop: 3, textAlign: "right" }}>{new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div></div>
                          {isMe && <button onClick={() => deleteMessage(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 12 }}><FaTrash /></button>}
                        </div>
                      );
                    })}
                    <div ref={msgEndRef} />
                  </div>
                  <div style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 9 }}>
                    <input className="inp" placeholder="Votre message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} style={{ flex: 1 }} />
                    <button className="btn btn-gold" style={{ padding: "10px 16px" }} onClick={sendMessage}><FaPaperPlane /></button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TÉMOIGNAGES */}
        {tab === "temoignages" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card"><div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>✍️ Partager mon expérience</div></div><div style={{ padding: "24px" }}>
              <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#0369A1" }}>💡 Votre témoignage sera examiné avant d'être publié.</div>
              <label className="lbl">Votre note</label><div style={{ display: "flex", gap: 4, marginBottom: 16 }}>{[1, 2, 3, 4, 5].map(s => (<span key={s} onClick={() => setNewTemoNote(s)} style={{ fontSize: 30, cursor: "pointer", color: s <= newTemoNote ? "#F7B500" : "#E2E8F0" }}>★</span>))}<span style={{ fontSize: 13, color: "#F7B500", fontWeight: 600, marginLeft: 8 }}>{newTemoNote}/5</span></div>
              <label className="lbl">Votre témoignage</label><textarea className="inp" rows={5} placeholder="Partagez votre expérience avec BEH..." value={newTemo} onChange={e => setNewTemo(e.target.value)} style={{ marginBottom: 16 }} />
              <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }} onClick={envoyerTemoignage}><FaPaperPlane /> Envoyer</button>
            </div></div>
            <div className="card"><div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>Mes témoignages ({temoignages.length})</div></div><div style={{ padding: "16px", maxHeight: 460, overflowY: "auto" }}>
              {temoignages.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: "#8A9AB5" }}>Aucun témoignage</div> : temoignages.map(t => (
                <div key={t.id} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", marginBottom: 10, border: "1px solid #E8EEF6" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><div style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= (t.note || 5) ? "#F7B500" : "#E2E8F0", fontSize: 15 }}>★</span>)}<span style={{ fontSize: 11, color: "#94A3B8", marginLeft: 5 }}>{new Date(t.createdAt).toLocaleDateString("fr-FR")}</span></div><span className={`${t.statut === "valide" ? "bo" : t.statut === "refuse" ? "bn" : "bw"}`}>{t.statut === "valide" ? "✅ Publié" : t.statut === "refuse" ? "❌ Refusé" : "⏳ En attente"}</span></div>
                  <p style={{ fontSize: 13.5, color: "#334155", fontStyle: "italic", margin: 0 }}>"{t.texte}"</p>
                </div>
              ))}
            </div></div>
          </div>
        )}
      </div>

      <footer style={{ background: "#0A2540", color: "#fff", padding: "32px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 40 }}>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>© 2026 Business Expert Hub</p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Plateforme d'accompagnement des startups</p>
      </footer>
    </>
  );
}