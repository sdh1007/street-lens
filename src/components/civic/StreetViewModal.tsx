import React, { useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, MapPin } from 'lucide-react';

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

  useEffect(() => {
    if (isOpen && streetViewRef.current && (window as any).google?.maps) {
      // Initialize Street View
      streetViewPanorama.current = new (window as any).google.maps.StreetViewPanorama(
        streetViewRef.current,
        {
          position: { lat, lng },
          pov: {
            heading: 34,
            pitch: 10,
          },
          zoom: 1,
          addressControl: true,
          enableCloseButton: false,
          fullscreenControl: true,
          motionTracking: false,
          motionTrackingControl: false,
        }
      );

      // Check if street view is available at this location
      const streetViewService = new (window as any).google.maps.StreetViewService();
      streetViewService.getPanorama(
        { location: { lat, lng }, radius: 50 },
        (data: any, status: string) => {
          if (status !== 'OK') {
            console.warn('Street View not available at this location');
          }
        }
      );
    }

    return () => {
      streetViewPanorama.current = null;
    };
  }, [isOpen, lat, lng]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
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
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="relative h-[500px] bg-gray-100">
          {/* Street View Container */}
          <div 
            ref={streetViewRef}
            className="w-full h-full"
          />
          
          {/* Loading/Error State */}
          {!(window as any).google?.maps && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-navy mx-auto mb-4"></div>
                <p className="text-civic-navy">Loading Street View...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 pt-2 border-t bg-gray-50">
          <p className="text-xs text-gray-600">
            Use mouse to look around • Scroll to zoom • Arrow keys to move along the street
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};