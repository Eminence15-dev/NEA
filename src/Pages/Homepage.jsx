// ================================================================
// MODULE 1: Homepage / Interface
//
// Contains two components:
//   NavBar   — shared navigation bar rendered on every page
//   HomePage — dashboard with stat cards, record holders,
//              recent simulations, and quick action buttons
// ================================================================

import { Activity, Database, TrendingUp, Award, Calendar, Menu, X, UserPlus, Trash2 } from "lucide-react";
import { runners100, runners200 } from "../data/athleteData";

// ── NavBar ────────────────────────────────────────────────────────
export const NavBar = ({ page, setCurrentPage, mobileMenuOpen, setMobileMenuOpen, customAthleteCount }) => {
  const pages  = ["dashboard", "simulation", "database", "docs", "about"];
  const colors = { dashboard:"bg-orange-600 hover:bg-orange-700", simulation:"bg-red-600 hover:bg-red-700", database:"bg-blue-600 hover:bg-blue-700", docs:"bg-teal-600 hover:bg-teal-700", about:"bg-purple-600 hover:bg-purple-700" };
  const labels = { dashboard:"Dashboard", simulation:"Simulator", database:"Database", docs:"Help", about:"About" };
  const icons  = { dashboard:<Activity size={18}/>, simulation:<TrendingUp size={18}/>, database:<Database size={18}/>, docs:<Activity size={18}/>, about:<Activity size={18}/> };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🏃</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">RunPredict</h1>
            <p className="text-sm text-gray-500">Performance Prediction Platform</p>
          </div>
        </div>
        <div className="hidden md:flex gap-3 flex-wrap">
          {pages.filter(p => p !== page).map(p => (
            <button key={p} onClick={() => setCurrentPage(p)}
              className={`px-5 py-2 ${colors[p]} text-white rounded-lg font-semibold transition-colors flex items-center gap-2`}>
              {icons[p]}{labels[p]}
              {p === "database" && customAthleteCount > 0 && (
                <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {customAthleteCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600">
          {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-2">
          {pages.map(p => (
            <button key={p} onClick={() => { setCurrentPage(p); setMobileMenuOpen(false); }}
              className={`px-5 py-2 ${colors[p]} text-white rounded-lg font-semibold`}>
              {labels[p]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── HomePage (Dashboard) ─────────────────────────────────────────
const HomePage = ({ setCurrentPage, customAthletes, recentSimulations, onClearSimulations, Toast, mobileMenuOpen, setMobileMenuOpen }) => {
  const totalStatic   = runners100.length + runners200.length;
  const totalAthletes = totalStatic + customAthletes.length;

  const fastest100 = [...runners100].sort((a,b) => a.raceTime - b.raceTime)[0];
  const fastest200 = [...runners200].sort((a,b) => a.raceTime - b.raceTime)[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-5">
      <Toast/>
      <div className="max-w-7xl mx-auto">
        <NavBar page="dashboard" setCurrentPage={setCurrentPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} customAthleteCount={customAthletes.length}/>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[
            ["Total Athletes",   totalAthletes,              "from-blue-500 to-blue-600",   "Across 100m & 200m"],
            ["Custom Saved",     customAthletes.length,      "from-indigo-500 to-indigo-600","Auto-saved from sims"],
            ["Simulations",      recentSimulations.length,   "from-green-500 to-green-600",  "This Session"],
            ["100m World Record",`${fastest100?.raceTime}s`, "from-purple-500 to-purple-600",fastest100?.name || ""],
          ].map(([label, val, grad, sub], i) => (
            <div key={i} className={`bg-gradient-to-br ${grad} rounded-2xl shadow-lg p-6 text-white`}>
              <div className="flex justify-between items-start mb-3"><div className="text-sm opacity-90">{label}</div><Award className="opacity-75" size={24}/></div>
              <div className="text-4xl font-bold mb-1">{val}</div>
              <div className="text-sm opacity-80">{sub}</div>
            </div>
          ))}
        </div>

        {/* Fastest Athletes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[
            { title: "Fastest 100m in Dataset", runner: fastest100, color: "red" },
            { title: "Fastest 200m in Dataset", runner: fastest200, color: "orange" },
          ].map(({ title, runner, color }) => runner && (
            <div key={title} className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-5 text-gray-800 flex items-center gap-2">
                <Award className={`text-${color}-500`}/>{ title}
              </h2>
              <div className={`rounded-xl p-5 border-l-4 border-${color}-600 bg-${color}-50`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-xl text-gray-800">{runner.name}</div>
                    <div className="text-sm text-gray-600">{runner.country}</div>
                    <div className="text-xs text-gray-500 mt-1">{runner.venue}, {runner.city} ({runner.year})</div>
                    <div className="text-xs text-gray-500">🌡️ {runner.temperature}°C · 💨 {runner.wind}m/s · 💧 {runner.humidity}%</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold text-${color}-600`}>{runner.raceTime}s</div>
                    <div className="text-xs text-gray-500">{runner.event}m</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Simulations + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Header with clear button */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="text-purple-600"/>Recent Simulations
              </h2>
              {recentSimulations.length > 0 && (
                <button
                  onClick={onClearSimulations}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-semibold"
                >
                  <Trash2 size={14}/> Clear
                </button>
              )}
            </div>
            {recentSimulations.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-50"/>
                <p className="text-lg font-semibold">No simulations yet</p>
                <button onClick={() => setCurrentPage("simulation")} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Run First Simulation</button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSimulations.map((sim, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border-l-4 border-red-600">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-gray-800">{sim.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">{sim.event}m</span>
                          {sim.custom && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">✨ New</span>}
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Recorded:</span>{" "}
                          {sim.pb === "N/A" ? (
                            <span className="text-blue-600 font-medium">from database</span>
                          ) : (
                            `${sim.pb}s`
                          )}
                          {" → "}
                          <span className="font-semibold text-red-600">Predicted:</span> {sim.predicted}s
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{sim.conditions}</div>
                      </div>
                      <div className="text-xs text-gray-500 ml-2">{sim.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-5 text-gray-800">⚡ Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setCurrentPage("simulation")} className="p-6 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-between"><div className="text-left"><div className="text-lg mb-1">Run Simulation</div><div className="text-xs opacity-80">100m or 200m</div></div><TrendingUp size={32}/></button>
              <button onClick={() => setCurrentPage("database")} className="p-6 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-between"><div className="text-left"><div className="text-lg mb-1">View Database</div><div className="text-xs opacity-80">{totalAthletes} athletes stored</div></div><Database size={32}/></button>
              <div className="md:col-span-2 p-5 bg-indigo-50 rounded-xl border-2 border-indigo-200">
                <div className="flex items-start gap-3">
                  <UserPlus className="text-indigo-600 mt-0.5 shrink-0" size={22}/>
                  <div>
                    <div className="text-sm font-semibold text-indigo-800 mb-1">Auto-Save + Event Separation</div>
                    <div className="text-sm text-gray-700">Unknown athletes are auto-saved under their specific event. 100m and 200m are kept completely separate.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;