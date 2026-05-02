"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaArrowRight, FaQuoteLeft, FaChevronLeft, FaChevronRight,
  FaBullseye, FaRocket, FaStar, FaPaperPlane,
  FaCheck, FaCamera, FaCalendar, FaCheckCircle,
  FaTimes, FaEdit, FaTrash, FaSave, FaHeadphones,
  FaPlus, FaFileAudio, FaImage, FaInfoCircle, FaSync,
  FaSpinner, FaArrowLeft, FaMicrophone, FaUser, FaEnvelope,
  FaPhone, FaBuilding, FaTag, FaClock, FaBriefcase,
  FaTimesCircle, FaEye, FaExclamationTriangle,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

const ADN_ITEMS = [
  { title: "Notre Vision", body: "Devenir la référence absolue en accompagnement de startups innovantes.", color: "#3B82F6", anchor: "vision" },
  { title: "Notre Mission", body: "Offrir aux startups un accès privilégié à des experts certifiés.", color: "#F7B500", anchor: "mission" },
  { title: "Nos Valeurs", body: "Excellence, transparence et engagement humain.", color: "#10B981", anchor: "valeurs" },
];

const DOMAINES_LIST = [
  "Marketing Digital", "Finance / Comptabilité", "Ressources Humaines",
  "Développement Web / Mobile", "Design UI/UX", "Stratégie Commerciale",
  "Logistique / Supply Chain", "Intelligence Artificielle / Data",
  "Management", "Communication", "Juridique", "Autre",
];
const NIVEAUX_LIST = ["Débutant", "Intermédiaire", "Avancé", "Tous niveaux"];
const MODES_LIST = [
  { value: "en_ligne", label: "💻 En ligne" },
  { value: "presentiel", label: "🏢 Présentiel" },
  { value: "hybride", label: "🌐 Hybride" },
];

type Tab = "accueil" | "profil" | "formations" | "podcasts" | "demandes" | "devis" | "messages" | "rdv" | "contact_admin";

function useInView(thr = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: thr });
    o.observe(el); return () => o.disconnect();
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

// ========================= MODAL DÉTAIL CLIENT (MISSION) =========================
function MissionDetailModal({ mission, onClose, onAccepter, onRefuser }: {
  mission: any; onClose: () => void;
  onAccepter: (mission: any) => void;
  onRefuser: (id: number) => void;
}) {
  const client = mission?.user;
  const startup = client?.startup;
  const isNotification = mission?.statut === "en_attente";
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#0A2540 0%,#1a4a8a 100%)", padding: "0", borderRadius: "24px 24px 0 0", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
          <div style={{ position: "relative", zIndex: 2, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 15, background: "rgba(247,181,0,.2)", border: "2px solid rgba(247,181,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📋</div>
                <div>
                  <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>
                    {isNotification ? "Nouvelle mission reçue" : "Détail de la mission"}
                  </div>
                  <div style={{ color: "#fff", fontWeight: 900, fontSize: 20 }}>{mission?.service}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <span style={{ background: isNotification ? "rgba(247,181,0,.2)" : "rgba(34,197,94,.2)", color: isNotification ? "#F7B500" : "#4ADE80", border: `1px solid ${isNotification ? "rgba(247,181,0,.3)" : "rgba(34,197,94,.3)"}`, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                      {isNotification ? "⏳ En attente de réponse" : mission?.statut === "en_cours" ? "🔄 En cours" : mission?.statut === "terminee" ? "✅ Terminée" : "❌ Refusée"}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}><FaTimes /></button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {mission?.delai && <span style={{ background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.8)", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 600 }}><FaClock size={9} style={{ marginRight: 4 }} />Délai : {mission.delai}</span>}
              {mission?.objectif && <span style={{ background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.8)", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 600 }}>{mission.objectif}</span>}
              <span style={{ background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.8)", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 600 }}>
                <FaCalendar size={9} style={{ marginRight: 4 }} />{new Date(mission?.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
        <div style={{ padding: "24px 28px", maxHeight: "65vh", overflowY: "auto" }}>
          {mission?.description && (
            <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "18px 20px", marginBottom: 20, border: "1px solid #E8EEF6" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>📝 Description de la demande</div>
              <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.85, margin: 0 }}>{mission.description}</p>
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0A2540", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 18, height: 2, background: "#F7B500", borderRadius: 2 }} />Informations du client
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: <FaUser size={12} />, label: "Nom complet", val: `${client?.prenom || "—"} ${client?.nom || ""}`, color: "#3B82F6" },
                { icon: <FaEnvelope size={12} />, label: "Email", val: client?.email || "—", color: "#10B981" },
                { icon: <FaPhone size={12} />, label: "Téléphone", val: mission?.telephone || client?.telephone || "Non renseigné", color: "#F7B500" },
                { icon: <FaTag size={12} />, label: "Service demandé", val: mission?.service || "—", color: "#8B5CF6" },
              ].map((row, i) => (
                <div key={i} style={{ background: "#fff", border: "1.5px solid #E8EEF6", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${row.color}12`, color: row.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{row.icon}</div>
                  <div><div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3 }}>{row.label}</div><div style={{ fontSize: 13, fontWeight: 600, color: "#0A2540", wordBreak: "break-all" }}>{row.val}</div></div>
                </div>
              ))}
            </div>
          </div>
          {startup && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0A2540", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 18, height: 2, background: "#F7B500", borderRadius: 2 }} />Informations de la startup
              </div>
              <div style={{ background: "linear-gradient(135deg,#0A2540,#0f3060)", borderRadius: 14, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(247,181,0,.2)", border: "1.5px solid rgba(247,181,0,.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🚀</div>
                  <div><div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{startup.nom_startup || "—"}</div><div style={{ color: "rgba(255,255,255,.55)", fontSize: 12, marginTop: 2 }}>{startup.secteur || "Secteur non précisé"}</div></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Taille", val: startup.taille || "—" },
                    { label: "Fonction du contact", val: startup.fonction || "—" },
                    { label: "Site web", val: startup.site_web || "—" },
                    { label: "Description", val: startup.description?.slice(0, 60) + (startup.description?.length > 60 ? "…" : "") || "—" },
                  ].map((r, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,.06)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3 }}>{r.label}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,.85)" }}>{r.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {(mission?.budget || mission?.delai || mission?.objectif) && (
            <div style={{ background: "#F0FDF4", border: "1.5px solid #A7F3D0", borderRadius: 14, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>📊 Attentes du client</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {mission.budget && <div style={{ background: "#fff", borderRadius: 10, padding: "8px 14px", border: "1px solid #A7F3D0" }}><div style={{ fontSize: 10, color: "#64748B", marginBottom: 2 }}>Budget</div><div style={{ fontWeight: 700, color: "#059669" }}>{mission.budget}</div></div>}
                {mission.delai && <div style={{ background: "#fff", borderRadius: 10, padding: "8px 14px", border: "1px solid #A7F3D0" }}><div style={{ fontSize: 10, color: "#64748B", marginBottom: 2 }}>Délai souhaité</div><div style={{ fontWeight: 700, color: "#059669" }}>{mission.delai}</div></div>}
                {mission.objectif && <div style={{ background: "#fff", borderRadius: 10, padding: "8px 14px", border: "1px solid #A7F3D0", flex: 1, minWidth: 200 }}><div style={{ fontSize: 10, color: "#64748B", marginBottom: 2 }}>Objectif principal</div><div style={{ fontWeight: 700, color: "#059669" }}>{mission.objectif}</div></div>}
              </div>
            </div>
          )}
          {mission?.commentaire_admin && (
            <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 14, padding: "16px 18px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
              <FaInfoCircle style={{ color: "#1D4ED8", fontSize: 18, marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 5 }}>Message de l'administrateur</div>
                <p style={{ fontSize: 13.5, color: "#1E40AF", lineHeight: 1.75, margin: 0 }}>{mission.commentaire_admin}</p>
              </div>
            </div>
          )}
        </div>
        {isNotification && (
          <div style={{ padding: "18px 28px 24px", borderTop: "1px solid #F1F5F9", background: "#FAFBFE", borderRadius: "0 0 24px 24px" }}>
            <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 14, textAlign: "center" }}>En acceptant, vous vous engagez à traiter cette mission avec professionnalisme.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { onRefuser(mission.id); onClose(); }}
                style={{ flex: 1, padding: "13px", background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#DC2626"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
              ><FaTimesCircle /> Refuser la mission</button>
              <button
                onClick={() => { onAccepter(mission); onClose(); }}
                style={{ flex: 2, padding: "13px", background: "linear-gradient(135deg,#059669,#047857)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s", boxShadow: "0 4px 12px rgba(5,150,105,.25)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(5,150,105,.35)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(5,150,105,.25)"; }}
              ><FaCheck /> Accepter & créer un devis</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================= MODAL PROPOSER FORMATION =========================
function ProposerFormationModal({ onClose, onSuccess, expertData, user, tk }: { onClose: () => void; onSuccess: () => void; expertData: any; user: any; tk: () => string; }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [form, setForm] = useState({ titre: "", description: "", domaine: expertData?.domaine || "", formateur: user ? `${user.prenom || ""} ${user.nom || ""}`.trim() : "", mode: "en_ligne", duree: "", localisation: "", niveau: "", lien_formation: "", dateDebut: "", dateFin: "", type: "payant", gratuit: false, prix: "", places_limitees: false, places_disponibles: "", certifiante: false });
  const upd = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));
  const step1Valid = form.titre.trim().length >= 2 && form.description.trim().length >= 5 && !!form.domaine;
  const steps = [{ num: 1, label: "Infos" }, { num: 2, label: "Modalités" }, { num: 3, label: "Tarif" }, { num: 4, label: "Image" }];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!step1Valid) { alert("Veuillez remplir tous les champs requis"); return; } setSubmitting(true);
    try {
      const fd = new FormData(); Object.entries(form).forEach(([k, v]) => fd.append(k, String(v))); fd.append("a_la_une", "false"); fd.append("statut", "en_attente"); if (!form.gratuit && form.prix) fd.append("prix", form.prix); if (imageFile) fd.append("image", imageFile);
      const res = await fetch(`${BASE}/formations/expert/proposer`, { method: "POST", headers: { Authorization: `Bearer ${tk()}` }, body: fd });
      if (res.ok) { onSuccess(); onClose(); } else { const err = await res.json().catch(() => ({ message: "Erreur serveur" })); alert(`Erreur : ${err.message || "Impossible de soumettre"}`); }
    } catch { alert("Erreur réseau"); } finally { setSubmitting(false); }
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "20px 28px 0", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(247,181,0,.2)", border: "1.5px solid rgba(247,181,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎓</div>
                <div><div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Espace Expert</div><div style={{ color: "#fff", fontWeight: 900, fontSize: 19 }}>Proposer une formation</div></div>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}><FaTimes /></button>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {steps.map((s, i) => (
                <div key={s.num} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1, cursor: "pointer" }} onClick={() => { if (s.num < step || (s.num === step + 1 && step1Valid)) setStep(s.num); }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: step > s.num ? "#10B981" : step === s.num ? "#F7B500" : "rgba(255,255,255,.12)", border: step === s.num ? "2px solid #F7B500" : step > s.num ? "2px solid #10B981" : "2px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: step >= s.num ? "#0A2540" : "rgba(255,255,255,.4)", fontWeight: 800, fontSize: 12 }}>
                      {step > s.num ? "✓" : s.num}
                    </div>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: step >= s.num ? "#fff" : "rgba(255,255,255,.35)", whiteSpace: "nowrap", paddingBottom: 12 }}>{s.label}</div>
                  </div>
                  {i < steps.length - 1 && <div style={{ height: 2, flex: 1, maxWidth: 50, background: step > s.num ? "#10B981" : "rgba(255,255,255,.15)", marginBottom: 22 }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px 28px", maxHeight: "58vh", overflowY: "auto" }}>
            {step === 1 && (
              <div>
                <div style={{ marginBottom: 16 }}><label className="lbl">Titre *</label><input className="inp" placeholder="Ex: Maîtriser le Marketing Digital" value={form.titre} onChange={e => upd("titre", e.target.value)} maxLength={150} required /></div>
                <div style={{ marginBottom: 16 }}><label className="lbl">Description *</label><textarea className="inp" rows={4} value={form.description} onChange={e => upd("description", e.target.value)} required /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <div><label className="lbl">Domaine *</label><select className="inp" value={form.domaine} onChange={e => upd("domaine", e.target.value)} required><option value="">Sélectionner...</option>{DOMAINES_LIST.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                  <div><label className="lbl">Formateur</label><input className="inp" value={form.formateur} onChange={e => upd("formateur", e.target.value)} /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <div><label className="lbl">Niveau</label><select className="inp" value={form.niveau} onChange={e => upd("niveau", e.target.value)}><option value="">Sélectionner...</option>{NIVEAUX_LIST.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "14px 16px" }}>
                  <div onClick={() => upd("certifiante", !form.certifiante)} style={{ width: 44, height: 24, background: form.certifiante ? "#F7B500" : "#D1D5DB", borderRadius: 99, position: "relative", cursor: "pointer", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 2, left: form.certifiante ? 22 : 2, width: 20, height: 20, background: "#fff", borderRadius: "50%", transition: "left .2s" }} />
                  </div>
                  <div><div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540" }}>🎓 Formation certifiante</div><div style={{ fontSize: 11, color: "#64748B" }}>Une certification sera délivrée aux participants</div></div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <div style={{ marginBottom: 18 }}><label className="lbl">Mode *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                    {MODES_LIST.map(m => <div key={m.value} onClick={() => upd("mode", m.value)} style={{ border: `2px solid ${form.mode === m.value ? "#F7B500" : "#E2E8F0"}`, borderRadius: 11, padding: "12px 10px", cursor: "pointer", background: form.mode === m.value ? "#FFFBEB" : "#fff", textAlign: "center" }}><div style={{ fontWeight: 700, fontSize: 13 }}>{m.label}</div></div>)}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <div><label className="lbl">Durée</label><input className="inp" placeholder="Ex: 2 jours" value={form.duree} onChange={e => upd("duree", e.target.value)} /></div>
                  <div><label className="lbl">Localisation {form.mode === "presentiel" ? "*" : ""}</label><input className="inp" placeholder="Ex: Tunis..." value={form.localisation} onChange={e => upd("localisation", e.target.value)} required={form.mode === "presentiel"} disabled={form.mode === "en_ligne"} /></div>
                </div>
                <div style={{ marginBottom: 16 }}><label className="lbl">Lien formation</label><input className="inp" type="url" placeholder="https://..." value={form.lien_formation} onChange={e => upd("lien_formation", e.target.value)} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div><label className="lbl">Date début</label><input className="inp" type="date" value={form.dateDebut} onChange={e => upd("dateDebut", e.target.value)} /></div>
                  <div><label className="lbl">Date fin</label><input className="inp" type="date" value={form.dateFin} onChange={e => upd("dateFin", e.target.value)} /></div>
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
                <div style={{ marginBottom: 18 }}><label className="lbl">Tarif</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[{ value: "gratuit", label: "🎁 Gratuit" }, { value: "payant", label: "💰 Payant" }].map(t => <div key={t.value} onClick={() => { upd("type", t.value); upd("gratuit", t.value === "gratuit"); }} style={{ border: `2px solid ${form.type === t.value ? "#F7B500" : "#E2E8F0"}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", background: form.type === t.value ? "#FFFBEB" : "#fff" }}><div style={{ fontWeight: 700, fontSize: 14 }}>{t.label}</div></div>)}
                  </div>
                </div>
                {form.type === "payant" && <div style={{ marginBottom: 18 }}><label className="lbl">Prix (DT)</label><input className="inp" type="number" min="0" value={form.prix} onChange={e => upd("prix", e.target.value)} /></div>}
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
                  <div onClick={() => upd("places_limitees", !form.places_limitees)} style={{ width: 44, height: 24, background: form.places_limitees ? "#F7B500" : "#D1D5DB", borderRadius: 99, position: "relative", cursor: "pointer", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 2, left: form.places_limitees ? 22 : 2, width: 20, height: 20, background: "#fff", borderRadius: "50%", transition: "left .2s" }} />
                  </div>
                  <div><div style={{ fontWeight: 700, fontSize: 13, color: "#0A2540" }}>🎟️ Places limitées</div></div>
                </div>
                {form.places_limitees && <div><label className="lbl">Nombre de places *</label><input className="inp" type="number" min="1" value={form.places_disponibles} onChange={e => upd("places_disponibles", e.target.value)} /></div>}
              </div>
            )}
            {step === 4 && (
              <div>
                <label className="lbl">Image de couverture</label>
                <label className="upload-zone" style={{ minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />
                  {imagePreview ? <img src={imagePreview} alt="" style={{ maxWidth: "100%", maxHeight: 140, borderRadius: 10, objectFit: "cover" }} /> : <div style={{ textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 10 }}>🖼️</div><div style={{ fontWeight: 700, fontSize: 14, color: "#475569" }}>Cliquer pour uploader</div></div>}
                </label>
                <div style={{ marginTop: 20, background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#0369A1" }}>
                  <FaInfoCircle style={{ marginRight: 6 }} />Votre formation sera soumise en statut "En attente" et examinée par l'administrateur.
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: "14px 28px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F1F5F9" }}>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>Étape {step}/{steps.length}</div>
            <div style={{ display: "flex", gap: 10 }}>
              {step > 1 && <button type="button" className="btn btn-outline" onClick={() => setStep(s => s - 1)}><FaArrowLeft size={11} /> Précédent</button>}
              {step < steps.length ? <button type="button" className="btn btn-gold" style={{ padding: "10px 24px" }} onClick={() => { if (step === 1 && !step1Valid) { alert("Remplissez titre, description et domaine"); return; } setStep(s => s + 1); }}>Suivant →</button> : <button type="submit" className="btn btn-gold" disabled={submitting} style={{ padding: "11px 28px", fontSize: 14 }}>{submitting ? <><FaSpinner style={{ animation: "spin .8s linear infinite" }} /> Envoi...</> : <><FaCheck /> Soumettre</>}</button>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========================= MODAL PODCAST DETAIL =========================
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

function CreatePodcastModal({ onClose, onSuccess, expertData }: { onClose: () => void; onSuccess: () => void; expertData: any }) {
  const [titre, setTitre] = useState(""); const [description, setDescription] = useState(""); const [auteur, setAuteur] = useState(""); const [domaine, setDomaine] = useState(""); const [audioFile, setAudioFile] = useState<File | null>(null); const [imageFile, setImageFile] = useState<File | null>(null); const [audioPreview, setAudioPreview] = useState(""); const [imagePreview, setImagePreview] = useState(""); const [loading, setLoading] = useState(false);
  useEffect(() => { if (expertData) { const fullName = `${expertData.user?.prenom || ""} ${expertData.user?.nom || ""}`.trim(); if (fullName) setAuteur(fullName); if (expertData.domaine) setDomaine(expertData.domaine); } }, [expertData]);
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!titre || !audioFile) { alert("Titre et fichier audio requis"); return; } setLoading(true); const fd = new FormData(); fd.append("titre", titre); fd.append("description", description); fd.append("auteur", auteur); fd.append("domaine", domaine); fd.append("audio_file", audioFile); if (imageFile) fd.append("image_file", imageFile); try { const res = await fetch(`${BASE}/podcasts/expert/proposer`, { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }, body: fd }); if (res.ok) { onSuccess(); onClose(); } else alert("Erreur"); } catch { alert("Erreur réseau"); } setLoading(false); };
  return (
    <div className="modal-bg" onClick={onClose}><div className="modal-box" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
      <div style={{ background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", padding: "18px 24px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(139,92,246,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaMicrophone /></div><div><div style={{ color: "rgba(255,255,255,.6)", fontSize: 11 }}>Proposer un podcast</div><div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>Nouveau podcast</div></div></div>
        <button className="btn btn-gray" style={{ padding: "5px 10px", background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={onClose}>✕</button>
      </div>
      <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
        <div style={{ marginBottom: 16 }}><label className="lbl">Titre *</label><input className="inp" required value={titre} onChange={e => setTitre(e.target.value)} /></div>
        <div style={{ marginBottom: 16 }}><label className="lbl">Description</label><textarea className="inp" rows={3} value={description} onChange={e => setDescription(e.target.value)} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}><div><label className="lbl">Auteur</label><input className="inp" value={auteur} onChange={e => setAuteur(e.target.value)} /></div><div><label className="lbl">Domaine</label><input className="inp" value={domaine} onChange={e => setDomaine(e.target.value)} /></div></div>
        <div style={{ marginBottom: 16 }}><label className="lbl">Fichier audio (MP3) *</label><label className="upload-zone" style={{ minHeight: 70 }}><input type="file" accept="audio/mpeg" onChange={e => { const f = e.target.files?.[0]; if (f) { setAudioFile(f); setAudioPreview(f.name); } }} style={{ display: "none" }} />{audioPreview ? <span>✅ {audioPreview}</span> : <><FaFileAudio /> Uploader un MP3</>}</label></div>
        <div style={{ marginBottom: 16 }}><label className="lbl">Image de couverture</label><label className="upload-zone" style={{ minHeight: 70 }}><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />{imagePreview ? <img src={imagePreview} style={{ maxHeight: 60, borderRadius: 6 }} alt="" /> : <><FaImage /> Uploader une image</>}</label></div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}><button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button><button type="submit" className="btn btn-green" disabled={loading}>{loading ? "⏳ Envoi..." : "✅ Proposer"}</button></div>
      </form>
    </div></div>
  );
}

function EditPodcastModal({ podcast, onClose, onSuccess }: { podcast: any; onClose: () => void; onSuccess: () => void }) {
  const [titre, setTitre] = useState(podcast.titre || ""); const [description, setDescription] = useState(podcast.description || ""); const [auteur, setAuteur] = useState(podcast.auteur || ""); const [domaine, setDomaine] = useState(podcast.domaine || ""); const [audioFile, setAudioFile] = useState<File | null>(null); const [imageFile, setImageFile] = useState<File | null>(null); const [audioPreview, setAudioPreview] = useState(""); const [imagePreview, setImagePreview] = useState(podcast.image ? `${BASE}/uploads/podcasts-images/${podcast.image}` : ""); const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!titre) { alert("Titre requis"); return; } setLoading(true); const fd = new FormData(); fd.append("titre", titre); fd.append("description", description); fd.append("auteur", auteur); fd.append("domaine", domaine); if (audioFile) fd.append("audio_file", audioFile); if (imageFile) fd.append("image_file", imageFile); try { const res = await fetch(`${BASE}/podcasts/expert/modifier/${podcast.id}`, { method: "PUT", headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }, body: fd }); if (res.ok) { onSuccess(); onClose(); } else alert("Erreur"); } catch { alert("Erreur réseau"); } setLoading(false); };
  return (
    <div className="modal-bg" onClick={onClose}><div className="modal-box" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
      <div style={{ background: "linear-gradient(135deg,#2d1b5e,#4c1d95)", padding: "18px 24px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(139,92,246,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><FaMicrophone /></div><div><div style={{ color: "rgba(255,255,255,.6)", fontSize: 11 }}>Modifier</div><div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>{podcast.titre}</div></div></div>
        <button className="btn btn-gray" style={{ padding: "5px 10px", background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={onClose}>✕</button>
      </div>
      <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
        <div style={{ marginBottom: 16 }}><label className="lbl">Titre *</label><input className="inp" required value={titre} onChange={e => setTitre(e.target.value)} /></div>
        <div style={{ marginBottom: 16 }}><label className="lbl">Description</label><textarea className="inp" rows={3} value={description} onChange={e => setDescription(e.target.value)} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}><div><label className="lbl">Auteur</label><input className="inp" value={auteur} onChange={e => setAuteur(e.target.value)} /></div><div><label className="lbl">Domaine</label><input className="inp" value={domaine} onChange={e => setDomaine(e.target.value)} /></div></div>
        <div style={{ marginBottom: 16 }}><label className="lbl">Fichier audio (vide = conserver)</label><label className="upload-zone" style={{ minHeight: 70 }}><input type="file" accept="audio/mpeg" onChange={e => { const f = e.target.files?.[0]; if (f) { setAudioFile(f); setAudioPreview(f.name); } }} style={{ display: "none" }} />{audioPreview ? <span>✅ {audioPreview}</span> : podcast.url_audio ? <span>🔊 {podcast.url_audio}</span> : <><FaFileAudio /> Uploader</>}</label></div>
        <div style={{ marginBottom: 16 }}><label className="lbl">Image (vide = conserver)</label><label className="upload-zone" style={{ minHeight: 70 }}><input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />{imagePreview ? <img src={imagePreview} style={{ maxHeight: 60, borderRadius: 6 }} alt="" /> : <><FaImage /> Uploader</>}</label></div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}><button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button><button type="submit" className="btn btn-green" disabled={loading}>{loading ? "⏳ Envoi..." : "💾 Enregistrer"}</button></div>
      </form>
    </div></div>
  );
}

function RescheduleModal({ rdv, onClose, onSuccess, hdrJ }: { rdv: any; onClose: () => void; onSuccess: () => void; hdrJ: () => Record<string, string>; }) {
  const [newDate, setNewDate] = useState(""); const [reason, setReason] = useState(""); const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newDate) return; setLoading(true);
    try {
      const res = await fetch(`${BASE}/rendez-vous/${rdv.id}/proposer-creneau`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ nouvelle_date: newDate, raison: reason }) });
      if (res.ok) { onSuccess(); onClose(); }
      else {
        const formattedDate = new Date(newDate).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
        const contenu = `__RDV_PROPOSAL__\nrdv_id:${rdv.id}\nnouvelle_date:${newDate}\ndate_formatted:${formattedDate}\nraison:${reason || "Non précisée"}\n__END__\n\n📅 Nouveau créneau proposé : **${formattedDate}**${reason ? `\nRaison : ${reason}` : ""}`;
        const msgRes = await fetch(`${BASE}/messages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ receiver_id: rdv.client_id || rdv.startup?.user_id || rdv.startup_id, contenu }) });
        if (msgRes.ok) { onSuccess(); onClose(); } else alert("Impossible d'envoyer");
      }
    } catch { alert("Erreur réseau"); } setLoading(false);
  };
  return (
    <div className="modal-bg" onClick={onClose}><div className="modal-box" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
      <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", padding: "18px 24px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>Rendez-vous</div><div style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>📅 Proposer un nouveau créneau</div></div>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>✕</button>
      </div>
      <div style={{ padding: "14px 24px", background: "#FFFBEB", borderBottom: "1px solid #FDE68A" }}>
        <div style={{ fontSize: 13, color: "#92400E" }}><strong>RDV actuel :</strong> {new Date(rdv.date_rdv).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
        {rdv.sujet && <div style={{ fontSize: 12, color: "#B45309", marginTop: 3 }}>📌 {rdv.sujet}</div>}
      </div>
      <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
        <div style={{ marginBottom: 16 }}><label className="lbl">Nouvelle date & heure *</label><input className="inp" type="datetime-local" required value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().slice(0, 16)} /></div>
        <div style={{ marginBottom: 20 }}><label className="lbl">Raison (optionnelle)</label><textarea className="inp" rows={3} value={reason} onChange={e => setReason(e.target.value)} /></div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button><button type="submit" className="btn btn-gold" disabled={loading || !newDate}>{loading ? "⏳ Envoi..." : "📅 Envoyer"}</button></div>
      </form>
    </div></div>
  );
}

// ========================= COMPOSANT PRINCIPAL (corrigé avec logs) =========================
export default function DashboardExpert() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [expert, setExpert] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("accueil");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [demandesAssignees, setDemandesAssignees] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [mesDevis, setMesDevis] = useState<any[]>([]);
  const [pubTemos, setPubTemos] = useState<any[]>([]);
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);

  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  const [tIdx, setTIdx] = useState(0);
  const [tAnim, setTAnim] = useState(false);
  const [toast, setToast] = useState({ text: "", ok: true });
  const [selectedPodcast, setSelectedPodcast] = useState<any>(null);
  const [showCreatePodcastModal, setShowCreatePodcastModal] = useState(false);
  const [showEditPodcastModal, setShowEditPodcastModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<any>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<any>(null);
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [showMissionDetail, setShowMissionDetail] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [editProfil, setEditProfil] = useState({ domaine: "", description: "", localisation: "", telephone: "", annee_debut_experience: "" });
  const [modificationEnAttente, setModificationEnAttente] = useState(false);
  const [devisMission, setDevisMission] = useState<any>(null);
  const [devisForm, setDevisForm] = useState({ montant: "", description: "", delai: "" });
  const [showDevisModal, setShowDevisModal] = useState(false);

  const [contactAdminForm, setContactAdminForm] = useState({ sujet: "", message: "" });
  const [sendingContactAdmin, setSendingContactAdmin] = useState(false);
  const [contactAdminStatus, setContactAdminStatus] = useState<"idle" | "success" | "error">("idle");
  const [contactInfo, setContactInfo] = useState<{ email?: string; telephone?: string } | null>(null);

  const tk = useCallback(() => localStorage.getItem("access_token") || "", []);
  const hdr = useCallback(() => ({ Authorization: `Bearer ${tk()}` }), [tk]);
  const hdrJ = useCallback(() => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" }), [tk]);

  function notify(text: string, ok = true) { setToast({ text, ok }); setTimeout(() => setToast({ text: "", ok: true }), 5000); }
  const forceLogout = useCallback(() => { localStorage.clear(); window.location.href = "/connexion"; }, []);

  const unreadMsgCount = allMessages.filter(m => m.receiver_id === user?.id && !m.lu).length;
  const pendingRdvCount = rdvs.filter(r => r.statut === "en_attente").length;
  const notificationsCount = notifications.length;

  // Vérification rôle + chargement initial
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = tk();
    if (!token) {
      router.replace("/connexion");
      return;
    }
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (!res.ok) {
          localStorage.clear();
          router.replace("/connexion");
          return;
        }
        const realUser = await res.json();
        if (realUser.role !== "expert") {
          localStorage.clear();
          if (realUser.role === "startup") router.replace("/dashboard/startup");
          else if (realUser.role === "admin") router.replace("/dashboard/admin");
          else router.replace("/");
          return;
        }
        setUser(realUser);
        localStorage.setItem("user", JSON.stringify(realUser));
        await loadExpertData(realUser.id);
        try {
          const r = await fetch(`${BASE}/histoire`);
          if (r.ok) {
            const d = await r.json();
            setContactInfo({ email: d.email_contact || "plateformebeh@gmail.com", telephone: d.telephone_contact || "29524360" });
          }
        } catch {
          setContactInfo({ email: "plateformebeh@gmail.com", telephone: "29524360" });
        }
      })
      .catch(err => {
        console.error(err);
        setErrorAuth("Impossible de vérifier votre identité.");
      })
      .finally(() => setLoadingAuth(false));
  }, []);

  const loadExpertData = useCallback(async (userId: number) => {
    setLoading(true);
    try {
      const [expertRes, formationsRes, podcastsRes, demandesRes, devisRes, pubTemosRes, rdvsRes, notifsRes] = await Promise.all([
        fetch(`${BASE}/experts/moi`, { headers: hdr() }),
        fetch(`${BASE}/formations/expert/mes-formations`, { headers: hdr() }),
        fetch(`${BASE}/podcasts/expert/mes-podcasts`, { headers: hdr() }),
        fetch(`${BASE}/demandes-service/expert/assignees`, { headers: hdr() }),
        fetch(`${BASE}/devis/expert/mes-devis`, { headers: hdr() }),
        fetch(`${BASE}/temoignages/publics`),
        fetch(`${BASE}/rendez-vous/expert`, { headers: hdr() }),
        fetch(`${BASE}/demandes-service/expert/notifications`, { headers: hdr() }),
      ]);
      if (!expertRes.ok) throw new Error("Erreur chargement expert");
      const exp = await expertRes.json();
      setExpert(exp);
      setEditProfil({ domaine: exp.domaine || "", description: exp.description || "", localisation: exp.localisation || "", telephone: exp.user?.telephone || "", annee_debut_experience: exp.annee_debut_experience?.toString() || "" });
      setModificationEnAttente(exp.modification_demandee === true);
      setFormations(formationsRes.ok ? await formationsRes.json() : []);
      setPodcasts(podcastsRes.ok ? await podcastsRes.json() : []);
      setDemandesAssignees(demandesRes.ok ? await demandesRes.json() : []);
      setMesDevis(devisRes.ok ? await devisRes.json() : []);
      setPubTemos(pubTemosRes.ok ? await pubTemosRes.json() : []);
      setRdvs(rdvsRes.ok ? await rdvsRes.json() : []);
      if (notifsRes.ok) {
        const notifs = await notifsRes.json();
        setNotifications(Array.isArray(notifs) ? notifs : []);
        console.log("Notifications chargées:", notifs.length);
      } else {
        console.warn("Erreur chargement notifications:", notifsRes.status);
        setNotifications([]);
      }
      await refreshAllMessages();
    } catch (err) {
      console.error("loadExpertData error", err);
      notify("Erreur chargement des données", false);
    }
    finally { setLoading(false); }
  }, [hdr]);

  // Ouvrir le détail d'une mission
  function openMissionDetail(mission: any) {
    setSelectedMission(mission);
    setShowMissionDetail(true);
  }

  // Refuser une notification (mission)
  const refuserNotification = useCallback(async (demandeId: number) => {
    if (actionLoading[demandeId]) return;
    setActionLoading(prev => ({ ...prev, [demandeId]: true }));
    setNotifications(prev => prev.filter(n => n.id !== demandeId));
    try {
      let res = await fetch(`${BASE}/demandes-service/${demandeId}/refuser-expert`, { method: "PUT", headers: hdrJ() });
      if (!res.ok) res = await fetch(`${BASE}/demandes-service/${demandeId}/refuser`, { method: "PUT", headers: hdrJ() });
      if (!res.ok) res = await fetch(`${BASE}/demandes-service/${demandeId}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refusee" }) });
      if (res.ok) notify("❌ Mission refusée");
      else notify("Mission retirée de vos notifications", false);
    } catch (err) {
      console.error(err);
      notify("Erreur lors du refus", false);
    } finally {
      setActionLoading(prev => ({ ...prev, [demandeId]: false }));
      // Recharger les notifications pour être sûr
      await loadExpertData(user?.id);
    }
  }, [hdrJ, actionLoading, user?.id, loadExpertData]);

  // Accepter une mission : ouvre la modale Devis
  const handleAccepterMission = useCallback((mission: any) => {
    setDevisMission(mission);
    setShowDevisModal(true);
  }, []);

  // Envoyer le devis et marquer la mission comme acceptée
  const acceptMissionAndCreateDevis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devisMission) return;
    if (!devisForm.montant || Number(devisForm.montant) <= 0) {
      notify("Veuillez saisir un montant valide", false);
      return;
    }
    setActionLoading(prev => ({ ...prev, [devisMission.id]: true }));
    try {
      // 1. Accepter la mission
      const acceptRes = await fetch(`${BASE}/demandes-service/${devisMission.id}/accepter`, { method: "PUT", headers: hdrJ() });
      if (!acceptRes.ok) {
        const err = await acceptRes.json().catch(() => ({}));
        notify(`Erreur acceptation : ${err.message || "Erreur inconnue"}`, false);
        return;
      }
      // 2. Créer le devis
      const devisRes = await fetch(`${BASE}/devis`, {
        method: "POST",
        headers: hdrJ(),
        body: JSON.stringify({
          demande_id: devisMission.id,
          montant: Number(devisForm.montant),
          description: devisForm.description,
          delai: devisForm.delai,
        }),
      });
      if (devisRes.ok) {
        notify("✅ Devis envoyé au client !");
        setShowDevisModal(false);
        setDevisMission(null);
        setDevisForm({ montant: "", description: "", delai: "" });
        // Recharger toutes les données
        await loadExpertData(user?.id);
      } else {
        const err = await devisRes.json().catch(() => ({}));
        notify(`Erreur devis : ${err.message || "Erreur inconnue"}`, false);
      }
    } catch (err) {
      console.error(err);
      notify("Erreur réseau lors de l'envoi du devis", false);
    } finally {
      setActionLoading(prev => ({ ...prev, [devisMission.id]: false }));
    }
  };

  // Mettre à jour statut d'une mission assignée
  const updateMissionStatus = async (demandeId: number, statut: string) => {
    setActionLoading(prev => ({ ...prev, [demandeId]: true }));
    try {
      const r = await fetch(`${BASE}/demandes-service/${demandeId}/statut-expert`, {
        method: "PATCH",
        headers: hdrJ(),
        body: JSON.stringify({ statut }),
      });
      if (r.ok) {
        notify(`✅ Mission ${statut === "en_cours" ? "démarrée" : "terminée"}`);
        setDemandesAssignees(prev => prev.map(d => d.id === demandeId ? { ...d, statut } : d));
        await loadExpertData(user?.id);
      } else {
        notify("Erreur", false);
      }
    } catch (err) {
      console.error(err);
      notify("Erreur réseau", false);
    } finally {
      setActionLoading(prev => ({ ...prev, [demandeId]: false }));
    }
  };

  const openDevisModal = (demande: any) => {
    setDevisMission(demande);
    setShowDevisModal(true);
  };

  // Messages (inchangé, conservation de l'existant)
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
        }
      }
      demandesAssignees.forEach(d => { const u = d.user; if (u && u.id) contactsMap.set(u.id, { id: u.id, prenom: u.prenom, nom: u.nom, email: u.email, service: d.service }); });
      setContacts(Array.from(contactsMap.values()));
      if (selectedContact) {
        const filtered = messages.filter((m: any) => (m.sender_id === selectedContact.id && m.receiver_id === user?.id) || (m.sender_id === user?.id && m.receiver_id === selectedContact.id));
        setConversation(filtered.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      }
    } catch (err) { console.error("Erreur refreshAllMessages", err); }
  }, [hdr, user?.id, demandesAssignees, selectedContact]);

  const loadConversation = useCallback(async (contactUserId: number) => {
    const contact = contacts.find(c => c.id === contactUserId); if (!contact) return;
    setSelectedContact(contact);
    const filtered = allMessages.filter((m: any) => (m.sender_id === contactUserId && m.receiver_id === user?.id) || (m.sender_id === user?.id && m.receiver_id === contactUserId));
    setConversation(filtered.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    try { await fetch(`${BASE}/messages/mark-read/${contactUserId}`, { method: "PATCH", headers: hdr() }); setAllMessages(prev => prev.map(m => m.sender_id === contactUserId ? { ...m, lu: true } : m)); } catch {}
  }, [contacts, allMessages, user?.id, hdr]);

  async function sendMessage() {
    if (!newMsg.trim() || !selectedContact) return;
    try { const r = await fetch(`${BASE}/messages`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ receiver_id: selectedContact.id, contenu: newMsg }) }); if (r.ok) { setNewMsg(""); await refreshAllMessages(); } else notify("Erreur envoi", false); } catch { notify("Erreur réseau", false); }
  }
  async function deleteMessage(msgId: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/messages/${msgId}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("✅ Supprimé"); await refreshAllMessages(); } else notify("Erreur", false); }
  async function confirmerRdv(rdvId: number) { const r = await fetch(`${BASE}/rendez-vous/${rdvId}/confirmer`, { method: "PUT", headers: hdrJ() }); if (r.ok) { notify("✅ Confirmé"); loadExpertData(user?.id); } else notify("Erreur", false); }
  async function annulerRdv(rdvId: number) { if (!confirm("Annuler ?")) return; const r = await fetch(`${BASE}/rendez-vous/${rdvId}/annuler`, { method: "PUT", headers: hdrJ() }); if (r.ok) { notify("❌ Annulé"); loadExpertData(user?.id); } else notify("Erreur", false); }
  async function updatePhoto() { if (!photoFile) return; const fd = new FormData(); fd.append("photo", photoFile); const r = await fetch(`${BASE}/experts/photo`, { method: "POST", headers: { Authorization: `Bearer ${tk()}` }, body: fd }); if (r.ok) { notify("✅ Photo mise à jour"); await loadExpertData(user?.id); setPhotoFile(null); setPhotoPreview(""); } else notify("Erreur upload", false); }
  async function updateProfile() { const payload: any = {}; if (editProfil.domaine !== (expert?.domaine || "")) payload.domaine = editProfil.domaine; if (editProfil.description !== (expert?.description || "")) payload.description = editProfil.description; if (editProfil.localisation !== (expert?.localisation || "")) payload.localisation = editProfil.localisation; if (editProfil.telephone !== (expert?.user?.telephone || "")) payload.telephone = editProfil.telephone; const anneeNum = parseInt(editProfil.annee_debut_experience); if (!isNaN(anneeNum) && anneeNum !== expert?.annee_debut_experience) payload.annee_debut_experience = anneeNum; if (Object.keys(payload).length === 0) { notify("Aucune modification", false); return; } const res = await fetch(`${BASE}/experts/profil`, { method: "PUT", headers: hdrJ(), body: JSON.stringify(payload) }); if (res.ok) { notify("✅ Modification envoyée"); await loadExpertData(user?.id); } else notify("Erreur", false); }
  async function handleDeletePodcast(id: number) { if (!confirm("Supprimer ?")) return; const res = await fetch(`${BASE}/podcasts/expert/supprimer/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${tk()}` } }); if (res.ok) { notify("✅ Supprimé"); await loadExpertData(user?.id); } else notify("Erreur", false); }

  async function envoyerMessageAdmin(e: React.FormEvent) {
    e.preventDefault(); if (!contactAdminForm.message.trim()) return; setSendingContactAdmin(true);
    try {
      const r = await fetch(`${BASE}/contact/message`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ nom: user?.nom || "", prenom: user?.prenom || "", email: user?.email || "", subject: contactAdminForm.sujet || "Message d'un expert", message: contactAdminForm.message }) });
      if (r.ok) { setContactAdminStatus("success"); setContactAdminForm({ sujet: "", message: "" }); setTimeout(() => setContactAdminStatus("idle"), 5000); }
      else setContactAdminStatus("error");
    } catch { setContactAdminStatus("error"); } finally { setSendingContactAdmin(false); }
  }

  // Rafraîchissement périodique
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const rdvRes = await fetch(`${BASE}/rendez-vous/expert`, { headers: hdr() });
        if (rdvRes.ok) setRdvs(await rdvRes.json());
        const notifsRes = await fetch(`${BASE}/demandes-service/expert/notifications`, { headers: hdr() });
        if (notifsRes.ok) {
          const notifs = await notifsRes.json();
          setNotifications(Array.isArray(notifs) ? notifs : []);
        }
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [hdr]);

  useEffect(() => { if (tab === "messages") { refreshAllMessages(); const interval = setInterval(() => refreshAllMessages(), 5000); return () => clearInterval(interval); } }, [tab, refreshAllMessages]);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation]);
  useEffect(() => { if (!pubTemos.length) return; const t = setInterval(() => { if (!tAnim) setTIdx(p => (p + 1) % pubTemos.length); }, 5000); return () => clearInterval(t); }, [pubTemos.length, tAnim]);
  function goT(i: number) { if (tAnim || !pubTemos.length) return; setTAnim(true); setTimeout(() => { setTIdx(i); setTAnim(false); }, 280); }

  if (loadingAuth) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}><div style={{ textAlign: "center" }}><div style={{ width: 48, height: 48, border: "4px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} /><div style={{ color: "#0A2540", fontWeight: 600 }}>Vérification...</div></div></div>;
  if (errorAuth || !user || user.role !== "expert") return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0F4FA" }}><div style={{ padding: 32, maxWidth: 500, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div><div style={{ fontSize: 18, fontWeight: 700, color: "#DC2626", marginBottom: 8 }}>Accès refusé</div><button className="btn btn-gold" onClick={() => window.location.href = "/connexion"}>Se reconnecter</button></div></div>;

  const photoUrl = expert?.photo ? `${BASE}/uploads/photos/${expert?.photo}` : null;
  const initials = user ? (user.prenom?.[0] || "") + (user.nom?.[0] || "") : "?";
  const curTemo = pubTemos[tIdx % Math.max(pubTemos.length, 1)];
  const ADMIN_EMAIL = contactInfo?.email || "plateformebeh@gmail.com";
  const ADMIN_PHONE = contactInfo?.telephone || "29524360";
  const MAILTO_HREF = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent("Message Expert - " + (user?.prenom || "") + " " + (user?.nom || ""))}&body=${encodeURIComponent("Bonjour,\n\nJe suis " + (user?.prenom || "") + " " + (user?.nom || "") + " (" + (user?.email || "") + "), expert sur la plateforme BEH.\n\n")}`;
  const TEL_HREF = `tel:+216${ADMIN_PHONE.replace(/\s/g, "")}`;
  function buildMailtoWithForm(): string {
    if (!contactAdminForm.message.trim()) return MAILTO_HREF;
    const sujet = contactAdminForm.sujet || `Message Expert - ${user?.prenom || ""} ${user?.nom || ""}`;
    return `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(contactAdminForm.message)}`;
  }

  const TABS: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: "accueil",       label: "Accueil",            icon: "🏠" },
    { id: "profil",        label: "Mon Profil",         icon: "👤" },
    { id: "formations",    label: "Mes Formations",     icon: "📚" },
    { id: "podcasts",      label: "Mes Podcasts",       icon: "🎙️" },
    { id: "demandes",      label: "Missions",           icon: "📋", badge: notificationsCount > 0 ? notificationsCount : undefined },
    { id: "devis",         label: "Mes Devis",          icon: "📄" },
    { id: "messages",      label: "Messages",           icon: "💬", badge: unreadMsgCount > 0 ? unreadMsgCount : undefined },
    { id: "rdv",           label: "Rendez-vous",        icon: "📅", badge: pendingRdvCount > 0 ? pendingRdvCount : undefined },
    { id: "contact_admin", label: "Contacter l'Admin",  icon: "📞" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Plus Jakarta Sans',sans-serif;background:#F0F4FA;}
        .btn{font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;border:none;border-radius:10px;cursor:pointer;padding:10px 20px;font-size:13.5px;transition:all .2s;display:inline-flex;align-items:center;gap:7px;}
        .btn-gold{background:#F7B500;color:#0A2540;}.btn-gold:hover:not(:disabled){background:#e6a800;transform:translateY(-2px);}
        .btn-gold:disabled{background:#E2E8F0;color:#94A3B8;cursor:not-allowed;}
        .btn-dark{background:#0A2540;color:#fff;}.btn-dark:hover{background:#F7B500;color:#0A2540;}
        .btn-outline{background:transparent;border:2px solid #E8EEF6;color:#475569;}.btn-outline:hover{border-color:#F7B500;color:#F7B500;}
        .btn-green{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;}.btn-green:hover{background:#059669;color:#fff;}
        .btn-purple{background:#F3F0FF;color:#7C3AED;border:1px solid #DDD6FE;}.btn-purple:hover{background:#7C3AED;color:#fff;}
        .btn-gray{background:#F1F5F9;color:#475569;}.btn-gray:hover{background:#E2E8F0;}
        .btn-bl{background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;}.btn-bl:hover{background:#1D4ED8;color:#fff;}
        .btn-red{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;}.btn-red:hover{background:#DC2626;color:#fff;}
        .card{background:#fff;border:1px solid #E8EEF6;border-radius:18px;overflow:hidden;}
        .inp{width:100%;background:#F7F9FC;border:1.5px solid #E2E8F0;border-radius:10px;padding:11px 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;color:#0A2540;outline:none;transition:border-color .2s;}
        .inp:focus{border-color:#F7B500;box-shadow:0 0 0 3px rgba(247,181,0,.1);}
        .inp:disabled{background:#F1F5F9;color:#94A3B8;cursor:not-allowed;}
        textarea.inp{resize:vertical;min-height:90px;}
        .lbl{font-size:11px;font-weight:700;color:#7D8FAA;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px;}
        .modal-bg{position:fixed;inset:0;background:rgba(10,37,64,.6);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(5px);}
        .modal-box{background:#fff;border-radius:24px;width:100%;max-width:720px;max-height:92vh;overflow-y:auto;box-shadow:0 28px 80px rgba(10,37,64,.25);}
        .upload-zone{display:block;border:2px dashed #D1D5DB;border-radius:10px;padding:16px;background:#F8FAFC;cursor:pointer;text-align:center;transition:border-color .2s;}
        .upload-zone:hover{border-color:#F7B500;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes slideOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(20px)}}
        .fade-up{animation:fadeUp .35s ease;}
        .bo{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;}
        .bn{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;}
        .bw{background:#FFFBEB;color:#B45309;border:1px solid #FDE68A;border-radius:99px;padding:4px 12px;font-size:12px;font-weight:700;}
        .notif-card{border:1.5px solid #FDE68A;border-left:4px solid #F7B500;background:#FFFCF0;transition:all .22s;}
        .notif-card:hover{box-shadow:0 4px 20px rgba(247,181,0,.18);transform:translateY(-1px);}
        .mission-card{border:1.5px solid #E8EEF6;transition:all .22s;cursor:pointer;}
        .mission-card:hover{box-shadow:0 4px 20px rgba(10,37,64,.08);transform:translateY(-1px);border-color:rgba(247,181,0,.4);}
        .sidebar-btn{width:100%;display:flex;align-items:center;gap:12px;padding:11px 16px;border-radius:12px;border:none;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;color:rgba(255,255,255,.55);background:transparent;transition:all .18s;text-align:left;position:relative;}
        .sidebar-btn:hover{background:rgba(255,255,255,.08);color:#fff;}
        .sidebar-btn.active{background:rgba(247,181,0,.15);color:#F7B500;font-weight:800;}
        .contact-card{background:#fff;border:1.5px solid #E8EEF6;border-radius:18px;padding:24px;display:flex;align-items:center;gap:20px;transition:all .22s;text-decoration:none;cursor:pointer;}
        .contact-card:hover{border-color:#F7B500;box-shadow:0 8px 32px rgba(247,181,0,.15);transform:translateY(-3px);}
        .client-info-chip{display:inline-flex;align-items:center;gap:6px;background:#F8FAFC;border:1px solid #E8EEF6;border-radius:8px;padding:5px 10px;font-size:12px;color:#475569;font-weight:600;}
        .notif-removing{animation:slideOut .3s ease forwards;pointer-events:none;}
      `}</style>

      {/* TOAST */}
      {toast.text && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, background: toast.ok ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${toast.ok ? "#A7F3D0" : "#FECACA"}`, borderLeft: `4px solid ${toast.ok ? "#059669" : "#DC2626"}`, color: toast.ok ? "#059669" : "#DC2626", borderRadius: 12, padding: "13px 20px", fontWeight: 700, fontSize: 13, boxShadow: "0 8px 28px rgba(0,0,0,.12)", maxWidth: 380 }}>
          {toast.text}
        </div>
      )}

      {/* MODALES */}
      {showMissionDetail && selectedMission && (
        <MissionDetailModal
          mission={selectedMission}
          onClose={() => { setShowMissionDetail(false); setSelectedMission(null); }}
          onAccepter={handleAccepterMission}
          onRefuser={refuserNotification}
        />
      )}
      {showFormationModal && <ProposerFormationModal onClose={() => setShowFormationModal(false)} onSuccess={() => { notify("✅ Formation soumise !"); loadExpertData(user?.id); }} expertData={expert} user={user} tk={tk} />}
      {selectedPodcast && <PodcastDetailModal podcast={selectedPodcast} onClose={() => setSelectedPodcast(null)} />}
      {showCreatePodcastModal && expert && <CreatePodcastModal onClose={() => setShowCreatePodcastModal(false)} onSuccess={() => loadExpertData(user?.id)} expertData={expert} />}
      {showEditPodcastModal && editingPodcast && <EditPodcastModal podcast={editingPodcast} onClose={() => { setShowEditPodcastModal(false); setEditingPodcast(null); }} onSuccess={() => loadExpertData(user?.id)} />}

      {/* MODAL DEVIS */}
      {showDevisModal && devisMission && (
        <div className="modal-bg" onClick={() => setShowDevisModal(false)}>
          <div className="modal-box" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div style={{ background: "linear-gradient(135deg,#0A2540,#1a4a8a)", padding: "22px 28px", borderRadius: "24px 24px 0 0", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
              <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(247,181,0,.2)", border: "1.5px solid rgba(247,181,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📄</div>
                  <div>
                    <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>
                      {devisMission.statut === "en_attente" ? "Accepter & créer un devis" : "Créer un devis"}
                    </div>
                    <div style={{ color: "#fff", fontWeight: 900, fontSize: 18 }}>{devisMission.service}</div>
                    <div style={{ color: "rgba(255,255,255,.55)", fontSize: 12, marginTop: 3 }}>
                      Pour : {devisMission.user?.prenom} {devisMission.user?.nom}
                      {devisMission.user?.startup?.nom_startup && ` — ${devisMission.user.startup.nom_startup}`}
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowDevisModal(false)} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}><FaTimes /></button>
              </div>
            </div>
            {devisMission.description && (
              <div style={{ padding: "14px 28px", background: "#F8FAFC", borderBottom: "1px solid #E8EEF6", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <FaInfoCircle style={{ color: "#F7B500", marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, margin: 0 }}>{devisMission.description}</p>
              </div>
            )}
            <form onSubmit={acceptMissionAndCreateDevis} style={{ padding: "24px 28px" }}>
              <div style={{ marginBottom: 18 }}>
                <label className="lbl">Montant proposé (DT) *</label>
                <div style={{ position: "relative" }}>
                  <input className="inp" type="number" min="1" step="0.5" required value={devisForm.montant} onChange={e => setDevisForm({ ...devisForm, montant: e.target.value })} placeholder="Ex: 500" style={{ paddingRight: 50 }} />
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 700, color: "#94A3B8" }}>DT</span>
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label className="lbl">Description des prestations</label>
                <textarea className="inp" rows={4} value={devisForm.description} onChange={e => setDevisForm({ ...devisForm, description: e.target.value })} placeholder="Détaillez les prestations incluses, les livrables attendus..." />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label className="lbl">Délai de réalisation</label>
                <input className="inp" value={devisForm.delai} onChange={e => setDevisForm({ ...devisForm, delai: e.target.value })} placeholder="Ex: 2 semaines, 1 mois..." />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-gray" onClick={() => setShowDevisModal(false)}>Annuler</button>
                <button type="submit" style={{ background: "linear-gradient(135deg,#059669,#047857)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(5,150,105,.25)" }}>
                  <FaCheck /> {devisMission.statut === "en_attente" ? "Accepter & envoyer le devis" : "Envoyer le devis"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRescheduleModal && selectedRdv && <RescheduleModal rdv={selectedRdv} onClose={() => { setShowRescheduleModal(false); setSelectedRdv(null); }} hdrJ={hdrJ} onSuccess={() => { notify("✅ Proposition envoyée !"); loadExpertData(user?.id); }} />}

      {/* LAYOUT PRINCIPAL */}
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <aside style={{ width: sidebarCollapsed ? 72 : 240, background: "linear-gradient(180deg,#0A2540 0%,#0d2d4e 100%)", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0, transition: "width .22s cubic-bezier(.22,1,.36,1)", overflow: "hidden", zIndex: 90 }}>
          <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#F7B500", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#0A2540", fontSize: 11, flexShrink: 0 }}>BEH</div>
            {!sidebarCollapsed && <div><div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>Espace Expert</div><div style={{ color: "rgba(255,255,255,.35)", fontSize: 10.5 }}>Business Expert Hub</div></div>}
          </div>
          {!sidebarCollapsed && (
            <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#0A2540", flexShrink: 0, overflow: "hidden" }}>
                {photoUrl ? <img src={photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : initials}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.prenom} {user?.nom}</div>
                <div style={{ color: "rgba(255,255,255,.4)", fontSize: 10.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{expert?.domaine || "Expert"}</div>
              </div>
            </div>
          )}
          <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
            {TABS.map(t => {
              const isActive = tab === t.id;
              const isContact = t.id === "contact_admin";
              return (
                <button key={t.id} className={`sidebar-btn${isActive ? " active" : ""}`} onClick={() => setTab(t.id)}
                  style={{ marginBottom: 2, ...(isContact && !isActive ? { borderTop: "1px solid rgba(255,255,255,.07)", marginTop: 8, paddingTop: 14 } : {}) }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
                  {!sidebarCollapsed && <span style={{ flex: 1 }}>{t.label}</span>}
                  {t.badge && (
                    <span style={{ background: isActive ? "#F7B500" : "#EF4444", color: isActive ? "#0A2540" : "#fff", borderRadius: 99, padding: sidebarCollapsed ? "1px 5px" : "1px 7px", fontSize: 10, fontWeight: 800, position: sidebarCollapsed ? "absolute" : "static", top: sidebarCollapsed ? 6 : undefined, right: sidebarCollapsed ? 6 : undefined }}>
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div style={{ padding: "10px 10px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="sidebar-btn" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>{sidebarCollapsed ? "→" : "←"}</span>
              {!sidebarCollapsed && <span>Réduire</span>}
            </button>
            <button onClick={forceLogout} className="sidebar-btn">
              <span style={{ fontSize: 16 }}>🚪</span>
              {!sidebarCollapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </aside>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "auto" }}>
          <header style={{ background: "#fff", borderBottom: "1px solid #E8EEF6", padding: "0 28px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 80, flexShrink: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540" }}>
              {TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {(unreadMsgCount > 0 || pendingRdvCount > 0 || notificationsCount > 0) && (
                <div style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid #FDE68A", borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
                  🔔 {unreadMsgCount + pendingRdvCount + notificationsCount} notification{(unreadMsgCount + pendingRdvCount + notificationsCount) > 1 ? "s" : ""}
                </div>
              )}
              <button className="btn btn-gray" style={{ fontSize: 12 }} onClick={() => loadExpertData(user?.id)}>🔄 Actualiser</button>
            </div>
          </header>

          <main style={{ flex: 1, padding: "28px 28px" }}>

            {/* ========================= ACCUEIL ========================= */}
            {tab === "accueil" && (
              <div className="fade-up">
                <section style={{ position: "relative", overflow: "hidden", minHeight: 360, borderRadius: 20, marginBottom: 24 }}>
                  <div style={{ position: "absolute", inset: 0 }}><Image src="/image.png" alt="" fill priority style={{ objectFit: "cover" }} /><div style={{ position: "absolute", inset: 0, background: "linear-gradient(108deg,rgba(6,14,26,.95) 0%,rgba(10,30,60,.78) 44%,rgba(10,37,64,.18) 100%)" }} /></div>
                  <div style={{ position: "relative", zIndex: 10, padding: "60px 40px 70px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, background: "rgba(247,181,0,.1)", border: "1px solid rgba(247,181,0,.22)", borderRadius: 99, padding: "5px 16px 5px 10px" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F7B500", animation: "pulse 2s infinite", display: "inline-block" }} />
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#F7B500" }}>Bienvenue, {user?.prenom} 👋</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(24px,3.5vw,44px)", fontWeight: 900, color: "#fff", marginBottom: 14, lineHeight: 1.15 }}>Accompagnez les <span style={{ color: "#F7B500" }}>startups</span><br />vers l'excellence</h1>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,.72)", maxWidth: 460, lineHeight: 1.9, marginBottom: 26 }}>Proposez vos formations, podcasts, et accompagnez les startups dans leur croissance.</p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <button className="btn btn-gold" onClick={() => setTab("formations")}>📚 Mes formations</button>
                      <button className="btn btn-purple" onClick={() => setTab("podcasts")}>🎙️ Mes podcasts</button>
                      {notificationsCount > 0 && <button className="btn" style={{ background: "#FEF3C7", color: "#B45309", border: "1px solid #FDE68A" }} onClick={() => setTab("demandes")}>🔔 {notificationsCount} nouvelle{notificationsCount > 1 ? "s" : ""} mission{notificationsCount > 1 ? "s" : ""}</button>}
                    </div>
                  </div>
                </section>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
                  {[
                    { icon: "📋", label: "Missions assignées", value: demandesAssignees.length, color: "#8B5CF6" },
                    { icon: "📚", label: "Formations soumises", value: formations.length, color: "#F7B500" },
                    { icon: "🎙️", label: "Podcasts proposés", value: podcasts.length, color: "#7C3AED" },
                  ].map((kpi, i) => (
                    <div key={i} style={{ background: "#fff", border: "1.5px solid #E8EEF6", borderRadius: 16, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 13, background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{kpi.icon}</div>
                      <div><div style={{ fontSize: 28, fontWeight: 800, color: "#0A2540" }}>{kpi.value}</div><div style={{ fontSize: 12, color: "#8A9AB5" }}>{kpi.label}</div></div>
                    </div>
                  ))}
                </div>
                <section style={{ padding: "36px 28px", background: "#F8FAFC", borderRadius: 20, marginBottom: 24 }}>
                  <Reveal><div style={{ textAlign: "center", marginBottom: 28 }}><h2 style={{ fontWeight: 700, fontSize: "clamp(22px,3vw,36px)", color: "#0A2540" }}>Notre <span style={{ fontStyle: "italic", color: "#F7B500" }}>ADN</span></h2></div></Reveal>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                    {ADN_ITEMS.map((card, i) => (
                      <Reveal key={i} delay={i * .1}>
                        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(10,37,64,.07)", padding: "20px 20px 18px", cursor: "pointer" }} onClick={() => window.open(`/a-propos#${card.anchor}`, "_blank")}>
                          <div style={{ width: 40, height: 40, borderRadius: 11, background: `${card.color}15`, border: `1.5px solid ${card.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, fontSize: 17, color: card.color }}>{i === 0 ? <FaBullseye /> : i === 1 ? <FaRocket /> : <FaStar />}</div>
                          <h3 style={{ fontWeight: 700, color: "#0A2540", fontSize: 17, marginBottom: 7 }}>{card.title}</h3>
                          <p style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.8 }}>{card.body}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </section>
                {pubTemos.length > 0 && (
                  <section style={{ padding: "36px 28px", background: "#fff", borderRadius: 20 }}>
                    <div style={{ maxWidth: 700, margin: "0 auto" }}>
                      <div style={{ textAlign: "center", marginBottom: 28 }}><h2 style={{ fontWeight: 700, fontSize: "clamp(20px,3vw,34px)", color: "#0A2540" }}>Ce que disent nos <span style={{ color: "#F7B500" }}>clients</span></h2></div>
                      {curTemo && (
                        <div style={{ background: "#0A2540", borderRadius: 20, padding: "32px 40px", position: "relative", opacity: tAnim ? 0 : 1, transition: "all .3s" }}>
                          <FaQuoteLeft style={{ position: "absolute", top: 20, left: 26, fontSize: 28, color: "rgba(247,181,0,.15)" }} />
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= (curTemo.note || 5) ? "#F7B500" : "#334155", fontSize: 18 }}>★</span>)}</div>
                          <p style={{ fontStyle: "italic", color: "#fff", lineHeight: 1.8, textAlign: "center", marginBottom: 20, fontSize: "clamp(14px,2vw,17px)" }}>&ldquo;{curTemo.texte}&rdquo;</p>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#F7B500,#e6a800)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0A2540", margin: "0 auto 8px" }}>{curTemo.user?.prenom?.[0]}{curTemo.user?.nom?.[0]}</div>
                            <div style={{ color: "#fff", fontWeight: 700 }}>{curTemo.user?.prenom} {curTemo.user?.nom}</div>
                            <div style={{ color: "#F7B500", fontSize: 11, fontWeight: 600, marginTop: 3 }}>{curTemo.startup?.nom_startup || "Startup BEH"}</div>
                          </div>
                        </div>
                      )}
                      {pubTemos.length > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
                          <button onClick={() => goT((tIdx - 1 + pubTemos.length) % pubTemos.length)} style={{ width: 34, height: 34, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(247,181,0,.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaChevronLeft size={11} /></button>
                          <div style={{ display: "flex", gap: 6 }}>{pubTemos.map((_, i) => <button key={i} onClick={() => goT(i)} style={{ height: 6, width: i === tIdx ? 20 : 6, borderRadius: 99, border: "none", background: i === tIdx ? "#F7B500" : "rgba(10,37,64,.2)", cursor: "pointer", transition: "all .3s" }} />)}</div>
                          <button onClick={() => goT((tIdx + 1) % pubTemos.length)} style={{ width: 34, height: 34, background: "#0A2540", color: "#fff", borderRadius: "50%", border: "1px solid rgba(247,181,0,.3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FaChevronRight size={11} /></button>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* ========================= PROFIL ========================= */}
            {tab === "profil" && (
              <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto" }}>
                <div className="card" style={{ padding: "24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #F7B500" }}>
                      {photoPreview ? <img src={photoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : photoUrl ? <img src={photoUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ color: "#F7B500", fontWeight: 900, fontSize: 26 }}>{initials}</span>}
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
                    {!modificationEnAttente && <button className="btn btn-gold" onClick={updateProfile}><FaSave /> Envoyer les modifications</button>}
                  </div>
                </div>
              </div>
            )}

            {/* ========================= FORMATIONS ========================= */}
            {tab === "formations" && (
              <div className="fade-up">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div><h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540" }}>📚 Mes formations proposées</h2><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{formations.length} formation{formations.length !== 1 ? "s" : ""}</div></div>
                  <button className="btn btn-gold" onClick={() => setShowFormationModal(true)}><FaPlus size={12} /> Proposer une formation</button>
                </div>
                {formations.length === 0 ? (
                  <div className="card" style={{ padding: "60px 0", textAlign: "center" }}><div style={{ fontSize: 52, marginBottom: 14 }}>📚</div><div style={{ fontWeight: 700, fontSize: 17, color: "#0A2540", marginBottom: 8 }}>Aucune formation proposée</div><div style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>Soumettez votre première formation.</div><button className="btn btn-gold" style={{ fontSize: 14, padding: "12px 24px" }} onClick={() => setShowFormationModal(true)}><FaPlus size={12} /> Proposer une formation</button></div>
                ) : formations.map(f => (
                  <div key={f.id} className="card" style={{ marginBottom: 14, padding: "18px 22px", borderLeft: `4px solid ${f.statut === "publie" ? "#10B981" : f.statut === "refuse" ? "#EF4444" : "#F7B500"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>{f.titre}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 3 }}>📁 {f.domaine || "—"} · 👨‍🏫 {f.formateur || "Vous"} · {f.mode === "en_ligne" ? "💻 En ligne" : f.mode === "presentiel" ? "🏢 Présentiel" : "🌐 Hybride"}{f.duree && ` · ⏱ ${f.duree}`}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                          {f.certifiante && <span style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>🎓 Certifiante</span>}
                          {f.gratuit ? <span style={{ background: "#ECFDF5", color: "#059669", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>🎁 Gratuit</span> : f.prix ? <span style={{ background: "#FFF8E1", color: "#B45309", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>💰 {f.prix} DT</span> : null}
                        </div>
                        <div style={{ fontSize: 13, color: "#475569", marginTop: 8, maxWidth: 580, lineHeight: 1.6 }}>{f.description?.slice(0, 120)}{f.description?.length > 120 ? "..." : ""}</div>
                        {f.commentaire_admin && <div style={{ marginTop: 10, background: "#FFF8E1", padding: "8px 12px", borderRadius: 8, fontSize: 12 }}><strong>📩 Admin :</strong> {f.commentaire_admin}</div>}
                        <div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 8 }}>Soumis le {new Date(f.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                      </div>
                      <span className={f.statut === "publie" ? "bo" : f.statut === "refuse" ? "bn" : "bw"}>{f.statut === "publie" ? "✅ Publiée" : f.statut === "refuse" ? "❌ Refusée" : "⏳ En attente"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ========================= PODCASTS ========================= */}
            {tab === "podcasts" && (
              <div className="fade-up">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                  <div><h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540" }}>🎙️ Mes podcasts proposés</h2><div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>{podcasts.length} podcast{podcasts.length !== 1 ? "s" : ""}</div></div>
                  <button className="btn btn-purple" onClick={() => setShowCreatePodcastModal(true)}>➕ Proposer un podcast</button>
                </div>
                {podcasts.length === 0 ? (
                  <div className="card" style={{ padding: "60px 0", textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>🎙️</div><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540", marginBottom: 8 }}>Aucun podcast proposé</div><button className="btn btn-purple" onClick={() => setShowCreatePodcastModal(true)}>Proposer un podcast</button></div>
                ) : podcasts.map(p => (
                  <div key={p.id} className="card" style={{ marginBottom: 14, padding: "18px 22px", borderLeft: `4px solid ${p.statut === "publie" ? "#10B981" : p.statut === "refuse" ? "#EF4444" : "#F7B500"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>{p.titre}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 3 }}>🎙️ {p.auteur || "—"} · 📁 {p.domaine || "—"}</div>
                        <div style={{ fontSize: 13, color: "#475569", marginTop: 6, maxWidth: 580 }}>{p.description?.slice(0, 120)}...</div>
                        <div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 8 }}>Soumis le {new Date(p.createdAt).toLocaleDateString("fr-FR")}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        <span className={p.statut === "publie" ? "bo" : p.statut === "refuse" ? "bn" : "bw"}>{p.statut === "publie" ? "✅ Publié" : p.statut === "refuse" ? "❌ Refusé" : "⏳ En attente"}</span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-bl" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => { setEditingPodcast(p); setShowEditPodcastModal(true); }}><FaEdit /> Modifier</button>
                          <button className="btn btn-red" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => handleDeletePodcast(p.id)}><FaTrash /> Supprimer</button>
                          {p.url_audio && <button className="btn btn-gray" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => setSelectedPodcast(p)}><FaHeadphones /> Écouter</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ========================= MISSIONS (DEMANDES) ========================= */}
            {tab === "demandes" && (
              <div className="fade-up">
                {/* SECTION NOTIFICATIONS */}
                {notifications.length > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#FEF3C7,#FFFBEB)", border: "1.5px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔔</div>
                      <div>
                        <h3 style={{ fontWeight: 800, fontSize: 16, color: "#0A2540" }}>Nouvelles missions disponibles</h3>
                        <div style={{ fontSize: 12, color: "#8A9AB5" }}>Consultez les détails et répondez à chaque demande</div>
                      </div>
                      <span style={{ background: "#F7B500", color: "#0A2540", borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 800, marginLeft: "auto" }}>{notifications.length} nouvelle{notifications.length > 1 ? "s" : ""}</span>
                    </div>

                    {notifications.map(d => {
                      const isLoading = actionLoading[d.id];
                      return (
                        <div key={d.id} className="notif-card card" style={{ marginBottom: 14, opacity: isLoading ? 0.5 : 1, transition: "opacity .3s" }}>
                          <div style={{ padding: "18px 22px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                                  <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,#0A2540,#1a4080)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🛠️</div>
                                  <div>
                                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540" }}>{d.service}</div>
                                    <div style={{ fontSize: 11, color: "#8A9AB5" }}>{new Date(d.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
                                  </div>
                                  <span className="bw" style={{ marginLeft: "auto" }}>⏳ Nouvelle mission</span>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                                  <span className="client-info-chip"><FaUser size={10} /> {d.user?.prenom} {d.user?.nom}</span>
                                  {d.user?.startup?.nom_startup && <span className="client-info-chip"><FaBuilding size={10} /> {d.user.startup.nom_startup}</span>}
                                  {d.user?.startup?.secteur && <span className="client-info-chip"><FaTag size={10} /> {d.user.startup.secteur}</span>}
                                  {d.telephone && <span className="client-info-chip"><FaPhone size={10} /> {d.telephone}</span>}
                                  {d.delai && <span className="client-info-chip"><FaClock size={10} /> {d.delai}</span>}
                                </div>
                                {d.description && (
                                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 0, background: "#F8FAFC", padding: "10px 14px", borderRadius: 10, border: "1px solid #E8EEF6" }}>
                                    {d.description.length > 180 ? d.description.slice(0, 180) + "…" : d.description}
                                  </p>
                                )}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                                <button
                                  disabled={isLoading}
                                  onClick={() => openMissionDetail(d)}
                                  style={{ display: "flex", alignItems: "center", gap: 7, background: "#EFF6FF", color: "#1D4ED8", border: "1.5px solid #BFDBFE", borderRadius: 10, padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap", opacity: isLoading ? 0.5 : 1 }}
                                ><FaEye size={12} /> Voir les détails</button>
                                <button
                                  disabled={isLoading}
                                  onClick={() => handleAccepterMission(d)}
                                  style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", color: "#059669", border: "1.5px solid #A7F3D0", borderRadius: 10, padding: "9px 16px", fontWeight: 800, fontSize: 13, cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap", opacity: isLoading ? 0.5 : 1 }}
                                ><FaCheck size={11} /> {isLoading ? "⏳" : "Accepter & devis"}</button>
                                <button
                                  disabled={isLoading}
                                  onClick={() => { if (confirm("Refuser cette mission ?")) refuserNotification(d.id); }}
                                  style={{ display: "flex", alignItems: "center", gap: 7, background: "transparent", color: "#DC2626", border: "1.5px solid #FECACA", borderRadius: 10, padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap", opacity: isLoading ? 0.5 : 1 }}
                                ><FaTimesCircle size={11} /> Refuser</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ height: 1, background: "linear-gradient(to right, transparent, #E8EEF6, transparent)", margin: "8px 0 28px" }} />
                  </div>
                )}

                {notifications.length === 0 && demandesAssignees.length === 0 && (
                  <div style={{ background: "#F0FDF4", border: "1.5px solid #A7F3D0", borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>✅</span>
                    <div style={{ fontSize: 13.5, color: "#059669", fontWeight: 600 }}>Aucune nouvelle mission en attente. Notre équipe vous notifiera dès qu'une mission vous sera proposée.</div>
                  </div>
                )}

                {/* SECTION MISSIONS ASSIGNÉES */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div>
                    <h2 style={{ fontWeight: 800, fontSize: 18, color: "#0A2540" }}>📋 Mes missions assignées</h2>
                    <div style={{ fontSize: 13, color: "#8A9AB5", marginTop: 2 }}>
                      {demandesAssignees.filter(d => d.statut === "en_cours").length} en cours · {demandesAssignees.filter(d => d.statut === "terminee").length} terminées
                    </div>
                  </div>
                  <button className="btn btn-gray" style={{ fontSize: 12 }} onClick={() => loadExpertData(user?.id)}>🔄 Rafraîchir</button>
                </div>

                {demandesAssignees.length === 0 ? (
                  <div className="card" style={{ padding: "52px 0", textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
                    <div style={{ fontWeight: 700, color: "#0A2540", fontSize: 16, marginBottom: 6 }}>Aucune mission assignée</div>
                    <div style={{ fontSize: 13, color: "#8A9AB5" }}>Les missions apparaîtront ici après validation par l'administrateur.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {demandesAssignees.map(d => {
                      const statutColor = d.statut === "en_cours" ? "#3B82F6" : d.statut === "terminee" ? "#8B5CF6" : "#F7B500";
                      return (
                        <div key={d.id} className="mission-card card" style={{ borderLeft: `4px solid ${statutColor}` }} onClick={() => openMissionDetail(d)}>
                          <div style={{ padding: "20px 22px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${statutColor}15`, border: `1.5px solid ${statutColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                                    {d.statut === "en_cours" ? "🔄" : d.statut === "terminee" ? "✅" : "⏳"}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540" }}>{d.service}</div>
                                    <div style={{ fontSize: 11, color: "#8A9AB5" }}>Assignée le {new Date(d.updatedAt || d.createdAt).toLocaleDateString("fr-FR")}</div>
                                  </div>
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: d.description ? 10 : 0 }}>
                                  <span className="client-info-chip"><FaUser size={10} /> {d.user?.prenom} {d.user?.nom}</span>
                                  {d.user?.startup?.nom_startup && <span className="client-info-chip"><FaBuilding size={10} /> {d.user.startup.nom_startup}</span>}
                                  {d.user?.startup?.secteur && <span className="client-info-chip"><FaTag size={10} /> {d.user.startup.secteur}</span>}
                                  {d.delai && <span className="client-info-chip"><FaClock size={10} /> Délai : {d.delai}</span>}
                                </div>
                                {d.description && (
                                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, marginTop: 8, marginBottom: 0, background: "#F8FAFC", padding: "9px 13px", borderRadius: 9, border: "1px solid #E8EEF6" }}>
                                    {d.description.length > 200 ? d.description.slice(0, 200) + "…" : d.description}
                                  </p>
                                )}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                                <span style={{ background: d.statut === "en_attente" ? "#FFFBEB" : d.statut === "en_cours" ? "#EFF6FF" : d.statut === "terminee" ? "#F3E8FF" : "#FEF2F2", color: d.statut === "en_attente" ? "#B45309" : d.statut === "en_cours" ? "#1D4ED8" : d.statut === "terminee" ? "#7C3AED" : "#DC2626", border: `1px solid ${d.statut === "en_attente" ? "#FDE68A" : d.statut === "en_cours" ? "#BFDBFE" : d.statut === "terminee" ? "#DDD6FE" : "#FECACA"}`, borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
                                  {d.statut === "en_attente" ? "⏳ En attente" : d.statut === "en_cours" ? "🔄 En cours" : d.statut === "terminee" ? "✅ Terminée" : "❌ Refusée"}
                                </span>
                                {d.statut === "en_attente" && <button className="btn btn-green" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => updateMissionStatus(d.id, "en_cours")}>🚀 Démarrer</button>}
                                {d.statut === "en_cours" && <button className="btn btn-purple" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => updateMissionStatus(d.id, "terminee")}>✔️ Terminer</button>}
                                {d.statut !== "terminee" && d.statut !== "refusee" && <button className="btn btn-bl" style={{ fontSize: 12, padding: "7px 14px" }} onClick={() => openDevisModal(d)}>📄 Créer un devis</button>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ========================= DEVIS ========================= */}
            {tab === "devis" && (
              <div className="fade-up">
                <div style={{ fontWeight: 800, fontSize: 18, color: "#0A2540", marginBottom: 6 }}>📄 Mes devis envoyés</div>
                <div style={{ fontSize: 13, color: "#8A9AB5", marginBottom: 20 }}>{mesDevis.length} devis</div>
                {mesDevis.length === 0 ? (
                  <div className="card" style={{ padding: "52px 0", textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 14 }}>📄</div><div style={{ fontWeight: 700, color: "#0A2540", fontSize: 16, marginBottom: 6 }}>Aucun devis</div><div style={{ fontSize: 13, color: "#8A9AB5" }}>Créez des devis depuis vos missions.</div></div>
                ) : mesDevis.map(d => (
                  <div key={d.id} className="card" style={{ marginBottom: 14, borderLeft: `4px solid ${d.statut === "accepte" ? "#22C55E" : d.statut === "refuse" ? "#EF4444" : "#F7B500"}` }}>
                    <div style={{ padding: "18px 22px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: "#0A2540" }}>Devis #{d.id} — {d.demande?.service || "Mission"}</div>
                          <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Client : {d.demande?.user?.prenom} {d.demande?.user?.nom}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#F7B500", marginTop: 6 }}>💰 {d.montant} DT</div>
                          {d.description && <p style={{ fontSize: 13, color: "#475569", marginTop: 8, background: "#F8FAFC", padding: "8px 12px", borderRadius: 8 }}>{d.description}</p>}
                          {d.delai && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 5 }}>⏱ Délai : {d.delai}</div>}
                          <div style={{ fontSize: 11, color: "#8A9AB5", marginTop: 7 }}>Envoyé le {new Date(d.createdAt).toLocaleDateString("fr-FR")}</div>
                        </div>
                        <span className={d.statut === "accepte" ? "bo" : d.statut === "refuse" ? "bn" : "bw"}>{d.statut === "accepte" ? "✅ Accepté" : d.statut === "refuse" ? "❌ Refusé" : "⏳ En attente"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ========================= MESSAGES ========================= */}
            {tab === "messages" && (
              <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 16, height: "calc(100vh - 160px)" }}>
                <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0A2540" }}>Conversations ({contacts.length})</div>
                    <button className="btn btn-gray" style={{ fontSize: 11, padding: "4px 10px" }} onClick={refreshAllMessages}><FaSync style={{ fontSize: 10 }} /></button>
                  </div>
                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {contacts.length === 0 ? <div style={{ padding: "32px 16px", textAlign: "center", color: "#8A9AB5", fontSize: 13 }}><div style={{ fontSize: 30, marginBottom: 8 }}>💬</div>Aucune conversation.</div>
                      : contacts.map(c => {
                          const unread = allMessages.filter(m => m.sender_id === c.id && m.receiver_id === user?.id && !m.lu).length;
                          const lastMsg = allMessages.filter(m => (m.sender_id === c.id && m.receiver_id === user?.id) || (m.sender_id === user?.id && m.receiver_id === c.id)).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                          return (
                            <div key={c.id} onClick={() => loadConversation(c.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", cursor: "pointer", background: selectedContact?.id === c.id ? "#FFFBEB" : "transparent", borderLeft: selectedContact?.id === c.id ? "3px solid #F7B500" : "3px solid transparent", borderBottom: "0.5px solid #F1F5F9" }}>
                              <div style={{ width: 36, height: 36, borderRadius: "50%", background: selectedContact?.id === c.id ? "#FEF3C7" : "#0A2540", color: selectedContact?.id === c.id ? "#92400E" : "#F7B500", border: "1.5px solid rgba(247,181,0,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{c.prenom?.[0]}{c.nom?.[0]}</div>
                              <div style={{ overflow: "hidden", flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 12.5, color: "#0A2540", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.prenom} {c.nom}</div>
                                <div style={{ fontSize: 11, color: "#8A9AB5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lastMsg ? lastMsg.contenu.slice(0, 26) + "…" : c.service || ""}</div>
                              </div>
                              {unread > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 99, padding: "2px 6px", fontSize: 10, fontWeight: 800 }}>{unread}</span>}
                            </div>
                          );
                        })}
                  </div>
                </div>
                <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                  {!selectedContact ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#8A9AB5" }}>
                      <div style={{ fontSize: 48, marginBottom: 14 }}>💬</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540", marginBottom: 6 }}>Sélectionnez une conversation</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ padding: "14px 18px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFE", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#FEF3C7", color: "#92400E", border: "1.5px solid #F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>{selectedContact.prenom?.[0]}{selectedContact.nom?.[0]}</div>
                        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: "#0A2540", fontSize: 14 }}>{selectedContact.prenom} {selectedContact.nom}</div><div style={{ fontSize: 11, color: "#8A9AB5" }}>{selectedContact.email}</div></div>
                        <button className="btn btn-gray" style={{ fontSize: 11, padding: "5px 10px" }} onClick={refreshAllMessages}><FaSync style={{ fontSize: 10 }} /></button>
                      </div>
                      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                        {conversation.length === 0 && <div style={{ textAlign: "center", color: "#8A9AB5", padding: "40px 0", fontSize: 13 }}>Aucun message. Commencez la conversation !</div>}
                        {conversation.map((m, i) => {
                          const isMe = m.sender_id === user?.id;
                          const prevMsg = conversation[i - 1];
                          const showDate = !prevMsg || new Date(m.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
                          return (
                            <div key={m.id}>
                              {showDate && <div style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", margin: "8px 0", display: "flex", alignItems: "center", gap: 8 }}><div style={{ flex: 1, height: 1, background: "#F1F5F9" }} />{new Date(m.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}<div style={{ flex: 1, height: 1, background: "#F1F5F9" }} /></div>}
                              <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
                                {!isMe && <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#FEF3C7", color: "#92400E", border: "1.5px solid #F7B500", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{selectedContact.prenom?.[0]}{selectedContact.nom?.[0]}</div>}
                                <div>
                                  <div style={{ background: isMe ? "linear-gradient(135deg,#0A2540,#1a4080)" : "#F0F4FA", color: isMe ? "#fff" : "#0A2540", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px", maxWidth: 400, fontSize: 13.5, lineHeight: 1.65 }}>{m.contenu}</div>
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
                        <input className="inp" placeholder={`Répondre à ${selectedContact.prenom}…`} value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} style={{ flex: 1, borderRadius: 20, padding: "10px 16px" }} />
                        <button onClick={sendMessage} style={{ background: newMsg.trim() ? "#F7B500" : "#E2E8F0", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: newMsg.trim() ? "pointer" : "default", flexShrink: 0 }}>
                          <FaPaperPlane style={{ fontSize: 14, color: newMsg.trim() ? "#0A2540" : "#94A3B8" }} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ========================= RENDEZ-VOUS ========================= */}
            {tab === "rdv" && (
              <div className="fade-up">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div><h2 style={{ fontWeight: 800, fontSize: 20, color: "#0A2540" }}>📅 Mes rendez-vous</h2><div style={{ fontSize: 13, color: "#8A9AB5" }}>{rdvs.length} rendez-vous</div></div>
                  <button className="btn btn-gray" onClick={() => loadExpertData(user?.id)}>🔄 Rafraîchir</button>
                </div>
                {rdvs.length === 0 ? (
                  <div className="card" style={{ padding: "60px 0", textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>📅</div><div style={{ fontWeight: 700, fontSize: 16, color: "#0A2540", marginBottom: 6 }}>Aucun rendez-vous</div><div style={{ fontSize: 13, color: "#64748B" }}>Les RDV des startups apparaîtront ici.</div></div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {rdvs.map(rdv => (
                      <div key={rdv.id} className="card" style={{ borderLeft: `4px solid ${rdv.statut === "confirme" ? "#10B981" : rdv.statut === "annule" ? "#EF4444" : "#F7B500"}` }}>
                        <div style={{ padding: "20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center", color: "#F7B500", fontWeight: 700 }}>{rdv.client?.prenom?.[0]}{rdv.client?.nom?.[0]}</div>
                                <div><div style={{ fontWeight: 700, fontSize: 14.5, color: "#0A2540" }}>{rdv.client?.prenom} {rdv.client?.nom}</div><div style={{ fontSize: 12, color: "#64748B" }}>{rdv.client?.email}</div></div>
                              </div>
                              <div style={{ fontSize: 12.5, color: "#475569", marginBottom: 5, fontWeight: 600 }}>📌 {rdv.sujet || "Sujet non précisé"}</div>
                              <div style={{ fontSize: 12, color: "#64748B", display: "flex", alignItems: "center", gap: 5 }}><FaCalendar size={11} /> {new Date(rdv.date_rdv).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                              <span style={{ background: rdv.statut === "confirme" ? "#ECFDF5" : rdv.statut === "annule" ? "#FEF2F2" : "#FFFBEB", color: rdv.statut === "confirme" ? "#059669" : rdv.statut === "annule" ? "#DC2626" : "#B45309", borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>{rdv.statut === "confirme" ? "✅ Confirmé" : rdv.statut === "annule" ? "❌ Annulé" : "⏳ En attente"}</span>
                              {rdv.statut === "en_attente" && (
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => confirmerRdv(rdv.id)}>✅ Confirmer</button>
                                  <button className="btn btn-red" style={{ fontSize: 12 }} onClick={() => annulerRdv(rdv.id)}>❌ Annuler</button>
                                  <button className="btn btn-purple" style={{ fontSize: 12 }} onClick={() => { setSelectedRdv(rdv); setShowRescheduleModal(true); }}>📅 Autre créneau</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================= CONTACTER L'ADMIN ========================= */}
            {tab === "contact_admin" && (
              <div className="fade-up">
                <div style={{ background: "linear-gradient(135deg,#0A2540 0%,#1a3f6f 100%)", borderRadius: 20, padding: "36px 40px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.04) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
                  <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(247,181,0,.2)", border: "2px solid rgba(247,181,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>📞</div>
                    <div>
                      <div style={{ color: "rgba(255,255,255,.6)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 5 }}>Support & Assistance</div>
                      <h1 style={{ color: "#fff", fontWeight: 900, fontSize: "clamp(20px,3vw,30px)", marginBottom: 8 }}>Contacter l'Administrateur</h1>
                      <p style={{ color: "rgba(255,255,255,.6)", fontSize: 13.5, lineHeight: 1.7, maxWidth: 520 }}>Besoin d'aide, d'une information ou d'un signalement ? Notre équipe est disponible pour vous répondre rapidement.</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                  <a href={MAILTO_HREF} target="_blank" rel="noopener noreferrer" className="contact-card">
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", border: "1.5px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>✉️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Email direct</div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540", marginBottom: 3 }}>Envoyer un e-mail</div>
                      <div style={{ fontSize: 13, color: "#1D4ED8", fontWeight: 600 }}>{ADMIN_EMAIL}</div>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FaArrowRight style={{ color: "#1D4ED8", fontSize: 14 }} /></div>
                  </a>
                  <a href={TEL_HREF} target="_blank" rel="noopener noreferrer" className="contact-card">
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)", border: "1.5px solid #A7F3D0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>📱</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Appel direct</div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#0A2540", marginBottom: 3 }}>Appeler l'équipe</div>
                      <div style={{ fontSize: 13, color: "#059669", fontWeight: 600 }}>+216 {ADMIN_PHONE}</div>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FaArrowRight style={{ color: "#059669", fontSize: 14 }} /></div>
                  </a>
                </div>
                <div style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}>
                  <button onClick={() => { navigator.clipboard.writeText(ADMIN_PHONE); notify("📋 Numéro copié dans le presse-papier !"); }} className="btn btn-gray" style={{ gap: 8 }}>📋 Copier le numéro de téléphone</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{ flex: 1, height: 1, background: "#E8EEF6" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px" }}>ou envoyez un message via la plateforme</span>
                  <div style={{ flex: 1, height: 1, background: "#E8EEF6" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
                  <div className="card" style={{ padding: "28px 32px" }}>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontWeight: 800, fontSize: 17, color: "#0A2540", marginBottom: 5 }}>📝 Envoyer un message</div>
                      <div style={{ fontSize: 13, color: "#64748B" }}>Votre message sera transmis à l'administrateur.</div>
                    </div>
                    {contactAdminStatus === "success" && <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, color: "#059669", fontSize: 13.5 }}><FaCheckCircle /> ✅ Message envoyé ! L'administrateur vous répondra dans les meilleurs délais.</div>}
                    {contactAdminStatus === "error" && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, color: "#DC2626", fontSize: 13.5 }}>⚠️ Erreur d'envoi. Essayez directement par email.</div>}
                    <form onSubmit={envoyerMessageAdmin}>
                      <div style={{ background: "#F8FAFC", border: "1px solid #E8EEF6", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>Vos informations</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {[{ label: "Nom", val: `${user?.prenom || ""} ${user?.nom || ""}` }, { label: "Email", val: user?.email || "—" }].map((r, i) => (
                            <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "8px 12px", border: "1px solid #E8EEF6" }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", marginBottom: 2 }}>{r.label}</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#0A2540" }}>{r.val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label className="lbl">Sujet</label>
                        <select className="inp" value={contactAdminForm.sujet} onChange={e => setContactAdminForm({ ...contactAdminForm, sujet: e.target.value })}>
                          <option value="">— Sélectionnez un sujet —</option>
                          <option value="Demande d'information">💬 Demande d'information</option>
                          <option value="Problème technique">🔧 Problème technique</option>
                          <option value="Validation de profil">👤 Validation de profil</option>
                          <option value="Signalement">⚠️ Signalement</option>
                          <option value="Formation ou podcast">📚 Formation / Podcast</option>
                          <option value="Mission ou devis">📋 Mission / Devis</option>
                          <option value="Autre">💡 Autre</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label className="lbl">Message *</label>
                        <textarea className="inp" rows={6} required placeholder="Décrivez votre demande en détail..." value={contactAdminForm.message} onChange={e => setContactAdminForm({ ...contactAdminForm, message: e.target.value })} />
                      </div>
                      <a href={buildMailtoWithForm()} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, color: "#475569", textDecoration: "none", marginBottom: 12 }}>✉️ Ouvrir dans ma boîte mail</a>
                      <button type="submit" className="btn btn-gold" disabled={sendingContactAdmin} style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 15, fontWeight: 800 }}>
                        {sendingContactAdmin ? <><FaSpinner style={{ animation: "spin .8s linear infinite" }} /> Envoi en cours...</> : <><FaPaperPlane /> Envoyer via la plateforme</>}
                      </button>
                    </form>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="card" style={{ padding: "22px 24px" }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#0A2540", marginBottom: 16 }}>📍 Coordonnées directes</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <a href={MAILTO_HREF} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", padding: "12px 14px", background: "#F8FAFC", borderRadius: 12, border: "1.5px solid #E8EEF6" }}>
                          <div style={{ width: 40, height: 40, borderRadius: 11, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>✉️</div>
                          <div><div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Email</div><div style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8", marginTop: 2 }}>{ADMIN_EMAIL}</div></div>
                        </a>
                        <a href={TEL_HREF} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", padding: "12px 14px", background: "#F8FAFC", borderRadius: 12, border: "1.5px solid #E8EEF6" }}>
                          <div style={{ width: 40, height: 40, borderRadius: 11, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📱</div>
                          <div><div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Téléphone</div><div style={{ fontSize: 13, fontWeight: 700, color: "#059669", marginTop: 2 }}>+216 {ADMIN_PHONE}</div></div>
                        </a>
                      </div>
                    </div>
                    <div className="card" style={{ padding: "22px 24px" }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#0A2540", marginBottom: 14 }}>🕐 Disponibilités</div>
                      {[{ day: "Lun — Ven", hours: "09h00 – 18h00" }, { day: "Samedi", hours: "09h00 – 13h00" }, { day: "Dimanche", hours: "Fermé" }].map((h, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? "1px solid #F1F5F9" : "none" }}>
                          <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{h.day}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: h.hours === "Fermé" ? "#94A3B8" : "#059669", background: h.hours === "Fermé" ? "#F1F5F9" : "#ECFDF5", padding: "3px 8px", borderRadius: 6 }}>{h.hours}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "linear-gradient(135deg,#0A2540,#1a3f6f)", borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(247,181,0,.2)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 20 }}>⚡</span>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#F7B500" }}>Réponse garantie</div>
                      </div>
                      <p style={{ color: "rgba(255,255,255,.65)", fontSize: 12.5, lineHeight: 1.75, margin: 0 }}>Pour les urgences, appelez directement. Les emails sont traités sous <strong style={{ color: "#F7B500" }}>24h ouvrées</strong>.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>

          <footer style={{ background: "#0A2540", padding: "22px 28px", borderTop: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, flexShrink: 0 }}>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,.35)", margin: 0 }}>© 2026 Business Expert Hub · Tous droits réservés</p>
            <p style={{ color: "rgba(255,255,255,.2)", fontSize: 12, margin: 0 }}>Tarifs en Dinar Tunisien (HT)</p>
          </footer>
        </div>
      </div>
    </>
  );
}