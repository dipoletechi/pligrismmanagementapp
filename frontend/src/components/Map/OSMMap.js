import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Import CSS directly
import 'leaflet/dist/leaflet.css';

// Ensure CSS is loaded
if (typeof window !== 'undefined') {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
  link.crossOrigin = '';
  if (!document.querySelector('link[href*="leaflet.css"]')) {
    document.head.appendChild(link);
  }
}

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
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure the container is properly rendered
    const timer = setTimeout(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        try {
          console.log('Initializing map with container:', mapRef.current);
          console.log('Container dimensions:', {
            width: mapRef.current.offsetWidth,
            height: mapRef.current.offsetHeight
          });

          // Initialize map
          const map = L.map(mapRef.current, {
            center: [latitude, longitude],
            zoom: zoom,
            zoomControl: true,
            attributionControl: true
          });
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

            // Get address from coordinates using reverse geocoding
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
              .then(response => response.json())
              .then(data => {
                const address = data.display_name || '';
                const title = data.name || data.display_name?.split(',')[0] || 'Selected Location';
                
                // Call callback with coordinates, title, and address
                if (onLocationSelect) {
                  onLocationSelect(lat, lng, title, address);
                }
              })
              .catch(error => {
                console.log('Reverse geocoding failed:', error);
                // Still call callback with just coordinates if geocoding fails
                if (onLocationSelect) {
                  onLocationSelect(lat, lng);
                }
              });
          });

          // Trigger a resize event to ensure proper rendering
          setTimeout(() => {
            map.invalidateSize();
            setMapLoaded(true);
            console.log('Map loaded successfully');
          }, 200);

        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && latitude && longitude && mapLoaded) {
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
  }, [latitude, longitude, zoom, mapLoaded]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        setTimeout(() => {
          mapInstanceRef.current.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: height, 
        width: '100%',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#f5f5f5',
        position: 'relative',
        minHeight: '200px'
      }} 
    >
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#666',
          fontSize: '14px',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <div>Loading map...</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            If map doesn't load, please refresh the page
          </div>
        </div>
      )}
      
      {/* Fallback if Leaflet fails to load */}
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ color: '#666', fontSize: '14px' }}>
            Map loading failed. Please check your internet connection.
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default OSMMap;
