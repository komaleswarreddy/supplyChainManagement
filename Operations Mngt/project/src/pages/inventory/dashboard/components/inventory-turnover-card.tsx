import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function InventoryTurnoverCard() {
  const currentTurnover = 3.7;
  const previousTurnover = 3.5;
  const percentChange = ((currentTurnover - previousTurnover) / previousTurnover) * 100;
  const isPositive = percentChange >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Turnover</CardTitle>
        <CardDescription>Last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{currentTurnover.toFixed(1)}</p>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                {Math.abs(percentChange).toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground ml-2">vs. previous period</span>
            </div>
          </div>
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-xl font-semibold text-primary">{currentTurnover > 3.5 ? 'Good' : 'Fair'}</span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Industry average: 4.2
          </p>
          <div className="w-full bg-muted h-2 rounded-full mt-1">
            <div 
              className="bg-primary h-2 rounded-full" 
              style={{ width: `${(currentTurnover / 6) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}