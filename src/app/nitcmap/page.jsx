"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { EventPanel } from "./EventPanel"; // Make sure this is the version from our last conversation
import { createRoot } from "react-dom/client";
import BuildingMarker from "./BuildingMarker"; // Assuming this is in './BuildingMarker.jsx'
import BuildingCard from "./BuildingCard"; // Assuming this is in './BuildingCard.jsx'

// --- CONFIGURATION ---

const CONFIG = {
  CAMERA: {
    FOV: 60,
    NEAR: 0.1,
    FAR: 2000,
    MIN_HEIGHT_ABOVE_TERRAIN: 5, // Minimum height above ground/buildings
    DEFAULT_POSITION: new THREE.Vector3(0, 50, 80),
    DEFAULT_TARGET: new THREE.Vector3(0, 0, 0),
  },
  CONTROLS: {
    MIN_DISTANCE: 10,
    MAX_DISTANCE: 300,
    DAMPING_FACTOR: 0.05,
  },
  MAP_BOUNDS: {
    // These will be calculated from the model, but here are fallback values
    MIN_X: -200,
    MAX_X: 200,
    MIN_Z: -200,
    MAX_Z: 200,
    PADDING: 20, // Extra padding to prevent going too far out
  },
  ANIMATION: {
    LERP_FACTOR: 0.05,
    COLLISION_LERP_FACTOR: 0.3, // Faster correction for collisions
    COMPLETION_THRESHOLD: 0.5,
  },
  INTERACTION: {
    DOUBLE_TAP_TIMEOUT: 300,
    SWIPE_THRESHOLD: 10,
  },
  FLY_TO: {
    CAMERA_OFFSET: { x: -30, y: 25, z: -30 },
  },
};

const GEOSPATIAL_CONFIG = {
  // Primary reference point - NLHC (New Lecture Hall Complex)
  REFERENCE_POINT_GPS: { lat: 11.321636, lon: 75.933101 },
  REFERENCE_POINT_MODEL: new THREE.Vector3(201.73, 52.24, -445.55),

  // Secondary reference points for verification
  SECONDARY_POINTS: [
    {
      name: "OAT (Open Air Theatre)",
      gps: { lat: 11.322136, lon: 75.933371 },
      model: new THREE.Vector3(233.37, 53.9, -503.22),
    },
    {
      name: "ELHC Pits",
      gps: { lat: 11.322564, lon: 75.933865 },
      model: new THREE.Vector3(279.25, 53.93, -549.8),
    },
    {
      name: "Aryabhatta/Chanakya/Bhaskara Hostels",
      gps: { lat: 11.320844, lon: 75.933944 },
      model: new THREE.Vector3(275.31, 57.48, -354.41),
    },
  ],

  MODEL_SCALE: 1.0, // Will be auto-calculated
  MODEL_ROTATION_OFFSET: 0,
};

// --- DATA ---

// We will populate modelCoords dynamically from the 3D model
const LOCATION_DATA = [
  {
    id: "Building 121",
    name: "Main Building (Admin)",
    modelCoords: null,
  },
  {
    id: "Building 118",
    name: "ELHC (Electronics)",
    modelCoords: null,
  },
  {
    id: "Building 028",
    name: "CSE Building",
    modelCoords: null,
  },
];

// Note: locationId now matches the building names from your model
const EVENT_DATA = [
  {
    id: "evt1",
    name: "Inaugural Tech Talk",
    committee: "IEEE",
    time: "10:00 AM",
    locationId: "Building 121", // Was 'mb'
    type: "lecture",
  },
  {
    id: "evt2",
    name: "Tathva Quiz Finale",
    committee: "Enquire",
    time: "2:00 PM",
    locationId: "Building 121", // Was 'mb'
    type: "workshop",
  },
  {
    id: "evt3",
    name: "Workshop: Intro to React",
    committee: "FOSSC",
    time: "11:00 AM",
    locationId: "Building 118", // Was 'elhc'
    type: "competition",
  },
  {
    id: "evt4",
    name: "Code-Kombat Hackathon",
    committee: "CSEA",
    time: "9:00 AM - 5:00 PM",
    locationId: "Building 028", // Was 'cse'
    type: "lecture",
  },
  {
    id: "evt5",
    name: "Robo-Wars",
    committee: "Robotics Club",
    time: "1:00 PM",
    locationId: "Building 028", // Was 'cse'
    type: "lecture",
  },
];

// --- GEOSPATIAL FUNCTIONS ---

// Haversine distance calculation
function haversineDistance(p1, p2) {
  const R = 6371e3;
  const phi1 = (p1.lat * Math.PI) / 180;
  const phi2 = (p2.lat * Math.PI) / 180;
  const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLambda = ((p2.lon - p1.lon) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}


function gpsToScene(gpsCoords) {
  const {
    REFERENCE_POINT_GPS,
    REFERENCE_POINT_MODEL,
    MODEL_SCALE,
    MODEL_ROTATION_OFFSET,
  } = GEOSPATIAL_CONFIG;

  const latDistance = haversineDistance(REFERENCE_POINT_GPS, {
    lat: gpsCoords.lat,
    lon: REFERENCE_POINT_GPS.lon,
  });
  const lonDistance = haversineDistance(REFERENCE_POINT_GPS, {
    lat: REFERENCE_POINT_GPS.lat,
    lon: gpsCoords.lon,
  });

  const latSign = Math.sign(gpsCoords.lat - REFERENCE_POINT_GPS.lat);
  const lonSign = Math.sign(gpsCoords.lon - REFERENCE_POINT_GPS.lon);

  let zOffset = (latDistance * latSign) / MODEL_SCALE;
  let xOffset = (lonDistance * lonSign) / MODEL_SCALE;

  if (MODEL_ROTATION_OFFSET !== 0) {
    const rotatedX =
      xOffset * Math.cos(MODEL_ROTATION_OFFSET) -
      zOffset * Math.sin(MODEL_ROTATION_OFFSET);
    const rotatedZ =
      xOffset * Math.sin(MODEL_ROTATION_OFFSET) +
      zOffset * Math.cos(MODEL_ROTATION_OFFSET);
    xOffset = rotatedX;
    zOffset = rotatedZ;
  }

  const newPosition = new THREE.Vector3(
    REFERENCE_POINT_MODEL.x + xOffset,
    REFERENCE_POINT_MODEL.y,
    REFERENCE_POINT_MODEL.z - zOffset
  );

  return newPosition;
}

// Calculate model scale from reference points
function calculateModelScale() {
  const points = [
    {
      gps1: GEOSPATIAL_CONFIG.REFERENCE_POINT_GPS,
      model1: GEOSPATIAL_CONFIG.REFERENCE_POINT_MODEL,
      gps2: GEOSPATIAL_CONFIG.SECONDARY_POINTS[0].gps,
      model2: GEOSPATIAL_CONFIG.SECONDARY_POINTS[0].model,
    },
    {
      gps1: GEOSPATIAL_CONFIG.REFERENCE_POINT_GPS,
      model1: GEOSPATIAL_CONFIG.REFERENCE_POINT_MODEL,
      gps2: GEOSPATIAL_CONFIG.SECONDARY_POINTS[1].gps,
      model2: GEOSPATIAL_CONFIG.SECONDARY_POINTS[1].model,
    },
    {
      gps1: GEOSPATIAL_CONFIG.REFERENCE_POINT_GPS,
      model1: GEOSPATIAL_CONFIG.REFERENCE_POINT_MODEL,
      gps2: GEOSPATIAL_CONFIG.SECONDARY_POINTS[2].gps,
      model2: GEOSPATIAL_CONFIG.SECONDARY_POINTS[2].model,
    },
  ];

  const scales = points.map(({ gps1, model1, gps2, model2 }) => {
    const realDistance = haversineDistance(gps1, gps2);
    const modelDistance = Math.sqrt(
      Math.pow(model2.x - model1.x, 2) + Math.pow(model2.z - model1.z, 2)
    );
    return realDistance / modelDistance;
  });

  const avgScale = scales.reduce((a, b) => a + b, 0) / scales.length;

  console.log("=== MODEL SCALE CALCULATION ===");
  console.log("Individual scales:", scales.map((s) => s.toFixed(3)));
  console.log("Average MODEL_SCALE:", avgScale.toFixed(3), "meters per unit");
  console.log("===============================");

  GEOSPATIAL_CONFIG.MODEL_SCALE = avgScale;
  return avgScale;
}

// --- HOOKS & HELPERS ---

// Custom hook for GPS tracking
function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { position, error, loading };
}

// (Your DynamicLocationMarker component - unused but kept from your code)
function DynamicLocationMarker({ gpsPosition, scene }) {
  const markerGroupRef = useRef(null);

  useEffect(() => {
    if (!gpsPosition || !scene) return;

    if (markerGroupRef.current) {
      scene.remove(markerGroupRef.current);
    }

    const scenePosition = gpsToScene(gpsPosition);
    const group = new THREE.Group();

    const sphereGeometry = new THREE.SphereGeometry(3, 16, 16);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x0099ff,
      emissive: 0x0099ff,
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.9,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.y = 5;
    group.add(sphere);

    const beamGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5);
    const beamMaterial = new THREE.MeshStandardMaterial({
      color: 0x0099ff,
      transparent: true,
      opacity: 0.6,
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.y = 2.5;
    group.add(beam);

    const ringGeometry = new THREE.RingGeometry(2, 4, 32);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x0099ff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.1;
    group.add(ring);

    group.position.copy(scenePosition);
    scene.add(group);
    markerGroupRef.current = group;

    return () => {
      if (markerGroupRef.current) {
        scene.remove(markerGroupRef.current);
      }
    };
  }, [gpsPosition, scene]);

  return null;
}

// --- MAIN COMPONENT ---

export default function NITCMapPage() {
  const mountRef = useRef(null); // Three.js core objects

  const {
    position: userGps,
    error: gpsError,
    loading: gpsLoading,
  } = useGeolocation();

  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const groundPlaneRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());

  // Map bounds (calculated from model)
  const mapBoundsRef = useRef({ ...CONFIG.MAP_BOUNDS }); // Animation state

  const targetPositionRef = useRef(null);
  const targetLookAtRef = useRef(null);
  const isAnimatingRef = useRef(false); // Interaction state

  const lastTapTimeRef = useRef(0);
  const tapStartPosRef = useRef(new THREE.Vector2());
  const isSwipingRef = useRef(false);

  // UI State
  const [panelView, setPanelView] = useState(null); // null, 'events', 'location'
  const [activeLocation, setActiveLocation] = useState(null); // Holds data for the *clicked* location
  const [isGpsInfoOpen, setIsGpsInfoOpen] = useState(false); // ✅ NEW: State for GPS panel

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const { scene, camera, renderer, controls } = initializeScene(currentMount);
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    setupLighting(scene);

    const groundPlane = createGroundPlane();
    scene.add(groundPlane);
    groundPlaneRef.current = groundPlane;

    loadModel(scene, controls, groundPlane, camera);

    const handlers = setupEventHandlers(renderer, camera, controls);
    const animationFrameId = startAnimationLoop(
      renderer,
      scene,
      camera,
      controls
    );

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameId);
      cleanup(currentMount, renderer, scene, handlers);

      // Clean up building labels on unmount
      const labelContainer = document.getElementById("building-labels");
      if (labelContainer) labelContainer.remove();

      // Clean up window functions
      window.updateBuildingLabels = null;
      window.setActiveBuildingUI = null;
      window.getBuildingFromMesh = null;
    };
  }, []);

  const initializeScene = (mount) => {
    // ... (This function is unchanged)
    const scene = sceneRef.current;
    scene.background = new THREE.Color(0xabcdef);
    scene.fog = new THREE.Fog(0xabcdef, 100, 500);
    const camera = new THREE.PerspectiveCamera(
      CONFIG.CAMERA.FOV,
      mount.clientWidth / mount.clientHeight,
      CONFIG.CAMERA.NEAR,
      CONFIG.CAMERA.FAR
    );
    camera.position.copy(CONFIG.CAMERA.DEFAULT_POSITION);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    const controls = new MapControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = CONFIG.CONTROLS.DAMPING_FACTOR;
    controls.minDistance = CONFIG.CONTROLS.MIN_DISTANCE;
    controls.maxDistance = CONFIG.CONTROLS.MAX_DISTANCE;
    return { scene, camera, renderer, controls };
  };

  const setupLighting = (scene) => {
    // ... (This function is unchanged)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    hemisphereLight.position.set(0, 100, 0);
    scene.add(hemisphereLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(50, 100, 75);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    scene.add(directionalLight);
  };

  const createGroundPlane = () => {
    // ... (This function is unchanged)
    const groundPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshStandardMaterial({
        color: 0x888888,
        depthWrite: false,
      })
    );
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.receiveShadow = true;
    return groundPlane;
  };

  const highlightBuildings = (model, scene, camera) => {
    // ... (This entire complex function is unchanged from your code)
    const buildingGroups = {};
    const buildingMeshMap = new Map();

    // === STEP 1: Group meshes by building name ===
    model.traverse((child) => {
      if (child.isMesh) {
        let baseName = null;

        if (child.name.includes("maposm_buildings")) {
          const match = child.name.match(/maposm_buildings(\d+)/);
          if (match) baseName = `Building ${match[1]}`;
        } else if (child.name) {
          baseName = child.name.replace(/_\d+$/, "");
        }

        if (LOCATION_DATA.some((loc) => loc.id === baseName)) {
          if (!buildingGroups[baseName]) buildingGroups[baseName] = [];
          buildingGroups[baseName].push(child);
          buildingMeshMap.set(child, baseName);
          if (!child.userData.originalMaterial)
            child.userData.originalMaterial = child.material;
        }
      }
    });

    console.log("🏢 Tracking buildings:", Object.keys(buildingGroups));

    // === STEP 2: Setup container ===
    let container = document.getElementById("building-labels");
    if (container) container.remove();

    container = document.createElement("div");
    container.id = "building-labels";
    container.className =
      "absolute top-0 left-0 w-full h-full pointer-events-none z-[1000]";
    document.body.appendChild(container);

    const root = createRoot(container);

    // === STEP 3: React UI Logic ===
    let activeBuilding = null; // Local state for this UI

    window.setActiveBuildingUI = (buildingName) => {
      if (activeBuilding === buildingName) return;
      activeBuilding = buildingName;
      highlightBuilding(buildingName); // Apply glow
      renderUI(); // Re-render this UI
    };

    const BuildingUI = ({ active, onMarkerClick, onCardAction }) => {
      return (
        <>
          {Object.entries(buildingGroups).map(([buildingName, meshes]) => {
            const box = new THREE.Box3();
            meshes.forEach((m) => box.expandByObject(m));
            const worldCenter = box.getCenter(new THREE.Vector3());

            const locationEntry = LOCATION_DATA.find(
              (loc) => loc.id === buildingName
            );
            if (locationEntry && !locationEntry.modelCoords) {
              console.log(`Populating modelCoords for ${buildingName}`);
              locationEntry.modelCoords = worldCenter.clone();
            }

            worldCenter.y = box.max.y + 5; // Set label position above building

            // Project 3D to 2D
            const vector = worldCenter.clone();
            vector.project(camera);
            const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
            const distance = camera.position.distanceTo(worldCenter);

            if (distance > 250 || vector.z > 1 || vector.z < -1) return null;

            return (
              <div
                key={buildingName}
                className="absolute"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  opacity: Math.max(0.4, Math.min(1, 180 / distance)),
                  pointerEvents: "auto",
                  transform: "translate(-50%, -50%)", // Center marker
                }}
              >
                <BuildingMarker
                  buildingName={buildingName}
                  isActive={active === buildingName}
                  onClick={() => onMarkerClick(buildingName)}
                />
                <BuildingCard
                  buildingName={buildingName}
                  visible={active === buildingName}
                  onAction={() => onCardAction(buildingName)}
                />
              </div>
            );
          })}
        </>
      );
    };

    const renderUI = () => {
      root.render(
        <BuildingUI
          active={activeBuilding}
          onMarkerClick={(b) => {
            const newActive = activeBuilding === b ? null : b;
            window.setActiveBuildingUI(newActive); // Use controller

            if (newActive === null) {
              setPanelView(null);
              setActiveLocation(null);
            }
          }}
          onCardAction={(buildingName) => {
            const locationData = LOCATION_DATA.find(
              (loc) => loc.id === buildingName
            );
            if (locationData) {
              setActiveLocation(locationData);
              setPanelView("location");
            }
          }}
        />
      );
    };

    renderUI();

    // === STEP 4: Highlight / Glow Logic ===
    const highlightBuilding = (buildingName) => {
      // Clear previous highlight
      Object.entries(buildingGroups).forEach(([name, meshes]) => {
        meshes.forEach((mesh) => {
          mesh.material = mesh.userData.originalMaterial;
          mesh.userData.pulsating = false;
        });
      });

      // Apply glow
      if (buildingName) {
        const meshes = buildingGroups[buildingName];
        if (meshes) {
          const glowColor = new THREE.Color(1.0, 0.95, 0.7);
          meshes.forEach((mesh) => {
            const mat = mesh.userData.originalMaterial.clone();
            mat.transparent = true;
            mat.opacity = 0.85;
            mat.emissive = glowColor;
            mat.emissiveIntensity = 0.5;
            mat.color.lerp(glowColor, 0.3);
            mesh.material = mat;
            mesh.userData.pulsating = true;
            mesh.userData.pulseTime = 0;
          });
        }
      }
    };

    // === STEP 5: Animate Pulsation === (Unchanged)
    const animatePulsating = () => {
      Object.values(buildingGroups).forEach((meshes) => {
        meshes.forEach((mesh) => {
          if (mesh.userData.pulsating) {
            mesh.userData.pulseTime += 0.02;
            const intensity =
              0.5 + Math.sin(mesh.userData.pulseTime * 3) * 0.2;
            mesh.material.emissiveIntensity = intensity;
            mesh.material.opacity =
              0.8 + Math.sin(mesh.userData.pulseTime * 3) * 0.1;
          }
        });
      });
    };

    // === STEP 6: Update Positions ===
    const updateAllLabels = () => {
      animatePulsating();
      renderUI();
    };

    // Store globally for access
    window.getBuildingFromMesh = (mesh) => buildingMeshMap.get(mesh);

    return updateAllLabels;
  };

const loadModel = (scene, controls, groundPlane, camera) => {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    "/models/nitc.glb",
    (gltf) => {
      const model = gltf.scene;
      modelRef.current = model;

      calculateModelScale();

      // Enable shadows
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // === Log all named buildings ===
      const buildingNames = [];
      model.traverse((child) => {
        if (child.name && child.name.trim() !== "") {
          buildingNames.push(child.name);
        }
      });
      console.log("🏫 All Building Names in GLB Model:");
      console.table(buildingNames);

      // === Log hierarchy for debugging ===
      const printHierarchy = (object, depth = 0) => {
        const indent = "  ".repeat(depth);
        console.log(`${indent}${object.name || "(unnamed)"} — ${object.type}`);
        object.children.forEach((child) => printHierarchy(child, depth + 1));
      };
      console.log("📦 Model Hierarchy:");
      printHierarchy(model);

      // === Setup model bounds and position ===
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());

      mapBoundsRef.current = {
        MIN_X: box.min.x - CONFIG.MAP_BOUNDS.PADDING,
        MAX_X: box.max.x + CONFIG.MAP_BOUNDS.PADDING,
        MIN_Z: box.min.z - CONFIG.MAP_BOUNDS.PADDING,
        MAX_Z: box.max.z + CONFIG.MAP_BOUNDS.PADDING,
        PADDING: CONFIG.MAP_BOUNDS.PADDING,
      };

      controls.target.copy(center);
      groundPlane.position.y = box.min.y;
      scene.add(model);

      // === Highlight + Label Setup ===
      const updateLabels = highlightBuildings(model, scene, camera);
      if (updateLabels) {
        window.updateBuildingLabels = updateLabels;
      }

      // === Start geolocation handling ===
      handleGeolocation();
    },
    (xhr) => {
      console.log(`Model ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
    },
    (error) => {
      console.error("❌ Error loading model:", error);
    }
  );
};

  // --- (UTILITY FUNCTIONS: UNCHANGED) ---

  const findGroundHeight = (x, z) => {
    if (!modelRef.current || !groundPlaneRef.current) return 0;

    const raycaster = raycasterRef.current;
    const rayStart = new THREE.Vector3(x, 500, z); // Start high above
    raycaster.set(rayStart, new THREE.Vector3(0, -1, 0));

    const intersects = raycaster.intersectObject(modelRef.current, true);
    if (intersects.length > 0) {
      return intersects[0].point.y;
    }

    const groundIntersects = raycaster.intersectObject(groundPlaneRef.current);
    if (groundIntersects.length > 0) {
      return groundIntersects[0].point.y;
    }

    return groundPlaneRef.current.position.y;
  };

  const checkCollisionAtPosition = (position) => {
    if (!modelRef.current) return null;

    const raycaster = raycasterRef.current;

    const rayStart = new THREE.Vector3(position.x, 500, position.z);
    raycaster.set(rayStart, new THREE.Vector3(0, -1, 0));
    const intersects = raycaster.intersectObject(modelRef.current, true);

    if (intersects.length > 0) {
      return intersects[0].point.y;
    }

    return null;
  };

  const clampToMapBounds = (position) => {
    const bounds = mapBoundsRef.current;
    const clamped = position.clone();

    clamped.x = Math.max(bounds.MIN_X, Math.min(bounds.MAX_X, clamped.x));
    clamped.z = Math.max(bounds.MIN_Z, Math.min(bounds.MAX_Z, clamped.z));

    return clamped;
  };

  const flyToLocation = (modelCoords) => {
    // ... (This function is unchanged)
    const groundY = findGroundHeight(modelCoords.x, modelCoords.z);
    const targetPoint = new THREE.Vector3(
      modelCoords.x,
      groundY,
      modelCoords.z
    );
    targetPositionRef.current = new THREE.Vector3(
      targetPoint.x + CONFIG.FLY_TO.CAMERA_OFFSET.x,
      targetPoint.y + CONFIG.FLY_TO.CAMERA_OFFSET.y,
      targetPoint.z + CONFIG.FLY_TO.CAMERA_OFFSET.z
    );
    targetLookAtRef.current = targetPoint;
    isAnimatingRef.current = true;
  };

  // --- (EVENT HANDLERS) ---

  const handleGeolocation = () => {
    // ... (This function is unchanged)
    if (userGps) {
      const scenePos = gpsToScene(userGps);
      flyToLocation(new THREE.Vector3(scenePos.x, scenePos.y, scenePos.z));
    } else if (LOCATION_DATA.length > 0 && LOCATION_DATA[0].modelCoords) {
      flyToLocation(LOCATION_DATA[0].modelCoords);
    } else {
      console.warn(
        "Geolocation fallback: userGps not ready or model coords not ready."
      );
      if (controlsRef.current) {
        flyToLocation(controlsRef.current.target);
      }
    }
  };

  const setupEventHandlers = (renderer, camera, controls) => {
    const handleResize = () => {
      // ... (This function is unchanged)
      if (!mountRef.current || !cameraRef.current || !rendererRef.current)
        return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    const handleKeyDown = (event) => {
      // ... (This function is unchanged)
      if (event.key.toLowerCase() === "r") {
        targetPositionRef.current = CONFIG.CAMERA.DEFAULT_POSITION.clone();
        targetLookAtRef.current = CONFIG.CAMERA.DEFAULT_TARGET.clone();
        isAnimatingRef.current = true;
      }
    };

    const getEventPosition = (event) => {
      // ... (This function is unchanged)
      if (event.touches) {
        return event.touches[0] || event.changedTouches[0];
      }
      return event;
    };

    const handleTapStart = (event) => {
      // ... (This function is unchanged)
      isSwipingRef.current = false;
      const pos = getEventPosition(event);
      tapStartPosRef.current.set(pos.clientX, pos.clientY);
    };

    const handleTapMove = (event) => {
      // ... (This function is unchanged)
      if (isSwipingRef.current) return;
      const pos = getEventPosition(event);
      const distance = tapStartPosRef.current.distanceTo(
        new THREE.Vector2(pos.clientX, pos.clientY)
      );
      if (distance > CONFIG.INTERACTION.SWIPE_THRESHOLD) {
        isSwipingRef.current = true;
      }
    };

    const handleTapEnd = (event) => {
      if (isSwipingRef.current) {
        isSwipingRef.current = false;
        return; // It was a swipe/pan, not a tap
      }

      const now = performance.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;

      const input = getEventPosition(event);
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((input.clientX - rect.left) / rect.width) * 2 - 1,
        -((input.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = raycasterRef.current;
      raycaster.setFromCamera(mouse, camera);

      // 1. ❌ Cone marker intersection check REMOVED

      // 2. Check for double-tap-to-fly
      if (timeSinceLastTap < CONFIG.INTERACTION.DOUBLE_TAP_TIMEOUT) {
        // ... (double-tap logic unchanged) ...
        event.preventDefault();
        const intersects = raycaster.intersectObjects(
          [modelRef.current, groundPlaneRef.current].filter(Boolean),
          true
        );
        if (intersects.length > 0) {
          const point = intersects[0].point;
          flyToLocation(new THREE.Vector3(point.x, point.y, point.z));
        }
        lastTapTimeRef.current = 0;
      } else {
        // --- Single-tap on nothing ---
        // ✅ MODIFIED: Close panel AND building UI AND GPS Info
        setPanelView(null);
        setActiveLocation(null);
        setIsGpsInfoOpen(false); // ✅ NEW: Close GPS info on background click
        if (window.setActiveBuildingUI) {
          window.setActiveBuildingUI(null); // Clear highlight
        }
        lastTapTimeRef.current = now;
      }
    };

    const handleControlsStart = () => {
      // ... (animation cancelling unchanged) ...
      if (isAnimatingRef.current) {
        isAnimatingRef.current = false;
        targetPositionRef.current = null;
        targetLookAtRef.current = null;
      }
      // ✅ MODIFIED: Also hide UI when user starts panning
      setPanelView(null);
      setActiveLocation(null);
      setIsGpsInfoOpen(false); // ✅ NEW: Close GPS info on pan/zoom start
      if (window.setActiveBuildingUI) {
        window.setActiveBuildingUI(null);
      }
    };

    // ... (Attaching listeners is unchanged)

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    renderer.domElement.addEventListener("mousedown", handleTapStart, {
      passive: true,
    });
    renderer.domElement.addEventListener("touchstart", handleTapStart, {
      passive: true,
    });
    renderer.domElement.addEventListener("mousemove", handleTapMove, {
      passive: true,
    });
    renderer.domElement.addEventListener("touchmove", handleTapMove, {
      passive: true,
    });
    renderer.domElement.addEventListener("mouseup", handleTapEnd);
    renderer.domElement.addEventListener("touchend", handleTapEnd);
    controls.addEventListener("start", handleControlsStart);

    return {
      handleResize,
      handleKeyDown,
      handleTapStart,
      handleTapMove,
      handleTapEnd,
      handleControlsStart,
    };
  };

  const startAnimationLoop = (renderer, scene, camera, controls) => {
    // ... (This entire function is unchanged)
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // --- (Your user location marker logic: UNCHANGED) ---
      if (userGps && sceneRef.current) {
        const scenePos = gpsToScene(userGps);

        if (!window.userLocationMarker) {
          const group = new THREE.Group();

          const sphereGeom = new THREE.SphereGeometry(3, 16, 16);
          const sphereMat = new THREE.MeshStandardMaterial({
            color: 0x0099ff,
            emissive: 0x0099ff,
            emissiveIntensity: 2,
          });
          const sphere = new THREE.Mesh(sphereGeom, sphereMat);
          sphere.position.y = 5;
          group.add(sphere);

          const beamGeom = new THREE.CylinderGeometry(0.5, 0.5, 5);
          const beamMat = new THREE.MeshStandardMaterial({
            color: 0x0099ff,
            transparent: true,
            opacity: 0.6,
          });
          const beam = new THREE.Mesh(beamGeom, beamMat);
          beam.position.y = 2.5;
          group.add(beam);

          sceneRef.current.add(group);
          window.userLocationMarker = group;
        }

        const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
        window.userLocationMarker.children[0].scale.set(scale, scale, scale);
        window.userLocationMarker.position.set(
          scenePos.x,
          findGroundHeight(scenePos.x, scenePos.z),
          scenePos.z
        );
      }
      // --- (End user location logic) ---

      // --- (Camera animation logic: UNCHANGED) ---
      if (
        isAnimatingRef.current &&
        targetPositionRef.current &&
        targetLookAtRef.current
      ) {
        camera.position.lerp(
          targetPositionRef.current,
          CONFIG.ANIMATION.LERP_FACTOR
        );
        controls.target.lerp(
          targetLookAtRef.current,
          CONFIG.ANIMATION.LERP_FACTOR
        );

        const positionDistance = camera.position.distanceTo(
          targetPositionRef.current
        );
        const targetDistance = controls.target.distanceTo(
          targetLookAtRef.current
        );

        if (
          positionDistance < CONFIG.ANIMATION.COMPLETION_THRESHOLD &&
          targetDistance < CONFIG.ANIMATION.COMPLETION_THRESHOLD
        ) {
          camera.position.copy(targetPositionRef.current);
          controls.target.copy(targetLookAtRef.current);
          targetPositionRef.current = null;
          targetLookAtRef.current = null;
          isAnimatingRef.current = false;
          controls.update();
        }
      }

      controls.update();

      // --- (Terrain/Collision logic: UNCHANGED) ---
      if (modelRef.current) {
        const clampedCameraPos = clampToMapBounds(camera.position);
        if (!clampedCameraPos.equals(camera.position)) {
          camera.position.lerp(
            clampedCameraPos,
            CONFIG.ANIMATION.COLLISION_LERP_FACTOR
          );
        }

        const groundHeight = checkCollisionAtPosition(camera.position);
        if (groundHeight !== null) {
          const minCameraY =
            groundHeight + CONFIG.CAMERA.MIN_HEIGHT_ABOVE_TERRAIN;

          if (camera.position.y < minCameraY) {
            camera.position.y +=
              (minCameraY - camera.position.y) *
              CONFIG.ANIMATION.COLLISION_LERP_FACTOR;
          }
        }

        if (!isAnimatingRef.current) {
          const clampedTargetPos = clampToMapBounds(controls.target);
          if (!clampedTargetPos.equals(controls.target)) {
            controls.target.lerp(
              clampedTargetPos,
              CONFIG.ANIMATION.COLLISION_LERP_FACTOR
            );
          }

          const targetGroundHeight = findGroundHeight(
            controls.target.x,
            controls.target.z
          );
          if (controls.target.y < targetGroundHeight) {
            controls.target.y +=
              (targetGroundHeight - controls.target.y) *
              CONFIG.ANIMATION.COLLISION_LERP_FACTOR;
          }
        }
      }

      // --- (Update building labels every frame: UNCHANGED) ---
      if (window.updateBuildingLabels) {
        window.updateBuildingLabels();
      }

      renderer.render(scene, camera);
    };

    animate();
    return animationFrameId;
  };

  const cleanup = (mount, renderer, scene, handlers) => {
    // ... (This function is unchanged)
    window.removeEventListener("resize", handlers.handleResize);
    window.removeEventListener("keydown", handlers.handleKeyDown);
    if (renderer.domElement) {
      renderer.domElement.removeEventListener(
        "mousedown",
        handlers.handleTapStart
      );
      renderer.domElement.removeEventListener(
        "touchstart",
        handlers.handleTapStart
      );
      renderer.domElement.removeEventListener(
        "mousemove",
        handlers.handleTapMove
      );
      renderer.domElement.removeEventListener(
        "touchmove",
        handlers.handleTapMove
      );
      renderer.domElement.removeEventListener("mouseup", handlers.handleTapEnd);
      renderer.domElement.removeEventListener(
        "touchend",
        handlers.handleTapEnd
      );
    }
    if (controlsRef.current && handlers.handleControlsStart) {
      controlsRef.current.removeEventListener(
        "start",
        handlers.handleControlsStart
      );
    }
    if (mount && renderer.domElement.parentElement === mount) {
      mount.removeChild(renderer.domElement);
    }
    renderer.dispose();
    scene.traverse((object) => {
      if (object.isMesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else if (object.material?.isMaterial) {
          object.material.dispose();
        }
      }
      if (object.material?.map) {
        object.material.map.dispose();
      }
    });

    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  };

  const handleNavigation = (locationId) => {
    // ... (This function is unchanged, but its behavior is now correct
    // because it triggers pulsation that will persist)
    const location = LOCATION_DATA.find((l) => l.id === locationId);

    if (location && location.modelCoords) {
      flyToLocation(location.modelCoords);
      // Set the building glow/card
      if (window.setActiveBuildingUI) {
        window.setActiveBuildingUI(location.id);
      }
      // Set the panel state
      setActiveLocation(location);
      setPanelView("location");
    } else if (location) {
      // Fallback if coords aren't populated yet
      console.warn(`Cannot navigate to ${locationId}, modelCoords not ready.`);
      setActiveLocation(location);
      setPanelView("location");
    }
  };

  // --- (UI Components) ---

  const uiButtonClasses = `
  fixed z-10 flex items-center justify-center
  rounded-full border shadow-lg backdrop-blur-sm
  transition-all duration-200 ease-in-out
  text-blue-400 border-gray-700 bg-gray-800/90
  hover:bg-gray-700 hover:scale-110
  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
  focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900

  /* Mobile-first sizing (smaller, closer to edge) */
  bottom-4 h-12 w-12
  
  /* Desktop sizing (larger, more padding) */
  md:bottom-8 md:h-14 md:w-14
  `;

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

  // ✅ NEW: Icon for the GPS info toggle button
  const CompassIcon = () => (
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
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </svg>
  );

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

  // --- (JSX RENDER) ---

  const handleClosePanel = () => {
    setPanelView(null);
    setActiveLocation(null);
    // Pulsation persists even when panel is closed
  };

  // ✅ NEW: Toggle for the GPS info panel
  const toggleGpsInfo = () => {
    setIsGpsInfoOpen((prev) => !prev);
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-screen overflow-hidden bg-gray-900 font-sans">
      {/* ✅ MODIFIED: GPS Info Panel */}
      <div
        className={`absolute top-4 left-4 z-20 max-w-xs text-sm transition-all duration-300 ease-in-out
          rounded-lg border shadow-lg backdrop-blur-sm
          border-gray-700 bg-gray-800/90 text-white/90
          ${
            isGpsInfoOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
      >
        <div className="p-3 space-y-1">
          {gpsLoading && (
            <p className="text-gray-400"> Getting GPS location.</p>
          )}
          {gpsError && <p className="text-red-500"> GPS Error: {gpsError}</p>}
          {userGps && (
            <>
              <p className="font-semibold text-white">Your Location:</p>
              <p className="text-xs text-gray-400">
                {userGps.lat.toFixed(6)}, {userGps.lon.toFixed(6)}
              </p>
              <p className="text-xs text-gray-400">
                Accuracy: ±{userGps.accuracy?.toFixed(0)}m
              </p>
              <p
                className={`text-xs ${
                  Math.abs(
                    userGps.lat - GEOSPATIAL_CONFIG.REFERENCE_POINT_GPS.lat
                  ) > 0.01
                    ? "text-orange-400"
                    : "text-green-400"
                }`}
              >
                {Math.abs(
                  userGps.lat - GEOSPATIAL_CONFIG.REFERENCE_POINT_GPS.lat
                ) > 0.01
                  ? "⚠️ You are far from campus"
                  : "✓ You are on campus"}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Three.js Canvas */}
      <div
        ref={mountRef}
        className="h-full w-full bg-gray-700"
        aria-label="Map container"
      ></div>

      {/* --- UI Buttons --- */}

      {/* ✅ NEW: Toggle GPS Info Button */}
      <button
        onClick={toggleGpsInfo}
        className={`${uiButtonClasses} right-4 md:right-8`}
        title="Show location info"
      >
        <CompassIcon />
      </button>

      {/* Geolocation Button */}
      <button
        onClick={handleGeolocation}
        className={`${uiButtonClasses} right-[4.5rem] md:right-[7rem]`}
        title="Recenter to my location"
      >
        <GeolocationIcon />
      </button>


      {/* All Events Button */}
      <button
        onClick={() => setPanelView("events")}
        className={`${uiButtonClasses} left-4 md:left-8`}
        title="Show all events"
      >
        <CalendarIcon />
      </button>

      {/* Event Panel */}
      <EventPanel
        panelView={panelView}
        activeLocation={activeLocation}
        allEvents={EVENT_DATA}
        allLocations={LOCATION_DATA}
        onClose={handleClosePanel}
        onNavigate={handleNavigation}
        onViewChange={setPanelView}
        onSelectLocation={(location) => {
          handleNavigation(location.id);
        }}
      />
    </div>
  );
}

