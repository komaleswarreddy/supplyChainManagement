import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Grid, 
  List, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Package,
  Tag,
  Settings,
  BarChart3,
  Users,
  TrendingUp,
  ShoppingCart,
  Star,
  Image as ImageIcon,
  Link,
  Copy,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCatalog } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/useToast';
import type { CatalogFilters, StockItem, ProductType, CatalogStatus } from '@/types/inventory';

export default function CatalogDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { useCatalogProducts, useBulkDeleteProducts, useExportProducts } = useCatalog();

  // State management
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<CatalogFilters>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Queries
  const { data: productsData, isLoading } = useCatalogProducts(filters);
  const bulkDeleteMutation = useBulkDeleteProducts();
  const exportMutation = useExportProducts();

  // Computed values
  const products = productsData?.items || [];
  const totalProducts = productsData?.total || 0;
  const totalPages = productsData?.totalPages || 0;

  // Handlers
  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleFilterChange = (key: keyof CatalogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleProductSelect = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(products.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Please select products to delete');
      return;
    }

    try {
      await bulkDeleteMutation.mutateAsync(Array.from(selectedProducts));
      setSelectedProducts(new Set());
      toast.success(`${selectedProducts.size} products deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete products');
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportMutation.mutateAsync(filters);
      // Create download link
      const link = document.createElement('a');
      link.href = result.data.url;
      link.download = 'catalog-products.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Failed to export products');
    }
  };

  const getStatusColor = (status: CatalogStatus) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DRAFT': return 'default';
      case 'INACTIVE': return 'secondary';
      case 'DISCONTINUED': return 'destructive';
      default: return 'default';
    }
  };

  const getProductTypeColor = (type: ProductType) => {
    switch (type) {
      case 'SIMPLE': return 'default';
      case 'CONFIGURABLE': return 'secondary';
      case 'BUNDLE': return 'outline';
      case 'VIRTUAL': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Catalog Tabs */}
      <Tabs defaultValue="products" className="mb-6">
        <TabsList>
          <TabsTrigger value="products" onClick={() => navigate('/catalog')}>Products</TabsTrigger>
          <TabsTrigger value="categories" onClick={() => navigate('/catalog/categories')}>Categories</TabsTrigger>
          <TabsTrigger value="attributes" onClick={() => navigate('/catalog/attributes')}>Attributes</TabsTrigger>
        </TabsList>
      </Tabs>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product Catalog</h1>
          <p className="text-muted-foreground">
            Manage your product catalog, categories, and attributes
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/catalog/import')}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            onClick={() => navigate('/catalog/products/create')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.catalogStatus === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((products.filter(p => p.catalogStatus === 'ACTIVE').length / totalProducts) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Products</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.isFeatured).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Highlighted in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Organized product groups
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search products..."
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.categoryId || 'all'}
                onValueChange={(value) => handleFilterChange('categoryId', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="cat-1">Electronics</SelectItem>
                  <SelectItem value="cat-2">Office Supplies</SelectItem>
                  <SelectItem value="cat-3">Furniture</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.catalogStatus || 'all'}
                onValueChange={(value) => handleFilterChange('catalogStatus', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product Type</label>
              <Select
                value={filters.productType || 'all'}
                onValueChange={(value) => handleFilterChange('productType', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="SIMPLE">Simple</SelectItem>
                  <SelectItem value="CONFIGURABLE">Configurable</SelectItem>
                  <SelectItem value="BUNDLE">Bundle</SelectItem>
                  <SelectItem value="VIRTUAL">Virtual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProducts(new Set())}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid/List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle>Products</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={filters.sortBy || 'createdAt'}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="sortOrder">Sort Order</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder || 'desc'}
                onValueChange={(value) => handleFilterChange('sortOrder', value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">↑</SelectItem>
                  <SelectItem value="desc">↓</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isSelected={selectedProducts.has(product.id)}
                  onSelect={handleProductSelect}
                  onView={() => navigate(`/catalog/products/${product.id}`)}
                  onEdit={() => navigate(`/catalog/products/${product.id}/edit`)}
                  onDelete={() => {
                    // Handle delete
                  }}
                  getStatusColor={getStatusColor}
                  getProductTypeColor={getProductTypeColor}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <ProductListItem
                  key={product.id}
                  product={product}
                  isSelected={selectedProducts.has(product.id)}
                  onSelect={handleProductSelect}
                  onView={() => navigate(`/catalog/products/${product.id}`)}
                  onEdit={() => navigate(`/catalog/products/${product.id}/edit`)}
                  onDelete={() => {
                    // Handle delete
                  }}
                  getStatusColor={getStatusColor}
                  getProductTypeColor={getProductTypeColor}
                />
              ))}
            </div>
          )}

          {products.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first product
              </p>
              <Button onClick={() => navigate('/catalog/products/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((filters.page - 1) * filters.pageSize) + 1} to{' '}
            {Math.min(filters.page * filters.pageSize, totalProducts)} of {totalProducts} products
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {filters.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ 
  product, 
  isSelected, 
  onSelect, 
  onView, 
  onEdit, 
  onDelete,
  getStatusColor,
  getProductTypeColor,
}: {
  product: StockItem;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getStatusColor: (status: CatalogStatus) => any;
  getProductTypeColor: (type: ProductType) => any;
}) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(product.id, checked as boolean)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(product.catalogStatus)}>
              {product.catalogStatus}
            </Badge>
            <Badge variant={getProductTypeColor(product.productType)}>
              {product.productType}
            </Badge>
          </div>

          <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              ${product.cost.currentCost.toLocaleString()}
            </span>
            {product.isFeatured && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            SKU: {product.sku || 'N/A'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Product List Item Component
function ProductListItem({ 
  product, 
  isSelected, 
  onSelect, 
  onView, 
  onEdit, 
  onDelete,
  getStatusColor,
  getProductTypeColor,
}: {
  product: StockItem;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  getStatusColor: (status: CatalogStatus) => any;
  getProductTypeColor: (type: ProductType) => any;
}) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
      <Checkbox
        checked={isSelected}
        onCheckedChange={(checked) => onSelect(product.id, checked as boolean)}
      />
      
      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-sm truncate">{product.name}</h3>
          {product.isFeatured && (
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{product.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={getStatusColor(product.catalogStatus)} className="text-xs">
            {product.catalogStatus}
          </Badge>
          <Badge variant={getProductTypeColor(product.productType)} className="text-xs">
            {product.productType}
          </Badge>
        </div>
      </div>

      <div className="text-right">
        <div className="font-medium">${product.cost.currentCost.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onView}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 