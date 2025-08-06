import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useQuality } from '@/hooks/useQuality';

const QualityAudits: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { qualityAudits, fetchQualityAudits, loading, error } = useQuality();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchQualityAudits();
  }, [fetchQualityAudits]);

  const filteredAudits = (qualityAudits || []).filter(audit => {
    const matchesSearch = audit.auditNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audit.scope.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (audit.auditor?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || audit.auditType === selectedType;
    const matchesStatus = selectedStatus === 'all' || audit.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredAudits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAudits = filteredAudits.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'outline';
      case 'IN_PROGRESS': return 'default';
      case 'COMPLETED': return 'default';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INTERNAL': return 'default';
      case 'EXTERNAL': return 'secondary';
      case 'SUPPLIER': return 'outline';
      case 'CERTIFICATION': return 'destructive';
      default: return 'secondary';
    }
  };
  const getResultColor = (result?: string) => {
    switch (result) {
      case 'PASS': return 'text-green-600';
      case 'FAIL': return 'text-red-600';
      case 'CONDITIONAL': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };
  const handleViewAudit = (auditId: string) => navigate(`/quality/audits/${auditId}`);
  const handleEditAudit = (auditId: string) => navigate(`/quality/audits/${auditId}/edit`);
  const handleCreateAudit = () => navigate('/quality/audits/create');

  // Calculate statistics
  const stats = {
    total: qualityAudits?.length || 0,
    planned: (qualityAudits || []).filter(a => a.status === 'PLANNED').length,
    inProgress: (qualityAudits || []).filter(a => a.status === 'IN_PROGRESS').length,
    completed: (qualityAudits || []).filter(a => a.status === 'COMPLETED').length,
    avgComplianceScore: Math.round(
      (qualityAudits || []).filter(a => a.complianceScore > 0).reduce((acc, a) => acc + a.complianceScore, 0) /
      Math.max(1, (qualityAudits || []).filter(a => a.complianceScore > 0).length)
    ),
    totalFindings: (qualityAudits || []).reduce((acc, a) => acc + (a.totalFindings || 0), 0),
    openFindings: (qualityAudits || []).reduce((acc, a) =>
      acc + (a.findings ? a.findings.filter(f => f.status === 'OPEN').length : 0), 0
    )
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading quality audits...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-2 text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quality Audits</h1>
          <p className="text-muted-foreground">
            Manage quality audits, compliance assessments, and certification activities
          </p>
        </div>
        <Button onClick={handleCreateAudit}>
          <Plus className="h-4 w-4 mr-2" />
          New Audit
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Audits</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Planned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.planned}</p>
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
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgComplianceScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Findings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFindings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open Findings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openFindings}</p>
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
                  placeholder="Search audits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="INTERNAL">Internal</option>
              <option value="EXTERNAL">External</option>
              <option value="SUPPLIER">Supplier</option>
              <option value="CERTIFICATION">Certification</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audits ({filteredAudits.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedAudits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Audit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Auditor</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Result</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Findings</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAudits.map((audit) => (
                    <tr key={audit.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{audit.auditNumber}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {audit.scope}
                          </p>
                          {audit.supplier && (
                            <p className="text-xs text-gray-400">
                              <Building className="h-3 w-3 inline mr-1" />
                              {audit.supplier.name}
                            </p>
                          )}
                          {audit.auditee && (
                            <p className="text-xs text-gray-400">
                              <Users className="h-3 w-3 inline mr-1" />
                              {audit.auditee.name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getTypeColor(audit.auditType) as any}>
                          {audit.auditType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusColor(audit.status) as any}>
                          {audit.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium">{audit.auditor?.name}</p>
                          <p className="text-xs text-gray-400">
                            {audit.auditor?.certifications?.slice(0, 1).join(', ')}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {new Date(audit.plannedDate).toLocaleDateString()}
                          {audit.duration && (
                            <div className="text-xs text-gray-500">
                              {audit.duration}h duration
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {audit.result ? (
                          <div>
                            <span className={`font-medium ${getResultColor(audit.result)}`}>
                              {audit.result}
                            </span>
                            {audit.complianceScore > 0 && (
                              <div className="text-xs text-gray-500">
                                {audit.complianceScore}% compliance
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {audit.totalFindings > 0 ? (
                            <div>
                              <div className="flex items-center space-x-2">
                                {audit.majorFindings > 0 && (
                                  <Badge variant="destructive" size="sm">
                                    {audit.majorFindings} Major
                                  </Badge>
                                )}
                                {audit.minorFindings > 0 && (
                                  <Badge variant="secondary" size="sm">
                                    {audit.minorFindings} Minor
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {audit.findings?.filter(f => f.status === 'OPEN').length || 0} open
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAudit(audit.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAudit(audit.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No audits found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first quality audit.'
                }
              </p>
              {!searchTerm && selectedType === 'all' && selectedStatus === 'all' && (
                <div className="mt-6">
                  <Button onClick={handleCreateAudit}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Audit
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAudits.length)} of{' '}
                {filteredAudits.length} results
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

export default QualityAudits; 