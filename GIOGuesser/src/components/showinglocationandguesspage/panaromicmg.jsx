"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as THREE from "three";
import * as PANOLENS from "panolens";
import Timer from "../Timer/timer";

const PanoImg = () => {
  const panoContainerRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchComplete, setFetchComplete] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const viewerRef = useRef(null);

  useEffect(() => {
    let timer;
    
    const fetchPanoramaData = async () => {
      try {
        // Set a flag to prevent duplicate API calls
        if (fetchComplete) return;
        
        const response = await axios.get("http://localhost:5002/api/getfullimagelist");
        const data = response.data;

        if (data?.imageUrl && data?.coordinates?.coordinates.length === 2) {
          setImageUrl(data.imageUrl);

          // Save coordinates in localStorage
          const coordinates = {
            lat: data.coordinates.coordinates[1],
            lng: data.coordinates.coordinates[0],
          };
          localStorage.setItem("mapCoordinatesBcknd", JSON.stringify(coordinates));
          setFetchComplete(true);
          
          // Add intentional delay for loading UI and backend preparation
          timer = setTimeout(() => {
            setLoading(false);
            // Show timer after panorama is loaded
            setShowTimer(true);
          }, 2000);
        }
      } catch (error) {
        console.error("Error fetching panorama image:", error);
        setLoading(false);
      }
    };

    fetchPanoramaData();
    
    return () => {
      clearTimeout(timer);
      // Clean up viewer if it exists
      if (viewerRef.current) {
        viewerRef.current.dispose();
      }
    };
  }, [fetchComplete]);

  useEffect(() => {
    if (imageUrl && panoContainerRef.current && !loading) {
      // Clean up any existing viewer
      if (viewerRef.current) {
        viewerRef.current.dispose();
      }
      
      panoContainerRef.current.innerHTML = ""; // Clear previous instance

      // Create a new panorama viewer
      const panorama = new PANOLENS.ImagePanorama(imageUrl);
      const viewer = new PANOLENS.Viewer({
        container: panoContainerRef.current,
        autoRotate: true,
        autoRotateSpeed: 0.5,
        cameraFov: 80,
        controlBar: false, // Remove default control bar for more screen space
        output: 'console', // Redirect errors to console
      });

      // Store the viewer reference for cleanup
      viewerRef.current = viewer;
      
      viewer.add(panorama);
      
      // Set initial camera orientation to look at the center
      panorama.addEventListener('enter-fade-start', function() {
        viewer.tweenControlCenter(new THREE.Vector3(0, 0, 0), 0);
      });
    }
  }, [imageUrl, loading]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Show timer after panorama is loaded */}
      {showTimer && (
        <Timer duration={15} redirectTo="/calculatedistance" position="top" />
      )}
      
      {loading ? (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-white text-xl">Loading...</p>
        </div>
      ) : (
        <div ref={panoContainerRef} className="w-full h-full absolute top-0 left-0"></div>
      )}
    </div>
  );
};

export default PanoImg;