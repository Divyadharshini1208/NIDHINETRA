'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface StatusPieChartProps {
  data?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const DEFAULT_STATUS_DATA = [
  { name: 'Completed Works', value: 6400, color: '#138808' },
  { name: 'Ongoing Works', value: 2100, color: '#0A2540' },
  { name: 'Delayed Works', value: 480, color: '#E65100' },
  { name: 'Sanctioned / Proposed', value: 364, color: '#1E609A' },
];

export function StatusPieChart({ data = DEFAULT_STATUS_DATA }: StatusPieChartProps) {
  const chartData = data && data.length > 0 ? data : DEFAULT_STATUS_DATA;

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#CBD5E1',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value: any) => [`${value.toLocaleString()} Projects`, '']}
          />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: '15px', fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
