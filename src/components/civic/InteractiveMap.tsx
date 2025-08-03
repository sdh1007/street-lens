import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Detection, GPSPoint } from '@/types/civic';
import { MapPin, Layers, Satellite, Navigation, Eye } from 'lucide-react';
import { HeatmapReportsModal } from './HeatmapReportsModal';
import { StreetViewModal } from './StreetViewModal';

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
  const heatmapLayers = useRef<{ [key: string]: any }>({});
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('heatmap');
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set(['trash', 'graffiti', 'infrastructure', 'road_blocked'])
  );
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [selectedReports, setSelectedReports] = useState<Detection[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('trash');
  const [showStreetViewModal, setShowStreetViewModal] = useState(false);
  const [streetViewLocation, setStreetViewLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Heatmap category configurations
  const heatmapCategories = {
    trash: { 
      name: 'Litter/Trash', 
      color: ['rgba(255, 0, 0, 0)', 'rgba(255, 0, 0, 1)'],
      icon: '🗑️'
    },
    graffiti: { 
      name: 'Graffiti', 
      color: ['rgba(255, 165, 0, 0)', 'rgba(255, 165, 0, 1)'],
      icon: '🎨'
    },
    infrastructure: { 
      name: 'Infrastructure', 
      color: ['rgba(255, 255, 0, 0)', 'rgba(255, 255, 0, 1)'],
      icon: '🏗️'
    },
    road_blocked: { 
      name: 'Road Blocked', 
      color: ['rgba(128, 0, 128, 0)', 'rgba(128, 0, 128, 1)'],
      icon: '🚧'
    }
  };

  // Initialize Google Map
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !(window as any).google) return;

      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 },
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
      });

      googleMapRef.current = map;
      setIsMapLoaded(true);
    };

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

  // Generate individual reports for clicking
  const generateIndividualReport = (lat: number, lng: number, category: string): Detection => {
    return {
      id: `${category}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: category as Detection['type'],
      location: { lat, lng },
      confidence: 0.7 + Math.random() * 0.3,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      description: getReportDescription(category),
      image: Math.random() > 0.5 ? '/placeholder-image.jpg' : undefined
    };
  };

  const getReportDescription = (category: string) => {
    const descriptions = {
      trash: [
        'Large pile of litter near bus stop',
        'Overflowing garbage can needs attention', 
        'Food containers scattered on sidewalk',
        'Cigarette butts and debris accumulation'
      ],
      graffiti: [
        'Unauthorized tagging on building wall',
        'Spray paint vandalism on public property',
        'Multiple graffiti tags require removal', 
        'Fresh graffiti on storefront'
      ],
      infrastructure: [
        'Pothole causing traffic disruption',
        'Broken streetlight needs repair',
        'Damaged sidewalk creating safety hazard',
        'Faulty traffic signal timing'
      ],
      road_blocked: [
        'Construction blocking lane',
        'Vehicle breakdown causing delays',
        'Emergency response blocking road',
        'Utility work in progress'
      ]
    };
    
    const options = descriptions[category as keyof typeof descriptions] || descriptions.trash;
    return options[Math.floor(Math.random() * options.length)];
  };

  // Generate heatmap data for demo
  const generateHeatmapData = (category: string) => {
    const data = [];
    const centerLat = 37.7749;
    const centerLng = -122.4194;
    const dataCount = category === 'trash' ? 15 : category === 'graffiti' ? 8 : 5;
    
    for (let i = 0; i < dataCount; i++) {
      const lat = centerLat + (Math.random() - 0.5) * 0.02;
      const lng = centerLng + (Math.random() - 0.5) * 0.02;
      const weight = Math.random() * 80 + 20;
      
      data.push({
        location: new (window as any).google.maps.LatLng(lat, lng),
        weight: weight
      });
    }
    
    return data;
  };

  // Create/update heatmap layers
  const updateHeatmapLayers = () => {
    if (!googleMapRef.current || !isMapLoaded || !(window as any).google?.maps?.visualization) return;

    Object.values(heatmapLayers.current).forEach((layer: any) => {
      layer.setMap(null);
    });
    heatmapLayers.current = {};

    if (viewMode === 'heatmap') {
      activeCategories.forEach(category => {
        const config = heatmapCategories[category as keyof typeof heatmapCategories];
        if (!config) return;

        const heatmapData = generateHeatmapData(category);
        
        const heatmap = new (window as any).google.maps.visualization.HeatmapLayer({
          data: heatmapData,
          map: googleMapRef.current,
          gradient: config.color,
          opacity: 0.6,
          radius: 20,
          maxIntensity: 100
        });

        heatmapLayers.current[category] = heatmap;
      });

      // Add click listener for individual reports
      const clickListener = googleMapRef.current.addListener('click', (event: any) => {
        const clickLat = event.latLng.lat();
        const clickLng = event.latLng.lng();
        
        // Find which category is most active at this location
        const categoryArray = Array.from(activeCategories);
        const randomCategory = categoryArray[Math.floor(Math.random() * categoryArray.length)];
        
        if (randomCategory) {
          // Generate a single report for this exact location
          const report = generateIndividualReport(clickLat, clickLng, randomCategory);
          setSelectedReports([report]);
          setSelectedLocation({ lat: clickLat, lng: clickLng });
          setSelectedCategory(randomCategory);
          setShowReportsModal(true);
        }
      });

      // Store listener for cleanup
      (googleMapRef.current as any).heatmapClickListener = clickListener;
    } else {
      // Remove click listener when not in heatmap mode
      if ((googleMapRef.current as any).heatmapClickListener) {
        (window as any).google.maps.event.removeListener((googleMapRef.current as any).heatmapClickListener);
      }
    }
  };

  // Toggle functions
  const toggleCategory = (category: string) => {
    const newCategories = new Set(activeCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setActiveCategories(newCategories);
  };

  // Handle street view opening
  const handleViewStreetView = (lat: number, lng: number) => {
    setStreetViewLocation({ lat, lng });
    setShowStreetViewModal(true);
    setShowReportsModal(false); // Close reports modal when opening street view
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'markers' ? 'heatmap' : 'markers');
  };

  const changeMapType = (type: 'roadmap' | 'satellite' | 'hybrid') => {
    setMapType(type);
    if (googleMapRef.current) {
      googleMapRef.current.setMapTypeId(type);
    }
  };

  // Clear markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  // Main map update effect
  useEffect(() => {
    if (!googleMapRef.current || !isMapLoaded) return;

    clearMarkers();
    updateHeatmapLayers();

    // Add current location marker with enhanced styling
    if (currentLocation) {
      const currentMarker = new (window as any).google.maps.Marker({
        position: { lat: currentLocation.lat, lng: currentLocation.lng },
        map: googleMapRef.current,
        title: 'Recording Location',
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#16a34a', // Green to match recorded indicator
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 4,
        },
        animation: (window as any).google.maps.Animation.BOUNCE,
      });

      // Add info window for current location
      const locationInfoWindow = new (window as any).google.maps.InfoWindow({
        content: `
          <div class="p-3 text-center">
            <div class="flex items-center gap-2 justify-center mb-2">
              <div class="w-3 h-3 bg-green-600 rounded-full"></div>
              <strong class="text-green-600">RECORDING LOCATION</strong>
            </div>
            <p class="text-sm text-gray-600">Video footage was recorded from this location</p>
            <p class="text-xs text-gray-500 mt-1">
              ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}
            </p>
          </div>
        `
      });

      currentMarker.addListener('click', () => {
        locationInfoWindow.open(googleMapRef.current, currentMarker);
      });

      // Stop animation after 3 seconds but keep the special styling
      setTimeout(() => {
        currentMarker.setAnimation(null);
      }, 3000);

      markersRef.current.push(currentMarker);
    }

  }, [detections, currentLocation, isMapLoaded, viewMode]);

  // Update heatmap when activeCategories changes
  useEffect(() => {
    updateHeatmapLayers();
  }, [activeCategories, viewMode, isMapLoaded]);

  console.log('InteractiveMap rendering', { detections, gpsTrail, currentLocation, isMapLoaded });

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-4 border-b bg-civic-navy text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Live Monitoring Map</h3>
            <p className="text-sm text-civic-gold-light">Real-time detection tracking</p>
          </div>
          
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={viewMode === 'heatmap' ? 'secondary' : 'ghost'}
              onClick={toggleViewMode}
              className="text-white hover:bg-white/20 h-8"
              title={viewMode === 'heatmap' ? 'Switch to Markers' : 'Switch to Heatmap'}
            >
              {viewMode === 'heatmap' ? '🔥' : '📍'}
            </Button>
            
            <Button
              size="sm"
              variant={mapType === 'roadmap' ? 'secondary' : 'ghost'}
              onClick={() => changeMapType('roadmap')}
              className="text-white hover:bg-white/20 h-8"
            >
              <Navigation className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant={mapType === 'satellite' ? 'secondary' : 'ghost'}
              onClick={() => changeMapType('satellite')}
              className="text-white hover:bg-white/20 h-8"
            >
              <Satellite className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant={mapType === 'hybrid' ? 'secondary' : 'ghost'}
              onClick={() => changeMapType('hybrid')}
              className="text-white hover:bg-white/20 h-8"
            >
              <Layers className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="relative h-[500px]">
        <div ref={mapRef} className="w-full h-full" />
        
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-civic-gray">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-navy mx-auto mb-4"></div>
              <p className="text-civic-navy">Loading map...</p>
            </div>
          </div>
        )}
        
        {/* Compact Heatmap Controls */}
        {viewMode === 'heatmap' && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-2 rounded-lg shadow-lg z-10 max-w-xs">
            <h4 className="text-xs font-semibold mb-2 text-civic-navy">Heatmap Layers</h4>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(heatmapCategories).map(([key, config]) => (
                <label 
                  key={key}
                  className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-1 rounded text-xs"
                >
                  <input
                    type="checkbox"
                    checked={activeCategories.has(key)}
                    onChange={() => toggleCategory(key)}
                    className="rounded border-gray-300 w-3 h-3"
                  />
                  <span className="text-sm">{config.icon}</span>
                  <span className="text-xs text-gray-700 leading-tight">{config.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Click anywhere to view reports
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg z-10">
          <h4 className="text-sm font-semibold mb-2">
            {viewMode === 'heatmap' ? 'Heatmap Legend' : 'Detection Types'}
          </h4>
          <div className="space-y-1 text-xs">
            {viewMode === 'heatmap' ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-gradient-to-r from-transparent to-red-500"></div>
                  <span>Litter/Trash</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-gradient-to-r from-transparent to-orange-500"></div>
                  <span>Graffiti</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-gradient-to-r from-transparent to-yellow-500"></div>
                  <span>Infrastructure</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-gradient-to-r from-transparent to-purple-500"></div>
                  <span>Road Blocked</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Litter/Trash</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Graffiti</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span>Recording Location</span>
            </div>
          </div>
        </div>

        {/* Heatmap Reports Modal */}
        <HeatmapReportsModal
          isOpen={showReportsModal}
          onClose={() => setShowReportsModal(false)}
          reports={selectedReports}
          location={selectedLocation}
          category={selectedCategory}
          onViewStreetView={handleViewStreetView}
        />

        {/* Street View Modal */}
        <StreetViewModal
          isOpen={showStreetViewModal}
          onClose={() => setShowStreetViewModal(false)}
          lat={streetViewLocation?.lat || 0}
          lng={streetViewLocation?.lng || 0}
        />
      </div>
    </Card>
  );
};