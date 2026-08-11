# India Corporate Intelligence Platform (ICIP)

> **Uncovering the networks of power, ownership, and influence in Indian business.**

[![Live Site](https://img.shields.io/badge/Live%20Site-ICIP-gold)](https://occult-kranti.github.io/india-corporate-intelligence/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## Quick Links

| Resource | URL |
|----------|-----|
| **Live Application** | https://occult-kranti.github.io/india-corporate-intelligence/ |
| **Main Repository** | https://github.com/occult-kranti/india-corporate-intelligence |
| **Data Pipeline** | https://github.com/occult-kranti/icip-data-pipeline |
| **Network Engine** | https://github.com/occult-kranti/icip-network-engine |
| **Documentation** | https://github.com/occult-kranti/icip-docs |

---

## What is ICIP?

ICIP is a comprehensive intelligence platform for tracking and analyzing:

- **5,000+ NSE/BSE listed companies** — with deep profiles, financials, and connections
- **Corporate networks** — ownership structures, subsidiary mappings, board interlocks
- **Political connections** — electoral bonds, donation flows, policy influence
- **Media ownership** — cross-media holdings, editorial influence
- **Global operations** — international subsidiaries, FDI flows, port networks
- **Industry clustering** — sector analysis, competitive landscapes

### Current Coverage

| Entity Type | Count | Status |
|-------------|-------|--------|
| Companies | 80 | Sample data (NSE 50 + BSE 30) |
| Deep-dive profiles | 2 | Reliance, Adani |
| Network nodes | 15 | Sample relationships |
| Political donations | 12 | Sample records |

---

## Features

### Maps
- **Interactive India Map** — State-wise company distribution with choropleth heatmap
- **NSE/BSE Maps** — Exchange-specific geographic views
- **World Map** — Global operations with connection lines (Reliance & Adani)
- **City-level clustering** — Mumbai, Delhi, Bangalore hubs

### Company Profiles
- **Basic Info** — CIN, ISIN, sector, market cap, listing details
- **Deep Dive Pages** — For major conglomerates (Reliance, Adani)
- **Global Presence** — Subsidiaries, offices, factories, ports on world map
- **Ownership Tree** — Group structure with percentage holdings
- **Key People** — Board members, executives, tenure tracking

### Analytics
- **Network Graph** — D3.js force-directed graph of corporate connections
- **NIFTY 50 Dashboard** — Index stats, sector allocation, sparkline cards
- **Political Donations** — Party-wise breakdown, temporal analysis
- **Media Coverage** — Sentiment analysis, owned outlets
- **Risk Indicators** — Red flags, regulatory issues, controversies

### Data Views
- **Industry Clustering** — Sector-wise company groupings
- **Search** — Full-text search across companies, persons, CIN
- **Watchlist** — Track favorite companies
- **Timeline** — Historical events, acquisitions, legal proceedings

---

## Repository Structure

```
india-corporate-intelligence/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # App shell with navigation
│   │   ├── IndiaMap.tsx     # SVG India map component
│   │   ├── RealisticIndiaMap.tsx  # Enhanced map with city clusters
│   │   ├── WorldMap.tsx     # World map with connection lines
│   │   ├── NetworkGraph.tsx # D3.js force graph
│   │   ├── Sparkline.tsx    # SVG sparkline charts
│   │   └── ...
│   ├── pages/               # Route-level pages
│   │   ├── Dashboard.tsx
│   │   ├── MapExplorer.tsx
│   │   ├── CompanyProfile.tsx
│   │   ├── RelianceDeepDive.tsx   # Deep-dive: Reliance
│   │   ├── AdaniDeepDive.tsx      # Deep-dive: Adani Group
│   │   ├── Nifty50.tsx
│   │   ├── NetworkView.tsx
│   │   └── ...
│   ├── context/
│   │   └── DataContext.tsx  # Global state management
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces
│   ├── data/
│   │   └── exchangeData.ts  # NSE/BSE company datasets
│   └── App.tsx              # Route configuration
├── docs/
│   ├── MASTER_PLAN.md       # Architecture & roadmap
│   ├── MASTER_TRACKER.md    # Progress tracker
│   ├── STATUS_REPORT.md     # Current status
│   └── TASK_INDEX.md        # 99 indexed tasks
├── skills/                  # OpenClaw agent skills
│   ├── icip-data-scout/
│   ├── icip-doc-analyzer/
│   ├── icip-network-mapper/
│   ├── icip-political-analyst/
│   ├── icip-media-tracker/
│   ├── icip-frontend-dev/
│   └── icip-backend-dev/
└── public/
    └── 404.html             # SPA redirect for GitHub Pages
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/occult-kranti/india-corporate-intelligence.git
cd india-corporate-intelligence

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`.

---

## Using the Repositories

### 1. india-corporate-intelligence (Main Frontend)

This is the main React application. Deployed to GitHub Pages.

```bash
cd india-corporate-intelligence

# Development
npm run dev

# Build (creates dist/)
npm run build

# Deploy to GitHub Pages
# The gh-pages branch is auto-deployed when you push built files
```

**Key routes:**
- `/` — Dashboard
- `/map` — Interactive India map
- `/nse-map` — NSE company map
- `/bse-map` — BSE company map
- `/nifty50` — NIFTY 50 analytics
- `/company/:id` — Company profile
- `/company/reliance` — Reliance deep-dive
- `/company/adani` — Adani deep-dive
- `/network` — Corporate network graph
- `/political` — Political connections
- `/media` — Media ownership

### 2. icip-data-pipeline (ETL & Scraping)

Python-based data collection pipeline.

```bash
cd icip-data-pipeline

# Install Python dependencies
pip install -r requirements.txt

# Run scrapers
python scrapers/nse_companies.py      # NSE listed companies
python scrapers/bse_companies.py      # BSE listed companies
python scrapers/mca_filings.py        # MCA company master data
python scrapers/electoral_bonds.py    # Political donation data

# Geocode addresses
python geocoding/geocode_all.py

# Export to database
python etl/export_to_postgres.py
```

### 3. icip-network-engine (Graph Analytics)

Graph database and analytics API.

```bash
cd icip-network-engine

# Install dependencies
npm install

# Start GraphQL API
npm start
# API runs on http://localhost:4000

# Build for production
npm run build
```

### 4. icip-docs (Documentation)

Project documentation and research notes.

```bash
cd icip-docs

# Install mkdocs
pip install mkdocs

# Serve locally
mkdocs serve

# Build static site
mkdocs build
```

---

## Architecture

### Frontend Stack
- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **React Router** — Client-side routing (HashRouter for GitHub Pages)
- **D3.js** — Network graph visualization
- **Lucide React** — Icons

### Data Flow (Planned)
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Data Sources   │────▶│  icip-data-pipe  │────▶│   PostgreSQL    │
│  (NSE, BSE, MCA)│     │  (Python ETL)    │     │   (Main DB)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                          │
                           ┌──────────────────┐          │
                           │  icip-network    │◀─────────┘
                           │  (GraphQL API)   │
                           └──────────────────┘
                                    │
                           ┌──────────────────┐
                           │  React Frontend  │
                           │  (GitHub Pages)  │
                           └──────────────────┘
```

---

## Development Roadmap

### Phase 1: MVP ✅
- [x] Dark theme UI
- [x] Sample data (3 companies)
- [x] Static India SVG map
- [x] D3 network graph
- [x] All 10 view pages
- [x] GitHub Pages deployment

### Phase 2: Realistic Maps ✅
- [x] Realistic India map with state boundaries
- [x] City-level clustering
- [x] World map with connection lines
- [x] Reliance & Adani deep-dive pages

### Phase 3: Real Data (In Progress)
- [ ] Scrape NSE/BSE company lists
- [ ] Geocode all addresses
- [ ] PostgreSQL database
- [ ] API layer

### Phase 4: Network Intelligence
- [ ] Political donation flows
- [ ] Media ownership mapping
- [ ] Community detection
- [ ] Anomaly detection

### Phase 5: Advanced Features
- [ ] PWA + offline support
- [ ] Mobile app (Capacitor)
- [ ] Export reports (PDF)
- [ ] API for researchers

---

## Contributing

This is a research project. Contributions welcome in:
- Data scraping scripts
- Geocoding accuracy
- Network graph algorithms
- UI/UX improvements
- Documentation

---

## Data Sources

| Source | Data | License |
|--------|------|---------|
| NSE India | Listed companies, prices | Public |
| BSE India | Listed companies, prices | Public |
| MCA | Company Master Data | Public |
| ECI | Electoral Bonds | Public |
| OpenStreetMap | Geocoding | ODbL |

---

## License

MIT License — See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- Built with [OpenClaw](https://openclaw.ai) agent framework
- Maps inspired by [Mapbox](https://mapbox.com) cartography
- Network visualization powered by [D3.js](https://d3js.org)

---

*Last Updated: 2026-08-11*
*Maintained by: @tryclaw*
