import {
  Calendar,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecentSimulations = ({
  recentSimulations,
  onClearSimulations,
  darkMode = true,
}) => {
  const navigate = useNavigate();

  const card = darkMode
    ? "bg-[#080808]"
    : "bg-white border border-gray-200";

  const text = darkMode ? "text-[#f8d06b]" : "text-black";
  const muted = darkMode ? "text-[#a78b3c]" : "text-gray-600";
  const sub = darkMode ? "text-[#8f7d45]" : "text-gray-500";

  return (
    <div className={`${card} rounded-2xl shadow-md p-8`}>
      <div className="flex justify-between items-center mb-5">
        <h2
          className={`text-xl font-bold flex items-center gap-2 ${text}`}
        >
          <Calendar
            className="text-[#f8d06b]"
            size={22}
          />
          Recent Simulations
        </h2>

        {recentSimulations.length > 0 && (
          <button
            onClick={onClearSimulations}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#f8d06b] border border-[#f8d06b]/20 rounded-lg hover:bg-[#b19149]/10 transition-colors font-semibold"
          >
            <Trash2 size={14} />
            Clear
          </button>
        )}
      </div>

      {recentSimulations.length === 0 ? (
        <div className={`text-center py-10 ${muted}`}>
          <TrendingUp
            size={48}
            className="mx-auto mb-4 opacity-40"
          />

          <p className="text-lg font-semibold">
            No simulations yet
          </p>

          <button
            onClick={() => navigate("/simulation")}
            className="mt-4 px-6 py-2 bg-[#B83E18] text-white rounded-lg hover:bg-[#8F2E0E] transition-colors"
          >
            Run First Simulation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {recentSimulations.map((sim, idx) => (
            <div
              key={idx}
              className="rounded-lg p-4 border-l-4 border-[#B83E18]"
              style={{
                backgroundColor: "rgba(255,209,87,0.08)",
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`font-bold ${text}`}>
                      {sim.name}
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#111111] text-[#f2d05d]">
                      {sim.event}m
                    </span>

                    {sim.custom && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#1d1d1d] text-[#f8d06b]">
                        ✨ New
                      </span>
                    )}
                  </div>

                  <div className={`text-sm ${muted}`}>
                    <span className="font-semibold">
                      Recorded:
                    </span>{" "}
                    {sim.pb === "N/A" ? (
                      <span className="text-[#3A6BC8] font-medium">
                        from database
                      </span>
                    ) : (
                      `${sim.pb}s`
                    )}

                    {" → "}

                    <span className="font-semibold text-[#B83E18]">
                      Predicted:
                    </span>{" "}
                    {sim.predicted}s
                  </div>

                  <div className={`text-xs ${sub} mt-0.5`}>
                    {sim.conditions}
                  </div>
                </div>

                <div className={`text-xs ${sub} ml-2`}>
                  {sim.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentSimulations;