export default function Home() {
  return (
    <main style={{ color: "#4a044e" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-fuchsia-100">
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "#a21caf" }}>
          CallNotes
        </span>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "#a21caf" }}>
            📅 Réserver un créneau →
          </a>
          <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20CallNotes%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg text-white text-sm font-semibold" style={{ background: "#25d366", borderColor: "#25d366" }}>
            💬 WhatsApp →
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4" style={{ background: "#fae8ff", color: "#a21caf" }}>
          Transcription + IA — Sales & Discovery
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,5vw,3.5rem)", lineHeight: 1.1, color: "#a21caf" }} className="mb-4">
          Vos appels structurés.<br />Vos actions générées.<br />En 60 secondes.
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: "#7e22ce" }}>
          CallNotes transcrit vos appels, en extrait les informations BANT, génère un résumé structuré et synchronise tout dans votre CRM — sans lever le petit doigt.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg" style={{ background: "linear-gradient(135deg, #a21caf, #7c3aed)" }}>
            📅 Réserver un créneau →
          </a>
          <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20CallNotes%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg" style={{ background: "#25d366", borderColor: "#25d366" }}>
            💬 WhatsApp →
          </a>
        </div>
      </section>

      {/* Before / After */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "#a21caf" }} className="text-center mb-8">
          Avant CallNotes. Après CallNotes.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-sm font-bold text-red-500">AVANT — Transcription brute</span>
            </div>
            <div className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 rounded-lg p-3 space-y-1">
              <p>[00:02] euh donc oui on cherche quelque chose pour...</p>
              <p>[00:18] notre budget c'est... enfin ça dépend...</p>
              <p>[01:34] oui nos concurrents ils font ça avec... je sais plus</p>
              <p>[03:12] la deadline c'est fin Q3 ou Q4 je crois</p>
              <p>[05:41] faudrait que vous recontactiez notre DSI</p>
              <p>[08:22] ouais voilà on a genre 200 utilisateurs...</p>
              <p className="text-slate-400 italic">... 47 minutes de transcript non structuré</p>
            </div>
            <div className="mt-3 text-xs text-red-500 font-medium">45 min de saisie manuelle CRM</div>
          </div>

          {/* After */}
          <div className="bg-white rounded-2xl p-6 border border-fuchsia-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-fuchsia-400" />
              <span className="text-sm font-bold" style={{ color: "#a21caf" }}>APRÈS — Notes structurées CallNotes</span>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: "Problème", value: "Suivi manuel des leads — perte de 30% en pipeline", icon: "🔴" },
                { label: "Solution souhaitée", value: "Automatisation CRM + alertes commerciales", icon: "💡" },
                { label: "Budget", value: "15k–20k€/an validé par DAF", icon: "💰" },
                { label: "Timeline", value: "Mise en prod avant fin Q3 2025", icon: "📅" },
                { label: "Décideur", value: "DSI + Directeur Commercial (à contacter)", icon: "👤" },
                { label: "Next action", value: "Envoyer démo + contacter DSI avant vendredi", icon: "✅" },
              ].map((r) => (
                <div key={r.label} className="flex gap-2 p-2 rounded-lg" style={{ background: "#fdf4ff" }}>
                  <span>{r.icon}</span>
                  <div>
                    <span className="font-semibold text-fuchsia-800">{r.label}: </span>
                    <span className="text-slate-700">{r.value}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs font-medium" style={{ color: "#a21caf" }}>Synchro CRM en 60 secondes</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-y border-fuchsia-100 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "#a21caf" }} className="text-center mb-10">
            3 fonctions, 0 saisie manuelle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🎙️", title: "Transcription Whisper", desc: "Transcription multi-locuteurs en temps réel ou à la volée. FR, EN, ES. Précision 97% sur appels qualifiés." },
              { icon: "🎯", title: "Extraction BANT", desc: "Budget, Authority, Need, Timeline extraits automatiquement de chaque appel discovery et qualification." },
              { icon: "🔄", title: "Sync CRM", desc: "HubSpot, Salesforce, Pipedrive — résumé, actions et données BANT poussés automatiquement dans la fiche contact." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-fuchsia-100 p-6">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "#a21caf" }} className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center" style={{ background: "linear-gradient(135deg, #a21caf, #7c3aed)" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "white" }} className="mb-3">
          45 min par appel. Récupérées. Chaque jour.
        </h2>
        <p className="text-fuchsia-200 mb-8">Démo en 20 min. Opérationnel en 24h.</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://calendly.com/wikolabs" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 rounded-xl font-bold text-lg shadow-lg" style={{ background: "white", color: "#a21caf" }}>
            📅 Réserver un créneau →
          </a>
          <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20CallNotes%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 rounded-xl font-bold text-lg shadow-lg" style={{ background: "#25d366", borderColor: "#25d366" }}>
            💬 WhatsApp →
          </a>
        </div>
      </section>

      <footer className="text-center py-6 text-sm text-fuchsia-700 bg-white border-t border-fuchsia-50">
        &copy; 2025 CallNotes — Un produit Wikolabs
      </footer>
    </main>
  );
}
