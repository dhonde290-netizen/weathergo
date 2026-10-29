/**
 * Stats Overview Bar Component
 * Computes high-level scientific and climate indicators across all loaded stations
 * Pills are clickable shortcuts to directly inspect station metrics
 */

import { formatTemp } from '../utils/formatters.js';
import { getIconSvg } from '../utils/icons.js';

export function renderStatsBar(cities, unit = 'C') {
  if (!cities || cities.length === 0) {
    return '';
  }

  // Find extremes
  let hottest = cities[0];
  let coolest = cities[0];
  let cleanest = null;
  let totalTemp = 0;
  let validTempCount = 0;

  for (const c of cities) {
    const t = c.weather?.temperature;
    if (t !== undefined && t !== null && !isNaN(t)) {
      totalTemp += t;
      validTempCount++;
      if (t > (hottest.weather?.temperature ?? -999)) hottest = c;
      if (t < (coolest.weather?.temperature ?? 999)) coolest = c;
    }

    const aqi = c.airQuality?.usAqi;
    if (aqi !== undefined && aqi !== null && !isNaN(aqi)) {
      if (!cleanest || aqi < (cleanest.airQuality?.usAqi ?? 9999)) {
        cleanest = c;
      }
    }
  }

  const avgTemp = validTempCount > 0 ? totalTemp / validTempCount : null;

  return `
    <div class="stats-overview" role="region" aria-label="Global Atmospheric Summary">
      <div class="stat-pill">
        <span class="stat-icon">${getIconSvg('globe', 15)}</span>
        <div class="stat-text">
          <span class="stat-label">Active Stations</span>
          <span class="stat-value">${cities.length} Global Hubs</span>
        </div>
      </div>

      <div class="stat-pill stat-pill-clickable" data-action="open-detail" data-id="${hottest.id}" role="button" tabindex="0" title="Click to view ${hottest.name} deep-dive metrics">
        <span class="stat-icon warm">${getIconSvg('thermometer', 15)}</span>
        <div class="stat-text">
          <span class="stat-label">Warmest Station</span>
          <span class="stat-value">${hottest.name} <strong>${formatTemp(hottest.weather?.temperature, unit)}</strong></span>
        </div>
      </div>

      <div class="stat-pill stat-pill-clickable" data-action="open-detail" data-id="${coolest.id}" role="button" tabindex="0" title="Click to view ${coolest.name} deep-dive metrics">
        <span class="stat-icon cool">${getIconSvg('snow', 15)}</span>
        <div class="stat-text">
          <span class="stat-label">Coolest Station</span>
          <span class="stat-value">${coolest.name} <strong>${formatTemp(coolest.weather?.temperature, unit)}</strong></span>
        </div>
      </div>

      ${cleanest ? `
        <div class="stat-pill stat-pill-clickable" data-action="open-detail" data-id="${cleanest.id}" role="button" tabindex="0" title="Click to view ${cleanest.name} deep-dive metrics">
          <span class="stat-icon clean">${getIconSvg('sparkles', 15)}</span>
          <div class="stat-text">
            <span class="stat-label">Cleanest Air</span>
            <span class="stat-value">${cleanest.name} <span class="badge aqi-good-badge">AQI ${cleanest.airQuality.usAqi}</span></span>
          </div>
        </div>
      ` : ''}

      ${avgTemp !== null ? `
        <div class="stat-pill stat-pill-optional">
          <span class="stat-icon">${getIconSvg('gauge', 15)}</span>
          <div class="stat-text">
            <span class="stat-label">Station Avg Temp</span>
            <span class="stat-value"><strong>${formatTemp(avgTemp, unit)}</strong></span>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}
