// ================================================================
// MODULE 5: Results / Output Page
// ================================================================

import { TrendingUp, AlertTriangle, UserPlus } from "lucide-react";
import GraphVisualizationModule from "../components/GraphVisualizationModule";

const ResultsOutputPage = ({ simulationResults, athleteName, darkMode }) => {
  const card = "bg-[#090909] border border-[#b19149]/20";
  const text = "text-[#f8d06b]";
  const muted = "text-[#a78b3c]";

  if (!simulationResults) {
    return (
      <div className={`${card} rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] p-12 text-center`}>
        <TrendingUp size={64} className="mx-auto mb-4 text-[#f8d06b]"/>
        <h3 className={`text-2xl font-bold ${text} mb-2`}>Ready to Predict</h3>
        <p className={`${muted} mb-6`}>Fill in athlete details on the left and hit Calculate.</p>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
          {[
            ["8+","Factors",  "bg-[#111111]", "text-[#f8d06b]"],
            ["3","Scenarios", "bg-[#111111]", "text-[#f8d06b]"],
            ["~70%","Accuracy","bg-[#111111]", "text-[#f8d06b]"],
          ].map(([v,l,bg,col])=>(
            <div key={l} className={`p-4 rounded-lg ${bg}`}>
              <div className={`font-bold text-2xl mb-1 ${col}`}>{v}</div>
              <div className={`text-xs ${muted}`}>{l}</div>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border-2 max-w-md mx-auto bg-[#0f0f0f] border-[#b19149]/20">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#f8d06b]"><UserPlus size={16}/>Auto-Save Active</div>
          <p className={`text-xs mt-1 ${muted}`}>Unknown athletes are automatically saved to their event database on first simulation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {simulationResults.isCustomAthlete && (
        <div className="flex items-center gap-3 p-4 rounded-xl font-semibold border-2 bg-[#0f0f0f] border-[#b19149]/20 text-[#f8d06b]">
          <UserPlus size={20}/>
          <span><strong>{athleteName}</strong> has been auto-saved to the <strong>{simulationResults.event}m</strong> database!</span>
        </div>
      )}
      {simulationResults.windAssisted && (
        <div className="flex items-center gap-3 p-4 rounded-xl font-semibold border-2 bg-[#0f0f0f] border-[#b19149]/20 text-[#f8d06b]">
          <AlertTriangle size={20}/>Wind-assisted result — tailwind exceeded +2.0 m/s. Won't count for official records.
        </div>
      )}

      {/* Prediction banner */}
      <div className="bg-[#090909] border border-[#b19149]/15 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] p-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-[#f8d06b]">Results for {athleteName}</h3>
          <span className="px-3 py-1 bg-[#b19149]/20 text-[#f8d06b] rounded-full text-sm font-semibold">{simulationResults.event}m</span>
        </div>
        {simulationResults.originalVenue && <p className="text-sm text-[#a78b3c] mb-6">📍 Based on recorded race at {simulationResults.originalVenue}</p>}
        <div className="grid grid-cols-3 gap-4">
          {[["Optimistic",simulationResults.optimisticTime,"text-4xl",false],["Predicted",simulationResults.predictedTime,"text-5xl",true],["Pessimistic",simulationResults.pessimisticTime,"text-4xl",false]].map(([label,val,size,highlight])=>(
            <div key={label} className={`text-center p-4 rounded-xl border ${highlight?"bg-[#b19149]/20 border-[#f8d06b]/30":"bg-[#0f0f0f] border-[#b19149]/15"}`}>
              <div className="text-sm text-[#a78b3c] mb-2">{label}</div>
              <div className={`${size} font-bold text-[#f8d06b]`}>{val}s</div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-center pt-6 border-t border-[#b19149]/10">
          <div><div className="text-sm text-[#a78b3c]">Recorded Time</div><div className="text-2xl font-bold mt-1 text-[#f8d06b]">{simulationResults.baselineTime}s</div></div>
          <div><div className="text-sm text-[#a78b3c]">Difference from Recorded</div><div className="text-2xl font-bold mt-1 text-[#f8d06b]">{parseFloat(simulationResults.improvement)<0?"+":""}{Math.abs(parseFloat(simulationResults.improvement))}s</div></div>
        </div>
      </div>

      <GraphVisualizationModule simulationResults={simulationResults}/>
    </div>
  );
};

export default ResultsOutputPage;