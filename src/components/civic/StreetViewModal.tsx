import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, MapPin, AlertCircle } from 'lucide-react';

interface StreetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  address?: string;
}

export const StreetViewModal: React.FC<StreetViewModalProps> = ({
  isOpen,
  onClose,
  lat,
  lng,
  address
}) => {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const streetViewPanorama = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
      return;
    }

    const initializeStreetView = () => {
      if (!streetViewRef.current) return;
      
      try {
        console.log('Initializing Street View at:', lat, lng);
        
        // Check if Google Maps API is loaded
        if (!(window as any).google?.maps) {
          console.error('Google Maps API not loaded');
          setHasError(true);
          setErrorMessage('Google Maps API not loaded');
          setIsLoading(false);
          return;
        }

        // Create Street View panorama
        streetViewPanorama.current = new (window as any).google.maps.StreetViewPanorama(
          streetViewRef.current,
          {
            position: { lat, lng },
            pov: {
              heading: 0,
              pitch: 0,
            },
            zoom: 1,
            addressControl: true,
            enableCloseButton: false,
            fullscreenControl: true,
            motionTracking: false,
            motionTrackingControl: false,
            showRoadLabels: true,
          }
        );

        // Check if street view is available at this location
        const streetViewService = new (window as any).google.maps.StreetViewService();
        streetViewService.getPanorama(
          { 
            location: { lat, lng }, 
            radius: 100,
            source: (window as any).google.maps.StreetViewSource.OUTDOOR
          },
          (data: any, status: string) => {
            console.log('Street View status:', status);
            setIsLoading(false);
            
            if (status === 'OK') {
              console.log('Street View available');
              setHasError(false);
            } else {
              console.warn('Street View not available at this location, status:', status);
              setHasError(true);
              setErrorMessage('Street View imagery is not available at this location. Try a different location or check back later.');
            }
          }
        );

        // Listen for panorama events
        streetViewPanorama.current.addListener('pano_changed', () => {
          console.log('Panorama changed');
          setIsLoading(false);
          setHasError(false);
        });

        streetViewPanorama.current.addListener('status_changed', () => {
          const status = streetViewPanorama.current.getStatus();
          console.log('Street View status changed:', status);
          if (status !== 'OK') {
            setHasError(true);
            setErrorMessage('Street View could not load properly.');
            setIsLoading(false);
          }
        });

      } catch (error) {
        console.error('Error initializing Street View:', error);
        setHasError(true);
        setErrorMessage('Failed to initialize Street View.');
        setIsLoading(false);
      }
    };

    // Wait for Google Maps API to be loaded
    if ((window as any).google?.maps) {
      initializeStreetView();
    } else {
      const checkGoogleMaps = setInterval(() => {
        if ((window as any).google?.maps) {
          clearInterval(checkGoogleMaps);
          initializeStreetView();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogleMaps);
        if (!(window as any).google?.maps) {
          setHasError(true);
          setErrorMessage('Google Maps API failed to load.');
          setIsLoading(false);
        }
      }, 10000);

      return () => clearInterval(checkGoogleMaps);
    }

    return () => {
      if (streetViewPanorama.current) {
        streetViewPanorama.current = null;
      }
    };
  }, [isOpen, lat, lng]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 glass-card">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-civic-navy" />
              <div>
                <h2 className="text-lg font-bold text-civic-navy">
                  Street View
                </h2>
                <p className="text-sm text-muted-foreground">
                  {address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover-lift-modern"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="relative h-[500px] bg-muted rounded-lg mx-4">
          {/* Street View Container */}
          <div 
            ref={streetViewRef}
            className="w-full h-full rounded-lg overflow-hidden"
          />
          
          {/* Loading State */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center">
                <div className="loading-modern w-12 h-12 border-4 border-civic-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-civic-navy font-medium">Loading Street View...</p>
                <p className="text-sm text-muted-foreground mt-1">Please wait while we load the street imagery</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center max-w-md px-6">
                <AlertCircle className="h-16 w-16 text-warning mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-civic-navy mb-2">Street View Unavailable</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {errorMessage}
                </p>
                <Button 
                  onClick={onClose}
                  className="modern-button"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {!hasError && (
          <div className="p-4 pt-2 border-t bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Use mouse to look around • Scroll to zoom • Arrow keys to move along the street
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};