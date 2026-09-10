import { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { Panel, StatCard } from '../components/Panel';
import { useData } from '../context/DataContext';

const SEV_COLORS: Record<string, string> = {
  LOW:      '#d1d5db',
  MODERATE: '#fbbf24',
  HIGH:     '#ef4444',
  CRITICAL: '#dc2626',
};

const RESOURCE_COLORS: Record<string, string> = {
  AVAILABLE: '#16a34a',
  DISPATCHED: '#2563eb',
  ON_SITE: '#dc2626',
  RETURNING: '#d97706',
  OUT_OF_SERVICE: '#6b7280',
};

const TOOLTIP_STYLE = {
  background: '#ffffff',
  border: '1px solid #fecdd3',
  borderRadius: 8,
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 12,
  color: '#1a1a1a',
  boxShadow: '0 4px 12px rgba(220,38,38,0.1)',
};

export default function Analytics() {
  const { incidents, resources, alerts } = useData();

  // Severity breakdown
  const severityData = useMemo(() => {
    const counts: Record<string, number> = { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 };
    incidents.forEach((i) => { if (i.severityLevel) counts[i.severityLevel]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [incidents]);

  // Incident type breakdown
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach((i) => {
      const t = i.type ?? 'UNKNOWN';
      counts[t] = (counts[t] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([type, count]) => ({ type: type.replace(/_/g, ' '), count }))
      .sort((a, b) => b.count - a.count);
  }, [incidents]);

  // Incidents by hour of day (from real reportedAt timestamps)
  const hourlyData = useMemo(() => {
    const counts = Array.from({ length: 24 }, (_, i) => ({ hour: `${String(i).padStart(2, '0')}:00`, count: 0 }));
    incidents.forEach((i) => {
      const h = new Date(i.reportedAt).getHours();
      counts[h].count++;
    });
    // Show only every 2 hours for readability
    return counts.filter((_, i) => i % 2 === 0);
  }, [incidents]);

  // Resource status donut
  const resourceStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.forEach((r) => { counts[r.status] = (counts[r.status] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [resources]);

  // Alert channel breakdown (radar)
  const alertChannelData = useMemo(() => {
    const counts: Record<string, number> = { SMS: 0, PUSH_NOTIFICATION: 0, APP_BANNER: 0, EMAIL: 0, PUBLIC_ANNOUNCEMENT: 0 };
    alerts.forEach((a) => { if (counts[a.channel] !== undefined) counts[a.channel]++; });
    return Object.entries(counts).map(([subject, A]) => ({ subject: subject.replace(/_/g, ' '), A }));
  }, [alerts]);

  // Severity confidence scatter (bar chart)
  const confidenceData = useMemo(() => {
    const bins = { LOW: [] as number[], MODERATE: [] as number[], HIGH: [] as number[], CRITICAL: [] as number[] };
    incidents.forEach((i) => {
      if (i.severityLevel && i.verificationConfidence) {
        bins[i.severityLevel].push(i.verificationConfidence);
      }
    });
    return Object.entries(bins).map(([level, vals]) => ({
      level,
      avg: vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) : 0,
      count: vals.length,
    }));
  }, [incidents]);

  const utilization = resources.length
    ? Math.round((resources.filter((r) => r.status === 'DISPATCHED' || r.status === 'ON_SITE').length / resources.length) * 100)
    : 0;

  const criticalCount = incidents.filter((i) => i.severityLevel === 'CRITICAL').length;
  const avgConf = incidents.length
    ? Math.round((incidents.reduce((s, i) => s + (i.verificationConfidence ?? 0), 0) / incidents.length) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <div
          className="inline-flex items-center mono-tag text-[11px] uppercase tracking-[0.2em] mb-1 px-3 py-1 rounded-full"
          style={{ color: 'var(--color-signal)', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}
        >
          Live Intelligence · Real Data
        </div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-bone)' }}>
          Analytics
        </h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Incidents Logged"      value={incidents.length} />
        <StatCard label="Critical Incidents"          value={criticalCount} tone="critical" />
        <StatCard label="Resource Utilization"        value={`${utilization}%`} />
        <StatCard label="Avg. AI Confidence"          value={`${avgConf}%`} sub="verification score" />
      </div>

      {/* Row 1: Severity + Type */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Panel eyebrow="Distribution" title="Severity Breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {severityData.map((d) => (
                  <Cell key={d.name} fill={SEV_COLORS[d.name]} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: '#6b7280', fontFamily: 'JetBrains Mono', fontSize: 11 }}>{value}</span>
                )}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </Panel>

        <Panel eyebrow="Volume" title="Incidents by Type" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={typeData}>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="type"
                tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(220,38,38,0.05)' }} />
              <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Row 2: Hourly + Resource Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Panel eyebrow="Temporal" title="Incidents by Hour of Day" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#dc2626" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="count" name="Incidents" stroke="#dc2626" fill="url(#hourGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel eyebrow="Fleet" title="Resource Status">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={resourceStatusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {resourceStatusData.map((d) => (
                  <Cell key={d.name} fill={RESOURCE_COLORS[d.name] ?? '#9ca3af'} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend
                formatter={(v) => <span style={{ color: '#6b7280', fontFamily: 'JetBrains Mono', fontSize: 10 }}>{v.replace(/_/g, ' ')}</span>}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Row 3: Confidence by Severity + Alert Channel Radar */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel eyebrow="Quality" title="AI Confidence by Severity Level">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={confidenceData}>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="level" tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} unit="%" />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Avg. Confidence']} />
              <Bar dataKey="avg" name="Avg Confidence" radius={[4, 4, 0, 0]}>
                {confidenceData.map((d) => (
                  <Cell key={d.level} fill={SEV_COLORS[d.level]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel eyebrow="Comms" title="Alert Channel Coverage">
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={alertChannelData}>
              <PolarGrid stroke="#f0f0f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
              <PolarRadiusAxis tick={{ fill: '#9ca3af', fontSize: 9 }} />
              <Radar name="Broadcasts" dataKey="A" stroke="#dc2626" fill="#dc2626" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}
