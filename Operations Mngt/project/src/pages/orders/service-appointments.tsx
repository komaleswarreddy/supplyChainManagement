import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  FileText,
  Camera,
  DollarSign
} from 'lucide-react';
import { 
  useServiceAppointmentsByOrder, 
  useCreateServiceAppointmentFromOrder,
  useStartServiceAppointment,
  useCompleteServiceAppointment,
  useCancelServiceAppointment,
  useServiceTypes,
  useAvailableSlots
} from '@/hooks/useServiceAppointments';
import { useOrder } from '@/hooks/useOrder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

export default function OrderServiceAppointmentsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const { order, loadingOrder: orderLoading } = useOrder(orderId!);
  const { data: appointmentsData, isLoading: appointmentsLoading } = useServiceAppointmentsByOrder(orderId!);
  const { data: serviceTypes } = useServiceTypes({ is_active: true });
  const { data: availableSlots } = useAvailableSlots({
    service_type_id: selectedServiceType,
    date: selectedDate,
  });

  const { mutate: createAppointment, isPending: isCreating } = useCreateServiceAppointmentFromOrder();
  const { mutate: startAppointment } = useStartServiceAppointment();
  const { mutate: completeAppointment } = useCompleteServiceAppointment();
  const { mutate: cancelAppointment } = useCancelServiceAppointment();

  const appointments = appointmentsData?.appointments || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'in_progress':
        return 'default';
      case 'confirmed':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const handleScheduleAppointment = (formData: FormData) => {
    if (!orderId || !selectedSlot) return;

    const appointmentData = {
      service_type_id: selectedServiceType,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      scheduled_start: selectedSlot.start_time,
      scheduled_end: selectedSlot.end_time,
      service_address: {
        street: formData.get('street') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        postal_code: formData.get('postal_code') as string,
        country: formData.get('country') as string,
      },
      contact_person: formData.get('contact_person') as string,
      contact_phone: formData.get('contact_phone') as string,
      contact_email: formData.get('contact_email') as string,
      special_instructions: formData.get('special_instructions') as string,
      priority: formData.get('priority') as 'low' | 'normal' | 'high' | 'urgent',
      preferred_provider_id: selectedSlot.provider_id,
    };

    createAppointment({ orderId, data: appointmentData }, {
      onSuccess: () => {
        setShowScheduleDialog(false);
        setSelectedServiceType('');
        setSelectedDate('');
        setSelectedSlot(null);
      }
    });
  };

  if (orderLoading || appointmentsLoading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Appointments</h1>
          <p className="text-muted-foreground">
            Order #{order.order_number} - {order.customer_name}
          </p>
        </div>
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule Service Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleScheduleAppointment(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_type">Service Type</Label>
                  <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.duration_minutes} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {availableSlots?.available_slots?.length > 0 && (
                <div>
                  <Label>Available Time Slots</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableSlots.available_slots.map((slot, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant={selectedSlot === slot ? 'default' : 'outline'}
                        onClick={() => setSelectedSlot(slot)}
                        className="justify-start"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        {format(new Date(slot.start_time), 'HH:mm')} - {format(new Date(slot.end_time), 'HH:mm')}
                        <br />
                        <small className="text-muted-foreground">{slot.provider_name}</small>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input name="title" placeholder="Service appointment title" required />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" placeholder="Service description" />
              </div>

              <div>
                <Label>Service Address</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input name="street" placeholder="Street address" required />
                  <Input name="city" placeholder="City" required />
                  <Input name="state" placeholder="State/Province" required />
                  <Input name="postal_code" placeholder="Postal code" required />
                </div>
                <Input name="country" placeholder="Country" className="mt-2" defaultValue="United States" />
              </div>

              <div>
                <Label>Contact Information</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Input name="contact_person" placeholder="Contact person" />
                  <Input name="contact_phone" placeholder="Phone number" />
                  <Input name="contact_email" type="email" placeholder="Email address" />
                </div>
              </div>

              <div>
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea name="special_instructions" placeholder="Any special requirements or instructions" />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedSlot || isCreating}>
                  {isCreating ? 'Scheduling...' : 'Schedule Appointment'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Order Information */}
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Order Number</Label>
              <div className="font-medium">{order.order_number}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Customer</Label>
              <div className="font-medium">{order.customer_name}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <Badge variant="outline">{order.status}</Badge>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Order Date</Label>
              <div className="font-medium">
                {format(new Date(order.created_at), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Appointments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Service Appointments</h2>
        
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Service Appointments</h3>
              <p className="text-muted-foreground mb-4">
                Schedule service appointments for this order to provide installation, delivery, or support services.
              </p>
              <Button onClick={() => setShowScheduleDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(appointment.status)}
                      <div>
                        <h3 className="font-medium">{appointment.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {appointment.appointment_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      {appointment.priority !== 'normal' && (
                        <Badge variant="outline">{appointment.priority}</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div className="font-medium">
                          {format(new Date(appointment.scheduled_start), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-muted-foreground">
                          {format(new Date(appointment.scheduled_start), 'HH:mm')} - 
                          {format(new Date(appointment.scheduled_end), 'HH:mm')}
                        </div>
                      </div>
                    </div>

                    {appointment.service_address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <div className="font-medium">Service Location</div>
                          <div className="text-muted-foreground">
                            {appointment.service_address.city}, {appointment.service_address.state}
                          </div>
                        </div>
                      </div>
                    )}

                    {appointment.contact_person && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <div className="font-medium">{appointment.contact_person}</div>
                          <div className="text-muted-foreground">
                            {appointment.contact_phone || appointment.contact_email}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {appointment.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {appointment.description}
                    </p>
                  )}

                  {appointment.special_instructions && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="text-sm font-medium text-yellow-800">Special Instructions</div>
                          <div className="text-sm text-yellow-700">{appointment.special_instructions}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {appointment.status === 'completed' && (
                    <div className="border-t pt-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {appointment.customer_rating && (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <div className="text-sm">
                              <div className="font-medium">Customer Rating</div>
                              <div className="text-muted-foreground">
                                {appointment.customer_rating}/5 stars
                              </div>
                            </div>
                          </div>
                        )}

                        {appointment.total_cost && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <div className="text-sm">
                              <div className="font-medium">Service Cost</div>
                              <div className="text-muted-foreground">
                                ${appointment.total_cost.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}

                        {appointment.actual_duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <div className="text-sm">
                              <div className="font-medium">Duration</div>
                              <div className="text-muted-foreground">
                                {appointment.actual_duration} minutes
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {appointment.completion_notes && (
                        <div className="mt-4">
                          <div className="text-sm font-medium mb-1">Completion Notes</div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.completion_notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    {appointment.status === 'scheduled' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startAppointment(appointment.id)}
                        >
                          Start Service
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelAppointment({ 
                            id: appointment.id, 
                            reason: 'Cancelled by user' 
                          })}
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {appointment.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => completeAppointment({ 
                          id: appointment.id, 
                          data: { completion_notes: 'Service completed successfully' }
                        })}
                      >
                        Complete Service
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/service-appointments/${appointment.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 