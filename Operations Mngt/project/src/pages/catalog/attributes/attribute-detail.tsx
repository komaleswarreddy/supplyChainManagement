import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, ArrowLeft, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface AttributeValue {
  id: string;
  value: string;
  displayOrder: number;
  isActive: boolean;
}

interface Attribute {
  id: string;
  name: string;
  description: string;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTI_SELECT' | 'BOOLEAN' | 'DATE';
  isRequired: boolean;
  isFilterable: boolean;
  isVariant: boolean;
  displayOrder: number;
  unit?: string;
  validationRules?: any;
  values: AttributeValue[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
}

const AttributeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [attribute, setAttribute] = useState<Attribute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockAttribute: Attribute = {
      id: id || '1',
      name: 'Color',
      description: 'Product color variations',
      type: 'SELECT',
      isRequired: true,
      isFilterable: true,
      isVariant: true,
      displayOrder: 1,
      validationRules: {},
      values: [
        { id: '1', value: 'Red', displayOrder: 1, isActive: true },
        { id: '2', value: 'Blue', displayOrder: 2, isActive: true },
        { id: '3', value: 'Green', displayOrder: 3, isActive: true },
        { id: '4', value: 'Black', displayOrder: 4, isActive: false },
      ],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
      createdBy: 'John Doe',
      status: 'ACTIVE'
    };
    
    setTimeout(() => {
      setAttribute(mockAttribute);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleEdit = () => {
    navigate(`/catalog/attributes/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this attribute?')) {
      try {
        // API call to delete attribute
        toast({
          title: "Success",
          description: "Attribute deleted successfully",
        });
        navigate('/catalog/attributes');
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete attribute",
          variant: "destructive",
        });
      }
    }
  };

  const toggleValueStatus = async (valueId: string) => {
    if (!attribute) return;
    
    const updatedValues = attribute.values.map(value =>
      value.id === valueId ? { ...value, isActive: !value.isActive } : value
    );
    
    setAttribute({ ...attribute, values: updatedValues });
    
    toast({
      title: "Success",
      description: "Value status updated successfully",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!attribute) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Attribute not found</h2>
        <p className="text-gray-600 mt-2">The requested attribute could not be found.</p>
        <Button onClick={() => navigate('/catalog/attributes')} className="mt-4">
          Back to Attributes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/catalog/attributes')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Attributes
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{attribute.name}</h1>
            <p className="text-gray-600">{attribute.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={attribute.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {attribute.status}
          </Badge>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="values">Values</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">{attribute.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-900">{attribute.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <Badge variant="outline">{attribute.type}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Display Order</label>
                  <p className="text-sm text-gray-900">{attribute.displayOrder}</p>
                </div>
                {attribute.unit && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Unit</label>
                    <p className="text-sm text-gray-900">{attribute.unit}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Required</span>
                  <Badge variant={attribute.isRequired ? 'default' : 'secondary'}>
                    {attribute.isRequired ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Filterable</span>
                  <Badge variant={attribute.isFilterable ? 'default' : 'secondary'}>
                    {attribute.isFilterable ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Variant Attribute</span>
                  <Badge variant={attribute.isVariant ? 'default' : 'secondary'}>
                    {attribute.isVariant ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge variant={attribute.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {attribute.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="values">
          <Card>
            <CardHeader>
              <CardTitle>Attribute Values</CardTitle>
            </CardHeader>
            <CardContent>
              {attribute.values.length > 0 ? (
                <div className="space-y-2">
                  {attribute.values
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((value) => (
                      <div
                        key={value.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium">{value.displayOrder}</span>
                          <span className="text-sm">{value.value}</span>
                          <Badge variant={value.isActive ? 'default' : 'secondary'}>
                            {value.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleValueStatus(value.id)}
                        >
                          {value.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No values defined for this attribute</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <div className="text-sm text-gray-600">Products Using</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">5</div>
                  <div className="text-sm text-gray-600">Variants</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Change History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Attribute Updated</span>
                    <span className="text-sm text-gray-500">2024-01-20 15:30</span>
                  </div>
                  <p className="text-sm text-gray-600">Description updated by John Doe</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Value Added</span>
                    <span className="text-sm text-gray-500">2024-01-18 10:15</span>
                  </div>
                  <p className="text-sm text-gray-600">Added "Black" value by Jane Smith</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Attribute Created</span>
                    <span className="text-sm text-gray-500">2024-01-15 10:00</span>
                  </div>
                  <p className="text-sm text-gray-600">Attribute created by John Doe</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttributeDetail; 