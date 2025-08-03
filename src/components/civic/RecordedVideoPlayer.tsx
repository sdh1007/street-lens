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
    <Card className={`relative overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''} group`}>
      {/* Enhanced Video Header with Submission Info */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 via-black/60 to-transparent p-4 sm:p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-3 flex-1">
            {/* Submission Status */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge className="bg-civic-navy text-white hover:bg-civic-blue-light transition-colors">
                <Play className="h-3 w-3 mr-1.5" />
                Recorded Footage
              </Badge>
              <Badge variant="outline" className="glass-dark text-white border-white/30 hover:bg-white/10 transition-colors">
                <User className="h-3 w-3 mr-1.5" />
                {submittedBy}
              </Badge>
            </div>
            
            {/* Location & Time Info */}
            <div className="flex flex-col gap-2">
              {currentLocation && (
                <div className="flex items-start gap-3 glass-dark px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                  <MapPin className="h-4 w-4 text-civic-gold mt-0.5 flex-shrink-0" />
                  <div className="text-white flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1">Recorded at:</p>
                    <p className="text-xs text-civic-gold-light break-words">
                      {locationAddress || `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 glass-dark px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
                <Calendar className="h-4 w-4 text-civic-gold flex-shrink-0" />
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
              className="text-white hover:bg-white/20 hover-lift focus-ring h-9 w-9 p-0"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 hover-lift focus-ring h-9 w-9 p-0"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Video Container */}
      <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-civic-navy via-civic-blue-light to-civic-navy relative group">
        {/* Enhanced Placeholder Video Content */}
        <div className="absolute inset-0 bg-gradient-to-br from-civic-navy via-civic-blue-light to-civic-navy animate-fade-in">
          {/* Central Play Interface */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white animate-scale-in">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto hover-lift cursor-pointer group-hover:bg-white/30 transition-all duration-300 hover:animate-pulse-glow">
                <Play className="h-10 w-10 sm:h-12 sm:w-12 text-civic-gold ml-1" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 tracking-wide">Civic Issue Recording</h3>
              <p className="text-sm text-civic-gold-light max-w-xs mx-auto leading-relaxed">
                {currentLocation 
                  ? `Footage from ${locationAddress?.split(',')[0] || 'location'}`
                  : 'User-submitted civic issue documentation'
                }
              </p>
            </div>
          </div>
          
          {/* Enhanced street scene overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* More detailed street elements simulation */}
          <div className="absolute bottom-16 left-8 w-4 h-8 bg-gray-600 rounded-t-lg opacity-70 shadow-lg"></div>
          <div className="absolute bottom-16 right-12 w-6 h-12 bg-gray-500 rounded-t-lg opacity-70 shadow-lg"></div>
          <div className="absolute bottom-20 left-1/4 w-3 h-10 bg-gray-600 rounded-t-lg opacity-60"></div>
          <div className="absolute bottom-8 left-1/3 w-2 h-6 bg-yellow-400 opacity-90 shadow-sm animate-pulse"></div>
          <div className="absolute bottom-12 right-1/4 w-8 h-3 bg-white/40 rounded opacity-50"></div>
        </div>

        {/* Enhanced Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 hover-lift focus-ring h-10 w-10 p-0 rounded-full"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>
            
            <div className="flex-1 flex items-center gap-2 sm:gap-3">
              <span className="text-white text-xs sm:text-sm font-mono min-w-0">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative group/slider">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer hover:bg-white/30 transition-colors slider-thumb"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--civic-gold)) 0%, hsl(var(--civic-gold)) ${(currentTime / (duration || 100)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 100)) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>
              <span className="text-white text-xs sm:text-sm font-mono min-w-0">
                {formatTime(duration || 125)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Recording Indicator */}
      <div className="absolute top-4 right-4 z-20 animate-fade-in">
        <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-shadow live-pulse">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          RECORDED
        </div>
      </div>
    </Card>
  );
};