/**
 * City Card Renderer Component
 * Minimalist, elegant card for presenting meteorological & air quality data
 */

import { formatTemp, formatWind } from '../utils/formatters.js';
import { getIconSvg } from '../utils/icons.js';

export function renderCityCard(city, { unit = 'C', isFavorite = false, isComparing = false } = {}) {
  const w = city.weather || {};
  const aqi = city.airQuality || {};
  const high = w.tempMax !== null ? formatTemp(w.tempMax, unit) : '--';
  const low = w.tempMin !== null ? formatTemp(w.tempMin, unit) : '--';

  return `
    <article class="data-card" data-city-id="${city.id}" tabindex="0" role="button" aria-label="${city.name}, ${city.country || ''} weather details">
      <!-- Card Header -->
      <div class="card-header">
        <div class="card-location">
          <div class="card-title-row">
            <h3 class="card-city">${city.name}</h3>
            ${city.country ? `<span class="card-country">${city.country}</span>` : ''}
          </div>
          <span class="card-region-tag">${city.region || 'Global'}</span>
        </div>

        <div class="card-actions">
          <button 
            type="button" 
            class="btn-icon-action btn-fav ${isFavorite ? 'is-fav' : ''}" 
            data-action="toggle-fav" 
            data-id="${city.id}" 
            title="${isFavorite ? 'Remove from saved' : 'Save location'}"
            aria-label="${isFavorite ? 'Remove from saved locations' : 'Save location'}"
          >
            ${getIconSvg(isFavorite ? 'star-filled' : 'star', 16)}
          </button>
        </div>
      </div>

      <!-- Main Metric Section -->
      <div class="card-body">
        <div class="card-temp-group">
          <div class="card-temp-val">${formatTemp(w.temperature, unit)}</div>
          <div class="card-condition-info">
            <div class="condition-badge">
              <span class="condition-icon">${getIconSvg(w.icon || 'cloud', 18)}</span>
              <span class="condition-name">${w.condition || 'Clear'}</span>
            </div>
            <div class="temp-range">H: ${high} &bull; L: ${low}</div>
          </div>
        </div>

        <!-- Air Quality Pill -->
        <div class="card-aqi-pill" style="--aqi-color: ${aqi.color || 'var(--text-muted)'}; --aqi-bg: ${aqi.bg || 'var(--bg-muted)'}">
          <span class="aqi-dot"></span>
          <span class="aqi-text">
            <strong>AQI ${aqi.usAqi ?? '--'}</strong> &bull; ${aqi.level || 'Unknown'}
          </span>
        </div>

        <!-- Metrics Grid -->
        <div class="card-metrics-grid">
          <div class="metric-item">
            <span class="metric-icon">${getIconSvg('thermometer', 14)}</span>
            <div class="metric-details">
              <span class="metric-label">Feels like</span>
              <span class="metric-val">${formatTemp(w.feelsLike, unit)}</span>
            </div>
          </div>

          <div class="metric-item">
            <span class="metric-icon">${getIconSvg('droplet', 14)}</span>
            <div class="metric-details">
              <span class="metric-label">Humidity</span>
              <span class="metric-val">${w.humidity ?? '--'}%</span>
            </div>
          </div>

          <div class="metric-item">
            <span class="metric-icon">${getIconSvg('wind', 14)}</span>
            <div class="metric-details">
              <span class="metric-label">Wind</span>
              <span class="metric-val">${formatWind(w.windSpeed, unit)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Footer -->
      <div class="card-footer">
        <button 
          type="button" 
          class="btn-compare-chip ${isComparing ? 'active' : ''}" 
          data-action="toggle-compare" 
          data-id="${city.id}"
          title="Compare with other cities"
        >
          ${getIconSvg('compare', 13)}
          <span>${isComparing ? 'Comparing' : 'Compare'}</span>
        </button>

        <button 
          type="button" 
          class="btn-detail-link" 
          data-action="open-detail" 
          data-id="${city.id}"
        >
          <span>Deep Dive</span>
          ${getIconSvg('search', 13)}
        </button>
      </div>
    </article>
  `;
}

/**
 * Skeleton Loader Card for Shimmering Effect
 */
export function renderSkeletonCard() {
  return `
    <div class="data-card skeleton-card" aria-hidden="true">
      <div class="skeleton-header">
        <div class="skeleton-line" style="width: 55%; height: 20px;"></div>
        <div class="skeleton-line" style="width: 24px; height: 24px; border-radius: 50%;"></div>
      </div>
      <div class="skeleton-line" style="width: 30%; height: 12px; margin-top: 4px;"></div>
      <div class="skeleton-temp" style="width: 45%; height: 42px; margin: 24px 0 16px;"></div>
      <div class="skeleton-line" style="width: 80%; height: 26px; border-radius: 13px; margin-bottom: 20px;"></div>
      <div class="skeleton-grid">
        <div class="skeleton-line" style="height: 38px;"></div>
        <div class="skeleton-line" style="height: 38px;"></div>
        <div class="skeleton-line" style="height: 38px;"></div>
      </div>
      <div class="skeleton-footer" style="display:flex; justify-content:space-between; margin-top: 18px;">
        <div class="skeleton-line" style="width: 35%; height: 28px;"></div>
        <div class="skeleton-line" style="width: 35%; height: 28px;"></div>
      </div>
    </div>
  `;
}
