import React, { useEffect, useMemo, useState } from 'react';
import { Metrics } from '../components/Metrics';
import { MainCharts } from '../components/MainCharts';
import { FileDown, Filter } from 'lucide-react';

type CountriesLatestResponse = {
  as_of: string;
  total: number;
  limit: number;
  offset: number;
  items: Array<{
    country: string;
    total_cases: number;
    new_cases: number;
    total_deaths: number;
    total_recovered: number;
    death_rate: number;
  }>;
};

function formatInt(value: number) {
  return new Intl.NumberFormat('en').format(value);
}

export function GlobalStatistics() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
  const [data, setData] = useState<CountriesLatestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 25;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const params = new URLSearchParams();
        params.set('limit', String(limit));
        params.set('offset', String(offset));
        params.set('sort', 'total_cases');
        if (query.trim()) params.set('q', query.trim());
        const res = await fetch(`${API_BASE}/api/countries-latest?${params.toString()}`);
        if (!res.ok) throw new Error(`countries-latest ${res.status}`);
        const json = (await res.json()) as CountriesLatestResponse;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [API_BASE, limit, offset, query]);

  const pageInfo = useMemo(() => {
    const total = data?.total ?? 0;
    const from = total === 0 ? 0 : offset + 1;
    const to = Math.min(offset + limit, total);
    return { total, from, to };
  }, [data, limit, offset]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Global Statistics</h1>
          <p className="text-slate-500 text-sm">Detailed worldwide breakdown of COVID-19 cases, recoveries, and mortality.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm">
            <FileDown className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
      
      <Metrics />
      <MainCharts />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">All Countries Breakdown</h3>
              {data?.as_of && (
                <p className="text-xs text-slate-400 mt-1">
                  As of {data.as_of} · Showing {pageInfo.from}-{pageInfo.to} of {pageInfo.total}
                </p>
              )}
            </div>
            <input
              value={query}
              onChange={(e) => {
                setOffset(0);
                setQuery(e.target.value);
              }}
              placeholder="Search country…"
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Country</th>
                <th className="px-6 py-4 font-semibold">Total Cases</th>
                <th className="px-6 py-4 font-semibold">New Cases (24h)</th>
                <th className="px-6 py-4 font-semibold">Total Deaths</th>
                <th className="px-6 py-4 font-semibold">Recovered</th>
                <th className="px-6 py-4 font-semibold">Death Rate</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((row, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.country}</td>
                  <td className="px-6 py-4">{formatInt(row.total_cases)}</td>
                  <td className="px-6 py-4 text-orange-500">+{formatInt(row.new_cases)}</td>
                  <td className="px-6 py-4 text-rose-500">{formatInt(row.total_deaths)}</td>
                  <td className="px-6 py-4 text-emerald-500">{formatInt(row.total_recovered)}</td>
                  <td className="px-6 py-4">{row.death_rate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-400">
            {error ? `Failed to load: ${error}` : ''}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset((v) => Math.max(0, v - limit))}
              disabled={offset === 0}
              className="px-3 py-2 bg-white text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              Prev
            </button>
            <button
              onClick={() => setOffset((v) => v + limit)}
              disabled={data ? offset + limit >= data.total : true}
              className="px-3 py-2 bg-white text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
