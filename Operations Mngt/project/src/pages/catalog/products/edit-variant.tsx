import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const EditVariant: React.FC = () => {
  const { id, variantId } = useParams<{ id: string; variantId: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate(`/catalog/products/${id}/variants`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Variants
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Variant</h1>
          <p className="text-gray-600">Modify variant details</p>
        </div>
      </div>
      <div className="text-center py-12">
        <p className="text-gray-500">Variant editing form will be implemented here.</p>
      </div>
    </div>
  );
};

export default EditVariant; 