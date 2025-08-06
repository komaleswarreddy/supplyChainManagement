import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormSection } from '@/components/form';
import { useInventoryOptimization } from '@/hooks/useInventoryOptimization';
import type { InventoryPolicy } from '@/types/inventory-optimization';

const policySchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  locationId: z.string().min(1, 'Location is required'),
  item: z.object({
    id: z.string(),
    itemCode: z.string().min(1, 'Item code is required'),
    name: z.string().min(1, 'Item name is required'),
  }),
  location: z.object({
    id: z.string(),
    name: z.string().min(1, 'Location name is required'),
    type: z.string().min(1, 'Location type is required'),
  }),
  policyType: z.enum(['MIN_MAX', 'REORDER_POINT', 'PERIODIC_REVIEW', 'KANBAN']),
  minQuantity: z.number().min(0, 'Min quantity must be non-negative'),
  maxQuantity: z.number().min(0, 'Max quantity must be non-negative'),
  reorderPoint: z.number().min(0, 'Reorder point must be non-negative'),
  targetStockLevel: z.number().optional(),
  orderQuantity: z.number().optional(),
  orderFrequency: z.number().optional(),
  leadTime: z.number().min(1, 'Lead time must be at least 1 day'),
  serviceLevel: z.enum(['0.9', '0.95', '0.99']).transform(val => parseFloat(val) as 0.9 | 0.95 | 0.99),
  reviewPeriod: z.number().min(1, 'Review period must be at least 1 day'),
  abcxyzClass: z.enum(['AX', 'AY', 'AZ', 'BX', 'BY', 'BZ', 'CX', 'CY', 'CZ']),
  notes: z.string().optional(),
});

const defaultValues = {
  policyType: 'MIN_MAX',
  minQuantity: 50,
  maxQuantity: 200,
  reorderPoint: 100,
  leadTime: 7,
  serviceLevel: '0.95',
  reviewPeriod: 7,
  abcxyzClass: 'AX',
} as const;

const policyTypeOptions = [
  { label: 'Min/Max', value: 'MIN_MAX' },
  { label: 'Reorder Point', value: 'REORDER_POINT' },
  { label: 'Periodic Review', value: 'PERIODIC_REVIEW' },
  { label: 'Kanban', value: 'KANBAN' },
];

const serviceLevelOptions = [
  { label: '90%', value: '0.9' },
  { label: '95%', value: '0.95' },
  { label: '99%', value: '0.99' },
];

const combinedClassOptions = [
  { label: 'AX - High value, stable demand', value: 'AX' },
  { label: 'AY - High value, variable demand', value: 'AY' },
  { label: 'AZ - High value, highly variable demand', value: 'AZ' },
  { label: 'BX - Medium value, stable demand', value: 'BX' },
  { label: 'BY - Medium value, variable demand', value: 'BY' },
  { label: 'BZ - Medium value, highly variable demand', value: 'BZ' },
  { label: 'CX - Low value, stable demand', value: 'CX' },
  { label: 'CY - Low value, variable demand', value: 'CY' },
  { label: 'CZ - Low value, highly variable demand', value: 'CZ' },
];

export function CreateInventoryPolicy() {
  const navigate = useNavigate();
  const { useCreateInventoryPolicy } = useInventoryOptimization();
  const { mutate: createPolicy, isLoading } = useCreateInventoryPolicy();

  const onSubmit = async (data: z.infer<typeof policySchema>) => {
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + data.reviewPeriod);

    const formData: Omit<InventoryPolicy, 'id' | 'lastReviewed' | 'createdAt' | 'updatedAt'> = {
      ...data,
      nextReview: nextReviewDate.toISOString(),
      createdBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['inventory_manager'],
        permissions: ['manage_inventory'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    createPolicy(formData, {
      onSuccess: () => {
        navigate('/inventory/optimization/policies');
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Create Inventory Policy"
        description="Define inventory management policy for an item"
        schema={policySchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Creating...' : 'Create Policy'}
        cancelText="Cancel"
        onCancel={() => navigate('/inventory/optimization/policies')}
        showReset
      >
        <FormSection title="Item Information">
          <FormInput
            name="item.itemCode"
            label="Item Code"
            placeholder="Enter item code"
          />
          <FormInput
            name="item.name"
            label="Item Name"
            placeholder="Enter item name"
          />
          <FormInput
            name="location.name"
            label="Location"
            placeholder="Enter location name"
          />
          <FormInput
            name="location.type"
            label="Location Type"
            placeholder="Enter location type"
          />
        </FormSection>

        <FormSection title="Policy Configuration">
          <FormSelect
            name="policyType"
            label="Policy Type"
            options={policyTypeOptions}
          />
          <FormSelect
            name="abcxyzClass"
            label="ABC/XYZ Class"
            options={combinedClassOptions}
          />
          <FormSelect
            name="serviceLevel"
            label="Service Level"
            options={serviceLevelOptions}
          />
          <FormInput
            name="leadTime"
            label="Lead Time (days)"
            type="number"
            min="1"
          />
        </FormSection>

        <FormSection title="Inventory Parameters">
          <FormInput
            name="minQuantity"
            label="Min Quantity"
            type="number"
            min="0"
          />
          <FormInput
            name="maxQuantity"
            label="Max Quantity"
            type="number"
            min="0"
          />
          <FormInput
            name="reorderPoint"
            label="Reorder Point"
            type="number"
            min="0"
          />
          <FormInput
            name="targetStockLevel"
            label="Target Stock Level"
            type="number"
            min="0"
          />
          <FormInput
            name="orderQuantity"
            label="Order Quantity"
            type="number"
            min="0"
          />
          <FormInput
            name="orderFrequency"
            label="Order Frequency (days)"
            type="number"
            min="0"
          />
          <FormInput
            name="reviewPeriod"
            label="Review Period (days)"
            type="number"
            min="1"
          />
          <FormTextarea
            name="notes"
            label="Notes"
            placeholder="Enter any additional notes"
          />
        </FormSection>
      </FormContainer>
    </div>
  );
}