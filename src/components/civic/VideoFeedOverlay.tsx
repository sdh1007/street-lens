import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RecordedVideoPlayer } from './RecordedVideoPlayer';
import { X, Video } from 'lucide-react';

interface VideoFeedOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: { lat: number; lng: number } | null;
  locationAddress?: string;
  submittedBy?: string;
  submittedAt?: string;
}

export const VideoFeedOverlay: React.FC<VideoFeedOverlayProps> = ({
  isOpen,
  onClose,
  currentLocation,
  locationAddress,
  submittedBy = "Civic Reporter #1247",
  submittedAt
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div className="fixed left-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out">
        <Card className="h-full rounded-none border-0 shadow-none">
          {/* Header */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-civic-navy" />
                <div>
                  <h2 className="text-lg font-bold text-civic-navy">
                    Live Video Feed
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Civic Issue Video Analysis Dashboard
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
            </div>
          </div>

          {/* Video Content */}
          <div className="p-4 h-[calc(100vh-120px)] overflow-hidden">
            <RecordedVideoPlayer 
              currentLocation={currentLocation}
              locationAddress={locationAddress}
              submittedBy={submittedBy}
              submittedAt={submittedAt || new Date(Date.now() - 300000).toISOString()}
              className="h-full rounded-lg border shadow-sm"
            />
          </div>
        </Card>
      </div>
    </>
  );
};