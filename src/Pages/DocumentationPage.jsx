// ================================================================
// MODULE 9: Documentation / Help Page
// ================================================================

import { NavBar } from "./HomePage";

const DocumentationPage = ({ docsTab, setDocsTab, setCurrentPage, mobileMenuOpen, setMobileMenuOpen, Toast }) => {
  const TABS = [
    { key: "guide",     label: "📋 User Guide" },
    { key: "algorithm", label: "🔢 Algorithm" },
    { key: "glossary",  label: "📖 Glossary" },
    { key: "features",  label: "⚡ Features" },
  ];

  return (
    <div className="min-h-screen bg-[#1E2A3A] p-5">
      <Toast/>
      <div className="max-w-5xl mx-auto">
        <NavBar page="docs" setCurrentPage={setCurrentPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} customAthleteCount={0}/>

        {/* Header */}
        <div className="bg-[#0A1628] rounded-2xl shadow-xl p-10 mb-6 text-white border border-white/10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#1A3FA0] flex items-center justify-center text-5xl shrink-0">📖</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Help & Documentation</h1>
              <p className="text-lg text-[#7A90B8]">Everything you need to use RunPredict effectively</p>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setDocsTab(t.key)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
                ${docsTab === t.key
                  ? "bg-[#B83E18] text-white shadow-lg"
                  : "bg-[#131E2E] text-[#C4D0EF] hover:bg-white/10 border border-white/10"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── User Guide ── */}
        {docsTab === "guide" && (
          <div className="space-y-4">
            {[
              { step:1, title:"Select Your Event",           icon:"🎯", content:"On the Simulator page, choose 100m or 200m first. This filters the athlete dropdown and sets the valid race time range for the event." },
              { step:2, title:"Enter or Search an Athlete",  icon:"🔍", content:"Type a name in the Athlete Name field. A dropdown shows matching athletes for that event. Typing a new name will auto-save that athlete to the database when you run the simulation." },
              { step:3, title:"Set Environmental Conditions",icon:"🌡️", content:"Adjust tailwind (m/s), temperature (°C), humidity (%), and altitude (m). Warning banners appear for out-of-range conditions. Tailwind above +2.0 m/s flags the result as wind-assisted." },
              { step:4, title:"Set Athlete Metrics",         icon:"💪", content:"Adjust Fitness Level (50–100%) and VO2 Max (40–85). These represent the athlete's current physical condition, not their absolute potential." },
              { step:5, title:"Calculate",                   icon:"🚀", content:"Click Calculate Prediction. Results show an optimistic (×0.995), central predicted, and pessimistic (×1.005) time, along with charts and a factor breakdown." },
            ].map(({ step, title, icon, content }) => (
              <div key={step} className="bg-[#131E2E] rounded-2xl shadow-lg p-6 flex gap-5 border border-white/10">
                <div className="w-10 h-10 rounded-full bg-[#B83E18] text-white flex items-center justify-center font-bold shrink-0 text-sm">{step}</div>
                <div>
                  <div className="font-bold text-white mb-2">{icon} {title}</div>
                  <p className="text-[#C4D0EF] text-sm leading-relaxed">{content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Algorithm ── */}
        {docsTab === "algorithm" && (
          <div className="bg-[#131E2E] rounded-2xl shadow-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">How the Prediction Works</h2>
            <p className="text-[#C4D0EF] text-sm leading-relaxed mb-5">
              The simulation engine adjusts an athlete's real recorded race time based on how conditions change.
              Each factor produces a multiplier centred around 1.0 — above 1.0 slows the athlete down, below 1.0 speeds them up.
              The formula normalises against the athlete's original race conditions so only the <strong className="text-white">change</strong> in conditions affects the prediction.
            </p>

            {/* Core formula */}
            <div className="p-4 bg-[#0A1628] rounded-xl border border-white/10 font-mono text-sm mb-6 overflow-auto">
              <div className="text-xs text-[#7A90B8] mb-2">// Prediction Formula (SimulationEngine.js)</div>
              <div className="font-bold text-white">Predicted = raceTime × (newMultipliers / originalMultipliers)</div>
              <div className="text-xs text-[#7A90B8] mt-2 font-sans">where multipliers = track × wind × altitude × humidity × temperature</div>
            </div>

            {/* Factor cards */}
            <div className="space-y-3 mb-6">
              {[
                ["Track Condition",               "text-[#D95A30]",  "bg-[#B83E18]/10 border-[#B83E18]/30",
                  "Optimal = 1.000 · Good = 1.002 · Fair = 1.005 · Poor = 1.010",
                  "Polyurethane tracks are rated optimal. Worn or wet surfaces increase race time proportionally."],
                ["Wind — IAAF Standard",          "text-[#90A8E0]",  "bg-[#1A3FA0]/10 border-[#3A6BC8]/30",
                  "100m: 1 − (wind × 0.0805 × 0.01)   |   200m: 1 − (wind × 0.0405 × 0.01)",
                  "Uses the IAAF-standard wind correction coefficient. Tailwind (positive) lowers time; headwind (negative) raises it. Coefficients differ between events due to race geometry."],
                ["Altitude — Air Density Model",  "text-emerald-400","bg-emerald-900/20 border-emerald-700/30",
                  "airDensity = e^(−altitude / 8500)   →   altitudeMult = 0.9 + (airDensity × 0.1)",
                  "Uses an exponential atmospheric decay model. At higher altitudes, thinner air reduces aerodynamic drag, giving sprinters a small advantage."],
                ["Temperature — Bell Curve",      "text-amber-400",  "bg-amber-900/20 border-amber-700/30",
                  "tempMult = 1 + (temp − 26)² × 0.00015",
                  "Based on sports science research showing optimal sprint performance at ~26°C. Deviation in either direction — too hot or too cold — increases race time symmetrically."],
                ["Humidity — Air Density Effect", "text-[#C4D0EF]",  "bg-white/5 border-white/10",
                  "humidityMult = 1 − (humidity × 0.00002)",
                  "Humid air is slightly less dense than dry air, which marginally reduces aerodynamic drag. The effect is small but physically accurate."],
              ].map(([factor, textColor, bgBorder, formula, desc]) => (
                <div key={factor} className={`p-4 rounded-xl border-2 ${bgBorder}`}>
                  <div className={`font-bold text-sm mb-2 ${textColor}`}>{factor}</div>
                  <div className="font-mono text-xs text-[#C4D0EF] bg-black/20 rounded-lg px-3 py-2 mb-2">{formula}</div>
                  <div className="text-[#7A90B8] text-sm">{desc}</div>
                </div>
              ))}
            </div>

            {/* XGBoost */}
            <div className="p-5 bg-[#8F2E0E]/15 rounded-xl border-2 border-[#B83E18]/30 mb-5">
              <div className="font-bold text-[#D95A30] text-sm mb-2">🤖 XGBoost Machine Learning Correction</div>
              <div className="font-mono text-xs text-[#C4D0EF] bg-black/20 rounded-lg px-3 py-2 mb-2">
                Final = physicsTime × 0.70 + xgboostTime × 0.30
              </div>
              <p className="text-[#7A90B8] text-sm">
                Predictions are refined using a pre-trained XGBoost model trained on the 151-athlete dataset.
                XGBoost learns non-linear relationships between conditions and race time that the physics formula cannot capture.
                The final prediction blends physics (70%) with XGBoost (30%) — weighted this way because the limited dataset size
                of 151 records means the physics model is more reliable for extrapolation beyond the training data.
              </p>
            </div>

            <div className="p-4 bg-amber-900/20 border-2 border-amber-700/30 rounded-xl text-sm text-amber-300">
              <strong className="text-amber-400">Accuracy note:</strong> The blended model achieves approximately 70% accuracy (±0.20s) for standard conditions.
              It is a simplified educational model — actual performance is also influenced by race strategy, mental state, reaction time, and individual biomechanics.
            </div>
          </div>
        )}

        {/* ── Glossary ── */}
        {docsTab === "glossary" && (
          <div className="bg-[#131E2E] rounded-2xl shadow-xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-5">Glossary of Terms</h2>
            <div className="space-y-3">
              {[
                ["Recorded Race Time",     "The athlete's actual recorded time used as the baseline for predictions."],
                ["Tailwind",               "Wind blowing in the direction of travel. Positive values help the athlete. Legal limit for records is +2.0 m/s."],
                ["Headwind",               "Wind blowing against the direction of travel (negative tailwind). Slows the athlete down."],
                ["Wind-Assisted",          "A result with tailwind exceeding +2.0 m/s. Cannot count for official records."],
                ["VO2 Max",                "The maximum rate at which the body can consume oxygen. Higher = better aerobic capacity."],
                ["Fitness Level",          "A percentage (50–100%) representing the athlete's current condition relative to their peak."],
                ["Multiplier",             "A number close to 1.0 applied to the race time. Above 1.0 = slower. Below 1.0 = faster."],
                ["Optimistic Prediction",  "The predicted time × 0.995 — a best-case scenario on the day."],
                ["Pessimistic Prediction", "The predicted time × 1.005 — a worst-case scenario on the day."],
                ["IAAF Wind Coefficient",  "The official wind correction factor used by World Athletics. Differs between 100m (0.0805) and 200m (0.0405)."],
                ["Air Density Model",      "An exponential decay formula modelling how atmospheric pressure decreases with altitude."],
                ["XGBoost",                "Extreme Gradient Boosting — a machine learning algorithm that learns patterns from training data. Used here to apply a correction factor on top of the physics-based prediction."],
                ["Blended Model",          "The final prediction combines the physics formula (70%) and XGBoost correction (30%) to balance accuracy and generalisability."],
                ["Custom Athlete",         "An athlete entered by the user not found in the built-in database. Auto-saved on first simulation."],
                ["Event Separation",       "100m and 200m athletes are stored separately. The same athlete can have independent entries per event."],
              ].map(([term, def]) => (
                <div key={term} className="p-4 rounded-xl border border-white/10 hover:border-[#3A6BC8]/50 hover:bg-white/5 transition-colors">
                  <div className="font-bold text-[#D95A30] text-sm mb-1">{term}</div>
                  <div className="text-[#C4D0EF] text-sm">{def}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Features ── */}
        {docsTab === "features" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              ["🏠","Module 1 — Homepage / Interface",         "bg-[#B83E18]/10",  "border-[#B83E18]/30",  "Dashboard with stat cards, record holders, recent simulations, and quick actions."],
              ["🏃","Module 2 — Runner Input Page",            "bg-[#B83E18]/10",  "border-[#B83E18]/30",  "Simulation form with event selector, athlete search, environmental sliders."],
              ["⚙️","Module 3 — Simulation Engine",           "bg-[#1A3FA0]/10",  "border-[#3A6BC8]/30",  "Physics-based multiplier formula blended with XGBoost ML correction for improved accuracy."],
              ["🗄️","Module 4 — Data Storage Module",         "bg-emerald-900/20","border-emerald-700/30","Persistent storage for custom athletes and session history using window.storage."],
              ["📊","Module 5 — Results / Output Page",       "bg-[#1A3FA0]/10",  "border-[#3A6BC8]/30",  "Displays optimistic, predicted, and pessimistic times plus auto-save notifications."],
              ["📈","Module 6 — Graph & Visualization",       "bg-[#8F2E0E]/15",  "border-[#B83E18]/30",  "Bar chart, line chart, radar chart, and factor impact grid via Recharts."],
              ["✅","Module 8 — Error Handling / Validation", "bg-amber-900/20",  "border-amber-700/30",  "Name, gender, and race time validation. Environmental warnings. Athlete lookup helpers."],
              ["📖","Module 9 — Documentation / Help Page",   "bg-[#162F7A]/20",  "border-[#3A6BC8]/20",  "You're here! User guide, algorithm explanation, glossary, and feature overview."],
            ].map(([emoji, title, bg, border, desc]) => (
              <div key={title} className={`p-6 ${bg} rounded-2xl border-2 ${border}`}>
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className="text-base font-bold text-white mb-1">{title}</h3>
                <p className="text-[#7A90B8] text-sm">{desc}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default DocumentationPage;