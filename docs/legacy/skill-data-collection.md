# ICIP Data Collection Skill

## Purpose
Scrape and collect corporate data from Indian regulatory sources.

## Data Sources

### NSE (National Stock Exchange)
- URL: https://www.nseindia.com
- Data: Listed companies, market data, corporate filings
- Approach: Official API if available, else structured scraping

### BSE (Bombay Stock Exchange)
- URL: https://www.bseindia.com
- Data: Listed companies, SME listings, historical data

### MCA (Ministry of Corporate Affairs)
- URL: https://www.mca.gov.in
- Data: Company master data, directors, charges
- Note: Requires login for detailed data

### SEBI
- URL: https://www.sebi.gov.in
- Data: Shareholding patterns, mutual funds, FII data

### Election Commission of India
- URL: https://eci.gov.in
- Data: Electoral bonds, political party funding

## Data Schema

### Company Master Record
```typescript
interface Company {
  id: string;              // CIN (Corporate Identification Number)
  name: string;
  isin: string;
  nseSymbol?: string;
  bseCode?: string;
  sector: string;
  industry: string;
  marketCap?: number;
  hqLocation: {
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  incorporated: string;    // Date
  listingStatus: 'listed' | 'delisted' | 'suspended';
  exchanges: ('NSE' | 'BSE')[];
}
```

### Network Relationship
```typescript
interface Relationship {
  id: string;
  sourceId: string;        // Company/Person ID
  targetId: string;        // Company/Person ID
  type: 'director' | 'promoter' | 'subsidiary' | 'auditor' | 'political_donor' | 'media_owner';
  strength: number;        // 0-1
  since?: string;          // Date
  metadata?: Record<string, any>;
}
```

## Scraping Tools
- `playwright` — For JavaScript-heavy sites
- `cheerio` — For static HTML parsing
- `puppeteer` — Alternative for complex flows

## Rate Limiting
- Respect robots.txt
- Max 1 request/second per source
- Use caching (TTL: 24 hours)

## Error Handling
- Retry with exponential backoff (max 3 retries)
- Log failed requests for manual review
- Maintain fallback data sources
