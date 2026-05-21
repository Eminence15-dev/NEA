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
  const bg   = dm ? "bg-[#090909]" : "bg-white";
  const card = dm ? "bg-[#080808] border border-[#b19149]/20" : "bg-white border border-gray-200";
  const text = dm ? "text-[#f8d06b]" : "text-black";
  const muted = dm ? "text-[#a78b3c]" : "text-gray-600";
  const valueCol = dm ? "text-[#f8d06b]" : "text-[#0b74de]";
  const borderCol = dm ? "border-[#b19149]" : "border-gray-200";

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
    const borderCol = "border-[#b19149]";
    const valueCol  = "text-[#f8d06b]";

    return (
      <div className={`${dm ? 'bg-[#080808] border border-[#b19149]/20' : 'bg-white border border-gray-200'} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all`}>
        <div className={`border-b-4 pb-4 mb-4 flex justify-between items-start ${borderCol}`}>
          <div>
            <h3 className={`text-xl font-bold ${text} flex items-center gap-2`}>
              {runner.name}
              {isCustom && <span className="text-xs px-2 py-0.5 rounded-full bg-[#b19149]/20 text-[#f8d06b]">✨ Custom</span>}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${runner.status==="Active"?"bg-emerald-400":runner.status==="Retired"?"bg-amber-400":runner.status==="Custom"?(dm?"bg-[#f8d06b]":"bg-[#0b74de]"):dm?"bg-[#6b6b6b]":"bg-gray-400"}`}/>
              <p className={`${muted} italic text-sm`}>{runner.status}</p>
            </div>
          </div>
          {isCustom && (
            <button onClick={()=>removeCustomAthlete(runner.name,event)} className="p-2 text-[#D95A30] hover:text-[#B83E18] hover:bg-[#B83E18]/10 rounded-lg transition-colors"><Trash2 size={16}/></button>
          )}
        </div>
        <div className={`p-4 rounded-xl text-center mb-4 ${dm? 'bg-[#0B0B0B] border border-[#b19149]/20 text-[#f8d06b]' : 'bg-white border border-gray-200 text-black'}`}>
          <div className={`text-xs opacity-80 mb-1 uppercase tracking-wide ${dm? 'text-[#a78b3c]' : 'text-gray-500'}`}>Recorded Time</div>
          <div className="text-3xl font-bold">{runner.raceTime}s</div>
          <div className="text-xs opacity-60 mt-1">{event} metres</div>
        </div>
        {!isCustom && (
          <div className="space-y-2 mb-4">
            {[["Country:",runner.country],["Venue:",runner.venue],["City:",runner.city],["Wind:",`${runner.wind} m/s`],["Temperature:",`${runner.temperature}°C`],["Humidity:",`${runner.humidity}%`],["Altitude:",`${runner.altitude}m`],["Year:",runner.year]].map(([label,val])=>(
              <div key={label} className={`py-1.5 border-b ${dm? 'border-[#b19149]/20' : 'border-gray-100'}`}>
                <div className={`font-semibold text-xs ${muted}`}>{label}</div>
                <div className={`font-semibold text-xs ${valueCol}`}>{val}</div>
              </div>
            ))}
          </div>
        )}
        <div className={`p-3 rounded-xl ${dm ? 'border-2 bg-[#0B0B0B] border-[#b19149]/20 text-[#f8d06b]' : 'border border-gray-100 bg-white text-black'}`}>
          <h4 className={`font-bold ${text} mb-2 flex items-center gap-1 text-sm`}>
            {isCustom ? <UserPlus size={14} className={dm?"text-[#f8d06b]":"text-[#0b74de]"}/> : <Award size={14} className={dm?"text-[#f8d06b]":"text-[#0b74de]"}/>}
            {isCustom?"Auto-saved Info":"Achievements"}
          </h4>
          <ul className="space-y-1">
            {runner.achievements.map((a,i)=>(
              <li key={i} className={`text-xs ${muted} flex items-start gap-1.5`}>
                <span>{isCustom?"📋":"🏆"}</span>
                <span className={`${dm ? '' : 'text-black'}`}>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const EventSection = ({ event, staticList, customList }) => {
    if (!staticList.length && !customList.length) return null;
    return (
      <div className="mb-10">
        <div className={`flex items-center gap-3 mb-5 p-4 ${dm? 'bg-[#050505] rounded-xl border border-[#b19149]/20 text-[#f8d06b]' : 'bg-white rounded-xl border border-gray-200 text-black'}`}>
          <span className="text-2xl font-bold">{event}m</span>
          <div>
            <div className="font-bold">{event==="100"?"100 Metres":"200 Metres"} — {selectedGender==="male"?"Male":"Female"} Athletes</div>
            <div className="text-xs opacity-75">{staticList.length} official · {customList.length} custom</div>
          </div>
        </div>
        {staticList.length>0 && (<>
          <div className={`flex items-center gap-2 mb-3 text-sm font-semibold ${text}`}><Database size={15} className={dm?"text-[#f8d06b]":"text-[#0b74de]"}/>Official Athletes</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">{staticList.map((r,i)=><AthleteCard key={i} runner={r} isCustom={false} event={event}/>)}</div>
        </>)}
        {customList.length>0 && (<>
          <div className={`flex items-center gap-2 mb-3 text-sm font-semibold ${text}`}><UserPlus size={15} className={dm?"text-[#f8d06b]":"text-[#0b74de]"}/>Custom Athletes</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{customList.map((r,i)=><AthleteCard key={i} runner={r} isCustom={true} event={event}/>)}</div>
        </>)}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${bg} p-5`}>
      <Toast/>
      <div className="max-w-6xl mx-auto">
        <div className={`${card} rounded-2xl shadow-xl p-8 mb-6`}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className={`text-3xl font-bold ${text}`}>International Sprinters Database</h2>
            {customAthletes.length>0 && (
              <div className={`${dm? 'flex items-center gap-2 px-4 py-2 rounded-xl border-2 bg-[#0B0B0B] border-[#b19149]/20' : 'flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white'}`}>
                <UserPlus size={16} className={dm?"text-[#f8d06b]":"text-[#0b74de]"}/>
                <span className={`text-sm font-semibold ${text}`}>{customAthletes.length} custom athlete{customAthletes.length!==1?"s":""} saved</span>
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${muted}`} size={20}/>
              <input type="text" placeholder="Search athletes across all events…" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
                className={`${dm? 'w-full pl-12 pr-4 py-4 border-2 rounded-xl outline-none border-[#b19149]/20 bg-[#080808] text-[#f8d06b] placeholder-[#a78b3c] focus:border-[#f8d06b]' : 'w-full pl-12 pr-4 py-4 border rounded-xl outline-none border-gray-200 bg-white text-black placeholder-gray-400 focus:border-[#0b74de]'}`}/>
            </div>
            <div className="flex gap-3">
              {[["male","Male",mCount],["female","Female",fCount]].map(([val,label,count])=>(
                <button key={val} onClick={()=>setSelectedGender(val)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${selectedGender===val ? (dm? 'bg-[#b19149] text-black shadow-lg' : 'bg-[#0b74de] text-white shadow-lg') : (dm? 'bg-[#080808] text-[#f8d06b] hover:bg-[#0f0f0f]' : 'bg-white text-[#0b74de] border border-gray-200 hover:bg-gray-50')}`}>
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
    </div>
  );
};

export default DatabasePage;