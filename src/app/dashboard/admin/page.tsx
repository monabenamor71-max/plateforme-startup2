"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaUsers, FaUserTie, FaBuilding, FaQuoteRight,
  FaCheckCircle, FaTimesCircle, FaTrashAlt,
  FaBan, FaCheck, FaEye, FaEyeSlash,
  FaSearch, FaEnvelope, FaReply, FaClock,
  FaChartLine, FaEnvelopeOpen,
  FaStar, FaCalendarAlt, FaMapMarkerAlt, FaPhone,
  FaServicestack, FaPlus, FaEdit, FaArrowRight,
  FaGraduationCap, FaMicrophone, FaHandsHelping, FaSearchPlus,
} from "react-icons/fa";

type Tab = "users" | "experts" | "startups" | "testimonials" | "messages" | "services";

// URL de l'API - à adapter selon votre configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("services");
  const [users, setUsers] = useState<any[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("tous");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, non_lu: 0, lu: 0, repondu: 0 });
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceForm, setServiceForm] = useState({
    type: "formation",
    nom: "",
    slug: "",
    description: "",
    icone: "",
    couleur: "#F7B500",
    duree: "",
    prix: 0,
    actif: true
  });
  const [showDemandeModal, setShowDemandeModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState<any>(null);
  const [demandeResponse, setDemandeResponse] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/connexion');
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(parsed);
    loadData();
  }, []);

  const token = () => localStorage.getItem('token');

  function showMsg(text: string, type = "success") {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3500);
  }

  async function loadData() {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchExperts(),
        fetchStartups(),
        fetchTestimonials(),
        fetchMessages(),
        fetchMessagesStats(),
        fetchServices(),
        fetchDemandes(),
      ]);
    } catch (error) {
      console.error("Erreur chargement données:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) setUsers(await res.json());
    } catch (error) {
      console.error("Erreur fetchUsers:", error);
    }
  }

  async function fetchExperts() {
    try {
      const res = await fetch(`${API_URL}/admin/experts`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExperts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erreur fetchExperts:", error);
    }
  }

  async function fetchStartups() {
    try {
      const res = await fetch(`${API_URL}/admin/startups`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStartups(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erreur fetchStartups:", error);
    }
  }

  async function fetchTestimonials() {
    try {
      const res = await fetch(`${API_URL}/admin/temoignages`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTestimonials(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erreur fetchTestimonials:", error);
    }
  }

  async function fetchMessages() {
    try {
      const res = await fetch(`${API_URL}/contact/admin/messages`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error("Erreur fetchMessages:", error);
    }
  }

  async function fetchMessagesStats() {
    try {
      const res = await fetch(`${API_URL}/contact/admin/stats`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Erreur fetchMessagesStats:", error);
    }
  }

  async function fetchServices() {
    try {
      const res = await fetch(`${API_URL}/services`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setServices(data.success ? data.data : []);
      }
    } catch (error) {
      console.error("Erreur fetchServices:", error);
    }
  }

  async function fetchDemandes() {
    try {
      const res = await fetch(`${API_URL}/services/admin/demandes`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDemandes(data.data || []);
      }
    } catch (error) {
      console.error("Erreur fetchDemandes:", error);
    }
  }

  // ✅ FONCTION CREATE SERVICE CORRIGÉE
  async function createService(data: any) {
    setSending(true);
    try {
      const tokenValue = token();
      if (!tokenValue) {
        showMsg("❌ Vous n'êtes pas authentifié", "warning");
        return;
      }

      // 🔴 FORCER actif = TRUE et type = formation pour les formations
      const serviceData = {
        ...data,
        actif: true,  // FORCER ACTIF À TRUE
        type: data.type || "formation"
      };

      console.log("📝 Création service - Données envoyées:", serviceData);

      const res = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenValue}`,
        },
        body: JSON.stringify(serviceData),
      });
      
      const result = await res.json();
      
      if (res.ok && result.success) {
        showMsg("✅ Service créé avec succès");
        fetchServices();
        setShowServiceModal(false);
        resetServiceForm();
      } else {
        showMsg(result.message || "❌ Erreur lors de la création", "warning");
      }
    } catch (error: any) {
      console.error("Erreur création service:", error);
      showMsg(`❌ Erreur: ${error.message}`, "warning");
    } finally {
      setSending(false);
    }
  }

  async function updateService(id: number, data: any) {
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`,
        },
        body: JSON.stringify(data),
      });
      
      const result = await res.json();
      
      if (res.ok && result.success) {
        showMsg("✅ Service modifié avec succès");
        fetchServices();
        setShowServiceModal(false);
        resetServiceForm();
      } else {
        showMsg(result.message || "❌ Erreur lors de la modification", "warning");
      }
    } catch (error) {
      console.error("Erreur modification service:", error);
      showMsg("❌ Erreur de connexion au serveur", "warning");
    } finally {
      setSending(false);
    }
  }

  async function deleteService(id: number, name: string) {
    if (!confirm(`Supprimer le service "${name}" ?`)) return;
    try {
      const res = await fetch(`${API_URL}/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        showMsg("✅ Service supprimé", "warning");
        fetchServices();
      } else {
        showMsg("❌ Erreur lors de la suppression", "warning");
      }
    } catch (error) {
      console.error("Erreur suppression service:", error);
      showMsg("❌ Erreur de connexion au serveur", "warning");
    }
  }

  async function traiterDemande(id: number, statut: string, reponse: string) {
    try {
      const res = await fetch(`${API_URL}/services/admin/demandes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`,
        },
        body: JSON.stringify({ statut, reponse_admin: reponse }),
      });
      if (res.ok) {
        showMsg("✅ Demande traitée avec succès");
        fetchDemandes();
        setShowDemandeModal(false);
        setDemandeResponse("");
      } else {
        showMsg("❌ Erreur lors du traitement", "warning");
      }
    } catch (error) {
      console.error("Erreur traitement demande:", error);
      showMsg("❌ Erreur de connexion au serveur", "warning");
    }
  }

  function resetServiceForm() {
    setEditingService(null);
    setServiceForm({
      type: "formation",
      nom: "",
      slug: "",
      description: "",
      icone: "",
      couleur: "#F7B500",
      duree: "",
      prix: 0,
      actif: true  // 🔴 FORCER ACTIF À TRUE
    });
  }

  function openCreateServiceModal() {
    resetServiceForm();
    setShowServiceModal(true);
  }

  function openEditServiceModal(service: any) {
    setEditingService(service);
    setServiceForm({
      type: service.type,
      nom: service.nom,
      slug: service.slug,
      description: service.description,
      icone: service.icone || "",
      couleur: service.couleur || "#F7B500",
      duree: service.duree || "",
      prix: service.prix || 0,
      actif: service.actif,
    });
    setShowServiceModal(true);
  }

  async function marquerCommeLu(id: number) {
    try {
      const res = await fetch(`${API_URL}/contact/admin/messages/${id}/lu`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        showMsg("✅ Message marqué comme lu");
        fetchMessages();
        fetchMessagesStats();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function supprimerMessage(id: number) {
    if (!confirm("Supprimer ce message ?")) return;
    try {
      const res = await fetch(`${API_URL}/contact/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        showMsg("✅ Message supprimé", "warning");
        fetchMessages();
        fetchMessagesStats();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function repondreMessage(id: number, reponse: string) {
    if (!reponse.trim()) return;
    try {
      const res = await fetch(`${API_URL}/contact/admin/messages/${id}/repondre`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`,
        },
        body: JSON.stringify({ reponse }),
      });
      if (res.ok) {
        showMsg("✅ Réponse envoyée par email avec succès");
        fetchMessages();
        fetchMessagesStats();
        setShowReplyModal(false);
        setReplyText("");
      } else {
        const error = await res.json();
        showMsg(error.message || "❌ Erreur lors de l'envoi", "warning");
      }
    } catch (error) {
      console.error(error);
      showMsg("❌ Erreur de connexion au serveur", "warning");
    }
  }

  async function validerExpert(id: number) {
    const res = await fetch(`${API_URL}/admin/experts/${id}/valider`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) {
      showMsg("✅ Expert validé");
      fetchExperts();
    } else {
      showMsg("❌ Erreur", "warning");
    }
  }

  async function refuserExpert(id: number) {
    const res = await fetch(`${API_URL}/admin/experts/${id}/refuser`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) {
      showMsg("✅ Expert refusé", "warning");
      fetchExperts();
    } else {
      showMsg("❌ Erreur", "warning");
    }
  }

  async function validerStartup(id: number) {
    const res = await fetch(`${API_URL}/admin/startups/${id}/valider`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) {
      showMsg("✅ Startup validée");
      fetchStartups();
    } else {
      showMsg("❌ Erreur", "warning");
    }
  }

  async function deleteUser(id: number, name: string) {
    if (!confirm(`Supprimer l'utilisateur ${name} ?`)) return;
    const res = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) {
      showMsg("✅ Utilisateur supprimé");
      fetchUsers();
      fetchExperts();
      fetchStartups();
    } else {
      showMsg("❌ Erreur", "warning");
    }
  }

  async function toggleUser(id: number, isActive: boolean) {
    const route = isActive ? 'desactiver' : 'activer';
    const res = await fetch(`${API_URL}/admin/users/${id}/${route}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) {
      showMsg(isActive ? "✅ Utilisateur désactivé" : "✅ Utilisateur activé");
      fetchUsers();
    } else {
      showMsg("❌ Erreur", "warning");
    }
  }

  async function validerTestimonial(id: number) {
    const res = await fetch(`${API_URL}/admin/temoignages/${id}/valider`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) {
      showMsg("✅ Témoignage validé");
      fetchTestimonials();
    } else {
      showMsg("❌ Erreur", "warning");
    }
  }

  async function deleteTestimonial(id: number) {
    if (!confirm("Supprimer ce témoignage ?")) return;
    const res = await fetch(`${API_URL}/admin/temoignages/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) {
      showMsg("✅ Témoignage supprimé", "warning");
      fetchTestimonials();
    } else {
      showMsg("❌ Erreur", "warning");
    }
  }

  const filteredServices = services.filter(s => {
    const matchesSearch = search === "" ||
      s.nom?.toLowerCase().includes(search.toLowerCase()) ||
      s.type?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const filteredDemandes = demandes.filter(d => {
    const matchesSearch = search === "" ||
      d.user_id?.toString().includes(search) ||
      d.service?.nom?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "tous" || d.statut === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredMessages = messages.filter(m => {
    const matchesSearch = search === "" ||
      m.nom?.toLowerCase().includes(search.toLowerCase()) ||
      m.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "tous" ||
      (filterStatus === "non_lu" && m.statut === "non_lu") ||
      (filterStatus === "lu" && m.statut === "lu") ||
      (filterStatus === "repondu" && m.statut === "repondu");
    return matchesSearch && matchesStatus;
  });

  const filteredExperts = experts.filter(e => {
    const matchesSearch = search === "" ||
      e.user?.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      e.user?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      e.domaine?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "tous" ||
      (filterStatus === "valide" && e.validation === true) ||
      (filterStatus === "en_attente" && e.validation === false);
    return matchesSearch && matchesStatus;
  });

  const filteredStartups = startups.filter(s => {
    const matchesSearch = search === "" ||
      s.user?.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      s.secteur?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "tous" ||
      (filterStatus === "valide" && s.valide === true) ||
      (filterStatus === "en_attente" && s.valide === false);
    return matchesSearch && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consulting': return <FaChartLine className="text-blue-500" />;
      case 'audit': return <FaSearchPlus className="text-purple-500" />;
      case 'accompagnement': return <FaHandsHelping className="text-yellow-500" />;
      case 'formation': return <FaGraduationCap className="text-green-500" />;
      case 'podcast': return <FaMicrophone className="text-red-500" />;
      default: return <FaServicestack />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consulting': return 'Consulting';
      case 'audit': return 'Audit sur site';
      case 'accompagnement': return 'Accompagnement';
      case 'formation': return 'Formation';
      case 'podcast': return 'Podcast';
      default: return type;
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'accepte': return 'Acceptée';
      case 'refuse': return 'Refusée';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminée';
      default: return statut;
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-700';
      case 'accepte': return 'bg-green-100 text-green-700';
      case 'refuse': return 'bg-red-100 text-red-700';
      case 'en_cours': return 'bg-blue-100 text-blue-700';
      case 'termine': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Chargement du tableau de bord...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <style>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
        }
        .status-badge.non_lu { background: #FEF3C7; color: #92400E; }
        .status-badge.lu { background: #DBEAFE; color: #1E40AF; }
        .status-badge.repondu { background: #D1FAE5; color: #065F46; }
        .status-badge.valide { background: #D1FAE5; color: #065F46; }
        .status-badge.en-attente { background: #FEF3C7; color: #92400E; }
        .status-badge.inactif { background: #FEE2E2; color: #B91C1C; }
        .message-card, .service-card, .demande-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          border-left: 4px solid #F7B500;
          transition: all 0.2s;
        }
        .message-card:hover, .service-card:hover, .demande-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          border: 1px solid #E5E7EB;
          transition: all 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .expert-card, .startup-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #E5E7EB;
          transition: all 0.2s;
        }
        .expert-card:hover, .startup-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          border-color: #F7B500;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-content {
          background: white;
          border-radius: 24px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px;
        }
        input, select, textarea {
          transition: all 0.2s;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #F7B500;
          box-shadow: 0 0 0 2px rgba(247,181,0,0.2);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Header */}
      <header className="bg-gradient-to-r from-[#0A2540] to-[#1e3a6b] text-white px-6 py-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F7B500] rounded-xl flex items-center justify-center font-serif font-bold text-[#0A2540] text-lg shadow-lg">
              BEH
            </div>
            <div>
              <h1 className="text-xl font-bold">Espace Administrateur</h1>
              <p className="text-xs text-white/60">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { localStorage.clear(); router.push('/'); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Déconnexion
          </button>
        </div>
      </header>

      {/* Navigation par onglets */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-white rounded-xl shadow-sm p-1 flex flex-wrap gap-1">
          {[
            { id: 'services', label: 'Services', icon: <FaServicestack />, count: services.length },
            { id: 'messages', label: 'Messages', icon: <FaEnvelope />, count: stats.total },
            { id: 'experts', label: 'Experts', icon: <FaUserTie />, count: experts.length },
            { id: 'startups', label: 'Startups', icon: <FaBuilding />, count: startups.length },
            { id: 'users', label: 'Utilisateurs', icon: <FaUsers />, count: users.length },
            { id: 'testimonials', label: 'Témoignages', icon: <FaQuoteRight />, count: testimonials.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as Tab); setSearch(""); setFilterStatus("tous"); }}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#F7B500] text-[#0A2540] shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/30 text-[#0A2540]' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F7B500]/50 focus:border-[#F7B500] outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-[#F7B500]/50"
          >
            <option value="tous">Tous les statuts</option>
            {activeTab === 'messages' && (
              <>
                <option value="non_lu">Non lus</option>
                <option value="lu">Lus</option>
                <option value="repondu">Répondus</option>
              </>
            )}
            {(activeTab === 'experts' || activeTab === 'startups') && (
              <>
                <option value="valide">Validés</option>
                <option value="en_attente">En attente</option>
              </>
            )}
            {activeTab === 'services' && (
              <>
                <option value="tous">Tous les services</option>
                <option value="demandes">Demandes clients</option>
              </>
            )}
          </select>
          {activeTab === 'services' && filterStatus !== "demandes" && (
            <button
              onClick={openCreateServiceModal}
              className="px-4 py-2 bg-[#F7B500] text-[#0A2540] rounded-lg font-bold hover:bg-[#e6a800] transition flex items-center gap-2"
            >
              <FaPlus /> Ajouter un service
            </button>
          )}
        </div>
      </div>

      {/* Statistiques Messages */}
      {activeTab === 'messages' && (
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="stat-card">
              <FaEnvelope className="text-2xl text-[#F7B500] mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="stat-card">
              <FaEnvelopeOpen className="text-2xl text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.non_lu}</div>
              <div className="text-sm text-gray-500">Non lus</div>
            </div>
            <div className="stat-card">
              <FaEye className="text-2xl text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.lu}</div>
              <div className="text-sm text-gray-500">Lus</div>
            </div>
            <div className="stat-card">
              <FaReply className="text-2xl text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.repondu}</div>
              <div className="text-sm text-gray-500">Répondus</div>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        {msg.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-semibold ${
            msg.type === 'warning'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {msg.text}
          </div>
        )}

        {/* Onglet Services */}
        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaServicestack className="text-[#F7B500]" /> 
                {filterStatus === "demandes" ? "Demandes des clients" : "Gestion des services"}
              </h2>
            </div>

            {filterStatus === "demandes" ? (
              <div>
                {filteredDemandes.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center text-gray-500">Aucune demande</div>
                ) : (
                  filteredDemandes.map((demande) => (
                    <div key={demande.id} className="demande-card">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatutColor(demande.statut)}`}>
                              {getStatutLabel(demande.statut)}
                            </span>
                            <span className="text-sm text-gray-500">Client ID: {demande.user_id}</span>
                            {demande.service && (
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                Service: {demande.service.nom}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">{demande.message || "Aucun message"}</p>
                          {demande.date_souhaitee && (
                            <p className="text-xs text-gray-400">Date souhaitée: {new Date(demande.date_souhaitee).toLocaleDateString('fr-FR')}</p>
                          )}
                          {demande.reponse_admin && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                              <p className="text-xs font-semibold text-green-700 mb-1">Votre réponse :</p>
                              <p className="text-sm text-gray-600">{demande.reponse_admin}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {demande.statut === 'en_attente' && (
                            <button
                              onClick={() => {
                                setSelectedDemande(demande);
                                setDemandeResponse("");
                                setShowDemandeModal(true);
                              }}
                              className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                            >
                              Traiter
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map(service => (
                  <div key={service.id} className="service-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(service.type)}
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100">
                          {getTypeLabel(service.type)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditServiceModal(service)}
                          className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          title="Modifier"
                        >
                          <FaEdit size={12} />
                        </button>
                        <button
                          onClick={() => deleteService(service.id, service.nom)}
                          className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          title="Supprimer"
                        >
                          <FaTrashAlt size={12} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{service.nom}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{service.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                      {service.duree && <span className="bg-gray-100 px-2 py-1 rounded">⏱️ {service.duree}</span>}
                      {service.prix > 0 && <span className="bg-gray-100 px-2 py-1 rounded">💰 {service.prix} DT</span>}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                      <span className={`text-xs font-semibold ${service.actif ? 'text-green-600' : 'text-red-600'}`}>
                        {service.actif ? 'Actif' : 'Inactif'}
                      </span>
                      <button
                        onClick={() => openEditServiceModal(service)}
                        className="text-[#F7B500] text-sm font-semibold hover:underline flex items-center gap-1"
                      >
                        Modifier <FaArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Onglet Messages */}
        {activeTab === 'messages' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaEnvelope className="text-[#F7B500]" /> Messages de contact
            </h2>
            {filteredMessages.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-500">Aucun message trouvé</div>
            ) : (
              filteredMessages.map((msgItem) => (
                <div key={msgItem.id} className="message-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-bold text-gray-800">{msgItem.prenom} {msgItem.nom}</h3>
                        <span className="text-sm text-gray-500">{msgItem.email}</span>
                        <span className={`status-badge ${msgItem.statut}`}>
                          {msgItem.statut === 'non_lu' && <FaClock size={10} />}
                          {msgItem.statut === 'lu' && <FaEye size={10} />}
                          {msgItem.statut === 'repondu' && <FaReply size={10} />}
                          {msgItem.statut === 'non_lu' ? 'Non lu' : msgItem.statut === 'lu' ? 'Lu' : 'Répondu'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#F7B500] mb-2">{msgItem.sujet}</p>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">{msgItem.message}</p>
                      <p className="text-xs text-gray-400">Reçu le {new Date(msgItem.created_at).toLocaleString('fr-FR')}</p>
                      {msgItem.reponse && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                          <p className="text-xs font-semibold text-green-700 mb-1">Votre réponse :</p>
                          <p className="text-sm text-gray-600">{msgItem.reponse}</p>
                          <p className="text-xs text-gray-400 mt-1">Répondu le {new Date(msgItem.repondu_le).toLocaleString('fr-FR')}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {msgItem.statut === 'non_lu' && (
                        <button onClick={() => marquerCommeLu(msgItem.id)} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm flex items-center gap-1">
                          <FaEye size={12} /> Lu
                        </button>
                      )}
                      <button onClick={() => { setSelectedMessage(msgItem); setReplyText(msgItem.reponse || ""); setShowReplyModal(true); }} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm flex items-center gap-1">
                        <FaReply size={12} /> Répondre
                      </button>
                      <button onClick={() => supprimerMessage(msgItem.id)} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm flex items-center gap-1">
                        <FaTrashAlt size={12} /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Onglet Experts */}
        {activeTab === 'experts' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUserTie className="text-[#F7B500]" /> Gestion des experts
            </h2>
            {filteredExperts.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-500">Aucun expert trouvé</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperts.map(expert => (
                  <div key={expert.id} className="expert-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800">{expert.user?.prenom} {expert.user?.nom}</h3>
                        <p className="text-sm text-gray-500 mt-1">{expert.domaine}</p>
                      </div>
                      <span className={`status-badge ${expert.validation ? 'valide' : 'en-attente'}`}>
                        {expert.validation ? <FaCheckCircle /> : <FaTimesCircle />}
                        {expert.validation ? 'Validé' : 'En attente'}
                      </span>
                    </div>
                    {expert.description && <p className="text-sm text-gray-600 mt-3 line-clamp-2">{expert.description}</p>}
                    <div className="flex gap-2 mt-4">
                      {!expert.validation ? (
                        <>
                          <button onClick={() => validerExpert(expert.id)} className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600">Valider</button>
                          <button onClick={() => refuserExpert(expert.id)} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600">Refuser</button>
                        </>
                      ) : (
                        <button onClick={() => refuserExpert(expert.id)} className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600">Retirer</button>
                      )}
                      <button onClick={() => deleteUser(expert.user?.id, `${expert.user?.prenom} ${expert.user?.nom}`)} className="px-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Onglet Startups */}
        {activeTab === 'startups' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaBuilding className="text-[#F7B500]" /> Gestion des startups
            </h2>
            {filteredStartups.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-500">Aucune startup trouvée</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStartups.map(startup => (
                  <div key={startup.id} className="startup-card">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800">{startup.nomEntreprise || `${startup.user?.prenom} ${startup.user?.nom}`}</h3>
                        <p className="text-sm text-gray-500 mt-1">{startup.secteur}</p>
                      </div>
                      <span className={`status-badge ${startup.valide ? 'valide' : 'en-attente'}`}>
                        {startup.valide ? <FaCheckCircle /> : <FaTimesCircle />}
                        {startup.valide ? 'Validée' : 'En attente'}
                      </span>
                    </div>
                    {startup.description && <p className="text-sm text-gray-600 mt-3 line-clamp-2">{startup.description}</p>}
                    <div className="flex gap-2 mt-4">
                      {!startup.valide ? (
                        <button onClick={() => validerStartup(startup.id)} className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600">Valider</button>
                      ) : (
                        <button onClick={() => validerStartup(startup.id)} className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600">Validée</button>
                      )}
                      <button onClick={() => deleteUser(startup.user?.id, startup.user?.prenom)} className="px-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Onglet Utilisateurs */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(userItem => (
                  <tr key={userItem.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{userItem.prenom} {userItem.nom}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{userItem.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        userItem.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        userItem.role === 'expert' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>{userItem.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${userItem.actif ? 'valide' : 'inactif'}`}>
                        {userItem.actif ? <FaCheckCircle /> : <FaTimesCircle />}
                        {userItem.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => toggleUser(userItem.id, userItem.actif)} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-200">
                          {userItem.actif ? 'Désactiver' : 'Activer'}
                        </button>
                        <button onClick={() => deleteUser(userItem.id, `${userItem.prenom} ${userItem.nom}`)} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200">
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Onglet Témoignages */}
        {activeTab === 'testimonials' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaQuoteRight className="text-[#F7B500]" /> Gestion des témoignages
            </h2>
            {testimonials.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-500">Aucun témoignage</div>
            ) : (
              testimonials.map(t => (
                <div key={t.id} className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-l-[#F7B500] mb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < t.note ? "text-[#F7B500]" : "text-gray-300"} size={14} />
                        ))}
                      </div>
                      <p className="text-gray-700 italic">"{t.texte}"</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="font-semibold text-gray-800">— {t.user?.prenom} {t.user?.nom}</span>
                        <span className={`status-badge ${t.statut === 'valide' ? 'valide' : 'en-attente'}`}>
                          {t.statut === 'valide' ? <FaCheckCircle /> : <FaTimesCircle />}
                          {t.statut === 'valide' ? 'Publié' : 'En attente'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{new Date(t.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {t.statut !== 'valide' && (
                        <button onClick={() => validerTestimonial(t.id)} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                          <FaCheck /> Valider
                        </button>
                      )}
                      <button onClick={() => deleteTestimonial(t.id)} className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                        <FaTrashAlt /> Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal de réponse message */}
      {showReplyModal && selectedMessage && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Répondre à {selectedMessage.prenom} {selectedMessage.nom}</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Message reçu :</p>
              <p className="text-gray-700 font-medium">{selectedMessage.sujet}</p>
              <p className="text-gray-600 mt-2">{selectedMessage.message}</p>
              <p className="text-xs text-gray-400 mt-2">Email du visiteur : <strong>{selectedMessage.email}</strong></p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Votre réponse :</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Écrivez votre réponse ici..."
                className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-[#F7B500] focus:border-[#F7B500] outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Cette réponse sera envoyée par email à {selectedMessage.email}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReplyModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Annuler</button>
              <button onClick={() => repondreMessage(selectedMessage.id, replyText)} disabled={!replyText.trim()} className="px-4 py-2 bg-[#F7B500] text-[#0A2540] rounded-lg font-bold hover:bg-[#e6a800] disabled:opacity-50">Envoyer la réponse par email</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création/modification service */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => { setShowServiceModal(false); resetServiceForm(); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editingService ? 'Modifier le service' : 'Ajouter un service'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de service *</label>
                <select
                  value={serviceForm.type}
                  onChange={(e) => setServiceForm({ ...serviceForm, type: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#F7B500]"
                >
                  <option value="consulting">Consulting</option>
                  <option value="audit">Audit sur site</option>
                  <option value="accompagnement">Accompagnement</option>
                  <option value="formation">Formation</option>
                  <option value="podcast">Podcast</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={serviceForm.nom}
                  onChange={(e) => setServiceForm({ ...serviceForm, nom: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#F7B500]"
                  placeholder="Ex: Consulting Stratégique"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={serviceForm.slug}
                  onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#F7B500]"
                  placeholder="Ex: consulting-strategique"
                />
                <p className="text-xs text-gray-400 mt-1">Utilisé dans l'URL, ex: /services/consulting-strategique</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full p-2 border rounded-lg h-24 focus:ring-2 focus:ring-[#F7B500]"
                  placeholder="Description du service..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                  <input
                    type="text"
                    value={serviceForm.duree}
                    onChange={(e) => setServiceForm({ ...serviceForm, duree: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#F7B500]"
                    placeholder="Ex: 2h, 2 jours"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (DT)</label>
                  <input
                    type="number"
                    value={serviceForm.prix}
                    onChange={(e) => setServiceForm({ ...serviceForm, prix: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#F7B500]"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={serviceForm.couleur}
                    onChange={(e) => setServiceForm({ ...serviceForm, couleur: e.target.value })}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={serviceForm.couleur}
                    onChange={(e) => setServiceForm({ ...serviceForm, couleur: e.target.value })}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-[#F7B500]"
                    placeholder="#F7B500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">🟢 Valeur actuelle : {serviceForm.couleur}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="actif"
                  checked={serviceForm.actif}
                  onChange={(e) => setServiceForm({ ...serviceForm, actif: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="actif" className="text-sm font-medium text-gray-700">Actif (visible sur le site)</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowServiceModal(false); resetServiceForm(); }} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Annuler</button>
              <button
                onClick={() => {
                  if (!serviceForm.nom.trim() || !serviceForm.slug.trim() || !serviceForm.description.trim()) {
                    showMsg("Veuillez remplir tous les champs obligatoires", "warning");
                    return;
                  }
                  if (editingService) {
                    updateService(editingService.id, serviceForm);
                  } else {
                    createService(serviceForm);
                  }
                }}
                disabled={sending}
                className="px-4 py-2 bg-[#F7B500] text-[#0A2540] rounded-lg font-bold hover:bg-[#e6a800] disabled:opacity-50"
              >
                {sending ? 'Envoi...' : (editingService ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de traitement demande */}
      {showDemandeModal && selectedDemande && (
        <div className="modal-overlay" onClick={() => setShowDemandeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Traiter la demande</h2>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">Message du client :</p>
              <p className="text-gray-700">{selectedDemande.message || "Aucun message"}</p>
              <p className="text-xs text-gray-400 mt-2">Client ID: {selectedDemande.user_id}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Votre réponse :</label>
              <textarea
                value={demandeResponse}
                onChange={(e) => setDemandeResponse(e.target.value)}
                placeholder="Écrivez votre réponse..."
                className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-[#F7B500] outline-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDemandeModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Annuler</button>
              <button onClick={() => traiterDemande(selectedDemande.id, "accepte", demandeResponse)} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Accepter</button>
              <button onClick={() => traiterDemande(selectedDemande.id, "refuse", demandeResponse)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Refuser</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}