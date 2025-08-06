import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateFulfillment, useOrderDetail, useOrders, useWarehouses } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  Package, 
  Building, 
  User, 
  Search,
  AlertCircle, 
  CheckCircle, 
  ShoppingCart,
  MapPin,
  Calendar,
  Truck,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';

// Form validation schema
const fulfillmentItemSchema = z.object({
  orderItemId: z.string().uuid('Valid order item ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  productSku: z.string().min(1, 'Product SKU is required'),
  quantityOrdered: z.number().min(1, 'Quantity ordered must be at least 1'),
  quantityToFulfill: z.number().min(1, 'Fulfillment quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  serialNumbers: z.array(z.string()).optional(),
  lotNumbers: z.array(z.string()).optional(),
  expirationDates: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const createFulfillmentSchema = z.object({
  orderId: z.string().uuid('Valid order ID is required'),
  warehouseId: z.string().uuid('Valid warehouse ID is required'),
  items: z.array(fulfillmentItemSchema).min(1, 'At least one item is required for fulfillment'),
  
  // Fulfillment details
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  expectedFulfillmentDate: z.string().optional(),
  actualFulfillmentDate: z.string().optional(),
  
  // Shipping details
  shippingMethod: z.string().optional(),
  shippingCarrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  
  // Addresses
  pickupAddress: z.object({
    name: z.string().optional(),
    company: z.string().optional(),
    street: z.string().min(1, 'Street address is required'),
    street2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email().optional(),
  }).optional(),
  
  // Options
  requireSignature: z.boolean().default(false),
  insuranceRequired: z.boolean().default(false),
  insuranceAmount: z.number().optional(),
  
  // Quality control
  qualityCheckRequired: z.boolean().default(false),
  qualityCheckNotes: z.string().optional(),
  
  // Internal details
  assignedTo: z.string().optional(),
  internalNotes: z.string().optional(),
  specialInstructions: z.string().optional(),
  
  // Automation
  autoCreateShipment: z.boolean().default(true),
  autoNotifyCustomer: z.boolean().default(true),
  autoUpdateInventory: z.boolean().default(true),
});

type CreateFulfillmentFormData = z.infer<typeof createFulfillmentSchema>;

const SHIPPING_METHODS = [
  { value: 'GROUND', label: 'Ground Shipping' },
  { value: 'EXPRESS', label: 'Express Shipping' },
  { value: 'OVERNIGHT', label: 'Overnight' },
  { value: 'TWO_DAY', label: '2-Day Shipping' },
  { value: 'SAME_DAY', label: 'Same Day Delivery' },
  { value: 'PICKUP', label: 'Customer Pickup' },
] as const;

const CARRIERS = [
  { value: 'UPS', label: 'UPS' },
  { value: 'FEDEX', label: 'FedEx' },
  { value: 'USPS', label: 'USPS' },
  { value: 'DHL', label: 'DHL' },
  { value: 'OTHER', label: 'Other' },
] as const;

export default function CreateFulfillmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [orderSearch, setOrderSearch] = useState('');
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<Set<string>>(new Set());
  
  // Get orderId from URL params if present
  const orderId = searchParams.get('orderId');
  
  // Debounced search
  const debouncedOrderSearch = useDebounce(orderSearch, 300);
  
  // Form setup
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue, 
    watch, 
    control,
    reset 
  } = useForm<CreateFulfillmentFormData>({
    resolver: zodResolver(createFulfillmentSchema),
    defaultValues: {
      orderId: orderId || '',
      priority: 'NORMAL',
      items: [],
      requireSignature: false,
      insuranceRequired: false,
      qualityCheckRequired: false,
      autoCreateShipment: true,
      autoNotifyCustomer: true,
      autoUpdateInventory: true,
    },
  });
  
  // Field arrays
  const { fields: itemFields, append: appendItem, remove: removeItem, update: updateItem } = useFieldArray({
    control,
    name: 'items',
  });
  
  // Watch form values
  const watchedOrderId = watch('orderId');
  const watchedItems = watch('items');
  const watchedInsuranceRequired = watch('insuranceRequired');
  const watchedQualityCheckRequired = watch('qualityCheckRequired');
  
  // Fetch order details if orderId is present
  const { 
    data: orderData, 
    isLoading: orderLoading 
  } = useOrderDetail(watchedOrderId, { enabled: !!watchedOrderId });
  
  // Fetch orders for search
  const { 
    data: ordersData, 
    isLoading: ordersLoading 
  } = useOrders(
    { search: debouncedOrderSearch }, 
    { enabled: !!debouncedOrderSearch }
  );
  
  // Fetch warehouses
  const { 
    data: warehousesData, 
    isLoading: warehousesLoading 
  } = useWarehouses();
  
  // Mutations
  const createFulfillmentMutation = useCreateFulfillment();
  
  // Handle form submission
  const onSubmit = async (data: CreateFulfillmentFormData) => {
    try {
      const newFulfillment = await createFulfillmentMutation.mutateAsync(data);
      toast({
        title: 'Fulfillment Created',
        description: `Fulfillment ${newFulfillment.fulfillmentNumber} has been created successfully.`,
      });
      navigate(`/orders/fulfillments/${newFulfillment.id}`);
    } catch (error) {
      console.error('Failed to create fulfillment:', error);
    }
  };
  
  // Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Order and warehouse selection
        return !!watchedOrderId && !!watch('warehouseId');
      case 2: // Items selection
        return watchedItems.length > 0;
      case 3: // Fulfillment details
        return true; // Basic validation handled by schema
      default:
        return false;
    }
  };
  
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(4, prev + 1));
    } else {
      toast.error('Please complete all required fields before proceeding.');
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders/fulfillments')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Fulfillments
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Fulfillment</h1>
            <p className="text-muted-foreground">
              Process order fulfillment from warehouse
            </p>
          </div>
        </div>
      </div>
      
      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Order & Warehouse', icon: ShoppingCart },
              { step: 2, title: 'Select Items', icon: Package },
              { step: 3, title: 'Fulfillment Details', icon: Truck },
              { step: 4, title: 'Review & Create', icon: CheckCircle },
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'border-muted-foreground text-muted-foreground'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className="text-sm font-medium">{title}</p>
                </div>
                {step < 4 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Order & Warehouse Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order & Warehouse Selection
              </CardTitle>
              <CardDescription>
                Select the order and warehouse for fulfillment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="orderId"
                      placeholder="Enter order ID or number"
                      {...register('orderId')}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowOrderDialog(true)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.orderId && (
                    <p className="text-sm text-red-600">{errors.orderId.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="warehouseId">Warehouse *</Label>
                  <Select
                    value={watch('warehouseId') || ''}
                    onValueChange={(value) => setValue('warehouseId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehousesLoading ? (
                        <SelectItem value="loading" disabled>Loading warehouses...</SelectItem>
                      ) : warehousesData?.warehouses?.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} - {warehouse.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.warehouseId && (
                    <p className="text-sm text-red-600">{errors.warehouseId.message}</p>
                  )}
                </div>
              </div>
              
              {/* Order Details */}
              {orderData?.order && (
                <div className="mt-6">
                  <Separator />
                  <div className="mt-4">
                    <h4 className="font-medium mb-3">Order Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Order Number</p>
                        <p className="font-medium">{orderData.order.orderNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Customer</p>
                        <p className="font-medium">
                          {orderData.order.customer.firstName} {orderData.order.customer.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium">{orderData.order.status}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Priority</p>
                        <p className="font-medium">{orderData.order.priority}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {orderLoading && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading order details...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Step 2: Items Selection */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Select Items to Fulfill
              </CardTitle>
              <CardDescription>
                Choose which items from the order to fulfill
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orderData?.order?.items ? (
                <div className="space-y-4">
                  {orderData.order.items.map((item) => {
                    const isSelected = selectedOrderItems.has(item.id);
                    const maxFulfillQty = item.quantity - (item.fulfilledQuantity || 0);
                    
                    return (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedOrderItems);
                              if (checked) {
                                newSelected.add(item.id);
                                // Add to form items
                                appendItem({
                                  orderItemId: item.id,
                                  productName: item.productName,
                                  productSku: item.productSku,
                                  quantityOrdered: item.quantity,
                                  quantityToFulfill: Math.min(maxFulfillQty, 1),
                                  unitPrice: item.unitPrice,
                                  serialNumbers: [],
                                  lotNumbers: [],
                                  expirationDates: [],
                                  notes: '',
                                });
                              } else {
                                newSelected.delete(item.id);
                                // Remove from form items
                                const itemIndex = watchedItems.findIndex(i => i.orderItemId === item.id);
                                if (itemIndex >= 0) {
                                  removeItem(itemIndex);
                                }
                              }
                              setSelectedOrderItems(newSelected);
                            }}
                            disabled={maxFulfillQty <= 0}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {item.productSku} • Price: ${item.unitPrice.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Ordered: {item.quantity} • Available to fulfill: {maxFulfillQty}
                            </div>
                            
                            {isSelected && (
                              <div className="mt-3 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Quantity to Fulfill</Label>
                                    <Input
                                      type="number"
                                      min="1"
                                      max={maxFulfillQty}
                                      defaultValue="1"
                                      onChange={(e) => {
                                        const qty = parseInt(e.target.value) || 1;
                                        const itemIndex = watchedItems.findIndex(i => i.orderItemId === item.id);
                                        if (itemIndex >= 0) {
                                          updateItem(itemIndex, { 
                                            ...watchedItems[itemIndex], 
                                            quantityToFulfill: qty 
                                          });
                                        }
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Serial Numbers (Optional)</Label>
                                    <Input
                                      placeholder="Enter serial numbers, comma-separated"
                                      onChange={(e) => {
                                        const serials = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                        const itemIndex = watchedItems.findIndex(i => i.orderItemId === item.id);
                                        if (itemIndex >= 0) {
                                          updateItem(itemIndex, { 
                                            ...watchedItems[itemIndex], 
                                            serialNumbers: serials 
                                          });
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Lot Numbers (Optional)</Label>
                                    <Input
                                      placeholder="Enter lot numbers, comma-separated"
                                      onChange={(e) => {
                                        const lots = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                        const itemIndex = watchedItems.findIndex(i => i.orderItemId === item.id);
                                        if (itemIndex >= 0) {
                                          updateItem(itemIndex, { 
                                            ...watchedItems[itemIndex], 
                                            lotNumbers: lots 
                                          });
                                        }
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Notes</Label>
                                    <Input
                                      placeholder="Item-specific notes"
                                      onChange={(e) => {
                                        const itemIndex = watchedItems.findIndex(i => i.orderItemId === item.id);
                                        if (itemIndex >= 0) {
                                          updateItem(itemIndex, { 
                                            ...watchedItems[itemIndex], 
                                            notes: e.target.value 
                                          });
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {orderLoading ? 'Loading order items...' : 'No order selected or items available'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Step 3: Fulfillment Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fulfillment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={watch('priority')}
                      onValueChange={(value) => setValue('priority', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expectedFulfillmentDate">Expected Fulfillment Date</Label>
                    <Input
                      id="expectedFulfillmentDate"
                      type="date"
                      {...register('expectedFulfillmentDate')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      placeholder="Staff member name or ID"
                      {...register('assignedTo')}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    placeholder="Special handling or fulfillment instructions"
                    {...register('specialInstructions')}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingMethod">Shipping Method</Label>
                    <Select
                      value={watch('shippingMethod') || ''}
                      onValueChange={(value) => setValue('shippingMethod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shipping method" />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIPPING_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shippingCarrier">Carrier</Label>
                    <Select
                      value={watch('shippingCarrier') || ''}
                      onValueChange={(value) => setValue('shippingCarrier', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARRIERS.map((carrier) => (
                          <SelectItem key={carrier.value} value={carrier.value}>
                            {carrier.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">Tracking Number (Optional)</Label>
                  <Input
                    id="trackingNumber"
                    placeholder="Enter if already available"
                    {...register('trackingNumber')}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requireSignature"
                      {...register('requireSignature')}
                    />
                    <Label htmlFor="requireSignature">Require signature on delivery</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="insuranceRequired"
                      {...register('insuranceRequired')}
                    />
                    <Label htmlFor="insuranceRequired">Insurance required</Label>
                  </div>
                  
                  {watchedInsuranceRequired && (
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
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quality Control & Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="qualityCheckRequired"
                      {...register('qualityCheckRequired')}
                    />
                    <Label htmlFor="qualityCheckRequired">Quality check required</Label>
                  </div>
                  
                  {watchedQualityCheckRequired && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="qualityCheckNotes">Quality Check Notes</Label>
                      <Textarea
                        id="qualityCheckNotes"
                        placeholder="Quality control instructions"
                        {...register('qualityCheckNotes')}
                      />
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoCreateShipment"
                      {...register('autoCreateShipment')}
                    />
                    <Label htmlFor="autoCreateShipment">Automatically create shipment</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoNotifyCustomer"
                      {...register('autoNotifyCustomer')}
                    />
                    <Label htmlFor="autoNotifyCustomer">Automatically notify customer</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoUpdateInventory"
                      {...register('autoUpdateInventory')}
                    />
                    <Label htmlFor="autoUpdateInventory">Automatically update inventory</Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="internalNotes">Internal Notes</Label>
                  <Textarea
                    id="internalNotes"
                    placeholder="Internal notes (not visible to customer)"
                    {...register('internalNotes')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Step 4: Review & Create */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Review Fulfillment Details
              </CardTitle>
              <CardDescription>
                Please review all details before creating the fulfillment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div>
                <h4 className="font-medium mb-3">Order Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Order Number</p>
                    <p className="font-medium">{orderData?.order?.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">
                      {orderData?.order?.customer.firstName} {orderData?.order?.customer.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Warehouse</p>
                    <p className="font-medium">
                      {warehousesData?.warehouses?.find(w => w.id === watch('warehouseId'))?.name}
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Items Summary */}
              <div>
                <h4 className="font-medium mb-3">Items to Fulfill ({watchedItems.length})</h4>
                <div className="space-y-2">
                  {watchedItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm border rounded p-3">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-muted-foreground ml-2">(SKU: {item.productSku})</span>
                      </div>
                      <div className="text-right">
                        <div>Qty: {item.quantityToFulfill}</div>
                        <div className="text-muted-foreground">
                          ${(item.quantityToFulfill * item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Fulfillment Summary */}
              <div>
                <h4 className="font-medium mb-3">Fulfillment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Priority</p>
                    <p className="font-medium">{watch('priority')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Shipping Method</p>
                    <p className="font-medium">
                      {SHIPPING_METHODS.find(m => m.value === watch('shippingMethod'))?.label || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Carrier</p>
                    <p className="font-medium">
                      {CARRIERS.find(c => c.value === watch('shippingCarrier'))?.label || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Options</p>
                    <div className="text-xs space-y-1">
                      {watch('requireSignature') && <div>✓ Signature required</div>}
                      {watchedInsuranceRequired && <div>✓ Insurance required</div>}
                      {watchedQualityCheckRequired && <div>✓ Quality check required</div>}
                      {watch('autoCreateShipment') && <div>✓ Auto-create shipment</div>}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Navigation Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={createFulfillmentMutation.isPending}
                    className="gap-2"
                  >
                    {createFulfillmentMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Create Fulfillment
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
      
      {/* Order Search Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search Orders</DialogTitle>
            <DialogDescription>
              Search for an order to create fulfillment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search by order number, customer name, email..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
            />
            
            {ordersLoading && (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Searching...
              </div>
            )}
            
            {ordersData?.orders && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {ordersData.orders.map((order) => (
                  <div
                    key={order.id}
                    className="border rounded p-3 cursor-pointer hover:bg-muted"
                    onClick={() => {
                      setValue('orderId', order.id);
                      setShowOrderDialog(false);
                    }}
                  >
                    <div className="font-medium">{order.orderNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer.firstName} {order.customer.lastName} • {order.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 