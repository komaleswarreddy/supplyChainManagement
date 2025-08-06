import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTaxCompliance } from '@/hooks/useTaxCompliance';
import { ArrowLeft, Calculator, FileText, ExternalLink } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function TaxDeterminationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useTaxDetermination } = useTaxCompliance();
  const { data: determination, isLoading } = useTaxDetermination(id!);

  if (isLoading || !determination) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/tax-compliance/tax-determination')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Calculator className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Tax Determination</h1>
                <p className="text-sm text-muted-foreground">
                  Invoice: {determination.invoiceNumber}
                </p>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/invoices/${determination.invoiceId}`)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            View Invoice
          </Button>
        </div>

        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="line-items">Line Items</TabsTrigger>
            <TabsTrigger value="tax-details">Tax Details</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Determination Summary</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Invoice Number</h3>
                    <p className="mt-1 font-medium">{determination.invoiceNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Supplier</h3>
                    <p className="mt-1">{determination.supplier.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Determination Date</h3>
                    <p className="mt-1">{format(new Date(determination.determinationDate), 'PPp')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Taxable Amount</h3>
                    <p className="mt-1 font-medium">{determination.currency} {determination.totalTaxableAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Tax Amount</h3>
                    <p className="mt-1 font-medium">{determination.currency} {determination.totalTaxAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Effective Tax Rate</h3>
                    <p className="mt-1 font-medium">
                      {determination.totalTaxableAmount > 0 
                        ? ((determination.totalTaxAmount / determination.totalTaxableAmount) * 100).toFixed(2) 
                        : '0.00'}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Tax Summary by Jurisdiction</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Jurisdiction</th>
                        <th className="text-left py-2 px-4">Tax Type</th>
                        <th className="text-right py-2 px-4">Taxable Amount</th>
                        <th className="text-right py-2 px-4">Rate</th>
                        <th className="text-right py-2 px-4">Tax Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Group taxes by jurisdiction and type */}
                      {determination.lineItems.flatMap(item => 
                        item.taxes.map(tax => ({
                          jurisdiction: tax.jurisdiction,
                          taxType: tax.taxType,
                          taxableAmount: item.taxableAmount,
                          rate: tax.rate,
                          amount: tax.amount,
                        }))
                      ).reduce((acc, tax) => {
                        const key = `${tax.jurisdiction}-${tax.taxType}`;
                        if (!acc[key]) {
                          acc[key] = {
                            jurisdiction: tax.jurisdiction,
                            taxType: tax.taxType,
                            taxableAmount: 0,
                            rate: tax.rate,
                            amount: 0,
                          };
                        }
                        acc[key].taxableAmount += tax.taxableAmount;
                        acc[key].amount += tax.amount;
                        return acc;
                      }, {} as Record<string, {
                        jurisdiction: string;
                        taxType: string;
                        taxableAmount: number;
                        rate: number;
                        amount: number;
                      }>).map((tax, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{tax.jurisdiction.replace('_', ' ')}</td>
                          <td className="py-2 px-4">{tax.taxType.replace('_', ' ')}</td>
                          <td className="py-2 px-4 text-right">{determination.currency} {tax.taxableAmount.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right">{(tax.rate * 100).toFixed(2)}%</td>
                          <td className="py-2 px-4 text-right font-medium">{determination.currency} {tax.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2">
                        <td colSpan={4} className="py-2 px-4 font-medium">Total</td>
                        <td className="py-2 px-4 text-right font-bold">{determination.currency} {determination.totalTaxAmount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="line-items" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Line Items</h2>
                <div className="space-y-6">
                  {determination.lineItems.map((item, index) => (
                    <div key={item.lineItemId} className="rounded-lg border p-4">
                      <div className="flex justify-between mb-4">
                        <h3 className="font-medium">Line Item {index + 1}: {item.description}</h3>
                        <Badge variant={
                          item.exemptionStatus === 'EXEMPT' ? 'success' :
                          item.exemptionStatus === 'PARTIALLY_EXEMPT' ? 'warning' :
                          item.exemptionStatus === 'ZERO_RATED' ? 'secondary' :
                          'default'
                        }>
                          {item.exemptionStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Taxable Amount</h4>
                          <p className="mt-1 font-medium">{determination.currency} {item.taxableAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Tax Code</h4>
                          <p className="mt-1">{item.taxCode}</p>
                        </div>
                        {item.exemptionReason && (
                          <div className="col-span-2">
                            <h4 className="text-sm font-medium text-muted-foreground">Exemption Reason</h4>
                            <p className="mt-1">{item.exemptionReason}</p>
                          </div>
                        )}
                      </div>
                      
                      {item.taxes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Applied Taxes</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 px-4">Jurisdiction</th>
                                  <th className="text-left py-2 px-4">Tax Type</th>
                                  <th className="text-right py-2 px-4">Rate</th>
                                  <th className="text-right py-2 px-4">Tax Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.taxes.map((tax, taxIndex) => (
                                  <tr key={taxIndex} className="border-b">
                                    <td className="py-2 px-4">{tax.jurisdiction.replace('_', ' ')}</td>
                                    <td className="py-2 px-4">{tax.taxType.replace('_', ' ')}</td>
                                    <td className="py-2 px-4 text-right">{(tax.rate * 100).toFixed(2)}%</td>
                                    <td className="py-2 px-4 text-right">{determination.currency} {tax.amount.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="border-t">
                                  <td colSpan={3} className="py-2 px-4 font-medium">Total Tax</td>
                                  <td className="py-2 px-4 text-right font-medium">
                                    {determination.currency} {item.taxes.reduce((sum, tax) => sum + tax.amount, 0).toLocaleString()}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tax-details" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Tax Rules Applied</h2>
                <div className="space-y-4">
                  {/* Extract unique tax rules */}
                  {Array.from(new Set(
                    determination.lineItems.flatMap(item => 
                      item.taxes.map(tax => tax.taxRuleId)
                    )
                  )).map((ruleId) => (
                    <div key={ruleId} className="rounded-lg border p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">Tax Rule: {ruleId}</h3>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/tax-compliance/tax-rules/${ruleId}`)}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Rule
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>This rule was applied to determine tax for one or more line items.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Tax Calculation Methodology</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium">Calculation Process</h3>
                    <ol className="mt-2 space-y-2 list-decimal list-inside">
                      <li>Determine taxability of each line item based on tax codes and exemption status</li>
                      <li>Apply relevant tax rules based on jurisdiction and tax type</li>
                      <li>Calculate tax amounts using applicable rates</li>
                      <li>Aggregate taxes by jurisdiction and tax type</li>
                      <li>Generate final tax determination</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium">Notes</h3>
                    <ul className="mt-2 space-y-2 list-disc list-inside">
                      <li>Tax rates are applied based on the most current rules as of the determination date</li>
                      <li>Exemptions are applied based on supplier tax documentation status</li>
                      <li>Tax amounts are rounded to the nearest cent</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}