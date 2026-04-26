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
  FaPlus, FaUpload, FaFileAudio, FaImage, FaInfoCircle, FaSync,
  FaSpinner, FaEye, FaHourglassHalf, FaCheckDouble, FaTag, FaMapMarkerAlt,
  FaChalkboardTeacher, FaVideo, FaCalendarAlt, FaDollarSign
} from "react-icons/fa";

const BASE = "http://localhost:3001";

const ADN_ITEMS = [
  { title: "Notre Vision", body: "Devenir la référence absolue en accompagnement de startups innovantes.", color: "#3B82F6", anchor: "vision" },
  { title: "Notre Mission", body: "Offrir aux startups un accès privilégié à des experts certifiés.", color: "#F7B500", anchor: "mission" },
  { title: "Nos Valeurs", body: "Excellence, transparence et engagement humain.", color: "#10B981", anchor: "valeurs" },
];

type Tab = "accueil" | "profil" | "formations" | "podcasts" | "demandes" | "devis" | "messages" | "temoignages" | "rdv";

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

// ========== MODAL PODCAST DETAIL ==========
function PodcastDetailModal({ podcast, onClose }: { podcast: any; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => { if (audioRef.current) audioRef.current.load(); }, [podcast]);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", padding: "20px 24px", borderRadius: "20px 20px 0 0", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.15)", border: "none", cursor: "pointer", color: "#fff" }}>✕</button>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {podcast.image ? <img src={`${BASE}/uploads/podcasts-images/${podcast.image}`} style={{ width: 70, height: 70, borderRadius: 12, objectFit: "cover" }} alt="" /> : <div style={{ width: 70, height: 70, borderRadius: 12, background: "rgba(139,92,246,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaMicrophone style={{ fontSize: 32, color: "#C4B5FD" }} /></div>}
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

// ========== MODAL CREATE PODCAST ==========
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
          <div style={{ marginBottom: 16 }}><label className="lbl">Image de couverture</label><label className="upload-zone" style={{ minHeight: 80 }}><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />{imagePreview ? <img src={imagePreview} style={{ maxHeight: 60, borderRadius: 6 }} alt="" /> : <><FaImage /> Cliquer pour uploader une image</>}</label></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}><button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button><button type="submit" className="btn btn-green" disabled={loading}>{loading ? "⏳ Envoi..." : "✅ Proposer"}</button></div>
        </form>
      </div>
    </div>
  );
}

// ========== MODAL EDIT PODCAST ==========
function EditPodcastModal({ podcast, onClose, onSuccess }: { podcast: any; onClose: () => void; onSuccess: () => void }) {
  const [titre, setTitre] = useState(podcast.titre || "");
  const [description, setDescription] = useState(podcast.description || "");
  const [auteur, setAuteur] = useState(podcast.auteur || "");
  const [domaine, setDomaine] = useState(podcast.domaine || "");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState("");
  const [imagePreview, setImagePreview] = useState(podcast.image ? `${BASE}/uploads/podcasts-images/${podcast.image}` : "");
  const [loading, setLoading] = useState(false);

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
            <div><label className="lbl">Auteur / Animateur</label><input className="inp" value={auteur} onChange={e => setAuteur(e.target.value)} /></div>
            <div><label className="lbl">Domaine</label><input className="inp" value={domaine} onChange={e => setDomaine(e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 16 }}><label className="lbl">Fichier audio (laisser vide pour conserver l'actuel)</label><label className="upload-zone" style={{ minHeight: 80 }}><input type="file" accept="audio/mpeg" onChange={e => { const f = e.target.files?.[0]; if (f) { setAudioFile(f); setAudioPreview(f.name); } }} style={{ display: "none" }} />{audioPreview ? <span>✅ {audioPreview}</span> : podcast.url_audio ? <span>🔊 Fichier actuel : {podcast.url_audio}</span> : <><FaFileAudio /> Cliquer pour uploader</>}</label></div>
          <div style={{ marginBottom: 16 }}><label className="lbl">Image (laisser vide pour conserver l'actuelle)</label><label className="upload-zone" style={{ minHeight: 80 }}><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />{imagePreview ? <img src={imagePreview} style={{ maxHeight: 60, borderRadius: 6 }} alt="" /> : <><FaImage /> Cliquer pour uploader</>}</label></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}><button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button><button type="submit" className="btn btn-green" disabled={loading}>{loading ? "⏳ Envoi..." : "💾 Enregistrer"}</button></div>
        </form>
      </div>
    </div>
  );
}

// ========== MODAL RESCHEDULE (proposer nouveau créneau) ==========
function RescheduleModal({ rdv, onClose, onSuccess, hdrJ }: {
  rdv: any;
  onClose: () => void;
  onSuccess: () => void;
  hdrJ: () => Record<string, string>;
}) {
  const [newDate, setNewDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/rendez-vous/${rdv.id}/proposer-creneau`, {
        method: "POST",
        headers: hdrJ(),
        body: JSON.stringify({ nouvelle_date: newDate, raison: reason }),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else if (res.status === 404) {
        const formattedDate = new Date(newDate).toLocaleString("fr-FR", {
          day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
        });
        const contenu =
          `__RDV_PROPOSAL__\n` +
          `rdv_id:${rdv.id}\n` +
          `nouvelle_date:${newDate}\n` +
          `date_formatted:${formattedDate}\n` +
          `raison:${reason || "Non précisée"}\n` +
          `__END__\n\n` +
          `📅 Proposition de nouveau créneau pour le RDV du ${new Date(rdv.date_rdv).toLocaleString("fr-FR")} :\n` +
          `Nouveau créneau proposé : **${formattedDate}**` +
          (reason ? `\nRaison : ${reason}` : "");
        const msgRes = await fetch(`${BASE}/messages`, {
          method: "POST",
          headers: hdrJ(),
          body: JSON.stringify({ receiver_id: rdv.client_id || rdv.startup?.user_id || rdv.startup_id, contenu }),
        });
        if (msgRes.ok) { onSuccess(); onClose(); }
        else alert("Impossible d'envoyer la proposition");
      } else {
        const err = await res.text();
        alert(`Erreur : ${err}`);
      }
    } catch {
      alert("Erreur réseau");
    }
    setLoading(false);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "18px 24px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 4 }}>Rendez-vous</div>
            <div style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>📅 Proposer un nouveau créneau</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: "20px 24px", background: "#FFFBEB", borderBottom: "1px solid #FDE68A" }}>
          <div style={{ fontSize: 13, color: "#92400E" }}><strong>RDV actuel :</strong> {new Date(rdv.date_rdv).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
          {rdv.sujet && <div style={{ fontSize: 12, color: "#B45309", marginTop: 4 }}>📌 {rdv.sujet}</div>}
          <div style={{ fontSize: 12, color: "#B45309", marginTop: 4 }}>Client : {rdv.client?.prenom} {rdv.client?.nom}</div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Nouvelle date & heure proposée *</label>
            <input className="inp" type="datetime-local" required value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().slice(0, 16)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="lbl">Raison du changement (optionnelle)</label>
            <textarea className="inp" rows={3} placeholder="Ex: Conflit d'agenda, indisponibilité..." value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#0369A1" }}>📨 La startup recevra une notification et pourra accepter ou refuser ce nouveau créneau.</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-gold" disabled={loading || !newDate}>
              {loading ? "⏳ Envoi..." : "📅 Envoyer la proposition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== MODAL CRÉATION FORMATION (domaine et formateur auto) ==========
function CreateFormationModal({ onClose, onSuccess, expertData }: { onClose: () => void; onSuccess: () => void; expertData: any }) {
  const [loading, setLoading] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [type, setType] = useState("en_ligne");
  const [duree, setDuree] = useState("");
  const [certifiante, setCertifiante] = useState("non");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [lienFormation, setLienFormation] = useState("");
  const [gratuit, setGratuit] = useState(false);
  const [prix, setPrix] = useState("");
  const [placesLimitees, setPlacesLimitees] = useState(false);
  const [placesDisponibles, setPlacesDisponibles] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const autoDomaine = expertData?.domaine || "";
  const autoFormateur = expertData?.user ? `${expertData.user.prenom || ""} ${expertData.user.nom || ""}`.trim() : "";

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : "";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("titre", titre);
    formData.append("description", description);
    formData.append("localisation", localisation);
    formData.append("formateur", autoFormateur);
    formData.append("type", type);
    formData.append("duree", duree);
    formData.append("domaine", autoDomaine);
    formData.append("certifiante", certifiante);
    if (dateDebut) formData.append("dateDebut", dateDebut);
    if (dateFin) formData.append("dateFin", dateFin);
    if (lienFormation) formData.append("lien_formation", lienFormation);
    formData.append("gratuit", gratuit ? "true" : "false");
    if (!gratuit && prix) formData.append("prix", prix);
    formData.append("places_limitees", placesLimitees ? "true" : "false");
    if (placesLimitees && placesDisponibles) formData.append("places_disponibles", placesDisponibles);
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(`${BASE}/formations/expert/proposer`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const err = await res.text();
        alert(`Erreur : ${err}`);
      }
    } catch {
      alert("Erreur réseau");
    }
    setLoading(false);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "18px 24px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ color: "#F7B500", fontSize: 14, fontWeight: 600 }}>Nouvelle formation</div><div style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>📚 Proposer une formation</div></div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Titre *</label>
            <input className="inp" required value={titre} onChange={e => setTitre(e.target.value)} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Description</label>
            <textarea className="inp" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label className="lbl">Localisation</label>
              <input className="inp" value={localisation} onChange={e => setLocalisation(e.target.value)} placeholder="Lieu ou 'En ligne'" />
            </div>
            <div>
              <label className="lbl">Type</label>
              <select className="inp" value={type} onChange={e => setType(e.target.value)}>
                <option value="en_ligne">En ligne</option>
                <option value="presentiel">Présentiel</option>
                <option value="mixte">Mixte</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label className="lbl">Durée (ex: 2h, 2 jours)</label>
              <input className="inp" value={duree} onChange={e => setDuree(e.target.value)} placeholder="ex: 2h" />
            </div>
            <div>
              <label className="lbl">Certifiante ?</label>
              <select className="inp" value={certifiante} onChange={e => setCertifiante(e.target.value)}>
                <option value="non">Non</option>
                <option value="oui">Oui (certificat délivré)</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label className="lbl">Date de début</label>
              <input className="inp" type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
            </div>
            <div>
              <label className="lbl">Date de fin</label>
              <input className="inp" type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Lien de la formation (optionnel)</label>
            <input className="inp" value={lienFormation} onChange={e => setLienFormation(e.target.value)} placeholder="URL vers la plateforme" />
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 16, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={gratuit} onChange={e => setGratuit(e.target.checked)} /> Gratuit
            </label>
            {!gratuit && (
              <div style={{ flex: 1 }}>
                <label className="lbl">Prix (DT)</label>
                <input className="inp" type="number" value={prix} onChange={e => setPrix(e.target.value)} />
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 16, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={placesLimitees} onChange={e => setPlacesLimitees(e.target.checked)} /> Places limitées
            </label>
            {placesLimitees && (
              <div style={{ flex: 1 }}>
                <label className="lbl">Places disponibles</label>
                <input className="inp" type="number" value={placesDisponibles} onChange={e => setPlacesDisponibles(e.target.value)} />
              </div>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Image de couverture</label>
            <label className="upload-zone" style={{ minHeight: 80 }}>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              {imagePreview ? <img src={imagePreview} style={{ maxHeight: 60, borderRadius: 6 }} alt="" /> : <><FaImage /> Cliquer pour uploader</>}
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-gold" disabled={loading}>{loading ? "⏳ Envoi..." : "📤 Proposer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========== COMPOSANT PRINCIPAL EXPERT ==========
export default function DashboardExpert() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [expert, setExpert] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("accueil");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [demandesAssignees, setDemandesAssignees] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [loadingFormations, setLoadingFormations] = useState(false);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [mesDevis, setMesDevis] = useState<any[]>([]);
  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [pubTemos, setPubTemos] = useState<any[]>([]);
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);
  const [tIdx, setTIdx] = useState(0);
  const [tAnim, setTAnim] = useState(false);
  const [toast, setToast] = useState({ text: "", ok: true });
  const [selectedPodcast, setSelectedPodcast] = useState<any>(null);
  const [showCreatePodcastModal, setShowCreatePodcastModal] = useState(false);
  const [showEditPodcastModal, setShowEditPodcastModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<any>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<any>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [editProfil, setEditProfil] = useState({ domaine: "", description: "", localisation: "", telephone: "", annee_debut_experience: "" });
  const [modificationEnAttente, setModificationEnAttente] = useState(false);
  const [devisMission, setDevisMission] = useState<any>(null);
  const [devisForm, setDevisForm] = useState({ montant: "", description: "", delai: "" });
  const [showDevisModal, setShowDevisModal] = useState(false);
  const [newTemo, setNewTemo] = useState("");
  const [newTemoNote, setNewTemoNote] = useState(5);
  const [showCreateFormationModal, setShowCreateFormationModal] = useState(false);

  const tk = useCallback(() => localStorage.getItem("access_token") || "", []);
  const hdr = useCallback(() => ({ Authorization: `Bearer ${tk()}` }), [tk]);
  const hdrJ = useCallback(() => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" }), [tk]);

  function notify(text: string, ok = true) { setToast({ text, ok }); setTimeout(() => setToast({ text: "", ok: true }), 3200); }
  const forceLogout = useCallback(() => { localStorage.clear(); window.location.href = "/connexion"; }, []);

  const [seenTabs, setSeenTabs] = useState<Set<Tab>>(new Set(["accueil"]));
  const handleTabChange = useCallback((newTab: Tab) => { setTab(newTab); setSeenTabs(prev => { const next = new Set(prev); next.add(newTab); return next; }); }, []);
  const unreadMsgCount = allMessages.filter(m => m.receiver_id === user?.id && !m.lu).length;
  const pendingRdvCount = rdvs.filter(r => r.statut === "en_attente").length;
  const rdvProposalCount = rdvs.filter(r => r.proposition_en_attente).length;
  const notificationsCount = notifications.length;
  const showMsgBadge = tab !== "messages" && unreadMsgCount > 0;
  const showRdvBadge = tab !== "rdv" && (pendingRdvCount > 0 || rdvProposalCount > 0);
  const showDemandesBadge = tab !== "demandes" && notificationsCount > 0;

  // Auth
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = tk();
    if (!token) { router.replace("/connexion"); return; }
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (!res.ok) { localStorage.clear(); router.replace("/connexion"); throw new Error("Token invalide"); }
        const realUser = await res.json();
        if (realUser.role !== "expert") { localStorage.clear(); router.replace("/"); throw new Error("Rôle non autorisé"); }
        setUser(realUser);
        localStorage.setItem("user", JSON.stringify(realUser));
        await loadExpertData(realUser.id);
      })
      .catch(err => { console.error(err); setErrorAuth("Impossible de vérifier votre identité."); })
      .finally(() => setLoadingAuth(false));
  }, []);

  const loadExpertData = useCallback(async (userId: number) => {
    setLoading(true);
    setLoadingFormations(true);
    try {
      const [expertRes, formationsRes, podcastsRes, demandesRes, devisRes, temoignagesRes, pubTemosRes, rdvsRes, notifsRes] = await Promise.all([
        fetch(`${BASE}/experts/moi`, { headers: hdr() }),
        fetch(`${BASE}/formations/expert/mes-formations`, { headers: hdr() }),
        fetch(`${BASE}/podcasts/expert/mes-podcasts`, { headers: hdr() }),
        fetch(`${BASE}/demandes-service/expert/assignees`, { headers: hdr() }),
        fetch(`${BASE}/devis/expert/mes-devis`, { headers: hdr() }),
        fetch(`${BASE}/temoignages/mes-temoignages`, { headers: hdr() }),
        fetch(`${BASE}/temoignages/publics`),
        fetch(`${BASE}/rendez-vous/expert`, { headers: hdr() }),
        fetch(`${BASE}/demandes-service/expert/notifications`, { headers: hdr() }),
      ]);
      if (!expertRes.ok) throw new Error("Erreur chargement expert");
      const exp = await expertRes.json();
      setExpert(exp);
      setEditProfil({ domaine: exp.domaine || "", description: exp.description || "", localisation: exp.localisation || "", telephone: exp.user?.telephone || "", annee_debut_experience: exp.annee_debut_experience?.toString() || "" });
      setModificationEnAttente(exp.modification_demandee === true);
      if (formationsRes.ok) setFormations(await formationsRes.json());
      else setFormations([]);
      setPodcasts(podcastsRes.ok ? await podcastsRes.json() : []);
      setDemandesAssignees(demandesRes.ok ? await demandesRes.json() : []);
      setMesDevis(devisRes.ok ? await devisRes.json() : []);
      setTemoignages(temoignagesRes.ok ? await temoignagesRes.json() : []);
      setPubTemos(pubTemosRes.ok ? await pubTemosRes.json() : []);
      setRdvs(rdvsRes.ok ? await rdvsRes.json() : []);
      if (notifsRes.ok) setNotifications(await notifsRes.json());
      await refreshAllMessages();
    } catch (err: any) { notify("Erreur chargement des données", false); } finally { setLoading(false); setLoadingFormations(false); }
  }, [hdr]);

  const refreshAllMessages = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/messages/mes-messages`, { headers: hdr() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const messages = await res.json();
      setAllMessages(messages);
      const contactsMap = new Map();
      for (const m of messages) {
        const otherId = m.sender_id === user?.id ? m.receiver_id : m.sender_id;
        if (!contactsMap.has(otherId) && otherId) {
          const otherUser = m.sender_id === user?.id ? m.receiver : m.sender;
          if (otherUser) contactsMap.set(otherId, { id: otherId, prenom: otherUser.prenom, nom: otherUser.nom, email: otherUser.email, service: "Client" });
          else contactsMap.set(otherId, { id: otherId, prenom: "?", nom: "?", email: "", service: "Client" });
        }
      }
      demandesAssignees.forEach(d => { const u = d.user; if (u?.id && contactsMap.has(u.id)) contactsMap.set(u.id, { ...contactsMap.get(u.id), service: d.service }); else if (u?.id) contactsMap.set(u.id, { id: u.id, prenom: u.prenom, nom: u.nom, email: u.email, service: d.service }); });
      setContacts(Array.from(contactsMap.values()));
      if (selectedContact) {
        const filtered = messages.filter((m: any) => (m.sender_id === selectedContact.id && m.receiver_id === user?.id) || (m.sender_id === user?.id && m.receiver_id === selectedContact.id));
        setConversation(filtered.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      }
    } catch (err) { console.error("Erreur refreshAllMessages", err); }
  }, [hdr, user?.id, demandesAssignees, selectedContact]);

  const loadConversation = useCallback(async (contactUserId: number) => {
    const contact = contacts.find(c => c.id === contactUserId);
    if (!contact) return;
    setSelectedContact(contact);
    const filtered = allMessages.filter((m: any) => (m.sender_id === contactUserId && m.receiver_id === user?.id) || (m.sender_id === user?.id && m.receiver_id === contactUserId));
    setConversation(filtered.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    try { await fetch(`${BASE}/messages/mark-read/${contactUserId}`, { method: "PATCH", headers: hdr() }); setAllMessages(prev => prev.map(m => m.sender_id === contactUserId ? { ...m, lu: true } : m)); } catch {}
  }, [contacts, allMessages, user?.id, hdr]);

  const sendMessage = async () => { if (!newMsg.trim() || !selectedContact) return; try { const r = await fetch(`${BASE}/messages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ receiver_id: selectedContact.id, contenu: newMsg }) }); if (r.ok) { setNewMsg(""); await refreshAllMessages(); } else notify("Erreur envoi", false); } catch { notify("Erreur réseau", false); } };
  const deleteMessage = async (msgId: number) => { if (!confirm("Supprimer ?")) return; try { const r = await fetch(`${BASE}/messages/${msgId}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("✅ Supprimé"); await refreshAllMessages(); } else notify("Erreur", false); } catch { notify("Erreur réseau", false); } };
  const accepterNotification = async (demandeId: number) => { try { const res = await fetch(`${BASE}/demandes-service/${demandeId}/accepter`, { method: "PUT", headers: hdrJ() }); if (res.ok) { notify("✅ Mission acceptée"); await loadExpertData(user?.id); } else notify("Erreur", false); } catch { notify("Erreur réseau", false); } };
  const refuserNotification = async (demandeId: number) => { if (!confirm("Refuser ?")) return; try { const res = await fetch(`${BASE}/demandes-service/${demandeId}/refuser`, { method: "PUT", headers: hdrJ() }); if (res.ok) { notify("❌ Refusée"); await loadExpertData(user?.id); } else notify("Erreur", false); } catch { notify("Erreur réseau", false); } };
  const updateMissionStatus = async (demandeId: number, statut: string) => { const r = await fetch(`${BASE}/demandes-service/${demandeId}/statut-expert`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut }) }); if (r.ok) { notify(`✅ Mission ${statut === "en_cours" ? "en cours" : "terminée"}`); await loadExpertData(user?.id); } else notify("Erreur", false); };
  const confirmerRdv = async (rdvId: number) => { const r = await fetch(`${BASE}/rendez-vous/${rdvId}/confirmer`, { method: "PUT", headers: hdrJ() }); if (r.ok) { notify("✅ Confirmé"); await loadExpertData(user?.id); } else notify("Erreur", false); };
  const annulerRdv = async (rdvId: number) => { if (!confirm("Annuler ?")) return; const r = await fetch(`${BASE}/rendez-vous/${rdvId}/annuler`, { method: "PUT", headers: hdrJ() }); if (r.ok) { notify("❌ Annulé"); await loadExpertData(user?.id); } else notify("Erreur", false); };
  const updatePhoto = async () => { if (!photoFile) return; const fd = new FormData(); fd.append("photo", photoFile); const r = await fetch(`${BASE}/experts/photo`, { method: "POST", headers: { Authorization: `Bearer ${tk()}` }, body: fd }); if (r.ok) { notify("✅ Photo mise à jour"); await loadExpertData(user?.id); setPhotoFile(null); setPhotoPreview(""); } else notify("Erreur", false); };
  const updateProfile = async () => { const payload: any = {}; if (editProfil.domaine !== (expert?.domaine || "")) payload.domaine = editProfil.domaine; if (editProfil.description !== (expert?.description || "")) payload.description = editProfil.description; if (editProfil.localisation !== (expert?.localisation || "")) payload.localisation = editProfil.localisation; if (editProfil.telephone !== (expert?.user?.telephone || "")) payload.telephone = editProfil.telephone; const anneeNum = parseInt(editProfil.annee_debut_experience); if (!isNaN(anneeNum) && anneeNum !== expert?.annee_debut_experience) payload.annee_debut_experience = anneeNum; else if (editProfil.annee_debut_experience === "" && expert?.annee_debut_experience !== null) payload.annee_debut_experience = null; if (Object.keys(payload).length === 0) { notify("Aucune modification", false); return; } const res = await fetch(`${BASE}/experts/profil`, { method: "PUT", headers: hdrJ(), body: JSON.stringify(payload) }); if (res.ok) { notify("✅ Modification envoyée"); await loadExpertData(user?.id); } else notify("Erreur", false); };
  const createDevis = async (e: React.FormEvent) => { e.preventDefault(); if (!devisMission) return; const r = await fetch(`${BASE}/devis`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ demande_id: devisMission.id, montant: parseInt(devisForm.montant), description: devisForm.description, delai: devisForm.delai }) }); if (r.ok) { notify("✅ Devis envoyé"); setShowDevisModal(false); setDevisMission(null); await loadExpertData(user?.id); } else notify("Erreur", false); };
  const envoyerTemoignage = async () => { if (!newTemo.trim()) { notify("Écrivez votre témoignage", false); return; } const r = await fetch(`${BASE}/temoignages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ texte: newTemo, note: newTemoNote }) }); if (r.ok) { notify("✅ Témoignage envoyé"); setNewTemo(""); setNewTemoNote(5); await loadExpertData(user?.id); } else notify("Erreur", false); };
  const handleDeletePodcast = async (id: number) => { if (!confirm("Supprimer ce podcast ?")) return; const res = await fetch(`${BASE}/podcasts/expert/supprimer/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${tk()}` } }); if (res.ok) { notify("✅ Podcast supprimé"); await loadExpertData(user?.id); } else notify("Erreur", false); };

  // Intervalles corrigés
  useEffect(() => {
    if (tab === "messages") {
      refreshAllMessages();
      const interval = setInterval(() => refreshAllMessages(), 5000);
      return () => clearInterval(interval);
    }
  }, [tab, refreshAllMessages]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${BASE}/rendez-vous/expert`, { headers: hdr() });
        if (res.ok) setRdvs(await res.json());
        const notifsRes = await fetch(`${BASE}/demandes-service/expert/notifications`, { headers: hdr() });
        if (notifsRes.ok) setNotifications(await notifsRes.json());
      } catch (err) {
        console.error("Erreur intervalle rdv/notifs:", err);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [hdr, user?.id]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  useEffect(() => {
    if (!pubTemos.length) return;
    const t = setInterval(() => {
      if (!tAnim) setTIdx(p => (p + 1) % pubTemos.length);
    }, 5000);
    return () => clearInterval(t);
  }, [pubTemos.length, tAnim]);

  const goT = (i: number) => {
    if (tAnim || !pubTemos.length) return;
    setTAnim(true);
    setTimeout(() => { setTIdx(i); setTAnim(false); }, 280);
  };

  if (loadingAuth) return ( <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}><div style={{ textAlign: "center" }}><div style={{ width: 48, height: 48, border: "4px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} /><div style={{ color: "#0A2540", fontWeight: 600 }}>Vérification des accès...</div></div></div> );
  if (errorAuth || !user || user.role !== "expert") return ( <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}><div className="card" style={{ padding: 32, maxWidth: 500, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div><div style={{ fontSize: 18, fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>Accès refusé</div><div style={{ color: "#64748B", marginBottom: 24 }}>{errorAuth || "Vous n'avez pas les droits nécessaires."}</div><button className="btn btn-gold" onClick={() => window.location.href = "/connexion"}>Se reconnecter</button></div></div> );

  const photoUrl = expert?.photo ? `${BASE}/uploads/photos/${expert?.photo}` : null;
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
    { id: "rdv", label: "Rendez-vous", icon: "📅" },
  ];

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
        .btn-red{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;}.btn-red:hover{background:#DC2626;color:#fff;}
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
        .modal-box{background:#fff;border-radius:24px;width:100%;max-width:760px;max-height:92vh;overflow-y:auto;box-shadow:0 28px 80px rgba(10,37,64,.25);}
        .upload-zone{display:block;border:2px dashed #D1D5DB;border-radius:10px;padding:16px;background:#F8FAFC;cursor:pointer;text-align:center;transition:border-color .2s;}
        .upload-zone:hover{border-color:#F7B500;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .badge{display:inline-flex;align-items:center;gap:4px;border-radius:99px;padding:3px 10px;font-size:11px;font-weight:700;}
        .bo{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;}
        .bn{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;}
        .bw{background:#FFFBEB;color:#B45309;border:1px solid #FDE68A;border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;}
        .notification-card{border:1.5px solid #FDE68A;margin-bottom:14px;border-left:4px solid #F7B500;}
      `}</style>

      {toast.text && ( <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.ok ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${toast.ok ? "#A7F3D0" : "#FECACA"}`, borderLeft: `4px solid ${toast.ok ? "#059669" : "#DC2626"}`, color: toast.ok ? "#059669" : "#DC2626", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 13, boxShadow: "0 8px 28px rgba(0,0,0,.12)" }}>{toast.text}</div> )}
      {selectedPodcast && <PodcastDetailModal podcast={selectedPodcast} onClose={() => setSelectedPodcast(null)} />}
      {showCreatePodcastModal && expert && <CreatePodcastModal onClose={() => setShowCreatePodcastModal(false)} onSuccess={() => loadExpertData(user?.id)} expertData={expert} />}
      {showEditPodcastModal && editingPodcast && <EditPodcastModal podcast={editingPodcast} onClose={() => { setShowEditPodcastModal(false); setEditingPodcast(null); }} onSuccess={() => loadExpertData(user?.id)} />}
      {showDevisModal && devisMission && ( <div className="modal-bg" onClick={() => setShowDevisModal(false)}><div className="modal-box" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}><div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "18px 24px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between" }}><div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>📄 Créer un devis</div><button onClick={() => setShowDevisModal(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}>✕</button></div><form onSubmit={createDevis} style={{ padding: "24px" }}><div style={{ marginBottom: 16 }}><label className="lbl">Montant (DT) *</label><input className="inp" type="number" required value={devisForm.montant} onChange={e => setDevisForm({ ...devisForm, montant: e.target.value })} /></div><div style={{ marginBottom: 16 }}><label className="lbl">Description</label><textarea className="inp" rows={3} value={devisForm.description} onChange={e => setDevisForm({ ...devisForm, description: e.target.value })} /></div><div style={{ marginBottom: 20 }}><label className="lbl">Délai</label><input className="inp" placeholder="Ex: 2 semaines" value={devisForm.delai} onChange={e => setDevisForm({ ...devisForm, delai: e.target.value })} /></div><div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button type="button" className="btn btn-gray" onClick={() => setShowDevisModal(false)}>Annuler</button><button type="submit" className="btn btn-green">Envoyer</button></div></form></div></div> )}
      {showRescheduleModal && selectedRdv && ( <RescheduleModal rdv={selectedRdv} onClose={() => { setShowRescheduleModal(false); setSelectedRdv(null); }} hdrJ={hdrJ} onSuccess={() => { notify("✅ Proposition de créneau envoyée !"); loadExpertData(user?.id); }} /> )}
      {showCreateFormationModal && expert && <CreateFormationModal onClose={() => setShowCreateFormationModal(false)} onSuccess={() => { notify("✅ Formation proposée !"); loadExpertData(user?.id); }} expertData={expert} />}

      {/* Header */}
      <header style={{ background: "#0A2540", height: 62, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 34, height: 34, background: "#F7B500", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12, color: "#0A2540" }}>BEH</div><div><div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Espace Expert</div><div style={{ color: "rgba(255,255,255,.4)", fontSize: 11 }}>{user?.prenom} {user?.nom}</div></div></div>
        <button onClick={forceLogout} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.7)", borderRadius: 9, padding: "7px 16px", cursor: "pointer" }}>Déconnexion</button>
      </header>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8EEF6", position: "sticky", top: 62, zIndex: 90, overflowX: "auto" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px", display: "flex", gap: 4 }}>
          {TABS.map(t => { let badge: number | null = null; if (t.id === "messages" && showMsgBadge) badge = unreadMsgCount; if (t.id === "rdv" && showRdvBadge) badge = pendingRdvCount + rdvProposalCount; if (t.id === "demandes" && showDemandesBadge) badge = notificationsCount; return ( <button key={t.id} className={`tab-btn${tab === t.id ? " on" : ""}`} onClick={() => handleTabChange(t.id)}>{t.icon} {t.label}{badge !== null && badge > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 800, marginLeft: 2 }}>{badge}</span>}</button> ); })}
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 24px" }}>

        {/* ========== ACCUEIL ========== */}
        {tab === "accueil" && (
          <div>
            <section style={{ position: "relative", overflow: "hidden", minHeight: 380, borderRadius: 20 }}>
              <div style={{ position: "absolute", inset: 0 }}><Image src="/image.png" alt="" fill priority style={{ objectFit: "cover" }} /><div style={{ position: "absolute", inset: 0, background: "linear-gradient(108deg,rgba(6,14,26,.95) 0%,rgba(10,30,60,.78) 44%,rgba(10,37,64,.18) 100%)" }} /></div>
              <div style={{ position: "relative", zIndex: 10, maxWidth: 1280, margin: "0 auto", padding: "60px 32px 70px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, background: "rgba(247,181,0,.1)", border: "1px solid rgba(247,181,0,.22)", borderRadius: 99, padding: "5px 16px 5px 10px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F7B500", animation: "pulse 2s infinite", display: "inline-block" }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#F7B500" }}>Bienvenue, {user?.prenom} 👋</span>
                </div>
                <h1 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "#fff", marginBottom: 16, lineHeight: 1.1 }}>Accompagnez les <span style={{ color: "#F7B500" }}>startups</span><br />vers l'excellence</h1>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,.72)", maxWidth: 480, lineHeight: 1.9, marginBottom: 28 }}>Proposez vos formations, podcasts, et accompagnez les startups dans leur croissance.</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="btn btn-gold" onClick={() => handleTabChange("formations")}>📚 Gérer mes formations</button>
                  <button className="btn btn-purple" onClick={() => handleTabChange("podcasts")}>🎙️ Gérer mes podcasts</button>
                </div>
              </div>
            </section>
            <section style={{ padding: "48px 28px", background: "#F8FAFC", marginTop: 24, borderRadius: 20 }}>
              <Reveal><div style={{ textAlign: "center", marginBottom: 36 }}><h2 style={{ fontWeight: 700, fontSize: "clamp(28px,4vw,44px)", color: "#0A2540" }}>Notre <span style={{ fontStyle: "italic", color: "#F7B500" }}>ADN</span></h2></div></Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                {ADN_ITEMS.map((card, i) => ( <Reveal key={i} delay={i * .1}><div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(10,37,64,.07)", padding: "22px 22px 20px", cursor: "pointer" }} onClick={() => window.open(`/a-propos#${card.anchor}`, "_blank")}><div style={{ width: 42, height: 42, borderRadius: 12, background: `${card.color}15`, border: `1.5px solid ${card.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, fontSize: 18, color: card.color }}>{i === 0 ? <FaBullseye /> : i === 1 ? <FaRocket /> : <FaStar />}</div><h3 style={{ fontWeight: 700, color: "#0A2540", fontSize: 20, marginBottom: 8 }}>{card.title}</h3><p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.82 }}>{card.body}</p></div></Reveal> ))}
              </div>
            </section>
            {pubTemos.length > 0 && (
              <section style={{ padding: "48px 28px", background: "#fff", marginTop: 24, borderRadius: 20 }}>
                <div style={{ maxWidth: 780, margin: "0 auto" }}>
                  <div style={{ textAlign: "center", marginBottom: 36 }}><h2 style={{ fontWeight: 700, fontSize: "clamp(24px,4vw,38px)", color: "#0A2540" }}>Ce que disent nos <span style={{ color: "#F7B500" }}>clients</span></h2></div>
                  {curTemo && (
                    <div style={{ background: "#0A2540", borderRadius: 22, padding: "36px 44px", position: "relative", opacity: tAnim ? 0 : 1, transform: tAnim ? "scale(.97)" : "scale(1)", transition: "all .3s" }}>
                      <FaQuoteLeft style={{ position: "absolute", top: 22, left: 28, fontSize: 32, color: "rgba(247,181,0,.15)" }} />
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= (curTemo.note || 5) ? "#F7B500" : "#334155", fontSize: 20 }}>★</span>)}</div>
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
                      <button onClick={() => goT((tIdx - 1 + pubTemos.length) % pubTemos.length)} style={{ width: 36, height: 36, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(247,181,0,.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaChevronLeft size={12} /></button>
                      <div style={{ display: "flex", gap: 6 }}>{pubTemos.map((_, i) => <button key={i} onClick={() => goT(i)} style={{ height: 6, width: i === tIdx ? 22 : 6, borderRadius: 99, border: "none", background: i === tIdx ? "#F7B500" : "rgba(10,37,64,.2)", cursor: "pointer", transition: "all .3s" }} />)}</div>
                      <button onClick={() => goT((tIdx + 1) % pubTemos.length)} style={{ width: 36, height: 36, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(247,181,0,.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaChevronRight size={12} /></button>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ========== PROFIL ========== */}
        {tab === "profil" && (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div className="card" style={{ padding: "24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #F7B500" }}>
                  {photoPreview ? <img src={photoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : photoUrl ? <img src={photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" onError={e => (e.currentTarget.style.display = "none")} /> : <span style={{ color: "#F7B500", fontWeight: 900, fontSize: 26 }}>{initials}</span>}
                </div>
                <label style={{ position: "absolute", bottom: -2, right: -2, width: 26, height: 26, background: "#F7B500", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid #fff" }}>
                  <FaCamera style={{ fontSize: 11, color: "#0A2540" }} />
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
                </label>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: "#0A2540" }}>{user?.prenom} {user?.nom}</div>
                <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 3 }}>{user?.email}</div>
                {photoFile && <button className="btn btn-gold" style={{ fontSize: 12, padding: "7px 14px", marginTop: 10 }} onClick={updatePhoto}><FaCheck /> Sauvegarder la photo</button>}
              </div>
            </div>
            {modificationEnAttente && (
              <div className="card" style={{ marginBottom: 20, background: "#FFFBEB", borderLeft: "4px solid #F7B500", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <FaInfoCircle style={{ color: "#F7B500", fontSize: 20 }} />
                <div><strong>Modification en attente de validation</strong><br />Votre demande a été envoyée à l'administrateur.</div>
              </div>
            )}
            <div className="card">
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540" }}>Informations professionnelles</div></div>
              <div style={{ padding: "24px" }}>
                <div style={{ marginBottom: 16 }}><label className="lbl">Domaine d'expertise</label><input className="inp" value={editProfil.domaine} onChange={e => setEditProfil({ ...editProfil, domaine: e.target.value })} disabled={modificationEnAttente} /></div>
                <div style={{ marginBottom: 16 }}><label className="lbl">Année de début</label><input className="inp" type="number" value={editProfil.annee_debut_experience} onChange={e => setEditProfil({ ...editProfil, annee_debut_experience: e.target.value })} disabled={modificationEnAttente} /></div>
                <div style={{ marginBottom: 16 }}><label className="lbl">Localisation</label><input className="inp" value={editProfil.localisation} onChange={e => setEditProfil({ ...editProfil, localisation: e.target.value })} disabled={modificationEnAttente} /></div>
                <div style={{ marginBottom: 16 }}><label className="lbl">Téléphone</label><input className="inp" value={editProfil.telephone} onChange={e => setEditProfil({ ...editProfil, telephone: e.target.value })} disabled={modificationEnAttente} /></div>
                <div style={{ marginBottom: 20 }}><label className="lbl">Description</label><textarea className="inp" rows={4} value={editProfil.description} onChange={e => setEditProfil({ ...editProfil, description: e.target.value })} disabled={modificationEnAttente} /></div>
                {!modificationEnAttente && <button className="btn btn-gold" onClick={updateProfile}><FaSave /> Envoyer</button>}
              </div>
            </div>
          </div>
        )}

        {/* ========== FORMATIONS (affichage sans mode/niveau/catégorie) ========== */}
        {tab === "formations" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540" }}>📚 Mes formations proposées</h2>
                <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{formations.length} formation{formations.length !== 1 ? "s" : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-gray" onClick={() => loadExpertData(user?.id)} style={{ fontSize: 12 }}>🔄 Rafraîchir</button>
                <button className="btn btn-gold" onClick={() => setShowCreateFormationModal(true)}>➕ Proposer une formation</button>
              </div>
            </div>
            {loadingFormations ? (
              <div style={{ textAlign: "center", padding: 60 }}><FaSpinner style={{ fontSize: 32, color: "#F7B500", animation: "spin 1s linear infinite" }} /> Chargement...</div>
            ) : formations.length === 0 ? (
              <div className="card" style={{ padding: "60px 0", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540", marginBottom: 8 }}>Aucune formation proposée</div>
                <button className="btn btn-gold" onClick={() => setShowCreateFormationModal(true)}>Proposer une formation</button>
              </div>
            ) : (
              formations.map(f => (
                <div key={f.id} className="card" style={{ marginBottom: 16, overflow: "hidden", borderLeft: `6px solid ${f.statut === "publie" ? "#10B981" : f.statut === "refuse" ? "#EF4444" : "#F7B500"}` }}>
                  <div style={{ padding: "20px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                          <h3 style={{ fontWeight: 800, fontSize: 18, color: "#0A2540" }}>{f.titre}</h3>
                          {f.a_la_une && <span className="bo" style={{ background: "#FEF3C7", color: "#B45309" }}>⭐ À la une</span>}
                          <span className={f.statut === "publie" ? "bo" : f.statut === "refuse" ? "bn" : "bw"}>{f.statut === "publie" ? "✅ Publiée" : f.statut === "refuse" ? "❌ Refusée" : "⏳ En attente"}</span>
                        </div>
                        {f.description && <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>{f.description}</p>}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 10, fontSize: 12.5, color: "#334155", marginBottom: 12 }}>
                          {f.domaine && <div><FaTag /> Domaine : <strong>{f.domaine}</strong></div>}
                          {f.formateur && <div><FaChalkboardTeacher /> Formateur : <strong>{f.formateur}</strong></div>}
                          {f.localisation && <div><FaMapMarkerAlt /> Lieu : <strong>{f.localisation}</strong></div>}
                          {f.type && <div><FaGraduationCap /> Type : <strong>{f.type}</strong></div>}
                          {f.duree && <div><FaClock /> Durée : <strong>{f.duree}</strong></div>}
                          {f.certifiante && <div><FaCertificate /> Certifiante : <strong>{f.certifiante === "oui" ? "✅ Oui" : "❌ Non"}</strong></div>}
                          {f.prix !== undefined && <div><FaDollarSign /> Prix : <strong>{f.prix === 0 ? "Gratuit" : `${f.prix} DT`}</strong></div>}
                          {f.places_limitees && <div><FaUsers /> Places : <strong>{f.places_disponibles ?? "?"}</strong></div>}
                          {f.dateDebut && <div><FaCalendarAlt /> Du : <strong>{new Date(f.dateDebut).toLocaleDateString("fr-FR")}</strong> {f.dateFin && ` au ${new Date(f.dateFin).toLocaleDateString("fr-FR")}`}</div>}
                        </div>
                        {f.lien_formation && (
                          <div style={{ marginTop: 8 }}>
                            <a href={f.lien_formation} target="_blank" rel="noopener noreferrer" className="btn btn-bl" style={{ fontSize: 12, padding: "6px 12px" }}><FaExternalLinkAlt /> Accéder à la formation</a>
                          </div>
                        )}
                        {f.commentaire_admin && (
                          <div style={{ marginTop: 12, background: "#FFF8E1", padding: "8px 14px", borderRadius: 12, borderLeft: "3px solid #F7B500", fontSize: 12 }}>
                            <strong>📩 Admin :</strong> {f.commentaire_admin}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 12 }}>
                          Soumis le {new Date(f.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      {f.image && (
                        <div style={{ flexShrink: 0 }}>
                          <img src={`${BASE}/uploads/formations/${f.image}`} alt={f.titre} style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 12, border: "1px solid #E8EEF6" }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========== PODCASTS ========== */}
        {tab === "podcasts" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div><h2 style={{ fontWeight: 800, fontSize: 20 }}>🎙️ Mes podcasts proposés</h2><div style={{ fontSize: 13 }}>{podcasts.length} podcast(s)</div></div>
              <button className="btn btn-purple" onClick={() => setShowCreatePodcastModal(true)}>➕ Proposer un podcast</button>
            </div>
            {podcasts.length === 0 ? (
              <div className="card" style={{ padding: "60px 0", textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>🎙️</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Aucun podcast proposé</div>
                <button className="btn btn-purple" onClick={() => setShowCreatePodcastModal(true)}>Proposer un podcast</button>
              </div>
            ) : (
              podcasts.map(p => (
                <div key={p.id} className="card" style={{ marginBottom: 14, padding: "18px 22px", borderLeft: `4px solid ${p.statut === "publie" ? "#10B981" : p.statut === "refuse" ? "#EF4444" : "#F7B500"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{p.titre}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>🎙️ {p.auteur} · 📁 {p.domaine}</div>
                      <div style={{ fontSize: 13, color: "#475569", marginTop: 6 }}>{p.description?.slice(0, 120)}...</div>
                      <div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 8 }}>Soumis le {new Date(p.createdAt).toLocaleDateString("fr-FR")}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <span className={p.statut === "publie" ? "bo" : p.statut === "refuse" ? "bn" : "bw"}>{p.statut === "publie" ? "✅ Publié" : p.statut === "refuse" ? "❌ Refusé" : "⏳ En attente"}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-bl" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => { setEditingPodcast(p); setShowEditPodcastModal(true); }}><FaEdit /> Modifier</button>
                        <button className="btn btn-red" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => handleDeletePodcast(p.id)}><FaTrash /> Supprimer</button>
                        <button className="btn btn-gray" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setSelectedPodcast(p)}><FaHeadphones /> Écouter</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========== DEMANDES (MISSIONS) ========== */}
        {tab === "demandes" && (
          <div>
            {notifications.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔔</div>
                  <div><h3 style={{ fontWeight: 800, fontSize: 16, color: "#0A2540" }}>Notifications de mission</h3><div style={{ fontSize: 12, color: "#8A9AB5" }}>Acceptez pour que l'admin puisse vous assigner.</div></div>
                  <span style={{ background: "#F7B500", color: "#0A2540", borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 800, marginLeft: "auto" }}>{notifications.length}</span>
                </div>
                {notifications.map(d => (
                  <div key={d.id} className="card notification-card">
                    <div style={{ padding: "18px 22px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>{d.user?.prenom} {d.user?.nom} – {d.service}</div>
                          {d.description && <p style={{ fontSize: 13, marginTop: 8 }}>{d.description}</p>}
                          {d.objectif && <div style={{ fontSize: 13, color: "#7C3AED", marginTop: 6 }}>🎯 {d.objectif}</div>}
                          {d.delai && <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>⏱ Délai : {d.delai}</div>}
                          {d.telephone && <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>📞 {d.telephone}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-green" onClick={() => accepterNotification(d.id)}>✅ Accepter</button>
                          <button className="btn btn-red" onClick={() => refuserNotification(d.id)}>❌ Refuser</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ height: 1, background: "#E8EEF6", margin: "8px 0 24px" }} />
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div><h2 style={{ fontWeight: 700, fontSize: 17 }}>📋 Mes missions assignées</h2><div style={{ fontSize: 13 }}>{demandesAssignees.length} mission(s)</div></div>
              <button className="btn btn-gray" onClick={() => loadExpertData(user?.id)}>🔄 Rafraîchir</button>
            </div>
            {demandesAssignees.length === 0 ? (
              <div className="card" style={{ padding: "52px 0", textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>📋</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Aucune mission assignée</div>
              </div>
            ) : (
              demandesAssignees.map(d => (
                <div key={d.id} className="card" style={{ marginBottom: 14, borderLeft: `4px solid ${d.statut === "en_cours" ? "#3B82F6" : d.statut === "terminee" ? "#8B5CF6" : "#F7B500"}` }}>
                  <div style={{ padding: "18px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{d.user?.prenom} {d.user?.nom} – {d.service}</div>
                        {d.description && <p style={{ fontSize: 13, marginTop: 8 }}>{d.description}</p>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        <span className={`badge ${d.statut === 'en_attente' ? 'bw' : d.statut === 'en_cours' ? 'bo' : 'bo'}`}>
                          {d.statut === 'en_attente' ? '⏳ En attente' : d.statut === 'en_cours' ? '🔄 En cours' : '✅ Terminée'}
                        </span>
                        {d.statut === 'en_attente' && <button className="btn btn-green" onClick={() => updateMissionStatus(d.id, "en_cours")}>🚀 Démarrer</button>}
                        {d.statut === 'en_cours' && <button className="btn btn-purple" onClick={() => updateMissionStatus(d.id, "terminee")}>✔️ Terminer</button>}
                        {d.statut !== 'terminee' && d.statut !== 'refusee' && (
                          <button className="btn btn-bl" onClick={() => { setDevisMission(d); setShowDevisModal(true); }}>📄 Créer un devis</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========== DEVIS ========== */}
        {tab === "devis" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>📄 Mes devis envoyés</div>
            <div style={{ fontSize: 13, marginBottom: 20 }}>{mesDevis.length} devis</div>
            {mesDevis.length === 0 ? (
              <div className="card" style={{ padding: "52px 0", textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>📄</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Aucun devis</div>
              </div>
            ) : (
              mesDevis.map(d => (
                <div key={d.id} className="card" style={{ marginBottom: 14, borderLeft: `4px solid ${d.statut === "accepte" ? "#22C55E" : d.statut === "refuse" ? "#EF4444" : "#F7B500"}` }}>
                  <div style={{ padding: "18px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>Devis #{d.id} — {d.demande?.service || "Mission"}</div>
                        <div style={{ fontSize: 13 }}>Client : {d.demande?.user?.prenom} {d.demande?.user?.nom}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#F7B500" }}>💰 {d.montant} DT</div>
                        {d.description && <p style={{ fontSize: 13, marginTop: 8 }}>{d.description}</p>}
                        {d.delai && <div style={{ fontSize: 12 }}>⏱ Délai : {d.delai}</div>}
                      </div>
                      <span className={d.statut === "accepte" ? "bo" : d.statut === "refuse" ? "bn" : "bw"}>
                        {d.statut === "accepte" ? "✅ Accepté" : d.statut === "refuse" ? "❌ Refusé" : "⏳ En attente"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========== MESSAGES ========== */}
        {tab === "messages" && (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, height: "calc(100vh - 200px)" }}>
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Conversations ({contacts.length})</div>
                <button className="btn btn-gray" style={{ fontSize: 11, padding: "4px 10px" }} onClick={refreshAllMessages}><FaSync /></button>
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                {contacts.length === 0 ? (
                  <div style={{ padding: "32px 16px", textAlign: "center", color: "#8A9AB5" }}>💬 Aucune conversation.</div>
                ) : (
                  contacts.map(c => {
                    const unread = allMessages.filter(m => m.sender_id === c.id && m.receiver_id === user?.id && !m.lu).length;
                    const lastMsg = allMessages.filter(m => (m.sender_id === c.id && m.receiver_id === user?.id) || (m.sender_id === user?.id && m.receiver_id === c.id)).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                    return (
                      <div key={c.id} onClick={() => loadConversation(c.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", cursor: "pointer", background: selectedContact?.id === c.id ? "#FFFBEB" : "transparent", borderLeft: selectedContact?.id === c.id ? "3px solid #F7B500" : "3px solid transparent", borderBottom: "0.5px solid #F1F5F9" }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: selectedContact?.id === c.id ? "#FEF3C7" : "#0A2540", color: selectedContact?.id === c.id ? "#92400E" : "#F7B500", border: "1.5px solid rgba(247,181,0,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{c.prenom?.[0]}{c.nom?.[0]}</div>
                        <div style={{ overflow: "hidden", flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{c.prenom} {c.nom}</div>
                          <div style={{ fontSize: 11, color: "#8A9AB5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lastMsg ? lastMsg.contenu.slice(0, 28) + (lastMsg.contenu.length > 28 ? "…" : "") : c.service || ""}</div>
                        </div>
                        {unread > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 99, padding: "2px 6px", fontSize: 10, fontWeight: 800 }}>{unread}</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>
              {!selectedContact ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#8A9AB5" }}>
                  <div style={{ fontSize: 52 }}>💬</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginTop: 12 }}>Sélectionnez une conversation</div>
                </div>
              ) : (
                <>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE", display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FEF3C7", color: "#92400E", border: "1.5px solid #F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{selectedContact.prenom?.[0]}{selectedContact.nom?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{selectedContact.prenom} {selectedContact.nom}</div>
                      <div style={{ fontSize: 11, color: "#8A9AB5" }}>{selectedContact.email}</div>
                    </div>
                    <button className="btn btn-gray" onClick={refreshAllMessages}><FaSync /></button>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {conversation.length === 0 && <div style={{ textAlign: "center", padding: 40 }}>Aucun message. Commencez la conversation !</div>}
                    {conversation.map((m, i) => {
                      const isMe = m.sender_id === user?.id;
                      const prevMsg = conversation[i - 1];
                      const showDate = !prevMsg || new Date(m.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
                      return (
                        <div key={m.id}>
                          {showDate && <div style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", margin: "8px 0", display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, height: 1, background: "#F1F5F9" }} />{new Date(m.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}<div style={{ flex: 1, height: 1, background: "#F1F5F9" }} /></div>}
                          <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
                            {!isMe && <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FEF3C7", color: "#92400E", border: "1.5px solid #F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{selectedContact.prenom?.[0]}{selectedContact.nom?.[0]}</div>}
                            <div>
                              <div className={isMe ? "msg-me" : "msg-other"}>{m.contenu}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, justifyContent: isMe ? "flex-end" : "flex-start" }}>
                                <span style={{ fontSize: 10, color: "#94A3B8" }}>{new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}{isMe && " ✓"}</span>
                                {isMe && <button onClick={() => deleteMessage(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#CBD5E1", fontSize: 11 }}><FaTrash /></button>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={msgEndRef} />
                  </div>
                  <div style={{ padding: "12px 16px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 10, alignItems: "center", background: "#FAFBFE" }}>
                    <input className="inp" placeholder={`Répondre à ${selectedContact.prenom}…`} value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} style={{ flex: 1, borderRadius: 20 }} />
                    <button onClick={sendMessage} style={{ background: newMsg.trim() ? "#F7B500" : "#E2E8F0", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: newMsg.trim() ? "pointer" : "default" }}>
                      <FaPaperPlane style={{ fontSize: 14, color: newMsg.trim() ? "#0A2540" : "#94A3B8" }} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ========== TÉMOIGNAGES ========== */}
        {tab === "temoignages" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div className="card">
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 16 }}>✍️ Partager mon expérience</div></div>
              <div style={{ padding: "24px" }}>
                <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>💡 Votre témoignage sera examiné avant publication.</div>
                <label className="lbl">Note</label>
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                  {[1,2,3,4,5].map(s => <span key={s} onClick={() => setNewTemoNote(s)} style={{ fontSize: 30, cursor: "pointer", color: s <= newTemoNote ? "#F7B500" : "#E2E8F0" }}>★</span>)}
                  <span style={{ fontSize: 13, color: "#F7B500", fontWeight: 600, marginLeft: 8 }}>{newTemoNote}/5</span>
                </div>
                <label className="lbl">Votre témoignage</label>
                <textarea className="inp" rows={5} placeholder="Partagez votre expérience..." value={newTemo} onChange={e => setNewTemo(e.target.value)} style={{ marginBottom: 16 }} />
                <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center" }} onClick={envoyerTemoignage}><FaPaperPlane /> Envoyer</button>
              </div>
            </div>
            <div className="card">
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE" }}><div style={{ fontWeight: 700, fontSize: 16 }}>Mes témoignages ({temoignages.length})</div></div>
              <div style={{ padding: "16px", maxHeight: 460, overflowY: "auto" }}>
                {temoignages.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: "#8A9AB5" }}>Aucun témoignage</div> : temoignages.map(t => (
                  <div key={t.id} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", marginBottom: 10, border: "1px solid #E8EEF6" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= (t.note || 5) ? "#F7B500" : "#E2E8F0", fontSize: 15 }}>★</span>)}<span style={{ fontSize: 11, color: "#94A3B8", marginLeft: 5 }}>{new Date(t.createdAt).toLocaleDateString("fr-FR")}</span></div>
                      <span className={t.statut === "valide" ? "bo" : t.statut === "refuse" ? "bn" : "bw"}>{t.statut === "valide" ? "✅ Publié" : t.statut === "refuse" ? "❌ Refusé" : "⏳ En attente"}</span>
                    </div>
                    <p style={{ fontSize: 13.5, fontStyle: "italic" }}>"{t.texte}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== RENDEZ-VOUS ========== */}
        {tab === "rdv" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div><h2 style={{ fontWeight: 800, fontSize: 20 }}>📅 Mes rendez-vous</h2><div style={{ fontSize: 13 }}>{rdvs.length} rendez-vous reçu(s)</div></div>
              <button className="btn btn-gray" onClick={() => loadExpertData(user?.id)}>🔄 Rafraîchir</button>
            </div>
            {rdvs.length === 0 ? (
              <div className="card" style={{ padding: "60px 0", textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>📅</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Aucun rendez-vous</div>
              </div>
            ) : (
              rdvs.map(rdv => (
                <div key={rdv.id} className="card" style={{ marginBottom: 14, borderLeft: `4px solid ${rdv.statut === "confirme" ? "#10B981" : rdv.statut === "annule" ? "#EF4444" : "#F7B500"}` }}>
                  <div style={{ padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 700 }}>{rdv.client?.prenom?.[0]}{rdv.client?.nom?.[0]}</div>
                          <div><div style={{ fontWeight: 700 }}>{rdv.client?.prenom} {rdv.client?.nom}</div><div style={{ fontSize: 12, color: "#64748B" }}>{rdv.client?.email}</div></div>
                        </div>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>📌 {rdv.sujet || "Sujet non précisé"}</div>
                        <div style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}><FaCalendar /> {new Date(rdv.date_rdv).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        <span className={`badge ${rdv.statut === "confirme" ? "bo" : rdv.statut === "annule" ? "bn" : "bw"}`}>
                          {rdv.statut === "confirme" ? "✅ Confirmé" : rdv.statut === "annule" ? "❌ Annulé" : "⏳ En attente"}
                        </span>
                        {rdv.statut === "en_attente" && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-green" onClick={() => confirmerRdv(rdv.id)}>✅ Confirmer</button>
                            <button className="btn btn-red" onClick={() => annulerRdv(rdv.id)}>❌ Annuler</button>
                            <button className="btn btn-purple" onClick={() => { setSelectedRdv(rdv); setShowRescheduleModal(true); }}>📅 Autre créneau</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <footer style={{ background: "#0A2540", color: "#fff", padding: "32px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: 40 }}>
        <p>© 2026 Business Expert Hub</p>
      </footer>
    </>
  );
}