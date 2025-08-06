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
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Forecast } from '@/types/supply-chain';

interface ForecastChartProps {
  data: Forecast[];
  height?: number;
  showConfidenceInterval?: boolean;
}

export function ForecastChart({ 
  data, 
  height = 400, 
  showConfidenceInterval = true 
}: ForecastChartProps) {
  // Transform data for chart display
  const chartData = data.flatMap(forecast => {
    const historicalData = forecast.historicalData?.map(point => ({
      date: new Date(point.date).toLocaleDateString(),
      value: point.quantity,
      type: 'Historical',
      itemName: forecast.itemName,
      locationName: forecast.locationName,
    })) || [];

    const forecastData = forecast.forecastData?.map(point => ({
      date: new Date(point.period).toLocaleDateString(),
      value: point.forecastedDemand,
      type: 'Forecast',
      itemName: forecast.itemName,
      locationName: forecast.locationName,
      lowerBound: point.confidenceInterval?.lower,
      upperBound: point.confidenceInterval?.upper,
    })) || [];

    return [...historicalData, ...forecastData];
  });

  // Sort by date
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="mt-1">
              <p style={{ color: entry.color }}>
                {`${entry.dataKey}: ${entry.value}`}
              </p>
              {entry.payload.itemName && (
                <p className="text-sm text-gray-600">
                  {`Item: ${entry.payload.itemName}`}
                </p>
              )}
              {entry.payload.locationName && (
                <p className="text-sm text-gray-600">
                  {`Location: ${entry.payload.locationName}`}
                </p>
              )}
              {entry.payload.lowerBound && entry.payload.upperBound && (
                <p className="text-sm text-gray-600">
                  {`Confidence: ${entry.payload.lowerBound} - ${entry.payload.upperBound}`}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex items-center justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Forecast Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No forecast data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Forecast Overview</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Historical</Badge>
            <Badge variant="default">Forecast</Badge>
            {showConfidenceInterval && (
              <Badge variant="secondary">Confidence Interval</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {showConfidenceInterval ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              
              {/* Historical Data */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Historical"
                strokeWidth={2}
              />
              
              {/* Forecast Data */}
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                name="Forecast"
                strokeWidth={2}
              />
              
              {/* Confidence Interval */}
              {showConfidenceInterval && (
                <>
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.1}
                    name="Upper Bound"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.1}
                    name="Lower Bound"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                  />
                </>
              )}
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              
              {/* Historical Data */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Historical"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
              
              {/* Forecast Data */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                name="Forecast"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 