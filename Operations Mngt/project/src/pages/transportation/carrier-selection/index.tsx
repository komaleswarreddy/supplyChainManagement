import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTransportation } from '@/hooks/useTransportation';
import { Ship, TrendingUp, Clock, Check, AlertTriangle, Truck, DollarSign } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ServiceLevel } from '@/types/transportation';

export function CarrierSelection() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    origin: 'Los Angeles, CA',
    destination: 'New York, NY',
    serviceLevel: 'STANDARD' as ServiceLevel,
    weight: 1000,
    pickupDate: new Date(),
    submitted: false
  });

  const { useEligibleCarriers } = useTransportation();
  const { data: carrierData, isLoading, isError } = useEligibleCarriers(
    formData.origin,
    formData.destination,
    formData.serviceLevel,
    formData.weight,
    formData.pickupDate.toISOString()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData(prev => ({ ...prev, submitted: true }));
  };

  const handleSelectCarrier = (carrierId: string) => {
    // In a real app, this would create a shipment with the selected carrier
    navigate('/transportation/shipments/new', { 
      state: { 
        carrierId,
        origin: formData.origin,
        destination: formData.destination,
        serviceLevel: formData.serviceLevel,
        weight: formData.weight,
        pickupDate: formData.pickupDate
      } 
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Ship className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Carrier Selection</h1>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Shipment Requirements</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                placeholder="City, State"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                placeholder="City, State"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceLevel">Service Level</Label>
              <Select
                id="serviceLevel"
                value={formData.serviceLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceLevel: e.target.value as ServiceLevel }))}
                required
              >
                <option value="STANDARD">Standard</option>
                <option value="EXPRESS">Express</option>
                <option value="PRIORITY">Priority</option>
                <option value="ECONOMY">Economy</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Total Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Pickup Date</Label>
              <DatePicker
                selected={formData.pickupDate}
                onChange={(date) => setFormData(prev => ({ ...prev, pickupDate: date || new Date() }))}
                minDate={new Date()}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto">Find Carriers</Button>
        </form>
      </div>

      {formData.submitted && (
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Available Carriers</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : isError ? (
              <div className="text-center py-12 text-destructive">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                <p>Error loading carrier data. Please try again.</p>
              </div>
            ) : carrierData?.carriers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No carriers available for the selected criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {carrierData?.carriers.map((carrierInfo, index) => (
                  <div key={index} className="rounded-lg border p-4 hover:border-primary transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{carrierInfo.carrier.name}</h3>
                          <Badge variant="outline">{carrierInfo.carrier.type}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>
                              <span className="text-muted-foreground">Rate:</span>{' '}
                              <span className="font-medium">USD {carrierInfo.rate.toLocaleString()}</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              <span className="text-muted-foreground">Transit:</span>{' '}
                              <span className="font-medium">{carrierInfo.transitDays} days</span>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span>
                              <span className="text-muted-foreground">Capacity:</span>{' '}
                              <span className={`font-medium ${carrierInfo.availableCapacity ? 'text-green-600' : 'text-red-600'}`}>
                                {carrierInfo.availableCapacity ? 'Available' : 'Limited'}
                              </span>
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span>
                              <span className="text-muted-foreground">Performance:</span>{' '}
                              <span className="font-medium">{carrierInfo.performanceScore}%</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleSelectCarrier(carrierInfo.carrier.id)}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Select Carrier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CarrierSelection;