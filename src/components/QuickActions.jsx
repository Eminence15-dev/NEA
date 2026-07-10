import React from "react";
import { TrendingUp, Database, UserPlus } from "lucide-react";

const QuickActions = ({ setCurrentPage, totalAthletes, muted, text }) => {
  return (
    <div className={`bg-[#080808] dark:bg-[#080808] bg-white border border-gray-200 dark:border-[#b19149]/20 rounded-2xl shadow-md p-8`}>
      <h2 className={`text-xl font-bold mb-5 ${text}`}>⚡ Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => setCurrentPage("simulation")}
          className="p-6 bg-[#0f0f0f] border border-[#b19149]/20 text-[#f8d06b] rounded-xl font-semibold hover:bg-[#1d1d1d] transition-all flex items-center justify-between"
        >
          <div className="text-left">
            <div className="text-lg mb-1">Run Simulation</div>
            <div className="text-xs opacity-75">100m or 200m</div>
          </div>
          <TrendingUp size={32} />
        </button>

        <button 
          onClick={() => setCurrentPage("database")}
          className="p-6 bg-[#0f0f0f] border border-[#b19149]/20 text-[#f8d06b] rounded-xl font-semibold hover:bg-[#1d1d1d] transition-all flex items-center justify-between"
        >
          <div className="text-left">
            <div className="text-lg mb-1">View Database</div>
            <div className="text-xs opacity-75">{totalAthletes} athletes stored</div>
          </div>
          <Database size={32} />
        </button>

        <div className="md:col-span-2 p-5 rounded-xl border-2 bg-[#0f0f0f] border-[#b19149]/15">
          <div className="flex items-start gap-3">
            <UserPlus className="text-[#f8d06b] mt-0.5 shrink-0" size={22} />
            <div>
              <div className="text-sm font-semibold mb-1 text-[#f8d06b]">Auto-Save + Event Separation</div>
              <div className={`text-sm ${muted}`}>
                Unknown athletes are auto-saved under their specific event. 100m and 200m are kept completely separate.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;