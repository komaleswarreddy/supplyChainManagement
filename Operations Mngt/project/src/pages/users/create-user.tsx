import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormSelect, FormCheckbox } from '@/components/form';
import { useUsers } from '@/hooks/useUsers';
import type { User } from '@/types/user';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  employeeId: z.string().optional(),
  phoneNumber: z.string().optional(),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
  status: z.enum(['active', 'inactive', 'pending']),
  mfaEnabled: z.boolean(),
  preferences: z.object({
    language: z.string(),
    timezone: z.string(),
    theme: z.enum(['light', 'dark', 'system']),
    notifications: z.object({
      email: z.boolean(),
      inApp: z.boolean(),
      desktop: z.boolean(),
    }),
  }),
  metadata: z.object({
    costCenter: z.string().optional(),
    location: z.string().optional(),
    division: z.string().optional(),
  }).optional(),
  supervisor: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }).optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const defaultValues: UserFormData = {
  email: '',
  firstName: '',
  lastName: '',
  department: '',
  roles: ['user'],
  status: 'active',
  mfaEnabled: false,
  preferences: {
    language: 'en-US',
    timezone: 'America/New_York',
    theme: 'system',
    notifications: {
      email: true,
      inApp: true,
      desktop: false,
    },
  },
};

export function CreateUser() {
  const navigate = useNavigate();
  const { useCreateUser } = useUsers();
  const { mutate: createUser, isLoading } = useCreateUser();

  const onSubmit = async (data: UserFormData) => {
    createUser(data as Omit<User, 'id' | 'createdAt' | 'updatedAt'>, {
      onSuccess: () => {
        navigate('/users');
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Create User"
        description="Create a new user account"
        schema={userSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Creating...' : 'Create User'}
        cancelText="Cancel"
        onCancel={() => navigate('/users')}
        showReset
      >
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormInput
              name="firstName"
              label="First Name"
              placeholder="Enter first name"
            />
            <FormInput
              name="lastName"
              label="Last Name"
              placeholder="Enter last name"
            />
            <FormInput
              name="email"
              label="Email"
              type="email"
              placeholder="Enter email address"
            />
            <FormInput
              name="employeeId"
              label="Employee ID"
              placeholder="Enter employee ID"
            />
            <FormInput
              name="title"
              label="Title"
              placeholder="Enter job title"
            />
            <FormInput
              name="department"
              label="Department"
              placeholder="Enter department"
            />
            <FormInput
              name="phoneNumber"
              label="Phone Number"
              placeholder="Enter phone number"
            />
            <FormSelect
              name="status"
              label="Status"
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Pending', value: 'pending' },
              ]}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Roles & Permissions</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormCheckbox
                name="roles"
                label="User Role"
                checkboxLabel="Basic User"
                value="user"
              />
              <FormCheckbox
                name="roles"
                label="Manager Role"
                checkboxLabel="Manager"
                value="manager"
              />
              <FormCheckbox
                name="roles"
                label="Approver Role"
                checkboxLabel="Approver"
                value="approver"
              />
              <FormCheckbox
                name="roles"
                label="Admin Role"
                checkboxLabel="Administrator"
                value="admin"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Preferences</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect
                name="preferences.language"
                label="Language"
                options={[
                  { label: 'English (US)', value: 'en-US' },
                  { label: 'English (UK)', value: 'en-GB' },
                  { label: 'Spanish', value: 'es' },
                ]}
              />
              <FormSelect
                name="preferences.timezone"
                label="Timezone"
                options={[
                  { label: 'Eastern Time', value: 'America/New_York' },
                  { label: 'Pacific Time', value: 'America/Los_Angeles' },
                  { label: 'UTC', value: 'UTC' },
                ]}
              />
              <FormSelect
                name="preferences.theme"
                label="Theme"
                options={[
                  { label: 'System', value: 'system' },
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                ]}
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Notification Preferences</h4>
              <div className="grid gap-2">
                <FormCheckbox
                  name="preferences.notifications.email"
                  label="Email Notifications"
                  checkboxLabel="Receive email notifications"
                />
                <FormCheckbox
                  name="preferences.notifications.inApp"
                  label="In-App Notifications"
                  checkboxLabel="Receive in-app notifications"
                />
                <FormCheckbox
                  name="preferences.notifications.desktop"
                  label="Desktop Notifications"
                  checkboxLabel="Receive desktop notifications"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Security</h3>
            <FormCheckbox
              name="mfaEnabled"
              label="Multi-Factor Authentication"
              checkboxLabel="Enable MFA for this user"
              description="Require multi-factor authentication for additional security"
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Additional Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                name="metadata.costCenter"
                label="Cost Center"
                placeholder="Enter cost center"
              />
              <FormInput
                name="metadata.location"
                label="Location"
                placeholder="Enter location"
              />
              <FormInput
                name="metadata.division"
                label="Division"
                placeholder="Enter division"
              />
            </div>
          </div>
        </div>
      </FormContainer>
    </div>
  );
}

export default CreateUser;