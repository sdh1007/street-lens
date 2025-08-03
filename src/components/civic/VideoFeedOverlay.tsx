import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RecordedVideoPlayer } from './RecordedVideoPlayer';
import { X, Video, ChevronDown } from 'lucide-react';

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
    <div className={`fixed bottom-0 left-0 right-0 h-[50vh] bg-white shadow-2xl z-40 transform transition-transform duration-500 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'} animate-slide-in-right`}>
      <Card className="h-full rounded-t-xl rounded-b-none border-0 shadow-none">
        {/* Tab Bar Header */}
        <div className="p-4 border-b bg-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-civic-navy rounded-full"></div>
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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover-lift-modern rounded-full"
                title="Minimize video feed"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover-lift-modern"
                title="Close video feed"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Video Content */}
        <div className="p-4 h-[calc(50vh-120px)] overflow-hidden">
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
  );
};