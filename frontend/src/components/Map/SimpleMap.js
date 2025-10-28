import React, { useEffect, useRef, useState } from 'react';

const SimpleMap = ({ 
  latitude = 28.6139, 
  longitude = 77.2090, 
  onLocationSelect, 
  height = '300px',
  zoom = 10 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadMap = async () => {
      try {
        // Check if map is already initialized
        if (mapInstanceRef.current) {
          console.log('Map already initialized, skipping...');
          return;
        }

        // Check if component is still mounted
        if (!isMounted) return;

        // Dynamically import Leaflet
        const L = await import('leaflet');
        
        // Import CSS
        await import('leaflet/dist/leaflet.css');
        
        // Fix for default markers
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        });

        if (mapRef.current && isMounted) {
          // Wait for container to be ready
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Check again if component is still mounted
          if (!isMounted) return;

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

          // Store map instance
          mapInstanceRef.current = map;

          // Add OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
          }).addTo(map);

          // Add initial marker if coordinates are provided
          if (latitude && longitude) {
            const marker = L.marker([latitude, longitude]).addTo(map);
            markersRef.current.push(marker);
          }

          // Add click event to map
          map.on('click', (e) => {
            if (!isMounted) return;
            
            const { lat, lng } = e.latlng;
            
            // Clear existing markers
            markersRef.current.forEach(marker => {
              map.removeLayer(marker);
            });
            markersRef.current = [];
            
            // Add new marker
            const newMarker = L.marker([lat, lng]).addTo(map);
            markersRef.current.push(newMarker);

            // Get address from coordinates using reverse geocoding
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
              .then(response => response.json())
              .then(data => {
                if (!isMounted) return;
                
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
                if (onLocationSelect && isMounted) {
                  onLocationSelect(lat, lng);
                }
              });
          });

          // Trigger a resize event to ensure proper rendering
          setTimeout(() => {
            if (isMounted && mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
              setMapLoaded(true);
              console.log('Map loaded successfully');
            }
          }, 300);

        }
      } catch (error) {
        console.error('Error loading map:', error);
        if (isMounted) {
          setError(error.message);
        }
      }
    };

    loadMap();

    // Cleanup function
    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.log('Error removing map:', e);
        }
        mapInstanceRef.current = null;
        markersRef.current = [];
        setMapLoaded(false);
      }
    };
  }, []); // Empty dependency array to run only once

  // Update marker position when coordinates change (only if map is loaded)
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded && latitude && longitude) {
      const map = mapInstanceRef.current;
      
      // Clear existing markers
      markersRef.current.forEach(marker => {
        map.removeLayer(marker);
      });
      markersRef.current = [];

      // Add new marker
      import('leaflet').then(L => {
        if (mapInstanceRef.current) {
          const marker = L.marker([latitude, longitude]).addTo(map);
          markersRef.current.push(marker);
          // Update map view
          map.setView([latitude, longitude], zoom);
        }
      });
    }
  }, [latitude, longitude, zoom, mapLoaded]);

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
      {!mapLoaded && !error && (
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
            Please wait while the map loads
          </div>
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#d32f2f',
          fontSize: '14px',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <div>Map loading failed</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            Error: {error}
          </div>
          <button 
            onClick={() => {
              setError(null);
              setMapLoaded(false);
              // Force complete re-render
              window.location.reload();
            }} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default SimpleMap;