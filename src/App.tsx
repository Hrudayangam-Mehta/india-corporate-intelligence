import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MapExplorer from './pages/MapExplorer';
import CompanyProfile from './pages/CompanyProfile';
import NetworkView from './pages/NetworkView';
import IndustryView from './pages/IndustryView';
import PoliticalView from './pages/PoliticalView';
import MediaView from './pages/MediaView';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<MapExplorer />} />
            <Route path="/company/:id" element={<CompanyProfile />} />
            <Route path="/network" element={<NetworkView />} />
            <Route path="/industries" element={<IndustryView />} />
            <Route path="/political" element={<PoliticalView />} />
            <Route path="/media" element={<MediaView />} />
            <Route path="/search" element={<Search />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  );
}

export default App;
