import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCatalog } from '@/hooks/useCatalog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormActions } from '@/components/form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const attributeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.enum(['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT', 'MULTISELECT']),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  description: z.string().optional(),
  options: z.array(z.string()).optional(),
});

type AttributeFormData = z.infer<typeof attributeSchema>;

const typeOptions = [
  { label: 'Text', value: 'TEXT' },
  { label: 'Number', value: 'NUMBER' },
  { label: 'Date', value: 'DATE' },
  { label: 'Boolean', value: 'BOOLEAN' },
  { label: 'Select', value: 'SELECT' },
  { label: 'Multi-Select', value: 'MULTISELECT' },
];

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

const CreateAttribute: React.FC = () => {
  const navigate = useNavigate();
  const { useCreateAttribute } = useCatalog();
  const { mutate: createAttribute, isLoading, isSuccess, isError, error } = useCreateAttribute();

  const form = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      name: '',
      code: '',
      type: 'TEXT',
      status: 'ACTIVE',
      description: '',
      options: [],
    },
  });

  const onSubmit = (data: AttributeFormData) => {
    createAttribute(data, {
      onSuccess: (created) => {
        navigate('/catalog/attributes');
      },
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Product Attribute</CardTitle>
        </CardHeader>
        <CardContent>
          <FormContainer form={form} onSubmit={form.handleSubmit(onSubmit)}>
            <FormInput name="name" label="Name" required />
            <FormInput name="code" label="Code" required />
            <FormSelect name="type" label="Type" options={typeOptions} required />
            <FormSelect name="status" label="Status" options={statusOptions} required />
            <FormTextarea name="description" label="Description" />
            {form.watch('type') === 'SELECT' || form.watch('type') === 'MULTISELECT' ? (
              <FormTextarea name="options" label="Options (comma separated)"
                parseValue={val => val.split(',').map((s: string) => s.trim()).filter(Boolean)}
                formatValue={val => (Array.isArray(val) ? val.join(', ') : '')}
              />
            ) : null}
            <FormActions>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="sm" /> : 'Create Attribute'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </FormActions>
            {isError && (
              <div className="text-red-600 mt-2 text-sm">{(error as any)?.message || 'Failed to create attribute.'}</div>
            )}
          </FormContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAttribute; 