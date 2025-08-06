import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { FormContainer, FormInput, FormSelect, FormSection } from '@/components/form';
import { Button } from '@/components/ui/button';
import { useTaxCompliance } from '@/hooks/useTaxCompliance';
import { useInvoice } from '@/hooks/useInvoice';

const taxDeterminationSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  lineItems: z.array(z.object({
    lineItemId: z.string().min(1, 'Line item ID is required'),
    description: z.string().min(1, 'Description is required'),
    taxableAmount: z.number().min(0, 'Taxable amount must be non-negative'),
    taxCode: z.string().min(1, 'Tax code is required'),
  })).min(1, 'At least one line item is required'),
});

type TaxDeterminationFormData = z.infer<typeof taxDeterminationSchema>;

export function CreateTaxDetermination() {
  const navigate = useNavigate();
  const location = useLocation();
  const { invoiceId } = location.state || {};
  
  const { useCreateTaxDetermination } = useTaxCompliance();
  const { useInvoice } = useInvoice;
  const { data: invoice, isLoading: isLoadingInvoice } = useInvoice(invoiceId);
  const { mutate: createDetermination, isLoading } = useCreateTaxDetermination();

  // Default values based on invoice if available
  const getDefaultValues = (): TaxDeterminationFormData => {
    if (invoice) {
      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        lineItems: invoice.lineItems.map(item => ({
          lineItemId: item.id,
          description: item.description,
          taxableAmount: item.amount,
          taxCode: item.taxCode || 'S1', // Default tax code
        })),
      };
    }
    
    return {
      invoiceId: invoiceId || '',
      invoiceNumber: '',
      lineItems: [
        {
          lineItemId: '',
          description: '',
          taxableAmount: 0,
          taxCode: 'S1', // Default tax code
        },
      ],
    };
  };

  // Mock tax code options
  const taxCodeOptions = [
    { label: 'S1 - Standard Sales Tax', value: 'S1' },
    { label: 'S2 - Reduced Sales Tax', value: 'S2' },
    { label: 'E1 - Exempt', value: 'E1' },
    { label: 'U1 - Use Tax', value: 'U1' },
    { label: 'V1 - VAT Standard', value: 'V1' },
    { label: 'V2 - VAT Reduced', value: 'V2' },
    { label: 'V3 - VAT Zero', value: 'V3' },
  ];

  const onSubmit = async (data: TaxDeterminationFormData) => {
    createDetermination({
      invoiceId: data.invoiceId,
      lineItems: data.lineItems,
    }, {
      onSuccess: () => {
        navigate('/tax-compliance/tax-determination');
      },
    });
  };

  if (invoiceId && isLoadingInvoice) {
    return <div className="p-6">Loading invoice data...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Calculator className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Create Tax Determination</h1>
      </div>

      <FormContainer
        title="Tax Determination Information"
        description="Enter the details for tax determination"
        schema={taxDeterminationSchema}
        defaultValues={getDefaultValues()}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Processing...' : 'Process Tax Determination'}
        cancelText="Cancel"
        onCancel={() => navigate('/tax-compliance/tax-determination')}
        showReset
      >
        {({ control }) => {
          const { fields, append, remove } = useFieldArray({
            control,
            name: 'lineItems',
          });

          return (
            <>
              <FormSection title="Invoice Information">
                <FormInput
                  name="invoiceId"
                  label="Invoice ID"
                  placeholder="Enter invoice ID"
                  disabled={!!invoiceId}
                />
                <FormInput
                  name="invoiceNumber"
                  label="Invoice Number"
                  placeholder="Enter invoice number"
                  disabled={!!invoice}
                />
              </FormSection>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Line Items</h2>
                  <Button
                    type="button"
                    onClick={() =>
                      append({
                        lineItemId: '',
                        description: '',
                        taxableAmount: 0,
                        taxCode: 'S1',
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
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput
                        name={`lineItems.${index}.lineItemId`}
                        label="Line Item ID"
                        placeholder="Enter line item ID"
                        disabled={!!invoice}
                      />
                      <FormInput
                        name={`lineItems.${index}.description`}
                        label="Description"
                        placeholder="Enter description"
                        disabled={!!invoice}
                      />
                      <FormInput
                        name={`lineItems.${index}.taxableAmount`}
                        label="Taxable Amount"
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={!!invoice}
                      />
                      <FormSelect
                        name={`lineItems.${index}.taxCode`}
                        label="Tax Code"
                        options={taxCodeOptions}
                      />
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Line Item
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {invoice && (
                <FormSection title="Invoice Preview">
                  <div className="col-span-2 rounded-lg border p-4 bg-muted/20">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium">Invoice Number</h3>
                        <p>{invoice.invoiceNumber}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Supplier</h3>
                        <p>{invoice.supplier.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Invoice Date</h3>
                        <p>{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Total Amount</h3>
                        <p>{invoice.currency} {invoice.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </FormSection>
              )}
            </>
          );
        }}
      </FormContainer>
    </div>
  );
}