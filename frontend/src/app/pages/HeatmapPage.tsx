import React from 'react';
import { HeatmapSection } from '../components/HeatmapSection';

export function HeatmapPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Spread Heatmap</h1>
        <p className="text-slate-500 text-sm">Visualize correlation clusters and spread patterns across major regions.</p>
      </div>

      <HeatmapSection />
      
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mt-8 text-center">
        <div className="inline-flex w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Regional GIS Mapping coming soon</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          We are currently integrating global geospatial datasets to provide an interactive node-based view of localized breakout clusters. Check back later.
        </p>
      </div>
    </div>
  );
}
