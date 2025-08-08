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
import { CheckCircle, Plus, Trash2 } from 'lucide-react';

// Schema for quality record creation
const qualityRecordSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  status: z.enum(['APPROVED', 'CONDITIONAL', 'REJECTED', 'PENDING']),
  qualityScore: z.number().min(0).max(100),
  defectRate: z.number().min(0).max(100),
  firstPassYield: z.number().min(0).max(100),
  onTimeDelivery: z.number().min(0).max(100),
  qualitySystem: z.string().min(1, 'Quality system is required'),
  certifications: z.array(z.string()),
  lastAuditDate: z.string().optional(),
  nextAuditDate: z.string().optional(),
  description: z.string().optional(),
  incidents: z.array(z.object({
    date: z.string(),
    type: z.string(),
    severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR', 'OBSERVATION']),
    description: z.string(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED']),
  })),
  correctiveActions: z.array(z.object({
    title: z.string(),
    description: z.string(),
    dueDate: z.string(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']),
    assignedTo: z.string(),
  })),
});

type QualityRecordFormData = z.infer<typeof qualityRecordSchema>;

const defaultValues: QualityRecordFormData = {
  supplierId: '',
  status: 'PENDING',
  qualityScore: 0,
  defectRate: 0,
  firstPassYield: 0,
  onTimeDelivery: 0,
  qualitySystem: '',
  certifications: [],
  lastAuditDate: '',
  nextAuditDate: '',
  description: '',
  incidents: [],
  correctiveActions: [],
};

const qualitySystemOptions = [
  { value: 'Six Sigma', label: 'Six Sigma' },
  { value: 'TQM', label: 'Total Quality Management' },
  { value: 'Lean Manufacturing', label: 'Lean Manufacturing' },
  { value: 'APQP', label: 'Advanced Product Quality Planning' },
  { value: 'ISO 9001', label: 'ISO 9001' },
  { value: 'IATF 16949', label: 'IATF 16949' },
  { value: 'AS9100', label: 'AS9100' },
  { value: 'ISO 13485', label: 'ISO 13485' },
];

const certificationOptions = [
  { value: 'ISO 9001', label: 'ISO 9001' },
  { value: 'IATF 16949', label: 'IATF 16949' },
  { value: 'AS9100', label: 'AS9100' },
  { value: 'ISO 13485', label: 'ISO 13485' },
  { value: 'ISO 14001', label: 'ISO 14001' },
  { value: 'OHSAS 18001', label: 'OHSAS 18001' },
  { value: 'ISO 45001', label: 'ISO 45001' },
];

const severityOptions = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'MAJOR', label: 'Major' },
  { value: 'MINOR', label: 'Minor' },
  { value: 'OBSERVATION', label: 'Observation' },
];

const statusOptions = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'CLOSED', label: 'Closed' },
];

const actionStatusOptions = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'OVERDUE', label: 'Overdue' },
];

export function CreateQualityRecord() {
  const navigate = useNavigate();
  const { useCreateQualityRecord, useSupplierList } = useSuppliers();
  const { mutate: createQualityRecord, isLoading } = useCreateQualityRecord();
  const { data: suppliers } = useSupplierList({ page: 1, pageSize: 100 });

  const supplierOptions = suppliers?.items?.map(supplier => ({
    value: supplier.id,
    label: supplier.name,
  })) || [];

  const onSubmit = async (data: QualityRecordFormData) => {
    console.log('CreateQualityRecord: Form submitted with data:', data);
    createQualityRecord(data, {
      onSuccess: (response) => {
        console.log('CreateQualityRecord: Success - navigating to:', response.data.id);
        navigate(`/suppliers/quality-management/${response.data.id}`);
      },
      onError: (error) => {
        console.error('CreateQualityRecord: Error creating quality record:', error);
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Create Quality Record"
        description="Create a new supplier quality assessment record"
        schema={qualityRecordSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Creating...' : 'Create Quality Record'}
        cancelText="Cancel"
        onCancel={() => navigate('/suppliers/quality-management')}
        showReset
      >
        {({ control, getValues, watch }) => {
          const { fields: incidentFields, append: appendIncident, remove: removeIncident } = useFieldArray({
            control,
            name: 'incidents',
          });

          const { fields: actionFields, append: appendAction, remove: removeAction } = useFieldArray({
            control,
            name: 'correctiveActions',
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
                  name="status"
                  label="Quality Status"
                  options={[
                    { value: 'APPROVED', label: 'Approved' },
                    { value: 'CONDITIONAL', label: 'Conditional' },
                    { value: 'REJECTED', label: 'Rejected' },
                    { value: 'PENDING', label: 'Pending' },
                  ]}
                />
                <FormSelect
                  name="qualitySystem"
                  label="Quality System"
                  options={qualitySystemOptions}
                  placeholder="Select quality system"
                />
                <FormTextarea
                  name="description"
                  label="Description"
                  placeholder="Enter quality assessment description"
                  className="col-span-2"
                />
              </FormSection>

              <FormSection title="Quality Metrics">
                <FormInput
                  name="qualityScore"
                  label="Quality Score (%)"
                  type="number"
                  placeholder="Enter quality score (0-100)"
                />
                <FormInput
                  name="defectRate"
                  label="Defect Rate (%)"
                  type="number"
                  placeholder="Enter defect rate (0-100)"
                />
                <FormInput
                  name="firstPassYield"
                  label="First Pass Yield (%)"
                  type="number"
                  placeholder="Enter first pass yield (0-100)"
                />
                <FormInput
                  name="onTimeDelivery"
                  label="On-Time Delivery (%)"
                  type="number"
                  placeholder="Enter on-time delivery rate (0-100)"
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

              <FormSection title="Audit Dates">
                <FormInput
                  name="lastAuditDate"
                  label="Last Audit Date"
                  type="date"
                />
                <FormInput
                  name="nextAuditDate"
                  label="Next Audit Date"
                  type="date"
                />
              </FormSection>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Quality Incidents</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendIncident({
                        date: new Date().toISOString().split('T')[0],
                        type: '',
                        severity: 'MINOR',
                        description: '',
                        status: 'OPEN',
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Incident
                    </Button>
                    {incidentFields.length > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeIncident(incidentFields.length - 1)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Incident
                      </Button>
                    )}
                  </div>
                </div>
                {incidentFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput
                        name={`incidents.${index}.date`}
                        label="Date"
                        type="date"
                      />
                      <FormInput
                        name={`incidents.${index}.type`}
                        label="Type"
                        placeholder="Enter incident type"
                      />
                      <FormSelect
                        name={`incidents.${index}.severity`}
                        label="Severity"
                        options={severityOptions}
                      />
                      <FormSelect
                        name={`incidents.${index}.status`}
                        label="Status"
                        options={statusOptions}
                      />
                      <FormTextarea
                        name={`incidents.${index}.description`}
                        label="Description"
                        placeholder="Enter incident description"
                        className="col-span-2"
                      />
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Corrective Actions</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendAction({
                        title: '',
                        description: '',
                        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        status: 'OPEN',
                        assignedTo: '',
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Action
                    </Button>
                    {actionFields.length > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAction(actionFields.length - 1)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Action
                      </Button>
                    )}
                  </div>
                </div>
                {actionFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput
                        name={`correctiveActions.${index}.title`}
                        label="Title"
                        placeholder="Enter action title"
                      />
                      <FormInput
                        name={`correctiveActions.${index}.dueDate`}
                        label="Due Date"
                        type="date"
                      />
                      <FormSelect
                        name={`correctiveActions.${index}.status`}
                        label="Status"
                        options={actionStatusOptions}
                      />
                      <FormInput
                        name={`correctiveActions.${index}.assignedTo`}
                        label="Assigned To"
                        placeholder="Enter assigned person"
                      />
                      <FormTextarea
                        name={`correctiveActions.${index}.description`}
                        label="Description"
                        placeholder="Enter action description"
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

export default CreateQualityRecord;
