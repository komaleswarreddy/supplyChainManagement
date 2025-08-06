import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuality } from '@/hooks/useQuality';
import { AlertTriangle, Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NonConformances() {
  const { loading, nonConformances, fetchNonConformances } = useQuality();

  useEffect(() => {
    fetchNonConformances();
  }, [fetchNonConformances]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading non-conformances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Non-Conformances</h1>
          <p className="text-muted-foreground">
            Track and manage quality issues and non-conformances.
          </p>
        </div>
        <Button asChild>
          <Link to="/quality/non-conformances/new">
            <Plus className="h-4 w-4 mr-2" />
            Report Issue
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
                  placeholder="Search non-conformances..."
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
        {nonConformances.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Non-Conformances</h3>
              <p className="text-muted-foreground mb-4">
                Great! No quality issues reported.
              </p>
              <Button asChild>
                <Link to="/quality/non-conformances/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Issue
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          nonConformances.map((nc) => (
            <Card key={nc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{nc.ncNumber}</CardTitle>
                  <Badge variant={
                    nc.severity === 'CRITICAL' ? 'destructive' : 
                    nc.severity === 'MAJOR' ? 'default' : 'secondary'
                  }>
                    {nc.severity}
                  </Badge>
                </div>
                <CardDescription>
                  {nc.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline">{nc.status}</Badge>
                </div>
                <div className="pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={`/quality/non-conformances/${nc.id}`}>
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

export default NonConformances; 