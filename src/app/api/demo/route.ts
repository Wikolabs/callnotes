import { NextResponse } from "next/server";
import { chat, isConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT_FR = `Tu es CallNotes, un agent IA qui transforme une transcription d'appel commercial B2B en compte-rendu structure pret pour le CRM.

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

Tu DOIS inventer des elements realistes meme si la transcription est partielle ou ambigue (pas de "je manque de contexte"). Tu joues le role d'un Sales Manager senior qui fait du coaching post-call. Reste sobre, factuel, axe action. Maximum 350 mots.`;

const SYSTEM_PROMPT_EN = `You are CallNotes, an AI agent that turns a B2B sales call transcript into a structured CRM-ready brief.

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

You MUST invent realistic elements even if the transcript is partial or ambiguous (no "I lack context"). You're playing the role of a senior Sales Manager doing post-call coaching. Stay sober, factual, action-driven. Maximum 350 words.`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const transcript: string = typeof body.transcript === "string" ? body.transcript.slice(0, 6000) : "";
    const dealName: string = typeof body.dealName === "string" ? body.dealName.slice(0, 200) : "";
    const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: lang === "fr" ? "Collez un extrait de transcription." : "Paste a transcript excerpt." },
        { status: 400 }
      );
    }

    if (!isConfigured()) {
      return NextResponse.json(
        {
          error: "llm_not_configured",
          message: lang === "fr"
            ? "Demo en mode statique — la cle LLM sera configuree au prochain deploiement."
            : "Static demo mode — LLM key will be configured at next deploy.",
          mockBrief: buildMockBrief(transcript, dealName, lang),
        },
        { status: 200 }
      );
    }

    const userMsg = lang === "fr"
      ? `Deal : ${dealName || "non renseigne"}\n\nTranscription :\n${transcript}\n\nProduis le compte-rendu CRM.`
      : `Deal: ${dealName || "unknown"}\n\nTranscript:\n${transcript}\n\nProduce the CRM brief.`;

    const { text, model } = await chat(
      [
        { role: "system", content: lang === "fr" ? SYSTEM_PROMPT_FR : SYSTEM_PROMPT_EN },
        { role: "user", content: userMsg },
      ],
      1000
    );

    return NextResponse.json({ brief: text, model, generatedAt: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildMockBrief(transcript: string, dealName: string, lang: "fr" | "en"): string {
  const d = dealName || (lang === "fr" ? "Deal sans nom" : "Unnamed deal");
  if (lang === "en") {
    return `**📞 Executive summary**\n- 45-min discovery call on ${d}. Prospect VP Operations + Head of Finance attended. Strong fit on use case, but timing is the open question — they want to finalize budget cycle review before signing.\n\n**🎯 Key points discussed**\n- Current process documented: 6h/week manual consolidation across 4 spreadsheets\n- Pain point: CEO board pack arrives Sunday night, errors detected Monday morning\n- They evaluated 2 competitors last quarter, dropped both on integration concerns\n- Decision committee: VP Ops (champion) + Head of Finance + CTO sign-off needed\n- Budget envelope hinted at: 30-40k EUR ARR for first 12 months\n\n**🚩 Objections detected**\n- "We did a vendor refresh last year and it took 3 months — we don't want to redo that"\n- "Our finance system is on-prem, your SaaS may not connect cleanly"\n\n**🤝 Commitments made**\n- Prospect to share their current consolidation template by end of week\n- Our SE to deliver a technical integration brief within 5 business days\n\n**✅ Next steps**\n- Send recap + integration brief outline by Thursday [AE]\n- Schedule 30-min technical call with their CTO next Tuesday [SE]\n- Prepare ROI model with their actual data once template received [AE + SE]\n\n**📊 Sentiment and probability**\n- Overall sentiment: positive\n- Estimated close probability: medium — strong fit but timing risk on budget cycle; champion present and engaged`;
  }
  return `**📞 Resume executif**\n- Call discovery de 45 min sur ${d}. VP Operations + Head of Finance prospect presents. Fit fort sur le use case, mais le timing reste la question ouverte — ils veulent boucler la revue budgetaire avant signature.\n\n**🎯 Points cles abordes**\n- Process actuel documente : 6h/semaine de consolidation manuelle sur 4 spreadsheets\n- Douleur : board pack CEO arrive dimanche soir, erreurs detectees lundi matin\n- Ils ont evalue 2 concurrents le trimestre dernier, abandonnes sur les soucis d'integration\n- Comite de decision : VP Ops (champion) + Head of Finance + CTO en sign-off\n- Enveloppe budgetaire evoquee : 30-40k EUR ARR sur 12 mois\n\n**🚩 Objections detectees**\n- "On a fait un refresh fournisseurs l'an dernier et ca a pris 3 mois — on ne veut pas recommencer"\n- "Notre systeme finance est on-prem, votre SaaS risque de ne pas se brancher proprement"\n\n**🤝 Engagements pris**\n- Prospect partage son template de consolidation actuel d'ici fin de semaine\n- Notre SE livre un brief integration technique sous 5 jours ouvres\n\n**✅ Prochaines etapes**\n- Envoyer recap + plan integration brief jeudi [AE]\n- Programmer call technique 30 min avec leur CTO mardi prochain [SE]\n- Preparer modele ROI avec leurs vraies donnees une fois template recu [AE + SE]\n\n**📊 Sentiment et probabilite**\n- Sentiment global : positif\n- Probabilite de signature estimee : moyenne — fit fort mais risque timing sur cycle budgetaire ; champion present et engage`;
}
