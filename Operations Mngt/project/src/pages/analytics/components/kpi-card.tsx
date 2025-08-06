import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percentage' | 'text';
}

export function KpiCard({ 
  title, 
  value, 
  change, 
  icon, 
  description,
  className,
  trend,
  format = 'text'
}: KpiCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up' || (change && change > 0)) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    if (trend === 'down' || (change && change < 0)) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getChangeColor = () => {
    if (trend === 'up' || (change && change > 0)) {
      return 'text-green-600';
    }
    if (trend === 'down' || (change && change < 0)) {
      return 'text-red-600';
    }
    return 'text-muted-foreground';
  };

  const formatChange = (changeValue: number) => {
    const sign = changeValue > 0 ? '+' : '';
    return `${sign}${changeValue.toFixed(1)}%`;
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {getTrendIcon()}
            <span className={cn("text-xs font-medium", getChangeColor())}>
              {formatChange(change)}
            </span>
            <span className="text-xs text-muted-foreground">
              from last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

