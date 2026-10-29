/**
 * Deep Dive City Analytics Modal / Drawer Component
 */

import { formatTemp, formatWind, formatTime, formatDayName, formatShortDate, formatPrecipitation } from '../utils/formatters.js';
import { getIconSvg } from '../utils/icons.js';
import { getWeatherInfo } from '../utils/weatherCodes.js';

export function renderCityModal(city, { unit = 'C', isFavorite = false, isComparing = false } = {}) {
  if (!city) return '';

  const w = city.weather || {};
  const aqi = city.airQuality || {};
  const hourly = city.forecast?.hourly || [];
  const daily = city.forecast?.daily || [];

  // Generate 24h temperature SVG sparkline / area curve
  let hourlyChartSvg = '';
  if (hourly.length >= 2) {
    const temps = hourly.map(h => (unit === 'F' ? (h.temperature * 9) / 5 + 32 : h.temperature));
    const minT = Math.min(...temps);
    const maxT = Math.max(...temps);
    const rangeT = (maxT - minT) || 1;

    const width = 640;
    const height = 120;
    const padding = 20;

    const points = temps.map((t, i) => {
      const x = padding + (i / (temps.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((t - minT) / rangeT) * (height - 2 * padding);
      return { x, y, temp: t, item: hourly[i] };
    });

    const pathData = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }, '');

    const areaData = `${pathData} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

    hourlyChartSvg = `
      <div class="chart-wrapper">
        <svg viewBox="0 0 ${width} ${height}" class="hourly-svg-chart" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--accent-primary)" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="var(--accent-primary)" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <path d="${areaData}" fill="url(#chartGradient)"/>
          <path d="${pathData}" fill="none" stroke="var(--accent-primary)" stroke-width="2.5" stroke-linecap="round"/>
          ${points.filter((_, i) => i % 3 === 0).map(p => `
            <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="var(--bg-card)" stroke="var(--accent-primary)" stroke-width="2"/>
            <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text-primary)">
              ${Math.round(p.temp)}°
            </text>
          `).join('')}
        </svg>

        <!-- Hourly timeline axis -->
        <div class="hourly-timeline-row">
          ${hourly.filter((_, i) => i % 3 === 0).map(h => `
            <div class="hourly-axis-item">
              <span class="hourly-time">${formatTime(h.time, city.timezone)}</span>
              <span class="hourly-condition-icon">${getIconSvg(getWeatherInfo(h.weatherCode).icon, 14)}</span>
              ${h.precipProb > 10 ? `<span class="hourly-precip-badge">${h.precipProb}%</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return `
    <div class="modal-backdrop" id="city-modal-backdrop" data-action="close-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-city-title">
      <div class="modal-drawer" onclick="event.stopPropagation()">
        <!-- Drawer Header -->
        <div class="modal-header">
          <div class="modal-header-info">
            <div class="modal-title-wrap">
              <h2 id="modal-city-title" class="modal-city-name">${city.name}</h2>
              <span class="modal-country">${city.country || ''}</span>
              <span class="region-chip">${city.region || 'Global'}</span>
            </div>
            <div class="modal-coords">
              <span>${city.lat.toFixed(2)}°N, ${city.lon.toFixed(2)}°E</span> &bull; 
              <span>Alt: ${city.elevation ? `${Math.round(city.elevation)}m` : 'Sea level'}</span> &bull; 
              <span>TZ: ${city.timezone}</span>
            </div>
          </div>

          <div class="modal-header-actions">
            <button 
              type="button" 
              class="btn-icon-action btn-fav ${isFavorite ? 'is-fav' : ''}" 
              data-action="toggle-fav" 
              data-id="${city.id}" 
              title="${isFavorite ? 'Remove from saved' : 'Save location'}"
            >
              ${getIconSvg(isFavorite ? 'star-filled' : 'star', 18)}
            </button>
            <button 
              type="button" 
              class="btn-icon-action btn-close-modal" 
              data-action="close-modal" 
              title="Close (Esc)" 
              aria-label="Close details"
            >
              ${getIconSvg('x', 20)}
            </button>
          </div>
        </div>

        <div class="modal-scroll-content">
          <!-- Hero Banner Metric -->
          <div class="modal-hero-grid">
            <div class="modal-hero-temp-card">
              <div class="hero-temp-top">
                <span class="hero-temp-value">${formatTemp(w.temperature, unit)}</span>
                <div class="hero-condition-badge">
                  ${getIconSvg(w.icon || 'sun', 32)}
                  <div>
                    <div class="hero-condition-text">${w.condition}</div>
                    <div class="hero-feels-like">Feels like ${formatTemp(w.feelsLike, unit)}</div>
                  </div>
                </div>
              </div>
              <div class="hero-temp-meta">
                <span>Day Peak: <strong>${formatTemp(w.tempMax, unit)}</strong></span>
                <span>Night Low: <strong>${formatTemp(w.tempMin, unit)}</strong></span>
                <span>Day/Night: <strong>${w.isDay ? 'Daytime' : 'Night'}</strong></span>
              </div>
            </div>

            <!-- Air Quality Metric Card -->
            <div class="modal-aqi-card" style="--aqi-color: ${aqi.color || 'var(--text-muted)'}; --aqi-bg: ${aqi.bg || 'var(--bg-muted)'}">
              <div class="aqi-card-header">
                <span class="aqi-card-title">${getIconSvg('sparkles', 16)} Atmospheric Air Quality</span>
                <span class="badge" style="background: ${aqi.bg}; color: ${aqi.color}; font-weight: 700;">${aqi.level}</span>
              </div>
              <div class="aqi-hero-score">
                <span class="aqi-big-num">${aqi.usAqi ?? '--'}</span>
                <span class="aqi-index-label">US AQI Standard</span>
              </div>
              <p class="aqi-advice">${aqi.advice}</p>

              <!-- Pollutants Grid -->
              <div class="pollutant-matrix">
                <div class="pollutant-item">
                  <span class="pol-name">PM2.5</span>
                  <span class="pol-val">${aqi.pm25 !== null ? `${aqi.pm25.toFixed(1)} µg/m³` : '--'}</span>
                </div>
                <div class="pollutant-item">
                  <span class="pol-name">PM10</span>
                  <span class="pol-val">${aqi.pm10 !== null ? `${aqi.pm10.toFixed(1)} µg/m³` : '--'}</span>
                </div>
                <div class="pollutant-item">
                  <span class="pol-name">NO₂</span>
                  <span class="pol-val">${aqi.no2 !== null ? `${aqi.no2.toFixed(1)} µg/m³` : '--'}</span>
                </div>
                <div class="pollutant-item">
                  <span class="pol-name">Ozone (O₃)</span>
                  <span class="pol-val">${aqi.o3 !== null ? `${aqi.o3.toFixed(1)} µg/m³` : '--'}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 24-Hour Trend Visualizer -->
          <section class="modal-section" aria-labelledby="section-hourly-title">
            <div class="section-title-row">
              <h3 id="section-hourly-title" class="section-heading">${getIconSvg('gauge', 16)} 24-Hour Temperature Trajectory</h3>
              <span class="section-subtext">Hourly forecasts generated by Open-Meteo high-resolution models</span>
            </div>
            ${hourlyChartSvg}
          </section>

          <!-- 7-Day Extended Forecast -->
          <section class="modal-section" aria-labelledby="section-daily-title">
            <div class="section-title-row">
              <h3 id="section-daily-title" class="section-heading">${getIconSvg('globe', 16)} 7-Day Extended Forecast</h3>
              <span class="section-subtext">Weekly synoptic projection</span>
            </div>
            <div class="daily-forecast-grid">
              ${daily.map(d => {
                const dayCond = getWeatherInfo(d.weatherCode);
                return `
                  <div class="daily-day-card">
                    <span class="daily-day-name">${formatDayName(d.date)}</span>
                    <span class="daily-date">${formatShortDate(d.date)}</span>
                    <span class="daily-icon">${getIconSvg(dayCond.icon, 22)}</span>
                    <span class="daily-condition">${dayCond.label}</span>
                    <div class="daily-temp-bar">
                      <span class="daily-max">${formatTemp(d.tempMax, unit)}</span>
                      <span class="daily-min">${formatTemp(d.tempMin, unit)}</span>
                    </div>
                    ${d.precipProb > 10 ? `
                      <span class="daily-rain-chance">${getIconSvg('droplet', 11)} ${d.precipProb}%</span>
                    ` : '<span class="daily-rain-chance dry">0%</span>'}
                  </div>
                `;
              }).join('')}
            </div>
          </section>

          <!-- Solar & Environmental Diagnostics -->
          <section class="modal-section">
            <h3 class="section-heading">${getIconSvg('sun', 16)} Atmospheric & Solar Diagnostics</h3>
            <div class="diagnostics-grid">
              <div class="diag-card">
                <span class="diag-icon">${getIconSvg('sun-rise', 18)}</span>
                <div>
                  <span class="diag-label">Sunrise</span>
                  <span class="diag-val">${w.sunrise ? formatTime(w.sunrise, city.timezone) : '--'}</span>
                </div>
              </div>

              <div class="diag-card">
                <span class="diag-icon">${getIconSvg('sun-set', 18)}</span>
                <div>
                  <span class="diag-label">Sunset</span>
                  <span class="diag-val">${w.sunset ? formatTime(w.sunset, city.timezone) : '--'}</span>
                </div>
              </div>

              <div class="diag-card">
                <span class="diag-icon">${getIconSvg('sun', 18)}</span>
                <div>
                  <span class="diag-label">UV Index Peak</span>
                  <span class="diag-val">${w.uvIndex !== null ? `${w.uvIndex} ${w.uvIndex > 6 ? '(High)' : '(Moderate)'}` : '--'}</span>
                </div>
              </div>

              <div class="diag-card">
                <span class="diag-icon">${getIconSvg('wind', 18)}</span>
                <div>
                  <span class="diag-label">Wind Velocity</span>
                  <span class="diag-val">${formatWind(w.windSpeed, unit)} (${w.windDirection ? `${w.windDirection}°` : '--'})</span>
                </div>
              </div>

              <div class="diag-card">
                <span class="diag-icon">${getIconSvg('gauge', 18)}</span>
                <div>
                  <span class="diag-label">Surface Pressure</span>
                  <span class="diag-val">${w.pressure ? `${Math.round(w.pressure)} hPa` : '--'}</span>
                </div>
              </div>

              <div class="diag-card">
                <span class="diag-icon">${getIconSvg('cloud', 18)}</span>
                <div>
                  <span class="diag-label">Cloud Coverage</span>
                  <span class="diag-val">${w.cloudCover !== null ? `${w.cloudCover}%` : '--'}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Drawer Footer -->
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn-footer-secondary ${isComparing ? 'active' : ''}" 
            data-action="toggle-compare" 
            data-id="${city.id}"
          >
            ${getIconSvg('compare', 15)}
            <span>${isComparing ? 'Remove from Compare' : 'Add to Compare'}</span>
          </button>

          <button 
            type="button" 
            class="btn-footer-primary" 
            data-action="close-modal"
          >
            Done Exploring
          </button>
        </div>
      </div>
    </div>
  `;
}
