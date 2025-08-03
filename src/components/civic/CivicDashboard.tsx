import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { InteractiveMap } from './InteractiveMap';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useGeocoding } from '@/hooks/useGeocoding';
import { Detection, GPSPoint } from '@/types/civic';

export const CivicDashboard: React.FC = () => {
  const { location, getCurrentPosition } = useGeolocation({ enableHighAccuracy: true });
  const { result: geocodingResult, geocodeLocation } = useGeocoding();

  // Mock data for detections
  const [mockDetections] = useState<Detection[]>([
    {
      id: '1',
      type: 'trash',
      location: { lat: 37.7749, lng: -122.4194 },
      confidence: 0.89,
      timestamp: new Date(Date.now() - 5000).toISOString(),
      description: 'Overflowing trash bin detected',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400'
    },
    {
      id: '2',
      type: 'graffiti',
      location: { lat: 37.7849, lng: -122.4094 },
      confidence: 0.94,
      timestamp: new Date(Date.now() - 15000).toISOString(),
      description: 'Graffiti on building wall',
      image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400'
    },
    {
      id: '3',
      type: 'infrastructure',
      location: { lat: 37.7649, lng: -122.4294 },
      confidence: 0.76,
      timestamp: new Date(Date.now() - 45000).toISOString(),
      description: 'Pothole in street surface'
    },
    {
      id: '4',
      type: 'trash',
      location: { lat: 37.7549, lng: -122.4394 },
      confidence: 0.82,
      timestamp: new Date(Date.now() - 120000).toISOString(),
      description: 'Litter scattered on sidewalk'
    }
  ]);

  // GPS trail mock data
  const [gpsTrail] = useState<GPSPoint[]>([
    { lat: 37.7749, lng: -122.4194, timestamp: new Date(Date.now() - 300000).toISOString() },
    { lat: 37.7759, lng: -122.4184, timestamp: new Date(Date.now() - 240000).toISOString() },
    { lat: 37.7769, lng: -122.4174, timestamp: new Date(Date.now() - 180000).toISOString() },
    { lat: 37.7779, lng: -122.4164, timestamp: new Date(Date.now() - 120000).toISOString() },
    { lat: 37.7789, lng: -122.4154, timestamp: new Date(Date.now() - 60000).toISOString() },
  ]);

  // Update GPS trail and current location
  useEffect(() => {
    if (location) {
      // In a real app, this would update the GPS trail with actual location data
      console.log('Current location:', location);
      geocodeLocation(location.lat, location.lng);
    }
  }, [location, geocodeLocation]);

  console.log('CivicDashboard rendering', { location, geocodingResult });
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-civic-navy">Civic Report Dashboard</h1>
                <p className="text-muted-foreground mt-1">Monitor and analyze civic issues in your area</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="h-[calc(100vh-200px)]">
          <InteractiveMap 
            detections={mockDetections}
            gpsTrail={gpsTrail}
            currentLocation={location}
          />
        </div>
      </div>
    </div>
  );
};