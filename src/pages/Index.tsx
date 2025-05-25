
import React from 'react';
import { TravelHeader } from '@/components/TravelHeader';
import { HeroSearch } from '@/components/HeroSearch';
import { FeaturesSection } from '@/components/FeaturesSection';
import { TrendingDestinations } from '@/components/TrendingDestinations';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <TravelHeader />
      <main>
        <HeroSearch />
        <FeaturesSection />
        <TrendingDestinations />
      </main>
    </div>
  );
};

export default Index;
