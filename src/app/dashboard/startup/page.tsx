"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Icônes (conservées telles quelles)
const IconEdit = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconMessage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconLogout = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconMapPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconBriefcase = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);

export default function StartupDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [startup, setStartup] = useState<any>(null);
  const [experts, setExperts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [search, setSearch] = useState("");
  const [filterDomaine, setFilterDomaine] = useState("tous");

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nomStartup: "",
    secteur: "",
    taille: "",
    telephone: "",
  });
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [testimonialText, setTestimonialText] = useState("");
  const [showExpertsModal, setShowExpertsModal] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [showRdvModal, setShowRdvModal] = useState(false);
  const [rdvDate, setRdvDate] = useState("");
  const [rdvTime, setRdvTime] = useState("");
  const [rdvComment, setRdvComment] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/connexion');
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'startup') {
      router.push('/');
      return;
    }
    setUser(parsed);
    loadAllData();
  }, []);

  const token = () => localStorage.getItem('token');

  async function loadAllData() {
    setLoading(true);
    try {
      await Promise.all([
        loadStartupProfile(),
        loadExperts(),
        loadMessages(),
        loadAppointments(),
      ]);
    } catch (error) {
      console.error("Erreur chargement global:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStartupProfile() {
    const t = token();
    if (!t) return;
    try {
      const res = await fetch('http://localhost:3001/startups/moi', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStartup(data);
        setEditForm({
          nomStartup: data.nomEntreprise || "",
          secteur: data.secteur || "",
          taille: data.taille || "",
          telephone: data.telephone || "",
        });
      } else {
        console.error("Erreur chargement profil startup", res.status);
      }
    } catch (err) {
      console.error("Erreur réseau loadStartupProfile:", err);
    }
  }

  async function loadExperts() {
    const t = token();
    if (!t) return;
    try {
      const res = await fetch('http://localhost:3001/experts', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        const transformed = data.map((e: any) => ({
          ...e,
          user_id: e.user?.id,
        }));
        setExperts(Array.isArray(transformed) ? transformed : []);
      } else {
        console.error("Erreur chargement experts", res.status);
      }
    } catch (err) {
      console.error("Erreur réseau loadExperts:", err);
    }
  }

  async function loadMessages() {
    const t = token();
    if (!t) return;
    try {
      const res = await fetch('http://localhost:3001/messages/startup', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } else {
        console.error("Erreur chargement messages", res.status);
      }
    } catch (err) {
      console.error("Erreur réseau loadMessages:", err);
    }
  }

  async function loadAppointments() {
    const t = token();
    if (!t) return;
    try {
      const res = await fetch('http://localhost:3001/rendez-vous/startup', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      } else {
        console.error("Erreur chargement rendez-vous", res.status);
      }
    } catch (err) {
      console.error("Erreur réseau loadAppointments:", err);
    }
  }

  function showMsg(text: string, type = "success") {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3500);
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const t = token();
    if (!t) {
      showMsg("❌ Token manquant", "warning");
      setSending(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/startups/profil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        showMsg("✅ Profil mis à jour");
        setShowEditModal(false);
        loadStartupProfile();
      } else {
        const err = await res.json();
        showMsg(`❌ ${err.message || "Erreur"}`, "warning");
      }
    } catch (err) {
      showMsg("❌ Erreur réseau", "warning");
    } finally {
      setSending(false);
    }
  }

  async function handleTestimonialSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!testimonialText.trim()) return;
    setSending(true);
    const t = token();
    if (!t) {
      showMsg("❌ Token manquant", "warning");
      setSending(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/temoignages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({ texte: testimonialText }),
      });
      if (res.ok) {
        showMsg("✅ Témoignage envoyé (en attente de validation)");
        setShowTestimonialModal(false);
        setTestimonialText("");
      } else {
        const err = await res.json();
        showMsg(`❌ ${err.message || "Erreur"}`, "warning");
      }
    } catch (err) {
      showMsg("❌ Erreur réseau", "warning");
    } finally {
      setSending(false);
    }
  }

  async function handleRdvSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedExpert || !rdvDate || !rdvTime) return;
    setSending(true);
    const t = token();
    if (!t) {
      showMsg("❌ Token manquant", "warning");
      setSending(false);
      return;
    }
    try {
      const dateTime = new Date(`${rdvDate}T${rdvTime}`).toISOString();
      const res = await fetch('http://localhost:3001/rendez-vous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({
          expert_id: selectedExpert.id,
          date_rdv: dateTime,
          commentaire: rdvComment,
        }),
      });
      if (res.ok) {
        showMsg("✅ Demande de rendez-vous envoyée");
        setShowRdvModal(false);
        setSelectedExpert(null);
        setRdvDate("");
        setRdvTime("");
        setRdvComment("");
        loadAppointments();
      } else {
        const err = await res.json();
        showMsg(`❌ ${err.message || "Erreur"}`, "warning");
      }
    } catch (err) {
      showMsg("❌ Erreur réseau", "warning");
    } finally {
      setSending(false);
    }
  }

  async function handleMessageSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedExpert || !messageText.trim()) return;
    const destinataireId = selectedExpert.user_id || selectedExpert.user?.id;
    if (!destinataireId) {
      showMsg("❌ L'ID de l'expert est manquant.", "warning");
      return;
    }
    setSending(true);
    const t = token();
    if (!t) {
      showMsg("❌ Token manquant", "warning");
      setSending(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
        },
        body: JSON.stringify({
          destinataire_id: destinataireId,
          contenu: messageText,
        }),
      });
      if (res.ok) {
        showMsg("✅ Message envoyé");
        setShowMessageModal(false);
        setSelectedExpert(null);
        setMessageText("");
        loadMessages();
      } else {
        const responseText = await res.text();
        let errorMessage = `Erreur ${res.status}: ${res.statusText}`;
        try {
          const err = JSON.parse(responseText);
          errorMessage = err.message || errorMessage;
        } catch {}
        showMsg(`❌ ${errorMessage}`, "warning");
      }
    } catch (err) {
      showMsg("❌ Erreur réseau", "warning");
    } finally {
      setSending(false);
    }
  }

  function logout() {
    localStorage.clear();
    router.push('/');
  }

  const domaines = ["tous", ...new Set(experts.map(e => e.domaine).filter(Boolean))];
  const filteredExperts = experts.filter(e => {
    const matchSearch = `${e.prenom} ${e.nom} ${e.domaine}`.toLowerCase().includes(search.toLowerCase());
    const matchDomaine = filterDomaine === "tous" || e.domaine === filterDomaine;
    return matchSearch && matchDomaine;
  });

  const unreadMessages = messages.filter(m => !m.lu).length;
  const upcomingAppointments = appointments.filter(a => new Date(a.date_rdv) > new Date() && a.statut !== 'annulé').length;

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Chargement...</div>;

  const renderAvatar = (expert: any) => {
    if (expert.photo) {
      return (
        <img
          src={`http://localhost:3001/uploads/photos/${expert.photo}`}
          alt={expert.prenom}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-[#0A2540] text-[#F7B500] flex items-center justify-center font-bold text-sm">
          {expert.prenom?.[0]}{expert.nom?.[0]}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.4s ease both; }
        .btn { font-family: inherit; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; display: inline-flex; align-items: center; gap: 6px; }
        .btn-primary { background: #F7B500; color: #0A2540; border: 1px solid #F7B500; }
        .btn-primary:hover { background: #e6a800; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(247,181,0,0.3); }
        .btn-outline { background: white; color: #0A2540; border: 1px solid #E2E8F0; }
        .btn-outline:hover { background: #F8FAFC; border-color: #CBD5E1; }
        .btn-danger { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
        .btn-danger:hover { background: #FEE2E2; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; backdrop-filter: blur(4px); }
        .modal { background: white; border-radius: 20px; max-width: 520px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; }
        .badge { display: inline-flex; align-items: center; gap: 4px; border-radius: 20px; padding: 4px 10px; font-size: 11px; font-weight: 700; }
      `}</style>

      {/* HEADER */}
      <header className="bg-gradient-to-r from-[#0A2540] to-[#1a3a6b] px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F7B500] rounded-lg flex items-center justify-center font-serif font-bold text-[#0A2540] text-xs">BEH</div>
          <div>
            <div className="font-serif font-semibold text-white text-sm">Espace Startup</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">{user?.prenom} {user?.nom}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative bg-white/10 border border-white/20 rounded-lg p-2 text-white/70 hover:bg-white/20">
            <IconBell />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>
          <button onClick={logout} className="btn bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white">
            <IconLogout /> Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {msg.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-semibold ${msg.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {msg.text}
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2 text-blue-500"><IconUser /></div>
            <div className="text-2xl font-bold text-[#0A2540]">{startup?.nomEntreprise || "—"}</div>
            <div className="text-xs text-gray-500 mt-1">Ma startup</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2 text-purple-500"><IconMessage /></div>
            <div className="text-2xl font-bold text-[#0A2540]">{messages.length}</div>
            <div className="text-xs text-gray-500 mt-1">Messages reçus ({unreadMessages} non lus)</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2 text-green-500"><IconCalendar /></div>
            <div className="text-2xl font-bold text-[#0A2540]">{upcomingAppointments}</div>
            <div className="text-xs text-gray-500 mt-1">Rendez-vous à venir</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2 text-amber-500"><IconStar /></div>
            <div className="text-2xl font-bold text-[#0A2540]">{experts.length}</div>
            <div className="text-xs text-gray-500 mt-1">Experts disponibles</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button onClick={() => setShowEditModal(true)} className="btn btn-primary py-4 text-base">✏️ Modifier mon profil</button>
          <button onClick={() => setShowTestimonialModal(true)} className="btn btn-outline py-4 text-base">💬 Laisser un témoignage</button>
          <Link href="/dashboard/startup/messages" className="btn btn-outline py-4 text-base justify-center">📨 Voir mes messages</Link>
          <button onClick={() => setShowExpertsModal(true)} className="btn btn-outline py-4 text-base">🔍 Trouver un expert</button>
        </div>

        {/* Experts list preview */}
        {experts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
            <h2 className="font-serif text-xl font-semibold text-[#0A2540] mb-4">Experts récents</h2>
            <div className="space-y-3">
              {experts.slice(0, 3).map(expert => (
                <div key={expert.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    {renderAvatar(expert)}
                    <div>
                      <p className="font-semibold text-sm">{expert.prenom} {expert.nom}</p>
                      <p className="text-xs text-gray-500">{expert.domaine}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedExpert(expert); setShowRdvModal(true); }}
                      className="btn btn-primary text-xs py-1.5"
                    >
                      Réserver
                    </button>
                    <button
                      onClick={() => { setSelectedExpert(expert); setShowMessageModal(true); }}
                      className="btn btn-outline text-xs py-1.5"
                    >
                      Message
                    </button>
                  </div>
                </div>
              ))}
              {experts.length > 3 && (
                <button onClick={() => setShowExpertsModal(true)} className="text-[#F7B500] font-semibold text-sm flex items-center gap-1">
                  Voir tous les experts <IconArrow />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Édition Profil */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-serif text-xl font-semibold text-[#0A2540]">Modifier mon profil</h3>
                <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded"><IconClose /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nom de la startup</label>
                  <input
                    type="text"
                    value={editForm.nomStartup}
                    onChange={e => setEditForm({...editForm, nomStartup: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F7B500]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Secteur</label>
                  <input
                    type="text"
                    value={editForm.secteur}
                    onChange={e => setEditForm({...editForm, secteur: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F7B500]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Taille</label>
                  <input
                    type="text"
                    value={editForm.taille}
                    onChange={e => setEditForm({...editForm, taille: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F7B500]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={editForm.telephone}
                    onChange={e => setEditForm({...editForm, telephone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F7B500]/50"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Annuler</button>
                  <button type="submit" disabled={sending} className="btn btn-primary">
                    {sending ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Témoignage */}
        {showTestimonialModal && (
          <div className="modal-overlay" onClick={() => setShowTestimonialModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-serif text-xl font-semibold text-[#0A2540]">Envoyer un témoignage</h3>
                <button onClick={() => setShowTestimonialModal(false)} className="p-1 hover:bg-gray-100 rounded"><IconClose /></button>
              </div>
              <form onSubmit={handleTestimonialSubmit} className="p-6 space-y-4">
                <textarea
                  rows={5}
                  value={testimonialText}
                  onChange={e => setTestimonialText(e.target.value)}
                  placeholder="Votre témoignage..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F7B500]/50"
                  required
                />
                <div className="flex justify-end gap-3">
                  <button type="button" className="btn btn-outline" onClick={() => setShowTestimonialModal(false)}>Annuler</button>
                  <button type="submit" disabled={sending} className="btn btn-primary">
                    {sending ? "Envoi..." : "Envoyer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Liste Experts (avec photos) */}
        {showExpertsModal && (
          <div className="modal-overlay" onClick={() => setShowExpertsModal(false)}>
            <div className="modal max-w-2xl" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-serif text-xl font-semibold text-[#0A2540]">Tous les experts</h3>
                <button onClick={() => setShowExpertsModal(false)} className="p-1 hover:bg-gray-100 rounded"><IconClose /></button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                {/* Filtres */}
                <div className="flex gap-3 mb-4">
                  <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F7B500]/50"
                    />
                  </div>
                  <select
                    value={filterDomaine}
                    onChange={e => setFilterDomaine(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#F7B500]/50"
                  >
                    {domaines.map(d => <option key={d} value={d}>{d === "tous" ? "Tous domaines" : d}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  {filteredExperts.map(expert => (
                    <div key={expert.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-3">
                        {renderAvatar(expert)}
                        <div>
                          <p className="font-semibold">{expert.prenom} {expert.nom}</p>
                          <p className="text-xs text-gray-500">{expert.domaine}</p>
                          {expert.localisation && <p className="text-xs text-gray-400"><IconMapPin className="inline" /> {expert.localisation}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedExpert(expert); setShowRdvModal(true); setShowExpertsModal(false); }}
                          className="btn btn-primary text-xs py-1.5"
                        >
                          Réserver
                        </button>
                        <button
                          onClick={() => { setSelectedExpert(expert); setShowMessageModal(true); setShowExpertsModal(false); }}
                          className="btn btn-outline text-xs py-1.5"
                        >
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredExperts.length === 0 && <p className="text-center text-gray-500">Aucun expert trouvé</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Réservation */}
        {showRdvModal && selectedExpert && (
          <div className="modal-overlay" onClick={() => setShowRdvModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-serif text-xl font-semibold text-[#0A2540]">Réserver avec {selectedExpert.prenom}</h3>
                <button onClick={() => setShowRdvModal(false)} className="p-1 hover:bg-gray-100 rounded"><IconClose /></button>
              </div>
              <form onSubmit={handleRdvSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={rdvDate}
                    onChange={e => setRdvDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F7B500]/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Heure</label>
                  <input
                    type="time"
                    value={rdvTime}
                    onChange={e => setRdvTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F7B500]/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Commentaire (optionnel)</label>
                  <textarea
                    value={rdvComment}
                    onChange={e => setRdvComment(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F7B500]/50"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" className="btn btn-outline" onClick={() => setShowRdvModal(false)}>Annuler</button>
                  <button type="submit" disabled={sending} className="btn btn-primary">
                    {sending ? "Envoi..." : "Confirmer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Message */}
        {showMessageModal && selectedExpert && (
          <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-serif text-xl font-semibold text-[#0A2540]">Message à {selectedExpert.prenom}</h3>
                <button onClick={() => setShowMessageModal(false)} className="p-1 hover:bg-gray-100 rounded"><IconClose /></button>
              </div>
              <form onSubmit={handleMessageSubmit} className="p-6 space-y-4">
                <textarea
                  rows={5}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Votre message..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F7B500]/50"
                  required
                />
                <div className="flex justify-end gap-3">
                  <button type="button" className="btn btn-outline" onClick={() => setShowMessageModal(false)}>Annuler</button>
                  <button type="submit" disabled={sending} className="btn btn-primary">
                    {sending ? "Envoi..." : "Envoyer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}