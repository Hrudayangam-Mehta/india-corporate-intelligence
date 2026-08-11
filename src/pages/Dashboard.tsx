import { useData } from '../context/DataContext';
import { TrendingUp, Building2, Users, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
  const { companies, persons, edges } = useData();

  const totalMarketCap = companies.reduce((sum, c) => sum + (c.marketCap || 0), 0);
  const avgPromoterHolding = companies.length > 0
    ? companies.reduce((sum, c) => sum + (c.promoterHolding || 0), 0) / companies.length
    : 0;

  const stats = [
    { label: 'Companies Tracked', value: companies.length.toString(), icon: Building2, color: 'accent' as const },
    { label: 'Key Persons', value: persons.length.toString(), icon: Users, color: 'sage' as const },
    { label: 'Network Connections', value: edges.length.toString(), icon: TrendingUp, color: 'amber' as const },
    { label: 'Total Market Cap', value: `₹${(totalMarketCap / 100000).toFixed(1)}L Cr`, icon: TrendingUp, color: 'purple' as const },
  ];

  const colorMap = {
    accent: 'bg-accent/10 text-accent border-accent/20',
    sage: 'bg-sage/10 text-sage border-sage/20',
    amber: 'bg-amber/10 text-amber border-amber/20',
    purple: 'bg-purple/10 text-purple border-purple/20',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="heading-editorial text-3xl font-bold">India Corporate Intelligence</h1>
        <p className="text-text-secondary mt-2">
          Mapping every company, connection, and influence in Indian business
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`card-surface p-5 border ${colorMap[stat.color]}`}>
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 opacity-50" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-text-muted mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface p-6">
          <h2 className="font-semibold text-lg mb-4">Explore by Category</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Map Explorer', desc: 'Geographic distribution', path: '/map', icon: '🗺️' },
              { label: 'Network Graph', desc: 'Corporate connections', path: '/network', icon: '🕸️' },
              { label: 'Industries', desc: 'Sector analysis', path: '/industries', icon: '🏭' },
              { label: 'Political', desc: 'Donation & influence', path: '/political', icon: '🏛️' },
            ].map((item) => (
              <a
                key={item.path}
                href={`#${item.path}`}
                className="p-4 bg-bg-elevated rounded-lg border border-border hover:border-accent/30 transition-all group"
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-medium group-hover:text-accent transition-colors">{item.label}</div>
                <div className="text-xs text-text-muted mt-1">{item.desc}</div>
              </a>
            ))}
          </div>
        </div>

        <div className="card-surface p-6">
          <h2 className="font-semibold text-lg mb-4">Top Companies by Market Cap</h2>
          <div className="space-y-3">
            {companies
              .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
              .slice(0, 5)
              .map((company) => (
                <div key={company.id} className="flex items-center justify-between p-3 bg-bg-elevated rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{company.name}</div>
                    <div className="text-xs text-text-muted">{company.sector} • {company.industry}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">₹{((company.marketCap || 0) / 1000).toFixed(0)}K Cr</div>
                    <div className="text-xs text-text-muted">{company.hqLocation.city}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Data Preview */}
      <div className="card-surface p-6">
        <h2 className="font-semibold text-lg mb-4">Sample Data Overview</h2>
        <p className="text-text-secondary text-sm mb-4">
          Currently running with sample data. Full data pipeline will populate this with all NSE/BSE listed companies.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-bg-elevated p-4 rounded-lg">
            <div className="text-accent font-bold text-2xl">{companies.length}</div>
            <div className="text-sm text-text-muted">Companies in database</div>
            <div className="text-xs text-text-muted mt-2">Target: 5,000+</div>
          </div>
          <div className="bg-bg-elevated p-4 rounded-lg">
            <div className="text-sage font-bold text-2xl">{avgPromoterHolding.toFixed(1)}%</div>
            <div className="text-sm text-text-muted">Avg Promoter Holding</div>
            <div className="text-xs text-text-muted mt-2">Across tracked companies</div>
          </div>
          <div className="bg-bg-elevated p-4 rounded-lg">
            <div className="text-amber font-bold text-2xl">{new Set(companies.flatMap(c => c.directors || [])).size}</div>
            <div className="text-sm text-text-muted">Unique Directors</div>
            <div className="text-xs text-text-muted mt-2">Interlock analysis ready</div>
          </div>
        </div>
      </div>
    </div>
  );
}
