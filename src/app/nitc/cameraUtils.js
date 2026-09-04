/**
 * Camera Utilities Module
 * Handles camera animations, boundary constraints, and collision detection
 */

import * as THREE from "three";
import { CONFIG } from "./config";

/**
 * Clamps a position to stay within map boundaries
 * @param {THREE.Vector3} position - Position to clamp
 * @param {Object} mapBounds - Map boundary object with MIN_X, MAX_X, MIN_Z, MAX_Z
 * @returns {THREE.Vector3} - Clamped position
 */
export const clampToMapBounds = (position, mapBounds) => {
  const clamped = position.clone();

  // Constrain X and Z coordinates within bounds
  clamped.x = Math.max(mapBounds.MIN_X, Math.min(mapBounds.MAX_X, clamped.x));
  clamped.z = Math.max(mapBounds.MIN_Z, Math.min(mapBounds.MAX_Z, clamped.z));

  return clamped;
};

/**
 * Animates camera to fly to a specific location
 * Sets target position and look-at point for smooth animation
 * @param {THREE.Vector3} modelCoords - Target coordinates in model space
 * @param {Function} findGroundHeight - Function to get ground height
 * @param {Object} animationRefs - Object containing targetPosition, targetLookAt, isAnimating refs
 */
export const flyToLocation = (modelCoords, findGroundHeight, animationRefs) => {
  // Find ground height at target location
  const groundY = findGroundHeight(modelCoords.x, modelCoords.z);
  
  // Create target point on the ground
  const targetPoint = new THREE.Vector3(
    modelCoords.x,
    groundY,
    modelCoords.z
  );
  
  // Position camera offset from target (angled view)
  animationRefs.targetPosition = new THREE.Vector3(
    targetPoint.x + CONFIG.FLY_TO.CAMERA_OFFSET.x,
    targetPoint.y + CONFIG.FLY_TO.CAMERA_OFFSET.y,
    targetPoint.z + CONFIG.FLY_TO.CAMERA_OFFSET.z
  );
  
  // Look at the target point
  animationRefs.targetLookAt = targetPoint;
  
  // Start animation
  animationRefs.isAnimating = true;
};

/**
 * Updates camera position during animation with smooth interpolation
 * @param {THREE.Camera} camera - The camera to animate
 * @param {MapControls} controls - Camera controls
 * @param {Object} animationRefs - Object containing animation state
 * @returns {boolean} - True if animation is still running
 */
export const updateCameraAnimation = (camera, controls, animationRefs) => {
  // Skip if not animating
  if (!animationRefs.isAnimating || 
      !animationRefs.targetPosition || 
      !animationRefs.targetLookAt) {
    return false;
  }

  // Smoothly interpolate camera position
  camera.position.lerp(
    animationRefs.targetPosition,
    CONFIG.ANIMATION.LERP_FACTOR
  );
  
  // Smoothly interpolate look-at target
  controls.target.lerp(
    animationRefs.targetLookAt,
    CONFIG.ANIMATION.LERP_FACTOR
  );

  // Check if animation is complete (close enough to target)
  const positionDistance = camera.position.distanceTo(
    animationRefs.targetPosition
  );
  const targetDistance = controls.target.distanceTo(
    animationRefs.targetLookAt
  );

  // Complete animation if within threshold
  if (
    positionDistance < CONFIG.ANIMATION.COMPLETION_THRESHOLD &&
    targetDistance < CONFIG.ANIMATION.COMPLETION_THRESHOLD
  ) {
    // Snap to exact target
    camera.position.copy(animationRefs.targetPosition);
    controls.target.copy(animationRefs.targetLookAt);
    
    // Clear animation state
    animationRefs.targetPosition = null;
    animationRefs.targetLookAt = null;
    animationRefs.isAnimating = false;
    
    controls.update();
    return false;
  }

  return true; // Still animating
};

/**
 * Applies terrain collision and boundary constraints to camera
 * Ensures camera stays within bounds and above ground/buildings
 * @param {THREE.Camera} camera - The camera
 * @param {MapControls} controls - Camera controls
 * @param {Object} mapBounds - Map boundaries
 * @param {Function} checkCollision - Function to check collision at position
 * @param {Function} findGroundHeight - Function to find ground height
 * @param {boolean} isAnimating - Whether camera is currently animating
 */
export const applyCameraConstraints = (
  camera,
  controls,
  mapBounds,
  checkCollision,
  findGroundHeight,
  isAnimating
) => {
  // Constrain camera position to map boundaries
  const clampedCameraPos = clampToMapBounds(camera.position, mapBounds);
  if (!clampedCameraPos.equals(camera.position)) {
    // Smoothly push camera back into bounds
    camera.position.lerp(
      clampedCameraPos,
      CONFIG.ANIMATION.COLLISION_LERP_FACTOR
    );
  }

  // Check for collision with terrain/buildings
  const groundHeight = checkCollision(camera.position);
  if (groundHeight !== null) {
    // Calculate minimum safe camera height
    const minCameraY = groundHeight + CONFIG.CAMERA.MIN_HEIGHT_ABOVE_TERRAIN;

    // Push camera up if too low
    if (camera.position.y < minCameraY) {
      camera.position.y +=
        (minCameraY - camera.position.y) *
        CONFIG.ANIMATION.COLLISION_LERP_FACTOR;
    }
  }

  // Constrain controls target (look-at point) only when not animating
  if (!isAnimating) {
    // Keep look-at point within bounds
    const clampedTargetPos = clampToMapBounds(controls.target, mapBounds);
    if (!clampedTargetPos.equals(controls.target)) {
      controls.target.lerp(
        clampedTargetPos,
        CONFIG.ANIMATION.COLLISION_LERP_FACTOR
      );
    }

    // Keep look-at point above ground
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
};

/**
 * Resets camera to default position and orientation
 * @param {Object} animationRefs - Object containing animation state
 */
export const resetCamera = (animationRefs) => {
  animationRefs.targetPosition = CONFIG.CAMERA.DEFAULT_POSITION.clone();
  animationRefs.targetLookAt = CONFIG.CAMERA.DEFAULT_TARGET.clone();
  animationRefs.isAnimating = true;
};