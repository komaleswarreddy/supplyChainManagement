import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useInvoice } from '@/hooks/useInvoice';
import { Calendar, DollarSign, ArrowLeft, Calculator, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PaymentMethod } from '@/types/invoice';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const paymentMethodOptions = [
  { label: 'ACH', value: 'ACH' },
  { label: 'Check', value: 'CHECK' },
  { label: 'Wire Transfer', value: 'WIRE' },
  { label: 'Credit Card', value: 'CREDIT_CARD' },
  { label: 'Other', value: 'OTHER' },
];

export function PaymentSchedule() {
  const navigate = useNavigate();
  const location = useLocation();
  const { invoiceId } = location.state || {};
  
  const { useInvoice, useSchedulePayment } = useInvoice();
  const { data: invoice, isLoading: isLoadingInvoice } = useInvoice(invoiceId);
  const { mutate: schedulePayment, isLoading: isScheduling } = useSchedulePayment();
  
  const [formData, setFormData] = useState({
    scheduledDate: new Date(),
    method: 'ACH' as PaymentMethod,
    reference: '',
    applyDiscount: false,
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (invoiceId && invoice) {
      schedulePayment({
        id: invoiceId,
        paymentData: {
          scheduledDate: formData.scheduledDate,
          method: formData.method,
          amount: invoice.totalAmount,
          reference: formData.reference,
          applyEarlyPaymentDiscount: formData.applyDiscount,
        }
      }, {
        onSuccess: () => {
          navigate(`/invoices/${invoiceId}`);
        }
      });
    }
  };
  
  // Calculate early payment discount
  const calculateDiscount = () => {
    if (!invoice) return { discountAmount: 0, discountedTotal: 0 };
    
    const discountPercent = 2; // Assume 2% discount
    const discountAmount = invoice.totalAmount * (discountPercent / 100);
    const discountedTotal = invoice.totalAmount - discountAmount;
    
    return { discountAmount, discountedTotal };
  };
  
  const { discountAmount, discountedTotal } = calculateDiscount();
  
  if (isLoadingInvoice) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!invoice) {
    return (
      <div className="p-6">
        <p>Invoice not found.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/invoices')}
        >
          Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Calendar className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Schedule Payment</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(`/invoices/${invoiceId}`)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">Schedule Payment for Invoice {invoice.invoiceNumber}</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Payment Date</Label>
                    <DatePicker
                      id="scheduledDate"
                      selected={formData.scheduledDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, scheduledDate: date || new Date() }))}
                      minDate={new Date()}
                      className="w-full rounded-md border p-2"
                    />
                    <p className="text-sm text-muted-foreground">
                      Select the date when the payment should be processed
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select
                      id="method"
                      name="method"
                      value={formData.method}
                      onChange={handleInputChange}
                      required
                    >
                      {paymentMethodOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference (Optional)</Label>
                    <Input
                      id="reference"
                      name="reference"
                      value={formData.reference}
                      onChange={handleInputChange}
                      placeholder="Enter payment reference"
                    />
                    <p className="text-sm text-muted-foreground">
                      This will be used as a reference in your payment system
                    </p>
                  </div>
                  
                  <div className="rounded-lg border p-4 bg-muted/20">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="applyDiscount"
                        name="applyDiscount"
                        checked={formData.applyDiscount}
                        onChange={handleInputChange}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="applyDiscount" className="font-medium">
                        Apply Early Payment Discount (2%)
                      </Label>
                    </div>
                    
                    {formData.applyDiscount && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Original Amount:</span>
                          <span>{invoice.currency} {invoice.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Discount (2%):</span>
                          <span className="text-green-600">- {invoice.currency} {discountAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t">
                          <span>Amount to Pay:</span>
                          <span>{invoice.currency} {discountedTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate(`/invoices/${invoiceId}`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isScheduling}
                    className="flex items-center gap-2"
                  >
                    {isScheduling ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4" />
                        Schedule Payment
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div>
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Invoice Summary</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Number</p>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier</p>
                    <p>{invoice.supplier.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Date</p>
                    <p>{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p>{new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{invoice.currency} {invoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>{invoice.currency} {invoice.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{invoice.currency} {invoice.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card mt-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Early Payment Benefits</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calculator className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Save with Early Payment</p>
                    <p className="text-sm text-muted-foreground">
                      Pay early and save {invoice.currency} {discountAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium">Improve Supplier Relations</p>
                    <p className="text-sm text-muted-foreground">
                      Early payments help build stronger supplier relationships
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="font-medium">Optimize Cash Flow</p>
                    <p className="text-sm text-muted-foreground">
                      Strategic payment timing helps optimize your cash flow
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}