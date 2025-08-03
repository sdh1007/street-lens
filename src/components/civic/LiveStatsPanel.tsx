import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StreamStats } from '@/types/civic';
import { Activity, MapPin, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface LiveStatsPanelProps {
  stats: StreamStats;
  connectionStatus: 'connected' | 'connecting' | 'error' | 'new';
  className?: string;
}

export const LiveStatsPanel: React.FC<LiveStatsPanelProps> = ({
  stats,
  connectionStatus,
  className = ""
}) => {
  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge className="bg-success text-white">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            Live
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="secondary" className="bg-warning text-white">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            Connecting
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <div className="w-2 h-2 bg-muted-foreground rounded-full mr-2"></div>
            Offline
          </Badge>
        );
    }
  };

  const formatDetectionRate = (rate: number) => {
    if (rate === 0) return '0';
    if (rate < 0.1) return '<0.1';
    return rate.toFixed(1);
  };

  const getTopIssueIcon = (issueType: string) => {
    switch (issueType.toLowerCase()) {
      case 'trash':
      case 'litter':
        return '🗑️';
      case 'graffiti':
        return '🎨';
      case 'infrastructure':
        return '🏗️';
      default:
        return '📍';
    }
  };

  return (
    <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${className}`}>
      {/* Stream Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Activity className="h-5 w-5 text-civic-blue-light" />
          {getStatusBadge()}
        </div>
        <div>
          <p className="text-2xl font-bold text-civic-navy">{stats.streamDuration}</p>
          <p className="text-sm text-muted-foreground">Stream Duration</p>
        </div>
      </Card>

      {/* Total Detections */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <TrendingUp className="h-5 w-5 text-civic-gold" />
          <Badge variant="outline" className="text-xs">
            Total
          </Badge>
        </div>
        <div>
          <p className="text-2xl font-bold text-civic-navy">{stats.totalDetections}</p>
          <p className="text-sm text-muted-foreground">Detections</p>
        </div>
      </Card>

      {/* Detection Rate */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Activity className="h-5 w-5 text-info" />
          <Badge variant="outline" className="text-xs">
            Rate
          </Badge>
        </div>
        <div>
          <p className="text-2xl font-bold text-civic-navy">
            {formatDetectionRate(stats.detectionsPerMinute)}
          </p>
          <p className="text-sm text-muted-foreground">per minute</p>
        </div>
      </Card>

      {/* Top Issue Type */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg">{getTopIssueIcon(stats.topIssueType)}</span>
          <Badge variant="outline" className="text-xs">
            Top Issue
          </Badge>
        </div>
        <div>
          <p className="text-lg font-bold text-civic-navy capitalize">
            {stats.topIssueType || 'None'}
          </p>
          <p className="text-sm text-muted-foreground">Most detected</p>
        </div>
      </Card>

      {/* Current Location */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <MapPin className="h-5 w-5 text-civic-gold" />
          <Badge variant="outline" className="text-xs">
            Location
          </Badge>
        </div>
        <div>
          <p className="text-sm font-bold text-civic-navy line-clamp-2">
            {stats.currentLocation || 'San Francisco, CA'}
          </p>
          <p className="text-sm text-muted-foreground">Current area</p>
        </div>
      </Card>
    </div>
  );
};