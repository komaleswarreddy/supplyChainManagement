import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Filter, TrendingUp, BarChart3, Calendar, Download, RefreshCw, Settings, Eye
} from 'lucide-react';
import { useForecasts } from '@/hooks/useSupplyChain';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { ForecastChart } from '@/components/supply-chain/forecast-chart';
import { ForecastFilters } from '@/components/supply-chain/forecast-filters';
import { ForecastActions } from '@/components/supply-chain/forecast-actions';

export default function ForecastingPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    algorithm: '',
    startDateFrom: '',
    startDateTo: '',
  });

  const { data: forecastsData, isLoading, error, refetch } = useForecasts({
    page,
    pageSize,
    search,
    ...filters,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BarChart3 className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Forecasts</h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demand Forecasting</h1>
          <p className="text-muted-foreground">
            Generate and manage demand forecasts for inventory planning
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Link to="/supply-chain/forecasting/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Forecast
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search forecasts..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
          <ForecastFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forecasts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forecastsData?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastsData?.data?.reduce((sum, f) => sum + (f.accuracy?.mape || 0), 0) / (forecastsData?.data?.length || 1) || 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forecasts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastsData?.data?.filter(f => f.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forecast Periods</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastsData?.data?.reduce((sum, f) => sum + (f.forecastPeriods || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecasts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Forecasts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading forecasts...</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Forecast Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Algorithm</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Periods</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forecastsData?.items?.map((forecast) => (
                    <TableRow key={forecast.id}>
                      <TableCell className="font-medium">
                        <Link 
                          to={`/supply-chain/forecasting/${forecast.id}`}
                          className="text-primary hover:underline"
                        >
                          {forecast.forecastNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{forecast.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{forecast.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{forecast.algorithm}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            (forecast.accuracy || 0) >= 90 ? 'text-green-600' :
                            (forecast.accuracy || 0) >= 80 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {(forecast.accuracy || 0).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={forecast.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {forecast.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{forecast.periods}</TableCell>
                      <TableCell>
                        {new Date(forecast.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <ForecastActions 
                          forecastId={forecast.id}
                          onEdit={(id) => window.location.href = `/supply-chain/forecasting/${id}/edit`}
                          onDelete={(id) => console.log('Delete', id)}
                          onDuplicate={(id) => console.log('Duplicate', id)}
                          onView={(id) => window.location.href = `/supply-chain/forecasting/${id}`}
                          onExport={(id) => console.log('Export', id)}
                          onRun={(id) => console.log('Run', id)}
                          onPause={(id) => console.log('Pause', id)}
                          onRefresh={(id) => console.log('Refresh', id)}
                          status={forecast.status}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {forecastsData && forecastsData.total > pageSize && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, forecastsData.total)} of {forecastsData.total} results
                  </div>
                  <Pagination
                    currentPage={page}
                    totalPages={forecastsData.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Forecast Chart Preview */}
      {forecastsData?.data && forecastsData.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Forecast Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ForecastChart 
              data={forecastsData.data.slice(0, 5)} // Show first 5 forecasts
              height={300}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}