/**
 * Model Loader Module
 * Handles loading and processing of the 3D GLTF model
 * Sets up model shadows, calculates bounds, and positions scene elements
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { CONFIG } from "./config";

/**
 * Loads the NITC 3D model and sets up the scene accordingly
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {MapControls} controls - Camera controls
 * @param {THREE.Mesh} groundPlane - Ground plane for shadow positioning
 * @param {THREE.Camera} camera - Camera for label updates
 * @param {Function} onModelLoaded - Callback when model is loaded (receives model)
 * @param {Function} onProgress - Callback for loading progress
 * @param {Function} onError - Callback for loading errors
 */
export const loadModel = (
  scene,
  controls,
  groundPlane,
  camera,
  onModelLoaded,
  onProgress,
  onError
) => {
  // Setup DRACO loader for compressed geometry (smaller file sizes)
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

  // Setup GLTF loader with DRACO support
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  // Load the model from public folder
  loader.load(
    "/models/nitc.glb",
    (gltf) => {
      const model = gltf.scene;

      // Enable shadows for all meshes in the model
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true; // Cast shadows on other objects
          child.receiveShadow = true; // Receive shadows from other objects
        }
      });

      // Calculate bounding box to determine map boundaries
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());

      // Store calculated map bounds (used for camera clamping)
      const mapBounds = {
        MIN_X: box.min.x - CONFIG.MAP_BOUNDS.PADDING,
        MAX_X: box.max.x + CONFIG.MAP_BOUNDS.PADDING,
        MIN_Z: box.min.z - CONFIG.MAP_BOUNDS.PADDING,
        MAX_Z: box.max.z + CONFIG.MAP_BOUNDS.PADDING,
        PADDING: CONFIG.MAP_BOUNDS.PADDING,
      };

      // Center camera controls on the model
      controls.target.copy(center);

      // Position ground plane at model's lowest point
      groundPlane.position.y = box.min.y;

      // Add model to scene
      scene.add(model);

      // Notify callback with loaded model and bounds
      if (onModelLoaded) {
        onModelLoaded(model, mapBounds);
      }
    },
    (xhr) => {
      // Report loading progress
      const percentComplete = (xhr.loaded / xhr.total) * 100;
      console.log(`Model ${percentComplete.toFixed(2)}% loaded`);
      if (onProgress) {
        onProgress(percentComplete);
      }
    },
    (error) => {
      // Handle loading errors
      console.error("Error loading model:", error);
      if (onError) {
        onError(error);
      }
    }
  );
};

/**
 * Calculates the ground height at a given X,Z coordinate using raycasting
 * Used for placing markers and constraining camera height
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @param {THREE.Object3D} model - The 3D model to raycast against
 * @param {THREE.Mesh} groundPlane - Fallback ground plane
 * @param {THREE.Raycaster} raycaster - Reusable raycaster instance
 * @returns {number} - Y coordinate of ground at given position
 */
export const findGroundHeight = (x, z, model, groundPlane, raycaster) => {
  if (!model || !groundPlane) return 0;

  // Cast ray downward from high above the map
  const rayStart = new THREE.Vector3(x, 500, z);
  raycaster.set(rayStart, new THREE.Vector3(0, -1, 0)); // Ray pointing down

  // First check against model (includes buildings and terrain)
  const intersects = raycaster.intersectObject(model, true);
  if (intersects.length > 0) {
    return intersects[0].point.y;
  }

  // Fallback to ground plane if no model intersection
  const groundIntersects = raycaster.intersectObject(groundPlane);
  if (groundIntersects.length > 0) {
    return groundIntersects[0].point.y;
  }

  // Final fallback to ground plane position
  return groundPlane.position.y;
};

/**
 * Checks if a position collides with the model (for camera collision detection)
 * @param {THREE.Vector3} position - Position to check
 * @param {THREE.Object3D} model - The 3D model
 * @param {THREE.Raycaster} raycaster - Reusable raycaster instance
 * @returns {number|null} - Ground height if collision detected, null otherwise
 */
export const checkCollisionAtPosition = (position, model, raycaster) => {
  if (!model) return null;

  // Cast ray downward from above the position
  const rayStart = new THREE.Vector3(position.x, 500, position.z);
  raycaster.set(rayStart, new THREE.Vector3(0, -1, 0));
  const intersects = raycaster.intersectObject(model, true);

  if (intersects.length > 0) {
    return intersects[0].point.y;
  }

  return null;
};