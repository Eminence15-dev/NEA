// ================================================================
// MODULE 8: Error Handling / Validation Module
//
// Pure validation logic — returns strings and booleans only.
// No React components here; UI rendering is handled in
// RunnerInputPage (Module 2).
//
// Covers:
//   - Athlete name validation
//   - Gender mismatch detection against DB
//   - Personal best range validation per event
//   - Environmental condition warnings (non-blocking)
//   - Athlete lookup helpers (exact match, close match, dropdown)
// ================================================================

import { PB_RANGES } from "../data/athleteData";

// ── Form Validation ───────────────────────────────────────────────

/**
 * Validates the athlete name field.
 * Returns an error string, or "" if valid.
 */
export const getNameError = (athleteName, dbMatch, closeMatch) => {
  if (!athleteName.trim())           return "Athlete name is required";
  if (athleteName.trim().length < 2) return "Name must be at least 2 characters";
  if (closeMatch && !dbMatch)
    return `Did you mean "${closeMatch.name}"? Select from the dropdown or check spelling.`;
  return "";
};

/**
 * Validates gender against the DB entry (official athletes only).
 * Returns an error string, or "" if valid.
 */
export const getGenderError = (dbMatch, athleteGender) => {
  if (dbMatch && !dbMatch.custom && athleteGender !== dbMatch.gender)
    return `${dbMatch.name} is listed as ${dbMatch.gender} in the ${dbMatch.event}m database.`;
  return "";
};

/**
 * Validates the personal best against the legal range for the event.
 * Returns an error string, or "" if valid.
 */
export const getPBError = (personalBest, eventDistance) => {
  if (!personalBest)         return "Personal best is required";
  const pb    = parseFloat(personalBest);
  if (isNaN(pb))             return "Must be a valid number";
  const range = PB_RANGES[eventDistance];
  if (pb < range.min)        return `Too fast — min is ${range.min}s`;
  if (pb > range.max)        return `Too slow — max is ${range.max}s`;
  return "";
};

/**
 * Returns true if all validation errors are empty.
 */
export const isFormValid = (nameError, genderError, pbError) =>
  !nameError && !genderError && !pbError;

// ── Border Style Helper ───────────────────────────────────────────

/**
 * Returns the correct Tailwind border class for a field
 * based on its touched/error/value state.
 * Used directly in RunnerInputPage JSX.
 */
export const getFieldBorderClass = (isTouched, error, value) => {
  if (!isTouched)  return "border-gray-200 focus:border-purple-500";
  if (error)       return "border-red-400 bg-red-50 focus:border-red-500";
  if (value)       return "border-green-400 bg-green-50 focus:border-green-500";
  return "border-gray-200 focus:border-purple-500";
};

// ── Environmental Warnings (non-blocking) ────────────────────────

/**
 * Returns an array of warning messages based on current conditions.
 * These are informational — they do not prevent form submission.
 */
export const getEnvironmentalWarnings = (formData) => {
  const warnings = [];
  const wind     = parseFloat(formData.tailwind);
  const temp     = parseFloat(formData.temperature);
  const humidity = parseFloat(formData.humidity);
  const altitude = parseFloat(formData.altitude);

  if (wind > 2.0)      warnings.push(`Wind ${wind} m/s exceeds the +2.0 m/s legal limit.`);
  if (wind < -2.0)     warnings.push(`Headwind ${Math.abs(wind)} m/s — significant performance impact.`);
  if (temp > 35)       warnings.push(`${temp}°C is very hot — risk of heat stress.`);
  if (temp < 5)        warnings.push(`${temp}°C is very cold — muscles may underperform.`);
  if (humidity > 85)   warnings.push(`${humidity}% humidity is high.`);
  if (altitude > 2000) warnings.push(`${altitude}m — high altitude conditions.`);

  return warnings;
};

// ── Athlete Lookup Helpers ────────────────────────────────────────

/**
 * Finds an exact athlete match by name + event.
 * Used to detect DB matches, pre-fill gender/PB, and show the match badge.
 */
export const findDbMatch = (allAthletes, athleteName, eventDistance) =>
  allAthletes.find(
    a => a.name.toLowerCase() === athleteName.trim().toLowerCase()
      && a.event === eventDistance
  ) || null;

/**
 * Finds a close (fuzzy) match within the same event.
 * Triggers the "Did you mean?" spelling suggestion.
 */
export const findCloseMatch = (allAthletes, athleteName, eventDistance, dbMatch) => {
  if (dbMatch || athleteName.trim().length < 3) return null;
  return allAthletes
    .filter(a => a.event === eventDistance)
    .find(a =>
      a.name.toLowerCase().includes(athleteName.trim().toLowerCase()) ||
      athleteName.trim().toLowerCase().includes(a.name.toLowerCase().split(" ")[1] || "")
    ) || null;
};

/**
 * Filters dropdown suggestions by name + event.
 * Shows all event athletes when the field is empty.
 */
export const getDropdownSuggestions = (allAthletes, athleteName, eventDistance) =>
  athleteName.trim().length >= 1
    ? allAthletes.filter(a =>
        a.event === eventDistance &&
        a.name.toLowerCase().includes(athleteName.trim().toLowerCase())
      )
    : allAthletes.filter(a => a.event === eventDistance);