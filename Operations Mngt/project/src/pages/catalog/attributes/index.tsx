import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '@/hooks/useCatalog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Eye, Edit, Plus } from 'lucide-react';

const CatalogAttributes: React.FC = () => {
  const navigate = useNavigate();
  const { useAttributes } = useCatalog();
  const { data, isLoading, error, refetch } = useAttributes({ page: 1, pageSize: 50 });
  const attributes = data?.items || [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Product Attributes</h1>
        <Button onClick={() => navigate('create-attribute')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Attribute
        </Button>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load attributes. Please try again.</p>
            <Button onClick={() => refetch()} className="mt-4">Retry</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {attributes.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No attributes found.
              </CardContent>
            </Card>
          ) : (
            attributes.map(attr => (
              <Card key={attr.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <div className="font-semibold text-lg">{attr.name}</div>
                    <div className="text-sm text-muted-foreground">{attr.code}</div>
                    <div className="mt-1">
                      <Badge>{attr.type}</Badge>
                      {attr.status && <Badge className="ml-2">{attr.status}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate(`attribute-detail/${attr.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigate(`edit-attribute/${attr.id}`)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogAttributes; 