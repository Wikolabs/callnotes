"use client";
import { useState } from "react";

const PRODUCT = "CallNotes";

const PAL = {
  bg: "#FAF5FF",
  bg2: "#EDE9FE",
  surface: "rgba(0,0,0,0.035)",
  surfaceHover: "rgba(0,0,0,0.06)",
  border: "rgba(0,0,0,0.08)",
  txt1: "#1A0F26",
  txt2: "#52425C",
  txt3: "#8E7E9A",
  accent: "#7C3AED",
  accentSoft: "rgba(124,58,237,0.10)",
  accentBorder: "rgba(124,58,237,0.30)",
  accentGlow: "rgba(124,58,237,0.15)",
  navBg: "rgba(250,245,255,0.85)",
};

const EXAMPLE_FR = `[AE - Sophie] : Bonjour Marc, merci d'avoir pris ce call. On avait 45 min prevues, je vous propose qu'on commence par votre contexte actuel.

[Prospect - Marc, VP Ops] : Avec plaisir. Aujourd'hui on consolide a la main entre 4 fichiers Excel, ca prend 6h par semaine a Julie. Le board pack du CEO arrive dimanche soir et lundi matin on detecte deja des erreurs.

[AE - Sophie] : C'est exactement le pattern qu'on voit chez nos clients. Sur le budget ?

[Prospect - Marc] : On a une enveloppe de 30 a 40k euros pour cette annee. Mais on a fait un refresh fournisseurs l'annee derniere, ca a pris 3 mois, on ne veut surtout pas recommencer ce calvaire.

[Prospect - Helene, Head of Finance] : Et notre systeme finance est on-prem, j'aimerais qu'on verifie que votre SaaS se connecte proprement avant d'aller plus loin.

[AE - Sophie] : Tout a fait legitime. Je vous propose qu'on planifie un call technique avec votre CTO sous 8 jours. Vous m'envoyez votre template de consolidation actuel et on construit un brief integration sur-mesure.`;

const EXAMPLE_EN = `[AE - Sophie]: Hi Marc, thanks for taking this call. We have 45 min, I suggest we start with your current context.

[Prospect - Marc, VP Ops]: Sure. Today we consolidate manually across 4 Excel files, it takes Julie 6 hours per week. The CEO board pack arrives Sunday evening and Monday morning we already spot errors.

[AE - Sophie]: That's exactly the pattern we see with our customers. On budget?

[Prospect - Marc]: We have an envelope of 30 to 40k euros for this year. But we did a vendor refresh last year, it took 3 months, we definitely don't want to redo that ordeal.

[Prospect - Helene, Head of Finance]: And our finance system is on-prem, I'd like us to verify your SaaS connects cleanly before going further.

[AE - Sophie]: Completely legitimate. I suggest we schedule a technical call with your CTO within 8 days. You send me your current consolidation template and we build a custom integration brief.`;

export default function DemoPage() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [dealName, setDealName] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [staticMode, setStaticMode] = useState(false);

  const t = lang === "fr" ? {
    back: "Retour", title: "Demo", sub: PRODUCT + " — compte-rendu IA d'appel commercial",
    desc: "Collez un fragment de transcription d'un appel commercial. L'agent IA produit un compte-rendu CRM structure : points cles, objections, engagements, prochaines etapes. Aucun CRM reel contacte — c'est un POC qui montre la logique de production.",
    inputLabel: "Transcription d'appel",
    dealPh: "Nom du deal (optionnel)",
    transcriptPh: "Collez ici un extrait de transcription (locuteurs identifies si possible)...",
    loadExample: "Charger un exemple",
    generate: "Generer le compte-rendu", generating: "Generation en cours...",
    briefTitle: "Compte-rendu CRM", emptyHint: "Le compte-rendu s'affiche ici une fois genere.",
    pushSalesforce: "Pousser dans Salesforce", pushHubspot: "Pousser dans HubSpot",
    sendEmail: "Envoyer recap par email",
    salesforceMock: "Notes, taches et objections poussees dans Salesforce (mode demo, pas de connexion reelle Salesforce)",
    hubspotMock: "Deal et activites mis a jour dans HubSpot (mode demo, pas de connexion reelle HubSpot)",
    emailMock: "Email recap envoye a l'equipe deal (mode demo, pas d'envoi reel)",
    fallback: "Mode statique : la cle LLM sera ajoutee au prochain deploiement.",
    poweredBy: "Modele :",
    note: "DEMO POC — aucune connexion reelle a Salesforce, HubSpot, Pipedrive ou Gong. L'IA structure la transcription pour la demonstration.",
  } : {
    back: "Back", title: "Demo", sub: PRODUCT + " — AI sales call recap",
    desc: "Paste a sales call transcript excerpt. The AI agent produces a structured CRM brief: key points, objections, commitments, next steps. No real CRM contacted — this is a POC showing the production logic.",
    inputLabel: "Call transcript",
    dealPh: "Deal name (optional)",
    transcriptPh: "Paste a transcript excerpt here (speakers labeled if possible)...",
    loadExample: "Load example",
    generate: "Generate recap", generating: "Generating...",
    briefTitle: "CRM brief", emptyHint: "The brief will appear here once generated.",
    pushSalesforce: "Push to Salesforce", pushHubspot: "Push to HubSpot",
    sendEmail: "Send recap email",
    salesforceMock: "Notes, tasks and objections pushed to Salesforce (demo mode, no real Salesforce connection)",
    hubspotMock: "Deal and activities updated in HubSpot (demo mode, no real HubSpot connection)",
    emailMock: "Recap email sent to deal team (demo mode, no real send)",
    fallback: "Static mode: LLM key will be added at next deploy.",
    poweredBy: "Model:",
    note: "DEMO POC — no real connection to Salesforce, HubSpot, Pipedrive or Gong. The AI structures the transcript for demonstration.",
  };

  async function generate() {
    setError(""); setBrief(""); setModel(""); setStaticMode(false);
    if (!transcript.trim()) {
      setError(lang === "fr" ? "Collez la transcription." : "Paste the transcript.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, dealName, lang }),
      });
      const j = await r.json();
      if (j.error === "llm_not_configured") {
        setBrief(j.mockBrief || "");
        setStaticMode(true);
      } else if (j.error) {
        setError(j.message || j.error);
      } else {
        setBrief(j.brief || "");
        setModel(j.model || "");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "unknown_error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

  return (
    <div style={{ minHeight: "100vh", background: PAL.bg, color: PAL.txt1, display: "flex", flexDirection: "column" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .wk-input { width: 100%; padding: 12px 14px; border-radius: 10px; background: ${PAL.surface}; border: 1px solid ${PAL.border}; color: ${PAL.txt1}; font-family: inherit; font-size: 14px; transition: border-color .2s, background .2s; }
        .wk-input:focus { outline: none; border-color: ${PAL.accent}; background: ${PAL.surfaceHover}; }
        .wk-textarea { width: 100%; padding: 12px 14px; border-radius: 10px; background: ${PAL.surface}; border: 1px solid ${PAL.border}; color: ${PAL.txt1}; font-family: inherit; font-size: 13px; resize: vertical; min-height: 220px; line-height: 1.55; }
        .wk-textarea:focus { outline: none; border-color: ${PAL.accent}; background: ${PAL.surfaceHover}; }
        .wk-btn-primary { background: ${PAL.accent}; color: #FFFFFF; border: none; border-radius: 10px; padding: 13px 22px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; transition: opacity .2s, transform .2s; display: inline-flex; align-items: center; gap: 8px; }
        .wk-btn-primary:hover { opacity: .9; transform: translateY(-1px); }
        .wk-btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }
        .wk-btn-ghost { background: ${PAL.surface}; color: ${PAL.txt1}; border: 1px solid ${PAL.border}; border-radius: 10px; padding: 9px 14px; font-weight: 600; font-size: 13px; cursor: pointer; font-family: inherit; transition: background .2s, border-color .2s; display: inline-flex; align-items: center; gap: 6px; }
        .wk-btn-ghost:hover { background: ${PAL.surfaceHover}; border-color: ${PAL.accentBorder}; }
        .wk-md p, .wk-md ul { margin: 0 0 10px; }
        .wk-md ul { padding-left: 18px; }
        .wk-md li { margin-bottom: 4px; line-height: 1.65; }
        .wk-md strong { color: ${PAL.accent}; font-weight: 700; display: block; margin-top: 10px; margin-bottom: 4px; font-size: 0.78rem; letter-spacing: 1.5px; text-transform: uppercase; }
        @media (max-width: 768px) { .demo-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <nav style={{ padding: "16px 32px", borderBottom: `1px solid ${PAL.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: PAL.navBg, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/" style={{ color: PAL.accent, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
          ← {t.back} {PRODUCT}<span style={{ color: PAL.accent }}>.</span>
        </a>
        <div style={{ display: "inline-flex", border: `1px solid ${PAL.border}`, borderRadius: 100, padding: 2, background: PAL.surface }}>
          <button onClick={() => setLang("fr")} style={{ background: lang === "fr" ? PAL.accent : "transparent", color: lang === "fr" ? "#FFFFFF" : PAL.txt2, border: "none", padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", borderRadius: 100, fontFamily: "inherit" }}>FR</button>
          <button onClick={() => setLang("en")} style={{ background: lang === "en" ? PAL.accent : "transparent", color: lang === "en" ? "#FFFFFF" : PAL.txt2, border: "none", padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", borderRadius: 100, fontFamily: "inherit" }}>EN</button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: "32px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 700, margin: "0 0 6px" }}>
          {t.title} · <em style={{ fontStyle: "italic", color: PAL.accent }}>{PRODUCT}</em>
        </h1>
        <p style={{ color: PAL.txt2, fontSize: "0.95rem", lineHeight: 1.65, maxWidth: 720, margin: "0 0 6px" }}>{t.sub}</p>
        <p style={{ color: PAL.txt3, fontSize: "0.78rem", lineHeight: 1.55, maxWidth: 720, margin: "0 0 28px" }}>{t.desc}</p>

        <div className="demo-grid" style={{ display: "grid", gridTemplateColumns: "440px 1fr", gap: 24 }}>
          <section style={{ background: PAL.surface, border: `1px solid ${PAL.border}`, borderRadius: 16, padding: 22 }}>
            <h2 style={{ fontSize: "0.72rem", color: PAL.txt3, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, margin: "0 0 14px" }}>{t.inputLabel}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              <input className="wk-input" value={dealName} onChange={(e) => setDealName(e.target.value)} placeholder={t.dealPh} />
              <textarea className="wk-textarea" value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder={t.transcriptPh} />
              <button type="button" onClick={() => setTranscript(lang === "fr" ? EXAMPLE_FR : EXAMPLE_EN)} style={{ background: "transparent", border: "none", color: PAL.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left", padding: 0, fontFamily: "inherit" }}>↳ {t.loadExample}</button>
            </div>
            <button className="wk-btn-primary" disabled={loading} onClick={generate} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? `⏳ ${t.generating}` : `📝 ${t.generate}`}
            </button>
            {error && <div style={{ marginTop: 12, color: "#B91C1C", fontSize: 13, padding: "8px 12px", background: "rgba(185,28,28,0.08)", border: "1px solid rgba(185,28,28,0.3)", borderRadius: 8 }}>{error}</div>}
            <p style={{ color: PAL.txt3, fontSize: 11, lineHeight: 1.5, marginTop: 18, marginBottom: 0, paddingTop: 14, borderTop: `1px solid ${PAL.border}` }}>{t.note}</p>
          </section>

          <section style={{ background: PAL.bg2, border: `1px solid ${PAL.border}`, borderRadius: 16, padding: 22, minHeight: 420, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: "0.72rem", color: PAL.txt3, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: brief ? "#15803D" : PAL.txt3 }} />
                {t.briefTitle}
              </h2>
              {model && <span style={{ fontSize: 10, color: PAL.txt3, fontFamily: "monospace" }}>{t.poweredBy} {model}</span>}
            </div>

            {!brief ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: PAL.txt3, fontSize: 14, textAlign: "center", padding: 30 }}>{t.emptyHint}</div>
            ) : (
              <div className="wk-md" style={{ color: PAL.txt1, fontSize: 14, lineHeight: 1.7, flex: 1 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(brief) }} />
            )}

            {brief && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18, paddingTop: 18, borderTop: `1px solid ${PAL.border}` }}>
                <button className="wk-btn-ghost" onClick={() => showToast(t.salesforceMock)}>☁️ {t.pushSalesforce}</button>
                <button className="wk-btn-ghost" onClick={() => showToast(t.hubspotMock)}>🟠 {t.pushHubspot}</button>
                <button className="wk-btn-ghost" onClick={() => showToast(t.emailMock)}>📧 {t.sendEmail}</button>
              </div>
            )}
            {staticMode && <div style={{ marginTop: 14, color: PAL.txt3, fontSize: 12, fontStyle: "italic" }}>{t.fallback}</div>}
          </section>
        </div>
      </main>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: PAL.bg2, border: `1px solid ${PAL.accentBorder}`, borderRadius: 12, padding: "12px 20px", color: PAL.txt1, fontSize: 13, fontWeight: 600, zIndex: 50, backdropFilter: "blur(20px)", boxShadow: "0 8px 28px rgba(0,0,0,0.2)" }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

function renderMarkdown(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const blocks: string[] = [];
  let listBuf: string[] = [];
  const flushList = () => {
    if (listBuf.length) {
      blocks.push("<ul>" + listBuf.map((l) => `<li>${l}</li>`).join("") + "</ul>");
      listBuf = [];
    }
  };
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    if (line.startsWith("- ")) {
      listBuf.push(esc(line.slice(2)).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"));
    } else if (line.startsWith("**") && line.endsWith("**")) {
      flushList();
      blocks.push(`<strong>${esc(line.slice(2, -2))}</strong>`);
    } else {
      flushList();
      blocks.push(`<p>${esc(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`);
    }
  }
  flushList();
  return blocks.join("");
}
