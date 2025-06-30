import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';


// Define the map container style
const containerStyle = {
  width: '100%',
  height: '800px' // Adjust height as needed
};


const defaultCenter = {
  lat: 43.6532, // Example: Toronto latitude
  lng: -79.3832 // Example: Toronto longitude
};


function MapComponent({ origin, destination, personLocation, googleMapsApiKey }) {
  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
    // You can set initial zoom or center here if needed,
    // though the 'center' prop already handles it.
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  // Calculate bounds to fit all markers on the map
  const getBounds = () => {
    const bounds = new window.google.maps.LatLngBounds();
    if (origin) bounds.extend(origin);
    if (destination) bounds.extend(destination);
    if (personLocation) bounds.extend(personLocation);
    return bounds;
  };

  // Pan and zoom the map to fit all markers
  React.useEffect(() => {
    if (map) {
      map.fitBounds(getBounds());
      // Adjust zoom level after fitting bounds if it's too close/far
      const listener = window.google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom() > 15) map.setZoom(15); // Don't zoom in too much
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [map, origin, destination, personLocation]);

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={personLocation || defaultCenter} // Center on person's location, or default if not available
        zoom={12} // Initial zoom level, will be adjusted by fitBounds
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {origin && (
          <Marker
            position={origin}
            icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png', // Green dot for origin
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
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png', // Red dot for destination
                scaledSize: { width: 40, height: 40}
            }}
            label={{
              text: 'Dest.',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        )}
        {personLocation && (
          <Marker
            position={personLocation}
            icon={{
            url: 'https://cdn-icons-png.flaticon.com/512/104/104992.png',
            scaledSize: { width: 50, height: 50 }}}
            label={{
                text: 'You',
                color: 'black',
                fontWeight: 'bold',
                className: 'marker-label-background' // Add a class for background styling if needed
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default React.memo(MapComponent);