// ================================================================
// DATABASE PAGE
//
// Displays all official and custom athletes, separated by event
// (100m and 200m) and filtered by gender and search term.
// Custom athletes can be deleted from here.
//
// Uses:
//   Module 4 (DataStorageModule) — removeCustomAthlete called via prop
//   athleteData.js               — getStaticByGenderAndEvent
// ================================================================

import { Search, Award, UserPlus, Trash2, Database } from "lucide-react";
import { getRunnersByEvent, runners100, runners200 } from "../data/athleteData";
import { NavBar } from "./HomePage";

/**
 * @param {string}   searchTerm
 * @param {Function} setSearchTerm
 * @param {string}   selectedGender
 * @param {Function} setSelectedGender
 * @param {Array}    customAthletes
 * @param {Function} removeCustomAthlete — (name, event) => void
 * @param {Function} setCurrentPage
 * @param {boolean}  mobileMenuOpen
 * @param {Function} setMobileMenuOpen
 * @param {Function} Toast
 */
const DatabasePage = ({
  searchTerm, setSearchTerm, selectedGender, setSelectedGender,
  customAthletes, removeCustomAthlete,
  setCurrentPage, mobileMenuOpen, setMobileMenuOpen, Toast,
}) => {
  const mCount = runners100.length + runners200.length;
const fCount = customAthletes.length;

  const filtered = (gender, event) => ({
    staticList: getRunnersByEvent(event).filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())),
    customList: customAthletes.filter(a => a.gender===gender && a.event===event && a.name.toLowerCase().includes(searchTerm.toLowerCase())),
  });

  const { staticList: static100, customList: custom100 } = filtered(selectedGender, "100");
  const { staticList: static200, customList: custom200 } = filtered(selectedGender, "200");
  const noResults = !static100.length && !custom100.length && !static200.length && !custom200.length;

  // ── Athlete Card ─────────────────────────────────────────────
  const AthleteCard = ({ runner, isCustom, event }) => {
    const borderCol = event==="100" ? (isCustom?"border-indigo-500":"border-red-600") : (isCustom?"border-indigo-500":"border-orange-500");
    const pbGrad    = event==="100" ? (isCustom?"from-indigo-500 to-purple-600":"from-red-600 to-orange-600") : (isCustom?"from-indigo-500 to-purple-600":"from-orange-500 to-yellow-500");
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all ${isCustom?"border-2 border-indigo-200":""}`}>
        <div className={`border-b-4 pb-4 mb-4 flex justify-between items-start ${borderCol}`}>
          <div>
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              {runner.name}
              {isCustom && <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">✨ Custom</span>}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${runner.status==="Active"?"bg-green-500":runner.status==="Custom"?"bg-indigo-400":"bg-gray-400"}`}/>
              <p className="text-gray-600 italic text-sm">{runner.status}</p>
            </div>
          </div>
          {isCustom && (
            <button onClick={() => removeCustomAthlete(runner.name, event)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
          )}
        </div>
        <div className={`bg-gradient-to-br ${pbGrad} text-white p-4 rounded-xl text-center mb-4`}>
         <div className="text-xs opacity-90 mb-1">RECORDED TIME</div>
         <div className="text-3xl font-bold">{runner.raceTime}s</div>
          <div className="text-xs opacity-75 mt-1">{event} metres</div>
        </div>
        {!isCustom && (
  <div className="space-y-2 mb-4">
    {[
      ["Country:", runner.country],
      ["Venue:", runner.venue],
      ["City:", runner.city],
      ["Wind:", `${runner.wind} m/s`],
      ["Temperature:", `${runner.temperature}°C`],
      ["Humidity:", `${runner.humidity}%`],
      ["Altitude:", `${runner.altitude}m`],
      ["Year:", runner.year],
    ].map(([label, val]) => (
      <div key={label} className="py-1.5 border-b border-gray-100">
        <div className="font-semibold text-gray-700 text-xs">{label}</div>
        <div className={`font-semibold text-xs ${event==="100"?"text-red-600":"text-orange-600"}`}>{val}</div>
      </div>
    ))}
  </div>
)}
        <div className={`p-3 rounded-xl border-2 ${isCustom?"bg-indigo-50 border-indigo-200":"bg-gray-50 border-gray-200"}`}>
          <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-1 text-sm">
            {isCustom ? <UserPlus size={14} className="text-indigo-500"/> : <Award size={14} className="text-yellow-500"/>}
            {isCustom ? "Auto-saved Info" : "Achievements"}
          </h4>
          <ul className="space-y-1">
            {runner.achievements.map((a, i) => (
              <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5"><span>{isCustom?"📋":"🏆"}</span><span>{a}</span></li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // ── Event Section ─────────────────────────────────────────────
  const EventSection = ({ event, staticList, customList }) => {
    if (!staticList.length && !customList.length) return null;
    const grad = event==="100" ? "from-red-600 to-orange-600" : "from-orange-500 to-yellow-500";
    return (
      <div className="mb-10">
        <div className={`flex items-center gap-3 mb-5 p-4 bg-gradient-to-r ${grad} rounded-xl text-white`}>
          <span className="text-2xl font-bold">{event}m</span>
          <div>
            <div className="font-bold">{event==="100"?"100 Metres":"200 Metres"} — {selectedGender==="male"?"Male":"Female"} Athletes</div>
            <div className="text-xs opacity-80">{staticList.length} official · {customList.length} custom</div>
          </div>
        </div>
        {staticList.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-600"><Database size={15} className="text-blue-500"/>Official Athletes</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {staticList.map((r, i) => <AthleteCard key={i} runner={r} isCustom={false} event={event}/>)}
            </div>
          </>
        )}
        {customList.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-600"><UserPlus size={15} className="text-indigo-500"/>Custom Athletes</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {customList.map((r, i) => <AthleteCard key={i} runner={r} isCustom={true} event={event}/>)}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-5">
      <Toast/>
      <div className="max-w-7xl mx-auto">
        <NavBar page="database" setCurrentPage={setCurrentPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} customAthleteCount={customAthletes.length}/>
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
           <h2 className="text-3xl font-bold text-gray-800">International Sprinters Database</h2>
            {customAthletes.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
                <UserPlus size={16} className="text-indigo-600"/>
                <span className="text-sm font-semibold text-indigo-700">{customAthletes.length} custom athlete{customAthletes.length!==1?"s":""} saved</span>
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
              <input type="text" placeholder="Search athletes across all events…" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-600 outline-none"/>
            </div>
            <div className="flex gap-3">
              {[["male","Male","bg-blue-600",mCount],["female","Female","bg-pink-600",fCount]].map(([val,label,col,count]) => (
                <button key={val} onClick={() => setSelectedGender(val)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${selectedGender===val?`${col} text-white shadow-lg`:"bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>
        {noResults ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-lg">
            <Search size={48} className="mx-auto mb-4 opacity-50"/>
            <p className="text-lg">No athletes found matching "{searchTerm}"</p>
          </div>
        ) : (
          <>
            <EventSection event="100" staticList={static100} customList={custom100}/>
            <EventSection event="200" staticList={static200} customList={custom200}/>
          </>
        )}
      </div>
    </div>
  );
};

export default DatabasePage;