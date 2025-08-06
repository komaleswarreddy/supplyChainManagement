import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useInvoice } from '@/hooks/useInvoice';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { DisputeReason } from '@/types/invoice';

const disputeReasonOptions = [
  { label: 'Incorrect Price', value: 'INCORRECT_PRICE' },
  { label: 'Incorrect Quantity', value: 'INCORRECT_QUANTITY' },
  { label: 'Damaged Goods', value: 'DAMAGED_GOODS' },
  { label: 'Goods Not Received', value: 'GOODS_NOT_RECEIVED' },
  { label: 'Duplicate Billing', value: 'DUPLICATE_BILLING' },
  { label: 'Incorrect Tax', value: 'INCORRECT_TAX' },
  { label: 'Incorrect Terms', value: 'INCORRECT_TERMS' },
  { label: 'Other', value: 'OTHER' },
];

export function DisputeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useInvoice, useCreateDispute } = useInvoice();
  const { data: invoice, isLoading: isLoadingInvoice } = useInvoice(id!);
  const { mutate: createDispute, isLoading: isCreatingDispute } = useCreateDispute();
  
  const [formData, setFormData] = useState({
    reason: 'INCORRECT_PRICE' as DisputeReason,
    description: '',
    amount: 0,
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (id) {
      createDispute({
        id,
        dispute: {
          reason: formData.reason,
          description: formData.description,
          amount: formData.amount,
        }
      }, {
        onSuccess: () => {
          navigate(`/invoices/${id}`);
        }
      });
    }
  };
  
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
        <MessageSquare className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Create Dispute</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(`/invoices/${id}`)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">Dispute for Invoice {invoice.invoiceNumber}</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Dispute Reason</Label>
                    <Select
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      required
                    >
                      {disputeReasonOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Dispute Amount</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleInputChange}
                      min="0.01"
                      step="0.01"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter the amount being disputed. For full invoice disputes, enter the total amount: {invoice.currency} {invoice.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Provide detailed information about the dispute"
                      rows={5}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate(`/invoices/${id}`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isCreatingDispute || !formData.description || formData.amount <= 0}
                    className="flex items-center gap-2"
                  >
                    {isCreatingDispute ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Dispute'
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
              <h2 className="text-lg font-semibold mb-4">Dispute Guidelines</h2>
              <div className="space-y-4 text-sm">
                <p>
                  <span className="font-medium">Be specific:</span> Clearly state the reason for the dispute and provide all relevant details.
                </p>
                <p>
                  <span className="font-medium">Include evidence:</span> Attach any supporting documentation after creating the dispute.
                </p>
                <p>
                  <span className="font-medium">Be professional:</span> Maintain a professional tone in all communications.
                </p>
                <p>
                  <span className="font-medium">Follow up:</span> Monitor the dispute and respond promptly to any communications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}