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

/**
 * @param {Object|null} simulationResults — output from SimulationEngine.runSimulation()
 * @param {string}      athleteName       — current athlete name from form
 */
const ResultsOutputPage = ({ simulationResults, athleteName }) => {

  // ── Empty state (no simulation run yet) ──────────────────────
  if (!simulationResults) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <TrendingUp size={64} className="mx-auto mb-4 text-gray-300"/>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Predict</h3>
        <p className="text-gray-600 mb-6">Fill in athlete details on the left and hit Calculate.</p>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
          {[["8+","Factors","purple"],["3","Scenarios","blue"],["~70%","Accuracy","green"]].map(([v,l,c]) => (
            <div key={l} className={`p-4 rounded-lg bg-${c}-50`}>
              <div className={`font-bold text-2xl mb-1 text-${c}-600`}>{v}</div>
              <div className="text-xs text-gray-600">{l}</div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200 max-w-md mx-auto">
          <div className="flex items-center gap-2 text-indigo-700 text-sm font-semibold"><UserPlus size={16}/>Auto-Save Active</div>
          <p className="text-xs text-gray-600 mt-1">Unknown athletes are automatically saved to their event database on first simulation.</p>
        </div>
      </div>
    );
  }

  // ── Results state ─────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Auto-save notification (Module 4) */}
      {simulationResults.isCustomAthlete && (
        <div className="flex items-center gap-3 p-4 bg-indigo-50 border-2 border-indigo-300 rounded-xl text-indigo-700 font-semibold">
          <UserPlus size={20}/>
          <span><strong>{athleteName}</strong> has been auto-saved to the <strong>{simulationResults.event}m</strong> database!</span>
        </div>
      )}

      {/* Wind-assisted warning (Module 8) */}
      {simulationResults.windAssisted && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-700 font-semibold">
          <AlertTriangle size={20}/>Wind-assisted result — tailwind exceeded +2.0 m/s. Won't count for official records.
        </div>
      )}

      {/* Prediction summary banner */}
      <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold">Results for {athleteName}</h3>
          <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold">{simulationResults.event}m</span>
        </div>
        {simulationResults.originalVenue && (
          <p className="text-sm opacity-75 mb-6">📍 Based on recorded race at {simulationResults.originalVenue}</p>
        )}
        <div className="grid grid-cols-3 gap-4">
          {[
            ["Optimistic",  simulationResults.optimisticTime,  "text-4xl", false],
            ["Predicted",   simulationResults.predictedTime,   "text-5xl", true ],
            ["Pessimistic", simulationResults.pessimisticTime, "text-4xl", false],
          ].map(([label, val, size, highlight]) => (
            <div key={label} className={`text-center p-4 rounded-xl ${highlight?"bg-white bg-opacity-30 border-2 border-white":"bg-white bg-opacity-20"}`}>
              <div className="text-sm opacity-90 mb-2">{label}</div>
              <div className={`${size} font-bold`}>{val}s</div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm opacity-90">Recorded Time</div>
            <div className="text-2xl font-bold mt-1">{simulationResults.baselineTime}s</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Difference from Recorded</div>
            <div className="text-2xl font-bold mt-1">
              {parseFloat(simulationResults.improvement)<0?"+":""}{Math.abs(parseFloat(simulationResults.improvement))}s
            </div>
          </div>
        </div>
      </div>

      {/* Charts — delegated entirely to Module 6 */}
      <GraphVisualizationModule simulationResults={simulationResults}/>
    </div>
  );
};

export default ResultsOutputPage;