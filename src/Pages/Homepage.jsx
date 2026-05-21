// ================================================================
// MODULE 1: Homepage / Interface
// ================================================================

import { Activity, Database, TrendingUp, Award, Calendar, Menu, X, UserPlus, Trash2, Sun, Moon, MapPin } from "lucide-react";
import { runners100, runners200 } from "../data/athleteData";

const NAV_COLORS = {
  dashboard:       "bg-[#B83E18] hover:bg-[#8F2E0E]",
  "location-input": "bg-[#16A34A] hover:bg-[#15803D]",
  simulation:      "bg-[#B83E18] hover:bg-[#8F2E0E]",
  database:        "bg-[#1A3FA0] hover:bg-[#162F7A]",
  docs:            "bg-[#1A3FA0] hover:bg-[#3A6BC8]",
  about:           "bg-[#162F7A] hover:bg-[#1A3FA0]",
};

const NAV_LABELS = { dashboard:"Dashboard", "location-input":"🌍 Detect Environment", simulation:"Simulator", database:"Database", docs:"Help", about:"About" };
const NAV_ICONS  = { dashboard:<Activity size={18}/>, "location-input":<MapPin size={18}/>, simulation:<TrendingUp size={18}/>, database:<Database size={18}/>, docs:<Activity size={18}/>, about:<Activity size={18}/> };

// ── NavBar ────────────────────────────────────────────────────────
export const NavBar = ({ page, setCurrentPage, mobileMenuOpen, setMobileMenuOpen, customAthleteCount, darkMode, toggleDarkMode }) => {
  const pages = ["dashboard", "location-input", "simulation", "database", "docs", "about"];
  const dm = darkMode;

  return (
    <div className={`${dm ? 'bg-[#050505]/95 border border-[#b19149]/20 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] p-6 mb-6' : 'bg-white border border-gray-200 rounded-2xl shadow p-6 mb-6'}`}>
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#B83E18] flex items-center justify-center text-xl">🏃</div>
          <div>
            <h1 className={`text-2xl font-bold ${dm? 'text-[#f8d06b]' : 'text-black'}`}>RunPredict</h1>
            <p className={`text-sm ${dm? 'text-[#a78b3c]' : 'text-gray-600'}`}>Performance Prediction Platform</p>
          </div>
        </div>
        {/* Desktop nav */}
        <div className="hidden md:flex gap-3 flex-wrap items-center">
          {pages.filter(p => p !== page).map(p => (
            <button key={p} onClick={() => setCurrentPage(p)}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${dm ? "border border-[#b19149]/20 text-[#f2d05d] hover:bg-[#b19149]/10" : "border border-[#0b74de]/20 bg-[#0b74de]/10 text-[#0b74de] hover:bg-[#0b74de]/20"}`}>
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
            className={`p-2.5 rounded-lg transition-colors ${dm ? "bg-white/10 hover:bg-white/20 text-[#C4D0EF]" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
            title={dm ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dm ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-[#f2d05d]">
          {mobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-2">
          {pages.map(p => (
            <button key={p} onClick={() => { setCurrentPage(p); setMobileMenuOpen(false); }}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors ${dm ? "border border-[#b19149]/20 text-[#f2d05d] hover:bg-[#b19149]/10" : "border border-[#0b74de]/20 bg-[#0b74de]/10 text-[#0b74de] hover:bg-[#0b74de]/20"}`}>
              {NAV_LABELS[p]}
            </button>
          ))}
          <button onClick={toggleDarkMode}
            className={`px-5 py-2 rounded-lg font-semibold flex items-center gap-2 ${dm ? "bg-[#0f0f0f] text-[#f2d05d] hover:bg-[#1d1d1d]" : "bg-[#0b74de]/10 text-[#0b74de] hover:bg-[#0b74de]/20 border border-[#0b74de]/20"}`}>
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

  const card  = dm ? "bg-[#080808]" : "bg-white border border-gray-200";
  const text  = dm ? "text-[#f8d06b]" : "text-black";
  const muted = dm ? "text-[#a78b3c]" : "text-gray-600";
  const sub   = dm ? "text-[#8f7d45]" : "text-gray-500";

  return (
    <div className={`min-h-screen ${dm? 'bg-black' : 'bg-white'} p-5`}>
      <Toast/>
      <div className={`max-w-7xl mx-auto rounded-[2rem] ${card} ${dm? 'shadow-[0_15px_60px_rgba(177,145,73,0.18)]' : 'shadow'}`}>
        <NavBar page="dashboard" setCurrentPage={setCurrentPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} customAthleteCount={customAthletes.length} darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statCards.map(({ label, val, sub: s }, i) => (
            <div key={i} className="bg-[#090909] border border-[#b19149]/15 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.35)] p-6 text-[#f8d06b]">
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
            { title:"Fastest 100m in Dataset", runner:fastest100, accent:"#d6b451", bg: "#0f0f0f", bgStyle: "rgba(214,180,81,0.12)" },
            { title:"Fastest 200m in Dataset", runner:fastest200, accent:"#d6b451", bg: "#0f0f0f", bgStyle: "rgba(255,209,87,0.12)" },
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
                <Calendar className="text-[#f8d06b]" size={22}/>Recent Simulations
              </h2>
              {recentSimulations.length > 0 && (
                <button onClick={onClearSimulations}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#f8d06b] border border-[#f8d06b]/20 rounded-lg hover:bg-[#b19149]/10 transition-colors font-semibold">
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
                    style={{ backgroundColor: "rgba(255,209,87,0.08)" }}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`font-bold ${text}`}>{sim.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#111111] text-[#f2d05d]">{sim.event}m</span>
                          {sim.custom && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#1d1d1d] text-[#f8d06b]">✨ New</span>}
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
                className="p-6 bg-[#0f0f0f] border border-[#b19149]/20 text-[#f8d06b] rounded-xl font-semibold hover:bg-[#1d1d1d] transition-all flex items-center justify-between">
                <div className="text-left"><div className="text-lg mb-1">Run Simulation</div><div className="text-xs opacity-75">100m or 200m</div></div>
                <TrendingUp size={32}/>
              </button>
              <button onClick={() => setCurrentPage("database")}
                className="p-6 bg-[#0f0f0f] border border-[#b19149]/20 text-[#f8d06b] rounded-xl font-semibold hover:bg-[#1d1d1d] transition-all flex items-center justify-between">
                <div className="text-left"><div className="text-lg mb-1">View Database</div><div className="text-xs opacity-75">{totalAthletes} athletes stored</div></div>
                <Database size={32}/>
              </button>
              <div className="md:col-span-2 p-5 rounded-xl border-2 bg-[#0f0f0f] border-[#b19149]/15">
                <div className="flex items-start gap-3">
                  <UserPlus className="text-[#f8d06b] mt-0.5 shrink-0" size={22}/>
                  <div>
                    <div className="text-sm font-semibold mb-1 text-[#f8d06b]">Auto-Save + Event Separation</div>
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