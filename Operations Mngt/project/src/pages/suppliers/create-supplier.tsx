import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useFieldArray, useForm, FormProvider } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormCheckbox, FormSection } from '@/components/form';
import { Button } from '@/components/ui/button';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useToast } from '@/hooks/useToast';
import { useTenantStore } from '@/stores/tenant-store';
import type { Supplier, SupplierType, BusinessClassification } from '@/types/supplier';
import { keycloak } from '@/lib/keycloak';

const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'WHOLESALER', 'RETAILER', 'SERVICE_PROVIDER']),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'DISQUALIFIED']),
  taxId: z.string().min(1, 'Tax ID is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  description: z.string().optional(),
  yearEstablished: z.string().optional(),
  annualRevenue: z.string().optional(),
  employeeCount: z.string().optional(),
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
    bankName: z.string().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    currency: z.string().optional(),
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
  yearEstablished: '',
  annualRevenue: '',
  employeeCount: '',
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
  bankInformation: {
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    currency: 'USD',
    swiftCode: '',
    iban: '',
  },
};

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

const businessClassificationOptions = [
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
];

export function CreateSupplier() {
  const navigate = useNavigate();
  const { useCreateSupplier } = useSuppliers();
  const createSupplierMutation = useCreateSupplier();
  const { toast } = useToast();
  
  // Initialize tenant store if needed
  React.useEffect(() => {
    const tenantStore = useTenantStore.getState();
    console.log('CreateSupplier - Tenant Store State:', tenantStore);
    
    if (!tenantStore.currentTenant) {
      console.log('No current tenant, fetching user tenants...');
      tenantStore.fetchUserTenants();
    }
  }, []);

  const onSubmit = async (data: SupplierFormData) => {
    try {
      console.log('=== FORM SUBMISSION STARTED ===');
      console.log('Form data being submitted:', data);
      
      // Check tenant store state before submission
      const tenantStore = useTenantStore.getState();
      console.log('Tenant store state before submission:', tenantStore);
      
      // Check if user is authenticated
      if (!keycloak.authenticated) {
        console.error('User is not authenticated');
        toast.error('Please log in to create a supplier');
        return;
      }
      
      // Check if tenant is selected
      if (!tenantStore.currentTenant?.id) {
        console.error('No tenant selected');
        toast.error('Please select a tenant');
        return;
      }
      
      // Transform the data to match backend expectations
      const transformedData = {
        ...data,
        // Convert empty strings to undefined for optional fields
        yearEstablished: data.yearEstablished && data.yearEstablished.trim() !== '' ? parseInt(data.yearEstablished, 10) : undefined,
        annualRevenue: data.annualRevenue && data.annualRevenue.trim() !== '' ? parseFloat(data.annualRevenue) : undefined,
        employeeCount: data.employeeCount && data.employeeCount.trim() !== '' ? parseInt(data.employeeCount, 10) : undefined,
        // Filter out empty categories
        categories: data.categories.filter(cat => cat.trim() !== ''),
        // Handle bank information - only include if at least one field is filled
        bankInformation: data.bankInformation && 
          (data.bankInformation.bankName || data.bankInformation.accountName || data.bankInformation.accountNumber) 
          ? data.bankInformation 
          : undefined,
      };
      
      console.log('Transformed data:', transformedData);
      
      createSupplierMutation.mutate(transformedData as Omit<Supplier, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'createdBy' | 'audit'>, {
        onSuccess: (response) => {
          console.log('Supplier created successfully:', response);
          toast.success('Supplier created successfully!');
          navigate(`/suppliers/${response.data.id}`);
        },
        onError: (error: any) => {
          console.error('Error creating supplier:', error);
          const errorMessage = error?.message || error?.response?.data?.message || 'Unknown error occurred';
          toast.error(`Error creating supplier: ${errorMessage}`);
        },
      });
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      toast.error(`Error submitting form: ${errorMessage}`);
    }
    console.log('=== FORM SUBMISSION ENDED ===');
  };

  // Show mutation error if it exists
  React.useEffect(() => {
    if (createSupplierMutation.error) {
      console.error('Mutation error:', createSupplierMutation.error);
      const errorMessage = createSupplierMutation.error?.message || 'Failed to create supplier';
      toast.error(errorMessage);
    }
  }, [createSupplierMutation.error, toast]);

  return (
    <div className="space-y-6 p-6">
      {/* Debug information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Authenticated:</strong> {keycloak.authenticated ? 'Yes' : 'No'}</div>
          <div><strong>Token:</strong> {keycloak.token ? 'Present' : 'Missing'}</div>
          <div><strong>Current Tenant:</strong> {useTenantStore.getState().currentTenant?.name || 'None'}</div>
          <div><strong>Tenant ID:</strong> {useTenantStore.getState().currentTenant?.id || 'None'}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            console.log('Keycloak state:', keycloak);
            console.log('Tenant store state:', useTenantStore.getState());
          }}
          className="mt-2 px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs"
        >
          Log Debug Info
        </button>
      </div>
      
      <FormContainer
        title="Add Supplier"
        description="Create a new supplier record"
        schema={supplierSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={createSupplierMutation.isPending ? 'Creating...' : 'Create Supplier'}
        cancelText="Cancel"
        onCancel={() => navigate('/suppliers')}
        showReset
      >
        {({ control, getValues, watch }) => {
          
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

          return (
            <>
              <FormSection title="Basic Information">
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
                <FormSelect
                  name="status"
                  label="Status"
                  options={statusOptions}
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

              <FormSection title="Business Details">
                <FormInput
                  name="yearEstablished"
                  label="Year Established"
                  placeholder="e.g., 1990"
                  type="number"
                />
                <FormInput
                  name="annualRevenue"
                  label="Annual Revenue"
                  placeholder="e.g., 1000000"
                  type="number"
                />
                <FormInput
                  name="employeeCount"
                  label="Employee Count"
                  placeholder="e.g., 100"
                  type="number"
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
                <FormTextarea
                  name="notes"
                  label="Notes"
                  placeholder="Additional notes"
                  className="col-span-2"
                />
              </FormSection>

              <FormSection title="Categories">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Product/Service Categories</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendCategory('')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {categoryFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <FormInput
                          name={`categories.${index}`}
                          label={`Category ${index + 1}`}
                          placeholder="Enter category name"
                          className="flex-1"
                        />
                        {categoryFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCategory(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </FormSection>

              <FormSection title="Addresses">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Addresses</h3>
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
                  </div>
                  <div className="space-y-4">
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
                        {addressFields.length > 1 && (
                          <div className="mt-4 flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeAddress(index)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Address
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </FormSection>

              <FormSection title="Contacts">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Contacts</h3>
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
                  </div>
                  <div className="space-y-4">
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
                        {contactFields.length > 1 && (
                          <div className="mt-4 flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeContact(index)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Contact
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </FormSection>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Bank Information</h3>
                </div>
                <div className="rounded-lg border bg-card p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      name="bankInformation.bankName"
                      label="Bank Name"
                      placeholder="Enter bank name"
                    />
                    <FormInput
                      name="bankInformation.accountName"
                      label="Account Name"
                      placeholder="Enter account name"
                    />
                    <FormInput
                      name="bankInformation.accountNumber"
                      label="Account Number"
                      placeholder="Enter account number"
                    />
                    <FormInput
                      name="bankInformation.routingNumber"
                      label="Routing Number"
                      placeholder="Enter routing number"
                    />
                    <FormSelect
                      name="bankInformation.currency"
                      label="Currency"
                      options={currencyOptions}
                    />
                    <FormInput
                      name="bankInformation.swiftCode"
                      label="SWIFT Code"
                      placeholder="Enter SWIFT code (optional)"
                    />
                    <FormInput
                      name="bankInformation.iban"
                      label="IBAN"
                      placeholder="Enter IBAN (optional)"
                      className="col-span-2"
                    />
                  </div>
                </div>
              </div>
            </>
          );
        }}
      </FormContainer>
    </div>
  );
}

export default CreateSupplier;