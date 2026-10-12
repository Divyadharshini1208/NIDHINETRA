'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface CategoryBarChartProps {
  data?: Array<{
    category: string;
    count: number;
  }>;
}

const DEFAULT_CATEGORY_DATA = [
  { category: 'Drinking Water', count: 2840 },
  { category: 'Education & Schools', count: 2410 },
  { category: 'Roads & Bridges', count: 1890 },
  { category: 'Healthcare & Clinics', count: 1280 },
  { category: 'Sanitation & Solar', count: 924 },
];

export function CategoryBarChart({ data = DEFAULT_CATEGORY_DATA }: CategoryBarChartProps) {
  const chartData = data && data.length > 0 ? data : DEFAULT_CATEGORY_DATA;

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 11, fill: '#0A2540', fontWeight: 600 }}
            width={130}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#CBD5E1',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value: any) => [`${value.toLocaleString()} Projects`, 'Active Projects']}
          />
          <Bar
            dataKey="count"
            fill="#0F3A66"
            radius={[0, 4, 4, 0]}
            name="Projects"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
