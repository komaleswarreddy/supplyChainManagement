import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCustomerDetail, useOrders, useUpdateCustomer } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/useToast';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  DollarSign,
  TrendingUp,
  Star,
  Copy,
  MoreHorizontal,
  User,
  Building,
  Globe,
  CreditCard,
  Package,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Truck,
  RotateCcw,
  FileText,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const updateCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
  type: z.enum(['individual', 'business']),
  loyaltyTier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
  company: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

type UpdateCustomerForm = z.infer<typeof updateCustomerSchema>;

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
};

const typeColors = {
  individual: 'bg-blue-100 text-blue-800',
  business: 'bg-purple-100 text-purple-800',
};

const loyaltyColors = {
  bronze: 'bg-orange-100 text-orange-800',
  silver: 'bg-gray-100 text-gray-800',
  gold: 'bg-yellow-100 text-yellow-800',
  platinum: 'bg-indigo-100 text-indigo-800',
};

const orderStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-orange-100 text-orange-800',
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

export function CustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: customer, isLoading: customerLoading, error: customerError } = useCustomerDetail(customerId!);
  const { data: orders, isLoading: ordersLoading } = useOrders({
    customerId: customerId,
    page: 1,
    limit: 50,
  });

  const updateCustomerMutation = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UpdateCustomerForm>({
    resolver: zodResolver(updateCustomerSchema),
  });

  React.useEffect(() => {
    if (customer) {
      reset({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone || '',
        status: customer.status,
        type: customer.type,
        loyaltyTier: customer.loyaltyTier,
        company: customer.company || '',
        website: customer.website || '',
        taxId: customer.taxId || '',
        notes: customer.notes || '',
      });
    }
  }, [customer, reset]);

  const onSubmit = (data: UpdateCustomerForm) => {
    updateCustomerMutation.mutate(
      { customerId: customerId!, data },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          toast.success('Customer information has been successfully updated.');
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update customer');
        },
      }
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    });
  };

  if (customerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (customerError || !customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Customer Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The customer you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/orders/customers')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  // Calculate customer analytics
  const customerOrders = orders?.orders || [];
  const totalOrders = customerOrders.length;
  const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const completedOrders = customerOrders.filter(order => order.status === 'delivered').length;
  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  // Prepare chart data
  const monthlyOrderData = React.useMemo(() => {
    const months = {};
    customerOrders.forEach(order => {
      const month = format(new Date(order.createdAt), 'MMM yyyy');
      if (!months[month]) {
        months[month] = { month, orders: 0, revenue: 0 };
      }
      months[month].orders += 1;
      months[month].revenue += order.totalAmount;
    });
    return Object.values(months).slice(-12);
  }, [customerOrders]);

  const statusDistribution = React.useMemo(() => {
    const distribution = {};
    customerOrders.forEach(order => {
      distribution[order.status] = (distribution[order.status] || 0) + 1;
    });
    return Object.entries(distribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: orderStatusColors[status]?.replace('bg-', '').replace('text-', '').replace('-100', '').replace('-800', ''),
    }));
  }, [customerOrders]);

  const recentOrders = customerOrders.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/orders/customers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Customer Details</h1>
            <p className="text-muted-foreground">
              View and manage customer information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Customer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      error={errors.firstName?.message}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      error={errors.lastName?.message}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      error={errors.email?.message}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={watch('status')}
                      onValueChange={(value) => setValue('status', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={watch('type')}
                      onValueChange={(value) => setValue('type', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="loyaltyTier">Loyalty Tier</Label>
                    <Select
                      value={watch('loyaltyTier') || ''}
                      onValueChange={(value) => setValue('loyaltyTier', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bronze">Bronze</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {watch('type') === 'business' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        {...register('company')}
                        error={errors.company?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxId">Tax ID</Label>
                      <Input
                        id="taxId"
                        {...register('taxId')}
                        error={errors.taxId?.message}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...register('website')}
                    error={errors.website?.message}
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    rows={3}
                    placeholder="Internal notes about the customer..."
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateCustomerMutation.isPending}
                  >
                    {updateCustomerMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Customer Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={customer.avatar} />
                  <AvatarFallback className="text-lg">
                    {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold">
                      {customer.firstName} {customer.lastName}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(customer.id, 'Customer ID')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={statusColors[customer.status]}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </Badge>
                    <Badge className={typeColors[customer.type]}>
                      {customer.type === 'individual' ? <User className="h-3 w-3 mr-1" /> : <Building className="h-3 w-3 mr-1" />}
                      {customer.type.charAt(0).toUpperCase() + customer.type.slice(1)}
                    </Badge>
                    {customer.loyaltyTier && (
                      <Badge className={loyaltyColors[customer.loyaltyTier]}>
                        <Star className="h-3 w-3 mr-1" />
                        {customer.loyaltyTier.charAt(0).toUpperCase() + customer.loyaltyTier.slice(1)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Customer since {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/orders/create?customerId=${customer.id}`}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Create Order
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Export Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(customer.email, 'Email')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(customer.phone, 'Phone')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {customer.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.company}</span>
                  </div>
                )}
                {customer.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {customer.website}
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {customer.addresses && customer.addresses.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div>{customer.addresses[0].street}</div>
                      <div>
                        {customer.addresses[0].city}, {customer.addresses[0].state} {customer.addresses[0].postalCode}
                      </div>
                      <div>{customer.addresses[0].country}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Registered {format(new Date(customer.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                {customer.lastOrderDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Last order {format(new Date(customer.lastOrderDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
            {customer.notes && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="text-sm font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{customer.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Customer Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Customer Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Orders</span>
                </div>
                <span className="font-semibold">{totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Spent</span>
                </div>
                <span className="font-semibold">${totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Avg Order Value</span>
                </div>
                <span className="font-semibold">${avgOrderValue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Completion Rate</span>
                </div>
                <span className="font-semibold">{completionRate.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          {customer.orderPreferences && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {customer.orderPreferences.preferredShippingMethod && (
                  <div className="flex items-center justify-between">
                    <span>Shipping Method</span>
                    <span className="font-medium">{customer.orderPreferences.preferredShippingMethod}</span>
                  </div>
                )}
                {customer.orderPreferences.preferredPaymentMethod && (
                  <div className="flex items-center justify-between">
                    <span>Payment Method</span>
                    <span className="font-medium">{customer.orderPreferences.preferredPaymentMethod}</span>
                  </div>
                )}
                {customer.orderPreferences.communicationPreferences && (
                  <div>
                    <span>Communication</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {customer.orderPreferences.communicationPreferences.map((pref) => (
                        <Badge key={pref} variant="secondary" className="text-xs">
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Orders ({totalOrders})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order History</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/orders/create?customerId=${customer.id}`}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      New Order
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/orders?customerId=${customer.id}`}>
                      View All Orders
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    This customer hasn't placed any orders yet.
                  </p>
                  <Button asChild>
                    <Link to={`/orders/create?customerId=${customer.id}`}>
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Create First Order
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/orders/${order.id}`}
                            className="hover:underline"
                          >
                            #{order.orderNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge className={orderStatusColors[order.status]}>
                            {order.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                            {order.status === 'shipped' && <Truck className="h-3 w-3 mr-1" />}
                            {order.status === 'delivered' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {order.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                            {order.status === 'returned' && <RotateCcw className="h-3 w-3 mr-1" />}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={priorityColors[order.priority]}>
                            {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${order.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            <CreditCard className="h-3 w-3 mr-1" />
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/orders/${order.id}`}>
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/orders/${order.id}/edit`}>
                                  Edit Order
                                </Link>
                              </DropdownMenuItem>
                              {order.fulfillments && order.fulfillments.length > 0 && (
                                <DropdownMenuItem asChild>
                                  <Link to={`/orders/fulfillments?orderId=${order.id}`}>
                                    View Fulfillments
                                  </Link>
                                </DropdownMenuItem>
                              )}
                              {order.shipments && order.shipments.length > 0 && (
                                <DropdownMenuItem asChild>
                                  <Link to={`/orders/shipments?orderId=${order.id}`}>
                                    View Shipments
                                  </Link>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {monthlyOrderData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Orders & Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyOrderData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="orders" orientation="left" />
                      <YAxis yAxisId="revenue" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="orders" dataKey="orders" fill="#8884d8" name="Orders" />
                      <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue ($)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`#${entry.color}500`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
                <p className="text-muted-foreground">
                  Analytics will be available once the customer places orders.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.addresses && customer.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.addresses.map((address, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">
                          {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                        </Badge>
                        {address.isDefault && (
                          <Badge>Default</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        {address.company && (
                          <div className="font-medium">{address.company}</div>
                        )}
                        <div>{address.firstName} {address.lastName}</div>
                        <div>{address.street}</div>
                        {address.street2 && <div>{address.street2}</div>}
                        <div>{address.city}, {address.state} {address.postalCode}</div>
                        <div>{address.country}</div>
                        {address.phone && (
                          <div className="flex items-center gap-1 mt-2">
                            <Phone className="h-3 w-3" />
                            {address.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Addresses</h3>
                  <p className="text-muted-foreground">
                    No addresses have been added for this customer yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Additional Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.contacts && customer.contacts.length > 0 ? (
                <div className="space-y-4">
                  {customer.contacts.map((contact, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </h4>
                        <Badge variant="outline">
                          {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        {contact.title && (
                          <div className="text-muted-foreground">{contact.title}</div>
                        )}
                        {contact.department && (
                          <div className="text-muted-foreground">{contact.department}</div>
                        )}
                        <div className="flex items-center gap-4">
                          {contact.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </div>
                          )}
                        </div>
                        {contact.notes && (
                          <div className="text-muted-foreground mt-2">
                            {contact.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Additional Contacts</h3>
                  <p className="text-muted-foreground">
                    No additional contacts have been added for this customer.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CustomerDetail; 