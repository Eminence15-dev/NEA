// ================================================================
// RunPredictApp.jsx — Main Orchestrator
//
// Wires together all 9 modules. Holds all shared state at the
// top level and passes props down to each page component.
//
// Module map:
//   Module 1  — HomePage          (pages/HomePage.jsx)
//   Module 2  — RunnerInputPage   (pages/RunnerInputPage.jsx)
//   Module 3  — SimulationEngine  (modules/SimulationEngine.js)
//   Module 4  — DataStorageModule (modules/DataStorageModule.js)
//   Module 5  — ResultsOutputPage (pages/ResultsOutputPage.jsx)
//   Module 6  — GraphVisualization(components/GraphVisualizationModule.jsx)
//   Module 8  — ErrorHandling     (modules/ErrorHandlingModule.js)
//   Module 9  — DocumentationPage (pages/DocumentationPage.jsx)
//   About     — AboutPage         (pages/AboutPage.jsx)
//   Data      — athleteData.js    (data/athleteData.js)
// ================================================================

import { useState, useEffect } from "react";
import { UserPlus, Database } from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────
import { STORAGE_KEYS, PB_RANGES } from "./data/athleteData";

// ── Module 3: Simulation Engine ───────────────────────────────────
import { runSimulation } from "./modules/SimulationEngine";

// ── Module 4: Data Storage Module ────────────────────────────────
import {
  loadCustomAthletes, loadRecentSimulations,
  saveCustomAthletes, saveRecentSimulations,
  loadStaticAthletes,
  athleteAlreadyExists,
  removeCustomAthlete, buildSimulationEntry,
} from "./modules/DataStorageModule";

// ── Pages ─────────────────────────────────────────────────────────
import HomePage          from "./pages/HomePage";
import RunnerInputPage   from "./pages/RunnerInputPage";
import ResultsOutputPage from "./pages/ResultsOutputPage";
import DatabasePage      from "./pages/DatabasePage";
import DocumentationPage from "./pages/DocumentationPage";
import AboutPage         from "./pages/AboutPage";
import { NavBar }        from "./pages/HomePage";

// ── Toast Notification Component ─────────────────────────────────
const Toast = ({ toast }) => !toast ? null : (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-semibold text-sm
    ${toast.type==="success"?"bg-green-600":toast.type==="info"?"bg-blue-600":"bg-red-600"}`}>
    {toast.type==="success" ? <UserPlus size={20}/> : <Database size={20}/>}
    {toast.message}
  </div>
);

// ════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════
const RunPredictApp = () => {

  // ── Shared State ─────────────────────────────────────────────────
  const [currentPage,       setCurrentPage]       = useState("dashboard");
  const [simulationResults, setSimulationResults] = useState(null);
  const [customAthletes,    setCustomAthletes]    = useState([]);
  const [staticAthletes,    setStaticAthletes]    = useState([]);
  const [recentSimulations, setRecentSimulations] = useState([]);
  const [toast,             setToast]             = useState(null);
  const [docsTab,           setDocsTab]           = useState("guide");
  const [mobileMenuOpen,    setMobileMenuOpen]    = useState(false);
  const [loadingAthletes,   setLoadingAthletes]   = useState(true);
  const [calculating,       setCalculating]       = useState(false);

  // Module 2 (RunnerInputPage) form state
  const [formData, setFormData] = useState({
    athleteName: "", eventDistance: "100", trackCondition: "optimal",
    tailwind: "0", fitnessLevel: "85", altitude: "0",
    humidity: "50", temperature: "20", vo2max: "60",
  });
  const [touched,         setTouched]         = useState({ athleteName: false });
  const [dropdownOpen,    setDropdownOpen]     = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  // Database page state
  const [searchTerm,     setSearchTerm]     = useState("");
  const [selectedGender, setSelectedGender] = useState("male");

  // ── Module 4: Load from Firestore on mount ────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingAthletes(true);
      const [athletes, custom, sims] = await Promise.all([
        loadStaticAthletes(),
        loadCustomAthletes(),
        loadRecentSimulations(),
      ]);
      setStaticAthletes(athletes);
      setCustomAthletes(custom);
      setRecentSimulations(sims);
      setLoadingAthletes(false);
    };
    load();
  }, []);

  // ── Module 4: Persist whenever state changes ──────────────────────
  useEffect(() => { saveCustomAthletes(customAthletes); },       [customAthletes]);
  useEffect(() => { saveRecentSimulations(recentSimulations); }, [recentSimulations]);

  // ── Toast helper ──────────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── All athletes (Firestore static + custom) ─────────────────────
  const allAthletes = [...staticAthletes, ...customAthletes];

  // Show loading screen while athletes are being fetched
  if (loadingAthletes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏃</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">RunPredict</h2>
          <p className="text-gray-500">Loading athletes from database...</p>
        </div>
      </div>
    );
  }

  // ── Module 3 + 4: Run simulation ─────────────────────────────────
  const handleCalculate = async () => {
    if (!selectedAthlete) return;
    setCalculating(true);

    try {
      const wasAdded = !athleteAlreadyExists(allAthletes, formData.athleteName.trim(), formData.eventDistance);
      if (wasAdded) {
        const newAthlete = {
          name:             formData.athleteName.trim(),
          country:          "Unknown",
          event:            formData.eventDistance,
          raceTime:         selectedAthlete ? selectedAthlete.raceTime : 10.0,
          wind:             parseFloat(formData.tailwind),
          altitude:         parseFloat(formData.altitude),
          temperature:      parseFloat(formData.temperature),
          humidity:         parseFloat(formData.humidity),
          venue:            "Unknown",
          city:             "Unknown",
          countryOfVenue:   "Unknown",
          weatherCondition: "Unknown",
          year:             new Date().getFullYear(),
          status:           "Custom",
          custom:           true,
          achievements:     [`Added automatically on ${new Date().toLocaleDateString()}`],
          addedDate:        new Date().toLocaleDateString(),
        };
        setCustomAthletes(prev => [...prev, newAthlete]);
        showToast(`✅ ${formData.athleteName} added to the ${formData.eventDistance}m database!`, "success");
      }

      // await required — runSimulation is now async (XGBoost lookup)
      const results = await runSimulation(formData, selectedAthlete, wasAdded);
      setSimulationResults(results);

      const entry = buildSimulationEntry(formData, results.predictedTime, wasAdded);
      setRecentSimulations(prev => [entry, ...prev].slice(0, 5));
    } catch (err) {
      console.error("Simulation error:", err);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setCalculating(false);
    }
  };

  // ── Module 4: Remove custom athlete ──────────────────────────────
  const handleRemove = (name, event) => {
    setCustomAthletes(prev => removeCustomAthlete(prev, name, event));
    showToast(`${name} removed from database.`, "info");
  };

  // ── Toast component bound to current toast state ──────────────────
  const BoundToast = () => <Toast toast={toast}/>;

  // ── Page Router ───────────────────────────────────────────────────
  const navProps = { setCurrentPage, mobileMenuOpen, setMobileMenuOpen };

  switch (currentPage) {

    case "dashboard":
      return <HomePage {...navProps} customAthletes={customAthletes} recentSimulations={recentSimulations} Toast={BoundToast}/>;

    case "simulation":
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-5">
          <BoundToast/>
          <div className="max-w-7xl mx-auto">
            <NavBar page="simulation" {...navProps} customAthleteCount={customAthletes.length}/>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Module 2: Runner Input Page */}
              <div className="lg:col-span-2">
                <RunnerInputPage
                  allAthletes={allAthletes}
                  formData={formData} setFormData={setFormData}
                  selectedAthlete={selectedAthlete} setSelectedAthlete={setSelectedAthlete}
                  touched={touched}   setTouched={setTouched}
                  dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen}
                  onSubmit={handleCalculate}
                  calculating={calculating}
                />
              </div>
              {/* Module 5: Results / Output Page */}
              <div className="lg:col-span-3">
                <ResultsOutputPage simulationResults={simulationResults} athleteName={formData.athleteName}/>
              </div>
            </div>
          </div>
        </div>
      );

    case "database":
      return (
        <DatabasePage
          {...navProps}
          searchTerm={searchTerm}         setSearchTerm={setSearchTerm}
          selectedGender={selectedGender} setSelectedGender={setSelectedGender}
          customAthletes={customAthletes}
          removeCustomAthlete={handleRemove}
          Toast={BoundToast}
        />
      );

    case "docs":
      return <DocumentationPage {...navProps} docsTab={docsTab} setDocsTab={setDocsTab} Toast={BoundToast}/>;

    case "about":
      return <AboutPage {...navProps} Toast={BoundToast}/>;

    default:
      return null;
  }
};

export default RunPredictApp;