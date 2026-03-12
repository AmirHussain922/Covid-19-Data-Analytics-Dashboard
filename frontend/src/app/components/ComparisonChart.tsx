import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type CountryComparisonResponse = {
  countries: string[];
  series: Array<{ country: string; data: Array<{ date: string; cases: number }> }>;
};

type CountryConfig = { api: string; label: string; color: string };

const defaultCountries: CountryConfig[] = [
  { api: 'US', label: 'USA', color: '#4F46E5' },
  { api: 'India', label: 'India', color: '#06B6D4' },
  { api: 'United Kingdom', label: 'UK', color: '#F59E0B' },
  { api: 'Pakistan', label: 'Pakistan', color: '#10B981' },
];

export function ComparisonChart() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
  const [data, setData] = useState<CountryComparisonResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const query = defaultCountries.map((c) => encodeURIComponent(c.api)).join(',');
        const res = await fetch(`${API_BASE}/api/country-comparison?countries=${query}`);
        if (!res.ok) throw new Error(`country-comparison ${res.status}`);
        const json = (await res.json()) as CountryComparisonResponse;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  const chartData = useMemo(() => {
    if (!data?.series?.length) return [];
    const labelByCountry = new Map(defaultCountries.map((c) => [c.api, c.label] as const));
    const byDate = new Map<string, Record<string, number | string>>();

    for (const series of data.series) {
      const label = labelByCountry.get(series.country) ?? series.country;
      for (const point of series.data) {
        const row = (byDate.get(point.date) ?? { date: point.date }) as Record<string, number | string>;
        row[label] = point.cases;
        byDate.set(point.date, row);
      }
    }

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, row]) => row);
  }, [data]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Country Comparison</h3>
          <p className="text-sm text-slate-500">Total cases trend among selected countries</p>
        </div>
        <div className="flex gap-2">
          {defaultCountries.map((country) => (
            <span key={country.label} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
              {country.label}
            </span>
          ))}
          <button className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium border border-indigo-100 hover:bg-indigo-100 transition-colors">
            + Add
          </button>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
              labelStyle={{ color: '#64748b', marginBottom: '4px' }}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', color: '#475569' }} />
            {defaultCountries.map((c) => (
              <Line
                key={c.label}
                type="monotone"
                dataKey={c.label}
                stroke={c.color}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {error && <p className="mt-4 text-xs text-rose-500">Failed to load: {error}</p>}
    </div>
  );
}
