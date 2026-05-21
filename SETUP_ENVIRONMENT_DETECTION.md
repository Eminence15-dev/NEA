# Environmental Detection Setup Guide

This guide explains how to set up the new environmental detection and historical comparison features.

## Overview

Your running app now includes:
1. **Environment Detection** - Automatically fetches weather, elevation, and location data
2. **Historical Comparison** - Finds similar past runs and compares performance
3. **Indoor/Outdoor Detection** - Different handling for indoor vs outdoor runs

## API Requirements

### 1. Google Maps API (Optional but Recommended)

**What it does:** Provides elevation data and location address details

**Setup:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - **Elevation API**
   - **Geocoding API**
   
4. Create an API Key:
   - Go to Credentials → Create Credentials → API Key
   - Restrict the key to HTTP referrers (your website domain)
   - Copy the API Key

5. Add to your `.env` file:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

6. Update `vite.config.js` to expose the env:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     define: {
       'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.VITE_GOOGLE_MAPS_API_KEY)
     }
   })
   ```

**Cost:** Free tier: 25,000 requests/month for each API

**Note:** If you don't provide an API key, the app will fall back to default values but won't fetch real elevation or address data.

### 2. Open-Meteo Weather API (Free - No Key Required!)

**What it does:** Provides real-time weather data (temperature, humidity, wind speed)

**Setup:** Nothing needed! Open-Meteo is completely free and doesn't require authentication.

**Cost:** Completely free for up to 10,000 requests/day

**Limitations:** None for our use case!

---

## File Structure

```
src/
├── modules/
│   ├── EnvironmentDetectionModule.js      ← NEW: Fetches environment data
│   ├── HistoricalComparisonModule.js      ← NEW: Finds & compares similar runs
│   ├── SimulationEngine.js                ← UPDATED: Uses environment data
│   └── DataStorageModule.js
├── pages/
│   ├── LocationInputPage.jsx              ← NEW: Collects location/time
│   ├── HistoricalComparisonPage.jsx       ← NEW: Displays comparisons
│   ├── RunnerInputPage.jsx                ← EXISTING
│   └── ...
└── RunPredictApp.jsx                      ← UPDATED: Integrates new features
```

---

## How to Integrate

### Step 1: Update RunPredictApp.jsx

Add state for environment detection:

```jsx
const [currentEnvironment, setCurrentEnvironment] = useState(null);
const [comparisonReports, setComparisonReports] = useState(null);
const [showLocationInput, setShowLocationInput] = useState(false);
```

Add new route/page for location input:

```jsx
{currentPage === "location-input" && (
  <LocationInputPage
    formData={formData}
    setFormData={setFormData}
    darkMode={darkMode}
    onEnvironmentDetected={(data) => {
      setCurrentEnvironment(data);
      setCurrentPage("runner-input");
    }}
    onSkip={() => setCurrentPage("runner-input")}
  />
)}
```

Add route for historical comparison:

```jsx
{currentPage === "comparison" && (
  <HistoricalComparisonPage
    comparisonReports={comparisonReports}
    darkMode={darkMode}
  />
)}
```

### Step 2: Update Simulation Flow

In your form submission handler:

```jsx
const handleSimulation = async () => {
  // ... existing code ...

  // Import the comparison module
  import { findSimilarRuns, buildComparisonReports } from "./modules/HistoricalComparisonModule";

  // Find similar runs
  const similarAthletes = findSimilarRuns(
    allAthletes,
    formData, // currentEnvironment.conditions
    formData.eventDistance,
    5 // top 5 similar runs
  );

  // Build comparison reports
  const reports = buildComparisonReports(
    formData,
    similarAthletes,
    simulationResults.predictedTime
  );

  setComparisonReports(reports);
  setCurrentPage("comparison");
};
```

---

## Usage Flow

### Flow 1: Automatic Environmental Detection

1. User starts → Click "Detect Environment"
2. User selects location method:
   - **Current GPS** → Automatic geolocation (requires permission)
   - **Manual Coordinates** → Enter lat/lon
   - **Indoor Facility** → Enter facility name
3. System automatically fetches:
   - Weather (temperature, humidity, wind)
   - Elevation
   - Location type (indoor/outdoor)
4. User confirms date/time of run
5. Form fields auto-populate with detected data
6. Simulation runs with real environmental data
7. Comparison shows similar historical runs

### Flow 2: Manual Entry (Existing Behavior)

- User can still manually enter all values
- Environmental detection is optional
- Falls back to defaults if skipped

---

## Indoor vs Outdoor Handling

### Outdoor Runs
- Wind speed affects prediction (can be tailwind or headwind)
- Altitude affects air density
- Weather conditions fully considered

### Indoor Runs
- Wind speed set to 0 (no wind indoors)
- Altitude normalized (climate controlled)
- Humidity slightly elevated
- Track condition assumed optimal
- Cached separately for reuse

**Cache Storage:**
```javascript
// Automatically cached in localStorage under "indoor-locations"
{
  "Nike Indoor Track": {
    type: "indoor",
    multipliers: { windMult: 1.0, altitudeMult: 1.0, ... }
  }
}
```

---

## Environment Detection Logic

### Location Detection

**Outdoor indicators:**
- Track venues (stadium, grounds, athletic field)
- Roads and open areas
- Parks

**Indoor indicators:**
- Mall, arena, gym, building, hall, center
- Keyword matching on address

### Weather Classification

```javascript
Weather Code → Performance Impact

Clear/Partly Cloudy → Optimal
Cloudy/Rainy → Fair
Heavy Rain/Snow → Poor
Extreme Temp → Poor
```

### Track Condition Inference

```javascript
"optimal"  → Clear sky, 15-26°C, 40-60% humidity
"good"     → Cloudy, slight rain, 10-30°C
"fair"     → Moderate rain, 30-35°C
"poor"     → Heavy rain/snow, <5°C or >35°C
```

---

## API Limits & Considerations

### Google Maps
- **Elevation API:** 25,000 requests/month free
- **Geocoding API:** 25,000 requests/month free
- Cache results in localStorage to minimize requests

### Open-Meteo
- **10,000 requests/day free**
- No rate limiting within free tier
- No API key needed
- Public API (no sensitive data exposure)

---

## Troubleshooting

### "Geolocation failed"
- User didn't grant permission
- Solution: Use manual coordinates or indoor entry

### "Google Maps API not found"
- API key not in `.env`
- Solution: Add `VITE_GOOGLE_MAPS_API_KEY` to `.env`
- Fallback: Uses default elevation (0m)

### "Weather API timed out"
- Network issue
- Solution: Retry or use manual entry

### "Can't detect indoor/outdoor"
- Address doesn't match keywords
- Solution: User can manually specify in facility name

---

## Best Practices

1. **Cache Results:** Store API responses in localStorage
2. **Error Handling:** Gracefully degrade if APIs fail
3. **Rate Limiting:** Consider caching for same location within 1 hour
4. **Privacy:** Only request location when user initiates
5. **Fallbacks:** All features work without APIs (with defaults)

---

## Example: Complete Integration

```jsx
import { detectEnvironment } from "./modules/EnvironmentDetectionModule";
import { findSimilarRuns, buildComparisonReports } from "./modules/HistoricalComparisonModule";

// User clicks "Detect Environment"
const handleDetectEnvironment = async () => {
  const env = await detectEnvironment(lat, lon, runDirection);
  
  // Pre-fill form
  setFormData(prev => ({
    ...prev,
    temperature: env.weather.temperature,
    humidity: env.weather.humidity,
    tailwind: env.weather.tailwind,
    altitude: env.location.elevation,
  }));
};

// Run simulation with environment data
const handleSimulation = async () => {
  const results = await runSimulation(formData, selectedAthlete);
  
  // Find similar runs
  const similar = findSimilarRuns(allAthletes, formData, eventDistance, 5);
  
  // Show comparison
  const reports = buildComparisonReports(formData, similar, results.predictedTime);
  setComparisonReports(reports);
  setCurrentPage("comparison");
};
```

---

## Next Steps

1. ✅ Add files to src/modules/ and src/pages/
2. ✅ Get Google Maps API key (optional)
3. ✅ Add `VITE_GOOGLE_MAPS_API_KEY` to `.env`
4. ✅ Update RunPredictApp.jsx to integrate new pages
5. ✅ Test location detection flow
6. ✅ Test comparison reporting
7. ✅ Deploy with environmental features!

---

For questions or issues, check the API documentation:
- [Google Maps Elevation API](https://developers.google.com/maps/documentation/elevation)
- [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Open-Meteo Weather API](https://open-meteo.com/)
