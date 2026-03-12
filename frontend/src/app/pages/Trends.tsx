import React, { useEffect, useMemo, useState } from 'react';
import { MainCharts } from '../components/MainCharts';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

type GlobalTrendResponse = {
  data: Array<{ date: string; new_cases: number }>;
};

export function Trends() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
  const [trend, setTrend] = useState<GlobalTrendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const res = await fetch(`${API_BASE}/api/global-trend`);
        if (!res.ok) throw new Error(`global-trend ${res.status}`);
        const json = (await res.json()) as GlobalTrendResponse;
        if (!cancelled) setTrend(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  const stats = useMemo(() => {
    const series = trend?.data ?? [];
    if (series.length === 0) return null;

    const last14 = series.slice(-14);
    const last7 = last14.slice(-7).reduce((acc, p) => acc + Math.max(0, p.new_cases), 0);
    const prev7 = last14.slice(0, Math.max(0, last14.length - 7)).reduce((acc, p) => acc + Math.max(0, p.new_cases), 0);
    const growth = prev7 > 0 ? last7 / prev7 : null;

    let peak = series[0];
    for (const p of series) {
      if (p.new_cases > peak.new_cases) peak = p;
    }

    const latest = series[series.length - 1];

    return {
      growth,
      peakDate: peak.date,
      peakCases: peak.new_cases,
      latestDate: latest.date,
      latestNewCases: latest.new_cases,
    };
  }, [trend]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Trends & Forecasting</h1>
        <p className="text-slate-500 text-sm">Predictive models and historical trajectory analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            label: 'Weekly Growth Factor',
            value: stats?.growth ? stats.growth.toFixed(2) : '—',
            status: stats?.latestDate ? `As of ${stats.latestDate}` : (error ? `Failed to load: ${error}` : ''),
          },
          {
            label: 'Peak New Cases Date',
            value: stats?.peakDate ?? '—',
            status: stats ? `${new Intl.NumberFormat('en').format(stats.peakCases)} new cases` : '',
          },
          {
            label: 'Latest New Cases',
            value: stats ? new Intl.NumberFormat('en').format(stats.latestNewCases) : '—',
            status: stats?.latestDate ? `On ${stats.latestDate}` : '',
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 text-slate-500 font-medium mb-3">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              {stat.label}
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
            <div className="flex items-center gap-1 text-sm text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
              {stat.status}
            </div>
          </div>
        ))}
      </div>

      <MainCharts />
    </div>
  );
}
