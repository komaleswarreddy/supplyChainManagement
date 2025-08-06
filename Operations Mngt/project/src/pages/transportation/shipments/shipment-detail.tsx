import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTransportation } from '@/hooks/useTransportation';
import { ArrowLeft, Truck, MapPin, Calendar, FileCheck, Package, DollarSign, Clock, ExternalLink, Printer } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const statusColors = {
  PLANNED: 'default',
  BOOKED: 'secondary',
  IN_TRANSIT: 'warning',
  DELIVERED: 'success',
  EXCEPTION: 'destructive',
  CANCELLED: 'destructive',
} as const;

export function ShipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const { useShipment, useUpdateShipment, useDocuments } = useTransportation();
  const { data: shipment, isLoading } = useShipment(id!);
  const { data: documents } = useDocuments(id!);
  const { mutate: updateShipment, isLoading: isUpdating } = useUpdateShipment();

  const handleStatusChange = (newStatus: 'PLANNED' | 'BOOKED' | 'IN_TRANSIT' | 'DELIVERED' | 'EXCEPTION' | 'CANCELLED') => {
    confirm(() => {
      updateShipment({
        id: id!,
        data: { 
          status: newStatus,
          ...(newStatus === 'DELIVERED' ? { actualDeliveryDate: new Date().toISOString() } : {})
        }
      });
    });
  };

  const handleCreateDocument = (documentType: 'BOL' | 'COMMERCIAL_INVOICE' | 'PACKING_LIST') => {
    navigate(`/transportation/documents/new`, { state: { shipmentId: id, documentType } });
  };

  if (isLoading || !shipment) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/transportation/shipments')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Shipment {shipment.shipmentNumber}</h1>
                <p className="text-sm text-muted-foreground">
                  {shipment.origin.city}, {shipment.origin.state} to {shipment.destination.city}, {shipment.destination.state}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[shipment.status]} className="h-6 px-3 text-sm">
              {shipment.status.replace('_', ' ')}
            </Badge>
            <Button variant="outline" onClick={() => navigate(`/transportation/shipments/${id}/edit`)}>
              Edit
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Shipment Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Shipment #</h3>
                        <p className="mt-1 font-medium">{shipment.shipmentNumber}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Reference #</h3>
                        <p className="mt-1">{shipment.referenceNumber || '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Carrier</h3>
                        <p className="mt-1">{shipment.carrier.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">SCAC</h3>
                        <p className="mt-1">{shipment.carrier.scacCode || '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Service Level</h3>
                        <p className="mt-1">{shipment.serviceLevel}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Tracking #</h3>
                        <div className="mt-1 flex items-center gap-1">
                          <span>{shipment.trackingNumber || '-'}</span>
                          {shipment.trackingUrl && (
                            <a 
                              href={shipment.trackingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Pickup Date</h3>
                        <p className="mt-1">{format(new Date(shipment.pickupDate), 'PPp')}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Estimated Delivery</h3>
                        <p className="mt-1">{format(new Date(shipment.estimatedDeliveryDate), 'PPp')}</p>
                      </div>
                      {shipment.actualDeliveryDate && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Actual Delivery</h3>
                          <p className="mt-1">{format(new Date(shipment.actualDeliveryDate), 'PPp')}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Special Instructions</h3>
                      <p className="mt-1">{shipment.specialInstructions || 'None'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg border bg-card">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Origin</h2>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{shipment.origin.name}</p>
                        <p>{shipment.origin.address}</p>
                        <p>{shipment.origin.city}, {shipment.origin.state} {shipment.origin.postalCode}</p>
                        <p>{shipment.origin.country}</p>
                        <div className="mt-2">
                          <p className="text-sm">Contact: {shipment.origin.contactName}</p>
                          <p className="text-sm">Phone: {shipment.origin.contactPhone}</p>
                          {shipment.origin.contactEmail && (
                            <p className="text-sm">Email: {shipment.origin.contactEmail}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Destination</h2>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{shipment.destination.name}</p>
                        <p>{shipment.destination.address}</p>
                        <p>{shipment.destination.city}, {shipment.destination.state} {shipment.destination.postalCode}</p>
                        <p>{shipment.destination.country}</p>
                        <div className="mt-2">
                          <p className="text-sm">Contact: {shipment.destination.contactName}</p>
                          <p className="text-sm">Phone: {shipment.destination.contactPhone}</p>
                          {shipment.destination.contactEmail && (
                            <p className="text-sm">Email: {shipment.destination.contactEmail}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Shipment Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Weight</h3>
                    <p className="mt-1 font-medium">{shipment.totalWeight.toLocaleString()} {shipment.weightUnit}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Volume</h3>
                    <p className="mt-1 font-medium">{shipment.totalVolume.toLocaleString()} {shipment.volumeUnit}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Freight Class</h3>
                    <p className="mt-1 font-medium">{shipment.freightClass || '-'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Total Cost</h3>
                    <p className="mt-1 font-medium">{shipment.costs.currency} {shipment.costs.totalCost.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Status Management</h2>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={shipment.status === 'PLANNED' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('PLANNED')}
                    disabled={shipment.status === 'PLANNED' || isUpdating}
                  >
                    Planned
                  </Button>
                  <Button 
                    variant={shipment.status === 'BOOKED' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('BOOKED')}
                    disabled={shipment.status === 'BOOKED' || isUpdating}
                  >
                    Booked
                  </Button>
                  <Button 
                    variant={shipment.status === 'IN_TRANSIT' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('IN_TRANSIT')}
                    disabled={shipment.status === 'IN_TRANSIT' || isUpdating}
                  >
                    In Transit
                  </Button>
                  <Button 
                    variant={shipment.status === 'DELIVERED' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('DELIVERED')}
                    disabled={shipment.status === 'DELIVERED' || isUpdating}
                  >
                    Delivered
                  </Button>
                  <Button 
                    variant={shipment.status === 'EXCEPTION' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('EXCEPTION')}
                    disabled={shipment.status === 'EXCEPTION' || isUpdating}
                  >
                    Exception
                  </Button>
                  <Button 
                    variant={shipment.status === 'CANCELLED' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('CANCELLED')}
                    disabled={shipment.status === 'CANCELLED' || isUpdating}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Items</h2>
                <div className="space-y-4">
                  {shipment.items.map((item, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">{item.description}</h3>
                        <Badge variant="outline">{item.itemCode}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>{' '}
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Weight:</span>{' '}
                          <span className="font-medium">{item.weight} {item.weightUnit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Dimensions:</span>{' '}
                          <span className="font-medium">
                            {item.dimensions.length}x{item.dimensions.width}x{item.dimensions.height} {item.dimensions.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Value:</span>{' '}
                          <span className="font-medium">{item.currency} {item.value.toLocaleString()}</span>
                        </div>
                        {item.hazardous && (
                          <div className="col-span-2 md:col-span-4">
                            <Badge variant="destructive">HAZARDOUS</Badge>
                            {item.hazmatInfo && (
                              <span className="ml-2 text-sm">
                                UN {item.hazmatInfo.unNumber}, Class {item.hazmatInfo.class}, PG {item.hazmatInfo.packingGroup}
                              </span>
                            )}
                          </div>
                        )}
                        {item.countryOfOrigin && (
                          <div>
                            <span className="text-muted-foreground">Origin:</span>{' '}
                            <span>{item.countryOfOrigin}</span>
                          </div>
                        )}
                        {item.hsCode && (
                          <div>
                            <span className="text-muted-foreground">HS Code:</span>{' '}
                            <span>{item.hsCode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Packages</h2>
                <div className="space-y-4">
                  {shipment.packages.map((pkg, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">{pkg.packageType}</h3>
                        <Badge variant="outline">{pkg.packageId}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantity:</span>{' '}
                          <span className="font-medium">{pkg.quantity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Weight:</span>{' '}
                          <span className="font-medium">{pkg.weight} {pkg.weightUnit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Dimensions:</span>{' '}
                          <span className="font-medium">
                            {pkg.dimensions.length}x{pkg.dimensions.width}x{pkg.dimensions.height} {pkg.dimensions.unit}
                          </span>
                        </div>
                        {pkg.trackingNumber && (
                          <div>
                            <span className="text-muted-foreground">Tracking:</span>{' '}
                            <span className="font-medium">{pkg.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Tracking Events</h2>
                  {shipment.trackingUrl && (
                    <a 
                      href={shipment.trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Carrier Tracking</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-muted"></div>
                  
                  <div className="space-y-6 ml-9">
                    {shipment.events.map((event, index) => (
                      <div key={index} className="relative">
                        {/* Timeline dot */}
                        <div className={`absolute -left-9 top-1 h-4 w-4 rounded-full border-2 ${
                          index === 0 ? 'bg-primary border-primary' : 'bg-background border-muted'
                        }`}></div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.status.replace(/_/g, ' ')}</span>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(event.timestamp), 'PPp')}
                            </span>
                          </div>
                          {event.location && (
                            <p className="text-sm mt-1">
                              <span className="text-muted-foreground">Location:</span> {event.location}
                            </p>
                          )}
                          {event.notes && (
                            <p className="text-sm mt-1">{event.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Shipping Documents</h2>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCreateDocument('BOL')}
                      className="flex items-center gap-1"
                    >
                      <FileCheck className="h-4 w-4" />
                      Generate BOL
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCreateDocument('COMMERCIAL_INVOICE')}
                      className="flex items-center gap-1"
                    >
                      <DollarSign className="h-4 w-4" />
                      Generate Invoice
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCreateDocument('PACKING_LIST')}
                      className="flex items-center gap-1"
                    >
                      <Package className="h-4 w-4" />
                      Generate Packing List
                    </Button>
                  </div>
                </div>
                
                {shipment.documents.length > 0 ? (
                  <div className="space-y-4">
                    {shipment.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                          <FileCheck className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.type.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">
                              Created {format(new Date(doc.createdAt), 'PP')} by {doc.createdBy.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(doc.url, '_blank')}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Printer className="h-4 w-4" />
                            Print
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No documents have been generated for this shipment yet.</p>
                    <p className="text-sm mt-2">Use the buttons above to generate shipping documents.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Cost Summary</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Base Rate</h3>
                      <p className="mt-1 font-medium">{shipment.costs.currency} {shipment.costs.baseRate.toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Fuel Surcharge</h3>
                      <p className="mt-1">{shipment.costs.currency} {shipment.costs.fuelSurcharge.toLocaleString()}</p>
                    </div>
                    
                    {shipment.costs.accessorials.length > 0 && (
                      <div className="col-span-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Accessorial Charges</h3>
                        <div className="mt-1 space-y-2">
                          {shipment.costs.accessorials.map((acc, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{acc.description}</span>
                              <span>{shipment.costs.currency} {acc.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Taxes</h3>
                      <p className="mt-1">{shipment.costs.currency} {shipment.costs.taxes.toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Total Cost</h3>
                      <p className="mt-1 font-bold">{shipment.costs.currency} {shipment.costs.totalCost.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {shipment.costs.invoiceNumber && (
                    <div className="border-t pt-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Invoice Number</h3>
                          <p className="mt-1">{shipment.costs.invoiceNumber}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Invoice Status</h3>
                          <p className="mt-1">
                            <Badge variant={
                              shipment.costs.invoiceStatus === 'PAID' ? 'success' :
                              shipment.costs.invoiceStatus === 'APPROVED' ? 'secondary' :
                              shipment.costs.invoiceStatus === 'REJECTED' ? 'destructive' :
                              'default'
                            }>
                              {shipment.costs.invoiceStatus}
                            </Badge>
                          </p>
                        </div>
                        {shipment.costs.invoiceDate && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Invoice Date</h3>
                            <p className="mt-1">{format(new Date(shipment.costs.invoiceDate), 'PP')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Status Change"
        description="Are you sure you want to change the shipment status? This may trigger notifications and affect related processes."
        confirmText="Change Status"
        onConfirm={onConfirm}
      />
    </div>
  );
}