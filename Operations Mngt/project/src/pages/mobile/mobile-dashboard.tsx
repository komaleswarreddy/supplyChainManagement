import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  ArrowUpDown, 
  Check, 
  Clock, 
  Code, 
  Download, 
  ExternalLink, 
  Filter, 
  Lock, 
  RefreshCw, 
  Save, 
  Search, 
  Settings, 
  Shield, 
  Sliders, 
  Webhook, 
  Zap,
  Plus,
  Trash2,
  Edit,
  Play,
  TestTube,
  Database,
  FileText,
  Users,
  ShoppingCart,
  Package,
  Truck,
  DollarSign,
  Globe,
  Mail,
  Bell,
  Key,
  Eye,
  EyeOff,
  Copy,
  Upload,
  Monitor,
  AlertCircle,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  Smartphone,
  Tablet,
  Laptop,
  Camera,
  MapPin,
  Fingerprint,
  Battery,
  Signal,
  Cloud,
  CloudOff,
  CheckCircle2,
  XCircle2,
  AlertCircle2,
  Pause,
  Stop,
  RotateCcw,
  Info,
  HelpCircle,
  User,
  LogOut,
  Menu,
  Home,
  MoreVertical
} from 'lucide-react';

// Mock data for Mobile & Offline Dashboard
const mockConnectivityStatus = {
  isOnline: navigator.onLine,
  lastSync: '2023-06-14T10:30:00Z',
  nextSync: '2023-06-14T11:30:00Z',
  syncProgress: 85,
  pendingTransactions: 12,
  failedTransactions: 2,
  batteryLevel: 65,
  signalStrength: 4,
  deviceType: 'mobile',
  storageUsed: 45,
  storageTotal: 100,
};

const mockOfflineData = {
  inventory: [
    { id: 'inv-1', name: 'Product A', quantity: 150, location: 'Warehouse 1', lastUpdated: '2023-06-14T09:00:00Z' },
    { id: 'inv-2', name: 'Product B', quantity: 75, location: 'Warehouse 2', lastUpdated: '2023-06-14T08:30:00Z' },
    { id: 'inv-3', name: 'Product C', quantity: 200, location: 'Warehouse 1', lastUpdated: '2023-06-14T10:15:00Z' },
  ],
  orders: [
    { id: 'ord-1', customer: 'Customer A', status: 'PENDING', total: 1250, created: '2023-06-14T09:30:00Z' },
    { id: 'ord-2', customer: 'Customer B', status: 'PROCESSING', total: 890, created: '2023-06-14T10:00:00Z' },
  ],
  tasks: [
    { id: 'task-1', title: 'Inventory Count', priority: 'HIGH', dueDate: '2023-06-15', status: 'PENDING' },
    { id: 'task-2', title: 'Order Fulfillment', priority: 'MEDIUM', dueDate: '2023-06-14', status: 'IN_PROGRESS' },
  ],
};

const mockPendingTransactions = [
  { id: 'txn-1', type: 'INVENTORY_UPDATE', entity: 'Product A', status: 'PENDING', timestamp: '2023-06-14T10:25:00Z', retries: 0 },
  { id: 'txn-2', type: 'ORDER_CREATE', entity: 'Customer C', status: 'PENDING', timestamp: '2023-06-14T10:20:00Z', retries: 1 },
  { id: 'txn-3', type: 'SUPPLIER_UPDATE', entity: 'Supplier X', status: 'FAILED', timestamp: '2023-06-14T10:15:00Z', retries: 3 },
];

const mockSyncHistory = [
  { id: 'sync-1', type: 'INVENTORY', status: 'SUCCESS', records: 150, duration: 45, timestamp: '2023-06-14T10:30:00Z' },
  { id: 'sync-2', type: 'ORDERS', status: 'SUCCESS', records: 25, duration: 30, timestamp: '2023-06-14T10:25:00Z' },
  { id: 'sync-3', type: 'SUPPLIERS', status: 'FAILED', records: 0, duration: 0, timestamp: '2023-06-14T10:20:00Z', error: 'Network timeout' },
];

const mockDeviceInfo = {
  type: 'mobile',
  os: 'iOS 16.5',
  browser: 'Safari',
  screenSize: '375x812',
  orientation: 'portrait',
  batteryLevel: 65,
  isCharging: false,
  storage: {
    used: 45,
    total: 100,
    available: 55,
  },
  permissions: {
    camera: true,
    location: true,
    notifications: true,
    biometrics: false,
  },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF0000'];

export default function MobileDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Offline transaction form state
  const [newTransaction, setNewTransaction] = useState({
    type: '',
    entity: '',
    data: '',
  });

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineMode(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const startSync = () => {
    setIsSyncing(true);
    setSyncProgress(0);
    
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const filteredInventory = mockOfflineData.inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = mockOfflineData.orders.filter(order =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = mockOfflineData.tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mobile & Offline Dashboard</h1>
          <p className="text-muted-foreground">
            Manage mobile devices, offline data, and synchronization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          <Button onClick={startSync} disabled={isSyncing}>
            {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </div>

      {/* Connectivity Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Connectivity Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <div className="font-medium">Connection</div>
                <div className="text-sm text-muted-foreground">
                  {isOnline ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Battery className="h-5 w-5" />
              <div>
                <div className="font-medium">Battery</div>
                <div className="text-sm text-muted-foreground">
                  {mockConnectivityStatus.batteryLevel}%
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Signal className="h-5 w-5" />
              <div>
                <div className="font-medium">Signal</div>
                <div className="text-sm text-muted-foreground">
                  {mockConnectivityStatus.signalStrength}/5 bars
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5" />
              <div>
                <div className="font-medium">Storage</div>
                <div className="text-sm text-muted-foreground">
                  {mockConnectivityStatus.storageUsed}% used
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="offline">Offline Data</TabsTrigger>
          <TabsTrigger value="sync">Sync Status</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockConnectivityStatus.pendingTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  Waiting to sync
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{mockConnectivityStatus.failedTransactions}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sync Progress</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{syncProgress}%</div>
                <p className="text-xs text-muted-foreground">
                  {isSyncing ? 'Syncing...' : 'Last sync: 2 hours ago'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sync Progress Bar */}
          {isSyncing && (
            <Card>
              <CardHeader>
                <CardTitle>Synchronization Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={syncProgress} className="w-full" />
                <div className="mt-2 text-sm text-muted-foreground">
                  Syncing data... {syncProgress}% complete
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Offline Data Management</h3>
              <p className="text-sm text-muted-foreground">
                Data available when offline
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search offline data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Offline Inventory
                </CardTitle>
                <CardDescription>
                  {filteredInventory.length} items available offline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredInventory.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} units at {item.location}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Offline Orders
                </CardTitle>
                <CardDescription>
                  {filteredOrders.length} orders available offline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-muted-foreground">
                          ${order.total} - {order.status}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {new Date(order.created).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Synchronization Status</h3>
              <p className="text-sm text-muted-foreground">
                Monitor sync history and pending transactions
              </p>
            </div>
            <Button onClick={startSync} disabled={isSyncing}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {isSyncing ? 'Syncing...' : 'Manual Sync'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Transactions</CardTitle>
                <CardDescription>
                  {mockPendingTransactions.length} transactions waiting to sync
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPendingTransactions.map((txn) => (
                    <div key={txn.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{txn.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {txn.entity} - {txn.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {new Date(txn.timestamp).toLocaleTimeString()}
                        </div>
                        {txn.retries > 0 && (
                          <div className="text-xs text-orange-600">
                            {txn.retries} retries
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sync History */}
            <Card>
              <CardHeader>
                <CardTitle>Sync History</CardTitle>
                <CardDescription>
                  Recent synchronization attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockSyncHistory.map((sync) => (
                    <div key={sync.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{sync.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {sync.records} records - {sync.duration}s
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={sync.status === 'SUCCESS' ? 'default' : 'destructive'}>
                          {sync.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(sync.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Device Management</h3>
              <p className="text-sm text-muted-foreground">
                Monitor and manage mobile devices
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Current Device
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Device Type</Label>
                      <div className="text-sm text-muted-foreground">{mockDeviceInfo.type}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">OS</Label>
                      <div className="text-sm text-muted-foreground">{mockDeviceInfo.os}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Browser</Label>
                      <div className="text-sm text-muted-foreground">{mockDeviceInfo.browser}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Screen</Label>
                      <div className="text-sm text-muted-foreground">{mockDeviceInfo.screenSize}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Battery Status</Label>
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4" />
                      <span className="text-sm">{mockDeviceInfo.batteryLevel}%</span>
                      {mockDeviceInfo.isCharging && (
                        <Badge variant="outline" className="text-xs">Charging</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Storage</Label>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Used</span>
                        <span>{mockDeviceInfo.storage.used}%</span>
                      </div>
                      <Progress value={mockDeviceInfo.storage.used} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {mockDeviceInfo.storage.available}GB available
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  App Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(mockDeviceInfo.permissions).map(([permission, granted]) => (
                    <div key={permission} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {permission === 'camera' && <Camera className="h-4 w-4" />}
                        {permission === 'location' && <MapPin className="h-4 w-4" />}
                        {permission === 'notifications' && <Bell className="h-4 w-4" />}
                        {permission === 'biometrics' && <Fingerprint className="h-4 w-4" />}
                        <span className="text-sm font-medium capitalize">{permission}</span>
                      </div>
                      <Switch checked={granted} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 