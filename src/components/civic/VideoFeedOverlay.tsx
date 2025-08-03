import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center justify-between">
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
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-2">
          <RecordedVideoPlayer 
            currentLocation={currentLocation}
            locationAddress={locationAddress}
            submittedBy={submittedBy}
            submittedAt={submittedAt || new Date(Date.now() - 300000).toISOString()}
            className="h-full rounded-none border-none shadow-none"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};