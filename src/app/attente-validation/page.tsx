"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AttenteValidation() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const e = localStorage.getItem("pending_email");
    if (e) setEmail(e);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Outfit',sans-serif;}
        .pg{min-height:100vh;background:linear-gradient(135deg,#F0F4F8,#E8EEF6);display:flex;align-items:center;justify-content:center;padding:40px 24px;}
        .card{background:#fff;border:1px solid #DDE4EF;border-radius:24px;padding:50px 44px;width:100%;max-width:540px;box-shadow:0 8px 40px rgba(10,37,64,.1);text-align:center;}
        .icon-box{width:90px;height:90px;background:linear-gradient(135deg,#FFF8E1,#FFF3CD);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;margin:0 auto 28px;border:3px solid #F7B500;}
        .badge{display:inline-flex;align-items:center;gap:6px;background:#FFF8E1;border:1px solid #F7B500;border-radius:99px;padding:6px 14px;font-size:12px;font-weight:700;color:#B45309;margin-bottom:20px;}
        .title{font-size:26px;font-weight:800;color:#0A2540;margin-bottom:12px;}
        .subtitle{font-size:14px;color:#8A9AB5;line-height:1.7;margin-bottom:24px;}
        .email-box{background:#F7F9FC;border:1.5px solid #DDE4EF;border-radius:12px;padding:14px 20px;font-size:14px;color:#0A2540;font-weight:600;margin-bottom:28px;}
        .steps{text-align:left;margin-bottom:32px;}
        .step{display:flex;align-items:flex-start;gap:14px;margin-bottom:16px;}
        .step-num{width:30px;height:30px;border-radius:50%;background:#0A2540;color:#F7B500;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .step-text{font-size:13.5px;color:#4A5568;line-height:1.6;padding-top:4px;}
        .step-text strong{color:#0A2540;}
        .btn{display:inline-flex;align-items:center;gap:8px;background:#0A2540;color:#fff;text-decoration:none;padding:13px 28px;border-radius:12px;font-size:14px;font-weight:700;transition:all .2s;}
        .btn:hover{background:#F7B500;color:#0A2540;}
        .secure{display:flex;align-items:center;justify-content:center;gap:5px;margin-top:16px;font-size:11px;color:#C2CEDC;}
      `}</style>

      <div className="pg">
        <div className="card">
          <div className="icon-box">⏳</div>
          <div className="badge">
            <span style={{width:7,height:7,borderRadius:"50%",background:"#F59E0B",display:"inline-block"}}/>
            En attente de validation
          </div>
          <div className="title">Inscription envoyée !</div>
          <div className="subtitle">
            Votre demande a bien été reçue. Notre équipe va examiner
            votre profil et vous notifier par email.
          </div>
          {email && (
            <div className="email-box">
              📧 Notification envoyée à : {email}
            </div>
          )}
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-text">
                <strong>Demande reçue</strong><br/>
                Votre dossier est en cours d'examen.
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-text">
                <strong>Validation admin</strong><br/>
                Un administrateur va vérifier vos informations sous 24-48h.
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-text">
                <strong>Email de confirmation</strong><br/>
                Vous recevrez un email dès que votre compte sera activé.
              </div>
            </div>
          </div>
          <Link href="/" className="btn">
            🏠 Retour à l'accueil
          </Link>
          <div className="secure">
            🔒 Données protégées · Traitement sous 24-48h
          </div>
        </div>
      </div>
    </>
  );
}