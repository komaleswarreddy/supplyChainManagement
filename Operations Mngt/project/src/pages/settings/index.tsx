import React from 'react';
import { z } from 'zod';
import { Settings } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FormContainer, FormInput, FormSelect, FormCheckbox } from '@/components/form';

const generalSettingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  dateFormat: z.string().min(1, 'Date format is required'),
  currency: z.string().min(1, 'Currency is required'),
  language: z.string().min(1, 'Language is required'),
  fiscalYearStart: z.string().min(1, 'Fiscal year start is required'),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  stockAlerts: z.boolean(),
  approvalReminders: z.boolean(),
  systemUpdates: z.boolean(),
  dailyReports: z.boolean(),
});

const securitySettingsSchema = z.object({
  passwordPolicy: z.object({
    minLength: z.number().min(8, 'Minimum length must be at least 8'),
    requireUppercase: z.boolean(),
    requireLowercase: z.boolean(),
    requireNumbers: z.boolean(),
    requireSpecialChars: z.boolean(),
    expiryDays: z.number().min(0),
  }),
  sessionTimeout: z.number().min(5, 'Session timeout must be at least 5 minutes'),
  mfaEnabled: z.boolean(),
  ipWhitelist: z.array(z.string()),
});

const workflowSettingsSchema = z.object({
  approvalLevels: z.object({
    procurement: z.number().min(1, 'Must have at least 1 approval level'),
    inventory: z.number().min(1, 'Must have at least 1 approval level'),
  }),
  autoApprovalThresholds: z.object({
    amount: z.number().min(0),
    currency: z.string().min(1, 'Currency is required'),
  }),
  delegations: z.object({
    enabled: z.boolean(),
    maxDays: z.number().min(1, 'Maximum days must be at least 1'),
  }),
});

export function SettingsPage() {
  const { useSettingsQuery, useUpdateSettings } = useSettings();
  const { data: settings, isLoading } = useSettingsQuery();
  const { mutate: updateSettings, isLoading: isUpdating } = useUpdateSettings();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <FormContainer
            title="General Settings"
            description="Configure basic system settings"
            schema={generalSettingsSchema}
            defaultValues={settings.general}
            onSubmit={(data) => updateSettings({ general: data })}
            submitText={isUpdating ? 'Saving...' : 'Save Changes'}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <FormInput
                name="companyName"
                label="Company Name"
                placeholder="Enter company name"
              />
              <FormSelect
                name="timezone"
                label="Timezone"
                options={[
                  { label: 'Eastern Time (ET)', value: 'America/New_York' },
                  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
                  { label: 'UTC', value: 'UTC' },
                ]}
              />
              <FormSelect
                name="dateFormat"
                label="Date Format"
                options={[
                  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
                  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
                  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
                ]}
              />
              <FormSelect
                name="currency"
                label="Currency"
                options={[
                  { label: 'USD ($)', value: 'USD' },
                  { label: 'EUR (€)', value: 'EUR' },
                  { label: 'GBP (£)', value: 'GBP' },
                ]}
              />
              <FormSelect
                name="language"
                label="Language"
                options={[
                  { label: 'English (US)', value: 'en-US' },
                  { label: 'English (UK)', value: 'en-GB' },
                  { label: 'Spanish', value: 'es' },
                ]}
              />
              <FormInput
                name="fiscalYearStart"
                label="Fiscal Year Start"
                placeholder="MM-DD"
              />
            </div>
          </FormContainer>
        </TabsContent>

        <TabsContent value="notifications">
          <FormContainer
            title="Notification Settings"
            description="Configure notification preferences"
            schema={notificationSettingsSchema}
            defaultValues={settings.notifications}
            onSubmit={(data) => updateSettings({ notifications: data })}
            submitText={isUpdating ? 'Saving...' : 'Save Changes'}
          >
            <div className="space-y-4">
              <FormCheckbox
                name="emailNotifications"
                label="Email Notifications"
                checkboxLabel="Enable email notifications"
                description="Receive notifications via email"
              />
              <FormCheckbox
                name="stockAlerts"
                label="Stock Alerts"
                checkboxLabel="Enable stock alerts"
                description="Get notified when stock levels are low"
              />
              <FormCheckbox
                name="approvalReminders"
                label="Approval Reminders"
                checkboxLabel="Enable approval reminders"
                description="Receive reminders for pending approvals"
              />
              <FormCheckbox
                name="systemUpdates"
                label="System Updates"
                checkboxLabel="Enable system updates"
                description="Get notified about system updates and maintenance"
              />
              <FormCheckbox
                name="dailyReports"
                label="Daily Reports"
                checkboxLabel="Enable daily reports"
                description="Receive daily summary reports"
              />
            </div>
          </FormContainer>
        </TabsContent>

        <TabsContent value="security">
          <FormContainer
            title="Security Settings"
            description="Configure security and access settings"
            schema={securitySettingsSchema}
            defaultValues={settings.security}
            onSubmit={(data) => updateSettings({ security: data })}
            submitText={isUpdating ? 'Saving...' : 'Save Changes'}
          >
            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <h3 className="mb-4 font-semibold">Password Policy</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    name="passwordPolicy.minLength"
                    label="Minimum Length"
                    type="number"
                    min={8}
                  />
                  <FormInput
                    name="passwordPolicy.expiryDays"
                    label="Password Expiry (days)"
                    type="number"
                    min={0}
                  />
                  <FormCheckbox
                    name="passwordPolicy.requireUppercase"
                    label="Uppercase Letters"
                    checkboxLabel="Require uppercase letters"
                  />
                  <FormCheckbox
                    name="passwordPolicy.requireLowercase"
                    label="Lowercase Letters"
                    checkboxLabel="Require lowercase letters"
                  />
                  <FormCheckbox
                    name="passwordPolicy.requireNumbers"
                    label="Numbers"
                    checkboxLabel="Require numbers"
                  />
                  <FormCheckbox
                    name="passwordPolicy.requireSpecialChars"
                    label="Special Characters"
                    checkboxLabel="Require special characters"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormInput
                  name="sessionTimeout"
                  label="Session Timeout (minutes)"
                  type="number"
                  min={5}
                />
                <FormCheckbox
                  name="mfaEnabled"
                  label="Multi-Factor Authentication"
                  checkboxLabel="Enable MFA"
                  description="Require MFA for all users"
                />
              </div>
            </div>
          </FormContainer>
        </TabsContent>

        <TabsContent value="workflow">
          <FormContainer
            title="Workflow Settings"
            description="Configure approval workflows and automation"
            schema={workflowSettingsSchema}
            defaultValues={settings.workflow}
            onSubmit={(data) => updateSettings({ workflow: data })}
            submitText={isUpdating ? 'Saving...' : 'Save Changes'}
          >
            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <h3 className="mb-4 font-semibold">Approval Levels</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    name="approvalLevels.procurement"
                    label="Procurement Approvals"
                    type="number"
                    min={1}
                  />
                  <FormInput
                    name="approvalLevels.inventory"
                    label="Inventory Approvals"
                    type="number"
                    min={1}
                  />
                </div>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="mb-4 font-semibold">Auto-Approval Thresholds</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    name="autoApprovalThresholds.amount"
                    label="Amount"
                    type="number"
                    min={0}
                  />
                  <FormSelect
                    name="autoApprovalThresholds.currency"
                    label="Currency"
                    options={[
                      { label: 'USD ($)', value: 'USD' },
                      { label: 'EUR (€)', value: 'EUR' },
                      { label: 'GBP (£)', value: 'GBP' },
                    ]}
                  />
                </div>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="mb-4 font-semibold">Delegations</h3>
                <div className="grid gap-4">
                  <FormCheckbox
                    name="delegations.enabled"
                    label="Enable Delegations"
                    checkboxLabel="Allow users to delegate their approval authority"
                  />
                  <FormInput
                    name="delegations.maxDays"
                    label="Maximum Delegation Period (days)"
                    type="number"
                    min={1}
                  />
                </div>
              </div>
            </div>
          </FormContainer>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="text-lg font-semibold">Integration Settings</h2>
              <p className="text-sm text-muted-foreground">
                Configure third-party system integrations
              </p>

              <div className="mt-6 space-y-6">
                <div className="rounded-lg border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">ERP Integration</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with your ERP system
                      </p>
                    </div>
                    <FormCheckbox
                      name="integrations.erp.enabled"
                      label="Enable ERP Integration"
                      checkboxLabel="Enable"
                    />
                  </div>
                </div>

                <div className="rounded-lg border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Accounting Integration</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with your accounting system
                      </p>
                    </div>
                    <FormCheckbox
                      name="integrations.accounting.enabled"
                      label="Enable Accounting Integration"
                      checkboxLabel="Enable"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="text-lg font-semibold">Audit Settings</h2>
              <p className="text-sm text-muted-foreground">
                Configure system auditing and logging
              </p>

              <div className="mt-6 space-y-6">
                <FormInput
                  name="audit.retentionPeriod"
                  label="Retention Period (days)"
                  type="number"
                  min={30}
                  description="How long to keep audit logs"
                />

                <FormCheckbox
                  name="audit.detailedLogging"
                  label="Detailed Logging"
                  checkboxLabel="Enable detailed logging"
                  description="Log detailed information for all actions"
                />

                <div className="space-y-2">
                  <h3 className="font-medium">Logged Actions</h3>
                  <p className="text-sm text-muted-foreground">
                    Select which actions to log
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <FormCheckbox
                      name="audit.loggedActions"
                      label="Login"
                      checkboxLabel="Login attempts"
                    />
                    <FormCheckbox
                      name="audit.loggedActions"
                      label="Logout"
                      checkboxLabel="Logout events"
                    />
                    <FormCheckbox
                      name="audit.loggedActions"
                      label="Create"
                      checkboxLabel="Create operations"
                    />
                    <FormCheckbox
                      name="audit.loggedActions"
                      label="Update"
                      checkboxLabel="Update operations"
                    />
                    <FormCheckbox
                      name="audit.loggedActions"
                      label="Delete"
                      checkboxLabel="Delete operations"
                    />
                    <FormCheckbox
                      name="audit.loggedActions"
                      label="Approve"
                      checkboxLabel="Approval actions"
                    />
                    <FormCheckbox
                      name="audit.loggedActions"
                      label="Reject"
                      checkboxLabel="Rejection actions"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage;