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

import { getStaticAthletes } from "./data/athleteData";
import { runSimulation } from "./modules/SimulationEngine";
import {
  loadCustomAthletes, loadRecentSimulations,
  saveCustomAthletes, saveRecentSimulations,
  athleteAlreadyExists, removeCustomAthlete,
  buildSimulationEntry,
} from "./modules/DataStorageModule";

import HomePage          from "./pages/HomePage";
import RunnerInputPage   from "./pages/RunnerInputPage";
import ResultsOutputPage from "./pages/ResultsOutputPage";
import DatabasePage      from "./pages/DatabasePage";
import DocumentationPage from "./pages/DocumentationPage";
import AboutPage         from "./pages/AboutPage";
import { NavBar }        from "./pages/HomePage";

const Toast = ({ toast }) => !toast ? null : (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-semibold text-sm
    ${toast.type==="success"?"bg-green-600":toast.type==="info"?"bg-blue-600":"bg-red-600"}`}>
    {toast.type==="success" ? <UserPlus size={20}/> : <Database size={20}/>}
    {toast.message}
  </div>
);

const RunPredictApp = () => {

  const [currentPage,       setCurrentPage]      = useState("dashboard");
  const [simulationResults, setSimulationResults] = useState(null);
  const [customAthletes,    setCustomAthletes]   = useState([]);
  const [recentSimulations, setRecentSimulations] = useState([]);
  const [toast,             setToast]            = useState(null);
  const [docsTab,           setDocsTab]          = useState("guide");
  const [mobileMenuOpen,    setMobileMenuOpen]   = useState(false);

  const [formData, setFormData] = useState({
    athleteName: "", eventDistance: "100", trackCondition: "optimal",
    tailwind: "0", altitude: "0", humidity: "50",
    temperature: "20", vo2max: "60",
  });
  const [touched,         setTouched]         = useState({ athleteName: false });
  const [dropdownOpen,    setDropdownOpen]    = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [selectedGender,  setSelectedGender]  = useState("male");

useEffect(() => {
  const load = async () => {
    setCustomAthletes(await loadCustomAthletes());
    setRecentSimulations(await loadRecentSimulations());
  };
  load();
}, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const allAthletes = [...getStaticAthletes(), ...customAthletes];

  const handleCalculate = () => {
    if (!selectedAthlete) return;
    const wasAdded = !athleteAlreadyExists(allAthletes, formData.athleteName.trim(), formData.eventDistance);
    if (wasAdded) {
      const newAthlete = {
        name:             formData.athleteName.trim(),
        country:          "Unknown",
        event:            formData.eventDistance,
        raceTime:         selectedAthlete.raceTime,
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
        achievements:     [`Added on ${new Date().toLocaleDateString()}`],
        addedDate:        new Date().toLocaleDateString(),
      };
      setCustomAthletes(prev => [...prev, newAthlete]);
      showToast(`✅ ${formData.athleteName} added to the ${formData.eventDistance}m database!`);
    }
    const results = runSimulation(formData, selectedAthlete, wasAdded);
    setSimulationResults(results);
    const entry = buildSimulationEntry(formData, results.predictedTime, wasAdded);
    setRecentSimulations(prev => [entry, ...prev].slice(0, 5));
  };

  const handleRemove = (name, event) => {
    setCustomAthletes(prev => removeCustomAthlete(prev, name, event));
    showToast(`${name} removed.`, "info");
  };

  const BoundToast = () => <Toast toast={toast}/>;
  const navProps   = { setCurrentPage, mobileMenuOpen, setMobileMenuOpen };

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
              <div className="lg:col-span-2">
                <RunnerInputPage
                  allAthletes={allAthletes}
                  formData={formData}           setFormData={setFormData}
                  selectedAthlete={selectedAthlete} setSelectedAthlete={setSelectedAthlete}
                  touched={touched}             setTouched={setTouched}
                  dropdownOpen={dropdownOpen}   setDropdownOpen={setDropdownOpen}
                  onSubmit={handleCalculate}
                />
              </div>
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