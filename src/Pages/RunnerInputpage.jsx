// ================================================================
// MODULE 2: Runner Input Page
//
// Simulation form using real athlete data from the dataset.
// No personal best field — the athlete's recorded race time
// is used as the baseline automatically.
//
// When an athlete is selected from the dropdown their actual
// recorded race conditions (wind, temp, humidity, altitude)
// are pre-filled into the sliders so the user can then adjust
// from those real conditions.
// ================================================================

import { TrendingUp, User, Wind, Activity, Database, AlertTriangle, AlertCircle, UserPlus } from "lucide-react";
import { getRunnersByEvent } from "../data/athleteData";
import { getEnvironmentalWarnings, getDropdownSuggestions } from "../modules/ErrorHandlingModule";

/**
 * @param {Array}    allAthletes   — combined static + custom athletes
 * @param {Object}   formData      — current form state
 * @param {Function} setFormData   — update form state
 * @param {Object}   selectedAthlete — full athlete object currently selected
 * @param {Function} setSelectedAthlete
 * @param {Object}   touched
 * @param {Function} setTouched
 * @param {boolean}  dropdownOpen
 * @param {Function} setDropdownOpen
 * @param {Function} onSubmit
 */
const RunnerInputPage = ({
  allAthletes, formData, setFormData,
  selectedAthlete, setSelectedAthlete,
  touched, setTouched, dropdownOpen, setDropdownOpen,
  onSubmit,
}) => {
  const suggestions = getDropdownSuggestions(allAthletes, formData.athleteName, formData.eventDistance);
  const warnings    = getEnvironmentalWarnings(formData);

  const nameError  = !formData.athleteName.trim() ? "Please select an athlete" : "";
  const formIsValid = !!selectedAthlete && !nameError;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const selectAthlete = (athlete) => {
    // Pre-fill all conditions from the athlete's actual recorded race
    setFormData(prev => ({
      ...prev,
      athleteName:    athlete.name,
      eventDistance:  athlete.event,
      tailwind:       String(athlete.wind),
      temperature:    String(athlete.temperature),
      humidity:       String(athlete.humidity),
      altitude:       String(athlete.altitude),
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
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <TrendingUp className="text-red-600"/>Athlete & Conditions
      </h2>
      <div className="space-y-5">

        {/* ── Event Distance ── */}
        <div>
          <label className="block mb-2 text-gray-700 font-semibold">Event Distance</label>
          <div className="grid grid-cols-2 gap-2">
            {[["100","100m","bg-red-600"],["200","200m","bg-orange-600"]].map(([val,label,col]) => (
              <button key={val} type="button"
                onClick={() => {
                  setFormData(f => ({...f, eventDistance: val, athleteName: ""}));
                  setSelectedAthlete(null);
                  setTouched(t => ({...t, athleteName: false}));
                }}
                className={`p-3 rounded-lg font-semibold transition-all text-sm ${formData.eventDistance===val?`${col} text-white shadow-lg`:"bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Athlete Search ── */}
        <div className="relative">
          <label className="block mb-1 text-gray-700 font-semibold flex items-center gap-2">
            <User size={16}/>Athlete <span className="text-red-500">*</span>
          </label>
          <input type="text" name="athleteName" value={formData.athleteName} autoComplete="off"
            placeholder={`Search ${formData.eventDistance}m athletes…`}
            onChange={(e) => {
              setFormData(f => ({...f, athleteName: e.target.value}));
              setSelectedAthlete(null);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => { setTimeout(() => setDropdownOpen(false), 150); setTouched(t => ({...t, athleteName: true})); }}
            className={`w-full p-3 border-2 rounded-lg outline-none transition-all
              ${!touched.athleteName ? "border-gray-200 focus:border-purple-500"
                : selectedAthlete ? "border-green-400 bg-green-50"
                : "border-red-400 bg-red-50"}`}/>

          {/* DB match badge */}
          {selectedAthlete && (
            <div className="flex items-center gap-1 mt-1 text-blue-600 text-xs font-medium">
              <Database size={12}/>
              {selectedAthlete.name} — {selectedAthlete.country} — {selectedAthlete.event}m — {selectedAthlete.raceTime}s recorded at {selectedAthlete.venue}
            </div>
          )}
          {!selectedAthlete && formData.athleteName.trim().length >= 2 && touched.athleteName && (
            <div className="flex items-center gap-1 mt-1 text-indigo-600 text-xs font-medium">
              <UserPlus size={12}/>Unknown athlete — select from dropdown or will be auto-saved
            </div>
          )}
          {touched.athleteName && nameError && !selectedAthlete && (
            <div className="flex items-center gap-1 mt-1 text-red-600 text-xs font-medium">
              <AlertCircle size={13}/>{nameError}
            </div>
          )}

          {/* Dropdown */}
          {dropdownOpen && suggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-semibold">
                {formData.eventDistance}m Athletes — {suggestions.length} found
              </div>
              {suggestions.map((athlete, i) => (
                <button key={i} type="button" onMouseDown={() => selectAthlete(athlete)}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-0">
                  <div>
                    <div className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                      {athlete.name}
                      {athlete.custom && <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">Custom</span>}
                      {athlete.gender && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${athlete.gender === "male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                          {athlete.gender === "male" ? "👨 Male" : "👩 Female"}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {athlete.country} · {athlete.raceTime}s · {athlete.city} ({athlete.year})
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-700">
                    {athlete.event}m
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Original Race Info (shown after selecting) ── */}
        {selectedAthlete && (
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <div className="text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wide">
              📍 Original Race Conditions (pre-filled below)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
              <div><span className="font-semibold">Venue:</span> {selectedAthlete.venue}</div>
              <div><span className="font-semibold">City:</span> {selectedAthlete.city}, {selectedAthlete.countryOfVenue}</div>
              <div><span className="font-semibold">Recorded Time:</span> {selectedAthlete.raceTime}s</div>
              <div><span className="font-semibold">Weather:</span> {selectedAthlete.weatherCondition}</div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Adjust the sliders below to see how different conditions would affect this performance.
            </p>
          </div>
        )}

        {/* ── Track Condition ── */}
        <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Activity size={18}/>Track Condition</h3>
          <select name="trackCondition" value={formData.trackCondition} onChange={handleChange}
            className="w-full p-2 border-2 border-gray-200 rounded-lg outline-none bg-white text-sm">
            {["optimal","good","fair","poor"].map(o => (
              <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* ── Environmental Conditions ── */}
        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Wind size={18}/>Environmental Conditions</h3>
          <div className="space-y-3">
            {[
              ["tailwind",    "Tailwind",    "m/s", -5,   5,    0.1],
              ["temperature", "Temperature", "°C",  -10,  45,   1  ],
              ["humidity",    "Humidity",    "%",   0,    100,  1  ],
              ["altitude",    "Altitude",    "m",   0,    3000, 100],
            ].map(([name, label, unit, min, max, step]) => (
              <div key={name}>
                <label className="block mb-1 text-sm text-gray-700 font-medium flex items-center justify-between">
                  <span>{label}</span>
                  <span className="font-bold text-purple-600 text-sm">{formData[name]}{unit}</span>
                </label>
                <input type="range" min={min} max={max} step={step} name={name}
                  value={formData[name]} onChange={handleChange} className="w-full"/>
              </div>
            ))}
          </div>
        </div>

        {/* ── Athlete Metrics ── */}
        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Activity size={18}/>Athlete Metrics</h3>
          <div>
            <label className="block mb-1 text-sm text-gray-700 font-medium flex items-center justify-between">
              <span>VO2 Max</span>
              <span className="text-purple-600 font-bold">{formData.vo2max}</span>
            </label>
            <input type="range" min={40} max={85} step={1} name="vo2max"
              value={formData.vo2max} onChange={handleChange} className="w-full"/>
          </div>
        </div>

        {/* ── Environmental Warnings ── */}
        {warnings.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
              <AlertTriangle size={16}/>Condition Warnings
            </div>
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-amber-700 text-xs">
                <AlertTriangle size={12} className="mt-0.5 shrink-0"/>{w}
              </div>
            ))}
          </div>
        )}

        {/* ── Submit ── */}
        <button onClick={handleSubmit} disabled={!formIsValid}
          className={`w-full p-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2
            ${formIsValid
              ? "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:shadow-2xl cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
          <TrendingUp size={24}/>Calculate Prediction
        </button>
      </div>
    </div>
  );
};

export default RunnerInputPage;