/**
 * Animation Loop Module
 * Manages the main render loop, camera animations, and per-frame updates
 */

import { updateCameraAnimation, applyCameraConstraints } from "./cameraUtils";

/**
 * Starts the main animation/render loop
 * @param {WebGLRenderer} renderer - Three.js renderer
 * @param {Scene} scene - Three.js scene
 * @param {Camera} camera - Three.js camera
 * @param {MapControls} controls - Camera controls
 * @param {Object} animationRefs - Object containing animation state
 * @param {Object} mapBounds - Map boundary constraints
 * @param {Function} checkCollision - Function to check terrain collision
 * @param {Function} findGroundHeight - Function to find ground height
 * @returns {number} - Animation frame ID for cleanup
 */
export const startAnimationLoop = (
  renderer,
  scene,
  camera,
  controls,
  animationRefs,
  mapBounds,
  checkCollision,
  findGroundHeight
) => {
  let animationFrameId;

  /**
   * Main animation function called every frame
   * Handles camera animation, constraints, label updates, and rendering
   */
  const animate = () => {
    // Schedule next frame
    animationFrameId = requestAnimationFrame(animate);

    // ==========================================
    // STEP 1: Update camera animation (if active)
    // ==========================================
    if (animationRefs.isAnimating) {
      updateCameraAnimation(camera, controls, animationRefs);
    }

    // ==========================================
    // STEP 2: Update camera controls (damping, etc.)
    // ==========================================
    controls.update();

    // ==========================================
    // STEP 3: Apply terrain collision and boundary constraints
    // ==========================================
    applyCameraConstraints(
      camera,
      controls,
      mapBounds,
      checkCollision,
      findGroundHeight,
      animationRefs.isAnimating
    );

    // ==========================================
    // STEP 4: Update building labels (if system is active)
    // ==========================================
    // Building label system stores update function globally
    if (window.updateBuildingLabels) {
      window.updateBuildingLabels();
    }

    // ==========================================
    // STEP 5: Render the scene
    // ==========================================
    renderer.render(scene, camera);
  };

  // Start the loop
  animate();

  // Return frame ID for cleanup
  return animationFrameId;
};

/**
 * Stops the animation loop
 * @param {number} animationFrameId - Frame ID returned from startAnimationLoop
 */
export const stopAnimationLoop = (animationFrameId) => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
};