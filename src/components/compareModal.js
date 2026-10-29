/**
 * City Side-by-Side Comparison Modal Component
 */

import { formatTemp, formatWind } from '../utils/formatters.js';
import { getIconSvg } from '../utils/icons.js';

export function renderCompareModal(cities, { unit = 'C' } = {}) {
  if (!cities || cities.length === 0) return '';

  const metrics = [
    { label: 'Current Temperature', key: 'temp', format: c => formatTemp(c.weather?.temperature, unit), raw: c => c.weather?.temperature },
    { label: 'Feels Like', key: 'feels', format: c => formatTemp(c.weather?.feelsLike, unit), raw: c => c.weather?.feelsLike },
    { label: 'Weather Condition', key: 'cond', format: c => `${getIconSvg(c.weather?.icon || 'cloud', 16)} ${c.weather?.condition || '--'}` },
    { label: 'Air Quality (US AQI)', key: 'aqi', format: c => `<span class="badge" style="background:${c.airQuality?.bg || 'var(--bg-muted)'}; color:${c.airQuality?.color || 'inherit'}">AQI ${c.airQuality?.usAqi ?? '--'} (${c.airQuality?.level || 'N/A'})</span>`, raw: c => c.airQuality?.usAqi },
    { label: 'PM2.5 Concentration', key: 'pm25', format: c => c.airQuality?.pm25 !== null ? `${c.airQuality.pm25.toFixed(1)} µg/m³` : '--', raw: c => c.airQuality?.pm25 },
    { label: 'Relative Humidity', key: 'humidity', format: c => c.weather?.humidity !== null ? `${c.weather.humidity}%` : '--', raw: c => c.weather?.humidity },
    { label: 'Wind Velocity', key: 'wind', format: c => formatWind(c.weather?.windSpeed, unit), raw: c => c.weather?.windSpeed },
    { label: 'Atmospheric Pressure', key: 'pressure', format: c => c.weather?.pressure ? `${Math.round(c.weather.pressure)} hPa` : '--', raw: c => c.weather?.pressure },
    { label: 'Peak UV Index', key: 'uv', format: c => c.weather?.uvIndex ?? '--', raw: c => c.weather?.uvIndex },
    { label: 'Day Range (High / Low)', key: 'range', format: c => `${formatTemp(c.weather?.tempMax, unit)} / ${formatTemp(c.weather?.tempMin, unit)}` },
    { label: 'Station Elevation', key: 'alt', format: c => c.elevation ? `${Math.round(c.elevation)}m` : 'Sea level' },
    { label: 'Local Timezone', key: 'tz', format: c => c.timezone || '--' }
  ];

  return `
    <div class="modal-backdrop" id="compare-modal-backdrop" data-action="close-compare-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-compare-title">
      <div class="modal-dialog modal-dialog-lg" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <h2 id="modal-compare-title" class="modal-city-name">${getIconSvg('compare', 20)} Station Comparison Matrix</h2>
            <p class="modal-subtitle">Side-by-side analytical benchmark across ${cities.length} global stations</p>
          </div>
          <button 
            type="button" 
            class="btn-icon-action btn-close-modal" 
            data-action="close-compare-modal" 
            title="Close (Esc)" 
            aria-label="Close comparison"
          >
            ${getIconSvg('x', 20)}
          </button>
        </div>

        <div class="modal-scroll-content">
          <div class="compare-table-wrapper">
            <table class="compare-table">
              <thead>
                <tr>
                  <th class="metric-header-cell">Metric</th>
                  ${cities.map(c => `
                    <th class="city-col-header">
                      <div class="city-col-name">${c.name}</div>
                      <div class="city-col-country">${c.country || ''}</div>
                      <button 
                        type="button" 
                        class="btn-remove-compare" 
                        data-action="remove-compare" 
                        data-id="${c.id}" 
                        title="Remove from comparison"
                      >
                        Remove
                      </button>
                    </th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${metrics.map(m => `
                  <tr>
                    <td class="metric-label-cell"><strong>${m.label}</strong></td>
                    ${cities.map(c => `
                      <td class="metric-val-cell">${m.format(c)}</td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="modal-footer">
          <button 
            type="button" 
            class="btn-footer-secondary" 
            data-action="clear-compare"
          >
            Clear All
          </button>
          <button 
            type="button" 
            class="btn-footer-primary" 
            data-action="close-compare-modal"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  `;
}
