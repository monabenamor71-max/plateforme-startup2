"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FaChartLine, FaArrowRight, FaArrowLeft, FaCheck,
  FaSearchPlus, FaGraduationCap,
  FaDesktop, FaGift,
  FaCheckCircle, FaExclamationTriangle,
} from "react-icons/fa";

const NAV = [
  { label: "Consulting", slug: "consulting" },
  { label: "Audit sur site", slug: "audit-sur-site" },
  { label: "Nos Plateformes", slug: "nos-plateformes" },
  { label: "Formations", slug: "formations" },
];

const CODE_LINES = [
  { ln: "01", parts: [{ t: "cm", v: "// BEH Platform — Tableau de bord" }] },
  { ln: "02", parts: [{ t: "kw", v: "import" }, { t: "op", v: " { " }, { t: "nm", v: "Dashboard" }, { t: "op", v: ", " }, { t: "nm", v: "KpiTracker" }, { t: "op", v: " } " }, { t: "kw", v: "from" }, { t: "str", v: " '@beh/platform'" }, { t: "op", v: ";" }] },
  { ln: "03", parts: [{ t: "kw", v: "import" }, { t: "op", v: " { " }, { t: "nm", v: "ClientArchive" }, { t: "op", v: " } " }, { t: "kw", v: "from" }, { t: "str", v: " '@beh/data'" }, { t: "op", v: ";" }] },
  { ln: "04", parts: [] },
  { ln: "05", parts: [{ t: "kw", v: "const" }, { t: "op", v: " " }, { t: "nm", v: "app" }, { t: "op", v: " = " }, { t: "kw", v: "new" }, { t: "op", v: " " }, { t: "fn", v: "Dashboard" }, { t: "op", v: "({" }] },
  { ln: "06", parts: [{ t: "op", v: "  " }, { t: "nm", v: "workspace" }, { t: "op", v: ": " }, { t: "str", v: "'votre-entreprise'" }, { t: "op", v: "," }] },
  { ln: "07", parts: [{ t: "op", v: "  " }, { t: "nm", v: "modules" }, { t: "op", v: ": [" }, { t: "str", v: "'clients'" }, { t: "op", v: ", " }, { t: "str", v: "'kpi'" }, { t: "op", v: ", " }, { t: "str", v: "'rapports'" }, { t: "op", v: "]" }] },
  { ln: "08", parts: [{ t: "op", v: "});" }] },
  { ln: "09", parts: [] },
  { ln: "10", parts: [{ t: "cm", v: "// Archivage automatique base clients" }] },
  { ln: "11", parts: [{ t: "kw", v: "const" }, { t: "op", v: " " }, { t: "nm", v: "archive" }, { t: "op", v: " = " }, { t: "kw", v: "await" }, { t: "op", v: " " }, { t: "fn", v: "ClientArchive" }, { t: "op", v: "." }, { t: "fn", v: "sync" }, { t: "op", v: "({" }] },
  { ln: "12", parts: [{ t: "op", v: "  " }, { t: "nm", v: "auto" }, { t: "op", v: ": " }, { t: "kw", v: "true" }, { t: "op", v: "," }] },
  { ln: "13", parts: [{ t: "op", v: "  " }, { t: "nm", v: "interval" }, { t: "op", v: ": " }, { t: "str", v: "'24h'" }] },
  { ln: "14", parts: [{ t: "op", v: "});" }] },
  { ln: "15", parts: [] },
  { ln: "16", parts: [{ t: "cm", v: "// Suivi KPI temps réel" }] },
  { ln: "17", parts: [{ t: "nm", v: "app" }, { t: "op", v: "." }, { t: "fn", v: "onKpiUpdate" }, { t: "op", v: "((data) => {" }] },
  { ln: "18", parts: [{ t: "op", v: "  " }, { t: "fn", v: "console" }, { t: "op", v: "." }, { t: "fn", v: "log" }, { t: "op", v: "(" }, { t: "str", v: "`KPI:`" }, { t: "op", v: ", data);" }] },
  { ln: "19", parts: [{ t: "op", v: "  " }, { t: "nm", v: "dashboard" }, { t: "op", v: "." }, { t: "fn", v: "refresh" }, { t: "op", v: "();" }] },
  { ln: "20", parts: [{ t: "op", v: "});" }] },
];

const COLOR_MAP: Record<string, string> = {
  kw: "#C678DD", fn: "#61AFEF", str: "#98C379",
  cm: "#5C6370", nm: "#E5C07B", op: "#ABB2BF",
};

// ─── SVG Screens (inchangées) ────────────────────────────────────────────────
// (Toutes les fonctions ScreenERPMain, ScreenERPList, ScreenERPStats, ScreenCRMMain, etc.)
// Elles sont identiques à celles fournies précédemment. Je les réinclus ici pour la complétude,
// mais dans l'éditeur final, elles seront présentes. Par souci de lisibilité, je les ai condensées.
// En pratique, vous gardez exactement les mêmes définitions que dans votre code original.

function ScreenERPMain() {
  return (
    <svg viewBox="0 0 480 300" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="480" height="300" fill="#F8FAFC" />
      <rect width="480" height="40" fill="#0A2540" />
      <rect x="10" y="12" width="50" height="16" rx="3" fill="#F7B500" opacity="0.9" />
      <text x="35" y="23" textAnchor="middle" fill="#0A2540" fontSize="7" fontWeight="900">BEH ERP</text>
      <text x="85" y="24" fill="rgba(255,255,255,0.5)" fontSize="8">Dashboard</text>
      <text x="145" y="24" fill="rgba(255,255,255,0.5)" fontSize="8">Ventes</text>
      <text x="195" y="24" fill="rgba(255,255,255,0.5)" fontSize="8">Stock</text>
      <text x="240" y="24" fill="rgba(255,255,255,0.5)" fontSize="8">RH</text>
      <text x="280" y="24" fill="rgba(255,255,255,0.5)" fontSize="8">Comptabilité</text>
      <rect x="400" y="10" width="68" height="20" rx="4" fill="#F7B500" />
      <text x="434" y="23" textAnchor="middle" fill="#0A2540" fontSize="8" fontWeight="700">+ Nouveau</text>
      <rect x="0" y="40" width="110" height="260" fill="#F1F5F9" />
      <text x="14" y="62" fill="#64748B" fontSize="7" fontWeight="700">MENU</text>
      {[["🏠", "Accueil"], ["📊", "Rapports"], ["👥", "Clients"], ["📦", "Stocks"], ["💰", "Facturation"], ["⚙️", "Paramètres"]].map(([ic, lb], i) => (
        <g key={i}>
          <rect x="6" y={72 + i * 32} width="98" height="24" rx="5" fill={i === 0 ? "#0A2540" : "transparent"} />
          <text x="18" y={88 + i * 32} fill={i === 0 ? "#F7B500" : "#64748B"} fontSize="8">{ic} {lb}</text>
        </g>
      ))}
      {[["Chiffre d'affaires", "124 500 TND", "+12%", "#10B981"], ["Marge brute", "48 200 TND", "+8%", "#3B82F6"], ["Commandes", "342", "+24%", "#F7B500"], ["Clients actifs", "247", "+5%", "#8B5CF6"]].map(([n, v, g, c], i) => (
        <g key={i}>
          <rect x={118 + (i % 2) * 170} y={50 + Math.floor(i / 2) * 80} width="158" height="68" rx="8" fill="#fff" stroke="#E2E8F0" strokeWidth="1" />
          <text x={130 + (i % 2) * 170} y={72 + Math.floor(i / 2) * 80} fill="#64748B" fontSize="7">{n}</text>
          <text x={130 + (i % 2) * 170} y={90 + Math.floor(i / 2) * 80} fill="#0A2540" fontSize="13" fontWeight="900">{v}</text>
          <rect x={240 + (i % 2) * 170} y={56 + Math.floor(i / 2) * 80} width="28" height="14" rx="7" fill={`${c}22`} />
          <text x={254 + (i % 2) * 170} y={66 + Math.floor(i / 2) * 80} textAnchor="middle" fill={c as string} fontSize="7" fontWeight="700">{g}</text>
        </g>
      ))}
      <rect x="118" y="216" width="352" height="72" rx="8" fill="#fff" stroke="#E2E8F0" strokeWidth="1" />
      <text x="130" y="232" fill="#64748B" fontSize="7">Évolution chiffre d'affaires — 6 derniers mois</text>
      {[35, 55, 45, 70, 60, 85].map((h, i) => (
        <g key={i}>
          <rect x={138 + i * 42} y={285 - h} width="28" height={h} rx="3" fill="#F7B500" opacity="0.7" />
          <text x={152 + i * 42} y="293" textAnchor="middle" fill="#94A3B8" fontSize="5.5">{["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"][i]}</text>
        </g>
      ))}
    </svg>
  );
}

function ScreenERPList() {
  return (
    <svg viewBox="0 0 380 240" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="380" height="240" fill="#fff" />
      <rect width="380" height="36" fill="#F8FAFC" />
      <rect x="10" y="9" width="60" height="18" rx="3" fill="#F7B500" opacity="0.12" />
      <text x="40" y="21" textAnchor="middle" fill="#F7B500" fontSize="7" fontWeight="700">Fournisseurs</text>
      <text x="180" y="22" textAnchor="middle" fill="#0A2540" fontSize="8" fontWeight="700">Liste des produits</text>
      <rect x="290" y="8" width="80" height="20" rx="5" fill="#0A2540" />
      <text x="330" y="21" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700">+ Ajouter produit</text>
      <rect x="10" y="44" width="360" height="24" rx="4" fill="#F1F5F9" />
      <text x="20" y="60" fill="#94A3B8" fontSize="7">Référence</text>
      <text x="100" y="60" fill="#94A3B8" fontSize="7">Désignation</text>
      <text x="220" y="60" fill="#94A3B8" fontSize="7">Qté stock</text>
      <text x="290" y="60" fill="#94A3B8" fontSize="7">Prix HT</text>
      <text x="340" y="60" fill="#94A3B8" fontSize="7">Statut</text>
      {[["PRD-001", "Tableau de bord digital", "12 unités", "2 400 TND", "Actif", "#10B981"],
        ["PRD-002", "Module CRM Pro", "8 licences", "1 800 TND", "Actif", "#10B981"],
        ["PRD-003", "Pack Formation", "25 places", "950 TND", "Limité", "#F7B500"],
        ["PRD-004", "Audit sur site", "—", "3 500 TND", "Sur devis", "#3B82F6"],
        ["PRD-005", "ERP Complet", "5 licences", "8 200 TND", "Actif", "#10B981"]].map(([ref, name, qty, price, st, c], i) => (
        <g key={i}>
          <rect x="10" y={74 + i * 28} width="360" height="24" rx="3" fill={i % 2 === 0 ? "#F8FAFC" : "#fff"} />
          <text x="20" y={90 + i * 28} fill="#64748B" fontSize="7">{ref}</text>
          <text x="100" y={90 + i * 28} fill="#0A2540" fontSize="7" fontWeight="500">{name}</text>
          <text x="220" y={90 + i * 28} fill="#64748B" fontSize="7">{qty}</text>
          <text x="290" y={90 + i * 28} fill="#0A2540" fontSize="7" fontWeight="600">{price}</text>
          <rect x="335" y={78 + i * 28} width="32" height="13" rx="6" fill={`${c}18`} />
          <text x="351" y={88 + i * 28} textAnchor="middle" fill={c as string} fontSize="6" fontWeight="700">{st}</text>
        </g>
      ))}
    </svg>
  );
}

function ScreenERPStats() {
  return (
    <svg viewBox="0 0 340 210" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="340" height="210" fill="#fff" />
      <rect width="340" height="36" fill="#0A2540" />
      <text x="16" y="22" fill="#fff" fontSize="9" fontWeight="700">Statistiques mensuelles</text>
      <text x="280" y="22" fill="#F7B500" fontSize="7">Juin 2026 ▾</text>
      <rect x="10" y="46" width="150" height="120" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5" />
      <text x="85" y="64" textAnchor="middle" fill="#64748B" fontSize="7">Répartition services</text>
      <circle cx="85" cy="110" r="36" fill="none" stroke="#F7B500" strokeWidth="18" strokeDasharray="75 150" strokeDashoffset="0" />
      <circle cx="85" cy="110" r="36" fill="none" stroke="#3B82F6" strokeWidth="18" strokeDasharray="50 150" strokeDashoffset="-75" />
      <circle cx="85" cy="110" r="36" fill="none" stroke="#10B981" strokeWidth="18" strokeDasharray="25 150" strokeDashoffset="-125" />
      <text x="85" y="114" textAnchor="middle" fill="#0A2540" fontSize="9" fontWeight="900">100%</text>
      {[["#F7B500", "ERP", "50%"], ["#3B82F6", "CRM", "33%"], ["#10B981", "Projets", "17%"]].map(([c, l, p], i) => (
        <g key={i}>
          <rect x="15" y={157 + i * 14} width="8" height="8" rx="2" fill={c as string} />
          <text x="27" y={164 + i * 14} fill="#64748B" fontSize="6.5">{l} — {p}</text>
        </g>
      ))}
      <rect x="170" y="46" width="160" height="120" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5" />
      <text x="250" y="64" textAnchor="middle" fill="#64748B" fontSize="7">Top indicateurs</text>
      {[["Taux satisfaction", "94%", "#F7B500"], ["Croissance MoM", "+12%", "#10B981"], ["NPS Score", "72", "#3B82F6"], ["Support résolu", "98%", "#8B5CF6"]].map(([l, v, c], i) => (
        <g key={i}>
          <rect x="178" y={72 + i * 24} width="144" height="18" rx="4" fill={i % 2 === 0 ? "#fff" : "#F1F5F9"} />
          <text x="186" y={84 + i * 24} fill="#64748B" fontSize="6.5">{l}</text>
          <text x="310" y={84 + i * 24} textAnchor="end" fill={c as string} fontSize="8" fontWeight="900">{v}</text>
        </g>
      ))}
      <rect x="10" y="172" width="320" height="28" rx="6" fill="#F1F5F9" />
      <text x="20" y="190" fill="#94A3B8" fontSize="6.5">Meilleur service :</text>
      {["ERP", "Projets", "Formation", "CRM"].map((s, i) => (
        <rect key={i} x={105 + i * 55} y="177" width="48" height="18" rx="9" fill={i === 3 ? "#F7B500" : "transparent"} stroke={i === 3 ? "none" : "#D1D5DB"} strokeWidth="0.5" />
      ))}
      {["ERP", "Projets", "Formation", "Meilleur service CRM"].map((s, i) => (
        <text key={i} x={129 + i * 55} y="189" textAnchor="middle" fill={i === 3 ? "#0A2540" : "#9CA3AF"} fontSize="6" fontWeight={i === 3 ? "700" : "400"}>{["ERP", "Projets", "Formation", "CRM"][i]}</text>
      ))}
    </svg>
  );
}

function ScreenCRMMain() {
  return (
    <svg viewBox="0 0 480 300" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="480" height="300" fill="#F8FAFC" />
      <rect width="480" height="40" fill="#0A2540" />
      <rect x="10" y="12" width="50" height="16" rx="3" fill="#F7B500" opacity="0.9" />
      <text x="35" y="23" textAnchor="middle" fill="#0A2540" fontSize="7" fontWeight="900">BEH CRM</text>
      {["Dashboard", "Clients", "Pipeline", "Objectifs", "Rapports"].map((t, i) => (
        <text key={i} x={85 + i * 65} y="24" fill={i === 0 ? "#F7B500" : "rgba(255,255,255,0.5)"} fontSize="8" fontWeight={i === 0 ? "700" : "400"}>{t}</text>
      ))}
      <rect x="400" y="10" width="68" height="20" rx="4" fill="#F7B500" />
      <text x="434" y="23" textAnchor="middle" fill="#0A2540" fontSize="8" fontWeight="700">+ Client</text>
      <rect x="0" y="40" width="100" height="260" fill="#F1F5F9" />
      {[["📊", "Dashboard"], ["👥", "Clients"], ["🎯", "Objectifs"], ["📋", "Séances"], ["📈", "Rapports"]].map(([ic, lb], i) => (
        <g key={i}>
          <rect x="6" y={52 + i * 34} width="88" height="26" rx="5" fill={i === 0 ? "#0A2540" : "transparent"} />
          <text x="18" y={69 + i * 34} fill={i === 0 ? "#F7B500" : "#64748B"} fontSize="8">{ic} {lb}</text>
        </g>
      ))}
      {[["247", "Clients actifs", "#F7B500"], ["38", "Séances/mois", "#3B82F6"], ["94%", "Satisfaction", "#10B981"], ["12k", "CA mensuel", "#8B5CF6"]].map(([v, l, c], i) => (
        <g key={i}>
          <rect x={108 + i * 90} y="50" width="82" height="58" rx="7" fill="#fff" stroke="#E2E8F0" strokeWidth="1" />
          <text x={149 + i * 90} y="70" textAnchor="middle" fill={c as string} fontSize="16" fontWeight="900">{v}</text>
          <text x={149 + i * 90} y="84" textAnchor="middle" fill="#94A3B8" fontSize="6">{l}</text>
        </g>
      ))}
      <rect x="108" y="118" width="362" height="28" rx="4" fill="#F1F5F9" />
      <text x="120" y="136" fill="#94A3B8" fontSize="7">Client</text>
      <text x="220" y="136" fill="#94A3B8" fontSize="7">Service</text>
      <text x="300" y="136" fill="#94A3B8" fontSize="7">Objectif</text>
      <text x="380" y="136" fill="#94A3B8" fontSize="7">Statut</text>
      <text x="440" y="136" fill="#94A3B8" fontSize="7">Score</text>
      {[["Sophie Martin", "Coaching", "Leadership", "Actif", "94%", "#10B981"],
        ["Marc Dubois", "Consulting", "Organisation", "En cours", "72%", "#F7B500"],
        ["Leila Ben Ali", "Formation", "Management", "Actif", "88%", "#10B981"],
        ["Jean-Paul Roy", "Audit", "Conformité", "Clôturé", "100%", "#3B82F6"]].map(([n, s, o, st, sc, c], i) => (
        <g key={i}>
          <rect x="108" y={150 + i * 32} width="362" height="26" rx="3" fill={i % 2 === 0 ? "#fff" : "#F8FAFC"} />
          <circle cx="124" cy={163 + i * 32} r="8" fill={`${c}20`} />
          <text x="124" y={166 + i * 32} textAnchor="middle" fill={c as string} fontSize="6" fontWeight="700">{(n as string)[0]}</text>
          <text x="138" y={166 + i * 32} fill="#0A2540" fontSize="7.5" fontWeight="500">{n}</text>
          <text x="220" y={166 + i * 32} fill="#64748B" fontSize="7">{s}</text>
          <text x="300" y={166 + i * 32} fill="#64748B" fontSize="7">{o}</text>
          <rect x="370" y={156 + i * 32} width="38" height="13" rx="6" fill={`${c}18`} />
          <text x="389" y={166 + i * 32} textAnchor="middle" fill={c as string} fontSize="6" fontWeight="700">{st}</text>
          <text x="450" y={166 + i * 32} textAnchor="middle" fill={c as string} fontSize="7" fontWeight="700">{sc}</text>
        </g>
      ))}
    </svg>
  );
}

function ScreenCRMObjectifs() {
  return (
    <svg viewBox="0 0 360 220" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="360" height="220" fill="#fff" />
      <rect width="360" height="36" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.5" />
      <text x="16" y="22" fill="#0A2540" fontSize="9" fontWeight="700">Suivi des Objectifs</text>
      <text x="290" y="22" fill="#F7B500" fontSize="7" fontWeight="600">Q2 2026 ▾</text>
      {[["Objectif revenus", "78%", "#F7B500"], ["Taux fidélisation", "94%", "#10B981"], ["Séances réalisées", "65%", "#3B82F6"], ["NPS Score", "88%", "#8B5CF6"]].map(([l, p, c], i) => (
        <g key={i}>
          <rect x="12" y={44 + i * 42} width="336" height="34" rx="6" fill={i % 2 === 0 ? "#F8FAFC" : "#fff"} stroke="#E2E8F0" strokeWidth="0.5" />
          <text x="22" y={64 + i * 42} fill="#0A2540" fontSize="8" fontWeight="600">{l}</text>
          <rect x="140" y={52 + i * 42} width="150" height="8" rx="4" fill="#E2E8F0" />
          <rect x="140" y={52 + i * 42} width={parseInt(p) * 1.5} height="8" rx="4" fill={c as string} opacity="0.8" />
          <text x="300" y={61 + i * 42} fill={c as string} fontSize="9" fontWeight="800">{p}</text>
          <circle cx="330" cy={57 + i * 42} r="8" fill={`${c}15`} />
          <text x="330" y={61 + i * 42} textAnchor="middle" fill={c as string} fontSize="9">✓</text>
        </g>
      ))}
      <rect x="12" y="214" width="336" height="2" rx="1" fill="#E2E8F0" />
    </svg>
  );
}

function ScreenCRMKPI() {
  return (
    <svg viewBox="0 0 300 190" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="300" height="190" fill="#0A2540" />
      <text x="16" y="24" fill="#F7B500" fontSize="10" fontWeight="900">KPI Dashboard</text>
      <text x="16" y="38" fill="rgba(255,255,255,0.4)" fontSize="7">Mis à jour il y a 2 min</text>
      {[["247", "Clients", "#F7B500"], ["94%", "Sat.", "#10B981"], ["12k", "CA", "#60A5FA"], ["38", "Séances", "#C084FC"]].map(([v, l, c], i) => (
        <g key={i}>
          <rect x={10 + i * 70} y="48" width="62" height="56" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
          <text x={41 + i * 70} y="70" textAnchor="middle" fill={c as string} fontSize="14" fontWeight="900">{v}</text>
          <text x={41 + i * 70} y="84" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="6">{l}</text>
        </g>
      ))}
      {[40, 65, 52, 80, 72, 95, 88].map((h, i) => (
        <g key={i}>
          <rect x={12 + i * 39} y={165 - h * 0.55} width="28" height={h * 0.55} rx="4" fill="#F7B500" opacity={0.4 + i * 0.08} />
        </g>
      ))}
      <text x="150" y="178" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="6">Évolution 7 jours</text>
    </svg>
  );
}

function ScreenGestionMain() {
  return (
    <svg viewBox="0 0 480 300" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="480" height="300" fill="#F8FAFC" />
      <rect width="480" height="40" fill="#0A2540" />
      <rect x="10" y="12" width="60" height="16" rx="3" fill="#F7B500" opacity="0.9" />
      <text x="40" y="23" textAnchor="middle" fill="#0A2540" fontSize="7" fontWeight="900">PROJETS BEH</text>
      {["Vue globale", "Mes projets", "Équipes", "Planning", "Rapports"].map((t, i) => (
        <text key={i} x={95 + i * 70} y="24" fill={i === 0 ? "#F7B500" : "rgba(255,255,255,0.5)"} fontSize="8" fontWeight={i === 0 ? "700" : "400"}>{t}</text>
      ))}
      <rect x="420" y="10" width="50" height="20" rx="4" fill="#F7B500" />
      <text x="445" y="23" textAnchor="middle" fill="#0A2540" fontSize="7" fontWeight="700">+ Projet</text>
      {[["12", "Projets actifs", "#F7B500"], ["8", "En cours", "#3B82F6"], ["4", "Terminés", "#10B981"], ["93%", "Taux succès", "#8B5CF6"]].map(([v, l, c], i) => (
        <g key={i}>
          <rect x={10 + i * 115} y="52" width="104" height="60" rx="8" fill="#fff" stroke="#E2E8F0" strokeWidth="1" />
          <text x={62 + i * 115} y="75" textAnchor="middle" fill={c as string} fontSize="18" fontWeight="900">{v}</text>
          <text x={62 + i * 115} y="90" textAnchor="middle" fill="#94A3B8" fontSize="7">{l}</text>
          <circle cx={92 + i * 115} cy="62" r="7" fill={`${c}15`} />
          <text x={92 + i * 115} y="66" textAnchor="middle" fill={c as string} fontSize="8">↑</text>
        </g>
      ))}
      {[["À faire", "#F7B500", ["Audit client ABC", "Rapport mensuel"]], ["En cours", "#3B82F6", ["Refonte processus", "Formation équipe", "Analyse KPI"]], ["Terminé", "#10B981", ["Audit Dupont SA", "CRM déploiement"]]].map(([col, color, tasks], i) => (
        <g key={i}>
          <rect x={10 + i * 155} y="124" width="148" height="166" rx="8" fill="#F1F5F9" />
          <text x={22 + i * 155} y="142" fill={color as string} fontSize="8" fontWeight="700">{col as string}</text>
          <circle cx={144 + i * 155} cy="137" r="9" fill={`${color}20`} />
          <text x={144 + i * 155} y="141" textAnchor="middle" fill={color as string} fontSize="8" fontWeight="800">{(tasks as string[]).length}</text>
          {(tasks as string[]).map((t, ti) => (
            <g key={ti}>
              <rect x={18 + i * 155} y={152 + ti * 40} width="132" height="32" rx="6" fill="#fff" stroke="#E2E8F0" strokeWidth="0.5" />
              <rect x={22 + i * 155} y={158 + ti * 40} width="4" height="20" rx="2" fill={color as string} />
              <text x={32 + i * 155} y={168 + ti * 40} fill="#0A2540" fontSize="7" fontWeight="500">{t}</text>
              <text x={32 + i * 155} y={178 + ti * 40} fill="#94A3B8" fontSize="6">En attente • 2j</text>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

function ScreenGestionTimeline() {
  return (
    <svg viewBox="0 0 380 230" style={{ width: "100%", height: "100%", display: "block" }}>
      <rect width="380" height="230" fill="#fff" />
      <rect width="380" height="36" fill="#F8FAFC" />
      <text x="16" y="22" fill="#0A2540" fontSize="9" fontWeight="700">Planning des projets</text>
      <text x="310" y="22" fill="#F7B500" fontSize="7">Avril – Juin 2026</text>
      <rect x="10" y="44" width="100" height="20" rx="0" fill="#F1F5F9" />
      <text x="16" y="58" fill="#94A3B8" fontSize="6.5">Projet</text>
      {["Avr", "Mai", "Jun"].map((m, i) => (
        <g key={i}>
          <rect x={118 + i * 84} y="44" width="80" height="20" fill="#F1F5F9" />
          <text x={158 + i * 84} y="58" textAnchor="middle" fill="#94A3B8" fontSize="6.5">{m} 2026</text>
        </g>
      ))}
      {[["Projet Alpha", 0, 160, "#F7B500"], ["Projet Beta", 60, 100, "#3B82F6"], ["Projet Gamma", 120, 130, "#10B981"], ["Projet Delta", 30, 200, "#8B5CF6"], ["Projet Epsilon", 160, 80, "#EF4444"]].map(([n, start, width, c], i) => (
        <g key={i}>
          <rect x="10" y={68 + i * 28} width="100" height="22" fill={i % 2 === 0 ? "#F8FAFC" : "#fff"} />
          <text x="16" y={83 + i * 28} fill="#0A2540" fontSize="7.5" fontWeight="500">{n}</text>
          <rect x="110" y={68 + i * 28} width="264" height="22" fill={i % 2 === 0 ? "#F8FAFC" : "#fff"} />
          <rect x={118 + (start as number) * 0.88} y={72 + i * 28} width={(width as number) * 0.88} height="14" rx="7" fill={c as string} opacity="0.75" />
          <text x={118 + (start as number) * 0.88 + 6} y={82 + i * 28} fill="#fff" fontSize="6" fontWeight="600">{n}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Helpers d'intersection ──────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return [ref, v] as const;
}
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [ref, v] = useInView(0.08);
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(24px)", transition: `all .65s cubic-bezier(.22,1,.36,1) ${delay}s` }}>
      {children}
    </div>
  );
}

// ─── Composant avec liste déroulante (select) pour les captures ──────────────
function PlatformWithSelect({
  number, title, subtitle, tagColor, tagBg,
  screens,
  reverseLayout = false,
  problems, results,
  delay = 0,
}: {
  number: string; title: string; subtitle: string;
  tagColor: string; tagBg: string;
  screens: { label: string; comp: React.ReactNode; width: number; height: number; description?: string }[];
  reverseLayout?: boolean;
  problems: string[]; results: string[]; delay?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeScreen = screens[activeIndex];

  const textContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontWeight: 900, fontSize: 52, color: "#E2E8F0", lineHeight: 1, fontFamily: "inherit" }}>{number}</span>
        <div>
          <span style={{ background: tagBg, color: tagColor, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, letterSpacing: "1px", textTransform: "uppercase" }}>{subtitle}</span>
          <h3 style={{ fontWeight: 900, fontSize: "clamp(24px,2.5vw,32px)", color: "#0A2540", margin: "8px 0 0", lineHeight: 1.1 }}>{title}</h3>
        </div>
      </div>

      <div style={{ background: "#FFF5F5", border: "1px solid #FEE2E2", borderRadius: 14, padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <FaExclamationTriangle size={14} color="#EF4444" />
          <span style={{ fontWeight: 700, fontSize: 13, color: "#DC2626" }}>Problèmes résolus</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {problems.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#374151" }}>
              <span style={{ color: "#EF4444", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✕</span>
              {p}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 14, padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <FaCheckCircle size={14} color="#10B981" />
          <span style={{ fontWeight: 700, fontSize: 13, color: "#059669" }}>Résultats obtenus</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {results.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#374151" }}>
              <span style={{ color: "#10B981", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
              {r}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <Link href="/inscription?demo=1" style={{ flex: 1 }}>
          <button style={{
            width: "100%", background: "#F7B500", color: "#0A2540", border: "none", borderRadius: 12, padding: "14px 0", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 4px 8px rgba(247,181,0,0.2)"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(247,181,0,0.3)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 8px rgba(247,181,0,0.2)"; }}>
            <FaDesktop size={14} /> Réserver une démo
          </button>
        </Link>
        <Link href="/inscription?essai=1" style={{ flex: 1 }}>
          <button style={{
            width: "100%", background: "#0A2540", color: "#fff", border: "1px solid rgba(247,181,0,0.3)", borderRadius: 12, padding: "14px 0", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.background = "#F7B500"; e.currentTarget.style.color = "#0A2540"; e.currentTarget.style.borderColor = "#F7B500"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "#0A2540"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(247,181,0,0.3)"; }}>
            <FaGift size={14} /> Essai gratuit 7 jours
          </button>
        </Link>
      </div>
    </div>
  );

  const selectArea = (
    <div>
      {/* Liste déroulante */}
      <div style={{ marginBottom: 20 }}>
        <select
          value={activeIndex}
          onChange={(e) => setActiveIndex(parseInt(e.target.value))}
          style={{
            width: "100%", padding: "12px 16px", fontSize: 14, fontWeight: 500, fontFamily: "inherit",
            border: "1.5px solid #E2E8F0", borderRadius: 12, background: "#fff", color: "#0A2540",
            cursor: "pointer", outline: "none", transition: "border 0.2s"
          }}
          onFocus={(e) => e.target.style.borderColor = "#F7B500"}
          onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
        >
          {screens.map((screen, idx) => (
            <option key={idx} value={idx}>{screen.label}</option>
          ))}
        </select>
      </div>

      {/* Capture active */}
      <div style={{
        background: "#F8FAFC", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 40px rgba(10,37,64,0.12), 0 4px 12px rgba(10,37,64,0.08)", border: "1px solid #E2E8F0", transition: "transform 0.3s ease, box-shadow 0.3s ease"
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 28px 48px rgba(10,37,64,0.18)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 20px 40px rgba(10,37,64,0.12)"; }}>
        <div style={{ width: "100%", height: "auto", display: "flex", justifyContent: "center", background: "#fff", padding: 12 }}>
          <div style={{ width: activeScreen.width, height: activeScreen.height }}>
            {activeScreen.comp}
          </div>
        </div>
        {activeScreen.description && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid #E2E8F0", background: "#fff", fontSize: 12, color: "#6B7280", textAlign: "center" }}>
            {activeScreen.description}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <FadeUp delay={delay}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start", padding: "72px 0", borderBottom: "1px solid #F1F5F9" }}>
        {reverseLayout ? (
          <>
            {selectArea}
            {textContent}
          </>
        ) : (
          <>
            {textContent}
            {selectArea}
          </>
        )}
      </div>
    </FadeUp>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────────
export default function NosPlateformesPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [codeOffset, setCodeOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCodeOffset(prev => (prev + 1) % CODE_LINES.length), 350);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#374151", background: "#fff", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Fira+Code:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes floatY{0%,100%{transform:translateY(-50%) rotate(45deg)}50%{transform:translateY(calc(-50% - 16px)) rotate(45deg)}}
        @keyframes heroIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes fadeSlideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        .diamond{animation:floatY 7s ease-in-out infinite;position:absolute;pointer-events:none;}
        .live-dot{width:7px;height:7px;border-radius:50%;background:#F7B500;animation:pulse 1.5s ease-in-out infinite;display:inline-block;flex-shrink:0;}
        .btn-primary{display:inline-flex;align-items:center;gap:8px;background:#F7B500;color:#0A2540;padding:13px 26px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none;border:none;cursor:pointer;font-family:inherit;transition:all .22s;}
        .btn-primary:hover{background:#e6a800;transform:translateY(-2px);}
        .nav-link{color:#4B5563;text-decoration:none;font-size:14px;font-weight:600;transition:color .2s;}
        .nav-link:hover{color:#F7B500;}
        .oc{background:#F9FAFB;border:1.5px solid #E5E7EB;border-radius:16px;padding:20px;transition:all .3s;text-decoration:none;display:block;}
        .oc:hover{transform:translateY(-5px);border-color:#F7B500;background:#fff;box-shadow:0 8px 24px rgba(247,181,0,0.1);}
        .code-font{font-family:'Fira Code',monospace;font-size:12px;line-height:1.9;}
        .acc-bar{width:4px;border-radius:99px;background:#F7B500;flex-shrink:0;}
        .drop-item{display:flex;align-items:center;gap:10px;padding:9px 16px;color:#4B5563;text-decoration:none;font-size:13px;font-weight:600;transition:all .15s;}
        .drop-item:hover{background:#FFFBEB;color:#F7B500;}
      `}</style>

      {/* HEADER */}
      <header style={{ background: "#fff", position: "sticky", top: 0, zIndex: 90, borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <svg width="42" height="42" viewBox="0 0 46 46" fill="none">
              <rect width="46" height="46" rx="11" fill="#0A2540" />
              <rect x="23" y="7" width="13" height="13" rx="2" transform="rotate(45 23 7)" fill="#F7B500" opacity="0.2" />
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#F7B500" fontSize="14" fontWeight="900" fontFamily="Arial">BEH</text>
            </svg>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#0A2540", letterSpacing: "-0.3px" }}>
              Business <span style={{ color: "#F7B500" }}>Expert</span> Hub
            </span>
          </Link>
          <nav style={{ display: "flex", gap: 22, alignItems: "center" }}>
            <Link href="/" className="nav-link">Accueil</Link>
            <Link href="/a-propos" className="nav-link">À propos</Link>
            <div style={{ position: "relative" }} onMouseEnter={() => setNavOpen(true)} onMouseLeave={() => setNavOpen(false)}>
              <span style={{ color: "#F7B500", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Services ▾</span>
              {navOpen && (
                <ul style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, listStyle: "none", padding: "6px 0", zIndex: 200, minWidth: 200, boxShadow: "0 12px 36px rgba(0,0,0,0.1)", animation: "fadeSlideDown .2s ease" }}>
                  {NAV.map(s => <li key={s.slug}><Link href={`/services/${s.slug}`} className="drop-item">{s.label}</Link></li>)}
                </ul>
              )}
            </div>
            <Link href="/experts" className="nav-link">Experts</Link>
            <Link href="/blog" className="nav-link">Blog</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
          </nav>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/connexion"><button style={{ border: "1.5px solid #0A2540", color: "#0A2540", background: "transparent", padding: "8px 20px", borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>Connexion</button></Link>
            <Link href="/inscription"><button style={{ background: "#F7B500", color: "#0A2540", border: "none", padding: "8px 20px", borderRadius: 9, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{"S'inscrire"}</button></Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg,#0B1628 0%,#0d1f3c 55%,#0B1628 100%)", padding: "80px 24px 100px", position: "relative", overflow: "hidden" }}>
        <div className="diamond" style={{ width: 520, height: 520, right: -140, top: "50%", background: "rgba(247,181,0,0.04)", border: "1px solid rgba(247,181,0,0.08)", borderRadius: 24, animationDelay: "0s" }} />
        <div className="diamond" style={{ width: 300, height: 300, right: 150, top: "25%", background: "rgba(247,181,0,0.025)", border: "1px solid rgba(247,181,0,0.05)", borderRadius: 16, animationDelay: "-3s" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{ fontSize: 13, color: "rgba(226,232,240,0.35)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/" style={{ color: "rgba(226,232,240,0.35)", textDecoration: "none" }}>Accueil</Link><span>›</span>
            <Link href="/services" style={{ color: "rgba(226,232,240,0.35)", textDecoration: "none" }}>Services</Link><span>›</span>
            <span style={{ color: "#F7B500", fontWeight: 600 }}>Nos Plateformes</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <div style={{ animation: "heroIn .8s .08s both", display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(247,181,0,0.12)", border: "1px solid rgba(247,181,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaDesktop color="#F7B500" size={22} />
                </div>
              </div>
              <h1 style={{ animation: "heroIn .8s .2s both", fontWeight: 900, fontSize: "clamp(36px,5vw,60px)", lineHeight: 1.05, color: "#F1F5F9", margin: "0 0 18px" }}>
                Plateformes<br /><span style={{ color: "#F7B500" }}>personnalisées</span>
              </h1>
              <p style={{ animation: "heroIn .8s .35s both", fontSize: 16, color: "rgba(226,232,240,0.6)", lineHeight: 1.85, marginBottom: 32, maxWidth: 480 }}>
                Expert Hub associe expertise terrain et audit digital pour concevoir des solutions personnalisées. Développement d'applications et plateformes digitales répondant aux exigences spécifiques de chaque client.
              </p>
              <div style={{ animation: "heroIn .8s .5s both", display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href="/inscription"><button className="btn-primary">Réserver une démo <FaArrowRight size={12} /></button></Link>
              </div>
              <div style={{ animation: "heroIn .8s .65s both", display: "flex", gap: 14, marginTop: 28 }}>
                {[ ["94%", "Satisfaction", "#F7B500"],  ["24/7", "Support", "#F7B500"]].map(([v, l, c]) => (
                  <div key={String(l)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 10px", textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: c as string, lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 9, color: "rgba(226,232,240,0.35)", fontWeight: 600, marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ animation: "heroIn .9s .3s both" }}>
              <div style={{ background: "#0D1A2D", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "#0A1929", padding: "11px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  {["#FF5F57", "#FFBC2E", "#28C840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                  <span style={{ fontFamily: "'Fira Code',monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>dashboard.js — BEH Platform</span>
                </div>
                <div className="code-font" style={{ padding: 16, height: 240, overflow: "hidden", position: "relative" }}>
                  {CODE_LINES.slice(codeOffset, codeOffset + 9).concat(CODE_LINES.slice(0, Math.max(0, 9 - (CODE_LINES.length - codeOffset)))).map((line, i) => (
                    <div key={i} style={{ marginBottom: 2, opacity: i === 0 ? 0.3 : i === 8 ? 0.3 : 1, transition: "opacity .3s" }}>
                      <span style={{ color: "rgba(255,255,255,0.2)", marginRight: 14, display: "inline-block", minWidth: 20, textAlign: "right", userSelect: "none" }}>{line.ln}</span>
                      {line.parts.map((p, pi) => <span key={pi} style={{ color: COLOR_MAP[p.t] || "#ABB2BF" }}>{p.v}</span>)}
                    </div>
                  ))}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(transparent,#0D1A2D)", pointerEvents: "none" }} />
                </div>
                <div style={{ background: "#0A1929", padding: "9px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="live-dot" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATEFORMES AVEC SELECTION DÉROULANTE */}
      <section style={{ background: "#fff", padding: "0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ textAlign: "center", padding: "80px 0 20px" }}>
              <h2 style={{ fontWeight: 900, fontSize: "clamp(32px,4vw,48px)", color: "#0A2540", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Nos <span style={{ color: "#F7B500" }}>Plateformes</span>
              </h2>
              <p style={{ color: "#6B7280", fontSize: 17, marginTop: 14, maxWidth: 580, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
                Des solutions digitales sur mesure pour transformer vos processus et booster votre performance.
              </p>
            </div>
          </FadeUp>

          {/* ERP */}
          <PlatformWithSelect
            number="01"
            title="Gestion ERP & Ressources"
            subtitle="ERP Expert"
            tagColor="#0A2540"
            tagBg="#F7B500"
            screens={[
              { label: "Dashboard principal", comp: <ScreenERPMain />, width: 380, height: 238, description: "Vue d'ensemble des KPI et activités" },
              { label: "Gestion produits", comp: <ScreenERPList />, width: 300, height: 190, description: "Liste des produits et fournisseurs" },
              { label: "Statistiques", comp: <ScreenERPStats />, width: 260, height: 165, description: "Répartition et indicateurs mensuels" },
            ]}
            problems={[
              "Données éparpillées entre plusieurs outils non connectés",
              "Absence de vue globale sur l'activité financière",
              "Processus comptables et RH entièrement manuels",
              "Impossibilité de suivre le stock en temps réel",
            ]}
            results={[
              "Centralisation complète : ventes, stock, RH, compta en un seul outil",
              "Réduction de 60% du temps de traitement administratif",
              "Tableaux de bord financiers automatiques en temps réel",
              "Productivité globale augmentée de 45% dès le 1er mois",
            ]}
            delay={0}
          />

          {/* CRM */}
          <PlatformWithSelect
            number="02"
            title="CRM & Relation Client"
            subtitle="CRM Expert"
            tagColor="#fff"
            tagBg="#0A2540"
            screens={[
              { label: "Dashboard CRM", comp: <ScreenCRMMain />, width: 380, height: 238, description: "Vue globale des clients et activités" },
              { label: "Objectifs", comp: <ScreenCRMObjectifs />, width: 290, height: 183, description: "Progression des objectifs commerciaux" },
              { label: "KPI Dashboard", comp: <ScreenCRMKPI />, width: 240, height: 152, description: "Indicateurs de performance en temps réel" },
            ]}
            reverseLayout
            problems={[
              "Suivi client non structuré et données perdues",
              "Absence d'archivage automatique des séances et échanges",
              "Objectifs commerciaux jamais suivis ni mesurés",
              "Perte d'opportunités faute de relance et de traçabilité",
            ]}
            results={[
              "+40% de fidélisation grâce au suivi personnalisé automatisé",
              "Archivage complet des clients, séances et historiques 24/7",
              "Tableau de bord objectifs mis à jour en temps réel",
              "+25% de ventes additionnelles grâce aux alertes de relance",
            ]}
            delay={0.05}
          />

          {/* Gestion de projets */}
          <PlatformWithSelect
            number="03"
            title="Gestion de Projets & Équipes"
            subtitle="Projets Expert"
            tagColor="#0A2540"
            tagBg="#F7B500"
            screens={[
              { label: "Kanban projets", comp: <ScreenGestionMain />, width: 380, height: 238, description: "Organisation visuelle des tâches" },
              { label: "Planning Gantt", comp: <ScreenGestionTimeline />, width: 300, height: 190, description: "Chronologie des projets et jalons" },
              { label: "Statistiques", comp: <ScreenERPStats />, width: 240, height: 152, description: "Mesures de performance projets" },
            ]}
            problems={[
              "Suivi de projet inefficace, tâches perdues dans les emails",
              "Communication d'équipe dispersée sur plusieurs canaux",
              "Délais non respectés et livrables jamais documentés",
              "Aucune visibilité sur l'avancement réel des missions",
            ]}
            results={[
              "Livraison des projets avec 30% de délai en moins",
              "Communication et documents centralisés dans un seul espace",
              "Taux de satisfaction des équipes augmenté de +50%",
              "Reporting automatique hebdomadaire pour les dirigeants",
            ]}
            delay={0.05}
          />
        </div>
      </section>

      {/* AUTRES SERVICES */}
      <section style={{ background: "#fff", padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <FadeUp>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="acc-bar" style={{ height: 28 }} />
                <h2 style={{ fontWeight: 800, color: "#0A2540", fontSize: 20 }}>Autres services</h2>
              </div>
              <Link href="/services" style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 13, color: "#F7B500", textDecoration: "none" }}>
                <FaArrowLeft size={10} /> Tous les services
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              {[
                { slug: "audit-sur-site", icon: <FaSearchPlus />, color: "#3B82F6", title: "Audit sur site", badge: "Terrain", desc: "Diagnostic complet de vos processus sur site." },
                { slug: "consulting", icon: <FaChartLine />, color: "#8B5CF6", title: "Consulting", badge: "Stratégie", desc: "Structurez et optimisez votre entreprise." },
                { slug: "formations", icon: <FaGraduationCap />, color: "#F7B500", title: "Formations", badge: "Certif.", desc: "Montez en compétence avec nos experts." },
              ].map((s, i) => (
                <Link key={i} href={`/services/${s.slug}`} className="oc">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}15`, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
                    <span style={{ background: `${s.color}14`, color: s.color, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, padding: "4px 11px", borderRadius: 99 }}>{s.badge}</span>
                  </div>
                  <div style={{ fontWeight: 800, color: "#0A2540", fontSize: 15, marginBottom: 6 }}>{s.title}</div>
                  <p style={{ fontSize: 12.5, color: "#6B7280", lineHeight: 1.65, marginBottom: 12 }}>{s.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: s.color, fontWeight: 700, fontSize: 13 }}>Découvrir <FaArrowRight size={9} /></div>
                </Link>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      <footer style={{ background: "#0A2540", color: "#fff", padding: "32px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>© 2026 Business Expert Hub</p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>Tarifs en Dinar Tunisien (HT) — Essai gratuit 7 jours · Sans engagement</p>
      </footer>
    </div>
  );
}