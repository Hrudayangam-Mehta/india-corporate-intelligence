# ICIP Task Index

**Legend:**
- `[ ]` = Not started
- `[~]` = In progress
- `[x]` = Complete
- `[b]` = Blocked

**Priority:** P0 = Critical, P1 = High, P2 = Medium, P3 = Low

---

## Section A: Infrastructure & Setup (A001-A099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| A001 | Create `icip-data-pipeline` repository | P0 | [x] | @tryclaw | icip-data-pipeline | - |
| A002 | Create `icip-network-engine` repository | P0 | [x] | @tryclaw | icip-network-engine | - |
| A003 | Create `icip-docs` repository | P1 | [x] | @tryclaw | icip-docs | - |
| A004 | Set up main repo CI/CD for auto-deploy | P1 | [ ] | - | india-corporate-intelligence | A001 |
| A005 | Configure repo branch protection rules | P2 | [ ] | - | all | A001-A003 |
| A006 | Set up issue templates (bug, feature, research) | P2 | [ ] | - | all | A001-A003 |
| A007 | Create shared npm package for types | P1 | [ ] | - | icip-types | - |
| A008 | Set up monorepo tooling or workspace links | P2 | [ ] | - | all | A007 |

## Section B: Data Architecture (B001-B099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| B001 | Design master database schema (companies, persons, edges) | P0 | [~] | @tryclaw | icip-data-pipeline | - |
| B002 | Create PostgreSQL migration scripts | P0 | [ ] | - | icip-data-pipeline | B001 |
| B003 | Set up DuckDB for embedded analytics | P1 | [ ] | - | icip-network-engine | - |
| B004 | Design Parquet file structure for time-series data | P1 | [ ] | - | icip-data-pipeline | B001 |
| B005 | Create data validation pipeline | P1 | [ ] | - | icip-data-pipeline | B002 |
| B006 | Set up data versioning (DVC or git-lfs) | P2 | [ ] | - | icip-data-pipeline | B004 |
| B007 | Create sample datasets for development | P0 | [x] | @tryclaw | india-corporate-intelligence | - |
| B008 | Design API contract (REST + GraphQL) | P1 | [ ] | - | icip-data-pipeline | B001 |

## Section C: Frontend - Core (C001-C099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| C001 | Set up React 18 + TypeScript + Vite scaffold | P0 | [x] | @tryclaw | india-corporate-intelligence | - |
| C002 | Implement dark theme design system | P0 | [x] | @tryclaw | india-corporate-intelligence | C001 |
| C003 | Create Layout with navigation | P0 | [x] | @tryclaw | india-corporate-intelligence | C002 |
| C004 | Build Dashboard page | P0 | [x] | @tryclaw | india-corporate-intelligence | C003 |
| C005 | Build Company Profile page | P0 | [x] | @tryclaw | india-corporate-intelligence | C003 |
| C006 | Build Map Explorer (India SVG) | P0 | [x] | @tryclaw | india-corporate-intelligence | C003 |
| C007 | Build Network Graph (D3.js) | P0 | [x] | @tryclaw | india-corporate-intelligence | C003 |
| C008 | Build Industry Clustering view | P0 | [x] | @tryclaw | india-corporate-intelligence | C003 |
| C009 | Build Political Connections view | P0 | [x] | @tryclaw | india-corporate-intelligence | C003 |
| C010 | Build Media Ownership view | P0 | [x] | @tryclaw | india-corporate-intelligence | C003 |
| C011 | Build Search page | P0 | [x] | @tryclaw | india-corporate-intelligence | C003 |
| C012 | Build Watchlist page | P0 | [x] | @tryclaw | india-corporate-intelligence | C003 |
| C013 | Mobile responsive optimization | P1 | [~] | @tryclaw | india-corporate-intelligence | C004-C012 |
| C014 | Deploy to GitHub Pages | P0 | [x] | @tryclaw | india-corporate-intelligence | C001 |
| C015 | Implement HashRouter for static hosting | P0 | [x] | @tryclaw | india-corporate-intelligence | C014 |
| C016 | Add PWA manifest and service worker | P2 | [ ] | - | india-corporate-intelligence | C014 |
| C017 | Implement offline data caching | P2 | [ ] | - | india-corporate-intelligence | C016 |
| C018 | Add skeleton loading states | P2 | [ ] | - | india-corporate-intelligence | C004-C012 |
| C019 | Implement error boundaries | P2 | [ ] | - | india-corporate-intelligence | C001 |
| C020 | Add keyboard shortcuts | P3 | [ ] | - | india-corporate-intelligence | C004-C012 |
| C021 | Build NIFTY 50 index page | P1 | [x] | @tryclaw | india-corporate-intelligence | C004 |
| C022 | Build NIFTY 50 stock cards with sparklines | P1 | [x] | @tryclaw | india-corporate-intelligence | C021 |
| C023 | Add sector allocation pie chart for NIFTY 50 | P2 | [ ] | - | india-corporate-intelligence | C021 |
| C024 | Build Reliance deep-dive page with world map | P1 | [x] | @tryclaw | india-corporate-intelligence | C005 |
| C025 | Build Adani Group deep-dive page with world map | P1 | [x] | @tryclaw | india-corporate-intelligence | C005 |
| C026 | Create Sparkline component for stock trends | P1 | [x] | @tryclaw | india-corporate-intelligence | C022 |

## Section D: Frontend - Advanced Maps (D001-D099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| D001 | Integrate Mapbox GL JS for world map | P1 | [ ] | - | india-corporate-intelligence | C006 |
| D002 | Add India GeoJSON with state boundaries | P1 | [ ] | - | india-corporate-intelligence | D001 |
| D003 | Create choropleth layer for company density | P1 | [ ] | - | india-corporate-intelligence | D002 |
| D004 | Add city-level clustering | P1 | [ ] | - | india-corporate-intelligence | D003 |
| D005 | Add industry heatmap overlay | P2 | [ ] | - | india-corporate-intelligence | D004 |
| D006 | Add resource maps (mines, ports, SEZs) | P2 | [ ] | - | india-corporate-intelligence | D004 |
| D007 | Implement drill-down: State → City → Company | P1 | [ ] | - | india-corporate-intelligence | D004 |
| D008 | Add FDI flow visualization on world map | P2 | [ ] | - | india-corporate-intelligence | D001 |
| D009 | Add port connection lines | P2 | [ ] | - | india-corporate-intelligence | D008 |
| D010 | Add trade route visualization | P3 | [ ] | - | india-corporate-intelligence | D009 |
| D011 | Create dedicated NSE map page | P1 | [x] | @tryclaw | india-corporate-intelligence | C006 |
| D012 | Create dedicated BSE map page | P1 | [x] | @tryclaw | india-corporate-intelligence | C006 |
| D013 | Add exchange filter to map explorer | P2 | [x] | @tryclaw | india-corporate-intelligence | D011,D012 |
| D014 | Create RealisticIndiaMap with accurate boundaries | P1 | [x] | @tryclaw | india-corporate-intelligence | C006 |
| D015 | Create WorldMap component with connection lines | P1 | [x] | @tryclaw | india-corporate-intelligence | D014 |

## Section E: Frontend - Network & Graph (E001-E099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| E001 | Implement D3 force simulation engine | P0 | [x] | @tryclaw | india-corporate-intelligence | C007 |
| E002 | Add node clustering by sector | P1 | [ ] | - | india-corporate-intelligence | E001 |
| E003 | Add relationship type filters | P1 | [ ] | - | india-corporate-intelligence | E001 |
| E004 | Implement path finding (shortest path) | P2 | [ ] | - | icip-network-engine | E001 |
| E005 | Add community detection visualization | P2 | [ ] | - | icip-network-engine | E004 |
| E006 | Create time-slider for temporal network | P2 | [ ] | - | india-corporate-intelligence | E001 |
| E007 | Add mobile touch gestures for graph | P1 | [ ] | - | india-corporate-intelligence | C013 |
| E008 | Implement zoom and pan controls | P1 | [ ] | - | india-corporate-intelligence | E001 |
| E009 | Add node size by market cap | P1 | [ ] | - | india-corporate-intelligence | E001 |
| E010 | Create mini-map overview | P3 | [ ] | - | india-corporate-intelligence | E008 |

## Section F: Data Collection - Companies (F001-F099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| F001 | Scrape NSE listed companies list | P0 | [ ] | - | icip-data-pipeline | B002 |
| F002 | Scrape BSE listed companies list | P0 | [ ] | - | icip-data-pipeline | B002 |
| F003 | Cross-reference NSE/BSE for duplicates | P0 | [ ] | - | icip-data-pipeline | F001,F002 |
| F004 | Scrape company basic info (CIN, ISIN, sector) | P0 | [ ] | - | icip-data-pipeline | F003 |
| F005 | Geocode all company addresses | P1 | [ ] | - | icip-data-pipeline | F004 |
| F006 | Scrape shareholding patterns | P1 | [ ] | - | icip-data-pipeline | F004 |
| F007 | Scrape director information | P1 | [ ] | - | icip-data-pipeline | F004 |
| F008 | Scrape subsidiary information | P1 | [ ] | - | icip-data-pipeline | F004 |
| F009 | Scrape financial data (market cap, revenue) | P1 | [ ] | - | icip-data-pipeline | F004 |
| F010 | Download annual reports (top 500, 5 years) | P1 | [ ] | - | icip-data-pipeline | F004 |

## Section G: Data Collection - Political (G001-G099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| G001 | Scrape Electoral Bonds data (ECI) | P0 | [ ] | - | icip-data-pipeline | B002 |
| G002 | Parse electoral bond purchaser-company mapping | P0 | [ ] | - | icip-data-pipeline | G001 |
| G003 | Scrape MLA/MP asset declarations | P1 | [ ] | - | icip-data-pipeline | B002 |
| G004 | Extract business interests from affidavits | P1 | [ ] | - | icip-data-pipeline | G003 |
| G005 | Map company → political party donation flow | P1 | [ ] | - | icip-data-pipeline | G002 |
| G006 | Track policy changes and correlate with donations | P2 | [ ] | - | icip-network-engine | G005 |
| G007 | Scrape lobbying disclosures (if available) | P3 | [ ] | - | icip-data-pipeline | B002 |

## Section H: Data Collection - Media (H001-H099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| H001 | Build media house ownership database | P1 | [ ] | - | icip-data-pipeline | B002 |
| H002 | Scrape RNI (Registrar of Newspapers) data | P1 | [ ] | - | icip-data-pipeline | H001 |
| H003 | Map cross-media holdings | P1 | [ ] | - | icip-data-pipeline | H002 |
| H004 | Track media owner political affiliations | P2 | [ ] | - | icip-data-pipeline | H003 |
| H005 | Collect company ad spend data | P2 | [ ] | - | icip-data-pipeline | B002 |
| H006 | Correlate ad spend with coverage sentiment | P3 | [ ] | - | icip-network-engine | H004,H005 |

## Section I: Document Analysis (I001-I099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| I001 | Set up LLM pipeline (Ollama/LangChain) | P1 | [ ] | - | icip-data-pipeline | B002 |
| I002 | Create annual report text extraction | P1 | [ ] | - | icip-data-pipeline | F010 |
| I003 | Build business model summarizer | P2 | [ ] | - | icip-data-pipeline | I002 |
| I004 | Extract related party transactions | P2 | [ ] | - | icip-data-pipeline | I002 |
| I005 | Flag contingent liabilities | P2 | [ ] | - | icip-data-pipeline | I002 |
| I006 | Compare risk factors across years | P2 | [ ] | - | icip-data-pipeline | I002 |
| I007 | Build annual report Q&A interface | P2 | [ ] | - | india-corporate-intelligence | I001 |
| I008 | Generate automated company summaries | P2 | [ ] | - | icip-data-pipeline | I003 |
| I009 | Track auditor changes and red flags | P3 | [ ] | - | icip-data-pipeline | I002 |
| I010 | Compare peer companies automatically | P3 | [ ] | - | icip-data-pipeline | I003 |

## Section J: Network Analytics (J001-J099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| J001 | Implement graph centrality metrics | P1 | [ ] | - | icip-network-engine | B003 |
| J002 | Build community detection algorithms | P1 | [ ] | - | icip-network-engine | J001 |
| J003 | Calculate network density by sector | P2 | [ ] | - | icip-network-engine | J002 |
| J004 | Identify key nodes (influential companies/persons) | P2 | [ ] | - | icip-network-engine | J001 |
| J005 | Detect anomalous patterns (sudden changes) | P2 | [ ] | - | icip-network-engine | J004 |
| J006 | Predict potential mergers/acquisitions | P3 | [ ] | - | icip-network-engine | J005 |
| J007 | Calculate political influence scores | P2 | [ ] | - | icip-network-engine | G005 |
| J008 | Build narrative graph (media → public opinion) | P3 | [ ] | - | icip-network-engine | H006 |

## Section K: Timeline & Alerts (K001-K099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| K001 | Design event schema (timeline) | P1 | [ ] | - | icip-data-pipeline | B001 |
| K002 | Build company event tracker | P1 | [ ] | - | icip-data-pipeline | K001 |
| K003 | Track director appointments/removals | P1 | [ ] | - | icip-data-pipeline | F007 |
| K004 | Track shareholding changes | P1 | [ ] | - | icip-data-pipeline | F006 |
| K005 | Track credit rating changes | P2 | [ ] | - | icip-data-pipeline | K001 |
| K006 | Build alert system | P1 | [ ] | - | india-corporate-intelligence | K002-K005 |
| K007 | Create user notification preferences | P2 | [ ] | - | india-corporate-intelligence | K006 |
| K008 | Implement email/webhook alerts | P3 | [ ] | - | icip-data-pipeline | K006 |

## Section L: Skills & Agents (L001-L099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| L001 | Create `data-scout` skill | P1 | [ ] | - | openclaw-skills | - |
| L002 | Create `doc-analyzer` skill | P1 | [ ] | - | openclaw-skills | - |
| L003 | Create `network-mapper` skill | P1 | [ ] | - | openclaw-skills | - |
| L004 | Create `political-analyst` skill | P1 | [ ] | - | openclaw-skills | - |
| L005 | Create `media-tracker` skill | P1 | [ ] | - | openclaw-skills | - |
| L006 | Create `frontend-dev` skill | P1 | [ ] | - | openclaw-skills | - |
| L007 | Create `backend-dev` skill | P1 | [ ] | - | openclaw-skills | - |
| L008 | Write skill documentation | P2 | [ ] | - | openclaw-skills | L001-L007 |
| L009 | Create agent coordination protocol | P2 | [ ] | - | icip-docs | L001-L007 |
| L010 | Set up agent task queue | P2 | [ ] | - | icip-data-pipeline | L009 |

## Section M: Testing & QA (M001-M099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| M001 | Set up unit testing (Vitest) | P2 | [ ] | - | india-corporate-intelligence | C001 |
| M002 | Add component tests (React Testing Library) | P2 | [ ] | - | india-corporate-intelligence | M001 |
| M003 | Add E2E tests (Playwright) | P2 | [ ] | - | india-corporate-intelligence | M002 |
| M004 | Data accuracy validation pipeline | P1 | [ ] | - | icip-data-pipeline | B005 |
| M005 | Cross-reference validation (NSE vs MCA) | P1 | [ ] | - | icip-data-pipeline | M004 |
| M006 | Performance testing (Lighthouse 90+) | P2 | [ ] | - | india-corporate-intelligence | C013 |
| M007 | Mobile device testing | P2 | [ ] | - | india-corporate-intelligence | C013 |
| M008 | Accessibility audit (WCAG 2.1) | P2 | [ ] | - | india-corporate-intelligence | C004-C012 |

## Section N: Documentation & Research (N001-N099)

| ID | Task | Priority | Status | Assignee | Repo | Dependencies |
|----|------|----------|--------|----------|------|-------------|
| N001 | Write API documentation | P2 | [ ] | - | icip-docs | B008 |
| N002 | Write data source documentation | P2 | [ ] | - | icip-docs | F001-H007 |
| N003 | Create user guide | P3 | [ ] | - | icip-docs | C004-C012 |
| N004 | Document legal compliance | P2 | [ ] | - | icip-docs | - |
| N005 | Write methodology papers | P3 | [ ] | - | icip-docs | J001-J008 |
| N006 | Create focus group transcripts | P2 | [ ] | - | icip-docs | - |
| N007 | Write research ethics guidelines | P2 | [ ] | - | icip-docs | - |
| N008 | Document deployment procedures | P2 | [ ] | - | icip-docs | A004 |
| N009 | Write comprehensive README with repo usage | P1 | [x] | @tryclaw | india-corporate-intelligence | - |

---

## Active Tasks Summary

**Completed:** A001-A003, B007, C001-C026, D011-D015, E001, N009
**In Progress:** B001, C013
**Blocked:** -

**Next 5 to start:** F001, G001, H001, D001, I001

---

*Last Updated: 2026-08-11*
*Maintained by: @tryclaw*
