import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useProcessInvoiceImage, useCreateInvoice } from '@/hooks/useInvoice';
import { Upload, FileText, CheckCircle, AlertTriangle, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Mock supplier options for demo
const supplierOptions = [
  { label: 'Supplier 1', value: 'supplier-1' },
  { label: 'Supplier 2', value: 'supplier-2' },
  { label: 'Supplier 3', value: 'supplier-3' },
  { label: 'Supplier 4', value: 'supplier-4' },
  { label: 'Supplier 5', value: 'supplier-5' },
];

// Currency options
const currencyOptions = [
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' },
  { label: 'CAD - Canadian Dollar', value: 'CAD' },
  { label: 'AUD - Australian Dollar', value: 'AUD' },
];

// Payment terms options
const paymentTermsOptions = [
  { label: 'Net 30', value: 'Net 30' },
  { label: 'Net 15', value: 'Net 15' },
  { label: 'Net 60', value: 'Net 60' },
  { label: 'Due on Receipt', value: 'Due on Receipt' },
  { label: '2/10 Net 30', value: '2/10 Net 30' },
];

// Unit of measure options
const unitOfMeasureOptions = [
  { label: 'Each (EA)', value: 'EA' },
  { label: 'Hours (HR)', value: 'HR' },
  { label: 'Pounds (LB)', value: 'LB' },
  { label: 'Kilograms (KG)', value: 'KG' },
  { label: 'Meters (M)', value: 'M' },
  { label: 'Feet (FT)', value: 'FT' },
];

export function InvoiceCapture() {
  const navigate = useNavigate();
  const { mutate: processImage, isLoading: isProcessing, data: ocrResult } = useProcessInvoiceImage();
  const { mutate: createInvoice, isLoading: isCreating } = useCreateInvoice();
  
  const [file, setFile] = useState<File | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    supplierId: '',
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    amount: 0,
    taxAmount: 0,
    totalAmount: 0,
    currency: 'USD',
    paymentTerms: 'Net 30',
    description: '',
    lineItems: [
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        unitOfMeasure: 'EA',
        taxAmount: 0,
      }
    ],
  });
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileUploaded(true);
      
      // Process the image with OCR
      processImage(selectedFile);
    }
  };
  
  // Update form data when OCR results are available
  React.useEffect(() => {
    if (ocrResult?.data.extractedData) {
      const data = ocrResult.data.extractedData;
      
      // Create line items from extracted data
      const lineItems = data.lineItems?.map(item => ({
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        unitOfMeasure: 'EA',
        taxAmount: 0,
      })) || formData.lineItems;
      
      setFormData({
        invoiceNumber: data.invoiceNumber || '',
        supplierId: '',
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: data.amount || 0,
        taxAmount: data.taxAmount || 0,
        totalAmount: data.totalAmount || 0,
        currency: data.currency || 'USD',
        paymentTerms: 'Net 30',
        description: '',
        lineItems,
      });
    }
  }, [ocrResult]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleLineItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newLineItems = [...prev.lineItems];
      newLineItems[index] = {
        ...newLineItems[index],
        [field]: value
      };
      
      // Recalculate totals
      const amount = newLineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = newLineItems.reduce((sum, item) => sum + item.taxAmount, 0);
      
      return {
        ...prev,
        lineItems: newLineItems,
        amount,
        taxAmount,
        totalAmount: amount + taxAmount
      };
    });
  };
  
  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          description: '',
          quantity: 1,
          unitPrice: 0,
          unitOfMeasure: 'EA',
          taxAmount: 0,
        }
      ]
    }));
  };
  
  const removeLineItem = (index: number) => {
    if (formData.lineItems.length > 1) {
      setFormData(prev => {
        const newLineItems = prev.lineItems.filter((_, i) => i !== index);
        
        // Recalculate totals
        const amount = newLineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxAmount = newLineItems.reduce((sum, item) => sum + item.taxAmount, 0);
        
        return {
          ...prev,
          lineItems: newLineItems,
          amount,
          taxAmount,
          totalAmount: amount + taxAmount
        };
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createInvoice({
      invoiceNumber: formData.invoiceNumber,
      supplierId: formData.supplierId,
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      amount: formData.amount,
      taxAmount: formData.taxAmount,
      currency: formData.currency,
      paymentTerms: formData.paymentTerms,
      description: formData.description,
      lineItems: formData.lineItems,
    }, {
      onSuccess: () => {
        navigate('/invoices');
      }
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Invoice Capture</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Upload Invoice</h2>
              
              {!fileUploaded ? (
                <div 
                  className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">PDF, JPG, or PNG (max. 10MB)</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg border">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{file?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file?.size ? (file.size / 1024 / 1024).toFixed(2) : '0')} MB
                      </p>
                    </div>
                    <Badge variant="outline">Uploaded</Badge>
                  </div>
                  
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center p-6">
                      <LoadingSpinner size="lg" className="mb-4" />
                      <p className="text-center text-muted-foreground">Processing invoice with OCR...</p>
                      <p className="text-center text-sm text-muted-foreground mt-2">This may take a few moments</p>
                    </div>
                  ) : ocrResult ? (
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h3 className="font-medium">OCR Processing Complete</h3>
                        <Badge variant="outline" className="ml-auto">
                          {Math.round(ocrResult.data.confidence * 100)}% Confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The invoice has been processed and data has been extracted. Please review and edit the information below if needed.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <h3 className="font-medium">Waiting for Processing</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Click the button below to process the invoice with OCR.
                      </p>
                      <Button 
                        className="mt-4 w-full" 
                        onClick={() => file && processImage(file)}
                      >
                        Process Invoice
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFile(null);
                        setFileUploaded(false);
                      }}
                    >
                      Upload Different File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {ocrResult && (
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">OCR Preview</h2>
                <div className="aspect-[8.5/11] bg-muted rounded-lg flex flex-col items-center justify-center p-6">
                  <div className="w-full h-full border-2 border-dashed border-muted-foreground rounded-lg p-8 flex flex-col">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-bold">INVOICE</h3>
                      <p className="text-sm text-muted-foreground">{formData.invoiceNumber}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <h4 className="text-sm font-medium">Invoice Date</h4>
                        <p>{formData.invoiceDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Due Date</h4>
                        <p>{formData.dueDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-sm font-medium mb-2">Items</h4>
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left py-1">Description</th>
                            <th className="text-right py-1">Quantity</th>
                            <th className="text-right py-1">Unit Price</th>
                            <th className="text-right py-1">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.lineItems.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-1">{item.description || 'Item ' + (index + 1)}</td>
                              <td className="text-right py-1">{item.quantity}</td>
                              <td className="text-right py-1">{formData.currency} {item.unitPrice.toLocaleString()}</td>
                              <td className="text-right py-1">{formData.currency} {(item.quantity * item.unitPrice).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} className="text-right py-1 font-medium">Subtotal:</td>
                            <td className="text-right py-1">{formData.currency} {formData.amount.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="text-right py-1 font-medium">Tax:</td>
                            <td className="text-right py-1">{formData.currency} {formData.taxAmount.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="text-right py-1 font-medium">Total:</td>
                            <td className="text-right py-1 font-bold">{formData.currency} {formData.totalAmount.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleInputChange}
                      placeholder="Enter invoice number"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supplierId">Supplier</Label>
                    <Select
                      id="supplierId"
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {supplierOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Invoice Date</Label>
                    <DatePicker
                      selected={formData.invoiceDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, invoiceDate: date || new Date() }))}
                      className="w-full rounded-md border p-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <DatePicker
                      selected={formData.dueDate}
                      onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date || new Date() }))}
                      minDate={formData.invoiceDate}
                      className="w-full rounded-md border p-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      required
                    >
                      {currencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select
                      id="paymentTerms"
                      name="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={handleInputChange}
                      required
                    >
                      {paymentTermsOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter invoice description"
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Line Items</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLineItem}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Line Item
                    </Button>
                  </div>
                  
                  {formData.lineItems.map((item, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor={`lineItems.${index}.description`}>Description</Label>
                          <Input
                            id={`lineItems.${index}.description`}
                            value={item.description}
                            onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                            placeholder="Enter description"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`lineItems.${index}.quantity`}>Quantity</Label>
                          <Input
                            id={`lineItems.${index}.quantity`}
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value))}
                            min="0.01"
                            step="0.01"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`lineItems.${index}.unitPrice`}>Unit Price</Label>
                          <Input
                            id={`lineItems.${index}.unitPrice`}
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`lineItems.${index}.unitOfMeasure`}>Unit of Measure</Label>
                          <Select
                            id={`lineItems.${index}.unitOfMeasure`}
                            value={item.unitOfMeasure}
                            onChange={(e) => handleLineItemChange(index, 'unitOfMeasure', e.target.value)}
                            required
                          >
                            {unitOfMeasureOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`lineItems.${index}.taxAmount`}>Tax Amount</Label>
                          <Input
                            id={`lineItems.${index}.taxAmount`}
                            type="number"
                            value={item.taxAmount}
                            onChange={(e) => handleLineItemChange(index, 'taxAmount', parseFloat(e.target.value))}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Line Total:</span>{' '}
                          <span className="font-medium">
                            {formData.currency} {(
                              item.quantity * item.unitPrice + item.taxAmount
                            ).toLocaleString()}
                          </span>
                        </div>
                        
                        {formData.lineItems.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-4">Invoice Totals</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium">{formData.currency} {formData.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax:</span>
                      <span>{formData.currency} {formData.taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">{formData.currency} {formData.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/invoices')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isCreating || !formData.supplierId}
                    className="flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4" />
                        Create Invoice
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}