import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, MapPin, Calendar, User } from 'lucide-react';

interface RecordedVideoPlayerProps {
  videoUrl?: string;
  currentLocation?: { lat: number; lng: number } | null;
  locationAddress?: string;
  submittedBy?: string;
  submittedAt?: string;
  className?: string;
}

export const RecordedVideoPlayer: React.FC<RecordedVideoPlayerProps> = ({ 
  videoUrl = "/api/placeholder/800/450", // Placeholder video
  currentLocation,
  locationAddress,
  submittedBy = "Civic Reporter #1247",
  submittedAt = new Date().toISOString(),
  className = "" 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSubmissionTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`relative overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Video Header with Submission Info */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            {/* Submission Status */}
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-civic-navy text-white">
                <Play className="h-3 w-3 mr-1" />
                Recorded Footage
              </Badge>
              <Badge variant="outline" className="bg-black/20 text-white border-white/30">
                <User className="h-3 w-3 mr-1" />
                {submittedBy}
              </Badge>
            </div>
            
            {/* Location & Time Info */}
            <div className="flex flex-col gap-1">
              {currentLocation && (
                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <MapPin className="h-4 w-4 text-civic-gold" />
                  <div className="text-white">
                    <p className="text-sm font-medium">Recorded at:</p>
                    <p className="text-xs text-civic-gold-light">
                      {locationAddress || `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg">
                <Calendar className="h-4 w-4 text-civic-gold" />
                <div className="text-white">
                  <p className="text-xs text-civic-gold-light">
                    Submitted {formatSubmissionTime(submittedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="w-full h-full min-h-[400px] bg-civic-navy relative group">
        {/* Placeholder Video Content */}
        <div className="absolute inset-0 bg-gradient-to-br from-civic-navy via-civic-blue-light to-civic-navy">
          {/* Simulated video content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Play className="h-12 w-12 text-civic-gold" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Civic Issue Recording</h3>
              <p className="text-sm text-civic-gold-light">
                {currentLocation 
                  ? `Footage from ${locationAddress?.split(',')[0] || 'location'}`
                  : 'User-submitted civic issue documentation'
                }
              </p>
            </div>
          </div>
          
          {/* Simulated street scene overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"></div>
          
          {/* Street elements simulation */}
          <div className="absolute bottom-16 left-8 w-4 h-8 bg-gray-600 rounded-t-lg opacity-60"></div>
          <div className="absolute bottom-16 right-12 w-6 h-12 bg-gray-500 rounded-t-lg opacity-60"></div>
          <div className="absolute bottom-8 left-1/3 w-2 h-6 bg-yellow-400 opacity-80"></div>
        </div>

        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <div className="flex-1 flex items-center gap-2">
              <span className="text-white text-sm">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-white text-sm">{formatTime(duration || 125)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recording Indicator */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          RECORDED
        </div>
      </div>
    </Card>
  );
};