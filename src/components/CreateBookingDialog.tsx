
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { LocationSearch } from './LocationSearch';

interface CreateBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  onBookingCreated: () => void;
}

export const CreateBookingDialog: React.FC<CreateBookingDialogProps> = ({
  open,
  onOpenChange,
  tripId,
  onBookingCreated,
}) => {
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    location: '',
    price: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    notes: '',
    confirmationCode: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const bookingTypes = [
    { value: 'flight', label: 'Flight' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'car', label: 'Car Rental' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'activity', label: 'Activity' },
    { value: 'other', label: 'Other' },
  ];

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({ ...prev, location: location.address }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        name: formData.name,
        location: formData.location || null,
        dates: formData.startDate && formData.endDate 
          ? `${format(formData.startDate, 'MMM d')} - ${format(formData.endDate, 'MMM d, yyyy')}`
          : formData.startDate 
            ? format(formData.startDate, 'MMM d, yyyy')
            : null,
        notes: formData.notes || null,
        confirmationCode: formData.confirmationCode || null,
        startDate: formData.startDate?.toISOString() || null,
        endDate: formData.endDate?.toISOString() || null,
      };

      const { error } = await supabase
        .from('bookings')
        .insert({
          trip_id: tripId,
          type: formData.type,
          booking_data: bookingData,
          total_price: formData.price ? parseFloat(formData.price) : null,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Booking created successfully!',
      });

      // Reset form
      setFormData({
        type: '',
        name: '',
        location: '',
        price: '',
        startDate: undefined,
        endDate: undefined,
        notes: '',
        confirmationCode: '',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Booking</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Booking Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select booking type" />
                </SelectTrigger>
                <SelectContent>
                  {bookingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name/Title *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Grand Hotel, Delta Flight"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <LocationSearch
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
              onLocationSelect={handleLocationSelect}
              placeholder="Search for location..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="e.g., 299.99"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmationCode">Confirmation Code</Label>
              <Input
                id="confirmationCode"
                value={formData.confirmationCode}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmationCode: e.target.value }))}
                placeholder="e.g., ABC123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or details..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.type || !formData.name} className="flex-1">
              {loading ? 'Creating...' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
