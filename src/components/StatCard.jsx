const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  darkMode = true,
}) => {
  return (
    <div
      className={`rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        darkMode
          ? "bg-[#111111] border border-[#b19149]/20"
          : "bg-white border border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {title}
          </p>

          <h2
            className={`text-3xl font-bold mt-2 ${
              darkMode ? "text-[#f8d06b]" : "text-black"
            }`}
          >
            {value}
          </h2>

          {subtitle && (
            <p
              className={`mt-2 text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-[#B83E18]/10 flex items-center justify-center">
            <Icon className="text-[#B83E18]" size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;