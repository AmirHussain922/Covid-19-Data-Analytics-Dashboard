import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Users, ActivitySquare, HeartPulse } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const colorMap = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', stroke: '#4F46E5' },
  red: { bg: 'bg-red-50', text: 'text-red-500', stroke: '#EF4444' },
  green: { bg: 'bg-green-50', text: 'text-green-500', stroke: '#10B981' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-500', stroke: '#F97316' },
};

type GlobalStatsResponse = {
  date: string;
  total_cases: number;
  total_deaths: number;
  total_recovered?: number | null;
  daily_new_cases: number;
  death_rate: number;
};

type GlobalTrendResponse = {
  data: Array<{ date: string; new_cases: number }>;
};

function formatInt(value: number) {
  return new Intl.NumberFormat('en').format(value);
}

export function Metrics() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
  const [stats, setStats] = useState<GlobalStatsResponse | null>(null);
  const [trend, setTrend] = useState<GlobalTrendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const [statsRes, trendRes] = await Promise.all([
          fetch(`${API_BASE}/api/global-stats`),
          fetch(`${API_BASE}/api/global-trend`),
        ]);

        if (!statsRes.ok) throw new Error(`global-stats ${statsRes.status}`);
        if (!trendRes.ok) throw new Error(`global-trend ${trendRes.status}`);

        const statsJson = (await statsRes.json()) as GlobalStatsResponse;
        const trendJson = (await trendRes.json()) as GlobalTrendResponse;

        if (!cancelled) {
          setStats(statsJson);
          setTrend(trendJson);
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

  const sparkline = useMemo(() => {
    const points = (trend?.data ?? []).slice(-10);
    if (!points.length) return [];
    return points.map((p) => ({ value: Math.max(0, p.new_cases) }));
  }, [trend]);

  const metricsData = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: 'Total Global Cases',
        value: formatInt(stats.total_cases),
        change: null as string | null,
        trend: null as 'up' | 'down' | null,
        icon: Users,
        color: 'indigo' as const,
        data: sparkline,
      },
      {
        title: 'Total Deaths',
        value: formatInt(stats.total_deaths),
        change: null as string | null,
        trend: null as 'up' | 'down' | null,
        icon: ActivitySquare,
        color: 'red' as const,
        data: sparkline,
      },
      {
        title: 'Total Recovered',
        value: formatInt(stats.total_recovered ?? 0),
        change: null as string | null,
        trend: null as 'up' | 'down' | null,
        icon: HeartPulse,
        color: 'green' as const,
        data: sparkline,
      },
      {
        title: 'Daily New Cases',
        value: formatInt(stats.daily_new_cases),
        change: null as string | null,
        trend: null as 'up' | 'down' | null,
        icon: Activity,
        color: 'orange' as const,
        data: sparkline,
      },
    ];
  }, [sparkline, stats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricsData.map((metric, i) => {
        const colors = colorMap[metric.color];
        return (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${colors.bg}`}>
                <metric.icon className={`w-5 h-5 ${colors.text}`} />
              </div>
              {metric.change && metric.trend && (
                <div className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full ${
                  metric.trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                }`}>
                  {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {metric.change}
                </div>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">{metric.title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">{metric.value}</h3>
            
            <div className="h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metric.data}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={colors.stroke} 
                    strokeWidth={2} 
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {stats && i === 0 && (
              <p className="mt-3 text-xs text-slate-400">As of {stats.date}</p>
            )}
            {error && i === 0 && (
              <p className="mt-3 text-xs text-rose-500">Failed to load: {error}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
