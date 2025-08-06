import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Filter, FileText } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

const CatalogExport: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [includeImages, setIncludeImages] = useState(false);
  const [includeVariants, setIncludeVariants] = useState(true);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Mock export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: "Products exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export products",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/catalog/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export Products</h1>
          <p className="text-gray-600">Export your product catalog</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Export Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="json">JSON</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories (optional)
              </label>
              <select
                multiple
                value={selectedCategories}
                onChange={(e) => setSelectedCategories(Array.from(e.target.selectedOptions, option => option.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={4}
              >
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="health">Health & Fitness</option>
                <option value="home">Home & Garden</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to export all categories
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-variants"
                  checked={includeVariants}
                  onChange={(e) => setIncludeVariants(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="include-variants" className="text-sm font-medium text-gray-700">
                  Include product variants
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include-images"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="include-images" className="text-sm font-medium text-gray-700">
                  Include image URLs
                </label>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={exporting}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export Products'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Export Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">89</div>
                <div className="text-sm text-gray-600">Active Products</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Included Fields:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Product Name & Description</li>
                <li>• SKU & Pricing</li>
                <li>• Category & Brand</li>
                <li>• Stock Information</li>
                <li>• Product Status</li>
                {includeVariants && <li>• Product Variants</li>}
                {includeImages && <li>• Image URLs</li>}
              </ul>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                The export will be processed and downloaded automatically. 
                Large exports may take a few moments to complete.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CatalogExport; 