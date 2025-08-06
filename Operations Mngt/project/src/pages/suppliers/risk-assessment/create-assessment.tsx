import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { FormContainer, FormInput, FormSelect, FormTextarea, FormSection } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSuppliers } from '@/hooks/useSuppliers';
import type { RiskLevel, RiskCategory, SupplierRiskAssessment } from '@/types/supplier';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const riskAssessmentSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  supplierName: z.string().min(1, 'Supplier name is required'),
  assessmentDate: z.date(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  overallRiskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  categories: z.array(z.object({
    category: z.enum(['FINANCIAL', 'OPERATIONAL', 'COMPLIANCE', 'REPUTATIONAL', 'GEOPOLITICAL']),
    weight: z.number().min(0).max(1),
    score: z.number().min(0).max(100),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    factors: z.array(z.object({
      name: z.string().min(1, 'Factor name is required'),
      description: z.string().optional(),
      weight: z.number().min(0).max(1),
      score: z.number().min(0).max(100),
      dataSource: z.string().optional(),
      notes: z.string().optional(),
    })).min(1, 'At least one factor is required'),
  })).min(1, 'At least one category is required'),
  mitigationPlans: z.array(z.object({
    riskCategory: z.enum(['FINANCIAL', 'OPERATIONAL', 'COMPLIANCE', 'REPUTATIONAL', 'GEOPOLITICAL']),
    description: z.string().min(1, 'Description is required'),
    actions: z.array(z.object({
      description: z.string().min(1, 'Action description is required'),
      dueDate: z.date(),
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']),
      notes: z.string().optional(),
    })).min(1, 'At least one action is required'),
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED']),
  })).optional(),
  nextAssessmentDate: z.date(),
  notes: z.string().optional(),
});

type RiskAssessmentFormData = z.infer<typeof riskAssessmentSchema>;

const defaultValues: RiskAssessmentFormData = {
  supplierId: '',
  supplierName: '',
  assessmentDate: new Date(),
  status: 'IN_PROGRESS',
  overallRiskLevel: 'MEDIUM',
  categories: [
    {
      category: 'FINANCIAL',
      weight: 0.3,
      score: 0,
      riskLevel: 'MEDIUM',
      factors: [
        {
          name: 'Credit Rating',
          description: 'Supplier credit rating from financial institutions',
          weight: 0.5,
          score: 0,
          dataSource: 'Credit Report',
        },
        {
          name: 'Financial Stability',
          description: 'Assessment of financial statements and stability',
          weight: 0.5,
          score: 0,
          dataSource: 'Financial Statements',
        },
      ],
    },
    {
      category: 'OPERATIONAL',
      weight: 0.3,
      score: 0,
      riskLevel: 'MEDIUM',
      factors: [
        {
          name: 'Supply Chain Resilience',
          description: 'Ability to maintain operations during disruptions',
          weight: 0.5,
          score: 0,
          dataSource: 'Supplier Assessment',
        },
        {
          name: 'Quality Control',
          description: 'Effectiveness of quality management systems',
          weight: 0.5,
          score: 0,
          dataSource: 'Quality Audit',
        },
      ],
    },
    {
      category: 'COMPLIANCE',
      weight: 0.4,
      score: 0,
      riskLevel: 'MEDIUM',
      factors: [
        {
          name: 'Regulatory Compliance',
          description: 'Compliance with relevant regulations and standards',
          weight: 0.6,
          score: 0,
          dataSource: 'Compliance Audit',
        },
        {
          name: 'Environmental Compliance',
          description: 'Adherence to environmental regulations',
          weight: 0.4,
          score: 0,
          dataSource: 'Environmental Audit',
        },
      ],
    },
  ],
  mitigationPlans: [],
  nextAssessmentDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
};

const riskLevelOptions = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Critical', value: 'CRITICAL' },
];

const categoryOptions = [
  { label: 'Financial', value: 'FINANCIAL' },
  { label: 'Operational', value: 'OPERATIONAL' },
  { label: 'Compliance', value: 'COMPLIANCE' },
  { label: 'Reputational', value: 'REPUTATIONAL' },
  { label: 'Geopolitical', value: 'GEOPOLITICAL' },
];

const statusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

const actionStatusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Overdue', value: 'OVERDUE' },
];

const planStatusOptions = [
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
];

export function CreateRiskAssessment() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const supplierIdFromQuery = queryParams.get('supplierId');
  
  const { useCreateRiskAssessment, useSupplier } = useSuppliers();
  const { mutate: createAssessment, isLoading: isCreating } = useCreateRiskAssessment();
  const { data: supplier } = useSupplier(supplierIdFromQuery || '');

  const [formValues, setFormValues] = useState<RiskAssessmentFormData>({
    ...defaultValues,
    supplierId: supplierIdFromQuery || '',
    supplierName: supplier?.name || '',
  });

  useEffect(() => {
    if (supplier) {
      setFormValues(prev => ({
        ...prev,
        supplierId: supplier.id,
        supplierName: supplier.name,
      }));
    }
  }, [supplier]);

  const form = useForm<RiskAssessmentFormData>({
    resolver: zodResolver(riskAssessmentSchema),
    defaultValues: formValues,
  });

  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control: form.control,
    name: 'categories',
  });

  const { fields: mitigationPlanFields, append: appendMitigationPlan, remove: removeMitigationPlan } = useFieldArray({
    control: form.control,
    name: 'mitigationPlans',
  });

  // Calculate overall score based on category scores and weights
  const calculateOverallScore = (data: RiskAssessmentFormData) => {
    if (!data.categories || data.categories.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    data.categories.forEach(category => {
      totalScore += category.score * category.weight;
      totalWeight += category.weight;
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  };

  // Determine risk level based on score
  const determineRiskLevel = (score: number): RiskLevel => {
    if (score >= 85) return 'LOW';
    if (score >= 70) return 'MEDIUM';
    if (score >= 50) return 'HIGH';
    return 'CRITICAL';
  };

  // Calculate category score based on factor scores and weights
  const calculateCategoryScore = (factors: any[]) => {
    if (!factors || factors.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    factors.forEach(factor => {
      totalScore += factor.score * factor.weight;
      totalWeight += factor.weight;
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  };

  // Update category scores and overall score when factor scores change
  const updateScores = () => {
    const formData = form.getValues();
    
    // Update category scores
    const updatedCategories = formData.categories.map(category => {
      const categoryScore = calculateCategoryScore(category.factors);
      const riskLevel = determineRiskLevel(categoryScore);
      
      return {
        ...category,
        score: categoryScore,
        riskLevel,
      };
    });
    
    // Update form values
    form.setValue('categories', updatedCategories);
    
    // Calculate and update overall score and risk level
    const overallScore = calculateOverallScore({ ...formData, categories: updatedCategories });
    const overallRiskLevel = determineRiskLevel(overallScore);
    
    form.setValue('overallRiskLevel', overallRiskLevel);
  };

  const onSubmit = async (data: RiskAssessmentFormData) => {
    // Final score calculation
    updateScores();
    const finalData = form.getValues();
    
    // Calculate overall score
    const overallScore = calculateOverallScore(finalData);
    
    const assessmentData: Omit<SupplierRiskAssessment, 'id' | 'createdAt' | 'updatedAt'> = {
      ...finalData,
      overallScore,
      status: 'COMPLETED',
      assessedBy: {
        id: 'user-1', // This would come from the authenticated user
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        roles: ['admin'],
        permissions: ['manage_suppliers'],
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    
    createAssessment(assessmentData, {
      onSuccess: (response) => {
        navigate(`/suppliers/risk-assessment/${response.data.id}`);
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Risk Assessment</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic information for this risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier</label>
                <select
                  {...form.register('supplierId')}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  onChange={(e) => {
                    form.setValue('supplierId', e.target.value);
                    // In a real app, you would fetch the supplier name based on the ID
                    form.setValue('supplierName', e.target.options[e.target.selectedIndex].text);
                  }}
                  disabled={!!supplierIdFromQuery}
                >
                  <option value="">Select Supplier</option>
                  {supplier ? (
                    <option value={supplier.id} selected={supplier.id === form.getValues('supplierId')}>
                      {supplier.name}
                    </option>
                  ) : (
                    <>
                      <option value="supplier-1">Acme Corporation</option>
                      <option value="supplier-2">Tech Innovations Inc</option>
                      <option value="supplier-3">Global Logistics Partners</option>
                    </>
                  )}
                </select>
                {form.formState.errors.supplierId && (
                  <p className="text-xs text-red-500">{form.formState.errors.supplierId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assessment Date</label>
                <DatePicker
                  selected={form.getValues('assessmentDate')}
                  onChange={(date) => form.setValue('assessmentDate', date as Date)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
                {form.formState.errors.assessmentDate && (
                  <p className="text-xs text-red-500">{form.formState.errors.assessmentDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Next Assessment Date</label>
                <DatePicker
                  selected={form.getValues('nextAssessmentDate')}
                  onChange={(date) => form.setValue('nextAssessmentDate', date as Date)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  minDate={new Date()}
                />
                {form.formState.errors.nextAssessmentDate && (
                  <p className="text-xs text-red-500">{form.formState.errors.nextAssessmentDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  {...form.register('status')}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {form.formState.errors.status && (
                  <p className="text-xs text-red-500">{form.formState.errors.status.message}</p>
                )}
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  {...form.register('notes')}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Risk Categories</CardTitle>
                <CardDescription>
                  Assess risk across different categories
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={() => appendCategory({
                  category: 'FINANCIAL',
                  weight: 0.25,
                  score: 0,
                  riskLevel: 'MEDIUM',
                  factors: [
                    {
                      name: 'New Factor',
                      description: 'Description of the new factor',
                      weight: 1.0,
                      score: 0,
                      dataSource: '',
                    },
                  ],
                })}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {categoryFields.map((field, categoryIndex) => (
              <div key={field.id} className="rounded-lg border p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      {...form.register(`categories.${categoryIndex}.category`)}
                      className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    >
                      {categoryOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Weight (%)</label>
                    <input
                      type="number"
                      {...form.register(`categories.${categoryIndex}.weight`, { 
                        valueAsNumber: true,
                        onChange: () => updateScores()
                      })}
                      min="0"
                      max="1"
                      step="0.05"
                      className="w-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Score</label>
                    <input
                      type="number"
                      value={form.getValues(`categories.${categoryIndex}.score`)}
                      disabled
                      className="w-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Risk Level</label>
                    <select
                      value={form.getValues(`categories.${categoryIndex}.riskLevel`)}
                      disabled
                      className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    >
                      {riskLevelOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeCategory(categoryIndex)}
                    disabled={categoryFields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Risk Factors</h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const factors = form.getValues(`categories.${categoryIndex}.factors`) || [];
                        form.setValue(`categories.${categoryIndex}.factors`, [
                          ...factors,
                          {
                            name: 'New Factor',
                            description: 'Description of the new factor',
                            weight: 1.0 / (factors.length + 1),
                            score: 0,
                            dataSource: '',
                          },
                        ]);
                        
                        // Redistribute weights
                        const updatedFactors = form.getValues(`categories.${categoryIndex}.factors`);
                        const equalWeight = 1.0 / updatedFactors.length;
                        form.setValue(
                          `categories.${categoryIndex}.factors`,
                          updatedFactors.map(f => ({ ...f, weight: equalWeight }))
                        );
                      }}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add Factor
                    </Button>
                  </div>

                  {form.getValues(`categories.${categoryIndex}.factors`)?.map((_, factorIndex) => (
                    <div key={factorIndex} className="rounded-lg border p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Factor Name</label>
                          <input
                            {...form.register(`categories.${categoryIndex}.factors.${factorIndex}.name`)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Data Source</label>
                          <input
                            {...form.register(`categories.${categoryIndex}.factors.${factorIndex}.dataSource`)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <textarea
                            {...form.register(`categories.${categoryIndex}.factors.${factorIndex}.description`)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Notes</label>
                          <textarea
                            {...form.register(`categories.${categoryIndex}.factors.${factorIndex}.notes`)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Weight (%)</label>
                          <input
                            type="number"
                            {...form.register(`categories.${categoryIndex}.factors.${factorIndex}.weight`, { 
                              valueAsNumber: true,
                              onChange: () => updateScores()
                            })}
                            min="0"
                            max="1"
                            step="0.05"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Score (0-100)</label>
                          <input
                            type="number"
                            {...form.register(`categories.${categoryIndex}.factors.${factorIndex}.score`, { 
                              valueAsNumber: true,
                              onChange: () => updateScores()
                            })}
                            min="0"
                            max="100"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const factors = form.getValues(`categories.${categoryIndex}.factors`);
                            if (factors.length <= 1) return;
                            
                            // Remove the factor
                            const updatedFactors = [...factors];
                            updatedFactors.splice(factorIndex, 1);
                            form.setValue(`categories.${categoryIndex}.factors`, updatedFactors);
                            
                            // Redistribute weights
                            const equalWeight = 1.0 / updatedFactors.length;
                            form.setValue(
                              `categories.${categoryIndex}.factors`,
                              updatedFactors.map(f => ({ ...f, weight: equalWeight }))
                            );
                            
                            updateScores();
                          }}
                          disabled={form.getValues(`categories.${categoryIndex}.factors`)?.length <= 1}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mitigation Plans</CardTitle>
                <CardDescription>
                  Create plans to mitigate identified risks
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={() => appendMitigationPlan({
                  riskCategory: 'FINANCIAL',
                  description: '',
                  actions: [
                    {
                      description: '',
                      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                      status: 'PENDING',
                      notes: '',
                    },
                  ],
                  status: 'DRAFT',
                })}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Mitigation Plan
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {mitigationPlanFields.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-2 font-medium">No Mitigation Plans</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add mitigation plans to address identified risks
                </p>
              </div>
            ) : (
              mitigationPlanFields.map((field, planIndex) => (
                <div key={field.id} className="rounded-lg border p-6">
                  <div className="mb-4 grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Risk Category</label>
                      <select
                        {...form.register(`mitigationPlans.${planIndex}.riskCategory`)}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                      >
                        {categoryOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <select
                        {...form.register(`mitigationPlans.${planIndex}.status`)}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                      >
                        {planStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        {...form.register(`mitigationPlans.${planIndex}.description`)}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Actions</h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const actions = form.getValues(`mitigationPlans.${planIndex}.actions`) || [];
                          form.setValue(`mitigationPlans.${planIndex}.actions`, [
                            ...actions,
                            {
                              description: '',
                              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                              status: 'PENDING',
                              notes: '',
                            },
                          ]);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Action
                      </Button>
                    </div>

                    {form.getValues(`mitigationPlans.${planIndex}.actions`)?.map((_, actionIndex) => (
                      <div key={actionIndex} className="rounded-lg border p-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium">Action Description</label>
                            <input
                              {...form.register(`mitigationPlans.${planIndex}.actions.${actionIndex}.description`)}
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Due Date</label>
                            <DatePicker
                              selected={form.getValues(`mitigationPlans.${planIndex}.actions.${actionIndex}.dueDate`)}
                              onChange={(date) => form.setValue(`mitigationPlans.${planIndex}.actions.${actionIndex}.dueDate`, date as Date)}
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                              minDate={new Date()}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <select
                              {...form.register(`mitigationPlans.${planIndex}.actions.${actionIndex}.status`)}
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                            >
                              {actionStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-2 space-y-2">
                            <label className="text-sm font-medium">Notes</label>
                            <textarea
                              {...form.register(`mitigationPlans.${planIndex}.actions.${actionIndex}.notes`)}
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                              rows={2}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const actions = form.getValues(`mitigationPlans.${planIndex}.actions`);
                              if (actions.length <= 1) return;
                              
                              const updatedActions = [...actions];
                              updatedActions.splice(actionIndex, 1);
                              form.setValue(`mitigationPlans.${planIndex}.actions`, updatedActions);
                            }}
                            disabled={form.getValues(`mitigationPlans.${planIndex}.actions`)?.length <= 1}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeMitigationPlan(planIndex)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove Plan
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/suppliers/risk-assessment')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Assessment'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateRiskAssessment;