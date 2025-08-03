import React, { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Minimize2, Volume2, VolumeX, Users, Wifi, WifiOff } from 'lucide-react';
import { DailyCallState } from '@/types/civic';

interface DailyVideoStreamProps {
  roomUrl: string;
  className?: string;
}

export const DailyVideoStream: React.FC<DailyVideoStreamProps> = ({ 
  roomUrl, 
  className = "" 
}) => {
  const callFrameRef = useRef<any>(null);
  const [callState, setCallState] = useState<DailyCallState>({
    callFrame: null,
    participants: [],
    connectionState: 'new'
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // Initialize Daily call frame
    const initializeDaily = async () => {
      try {
        setCallState(prev => ({ ...prev, connectionState: 'connecting' }));
        
        const callFrame = DailyIframe.createCallObject({
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '8px'
          }
        });

        // Event listeners
        callFrame.on('joined-meeting', () => {
          setCallState(prev => ({ ...prev, connectionState: 'connected' }));
          // Disable camera and microphone for viewer mode
          callFrame.setLocalAudio(false);
          callFrame.setLocalVideo(false);
        });

        callFrame.on('participant-joined', (event: any) => {
          setCallState(prev => ({
            ...prev,
            participants: [...prev.participants, event.participant]
          }));
        });

        callFrame.on('participant-left', (event: any) => {
          setCallState(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.session_id !== event.participant.session_id)
          }));
        });

        callFrame.on('error', (event: any) => {
          setCallState(prev => ({ 
            ...prev, 
            connectionState: 'error',
            error: event.error?.message || 'Connection failed'
          }));
        });

        callFrameRef.current = callFrame;
        setCallState(prev => ({ ...prev, callFrame }));

        // Join the room
        await callFrame.join({ 
          url: roomUrl,
          userName: 'Civic Monitor Viewer'
        });

      } catch (error) {
        console.error('Failed to initialize Daily call:', error);
        setCallState(prev => ({ 
          ...prev, 
          connectionState: 'error',
          error: 'Failed to connect to stream'
        }));
      }
    };

    if (roomUrl) {
      initializeDaily();
    }

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy();
      }
    };
  }, [roomUrl]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleMute = () => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const getConnectionIcon = () => {
    switch (callState.connectionState) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-success" />;
      case 'connecting':
        return <Wifi className="h-4 w-4 text-warning animate-pulse" />;
      default:
        return <WifiOff className="h-4 w-4 text-destructive" />;
    }
  };

  const getConnectionText = () => {
    switch (callState.connectionState) {
      case 'connected':
        return 'Live Stream Active';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return callState.error || 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  return (
    <Card className={`relative overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Stream Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-civic-navy text-white">
              {getConnectionIcon()}
              <span className="ml-2">{getConnectionText()}</span>
            </Badge>
            {callState.connectionState === 'connected' && (
              <Badge variant="outline" className="bg-black/20 text-white border-white/30">
                <Users className="h-3 w-3 mr-1" />
                {callState.participants.length} participants
              </Badge>
            )}
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
      <div className="w-full h-full min-h-[400px] bg-civic-navy relative">
        {callState.connectionState === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-civic-navy">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-gold mx-auto mb-4"></div>
              <p className="text-lg">Connecting to live stream...</p>
            </div>
          </div>
        )}
        
        {callState.connectionState === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-civic-navy">
            <div className="text-center text-white">
              <WifiOff className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <p className="text-lg mb-2">Stream Unavailable</p>
              <p className="text-sm text-white/70">{callState.error}</p>
            </div>
          </div>
        )}

        {callState.connectionState === 'connected' && callState.participants.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-civic-navy">
            <div className="text-center text-white">
              <Users className="h-16 w-16 mx-auto mb-4 text-civic-gold" />
              <p className="text-lg">Waiting for stream to start...</p>
            </div>
          </div>
        )}

        {/* Daily iframe will be injected here */}
        <div 
          id="daily-iframe-container" 
          className="w-full h-full"
          ref={(el) => {
            if (el && callFrameRef.current && callState.connectionState === 'connected') {
              callFrameRef.current.iframe().style.width = '100%';
              callFrameRef.current.iframe().style.height = '100%';
              callFrameRef.current.iframe().style.borderRadius = '8px';
              if (!el.contains(callFrameRef.current.iframe())) {
                el.appendChild(callFrameRef.current.iframe());
              }
            }
          }}
        />
      </div>

      {/* Live Indicator */}
      {callState.connectionState === 'connected' && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-2 bg-live-pulse text-white px-3 py-1 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE
          </div>
        </div>
      )}
    </Card>
  );
};