import React, { useEffect, useMemo, useState } from 'react';

type HeatmapResponse = {
  countries: string[];
  matrix: number[][];
  metric: string;
};

function getColor(value: number) {
  const intensity = Math.max(0, Math.min(1, (value + 1) / 2));
  const hue = 220 - intensity * 220;
  return `hsl(${hue}, 80%, 60%)`;
}

export function HeatmapSection() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const res = await fetch(`${API_BASE}/api/heatmap?limit=10`);
        if (!res.ok) throw new Error(`heatmap ${res.status}`);
        const json = (await res.json()) as HeatmapResponse;
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

  const countries = useMemo(() => data?.countries ?? [], [data]);
  const matrixData = useMemo(() => data?.matrix ?? [], [data]);

  function shortLabel(country: string) {
    const key = country.trim().toLowerCase();
    if (key === 'us' || key === 'usa' || key === 'united states') return 'USA';
    if (key === 'united kingdom') return 'UK';
    if (key === 'south korea') return 'KOR';
    if (key === 'russia') return 'RUS';
    const parts = country.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
    return parts.map((p) => p[0]).join('').slice(0, 3).toUpperCase();
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 overflow-hidden">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Spread Correlation Heatmap</h3>
          <p className="text-sm text-slate-500">COVID-19 trend correlation between major countries</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <span>Low</span>
          <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-red-500"></div>
          <span>High</span>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[600px]">
          <div className="flex">
            <div className="w-12"></div>
            {countries.map((c, i) => (
              <div key={i} className="flex-1 text-center text-xs font-semibold text-slate-500 mb-3">{shortLabel(c)}</div>
            ))}
          </div>
          {countries.map((rowC, i) => (
            <div key={i} className="flex items-center mb-1.5">
              <div className="w-12 text-xs font-semibold text-slate-500 text-right pr-4">{shortLabel(rowC)}</div>
              {countries.map((colC, j) => {
                const val = matrixData[i]?.[j] ?? 0;
                return (
                  <div key={j} className="flex-1 px-0.5">
                    <div 
                      className="w-full h-10 rounded-lg transition-all hover:scale-110 hover:shadow-lg hover:z-10 cursor-pointer relative group border border-black/5"
                      style={{ backgroundColor: getColor(val) }}
                    >
                      <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap z-20 shadow-xl">
                        {rowC} & {colC}: {val.toFixed(2)}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {error && <p className="mt-4 text-xs text-rose-500">Failed to load: {error}</p>}
    </div>
  );
}
