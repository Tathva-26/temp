/**
 * NITC Map Page - Main Component
 * 
 * This is the main React component that orchestrates the 3D map application.
 * It initializes the Three.js scene, manages state, and handles user interactions.
 * 
 * Architecture:
 * - Uses Three.js with React refs to avoid state-based re-renders
 * - Separates concerns into dedicated modules for maintainability
 * - Manages UI state with React hooks for panels and markers
 * 
 * Key Features:
 * - 3D interactive campus map with buildings and markers
 * - Click markers to view location details and events
 * - Double-tap/click on map to fly to location
 * - Building labels that follow camera view
 * - Event panel for browsing all campus events
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Import all module functions
import { CONFIG, LOCATION_DATA, EVENT_DATA } from "./config";
import { initializeScene, setupLighting, createGroundPlane } from "./sceneSetup";
import { loadModel, findGroundHeight, checkCollisionAtPosition } from "./modelLoader";
import {
  createMarkerMaterials,
  createMarkers,
  highlightMarker,
  findMarkerById,
} from "./markerSystem";
import { highlightBuildings, cleanupBuildingLabels } from "./buildingLabels";
import { flyToLocation, resetCamera } from "./cameraUtils";
import { setupEventHandlers, cleanupEventHandlers } from "./interactionHandlers";
import { startAnimationLoop, stopAnimationLoop } from "./animationLoop";
import { cleanup } from "./cleanupUtils";
import { EventPanel } from "./EventPanel";

/**
 * Main NITC Map Component
 * Renders a 3D interactive map of the campus with events and locations
 */
export default function NITCMapPage() {
  // ==========================================
  // THREE.JS REFS (Direct DOM/Object References)
  // ==========================================
  const mountRef = useRef(null); // DOM mount point for renderer
  const sceneRef = useRef(new THREE.Scene()); // Three.js scene
  const cameraRef = useRef(null); // Three.js camera
  const rendererRef = useRef(null); // WebGL renderer
  const controlsRef = useRef(null); // Camera controls
  const modelRef = useRef(null); // Loaded 3D model
  const groundPlaneRef = useRef(null); // Ground plane for shadows
  const raycasterRef = useRef(new THREE.Raycaster()); // For object picking
  const markersGroupRef = useRef(new THREE.Group()); // Container for all markers

  // ==========================================
  // STATE REFS (Mutable without re-renders)
  // ==========================================
  const mapBoundsRef = useRef({ ...CONFIG.MAP_BOUNDS }); // Calculated map boundaries
  const markerMaterialRef = useRef(null); // Shared marker material
  const highlightMaterialRef = useRef(null); // Shared highlight material
  const activeMarkerRef = useRef(null); // Currently highlighted marker

  // Animation state (for smooth camera movement)
  const animationRefsRef = useRef({
    targetPosition: null, // Target camera position
    targetLookAt: null, // Target look-at point
    isAnimating: false, // Whether animation is in progress
  });

  // ==========================================
  // REACT STATE (UI State that triggers re-renders)
  // ==========================================
  const [panelView, setPanelView] = useState(null); // 'events', 'location', or null
  const [activeLocation, setActiveLocation] = useState(null); // Currently selected location data

  // ==========================================
  // MAIN INITIALIZATION EFFECT
  // ==========================================
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    console.log("🚀 Initializing NITC 3D Map...");

    // Create marker materials (shared by all markers)
    const { markerMaterial, highlightMaterial } = createMarkerMaterials();
    markerMaterialRef.current = markerMaterial;
    highlightMaterialRef.current = highlightMaterial;

    // Initialize Three.js scene
    const { scene, camera, renderer, controls } = initializeScene(currentMount);
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    // Setup lighting
    setupLighting(scene);

    // Create ground plane for shadows
    const groundPlane = createGroundPlane();
    scene.add(groundPlane);
    groundPlaneRef.current = groundPlane;

    // Add markers group to scene
    scene.add(markersGroupRef.current);

    // Load the 3D model
    loadModel(
      scene,
      controls,
      groundPlane,
      camera,
      // onModelLoaded callback
      (model, mapBounds) => {
        console.log("✅ Model loaded successfully");
        modelRef.current = model;
        mapBoundsRef.current = mapBounds;

        // Create markers after model is loaded
        const wrappedFindGroundHeight = (x, z) =>
          findGroundHeight(x, z, model, groundPlane, raycasterRef.current);

        createMarkers(
          markersGroupRef.current,
          markerMaterial,
          wrappedFindGroundHeight
        );

        // Setup building highlighting and labels
        const updateLabels = highlightBuildings(model, scene, camera);
        if (updateLabels) {
          window.updateBuildingLabels = updateLabels;
        }

        // Navigate to first location by default
        if (LOCATION_DATA.length > 0) {
          flyToLocation(
            LOCATION_DATA[0].modelCoords,
            wrappedFindGroundHeight,
            animationRefsRef.current
          );
        }
      },
      // onProgress callback
      (percentComplete) => {
        console.log(`Loading: ${percentComplete.toFixed(0)}%`);
      },
      // onError callback
      (error) => {
        console.error("❌ Failed to load model:", error);
      }
    );

    // Setup event handlers
    const handlers = setupEventHandlers(
      renderer,
      camera,
      controls,
      raycasterRef.current,
      {
        markersGroup: markersGroupRef.current,
        model: modelRef.current,
        groundPlane: groundPlaneRef.current,
      },
      {
        // Callback when marker is clicked
        onMarkerClick: (locationId, clickedMarker) => {
          const locationData = LOCATION_DATA.find((loc) => loc.id === locationId);
          if (locationData) {
            setActiveLocation(locationData);
            setPanelView("location");
            activeMarkerRef.current = highlightMarker(
              clickedMarker,
              activeMarkerRef.current,
              markerMaterial,
              highlightMaterial
            );
          }
        },
        // Callback when map is double-clicked
        onDoubleClick: (point) => {
          const wrappedFindGroundHeight = (x, z) =>
            findGroundHeight(
              x,
              z,
              modelRef.current,
              groundPlaneRef.current,
              raycasterRef.current
            );
          flyToLocation(
            new THREE.Vector3(point.x, point.y, point.z),
            wrappedFindGroundHeight,
            animationRefsRef.current
          );
        },
        // Callback to close panels
        onPanelClose: () => {
          setPanelView(null);
          setActiveLocation(null);
          activeMarkerRef.current = highlightMarker(
            null,
            activeMarkerRef.current,
            markerMaterial,
            highlightMaterial
          );
        },
        // Callback to cancel animation
        onAnimationCancel: () => {
          // Check if 'R' was pressed for reset
          if (animationRefsRef.current.isAnimating) {
            animationRefsRef.current.isAnimating = false;
            animationRefsRef.current.targetPosition = null;
            animationRefsRef.current.targetLookAt = null;
          } else {
            // Reset camera to default
            resetCamera(animationRefsRef.current);
          }
        },
      }
    );

    // Start animation loop
    const wrappedCheckCollision = (position) =>
      checkCollisionAtPosition(position, modelRef.current, raycasterRef.current);
    
    const wrappedFindGroundHeight = (x, z) =>
      findGroundHeight(
        x,
        z,
        modelRef.current,
        groundPlaneRef.current,
        raycasterRef.current
      );

    const animationFrameId = startAnimationLoop(
      renderer,
      scene,
      camera,
      controls,
      animationRefsRef.current,
      mapBoundsRef.current,
      wrappedCheckCollision,
      wrappedFindGroundHeight
    );

    console.log("✅ NITC Map initialized");

    // ==========================================
    // CLEANUP FUNCTION
    // ==========================================
    return () => {
      console.log("🧹 Cleaning up NITC Map...");
      
      // Stop animation loop
      stopAnimationLoop(animationFrameId);
      
      // Remove event handlers
      cleanupEventHandlers(renderer, controls, handlers);
      
      // Clean up Three.js resources
      cleanup(
        currentMount,
        renderer,
        scene,
        markersGroupRef.current,
        markerMaterial,
        highlightMaterial
      );
      
      // Clean up building labels
      cleanupBuildingLabels();
      
      // Clear global functions
      delete window.updateBuildingLabels;
      delete window.highlightBuilding;
      delete window.getBuildingFromMesh;
    };
  }, []); // Empty dependency array - run once on mount

  // ==========================================
  // UI EVENT HANDLERS
  // ==========================================

  /**
   * Handles geolocation button click
   * Flies camera to the first location (represents user's location)
   */
  const handleGeolocation = () => {
    if (LOCATION_DATA.length > 0) {
      const wrappedFindGroundHeight = (x, z) =>
        findGroundHeight(
          x,
          z,
          modelRef.current,
          groundPlaneRef.current,
          raycasterRef.current
        );
      
      flyToLocation(
        LOCATION_DATA[0].modelCoords,
        wrappedFindGroundHeight,
        animationRefsRef.current
      );
    }
  };

  /**
   * Handles navigation from event panel to a location
   * @param {string} locationId - ID of location to navigate to
   */
  const handleNavigation = (locationId) => {
    const location = LOCATION_DATA.find((l) => l.id === locationId);
    if (!location) return;

    // Fly camera to location
    const wrappedFindGroundHeight = (x, z) =>
      findGroundHeight(
        x,
        z,
        modelRef.current,
        groundPlaneRef.current,
        raycasterRef.current
      );
    
    flyToLocation(
      location.modelCoords,
      wrappedFindGroundHeight,
      animationRefsRef.current
    );

    // Find and highlight the marker
    const marker = findMarkerById(markersGroupRef.current, locationId);
    if (marker) {
      activeMarkerRef.current = highlightMarker(
        marker,
        activeMarkerRef.current,
        markerMaterialRef.current,
        highlightMaterialRef.current
      );
    }

    // Close panel after navigation
    setPanelView(null);
    setActiveLocation(null);
  };

  /**
   * Handles panel close button
   */
  const handleClosePanel = () => {
    setPanelView(null);
    setActiveLocation(null);
    activeMarkerRef.current = highlightMarker(
      null,
      activeMarkerRef.current,
      markerMaterialRef.current,
      highlightMaterialRef.current
    );
  };

  // ==========================================
  // BUTTON STYLES
  // ==========================================
  const uiButtonClasses = `
    fixed z-10 flex items-center justify-center
    rounded-full border shadow-lg backdrop-blur-sm
    transition-all duration-200 ease-in-out
    text-blue-400 border-gray-700 bg-gray-800/90
    hover:bg-gray-700 hover:scale-110
    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
    focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
    bottom-4 h-12 w-12
    md:bottom-8 md:h-14 md:w-14
  `;

  // ==========================================
  // SVG ICON COMPONENTS
  // ==========================================
  
  /**
   * Geolocation/Crosshair icon for location button
   */
  const GeolocationIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 md:h-6 md:w-6"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );

  /**
   * Calendar icon for events button
   */
  const CalendarIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 md:h-6 md:w-6"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="fixed top-0 left-0 h-screen w-screen overflow-hidden bg-gray-900 font-sans">
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="h-full w-full bg-gray-700"
        aria-label="3D Campus Map"
      />

      {/* Geolocation Button (Bottom Right) */}
      <button
        onClick={handleGeolocation}
        className={`${uiButtonClasses} right-4 md:right-8`}
        title="Recenter to default location"
        aria-label="Recenter camera"
      >
        <GeolocationIcon />
      </button>

      {/* Events Button (Bottom Left) */}
      <button
        onClick={() => setPanelView("events")}
        className={`${uiButtonClasses} left-4 md:left-8`}
        title="Show all events"
        aria-label="View all events"
      >
        <CalendarIcon />
      </button>

      {/* Event/Location Panel */}
      <EventPanel
        panelView={panelView}
        activeLocation={activeLocation}
        allEvents={EVENT_DATA}
        allLocations={LOCATION_DATA}
        onClose={handleClosePanel}
        onNavigate={handleNavigation}
        onSelectLocation={(location) => {
          setActiveLocation(location);
          setPanelView("location");
          const marker = findMarkerById(markersGroupRef.current, location.id);
          if (marker) {
            activeMarkerRef.current = highlightMarker(
              marker,
              activeMarkerRef.current,
              markerMaterialRef.current,
              highlightMaterialRef.current
            );
          }
        }}
      />
    </div>
  );
}