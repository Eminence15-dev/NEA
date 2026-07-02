// ================================================================
// ComparisonProcess.js
// Separate comparison orchestration from the simulation engine.
// ================================================================

import {
  findSimilarRuns,
  buildComparisonReports,
  calculatePercentile,
  findSimilarRunnersByGenderAndTime,
  generateRunnerComparisonAdvice,
} from "./HistoricalComparisonModule";

export const computeComparisonAnalysis = ({ formData, allAthletes, simulationResults }) => {
  if (!simulationResults || !allAthletes || allAthletes.length === 0) {
    return {
      comparisonReports: [],
      percentileRanking: null,
      runnerComparisonAdvice: [],
    };
  }

  const currentConditions = {
    temperature: parseFloat(formData.temperature) || 0,
    humidity: parseFloat(formData.humidity) || 0,
    windSpeed: parseFloat(formData.tailwind) || 0,
    altitude: parseFloat(formData.altitude) || 0,
    trackCondition: formData.trackCondition,
  };

  const similarAthletes = findSimilarRuns(
    allAthletes,
    currentConditions,
    formData.eventDistance,
    5
  );

  const comparisonReferenceTime = formData.runnerTime && parseFloat(formData.runnerTime) > 0
    ? parseFloat(formData.runnerTime)
    : simulationResults.predictedTime;

  const comparisonReports = similarAthletes.length > 0
    ? buildComparisonReports(currentConditions, similarAthletes, comparisonReferenceTime)
    : [];

  const percentileRanking = calculatePercentile(
    simulationResults.predictedTime,
    allAthletes,
    formData.eventDistance
  );

  let runnerComparisonAdvice = [];
  if (formData.runnerTime && parseFloat(formData.runnerTime) > 0) {
    const runnerGender = formData.runnerGender || "male";
    const matchingRunners = findSimilarRunnersByGenderAndTime(
      parseFloat(formData.runnerTime),
      runnerGender,
      allAthletes,
      formData.eventDistance
    );

    if (matchingRunners.length > 0) {
      runnerComparisonAdvice = generateRunnerComparisonAdvice(
        parseFloat(formData.runnerTime),
        matchingRunners,
        currentConditions
      );
    }
  }

  return {
    comparisonReports,
    percentileRanking,
    runnerComparisonAdvice,
  };
};
