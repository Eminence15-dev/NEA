// ================================================================
// EnvironmentDetectionModule.js
// Detects environmental conditions based on location using:
// - Google Maps API (elevation, location type)
// - Open-Meteo API (weather - free, no key needed)
// ================================================================

/**
 * Get elevation and location details from Google Maps API
 * Requires VITE_GOOGLE_MAPS_API_KEY in .env
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Object>} { elevation, locationType, accuracy, address }
 */
export const getElevationAndLocation = async (latitude, longitude) => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn("Google Maps API key not found. Using fallback elevation.");
      return { elevation: 0, locationType: "unknown", accuracy: "low", address: null };
    }

    // Elevation API call
    const elevationUrl = `https://maps.googleapis.com/maps/api/elevation/json?locations=${latitude},${longitude}&key=${apiKey}`;
    const elevRes = await fetch(elevationUrl);
    const elevData = await elevRes.json();
    const elevation = elevData.results?.[0]?.elevation || 0;

    // Reverse Geocoding to get location details and detect indoor/outdoor
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    const geoRes = await fetch(geocodeUrl);
    const geoData = await geoRes.json();
    const address = geoData.results?.[0]?.formatted_address || "Unknown location";
    
    // Simple heuristic to detect indoor vs outdoor
    // Keywords that suggest indoor locations
    const indoorKeywords = ["mall", "stadium", "arena", "gym", "building", "hall", "center", "complex"];
    const isIndoor = indoorKeywords.some(keyword => address.toLowerCase().includes(keyword));
    const locationType = isIndoor ? "indoor" : "outdoor";

    return {
      elevation: Math.round(elevation),
      locationType,
      accuracy: "high",
      address,
    };
  } catch (error) {
    console.error("Error fetching elevation/location:", error);
    return { elevation: 0, locationType: "unknown", accuracy: "error", address: null };
  }
};

/**
 * Get weather conditions from Open-Meteo API (free, no key needed)
 * @param {number} latitude
 * @param {number} longitude
 * @param {Date} date - Date of the run (optional, defaults to now)
 * @returns {Promise<Object>} { windSpeed, temperature, humidity, weatherCode }
 */
export const getWeatherConditions = async (latitude, longitude, date = new Date()) => {
  try {
    // Open-Meteo API - free, no authentication needed
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code",
      temperature_unit: "celsius",
      wind_speed_unit: "kmh",
      timezone: "auto",
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.current) {
      throw new Error("No weather data returned");
    }

    const current = data.current;
    const weatherDescriptions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Foggy with rime",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
    };

    return {
      windSpeed: current.wind_speed_10m || 0,
      windDirection: current.wind_direction_10m || 0,
      temperature: current.temperature_2m || 20,
      humidity: current.relative_humidity_2m || 50,
      weatherCode: current.weather_code || 0,
      weatherDescription: weatherDescriptions[current.weather_code] || "Unknown",
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching weather conditions:", error);
    return {
      windSpeed: 0,
      windDirection: 0,
      temperature: 20,
      humidity: 50,
      weatherCode: 0,
      weatherDescription: "Error fetching weather",
      fetchedAt: new Date().toISOString(),
    };
  }
};

/**
 * Detect wind conditions (tailwind vs headwind)
 * Based on run direction and wind direction
 * @param {number} windDirection - Direction wind is coming FROM (0-360)
 * @param {number} runDirection - Direction runner is heading (0-360)
 * @returns {Object} { tailwind, headwind, relativeWind }
 */
export const calculateRelativeWind = (windDirection, runDirection) => {
  // Convert to vectors and calculate relative wind
  const windVector = {
    x: Math.sin((windDirection * Math.PI) / 180),
    y: Math.cos((windDirection * Math.PI) / 180),
  };

  const runVector = {
    x: Math.sin((runDirection * Math.PI) / 180),
    y: Math.cos((runDirection * Math.PI) / 180),
  };

  // Dot product gives component of wind in direction of running
  const relativeWind = windVector.x * runVector.x + windVector.y * runVector.y;

  return {
    tailwind: Math.max(0, relativeWind), // Positive = tailwind (help)
    headwind: Math.max(0, -relativeWind), // Positive = headwind (resistance)
    relativeWind: relativeWind,
  };
};

/**
 * Detect if location is likely a running track/stadium
 * @param {string} address - Address from Google Maps
 * @returns {boolean}
 */
export const isTrackVenue = (address) => {
  if (!address) return false; // Handle null/undefined address
  const trackKeywords = ["stadium", "track", "grounds", "oval", "athletic"];
  return trackKeywords.some(keyword => address.toLowerCase().includes(keyword));
};

/**
 * Determine track condition based on weather
 * @param {Object} weather - Weather object from getWeatherConditions
 * @returns {string} "optimal", "good", "fair", or "poor"
 */
export const inferTrackCondition = (weather) => {
  const { temperature, humidity, weatherCode } = weather;

  // Poor conditions: heavy rain, snow, extreme temperatures
  if ([65, 73, 75, 82, 86, 95].includes(weatherCode) || temperature < 5 || temperature > 35) {
    return "poor";
  }

  // Fair: rain/drizzle
  if ([51, 53, 55, 61, 63].includes(weatherCode)) {
    return "fair";
  }

  // Good: cloudy, moderate conditions
  if ([2, 3, 80, 81].includes(weatherCode) || temperature > 30) {
    return "good";
  }

  // Optimal: clear/partly cloudy, 15-26°C
  return "optimal";
};

/**
 * Cache indoor location data with custom multipliers
 * @param {string} locationName - Name of indoor facility
 * @param {Object} customMultipliers - Override multipliers (wind doesn't apply indoors)
 * @returns {Object} Cached location data
 */
export const cacheIndoorLocation = (locationName, customMultipliers = {}) => {
  const indoorCache = {
    name: locationName,
    type: "indoor",
    timestamp: new Date().toISOString(),
    multipliers: {
      windMult: 1.0, // No wind indoors
      altitudeMult: 1.0, // Altitude irrelevant indoors (normalize to sea level)
      humidityMult: 0.998, // Slightly more humid indoors
      tempMult: 1.0, // Climate controlled
      ...customMultipliers,
    },
  };

  // Save to localStorage
  const cached = JSON.parse(localStorage.getItem("indoor-locations") || "{}");
  cached[locationName] = indoorCache;
  localStorage.setItem("indoor-locations", JSON.stringify(cached));

  return indoorCache;
};

/**
 * Get cached indoor location data
 * @param {string} locationName
 * @returns {Object|null}
 */
export const getIndoorLocationCache = (locationName) => {
  const cached = JSON.parse(localStorage.getItem("indoor-locations") || "{}");
  return cached[locationName] || null;
};

/**
 * Geolocation wrapper with error handling
 * @returns {Promise<Object>} { latitude, longitude, accuracy }
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        // Add error code to the error object for better handling
        const err = new Error(error.message);
        err.code = error.code;
        reject(err);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
    );
  });
};

/**
 * Complete environment detection workflow
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} runDirection - Direction runner will be heading (0-360)
 * @returns {Promise<Object>} Complete environment data
 */
export const detectEnvironment = async (latitude, longitude, runDirection = 0) => {
  try {
    const [elevation, weather] = await Promise.all([
      getElevationAndLocation(latitude, longitude),
      getWeatherConditions(latitude, longitude),
    ]);

    const windData = calculateRelativeWind(weather.windDirection, runDirection);
    const trackCondition = inferTrackCondition(weather);
    const isTrack = isTrackVenue(elevation.address);

    return {
      location: {
        latitude,
        longitude,
        address: elevation.address,
        elevation: elevation.elevation,
        locationType: elevation.locationType,
        isTrackVenue: isTrack,
      },
      weather: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        windDirection: weather.windDirection,
        tailwind: windData.tailwind,
        weatherDescription: weather.weatherDescription,
      },
      conditions: {
        trackCondition,
        altitude: elevation.elevation,
        temperature: weather.temperature,
        humidity: weather.humidity,
        tailwind: windData.tailwind,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error in detectEnvironment:", error);
    return null;
  }
};

export default {
  getElevationAndLocation,
  getWeatherConditions,
  calculateRelativeWind,
  isTrackVenue,
  inferTrackCondition,
  cacheIndoorLocation,
  getIndoorLocationCache,
  getUserLocation,
  detectEnvironment,
};
