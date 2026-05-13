// ================================================================
// MODULE 3: Simulation Engine (Backend Module)
//
// Uses real recorded race times as the baseline instead of PB.
// The athlete's actual race time under actual conditions is the
// reference point. Adjusting conditions predicts how they would
// perform under different circumstances.
//
// Formula:
//   Predicted = raceTime × (newConditionMultipliers / originalConditionMultipliers)
//
// This normalises against the original race conditions so the
// prediction reflects only the CHANGE in conditions, not an
// absolute value from scratch.
//
// Improvements:
//   - IAAF-standard wind correction (event-specific)
//   - Exponential air density model for altitude
//   - Bell-curve temperature model peaking at 26°C
//   - Humidity air density effect
// ================================================================

// ── Multiplier Constants ─────────────────────────────────────────
const TRACK_MULTIPLIERS = {
  optimal: 1.000,
  good:    1.002,
  fair:    1.005,
  poor:    1.010,
};

// ── Core Multiplier Calculation ───────────────────────────────────

/**
 * Calculates condition multipliers for a given set of conditions.
 * Each multiplier is centred around 1.0.
 * > 1.0 = slower,  < 1.0 = faster
 *
 * Wind:        IAAF-standard correction, event-specific coefficient
 * Altitude:    Exponential air density decay model
 * Temperature: Bell curve peaking at 26°C (sports science optimal)
 * Humidity:    Humid air is less dense, marginally aids sprinters
 */
const getMultipliers = (wind, temp, humidity, altitude, event) => {
  const w = parseFloat(wind);
  const t = parseFloat(temp);
  const h = parseFloat(humidity);
  const a = parseFloat(altitude);

  // IAAF wind correction — tailwind (positive) lowers time
  const windCoeff = String(event) === "100" ? 0.0805 : 0.0405;
  const windMult  = 1 - (w * windCoeff * 0.01);

  // Exponential air density decay — thinner air at altitude aids sprints
  const airDensity  = Math.exp(-a / 8500);
  const altitudeMult = 0.9 + (airDensity * 0.1);

  // Humid air is slightly less dense → marginally faster
  const humidityMult = 1 - (h * 0.00002);

  // Bell curve — optimal temp is 26°C, deviation in either direction slows
  const tempMult = 1 + Math.pow(t - 26, 2) * 0.00015;

  return { windMult, altitudeMult, humidityMult, tempMult };
};

/**
 * Calculates all multipliers from form data.
 * Exported so other modules can inspect individual factors.
 */
export const calculateMultipliers = (formData) => {
  const trackMult = TRACK_MULTIPLIERS[formData.trackCondition];
  const env       = getMultipliers(
    formData.tailwind, formData.temperature,
    formData.humidity, formData.altitude,
    formData.eventDistance
  );
  return { trackMult, ...env };
};

/**
 * Converts a multiplier to a % deviation string for display.
 * e.g. 1.002 → "+0.200",  0.999 → "-0.100"
 */
const toPercent = (m) => ((m - 1) * 100).toFixed(3);

/**
 * Runs the full simulation using real race time as baseline.
 *
 * The prediction normalises against the athlete's ORIGINAL race
 * conditions so we only model the change — not recalculate
 * from first principles.
 *
 * @param {Object}  formData  — simulator form inputs
 * @param {Object}  athlete   — selected athlete from database
 * @param {boolean} wasAdded  — whether athlete was auto-saved
 * @returns {Object} results object consumed by ResultsOutputPage
 */
export const runSimulation = (formData, athlete, wasAdded) => {
  const raceTime = parseFloat(athlete.raceTime);

  // Multipliers for the NEW (user-set) conditions
  const newMult = calculateMultipliers(formData);
  const newComposite = newMult.trackMult * newMult.windMult
                     * newMult.altitudeMult * newMult.humidityMult
                     * newMult.tempMult;

  // Multipliers for the ORIGINAL recorded race conditions
  const origEnv = getMultipliers(
    athlete.wind, athlete.temperature,
    athlete.humidity, athlete.altitude,
    athlete.event
  );
  const origComposite = origEnv.windMult * origEnv.altitudeMult
                      * origEnv.humidityMult * origEnv.tempMult;

  // Predicted = raceTime × (new / original) — only change matters
  const ratio           = newComposite / origComposite;
  const predictedTime   = raceTime * ratio;
  const optimisticTime  = predictedTime * 0.995;
  const pessimisticTime = predictedTime * 1.005;

  return {
    predictedTime:    predictedTime.toFixed(2),
    optimisticTime:   optimisticTime.toFixed(2),
    pessimisticTime:  pessimisticTime.toFixed(2),
    baselineTime:     raceTime.toFixed(2),
    improvement:      (raceTime - predictedTime).toFixed(2),
    isCustomAthlete:  wasAdded,
    event:            formData.eventDistance,
    windAssisted:     parseFloat(formData.tailwind) > 2.0,
    originalVenue:    `${athlete.venue}, ${athlete.city} (${athlete.year})`,
    originalConditions: {
      wind:        athlete.wind,
      temperature: athlete.temperature,
      humidity:    athlete.humidity,
      altitude:    athlete.altitude,
      weather:     athlete.weatherCondition,
    },

    // Data for Graph & Visualization Module (Module 6)
    chartData: [
      { name: "Recorded",    time: parseFloat(raceTime.toFixed(2)) },
      { name: "Optimistic",  time: parseFloat(optimisticTime.toFixed(2)) },
      { name: "Predicted",   time: parseFloat(predictedTime.toFixed(2)) },
      { name: "Pessimistic", time: parseFloat(pessimisticTime.toFixed(2)) },
    ],
    lineData: [
      { condition: "Recorded",  time: parseFloat(raceTime.toFixed(2)) },
      { condition: "Predicted", time: parseFloat(predictedTime.toFixed(2)) },
      { condition: "Goal",      time: parseFloat((raceTime - 0.1).toFixed(2)) },
    ],
    radarData: [
      { factor: "VO2 Max",  value: Math.min(parseFloat(formData.vo2max) * 1.2, 100) },
      { factor: "Track",    value: Math.max(0, Math.min(100, (2 - newMult.trackMult) * 100)) },
      { factor: "Weather",  value: Math.max(0, Math.min(100, (2 - (newMult.tempMult * newMult.windMult * newMult.humidityMult)) * 100)) },
      { factor: "Altitude", value: Math.max(0, Math.min(100, (2 - newMult.altitudeMult) * 100)) },
      { factor: "Wind",     value: Math.max(0, Math.min(100, (2 - newMult.windMult) * 100)) },
    ],
    factors: {
      track:       toPercent(newMult.trackMult),
      wind:        toPercent(newMult.windMult),
      altitude:    toPercent(newMult.altitudeMult),
      humidity:    toPercent(newMult.humidityMult),
      temperature: toPercent(newMult.tempMult),
      vo2:         toPercent(1 + (70 - parseFloat(formData.vo2max)) * 0.0005),
    },
  };
};