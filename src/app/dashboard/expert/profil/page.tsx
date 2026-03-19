"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const I = {
  back:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  edit:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  save:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  upload: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  camera: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  check:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  logout: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  map:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  brief:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  phone:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.74a16 16 0 0 0 6 6l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.46 16z"/></svg>,
  mail:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  user:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  dollar: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
};

export default function ExpertProfilePage() {
  const router = useRouter();
  const [user, setUser]       = useState<any>(null);
  const [expert, setExpert]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast]     = useState({ text: "", ok: true });
  const [form, setForm]       = useState({ domaine: "", description: "", localisation: "", telephone: "", experience: "", tarif: "" });

  const tk = () => localStorage.getItem("token") || "";
  const hdr = () => ({ Authorization: `Bearer ${tk()}` });
  const hdrJson = () => ({ Authorization: `Bearer ${tk()}`, "Content-Type": "application/json" });

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { router.push("/connexion"); return; }
    const parsed = JSON.parse(u);
    if (parsed.role !== "expert") { router.push("/"); return; }
    setUser(parsed);
    loadProfile();
  }, []);

  function notify(text: string, ok = true) {
    setToast({ text, ok });
    setTimeout(() => setToast({ text: "", ok: true }), 3500);
  }

  async function loadProfile() {
    setLoading(true);
    const r = await fetch("http://localhost:3001/experts/moi", { headers: hdr() });
    if (r.ok) {
      const d = await r.json();
      setExpert(d);
      setForm({ domaine: d.domaine || "", description: d.description || "", localisation: d.localisation || "", telephone: d.telephone || "", experience: d.experience || "", tarif: d.tarif || "" });
    }
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const r = await fetch("http://localhost:3001/experts/profil", { method: "PUT", headers: hdrJson(), body: JSON.stringify(form) });
    if (r.ok) { notify("Profil mis à jour ✅"); setEditing(false); loadProfile(); }
    else notify("Erreur lors de la sauvegarde", false);
    setSaving(false);
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("photo", file);
    const r = await fetch("http://localhost:3001/experts/photo", { method: "POST", headers: hdr(), body: fd });
    if (r.ok) { notify("Photo mise à jour ✅"); loadProfile(); }
    else notify("Erreur upload photo", false);
    setUploading(false);
  }

  const ini = user ? `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase() : "?";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F2F5F9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #F7B500", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#8A9AB5", fontSize: 14 }}>Chargement…</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .fade { animation: fadeIn .3s ease; }
        body { font-family: 'Outfit', sans-serif; background: #F2F5F9; }

        .card { background: #fff; border: 1px solid #E8EEF6; border-radius: 16px; }
        .btn { font-family: 'Outfit', sans-serif; font-weight: 600; border: none; border-radius: 9px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; padding: 9px 16px; transition: all .18s; }
        .btn-primary { background: #0A2540; color: #fff; }
        .btn-primary:hover { background: #F7B500; color: #0A2540; }
        .btn-gold { background: #F7B500; color: #0A2540; box-shadow: 0 4px 14px rgba(247,181,0,.22); }
        .btn-gold:hover { background: #e6a800; transform: translateY(-1px); }
        .btn-slate { background: #F1F5F9; color: #475569; }
        .btn-slate:hover { background: #E2E8F0; }
        .btn:disabled { opacity: .55; cursor: not-allowed; transform: none !important; }

        .lbl { font-size: 11px; font-weight: 700; color: #7D8FAA; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px; }
        .inp { width: 100%; background: #F7F9FC; border: 1.5px solid #DDE4EF; border-radius: 10px; padding: 11px 14px; font-family: 'Outfit', sans-serif; font-size: 14px; color: #0A2540; outline: none; transition: border-color .18s, box-shadow .18s; }
        .inp:focus { border-color: #F7B500; box-shadow: 0 0 0 3px rgba(247,181,0,.1); background: #fff; }
        .inp::placeholder { color: #B8C4D6; }
        textarea.inp { resize: vertical; min-height: 100px; }
        select.inp { appearance: none; cursor: pointer; }

        .field { display: flex; flex-direction: column; gap: 6px; }
        .info-row { display: flex; align-items: flex-start; gap: 10px; padding: 14px 0; border-bottom: 1px solid #F1F5F9; }
        .info-row:last-child { border-bottom: none; }
        .info-icon { width: 30px; height: 30px; border-radius: 8px; background: #F7F9FC; border: 1px solid #E8EEF6; display: flex; align-items: center; justify-content: center; color: #7D8FAA; flex-shrink: 0; }
        .info-lbl { font-size: 11px; color: #8A9AB5; font-weight: 600; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 3px; }
        .info-val { font-size: 14px; color: #0A2540; font-weight: 500; }
      `}</style>

      {/* Toast */}
      {toast.text && (
        <div className="fade" style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: toast.ok ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${toast.ok ? "#A7F3D0" : "#FECACA"}`, borderLeft: `3px solid ${toast.ok ? "#059669" : "#DC2626"}`, color: toast.ok ? "#059669" : "#DC2626", borderRadius: 10, padding: "12px 18px", fontWeight: 600, fontSize: 13, boxShadow: "0 8px 24px rgba(0,0,0,.1)" }}>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <header style={{ background: "#0A2540", height: 62, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(10,37,64,.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, background: "#F7B500", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: "#0A2540" }}>BEH</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Mon Profil Expert</div>
            <div style={{ color: "rgba(255,255,255,.35)", fontSize: 11 }}>{user?.prenom} {user?.nom}</div>
          </div>
        </div>
        <button className="btn" onClick={() => { localStorage.clear(); router.push("/"); }} style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.7)", border: "1px solid rgba(255,255,255,.12)", fontSize: 12 }}>
          <I.logout /> Déconnexion
        </button>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px" }}>

        {/* Retour */}
        <Link href="/dashboard/expert" style={{ display: "inline-flex", alignItems: "center", gap: 7, color: "#5C7090", fontSize: 13, fontWeight: 500, textDecoration: "none", background: "#fff", border: "1px solid #DDE4EF", borderRadius: 8, padding: "8px 14px", marginBottom: 24, transition: "all .2s" }}>
          <I.back /> Retour au dashboard
        </Link>

        {/* Card photo + identité */}
        <div className="card fade" style={{ padding: "28px 28px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>

            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", overflow: "hidden", border: "3px solid #F7B500", background: "#0A2540", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {expert?.photo ? (
                  <img src={`http://localhost:3001/uploads/photos/${expert.photo}`} alt="photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ color: "#F7B500", fontWeight: 800, fontSize: 26 }}>{ini}</span>
                )}
              </div>
              <label style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, background: "#F7B500", borderRadius: "50%", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: uploading ? "wait" : "pointer", color: "#0A2540" }}>
                <I.camera />
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} disabled={uploading} />
              </label>
            </div>

            {/* Infos */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0A2540", marginBottom: 4 }}>{user?.prenom} {user?.nom}</div>
              <div style={{ fontSize: 13.5, color: "#8A9AB5", marginBottom: 10 }}>{user?.email}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: expert?.valide ? "#ECFDF5" : "#FFFBEB", color: expert?.valide ? "#059669" : "#D97706", border: `1px solid ${expert?.valide ? "#A7F3D0" : "#FDE68A"}`, borderRadius: 99, padding: "4px 12px", fontSize: 11.5, fontWeight: 700 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: expert?.valide ? "#059669" : "#D97706" }} />
                  {expert?.valide ? "Profil validé" : "En attente de validation"}
                </span>
                {expert?.disponible && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 99, padding: "4px 12px", fontSize: 11.5, fontWeight: 700 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D4ED8" }} /> Disponible
                  </span>
                )}
              </div>
            </div>

            {/* Bouton modifier */}
            {!editing && (
              <button className="btn btn-gold" onClick={() => setEditing(true)}><I.edit /> Modifier</button>
            )}
          </div>
          {uploading && <div style={{ marginTop: 10, fontSize: 12, color: "#8A9AB5" }}>⏳ Upload en cours…</div>}
        </div>

        {/* Formulaire edit OU vue info */}
        {editing ? (
          <div className="card fade" style={{ overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", fontWeight: 700, fontSize: 15, color: "#0A2540", background: "#FAFBFE" }}>
              Modifier mes informations
            </div>
            <form onSubmit={handleSave}>
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="field">
                    <label className="lbl">Domaine d'expertise *</label>
                    <input className="inp" type="text" placeholder="Ex: Marketing Digital" value={form.domaine} onChange={e => setForm({ ...form, domaine: e.target.value })} required />
                  </div>
                  <div className="field">
                    <label className="lbl">Expérience</label>
                    <select className="inp" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}>
                      <option value="">Sélectionner…</option>
                      {["1-2 ans","3-5 ans","5-8 ans","8-12 ans","12+ ans"].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label className="lbl">Description</label>
                  <textarea className="inp" placeholder="Présentez-vous en quelques lignes…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="field">
                    <label className="lbl">Localisation</label>
                    <input className="inp" type="text" placeholder="Ex: Tunis, Sfax…" value={form.localisation} onChange={e => setForm({ ...form, localisation: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="lbl">Téléphone</label>
                    <input className="inp" type="tel" placeholder="+216 00 000 000" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} />
                  </div>
                </div>
                <div className="field">
                  <label className="lbl">Tarif horaire</label>
                  <input className="inp" type="text" placeholder="Ex: 150 DT/h" value={form.tarif} onChange={e => setForm({ ...form, tarif: e.target.value })} />
                </div>
              </div>
              <div style={{ padding: "14px 24px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" className="btn btn-slate" onClick={() => setEditing(false)}>Annuler</button>
                <button type="submit" className="btn btn-gold" disabled={saving}>
                  {saving ? (
                    <><div style={{ width: 13, height: 13, border: "2px solid rgba(10,37,64,.2)", borderTopColor: "#0A2540", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> Enregistrement…</>
                  ) : (
                    <><I.save /> Enregistrer</>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="card fade" style={{ overflow: "hidden" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", fontWeight: 700, fontSize: 15, color: "#0A2540", background: "#FAFBFE" }}>
              Informations professionnelles
            </div>
            <div style={{ padding: "6px 24px 8px" }}>
              {[
                { icon: I.brief,  lbl: "Domaine",     val: expert?.domaine      || "Non renseigné" },
                { icon: I.brief,  lbl: "Expérience",  val: expert?.experience   || "Non renseignée" },
                { icon: I.dollar, lbl: "Tarif",       val: expert?.tarif        || "Non renseigné" },
                { icon: I.map,    lbl: "Localisation", val: expert?.localisation || "Non renseignée" },
                { icon: I.phone,  lbl: "Téléphone",   val: expert?.telephone    || "Non renseigné" },
                { icon: I.mail,   lbl: "Email",       val: user?.email          || "—" },
              ].map((row, i) => (
                <div key={i} className="info-row">
                  <div className="info-icon"><row.icon /></div>
                  <div>
                    <div className="info-lbl">{row.lbl}</div>
                    <div className="info-val">{row.val}</div>
                  </div>
                </div>
              ))}
              {expert?.description && (
                <div className="info-row">
                  <div className="info-icon"><I.user /></div>
                  <div>
                    <div className="info-lbl">Description</div>
                    <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, marginTop: 3 }}>{expert.description}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}