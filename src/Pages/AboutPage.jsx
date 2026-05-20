// ================================================================
// ABOUT PAGE
//
// Platform overview, mission statement, feature summary,
// and version information.
// ================================================================

import { TrendingUp, UserPlus } from "lucide-react";
import { NavBar } from "./HomePage";

const AboutPage = ({ setCurrentPage, mobileMenuOpen, setMobileMenuOpen, Toast }) => (
  <div className="min-h-screen bg-[#1E2A3A] p-5">
    <Toast/>
    <div className="max-w-6xl mx-auto">
      <NavBar
        page="about"
        setCurrentPage={setCurrentPage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        customAthleteCount={0}
      />

      {/* Hero banner */}
      <div className="bg-[#0A1628] rounded-3xl shadow-2xl p-12 mb-8 text-white border border-white/10">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-[#B83E18] flex items-center justify-center text-6xl shrink-0">
            🏃
          </div>
          <div>
            <h1 className="text-5xl font-bold mb-3">About RunPredict</h1>
            <p className="text-2xl text-[#7A90B8]">Advanced Sprint Performance Prediction Platform</p>
          </div>
        </div>
      </div>

      {/* Mission + Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#131E2E] rounded-2xl shadow-xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <TrendingUp className="text-[#B83E18]" size={28}/>Our Mission
          </h2>
          <p className="text-[#C4D0EF] leading-relaxed">
            RunPredict helps athletes, coaches, and sports scientists predict sprint
            performance across 100m and 200m events using real recorded race data
            and environmental conditions.
          </p>
        </div>
        <div className="bg-[#131E2E] rounded-2xl shadow-xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <UserPlus className="text-[#3A6BC8]" size={28}/>Real Race Data
          </h2>
          <p className="text-[#C4D0EF] leading-relaxed">
            The simulator uses <strong className="text-white">151 real international sprint performances</strong> as
            baselines. Each athlete's recorded race conditions — wind, temperature,
            humidity, and altitude — are pre-filled automatically.
          </p>
        </div>
      </div>

      {/* Algorithm Section */}
      <div className="bg-[#131E2E] rounded-2xl shadow-xl p-8 mb-8 border border-white/10">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">How the Prediction Works</h2>
        <p className="text-[#7A90B8] text-center mb-6">
          The simulation engine adjusts an athlete's real recorded race time based on how conditions change.
          Each factor produces a multiplier centred around 1.0 — above 1.0 slows the athlete, below 1.0 speeds them up.
        </p>

        {/* Core Formula */}
        <div className="bg-[#0A1628] rounded-xl border border-white/10 p-5 mb-6 font-mono text-sm">
          <p className="text-[#7A90B8] mb-1">// Prediction Formula (SimulationEngine.js)</p>
          <p className="text-white font-bold">Predicted = raceTime × (newMultipliers / originalMultipliers)</p>
          <p className="text-[#7A90B8] mt-2 font-sans text-xs">where multipliers = track × wind × altitude × humidity × temperature</p>
        </div>

        {/* Factor Cards */}
        <div className="flex flex-col gap-4">
          {[
            {
              title:   "Track Condition",
              accent:  "text-[#B83E18]",
              bg:      "bg-[#B83E18]/10",
              border:  "border-[#B83E18]/30",
              formula: "Optimal = 1.000 · Good = 1.002 · Fair = 1.005 · Poor = 1.010",
              desc:    "Polyurethane tracks rated optimal; worn or wet surfaces increase time proportionally.",
            },
            {
              title:   "Wind (IAAF Standard)",
              accent:  "text-[#3A6BC8]",
              bg:      "bg-[#1A3FA0]/10",
              border:  "border-[#3A6BC8]/30",
              formula: "100m: 1 − (wind × 0.0805 × 0.01)   |   200m: 1 − (wind × 0.0405 × 0.01)",
              desc:    "Uses the IAAF-standard wind correction coefficient. Tailwind (positive) lowers time; headwind (negative) raises it. Coefficients differ between 100m and 200m due to race geometry.",
            },
            {
              title:   "Altitude (Air Density Model)",
              accent:  "text-emerald-400",
              bg:      "bg-emerald-900/20",
              border:  "border-emerald-700/30",
              formula: "airDensity = e^(−altitude / 8500)   →   altitudeMult = 0.9 + (airDensity × 0.1)",
              desc:    "Uses an exponential atmospheric decay model. At higher altitudes, thinner air reduces aerodynamic drag, giving sprinters a small advantage.",
            },
            {
              title:   "Temperature (Bell Curve Model)",
              accent:  "text-amber-400",
              bg:      "bg-amber-900/20",
              border:  "border-amber-700/30",
              formula: "tempMult = 1 + (temp − 26)² × 0.00015",
              desc:    "Based on sports science research showing optimal sprint performance at around 26°C. Deviation in either direction — too hot or too cold — increases race time symmetrically.",
            },
            {
              title:   "Humidity (Air Density Effect)",
              accent:  "text-[#90A8E0]",
              bg:      "bg-[#162F7A]/20",
              border:  "border-[#3A6BC8]/20",
              formula: "humidityMult = 1 − (humidity × 0.00002)",
              desc:    "Humid air is slightly less dense than dry air, which marginally reduces drag and benefits sprinters. The effect is small but physically accurate.",
            },
            {
              title:   "XGBoost ML Correction",
              accent:  "text-[#D95A30]",
              bg:      "bg-[#8F2E0E]/15",
              border:  "border-[#B83E18]/30",
              formula: "Final = physicsTime × 0.70 + xgboostTime × 0.30",
              desc:    "A pre-trained XGBoost model trained on the 151-athlete dataset applies a correction factor on top of the physics prediction. The 70/30 blend favours the physics model due to the limited dataset size — with more data, the XGBoost weighting could be increased.",
            },
          ].map(({ title, accent, bg, border, formula, desc }) => (
            <div key={title} className={`p-5 ${bg} rounded-xl border ${border}`}>
              <h3 className={`text-lg font-bold ${accent} mb-2`}>{title}</h3>
              <code className="block text-sm text-[#C4D0EF] bg-black/20 rounded-lg px-4 py-2 mb-2 font-mono">{formula}</code>
              <p className="text-[#7A90B8] text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Features */}
      <div className="bg-[#131E2E] rounded-2xl shadow-xl p-8 mb-8 border border-white/10">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            ["🎯","Multi-Event Simulator",   "bg-[#B83E18]/10",  "border-[#B83E18]/30",  "100m and 200m prediction engine using real race data."],
            ["📊","Data Visualization",      "bg-[#1A3FA0]/10",  "border-[#3A6BC8]/30",  "Bar chart, line chart, and radar diagram."],
            ["🗄️","Real Athlete Database",  "bg-emerald-900/20","border-emerald-700/30","151 athletes from international competitions."],
            ["🤖","XGBoost ML Correction",   "bg-[#8F2E0E]/15",  "border-[#B83E18]/30",  "Physics formula blended with a trained XGBoost model for improved prediction accuracy."],
            ["🌡️","Environmental Analysis", "bg-amber-900/20",  "border-amber-700/30",  "Wind, temperature, humidity, altitude conditions."],
            ["⚡","Instant Predictions",      "bg-[#162F7A]/20",  "border-[#3A6BC8]/20",  "Optimistic, realistic, pessimistic scenarios."],
          ].map(([emoji, title, bg, border, desc]) => (
            <div key={title} className={`p-6 ${bg} rounded-xl border-2 ${border}`}>
              <div className="text-4xl mb-3">{emoji}</div>
              <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
              <p className="text-[#7A90B8] text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center p-6 bg-[#131E2E] rounded-2xl shadow-xl border border-white/10">
        <p className="text-[#C4D0EF] mb-1"><strong className="text-white">RunPredict</strong> — Advanced Sprint Performance Prediction Platform</p>
        <p className="text-sm text-[#7A90B8]">Version 2.1 | Educational & Training Purposes | © 2026</p>
      </div>
    </div>
  </div>
);

export default AboutPage;