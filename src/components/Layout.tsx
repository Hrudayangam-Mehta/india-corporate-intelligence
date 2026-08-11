import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Network, 
  Factory, 
  Landmark, 
  Newspaper, 
  Search, 
  Bookmark, 
  Menu, 
  X,
  Globe,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/map', label: 'Map', icon: Map },
  { path: '/nse-map', label: 'NSE Map', icon: TrendingUp },
  { path: '/bse-map', label: 'BSE Map', icon: TrendingDown },
  { path: '/nifty50', label: 'NIFTY 50', icon: Activity },
  { path: '/network', label: 'Network', icon: Network },
  { path: '/industries', label: 'Industries', icon: Factory },
  { path: '/political', label: 'Political', icon: Landmark },
  { path: '/media', label: 'Media', icon: Newspaper },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/watchlist', label: 'Watchlist', icon: Bookmark },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-bg text-text overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-bg-elevated border-r border-border flex-shrink-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg leading-tight">ICIP</h1>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Intelligence Platform</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active 
                    ? 'bg-accent/10 text-accent border border-accent/20' 
                    : 'text-text-secondary hover:text-text hover:bg-bg-card'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <div className="text-xs text-text-muted">
            <p>3 Companies Loaded</p>
            <p className="mt-1">Sample Data Mode</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-bg-elevated/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" />
            <span className="font-serif font-bold">ICIP</span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-bg-card"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="bg-bg-elevated border-b border-border p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active 
                      ? 'bg-accent/10 text-accent' 
                      : 'text-text-secondary hover:text-text hover:bg-bg-card'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-14">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
