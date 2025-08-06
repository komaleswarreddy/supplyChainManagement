import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTransportation } from '@/hooks/useTransportation';
import { ArrowLeft, Edit, Ship, MapPin, Mail, Phone, Calendar, Shield, TrendingUp, Globe } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const statusColors = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  PENDING: 'warning',
  SUSPENDED: 'destructive',
} as const;

export function CarrierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { confirm, isOpen, setIsOpen, onConfirm } = useConfirmDialog();
  const { useCarrier, useUpdateCarrier } = useTransportation();
  const { data: carrier, isLoading } = useCarrier(id!);
  const { mutate: updateCarrier, isLoading: isUpdating } = useUpdateCarrier();

  const handleStatusChange = (newStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED') => {
    confirm(() => {
      updateCarrier({
        id: id!,
        data: { status: newStatus }
      });
    });
  };

  if (isLoading || !carrier) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/transportation/carriers')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Ship className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{carrier.name}</h1>
                <p className="text-sm text-muted-foreground">
                  Code: {carrier.code}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusColors[carrier.status]} className="h-6 px-3 text-sm">
              {carrier.status}
            </Badge>
            <Button variant="outline" onClick={() => navigate(`/transportation/carriers/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="services">Services & Rates</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="contract">Contract</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-card">
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Carrier Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                        <p className="mt-1 font-medium">{carrier.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Code</h3>
                        <p className="mt-1">{carrier.code}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                        <p className="mt-1">
                          <Badge variant="secondary">{carrier.type}</Badge>
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <p className="mt-1">
                          <Badge variant={statusColors[carrier.status]}>
                            {carrier.status}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">SCAC Code</h3>
                        <p className="mt-1">{carrier.scacCode || '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">DOT Number</h3>
                        <p className="mt-1">{carrier.dotNumber || '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">MC Number</h3>
                        <p className="mt-1">{carrier.mcNumber || '-'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Tax ID</h3>
                        <p className="mt-1">{carrier.taxId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg border bg-card">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p>{carrier.address.street}</p>
                          <p>{carrier.address.city}, {carrier.address.state} {carrier.address.postalCode}</p>
                          <p>{carrier.address.country}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <p>{carrier.contactInfo.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <p>{carrier.contactInfo.phone}</p>
                      </div>
                      {carrier.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-muted-foreground" />
                          <a 
                            href={carrier.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {carrier.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Insurance Information</h2>
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Provider</h3>
                        <p className="mt-1">{carrier.insuranceInfo.provider}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Policy Number</h3>
                        <p className="mt-1">{carrier.insuranceInfo.policyNumber}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Coverage Amount</h3>
                        <p className="mt-1">${carrier.insuranceInfo.coverageAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Expiry Date</h3>
                        <p className="mt-1">{format(new Date(carrier.insuranceInfo.expiryDate), 'PP')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Service Areas</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Countries</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {carrier.serviceAreas.countries.map((country) => (
                        <Badge key={country} variant="outline">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {carrier.serviceAreas.regions && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Regions</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {carrier.serviceAreas.regions.map((region) => (
                          <Badge key={region} variant="outline">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Status Management</h2>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={carrier.status === 'ACTIVE' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('ACTIVE')}
                    disabled={carrier.status === 'ACTIVE' || isUpdating}
                  >
                    Set Active
                  </Button>
                  <Button 
                    variant={carrier.status === 'INACTIVE' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('INACTIVE')}
                    disabled={carrier.status === 'INACTIVE' || isUpdating}
                  >
                    Set Inactive
                  </Button>
                  <Button 
                    variant={carrier.status === 'PENDING' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('PENDING')}
                    disabled={carrier.status === 'PENDING' || isUpdating}
                  >
                    Set Pending
                  </Button>
                  <Button 
                    variant={carrier.status === 'SUSPENDED' ? 'default' : 'outline'} 
                    onClick={() => handleStatusChange('SUSPENDED')}
                    disabled={carrier.status === 'SUSPENDED' || isUpdating}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Suspend
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Service Types</h2>
                <div className="flex flex-wrap gap-2">
                  {carrier.serviceTypes.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Transit Times</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Origin</th>
                        <th className="text-left py-2 px-4">Destination</th>
                        <th className="text-left py-2 px-4">Service Level</th>
                        <th className="text-right py-2 px-4">Transit Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrier.transitTimes.map((transit, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{transit.origin}</td>
                          <td className="py-2 px-4">{transit.destination}</td>
                          <td className="py-2 px-4">
                            <Badge variant="outline">{transit.serviceLevel}</Badge>
                          </td>
                          <td className="py-2 px-4 text-right">{transit.transitDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Rates</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Origin</th>
                        <th className="text-left py-2 px-4">Destination</th>
                        <th className="text-left py-2 px-4">Service Level</th>
                        <th className="text-right py-2 px-4">Base Rate</th>
                        <th className="text-right py-2 px-4">Fuel Surcharge</th>
                        <th className="text-right py-2 px-4">Total</th>
                        <th className="text-left py-2 px-4">Effective Date</th>
                        <th className="text-left py-2 px-4">Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrier.rates.map((rate, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{rate.origin}</td>
                          <td className="py-2 px-4">{rate.destination}</td>
                          <td className="py-2 px-4">
                            <Badge variant="outline">{rate.serviceLevel}</Badge>
                          </td>
                          <td className="py-2 px-4 text-right">{rate.currency} {rate.baseRate.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right">{rate.currency} {rate.fuelSurcharge.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right font-medium">{rate.currency} {(rate.baseRate + rate.fuelSurcharge).toLocaleString()}</td>
                          <td className="py-2 px-4">{format(new Date(rate.effectiveDate), 'PP')}</td>
                          <td className="py-2 px-4">{format(new Date(rate.expiryDate), 'PP')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Performance Metrics</h2>
                  <p className="text-sm text-muted-foreground">
                    Last Updated: {format(new Date(carrier.performanceMetrics.lastUpdated), 'PP')}
                  </p>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">On-Time Delivery</h3>
                      <span className="text-sm font-medium">{carrier.performanceMetrics.onTimeDelivery}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          carrier.performanceMetrics.onTimeDelivery >= 95 ? 'bg-green-500' :
                          carrier.performanceMetrics.onTimeDelivery >= 90 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${carrier.performanceMetrics.onTimeDelivery}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Damage Rate</h3>
                      <span className="text-sm font-medium">{carrier.performanceMetrics.damageRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          carrier.performanceMetrics.damageRate <= 0.5 ? 'bg-green-500' :
                          carrier.performanceMetrics.damageRate <= 1 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, carrier.performanceMetrics.damageRate * 20)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Claim Resolution Time</h3>
                      <span className="text-sm font-medium">{carrier.performanceMetrics.claimResolutionTime} days</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          carrier.performanceMetrics.claimResolutionTime <= 5 ? 'bg-green-500' :
                          carrier.performanceMetrics.claimResolutionTime <= 10 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, 100 - (carrier.performanceMetrics.claimResolutionTime * 5))}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Average Transit Time</h3>
                      <span className="text-sm font-medium">{carrier.performanceMetrics.averageTransitTime} days</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          carrier.performanceMetrics.averageTransitTime <= 3 ? 'bg-green-500' :
                          carrier.performanceMetrics.averageTransitTime <= 5 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, 100 - (carrier.performanceMetrics.averageTransitTime * 10))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Overall Performance</h3>
                  <div className="w-full bg-muted rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${
                        carrier.performanceMetrics.onTimeDelivery >= 95 ? 'bg-green-500' :
                        carrier.performanceMetrics.onTimeDelivery >= 90 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${carrier.performanceMetrics.onTimeDelivery}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span>Poor</span>
                    <span>Average</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Performance Trend</h2>
                <div className="aspect-[2/1] bg-muted rounded-lg flex flex-col items-center justify-center p-6">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Performance trend chart would be displayed here</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contract" className="space-y-4">
            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Contract Information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Contract Number</h3>
                    <p className="mt-1">{carrier.contractInfo.contractNumber}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Payment Terms</h3>
                    <p className="mt-1">{carrier.contractInfo.paymentTerms}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                    <p className="mt-1">{format(new Date(carrier.contractInfo.startDate), 'PP')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                    <p className="mt-1">{format(new Date(carrier.contractInfo.endDate), 'PP')}</p>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">
                      {new Date(carrier.contractInfo.endDate) > new Date() ? (
                        <>
                          Contract expires in {
                            Math.ceil((new Date(carrier.contractInfo.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          } days
                        </>
                      ) : (
                        <>
                          Contract expired {
                            Math.ceil((new Date().getTime() - new Date(carrier.contractInfo.endDate).getTime()) / (1000 * 60 * 60 * 24))
                          } days ago
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Contract Documents</h2>
                <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
                  <div className="text-center">
                    <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No contract documents available</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Upload Document
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirm Status Change"
        description="Are you sure you want to change the carrier status? This may affect shipments and operations."
        confirmText="Change Status"
        onConfirm={onConfirm}
      />
    </div>
  );
}