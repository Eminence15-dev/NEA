// ================================================================
// HistoricalComparisonModule.js
// Finds similar historical runs and compares current run to them
// ================================================================

/**
 * Calculate similarity score between two sets of conditions
 * Returns 0-100 where 100 is identical
 * @param {Object} conditions1 - { temperature, humidity, windSpeed, altitude, trackCondition }
 * @param {Object} conditions2
 * @returns {number} similarity score
 */
export const calculateConditionSimilarity = (conditions1, conditions2) => {
  // Weights for each factor (higher = more important)
  const weights = {
    temperature: 0.25,
    humidity: 0.15,
    windSpeed: 0.30, // Wind is most critical for sprints
    altitude: 0.15,
    trackCondition: 0.15,
  };

  let totalScore = 0;
  let totalWeight = 0;

  // Temperature similarity (±5°C = very similar)
  const tempDiff = Math.abs(conditions1.temperature - conditions2.temperature);
  const tempScore = Math.max(0, 100 - tempDiff * 4); // Each degree costs 4 points
  totalScore += tempScore * weights.temperature;
  totalWeight += weights.temperature;

  // Humidity similarity (±10% = very similar)
  const humidityDiff = Math.abs(conditions1.humidity - conditions2.humidity);
  const humidityScore = Math.max(0, 100 - humidityDiff * 1);
  totalScore += humidityScore * weights.humidity;
  totalWeight += weights.humidity;

  // Wind similarity (±0.5 m/s = very similar)
  // Note: wind is more forgiving for slower runners
  const windDiff = Math.abs(conditions1.windSpeed - conditions2.windSpeed);
  const windScore = Math.max(0, 100 - windDiff * 20);
  totalScore += windScore * weights.windSpeed;
  totalWeight += weights.windSpeed;

  // Altitude similarity (±100m = very similar)
  const altDiff = Math.abs(conditions1.altitude - conditions2.altitude);
  const altScore = Math.max(0, 100 - (altDiff / 100) * 5);
  totalScore += altScore * weights.altitude;
  totalWeight += weights.altitude;

  // Track condition similarity (categorical)
  const conditionScore = conditions1.trackCondition === conditions2.trackCondition ? 100 : 50;
  totalScore += conditionScore * weights.trackCondition;
  totalWeight += weights.trackCondition;

  return Math.round(totalScore / totalWeight);
};

/**
 * Find similar historical runs from athlete database
 * @param {Array} allAthletes - Array of athlete records
 * @param {Object} currentConditions - Current run conditions
 * @param {number} eventDistance - 100 or 200
 * @param {number} topN - Return top N similar runs (default 5)
 * @returns {Array} Sorted array of similar athletes with similarity scores
 */
export const findSimilarRuns = (allAthletes, currentConditions, eventDistance, topN = 5) => {
  const sameEventAthletes = allAthletes.filter(
    athlete => String(athlete.event) === String(eventDistance)
  );

  if (sameEventAthletes.length === 0) {
    return [];
  }

  const athleteWithScores = sameEventAthletes.map(athlete => {
    const athleteConditions = {
      temperature: athlete.temperature,
      humidity: athlete.humidity,
      windSpeed: Math.abs(athlete.wind), // Use absolute wind value
      altitude: athlete.altitude,
      trackCondition: "unknown", // Will be matched loosely
    };

    const similarity = calculateConditionSimilarity(currentConditions, athleteConditions);

    return {
      ...athlete,
      similarityScore: similarity,
      conditionMatch: {
        tempDiff: athlete.temperature - currentConditions.temperature,
        humidityDiff: athlete.humidity - currentConditions.humidity,
        windDiff: athlete.wind - currentConditions.windSpeed,
        altDiff: athlete.altitude - currentConditions.altitude,
      },
    };
  });

  return athleteWithScores
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, topN);
};

/**
 * Get performance improvement advice based on comparison
 * @param {Object} athlete - Historical athlete data
 * @param {Object} currentConditions - Current run conditions
 * @param {number} predictedTime - Predicted time for current run
 * @returns {Object} Advice with actionable insights
 */
export const getPerformanceAdvice = (athlete, currentConditions, predictedTime) => {
  const improvements = [];
  const challenges = [];

  // Temperature comparison
  if (currentConditions.temperature > athlete.temperature + 3) {
    challenges.push(
      `It's ${Math.round(currentConditions.temperature - athlete.temperature)}°C warmer than ${athlete.name}'s race conditions. Heat will slow you down.`
    );
  } else if (currentConditions.temperature < athlete.temperature - 3) {
    improvements.push(
      `It's ${Math.round(athlete.temperature - currentConditions.temperature)}°C cooler than ${athlete.name}'s race. Cooler temps favor sprinting.`
    );
  }

  // Wind comparison
  if (currentConditions.windSpeed < athlete.wind - 0.5) {
    improvements.push(
      `Wind conditions are ${(athlete.wind - currentConditions.windSpeed).toFixed(1)}m/s more favorable than ${athlete.name}'s race.`
    );
  } else if (currentConditions.windSpeed > athlete.wind + 0.5) {
    challenges.push(
      `Headwind is ${(currentConditions.windSpeed - athlete.wind).toFixed(1)}m/s stronger than ${athlete.name}'s race. You'll need extra effort.`
    );
  }

  // Altitude comparison
  if (currentConditions.altitude > athlete.altitude + 100) {
    challenges.push(
      `Higher altitude (${currentConditions.altitude}m vs ${athlete.altitude}m) means thinner air. Expect to feel it more.`
    );
  } else if (currentConditions.altitude < athlete.altitude - 100) {
    improvements.push(
      `Lower altitude gives denser air—${athlete.name} ran at ${athlete.altitude}m, you have an advantage.`
    );
  }

  // Humidity
  if (currentConditions.humidity > athlete.humidity + 15) {
    challenges.push(
      `High humidity (${currentConditions.humidity}%) will affect energy expenditure more than ${athlete.name}'s race (${athlete.humidity}%).`
    );
  }

  return {
    athlete: athlete.name,
    athleteRecord: `${athlete.raceTime}s at ${athlete.venue} (${athlete.year})`,
    predictedTime: predictedTime.toFixed(2),
    improvements: improvements.length > 0 ? improvements : ["Conditions are similar to your reference athlete."],
    challenges: challenges.length > 0 ? challenges : ["No significant environmental disadvantages."],
    advice: generateAdvice(improvements, challenges, athlete),
  };
};

/**
 * Generate actionable advice
 * @private
 */
const generateAdvice = (improvements, challenges, athlete) => {
  let advice = [];

  if (improvements.length > 0 && challenges.length === 0) {
    advice.push(`🎯 You're in favorable conditions. Target: Sub ${(parseFloat(athlete.raceTime) - 0.3).toFixed(2)}s`);
  } else if (challenges.length > 0 && improvements.length === 0) {
    advice.push(`💪 Conditions are tough. Focus on effort and execution—${(parseFloat(athlete.raceTime) + 0.5).toFixed(2)}s is solid.`);
  } else if (improvements.length > 0 && challenges.length > 0) {
    advice.push(`⚖️ Mixed conditions. Push on improvements, manage challenges—aim for around ${athlete.raceTime}s.`);
  } else {
    advice.push(`📊 Conditions match ${athlete.name}'s reference race. Perform at your best—target their time!`);
  }

  return advice;
};

/**
 * Build comparison report for display
 * @param {Object} currentConditions - Current run conditions
 * @param {Array} similarAthletes - Results from findSimilarRuns
 * @param {number} predictedTime - Predicted time
 * @returns {Array} Array of comparison reports
 */
export const buildComparisonReports = (currentConditions, similarAthletes, predictedTime) => {
  return similarAthletes.map((athlete, index) => {
    const advice = getPerformanceAdvice(athlete, currentConditions, predictedTime);
    return {
      rank: index + 1,
      similarityPercentage: athlete.similarityScore,
      comparison: {
        name: athlete.name,
        country: athlete.country,
        city: athlete.city,
        year: athlete.year,
        venue: athlete.venue,
        theirTime: `${athlete.raceTime}s`,
        yourPredictedTime: `${predictedTime.toFixed(2)}s`,
        timeDifference: (predictedTime - parseFloat(athlete.raceTime)).toFixed(2),
      },
      conditionDifferences: {
        temperature: `${athlete.temperature}°C vs ${currentConditions.temperature}°C (${athlete.temperature - currentConditions.temperature > 0 ? "+" : ""}${(athlete.temperature - currentConditions.temperature).toFixed(1)}°C)`,
        humidity: `${athlete.humidity}% vs ${currentConditions.humidity}% (${athlete.humidity - currentConditions.humidity > 0 ? "+" : ""}${(athlete.humidity - currentConditions.humidity).toFixed(1)}%)`,
        wind: `${athlete.wind}m/s vs ${currentConditions.windSpeed}m/s (${athlete.wind - currentConditions.windSpeed > 0 ? "+" : ""}${(athlete.wind - currentConditions.windSpeed).toFixed(1)}m/s)`,
        altitude: `${athlete.altitude}m vs ${currentConditions.altitude}m (${athlete.altitude - currentConditions.altitude > 0 ? "+" : ""}${(athlete.altitude - currentConditions.altitude).toFixed(0)}m)`,
      },
      advice: advice.improvements,
      challenges: advice.challenges,
      recommendation: advice.advice[0],
    };
  });
};

/**
 * Calculate percentile ranking
 * Where does this predicted time rank among all athletes?
 * @param {number} predictedTime - The predicted time
 * @param {Array} allAthletes - All athletes in database
 * @param {number} eventDistance - Event distance (100 or 200)
 * @returns {Object} { percentile, ranking, totalAthletes }
 */
export const calculatePercentile = (predictedTime, allAthletes, eventDistance) => {
  const sameEvent = allAthletes
    .filter(a => String(a.event) === String(eventDistance))
    .map(a => parseFloat(a.raceTime));

  if (sameEvent.length === 0) {
    return { percentile: 50, ranking: null, totalAthletes: 0 };
  }

  const faster = sameEvent.filter(t => t < predictedTime).length;
  const percentile = Math.round((faster / sameEvent.length) * 100);

  return {
    percentile,
    ranking: faster + 1,
    totalAthletes: sameEvent.length,
    message: `You'd rank ${faster + 1}/${sameEvent.length} (${percentile}th percentile among ${sameEvent.length} athletes)`,
  };
};

export default {
  calculateConditionSimilarity,
  findSimilarRuns,
  getPerformanceAdvice,
  buildComparisonReports,
  calculatePercentile,
};
