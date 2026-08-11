import React, { useState, useMemo } from 'react';
import { MapPin, Building2, TrendingUp, BarChart3, Filter } from 'lucide-react';
import { IndiaMap } from '../components/IndiaMap';
import type { Company } from '../types';

interface NSECompany {
  id: string;
  name: string;
  symbol: string;
  sector: string;
  industry: string;
  marketCap: number;
  hqLat: number;
  hqLng: number;
  hqState: string;
  hqCity: string;
}

// Extended NSE sample data (50 companies)
const NSE_COMPANIES: NSECompany[] = [
  { id: '1', name: 'Reliance Industries', symbol: 'RELIANCE', sector: 'Energy', industry: 'Oil & Gas', marketCap: 1500000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '2', name: 'Tata Consultancy Services', symbol: 'TCS', sector: 'Technology', industry: 'IT Services', marketCap: 1200000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '3', name: 'HDFC Bank', symbol: 'HDFCBANK', sector: 'Financials', industry: 'Banking', marketCap: 900000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '4', name: 'Infosys', symbol: 'INFY', sector: 'Technology', industry: 'IT Services', marketCap: 600000, hqLat: 12.9716, hqLng: 77.5946, hqState: 'Karnataka', hqCity: 'Bangalore' },
  { id: '5', name: 'Hindustan Unilever', symbol: 'HINDUNILVR', sector: 'Consumer', industry: 'FMCG', marketCap: 550000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '6', name: 'ICICI Bank', symbol: 'ICICIBANK', sector: 'Financials', industry: 'Banking', marketCap: 500000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '7', name: 'Bharti Airtel', symbol: 'BHARTIARTL', sector: 'Communication', industry: 'Telecom', marketCap: 450000, hqLat: 28.6139, hqLng: 77.2090, hqState: 'Delhi', hqCity: 'New Delhi' },
  { id: '8', name: 'State Bank of India', symbol: 'SBIN', sector: 'Financials', industry: 'Banking', marketCap: 400000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '9', name: 'Kotak Mahindra Bank', symbol: 'KOTAKBANK', sector: 'Financials', industry: 'Banking', marketCap: 350000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '10', name: 'Larsen & Toubro', symbol: 'LT', sector: 'Industrials', industry: 'Construction', marketCap: 300000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '11', name: 'Asian Paints', symbol: 'ASIANPAINT', sector: 'Materials', industry: 'Paints', marketCap: 250000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '12', name: 'Maruti Suzuki', symbol: 'MARUTI', sector: 'Consumer', industry: 'Automobiles', marketCap: 250000, hqLat: 28.6139, hqLng: 77.2090, hqState: 'Haryana', hqCity: 'Gurugram' },
  { id: '13', name: 'Axis Bank', symbol: 'AXISBANK', sector: 'Financials', industry: 'Banking', marketCap: 240000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '14', name: 'Sun Pharma', symbol: 'SUNPHARMA', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: 230000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '15', name: 'Titan Company', symbol: 'TITAN', sector: 'Consumer', industry: 'Jewelry', marketCap: 220000, hqLat: 12.9716, hqLng: 77.5946, hqState: 'Karnataka', hqCity: 'Bangalore' },
  { id: '16', name: 'Bajaj Finance', symbol: 'BAJFINANCE', sector: 'Financials', industry: 'NBFC', marketCap: 210000, hqLat: 18.5204, hqLng: 73.8567, hqState: 'Maharashtra', hqCity: 'Pune' },
  { id: '17', name: 'HCL Technologies', symbol: 'HCLTECH', sector: 'Technology', industry: 'IT Services', marketCap: 200000, hqLat: 28.6139, hqLng: 77.2090, hqState: 'Uttar Pradesh', hqCity: 'Noida' },
  { id: '18', name: 'Wipro', symbol: 'WIPRO', sector: 'Technology', industry: 'IT Services', marketCap: 190000, hqLat: 12.9716, hqLng: 77.5946, hqState: 'Karnataka', hqCity: 'Bangalore' },
  { id: '19', name: 'UltraTech Cement', symbol: 'ULTRACEMCO', sector: 'Materials', industry: 'Cement', marketCap: 180000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '20', name: 'Adani Ports', symbol: 'ADANIPORTS', sector: 'Industrials', industry: 'Ports', marketCap: 170000, hqLat: 22.3072, hqLng: 73.1812, hqState: 'Gujarat', hqCity: 'Ahmedabad' },
  { id: '21', name: 'Mahindra & Mahindra', symbol: 'M&M', sector: 'Consumer', industry: 'Automobiles', marketCap: 160000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '22', name: 'Nestle India', symbol: 'NESTLEIND', sector: 'Consumer', industry: 'FMCG', marketCap: 150000, hqLat: 28.6139, hqLng: 77.2090, hqState: 'Haryana', hqCity: 'Gurugram' },
  { id: '23', name: 'Power Grid Corp', symbol: 'POWERGRID', sector: 'Utilities', industry: 'Power', marketCap: 140000, hqLat: 28.6139, hqLng: 77.2090, hqState: 'Delhi', hqCity: 'New Delhi' },
  { id: '24', name: 'NTPC', symbol: 'NTPC', sector: 'Utilities', industry: 'Power', marketCap: 135000, hqLat: 28.6139, hqLng: 77.2090, hqState: 'Delhi', hqCity: 'New Delhi' },
  { id: '25', name: 'Coal India', symbol: 'COALINDIA', sector: 'Energy', industry: 'Mining', marketCap: 130000, hqLat: 22.5726, hqLng: 88.3639, hqState: 'West Bengal', hqCity: 'Kolkata' },
  { id: '26', name: 'JSW Steel', symbol: 'JSWSTEEL', sector: 'Materials', industry: 'Steel', marketCap: 125000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '27', name: 'Adani Enterprises', symbol: 'ADANIENT', sector: 'Conglomerate', industry: 'Diversified', marketCap: 120000, hqLat: 22.3072, hqLng: 73.1812, hqState: 'Gujarat', hqCity: 'Ahmedabad' },
  { id: '28', name: 'Grasim Industries', symbol: 'GRASIM', sector: 'Materials', industry: 'Cement/Textiles', marketCap: 115000, hqLat: 22.3072, hqLng: 73.1812, hqState: 'Madhya Pradesh', hqCity: 'Indore' },
  { id: '29', name: 'Tata Motors', symbol: 'TATAMOTORS', sector: 'Consumer', industry: 'Automobiles', marketCap: 110000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '30', name: 'HDFC Life', symbol: 'HDFCLIFE', sector: 'Financials', industry: 'Insurance', marketCap: 105000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '31', name: 'SBI Life Insurance', symbol: 'SBILIFE', sector: 'Financials', industry: 'Insurance', marketCap: 100000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '32', name: 'Bajaj Finserv', symbol: 'BAJAJFINSV', sector: 'Financials', industry: 'Financial Services', marketCap: 95000, hqLat: 18.5204, hqLng: 73.8567, hqState: 'Maharashtra', hqCity: 'Pune' },
  { id: '33', name: 'Tata Steel', symbol: 'TATASTEEL', sector: 'Materials', industry: 'Steel', marketCap: 90000, hqLat: 22.5726, hqLng: 88.3639, hqState: 'West Bengal', hqCity: 'Kolkata' },
  { id: '34', name: 'Tech Mahindra', symbol: 'TECHM', sector: 'Technology', industry: 'IT Services', marketCap: 85000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '35', name: 'IndusInd Bank', symbol: 'INDUSINDBK', sector: 'Financials', industry: 'Banking', marketCap: 80000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '36', name: 'Apollo Hospitals', symbol: 'APOLLOHOSP', sector: 'Healthcare', industry: 'Hospitals', marketCap: 75000, hqLat: 13.0827, hqLng: 80.2707, hqState: 'Tamil Nadu', hqCity: 'Chennai' },
  { id: '37', name: 'Hindustan Zinc', symbol: 'HINDZINC', sector: 'Materials', industry: 'Mining', marketCap: 70000, hqLat: 24.5854, hqLng: 73.7125, hqState: 'Rajasthan', hqCity: 'Udaipur' },
  { id: '38', name: 'Dr Reddys Labs', symbol: 'DRREDDY', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: 65000, hqLat: 17.4065, hqLng: 78.4772, hqState: 'Telangana', hqCity: 'Hyderabad' },
  { id: '39', name: 'Cipla', symbol: 'CIPLA', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: 60000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '40', name: 'Eicher Motors', symbol: 'EICHERMOT', sector: 'Consumer', industry: 'Automobiles', marketCap: 55000, hqLat: 28.6139, hqLng: 77.2090, hqState: 'Delhi', hqCity: 'New Delhi' },
  { id: '41', name: 'Britannia Industries', symbol: 'BRITANNIA', sector: 'Consumer', industry: 'FMCG', marketCap: 50000, hqLat: 12.9716, hqLng: 77.5946, hqState: 'Karnataka', hqCity: 'Bangalore' },
  { id: '42', name: 'Shree Cement', symbol: 'SHREECEM', sector: 'Materials', industry: 'Cement', marketCap: 48000, hqLat: 26.9124, hqLng: 75.7873, hqState: 'Rajasthan', hqCity: 'Jaipur' },
  { id: '43', name: 'Hero MotoCorp', symbol: 'HEROMOTOCO', sector: 'Consumer', industry: 'Automobiles', marketCap: 45000, hqLat: 28.6139, hqLng: 77.2090, hqState: 'Haryana', hqCity: 'Gurugram' },
  { id: '44', name: 'Divis Labs', symbol: 'DIVISLAB', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: 42000, hqLat: 17.4065, hqLng: 78.4772, hqState: 'Telangana', hqCity: 'Hyderabad' },
  { id: '45', name: 'Godrej Consumer', symbol: 'GODREJCP', sector: 'Consumer', industry: 'FMCG', marketCap: 40000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '46', name: 'Dabur India', symbol: 'DABUR', sector: 'Consumer', industry: 'FMCG', marketCap: 38000, hqLat: 28.6139, hqLng: 77.2090, hqState: 'Uttar Pradesh', hqCity: 'Ghaziabad' },
  { id: '47', name: 'BPCL', symbol: 'BPCL', sector: 'Energy', industry: 'Oil & Gas', marketCap: 35000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: '48', name: 'Indigo (InterGlobe)', symbol: 'INDIGO', sector: 'Industrials', industry: 'Airlines', marketCap: 32000, hqLat: 28.6139, hqLng: 77.2090, hqState: 'Haryana', hqCity: 'Gurugram' },
  { id: '49', name: 'Hindalco', symbol: 'HINDALCO', sector: 'Materials', industry: 'Aluminum', marketCap: 30000, hqLat: 22.5726, hqLng: 88.3639, hqState: 'West Bengal', hqCity: 'Kolkata' },
  { id: '50', name: 'Siemens India', symbol: 'SIEMENS', sector: 'Industrials', industry: 'Engineering', marketCap: 28000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
];

const SECTOR_COLORS: Record<string, string> = {
  'Energy': '#ef4444',
  'Technology': '#3b82f6',
  'Financials': '#10b981',
  'Consumer': '#f59e0b',
  'Healthcare': '#ec4899',
  'Industrials': '#8b5cf6',
  'Materials': '#6366f1',
  'Communication': '#14b8a6',
  'Utilities': '#f97316',
  'Conglomerate': '#84cc16',
};

function toCompany(c: NSECompany): Company {
  return {
    id: c.id,
    name: c.name,
    sector: c.sector,
    industry: c.industry,
    marketCap: c.marketCap,
    hqLocation: {
      lat: c.hqLat,
      lng: c.hqLng,
      city: c.hqCity,
      state: c.hqState,
    },
    isin: '',
    nseSymbol: c.symbol,
    bseCode: '',
    incorporated: '',
    listingStatus: 'listed',
    exchanges: ['NSE'],
    lastUpdated: '',
    dataSource: [],
  };
}

export const NSEMapPage: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const sectors = useMemo(() => {
    const s = new Set(NSE_COMPANIES.map(c => c.sector));
    return ['all', ...Array.from(s).sort()];
  }, []);

  const filteredCompanies = useMemo(() => {
    if (selectedSector === 'all') return NSE_COMPANIES;
    return NSE_COMPANIES.filter(c => c.sector === selectedSector);
  }, [selectedSector]);

  const companyObjects = useMemo(() => filteredCompanies.map(toCompany), [filteredCompanies]);

  // State-wise aggregation
  const stateStats = useMemo(() => {
    const stats: Record<string, { count: number; totalMcap: number; companies: string[] }> = {};
    filteredCompanies.forEach(c => {
      if (!stats[c.hqState]) {
        stats[c.hqState] = { count: 0, totalMcap: 0, companies: [] };
      }
      stats[c.hqState].count++;
      stats[c.hqState].totalMcap += c.marketCap;
      stats[c.hqState].companies.push(c.symbol);
    });
    return stats;
  }, [filteredCompanies]);

  // Top states by company count
  const topStates = useMemo(() => {
    return Object.entries(stateStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);
  }, [stateStats]);

  // Sector breakdown
  const sectorBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; totalMcap: number }> = {};
    filteredCompanies.forEach(c => {
      if (!breakdown[c.sector]) {
        breakdown[c.sector] = { count: 0, totalMcap: 0 };
      }
      breakdown[c.sector].count++;
      breakdown[c.sector].totalMcap += c.marketCap;
    });
    return Object.entries(breakdown).sort((a, b) => b[1].totalMcap - a[1].totalMcap);
  }, [filteredCompanies]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#f0e6d8] flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-[#c9a86c]" />
              NSE Listed Companies Map
            </h1>
            <p className="text-[#9c9588] mt-1">
              {NSE_COMPANIES.length} companies mapped across India • Market Cap weighted visualization
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#c9a86c]">
              ₹{(NSE_COMPANIES.reduce((s, c) => s + c.marketCap, 0) / 100000).toFixed(1)}T
            </div>
            <div className="text-sm text-[#7a7569]">Total Market Cap</div>
          </div>
        </div>

        {/* Sector Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-[#7a7569]" />
          {sectors.map(sector => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedSector === sector
                  ? 'bg-[#c9a86c] text-[#0c0c0e] font-medium'
                  : 'bg-[#0c0c0e] text-[#9c9588] hover:text-[#f0e6d8] border border-[#f4f0e8]/10'
              }`}
            >
              {sector === 'all' ? 'All Sectors' : sector}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[#f0e6d8] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#c9a86c]" />
            Geographic Distribution
          </h2>
          <IndiaMap
            companies={companyObjects}
            selectedState={hoveredState}
            onStateClick={setHoveredState}
          />
          <div className="mt-4 flex items-center gap-4 text-sm text-[#7a7569]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#c9a86c]"></div>
              <span>Company HQ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#c9a86c]/30"></div>
              <span>Circle size = Market Cap</span>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Top States */}
          <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#f0e6d8] mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#c9a86c]" />
              Top States by Company Count
            </h3>
            <div className="space-y-3">
              {topStates.map(([state, data], idx) => (
                <div
                  key={state}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#1c1c1f] transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredState(state)}
                  onMouseLeave={() => setHoveredState(null)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#7a7569] w-6">{idx + 1}</span>
                    <span className="text-[#f0e6d8] text-sm">{state}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-[#0c0c0e] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#c9a86c] rounded-full transition-all"
                        style={{ width: `${(data.count / topStates[0][1].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-[#9c9588] text-sm w-8 text-right">{data.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Breakdown */}
          <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-[#f0e6d8] mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#c9a86c]" />
              Sector Breakdown
            </h3>
            <div className="space-y-3">
              {sectorBreakdown.map(([sector, data]) => (
                <div key={sector} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: SECTOR_COLORS[sector] || '#c9a86c' }}
                    />
                    <span className="text-[#f0e6d8] text-sm">{sector}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[#f0e6d8] text-sm font-medium">{data.count}</div>
                    <div className="text-[#7a7569] text-xs">
                      ₹{(data.totalMcap / 100000).toFixed(1)}T
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Company Table */}
      <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[#f0e6d8] mb-4">
          All {filteredCompanies.length} NSE Companies
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f4f0e8]/10">
                <th className="text-left py-3 px-4 text-[#9c9588] text-sm font-medium">Symbol</th>
                <th className="text-left py-3 px-4 text-[#9c9588] text-sm font-medium">Company</th>
                <th className="text-left py-3 px-4 text-[#9c9588] text-sm font-medium">Sector</th>
                <th className="text-left py-3 px-4 text-[#9c9588] text-sm font-medium">Industry</th>
                <th className="text-right py-3 px-4 text-[#9c9588] text-sm font-medium">Market Cap</th>
                <th className="text-left py-3 px-4 text-[#9c9588] text-sm font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr
                  key={company.id}
                  className="border-b border-[#f4f0e8]/5 hover:bg-[#1c1c1f] transition-colors"
                >
                  <td className="py-3 px-4">
                    <span className="text-[#c9a86c] font-mono text-sm">{company.symbol}</span>
                  </td>
                  <td className="py-3 px-4 text-[#f0e6d8] text-sm">{company.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${SECTOR_COLORS[company.sector] || '#c9a86c'}20`,
                        color: SECTOR_COLORS[company.sector] || '#c9a86c',
                      }}
                    >
                      {company.sector}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#9c9588] text-sm">{company.industry}</td>
                  <td className="py-3 px-4 text-right text-[#f0e6d8] text-sm font-medium">
                    ₹{(company.marketCap / 1000).toFixed(0)}K Cr
                  </td>
                  <td className="py-3 px-4 text-[#9c9588] text-sm">
                    {company.hqCity}, {company.hqState}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NSEMapPage;
