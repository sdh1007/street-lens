import React, { useState, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { RecordedVideoPlayer } from './RecordedVideoPlayer';
import { InteractiveMap } from './InteractiveMap';
import { Detection, GPSPoint } from '@/types/civic';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useGeocoding } from '@/hooks/useGeocoding';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-40 p-4 sm:p-6">
        <Card className="backdrop-blur-lg bg-card/95 border border-border/50 shadow-xl hover-glow animate-fade-in">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              {/* Title Section */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-civic-navy tracking-tight">
                  San Francisco Civic Monitor
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground font-medium">
                  Civic Issue Video Analysis Dashboard
                </p>
              </div>
              
              {/* Status and Time */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Badge className="bg-success text-white px-3 py-1.5 text-sm font-medium animate-pulse-glow">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  System Online
                </Badge>
                
                <div className="text-sm text-muted-foreground font-medium">
                  San Francisco, CA • {new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="h-[75vh] min-h-[600px]">
          <PanelGroup direction="horizontal" className="h-full rounded-xl overflow-hidden shadow-2xl">
            {/* Video Player Panel */}
            <Panel defaultSize={60} minSize={35} className="relative">
              <div className="h-full animate-fade-in">
                <RecordedVideoPlayer
                  currentLocation={currentLocation}
                  locationAddress={geocodingResult?.formatted}
                  submittedBy="Civic Reporter #1247"
                  submittedAt={new Date(Date.now() - 300000).toISOString()}
                  className="h-full rounded-none border-none shadow-none"
                />
              </div>
            </Panel>
            
            {/* Modern Resize Handle */}
            <PanelResizeHandle className="w-1 bg-border hover:bg-civic-gold transition-all duration-200 relative group">
              <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-civic-gold/0 via-civic-gold/50 to-civic-gold/0 group-hover:from-civic-gold via-civic-gold to-civic-gold transition-all duration-300"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-6 h-6 bg-civic-gold rounded-full flex items-center justify-center shadow-lg">
                  <GripVertical className="h-3 w-3 text-civic-navy" />
                </div>
              </div>
            </PanelResizeHandle>
            
            {/* Map Panel */}
            <Panel defaultSize={40} minSize={25} className="relative">
              <div className="h-full space-y-3 p-3 bg-muted/10 animate-slide-in-right">
                {/* Location Controls */}
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={getCurrentPosition}
                    disabled={locationLoading}
                    className="flex items-center gap-2 hover-lift focus-ring bg-card/80 backdrop-blur-sm border-border/50"
                  >
                    {locationLoading ? (
                      <div className="w-3 h-3 border border-muted-foreground border-t-civic-navy rounded-full animate-spin" />
                    ) : (
                      <Navigation className="h-3 w-3" />
                    )}
                    <span className="hidden sm:inline">
                      {locationLoading ? 'Getting Location...' : 'Update Location'}
                    </span>
                  </Button>
                </div>
                
                {/* Map Container */}
                <div className="flex-1 rounded-xl overflow-hidden shadow-xl">
                  <InteractiveMap
                    detections={mockDetections}
                    gpsTrail={gpsTrail}
                    currentLocation={currentLocation}
                    className="h-full"
                  />
                </div>
                
                {/* Enhanced Location Error Display */}
                {locationError && (
                  <Card className="border-destructive/20 bg-destructive/5 animate-scale-in">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-destructive rounded-full flex items-center justify-center mt-0.5">
                          <MapPin className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium text-destructive">Location Services Error</p>
                          <p className="text-xs text-destructive/70 leading-relaxed">{locationError}</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={getCurrentPosition}
                            className="mt-2 h-7 text-xs"
                          >
                            Try Again
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
};