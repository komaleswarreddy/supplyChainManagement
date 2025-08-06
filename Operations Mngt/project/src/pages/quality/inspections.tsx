import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuality } from '@/hooks/useQuality';
import { Eye, Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Inspections() {
  const { loading, inspections, fetchInspections } = useQuality();

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading inspections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inspections</h1>
          <p className="text-muted-foreground">
            Manage quality inspections and track results.
          </p>
        </div>
        <Button asChild>
          <Link to="/quality/inspections/new">
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search inspections..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {inspections.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Inspections</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first inspection.
              </p>
              <Button asChild>
                <Link to="/quality/inspections/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Inspection
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          inspections.map((inspection) => (
            <Card key={inspection.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{inspection.inspectionNumber}</CardTitle>
                  <Badge variant={
                    inspection.result === 'PASS' ? 'default' : 
                    inspection.result === 'FAIL' ? 'destructive' : 'secondary'
                  }>
                    {inspection.result || inspection.status}
                  </Badge>
                </div>
                <CardDescription>
                  Type: {inspection.inspectionType} • Inspector: {inspection.inspector.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(inspection.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={`/quality/inspections/${inspection.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default Inspections; 