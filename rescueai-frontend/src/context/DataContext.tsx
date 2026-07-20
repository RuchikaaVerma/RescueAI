import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { IncidentResponse, Hospital, Volunteer, ResourceItem, AlertBroadcast } from '../types';
import { IncidentApi, HospitalApi, VolunteerApi, ResourceApi } from '../lib/api';
import { seedIncidents, seedHospitals, seedVolunteers, seedResources, seedAlerts, makeIncident } from '../lib/mock';
import { rescueSocket, type ConnectionState } from '../lib/ws';

interface DataContextValue {
  mode: 'live' | 'demo';
  wsState: ConnectionState;
  incidents: IncidentResponse[];
  hospitals: Hospital[];
  volunteers: Volunteer[];
  resources: ResourceItem[];
  alerts: AlertBroadcast[];
  addIncident: (i: IncidentResponse) => void;
  refresh: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'live' | 'demo'>('demo');
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [alerts, setAlerts] = useState<AlertBroadcast[]>([]);
  const [wsState, setWsState] = useState<ConnectionState>('disconnected');

  async function load() {
    try {
      const [inc, hosp, vol, res] = await Promise.all([
        IncidentApi.list(), HospitalApi.list(), VolunteerApi.available(), ResourceApi.list(),
      ]);
      setIncidents(inc);
      setHospitals(hosp);
      setVolunteers(vol);
      setResources(res);
      setMode('live');
      rescueSocket.connect();
    } catch {
      // Backend not reachable from this environment — run in demo mode with
      // realistic simulated data so the UI/UX can be fully evaluated.
      setIncidents(seedIncidents());
      setHospitals(seedHospitals());
      setVolunteers(seedVolunteers());
      setResources(seedResources());
      setAlerts(seedAlerts());
      setMode('demo');
    }
  }

  useEffect(() => {
    load();
    const off = rescueSocket.onStateChange(setWsState);
    return () => { off(); rescueSocket.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Demo-mode ambient activity: a new incident trickles in periodically so the
  // live map / feed / alerts feel alive without a real backend attached.
  useEffect(() => {
    if (mode !== 'demo') return;
    const t = setInterval(() => {
      setIncidents((prev) => [makeIncident(), ...prev].slice(0, 40));
    }, 14000);
    return () => clearInterval(t);
  }, [mode]);

  const value = useMemo<DataContextValue>(() => ({
    mode,
    wsState: mode === 'demo' ? 'connected' : wsState,
    incidents,
    hospitals,
    volunteers,
    resources,
    alerts,
    addIncident: (i) => setIncidents((prev) => [i, ...prev]),
    refresh: load,
  }), [mode, wsState, incidents, hospitals, volunteers, resources, alerts]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
