"use client";

import { useEffect, useState, useRef } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

const MiniMap = () => {
  const mapRef = useRef(null);
  const [position, setPosition] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [guessSubmitted, setGuessSubmitted] = useState(false);
  const router = useRouter();

  // Initialize map when component mounts
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    // Load OpenStreetMap scripts
    const loadOSM = async () => {
      try {
        // Check if OpenLayers is already loaded
        if (!window.L) {
          // Create script elements
          const leafletCSS = document.createElement('link');
          leafletCSS.rel = 'stylesheet';
          leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(leafletCSS);
          
          const leafletScript = document.createElement('script');
          leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          document.head.appendChild(leafletScript);
          
          // Wait for script to load
          await new Promise(resolve => {
            leafletScript.onload = resolve;
          });
        }
        
        // Initialize the map after scripts are loaded
        initializeMap();
      } catch (error) {
        console.error("Failed to load OpenStreetMap:", error);
      }
    };
    
    // Initialize the map
    const initializeMap = () => {
      if (!mapRef.current || window.mapInstance) return;
      
      // Create map
      const map = L.map(mapRef.current, {
        attributionControl: false
      }).setView([20, 0], 2);
      
      // Add tile layer - using the same as in MapService
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
      
      // Create marker layer group
      const markerGroup = L.layerGroup().addTo(map);
      
      // Add click handler
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        
        // Save position immediately when user clicks on map
        localStorage.setItem("guessedLocation", JSON.stringify({ lat, lng }));
        
        // Update marker
        markerGroup.clearLayers();
        L.marker([lat, lng]).addTo(markerGroup);
      });
      
      // Load saved position if available
      const savedLocation = localStorage.getItem("guessedLocation");
      if (savedLocation) {
        try {
          const savedPos = JSON.parse(savedLocation);
          setPosition(savedPos);
          L.marker([savedPos.lat, savedPos.lng]).addTo(markerGroup);
        } catch (e) {
          console.error("Error loading saved location:", e);
        }
      }
      
      // Store map instance
      window.mapInstance = { map, markerGroup };
      setMapLoaded(true);
      
      // Update map size when expanded state changes
      setTimeout(() => map.invalidateSize(), 100);
    };
    
    loadOSM();
    
    // Cleanup function
    return () => {
      if (window.mapInstance?.map) {
        window.mapInstance.map.remove();
        window.mapInstance = null;
      }
    };
  }, []);
  
  // Update map size when expanded state changes
  useEffect(() => {
    if (mapLoaded && window.mapInstance?.map) {
      setTimeout(() => {
        window.mapInstance.map.invalidateSize();
      }, 300);
    }
  }, [isExpanded, mapLoaded]);
  
  // Handle guess button click
  const handleGuess = () => {
    if (position) {
      setGuessSubmitted(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300">
      {/* Mini Map Container */}
      <div
        className={`relative border-2 border-gray-300 shadow-lg rounded-lg overflow-hidden transition-all duration-300 ${
          isExpanded ? "w-64 h-64" : "w-24 h-24"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Loading state */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="animate-pulse">Loading map...</div>
          </div>
        )}

        {/* Map overlay with icon when collapsed */}
        {!isExpanded && mapLoaded && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
            <FaMapMarkerAlt className="text-red-500 text-2xl" />
          </div>
        )}
      </div>

      {/* Guess Button - disabled after clicked once */}
      {isExpanded && position && (
        <button
          onClick={handleGuess}
          disabled={guessSubmitted}
          className={`mt-2 w-full py-1 px-2 rounded-md text-sm ${
            guessSubmitted 
              ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {guessSubmitted 
            ? "Navigating..." 
            : `Guess: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`
          }
        </button>
      )}
    </div>
  );
};

export default MiniMap;