/**
 * Open-Meteo API Client
 * Public, open-access, zero-auth meteorological and air-quality intelligence.
 */

import { getWeatherInfo, getAQIInfo } from '../utils/weatherCodes.js';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache
const apiCache = new Map();

/**
 * Curated initial presets spanning 6 continents
 */
export const DEFAULT_PRESET_CITIES = [
  { name: 'Tokyo', country: 'Japan', region: 'Asia', lat: 35.6895, lon: 139.6917, timezone: 'Asia/Tokyo' },
  { name: 'London', country: 'United Kingdom', region: 'Europe', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  { name: 'San Francisco', country: 'United States', region: 'North America', lat: 37.7749, lon: -122.4194, timezone: 'America/Los_Angeles' },
  { name: 'Bengaluru', country: 'India', region: 'Asia', lat: 12.9716, lon: 77.5946, timezone: 'Asia/Kolkata' },
  { name: 'Sydney', country: 'Australia', region: 'Oceania', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Cairo', country: 'Egypt', region: 'Africa', lat: 30.0444, lon: 31.2357, timezone: 'Africa/Cairo' },
  { name: 'São Paulo', country: 'Brazil', region: 'South America', lat: -23.5505, lon: -46.6333, timezone: 'America/Sao_Paulo' },
  { name: 'Reykjavik', country: 'Iceland', region: 'Europe', lat: 64.1466, lon: -21.9426, timezone: 'Atlantic/Reykjavik' },
  { name: 'Singapore', country: 'Singapore', region: 'Asia', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Nairobi', country: 'Kenya', region: 'Africa', lat: -1.2921, lon: 36.8219, timezone: 'Africa/Nairobi' },
  { name: 'Vancouver', country: 'Canada', region: 'North America', lat: 49.2827, lon: -123.1207, timezone: 'America/Vancouver' },
  { name: 'Dubai', country: 'United Arab Emirates', region: 'Asia', lat: 25.2048, lon: 55.2708, timezone: 'Asia/Dubai' }
];

/**
 * Searches locations using Open-Meteo Geocoding API
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
    const data = await res.json();
    if (!data.results || !data.results.length) return [];

    return data.results.map(item => ({
      id: `${item.latitude.toFixed(4)}_${item.longitude.toFixed(4)}`,
      name: item.name,
      country: item.country || '',
      countryCode: item.country_code || '',
      admin1: item.admin1 || '',
      lat: item.latitude,
      lon: item.longitude,
      elevation: item.elevation,
      timezone: item.timezone || 'auto',
      region: guessRegion(item.country_code, item.timezone)
    }));
  } catch (err) {
    console.error('Error in searchLocations:', err);
    throw err;
  }
}

/**
 * Fetches combined Weather & Air Quality for a given coordinate
 */
export async function fetchCityData(city) {
  const cacheKey = `${city.lat.toFixed(4)}_${city.lon.toFixed(4)}`;
  const cached = apiCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;

  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqiUrl).catch(() => null) // Air quality is optional resilience
    ]);

    if (!weatherRes.ok) {
      throw new Error(`Weather service returned HTTP ${weatherRes.status}`);
    }

    const weatherData = await weatherRes.json();
    let aqiData = null;
    if (aqiRes && aqiRes.ok) {
      aqiData = await aqiRes.json().catch(() => null);
    }

    const currentW = weatherData.current || {};
    const dailyW = weatherData.daily || {};
    const hourlyW = weatherData.hourly || {};
    const currentAqi = aqiData?.current || {};

    const weatherInfo = getWeatherInfo(currentW.weather_code, currentW.is_day);
    const aqiInfo = getAQIInfo(currentAqi.us_aqi);

    // Extract next 24 hourly data points starting from current hour
    const hourlyList = [];
    if (hourlyW.time && hourlyW.time.length) {
      const startIndex = hourlyW.time.findIndex(t => t >= currentW.time) || 0;
      const actualStart = Math.max(0, startIndex);
      for (let i = actualStart; i < actualStart + 24 && i < hourlyW.time.length; i++) {
        hourlyList.push({
          time: hourlyW.time[i],
          temperature: hourlyW.temperature_2m ? hourlyW.temperature_2m[i] : null,
          weatherCode: hourlyW.weather_code ? hourlyW.weather_code[i] : 0,
          precipProb: hourlyW.precipitation_probability ? hourlyW.precipitation_probability[i] : 0
        });
      }
    }

    // Extract 7-day daily forecast
    const dailyList = [];
    if (dailyW.time && dailyW.time.length) {
      for (let i = 0; i < dailyW.time.length; i++) {
        dailyList.push({
          date: dailyW.time[i],
          weatherCode: dailyW.weather_code[i],
          tempMax: dailyW.temperature_2m_max[i],
          tempMin: dailyW.temperature_2m_min[i],
          sunrise: dailyW.sunrise ? dailyW.sunrise[i] : null,
          sunset: dailyW.sunset ? dailyW.sunset[i] : null,
          uvMax: dailyW.uv_index_max ? dailyW.uv_index_max[i] : null,
          precipProb: dailyW.precipitation_probability_max ? dailyW.precipitation_probability_max[i] : 0
        });
      }
    }

    const assembled = {
      id: city.id || `${city.lat.toFixed(4)}_${city.lon.toFixed(4)}`,
      name: city.name,
      country: city.country,
      region: city.region || guessRegion(city.countryCode, weatherData.timezone),
      lat: city.lat,
      lon: city.lon,
      elevation: weatherData.elevation ?? city.elevation,
      timezone: weatherData.timezone || city.timezone,
      lastUpdated: new Date().toISOString(),
      weather: {
        temperature: currentW.temperature_2m,
        feelsLike: currentW.apparent_temperature,
        humidity: currentW.relative_humidity_2m,
        isDay: currentW.is_day === 1,
        precipitation: currentW.precipitation,
        weatherCode: currentW.weather_code,
        condition: weatherInfo.label,
        category: weatherInfo.category,
        icon: weatherInfo.icon,
        windSpeed: currentW.wind_speed_10m,
        windDirection: currentW.wind_direction_10m,
        pressure: currentW.surface_pressure,
        cloudCover: currentW.cloud_cover,
        uvIndex: dailyList[0]?.uvMax ?? null,
        tempMax: dailyList[0]?.tempMax ?? null,
        tempMin: dailyList[0]?.tempMin ?? null,
        sunrise: dailyList[0]?.sunrise ?? null,
        sunset: dailyList[0]?.sunset ?? null
      },
      airQuality: {
        usAqi: currentAqi.us_aqi !== undefined ? currentAqi.us_aqi : null,
        europeanAqi: currentAqi.european_aqi !== undefined ? currentAqi.european_aqi : null,
        pm25: currentAqi.pm2_5 !== undefined ? currentAqi.pm2_5 : null,
        pm10: currentAqi.pm10 !== undefined ? currentAqi.pm10 : null,
        no2: currentAqi.nitrogen_dioxide !== undefined ? currentAqi.nitrogen_dioxide : null,
        o3: currentAqi.ozone !== undefined ? currentAqi.ozone : null,
        so2: currentAqi.sulphur_dioxide !== undefined ? currentAqi.sulphur_dioxide : null,
        co: currentAqi.carbon_monoxide !== undefined ? currentAqi.carbon_monoxide : null,
        level: aqiInfo.level,
        status: aqiInfo.status,
        color: aqiInfo.color,
        bg: aqiInfo.bg,
        advice: aqiInfo.advice
      },
      forecast: {
        hourly: hourlyList,
        daily: dailyList
      }
    };

    apiCache.set(cacheKey, { timestamp: Date.now(), data: assembled });
    return assembled;
  } catch (err) {
    console.error(`Failed to fetch data for ${city.name}:`, err);
    throw err;
  }
}

/**
 * Quick helper to map timezone / country code to continent region
 */
function guessRegion(countryCode, timezone) {
  if (timezone) {
    if (timezone.startsWith('Europe')) return 'Europe';
    if (timezone.startsWith('Asia')) return 'Asia';
    if (timezone.startsWith('America/New_York') || timezone.startsWith('America/Chicago') || timezone.startsWith('America/Denver') || timezone.startsWith('America/Los_Angeles') || timezone.startsWith('America/Toronto') || timezone.startsWith('America/Vancouver')) return 'North America';
    if (timezone.startsWith('America/Sao_Paulo') || timezone.startsWith('America/Buenos_Aires') || timezone.startsWith('America/Bogota') || timezone.startsWith('America/Lima') || timezone.startsWith('America/Santiago')) return 'South America';
    if (timezone.startsWith('Africa')) return 'Africa';
    if (timezone.startsWith('Australia') || timezone.startsWith('Pacific')) return 'Oceania';
  }
  return 'Global';
}
