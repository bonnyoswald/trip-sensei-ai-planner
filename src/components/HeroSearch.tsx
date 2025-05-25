
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Users, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const HeroSearch = () => {
  const [searchType, setSearchType] = useState('all');
  const [destination, setDestination] = useState('');

  const searchTypes = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'flights', label: 'Flights', icon: Search },
    { id: 'hotels', label: 'Hotels', icon: MapPin },
    { id: 'activities', label: 'Activities', icon: Calendar }
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your AI-Powered
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Travel Companion
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover, plan, and book amazing trips with intelligent recommendations, 
            real-time pricing, and personalized itineraries powered by AI.
          </p>
        </div>

        <Card className="max-w-5xl mx-auto shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-wrap gap-2 mb-6">
              {searchTypes.map((type) => (
                <Badge
                  key={type.id}
                  variant={searchType === type.id ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => setSearchType(type.id)}
                >
                  <type.icon className="h-4 w-4 mr-2" />
                  {type.label}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Where to?
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search destinations, hotels, or attractions"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in / Departure
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="date"
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travelers / Guests
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="2 adults"
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Search className="h-5 w-5 mr-2" />
                Search & Discover
              </Button>
              <Button variant="outline" size="lg" className="h-12">
                Ask AI Assistant
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted by travelers worldwide</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-lg font-semibold">Booking.com</div>
            <div className="text-lg font-semibold">Google Maps</div>
            <div className="text-lg font-semibold">OpenAI</div>
            <div className="text-lg font-semibold">Amadeus</div>
          </div>
        </div>
      </div>
    </section>
  );
};
