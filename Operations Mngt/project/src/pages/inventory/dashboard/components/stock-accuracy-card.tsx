import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function StockAccuracyCard() {
  const accuracy = 98.2;
  const target = 99.5;
  const lastCount = '2023-06-15';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Accuracy</CardTitle>
        <CardDescription>Based on last cycle count</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">Target: {target}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last count:</p>
              <p className="text-sm font-medium">{new Date(lastCount).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Current</span>
              <span>Target</span>
            </div>
            <Progress value={accuracy} max={100} className="h-2" />
            <div className="relative">
              <div 
                className="absolute top-0 w-0.5 h-2 bg-red-500" 
                style={{ left: `${target}%`, marginLeft: '-1px' }}
              />
            </div>
          </div>
          
          <div className="pt-2 text-sm">
            <p className={accuracy >= 98 ? 'text-green-600' : 'text-amber-600'}>
              {accuracy >= 98 
                ? 'Good accuracy level' 
                : accuracy >= 95 
                  ? 'Acceptable accuracy level' 
                  : 'Needs improvement'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}