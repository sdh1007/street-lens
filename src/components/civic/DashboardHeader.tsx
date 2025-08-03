import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Users, Wifi, WifiOff, Settings, Maximize2 } from 'lucide-react';

interface DashboardHeaderProps {
  streamStatus: 'connected' | 'offline' | 'connecting';
  viewerCount: number;
  participantCount: number;
  className?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  streamStatus,
  viewerCount,
  participantCount,
  className = ""
}) => {
  const getStatusInfo = () => {
    switch (streamStatus) {
      case 'connected':
        return {
          icon: <Wifi className="h-4 w-4" />,
          text: 'Live Stream Active',
          variant: 'default' as const,
          className: 'bg-success text-white'
        };
      case 'connecting':
        return {
          icon: <Wifi className="h-4 w-4 animate-pulse" />,
          text: 'Connecting...',
          variant: 'secondary' as const,
          className: 'bg-warning text-white'
        };
      default:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          text: 'Stream Offline',
          variant: 'outline' as const,
          className: 'bg-destructive text-white'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className={`${className}`}>
      <div className="p-6">
        <div className="flex justify-between items-center">
          {/* Title and Status */}
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-civic-navy">
                San Francisco Civic Monitor
              </h1>
              <p className="text-lg text-muted-foreground">
                Live Street Monitoring Dashboard
              </p>
            </div>
            
            <Badge className={statusInfo.className}>
              {statusInfo.icon}
              <span className="ml-2">{statusInfo.text}</span>
            </Badge>
          </div>

          {/* Stats and Controls */}
          <div className="flex items-center gap-4">
            {/* Live Statistics */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{viewerCount}</span>
                <span>viewers</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="font-medium">{participantCount}</span>
                <span>active</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Maximize2 className="h-4 w-4 mr-2" />
                Fullscreen
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Live Indicator Banner */}
        {streamStatus === 'connected' && (
          <div className="mt-4 p-3 bg-gradient-to-r from-live-pulse/20 to-civic-gold/20 rounded-lg border border-live-pulse/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-live-pulse rounded-full animate-pulse"></div>
                  <span className="font-medium text-civic-navy">LIVE MONITORING ACTIVE</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Real-time civic issue detection in progress
                </span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                San Francisco, CA • {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};