"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FaPlay, FaMicrophone, FaTimes, FaSync, FaPlus, FaEdit, FaTrash, FaEye,
  FaCheck, FaStar, FaCalendar, FaClock, FaMapMarkerAlt, FaCertificate,
  FaUsers, FaLink, FaInfoCircle, FaArrowLeft, FaArrowRight, FaChevronLeft, FaChevronRight,
  FaFilter, FaSearch, FaBuilding, FaLaptop, FaGraduationCap, FaTools, FaFileInvoiceDollar,
  FaChartLine, FaChartBar, FaChartPie, FaChartArea, FaTachometerAlt, FaBell, FaCog, FaUser,
  FaDownload, FaExpand, FaEllipsisV, FaArrowUp, FaArrowDown,
} from "react-icons/fa";

const BASE = "http://localhost:3001";

type Tab =
  | "dashboard" | "experts" | "startups" | "temoignages" | "contacts"
  | "histoire" | "blog" | "formations" | "podcasts" | "demandes" | "medias";

const C = {
  teal:    "#00BFA5",
  tealD:   "#00897B",
  tealL:   "#E0F2F1",
  orange:  "#FF7043",
  orangeL: "#FFF3E0",
  blue:    "#1565C0",
  blueL:   "#E3F2FD",
  blueM:   "#1E88E5",
  green:   "#2E7D32",
  greenL:  "#E8F5E9",
  greenM:  "#43A047",
  amber:   "#F59E0B",
  amberL:  "#FFF8E1",
  red:     "#E53935",
  redL:    "#FFEBEE",
  purple:  "#6D28D9",
  purpleL: "#EDE9FE",
  cyan:    "#0097A7",
  cyanL:   "#E0F7FA",
  sidebar: "#1B3A4B",
  sidebarD:"#132D3A",
  bg:      "#F0F4F8",
  white:   "#FFFFFF",
  text:    "#1A2B3C",
  textSub: "#607080",
  border:  "#DDE3EA",
};

// ============================================================
// COMPOSANTS DE GRAPHIQUES
// ============================================================
function AreaChart({ data, color, fill, height = 90, width = 280, label }: any) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v: number, i: number) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 14) - 6,
  }));
  const linePath = pts.map((p: any, i: number) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width={width} height={height} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={`ag-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill || color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={fill || color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#ag-${color.replace("#","")})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p: any, i: number) => (
        i === pts.length - 1 &&
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} stroke="#fff" strokeWidth="2" />
      ))}
    </svg>
  );
}

function MultiLineChart({ series, labels, height = 160, width = 400 }: any) {
  if (!series || series.length === 0) return null;
  const allVals = series.flatMap((s: any) => s.data);
  const max = Math.max(...allVals);
  const min = Math.min(...allVals);
  const range = max - min || 1;
  const getPts = (data: number[]) =>
    data.map((v: number, i: number) => ({
      x: (i / (data.length - 1)) * width,
      y: height - ((v - min) / range) * (height - 20) - 10,
    }));
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(f => height - f * (height - 20) - 10);
  return (
    <svg width={width} height={height + 20} style={{ overflow: "visible", display: "block" }}>
      <defs>
        {series.map((s: any) => (
          <linearGradient key={s.color} id={`mlg-${s.color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {gridLines.map((y, i) => (
        <line key={i} x1={0} y1={y} x2={width} y2={y} stroke={C.border} strokeWidth="1" strokeDasharray="4 4" />
      ))}
      {series.map((s: any) => {
        const pts = getPts(s.data);
        const linePath = pts.map((p: any, i: number) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
        return (
          <g key={s.label}>
            <path d={areaPath} fill={`url(#mlg-${s.color.replace("#","")})`} />
            <path d={linePath} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p: any, i: number) => (
              <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={s.color} stroke="#fff" strokeWidth="1.5" />
            ))}
          </g>
        );
      })}
      {labels && labels.map((l: string, i: number) => {
        const x = (i / (labels.length - 1)) * width;
        return <text key={i} x={x} y={height + 18} textAnchor="middle" fontSize={9} fill={C.textSub} fontWeight="600">{l}</text>;
      })}
    </svg>
  );
}

function DonutChart({ segments, size = 130 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const cx = size / 2, cy = size / 2, r = size / 2 - 18;
  let angle = -Math.PI / 2;
  const arcs = segments.map(seg => {
    const frac = seg.value / total;
    const sweep = frac * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, color: seg.color, label: seg.label, value: seg.value, pct: Math.round(frac * 100) };
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        {arcs.map((a, i) => (
          <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth="16" strokeLinecap="butt" />
        ))}
        <circle cx={cx} cy={cy} r={r - 22} fill="white" />
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize={17} fontWeight={900} fill={C.text}>{total}</text>
        <text x={cx} y={cy + 13} textAnchor="middle" fontSize={8} fill={C.textSub} fontWeight="700" letterSpacing="1">TOTAL</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {arcs.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: a.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: C.textSub, flex: 1 }}>{a.label}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: a.color }}>{a.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadialGauge({ value, color, size = 110 }: any) {
  const pct = Math.min(value / 100, 1);
  const r = size / 2 - 12;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = pct * circumference * 0.75;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8EEF5" strokeWidth={10}
        strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} strokeLinecap="round"
        style={{ transform: `rotate(135deg)`, transformOrigin: "50% 50%" }} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circumference - dash}`} strokeLinecap="round"
        style={{ transform: `rotate(135deg)`, transformOrigin: "50% 50%", transition: "stroke-dasharray 1s ease" }} />
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize={20} fontWeight={900} fill={C.text}>{value}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={8} fill={C.textSub} fontWeight="700">SCORE</text>
    </svg>
  );
}

function ColumnChart({ data, colors, height = 100 }: { data: { label: string; value: number }[]; colors: string[]; height?: number }) {
  const max = Math.max(...data.map(d => d.value)) || 1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, padding: "0 4px" }}>
      {data.slice(0, 8).map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: colors[i % colors.length] }}>{d.value}</span>
          <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: `linear-gradient(180deg, ${colors[i % colors.length]}, ${colors[i % colors.length]}aa)`, height: `${(d.value / max) * (height - 20)}px`, transition: "height 0.9s cubic-bezier(.23,1,.32,1)", minHeight: 4 }} />
          <span style={{ fontSize: 8, color: C.textSub, textAlign: "center", lineHeight: 1.2, maxWidth: 32, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function HorizBar({ data, colors, maxItems = 5 }: { data: { label: string; value: number }[]; colors: string[]; maxItems?: number }) {
  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, maxItems);
  const max = sorted[0]?.value || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {sorted.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11.5, color: C.text, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "78%" }}>{d.label}</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: colors[i % colors.length] }}>{d.value}</span>
          </div>
          <div style={{ height: 7, background: "#EEF2F7", borderRadius: 99 }}>
            <div style={{ height: "100%", width: `${(d.value / max) * 100}%`, background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${colors[i % colors.length]}bb)`, borderRadius: 99, transition: "width 0.9s" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color, bg, trend, trendUp, sparkData, onClick }: any) {
  const [hov, setHov] = useState(false);
  const pts = sparkData && sparkData.length > 1 ? (() => {
    const max = Math.max(...sparkData); const min = Math.min(...sparkData); const range = max - min || 1;
    return sparkData.map((v: number, i: number) => `${(i/(sparkData.length-1))*80},${28-((v-min)/range)*22}`).join(" ");
  })() : null;
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? `linear-gradient(135deg, ${color}0d, ${color}05)` : C.white, borderRadius: 14, padding: "18px 20px", cursor: onClick ? "pointer" : "default", border: `2px solid ${hov ? color + "40" : C.border}`, boxShadow: hov ? `0 6px 24px ${color}18` : "0 1px 4px rgba(0,0,0,.04)", transition: "all .2s", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -16, right: -16, width: 72, height: 72, background: `${color}0a`, borderRadius: "50%" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: bg || `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
        {trend !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, background: trendUp ? "#E8F5E9" : "#FFEBEE", borderRadius: 99, padding: "3px 8px" }}>
            {trendUp ? <FaArrowUp size={8} color={C.greenM} /> : <FaArrowDown size={8} color={C.red} />}
            <span style={{ fontSize: 11, fontWeight: 700, color: trendUp ? C.greenM : C.red }}>{trend}%</span>
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: "-1px", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: C.textSub, marginTop: 3, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 3 }}>{sub}</div>}
      {pts && (
        <div style={{ marginTop: 10 }}>
          <svg width={80} height={28} style={{ overflow: "visible" }}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

// ============================================================
// VUE DASHBOARD
// ============================================================
function BIDashboardView({ experts, startups, temoignages, demandes, formationsProposees, podcastsProposees, formations, podcasts, articles, setTab }: any) {
  const expertValides = experts.filter((e: any) => e.statut === "valide").length;
  const startupValides = startups.filter((s: any) => s.statut === "valide").length;
  const enAttente = [...experts, ...startups].filter((x: any) => x.statut === "en_attente").length;
  const temosPublies = temoignages.filter((t: any) => t.statut === "valide");
  const avgNote = temosPublies.length > 0 ? temosPublies.reduce((s: number, t: any) => s + (t.note || 5), 0) / temosPublies.length : 0;
  const satisfactionPct = Math.round((avgNote / 5) * 100);
  const formationsPubliees = (formations || []).filter((f: any) => f.statut === "publie").length;
  const podcastsPublies = (podcasts || []).filter((p: any) => p.statut === "publie").length;
  const articlesPublies = (articles || []).filter((a: any) => a.statut === "publie").length;

  const domaineMap: Record<string, number> = {};
  experts.forEach((e: any) => { if (e.domaine) domaineMap[e.domaine] = (domaineMap[e.domaine] || 0) + 1; });
  const domaineData = Object.entries(domaineMap).map(([label, value]) => ({ label, value: value as number }));

  const secteurMap: Record<string, number> = {};
  startups.forEach((s: any) => { if (s.secteur) secteurMap[s.secteur] = (secteurMap[s.secteur] || 0) + 1; });
  const secteurData = Object.entries(secteurMap).map(([label, value]) => ({ label, value: value as number }));

  const serviceMap: Record<string, number> = {};
  demandes.forEach((d: any) => { const k = d.service || "Autre"; serviceMap[k] = (serviceMap[k] || 0) + 1; });
  const serviceData = Object.entries(serviceMap).map(([label, value]) => ({ label, value: value as number }));

  const donutExperts = [
    { label: "Validés", value: expertValides, color: C.teal },
    { label: "En attente", value: experts.filter((e: any) => e.statut === "en_attente").length, color: C.amber },
    { label: "Refusés", value: experts.filter((e: any) => e.statut === "refuse" || e.statut === "refusé").length, color: C.red },
  ].filter(d => d.value > 0);

  const donutStartups = [
    { label: "Validées", value: startupValides, color: C.blueM },
    { label: "En attente", value: startups.filter((s: any) => s.statut === "en_attente").length, color: C.orange },
    { label: "Refusées", value: startups.filter((s: any) => s.statut === "refuse" || s.statut === "refusé").length, color: C.red },
  ].filter(d => d.value > 0);

  const seed = (experts.length + startups.length) % 5;
  const makeTrend = (base: number) => Array.from({ length: 10 }, (_, i) => Math.max(0, Math.round(base * (0.55 + 0.5 * Math.sin(i * 0.9 + seed)) + i * 0.4)));

  const months = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août"];
  const multiSeries = [
    { label: "Experts", color: C.teal, data: months.map((_, i) => Math.round(experts.length * (0.3 + 0.7 * (i / 7)))) },
    { label: "Startups", color: C.orange, data: months.map((_, i) => Math.round(startups.length * (0.25 + 0.75 * (i / 7)))) },
    { label: "Demandes", color: C.blueM, data: months.map((_, i) => Math.round(demandes.length * (0.2 + 0.8 * (i / 7)))) },
  ];

  const domaineColors = [C.teal, C.orange, C.blueM, C.amber, C.purple, C.cyan, C.red, C.greenM];
  const secteurColors = [C.blueM, C.orange, C.teal, C.purple, C.amber, C.red, C.cyan, C.greenM];
  const serviceColors = [C.teal, C.orange, C.blueM, C.amber, C.purple, C.cyan];

  return (
    <div style={{ padding: "26px 28px", background: C.bg, minHeight: "100vh" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Plateforme Admin</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: 0 }}>Tableau de Bord</h1>
          <span style={{ fontSize: 13, color: C.textSub }}>Données en temps réel</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 16 }}>
        <div style={{ background: C.white, borderRadius: 14, border: `2px solid ${C.border}`, padding: "16px 18px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "1px" }}>Satisfaction</div>
          <RadialGauge value={satisfactionPct} color={satisfactionPct >= 75 ? C.greenM : satisfactionPct >= 50 ? C.amber : C.red} size={110} />
          <div style={{ fontSize: 10.5, color: C.textSub }}>{temosPublies.length} avis · {avgNote > 0 ? avgNote.toFixed(1) : "—"}/5 ★</div>
        </div>
        <KpiCard icon="📋" label="Demandes totales" value={demandes.length} sub={`${demandes.filter((d: any) => d.statut === "en_attente").length} en attente`} color={C.purple} trend={8} trendUp={true} sparkData={makeTrend(demandes.length)} onClick={() => setTab("demandes")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 16 }}>
        <KpiCard icon="🎯" label="Experts validés" value={expertValides} sub={`${experts.length} inscrits`} color={C.teal} trend={12} trendUp={true} sparkData={makeTrend(expertValides)} onClick={() => setTab("experts")} />
        <KpiCard icon="🚀" label="Startups actives" value={startupValides} sub={`${startups.length} inscrites`} color={C.orange} trend={7} trendUp={true} sparkData={makeTrend(startupValides)} onClick={() => setTab("startups")} />
        <KpiCard icon="📚" label="Formations publiées" value={formationsPubliees} sub={`${(formationsProposees || []).length} à valider`} color={C.blueM} trend={22} trendUp={true} sparkData={makeTrend(formationsPubliees)} onClick={() => setTab("formations")} />
        <KpiCard icon="⏳" label="En attente validation" value={enAttente} sub="Experts + Startups" color={C.red} trend={15} trendUp={false} sparkData={makeTrend(enAttente)} onClick={() => setTab("experts")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div style={{ background: C.white, borderRadius: 16, border: `2px solid ${C.border}`, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>Activité de la plateforme</div>
              <div style={{ fontSize: 11.5, color: C.textSub, marginTop: 2 }}>Évolution mensuelle</div>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              {multiSeries.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 3, background: s.color, borderRadius: 99 }} />
                  <span style={{ fontSize: 10.5, color: C.textSub, fontWeight: 600 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <MultiLineChart series={multiSeries} labels={months} height={140} width={380} />
        </div>
        <div style={{ background: C.white, borderRadius: 16, border: `2px solid ${C.border}`, padding: "20px 22px" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 2 }}>Répartition Experts</div>
          <div style={{ fontSize: 11.5, color: C.textSub, marginBottom: 16 }}>Par statut</div>
          <DonutChart segments={donutExperts.length > 0 ? donutExperts : [{ label: "Aucun", value: 1, color: C.border }]} size={120} />
        </div>
        <div style={{ background: C.white, borderRadius: 16, border: `2px solid ${C.border}`, padding: "20px 22px" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 2 }}>Répartition Startups</div>
          <div style={{ fontSize: 11.5, color: C.textSub, marginBottom: 16 }}>Par statut</div>
          <DonutChart segments={donutStartups.length > 0 ? donutStartups : [{ label: "Aucune", value: 1, color: C.border }]} size={120} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 14, marginBottom: 16 }}>
        <div style={{ background: C.white, borderRadius: 16, border: `2px solid ${C.border}`, padding: "20px 22px" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 2 }}>Startups par secteur</div>
          <div style={{ fontSize: 11.5, color: C.textSub, marginBottom: 14 }}>{startups.length} inscrites</div>
          {secteurData.length === 0
            ? <div style={{ textAlign: "center", color: C.textSub, padding: "30px 0", fontSize: 13 }}>Aucune donnée</div>
            : <ColumnChart data={secteurData} colors={secteurColors} height={110} />}
        </div>
        <div style={{ background: C.white, borderRadius: 16, border: `2px solid ${C.border}`, padding: "20px 22px" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 2 }}>Experts par domaine</div>
          <div style={{ fontSize: 11.5, color: C.textSub, marginTop: 2, marginBottom: 14 }}>{experts.length} experts</div>
          {domaineData.length === 0
            ? <div style={{ textAlign: "center", color: C.textSub, padding: "30px 0", fontSize: 13 }}>Aucune donnée</div>
            : <HorizBar data={domaineData} colors={domaineColors} maxItems={6} />}
        </div>
        <div style={{ background: C.white, borderRadius: 16, border: `2px solid ${C.border}`, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>Services demandés</div>
              <div style={{ fontSize: 11.5, color: C.textSub, marginTop: 2 }}>{demandes.length} demandes</div>
            </div>
            <span style={{ background: C.tealL, color: C.tealD, borderRadius: 8, padding: "3px 9px", fontSize: 10.5, fontWeight: 700 }}>Top {Math.min(serviceData.length, 6)}</span>
          </div>
          {serviceData.length === 0
            ? <div style={{ textAlign: "center", color: C.textSub, padding: "30px 0", fontSize: 13 }}>Aucune demande</div>
            : <>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70, marginBottom: 14 }}>
                  {serviceData.slice(0, 6).map((d, i) => {
                    const max = serviceData[0].value;
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: serviceColors[i % serviceColors.length] }}>{d.value}</span>
                        <div style={{ width: "100%", background: "#EEF2F7", borderRadius: "4px 4px 0 0", position: "relative", overflow: "hidden", height: 50 }}>
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: `linear-gradient(180deg, ${serviceColors[i % serviceColors.length]}, ${serviceColors[i % serviceColors.length]}99)`, borderRadius: "4px 4px 0 0", height: `${(d.value / max) * 100}%`, transition: "height .8s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <HorizBar data={serviceData} colors={serviceColors} maxItems={4} />
              </>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <div style={{ background: `linear-gradient(135deg, ${C.sidebar} 0%, ${C.sidebarD} 100%)`, borderRadius: 16, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>Avis clients</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 2 }}>{temosPublies.length} publiés</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: C.amber }}>{avgNote > 0 ? avgNote.toFixed(1) : "—"}</div>
              <div style={{ color: C.amber, fontSize: 11, letterSpacing: "2px" }}>★★★★★</div>
            </div>
          </div>
          {[5, 4, 3, 2, 1].map(n => {
            const count = temosPublies.filter((t: any) => t.note === n).length;
            const pct = temosPublies.length > 0 ? (count / temosPublies.length) * 100 : 0;
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <span style={{ fontSize: 10, color: C.amber, width: 8 }}>{n}</span>
                <span style={{ color: C.amber, fontSize: 10 }}>★</span>
                <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,.1)", borderRadius: 99 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${C.amber}, #FCD34D)`, borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 9.5, color: "rgba(255,255,255,.3)", width: 16 }}>{count}</span>
              </div>
            );
          })}
          <div style={{ marginTop: 14, background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.3)", borderRadius: 10, padding: "8px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.amber }}>{satisfactionPct}%</div>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,.4)" }}>Taux global de satisfaction</div>
          </div>
        </div>

        <div style={{ background: C.white, borderRadius: 16, border: `2px solid ${C.border}`, padding: "20px 22px" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 4 }}>Contenu publié</div>
          <div style={{ fontSize: 11.5, color: C.textSub, marginBottom: 16 }}>Distribution par type</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Formations", value: formationsPubliees, color: C.purple, icon: "📚", pending: (formationsProposees || []).length },
              { label: "Podcasts", value: podcastsPublies, color: C.cyan, icon: "🎙️", pending: (podcastsProposees || []).length },
              { label: "Articles", value: articlesPublies, color: C.blueM, icon: "📝", pending: 0 },
              { label: "Témoignages", value: temosPublies.length, color: C.greenM, icon: "⭐", pending: temoignages.filter((t: any) => t.statut === "en_attente").length },
            ].map((ct, i) => (
              <div key={i} style={{ background: `${ct.color}08`, border: `1.5px solid ${ct.color}25`, borderRadius: 12, padding: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{ct.icon}</span>
                  {ct.pending > 0 && <span style={{ background: C.amberL, color: "#92400E", border: `1px solid ${C.amber}66`, borderRadius: 99, padding: "1px 6px", fontSize: 8.5, fontWeight: 700 }}>{ct.pending}</span>}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: ct.color, lineHeight: 1 }}>{ct.value}</div>
                <div style={{ fontSize: 10.5, color: C.textSub, marginTop: 2, fontWeight: 500 }}>{ct.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.white, borderRadius: 16, border: `2px solid ${C.border}`, padding: "20px 22px" }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text, marginBottom: 4 }}>À traiter</div>
          <div style={{ fontSize: 11.5, color: C.textSub, marginBottom: 14 }}>Actions requises</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Experts en attente", count: experts.filter((e: any) => e.statut === "en_attente").length, color: C.teal, icon: "🎯", tab: "experts" },
              { label: "Startups en attente", count: startups.filter((s: any) => s.statut === "en_attente").length, color: C.orange, icon: "🚀", tab: "startups" },
              { label: "Formations à valider", count: (formationsProposees || []).length, color: C.purple, icon: "📚", tab: "demandes" },
              { label: "Podcasts à valider", count: (podcastsProposees || []).length, color: C.cyan, icon: "🎙️", tab: "demandes" },
              { label: "Demandes services", count: demandes.filter((d: any) => d.statut === "en_attente").length, color: C.amber, icon: "📋", tab: "demandes" },
              { label: "Avis à modérer", count: temoignages.filter((t: any) => t.statut === "en_attente").length, color: C.red, icon: "⭐", tab: "temoignages" },
            ].map((item, i) => (
              <div key={i} onClick={() => setTab(item.tab)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 11px", borderRadius: 10, background: item.count > 0 ? `${item.color}08` : "#F8FAFC", border: `1.5px solid ${item.count > 0 ? item.color + "25" : C.border}`, cursor: "pointer", transition: "all .15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 13 }}>{item.icon}</span>
                  <span style={{ fontSize: 11.5, color: C.text, fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 800, color: item.count > 0 ? item.color : "#CBD5E1", background: item.count > 0 ? `${item.color}15` : "transparent", borderRadius: 99, padding: "2px 9px", minWidth: 26, textAlign: "center" }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DATA TABLE
// ============================================================
function DataTable({ title, columns, data, renderRow, filters, searchKeys, actions, emptyText }: any) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortCol, setSortCol] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = data.filter((row: any) => {
    const q = search.toLowerCase();
    const searchOk = !q || searchKeys.some((k: string) => String(k.split(".").reduce((o: any, p: string) => o?.[p], row) || "").toLowerCase().includes(q));
    const filterOk = Object.entries(activeFilters).every(([k, v]) => !v || String(k.split(".").reduce((o: any, p: string) => o?.[p], row) || "") === v);
    return searchOk && filterOk;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortCol) return 0;
    const va = sortCol.split(".").reduce((o: any, p: string) => o?.[p], a) || "";
    const vb = sortCol.split(".").reduce((o: any, p: string) => o?.[p], b) || "";
    return String(va).localeCompare(String(vb)) * (sortDir === "asc" ? 1 : -1);
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const paged = sorted.slice((page - 1) * perPage, page * perPage);

  return (
    <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1.5px solid ${C.border}`, background: "#FAFCFE", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{title}</div>
          <div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>{filtered.length} résultat{filtered.length > 1 ? "s" : ""} sur {data.length}</div>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <FaSearch style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: C.textSub, fontSize: 11 }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher..."
              style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 12.5, fontFamily: "inherit", outline: "none", width: 190, color: C.text, background: C.white }}
              onFocus={e => e.target.style.borderColor = C.teal} onBlur={e => e.target.style.borderColor = C.border} />
          </div>
          {filters?.map((f: any) => (
            <select key={f.key} value={activeFilters[f.key] || ""} onChange={e => { setActiveFilters(prev => ({ ...prev, [f.key]: e.target.value })); setPage(1); }}
              style={{ padding: "7px 11px", border: `1.5px solid ${activeFilters[f.key] ? C.teal : C.border}`, borderRadius: 9, fontSize: 12.5, fontFamily: "inherit", outline: "none", cursor: "pointer", background: activeFilters[f.key] ? C.tealL : C.white, color: C.text }}>
              <option value="">{f.label}</option>
              {f.options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          {Object.values(activeFilters).some(v => v) && (
            <button onClick={() => { setActiveFilters({}); setSearch(""); }} style={{ padding: "6px 11px", border: `1.5px solid ${C.red}33`, borderRadius: 9, background: C.redL, color: C.red, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
              <FaTimes size={9} /> Reset
            </button>
          )}
          {actions}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F6F9FC" }}>
              {columns.map((col: any) => (
                <th key={col.key} onClick={() => { if (col.sortable) { setSortDir(sortCol === col.key && sortDir === "asc" ? "desc" : "asc"); setSortCol(col.key); } }}
                  style={{ textAlign: "left", padding: "10px 16px", fontSize: 10.5, fontWeight: 700, color: sortCol === col.key ? C.teal : C.textSub, textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: `1.5px solid ${C.border}`, cursor: col.sortable ? "pointer" : "default", whiteSpace: "nowrap", userSelect: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {col.label}
                    {col.sortable && <span style={{ color: sortCol === col.key ? C.teal : "#D1D5DB", fontSize: 8.5 }}>{sortCol === col.key ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0
              ? <tr><td colSpan={columns.length} style={{ textAlign: "center", padding: "44px 0", color: C.textSub, fontSize: 13 }}>{emptyText || "Aucune donnée"}</td></tr>
              : paged.map((row: any, i: number) => renderRow(row, i))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ padding: "11px 20px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFCFE" }}>
          <span style={{ fontSize: 11.5, color: C.textSub }}>Page {page} / {totalPages}</span>
          <div style={{ display: "flex", gap: 5 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "5px 11px", border: `1.5px solid ${C.border}`, borderRadius: 8, background: page === 1 ? "#F8FAFC" : C.white, color: page === 1 ? "#D1D5DB" : C.text, cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 12.5, fontFamily: "inherit" }}>←</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return <button key={p} onClick={() => setPage(p)} style={{ padding: "5px 10px", border: `1.5px solid ${p === page ? C.teal : C.border}`, borderRadius: 8, background: p === page ? C.teal : C.white, color: p === page ? "#fff" : C.text, cursor: "pointer", fontSize: 12.5, fontFamily: "inherit", fontWeight: p === page ? 700 : 400 }}>{p}</button>;
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "5px 11px", border: `1.5px solid ${C.border}`, borderRadius: 8, background: page === totalPages ? "#F8FAFC" : C.white, color: page === totalPages ? "#D1D5DB" : C.text, cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 12.5, fontFamily: "inherit" }}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// BADGE & AVATAR
// ============================================================
function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string, any> = {
    valide:    { bg: C.greenL, color: C.green,   label: "✅ Validé" },
    en_attente:{ bg: C.amberL, color: "#92400E",  label: "⏳ En attente" },
    refusé:    { bg: C.redL,   color: C.red,      label: "❌ Refusé" },
    refuse:    { bg: C.redL,   color: C.red,      label: "❌ Refusé" },
    publie:    { bg: C.greenL, color: C.green,    label: "✅ Publié" },
    brouillon: { bg: C.amberL, color: "#92400E",  label: "📝 Brouillon" },
    archive:   { bg: "#F1F5F9", color: C.textSub, label: "📦 Archivé" },
    acceptee:  { bg: C.greenL, color: C.green,    label: "✅ Acceptée" },
    en_cours:  { bg: C.blueL,  color: C.blue,     label: "🔄 En cours" },
    terminee:  { bg: C.tealL,  color: C.tealD,    label: "🏁 Terminée" },
    refusee:   { bg: C.redL,   color: C.red,      label: "❌ Refusée" },
  };
  const s = map[statut] || { bg: "#F1F5F9", color: C.textSub, label: statut };
  return <span style={{ background: s.bg, color: s.color, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{s.label}</span>;
}

function Avatar({ prenom, nom, size = 34, color = C.teal }: any) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `${color}18`, border: `2px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", color, fontWeight: 800, fontSize: size * 0.38, flexShrink: 0 }}>
      {(prenom?.[0] || "?")}{(nom?.[0] || "")}
    </div>
  );
}

// ============================================================
// FORM HELPERS
// ============================================================
function HField({ label, cle, type = "text", rows = 0, hf, setHF, placeholder = "" }: any) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 10.5, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: 5 }}>{label}</label>
      {rows > 0
        ? <textarea className="inp" rows={rows} value={hf(cle)} onChange={(e: any) => setHF(cle, e.target.value)} placeholder={placeholder} style={{ resize: "vertical" }} />
        : <input type={type} className="inp" value={hf(cle)} onChange={(e: any) => setHF(cle, e.target.value)} placeholder={placeholder} />}
    </div>
  );
}

// ============================================================
// MODAL EXPERT DETAIL
// ============================================================
function ModalExpertDetail({ expert, onClose, onValider, onRefuser }: any) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg, ${C.sidebar}, ${C.tealD})`, padding: "22px 26px", borderRadius: "20px 20px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(0,191,165,.25)", border: `2px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.teal, fontWeight: 800, fontSize: 20 }}>
                {expert.user?.prenom?.[0]}{expert.user?.nom?.[0]}
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Fiche Expert</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 19 }}>{expert.user?.prenom} {expert.user?.nom}</div>
                <div style={{ color: C.teal, fontSize: 12, marginTop: 2 }}>{expert.domaine || "Expert"}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "22px 26px", maxHeight: "75vh", overflowY: "auto" }}>
          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 16, border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 12 }}>📋 Informations personnelles</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Email", val: expert.user?.email || "—" },
                { label: "Téléphone", val: expert.user?.telephone || "—" },
                { label: "Localisation", val: expert.localisation || "—" },
                { label: "Expérience", val: expert.annee_debut_experience ? `${new Date().getFullYear() - expert.annee_debut_experience} ans` : "—" },
                { label: "Domaine", val: expert.domaine || "—" },
                { label: "Statut", val: expert.statut },
              ].map((row, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
          {expert.description && (
            <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 16, border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 8 }}>📝 Description</div>
              <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.75, margin: 0 }}>{expert.description}</p>
            </div>
          )}
          {expert.cv && (
            <div style={{ marginBottom: 16 }}>
              <a href={`${BASE}/uploads/cv/${expert.cv}`} target="_blank" rel="noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.blueL, color: C.blue, borderRadius: 10, padding: "10px 16px", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                📄 Voir le CV
              </a>
            </div>
          )}
        </div>
        {expert.statut === "en_attente" && (
          <div style={{ padding: "14px 26px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, justifyContent: "flex-end", background: "#FAFCFE", borderRadius: "0 0 20px 20px" }}>
            <button className="btn btn-red" onClick={() => onRefuser(expert.id)}>❌ Refuser</button>
            <button className="btn btn-green" onClick={() => onValider(expert.id)}>✅ Valider & envoyer email</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MODAL STARTUP DETAIL
// ============================================================
function ModalStartupDetail({ startup, onClose, onValider, onRefuser }: any) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 680 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg, ${C.sidebar}, ${C.orange})`, padding: "22px 26px", borderRadius: "20px 20px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🚀</div>
              <div>
                <div style={{ color: "rgba(255,255,255,.7)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Fiche Startup</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 19 }}>{startup.nom_startup || `${startup.user?.prenom} ${startup.user?.nom}`}</div>
                <div style={{ color: "rgba(255,255,255,.8)", fontSize: 12, marginTop: 2 }}>{startup.secteur || "—"}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "22px 26px", maxHeight: "75vh", overflowY: "auto" }}>
          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 16, border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 12 }}>👤 Responsable</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Nom complet", val: `${startup.user?.prenom || ""} ${startup.user?.nom || ""}` },
                { label: "Email", val: startup.user?.email || "—" },
                { label: "Téléphone", val: startup.user?.telephone || "—" },
                { label: "Fonction", val: startup.fonction || "—" },
              ].map((row, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 16, border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 12 }}>🏢 Informations</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Nom startup", val: startup.nom_startup || "—" },
                { label: "Secteur", val: startup.secteur || "—" },
                { label: "Taille", val: startup.taille || "—" },
                { label: "Site web", val: startup.site_web || "—" },
              ].map((row, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
          {startup.description && (
            <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 8 }}>📝 Description</div>
              <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.75, margin: 0 }}>{startup.description}</p>
            </div>
          )}
        </div>
        {startup.statut === "en_attente" && (
          <div style={{ padding: "14px 26px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, justifyContent: "flex-end", background: "#FAFCFE", borderRadius: "0 0 20px 20px" }}>
            <button className="btn btn-red" onClick={() => onRefuser(startup.id)}>❌ Refuser</button>
            <button className="btn btn-green" onClick={() => onValider(startup.id)}>✅ Valider & envoyer email</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MODAL DEMANDE SERVICE — NOUVELLE LOGIQUE
// ============================================================
function ModalDemandeService({ demande, experts, commentaireAdmin, setCommentaireAdmin, onChangerStatut, onNotifierExperts, onAccepterFormation, onRefuserFormation, onClose, getDemandeDomaine, setSelectedExpertProfile, fetchDemandeMaj }: any) {
  const svc = demande?.service || "";
  const isFormation = svc === "formations" || svc === "formation";
  const needsExpert = ["consulting", "audit-sur-site", "nos-plateformes", "personnalise"].includes(svc);
  const demandeDomaine = getDemandeDomaine(demande);
  const expertsValides = experts.filter((e: any) => e.statut === "valide");
  let expertsFiltres = expertsValides;
  if (demandeDomaine && demandeDomaine !== "Autre") {
    const dl = demandeDomaine.toLowerCase().trim();
    expertsFiltres = expertsValides.filter((e: any) => (e.domaine || "").toLowerCase().trim() === dl);
  }
  const expertsNotifiesIds: number[] = demande?.experts_notifies || [];
  const expertsAcceptesIds: number[] = demande?.experts_acceptes || [];
  const expertsAcceptes = experts.filter((e: any) => expertsAcceptesIds.includes(e.id));
  const [selectedExperts, setSelectedExperts] = useState<number[]>([]);
  const [etape, setEtape] = useState<"selection" | "assignation">(
    expertsAcceptesIds.length > 0 || demande?.statut === "acceptee" ? "assignation" : "selection"
  );

  const formation = demande?.formation;
  const placesRestantes = formation?.places_limitees ? (formation?.places_disponibles ?? 0) : null;
  const peutAccepter = !isFormation || !formation?.places_limitees || (placesRestantes !== null && placesRestantes > 0);
  const toggleExpert = (id: number) => setSelectedExperts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Expert choisi par le client
  const expertChoisiParClient = demande?.expert_assigne_id
    ? experts.find((e: any) => e.id === demande.expert_assigne_id)
    : null;

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg, ${C.sidebar}, ${C.blueM})`, padding: "22px 26px", position: "sticky", top: 0, borderRadius: "20px 20px 0 0", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, background: "rgba(30,136,229,.3)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📋</div>
              <div>
                <div style={{ color: "rgba(255,255,255,.7)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>Demande de service</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 19 }}>{svc}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatusBadge statut={demande.statut} />
              <button onClick={onClose} style={{ background: "rgba(255,255,255,.18)", border: "none", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
            </div>
          </div>
        </div>

        <div style={{ padding: "22px 26px", maxHeight: "80vh", overflowY: "auto" }}>

          {/* Infos client */}
          <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "16px 18px", marginBottom: 18, border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 12 }}>👤 Informations du client</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Nom complet", val: `${demande.user?.prenom || ""} ${demande.user?.nom || ""}` },
                { label: "Email", val: demande.user?.email || "—" },
                { label: "Téléphone", val: demande.telephone || demande.user?.telephone || "—" },
                { label: "Startup", val: demande.user?.startup?.nom_startup || "—" },
                { label: "Secteur", val: demande.user?.startup?.secteur || "—" },
                { label: "Domaine recherché", val: getDemandeDomaine(demande) },
              ].map((row, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{row.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {demande.description && (
            <div style={{ background: C.white, borderRadius: 12, padding: "14px 16px", marginBottom: 18, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: C.textSub, textTransform: "uppercase", marginBottom: 6 }}>Description</div>
              <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.75, margin: 0 }}>{demande.description}</p>
            </div>
          )}

          {/* Expert choisi par le client — affiché en priorité si présent */}
          {expertChoisiParClient && (
            <div style={{ background: `linear-gradient(135deg, ${C.purpleL}, #EDE9FE)`, border: `2px solid ${C.purple}30`, borderRadius: 14, padding: "16px 18px", marginBottom: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.purple, marginBottom: 12 }}>
                👤 Expert choisi par le client
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, background: C.white, borderRadius: 11, padding: "14px 16px" }}>
                <Avatar prenom={expertChoisiParClient.user?.prenom} nom={expertChoisiParClient.user?.nom} size={48} color={C.purple} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{expertChoisiParClient.user?.prenom} {expertChoisiParClient.user?.nom}</div>
                  <div style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{expertChoisiParClient.domaine} · {expertChoisiParClient.localisation || "—"}</div>
                  <div style={{ fontSize: 12, color: C.textSub }}>{expertChoisiParClient.user?.email}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ background: C.purpleL, color: C.purple, borderRadius: 99, padding: "4px 12px", fontSize: 11.5, fontWeight: 700 }}>✅ Sélectionné par le client</span>
                </div>
              </div>
              {demande.devis_montant && (
                <div style={{ marginTop: 10, background: C.white, borderRadius: 10, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, color: C.textSub, fontWeight: 600 }}>💰 Montant du devis</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: C.purple }}>{demande.devis_montant} DT</span>
                </div>
              )}
            </div>
          )}

          {/* Panel de gestion des experts (seulement si service nécessite un expert) */}
          {needsExpert && !isFormation && (
            <div style={{ border: `1.5px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 18 }}>
              <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: "#FAFCFE" }}>
                {[
                  ["selection", "📤 Étape 1 — Notifier"],
                  ["assignation", `👥 Étape 2 — Suivi${expertsAcceptesIds.length > 0 ? ` (${expertsAcceptesIds.length} accepté${expertsAcceptesIds.length > 1 ? "s" : ""})` : ""}`]
                ].map(([v, l]) => (
                  <button key={v} onClick={() => setEtape(v as any)}
                    style={{ flex: 1, padding: "12px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: etape === v ? 700 : 500, color: etape === v ? C.text : C.textSub, background: "transparent", borderBottom: etape === v ? `2.5px solid ${C.teal}` : "2.5px solid transparent" }}>
                    {l}
                  </button>
                ))}
              </div>

              {/* ÉTAPE 1 — Sélection & notification des experts */}
              {etape === "selection" && (
                <div>
                  <div style={{ padding: "10px 16px", background: "#F6F9FC", fontSize: 12, color: C.textSub, display: "flex", justifyContent: "space-between" }}>
                    <span>Domaine : <strong>{demandeDomaine}</strong></span>
                    <span style={{ fontWeight: 700, color: C.text }}>{expertsFiltres.length} expert(s) disponible(s)</span>
                  </div>
                  <div style={{ maxHeight: 260, overflowY: "auto" }}>
                    {expertsFiltres.length === 0
                      ? <div style={{ padding: "28px", textAlign: "center", color: C.textSub, fontSize: 13 }}>Aucun expert validé dans ce domaine</div>
                      : expertsFiltres.map((ex: any) => {
                          const alreadyNotified = expertsNotifiesIds.includes(ex.id);
                          const hasAccepted = expertsAcceptesIds.includes(ex.id);
                          const isSelected = selectedExperts.includes(ex.id);
                          return (
                            <div key={ex.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid #F8FAFC`, background: isSelected ? `${C.teal}0a` : C.white }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <input type="checkbox" checked={isSelected} disabled={alreadyNotified} onChange={() => { if (!alreadyNotified) toggleExpert(ex.id); }}
                                  style={{ cursor: alreadyNotified ? "not-allowed" : "pointer", width: 16, height: 16, accentColor: C.teal }} />
                                <Avatar prenom={ex.user?.prenom} nom={ex.user?.nom} size={36} />
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: 13.5, color: C.text }}>{ex.user?.prenom} {ex.user?.nom}</div>
                                  <div style={{ fontSize: 11, color: C.textSub }}>{ex.domaine || "Expert"} · {ex.localisation || "—"}</div>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <button className="btn btn-gray" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setSelectedExpertProfile(ex)}>👤 Profil</button>
                                {alreadyNotified
                                  ? hasAccepted
                                    ? <span style={{ background: C.greenL, color: C.green, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>✅ A accepté</span>
                                    : <span style={{ background: C.amberL, color: "#92400E", borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>⏳ Notifié</span>
                                  : <span style={{ fontSize: 11, color: C.textSub }}>Non notifié</span>}
                              </div>
                            </div>
                          );
                        })}
                  </div>
                  {selectedExperts.length > 0 && (
                    <div style={{ padding: "12px 16px", background: `${C.teal}08`, borderTop: `1px solid ${C.teal}30`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: C.tealD, fontWeight: 600 }}>{selectedExperts.length} expert(s) sélectionné(s)</span>
                      <button className="btn btn-teal" onClick={() => { onNotifierExperts(demande.id, selectedExperts); setSelectedExperts([]); setEtape("assignation"); }}>
                        📤 Notifier la sélection
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ÉTAPE 2 — Suivi des réponses (lecture seule pour l'admin) */}
              {etape === "assignation" && (
                <div>
                  {expertsAcceptesIds.length === 0 ? (
                    <div style={{ padding: "32px", textAlign: "center", color: C.textSub }}>
                      <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 6 }}>En attente des réponses experts</div>
                      <div style={{ fontSize: 12, color: C.textSub, maxWidth: 320, margin: "0 auto 16px" }}>
                        Le statut passera automatiquement à "Acceptée" dès qu'un expert accepte la mission.
                      </div>
                      {expertsNotifiesIds.length > 0 && (
                        <div style={{ background: C.amberL, border: `1px solid ${C.amber}50`, borderRadius: 10, padding: "10px 16px", fontSize: 12, color: "#92400E", marginBottom: 14 }}>
                          📤 {expertsNotifiesIds.length} expert(s) notifié(s) — en attente de leur réponse
                        </div>
                      )}
                      <button className="btn btn-gray" style={{ fontSize: 12 }} onClick={() => setEtape("selection")}>← Retour à la sélection</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ padding: "12px 16px", background: C.greenL, fontSize: 12.5, color: C.green, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                        <span>✅ {expertsAcceptesIds.length} expert(s) ont accepté la mission</span>
                        {!expertChoisiParClient && (
                          <span style={{ marginLeft: "auto", background: C.amberL, color: "#92400E", borderRadius: 99, padding: "2px 10px", fontSize: 11 }}>
                            ⏳ En attente du choix du client
                          </span>
                        )}
                      </div>
                      {expertsAcceptes.map((ex: any) => {
                        const isChosenByClient = demande.expert_assigne_id === ex.id;
                        return (
                          <div key={ex.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${C.border}`, background: isChosenByClient ? C.purpleL : C.white, flexWrap: "wrap", gap: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <Avatar prenom={ex.user?.prenom} nom={ex.user?.nom} size={42} color={isChosenByClient ? C.purple : C.greenM} />
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{ex.user?.prenom} {ex.user?.nom}</div>
                                <div style={{ fontSize: 12, color: C.textSub }}>{ex.domaine} · {ex.localisation || "—"}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button className="btn btn-gray" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setSelectedExpertProfile(ex)}>👤 Profil</button>
                              {isChosenByClient
                                ? <span style={{ background: C.purpleL, color: C.purple, borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>👤 Choisi par le client</span>
                                : <span style={{ background: C.greenL, color: C.green, borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>✅ Disponible</span>}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section actions admin */}
          <div style={{ background: "#F8FAFC", border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontWeight: 700, color: C.text, fontSize: 14, marginBottom: 14 }}>⚙️ Actions administrateur</div>

            {/* Message pour le client */}
            <div style={{ marginBottom: 14 }}>
              <label className="lbl">Message pour le client</label>
              <textarea className="inp" rows={3} placeholder="Réponse visible par le client..." value={commentaireAdmin} onChange={(e: any) => setCommentaireAdmin(e.target.value)} />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>

              {/* CAS : Formation */}
              {demande.statut === "en_attente" && isFormation && (
                <>
                  <button className="btn btn-green" style={{ flex: 1, justifyContent: "center" }}
                    disabled={!peutAccepter}
                    onClick={() => peutAccepter && onAccepterFormation(demande.id)}>
                    {peutAccepter ? "✅ Accepter l'inscription" : "❌ Formation complète"}
                  </button>
                  <button className="btn btn-red" style={{ flex: 1, justifyContent: "center" }}
                    onClick={() => onRefuserFormation(demande.id)}>
                    ❌ Refuser
                  </button>
                </>
              )}

              {/* CAS : Service en attente — uniquement bouton Refuser */}
              {demande.statut === "en_attente" && !isFormation && (
                <button className="btn btn-red" style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => onChangerStatut(demande.id, "refusee")}>
                  ❌ Refuser la demande
                </button>
              )}

              {/* CAS : Acceptée — message informatif selon si client a choisi ou non */}
              {demande.statut === "acceptee" && !expertChoisiParClient && (
                <div style={{ flex: 1, padding: "12px 16px", background: C.amberL, border: `1px solid ${C.amber}50`, borderRadius: 10, fontSize: 13, color: "#92400E", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⏳</span>
                  En attente du choix de l'expert par le client
                </div>
              )}

              {/* CAS : Acceptée + client a choisi */}
              {demande.statut === "acceptee" && expertChoisiParClient && (
                <div style={{ flex: 1, padding: "12px 16px", background: C.greenL, border: `1px solid ${C.greenM}40`, borderRadius: 10, fontSize: 13, color: C.green, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>✅</span>
                  Client a choisi {expertChoisiParClient.user?.prenom} {expertChoisiParClient.user?.nom} — mission en cours
                </div>
              )}

              {/* CAS : Refusée */}
              {demande.statut === "refusee" && (
                <div style={{ flex: 1, padding: "12px 16px", background: C.redL, border: `1px solid ${C.red}30`, borderRadius: 10, fontSize: 13, color: C.red, fontWeight: 600 }}>
                  ❌ Cette demande a été refusée
                </div>
              )}

              {/* Bouton sauvegarder message si commentaire présent */}
              {commentaireAdmin && (
                <button className="btn btn-gray" style={{ justifyContent: "center" }}
                  onClick={() => onChangerStatut(demande.id, demande.statut)}>
                  💾 Sauvegarder le message
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FORMATION FORM MODAL
// ============================================================
function FormationFormModal({ formation, onClose, onSave }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titre: formation?.titre || "", description: formation?.description || "",
    domaine: formation?.domaine || "", formateur: formation?.formateur || "",
    mode: formation?.mode || "en_ligne", duree: formation?.duree || "",
    localisation: formation?.localisation || "", niveau: formation?.niveau || "",
    lien_formation: formation?.lien_formation || "",
    dateDebut: formation?.dateDebut?.split("T")[0] || "",
    dateFin: formation?.dateFin?.split("T")[0] || "",
    type: formation?.type || "payant", gratuit: formation?.gratuit || false,
    prix: formation?.prix || "", places_limitees: formation?.places_limitees || false,
    places_disponibles: formation?.places_disponibles || "",
    certifiante: formation?.certifiante || false, statut: formation?.statut || "publie"
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(formation?.image ? `${BASE}/uploads/formations/${formation.image}` : "");
  const DOMAINES = ["Marketing Digital","Finance / Comptabilité","Ressources Humaines","Développement Web / Mobile","Design UI/UX","Stratégie Commerciale","Logistique / Supply Chain","Intelligence Artificielle / Data","Management","Communication","Juridique","Autre"];
  const MODES = [{ value: "en_ligne", label: "💻 En ligne" }, { value: "presentiel", label: "🏢 Présentiel" }, { value: "hybride", label: "🌐 Hybride" }];
  const NIVEAUX = ["Débutant","Intermédiaire","Avancé","Tous niveaux"];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) { alert("Le titre est requis"); return; }
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, String(v)); });
    if (imageFile) fd.append("image", imageFile);
    const url = formation ? `${BASE}/formations/admin/${formation.id}` : `${BASE}/formations/admin/create`;
    try {
      const res = await fetch(url, { method: formation ? "PUT" : "POST", headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }, body: fd });
      if (res.ok) { onSave(); onClose(); } else alert("Erreur d'enregistrement");
    } catch { alert("Erreur réseau"); }
    setLoading(false);
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 760 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg, ${C.sidebar}, ${C.purple})`, padding: "24px 28px", borderRadius: "20px 20px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📚</div>
              <div>
                <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Formations Admin</div>
                <div style={{ fontWeight: 900, fontSize: 20, color: "#fff" }}>{formation ? "✏️ Modifier la formation" : "➕ Créer une formation"}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px", maxHeight: "72vh", overflowY: "auto" }}>
          <div style={{ marginBottom: 12 }}><label className="lbl">Titre *</label><input className="inp" required value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Titre de la formation" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label className="lbl">Domaine</label><select className="inp" value={form.domaine} onChange={e => setForm({ ...form, domaine: e.target.value })}><option value="">Sélectionner</option>{DOMAINES.map(d => <option key={d}>{d}</option>)}</select></div>
            <div><label className="lbl">Formateur</label><input className="inp" value={form.formateur} onChange={e => setForm({ ...form, formateur: e.target.value })} /></div>
            <div><label className="lbl">Niveau</label><select className="inp" value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })}><option value="">Sélectionner</option>{NIVEAUX.map(n => <option key={n}>{n}</option>)}</select></div>
            <div><label className="lbl">Durée</label><input className="inp" value={form.duree} onChange={e => setForm({ ...form, duree: e.target.value })} placeholder="Ex: 2 jours" /></div>
          </div>
          <div style={{ marginBottom: 12 }}><label className="lbl">Description</label><textarea className="inp" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
            {MODES.map(m => (
              <div key={m.value} onClick={() => setForm({ ...form, mode: m.value })} style={{ border: `2px solid ${form.mode === m.value ? C.teal : C.border}`, borderRadius: 11, padding: "10px", cursor: "pointer", background: form.mode === m.value ? C.tealL : C.white, textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{m.label}</div>
                {form.mode === m.value && <div style={{ color: C.teal, fontSize: 10, fontWeight: 700, marginTop: 2 }}>✓ Sélectionné</div>}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label className="lbl">Date début</label><input className="inp" type="date" value={form.dateDebut} onChange={e => setForm({ ...form, dateDebut: e.target.value })} /></div>
            <div><label className="lbl">Date fin</label><input className="inp" type="date" value={form.dateFin} onChange={e => setForm({ ...form, dateFin: e.target.value })} /></div>
            <div><label className="lbl">Statut</label><select className="inp" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}><option value="publie">✅ Publié</option><option value="brouillon">📝 Brouillon</option><option value="archive">📦 Archivé</option></select></div>
            <div><label className="lbl">Prix (DT)</label><input className="inp" type="number" min="0" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} placeholder="0 = Gratuit" /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
            <button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-teal" disabled={loading}>{loading ? "⏳ Enregistrement..." : (formation ? "💾 Modifier" : "✅ Créer")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// PODCAST FORM MODAL
// ============================================================
function PodcastFormModal({ podcast, onClose, onSave }: any) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ titre: podcast?.titre || "", description: podcast?.description || "", domaine: podcast?.domaine || "", auteur: podcast?.auteur || "", statut: podcast?.statut || "publie" });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(podcast?.image ? `${BASE}/uploads/podcasts-images/${podcast.image}` : "");
  const [audioName, setAudioName] = useState(podcast?.url_audio || "");
  const DOMAINES = ["Marketing Digital","Finance / Comptabilité","Ressources Humaines","Développement Web / Mobile","Design UI/UX","Stratégie Commerciale","Logistique / Supply Chain","Intelligence Artificielle / Data","Management","Communication","Juridique","Autre"];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) { alert("Le titre est requis"); return; }
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (audioFile) fd.append("audio_file", audioFile);
    if (imageFile) fd.append("image_file", imageFile);
    const url = podcast ? `${BASE}/admin/podcasts/${podcast.id}` : `${BASE}/admin/podcasts/create`;
    try {
      const res = await fetch(url, { method: podcast ? "PUT" : "POST", headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }, body: fd });
      if (res.ok) { onSave(); onClose(); } else alert("Erreur d'enregistrement");
    } catch { alert("Erreur réseau"); }
    setLoading(false);
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={(e: any) => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg, ${C.sidebar}, ${C.cyan})`, padding: "24px 28px", borderRadius: "20px 20px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎙️</div>
              <div>
                <div style={{ color: "rgba(255,255,255,.6)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Podcasts Admin</div>
                <div style={{ fontWeight: 900, fontSize: 20, color: "#fff" }}>{podcast ? "✏️ Modifier le podcast" : "➕ Créer un podcast"}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "24px 28px" }}>
          <div style={{ marginBottom: 12 }}><label className="lbl">Titre *</label><input className="inp" required value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} /></div>
          <div style={{ marginBottom: 12 }}><label className="lbl">Description</label><textarea className="inp" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div><label className="lbl">Auteur</label><input className="inp" value={form.auteur} onChange={e => setForm({ ...form, auteur: e.target.value })} /></div>
            <div><label className="lbl">Domaine</label><select className="inp" value={form.domaine} onChange={e => setForm({ ...form, domaine: e.target.value })}><option value="">Sélectionner</option>{DOMAINES.map(d => <option key={d}>{d}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label className="lbl">Fichier audio (MP3)</label>
              <label className="upload-zone" style={{ minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <input type="file" accept="audio/mpeg" onChange={e => { const f = e.target.files?.[0]; if (f) { setAudioFile(f); setAudioName(f.name); } }} style={{ display: "none" }} />
                {audioName ? <><div style={{ fontSize: 22 }}>🔊</div><div style={{ fontSize: 11, color: C.greenM, fontWeight: 600 }}>✅ Audio chargé</div></> : <><div style={{ fontSize: 22 }}>🎵</div><div style={{ fontSize: 11, color: C.textSub }}>Uploader MP3</div></>}
              </label>
            </div>
            <div><label className="lbl">Image</label>
              <label className="upload-zone" style={{ minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />
                {imagePreview ? <img src={imagePreview} style={{ maxHeight: 60, borderRadius: 6 }} alt="" /> : <><div style={{ fontSize: 22 }}>🖼️</div><div style={{ fontSize: 11, color: C.textSub }}>Image</div></>}
              </label>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}><label className="lbl">Statut</label><select className="inp" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}><option value="publie">✅ Publié</option><option value="brouillon">📝 Brouillon</option><option value="archive">📦 Archivé</option></select></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
            <button type="button" className="btn btn-gray" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-cyan" disabled={loading}>{loading ? "⏳..." : (podcast ? "💾 Modifier" : "✅ Créer")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// DEMANDES VIEW
// ============================================================
function DemandesView({ demandes, formations, podcasts, experts, formationsEnAttenteExpert, podcastsEnAttenteExpert, onOpenDemande, onPublierFormationExpert, onRefuserFormationExpert, onPublierPodcastExpert, onRefuserPodcastExpert, onSetFormationValidation, onSetPodcastValidation }: any) {
  const [activeTab, setActiveTab] = useState<"experts" | "startups">("experts");
  const [expertSubTab, setExpertSubTab] = useState<"formations" | "podcasts">("formations");
  const totalExpertAttente = formationsEnAttenteExpert.length + podcastsEnAttenteExpert.length;
  const totalServiceAttente = demandes.filter((d: any) => d.statut === "en_attente").length;

  return (
    <div style={{ padding: "26px 28px" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Centre de gestion</div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: 0 }}>Demandes & Publications</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
        {[
          { label: "Formations à valider", value: formationsEnAttenteExpert.length, color: C.purple, icon: "📚" },
          { label: "Podcasts à valider", value: podcastsEnAttenteExpert.length, color: C.cyan, icon: "🎙️" },
          { label: "Demandes service", value: demandes.length, color: C.blueM, icon: "🛠️" },
          { label: "Services en attente", value: totalServiceAttente, color: C.amber, icon: "⏳" },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, border: `2px solid ${s.value > 0 ? s.color + "30" : C.border}`, borderRadius: 14, padding: "15px 17px", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.value > 0 ? s.color : C.text }}>{s.value}</div>
              <div style={{ fontSize: 11.5, color: C.textSub, marginTop: 1 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: `1.5px solid ${C.border}` }}>
          {[["experts","🎯","Experts — Publications",totalExpertAttente,C.teal],["startups","🚀","Startups — Services",totalServiceAttente,C.blueM]].map(([v,icon,l,c,color]) => (
            <button key={v as string} onClick={() => setActiveTab(v as any)} style={{ flex: 1, padding: "16px 22px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: activeTab === v ? 800 : 500, color: activeTab === v ? C.text : C.textSub, background: activeTab === v ? C.white : "#FAFCFE", borderBottom: activeTab === v ? `3px solid ${color}` : "3px solid transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{icon as string}</span> {l as string}
              {(c as number) > 0 && <span style={{ background: color as string, color: "#fff", borderRadius: 99, padding: "2px 9px", fontSize: 11, fontWeight: 800 }}>{c as number}</span>}
            </button>
          ))}
        </div>

        {activeTab === "experts" && (
          <div>
            <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: "#FAFCFE", padding: "0 18px" }}>
              {[["formations","📚 Formations",formationsEnAttenteExpert.length,C.purple],["podcasts","🎙️ Podcasts",podcastsEnAttenteExpert.length,C.cyan]].map(([v,l,c,color]) => (
                <button key={v as string} onClick={() => setExpertSubTab(v as any)} style={{ padding: "11px 16px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: expertSubTab === v ? 700 : 500, color: expertSubTab === v ? color as string : C.textSub, background: "transparent", borderBottom: expertSubTab === v ? `2.5px solid ${color}` : "2.5px solid transparent", display: "flex", alignItems: "center", gap: 7 }}>
                  {l as string}
                  <span style={{ background: (c as number) > 0 ? color as string : C.border, color: (c as number) > 0 ? "#fff" : C.textSub, borderRadius: 99, padding: "1px 7px", fontSize: 11, fontWeight: 800 }}>{c as number}</span>
                </button>
              ))}
            </div>
            <div style={{ padding: "18px" }}>
              {expertSubTab === "formations" && (
                formationsEnAttenteExpert.length === 0
                  ? <div style={{ padding: "56px 0", textAlign: "center", color: C.textSub }}><div style={{ fontSize: 44, marginBottom: 12 }}>✅</div><div style={{ fontWeight: 700, fontSize: 15 }}>Aucune formation en attente</div></div>
                  : formationsEnAttenteExpert.map((f: any) => (
                    <div key={f.id} style={{ border: `1.5px solid ${C.purple}30`, borderRadius: 14, overflow: "hidden", background: C.white, marginBottom: 12 }}>
                      <div style={{ background: `linear-gradient(135deg, ${C.purpleL}, #EDE9FE)`, padding: "15px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 50, height: 50, borderRadius: 12, background: `linear-gradient(135deg, ${C.purple}, #5B21B6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>📚</div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{f.titre}</div>
                            <div style={{ fontSize: 11.5, color: C.purple, marginTop: 2 }}>
                              <span style={{ background: C.purple, color: "#fff", borderRadius: 6, padding: "1px 7px", fontSize: 9, fontWeight: 700, marginRight: 5 }}>EXPERT</span>
                              {f.expert?.user?.prenom} {f.expert?.user?.nom} · {f.expert?.domaine}
                            </div>
                          </div>
                        </div>
                        <span style={{ background: C.amberL, border: `1px solid ${C.amber}66`, borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "#92400E" }}>⏳ {new Date(f.createdAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div style={{ padding: "12px 18px", display: "flex", gap: 9, flexWrap: "wrap" }}>
                        <button onClick={() => onSetFormationValidation(f)} style={{ flex: 1, minWidth: 120, padding: "8px 13px", border: `1.5px solid ${C.purple}30`, borderRadius: 9, background: C.purpleL, color: C.purple, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>👁 Examiner</button>
                        <button onClick={() => onPublierFormationExpert(f.id)} style={{ flex: 1, minWidth: 120, padding: "8px 13px", border: `1.5px solid ${C.greenM}40`, borderRadius: 9, background: C.greenL, color: C.green, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>✅ Valider & Publier</button>
                        <button onClick={() => onRefuserFormationExpert(f.id)} style={{ padding: "8px 13px", border: `1.5px solid ${C.red}30`, borderRadius: 9, background: C.redL, color: C.red, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>❌ Refuser</button>
                      </div>
                    </div>
                  ))
              )}
              {expertSubTab === "podcasts" && (
                podcastsEnAttenteExpert.length === 0
                  ? <div style={{ padding: "56px 0", textAlign: "center", color: C.textSub }}><div style={{ fontSize: 44, marginBottom: 12 }}>✅</div><div style={{ fontWeight: 700, fontSize: 15 }}>Aucun podcast en attente</div></div>
                  : podcastsEnAttenteExpert.map((p: any) => (
                    <div key={p.id} style={{ border: `1.5px solid ${C.cyan}30`, borderRadius: 14, overflow: "hidden", background: C.white, marginBottom: 12 }}>
                      <div style={{ background: `linear-gradient(135deg, ${C.cyanL}, #ECFEFF)`, padding: "15px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 50, height: 50, borderRadius: 12, background: `linear-gradient(135deg, ${C.cyan}, ${C.cyan}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🎙️</div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{p.titre}</div>
                            <div style={{ fontSize: 11.5, color: C.cyan, marginTop: 2 }}>
                              <span style={{ background: C.cyan, color: "#fff", borderRadius: 6, padding: "1px 7px", fontSize: 9, fontWeight: 700, marginRight: 5 }}>EXPERT</span>
                              {p.expert?.user?.prenom} {p.expert?.user?.nom}
                            </div>
                          </div>
                        </div>
                        <span style={{ background: C.amberL, border: `1px solid ${C.amber}66`, borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: "#92400E" }}>⏳ {new Date(p.createdAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div style={{ padding: "12px 18px" }}>
                        {p.url_audio && <div style={{ background: C.cyanL, borderRadius: 9, padding: "9px 13px", marginBottom: 10, border: `1px solid ${C.cyan}30` }}><audio src={`${BASE}/uploads/podcasts-audio/${p.url_audio}`} controls style={{ width: "100%", height: 34 }} /></div>}
                        <div style={{ display: "flex", gap: 9 }}>
                          <button onClick={() => onSetPodcastValidation(p)} style={{ flex: 1, padding: "8px 13px", border: `1.5px solid ${C.cyan}30`, borderRadius: 9, background: C.cyanL, color: C.cyan, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>🎧 Écouter & Examiner</button>
                          <button onClick={() => onPublierPodcastExpert(p.id)} style={{ flex: 1, padding: "8px 13px", border: `1.5px solid ${C.greenM}40`, borderRadius: 9, background: C.greenL, color: C.green, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>✅ Valider & Publier</button>
                          <button onClick={() => onRefuserPodcastExpert(p.id)} style={{ padding: "8px 13px", border: `1.5px solid ${C.red}30`, borderRadius: 9, background: C.redL, color: C.red, fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>❌</button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {activeTab === "startups" && (
          <div style={{ padding: "14px 18px" }}>
            <DataTable
              title="Demandes de service"
              columns={[
                { key: "service", label: "Service", sortable: true },
                { key: "user.prenom", label: "Client", sortable: true },
                { key: "user.startup.nom_startup", label: "Startup" },
                { key: "statut", label: "Statut", sortable: true },
                { key: "createdAt", label: "Date", sortable: true },
                { key: "actions", label: "Actions" },
              ]}
              data={demandes}
              searchKeys={["service", "user.prenom", "user.nom", "user.startup.nom_startup"]}
              filters={[{ key: "statut", label: "Filtrer par statut", options: [
                { value: "en_attente", label: "⏳ En attente" },
                { value: "acceptee", label: "✅ Acceptée" },
                { value: "refusee", label: "❌ Refusée" },
              ]}]}
              renderRow={(d: any, i: number) => (
                <tr key={d.id} style={{ cursor: "pointer" }}>
                  <td><span style={{ fontWeight: 700, color: C.text }}>{d.service}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar prenom={d.user?.prenom} nom={d.user?.nom} size={30} color={C.blueM} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{d.user?.prenom} {d.user?.nom}</div>
                        <div style={{ fontSize: 11, color: C.textSub }}>{d.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{d.user?.startup?.nom_startup || "—"}</td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <StatusBadge statut={d.statut} />
                      {d.expert_assigne_id && (
                        <span style={{ fontSize: 10, color: C.purple, fontWeight: 700 }}>👤 Expert choisi</span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: C.textSub, fontSize: 12 }}>{new Date(d.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td>
                    <button className="btn btn-teal" style={{ fontSize: 12, padding: "6px 13px" }}
                      onClick={(e) => { e.stopPropagation(); onOpenDemande(d); }}>
                      ⚙️ Gérer
                    </button>
                  </td>
                </tr>
              )}
              emptyText="📭 Aucune demande trouvée"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function DashboardAdmin() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [realUser, setRealUser] = useState<any>(null);

  const [experts, setExperts] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [contactMsgs, setContactMsgs] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);
  const [medias, setMedias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ text: "", ok: true });

  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [selectedStartup, setSelectedStartup] = useState<any>(null);
  const [selectedDemande, setSelectedDemande] = useState<any>(null);
  const [commentaireAdmin, setCommentaireAdmin] = useState("");
  const [selectedExpertProfile, setSelectedExpertProfile] = useState<any>(null);
  const [selectedFormationValidation, setSelectedFormationValidation] = useState<any>(null);
  const [selectedPodcastValidation, setSelectedPodcastValidation] = useState<any>(null);
  const [showFormationForm, setShowFormationForm] = useState(false);
  const [editingFormation, setEditingFormation] = useState<any>(null);
  const [showPodcastForm, setShowPodcastForm] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<any>(null);

  const [hForm, setHForm] = useState<any>({});
  const [savingH, setSavingH] = useState(false);
  const [replyModal, setReplyModal] = useState<any>({ open: false, messageId: 0, email: "", nom: "", prenom: "" });
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [articleForm, setArticleForm] = useState<any>({ titre: "", description: "", type: "article", categorie: "", duree_lecture: "", statut: "brouillon", image: "" });
  const [articleImageFile, setArticleImageFile] = useState<File | null>(null);
  const [articlePdfFile, setArticlePdfFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [categorieAutre, setCategorieAutre] = useState(false);
  const [categoriePersonnalise, setCategoriePersonnalise] = useState("");
  const categoriesPredefinies = ["Développement","Intelligence artificielle","Business","Sécurité","Design","Autre"];

  const hf = (k: string) => hForm[k] || "";
  const setHF = (k: string, v: string) => setHForm((p: any) => ({ ...p, [k]: v }));
  const token = () => (typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "");
  const hdr = () => ({ Authorization: `Bearer ${token()}` });
  const hdrJ = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });
  function notify(text: string, ok = true) { setToast({ text, ok }); setTimeout(() => setToast({ text: "", ok: true }), 3200); }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = token();
    if (!t) { router.replace("/connexion"); return; }
    fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${t}` } })
      .then(async (res) => {
        if (!res.ok) { localStorage.removeItem("access_token"); router.replace("/connexion"); return; }
        const user = await res.json();
        if (user.role !== "admin") { localStorage.removeItem("access_token"); router.replace("/connexion"); return; }
        setRealUser(user);
        loadAll(); loadHistoire(); loadArticles(); loadContactMessages();
        loadFormations(); loadPodcasts(); loadDemandes(); loadMedias();
      })
      .catch(() => { localStorage.removeItem("access_token"); router.replace("/connexion"); })
      .finally(() => setLoadingAuth(false));
  }, []);

  async function loadAll() { setLoading(true); try { const [e, s, t] = await Promise.all([fetch(`${BASE}/admin/experts?_=${Date.now()}`, { headers: hdr() }).then(r => r.json()), fetch(`${BASE}/admin/startups?_=${Date.now()}`, { headers: hdr() }).then(r => r.json()), fetch(`${BASE}/temoignages/all?_=${Date.now()}`, { headers: hdr() }).then(r => r.json())]); setExperts(Array.isArray(e) ? e : []); setStartups(Array.isArray(s) ? s : []); setTemoignages(Array.isArray(t) ? t : []); } catch { notify("Erreur chargement", false); } setLoading(false); }
  async function loadFormations() { try { const r = await fetch(`${BASE}/formations/admin/all?_=${Date.now()}`, { headers: hdr() }); setFormations(r.ok ? await r.json() : []); } catch { setFormations([]); } }
  async function loadPodcasts() { try { const r = await fetch(`${BASE}/admin/podcasts/all?_=${Date.now()}`, { headers: hdr() }); setPodcasts(r.ok ? await r.json() : []); } catch { setPodcasts([]); } }
  async function loadDemandes() { try { const r = await fetch(`${BASE}/demandes-service/all?_=${Date.now()}`, { headers: hdr() }); setDemandes(r.ok ? await r.json() : []); } catch { setDemandes([]); } }
  async function loadHistoire() { try { const r = await fetch(`${BASE}/histoire?_=${Date.now()}`); if (r.ok) setHForm(await r.json()); } catch {} }
  async function loadArticles() { try { const r = await fetch(`${BASE}/articles/admin/all?_=${Date.now()}`, { headers: hdr() }); if (r.ok) setArticles(await r.json()); } catch {} }
  async function loadContactMessages() { try { const r = await fetch(`${BASE}/contact/messages?_=${Date.now()}`, { headers: hdr() }); if (r.ok) setContactMsgs(await r.json()); } catch {} }
  async function loadMedias() { try { const r = await fetch(`${BASE}/admin/medias/all`, { headers: hdr() }); setMedias(r.ok ? await r.json() : []); } catch { setMedias([]); } }

  async function valider(type: string, id: number) { const r = await fetch(`${BASE}/admin/${type}/${id}/valider`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("✅ Validé !"); setSelectedExpert(null); setSelectedStartup(null); loadAll(); } else notify("Erreur", false); }
  async function refuser(type: string, id: number) { const r = await fetch(`${BASE}/admin/${type}/${id}/refuser`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("Refusé"); setSelectedExpert(null); setSelectedStartup(null); loadAll(); } else notify("Erreur", false); }
  async function validerModification(id: number) { const r = await fetch(`${BASE}/experts/${id}/valider-modification`, { method: "PATCH", headers: hdr() }); if (r.ok) notify("✅ Modif validée"); else notify("Erreur", false); loadAll(); }
  async function refuserModification(id: number) { const r = await fetch(`${BASE}/experts/${id}/refuser-modification`, { method: "PATCH", headers: hdr() }); if (r.ok) notify("Modif refusée"); else notify("Erreur", false); loadAll(); }
  async function validerTemo(id: number) { const r = await fetch(`${BASE}/temoignages/${id}/valider`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("✅ Publié !"); loadAll(); } else notify("Erreur", false); }
  async function refuserTemo(id: number) { const r = await fetch(`${BASE}/temoignages/${id}/refuser`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("Refusé"); loadAll(); } else notify("Erreur", false); }
  async function supprimerTemo(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/temoignages/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) notify("Supprimé"); loadAll(); }
  async function marquerLu(id: number) { const r = await fetch(`${BASE}/contact/messages/${id}/lu`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("Lu"); loadContactMessages(); } else notify("Erreur", false); }
  async function supprimerMessage(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/contact/messages/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("Supprimé"); loadContactMessages(); } else notify("Erreur", false); }
  async function saveHistoire(e: React.FormEvent) { e.preventDefault(); setSavingH(true); try { const r = await fetch(`${BASE}/histoire`, { method: "PUT", headers: hdrJ(), body: JSON.stringify(hForm) }); if (r.ok) notify("✅ Mis à jour !"); else notify("Erreur", false); } catch { notify("Erreur réseau", false); } setSavingH(false); }
  async function envoyerReponse(e: React.FormEvent) { e.preventDefault(); if (!replyText.trim()) { notify("Écrivez une réponse", false); return; } setSendingReply(true); try { const r = await fetch(`${BASE}/contact/messages/${replyModal.messageId}/repondre`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ reponse: replyText }) }); if (r.ok) { notify("✅ Envoyé !"); setReplyModal({ open: false, messageId: 0, email: "", nom: "", prenom: "" }); setReplyText(""); loadContactMessages(); } else notify("Erreur", false); } catch { notify("Erreur", false); } setSendingReply(false); }

  // ---- Nouvelle logique demandes : pas de bouton "En cours" / "Terminée" / "Assigner" ----
  async function changerStatutDemande(id: number, statut: string) {
    const body: any = { statut };
    if (commentaireAdmin) body.commentaire_admin = commentaireAdmin;
    const r = await fetch(`${BASE}/demandes-service/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify(body) });
    if (r.ok) { notify(`✅ Statut mis à jour`); setSelectedDemande(null); setCommentaireAdmin(""); loadDemandes(); }
    else notify("Erreur", false);
  }
  async function accepterFormationDemande(demandeId: number) { const r = await fetch(`${BASE}/demandes-service/formation/${demandeId}/accept`, { method: "PATCH", headers: hdrJ() }); if (r.ok) { notify("✅ Acceptée"); setSelectedDemande(null); loadDemandes(); loadFormations(); } else notify("Erreur", false); }
  async function refuserFormationDemande(demandeId: number) { if (!confirm("Refuser ?")) return; const r = await fetch(`${BASE}/demandes-service/formation/${demandeId}/reject`, { method: "PATCH", headers: hdrJ() }); if (r.ok) { notify("Refusée"); setSelectedDemande(null); loadDemandes(); loadFormations(); } else notify("Erreur", false); }
  async function notifierExperts(demandeId: number, expertIds: number[]) { const r = await fetch(`${BASE}/demandes-service/${demandeId}/notifier-experts`, { method: "POST", headers: hdrJ(), body: JSON.stringify({ expert_ids: expertIds }) }); if (r.ok) notify(`✅ ${expertIds.length} expert(s) notifié(s)`); else notify("Erreur", false); loadDemandes(); }

  function getDemandeDomaine(demande: any): string { if (demande.domaine) return demande.domaine; const match = demande.description?.match(/\[Domaine:\s*([^\]]+)\]/i); return match ? match[1] : "Autre"; }

  async function publierFormationExpert(id: number) { try { let r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (!r.ok) r = await fetch(`${BASE}/formations/expert/statut/${id}`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (r.ok) { notify("✅ Formation publiée !"); setSelectedFormationValidation(null); await loadFormations(); } else notify("Erreur", false); } catch { notify("Erreur réseau", false); } }
  async function refuserFormationExpert(id: number) { if (!confirm("Refuser cette formation ?")) return; try { let r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) }); if (!r.ok) r = await fetch(`${BASE}/formations/expert/statut/${id}`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) }); if (r.ok) { notify("Formation refusée"); setSelectedFormationValidation(null); await loadFormations(); } else notify("Erreur", false); } catch { notify("Erreur réseau", false); } }
  async function publierPodcastExpert(id: number) { try { let r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (!r.ok) r = await fetch(`${BASE}/podcasts/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (r.ok) { notify("✅ Podcast publié !"); setSelectedPodcastValidation(null); await loadPodcasts(); } else notify("Erreur", false); } catch { notify("Erreur réseau", false); } }
  async function refuserPodcastExpert(id: number) { if (!confirm("Refuser ce podcast ?")) return; try { let r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) }); if (!r.ok) r = await fetch(`${BASE}/podcasts/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "refuse" }) }); if (r.ok) { notify("Podcast refusé"); setSelectedPodcastValidation(null); await loadPodcasts(); } else notify("Erreur", false); } catch { notify("Erreur réseau", false); } }
  async function publierFormation(id: number) { const r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (r.ok) notify("✅ Publiée"); else notify("Erreur", false); loadFormations(); }
  async function archiverFormation(id: number) { const r = await fetch(`${BASE}/formations/admin/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "archive" }) }); if (r.ok) notify("📦 Archivée"); else notify("Erreur", false); loadFormations(); }
  async function supprimerFormation(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/formations/admin/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("✅ Supprimée"); loadFormations(); } else notify("Erreur", false); }
  async function publierPodcast(id: number) { const r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "publie" }) }); if (r.ok) notify("✅ Publié"); else notify("Erreur", false); loadPodcasts(); }
  async function archiverPodcast(id: number) { const r = await fetch(`${BASE}/admin/podcasts/${id}/statut`, { method: "PATCH", headers: hdrJ(), body: JSON.stringify({ statut: "archive" }) }); if (r.ok) notify("📦 Archivé"); else notify("Erreur", false); loadPodcasts(); }
  async function supprimerPodcast(id: number) { if (!confirm("Supprimer ?")) return; let r = await fetch(`${BASE}/admin/podcasts/${id}`, { method: "DELETE", headers: hdr() }); if (!r.ok) r = await fetch(`${BASE}/podcasts/admin/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("✅ Supprimé"); loadPodcasts(); } else notify("Erreur", false); }

  function resetArticleForm() { setEditingArticle(null); setArticleImageFile(null); setArticlePdfFile(null); setImagePreview(""); setPdfName(""); setCategorieAutre(false); setCategoriePersonnalise(""); setArticleForm({ titre: "", description: "", type: "article", categorie: "", duree_lecture: "", statut: "brouillon", image: "" }); }
  function ouvrirEditionArticle(a: any) { setEditingArticle(a); setArticleForm({ titre: a.titre, description: a.description, type: a.type, categorie: a.categorie, duree_lecture: a.duree_lecture, statut: a.statut, image: a.image }); if (a.image) setImagePreview(`${BASE}/uploads/articles-img/${a.image}`); if (a.pdf) setPdfName(a.pdf); setCategorieAutre(!!a.categorie && !categoriesPredefinies.includes(a.categorie)); if (a.categorie && !categoriesPredefinies.includes(a.categorie)) setCategoriePersonnalise(a.categorie); setShowArticleModal(true); }
  async function sauvegarderArticle(e: React.FormEvent) { e.preventDefault(); let categorieFinale = articleForm.categorie; if (categorieAutre) { categorieFinale = categoriePersonnalise; if (!categorieFinale.trim()) { notify("Saisissez une catégorie", false); return; } } const fd = new FormData(); Object.entries(articleForm).forEach(([k, v]) => { if (v !== null && v !== undefined && k !== "categorie") fd.append(k, String(v)); }); fd.append("categorie", categorieFinale); if (articleImageFile) fd.append("image", articleImageFile); if (articlePdfFile) fd.append("pdf", articlePdfFile); const url = editingArticle ? `${BASE}/articles/admin/${editingArticle.id}` : `${BASE}/articles/admin/create`; const r = await fetch(url, { method: editingArticle ? "PUT" : "POST", headers: hdr(), body: fd }); if (r.ok) { notify(editingArticle ? "✅ Modifié" : "✅ Créé"); setShowArticleModal(false); resetArticleForm(); loadArticles(); } else notify("Erreur", false); }
  async function publierArticle(id: number) { const r = await fetch(`${BASE}/articles/admin/${id}/publier`, { method: "PATCH", headers: hdr() }); if (r.ok) { notify("✅ Publié"); loadArticles(); } else notify("Erreur", false); }
  async function supprimerArticle(id: number) { if (!confirm("Supprimer ?")) return; const r = await fetch(`${BASE}/articles/admin/${id}`, { method: "DELETE", headers: hdr() }); if (r.ok) { notify("Supprimé"); loadArticles(); } else notify("Erreur", false); }

  const enAttenteExperts = experts.filter(e => e.statut === "en_attente");
  const enAttenteStartups = startups.filter(s => s.statut === "en_attente");
  const modificationsAtt = experts.filter(e => e.modification_demandee);
  const temosAttente = temoignages.filter(t => t.statut === "en_attente");
  const msgsNonLus = contactMsgs.filter(m => !m.is_read).length;
  const brouillons = articles.filter(a => a.statut === "brouillon").length;
  const formationsEnAttenteExpert = formations.filter(f => f.statut === "en_attente" && f.expert_id);
  const podcastsEnAttenteExpert = podcasts.filter(p => p.statut === "en_attente" && (p.expert_id || p.expert));
  const toutes_formations_onglet = formations.filter(f => !(f.statut === "en_attente" && f.expert_id));
  const tous_podcasts_onglet = podcasts.filter(p => !(p.statut === "en_attente" && (p.expert_id || p.expert)));
  const totalNotifs = enAttenteExperts.length + enAttenteStartups.length + modificationsAtt.length + temosAttente.length + brouillons + formationsEnAttenteExpert.length + podcastsEnAttenteExpert.length + msgsNonLus + demandes.filter(d => d.statut === "en_attente").length;

  const navItems: { id: Tab; label: string; icon: string; count?: number; color: string }[] = [
    { id: "dashboard", label: "Tableau de bord", icon: "📊", color: C.teal },
    { id: "demandes", label: "Demandes", icon: "📋", count: demandes.filter(d => d.statut === "en_attente").length + formationsEnAttenteExpert.length + podcastsEnAttenteExpert.length, color: C.purple },
    { id: "experts", label: "Experts", icon: "🎯", count: enAttenteExperts.length, color: C.cyan },
    { id: "startups", label: "Startups", icon: "🚀", count: enAttenteStartups.length, color: C.orange },
    { id: "temoignages", label: "Témoignages", icon: "⭐", count: temosAttente.length, color: C.amber },
    { id: "contacts", label: "Messages", icon: "📩", count: msgsNonLus, color: C.greenM },
    { id: "histoire", label: "À propos", icon: "📖", color: C.textSub },
    { id: "blog", label: "Blog", icon: "📝", count: brouillons, color: C.blueM },
    { id: "formations", label: "Formations", icon: "📚", color: C.purple },
    { id: "podcasts", label: "Podcasts", icon: "🎙️", color: C.cyan },
    { id: "medias", label: "Médias & Vidéos", icon: "🎬", color: C.red },
  ];

  if (loadingAuth) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: `4px solid ${C.teal}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 18px" }} />
        <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>Vérification des accès...</div>
      </div>
    </div>
  );
  if (!realUser || realUser.role !== "admin") return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.text};}
        .inp{width:100%;padding:9px 13px;border:1.5px solid ${C.border};border-radius:9px;font-family:'DM Sans',sans-serif;font-size:13px;transition:all .18s;background:#FAFCFE;color:${C.text};outline:none;}
        .inp:focus{border-color:${C.teal};box-shadow:0 0 0 3px ${C.teal}18;}
        textarea.inp{resize:vertical;}
        select.inp{cursor:pointer;}
        .lbl{font-size:10.5px;font-weight:700;color:${C.textSub};text-transform:uppercase;letter-spacing:1.2px;display:block;margin-bottom:5px;}
        .btn{font-family:'DM Sans',sans-serif;font-weight:600;border:none;border-radius:9px;cursor:pointer;padding:8px 15px;font-size:13px;transition:all .16s;display:inline-flex;align-items:center;gap:6px;line-height:1.4;}
        .btn-teal{background:${C.teal};color:#fff;}.btn-teal:hover{background:${C.tealD};}
        .btn-green{background:${C.greenL};color:${C.green};}.btn-green:hover{background:${C.greenM};color:#fff;}
        .btn-red{background:${C.redL};color:${C.red};}.btn-red:hover{background:${C.red};color:#fff;}
        .btn-blue{background:${C.blueL};color:${C.blue};}.btn-blue:hover{background:${C.blue};color:#fff;}
        .btn-cyan{background:${C.cyan};color:#fff;}.btn-cyan:hover{opacity:.9;}
        .btn-gray{background:#F1F5F9;color:${C.textSub};}.btn-gray:hover{background:${C.border};}
        .btn-orange{background:${C.orange};color:#fff;}.btn-orange:hover{opacity:.9;}
        .modal-bg{position:fixed;inset:0;background:rgba(27,58,75,.55);z-index:500;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(5px);}
        .modal{background:#fff;border-radius:20px;width:100%;max-width:700px;max-height:92vh;overflow-y:auto;box-shadow:0 28px 70px rgba(27,58,75,.22);}
        .upload-zone{display:block;border:2px dashed ${C.border};border-radius:10px;padding:16px;background:#F8FAFC;cursor:pointer;text-align:center;transition:border-color .2s;}
        .upload-zone:hover{border-color:${C.teal};}
        table{width:100%;border-collapse:collapse;}
        th{text-align:left;font-size:10.5px;font-weight:700;color:${C.textSub};text-transform:uppercase;padding:10px 15px;border-bottom:1.5px solid ${C.border};letter-spacing:.7px;white-space:nowrap;}
        td{padding:12px 15px;border-bottom:1px solid #F6F9FC;font-size:13px;color:${C.text};vertical-align:middle;}
        tr:last-child td{border-bottom:none;}
        tr:hover td{background:#F8FBFE;}
        ::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${C.border};border-radius:99px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
        .fade-in{animation:fadeIn .25s ease;}
      `}</style>

      {toast.text && (
        <div style={{ position: "fixed", top: 18, right: 18, zIndex: 9999, background: C.white, border: `1px solid ${toast.ok ? C.greenM + "50" : C.red + "50"}`, borderLeft: `4px solid ${toast.ok ? C.greenM : C.red}`, color: toast.ok ? C.green : C.red, borderRadius: 12, padding: "13px 18px", fontWeight: 700, fontSize: 13, boxShadow: "0 10px 36px rgba(0,0,0,.09)", maxWidth: 360, animation: "slideIn .2s ease" }}>
          {toast.text}
        </div>
      )}

      {selectedExpert && <ModalExpertDetail expert={selectedExpert} onClose={() => setSelectedExpert(null)} onValider={(id: number) => valider("experts", id)} onRefuser={(id: number) => refuser("experts", id)} />}
      {selectedStartup && <ModalStartupDetail startup={selectedStartup} onClose={() => setSelectedStartup(null)} onValider={(id: number) => valider("startups", id)} onRefuser={(id: number) => refuser("startups", id)} />}
      {selectedDemande && (
        <ModalDemandeService
          demande={selectedDemande}
          experts={experts}
          commentaireAdmin={commentaireAdmin}
          setCommentaireAdmin={setCommentaireAdmin}
          onChangerStatut={changerStatutDemande}
          onNotifierExperts={notifierExperts}
          onAccepterFormation={accepterFormationDemande}
          onRefuserFormation={refuserFormationDemande}
          onClose={() => { setSelectedDemande(null); setCommentaireAdmin(""); }}
          getDemandeDomaine={getDemandeDomaine}
          setSelectedExpertProfile={setSelectedExpertProfile}
          fetchDemandeMaj={() => loadDemandes()}
        />
      )}
      {selectedExpertProfile && <ModalExpertDetail expert={selectedExpertProfile} onClose={() => setSelectedExpertProfile(null)} onValider={(id: number) => valider("experts", id)} onRefuser={(id: number) => refuser("experts", id)} />}
      {showFormationForm && <FormationFormModal formation={editingFormation} onClose={() => { setShowFormationForm(false); setEditingFormation(null); }} onSave={() => loadFormations()} />}
      {showPodcastForm && <PodcastFormModal podcast={editingPodcast} onClose={() => { setShowPodcastForm(false); setEditingPodcast(null); }} onSave={() => loadPodcasts()} />}

      {showArticleModal && (
        <div className="modal-bg" onClick={() => { setShowArticleModal(false); resetArticleForm(); }}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={(e: any) => e.stopPropagation()}>
            <div style={{ background: `linear-gradient(135deg, ${C.sidebar}, ${C.blueM})`, padding: "20px 24px", borderRadius: "20px 20px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>{editingArticle ? "✏️ Modifier l'article" : "📝 Nouvel article"}</div>
              <button className="btn btn-gray" style={{ padding: "5px 10px", color: "#fff", background: "rgba(255,255,255,.15)", border: "none" }} onClick={() => { setShowArticleModal(false); resetArticleForm(); }}>✕</button>
            </div>
            <form onSubmit={sauvegarderArticle} style={{ padding: "24px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1/-1" }}><label className="lbl">Titre *</label><input className="inp" required value={articleForm.titre} onChange={e => setArticleForm({ ...articleForm, titre: e.target.value })} /></div>
                <div><label className="lbl">Type</label><select className="inp" value={articleForm.type} onChange={e => setArticleForm({ ...articleForm, type: e.target.value })}><option value="article">Article</option><option value="conseil">Conseil</option></select></div>
                <div><label className="lbl">Catégorie</label>
                  <select className="inp" value={categorieAutre ? "Autre" : (articleForm.categorie || "")} onChange={(e) => { const val = e.target.value; if (val === "Autre") { setCategorieAutre(true); setArticleForm({ ...articleForm, categorie: "" }); } else { setCategorieAutre(false); setArticleForm({ ...articleForm, categorie: val }); } }}>
                    <option value="">Sélectionner</option>{categoriesPredefinies.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {categorieAutre && <input type="text" className="inp" style={{ marginTop: 8 }} placeholder="Catégorie personnalisée" value={categoriePersonnalise} onChange={e => setCategoriePersonnalise(e.target.value)} />}
                </div>
                <div><label className="lbl">Durée de lecture</label><input className="inp" value={articleForm.duree_lecture} onChange={e => setArticleForm({ ...articleForm, duree_lecture: e.target.value })} placeholder="5 min" /></div>
                <div><label className="lbl">Statut</label><select className="inp" value={articleForm.statut} onChange={e => setArticleForm({ ...articleForm, statut: e.target.value })}><option value="brouillon">📝 Brouillon</option><option value="publie">✅ Publié</option></select></div>
                <div style={{ gridColumn: "1/-1" }}><label className="lbl">Description *</label><textarea className="inp" required rows={3} value={articleForm.description} onChange={e => setArticleForm({ ...articleForm, description: e.target.value })} /></div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-gray" onClick={() => { setShowArticleModal(false); resetArticleForm(); }}>Annuler</button>
                <button type="submit" className="btn btn-teal">{editingArticle ? "💾 Enregistrer" : "✅ Créer l'article"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {replyModal.open && (
        <div className="modal-bg" onClick={() => setReplyModal({ ...replyModal, open: false })}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={(e: any) => e.stopPropagation()}>
            <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FAFCFE", borderRadius: "20px 20px 0 0" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>✉️ Répondre à {replyModal.prenom} {replyModal.nom}</span>
              <button className="btn btn-gray" style={{ padding: "5px 10px" }} onClick={() => setReplyModal({ ...replyModal, open: false })}>✕</button>
            </div>
            <form onSubmit={envoyerReponse} style={{ padding: "22px 24px" }}>
              <div style={{ marginBottom: 12 }}><label className="lbl">Email</label><input className="inp" value={replyModal.email} disabled /></div>
              <div style={{ marginBottom: 16 }}><label className="lbl">Votre réponse *</label><textarea className="inp" rows={6} value={replyText} onChange={e => setReplyText(e.target.value)} required /></div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-gray" onClick={() => setReplyModal({ ...replyModal, open: false })}>Annuler</button>
                <button type="submit" className="btn btn-teal" disabled={sendingReply}>{sendingReply ? "⏳ Envoi..." : "📤 Envoyer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* SIDEBAR */}
        <aside style={{ width: sideCollapsed ? 64 : 230, background: C.sidebar, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0, transition: "width .22s cubic-bezier(.22,1,.36,1)", overflow: "hidden" }}>
          <div style={{ padding: "20px 14px 16px", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${C.teal}, ${C.blueM})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 11, flexShrink: 0 }}>BEH</div>
            {!sideCollapsed && (
              <div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>Admin Panel</div>
                <div style={{ color: "rgba(255,255,255,.3)", fontSize: 10 }}>Business Expert Hub</div>
              </div>
            )}
          </div>
          <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
            {navItems.map(item => {
              const isActive = tab === item.id;
              return (
                <button key={item.id} onClick={() => setTab(item.id)} title={sideCollapsed ? item.label : ""}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12.5, fontWeight: isActive ? 700 : 500, color: isActive ? "#fff" : "rgba(255,255,255,.42)", background: isActive ? `${item.color}22` : "transparent", transition: "all .15s", marginBottom: 2, justifyContent: sideCollapsed ? "center" : "flex-start", position: "relative", outline: "none" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  {!sideCollapsed && <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>}
                  {item.count != null && item.count > 0 && (
                    <span style={{ background: item.color, color: "#fff", borderRadius: 99, padding: sideCollapsed ? "0 4px" : "1px 7px", fontSize: 9.5, fontWeight: 800, lineHeight: 1.75, position: sideCollapsed ? "absolute" : "static", top: sideCollapsed ? 3 : undefined, right: sideCollapsed ? 3 : undefined, minWidth: 16, textAlign: "center" }}>{item.count}</span>
                  )}
                  {isActive && <div style={{ position: "absolute", left: 0, top: "18%", bottom: "18%", width: 3, background: item.color, borderRadius: "0 3px 3px 0" }} />}
                </button>
              );
            })}
          </nav>
          <div style={{ padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,.07)" }}>
            {realUser && !sideCollapsed && (
              <div style={{ padding: "9px 11px", borderRadius: 10, background: "rgba(255,255,255,.05)", marginBottom: 7, display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}, ${C.blueM})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{realUser.prenom?.[0]}{realUser.nom?.[0]}</div>
                <div><div style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{realUser.prenom} {realUser.nom}</div><div style={{ color: "rgba(255,255,255,.3)", fontSize: 9.5 }}>Administrateur</div></div>
              </div>
            )}
            <button onClick={() => setSideCollapsed(!sideCollapsed)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: sideCollapsed ? "center" : "flex-start", gap: 9, padding: "7px 11px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11.5, color: "rgba(255,255,255,.28)", background: "transparent", marginBottom: 3 }}>
              <span style={{ fontSize: 13 }}>{sideCollapsed ? "→" : "←"}</span>{!sideCollapsed && <span>Réduire</span>}
            </button>
            <button onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("user"); router.push("/"); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: sideCollapsed ? "center" : "flex-start", gap: 9, padding: "7px 11px", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11.5, color: "rgba(255,255,255,.28)", background: "transparent" }}>
              <span style={{ fontSize: 13 }}>🚪</span>{!sideCollapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 0 #DDE3EA" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 17 }}>{navItems.find(n => n.id === tab)?.icon}</span>
              <span style={{ fontWeight: 800, fontSize: 14.5, color: C.text }}>{navItems.find(n => n.id === tab)?.label}</span>
            </div>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              {totalNotifs > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, background: C.amberL, color: "#92400E", border: `1px solid ${C.amber}55`, borderRadius: 99, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
                  <FaBell size={10} /> {totalNotifs} notification{totalNotifs > 1 ? "s" : ""}
                </div>
              )}
              <button className="btn btn-gray" style={{ fontSize: 12, gap: 5 }} onClick={() => { loadAll(); loadDemandes(); loadArticles(); loadFormations(); loadPodcasts(); loadContactMessages(); loadMedias(); }}>
                <FaSync size={10} /> Actualiser
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 80, textAlign: "center", color: C.textSub, fontSize: 14 }}>
              <div style={{ width: 38, height: 38, border: `3px solid ${C.teal}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
              Chargement...
            </div>
          ) : (
            <div className="fade-in">
              {tab === "dashboard" && (
                <BIDashboardView experts={experts} startups={startups} temoignages={temoignages} demandes={demandes} formationsProposees={formationsEnAttenteExpert} podcastsProposees={podcastsEnAttenteExpert} formations={formations} podcasts={podcasts} articles={articles} setTab={setTab} />
              )}

              {tab === "demandes" && (
                <DemandesView demandes={demandes} formations={formations} podcasts={podcasts} experts={experts} formationsEnAttenteExpert={formationsEnAttenteExpert} podcastsEnAttenteExpert={podcastsEnAttenteExpert}
                  onOpenDemande={(d: any) => { setSelectedDemande(d); setCommentaireAdmin(d.commentaire_admin || ""); }}
                  onPublierFormationExpert={publierFormationExpert} onRefuserFormationExpert={refuserFormationExpert}
                  onPublierPodcastExpert={publierPodcastExpert} onRefuserPodcastExpert={refuserPodcastExpert}
                  onSetFormationValidation={setSelectedFormationValidation} onSetPodcastValidation={setSelectedPodcastValidation} />
              )}

              {tab === "experts" && (
                <div style={{ padding: "26px 28px" }}>
                  {modificationsAtt.length > 0 && (
                    <div style={{ background: C.amberL, border: `1px solid ${C.amber}55`, borderRadius: 14, padding: "16px 20px", marginBottom: 18 }}>
                      <div style={{ fontWeight: 700, color: "#92400E", fontSize: 13.5, marginBottom: 11 }}>⚠️ Modifications en attente ({modificationsAtt.length})</div>
                      {modificationsAtt.map((e: any) => (
                        <div key={e.id} style={{ background: C.white, borderRadius: 10, padding: "11px 13px", marginBottom: 7, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Avatar prenom={e.user?.prenom} nom={e.user?.nom} size={34} color={C.amber} />
                            <div><div style={{ fontWeight: 600, fontSize: 13 }}>{e.user?.prenom} {e.user?.nom}</div><div style={{ fontSize: 11, color: C.textSub }}>{e.user?.email}</div></div>
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => validerModification(e.id)}>✅ Valider</button>
                            <button className="btn btn-red" style={{ fontSize: 12 }} onClick={() => refuserModification(e.id)}>❌ Refuser</button>
                            <button className="btn btn-blue" style={{ fontSize: 12 }} onClick={() => setSelectedExpert(e)}>👁 Voir</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <DataTable
                    title={`🎯 Experts — ${experts.length} total · ${enAttenteExperts.length} en attente`}
                    columns={[
                      { key: "user.prenom", label: "Expert", sortable: true },
                      { key: "user.email", label: "Email", sortable: true },
                      { key: "domaine", label: "Domaine", sortable: true },
                      { key: "localisation", label: "Localisation" },
                      { key: "statut", label: "Statut", sortable: true },
                      { key: "actions", label: "Actions" },
                    ]}
                    data={experts}
                    searchKeys={["user.prenom", "user.nom", "user.email", "domaine", "localisation"]}
                    filters={[
                      { key: "statut", label: "Filtrer par statut", options: [{ value: "valide", label: "✅ Validé" }, { value: "en_attente", label: "⏳ En attente" }, { value: "refuse", label: "❌ Refusé" }] },
                      { key: "domaine", label: "Tous les domaines", options: [...new Set(experts.map((e: any) => e.domaine).filter(Boolean))].map(d => ({ value: d, label: d })) }
                    ]}
                    renderRow={(e: any) => (
                      <tr key={e.id}>
                        <td><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar prenom={e.user?.prenom} nom={e.user?.nom} size={32} color={C.teal} /><div style={{ fontWeight: 700, fontSize: 13 }}>{e.user?.prenom} {e.user?.nom}</div></div></td>
                        <td style={{ color: C.textSub, fontSize: 12 }}>{e.user?.email}</td>
                        <td><span style={{ background: `${C.teal}12`, color: C.tealD, borderRadius: 6, padding: "2px 9px", fontSize: 12, fontWeight: 600 }}>{e.domaine || "—"}</span></td>
                        <td style={{ color: C.textSub, fontSize: 12 }}>{e.localisation || "—"}</td>
                        <td><StatusBadge statut={e.statut} /></td>
                        <td><div style={{ display: "flex", gap: 5 }}>
                          <button className="btn btn-blue" style={{ fontSize: 12, padding: "5px 11px" }} onClick={() => setSelectedExpert(e)}>👁 Voir</button>
                          {e.statut === "en_attente" && (<><button className="btn btn-green" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => valider("experts", e.id)}>✅</button><button className="btn btn-red" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => refuser("experts", e.id)}>❌</button></>)}
                        </div></td>
                      </tr>
                    )}
                    emptyText="🎯 Aucun expert enregistré"
                  />
                </div>
              )}

              {tab === "startups" && (
                <div style={{ padding: "26px 28px" }}>
                  <DataTable
                    title={`🚀 Startups — ${startups.length} total · ${enAttenteStartups.length} en attente`}
                    columns={[
                      { key: "user.prenom", label: "Responsable", sortable: true },
                      { key: "user.email", label: "Email" },
                      { key: "nom_startup", label: "Startup", sortable: true },
                      { key: "secteur", label: "Secteur", sortable: true },
                      { key: "taille", label: "Taille" },
                      { key: "statut", label: "Statut", sortable: true },
                      { key: "actions", label: "Actions" },
                    ]}
                    data={startups}
                    searchKeys={["user.prenom", "user.nom", "user.email", "nom_startup", "secteur"]}
                    filters={[
                      { key: "statut", label: "Filtrer par statut", options: [{ value: "valide", label: "✅ Validé" }, { value: "en_attente", label: "⏳ En attente" }, { value: "refuse", label: "❌ Refusé" }] },
                      { key: "secteur", label: "Tous les secteurs", options: [...new Set(startups.map((s: any) => s.secteur).filter(Boolean))].map(d => ({ value: d, label: d })) }
                    ]}
                    renderRow={(s: any) => (
                      <tr key={s.id}>
                        <td><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Avatar prenom={s.user?.prenom} nom={s.user?.nom} size={32} color={C.orange} /><span style={{ fontWeight: 700, fontSize: 13 }}>{s.user?.prenom} {s.user?.nom}</span></div></td>
                        <td style={{ color: C.textSub, fontSize: 12 }}>{s.user?.email}</td>
                        <td style={{ fontWeight: 700 }}>{s.nom_startup || "—"}</td>
                        <td><span style={{ background: `${C.orange}12`, color: C.orange, borderRadius: 6, padding: "2px 9px", fontSize: 12, fontWeight: 600 }}>{s.secteur || "—"}</span></td>
                        <td style={{ color: C.textSub }}>{s.taille || "—"}</td>
                        <td><StatusBadge statut={s.statut} /></td>
                        <td><div style={{ display: "flex", gap: 5 }}>
                          <button className="btn btn-blue" style={{ fontSize: 12, padding: "5px 11px" }} onClick={() => setSelectedStartup(s)}>👁 Voir</button>
                          {s.statut === "en_attente" && (<><button className="btn btn-green" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => valider("startups", s.id)}>✅</button><button className="btn btn-red" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => refuser("startups", s.id)}>❌</button></>)}
                        </div></td>
                      </tr>
                    )}
                    emptyText="🚀 Aucune startup enregistrée"
                  />
                </div>
              )}

              {tab === "temoignages" && (
                <div style={{ padding: "26px 28px" }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Satisfaction clients</div>
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: C.text }}>⭐ Témoignages ({temoignages.length})</h1>
                  </div>
                  {temoignages.length === 0 ? (
                    <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 14, padding: "56px 0", textAlign: "center", color: C.textSub }}>⭐ Aucun témoignage</div>
                  ) : temoignages.map((t: any) => (
                    <div key={t.id} style={{ background: C.white, border: `2px solid ${t.statut === "en_attente" ? C.amber + "40" : t.statut === "valide" ? C.greenM + "30" : C.border}`, borderRadius: 13, padding: "16px 18px", marginBottom: 11, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                          <Avatar prenom={t.user?.prenom} nom={t.user?.nom} size={36} color={C.amber} />
                          <div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.user?.prenom} {t.user?.nom}</div><div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= (t.note || 5) ? C.amber : C.border, fontSize: 13 }}>★</span>)}<span style={{ fontSize: 11, color: C.textSub }}>· {new Date(t.createdAt).toLocaleDateString("fr-FR")}</span></div></div>
                        </div>
                        <div style={{ background: "#F8FAFC", borderRadius: 9, padding: "11px 13px" }}><p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.72, fontStyle: "italic", margin: 0 }}>"{t.texte}"</p></div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end" }}>
                        <StatusBadge statut={t.statut === "valide" ? "publie" : t.statut === "refuse" ? "refuse" : "en_attente"} />
                        <div style={{ display: "flex", gap: 5 }}>
                          {t.statut === "en_attente" && (<><button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => validerTemo(t.id)}>✅ Publier</button><button className="btn btn-red" style={{ fontSize: 12 }} onClick={() => refuserTemo(t.id)}>❌</button></>)}
                          <button className="btn btn-gray" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => supprimerTemo(t.id)}>🗑</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "contacts" && (
                <div style={{ padding: "26px 28px" }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.greenM, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>Support client</div>
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: C.text }}>📩 Messages ({contactMsgs.length}) · <span style={{ color: C.greenM }}>{msgsNonLus} non lus</span></h1>
                  </div>
                  {contactMsgs.length === 0 ? (
                    <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 14, padding: "56px 0", textAlign: "center", color: C.textSub }}>📭 Aucun message</div>
                  ) : contactMsgs.map((msg: any) => (
                    <div key={msg.id} style={{ background: C.white, border: `2px solid ${msg.is_read ? C.border : C.greenM + "35"}`, borderRadius: 13, padding: "16px 18px", marginBottom: 11, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 9 }}>
                          <Avatar prenom={msg.prenom} nom={msg.nom} size={40} color={C.greenM} />
                          <div><div style={{ fontWeight: 700, fontSize: 14 }}>{msg.prenom} {msg.nom}</div><div style={{ fontSize: 11.5, color: C.textSub }}>{msg.email}</div></div>
                          {!msg.is_read && <span style={{ background: C.greenL, color: C.green, borderRadius: 99, padding: "2px 9px", fontSize: 10.5, fontWeight: 700 }}>NOUVEAU</span>}
                        </div>
                        <div style={{ background: "#F8FAFC", borderRadius: 9, padding: "11px 13px", marginBottom: 7 }}>
                          <div style={{ fontSize: 12, color: C.textSub, marginBottom: 5 }}>📌 <strong>{msg.subject}</strong></div>
                          <p style={{ fontSize: 13.5, color: "#334155", lineHeight: 1.7, margin: 0 }}>{msg.message}</p>
                        </div>
                        {msg.admin_reply && (
                          <div style={{ background: C.blueL, borderRadius: 9, padding: "11px 13px", borderLeft: `3px solid ${C.blueM}` }}>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: C.blue, marginBottom: 4 }}>✉️ Réponse envoyée</div>
                            <p style={{ fontSize: 13, color: "#1E3A8A", lineHeight: 1.7, margin: 0 }}>{msg.admin_reply}</p>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexDirection: "column", alignItems: "flex-end" }}>
                        {!msg.is_read && <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => marquerLu(msg.id)}>✅ Lu</button>}
                        <button className="btn btn-blue" style={{ fontSize: 12 }} onClick={() => setReplyModal({ open: true, messageId: msg.id, email: msg.email, nom: msg.nom, prenom: msg.prenom })}>✉️ Répondre</button>
                        <button className="btn btn-red" style={{ fontSize: 12 }} onClick={() => supprimerMessage(msg.id)}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "histoire" && (
                <div style={{ padding: "26px 28px" }}>
                  <div style={{ marginBottom: 22 }}><h1 style={{ fontSize: 20, fontWeight: 900, color: C.text }}>📖 Page "À propos"</h1></div>
                  <form onSubmit={saveHistoire}>
                    <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
                      <div style={{ padding: "13px 18px", borderBottom: `1px solid ${C.border}`, background: "#FAFCFE" }}><span style={{ fontWeight: 700, fontSize: 13.5 }}>🏠 Section Héro</span></div>
                      <div style={{ padding: "15px 18px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14 }}><HField label="Année de création" cle="annee_creation" hf={hf} setHF={setHF} placeholder="2019" /></div>
                        <HField label="Description héro" cle="description_hero" rows={3} hf={hf} setHF={setHF} />
                      </div>
                    </div>
                    <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
                      <div style={{ padding: "13px 18px", borderBottom: `1px solid ${C.border}`, background: "#FAFCFE" }}><span style={{ fontWeight: 700, fontSize: 13.5 }}>👁 Vision</span></div>
                      <div style={{ padding: "15px 18px" }}>
                        <HField label="Description vision" cle="description_vision" rows={3} hf={hf} setHF={setHF} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>{[1,2,3,4].map(n => <HField key={n} label={`Point ${n}`} cle={`vision_point${n}`} hf={hf} setHF={setHF} />)}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 11 }}>
                      <button type="button" className="btn btn-gray" onClick={loadHistoire}>🔄 Annuler</button>
                      <button type="submit" className="btn btn-teal" disabled={savingH} style={{ padding: "10px 26px", fontSize: 13.5 }}>{savingH ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}</button>
                    </div>
                  </form>
                </div>
              )}

              {tab === "blog" && (
                <div style={{ padding: "26px 28px" }}>
                  <DataTable
                    title={`📝 Blog — ${articles.length} articles`}
                    columns={[
                      { key: "titre", label: "Titre", sortable: true },
                      { key: "type", label: "Type", sortable: true },
                      { key: "categorie", label: "Catégorie", sortable: true },
                      { key: "duree_lecture", label: "Durée" },
                      { key: "statut", label: "Statut", sortable: true },
                      { key: "actions", label: "Actions" },
                    ]}
                    data={articles}
                    searchKeys={["titre", "description", "categorie"]}
                    filters={[
                      { key: "statut", label: "Filtrer", options: [{ value: "publie", label: "✅ Publié" }, { value: "brouillon", label: "📝 Brouillon" }, { value: "archive", label: "📦 Archivé" }] },
                      { key: "type", label: "Type", options: [{ value: "article", label: "Article" }, { value: "conseil", label: "Conseil" }] }
                    ]}
                    actions={<button className="btn btn-teal" style={{ fontSize: 12 }} onClick={() => { resetArticleForm(); setShowArticleModal(true); }}>📝 Nouvel article</button>}
                    renderRow={(a: any) => (
                      <tr key={a.id}>
                        <td><div style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{a.titre}</div><div style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>{a.description?.slice(0, 60)}...</div></td>
                        <td><span style={{ background: C.blueL, color: C.blue, borderRadius: 6, padding: "2px 9px", fontSize: 12, fontWeight: 600 }}>{a.type}</span></td>
                        <td style={{ color: C.textSub }}>{a.categorie || "—"}</td>
                        <td style={{ color: C.textSub, fontSize: 12 }}>{a.duree_lecture || "—"}</td>
                        <td><StatusBadge statut={a.statut} /></td>
                        <td><div style={{ display: "flex", gap: 5 }}>
                          {a.statut === "brouillon" && <button className="btn btn-green" style={{ fontSize: 12 }} onClick={() => publierArticle(a.id)}>✅ Publier</button>}
                          <button className="btn btn-blue" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => ouvrirEditionArticle(a)}>✏️</button>
                          <button className="btn btn-red" style={{ fontSize: 12, padding: "5px 9px" }} onClick={() => supprimerArticle(a.id)}>🗑</button>
                        </div></td>
                      </tr>
                    )}
                    emptyText="📝 Aucun article"
                  />
                </div>
              )}

              {tab === "formations" && (
                <div style={{ padding: "26px 28px" }}>
                  <DataTable
                    title={`📚 Formations — ${toutes_formations_onglet.length} au total`}
                    columns={[
                      { key: "titre", label: "Formation", sortable: true },
                      { key: "domaine", label: "Domaine", sortable: true },
                      { key: "formateur", label: "Formateur" },
                      { key: "mode", label: "Mode", sortable: true },
                      { key: "prix", label: "Prix" },
                      { key: "statut", label: "Statut", sortable: true },
                      { key: "actions", label: "Actions" },
                    ]}
                    data={toutes_formations_onglet}
                    searchKeys={["titre", "domaine", "formateur", "description"]}
                    filters={[
                      { key: "statut", label: "Tous les statuts", options: [{ value: "publie", label: "✅ Publié" }, { value: "brouillon", label: "📝 Brouillon" }, { value: "archive", label: "📦 Archivé" }] },
                      { key: "mode", label: "Tous les modes", options: [{ value: "en_ligne", label: "💻 En ligne" }, { value: "presentiel", label: "🏢 Présentiel" }, { value: "hybride", label: "🌐 Hybride" }] },
                      { key: "domaine", label: "Tous les domaines", options: [...new Set(toutes_formations_onglet.map((f: any) => f.domaine).filter(Boolean))].map(d => ({ value: d, label: d })) },
                    ]}
                    actions={<button className="btn btn-teal" style={{ fontSize: 12 }} onClick={() => { setEditingFormation(null); setShowFormationForm(true); }}>➕ Ajouter</button>}
                    renderRow={(f: any) => (
                      <tr key={f.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            {f.image ? <img src={`${BASE}/uploads/formations/${f.image}`} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} alt="" /> : <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${C.purple}, #5B21B6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📚</div>}
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{f.titre}</div>
                              {f.expert_id && <span style={{ background: C.purple, color: "#fff", borderRadius: 99, padding: "1px 7px", fontSize: 8.5, fontWeight: 700 }}>EXPERT</span>}
                            </div>
                          </div>
                        </td>
                        <td><span style={{ background: `${C.purple}12`, color: C.purple, borderRadius: 6, padding: "2px 9px", fontSize: 12, fontWeight: 600 }}>{f.domaine || "—"}</span></td>
                        <td style={{ color: C.textSub, fontSize: 12 }}>{f.formateur || "—"}</td>
                        <td style={{ color: C.textSub, fontSize: 12 }}>{f.mode === "en_ligne" ? "💻 En ligne" : f.mode === "presentiel" ? "🏢 Présentiel" : f.mode || "—"}</td>
                        <td style={{ fontWeight: 600 }}>{f.gratuit ? <span style={{ color: C.greenM }}>Gratuit</span> : f.prix ? `${f.prix} DT` : "—"}</td>
                        <td><StatusBadge statut={f.statut} /></td>
                        <td><div style={{ display: "flex", gap: 4 }}>
                          {f.statut !== "publie" && <button className="btn btn-green" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => publierFormation(f.id)}>✅</button>}
                          {f.statut === "publie" && <button className="btn btn-gray" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => archiverFormation(f.id)}>📦</button>}
                          {!f.expert_id && <button className="btn btn-blue" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => { setEditingFormation(f); setShowFormationForm(true); }}>✏️</button>}
                          <button className="btn btn-red" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => supprimerFormation(f.id)}>🗑</button>
                        </div></td>
                      </tr>
                    )}
                    emptyText="📚 Aucune formation"
                  />
                </div>
              )}

              {tab === "podcasts" && (
                <div style={{ padding: "26px 28px" }}>
                  <DataTable
                    title={`🎙️ Podcasts — ${tous_podcasts_onglet.length} au total`}
                    columns={[
                      { key: "titre", label: "Podcast", sortable: true },
                      { key: "auteur", label: "Auteur", sortable: true },
                      { key: "domaine", label: "Domaine", sortable: true },
                      { key: "statut", label: "Statut", sortable: true },
                      { key: "actions", label: "Actions" },
                    ]}
                    data={tous_podcasts_onglet}
                    searchKeys={["titre", "auteur", "domaine", "description"]}
                    filters={[
                      { key: "statut", label: "Tous les statuts", options: [{ value: "publie", label: "✅ Publié" }, { value: "brouillon", label: "📝 Brouillon" }, { value: "archive", label: "📦 Archivé" }] },
                      { key: "domaine", label: "Tous les domaines", options: [...new Set(tous_podcasts_onglet.map((p: any) => p.domaine).filter(Boolean))].map(d => ({ value: d, label: d })) },
                    ]}
                    actions={<button className="btn btn-cyan" style={{ fontSize: 12 }} onClick={() => { setEditingPodcast(null); setShowPodcastForm(true); }}>➕ Ajouter</button>}
                    renderRow={(p: any) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", background: `linear-gradient(135deg, ${C.cyan}, ${C.cyan}99)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {p.image ? <img src={`${BASE}/uploads/podcasts-images/${p.image}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ color: "#fff", fontSize: 15 }}>🎙️</span>}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{p.titre}</div>
                              {(p.expert_id || p.expert) && <span style={{ background: C.cyan, color: "#fff", borderRadius: 99, padding: "1px 7px", fontSize: 8.5, fontWeight: 700 }}>EXPERT</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ color: C.textSub }}>{p.auteur || "—"}</td>
                        <td><span style={{ background: `${C.cyan}12`, color: C.cyan, borderRadius: 6, padding: "2px 9px", fontSize: 12, fontWeight: 600 }}>{p.domaine || "—"}</span></td>
                        <td><StatusBadge statut={p.statut} /></td>
                        <td><div style={{ display: "flex", gap: 4 }}>
                          {p.statut !== "publie" && <button className="btn btn-green" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => publierPodcast(p.id)}>✅</button>}
                          {p.statut === "publie" && <button className="btn btn-gray" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => archiverPodcast(p.id)}>📦</button>}
                          {!(p.expert_id || p.expert) && <button className="btn btn-blue" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => { setEditingPodcast(p); setShowPodcastForm(true); }}>✏️</button>}
                          <button className="btn btn-red" style={{ fontSize: 11, padding: "4px 9px" }} onClick={() => supprimerPodcast(p.id)}>🗑</button>
                        </div></td>
                      </tr>
                    )}
                    emptyText="🎙️ Aucun podcast"
                  />
                </div>
              )}

              {tab === "medias" && (
                <div style={{ padding: "26px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 900, color: C.text }}>🎬 Médias & Vidéos ({medias.length})</h1>
                    <button className="btn btn-teal" onClick={() => alert("Modale ajout média à implémenter")}>➕ Ajouter</button>
                  </div>
                  {medias.length === 0 ? (
                    <div style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 14, padding: "56px 0", textAlign: "center", color: C.textSub }}><div style={{ fontSize: 40, marginBottom: 10 }}>🎬</div><div style={{ fontWeight: 600 }}>Aucun média</div></div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                      {medias.map((m: any) => (
                        <div key={m.id} style={{ background: C.white, border: `2px solid ${C.border}`, borderRadius: 13, overflow: "hidden" }}>
                          <div style={{ height: 130, background: `linear-gradient(135deg, ${C.sidebar}, ${C.red}22)`, display: "flex", alignItems: "center", justifyContent: "center", color: C.red, fontSize: 34 }}>{m.type === "video" ? <FaPlay /> : <FaMicrophone />}</div>
                          <div style={{ padding: "13px 14px" }}>
                            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{m.titre}</div>
                            <div style={{ fontSize: 12, color: C.textSub, marginTop: 3 }}>{m.description?.slice(0, 80)}</div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 11 }}>
                              <StatusBadge statut={m.statut || "brouillon"} />
                              <div style={{ display: "flex", gap: 5 }}>
                                <button className="btn btn-blue" style={{ padding: "4px 8px", fontSize: 11 }}>✏️</button>
                                <button className="btn btn-red" style={{ padding: "4px 8px", fontSize: 11 }}>🗑</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}