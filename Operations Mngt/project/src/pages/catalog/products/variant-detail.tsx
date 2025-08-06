import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';

const VariantDetail: React.FC = () => {
  const { id, variantId } = useParams<{ id: string; variantId: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(`/catalog/products/${id}/variants`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Variants
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Variant Details</h1>
            <p className="text-gray-600">View variant information</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/catalog/products/${id}/variants/${variantId}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Variant
        </Button>
      </div>
      <div className="text-center py-12">
        <p className="text-gray-500">Variant details will be displayed here.</p>
      </div>
    </div>
  );
};

export default VariantDetail; 