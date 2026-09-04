/**
 * Interaction Handlers Module
 * Manages all user input: mouse clicks, touches, keyboard, and resize events
 * Handles marker selection, double-tap to fly, and pan detection
 */

import * as THREE from "three";
import { CONFIG } from "./config";

/**
 * Gets the position from mouse or touch event
 * @param {Event} event - Mouse or touch event
 * @returns {Object} - Object with clientX and clientY properties
 */
const getEventPosition = (event) => {
  // Handle touch events
  if (event.touches) {
    return event.touches[0] || event.changedTouches[0];
  }
  // Handle mouse events
  return event;
};

/**
 * Sets up all event handlers for user interaction
 * @param {WebGLRenderer} renderer - Three.js renderer
 * @param {Camera} camera - Three.js camera
 * @param {MapControls} controls - Camera controls
 * @param {THREE.Raycaster} raycaster - Raycaster for object picking
 * @param {Object} refs - Object containing various scene references
 * @param {Object} callbacks - Object containing callback functions
 * @returns {Object} - Handler functions for cleanup
 */
export const setupEventHandlers = (
  renderer,
  camera,
  controls,
  raycaster,
  refs,
  callbacks
) => {
  // Destructure references
  const { markersGroup, model, groundPlane } = refs;
  
  // Destructure callbacks
  const {
    onMarkerClick,
    onDoubleClick,
    onPanelClose,
    onAnimationCancel,
  } = callbacks;

  // ==========================================
  // State for interaction tracking
  // ==========================================
  let lastTapTime = 0; // Track time between taps for double-tap detection
  const tapStartPos = new THREE.Vector2(); // Starting position of tap/click
  let isSwiping = false; // Whether user is currently swiping/panning

  // ==========================================
  // HANDLER: Window Resize
  // ==========================================
  /**
   * Updates camera and renderer on window resize
   */
  const handleResize = () => {
    if (!renderer || !camera) return;

    const mount = renderer.domElement.parentElement;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Update camera aspect ratio
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(width, height);
  };

  // ==========================================
  // HANDLER: Keyboard Input
  // ==========================================
  /**
   * Handles keyboard shortcuts (e.g., 'R' to reset camera)
   */
  const handleKeyDown = (event) => {
    // Reset camera on 'R' key press
    if (event.key.toLowerCase() === "r") {
      if (onAnimationCancel) {
        onAnimationCancel(); // This will trigger camera reset
      }
    }
  };

  // ==========================================
  // HANDLER: Tap/Click Start
  // ==========================================
  /**
   * Records initial tap/click position to detect swipes
   */
  const handleTapStart = (event) => {
    isSwiping = false;
    const pos = getEventPosition(event);
    tapStartPos.set(pos.clientX, pos.clientY);
  };

  // ==========================================
  // HANDLER: Tap/Click Move
  // ==========================================
  /**
   * Detects if user is swiping/panning based on movement distance
   */
  const handleTapMove = (event) => {
    if (isSwiping) return; // Already detected as swipe

    const pos = getEventPosition(event);
    const distance = tapStartPos.distanceTo(
      new THREE.Vector2(pos.clientX, pos.clientY)
    );

    // If moved beyond threshold, consider it a swipe
    if (distance > CONFIG.INTERACTION.SWIPE_THRESHOLD) {
      isSwiping = true;
    }
  };

  // ==========================================
  // HANDLER: Tap/Click End (Main Interaction)
  // ==========================================
  /**
   * Handles tap/click end - detects marker clicks, double-taps, or single taps
   * This is the main interaction handler for the map
   */
  const handleTapEnd = (event) => {
    // Ignore if user was swiping/panning
    if (isSwiping) {
      isSwiping = false;
      return;
    }

    const now = performance.now();
    const timeSinceLastTap = now - lastTapTime;

    // Get normalized mouse/touch coordinates (-1 to +1)
    const input = getEventPosition(event);
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((input.clientX - rect.left) / rect.width) * 2 - 1,
      -((input.clientY - rect.top) / rect.height) * 2 + 1
    );

    // Setup raycaster for object picking
    raycaster.setFromCamera(mouse, camera);

    // ==========================================
    // PRIORITY 1: Check for marker clicks
    // ==========================================
    const markerIntersects = raycaster.intersectObjects(
      markersGroup.children,
      false // Don't check descendants
    );

    if (markerIntersects.length > 0) {
      // User clicked on a marker
      event.preventDefault();
      const clickedMarker = markerIntersects[0].object;
      const locationId = clickedMarker.userData.id;

      // Notify callback with clicked marker
      if (onMarkerClick) {
        onMarkerClick(locationId, clickedMarker);
      }

      lastTapTime = 0; // Reset tap timer
      return; // Stop processing
    }

    // ==========================================
    // PRIORITY 2: Check for double-tap (fly to location)
    // ==========================================
    if (timeSinceLastTap < CONFIG.INTERACTION.DOUBLE_TAP_TIMEOUT) {
      // This is a double-tap!
      event.preventDefault();

      // Raycast against model and ground to find clicked point
      const intersects = raycaster.intersectObjects(
        [model, groundPlane].filter(Boolean),
        true // Check all descendants
      );

      if (intersects.length > 0) {
        const point = intersects[0].point;
        
        // Notify callback to fly to clicked point
        if (onDoubleClick) {
          onDoubleClick(point);
        }
      }

      lastTapTime = 0; // Reset tap timer
      return;
    }

    // ==========================================
    // PRIORITY 3: Single tap on empty space (close panel)
    // ==========================================
    if (onPanelClose) {
      onPanelClose();
    }

    // Update last tap time for double-tap detection
    lastTapTime = now;
  };

  // ==========================================
  // HANDLER: Controls Start (Pan/Zoom/Rotate)
  // ==========================================
  /**
   * Called when user starts interacting with camera controls
   * Cancels any ongoing animations and closes UI panels
   */
  const handleControlsStart = () => {
    // Cancel camera animation if user takes manual control
    if (onAnimationCancel) {
      onAnimationCancel();
    }

    // Close any open panels
    if (onPanelClose) {
      onPanelClose();
    }
  };

  // ==========================================
  // Attach all event listeners
  // ==========================================
  window.addEventListener("resize", handleResize);
  window.addEventListener("keydown", handleKeyDown);
  
  // Mouse events
  renderer.domElement.addEventListener("mousedown", handleTapStart, {
    passive: true,
  });
  renderer.domElement.addEventListener("mousemove", handleTapMove, {
    passive: true,
  });
  renderer.domElement.addEventListener("mouseup", handleTapEnd);
  
  // Touch events
  renderer.domElement.addEventListener("touchstart", handleTapStart, {
    passive: true,
  });
  renderer.domElement.addEventListener("touchmove", handleTapMove, {
    passive: true,
  });
  renderer.domElement.addEventListener("touchend", handleTapEnd);
  
  // Controls events
  controls.addEventListener("start", handleControlsStart);

  // Return handlers for cleanup
  return {
    handleResize,
    handleKeyDown,
    handleTapStart,
    handleTapMove,
    handleTapEnd,
    handleControlsStart,
  };
};

/**
 * Removes all event listeners
 * @param {WebGLRenderer} renderer - Three.js renderer
 * @param {MapControls} controls - Camera controls
 * @param {Object} handlers - Handler functions from setupEventHandlers
 */
export const cleanupEventHandlers = (renderer, controls, handlers) => {
  // Remove window events
  window.removeEventListener("resize", handlers.handleResize);
  window.removeEventListener("keydown", handlers.handleKeyDown);

  // Remove renderer events
  if (renderer.domElement) {
    renderer.domElement.removeEventListener("mousedown", handlers.handleTapStart);
    renderer.domElement.removeEventListener("touchstart", handlers.handleTapStart);
    renderer.domElement.removeEventListener("mousemove", handlers.handleTapMove);
    renderer.domElement.removeEventListener("touchmove", handlers.handleTapMove);
    renderer.domElement.removeEventListener("mouseup", handlers.handleTapEnd);
    renderer.domElement.removeEventListener("touchend", handlers.handleTapEnd);
  }

  // Remove controls events
  if (controls && handlers.handleControlsStart) {
    controls.removeEventListener("start", handlers.handleControlsStart);
  }
};