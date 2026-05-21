// ================================================================
// LocationInputPage.jsx
// User logs in location, time, and place details
// Automatically fetches environmental data
// ================================================================

import { useState } from "react";
import { MapPin, Clock, Wind, Droplets, Thermometer, AlertCircle, Loader } from "lucide-react";
import { getUserLocation, detectEnvironment } from "../modules/EnvironmentDetectionModule";

const LocationInputPage = ({
  formData, setFormData, darkMode, onEnvironmentDetected, onSkip, loading = false
}) => {
  const dm = darkMode;
  const [locationMode, setLocationMode] = useState("current"); // "current", "manual", "indoor"
  const [locationLoading, setLocationLoading] = useState(false);
  const [detectedEnv, setDetectedEnv] = useState(null);
  const [errors, setErrors] = useState({});
  const [manualLocation, setManualLocation] = useState({
    latitude: "",
    longitude: "",
    address: "",
  });
  const [indoorDetails, setIndoorDetails] = useState({
    facility: "",
    surfaceType: "track", // track, treadmill, road
  });
  const [runDetails, setRunDetails] = useState({
    raceTime: formData.raceTime || "",
    raceDate: new Date().toISOString().split("T")[0],
    raceTime: new Date().toTimeString().slice(0, 5),
  });

  const card = dm ? "bg-[#090909] border border-[#b19149]/20" : "bg-white border border-gray-200";
  const text = dm ? "text-[#f8d06b]" : "text-[#0b74de]";
  const muted = dm ? "text-[#a78b3c]" : "text-gray-600";
  const inputBase = dm
    ? "bg-[#0f0f0f] text-[#f8d06b] placeholder-[#8f7d45] border-[#b19149]/20"
    : "bg-[#f8fbff] text-black placeholder-[#6b7280] border border-[#bae6fd]";
  const buttonPrimary = dm
    ? "bg-[#b19149] text-black hover:bg-[#d4a574]"
    : "bg-[#0b74de] text-white hover:bg-[#0859a1]";
  const buttonSecondary = dm
    ? "bg-[#0f0f0f] text-[#f8d06b] border-[#b19149]/20 hover:bg-[#1d1d1d]"
    : "bg-[#e0f2fe] text-[#0b74de] border-[#bae6fd] hover:bg-[#bfdbfe]";

  // Request current location
  const handleGetCurrentLocation = async () => {
    setLocationLoading(true);
    setErrors({});
    try {
      console.log("🌍 Requesting geolocation...");
      const position = await getUserLocation();
      console.log("✓ Got position:", position);
      
      const environment = await detectEnvironment(
        position.latitude,
        position.longitude,
        0 // Default run direction
      );

      if (environment) {
        console.log("✓ Environment detected:", environment);
        setDetectedEnv(environment);
        setFormData(prev => ({
          ...prev,
          altitude: String(environment.location.elevation),
          temperature: String(Math.round(environment.weather.temperature)),
          humidity: String(Math.round(environment.weather.humidity)),
          tailwind: String(Math.round(environment.weather.tailwind * 100) / 100),
        }));
      }
    } catch (error) {
      console.error("❌ Geolocation error:", error);
      let friendlyError = error.message;
      
      // Map common geolocation errors to user-friendly messages
      if (error.code === 1) {
        friendlyError = "Permission denied. Please allow location access in your browser settings and try again.";
      } else if (error.code === 2) {
        friendlyError = "Position unavailable. Please check your GPS/internet connection.";
      } else if (error.code === 3) {
        friendlyError = "Location request timed out. Try manual coordinates instead.";
      } else if (error.message.includes("Geolocation not supported")) {
        friendlyError = "Geolocation not supported in your browser. Use manual coordinates instead.";
      }
      
      setErrors({ location: friendlyError });
    } finally {
      setLocationLoading(false);
    }
  };

  // Quick test with London coordinates
  const handleTestLocation = async () => {
    setLocationLoading(true);
    setErrors({});
    try {
      console.log("🧪 Using test coordinates (London)...");
      const environment = await detectEnvironment(51.5074, -0.1278, 0);

      if (environment) {
        console.log("✓ Environment detected:", environment);
        setDetectedEnv(environment);
        setFormData(prev => ({
          ...prev,
          altitude: String(environment.location.elevation),
          temperature: String(Math.round(environment.weather.temperature)),
          humidity: String(Math.round(environment.weather.humidity)),
          tailwind: String(Math.round(environment.weather.tailwind * 100) / 100),
        }));
      }
    } catch (error) {
      console.error("❌ Test location error:", error);
      setErrors({ location: `Failed to detect environment: ${error.message}` });
    } finally {
      setLocationLoading(false);
    }
  };

  // Manual location entry
  const handleManualLocation = async () => {
    setLocationLoading(true);
    setErrors({});
    try {
      if (!manualLocation.latitude || !manualLocation.longitude) {
        setErrors({ location: "Please enter both latitude and longitude" });
        setLocationLoading(false);
        return;
      }

      const lat = parseFloat(manualLocation.latitude);
      const lon = parseFloat(manualLocation.longitude);

      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        setErrors({ location: "Invalid latitude/longitude values" });
        setLocationLoading(false);
        return;
      }

      const environment = await detectEnvironment(lat, lon, 0);

      if (environment) {
        setDetectedEnv(environment);
        setFormData(prev => ({
          ...prev,
          altitude: String(environment.location.elevation),
          temperature: String(Math.round(environment.weather.temperature)),
          humidity: String(Math.round(environment.weather.humidity)),
          tailwind: String(Math.round(environment.weather.tailwind * 100) / 100),
        }));
      }
    } catch (error) {
      setErrors({ location: `Failed to detect environment: ${error.message}` });
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle indoor location
  const handleIndoorLocation = () => {
    setErrors({});
    if (!indoorDetails.facility) {
      setErrors({ indoor: "Please enter facility name" });
      return;
    }

    setDetectedEnv({
      location: {
        address: indoorDetails.facility,
        locationType: "indoor",
        elevation: 0,
      },
      weather: {
        temperature: 20,
        humidity: 55,
        windSpeed: 0,
        weatherDescription: `Indoor - ${indoorDetails.surfaceType}`,
      },
      conditions: {
        trackCondition: "optimal",
        altitude: 0,
        temperature: 20,
        humidity: 55,
        tailwind: 0, // No wind indoors
      },
    });

    setFormData(prev => ({
      ...prev,
      altitude: "0",
      temperature: "20",
      humidity: "55",
      tailwind: "0",
    }));
  };

  const handleProceed = () => {
    if (!detectedEnv && locationMode !== "indoor") {
      setErrors({ submit: "Please detect environment first" });
      return;
    }

    if (!runDetails.raceDate || !runDetails.raceTime) {
      setErrors({ details: "Please enter race date and time" });
      return;
    }

    onEnvironmentDetected({
      environment: detectedEnv,
      runDetails,
      locationMode,
    });
  };

  return (
    <div className={`min-h-screen ${dm ? "bg-black" : "bg-white"} p-5`}>
      <div className={`${card} rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] p-8 max-w-2xl mx-auto`}>
        <h2 className={`text-2xl font-bold mb-2 ${text} flex items-center gap-2`}>
          <MapPin className="text-[#f8d06b]" size={24} />
          Where & When Did You Run?
        </h2>
        <p className={`${muted} mb-6`}>
          We'll automatically fetch weather data, elevation, and environmental conditions
        </p>

        {/* Location Mode Selection */}
        <div className="mb-8">
          <p className={`${text} font-semibold mb-3`}>How would you like to input your location?</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "current", label: "📍 Current Location", icon: "📍" },
              { id: "manual", label: "🗺️ Manual Coordinates", icon: "🗺️" },
              { id: "indoor", label: "🏢 Indoor Facility", icon: "🏢" },
            ].map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setLocationMode(option.id);
                  setErrors({});
                  setDetectedEnv(null);
                }}
                className={`p-4 rounded-lg font-semibold transition-all text-sm ${
                  locationMode === option.id
                    ? dm
                      ? "bg-[#b19149] text-black shadow-lg"
                      : "bg-[#0b74de] text-white shadow-lg"
                    : dm
                      ? "bg-[#0f0f0f] text-[#f8d06b] border border-[#b19149]/20"
                      : "bg-[#e0f2fe] text-[#0b74de] border border-[#bae6fd]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Location */}
        {locationMode === "current" && (
          <div className="space-y-4 mb-8 p-4 rounded-lg bg-[#1a1a1a]/30 border border-[#b19149]/10">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={locationLoading}
              className={`w-full p-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-white ${
                locationLoading ? "bg-gray-600 cursor-not-allowed" : buttonPrimary
              }`}
            >
              {locationLoading ? <Loader size={18} className="animate-spin" /> : <MapPin size={18} />}
              {locationLoading ? "Detecting Location..." : "Use My Current Location"}
            </button>
            <p className={`text-xs ${muted} text-center`}>
              We'll request your GPS coordinates (you'll need to allow permission)
            </p>
            
            <div className="flex gap-2">
              <div className={`flex-1 h-px bg-[#b19149]/20 my-2`}></div>
              <span className={`text-xs ${muted} px-2`}>or</span>
              <div className={`flex-1 h-px bg-[#b19149]/20 my-2`}></div>
            </div>
            
            <button
              type="button"
              onClick={handleTestLocation}
              disabled={locationLoading}
              className={`w-full p-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border ${
                locationLoading ? "bg-gray-600 cursor-not-allowed border-gray-600" : dm
                  ? "bg-[#0f0f0f] text-[#f8d06b] border-[#b19149]/20 hover:bg-[#1d1d1d]"
                  : "bg-[#e0f2fe] text-[#0b74de] border-[#bae6fd] hover:bg-[#bfdbfe]"
              }`}
            >
              {locationLoading ? <Loader size={16} className="animate-spin" /> : "🧪"}
              {locationLoading ? "Testing..." : "Try Test Location (London)"}
            </button>
            <p className={`text-xs ${muted} text-center`}>
              Don't have GPS? Test with London coordinates to see how it works
            </p>
          </div>
        )}

        {/* Manual Coordinates */}
        {locationMode === "manual" && (
          <div className="space-y-4 mb-8 p-4 rounded-lg bg-[#1a1a1a]/30 border border-[#b19149]/10">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block mb-2 text-sm ${text} font-semibold`}>Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  value={manualLocation.latitude}
                  onChange={e => setManualLocation({ ...manualLocation, latitude: e.target.value })}
                  placeholder="e.g., 51.5074"
                  className={`w-full p-3 rounded-lg outline-none border ${inputBase}`}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm ${text} font-semibold`}>Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  value={manualLocation.longitude}
                  onChange={e => setManualLocation({ ...manualLocation, longitude: e.target.value })}
                  placeholder="e.g., -0.1278"
                  className={`w-full p-3 rounded-lg outline-none border ${inputBase}`}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleManualLocation}
              disabled={locationLoading}
              className={`w-full p-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-white ${
                locationLoading ? "bg-gray-600 cursor-not-allowed" : buttonPrimary
              }`}
            >
              {locationLoading ? <Loader size={18} className="animate-spin" /> : <MapPin size={18} />}
              {locationLoading ? "Detecting Environment..." : "Fetch Environment Data"}
            </button>
          </div>
        )}

        {/* Indoor Location */}
        {locationMode === "indoor" && (
          <div className="space-y-4 mb-8 p-4 rounded-lg bg-[#1a1a1a]/30 border border-[#b19149]/10">
            <div>
              <label className={`block mb-2 text-sm ${text} font-semibold`}>Facility Name</label>
              <input
                type="text"
                value={indoorDetails.facility}
                onChange={e => setIndoorDetails({ ...indoorDetails, facility: e.target.value })}
                placeholder="e.g., Nike Indoor Track, Local Gym"
                className={`w-full p-3 rounded-lg outline-none border ${inputBase}`}
              />
            </div>
            <div>
              <label className={`block mb-2 text-sm ${text} font-semibold`}>Surface Type</label>
              <select
                value={indoorDetails.surfaceType}
                onChange={e => setIndoorDetails({ ...indoorDetails, surfaceType: e.target.value })}
                className={`w-full p-3 rounded-lg outline-none border ${inputBase}`}
              >
                <option value="track">Indoor Track</option>
                <option value="treadmill">Treadmill</option>
                <option value="road">Indoor Road/Gym</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleIndoorLocation}
              className={`w-full p-4 rounded-lg font-semibold transition-all text-white ${buttonPrimary}`}
            >
              <MapPin size={18} className="inline mr-2" />
              Confirm Indoor Location
            </button>
          </div>
        )}

        {/* Detected Environment Summary */}
        {detectedEnv && (
          <div className={`mb-8 p-5 rounded-lg border ${dm ? "border-[#b19149]/30 bg-[#1a1a1a]/50" : "border-[#bae6fd] bg-[#f0f9ff]"}`}>
            <h3 className={`${text} font-semibold mb-4 flex items-center gap-2`}>
              ✓ Environment Detected
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className={`${dm ? "text-[#a78b3c]" : "text-gray-600"}`}>
                📍 <strong>Location:</strong> {detectedEnv.location.address}
              </div>
              <div className={`${dm ? "text-[#a78b3c]" : "text-gray-600"}`}>
                📏 <strong>Elevation:</strong> {detectedEnv.location.elevation}m
              </div>
              <div className={`${dm ? "text-[#a78b3c]" : "text-gray-600"} flex items-center gap-1`}>
                <Thermometer size={14} /> <strong>Temp:</strong> {detectedEnv.weather.temperature.toFixed(1)}°C
              </div>
              <div className={`${dm ? "text-[#a78b3c]" : "text-gray-600"} flex items-center gap-1`}>
                  <Droplets size={14} /> <strong>Humidity:</strong> {detectedEnv.conditions?.humidity || 55}%
              </div>
              <div className={`${dm ? "text-[#a78b3c]" : "text-gray-600"} flex items-center gap-1`}>
                  <Wind size={14} /> <strong>Wind:</strong> {detectedEnv.conditions?.windSpeed || 0}m/s
              </div>
              <div className={`${dm ? "text-[#a78b3c]" : "text-gray-600"}`}>
                🏃 <strong>Type:</strong> {detectedEnv.location?.locationType || "unknown"}
              </div>
            </div>
          </div>
        )}

        {/* Run Details */}
        {(detectedEnv || locationMode === "indoor") && (
          <div className="space-y-4 mb-8">
            <h3 className={`${text} font-semibold flex items-center gap-2`}>
              <Clock size={18} />
              When Did You Run?
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block mb-2 text-sm ${text} font-semibold`}>Date</label>
                <input
                  type="date"
                  value={runDetails.raceDate}
                  onChange={e => setRunDetails({ ...runDetails, raceDate: e.target.value })}
                  className={`w-full p-3 rounded-lg outline-none border ${inputBase}`}
                />
              </div>
              <div>
                <label className={`block mb-2 text-sm ${text} font-semibold`}>Time</label>
                <input
                  type="time"
                  value={runDetails.raceTime}
                  onChange={e => setRunDetails({ ...runDetails, raceTime: e.target.value })}
                  className={`w-full p-3 rounded-lg outline-none border ${inputBase}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Errors */}
        {Object.entries(errors).map(([key, error]) => (
          <div
            key={key}
            className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm"
          >
            <AlertCircle size={16} />
            {error}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className={`flex-1 p-4 rounded-lg font-semibold transition-all border ${buttonSecondary}`}
          >
            Skip & Use Defaults
          </button>
          <button
            type="button"
            onClick={handleProceed}
            disabled={loading || (!detectedEnv && locationMode !== "indoor")}
            className={`flex-1 p-4 rounded-lg font-semibold transition-all text-white flex items-center justify-center gap-2 ${
              loading || (!detectedEnv && locationMode !== "indoor")
                ? "bg-gray-600 cursor-not-allowed"
                : buttonPrimary
            }`}
          >
            {loading ? <Loader size={18} className="animate-spin" /> : "✓"}
            {loading ? "Processing..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationInputPage;
