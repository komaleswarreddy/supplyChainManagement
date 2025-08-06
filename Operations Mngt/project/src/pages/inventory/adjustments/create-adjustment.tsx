import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormSelect, FormTextarea } from '@/components/form';
import { useInventory } from '@/hooks/useInventory';
import type { StockAdjustment } from '@/types/inventory';

const adjustmentSchema = z.object({
  type: z.enum(['INCREASE', 'DECREASE']),
  itemId: z.string().min(1, 'Item is required'),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

const defaultValues: AdjustmentFormData = {
  type: 'INCREASE',
  itemId: '',
  quantity: 1,
  reason: '',
  notes: '',
};

const adjustmentTypeOptions = [
  { label: 'Increase', value: 'INCREASE' },
  { label: 'Decrease', value: 'DECREASE' },
];

export function CreateAdjustment() {
  const navigate = useNavigate();
  const { useCreateStockAdjustment } = useInventory();
  const { mutate: createAdjustment, isLoading } = useCreateStockAdjustment();

  const onSubmit = async (data: AdjustmentFormData) => {
    // Mock item data for demonstration
    const mockItem = {
      id: data.itemId,
      itemCode: 'ITEM-001',
      name: 'Test Item',
    };

    const adjustmentData: Omit<StockAdjustment, 'id' | 'adjustmentNumber' | 'createdAt' | 'updatedAt'> = {
      type: data.type,
      item: mockItem,
      quantity: data.quantity,
      reason: data.reason,
      notes: data.notes,
      status: 'PENDING',
      createdBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['inventory_manager'],
        permissions: ['manage_inventory'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    createAdjustment(adjustmentData, {
      onSuccess: () => {
        navigate('/inventory/adjustments');
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Create Stock Adjustment"
        description="Record a new stock adjustment"
        schema={adjustmentSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Creating...' : 'Create Adjustment'}
        cancelText="Cancel"
        onCancel={() => navigate('/inventory/adjustments')}
        showReset
      >
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormSelect
              name="type"
              label="Adjustment Type"
              options={adjustmentTypeOptions}
            />
            <FormInput
              name="itemId"
              label="Item"
              placeholder="Select an item"
            />
            <FormInput
              name="quantity"
              label="Quantity"
              type="number"
              min={1}
            />
          </div>

          <div className="grid gap-6">
            <FormInput
              name="reason"
              label="Reason"
              placeholder="Enter reason for adjustment"
            />
            <FormTextarea
              name="notes"
              label="Notes"
              placeholder="Enter additional notes"
            />
          </div>
        </div>
      </FormContainer>
    </div>
  );
}