
import React, { useState } from 'react';

// Define TypeScript interfaces for the itinerary structure
export interface Activity {
  time: string; // HH:mm format
  activity: string;
  location: string;
  description: string;
  estimated_cost: number;
  duration: string;
}

export interface DayPlan {
  day: number;
  date: string; // ISO date format
  activities: Activity[];
}

export interface Itinerary {
  title: string;
  overview: string;
  days: DayPlan[];
  estimated_total_cost: number;
  tips: string[];
}
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Calendar, DollarSign, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ItineraryGenerator = () => {
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    budget: '',
    preferences: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<Itinerary | null>(null);
  const { toast } = useToast();

  const generateItinerary = async () => {
    if (!formData.destination || !formData.duration || !formData.budget) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in destination, duration, and budget.',
        variant: 'destructive',
      });
      return;
    }

    const duration = parseInt(formData.duration);
    if (isNaN(duration) || duration <= 0) {
      toast({
        title: 'Invalid Duration',
        description: 'Duration must be a positive number of days.',
        variant: 'destructive',
      });
      return;
    }

    const budget = parseFloat(formData.budget);
    if (isNaN(budget) || budget <= 0) {
      toast({
        title: 'Invalid Budget',
        description: 'Budget must be a positive amount.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-itinerary', {
        body: {
          destination: formData.destination,
          duration: duration, // Use validated and parsed duration
          budget: budget, // Use validated and parsed budget
          preferences: formData.preferences,
        },
      });

      if (error) throw error;

      setGeneratedItinerary(data.itinerary);
      toast({
        title: 'Itinerary Generated!',
        description: 'Your personalized travel itinerary is ready.',
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate itinerary. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Itinerary Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="destination" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Destination
              </Label>
              <Input
                id="destination"
                placeholder="e.g., Tokyo, Japan"
                value={formData.destination}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, destination: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="duration" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Duration (days)
              </Label>
              <Input
                id="duration"
                type="number"
                placeholder="7"
                value={formData.duration}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, duration: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="budget" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budget (USD)
            </Label>
            <Input
              id="budget"
              type="number"
              placeholder="2000"
              value={formData.budget}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, budget: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="preferences">Preferences & Interests</Label>
            <Textarea
              id="preferences"
              placeholder="e.g., cultural sites, food tours, nightlife, museums, outdoor activities..."
              value={formData.preferences}
              onChange={(e) =>
                setFormData(prev => ({ ...prev, preferences: e.target.value }))
              }
            />
          </div>

          <Button
            onClick={generateItinerary}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Itinerary'}
          </Button>
        </CardContent>
      </Card>

      {generatedItinerary && (
        <Card>
          <CardHeader>
            <CardTitle>{generatedItinerary.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{generatedItinerary.overview}</p>
            
            <div className="space-y-4">
              {generatedItinerary.days?.map((day: DayPlan, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Day {day.day} {day.date && <span className="text-sm text-muted-foreground font-normal">({new Date(day.date).toLocaleDateString()})</span>}</h3>
                  <div className="space-y-2">
                    {day.activities?.map((activity: Activity, actIndex: number) => (
                      <div key={actIndex} className="flex gap-3 p-2 bg-muted/50 rounded">
                        <div className="text-sm font-medium w-16">{activity.time}</div>
                        <div className="flex-1">
                          <div className="font-medium">{activity.activity}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.location} {activity.duration && `• ${activity.duration}`} {activity.estimated_cost > 0 && `• $${activity.estimated_cost}`}
                          </div>
                          <div className="text-sm">{activity.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {generatedItinerary.tips && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Travel Tips</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {generatedItinerary.tips.map((tip: string, index: number) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
