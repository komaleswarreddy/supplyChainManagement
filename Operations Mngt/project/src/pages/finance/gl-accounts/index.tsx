import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Filter, Download, Upload } from 'lucide-react';

interface GLAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  category: string;
  parentAccount?: string;
  balance: number;
  isActive: boolean;
  allowPosting: boolean;
  description?: string;
}

// Mock data for demonstration
const mockGLAccounts: GLAccount[] = [
  {
    id: '1',
    accountNumber: '1000',
    accountName: 'Cash - Operating Account',
    accountType: 'ASSET',
    category: 'Current Assets',
    balance: 125000.00,
    isActive: true,
    allowPosting: true,
    description: 'Primary operating cash account'
  },
  {
    id: '2',
    accountNumber: '1200',
    accountName: 'Accounts Receivable',
    accountType: 'ASSET',
    category: 'Current Assets',
    balance: 85000.00,
    isActive: true,
    allowPosting: true,
    description: 'Customer receivables'
  },
  {
    id: '3',
    accountNumber: '1500',
    accountName: 'Inventory',
    accountType: 'ASSET',
    category: 'Current Assets',
    balance: 250000.00,
    isActive: true,
    allowPosting: true,
    description: 'Raw materials and finished goods'
  },
  {
    id: '4',
    accountNumber: '2000',
    accountName: 'Accounts Payable',
    accountType: 'LIABILITY',
    category: 'Current Liabilities',
    balance: -45000.00,
    isActive: true,
    allowPosting: true,
    description: 'Vendor payables'
  },
  {
    id: '5',
    accountNumber: '4000',
    accountName: 'Sales Revenue',
    accountType: 'REVENUE',
    category: 'Operating Revenue',
    balance: -350000.00,
    isActive: true,
    allowPosting: true,
    description: 'Product sales revenue'
  },
  {
    id: '6',
    accountNumber: '5000',
    accountName: 'Cost of Goods Sold',
    accountType: 'EXPENSE',
    category: 'Cost of Sales',
    balance: 180000.00,
    isActive: true,
    allowPosting: true,
    description: 'Direct costs of products sold'
  }
];

const accountTypeColors = {
  ASSET: 'bg-green-100 text-green-800',
  LIABILITY: 'bg-red-100 text-red-800',
  EQUITY: 'bg-blue-100 text-blue-800',
  REVENUE: 'bg-purple-100 text-purple-800',
  EXPENSE: 'bg-orange-100 text-orange-800'
};

export default function GLAccountsPage() {
  const [accounts, setAccounts] = useState<GLAccount[]>(mockGLAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || account.accountType === selectedType;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && account.isActive) ||
      (selectedStatus === 'inactive' && !account.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const getBalanceDisplay = (account: GLAccount) => {
    const isCredit = account.accountType === 'LIABILITY' || 
                    account.accountType === 'EQUITY' || 
                    account.accountType === 'REVENUE';
    
    if (isCredit) {
      return account.balance < 0 ? formatCurrency(account.balance) : `(${formatCurrency(account.balance)})`;
    } else {
      return formatCurrency(account.balance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">General Ledger Accounts</h1>
          <p className="text-muted-foreground">
            Manage your chart of accounts and account balances
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$460,000</div>
            <p className="text-xs text-muted-foreground">
              Current & Fixed Assets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">$45,000</div>
            <p className="text-xs text-muted-foreground">
              Current & Long-term
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">$350,000</div>
            <p className="text-xs text-muted-foreground">
              Operating Revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">$180,000</div>
            <p className="text-xs text-muted-foreground">
              Operating Expenses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">$170,000</div>
            <p className="text-xs text-muted-foreground">
              Current Period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Accounts</CardTitle>
          <CardDescription>
            Search and filter your general ledger accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Account Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ASSET">Assets</SelectItem>
                <SelectItem value="LIABILITY">Liabilities</SelectItem>
                <SelectItem value="EQUITY">Equity</SelectItem>
                <SelectItem value="REVENUE">Revenue</SelectItem>
                <SelectItem value="EXPENSE">Expenses</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chart of Accounts</CardTitle>
          <CardDescription>
            Complete list of general ledger accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account #</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posting</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">
                    {account.accountNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{account.accountName}</div>
                      {account.description && (
                        <div className="text-sm text-muted-foreground">
                          {account.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={accountTypeColors[account.accountType]}
                    >
                      {account.accountType}
                    </Badge>
                  </TableCell>
                  <TableCell>{account.category}</TableCell>
                  <TableCell className="text-right font-mono">
                    {getBalanceDisplay(account)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.allowPosting ? "default" : "outline"}>
                      {account.allowPosting ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
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