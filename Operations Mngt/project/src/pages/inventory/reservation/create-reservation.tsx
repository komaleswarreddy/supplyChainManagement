import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormDatePicker, FormSection } from '@/components/form';
import { Button } from '@/components/ui/button';
import { BookMarked } from 'lucide-react';

const reservationSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  itemCode: z.string().min(1, 'Item code is required'),
  itemName: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  referenceType: z.enum(['SALES_ORDER', 'PRODUCTION_ORDER', 'TRANSFER_ORDER']),
  referenceId: z.string().min(1, 'Reference ID is required'),
  locationId: z.string().min(1, 'Location is required'),
  locationName: z.string().min(1, 'Location name is required'),
  expiryDate: z.date(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  notes: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

// Mock data for dropdowns
const itemOptions = [
  { label: 'Printer Toner (ITEM-0187)', value: 'item-1' },
  { label: 'Laptop Docking Station (ITEM-0042)', value: 'item-2' },
  { label: 'USB Cables (ITEM-0103)', value: 'item-3' },
  { label: 'Office Chair (ITEM-0215)', value: 'item-4' },
  { label: 'Wireless Keyboard (ITEM-0078)', value: 'item-5' },
];

const referenceTypeOptions = [
  { label: 'Sales Order', value: 'SALES_ORDER' },
  { label: 'Production Order', value: 'PRODUCTION_ORDER' },
  { label: 'Transfer Order', value: 'TRANSFER_ORDER' },
];

const locationOptions = [
  { label: 'Main Warehouse', value: 'location-1' },
  { label: 'East Coast DC', value: 'location-2' },
  { label: 'West Coast DC', value: 'location-3' },
];

const priorityOptions = [
  { label: 'High', value: 'HIGH' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Low', value: 'LOW' },
];

export function CreateReservation() {
  const navigate = useNavigate();
  
  const defaultValues: Partial<ReservationFormData> = {
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    priority: 'MEDIUM',
  };

  const onSubmit = async (data: ReservationFormData) => {
    console.log('Form submitted:', data);
    // In a real app, you would save the data to the server here
    navigate('/inventory/reservation');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <BookMarked className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Create Inventory Reservation</h1>
      </div>

      <FormContainer
        schema={reservationSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText="Create Reservation"
        cancelText="Cancel"
        onCancel={() => navigate('/inventory/reservation')}
      >
        {({ control, watch, setValue }) => {
          // Watch for item changes to update related fields
          const selectedItemId = watch('itemId');
          const selectedItem = itemOptions.find(item => item.value === selectedItemId);
          
          // Update item code and name when item changes
          React.useEffect(() => {
            if (selectedItem) {
              const [name, code] = selectedItem.label.split(' (');
              setValue('itemName', name);
              setValue('itemCode', code.replace(')', ''));
            }
          }, [selectedItemId, setValue]);
          
          // Watch for location changes
          const selectedLocationId = watch('locationId');
          const selectedLocation = locationOptions.find(location => location.value === selectedLocationId);
          
          // Update location name when location changes
          React.useEffect(() => {
            if (selectedLocation) {
              setValue('locationName', selectedLocation.label);
            }
          }, [selectedLocationId, setValue]);

          return (
            <>
              <FormSection title="Item Information">
                <FormSelect
                  name="itemId"
                  label="Item"
                  options={itemOptions}
                />
                <FormInput
                  name="quantity"
                  label="Quantity"
                  type="number"
                  min={1}
                />
              </FormSection>

              <FormSection title="Reservation Details">
                <FormSelect
                  name="referenceType"
                  label="Reference Type"
                  options={referenceTypeOptions}
                />
                <FormInput
                  name="referenceId"
                  label="Reference ID"
                  placeholder="Enter reference ID (e.g., SO-2023-0001)"
                />
                <FormSelect
                  name="locationId"
                  label="Location"
                  options={locationOptions}
                />
                <FormDatePicker
                  name="expiryDate"
                  label="Expiry Date"
                />
                <FormSelect
                  name="priority"
                  label="Priority"
                  options={priorityOptions}
                />
                <FormTextarea
                  name="notes"
                  label="Notes"
                  placeholder="Enter any additional notes"
                  className="col-span-2"
                />
              </FormSection>
            </>
          );
        }}
      </FormContainer>
    </div>
  );
}