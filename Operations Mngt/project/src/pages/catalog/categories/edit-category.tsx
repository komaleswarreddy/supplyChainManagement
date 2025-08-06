import React from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const EditCategory: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useCategory, useUpdateCategory, useCategories } = useCatalog();
  const { data: category, isLoading } = useCategory(id!);
  const updateCategory = useUpdateCategory();
  const { data } = useCategories({ page: 1, pageSize: 100 });
  const parentOptions = (data?.items || []).filter(cat => cat.id !== id).map(cat => ({ label: cat.name, value: cat.id }));

  if (isLoading || !category) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  return (
    <FormContainer
      title="Edit Category"
      schema={categorySchema}
      defaultValues={{
        ...category,
        isActive: !!category.isActive,
        parentId: category.parentId || '',
      }}
      submitText="Save Changes"
      onSubmit={async (values) => {
        await updateCategory.mutateAsync({
          id: id!,
          data: values,
        });
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

export default EditCategory; 