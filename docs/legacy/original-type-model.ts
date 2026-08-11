export interface Company {
  id: string;                    // CIN
  name: string;
  isin: string;
  nseSymbol?: string;
  bseCode?: string;
  sector: string;
  industry: string;
  subIndustry?: string;
  marketCap?: number;            // In crores
  faceValue?: number;
  listingDate?: string;
  hqLocation: {
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  otherLocations?: Array<{
    city: string;
    state: string;
    lat: number;
    lng: number;
    type: 'factory' | 'office' | 'warehouse' | 'r&d';
  }>;
  incorporated: string;
  listingStatus: 'listed' | 'delisted' | 'suspended';
  exchanges: ('NSE' | 'BSE')[];
  website?: string;
  about?: string;
  employeeCount?: string;
  
  // Financials (latest year)
  revenue?: number;
  netProfit?: number;
  totalAssets?: number;
  totalDebt?: number;
  equityCapital?: number;
  
  // Shareholding
  promoterHolding?: number;      // Percentage
  publicHolding?: number;
  fiiHolding?: number;
  diiHolding?: number;
  
  // Network
  directors?: string[];
  promoters?: string[];
  subsidiaries?: string[];       // Company IDs
  parentCompany?: string;        // Company ID
  auditors?: string[];
  
  // Documents
  annualReports?: Array<{
    year: number;
    url: string;
    analyzed: boolean;
    summary?: string;
  }>;
  
  // Political
  politicalDonations?: Array<{
    party: string;
    amount: number;
    year: number;
    via: 'electoral_bond' | 'direct' | 'trust';
  }>;
  
  // Media
  mediaCoverage?: Array<{
    outlet: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    count: number;
  }>;
  
  // Flags
  tags?: string[];
  redFlags?: string[];
  
  // Metadata
  lastUpdated: string;
  dataSource: string[];
}

export interface Person {
  id: string;
  name: string;
  din?: string;                  // Director Identification Number
  pan?: string;
  age?: number;
  education?: string[];
  
  // Roles
  currentDirectorships: Array<{
    companyId: string;
    companyName: string;
    designation: string;
    since: string;
  }>;
  pastDirectorships?: Array<{
    companyId: string;
    companyName: string;
    from: string;
    to: string;
  }>;
  
  // Political
  politicalAffiliation?: string;
  politicalDonations?: Array<{
    party: string;
    amount: number;
    year: number;
  }>;
  
  // Media
  mediaMentions?: number;
  
  lastUpdated: string;
}

export interface PoliticalParty {
  id: string;
  name: string;
  abbreviation: string;
  symbol?: string;
  founded?: string;
  ideology?: string[];
  
  // Funding
  totalDonations?: number;
  topDonors?: Array<{
    donorId: string;
    donorName: string;
    amount: number;
    year: number;
  }>;
  
  // Corporate connections
  affiliatedCompanies?: string[];
  
  // MPs/MLAs with business interests
  lawmakersWithBusiness?: Array<{
    personId: string;
    name: string;
    constituency: string;
    businessInterests: string[];
  }>;
}

export interface MediaHouse {
  id: string;
  name: string;
  type: 'tv' | 'print' | 'digital' | 'radio';
  language?: string[];
  
  // Ownership
  owner?: string;
  ownerId?: string;
  parentCompany?: string;
  parentCompanyId?: string;
  
  // Reach
  circulation?: number;
  viewership?: number;
  digitalReach?: number;
  
  // Political leaning
  politicalAlignment?: string;
  
  // Corporate connections
  advertisers?: Array<{
    companyId: string;
    companyName: string;
    estimatedSpend?: number;
  }>;
  
  // Coverage analysis
  coveragePattern?: Array<{
    companyId: string;
    companyName: string;
    sentiment: number;         // -1 to 1
    articleCount: number;
  }>;
}

export interface NetworkEdge {
  id: string;
  source: string;                // Node ID
  target: string;                // Node ID
  type: 'directorship' | 'promoter' | 'subsidiary' | 'auditor' | 
        'political_donation' | 'media_ownership' | 'advertiser' |
        'supply_chain' | 'competitor' | 'partnership';
  strength: number;              // 0-1
  since?: string;
  until?: string;
  metadata?: Record<string, any>;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'company' | 'person' | 'political_party' | 'media_house';
  size: number;
  color: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  data?: Company | Person | PoliticalParty | MediaHouse;
}

export interface MapRegion {
  id: string;                    // State code or district code
  name: string;
  type: 'state' | 'district' | 'city';
  companyCount: number;
  totalMarketCap: number;
  topIndustries: Array<{
    industry: string;
    count: number;
  }>;
  companies: string[];           // Company IDs
  geojson?: any;
}

export interface IndustryCluster {
  id: string;
  name: string;
  sector: string;
  companies: string[];
  totalRevenue: number;
  totalMarketCap: number;
  employeeCount: number;
  geographicSpread: string[];    // States
  concentration: number;         // HHI index
}

export interface FilterState {
  sectors: string[];
  industries: string[];
  states: string[];
  marketCapRange: [number, number];
  listingStatus: ('listed' | 'delisted' | 'suspended')[];
  hasPoliticalConnection: boolean | null;
  hasMediaConnection: boolean | null;
  redFlagsOnly: boolean;
  searchQuery: string;
}

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL';

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'incorporation' | 'listing' | 'ipo' | 'merger' | 'acquisition' |
        'director_change' | 'promoter_change' | 'regulatory_action' |
        'political_donation' | 'credit_rating' | 'earnings';
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  relatedEntities?: string[];
  source?: string;
  url?: string;
}
