import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  Plus, 
  Search, 
  Filter, 
  Eye,
  Edit,
  Shield,
  Calendar,
  FileText,
  AlertTriangle,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface QualityStandard {
  id: string;
  standardCode: string;
  standardName: string;
  version: string;
  type: 'ISO' | 'FDA' | 'ASTM' | 'CUSTOM';
  status: 'ACTIVE' | 'INACTIVE' | 'OBSOLETE' | 'DRAFT';
  description: string;
  requirements: {
    id: string;
    title: string;
    description: string;
    mandatory: boolean;
    criteria: string[];
  }[];
  effectiveDate: string;
  expiryDate?: string;
  applicableItems: string[];
  applicableSuppliers: string[];
  complianceLevel: number; // 0-100%
  lastAuditDate?: string;
  nextAuditDate?: string;
  certificationRequired: boolean;
  certificationBody?: string;
  certificationNumber?: string;
  certificationExpiry?: string;
  documentUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  updatedBy?: {
    id: string;
    name: string;
  };
}

const QualityStandards: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [standards, setStandards] = useState<QualityStandard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchQualityStandards();
  }, []);

  const fetchQualityStandards = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockStandards: QualityStandard[] = [
        {
          id: '1',
          standardCode: 'ISO-9001',
          standardName: 'Quality Management Systems',
          version: '2015',
          type: 'ISO',
          status: 'ACTIVE',
          description: 'International standard for quality management systems',
          requirements: [
            {
              id: 'req-1',
              title: 'Quality Policy',
              description: 'Establish and maintain a quality policy',
              mandatory: true,
              criteria: ['Documented policy', 'Management commitment', 'Communication']
            },
            {
              id: 'req-2',
              title: 'Document Control',
              description: 'Control of documents and records',
              mandatory: true,
              criteria: ['Document approval', 'Version control', 'Distribution control']
            },
            {
              id: 'req-3',
              title: 'Management Review',
              description: 'Regular management review of QMS',
              mandatory: true,
              criteria: ['Scheduled reviews', 'Input requirements', 'Output requirements']
            }
          ],
          effectiveDate: '2023-01-01T00:00:00Z',
          expiryDate: '2026-01-01T00:00:00Z',
          applicableItems: ['all'],
          applicableSuppliers: ['supplier-1', 'supplier-2'],
          complianceLevel: 92,
          lastAuditDate: '2023-11-15T00:00:00Z',
          nextAuditDate: '2024-11-15T00:00:00Z',
          certificationRequired: true,
          certificationBody: 'ISO Certification Body',
          certificationNumber: 'ISO-9001-2023-001',
          certificationExpiry: '2026-01-01T00:00:00Z',
          documentUrl: '/documents/iso-9001-2015.pdf',
          notes: 'Annual surveillance audit required',
          createdAt: '2023-01-01T10:00:00Z',
          updatedAt: '2023-11-15T14:30:00Z',
          createdBy: {
            id: 'user-1',
            name: 'John Smith'
          },
          updatedBy: {
            id: 'user-2',
            name: 'Jane Doe'
          }
        },
        {
          id: '2',
          standardCode: 'FDA-21CFR820',
          standardName: 'Quality System Regulation',
          version: '2024',
          type: 'FDA',
          status: 'ACTIVE',
          description: 'FDA regulation for medical device quality systems',
          requirements: [
            {
              id: 'req-4',
              title: 'Design Controls',
              description: 'Design and development controls',
              mandatory: true,
              criteria: ['Design planning', 'Design input', 'Design output', 'Design review']
            },
            {
              id: 'req-5',
              title: 'Risk Management',
              description: 'Risk analysis and management',
              mandatory: true,
              criteria: ['Risk identification', 'Risk analysis', 'Risk control', 'Risk monitoring']
            }
          ],
          effectiveDate: '2024-01-01T00:00:00Z',
          applicableItems: ['medical-devices'],
          applicableSuppliers: ['supplier-3'],
          complianceLevel: 88,
          lastAuditDate: '2024-01-20T00:00:00Z',
          nextAuditDate: '2024-07-20T00:00:00Z',
          certificationRequired: true,
          certificationBody: 'FDA',
          certificationNumber: 'FDA-QSR-2024-001',
          documentUrl: '/documents/fda-21cfr820.pdf',
          createdAt: '2024-01-01T09:00:00Z',
          updatedAt: '2024-01-20T16:00:00Z',
          createdBy: {
            id: 'user-2',
            name: 'Jane Doe'
          }
        },
        {
          id: '3',
          standardCode: 'CUSTOM-001',
          standardName: 'Internal Quality Standard',
          version: '1.0',
          type: 'CUSTOM',
          status: 'DRAFT',
          description: 'Company-specific quality standard for critical processes',
          requirements: [
            {
              id: 'req-6',
              title: 'Supplier Qualification',
              description: 'Requirements for supplier qualification process',
              mandatory: true,
              criteria: ['Initial assessment', 'On-site audit', 'Performance monitoring']
            }
          ],
          effectiveDate: '2024-03-01T00:00:00Z',
          applicableItems: ['critical-components'],
          applicableSuppliers: ['all'],
          complianceLevel: 0,
          certificationRequired: false,
          notes: 'Under development - pending management approval',
          createdAt: '2024-01-15T11:00:00Z',
          updatedAt: '2024-01-25T10:30:00Z',
          createdBy: {
            id: 'user-3',
            name: 'Mike Johnson'
          }
        }
      ];

      setTimeout(() => {
        setStandards(mockStandards);
        setLoading(false);
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch quality standards",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const filteredStandards = standards.filter(standard => {
    const matchesSearch = standard.standardCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         standard.standardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         standard.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || standard.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || standard.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStandards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStandards = filteredStandards.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'INACTIVE': return 'secondary';
      case 'OBSOLETE': return 'destructive';
      case 'DRAFT': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ISO': return 'default';
      case 'FDA': return 'destructive';
      case 'ASTM': return 'secondary';
      case 'CUSTOM': return 'outline';
      default: return 'secondary';
    }
  };

  const getComplianceColor = (level: number) => {
    if (level >= 90) return 'text-green-600';
    if (level >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleViewStandard = (standardId: string) => {
    navigate(`/quality/standards/${standardId}`);
  };

  const handleEditStandard = (standardId: string) => {
    navigate(`/quality/standards/${standardId}/edit`);
  };

  const handleCreateStandard = () => {
    navigate('/quality/standards/create');
  };

  // Calculate statistics
  const stats = {
    total: standards.length,
    active: standards.filter(s => s.status === 'ACTIVE').length,
    draft: standards.filter(s => s.status === 'DRAFT').length,
    certified: standards.filter(s => s.certificationRequired && s.certificationNumber).length,
    avgCompliance: Math.round(
      standards.reduce((acc, s) => acc + s.complianceLevel, 0) / Math.max(1, standards.length)
    ),
    expiringCertifications: standards.filter(s => 
      s.certificationExpiry && 
      new Date(s.certificationExpiry) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    ).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading quality standards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quality Standards</h1>
          <p className="text-muted-foreground">
            Manage quality standards, compliance requirements, and certifications
          </p>
        </div>
        <Button onClick={handleCreateStandard}>
          <Plus className="h-4 w-4 mr-2" />
          New Standard
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Standards</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.certified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Compliance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgCompliance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiringCertifications}</p>
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
                  placeholder="Search standards..."
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
              <option value="ISO">ISO</option>
              <option value="FDA">FDA</option>
              <option value="ASTM">ASTM</option>
              <option value="CUSTOM">Custom</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DRAFT">Draft</option>
              <option value="OBSOLETE">Obsolete</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Standards Table */}
      <Card>
        <CardHeader>
          <CardTitle>Standards ({filteredStandards.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedStandards.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Standard</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Compliance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Certification</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Next Audit</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStandards.map((standard) => {
                    const certificationExpiring = standard.certificationExpiry && 
                      new Date(standard.certificationExpiry) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <tr key={standard.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {standard.standardCode} - {standard.standardName}
                            </p>
                            <p className="text-sm text-gray-500">Version {standard.version}</p>
                            <p className="text-xs text-gray-400 truncate max-w-xs">
                              {standard.description}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getTypeColor(standard.type) as any}>
                            {standard.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getStatusColor(standard.status) as any}>
                            {standard.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  standard.complianceLevel >= 90 ? 'bg-green-600' :
                                  standard.complianceLevel >= 75 ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${standard.complianceLevel}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${getComplianceColor(standard.complianceLevel)}`}>
                              {standard.complianceLevel}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {standard.certificationRequired ? (
                            <div>
                              {standard.certificationNumber ? (
                                <div>
                                  <Badge variant="default">Certified</Badge>
                                  {certificationExpiring && (
                                    <div className="text-xs text-red-600 mt-1">
                                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                                      Expiring Soon
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <Badge variant="destructive">Not Certified</Badge>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline">Not Required</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {standard.nextAuditDate ? (
                            <div className="text-sm">
                              {new Date(standard.nextAuditDate).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not scheduled</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewStandard(standard.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditStandard(standard.id)}
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
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No standards found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first quality standard.'
                }
              </p>
              {!searchTerm && selectedType === 'all' && selectedStatus === 'all' && (
                <div className="mt-6">
                  <Button onClick={handleCreateStandard}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Standard
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStandards.length)} of{' '}
                {filteredStandards.length} results
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

export default QualityStandards; 