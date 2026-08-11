import { useData } from '../context/DataContext';
import { Factory, MapPin, ArrowUpRight } from 'lucide-react';

export default function IndustryView() {
  const { companies } = useData();

  // Group by sector
  const sectorData = companies.reduce((acc, company) => {
    const sector = company.sector;
    if (!acc[sector]) {
      acc[sector] = {
        companies: [],
        totalMarketCap: 0,
        totalRevenue: 0,
        states: new Set<string>(),
      };
    }
    acc[sector].companies.push(company);
    acc[sector].totalMarketCap += company.marketCap || 0;
    acc[sector].totalRevenue += company.revenue || 0;
    acc[sector].states.add(company.hqLocation.state);
    return acc;
  }, {} as Record<string, { companies: typeof companies; totalMarketCap: number; totalRevenue: number; states: Set<string> }>);

  const sortedSectors = Object.entries(sectorData).sort((a, b) => b[1].totalMarketCap - a[1].totalMarketCap);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-editorial text-3xl font-bold">Industry Analysis</h1>
        <p className="text-text-secondary mt-1">Sector-wise breakdown and concentration analysis</p>
      </div>

      {/* Sector Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedSectors.map(([sector, data]) => (
          <div key={sector} className="card-surface p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Factory className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">{sector}</h3>
                  <p className="text-xs text-text-muted">{data.companies.length} companies</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-text-muted mb-1">Market Cap</div>
                <div className="font-semibold text-sm">₹{(data.totalMarketCap / 1000).toFixed(0)}K Cr</div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">Revenue</div>
                <div className="font-semibold text-sm">₹{(data.totalRevenue / 1000).toFixed(1)}K Cr</div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">States</div>
                <div className="font-semibold text-sm">{data.states.size}</div>
              </div>
            </div>

            {/* Companies in sector */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Top Companies</h4>
              {data.companies
                .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
                .slice(0, 3)
                .map(company => (
                  <div key={company.id} className="flex items-center justify-between p-2 bg-bg-elevated rounded">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-text-muted" />
                      <span className="text-sm">{company.name}</span>
                    </div>
                    <span className="text-xs text-accent">
                      ₹{(company.marketCap || 0 / 1000).toFixed(0)}K Cr
                    </span>
                  </div>
                ))}
            </div>

            {/* Geographic spread */}
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Presence</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(data.states).map(state => (
                  <span key={state} className="px-2 py-1 bg-bg-elevated rounded text-xs text-text-secondary">
                    {state}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="card-surface p-6">
        <h2 className="font-semibold text-lg mb-4">Market Concentration</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-accent">{Object.keys(sectorData).length}</div>
            <div className="text-sm text-text-muted mt-1">Sectors Represented</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-sage">
              {companies.reduce((sum, c) => sum + (c.marketCap || 0), 0) / 1000}K
            </div>
            <div className="text-sm text-text-muted mt-1">Total Market Cap (Cr)</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber">
              {new Set(companies.map(c => c.hqLocation.state)).size}
            </div>
            <div className="text-sm text-text-muted mt-1">States with HQs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
