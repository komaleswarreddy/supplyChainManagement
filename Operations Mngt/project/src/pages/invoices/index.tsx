import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, FileText, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InvoiceManagementDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { data: invoices, isLoading, error } = useInvoices();
  const { mutate: deleteInvoice } = useInvoices();
  const { showConfirm } = useConfirmDialog();

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesType = typeFilter === 'all' || invoice.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDelete = (id: string) => {
    showConfirm({
      title: 'Delete Invoice',
      message: 'Are you sure you want to delete this invoice? This action cannot be undone.',
      onConfirm: () => deleteInvoice(id)
    });
  };

  if (isLoading) return <div>Loading invoices...</div>;
  if (error) return <div>Error loading invoices: {error.message}</div>;

  const totalAmount = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
  const paidAmount = invoices?.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0) || 0;
  const overdueInvoices = invoices?.filter(inv => {
    if (inv.status !== 'sent' || !inv.due_date) return false;
    return new Date(inv.due_date) < new Date();
  }).length || 0;
  const pendingInvoices = invoices?.filter(inv => inv.status === 'sent').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">Manage invoices, payments, and financial tracking</p>
        </div>
        <Button onClick={() => navigate('/invoices/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
          </Button>
        </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {pendingInvoices} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(paidAmount)} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">
              invoices past due
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              of invoices collected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search invoices..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices?.map((invoice) => {
                const isOverdue = invoice.status === 'sent' && invoice.due_date && 
                  new Date(invoice.due_date) < new Date();
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                    <TableCell className="font-medium">{invoice.customer_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{invoice.type}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.total_amount || 0)}</TableCell>
                    <TableCell>{formatCurrency(invoice.paid_amount || 0)}</TableCell>
                    <TableCell>{invoice.issue_date ? formatDate(invoice.issue_date) : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}</div>
                        {isOverdue && (
                          <div className="text-red-600 text-xs">
                            Overdue
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          invoice.status === 'paid' ? 'default' : 
                          invoice.status === 'overdue' || isOverdue ? 'destructive' : 'secondary'
                        }
                      >
                        {isOverdue ? 'Overdue' : invoice.status}
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
                          <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}/payments`)}>
                            <DollarSign className="w-4 h-4 mr-2" />
                            View Payments
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(invoice.id)}
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
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/invoices/templates')}>
              <FileText className="w-4 h-4 mr-2" />
              Invoice Templates
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/invoices/reports')}>
              <DollarSign className="w-4 h-4 mr-2" />
              Financial Reports
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/invoices/disputes')}>
              <AlertTriangle className="w-4 h-4 mr-2" />
              Dispute Management
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Average Payment Time</div>
                <div className="text-2xl font-bold text-blue-600">28 days</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Outstanding Amount</div>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalAmount - paidAmount)}
            </div>
          </div>
              <div>
                <div className="text-sm text-muted-foreground">Disputed Invoices</div>
                <div className="text-2xl font-bold text-red-600">3</div>
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
                <div className="font-medium">Payment received</div>
                <div className="text-muted-foreground">Invoice #INV-2024-001 - 2 hours ago</div>
          </div>
              <div className="text-sm">
                <div className="font-medium">Invoice sent</div>
                <div className="text-muted-foreground">Invoice #INV-2024-015 - 4 hours ago</div>
          </div>
              <div className="text-sm">
                <div className="font-medium">Dispute resolved</div>
                <div className="text-muted-foreground">Invoice #INV-2024-008 - 1 day ago</div>
          </div>
        </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}