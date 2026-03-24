"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaArrowLeft, FaGraduationCap, FaUserTie, FaCalendarAlt,
  FaClock, FaMapMarkerAlt, FaLaptop, FaBuilding, FaChalkboardTeacher,
  FaTicketAlt, FaCheckCircle, FaDownload, FaPlayCircle,
  FaShareAlt, FaCalendarPlus, FaInfoCircle,
} from "react-icons/fa";

// Les données des formations (copiées depuis formations/page.tsx)
const PROGRAMMES = [
  { 
    id:1, cat:"Gratuit", title:"Introduction au No-Code", duree:"2h", niveau:"Débutant", certif:false, gratuit:true,
    description:"Découvrez les bases du développement sans code pour créer des applications rapidement.",
    date:"15 Avril 2026", heure:"14h00 - 16h00", format:"En ligne", formateur:"Karim Ben Ali",
    image:"/formations/nocode.jpg", placesLimit: true,
    contenu:[
      "Introduction au No-Code et ses avantages",
      "Présentation des principales plateformes No-Code (Bubble, Airtable, Webflow)",
      "Création d'une application simple sans code",
      "Bonnes pratiques et limites du No-Code"
    ],
    objectifs:[
      "Comprendre ce qu'est le No-Code et son impact sur le développement",
      "Identifier les outils No-Code adaptés à vos besoins",
      "Créer une application fonctionnelle sans écrire une ligne de code",
      "Savoir quand utiliser ou ne pas utiliser le No-Code"
    ],
    prerequis:"Aucun prérequis technique nécessaire",
    lienZoom:"https://zoom.us/j/123456789",
    supportUrl:"/formations/supports/nocode-intro.pdf"
  },
  { 
    id:2, cat:"Gratuit", title:"Fondamentaux du Lean Startup", duree:"3h", niveau:"Débutant", certif:false, gratuit:true,
    description:"Apprenez les principes du Lean Startup pour valider vos idées rapidement.",
    date:"22 Avril 2026", heure:"10h00 - 13h00", format:"En ligne", formateur:"Sofia Mansouri",
    image:"/formations/lean-startup.jpg", placesLimit: true,
    contenu:[
      "Les 3 piliers du Lean Startup (Build-Measure-Learn)",
      "Comment valider une idée avant de développer un produit",
      "MVP : définition et stratégies de création",
      "Analyser les feedbacks et pivoter"
    ],
    objectifs:[
      "Maîtriser la méthodologie Lean Startup",
      "Savoir créer un MVP efficace",
      "Apprendre à analyser les retours utilisateurs",
      "Comprendre quand et comment pivoter"
    ],
    prerequis:"Aucun prérequis, ouvert à tous",
    lienZoom:"https://zoom.us/j/987654321",
    supportUrl:"/formations/supports/lean-startup.pdf"
  },
  { 
    id:3, cat:"Management", title:"Leadership & Management d'équipe", duree:"2 jours", niveau:"Tous niveaux", certif:true, gratuit:false,
    description:"Développez vos compétences en leadership et management d'équipe.",
    date:"5-6 Mai 2026", heure:"09h00 - 17h00", format:"Présentiel", formateur:"Dr. Mohamed Ben Salem",
    lieu:"Tunis - Centre Urbain Nord", image:"/formations/leadership.jpg", placesLimit: true,
    contenu:[
      "Les fondamentaux du leadership",
      "Communication et intelligence émotionnelle",
      "Gestion des conflits et prise de décision",
      "Motivation et engagement des équipes",
      "Leadership situationnel et agile"
    ],
    objectifs:[
      "Développer une vision stratégique de leadership",
      "Maîtriser les techniques de communication d'équipe",
      "Savoir gérer les conflits et situations difficiles",
      "Créer une culture d'entreprise performante"
    ],
    prerequis:"Expérience en management d'équipe souhaitée",
    supportUrl:"/formations/supports/leadership.pdf"
  },
  { 
    id:4, cat:"Finance", title:"Finance pour non-financiers", duree:"1 jour", niveau:"Débutant", certif:true, gratuit:false,
    description:"Maîtrisez les bases de la finance pour piloter votre entreprise.",
    date:"12 Mai 2026", heure:"09h00 - 17h00", format:"Présentiel", formateur:"Nadia Kacem",
    lieu:"Sfax - Technopole", image:"/formations/finance.jpg", placesLimit: true,
    contenu:[
      "Les états financiers : bilan, compte de résultat",
      "Analyse de la rentabilité et des coûts",
      "Le besoin en fonds de roulement (BFR)",
      "Prévisionnels et tableaux de bord"
    ],
    objectifs:[
      "Lire et interpréter les documents financiers",
      "Analyser la santé financière de son entreprise",
      "Construire des prévisions financières",
      "Piloter la performance avec des indicateurs clés"
    ],
    prerequis:"Aucune connaissance financière préalable",
    supportUrl:"/formations/supports/finance.pdf"
  },
  { 
    id:5, cat:"Stratégie", title:"Business Model & Stratégie d'entreprise", duree:"3 jours", niveau:"Intermédiaire", certif:true, gratuit:false,
    description:"Construisez un business model solide et une stratégie gagnante.",
    date:"19-21 Mai 2026", heure:"09h00 - 17h00", format:"Hybride", formateur:"Karim Ben Hassen",
    lieu:"En ligne / Tunis", image:"/formations/strategie.jpg", placesLimit: true,
    contenu:[
      "Analyse stratégique et diagnostic",
      "Modèles économiques innovants",
      "Plan d'action stratégique",
      "Mesure de la performance stratégique"
    ],
    objectifs:[
      "Maîtriser les outils d'analyse stratégique",
      "Concevoir un business model innovant",
      "Élaborer un plan stratégique opérationnel",
      "Piloter la mise en œuvre de la stratégie"
    ],
    prerequis:"Connaissances de base en gestion d'entreprise",
    supportUrl:"/formations/supports/strategie.pdf"
  },
  { 
    id:6, cat:"Commercial", title:"Techniques de vente & négociation", duree:"2 jours", niveau:"Tous niveaux", certif:false, gratuit:false,
    description:"Améliorez vos techniques de vente et de négociation.",
    date:"2-3 Juin 2026", heure:"09h00 - 17h00", format:"Présentiel", formateur:"Amel Ben Amor",
    lieu:"Tunis - Lac", image:"/formations/commercial.jpg", placesLimit: true,
    contenu:[
      "Les étapes clés du processus de vente",
      "Techniques de découverte des besoins",
      "Gestion des objections",
      "Négociation et conclusion de la vente"
    ],
    objectifs:[
      "Maîtriser les techniques de vente avancées",
      "Apprendre à gérer efficacement les objections",
      "Développer des stratégies de négociation gagnantes",
      "Améliorer son taux de transformation"
    ],
    prerequis:"Expérience commerciale souhaitée",
    supportUrl:"/formations/supports/commercial.pdf"
  },
  { 
    id:7, cat:"Digital", title:"Marketing Digital & Growth Hacking", duree:"2 jours", niveau:"Intermédiaire", certif:true, gratuit:false,
    description:"Maîtrisez les stratégies de marketing digital et growth hacking.",
    date:"9-10 Juin 2026", heure:"14h00 - 18h00", format:"En ligne", formateur:"Youssef Tazi",
    lieu:"En ligne (Zoom)", image:"/formations/digital.jpg", placesLimit: true,
    contenu:[
      "Stratégie de contenu et SEO",
      "Réseaux sociaux et publicité digitale",
      "Email marketing et automation",
      "Growth hacking et acquisition"
    ],
    objectifs:[
      "Élaborer une stratégie marketing digital complète",
      "Maîtriser les leviers d'acquisition",
      "Utiliser les outils de growth hacking",
      "Optimiser le ROI des campagnes digitales"
    ],
    prerequis:"Bases du marketing digital",
    lienZoom:"https://zoom.us/j/555666777",
    supportUrl:"/formations/supports/digital.pdf"
  },
  { 
    id:8, cat:"RH", title:"Recrutement & Marque employeur", duree:"1 jour", niveau:"Tous niveaux", certif:false, gratuit:false,
    description:"Attirez et recrutez les meilleurs talents pour votre entreprise.",
    date:"16 Juin 2026", heure:"09h00 - 17h00", format:"Présentiel", formateur:"Leila Ben Ahmed",
    lieu:"Tunis - Centre Urbain", image:"/formations/rh.jpg", placesLimit: true,
    contenu:[
      "Stratégie de marque employeur",
      "Sourcing et attractivité des talents",
      "Processus de recrutement et évaluation",
      "Onboarding et fidélisation"
    ],
    objectifs:[
      "Construire une marque employeur forte",
      "Optimiser les processus de recrutement",
      "Attirer et recruter les meilleurs talents",
      "Fidéliser les collaborateurs"
    ],
    prerequis:"Expérience en gestion des ressources humaines",
    supportUrl:"/formations/supports/rh.pdf"
  },
];

export default function FormationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [formation, setFormation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"contenu" | "objectifs">("contenu");

  useEffect(() => {
    const id = parseInt(params.id as string);
    const found = PROGRAMMES.find(p => p.id === id);
    if (found) {
      setFormation(found);
    }
    setLoading(false);
  }, [params.id]);

  const getFormatIcon = () => {
    if (formation?.format === "En ligne") return <FaLaptop className="inline mr-2" size={16} />;
    if (formation?.format === "Présentiel") return <FaBuilding className="inline mr-2" size={16} />;
    return <FaChalkboardTeacher className="inline mr-2" size={16} />;
  };

  const addToCalendar = () => {
    const startDate = formation.date.split(" ")[0];
    const startTime = formation.heure.split(" - ")[0];
    const endTime = formation.heure.split(" - ")[1];
    const title = encodeURIComponent(formation.title);
    const details = encodeURIComponent(formation.description);
    const location = encodeURIComponent(formation.lieu || formation.format);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}T${startTime.replace(":", "")}/${startDate}T${endTime.replace(":", "")}&details=${details}&location=${location}`;
    window.open(url, "_blank");
  };

  const shareFormation = () => {
    if (navigator.share) {
      navigator.share({
        title: formation.title,
        text: formation.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Lien copié dans le presse-papiers !");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#F7B500] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement de la formation...</p>
        </div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Formation non trouvée</h2>
          <p className="text-gray-500 mb-6">La formation que vous recherchez n'existe pas.</p>
          <Link href="/formations" className="inline-flex items-center gap-2 bg-[#F7B500] text-[#0A2540] px-6 py-3 rounded-xl font-bold">
            <FaArrowLeft size={14} /> Retour aux formations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="36" height="36" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="12" fill="#0A2540"/>
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900">BEH</text>
            </svg>
            <span className="font-bold text-[#0A2540]">Business <span className="text-[#F7B500]">Expert</span> Hub</span>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={shareFormation} className="text-gray-500 hover:text-[#F7B500] transition" title="Partager">
              <FaShareAlt size={18} />
            </button>
            <Link href="/formations" className="text-gray-600 hover:text-[#F7B500] transition flex items-center gap-1">
              <FaArrowLeft size={14} /> Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <div className="relative h-80 overflow-hidden">
        <Image
          src={formation.image}
          alt={formation.title}
          fill
          style={{ objectFit: "cover" }}
          className="brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                formation.gratuit ? "bg-green-500" : "bg-[#F7B500] text-[#0A2540]"
              }`}>
                {formation.gratuit ? "🎁 GRATUIT" : "💰 PAYANT"}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold">
                {formation.cat}
              </span>
              {formation.certif && !formation.gratuit && (
                <span className="px-3 py-1 rounded-full bg-[#F7B500] text-[#0A2540] text-xs font-bold">
                  🏅 Certifiant
                </span>
              )}
              {formation.placesLimit && !formation.gratuit && (
                <span className="px-3 py-1 rounded-full bg-orange-500/80 text-white text-xs font-bold">
                  🎫 Places limitées
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{formation.title}</h1>
            <p className="text-white/80 max-w-2xl text-lg">{formation.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab("contenu")}
                className={`pb-3 px-2 font-semibold transition ${
                  activeTab === "contenu"
                    ? "text-[#F7B500] border-b-2 border-[#F7B500]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                📚 Programme détaillé
              </button>
              <button
                onClick={() => setActiveTab("objectifs")}
                className={`pb-3 px-2 font-semibold transition ${
                  activeTab === "objectifs"
                    ? "text-[#F7B500] border-b-2 border-[#F7B500]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                🎯 Objectifs pédagogiques
              </button>
            </div>

            {/* Contenu */}
            {activeTab === "contenu" && (
              <div className="space-y-3">
                {formation.contenu?.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-[#F7B500]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#F7B500] text-sm font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Objectifs */}
            {activeTab === "objectifs" && (
              <div className="space-y-3">
                {formation.objectifs?.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <FaCheckCircle className="text-[#22C55E] flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Prérequis */}
            <div className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                <FaInfoCircle size={16} /> Prérequis
              </h3>
              <p className="text-blue-700">{formation.prerequis}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="font-bold text-lg text-gray-800 mb-4 pb-3 border-b border-gray-100">
                Informations pratiques
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-[#F7B500]/10 flex items-center justify-center">
                    <FaCalendarAlt className="text-[#F7B500]" size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="text-sm font-medium">{formation.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-[#F7B500]/10 flex items-center justify-center">
                    <FaClock className="text-[#F7B500]" size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Horaire</p>
                    <p className="text-sm font-medium">{formation.heure}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-[#F7B500]/10 flex items-center justify-center">
                    {getFormatIcon()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Format</p>
                    <p className="text-sm font-medium">{formation.format}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-[#F7B500]/10 flex items-center justify-center">
                    <FaUserTie className="text-[#F7B500]" size={14} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Formateur</p>
                    <p className="text-sm font-medium">{formation.formateur}</p>
                  </div>
                </div>
                {formation.lieu && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-[#F7B500]/10 flex items-center justify-center">
                      <FaMapMarkerAlt className="text-[#F7B500]" size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Lieu</p>
                      <p className="text-sm font-medium">{formation.lieu}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 text-sm">⏱️ Durée</span>
                  <span className="font-semibold text-gray-800">{formation.duree}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">🎯 Niveau</span>
                  <span className="font-semibold text-gray-800">{formation.niveau}</span>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                {formation.format === "En ligne" && formation.lienZoom && (
                  <a
                    href={formation.lienZoom}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#F7B500] text-[#0A2540] py-3 rounded-xl font-bold hover:bg-[#e6a800] transition"
                  >
                    <FaPlayCircle size={16} /> Rejoindre la session
                  </a>
                )}
                
                {formation.supportUrl && (
                  <a
                    href={formation.supportUrl}
                    download
                    className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                  >
                    <FaDownload size={14} /> Télécharger le support
                  </a>
                )}

                <button
                  onClick={addToCalendar}
                  className="flex items-center justify-center gap-2 w-full border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:border-[#F7B500] hover:text-[#F7B500] transition"
                >
                  <FaCalendarPlus size={14} /> Ajouter au calendrier
                </button>
              </div>

              {/* Message pour les formations gratuites */}
              {formation.gratuit && (
                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <FaCheckCircle size={16} />
                    <span className="text-sm font-semibold">Formation gratuite</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Accès immédiat sans inscription. Cliquez sur "Rejoindre la session" pour participer.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0A2540] text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-white/60">© 2026 Business Expert Hub - Plateforme de formation pour startups</p>
        </div>
      </footer>
    </div>
  );
}