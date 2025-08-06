import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormSection } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

const safetyStockSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  itemCode: z.string().min(1, 'Item code is required'),
  itemName: z.string().min(1, 'Item name is required'),
  locationId: z.string().min(1, 'Location is required'),
  locationName: z.string().min(1, 'Location name is required'),
  serviceLevel: z.enum(['0.9', '0.95', '0.99']),
  leadTime: z.number().min(1, 'Lead time must be at least 1 day'),
  leadTimeVariability: z.number().min(0, 'Lead time variability must be non-negative'),
  demandAverage: z.number().min(0, 'Average demand must be non-negative'),
  demandVariability: z.number().min(0, 'Demand variability must be non-negative'),
  calculationMethod: z.enum(['NORMAL_APPROXIMATION', 'POISSON', 'EMPIRICAL']),
  reviewPeriod: z.number().min(1, 'Review period must be at least 1 day'),
  notes: z.string().optional(),
});

type SafetyStockFormData = z.infer<typeof safetyStockSchema>;

// Mock data for dropdowns
const itemOptions = [
  { label: 'Printer Toner (ITEM-0187)', value: 'item-1' },
  { label: 'Laptop Docking Station (ITEM-0042)', value: 'item-2' },
  { label: 'USB Cables (ITEM-0103)', value: 'item-3' },
  { label: 'Office Chair (ITEM-0215)', value: 'item-4' },
  { label: 'Wireless Keyboard (ITEM-0078)', value: 'item-5' },
];

const locationOptions = [
  { label: 'Main Warehouse', value: 'location-1' },
  { label: 'East Coast DC', value: 'location-2' },
  { label: 'West Coast DC', value: 'location-3' },
];

const serviceLevelOptions = [
  { label: '90% Service Level', value: '0.9' },
  { label: '95% Service Level', value: '0.95' },
  { label: '99% Service Level', value: '0.99' },
];

const calculationMethodOptions = [
  { label: 'Normal Approximation', value: 'NORMAL_APPROXIMATION' },
  { label: 'Poisson Distribution', value: 'POISSON' },
  { label: 'Empirical Method', value: 'EMPIRICAL' },
];

export function CreateSafetyStock() {
  const navigate = useNavigate();
  
  const defaultValues: Partial<SafetyStockFormData> = {
    serviceLevel: '0.95',
    leadTime: 7,
    leadTimeVariability: 1,
    demandAverage: 0,
    demandVariability: 0,
    calculationMethod: 'NORMAL_APPROXIMATION',
    reviewPeriod: 7,
  };

  const onSubmit = async (data: SafetyStockFormData) => {
    console.log('Form submitted:', data);
    // In a real app, you would save the data to the server here
    navigate('/inventory/optimization/safety-stock');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Calculator className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Create Safety Stock Calculation</h1>
      </div>

      <FormContainer
        schema={safetyStockSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText="Calculate Safety Stock"
        cancelText="Cancel"
        onCancel={() => navigate('/inventory/optimization/safety-stock')}
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
          
          // Calculate safety stock when parameters change
          const serviceLevel = parseFloat(watch('serviceLevel') || '0.95');
          const leadTime = watch('leadTime') || 0;
          const demandVariability = watch('demandVariability') || 0;
          
          // Z-score based on service level
          const zScore = serviceLevel === 0.9 ? 1.28 : serviceLevel === 0.95 ? 1.65 : 2.33;
          
          // Calculate safety stock
          const safetyStock = Math.round(zScore * Math.sqrt(leadTime) * demandVariability);

          return (
            <>
              <FormSection title="Item Information">
                <FormSelect
                  name="itemId"
                  label="Item"
                  options={itemOptions}
                />
                <FormSelect
                  name="locationId"
                  label="Location"
                  options={locationOptions}
                />
              </FormSection>

              <FormSection title="Service Level">
                <FormSelect
                  name="serviceLevel"
                  label="Target Service Level"
                  options={serviceLevelOptions}
                  description="Higher service levels require more safety stock"
                />
                <FormInput
                  name="reviewPeriod"
                  label="Review Period (days)"
                  type="number"
                  min={1}
                  description="How often to review and update safety stock"
                />
              </FormSection>

              <FormSection title="Demand Parameters">
                <FormInput
                  name="demandAverage"
                  label="Average Daily Demand"
                  type="number"
                  min={0}
                  step={0.1}
                  description="Average units consumed per day"
                />
                <FormInput
                  name="demandVariability"
                  label="Demand Variability"
                  type="number"
                  min={0}
                  step={0.1}
                  description="Standard deviation of daily demand"
                />
              </FormSection>

              <FormSection title="Lead Time Parameters">
                <FormInput
                  name="leadTime"
                  label="Lead Time (days)"
                  type="number"
                  min={1}
                  description="Average time from order to receipt"
                />
                <FormInput
                  name="leadTimeVariability"
                  label="Lead Time Variability"
                  type="number"
                  min={0}
                  step={0.1}
                  description="Standard deviation of lead time"
                />
              </FormSection>

              <FormSection title="Calculation Method">
                <FormSelect
                  name="calculationMethod"
                  label="Calculation Method"
                  options={calculationMethodOptions}
                  description="Statistical method used for calculation"
                  className="col-span-2"
                />
                <FormTextarea
                  name="notes"
                  label="Notes"
                  placeholder="Enter any additional notes"
                  className="col-span-2"
                />
              </FormSection>

              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Calculation Preview</CardTitle>
                  <CardDescription>Estimated safety stock based on current parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Z-Score</p>
                        <p className="text-xl font-bold">{zScore.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          Based on {serviceLevel * 100}% service level
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Formula</p>
                        <p className="text-sm">
                          Z × √(Lead Time) × Demand Variability
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {zScore.toFixed(2)} × √{leadTime} × {demandVariability}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Safety Stock</p>
                        <p className="text-3xl font-bold">{safetyStock}</p>
                        <p className="text-xs text-muted-foreground">
                          Estimated units required
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>
                        This safety stock level provides a {serviceLevel * 100}% probability of not stocking out during lead time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          );
        }}
      </FormContainer>
    </div>
  );
}