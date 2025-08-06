import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const data = [
  { 
    name: '0-30 days', 
    value: 850000, 
    percent: 50.6,
    color: '#4ade80' 
  },
  { 
    name: '31-60 days', 
    value: 420000, 
    percent: 25.0,
    color: '#a3e635' 
  },
  { 
    name: '61-90 days', 
    value: 235000, 
    percent: 14.0,
    color: '#facc15' 
  },
  { 
    name: '91-180 days', 
    value: 125000, 
    percent: 7.4,
    color: '#fb923c' 
  },
  { 
    name: '181-365 days', 
    value: 42000, 
    percent: 2.5,
    color: '#f87171' 
  },
  { 
    name: '>365 days', 
    value: 8000, 
    percent: 0.5,
    color: '#ef4444' 
  },
];

export function InventoryAgingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Aging</CardTitle>
        <CardDescription>Value distribution by age</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis 
                yAxisId="left"
                orientation="left"
                tickFormatter={(value) => `$${(value / 1000)}k`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value, name, props) => {
                  if (name === 'value') {
                    return [formatCurrency(value as number), 'Value'];
                  }
                  return [`${value}%`, 'Percentage'];
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="value" 
                name="Value" 
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="right"
                dataKey="percent" 
                name="Percentage" 
                fill="#82ca9d"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}