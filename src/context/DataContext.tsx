import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Company, Person, PoliticalParty, MediaHouse, NetworkEdge, FilterState, TimelineEvent } from '../types';

interface DataContextType {
  companies: Company[];
  persons: Person[];
  parties: PoliticalParty[];
  mediaHouses: MediaHouse[];
  edges: NetworkEdge[];
  events: TimelineEvent[];
  filter: FilterState;
  setFilter: (filter: FilterState) => void;
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  watchlist: string[];
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

// Sample data for demonstration
const sampleCompanies: Company[] = [
  {
    id: 'L17110MH1973PLC019786',
    name: 'Reliance Industries Ltd',
    isin: 'INE002A01018',
    nseSymbol: 'RELIANCE',
    bseCode: '500325',
    sector: 'Energy',
    industry: 'Oil & Gas',
    subIndustry: 'Refining & Marketing',
    marketCap: 1850000,
    faceValue: 10,
    listingDate: '1977-01-01',
    hqLocation: { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
    otherLocations: [
      { city: 'Jamnagar', state: 'Gujarat', lat: 22.4707, lng: 70.0577, type: 'factory' },
      { city: 'Navi Mumbai', state: 'Maharashtra', lat: 19.033, lng: 73.0297, type: 'office' },
    ],
    incorporated: '1973-05-08',
    listingStatus: 'listed',
    exchanges: ['NSE', 'BSE'],
    website: 'https://www.ril.com',
    about: 'India\'s largest private sector company with interests in energy, petrochemicals, textiles, retail and telecom.',
    employeeCount: '389,000+',
    revenue: 920000,
    netProfit: 73000,
    totalAssets: 1900000,
    totalDebt: 310000,
    equityCapital: 6765,
    promoterHolding: 50.49,
    publicHolding: 49.51,
    fiiHolding: 22.3,
    diiHolding: 18.7,
    directors: ['Mukesh Ambani', 'Nita Ambani', 'Pawan Kumar Kapil'],
    promoters: ['Mukesh Ambani', 'Nita Ambani'],
    subsidiaries: ['Reliance Jio Infocomm', 'Reliance Retail Ventures'],
    auditors: ['Deloitte Haskins & Sells'],
    tags: ['conglomerate', 'energy', 'telecom', 'retail'],
    lastUpdated: '2024-01-01',
    dataSource: ['NSE', 'BSE'],
  },
  {
    id: 'L24240KA1998PLC024488',
    name: 'Tata Consultancy Services Ltd',
    isin: 'INE467B01029',
    nseSymbol: 'TCS',
    bseCode: '532540',
    sector: 'IT',
    industry: 'Software & Services',
    subIndustry: 'IT Consulting',
    marketCap: 1450000,
    faceValue: 1,
    listingDate: '2004-08-25',
    hqLocation: { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
    otherLocations: [
      { city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, type: 'office' },
      { city: 'Hyderabad', state: 'Telangana', lat: 17.4065, lng: 78.4772, type: 'office' },
      { city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, type: 'office' },
    ],
    incorporated: '1995-04-01',
    listingStatus: 'listed',
    exchanges: ['NSE', 'BSE'],
    website: 'https://www.tcs.com',
    about: 'India\'s largest IT services company, part of the Tata Group.',
    employeeCount: '600,000+',
    revenue: 240000,
    netProfit: 46000,
    totalAssets: 180000,
    totalDebt: 0,
    equityCapital: 366,
    promoterHolding: 72.3,
    publicHolding: 27.7,
    fiiHolding: 18.5,
    diiHolding: 6.2,
    directors: ['N Chandrasekaran', 'K Krithivasan', 'Rajesh Gopinathan'],
    promoters: ['Tata Sons Pvt Ltd'],
    subsidiaries: ['TCS Iberoamerica', 'TCS Asia Pacific'],
    auditors: ['BSR & Co LLP'],
    tags: ['it', 'software', 'services', 'tata-group'],
    lastUpdated: '2024-01-01',
    dataSource: ['NSE', 'BSE'],
  },
  {
    id: 'L17120MH1936PLC002378',
    name: 'Hindustan Unilever Ltd',
    isin: 'INE030A01027',
    nseSymbol: 'HINDUNILVR',
    bseCode: '500696',
    sector: 'FMCG',
    industry: 'Personal Products',
    subIndustry: 'Household Products',
    marketCap: 620000,
    faceValue: 1,
    listingDate: '1956-01-01',
    hqLocation: { city: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
    otherLocations: [
      { city: 'Haridwar', state: 'Uttarakhand', lat: 29.9457, lng: 78.1642, type: 'factory' },
      { city: 'Dapada', state: 'Gujarat', lat: 20.0333, lng: 73.0167, type: 'factory' },
    ],
    incorporated: '1933-10-17',
    listingStatus: 'listed',
    exchanges: ['NSE', 'BSE'],
    website: 'https://www.hul.co.in',
    about: 'India\'s largest FMCG company, subsidiary of Unilever PLC.',
    employeeCount: '21,000+',
    revenue: 61000,
    netProfit: 10500,
    totalAssets: 45000,
    totalDebt: 0,
    equityCapital: 235,
    promoterHolding: 61.99,
    publicHolding: 38.01,
    fiiHolding: 12.8,
    diiHolding: 9.5,
    directors: ['Rohit Jawa', 'Sanjiv Mehta'],
    promoters: ['Unilever PLC'],
    subsidiaries: ['Unilever India Exports Ltd'],
    auditors: ['SRBC & Co LLP'],
    tags: ['fmcg', 'consumer', 'unilever'],
    lastUpdated: '2024-01-01',
    dataSource: ['NSE', 'BSE'],
  },
];

const samplePersons: Person[] = [
  {
    id: 'P001',
    name: 'Mukesh Ambani',
    age: 67,
    currentDirectorships: [
      { companyId: 'L17110MH1973PLC019786', companyName: 'Reliance Industries', designation: 'Chairman & MD', since: '2002-01-01' },
    ],
    lastUpdated: '2024-01-01',
  },
  {
    id: 'P002',
    name: 'N Chandrasekaran',
    age: 61,
    currentDirectorships: [
      { companyId: 'L24240KA1998PLC024488', companyName: 'TCS', designation: 'Chairman', since: '2017-02-21' },
    ],
    lastUpdated: '2024-01-01',
  },
];

const sampleEdges: NetworkEdge[] = [
  {
    id: 'E001',
    source: 'P001',
    target: 'L17110MH1973PLC019786',
    type: 'directorship',
    strength: 1,
    since: '2002-01-01',
  },
  {
    id: 'E002',
    source: 'P002',
    target: 'L24240KA1998PLC024488',
    type: 'directorship',
    strength: 1,
    since: '2017-02-21',
  },
];

const defaultFilter: FilterState = {
  sectors: [],
  industries: [],
  states: [],
  marketCapRange: [0, 10000000],
  listingStatus: ['listed'],
  hasPoliticalConnection: null,
  hasMediaConnection: null,
  redFlagsOnly: false,
  searchQuery: '',
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [companies] = useState<Company[]>(sampleCompanies);
  const [persons] = useState<Person[]>(samplePersons);
  const [parties] = useState<PoliticalParty[]>([]);
  const [mediaHouses] = useState<MediaHouse[]>([]);
  const [edges] = useState<NetworkEdge[]>(sampleEdges);
  const [events] = useState<TimelineEvent[]>([]);
  const [filter, setFilter] = useState<FilterState>(defaultFilter);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const addToWatchlist = useCallback((id: string) => {
    setWatchlist(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist(prev => prev.filter(w => w !== id));
  }, []);

  return (
    <DataContext.Provider value={{
      companies, persons, parties, mediaHouses, edges, events,
      filter, setFilter,
      selectedCompany, setSelectedCompany,
      searchQuery, setSearchQuery,
      isLoading,
      watchlist, addToWatchlist, removeFromWatchlist,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
