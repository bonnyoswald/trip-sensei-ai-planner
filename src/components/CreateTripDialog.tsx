
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { LocationSearch } from './LocationSearch';
import { GoogleMap } from './GoogleMap';

interface CreateTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTripCreated: () => void;
}

export const CreateTripDialog: React.FC<CreateTripDialogProps> = ({
  open,
  onOpenChange,
  onTripCreated,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    budget: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setFormData(prev => ({ ...prev, destination: location.address }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('trips')
        .insert({
          title: formData.title,
          description: formData.description || null,
          destination: formData.destination || null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          start_date: formData.startDate?.toISOString().split('T')[0] || null,
          end_date: formData.endDate?.toISOString().split('T')[0] || null,
          status: 'planning',
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Trip created successfully!',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        destination: '',
        budget: '',
        startDate: undefined,
        endDate: undefined,
      });
      setSelectedLocation(null);
      
      onTripCreated();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create trip',
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
          <DialogTitle>Create New Trip</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Trip Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Summer Vacation to Europe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <LocationSearch
              value={formData.destination}
              onChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
              onLocationSelect={handleLocationSelect}
              placeholder="Search for a destination..."
            />
          </div>

          {selectedLocation && (
            <div className="space-y-2">
              <Label>Location Preview</Label>
              <GoogleMap
                destinations={[selectedLocation.address]}
                center={selectedLocation}
                zoom={10}
                height="200px"
              />
            </div>
          )}

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

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (USD)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              placeholder="e.g., 2500"
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell us about your trip plans..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title} className="flex-1">
              {loading ? 'Creating...' : 'Create Trip'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
