/**
 * Application State Store
 * Lightweight reactive store with subscription mechanism & localStorage persistence
 */

const STORAGE_KEYS = {
  UNIT: 'weathergo_unit',
  FAVORITES: 'weathergo_favorites'
};

class Store {
  constructor() {
    this.listeners = new Set();
    
    // Load persisted preferences (with fallback to previous keys)
    const savedUnit = localStorage.getItem(STORAGE_KEYS.UNIT) || localStorage.getItem('terrapulse_unit') || 'C';
    let savedFavorites = [];
    try {
      const rawFav = localStorage.getItem(STORAGE_KEYS.FAVORITES) || localStorage.getItem('terrapulse_favorites') || '[]';
      savedFavorites = JSON.parse(rawFav);
    } catch {
      savedFavorites = [];
    }

    this.state = {
      cities: [],
      isLoading: false,
      loadingCityIds: new Set(),
      error: null,
      searchQuery: '',
      selectedRegion: 'All',
      selectedAqi: 'All',
      selectedCondition: 'All',
      sortBy: 'temp-desc',
      viewMode: 'grid', // 'grid' | 'table'
      unit: savedUnit, // 'C' | 'F'
      favorites: new Set(savedFavorites),
      onlyFavorites: false,
      activeModalCity: null,
      compareCityIds: [],
      isCompareModalOpen: false,
      isInfoModalOpen: false,
      toast: null
    };
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  setUnit(unit) {
    localStorage.setItem(STORAGE_KEYS.UNIT, unit);
    this.setState({ unit });
  }

  toggleUnit() {
    const nextUnit = this.state.unit === 'C' ? 'F' : 'C';
    this.setUnit(nextUnit);
  }

  toggleFavorite(cityId) {
    const nextFavs = new Set(this.state.favorites);
    if (nextFavs.has(cityId)) {
      nextFavs.delete(cityId);
      this.showToast('Removed from saved locations', 'info');
    } else {
      nextFavs.add(cityId);
      this.showToast('Saved to your watchlist', 'success');
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([...nextFavs]));
    this.setState({ favorites: nextFavs });
  }

  isFavorite(cityId) {
    return this.state.favorites.has(cityId);
  }

  toggleCompare(cityId) {
    let nextCompare = [...this.state.compareCityIds];
    if (nextCompare.includes(cityId)) {
      nextCompare = nextCompare.filter(id => id !== cityId);
      this.showToast('Removed from comparison', 'info');
    } else {
      if (nextCompare.length >= 3) {
        this.showToast('You can compare up to 3 locations at once', 'warning');
        return;
      }
      nextCompare.push(cityId);
      this.showToast('Added to comparison matrix', 'success');
    }
    this.setState({ compareCityIds: nextCompare });
  }

  clearCompare() {
    this.setState({ compareCityIds: [] });
  }

  openCompareModal() {
    if (this.state.compareCityIds.length === 0) {
      this.showToast('Select at least 1 city to compare', 'warning');
      return;
    }
    this.setState({ isCompareModalOpen: true });
  }

  closeCompareModal() {
    this.setState({ isCompareModalOpen: false });
  }

  openCityModal(city) {
    this.setState({ activeModalCity: city });
  }

  closeCityModal() {
    this.setState({ activeModalCity: null });
  }

  openInfoModal() {
    this.setState({ isInfoModalOpen: true });
  }

  closeInfoModal() {
    this.setState({ isInfoModalOpen: false });
  }

  showToast(message, type = 'info', duration = 3000) {
    const toast = { id: Date.now(), message, type };
    this.setState({ toast });
    setTimeout(() => {
      if (this.state.toast?.id === toast.id) {
        this.setState({ toast: null });
      }
    }, duration);
  }

  /**
   * Computed selector: returns filtered and sorted list of cities
   */
  getVisibleCities() {
    const {
      cities,
      searchQuery,
      selectedRegion,
      selectedAqi,
      selectedCondition,
      sortBy,
      favorites,
      onlyFavorites
    } = this.state;

    let result = [...cities];

    // Filter by Favorites
    if (onlyFavorites) {
      result = result.filter(c => favorites.has(c.id));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.country && c.country.toLowerCase().includes(q)) ||
        (c.weather?.condition && c.weather.condition.toLowerCase().includes(q))
      );
    }

    // Filter by Region
    if (selectedRegion !== 'All') {
      result = result.filter(c => c.region === selectedRegion);
    }

    // Filter by AQI Category
    if (selectedAqi !== 'All') {
      result = result.filter(c => {
        if (!c.airQuality) return false;
        if (selectedAqi === 'good') return c.airQuality.usAqi !== null && c.airQuality.usAqi <= 50;
        if (selectedAqi === 'moderate') return c.airQuality.usAqi !== null && c.airQuality.usAqi > 50 && c.airQuality.usAqi <= 100;
        if (selectedAqi === 'unhealthy') return c.airQuality.usAqi !== null && c.airQuality.usAqi > 100;
        return true;
      });
    }

    // Filter by Weather Condition Category
    if (selectedCondition !== 'All') {
      result = result.filter(c => c.weather?.category === selectedCondition);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'temp-desc':
          return (b.weather?.temperature ?? -999) - (a.weather?.temperature ?? -999);
        case 'temp-asc':
          return (a.weather?.temperature ?? 999) - (b.weather?.temperature ?? 999);
        case 'aqi-asc': // Cleanest first
          return (a.airQuality?.usAqi ?? 9999) - (b.airQuality?.usAqi ?? 9999);
        case 'aqi-desc': // Most polluted first
          return (b.airQuality?.usAqi ?? -1) - (a.airQuality?.usAqi ?? -1);
        case 'wind-desc':
          return (b.weather?.windSpeed ?? 0) - (a.weather?.windSpeed ?? 0);
        case 'humidity-desc':
          return (b.weather?.humidity ?? 0) - (a.weather?.humidity ?? 0);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }
}

export const store = new Store();
