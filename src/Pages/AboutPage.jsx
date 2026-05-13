// ================================================================
// ABOUT PAGE
//
// Platform overview, mission statement, feature summary,
// and version information.
// ================================================================

import { TrendingUp, UserPlus } from "lucide-react";
import { NavBar } from "./HomePage";

const AboutPage = ({ setCurrentPage, mobileMenuOpen, setMobileMenuOpen, Toast }) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-5">
    <Toast/>
    <div className="max-w-6xl mx-auto">
      <NavBar page="about" setCurrentPage={setCurrentPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} customAthleteCount={0}/>
      <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-3xl shadow-2xl p-12 mb-8 text-white">
        <div className="flex items-center gap-6">
          <div className="text-8xl">🏃</div>
          <div>
            <h1 className="text-5xl font-bold mb-3">About RunPredict</h1>
            <p className="text-2xl opacity-90">Advanced Sprint Performance Prediction Platform</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <TrendingUp className="text-red-600" size={28}/>Our Mission
          </h2>
          <p className="text-gray-700 leading-relaxed">
            RunPredict helps athletes, coaches, and sports scientists predict sprint
            performance across 100m and 200m events using real recorded race data
            and environmental conditions.
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <UserPlus className="text-indigo-600" size={28}/>Real Race Data
          </h2>
          <p className="text-gray-700 leading-relaxed">
            The simulator uses <strong>151 real international sprint performances</strong> as
            baselines. Each athlete's recorded race conditions — wind, temperature,
            humidity, and altitude — are pre-filled automatically.
          </p>
        </div>
      </div>

      {/* Algorithm Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">How the Prediction Works</h2>
        <p className="text-gray-600 text-center mb-6">
          The simulation engine adjusts an athlete's real recorded race time based on how conditions change.
          Each factor produces a multiplier centred around 1.0 — above 1.0 slows the athlete, below 1.0 speeds them up.
        </p>

        {/* Core Formula */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-6 font-mono text-sm">
          <p className="text-gray-400 mb-1">// Prediction Formula (SimulationEngine.js)</p>
          <p className="text-gray-800 font-bold">Predicted = raceTime × (newMultipliers / originalMultipliers)</p>
          <p className="text-gray-400 mt-2 font-sans text-xs">where multipliers = track × wind × altitude × humidity × temperature</p>
        </div>

        {/* Factor Cards */}
        <div className="flex flex-col gap-4">
          {[
            {
              title: "Track Condition",
              color: "text-red-600",
              bg: "from-red-50 to-orange-50",
              border: "border-red-200",
              formula: "Optimal = 1.000 · Good = 1.002 · Fair = 1.005 · Poor = 1.010",
              desc: "Polyurethane tracks rated optimal; worn or wet surfaces increase time proportionally.",
            },
            {
              title: "Wind (IAAF Standard)",
              color: "text-blue-600",
              bg: "from-blue-50 to-cyan-50",
              border: "border-blue-200",
              formula: "100m: 1 − (wind × 0.0805 × 0.01)   |   200m: 1 − (wind × 0.0405 × 0.01)",
              desc: "Uses the IAAF-standard wind correction coefficient. Tailwind (positive) lowers time; headwind (negative) raises it. Coefficients differ between 100m and 200m due to race geometry.",
            },
            {
              title: "Altitude (Air Density Model)",
              color: "text-green-600",
              bg: "from-green-50 to-emerald-50",
              border: "border-green-200",
              formula: "airDensity = e^(−altitude / 8500)   →   altitudeMult = 0.9 + (airDensity × 0.1)",
              desc: "Uses an exponential atmospheric decay model. At higher altitudes, thinner air reduces aerodynamic drag, giving sprinters a small advantage.",
            },
            {
              title: "Temperature (Bell Curve Model)",
              color: "text-amber-600",
              bg: "from-amber-50 to-yellow-50",
              border: "border-amber-200",
              formula: "tempMult = 1 + (temp − 26)² × 0.00015",
              desc: "Based on sports science research showing optimal sprint performance at around 26°C. Deviation in either direction — too hot or too cold — increases race time symmetrically.",
            },
            {
              title: "Humidity (Air Density Effect)",
              color: "text-purple-600",
              bg: "from-purple-50 to-indigo-50",
              border: "border-purple-200",
              formula: "humidityMult = 1 − (humidity × 0.00002)",
              desc: "Humid air is slightly less dense than dry air, which marginally reduces drag and benefits sprinters. The effect is small but physically accurate.",
            },
          ].map(({ title, color, bg, border, formula, desc }) => (
            <div key={title} className={`p-5 bg-gradient-to-br ${bg} rounded-xl border ${border}`}>
              <h3 className={`text-lg font-bold ${color} mb-2`}>{title}</h3>
              <code className="block text-sm text-gray-700 bg-white bg-opacity-60 rounded-lg px-4 py-2 mb-2 font-mono">{formula}</code>
              <p className="text-gray-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            ["🎯","Multi-Event Simulator",    "from-red-50 to-orange-50",   "border-red-200",   "100m and 200m prediction engine using real race data."],
            ["📊","Data Visualization",       "from-blue-50 to-cyan-50",    "border-blue-200",  "Bar chart, line chart, and radar diagram."],
            ["🗄️","Real Athlete Database",   "from-green-50 to-emerald-50","border-green-200", "151 athletes from international competitions."],
            ["✨","Auto-Save Athletes",        "from-indigo-50 to-purple-50","border-indigo-200","Unknown athletes saved automatically on simulation."],
            ["🌡️","Environmental Analysis",  "from-amber-50 to-yellow-50", "border-amber-200", "Wind, temperature, humidity, altitude conditions."],
            ["⚡","Instant Predictions",       "from-pink-50 to-rose-50",    "border-pink-200",  "Optimistic, realistic, pessimistic scenarios."],
          ].map(([emoji, title, grad, border, desc]) => (
            <div key={title} className={`p-6 bg-gradient-to-br ${grad} rounded-xl border-2 ${border}`}>
              <div className="text-4xl mb-3">{emoji}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
              <p className="text-gray-700 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
        <p className="text-gray-600 mb-1"><strong>RunPredict</strong> — Advanced Sprint Performance Prediction Platform</p>
        <p className="text-sm text-gray-500">Version 2.1 | Educational & Training Purposes | © 2026</p>
      </div>
    </div>
  </div>
);

export default AboutPage;