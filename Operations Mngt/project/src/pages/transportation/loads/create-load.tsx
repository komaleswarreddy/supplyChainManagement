import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormCheckbox, FormSection } from '@/components/form';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTransportation } from '@/hooks/useTransportation';
import { Package, Truck, Box, Maximize } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const loadSchema = z.object({
  shipments: z.array(z.string()).min(1, 'At least one shipment is required'),
  equipment: z.object({
    type: z.enum(['DRY_VAN', 'REEFER', 'FLATBED', 'CONTAINER', 'OTHER']),
    length: z.number().min(1, 'Length is required'),
    width: z.number().min(1, 'Width is required'),
    height: z.number().min(1, 'Height is required'),
    dimensionUnit: z.enum(['FT', 'M']),
    maxWeight: z.number().min(1, 'Max weight is required'),
    weightUnit: z.enum(['LB', 'KG']),
  }),
  scheduledDate: z.date(),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string(),
    itemCode: z.string().min(1, 'Item code is required'),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    dimensions: z.object({
      length: z.number().min(1, 'Length is required'),
      width: z.number().min(1, 'Width is required'),
      height: z.number().min(1, 'Height is required'),
      unit: z.enum(['IN', 'CM']),
    }),
    weight: z.number().min(0.1, 'Weight must be greater than 0'),
    weightUnit: z.enum(['LB', 'KG']),
    stackable: z.boolean(),
    stackingLimit: z.number().optional(),
  })).min(1, 'At least one item is required'),
});

type LoadFormData = z.infer<typeof loadSchema>;

const defaultValues: LoadFormData = {
  shipments: [],
  equipment: {
    type: 'DRY_VAN',
    length: 53,
    width: 8.5,
    height: 9,
    dimensionUnit: 'FT',
    maxWeight: 45000,
    weightUnit: 'LB',
  },
  scheduledDate: new Date(),
  items: [
    {
      itemId: 'item-1',
      itemCode: 'ITEM-0001',
      description: 'Sample Product',
      quantity: 10,
      dimensions: {
        length: 48,
        width: 40,
        height: 48,
        unit: 'IN',
      },
      weight: 100,
      weightUnit: 'LB',
      stackable: true,
      stackingLimit: 3,
    }
  ],
};

const equipmentTypeOptions = [
  { label: 'Dry Van', value: 'DRY_VAN' },
  { label: 'Reefer', value: 'REEFER' },
  { label: 'Flatbed', value: 'FLATBED' },
  { label: 'Container', value: 'CONTAINER' },
  { label: 'Other', value: 'OTHER' },
];

const dimensionUnitOptions = [
  { label: 'Feet', value: 'FT' },
  { label: 'Meters', value: 'M' },
];

const weightUnitOptions = [
  { label: 'Pounds', value: 'LB' },
  { label: 'Kilograms', value: 'KG' },
];

const itemDimensionUnitOptions = [
  { label: 'Inches', value: 'IN' },
  { label: 'Centimeters', value: 'CM' },
];

export function CreateLoad() {
  const navigate = useNavigate();
  const { useCreateLoad, useCalculateLoadPlan } = useTransportation();
  const { mutate: createLoad, isLoading: isCreating } = useCreateLoad();
  const { mutate: calculateLoadPlan, isLoading: isCalculating, data: loadPlanData } = useCalculateLoadPlan();
  
  const [formValues, setFormValues] = useState<LoadFormData>(defaultValues);
  const [showLoadPlan, setShowLoadPlan] = useState(false);

  const handleCalculateLoadPlan = () => {
    calculateLoadPlan({
      items: formValues.items,
      equipmentType: formValues.equipment.type
    });
    setShowLoadPlan(true);
  };

  const onSubmit = async (data: LoadFormData) => {
    // In a real app, we would use the calculated load plan
    const loadPlan = loadPlanData?.data || {
      totalWeight: data.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0),
      weightUnit: data.items[0].weightUnit,
      totalVolume: data.items.reduce((sum, item) => {
        const itemVolume = item.dimensions.length * item.dimensions.width * item.dimensions.height;
        return sum + (itemVolume * item.quantity);
      }, 0),
      volumeUnit: 'CUFT',
      utilizationPercentage: 75, // Placeholder
      items: data.items.map(item => ({
        ...item,
        position: { x: 0, y: 0, z: 0 } // Placeholder
      })),
    };

    createLoad({
      status: 'PLANNING',
      shipments: data.shipments,
      equipment: data.equipment,
      loadPlan,
      scheduledDate: data.scheduledDate.toISOString(),
      notes: data.notes,
      createdBy: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['logistics_planner'],
        permissions: ['manage_loads'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }, {
      onSuccess: () => {
        navigate('/transportation/loads');
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Create Load Plan</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FormContainer
            title="Load Details"
            description="Enter the details for your load plan"
            schema={loadSchema}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            submitText={isCreating ? 'Creating...' : 'Create Load Plan'}
            cancelText="Cancel"
            onCancel={() => navigate('/transportation/loads')}
            showReset
          >
            {({ control, register, setValue, getValues, watch }) => {
              // Watch for changes to update the form values for load plan calculation
              const watchedValues = watch();
              React.useEffect(() => {
                setFormValues(watchedValues);
              }, [watchedValues]);

              return (
                <>
                  <FormSection title="Basic Information">
                    <div className="col-span-2">
                      <FormInput
                        name="shipments"
                        label="Shipment IDs"
                        placeholder="Enter comma-separated shipment IDs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Scheduled Date</label>
                      <DatePicker
                        selected={getValues('scheduledDate')}
                        onChange={(date) => setValue('scheduledDate', date)}
                        minDate={new Date()}
                        className="w-full rounded-md border p-2"
                      />
                    </div>
                    <FormTextarea
                      name="notes"
                      label="Notes"
                      placeholder="Enter any special instructions or notes"
                    />
                  </FormSection>

                  <FormSection title="Equipment">
                    <FormSelect
                      name="equipment.type"
                      label="Equipment Type"
                      options={equipmentTypeOptions}
                    />
                    <FormSelect
                      name="equipment.dimensionUnit"
                      label="Dimension Unit"
                      options={dimensionUnitOptions}
                    />
                    <FormInput
                      name="equipment.length"
                      label="Length"
                      type="number"
                      min="1"
                      step="0.1"
                    />
                    <FormInput
                      name="equipment.width"
                      label="Width"
                      type="number"
                      min="1"
                      step="0.1"
                    />
                    <FormInput
                      name="equipment.height"
                      label="Height"
                      type="number"
                      min="1"
                      step="0.1"
                    />
                    <FormInput
                      name="equipment.maxWeight"
                      label="Max Weight"
                      type="number"
                      min="1"
                    />
                    <FormSelect
                      name="equipment.weightUnit"
                      label="Weight Unit"
                      options={weightUnitOptions}
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
                            <FormSelect
                              name={`items.${index}.dimensions.unit`}
                              label="Dimension Unit"
                              options={itemDimensionUnitOptions}
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
                              name={`items.${index}.weight`}
                              label="Weight"
                              type="number"
                              min="0.1"
                              step="0.1"
                            />
                            <FormSelect
                              name={`items.${index}.weightUnit`}
                              label="Weight Unit"
                              options={weightUnitOptions}
                            />
                            <FormCheckbox
                              name={`items.${index}.stackable`}
                              label="Stackable"
                              checkboxLabel="Item can be stacked"
                            />
                            {getValues(`items.${index}.stackable`) && (
                              <FormInput
                                name={`items.${index}.stackingLimit`}
                                label="Stacking Limit"
                                type="number"
                                min="1"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormSection>
                </>
              );
            }}
          </FormContainer>
        </div>

        <div>
          <div className="sticky top-6 space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Load Plan Preview</h2>
              <Button 
                onClick={handleCalculateLoadPlan} 
                className="w-full mb-4"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Calculating...
                  </>
                ) : (
                  'Calculate Load Plan'
                )}
              </Button>

              {showLoadPlan && loadPlanData && (
                <div className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-4">
                    <div className="w-full h-full border-2 border-dashed border-muted-foreground rounded-lg p-4 relative">
                      {/* Simple 2D representation of items */}
                      <div className="w-full h-full flex flex-wrap gap-2 overflow-auto">
                        {loadPlanData.data.items.map((item, index) => (
                          <div 
                            key={index}
                            className="bg-primary/20 border border-primary rounded p-2 text-xs"
                            style={{
                              width: `${Math.min(100, (item.dimensions.width / formValues.equipment.width) * 100)}%`,
                              height: `${Math.min(100, (item.dimensions.height / formValues.equipment.height) * 100)}%`,
                            }}
                          >
                            <div className="font-medium truncate">{item.description}</div>
                            <div>{item.quantity}x</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Utilization</h3>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${loadPlanData.data.utilizationPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm">{loadPlanData.data.utilizationPercentage}% utilized</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Weight:</span>{' '}
                      <span className="font-medium">
                        {loadPlanData.data.totalWeight.toLocaleString()} {loadPlanData.data.weightUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Volume:</span>{' '}
                      <span className="font-medium">
                        {loadPlanData.data.totalVolume.toLocaleString()} {loadPlanData.data.volumeUnit}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!showLoadPlan && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4" />
                  <p>Click "Calculate Load Plan" to generate a preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}