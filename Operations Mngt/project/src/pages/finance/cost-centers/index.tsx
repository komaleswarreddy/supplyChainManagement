import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { useCostCenters } from '@/hooks/useCostCenters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { formatCurrency } from '@/lib/utils';

export default function CostCentersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { data: costCenters, isLoading, error } = useCostCenters();
  const { mutate: deleteCostCenter } = useCostCenters();
  const { showConfirm } = useConfirmDialog();

  const filteredCostCenters = costCenters?.filter(cc => {
    const matchesSearch = cc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cc.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cc.status === statusFilter;
    const matchesType = typeFilter === 'all' || cc.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Delete Cost Center',
      message: 'Are you sure you want to delete this cost center? This action cannot be undone.',
      onConfirm: () => deleteCostCenter(id)
    });
  };

  if (isLoading) return <div>Loading cost centers...</div>;
  if (error) return <div>Error loading cost centers: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cost Centers</h1>
          <p className="text-muted-foreground">Manage organizational cost centers and budget allocations</p>
        </div>
        <Button onClick={() => navigate('/finance/cost-centers/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Cost Center
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Centers Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {costCenters?.filter(cc => cc.status === 'active').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(costCenters?.reduce((sum, cc) => sum + (cc.budget || 0), 0) || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(costCenters?.reduce((sum, cc) => sum + (cc.spent || 0), 0) || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {costCenters?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Centers</div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search cost centers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="location">Location</SelectItem>
                <SelectItem value="function">Function</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCostCenters?.map((costCenter) => (
                <TableRow key={costCenter.id}>
                  <TableCell className="font-mono">{costCenter.code}</TableCell>
                  <TableCell className="font-medium">{costCenter.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{costCenter.type}</Badge>
                  </TableCell>
                  <TableCell>{costCenter.manager_name || 'Not assigned'}</TableCell>
                  <TableCell>{formatCurrency(costCenter.budget || 0)}</TableCell>
                  <TableCell>{formatCurrency(costCenter.spent || 0)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={costCenter.status === 'active' ? 'default' : 'secondary'}
                    >
                      {costCenter.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/finance/cost-centers/${costCenter.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/finance/cost-centers/${costCenter.id}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(costCenter.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 