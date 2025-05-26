
import React from 'react';
import { TripsManager } from '@/components/TripsManager';

const Trips = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <TripsManager />
      </div>
    </div>
  );
};

export default Trips;
