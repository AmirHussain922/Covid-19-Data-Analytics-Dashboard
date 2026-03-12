import React, { useEffect, useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

type CountriesLatestResponse = {
  as_of: string;
  items: Array<{
    country: string;
    total_cases: number;
    total_deaths: number;
    death_rate: number;
    cases_per_100k: number;
  }>;
};

function formatInt(value: number) {
  return new Intl.NumberFormat('en').format(value);
}

export function BottomSection() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
  const [deathRateResp, setDeathRateResp] = useState<CountriesLatestResponse | null>(null);
  const [scatterResp, setScatterResp] = useState<CountriesLatestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const [drRes, scRes] = await Promise.all([
          fetch(`${API_BASE}/api/countries-latest?limit=10&sort=death_rate`),
          fetch(`${API_BASE}/api/countries-latest?limit=10&sort=cases_per_100k`),
        ]);
        if (!drRes.ok) throw new Error(`countries-latest (death_rate) ${drRes.status}`);
        if (!scRes.ok) throw new Error(`countries-latest (cases_per_100k) ${scRes.status}`);
        const drJson = (await drRes.json()) as CountriesLatestResponse;
        const scJson = (await scRes.json()) as CountriesLatestResponse;
        if (!cancelled) {
          setDeathRateResp(drJson);
          setScatterResp(scJson);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  const deathRateData = useMemo(() => {
    return (deathRateResp?.items ?? []).map((c) => ({
      country: c.country,
      rate: c.death_rate,
    }));
  }, [deathRateResp]);

  const scatterData = useMemo(() => {
    return (scatterResp?.items ?? []).map((c) => ({
      country: c.country,
      casesPer100k: c.cases_per_100k,
      deathRate: c.death_rate,
      size: Math.max(1, Math.log10(Math.max(1, c.total_cases))),
      totalCases: c.total_cases,
      totalDeaths: c.total_deaths,
    }));
  }, [scatterResp]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Death Rate by Country</h3>
          <p className="text-sm text-slate-500">Case fatality ratio (%)</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deathRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="country" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
              <RechartsTooltip 
                cursor={{fill: '#F8FAFC'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
                formatter={(value: number) => [`${value}%`, 'Fatality Rate']}
                labelStyle={{ color: '#64748b' }}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]} barSize={32}>
                {deathRateData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.rate > 3 ? '#EF4444' : '#F59E0B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {deathRateResp?.as_of && <p className="mt-4 text-xs text-slate-400">As of {deathRateResp.as_of}</p>}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Cases vs Death Rate</h3>
          <p className="text-sm text-slate-500">Cases per 100k vs fatality rate (%)</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                type="number" 
                dataKey="casesPer100k" 
                name="Cases per 100k" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748B', fontSize: 12}} 
              />
              <YAxis 
                type="number" 
                dataKey="deathRate" 
                name="Death Rate" 
                unit="%" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748B', fontSize: 12}} 
              />
              <ZAxis type="number" dataKey="size" range={[60, 200]} />
              <RechartsTooltip 
                cursor={{strokeDasharray: '3 3'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
                formatter={(value: number, name: string, payload) => {
                  if (name === 'casesPer100k') return [value.toFixed(2), 'Cases / 100k'];
                  if (name === 'deathRate') return [`${value.toFixed(2)}%`, 'Death Rate'];
                  if (name === 'size' && payload?.payload) return [formatInt(payload.payload.totalCases), 'Total Cases'];
                  return [value, name];
                }}
                labelFormatter={(_, payload) => {
                  const p = payload?.[0]?.payload as { country?: string } | undefined;
                  return p?.country ?? '';
                }}
              />
              <Scatter name="Countries" data={scatterData} fill="#06B6D4">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#06B6D4" opacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        {scatterResp?.as_of && <p className="mt-4 text-xs text-slate-400">As of {scatterResp.as_of}</p>}
      </div>
      {error && <p className="text-xs text-rose-500 lg:col-span-2">{error}</p>}
    </div>
  );
}
