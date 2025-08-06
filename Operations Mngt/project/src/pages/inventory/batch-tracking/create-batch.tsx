import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormCheckbox, FormSection, FormDatePicker } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Layers, Upload } from 'lucide-react';

const batchSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  itemCode: z.string().min(1, 'Item code is required'),
  itemName: z.string().min(1, 'Item name is required'),
  batchNumber: z.string().min(1, 'Batch/lot number is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  manufacturingDate: z.date(),
  expiryDate: z.date().optional().nullable(),
  receivedDate: z.date(),
  supplierId: z.string().min(1, 'Supplier is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  supplierBatchNumber: z.string().optional(),
  location: z.object({
    warehouseId: z.string().min(1, 'Warehouse is required'),
    warehouseName: z.string().min(1, 'Warehouse name is required'),
    zoneId: z.string().min(1, 'Zone is required'),
    zoneName: z.string().min(1, 'Zone name is required'),
    aisleId: z.string().optional(),
    aisleName: z.string().optional(),
    rackId: z.string().optional(),
    rackName: z.string().optional(),
    binId: z.string().optional(),
    binName: z.string().optional(),
  }),
  qualityCheck: z.object({
    required: z.boolean(),
    status: z.enum(['PENDING', 'PASSED', 'FAILED']).optional(),
    notes: z.string().optional(),
  }),
  cost: z.object({
    unitCost: z.number().min(0, 'Unit cost must be non-negative'),
    currency: z.string().min(1, 'Currency is required'),
    totalCost: z.number().min(0, 'Total cost must be non-negative'),
  }),
  notes: z.string().optional(),
});

type BatchFormData = z.infer<typeof batchSchema>;

// Mock data for dropdowns
const itemOptions = [
  { label: 'Printer Toner (ITEM-0187)', value: 'item-1' },
  { label: 'Laptop Docking Station (ITEM-0042)', value: 'item-2' },
  { label: 'USB Cables (ITEM-0103)', value: 'item-3' },
  { label: 'Office Chair (ITEM-0215)', value: 'item-4' },
  { label: 'Wireless Keyboard (ITEM-0078)', value: 'item-5' },
];

const supplierOptions = [
  { label: 'Tech Supplies Inc.', value: 'supplier-1' },
  { label: 'Electronics Wholesale', value: 'supplier-2' },
  { label: 'Cable Solutions', value: 'supplier-3' },
  { label: 'Office Furniture Co.', value: 'supplier-4' },
];

const warehouseOptions = [
  { label: 'Main Warehouse', value: 'warehouse-1' },
  { label: 'East Coast DC', value: 'warehouse-2' },
  { label: 'West Coast DC', value: 'warehouse-3' },
];

const zoneOptions = [
  { label: 'Receiving Zone', value: 'zone-1' },
  { label: 'Storage Zone', value: 'zone-2' },
  { label: 'Picking Zone', value: 'zone-3' },
];

const currencyOptions = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
];

export function CreateBatch() {
  const navigate = useNavigate();
  
  const defaultValues: Partial<BatchFormData> = {
    manufacturingDate: new Date(),
    receivedDate: new Date(),
    qualityCheck: {
      required: true,
      status: 'PENDING',
    },
    cost: {
      currency: 'USD',
    },
  };

  const onSubmit = async (data: BatchFormData) => {
    console.log('Form submitted:', data);
    // In a real app, you would save the data to the server here
    navigate('/inventory/batch-tracking');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Layers className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Create Batch/Lot</h1>
      </div>

      <FormContainer
        schema={batchSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText="Create Batch"
        cancelText="Cancel"
        onCancel={() => navigate('/inventory/batch-tracking')}
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
          
          // Watch for supplier changes
          const selectedSupplierId = watch('supplierId');
          const selectedSupplier = supplierOptions.find(supplier => supplier.value === selectedSupplierId);
          
          // Update supplier name when supplier changes
          React.useEffect(() => {
            if (selectedSupplier) {
              setValue('supplierName', selectedSupplier.label);
            }
          }, [selectedSupplierId, setValue]);
          
          // Watch for warehouse changes
          const selectedWarehouseId = watch('location.warehouseId');
          const selectedWarehouse = warehouseOptions.find(warehouse => warehouse.value === selectedWarehouseId);
          
          // Update warehouse name when warehouse changes
          React.useEffect(() => {
            if (selectedWarehouse) {
              setValue('location.warehouseName', selectedWarehouse.label);
            }
          }, [selectedWarehouseId, setValue]);
          
          // Watch for zone changes
          const selectedZoneId = watch('location.zoneId');
          const selectedZone = zoneOptions.find(zone => zone.value === selectedZoneId);
          
          // Update zone name when zone changes
          React.useEffect(() => {
            if (selectedZone) {
              setValue('location.zoneName', selectedZone.label);
            }
          }, [selectedZoneId, setValue]);
          
          // Watch quantity and unit cost to calculate total cost
          const quantity = watch('quantity') || 0;
          const unitCost = watch('cost.unitCost') || 0;
          
          // Update total cost when quantity or unit cost changes
          React.useEffect(() => {
            setValue('cost.totalCost', quantity * unitCost);
          }, [quantity, unitCost, setValue]);

          return (
            <>
              <FormSection title="Item Information">
                <FormSelect
                  name="itemId"
                  label="Item"
                  options={itemOptions}
                />
                <FormInput
                  name="batchNumber"
                  label="Batch/Lot Number"
                  placeholder="Enter batch/lot number"
                />
                <FormInput
                  name="quantity"
                  label="Quantity"
                  type="number"
                  min={1}
                />
                <FormDatePicker
                  name="manufacturingDate"
                  label="Manufacturing Date"
                />
                <FormDatePicker
                  name="expiryDate"
                  label="Expiry Date (if applicable)"
                  isClearable
                />
                <FormDatePicker
                  name="receivedDate"
                  label="Received Date"
                />
              </FormSection>

              <FormSection title="Supplier Information">
                <FormSelect
                  name="supplierId"
                  label="Supplier"
                  options={supplierOptions}
                />
                <FormInput
                  name="supplierBatchNumber"
                  label="Supplier Batch Number"
                  placeholder="Enter supplier's batch number (if different)"
                />
              </FormSection>

              <FormSection title="Location">
                <FormSelect
                  name="location.warehouseId"
                  label="Warehouse"
                  options={warehouseOptions}
                />
                <FormSelect
                  name="location.zoneId"
                  label="Zone"
                  options={zoneOptions}
                />
                <FormInput
                  name="location.aisleName"
                  label="Aisle"
                  placeholder="Enter aisle"
                />
                <FormInput
                  name="location.rackName"
                  label="Rack"
                  placeholder="Enter rack"
                />
                <FormInput
                  name="location.binName"
                  label="Bin"
                  placeholder="Enter bin"
                />
              </FormSection>

              <FormSection title="Quality Information">
                <FormCheckbox
                  name="qualityCheck.required"
                  label="Quality Check"
                  checkboxLabel="Quality check required"
                />
                {watch('qualityCheck.required') && (
                  <>
                    <FormSelect
                      name="qualityCheck.status"
                      label="Quality Status"
                      options={[
                        { label: 'Pending', value: 'PENDING' },
                        { label: 'Passed', value: 'PASSED' },
                        { label: 'Failed', value: 'FAILED' },
                      ]}
                    />
                    <FormTextarea
                      name="qualityCheck.notes"
                      label="Quality Notes"
                      placeholder="Enter quality check notes"
                      className="col-span-2"
                    />
                  </>
                )}
              </FormSection>

              <FormSection title="Cost Information">
                <FormInput
                  name="cost.unitCost"
                  label="Unit Cost"
                  type="number"
                  min={0}
                  step={0.01}
                />
                <FormSelect
                  name="cost.currency"
                  label="Currency"
                  options={currencyOptions}
                />
                <FormInput
                  name="cost.totalCost"
                  label="Total Cost"
                  type="number"
                  min={0}
                  step={0.01}
                  disabled
                />
              </FormSection>

              <FormSection title="Additional Information">
                <FormTextarea
                  name="notes"
                  label="Notes"
                  placeholder="Enter any additional notes"
                  className="col-span-2"
                />
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Documents</label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Drag and drop files here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported formats: PDF, JPG, PNG (max 10MB)
                    </p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Browse Files
                    </Button>
                  </div>
                </div>
              </FormSection>
            </>
          );
        }}
      </FormContainer>
    </div>
  );
}