import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Detection, GPSPoint } from '@/types/civic';
import { MapPin, Layers, Satellite, Navigation, Eye, Camera } from 'lucide-react';

interface InteractiveMapProps {
  detections: Detection[];
  gpsTrail: GPSPoint[];
  currentLocation?: { lat: number; lng: number };
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  detections,
  gpsTrail,
  currentLocation,
  className = ""
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const streetViewRef2 = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);

  // Initialize Google Map
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !(window as any).google) return;

      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
        zoom: 13,
        mapTypeId: mapType,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: (window as any).google.maps.ControlPosition.RIGHT_CENTER,
        },
        streetViewControlOptions: {
          position: (window as any).google.maps.ControlPosition.RIGHT_TOP,
        },
      });

      googleMapRef.current = map;
      setIsMapLoaded(true);
    };

    // Wait for Google Maps API to load
    if ((window as any).google && (window as any).google.maps) {
      initMap();
    } else {
      const checkGoogleMaps = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          clearInterval(checkGoogleMaps);
          initMap();
        }
      }, 100);

      return () => clearInterval(checkGoogleMaps);
    }
  }, [mapType]);

  // Initialize Street View
  const initializeStreetView = (detection: Detection) => {
    if (!streetViewRef.current || !(window as any).google) return;

    const streetView = new (window as any).google.maps.StreetViewPanorama(
      streetViewRef.current,
      {
        position: { lat: detection.location.lat, lng: detection.location.lng },
        pov: { heading: 34, pitch: 10 },
        zoom: 1,
        addressControl: false,
        enableCloseButton: true,
      }
    );

    streetViewRef2.current = streetView;
    setSelectedDetection(detection);
    setShowStreetView(true);
  };

  // Toggle Street View
  const toggleStreetView = () => {
    if (showStreetView) {
      setShowStreetView(false);
      setSelectedDetection(null);
    } else if (detections.length > 0) {
      initializeStreetView(detections[0]);
    }
  };

  // Update map type
  const changeMapType = (type: 'roadmap' | 'satellite' | 'hybrid') => {
    setMapType(type);
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(type);
    }
  };

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  // Create detection markers with enhanced interactions
  useEffect(() => {
    if (!googleMapRef.current || !isMapLoaded) return;

    clearMarkers();

    // Add detection markers with enhanced interactions
    detections.forEach((detection) => {
      const marker = new (window as any).google.maps.Marker({
        position: { lat: detection.location.lat, lng: detection.location.lng },
        map: googleMapRef.current,
        title: getDetectionTypeLabel(detection.type),
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: getDetectionColor(detection.type),
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        animation: (window as any).google.maps.Animation.DROP,
      });

      // Enhanced info window with actions
      const infoWindow = new (window as any).google.maps.InfoWindow({
        content: `
          <div class="p-4 min-w-[250px]">
            <div class="flex justify-between items-start mb-3">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style="background-color: ${getDetectionColor(detection.type)}20; color: ${getDetectionColor(detection.type)};">
                ${getDetectionTypeLabel(detection.type)}
              </span>
              <span class="text-xs text-gray-500">
                ${formatTimestamp(detection.timestamp)}
              </span>
            </div>
            
            <h4 class="font-semibold text-sm mb-2">${detection.description}</h4>
            
            <div class="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
              <div>Confidence: <span class="font-medium">${Math.round(detection.confidence * 100)}%</span></div>
              <div>Location: <span class="font-medium">${detection.location.lat.toFixed(4)}, ${detection.location.lng.toFixed(4)}</span></div>
            </div>
            
            <div class="flex gap-2">
              <button onclick="window.viewStreetView('${detection.id}')" class="flex-1 bg-blue-500 text-white text-xs py-2 px-3 rounded hover:bg-blue-600 transition-colors">
                📍 Street View
              </button>
              <button onclick="window.centerOnDetection('${detection.id}')" class="flex-1 bg-gray-500 text-white text-xs py-2 px-3 rounded hover:bg-gray-600 transition-colors">
                🎯 Center Map
              </button>
            </div>
          </div>
        `
      });

      // Enhanced marker interactions
      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current, marker);
      });

      marker.addListener('mouseover', () => {
        marker.setIcon({
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: getDetectionColor(detection.type),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        });
      });

      marker.addListener('mouseout', () => {
        marker.setIcon({
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: getDetectionColor(detection.type),
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        });
      });

      markersRef.current.push(marker);
    });

    // Add current location marker
    if (currentLocation) {
      const currentMarker = new (window as any).google.maps.Marker({
        position: { lat: currentLocation.lat, lng: currentLocation.lng },
        map: googleMapRef.current,
        title: 'Current Location',
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        animation: (window as any).google.maps.Animation.BOUNCE,
      });

      // Stop animation after 2 seconds
      setTimeout(() => {
        currentMarker.setAnimation(null);
      }, 2000);

      markersRef.current.push(currentMarker);
    }

    // Add GPS trail polyline
    if (gpsTrail.length > 1) {
      const trailPath = gpsTrail.map(point => ({
        lat: point.lat,
        lng: point.lng
      }));

      const polyline = new (window as any).google.maps.Polyline({
        path: trailPath,
        geodesic: true,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.7,
        strokeWeight: 3,
        map: googleMapRef.current,
      });
    }

    // Auto-fit bounds to show all markers
    if (detections.length > 0 || currentLocation) {
      const bounds = new (window as any).google.maps.LatLngBounds();
      
      detections.forEach(detection => {
        bounds.extend(new (window as any).google.maps.LatLng(detection.location.lat, detection.location.lng));
      });
      
      if (currentLocation) {
        bounds.extend(new (window as any).google.maps.LatLng(currentLocation.lat, currentLocation.lng));
      }
      
      googleMapRef.current.fitBounds(bounds);
    }

  }, [detections, currentLocation, gpsTrail, isMapLoaded]);

  // Global functions for info window buttons
  useEffect(() => {
    (window as any).viewStreetView = (detectionId: string) => {
      const detection = detections.find(d => d.id === detectionId);
      if (detection) {
        initializeStreetView(detection);
      }
    };

    (window as any).centerOnDetection = (detectionId: string) => {
      const detection = detections.find(d => d.id === detectionId);
      if (detection && googleMapRef.current) {
        googleMapRef.current.setCenter({ lat: detection.location.lat, lng: detection.location.lng });
        googleMapRef.current.setZoom(18);
      }
    };

    return () => {
      delete (window as any).viewStreetView;
      delete (window as any).centerOnDetection;
    };
  }, [detections]);

  const getDetectionTypeLabel = (type: Detection['type']) => {
    switch (type) {
      case 'trash':
        return 'Litter/Trash';
      case 'graffiti':
        return 'Graffiti';
      case 'infrastructure':
        return 'Infrastructure Issue';
      default:
        return type;
    }
  };

  const getDetectionColor = (type: Detection['type']) => {
    switch (type) {
      case 'trash':
        return '#ef4444'; // red
      case 'graffiti':
        return '#f97316'; // orange
      case 'infrastructure':
        return '#eab308'; // yellow
      default:
        return '#6b7280'; // gray
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-4 border-b bg-civic-navy text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Live Monitoring Map</h3>
            <p className="text-sm text-civic-gold-light">Real-time detection tracking</p>
          </div>
          
          {/* Enhanced Map Type Controls */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={mapType === 'roadmap' ? 'secondary' : 'ghost'}
              onClick={() => changeMapType('roadmap')}
              className="text-white hover:bg-white/20 h-8"
              title="Road Map"
            >
              <Navigation className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant={mapType === 'satellite' ? 'secondary' : 'ghost'}
              onClick={() => changeMapType('satellite')}
              className="text-white hover:bg-white/20 h-8"
              title="Satellite View"
            >
              <Satellite className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant={mapType === 'hybrid' ? 'secondary' : 'ghost'}
              onClick={() => changeMapType('hybrid')}
              className="text-white hover:bg-white/20 h-8"
              title="Hybrid View"
            >
              <Layers className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant={showStreetView ? 'secondary' : 'ghost'}
              onClick={toggleStreetView}
              className="text-white hover:bg-white/20 h-8"
              title="Street View"
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="relative h-[500px] flex">
        {/* Main Map Container */}
        <div 
          ref={mapRef}
          className={`transition-all duration-300 ${showStreetView ? 'w-1/2' : 'w-full'} h-full`}
        />
        
        {/* Street View Container */}
        {showStreetView && (
          <div className="w-1/2 h-full relative border-l border-civic-gray">
            <div 
              ref={streetViewRef}
              className="w-full h-full"
            />
            
            {/* Street View Header */}
            <div className="absolute top-0 left-0 right-0 bg-black/70 text-white p-2 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-semibold">Street View</h4>
                  {selectedDetection && (
                    <p className="text-xs text-gray-300">{getDetectionTypeLabel(selectedDetection.type)}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowStreetView(false)}
                  className="text-white hover:bg-white/20 h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-civic-gray">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-navy mx-auto mb-4"></div>
              <p className="text-civic-navy">Loading map...</p>
            </div>
          </div>
        )}
        
        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10">
          <h4 className="text-sm font-semibold mb-2">Detection Types</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
              <span>Litter/Trash</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full border border-white"></div>
              <span>Graffiti</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>
              <span>Infrastructure</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
              <span>Current Location</span>
            </div>
          </div>
        </div>

        {/* Detection Count Badge */}
        <div className="absolute top-4 left-4 bg-civic-navy text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">{detections.length} detections</span>
          </div>
        </div>
      </div>
    </Card>
  );
};