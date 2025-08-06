import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormSection } from '@/components/form';
import { useTaxCompliance } from '@/hooks/useTaxCompliance';
import { FileCheck } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const taxDocumentSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  documentType: z.enum([
    'EXEMPTION_CERTIFICATE', 
    'RESALE_CERTIFICATE', 
    'VAT_REGISTRATION', 
    'W9', 
    'W8BEN', 
    'W8BENE', 
    'TAX_ID_VERIFICATION', 
    'OTHER'
  ]),
  documentNumber: z.string().min(1, 'Document number is required'),
  issuedBy: z.string().min(1, 'Issuing authority is required'),
  issuedDate: z.date(),
  expirationDate: z.date().optional(),
  documentUrl: z.string().url('Valid URL is required'),
  notes: z.string().optional(),
});

type TaxDocumentFormData = z.infer<typeof taxDocumentSchema>;

const documentTypeOptions = [
  { label: 'Exemption Certificate', value: 'EXEMPTION_CERTIFICATE' },
  { label: 'Resale Certificate', value: 'RESALE_CERTIFICATE' },
  { label: 'VAT Registration', value: 'VAT_REGISTRATION' },
  { label: 'W-9', value: 'W9' },
  { label: 'W-8BEN', value: 'W8BEN' },
  { label: 'W-8BEN-E', value: 'W8BENE' },
  { label: 'Tax ID Verification', value: 'TAX_ID_VERIFICATION' },
  { label: 'Other', value: 'OTHER' },
];

// Mock supplier options for demo
const supplierOptions = [
  { label: 'Supplier 1', value: 'supplier-1' },
  { label: 'Supplier 2', value: 'supplier-2' },
  { label: 'Supplier 3', value: 'supplier-3' },
  { label: 'Supplier 4', value: 'supplier-4' },
  { label: 'Supplier 5', value: 'supplier-5' },
];

export function CreateTaxDocument() {
  const navigate = useNavigate();
  const location = useLocation();
  const { supplierId, supplierName } = location.state || {};
  
  const { useCreateTaxDocument } = useTaxCompliance();
  const { mutate: createDocument, isLoading } = useCreateTaxDocument();

  const defaultValues: TaxDocumentFormData = {
    supplierId: supplierId || '',
    supplierName: supplierName || '',
    documentType: 'EXEMPTION_CERTIFICATE',
    documentNumber: '',
    issuedBy: '',
    issuedDate: new Date(),
    documentUrl: '',
    notes: '',
  };

  const onSubmit = async (data: TaxDocumentFormData) => {
    createDocument({
      ...data,
      status: 'PENDING_VERIFICATION',
    }, {
      onSuccess: () => {
        navigate('/tax-compliance/tax-documents');
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <FileCheck className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Add Tax Document</h1>
      </div>

      <FormContainer
        title="Document Information"
        description="Enter the details for the tax document"
        schema={taxDocumentSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Saving...' : 'Save Document'}
        cancelText="Cancel"
        onCancel={() => navigate('/tax-compliance/tax-documents')}
        showReset
      >
        {({ register, setValue, getValues }) => (
          <>
            <FormSection title="Supplier Information">
              <FormSelect
                name="supplierId"
                label="Supplier"
                options={supplierOptions}
                disabled={!!supplierId}
                onChange={(e) => {
                  const selectedSupplier = supplierOptions.find(s => s.value === e.target.value);
                  if (selectedSupplier) {
                    setValue('supplierName', selectedSupplier.label);
                  }
                }}
              />
              <FormInput
                name="supplierName"
                label="Supplier Name"
                placeholder="Enter supplier name"
                disabled={!!supplierName || !!supplierId}
              />
            </FormSection>

            <FormSection title="Document Details">
              <FormSelect
                name="documentType"
                label="Document Type"
                options={documentTypeOptions}
              />
              <FormInput
                name="documentNumber"
                label="Document Number"
                placeholder="Enter document number"
              />
              <FormInput
                name="issuedBy"
                label="Issued By"
                placeholder="Enter issuing authority"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Issued Date</label>
                <DatePicker
                  selected={getValues('issuedDate')}
                  onChange={(date) => setValue('issuedDate', date)}
                  className="w-full rounded-md border p-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expiration Date (if applicable)</label>
                <DatePicker
                  selected={getValues('expirationDate')}
                  onChange={(date) => setValue('expirationDate', date)}
                  minDate={getValues('issuedDate')}
                  className="w-full rounded-md border p-2"
                  isClearable
                />
              </div>
              <FormInput
                name="documentUrl"
                label="Document URL"
                placeholder="Enter document URL"
                className="col-span-2"
              />
              <FormTextarea
                name="notes"
                label="Notes"
                placeholder="Enter any additional notes"
                className="col-span-2"
              />
            </FormSection>

            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Document Validation Process</h2>
              <div className="space-y-4 text-sm">
                <p>
                  After saving this document, it will be marked as <Badge variant="warning">PENDING VERIFICATION</Badge> until it is reviewed and validated by a tax specialist.
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Document will be reviewed for completeness and accuracy</li>
                  <li>Tax specialist will verify the document with issuing authority if necessary</li>
                  <li>Document will be marked as valid or rejected based on review</li>
                  <li>If valid, document will be used for tax determination</li>
                  <li>If rejected, supplier will be notified to provide corrected documentation</li>
                </ol>
                <p className="text-muted-foreground">
                  Please ensure all document information is accurate and complete to expedite the validation process.
                </p>
              </div>
            </div>
          </>
        )}
      </FormContainer>
    </div>
  );
}