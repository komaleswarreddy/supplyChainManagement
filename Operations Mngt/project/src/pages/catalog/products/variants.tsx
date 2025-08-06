import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';

const ProductVariants: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockVariants = [
      {
        id: '1',
        name: 'Red - Small',
        sku: 'WH-001-R-S',
        price: 299.99,
        stock: 50,
        attributes: { color: 'Red', size: 'Small' },
        status: 'ACTIVE'
      },
      {
        id: '2',
        name: 'Blue - Medium',
        sku: 'WH-001-B-M',
        price: 299.99,
        stock: 75,
        attributes: { color: 'Blue', size: 'Medium' },
        status: 'ACTIVE'
      }
    ];
    
    setTimeout(() => {
      setVariants(mockVariants);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(`/catalog/products/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Variants</h1>
            <p className="text-gray-600">Manage variants for this product</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/catalog/products/${id}/variants/create`)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Variant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variants ({variants.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {variants.length > 0 ? (
            <div className="space-y-4">
              {variants.map((variant) => (
                <div key={variant.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{variant.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {variant.sku}</p>
                    </div>
                    <Badge variant={variant.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {variant.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">${variant.price}</p>
                      <p className="text-sm text-gray-500">Stock: {variant.stock}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/catalog/products/${id}/variants/${variant.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No variants found</h3>
              <p className="text-gray-500 mt-2">Create your first product variant.</p>
              <Button 
                onClick={() => navigate(`/catalog/products/${id}/variants/create`)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductVariants; 