// ================================================================
// MODULE 1: Homepage / Interface — with Dark/Light Mode
// ================================================================

import { Activity, Database, TrendingUp, Award, Calendar, Menu, X, UserPlus, Trash2, Sun, Moon } from "lucide-react";
import { runners100, runners200 } from "../data/athleteData";

// ── Theme helpers ─────────────────────────────────────────────────
export const t = (darkMode, dark, light) => darkMode ? dark : light;

// ── NavBar ────────────────────────────────────────────────────────
export const NavBar = ({ page, setCurrentPage, mobileMenuOpen, setMobileMenuOpen, customAthleteCount, darkMode, toggleDarkMode }) => {
  const pages  = ["dashboard", "simulation", "database", "docs", "about"];
  const labels = { dashboard:"Dashboard", simulation:"Simulator", database:"Database", docs:"Help", about:"About" };
  const icons  = { dashboard:<Activity size={18}/>, simulation:<TrendingUp size={18}/>, database:<Database size={18}/>, docs:<Activity size={18}/>, about:<Activity size={18}/> };

  const btnColor = (p) => {
    const map = {
      dashboard:  darkMode ? "bg-[#B83E18] hover:bg-[#8F2E0E]" : "bg-[#B83E18] hover:bg-[#8F2E0E]",
      simulation: darkMode ? "bg-[#B83E18] hover:bg-[#8F2E0E]" : "bg-[#B83E18] hover:bg-[#8F2E0E]",
      database:   darkMode ? "bg-[#1A3FA0] hover:bg-[#162F7A]" : "bg-[#1A3FA0] hover:bg-[#162F7A]",
      docs:       darkMode ? "bg-[#162F7A] hover:bg-[#0A1628]" : "bg-[#162F7A] hover:bg-[#0A1628]",
      about:      darkMode ? "bg-[#0A1628] hover:bg-[#162F7A]" : "bg-[#0A1628] hover:bg-[#162F7A]",
    };
    return map[p];
  };

  return (
    <div className={`${darkMode ? "bg-[#0A1628]" : "bg-white"} rounded-2xl shadow-xl p-6 mb-6`}>
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#B83E18] flex items-center justify-center text-xl">🏃</div>
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-[#0A1628]"}`}>RunPredict</h1>
            <p className={`text-sm ${darkMode ? "text-[#7A90B8]" : "text-gray-500"}`}>Performance Prediction Platform</p>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-3 flex-wrap items-center">
          {pages.filter(p => p !== page).map(p => (
            <button key={p} onClick={() => setCurrentPage(p)}
              className={`px-5 py-2 ${btnColor(p)} text-white rounded-lg font-semibold transition-colors flex items-center gap-2`}>
              {icons[p]}{labels[p]}
              {p === "database" && customAthleteCount > 0 && (
                <span className="bg-white text-[#1A3FA0] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {customAthleteCount}
                </span>
              )}
            </button>
          ))}
          {/* Dark/Light toggle */}
          <button onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${darkMode ? "bg-[#1A3FA0] text-yellow-300 hover:bg-[#162F7A]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`md:hidden p-2 ${darkMode ? "text-[#C4D0EF]" : "text-gray-600"}`}>
          {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-2">
          {pages.map(p => (
            <button key={p} onClick={() => { setCurrentPage(p); setMobileMenuOpen(false); }}
              className={`px-5 py-2 ${btnColor(p)} text-white rounded-lg font-semibold`}>
              {labels[p]}
            </button>
          ))}
          <button onClick={toggleDarkMode}
            className={`px-5 py-2 rounded-lg font-semibold flex items-center gap-2 ${darkMode ? "bg-[#1A3FA0] text-yellow-300" : "bg-gray-100 text-gray-700"}`}>
            {darkMode ? <><Sun size={18}/> Light Mode</> : <><Moon size={18}/> Dark Mode</>}
          </button>
        </div>
      )}
    </div>
  );
};

// ── HomePage ──────────────────────────────────────────────────────
const HomePage = ({ setCurrentPage, customAthletes, recentSimulations, onClearSimulations, Toast, mobileMenuOpen, setMobileMenuOpen, darkMode, toggleDarkMode }) => {
  const totalAthletes = runners100.length + runners200.length + customAthletes.length;
  const fastest100 = [...runners100].sort((a, b) => a.raceTime - b.raceTime)[0];
  const fastest200 = [...runners200].sort((a, b) => a.raceTime - b.raceTime)[0];

  const dm = darkMode;

  return (
    <div className={`min-h-screen p-5 ${dm ? "bg-[#1E2A3A]" : "bg-gray-100"}`}>
      <Toast/>
      <div className="max-w-7xl mx-auto">
        <NavBar page="dashboard" setCurrentPage={setCurrentPage} mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen} customAthleteCount={customAthletes.length}
          darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[
            { label:"Total Athletes",    val:totalAthletes,            sub:"Across 100m & 200m",   from:"from-[#1A3FA0]", to:"to-[#162F7A]" },
            { label:"Custom Saved",      val:customAthletes.length,    sub:"Auto-saved from sims", from:"from-[#162F7A]", to:"to-[#0A1628]" },
            { label:"Simulations",       val:recentSimulations.length, sub:"This Session",          from:"from-[#B83E18]", to:"to-[#8F2E0E]" },
            { label:"100m World Record", val:`${fastest100?.raceTime}s`,sub:fastest100?.name || "", from:"from-[#8F2E0E]", to:"to-[#4A1505]" },
          ].map(({ label, val, sub, from, to }, i) => (
            <div key={i} className={`bg-gradient-to-br ${from} ${to} rounded-2xl shadow-md p-6 text-white`}>
              <div className="flex justify-between items-start mb-3">
                <div className="text-sm opacity-80 uppercase tracking-wide">{label}</div>
                <Award className="opacity-60" size={22}/>
              </div>
              <div className="text-4xl font-bold mb-1">{val}</div>
              <div className="text-sm opacity-70">{sub}</div>
            </div>
          ))}
        </div>

        {/* Fastest Athletes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[
            { title:"Fastest 100m in Dataset", runner:fastest100, accent:"#B83E18", lightBg:"#FAECE7", darkBg:"#2A1810" },
            { title:"Fastest 200m in Dataset", runner:fastest200, accent:"#1A3FA0", lightBg:"#E8EDF8", darkBg:"#0F1E3A" },
          ].map(({ title, runner, accent, lightBg, darkBg }) => runner && (
            <div key={title} className={`${dm ? "bg-[#142030]" : "bg-white"} rounded-2xl shadow-xl p-8`}>
              <h2 className={`text-xl font-bold mb-5 flex items-center gap-2 ${dm ? "text-white" : "text-[#1C1714]"}`}>
                <Award style={{ color: accent }} size={22}/>{title}
              </h2>
              <div className="rounded-xl p-5" style={{ borderLeft:`4px solid ${accent}`, backgroundColor: dm ? darkBg : lightBg }}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className={`font-bold text-lg ${dm ? "text-white" : "text-[#1C1714]"}`}>{runner.name}</div>
                    <div className={`text-sm ${dm ? "text-[#A0B0C8]" : "text-[#5C544C]"}`}>{runner.country}</div>
                    <div className={`text-xs mt-1 ${dm ? "text-[#7A90B8]" : "text-[#9A9188]"}`}>{runner.venue}, {runner.city} ({runner.year})</div>
                    <div className={`text-xs ${dm ? "text-[#7A90B8]" : "text-[#9A9188]"}`}>🌡️ {runner.temperature}°C · 💨 {runner.wind}m/s · 💧 {runner.humidity}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold" style={{ color: accent }}>{runner.raceTime}s</div>
                    <div className={`text-xs ${dm ? "text-[#7A90B8]" : "text-[#9A9188]"}`}>{runner.event}m</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Simulations + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Simulations */}
          <div className={`${dm ? "bg-[#142030]" : "bg-white"} rounded-2xl shadow-xl p-8`}>
            <div className="flex justify-between items-center mb-5">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${dm ? "text-white" : "text-[#1C1714]"}`}>
                <Calendar className="text-[#1A3FA0]" size={22}/>Recent Simulations
              </h2>
              {recentSimulations.length > 0 && (
                <button onClick={onClearSimulations}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#B83E18] border border-[#F5C8B8] rounded-lg hover:bg-[#FAECE7] transition-colors font-semibold">
                  <Trash2 size={14}/> Clear
                </button>
              )}
            </div>

            {recentSimulations.length === 0 ? (
              <div className={`text-center py-10 ${dm ? "text-[#7A90B8]" : "text-[#9A9188]"}`}>
                <TrendingUp size={48} className="mx-auto mb-4 opacity-40"/>
                <p className="text-lg font-semibold">No simulations yet</p>
                <button onClick={() => setCurrentPage("simulation")}
                  className="mt-4 px-6 py-2 bg-[#B83E18] text-white rounded-lg hover:bg-[#8F2E0E] transition-colors">
                  Run First Simulation
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSimulations.map((sim, idx) => (
                  <div key={idx} className={`rounded-lg p-4 border-l-4 border-[#B83E18] ${dm ? "bg-[#2A1810]" : "bg-[#FAECE7]"}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`font-bold ${dm ? "text-white" : "text-[#1C1714]"}`}>{sim.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${dm ? "bg-[#1E2A3A] text-[#A0B0C8]" : "bg-[#EDE9E5] text-[#5C544C]"}`}>{sim.event}m</span>
                          {sim.custom && <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8EDF8] text-[#1A3FA0] font-semibold">✨ New</span>}
                        </div>
                        <div className={`text-sm ${dm ? "text-[#A0B0C8]" : "text-[#5C544C]"}`}>
                          <span className="font-semibold">Recorded:</span>{" "}
                          {sim.pb === "N/A" ? <span className="text-[#1A3FA0] font-medium">from database</span> : `${sim.pb}s`}
                          {" → "}
                          <span className="font-semibold text-[#B83E18]">Predicted:</span> {sim.predicted}s
                        </div>
                        <div className={`text-xs mt-0.5 ${dm ? "text-[#7A90B8]" : "text-[#9A9188]"}`}>{sim.conditions}</div>
                      </div>
                      <div className={`text-xs ml-2 ${dm ? "text-[#7A90B8]" : "text-[#9A9188]"}`}>{sim.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className={`${dm ? "bg-[#142030]" : "bg-white"} rounded-2xl shadow-xl p-8`}>
            <h2 className={`text-xl font-bold mb-5 ${dm ? "text-white" : "text-[#1C1714]"}`}>⚡ Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setCurrentPage("simulation")}
                className="p-6 bg-[#B83E18] hover:bg-[#8F2E0E] text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-between">
                <div className="text-left">
                  <div className="text-lg mb-1">Run Simulation</div>
                  <div className="text-xs opacity-75">100m or 200m</div>
                </div>
                <TrendingUp size={32}/>
              </button>

              <button onClick={() => setCurrentPage("database")}
                className="p-6 bg-[#1A3FA0] hover:bg-[#162F7A] text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-between">
                <div className="text-left">
                  <div className="text-lg mb-1">View Database</div>
                  <div className="text-xs opacity-75">{totalAthletes} athletes stored</div>
                </div>
                <Database size={32}/>
              </button>

              <div className={`md:col-span-2 p-5 rounded-xl border-2 ${dm ? "bg-[#0F1E3A] border-[#1A3FA0]" : "bg-[#E8EDF8] border-[#C4D0EF]"}`}>
                <div className="flex items-start gap-3">
                  <UserPlus className="text-[#1A3FA0] mt-0.5 shrink-0" size={22}/>
                  <div>
                    <div className={`text-sm font-semibold mb-1 ${dm ? "text-white" : "text-[#0A1628]"}`}>Auto-Save + Event Separation</div>
                    <div className={`text-sm ${dm ? "text-[#A0B0C8]" : "text-[#5C544C]"}`}>Unknown athletes are auto-saved under their specific event. 100m and 200m are kept completely separate.</div>
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