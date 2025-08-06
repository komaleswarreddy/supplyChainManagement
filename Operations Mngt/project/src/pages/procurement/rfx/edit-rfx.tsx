import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormCheckbox, FormSection } from '@/components/form';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useRfx } from '@/hooks/useRfx';
import type { RfxFormData } from '@/types/rfx';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const rfxSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['RFI', 'RFP', 'RFQ']),
  publishDate: z.date(),
  closeDate: z.date().min(new Date(), 'Close date must be in the future'),
  currency: z.string().min(1, 'Currency is required'),
  sections: z.array(z.object({
    title: z.string().min(1, 'Section title is required'),
    description: z.string().optional(),
    order: z.number(),
    questions: z.array(z.object({
      text: z.string().min(1, 'Question text is required'),
      description: z.string().optional(),
      required: z.boolean(),
      format: z.enum([
        'TEXT',
        'NUMBER',
        'DATE',
        'BOOLEAN',
        'SINGLE_CHOICE',
        'MULTIPLE_CHOICE',
        'FILE',
        'TABLE',
      ]),
      options: z.array(z.string()).optional(),
      weight: z.number().optional(),
      maxScore: z.number().optional(),
      minScore: z.number().optional(),
    })),
  })).min(1, 'At least one section is required'),
  selectedSuppliers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    type: z.enum([
      'MANUFACTURER',
      'DISTRIBUTOR',
      'WHOLESALER',
      'RETAILER',
      'SERVICE_PROVIDER',
    ]),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED']),
    taxId: z.string(),
    registrationNumber: z.string(),
    website: z.string().optional(),
    industry: z.string().optional(),
  })).min(1, 'At least one supplier is required'),
  scoringCriteria: z.object({
    technicalWeight: z.number().min(0).max(100),
    commercialWeight: z.number().min(0).max(100),
    criteria: z.array(z.object({
      name: z.string().min(1, 'Criterion name is required'),
      weight: z.number().min(0).max(100),
      description: z.string().optional(),
    })),
  }).optional(),
  settings: z.object({
    allowLateSubmissions: z.boolean(),
    allowSupplierQuestions: z.boolean(),
    questionDeadline: z.date().optional(),
    visibleToAllSuppliers: z.boolean(),
    requireNda: z.boolean(),
  }),
  metadata: z.object({
    department: z.string().optional(),
    category: z.string().optional(),
    projectCode: z.string().optional(),
    budgetCode: z.string().optional(),
  }).optional(),
});

const rfxTypeOptions = [
  { label: 'Request for Information (RFI)', value: 'RFI' },
  { label: 'Request for Proposal (RFP)', value: 'RFP' },
  { label: 'Request for Quotation (RFQ)', value: 'RFQ' },
];

const currencyOptions = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
];

const questionFormatOptions = [
  { label: 'Text', value: 'TEXT' },
  { label: 'Number', value: 'NUMBER' },
  { label: 'Date', value: 'DATE' },
  { label: 'Yes/No', value: 'BOOLEAN' },
  { label: 'Single Choice', value: 'SINGLE_CHOICE' },
  { label: 'Multiple Choice', value: 'MULTIPLE_CHOICE' },
  { label: 'File Upload', value: 'FILE' },
  { label: 'Table', value: 'TABLE' },
];

export function EditRfx() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useRfxById, useUpdateRfx } = useRfx();
  const { data: rfx, isLoading: isLoadingRfx } = useRfxById(id!);
  const { mutate: updateRfx, isLoading: isUpdating } = useUpdateRfx();

  if (isLoadingRfx || !rfx) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Transform dates from strings to Date objects
  const defaultValues = {
    ...rfx,
    publishDate: new Date(rfx.publishDate),
    closeDate: new Date(rfx.closeDate),
    settings: {
      ...rfx.settings,
      questionDeadline: rfx.settings.questionDeadline ? new Date(rfx.settings.questionDeadline) : undefined,
    },
  };

  const onSubmit = async (data: z.infer<typeof rfxSchema>) => {
    const formData: Partial<RfxFormData> = {
      ...data,
    };

    updateRfx(
      { id: rfx.id, data: formData },
      {
        onSuccess: () => {
          navigate(`/procurement/rfx/${rfx.id}`);
        },
      }
    );
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Edit RFx"
        description={`Edit ${rfx.type} #${rfx.number}`}
        schema={rfxSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isUpdating ? 'Saving...' : 'Save Changes'}
        cancelText="Cancel"
        onCancel={() => navigate(`/procurement/rfx/${rfx.id}`)}
        showReset
      >
        {({ control, register, setValue, getValues }) => {
          const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
            control,
            name: 'sections',
          });

          return (
            <>
              <FormSection title="Basic Information">
                <FormInput
                  name="title"
                  label="Title"
                  placeholder="Enter RFx title"
                />
                <FormSelect
                  name="type"
                  label="RFx Type"
                  options={rfxTypeOptions}
                />
                <FormSelect
                  name="currency"
                  label="Currency"
                  options={currencyOptions}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Publish Date</label>
                  <DatePicker
                    selected={getValues('publishDate')}
                    onChange={(date) => setValue('publishDate', date)}
                    className="w-full rounded-md border p-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Close Date</label>
                  <DatePicker
                    selected={getValues('closeDate')}
                    onChange={(date) => setValue('closeDate', date)}
                    minDate={getValues('publishDate')}
                    className="w-full rounded-md border p-2"
                  />
                </div>
                <FormTextarea
                  name="description"
                  label="Description"
                  placeholder="Enter RFx description"
                  className="col-span-2"
                />
              </FormSection>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Sections & Questions</h2>
                  <Button
                    type="button"
                    onClick={() =>
                      appendSection({
                        title: '',
                        description: '',
                        order: sectionFields.length + 1,
                        questions: [],
                      })
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Section
                  </Button>
                </div>

                {sectionFields.map((field, index) => {
                  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
                    control,
                    name: `sections.${index}.questions`,
                  });

                  return (
                    <div
                      key={field.id}
                      className="rounded-lg border p-6"
                    >
                      <div className="mb-4 grid gap-4 sm:grid-cols-2">
                        <FormInput
                          name={`sections.${index}.title`}
                          label="Section Title"
                          placeholder="Enter section title"
                        />
                        <FormInput
                          name={`sections.${index}.order`}
                          label="Order"
                          type="number"
                          min={1}
                        />
                        <FormTextarea
                          name={`sections.${index}.description`}
                          label="Section Description"
                          placeholder="Enter section description"
                          className="col-span-2"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">Questions</h3>
                          <Button
                            type="button"
                            onClick={() =>
                              appendQuestion({
                                text: '',
                                required: true,
                                format: 'TEXT',
                              })
                            }
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add Question
                          </Button>
                        </div>

                        {questionFields.map((questionField, questionIndex) => (
                          <div
                            key={questionField.id}
                            className="rounded border p-4"
                          >
                            <div className="grid gap-4 sm:grid-cols-2">
                              <FormInput
                                name={`sections.${index}.questions.${questionIndex}.text`}
                                label="Question Text"
                                placeholder="Enter question text"
                              />
                              <FormSelect
                                name={`sections.${index}.questions.${questionIndex}.format`}
                                label="Response Format"
                                options={questionFormatOptions}
                              />
                              <FormCheckbox
                                name={`sections.${index}.questions.${questionIndex}.required`}
                                label="Required"
                                checkboxLabel="This question is required"
                              />
                              <FormInput
                                name={`sections.${index}.questions.${questionIndex}.weight`}
                                label="Weight"
                                type="number"
                                min={0}
                                max={100}
                              />
                              <FormTextarea
                                name={`sections.${index}.questions.${questionIndex}.description`}
                                label="Description"
                                placeholder="Enter question description"
                                className="col-span-2"
                              />
                            </div>

                            <div className="mt-4 flex justify-end">
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => removeQuestion(questionIndex)}
                                className="flex items-center gap-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                Remove Question
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeSection(index)}
                          disabled={sectionFields.length === 1}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove Section
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <FormSection title="Settings">
                <FormCheckbox
                  name="settings.allowLateSubmissions"
                  label="Late Submissions"
                  checkboxLabel="Allow late submissions"
                />
                <FormCheckbox
                  name="settings.allowSupplierQuestions"
                  label="Supplier Questions"
                  checkboxLabel="Allow suppliers to ask questions"
                />
                <FormCheckbox
                  name="settings.visibleToAllSuppliers"
                  label="Visibility"
                  checkboxLabel="Visible to all suppliers"
                />
                <FormCheckbox
                  name="settings.requireNda"
                  label="NDA"
                  checkboxLabel="Require NDA"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question Deadline</label>
                  <DatePicker
                    selected={getValues('settings.questionDeadline')}
                    onChange={(date) => setValue('settings.questionDeadline', date)}
                    minDate={new Date()}
                    maxDate={getValues('closeDate')}
                    className="w-full rounded-md border p-2"
                  />
                </div>
              </FormSection>

              <FormSection title="Additional Information">
                <FormInput
                  name="metadata.department"
                  label="Department"
                  placeholder="Enter department"
                />
                <FormInput
                  name="metadata.category"
                  label="Category"
                  placeholder="Enter category"
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