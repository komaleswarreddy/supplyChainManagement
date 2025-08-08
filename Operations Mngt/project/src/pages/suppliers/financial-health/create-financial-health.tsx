import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormContainer } from '@/components/form/form-container';
import { FormSection } from '@/components/form/form-section';
import { FormInput } from '@/components/form/form-input';
import { FormSelect } from '@/components/form/form-select';
import { FormTextarea } from '@/components/form/form-textarea';
import { useSuppliers } from '@/hooks/useSuppliers';
import { DollarSign, Plus, Trash2 } from 'lucide-react';

// Schema for financial health creation
const financialHealthSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  status: z.enum(['STRONG', 'STABLE', 'MODERATE', 'WEAK', 'CRITICAL']),
  creditRating: z.enum(['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'D']),
  creditScore: z.number().min(300).max(850),
  financialStability: z.number().min(0).max(100),
  liquidityRatio: z.number().min(0),
  debtToEquityRatio: z.number().min(0),
  profitMargin: z.number(),
  revenueGrowth: z.number(),
  paymentHistory: z.number().min(0).max(100),
  daysPayableOutstanding: z.number().min(0),
  bankruptcyRisk: z.number().min(0).max(100),
  trend: z.enum(['IMPROVING', 'STABLE', 'DECLINING']),
  lastUpdated: z.string().optional(),
  nextReviewDate: z.string().optional(),
  description: z.string().optional(),
  financialData: z.array(z.object({
    year: z.number(),
    revenue: z.number(),
    profit: z.number(),
    assets: z.number(),
    liabilities: z.number(),
    cashFlow: z.number(),
  })),
  alerts: z.array(z.object({
    type: z.enum(['PAYMENT_DELAY', 'CREDIT_DOWNGRADE', 'BANKRUPTCY_FILING', 'ACQUISITION', 'RESTRUCTURING']),
    severity: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    date: z.string(),
    description: z.string(),
    status: z.enum(['ACTIVE', 'RESOLVED', 'MONITORING']),
  })),
});

type FinancialHealthFormData = z.infer<typeof financialHealthSchema>;

const defaultValues: FinancialHealthFormData = {
  supplierId: '',
  status: 'STABLE',
  creditRating: 'BBB',
  creditScore: 650,
  financialStability: 70,
  liquidityRatio: 1.5,
  debtToEquityRatio: 0.5,
  profitMargin: 10,
  revenueGrowth: 5,
  paymentHistory: 85,
  daysPayableOutstanding: 30,
  bankruptcyRisk: 15,
  trend: 'STABLE',
  lastUpdated: new Date().toISOString().split('T')[0],
  nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  description: '',
  financialData: [],
  alerts: [],
};

const creditRatingOptions = [
  { value: 'AAA', label: 'AAA - Exceptional' },
  { value: 'AA', label: 'AA - Excellent' },
  { value: 'A', label: 'A - Good' },
  { value: 'BBB', label: 'BBB - Adequate' },
  { value: 'BB', label: 'BB - Speculative' },
  { value: 'B', label: 'B - Highly Speculative' },
  { value: 'CCC', label: 'CCC - Very High Risk' },
  { value: 'CC', label: 'CC - Extremely High Risk' },
  { value: 'C', label: 'C - Default Imminent' },
  { value: 'D', label: 'D - Default' },
];

const alertTypeOptions = [
  { value: 'PAYMENT_DELAY', label: 'Payment Delay' },
  { value: 'CREDIT_DOWNGRADE', label: 'Credit Downgrade' },
  { value: 'BANKRUPTCY_FILING', label: 'Bankruptcy Filing' },
  { value: 'ACQUISITION', label: 'Acquisition' },
  { value: 'RESTRUCTURING', label: 'Restructuring' },
];

const severityOptions = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'MONITORING', label: 'Monitoring' },
];

export function CreateFinancialHealth() {
  const navigate = useNavigate();
  const { useCreateFinancialHealth, useSupplierList } = useSuppliers();
  const { mutate: createFinancialHealth, isLoading } = useCreateFinancialHealth();
  const { data: suppliers } = useSupplierList({ page: 1, pageSize: 100 });

  const supplierOptions = suppliers?.items?.map(supplier => ({
    value: supplier.id,
    label: supplier.name,
  })) || [];

  const onSubmit = async (data: FinancialHealthFormData) => {
    console.log('CreateFinancialHealth: Form submitted with data:', data);
    createFinancialHealth(data, {
      onSuccess: (response) => {
        console.log('CreateFinancialHealth: Success - navigating to:', response.data.id);
        navigate(`/suppliers/financial-health/${response.data.id}`);
      },
      onError: (error) => {
        console.error('CreateFinancialHealth: Error creating financial health record:', error);
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Create Financial Health Record"
        description="Create a new supplier financial health assessment"
        schema={financialHealthSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isLoading ? 'Creating...' : 'Create Financial Health Record'}
        cancelText="Cancel"
        onCancel={() => navigate('/suppliers/financial-health')}
        showReset
      >
        {({ control, getValues, watch }) => {
          const { fields: financialDataFields, append: appendFinancialData, remove: removeFinancialData } = useFieldArray({
            control,
            name: 'financialData',
          });

          const { fields: alertFields, append: appendAlert, remove: removeAlert } = useFieldArray({
            control,
            name: 'alerts',
          });

          return (
            <>
              <FormSection title="Basic Information">
                <FormSelect
                  name="supplierId"
                  label="Supplier"
                  options={supplierOptions}
                  placeholder="Select supplier"
                />
                <FormSelect
                  name="status"
                  label="Financial Health Status"
                  options={[
                    { value: 'STRONG', label: 'Strong' },
                    { value: 'STABLE', label: 'Stable' },
                    { value: 'MODERATE', label: 'Moderate' },
                    { value: 'WEAK', label: 'Weak' },
                    { value: 'CRITICAL', label: 'Critical' },
                  ]}
                />
                <FormSelect
                  name="creditRating"
                  label="Credit Rating"
                  options={creditRatingOptions}
                />
                <FormSelect
                  name="trend"
                  label="Trend"
                  options={[
                    { value: 'IMPROVING', label: 'Improving' },
                    { value: 'STABLE', label: 'Stable' },
                    { value: 'DECLINING', label: 'Declining' },
                  ]}
                />
                <FormTextarea
                  name="description"
                  label="Description"
                  placeholder="Enter financial health assessment description"
                  className="col-span-2"
                />
              </FormSection>

              <FormSection title="Financial Metrics">
                <FormInput
                  name="creditScore"
                  label="Credit Score"
                  type="number"
                  placeholder="Enter credit score (300-850)"
                />
                <FormInput
                  name="financialStability"
                  label="Financial Stability (%)"
                  type="number"
                  placeholder="Enter financial stability score (0-100)"
                />
                <FormInput
                  name="liquidityRatio"
                  label="Liquidity Ratio"
                  type="number"
                  step="0.1"
                  placeholder="Enter liquidity ratio"
                />
                <FormInput
                  name="debtToEquityRatio"
                  label="Debt-to-Equity Ratio"
                  type="number"
                  step="0.1"
                  placeholder="Enter debt-to-equity ratio"
                />
                <FormInput
                  name="profitMargin"
                  label="Profit Margin (%)"
                  type="number"
                  step="0.1"
                  placeholder="Enter profit margin"
                />
                <FormInput
                  name="revenueGrowth"
                  label="Revenue Growth (%)"
                  type="number"
                  step="0.1"
                  placeholder="Enter revenue growth"
                />
                <FormInput
                  name="paymentHistory"
                  label="Payment History Score (%)"
                  type="number"
                  placeholder="Enter payment history score (0-100)"
                />
                <FormInput
                  name="daysPayableOutstanding"
                  label="Days Payable Outstanding"
                  type="number"
                  placeholder="Enter days payable outstanding"
                />
                <FormInput
                  name="bankruptcyRisk"
                  label="Bankruptcy Risk (%)"
                  type="number"
                  placeholder="Enter bankruptcy risk (0-100)"
                />
              </FormSection>

              <FormSection title="Review Dates">
                <FormInput
                  name="lastUpdated"
                  label="Last Updated"
                  type="date"
                />
                <FormInput
                  name="nextReviewDate"
                  label="Next Review Date"
                  type="date"
                />
              </FormSection>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Financial Data</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendFinancialData({
                        year: new Date().getFullYear(),
                        revenue: 0,
                        profit: 0,
                        assets: 0,
                        liabilities: 0,
                        cashFlow: 0,
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Financial Data
                    </Button>
                    {financialDataFields.length > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFinancialData(financialDataFields.length - 1)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Data
                      </Button>
                    )}
                  </div>
                </div>
                {financialDataFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput
                        name={`financialData.${index}.year`}
                        label="Year"
                        type="number"
                        placeholder="Enter year"
                      />
                      <FormInput
                        name={`financialData.${index}.revenue`}
                        label="Revenue ($)"
                        type="number"
                        placeholder="Enter revenue"
                      />
                      <FormInput
                        name={`financialData.${index}.profit`}
                        label="Profit ($)"
                        type="number"
                        placeholder="Enter profit"
                      />
                      <FormInput
                        name={`financialData.${index}.assets`}
                        label="Assets ($)"
                        type="number"
                        placeholder="Enter assets"
                      />
                      <FormInput
                        name={`financialData.${index}.liabilities`}
                        label="Liabilities ($)"
                        type="number"
                        placeholder="Enter liabilities"
                      />
                      <FormInput
                        name={`financialData.${index}.cashFlow`}
                        label="Cash Flow ($)"
                        type="number"
                        placeholder="Enter cash flow"
                      />
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Financial Alerts</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendAlert({
                        type: 'PAYMENT_DELAY',
                        severity: 'MEDIUM',
                        date: new Date().toISOString().split('T')[0],
                        description: '',
                        status: 'ACTIVE',
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Alert
                    </Button>
                    {alertFields.length > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAlert(alertFields.length - 1)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Alert
                      </Button>
                    )}
                  </div>
                </div>
                {alertFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormSelect
                        name={`alerts.${index}.type`}
                        label="Alert Type"
                        options={alertTypeOptions}
                      />
                      <FormSelect
                        name={`alerts.${index}.severity`}
                        label="Severity"
                        options={severityOptions}
                      />
                      <FormInput
                        name={`alerts.${index}.date`}
                        label="Date"
                        type="date"
                      />
                      <FormSelect
                        name={`alerts.${index}.status`}
                        label="Status"
                        options={statusOptions}
                      />
                      <FormTextarea
                        name={`alerts.${index}.description`}
                        label="Description"
                        placeholder="Enter alert description"
                        className="col-span-2"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </>
          );
        }}
      </FormContainer>
    </div>
  );
}

export default CreateFinancialHealth;
