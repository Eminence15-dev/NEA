import { Award } from "lucide-react";

const FastestAthleteCard = ({ title, runner, darkMode = true }) => {
  if (!runner) return null;

  const card = darkMode
    ? "bg-[#080808]"
    : "bg-white border border-gray-200";

  const text = darkMode ? "text-[#f8d06b]" : "text-black";
  const muted = darkMode ? "text-[#a78b3c]" : "text-gray-600";
  const sub = darkMode ? "text-[#8f7d45]" : "text-gray-500";

  const accent = "#d6b451";

  return (
    <div className={`${card} rounded-2xl shadow-md p-8`}>
      <h2 className={`text-xl font-bold mb-5 flex items-center gap-2 ${text}`}>
        <Award size={22} style={{ color: accent }} />
        {title}
      </h2>

      <div
        className="rounded-xl p-5"
        style={{
          borderLeft: `4px solid ${accent}`,
          backgroundColor: "rgba(214,180,81,0.12)",
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <div className={`font-bold text-lg ${text}`}>
              {runner.name}
            </div>

            <div className={`text-sm ${muted}`}>
              {runner.country}
            </div>

            <div className={`text-xs ${sub} mt-1`}>
              {runner.venue}, {runner.city} ({runner.year})
            </div>

            <div className={`text-xs ${sub}`}>
              🌡️ {runner.temperature}°C · 💨 {runner.wind}m/s · 💧{" "}
              {runner.humidity}%
            </div>
          </div>

          <div className="text-right">
            <div
              className="text-4xl font-bold"
              style={{ color: accent }}
            >
              {runner.raceTime}s
            </div>

            <div className={`text-xs ${sub}`}>
              {runner.event}m
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FastestAthleteCard;