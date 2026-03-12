import React from 'react';
import { Search, Calendar, MapPin, Bell } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-slate-200/50 px-8 py-4 flex items-center justify-between">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search for a country, region, or keyword..." 
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-900 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-4 ml-8">
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Last 30 Days</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span>Global</span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <button className="relative p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MzIxNzQ4MXww&ixlib=rb-4.1.0&q=80&w=1080" 
          alt="User Profile" 
          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
        />
      </div>
    </header>
  );
}
