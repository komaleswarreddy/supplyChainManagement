import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, QrCode, Download, Printer, History, Edit, Trash2, Share2 } from 'lucide-react';
import { format } from 'date-fns';

interface BarcodeDetailsProps {
  barcodeId: string;
  onBack: () => void;
}

export function BarcodeDetails({ barcodeId, onBack }: BarcodeDetailsProps) {
  const [activeTab, setActiveTab] = useState('details');
  
  // Mock data for demonstration
  // In a real application, you would fetch this data based on the barcodeId
  const barcode = {
    id: barcodeId,
    code: '9781234567897',
    type: 'EAN13',
    format: '1D Barcode',
    itemId: 'item-123',
    itemName: 'Wireless Keyboard',
    itemSku: 'KB-WL-001',
    category: 'Electronics',
    location: 'Warehouse 2',
    zone: 'Zone A',
    bin: 'Bin 123',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'John Doe',
    status: 'ACTIVE',
    printCount: 5,
    lastPrinted: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Barcode for inventory tracking of wireless keyboards',
    imageUrl: `https://bwipjs-api.metafloor.com/?bcid=ean13&text=9781234567897&scale=3&height=50&includetext=true`,
    history: [
      {
        action: 'CREATED',
        timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'John Doe',
        notes: 'Initial barcode generation',
      },
      {
        action: 'PRINTED',
        timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Jane Smith',
        notes: 'Printed 2 copies',
      },
      {
        action: 'SCANNED',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Mike Johnson',
        notes: 'Inventory check',
      },
      {
        action: 'PRINTED',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        user: 'Jane Smith',
        notes: 'Printed 3 copies',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          {barcode.type === 'QR_CODE' ? (
            <QrCode className="h-6 w-6" />
          ) : (
            <QrCode className="h-6 w-6" />
          )}
          <h1 className="text-2xl font-bold">Barcode Details</h1>
        </div>
        <Badge variant={barcode.status === 'ACTIVE' ? 'success' : 'secondary'}>
          {barcode.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="item">Item Information</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Barcode</h3>
                  <p className="font-medium">{barcode.code}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                  <p className="font-medium">{barcode.type}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Format</h3>
                  <p className="font-medium">{barcode.format}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                  <p className="font-medium">{format(new Date(barcode.createdAt), 'PPP')}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                  <p className="font-medium">{barcode.createdBy}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Print Count</h3>
                  <p className="font-medium">{barcode.printCount}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Last Printed</h3>
                  <p className="font-medium">
                    {barcode.lastPrinted ? format(new Date(barcode.lastPrinted), 'PPP') : 'Never'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p className="font-medium">{barcode.status}</p>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p>{barcode.description}</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="item" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Item ID</h3>
                  <p className="font-medium">{barcode.itemId}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Item Name</h3>
                  <p className="font-medium">{barcode.itemName}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">SKU</h3>
                  <p className="font-medium">{barcode.itemSku}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p className="font-medium">{barcode.category}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                  <p className="font-medium">{barcode.location}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Zone</h3>
                  <p className="font-medium">{barcode.zone}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Bin</h3>
                  <p className="font-medium">{barcode.bin}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <Button variant="outline">
                  View Item Details
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4 mt-4">
              <div className="space-y-4">
                {barcode.history.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border">
                    <div className="rounded-full p-2 bg-muted">
                      <History className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{event.action}</h3>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(event.timestamp), 'PPp')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">By: {event.user}</p>
                      {event.notes && <p className="text-sm mt-1">{event.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Barcode Image</CardTitle>
              <CardDescription>
                Preview and print the barcode
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6">
              <div className="flex flex-col items-center">
                <img 
                  src={barcode.imageUrl} 
                  alt="Barcode" 
                  className="border border-border p-4 rounded-md"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  {barcode.code}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-2 flex-wrap">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">Actions</h3>
            <div className="space-y-2">
              <Button className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Edit Barcode
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="h-4 w-4 mr-2" />
                Print Label
              </Button>
              {barcode.status === 'ACTIVE' ? (
                <Button variant="outline" className="w-full justify-start">
                                  <QrCode className="h-4 w-4 mr-2" />
                Deactivate Barcode
                </Button>
              ) : (
                <Button variant="outline" className="w-full justify-start">
                                  <QrCode className="h-4 w-4 mr-2" />
                Activate Barcode
                </Button>
              )}
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Barcode
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}