import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ClipboardCheck, Plus, Search, Eye, Edit, AlertTriangle, CheckCircle, Clock, Calendar, User, TrendingUp } from 'lucide-react';
import { useQuality } from '@/hooks/useQuality';

const PAGE_SIZE = 10;

const CorrectiveActions: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const { loading, error, nonConformances, fetchNonConformances } = useQuality();

  useEffect(() => {
    fetchNonConformances({}, currentPage, PAGE_SIZE);
  }, [fetchNonConformances, currentPage]);

  // Flatten all corrective actions from nonConformances
  const actions = useMemo(() => {
    return nonConformances.flatMap(nc =>
      (nc.correctiveActions || []).map(ca => ({
        ...ca,
        nonConformanceNumber: nc.nonConformanceNumber,
        nonConformanceId: nc.id,
        assignedTo: ca.assignedTo || nc.assignedTo,
        type: ca.type || nc.type || 'CORRECTIVE',
        priority: ca.priority || nc.priority || 'MEDIUM',
        status: ca.status || 'OPEN',
        progress: ca.progress || 0,
        effectiveness: ca.effectiveness,
        startedAt: ca.startedAt,
        completedAt: ca.completedAt,
        dueDate: ca.dueDate,
        verificationMethod: ca.verificationMethod,
        verificationDate: ca.verificationDate,
        verifiedBy: ca.verifiedBy,
        costImpact: ca.costImpact,
        notes: ca.notes,
        attachments: ca.attachments,
        createdAt: ca.createdAt,
        updatedAt: ca.updatedAt,
        createdBy: ca.createdBy,
      }))
    );
  }, [nonConformances]);

  const filteredActions = actions.filter(action => {
    const matchesSearch = (action.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.assignedTo?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || action.status === selectedStatus;
    const matchesType = selectedType === 'all' || action.type === selectedType;
    const matchesPriority = selectedPriority === 'all' || action.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const totalPages = Math.ceil(filteredActions.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedActions = filteredActions.slice(startIndex, startIndex + PAGE_SIZE);

  // Stats
  const stats = {
    total: actions.length,
    open: actions.filter(a => a.status === 'OPEN').length,
    inProgress: actions.filter(a => a.status === 'IN_PROGRESS').length,
    completed: actions.filter(a => a.status === 'COMPLETED').length,
    overdue: actions.filter(a => a.status !== 'COMPLETED' && new Date(a.dueDate) < new Date()).length,
    avgCompletionTime: actions
      .filter(a => a.completedAt && a.startedAt)
      .reduce((acc, a) => {
        const start = new Date(a.startedAt);
        const end = new Date(a.completedAt);
        return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / Math.max(1, actions.filter(a => a.completedAt && a.startedAt).length)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'secondary';
      case 'IN_PROGRESS': return 'default';
      case 'COMPLETED': return 'default';
      case 'CANCELLED': return 'destructive';
      case 'OVERDUE': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'CORRECTIVE' ? 'destructive' : 'default';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'default';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'secondary';
    }
  };

  const handleViewAction = (actionId: string) => {
    navigate(`/quality/corrective-actions/${actionId}`);
  };

  const handleEditAction = (actionId: string) => {
    navigate(`/quality/corrective-actions/${actionId}/edit`);
  };

  const handleCreateAction = () => {
    navigate('/quality/corrective-actions/create');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading corrective actions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Corrective Actions</h1>
          <p className="text-muted-foreground">
            Manage corrective and preventive actions for quality issues
          </p>
        </div>
        <Button onClick={handleCreateAction}>
          <Plus className="h-4 w-4 mr-2" />
          New Action
        </Button>
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ClipboardCheck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Actions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Days</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avgCompletionTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="CORRECTIVE">Corrective</option>
              <option value="PREVENTIVE">Preventive</option>
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </CardContent>
      </Card>
      {/* Actions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Actions ({filteredActions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedActions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Action</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Assigned To</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Progress</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActions.map((action) => {
                    const isOverdue = action.status !== 'COMPLETED' && new Date(action.dueDate) < new Date();
                    return (
                      <tr key={action.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{action.title}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{action.description}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getTypeColor(action.type) as any}>
                            {action.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusColor(action.status) as any}>
                            {action.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getPriorityColor(action.priority) as any}>
                            {action.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{action.assignedTo?.name ?? 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {action.dueDate ? new Date(action.dueDate).toLocaleDateString() : 'N/A'}
                            {isOverdue && (
                              <div className="text-xs text-red-500">Overdue</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {action.status === 'COMPLETED' && action.effectiveness && (
                              <Badge variant={
                                action.effectiveness === 'EFFECTIVE' ? 'default' :
                                action.effectiveness === 'PARTIALLY_EFFECTIVE' ? 'secondary' : 'destructive'
                              }>
                                {action.effectiveness.replace('_', ' ')}
                              </Badge>
                            )}
                            {action.status === 'IN_PROGRESS' && (
                              <span className="text-blue-600">In Progress</span>
                            )}
                            {action.status === 'OPEN' && (
                              <span className="text-gray-500">Not Started</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAction(action.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAction(action.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No actions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedStatus !== 'all' || selectedType !== 'all' || selectedPriority !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first corrective action.'
                }
              </p>
              {!searchTerm && selectedStatus === 'all' && selectedType === 'all' && selectedPriority === 'all' && (
                <div className="mt-6">
                  <Button onClick={handleCreateAction}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Action
                  </Button>
                </div>
              )}
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, filteredActions.length)} of{' '}
                {filteredActions.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CorrectiveActions; 