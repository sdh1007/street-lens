import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Detection, GPSPoint } from '@/types/civic';
import { MapPin, Layers, Satellite, Navigation, Eye, Maximize2, Minimize2, Edit3, Square, Route, MapPinIcon, Trash2, Undo2, Redo2, Palette, Settings, X } from 'lucide-react';
import { HeatmapReportsModal } from './HeatmapReportsModal';
import { StreetViewModal } from './StreetViewModal';

interface InteractiveMapProps {
  detections: Detection[];
  gpsTrail: GPSPoint[];
  currentLocation?: { lat: number; lng: number };
  className?: string;
  showPastCases?: boolean;
  onTogglePastCases?: (showPast: boolean) => void;
  isMapFullscreen?: boolean;
  onToggleFullscreen?: (fullscreen: boolean) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  detections,
  gpsTrail,
  currentLocation,
  className = "",
  showPastCases = false,
  onTogglePastCases,
  isMapFullscreen = false,
  onToggleFullscreen
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const streetViewRef2 = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const heatmapLayers = useRef<{ [key: string]: any }>({});
  const drawingManagerRef = useRef<any>(null);
  const drawnShapesRef = useRef<any[]>([]);
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
  const [streetViewSource, setStreetViewSource] = useState<'map' | 'reports'>('map');
  const [drawingMode, setDrawingMode] = useState<'none' | 'polygon' | 'polyline' | 'marker'>('none');
  const [drawingType, setDrawingType] = useState<'concern' | 'route'>('concern');
  const [drawingHistory, setDrawingHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [isDrawingPanelOpen, setIsDrawingPanelOpen] = useState(false);

  // Comprehensive rainbow color palette with full spectrum diversity
  const rainbowColors = [
    // Reds & Pinks
    '#ff0000', '#dc143c', '#b22222', '#8b0000', '#ff1493', '#ff69b4', '#ff6347', '#ff4500',
    // Oranges & Corals
    '#ffa500', '#ff8c00', '#ff7f50', '#ff6347', '#ffd700', '#ffb347', '#ff9500', '#e67e22',
    // Yellows & Golds
    '#ffff00', '#ffd700', '#ffeb3b', '#fff44f', '#f1c40f', '#f39c12', '#e74c3c', '#d4af37',
    // Greens
    '#00ff00', '#32cd32', '#228b22', '#006400', '#00ff7f', '#00fa9a', '#7cfc00', '#9acd32',
    '#90ee90', '#98fb98', '#2e8b57', '#3cb371', '#20b2aa', '#008b8b', '#008080', '#00ced1',
    // Blues & Cyans
    '#0000ff', '#4169e1', '#1e90ff', '#00bfff', '#87ceeb', '#87cefa', '#6495ed', '#4682b4',
    '#5f9ea0', '#483d8b', '#191970', '#000080', '#00008b', '#0047ab', '#002fa7', '#003366',
    // Purples & Violets
    '#8a2be2', '#9400d3', '#9932cc', '#ba55d3', '#da70d6', '#dda0dd', '#ee82ee', '#ff00ff',
    '#c71585', '#db7093', '#663399', '#6a0dad', '#7b68ee', '#9370db', '#8b008b', '#800080',
    // Browns & Earth Tones
    '#8b4513', '#a0522d', '#cd853f', '#daa520', '#b8860b', '#d2691e', '#bc8f8f', '#f4a460',
    // Grays & Neutrals
    '#000000', '#2f2f2f', '#696969', '#808080', '#a9a9a9', '#c0c0c0', '#d3d3d3', '#ffffff',
    // Vibrant & Neon Colors
    '#00ffff', '#ff00ff', '#00ff00', '#ffff00', '#ff0080', '#80ff00', '#0080ff', '#8000ff',
    // Pastel Colors
    '#ffb3e6', '#b3d9ff', '#b3ffb3', '#ffffb3', '#ffccb3', '#e6b3ff', '#d9ffb3', '#ffb3d9',
    // Additional Unique Colors
    '#40e0d0', '#48d1cc', '#00ced1', '#5f9ea0', '#008b8b', '#2f4f4f', '#708090', '#778899'
  ];

  const drawingColors = {
    concern: rainbowColors.slice(0, Math.ceil(rainbowColors.length / 2)), // First half
    route: rainbowColors.slice(Math.ceil(rainbowColors.length / 2))      // Second half
  };

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
      
      // Initialize Drawing Manager
      if ((window as any).google?.maps?.drawing) {
        initializeDrawingManager(map);
      }
      
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

  // Initialize Drawing Manager with enhanced options
  const initializeDrawingManager = (map: any) => {
    const drawingManager = new (window as any).google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        fillColor: selectedColor,
        fillOpacity: 0.35,
        strokeWeight: 3,
        strokeColor: selectedColor,
        clickable: true,
        editable: true,
        draggable: true, // Make polygons draggable
        zIndex: 1
      },
      polylineOptions: {
        strokeColor: selectedColor,
        strokeOpacity: 1.0,
        strokeWeight: 4,
        clickable: true,
        editable: true,
        draggable: true, // Make polylines draggable
        zIndex: 1
      },
      markerOptions: {
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: selectedColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        draggable: true // Markers are already draggable
      }
    });

    drawingManager.setMap(map);
    drawingManagerRef.current = drawingManager;

    // Handle drawing completion with enhanced features
    (window as any).google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: any) => {
      const shape = event.overlay;
      const type = event.type;
      
      // Store the shape with enhanced metadata
      const shapeData = {
        shape,
        type,
        category: drawingType,
        color: selectedColor,
        timestamp: new Date().toISOString(),
        id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Add to drawing history for undo functionality
      setDrawingHistory(prev => [...prev, shapeData]);
      setRedoStack([]); // Clear redo stack on new action
      
      drawnShapesRef.current.push(shapeData);

      // Enhanced click listener for info window with better styling and drag functionality
      const infoWindow = new (window as any).google.maps.InfoWindow();
      
      (window as any).google.maps.event.addListener(shape, 'click', (clickEvent: any) => {
        const content = `
          <div class="p-4 min-w-[200px]">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-4 h-4 rounded-full" style="background-color: ${selectedColor}"></div>
              <span class="text-lg">${drawingType === 'concern' ? '⚠️' : '🗺️'}</span>
              <strong class="text-lg">${drawingType === 'concern' ? 'Area of Concern' : 'Planned Route'}</strong>
            </div>
            <div class="space-y-2">
              <p class="text-sm text-gray-600">
                <strong>Type:</strong> ${type === 'polygon' ? 'Area marker' : type === 'polyline' ? 'Route path' : 'Point marker'}
              </p>
              <p class="text-xs text-gray-500">
                <strong>Created:</strong> ${new Date(shapeData.timestamp).toLocaleString()}
              </p>
              <div class="bg-blue-50 p-2 rounded text-xs text-blue-700 mb-2">
                💡 <strong>Tip:</strong> This shape is draggable! ${type === 'polygon' || type === 'polyline' ? 'You can also edit individual points.' : ''}
              </div>
              <div class="flex gap-2 mt-3">
                <button onclick="window.toggleDrag('${shapeData.id}')" 
                        class="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors">
                  🔄 Toggle Drag
                </button>
                <button onclick="window.deleteShape('${shapeData.id}')" 
                        class="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors">
                  🗑️ Delete
                </button>
                <button onclick="window.editShape('${shapeData.id}')" 
                        class="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors">
                  ✏️ Edit Points
                </button>
              </div>
            </div>
          </div>
        `;
        
        infoWindow.setContent(content);
        if (type === 'marker') {
          infoWindow.open(map, shape);
        } else {
          infoWindow.setPosition(clickEvent.latLng || shape.getPath().getAt(0));
          infoWindow.open(map);
        }
      });

      // Reset drawing mode after completion
      setDrawingMode('none');
      drawingManager.setDrawingMode(null);
    });
    
    // Add enhanced global functions for shape management
    (window as any).deleteShape = (shapeId: string) => {
      const shapeIndex = drawnShapesRef.current.findIndex(s => s.id === shapeId);
      if (shapeIndex !== -1) {
        const shapeData = drawnShapesRef.current[shapeIndex];
        shapeData.shape.setMap(null);
        drawnShapesRef.current.splice(shapeIndex, 1);
        setDrawingHistory(prev => prev.filter(h => h.id !== shapeId));
      }
    };
    
    (window as any).toggleDrag = (shapeId: string) => {
      const shapeData = drawnShapesRef.current.find(s => s.id === shapeId);
      if (shapeData && shapeData.shape) {
        const currentDraggable = shapeData.shape.getDraggable ? shapeData.shape.getDraggable() : shapeData.shape.draggable;
        shapeData.shape.setDraggable(!currentDraggable);
        
        // Visual feedback
        if (!currentDraggable) {
          // Enable drag mode - add visual indicator
          shapeData.shape.setOptions({
            strokeWeight: shapeData.shape.strokeWeight ? shapeData.shape.strokeWeight + 2 : 5,
            strokeOpacity: 0.8
          });
        } else {
          // Disable drag mode - restore original styling
          shapeData.shape.setOptions({
            strokeWeight: shapeData.shape.strokeWeight ? shapeData.shape.strokeWeight - 2 : 3,
            strokeOpacity: 1.0
          });
        }
      }
    };

    (window as any).editShape = (shapeId: string) => {
      const shapeData = drawnShapesRef.current.find(s => s.id === shapeId);
      if (shapeData) {
        const isEditable = shapeData.shape.getEditable ? shapeData.shape.getEditable() : false;
        shapeData.shape.setEditable(!isEditable);
        
        // Auto-hide editing after 10 seconds
        if (!isEditable) {
          setTimeout(() => {
            if (shapeData.shape) {
              shapeData.shape.setEditable(false);
            }
          }, 10000);
        }
      }
    };
  };

  // Drawing control functions
  const toggleDrawingMode = (mode: 'polygon' | 'polyline' | 'marker') => {
    if (!drawingManagerRef.current) return;
    
    if (drawingMode === mode) {
      // Turn off drawing
      setDrawingMode('none');
      drawingManagerRef.current.setDrawingMode(null);
    } else {
      // Turn on drawing
      setDrawingMode(mode);
      const drawingModeMap = {
        polygon: (window as any).google.maps.drawing.OverlayType.POLYGON,
        polyline: (window as any).google.maps.drawing.OverlayType.POLYLINE,
        marker: (window as any).google.maps.drawing.OverlayType.MARKER
      };
      drawingManagerRef.current.setDrawingMode(drawingModeMap[mode]);
      
      // Update drawing options based on current type
      updateDrawingOptions();
    }
  };

  const updateDrawingOptions = () => {
    if (!drawingManagerRef.current) return;
    
    drawingManagerRef.current.setOptions({
      polygonOptions: {
        fillColor: selectedColor,
        fillOpacity: 0.35,
        strokeWeight: 3,
        strokeColor: selectedColor,
        clickable: true,
        editable: true,
        draggable: true,
        zIndex: 1
      },
      polylineOptions: {
        strokeColor: selectedColor,
        strokeOpacity: 1.0,
        strokeWeight: 4,
        clickable: true,
        editable: true,
        draggable: true,
        zIndex: 1
      },
      markerOptions: {
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: selectedColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        draggable: true
      }
    });
  };

  // Undo/Redo functionality
  const undoLastDrawing = () => {
    if (drawingHistory.length === 0) return;
    
    const lastDrawing = drawingHistory[drawingHistory.length - 1];
    lastDrawing.shape.setMap(null);
    
    setDrawingHistory(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, lastDrawing]);
    drawnShapesRef.current = drawnShapesRef.current.filter(s => s.id !== lastDrawing.id);
  };

  const redoLastDrawing = () => {
    if (redoStack.length === 0) return;
    
    const lastRedoItem = redoStack[redoStack.length - 1];
    lastRedoItem.shape.setMap(googleMapRef.current);
    
    setRedoStack(prev => prev.slice(0, -1));
    setDrawingHistory(prev => [...prev, lastRedoItem]);
    drawnShapesRef.current.push(lastRedoItem);
  };

  const clearAllDrawings = () => {
    drawnShapesRef.current.forEach(({ shape }) => {
      shape.setMap(null);
    });
    drawnShapesRef.current = [];
    setDrawingHistory([]);
    setRedoStack([]);
    setDrawingMode('none');
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null);
    }
  };

  const toggleDrawingType = () => {
    setDrawingType(prev => prev === 'concern' ? 'route' : 'concern');
    // Update color to match new type
    const newColors = drawingColors[drawingType === 'concern' ? 'route' : 'concern'];
    setSelectedColor(newColors[0]);
  };

  // Update drawing options when type or color changes
  useEffect(() => {
    updateDrawingOptions();
  }, [drawingType, selectedColor]);

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
    
    // Track if this was opened from reports modal
    if (showReportsModal) {
      setStreetViewSource('reports');
      setShowReportsModal(false); // Close reports modal when opening street view
    } else {
      setStreetViewSource('map');
    }
  };

  // Handle going back from street view
  const handleBackFromStreetView = () => {
    setShowStreetViewModal(false);
    
    // If we came from reports modal, reopen it
    if (streetViewSource === 'reports') {
      setShowReportsModal(true);
    }
    // If we came from map, just stay on map (modal is already closed)
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

  return (
    <Card className={`overflow-hidden shadow-xl ${className} transition-all duration-300 ease-in-out`}>
      {/* Enhanced Header */}
      <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-civic-navy via-civic-blue-light to-civic-navy text-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-semibold tracking-tight">Live Monitoring Map</h3>
            <p className="text-sm text-civic-gold-light font-medium">Real-time detection tracking</p>
          </div>
          
            {/* Enhanced Map Controls */}
            <div className="flex flex-wrap gap-1">
            {/* Enhanced Drawing Tools */}
            <div className="flex gap-1 border-r border-white/20 pr-1 mr-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDrawingPanelOpen(!isDrawingPanelOpen)}
                className="text-white hover:bg-white/20 h-8 px-2 hover-lift focus-ring"
                title="Drawing Tools"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline text-xs">Draw</span>
              </Button>
              
              {drawingHistory.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={undoLastDrawing}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 hover-lift focus-ring"
                  title="Undo Last Drawing"
                >
                  <Undo2 className="h-3 w-3" />
                </Button>
              )}
              
              {redoStack.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={redoLastDrawing}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 hover-lift focus-ring"
                  title="Redo Last Drawing"
                >
                  <Redo2 className="h-3 w-3" />
                </Button>
              )}
              
              {drawnShapesRef.current.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearAllDrawings}
                  className="text-white hover:bg-red-500/20 h-8 w-8 p-0 hover-lift focus-ring"
                  title="Clear All Drawings"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button
              size="sm"
              variant={viewMode === 'heatmap' ? 'secondary' : 'ghost'}
              onClick={toggleViewMode}
              className="text-white hover:bg-white/20 h-8 px-3 hover-lift focus-ring"
              title={viewMode === 'heatmap' ? 'Switch to Markers' : 'Switch to Heatmap'}
            >
              <span className="text-sm mr-1.5">{viewMode === 'heatmap' ? '🔥' : '📍'}</span>
              <span className="hidden sm:inline text-xs">
                {viewMode === 'heatmap' ? 'Heatmap' : 'Markers'}
              </span>
            </Button>
            
            {/* Past/Current Toggle */}
            {onTogglePastCases && (
              <Button
                size="sm"
                variant={showPastCases ? 'secondary' : 'ghost'}
                onClick={() => onTogglePastCases(!showPastCases)}
                className="text-white hover:bg-white/20 h-8 px-3 hover-lift focus-ring"
                title={showPastCases ? 'Show Current Cases' : 'Show Past Cases'}
              >
                <span className="text-sm mr-1.5">{showPastCases ? '📚' : '🔄'}</span>
                <span className="hidden sm:inline text-xs">
                  {showPastCases ? 'Past' : 'Current'}
                </span>
              </Button>
            )}
            
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onToggleFullscreen?.(!isMapFullscreen)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0 hover-lift focus-ring"
                title={isMapFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isMapFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
            </div>
            
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={mapType === 'roadmap' ? 'secondary' : 'ghost'}
                onClick={() => changeMapType('roadmap')}
                className="text-white hover:bg-white/20 h-8 w-8 p-0 hover-lift focus-ring"
                title="Road Map"
              >
                <Navigation className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant={mapType === 'satellite' ? 'secondary' : 'ghost'}
                onClick={() => changeMapType('satellite')}
                className="text-white hover:bg-white/20 h-8 w-8 p-0 hover-lift focus-ring"
                title="Satellite View"
              >
                <Satellite className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant={mapType === 'hybrid' ? 'secondary' : 'ghost'}
                onClick={() => changeMapType('hybrid')}
                className="text-white hover:bg-white/20 h-8 w-8 p-0 hover-lift focus-ring"
                title="Hybrid View"
              >
                <Layers className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Map Container */}
      <div className="relative h-[500px] animate-fade-in">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Enhanced Loading State */}
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-civic-gray via-muted to-civic-gray">
            <div className="text-center p-6 animate-scale-in">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-navy mx-auto mb-4"></div>
                <div className="absolute inset-0 rounded-full h-12 w-12 border-2 border-civic-gold/20 animate-pulse mx-auto"></div>
              </div>
              <p className="text-civic-navy font-medium">Loading interactive map...</p>
              <p className="text-xs text-muted-foreground mt-1">Preparing San Francisco data</p>
            </div>
          </div>
        )}
        
        {/* Enhanced Drawing Panel */}
        {isDrawingPanelOpen && (
          <div className="absolute top-4 right-4 glass bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg z-20 w-80 animate-slide-in-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-civic-navy" />
                <h4 className="text-lg font-semibold text-civic-navy">Drawing Tools</h4>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDrawingPanelOpen(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Drawing Type Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Drawing Type</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={drawingType === 'concern' ? 'default' : 'outline'}
                  onClick={() => setDrawingType('concern')}
                  className="flex-1"
                >
                  <span className="mr-1">⚠️</span>
                  Concern
                </Button>
                <Button
                  size="sm"
                  variant={drawingType === 'route' ? 'default' : 'outline'}
                  onClick={() => setDrawingType('route')}
                  className="flex-1"
                >
                  <span className="mr-1">🗺️</span>
                  Route
                </Button>
              </div>
            </div>
            
            {/* Enhanced Color Selection with Full Rainbow Spectrum */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Color Palette</label>
              <div className="grid grid-cols-10 gap-1 max-h-40 overflow-y-auto p-2 border rounded bg-gray-50">
                {drawingColors[drawingType].map((color, index) => (
                  <button
                    key={color}
                    className={`w-5 h-5 rounded-full border transition-all hover:scale-125 hover:z-10 relative ${
                      selectedColor === color ? 'border-2 border-gray-900 ring-2 ring-blue-500 z-20' : 'border border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    title={`${color} (${index + 1}/${drawingColors[drawingType].length})`}
                  />
                ))}
              </div>
              
              {/* Color Categories for Easy Selection */}
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">Reds & Pinks</span>
                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">Oranges</span>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Yellows</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Greens</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Blues</span>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">Purples</span>
              </div>
              
              {/* Custom Color Input */}
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs text-gray-600">Custom:</label>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                  title="Choose any custom color"
                />
                <span className="text-xs text-gray-500 ml-1 font-mono">{selectedColor.toUpperCase()}</span>
              </div>
            </div>
            
            {/* Drawing Tools */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tools</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant={drawingMode === 'polygon' ? 'default' : 'outline'}
                  onClick={() => toggleDrawingMode('polygon')}
                  className="flex flex-col items-center py-3 h-auto"
                >
                  <Square className="h-4 w-4 mb-1" />
                  <span className="text-xs">Area</span>
                </Button>
                <Button
                  size="sm"
                  variant={drawingMode === 'polyline' ? 'default' : 'outline'}
                  onClick={() => toggleDrawingMode('polyline')}
                  className="flex flex-col items-center py-3 h-auto"
                >
                  <Route className="h-4 w-4 mb-1" />
                  <span className="text-xs">Route</span>
                </Button>
                <Button
                  size="sm"
                  variant={drawingMode === 'marker' ? 'default' : 'outline'}
                  onClick={() => toggleDrawingMode('marker')}
                  className="flex flex-col items-center py-3 h-auto"
                >
                  <MapPinIcon className="h-4 w-4 mb-1" />
                  <span className="text-xs">Marker</span>
                </Button>
              </div>
            </div>
            
            {/* Enhanced Drawing Stats & Actions */}
            <div className="border-t pt-3">
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                <div className="text-center">
                  <div className="font-semibold text-lg">{drawnShapesRef.current.length}</div>
                  <div className="text-xs">Drawings</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{drawingHistory.length}</div>
                  <div className="text-xs">History</div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 mb-3">
                💡 <strong>Pro Tips:</strong><br/>
                • All shapes are draggable by default<br/>
                • Click shapes to toggle drag mode<br/>
                • Use edit mode to adjust points<br/>
                • Try the custom color picker!
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={undoLastDrawing}
                  disabled={drawingHistory.length === 0}
                  className="flex-1"
                >
                  <Undo2 className="h-3 w-3 mr-1" />
                  Undo
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={redoLastDrawing}
                  disabled={redoStack.length === 0}
                  className="flex-1"
                >
                  <Redo2 className="h-3 w-3 mr-1" />
                  Redo
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={clearAllDrawings}
                  disabled={drawnShapesRef.current.length === 0}
                  className="flex-1"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Drawing Mode Indicator */}
        {drawingMode !== 'none' && !isDrawingPanelOpen && (
          <div className="absolute top-4 left-4 glass bg-blue-600/95 backdrop-blur-sm p-3 rounded-xl shadow-lg z-20 animate-scale-in">
            <div className="flex items-center gap-2 text-white">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedColor }}
              />
              <Edit3 className="h-4 w-4" />
              <span className="text-sm font-medium">
                Drawing {drawingMode === 'polygon' ? 'Area' : drawingMode === 'polyline' ? 'Route' : 'Marker'}
              </span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">
                {drawingType === 'concern' ? 'Concern' : 'Route'}
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-1">
              {drawingMode === 'polygon' ? 'Click to create area boundary' : 
               drawingMode === 'polyline' ? 'Click to create route path' : 
               'Click to place marker'}
            </p>
          </div>
        )}

        {/* Enhanced Heatmap Controls */}
        {viewMode === 'heatmap' && (
          <div className="absolute top-4 left-4 glass bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg z-10 max-w-xs animate-slide-in-right">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-civic-gold rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-civic-navy">🔥</span>
              </div>
              <h4 className="text-sm font-semibold text-civic-navy">Heatmap Layers</h4>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(heatmapCategories).map(([key, config]) => (
                <label 
                  key={key}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={activeCategories.has(key)}
                    onChange={() => toggleCategory(key)}
                    className="rounded border-gray-300 w-4 h-4 text-civic-gold focus:ring-civic-gold focus:ring-2"
                  />
                  <span className="text-base group-hover:scale-110 transition-transform">{config.icon}</span>
                  <span className="text-sm text-gray-700 font-medium flex-1">{config.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-civic-navy">
                <MapPin className="h-3 w-3" />
                <p className="text-xs font-medium">
                  Click anywhere to view reports
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Legend */}
        <div className="absolute bottom-4 right-4 glass bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg z-10 min-w-[200px] animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-civic-navy" />
            <h4 className="text-sm font-semibold text-civic-navy">
              {viewMode === 'heatmap' ? 'Heatmap Legend' : 'Detection Types'}
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            {viewMode === 'heatmap' ? (
              <>
                <div className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded transition-colors">
                  <div className="w-6 h-3 bg-gradient-to-r from-transparent via-red-400 to-red-600 rounded-sm shadow-sm"></div>
                  <span className="font-medium">Litter/Trash</span>
                </div>
                <div className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded transition-colors">
                  <div className="w-6 h-3 bg-gradient-to-r from-transparent via-orange-400 to-orange-600 rounded-sm shadow-sm"></div>
                  <span className="font-medium">Graffiti</span>
                </div>
                <div className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded transition-colors">
                  <div className="w-6 h-3 bg-gradient-to-r from-transparent via-yellow-400 to-yellow-600 rounded-sm shadow-sm"></div>
                  <span className="font-medium">Infrastructure</span>
                </div>
                <div className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded transition-colors">
                  <div className="w-6 h-3 bg-gradient-to-r from-transparent via-purple-400 to-purple-600 rounded-sm shadow-sm"></div>
                  <span className="font-medium">Road Blocked</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded transition-colors">
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Litter/Trash</span>
                </div>
                <div className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded transition-colors">
                  <div className="w-4 h-4 bg-orange-500 rounded-full shadow-sm"></div>
                  <span className="font-medium">Graffiti</span>
                </div>
              </>
            )}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded transition-colors">
                <div className="w-4 h-4 bg-green-600 rounded-full shadow-sm live-pulse"></div>
                <span className="font-medium text-green-700">Recording Location</span>
              </div>
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
          showBackButton={true}
          onBackToReport={handleBackFromStreetView}
        />
      </div>
    </Card>
  );
};