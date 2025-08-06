import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Printer, Download, AlertTriangle, CheckCircle, Layers, History, FileText, Truck, BarChart } from 'lucide-react';

// Mock data for a single batch
const batchData = {
  id: 'batch-1',
  number: 'LOT-2023-001',
  itemCode: 'ITEM-0187',
  itemName: 'Printer Toner',
  quantity: 120,
  availableQuantity: 98,
  allocatedQuantity: 22,
  manufacturingDate: '2023-01-15',
  expiryDate: '2024-01-15',
  receivedDate: '2023-01-20',
  supplier: {
    id: 'supplier-1',
    name: 'Tech Supplies Inc.',
    code: 'TSI001',
  },
  status: 'ACTIVE',
  location: {
    warehouse: 'Main Warehouse',
    zone: 'Storage Zone',
    aisle: 'Aisle B',
    rack: 'Rack 5',
    bin: 'Bin 3',
  },
  qualityStatus: 'PASSED',
  qualityChecks: [
    {
      id: 'qc-1',
      date: '2023-01-20',
      inspector: 'Jane Smith',
      result: 'PASSED',
      notes: 'All parameters within acceptable range',
      parameters: [
        { name: 'Color Density', expected: '1.4-1.6', actual: '1.5', result: 'PASS' },
        { name: 'Particle Size', expected: '<5μm', actual: '3.8μm', result: 'PASS' },
        { name: 'Moisture Content', expected: '<0.5%', actual: '0.3%', result: 'PASS' },
      ],
    },
  ],
  movements: [
    {
      id: 'mov-1',
      date: '2023-01-20',
      type: 'RECEIPT',
      quantity: 120,
      reference: 'PO-2023-0042',
      user: 'John Doe',
    },
    {
      id: 'mov-2',
      date: '2023-02-05',
      type: 'ISSUE',
      quantity: 10,
      reference: 'ORD-2023-0078',
      user: 'Sarah Johnson',
    },
    {
      id: 'mov-3',
      date: '2023-03-12',
      type: 'ISSUE',
      quantity: 12,
      reference: 'ORD-2023-0092',
      user: 'Sarah Johnson',
    },
  ],
  documents: [
    {
      id: 'doc-1',
      name: 'Certificate of Analysis',
      type: 'QUALITY',
      url: 'https://example.com/documents/coa-lot-2023-001.pdf',
      uploadedBy: 'John Doe',
      uploadedAt: '2023-01-20',
    },
    {
      id: 'doc-2',
      name: 'Supplier Delivery Note',
      type: 'RECEIPT',
      url: 'https://example.com/documents/delivery-lot-2023-001.pdf',
      uploadedBy: 'John Doe',
      uploadedAt: '2023-01-20',
    },
  ],
  notes: 'Premium quality toner cartridges for laser printers',
};

const statusColors = {
  ACTIVE: 'success',
  QUARANTINE: 'warning',
  EXPIRED: 'destructive',
};

const qualityColors = {
  PASSED: 'success',
  PENDING: 'warning',
  FAILED: 'destructive',
};

const movementTypeIcons = {
  RECEIPT: <Truck className="h-4 w-4 text-green-500" />,
  ISSUE: <Truck className="h-4 w-4 text-red-500" />,
  TRANSFER: <Truck className="h-4 w-4 text-blue-500" />,
  ADJUSTMENT: <BarChart className="h-4 w-4 text-amber-500" />,
};

export function BatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // In a real app, you would fetch the batch data based on the ID
  // For this example, we'll just use the mock data
  const batch = batchData;
  
  const isExpired = batch.expiryDate && new Date(batch.expiryDate) < new Date();
  const isExpiringWithin30Days = batch.expiryDate && 
    new Date(batch.expiryDate) > new Date() && 
    new Date(batch.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/inventory/batch-tracking')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <Layers className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">{batch.number}</h1>
              <p className="text-sm text-muted-foreground">{batch.itemName} ({batch.itemCode})</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={statusColors[batch.status] as any}>
            {batch.status}
          </Badge>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Label
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {(isExpired || isExpiringWithin30Days) && (
        <div className={`p-4 rounded-md border ${isExpired ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex items-center space-x-2">
            <AlertTriangle className={isExpired ? 'text-red-500' : 'text-amber-500'} />
            <div>
              <p className={`font-medium ${isExpired ? 'text-red-800' : 'text-amber-800'}`}>
                {isExpired ? 'Batch Expired' : 'Batch Expiring Soon'}
              </p>
              <p className={`text-sm ${isExpired ? 'text-red-600' : 'text-amber-600'}`}>
                {isExpired 
                  ? `This batch expired on ${format(new Date(batch.expiryDate!), 'PP')}.` 
                  : `This batch will expire on ${format(new Date(batch.expiryDate!), 'PP')}.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Item</p>
                <p className="font-medium">{batch.itemName}</p>
                <p className="text-sm text-muted-foreground">{batch.itemCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                <p className="font-medium">{batch.quantity}</p>
                <p className="text-sm text-muted-foreground">
                  Available: {batch.availableQuantity} | Allocated: {batch.allocatedQuantity}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manufacturing Date</p>
                <p className="font-medium">{format(new Date(batch.manufacturingDate), 'PP')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                <p className={`font-medium ${isExpired ? 'text-red-600' : isExpiringWithin30Days ? 'text-amber-600' : ''}`}>
                  {batch.expiryDate ? format(new Date(batch.expiryDate), 'PP') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Received Date</p>
                <p className="font-medium">{format(new Date(batch.receivedDate), 'PP')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                <p className="font-medium">{batch.supplier.name}</p>
                <p className="text-sm text-muted-foreground">{batch.supplier.code}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warehouse</p>
                <p className="font-medium">{batch.location.warehouse}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Zone</p>
                <p className="font-medium">{batch.location.zone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aisle</p>
                <p className="font-medium">{batch.location.aisle}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rack</p>
                <p className="font-medium">{batch.location.rack}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bin</p>
                <p className="font-medium">{batch.location.bin}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="movements">
        <TabsList>
          <TabsTrigger value="movements" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Movements
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Quality
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="movements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Movement History</CardTitle>
              <CardDescription>All transactions for this batch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-right py-3 px-4 font-medium">Quantity</th>
                      <th className="text-left py-3 px-4 font-medium">Reference</th>
                      <th className="text-left py-3 px-4 font-medium">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.movements.map((movement) => (
                      <tr key={movement.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {format(new Date(movement.date), 'PPp')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {movementTypeIcons[movement.type]}
                            <span>{movement.type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {movement.type === 'RECEIPT' ? '+' : '-'}{movement.quantity}
                        </td>
                        <td className="py-3 px-4">{movement.reference}</td>
                        <td className="py-3 px-4">{movement.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quality" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quality Information</CardTitle>
                  <CardDescription>Quality check results</CardDescription>
                </div>
                <Badge variant={qualityColors[batch.qualityStatus] as any}>
                  {batch.qualityStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {batch.qualityChecks.map((check) => (
                <div key={check.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Quality Check: {format(new Date(check.date), 'PP')}</p>
                      <p className="text-sm text-muted-foreground">Inspector: {check.inspector}</p>
                    </div>
                    <Badge variant={check.result === 'PASSED' ? 'success' : 'destructive'}>
                      {check.result}
                    </Badge>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4 font-medium">Parameter</th>
                          <th className="text-left py-2 px-4 font-medium">Expected</th>
                          <th className="text-left py-2 px-4 font-medium">Actual</th>
                          <th className="text-left py-2 px-4 font-medium">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {check.parameters.map((param, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4 font-medium">{param.name}</td>
                            <td className="py-2 px-4">{param.expected}</td>
                            <td className="py-2 px-4">{param.actual}</td>
                            <td className="py-2 px-4">
                              <Badge variant={param.result === 'PASS' ? 'success' : 'destructive'}>
                                {param.result}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {check.notes && (
                    <div>
                      <p className="text-sm font-medium">Notes:</p>
                      <p className="text-sm">{check.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Related documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {batch.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • Uploaded by {doc.uploadedBy} on {format(new Date(doc.uploadedAt), 'PP')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}