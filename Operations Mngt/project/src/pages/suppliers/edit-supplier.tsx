import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormCheckbox, FormSection } from '@/components/form';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Disqualified', value: 'DISQUALIFIED' },
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

export function EditSupplier() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useSupplier, useUpdateSupplier } = useSuppliers();
  
  const { data: supplier, isLoading: isLoadingSupplier } = useSupplier(id!);
  const { mutate: updateSupplier, isLoading: isUpdating } = useUpdateSupplier();

  if (isLoadingSupplier || !supplier) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const onSubmit = async (data: SupplierFormData) => {
    updateSupplier(
      { id: id!, data },
      {
        onSuccess: () => {
          navigate(`/suppliers/${id}`);
        },
      }
    );
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Edit Supplier"
        description={`Edit details for ${supplier.name}`}
        schema={supplierSchema}
        defaultValues={supplier}
        onSubmit={onSubmit}
        submitText={isUpdating ? 'Saving...' : 'Save Changes'}
        cancelText="Cancel"
        onCancel={() => navigate(`/suppliers/${id}`)}
        showReset
      >
        {({ control }) => {
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
                <FormSelect
                  name="status"
                  label="Status"
                  options={statusOptions}
                />
              </FormSection>

              <FormSection title="Additional Details">
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
                  <h2 className="text-xl font-semibold">Business Classifications</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {businessClassificationOptions.map((option) => (
                    <FormCheckbox
                      key={option.value}
                      name="businessClassifications"
                      label={option.label}
                      checkboxLabel={option.label}
                      value={option.value}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Addresses</h2>
                  <Button
                    type="button"
                    onClick={() =>
                      appendAddress({
                        type: 'SHIPPING',
                        street: '',
                        city: '',
                        state: '',
                        country: '',
                        postalCode: '',
                        isPrimary: false,
                      })
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Address
                  </Button>
                </div>

                {addressFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border p-6"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <FormSelect
                        name={`addresses.${index}.type`}
                        label="Address Type"
                        options={addressTypeOptions}
                      />
                      <FormCheckbox
                        name={`addresses.${index}.isPrimary`}
                        label="Primary Address"
                        checkboxLabel="This is the primary address"
                      />
                      <div className="sm:col-span-2 lg:col-span-3">
                        <FormInput
                          name={`addresses.${index}.street`}
                          label="Street Address"
                          placeholder="Enter street address"
                        />
                      </div>
                      <FormInput
                        name={`addresses.${index}.city`}
                        label="City"
                        placeholder="Enter city"
                      />
                      <FormInput
                        name={`addresses.${index}.state`}
                        label="State/Province"
                        placeholder="Enter state/province"
                      />
                      <FormInput
                        name={`addresses.${index}.postalCode`}
                        label="Postal Code"
                        placeholder="Enter postal code"
                      />
                      <FormInput
                        name={`addresses.${index}.country`}
                        label="Country"
                        placeholder="Enter country"
                      />
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeAddress(index)}
                        disabled={addressFields.length === 1}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Address
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Contacts</h2>
                  <Button
                    type="button"
                    onClick={() =>
                      appendContact({
                        firstName: '',
                        lastName: '',
                        title: '',
                        email: '',
                        phone: '',
                        isPrimary: false,
                        department: '',
                      })
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Contact
                  </Button>
                </div>

                {contactFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border p-6"
                  >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      <div className="col-span-3">
                        <FormCheckbox
                          name={`contacts.${index}.isPrimary`}
                          label="Primary Contact"
                          checkboxLabel="This is the primary contact"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeContact(index)}
                        disabled={contactFields.length === 1}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Contact
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Categories</h2>
                  <Button
                    type="button"
                    onClick={() => appendCategory('')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                </div>

                {categoryFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormInput
                      name={`categories.${index}`}
                      label={index === 0 ? "Category" : ""}
                      placeholder="Enter product/service category"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeCategory(index)}
                      disabled={categoryFields.length === 1}
                      className="mt-auto mb-0.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <FormSection title="Banking Information">
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
                  placeholder="Enter SWIFT code (international)"
                />
                <FormInput
                  name="bankInformation.iban"
                  label="IBAN"
                  placeholder="Enter IBAN (international)"
                />
              </FormSection>

              <FormSection title="Additional Information">
                <FormTextarea
                  name="notes"
                  label="Notes"
                  placeholder="Enter any additional notes"
                  className="col-span-2"
                />
              </FormSection>
            </>
          );
        }}
      </FormContainer>
    </div>
  );
}

export default EditSupplier;