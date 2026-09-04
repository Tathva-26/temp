/**
 * Configuration constants for the NITC 3D Map application
 * Contains all configurable parameters for camera, controls, map bounds, animations, and interactions
 */

import * as THREE from "three";

/**
 * Main configuration object containing all app settings
 */
export const CONFIG = {
  /**
   * Camera settings for the 3D viewport
   */
  CAMERA: {
    FOV: 60, // Field of view in degrees
    NEAR: 0.1, // Near clipping plane
    FAR: 2000, // Far clipping plane
    MIN_HEIGHT_ABOVE_TERRAIN: 5, // Minimum camera height above ground/buildings to prevent clipping
    DEFAULT_POSITION: new THREE.Vector3(0, 50, 80), // Starting camera position
    DEFAULT_TARGET: new THREE.Vector3(0, 0, 0), // Starting look-at target
  },

  /**
   * Control settings for camera movement and interaction
   */
  CONTROLS: {
    MIN_DISTANCE: 10, // Minimum zoom distance
    MAX_DISTANCE: 300, // Maximum zoom distance
    DAMPING_FACTOR: 0.05, // Smoothness of camera movement (0-1)
  },

  /**
   * Map boundary constraints to keep camera within model bounds
   * These are calculated dynamically from the model, fallback values provided
   */
  MAP_BOUNDS: {
    MIN_X: -200,
    MAX_X: 200,
    MIN_Z: -200,
    MAX_Z: 200,
    PADDING: 20, // Extra padding to prevent going too far outside model
  },

  /**
   * Animation settings for smooth transitions
   */
  ANIMATION: {
    LERP_FACTOR: 0.05, // Linear interpolation factor for smooth camera movement
    COLLISION_LERP_FACTOR: 0.3, // Faster correction when camera collides with terrain
    COMPLETION_THRESHOLD: 0.5, // Distance threshold to consider animation complete
  },

  /**
   * User interaction settings
   */
  INTERACTION: {
    DOUBLE_TAP_TIMEOUT: 300, // Milliseconds between taps to register as double-tap
    SWIPE_THRESHOLD: 10, // Pixels moved to consider gesture as swipe vs tap
  },

  /**
   * Fly-to animation settings when navigating to locations
   */
  FLY_TO: {
    CAMERA_OFFSET: { x: -30, y: 25, z: -30 }, // Camera offset from target location
  },
};

/**
 * Location data for markers on the map
 * Each location represents a building or point of interest
 */
export const LOCATION_DATA = [
  {
    id: "mb",
    name: "Main Building",
    modelCoords: new THREE.Vector3(100, 200, 150),
  },
  {
    id: "elhc",
    name: "ELHC (Electronics Lecture Hall)",
    modelCoords: new THREE.Vector3(1000, 100, 3000),
  },
  {
    id: "cse",
    name: "CSE Building",
    modelCoords: new THREE.Vector3(900, 50, -200),
  },
];

/**
 * Event data linked to locations
 * Each event is associated with a location via locationId
 */
export const EVENT_DATA = [
  {
    id: "evt1",
    name: "Inaugural Tech Talk",
    committee: "IEEE",
    time: "10:00 AM",
    locationId: "mb",
  },
  {
    id: "evt2",
    name: "Tathva Quiz Finale",
    committee: "Enquire",
    time: "2:00 PM",
    locationId: "mb",
  },
  {
    id: "evt3",
    name: "Workshop: Intro to React",
    committee: "FOSSC",
    time: "11:00 AM",
    locationId: "elhc",
  },
  {
    id: "evt4",
    name: "Code-Kombat Hackathon",
    committee: "CSEA",
    time: "9:00 AM - 5:00 PM",
    locationId: "cse",
  },
  {
    id: "evt5",
    name: "Robo-Wars",
    committee: "Robotics Club",
    time: "1:00 PM",
    locationId: "cse",
  },
];