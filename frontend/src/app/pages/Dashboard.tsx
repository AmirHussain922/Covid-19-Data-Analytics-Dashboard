import React from 'react';
import { Metrics } from '../components/Metrics';
import { MainCharts } from '../components/MainCharts';
import { ComparisonChart } from '../components/ComparisonChart';
import { HeatmapSection } from '../components/HeatmapSection';
import { BottomSection } from '../components/BottomSection';

export function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm">Welcome back, here's what's happening globally today.</p>
      </div>
      
      <Metrics />
      <MainCharts />
      <ComparisonChart />
      <HeatmapSection />
      <BottomSection />
    </div>
  );
}
