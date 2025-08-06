import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePayment, useOrderDetail, useOrders } from '@/services/order';
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
  CreditCard, 
  DollarSign, 
  User, 
  Search,
  AlertCircle, 
  CheckCircle, 
  ShoppingCart,
  Building,
  Shield,
  Calendar,
  Hash
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
import { PaymentMethod } from '@/types/order';

// Form validation schema
const billingAddressSchema = z.object({
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

const createPaymentSchema = z.object({
  orderId: z.string().uuid('Valid order ID is required'),
  customerId: z.string().uuid('Valid customer ID is required'),
  amount: z.number().min(0.01, 'Payment amount must be greater than 0'),
  currency: z.string().min(1, 'Currency is required').default('USD'),
  method: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE', 'CASH', 'CHECK', 'STORE_CREDIT', 'GIFT_CARD', 'OTHER']),
  
  // Credit Card Details
  cardNumber: z.string().optional(),
  cardHolderName: z.string().optional(),
  expiryMonth: z.string().optional(),
  expiryYear: z.string().optional(),
  cvv: z.string().optional(),
  cardBrand: z.string().optional(),
  
  // Bank Transfer Details
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  
  // Check Details
  checkNumber: z.string().optional(),
  checkDate: z.string().optional(),
  
  // Gift Card/Store Credit
  giftCardNumber: z.string().optional(),
  storeCreditId: z.string().optional(),
  
  // General Details
  transactionId: z.string().optional(),
  referenceNumber: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  
  // Billing Address
  billingAddress: billingAddressSchema,
  sameAsShipping: z.boolean().default(true),
  
  // Processing Options
  processImmediately: z.boolean().default(true),
  sendReceipt: z.boolean().default(true),
  savePaymentMethod: z.boolean().default(false),
  
  // Authorization
  authorizeOnly: z.boolean().default(false),
  captureAmount: z.number().optional(),
});

type CreatePaymentFormData = z.infer<typeof createPaymentSchema>;

const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
  { value: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building },
  { value: 'PAYPAL', label: 'PayPal', icon: DollarSign },
  { value: 'STRIPE', label: 'Stripe', icon: CreditCard },
  { value: 'CASH', label: 'Cash', icon: DollarSign },
  { value: 'CHECK', label: 'Check', icon: Hash },
  { value: 'STORE_CREDIT', label: 'Store Credit', icon: DollarSign },
  { value: 'GIFT_CARD', label: 'Gift Card', icon: Hash },
  { value: 'OTHER', label: 'Other', icon: DollarSign },
] as const;

const CARD_BRANDS = [
  'Visa', 'MasterCard', 'American Express', 'Discover', 'JCB', 'Diners Club', 'Other'
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
];

export default function CreatePaymentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [orderSearch, setOrderSearch] = useState('');
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  
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
  } = useForm<CreatePaymentFormData>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      orderId: orderId || '',
      currency: 'USD',
      method: 'CREDIT_CARD',
      sameAsShipping: true,
      processImmediately: true,
      sendReceipt: true,
      savePaymentMethod: false,
      authorizeOnly: false,
    },
  });
  
  // Watch form values
  const watchedOrderId = watch('orderId');
  const watchedMethod = watch('method');
  const watchedSameAsShipping = watch('sameAsShipping');
  const watchedAuthorizeOnly = watch('authorizeOnly');
  const watchedAmount = watch('amount');
  
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
  const createPaymentMutation = useCreatePayment();
  
  // Initialize form with order data
  useEffect(() => {
    if (orderData?.order) {
      const order = orderData.order;
      
      setValue('customerId', order.customerId);
      setValue('amount', order.totalAmount - (order.paidAmount || 0));
      
      if (watchedSameAsShipping && order.shippingAddress) {
        setValue('billingAddress', {
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
          company: order.customer.company,
          addressLine1: order.shippingAddress.addressLine1,
          addressLine2: order.shippingAddress.addressLine2,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
          phone: order.customer.phone,
        });
      }
    }
  }, [orderData, watchedSameAsShipping, setValue]);
  
  // Handle form submission
  const onSubmit = async (data: CreatePaymentFormData) => {
    try {
      const newPayment = await createPaymentMutation.mutateAsync(data);
      toast({
        title: 'Payment Created',
        description: `Payment ${newPayment.paymentNumber} has been created successfully.`,
      });
      navigate(`/orders/payments/${newPayment.id}`);
    } catch (error) {
      console.error('Failed to create payment:', error);
    }
  };
  
  // Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Order selection
        return !!watchedOrderId && !!orderData?.order;
      case 2: // Payment details
        return !!watchedMethod && !!watchedAmount && watchedAmount > 0;
      case 3: // Billing information
        return true; // Billing address validation handled by schema
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
  
  const renderPaymentMethodFields = () => {
    switch (watchedMethod) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardHolderName">Cardholder Name *</Label>
                <Input
                  id="cardHolderName"
                  placeholder="John Doe"
                  {...register('cardHolderName')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardBrand">Card Brand</Label>
                <Select
                  value={watch('cardBrand') || ''}
                  onValueChange={(value) => setValue('cardBrand', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_BRANDS.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                {...register('cardNumber')}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Expiry Month *</Label>
                <Select
                  value={watch('expiryMonth') || ''}
                  onValueChange={(value) => setValue('expiryMonth', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear">Expiry Year *</Label>
                <Select
                  value={watch('expiryYear') || ''}
                  onValueChange={(value) => setValue('expiryYear', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  maxLength={4}
                  {...register('cvv')}
                />
              </div>
            </div>
          </div>
        );
        
      case 'BANK_TRANSFER':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input
                id="bankName"
                placeholder="Bank of America"
                {...register('bankName')}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234567890"
                  {...register('accountNumber')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number *</Label>
                <Input
                  id="routingNumber"
                  placeholder="021000021"
                  {...register('routingNumber')}
                />
              </div>
            </div>
          </div>
        );
        
      case 'CHECK':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkNumber">Check Number *</Label>
                <Input
                  id="checkNumber"
                  placeholder="1001"
                  {...register('checkNumber')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkDate">Check Date *</Label>
                <Input
                  id="checkDate"
                  type="date"
                  {...register('checkDate')}
                />
              </div>
            </div>
          </div>
        );
        
      case 'GIFT_CARD':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="giftCardNumber">Gift Card Number *</Label>
              <Input
                id="giftCardNumber"
                placeholder="GC1234567890"
                {...register('giftCardNumber')}
              />
            </div>
          </div>
        );
        
      case 'STORE_CREDIT':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeCreditId">Store Credit ID *</Label>
              <Input
                id="storeCreditId"
                placeholder="SC1234567890"
                {...register('storeCreditId')}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders/payments')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payments
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create Payment</h1>
            <p className="text-muted-foreground">
              Process a payment for an order
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
              { step: 2, title: 'Payment Details', icon: CreditCard },
              { step: 3, title: 'Billing Info', icon: User },
              { step: 4, title: 'Review & Process', icon: CheckCircle },
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
                Choose the order for which you want to process payment
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
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium">{orderData.order.status}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-medium">${orderData.order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Paid Amount</p>
                        <p className="font-medium">${(orderData.order.paidAmount || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Balance Due</p>
                        <p className="font-medium text-red-600">
                          ${(orderData.order.totalAmount - (orderData.order.paidAmount || 0)).toFixed(2)}
                        </p>
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
        
        {/* Step 2: Payment Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Payment Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      {...register('amount', { valueAsNumber: true })}
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-600">{errors.amount.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={watch('currency')}
                      onValueChange={(value) => setValue('currency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method *</Label>
                    <Select
                      value={watchedMethod}
                      onValueChange={(value) => setValue('method', value as PaymentMethod)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              <method.icon className="h-4 w-4" />
                              {method.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Method-specific fields */}
                {renderPaymentMethodFields()}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transactionId">Transaction ID</Label>
                    <Input
                      id="transactionId"
                      placeholder="External transaction ID"
                      {...register('transactionId')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="referenceNumber">Reference Number</Label>
                    <Input
                      id="referenceNumber"
                      placeholder="Internal reference"
                      {...register('referenceNumber')}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Payment description"
                    {...register('description')}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="authorizeOnly"
                      {...register('authorizeOnly')}
                    />
                    <Label htmlFor="authorizeOnly">Authorize only (don't capture)</Label>
                  </div>
                  
                  {watchedAuthorizeOnly && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="captureAmount">Capture Amount (Optional)</Label>
                      <Input
                        id="captureAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        max={watchedAmount}
                        placeholder="Leave blank to capture later"
                        {...register('captureAmount', { valueAsNumber: true })}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Step 3: Billing Information */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sameAsShipping"
                  {...register('sameAsShipping')}
                />
                <Label htmlFor="sameAsShipping">Same as shipping address</Label>
              </div>
              
              {!watchedSameAsShipping && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        {...register('billingAddress.firstName')}
                        placeholder="John"
                      />
                      {errors.billingAddress?.firstName && (
                        <p className="text-sm text-red-600">{errors.billingAddress.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        {...register('billingAddress.lastName')}
                        placeholder="Doe"
                      />
                      {errors.billingAddress?.lastName && (
                        <p className="text-sm text-red-600">{errors.billingAddress.lastName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      {...register('billingAddress.company')}
                      placeholder="Company name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      {...register('billingAddress.addressLine1')}
                      placeholder="123 Main Street"
                    />
                    {errors.billingAddress?.addressLine1 && (
                      <p className="text-sm text-red-600">{errors.billingAddress.addressLine1.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      {...register('billingAddress.addressLine2')}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        {...register('billingAddress.city')}
                        placeholder="New York"
                      />
                      {errors.billingAddress?.city && (
                        <p className="text-sm text-red-600">{errors.billingAddress.city.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        {...register('billingAddress.state')}
                        placeholder="NY"
                      />
                      {errors.billingAddress?.state && (
                        <p className="text-sm text-red-600">{errors.billingAddress.state.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        {...register('billingAddress.postalCode')}
                        placeholder="10001"
                      />
                      {errors.billingAddress?.postalCode && (
                        <p className="text-sm text-red-600">{errors.billingAddress.postalCode.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        {...register('billingAddress.country')}
                        placeholder="United States"
                        defaultValue="United States"
                      />
                      {errors.billingAddress?.country && (
                        <p className="text-sm text-red-600">{errors.billingAddress.country.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...register('billingAddress.phone')}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="processImmediately"
                    {...register('processImmediately')}
                  />
                  <Label htmlFor="processImmediately">Process payment immediately</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendReceipt"
                    {...register('sendReceipt')}
                  />
                  <Label htmlFor="sendReceipt">Send receipt to customer</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="savePaymentMethod"
                    {...register('savePaymentMethod')}
                  />
                  <Label htmlFor="savePaymentMethod">Save payment method for future use</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Internal notes about this payment"
                  {...register('notes')}
                />
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 4: Review & Process */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Review Payment Details
              </CardTitle>
              <CardDescription>
                Please review all details before processing the payment
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
                    <p className="text-muted-foreground">Order Total</p>
                    <p className="font-medium">${orderData?.order?.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Payment Summary */}
              <div>
                <h4 className="font-medium mb-3">Payment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="font-medium">
                      {PAYMENT_METHODS.find(m => m.value === watchedMethod)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-medium text-2xl">
                      ${watchedAmount?.toFixed(2)} {watch('currency')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Processing</p>
                    <p className="font-medium">
                      {watch('processImmediately') ? 'Immediate' : 'Manual'}
                      {watchedAuthorizeOnly && ' (Authorize Only)'}
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Security Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  This payment will be processed securely. All sensitive information is encrypted and handled according to PCI DSS standards.
                </AlertDescription>
              </Alert>
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
                    disabled={createPaymentMutation.isPending}
                    className="gap-2"
                  >
                    {createPaymentMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Process Payment
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
              Search for an order to process payment
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
                    <div className="text-xs text-muted-foreground">
                      Balance: ${(order.totalAmount - (order.paidAmount || 0)).toFixed(2)}
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