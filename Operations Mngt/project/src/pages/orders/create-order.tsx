import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateOrder } from '@/services/order';
import { useCustomers } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Minus, 
  Search, 
  User, 
  MapPin, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Package, 
  Calculator,
  Trash2,
  Copy,
  UserPlus,
  Building,
  Phone,
  Mail,
  Globe,
  Tag,
  DollarSign,
  FileText,
  RefreshCw
} from 'lucide-react';
import { OrderPriority, OrderType, CreateOrderRequest, Customer, Address } from '@/types/order';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';

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

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().min(1, 'Product name is required'),
  productSku: z.string().min(1, 'Product SKU is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Price must be positive'),
  customizations: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

const orderFormSchema = z.object({
  // Customer Information
  customerId: z.string().min(1, 'Customer is required'),
  customerType: z.enum(['existing', 'new']),
  newCustomer: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    customerType: z.enum(['INDIVIDUAL', 'BUSINESS']),
  }).optional(),
  
  // Order Details
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  type: z.enum(['STANDARD', 'EXPRESS', 'BULK', 'SUBSCRIPTION', 'CUSTOM']),
  poNumber: z.string().optional(),
  referenceNumber: z.string().optional(),
  specialInstructions: z.string().optional(),
  tags: z.array(z.string()).optional(),
  
  // Items
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  
  // Addresses
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
  sameAsShipping: z.boolean().default(false),
  
  // Shipping
  shippingMethod: z.string().optional(),
  
  // Promotions
  promotionCodes: z.array(z.string()).optional(),
  
  // Totals (calculated)
  subtotal: z.number(),
  taxAmount: z.number(),
  shippingAmount: z.number(),
  discountAmount: z.number(),
  totalAmount: z.number(),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

// Mock product data (in real app, this would come from API)
const MOCK_PRODUCTS = [
  { id: '1', name: 'Wireless Headphones', sku: 'WH-001', price: 99.99, category: 'Electronics' },
  { id: '2', name: 'Bluetooth Speaker', sku: 'BS-002', price: 149.99, category: 'Electronics' },
  { id: '3', name: 'USB-C Cable', sku: 'UC-003', price: 19.99, category: 'Accessories' },
  { id: '4', name: 'Wireless Mouse', sku: 'WM-004', price: 49.99, category: 'Electronics' },
  { id: '5', name: 'Keyboard', sku: 'KB-005', price: 79.99, category: 'Electronics' },
];

const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard Shipping', price: 9.99, days: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', price: 19.99, days: '2-3 business days' },
  { id: 'overnight', name: 'Overnight Shipping', price: 39.99, days: '1 business day' },
  { id: 'free', name: 'Free Shipping', price: 0, days: '7-10 business days', minOrder: 100 },
];

const TAX_RATE = 0.08; // 8% tax rate

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  
  // Debounced search
  const debouncedCustomerSearch = useDebounce(customerSearch, 300);
  const debouncedProductSearch = useDebounce(productSearch, 300);
  
  // Form setup
  const methods = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerType: 'existing',
      priority: 'NORMAL',
      type: 'STANDARD',
      items: [],
      sameAsShipping: true,
      subtotal: 0,
      taxAmount: 0,
      shippingAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      promotionCodes: [],
      tags: [],
    },
  });

  const { control, handleSubmit, formState: { errors }, setValue, getValues, watch } = methods;
  const { fields: itemFields, append: appendItem, remove: removeItem, update: updateItem } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch form values for calculations
  const watchedItems = useWatch({ control, name: 'items' });
  const watchedShippingMethod = useWatch({ control, name: 'shippingMethod' });
  const watchedSameAsShipping = useWatch({ control, name: 'sameAsShipping' });
  const watchedCustomerType = useWatch({ control, name: 'customerType' });

  // Fetch customers for search
  const { data: customersData } = useCustomers(
    { search: debouncedCustomerSearch },
    { enabled: !!debouncedCustomerSearch }
  );

  // Mutations
  const createOrderMutation = useCreateOrder();

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = watchedItems?.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0) || 0;

    const shippingMethod = SHIPPING_METHODS.find(method => method.id === watchedShippingMethod);
    const shippingAmount = shippingMethod ? 
      (shippingMethod.minOrder && subtotal >= shippingMethod.minOrder ? 0 : shippingMethod.price) : 0;

    const taxAmount = subtotal * TAX_RATE;
    // Calculate discount based on promotion codes
    let discountAmount = 0;
    const promotionCodes = getValues('promotionCodes') || [];
    
    if (promotionCodes.length > 0) {
      // Mock promotion logic - in real app this would validate against backend
      promotionCodes.forEach(code => {
        // Example promotion rules
        if (code.toLowerCase().includes('save10')) {
          discountAmount += subtotal * 0.10; // 10% off
        } else if (code.toLowerCase().includes('save20')) {
          discountAmount += subtotal * 0.20; // 20% off
        } else if (code.toLowerCase().includes('free5')) {
          discountAmount += Math.min(5, subtotal); // $5 off, max $5
        } else if (code.toLowerCase().includes('freeship')) {
          discountAmount += shippingAmount; // Free shipping
        }
      });
      
      // Cap discount at subtotal to prevent negative totals
      discountAmount = Math.min(discountAmount, subtotal);
    }
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    return {
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount,
      totalAmount,
    };
  }, [watchedItems, watchedShippingMethod]);

  // Update calculated values
  useEffect(() => {
    setValue('subtotal', calculations.subtotal);
    setValue('taxAmount', calculations.taxAmount);
    setValue('shippingAmount', calculations.shippingAmount);
    setValue('discountAmount', calculations.discountAmount);
    setValue('totalAmount', calculations.totalAmount);
  }, [calculations, setValue]);

  // Copy shipping to billing address
  useEffect(() => {
    if (watchedSameAsShipping) {
      const shippingAddress = getValues('shippingAddress');
      if (shippingAddress) {
        setValue('billingAddress', shippingAddress);
      }
    }
  }, [watchedSameAsShipping, setValue, getValues]);

  // Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Customer selection
        return !!getValues('customerId') || (watchedCustomerType === 'new' && !!getValues('newCustomer'));
      case 2: // Order details and items
        return getValues('items').length > 0;
      case 3: // Addresses
        return !!getValues('shippingAddress') && !!getValues('billingAddress');
      case 4: // Review
        return true;
      default:
        return false;
    }
  };

  // Handle customer selection
  const handleSelectCustomer = (customer: Customer) => {
    setValue('customerId', customer.id);
    setValue('customerType', 'existing');
    
    // Pre-fill addresses if available
    if (customer.addresses.length > 0) {
      const defaultAddress = customer.addresses.find(addr => addr.isDefault) || customer.addresses[0];
      setValue('shippingAddress', {
        firstName: customer.firstName,
        lastName: customer.lastName,
        company: defaultAddress.company,
        addressLine1: defaultAddress.addressLine1,
        addressLine2: defaultAddress.addressLine2,
        city: defaultAddress.city,
        state: defaultAddress.state,
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country,
        phone: defaultAddress.phone || customer.phone,
      });
    }
    
    setShowCustomerDialog(false);
  };

  // Handle product addition
  const handleAddProduct = (product: typeof MOCK_PRODUCTS[0]) => {
    appendItem({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      quantity: 1,
      unitPrice: product.price,
      customizations: {},
      notes: '',
    });
    setShowProductDialog(false);
    setProductSearch('');
  };

  // Handle form submission
  const onSubmit = async (data: OrderFormData) => {
    try {
      const orderRequest: CreateOrderRequest = {
        customerId: data.customerId,
        items: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          customizations: item.customizations,
        })),
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        shippingMethod: data.shippingMethod,
        promotionCodes: data.promotionCodes,
        specialInstructions: data.specialInstructions,
        poNumber: data.poNumber,
        tags: data.tags,
      };

      const newOrder = await createOrderMutation.mutateAsync(orderRequest);
      navigate(`/orders/${newOrder.id}`);
    } catch (error) {
      console.error('Failed to create order:', error);
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

  const filteredProducts = MOCK_PRODUCTS.filter(product =>
    !debouncedProductSearch || 
    product.name.toLowerCase().includes(debouncedProductSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(debouncedProductSearch.toLowerCase())
  );

  return (
    <FormProvider {...methods}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Order</h1>
            <p className="text-muted-foreground">
              Step {currentStep} of 4: {
                currentStep === 1 ? 'Customer Selection' :
                currentStep === 2 ? 'Order Details' :
                currentStep === 3 ? 'Shipping & Billing' :
                'Review & Submit'
              }
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Customer Selection */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Selection
                </CardTitle>
                <CardDescription>
                  Select an existing customer or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Type Toggle */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={watchedCustomerType === 'existing' ? 'default' : 'outline'}
                    onClick={() => setValue('customerType', 'existing')}
                    className="gap-2"
                  >
                    <User className="h-4 w-4" />
                    Existing Customer
                  </Button>
                  <Button
                    type="button"
                    variant={watchedCustomerType === 'new' ? 'default' : 'outline'}
                    onClick={() => setValue('customerType', 'new')}
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    New Customer
                  </Button>
                </div>

                {watchedCustomerType === 'existing' ? (
                  <div className="space-y-4">
                    {/* Customer Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search customers by name, email, or phone..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Customer Results */}
                    {customersData && customersData.customers.length > 0 && (
                      <div className="border rounded-lg">
                        {customersData.customers.slice(0, 5).map((customer) => (
                          <div
                            key={customer.id}
                            className="p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                            onClick={() => handleSelectCustomer(customer)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">
                                  {customer.firstName} {customer.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {customer.email}
                                </div>
                                {customer.phone && (
                                  <div className="text-sm text-muted-foreground">
                                    {customer.phone}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {customer.totalOrders} orders
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ${customer.totalSpent.toLocaleString()} spent
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected Customer Display */}
                    {getValues('customerId') && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Customer selected successfully. You can proceed to the next step.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        {...methods.register('newCustomer.firstName')}
                        placeholder="John"
                      />
                      {errors.newCustomer?.firstName && (
                        <p className="text-sm text-red-600">{errors.newCustomer.firstName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        {...methods.register('newCustomer.lastName')}
                        placeholder="Doe"
                      />
                      {errors.newCustomer?.lastName && (
                        <p className="text-sm text-red-600">{errors.newCustomer.lastName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...methods.register('newCustomer.email')}
                        placeholder="john.doe@example.com"
                      />
                      {errors.newCustomer?.email && (
                        <p className="text-sm text-red-600">{errors.newCustomer.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        {...methods.register('newCustomer.phone')}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="customerType">Customer Type *</Label>
                      <Select 
                        value={getValues('newCustomer.customerType')}
                        onValueChange={(value: 'INDIVIDUAL' | 'BUSINESS') => 
                          setValue('newCustomer.customerType', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                          <SelectItem value="BUSINESS">Business</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Order Details & Items */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={getValues('priority')}
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
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Order Type</Label>
                      <Select 
                        value={getValues('type')}
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="poNumber">PO Number</Label>
                      <Input
                        id="poNumber"
                        {...methods.register('poNumber')}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="specialInstructions">Special Instructions</Label>
                    <Textarea
                      id="specialInstructions"
                      {...methods.register('specialInstructions')}
                      placeholder="Any special handling or delivery instructions..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Order Items ({itemFields.length})
                    </CardTitle>
                    <CardDescription>
                      Add products to this order
                    </CardDescription>
                  </div>
                  
                  <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Product</DialogTitle>
                        <DialogDescription>
                          Search and select products to add to the order
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search products by name or SKU..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          <div className="grid gap-2">
                            {filteredProducts.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                                onClick={() => handleAddProduct(product)}
                              >
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    SKU: {product.sku} • {product.category}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">${product.price}</div>
                                  <Button size="sm" variant="ghost">
                                    Add
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {itemFields.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No items added yet</p>
                      <p className="text-sm text-muted-foreground">
                        Click "Add Product" to start building the order
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {itemFields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="font-medium">{field.productName}</div>
                              <div className="text-sm text-muted-foreground">
                                SKU: {field.productSku}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Quantity</Label>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const currentQty = getValues(`items.${index}.quantity`);
                                    if (currentQty > 1) {
                                      setValue(`items.${index}.quantity`, currentQty - 1);
                                    }
                                  }}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  min="1"
                                  {...methods.register(`items.${index}.quantity`, { valueAsNumber: true })}
                                  className="text-center w-20"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const currentQty = getValues(`items.${index}.quantity`);
                                    setValue(`items.${index}.quantity`, currentQty + 1);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Unit Price</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...methods.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Total</Label>
                              <div className="text-lg font-medium">
                                ${((field.quantity || 0) * (field.unitPrice || 0)).toFixed(2)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                              {...methods.register(`items.${index}.notes`)}
                              placeholder="Special instructions for this item..."
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              {itemFields.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${calculations.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8%):</span>
                        <span>${calculations.taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>${calculations.shippingAmount.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-medium">
                        <span>Total:</span>
                        <span>${calculations.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Shipping & Billing */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Shipping Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Shipping Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {SHIPPING_METHODS.map((method) => {
                      const isDisabled = method.minOrder && calculations.subtotal < method.minOrder;
                      return (
                        <div
                          key={method.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            watchedShippingMethod === method.id 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:border-muted-foreground'
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => !isDisabled && setValue('shippingMethod', method.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{method.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {method.days}
                                {method.minOrder && (
                                  <span> • Minimum order: ${method.minOrder}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {method.price === 0 ? 'Free' : `$${method.price}`}
                              </div>
                              <input
                                type="radio"
                                name="shippingMethod"
                                value={method.id}
                                checked={watchedShippingMethod === method.id}
                                onChange={() => setValue('shippingMethod', method.id)}
                                disabled={isDisabled}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Addresses */}
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
                          defaultValue="United States"
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
                      <CreditCard className="h-5 w-5" />
                      Billing Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sameAsShipping"
                        checked={watchedSameAsShipping}
                        onCheckedChange={(checked) => setValue('sameAsShipping', !!checked)}
                      />
                      <Label htmlFor="sameAsShipping">Same as shipping address</Label>
                    </div>
                    
                    {!watchedSameAsShipping && (
                      <>
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
                              defaultValue="United States"
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
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Order Review */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Order Review
                  </CardTitle>
                  <CardDescription>
                    Please review all order details before submitting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Summary */}
                  <div>
                    <h3 className="font-medium mb-2">Customer Information</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      {watchedCustomerType === 'existing' ? (
                        <div>Customer ID: {getValues('customerId')}</div>
                      ) : (
                        <div>
                          <div>{getValues('newCustomer.firstName')} {getValues('newCustomer.lastName')}</div>
                          <div className="text-sm text-muted-foreground">{getValues('newCustomer.email')}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div>
                    <h3 className="font-medium mb-2">Order Items ({itemFields.length})</h3>
                    <div className="space-y-2">
                      {itemFields.map((item, index) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {item.productSku} • Qty: {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${(item.unitPrice || 0).toFixed(2)} each
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Addresses Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Shipping Address</h3>
                      <div className="bg-muted p-4 rounded-lg text-sm">
                        <div>{getValues('shippingAddress.firstName')} {getValues('shippingAddress.lastName')}</div>
                        {getValues('shippingAddress.company') && (
                          <div>{getValues('shippingAddress.company')}</div>
                        )}
                        <div>{getValues('shippingAddress.addressLine1')}</div>
                        {getValues('shippingAddress.addressLine2') && (
                          <div>{getValues('shippingAddress.addressLine2')}</div>
                        )}
                        <div>
                          {getValues('shippingAddress.city')}, {getValues('shippingAddress.state')} {getValues('shippingAddress.postalCode')}
                        </div>
                        <div>{getValues('shippingAddress.country')}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Billing Address</h3>
                      <div className="bg-muted p-4 rounded-lg text-sm">
                        {watchedSameAsShipping ? (
                          <div className="text-muted-foreground">Same as shipping address</div>
                        ) : (
                          <>
                            <div>{getValues('billingAddress.firstName')} {getValues('billingAddress.lastName')}</div>
                            {getValues('billingAddress.company') && (
                              <div>{getValues('billingAddress.company')}</div>
                            )}
                            <div>{getValues('billingAddress.addressLine1')}</div>
                            {getValues('billingAddress.addressLine2') && (
                              <div>{getValues('billingAddress.addressLine2')}</div>
                            )}
                            <div>
                              {getValues('billingAddress.city')}, {getValues('billingAddress.state')} {getValues('billingAddress.postalCode')}
                            </div>
                            <div>{getValues('billingAddress.country')}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Final Totals */}
                  <div>
                    <h3 className="font-medium mb-2">Order Summary</h3>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${calculations.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${calculations.taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>${calculations.shippingAmount.toFixed(2)}</span>
                      </div>
                      {calculations.discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-${calculations.discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-medium">
                        <span>Total:</span>
                        <span>${calculations.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="gap-2"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Create Order
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
} 