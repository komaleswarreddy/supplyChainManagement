import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, BookMarked, History, FileText, CheckSquare, X } from 'lucide-react';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// Mock data for a single reservation
const reservationData = {
  id: 'res-1',
  referenceNumber: 'RES-2023-001',
  referenceType: 'SALES_ORDER',
  referenceId: 'SO-2023-0187',
  itemCode: 'ITEM-0187',
  itemName: 'Printer Toner',
  quantity: 10,
  status: 'ACTIVE',
  location: {
    warehouse: 'Main Warehouse',
    zone: 'Storage Zone',
    aisle: 'Aisle B',
    rack: 'Rack 5',
    bin: 'Bin 3',
  },
  createdDate: '2023-06-15',
  expiryDate: '2023-07-15',
  createdBy: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
  priority: 'HIGH',
  notes: 'Priority reservation for key customer',
  allocations: [
    {
      id: 'alloc-1',
      batchNumber: 'LOT-2023-001',
      quantity: 8,
      allocatedAt: '2023-06-15T10:30:00Z',
      allocatedBy: 'System',
    },
    {
      id: 'alloc-2',
      batchNumber: 'LOT-2022-045',
      quantity: 2,
      allocatedAt: '2023-06-15T10:30:00Z',
      allocatedBy: 'System',
    },
  ],
  history: [
    {
      id: 'hist-1',
      timestamp: '2023-06-15T10:25:00Z',
      action: 'CREATED',
      user: 'John Doe',
      details: 'Reservation created',
    },
    {
      id: 'hist-2',
      timestamp: '2023-06-15T10:30:00Z',
      action: 'ALLOCATED',
      user: 'System',
      details: 'Inventory allocated to reservation',
    },
  ],
  customer: {
    id: 'cust-1',
    name: 'Acme Corporation',
    contactPerson: 'Jane Smith',
    contactEmail: 'jane.smith@acme.com',
    contactPhone: '+1-555-123-4567',
  },
};

const statusColors = {
  ACTIVE: 'success',
  FULFILLED: 'secondary',
  CANCELLED: 'destructive',
  EXPIRED: 'destructive',
};

const priorityColors = {
  HIGH: 'destructive',
  MEDIUM: 'warning',
  LOW: 'secondary',
};

export function ReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  
  // In a real app, you would fetch the reservation data based on the ID
  // For this example, we'll just use the mock data
  const reservation = reservationData;
  
  const handleFulfill = () => {
    confirm(() => {
      // In a real app, you would call an API to fulfill the reservation
      console.log('Fulfilling reservation:', id);
      navigate('/inventory/reservation');
    });
  };
  
  const handleCancel = () => {
    confirm(() => {
      // In a real app, you would call an API to cancel the reservation
      console.log('Cancelling reservation:', id);
      navigate('/inventory/reservation');
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/inventory/reservation')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <BookMarked className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">{reservation.referenceNumber}</h1>
              <p className="text-sm text-muted-foreground">
                {reservation.itemName} ({reservation.itemCode})
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={statusColors[reservation.status] as any}>
            {reservation.status}
          </Badge>
          <Badge variant={priorityColors[reservation.priority] as any}>
            {reservation.priority} PRIORITY
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Reservation Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reference Type</p>
                <p className="font-medium">{reservation.referenceType.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reference ID</p>
                <p className="font-medium">{reservation.referenceId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                <p className="font-medium">{reservation.quantity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                <p className="font-medium">{format(new Date(reservation.createdDate), 'PP')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                <p className="font-medium">{format(new Date(reservation.expiryDate), 'PP')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created By</p>
                <p className="font-medium">{reservation.createdBy.name}</p>
              </div>
            </div>
            
            {reservation.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p>{reservation.notes}</p>
              </div>
            )}
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
                <p className="font-medium">{reservation.location.warehouse}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Zone</p>
                <p className="font-medium">{reservation.location.zone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aisle</p>
                <p className="font-medium">{reservation.location.aisle}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rack</p>
                <p className="font-medium">{reservation.location.rack}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bin</p>
                <p className="font-medium">{reservation.location.bin}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="allocations">
        <TabsList>
          <TabsTrigger value="allocations" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Allocations
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Customer Information
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="allocations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Allocated Inventory</CardTitle>
              <CardDescription>Inventory allocated to this reservation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Batch/Lot</th>
                      <th className="text-right py-3 px-4 font-medium">Quantity</th>
                      <th className="text-left py-3 px-4 font-medium">Allocated At</th>
                      <th className="text-left py-3 px-4 font-medium">Allocated By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservation.allocations.map((allocation) => (
                      <tr key={allocation.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{allocation.batchNumber}</td>
                        <td className="py-3 px-4 text-right">{allocation.quantity}</td>
                        <td className="py-3 px-4">{format(new Date(allocation.allocatedAt), 'PPp')}</td>
                        <td className="py-3 px-4">{allocation.allocatedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-medium">
                      <td className="py-3 px-4">Total</td>
                      <td className="py-3 px-4 text-right">
                        {reservation.allocations.reduce((sum, allocation) => sum + allocation.quantity, 0)}
                      </td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reservation History</CardTitle>
              <CardDescription>Activity log for this reservation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reservation.history.map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-md">
                    <div className="min-w-[180px]">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.timestamp), 'PPp')}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{event.action}</p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">By: </span>
                        {event.user}
                      </p>
                      {event.details && (
                        <p className="text-sm mt-1">{event.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customer" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Details of the customer for this reservation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{reservation.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{reservation.customer.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                  <p className="font-medium">
                    <a href={`mailto:${reservation.customer.contactEmail}`} className="text-primary hover:underline">
                      {reservation.customer.contactEmail}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Phone</p>
                  <p className="font-medium">
                    <a href={`tel:${reservation.customer.contactPhone}`} className="text-primary hover:underline">
                      {reservation.customer.contactPhone}
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      {reservation.status === 'ACTIVE' && (
        <div className="flex space-x-2">
          <Button onClick={handleFulfill} className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Fulfill Reservation
          </Button>
          <Button variant="destructive" onClick={handleCancel} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Cancel Reservation
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Action"
        description="Are you sure you want to proceed with this action? This cannot be undone."
        confirmText="Continue"
        onConfirm={onConfirm}
      />
    </div>
  );
}