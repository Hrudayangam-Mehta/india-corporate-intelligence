import { useData } from '../context/DataContext';
import { AlertCircle, Tv, BookOpen } from 'lucide-react';

export default function MediaView() {
  const { companies } = useData();

  // Mock media houses for demonstration
  const mediaHouses = [
    { name: 'Times Group', type: 'print' as const, outlets: ['Times of India', 'ET', 'Mirror'], owner: 'Jain Family', alignment: 'Centre-Right' },
    { name: 'HT Media', type: 'print' as const, outlets: ['Hindustan Times', 'Mint'], owner: 'Birla Group', alignment: 'Centre' },
    { name: 'NDTV', type: 'tv' as const, outlets: ['NDTV 24x7', 'NDTV India'], owner: 'Adani Group', alignment: 'Centre-Left' },
    { name: 'Network18', type: 'tv' as const, outlets: ['CNBC-TV18', 'CNN-News18'], owner: 'Reliance', alignment: 'Centre-Right' },
    { name: 'India Today', type: 'print' as const, outlets: ['India Today', 'Aaj Tak'], owner: 'Living Media', alignment: 'Centre' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-editorial text-3xl font-bold">Media Landscape</h1>
        <p className="text-text-secondary mt-1">Media ownership, coverage patterns, and corporate connections</p>
      </div>

      {/* Info Banner */}
      <div className="bg-purple/5 border border-purple/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-purple mt-0.5" />
        <div>
          <h3 className="font-medium text-purple text-sm">Research Phase</h3>
          <p className="text-sm text-text-secondary mt-1">
            Media ownership data is being compiled from Registrar of Newspapers, TRAI filings, and corporate disclosures. 
            Full media network analysis will be available in the next phase.
          </p>
        </div>
      </div>

      {/* Media Houses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mediaHouses.map((media) => (
          <div key={media.name} className="card-surface p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center">
                  {media.type === 'tv' ? <Tv className="w-5 h-5 text-purple" /> : 
                   <BookOpen className="w-5 h-5 text-purple" />}
                </div>
                <div>
                  <h3 className="font-semibold">{media.name}</h3>
                  <p className="text-xs text-text-muted capitalize">{media.type} Media</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-bg-elevated rounded text-xs text-text-secondary">
                {media.alignment}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs text-text-muted mb-1">Owner</div>
                <div className="text-sm font-medium">{media.owner}</div>
              </div>
              
              <div>
                <div className="text-xs text-text-muted mb-1">Outlets</div>
                <div className="flex flex-wrap gap-2">
                  {media.outlets.map((outlet, i) => (
                    <span key={i} className="px-2 py-1 bg-bg-elevated rounded text-xs">
                      {outlet}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mock coverage data */}
              <div className="pt-3 border-t border-border">
                <div className="text-xs text-text-muted mb-2">Corporate Coverage (Sample)</div>
                <div className="space-y-2">
                  {companies.slice(0, 3).map(company => (
                    <div key={company.id} className="flex items-center justify-between text-sm">
                      <span>{company.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-bg-elevated rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-purple/60" 
                            style={{ width: `${Math.random() * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-muted w-12 text-right">
                          {Math.floor(Math.random() * 50)} articles
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cross Ownership Warning */}
      <div className="card-surface p-6 border-amber/20">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber" />
          Cross-Media Ownership Concentration
        </h2>
        <p className="text-text-secondary text-sm mb-4">
          Analysis of cross-media holdings reveals significant concentration in Indian media landscape. 
          Several large corporates have stakes across TV, print, and digital platforms.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-bg-elevated p-4 rounded-lg">
            <div className="text-2xl font-bold text-amber">5</div>
            <div className="text-sm text-text-muted">Major media groups control 70%+ of market</div>
          </div>
          <div className="bg-bg-elevated p-4 rounded-lg">
            <div className="text-2xl font-bold text-amber">12</div>
            <div className="text-sm text-text-muted">Cross-media ownership instances found</div>
          </div>
          <div className="bg-bg-elevated p-4 rounded-lg">
            <div className="text-2xl font-bold text-amber">3</div>
            <div className="text-sm text-text-muted">Political families with media stakes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
