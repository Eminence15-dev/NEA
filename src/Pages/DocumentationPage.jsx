// ================================================================
// MODULE 9: Documentation / Help Page
//
// Four-tab help centre:
//   User Guide  — step-by-step how to use the simulator
//   Algorithm   — full formula breakdown with multiplier explanations
//   Glossary    — definitions of all key terms used in the app
//   Features    — overview of every module in the system
// ================================================================

import { NavBar } from "./HomePage";

/**
 * @param {string}   docsTab       — active tab key ("guide" | "algorithm" | "glossary" | "features")
 * @param {Function} setDocsTab    — switch tab
 * @param {Function} setCurrentPage
 * @param {boolean}  mobileMenuOpen
 * @param {Function} setMobileMenuOpen
 * @param {Function} Toast
 */
const DocumentationPage = ({ docsTab, setDocsTab, setCurrentPage, mobileMenuOpen, setMobileMenuOpen, Toast }) => {
  const TABS = [
    { key: "guide",     label: "📋 User Guide" },
    { key: "algorithm", label: "🔢 Algorithm" },
    { key: "glossary",  label: "📖 Glossary" },
    { key: "features",  label: "⚡ Features" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-5">
      <Toast/>
      <div className="max-w-5xl mx-auto">
        <NavBar page="docs" setCurrentPage={setCurrentPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} customAthleteCount={0}/>

        {/* Header */}
        <div className="bg-gradient-to-br from-teal-600 to-blue-600 rounded-2xl shadow-xl p-10 mb-6 text-white">
          <div className="flex items-center gap-5">
            <div className="text-6xl">📖</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Help & Documentation</h1>
              <p className="text-lg opacity-90">Everything you need to use RunPredict effectively</p>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setDocsTab(t.key)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${docsTab===t.key?"bg-teal-600 text-white shadow":"bg-white text-gray-700 hover:bg-gray-100 shadow-sm"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── User Guide ── */}
        {docsTab === "guide" && (
          <div className="space-y-4">
            {[
              { step:1, title:"Select Your Event",          icon:"🎯", content:"On the Simulator page, choose 100m, 200m, or 400m first. This filters the athlete dropdown and sets the valid PB range for the event." },
              { step:2, title:"Enter or Search an Athlete",  icon:"🔍", content:"Type a name in the Athlete Name field. A dropdown shows matching athletes for that event. Typing a new name will auto-save that athlete to the database when you run the simulation." },
              { step:3, title:"Enter the Personal Best",     icon:"⏱️", content:"Enter the athlete's PB in seconds. Pre-filled if selected from the database. Must be within the valid range (e.g. 9.50s–20.00s for 100m)." },
              { step:4, title:"Set Environmental Conditions",icon:"🌡️", content:"Adjust tailwind (m/s), temperature (°C), humidity (%), and altitude (m). Warning banners appear for out-of-range conditions. Tailwind above +2.0 m/s flags the result as wind-assisted." },
              { step:5, title:"Set Athlete Metrics",         icon:"💪", content:"Adjust Fitness Level (50–100%) and VO2 Max (40–85). These represent the athlete's current physical condition, not their absolute potential." },
              { step:6, title:"Calculate",                   icon:"🚀", content:"Click Calculate Prediction. Results show an optimistic (×0.995), central predicted, and pessimistic (×1.005) time, along with charts and a factor breakdown." },
            ].map(({ step, title, icon, content }) => (
              <div key={step} className="bg-white rounded-2xl shadow p-6 flex gap-5">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">{step}</div>
                <div><div className="font-bold text-gray-800 mb-2">{icon} {title}</div><p className="text-gray-600 text-sm leading-relaxed">{content}</p></div>
              </div>
            ))}
          </div>
        )}

        {/* ── Algorithm ── */}
        {docsTab === "algorithm" && (
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">How the Prediction Works</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              The simulation engine multiplies the athlete's personal best by a series of environmental and physiological multipliers.
              Each factor produces a value close to 1.0 — above 1.0 slows the athlete down, below 1.0 speeds them up.
            </p>
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200 font-mono text-sm text-gray-800 mb-6 overflow-auto">
              <div className="text-xs text-gray-400 mb-2">// Prediction Formula (SimulationEngine.js)</div>
              Predicted = PB × track × wind × fitness × altitude × experience × humidity × temperature × vo2
            </div>
            <div className="space-y-3">
              {[
                ["Track",        "Optimal = 1.000 · Good = 1.002 · Fair = 1.005 · Poor = 1.010"],
                ["Wind",         "1 + (tailwind × −0.001)  →  tailwind helps (↓ time), headwind hurts (↑ time)"],
                ["Fitness",      "1 + (100 − fitness%) × 0.0002  →  lower fitness = slower"],
                ["Altitude",     "1 + altitude × −0.000001  →  thinner air slightly benefits sprints"],
                ["Experience",   "Beginner = 1.015 · Intermediate = 1.005 · Advanced = 1.001 · Elite = 1.000"],
                ["Humidity",     "1 + (humidity − 50) × 0.00005  →  above 50% humidity = slower"],
                ["Temperature",  "1 + |temp − 20| × 0.0002  →  deviation from 20°C in either direction = slower"],
                ["VO2 Max",      "1 + (70 − vo2max) × 0.0005  →  lower VO2 max = slower"],
              ].map(([factor, formula]) => (
                <div key={factor} className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                  <div className="font-bold text-teal-800 text-sm mb-1">{factor}</div>
                  <div className="font-mono text-xs text-gray-700">{formula}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-sm text-amber-800">
              <strong>Accuracy note:</strong> This model achieves approximately 70% accuracy (±0.20s) for standard conditions.
              It is a simplified educational model — actual performance is also influenced by race strategy, mental state, reaction time, and individual biomechanics.
            </div>
          </div>
        )}

        {/* ── Glossary ── */}
        {docsTab === "glossary" && (
          <div className="bg-white rounded-2xl shadow p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">Glossary of Terms</h2>
            <div className="space-y-3">
              {[
                ["Personal Best (PB)",     "The athlete's best ever recorded time for the event distance."],
                ["Season Best (SB)",       "The athlete's best time during the current competitive season."],
                ["Tailwind",               "Wind blowing in the direction of travel. Positive values help the athlete. Legal limit for records is +2.0 m/s."],
                ["Headwind",               "Wind blowing against the direction of travel (negative tailwind). Slows the athlete down."],
                ["Wind-Assisted",          "A result with tailwind exceeding +2.0 m/s. Cannot count for official records."],
                ["VO2 Max",                "The maximum rate at which the body can consume oxygen. Higher = better aerobic capacity."],
                ["Fitness Level",          "A percentage (50–100%) representing the athlete's current condition relative to their peak."],
                ["Multiplier",             "A number close to 1.0 applied to the PB. Above 1.0 = slower. Below 1.0 = faster."],
                ["Optimistic Prediction",  "The predicted time × 0.995 — a best-case scenario on the day."],
                ["Pessimistic Prediction", "The predicted time × 1.005 — a worst-case scenario on the day."],
                ["Custom Athlete",         "An athlete entered by the user not found in the built-in database. Auto-saved on first simulation."],
                ["Dynamic Y-Axis",         "Chart scale starts near dataMin rather than zero, making small time differences visually distinct."],
                ["Event Separation",       "100m and 200m athletes are stored separately. The same athlete can have independent entries per event."],
              ].map(([term, def]) => (
                <div key={term} className="p-4 rounded-xl border-2 border-gray-100 hover:border-teal-200 transition-colors">
                  <div className="font-bold text-gray-800 text-sm mb-1">{term}</div>
                  <div className="text-gray-600 text-sm">{def}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Features ── */}
        {docsTab === "features" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              ["🏠","Module 1 — Homepage / Interface",         "from-orange-50 to-yellow-50","border-orange-200","Dashboard with stat cards, record holders, recent simulations, and quick actions."],
              ["🏃","Module 2 — Runner Input Page",            "from-red-50 to-orange-50",   "border-red-200",   "Simulation form with event selector, athlete search, PB input, environmental sliders."],
              ["⚙️","Module 3 — Simulation Engine",           "from-purple-50 to-indigo-50","border-purple-200","Pure calculation module. Runs the 8-factor multiplier formula to produce predictions."],
              ["🗄️","Module 4 — Data Storage Module",         "from-green-50 to-teal-50",   "border-green-200", "Persistent storage for custom athletes and session history using window.storage."],
              ["📊","Module 5 — Results / Output Page",       "from-blue-50 to-cyan-50",    "border-blue-200",  "Displays optimistic, predicted, and pessimistic times plus auto-save notifications."],
              ["📈","Module 6 — Graph & Visualization",       "from-pink-50 to-rose-50",    "border-pink-200",  "Bar chart, line chart, radar chart, and factor impact grid via Recharts."],
              ["✅","Module 8 — Error Handling / Validation", "from-amber-50 to-yellow-50", "border-amber-200", "Name, gender, and PB validation. Environmental warnings. Athlete lookup helpers."],
              ["📖","Module 9 — Documentation / Help Page",   "from-teal-50 to-blue-50",    "border-teal-200",  "You're here! User guide, algorithm explanation, glossary, and feature overview."],
            ].map(([emoji, title, grad, border, desc]) => (
              <div key={title} className={`p-6 bg-gradient-to-br ${grad} rounded-2xl border-2 ${border}`}>
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className="text-base font-bold text-gray-800 mb-1">{title}</h3>
                <p className="text-gray-700 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default DocumentationPage;