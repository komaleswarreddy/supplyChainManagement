import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'In Stock', value: 65, color: '#4ade80' },
  { name: 'Low Stock', value: 25, color: '#facc15' },
  { name: 'Out of Stock', value: 10, color: '#f87171' },
];

const COLORS = ['#4ade80', '#facc15', '#f87171'];

export function InventoryStatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Status</CardTitle>
        <CardDescription>Current stock level status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}