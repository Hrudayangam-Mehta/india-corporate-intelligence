import { useData } from '../context/DataContext';
import { Bookmark, BookmarkCheck, Building2, TrendingUp, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Watchlist() {
  const { companies, watchlist, removeFromWatchlist } = useData();

  const watchedCompanies = companies.filter(c => watchlist.includes(c.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-editorial text-3xl font-bold">Watchlist</h1>
        <p className="text-text-secondary mt-1">
          {watchlist.length > 0 
            ? `Tracking ${watchlist.length} companies` 
            : 'Companies you watch will appear here'}
        </p>
      </div>

      {watchedCompanies.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {watchedCompanies.map(company => (
            <div key={company.id} className="card-surface p-5">
              <div className="flex items-start justify-between">
                <Link to={`/company/${company.id}`} className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-xs text-text-muted">
                      {company.nseSymbol} • {company.sector}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => removeFromWatchlist(company.id)}
                  className="p-2 text-text-muted hover:text-rose transition-colors"
                >
                  <BookmarkCheck className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                {company.marketCap && (
                  <div>
                    <div className="text-xs text-text-muted mb-1">Market Cap</div>
                    <div className="font-semibold text-sm">₹{(company.marketCap / 1000).toFixed(0)}K Cr</div>
                  </div>
                )}
                {company.revenue && (
                  <div>
                    <div className="text-xs text-text-muted mb-1">Revenue</div>
                    <div className="font-semibold text-sm">₹{(company.revenue / 1000).toFixed(1)}K Cr</div>
                  </div>
                )}
                <div>
                  <div className="text-xs text-text-muted mb-1">Location</div>
                  <div className="font-semibold text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {company.hqLocation.city}
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {company.industry}
                </span>
                <span>{company.exchanges.join('/')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-surface p-8 text-center">
          <Bookmark className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Your Watchlist is Empty</h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-4">
            Add companies to your watchlist to track their updates, news, and network changes.
          </p>
          <Link 
            to="/search" 
            className="btn-primary inline-flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search Companies
          </Link>
        </div>
      )}
    </div>
  );
}
