
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Search for a location..."
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.PlaceResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        const loader = new Loader({
          apiKey: 'AIzaSyBsNn2f4JZOAjT_DGiVCIrth7APkYmupbI',
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();

        if (!inputRef.current) return;

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['(cities)'],
          fields: ['formatted_address', 'geometry', 'name']
        });

        autocompleteRef.current = autocomplete;

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address && place.geometry?.location) {
            onChange(place.formatted_address);
            if (onLocationSelect) {
              onLocationSelect({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address
              });
            }
            setShowSuggestions(false);
          }
        });
      } catch (err) {
        console.error('Error initializing autocomplete:', err);
      }
    };

    initAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange, onLocationSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 2);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10"
          onFocus={() => setShowSuggestions(value.length > 2)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
      </div>
    </div>
  );
};
