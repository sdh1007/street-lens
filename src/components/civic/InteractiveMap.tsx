import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Detection, GPSPoint } from '@/types/civic';

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
        return 'bg-red-500';
      case 'graffiti':
        return 'bg-orange-500';
      case 'infrastructure':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
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
        <h3 className="text-lg font-semibold">Live Monitoring Map</h3>
        <p className="text-sm text-civic-gold-light">Real-time detection tracking</p>
      </div>
      
      <div className="relative h-[500px] bg-gradient-to-br from-civic-gray to-slate-100">
        {/* Placeholder Map Interface */}
        <div 
          ref={mapRef}
          className="w-full h-full relative flex items-center justify-center bg-cover bg-center"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='%23e5e7eb' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grid)' /%3E%3C/svg%3E")`
          }}
        >
          {/* Map Overlay Content */}
          <div className="absolute inset-0 p-6">
            {/* San Francisco Map Representation */}
            <div className="w-full h-full relative">
              {/* City Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-gradient-to-br from-civic-navy/30 to-civic-blue-light/20 rounded-lg"></div>
              </div>
              
              {/* Street Grid Simulation */}
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={`h-${i}`}
                    className="absolute w-full h-px bg-civic-navy/20"
                    style={{ top: `${(i + 1) * 12}%` }}
                  />
                ))}
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={`v-${i}`}
                    className="absolute h-full w-px bg-civic-navy/20"
                    style={{ left: `${(i + 1) * 15}%` }}
                  />
                ))}
              </div>

              {/* Current Location Indicator */}
              {currentLocation && (
                <div 
                  className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                  style={{ 
                    left: '45%', 
                    top: '60%'
                  }}
                >
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                </div>
              )}

              {/* GPS Trail */}
              {gpsTrail.length > 1 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d="M 100 300 Q 200 250 300 280 T 500 300"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    fill="none"
                    opacity="0.7"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                </svg>
              )}

              {/* Detection Markers */}
              {detections.slice(0, 8).map((detection, index) => (
                <div
                  key={detection.id}
                  className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${20 + (index % 4) * 20}%`,
                    top: `${30 + Math.floor(index / 4) * 25}%`,
                  }}
                >
                  {/* Marker */}
                  <div className={`w-5 h-5 ${getDetectionColor(detection.type)} rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform`}>
                    <div className={`absolute inset-0 ${getDetectionColor(detection.type)} rounded-full animate-ping opacity-75`}></div>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {getDetectionTypeLabel(detection.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(detection.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2">{detection.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Confidence: {Math.round(detection.confidence * 100)}%</span>
                      <span>
                        {detection.location.lat.toFixed(4)}, {detection.location.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* San Francisco Label */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow">
                <h4 className="font-semibold text-civic-navy">San Francisco</h4>
                <p className="text-xs text-muted-foreground">Live Monitoring Area</p>
              </div>
            </div>
          </div>
        </div>
        
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

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <span className="text-lg font-bold">+</span>
          </button>
          <button className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
            <span className="text-lg font-bold">−</span>
          </button>
        </div>
      </div>
    </Card>
  );
};