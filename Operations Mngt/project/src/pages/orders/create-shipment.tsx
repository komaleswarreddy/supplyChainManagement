import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateShipment, useOrderDetail, useCarriers } from '@/services/order';
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
  Plus, 
  Save, 
  RefreshCw, 
  Truck, 
  Package, 
  MapPin, 
  User, 
  Building, 
  Calendar, 
  DollarSign, 
  Ruler, 
  Weight, 
  AlertCircle, 
  CheckCircle, 
  Search,
  FileText,
  Phone,
  Mail,
  Globe,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';

// Form validation schema
const addressSchema = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  street: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
});

const packageSchema = z.object({
  type: z.string().min(1, 'Package type is required'),
  weight: z.number().min(0.1, 'Weight must be greater than 0'),
  weightUnit: z.enum(['LB', 'KG']).default('LB'),
  length: z.number().min(0.1, 'Length must be greater than 0'),
  width: z.number().min(0.1, 'Width must be greater than 0'),
  height: z.number().min(0.1, 'Height must be greater than 0'),
  dimensionUnit: z.enum(['IN', 'CM']).default('IN'),
  value: z.number().min(0, 'Value must be non-negative').optional(),
  description: z.string().optional(),
});

const shipmentItemSchema = z.object({
  orderItemId: z.string().uuid(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  productName: z.string().min(1, 'Product name is required'),
  productSku: z.string().min(1, 'Product SKU is required'),
  weight: z.number().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
});

const createShipmentSchema = z.object({
  orderId: z.string().uuid('Valid order ID is required'),
  fulfillmentId: z.string().uuid().optional(),
  carrierId: z.string().uuid('Carrier is required'),
  serviceLevel: z.string().min(1, 'Service level is required'),
  
  // Addresses
  originAddress: addressSchema,
  destinationAddress: addressSchema,
  
  // Package details
  packages: z.array(packageSchema).min(1, 'At least one package is required'),
  
  // Items
  items: z.array(shipmentItemSchema).min(1, 'At least one item is required'),
  
  // Shipping details
  requestedPickupDate: z.string().optional(),
  requestedDeliveryDate: z.string().optional(),
  specialInstructions: z.string().optional(),
  
  // Options
  signatureRequired: z.boolean().default(false),
  saturdayDelivery: z.boolean().default(false),
  insured: z.boolean().default(false),
  insuranceAmount: z.number().optional(),
  
  // References
  customerReference: z.string().optional(),
  invoiceNumber: z.string().optional(),
  poNumber: z.string().optional(),
  
  // Notes
  notes: z.string().optional(),
});

type CreateShipmentFormData = z.infer<typeof createShipmentSchema>;

const PACKAGE_TYPES = [
  { value: 'BOX', label: 'Box' },
  { value: 'ENVELOPE', label: 'Envelope' },
  { value: 'TUBE', label: 'Tube' },
  { value: 'PAK', label: 'Pak' },
  { value: 'PALLET', label: 'Pallet' },
  { value: 'OTHER', label: 'Other' },
];

const SERVICE_LEVELS = [
  { value: 'GROUND', label: 'Ground' },
  { value: 'EXPRESS', label: 'Express' },
  { value: 'OVERNIGHT', label: 'Overnight' },
  { value: 'TWO_DAY', label: '2-Day' },
  { value: 'ECONOMY', label: 'Economy' },
];

export default function CreateShipmentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOrderItems, setSelectedOrderItems] = useState<Set<string>>(new Set());
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  
  // Get orderId from URL params if present
  const orderId = searchParams.get('orderId');
  const fulfillmentId = searchParams.get('fulfillmentId');
  
  // Form setup
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue, 
    watch, 
    control,
    reset 
  } = useForm<CreateShipmentFormData>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      orderId: orderId || '',
      fulfillmentId: fulfillmentId || '',
      packages: [
        {
          type: 'BOX',
          weight: 1,
          weightUnit: 'LB',
          length: 12,
          width: 12,
          height: 6,
          dimensionUnit: 'IN',
        }
      ],
      items: [],
      signatureRequired: false,
      saturdayDelivery: false,
      insured: false,
    },
  });
  
  // Watch form values
  const watchedOrderId = watch('orderId');
  const watchedCarrierId = watch('carrierId');
  const watchedPackages = watch('packages');
  const watchedInsured = watch('insured');
  
  // Fetch order details if orderId is present
  const { 
    data: orderData, 
    isLoading: orderLoading 
  } = useOrderDetail(watchedOrderId, { enabled: !!watchedOrderId });
  
  // Fetch carriers
  const { 
    data: carriersData, 
    isLoading: carriersLoading 
  } = useCarriers();
  
  // Mutations
  const createShipmentMutation = useCreateShipment();
  
  // Initialize form with order data
  useEffect(() => {
    if (orderData?.order) {
      const order = orderData.order;
      
      // Set addresses
      setValue('destinationAddress', {
        name: `${order.customer.firstName} ${order.customer.lastName}`,
        company: order.customer.company,
        street: order.shippingAddress.street,
        street2: order.shippingAddress.street2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        country: order.shippingAddress.country,
        postalCode: order.shippingAddress.postalCode,
        contactPerson: `${order.customer.firstName} ${order.customer.lastName}`,
        contactPhone: order.customer.phone,
        contactEmail: order.customer.email,
      });
      
      // Set items from order
      if (order.items && order.items.length > 0) {
        const shipmentItems = order.items.map(item => ({
          orderItemId: item.id,
          quantity: item.quantity - (item.shippedQuantity || 0),
          productName: item.productName,
          productSku: item.productSku,
          weight: item.weight,
          dimensions: item.dimensions,
        })).filter(item => item.quantity > 0);
        
        setValue('items', shipmentItems);
        setSelectedOrderItems(new Set(shipmentItems.map(item => item.orderItemId)));
      }
      
      // Set references
      setValue('customerReference', order.orderNumber);
      setValue('poNumber', order.poNumber);
    }
  }, [orderData, setValue]);
  
  // Handle form submission
  const onSubmit = async (data: CreateShipmentFormData) => {
    try {
      const newShipment = await createShipmentMutation.mutateAsync(data);
      toast({
        title: 'Shipment Created',
        description: `Shipment ${newShipment.shipmentNumber} has been created successfully.`,
      });
      navigate(`/orders/shipments/${newShipment.id}`);
    } catch (error) {
      console.error('Failed to create shipment:', error);
    }
  };
  
  // Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Order and carrier selection
        return !!watchedOrderId && !!watchedCarrierId;
      case 2: // Items and packages
        return watch('items').length > 0 && watchedPackages.length > 0;
      case 3: // Addresses and options
        return true; // Addresses are validated by schema
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
  
  const addPackage = () => {
    const currentPackages = watch('packages');
    setValue('packages', [
      ...currentPackages,
      {
        type: 'BOX',
        weight: 1,
        weightUnit: 'LB' as const,
        length: 12,
        width: 12,
        height: 6,
        dimensionUnit: 'IN' as const,
      }
    ]);
  };
  
  const removePackage = (index: number) => {
    const currentPackages = watch('packages');
    setValue('packages', currentPackages.filter((_, i) => i !== index));
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
            onClick={() => navigate('/orders/shipments')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shipments
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Shipment</h1>
            <p className="text-muted-foreground">
              Create a new shipment for order fulfillment
            </p>
          </div>
        </div>
      </div>
      
      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Order & Carrier', icon: ShoppingCart },
              { step: 2, title: 'Items & Packages', icon: Package },
              { step: 3, title: 'Addresses & Options', icon: MapPin },
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
        {/* Step 1: Order & Carrier Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Selection
                </CardTitle>
                <CardDescription>
                  Select the order and carrier for this shipment
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
                    <Label htmlFor="carrierId">Carrier *</Label>
                    <Select
                      value={watchedCarrierId}
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
                  
                  <div className="space-y-2">
                    <Label htmlFor="fulfillmentId">Fulfillment (Optional)</Label>
                    <Input
                      id="fulfillmentId"
                      placeholder="Link to fulfillment"
                      {...register('fulfillmentId')}
                    />
                  </div>
                </div>
                
                {/* Order Details */}
                {orderData?.order && (
                  <div className="mt-6">
                    <Separator />
                    <div className="mt-4">
                      <h4 className="font-medium mb-3">Order Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                          <p className="text-muted-foreground">Total Amount</p>
                          <p className="font-medium">${orderData.order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Step 2: Items & Packages */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Items Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items to Ship
                </CardTitle>
                <CardDescription>
                  Select items from the order to include in this shipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orderData?.order?.items ? (
                  <div className="space-y-4">
                    {orderData.order.items.map((item) => {
                      const remainingQty = item.quantity - (item.shippedQuantity || 0);
                      const isSelected = selectedOrderItems.has(item.id);
                      
                      return (
                        <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedOrderItems);
                              if (checked) {
                                newSelected.add(item.id);
                              } else {
                                newSelected.delete(item.id);
                              }
                              setSelectedOrderItems(newSelected);
                              
                              // Update form items
                              const currentItems = watch('items');
                              if (checked) {
                                setValue('items', [
                                  ...currentItems,
                                  {
                                    orderItemId: item.id,
                                    quantity: remainingQty,
                                    productName: item.productName,
                                    productSku: item.productSku,
                                    weight: item.weight,
                                    dimensions: item.dimensions,
                                  }
                                ]);
                              } else {
                                setValue('items', currentItems.filter(i => i.orderItemId !== item.id));
                              }
                            }}
                            disabled={remainingQty <= 0}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {item.productSku} • Available: {remainingQty} of {item.quantity}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-20">
                              <Input
                                type="number"
                                min="1"
                                max={remainingQty}
                                defaultValue={remainingQty}
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value) || 1;
                                  const currentItems = watch('items');
                                  const updatedItems = currentItems.map(i => 
                                    i.orderItemId === item.id 
                                      ? { ...i, quantity: newQty }
                                      : i
                                  );
                                  setValue('items', updatedItems);
                                }}
                              />
                            </div>
                          )}
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
            
            {/* Packages */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Packages
                  </CardTitle>
                  <CardDescription>
                    Define package details for shipping
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPackage}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Package
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {watchedPackages.map((pkg, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Package {index + 1}</h4>
                        {watchedPackages.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePackage(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Package Type</Label>
                          <Select
                            value={pkg.type}
                            onValueChange={(value) => {
                              const packages = watch('packages');
                              packages[index].type = value;
                              setValue('packages', packages);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PACKAGE_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Weight</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={pkg.weight}
                              onChange={(e) => {
                                const packages = watch('packages');
                                packages[index].weight = parseFloat(e.target.value) || 0.1;
                                setValue('packages', packages);
                              }}
                            />
                            <Select
                              value={pkg.weightUnit}
                              onValueChange={(value: 'LB' | 'KG') => {
                                const packages = watch('packages');
                                packages[index].weightUnit = value;
                                setValue('packages', packages);
                              }}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LB">LB</SelectItem>
                                <SelectItem value="KG">KG</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Dimensions (L×W×H)</Label>
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={pkg.length}
                              onChange={(e) => {
                                const packages = watch('packages');
                                packages[index].length = parseFloat(e.target.value) || 0.1;
                                setValue('packages', packages);
                              }}
                              className="w-16"
                            />
                            <Input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={pkg.width}
                              onChange={(e) => {
                                const packages = watch('packages');
                                packages[index].width = parseFloat(e.target.value) || 0.1;
                                setValue('packages', packages);
                              }}
                              className="w-16"
                            />
                            <Input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={pkg.height}
                              onChange={(e) => {
                                const packages = watch('packages');
                                packages[index].height = parseFloat(e.target.value) || 0.1;
                                setValue('packages', packages);
                              }}
                              className="w-16"
                            />
                            <Select
                              value={pkg.dimensionUnit}
                              onValueChange={(value: 'IN' | 'CM') => {
                                const packages = watch('packages');
                                packages[index].dimensionUnit = value;
                                setValue('packages', packages);
                              }}
                            >
                              <SelectTrigger className="w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="IN">IN</SelectItem>
                                <SelectItem value="CM">CM</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Declared Value</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={pkg.value || ''}
                            onChange={(e) => {
                              const packages = watch('packages');
                              packages[index].value = parseFloat(e.target.value) || undefined;
                              setValue('packages', packages);
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Label>Package Description</Label>
                        <Input
                          placeholder="Optional package description"
                          value={pkg.description || ''}
                          onChange={(e) => {
                            const packages = watch('packages');
                            packages[index].description = e.target.value;
                            setValue('packages', packages);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Step 3: Addresses & Options */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Addresses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Origin Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="originName">Contact Name</Label>
                      <Input
                        id="originName"
                        {...register('originAddress.name')}
                        placeholder="Contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originCompany">Company</Label>
                      <Input
                        id="originCompany"
                        {...register('originAddress.company')}
                        placeholder="Company name"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="originStreet">Street Address *</Label>
                    <Input
                      id="originStreet"
                      {...register('originAddress.street')}
                      placeholder="Street address"
                    />
                    {errors.originAddress?.street && (
                      <p className="text-sm text-red-600">{errors.originAddress.street.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="originStreet2">Apartment, suite, etc.</Label>
                    <Input
                      id="originStreet2"
                      {...register('originAddress.street2')}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="originCity">City *</Label>
                      <Input
                        id="originCity"
                        {...register('originAddress.city')}
                        placeholder="City"
                      />
                      {errors.originAddress?.city && (
                        <p className="text-sm text-red-600">{errors.originAddress.city.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originState">State *</Label>
                      <Input
                        id="originState"
                        {...register('originAddress.state')}
                        placeholder="State"
                      />
                      {errors.originAddress?.state && (
                        <p className="text-sm text-red-600">{errors.originAddress.state.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="originPostalCode">Postal Code *</Label>
                      <Input
                        id="originPostalCode"
                        {...register('originAddress.postalCode')}
                        placeholder="Postal code"
                      />
                      {errors.originAddress?.postalCode && (
                        <p className="text-sm text-red-600">{errors.originAddress.postalCode.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originCountry">Country *</Label>
                      <Input
                        id="originCountry"
                        {...register('originAddress.country')}
                        placeholder="Country"
                        defaultValue="US"
                      />
                      {errors.originAddress?.country && (
                        <p className="text-sm text-red-600">{errors.originAddress.country.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="originContactPhone">Contact Phone</Label>
                      <Input
                        id="originContactPhone"
                        {...register('originAddress.contactPhone')}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originContactEmail">Contact Email</Label>
                      <Input
                        id="originContactEmail"
                        type="email"
                        {...register('originAddress.contactEmail')}
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Destination Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destName">Contact Name</Label>
                      <Input
                        id="destName"
                        {...register('destinationAddress.name')}
                        placeholder="Contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destCompany">Company</Label>
                      <Input
                        id="destCompany"
                        {...register('destinationAddress.company')}
                        placeholder="Company name"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="destStreet">Street Address *</Label>
                    <Input
                      id="destStreet"
                      {...register('destinationAddress.street')}
                      placeholder="Street address"
                    />
                    {errors.destinationAddress?.street && (
                      <p className="text-sm text-red-600">{errors.destinationAddress.street.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="destStreet2">Apartment, suite, etc.</Label>
                    <Input
                      id="destStreet2"
                      {...register('destinationAddress.street2')}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destCity">City *</Label>
                      <Input
                        id="destCity"
                        {...register('destinationAddress.city')}
                        placeholder="City"
                      />
                      {errors.destinationAddress?.city && (
                        <p className="text-sm text-red-600">{errors.destinationAddress.city.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destState">State *</Label>
                      <Input
                        id="destState"
                        {...register('destinationAddress.state')}
                        placeholder="State"
                      />
                      {errors.destinationAddress?.state && (
                        <p className="text-sm text-red-600">{errors.destinationAddress.state.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destPostalCode">Postal Code *</Label>
                      <Input
                        id="destPostalCode"
                        {...register('destinationAddress.postalCode')}
                        placeholder="Postal code"
                      />
                      {errors.destinationAddress?.postalCode && (
                        <p className="text-sm text-red-600">{errors.destinationAddress.postalCode.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destCountry">Country *</Label>
                      <Input
                        id="destCountry"
                        {...register('destinationAddress.country')}
                        placeholder="Country"
                        defaultValue="US"
                      />
                      {errors.destinationAddress?.country && (
                        <p className="text-sm text-red-600">{errors.destinationAddress.country.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destContactPhone">Contact Phone</Label>
                      <Input
                        id="destContactPhone"
                        {...register('destinationAddress.contactPhone')}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destContactEmail">Contact Email</Label>
                      <Input
                        id="destContactEmail"
                        type="email"
                        {...register('destinationAddress.contactEmail')}
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Shipping Options */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requestedPickupDate">Requested Pickup Date</Label>
                    <Input
                      id="requestedPickupDate"
                      type="date"
                      {...register('requestedPickupDate')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="requestedDeliveryDate">Requested Delivery Date</Label>
                    <Input
                      id="requestedDeliveryDate"
                      type="date"
                      {...register('requestedDeliveryDate')}
                    />
                  </div>
                </div>
                
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
                      id="saturdayDelivery"
                      {...register('saturdayDelivery')}
                    />
                    <Label htmlFor="saturdayDelivery">Saturday Delivery</Label>
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
              </CardContent>
            </Card>
            
            {/* References */}
            <Card>
              <CardHeader>
                <CardTitle>References</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerReference">Customer Reference</Label>
                    <Input
                      id="customerReference"
                      {...register('customerReference')}
                      placeholder="Customer reference"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      {...register('invoiceNumber')}
                      placeholder="Invoice number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="poNumber">PO Number</Label>
                    <Input
                      id="poNumber"
                      {...register('poNumber')}
                      placeholder="Purchase order number"
                    />
                  </div>
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
        )}
        
        {/* Step 4: Review & Create */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Review Shipment Details
                </CardTitle>
                <CardDescription>
                  Please review all details before creating the shipment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order & Carrier Summary */}
                <div>
                  <h4 className="font-medium mb-3">Order & Carrier</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Order</p>
                      <p className="font-medium">{orderData?.order?.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Carrier</p>
                      <p className="font-medium">
                        {carriersData?.carriers?.find(c => c.id === watchedCarrierId)?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Service Level</p>
                      <p className="font-medium">
                        {SERVICE_LEVELS.find(s => s.value === watch('serviceLevel'))?.label}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Items Summary */}
                <div>
                  <h4 className="font-medium mb-3">Items ({watch('items').length})</h4>
                  <div className="space-y-2">
                    {watch('items').map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.productName} (SKU: {item.productSku})</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Packages Summary */}
                <div>
                  <h4 className="font-medium mb-3">Packages ({watchedPackages.length})</h4>
                  <div className="space-y-2">
                    {watchedPackages.map((pkg, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">Package {index + 1}:</span>{' '}
                        {pkg.type}, {pkg.weight} {pkg.weightUnit},{' '}
                        {pkg.length}×{pkg.width}×{pkg.height} {pkg.dimensionUnit}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Addresses Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Origin</h4>
                    <div className="text-sm space-y-1">
                      {watch('originAddress.name') && <p>{watch('originAddress.name')}</p>}
                      {watch('originAddress.company') && <p>{watch('originAddress.company')}</p>}
                      <p>{watch('originAddress.street')}</p>
                      {watch('originAddress.street2') && <p>{watch('originAddress.street2')}</p>}
                      <p>
                        {watch('originAddress.city')}, {watch('originAddress.state')} {watch('originAddress.postalCode')}
                      </p>
                      <p>{watch('originAddress.country')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Destination</h4>
                    <div className="text-sm space-y-1">
                      {watch('destinationAddress.name') && <p>{watch('destinationAddress.name')}</p>}
                      {watch('destinationAddress.company') && <p>{watch('destinationAddress.company')}</p>}
                      <p>{watch('destinationAddress.street')}</p>
                      {watch('destinationAddress.street2') && <p>{watch('destinationAddress.street2')}</p>}
                      <p>
                        {watch('destinationAddress.city')}, {watch('destinationAddress.state')} {watch('destinationAddress.postalCode')}
                      </p>
                      <p>{watch('destinationAddress.country')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
                    disabled={createShipmentMutation.isPending}
                    className="gap-2"
                  >
                    {createShipmentMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Create Shipment
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 