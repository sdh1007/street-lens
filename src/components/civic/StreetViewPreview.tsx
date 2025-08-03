import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';

interface StreetViewPreviewProps {
  lat: number;
  lng: number;
  className?: string;
}

export const StreetViewPreview: React.FC<StreetViewPreviewProps> = ({
  lat,
  lng,
  className = ""
}) => {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!streetViewRef.current || !(window as any).google?.maps) {
      setError('Google Maps not available');
      setIsLoading(false);
      return;
    }

    const initStreetView = () => {
      try {
        const panorama = new (window as any).google.maps.StreetViewPanorama(
          streetViewRef.current!,
          {
            position: { lat, lng },
            pov: { heading: 165, pitch: 0 },
            zoom: 1,
            addressControl: false,
            linksControl: false,
            panControl: false,
            enableCloseButton: false,
            zoomControl: false,
            fullscreenControl: false,
            clickToGo: false,
            scrollwheel: false,
            disableDefaultUI: true
          }
        );

        panoramaRef.current = panorama;

        // Check if Street View is available
        const streetViewService = new (window as any).google.maps.StreetViewService();
        streetViewService.getPanorama(
          { location: { lat, lng }, radius: 50 },
          (result: any, status: string) => {
            if (status === 'OK') {
              setIsLoading(false);
              setError(null);
            } else {
              setError('Street View not available');
              setIsLoading(false);
            }
          }
        );

      } catch (err) {
        setError('Failed to load Street View');
        setIsLoading(false);
      }
    };

    const timer = setTimeout(initStreetView, 100);
    
    return () => {
      clearTimeout(timer);
      if (panoramaRef.current) {
        panoramaRef.current = null;
      }
    };
  }, [lat, lng]);

  return (
    <Card className={`w-80 h-48 overflow-hidden ${className}`}>
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading Street View...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{error}</span>
              <span className="text-xs text-muted-foreground">
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            </div>
          </div>
        )}
        
        <div 
          ref={streetViewRef} 
          className="w-full h-full"
          style={{ display: error ? 'none' : 'block' }}
        />
        
        {!error && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            Street View Preview
          </div>
        )}
      </div>
    </Card>
  );
};