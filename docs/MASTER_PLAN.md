# India Corporate Intelligence Platform (ICIP)
## Vision: Map Every Company, Connection, and Influence in Indian Business

---

## Phase 0: Architecture & Planning (Week 1)

### Core Repositories
1. **`india-corporate-intelligence`** — Main web application (React + D3 + Mapbox)
2. **`icip-data-pipeline`** — Data collection, scraping, ETL pipelines
3. **`icip-network-engine`** — Graph analysis, network algorithms, GNN models
4. **`icip-docs`** — Documentation, research notes, 5-year analysis reports

### Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS v4
- **Maps:** Mapbox GL JS (world map) + D3.js (India choropleth)
- **Graphs:** D3.js force simulation + Cytoscape.js (mobile)
- **Data:** DuckDB (embedded analytics) + Parquet files
- **Backend:** Node.js + Express (API layer) + PostgreSQL (structured data)
- **Scraping:** Playwright + Cheerio + Python (BeautifulSoup)
- **AI Analysis:** LangChain + Ollama (local LLM for document analysis)

### Data Sources (Prioritized)
1. **NSE/BSE** — Listings, market cap, sector data
2. **MCA (Ministry of Corporate Affairs)** — Company profiles, directors, charges
3. **SEBI** — Shareholding patterns, promoter data
4. **Election Commission** — Electoral bonds, political donations
5. **RBI** — FDI data, foreign investment
6. **Ministry of Ports** — Port data, shipping
7. **Industry bodies** — CII, FICCI, ASSOCHAM membership
8. **News APIs** — Media ownership, coverage patterns

---

## Phase 1: Data Foundation (Weeks 2-4)

### 1.1 Master Company Database
- [ ] Scrape all NSE listed companies (~1,700)
- [ ] Scrape all BSE listed companies (~5,000+)
- [ ] Deduplicate cross-listed entities
- [ ] Standardize: Name, CIN, ISIN, Sector, Industry, Market Cap
- [ ] Geocode: HQ location, factory locations, office addresses

### 1.2 Document Archive
- [ ] Download last 5 years annual reports for top 500 companies
- [ ] Extract: Revenue breakdown, subsidiaries, key personnel, risk factors
- [ ] Parse: Balance sheets, P&L, cash flow statements
- [ ] AI analysis: Business model, competitive moat, red flags

### 1.3 Network Data
- [ ] Director interlocks (person sits on multiple boards)
- [ ] Promoter holding patterns
- [ ] Subsidiary/parent relationships
- [ ] Joint ventures and partnerships
- [ ] Auditor relationships (Big 4 concentration)

---

## Phase 2: Visualization Engine (Weeks 3-5)

### 2.1 India Interactive Map
- [ ] State-wise company density (choropleth)
- [ ] City-level clustering (bangalore = tech, mumbai = finance)
- [ ] Industry heatmaps (textile belt, auto corridor)
- [ ] Resource maps: Mines, ports, SEZs, industrial corridors
- [ ] Click drill-down: State → City → Company list

### 2.2 World Map
- [ ] FDI inflows by country
- [ ] Indian company foreign subsidiaries
- [ ] Port connections: JNPT, Mundra, Chennai, Vizag
- [ ] Trade routes and shipping lanes
- [ ] G20 bilateral investment treaties

### 2.3 Network Graph
- [ ] Company → Director → Company (interlock graph)
- [ ] Company → Promoter → Political Party (influence graph)
- [ ] Company → Media House → Coverage (narrative graph)
- [ ] Force simulation with clustering by sector
- [ ] Filter by: Time period, relationship type, strength

---

## Phase 3: Intelligence Features (Weeks 5-8)

### 3.1 Political Connections
- [ ] Electoral bonds data (ECI)
- [ ] Company → Political Party donation flow
- [ ] MP/MLA business interests (affidavits)
- [ ] Policy influence tracking (before/after regulation changes)
- [ ] Lobbying disclosure (where available)

### 3.2 Media Analysis
- [ ] Media house ownership structures
- [ ] Cross-media holdings (TV + Print + Digital)
- [ ] Company coverage sentiment analysis
- [ ] Ad spend vs coverage correlation
- [ ] Owner → Political affiliation mapping

### 3.3 Industry Deep Dives
- [ ] Sector-wise concentration (HHI index)
- [ ] Supply chain mapping (upstream → downstream)
- [ ] Import dependency analysis
- [ ] Export destination mapping
- [ ] Regulatory capture indicators

### 3.4 Timeline & Alerts
- [ ] Company event timeline (IPO, M&A, regulatory action)
- [ ] Director appointment/removal tracking
- [ ] Shareholding pattern changes
- [ ] Credit rating changes
- [ ] Custom alert system

---

## Phase 4: UI/UX & Mobile (Weeks 6-9)

### Design Principles
- **Dark theme** (intelligence/analytics feel)
- **Card-based** information architecture
- **Progressive disclosure** (summary → detail → deep dive)
- **Touch-first** for mobile graph interactions
- **Offline capability** for core data

### Key Screens
1. **Dashboard** — Macro overview, recent alerts, trending connections
2. **Map Explorer** — India/World toggle, layer controls, search
3. **Company Profile** — Header, network graph, timeline, documents
4. **Network View** — Interactive graph with filters, path finding
5. **Watchlist** — Custom tracking lists with alerts
6. **Search** — Universal search with autocomplete, filters
7. **Reports** — Pre-built analysis reports, custom query builder

### Mobile Optimizations
- Swipe gestures for graph navigation
- Bottom sheet for detail views
- Collapsible filter panels
- Thumb-zone friendly controls
- Reduced graph complexity on small screens

---

## Phase 5: Advanced Analytics (Weeks 8-12)

### 5.1 Network Analysis
- [ ] Centrality metrics (betweenness, eigenvector)
- [ ] Community detection (cliques, clusters)
- [ ] Anomaly detection (sudden board changes, unusual donations)
- [ ] Predictive: Which companies will merge?

### 5.2 Document Intelligence
- [ ] LLM-powered annual report Q&A
- [ ] Risk factor extraction and comparison
- [ ] Related party transaction flagging
- [ ] Contingent liability aggregation

### 5.3 Correlation Engine
- [ ] Stock price vs news sentiment
- [ ] Political event → sector impact
- [ ] Global commodity → Indian company impact
- [ ] Regulatory change → stock movement

---

## Agent Structure

### Research Agents
1. **`data-scout`** — Scrapes NSE/BSE/MCA for company data
2. **`doc-analyzer`** — Processes annual reports with LLM
3. **`network-mapper`** — Builds relationship graphs from filings
4. **`political-analyst`** — Tracks political donations, connections
5. **`media-tracker`** — Monitors media ownership and coverage

### Development Agents
1. **`frontend-dev`** — React components, maps, graphs
2. **`backend-dev`** — API, database, data pipeline
3. **`viz-engineer`** — D3.js, Mapbox, graph algorithms
4. **`mobile-dev`** — Responsive design, touch interactions

### QA/Review Agents
1. **`accuracy-checker`** — Validates scraped data against official sources
2. **`ux-reviewer`** — Tests mobile experience, accessibility
3. **`legal-advisor`** — Ensures compliance with data usage laws

---

## Milestones

| Week | Milestone |
|------|-----------|
| 1 | Architecture final, repos created, agents hired |
| 2 | NSE top 500 companies in database |
| 3 | India map functional with company markers |
| 4 | Network graph with director interlocks |
| 5 | Political connections layer added |
| 6 | Mobile optimization complete |
| 7 | Media ownership module |
| 8 | 5-year document analysis for top 100 |
| 9 | World map with FDI/port data |
| 10 | Alert system and watchlists |
| 11 | Advanced analytics dashboard |
| 12 | Public beta launch |

---

## Risk Mitigation
- **Data accuracy**: Cross-validate with multiple sources
- **Legal compliance**: Respect robots.txt, use official APIs where available
- **Performance**: DuckDB for client-side analytics, lazy loading for graphs
- **Scalability**: Parquet files for time-series data, indexed PostgreSQL

---

*Document Version: 1.0*
*Created: 2026-08-11*
*Next Review: After Phase 0 completion*
