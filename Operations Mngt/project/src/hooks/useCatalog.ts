import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '@/services/catalog';
import type { PaginationParams } from '@/types/common';
import type { 
  CatalogFilters, 
  CategoryFilters, 
  AttributeFilters,
  ProductCategory,
  ProductAttribute,
  StockItem,
  SKUGenerationRule,
  VariantConfiguration,
  ProductImage,
  ProductRelationship,
  ProductBundle,
  ProductReview,
} from '@/types/inventory';

export function useCatalog() {
  const queryClient = useQueryClient();

  // Product Categories
  const useCategories = (params: PaginationParams & CategoryFilters) => {
    return useQuery({
      queryKey: ['catalog-categories', params],
      queryFn: () => catalogService.getCategories(params),
    });
  };

  const useCategory = (id: string) => {
    return useQuery({
      queryKey: ['catalog-category', id],
      queryFn: () => catalogService.getCategoryById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  const useCreateCategory = () => {
    return useMutation({
      mutationFn: catalogService.createCategory,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-categories'] });
      },
    });
  };

  const useUpdateCategory = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ProductCategory> }) =>
        catalogService.updateCategory(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-categories'] });
      },
    });
  };

  const useDeleteCategory = () => {
    return useMutation({
      mutationFn: catalogService.deleteCategory,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-categories'] });
      },
    });
  };

  // Product Attributes
  const useAttributes = (params: PaginationParams & AttributeFilters) => {
    return useQuery({
      queryKey: ['catalog-attributes', params],
      queryFn: () => catalogService.getAttributes(params),
    });
  };

  const useAttribute = (id: string) => {
    return useQuery({
      queryKey: ['catalog-attribute', id],
      queryFn: () => catalogService.getAttributeById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  const useCreateAttribute = () => {
    return useMutation({
      mutationFn: catalogService.createAttribute,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-attributes'] });
      },
    });
  };

  const useUpdateAttribute = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ProductAttribute> }) =>
        catalogService.updateAttribute(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-attributes'] });
      },
    });
  };

  const useDeleteAttribute = () => {
    return useMutation({
      mutationFn: catalogService.deleteAttribute,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-attributes'] });
      },
    });
  };

  // Catalog Products
  const useCatalogProducts = (params: PaginationParams & CatalogFilters) => {
    return useQuery({
      queryKey: ['catalog-products', params],
      queryFn: () => catalogService.getCatalogProducts(params),
    });
  };

  const useCatalogProduct = (id: string) => {
    return useQuery({
      queryKey: ['catalog-product', id],
      queryFn: () => catalogService.getCatalogProductById(id),
      select: (response) => response.data,
      enabled: !!id,
    });
  };

  const useCreateCatalogProduct = () => {
    return useMutation({
      mutationFn: catalogService.createCatalogProduct,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      },
    });
  };

  const useUpdateCatalogProduct = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<StockItem> }) =>
        catalogService.updateCatalogProduct(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      },
    });
  };

  const useDeleteCatalogProduct = () => {
    return useMutation({
      mutationFn: catalogService.deleteCatalogProduct,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      },
    });
  };

  // SKU Generation
  const useGenerateSKU = () => {
    return useMutation({
      mutationFn: ({ productId, rule }: { productId: string; rule?: SKUGenerationRule }) =>
        catalogService.generateSKU(productId, rule),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      },
    });
  };

  // Product Variants
  const useProductVariants = (productId: string) => {
    return useQuery({
      queryKey: ['product-variants', productId],
      queryFn: () => catalogService.getProductVariants(productId),
      select: (response) => response.data,
      enabled: !!productId,
    });
  };

  const useCreateProductVariant = () => {
    return useMutation({
      mutationFn: ({ productId, data }: { productId: string; data: VariantConfiguration }) =>
        catalogService.createProductVariant(productId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['product-variants'] });
        queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      },
    });
  };

  // Product Images
  const useUploadProductImage = () => {
    return useMutation({
      mutationFn: ({ productId, file }: { productId: string; file: File }) =>
        catalogService.uploadProductImage(productId, file),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      },
    });
  };

  const useDeleteProductImage = () => {
    return useMutation({
      mutationFn: catalogService.deleteProductImage,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      },
    });
  };

  // Product Relationships
  const useProductRelationships = (productId: string) => {
    return useQuery({
      queryKey: ['product-relationships', productId],
      queryFn: () => catalogService.getProductRelationships(productId),
      select: (response) => response.data,
      enabled: !!productId,
    });
  };

  const useCreateProductRelationship = () => {
    return useMutation({
      mutationFn: catalogService.createProductRelationship,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['product-relationships'] });
      },
    });
  };

  // Product Bundles
  const useProductBundles = (productId: string) => {
    return useQuery({
      queryKey: ['product-bundles', productId],
      queryFn: () => catalogService.getProductBundles(productId),
      select: (response) => response.data,
      enabled: !!productId,
    });
  };

  const useCreateProductBundle = () => {
    return useMutation({
      mutationFn: catalogService.createProductBundle,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['product-bundles'] });
      },
    });
  };

  // Product Reviews
  const useProductReviews = (productId: string) => {
    return useQuery({
      queryKey: ['product-reviews', productId],
      queryFn: () => catalogService.getProductReviews(productId),
      select: (response) => response.data,
      enabled: !!productId,
    });
  };

  const useCreateProductReview = () => {
    return useMutation({
      mutationFn: catalogService.createProductReview,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
      },
    });
  };

  // Product Price History
  const useProductPriceHistory = (productId: string) => {
    return useQuery({
      queryKey: ['product-price-history', productId],
      queryFn: () => catalogService.getProductPriceHistory(productId),
      select: (response) => response.data,
      enabled: !!productId,
    });
  };

  // Bulk Operations
  const useBulkUpdateProducts = () => {
    return useMutation({
      mutationFn: ({ productIds, updates }: { productIds: string[]; updates: Partial<StockItem> }) =>
        catalogService.bulkUpdateProducts(productIds, updates),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      },
    });
  };

  const useBulkDeleteProducts = () => {
    return useMutation({
      mutationFn: catalogService.bulkDeleteProducts,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      },
    });
  };

  // Import/Export
  const useExportProducts = () => {
    return useMutation({
      mutationFn: catalogService.exportProducts,
    });
  };

  const useImportProducts = () => {
    return useMutation({
      mutationFn: catalogService.importProducts,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
      },
    });
  };

  return {
    // Categories
    useCategories,
    useCategory,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
    
    // Attributes
    useAttributes,
    useAttribute,
    useCreateAttribute,
    useUpdateAttribute,
    useDeleteAttribute,
    
    // Products
    useCatalogProducts,
    useCatalogProduct,
    useCreateCatalogProduct,
    useUpdateCatalogProduct,
    useDeleteCatalogProduct,
    
    // SKU Generation
    useGenerateSKU,
    
    // Variants
    useProductVariants,
    useCreateProductVariant,
    
    // Images
    useUploadProductImage,
    useDeleteProductImage,
    
    // Relationships
    useProductRelationships,
    useCreateProductRelationship,
    
    // Bundles
    useProductBundles,
    useCreateProductBundle,
    
    // Reviews
    useProductReviews,
    useCreateProductReview,
    
    // Price History
    useProductPriceHistory,
    
    // Bulk Operations
    useBulkUpdateProducts,
    useBulkDeleteProducts,
    
    // Import/Export
    useExportProducts,
    useImportProducts,
  };
} 