import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OptimizationChartProps {
  data: Array<{
    month: string;
    serviceLevel: number;
    inventoryTurnover: number;
    stockoutRate: number;
    totalCost: number;
  }>;
  height?: number;
}

export function OptimizationChart({ data, height = 300 }: OptimizationChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Optimization Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No performance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimization Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12 }}
              label={{ value: 'Service Level (%)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{ value: 'Inventory Turnover', angle: 90, position: 'insideRight' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Service Level */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="serviceLevel"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Service Level (%)"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            
            {/* Inventory Turnover */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="inventoryTurnover"
              stroke="#10b981"
              strokeWidth={2}
              name="Inventory Turnover"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            />
            
            {/* Stockout Rate */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="stockoutRate"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Stockout Rate (%)"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 