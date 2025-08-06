import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuality } from '@/hooks/useQuality';
import { 
  Shield, Eye, AlertTriangle, ClipboardCheck, CheckCircle, 
  UserCheck, TrendingUp, BarChart3, Calendar, Clock 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function QualityDashboard() {
  const { 
    loading, 
    qualityMetrics, 
    inspections, 
    nonConformances, 
    fetchQualityMetrics, 
    fetchInspections, 
    fetchNonConformances 
  } = useQuality();

  const [stats, setStats] = useState({
    totalInspections: 0,
    pendingInspections: 0,
    passedInspections: 0,
    failedInspections: 0,
    openNonConformances: 0,
    criticalNonConformances: 0,
    defectRate: 0,
    firstPassYield: 0,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      await Promise.all([
        fetchQualityMetrics(),
        fetchInspections(),
        fetchNonConformances(),
      ]);
    };

    loadDashboardData();
  }, [fetchQualityMetrics, fetchInspections, fetchNonConformances]);

  useEffect(() => {
    // Calculate stats from loaded data
    const pendingInspections = inspections.filter(i => i.status === 'PENDING').length;
    const passedInspections = inspections.filter(i => i.result === 'PASS').length;
    const failedInspections = inspections.filter(i => i.result === 'FAIL').length;
    const openNonConformances = nonConformances.filter(nc => nc.status === 'OPEN').length;
    const criticalNonConformances = nonConformances.filter(nc => nc.severity === 'CRITICAL').length;

    const defectRateMetric = qualityMetrics.find(m => m.metricType === 'DEFECT_RATE');
    const firstPassYieldMetric = qualityMetrics.find(m => m.metricType === 'FIRST_PASS_YIELD');

    setStats({
      totalInspections: inspections.length,
      pendingInspections,
      passedInspections,
      failedInspections,
      openNonConformances,
      criticalNonConformances,
      defectRate: defectRateMetric?.actual || 0,
      firstPassYield: firstPassYieldMetric?.actual || 0,
    });
  }, [inspections, nonConformances, qualityMetrics]);

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    color = "default",
    link 
  }: {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ElementType;
    color?: "default" | "success" | "warning" | "danger";
    link?: string;
  }) => {
    const colorClasses = {
      default: "text-blue-600",
      success: "text-green-600",
      warning: "text-yellow-600",
      danger: "text-red-600",
    };

    const CardComponent = link ? Link : 'div';
    const cardProps = link ? { to: link } : {};

    return (
      <CardComponent {...cardProps} className={link ? "block hover:shadow-md transition-shadow" : "block"}>
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </CardContent>
        </Card>
      </CardComponent>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading quality dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quality Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage quality control processes, inspections, and compliance.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link to="/quality/inspections">
              <Eye className="h-4 w-4 mr-2" />
              New Inspection
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/quality/control-plans">
              <Shield className="h-4 w-4 mr-2" />
              Control Plans
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inspections"
          value={stats.totalInspections}
          description="All time inspections"
          icon={Eye}
          link="/quality/inspections"
        />
        <StatCard
          title="Pending Inspections"
          value={stats.pendingInspections}
          description="Awaiting completion"
          icon={Clock}
          color="warning"
          link="/quality/inspections"
        />
        <StatCard
          title="Pass Rate"
          value={`${stats.totalInspections > 0 ? Math.round((stats.passedInspections / stats.totalInspections) * 100) : 0}%`}
          description="Inspection success rate"
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          title="Open Non-Conformances"
          value={stats.openNonConformances}
          description="Requiring attention"
          icon={AlertTriangle}
          color="danger"
          link="/quality/non-conformances"
        />
      </div>

      {/* Quality Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quality Metrics
            </CardTitle>
            <CardDescription>
              Key performance indicators for quality management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Defect Rate</span>
              <Badge variant={stats.defectRate > 5 ? "destructive" : "default"}>
                {stats.defectRate.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">First Pass Yield</span>
              <Badge variant={stats.firstPassYield > 95 ? "default" : "secondary"}>
                {stats.firstPassYield.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Critical Issues</span>
              <Badge variant={stats.criticalNonConformances > 0 ? "destructive" : "default"}>
                {stats.criticalNonConformances}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest quality management activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Recent Inspections</span>
              <span className="text-muted-foreground">
                {inspections.slice(0, 3).length} completed today
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Non-Conformances</span>
              <span className="text-muted-foreground">
                {nonConformances.filter(nc => nc.status === 'OPEN').length} open
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Corrective Actions</span>
              <span className="text-muted-foreground">
                {nonConformances.filter(nc => nc.status === 'IN_PROGRESS').length} in progress
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common quality management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" asChild className="h-auto p-4 flex-col">
              <Link to="/quality/inspections">
                <Eye className="h-6 w-6 mb-2" />
                <span>Schedule Inspection</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4 flex-col">
              <Link to="/quality/non-conformances">
                <AlertTriangle className="h-6 w-6 mb-2" />
                <span>Report Issue</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4 flex-col">
              <Link to="/quality/corrective-actions">
                <ClipboardCheck className="h-6 w-6 mb-2" />
                <span>Create Action</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4 flex-col">
              <Link to="/quality/audits">
                <UserCheck className="h-6 w-6 mb-2" />
                <span>Plan Audit</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QualityDashboard; 