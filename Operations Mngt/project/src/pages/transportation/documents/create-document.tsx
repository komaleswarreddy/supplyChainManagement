import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormSection } from '@/components/form';
import { useTransportation } from '@/hooks/useTransportation';
import { DocumentType } from '@/types/transportation';
import { FileCheck } from 'lucide-react';

const documentSchema = z.object({
  shipmentId: z.string().min(1, 'Shipment ID is required'),
  documentType: z.enum(['BOL', 'COMMERCIAL_INVOICE', 'PACKING_LIST', 'CUSTOMS_DECLARATION', 'CERTIFICATE_OF_ORIGIN', 'DANGEROUS_GOODS', 'DELIVERY_NOTE']),
  signedBy: z.string().optional(),
  specialInstructions: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

const documentTypeOptions = [
  { label: 'Bill of Lading', value: 'BOL' },
  { label: 'Commercial Invoice', value: 'COMMERCIAL_INVOICE' },
  { label: 'Packing List', value: 'PACKING_LIST' },
  { label: 'Customs Declaration', value: 'CUSTOMS_DECLARATION' },
  { label: 'Certificate of Origin', value: 'CERTIFICATE_OF_ORIGIN' },
  { label: 'Dangerous Goods', value: 'DANGEROUS_GOODS' },
  { label: 'Delivery Note', value: 'DELIVERY_NOTE' },
];

export function CreateDocument() {
  const navigate = useNavigate();
  const location = useLocation();
  const { shipmentId, documentType } = location.state || {};
  
  const { useCreateDocument, useShipment } = useTransportation();
  const { mutate: createDocument, isLoading } = useCreateDocument();
  const { data: shipment, isLoading: isLoadingShipment } = useShipment(shipmentId);

  const defaultValues: DocumentFormData = {
    shipmentId: shipmentId || '',
    documentType: (documentType as DocumentType) || 'BOL',
    signedBy: '',
    specialInstructions: '',
  };

  const onSubmit = async (data: DocumentFormData) => {
    // Prepare document data based on the shipment and form data
    const documentData = {
      shipmentNumber: shipment?.shipmentNumber,
      carrierName: shipment?.carrier.name,
      originAddress: shipment ? `${shipment.origin.address}, ${shipment.origin.city}, ${shipment.origin.state} ${shipment.origin.postalCode}` : '',
      destinationAddress: shipment ? `${shipment.destination.address}, ${shipment.destination.city}, ${shipment.destination.state} ${shipment.destination.postalCode}` : '',
      items: shipment?.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        weight: item.weight,
      })),
      signedBy: data.signedBy,
      specialInstructions: data.specialInstructions,
    };

    createDocument({
      shipmentId: data.shipmentId,
      documentType: data.documentType,
      data: documentData,
    }, {
      onSuccess: () => {
        navigate(`/transportation/shipments/${data.shipmentId}`);
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <FileCheck className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Create Shipping Document</h1>
      </div>

      <FormContainer
        title="Document Information"
        description="Generate a shipping document for your shipment"
        schema={documentSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Generating...' : 'Generate Document'}
        cancelText="Cancel"
        onCancel={() => navigate(-1)}
      >
        <FormSection title="Document Details">
          <FormInput
            name="shipmentId"
            label="Shipment ID"
            placeholder="Enter shipment ID"
            disabled={!!shipmentId}
          />
          <FormSelect
            name="documentType"
            label="Document Type"
            options={documentTypeOptions}
            disabled={!!documentType}
          />
          <FormInput
            name="signedBy"
            label="Signed By"
            placeholder="Enter name of signer (if applicable)"
          />
          <FormTextarea
            name="specialInstructions"
            label="Special Instructions"
            placeholder="Enter any special instructions for this document"
            className="col-span-2"
          />
        </FormSection>

        {shipment && (
          <FormSection title="Shipment Information (Preview)">
            <div className="col-span-2 rounded-lg border p-4 bg-muted/20">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Shipment Number</h3>
                  <p>{shipment.shipmentNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Carrier</h3>
                  <p>{shipment.carrier.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Origin</h3>
                  <p>{shipment.origin.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {shipment.origin.address}, {shipment.origin.city}, {shipment.origin.state} {shipment.origin.postalCode}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Destination</h3>
                  <p>{shipment.destination.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {shipment.destination.address}, {shipment.destination.city}, {shipment.destination.state} {shipment.destination.postalCode}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Items</h3>
                <div className="space-y-2">
                  {shipment.items.map((item, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{item.quantity}x</span> {item.description} - {item.weight} {item.weightUnit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FormSection>
        )}
      </FormContainer>
    </div>
  );
}