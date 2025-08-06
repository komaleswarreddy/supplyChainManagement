import { api } from '@/lib/api';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/common';
import type {
  ProductCategory,
  ProductAttribute,
  ProductAttributeValue,
  ProductImage,
  ProductRelationship,
  ProductBundle,
  ProductReview,
  ProductPriceHistory,
  CatalogFilters,
  CategoryFilters,
  AttributeFilters,
  StockItem,
  SKUGenerationRule,
  VariantConfiguration,
} from '@/types/inventory';

// Mock data for development
const MOCK_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat-1',
    tenantId: 'tenant-1',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    level: 1,
    sortOrder: 1,
    isActive: true,
    urlKey: 'electronics',
    displayMode: 'PRODUCTS',
    pageLayout: 'DEFAULT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
    productCount: 25,
  },
  {
    id: 'cat-2',
    tenantId: 'tenant-1',
    name: 'Office Supplies',
    description: 'Office equipment and supplies',
    level: 1,
    sortOrder: 2,
    isActive: true,
    urlKey: 'office-supplies',
    displayMode: 'PRODUCTS',
    pageLayout: 'DEFAULT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
    productCount: 15,
  },
  {
    id: 'cat-3',
    tenantId: 'tenant-1',
    name: 'Furniture',
    description: 'Office and home furniture',
    level: 1,
    sortOrder: 3,
    isActive: true,
    urlKey: 'furniture',
    displayMode: 'PRODUCTS',
    pageLayout: 'DEFAULT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
    productCount: 8,
  },
];

const MOCK_ATTRIBUTES: ProductAttribute[] = [
  {
    id: 'attr-1',
    tenantId: 'tenant-1',
    name: 'Color',
    code: 'color',
    type: 'SELECT',
    isRequired: false,
    isSearchable: true,
    isFilterable: true,
    isComparable: true,
    isVisible: true,
    isSystem: true,
    options: [
      { value: 'red', label: 'Red', sortOrder: 1 },
      { value: 'blue', label: 'Blue', sortOrder: 2 },
      { value: 'green', label: 'Green', sortOrder: 3 },
      { value: 'black', label: 'Black', sortOrder: 4 },
      { value: 'white', label: 'White', sortOrder: 5 },
    ],
    inputType: 'SELECT',
    frontendLabel: 'Color',
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
  },
  {
    id: 'attr-2',
    tenantId: 'tenant-1',
    name: 'Size',
    code: 'size',
    type: 'SELECT',
    isRequired: false,
    isSearchable: true,
    isFilterable: true,
    isComparable: true,
    isVisible: true,
    isSystem: true,
    options: [
      { value: 'xs', label: 'Extra Small', sortOrder: 1 },
      { value: 's', label: 'Small', sortOrder: 2 },
      { value: 'm', label: 'Medium', sortOrder: 3 },
      { value: 'l', label: 'Large', sortOrder: 4 },
      { value: 'xl', label: 'Extra Large', sortOrder: 5 },
    ],
    inputType: 'SELECT',
    frontendLabel: 'Size',
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
  },
  {
    id: 'attr-3',
    tenantId: 'tenant-1',
    name: 'Brand',
    code: 'brand',
    type: 'TEXT',
    isRequired: false,
    isSearchable: true,
    isFilterable: true,
    isComparable: true,
    isVisible: true,
    isSystem: true,
    inputType: 'TEXT',
    frontendLabel: 'Brand',
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
  },
];

const MOCK_CATALOG_PRODUCTS: StockItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: `catalog-${i + 1}`,
  itemCode: `CAT-${String(i + 1).padStart(4, '0')}`,
  name: `Catalog Product ${i + 1}`,
  description: `Description for catalog product ${i + 1}`,
  category: ['Electronics', 'Office Supplies', 'Furniture'][i % 3],
  status: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'][i % 3],
  productType: ['SIMPLE', 'CONFIGURABLE', 'BUNDLE'][i % 3],
  catalogStatus: ['ACTIVE', 'DRAFT', 'INACTIVE'][i % 3],
  sku: `SKU-${String(i + 1).padStart(6, '0')}`,
  barcode: `123456789${String(i + 1).padStart(3, '0')}`,
  brand: ['Brand A', 'Brand B', 'Brand C'][i % 3],
  model: `Model-${i + 1}`,
  isFeatured: i < 5,
  sortOrder: i + 1,
  catalogCategoryId: `cat-${(i % 3) + 1}`,
  attributes: {
    color: ['red', 'blue', 'green'][i % 3],
    size: ['s', 'm', 'l'][i % 3],
  },
  images: [
    {
      id: `img-${i + 1}`,
      url: `https://via.placeholder.com/300x300?text=Product+${i + 1}`,
      altText: `Product ${i + 1}`,
      isPrimary: true,
      sortOrder: 1,
    },
  ],
  unitsOfMeasure: [{ code: 'EA', name: 'Each', baseUnit: true, conversionFactor: 1 }],
  defaultUOM: 'EA',
  batches: [],
  locations: [],
  specifications: {},
  supplier: {
    id: 'sup-1',
    name: 'Test Supplier',
    leadTime: 7,
    performance: {
      vendorId: 'sup-1',
      metrics: { deliveryOnTime: 95, qualityRating: 4.5, priceCompetitiveness: 4.2, responseTime: 24 },
      lastEvaluation: new Date().toISOString(),
      historicalData: [],
    },
  },
  cost: {
    method: 'FIFO',
    currentCost: 99.99 + i * 10,
    historicalCosts: [],
  },
  quality: {
    inspectionRequired: true,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const catalogService = {
  // Product Categories
  getCategories: async (
    params: PaginationParams & CategoryFilters
  ): Promise<PaginatedResponse<ProductCategory>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredData = [...MOCK_CATEGORIES];

    if (params.parentId) {
      filteredData = filteredData.filter(cat => cat.parentId === params.parentId);
    }
    if (params.isActive !== undefined) {
      filteredData = filteredData.filter(cat => cat.isActive === params.isActive);
    }
    if (params.search) {
      filteredData = filteredData.filter(cat => 
        cat.name.toLowerCase().includes(params.search!.toLowerCase()) ||
        cat.description?.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    // Apply sorting
    if (params.sortBy) {
      filteredData.sort((a: any, b: any) => {
        const aValue = a[params.sortBy!];
        const bValue = b[params.sortBy!];
        return params.sortOrder === 'desc' ? 
          (bValue > aValue ? 1 : -1) : 
          (aValue > bValue ? 1 : -1);
      });
    }

    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const paginatedData = filteredData.slice(start, end);

    return {
      items: paginatedData,
      total: filteredData.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filteredData.length / params.pageSize),
    };
  },

  getCategoryById: async (id: string): Promise<ApiResponse<ProductCategory>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const category = MOCK_CATEGORIES.find(cat => cat.id === id);
    if (!category) {
      throw new Error('Category not found');
    }

    return {
      data: category,
      message: 'Category retrieved successfully',
    };
  },

  createCategory: async (data: Omit<ProductCategory, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<ApiResponse<ProductCategory>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newCategory: ProductCategory = {
      id: `cat-${Date.now()}`,
      tenantId: 'tenant-1',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
    };

    MOCK_CATEGORIES.push(newCategory);

    return {
      data: newCategory,
      message: 'Category created successfully',
    };
  },

  updateCategory: async (id: string, data: Partial<ProductCategory>): Promise<ApiResponse<ProductCategory>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const categoryIndex = MOCK_CATEGORIES.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }

    MOCK_CATEGORIES[categoryIndex] = {
      ...MOCK_CATEGORIES[categoryIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_CATEGORIES[categoryIndex],
      message: 'Category updated successfully',
    };
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const categoryIndex = MOCK_CATEGORIES.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }

    MOCK_CATEGORIES.splice(categoryIndex, 1);

    return {
      message: 'Category deleted successfully',
    };
  },

  // Product Attributes
  getAttributes: async (
    params: PaginationParams & AttributeFilters
  ): Promise<PaginatedResponse<ProductAttribute>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredData = [...MOCK_ATTRIBUTES];

    if (params.type) {
      filteredData = filteredData.filter(attr => attr.type === params.type);
    }
    if (params.isSystem !== undefined) {
      filteredData = filteredData.filter(attr => attr.isSystem === params.isSystem);
    }
    if (params.isSearchable !== undefined) {
      filteredData = filteredData.filter(attr => attr.isSearchable === params.isSearchable);
    }
    if (params.isFilterable !== undefined) {
      filteredData = filteredData.filter(attr => attr.isFilterable === params.isFilterable);
    }
    if (params.search) {
      filteredData = filteredData.filter(attr => 
        attr.name.toLowerCase().includes(params.search!.toLowerCase()) ||
        attr.code.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    // Apply sorting
    if (params.sortBy) {
      filteredData.sort((a: any, b: any) => {
        const aValue = a[params.sortBy!];
        const bValue = b[params.sortBy!];
        return params.sortOrder === 'desc' ? 
          (bValue > aValue ? 1 : -1) : 
          (aValue > bValue ? 1 : -1);
      });
    }

    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const paginatedData = filteredData.slice(start, end);

    return {
      items: paginatedData,
      total: filteredData.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filteredData.length / params.pageSize),
    };
  },

  getAttributeById: async (id: string): Promise<ApiResponse<ProductAttribute>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const attribute = MOCK_ATTRIBUTES.find(attr => attr.id === id);
    if (!attribute) {
      throw new Error('Attribute not found');
    }

    return {
      data: attribute,
      message: 'Attribute retrieved successfully',
    };
  },

  createAttribute: async (data: Omit<ProductAttribute, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<ApiResponse<ProductAttribute>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newAttribute: ProductAttribute = {
      id: `attr-${Date.now()}`,
      tenantId: 'tenant-1',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
    };

    MOCK_ATTRIBUTES.push(newAttribute);

    return {
      data: newAttribute,
      message: 'Attribute created successfully',
    };
  },

  updateAttribute: async (id: string, data: Partial<ProductAttribute>): Promise<ApiResponse<ProductAttribute>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const attributeIndex = MOCK_ATTRIBUTES.findIndex(attr => attr.id === id);
    if (attributeIndex === -1) {
      throw new Error('Attribute not found');
    }

    MOCK_ATTRIBUTES[attributeIndex] = {
      ...MOCK_ATTRIBUTES[attributeIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_ATTRIBUTES[attributeIndex],
      message: 'Attribute updated successfully',
    };
  },

  deleteAttribute: async (id: string): Promise<ApiResponse<void>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const attributeIndex = MOCK_ATTRIBUTES.findIndex(attr => attr.id === id);
    if (attributeIndex === -1) {
      throw new Error('Attribute not found');
    }

    MOCK_ATTRIBUTES.splice(attributeIndex, 1);

    return {
      message: 'Attribute deleted successfully',
    };
  },

  // Catalog Products
  getCatalogProducts: async (
    params: PaginationParams & CatalogFilters
  ): Promise<PaginatedResponse<StockItem>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredData = [...MOCK_CATALOG_PRODUCTS];

    if (params.categoryId) {
      filteredData = filteredData.filter(product => product.catalogCategoryId === params.categoryId);
    }
    if (params.brand) {
      filteredData = filteredData.filter(product => 
        product.brand?.toLowerCase().includes(params.brand!.toLowerCase())
      );
    }
    if (params.productType) {
      filteredData = filteredData.filter(product => product.productType === params.productType);
    }
    if (params.catalogStatus) {
      filteredData = filteredData.filter(product => product.catalogStatus === params.catalogStatus);
    }
    if (params.isFeatured !== undefined) {
      filteredData = filteredData.filter(product => product.isFeatured === params.isFeatured);
    }
    if (params.priceMin !== undefined) {
      filteredData = filteredData.filter(product => product.cost.currentCost >= params.priceMin!);
    }
    if (params.priceMax !== undefined) {
      filteredData = filteredData.filter(product => product.cost.currentCost <= params.priceMax!);
    }
    if (params.search) {
      filteredData = filteredData.filter(product => 
        product.name.toLowerCase().includes(params.search!.toLowerCase()) ||
        product.description.toLowerCase().includes(params.search!.toLowerCase()) ||
        product.sku?.toLowerCase().includes(params.search!.toLowerCase()) ||
        product.brand?.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    // Apply sorting
    if (params.sortBy) {
      filteredData.sort((a: any, b: any) => {
        let aValue, bValue;
        switch (params.sortBy) {
          case 'price':
            aValue = a.cost.currentCost;
            bValue = b.cost.currentCost;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'sortOrder':
            aValue = a.sortOrder;
            bValue = b.sortOrder;
            break;
          default:
            aValue = a.name;
            bValue = b.name;
        }
        return params.sortOrder === 'desc' ? 
          (bValue > aValue ? 1 : -1) : 
          (aValue > bValue ? 1 : -1);
      });
    }

    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const paginatedData = filteredData.slice(start, end);

    return {
      items: paginatedData,
      total: filteredData.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(filteredData.length / params.pageSize),
    };
  },

  getCatalogProductById: async (id: string): Promise<ApiResponse<StockItem>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const product = MOCK_CATALOG_PRODUCTS.find(prod => prod.id === id);
    if (!product) {
      throw new Error('Product not found');
    }

    return {
      data: product,
      message: 'Product retrieved successfully',
    };
  },

  createCatalogProduct: async (data: Omit<StockItem, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<ApiResponse<StockItem>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newProduct: StockItem = {
      id: `catalog-${Date.now()}`,
      tenantId: 'tenant-1',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
    };

    MOCK_CATALOG_PRODUCTS.push(newProduct);

    return {
      data: newProduct,
      message: 'Product created successfully',
    };
  },

  updateCatalogProduct: async (id: string, data: Partial<StockItem>): Promise<ApiResponse<StockItem>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const productIndex = MOCK_CATALOG_PRODUCTS.findIndex(prod => prod.id === id);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }

    MOCK_CATALOG_PRODUCTS[productIndex] = {
      ...MOCK_CATALOG_PRODUCTS[productIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: MOCK_CATALOG_PRODUCTS[productIndex],
      message: 'Product updated successfully',
    };
  },

  deleteCatalogProduct: async (id: string): Promise<ApiResponse<void>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const productIndex = MOCK_CATALOG_PRODUCTS.findIndex(prod => prod.id === id);
    if (productIndex === -1) {
      throw new Error('Product not found');
    }

    MOCK_CATALOG_PRODUCTS.splice(productIndex, 1);

    return {
      message: 'Product deleted successfully',
    };
  },

  // SKU Generation
  generateSKU: async (productId: string, rule?: SKUGenerationRule): Promise<ApiResponse<{ sku: string }>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const product = MOCK_CATALOG_PRODUCTS.find(prod => prod.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Simple SKU generation logic
    const prefix = rule?.prefix || 'SKU';
    const category = rule?.includeCategory ? product.category.substring(0, 3).toUpperCase() : '';
    const brand = rule?.includeBrand && product.brand ? product.brand.substring(0, 3).toUpperCase() : '';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const sku = [prefix, category, brand, random].filter(Boolean).join('-');

    return {
      data: { sku },
      message: 'SKU generated successfully',
    };
  },

  // Product Variants
  getProductVariants: async (productId: string): Promise<ApiResponse<StockItem[]>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const variants = MOCK_CATALOG_PRODUCTS.filter(prod => prod.parentItemId === productId);

    return {
      data: variants,
      message: 'Variants retrieved successfully',
    };
  },

  createProductVariant: async (productId: string, data: VariantConfiguration): Promise<ApiResponse<StockItem>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const parentProduct = MOCK_CATALOG_PRODUCTS.find(prod => prod.id === productId);
    if (!parentProduct) {
      throw new Error('Parent product not found');
    }

    const newVariant: StockItem = {
      id: `variant-${Date.now()}`,
      tenantId: 'tenant-1',
      ...parentProduct,
      parentItemId: productId,
      productType: 'SIMPLE',
      attributes: data.attributes,
      itemCode: `${parentProduct.itemCode}-${Date.now()}`,
      name: `${parentProduct.name} - ${Object.values(data.attributes).join(' ')}`,
      sku: data.generateSKUs ? `SKU-${Date.now()}` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
    };

    MOCK_CATALOG_PRODUCTS.push(newVariant);

    return {
      data: newVariant,
      message: 'Variant created successfully',
    };
  },

  // Product Images
  uploadProductImage: async (productId: string, file: File): Promise<ApiResponse<ProductImage>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newImage: ProductImage = {
      id: `img-${Date.now()}`,
      tenantId: 'tenant-1',
      itemId: productId,
      url: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      sortOrder: 1,
      isPrimary: false,
      isGallery: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
    };

    return {
      data: newImage,
      message: 'Image uploaded successfully',
    };
  },

  deleteProductImage: async (imageId: string): Promise<ApiResponse<void>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      message: 'Image deleted successfully',
    };
  },

  // Product Relationships
  getProductRelationships: async (productId: string): Promise<ApiResponse<ProductRelationship[]>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock relationships
    const relationships: ProductRelationship[] = [];

    return {
      data: relationships,
      message: 'Relationships retrieved successfully',
    };
  },

  createProductRelationship: async (data: Omit<ProductRelationship, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<ApiResponse<ProductRelationship>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newRelationship: ProductRelationship = {
      id: `rel-${Date.now()}`,
      tenantId: 'tenant-1',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
    };

    return {
      data: newRelationship,
      message: 'Relationship created successfully',
    };
  },

  // Product Bundles
  getProductBundles: async (productId: string): Promise<ApiResponse<ProductBundle[]>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock bundles
    const bundles: ProductBundle[] = [];

    return {
      data: bundles,
      message: 'Bundles retrieved successfully',
    };
  },

  createProductBundle: async (data: Omit<ProductBundle, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<ApiResponse<ProductBundle>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newBundle: ProductBundle = {
      id: `bundle-${Date.now()}`,
      tenantId: 'tenant-1',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: { id: 'user-1', name: 'Admin User', email: 'admin@example.com' },
    };

    return {
      data: newBundle,
      message: 'Bundle created successfully',
    };
  },

  // Product Reviews
  getProductReviews: async (productId: string): Promise<ApiResponse<ProductReview[]>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock reviews
    const reviews: ProductReview[] = [];

    return {
      data: reviews,
      message: 'Reviews retrieved successfully',
    };
  },

  createProductReview: async (data: Omit<ProductReview, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'helpfulVotes' | 'isApproved'>): Promise<ApiResponse<ProductReview>> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newReview: ProductReview = {
      id: `review-${Date.now()}`,
      tenantId: 'tenant-1',
      ...data,
      helpfulVotes: 0,
      isApproved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      data: newReview,
      message: 'Review created successfully',
    };
  },

  // Product Price History
  getProductPriceHistory: async (productId: string): Promise<ApiResponse<ProductPriceHistory[]>> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock price history
    const priceHistory: ProductPriceHistory[] = [];

    return {
      data: priceHistory,
      message: 'Price history retrieved successfully',
    };
  },

  // Bulk Operations
  bulkUpdateProducts: async (productIds: string[], updates: Partial<StockItem>): Promise<ApiResponse<void>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    productIds.forEach(id => {
      const productIndex = MOCK_CATALOG_PRODUCTS.findIndex(prod => prod.id === id);
      if (productIndex !== -1) {
        MOCK_CATALOG_PRODUCTS[productIndex] = {
          ...MOCK_CATALOG_PRODUCTS[productIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    });

    return {
      message: 'Products updated successfully',
    };
  },

  bulkDeleteProducts: async (productIds: string[]): Promise<ApiResponse<void>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    productIds.forEach(id => {
      const productIndex = MOCK_CATALOG_PRODUCTS.findIndex(prod => prod.id === id);
      if (productIndex !== -1) {
        MOCK_CATALOG_PRODUCTS.splice(productIndex, 1);
      }
    });

    return {
      message: 'Products deleted successfully',
    };
  },

  // Import/Export
  exportProducts: async (filters: CatalogFilters): Promise<ApiResponse<{ url: string }>> => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      data: { url: '/api/export/catalog-products.csv' },
      message: 'Export completed successfully',
    };
  },

  importProducts: async (file: File): Promise<ApiResponse<{ imported: number; errors: number }>> => {
    await new Promise(resolve => setTimeout(resolve, 3000));

    return {
      data: { imported: 50, errors: 2 },
      message: 'Import completed successfully',
    };
  },
}; 