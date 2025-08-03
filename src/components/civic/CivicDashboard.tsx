import React, { useState, useEffect } from 'react';
import { InteractiveMap } from './InteractiveMap';
import { VideoFeedOverlay } from './VideoFeedOverlay';
import { Detection, GPSPoint } from '@/types/civic';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useGeocoding } from '@/hooks/useGeocoding';
import { useSFCivicData } from '@/hooks/useSFCivicData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Wifi, Shield, Video } from 'lucide-react';

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

  // State for toggling between current and past cases
  const [showPastCases, setShowPastCases] = useState(false);
  
  // Map fullscreen state
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  
  // Video feed overlay state
  const [showVideoFeed, setShowVideoFeed] = useState(false);

  // Real SF 311 data
  const { detections: sfDetections, isLoading: isSFDataLoading, error: sfDataError } = useSFCivicData({ showPastCases });

  // Mock data for demo (keeping as fallback)
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

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMapFullscreen) {
        setIsMapFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMapFullscreen]);

  // Handle fullscreen toggle
  const handleToggleFullscreen = (fullscreen: boolean) => {
    setIsMapFullscreen(fullscreen);
  };

  // Handle video feed toggle
  const handleToggleVideoFeed = () => {
    setShowVideoFeed(!showVideoFeed);
  };

  return (
    <>
      {isMapFullscreen ? (
        // Fullscreen Map Layout - ENTIRE Website
        <div className="fixed inset-0 z-50 bg-background">
          <InteractiveMap 
            detections={sfDetections}
            gpsTrail={gpsTrail}
            currentLocation={currentLocation}
            className="h-full w-full"
            showPastCases={showPastCases}
            onTogglePastCases={setShowPastCases}
            isMapFullscreen={isMapFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
          
          {/* Floating Video Feed Button for Fullscreen */}
          <Button
            onClick={handleToggleVideoFeed}
            className="absolute bottom-6 left-6 bg-civic-navy hover:bg-civic-blue-light text-white shadow-lg z-20 flex items-center gap-2 modern-glow hover-lift-modern"
            size="lg"
          >
            <Video className="h-5 w-5" />
            <span className="font-medium">Video Feed</span>
          </Button>
          
          {/* Modern Location Error Display for Fullscreen */}
          {locationError && (
            <Card className="absolute bottom-4 right-4 glass-card border-destructive/30 animate-scale-in z-20 max-w-sm">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-destructive to-destructive/80 rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-destructive">Location Services Error</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{locationError}</p>
                    <Button 
                      size="sm" 
                      className="modern-button mt-2 h-8 text-xs"
                      onClick={getCurrentPosition}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Retry Location
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : (
        // Normal Layout with Header
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
          {/* Modern Professional Header */}
          <div className="sticky top-0 z-40 p-4 sm:p-6">
            <Card className="glass-card hover-lift-modern modern-glow animate-fade-in">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  {/* Professional Title Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-civic-navy to-civic-blue-light flex items-center justify-center shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-civic-navy tracking-tight">
                          San Francisco Civic Monitor
                        </h1>
                        <p className="text-base sm:text-lg text-civic-blue-light font-medium">
                          Civic Issue Video Analysis Dashboard
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Modern Status and Time */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Badge className="modern-button text-white px-4 py-2 text-sm font-medium float-subtle status-pulse">
                      <div className={`w-2 h-2 rounded-full mr-2 ${isSFDataLoading ? 'bg-yellow-400 animate-pulse' : sfDataError ? 'bg-red-400' : 'bg-white animate-pulse'}`}></div>
                      <Wifi className="h-3 w-3 mr-1" />
                      {isSFDataLoading ? 'Loading Data' : sfDataError ? 'Data Error' : `${sfDetections.length} Reports Active`}
                    </Badge>
                    
                    <div className="glass-dark px-4 py-2 rounded-full">
                      <div className="text-sm text-civic-blue-light font-medium">
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

          {/* Main Content Area - Full Width Map */}
          <div className={`px-4 sm:px-6 pb-6 transition-all duration-500 ${showVideoFeed ? 'ml-[500px]' : ''}`}>
            <div className="h-[75vh] min-h-[600px] relative">
              <div className="h-full rounded-xl overflow-hidden shadow-xl modern-glow animate-fade-in">
                <InteractiveMap 
                  detections={sfDetections}
                  gpsTrail={gpsTrail}
                  currentLocation={currentLocation}
                  className="h-full"
                  showPastCases={showPastCases}
                  onTogglePastCases={setShowPastCases}
                  isMapFullscreen={isMapFullscreen}
                  onToggleFullscreen={handleToggleFullscreen}
                />
                
                {/* Floating Video Feed Button */}
                <Button
                  onClick={handleToggleVideoFeed}
                  className="absolute bottom-6 left-6 bg-civic-navy hover:bg-civic-blue-light text-white shadow-lg z-20 flex items-center gap-2 modern-glow hover-lift-modern"
                  size="lg"
                >
                  <Video className="h-5 w-5" />
                  <span className="font-medium">Video Feed</span>
                </Button>
                
                {/* Modern Location Error Display */}
                {locationError && (
                  <Card className="absolute bottom-4 right-4 glass-card border-destructive/30 animate-scale-in z-20 max-w-sm">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-destructive to-destructive/80 rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                          <MapPin className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium text-destructive">Location Services Error</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{locationError}</p>
                          <Button 
                            size="sm" 
                            className="modern-button mt-2 h-8 text-xs"
                            onClick={getCurrentPosition}
                          >
                            <Navigation className="h-3 w-3 mr-1" />
                            Retry Location
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Feed Tab Bar Overlay */}
      <VideoFeedOverlay 
        isOpen={showVideoFeed}
        onClose={() => setShowVideoFeed(false)}
        currentLocation={currentLocation}
        locationAddress={geocodingResult?.formatted}
        submittedBy="Civic Reporter #1247"
        submittedAt={new Date(Date.now() - 300000).toISOString()}
      />
    </>
  );
};