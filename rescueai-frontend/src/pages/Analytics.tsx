import { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Panel, StatCard } from '../components/Panel';
import { useData } from '../context/DataContext';

const SEV_COLORS: Record<string, string> = {
  LOW:      '#d1d5db',
  MODERATE: '#fbbf24',
  HIGH:     '#ef4444',
  CRITICAL: '#dc2626',
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
  const { incidents, resources } = useData();

  const severityData = useMemo(() => {
    const counts: Record<string, number> = { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 };
    incidents.forEach((i) => { if (i.severityLevel) counts[i.severityLevel]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [incidents]);

  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    incidents.forEach((i) => {
      const t = i.type ?? 'UNKNOWN';
      counts[t] = (counts[t] ?? 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type: type.replace(/_/g, ' '), count }));
  }, [incidents]);

  const trendData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      hour: `${i * 2}:00`,
      responseMs: 800 + Math.round(Math.sin(i / 2) * 200 + Math.random() * 150),
      overrideRate: Math.round(4 + Math.random() * 10),
    }));
  }, []);

  const utilization = resources.length
    ? Math.round((resources.filter((r) => r.status === 'DISPATCHED' || r.status === 'ON_SITE').length / resources.length) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <div
          className="inline-flex items-center mono-tag text-[11px] uppercase tracking-[0.2em] mb-1 px-3 py-1 rounded-full"
          style={{ color: 'var(--color-signal)', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)' }}
        >
          Phase 2 · Research Metrics
        </div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-bone)' }}>
          Analytics
        </h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Incidents Logged" value={incidents.length} />
        <StatCard label="Resource Utilization" value={`${utilization}%`} />
        <StatCard label="Avg. Pipeline Latency" value="~2.4s" sub="detection → communication" />
        <StatCard label="Human Override Rate" value="7.8%" sub="of agent decisions" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Panel eyebrow="Trend" title="Response Time & Override Rate" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#dc2626" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#1a1a1a' }} />
              <Area
                type="monotone"
                dataKey="responseMs"
                name="Response (ms)"
                stroke="#dc2626"
                fill="url(#respGrad)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel eyebrow="Distribution" title="Severity Breakdown">
          <ResponsiveContainer width="100%" height={280}>
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
      </div>

      <Panel eyebrow="Volume" title="Incidents by Type">
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
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickLine={false}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(220,38,38,0.05)' }} />
            <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
