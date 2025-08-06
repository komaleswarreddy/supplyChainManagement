import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUpDown, Eye, Plus, Leaf, BarChart3, Download, Clock } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Mock data types
type SustainabilityRating = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';
type SustainabilityStatus = 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW';

interface SupplierSustainability {
  id: string;
  supplierId: string;
  supplierName: string;
  overallRating: SustainabilityRating;
  carbonFootprint: number;
  carbonUnit: 'tCO2e' | 'kgCO2e';
  waterUsage: number;
  waterUnit: 'gallons' | 'liters';
  wasteGeneration: number;
  wasteUnit: 'tons' | 'kg';
  renewableEnergy: number;
  certifications: string[];
  complianceStatus: SustainabilityStatus;
  lastAssessmentDate: string;
  nextAssessmentDate: string;
  goals: {
    carbonReduction: number;
    waterReduction: number;
    wasteReduction: number;
    renewableTarget: number;
    targetDate: string;
  };
  initiatives: {
    id: string;
    name: string;
    description: string;
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
    startDate: string;
    endDate: string;
    impact: {
      category: 'CARBON' | 'WATER' | 'WASTE' | 'ENERGY' | 'SOCIAL';
      value: number;
      unit: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
}

const columnHelper = createColumnHelper<SupplierSustainability>();

const ratingColors: Record<SustainabilityRating, string> = {
  'A+': 'success',
  'A': 'success',
  'B+': 'success',
  'B': 'warning',
  'C+': 'warning',
  'C': 'warning',
  'D+': 'destructive',
  'D': 'destructive',
  'F': 'destructive',
};

const statusColors: Record<SustainabilityStatus, string> = {
  'COMPLIANT': 'success',
  'PARTIALLY_COMPLIANT': 'warning',
  'NON_COMPLIANT': 'destructive',
  'PENDING_REVIEW': 'secondary',
};

// Mock data
const MOCK_SUSTAINABILITY_DATA: SupplierSustainability[] = Array.from({ length: 10 }, (_, i) => {
  const ratings: SustainabilityRating[] = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
  const statuses: SustainabilityStatus[] = ['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW'];
  
  return {
    id: `sus-${i + 1}`,
    supplierId: `supplier-${i % 5 + 1}`,
    supplierName: `Supplier ${i % 5 + 1}`,
    overallRating: ratings[Math.floor(Math.random() * ratings.length)],
    carbonFootprint: Math.floor(Math.random() * 1000) + 100,
    carbonUnit: 'tCO2e',
    waterUsage: Math.floor(Math.random() * 100000) + 10000,
    waterUnit: 'gallons',
    wasteGeneration: Math.floor(Math.random() * 100) + 10,
    wasteUnit: 'tons',
    renewableEnergy: Math.floor(Math.random() * 100),
    certifications: [
      'ISO 14001',
      'ISO 50001',
      'B Corp',
      'Carbon Trust',
      'Green Seal',
    ].slice(0, Math.floor(Math.random() * 3) + 1),
    complianceStatus: statuses[Math.floor(Math.random() * statuses.length)],
    lastAssessmentDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
    nextAssessmentDate: new Date(Date.now() + Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
    goals: {
      carbonReduction: Math.floor(Math.random() * 50) + 10,
      waterReduction: Math.floor(Math.random() * 50) + 10,
      wasteReduction: Math.floor(Math.random() * 50) + 10,
      renewableTarget: Math.floor(Math.random() * 50) + 50,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3).toISOString(),
    },
    initiatives: [
      {
        id: `init-${i}-1`,
        name: 'Carbon Reduction Initiative',
        description: 'Implementing energy efficiency measures across operations',
        status: ['PLANNED', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)],
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000).toISOString(),
        impact: {
          category: 'CARBON',
          value: Math.floor(Math.random() * 100) + 50,
          unit: 'tCO2e',
        },
      },
      {
        id: `init-${i}-2`,
        name: 'Water Conservation Project',
        description: 'Implementing water recycling systems',
        status: ['PLANNED', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)],
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        impact: {
          category: 'WATER',
          value: Math.floor(Math.random() * 20000) + 5000,
          unit: 'gallons',
        },
      },
    ],
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
});

export function SupplierSustainabilityList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    supplier: '',
    rating: '',
    status: '',
    certification: '',
  });

  const columns = [
    columnHelper.accessor('supplierName', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Supplier</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <span className="font-medium text-primary">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('overallRating', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Rating</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <Badge variant={ratingColors[info.getValue()]}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('carbonFootprint', {
      header: 'Carbon Footprint',
      cell: (info) => (
        <div>
          {info.getValue().toLocaleString()} {info.row.original.carbonUnit}
        </div>
      ),
    }),
    columnHelper.accessor('renewableEnergy', {
      header: 'Renewable Energy',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Progress value={info.getValue()} className="h-2 w-24" />
          <span>{info.getValue()}%</span>
        </div>
      ),
    }),
    columnHelper.accessor('certifications', {
      header: 'Certifications',
      cell: (info) => (
        <div className="flex flex-wrap gap-1">
          {info.getValue().map((cert, index) => (
            <Badge key={index} variant="outline" className="whitespace-nowrap">
              {cert}
            </Badge>
          ))}
        </div>
      ),
    }),
    columnHelper.accessor('complianceStatus', {
      header: 'Status',
      cell: (info) => (
        <Badge variant={statusColors[info.getValue()]}>
          {info.getValue().replace('_', ' ')}
        </Badge>
      ),
    }),
    columnHelper.accessor('lastAssessmentDate', {
      header: 'Last Assessment',
      cell: (info) => format(new Date(info.getValue()), 'PP'),
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/suppliers/sustainability/${info.getValue()}`);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    }),
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Calculate sustainability statistics
  const sustainabilityStats = React.useMemo(() => {
    const total = MOCK_SUSTAINABILITY_DATA.length;
    const compliant = MOCK_SUSTAINABILITY_DATA.filter(item => item.complianceStatus === 'COMPLIANT').length;
    const partiallyCompliant = MOCK_SUSTAINABILITY_DATA.filter(item => item.complianceStatus === 'PARTIALLY_COMPLIANT').length;
    const nonCompliant = MOCK_SUSTAINABILITY_DATA.filter(item => item.complianceStatus === 'NON_COMPLIANT').length;
    const pendingReview = MOCK_SUSTAINABILITY_DATA.filter(item => item.complianceStatus === 'PENDING_REVIEW').length;
    
    const avgCarbonFootprint = MOCK_SUSTAINABILITY_DATA.reduce((sum, item) => sum + item.carbonFootprint, 0) / total;
    const avgRenewableEnergy = MOCK_SUSTAINABILITY_DATA.reduce((sum, item) => sum + item.renewableEnergy, 0) / total;
    
    return { 
      total, 
      compliant, 
      partiallyCompliant, 
      nonCompliant, 
      pendingReview,
      avgCarbonFootprint,
      avgRenewableEnergy
    };
  }, []);

  // Generate chart data
  const ratingDistribution = React.useMemo(() => {
    const distribution: Record<SustainabilityRating, number> = {
      'A+': 0, 'A': 0, 'B+': 0, 'B': 0, 'C+': 0, 'C': 0, 'D+': 0, 'D': 0, 'F': 0
    };
    
    MOCK_SUSTAINABILITY_DATA.forEach(item => {
      distribution[item.overallRating]++;
    });
    
    return Object.entries(distribution).map(([rating, count]) => ({
      rating,
      count,
    }));
  }, []);

  const carbonTrend = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 11 + i);
      return {
        month: format(date, 'MMM yyyy'),
        carbon: 1000 - (i * 50) + Math.floor(Math.random() * 100),
      };
    });
  }, []);

  const certificationDistribution = React.useMemo(() => {
    const distribution: Record<string, number> = {};
    
    MOCK_SUSTAINABILITY_DATA.forEach(item => {
      item.certifications.forEach(cert => {
        distribution[cert] = (distribution[cert] || 0) + 1;
      });
    });
    
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const table = useReactTable({
    data: MOCK_SUSTAINABILITY_DATA,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
    manualPagination: false,
    manualSorting: false,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Leaf className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Supplier Sustainability</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button onClick={() => navigate('new')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliant Suppliers</p>
                <p className="text-3xl font-bold">{sustainabilityStats.compliant}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round((sustainabilityStats.compliant / sustainabilityStats.total) * 100)}% of total
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Carbon Footprint</p>
                <p className="text-3xl font-bold">{Math.round(sustainabilityStats.avgCarbonFootprint)}</p>
                <p className="text-sm text-muted-foreground">tCO2e per supplier</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Renewable Energy</p>
                <p className="text-3xl font-bold">{Math.round(sustainabilityStats.avgRenewableEnergy)}%</p>
                <p className="text-sm text-muted-foreground">of total energy use</p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <Leaf className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-3xl font-bold">{sustainabilityStats.pendingReview}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.round((sustainabilityStats.pendingReview / sustainabilityStats.total) * 100)}% of total
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>
              Distribution of sustainability ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ratingDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Carbon Footprint Trend</CardTitle>
            <CardDescription>
              Average carbon footprint over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={carbonTrend}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="carbon" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
            <CardDescription>
              Distribution of sustainability certifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={certificationDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {certificationDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={filters.supplier}
              onChange={(e) => setFilters(prev => ({ ...prev, supplier: e.target.value }))}
              placeholder="Search by supplier name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <Select
              id="rating"
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
            >
              <option value="">All Ratings</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="C+">C+</option>
              <option value="C">C</option>
              <option value="D+">D+</option>
              <option value="D">D</option>
              <option value="F">F</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="PARTIALLY_COMPLIANT">Partially Compliant</option>
              <option value="NON_COMPLIANT">Non-Compliant</option>
              <option value="PENDING_REVIEW">Pending Review</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certification">Certification</Label>
            <Select
              id="certification"
              value={filters.certification}
              onChange={(e) => setFilters(prev => ({ ...prev, certification: e.target.value }))}
            >
              <option value="">All Certifications</option>
              <option value="ISO 14001">ISO 14001</option>
              <option value="ISO 50001">ISO 50001</option>
              <option value="B Corp">B Corp</option>
              <option value="Carbon Trust">Carbon Trust</option>
              <option value="Green Seal">Green Seal</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        table={table}
        isLoading={false}
        onRowClick={(row) => navigate(`/suppliers/sustainability/${row.id}`)}
      />
    </div>
  );
}

export default SupplierSustainabilityList;