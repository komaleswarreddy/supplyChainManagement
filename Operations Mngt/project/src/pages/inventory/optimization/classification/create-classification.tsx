import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormCheckbox, FormSelect, FormSection } from '@/components/form';
import { useInventoryOptimization } from '@/hooks/useInventoryOptimization';
import type { InventoryClassification, CombinedClass } from '@/types/inventory-optimization';

const classificationSchema = z.object({
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
  annualConsumptionValue: z.number().min(0, 'Annual consumption value must be non-negative'),
  annualConsumptionQuantity: z.number().min(0, 'Annual consumption quantity must be non-negative'),
  consumptionVariability: z.number().min(0, 'Consumption variability must be non-negative'),
  abcThresholds: z.object({
    aThreshold: z.number().min(0).max(1, 'Threshold must be between 0 and 1'),
    bThreshold: z.number().min(0).max(1, 'Threshold must be between 0 and 1'),
  }),
  xyzThresholds: z.object({
    xThreshold: z.number().min(0, 'Threshold must be non-negative'),
    yThreshold: z.number().min(0, 'Threshold must be non-negative'),
  }),
  manualOverride: z.boolean(),
  manualClass: z.enum(['AX', 'AY', 'AZ', 'BX', 'BY', 'BZ', 'CX', 'CY', 'CZ']).optional(),
});

const defaultValues = {
  annualConsumptionValue: 0,
  annualConsumptionQuantity: 0,
  consumptionVariability: 0,
  abcThresholds: {
    aThreshold: 0.8,
    bThreshold: 0.95,
  },
  xyzThresholds: {
    xThreshold: 0.5,
    yThreshold: 1.0,
  },
  manualOverride: false,
} as const;

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

export function CreateClassification() {
  const navigate = useNavigate();
  const { useCalculateClassification } = useInventoryOptimization();
  const { mutate: calculateClassification, isLoading } = useCalculateClassification();

  const onSubmit = async (data: z.infer<typeof classificationSchema>) => {
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + 90); // Review in 90 days

    const formData: Omit<InventoryClassification, 'id' | 'abcClass' | 'xyzClass' | 'combinedClass' | 'lastCalculated' | 'createdAt' | 'updatedAt'> = {
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

    calculateClassification(formData, {
      onSuccess: () => {
        navigate('/inventory/optimization/classification');
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Create ABC/XYZ Classification"
        description="Enter consumption data to classify inventory"
        schema={classificationSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Classifying...' : 'Classify Item'}
        cancelText="Cancel"
        onCancel={() => navigate('/inventory/optimization/classification')}
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

        <FormSection title="Consumption Data">
          <FormInput
            name="annualConsumptionValue"
            label="Annual Consumption Value ($)"
            type="number"
            min="0"
            step="0.01"
          />
          <FormInput
            name="annualConsumptionQuantity"
            label="Annual Consumption Quantity"
            type="number"
            min="0"
          />
          <FormInput
            name="consumptionVariability"
            label="Consumption Variability (CV)"
            type="number"
            min="0"
            step="0.01"
          />
        </FormSection>

        <FormSection title="Classification Parameters">
          <FormInput
            name="abcThresholds.aThreshold"
            label="A Class Threshold"
            type="number"
            min="0"
            max="1"
            step="0.01"
          />
          <FormInput
            name="abcThresholds.bThreshold"
            label="B Class Threshold"
            type="number"
            min="0"
            max="1"
            step="0.01"
          />
          <FormInput
            name="xyzThresholds.xThreshold"
            label="X Class Threshold"
            type="number"
            min="0"
            step="0.01"
          />
          <FormInput
            name="xyzThresholds.yThreshold"
            label="Y Class Threshold"
            type="number"
            min="0"
            step="0.01"
          />
          <div className="col-span-2">
            <FormCheckbox
              name="manualOverride"
              label="Manual Override"
              checkboxLabel="Override calculated classification"
            />
          </div>
          <FormSelect
            name="manualClass"
            label="Manual Classification"
            options={combinedClassOptions}
            disabled={values => !values.manualOverride}
          />
        </FormSection>
      </FormContainer>
    </div>
  );
}