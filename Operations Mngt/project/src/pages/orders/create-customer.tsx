import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateCustomer } from '@/services/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/useToast';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  Globe,
  FileText,
  Save,
  UserPlus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const addressSchema = z.object({
  type: z.enum(['billing', 'shipping']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  street: z.string().min(1, 'Street address is required'),
  street2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

const contactSchema = z.object({
  type: z.enum(['primary', 'billing', 'shipping', 'technical', 'other']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

const orderPreferencesSchema = z.object({
  preferredShippingMethod: z.string().optional(),
  preferredPaymentMethod: z.string().optional(),
  communicationPreferences: z.array(z.string()).optional(),
  specialInstructions: z.string().optional(),
});

const createCustomerSchema = z.object({
  // Basic Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  
  // Customer Details
  status: z.enum(['active', 'inactive']).default('active'),
  type: z.enum(['individual', 'business']).default('individual'),
  loyaltyTier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
  
  // Business Information (conditional)
  company: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  taxId: z.string().optional(),
  
  // Additional Information
  notes: z.string().optional(),
  
  // Addresses
  addresses: z.array(addressSchema).min(1, 'At least one address is required'),
  
  // Contacts
  contacts: z.array(contactSchema).optional(),
  
  // Order Preferences
  orderPreferences: orderPreferencesSchema.optional(),
});

type CreateCustomerForm = z.infer<typeof createCustomerSchema>;

const communicationOptions = [
  'email_order_updates',
  'email_promotions',
  'sms_order_updates',
  'phone_support',
];

const communicationLabels = {
  email_order_updates: 'Email Order Updates',
  email_promotions: 'Email Promotions',
  sms_order_updates: 'SMS Order Updates',
  phone_support: 'Phone Support',
};

export function CreateCustomer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const createCustomerMutation = useCreateCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    trigger,
    getValues,
  } = useForm<CreateCustomerForm>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      status: 'active',
      type: 'individual',
      addresses: [
        {
          type: 'billing',
          firstName: '',
          lastName: '',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'US',
          isDefault: true,
        }
      ],
      contacts: [],
      orderPreferences: {
        communicationPreferences: ['email_order_updates'],
      },
    },
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control,
    name: 'addresses',
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: 'contacts',
  });

  const watchType = watch('type');
  const watchCommunicationPrefs = watch('orderPreferences.communicationPreferences') || [];

  const onSubmit = (data: CreateCustomerForm) => {
    // Clean up data
    const cleanData = {
      ...data,
      website: data.website || undefined,
      company: watchType === 'business' ? data.company : undefined,
      taxId: watchType === 'business' ? data.taxId : undefined,
      contacts: data.contacts?.filter(contact => contact.firstName && contact.lastName) || [],
    };

    createCustomerMutation.mutate(cleanData, {
      onSuccess: (customer) => {
        toast({
          title: 'Customer Created',
          description: `Customer ${customer.firstName} ${customer.lastName} has been successfully created.`,
        });
        navigate(`/orders/customers/${customer.id}`);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create customer',
          variant: 'destructive',
        });
      },
    });
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof CreateCustomerForm)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'type', 'status'];
        if (watchType === 'business') {
          fieldsToValidate.push('company', 'taxId', 'website');
        }
        break;
      case 2:
        fieldsToValidate = ['addresses'];
        break;
      case 3:
        // Contacts are optional, no validation needed
        break;
      case 4:
        // Preferences are optional
        break;
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addAddress = () => {
    const hasShipping = addressFields.some(field => getValues(`addresses.${addressFields.indexOf(field)}.type`) === 'shipping');
    appendAddress({
      type: hasShipping ? 'billing' : 'shipping',
      firstName: getValues('firstName') || '',
      lastName: getValues('lastName') || '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      isDefault: false,
    });
  };

  const addContact = () => {
    appendContact({
      type: 'other',
      firstName: '',
      lastName: '',
      title: '',
      department: '',
      email: '',
      phone: '',
      notes: '',
    });
  };

  const toggleCommunicationPreference = (pref: string) => {
    const current = watchCommunicationPrefs;
    const updated = current.includes(pref)
      ? current.filter(p => p !== pref)
      : [...current, pref];
    setValue('orderPreferences.communicationPreferences', updated);
  };

  const copyAddressDetails = (fromIndex: number, toIndex: number) => {
    const fromAddress = getValues(`addresses.${fromIndex}`);
    setValue(`addresses.${toIndex}.firstName`, fromAddress.firstName);
    setValue(`addresses.${toIndex}.lastName`, fromAddress.lastName);
    setValue(`addresses.${toIndex}.company`, fromAddress.company);
    setValue(`addresses.${toIndex}.street`, fromAddress.street);
    setValue(`addresses.${toIndex}.street2`, fromAddress.street2);
    setValue(`addresses.${toIndex}.city`, fromAddress.city);
    setValue(`addresses.${toIndex}.state`, fromAddress.state);
    setValue(`addresses.${toIndex}.postalCode`, fromAddress.postalCode);
    setValue(`addresses.${toIndex}.country`, fromAddress.country);
    setValue(`addresses.${toIndex}.phone`, fromAddress.phone);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold">Create New Customer</h1>
            <p className="text-muted-foreground">
              Add a new customer to your system
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Basic Info</span>
            <span>Addresses</span>
            <span>Contacts</span>
            <span>Preferences</span>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    error={errors.phone?.message}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="type">Customer Type *</Label>
                  <Select
                    value={watchType}
                    onValueChange={(value) => setValue('type', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Individual
                        </div>
                      </SelectItem>
                      <SelectItem value="business">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Business
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="loyaltyTier">Loyalty Tier</Label>
                  <Select
                    value={watch('loyaltyTier') || 'none'}
                    onValueChange={(value) => setValue('loyaltyTier', value === 'none' ? '' : value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {watchType === 'business' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="company">Company Name</Label>
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
                          placeholder="XX-XXXXXXX"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        {...register('website')}
                        error={errors.website?.message}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  rows={3}
                  placeholder="Any additional notes about the customer..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Addresses */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Customer Addresses
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAddress}
                  disabled={addressFields.length >= 4}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {addressFields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Address {index + 1}
                      </Badge>
                      <Select
                        value={watch(`addresses.${index}.type`)}
                        onValueChange={(value) => setValue(`addresses.${index}.type`, value as any)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="shipping">Shipping</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`default-${index}`}
                          checked={watch(`addresses.${index}.isDefault`)}
                          onCheckedChange={(checked) => {
                            // Only one address can be default
                            addressFields.forEach((_, i) => {
                              setValue(`addresses.${i}.isDefault`, i === index && !!checked);
                            });
                          }}
                        />
                        <Label htmlFor={`default-${index}`} className="text-sm">
                          Default
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {addressFields.length > 1 && index > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyAddressDetails(0, index)}
                        >
                          Copy from Address 1
                        </Button>
                      )}
                      {addressFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAddress(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`addresses.${index}.firstName`}>First Name *</Label>
                      <Input
                        {...register(`addresses.${index}.firstName`)}
                        error={errors.addresses?.[index]?.firstName?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`addresses.${index}.lastName`}>Last Name *</Label>
                      <Input
                        {...register(`addresses.${index}.lastName`)}
                        error={errors.addresses?.[index]?.lastName?.message}
                      />
                    </div>
                  </div>

                  {watchType === 'business' && (
                    <div>
                      <Label htmlFor={`addresses.${index}.company`}>Company</Label>
                      <Input
                        {...register(`addresses.${index}.company`)}
                        error={errors.addresses?.[index]?.company?.message}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor={`addresses.${index}.street`}>Street Address *</Label>
                    <Input
                      {...register(`addresses.${index}.street`)}
                      error={errors.addresses?.[index]?.street?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`addresses.${index}.street2`}>Apartment, suite, etc.</Label>
                    <Input
                      {...register(`addresses.${index}.street2`)}
                      error={errors.addresses?.[index]?.street2?.message}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`addresses.${index}.city`}>City *</Label>
                      <Input
                        {...register(`addresses.${index}.city`)}
                        error={errors.addresses?.[index]?.city?.message}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`addresses.${index}.state`}>State *</Label>
                      <Input
                        {...register(`addresses.${index}.state`)}
                        error={errors.addresses?.[index]?.state?.message}
                        placeholder="CA"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`addresses.${index}.postalCode`}>Postal Code *</Label>
                      <Input
                        {...register(`addresses.${index}.postalCode`)}
                        error={errors.addresses?.[index]?.postalCode?.message}
                        placeholder="12345"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`addresses.${index}.country`}>Country *</Label>
                      <Select
                        value={watch(`addresses.${index}.country`)}
                        onValueChange={(value) => setValue(`addresses.${index}.country`, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="MX">Mexico</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="DE">Germany</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`addresses.${index}.phone`}>Phone</Label>
                      <Input
                        {...register(`addresses.${index}.phone`)}
                        error={errors.addresses?.[index]?.phone?.message}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Additional Contacts */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Additional Contacts
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContact}
                  disabled={contactFields.length >= 5}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactFields.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Additional Contacts</h3>
                  <p className="text-muted-foreground mb-4">
                    Add additional contacts for this customer account (optional).
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addContact}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Contact
                  </Button>
                </div>
              ) : (
                contactFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          Contact {index + 1}
                        </Badge>
                        <Select
                          value={watch(`contacts.${index}.type`)}
                          onValueChange={(value) => setValue(`contacts.${index}.type`, value as any)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="shipping">Shipping</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeContact(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`contacts.${index}.firstName`}>First Name *</Label>
                        <Input
                          {...register(`contacts.${index}.firstName`)}
                          error={errors.contacts?.[index]?.firstName?.message}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`contacts.${index}.lastName`}>Last Name *</Label>
                        <Input
                          {...register(`contacts.${index}.lastName`)}
                          error={errors.contacts?.[index]?.lastName?.message}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`contacts.${index}.title`}>Job Title</Label>
                        <Input
                          {...register(`contacts.${index}.title`)}
                          error={errors.contacts?.[index]?.title?.message}
                          placeholder="e.g. Purchasing Manager"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`contacts.${index}.department`}>Department</Label>
                        <Input
                          {...register(`contacts.${index}.department`)}
                          error={errors.contacts?.[index]?.department?.message}
                          placeholder="e.g. Procurement"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`contacts.${index}.email`}>Email</Label>
                        <Input
                          type="email"
                          {...register(`contacts.${index}.email`)}
                          error={errors.contacts?.[index]?.email?.message}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`contacts.${index}.phone`}>Phone</Label>
                        <Input
                          {...register(`contacts.${index}.phone`)}
                          error={errors.contacts?.[index]?.phone?.message}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`contacts.${index}.notes`}>Notes</Label>
                      <Textarea
                        {...register(`contacts.${index}.notes`)}
                        rows={2}
                        placeholder="Additional notes about this contact..."
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Order Preferences */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Order Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredShippingMethod">Preferred Shipping Method</Label>
                  <Select
                    value={watch('orderPreferences.preferredShippingMethod') || 'none'}
                    onValueChange={(value) => setValue('orderPreferences.preferredShippingMethod', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shipping method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No preference</SelectItem>
                      <SelectItem value="standard">Standard Shipping</SelectItem>
                      <SelectItem value="expedited">Expedited Shipping</SelectItem>
                      <SelectItem value="overnight">Overnight Shipping</SelectItem>
                      <SelectItem value="pickup">Store Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preferredPaymentMethod">Preferred Payment Method</Label>
                  <Select
                    value={watch('orderPreferences.preferredPaymentMethod') || 'none'}
                    onValueChange={(value) => setValue('orderPreferences.preferredPaymentMethod', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No preference</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="net_terms">Net Terms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Communication Preferences</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {communicationOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={watchCommunicationPrefs.includes(option)}
                        onCheckedChange={() => toggleCommunicationPreference(option)}
                      />
                      <Label htmlFor={option} className="text-sm">
                        {communicationLabels[option]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  {...register('orderPreferences.specialInstructions')}
                  rows={3}
                  placeholder="Any special handling instructions, delivery preferences, etc."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
              >
                Previous
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createCustomerMutation.isPending}
              >
                {createCustomerMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Customer...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Customer
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateCustomer; 