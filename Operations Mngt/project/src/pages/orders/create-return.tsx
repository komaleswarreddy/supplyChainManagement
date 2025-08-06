import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateReturn, useOrderDetail, useOrders } from '@/services/order';
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
  RotateCcw, 
  Package, 
  User, 
  Search,
  AlertCircle, 
  CheckCircle, 
  ShoppingCart,
  FileText,
  Camera,
  Upload,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import { ReturnReason } from '@/types/order';

// Form validation schema
const returnItemSchema = z.object({
  orderItemId: z.string().uuid('Valid order item ID is required'),
  productName: z.string().min(1, 'Product name is required'),
  productSku: z.string().min(1, 'Product SKU is required'),
  quantityOrdered: z.number().min(1, 'Quantity ordered must be at least 1'),
  quantityToReturn: z.number().min(1, 'Return quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  reason: z.enum(['DEFECTIVE', 'WRONG_SIZE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'BETTER_PRICE', 'QUALITY_ISSUES', 'LATE_DELIVERY', 'OTHER']),
  condition: z.enum(['NEW', 'USED', 'DAMAGED', 'DEFECTIVE']),
  notes: z.string().optional(),
});

const createReturnSchema = z.object({
  orderId: z.string().uuid('Valid order ID is required'),
  customerId: z.string().uuid('Valid customer ID is required'),
  reason: z.enum(['DEFECTIVE', 'WRONG_SIZE', 'WRONG_ITEM', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'BETTER_PRICE', 'QUALITY_ISSUES', 'LATE_DELIVERY', 'OTHER']),
  items: z.array(returnItemSchema).min(1, 'At least one item is required for return'),
  customerNotes: z.string().optional(),
  internalNotes: z.string().optional(),
  images: z.array(z.string()).optional(),
  refundMethod: z.enum(['ORIGINAL_PAYMENT', 'STORE_CREDIT', 'EXCHANGE']).default('ORIGINAL_PAYMENT'),
  expectedRefundAmount: z.number().min(0, 'Expected refund amount must be non-negative'),
  restockingFee: z.number().min(0, 'Restocking fee must be non-negative').default(0),
  returnShippingPaid: z.boolean().default(false),
  exchangeRequested: z.boolean().default(false),
  exchangeItemId: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
});

type CreateReturnFormData = z.infer<typeof createReturnSchema>;

const RETURN_REASONS = [
  { value: 'DEFECTIVE', label: 'Defective/Damaged' },
  { value: 'WRONG_SIZE', label: 'Wrong Size' },
  { value: 'WRONG_ITEM', label: 'Wrong Item' },
  { value: 'NOT_AS_DESCRIBED', label: 'Not As Described' },
  { value: 'CHANGED_MIND', label: 'Changed Mind' },
  { value: 'BETTER_PRICE', label: 'Found Better Price' },
  { value: 'QUALITY_ISSUES', label: 'Quality Issues' },
  { value: 'LATE_DELIVERY', label: 'Late Delivery' },
  { value: 'OTHER', label: 'Other' },
] as const;

const ITEM_CONDITIONS = [
  { value: 'NEW', label: 'New/Unused' },
  { value: 'USED', label: 'Used' },
  { value: 'DAMAGED', label: 'Damaged' },
  { value: 'DEFECTIVE', label: 'Defective' },
] as const;

const REFUND_METHODS = [
  { value: 'ORIGINAL_PAYMENT', label: 'Original Payment Method' },
  { value: 'STORE_CREDIT', label: 'Store Credit' },
  { value: 'EXCHANGE', label: 'Exchange for Different Item' },
] as const;

export default function CreateReturnPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [orderSearch, setOrderSearch] = useState('');
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<Set<string>>(new Set());
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
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
  } = useForm<CreateReturnFormData>({
    resolver: zodResolver(createReturnSchema),
    defaultValues: {
      orderId: orderId || '',
      reason: 'DEFECTIVE',
      items: [],
      refundMethod: 'ORIGINAL_PAYMENT',
      expectedRefundAmount: 0,
      restockingFee: 0,
      returnShippingPaid: false,
      exchangeRequested: false,
      priority: 'NORMAL',
      images: [],
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
  const watchedRefundMethod = watch('refundMethod');
  const watchedExchangeRequested = watch('exchangeRequested');
  
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
  
  // Mutations
  const createReturnMutation = useCreateReturn();
  
  // Initialize form with order data
  useEffect(() => {
    if (orderData?.order) {
      const order = orderData.order;
      
      setValue('customerId', order.customerId);
      
      // Calculate expected refund amount
      const totalRefund = watchedItems.reduce((sum, item) => {
        return sum + (item.quantityToReturn * item.unitPrice);
      }, 0);
      setValue('expectedRefundAmount', totalRefund - watch('restockingFee'));
    }
  }, [orderData, watchedItems, setValue, watch]);
  
  // Handle form submission
  const onSubmit = async (data: CreateReturnFormData) => {
    try {
      const newReturn = await createReturnMutation.mutateAsync(data);
      toast({
        title: 'Return Created',
        description: `Return ${newReturn.returnNumber} has been created successfully.`,
      });
      navigate(`/orders/returns/${newReturn.id}`);
    } catch (error) {
      console.error('Failed to create return:', error);
    }
  };
  
  // Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Order selection
        return !!watchedOrderId && !!orderData?.order;
      case 2: // Items selection
        return watchedItems.length > 0;
      case 3: // Return details
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
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In a real app, you would upload these to a storage service
      // For now, we'll simulate with data URLs
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setUploadedImages(prev => [...prev, dataUrl]);
          setValue('images', [...uploadedImages, dataUrl]);
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setValue('images', newImages);
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
            onClick={() => navigate('/orders/returns')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Returns
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Return</h1>
            <p className="text-muted-foreground">
              Process a return request for an order
            </p>
          </div>
        </div>
      </div>
      
      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Select Order', icon: ShoppingCart },
              { step: 2, title: 'Select Items', icon: Package },
              { step: 3, title: 'Return Details', icon: FileText },
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
        {/* Step 1: Order Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Select Order
              </CardTitle>
              <CardDescription>
                Choose the order for which you want to create a return
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="orderId">Order ID or Number</Label>
                  <Input
                    id="orderId"
                    placeholder="Enter order ID or number"
                    {...register('orderId')}
                  />
                  {errors.orderId && (
                    <p className="text-sm text-red-600 mt-1">{errors.orderId.message}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowOrderDialog(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
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
                        <p className="text-muted-foreground">Order Date</p>
                        <p className="font-medium">
                          {new Date(orderData.order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium">{orderData.order.status}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-medium">${orderData.order.totalAmount.toFixed(2)}</p>
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
                Select Items to Return
              </CardTitle>
              <CardDescription>
                Choose which items from the order you want to return
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orderData?.order?.items ? (
                <div className="space-y-4">
                  {orderData.order.items.map((item) => {
                    const isSelected = selectedOrderItems.has(item.id);
                    const maxReturnQty = item.quantity - (item.returnedQuantity || 0);
                    
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
                                  quantityToReturn: Math.min(maxReturnQty, 1),
                                  unitPrice: item.unitPrice,
                                  reason: 'DEFECTIVE',
                                  condition: 'USED',
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
                            disabled={maxReturnQty <= 0}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {item.productSku} • Price: ${item.unitPrice.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Ordered: {item.quantity} • Available to return: {maxReturnQty}
                            </div>
                            
                            {isSelected && (
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-xs">Quantity to Return</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max={maxReturnQty}
                                    defaultValue="1"
                                    onChange={(e) => {
                                      const qty = parseInt(e.target.value) || 1;
                                      const itemIndex = watchedItems.findIndex(i => i.orderItemId === item.id);
                                      if (itemIndex >= 0) {
                                        updateItem(itemIndex, { 
                                          ...watchedItems[itemIndex], 
                                          quantityToReturn: qty 
                                        });
                                      }
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Reason</Label>
                                  <Select
                                    defaultValue="DEFECTIVE"
                                    onValueChange={(value) => {
                                      const itemIndex = watchedItems.findIndex(i => i.orderItemId === item.id);
                                      if (itemIndex >= 0) {
                                        updateItem(itemIndex, { 
                                          ...watchedItems[itemIndex], 
                                          reason: value as ReturnReason 
                                        });
                                      }
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {RETURN_REASONS.map((reason) => (
                                        <SelectItem key={reason.value} value={reason.value}>
                                          {reason.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">Condition</Label>
                                  <Select
                                    defaultValue="USED"
                                    onValueChange={(value) => {
                                      const itemIndex = watchedItems.findIndex(i => i.orderItemId === item.id);
                                      if (itemIndex >= 0) {
                                        updateItem(itemIndex, { 
                                          ...watchedItems[itemIndex], 
                                          condition: value as any 
                                        });
                                      }
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ITEM_CONDITIONS.map((condition) => (
                                        <SelectItem key={condition.value} value={condition.value}>
                                          {condition.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
        
        {/* Step 3: Return Details */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Return Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Primary Reason</Label>
                    <Select
                      value={watch('reason')}
                      onValueChange={(value) => setValue('reason', value as ReturnReason)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RETURN_REASONS.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerNotes">Customer Notes</Label>
                  <Textarea
                    id="customerNotes"
                    placeholder="Customer's explanation for the return"
                    {...register('customerNotes')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="internalNotes">Internal Notes</Label>
                  <Textarea
                    id="internalNotes"
                    placeholder="Internal notes (not visible to customer)"
                    {...register('internalNotes')}
                  />
                </div>
                
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Photos (Optional)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <div className="text-sm text-muted-foreground mb-2">
                        Upload photos of the items to be returned
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                    
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Return item ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Refund Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="refundMethod">Refund Method</Label>
                    <Select
                      value={watchedRefundMethod}
                      onValueChange={(value) => setValue('refundMethod', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REFUND_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="restockingFee">Restocking Fee</Label>
                    <Input
                      id="restockingFee"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register('restockingFee', { valueAsNumber: true })}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="returnShippingPaid"
                      {...register('returnShippingPaid')}
                    />
                    <Label htmlFor="returnShippingPaid">Return shipping paid by customer</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="exchangeRequested"
                      {...register('exchangeRequested')}
                    />
                    <Label htmlFor="exchangeRequested">Customer requested exchange</Label>
                  </div>
                </div>
                
                {watchedExchangeRequested && (
                  <div className="space-y-2">
                    <Label htmlFor="exchangeItemId">Exchange Item ID</Label>
                    <Input
                      id="exchangeItemId"
                      placeholder="ID of item to exchange for"
                      {...register('exchangeItemId')}
                    />
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center font-medium">
                  <span>Expected Refund Amount:</span>
                  <span>${watch('expectedRefundAmount')?.toFixed(2) || '0.00'}</span>
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
                Review Return Details
              </CardTitle>
              <CardDescription>
                Please review all details before creating the return
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
                    <p className="text-muted-foreground">Return Reason</p>
                    <p className="font-medium">
                      {RETURN_REASONS.find(r => r.value === watch('reason'))?.label}
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Items Summary */}
              <div>
                <h4 className="font-medium mb-3">Items to Return ({watchedItems.length})</h4>
                <div className="space-y-2">
                  {watchedItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm border rounded p-3">
                      <div>
                        <span className="font-medium">{item.productName}</span>
                        <span className="text-muted-foreground ml-2">(SKU: {item.productSku})</span>
                      </div>
                      <div className="text-right">
                        <div>Qty: {item.quantityToReturn}</div>
                        <div className="text-muted-foreground">
                          ${(item.quantityToReturn * item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Refund Summary */}
              <div>
                <h4 className="font-medium mb-3">Refund Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${watchedItems.reduce((sum, item) => sum + (item.quantityToReturn * item.unitPrice), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Restocking Fee:</span>
                    <span>-${watch('restockingFee')?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total Refund:</span>
                    <span>${watch('expectedRefundAmount')?.toFixed(2) || '0.00'}</span>
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
                    disabled={createReturnMutation.isPending}
                    className="gap-2"
                  >
                    {createReturnMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Create Return
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
              Search for an order to create a return
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
                      {order.customer.firstName} {order.customer.lastName} • ${order.totalAmount.toFixed(2)}
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