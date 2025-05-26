
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plane, Hotel, Car, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: any;
  bookingType: string;
  onBookingCreated: () => void;
}

export const CreateBookingDialog: React.FC<CreateBookingDialogProps> = ({
  open,
  onOpenChange,
  trip,
  bookingType,
  onBookingCreated,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: null,
    price: '',
    confirmationNumber: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getBookingIcon = () => {
    switch (bookingType) {
      case 'flight': return <Plane className="h-5 w-5" />;
      case 'hotel': return <Hotel className="h-5 w-5" />;
      case 'car': return <Car className="h-5 w-5" />;
      case 'activity': return <MapPin className="h-5 w-5" />;
      default: return <CalendarIcon className="h-5 w-5" />;
    }
  };

  const getPlaceholders = () => {
    switch (bookingType) {
      case 'flight':
        return {
          name: 'e.g., United Airlines Flight 123',
          location: 'e.g., JFK to LAX',
        };
      case 'hotel':
        return {
          name: 'e.g., Hilton Downtown',
          location: 'e.g., 123 Main St, New York',
        };
      case 'car':
        return {
          name: 'e.g., Toyota Camry Rental',
          location: 'e.g., Hertz - Airport Location',
        };
      case 'activity':
        return {
          name: 'e.g., City Walking Tour',
          location: 'e.g., Central Park, New York',
        };
      default:
        return {
          name: 'Booking name',
          location: 'Location',
        };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        name: formData.name,
        location: formData.location,
        date: formData.date,
        confirmationNumber: formData.confirmationNumber,
        notes: formData.notes,
      };

      const { error } = await supabase
        .from('bookings')
        .insert({
          trip_id: trip.id,
          type: bookingType,
          status: 'confirmed',
          total_price: formData.price ? parseFloat(formData.price) : null,
          booking_data: bookingData,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${bookingType} booking created successfully!`,
      });

      setFormData({
        name: '',
        location: '',
        date: null,
        price: '',
        confirmationNumber: '',
        notes: '',
      });

      onBookingCreated();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create booking',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const placeholders = getPlaceholders();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getBookingIcon()}
            Add {bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} Booking
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={placeholders.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={placeholders.location}
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({ ...formData, date })}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g., 299.99"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmationNumber">Confirmation Number</Label>
            <Input
              id="confirmationNumber"
              value={formData.confirmationNumber}
              onChange={(e) => setFormData({ ...formData, confirmationNumber: e.target.value })}
              placeholder="e.g., ABC123XYZ"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name}>
              {loading ? 'Creating...' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
