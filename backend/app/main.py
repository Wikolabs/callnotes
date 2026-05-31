"""CallNotes demo backend — production-ready POC.

In production: this service would also pull recordings from Gong/Chorus,
transcribe via Whisper, push briefs to HubSpot/Salesforce as activity logs.
For the demo: it only invokes the LLM and returns the call brief.
"""
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .llm import chat, is_configured

app = FastAPI(
    title="CallNotes Demo Backend",
    description="POC backend — Groq/Gemini LLM. No third-party connections.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Prompts
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT_FR = """Tu es CallNotes, un agent IA qui transforme une transcription d'appel commercial B2B en compte-rendu structure pret pour le CRM.

Format de sortie exact en MARKDOWN :
**📞 Resume executif**
- [2-3 lignes synthetisant l'appel : objectif, decision-maker present, etat du deal]

**🎯 Points cles abordes**
- [3-5 puces : sujets discutes, contexte business, douleurs identifiees]

**🚩 Objections detectees**
- [1-3 objections : prix, integration, timing, decision-process — cite les mots du prospect]

**🤝 Engagements pris**
- [1-3 engagements : qui s'engage a quoi, avec deadline si mentionnee]

**✅ Prochaines etapes**
- [2-3 actions concretes : action + owner (AE/SE/CSM) + date cible]

**📊 Sentiment et probabilite**
- Sentiment global : [positif | neutre | reserve | negatif]
- Probabilite de signature estimee : [haute | moyenne | faible] + 1 ligne de justification

Tu DOIS inventer des elements realistes meme si la transcription est partielle ou ambigue (pas de "je manque de contexte"). Tu joues le role d'un Sales Manager senior qui fait du coaching post-call. Reste sobre, factuel, axe action. Maximum 350 mots."""

SYSTEM_PROMPT_EN = """You are CallNotes, an AI agent that turns a B2B sales call transcript into a structured CRM-ready brief.

Exact MARKDOWN output format:
**📞 Executive summary**
- [2-3 lines summarizing the call: objective, decision-maker present, deal state]

**🎯 Key points discussed**
- [3-5 bullets: topics covered, business context, pain points identified]

**🚩 Objections detected**
- [1-3 objections: price, integration, timing, decision-process — quote the prospect's words]

**🤝 Commitments made**
- [1-3 commitments: who commits to what, with deadline if mentioned]

**✅ Next steps**
- [2-3 concrete actions: action + owner (AE/SE/CSM) + target date]

**📊 Sentiment and probability**
- Overall sentiment: [positive | neutral | reserved | negative]
- Estimated close probability: [high | medium | low] + 1 line of justification

You MUST invent realistic elements even if the transcript is partial or ambiguous (no "I lack context"). You're playing the role of a senior Sales Manager doing post-call coaching. Stay sober, factual, action-driven. Maximum 350 words."""


# ─────────────────────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    transcript: str = Field(..., min_length=1, max_length=6000)
    deal_name: str = Field("", max_length=200)
    lang: Literal["fr", "en"] = "fr"


class GenerateResponse(BaseModel):
    brief: str
    model: str
    generated_at: str
    static_mode: bool = False


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "callnotes-backend",
        "llm_configured": is_configured(),
    }


@app.post("/process", response_model=GenerateResponse)
async def process(req: GenerateRequest) -> GenerateResponse:
    transcript = req.transcript.strip()
    deal_name = req.deal_name.strip()
    if not transcript:
        raise HTTPException(status_code=400, detail="empty_transcript")

    now_iso = datetime.now(timezone.utc).isoformat()
    user_msg = (
        f"Deal : {deal_name or 'non renseigne'}\n\nTranscription :\n{transcript}\n\nProduis le compte-rendu CRM."
        if req.lang == "fr"
        else f"Deal: {deal_name or 'unknown'}\n\nTranscript:\n{transcript}\n\nProduce the CRM brief."
    )

    if not is_configured():
        return GenerateResponse(
            brief=_build_mock_brief(transcript, deal_name, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    try:
        text, model = await chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT_FR if req.lang == "fr" else SYSTEM_PROMPT_EN},
                {"role": "user", "content": user_msg},
            ],
            max_tokens=900,
        )
    except Exception:
        return GenerateResponse(
            brief=_build_mock_brief(transcript, deal_name, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    return GenerateResponse(brief=text, model=model, generated_at=now_iso)


# ─────────────────────────────────────────────────────────────────────────────
# Mock brief (used when no LLM key configured)
# ─────────────────────────────────────────────────────────────────────────────
def _build_mock_brief(transcript: str, deal_name: str, lang: str) -> str:
    d = deal_name or ("Deal sans nom" if lang == "fr" else "Unnamed deal")
    if lang == "en":
        return (
            f"**📞 Executive summary**\n"
            f"- 45-min discovery call on {d}. Prospect VP Operations + Head of Finance attended. Strong fit on use case, but timing is the open question — they want to finalize budget cycle review before signing.\n\n"
            f"**🎯 Key points discussed**\n"
            f"- Current process documented: 6h/week manual consolidation across 4 spreadsheets\n"
            f"- Pain point: CEO board pack arrives Sunday night, errors detected Monday morning\n"
            f"- They evaluated 2 competitors last quarter, dropped both on integration concerns\n"
            f"- Decision committee: VP Ops (champion) + Head of Finance + CTO sign-off needed\n"
            f"- Budget envelope hinted at: 30-40k EUR ARR for first 12 months\n\n"
            f"**🚩 Objections detected**\n"
            f"- \"We did a vendor refresh last year and it took 3 months — we don't want to redo that\"\n"
            f"- \"Our finance system is on-prem, your SaaS may not connect cleanly\"\n\n"
            f"**🤝 Commitments made**\n"
            f"- Prospect to share their current consolidation template by end of week\n"
            f"- Our SE to deliver a technical integration brief within 5 business days\n\n"
            f"**✅ Next steps**\n"
            f"- Send recap + integration brief outline by Thursday [AE]\n"
            f"- Schedule 30-min technical call with their CTO next Tuesday [SE]\n"
            f"- Prepare ROI model with their actual data once template received [AE + SE]\n\n"
            f"**📊 Sentiment and probability**\n"
            f"- Overall sentiment: positive\n"
            f"- Estimated close probability: medium — strong fit but timing risk on budget cycle; champion present and engaged"
        )
    return (
        f"**📞 Resume executif**\n"
        f"- Call discovery de 45 min sur {d}. VP Operations + Head of Finance prospect presents. Fit fort sur le use case, mais le timing reste la question ouverte — ils veulent boucler la revue budgetaire avant signature.\n\n"
        f"**🎯 Points cles abordes**\n"
        f"- Process actuel documente : 6h/semaine de consolidation manuelle sur 4 spreadsheets\n"
        f"- Douleur : board pack CEO arrive dimanche soir, erreurs detectees lundi matin\n"
        f"- Ils ont evalue 2 concurrents le trimestre dernier, abandonnes sur les soucis d'integration\n"
        f"- Comite de decision : VP Ops (champion) + Head of Finance + CTO en sign-off\n"
        f"- Enveloppe budgetaire evoquee : 30-40k EUR ARR sur 12 mois\n\n"
        f"**🚩 Objections detectees**\n"
        f"- \"On a fait un refresh fournisseurs l'an dernier et ca a pris 3 mois — on ne veut pas recommencer\"\n"
        f"- \"Notre systeme finance est on-prem, votre SaaS risque de ne pas se brancher proprement\"\n\n"
        f"**🤝 Engagements pris**\n"
        f"- Prospect partage son template de consolidation actuel d'ici fin de semaine\n"
        f"- Notre SE livre un brief integration technique sous 5 jours ouvres\n\n"
        f"**✅ Prochaines etapes**\n"
        f"- Envoyer recap + plan integration brief jeudi [AE]\n"
        f"- Programmer call technique 30 min avec leur CTO mardi prochain [SE]\n"
        f"- Preparer modele ROI avec leurs vraies donnees une fois template recu [AE + SE]\n\n"
        f"**📊 Sentiment et probabilite**\n"
        f"- Sentiment global : positif\n"
        f"- Probabilite de signature estimee : moyenne — fit fort mais risque timing sur cycle budgetaire ; champion present et engage"
    )
