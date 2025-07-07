import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';


// Define the map container style
const containerStyle = {
  width: '100%',
  height: '400px' // Adjust height as needed
};


import { useJsApiLoader } from '@react-google-maps/api';

function MapComponent({ origin, destination, personLocation, googleMapsApiKey }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
    id: 'google-map-script',
  });
  const [map, setMap] = useState(null);
  const personMarkerRef = useRef(null);

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
    // Create the person marker imperatively
    if (personLocation && mapInstance && !personMarkerRef.current) {
      personMarkerRef.current = new window.google.maps.Marker({
        position: personLocation,
        map: mapInstance,
        icon: {
          url: 'https://cdn-icons-png.flaticon.com/512/104/104992.png',
          scaledSize: new window.google.maps.Size(50, 50)
        },
        label: {
          text: 'You',
          color: 'black',
          fontWeight: 'bold',
        }
      });
    }
  }, [personLocation]);

  const onUnmount = useCallback(function callback() {
    setMap(null);
    if (personMarkerRef.current) {
      personMarkerRef.current.setMap(null);
      personMarkerRef.current = null;
    }
  }, []);

  // Update person marker position and pan map when personLocation changes
  useEffect(() => {
    if (personMarkerRef.current && personLocation) {
      personMarkerRef.current.setPosition(personLocation);
    } else if (map && personLocation && !personMarkerRef.current) {
      // If marker was not created yet (e.g. map loaded after personLocation), create it
      personMarkerRef.current = new window.google.maps.Marker({
        position: personLocation,
        map: map,
        icon: {
          url: 'https://cdn-icons-png.flaticon.com/512/104/104992.png',
          scaledSize: new window.google.maps.Size(50, 50)
        },
        label: {
          text: 'You',
          color: 'black',
          fontWeight: 'bold',
        }
      });
    }
    if (map && personLocation) {
      const bounds = map.getBounds();
      if (bounds && !bounds.contains(personLocation)) {
        map.panTo(personLocation);
      }
    }
  }, [personLocation, map]);

  // Fit bounds on initial load and whenever origin/destination change, but do not override user pan/zoom after initial fit
  const hasFitBounds = useRef(false);
  useEffect(() => {
    if (!map) return;
    if (!hasFitBounds.current && origin && destination) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(destination);
      map.fitBounds(bounds);
      hasFitBounds.current = true;
    } else if (!hasFitBounds.current && origin) {
      map.setCenter(origin);
      map.setZoom(13);
      hasFitBounds.current = true;
    } else if (!hasFitBounds.current && destination) {
      map.setCenter(destination);
      map.setZoom(13);
      hasFitBounds.current = true;
    }
  }, [map, origin, destination]);

  // Reset fit bounds if origin/destination change
  useEffect(() => {
    hasFitBounds.current = false;
  }, [origin, destination]);

  if (!isLoaded) return null;
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {origin && (
        <Marker
          position={origin}
          icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: { width: 40, height: 40}
          }}
          label={{
            text: 'Origin',
            color: 'white',
            fontWeight: 'bold',
          }}
        />
      )}
      {destination && (
        <Marker
          position={destination}
          icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: { width: 40, height: 40}
          }}
          label={{
            text: 'Dest.',
            color: 'white',
            fontWeight: 'bold',
          }}
        />
      )}
    </GoogleMap>
  );
}

export default React.memo(MapComponent);