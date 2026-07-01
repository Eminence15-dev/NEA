const DEFAULT_ADVICE = "Keep the training simple this week: maintain rhythm, recover well, and repeat the same session once your legs feel fresh.";

const buildConditionNarrative = (conditions) => {
  const parts = [];

  if (conditions.altitude > 1000) {
    parts.push(`high altitude (${conditions.altitude}m)`);
  } else if (conditions.altitude < 200) {
    parts.push(`low altitude (${conditions.altitude}m)`);
  }

  if (conditions.temperature > 28) {
    parts.push(`hot conditions (${conditions.temperature}°C)`);
  } else if (conditions.temperature < 10) {
    parts.push(`cool conditions (${conditions.temperature}°C)`);
  }

  if (conditions.humidity > 75) {
    parts.push(`high humidity (${conditions.humidity}%)`);
  }

  if (conditions.windSpeed > 3) {
    parts.push(`strong wind (${conditions.windSpeed}m/s)`);
  }

  return parts.length > 0 ? parts.join(", ") : "stable conditions";
};

export const normalizeRunnerInput = (formData, selectedAthlete, simulationResults) => {
  const runnerTime = Number(formData.runnerTime || 0);
  const referenceTime = selectedAthlete?.raceTime ? Number(selectedAthlete.raceTime) : simulationResults?.predictedTime || runnerTime;

  return {
    eventDistance: Number(formData.eventDistance || 100),
    runnerTime,
    referenceTime,
    gapSeconds: Number((runnerTime - referenceTime).toFixed(2)),
    conditions: {
      altitude: Number(formData.altitude || 0),
      temperature: Number(formData.temperature || 20),
      humidity: Number(formData.humidity || 50),
      windSpeed: Number(formData.tailwind || 0),
      trackCondition: formData.trackCondition || "optimal",
      vo2max: Number(formData.vo2max || 60),
    },
    performance: formData.runnerPerformance || "steady",
    location: formData.runnerLocation || "Unknown location",
    runDate: formData.runnerDate || "",
    notes: formData.runnerNotes || "",
    athleteName: formData.athleteName || selectedAthlete?.name || "reference athlete",
  };
};

export const generateRuleBasedSuggestions = (normalizedInput) => {
  const suggestions = [];
  const { conditions, performance, gapSeconds, eventDistance, vo2max } = normalizedInput;

  if (conditions.altitude > 1000) {
    suggestions.push({
      title: "Altitude-ready power session",
      detail: "Use short hill sprints and mobility work to build power without overloading your legs.",
    });
  } else if (conditions.altitude < 200) {
    suggestions.push({
      title: "Fast-twitch activation",
      detail: "Keep the session sharp with starts, accelerations, and relaxed mechanics.",
    });
  }

  if (conditions.humidity > 75) {
    suggestions.push({
      title: "Hydration and pacing focus",
      detail: "Plan for a slightly slower first half and use controlled breathing through the second half.",
    });
  }

  if (conditions.windSpeed > 3) {
    suggestions.push({
      title: "Wind-resistance drills",
      detail: "Practice 6 x 80m accelerations into a strong headwind to sharpen your form.",
    });
  }

  if (gapSeconds > 0.3) {
    suggestions.push({
      title: "Close the gap with speed endurance",
      detail: `Your current entry is ${gapSeconds.toFixed(2)}s slower than the reference athlete, so add 4 x 150m at 95% effort.`,
    });
  } else if (gapSeconds < -0.2) {
    suggestions.push({
      title: "Maintain your momentum",
      detail: "You are already competitive with the comparison pace; protect recovery and keep quality high.",
    });
  }

  if (vo2max < 60) {
    suggestions.push({
      title: "Aerobic base builder",
      detail: "Add a steady 20-minute run at conversational pace twice a week to improve oxygen efficiency.",
    });
  }

  if (eventDistance >= 200) {
    suggestions.push({
      title: "Race-specific endurance",
      detail: "Use 3 x 300m reps with full recovery to build strength for the longer event.",
    });
  }

  if (performance === "fatigued") {
    suggestions.push({
      title: "Recovery-first week",
      detail: "Prioritise sleep, mobility, and an easy jog rather than forcing a hard session.",
    });
  } else if (performance === "strong") {
    suggestions.push({
      title: "Quality session",
      detail: "This looks like a strong day; keep the next session focused on speed and technique.",
    });
  }

  return suggestions.length > 0 ? suggestions.slice(0, 3) : [
    {
      title: "Balanced performance plan",
      detail: "Keep a steady rhythm this week and add one quality session to lift your next race.",
    },
  ];
};

export const buildRunnerInsights = (normalizedInput, runnerHistory = []) => {
  const suggestions = generateRuleBasedSuggestions(normalizedInput);
  const conditionNarrative = buildConditionNarrative(normalizedInput.conditions);
  const comparisonLabel = normalizedInput.gapSeconds === 0
    ? "Your time matches the reference pace closely."
    : normalizedInput.gapSeconds > 0
      ? `You are ${Math.abs(normalizedInput.gapSeconds).toFixed(2)}s slower than ${normalizedInput.athleteName}.`
      : `You are ${Math.abs(normalizedInput.gapSeconds).toFixed(2)}s faster than ${normalizedInput.athleteName}.`;

  const recentTrend = runnerHistory.length > 1
    ? `Your last ${Math.min(runnerHistory.length, 3)} runs suggest a ${runnerHistory[0].raceTime <= runnerHistory[1].raceTime ? "stronger" : "mixed"} recent trend.`
    : "Save a few more runs to build a trend line.";

  const advice = [
    `${comparisonLabel} The conditions were ${conditionNarrative}.`,
    recentTrend,
    "Use this as a coaching snapshot: recover well, sharpen your speed, and build consistency over time.",
  ].join(" ");

  return {
    summary: advice,
    comparisonLabel,
    conditionNarrative,
    suggestions,
    advice: advice || DEFAULT_ADVICE,
    historyCount: runnerHistory.length,
    source: "rule-based",
  };
};

export const generateRunnerAdvice = async (normalizedInput, runnerHistory = []) => {
  const fallback = buildRunnerInsights(normalizedInput, runnerHistory);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return fallback;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a sprint coach. Provide concise, practical coaching advice in plain English.",
          },
          {
            role: "user",
            content: `Create a short coaching note for a runner with the following information: event ${normalizedInput.eventDistance}m, time ${normalizedInput.runnerTime}s, reference athlete ${normalizedInput.athleteName} at ${normalizedInput.referenceTime}s, conditions ${normalizedInput.conditions.altitude}m altitude, ${normalizedInput.conditions.temperature}°C, ${normalizedInput.conditions.humidity}% humidity, ${normalizedInput.conditions.windSpeed}m/s wind, performance ${normalizedInput.performance}.`,
          },
        ],
        temperature: 0.6,
      }),
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content?.trim();

    if (text) {
      return {
        ...fallback,
        advice: text,
        source: "llm",
      };
    }
  } catch (error) {
    console.warn("LLM advice unavailable, using rule-based guidance.", error);
  }

  return fallback;
};

export default {
  normalizeRunnerInput,
  generateRuleBasedSuggestions,
  buildRunnerInsights,
  generateRunnerAdvice,
};
