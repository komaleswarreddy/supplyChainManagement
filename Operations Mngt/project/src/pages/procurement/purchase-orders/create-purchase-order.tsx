import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormSection } from '@/components/form';
import { Button } from '@/components/ui/button';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import type { PurchaseOrderFormData } from '@/types/purchase-order';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const purchaseOrderSchema = z.object({
  type: z.enum(['STANDARD', 'BLANKET', 'CONTRACT', 'DIRECT']),
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
  orderDate: z.date(),
  requiredByDate: z.date().min(new Date(), 'Required by date must be in the future'),
  items: z.array(z.object({
    itemCode: z.string().min(1, 'Item code is required'),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be greater than 0'),
    unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
    unitPrice: z.number().min(0, 'Unit price must be greater than or equal to 0'),
    currency: z.string().min(1, 'Currency is required'),
    requestedDeliveryDate: z.date(),
    specifications: z.string().optional(),
    notes: z.string().optional(),
  })).min(1, 'At least one item is required'),
  currency: z.string().min(1, 'Currency is required'),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
  deliveryTerms: z.string().min(1, 'Delivery terms are required'),
  shippingMethod: z.string().min(1, 'Shipping method is required'),
  deliveryAddress: z.object({
    name: z.string().min(1, 'Location name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    contactPerson: z.string().min(1, 'Contact person is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
  }),
  billingAddress: z.object({
    name: z.string().min(1, 'Location name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    contactPerson: z.string().min(1, 'Contact person is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
  }),
  notes: z.string().optional(),
  terms: z.string().optional(),
  metadata: z.object({
    department: z.string().optional(),
    costCenter: z.string().optional(),
    projectCode: z.string().optional(),
    budgetCode: z.string().optional(),
  }).optional(),
});

const defaultValues: z.infer<typeof purchaseOrderSchema> = {
  type: 'STANDARD',
  supplier: {
    id: '',
    name: '',
    code: '',
    type: 'MANUFACTURER',
    status: 'ACTIVE',
    taxId: '',
    registrationNumber: '',
  },
  orderDate: new Date(),
  requiredByDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  items: [
    {
      itemCode: '',
      description: '',
      quantity: 1,
      unitOfMeasure: 'EA',
      unitPrice: 0,
      currency: 'USD',
      requestedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ],
  currency: 'USD',
  paymentTerms: 'Net 30',
  deliveryTerms: 'FOB Destination',
  shippingMethod: 'Ground',
  deliveryAddress: {
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    contactPerson: '',
    contactNumber: '',
  },
  billingAddress: {
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    contactNumber: '',
    contactPerson: '',
  },
};

const poTypeOptions = [
  { label: 'Standard', value: 'STANDARD' },
  { label: 'Blanket', value: 'BLANKET' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Direct', value: 'DIRECT' },
];

const currencyOptions = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
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

const shippingMethodOptions = [
  { label: 'Ground', value: 'Ground' },
  { label: 'Air', value: 'Air' },
  { label: 'Sea', value: 'Sea' },
  { label: 'Express', value: 'Express' },
];

export function CreatePurchaseOrder() {
  const navigate = useNavigate();
  const { useCreatePurchaseOrder } = usePurchaseOrders();
  const { mutate: createPO, isLoading } = useCreatePurchaseOrder();

  const onSubmit = async (data: z.infer<typeof purchaseOrderSchema>) => {
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxRate = 0.1; // 10% tax rate
    const taxTotal = subtotal * taxRate;
    const shippingCost = 50; // Fixed shipping cost for demo
    const totalAmount = subtotal + taxTotal + shippingCost;

    const formData: PurchaseOrderFormData = {
      ...data,
      subtotal,
      taxTotal,
      shippingCost,
      otherCharges: 0,
      totalAmount,
    };

    createPO(formData, {
      onSuccess: () => {
        navigate('/procurement/purchase-orders');
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Create Purchase Order"
        description="Create a new purchase order"
        schema={purchaseOrderSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Creating...' : 'Create Purchase Order'}
        cancelText="Cancel"
        onCancel={() => navigate('/procurement/purchase-orders')}
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
                <FormSelect
                  name="type"
                  label="PO Type"
                  options={poTypeOptions}
                />
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
                <FormSelect
                  name="currency"
                  label="Currency"
                  options={currencyOptions}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order Date</label>
                  <DatePicker
                    selected={getValues('orderDate')}
                    onChange={(date) => setValue('orderDate', date)}
                    className="w-full rounded-md border p-2"
                  />
                </div>
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
                        requestedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Delivery Date</label>
                        <DatePicker
                          selected={getValues(`items.${index}.requestedDeliveryDate`)}
                          onChange={(date) =>
                            setValue(`items.${index}.requestedDeliveryDate`, date)
                          }
                          minDate={new Date()}
                          className="w-full rounded-md border p-2"
                        />
                      </div>
                      <FormTextarea
                        name={`items.${index}.specifications`}
                        label="Specifications"
                        placeholder="Enter specifications"
                        className="col-span-2"
                      />
                    </div>

                    <div className="mt-4 flex justify-end">
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

              <FormSection title="Terms & Shipping">
                <FormInput
                  name="paymentTerms"
                  label="Payment Terms"
                  placeholder="Enter payment terms"
                />
                <FormInput
                  name="deliveryTerms"
                  label="Delivery Terms"
                  placeholder="Enter delivery terms"
                />
                <FormSelect
                  name="shippingMethod"
                  label="Shipping Method"
                  options={shippingMethodOptions}
                />
              </FormSection>

              <FormSection title="Delivery Address">
                <FormInput
                  name="deliveryAddress.name"
                  label="Location Name"
                  placeholder="Enter location name"
                />
                <FormInput
                  name="deliveryAddress.contactPerson"
                  label="Contact Person"
                  placeholder="Enter contact person"
                />
                <FormInput
                  name="deliveryAddress.contactNumber"
                  label="Contact Number"
                  placeholder="Enter contact number"
                />
                <FormInput
                  name="deliveryAddress.address"
                  label="Address"
                  placeholder="Enter address"
                />
                <FormInput
                  name="deliveryAddress.city"
                  label="City"
                  placeholder="Enter city"
                />
                <FormInput
                  name="deliveryAddress.state"
                  label="State/Province"
                  placeholder="Enter state/province"
                />
                <FormInput
                  name="deliveryAddress.country"
                  label="Country"
                  placeholder="Enter country"
                />
                <FormInput
                  name="deliveryAddress.postalCode"
                  label="Postal Code"
                  placeholder="Enter postal code"
                />
              </FormSection>

              <FormSection title="Billing Address">
                <FormInput
                  name="billingAddress.name"
                  label="Location Name"
                  placeholder="Enter location name"
                />
                <FormInput
                  name="billingAddress.contactPerson"
                  label="Contact Person"
                  placeholder="Enter contact person"
                />
                <FormInput
                  name="billingAddress.contactNumber"
                  label="Contact Number"
                  placeholder="Enter contact number"
                />
                <FormInput
                  name="billingAddress.address"
                  label="Address"
                  placeholder="Enter address"
                />
                <FormInput
                  name="billingAddress.city"
                  label="City"
                  placeholder="Enter city"
                />
                <FormInput
                  name="billingAddress.state"
                  label="State/Province"
                  placeholder="Enter state/province"
                />
                <FormInput
                  name="billingAddress.country"
                  label="Country"
                  placeholder="Enter country"
                />
                <FormInput
                  name="billingAddress.postalCode"
                  label="Postal Code"
                  placeholder="Enter postal code"
                />
              </FormSection>

              <FormSection title="Additional Information">
                <FormTextarea
                  name="notes"
                  label="Notes"
                  placeholder="Enter additional notes"
                  className="col-span-2"
                />
                <FormTextarea
                  name="terms"
                  label="Terms & Conditions"
                  placeholder="Enter terms and conditions"
                  className="col-span-2"
                />
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