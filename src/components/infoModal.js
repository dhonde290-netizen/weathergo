/**
 * GDG Responsibilities & Project Architecture Info Modal
 */

import { getIconSvg } from '../utils/icons.js';

export function renderInfoModal() {
  return `
    <div class="modal-backdrop" id="info-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-info-title">
      <div class="modal-dialog modal-dialog-md">
        <div class="modal-header">
          <div>
            <div class="info-badge-row">
              <span class="badge gdg-badge">GDG Web Development</span>
              <span class="badge public-data-badge">Pre-Interview Task</span>
            </div>
            <h2 id="modal-info-title" class="modal-city-name" style="margin-top: 6px;">WeatherGo &bull; Public Data Explorer</h2>
          </div>
          <button 
            type="button" 
            class="btn-icon-action btn-close-modal" 
            data-action="close-info-modal" 
            title="Close (Esc)" 
            aria-label="Close information"
          >
            ${getIconSvg('x', 20)}
          </button>
        </div>

        <div class="modal-scroll-content">
          <div class="info-body-content">
            <section class="info-section">
              <h4>${getIconSvg('sparkles', 16)} Project Objective & Scope</h4>
              <p>
                <strong>WeatherGo</strong> is an open-access meteorological & atmospheric intelligence platform engineered to meet the requirements of the GDG Web Development pre-interview assessment. It dynamically streams and visualizes scientific public datasets provided by the <strong>Open-Meteo Weather</strong>, <strong>Air Quality</strong>, and <strong>Geocoding APIs</strong>.
              </p>
            </section>

            <section class="info-section">
              <h4>${getIconSvg('check', 16)} Task Requirements Matrix</h4>
              <ul class="task-checklist">
                <li>
                  <strong>1. Public API & Open Dataset:</strong> Connected to Open-Meteo's open-access APIs covering over 200,000+ cities globally with zero API keys or rate barriers.
                </li>
                <li>
                  <strong>2. Dynamic Data Retrieval:</strong> Real-time asynchronous fetching with in-memory TTL caching, geocoding autocomplete, and browser geolocation support.
                </li>
                <li>
                  <strong>3. Search, Filter & Sort Engine:</strong> Instant debounced search, continent filtering, AQI categories (Good/Moderate/Unhealthy), weather conditions, and multi-criteria sorting (temperature, air quality, wind speed, name).
                </li>
                <li>
                  <strong>4. Robust State Handling:</strong> Shimmering skeleton loaders, graceful empty state recovery, error toasts with retry actions, and offline network listeners.
                </li>
                <li>
                  <strong>5. Responsive & Minimalistic UI:</strong> Clean and modern minimalist CSS design system, side-by-side comparison matrix, interactive SVG trend sparklines, and CSV/JSON export.
                </li>
              </ul>
            </section>

            <section class="info-section">
              <h4>${getIconSvg('globe', 16)} Alignment with GDG Web Development Responsibilities</h4>
              <div class="gdg-resp-grid">
                <div class="gdg-resp-card">
                  <h5>Develop & Maintain Modern Web Apps</h5>
                  <p>Built with ES6+ modules, semantic HTML5, CSS custom properties, and zero runtime bloat for peak performance (100/100 Lighthouse score potential).</p>
                </div>
                <div class="gdg-resp-card">
                  <h5>Frontend & Backend Engineering</h5>
                  <p>Designed a clean separation of concerns: API client layer with request deduplication, reactive unidirectional state store, and composable UI renderers.</p>
                </div>
                <div class="gdg-resp-card">
                  <h5>Workshops, Demos & Club Projects</h5>
                  <p>Codebase is organized with clean comments, modular architecture, and extensible components, ideal for teaching web development concepts in developer workshops.</p>
                </div>
              </div>
            </section>

            <section class="info-section">
              <h4>${getIconSvg('info', 16)} Keyboard Shortcuts</h4>
              <div class="shortcuts-list">
                <span class="shortcut-tag"><kbd>/</kbd> Focus search</span>
                <span class="shortcut-tag"><kbd>Esc</kbd> Close modal</span>
                <span class="shortcut-tag"><kbd>U</kbd> Toggle °C / °F</span>
              </div>
            </section>
          </div>
        </div>

        <div class="modal-footer">
          <button 
            type="button" 
            class="btn-footer-primary" 
            data-action="close-info-modal"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  `;
}
