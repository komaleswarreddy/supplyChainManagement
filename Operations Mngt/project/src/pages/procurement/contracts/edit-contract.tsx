import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormCheckbox, FormSection } from '@/components/form';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useContracts } from '@/hooks/useContracts';
import type { ContractFormData } from '@/types/contract';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const contractSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['PURCHASE', 'SERVICE', 'FRAMEWORK', 'LEASE', 'MAINTENANCE', 'LICENSE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  supplier: z.object({
    id: z.string().min(1, 'Supplier is required'),
    name: z.string().min(1, 'Supplier name is required'),
    code: z.string().min(1, 'Supplier code is required'),
    type: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER', 'SERVICE_PROVIDER']),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED']),
    taxId: z.string(),
    registrationNumber: z.string(),
    website: z.string().optional(),
    industry: z.string().optional(),
  }),
  startDate: z.date(),
  endDate: z.date(),
  value: z.number().min(0, 'Value must be greater than or equal to 0'),
  currency: z.string().min(1, 'Currency is required'),
  renewalType: z.enum(['AUTOMATIC', 'MANUAL', 'NON_RENEWABLE']),
  autoRenew: z.boolean(),
  renewalNotificationDays: z.number().min(0),
  noticePeriodDays: z.number().min(0),
  items: z.array(z.object({
    itemCode: z.string().min(1, 'Item code is required'),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().optional(),
    unitPrice: z.number().min(0, 'Unit price must be greater than or equal to 0'),
    currency: z.string().min(1, 'Currency is required'),
    startDate: z.date(),
    endDate: z.date().optional(),
    specifications: z.string().optional(),
    terms: z.string().optional(),
  })).min(1, 'At least one item is required'),
  milestones: z.array(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    dueDate: z.date(),
    notes: z.string().optional(),
  })),
  terms: z.string().optional(),
  terminationConditions: z.string().optional(),
  metadata: z.object({
    department: z.string().optional(),
    costCenter: z.string().optional(),
    projectCode: z.string().optional(),
    budgetCode: z.string().optional(),
  }).optional(),
});

const contractTypeOptions = [
  { label: 'Purchase', value: 'PURCHASE' },
  { label: 'Service', value: 'SERVICE' },
  { label: 'Framework', value: 'FRAMEWORK' },
  { label: 'Lease', value: 'LEASE' },
  { label: 'Maintenance', value: 'MAINTENANCE' },
  { label: 'License', value: 'LICENSE' },
];

const priorityOptions = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' },
];

const currencyOptions = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
];

const renewalTypeOptions = [
  { label: 'Automatic', value: 'AUTOMATIC' },
  { label: 'Manual', value: 'MANUAL' },
  { label: 'Non-Renewable', value: 'NON_RENEWABLE' },
];

export function EditContract() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useContract, useUpdateContract } = useContracts();
  const { data: contract, isLoading: isLoadingContract } = useContract(id!);
  const { mutate: updateContract, isLoading: isUpdating } = useUpdateContract();

  if (isLoadingContract || !contract) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Transform dates from strings to Date objects
  const defaultValues = {
    ...contract,
    startDate: new Date(contract.startDate),
    endDate: new Date(contract.endDate),
    items: contract.items.map(item => ({
      ...item,
      startDate: new Date(item.startDate),
      endDate: item.endDate ? new Date(item.endDate) : undefined,
    })),
    milestones: contract.milestones.map(milestone => ({
      ...milestone,
      dueDate: new Date(milestone.dueDate),
    })),
  };

  const onSubmit = async (data: z.infer<typeof contractSchema>) => {
    const formData: Partial<ContractFormData> = {
      ...data,
      milestones: data.milestones.map(milestone => ({
        ...milestone,
        status: 'PENDING',
      })),
    };

    updateContract(
      { id: contract.id, data: formData },
      {
        onSuccess: () => {
          navigate(`/procurement/contracts/${contract.id}`);
        },
      }
    );
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Edit Contract"
        description={`Edit contract ${contract.contractNumber}`}
        schema={contractSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isUpdating ? 'Saving...' : 'Save Changes'}
        cancelText="Cancel"
        onCancel={() => navigate(`/procurement/contracts/${contract.id}`)}
        showReset
      >
        {({ control, register, setValue, getValues }) => {
          const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
            control,
            name: 'items',
          });

          const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({
            control,
            name: 'milestones',
          });

          return (
            <>
              <FormSection title="Basic Information">
                <FormInput
                  name="title"
                  label="Title"
                  placeholder="Enter contract title"
                />
                <FormSelect
                  name="type"
                  label="Contract Type"
                  options={contractTypeOptions}
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
                <FormInput
                  name="value"
                  label="Contract Value"
                  type="number"
                  min="0"
                  step="0.01"
                />
                <FormTextarea
                  name="description"
                  label="Description"
                  placeholder="Enter contract description"
                />
              </FormSection>

              <FormSection title="Supplier Information">
                <FormInput
                  name="supplier.name"
                  label="Supplier Name"
                  placeholder="Enter supplier name"
                />
                <FormInput
                  name="supplier.code"
                  label="Supplier Code"
                  placeholder="Enter supplier code"
                />
                <FormInput
                  name="supplier.taxId"
                  label="Tax ID"
                  placeholder="Enter tax ID"
                />
                <FormInput
                  name="supplier.registrationNumber"
                  label="Registration Number"
                  placeholder="Enter registration number"
                />
              </FormSection>

              <FormSection title="Contract Period">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <DatePicker
                    selected={getValues('startDate')}
                    onChange={(date) => setValue('startDate', date)}
                    className="w-full rounded-md border p-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <DatePicker
                    selected={getValues('endDate')}
                    onChange={(date) => setValue('endDate', date)}
                    minDate={getValues('startDate')}
                    className="w-full rounded-md border p-2"
                  />
                </div>
                <FormSelect
                  name="renewalType"
                  label="Renewal Type"
                  options={renewalTypeOptions}
                />
                <FormCheckbox
                  name="autoRenew"
                  label="Auto Renewal"
                  checkboxLabel="Enable automatic renewal"
                />
                <FormInput
                  name="renewalNotificationDays"
                  label="Renewal Notification Days"
                  type="number"
                  min="0"
                />
                <FormInput
                  name="noticePeriodDays"
                  label="Notice Period Days"
                  type="number"
                  min="0"
                />
              </FormSection>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Contract Items</h2>
                  <Button
                    type="button"
                    onClick={() =>
                      appendItem({
                        itemCode: '',
                        description: '',
                        unitPrice: 0,
                        currency: getValues('currency'),
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                      })
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {itemFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border p-6"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                      <FormInput
                        name={`items.${index}.unitPrice`}
                        label="Unit Price"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <DatePicker
                          selected={getValues(`items.${index}.startDate`)}
                          onChange={(date) =>
                            setValue(`items.${index}.startDate`, date)
                          }
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <DatePicker
                          selected={getValues(`items.${index}.endDate`)}
                          onChange={(date) =>
                            setValue(`items.${index}.endDate`, date)
                          }
                          minDate={getValues(`items.${index}.startDate`)}
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <FormTextarea
                        name={`items.${index}.specifications`}
                        label="Specifications"
                        placeholder="Enter specifications"
                        className="col-span-2"
                      />
                      <FormTextarea
                        name={`items.${index}.terms`}
                        label="Terms"
                        placeholder="Enter terms"
                        className="col-span-2"
                      />
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeItem(index)}
                        disabled={itemFields.length === 1}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Item
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Milestones</h2>
                  <Button
                    type="button"
                    onClick={() =>
                      appendMilestone({
                        title: '',
                        description: '',
                        dueDate: new Date(),
                      })
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Milestone
                  </Button>
                </div>

                {milestoneFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border p-6"
                  >
                    <div className="grid gap-4">
                      <FormInput
                        name={`milestones.${index}.title`}
                        label="Title"
                        placeholder="Enter milestone title"
                      />
                      <FormInput
                        name={`milestones.${index}.description`}
                        label="Description"
                        placeholder="Enter milestone description"
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Due Date</label>
                        <DatePicker
                          selected={getValues(`milestones.${index}.dueDate`)}
                          onChange={(date) =>
                            setValue(`milestones.${index}.dueDate`, date)
                          }
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <FormTextarea
                        name={`milestones.${index}.notes`}
                        label="Notes"
                        placeholder="Enter milestone notes"
                      />
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeMilestone(index)}
                        disabled={milestoneFields.length === 1}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Milestone
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <FormSection title="Terms & Conditions">
                <FormTextarea
                  name="terms"
                  label="Contract Terms"
                  placeholder="Enter contract terms"
                  className="col-span-2"
                />
                <FormTextarea
                  name="terminationConditions"
                  label="Termination Conditions"
                  placeholder="Enter termination conditions"
                  className="col-span-2"
                />
              </FormSection>

              <FormSection title="Additional Information">
                <FormInput
                  name="metadata.department"
                  label="Department"
                  placeholder="Enter department"
                />
                <FormInput
                  name="metadata.costCenter"
                  label="Cost Center"
                  placeholder="Enter cost center"
                />
                <FormInput
                  name="metadata.projectCode"
                  label="Project Code"
                  placeholder="Enter project code"
                />
                <FormInput
                  name="metadata.budgetCode"
                  label="Budget Code"
                  placeholder="Enter budget code"
                />
              </FormSection>
            </>
          );
        }}
      </FormContainer>
    </div>
  );
}