// ================================================================
// MODULE 2: Runner Input Page
// ================================================================

import { TrendingUp, User, Wind, Activity, Database, AlertTriangle, AlertCircle, UserPlus } from "lucide-react";
import { getRunnersByEvent } from "../data/athleteData";
import { getEnvironmentalWarnings, getDropdownSuggestions } from "../modules/ErrorHandlingModule";

const RunnerInputPage = ({
  allAthletes, formData, setFormData,
  selectedAthlete, setSelectedAthlete,
  touched, setTouched, dropdownOpen, setDropdownOpen,
  onSubmit,
}) => {
  const suggestions = getDropdownSuggestions(allAthletes, formData.athleteName, formData.eventDistance);
  const warnings    = getEnvironmentalWarnings(formData);

  const nameError   = !formData.athleteName.trim() ? "Please select an athlete" : "";
  const formIsValid = !!selectedAthlete && !nameError;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const selectAthlete = (athlete) => {
    setFormData(prev => ({
      ...prev,
      athleteName:   athlete.name,
      eventDistance: athlete.event,
      tailwind:      String(athlete.wind),
      temperature:   String(athlete.temperature),
      humidity:      String(athlete.humidity),
      altitude:      String(athlete.altitude),
    }));
    setSelectedAthlete(athlete);
    setTouched(prev => ({ ...prev, athleteName: true }));
    setDropdownOpen(false);
  };

  const handleSubmit = () => {
    setTouched({ athleteName: true });
    if (formIsValid) onSubmit();
  };

  return (
    <div className="bg-[#131E2E] rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <TrendingUp className="text-[#B83E18]"/>Athlete & Conditions
      </h2>
      <div className="space-y-5">

        {/* ── Event Distance ── */}
        <div>
          <label className="block mb-2 text-white font-semibold">Event Distance</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["100", "100m", "bg-[#B83E18] hover:bg-[#8F2E0E]"],
              ["200", "200m", "bg-[#1A3FA0] hover:bg-[#162F7A]"],
            ].map(([val, label, col]) => (
              <button key={val} type="button"
                onClick={() => {
                  setFormData(f => ({ ...f, eventDistance: val, athleteName: "" }));
                  setSelectedAthlete(null);
                  setTouched(t => ({ ...t, athleteName: false }));
                }}
                className={`p-3 rounded-lg font-semibold transition-all text-sm
                  ${formData.eventDistance === val
                    ? `${col} text-white shadow-lg`
                    : "bg-white/10 text-[#C4D0EF] hover:bg-white/20"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Athlete Search ── */}
        <div className="relative">
          <label className="block mb-1 text-white font-semibold flex items-center gap-2">
            <User size={16}/>Athlete <span className="text-[#D95A30]">*</span>
          </label>
          <input
            type="text" name="athleteName" value={formData.athleteName} autoComplete="off"
            placeholder={`Search ${formData.eventDistance}m athletes…`}
            onChange={(e) => {
              setFormData(f => ({ ...f, athleteName: e.target.value }));
              setSelectedAthlete(null);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => { setTimeout(() => setDropdownOpen(false), 150); setTouched(t => ({ ...t, athleteName: true })); }}
            className={`w-full p-3 border-2 rounded-lg outline-none transition-all text-white placeholder-[#7A90B8]
              ${!touched.athleteName
                ? "border-white/20 focus:border-[#3A6BC8] bg-white/5"
                : selectedAthlete
                  ? "border-[#3A6BC8] bg-[#1A3FA0]/20"
                  : "border-[#B83E18] bg-[#B83E18]/10"}`}
          />

          {/* DB match badge */}
          {selectedAthlete && (
            <div className="flex items-center gap-1 mt-1 text-[#90A8E0] text-xs font-medium">
              <Database size={12}/>
              {selectedAthlete.name} — {selectedAthlete.country} — {selectedAthlete.event}m — {selectedAthlete.raceTime}s recorded at {selectedAthlete.venue}
            </div>
          )}
          {!selectedAthlete && formData.athleteName.trim().length >= 2 && touched.athleteName && (
            <div className="flex items-center gap-1 mt-1 text-[#90A8E0] text-xs font-medium">
              <UserPlus size={12}/>Unknown athlete — select from dropdown or will be auto-saved
            </div>
          )}
          {touched.athleteName && nameError && !selectedAthlete && (
            <div className="flex items-center gap-1 mt-1 text-[#D95A30] text-xs font-medium">
              <AlertCircle size={13}/>{nameError}
            </div>
          )}

          {/* Dropdown */}
          {dropdownOpen && suggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-[#0D1B2E] border-2 border-white/20 rounded-xl shadow-xl max-h-64 overflow-y-auto">
              <div className="px-3 py-2 bg-[#0A1628] border-b border-white/10 text-xs text-[#7A90B8] font-semibold">
                {formData.eventDistance}m Athletes — {suggestions.length} found
              </div>
              {suggestions.map((athlete, i) => (
                <button key={i} type="button" onMouseDown={() => selectAthlete(athlete)}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors flex items-center justify-between border-b border-white/10 last:border-0">
                  <div>
                    <div className="font-semibold text-white text-sm flex items-center gap-2">
                      {athlete.name}
                      {athlete.custom && (
                        <span className="text-xs px-1.5 py-0.5 bg-[#1A3FA0]/30 text-[#90A8E0] rounded-full">Custom</span>
                      )}
                      {athlete.gender && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                          ${athlete.gender === "male"
                            ? "bg-[#1A3FA0]/30 text-[#90A8E0]"
                            : "bg-[#B83E18]/30 text-[#D95A30]"}`}>
                          {athlete.gender === "male" ? "👨 Male" : "👩 Female"}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#7A90B8]">
                      {athlete.country} · {athlete.raceTime}s · {athlete.city} ({athlete.year})
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white/10 text-[#C4D0EF]">
                    {athlete.event}m
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Original Race Info ── */}
        {selectedAthlete && (
          <div className="p-4 bg-[#1A3FA0]/15 rounded-xl border-2 border-[#3A6BC8]/40">
            <div className="text-xs font-semibold text-[#90A8E0] mb-2 uppercase tracking-wide">
              📍 Original Race Conditions (pre-filled below)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#C4D0EF]">
              <div><span className="font-semibold text-white">Venue:</span> {selectedAthlete.venue}</div>
              <div><span className="font-semibold text-white">City:</span> {selectedAthlete.city}, {selectedAthlete.countryOfVenue}</div>
              <div><span className="font-semibold text-white">Recorded Time:</span> {selectedAthlete.raceTime}s</div>
              <div><span className="font-semibold text-white">Weather:</span> {selectedAthlete.weatherCondition}</div>
            </div>
            <p className="text-xs text-[#90A8E0] mt-2">
              Adjust the sliders below to see how different conditions would affect this performance.
            </p>
          </div>
        )}

        {/* ── Track Condition ── */}
        <div className="p-4 bg-[#B83E18]/10 rounded-lg border-2 border-[#B83E18]/30">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Activity size={18} className="text-[#D95A30]"/>Track Condition
          </h3>
          <select name="trackCondition" value={formData.trackCondition} onChange={handleChange}
            className="w-full p-2 border-2 border-white/20 rounded-lg outline-none bg-[#0D1B2E] text-white text-sm focus:border-[#B83E18]">
            {["optimal","good","fair","poor"].map(o => (
              <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* ── Environmental Conditions ── */}
        <div className="p-4 bg-[#1A3FA0]/10 rounded-lg border-2 border-[#3A6BC8]/30">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Wind size={18} className="text-[#3A6BC8]"/>Environmental Conditions
          </h3>
          <div className="space-y-3">
            {[
              ["tailwind",    "Tailwind",    "m/s", -5,  5,    0.1],
              ["temperature", "Temperature", "°C",  -10, 45,   1  ],
              ["humidity",    "Humidity",    "%",   0,   100,  1  ],
              ["altitude",    "Altitude",    "m",   0,   3000, 100],
            ].map(([name, label, unit, min, max, step]) => (
              <div key={name}>
                <label className="block mb-1 text-sm text-[#C4D0EF] font-medium flex items-center justify-between">
                  <span>{label}</span>
                  <span className="font-bold text-[#90A8E0] text-sm">{formData[name]}{unit}</span>
                </label>
                <input type="range" min={min} max={max} step={step} name={name}
                  value={formData[name]} onChange={handleChange} className="w-full accent-[#3A6BC8]"/>
              </div>
            ))}
          </div>
        </div>

        {/* ── Athlete Metrics ── */}
        <div className="p-4 bg-white/5 rounded-lg border-2 border-white/10">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Activity size={18} className="text-[#D95A30]"/>Athlete Metrics
          </h3>
          <div>
            <label className="block mb-1 text-sm text-[#C4D0EF] font-medium flex items-center justify-between">
              <span>VO2 Max</span>
              <span className="text-[#D95A30] font-bold">{formData.vo2max}</span>
            </label>
            <input type="range" min={40} max={85} step={1} name="vo2max"
              value={formData.vo2max} onChange={handleChange} className="w-full accent-[#B83E18]"/>
          </div>
        </div>

        {/* ── Environmental Warnings ── */}
        {warnings.length > 0 && (
          <div className="p-4 bg-amber-900/20 rounded-lg border-2 border-amber-700/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <AlertTriangle size={16}/>Condition Warnings
            </div>
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-amber-300 text-xs">
                <AlertTriangle size={12} className="mt-0.5 shrink-0"/>{w}
              </div>
            ))}
          </div>
        )}

        {/* ── Submit ── */}
        <button onClick={handleSubmit} disabled={!formIsValid}
          className={`w-full p-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2
            ${formIsValid
              ? "bg-[#B83E18] hover:bg-[#8F2E0E] text-white hover:shadow-2xl cursor-pointer"
              : "bg-white/10 text-white/30 cursor-not-allowed"}`}>
          <TrendingUp size={24}/>Calculate Prediction
        </button>

      </div>
    </div>
  );
};

export default RunnerInputPage;