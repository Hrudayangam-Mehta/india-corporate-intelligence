import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MapExplorer from './pages/MapExplorer';
import StateProfile from './pages/StateProfile';
import CompanyProfile from './pages/CompanyProfile';
import NetworkView from './pages/NetworkView';
import IndustryView from './pages/IndustryView';
import PoliticalView from './pages/PoliticalView';
import MediaView from './pages/MediaView';
import Search from './pages/Search';
import Watchlist from './pages/Watchlist';
import Patterns from './pages/Patterns';
import EvidenceAudit from './pages/EvidenceAudit';
import BaseRates from './pages/BaseRates';
import Cabinet from './pages/Cabinet';
import Conglomerates from './pages/Conglomerates';
import Atlas from './pages/Atlas';
import Method from './pages/Method';
import Motifs from './pages/Motifs';
import Interlocks from './pages/Interlocks';
import GeoGraph from './pages/GeoGraph';
import Provenance from './pages/Provenance';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<MapExplorer />} />
            <Route path="/states/:code" element={<StateProfile />} />
            <Route path="/company/:id" element={<CompanyProfile />} />
            <Route path="/network" element={<NetworkView />} />
            <Route path="/geograph" element={<GeoGraph />} />
            <Route path="/cabinet" element={<Cabinet />} />
            <Route path="/conglomerates" element={<Conglomerates />} />
            <Route path="/atlas" element={<Atlas />} />
            <Route path="/patterns" element={<Patterns />} />
            <Route path="/evidence" element={<EvidenceAudit />} />
            <Route path="/base-rates" element={<BaseRates />} />
            <Route path="/interlocks" element={<Interlocks />} />
            <Route path="/motifs" element={<Motifs />} />
            <Route path="/provenance" element={<Provenance />} />
            <Route path="/method" element={<Method />} />
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
