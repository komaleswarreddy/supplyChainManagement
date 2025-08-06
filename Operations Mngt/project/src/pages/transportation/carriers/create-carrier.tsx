import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormSection } from '@/components/form';
import { useTransportation } from '@/hooks/useTransportation';
import { Ship } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const carrierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.enum(['LTL', 'FTL', 'PARCEL', 'AIR', 'OCEAN', 'RAIL', 'INTERMODAL']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']),
  contactInfo: z.object({
    name: z.string().min(1, 'Contact name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
  }),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  scacCode: z.string().optional(),
  dotNumber: z.string().optional(),
  mcNumber: z.string().optional(),
  taxId: z.string().min(1, 'Tax ID is required'),
  insuranceInfo: z.object({
    provider: z.string().min(1, 'Provider is required'),
    policyNumber: z.string().min(1, 'Policy number is required'),
    coverageAmount: z.number().min(1, 'Coverage amount is required'),
    expiryDate: z.date(),
  }),
  serviceAreas: z.object({
    countries: z.array(z.string()).min(1, 'At least one country is required'),
    regions: z.array(z.string()).optional(),
  }),
  contractInfo: z.object({
    contractNumber: z.string().min(1, 'Contract number is required'),
    startDate: z.date(),
    endDate: z.date(),
    paymentTerms: z.string().min(1, 'Payment terms are required'),
  }),
});

type CarrierFormData = z.infer<typeof carrierSchema>;

const carrierTypeOptions = [
  { label: 'LTL', value: 'LTL' },
  { label: 'FTL', value: 'FTL' },
  { label: 'Parcel', value: 'PARCEL' },
  { label: 'Air', value: 'AIR' },
  { label: 'Ocean', value: 'OCEAN' },
  { label: 'Rail', value: 'RAIL' },
  { label: 'Intermodal', value: 'INTERMODAL' },
];

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Suspended', value: 'SUSPENDED' },
];

const defaultValues: CarrierFormData = {
  name: '',
  code: '',
  type: 'LTL',
  status: 'ACTIVE',
  contactInfo: {
    name: '',
    email: '',
    phone: '',
  },
  address: {
    street: '',
    city: '',
    state: '',
    country: 'USA',
    postalCode: '',
  },
  taxId: '',
  insuranceInfo: {
    provider: '',
    policyNumber: '',
    coverageAmount: 1000000,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
  serviceAreas: {
    countries: ['USA'],
    regions: [],
  },
  contractInfo: {
    contractNumber: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    paymentTerms: 'Net 30',
  },
};

export function CreateCarrier() {
  const navigate = useNavigate();
  const { useCreateCarrier } = useTransportation();
  const { mutate: createCarrier, isLoading } = useCreateCarrier();

  const onSubmit = async (data: CarrierFormData) => {
    // Add default service types and performance metrics
    const carrierData = {
      ...data,
      serviceTypes: [data.type],
      transitTimes: [
        {
          origin: 'Los Angeles, CA',
          destination: 'New York, NY',
          transitDays: 5,
          serviceLevel: 'STANDARD',
        },
        {
          origin: 'Los Angeles, CA',
          destination: 'New York, NY',
          transitDays: 2,
          serviceLevel: 'EXPRESS',
        },
      ],
      rates: [
        {
          origin: 'Los Angeles, CA',
          destination: 'New York, NY',
          serviceLevel: 'STANDARD',
          baseRate: 1000,
          fuelSurcharge: 150,
          currency: 'USD',
          effectiveDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          origin: 'Los Angeles, CA',
          destination: 'New York, NY',
          serviceLevel: 'EXPRESS',
          baseRate: 2000,
          fuelSurcharge: 300,
          currency: 'USD',
          effectiveDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      performanceMetrics: {
        onTimeDelivery: 95,
        damageRate: 0.5,
        claimResolutionTime: 5,
        averageTransitTime: 3,
        lastUpdated: new Date().toISOString(),
      },
    };

    createCarrier(carrierData, {
      onSuccess: () => {
        navigate('/transportation/carriers');
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Ship className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Add Carrier</h1>
      </div>

      <FormContainer
        title="Carrier Information"
        description="Enter the details for the new carrier"
        schema={carrierSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Creating...' : 'Create Carrier'}
        cancelText="Cancel"
        onCancel={() => navigate('/transportation/carriers')}
        showReset
      >
        {({ register, setValue, getValues }) => (
          <>
            <FormSection title="Basic Information">
              <FormInput
                name="name"
                label="Carrier Name"
                placeholder="Enter carrier name"
              />
              <FormInput
                name="code"
                label="Carrier Code"
                placeholder="Enter carrier code"
              />
              <FormSelect
                name="type"
                label="Carrier Type"
                options={carrierTypeOptions}
              />
              <FormSelect
                name="status"
                label="Status"
                options={statusOptions}
              />
              <FormInput
                name="scacCode"
                label="SCAC Code"
                placeholder="Enter SCAC code (optional)"
              />
              <FormInput
                name="dotNumber"
                label="DOT Number"
                placeholder="Enter DOT number (optional)"
              />
              <FormInput
                name="mcNumber"
                label="MC Number"
                placeholder="Enter MC number (optional)"
              />
              <FormInput
                name="taxId"
                label="Tax ID"
                placeholder="Enter tax ID"
              />
            </FormSection>

            <FormSection title="Contact Information">
              <FormInput
                name="contactInfo.name"
                label="Contact Name"
                placeholder="Enter contact name"
              />
              <FormInput
                name="contactInfo.email"
                label="Email"
                type="email"
                placeholder="Enter email address"
              />
              <FormInput
                name="contactInfo.phone"
                label="Phone"
                placeholder="Enter phone number"
              />
              <FormInput
                name="address.street"
                label="Street Address"
                placeholder="Enter street address"
              />
              <FormInput
                name="address.city"
                label="City"
                placeholder="Enter city"
              />
              <FormInput
                name="address.state"
                label="State/Province"
                placeholder="Enter state/province"
              />
              <FormInput
                name="address.country"
                label="Country"
                placeholder="Enter country"
              />
              <FormInput
                name="address.postalCode"
                label="Postal Code"
                placeholder="Enter postal code"
              />
            </FormSection>

            <FormSection title="Insurance Information">
              <FormInput
                name="insuranceInfo.provider"
                label="Insurance Provider"
                placeholder="Enter insurance provider"
              />
              <FormInput
                name="insuranceInfo.policyNumber"
                label="Policy Number"
                placeholder="Enter policy number"
              />
              <FormInput
                name="insuranceInfo.coverageAmount"
                label="Coverage Amount"
                type="number"
                min="1"
                placeholder="Enter coverage amount"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry Date</label>
                <DatePicker
                  selected={getValues('insuranceInfo.expiryDate')}
                  onChange={(date) => setValue('insuranceInfo.expiryDate', date)}
                  minDate={new Date()}
                  className="w-full rounded-md border p-2"
                />
              </div>
            </FormSection>

            <FormSection title="Service Areas">
              <FormInput
                name="serviceAreas.countries"
                label="Countries"
                placeholder="Enter comma-separated countries"
              />
              <FormInput
                name="serviceAreas.regions"
                label="Regions"
                placeholder="Enter comma-separated regions (optional)"
              />
            </FormSection>

            <FormSection title="Contract Information">
              <FormInput
                name="contractInfo.contractNumber"
                label="Contract Number"
                placeholder="Enter contract number"
              />
              <FormInput
                name="contractInfo.paymentTerms"
                label="Payment Terms"
                placeholder="Enter payment terms"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <DatePicker
                  selected={getValues('contractInfo.startDate')}
                  onChange={(date) => setValue('contractInfo.startDate', date)}
                  className="w-full rounded-md border p-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <DatePicker
                  selected={getValues('contractInfo.endDate')}
                  onChange={(date) => setValue('contractInfo.endDate', date)}
                  minDate={getValues('contractInfo.startDate')}
                  className="w-full rounded-md border p-2"
                />
              </div>
            </FormSection>
          </>
        )}
      </FormContainer>
    </div>
  );
}