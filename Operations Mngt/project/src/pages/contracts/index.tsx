import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, FileText, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ContractManagementDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { data: contracts, isLoading, error } = useContracts();
  const { mutate: deleteContract } = useContracts();
  const { showConfirm } = useConfirmDialog();

  const filteredContracts = contracts?.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Delete Contract',
      message: 'Are you sure you want to delete this contract? This action cannot be undone.',
      onConfirm: () => deleteContract(id)
    });
  };

  if (isLoading) return <div>Loading contracts...</div>;
  if (error) return <div>Error loading contracts: {error.message}</div>;

  const totalValue = contracts?.reduce((sum, c) => sum + (c.total_value || 0), 0) || 0;
  const activeContracts = contracts?.filter(c => c.status === 'active').length || 0;
  const expiringSoon = contracts?.filter(c => {
    if (!c.end_date) return false;
    const daysUntilExpiry = Math.ceil((new Date(c.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contract Management</h1>
          <p className="text-muted-foreground">Manage contracts, agreements, and compliance tracking</p>
        </div>
        <Button onClick={() => navigate('/contracts/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Contract
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {activeContracts} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              across all contracts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{expiringSoon}</div>
            <p className="text-xs text-muted-foreground">
              within 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">96.8%</div>
            <p className="text-xs text-muted-foreground">
              compliant contracts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contract List */}
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search contracts..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="employment">Employment</SelectItem>
                <SelectItem value="lease">Lease</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Parties</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts?.map((contract) => {
                const daysUntilExpiry = contract.end_date ? 
                  Math.ceil((new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
                  null;
                
                return (
                  <TableRow key={contract.id}>
                    <TableCell className="font-mono">{contract.contract_number}</TableCell>
                    <TableCell className="font-medium">{contract.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{contract.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{contract.parties?.[0]?.name || 'N/A'}</div>
                        {contract.parties && contract.parties.length > 1 && (
                          <div className="text-muted-foreground">+{contract.parties.length - 1} more</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(contract.total_value || 0)}</TableCell>
                    <TableCell>{contract.start_date ? formatDate(contract.start_date) : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{contract.end_date ? formatDate(contract.end_date) : 'N/A'}</div>
                        {daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
                          <div className="text-orange-600 text-xs">
                            Expires in {daysUntilExpiry} days
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          contract.status === 'active' ? 'default' : 
                          contract.status === 'expired' ? 'destructive' : 'secondary'
                        }
                      >
                        {contract.status}
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
                          <DropdownMenuItem onClick={() => navigate(`/contracts/${contract.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/contracts/${contract.id}/edit`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/contracts/${contract.id}/compliance`)}>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Compliance
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(contract.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/contracts/templates')}>
              <FileText className="w-4 h-4 mr-2" />
              Contract Templates
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/contracts/compliance')}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Compliance Dashboard
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/contracts/reports')}>
              <FileText className="w-4 h-4 mr-2" />
              Contract Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Average Contract Value</div>
                <div className="text-2xl font-bold text-blue-600">
                  {contracts?.length ? formatCurrency(totalValue / contracts.length) : '$0'}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Contract Duration</div>
                <div className="text-2xl font-bold text-green-600">18 months</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Renewal Rate</div>
                <div className="text-2xl font-bold text-purple-600">87.3%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">Contract renewed</div>
                <div className="text-muted-foreground">Supplier Agreement A - 1 day ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">New contract signed</div>
                <div className="text-muted-foreground">Service Contract B - 3 days ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Compliance review</div>
                <div className="text-muted-foreground">Employment Contract C - 5 days ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 