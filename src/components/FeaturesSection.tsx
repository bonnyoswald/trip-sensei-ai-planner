
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Users, Search } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: "Unified Search & Booking",
      description: "Search flights, hotels, activities, and car rentals all in one place with real-time pricing and instant booking."
    },
    {
      icon: MapPin,
      title: "Interactive Map Planner",
      description: "Drag and drop destinations, visualize routes, and discover nearby attractions with our intelligent map interface."
    },
    {
      icon: Calendar,
      title: "AI Itinerary Builder",
      description: "Let our AI create personalized day-by-day itineraries based on your preferences, budget, and travel style."
    },
    {
      icon: Users,
      title: "Group Trip Collaboration",
      description: "Plan trips with friends and family in real-time, vote on destinations, and coordinate bookings together."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Plan the Perfect Trip
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From search to booking to planning, our AI-powered platform handles every aspect of your travel journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
