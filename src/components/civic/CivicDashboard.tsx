import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { DashboardHeader } from './DashboardHeader';
import { RecordedVideoPlayer } from './RecordedVideoPlayer';
import { InteractiveMap } from './InteractiveMap';
import { LiveDetectionFeed } from './LiveDetectionFeed';
import { LiveStatsPanel } from './LiveStatsPanel';
import { LiveStream, Detection, GPSPoint, StreamStats } from '@/types/civic';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useGeocoding } from '@/hooks/useGeocoding';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, GripVertical } from 'lucide-react';

export const CivicDashboard: React.FC = () => {
  // Real geolocation hook
  const { 
    location: currentLocation, 
    error: locationError, 
    isLoading: locationLoading,
    getCurrentPosition 
  } = useGeolocation({ 
    enableHighAccuracy: true,
    watch: true // Continuously track location
  });

  // Real geocoding hook
  const { result: geocodingResult, geocodeLocation, getShortAddress } = useGeocoding();

  // Mock data for demo
  const [mockDetections, setMockDetections] = useState<Detection[]>([
    {
      id: '1',
      type: 'trash',
      location: { lat: 37.7749, lng: -122.4194 },
      confidence: 0.87,
      timestamp: new Date().toISOString(),
      description: 'Litter pile detected near bus stop'
    },
    {
      id: '2', 
      type: 'graffiti',
      location: { lat: 37.7849, lng: -122.4094 },
      confidence: 0.93,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      description: 'Unauthorized tagging on building wall'
    },
    {
      id: '3',
      type: 'infrastructure',
      location: { lat: 37.7649, lng: -122.4294 },
      confidence: 0.76,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      description: 'Damaged sidewalk requiring repair'
    }
  ]);

  const [mockStats, setMockStats] = useState<StreamStats>({
    totalDetections: 23,
    detectionsPerMinute: 2.1,
    topIssueType: 'trash',
    streamDuration: '02:34:12',
    currentLocation: 'Requesting location...'
  });

  // Create GPS trail from current location
  const [gpsTrail, setGpsTrail] = useState<GPSPoint[]>([]);

  // Update GPS trail when location changes
  useEffect(() => {
    if (currentLocation) {
      const newPoint: GPSPoint = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        timestamp: new Date().toISOString()
      };
      
      setGpsTrail(prev => [...prev, newPoint].slice(-20)); // Keep last 20 points
      
      // Geocode the current location
      geocodeLocation(currentLocation.lat, currentLocation.lng);
    }
  }, [currentLocation, geocodeLocation]);

  // Update stats when geocoding completes
  useEffect(() => {
    if (geocodingResult) {
      setMockStats(prev => ({
        ...prev,
        currentLocation: getShortAddress(geocodingResult.formatted)
      }));
    }
  }, [geocodingResult, getShortAddress]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - 10% */}
      <div className="h-[10vh] p-4">
        <DashboardHeader
          streamStatus="connected"
          viewerCount={1247}
          participantCount={3}
        />
      </div>

      {/* Resizable Main Content - 80% */}
      <div className="h-[70vh] p-4">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Video Player Panel */}
          <Panel defaultSize={60} minSize={30}>
            <RecordedVideoPlayer
              currentLocation={currentLocation}
              locationAddress={geocodingResult?.formatted}
              submittedBy="Civic Reporter #1247"
              submittedAt={new Date(Date.now() - 300000).toISOString()} // 5 minutes ago
              className="h-full"
            />
          </Panel>
          
          {/* Resize Handle */}
          <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors relative group">
            <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-gray-400 group-hover:bg-gray-600 transition-colors"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500 group-hover:text-gray-700">
              <GripVertical className="h-4 w-4" />
            </div>
          </PanelResizeHandle>
          
          {/* Map Panel */}
          <Panel defaultSize={40} minSize={25}>
            <div className="h-full space-y-2">
              {/* Location Controls */}
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={getCurrentPosition}
                  disabled={locationLoading}
                  className="flex items-center gap-2"
                >
                  {locationLoading ? (
                    <div className="w-3 h-3 border border-gray-300 border-t-civic-navy rounded-full animate-spin" />
                  ) : (
                    <Navigation className="h-3 w-3" />
                  )}
                  {locationLoading ? 'Getting Location...' : 'Update Location'}
                </Button>
              </div>
              
              <InteractiveMap
                detections={mockDetections}
                gpsTrail={gpsTrail}
                currentLocation={currentLocation}
                className="h-full"
              />
              
              {/* Location Error Display */}
              {locationError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive font-medium">Location Error</p>
                  <p className="text-xs text-destructive/70">{locationError}</p>
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* Bottom Section - 20% */}
      <div className="h-[20vh] p-4 space-y-4">
        {/* Live Stats */}
        <LiveStatsPanel
          stats={mockStats}
          connectionStatus="connected"
        />

        {/* Detection Feed */}
        <LiveDetectionFeed
          detections={mockDetections}
        />
      </div>
    </div>
  );
};