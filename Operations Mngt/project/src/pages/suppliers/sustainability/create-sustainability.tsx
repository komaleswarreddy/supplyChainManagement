import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormContainer } from '@/components/form/form-container';
import { FormSection } from '@/components/form/form-section';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { FormTextarea } from '@/components/form/form-textarea';
import { FormCheckbox } from '@/components/form/form-checkbox';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Leaf, Plus, Trash2 } from 'lucide-react';

// Schema for sustainability creation
const sustainabilitySchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  overallRating: z.enum(['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F']),
  carbonFootprint: z.number().min(0),
  carbonUnit: z.enum(['tCO2e', 'kgCO2e']),
  waterUsage: z.number().min(0),
  waterUnit: z.enum(['gallons', 'liters']),
  wasteGeneration: z.number().min(0),
  wasteUnit: z.enum(['tons', 'kg']),
  renewableEnergy: z.number().min(0).max(100),
  certifications: z.array(z.string()),
  complianceStatus: z.enum(['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW']),
  lastAssessmentDate: z.string().optional(),
  nextAssessmentDate: z.string().optional(),
  description: z.string().optional(),
  goals: z.object({
    carbonReduction: z.number().min(0).max(100),
    waterReduction: z.number().min(0).max(100),
    wasteReduction: z.number().min(0).max(100),
    renewableTarget: z.number().min(0).max(100),
    targetDate: z.string(),
  }),
  initiatives: z.array(z.object({
    name: z.string(),
    description: z.string(),
    status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']),
    startDate: z.string(),
    endDate: z.string(),
    impact: z.object({
      category: z.enum(['CARBON', 'WATER', 'WASTE', 'ENERGY', 'SOCIAL']),
      value: z.number(),
      unit: z.string(),
    }),
  })),
});

type SustainabilityFormData = z.infer<typeof sustainabilitySchema>;

const defaultValues: SustainabilityFormData = {
  supplierId: '',
  overallRating: 'B',
  carbonFootprint: 0,
  carbonUnit: 'tCO2e',
  waterUsage: 0,
  waterUnit: 'gallons',
  wasteGeneration: 0,
  wasteUnit: 'tons',
  renewableEnergy: 0,
  certifications: [],
  complianceStatus: 'PENDING_REVIEW',
  lastAssessmentDate: new Date().toISOString().split('T')[0],
  nextAssessmentDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  description: '',
  goals: {
    carbonReduction: 10,
    waterReduction: 15,
    wasteReduction: 20,
    renewableTarget: 25,
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  initiatives: [],
};

const certificationOptions = [
  { value: 'ISO 14001', label: 'ISO 14001 - Environmental Management' },
  { value: 'LEED', label: 'LEED - Leadership in Energy and Environmental Design' },
  { value: 'BREEAM', label: 'BREEAM - Building Research Establishment Environmental Assessment Method' },
  { value: 'Green Seal', label: 'Green Seal' },
  { value: 'Energy Star', label: 'Energy Star' },
  { value: 'Fair Trade', label: 'Fair Trade' },
  { value: 'Rainforest Alliance', label: 'Rainforest Alliance' },
  { value: 'FSC', label: 'FSC - Forest Stewardship Council' },
  { value: 'MSC', label: 'MSC - Marine Stewardship Council' },
  { value: 'B Corp', label: 'B Corp Certification' },
];

const impactCategoryOptions = [
  { value: 'CARBON', label: 'Carbon Emissions' },
  { value: 'WATER', label: 'Water Usage' },
  { value: 'WASTE', label: 'Waste Generation' },
  { value: 'ENERGY', label: 'Energy Consumption' },
  { value: 'SOCIAL', label: 'Social Impact' },
];

const statusOptions = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export function CreateSustainability() {
  const navigate = useNavigate();
  const { useCreateSustainability, useSupplierList } = useSuppliers();
  const { mutate: createSustainability, isLoading } = useCreateSustainability();
  const { data: suppliers } = useSupplierList({ page: 1, pageSize: 100 });

  const supplierOptions = suppliers?.items?.map(supplier => ({
    value: supplier.id,
    label: supplier.name,
  })) || [];

  const onSubmit = async (data: SustainabilityFormData) => {
    console.log('CreateSustainability: Form submitted with data:', data);
    createSustainability(data, {
      onSuccess: (response) => {
        console.log('CreateSustainability: Success - navigating to:', response.data.id);
        navigate(`/suppliers/sustainability/${response.data.id}`);
      },
      onError: (error) => {
        console.error('CreateSustainability: Error creating sustainability record:', error);
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Create Sustainability Record"
        description="Create a new supplier sustainability assessment"
        schema={sustainabilitySchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Creating...' : 'Create Sustainability Record'}
        cancelText="Cancel"
        onCancel={() => navigate('/suppliers/sustainability')}
        showReset
      >
        {({ control, getValues, watch }) => {
          const { fields: initiativeFields, append: appendInitiative, remove: removeInitiative } = useFieldArray({
            control,
            name: 'initiatives',
          });

          return (
            <>
              <FormSection title="Basic Information">
                <FormSelect
                  name="supplierId"
                  label="Supplier"
                  options={supplierOptions}
                  placeholder="Select supplier"
                />
                <FormSelect
                  name="overallRating"
                  label="Overall Rating"
                  options={[
                    { value: 'A+', label: 'A+ - Excellent' },
                    { value: 'A', label: 'A - Very Good' },
                    { value: 'B+', label: 'B+ - Good' },
                    { value: 'B', label: 'B - Satisfactory' },
                    { value: 'C+', label: 'C+ - Below Average' },
                    { value: 'C', label: 'C - Poor' },
                    { value: 'D+', label: 'D+ - Very Poor' },
                    { value: 'D', label: 'D - Critical' },
                    { value: 'F', label: 'F - Failed' },
                  ]}
                />
                <FormSelect
                  name="complianceStatus"
                  label="Compliance Status"
                  options={[
                    { value: 'COMPLIANT', label: 'Compliant' },
                    { value: 'PARTIALLY_COMPLIANT', label: 'Partially Compliant' },
                    { value: 'NON_COMPLIANT', label: 'Non-Compliant' },
                    { value: 'PENDING_REVIEW', label: 'Pending Review' },
                  ]}
                />
                <FormTextarea
                  name="description"
                  label="Description"
                  placeholder="Enter sustainability assessment description"
                  className="col-span-2"
                />
              </FormSection>

              <FormSection title="Environmental Metrics">
                <FormInput
                  name="carbonFootprint"
                  label="Carbon Footprint"
                  type="number"
                  step="0.1"
                  placeholder="Enter carbon footprint"
                />
                <FormSelect
                  name="carbonUnit"
                  label="Carbon Unit"
                  options={[
                    { value: 'tCO2e', label: 'tCO2e (metric tons)' },
                    { value: 'kgCO2e', label: 'kgCO2e (kilograms)' },
                  ]}
                />
                <FormInput
                  name="waterUsage"
                  label="Water Usage"
                  type="number"
                  step="0.1"
                  placeholder="Enter water usage"
                />
                <FormSelect
                  name="waterUnit"
                  label="Water Unit"
                  options={[
                    { value: 'gallons', label: 'Gallons' },
                    { value: 'liters', label: 'Liters' },
                  ]}
                />
                <FormInput
                  name="wasteGeneration"
                  label="Waste Generation"
                  type="number"
                  step="0.1"
                  placeholder="Enter waste generation"
                />
                <FormSelect
                  name="wasteUnit"
                  label="Waste Unit"
                  options={[
                    { value: 'tons', label: 'Tons' },
                    { value: 'kg', label: 'Kilograms' },
                  ]}
                />
                <FormInput
                  name="renewableEnergy"
                  label="Renewable Energy (%)"
                  type="number"
                  placeholder="Enter renewable energy percentage (0-100)"
                />
              </FormSection>

              <FormSection title="Certifications">
                <div className="grid gap-4 sm:grid-cols-2">
                  {certificationOptions.map((option) => (
                    <FormCheckbox
                      key={option.value}
                      name="certifications"
                      label=""
                      checkboxLabel={option.label}
                      value={option.value}
                    />
                  ))}
                </div>
              </FormSection>

              <FormSection title="Assessment Dates">
                <FormInput
                  name="lastAssessmentDate"
                  label="Last Assessment Date"
                  type="date"
                />
                <FormInput
                  name="nextAssessmentDate"
                  label="Next Assessment Date"
                  type="date"
                />
              </FormSection>

              <FormSection title="Sustainability Goals">
                <FormInput
                  name="goals.carbonReduction"
                  label="Carbon Reduction Target (%)"
                  type="number"
                  placeholder="Enter carbon reduction target (0-100)"
                />
                <FormInput
                  name="goals.waterReduction"
                  label="Water Reduction Target (%)"
                  type="number"
                  placeholder="Enter water reduction target (0-100)"
                />
                <FormInput
                  name="goals.wasteReduction"
                  label="Waste Reduction Target (%)"
                  type="number"
                  placeholder="Enter waste reduction target (0-100)"
                />
                <FormInput
                  name="goals.renewableTarget"
                  label="Renewable Energy Target (%)"
                  type="number"
                  placeholder="Enter renewable energy target (0-100)"
                />
                <FormInput
                  name="goals.targetDate"
                  label="Target Date"
                  type="date"
                />
              </FormSection>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Sustainability Initiatives</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendInitiative({
                        name: '',
                        description: '',
                        status: 'PLANNED',
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        impact: {
                          category: 'CARBON',
                          value: 0,
                          unit: '',
                        },
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Initiative
                    </Button>
                    {initiativeFields.length > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeInitiative(initiativeFields.length - 1)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Initiative
                      </Button>
                    )}
                  </div>
                </div>
                {initiativeFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput
                        name={`initiatives.${index}.name`}
                        label="Initiative Name"
                        placeholder="Enter initiative name"
                      />
                      <FormSelect
                        name={`initiatives.${index}.status`}
                        label="Status"
                        options={statusOptions}
                      />
                      <FormInput
                        name={`initiatives.${index}.startDate`}
                        label="Start Date"
                        type="date"
                      />
                      <FormInput
                        name={`initiatives.${index}.endDate`}
                        label="End Date"
                        type="date"
                      />
                      <FormSelect
                        name={`initiatives.${index}.impact.category`}
                        label="Impact Category"
                        options={impactCategoryOptions}
                      />
                      <FormInput
                        name={`initiatives.${index}.impact.value`}
                        label="Impact Value"
                        type="number"
                        step="0.1"
                        placeholder="Enter impact value"
                      />
                      <FormInput
                        name={`initiatives.${index}.impact.unit`}
                        label="Impact Unit"
                        placeholder="Enter impact unit (e.g., tCO2e, gallons)"
                      />
                      <FormTextarea
                        name={`initiatives.${index}.description`}
                        label="Description"
                        placeholder="Enter initiative description"
                        className="col-span-2"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </>
          );
        }}
      </FormContainer>
    </div>
  );
}

export default CreateSustainability;
