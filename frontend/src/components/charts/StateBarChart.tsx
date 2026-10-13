'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface StateBarChartProps {
  data?: Array<{
    stateCode: string;
    stateName: string;
    sanctionedCr: number;
    expenditureCr: number;
  }>;
}

const DEFAULT_DATA = [
  { stateCode: 'UP', stateName: 'Uttar Pradesh', sanctionedCr: 640.0, expenditureCr: 528.0 },
  { stateCode: 'MH', stateName: 'Maharashtra', sanctionedCr: 480.0, expenditureCr: 412.5 },
  { stateCode: 'WB', stateName: 'West Bengal', sanctionedCr: 420.0, expenditureCr: 350.0 },
  { stateCode: 'BR', stateName: 'Bihar', sanctionedCr: 400.0, expenditureCr: 310.0 },
  { stateCode: 'TN', stateName: 'Tamil Nadu', sanctionedCr: 390.0, expenditureCr: 345.0 },
  { stateCode: 'KA', stateName: 'Karnataka', sanctionedCr: 320.0, expenditureCr: 275.4 },
  { stateCode: 'MP', stateName: 'Madhya Pradesh', sanctionedCr: 290.0, expenditureCr: 235.0 },
  { stateCode: 'GJ', stateName: 'Gujarat', sanctionedCr: 260.0, expenditureCr: 228.0 },
  { stateCode: 'RJ', stateName: 'Rajasthan', sanctionedCr: 250.0, expenditureCr: 210.0 },
  { stateCode: 'AP', stateName: 'Andhra Pradesh', sanctionedCr: 250.0, expenditureCr: 218.0 },
];

export function StateBarChart({ data = DEFAULT_DATA }: StateBarChartProps) {
  const chartData = data && data.length > 0 ? data.slice(0, 10) : DEFAULT_DATA;
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 15, left: -10, bottom: isMobile ? 15 : 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey={isMobile ? 'stateCode' : 'stateName'}
            tick={{ fontSize: isMobile ? 10 : 11, fill: '#475569' }}
            angle={isMobile ? 0 : -25}
            textAnchor={isMobile ? 'middle' : 'end'}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#475569' }}
            tickFormatter={(val) => `₹${val}Cr`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#CBD5E1',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value: any) => [`₹ ${value} Crore`, '']}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
          />
          <Bar
            name="Sanctioned Amount (₹ Cr)"
            dataKey="sanctionedCr"
            fill="#0A2540"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            name="Actual Expenditure (₹ Cr)"
            dataKey="expenditureCr"
            fill="#138808"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
