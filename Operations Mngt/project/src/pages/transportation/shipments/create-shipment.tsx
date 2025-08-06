import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormCheckbox, FormSection } from '@/components/form';
import { useTransportation } from '@/hooks/useTransportation';
import type { ServiceLevel } from '@/types/transportation';
import { Truck } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const shipmentSchema = z.object({
  referenceNumber: z.string().optional(),
  carrier: z.object({
    id: z.string().min(1, 'Carrier is required'),
    name: z.string().min(1, 'Carrier name is required'),
    scacCode: z.string().optional(),
  }),
  origin: z.object({
    name: z.string().min(1, 'Origin name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    contactName: z.string().min(1, 'Contact name is required'),
    contactPhone: z.string().min(1, 'Contact phone is required'),
    contactEmail: z.string().email().optional(),
  }),
  destination: z.object({
    name: z.string().min(1, 'Destination name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    contactName: z.string().min(1, 'Contact name is required'),
    contactPhone: z.string().min(1, 'Contact phone is required'),
    contactEmail: z.string().email().optional(),
  }),
  pickupDate: z.date(),
  serviceLevel: z.enum(['STANDARD', 'EXPRESS', 'PRIORITY', 'ECONOMY']),
  items: z.array(z.object({
    itemCode: z.string().min(1, 'Item code is required'),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    weight: z.number().min(0.1, 'Weight must be greater than 0'),
    weightUnit: z.enum(['LB', 'KG']),
    dimensions: z.object({
      length: z.number().min(1, 'Length is required'),
      width: z.number().min(1, 'Width is required'),
      height: z.number().min(1, 'Height is required'),
      unit: z.enum(['IN', 'CM']),
    }),
    hazardous: z.boolean(),
    value: z.number().min(0),
    currency: z.string().min(1, 'Currency is required'),
  })).min(1, 'At least one item is required'),
  specialInstructions: z.string().optional(),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

const serviceLevelOptions = [
  { label: 'Standard', value: 'STANDARD' },
  { label: 'Express', value: 'EXPRESS' },
  { label: 'Priority', value: 'PRIORITY' },
  { label: 'Economy', value: 'ECONOMY' },
];

const weightUnitOptions = [
  { label: 'Pounds (lb)', value: 'LB' },
  { label: 'Kilograms (kg)', value: 'KG' },
];

const dimensionUnitOptions = [
  { label: 'Inches (in)', value: 'IN' },
  { label: 'Centimeters (cm)', value: 'CM' },
];

const currencyOptions = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
  { label: 'CAD (C$)', value: 'CAD' },
];

export function CreateShipment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { carrierId, origin, destination, serviceLevel, weight, pickupDate } = location.state || {};
  
  const { useCreateShipment, useCarrier } = useTransportation();
  const { mutate: createShipment, isLoading } = useCreateShipment();
  const { data: carrier } = useCarrier(carrierId || '');

  // Prepare default values based on carrier selection if available
  const defaultValues: ShipmentFormData = {
    referenceNumber: '',
    carrier: {
      id: carrier?.id || '',
      name: carrier?.name || '',
      scacCode: carrier?.scacCode || '',
    },
    origin: {
      name: 'Main Warehouse',
      address: '123 Warehouse St',
      city: origin?.split(',')[0] || 'Los Angeles',
      state: origin?.split(',')[1]?.trim() || 'CA',
      country: 'USA',
      postalCode: '90001',
      contactName: 'John Smith',
      contactPhone: '+1-555-123-4567',
      contactEmail: 'john.smith@example.com',
    },
    destination: {
      name: 'Distribution Center',
      address: '456 Distribution Ave',
      city: destination?.split(',')[0] || 'New York',
      state: destination?.split(',')[1]?.trim() || 'NY',
      country: 'USA',
      postalCode: '10001',
      contactName: 'Jane Doe',
      contactPhone: '+1-555-987-6543',
      contactEmail: 'jane.doe@example.com',
    },
    pickupDate: pickupDate || new Date(),
    serviceLevel: serviceLevel || 'STANDARD',
    items: [
      {
        itemCode: 'ITEM-001',
        description: 'Product 1',
        quantity: 10,
        weight: weight ? weight / 10 : 50,
        weightUnit: 'LB',
        dimensions: {
          length: 24,
          width: 18,
          height: 12,
          unit: 'IN',
        },
        hazardous: false,
        value: 1000,
        currency: 'USD',
      },
    ],
    specialInstructions: '',
  };

  const onSubmit = async (data: ShipmentFormData) => {
    // Calculate totals
    const totalWeight = data.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    const totalVolume = data.items.reduce((sum, item) => {
      const { length, width, height, unit } = item.dimensions;
      // Convert to cubic feet if needed
      const conversionFactor = unit === 'IN' ? 1728 : 28316.85; // cubic inches in a cubic foot or cubic cm in a cubic foot
      const itemVolume = (length * width * height) / conversionFactor;
      return sum + (itemVolume * item.quantity);
    }, 0);

    // Estimate delivery date based on service level
    const deliveryDate = new Date(data.pickupDate);
    switch (data.serviceLevel) {
      case 'EXPRESS':
        deliveryDate.setDate(deliveryDate.getDate() + 2);
        break;
      case 'PRIORITY':
        deliveryDate.setDate(deliveryDate.getDate() + 1);
        break;
      case 'ECONOMY':
        deliveryDate.setDate(deliveryDate.getDate() + 7);
        break;
      default: // STANDARD
        deliveryDate.setDate(deliveryDate.getDate() + 4);
    }

    // Create packages based on items
    const packages = data.items.map((item, index) => ({
      packageId: `pkg-${index + 1}`,
      packageType: item.weight > 100 ? 'PALLET' : 'BOX',
      quantity: 1,
      weight: item.weight * item.quantity,
      weightUnit: item.weightUnit,
      dimensions: item.dimensions,
      trackingNumber: `PKG${String(Math.floor(Math.random() * 1000000000)).padStart(10, '0')}`,
    }));

    // Calculate costs
    const baseRate = 500;
    const fuelSurcharge = baseRate * 0.15;
    const accessorials = [];
    if (data.specialInstructions?.includes('liftgate')) {
      accessorials.push({
        code: 'LIFT',
        description: 'Liftgate Service',
        amount: 75,
      });
    }
    if (data.specialInstructions?.includes('residential')) {
      accessorials.push({
        code: 'RESD',
        description: 'Residential Delivery',
        amount: 50,
      });
    }
    const taxes = (baseRate + fuelSurcharge + accessorials.reduce((sum, acc) => sum + acc.amount, 0)) * 0.08;
    const totalCost = baseRate + fuelSurcharge + accessorials.reduce((sum, acc) => sum + acc.amount, 0) + taxes;

    createShipment({
      referenceNumber: data.referenceNumber,
      carrier: data.carrier,
      status: 'PLANNED',
      origin: data.origin,
      destination: data.destination,
      pickupDate: data.pickupDate.toISOString(),
      deliveryDate: deliveryDate.toISOString(),
      estimatedDeliveryDate: deliveryDate.toISOString(),
      serviceLevel: data.serviceLevel,
      trackingNumber: `TRK${String(Math.floor(Math.random() * 1000000000)).padStart(10, '0')}`,
      trackingUrl: `https://track.carrier.com/${String(Math.floor(Math.random() * 1000000000)).padStart(10, '0')}`,
      items: data.items,
      packages,
      totalWeight,
      weightUnit: data.items[0].weightUnit,
      totalVolume,
      volumeUnit: 'CUFT',
      freightClass: '70',
      specialInstructions: data.specialInstructions,
      documents: [],
      costs: {
        baseRate,
        fuelSurcharge,
        accessorials,
        taxes,
        totalCost,
        currency: 'USD',
      },
      events: [
        {
          timestamp: new Date().toISOString(),
          status: 'SHIPMENT_CREATED',
          notes: 'Shipment created in system',
        },
      ],
      createdBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['logistics_coordinator'],
        permissions: ['manage_shipments'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }, {
      onSuccess: () => {
        navigate('/transportation/shipments');
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Truck className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Create Shipment</h1>
      </div>

      <FormContainer
        title="Shipment Information"
        description="Enter the details for your shipment"
        schema={shipmentSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Creating...' : 'Create Shipment'}
        cancelText="Cancel"
        onCancel={() => navigate('/transportation/shipments')}
        showReset
      >
        {({ control, register, setValue, getValues }) => (
          <>
            <FormSection title="Basic Information">
              <FormInput
                name="referenceNumber"
                label="Reference Number"
                placeholder="Enter reference number (optional)"
              />
              <FormInput
                name="carrier.name"
                label="Carrier"
                placeholder="Enter carrier name"
                disabled={!!carrier}
              />
              {carrier && (
                <FormInput
                  name="carrier.scacCode"
                  label="SCAC Code"
                  disabled
                />
              )}
              <FormSelect
                name="serviceLevel"
                label="Service Level"
                options={serviceLevelOptions}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Pickup Date</label>
                <DatePicker
                  selected={getValues('pickupDate')}
                  onChange={(date) => setValue('pickupDate', date)}
                  minDate={new Date()}
                  className="w-full rounded-md border p-2"
                />
              </div>
              <FormTextarea
                name="specialInstructions"
                label="Special Instructions"
                placeholder="Enter any special instructions"
                className="col-span-2"
              />
            </FormSection>

            <FormSection title="Origin">
              <FormInput
                name="origin.name"
                label="Location Name"
                placeholder="Enter location name"
              />
              <FormInput
                name="origin.address"
                label="Address"
                placeholder="Enter street address"
              />
              <FormInput
                name="origin.city"
                label="City"
                placeholder="Enter city"
              />
              <FormInput
                name="origin.state"
                label="State/Province"
                placeholder="Enter state/province"
              />
              <FormInput
                name="origin.country"
                label="Country"
                placeholder="Enter country"
              />
              <FormInput
                name="origin.postalCode"
                label="Postal Code"
                placeholder="Enter postal code"
              />
              <FormInput
                name="origin.contactName"
                label="Contact Name"
                placeholder="Enter contact name"
              />
              <FormInput
                name="origin.contactPhone"
                label="Contact Phone"
                placeholder="Enter contact phone"
              />
              <FormInput
                name="origin.contactEmail"
                label="Contact Email"
                placeholder="Enter contact email"
                type="email"
              />
            </FormSection>

            <FormSection title="Destination">
              <FormInput
                name="destination.name"
                label="Location Name"
                placeholder="Enter location name"
              />
              <FormInput
                name="destination.address"
                label="Address"
                placeholder="Enter street address"
              />
              <FormInput
                name="destination.city"
                label="City"
                placeholder="Enter city"
              />
              <FormInput
                name="destination.state"
                label="State/Province"
                placeholder="Enter state/province"
              />
              <FormInput
                name="destination.country"
                label="Country"
                placeholder="Enter country"
              />
              <FormInput
                name="destination.postalCode"
                label="Postal Code"
                placeholder="Enter postal code"
              />
              <FormInput
                name="destination.contactName"
                label="Contact Name"
                placeholder="Enter contact name"
              />
              <FormInput
                name="destination.contactPhone"
                label="Contact Phone"
                placeholder="Enter contact phone"
              />
              <FormInput
                name="destination.contactEmail"
                label="Contact Email"
                placeholder="Enter contact email"
                type="email"
              />
            </FormSection>

            <FormSection title="Items">
              <div className="col-span-2 space-y-4">
                {getValues('items').map((_, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <h3 className="font-medium mb-3">Item {index + 1}</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
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
                        name={`items.${index}.weight`}
                        label="Weight (per unit)"
                        type="number"
                        min="0.1"
                        step="0.1"
                      />
                      <FormSelect
                        name={`items.${index}.weightUnit`}
                        label="Weight Unit"
                        options={weightUnitOptions}
                      />
                      <FormSelect
                        name={`items.${index}.dimensions.unit`}
                        label="Dimension Unit"
                        options={dimensionUnitOptions}
                      />
                      <FormInput
                        name={`items.${index}.dimensions.length`}
                        label="Length"
                        type="number"
                        min="1"
                        step="0.1"
                      />
                      <FormInput
                        name={`items.${index}.dimensions.width`}
                        label="Width"
                        type="number"
                        min="1"
                        step="0.1"
                      />
                      <FormInput
                        name={`items.${index}.dimensions.height`}
                        label="Height"
                        type="number"
                        min="1"
                        step="0.1"
                      />
                      <FormInput
                        name={`items.${index}.value`}
                        label="Value (per unit)"
                        type="number"
                        min="0"
                        step="0.01"
                      />
                      <FormSelect
                        name={`items.${index}.currency`}
                        label="Currency"
                        options={currencyOptions}
                      />
                      <FormCheckbox
                        name={`items.${index}.hazardous`}
                        label="Hazardous Material"
                        checkboxLabel="This item contains hazardous materials"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </FormSection>
          </>
        )}
      </FormContainer>
    </div>
  );
}