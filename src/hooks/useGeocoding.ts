import { useState, useCallback } from 'react';

interface GeocodingResult {
  address: string;
  city: string;
  state: string;
  country: string;
  formatted: string;
}

interface GeocodingState {
  result: GeocodingResult | null;
  isLoading: boolean;
  error: string | null;
}

export const useGeocoding = () => {
  const [state, setState] = useState<GeocodingState>({
    result: null,
    isLoading: false,
    error: null
  });

  const geocodeLocation = useCallback(async (lat: number, lng: number) => {
    if (!(window as any).google?.maps) {
      setState(prev => ({ ...prev, error: 'Google Maps API not loaded' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      const latlng = { lat, lng };

      geocoder.geocode({ location: latlng }, (results: any[], status: string) => {
        if (status === 'OK' && results[0]) {
          const result = results[0];
          const components = result.address_components;
          
          // Extract address components
          let address = '';
          let city = '';
          let state = '';
          let country = '';

          components.forEach((component: any) => {
            const types = component.types;
            
            if (types.includes('street_number')) {
              address = component.long_name + ' ';
            }
            if (types.includes('route')) {
              address += component.long_name;
            }
            if (types.includes('locality') || types.includes('administrative_area_level_2')) {
              city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              state = component.short_name;
            }
            if (types.includes('country')) {
              country = component.long_name;
            }
          });

          // Create formatted address
          const formatted = result.formatted_address;
          
          setState({
            result: {
              address: address.trim() || 'Unknown Address',
              city: city || 'Unknown City',
              state: state || 'Unknown State',
              country: country || 'Unknown Country',
              formatted: formatted || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            },
            isLoading: false,
            error: null
          });
        } else {
          setState({
            result: null,
            isLoading: false,
            error: 'Address not found'
          });
        }
      });
    } catch (error) {
      setState({
        result: null,
        isLoading: false,
        error: 'Geocoding failed'
      });
    }
  }, []);

  const getShortAddress = (formatted: string) => {
    // Extract neighborhood/district and city from formatted address
    const parts = formatted.split(',');
    if (parts.length >= 2) {
      return `${parts[0].trim()}, ${parts[1].trim()}`;
    }
    return formatted;
  };

  return {
    ...state,
    geocodeLocation,
    getShortAddress
  };
};