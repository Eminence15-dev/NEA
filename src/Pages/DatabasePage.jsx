// ================================================================
// DATABASE PAGE
// ================================================================

import { Search, Award, UserPlus, Trash2, Database } from "lucide-react";
import { getRunnersByEvent, runners100, runners200 } from "../data/athleteData";

const DatabasePage = ({
  searchTerm, setSearchTerm, selectedGender, setSelectedGender,
  customAthletes, removeCustomAthlete,
  setCurrentPage, mobileMenuOpen, setMobileMenuOpen, Toast, darkMode, toggleDarkMode,
}) => {
  const dm = darkMode;
  const bg   = dm ? "bg-[#1E2A3A]" : "bg-gray-100";
  const card = dm ? "bg-[#131E2E] border border-white/10" : "bg-white border border-gray-200";
  const text = dm ? "text-white" : "text-[#1C1714]";
  const muted = dm ? "text-[#7A90B8]" : "text-gray-500";

  const allStatic = [...runners100, ...runners200];
  const mCount = allStatic.filter(a=>a.gender==="male").length + customAthletes.filter(a=>a.gender==="male").length;
  const fCount = allStatic.filter(a=>a.gender==="female").length + customAthletes.filter(a=>a.gender==="female").length;

  const filtered = (gender, event) => ({
    staticList: getRunnersByEvent(event).filter(r=>r.gender===gender && r.name.toLowerCase().includes(searchTerm.toLowerCase())),
    customList: customAthletes.filter(a=>a.gender===gender && a.event===event && a.name.toLowerCase().includes(searchTerm.toLowerCase())),
  });

  const {staticList:static100,customList:custom100} = filtered(selectedGender,"100");
  const {staticList:static200,customList:custom200} = filtered(selectedGender,"200");
  const noResults = !static100.length && !custom100.length && !static200.length && !custom200.length;

  const AthleteCard = ({ runner, isCustom, event }) => {
    const borderCol = event==="100" ? (isCustom?"border-[#3A6BC8]":"border-[#B83E18]") : (isCustom?"border-[#3A6BC8]":"border-[#1A3FA0]");
    const timeGrad  = event==="100" ? (isCustom?"from-[#162F7A] to-[#1A3FA0]":"from-[#B83E18] to-[#8F2E0E]") : (isCustom?"from-[#162F7A] to-[#1A3FA0]":"from-[#1A3FA0] to-[#162F7A]");
    const valueCol  = event==="100" ? "text-[#B83E18]" : "text-[#1A3FA0]";
    const lightValueCol = event==="100" ? "text-[#B83E18]" : "text-[#1A3FA0]";

    return (
      <div className={`${dm?"bg-[#131E2E]":"bg-white"} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all ${isCustom?`border-2 ${dm?"border-[#3A6BC8]/40":"border-blue-200"}`:`border ${dm?"border-white/10":"border-gray-200"}`}`}>
        <div className={`border-b-4 pb-4 mb-4 flex justify-between items-start ${borderCol}`}>
          <div>
            <h3 className={`text-xl font-bold ${text} flex items-center gap-2`}>
              {runner.name}
              {isCustom && <span className={`text-xs px-2 py-0.5 rounded-full ${dm?"bg-[#1A3FA0]/30 text-[#90A8E0]":"bg-blue-100 text-blue-700"}`}>✨ Custom</span>}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${runner.status==="Active"?"bg-emerald-400":runner.status==="Retired"?"bg-amber-400":runner.status==="Custom"?"bg-[#3A6BC8]":"bg-gray-400"}`}/>
              <p className={`${muted} italic text-sm`}>{runner.status}</p>
            </div>
          </div>
          {isCustom && (
            <button onClick={()=>removeCustomAthlete(runner.name,event)} className="p-2 text-[#D95A30] hover:text-[#B83E18] hover:bg-[#B83E18]/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
          )}
        </div>
        <div className={`bg-gradient-to-br ${timeGrad} text-white p-4 rounded-xl text-center mb-4`}>
          <div className="text-xs opacity-80 mb-1 uppercase tracking-wide">Recorded Time</div>
          <div className="text-3xl font-bold">{runner.raceTime}s</div>
          <div className="text-xs opacity-60 mt-1">{event} metres</div>
        </div>
        {!isCustom && (
          <div className="space-y-2 mb-4">
            {[["Country:",runner.country],["Venue:",runner.venue],["City:",runner.city],["Wind:",`${runner.wind} m/s`],["Temperature:",`${runner.temperature}°C`],["Humidity:",`${runner.humidity}%`],["Altitude:",`${runner.altitude}m`],["Year:",runner.year]].map(([label,val])=>(
              <div key={label} className={`py-1.5 border-b ${dm?"border-white/10":"border-gray-100"}`}>
                <div className={`font-semibold text-xs ${muted}`}>{label}</div>
                <div className={`font-semibold text-xs ${dm?lightValueCol:valueCol}`}>{val}</div>
              </div>
            ))}
          </div>
        )}
        <div className={`p-3 rounded-xl border-2 ${isCustom?dm?"bg-[#1A3FA0]/10 border-[#3A6BC8]/30":"bg-blue-50 border-blue-200":dm?"bg-white/5 border-white/10":"bg-gray-50 border-gray-200"}`}>
          <h4 className={`font-bold ${text} mb-2 flex items-center gap-1 text-sm`}>
            {isCustom?<UserPlus size={14} className="text-[#3A6BC8]"/>:<Award size={14} className="text-[#D95A30]"/>}
            {isCustom?"Auto-saved Info":"Achievements"}
          </h4>
          <ul className="space-y-1">
            {runner.achievements.map((a,i)=><li key={i} className={`text-xs ${muted} flex items-start gap-1.5`}><span>{isCustom?"📋":"🏆"}</span><span>{a}</span></li>)}
          </ul>
        </div>
      </div>
    );
  };

  const EventSection = ({ event, staticList, customList }) => {
    if (!staticList.length && !customList.length) return null;
    const headerGrad = event==="100" ? "from-[#B83E18] to-[#8F2E0E]" : "from-[#1A3FA0] to-[#162F7A]";
    return (
      <div className="mb-10">
        <div className={`flex items-center gap-3 mb-5 p-4 bg-gradient-to-r ${headerGrad} rounded-xl text-white`}>
          <span className="text-2xl font-bold">{event}m</span>
          <div>
            <div className="font-bold">{event==="100"?"100 Metres":"200 Metres"} — {selectedGender==="male"?"Male":"Female"} Athletes</div>
            <div className="text-xs opacity-75">{staticList.length} official · {customList.length} custom</div>
          </div>
        </div>
        {staticList.length>0 && (<>
          <div className={`flex items-center gap-2 mb-3 text-sm font-semibold ${muted}`}><Database size={15} className="text-[#3A6BC8]"/>Official Athletes</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">{staticList.map((r,i)=><AthleteCard key={i} runner={r} isCustom={false} event={event}/>)}</div>
        </>)}
        {customList.length>0 && (<>
          <div className={`flex items-center gap-2 mb-3 text-sm font-semibold ${muted}`}><UserPlus size={15} className="text-[#3A6BC8]"/>Custom Athletes</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{customList.map((r,i)=><AthleteCard key={i} runner={r} isCustom={true} event={event}/>)}</div>
        </>)}
      </div>
    );
  };

  return (
    <div>
      <Toast/>
        <div className={`${card} rounded-2xl shadow-xl p-8 mb-6`}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className={`text-3xl font-bold ${text}`}>International Sprinters Database</h2>
            {customAthletes.length>0 && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${dm?"bg-[#1A3FA0]/20 border-[#3A6BC8]/40":"bg-blue-50 border-blue-200"}`}>
                <UserPlus size={16} className="text-[#3A6BC8]"/>
                <span className={`text-sm font-semibold ${dm?"text-[#90A8E0]":"text-blue-700"}`}>{customAthletes.length} custom athlete{customAthletes.length!==1?"s":""} saved</span>
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${muted}`} size={20}/>
              <input type="text" placeholder="Search athletes across all events…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl outline-none ${dm?"border-white/10 bg-white/5 text-white placeholder-[#7A90B8] focus:border-[#3A6BC8]":"border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:border-[#1A3FA0]"}`}/>
            </div>
            <div className="flex gap-3">
              {[["male","Male","bg-[#1A3FA0] hover:bg-[#162F7A]",mCount],["female","Female","bg-[#B83E18] hover:bg-[#8F2E0E]",fCount]].map(([val,label,col,count])=>(
                <button key={val} onClick={()=>setSelectedGender(val)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${selectedGender===val?`${col} text-white shadow-lg`:dm?"bg-white/10 text-[#C4D0EF] hover:bg-white/20":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>
        {noResults ? (
          <div className={`text-center py-16 ${card} rounded-2xl shadow-xl`}>
            <Search size={48} className={`mx-auto mb-4 ${muted} opacity-50`}/>
            <p className={`text-lg ${muted}`}>No athletes found matching "{searchTerm}"</p>
          </div>
        ) : (
          <><EventSection event="100" staticList={static100} customList={custom100}/><EventSection event="200" staticList={static200} customList={custom200}/></>
        )}
    </div>
  );
};

export default DatabasePage;