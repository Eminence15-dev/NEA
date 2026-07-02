// ================================================================
// MODULE 2: Runner Input Page
// ================================================================

import { TrendingUp, User, Wind, Activity, Database, AlertTriangle, AlertCircle, UserPlus, UserCircle } from "lucide-react";
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
  const card       = dm ? "bg-[#090909] border border-[#b19149]/20" : "bg-white border border-gray-200";
  const text       = dm ? "text-[#f8d06b]" : "text-[#0b74de]";
  const muted      = dm ? "text-[#a78b3c]" : "text-gray-600";
  const inputBase  = dm ? "bg-[#0f0f0f] text-[#f8d06b] placeholder-[#8f7d45] border-[#b19149]/20" : "bg-[#f8fbff] text-black placeholder-[#6b7280] border border-[#bae6fd] shadow-sm";

  const selectAthlete = (athlete) => {
    setFormData(prev => ({
      ...prev,
      athleteName: athlete.name, eventDistance: athlete.event,
      tailwind: String(athlete.wind), temperature: String(athlete.temperature),
      humidity: String(athlete.humidity), altitude: String(athlete.altitude),
      runnerGender: athlete.gender || prev.runnerGender || "male",
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
    <div className={`min-h-screen ${dm? 'bg-black' : 'bg-white'} p-5`}>
      <div className={`${card} rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] p-8`}>
        <h2 className={`text-2xl font-bold mb-6 ${text} flex items-center gap-2`}>
          <TrendingUp className="text-[#f8d06b]"/>Athlete & Conditions
        </h2>
      <div className="space-y-5">

        {/* Event Distance */}
        <div>
          <label className={`block mb-2 ${text} font-semibold`}>Event Distance</label>
          <div className="grid grid-cols-2 gap-2">
            {[["100","100m","bg-[#B83E18] hover:bg-[#8F2E0E]"],["200","200m","bg-[#1A3FA0] hover:bg-[#162F7A]"]].map(([val,label,col]) => (
              <button key={val} type="button"
                onClick={() => { setFormData(f=>({...f,eventDistance:val,athleteName:""})); setSelectedAthlete(null); setTouched(t=>({...t,athleteName:false})); }}
                className={`p-3 rounded-lg font-semibold transition-all text-sm ${formData.eventDistance===val ? (dm ? "bg-[#b19149] text-black shadow-lg" : "bg-[#0b74de] text-white shadow-lg") : (dm ? "bg-[#0f0f0f] text-[#f8d06b] border border-[#b19149]/20 hover:bg-[#1d1d1d]" : "bg-[#e0f2fe] text-[#0b74de] border border-[#bae6fd] hover:bg-[#bfdbfe]")}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Athlete Search */}
        <div className="relative">
          <label className={`block mb-2 ${text} font-semibold flex items-center gap-2`}>
            <User size={16}/>Athlete <span className="text-[#D95A30]">*</span>
          </label>
          <input type="text" name="athleteName" value={formData.athleteName} autoComplete="off"
            placeholder={`Search ${formData.eventDistance}m athletes…`}
            onChange={(e) => { setFormData(f=>({...f,athleteName:e.target.value})); setSelectedAthlete(null); setDropdownOpen(true); }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => { setTimeout(()=>setDropdownOpen(false),150); setTouched(t=>({...t,athleteName:true})); }}
            className={`w-full p-4 rounded-2xl outline-none transition-all shadow-sm ${inputBase}
              ${!touched.athleteName ? (dm ? "border-[#b19149]/20 focus:border-[#f8d06b] focus:ring-2 focus:ring-[#f8d06b]/20" : "border-[#bae6fd] focus:border-[#0b74de] focus:ring-2 focus:ring-[#0b74de]/20") : selectedAthlete ? (dm ? "border-[#f8d06b] bg-[#1a1a1a]" : "border-[#0b74de] bg-white shadow-md") : (dm ? "border-[#b19149]/30 bg-[#2f1a0c]/20" : "border-[#bae6fd] bg-[#f8fbff]")}`}/>
          {selectedAthlete && <div className="flex items-center gap-1 mt-1 text-[#90A8E0] text-xs font-medium"><Database size={12}/>{selectedAthlete.name} — {selectedAthlete.country} — {selectedAthlete.event}m — {selectedAthlete.raceTime}s at {selectedAthlete.venue}</div>}
          {!selectedAthlete && formData.athleteName.trim().length>=2 && touched.athleteName && <div className="flex items-center gap-1 mt-1 text-[#90A8E0] text-xs font-medium"><UserPlus size={12}/>Unknown athlete — will be auto-saved</div>}
          {touched.athleteName && nameError && !selectedAthlete && <div className="flex items-center gap-1 mt-1 text-[#B91C1C] text-xs font-medium"><AlertCircle size={13}/>{nameError}</div>}

          {dropdownOpen && suggestions.length > 0 && (
            <div className={`absolute z-20 w-full mt-1 rounded-xl shadow-xl max-h-64 overflow-y-auto ${dm? 'bg-[#0b0b0b] border border-[#b19149]/20' : 'bg-white border border-gray-200'}`}>
              <div className={`${dm? 'px-3 py-2 bg-[#090909] border-b border-[#b19149]/10 text-xs text-[#a78b3c] font-semibold' : 'px-3 py-2 bg-white border-b border-gray-100 text-xs text-gray-600 font-semibold'}`}>
                {formData.eventDistance}m Athletes — {suggestions.length} found
              </div>
              {suggestions.map((athlete,i) => (
                <button key={i} type="button" onMouseDown={()=>selectAthlete(athlete)}
                  className={`w-full text-left px-4 py-3 transition-colors flex items-center justify-between border-b ${dm? 'bg-[#0b0b0b] hover:bg-[#1d1d1d] border-[#b19149]/10' : 'bg-white hover:bg-gray-50 border-gray-100'} last:border-0`}>
                  <div>
                    <div className={`font-semibold ${dm? 'text-[#f8d06b]' : 'text-black'} text-sm flex items-center gap-2`}>
                      {athlete.name}
                      {athlete.custom && <span className={`${dm? 'text-xs px-1.5 py-0.5 rounded-full bg-[#b19149]/20 text-[#f8d06b]' : 'text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-black'}`}>Custom</span>}
                      {athlete.gender && <span className={`${dm? 'text-xs px-1.5 py-0.5 rounded-full font-semibold bg-[#b19149]/20 text-[#f8d06b]' : 'text-xs px-1.5 py-0.5 rounded-full font-semibold bg-gray-100 text-black'}`}>{athlete.gender==="male"?"👨 Male":"👩 Female"}</span>}
                    </div>
                    <div className={`${dm? 'text-xs text-[#a78b3c]' : 'text-xs text-gray-600'}`}>{athlete.country} · {athlete.raceTime}s · {athlete.city} ({athlete.year})</div>
                  </div>
                  <span className={`${dm? 'text-xs px-2 py-0.5 rounded-full font-semibold bg-[#b19149]/20 text-[#f8d06b]' : 'text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-black'}`}>{athlete.event}m</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedAthlete && (
          <div className={`${dm? 'p-4 rounded-xl border-2 bg-[#0f0f0f] border-[#b19149]/20' : 'p-4 rounded-xl border bg-white border-gray-100'}`}>
            <div className={`text-xs font-semibold mb-2 uppercase tracking-wide ${dm? 'text-[#f8d06b]' : 'text-black'}`}>📍 Original Race Conditions (pre-filled below)</div>
            <div className={`grid grid-cols-2 gap-2 text-xs ${muted}`}>
              <div><span className={`font-semibold ${text}`}>Venue:</span> {selectedAthlete.venue}</div>
              <div><span className={`font-semibold ${text}`}>City:</span> {selectedAthlete.city}, {selectedAthlete.countryOfVenue}</div>
              <div><span className={`font-semibold ${text}`}>Recorded Time:</span> {selectedAthlete.raceTime}s</div>
              <div><span className={`font-semibold ${text}`}>Weather:</span> {selectedAthlete.weatherCondition}</div>
            </div>
            <p className={`text-xs mt-2 ${muted}`}>Adjust the sliders below to see how different conditions would affect this performance.</p>
          </div>
        )}

        {/* Track Condition */}
        <div className={`${dm? 'p-4 rounded-lg border-2 bg-[#0f0f0f] border-[#b19149]/20' : 'p-4 rounded-lg border bg-white border-gray-100'}`}>
          <h3 className={`font-semibold ${text} mb-3 flex items-center gap-2`}><Activity size={18} className="text-[#f8d06b]"/>Track Condition</h3>
          <select name="trackCondition" value={formData.trackCondition} onChange={handleChange}
            className="w-full p-2 border-2 rounded-lg outline-none text-sm border-[#b19149]/20 bg-[#0b0b0b] text-[#f8d06b] focus:border-[#f8d06b]">
            {["optimal","good","fair","poor"].map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
          </select>
        </div>

        {/* Environmental Conditions */}
        <div className={`${dm? 'p-4 rounded-lg border-2 bg-[#0f0f0f] border-[#b19149]/20' : 'p-4 rounded-lg border bg-white border-gray-100'}`}>
          <h3 className={`font-semibold ${text} mb-3 flex items-center gap-2`}><Wind size={18} className="text-[#f8d06b]"/>Environmental Conditions</h3>
          <div className="space-y-3">
            {[["tailwind","Tailwind","m/s",-5,5,0.1],["temperature","Temperature","°C",-10,45,1],["humidity","Humidity","%",0,100,1],["altitude","Altitude","m",0,3000,100]].map(([name,label,unit,min,max,step])=>(
              <div key={name}>
                <label className={`block mb-1 text-sm ${muted} font-medium flex items-center justify-between`}>
                  <span>{label}</span><span className="font-bold text-sm text-[#f8d06b]">{formData[name]}{unit}</span>
                </label>
                <input type="range" min={min} max={max} step={step} name={name} value={formData[name]} onChange={handleChange} className="w-full accent-[#f8d06b]"/>
              </div>
            ))}
          </div>
        </div>

        {/* Athlete Metrics */}
        <div className={`${dm? 'p-4 rounded-lg border-2 bg-[#0f0f0f] border-[#b19149]/20' : 'p-4 rounded-lg border bg-white border-gray-100'}`}>
          <h3 className={`font-semibold ${text} mb-3 flex items-center gap-2`}><Activity size={18} className="text-[#f8d06b]"/>Athlete Metrics</h3>
          <div>
            <label className={`block mb-1 text-sm ${muted} font-medium flex items-center justify-between`}>
              <span>VO2 Max</span><span className="text-[#f8d06b] font-bold">{formData.vo2max}</span>
            </label>
            <input type="range" min={40} max={85} step={1} name="vo2max" value={formData.vo2max} onChange={handleChange} className="w-full accent-[#f8d06b]"/>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className={`${dm? 'p-4 rounded-lg border-2 space-y-2 bg-[#2f1200] border-[#b19149]/20' : 'p-4 rounded-lg border bg-white border-gray-100 space-y-2'}`}>
            <div className={`flex items-center gap-2 font-semibold text-sm ${dm? 'text-[#f8d06b]' : 'text-black'}`}><AlertTriangle size={16}/>Condition Warnings</div>
            {warnings.map((w,i)=><div key={i} className={`${dm? 'flex items-start gap-2 text-xs text-[#a78b3c]' : 'flex items-start gap-2 text-xs text-gray-600'}`}><AlertTriangle size={12} className="mt-0.5 shrink-0"/>{w}</div>)}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!formIsValid}
          className={`w-full p-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2
            ${formIsValid ? (dm? "bg-[#b19149] hover:bg-[#f8d06b] text-black hover:shadow-2xl cursor-pointer" : "bg-[#0b74de] hover:bg-[#095fb0] text-white hover:shadow-2xl cursor-pointer") : (dm? "bg-[#1a1a1a] text-[#6b5a25] cursor-not-allowed" : "bg-gray-100 text-gray-500 cursor-not-allowed")}`}>
          <TrendingUp size={24}/>Calculate Prediction
        </button>
      </div>
    </div>
  </div>
  );
};

export default RunnerInputPage;