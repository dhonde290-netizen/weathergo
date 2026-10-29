# WeatherGo — Global Climate & Atmospheric Open Data Explorer
> **GDG Web Development Pre-Interview Task**  
> An open-access meteorological & atmospheric intelligence platform retrieving and visualizing real-time scientific data from public datasets.

[![Live Web Application](https://img.shields.io/badge/Status-Completed-success?style=flat-square)](#)
[![Built for](https://img.shields.io/badge/GDG-Web%20Development-blue?style=flat-square)](#)
[![Zero API Keys](https://img.shields.io/badge/Auth-100%25%20Open%20Public%20API-emerald?style=flat-square)](#)

---

## 🌍 Project Objective & Overview

**WeatherGo** is a modern, high-fidelity Glassmorphic web application created for the Google Developer Groups (GDG) Web Development interview assessment. It addresses the **Public Data Explorer** specification by integrating directly with open public scientific APIs (**Open-Meteo Weather**, **Air Quality**, and **Geocoding APIs**), which cover over 200,000+ global cities with zero required API keys and no rate-limit barriers.

The interface is engineered with a **high-fidelity Glassmorphism design system**, featuring an ambient aurora mesh canvas, frosted glass blur surfaces, specular hairline highlights, responsive data grids, interactive SVG trend sparklines, and a side-by-side station comparison matrix.

---

## 📋 Task Requirements Compliance Matrix

| Requirement | Implementation in WeatherGo |
| :--- | :--- |
| **1. Choose a suitable public API / dataset** | Integrated **Open-Meteo Public API** suite (High-resolution weather models, atmospheric air quality indices, and geocoding). Zero keys required, 100% CORS-friendly, sub-second latency. |
| **2. Fetch & display data dynamically** | All weather telemetry, air quality metrics (AQI, PM2.5, PM10, NO₂, O₃), 24-hour hourly projections, and 7-day extended forecasts are fetched dynamically on demand. Includes browser **Geolocation API** ("Locate Me") integration. |
| **3. Search, filtering, and sorting** | **Search:** Live debounced geocoding search with autocomplete suggestions.<br>**Filtering:** By Continent/Region (Asia, Europe, Americas, Africa, Oceania), Air Quality category (Good, Moderate, Unhealthy), Weather Condition, and Saved Watchlist.<br>**Sorting:** Highest/Lowest Temperature, Cleanest Air, Strongest Wind, Humidity, and Alphabetical. |
| **4. Handle loading, empty, and error states** | Shimmering CSS skeleton loader cards during fetch; clean empty state illustration with single-click "Reset All Filters" button; offline network detection banner; retry triggers; non-blocking toast notifications. |
| **5. Responsive & clear information presentation** | Dual view modes (Minimalist Card Grid & High-Density Data Table), in-depth sliding analytics drawer, side-by-side comparison matrix, unit toggle (°C / °F), modern frosted glass design system, and CSV/JSON export. |

---

## 🎯 Alignment with GDG Web Development Responsibilities

### 1. Develop and maintain web applications using modern web technologies
- Built with standard **ES6+ Modules**, **CSS Custom Properties** (variables), and semantic HTML5.
- Zero runtime JavaScript framework bloat: ensures lightning-fast execution, zero bundle overhead, and 100/100 performance potential.
- State architecture follows a centralized **unidirectional reactive store** pattern with subscription mechanisms and `localStorage` persistence.

### 2. Frontend and backend features for club projects & official websites
- Robust API abstraction layer (`src/api/openMeteo.js`) with request deduplication, in-memory TTL caching (5 minutes), and resilient fallback handling.
- Extensible component architecture (`cardRenderer`, `tableRenderer`, `modalRenderer`, `compareModal`, `statsRenderer`).

### 3. Contribute to web development workshops, demos, and collaborative projects
- Codebase is cleanly organized with self-documenting functions and clear modular structure.
- Ideal as a hands-on workshop project for club members learning API integration, asynchronous JavaScript, state management, and accessible UI design.

---

## ⚡ Key Features

- **🌐 Global Atmospheric Summary Bar**: Live metrics computing warmest station, coolest station, cleanest air hub, and station average temperature in real-time.
- **🔍 Real-Time Geocoding Autocomplete**: Instant search for any city or coordinate in the world with dropdown navigation.
- **📍 "Locate Me" Geolocation**: One-click retrieval of real-time environmental data for the user's current physical location.
- **📊 24-Hour Temperature Trajectory**: Dynamic SVG area sparkline visualization showing hourly projections and rain probability.
- **🌿 Air Quality & WHO Guidelines**: US AQI and pollutant concentrations (PM2.5, PM10, NO₂, Ozone, SO₂) with health advice badges.
- **⚖️ Side-by-Side Comparison Matrix**: Benchmark up to 3 cities simultaneously across 12 scientific metrics.
- **💾 Saved Watchlist**: Bookmark favorite locations with instant `localStorage` persistence.
- **🔄 Dual Presentation Views**: Toggle seamlessly between responsive Card Grid view and compact Data Table view.
- **🌡️ Unit Customization**: Instant switching between Celsius (°C, km/h) and Fahrenheit (°F, mph) with persistent state.
- **📥 Open Data Export**: Download displayed datasets with one click as `.csv` or `.json`.
- **⌨️ Keyboard Shortcuts**:
  - `/` &rarr; Focus search bar
  - `Esc` &rarr; Close any open drawer or modal
  - `U` &rarr; Toggle Celsius / Fahrenheit

---

## 📂 Project Structure

```
d:/ASEP/GDG pre interview task/
├── index.html                   # Semantic HTML5 entry with accessible landmarks
├── package.json                 # Project configuration & npm scripts
├── vite.config.js               # Dev server and build configuration (relative base)
├── styles/
│   ├── main.css                 # Design tokens, frosted glass engine, custom scrollbars, reset
│   └── components.css           # Cards, table, search dropdown, drawer, compare modal
└── src/
    ├── main.js                  # Main controller, event routing, bootstrap
    ├── api/
    │   └── openMeteo.js         # API integration, geocoding, forecast, caching
    ├── state/
    │   └── store.js             # Reactive store with localStorage persistence
    ├── components/
    │   ├── cardRenderer.js      # Minimalist city cards & skeleton loader
    │   ├── tableRenderer.js     # High-density data table
    │   ├── modalRenderer.js     # Deep-dive analytics drawer & SVG sparkline chart
    │   ├── compareModal.js      # Side-by-side comparison matrix
    │   ├── statsRenderer.js     # Global atmospheric summary bar
    │   └── infoModal.js         # GDG task & responsibilities overview modal
    └── utils/
        ├── weatherCodes.js      # WMO interpretation codes & AQI evaluator
        ├── icons.js             # Lightweight inline SVG icon system
        └── formatters.js        # Unit converters, timestamps, CSV/JSON export
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended, tested on v22)
- npm (v9 or higher)

### Installation & Local Development

1. **Clone or open the project folder:**
   ```bash
   cd "d:/ASEP/GDG pre interview task"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Build production bundle:**
   ```bash
   npm run build
   ```
   The compiled assets will be output to the `dist/` directory.

5. **Preview production build:**
   ```bash
   npm run preview
   ```
   Opens local preview server at `http://localhost:4173/`.
