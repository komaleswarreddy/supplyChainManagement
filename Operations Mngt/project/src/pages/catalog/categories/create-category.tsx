import React from "react";
import { useNavigate } from "react-router-dom";
import { z } from 'zod';
import { FormContainer } from '@/components/form/form-container';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { useCatalog } from '@/hooks/useCatalog';
import type { ProductCategory } from '@/types/inventory';

const categorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.coerce.number().min(0),
  isActive: z.boolean(),
  displayMode: z.enum(['PRODUCTS', 'PAGE', 'BOTH']),
  pageLayout: z.string().default('DEFAULT'),
  urlKey: z.string().min(2, 'URL Key is required'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

const displayModeOptions = [
  { label: 'Products', value: 'PRODUCTS' },
  { label: 'Page', value: 'PAGE' },
  { label: 'Both', value: 'BOTH' },
];

const CreateCategory: React.FC = () => {
  const navigate = useNavigate();
  const { useCreateCategory, useCategories } = useCatalog();
  const createCategory = useCreateCategory();
  const { data } = useCategories({ page: 1, pageSize: 100 });
  const parentOptions = (data?.items || []).map(cat => ({ label: cat.name, value: cat.id }));

  return (
    <FormContainer
      title="Create Category"
      schema={categorySchema}
      submitText="Create"
      onSubmit={async (values) => {
        // Calculate level based on parent category
        let level = 1;
        if (values.parentId) {
          const parentCategory = data?.items.find(cat => cat.id === values.parentId);
          level = (parentCategory?.level || 0) + 1;
        }

        await createCategory.mutateAsync({
          ...values,
          level,
          sortOrder: values.sortOrder || 0,
        } as any);
        navigate('/catalog/categories');
      }}
      onCancel={() => navigate('/catalog/categories')}
    >
      <FormInput name="name" label="Name" required />
      <FormInput name="description" label="Description" />
      <FormSelect name="parentId" label="Parent Category" options={[{ label: 'None', value: '' }, ...parentOptions]} placeholder="Select parent category" />
      <FormInput name="sortOrder" label="Sort Order" type="number" />
      <FormSelect name="isActive" label="Status" options={[{ label: 'Active', value: true }, { label: 'Inactive', value: false }]} />
      <FormSelect name="displayMode" label="Display Mode" options={displayModeOptions} />
      <FormInput name="pageLayout" label="Page Layout" />
      <FormInput name="urlKey" label="URL Key" required />
      <FormInput name="metaTitle" label="Meta Title" />
      <FormInput name="metaDescription" label="Meta Description" />
      <FormInput name="metaKeywords" label="Meta Keywords" />
    </FormContainer>
  );
};

export default CreateCategory; 