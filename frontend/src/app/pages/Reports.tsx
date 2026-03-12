import React from 'react';
import { FileText, Download, Calendar } from 'lucide-react';

const reports = [
  { title: 'Global Epidemiology Weekly Report', date: 'Oct 24, 2023', size: '2.4 MB', type: 'PDF' },
  { title: 'Vaccination Efficacy by Region', date: 'Oct 18, 2023', size: '1.8 MB', type: 'PDF' },
  { title: 'Mortality Rate Monthly Review', date: 'Oct 01, 2023', size: '4.1 MB', type: 'PDF' },
  { title: 'Quarterly Economic Impact Analysis', date: 'Sep 30, 2023', size: '6.5 MB', type: 'PDF' },
  { title: 'Variant Spread Mapping dataset', date: 'Sep 15, 2023', size: '12.8 MB', type: 'CSV' },
  { title: 'Hospitalization Capacity Metrics', date: 'Sep 10, 2023', size: '3.2 MB', type: 'PDF' },
];

export function Reports() {
  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Data Reports</h1>
          <p className="text-slate-500 text-sm">Download aggregated statistical summaries and monthly dossiers.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm shadow-sm hover:bg-indigo-700 transition-colors">
          Generate New Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                report.type === 'PDF' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {report.type}
              </span>
            </div>
            
            <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 flex-1">{report.title}</h3>
            
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {report.date}
              </div>
              <span>{report.size}</span>
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <Download className="w-4 h-4" />
              Download File
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
