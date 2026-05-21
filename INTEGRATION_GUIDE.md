# Integration Guide: Environment Detection & Historical Comparison

This guide shows **exactly how** to integrate the new environmental detection and historical comparison features into your existing `RunPredictApp.jsx`.

---

## 📋 Files Created

These files have been created in your project:

1. **`src/modules/EnvironmentDetectionModule.js`** - Fetches weather & location data from APIs
2. **`src/modules/HistoricalComparisonModule.js`** - Finds and analyzes similar historical runs
3. **`src/pages/LocationInputPage.jsx`** - Component for location/time input
4. **`src/pages/HistoricalComparisonPage.jsx`** - Component for displaying comparison results
5. **`SETUP_ENVIRONMENT_DETECTION.md`** - Detailed setup guide
6. **`.env.example`** - Template for environment variables

---

## 🔧 Integration Steps

### Step 1: Create `.env` File

Copy `.env.example` to `.env` and optionally add your Google Maps API key:

```bash
# In your project root
cp .env.example .env
```

**`.env` content:**
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSy... (your key from Google Cloud Console)
```

> **Note:** Open-Meteo (weather API) requires no setup—it's completely free and doesn't need an API key!

---

### Step 2: Update `RunPredictApp.jsx`

Add these imports at the top of the file:

```jsx
// Add these imports with existing imports
import LocationInputPage from "./pages/LocationInputPage";
import HistoricalComparisonPage from "./pages/HistoricalComparisonPage";
import { detectEnvironment } from "./modules/EnvironmentDetectionModule";
import { findSimilarRuns, buildComparisonReports, calculatePercentile } from "./modules/HistoricalComparisonModule";
```

---

### Step 3: Add State Variables

In the `RunPredictApp` component, add these state variables with your other state declarations:

```jsx
// Add with existing state declarations
const [currentEnvironment, setCurrentEnvironment] = useState(null);
const [comparisonReports, setComparisonReports] = useState(null);
const [percentileRanking, setPercentileRanking] = useState(null);
```

---

### Step 4: Update Page Navigation

In your page rendering logic (around where `HomePage`, `RunnerInputPage`, etc. are rendered), add:

**Before the switch statement or conditional rendering:**

```jsx
// Location Input Page (NEW)
if (currentPage === "location-input") {
  return (
    <div className={darkMode ? "bg-black" : "bg-white"}>
      <NavBar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        mobileMenuOpen={mobileMenuOpen}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <LocationInputPage
        formData={formData}
        setFormData={setFormData}
        darkMode={darkMode}
        onEnvironmentDetected={(data) => {
          setCurrentEnvironment(data);
          // Auto-populate fields from detected environment
          setFormData(prev => ({
            ...prev,
            ...data.environment.conditions
          }));
          setCurrentPage("runner-input");
        }}
        onSkip={() => {
          // Skip environment detection, go straight to runner input
          setCurrentPage("runner-input");
        }}
        loading={calculating}
      />
    </div>
  );
}

// Historical Comparison Page (NEW)
if (currentPage === "comparison") {
  return (
    <div className={darkMode ? "bg-black" : "bg-white"}>
      <NavBar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        mobileMenuOpen={mobileMenuOpen}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <HistoricalComparisonPage
        comparisonReports={comparisonReports}
        darkMode={darkMode}
      />
      <button
        onClick={() => setCurrentPage("dashboard")}
        className="fixed bottom-6 right-6 px-6 py-3 rounded-lg font-semibold bg-[#b19149] text-black hover:bg-[#d4a574] transition-all"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
```

---

### Step 5: Update Navigation Menu

Update your navigation (HomePage/NavBar) to include new options:

In the menu where you have links like "Dashboard", "Database", add:

```jsx
{
  id: "location-input",
  label: "🌍 Detect Environment",
  icon: MapPin,
  description: "Log location and detect environmental conditions"
}
```

---

### Step 6: Update Simulation Handler

When the user submits the form for simulation, update your `onSubmit` or simulation function to include historical comparison:

**Find your existing simulation function (probably called something like `handleCalculate` or `onSubmit`):**

```jsx
// Your existing simulation code...
const handleCalculate = async () => {
  setCalculating(true);
  try {
    // Run existing simulation
    const results = await runSimulation(formData, selectedAthlete, wasAdded);
    setSimulationResults(results);

    // ===== NEW: Find similar runs and generate comparison =====
    if (allAthletes.length > 0) {
      const similarAthletes = findSimilarRuns(
        allAthletes,
        {
          temperature: parseFloat(formData.temperature),
          humidity: parseFloat(formData.humidity),
          windSpeed: parseFloat(formData.tailwind),
          altitude: parseFloat(formData.altitude),
          trackCondition: formData.trackCondition,
        },
        formData.eventDistance,
        5 // Show top 5 similar runs
      );

      // Build detailed comparison reports
      if (similarAthletes.length > 0) {
        const reports = buildComparisonReports(
          {
            temperature: parseFloat(formData.temperature),
            humidity: parseFloat(formData.humidity),
            windSpeed: parseFloat(formData.tailwind),
            altitude: parseFloat(formData.altitude),
            trackCondition: formData.trackCondition,
          },
          similarAthletes,
          results.predictedTime
        );
        setComparisonReports(reports);

        // Calculate percentile ranking
        const percentile = calculatePercentile(
          results.predictedTime,
          allAthletes,
          formData.eventDistance
        );
        setPercentileRanking(percentile);
      }

      // Navigate to results page
      setCurrentPage("results-output");
      showToast("✓ Simulation complete! Check comparison below.", "success");
    }
  } catch (error) {
    showToast(`Error: ${error.message}`, "error");
  } finally {
    setCalculating(false);
  }
};
```

---

### Step 7: Update Results Output Page

In your `ResultsOutputPage.jsx`, add a button to view comparisons:

```jsx
// In the ResultsOutputPage component, add a button in the action bar:
<button
  onClick={() => setCurrentPage("comparison")}
  className="px-6 py-3 rounded-lg font-semibold bg-[#b19149] text-black hover:bg-[#d4a574] transition-all flex items-center gap-2"
>
  📊 View Historical Comparison
</button>

// Also display percentile if available
{percentileRanking && (
  <div className="p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
    <p className="font-semibold">Your Percentile Ranking</p>
    <p className="text-lg font-bold">{percentileRanking.message}</p>
  </div>
)}
```

---

## 📱 User Flow Examples

### Flow 1: With Environment Detection

```
1. User starts app
2. Clicks "🌍 Detect Environment" in menu
3. LocationInputPage opens with 3 options:
   - 📍 Current GPS Location
   - 🗺️ Manual Coordinates (lat/lon)
   - 🏢 Indoor Facility
4. User chooses one → System fetches data
5. Weather, elevation, location type auto-detected
6. Date/time of run entered
7. Proceeds to RunnerInputPage
8. Form fields pre-filled with detected data
9. User selects athlete and runs simulation
10. Results + Historical Comparison shown
```

### Flow 2: Without Environment Detection (Existing)

```
1. User starts app
2. Goes to Dashboard (skip environment detection)
3. Fills in form manually
4. Selects athlete
5. Clicks Calculate
6. Results + Historical Comparison shown
```

---

## 🎯 Key Features to Highlight

### Environmental Detection
- **Automatic elevation** from Google Maps
- **Real-time weather** from Open-Meteo
- **Indoor/outdoor detection** from location address
- **Wind direction calculation** based on run direction
- **Track condition inference** from weather

### Historical Comparison
- **Similarity scoring** (0-100%) based on conditions
- **Top 5 similar runs** ranked by match quality
- **Performance advice** - what's helping/hurting
- **Percentile ranking** - where you rank among all athletes
- **Condition breakdown** - temperature, humidity, wind, altitude

### Indoor/Outdoor Handling
- **Indoor**: Wind = 0, altitude normalized, climate controlled
- **Outdoor**: Full environmental factors
- **Caching**: Indoor facilities cached in localStorage
- **Surface detection**: Track vs treadmill vs road

---

## 🔗 Component Relationships

```
RunPredictApp (main orchestrator)
├── LocationInputPage (NEW)
│   └── Uses: EnvironmentDetectionModule
│       ├── getUserLocation()
│       ├── detectEnvironment()
│       ├── getWeatherConditions()
│       └── getElevationAndLocation()
│
├── RunnerInputPage (EXISTING - now with pre-filled data)
│   └── Uses: formData (auto-populated from environment)
│
├── ResultsOutputPage (EXISTING - enhanced)
│   └── Shows: simulationResults + comparisonReports
│
└── HistoricalComparisonPage (NEW)
    └── Uses: HistoricalComparisonModule
        ├── findSimilarRuns()
        ├── buildComparisonReports()
        ├── calculatePercentile()
        └── getPerformanceAdvice()
```

---

## ⚙️ Configuration

### Google Maps API (Optional)
- Get key from [Google Cloud Console](https://console.cloud.google.com/)
- Enable: Elevation API, Geocoding API
- Add to `.env`: `VITE_GOOGLE_MAPS_API_KEY=...`
- Free: 25,000 requests/month per API

### Open-Meteo Weather (Free, No Setup!)
- No API key needed
- Free: 10,000 requests/day
- Provides: temperature, humidity, wind speed, weather code

---

## 🚀 Testing Checklist

- [ ] Environment detection works with GPS
- [ ] Manual coordinate entry works
- [ ] Indoor facility detection works
- [ ] Weather API returns data
- [ ] Elevation API returns data (if Google key provided)
- [ ] Similar runs are found and ranked
- [ ] Comparison reports display correctly
- [ ] Percentile ranking calculates correctly
- [ ] Indoor locations cache properly
- [ ] App still works without Google API key
- [ ] Form fields pre-fill with detected data
- [ ] Navigation between pages works smoothly

---

## 🐛 Troubleshooting

### "Cannot find module 'EnvironmentDetectionModule'"
- Verify files are in `src/modules/`
- Check import paths match file names

### "VITE_GOOGLE_MAPS_API_KEY is undefined"
- Create `.env` file in project root
- Add: `VITE_GOOGLE_MAPS_API_KEY=your_key`
- Restart dev server: `npm run dev`

### "Weather API returns no data"
- Check network connection
- API endpoint might be down (rare)
- Try manual entry instead

### "Comparison not showing"
- Verify `allAthletes` is populated
- Check console for errors
- Similar runs might not meet threshold

---

## 📊 Data Structure Reference

### Environment Object
```javascript
{
  location: {
    latitude: 51.5074,
    longitude: -0.1278,
    address: "London, UK",
    elevation: 11,
    locationType: "outdoor",
    isTrackVenue: false
  },
  weather: {
    temperature: 18.5,
    humidity: 65,
    windSpeed: 2.3,
    windDirection: 180,
    tailwind: 1.2,
    weatherDescription: "Partly cloudy"
  },
  conditions: {
    trackCondition: "good",
    altitude: 11,
    temperature: 18.5,
    humidity: 65,
    tailwind: 1.2
  }
}
```

### Comparison Report
```javascript
{
  rank: 1,
  similarityPercentage: 92,
  comparison: {
    name: "Usain Bolt",
    theirTime: "9.58s",
    yourPredictedTime: "9.72s",
    timeDifference: "+0.14s"
  },
  advice: ["Favorable wind conditions"],
  challenges: ["Slightly warmer than reference"],
  recommendation: "Push for PB!"
}
```

---

## 📝 Example Usage

See `SETUP_ENVIRONMENT_DETECTION.md` for complete examples and API documentation.

---

**You're all set!** Your app now has comprehensive environmental detection and historical performance comparison. 🎉
