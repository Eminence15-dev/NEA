// ================================================================
// MODULE 5: Results / Output Page
//
// Displays the prediction output after a simulation is run.
// Shows the results banner (optimistic / predicted / pessimistic),
// auto-save notification, wind-assisted warning, and delegates
// all charts to Module 6 (GraphVisualizationModule).
//
// Also renders the empty "ready to predict" placeholder state
// before the first simulation is run.
// ================================================================

import { TrendingUp, AlertTriangle, UserPlus } from "lucide-react";
import GraphVisualizationModule from "../components/GraphVisualizationModule";

const ResultsOutputPage = ({ simulationResults, athleteName }) => {

  // ── Empty state ───────────────────────────────────────────────
  if (!simulationResults) {
    return (
      <div className="bg-[#131E2E] rounded-2xl shadow-xl p-12 text-center">
        <TrendingUp size={64} className="mx-auto mb-4 text-[#D6D0C8]"/>
        <h3 className="text-2xl font-bold text-white mb-2">Ready to Predict</h3>
        <p className="text-[#7A90B8] mb-6">Fill in athlete details on the left and hit Calculate.</p>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
          {[
            ["8+",  "Factors",   "bg-[#B83E18]/20", "text-[#B83E18]"],
            ["3",   "Scenarios", "bg-[#1A3FA0]/20", "text-[#90A8E0]"],
            ["~70%","Accuracy",  "bg-white/5", "text-[#C4D0EF]"],
          ].map(([v, l, bg, text]) => (
            <div key={l} className={`p-4 rounded-lg ${bg}`}>
              <div className={`font-bold text-2xl mb-1 ${text}`}>{v}</div>
              <div className="text-xs text-[#7A90B8]">{l}</div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#E8EDF8] rounded-xl border-2 border-[#C4D0EF] max-w-md mx-auto">
          <div className="flex items-center gap-2 text-[#1A3FA0] text-sm font-semibold">
            <UserPlus size={16}/>Auto-Save Active
          </div>
          <p className="text-xs text-[#5C544C] mt-1">
            Unknown athletes are automatically saved to their event database on first simulation.
          </p>
        </div>
      </div>
    );
  }

  // ── Results state ─────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Auto-save notification */}
      {simulationResults.isCustomAthlete && (
        <div className="flex items-center gap-3 p-4 bg-[#E8EDF8] border-2 border-[#C4D0EF] rounded-xl text-[#1A3FA0] font-semibold">
          <UserPlus size={20}/>
          <span>
            <strong>{athleteName}</strong> has been auto-saved to the{" "}
            <strong>{simulationResults.event}m</strong> database!
          </span>
        </div>
      )}

      {/* Wind-assisted warning */}
      {simulationResults.windAssisted && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-700 font-semibold">
          <AlertTriangle size={20}/>
          Wind-assisted result — tailwind exceeded +2.0 m/s. Won't count for official records.
        </div>
      )}

      {/* Prediction summary banner */}
      <div className="bg-[#0A1628] rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold">Results for {athleteName}</h3>
          <span className="px-3 py-1 bg-[#B83E18] rounded-full text-sm font-semibold">
            {simulationResults.event}m
          </span>
        </div>
        {simulationResults.originalVenue && (
          <p className="text-sm text-[#7A90B8] mb-6">
            📍 Based on recorded race at {simulationResults.originalVenue}
          </p>
        )}

        {/* Optimistic / Predicted / Pessimistic */}
        <div className="grid grid-cols-3 gap-4">
          {[
            ["Optimistic",  simulationResults.optimisticTime,  "text-4xl", false],
            ["Predicted",   simulationResults.predictedTime,   "text-5xl", true ],
            ["Pessimistic", simulationResults.pessimisticTime, "text-4xl", false],
          ].map(([label, val, size, highlight]) => (
            <div key={label}
              className={`text-center p-4 rounded-xl border
                ${highlight
                  ? "bg-[#B83E18] border-[#D95A30]"
                  : "bg-white/10 border-white/10"}`}>
              <div className="text-sm text-[#C4D0EF] mb-2">{label}</div>
              <div className={`${size} font-bold`}>{val}s</div>
            </div>
          ))}
        </div>

        {/* Recorded time + difference */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-center pt-6 border-t border-white/10">
          <div>
            <div className="text-sm text-[#7A90B8]">Recorded Time</div>
            <div className="text-2xl font-bold mt-1">{simulationResults.baselineTime}s</div>
          </div>
          <div>
            <div className="text-sm text-[#7A90B8]">Difference from Recorded</div>
            <div className="text-2xl font-bold mt-1 text-[#D95A30]">
              {parseFloat(simulationResults.improvement) < 0 ? "+" : ""}
              {Math.abs(parseFloat(simulationResults.improvement))}s
            </div>
          </div>
        </div>
      </div>

      {/* Charts — delegated to Module 6 */}
      <GraphVisualizationModule simulationResults={simulationResults}/>
    </div>
  );
};

export default ResultsOutputPage;