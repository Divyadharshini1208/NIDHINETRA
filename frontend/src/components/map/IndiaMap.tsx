'use client';

import React, { useState } from 'react';
import { MapPin, Building2, TrendingUp, IndianRupee, Layers } from 'lucide-react';

interface StateData {
  code: string;
  name: string;
  sanctionedCr: number;
  expenditureCr: number;
  projectsCount: number;
  utilizationRate?: number;
  region: 'North' | 'South' | 'West' | 'East' | 'Central' | 'Northeast';
}

const INDIAN_STATES_DATA: StateData[] = [
  { code: 'MH', name: 'Maharashtra', sanctionedCr: 480.0, expenditureCr: 412.5, projectsCount: 920, region: 'West' },
  { code: 'UP', name: 'Uttar Pradesh', sanctionedCr: 640.0, expenditureCr: 528.0, projectsCount: 1280, region: 'North' },
  { code: 'KA', name: 'Karnataka', sanctionedCr: 320.0, expenditureCr: 275.4, projectsCount: 640, region: 'South' },
  { code: 'TN', name: 'Tamil Nadu', sanctionedCr: 390.0, expenditureCr: 345.0, projectsCount: 780, region: 'South' },
  { code: 'GJ', name: 'Gujarat', sanctionedCr: 260.0, expenditureCr: 228.0, projectsCount: 520, region: 'West' },
  { code: 'RJ', name: 'Rajasthan', sanctionedCr: 250.0, expenditureCr: 210.0, projectsCount: 500, region: 'North' },
  { code: 'BR', name: 'Bihar', sanctionedCr: 400.0, expenditureCr: 310.0, projectsCount: 800, region: 'East' },
  { code: 'WB', name: 'West Bengal', sanctionedCr: 420.0, expenditureCr: 350.0, projectsCount: 840, region: 'East' },
  { code: 'MP', name: 'Madhya Pradesh', sanctionedCr: 290.0, expenditureCr: 235.0, projectsCount: 580, region: 'Central' },
  { code: 'KL', name: 'Kerala', sanctionedCr: 200.0, expenditureCr: 182.0, projectsCount: 400, region: 'South' },
  { code: 'DL', name: 'Delhi', sanctionedCr: 70.0, expenditureCr: 62.5, projectsCount: 140, region: 'North' },
  { code: 'TS', name: 'Telangana', sanctionedCr: 170.0, expenditureCr: 148.0, projectsCount: 340, region: 'South' },
  { code: 'AP', name: 'Andhra Pradesh', sanctionedCr: 250.0, expenditureCr: 218.0, projectsCount: 500, region: 'South' },
  { code: 'OD', name: 'Odisha', sanctionedCr: 210.0, expenditureCr: 178.0, projectsCount: 420, region: 'East' },
  { code: 'AS', name: 'Assam', sanctionedCr: 140.0, expenditureCr: 115.0, projectsCount: 280, region: 'Northeast' },
  { code: 'PB', name: 'Punjab', sanctionedCr: 130.0, expenditureCr: 112.0, projectsCount: 260, region: 'North' },
  { code: 'HR', name: 'Haryana', sanctionedCr: 100.0, expenditureCr: 88.0, projectsCount: 200, region: 'North' },
  { code: 'JH', name: 'Jharkhand', sanctionedCr: 140.0, expenditureCr: 108.0, projectsCount: 280, region: 'East' },
  { code: 'CT', name: 'Chhattisgarh', sanctionedCr: 110.0, expenditureCr: 92.0, projectsCount: 220, region: 'Central' },
  { code: 'UK', name: 'Uttarakhand', sanctionedCr: 50.0, expenditureCr: 43.0, projectsCount: 100, region: 'North' },
  { code: 'HP', name: 'Himachal Pradesh', sanctionedCr: 40.0, expenditureCr: 36.0, projectsCount: 80, region: 'North' },
  { code: 'JK', name: 'Jammu & Kashmir', sanctionedCr: 60.0, expenditureCr: 48.0, projectsCount: 120, region: 'North' },
  { code: 'GA', name: 'Goa', sanctionedCr: 20.0, expenditureCr: 18.5, projectsCount: 40, region: 'West' },
  { code: 'TR', name: 'Tripura', sanctionedCr: 20.0, expenditureCr: 17.0, projectsCount: 40, region: 'Northeast' },
];

interface IndiaMapProps {
  selectedState?: string;
  onSelectState?: (stateName: string) => void;
}

export function IndiaMap({ selectedState, onSelectState }: IndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'North' | 'South' | 'West' | 'East'>('all');

  const filteredStates = activeTab === 'all'
    ? INDIAN_STATES_DATA
    : INDIAN_STATES_DATA.filter((s) => s.region === activeTab);

  const activeDisplayState = hoveredState ||
    (selectedState ? INDIAN_STATES_DATA.find((s) => s.name === selectedState) : INDIAN_STATES_DATA[0]);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-gov-saffron rounded-full"></span>
            <h3 className="font-bold text-sm text-gov-navy-900 uppercase tracking-wider">
              Geographic Project Telemetry Distribution
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a State or Union Territory to inspect localized MPLADS fund utilization
          </p>
        </div>

        {/* Region Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-md text-xs font-semibold">
          {(['all', 'North', 'South', 'West', 'East'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setActiveTab(r)}
              className={`px-2.5 py-1 rounded capitalize transition ${
                activeTab === r
                  ? 'bg-gov-navy-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-gov-navy-900'
              }`}
            >
              {r === 'all' ? 'All Regions' : r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: State Grid Matrix Map Representation */}
        <div className="lg:col-span-2 bg-slate-50/70 p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-gov-navy-700" />
              States / UTs Active Monitoring Grid ({filteredStates.length})
            </span>
            <span className="text-[11px] text-slate-400">Click a state to apply page filter</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredStates.map((state) => {
              const isSelected = selectedState === state.name || hoveredState?.code === state.code;
              const utilRate = Math.round((state.expenditureCr / state.sanctionedCr) * 100);

              return (
                <button
                  key={state.code}
                  onMouseEnter={() => setHoveredState(state)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => onSelectState && onSelectState(state.name)}
                  className={`text-left p-2.5 rounded-lg border transition-all duration-150 ${
                    isSelected
                      ? 'bg-gov-navy-800 text-white border-gov-navy-900 shadow-md transform scale-[1.02]'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-gov-navy-400 hover:bg-blue-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold tracking-tight ${
                        isSelected ? 'text-white' : 'text-gov-navy-900'
                      }`}
                    >
                      {state.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1 rounded ${
                        isSelected ? 'bg-gov-navy-700 text-gov-saffron-light' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {state.code}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>Projects</span>
                    <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {state.projectsCount}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span className={isSelected ? 'text-slate-300' : 'text-slate-500'}>Utilization</span>
                    <span
                      className={`font-bold ${
                        isSelected
                          ? 'text-green-300'
                          : utilRate >= 85
                          ? 'text-gov-green'
                          : utilRate >= 75
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {utilRate}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isSelected
                          ? 'bg-gov-saffron-light'
                          : utilRate >= 85
                          ? 'bg-gov-green'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${utilRate}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Detailed State Inspection Card */}
        {activeDisplayState && (
          <div className="bg-gradient-to-b from-white to-slate-50 p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gov-saffron">
                    State Telemetry Profile
                  </span>
                  <h4 className="text-lg font-black text-gov-navy-900 leading-tight">
                    {activeDisplayState.name}
                  </h4>
                </div>
                <div className="w-9 h-9 rounded-full bg-gov-navy-100 border border-gov-navy-200 flex items-center justify-center font-bold text-gov-navy-800 text-xs">
                  {activeDisplayState.code}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-3 bg-white rounded border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <Building2 className="w-4 h-4 text-gov-navy-700" />
                    <span>Monitored Works</span>
                  </div>
                  <span className="text-sm font-black text-gov-navy-900">
                    {activeDisplayState.projectsCount} Works
                  </span>
                </div>

                <div className="p-3 bg-white rounded border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <IndianRupee className="w-4 h-4 text-gov-navy-700" />
                    <span>Total Sanctioned</span>
                  </div>
                  <span className="text-sm font-black text-gov-navy-900">
                    ₹ {activeDisplayState.sanctionedCr.toFixed(1)} Cr
                  </span>
                </div>

                <div className="p-3 bg-white rounded border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <TrendingUp className="w-4 h-4 text-gov-green" />
                    <span>Total Expenditure</span>
                  </div>
                  <span className="text-sm font-black text-gov-green">
                    ₹ {activeDisplayState.expenditureCr.toFixed(1)} Cr
                  </span>
                </div>

                <div className="p-3 bg-blue-50/60 rounded border border-blue-200">
                  <div className="flex justify-between items-center text-xs font-bold text-gov-navy-900 mb-1.5">
                    <span>Overall Fund Utilization:</span>
                    <span className="text-gov-navy-800">
                      {Math.round(
                        (activeDisplayState.expenditureCr / activeDisplayState.sanctionedCr) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gov-navy-800 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round(
                          (activeDisplayState.expenditureCr / activeDisplayState.sanctionedCr) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-center">
              <button
                onClick={() => onSelectState && onSelectState(activeDisplayState.name)}
                className="w-full py-1.5 px-3 bg-gov-navy-800 hover:bg-gov-navy-900 text-white rounded text-xs font-bold transition shadow-xs flex items-center justify-center space-x-1"
              >
                <MapPin className="w-3.5 h-3.5 text-gov-saffron" />
                <span>Filter Dashboard by {activeDisplayState.name}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
