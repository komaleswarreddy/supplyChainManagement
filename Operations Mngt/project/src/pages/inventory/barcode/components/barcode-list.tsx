import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Search, Printer, Download, Eye } from 'lucide-react';

// Mock data for barcodes
const barcodes = [
  {
    id: 'barcode-1',
    type: 'CODE128',
    data: 'ITEM-0187',
    description: 'Printer Toner',
    createdBy: 'John Doe',
    createdAt: '2023-05-15',
    printCount: 12,
    lastPrinted: '2023-06-10',
  },
  {
    id: 'barcode-2',
    type: 'CODE39',
    data: 'ITEM-0042',
    description: 'Laptop Docking Station',
    createdBy: 'Jane Smith',
    createdAt: '2023-05-20',
    printCount: 8,
    lastPrinted: '2023-06-05',
  },
  {
    id: 'barcode-3',
    type: 'EAN13',
    data: '5901234123457',
    description: 'USB Cables',
    createdBy: 'John Doe',
    createdAt: '2023-05-25',
    printCount: 15,
    lastPrinted: '2023-06-12',
  },
  {
    id: 'barcode-4',
    type: 'UPC',
    data: '123456789012',
    description: 'Office Chair',
    createdBy: 'Mike Wilson',
    createdAt: '2023-06-01',
    printCount: 5,
    lastPrinted: '2023-06-08',
  },
  {
    id: 'barcode-5',
    type: 'CODE128',
    data: 'ITEM-0078',
    description: 'Wireless Keyboard',
    createdBy: 'Sarah Johnson',
    createdAt: '2023-06-05',
    printCount: 10,
    lastPrinted: '2023-06-15',
  },
];

export function BarcodeList() {
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');

  const filteredBarcodes = barcodes.filter(barcode => {
    const matchesSearch = search === '' || 
      barcode.data.toLowerCase().includes(search.toLowerCase()) ||
      barcode.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === '' || barcode.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Barcodes</CardTitle>
        <CardDescription>Previously generated barcodes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by data or description"
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48 space-y-2">
              <Label htmlFor="typeFilter">Type</Label>
              <Select
                id="typeFilter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="CODE128">Code 128</option>
                <option value="CODE39">Code 39</option>
                <option value="EAN13">EAN-13</option>
                <option value="UPC">UPC</option>
                <option value="EAN8">EAN-8</option>
                <option value="ITF14">ITF-14</option>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Data</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Created By</th>
                  <th className="text-left py-3 px-4 font-medium">Created At</th>
                  <th className="text-center py-3 px-4 font-medium">Print Count</th>
                  <th className="text-center py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBarcodes.map((barcode) => (
                  <tr key={barcode.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{barcode.data}</td>
                    <td className="py-3 px-4">{barcode.description}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{barcode.type}</Badge>
                    </td>
                    <td className="py-3 px-4">{barcode.createdBy}</td>
                    <td className="py-3 px-4">{new Date(barcode.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span>{barcode.printCount}</span>
                        <span className="text-xs text-muted-foreground">
                          Last: {new Date(barcode.lastPrinted).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBarcodes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No barcodes found matching your criteria</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}