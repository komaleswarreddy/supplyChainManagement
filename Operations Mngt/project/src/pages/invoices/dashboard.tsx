import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/pages/dashboard/components/card';
import { useInvoice } from '@/hooks/useInvoice';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckSquare, 
  BarChart4, 
  TrendingUp, 
  Users, 
  Calendar 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function InvoiceDashboard() {
  const navigate = useNavigate();
  const { useInvoiceAnalytics } = useInvoice;
  const { data: analytics, isLoading } = useInvoiceAnalytics();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AP Dashboard</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/invoices/capture')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Capture Invoice
          </Button>
          <Button onClick={() => navigate('/invoices/new')} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      ) : analytics ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold">{analytics.totalInvoices}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Last 30 days</span>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">${analytics.totalAmount.toLocaleString()}</p>
                </div>
                <div className="rounded-full bg-green-500/10 p-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">12.5%</span>
                <span className="text-sm text-muted-foreground">vs last month</span>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Match Rate</p>
                  <p className="text-2xl font-bold">{(analytics.matchRate * 100).toFixed(1)}%</p>
                </div>
                <div className="rounded-full bg-blue-500/10 p-3">
                  <CheckSquare className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">3.2%</span>
                <span className="text-sm text-muted-foreground">vs last month</span>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Processing Time</p>
                  <p className="text-2xl font-bold">{analytics.averageProcessingTime} days</p>
                </div>
                <div className="rounded-full bg-amber-500/10 p-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">0.5 days</span>
                <span className="text-sm text-muted-foreground">improvement</span>
              </div>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Invoice Trend</h2>
                <Button variant="outline" size="sm">Last 6 Months</Button>
              </div>
              <div className="h-80 w-full">
                <div className="flex h-full items-end gap-2">
                  {analytics.invoicesByMonth.map((month, i) => (
                    <div key={i} className="relative flex h-full flex-1 flex-col justify-end">
                      <div 
                        className="bg-primary rounded-t w-full" 
                        style={{ height: `${(month.count / Math.max(...analytics.invoicesByMonth.map(m => m.count))) * 70}%` }}
                      ></div>
                      <div className="mt-2 text-xs text-muted-foreground">{month.month.substring(5)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Status Distribution</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(analytics.statusDistribution).map(([status, count]) => (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          status === 'APPROVED' || status === 'PAID' || status === 'MATCHED' ? 'success' :
                          status === 'PENDING_APPROVAL' || status === 'PENDING_MATCHING' ? 'secondary' :
                          status === 'EXCEPTION' ? 'warning' :
                          status === 'REJECTED' || status === 'DISPUTED' ? 'destructive' :
                          'default'
                        }>
                          {status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div 
                        className={`h-2 rounded-full ${
                          status === 'APPROVED' || status === 'PAID' || status === 'MATCHED' ? 'bg-green-500' :
                          status === 'PENDING_APPROVAL' || status === 'PENDING_MATCHING' ? 'bg-blue-500' :
                          status === 'EXCEPTION' ? 'bg-amber-500' :
                          status === 'REJECTED' || status === 'DISPUTED' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${(count / analytics.totalInvoices) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Top Suppliers</h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/invoices')}>View All</Button>
              </div>
              <div className="space-y-4">
                {analytics.topSuppliers.map((supplier, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{supplier.supplierName}</p>
                        <p className="text-sm text-muted-foreground">{supplier.invoiceCount} invoices</p>
                      </div>
                    </div>
                    <p className="font-medium">${supplier.totalAmount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Upcoming Payments</h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/invoices?status=SCHEDULED')}>View All</Button>
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                        <Calendar className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">INV-{String(2024001 + i).padStart(6, '0')}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">${(1000 * (i + 1)).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                  <p className="text-2xl font-bold">{analytics.statusDistribution.PENDING_APPROVAL || 0}</p>
                </div>
                <div className="rounded-full bg-amber-500/10 p-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/invoices?status=PENDING_APPROVAL')}
                >
                  View Invoices
                </Button>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Exceptions</p>
                  <p className="text-2xl font-bold">{analytics.statusDistribution.EXCEPTION || 0}</p>
                </div>
                <div className="rounded-full bg-red-500/10 p-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/invoices?status=EXCEPTION')}
                >
                  View Exceptions
                </Button>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Disputes</p>
                  <p className="text-2xl font-bold">{analytics.statusDistribution.DISPUTED || 0}</p>
                </div>
                <div className="rounded-full bg-orange-500/10 p-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/invoices?status=DISPUTED')}
                >
                  View Disputes
                </Button>
              </div>
            </Card>
            
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ready to Pay</p>
                  <p className="text-2xl font-bold">{analytics.statusDistribution.APPROVED || 0}</p>
                </div>
                <div className="rounded-full bg-green-500/10 p-3">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/invoices?status=APPROVED')}
                >
                  View Approved
                </Button>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p>Failed to load analytics data.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}