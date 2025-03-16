"use client";

import { useEffect, useState, useRef } from "react";
import { FaLocationArrow, FaTrophy } from "react-icons/fa";
import ResultsCard from "./ResultsCard";
import MapService from "./MapService";
import Timer from "../Timer/timer";

const CalculateDistance = () => {
  const mapRef = useRef(null);
  const [mapState, setMapState] = useState({
    guessedLocation: null,
    correctLocation: null,
    distance: null,
    score: 0,
    mapLoaded: false,
    error: null
  });
  const [showTimer, setShowTimer] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let isMounted = true;
    
    const initializeComponent = async () => {
      try {
        // Load Leaflet
        if (!window.L) {
          await MapService.loadLeaflet();
        }
        
        // Get locations from localStorage
        const locations = MapService.loadLocationsFromStorage();
        if (!locations.guessedLocation || !locations.correctLocation) {
          if (isMounted) {
            setMapState(prev => ({
              ...prev,
              error: "Missing location data. Please make a guess first."
            }));
          }
          return;
        }
        
        if (isMounted) {
          setMapState(prev => ({
            ...prev,
            guessedLocation: locations.guessedLocation,
            correctLocation: locations.correctLocation
          }));
        }
        
        // Initialize map with both locations
        if (mapRef.current && locations.guessedLocation && locations.correctLocation) {
          const map = MapService.initializeMap(
            mapRef.current,
            locations.guessedLocation,
            locations.correctLocation
          );
          
          // Make sure the results card stays visible when zooming
          map.on('zoom', () => {
            // Force the results card to stay on top
            const resultsCard = document.getElementById('results-card');
            if (resultsCard) {
              resultsCard.style.zIndex = "9999";
            }
          });
          
          const distanceKm = MapService.calculateHaversineDistance(
            locations.guessedLocation.lat,
            locations.guessedLocation.lng,
            locations.correctLocation.lat,
            locations.correctLocation.lng
          );
          const scoreValue = MapService.calculateScore(distanceKm);
          localStorage.setItem("marks", scoreValue);
          
          if (isMounted) {
            setMapState(prev => ({
              ...prev,
              distance: distanceKm,
              score: scoreValue,
              mapLoaded: true
            }));
            
            // Show timer after map and results are loaded
            setShowTimer(true);
          }
        }
      } catch (error) {
        console.error("Error in CalculateDistance:", error);
        if (isMounted) {
          setMapState(prev => ({
            ...prev,
            error: "Failed to initialize map. Please try again."
          }));
        }
      }
    };
    
    initializeComponent();
    
    return () => {
      isMounted = false;
      if (window.resultMapInstance?.map) {
        window.resultMapInstance.map.remove();
        window.resultMapInstance = null;
      }
    };
  }, []);

  if (mapState.error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-xl mb-4">Error</div>
          <p>{mapState.error}</p>
          <button 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={() => window.location.href = '/'}
          >
            Return to Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen">
      {/* Timer */}
      {showTimer && (
        <Timer duration={10} redirectTo="/minimaptest" position="top" />
      )}
      
      {/* Map container */}
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Results overlay - Fixed at bottom of screen */}
      {mapState.mapLoaded && mapState.distance !== null && (
        <div 
          id="results-card"
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg z-[9999] min-w-64"
          style={{ 
            position: 'fixed', 
            bottom: '16px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 9999 
          }}
        >
          <ResultsCard 
            distance={mapState.distance} 
            score={mapState.score} 
          />
        </div>
      )}
      
      {/* Loading overlay */}
      {!mapState.mapLoaded && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
          <div className="text-xl animate-pulse">Loading map and calculating distance...</div>
        </div>
      )}
    </div>
  );
};

export default CalculateDistance;