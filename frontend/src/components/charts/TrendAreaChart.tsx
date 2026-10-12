'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrendAreaChartProps {
  data?: Array<{
    year: string;
    completed: number;
    sanctioned: number;
    utilization?: number;
  }>;
}

const DEFAULT_TREND_DATA = [
  { year: '2020-21', completed: 1240, sanctioned: 1450, utilization: 85.5 },
  { year: '2021-22', completed: 1680, sanctioned: 1820, utilization: 92.3 },
  { year: '2022-23', completed: 1950, sanctioned: 2100, utilization: 92.8 },
  { year: '2023-24', completed: 2320, sanctioned: 2490, utilization: 93.1 },
  { year: '2024-25', completed: 1450, sanctioned: 1900, utilization: 76.3 },
];

export function TrendAreaChart({ data = DEFAULT_TREND_DATA }: TrendAreaChartProps) {
  const chartData = data && data.length > 0 ? data : DEFAULT_TREND_DATA;

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="sanctionedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0A2540" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0A2540" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#138808" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#138808" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#475569' }} />
          <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#CBD5E1',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} />
          <Area
            type="monotone"
            name="Sanctioned Works"
            dataKey="sanctioned"
            stroke="#0A2540"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#sanctionedGrad)"
          />
          <Area
            type="monotone"
            name="Completed Works"
            dataKey="completed"
            stroke="#138808"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#completedGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
