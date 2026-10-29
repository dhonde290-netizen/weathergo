/**
 * High-Density Data Table View Component
 */

import { formatTemp, formatWind } from '../utils/formatters.js';
import { getIconSvg } from '../utils/icons.js';

export function renderDataTable(cities, { unit = 'C', favorites = new Set(), compareCityIds = [] } = {}) {
  if (!cities || cities.length === 0) {
    return '';
  }

  return `
    <div class="table-responsive-container">
      <table class="data-table" role="grid" aria-label="Global Atmospheric Table">
        <thead>
          <tr>
            <th scope="col" class="th-fav"><span class="sr-only">Favorite</span></th>
            <th scope="col">Station / City</th>
            <th scope="col">Region</th>
            <th scope="col">Temperature</th>
            <th scope="col">Condition</th>
            <th scope="col">Air Quality</th>
            <th scope="col">Humidity</th>
            <th scope="col">Wind</th>
            <th scope="col">Pressure</th>
            <th scope="col" class="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${cities.map(c => {
            const isFav = favorites.has(c.id);
            const isComp = compareCityIds.includes(c.id);
            const w = c.weather || {};
            const aqi = c.airQuality || {};

            return `
              <tr data-city-id="${c.id}" class="table-row">
                <td class="td-fav">
                  <button 
                    type="button" 
                    class="btn-icon-action btn-fav ${isFav ? 'is-fav' : ''}" 
                    data-action="toggle-fav" 
                    data-id="${c.id}" 
                    title="${isFav ? 'Remove from saved' : 'Save location'}"
                    aria-label="${isFav ? 'Remove from saved locations' : 'Save location'}"
                  >
                    ${getIconSvg(isFav ? 'star-filled' : 'star', 15)}
                  </button>
                </td>
                <td class="td-city">
                  <div class="table-city-name">${c.name}</div>
                  <div class="table-country-name">${c.country || ''}</div>
                </td>
                <td><span class="region-chip">${c.region || 'Global'}</span></td>
                <td class="td-temp">
                  <strong>${formatTemp(w.temperature, unit)}</strong>
                  <div class="td-sub-range">${formatTemp(w.tempMax, unit)} / ${formatTemp(w.tempMin, unit)}</div>
                </td>
                <td>
                  <div class="table-condition-cell">
                    ${getIconSvg(w.icon || 'cloud', 16)}
                    <span>${w.condition || '--'}</span>
                  </div>
                </td>
                <td>
                  <span class="table-aqi-pill" style="--aqi-color: ${aqi.color || 'var(--text-muted)'}; --aqi-bg: ${aqi.bg || 'var(--bg-muted)'}">
                    <span class="aqi-dot"></span>
                    <strong>${aqi.usAqi ?? '--'}</strong> (${aqi.level || 'N/A'})
                  </span>
                </td>
                <td>${w.humidity !== null && w.humidity !== undefined ? `${w.humidity}%` : '--'}</td>
                <td>${formatWind(w.windSpeed, unit)}</td>
                <td>${w.pressure ? `${Math.round(w.pressure)} hPa` : '--'}</td>
                <td class="td-actions">
                  <button 
                    type="button" 
                    class="btn-table-action ${isComp ? 'active' : ''}" 
                    data-action="toggle-compare" 
                    data-id="${c.id}"
                    title="Compare"
                  >
                    ${getIconSvg('compare', 14)}
                  </button>
                  <button 
                    type="button" 
                    class="btn-table-action primary" 
                    data-action="open-detail" 
                    data-id="${c.id}"
                    title="Deep Dive View"
                  >
                    ${getIconSvg('search', 14)}
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}
