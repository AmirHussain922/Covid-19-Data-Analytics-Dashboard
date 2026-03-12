import React from 'react';
import { ComparisonChart } from '../components/ComparisonChart';
import { BottomSection } from '../components/BottomSection';

export function CountryComparison() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Country Comparison</h1>
        <p className="text-slate-500 text-sm">Compare specific trends and metrics side-by-side between selected countries.</p>
      </div>
      
      <ComparisonChart />
      
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Cases & Mortality Factors</h2>
        <BottomSection />
      </div>
    </div>
  );
}
