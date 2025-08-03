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
