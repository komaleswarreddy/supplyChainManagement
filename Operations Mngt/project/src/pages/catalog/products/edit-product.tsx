import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer } from '@/components/form/form-container';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { useCatalog } from '@/hooks/useCatalog';
import type { StockItem } from '@/types/inventory';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  sku: z.string().min(2, 'SKU is required'),
  catalogCategoryId: z.string().optional(),
  brand: z.string().optional(),
  cost: z.object({ currentCost: z.coerce.number().min(0) }),
  currentQuantity: z.coerce.number().min(0),
  catalogStatus: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'DISCONTINUED']),
  productType: z.enum(['SIMPLE', 'CONFIGURABLE', 'BUNDLE', 'VIRTUAL']),
});

const statusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Discontinued', value: 'DISCONTINUED' },
];
const typeOptions = [
  { label: 'Simple', value: 'SIMPLE' },
  { label: 'Configurable', value: 'CONFIGURABLE' },
  { label: 'Bundle', value: 'BUNDLE' },
  { label: 'Virtual', value: 'VIRTUAL' },
];

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useCatalogProduct, useUpdateCatalogProduct, useCategories } = useCatalog();
  const { data: product, isLoading } = useCatalogProduct(id!);
  const updateProduct = useUpdateCatalogProduct();
  const { data: categories } = useCategories({ page: 1, pageSize: 100 });
  const categoryOptions = (categories?.items || []).map(cat => ({ label: cat.name, value: cat.id }));

  if (isLoading || !product) {
    return <div className="flex justify-center py-12">Loading...</div>;
  }

  return (
    <FormContainer
      title="Edit Product"
      schema={productSchema}
      defaultValues={{
        ...product,
        cost: { currentCost: product.cost?.currentCost ?? 0 },
        currentQuantity: product.currentQuantity ?? 0,
      }}
      submitText="Save Changes"
      onSubmit={async (values) => {
        await updateProduct.mutateAsync({ id: id!, data: values });
        navigate('/catalog/products');
      }}
      onCancel={() => navigate('/catalog/products')}
    >
      <FormInput name="name" label="Name" required />
      <FormInput name="description" label="Description" />
      <FormInput name="sku" label="SKU" required />
      <FormSelect name="catalogCategoryId" label="Category" options={categoryOptions} />
      <FormInput name="brand" label="Brand" />
      <FormInput name="cost.currentCost" label="Price" type="number" required />
      <FormInput name="currentQuantity" label="Stock" type="number" required />
      <FormSelect name="catalogStatus" label="Status" options={statusOptions} />
      <FormSelect name="productType" label="Product Type" options={typeOptions} />
    </FormContainer>
  );
};

export default EditProduct; 