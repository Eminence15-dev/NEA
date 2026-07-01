// ================================================================
// HistoricalComparisonPage.jsx
// Displays similar historical runs and performance comparison
// ================================================================

import { TrendingDown, Zap, AlertTriangle, Target, Award, TrendingUp } from "lucide-react";

const HistoricalComparisonPage = ({ comparisonReports, runnerComparisonAdvice, runnerTime, runnerName, darkMode }) => {
  const dm = darkMode;
  const text = dm ? "text-[#f8d06b]" : "text-[#0b74de]";
  const muted = dm ? "text-[#a78b3c]" : "text-gray-600";
  const card = dm ? "bg-[#090909] border-[#b19149]/20" : "bg-white border-gray-200";
  const bgAccent = dm ? "bg-[#1a1a1a]" : "bg-[#f0f9ff]";

  const hasHistoricalComparisons = comparisonReports && comparisonReports.length > 0;
  const hasRunnerComparisons = Boolean(runnerComparisonAdvice && runnerComparisonAdvice.length > 0);

  if (!hasHistoricalComparisons && !hasRunnerComparisons) {
    return (
      <div className={`min-h-screen ${dm ? "bg-black" : "bg-white"} p-5`}>
        <div className={`${card} rounded-2xl shadow-lg p-8 text-center`}>
          <p className={muted}>No detailed comparisons available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${dm ? "bg-black" : "bg-white"} p-5`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className={`${card} rounded-2xl shadow-lg p-8 border`}>
          <h2 className={`text-2xl font-bold mb-2 ${text} flex items-center gap-2`}>
            <Award size={24} />
            Detailed Comparison Page
          </h2>
          <p className={muted}>
            {hasHistoricalComparisons
              ? `Your official recorded time compared to ${comparisonReports.length} similar historical runs`
              : "Your personal time comparison is ready below"}
          </p>
        </div>

        {/* Historical Comparison Reports */}
        {hasHistoricalComparisons && comparisonReports.map((report, index) => (
          <div
            key={index}
            className={`${card} rounded-2xl shadow-lg p-8 border overflow-hidden`}
          >
            {/* Top Section: Rank & Similarity */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className={`text-4xl font-bold ${text} mb-2`}>#{report.rank}</div>
                <p className={`text-sm ${muted} font-semibold`}>Similarity Match</p>
              </div>

              {/* Similarity Score */}
              <div className="text-center">
                <div
                  className={`text-5xl font-bold mb-2 ${
                    report.similarityPercentage >= 80
                      ? "text-green-500"
                      : report.similarityPercentage >= 60
                        ? "text-yellow-500"
                        : "text-orange-500"
                  }`}
                >
                  {report.similarityPercentage}%
                </div>
                <div className="text-xs font-semibold text-gray-400">Match Score</div>
                {report.similarityPercentage >= 80 && (
                  <div className="text-xs text-green-400 mt-1 font-semibold">🎯 Excellent Match</div>
                )}
              </div>
            </div>

            {/* Athlete & Venue Info */}
            <div className={`${bgAccent} rounded-lg p-4 mb-6 border ${dm ? "border-[#b19149]/10" : "border-[#bae6fd]"}`}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className={`${muted} font-semibold text-xs uppercase mb-1`}>Athlete</p>
                  <p className={`${text} font-bold text-base`}>{report.comparison.name}</p>
                </div>
                <div>
                  <p className={`${muted} font-semibold text-xs uppercase mb-1`}>Country</p>
                  <p className={`${text} font-bold`}>{report.comparison.country}</p>
                </div>
                <div>
                  <p className={`${muted} font-semibold text-xs uppercase mb-1`}>Venue</p>
                  <p className={`${text} text-sm`}>{report.comparison.venue}</p>
                </div>
                <div>
                  <p className={`${muted} font-semibold text-xs uppercase mb-1`}>Year & City</p>
                  <p className={`${text} text-sm`}>
                    {report.comparison.year} · {report.comparison.city}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Comparison */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`${bgAccent} rounded-lg p-4 text-center border ${dm ? "border-[#b19149]/10" : "border-[#bae6fd]"}`}>
                <p className={`${muted} text-xs font-semibold uppercase mb-2`}>Their Record</p>
                <p className={`text-2xl font-bold ${text}`}>{report.comparison.theirTime}</p>
              </div>

              <div className={`${bgAccent} rounded-lg p-4 text-center border ${dm ? "border-[#b19149]/10" : "border-[#bae6fd]"}`}>
                <p className={`${muted} text-xs font-semibold uppercase mb-2`}>Your Official Time</p>
                <p className={`text-2xl font-bold ${text}`}>{report.comparison.yourRecordedTime}</p>
              </div>

              <div
                className={`rounded-lg p-4 text-center border ${
                  parseFloat(report.comparison.timeDifference) < 0
                    ? dm
                      ? "bg-green-500/20 border-green-500/30"
                      : "bg-green-100 border-green-300"
                    : dm
                      ? "bg-red-500/20 border-red-500/30"
                      : "bg-red-100 border-red-300"
                }`}
              >
                <p className={`text-xs font-semibold uppercase mb-2 ${parseFloat(report.comparison.timeDifference) < 0 ? "text-green-400" : "text-red-400"}`}>
                  Difference
                </p>
                <p
                  className={`text-2xl font-bold ${parseFloat(report.comparison.timeDifference) < 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {parseFloat(report.comparison.timeDifference) < 0 ? "−" : "+"}
                  {Math.abs(parseFloat(report.comparison.timeDifference)).toFixed(2)}s
                </p>
              </div>
            </div>

            {/* Condition Details */}
            <div className={`${bgAccent} rounded-lg p-4 mb-6 border ${dm ? "border-[#b19149]/10" : "border-[#bae6fd]"}`}>
              <p className={`${text} font-semibold mb-3 text-sm`}>Condition Differences</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className={muted}>Temperature</p>
                  <p className={`${text} font-semibold`}>{report.conditionDifferences.temperature}</p>
                </div>
                <div>
                  <p className={muted}>Humidity</p>
                  <p className={`${text} font-semibold`}>{report.conditionDifferences.humidity}</p>
                </div>
                <div>
                  <p className={muted}>Wind</p>
                  <p className={`${text} font-semibold`}>{report.conditionDifferences.wind}</p>
                </div>
                <div>
                  <p className={muted}>Altitude</p>
                  <p className={`${text} font-semibold`}>{report.conditionDifferences.altitude}</p>
                </div>
              </div>
            </div>

            {/* Improvements */}
            {report.advice && report.advice.length > 0 && (
              <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className={`font-semibold text-sm mb-2 flex items-center gap-2 text-green-400`}>
                  <Zap size={16} />
                  Favorable Factors
                </p>
                <ul className="text-sm text-green-300 space-y-1">
                  {report.advice.map((advice, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1">✓</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Challenges */}
            {report.challenges && report.challenges.length > 0 && (
              <div className="mb-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <p className={`font-semibold text-sm mb-2 flex items-center gap-2 text-orange-400`}>
                  <AlertTriangle size={16} />
                  Challenging Factors
                </p>
                <ul className="text-sm text-orange-300 space-y-1">
                  {report.challenges.map((challenge, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1">⚠</span>
                      <span>{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendation */}
            {report.recommendation && (
              <div className={`p-4 rounded-lg border ${dm ? "bg-[#b19149]/10 border-[#b19149]/30" : "bg-blue-50 border-blue-200"}`}>
                <p className={`font-semibold text-sm mb-1 flex items-center gap-2 ${text}`}>
                  <Target size={16} />
                  Recommendation
                </p>
                <p className={`${muted} text-sm`}>{report.recommendation}</p>
              </div>
            )}
          </div>
        ))}

        {/* Runner time comparisons */}
        {hasRunnerComparisons && (
          <div className={`${card} rounded-2xl shadow-lg p-8 border`}>
            <h3 className={`text-xl font-bold mb-3 ${text} flex items-center gap-2`}>
              <TrendingUp size={20} />
              Your Actual Time vs Similar Runners
            </h3>
            <p className={`${muted} mb-5 text-sm`}>
              {runnerName || "Runner"} recorded {runnerTime}s. The following same-gender runners were matched automatically for comparison.
            </p>

            <div className="space-y-3">
              {runnerComparisonAdvice.map((comparison, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${dm ? "bg-[#0f0f0f] border-[#b19149]/20" : "bg-gray-50 border-gray-200"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className={`font-semibold ${text}`}>{comparison.athleteName}</p>
                      <p className={`text-xs ${muted}`}>Their time: {comparison.athleteTime}s</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${
                      comparison.performanceStatus.includes("FASTER") ? "bg-green-500/20 text-green-400" :
                      comparison.performanceStatus.includes("MATCHED") ? "bg-blue-500/20 text-blue-400" :
                      comparison.performanceStatus.includes("SLIGHTLY") ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-orange-500/20 text-orange-400"
                    }`}>
                      {comparison.performanceStatus}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div className={`p-2 rounded ${dm ? "bg-[#1a1a1a]" : "bg-white"} text-center border ${dm ? "border-[#b19149]/10" : "border-gray-100"}`}>
                      <span className={muted}>Time Difference</span>
                      <p className={`font-bold ${text}`}>{comparison.timeDifference > 0 ? "+" : ""}{comparison.timeDifference}s</p>
                    </div>
                    <div className={`p-2 rounded ${dm ? "bg-[#1a1a1a]" : "bg-white"} text-center border ${dm ? "border-[#b19149]/10" : "border-gray-100"}`}>
                      <span className={muted}>Difference %</span>
                      <p className={`font-bold ${text}`}>{comparison.percentDifference}%</p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border-l-4 ${
                    comparison.performanceStatus.includes("FASTER") ? "border-l-green-500 bg-green-500/5" :
                    comparison.performanceStatus.includes("MATCHED") ? "border-l-blue-500 bg-blue-500/5" :
                    comparison.performanceStatus.includes("SLIGHTLY") ? "border-l-yellow-500 bg-yellow-500/5" :
                    "border-l-orange-500 bg-orange-500/5"
                  }`}>
                    <p className={`text-sm font-semibold ${dm ? "text-[#f8d06b]" : "text-[#0b74de]"} mb-2`}>Improvement Tips:</p>
                    <ul className="space-y-1">
                      {comparison.advice.map((tip, tipIdx) => (
                        <li key={tipIdx} className={`text-sm ${muted} flex items-start gap-2`}>
                          <span className="mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalComparisonPage;
