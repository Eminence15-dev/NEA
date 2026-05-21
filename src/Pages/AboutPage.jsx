// ================================================================
// ABOUT PAGE
// ================================================================

import { TrendingUp, UserPlus } from "lucide-react";
import { NavBar } from "./HomePage";

const AboutPage = ({ setCurrentPage, mobileMenuOpen, setMobileMenuOpen, Toast, darkMode, toggleDarkMode }) => {
  const dm = darkMode;
  const bg   = dm ? "bg-[#090909]" : "bg-white";
  const card = dm ? "bg-[#080808] border border-[#b19149]/20" : "bg-white border border-gray-200";
  const text = dm ? "text-[#f8d06b]" : "text-black";
  const muted = dm ? "text-[#a78b3c]" : "text-gray-600";
  const body  = dm ? "text-[#e3d38b]" : "text-gray-700";

  return (
    <div className={`min-h-screen ${bg} p-5`}>
      <Toast/>
      <div className="max-w-6xl mx-auto">
        <NavBar page="about" setCurrentPage={setCurrentPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} customAthleteCount={0} darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>

        <div className={`${dm? 'bg-[#050505] border border-[#b19149]/20 rounded-3xl shadow-2xl p-12 mb-8 text-[#f8d06b]' : 'bg-white border border-gray-200 rounded-3xl p-12 mb-8 text-black'}`}>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-[#B83E18] flex items-center justify-center text-6xl shrink-0">🏃</div>
            <div>
              <h1 className="text-5xl font-bold mb-3">About RunPredict</h1>
              <p className={`text-2xl ${dm? 'text-[#a78b3c]' : 'text-gray-600'}`}>Advanced Sprint Performance Prediction Platform</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`${card} rounded-2xl shadow-xl p-8`}>
            <h2 className={`text-2xl font-bold ${text} mb-4 flex items-center gap-3`}><TrendingUp className="text-[#B83E18]" size={28}/>Our Mission</h2>
            <p className={`${body} leading-relaxed`}>RunPredict helps athletes, coaches, and sports scientists predict sprint performance across 100m and 200m events using real recorded race data and environmental conditions.</p>
          </div>
          <div className={`${card} rounded-2xl shadow-xl p-8`}>
            <h2 className={`text-2xl font-bold ${text} mb-4 flex items-center gap-3`}><UserPlus className="text-[#f8d06b]" size={28}/>Real Race Data</h2>
            <p className={`${body} leading-relaxed`}>The simulator uses <strong className={text}>151 real international sprint performances</strong> as baselines. Each athlete's recorded race conditions — wind, temperature, humidity, and altitude — are pre-filled automatically.</p>
          </div>
        </div>

        <div className={`${card} rounded-2xl shadow-xl p-8 mb-8`}>
          <h2 className={`text-3xl font-bold ${text} mb-2 text-center`}>How the Prediction Works</h2>
          <p className={`${muted} text-center mb-6`}>Each factor produces a multiplier centred around 1.0 — above 1.0 slows the athlete, below 1.0 speeds them up.</p>
          <div className="bg-[#0B0B0B] border border-[#b19149]/20 rounded-xl p-5 mb-6 font-mono text-sm">
            <p className={`${muted} mb-1`}>// Prediction Formula (SimulationEngine.js)</p>
            <p className={`${text} font-bold`}>Predicted = raceTime × (newMultipliers / originalMultipliers)</p>
            <p className={`${muted} mt-2 font-sans text-xs`}>where multipliers = track × wind × altitude × humidity × temperature</p>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { title:"Track Condition",           accent:"text-[#f8d06b]",  bg:"bg-[#0B0B0B]",    border:"border-[#b19149]/20",  formula:"Optimal = 1.000 · Good = 1.002 · Fair = 1.005 · Poor = 1.010", desc:"Polyurethane tracks rated optimal; worn or wet surfaces increase time proportionally." },
              { title:"Wind (IAAF Standard)",       accent:"text-[#f8d06b]",  bg:"bg-[#0B0B0B]",     border:"border-[#b19149]/20",    formula:"100m: 1 − (wind × 0.0805 × 0.01)   |   200m: 1 − (wind × 0.0405 × 0.01)", desc:"IAAF-standard wind correction. Tailwind lowers time; headwind raises it." },
              { title:"Altitude (Air Density)",     accent:"text-[#f8d06b]",  bg:"bg-[#0B0B0B]",  border:"border-[#b19149]/20",  formula:"airDensity = e^(−altitude / 8500) → altitudeMult = 0.9 + (airDensity × 0.1)", desc:"Exponential atmospheric decay model. Thinner air at altitude reduces drag." },
              { title:"Temperature (Bell Curve)",   accent:"text-[#f8d06b]",  bg:"bg-[#0B0B0B]",    border:"border-[#b19149]/20",    formula:"tempMult = 1 + (temp − 26)² × 0.00015", desc:"Optimal sprint performance at ~26°C. Deviation in either direction increases race time." },
              { title:"Humidity (Air Density)",     accent:"text-[#f8d06b]",  bg:"bg-[#0B0B0B]",  border:"border-[#b19149]/20",   formula:"humidityMult = 1 − (humidity × 0.00002)", desc:"Humid air is slightly less dense, marginally reducing drag." },
              { title:"XGBoost ML Correction",      accent:"text-[#f8d06b]",  bg:"bg-[#0B0B0B]",     border:"border-[#b19149]/20",      formula:"Final = physicsTime × 0.70 + xgboostTime × 0.30", desc:"Pre-trained XGBoost model blended 30/70 with physics for improved accuracy." },
            ].map(({title,accent,bg,border,formula,desc})=>(
              <div key={title} className={`p-5 ${bg} rounded-xl border ${border}`}>
                <h3 className={`text-lg font-bold ${accent} mb-2`}>{title}</h3>
                <code className="block text-sm rounded-lg px-4 py-2 mb-2 font-mono text-[#e3d38b] bg-[#111111]">{formula}</code>
                <p className={`${muted} text-sm`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} rounded-2xl shadow-xl p-8 mb-8`}>
          <h2 className={`text-3xl font-bold ${text} mb-6 text-center`}>Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              ["🎯","Multi-Event Simulator",  "bg-[#0B0B0B] border-[#b19149]/20", "100m and 200m prediction engine using real race data."],
              ["📊","Data Visualization",     "bg-[#0B0B0B] border-[#b19149]/20",     "Bar chart, line chart, and radar diagram."],
              ["🗄️","Real Athlete Database", "bg-[#0B0B0B] border-[#b19149]/20","151 athletes from international competitions."],
              ["🤖","XGBoost ML Correction",  "bg-[#0B0B0B] border-[#b19149]/20",       "Physics formula blended with XGBoost for improved accuracy."],
              ["🌡️","Environmental Analysis","bg-[#0B0B0B] border-[#b19149]/20",   "Wind, temperature, humidity, altitude conditions."],
              ["⚡","Instant Predictions",    "bg-[#0B0B0B] border-[#b19149]/20", "Optimistic, realistic, pessimistic scenarios."],
            ].map(([emoji,title,styles,desc])=>(
              <div key={title} className={`p-6 ${styles} rounded-xl border-2`}>
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className={`text-lg font-bold ${text} mb-1`}>{title}</h3>
                <p className={`${muted} text-sm`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`text-center p-6 ${card} rounded-2xl shadow-xl`}>
          <p className={`${body} mb-1`}><strong className={text}>RunPredict</strong> — Advanced Sprint Performance Prediction Platform</p>
          <p className={`text-sm ${muted}`}>Version 2.1 | Educational & Training Purposes | © 2026</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;