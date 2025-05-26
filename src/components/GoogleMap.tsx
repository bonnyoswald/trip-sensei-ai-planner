
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin } from 'lucide-react';

interface GoogleMapProps {
  destinations?: string[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  destinations = [],
  center = { lat: 39.8283, lng: -98.5795 }, // Center of US
  zoom = 4,
  height = '400px',
  onLocationSelect
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: 'AIzaSyBsNn2f4JZOAjT_DGiVCIrth7APkYmupbI',
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const { Map } = await loader.load();
        
        if (!mapRef.current) return;

        const map = new Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });

        mapInstanceRef.current = map;

        // Add click listener for location selection
        if (onLocationSelect) {
          map.addListener('click', async (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              const geocoder = new google.maps.Geocoder();
              try {
                const response = await geocoder.geocode({
                  location: event.latLng
                });
                
                if (response.results[0]) {
                  onLocationSelect({
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng(),
                    address: response.results[0].formatted_address
                  });
                }
              } catch (err) {
                console.error('Geocoding error:', err);
              }
            }
          });
        }

        // Add markers for destinations
        const geocoder = new google.maps.Geocoder();
        const bounds = new google.maps.LatLngBounds();
        
        for (const destination of destinations) {
          try {
            const response = await geocoder.geocode({ address: destination });
            if (response.results[0]) {
              const marker = new google.maps.Marker({
                position: response.results[0].geometry.location,
                map,
                title: destination,
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
                      <circle cx="12" cy="10" r="3" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(32, 32),
                  anchor: new google.maps.Point(16, 32)
                }
              });

              bounds.extend(response.results[0].geometry.location);

              // Add info window
              const infoWindow = new google.maps.InfoWindow({
                content: `<div class="p-2"><strong>${destination}</strong></div>`
              });

              marker.addListener('click', () => {
                infoWindow.open(map, marker);
              });
            }
          } catch (err) {
            console.error(`Error geocoding ${destination}:`, err);
          }
        }

        // Fit map to show all markers
        if (destinations.length > 1) {
          map.fitBounds(bounds);
        } else if (destinations.length === 1) {
          map.setZoom(10);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();
  }, [destinations, center, zoom, onLocationSelect]);

  if (error) {
    return (
      <Card className="p-4">
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        <div 
          ref={mapRef} 
          style={{ height }}
          className="w-full"
        />
      </div>
    </Card>
  );
};
