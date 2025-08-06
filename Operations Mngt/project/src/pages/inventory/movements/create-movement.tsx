import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormSelect, FormTextarea } from '@/components/form';
import { useInventory } from '@/hooks/useInventory';
import type { StockMovement } from '@/types/inventory';

const movementSchema = z.object({
  type: z.enum(['RECEIPT', 'ISSUE', 'RETURN', 'ADJUSTMENT', 'TRANSFER']),
  itemId: z.string().min(1, 'Item is required'),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  fromLocation: z.object({
    warehouse: z.string().min(1, 'Warehouse is required'),
    zone: z.string().min(1, 'Zone is required'),
    bin: z.string().min(1, 'Bin is required'),
  }).optional(),
  toLocation: z.object({
    warehouse: z.string().min(1, 'Warehouse is required'),
    zone: z.string().min(1, 'Zone is required'),
    bin: z.string().min(1, 'Bin is required'),
  }).optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

const defaultValues: MovementFormData = {
  type: 'TRANSFER',
  itemId: '',
  quantity: 1,
  fromLocation: {
    warehouse: '',
    zone: '',
    bin: '',
  },
  toLocation: {
    warehouse: '',
    zone: '',
    bin: '',
  },
  reason: '',
  notes: '',
};

const movementTypeOptions = [
  { label: 'Receipt', value: 'RECEIPT' },
  { label: 'Issue', value: 'ISSUE' },
  { label: 'Return', value: 'RETURN' },
  { label: 'Adjustment', value: 'ADJUSTMENT' },
  { label: 'Transfer', value: 'TRANSFER' },
];

export function CreateMovement() {
  const navigate = useNavigate();
  const { useCreateStockMovement } = useInventory();
  const { mutate: createMovement, isLoading } = useCreateStockMovement();

  const onSubmit = async (data: MovementFormData) => {
    // Mock item data for demonstration
    const mockItem = {
      id: data.itemId,
      itemCode: 'ITEM-001',
      name: 'Test Item',
    };

    const movementData: Omit<StockMovement, 'id' | 'createdAt' | 'updatedAt'> = {
      type: data.type,
      referenceNumber: `MOV-${Date.now()}`,
      item: mockItem,
      quantity: data.quantity,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      reason: data.reason,
      notes: data.notes,
      status: 'PENDING',
      processedBy: {
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
      processedAt: new Date().toISOString(),
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

    createMovement(movementData, {
      onSuccess: () => {
        navigate('/inventory/movements');
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Create Stock Movement"
        description="Record a new stock movement"
        schema={movementSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Creating...' : 'Create Movement'}
        cancelText="Cancel"
        onCancel={() => navigate('/inventory/movements')}
        showReset
      >
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormSelect
              name="type"
              label="Movement Type"
              options={movementTypeOptions}
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

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-6">
              <h3 className="font-semibold">From Location</h3>
              <FormInput
                name="fromLocation.warehouse"
                label="Warehouse"
                placeholder="Enter warehouse"
              />
              <FormInput
                name="fromLocation.zone"
                label="Zone"
                placeholder="Enter zone"
              />
              <FormInput
                name="fromLocation.bin"
                label="Bin"
                placeholder="Enter bin"
              />
            </div>

            <div className="space-y-6">
              <h3 className="font-semibold">To Location</h3>
              <FormInput
                name="toLocation.warehouse"
                label="Warehouse"
                placeholder="Enter warehouse"
              />
              <FormInput
                name="toLocation.zone"
                label="Zone"
                placeholder="Enter zone"
              />
              <FormInput
                name="toLocation.bin"
                label="Bin"
                placeholder="Enter bin"
              />
            </div>
          </div>

          <div className="grid gap-6">
            <FormInput
              name="reason"
              label="Reason"
              placeholder="Enter reason for movement"
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