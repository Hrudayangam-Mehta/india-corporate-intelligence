import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Search, Building2, Users, X, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SearchPage() {
  const { companies, persons } = useData();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'companies' | 'persons'>('all');

  const results = useMemo(() => {
    if (!query.trim()) return { companies: [], persons: [] };
    
    const lowerQuery = query.toLowerCase();
    
    const filteredCompanies = filterType === 'all' || filterType === 'companies'
      ? companies.filter(c => 
          c.name.toLowerCase().includes(lowerQuery) ||
          c.nseSymbol?.toLowerCase().includes(lowerQuery) ||
          c.sector.toLowerCase().includes(lowerQuery) ||
          c.industry.toLowerCase().includes(lowerQuery) ||
          c.hqLocation.city.toLowerCase().includes(lowerQuery)
        )
      : [];
    
    const filteredPersons = filterType === 'all' || filterType === 'persons'
      ? persons.filter(p => 
          p.name.toLowerCase().includes(lowerQuery)
        )
      : [];
    
    return { companies: filteredCompanies, persons: filteredPersons };
  }, [query, companies, persons, filterType]);

  const hasResults = results.companies.length > 0 || results.persons.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-editorial text-3xl font-bold">Search</h1>
        <p className="text-text-secondary mt-1">Search companies, persons, sectors, and locations</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by company name, symbol, sector, or person..."
          className="input-field pl-12 pr-12 py-4 text-lg"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X className="w-5 h-5 text-text-muted hover:text-text" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-text-muted" />
        {(['all', 'companies', 'persons'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterType === type 
                ? 'bg-accent/20 text-accent border border-accent/30' 
                : 'bg-bg-card text-text-secondary border border-border'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Results */}
      {query.trim() ? (
        hasResults ? (
          <div className="space-y-6">
            {/* Companies */}
            {results.companies.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                  Companies ({results.companies.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {results.companies.map(company => (
                    <Link
                      key={company.id}
                      to={`/company/${company.id}`}
                      className="card-surface p-4 hover:border-accent/30 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-accent" />
                          </div>
                          <div>
                            <h3 className="font-medium">{company.name}</h3>
                            <p className="text-xs text-text-muted">
                              {company.nseSymbol} • {company.sector} • {company.industry}
                            </p>
                          </div>
                        </div>
                        {company.marketCap && (
                          <span className="text-sm text-accent">
                            ₹{(company.marketCap / 1000).toFixed(0)}K Cr
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                        <span>{company.hqLocation.city}, {company.hqLocation.state}</span>
                        <span>{company.exchanges.join('/')}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Persons */}
            {results.persons.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                  Persons ({results.persons.length})
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {results.persons.map(person => (
                    <div key={person.id} className="card-surface p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-sage" />
                        </div>
                        <div>
                          <h3 className="font-medium">{person.name}</h3>
                          <p className="text-xs text-text-muted">
                            {person.currentDirectorships.length} directorships
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        {person.currentDirectorships.slice(0, 3).map((dir, i) => (
                          <div key={i} className="text-xs text-text-secondary">
                            {dir.designation} at {dir.companyName}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card-surface p-8 text-center">
            <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h2 className="text-lg font-semibold">No results found</h2>
            <p className="text-text-secondary text-sm mt-2">
              Try searching with different keywords or check your spelling.
            </p>
          </div>
        )
      ) : (
        <div className="card-surface p-8 text-center">
          <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Start Searching</h2>
          <p className="text-text-secondary text-sm mt-2 max-w-md mx-auto">
            Search for companies by name, NSE/BSE symbol, sector, or location. 
            You can also search for directors and key personnel.
          </p>
        </div>
      )}
    </div>
  );
}
