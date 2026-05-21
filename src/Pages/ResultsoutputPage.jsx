// ================================================================
// MODULE 5: Results / Output Page
// ================================================================

import { TrendingUp, AlertTriangle, UserPlus } from "lucide-react";
import GraphVisualizationModule from "../components/GraphVisualizationModule";

const ResultsOutputPage = ({ simulationResults, athleteName, darkMode }) => {
  const dm = darkMode;
  const card = dm ? "bg-[#131E2E]" : "bg-white border border-gray-200";
  const text = dm ? "text-white" : "text-[#1C1714]";
  const muted = dm ? "text-[#7A90B8]" : "text-gray-500";

  if (!simulationResults) {
    return (
      <div className={`${card} rounded-2xl shadow-xl p-12 text-center`}>
        <TrendingUp size={64} className={`mx-auto mb-4 ${dm?"text-[#D6D0C8]":"text-gray-300"}`}/>
        <h3 className={`text-2xl font-bold ${text} mb-2`}>Ready to Predict</h3>
        <p className={`${muted} mb-6`}>Fill in athlete details on the left and hit Calculate.</p>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
          {[
            ["8+","Factors",  dm?"bg-[#B83E18]/20":"bg-orange-50", dm?"text-[#D95A30]":"text-orange-600"],
            ["3","Scenarios", dm?"bg-[#1A3FA0]/20":"bg-blue-50",   dm?"text-[#90A8E0]":"text-blue-600"],
            ["~70%","Accuracy",dm?"bg-white/5":"bg-gray-50",       dm?"text-[#C4D0EF]":"text-gray-600"],
          ].map(([v,l,bg,col])=>(
            <div key={l} className={`p-4 rounded-lg ${bg}`}>
              <div className={`font-bold text-2xl mb-1 ${col}`}>{v}</div>
              <div className={`text-xs ${muted}`}>{l}</div>
            </div>
          ))}
        </div>
        <div className={`p-4 rounded-xl border-2 max-w-md mx-auto ${dm?"bg-[#1A3FA0]/10 border-[#3A6BC8]/30":"bg-blue-50 border-blue-200"}`}>
          <div className={`flex items-center gap-2 text-sm font-semibold ${dm?"text-[#90A8E0]":"text-blue-700"}`}><UserPlus size={16}/>Auto-Save Active</div>
          <p className={`text-xs mt-1 ${muted}`}>Unknown athletes are automatically saved to their event database on first simulation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {simulationResults.isCustomAthlete && (
        <div className={`flex items-center gap-3 p-4 rounded-xl font-semibold border-2 ${dm?"bg-[#1A3FA0]/10 border-[#3A6BC8]/40 text-[#90A8E0]":"bg-blue-50 border-blue-300 text-blue-700"}`}>
          <UserPlus size={20}/>
          <span><strong>{athleteName}</strong> has been auto-saved to the <strong>{simulationResults.event}m</strong> database!</span>
        </div>
      )}
      {simulationResults.windAssisted && (
        <div className={`flex items-center gap-3 p-4 rounded-xl font-semibold border-2 ${dm?"bg-amber-900/20 border-amber-700/40 text-amber-400":"bg-amber-50 border-amber-300 text-amber-700"}`}>
          <AlertTriangle size={20}/>Wind-assisted result — tailwind exceeded +2.0 m/s. Won't count for official records.
        </div>
      )}

      {/* Prediction banner */}
      <div className="bg-[#0A1628] rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold">Results for {athleteName}</h3>
          <span className="px-3 py-1 bg-[#B83E18] rounded-full text-sm font-semibold">{simulationResults.event}m</span>
        </div>
        {simulationResults.originalVenue && <p className="text-sm text-[#7A90B8] mb-6">📍 Based on recorded race at {simulationResults.originalVenue}</p>}
        <div className="grid grid-cols-3 gap-4">
          {[["Optimistic",simulationResults.optimisticTime,"text-4xl",false],["Predicted",simulationResults.predictedTime,"text-5xl",true],["Pessimistic",simulationResults.pessimisticTime,"text-4xl",false]].map(([label,val,size,highlight])=>(
            <div key={label} className={`text-center p-4 rounded-xl border ${highlight?"bg-[#B83E18] border-[#D95A30]":"bg-white/10 border-white/10"}`}>
              <div className="text-sm text-[#C4D0EF] mb-2">{label}</div>
              <div className={`${size} font-bold`}>{val}s</div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-center pt-6 border-t border-white/10">
          <div><div className="text-sm text-[#7A90B8]">Recorded Time</div><div className="text-2xl font-bold mt-1">{simulationResults.baselineTime}s</div></div>
          <div><div className="text-sm text-[#7A90B8]">Difference from Recorded</div><div className="text-2xl font-bold mt-1 text-[#D95A30]">{parseFloat(simulationResults.improvement)<0?"+":""}{Math.abs(parseFloat(simulationResults.improvement))}s</div></div>
        </div>
      </div>

      <GraphVisualizationModule simulationResults={simulationResults}/>
    </div>
  );
};

export default ResultsOutputPage;