export interface Detection {
  id: string;
  type: 'trash' | 'graffiti' | 'infrastructure';
  location: {
    lat: number;
    lng: number;
  };
  confidence: number;
  timestamp: string;
  image?: string;
  description: string;
}

export interface GPSPoint {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface StreamStats {
  totalDetections: number;
  detectionsPerMinute: number;
  topIssueType: string;
  streamDuration: string;
  currentLocation: string;
}

export interface LiveStream {
  id: string;
  status: 'live' | 'offline' | 'connecting';
  dailyRoomUrl: string;
  detections: Detection[];
  gpsTrail: GPSPoint[];
  stats: StreamStats;
}

export interface DailyCallState {
  callFrame: any;
  participants: any[];
  connectionState: 'new' | 'connecting' | 'connected' | 'error';
  error?: string;
}