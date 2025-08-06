import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const data = [
  { month: 'Jan', value: 1250000 },
  { month: 'Feb', value: 1320000 },
  { month: 'Mar', value: 1450000 },
  { month: 'Apr', value: 1380000 },
  { month: 'May', value: 1520000 },
  { month: 'Jun', value: 1680000 },
  { month: 'Jul', value: 1750000 },
  { month: 'Aug', value: 1820000 },
  { month: 'Sep', value: 1780000 },
  { month: 'Oct', value: 1850000 },
  { month: 'Nov', value: 1920000 },
  { month: 'Dec', value: 2050000 },
];

export function InventoryValueChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Inventory Value Trend</CardTitle>
        <CardDescription>12-month inventory valuation history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                width={80}
              />
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), 'Inventory Value']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}