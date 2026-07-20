import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import IncidentTimeline from './pages/IncidentTimeline';
import Hospitals from './pages/Hospitals';
import Volunteers from './pages/Volunteers';
import Resources from './pages/Resources';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Login from './pages/Login';

function Shell() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/map" element={<LiveMap />} />
        <Route path="/incidents" element={<IncidentTimeline />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/alerts" element={<Alerts />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Shell />} />
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}
