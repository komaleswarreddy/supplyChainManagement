import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StatusChartProps {
  data: {
    healthy: number;
    warnings: number;
    critical: number;
  };
}

export function StatusChart({ data }: StatusChartProps) {
  const chartData = [
    { name: 'Healthy', value: data.healthy, color: '#4ade80' },
    { name: 'Warnings', value: data.warnings, color: '#facc15' },
    { name: 'Critical', value: data.critical, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const total = data.healthy + data.warnings + data.critical;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px]">
        <p className="text-muted-foreground">No status data available</p>
      </div>
    );
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}