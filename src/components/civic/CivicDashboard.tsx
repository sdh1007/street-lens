import React, { useState, useEffect } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DailyVideoStream } from './DailyVideoStream';
import { InteractiveMap } from './InteractiveMap';
import { LiveDetectionFeed } from './LiveDetectionFeed';
import { LiveStatsPanel } from './LiveStatsPanel';
import { LiveStream, Detection, GPSPoint, StreamStats } from '@/types/civic';

export const CivicDashboard: React.FC = () => {
  // Mock data for demo
  const [mockDetections] = useState<Detection[]>([
    {
      id: '1',
      type: 'trash',
      location: { lat: 37.7749, lng: -122.4194 },
      confidence: 0.87,
      timestamp: new Date().toISOString(),
      description: 'Litter pile detected near bus stop'
    },
    {
      id: '2', 
      type: 'graffiti',
      location: { lat: 37.7849, lng: -122.4094 },
      confidence: 0.93,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      description: 'Unauthorized tagging on building wall'
    },
    {
      id: '3',
      type: 'infrastructure',
      location: { lat: 37.7649, lng: -122.4294 },
      confidence: 0.76,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      description: 'Damaged sidewalk requiring repair'
    }
  ]);

  const [mockStats] = useState<StreamStats>({
    totalDetections: 23,
    detectionsPerMinute: 2.1,
    topIssueType: 'trash',
    streamDuration: '02:34:12',
    currentLocation: 'Market Street, San Francisco'
  });

  const mockGpsTrail: GPSPoint[] = [
    { lat: 37.7749, lng: -122.4194, timestamp: new Date().toISOString() },
    { lat: 37.7759, lng: -122.4184, timestamp: new Date().toISOString() }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header - 10% */}
      <div className="h-[10vh] p-4">
        <DashboardHeader
          streamStatus="connected"
          viewerCount={1247}
          participantCount={3}
        />
      </div>

      {/* Main Content - 80% */}
      <div className="h-[70vh] p-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Video Stream - 60% */}
        <div className="lg:col-span-3">
          <DailyVideoStream
            roomUrl="https://demo.daily.co/room"
            className="h-full"
          />
        </div>

        {/* Map - 40% */}
        <div className="lg:col-span-2">
          <InteractiveMap
            detections={mockDetections}
            gpsTrail={mockGpsTrail}
            currentLocation={{ lat: 37.7749, lng: -122.4194 }}
            className="h-full"
          />
        </div>
      </div>

      {/* Bottom Section - 20% */}
      <div className="h-[20vh] p-4 space-y-4">
        {/* Live Stats */}
        <LiveStatsPanel
          stats={mockStats}
          connectionStatus="connected"
        />

        {/* Detection Feed */}
        <LiveDetectionFeed
          detections={mockDetections}
        />
      </div>
    </div>
  );
};