import { useState, useEffect } from 'react';
import { Detection } from '@/types/civic';

interface SFServiceRequest {
  service_request_id: string;
  requested_datetime: string;
  status_description: string;
  service_name: string;
  service_subtype: string;
  service_details: string;
  address: string;
  lat: string;
  long: string;
  media_url?: {
    url: string;
  };
}

export const useSFCivicData = () => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapServiceToDetectionType = (serviceName: string, serviceSubtype: string): Detection['type'] => {
    const service = serviceName.toLowerCase();
    const subtype = serviceSubtype?.toLowerCase() || '';
    
    if (service.includes('graffiti') || subtype.includes('graffiti')) {
      return 'graffiti';
    }
    
    if (service.includes('cleaning') || service.includes('garbage') || 
        subtype.includes('litter') || subtype.includes('trash')) {
      return 'trash';
    }
    
    return 'infrastructure';
  };

  const transformSFDataToDetections = (data: SFServiceRequest[]): Detection[] => {
    return data
      .filter(item => item.lat && item.long && 
              parseFloat(item.lat) !== 0 && parseFloat(item.long) !== 0)
      .slice(0, 500) // Limit for performance
      .map(item => ({
        id: item.service_request_id,
        type: mapServiceToDetectionType(item.service_name, item.service_subtype),
        location: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.long)
        },
        confidence: item.status_description === 'Closed' ? 0.9 : 0.7,
        timestamp: item.requested_datetime,
        image: item.media_url?.url,
        description: `${item.service_name}: ${item.service_subtype || item.service_details || 'General service request'} at ${item.address}`
      }));
  };

  useEffect(() => {
    const fetchSFData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch recent data with limit
        const response = await fetch('https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=1000&$order=requested_datetime DESC');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: SFServiceRequest[] = await response.json();
        const transformedDetections = transformSFDataToDetections(data);
        
        setDetections(transformedDetections);
      } catch (err) {
        console.error('Error fetching SF civic data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch civic data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSFData();
  }, []);

  return { detections, isLoading, error };
};