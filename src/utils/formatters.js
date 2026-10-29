/**
 * Utility formatters for metrics, units, timestamps, and exports
 */

export function formatTemp(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  if (unit === 'F') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatWind(kmh, unit = 'C') {
  if (kmh === null || kmh === undefined || isNaN(kmh)) return '--';
  if (unit === 'F') {
    const mph = kmh * 0.621371;
    return `${mph.toFixed(1)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function formatPrecipitation(mm, unit = 'C') {
  if (mm === null || mm === undefined || isNaN(mm)) return '0 mm';
  if (unit === 'F') {
    const inches = mm * 0.0393701;
    return `${inches.toFixed(2)} in`;
  }
  return `${mm.toFixed(1)} mm`;
}

export function formatTime(isoString, timezone = 'UTC') {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone || undefined
    }).format(date);
  } catch {
    return isoString ? isoString.split('T')[1]?.substring(0, 5) || '--' : '--';
  }
}

export function formatDayName(dateString) {
  try {
    const parts = dateString.split('-');
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString) {
  try {
    const parts = dateString.split('-');
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Downloads a file to client's computer
 */
export function triggerFileDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports current cities list as CSV
 */
export function exportCitiesToCSV(cities, unit = 'C') {
  const headers = [
    'City',
    'Country',
    'Region',
    'Latitude',
    'Longitude',
    `Current Temp (${unit === 'F' ? '°F' : '°C'})`,
    'Condition',
    'Air Quality (US AQI)',
    'AQI Category',
    'Humidity (%)',
    `Wind Speed (${unit === 'F' ? 'mph' : 'km/h'})`,
    'Pressure (hPa)',
    'UV Index',
    'Timezone'
  ];

  const rows = cities.map(c => {
    const temp = unit === 'F' ? Math.round((c.weather.temperature * 9) / 5 + 32) : Math.round(c.weather.temperature);
    const wind = unit === 'F' ? (c.weather.windSpeed * 0.621371).toFixed(1) : Math.round(c.weather.windSpeed);
    return [
      `"${c.name}"`,
      `"${c.country || ''}"`,
      `"${c.region || ''}"`,
      c.lat,
      c.lon,
      temp,
      `"${c.weather.condition}"`,
      c.airQuality?.usAqi ?? 'N/A',
      `"${c.airQuality?.category ?? 'N/A'}"`,
      c.weather.humidity ?? 'N/A',
      wind,
      c.weather.pressure ?? 'N/A',
      c.weather.uvIndex ?? 'N/A',
      `"${c.timezone || ''}"`
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  triggerFileDownload(csv, `weathergo_data_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exports current cities list as formatted JSON
 */
export function exportCitiesToJSON(cities) {
  const data = cities.map(c => ({
    id: c.id,
    name: c.name,
    country: c.country,
    region: c.region,
    coordinates: { lat: c.lat, lon: c.lon },
    elevation: c.elevation,
    timezone: c.timezone,
    weather: c.weather,
    airQuality: c.airQuality,
    retrievedAt: new Date().toISOString()
  }));

  const jsonStr = JSON.stringify(data, null, 2);
  triggerFileDownload(jsonStr, `weathergo_data_${Date.now()}.json`, 'application/json');
}
