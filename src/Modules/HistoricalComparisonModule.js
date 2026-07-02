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
  // Keep the predicted value for context, but use the athlete's official recorded time in the comparison output.
  const numPredictedTime = typeof predictedTime === "number" ? predictedTime : parseFloat(predictedTime) || 0;
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
    comparedTime: `${parseFloat(athlete.raceTime).toFixed(2)}s`,
    predictedTime: numPredictedTime.toFixed(2),
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
 * @param {number} referenceTime - The runner's recorded time to use as the comparison baseline
 * @returns {Array} Array of comparison reports
 */
export const buildComparisonReports = (currentConditions, similarAthletes, referenceTime) => {
  const numReferenceTime = typeof referenceTime === "number" ? referenceTime : parseFloat(referenceTime) || 0;
  return similarAthletes.map((athlete, index) => {
    const advice = getPerformanceAdvice(athlete, currentConditions, numReferenceTime);
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
        yourRecordedTime: `${numReferenceTime.toFixed(2)}s`,
        timeDifference: (numReferenceTime - parseFloat(athlete.raceTime)).toFixed(2),
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
  // Ensure predictedTime is a number
  const numPredictedTime = typeof predictedTime === "number" ? predictedTime : parseFloat(predictedTime) || 0;
  const sameEvent = allAthletes
    .filter(a => String(a.event) === String(eventDistance))
    .map(a => parseFloat(a.raceTime));

  if (sameEvent.length === 0) {
    return { percentile: 50, ranking: null, totalAthletes: 0 };
  }

  const faster = sameEvent.filter(t => t < numPredictedTime).length;
  const percentile = Math.round((faster / sameEvent.length) * 100);

  return {
    percentile,
    ranking: faster + 1,
    totalAthletes: sameEvent.length,
    message: `You'd rank ${faster + 1}/${sameEvent.length} (${percentile}th percentile among ${sameEvent.length} athletes)`,
  };
};

/**
 * Find all runners of same gender with similar times to runner's actual time
 * @param {number} actualRunnerTime - The time the runner actually ran
 * @param {string} runnerGender - The runner's gender (male/female)
 * @param {Array} allAthletes - All available athletes
 * @param {string} eventDistance - Event distance (100 or 200)
 * @returns {Array} Matching athletes sorted by time similarity
 */
export const findSimilarRunnersByGenderAndTime = (actualRunnerTime, runnerGender, allAthletes, eventDistance) => {
  const numActualTime = typeof actualRunnerTime === "number" ? actualRunnerTime : parseFloat(actualRunnerTime) || 0;
  if (numActualTime === 0) return [];

  // Define tolerance range: ±5% of actual time
  const tolerance = numActualTime * 0.05;
  const minTime = numActualTime - tolerance;
  const maxTime = numActualTime + tolerance;

  // Filter athletes: same gender, same event, similar time
  const runnerGenderNorm = (runnerGender || "").toLowerCase();
  const athleteCandidates = allAthletes
    .filter(athlete => {
      const athleteGender = (athlete.gender || "").toLowerCase();
      return (
        athleteGender === runnerGenderNorm &&
        String(athlete.event) === String(eventDistance)
      );
    })
    .map(athlete => ({
      athlete,
      timeDiff: Math.abs(parseFloat(athlete.raceTime) - numActualTime),
      athleteTime: parseFloat(athlete.raceTime),
    }));

  if (athleteCandidates.length === 0) return [];

  // Prefer same-gender same-event athletes in a 5% window, but fall back to nearest matches.
  const inTolerance = athleteCandidates.filter(candidate => candidate.athleteTime >= minTime && candidate.athleteTime <= maxTime);
  const sortedCandidates = (inTolerance.length > 0 ? inTolerance : athleteCandidates)
    .sort((a, b) => a.timeDiff - b.timeDiff)
    .slice(0, 5)
    .map(candidate => candidate.athlete);

  return sortedCandidates;
};

/**
 * Compare actual runner time to similar athletes and generate improvement advice
 * @param {number} actualRunnerTime - The time the runner actually ran
 * @param {Array} similarAthletes - Similar athletes found by findSimilarRunnersByGenderAndTime
 * @param {Object} currentConditions - Current run conditions
 * @returns {Array} Improvement advice based on actual performance vs similar athletes
 */
export const generateRunnerComparisonAdvice = (actualRunnerTime, similarAthletes, currentConditions) => {
  const numActualTime = typeof actualRunnerTime === "number" ? actualRunnerTime : parseFloat(actualRunnerTime) || 0;
  if (similarAthletes.length === 0 || numActualTime === 0) {
    return [];
  }

  return similarAthletes.map((athlete) => {
    const athleteTime = parseFloat(athlete.raceTime);
    const timeDiff = numActualTime - athleteTime;
    const percentDiff = ((timeDiff / athleteTime) * 100).toFixed(1);

    let performanceStatus = "";
    let advice = [];

    if (timeDiff < -0.3) {
      performanceStatus = "🏆 FASTER";
      advice.push(`You beat ${athlete.name}'s time by ${Math.abs(timeDiff).toFixed(2)}s (${Math.abs(percentDiff)}% faster)!`);
      advice.push(`This is excellent—your fitness and technique are performing well in these conditions.`);
    } else if (timeDiff < 0.3) {
      performanceStatus = "✅ MATCHED";
      advice.push(`Your time closely matches ${athlete.name}'s (${athlete.name}: ${athleteTime}s, You: ${numActualTime.toFixed(2)}s).`);
      advice.push(`Conditions are similar—this is a solid baseline performance.`);
    } else if (timeDiff < 1.0) {
      performanceStatus = "⚠️  SLIGHTLY SLOWER";
      advice.push(`You ran ${timeDiff.toFixed(2)}s slower than ${athlete.name} (${percentDiff}% slower).`);
      if (currentConditions.temperature > athlete.temperature) {
        advice.push(`The warmer conditions (${currentConditions.temperature}°C vs ${athlete.temperature}°C) likely contributed.`);
      }
      if (currentConditions.windSpeed > athlete.wind) {
        advice.push(`Headwind was stronger (${currentConditions.windSpeed}m/s vs ${athlete.wind}m/s)—work on wind management.`);
      }
      if (currentConditions.altitude > athlete.altitude) {
        advice.push(`Higher altitude reduced oxygen availability—consider acclimatization training.`);
      }
      advice.push(`Focus: Improve pacing strategy and breathing efficiency in adverse conditions.`);
    } else {
      performanceStatus = "💪 NEEDS WORK";
      advice.push(`You ran ${timeDiff.toFixed(2)}s slower than ${athlete.name} (${percentDiff}% slower).`);
      advice.push(`Analyze: Was it fitness, pacing strategy, or environmental factors?`);
      if (currentConditions.humidity > athlete.humidity + 10) {
        advice.push(`High humidity (${currentConditions.humidity}%) drained energy—hydration strategy review needed.`);
      }
      advice.push(`Next steps: Identify the limiting factor and build targeted training.`);
    }

    return {
      athleteName: athlete.name,
      athleteTime: athleteTime,
      yourTime: numActualTime.toFixed(2),
      timeDifference: timeDiff.toFixed(2),
      percentDifference: percentDiff,
      performanceStatus,
      advice,
    };
  });
};

export default {
  calculateConditionSimilarity,
  findSimilarRuns,
  getPerformanceAdvice,
  buildComparisonReports,
  calculatePercentile,
  findSimilarRunnersByGenderAndTime,
  generateRunnerComparisonAdvice,
};
