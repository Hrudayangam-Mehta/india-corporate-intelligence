import React, { useState, useMemo } from 'react';
import { MapPin, Building2, TrendingDown, BarChart3, Filter } from 'lucide-react';
import { IndiaMap } from '../components/IndiaMap';
import type { Company } from '../types';

interface BSECompany {
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

// BSE sample data (30 companies - different from NSE to show variety)
const BSE_COMPANIES: BSECompany[] = [
  { id: 'b1', name: 'Bajaj Auto', symbol: 'BAJAJ-AUTO', sector: 'Consumer', industry: 'Automobiles', marketCap: 100000, hqLat: 18.5204, hqLng: 73.8567, hqState: 'Maharashtra', hqCity: 'Pune' },
  { id: 'b2', name: 'Tata Power', symbol: 'TATAPOWER', sector: 'Utilities', industry: 'Power', marketCap: 80000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: 'b3', name: 'Bank of Baroda', symbol: 'BANKBARODA', sector: 'Financials', industry: 'Banking', marketCap: 75000, hqLat: 22.3072, hqLng: 73.1812, hqState: 'Gujarat', hqCity: 'Vadodara' },
  { id: 'b4', name: 'Canara Bank', symbol: 'CANBK', sector: 'Financials', industry: 'Banking', marketCap: 70000, hqLat: 12.9716, hqLng: 77.5946, hqState: 'Karnataka', hqCity: 'Bangalore' },
  { id: 'b5', name: 'Indian Oil Corp', symbol: 'IOC', sector: 'Energy', industry: 'Oil & Gas', marketCap: 130000, hqLat: 28.6139, hqLng: 77.2090, hqState: 'Delhi', hqCity: 'New Delhi' },
  { id: 'b6', name: 'ONGC', symbol: 'ONGC', sector: 'Energy', industry: 'Oil & Gas', marketCap: 200000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: 'b7', name: 'GAIL India', symbol: 'GAIL', sector: 'Energy', industry: 'Natural Gas', marketCap: 60000, hqLat: 28.6139, hqLng: 77.2090, hqState: 'Delhi', hqCity: 'New Delhi' },
  { id: 'b8', name: 'PNB', symbol: 'PNB', sector: 'Financials', industry: 'Banking', marketCap: 55000, hqLat: 28.6139, hqLng: 77.2090, hqState: 'Delhi', hqCity: 'New Delhi' },
  { id: 'b9', name: 'Union Bank', symbol: 'UNIONBANK', sector: 'Financials', industry: 'Banking', marketCap: 45000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: 'b10', name: 'IDFC First Bank', symbol: 'IDFCFIRSTB', sector: 'Financials', industry: 'Banking', marketCap: 35000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: 'b11', name: 'Exide Industries', symbol: 'EXIDEIND', sector: 'Consumer', industry: 'Auto Components', marketCap: 25000, hqLat: 22.5726, hqLng: 88.3639, hqState: 'West Bengal', hqCity: 'Kolkata' },
  { id: 'b12', name: 'MRF', symbol: 'MRF', sector: 'Consumer', industry: 'Auto Components', marketCap: 22000, hqLat: 13.0827, hqLng: 80.2707, hqState: 'Tamil Nadu', hqCity: 'Chennai' },
  { id: 'b13', name: 'TVS Motor', symbol: 'TVSMOTOR', sector: 'Consumer', industry: 'Automobiles', marketCap: 40000, hqLat: 13.0827, hqLng: 80.2707, hqState: 'Tamil Nadu', hqCity: 'Chennai' },
  { id: 'b14', name: 'Ashok Leyland', symbol: 'ASHOKLEY', sector: 'Consumer', industry: 'Automobiles', marketCap: 28000, hqLat: 13.0827, hqLng: 80.2707, hqState: 'Tamil Nadu', hqCity: 'Chennai' },
  { id: 'b15', name: 'Bosch India', symbol: 'BOSCHLTD', sector: 'Consumer', industry: 'Auto Components', marketCap: 32000, hqLat: 12.9716, hqLng: 77.5946, hqState: 'Karnataka', hqCity: 'Bangalore' },
  { id: 'b16', name: 'Amara Raja', symbol: 'AMARAJABAT', sector: 'Consumer', industry: 'Auto Components', marketCap: 18000, hqLat: 17.4065, hqLng: 78.4772, hqState: 'Telangana', hqCity: 'Hyderabad' },
  { id: 'b17', name: 'Page Industries', symbol: 'PAGEIND', sector: 'Consumer', industry: 'Textiles', marketCap: 15000, hqLat: 12.9716, hqLng: 77.5946, hqState: 'Karnataka', hqCity: 'Bangalore' },
  { id: 'b18', name: 'Berger Paints', symbol: 'BERGEPAINT', sector: 'Materials', industry: 'Paints', marketCap: 42000, hqLat: 22.5726, hqLng: 88.3639, hqState: 'West Bengal', hqCity: 'Kolkata' },
  { id: 'b19', name: 'Pidilite Industries', symbol: 'PIDILITIND', sector: 'Materials', industry: 'Adhesives', marketCap: 38000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: 'b20', name: 'ACC', symbol: 'ACC', sector: 'Materials', industry: 'Cement', marketCap: 28000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: 'b21', name: 'Ambuja Cements', symbol: 'AMBUJACEM', sector: 'Materials', industry: 'Cement', marketCap: 35000, hqLat: 22.3072, hqLng: 73.1812, hqState: 'Gujarat', hqCity: 'Ahmedabad' },
  { id: 'b22', name: 'Torrent Power', symbol: 'TORNTPOWER', sector: 'Utilities', industry: 'Power', marketCap: 30000, hqLat: 22.3072, hqLng: 73.1812, hqState: 'Gujarat', hqCity: 'Ahmedabad' },
  { id: 'b23', name: 'Adani Green', symbol: 'ADANIGREEN', sector: 'Utilities', industry: 'Renewable Energy', marketCap: 90000, hqLat: 22.3072, hqLng: 73.1812, hqState: 'Gujarat', hqCity: 'Ahmedabad' },
  { id: 'b24', name: 'Adani Transmission', symbol: 'ADANITRANS', sector: 'Utilities', industry: 'Power Transmission', marketCap: 55000, hqLat: 22.3072, hqLng: 73.1812, hqState: 'Gujarat', hqCity: 'Ahmedabad' },
  { id: 'b25', name: 'Lupin', symbol: 'LUPIN', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: 32000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: 'b26', name: 'Biocon', symbol: 'BIOCON', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: 25000, hqLat: 12.9716, hqLng: 77.5946, hqState: 'Karnataka', hqCity: 'Bangalore' },
  { id: 'b27', name: 'Aurobindo Pharma', symbol: 'AUROPHARMA', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: 28000, hqLat: 17.4065, hqLng: 78.4772, hqState: 'Telangana', hqCity: 'Hyderabad' },
  { id: 'b28', name: 'Alkem Labs', symbol: 'ALKEM', sector: 'Healthcare', industry: 'Pharmaceuticals', marketCap: 22000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: 'b29', name: 'Colgate Palmolive', symbol: 'COLPAL', sector: 'Consumer', industry: 'FMCG', marketCap: 35000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
  { id: 'b30', name: 'Procter & Gamble', symbol: 'PGHH', sector: 'Consumer', industry: 'FMCG', marketCap: 30000, hqLat: 19.0760, hqLng: 72.8777, hqState: 'Maharashtra', hqCity: 'Mumbai' },
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

function toCompany(c: BSECompany): Company {
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
    exchanges: ['BSE'],
    lastUpdated: '',
    dataSource: [],
  };
}

export const BSEMapPage: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const sectors = useMemo(() => {
    const s = new Set(BSE_COMPANIES.map(c => c.sector));
    return ['all', ...Array.from(s).sort()];
  }, []);

  const filteredCompanies = useMemo(() => {
    if (selectedSector === 'all') return BSE_COMPANIES;
    return BSE_COMPANIES.filter(c => c.sector === selectedSector);
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
              <TrendingDown className="w-8 h-8 text-[#c9a86c]" />
              BSE Listed Companies Map
            </h1>
            <p className="text-[#9c9588] mt-1">
              {BSE_COMPANIES.length} companies mapped across India • Market Cap weighted visualization
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#c9a86c]">
              ₹{(BSE_COMPANIES.reduce((s, c) => s + c.marketCap, 0) / 100000).toFixed(1)}T
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
          All {filteredCompanies.length} BSE Companies
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

export default BSEMapPage;
