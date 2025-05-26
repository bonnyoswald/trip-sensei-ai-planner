
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plane, Hotel, Car, MapPin, Plus, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { CreateBookingDialog } from './CreateBookingDialog';

interface TripBookingsProps {
  trip: any;
}

export const TripBookings: React.FC<TripBookingsProps> = ({ trip }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedBookingType, setSelectedBookingType] = useState('flight');
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

  const deleteBooking = async (bookingId) => {
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

  const getBookingIcon = (type) => {
    switch (type) {
      case 'flight': return <Plane className="h-4 w-4" />;
      case 'hotel': return <Hotel className="h-4 w-4" />;
      case 'car': return <Car className="h-4 w-4" />;
      case 'activity': return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filterBookingsByType = (type) => {
    return bookings.filter(booking => booking.type === type);
  };

  const BookingCard = ({ booking }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {getBookingIcon(booking.type)}
            <h4 className="font-medium">
              {booking.booking_data?.name || `${booking.type} Booking`}
            </h4>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          {booking.booking_data?.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              {booking.booking_data.location}
            </div>
          )}
          
          {booking.booking_data?.date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {new Date(booking.booking_data.date).toLocaleDateString()}
            </div>
          )}
          
          {booking.total_price && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3" />
              ${booking.total_price.toLocaleString()}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteBooking(booking.id)}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="flex justify-center p-8">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Trip Details</span>
            <Button
              onClick={() => setShowCreateDialog(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Booking
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Destination</p>
              <p className="font-medium">{trip.destination || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-gray-500">Dates</p>
              <p className="font-medium">
                {trip.start_date && trip.end_date
                  ? `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Budget</p>
              <p className="font-medium">${trip.budget?.toLocaleString() || 'Not set'}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <Badge className={getStatusColor(trip.status)}>
                {trip.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedBookingType} onValueChange={setSelectedBookingType}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flight" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Flights ({filterBookingsByType('flight').length})
          </TabsTrigger>
          <TabsTrigger value="hotel" className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            Hotels ({filterBookingsByType('hotel').length})
          </TabsTrigger>
          <TabsTrigger value="car" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Cars ({filterBookingsByType('car').length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Activities ({filterBookingsByType('activity').length})
          </TabsTrigger>
        </TabsList>

        {['flight', 'hotel', 'car', 'activity'].map((type) => (
          <TabsContent key={type} value={type} className="mt-6">
            {filterBookingsByType(type).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  {getBookingIcon(type)}
                  <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">
                    No {type} bookings yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Add your first {type} booking to get started
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedBookingType(type);
                      setShowCreateDialog(true);
                    }}
                  >
                    Add {type} Booking
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterBookingsByType(type).map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <CreateBookingDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        trip={trip}
        bookingType={selectedBookingType}
        onBookingCreated={() => {
          fetchBookings();
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
};
