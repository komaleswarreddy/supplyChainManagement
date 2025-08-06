import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTaxCompliance } from '@/hooks/useTaxCompliance';
import { ArrowLeft, FileText, FileCheck, Download, ExternalLink, Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const statusColors = {
  PENDING: 'warning',
  FILED: 'success',
  AMENDED: 'secondary',
  EXTENDED: 'secondary',
  LATE: 'destructive',
};

export function TaxReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const [filingNotes, setFilingNotes] = React.useState('');
  const [reportUrl, setReportUrl] = React.useState('');
  
  const { 
    useTaxReport, 
    useFileTaxReport 
  } = useTaxCompliance();
  
  const { data: report, isLoading } = useTaxReport(id!);
  const { mutate: fileTaxReport, isLoading: isFiling } = useFileTaxReport();

  const handleFileTaxReport = (status: 'FILED' | 'AMENDED' | 'EXTENDED' | 'LATE') => {
    confirm(() => {
      fileTaxReport({
        id: id!,
        filingData: {
          filingStatus: status,
          notes: filingNotes,
          reportUrl: reportUrl || undefined,
        }
      });
    });
  };

  if (isLoading || !report) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isPastDue = new Date(report.dueDate) < new Date() && report.filingStatus === 'PENDING';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/tax-compliance/tax-reports')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{report.reportName}</h1>
                <p className="text-sm text-muted-foreground">
                  {report.jurisdiction} - {report.period}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[report.filingStatus]} className="h-6 px-3 text-sm">
              {report.filingStatus}
            </Badge>
            {isPastDue && (
              <Badge variant="destructive" className="h-6 px-3 text-sm">
                PAST DUE
              </Badge>
            )}
          </div>
        </div>

        {isPastDue && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Report Past Due</h3>
                <p className="text-sm text-red-700">
                  This report was due on {format(new Date(report.dueDate), 'PP')} and is now past due. 
                  Please file as soon as possible to avoid penalties.
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            {report.detailData && <TabsTrigger value="transactions">Transactions</TabsTrigger>}
            <TabsTrigger value="filing">Filing</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Report Information</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Report Type</h3>
                    <p className="mt-1 font-medium">{report.reportType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Jurisdiction</h3>
                    <p className="mt-1">{report.jurisdiction}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Period</h3>
                    <p className="mt-1">{report.period}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                    <p className="mt-1">{format(new Date(report.startDate), 'PP')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                    <p className="mt-1">{format(new Date(report.endDate), 'PP')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                    <p className={`mt-1 ${isPastDue ? 'text-red-600 font-medium' : ''}`}>
                      {format(new Date(report.dueDate), 'PP')}
                      {isPastDue && ' (Past Due)'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p className="mt-1">
                      <Badge variant={statusColors[report.filingStatus]}>
                        {report.filingStatus}
                      </Badge>
                    </p>
                  </div>
                  {report.filedBy && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Filed By</h3>
                      <p className="mt-1">{report.filedBy.name}</p>
                    </div>
                  )}
                  {report.filedAt && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Filed At</h3>
                      <p className="mt-1">{format(new Date(report.filedAt), 'PPp')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Tax Summary</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Tax Type</th>
                        <th className="text-right py-2 px-4">Taxable Amount</th>
                        <th className="text-right py-2 px-4">Tax Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.summary.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{item.taxType.replace('_', ' ')}</td>
                          <td className="py-2 px-4 text-right">{report.currency} {item.taxableAmount.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right">{report.currency} {item.taxAmount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2">
                        <td colSpan={2} className="py-2 px-4 font-medium">Total Tax</td>
                        <td className="py-2 px-4 text-right font-bold">{report.currency} {report.totalTaxAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {report.notes && (
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-2">Notes</h2>
                <p>{report.notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Report Details</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Reporting Period</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="font-medium">{format(new Date(report.startDate), 'PP')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">End Date</p>
                        <p className="font-medium">{format(new Date(report.endDate), 'PP')}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Filing Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Due Date</p>
                        <p className={`font-medium ${isPastDue ? 'text-red-600' : ''}`}>
                          {format(new Date(report.dueDate), 'PP')}
                          {isPastDue && ' (Past Due)'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={statusColors[report.filingStatus]}>
                          {report.filingStatus}
                        </Badge>
                      </div>
                      {report.filedAt && (
                        <div>
                          <p className="text-sm text-muted-foreground">Filed Date</p>
                          <p className="font-medium">{format(new Date(report.filedAt), 'PP')}</p>
                        </div>
                      )}
                      {report.filedBy && (
                        <div>
                          <p className="text-sm text-muted-foreground">Filed By</p>
                          <p className="font-medium">{report.filedBy.name}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {report.reportUrl && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Report Document</h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(report.reportUrl, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Report
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {report.detailData && (
            <TabsContent value="transactions" className="space-y-4">
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Transaction Details</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Invoice #</th>
                          <th className="text-left py-2 px-4">Date</th>
                          <th className="text-left py-2 px-4">Supplier</th>
                          <th className="text-left py-2 px-4">Tax Type</th>
                          <th className="text-right py-2 px-4">Taxable Amount</th>
                          <th className="text-right py-2 px-4">Tax Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.detailData.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-4">{item.invoiceNumber}</td>
                            <td className="py-2 px-4">{format(new Date(item.invoiceDate), 'PP')}</td>
                            <td className="py-2 px-4">{item.supplier.name}</td>
                            <td className="py-2 px-4">{item.taxType.replace('_', ' ')}</td>
                            <td className="py-2 px-4 text-right">{report.currency} {item.taxableAmount.toLocaleString()}</td>
                            <td className="py-2 px-4 text-right">{report.currency} {item.taxAmount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2">
                          <td colSpan={5} className="py-2 px-4 font-medium">Total</td>
                          <td className="py-2 px-4 text-right font-bold">{report.currency} {report.totalTaxAmount.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          <TabsContent value="filing" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Filing Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      report.filingStatus === 'FILED' || report.filingStatus === 'AMENDED' 
                        ? 'bg-green-100' 
                        : 'bg-amber-100'
                    }`}>
                      {report.filingStatus === 'FILED' || report.filingStatus === 'AMENDED' 
                        ? <FileCheck className={`h-5 w-5 text-green-600`} />
                        : <Calendar className={`h-5 w-5 text-amber-600`} />
                      }
                    </div>
                    <div>
                      <p className="font-medium">
                        {report.filingStatus === 'FILED' || report.filingStatus === 'AMENDED' 
                          ? 'Report Filed' 
                          : report.filingStatus === 'EXTENDED'
                          ? 'Filing Extended'
                          : 'Pending Filing'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {report.filingStatus === 'FILED' || report.filingStatus === 'AMENDED' 
                          ? `Filed on ${format(new Date(report.filedAt!), 'PP')} by ${report.filedBy!.name}` 
                          : `Due on ${format(new Date(report.dueDate), 'PP')}`}
                      </p>
                    </div>
                  </div>

                  {report.filingStatus === 'PENDING' && (
                    <div className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="reportUrl">Report URL (Optional)</Label>
                        <Input
                          id="reportUrl"
                          value={reportUrl}
                          onChange={(e) => setReportUrl(e.target.value)}
                          placeholder="Enter URL to the filed report"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="filingNotes">Filing Notes (Optional)</Label>
                        <Textarea
                          id="filingNotes"
                          value={filingNotes}
                          onChange={(e) => setFilingNotes(e.target.value)}
                          placeholder="Enter any notes about the filing"
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          onClick={() => handleFileTaxReport('FILED')}
                          disabled={isFiling}
                          className="flex items-center gap-2"
                        >
                          {isFiling ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Filing...
                            </>
                          ) : (
                            <>
                              <FileCheck className="h-4 w-4" />
                              Mark as Filed
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={() => handleFileTaxReport('EXTENDED')}
                          disabled={isFiling}
                          className="flex items-center gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          Mark as Extended
                        </Button>
                        
                        {isPastDue && (
                          <Button 
                            variant="destructive"
                            onClick={() => handleFileTaxReport('LATE')}
                            disabled={isFiling}
                            className="flex items-center gap-2"
                          >
                            <Calendar className="h-4 w-4" />
                            Mark as Filed Late
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {(report.filingStatus === 'FILED' || report.filingStatus === 'AMENDED') && (
                    <div className="space-y-4 mt-6">
                      <Button 
                        variant="outline"
                        onClick={() => handleFileTaxReport('AMENDED')}
                        disabled={isFiling || report.filingStatus === 'AMENDED'}
                        className="flex items-center gap-2"
                      >
                        {isFiling ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FileCheck className="h-4 w-4" />
                            Mark as Amended
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {report.reportUrl && (
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Filed Report</h2>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Tax Report Document</p>
                      <p className="text-sm text-muted-foreground">
                        Filed on {report.filedAt ? format(new Date(report.filedAt), 'PP') : 'N/A'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(report.reportUrl, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Filing Status Change"
        description="Are you sure you want to update the filing status of this tax report? This action will be recorded for audit purposes."
        confirmText="Update Status"
        onConfirm={onConfirm}
      />
    </div>
  );
}