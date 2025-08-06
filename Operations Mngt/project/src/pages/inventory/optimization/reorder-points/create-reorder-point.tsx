import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormCheckbox, FormTextarea, FormSection } from '@/components/form';
import { useInventoryOptimization } from '@/hooks/useInventoryOptimization';
import type { ReorderPoint } from '@/types/inventory-optimization';

const reorderPointSchema = z.object({
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
  averageDailyDemand: z.number().min(0, 'Average daily demand must be non-negative'),
  leadTime: z.number().min(1, 'Lead time must be at least 1 day'),
  safetyStock: z.number().min(0, 'Safety stock must be non-negative'),
  manualOverride: z.boolean(),
  manualValue: z.number().optional(),
  notes: z.string().optional(),
});

const defaultValues = {
  averageDailyDemand: 10,
  leadTime: 7,
  safetyStock: 50,
  manualOverride: false,
} as const;

export function CreateReorderPoint() {
  const navigate = useNavigate();
  const { useCalculateReorderPoint } = useInventoryOptimization();
  const { mutate: calculateReorderPoint, isLoading } = useCalculateReorderPoint();

  const onSubmit = async (data: z.infer<typeof reorderPointSchema>) => {
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + 30); // Review in 30 days

    const formData: Omit<ReorderPoint, 'id' | 'reorderPoint' | 'lastCalculated' | 'createdAt' | 'updatedAt'> = {
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

    calculateReorderPoint(formData, {
      onSuccess: () => {
        navigate('/inventory/optimization/reorder-points');
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Calculate Reorder Point"
        description="Enter parameters to calculate optimal reorder point"
        schema={reorderPointSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Calculating...' : 'Calculate Reorder Point'}
        cancelText="Cancel"
        onCancel={() => navigate('/inventory/optimization/reorder-points')}
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

        <FormSection title="Calculation Parameters">
          <FormInput
            name="averageDailyDemand"
            label="Average Daily Demand"
            type="number"
            min="0"
            step="0.01"
          />
          <FormInput
            name="leadTime"
            label="Lead Time (days)"
            type="number"
            min="1"
          />
          <FormInput
            name="safetyStock"
            label="Safety Stock"
            type="number"
            min="0"
          />
          <div className="col-span-2">
            <FormCheckbox
              name="manualOverride"
              label="Manual Override"
              checkboxLabel="Override calculated reorder point"
            />
          </div>
          <FormInput
            name="manualValue"
            label="Manual Reorder Point"
            type="number"
            min="0"
            disabled={values => !values.manualOverride}
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