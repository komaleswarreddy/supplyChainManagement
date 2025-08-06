import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useProcurement } from '@/hooks/useProcurement';
import {
  FormContainer,
  FormSection,
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
} from '@/components/form';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import type { RequisitionFormData, RequisitionCategory } from '@/types/procurement';

const requisitionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  costCenter: z.string().min(1, 'Cost Center is required'),
  projectCode: z.string().optional(),
  budgetCode: z.string().optional(),
  budgetYear: z.number().min(2024, 'Budget year must be 2024 or later'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  category: z.enum(['OFFICE_SUPPLIES', 'IT_EQUIPMENT', 'SOFTWARE_LICENSES', 'PROFESSIONAL_SERVICES', 'MAINTENANCE', 'TRAVEL', 'TRAINING', 'MARKETING', 'OTHER']),
  currency: z.string().min(1, 'Currency is required'),
  businessPurpose: z.string().min(1, 'Business purpose is required'),
  justification: z.string().optional(),
  procurementType: z.enum(['GOODS', 'SERVICES', 'WORKS']),
  procurementMethod: z.enum(['RFQ', 'TENDER', 'DIRECT', 'FRAMEWORK']),
  contractReference: z.string().optional(),
  paymentTerms: z.string().optional(),
  requiredByDate: z.date().min(new Date(), 'Required by date must be in the future'),
  deliveryLocation: z.object({
    name: z.string().min(1, 'Location name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    contactPerson: z.string().min(1, 'Contact person is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
  }),
  items: z.array(z.object({
    itemCode: z.string().min(1, 'Item code is required'),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be greater than 0'),
    unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
    unitPrice: z.number().min(0, 'Unit price must be greater than or equal to 0'),
    currency: z.string().min(1, 'Currency is required'),
    requestedDeliveryDate: z.date(),
    category: z.enum(['OFFICE_SUPPLIES', 'IT_EQUIPMENT', 'SOFTWARE_LICENSES', 'PROFESSIONAL_SERVICES', 'MAINTENANCE', 'TRAVEL', 'TRAINING', 'MARKETING', 'OTHER']),
    manufacturer: z.string().optional(),
    partNumber: z.string().optional(),
    preferredSupplier: z.string().optional(),
    alternativeSuppliers: z.array(z.string()).optional(),
    warrantyRequired: z.boolean(),
    warrantyDuration: z.string().optional(),
    technicalSpecifications: z.string().optional(),
    qualityRequirements: z.string().optional(),
    hsCode: z.string().optional(),
    budgetCode: z.string().optional(),
    notes: z.string().optional(),
    specifications: z.string().optional(),
  })).min(1, 'At least one item is required'),
});

type RequisitionFormValues = z.infer<typeof requisitionSchema>;

const priorityOptions = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' },
];

const categoryOptions: { label: string; value: RequisitionCategory }[] = [
  { label: 'Office Supplies', value: 'OFFICE_SUPPLIES' },
  { label: 'IT Equipment', value: 'IT_EQUIPMENT' },
  { label: 'Software Licenses', value: 'SOFTWARE_LICENSES' },
  { label: 'Professional Services', value: 'PROFESSIONAL_SERVICES' },
  { label: 'Maintenance', value: 'MAINTENANCE' },
  { label: 'Travel', value: 'TRAVEL' },
  { label: 'Training', value: 'TRAINING' },
  { label: 'Marketing', value: 'MARKETING' },
  { label: 'Other', value: 'OTHER' },
];

const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
];

const procurementTypeOptions = [
  { label: 'Goods', value: 'GOODS' },
  { label: 'Services', value: 'SERVICES' },
  { label: 'Works', value: 'WORKS' },
];

const procurementMethodOptions = [
  { label: 'Request for Quotation', value: 'RFQ' },
  { label: 'Tender', value: 'TENDER' },
  { label: 'Direct Purchase', value: 'DIRECT' },
  { label: 'Framework Agreement', value: 'FRAMEWORK' },
];

const unitOfMeasureOptions = [
  { label: 'Each', value: 'EA' },
  { label: 'Box', value: 'BOX' },
  { label: 'Kilogram', value: 'KG' },
  { label: 'Liter', value: 'L' },
  { label: 'Hour', value: 'HR' },
  { label: 'Day', value: 'DAY' },
  { label: 'Month', value: 'MTH' },
  { label: 'Year', value: 'YR' },
];

export function EditRequisition() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useRequisition, useUpdateRequisition } = useProcurement();
  const { data: requisition, isLoading: isLoadingRequisition } = useRequisition(id!);
  const { mutate: updateRequisition, isLoading: isUpdating } = useUpdateRequisition();

  if (isLoadingRequisition || !requisition) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Transform the requisition data to match the form schema
  const defaultValues: RequisitionFormValues = {
    ...requisition,
    requiredByDate: new Date(requisition.requiredByDate),
    items: requisition.items.map(item => ({
      ...item,
      requestedDeliveryDate: new Date(item.requestedDeliveryDate),
    })),
  };

  const onSubmit = async (data: RequisitionFormValues) => {
    const formData: Partial<RequisitionFormData> = {
      ...data,
      totalAmount: data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
    };

    updateRequisition(
      { id: requisition.id, data: formData },
      {
        onSuccess: () => {
          navigate(`/procurement/requisitions/${requisition.id}`);
        },
      }
    );
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Edit Purchase Requisition"
        description="Update the requisition details below"
        schema={requisitionSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isUpdating ? 'Saving...' : 'Save Changes'}
        cancelText="Cancel"
        onCancel={() => navigate(`/procurement/requisitions/${requisition.id}`)}
        showReset
      >
        {({ control, register, setValue, getValues }) => {
          const { fields, append, remove } = useFieldArray({
            control,
            name: 'items',
          });

          return (
            <>
              <FormSection title="Basic Information">
                <FormInput
                  name="title"
                  label="Title"
                  placeholder="Enter requisition title"
                />
                <FormSelect
                  name="category"
                  label="Category"
                  options={categoryOptions}
                />
                <FormInput
                  name="department"
                  label="Department"
                  placeholder="Enter department"
                />
                <FormInput
                  name="costCenter"
                  label="Cost Center"
                  placeholder="Enter cost center"
                />
                <FormSelect
                  name="priority"
                  label="Priority"
                  options={priorityOptions}
                />
                <FormSelect
                  name="currency"
                  label="Currency"
                  options={currencyOptions}
                />
              </FormSection>

              <FormSection title="Budget Information">
                <FormInput
                  name="projectCode"
                  label="Project Code"
                  placeholder="Enter project code"
                />
                <FormInput
                  name="budgetCode"
                  label="Budget Code"
                  placeholder="Enter budget code"
                />
                <FormInput
                  name="budgetYear"
                  label="Budget Year"
                  type="number"
                  min={2024}
                />
                <FormInput
                  name="contractReference"
                  label="Contract Reference"
                  placeholder="Enter contract reference"
                />
              </FormSection>

              <FormSection title="Procurement Details">
                <FormSelect
                  name="procurementType"
                  label="Procurement Type"
                  options={procurementTypeOptions}
                />
                <FormSelect
                  name="procurementMethod"
                  label="Procurement Method"
                  options={procurementMethodOptions}
                />
                <FormInput
                  name="paymentTerms"
                  label="Payment Terms"
                  placeholder="Enter payment terms"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Required By Date</label>
                  <DatePicker
                    selected={getValues('requiredByDate')}
                    onChange={(date) => setValue('requiredByDate', date)}
                    minDate={new Date()}
                    className="w-full rounded-md border p-2"
                  />
                </div>
              </FormSection>

              <FormSection title="Purpose & Justification">
                <FormTextarea
                  name="businessPurpose"
                  label="Business Purpose"
                  placeholder="Enter business purpose"
                  className="col-span-2"
                />
                <FormTextarea
                  name="justification"
                  label="Justification"
                  placeholder="Enter justification"
                  className="col-span-2"
                />
              </FormSection>

              <FormSection title="Delivery Information">
                <FormInput
                  name="deliveryLocation.name"
                  label="Location Name"
                  placeholder="Enter location name"
                />
                <FormInput
                  name="deliveryLocation.contactPerson"
                  label="Contact Person"
                  placeholder="Enter contact person"
                />
                <FormInput
                  name="deliveryLocation.contactNumber"
                  label="Contact Number"
                  placeholder="Enter contact number"
                />
                <FormInput
                  name="deliveryLocation.address"
                  label="Address"
                  placeholder="Enter address"
                />
                <FormInput
                  name="deliveryLocation.city"
                  label="City"
                  placeholder="Enter city"
                />
                <FormInput
                  name="deliveryLocation.state"
                  label="State/Province"
                  placeholder="Enter state/province"
                />
                <FormInput
                  name="deliveryLocation.country"
                  label="Country"
                  placeholder="Enter country"
                />
                <FormInput
                  name="deliveryLocation.postalCode"
                  label="Postal Code"
                  placeholder="Enter postal code"
                />
              </FormSection>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Items</h2>
                  <Button
                    type="button"
                    onClick={() =>
                      append({
                        itemCode: '',
                        description: '',
                        quantity: 1,
                        unitOfMeasure: 'EA',
                        unitPrice: 0,
                        currency: getValues('currency'),
                        requestedDeliveryDate: new Date(),
                        category: getValues('category'),
                        manufacturer: '',
                        partNumber: '',
                        preferredSupplier: '',
                        alternativeSuppliers: [],
                        warrantyRequired: false,
                        warrantyDuration: '',
                        technicalSpecifications: '',
                        qualityRequirements: '',
                        hsCode: '',
                        budgetCode: '',
                        notes: '',
                        specifications: '',
                      })
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-6 rounded-lg border p-6"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <FormInput
                        name={`items.${index}.itemCode`}
                        label="Item Code"
                        placeholder="Enter item code"
                      />
                      <FormInput
                        name={`items.${index}.description`}
                        label="Description"
                        placeholder="Enter description"
                      />
                      <FormInput
                        name={`items.${index}.quantity`}
                        label="Quantity"
                        type="number"
                        min="1"
                      />
                      <FormSelect
                        name={`items.${index}.unitOfMeasure`}
                        label="Unit of Measure"
                        options={unitOfMeasureOptions}
                      />
                      <FormInput
                        name={`items.${index}.unitPrice`}
                        label="Unit Price"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                      <FormSelect
                        name={`items.${index}.category`}
                        label="Category"
                        options={categoryOptions}
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Requested Delivery Date
                        </label>
                        <DatePicker
                          selected={getValues(`items.${index}.requestedDeliveryDate`)}
                          onChange={(date) =>
                            setValue(`items.${index}.requestedDeliveryDate`, date)
                          }
                          minDate={new Date()}
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <FormInput
                        name={`items.${index}.manufacturer`}
                        label="Manufacturer"
                        placeholder="Enter manufacturer"
                      />
                      <FormInput
                        name={`items.${index}.partNumber`}
                        label="Part Number"
                        placeholder="Enter part number"
                      />
                      <FormInput
                        name={`items.${index}.preferredSupplier`}
                        label="Preferred Supplier"
                        placeholder="Enter preferred supplier"
                      />
                      <FormInput
                        name={`items.${index}.hsCode`}
                        label="HS Code"
                        placeholder="Enter HS code"
                      />
                      <FormInput
                        name={`items.${index}.budgetCode`}
                        label="Budget Code"
                        placeholder="Enter budget code"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormCheckbox
                        name={`items.${index}.warrantyRequired`}
                        label="Warranty"
                        checkboxLabel="Warranty Required"
                      />
                      {getValues(`items.${index}.warrantyRequired`) && (
                        <FormInput
                          name={`items.${index}.warrantyDuration`}
                          label="Warranty Duration"
                          placeholder="e.g., 12 months"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <FormTextarea
                        name={`items.${index}.technicalSpecifications`}
                        label="Technical Specifications"
                        placeholder="Enter technical specifications"
                      />
                      <FormTextarea
                        name={`items.${index}.qualityRequirements`}
                        label="Quality Requirements"
                        placeholder="Enter quality requirements"
                      />
                      <FormTextarea
                        name={`items.${index}.notes`}
                        label="Notes"
                        placeholder="Enter additional notes"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Item
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        }}
      </FormContainer>
    </div>
  );
}