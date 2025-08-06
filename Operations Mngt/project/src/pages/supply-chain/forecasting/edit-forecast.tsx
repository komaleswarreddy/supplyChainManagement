import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { FormContainer, FormInput, FormSelect, FormSection } from '@/components/form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useForecast, useUpdateForecast } from '@/hooks/useSupplyChain';
import type { Forecast } from '@/types/supply-chain';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const forecastSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  itemCode: z.string().min(1, 'Item code is required'),
  itemName: z.string().min(1, 'Item name is required'),
  locationId: z.string().min(1, 'Location is required'),
  locationName: z.string().min(1, 'Location name is required'),
  period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  startDate: z.date(),
  endDate: z.date(),
  algorithm: z.enum([
    'MOVING_AVERAGE',
    'EXPONENTIAL_SMOOTHING',
    'HOLT_WINTERS',
    'LINEAR_REGRESSION',
    'ARIMA',
  ]),
  metadata: z.object({
    category: z.string().optional(),
    productGroup: z.string().optional(),
    salesChannel: z.string().optional(),
    region: z.string().optional(),
  }).optional(),
});

const periodOptions = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Quarterly', value: 'QUARTERLY' },
  { label: 'Yearly', value: 'YEARLY' },
];

const algorithmOptions = [
  { label: 'Moving Average', value: 'MOVING_AVERAGE' },
  { label: 'Exponential Smoothing', value: 'EXPONENTIAL_SMOOTHING' },
  { label: 'Holt-Winters', value: 'HOLT_WINTERS' },
  { label: 'Linear Regression', value: 'LINEAR_REGRESSION' },
  { label: 'ARIMA', value: 'ARIMA' },
];

export function EditForecast() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: forecast, isLoading: isLoadingForecast } = useForecast(id!);
  const { mutate: updateForecast, isLoading: isUpdating } = useUpdateForecast();

  if (isLoadingForecast || !forecast) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Transform dates from strings to Date objects
  const defaultValues = {
    ...forecast,
    startDate: new Date(forecast.startDate),
    endDate: new Date(forecast.endDate),
  };

  const onSubmit = async (data: z.infer<typeof forecastSchema>) => {
    const formData: Partial<Forecast> = {
      ...data,
    };

    updateForecast(
      { id: forecast.id, data: formData },
      {
        onSuccess: () => {
          navigate(`/supply-chain/forecasting/${forecast.id}`);
        },
      }
    );
  };

  return (
    <div className="space-y-6 p-6">
      <FormContainer
        title="Edit Forecast"
        description={`Edit forecast for ${forecast.itemName}`}
        schema={forecastSchema}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitText={isUpdating ? 'Saving...' : 'Save Changes'}
        cancelText="Cancel"
        onCancel={() => navigate(`/supply-chain/forecasting/${forecast.id}`)}
        showReset
      >
        {({ register, setValue, getValues }) => (
          <>
            <FormSection title="Item Information">
              <FormInput
                name="itemCode"
                label="Item Code"
                placeholder="Enter item code"
              />
              <FormInput
                name="itemName"
                label="Item Name"
                placeholder="Enter item name"
              />
              <FormInput
                name="locationId"
                label="Location ID"
                placeholder="Enter location ID"
              />
              <FormInput
                name="locationName"
                label="Location Name"
                placeholder="Enter location name"
              />
            </FormSection>

            <FormSection title="Forecast Parameters">
              <FormSelect
                name="period"
                label="Forecast Period"
                options={periodOptions}
              />
              <FormSelect
                name="algorithm"
                label="Forecasting Algorithm"
                options={algorithmOptions}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <DatePicker
                  selected={getValues('startDate')}
                  onChange={(date) => setValue('startDate', date)}
                  className="w-full rounded-md border p-2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <DatePicker
                  selected={getValues('endDate')}
                  onChange={(date) => setValue('endDate', date)}
                  minDate={getValues('startDate')}
                  className="w-full rounded-md border p-2"
                />
              </div>
            </FormSection>

            <FormSection title="Additional Information">
              <FormInput
                name="metadata.category"
                label="Category"
                placeholder="Enter category"
              />
              <FormInput
                name="metadata.productGroup"
                label="Product Group"
                placeholder="Enter product group"
              />
              <FormInput
                name="metadata.salesChannel"
                label="Sales Channel"
                placeholder="Enter sales channel"
              />
              <FormInput
                name="metadata.region"
                label="Region"
                placeholder="Enter region"
              />
            </FormSection>
          </>
        )}
      </FormContainer>
    </div>
  );
}