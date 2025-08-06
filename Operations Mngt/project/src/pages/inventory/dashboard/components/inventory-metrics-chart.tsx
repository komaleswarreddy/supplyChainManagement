import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { name: 'Jan', turnover: 3.2, accuracy: 97, stockouts: 2 },
  { name: 'Feb', turnover: 3.5, accuracy: 98, stockouts: 1 },
  { name: 'Mar', turnover: 3.1, accuracy: 96, stockouts: 3 },
  { name: 'Apr', turnover: 3.8, accuracy: 97, stockouts: 2 },
  { name: 'May', turnover: 4.0, accuracy: 98, stockouts: 1 },
  { name: 'Jun', turnover: 3.7, accuracy: 99, stockouts: 0 },
];

export function InventoryMetricsChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Inventory Performance Metrics</CardTitle>
        <CardDescription>Key inventory metrics over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="turnover" name="Inventory Turnover" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="accuracy" name="Inventory Accuracy (%)" fill="#82ca9d" />
              <Bar yAxisId="right" dataKey="stockouts" name="Stockout Events" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}