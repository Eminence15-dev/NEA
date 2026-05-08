import { db } from "../firebase";
import {
  collection, doc, setDoc,
  getDocs, deleteDoc
} from "firebase/firestore";

// ── Load ─────────────────────────────────────────────────────────

export const loadCustomAthletes = async () => {
  try {
    const snapshot = await getDocs(collection(db, "custom-athletes"));
    return snapshot.docs.map(doc => doc.data());
  } catch (_) { return []; }
};

export const loadRecentSimulations = async () => {
  try {
    const snapshot = await getDocs(collection(db, "recent-simulations"));
    return snapshot.docs.map(doc => doc.data());
  } catch (_) { return []; }
};

// ── Save ─────────────────────────────────────────────────────────

export const saveCustomAthletes = async (athletes) => {
  try {
    for (const athlete of athletes) {
      await setDoc(
        doc(db, "custom-athletes", `${athlete.name}-${athlete.event}`),
        athlete
      );
    }
  } catch (_) {}
};

export const saveRecentSimulations = async (simulations) => {
  try {
    for (let i = 0; i < simulations.length; i++) {
      await setDoc(
        doc(db, "recent-simulations", `sim-${i}`),
        simulations[i]
      );
    }
  } catch (_) {}
};

// ── Helpers (keep these — used by RunPredictApp.jsx) ─────────────

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