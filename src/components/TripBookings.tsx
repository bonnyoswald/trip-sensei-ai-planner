
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, DollarSign, Plus, Edit, Trash2, Hotel, Plane, Car, UtensilsCrossed } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { CreateBookingDialog } from './CreateBookingDialog';
import { GoogleMap } from './GoogleMap';
import { format } from 'date-fns';

interface TripBookingsProps {
  trip: any;
}

export const TripBookings: React.FC<TripBookingsProps> = ({ trip }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, [trip.id]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('trip_id', trip.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch bookings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Booking deleted successfully',
      });
      
      fetchBookings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete booking',
        variant: 'destructive',
      });
    }
  };

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'flight': return Plane;
      case 'hotel': return Hotel;
      case 'car': return Car;
      case 'restaurant': return UtensilsCrossed;
      default: return MapPin;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const bookingsByType = bookings.reduce((acc: any, booking: any) => {
    const type = booking.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(booking);
    return acc;
  }, {});

  // Get all booking locations for the map
  const bookingLocations = bookings
    .map((booking: any) => booking.booking_data?.location || booking.booking_data?.destination)
    .filter(Boolean);

  // Add trip destination to map if available
  const mapDestinations = trip.destination 
    ? [trip.destination, ...bookingLocations]
    : bookingLocations;

  if (loading) {
    return <div className="flex justify-center p-8">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Trip Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Trip Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trip.destination && (
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>{trip.destination}</span>
              </div>
            )}
            
            {trip.start_date && trip.end_date && (
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>
                  {format(new Date(trip.start_date), 'MMM d')} - {format(new Date(trip.end_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            
            {trip.budget && (
              <div className="flex items-center text-sm">
                <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                <span>Budget: ${trip.budget.toLocaleString()}</span>
              </div>
            )}
          </div>

          {mapDestinations.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Trip Map</h4>
              <GoogleMap
                destinations={mapDestinations}
                height="300px"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Trip Bookings</CardTitle>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Booking
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Hotel className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-4">Start adding flights, hotels, and activities for your trip</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                Add Your First Booking
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
                {Object.entries(bookingsByType).map(([type, typeBookings]) => {
                  const Icon = getBookingIcon(type);
                  return (
                    <TabsTrigger key={type} value={type} className="capitalize">
                      <Icon className="h-4 w-4 mr-1" />
                      {type} ({(typeBookings as any[]).length})
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-4">
                {bookings.map((booking: any) => {
                  const Icon = getBookingIcon(booking.type);
                  return (
                    <Card key={booking.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <Icon className="h-5 w-5 mt-1 text-blue-600" />
                            <div className="space-y-1">
                              <h4 className="font-medium">
                                {booking.booking_data?.name || `${booking.type} Booking`}
                              </h4>
                              {booking.booking_data?.location && (
                                <p className="text-sm text-gray-600 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {booking.booking_data.location}
                                </p>
                              )}
                              {booking.booking_data?.dates && (
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {booking.booking_data.dates}
                                </p>
                              )}
                              {booking.total_price && (
                                <p className="text-sm font-medium text-green-600">
                                  ${booking.total_price}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteBooking(booking.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              {Object.entries(bookingsByType).map(([type, typeBookings]) => (
                <TabsContent key={type} value={type} className="space-y-4 mt-4">
                  {(typeBookings as any[]).map((booking: any) => {
                    const Icon = getBookingIcon(booking.type);
                    return (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              <Icon className="h-5 w-5 mt-1 text-blue-600" />
                              <div className="space-y-1">
                                <h4 className="font-medium">
                                  {booking.booking_data?.name || `${booking.type} Booking`}
                                </h4>
                                {booking.booking_data?.location && (
                                  <p className="text-sm text-gray-600 flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {booking.booking_data.location}
                                  </p>
                                )}
                                {booking.booking_data?.dates && (
                                  <p className="text-sm text-gray-600 flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {booking.booking_data.dates}
                                  </p>
                                )}
                                {booking.total_price && (
                                  <p className="text-sm font-medium text-green-600">
                                    ${booking.total_price}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteBooking(booking.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      <CreateBookingDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        tripId={trip.id}
        onBookingCreated={() => {
          fetchBookings();
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
};
