// ================================================================
// MODULE 5: Results / Output Page
// ================================================================

import { TrendingUp, AlertTriangle, UserPlus, Award } from "lucide-react";
import GraphVisualizationModule from "../components/GraphVisualizationModule";

const ResultsOutputPage = ({ simulationResults, athleteName, darkMode, comparisonReports, percentileRanking, onViewComparison }) => {
  const dm = darkMode;
  const card = dm ? "bg-[#090909] border border-[#b19149]/20" : "bg-white border border-gray-200";
  const text = dm ? "text-[#f8d06b]" : "text-black";
  const muted = dm ? "text-[#a78b3c]" : "text-gray-600";

  if (!simulationResults) {
    return (
      <div className={`${card} rounded-2xl ${dm? 'shadow-[0_25px_70px_rgba(0,0,0,0.35)]' : 'shadow'} p-12 text-center`}>
        <TrendingUp size={64} className={`mx-auto mb-4 ${dm? 'text-[#f8d06b]' : 'text-[#0b74de]'}`}/>
        <h3 className={`text-2xl font-bold ${text} mb-2`}>Ready to Predict</h3>
        <p className={`${muted} mb-6`}>Fill in athlete details on the left and hit Calculate.</p>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
          {[
            ["8+","Factors",  "bg-[#111111]", "text-[#f8d06b]"],
            ["3","Scenarios", "bg-[#111111]", "text-[#f8d06b]"],
            ["~70%","Accuracy","bg-[#111111]", "text-[#f8d06b]"],
          ].map(([v,l,bg,col])=>(
            <div key={l} className={`p-4 rounded-lg ${dm? bg : 'bg-white border border-gray-100'}`}>
              <div className={`font-bold text-2xl mb-1 ${dm? col : 'text-black'}`}>{v}</div>
              <div className={`text-xs ${muted}`}>{l}</div>
            </div>
          ))}
        </div>
        <div className={`${dm? 'p-4 rounded-xl border-2 max-w-md mx-auto bg-[#0f0f0f] border-[#b19149]/20' : 'p-4 rounded-xl border max-w-md mx-auto bg-white border-gray-100'}`}>
          <div className={`flex items-center gap-2 text-sm font-semibold ${dm? 'text-[#f8d06b]' : 'text-black'}`}><UserPlus size={16}/>Auto-Save Active</div>
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
      <div className={`${dm? 'bg-[#090909] border border-[#b19149]/15 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] p-8' : 'bg-white border border-gray-100 rounded-2xl shadow p-8'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`text-2xl font-bold ${text}`}>Results for {athleteName}</h3>
          <span className={`${dm? 'px-3 py-1 bg-[#b19149]/20 text-[#f8d06b]' : 'px-3 py-1 bg-gray-100 text-[#0b74de]' } rounded-full text-sm font-semibold`}>{simulationResults.event}m</span>
        </div>
        {simulationResults.originalVenue && <p className={`${dm? 'text-sm text-[#a78b3c] mb-6' : 'text-sm text-gray-600 mb-6'}`}>📍 Based on recorded race at {simulationResults.originalVenue}</p>}
        <div className="grid grid-cols-3 gap-4">
          {[["Optimistic",simulationResults.optimisticTime,"text-4xl",false],["Predicted",simulationResults.predictedTime,"text-5xl",true],["Pessimistic",simulationResults.pessimisticTime,"text-4xl",false]].map(([label,val,size,highlight])=>(
            <div key={label} className={`text-center p-4 rounded-xl border ${highlight? (dm? "bg-[#b19149]/20 border-[#f8d06b]/30" : "bg-[#0b74de]/10 border-[#0b74de]/30") : (dm? 'bg-[#0f0f0f] border-[#b19149]/15' : 'bg-white border border-gray-100')}`}>
              <div className={`${dm? 'text-sm text-[#a78b3c] mb-2' : 'text-sm text-gray-600 mb-2'}`}>{label}</div>
              <div className={`${size} font-bold ${text}`}>{val}s</div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-center pt-6 border-t border-[#b19149]/10">
          <div><div className={`${dm? 'text-sm text-[#a78b3c]' : 'text-sm text-gray-600'}`}>Recorded Time</div><div className={`text-2xl font-bold mt-1 ${text}`}>{simulationResults.baselineTime}s</div></div>
          <div><div className={`${dm? 'text-sm text-[#a78b3c]' : 'text-sm text-gray-600'}`}>Difference from Recorded</div><div className={`text-2xl font-bold mt-1 ${text}`}>{parseFloat(simulationResults.improvement)<0?"+":""}{Math.abs(parseFloat(simulationResults.improvement))}s</div></div>
        </div>
      </div>

      <GraphVisualizationModule simulationResults={simulationResults}/>

      {/* ===== NEW: Percentile Ranking ===== */}
      {percentileRanking && (
        <div className={`${dm? 'bg-[#090909] border border-[#b19149]/15 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] p-8' : 'bg-white border border-gray-100 rounded-2xl shadow p-8'}`}>
          <h3 className={`text-xl font-bold mb-4 ${text} flex items-center gap-2`}>
            <Award size={20} />
            🏆 Your Ranking
          </h3>
          <div className={`p-4 rounded-lg ${dm? 'bg-[#b19149]/10 border border-[#b19149]/30' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-lg font-bold ${dm? 'text-[#f8d06b]' : 'text-[#0b74de]'}`}>
              {percentileRanking.message}
            </p>
            <p className={`text-sm mt-2 ${muted}`}>
              Your predicted time ranks you among all {percentileRanking.totalAthletes} recorded athletes in the {simulationResults.event}m event.
            </p>
          </div>
        </div>
      )}

      {/* ===== NEW: Comparison Section ===== */}
      {comparisonReports && comparisonReports.length > 0 && (
        <div className={`${dm? 'bg-[#090909] border border-[#b19149]/15 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] p-8' : 'bg-white border border-gray-100 rounded-2xl shadow p-8'}`}>
          <h3 className={`text-xl font-bold mb-4 ${text}`}>📊 Historical Comparison</h3>
          <p className={`${muted} mb-4 text-sm`}>Your conditions compared to {comparisonReports.length} similar historical runs:</p>
          
          <div className="space-y-2">
            {comparisonReports.slice(0, 3).map((report, idx) => (
              <div key={idx} className={`p-4 rounded-lg border ${dm? 'bg-[#0f0f0f] border-[#b19149]/20' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className={`font-semibold ${text}`}>#{report.rank} • {report.comparison.name}</p>
                    <p className={`text-xs ${muted}`}>{report.comparison.venue} ({report.comparison.year}) • {report.comparison.country}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    report.similarityPercentage >= 80 ? 'bg-green-500/20 text-green-400' :
                    report.similarityPercentage >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {report.similarityPercentage}% match
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className={muted}>Their Time</span>
                    <p className={`font-bold ${text}`}>{report.comparison.theirTime}</p>
                  </div>
                  <div>
                    <span className={muted}>Your Prediction</span>
                    <p className={`font-bold ${text}`}>{report.comparison.yourPredictedTime}</p>
                  </div>
                  <div>
                    <span className={muted}>Difference</span>
                    <p className={`font-bold ${parseFloat(report.comparison.timeDifference) < 0 ? 'text-green-400' : 'text-orange-400'}`}>
                      {parseFloat(report.comparison.timeDifference) < 0 ? '−' : '+'}
                      {Math.abs(parseFloat(report.comparison.timeDifference)).toFixed(2)}s
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onViewComparison}
            className={`w-full mt-4 p-3 rounded-lg font-semibold transition-all ${
              dm 
                ? 'bg-[#b19149] text-black hover:bg-[#d4a574]' 
                : 'bg-[#0b74de] text-white hover:bg-[#0859a1]'
            }`}
          >
            📊 View Full Comparison ({comparisonReports.length} runs)
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsOutputPage;