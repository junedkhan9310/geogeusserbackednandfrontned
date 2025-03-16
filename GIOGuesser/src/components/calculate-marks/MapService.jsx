const MapService = {
  // Load Leaflet scripts and CSS
  loadLeaflet: async () => {
    return new Promise((resolve, reject) => {
      try {
        // Add CSS
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);
        
        // Add custom CSS to ensure our results card stays on top
        const customCSS = document.createElement('style');
        customCSS.textContent = `
          .leaflet-pane, .leaflet-top, .leaflet-bottom, .leaflet-control {
            z-index: 800 !important;
          }
          #results-card {
            z-index: 9999 !important;
          }
        `;
        document.head.appendChild(customCSS);
        
        // Add JS
        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        leafletScript.onload = resolve;
        leafletScript.onerror = reject;
        document.head.appendChild(leafletScript);
      } catch (err) {
        reject(err);
      }
    });
  },
  
  // Load locations from localStorage
  loadLocationsFromStorage: () => {
    try {
      // Get guessed location
      let guessedLocation = null;
      const guessedData = localStorage.getItem("guessedLocation");
      if (guessedData) {
        guessedLocation = JSON.parse(guessedData);
      }
      
      // Get correct location
      let correctLocation = null;
      const correctData = localStorage.getItem("mapCoordinatesBcknd");
      if (correctData) {
        correctLocation = JSON.parse(correctData);
      }
      
      return { guessedLocation, correctLocation };
    } catch (error) {
      console.error("Error loading locations from localStorage:", error);
      return { guessedLocation: null, correctLocation: null };
    }
  },
  
  // Initialize the map
  initializeMap: (mapContainer, guessedLocation, correctLocation) => {
    // Create map with lower zIndex for controls
    const map = L.map(mapContainer, {
      zoomControl: false  // Disable default zoom control
    }).setView([0, 0], 2);
    
    // Add zoom control at a different position to avoid overlap with results card
    L.control.zoom({
      position: 'topleft'
    }).addTo(map);
    
    // Use Stamen or CartoDB tile layer with English labels
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
    
    // Create custom icons
    const createCustomIcon = (color) => {
      return L.divIcon({
        html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>`,
        className: 'custom-div-icon',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
    };
    
    // Add markers
    L.marker([guessedLocation.lat, guessedLocation.lng], {
      icon: createCustomIcon('#FF6B00') // Orange
    }).addTo(map).bindPopup('Your guess');
    
    L.marker([correctLocation.lat, correctLocation.lng], {
      icon: createCustomIcon('#0066FF') // Blue
    }).addTo(map).bindPopup('Correct location');
    
    // Draw line between markers
    const points = [
      [guessedLocation.lat, guessedLocation.lng],
      [correctLocation.lat, correctLocation.lng]
    ];
    
    L.polyline(points, {
      color: 'red',
      weight: 3,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(map);
    
    // Calculate bounds to fit both markers
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, {
      padding: [50, 50]
    });
    
    // Store map instance for cleanup
    window.resultMapInstance = { map };
    
    return map;
  },
  
  // Calculate distance between two points in km (Haversine formula)
  calculateHaversineDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },
  
  // Calculate score based on distance
  calculateScore: (distanceKm) => {
    const maxScore = 5000;
    const maxDistance = 20000; // At 20,000 km, score is 0
    
    if (distanceKm <= 1) {
      return maxScore; // Perfect score for guesses within 1 km
    }
    
    // Linear decrease in score as distance increases
    const score = Math.max(0, Math.round(maxScore * (1 - distanceKm / maxDistance)));
    return score;
  }
};

export default MapService;