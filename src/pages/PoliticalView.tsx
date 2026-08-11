import { useData } from '../context/DataContext';
import { Landmark, AlertCircle, TrendingUp, Users } from 'lucide-react';

export default function PoliticalView() {
  const { companies } = useData();

  // Companies with political donations
  const companiesWithDonations = companies.filter(c => c.politicalDonations && c.politicalDonations.length > 0);
  
  // Aggregate donations by party
  const partyDonations = companies.reduce((acc, company) => {
    company.politicalDonations?.forEach(donation => {
      if (!acc[donation.party]) {
        acc[donation.party] = { total: 0, count: 0, companies: [] };
      }
      acc[donation.party].total += donation.amount;
      acc[donation.party].count += 1;
      if (!acc[donation.party].companies.includes(company.name)) {
        acc[donation.party].companies.push(company.name);
      }
    });
    return acc;
  }, {} as Record<string, { total: number; count: number; companies: string[] }>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-editorial text-3xl font-bold">Political Connections</h1>
        <p className="text-text-secondary mt-1">Corporate donations, political affiliations, and influence networks</p>
      </div>

      {/* Info Banner */}
      <div className="bg-amber/5 border border-amber/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber mt-0.5" />
        <div>
          <h3 className="font-medium text-amber text-sm">Data Source Note</h3>
          <p className="text-sm text-text-secondary mt-1">
            Political donation data is sourced from Election Commission disclosures and electoral bond records. 
            Full coverage will be available when the data pipeline is complete.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-surface p-4 border-rose/20">
          <Landmark className="w-5 h-5 text-rose mb-2" />
          <div className="text-2xl font-bold">{companiesWithDonations.length}</div>
          <div className="text-xs text-text-muted">Companies with donations</div>
        </div>
        <div className="card-surface p-4 border-accent/20">
          <TrendingUp className="w-5 h-5 text-accent mb-2" />
          <div className="text-2xl font-bold">
            ₹{(Object.values(partyDonations).reduce((sum, p) => sum + p.total, 0) / 100).toFixed(0)}Cr
          </div>
          <div className="text-xs text-text-muted">Total donations tracked</div>
        </div>
        <div className="card-surface p-4 border-purple/20">
          <Users className="w-5 h-5 text-purple mb-2" />
          <div className="text-2xl font-bold">{Object.keys(partyDonations).length}</div>
          <div className="text-xs text-text-muted">Political parties</div>
        </div>
        <div className="card-surface p-4 border-sage/20">
          <TrendingUp className="w-5 h-5 text-sage mb-2" />
          <div className="text-2xl font-bold">
            {Object.values(partyDonations).reduce((sum, p) => sum + p.count, 0)}
          </div>
          <div className="text-xs text-text-muted">Total donations</div>
        </div>
      </div>

      {/* Party Breakdown */}
      {Object.keys(partyDonations).length > 0 ? (
        <div className="card-surface p-6">
          <h2 className="font-semibold text-lg mb-4">Donations by Party</h2>
          <div className="space-y-4">
            {Object.entries(partyDonations)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([party, data]) => (
                <div key={party} className="p-4 bg-bg-elevated rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{party}</h3>
                    <span className="text-accent font-semibold">₹{(data.total / 100).toFixed(0)} Cr</span>
                  </div>
                  <div className="text-xs text-text-muted mb-3">
                    {data.count} donations from {data.companies.length} companies
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.companies.slice(0, 5).map((company, i) => (
                      <span key={i} className="px-2 py-1 bg-bg-card rounded text-xs">
                        {company}
                      </span>
                    ))}
                    {data.companies.length > 5 && (
                      <span className="px-2 py-1 bg-bg-card rounded text-xs text-text-muted">
                        +{data.companies.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="card-surface p-8 text-center">
          <Landmark className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No Political Data Yet</h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            Political connection data will be populated once the data pipeline is established. 
            This will include electoral bonds, direct donations, and political party affiliations.
          </p>
        </div>
      )}

      {/* Company Donation List */}
      {companiesWithDonations.length > 0 && (
        <div className="card-surface p-6">
          <h2 className="font-semibold text-lg mb-4">Company Donations</h2>
          <div className="space-y-2">
            {companiesWithDonations.map(company => (
              <div key={company.id} className="flex items-center justify-between p-3 bg-bg-elevated rounded-lg">
                <div>
                  <div className="font-medium text-sm">{company.name}</div>
                  <div className="text-xs text-text-muted">{company.sector} • {company.industry}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-rose">
                    ₹{(company.politicalDonations?.reduce((sum, d) => sum + d.amount, 0) || 0 / 100).toFixed(0)} Cr
                  </div>
                  <div className="text-xs text-text-muted">
                    {company.politicalDonations?.length} donations
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
