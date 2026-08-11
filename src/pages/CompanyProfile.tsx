import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Building2, MapPin, Users, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';

export default function CompanyProfile() {
  const { id } = useParams<{ id: string }>();
  const { companies, addToWatchlist, removeFromWatchlist, watchlist } = useData();
  
  const company = companies.find(c => c.id === id);
  const isWatched = watchlist.includes(id || '');

  if (!company) {
    return (
      <div className="card-surface p-8 text-center">
        <h2 className="text-xl font-semibold">Company not found</h2>
        <p className="text-text-secondary mt-2">The company you're looking for doesn't exist in our database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-surface p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="heading-editorial text-2xl font-bold">{company.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
                <span>{company.nseSymbol || company.bseCode}</span>
                <span>•</span>
                <span>{company.sector}</span>
                <span>•</span>
                <span>{company.industry}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => isWatched ? removeFromWatchlist(company.id) : addToWatchlist(company.id)}
            className="p-2 rounded-lg bg-bg-elevated border border-border hover:border-accent/30 transition-all"
          >
            {isWatched ? (
              <BookmarkCheck className="w-5 h-5 text-accent" />
            ) : (
              <Bookmark className="w-5 h-5 text-text-muted" />
            )}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {company.marketCap && (
            <div className="bg-bg-elevated p-4 rounded-lg">
              <div className="text-xs text-text-muted mb-1">Market Cap</div>
              <div className="text-lg font-bold text-accent">₹{(company.marketCap / 1000).toFixed(0)}K Cr</div>
            </div>
          )}
          {company.revenue && (
            <div className="bg-bg-elevated p-4 rounded-lg">
              <div className="text-xs text-text-muted mb-1">Revenue</div>
              <div className="text-lg font-bold">₹{(company.revenue / 1000).toFixed(1)}K Cr</div>
            </div>
          )}
          {company.netProfit && (
            <div className="bg-bg-elevated p-4 rounded-lg">
              <div className="text-xs text-text-muted mb-1">Net Profit</div>
              <div className="text-lg font-bold text-sage">₹{company.netProfit.toFixed(0)} Cr</div>
            </div>
          )}
          {company.employeeCount && (
            <div className="bg-bg-elevated p-4 rounded-lg">
              <div className="text-xs text-text-muted mb-1">Employees</div>
              <div className="text-lg font-bold">{company.employeeCount}</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* About */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-surface p-6">
            <h2 className="font-semibold text-lg mb-4">About</h2>
            <p className="text-text-secondary leading-relaxed">{company.about}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <div className="text-xs text-text-muted mb-1">Incorporated</div>
                <div className="text-sm">{company.incorporated}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">Listed On</div>
                <div className="text-sm">{company.exchanges.join(', ')}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">ISIN</div>
                <div className="text-sm">{company.isin}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">Face Value</div>
                <div className="text-sm">₹{company.faceValue}</div>
              </div>
            </div>
          </div>

          {/* Shareholding */}
          {company.promoterHolding && (
            <div className="card-surface p-6">
              <h2 className="font-semibold text-lg mb-4">Shareholding Pattern</h2>
              <div className="space-y-3">
                {company.promoterHolding && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Promoters</span>
                      <span className="font-medium">{company.promoterHolding}%</span>
                    </div>
                    <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${company.promoterHolding}%` }} />
                    </div>
                  </div>
                )}
                {company.fiiHolding && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>FIIs</span>
                      <span className="font-medium">{company.fiiHolding}%</span>
                    </div>
                    <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-sage rounded-full" style={{ width: `${company.fiiHolding}%` }} />
                    </div>
                  </div>
                )}
                {company.diiHolding && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>DIIs</span>
                      <span className="font-medium">{company.diiHolding}%</span>
                    </div>
                    <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-amber rounded-full" style={{ width: `${company.diiHolding}%` }} />
                    </div>
                  </div>
                )}
                {company.publicHolding && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Public</span>
                      <span className="font-medium">{company.publicHolding}%</span>
                    </div>
                    <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-purple rounded-full" style={{ width: `${company.publicHolding}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location */}
          <div className="card-surface p-6">
            <h3 className="font-semibold mb-4">Headquarters</h3>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <div className="font-medium">{company.hqLocation.city}</div>
                <div className="text-sm text-text-muted">{company.hqLocation.state}</div>
              </div>
            </div>
            
            {company.otherLocations && company.otherLocations.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Other Locations</h4>
                <div className="space-y-2">
                  {company.otherLocations.map((loc, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3 text-text-muted" />
                      <span>{loc.city}, {loc.state}</span>
                      <span className="text-xs text-text-muted capitalize">({loc.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Directors */}
          {company.directors && company.directors.length > 0 && (
            <div className="card-surface p-6">
              <h3 className="font-semibold mb-4">Key People</h3>
              <div className="space-y-3">
                {company.directors.map((director, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-sage" />
                    </div>
                    <span className="text-sm">{director}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {company.tags && company.tags.length > 0 && (
            <div className="card-surface p-6">
              <h3 className="font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {company.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-bg-elevated rounded-full text-xs text-text-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="card-surface p-6">
            <h3 className="font-semibold mb-4">Links</h3>
            {company.website && (
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-accent hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Official Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
