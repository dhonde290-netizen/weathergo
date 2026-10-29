/**
 * TerraPulse — Main Application Controller
 * Bootstraps state, API orchestration, event handling, and UI rendering
 */

import { store } from './state/store.js';
import { DEFAULT_PRESET_CITIES, fetchCityData, searchLocations } from './api/openMeteo.js';
import { renderCityCard, renderSkeletonCard } from './components/cardRenderer.js';
import { renderDataTable } from './components/tableRenderer.js';
import { renderCityModal } from './components/modalRenderer.js';
import { renderCompareModal } from './components/compareModal.js';
import { renderInfoModal } from './components/infoModal.js';
import { renderStatsBar } from './components/statsRenderer.js';
import { exportCitiesToCSV, exportCitiesToJSON } from './utils/formatters.js';

// DOM Elements
const elements = {
  mainSearchInput: document.getElementById('main-search-input'),
  autocompleteDropdown: document.getElementById('autocomplete-dropdown'),
  btnLocateMe: document.getElementById('btn-locate-me'),
  statsOverviewContainer: document.getElementById('stats-overview-container'),
  cardsGridContainer: document.getElementById('cards-grid-container'),
  tableViewContainer: document.getElementById('table-view-container'),
  emptyStateContainer: document.getElementById('empty-state-container'),
  btnResetFilters: document.getElementById('btn-reset-filters'),
  selectRegion: document.getElementById('select-region'),
  selectAqi: document.getElementById('select-aqi'),
  selectCondition: document.getElementById('select-condition'),
  selectSort: document.getElementById('select-sort'),
  btnToggleFavs: document.getElementById('btn-toggle-favs'),
  btnViewGrid: document.getElementById('btn-view-grid'),
  btnViewTable: document.getElementById('btn-view-table'),
  btnNavCompare: document.getElementById('nav-btn-compare'),
  compareCountPill: document.getElementById('compare-count-pill'),
  btnNavUnit: document.getElementById('nav-btn-unit'),
  btnNavInfo: document.getElementById('nav-btn-info'),
  footerLinkAbout: document.getElementById('footer-link-about'),
  btnExportCsv: document.getElementById('btn-export-csv'),
  btnExportJson: document.getElementById('btn-export-json'),
  modalContainerCity: document.getElementById('modal-container-city'),
  modalContainerCompare: document.getElementById('modal-container-compare'),
  modalContainerInfo: document.getElementById('modal-container-info'),
  toastContainer: document.getElementById('toast-container'),
  offlineBanner: document.getElementById('offline-banner'),
  btnRetryNetwork: document.getElementById('btn-retry-network')
};

// Search debounce timer
let searchDebounceTimer = null;

/**
 * Initializes the application
 */
async function init() {
  setupUnit();
  setupEventListeners();
  setupNetworkListeners();

  // Subscribe state store to UI updates
  store.subscribe(renderUI);

  // Initial data loading
  await loadInitialPresets();
}

/**
 * Sync initial unit from store
 */
function setupUnit() {
  const { unit } = store.getState();
  updateUnitButton(unit);
}

function updateUnitButton(unit) {
  elements.btnNavUnit.textContent = `°${unit}`;
}

/**
 * Loads default global preset cities asynchronously
 */
async function loadInitialPresets() {
  store.setState({ isLoading: true });
  renderSkeletons(6);

  try {
    const promises = DEFAULT_PRESET_CITIES.map(city =>
      fetchCityData(city).catch(err => {
        console.warn(`Could not load preset ${city.name}:`, err);
        return null;
      })
    );

    const loaded = (await Promise.all(promises)).filter(Boolean);
    store.setState({
      cities: loaded,
      isLoading: false
    });
  } catch (err) {
    console.error('Failed to load initial presets:', err);
    store.setState({
      isLoading: false,
      error: 'Failed to fetch global meteorological presets.'
    });
    store.showToast('Failed to load telemetry. Check internet connection.', 'error');
  }
}

/**
 * Render shimmering skeleton cards during loading
 */
function renderSkeletons(count = 6) {
  let skeletonsHtml = '';
  for (let i = 0; i < count; i++) {
    skeletonsHtml += renderSkeletonCard();
  }
  elements.cardsGridContainer.innerHTML = skeletonsHtml;
  elements.cardsGridContainer.style.display = 'grid';
  elements.tableViewContainer.style.display = 'none';
  elements.emptyStateContainer.style.display = 'none';
}

/**
 * Primary UI Render function triggered whenever Store updates
 */
function renderUI(state) {
  const visibleCities = store.getVisibleCities();

  // Render Stats Overview Bar
  elements.statsOverviewContainer.innerHTML = renderStatsBar(state.cities, state.unit);

  // Render Compare Count Pill in Navbar
  const compareCount = state.compareCityIds.length;
  if (compareCount > 0) {
    elements.compareCountPill.textContent = compareCount;
    elements.compareCountPill.style.display = 'inline-block';
  } else {
    elements.compareCountPill.style.display = 'none';
  }

  // Update Favorite Toggle Button State
  elements.btnToggleFavs.classList.toggle('active', state.onlyFavorites);
  elements.btnToggleFavs.setAttribute('aria-pressed', String(state.onlyFavorites));

  // Handle Empty State
  if (!state.isLoading && visibleCities.length === 0) {
    elements.cardsGridContainer.style.display = 'none';
    elements.tableViewContainer.style.display = 'none';
    elements.emptyStateContainer.style.display = 'flex';
  } else if (!state.isLoading) {
    elements.emptyStateContainer.style.display = 'none';

    if (state.viewMode === 'grid') {
      elements.cardsGridContainer.style.display = 'grid';
      elements.tableViewContainer.style.display = 'none';
      elements.cardsGridContainer.innerHTML = visibleCities.map(city =>
        renderCityCard(city, {
          unit: state.unit,
          isFavorite: store.isFavorite(city.id),
          isComparing: state.compareCityIds.includes(city.id)
        })
      ).join('');
    } else {
      elements.cardsGridContainer.style.display = 'none';
      elements.tableViewContainer.style.display = 'block';
      elements.tableViewContainer.innerHTML = renderDataTable(visibleCities, {
        unit: state.unit,
        favorites: state.favorites,
        compareCityIds: state.compareCityIds
      });
    }
  }

  // Render Deep Dive Modal / Drawer
  if (state.activeModalCity) {
    elements.modalContainerCity.innerHTML = renderCityModal(state.activeModalCity, {
      unit: state.unit,
      isFavorite: store.isFavorite(state.activeModalCity.id),
      isComparing: state.compareCityIds.includes(state.activeModalCity.id)
    });
  } else {
    elements.modalContainerCity.innerHTML = '';
  }

  // Render Comparison Matrix Modal
  if (state.isCompareModalOpen) {
    const compareCities = state.cities.filter(c => state.compareCityIds.includes(c.id));
    elements.modalContainerCompare.innerHTML = renderCompareModal(compareCities, { unit: state.unit });
  } else {
    elements.modalContainerCompare.innerHTML = '';
  }

  // Render GDG Info Modal
  if (state.isInfoModalOpen) {
    elements.modalContainerInfo.innerHTML = renderInfoModal();
  } else {
    elements.modalContainerInfo.innerHTML = '';
  }

  // Render Toast
  if (state.toast) {
    elements.toastContainer.innerHTML = `
      <div class="toast toast-${state.toast.type}" role="status">
        <span>${state.toast.message}</span>
      </div>
    `;
  } else {
    elements.toastContainer.innerHTML = '';
  }
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Live Search with Debounce and Geocoding
  elements.mainSearchInput.addEventListener('input', e => {
    const query = e.target.value;
    store.setState({ searchQuery: query });

    clearTimeout(searchDebounceTimer);
    if (!query || query.trim().length < 2) {
      elements.autocompleteDropdown.classList.remove('active');
      elements.autocompleteDropdown.innerHTML = '';
      return;
    }

    searchDebounceTimer = setTimeout(async () => {
      try {
        const results = await searchLocations(query);
        renderAutocompleteResults(results);
      } catch (err) {
        console.error('Geocoding search failed:', err);
      }
    }, 320);
  });

  // Close Autocomplete on Outside Click
  document.addEventListener('click', e => {
    if (!elements.autocompleteDropdown.contains(e.target) && e.target !== elements.mainSearchInput) {
      elements.autocompleteDropdown.classList.remove('active');
    }
  });

  // Locate Me Button (Geolocation API)
  elements.btnLocateMe.addEventListener('click', handleLocateMe);

  // Quick Explore Chips
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetStr = btn.getAttribute('data-preset');
      const cityName = presetStr.split(',')[0].trim();
      
      // Check if already in active cities
      const existing = store.getState().cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
      if (existing) {
        store.setState({ searchQuery: cityName });
        elements.mainSearchInput.value = cityName;
        store.openCityModal(existing);
      } else {
        // Trigger search and load
        elements.mainSearchInput.value = cityName;
        store.setState({ searchQuery: cityName });
        searchAndAddCity(cityName);
      }
    });
  });

  // Filter Selects
  elements.selectRegion.addEventListener('change', e => {
    store.setState({ selectedRegion: e.target.value });
  });

  elements.selectAqi.addEventListener('change', e => {
    store.setState({ selectedAqi: e.target.value });
  });

  elements.selectCondition.addEventListener('change', e => {
    store.setState({ selectedCondition: e.target.value });
  });

  elements.selectSort.addEventListener('change', e => {
    store.setState({ sortBy: e.target.value });
  });

  // Favorites Only Toggle
  elements.btnToggleFavs.addEventListener('click', () => {
    const nextOnlyFavs = !store.getState().onlyFavorites;
    store.setState({ onlyFavorites: nextOnlyFavs });
  });

  // Reset Filters Button
  elements.btnResetFilters.addEventListener('click', resetAllFilters);

  // View Mode Switcher
  elements.btnViewGrid.addEventListener('click', () => {
    elements.btnViewGrid.classList.add('active');
    elements.btnViewTable.classList.remove('active');
    store.setState({ viewMode: 'grid' });
  });

  elements.btnViewTable.addEventListener('click', () => {
    elements.btnViewTable.classList.add('active');
    elements.btnViewGrid.classList.remove('active');
    store.setState({ viewMode: 'table' });
  });

  // Unit Toggle
  elements.btnNavUnit.addEventListener('click', () => {
    store.toggleUnit();
    updateUnitButton(store.getState().unit);
  });

  // Compare Nav Button
  elements.btnNavCompare.addEventListener('click', () => {
    store.openCompareModal();
  });

  // GDG Info Nav Button & Footer Link
  elements.btnNavInfo.addEventListener('click', () => {
    store.openInfoModal();
  });
  elements.footerLinkAbout.addEventListener('click', e => {
    e.preventDefault();
    store.openInfoModal();
  });

  // Export Buttons
  elements.btnExportCsv.addEventListener('click', () => {
    const visible = store.getVisibleCities();
    if (visible.length === 0) {
      store.showToast('No data to export', 'warning');
      return;
    }
    exportCitiesToCSV(visible, store.getState().unit);
    store.showToast('Downloaded dataset as CSV', 'success');
  });

  elements.btnExportJson.addEventListener('click', () => {
    const visible = store.getVisibleCities();
    if (visible.length === 0) {
      store.showToast('No data to export', 'warning');
      return;
    }
    exportCitiesToJSON(visible);
    store.showToast('Downloaded dataset as JSON', 'success');
  });

  // Delegated Actions on Cards & Tables
  document.addEventListener('click', handleDelegatedActions);

  // Keyboard Shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Renders geocoding autocomplete dropdown
 */
function renderAutocompleteResults(results) {
  if (!results || results.length === 0) {
    elements.autocompleteDropdown.innerHTML = `
      <div style="padding: 12px 16px; font-size: 0.85rem; color: var(--text-muted);">
        No matching global locations found. Press Enter to search on map.
      </div>
    `;
    elements.autocompleteDropdown.classList.add('active');
    return;
  }

  elements.autocompleteDropdown.innerHTML = results.map(item => `
    <div class="autocomplete-item" data-action="select-location" data-payload='${JSON.stringify(item)}'>
      <div>
        <div class="auto-city-main">${item.name}</div>
        <div class="auto-city-sub">${item.admin1 ? `${item.admin1}, ` : ''}${item.country}</div>
      </div>
      <div class="auto-city-coords">${item.lat.toFixed(2)}°, ${item.lon.toFixed(2)}°</div>
    </div>
  `).join('');

  elements.autocompleteDropdown.classList.add('active');
}

/**
 * Searches and adds a new city to the active explorer view
 */
async function searchAndAddCity(query) {
  try {
    elements.autocompleteDropdown.classList.remove('active');
    store.showToast(`Locating telemetry for "${query}"...`, 'info', 2000);

    const locations = await searchLocations(query);
    if (!locations || locations.length === 0) {
      store.showToast(`No location results found for "${query}"`, 'warning');
      return;
    }

    const loc = locations[0];
    await addAndOpenLocation(loc);
  } catch (err) {
    console.error('Failed to search and add city:', err);
    store.showToast('Network error while searching location.', 'error');
  }
}

/**
 * Fetches full weather/air quality and appends location to store
 */
async function addAndOpenLocation(loc) {
  try {
    store.showToast(`Retrieving scientific data for ${loc.name}...`, 'info');
    const fullData = await fetchCityData(loc);

    const currentCities = [...store.getState().cities];
    const existingIndex = currentCities.findIndex(c => c.id === fullData.id || c.name.toLowerCase() === fullData.name.toLowerCase());

    if (existingIndex >= 0) {
      currentCities[existingIndex] = fullData;
    } else {
      currentCities.unshift(fullData);
    }

    store.setState({
      cities: currentCities,
      searchQuery: ''
    });
    elements.mainSearchInput.value = '';

    store.openCityModal(fullData);
    store.showToast(`Loaded live metrics for ${fullData.name}`, 'success');
  } catch (err) {
    console.error('Failed to fetch data for location:', err);
    store.showToast(`Could not retrieve weather data for ${loc.name}`, 'error');
  }
}

/**
 * Geolocation "Locate Me" Handler
 */
function handleLocateMe() {
  if (!navigator.geolocation) {
    store.showToast('Geolocation is not supported by your browser', 'warning');
    return;
  }

  store.showToast('Detecting your geographic coordinates...', 'info');

  navigator.geolocation.getCurrentPosition(
    async position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const localCity = {
          id: `local_${lat.toFixed(3)}_${lon.toFixed(3)}`,
          name: 'My Current Location',
          country: 'Local',
          region: 'Local',
          lat,
          lon,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto'
        };

        await addAndOpenLocation(localCity);
      } catch (err) {
        console.error('Locate me error:', err);
        store.showToast('Failed to retrieve atmospheric data for your coordinates', 'error');
      }
    },
    error => {
      console.warn('Geolocation denied or failed:', error);
      store.showToast('Location permission denied or unavailable', 'warning');
    },
    { timeout: 8000 }
  );
}

/**
 * Delegated Action Handler for dynamically rendered HTML
 */
function handleDelegatedActions(e) {
  const target = e.target.closest('[data-action]');
  if (!target) {
    // If user clicked inside a card but not on a specific action button, open detail modal
    const card = e.target.closest('.data-card');
    if (card && !card.classList.contains('skeleton-card')) {
      const cityId = card.getAttribute('data-city-id');
      const city = store.getState().cities.find(c => c.id === cityId);
      if (city) store.openCityModal(city);
    }
    return;
  }

  const action = target.getAttribute('data-action');
  const cityId = target.getAttribute('data-id');

  switch (action) {
    case 'toggle-fav':
      e.stopPropagation();
      if (cityId) store.toggleFavorite(cityId);
      break;

    case 'toggle-compare':
      e.stopPropagation();
      if (cityId) store.toggleCompare(cityId);
      break;

    case 'open-detail':
      e.stopPropagation();
      if (cityId) {
        const city = store.getState().cities.find(c => c.id === cityId);
        if (city) store.openCityModal(city);
      }
      break;

    case 'close-modal':
    case 'close-modal-backdrop':
      store.closeCityModal();
      break;

    case 'close-compare-modal':
    case 'close-compare-backdrop':
      store.closeCompareModal();
      break;

    case 'close-info-modal':
    case 'close-info-backdrop':
      store.closeInfoModal();
      break;

    case 'clear-compare':
      store.clearCompare();
      store.closeCompareModal();
      break;

    case 'remove-compare':
      if (cityId) {
        store.toggleCompare(cityId);
        if (store.getState().compareCityIds.length === 0) {
          store.closeCompareModal();
        }
      }
      break;

    case 'select-location':
      try {
        const payload = JSON.parse(target.getAttribute('data-payload'));
        addAndOpenLocation(payload);
      } catch (err) {
        console.error('Select location error:', err);
      }
      break;
  }
}

/**
 * Global Keyboard Shortcuts
 */
function handleKeyboardShortcuts(e) {
  // Escape: Close modals
  if (e.key === 'Escape') {
    if (store.getState().activeModalCity) store.closeCityModal();
    if (store.getState().isCompareModalOpen) store.closeCompareModal();
    if (store.getState().isInfoModalOpen) store.closeInfoModal();
    elements.autocompleteDropdown.classList.remove('active');
  }

  // "/" Focus search when not already inside an input
  if (e.key === '/' && document.activeElement !== elements.mainSearchInput) {
    e.preventDefault();
    elements.mainSearchInput.focus();
  }

  // "U" or "u": Toggle unit when not inside an input
  if ((e.key === 'u' || e.key === 'U') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
    store.toggleUnit();
    updateUnitButton(store.getState().unit);
  }
}

/**
 * Resets all active filters
 */
function resetAllFilters() {
  elements.selectRegion.value = 'All';
  elements.selectAqi.value = 'All';
  elements.selectCondition.value = 'All';
  elements.selectSort.value = 'temp-desc';
  elements.mainSearchInput.value = '';

  store.setState({
    searchQuery: '',
    selectedRegion: 'All',
    selectedAqi: 'All',
    selectedCondition: 'All',
    sortBy: 'temp-desc',
    onlyFavorites: false
  });

  store.showToast('All filters have been reset', 'info');
}

/**
 * Offline & Online Network Listeners
 */
function setupNetworkListeners() {
  window.addEventListener('offline', () => {
    elements.offlineBanner.style.display = 'flex';
    store.showToast('Internet connection lost. Running offline mode.', 'warning');
  });

  window.addEventListener('online', () => {
    elements.offlineBanner.style.display = 'none';
    store.showToast('Internet connection re-established.', 'success');
  });

  elements.btnRetryNetwork.addEventListener('click', () => {
    if (navigator.onLine) {
      elements.offlineBanner.style.display = 'none';
      loadInitialPresets();
    } else {
      store.showToast('Still offline. Please check your network connection.', 'error');
    }
  });
}

// Bootstrap application on DOM load
document.addEventListener('DOMContentLoaded', init);
