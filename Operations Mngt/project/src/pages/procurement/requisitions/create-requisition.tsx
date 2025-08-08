import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Plus, Trash2, Save, Send, Package, DollarSign, Calendar, User, Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCreateRequisition } from '@/hooks/useRequisitions';
import { useCatalog } from '@/hooks/useCatalog';
import { useCostCenters } from '@/hooks/useCostCenters';

const requisitionSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  costCenter: z.string().min(1, 'Cost center is required'),
  justification: z.string().min(10, 'Justification must be at least 10 characters'),
  items: z.array(z.object({
    itemId: z.string().min(1, 'Item is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
    estimatedUnitPrice: z.number().min(0, 'Estimated price must be non-negative'),
    description: z.string().optional(),
  })).min(1, 'At least one item is required'),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type RequisitionFormData = z.infer<typeof requisitionSchema>;

export function CreateRequisition() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<RequisitionFormData>({
    resolver: zodResolver(requisitionSchema),
    defaultValues: {
      department: '',
      costCenter: '',
      justification: '',
      items: [],
      attachments: [],
      notes: '',
    },
  });

  const { mutateAsync: createRequisition } = useCreateRequisition();
  const { data: catalogData } = useCatalog();
  const { data: costCentersData } = useCostCenters();

  const watchItems = form.watch('items');

  const addItem = () => {
    const currentItems = form.getValues('items');
    form.setValue('items', [
      ...currentItems,
      {
        itemId: '',
        quantity: 1,
        unitOfMeasure: '',
        estimatedUnitPrice: 0,
        description: '',
      },
    ]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items');
    form.setValue('items', currentItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const currentItems = form.getValues('items');
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    form.setValue('items', updatedItems);
  };

  const calculateTotalValue = () => {
    return watchItems.reduce((total, item) => {
      return total + (item.quantity * item.estimatedUnitPrice);
    }, 0);
  };

  const onSubmit = async (data: RequisitionFormData) => {
    try {
      setIsSubmitting(true);
      await createRequisition(data);
      navigate('/procurement/requisitions');
    } catch (error) {
      console.error('Error creating requisition:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveDraft = async () => {
    try {
      setIsSaving(true);
      const data = form.getValues();
      await createRequisition({ ...data, status: 'draft' });
      navigate('/procurement/requisitions');
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/procurement/requisitions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requisitions
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Requisition</h1>
            <p className="text-muted-foreground">
              Create a new purchase requisition
            </p>
          </div>
        </div>
      </div>

      <Form {...form} onSubmit={onSubmit}>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="procurement">Procurement</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costCenter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Center</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cost center" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {costCentersData?.map((costCenter) => (
                          <SelectItem key={costCenter.id} value={costCenter.id}>
                            {costCenter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why this requisition is needed..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {watchItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items added yet. Click "Add Item" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {watchItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium">Item</label>
                          <Select
                            value={item.itemId}
                            onValueChange={(value) => updateItem(index, 'itemId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {catalogData?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Quantity</label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Unit of Measure</label>
                          <Select
                            value={item.unitOfMeasure}
                            onValueChange={(value) => updateItem(index, 'unitOfMeasure', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select UoM" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pcs">Pieces</SelectItem>
                              <SelectItem value="kg">Kilograms</SelectItem>
                              <SelectItem value="l">Liters</SelectItem>
                              <SelectItem value="m">Meters</SelectItem>
                              <SelectItem value="box">Box</SelectItem>
                              <SelectItem value="set">Set</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Estimated Unit Price</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.estimatedUnitPrice}
                            onChange={(e) => updateItem(index, 'estimatedUnitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Description (Optional)</label>
                        <Input
                          placeholder="Additional details about this item..."
                          value={item.description || ''}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Items:</span>
                  <Badge variant="secondary">{watchItems.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Value:</span>
                  <span className="text-lg font-bold">${calculateTotalValue().toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes or special instructions..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Requisition'}
            </Button>
          </div>
        </Form>
    </div>
  );
}