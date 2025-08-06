import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { z } from 'zod';
import { FormContainer } from '@/components/form/form-container';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { useCatalog } from '@/hooks/useCatalog';
import type { ProductAttribute } from '@/types/inventory';

const attributeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(2, 'Code is required'),
  type: z.enum(['TEXT', 'NUMBER', 'SELECT', 'MULTISELECT', 'BOOLEAN', 'DATE', 'FILE']),
  isRequired: z.boolean(),
  isSearchable: z.boolean(),
  isFilterable: z.boolean(),
  isComparable: z.boolean(),
  isVisible: z.boolean(),
  isSystem: z.boolean(),
  inputType: z.enum(['TEXT', 'TEXTAREA', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO', 'DATE', 'FILE']),
  frontendLabel: z.string().optional(),
  sortOrder: z.coerce.number().min(0),
});

const typeOptions = [
  { label: 'Text', value: 'TEXT' },
  { label: 'Number', value: 'NUMBER' },
  { label: 'Select', value: 'SELECT' },
  { label: 'Multi-Select', value: 'MULTISELECT' },
  { label: 'Boolean', value: 'BOOLEAN' },
  { label: 'Date', value: 'DATE' },
  { label: 'File', value: 'FILE' },
];
const inputTypeOptions = [
  { label: 'Text', value: 'TEXT' },
  { label: 'Textarea', value: 'TEXTAREA' },
  { label: 'Select', value: 'SELECT' },
  { label: 'Multi-Select', value: 'MULTISELECT' },
  { label: 'Checkbox', value: 'CHECKBOX' },
  { label: 'Radio', value: 'RADIO' },
  { label: 'Date', value: 'DATE' },
  { label: 'File', value: 'FILE' },
];

const EditAttribute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useAttribute, useUpdateAttribute } = useCatalog();
  const { data: attribute, isLoading } = useAttribute(id!);
  const updateAttribute = useUpdateAttribute();

  if (isLoading || !attribute) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  return (
    <FormContainer
      title="Edit Attribute"
      schema={attributeSchema}
      defaultValues={{
        ...attribute,
        isRequired: !!attribute.isRequired,
        isSearchable: !!attribute.isSearchable,
        isFilterable: !!attribute.isFilterable,
        isComparable: !!attribute.isComparable,
        isVisible: !!attribute.isVisible,
        isSystem: !!attribute.isSystem,
      }}
      submitText="Save Changes"
      onSubmit={async (values) => {
        await updateAttribute.mutateAsync({ id: id!, data: values });
        navigate('/catalog/attributes');
      }}
      onCancel={() => navigate('/catalog/attributes')}
    >
      <FormInput name="name" label="Name" required />
      <FormInput name="code" label="Code" required />
      <FormSelect name="type" label="Type" options={typeOptions} />
      <FormSelect name="inputType" label="Input Type" options={inputTypeOptions} />
      <FormInput name="frontendLabel" label="Frontend Label" />
      <FormInput name="sortOrder" label="Sort Order" type="number" />
      <FormSelect name="isRequired" label="Required" options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]} />
      <FormSelect name="isSearchable" label="Searchable" options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]} />
      <FormSelect name="isFilterable" label="Filterable" options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]} />
      <FormSelect name="isComparable" label="Comparable" options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]} />
      <FormSelect name="isVisible" label="Visible" options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]} />
      <FormSelect name="isSystem" label="System Attribute" options={[{ label: 'Yes', value: true }, { label: 'No', value: false }]} />
    </FormContainer>
  );
};

export default EditAttribute; 