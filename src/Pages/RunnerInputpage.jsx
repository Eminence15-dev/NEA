// ================================================================
// MODULE 2: Runner Input Page
// ================================================================

import { TrendingUp, User, Wind, Activity, Database, AlertTriangle, AlertCircle, UserPlus } from "lucide-react";
import { getEnvironmentalWarnings, getDropdownSuggestions } from "../modules/ErrorHandlingModule";

const RunnerInputPage = ({
  allAthletes, formData, setFormData,
  selectedAthlete, setSelectedAthlete,
  touched, setTouched, dropdownOpen, setDropdownOpen,
  onSubmit, darkMode,
}) => {
  const suggestions = getDropdownSuggestions(allAthletes, formData.athleteName, formData.eventDistance);
  const warnings    = getEnvironmentalWarnings(formData);
  const nameError   = !formData.athleteName.trim() ? "Please select an athlete" : "";
  const formIsValid = !!selectedAthlete && !nameError;
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const dm = darkMode;

  const card       = dm ? "bg-[#131E2E]"   : "bg-white";
  const text       = dm ? "text-white"      : "text-[#1C1714]";
  const muted      = dm ? "text-[#C4D0EF]" : "text-gray-600";
  const inputBase  = dm ? "bg-white/5 text-white placeholder-[#7A90B8]" : "bg-white text-gray-800 placeholder-gray-400";

  const selectAthlete = (athlete) => {
    setFormData(prev => ({
      ...prev,
      athleteName: athlete.name, eventDistance: athlete.event,
      tailwind: String(athlete.wind), temperature: String(athlete.temperature),
      humidity: String(athlete.humidity), altitude: String(athlete.altitude),
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
    <div className={`${card} rounded-2xl shadow-xl p-8 ${dm ? "" : "border border-gray-200"}`}>
      <h2 className={`text-2xl font-bold mb-6 ${text} flex items-center gap-2`}>
        <TrendingUp className="text-[#B83E18]"/>Athlete & Conditions
      </h2>
      <div className="space-y-5">

        {/* Event Distance */}
        <div>
          <label className={`block mb-2 ${text} font-semibold`}>Event Distance</label>
          <div className="grid grid-cols-2 gap-2">
            {[["100","100m","bg-[#B83E18] hover:bg-[#8F2E0E]"],["200","200m","bg-[#1A3FA0] hover:bg-[#162F7A]"]].map(([val,label,col]) => (
              <button key={val} type="button"
                onClick={() => { setFormData(f=>({...f,eventDistance:val,athleteName:""})); setSelectedAthlete(null); setTouched(t=>({...t,athleteName:false})); }}
                className={`p-3 rounded-lg font-semibold transition-all text-sm ${formData.eventDistance===val ? `${col} text-white shadow-lg` : dm ? "bg-white/10 text-[#C4D0EF] hover:bg-white/20" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Athlete Search */}
        <div className="relative">
          <label className={`block mb-1 ${text} font-semibold flex items-center gap-2`}>
            <User size={16}/>Athlete <span className="text-[#D95A30]">*</span>
          </label>
          <input type="text" name="athleteName" value={formData.athleteName} autoComplete="off"
            placeholder={`Search ${formData.eventDistance}m athletes…`}
            onChange={(e) => { setFormData(f=>({...f,athleteName:e.target.value})); setSelectedAthlete(null); setDropdownOpen(true); }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => { setTimeout(()=>setDropdownOpen(false),150); setTouched(t=>({...t,athleteName:true})); }}
            className={`w-full p-3 border-2 rounded-lg outline-none transition-all ${inputBase}
              ${!touched.athleteName ? `${dm?"border-white/20 focus:border-[#3A6BC8]":"border-gray-200 focus:border-[#1A3FA0]"}`
                : selectedAthlete ? "border-[#3A6BC8] bg-[#1A3FA0]/20"
                : "border-[#B83E18] bg-[#B83E18]/10"}`}/>
          {selectedAthlete && <div className="flex items-center gap-1 mt-1 text-[#90A8E0] text-xs font-medium"><Database size={12}/>{selectedAthlete.name} — {selectedAthlete.country} — {selectedAthlete.event}m — {selectedAthlete.raceTime}s at {selectedAthlete.venue}</div>}
          {!selectedAthlete && formData.athleteName.trim().length>=2 && touched.athleteName && <div className="flex items-center gap-1 mt-1 text-[#90A8E0] text-xs font-medium"><UserPlus size={12}/>Unknown athlete — will be auto-saved</div>}
          {touched.athleteName && nameError && !selectedAthlete && <div className="flex items-center gap-1 mt-1 text-[#D95A30] text-xs font-medium"><AlertCircle size={13}/>{nameError}</div>}

          {dropdownOpen && suggestions.length > 0 && (
            <div className={`absolute z-20 w-full mt-1 ${dm?"bg-[#0D1B2E] border-white/20":"bg-white border-gray-200"} border-2 rounded-xl shadow-xl max-h-64 overflow-y-auto`}>
              <div className={`px-3 py-2 ${dm?"bg-[#0A1628] border-white/10":"bg-gray-50 border-gray-100"} border-b text-xs ${dm?"text-[#7A90B8]":"text-gray-500"} font-semibold`}>
                {formData.eventDistance}m Athletes — {suggestions.length} found
              </div>
              {suggestions.map((athlete,i) => (
                <button key={i} type="button" onMouseDown={()=>selectAthlete(athlete)}
                  className={`w-full text-left px-4 py-3 ${dm?"hover:bg-white/5":"hover:bg-gray-50"} transition-colors flex items-center justify-between ${dm?"border-white/10":"border-gray-100"} border-b last:border-0`}>
                  <div>
                    <div className={`font-semibold ${dm?"text-white":"text-gray-800"} text-sm flex items-center gap-2`}>
                      {athlete.name}
                      {athlete.custom && <span className={`text-xs px-1.5 py-0.5 rounded-full ${dm?"bg-[#1A3FA0]/30 text-[#90A8E0]":"bg-blue-100 text-blue-700"}`}>Custom</span>}
                      {athlete.gender && <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${athlete.gender==="male"?dm?"bg-[#1A3FA0]/30 text-[#90A8E0]":"bg-blue-100 text-blue-700":dm?"bg-[#B83E18]/30 text-[#D95A30]":"bg-pink-100 text-pink-700"}`}>{athlete.gender==="male"?"👨 Male":"👩 Female"}</span>}
                    </div>
                    <div className={`text-xs ${dm?"text-[#7A90B8]":"text-gray-500"}`}>{athlete.country} · {athlete.raceTime}s · {athlete.city} ({athlete.year})</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${dm?"bg-white/10 text-[#C4D0EF]":"bg-gray-100 text-gray-600"}`}>{athlete.event}m</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Original Race Info */}
        {selectedAthlete && (
          <div className={`p-4 rounded-xl border-2 ${dm?"bg-[#1A3FA0]/15 border-[#3A6BC8]/40":"bg-blue-50 border-blue-200"}`}>
            <div className={`text-xs font-semibold ${dm?"text-[#90A8E0]":"text-blue-700"} mb-2 uppercase tracking-wide`}>📍 Original Race Conditions (pre-filled below)</div>
            <div className={`grid grid-cols-2 gap-2 text-xs ${muted}`}>
              <div><span className={`font-semibold ${text}`}>Venue:</span> {selectedAthlete.venue}</div>
              <div><span className={`font-semibold ${text}`}>City:</span> {selectedAthlete.city}, {selectedAthlete.countryOfVenue}</div>
              <div><span className={`font-semibold ${text}`}>Recorded Time:</span> {selectedAthlete.raceTime}s</div>
              <div><span className={`font-semibold ${text}`}>Weather:</span> {selectedAthlete.weatherCondition}</div>
            </div>
            <p className={`text-xs mt-2 ${dm?"text-[#90A8E0]":"text-blue-600"}`}>Adjust the sliders below to see how different conditions would affect this performance.</p>
          </div>
        )}

        {/* Track Condition */}
        <div className={`p-4 rounded-lg border-2 ${dm?"bg-[#B83E18]/10 border-[#B83E18]/30":"bg-orange-50 border-orange-200"}`}>
          <h3 className={`font-semibold ${text} mb-3 flex items-center gap-2`}><Activity size={18} className="text-[#D95A30]"/>Track Condition</h3>
          <select name="trackCondition" value={formData.trackCondition} onChange={handleChange}
            className={`w-full p-2 border-2 rounded-lg outline-none text-sm focus:border-[#B83E18] ${dm?"border-white/20 bg-[#0D1B2E] text-white":"border-gray-200 bg-white text-gray-800"}`}>
            {["optimal","good","fair","poor"].map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
          </select>
        </div>

        {/* Environmental Conditions */}
        <div className={`p-4 rounded-lg border-2 ${dm?"bg-[#1A3FA0]/10 border-[#3A6BC8]/30":"bg-blue-50 border-blue-200"}`}>
          <h3 className={`font-semibold ${text} mb-3 flex items-center gap-2`}><Wind size={18} className="text-[#3A6BC8]"/>Environmental Conditions</h3>
          <div className="space-y-3">
            {[["tailwind","Tailwind","m/s",-5,5,0.1],["temperature","Temperature","°C",-10,45,1],["humidity","Humidity","%",0,100,1],["altitude","Altitude","m",0,3000,100]].map(([name,label,unit,min,max,step])=>(
              <div key={name}>
                <label className={`block mb-1 text-sm ${muted} font-medium flex items-center justify-between`}>
                  <span>{label}</span><span className={`font-bold text-sm ${dm?"text-[#90A8E0]":"text-[#1A3FA0]"}`}>{formData[name]}{unit}</span>
                </label>
                <input type="range" min={min} max={max} step={step} name={name} value={formData[name]} onChange={handleChange} className="w-full accent-[#3A6BC8]"/>
              </div>
            ))}
          </div>
        </div>

        {/* Athlete Metrics */}
        <div className={`p-4 rounded-lg border-2 ${dm?"bg-white/5 border-white/10":"bg-gray-50 border-gray-200"}`}>
          <h3 className={`font-semibold ${text} mb-3 flex items-center gap-2`}><Activity size={18} className="text-[#D95A30]"/>Athlete Metrics</h3>
          <div>
            <label className={`block mb-1 text-sm ${muted} font-medium flex items-center justify-between`}>
              <span>VO2 Max</span><span className="text-[#D95A30] font-bold">{formData.vo2max}</span>
            </label>
            <input type="range" min={40} max={85} step={1} name="vo2max" value={formData.vo2max} onChange={handleChange} className="w-full accent-[#B83E18]"/>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className={`p-4 rounded-lg border-2 space-y-2 ${dm?"bg-amber-900/20 border-amber-700/40":"bg-amber-50 border-amber-300"}`}>
            <div className={`flex items-center gap-2 font-semibold text-sm ${dm?"text-amber-400":"text-amber-700"}`}><AlertTriangle size={16}/>Condition Warnings</div>
            {warnings.map((w,i)=><div key={i} className={`flex items-start gap-2 text-xs ${dm?"text-amber-300":"text-amber-700"}`}><AlertTriangle size={12} className="mt-0.5 shrink-0"/>{w}</div>)}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!formIsValid}
          className={`w-full p-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2
            ${formIsValid ? "bg-[#B83E18] hover:bg-[#8F2E0E] text-white hover:shadow-2xl cursor-pointer" : dm?"bg-white/10 text-white/30 cursor-not-allowed":"bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
          <TrendingUp size={24}/>Calculate Prediction
        </button>
      </div>
    </div>
  );
};

export default RunnerInputPage;