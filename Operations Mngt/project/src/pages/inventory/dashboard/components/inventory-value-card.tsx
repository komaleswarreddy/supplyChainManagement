import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const data = [
  { month: 'Jan', value: 1250000 },
  { month: 'Feb', value: 1320000 },
  { month: 'Mar', value: 1450000 },
  { month: 'Apr', value: 1380000 },
  { month: 'May', value: 1520000 },
  { month: 'Jun', value: 1680000 },
];

export function InventoryValueCard() {
  const currentValue = data[data.length - 1].value;
  const previousValue = data[data.length - 2].value;
  const percentChange = ((currentValue - previousValue) / previousValue) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Inventory Value</CardTitle>
        <CardDescription>Current inventory valuation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-bold">{formatCurrency(currentValue)}</p>
            <p className={`text-sm ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {percentChange >= 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}% from last month
            </p>
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000)}k`}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                />
                <Tooltip 
                  formatter={(value) => [`${formatCurrency(value)}`, 'Value']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}