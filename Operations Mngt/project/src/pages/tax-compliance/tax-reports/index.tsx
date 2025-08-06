import React from 'react';
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
import { useTaxCompliance } from '@/hooks/useTaxCompliance';
import type { TaxReport, TaxFilingStatus } from '@/types/tax-compliance';
import { ArrowUpDown, Eye, Plus, FileText, ExternalLink, AlertTriangle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const columnHelper = createColumnHelper<TaxReport>();

const statusColors: Record<TaxFilingStatus, string> = {
  PENDING: 'warning',
  FILED: 'success',
  AMENDED: 'secondary',
  EXTENDED: 'secondary',
  LATE: 'destructive',
};

export function TaxReportList() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = React.useState({
    reportType: '',
    jurisdiction: '',
    period: '',
    filingStatus: '',
  });

  const columns = [
    columnHelper.accessor('reportName', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Report Name</span>
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
    columnHelper.accessor('reportType', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Type</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <Badge variant="secondary">
          {info.getValue().replace('_', ' ')}
        </Badge>
      ),
    }),
    columnHelper.accessor('jurisdiction', {
      header: 'Jurisdiction',
      cell: (info) => info.getValue().replace('_', ' '),
    }),
    columnHelper.accessor('period', {
      header: 'Period',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('filingStatus', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Status</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <Badge variant={statusColors[info.getValue()]}>
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('dueDate', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Due Date</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => {
        const dueDate = new Date(info.getValue());
        const isOverdue = dueDate < new Date() && info.row.original.filingStatus === 'PENDING';
        return (
          <div className={`${isOverdue ? 'text-red-600 font-medium' : ''}`}>
            {format(dueDate, 'PP')}
            {isOverdue && ' (Overdue)'}
          </div>
        );
      },
    }),
    columnHelper.accessor('totalTaxAmount', {
      header: ({ column }) => (
        <div className="flex items-center space-x-2">
          <span>Amount</span>
          <ArrowUpDown
            className="h-4 w-4 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        </div>
      ),
      cell: (info) => (
        <div className="font-medium tabular-nums">
          {info.row.original.currency} {info.getValue().toLocaleString()}
        </div>
      ),
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => (
        <div className="flex gap-2">
          {info.row.original.reportUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                window.open(info.row.original.reportUrl, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tax-compliance/tax-reports/${info.getValue()}`);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { useTaxReports } = useTaxCompliance();
  const { data, isLoading } = useTaxReports({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : 'asc',
    ...filters,
    dateRange: startDate && endDate ? {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    } : undefined,
  });

  // Calculate overdue reports
  const overdueReports = React.useMemo(() => {
    if (!data?.items) return 0;
    
    return data.items.filter(report => {
      const dueDate = new Date(report.dueDate);
      return dueDate < new Date() && report.filingStatus === 'PENDING';
    }).length;
  }, [data?.items]);

  // Calculate upcoming reports
  const upcomingReports = React.useMemo(() => {
    if (!data?.items) return 0;
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return data.items.filter(report => {
      const dueDate = new Date(report.dueDate);
      const today = new Date();
      return dueDate >= today && dueDate <= thirtyDaysFromNow && report.filingStatus === 'PENDING';
    }).length;
  }, [data?.items]);

  const table = useReactTable({
    data: data?.items ?? [],
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
    pageCount: data?.totalPages ?? -1,
    manualPagination: true,
    manualSorting: true,
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Tax Reports</h1>
        </div>
        <Button onClick={() => navigate('new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Report
        </Button>
      </div>

      {overdueReports > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Overdue Reports</h3>
              <p className="text-sm text-red-700">
                {overdueReports} report{overdueReports !== 1 ? 's' : ''} {overdueReports !== 1 ? 'are' : 'is'} overdue. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-red-800"
                  onClick={() => setFilters(prev => ({ ...prev, filingStatus: 'PENDING' }))}
                >
                  Review now
                </Button>
              </p>
            </div>
          </div>
        </div>
      )}

      {upcomingReports > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Upcoming Reports</h3>
              <p className="text-sm text-amber-700">
                {upcomingReports} report{upcomingReports !== 1 ? 's' : ''} due in the next 30 days. 
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-amber-800"
                  onClick={() => setFilters(prev => ({ ...prev, filingStatus: 'PENDING' }))}
                >
                  Review now
                </Button>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select
              id="reportType"
              value={filters.reportType}
              onChange={(e) => setFilters(prev => ({ ...prev, reportType: e.target.value }))}
            >
              <option value="">All Types</option>
              <option value="SALES_TAX">Sales Tax</option>
              <option value="USE_TAX">Use Tax</option>
              <option value="VAT">VAT</option>
              <option value="GST">GST</option>
              <option value="WITHHOLDING_TAX">Withholding Tax</option>
              <option value="INTRASTAT">Intrastat</option>
              <option value="ANNUAL_SUMMARY">Annual Summary</option>
              <option value="CUSTOM">Custom</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jurisdiction">Jurisdiction</Label>
            <Select
              id="jurisdiction"
              value={filters.jurisdiction}
              onChange={(e) => setFilters(prev => ({ ...prev, jurisdiction: e.target.value }))}
            >
              <option value="">All Jurisdictions</option>
              <option value="FEDERAL">Federal</option>
              <option value="STATE">State</option>
              <option value="COUNTY">County</option>
              <option value="CITY">City</option>
              <option value="SPECIAL_DISTRICT">Special District</option>
              <option value="INTERNATIONAL">International</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Select
              id="period"
              value={filters.period}
              onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
            >
              <option value="">All Periods</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="SEMI_ANNUAL">Semi-Annual</option>
              <option value="ANNUAL">Annual</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filingStatus">Filing Status</Label>
            <Select
              id="filingStatus"
              value={filters.filingStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, filingStatus: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="FILED">Filed</option>
              <option value="AMENDED">Amended</option>
              <option value="EXTENDED">Extended</option>
              <option value="LATE">Late</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="relative">
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                isClearable
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholderText="Select date range"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Reports</p>
              <p className="text-2xl font-bold">
                {data?.items.filter(report => report.filingStatus === 'PENDING').length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Filed Reports</p>
              <p className="text-2xl font-bold">
                {data?.items.filter(report => report.filingStatus === 'FILED').length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue Reports</p>
              <p className="text-2xl font-bold">{overdueReports}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Due in 30 Days</p>
              <p className="text-2xl font-bold">{upcomingReports}</p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        table={table}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/tax-compliance/tax-reports/${row.id}`)}
      />
    </div>
  );
}