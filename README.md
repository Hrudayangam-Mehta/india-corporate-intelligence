# India Corporate Intelligence Platform (ICIP)

> A comprehensive web application for tracking all NSE and BSE listed companies with interactive maps, corporate network graphs, political connections, media ownership analysis, and deep-dive document reviews.

## 🌐 Live Demo

**Coming soon** - Deployed via GitHub Pages

## 🎯 Vision

The India Corporate Intelligence Platform aims to map the entire corporate landscape of India — from small-cap enterprises to mega-conglomerates — revealing the hidden networks of ownership, political influence, and media control that shape the Indian economy.

### Key Features

- **📊 Dashboard**: Overview of all tracked companies, market statistics, and recent activity
- **🗺️ Map Explorer**: Interactive India map showing company headquarters, resources, and regional distribution
- **🏢 Company Profiles**: Deep-dive pages with financials, leadership, subsidiaries, and timeline
- **🕸️ Network View**: Interactive D3.js force-directed graphs showing corporate connections
- **🏭 Industry View**: Sector clustering and industry analysis
- **🏛️ Political Connections**: Corporate donations, political affiliations, and influence tracking
- **📺 Media Landscape**: Cross-media ownership analysis and coverage patterns
- **🔍 Full-Text Search**: Search companies, persons, sectors, and locations
- **🔖 Watchlist**: Track specific companies for updates and changes

## 🏗️ Architecture

### Frontend Stack

- **React 18** + **TypeScript** - Type-safe component architecture
- **Vite** - Fast development and optimized builds
- **Tailwind CSS v4** - Utility-first styling with custom dark theme
- **React Router DOM v7** - Client-side routing with HashRouter
- **D3.js** - Interactive network graphs and data visualizations
- **Mapbox GL JS** - Interactive maps (requires token)
- **Lucide React** - Consistent iconography
- **Framer Motion** - Smooth animations and transitions

### Data Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    ICIP Frontend                         │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐  │
│  │  Dashboard  │ │  Map View   │ │  Network Graph   │  │
│  └─────────────┘ └─────────────┘ └──────────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐  │
│  │   Search    │ │  Watchlist  │ │ Company Profile  │  │
│  └─────────────┘ └─────────────┘ └──────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                  React Context API                       │
│         (DataContext with useReducer pattern)            │
├─────────────────────────────────────────────────────────┤
│               Data Sources (Planned)                     │
│  • NSE/BSE APIs (stock prices, market data)             │
│  • MCA (Ministry of Corporate Affairs) filings          │
│  • SEBI disclosures                                     │
│  • Election Commission donation records                 │
│  • Registrar of Newspapers (RNI)                        │
│  • Company annual reports (5-year analysis)             │
└─────────────────────────────────────────────────────────┘
```

### Planned Repositories

1. **`india-corporate-intelligence`** (main) - React web application
2. **`icip-data-pipeline`** - Data scraping and ingestion pipeline
3. **`icip-network-engine`** - Graph analysis and network algorithms

## 🎨 Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0a0a0c` | Main background |
| `--color-bg-card` | `#121214` | Card surfaces |
| `--color-bg-elevated` | `#1a1a1e` | Elevated elements |
| `--color-border` | `rgba(255,255,255,0.06)` | Borders |
| `--color-text` | `#e8e2d9` | Primary text |
| `--color-text-secondary` | `#b8b0a4` | Secondary text |
| `--color-text-muted` | `#6b6560` | Muted text |
| `--color-accent` | `#c9a86c` | Gold accent |
| `--color-sage` | `#7a9e7e` | Success/growth |
| `--color-rose` | `#c45b5a` | Alerts/danger |
| `--color-purple` | `#8b7ec4` | Media/info |

### Typography

- **Editorial Headlines**: Playfair Display (via Google Fonts)
- **UI Text**: Inter (system fallback)

## 📱 Mobile First

The platform is designed with a mobile-first approach:
- Touch-optimized interactions (44px minimum tap targets)
- Responsive layouts that adapt from mobile to desktop
- Bottom navigation on mobile, side navigation on desktop
- Swipeable cards and collapsible sections

## 🚀 Development

### Prerequisites

```bash
node >= 20.0.0
npm >= 10.0.0
```

### Setup

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
```

### Environment Variables

Create a `.env` file:

```bash
# Mapbox token (required for map functionality)
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

## 📊 Data Model

### Company

```typescript
interface Company {
  id: string;              // CIN (Corporate Identification Number)
  name: string;
  isin: string;
  nseSymbol?: string;
  bseCode?: string;
  sector: string;
  industry: string;
  marketCap?: number;       // In Crores
  revenue?: number;         // In Crores
  profit?: number;          // In Crores
  employees?: number;
  founded?: string;
  website?: string;
  hqLocation: Location;
  registeredAddress: Address;
  directors: Director[];
  promoters: Promoter[];
  subsidiaries: Subsidiary[];
  politicalDonations?: PoliticalDonation[];
  timeline: TimelineEvent[];
}
```

### Network Graph

```typescript
interface NetworkNode {
  id: string;
  type: 'company' | 'person';
  label: string;
  data: Company | Person;
}

interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
}
```

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Project scaffolding with Vite + React + TypeScript
- [x] Dark theme design system
- [x] Layout with responsive navigation
- [x] Core pages structure
- [x] Sample data seeding

### Phase 2: Core Features (In Progress)
- [ ] Complete all page implementations
- [ ] Interactive network graph with D3.js
- [ ] Map visualization with Mapbox
- [ ] Full-text search with Fuse.js
- [ ] Watchlist functionality

### Phase 3: Data Pipeline
- [ ] NSE/BSE data scraper
- [ ] MCA filing parser
- [ ] SEBI disclosure aggregator
- [ ] Election Commission donation scraper
- [ ] Annual report analyzer (5-year review)

### Phase 4: Advanced Analytics
- [ ] Network analysis algorithms
- [ ] Political influence scoring
- [ ] Media ownership concentration analysis
- [ ] Industry clustering and visualization
- [ ] Predictive alerts and notifications

### Phase 5: Scale
- [ ] Populate all ~5,000+ BSE/NSE companies
- [ ] Real-time data updates
- [ ] User accounts and personalization
- [ ] API for third-party access

## 🤝 Contributing

This is a research and transparency project. Contributions are welcome:

1. Data accuracy improvements
2. New data sources
3. UI/UX enhancements
4. Performance optimizations
5. Documentation

## 📜 License

MIT License - See LICENSE file for details.

## ⚠️ Disclaimer

This platform is for research and educational purposes. All data is sourced from public records and disclosures. The analysis represents interpretation of public information and should not be considered financial or legal advice.

---

Built with ❤️ for corporate transparency in India.
