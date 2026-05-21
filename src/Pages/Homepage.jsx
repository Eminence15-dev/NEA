// ================================================================
// MODULE 1: Homepage / Interface
// ================================================================

import { Activity, Database, TrendingUp, Award, Calendar, Menu, X, UserPlus, Trash2, Sun, Moon } from "lucide-react";
import { runners100, runners200 } from "../data/athleteData";

const NAV_COLORS = {
  dashboard:  "bg-[#B83E18] hover:bg-[#8F2E0E]",
  simulation: "bg-[#B83E18] hover:bg-[#8F2E0E]",
  database:   "bg-[#1A3FA0] hover:bg-[#162F7A]",
  docs:       "bg-[#1A3FA0] hover:bg-[#3A6BC8]",
  about:      "bg-[#162F7A] hover:bg-[#1A3FA0]",
};

const NAV_LABELS = { dashboard:"Dashboard", simulation:"Simulator", database:"Database", docs:"Help", about:"About" };
const NAV_ICONS  = { dashboard:<Activity size={18}/>, simulation:<TrendingUp size={18}/>, database:<Database size={18}/>, docs:<Activity size={18}/>, about:<Activity size={18}/> };

// ── NavBar ────────────────────────────────────────────────────────
export const NavBar = ({ page, setCurrentPage, mobileMenuOpen, setMobileMenuOpen, customAthleteCount, darkMode, toggleDarkMode }) => {
  const pages = ["dashboard", "simulation", "database", "docs", "about"];

  return (
    <div className={`${darkMode ? "bg-[#0A1628]" : "bg-white border border-gray-200"} rounded-2xl shadow-xl p-6 mb-6`}>
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
              className={`px-5 py-2 ${NAV_COLORS[p]} text-white rounded-lg font-semibold transition-colors flex items-center gap-2`}>
              {NAV_ICONS[p]}{NAV_LABELS[p]}
              {p === "database" && customAthleteCount > 0 && (
                <span className="bg-white text-[#1A3FA0] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {customAthleteCount}
                </span>
              )}
            </button>
          ))}

          {/* Dark/light toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2.5 rounded-lg transition-colors ${darkMode ? "bg-white/10 hover:bg-white/20 text-[#C4D0EF]" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
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
              className={`px-5 py-2 ${NAV_COLORS[p]} text-white rounded-lg font-semibold`}>
              {NAV_LABELS[p]}
            </button>
          ))}
          <button onClick={toggleDarkMode}
            className={`px-5 py-2 rounded-lg font-semibold flex items-center gap-2 ${darkMode ? "bg-white/10 text-[#C4D0EF]" : "bg-gray-100 text-gray-700"}`}>
            {darkMode ? <><Sun size={16}/>Light Mode</> : <><Moon size={16}/>Dark Mode</>}
          </button>
        </div>
      )}
    </div>
  );
};

// ── HomePage ──────────────────────────────────────────────────────
const HomePage = ({ setCurrentPage, customAthletes, recentSimulations, onClearSimulations, Toast, mobileMenuOpen, setMobileMenuOpen, darkMode, toggleDarkMode }) => {
  const totalStatic   = runners100.length + runners200.length;
  const totalAthletes = totalStatic + customAthletes.length;

  const fastest100 = [...runners100].sort((a, b) => a.raceTime - b.raceTime)[0];
  const fastest200 = [...runners200].sort((a, b) => a.raceTime - b.raceTime)[0];

  const dm = darkMode;

  const statCards = [
    { label:"Total Athletes",    val:totalAthletes,             sub:"Across 100m & 200m",   from:"from-[#1A3FA0]", to:"to-[#162F7A]" },
    { label:"Custom Saved",      val:customAthletes.length,     sub:"Auto-saved from sims", from:"from-[#162F7A]", to:"to-[#0A1628]" },
    { label:"Simulations",       val:recentSimulations.length,  sub:"This Session",          from:"from-[#B83E18]", to:"to-[#8F2E0E]" },
    { label:"100m World Record", val:`${fastest100?.raceTime}s`,sub:fastest100?.name || "",  from:"from-[#8F2E0E]", to:"to-[#4A1505]" },
  ];

  const card  = dm ? "bg-[#131E2E] border border-white/10" : "bg-white border border-gray-200";
  const text  = dm ? "text-white" : "text-[#1C1714]";
  const muted = dm ? "text-[#7A90B8]" : "text-gray-500";
  const sub   = dm ? "text-[#9A9188]" : "text-gray-400";

  return (
    <div className={`min-h-screen ${dm ? "bg-[#1E2A3A]" : "bg-gray-100"} p-5`}>
      <Toast/>
      <div className="max-w-7xl mx-auto">
        <NavBar page="dashboard" setCurrentPage={setCurrentPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} customAthleteCount={customAthletes.length} darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statCards.map(({ label, val, sub: s, from, to }, i) => (
            <div key={i} className={`bg-gradient-to-br ${from} ${to} rounded-2xl shadow-md p-6 text-white`}>
              <div className="flex justify-between items-start mb-3">
                <div className="text-sm opacity-80 uppercase tracking-wide">{label}</div>
                <Award className="opacity-60" size={22}/>
              </div>
              <div className="text-4xl font-bold mb-1">{val}</div>
              <div className="text-sm opacity-70">{s}</div>
            </div>
          ))}
        </div>

        {/* Fastest Athletes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[
            { title:"Fastest 100m in Dataset", runner:fastest100, accent:"#B83E18", bg: dm ? "#B83E18/10" : "#FAECE7", bgStyle: dm ? "rgba(184,62,24,0.1)" : "#FAECE7" },
            { title:"Fastest 200m in Dataset", runner:fastest200, accent:"#1A3FA0", bg: dm ? "#1A3FA0/10" : "#E8EDF8", bgStyle: dm ? "rgba(26,63,160,0.1)" : "#E8EDF8" },
          ].map(({ title, runner, accent, bgStyle }) => runner && (
            <div key={title} className={`${card} rounded-2xl shadow-md p-8`}>
              <h2 className={`text-xl font-bold mb-5 ${text} flex items-center gap-2`}>
                <Award style={{ color: accent }} size={22}/>{title}
              </h2>
              <div className="rounded-xl p-5" style={{ borderLeft:`4px solid ${accent}`, backgroundColor: bgStyle }}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className={`font-bold text-lg ${text}`}>{runner.name}</div>
                    <div className={`text-sm ${muted}`}>{runner.country}</div>
                    <div className={`text-xs ${sub} mt-1`}>{runner.venue}, {runner.city} ({runner.year})</div>
                    <div className={`text-xs ${sub}`}>🌡️ {runner.temperature}°C · 💨 {runner.wind}m/s · 💧 {runner.humidity}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold" style={{ color: accent }}>{runner.raceTime}s</div>
                    <div className={`text-xs ${sub}`}>{runner.event}m</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Simulations + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Simulations */}
          <div className={`${card} rounded-2xl shadow-md p-8`}>
            <div className="flex justify-between items-center mb-5">
              <h2 className={`text-xl font-bold ${text} flex items-center gap-2`}>
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
              <div className={`text-center py-10 ${muted}`}>
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
                  <div key={idx} className="rounded-lg p-4 border-l-4 border-[#B83E18]"
                    style={{ backgroundColor: dm ? "rgba(184,62,24,0.08)" : "#FAECE7" }}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`font-bold ${text}`}>{sim.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${dm ? "bg-white/10 text-[#C4D0EF]" : "bg-gray-100 text-gray-600"}`}>{sim.event}m</span>
                          {sim.custom && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${dm ? "bg-[#1A3FA0]/30 text-[#90A8E0]" : "bg-blue-100 text-blue-700"}`}>✨ New</span>}
                        </div>
                        <div className={`text-sm ${muted}`}>
                          <span className="font-semibold">Recorded:</span>{" "}
                          {sim.pb === "N/A" ? <span className="text-[#3A6BC8] font-medium">from database</span> : `${sim.pb}s`}
                          {" → "}
                          <span className="font-semibold text-[#B83E18]">Predicted:</span> {sim.predicted}s
                        </div>
                        <div className={`text-xs ${sub} mt-0.5`}>{sim.conditions}</div>
                      </div>
                      <div className={`text-xs ${sub} ml-2`}>{sim.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className={`${card} rounded-2xl shadow-md p-8`}>
            <h2 className={`text-xl font-bold mb-5 ${text}`}>⚡ Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => setCurrentPage("simulation")}
                className="p-6 bg-[#B83E18] hover:bg-[#8F2E0E] text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-between">
                <div className="text-left"><div className="text-lg mb-1">Run Simulation</div><div className="text-xs opacity-75">100m or 200m</div></div>
                <TrendingUp size={32}/>
              </button>
              <button onClick={() => setCurrentPage("database")}
                className="p-6 bg-[#1A3FA0] hover:bg-[#162F7A] text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-between">
                <div className="text-left"><div className="text-lg mb-1">View Database</div><div className="text-xs opacity-75">{totalAthletes} athletes stored</div></div>
                <Database size={32}/>
              </button>
              <div className={`md:col-span-2 p-5 rounded-xl border-2 ${dm ? "bg-[#1A3FA0]/10 border-[#3A6BC8]/30" : "bg-blue-50 border-blue-200"}`}>
                <div className="flex items-start gap-3">
                  <UserPlus className="text-[#1A3FA0] mt-0.5 shrink-0" size={22}/>
                  <div>
                    <div className={`text-sm font-semibold mb-1 ${dm ? "text-[#90A8E0]" : "text-blue-900"}`}>Auto-Save + Event Separation</div>
                    <div className={`text-sm ${muted}`}>Unknown athletes are auto-saved under their specific event. 100m and 200m are kept completely separate.</div>
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