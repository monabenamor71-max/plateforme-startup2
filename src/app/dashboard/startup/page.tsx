"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaRocket, FaCalendar, FaBook,
  FaPodcast, FaUsers, FaSignOutAlt,
  FaEnvelope, FaUser
} from "react-icons/fa";

export default function DashboardStartup() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '/connexion';
      return;
    }
    setUser(JSON.parse(userData));
  }, []);

  function logout() {
    localStorage.clear();
    window.location.href = '/';
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        .card { background:white; border-radius:16px; padding:24px; box-shadow:0 1px 3px rgba(0,0,0,0.08); border:1px solid #F1F5F9; transition:all .25s; cursor:pointer; }
        .card:hover { box-shadow:0 8px 24px rgba(0,0,0,0.10); transform:translateY(-3px); }
      `}</style>

      {/* HEADER */}
      <header style={{ background:"#0A2540" }} className="px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] bg-[#F7B500] rounded-[8px] flex items-center justify-center text-[#0A2540] font-black text-[15px]">
            BEH
          </div>
          <span className="text-white font-bold text-[16px]">Business Expert Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/70 text-[14px]">
            Bonjour, <strong className="text-white">{user.prenom} {user.nom}</strong>
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-[13px] font-bold cursor-pointer border-none transition-all"
            style={{ background:"rgba(255,255,255,0.1)" }}
          >
            <FaSignOutAlt /> Déconnexion
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-[1100px] mx-auto px-6 py-10">

        {/* Bienvenue */}
        <div
          className="rounded-2xl p-8 mb-8 text-white"
          style={{ background:"linear-gradient(135deg,#0A2540,#1a4080)" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <FaRocket style={{ color:"#F7B500", fontSize:24 }} />
            <h1 className="text-[26px] font-black">Espace Startup</h1>
          </div>
          <p style={{ color:"rgba(255,255,255,0.7)" }} className="text-[15px]">
            Bienvenue <strong>{user.prenom} {user.nom}</strong> ! Trouvez les meilleurs experts pour votre startup.
          </p>
        </div>

        {/* Titre section */}
        <h2 className="text-[18px] font-black text-[#0A2540] mb-5">Que souhaitez-vous faire ?</h2>

        {/* CARDS */}
        <div className="grid grid-cols-1 gap-5" style={{ gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))" }}>

          {/* Rendez-vous */}
          <Link href="/dashboard/startup/rendez-vous" className="no-underline">
            <div className="card">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background:"#EFF6FF" }}>
                <FaCalendar style={{ color:"#3B82F6", fontSize:20 }} />
              </div>
              <h3 className="text-[16px] font-black text-[#0A2540] mb-1">Rendez-vous</h3>
              <p className="text-[13px]" style={{ color:"#94A3B8" }}>Réservez une session avec un expert</p>
            </div>
          </Link>

          {/* Formations */}
          <Link href="/dashboard/startup/formations" className="no-underline">
            <div className="card">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background:"#F0FDF4" }}>
                <FaBook style={{ color:"#22C55E", fontSize:20 }} />
              </div>
              <h3 className="text-[16px] font-black text-[#0A2540] mb-1">Formations</h3>
              <p className="text-[13px]" style={{ color:"#94A3B8" }}>Accédez aux vidéos et programmes PDF</p>
            </div>
          </Link>

          {/* Podcasts */}
          <Link href="/dashboard/startup/podcasts" className="no-underline">
            <div className="card">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background:"#FFF7ED" }}>
                <FaPodcast style={{ color:"#F97316", fontSize:20 }} />
              </div>
              <h3 className="text-[16px] font-black text-[#0A2540] mb-1">Podcasts</h3>
              <p className="text-[13px]" style={{ color:"#94A3B8" }}>Écoutez nos podcasts exclusifs</p>
            </div>
          </Link>

          {/* Trouver Expert */}
          <Link href="/experts" className="no-underline">
            <div className="card">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background:"#FDF4FF" }}>
                <FaUsers style={{ color:"#A855F7", fontSize:20 }} />
              </div>
              <h3 className="text-[16px] font-black text-[#0A2540] mb-1">Trouver un Expert</h3>
              <p className="text-[13px]" style={{ color:"#94A3B8" }}>Parcourez notre liste d&apos;experts</p>
            </div>
          </Link>

          {/* Messages */}
          <Link href="/dashboard/startup/messages" className="no-underline">
            <div className="card">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background:"#FFF1F2" }}>
                <FaEnvelope style={{ color:"#F43F5E", fontSize:20 }} />
              </div>
              <h3 className="text-[16px] font-black text-[#0A2540] mb-1">Messages</h3>
              <p className="text-[13px]" style={{ color:"#94A3B8" }}>Contactez vos experts</p>
            </div>
          </Link>

          {/* Mon Profil */}
          <Link href="/dashboard/startup/profil" className="no-underline">
            <div className="card">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background:"#F0F9FF" }}>
                <FaUser style={{ color:"#0EA5E9", fontSize:20 }} />
              </div>
              <h3 className="text-[16px] font-black text-[#0A2540] mb-1">Mon Profil</h3>
              <p className="text-[13px]" style={{ color:"#94A3B8" }}>Gérez vos informations</p>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}