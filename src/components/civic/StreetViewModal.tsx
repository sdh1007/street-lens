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
    console.log('StreetView: useEffect triggered, isOpen:', isOpen, 'lat:', lat, 'lng:', lng);
    
    if (!isOpen) {
      console.log('StreetView: Modal not open, resetting state');
      setIsLoading(true);
      setHasError(false);
      setErrorMessage('');
      return;
    }

    console.log('StreetView: Modal is open, proceeding with initialization');

    const initializeStreetView = async () => {
      if (!streetViewRef.current) {
        console.log('StreetView: No ref available');
        return;
      }
      
      try {
        console.log('StreetView: Initializing Street View at:', lat, lng);
        
        // Check if Google Maps API is loaded
        if (!(window as any).google?.maps) {
          throw new Error('Google Maps API not loaded');
        }

        const google = (window as any).google;
        
        // First check if Street View is available at this location
        const streetViewService = new google.maps.StreetViewService();
        
        console.log('StreetView: Checking for Street View availability...');
        
        streetViewService.getPanorama({
          location: { lat, lng },
          radius: 150, // Increased radius
          preference: google.maps.StreetViewPreference.NEAREST
        }, (data: any, status: any) => {
          console.log('StreetView: getPanorama result - status:', status);
          
          if (status === google.maps.StreetViewStatus.OK && data) {
            console.log('StreetView: Creating panorama...');
            
            try {
              // Create the street view panorama
              streetViewPanorama.current = new google.maps.StreetViewPanorama(
                streetViewRef.current,
                {
                  position: data.location.latLng || { lat, lng },
                  pov: {
                    heading: 0,
                    pitch: 0
                  },
                  zoom: 1,
                  visible: true,
                  enableCloseButton: false,
                  fullscreenControl: true,
                  panControl: true,
                  zoomControl: true,
                  addressControl: true,
                  linksControl: true,
                  motionTracking: false,
                  motionTrackingControl: false,
                  showRoadLabels: true
                }
              );

              console.log('StreetView: Panorama created, setting up listeners...');

              // Add event listeners
              streetViewPanorama.current.addListener('pano_changed', () => {
                console.log('StreetView: Panorama loaded successfully');
                setIsLoading(false);
                setHasError(false);
              });

              streetViewPanorama.current.addListener('status_changed', () => {
                const panoramaStatus = streetViewPanorama.current.getStatus();
                console.log('StreetView: Status changed to:', panoramaStatus);
                
                if (panoramaStatus === google.maps.StreetViewStatus.OK) {
                  setIsLoading(false);
                  setHasError(false);
                }
              });

              // Force loading to complete after a reasonable timeout
              setTimeout(() => {
                console.log('StreetView: Timeout reached, clearing loading state');
                if (isLoading) {
                  setIsLoading(false);
                }
              }, 2000);

            } catch (panoramaError) {
              console.error('StreetView: Error creating panorama:', panoramaError);
              setIsLoading(false);
              setHasError(true);
              setErrorMessage('Failed to create Street View panorama');
            }
            
          } else {
            console.log('StreetView: No Street View available, status:', status);
            setIsLoading(false);
            setHasError(true);
            setErrorMessage('Street View imagery is not available at this location. Try clicking on a street or intersection.');
          }
        });

      } catch (error: any) {
        console.error('StreetView: Initialization error:', error);
        setIsLoading(false);
        setHasError(true);
        setErrorMessage(error.message || 'Failed to initialize Street View');
      }
    };

    // Wait for Google Maps API to be loaded
    console.log('StreetView: Checking if Google Maps API is loaded:', !!(window as any).google?.maps);
    
    if ((window as any).google?.maps) {
      console.log('StreetView: Google Maps API already loaded, initializing immediately');
      initializeStreetView();
    } else {
      console.log('StreetView: Google Maps API not loaded, waiting...');
      const checkGoogleMaps = setInterval(() => {
        console.log('StreetView: Checking Google Maps API...');
        if ((window as any).google?.maps) {
          console.log('StreetView: Google Maps API loaded, initializing now');
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