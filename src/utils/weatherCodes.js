/**
 * WMO Weather interpretation codes (WW)
 * Reference: Open-Meteo Documentation
 */

export const WEATHER_CONDITIONS = {
  0: { label: 'Clear Sky', category: 'clear', icon: 'sun' },
  1: { label: 'Mainly Clear', category: 'clear', icon: 'sun-dim' },
  2: { label: 'Partly Cloudy', category: 'cloudy', icon: 'cloud-sun' },
  3: { label: 'Overcast', category: 'cloudy', icon: 'cloud' },
  45: { label: 'Foggy', category: 'cloudy', icon: 'fog' },
  48: { label: 'Depositing Rime Fog', category: 'cloudy', icon: 'fog' },
  51: { label: 'Light Drizzle', category: 'rain', icon: 'drizzle' },
  53: { label: 'Moderate Drizzle', category: 'rain', icon: 'drizzle' },
  55: { label: 'Dense Drizzle', category: 'rain', icon: 'drizzle' },
  56: { label: 'Light Freezing Drizzle', category: 'rain', icon: 'snow-rain' },
  57: { label: 'Dense Freezing Drizzle', category: 'rain', icon: 'snow-rain' },
  61: { label: 'Slight Rain', category: 'rain', icon: 'rain' },
  63: { label: 'Moderate Rain', category: 'rain', icon: 'rain' },
  65: { label: 'Heavy Rain', category: 'rain', icon: 'rain-heavy' },
  66: { label: 'Light Freezing Rain', category: 'rain', icon: 'snow-rain' },
  67: { label: 'Heavy Freezing Rain', category: 'rain', icon: 'snow-rain' },
  71: { label: 'Slight Snowfall', category: 'snow', icon: 'snow' },
  73: { label: 'Moderate Snowfall', category: 'snow', icon: 'snow' },
  75: { label: 'Heavy Snowfall', category: 'snow', icon: 'snow-heavy' },
  77: { label: 'Snow Grains', category: 'snow', icon: 'snow' },
  80: { label: 'Slight Rain Showers', category: 'rain', icon: 'rain' },
  81: { label: 'Moderate Showers', category: 'rain', icon: 'rain' },
  82: { label: 'Violent Rain Showers', category: 'rain', icon: 'rain-heavy' },
  85: { label: 'Slight Snow Showers', category: 'snow', icon: 'snow' },
  86: { label: 'Heavy Snow Showers', category: 'snow', icon: 'snow-heavy' },
  95: { label: 'Thunderstorm', category: 'thunder', icon: 'thunder' },
  96: { label: 'Thunderstorm & Hail', category: 'thunder', icon: 'thunder-hail' },
  99: { label: 'Severe Thunderstorm', category: 'thunder', icon: 'thunder-hail' }
};

export function getWeatherInfo(code, isDay = 1) {
  const item = WEATHER_CONDITIONS[code] || { label: 'Unknown Condition', category: 'clear', icon: 'cloud' };
  
  // Night variation for clear sky
  let iconName = item.icon;
  if (!isDay) {
    if (iconName === 'sun') iconName = 'moon';
    else if (iconName === 'sun-dim') iconName = 'moon-stars';
    else if (iconName === 'cloud-sun') iconName = 'cloud-moon';
  }
  
  return {
    code,
    label: item.label,
    category: item.category,
    icon: iconName
  };
}

/**
 * Returns US Air Quality Index Category details
 * 0 - 50: Good
 * 51 - 100: Moderate
 * 101 - 150: Unhealthy for Sensitive Groups
 * 151 - 200: Unhealthy
 * 201 - 300: Very Unhealthy
 * 301+: Hazardous
 */
export function getAQIInfo(aqi) {
  if (aqi === null || aqi === undefined || isNaN(aqi)) {
    return { level: 'N/A', status: 'unknown', color: 'var(--text-muted)', bg: 'var(--bg-muted)', advice: 'No air quality data reported for this station.' };
  }
  
  const val = Math.round(aqi);
  if (val <= 50) {
    return {
      level: 'Good',
      status: 'good',
      color: '#10b981', // emerald
      bg: 'rgba(16, 185, 129, 0.12)',
      advice: 'Air quality is satisfactory and poses little or no risk.',
      shortDesc: 'Clean Air'
    };
  } else if (val <= 100) {
    return {
      level: 'Moderate',
      status: 'moderate',
      color: '#f59e0b', // amber
      bg: 'rgba(245, 158, 11, 0.12)',
      advice: 'Acceptable air quality; sensitive people may experience minor irritation.',
      shortDesc: 'Acceptable'
    };
  } else if (val <= 150) {
    return {
      level: 'Unhealthy (Sens.)',
      status: 'sensitive',
      color: '#f97316', // orange
      bg: 'rgba(249, 115, 22, 0.12)',
      advice: 'Members of sensitive groups may experience adverse health effects.',
      shortDesc: 'Sensitive Risk'
    };
  } else if (val <= 200) {
    return {
      level: 'Unhealthy',
      status: 'unhealthy',
      color: '#ef4444', // red
      bg: 'rgba(239, 68, 68, 0.12)',
      advice: 'Everyone may begin to experience health effects; limit prolonged outdoor exertion.',
      shortDesc: 'Unhealthy'
    };
  } else {
    return {
      level: 'Very Unhealthy',
      status: 'hazardous',
      color: '#8b5cf6', // purple
      bg: 'rgba(139, 92, 246, 0.15)',
      advice: 'Health alert: serious risk of health effects for all individuals.',
      shortDesc: 'Hazardous'
    };
  }
}
