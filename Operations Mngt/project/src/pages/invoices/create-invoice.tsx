import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2, FileText } from 'lucide-react';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormSection } from '@/components/form';
import { Button } from '@/components/ui/button';
import { useInvoice } from '@/hooks/useInvoice';
import type { InvoiceFormData } from '@/types/invoice';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  poNumbers: z.array(z.string()).optional(),
  supplierId: z.string().min(1, 'Supplier is required'),
  invoiceDate: z.date(),
  dueDate: z.date(),
  amount: z.number().min(0, 'Amount must be greater than or equal to 0'),
  taxAmount: z.number().min(0, 'Tax amount must be greater than or equal to 0'),
  currency: z.string().min(1, 'Currency is required'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  description: z.string().optional(),
  lineItems: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unitPrice: z.number().min(0, 'Unit price must be greater than or equal to 0'),
    unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
    taxAmount: z.number().min(0, 'Tax amount must be greater than or equal to 0'),
    poLineItem: z.object({
      poNumber: z.string().min(1, 'PO number is required'),
      lineNumber: z.number().min(1, 'Line number is required'),
      itemCode: z.string().min(1, 'Item code is required'),
    }).optional(),
    accountCode: z.string().optional(),
    taxCode: z.string().optional(),
  })).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

const currencyOptions = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
  { label: 'CAD (C$)', value: 'CAD' },
  { label: 'AUD (A$)', value: 'AUD' },
];

const paymentTermsOptions = [
  { label: 'Net 15', value: 'Net 15' },
  { label: 'Net 30', value: 'Net 30' },
  { label: 'Net 45', value: 'Net 45' },
  { label: 'Net 60', value: 'Net 60' },
  { label: '2/10 Net 30', value: '2/10 Net 30' },
];

const unitOfMeasureOptions = [
  { label: 'Each', value: 'EA' },
  { label: 'Hour', value: 'HR' },
  { label: 'Day', value: 'DAY' },
  { label: 'Kilogram', value: 'KG' },
  { label: 'Liter', value: 'L' },
  { label: 'Meter', value: 'M' },
  { label: 'Square Meter', value: 'M2' },
  { label: 'Cubic Meter', value: 'M3' },
];

// Mock supplier options for demo
const supplierOptions = [
  { label: 'Supplier 1', value: 'supplier-1' },
  { label: 'Supplier 2', value: 'supplier-2' },
  { label: 'Supplier 3', value: 'supplier-3' },
  { label: 'Supplier 4', value: 'supplier-4' },
  { label: 'Supplier 5', value: 'supplier-5' },
];

// Mock PO options for demo
const poOptions = [
  { label: 'PO-2024-0001', value: 'PO-2024-0001' },
  { label: 'PO-2024-0002', value: 'PO-2024-0002' },
  { label: 'PO-2024-0003', value: 'PO-2024-0003' },
];

const defaultValues: InvoiceFormValues = {
  invoiceNumber: '',
  poNumbers: [],
  supplierId: '',
  invoiceDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Net 30
  amount: 0,
  taxAmount: 0,
  currency: 'USD',
  paymentTerms: 'Net 30',
  lineItems: [
    {
      description: '',
      quantity: 1,
      unitPrice: 0,
      unitOfMeasure: 'EA',
      taxAmount: 0,
    },
  ],
};

export function CreateInvoice() {
  const navigate = useNavigate();
  const { useCreateInvoice } = useInvoice();
  const { mutate: createInvoice, isLoading } = useCreateInvoice();

  const onSubmit = async (data: InvoiceFormValues) => {
    const formData: InvoiceFormData = {
      ...data,
    };

    createInvoice(formData, {
      onSuccess: () => {
        navigate('/invoices');
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Create Invoice</h1>
      </div>

      <FormContainer
        title="Invoice Information"
        description="Enter the details for the new invoice"
        schema={invoiceSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Creating...' : 'Create Invoice'}
        cancelText="Cancel"
        onCancel={() => navigate('/invoices')}
        showReset
      >
        {({ control, register, setValue, getValues, watch }) => {
          const { fields, append, remove } = useFieldArray({
            control,
            name: 'lineItems',
          });

          // Watch line items to calculate totals
          const lineItems = watch('lineItems');
          const amount = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
          const taxAmount = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
          
          // Update totals when line items change
          React.useEffect(() => {
            setValue('amount', amount);
            setValue('taxAmount', taxAmount);
          }, [lineItems, setValue, amount, taxAmount]);

          return (
            <>
              <FormSection title="Basic Information">
                <FormInput
                  name="invoiceNumber"
                  label="Invoice Number"
                  placeholder="Enter invoice number"
                />
                <FormSelect
                  name="supplierId"
                  label="Supplier"
                  options={supplierOptions}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Date</label>
                  <DatePicker
                    selected={getValues('invoiceDate')}
                    onChange={(date) => setValue('invoiceDate', date)}
                    className="w-full rounded-md border p-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <DatePicker
                    selected={getValues('dueDate')}
                    onChange={(date) => setValue('dueDate', date)}
                    minDate={getValues('invoiceDate')}
                    className="w-full rounded-md border p-2"
                  />
                </div>
                <FormSelect
                  name="currency"
                  label="Currency"
                  options={currencyOptions}
                />
                <FormSelect
                  name="paymentTerms"
                  label="Payment Terms"
                  options={paymentTermsOptions}
                />
                <FormInput
                  name="poNumbers"
                  label="PO Numbers"
                  placeholder="Enter comma-separated PO numbers"
                />
                <FormTextarea
                  name="description"
                  label="Description"
                  placeholder="Enter invoice description"
                />
              </FormSection>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Line Items</h2>
                  <Button
                    type="button"
                    onClick={() =>
                      append({
                        description: '',
                        quantity: 1,
                        unitPrice: 0,
                        unitOfMeasure: 'EA',
                        taxAmount: 0,
                      })
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Line Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border p-6"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <FormInput
                        name={`lineItems.${index}.description`}
                        label="Description"
                        placeholder="Enter description"
                        className="col-span-2"
                      />
                      <FormInput
                        name={`lineItems.${index}.quantity`}
                        label="Quantity"
                        type="number"
                        min="0.01"
                        step="0.01"
                      />
                      <FormInput
                        name={`lineItems.${index}.unitPrice`}
                        label="Unit Price"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                      <FormSelect
                        name={`lineItems.${index}.unitOfMeasure`}
                        label="Unit of Measure"
                        options={unitOfMeasureOptions}
                      />
                      <FormInput
                        name={`lineItems.${index}.taxAmount`}
                        label="Tax Amount"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                      <FormInput
                        name={`lineItems.${index}.accountCode`}
                        label="Account Code (Optional)"
                        placeholder="Enter account code"
                      />
                      <FormInput
                        name={`lineItems.${index}.taxCode`}
                        label="Tax Code (Optional)"
                        placeholder="Enter tax code"
                      />
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Line Total:</span>{' '}
                        <span className="font-medium">
                          {getValues('currency')} {(
                            getValues(`lineItems.${index}.quantity`) * 
                            getValues(`lineItems.${index}.unitPrice`) + 
                            getValues(`lineItems.${index}.taxAmount`)
                          ).toLocaleString()}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Invoice Totals</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">{getValues('currency')} {amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>{getValues('currency')} {taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">{getValues('currency')} {(amount + taxAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <FormSection title="Additional Information">
                <FormTextarea
                  name="notes"
                  label="Notes"
                  placeholder="Enter any additional notes"
                  className="col-span-2"
                />
              </FormSection>
            </>
          );
        }}
      </FormContainer>
    </div>
  );
}