import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardSummaryCardProps {
  title: string;
  healthy: number;
  warnings: number;
  critical: number;
}

export function DashboardSummaryCard({ 
  title, 
  healthy, 
  warnings, 
  critical 
}: DashboardSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Healthy: {healthy}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500"></div>
            <span className="text-sm">Warnings: {warnings}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Critical: {critical}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}