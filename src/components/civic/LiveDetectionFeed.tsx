import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Detection } from '@/types/civic';
import { MapPin, Clock, Target } from 'lucide-react';

interface LiveDetectionFeedProps {
  detections: Detection[];
  className?: string;
}

export const LiveDetectionFeed: React.FC<LiveDetectionFeedProps> = ({
  detections,
  className = ""
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new detections arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [detections]);

  const getDetectionIcon = (type: Detection['type']) => {
    switch (type) {
      case 'trash':
        return '🗑️';
      case 'graffiti':
        return '🎨';
      case 'infrastructure':
        return '🏗️';
      default:
        return '📍';
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-destructive';
  };

  // Sort detections by timestamp (newest first)
  const sortedDetections = [...detections].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className={`${className}`}>
      <div className="p-4 border-b bg-civic-navy text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Live Detection Feed</h3>
            <p className="text-sm text-civic-gold-light">
              Recent detections • {detections.length} total
            </p>
          </div>
          <div className="flex items-center gap-2 text-civic-gold">
            <div className="w-2 h-2 bg-live-pulse rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">LIVE</span>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[200px]" ref={scrollAreaRef}>
        <div className="p-4 space-y-3">
          {sortedDetections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No detections yet</p>
              <p className="text-sm">Waiting for live stream data...</p>
            </div>
          ) : (
            sortedDetections.map((detection) => (
              <div
                key={detection.id}
                className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors animate-in slide-in-from-bottom-2"
              >
                {/* Detection Type Icon */}
                <div className={`w-8 h-8 rounded-full ${getDetectionColor(detection.type)} flex items-center justify-center text-white text-sm flex-shrink-0`}>
                  {getDetectionIcon(detection.type)}
                </div>

                {/* Detection Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="outline" className="text-xs">
                      {getDetectionTypeLabel(detection.type)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(detection.timestamp)}
                    </div>
                  </div>

                  <p className="text-sm text-foreground mb-2 line-clamp-2">
                    {detection.description}
                  </p>

                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {detection.location.lat.toFixed(4)}, {detection.location.lng.toFixed(4)}
                      </span>
                    </div>
                    <span className={`font-medium ${getConfidenceColor(detection.confidence)}`}>
                      {Math.round(detection.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>

                {/* Thumbnail Image */}
                {detection.image && (
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={detection.image}
                      alt="Detection"
                      className="w-full h-full object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};