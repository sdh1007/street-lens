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
import { MapPin, Navigation, GripVertical, Zap, Cpu } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-ultra-black via-background to-ultra-black particle-field">
      {/* Ultra-Futuristic Header */}
      <div className="sticky top-0 z-40 p-4 sm:p-6">
        <Card className="glass-card hover-lift-3d neon-glow animate-fade-in relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-electric-cyan via-neon-purple to-electric-cyan bg-[length:200%_100%] animate-pulse-glow"></div>
          </div>
          
          <div className="relative p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              {/* Ultra-Modern Title Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-electric-cyan to-neon-purple flex items-center justify-center holographic">
                    <Cpu className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-electric-cyan via-neon-purple to-electric-cyan bg-clip-text text-transparent tracking-tight animate-fade-in">
                      San Francisco Civic Monitor
                    </h1>
                    <p className="text-base sm:text-lg text-electric-cyan/80 font-medium tracking-wide">
                      Neural Civic Intelligence Dashboard
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Futuristic Status and Time */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Badge className="cyber-button bg-gradient-to-r from-electric-cyan to-neon-purple text-white px-4 py-2 text-sm font-medium float-element rgb-border">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                  <Zap className="h-3 w-3 mr-1" />
                  NEURAL LINK ACTIVE
                </Badge>
                
                <div className="glass-dark px-4 py-2 rounded-full">
                  <div className="text-sm text-electric-cyan font-medium">
                    San Francisco, CA • {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Ultra-Modern Main Content Area */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="h-[75vh] min-h-[600px]">
          <PanelGroup direction="horizontal" className="h-full rounded-2xl overflow-hidden shadow-2xl neon-glow">
            {/* Video Player Panel */}
            <Panel defaultSize={50} minSize={35} className="relative">
              <div className="h-full animate-fade-in video-hologram">
                <RecordedVideoPlayer
                  currentLocation={currentLocation}
                  locationAddress={geocodingResult?.formatted}
                  submittedBy="Civic Reporter #1247"
                  submittedAt={new Date(Date.now() - 300000).toISOString()}
                  className="h-full rounded-none border-none shadow-none"
                />
              </div>
            </Panel>
            
            {/* Cyber Resize Handle */}
            <PanelResizeHandle className="w-2 bg-gradient-to-b from-electric-cyan via-neon-purple to-electric-cyan hover:w-3 transition-all duration-300 relative group neon-glow">
              <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-8 h-8 bg-gradient-to-r from-electric-cyan to-neon-purple rounded-full flex items-center justify-center shadow-lg holographic">
                  <GripVertical className="h-4 w-4 text-white" />
                </div>
              </div>
            </PanelResizeHandle>
            
            {/* Map Panel */}
            <Panel defaultSize={50} minSize={25} className="relative">
              <div className="h-full p-3 bg-gradient-to-br from-ultra-black/50 to-electric-cyan/5 animate-slide-in-right">
                {/* Map Container */}
                <div className="h-full rounded-xl overflow-hidden shadow-xl hover-lift-3d">
                  <InteractiveMap
                    detections={mockDetections}
                    gpsTrail={gpsTrail}
                    currentLocation={currentLocation}
                    className="h-full"
                  />
                </div>
                
                {/* Ultra-Modern Location Error Display */}
                {locationError && (
                  <Card className="absolute bottom-4 left-4 right-4 glass-card border-destructive/50 animate-scale-in">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-destructive to-neon-pink rounded-full flex items-center justify-center mt-0.5 neon-glow">
                          <MapPin className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium text-destructive">Neural Location Services Error</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{locationError}</p>
                          <Button 
                            size="sm" 
                            className="cyber-button mt-2 h-8 text-xs"
                            onClick={getCurrentPosition}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Relink Neural Grid
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