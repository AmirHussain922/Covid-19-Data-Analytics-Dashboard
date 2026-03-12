import React, { useEffect, useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

type GlobalTrendResponse = {
  data: Array<{ date: string; new_cases: number }>;
};

type TopCountriesResponse = {
  date: string;
  top_countries: Array<{ country: string; total_cases: number }>;
};

function formatInt(value: number) {
  return new Intl.NumberFormat('en').format(value);
}

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7);
}

export function MainCharts() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
  const [trend, setTrend] = useState<GlobalTrendResponse | null>(null);
  const [top, setTop] = useState<TopCountriesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const [trendRes, topRes] = await Promise.all([
          fetch(`${API_BASE}/api/global-trend`),
          fetch(`${API_BASE}/api/top-countries`),
        ]);

        if (!trendRes.ok) throw new Error(`global-trend ${trendRes.status}`);
        if (!topRes.ok) throw new Error(`top-countries ${topRes.status}`);

        const trendJson = (await trendRes.json()) as GlobalTrendResponse;
        const topJson = (await topRes.json()) as TopCountriesResponse;

        if (!cancelled) {
          setTrend(trendJson);
          setTop(topJson);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load');
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  const timeSeriesData = useMemo(() => {
    const points = trend?.data ?? [];
    const byMonth = new Map<string, number>();
    for (const p of points) {
      const key = monthKey(p.date);
      byMonth.set(key, (byMonth.get(key) ?? 0) + Math.max(0, p.new_cases));
    }
    const rows = Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, cases]) => ({ date, cases }));
    return rows.slice(-12);
  }, [trend]);

  const topCountriesData = useMemo(() => {
    return (top?.top_countries ?? []).map((c) => ({ country: c.country, cases: c.total_cases }));
  }, [top]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Global Time Series</h3>
            <p className="text-sm text-slate-500">Global new cases summed by month</p>
          </div>
          <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600">
            <option>Last 12 Months</option>
            <option>Last 6 Months</option>
            <option>All Time</option>
          </select>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
                formatter={(value: number) => [formatInt(value), 'New cases']}
                labelStyle={{ color: '#64748b' }}
              />
              <Area type="monotone" dataKey="cases" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCases)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {error && <p className="mt-4 text-xs text-rose-500">Failed to load: {error}</p>}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Top 10 Countries</h3>
          <p className="text-sm text-slate-500">By total reported cases</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCountriesData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" hide />
              <YAxis dataKey="country" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12}} width={70} />
              <Tooltip 
                cursor={{fill: '#F8FAFC'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
                formatter={(value: number) => [formatInt(value), 'Cases']}
                labelStyle={{ color: '#64748b' }}
              />
              <Bar dataKey="cases" radius={[0, 4, 4, 0]} barSize={16}>
                {topCountriesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#4F46E5' : '#818CF8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {top?.date && <p className="mt-4 text-xs text-slate-400">As of {top.date}</p>}
      </div>
    </div>
  );
}
