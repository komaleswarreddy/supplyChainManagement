import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useFieldArray, useForm, FormProvider } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormCheckbox, FormSection } from '@/components/form';
import { Button } from '@/components/ui/button';
import { useSuppliers } from '@/hooks/useSuppliers';
import type { Supplier, SupplierType, BusinessClassification } from '@/types/supplier';

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER', 'SERVICE_PROVIDER']),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DISQUALIFIED']),
  taxId: z.string().min(1, 'Tax ID is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  description: z.string().optional(),
  yearEstablished: z.number().int().positive().optional(),
  annualRevenue: z.number().positive().optional(),
  employeeCount: z.number().int().positive().optional(),
  businessClassifications: z.array(z.enum([
    'LARGE_ENTERPRISE', 'SMALL_BUSINESS', 'MINORITY_OWNED', 'WOMEN_OWNED', 
    'VETERAN_OWNED', 'DISABLED_OWNED', 'DISADVANTAGED_BUSINESS'
  ])).optional(),
  addresses: z.array(z.object({
    type: z.enum(['HEADQUARTERS', 'BILLING', 'SHIPPING', 'MANUFACTURING', 'OTHER']),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    isPrimary: z.boolean(),
  })).min(1, 'At least one address is required'),
  contacts: z.array(z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    title: z.string().min(1, 'Title is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    isPrimary: z.boolean(),
    department: z.string().optional(),
  })).min(1, 'At least one contact is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  bankInformation: z.object({
    bankName: z.string().min(1, 'Bank name is required'),
    accountName: z.string().min(1, 'Account name is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    routingNumber: z.string().min(1, 'Routing number is required'),
    currency: z.string().min(1, 'Currency is required'),
    swiftCode: z.string().optional(),
    iban: z.string().optional(),
  }).optional(),
  paymentTerms: z.string().optional(),
  preferredCurrency: z.string().optional(),
  notes: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

const defaultValues: SupplierFormData = {
  name: '',
  type: 'MANUFACTURER',
  status: 'DRAFT',
  taxId: '',
  registrationNumber: '',
  website: '',
  industry: '',
  description: '',
  yearEstablished: undefined,
  annualRevenue: undefined,
  employeeCount: undefined,
  businessClassifications: [],
  paymentTerms: '',
  preferredCurrency: 'USD',
  notes: '',
  addresses: [
    {
      type: 'HEADQUARTERS',
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      isPrimary: true,
    },
  ],
  contacts: [
    {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: '',
      isPrimary: true,
      department: '',
    },
  ],
  categories: [''],
  bankInformation: undefined, // Explicitly set as undefined since it's optional
};

// Add debugging for default values
console.log('CreateSupplier: Default values:', defaultValues);

const supplierTypeOptions: { label: string; value: SupplierType }[] = [
  { label: 'Manufacturer', value: 'MANUFACTURER' },
  { label: 'Distributor', value: 'DISTRIBUTOR' },
  { label: 'Wholesaler', value: 'WHOLESALER' },
  { label: 'Retailer', value: 'RETAILER' },
  { label: 'Service Provider', value: 'SERVICE_PROVIDER' },
];

const statusOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Pending Approval', value: 'PENDING_APPROVAL' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

const addressTypeOptions = [
  { label: 'Headquarters', value: 'HEADQUARTERS' },
  { label: 'Billing', value: 'BILLING' },
  { label: 'Shipping', value: 'SHIPPING' },
  { label: 'Manufacturing', value: 'MANUFACTURING' },
  { label: 'Other', value: 'OTHER' },
];

const businessClassificationOptions: { label: string; value: BusinessClassification }[] = [
  { label: 'Large Enterprise', value: 'LARGE_ENTERPRISE' },
  { label: 'Small Business', value: 'SMALL_BUSINESS' },
  { label: 'Minority Owned', value: 'MINORITY_OWNED' },
  { label: 'Women Owned', value: 'WOMEN_OWNED' },
  { label: 'Veteran Owned', value: 'VETERAN_OWNED' },
  { label: 'Disabled Owned', value: 'DISABLED_OWNED' },
  { label: 'Disadvantaged Business', value: 'DISADVANTAGED_BUSINESS' },
];

const currencyOptions = [
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' },
  { label: 'CAD - Canadian Dollar', value: 'CAD' },
  { label: 'AUD - Australian Dollar', value: 'AUD' },
  { label: 'JPY - Japanese Yen', value: 'JPY' },
  { label: 'CNY - Chinese Yuan', value: 'CNY' },
];

export function CreateSupplier() {
  const navigate = useNavigate();
  const { useCreateSupplier } = useSuppliers();
  const { mutate: createSupplier, isLoading } = useCreateSupplier();

  console.log('CreateSupplier: Component rendering');

  const onSubmit = async (data: SupplierFormData) => {
    console.log('CreateSupplier: Form submitted with data:', data);
    createSupplier(data as Omit<Supplier, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'createdBy' | 'audit'>, {
      onSuccess: (response) => {
        console.log('CreateSupplier: Success - navigating to:', response.data.id);
        navigate(`/suppliers/${response.data.id}`);
      },
      onError: (error) => {
        console.error('CreateSupplier: Error creating supplier:', error);
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Add Supplier"
        description="Create a new supplier record"
        schema={supplierSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Creating...' : 'Create Supplier'}
        cancelText="Cancel"
        onCancel={() => navigate('/suppliers')}
        showReset
      >
        {({ control, getValues, watch }) => {
          console.log('CreateSupplier: Form render function called');
          console.log('CreateSupplier: Form control:', control);
          console.log('CreateSupplier: Form getValues:', getValues());
          
          const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
            control,
            name: 'addresses',
          });

          const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
            control,
            name: 'contacts',
          });

          const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
            control,
            name: 'categories',
          });

          console.log('CreateSupplier: Field arrays - addresses:', addressFields.length, 'contacts:', contactFields.length, 'categories:', categoryFields.length);

          return (
            <>
              <FormSection title="Basic Information">
                <div>Debug: Basic Information section rendering</div>
                <FormInput
                  name="name"
                  label="Supplier Name"
                  placeholder="Enter supplier name"
                />
                <FormSelect
                  name="type"
                  label="Supplier Type"
                  options={supplierTypeOptions}
                />
                <FormInput
                  name="taxId"
                  label="Tax ID"
                  placeholder="Enter tax ID"
                />
                <FormInput
                  name="registrationNumber"
                  label="Registration Number"
                  placeholder="Enter registration number"
                />
                <FormInput
                  name="website"
                  label="Website"
                  placeholder="https://example.com"
                />
                <FormInput
                  name="industry"
                  label="Industry"
                  placeholder="Enter industry"
                />
                <FormTextarea
                  name="description"
                  label="Description"
                  placeholder="Enter supplier description"
                  className="col-span-2"
                />
              </FormSection>

              <FormSection title="Additional Details">
                <div>Debug: Additional Details section rendering</div>
                <FormInput
                  name="yearEstablished"
                  label="Year Established"
                  type="number"
                  placeholder="Enter year established"
                />
                <FormInput
                  name="annualRevenue"
                  label="Annual Revenue"
                  type="number"
                  placeholder="Enter annual revenue"
                />
                <FormInput
                  name="employeeCount"
                  label="Employee Count"
                  type="number"
                  placeholder="Enter number of employees"
                />
                <FormInput
                  name="paymentTerms"
                  label="Payment Terms"
                  placeholder="e.g., Net 30"
                />
                <FormSelect
                  name="preferredCurrency"
                  label="Preferred Currency"
                  options={currencyOptions}
                />
              </FormSection>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Business Classifications</h3>
                </div>
                <div>Debug: Business Classifications section rendering</div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {businessClassificationOptions.map((option) => (
                    <FormCheckbox
                      key={option.value}
                      name="businessClassifications"
                      label=""
                      checkboxLabel={option.label}
                      value={option.value}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Addresses</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendAddress({
                        type: 'OTHER',
                        street: '',
                        city: '',
                        state: '',
                        country: '',
                        postalCode: '',
                        isPrimary: false,
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </Button>
                    {addressFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAddress(addressFields.length - 1)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Address
                      </Button>
                    )}
                  </div>
                </div>
                <div>Debug: Addresses section rendering, {addressFields.length} fields</div>
                {addressFields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border bg-card p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormSelect
                        name={`addresses.${index}.type`}
                        label="Address Type"
                        options={addressTypeOptions}
                      />
                      <FormInput
                        name={`addresses.${index}.street`}
                        label="Street"
                        placeholder="Enter street address"
                      />
                      <FormInput
                        name={`addresses.${index}.city`}
                        label="City"
                        placeholder="Enter city"
                      />
                      <FormInput
                        name={`addresses.${index}.state`}
                        label="State/Province"
                        placeholder="Enter state or province"
                      />
                      <FormInput
                        name={`addresses.${index}.country`}
                        label="Country"
                        placeholder="Enter country"
                      />
                      <FormInput
                        name={`addresses.${index}.postalCode`}
                        label="Postal Code"
                        placeholder="Enter postal code"
                      />
                      <FormCheckbox
                        name={`addresses.${index}.isPrimary`}
                        label=""
                        checkboxLabel="Primary Address"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Contacts</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendContact({
                        firstName: '',
                        lastName: '',
                        title: '',
                        email: '',
                        phone: '',
                        isPrimary: false,
                        department: '',
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                    {contactFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeContact(contactFields.length - 1)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Contact
                      </Button>
                    )}
                  </div>
                </div>
                <div>Debug: Contacts section rendering, {contactFields.length} fields</div>
                {contactFields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border bg-card p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput
                        name={`contacts.${index}.firstName`}
                        label="First Name"
                        placeholder="Enter first name"
                      />
                      <FormInput
                        name={`contacts.${index}.lastName`}
                        label="Last Name"
                        placeholder="Enter last name"
                      />
                      <FormInput
                        name={`contacts.${index}.title`}
                        label="Title"
                        placeholder="Enter job title"
                      />
                      <FormInput
                        name={`contacts.${index}.email`}
                        label="Email"
                        type="email"
                        placeholder="Enter email address"
                      />
                      <FormInput
                        name={`contacts.${index}.phone`}
                        label="Phone"
                        placeholder="Enter phone number"
                      />
                      <FormInput
                        name={`contacts.${index}.department`}
                        label="Department"
                        placeholder="Enter department"
                      />
                      <FormCheckbox
                        name={`contacts.${index}.isPrimary`}
                        label=""
                        checkboxLabel="Primary Contact"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Categories</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendCategory('')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                    {categoryFields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCategory(categoryFields.length - 1)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Category
                      </Button>
                    )}
                  </div>
                </div>
                <div>Debug: Categories section rendering, {categoryFields.length} fields</div>
                {categoryFields.map((field, index) => (
                  <div key={field.id} className="rounded-lg border bg-card p-6">
                    <FormInput
                      name={`categories.${index}`}
                      label={`Category ${index + 1}`}
                      placeholder="Enter category name"
                    />
                  </div>
                ))}
              </div>
            </>
          );
        }}
      </FormContainer>
    </div>
  );
}

export default CreateSupplier;