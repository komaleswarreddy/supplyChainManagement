import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  loading?: boolean;
}

export function DashboardMetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  loading = false 
}: DashboardMetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{loading ? '—' : value}</p>
              {change !== undefined && (
                <span className={`text-xs font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change >= 0 ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
                  {Math.abs(change)}%
                </span>
              )}
            </div>
          </div>
          <div className="rounded-full bg-muted p-2">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}