// ================================================================
// MODULE 9: Documentation / Help Page
// ================================================================

import { NavBar } from "./HomePage";

const DocumentationPage = ({ docsTab, setDocsTab, setCurrentPage, mobileMenuOpen, setMobileMenuOpen, Toast, darkMode, toggleDarkMode }) => {
  const dm = darkMode;
  const bg   = dm ? "bg-[#090909]" : "bg-white";
  const card = dm ? "bg-[#080808] border border-[#b19149]/20" : "bg-white border border-gray-200";
  const text = dm ? "text-[#f8d06b]" : "text-black";
  const muted = dm ? "text-[#a78b3c]" : "text-gray-600";
  const body  = dm ? "text-[#e3d38b]" : "text-gray-700";

  const TABS = [
    { key:"guide",     label:"📋 User Guide" },
    { key:"algorithm", label:"🔢 Algorithm"  },
    { key:"glossary",  label:"📖 Glossary"   },
    { key:"features",  label:"⚡ Features"   },
  ];

  return (
    <div className={`min-h-screen ${bg} p-5`}>
      <Toast/>
      <div className="max-w-5xl mx-auto">
        <NavBar page="docs" setCurrentPage={setCurrentPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} customAthleteCount={0} darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>

        <div className={`${dm? 'bg-[#050505] border border-[#b19149]/20 rounded-2xl shadow-xl p-10 mb-6 text-white' : 'bg-white border border-gray-200 rounded-2xl shadow p-10 mb-6 text-black'}`}>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#1A3FA0] flex items-center justify-center text-5xl shrink-0">📖</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Help & Documentation</h1>
              <p className={`${dm? 'text-lg text-[#7A90B8]' : 'text-lg text-gray-600'}`}>Everything you need to use RunPredict effectively</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setDocsTab(t.key)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${docsTab===t.key ? "bg-[#f8d06b] text-black shadow-lg" : dm ? "bg-[#080808] text-[#f8d06b] hover:bg-[#1d1d1d] border border-[#b19149]/20" : "bg-[#fef3c7] text-[#9a7300] hover:bg-[#fde68a] border border-[#f8d06b]/30"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {docsTab === "guide" && (
          <div className="space-y-4">
            {[
              {step:1,title:"Select Your Event",           icon:"🎯",content:"Choose 100m or 200m first. This filters the athlete dropdown and sets the valid race time range."},
              {step:2,title:"Enter or Search an Athlete",  icon:"🔍",content:"Type a name to search. A dropdown shows matching athletes. New names are auto-saved when you run the simulation."},
              {step:3,title:"Set Environmental Conditions",icon:"🌡️",content:"Adjust tailwind, temperature, humidity, and altitude. Warnings appear for out-of-range conditions. Tailwind above +2.0 m/s flags the result as wind-assisted."},
              {step:4,title:"Set Athlete Metrics",         icon:"💪",content:"Adjust VO2 Max (40–85). This represents the athlete's current aerobic capacity."},
              {step:5,title:"Calculate",                   icon:"🚀",content:"Click Calculate Prediction. Results show optimistic, predicted, and pessimistic times plus charts and a factor breakdown."},
            ].map(({step,title,icon,content})=>(
              <div key={step} className={`${card} rounded-2xl shadow-lg p-6 flex gap-5`}>
                <div className="w-10 h-10 rounded-full bg-[#B83E18] text-white flex items-center justify-center font-bold shrink-0 text-sm">{step}</div>
                <div><div className={`font-bold ${text} mb-2`}>{icon} {title}</div><p className={`${body} text-sm leading-relaxed`}>{content}</p></div>
              </div>
            ))}
          </div>
        )}

        {docsTab === "algorithm" && (
          <div className={`${card} rounded-2xl shadow-xl p-8`}>
            <h2 className={`text-2xl font-bold ${text} mb-4`}>How the Prediction Works</h2>
            <p className={`${body} text-sm leading-relaxed mb-5`}>Each factor produces a multiplier centred around 1.0. The formula normalises against the athlete's original conditions so only the <strong className={text}>change</strong> in conditions affects the prediction.</p>
            <div className={`${dm ? "p-4 bg-[#0B0B0B] border border-[#b19149]/20" : "p-4 bg-[#fef3c7] border border-[#f8d06b]/30"} rounded-xl border font-mono text-sm mb-6 overflow-auto`}>
              <div className={`text-xs ${muted} mb-2`}>// Prediction Formula</div>
              <div className={`font-bold ${text}`}>Predicted = raceTime × (newMultipliers / originalMultipliers)</div>
              <div className={`text-xs ${muted} mt-2 font-sans`}>where multipliers = track × wind × altitude × humidity × temperature</div>
            </div>
            <div className="space-y-3 mb-6">
              {[
                ["Track Condition",              "text-[#f8d06b]", "bg-[#0B0B0B] border-[#b19149]/20",      "Optimal = 1.000 · Good = 1.002 · Fair = 1.005 · Poor = 1.010","Polyurethane tracks rated optimal; worn/wet surfaces increase time."],
                ["Wind — IAAF Standard",         "text-[#f8d06b]", "bg-[#0B0B0B] border-[#b19149]/20",    "100m: 1−(wind×0.0805×0.01) | 200m: 1−(wind×0.0405×0.01)","IAAF wind correction. Tailwind lowers time; headwind raises it."],
                ["Altitude — Air Density",       "text-[#f8d06b]", "bg-[#0B0B0B] border-[#b19149]/20","airDensity = e^(−alt/8500) → altMult = 0.9+(airDensity×0.1)","Thinner air at altitude reduces drag, benefiting sprinters."],
                ["Temperature — Bell Curve",     "text-[#f8d06b]", "bg-[#0B0B0B] border-[#b19149]/20",   "tempMult = 1+(temp−26)²×0.00015","Optimal at ~26°C. Deviation in either direction increases race time."],
                ["Humidity — Air Density Effect", "text-[#f8d06b]", "bg-[#0B0B0B] border-[#b19149]/20",          "humidityMult = 1−(humidity×0.00002)","Humid air is slightly less dense, marginally reducing drag."],
              ].map(([factor,col,styles,formula,desc])=>(
                <div key={factor} className={`p-4 rounded-xl border-2 ${dm ? styles : "bg-[#fef3c7] border-[#f8d06b]/30"}`}>
                  <div className={`font-bold text-sm mb-2 ${dm ? col : "text-[#92400e]"}`}>{factor}</div>
                  <div className={`font-mono text-xs rounded-lg px-3 py-2 mb-2 ${dm ? "text-[#e3d38b] bg-[#111111]" : "text-[#92400e] bg-[#fff7cc]"}`}>{formula}</div>
                  <div className={`${muted} text-sm`}>{desc}</div>
                </div>
              ))}
            </div>
            <div className={`${dm ? "p-5 rounded-xl border-2 mb-5 bg-[#0B0B0B] border-[#b19149]/20" : "p-5 rounded-xl border-2 mb-5 bg-[#fef3c7] border-[#f8d06b]/30"}`}>
              <div className={`font-bold text-sm mb-2 ${dm ? "text-[#f8d06b]" : "text-[#92400e]"}`}>🤖 XGBoost Machine Learning Correction</div>
              <div className={`${dm ? "font-mono text-xs rounded-lg px-3 py-2 mb-2 text-[#e3d38b] bg-[#111111]" : "font-mono text-xs rounded-lg px-3 py-2 mb-2 text-[#92400e] bg-[#fff7cc]"}`}>Final = physicsTime × 0.70 + xgboostTime × 0.30</div>
              <p className={`${muted} text-sm`}>Pre-trained on 151 athletes. Physics (70%) blended with XGBoost (30%) because the limited dataset size makes the physics model more reliable for extrapolation.</p>
            </div>
            <div className={`${dm ? "p-4 rounded-xl border-2 text-sm bg-[#0B0B0B] border-[#b19149]/20 text-[#e3d38b]" : "p-4 rounded-xl border-2 text-sm bg-[#fef3c7] border-[#f8d06b]/30 text-[#7c4c11]"}`}>
              <strong className={`${dm ? "text-[#f8d06b]" : "text-[#92400e]"}`}>Accuracy note:</strong> ~70% accuracy (±0.20s) for standard conditions. Actual performance is also influenced by race strategy, reaction time, and biomechanics.
            </div>
          </div>
        )}

        {docsTab === "glossary" && (
          <div className={`${card} rounded-2xl shadow-xl p-8`}>
            <h2 className={`text-2xl font-bold ${text} mb-5`}>Glossary of Terms</h2>
            <div className="space-y-3">
              {[
                ["Recorded Race Time","The athlete's actual recorded time used as the baseline for predictions."],
                ["Tailwind","Wind in the direction of travel. Positive values help. Legal limit for records is +2.0 m/s."],
                ["Headwind","Wind against the direction of travel (negative tailwind). Slows the athlete."],
                ["Wind-Assisted","Result with tailwind >+2.0 m/s. Cannot count for official records."],
                ["VO2 Max","Maximum oxygen consumption rate. Higher = better aerobic capacity."],
                ["Multiplier","A number ~1.0 applied to race time. Above 1.0 = slower. Below 1.0 = faster."],
                ["Optimistic Prediction","Predicted time × 0.995 — best-case scenario."],
                ["Pessimistic Prediction","Predicted time × 1.005 — worst-case scenario."],
                ["IAAF Wind Coefficient","Official wind correction factor. 100m: 0.0805, 200m: 0.0405."],
                ["XGBoost","Extreme Gradient Boosting — ML algorithm used for a correction factor on top of physics."],
                ["Blended Model","Physics (70%) + XGBoost (30%) final prediction."],
                ["Custom Athlete","User-entered athlete not in the built-in database. Auto-saved on first simulation."],
                ["Event Separation","100m and 200m athletes stored separately. Same athlete can have entries per event."],
              ].map(([term,def])=>(
                <div key={term} className="p-4 rounded-xl border border-[#b19149]/20 transition-colors hover:border-[#f8d06b]/40 hover:bg-[#111111]">
                  <div className="font-bold text-sm mb-1 text-[#f8d06b]">{term}</div>
                  <div className={`${body} text-sm`}>{def}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {docsTab === "features" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              ["🏠","Module 1 — Homepage",         "bg-[#0B0B0B] border-[#b19149]/20","Dashboard with stat cards, record holders, and quick actions."],
              ["🏃","Module 2 — Runner Input",      "bg-[#0B0B0B] border-[#b19149]/20","Simulation form with event selector, athlete search, environmental sliders."],
              ["⚙️","Module 3 — Simulation Engine", "bg-[#0B0B0B] border-[#b19149]/20","Physics formula blended with XGBoost ML correction."],
              ["🗄️","Module 4 — Data Storage",     "bg-[#0B0B0B] border-[#b19149]/20","Persistent storage for custom athletes and session history."],
              ["📊","Module 5 — Results Page",      "bg-[#0B0B0B] border-[#b19149]/20","Optimistic, predicted, and pessimistic times with charts."],
              ["📈","Module 6 — Graphs",            "bg-[#0B0B0B] border-[#b19149]/20","Bar, line, and radar charts via Recharts."],
              ["✅","Module 8 — Error Handling",    "bg-[#0B0B0B] border-[#b19149]/20","Validation, environmental warnings, athlete lookup helpers."],
              ["📖","Module 9 — Documentation",     "bg-[#0B0B0B] border-[#b19149]/20","You're here! User guide, algorithm, glossary, feature overview."],
            ].map(([emoji,title,styles,desc])=>(
              <div key={title} className={`p-6 rounded-2xl border-2 ${dm ? styles : "bg-[#fef3c7] border-[#f8d06b]/30"}`}>
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className={`text-base font-bold ${text} mb-1`}>{title}</h3>
                <p className={`${muted} text-sm`}>{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationPage;