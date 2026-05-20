// ================================================================
// RunPredictApp.jsx — Main Orchestrator
// ================================================================

import { useState, useEffect } from "react";
import { UserPlus, Database } from "lucide-react";

import { STORAGE_KEYS, PB_RANGES } from "./data/athleteData";
import { runSimulation } from "./modules/SimulationEngine";
import {
  loadCustomAthletes, loadRecentSimulations,
  saveCustomAthletes, saveRecentSimulations,
  loadStaticAthletes, athleteAlreadyExists,
  removeCustomAthlete, buildSimulationEntry,
} from "./modules/DataStorageModule";

import HomePage          from "./pages/HomePage";
import RunnerInputPage   from "./pages/RunnerInputPage";
import ResultsOutputPage from "./pages/ResultsOutputPage";
import DatabasePage      from "./pages/DatabasePage";
import DocumentationPage from "./pages/DocumentationPage";
import AboutPage         from "./pages/AboutPage";
import { NavBar }        from "./pages/HomePage";

// ── Toast ─────────────────────────────────────────────────────────
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

  // ── Dark mode ─────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("runpredict-theme");
    return saved ? saved === "dark" : true; // default to dark
  });

  useEffect(() => {
    localStorage.setItem("runpredict-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

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

  const [formData, setFormData] = useState({
    athleteName: "", eventDistance: "100", trackCondition: "optimal",
    tailwind: "0", fitnessLevel: "85", altitude: "0",
    humidity: "50", temperature: "20", vo2max: "60",
  });
  const [touched,         setTouched]         = useState({ athleteName: false });
  const [dropdownOpen,    setDropdownOpen]     = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [selectedGender,  setSelectedGender]  = useState("male");

  // ── Load from Firestore ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingAthletes(true);
      const [athletes, custom, sims] = await Promise.all([
        loadStaticAthletes(), loadCustomAthletes(), loadRecentSimulations(),
      ]);
      setStaticAthletes(athletes);
      setCustomAthletes(custom);
      setRecentSimulations(sims);
      setLoadingAthletes(false);
    };
    load();
  }, []);

  useEffect(() => { saveCustomAthletes(customAthletes); },       [customAthletes]);
  useEffect(() => { saveRecentSimulations(recentSimulations); }, [recentSimulations]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const allAthletes = [...staticAthletes, ...customAthletes];

  // ── Loading screen ────────────────────────────────────────────────
  if (loadingAthletes) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-[#1E2A3A]" : "bg-gray-50"}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🏃</div>
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-800"}`}>RunPredict</h2>
          <p className={darkMode ? "text-[#7A90B8]" : "text-gray-500"}>Loading athletes from database...</p>
        </div>
      </div>
    );
  }

  // ── Simulation ────────────────────────────────────────────────────
  const handleCalculate = async () => {
    if (!selectedAthlete) return;
    setCalculating(true);
    try {
      const wasAdded = !athleteAlreadyExists(allAthletes, formData.athleteName.trim(), formData.eventDistance);
      if (wasAdded) {
        const newAthlete = {
          name: formData.athleteName.trim(), country: "Unknown",
          event: formData.eventDistance, raceTime: selectedAthlete?.raceTime || 10.0,
          wind: parseFloat(formData.tailwind), altitude: parseFloat(formData.altitude),
          temperature: parseFloat(formData.temperature), humidity: parseFloat(formData.humidity),
          venue: "Unknown", city: "Unknown", countryOfVenue: "Unknown",
          weatherCondition: "Unknown", year: new Date().getFullYear(),
          status: "Custom", custom: true,
          achievements: [`Added automatically on ${new Date().toLocaleDateString()}`],
          addedDate: new Date().toLocaleDateString(),
        };
        setCustomAthletes(prev => [...prev, newAthlete]);
        showToast(`✅ ${formData.athleteName} added to the ${formData.eventDistance}m database!`, "success");
      }
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

  const handleRemove = (name, event) => {
    setCustomAthletes(prev => removeCustomAthlete(prev, name, event));
    showToast(`${name} removed from database.`, "info");
  };

  const handleClearSimulations = async () => {
    setRecentSimulations([]);
    await saveRecentSimulations([]);
    showToast("Simulations cleared.", "info");
  };

  const BoundToast = () => <Toast toast={toast}/>;
  const navProps = { setCurrentPage, mobileMenuOpen, setMobileMenuOpen, darkMode, toggleDarkMode };

  // ── Page Router ───────────────────────────────────────────────────
  const pageWrap = (children) => (
    <div className={`min-h-screen p-5 ${darkMode ? "bg-[#1E2A3A]" : "bg-gray-100"}`}>
      <BoundToast/>
      <div className="max-w-7xl mx-auto">
        <NavBar page={currentPage} {...navProps} customAthleteCount={customAthletes.length}/>
        {children}
      </div>
    </div>
  );

  switch (currentPage) {

    case "dashboard":
      return <HomePage {...navProps} customAthletes={customAthletes} recentSimulations={recentSimulations} onClearSimulations={handleClearSimulations} Toast={BoundToast}/>;

    case "simulation":
      return pageWrap(
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <RunnerInputPage
              allAthletes={allAthletes} formData={formData} setFormData={setFormData}
              selectedAthlete={selectedAthlete} setSelectedAthlete={setSelectedAthlete}
              touched={touched} setTouched={setTouched}
              dropdownOpen={dropdownOpen} setDropdownOpen={setDropdownOpen}
              onSubmit={handleCalculate} calculating={calculating} darkMode={darkMode}
            />
          </div>
          <div className="lg:col-span-3">
            <ResultsOutputPage simulationResults={simulationResults} athleteName={formData.athleteName} darkMode={darkMode}/>
          </div>
        </div>
      );

    case "database":
      return pageWrap(
        <DatabasePage
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          selectedGender={selectedGender} setSelectedGender={setSelectedGender}
          customAthletes={customAthletes} removeCustomAthlete={handleRemove}
          Toast={BoundToast} darkMode={darkMode}
          setCurrentPage={setCurrentPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
        />
      );

    case "docs":
      return <DocumentationPage {...navProps} docsTab={docsTab} setDocsTab={setDocsTab} Toast={BoundToast} darkMode={darkMode}/>;

    case "about":
      return <AboutPage {...navProps} Toast={BoundToast} darkMode={darkMode}/>;

    default:
      return null;
  }
};

export default RunPredictApp;