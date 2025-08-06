import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useShipmentDetail, useUpdateShipment, useCarriers } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Truck, 
  AlertCircle, 
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { ShipmentStatus } from '@/types/order';

// Form validation schema
const editShipmentSchema = z.object({
  carrierId: z.string().uuid('Valid carrier ID is required'),
  serviceLevel: z.string().min(1, 'Service level is required'),
  trackingNumber: z.string().optional(),
  status: z.enum(['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION', 'RETURNED']),
  estimatedDeliveryDate: z.string().optional(),
  actualDeliveryDate: z.string().optional(),
  signatureRequired: z.boolean().default(false),
  insured: z.boolean().default(false),
  insuranceAmount: z.number().optional(),
  specialInstructions: z.string().optional(),
  notes: z.string().optional(),
});

type EditShipmentFormData = z.infer<typeof editShipmentSchema>;

const SERVICE_LEVELS = [
  { value: 'GROUND', label: 'Ground' },
  { value: 'EXPRESS', label: 'Express' },
  { value: 'OVERNIGHT', label: 'Overnight' },
  { value: 'TWO_DAY', label: '2-Day' },
  { value: 'ECONOMY', label: 'Economy' },
];

const SHIPMENT_STATUSES = [
  { value: 'CREATED', label: 'Created' },
  { value: 'PICKED_UP', label: 'Picked Up' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'EXCEPTION', label: 'Exception' },
  { value: 'RETURNED', label: 'Returned' },
];

export default function EditShipmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<EditShipmentFormData | null>(null);
  
  // Fetch shipment data
  const { 
    data: shipment, 
    isLoading, 
    error, 
    refetch 
  } = useShipmentDetail(id!);
  
  // Fetch carriers
  const { 
    data: carriersData, 
    isLoading: carriersLoading 
  } = useCarriers();
  
  // Form setup
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue, 
    watch, 
    reset 
  } = useForm<EditShipmentFormData>({
    resolver: zodResolver(editShipmentSchema),
  });
  
  // Watch form values for changes detection
  const watchedValues = watch();
  const watchedInsured = watch('insured');
  
  // Mutations
  const updateShipmentMutation = useUpdateShipment();
  
  // Initialize form with shipment data
  useEffect(() => {
    if (shipment) {
      const formData: EditShipmentFormData = {
        carrierId: shipment.carrierId,
        serviceLevel: shipment.serviceLevel,
        trackingNumber: shipment.trackingNumber || '',
        status: shipment.status,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate || '',
        actualDeliveryDate: shipment.actualDeliveryDate || '',
        signatureRequired: shipment.signatureRequired || false,
        insured: shipment.insured || false,
        insuranceAmount: shipment.insuranceAmount || undefined,
        specialInstructions: shipment.specialInstructions || '',
        notes: shipment.notes || '',
      };
      
      reset(formData);
      setOriginalData(formData);
    }
  }, [shipment, reset]);
  
  // Check for changes
  useEffect(() => {
    if (originalData) {
      const hasChanged = JSON.stringify(watchedValues) !== JSON.stringify(originalData);
      setHasChanges(hasChanged);
    }
  }, [watchedValues, originalData]);
  
  if (!id) {
    return <div>Invalid shipment ID</div>;
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading shipment details...</span>
        </div>
      </div>
    );
  }
  
  if (error || !shipment) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load shipment details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Handle form submission
  const onSubmit = async (data: EditShipmentFormData) => {
    try {
      await updateShipmentMutation.mutateAsync({ id: shipment.id, data });
      setHasChanges(false);
      setOriginalData(data);
    } catch (error) {
      console.error('Failed to update shipment:', error);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied to clipboard: ${text}`);
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/orders/shipments/${id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shipment
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Shipment</h1>
            <p className="text-muted-foreground">
              {shipment.shipmentNumber}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Changes Alert */}
      {hasChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Make sure to save before leaving this page.
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carrierId">Carrier *</Label>
                    <Select
                      value={watch('carrierId')}
                      onValueChange={(value) => setValue('carrierId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        {carriersLoading ? (
                          <SelectItem value="loading" disabled>Loading carriers...</SelectItem>
                        ) : carriersData?.carriers?.map((carrier) => (
                          <SelectItem key={carrier.id} value={carrier.id}>
                            {carrier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.carrierId && (
                      <p className="text-sm text-red-600">{errors.carrierId.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serviceLevel">Service Level *</Label>
                    <Select
                      value={watch('serviceLevel')}
                      onValueChange={(value) => setValue('serviceLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service level" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_LEVELS.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            {service.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.serviceLevel && (
                      <p className="text-sm text-red-600">{errors.serviceLevel.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trackingNumber">Tracking Number</Label>
                    <Input
                      id="trackingNumber"
                      placeholder="Enter tracking number"
                      {...register('trackingNumber')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={watch('status')}
                      onValueChange={(value) => setValue('status', value as ShipmentStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIPMENT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</Label>
                    <Input
                      id="estimatedDeliveryDate"
                      type="date"
                      {...register('estimatedDeliveryDate')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="actualDeliveryDate">Actual Delivery Date</Label>
                    <Input
                      id="actualDeliveryDate"
                      type="date"
                      {...register('actualDeliveryDate')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="signatureRequired"
                      {...register('signatureRequired')}
                    />
                    <Label htmlFor="signatureRequired">Signature Required</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="insured"
                      {...register('insured')}
                    />
                    <Label htmlFor="insured">Insurance Required</Label>
                  </div>
                  
                  {watchedInsured && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="insuranceAmount">Insurance Amount</Label>
                      <Input
                        id="insuranceAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...register('insuranceAmount', { valueAsNumber: true })}
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    placeholder="Any special handling instructions"
                    {...register('specialInstructions')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Internal notes (not visible to customer)"
                    {...register('notes')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Order Number</p>
                  <p className="font-medium">{shipment.orderId}</p>
                </div>
                {shipment.fulfillmentId && (
                  <div>
                    <p className="text-muted-foreground">Fulfillment ID</p>
                    <p className="font-medium">{shipment.fulfillmentId}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items ({shipment.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shipment.items.map((item) => (
                    <div key={item.id} className="text-sm">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-muted-foreground">
                        SKU: {item.productSku} • Qty: {item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    type="submit"
                    disabled={updateShipmentMutation.isPending || !hasChanges}
                    className="w-full gap-2"
                  >
                    {updateShipmentMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/orders/shipments/${id}`)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
} 