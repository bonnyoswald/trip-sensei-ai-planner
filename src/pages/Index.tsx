
import React from 'react';
import { TravelHeader } from '@/components/TravelHeader';
import { HeroSearch } from '@/components/HeroSearch';
import { FeaturesSection } from '@/components/FeaturesSection';
import { TrendingDestinations } from '@/components/TrendingDestinations';
import { AITravelChat } from '@/components/AITravelChat';
import { NotificationCenter } from '@/components/NotificationCenter';
import { ItineraryGenerator } from '@/components/ItineraryGenerator';
import { PaymentProcessor } from '@/components/PaymentProcessor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <TravelHeader />
      <main>
        <HeroSearch />
        <FeaturesSection />
        
        {/* Backend Features Demo Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Backend Features</h2>
              <p className="text-xl text-muted-foreground">
                Experience AI-powered travel planning, real-time notifications, secure payments, and more
              </p>
            </div>

            <Tabs defaultValue="ai-chat" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="ai-chat">AI Assistant</TabsTrigger>
                <TabsTrigger value="itinerary">Auto Itinerary</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>

              <TabsContent value="ai-chat" className="mt-6">
                <AITravelChat />
              </TabsContent>

              <TabsContent value="itinerary" className="mt-6">
                <ItineraryGenerator />
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <div className="flex justify-center">
                  <NotificationCenter />
                </div>
                <div className="text-center mt-8 text-muted-foreground">
                  <p>Real-time notifications for price alerts, booking confirmations, and travel updates</p>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="mt-6">
                <div className="max-w-md mx-auto">
                  <PaymentProcessor
                    bookingId="demo-booking-123"
                    amount={299.99}
                    onPaymentSuccess={(paymentId) => {
                      console.log('Payment successful:', paymentId);
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <TrendingDestinations />
      </main>
    </div>
  );
};

export default Index;
