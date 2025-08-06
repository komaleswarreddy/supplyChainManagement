import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Settings, Play, Save, Trash2 } from 'lucide-react';

export default function BusinessRulesEngine() {
  const [activeTab, setActiveTab] = useState('rules');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Rules Engine</h1>
          <p className="text-muted-foreground">Configure and manage business rules for automated decision making</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Rule
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="simulator">Test Simulator</TabsTrigger>
          <TabsTrigger value="logs">Execution Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Rule Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Rule Name</label>
                      <Input placeholder="Enter rule name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Rule Type</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="validation">Validation</SelectItem>
                          <SelectItem value="calculation">Calculation</SelectItem>
                          <SelectItem value="workflow">Workflow</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea placeholder="Describe the rule purpose" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Conditions</label>
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Select>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Field" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="amount">Amount</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="greater">Greater Than</SelectItem>
                            <SelectItem value="less">Less Than</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="Value" className="flex-1" />
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Condition
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Actions</label>
                    <div className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Select>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approve">Approve</SelectItem>
                            <SelectItem value="reject">Reject</SelectItem>
                            <SelectItem value="notify">Send Notification</SelectItem>
                            <SelectItem value="calculate">Calculate</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="Parameters" className="flex-1" />
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Action
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Rule
                    </Button>
                    <Button variant="outline">
                      <Play className="w-4 h-4 mr-2" />
                      Test Rule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rule Properties</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Applicable Modules</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="procurement" />
                        <label htmlFor="procurement" className="text-sm">Procurement</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="inventory" />
                        <label htmlFor="inventory" className="text-sm">Inventory</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="finance" />
                        <label htmlFor="finance" className="text-sm">Finance</label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rule Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Executions</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium text-green-600">98.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Executed</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rule Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Budget Validation</h4>
                      <Badge variant="outline">Validation</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Validates requisitions against budget limits
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Approval Routing</h4>
                      <Badge variant="outline">Workflow</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Routes documents based on amount and category
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Price Calculation</h4>
                      <Badge variant="outline">Calculation</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Calculates pricing based on volume and terms
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rule Test Simulator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Test Data</label>
                  <Textarea 
                    placeholder="Enter JSON test data"
                    className="h-32"
                    defaultValue={`{
  "amount": 50000,
  "category": "IT Equipment",
  "department": "Technology",
  "supplier": "TechCorp"
}`}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Test Results</label>
                  <div className="border rounded-lg p-4 h-32 bg-gray-50">
                    <div className="text-sm text-muted-foreground">
                      Click "Run Test" to see results
                    </div>
                  </div>
                </div>
              </div>
              <Button>
                <Play className="w-4 h-4 mr-2" />
                Run Test
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Execution Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Budget Validation Rule</div>
                    <div className="text-sm text-muted-foreground">Executed 2 hours ago</div>
                  </div>
                  <Badge variant="default">Success</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Approval Routing Rule</div>
                    <div className="text-sm text-muted-foreground">Executed 4 hours ago</div>
                  </div>
                  <Badge variant="secondary">Warning</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Price Calculation Rule</div>
                    <div className="text-sm text-muted-foreground">Executed 6 hours ago</div>
                  </div>
                  <Badge variant="destructive">Error</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 