import React from 'react';
import { LayoutDashboard, Globe, GitCompare, TrendingUp, Grid, FileText } from 'lucide-react';
import { NavLink } from 'react-router';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Globe, label: 'Global Statistics', path: '/global' },
  { icon: GitCompare, label: 'Country Comparison', path: '/comparison' },
  { icon: TrendingUp, label: 'Trends', path: '/trends' },
  { icon: Grid, label: 'Heatmap', path: '/heatmap' },
  { icon: FileText, label: 'Reports', path: '/reports' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col p-6 z-20">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-slate-900 text-lg">COVID Analytics</span>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive 
                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-slate-50 rounded-xl">
        <p className="text-sm font-medium text-slate-900 mb-1">Need help?</p>
        <p className="text-xs text-slate-500 mb-3">Check our documentation</p>
        <button className="w-full py-2 bg-white text-indigo-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
          Documentation
        </button>
      </div>
    </aside>
  );
}
