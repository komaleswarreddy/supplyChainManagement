import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCatalog } from '@/hooks/useCatalog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft } from 'lucide-react';

const CategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useCategory } = useCatalog();
  const { data: category, isLoading, error } = useCategory(id!);

  if (!id) {
    return <div>Invalid category ID</div>;
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load category details. Please try again.</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="font-semibold">Name:</span> {category.name}
          </div>
          <div>
            <span className="font-semibold">Code:</span> {category.code}
          </div>
          <div>
            <span className="font-semibold">Status:</span> <Badge>{category.status}</Badge>
          </div>
          {category.description && (
            <div>
              <span className="font-semibold">Description:</span> {category.description}
            </div>
          )}
          {category.parentCategory && (
            <div>
              <span className="font-semibold">Parent Category:</span> {category.parentCategory.name}
            </div>
          )}
          {category.createdAt && (
            <div>
              <span className="font-semibold">Created At:</span> {new Date(category.createdAt).toLocaleString()}
            </div>
          )}
          {category.updatedAt && (
            <div>
              <span className="font-semibold">Updated At:</span> {new Date(category.updatedAt).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryDetail; 