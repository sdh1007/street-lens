import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  location: { lat: number; lng: number } | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false
  } = options;

  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: false,
    isSupported: 'geolocation' in navigator
  });

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        isSupported: false
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const options: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge
    };

    const onSuccess = (position: GeolocationPosition) => {
      setState(prev => ({
        ...prev,
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        },
        error: null,
        isLoading: false
      }));
    };

    const onError = (error: GeolocationPositionError) => {
      let errorMessage = 'Unable to retrieve location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
    };

    if (watch) {
      const watchId = navigator.geolocation.watchPosition(
        onSuccess,
        onError,
        options
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    }
  }, [enableHighAccuracy, timeout, maximumAge, watch]);

  const clearLocation = useCallback(() => {
    setState(prev => ({
      ...prev,
      location: null,
      error: null,
      isLoading: false
    }));
  }, []);

  useEffect(() => {
    if (watch) {
      const cleanup = getCurrentPosition();
      return cleanup;
    }
  }, [getCurrentPosition, watch]);

  return {
    ...state,
    getCurrentPosition,
    clearLocation
  };
};