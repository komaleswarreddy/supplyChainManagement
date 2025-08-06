import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrderDetail, useUpdateOrder } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Edit, 
  Plus, 
  Minus, 
  Trash2,
  History,
  User,
  MapPin,
  Package,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  Clock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { OrderStatus, OrderPriority, OrderType, UpdateOrderRequest } from '@/types/order';
import { useToast } from '@/hooks/useToast';

// Form validation schema
const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
});

const editOrderSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'ON_HOLD', 'PARTIALLY_SHIPPED', 'RETURNED']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  type: z.enum(['STANDARD', 'EXPRESS', 'BULK', 'SUBSCRIPTION', 'CUSTOM']),
  poNumber: z.string().optional(),
  referenceNumber: z.string().optional(),
  specialInstructions: z.string().optional(),
  tags: z.array(z.string()).optional(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  shippingMethod: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

type EditOrderFormData = z.infer<typeof editOrderSchema>;

const STATUS_COLORS: Record<OrderStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-red-100 text-red-800',
  ON_HOLD: 'bg-orange-100 text-orange-800',
  PARTIALLY_SHIPPED: 'bg-cyan-100 text-cyan-800',
  RETURNED: 'bg-gray-100 text-gray-800',
};

const PRIORITY_COLORS: Record<OrderPriority, string> = {
  LOW: 'bg-green-100 text-green-800',
  NORMAL: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export default function EditOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [activeTab, setActiveTab] = useState('details');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  // Fetch order data
  const { 
    data: orderData, 
    isLoading, 
    error 
  } = useOrderDetail(id!);

  // Form setup
  const methods = useForm<EditOrderFormData>({
    resolver: zodResolver(editOrderSchema),
  });

  const { handleSubmit, formState: { errors }, setValue, watch, reset } = methods;

  // Watch for changes
  const watchedValues = watch();

  // Mutations
  const updateOrderMutation = useUpdateOrder();

  // Initialize form with order data
  useEffect(() => {
    if (orderData?.order) {
      const order = orderData.order;
      const formData: EditOrderFormData = {
        status: order.status,
        priority: order.priority,
        type: order.type,
        poNumber: order.poNumber || '',
        referenceNumber: order.referenceNumber || '',
        specialInstructions: order.specialInstructions || '',
        tags: order.tags || [],
        shippingAddress: {
          firstName: order.shippingAddress.firstName,
          lastName: order.shippingAddress.lastName,
          company: order.shippingAddress.company || '',
          addressLine1: order.shippingAddress.addressLine1,
          addressLine2: order.shippingAddress.addressLine2 || '',
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
          phone: order.shippingAddress.phone || '',
        },
        billingAddress: {
          firstName: order.billingAddress.firstName,
          lastName: order.billingAddress.lastName,
          company: order.billingAddress.company || '',
          addressLine1: order.billingAddress.addressLine1,
          addressLine2: order.billingAddress.addressLine2 || '',
          city: order.billingAddress.city,
          state: order.billingAddress.state,
          postalCode: order.billingAddress.postalCode,
          country: order.billingAddress.country,
          phone: order.billingAddress.phone || '',
        },
        shippingMethod: order.shippingMethod || '',
        trackingNumber: order.trackingNumber || '',
        estimatedDeliveryDate: order.estimatedDeliveryDate ? format(parseISO(order.estimatedDeliveryDate), 'yyyy-MM-dd') : '',
        notes: '',
      };

      reset(formData);
      setOriginalData(formData);
    }
  }, [orderData, reset]);

  // Check for changes
  useEffect(() => {
    if (originalData) {
      const hasChanged = JSON.stringify(watchedValues) !== JSON.stringify(originalData);
      setHasChanges(hasChanged);
    }
  }, [watchedValues, originalData]);

  if (!id) {
    return <div>Invalid order ID</div>;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading order...</span>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load order details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { order } = orderData;

  // Handle form submission
  const onSubmit = async (data: EditOrderFormData) => {
    try {
      const updateRequest: UpdateOrderRequest = {
        status: data.status,
        priority: data.priority,
        shippingAddress: {
          id: order.shippingAddress.id,
          type: 'SHIPPING',
          isDefault: false,
          ...data.shippingAddress,
        },
        billingAddress: {
          id: order.billingAddress.id,
          type: 'BILLING',
          isDefault: false,
          ...data.billingAddress,
        },
        shippingMethod: data.shippingMethod,
        specialInstructions: data.specialInstructions,
        tags: data.tags,
        notes: data.notes,
      };

      await updateOrderMutation.mutateAsync({ id: order.id, data: updateRequest });
      setHasChanges(false);
      setOriginalData(data);
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const getChangedFields = () => {
    if (!originalData) return [];
    
    const changes = [];
    const current = watchedValues;
    
    Object.keys(current).forEach(key => {
      if (typeof current[key] === 'object' && current[key] !== null) {
        // Handle nested objects like addresses
        Object.keys(current[key]).forEach(nestedKey => {
          if (current[key][nestedKey] !== originalData[key]?.[nestedKey]) {
            changes.push(`${key}.${nestedKey}`);
          }
        });
      } else if (current[key] !== originalData[key]) {
        changes.push(key);
      }
    });
    
    return changes;
  };

  const changedFields = getChangedFields();

  return (
    <FormProvider {...methods}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/orders/${order.id}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Order
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Order {order.orderNumber}</h1>
              <p className="text-muted-foreground">
                Last updated {format(parseISO(order.updatedAt), 'MMMM dd, yyyy')} at {format(parseISO(order.updatedAt), 'h:mm a')}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => reset(originalData)}
              disabled={!hasChanges}
            >
              Reset Changes
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={!hasChanges || updateOrderMutation.isPending}
              className="gap-2"
            >
              {updateOrderMutation.isPending ? (
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
          </div>
        </div>

        {/* Changes Alert */}
        {hasChanges && (
          <Alert>
            <Edit className="h-4 w-4" />
            <AlertDescription>
              You have unsaved changes in: {changedFields.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Order Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${STATUS_COLORS[order.status]} text-lg px-3 py-1`}>
                {order.status.replace('_', ' ')}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${PRIORITY_COLORS[order.priority]} text-lg px-3 py-1`}>
                {order.priority}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="font-medium">
                  {order.customer.firstName} {order.customer.lastName}
                </div>
                <div className="text-muted-foreground">
                  {order.customer.email}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Form Tabs */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Order Details</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="notes">Notes & History</TabsTrigger>
            </TabsList>

            {/* Order Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={watch('status')}
                        onValueChange={(value: OrderStatus) => setValue('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="PROCESSING">Processing</SelectItem>
                          <SelectItem value="SHIPPED">Shipped</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                          <SelectItem value="ON_HOLD">On Hold</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && (
                        <p className="text-sm text-red-600">{errors.status.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={watch('priority')}
                        onValueChange={(value: OrderPriority) => setValue('priority', value)}
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
                      {errors.priority && (
                        <p className="text-sm text-red-600">{errors.priority.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Order Type</Label>
                      <Select 
                        value={watch('type')}
                        onValueChange={(value: OrderType) => setValue('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STANDARD">Standard</SelectItem>
                          <SelectItem value="EXPRESS">Express</SelectItem>
                          <SelectItem value="BULK">Bulk</SelectItem>
                          <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                          <SelectItem value="CUSTOM">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="poNumber">PO Number</Label>
                      <Input
                        id="poNumber"
                        {...methods.register('poNumber')}
                        placeholder="Purchase Order Number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referenceNumber">Reference Number</Label>
                      <Input
                        id="referenceNumber"
                        {...methods.register('referenceNumber')}
                        placeholder="Internal Reference"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialInstructions">Special Instructions</Label>
                    <Textarea
                      id="specialInstructions"
                      {...methods.register('specialInstructions')}
                      placeholder="Any special handling or delivery instructions..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</Label>
                    <Input
                      id="estimatedDeliveryDate"
                      type="date"
                      {...methods.register('estimatedDeliveryDate')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Items (Read-only for editing) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Items ({order.items.length})
                  </CardTitle>
                  <CardDescription>
                    Items cannot be modified after order creation. Contact support for item changes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3">Product</th>
                          <th className="text-left py-3">SKU</th>
                          <th className="text-right py-3">Qty</th>
                          <th className="text-right py-3">Unit Price</th>
                          <th className="text-right py-3">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-3">
                              <div className="font-medium">{item.productName}</div>
                            </td>
                            <td className="py-3 text-sm text-muted-foreground">
                              {item.productSku}
                            </td>
                            <td className="py-3 text-right">
                              {item.quantity}
                            </td>
                            <td className="py-3 text-right">
                              ${item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 text-right font-medium">
                              ${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingFirstName">First Name *</Label>
                        <Input
                          id="shippingFirstName"
                          {...methods.register('shippingAddress.firstName')}
                        />
                        {errors.shippingAddress?.firstName && (
                          <p className="text-sm text-red-600">{errors.shippingAddress.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingLastName">Last Name *</Label>
                        <Input
                          id="shippingLastName"
                          {...methods.register('shippingAddress.lastName')}
                        />
                        {errors.shippingAddress?.lastName && (
                          <p className="text-sm text-red-600">{errors.shippingAddress.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shippingCompany">Company</Label>
                      <Input
                        id="shippingCompany"
                        {...methods.register('shippingAddress.company')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress1">Address Line 1 *</Label>
                      <Input
                        id="shippingAddress1"
                        {...methods.register('shippingAddress.addressLine1')}
                      />
                      {errors.shippingAddress?.addressLine1 && (
                        <p className="text-sm text-red-600">{errors.shippingAddress.addressLine1.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress2">Address Line 2</Label>
                      <Input
                        id="shippingAddress2"
                        {...methods.register('shippingAddress.addressLine2')}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingCity">City *</Label>
                        <Input
                          id="shippingCity"
                          {...methods.register('shippingAddress.city')}
                        />
                        {errors.shippingAddress?.city && (
                          <p className="text-sm text-red-600">{errors.shippingAddress.city.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingState">State *</Label>
                        <Input
                          id="shippingState"
                          {...methods.register('shippingAddress.state')}
                        />
                        {errors.shippingAddress?.state && (
                          <p className="text-sm text-red-600">{errors.shippingAddress.state.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingPostalCode">Postal Code *</Label>
                        <Input
                          id="shippingPostalCode"
                          {...methods.register('shippingAddress.postalCode')}
                        />
                        {errors.shippingAddress?.postalCode && (
                          <p className="text-sm text-red-600">{errors.shippingAddress.postalCode.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingCountry">Country *</Label>
                        <Input
                          id="shippingCountry"
                          {...methods.register('shippingAddress.country')}
                        />
                        {errors.shippingAddress?.country && (
                          <p className="text-sm text-red-600">{errors.shippingAddress.country.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shippingPhone">Phone</Label>
                      <Input
                        id="shippingPhone"
                        {...methods.register('shippingAddress.phone')}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Billing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="billingFirstName">First Name *</Label>
                        <Input
                          id="billingFirstName"
                          {...methods.register('billingAddress.firstName')}
                        />
                        {errors.billingAddress?.firstName && (
                          <p className="text-sm text-red-600">{errors.billingAddress.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingLastName">Last Name *</Label>
                        <Input
                          id="billingLastName"
                          {...methods.register('billingAddress.lastName')}
                        />
                        {errors.billingAddress?.lastName && (
                          <p className="text-sm text-red-600">{errors.billingAddress.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="billingCompany">Company</Label>
                      <Input
                        id="billingCompany"
                        {...methods.register('billingAddress.company')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="billingAddress1">Address Line 1 *</Label>
                      <Input
                        id="billingAddress1"
                        {...methods.register('billingAddress.addressLine1')}
                      />
                      {errors.billingAddress?.addressLine1 && (
                        <p className="text-sm text-red-600">{errors.billingAddress.addressLine1.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="billingAddress2">Address Line 2</Label>
                      <Input
                        id="billingAddress2"
                        {...methods.register('billingAddress.addressLine2')}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="billingCity">City *</Label>
                        <Input
                          id="billingCity"
                          {...methods.register('billingAddress.city')}
                        />
                        {errors.billingAddress?.city && (
                          <p className="text-sm text-red-600">{errors.billingAddress.city.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingState">State *</Label>
                        <Input
                          id="billingState"
                          {...methods.register('billingAddress.state')}
                        />
                        {errors.billingAddress?.state && (
                          <p className="text-sm text-red-600">{errors.billingAddress.state.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="billingPostalCode">Postal Code *</Label>
                        <Input
                          id="billingPostalCode"
                          {...methods.register('billingAddress.postalCode')}
                        />
                        {errors.billingAddress?.postalCode && (
                          <p className="text-sm text-red-600">{errors.billingAddress.postalCode.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingCountry">Country *</Label>
                        <Input
                          id="billingCountry"
                          {...methods.register('billingAddress.country')}
                        />
                        {errors.billingAddress?.country && (
                          <p className="text-sm text-red-600">{errors.billingAddress.country.message}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="billingPhone">Phone</Label>
                      <Input
                        id="billingPhone"
                        {...methods.register('billingAddress.phone')}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Shipping Tab */}
            <TabsContent value="shipping" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shippingMethod">Shipping Method</Label>
                      <Input
                        id="shippingMethod"
                        {...methods.register('shippingMethod')}
                        placeholder="e.g., Standard Shipping, Express"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trackingNumber">Tracking Number</Label>
                      <Input
                        id="trackingNumber"
                        {...methods.register('trackingNumber')}
                        placeholder="Enter tracking number"
                      />
                    </div>
                  </div>

                  {/* Current Fulfillments */}
                  <div className="space-y-2">
                    <Label>Current Fulfillments</Label>
                    <div className="border rounded-lg p-4">
                      {order.fulfillments.length === 0 ? (
                        <p className="text-muted-foreground">No fulfillments yet</p>
                      ) : (
                        <div className="space-y-2">
                          {order.fulfillments.map((fulfillment) => (
                            <div key={fulfillment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div>
                                <div className="font-medium">{fulfillment.fulfillmentNumber}</div>
                                <div className="text-sm text-muted-foreground">
                                  Status: {fulfillment.status}
                                </div>
                              </div>
                              {fulfillment.trackingNumber && (
                                <div className="text-sm">
                                  Tracking: {fulfillment.trackingNumber}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Shipments */}
                  <div className="space-y-2">
                    <Label>Current Shipments</Label>
                    <div className="border rounded-lg p-4">
                      {order.shipments.length === 0 ? (
                        <p className="text-muted-foreground">No shipments yet</p>
                      ) : (
                        <div className="space-y-2">
                          {order.shipments.map((shipment) => (
                            <div key={shipment.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div>
                                <div className="font-medium">{shipment.shipmentNumber}</div>
                                <div className="text-sm text-muted-foreground">
                                  {shipment.carrierName} - {shipment.status}
                                </div>
                              </div>
                              <div className="text-sm">
                                {shipment.trackingNumber}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notes & History Tab */}
            <TabsContent value="notes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Add Note
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Internal Note</Label>
                    <Textarea
                      id="notes"
                      {...methods.register('notes')}
                      placeholder="Add a note about this order update..."
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                      This note will be added to the order history when you save changes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {order.history.map((historyItem) => (
                      <div key={historyItem.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium">{historyItem.action}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(parseISO(historyItem.createdAt), 'MMM dd, yyyy h:mm a')}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {historyItem.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            by {historyItem.createdByName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </FormProvider>
  );
} 