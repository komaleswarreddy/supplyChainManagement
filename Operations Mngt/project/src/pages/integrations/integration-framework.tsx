import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Wifi, WifiOff, Activity, Shield } from 'lucide-react';

export default function IntegrationFramework() {
  const [activeTab, setActiveTab] = useState('integrations');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integration Framework</h1>
          <p className="text-muted-foreground">Manage external system integrations and API connections</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Integration
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="mappings">Data Mappings</TabsTrigger>
          <TabsTrigger value="monitoring">Health Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Integration Name</label>
                      <Input placeholder="Enter integration name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Integration Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="erp">ERP System</SelectItem>
                          <SelectItem value="crm">CRM System</SelectItem>
                          <SelectItem value="payment">Payment Gateway</SelectItem>
                          <SelectItem value="shipping">Shipping Provider</SelectItem>
                          <SelectItem value="accounting">Accounting System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Provider</label>
                    <Input placeholder="Enter provider name" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Connection URL</label>
                    <Input placeholder="https://api.provider.com" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Authentication Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select auth type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="api_key">API Key</SelectItem>
                          <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                          <SelectItem value="basic">Basic Auth</SelectItem>
                          <SelectItem value="bearer">Bearer Token</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">API Version</label>
                      <Input placeholder="v1.0" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Credentials</label>
                    <div className="space-y-2">
                      <Input placeholder="API Key or Username" type="password" />
                      <Input placeholder="Secret or Password" type="password" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea placeholder="Describe the integration purpose" />
                  </div>

                  <div className="flex gap-2">
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Integration
                    </Button>
                    <Button variant="outline">
                      <Activity className="w-4 h-4 mr-2" />
                      Test Connection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Integration Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection Status</span>
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Sync</span>
                    <span className="text-sm text-muted-foreground">5 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sync Frequency</span>
                    <span className="text-sm text-muted-foreground">Every 15 minutes</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="encryption" defaultChecked />
                    <label htmlFor="encryption" className="text-sm">Enable Encryption</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="ssl" defaultChecked />
                    <label htmlFor="ssl" className="text-sm">SSL/TLS Required</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="audit" defaultChecked />
                    <label htmlFor="audit" className="text-sm">Audit Logging</label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">GET /api/v1/orders</div>
                    <div className="text-sm text-muted-foreground">Retrieve orders from external system</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">POST /api/v1/inventory</div>
                    <div className="text-sm text-muted-foreground">Update inventory levels</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">PUT /api/v1/customers</div>
                    <div className="text-sm text-muted-foreground">Update customer information</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Inactive</Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Order Status Updates</div>
                    <div className="text-sm text-muted-foreground">https://company.com/webhooks/orders</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Inventory Changes</div>
                    <div className="text-sm text-muted-foreground">https://company.com/webhooks/inventory</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Active</Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mappings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Mappings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Order Mapping</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">External Field:</span>
                      <span className="ml-2">order_id</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Internal Field:</span>
                      <span className="ml-2">external_order_id</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">External Field:</span>
                      <span className="ml-2">customer_name</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Internal Field:</span>
                      <span className="ml-2">customer_full_name</span>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Customer Mapping</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">External Field:</span>
                      <span className="ml-2">customer_id</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Internal Field:</span>
                      <span className="ml-2">sf_contact_id</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">External Field:</span>
                      <span className="ml-2">email</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Internal Field:</span>
                      <span className="ml-2">contact_email</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Connection Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SAP ERP</span>
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Healthy</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Salesforce CRM</span>
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Healthy</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stripe Payment</span>
                    <div className="flex items-center gap-2">
                      <WifiOff className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Error</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-medium">245ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium text-green-600">99.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span className="font-medium text-red-600">0.8%</span>
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
                    <div className="font-medium">Data sync completed</div>
                    <div className="text-muted-foreground">SAP ERP - 5 min ago</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Webhook received</div>
                    <div className="text-muted-foreground">Salesforce - 12 min ago</div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Connection error</div>
                    <div className="text-muted-foreground">Stripe - 15 min ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 