import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Printer, Download, Eye } from 'lucide-react';

// Mock data for QR codes
const qrCodes = [
  {
    id: 'qr-1',
    data: 'https://example.com/item/ITEM-0187',
    description: 'Printer Toner Product Page',
    createdBy: 'John Doe',
    createdAt: '2023-05-15',
    printCount: 8,
    lastPrinted: '2023-06-10',
    type: 'URL',
  },
  {
    id: 'qr-2',
    data: 'ITEM-0042-LOT2023002-SN12345',
    description: 'Laptop Docking Station Serial Number',
    createdBy: 'Jane Smith',
    createdAt: '2023-05-20',
    printCount: 5,
    lastPrinted: '2023-06-05',
    type: 'SERIAL',
  },
  {
    id: 'qr-3',
    data: 'https://example.com/docs/manual-usb-cables.pdf',
    description: 'USB Cables User Manual',
    createdBy: 'John Doe',
    createdAt: '2023-05-25',
    printCount: 12,
    lastPrinted: '2023-06-12',
    type: 'DOCUMENT',
  },
  {
    id: 'qr-4',
    data: 'LOC-MAIN-ZONEA-AISLE3-RACK5-BIN2',
    description: 'Office Chair Location',
    createdBy: 'Mike Wilson',
    createdAt: '2023-06-01',
    printCount: 3,
    lastPrinted: '2023-06-08',
    type: 'LOCATION',
  },
  {
    id: 'qr-5',
    data: 'WIFI:T:WPA;S:WarehouseWiFi;P:warehouse123;;',
    description: 'Warehouse WiFi Access',
    createdBy: 'Sarah Johnson',
    createdAt: '2023-06-05',
    printCount: 15,
    lastPrinted: '2023-06-15',
    type: 'WIFI',
  },
];

const typeColors = {
  URL: 'bg-blue-100 text-blue-800',
  SERIAL: 'bg-purple-100 text-purple-800',
  DOCUMENT: 'bg-green-100 text-green-800',
  LOCATION: 'bg-amber-100 text-amber-800',
  WIFI: 'bg-red-100 text-red-800',
};

export function QRCodeList() {
  const [search, setSearch] = React.useState('');

  const filteredQRCodes = qrCodes.filter(qrCode => {
    return search === '' || 
      qrCode.data.toLowerCase().includes(search.toLowerCase()) ||
      qrCode.description.toLowerCase().includes(search.toLowerCase()) ||
      qrCode.type.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved QR Codes</CardTitle>
        <CardDescription>Previously generated QR codes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by data, description, or type"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Data</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Created By</th>
                  <th className="text-left py-3 px-4 font-medium">Created At</th>
                  <th className="text-center py-3 px-4 font-medium">Print Count</th>
                  <th className="text-center py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQRCodes.map((qrCode) => (
                  <tr key={qrCode.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{qrCode.description}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{qrCode.data}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${typeColors[qrCode.type]}`}>
                        {qrCode.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{qrCode.createdBy}</td>
                    <td className="py-3 px-4">{new Date(qrCode.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span>{qrCode.printCount}</span>
                        <span className="text-xs text-muted-foreground">
                          Last: {new Date(qrCode.lastPrinted).toLocaleDateString()}
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

          {filteredQRCodes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No QR codes found matching your criteria</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}