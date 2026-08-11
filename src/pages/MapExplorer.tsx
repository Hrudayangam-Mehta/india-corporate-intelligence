import { useState, useMemo } from 'react';
import { MapPin, Building2, TrendingUp, Filter } from 'lucide-react';
import { IndiaMap } from '../components/IndiaMap';
import { ALL_EXCHANGE_COMPANIES, SECTOR_COLORS } from '../data/exchangeData';

type ExchangeFilter = 'all' | 'nse' | 'bse';

export default function MapExplorer() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [exchangeFilter, setExchangeFilter] = useState<ExchangeFilter>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  const companies = ALL_EXCHANGE_COMPANIES;

  const filteredByExchange = useMemo(() => {
    switch (exchangeFilter) {
      case 'nse':
        return companies.filter(c => c.exchanges?.includes('NSE'));
      case 'bse':
        return companies.filter(c => c.exchanges?.includes('BSE'));
      default:
        return companies;
    }
  }, [companies, exchangeFilter]);

  const sectors = useMemo(() => {
    const s = new Set(filteredByExchange.map(c => c.sector));
    return ['all', ...Array.from(s).sort()];
  }, [filteredByExchange]);

  const displayCompanies = useMemo(() => {
    if (sectorFilter === 'all') return filteredByExchange;
    return filteredByExchange.filter(c => c.sector === sectorFilter);
  }, [filteredByExchange, sectorFilter]);

  // State counts
  const stateCounts = useMemo(() => {
    return displayCompanies.reduce((acc, company) => {
      const state = company.hqLocation.state;
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [displayCompanies]);

  const sidebarCompanies = selectedState
    ? displayCompanies.filter(c => c.hqLocation.state === selectedState)
    : displayCompanies;

  const totalMarketCap = displayCompanies.reduce((s, c) => s + (c.marketCap || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="heading-editorial text-3xl font-bold">Map Explorer</h1>
          <p className="text-text-secondary mt-1">
            {displayCompanies.length} companies mapped across India
            {exchangeFilter !== 'all' && ` • ${exchangeFilter.toUpperCase()} only`}
            {sectorFilter !== 'all' && ` • ${sectorFilter}`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[#c9a86c]">
            ₹{(totalMarketCap / 100000).toFixed(1)}T
          </div>
          <div className="text-sm text-[#7a7569]">Total Market Cap</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Exchange Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[#7a7569] text-sm">Exchange:</span>
            {(['all', 'nse', 'bse'] as ExchangeFilter[]).map(ex => (
              <button
                key={ex}
                onClick={() => { setExchangeFilter(ex); setSectorFilter('all'); }}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  exchangeFilter === ex
                    ? 'bg-[#c9a86c] text-[#0c0c0e] font-medium'
                    : 'bg-[#0c0c0e] text-[#9c9588] hover:text-[#f0e6d8] border border-[#f4f0e8]/10'
                }`}
              >
                {ex === 'all' ? 'All' : ex.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Sector Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-[#7a7569]" />
            {sectors.map(sector => (
              <button
                key={sector}
                onClick={() => setSectorFilter(sector)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  sectorFilter === sector
                    ? 'bg-[#c9a86c] text-[#0c0c0e] font-medium'
                    : 'bg-[#0c0c0e] text-[#9c9588] hover:text-[#f0e6d8] border border-[#f4f0e8]/10'
                }`}
              >
                {sector === 'all' ? 'All Sectors' : sector}
              </button>
            ))}
          </div>
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
            companies={displayCompanies}
            selectedState={selectedState}
            onStateClick={setSelectedState}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Companies List */}
          <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-[#c9a86c]" />
              <h3 className="font-semibold text-[#f0e6d8]">
                {selectedState ? `${selectedState} Companies` : 'All Companies'}
              </h3>
              {selectedState && (
                <button
                  onClick={() => setSelectedState(null)}
                  className="ml-auto text-xs text-[#c9a86c] hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {sidebarCompanies.slice(0, 20).map(company => (
                <div key={company.id} className="p-3 bg-[#0c0c0e] rounded-lg">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: SECTOR_COLORS[company.sector] || '#c9a86c' }}
                    />
                    <span className="font-medium text-sm text-[#f0e6d8]">{company.name}</span>
                  </div>
                  <div className="text-xs text-[#7a7569] mt-1 flex items-center gap-2">
                    <Building2 className="w-3 h-3" />
                    {company.hqLocation.city}, {company.hqLocation.state}
                    {company.exchanges && (
                      <span className="text-[#c9a86c]">
                        {company.exchanges.join('/')}
                      </span>
                    )}
                  </div>
                  {company.marketCap && (
                    <div className="text-xs text-[#c9a86c] mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      ₹{(company.marketCap / 1000).toFixed(0)}K Cr
                    </div>
                  )}
                </div>
              ))}
              {sidebarCompanies.length > 20 && (
                <div className="text-center text-[#7a7569] text-sm py-2">
                  +{sidebarCompanies.length - 20} more
                </div>
              )}
            </div>
          </div>

          {/* State Summary */}
          <div className="bg-[#161618] border border-[#f4f0e8]/10 rounded-lg p-4">
            <h3 className="font-semibold text-[#f0e6d8] mb-3">State Summary</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {Object.entries(stateCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([state, count]) => (
                  <div
                    key={state}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                      selectedState === state
                        ? 'bg-[#c9a86c]/10 border border-[#c9a86c]/20'
                        : 'hover:bg-[#1c1c1f]'
                    }`}
                    onClick={() => setSelectedState(selectedState === state ? null : state)}
                  >
                    <span className="text-sm text-[#f0e6d8]">{state}</span>
                    <span className="text-xs bg-[#0c0c0e] px-2 py-1 rounded text-[#9c9588]">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
