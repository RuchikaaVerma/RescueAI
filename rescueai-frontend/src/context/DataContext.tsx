import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import type {
  IncidentResponse, Hospital, Volunteer, ResourceItem, AlertBroadcast, AppNotification, GeoPosition,
} from '../types';
import { IncidentApi, HospitalApi, VolunteerApi, ResourceApi } from '../lib/api';
import { seedIncidents, seedHospitals, seedVolunteers, seedResources, seedAlerts, makeIncident } from '../lib/mock';
import { rescueSocket, type ConnectionState } from '../lib/ws';
import { notifyCriticalIncident, getNotificationPermission } from '../lib/notifications';

interface DataContextValue {
  mode: 'live' | 'demo';
  wsState: ConnectionState;
  incidents: IncidentResponse[];
  hospitals: Hospital[];
  volunteers: Volunteer[];
  resources: ResourceItem[];
  alerts: AlertBroadcast[];
  notifications: AppNotification[];
  unreadCount: number;
  myLocation: GeoPosition | null;
  notificationPermission: string;
  addIncident: (i: IncidentResponse) => void;
  addAlert: (a: AlertBroadcast) => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllRead: () => void;
  setMyLocation: (pos: GeoPosition | null) => void;
  refresh: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

let notifSeq = 1;

export function DataProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'live' | 'demo'>('demo');
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [alerts, setAlerts] = useState<AlertBroadcast[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [myLocation, setMyLocation] = useState<GeoPosition | null>(null);
  const [wsState, setWsState] = useState<ConnectionState>('disconnected');
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications((prev) => [
      {
        ...n,
        id: `notif-${notifSeq++}`,
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ].slice(0, 50)); // keep last 50
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

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

    // Update notification permission state on visibility change
    const onVisibility = () => setNotificationPermission(getNotificationPermission());
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      off();
      rescueSocket.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Demo-mode ambient activity: a new incident trickles in periodically so the
  // live map / feed / alerts feel alive without a real backend attached.
  useEffect(() => {
    if (mode !== 'demo') return;
    const t = setInterval(() => {
      const inc = makeIncident();
      setIncidents((prev) => [inc, ...prev].slice(0, 40));

      // Fire a notification + browser push for CRITICAL incidents
      if (inc.severityLevel === 'CRITICAL') {
        addNotification({
          type: 'CRITICAL_INCIDENT',
          title: `🚨 Critical: ${(inc.type ?? 'Incident').replace(/_/g, ' ')}`,
          body: inc.description ?? 'New critical incident detected',
          incidentId: inc.id,
        });
        notifyCriticalIncident(inc.type ?? 'INCIDENT', inc.description ?? 'Unknown area');
      }
    }, 14000);
    return () => clearInterval(t);
  }, [mode, addNotification]);

  const value = useMemo<DataContextValue>(() => ({
    mode,
    wsState: mode === 'demo' ? 'connected' : wsState,
    incidents,
    hospitals,
    volunteers,
    resources,
    alerts,
    notifications,
    unreadCount,
    myLocation,
    notificationPermission,
    addIncident: (i) => {
      setIncidents((prev) => [i, ...prev]);
      if (i.severityLevel === 'CRITICAL') {
        addNotification({
          type: 'CRITICAL_INCIDENT',
          title: `🚨 Critical: ${(i.type ?? 'Incident').replace(/_/g, ' ')}`,
          body: i.description ?? 'New critical incident',
          incidentId: i.id,
        });
      }
    },
    addAlert: (a) => {
      setAlerts((prev) => [a, ...prev]);
      addNotification({
        type: 'ALERT_SENT',
        title: `📢 Alert via ${a.channel}`,
        body: a.content.slice(0, 80),
      });
    },
    addNotification,
    markAllRead,
    setMyLocation,
    refresh: load,
  }), [mode, wsState, incidents, hospitals, volunteers, resources, alerts, notifications, unreadCount, myLocation, notificationPermission, addNotification, markAllRead]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
