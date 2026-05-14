// ================================================================
// MODULE 4: Data Storage Module
//
// Handles all persistent storage using Firebase Firestore.
//
// Three Firestore collections:
//   "athletes"           — all static athletes (fetched live)
//   "custom-athletes"    — user-added custom athletes
//
// Fetching athletes from Firestore means the dataset can be
// updated by re-running upload_to_firestore.py without
// needing to redeploy the app on Vercel.
//
// Fallback Strategy:
//   If Firestore is unavailable (e.g. no internet connection),
//   loadStaticAthletes() falls back to the local athleteData.js
//   dataset so the app remains functional offline.
//
// Recent Simulations:
//   Stored in session memory only — cleared on page refresh/close.
// ================================================================

import { db } from "../firebase";
import {
  collection, doc, setDoc, getDocs,
  deleteDoc
} from "firebase/firestore";
import { getStaticAthletes } from "../data/athleteData";

// ── Athletes (fetched live from Firestore) ────────────────────────

/**
 * Loads all static athletes from Firestore.
 * Falls back to local athleteData.js if Firestore is unavailable.
 */
export const loadStaticAthletes = async () => {
  try {
    const snapshot = await getDocs(collection(db, "athletes"));
    if (snapshot.docs.length > 0) {
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    // Firestore returned empty — fall back to local data
    console.warn("Firestore returned no athletes — using local fallback");
    return getStaticAthletes();
  } catch (_) {
    console.error("Failed to load athletes from Firestore — using local fallback");
    return getStaticAthletes();
  }
};

// ── Custom Athletes ───────────────────────────────────────────────

export const loadCustomAthletes = async () => {
  try {
    const snapshot = await getDocs(collection(db, "custom-athletes"));
    return snapshot.docs.map(doc => doc.data());
  } catch (_) { return []; }
};

export const saveCustomAthletes = async (athletes) => {
  try {
    // Clear existing custom athletes
    const existing = await getDocs(collection(db, "custom-athletes"));
    for (const d of existing.docs) await deleteDoc(d.reference);

    // Upload new list
    for (const athlete of athletes) {
      await setDoc(
        doc(db, "custom-athletes", `${athlete.name.replace(/ /g, "_")}-${athlete.event}`),
        athlete
      );
    }
  } catch (_) {}
};

// ── Recent Simulations (session-only) ────────────────────────────
// Stored in memory — cleared automatically on page refresh/close.

let _sessionSimulations = [];

export const loadRecentSimulations = async () => {
  return [..._sessionSimulations];
};

export const saveRecentSimulations = async (simulations) => {
  _sessionSimulations = simulations.slice(0, 5);
};

// ── Helpers ───────────────────────────────────────────────────────

export const athleteAlreadyExists = (allAthletes, name, event) =>
  allAthletes.some(
    a => a.name.toLowerCase() === name.toLowerCase() && a.event === event
  );

export const removeCustomAthlete = (athletes, name, event) =>
  athletes.filter(a => !(a.name === name && a.event === event));

export const buildSimulationEntry = (formData, predictedTime, wasCustom) => ({
  name:       formData.athleteName,
  pb:         formData.personalBest || "N/A",
  predicted:  predictedTime,
  date:       new Date().toLocaleDateString(),
  conditions: `${formData.trackCondition}, ${formData.temperature}°C`,
  event:      formData.eventDistance,
  custom:     wasCustom,
});