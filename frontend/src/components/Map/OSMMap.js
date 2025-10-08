import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const OSMMap = ({ 
  latitude = 28.6139, 
  longitude = 77.2090, 
  onLocationSelect, 
  height = '300px',
  zoom = 10 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapRef.current).setView([latitude, longitude], zoom);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Add initial marker if coordinates are provided
      if (latitude && longitude) {
        const marker = L.marker([latitude, longitude]).addTo(map);
        markerRef.current = marker;
      }

      // Add click event to map
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add new marker
        const newMarker = L.marker([lat, lng]).addTo(map);
        markerRef.current = newMarker;

        // Call callback with new coordinates
        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && latitude && longitude) {
      const map = mapInstanceRef.current;
      
      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }

      // Add new marker
      const marker = L.marker([latitude, longitude]).addTo(map);
      markerRef.current = marker;

      // Update map view
      map.setView([latitude, longitude], zoom);
    }
  }, [latitude, longitude, zoom]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: height, 
        width: '100%',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }} 
    />
  );
};

export default OSMMap;
