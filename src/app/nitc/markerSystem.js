/**
 * Marker System Module
 * Manages 3D markers (pins) for locations on the map
 * Handles marker creation, positioning, and highlighting
 */

import * as THREE from "three";
import { LOCATION_DATA } from "./config";

/**
 * Creates shared materials for markers (optimization - reuse materials)
 * @returns {Object} - Contains normal and highlight materials
 */
export const createMarkerMaterials = () => {
  // Normal marker appearance (red, semi-transparent)
  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.8,
    depthTest: false, // Always render on top
  });

  // Highlighted marker appearance (yellow, fully opaque)
  const highlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 1.0,
    depthTest: false,
  });

  return { markerMaterial, highlightMaterial };
};

/**
 * Creates 3D markers for all locations and adds them to a group
 * @param {THREE.Group} markersGroup - Group to add markers to
 * @param {THREE.Material} markerMaterial - Shared material for markers
 * @param {Function} findGroundHeight - Function to get ground height at position
 * @returns {THREE.Group} - The markers group with all markers added
 */
export const createMarkers = (markersGroup, markerMaterial, findGroundHeight) => {
  // Create cone geometry for marker (upside-down cone/pin shape)
  const markerGeometry = new THREE.ConeGeometry(1, 4, 8); // radius, height, segments
  markerGeometry.translate(0, 2, 0); // Move base to origin (pivot at bottom)
  markerGeometry.rotateX(Math.PI); // Flip upside down to point downward

  // Create a marker for each location in LOCATION_DATA
  LOCATION_DATA.forEach((location) => {
    const { x, z } = location.modelCoords;
    
    // Find the ground height at this location
    const y = findGroundHeight(x, z);
    
    // Create marker mesh with shared material
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    
    // Position marker above ground with offset
    marker.position.set(x, y + 5, z);
    marker.scale.set(1.5, 1.5, 1.5); // Normal size
    
    // Store location data in marker for click detection
    marker.userData = { 
      id: location.id, 
      type: "marker" 
    };
    
    // Add to markers group
    markersGroup.add(marker);
  });

  return markersGroup;
};

/**
 * Highlights a specific marker and resets the previously highlighted one
 * @param {THREE.Mesh} markerToHighlight - Marker to highlight (null to clear)
 * @param {THREE.Mesh} activeMarker - Currently active marker
 * @param {THREE.Material} normalMaterial - Normal marker material
 * @param {THREE.Material} highlightMaterial - Highlighted marker material
 * @returns {THREE.Mesh|null} - The newly active marker
 */
export const highlightMarker = (
  markerToHighlight,
  activeMarker,
  normalMaterial,
  highlightMaterial
) => {
  // Reset previously highlighted marker
  if (activeMarker && activeMarker !== markerToHighlight) {
    activeMarker.material = normalMaterial;
    activeMarker.scale.set(1.5, 1.5, 1.5); // Reset to normal size
  }

  // Highlight new marker
  if (markerToHighlight) {
    markerToHighlight.material = highlightMaterial;
    markerToHighlight.scale.set(2.0, 2.0, 2.0); // Make slightly bigger
    return markerToHighlight;
  }

  return null; // No active marker
};

/**
 * Finds a marker by its location ID
 * @param {THREE.Group} markersGroup - Group containing all markers
 * @param {string} locationId - ID of the location to find
 * @returns {THREE.Mesh|undefined} - The marker mesh if found
 */
export const findMarkerById = (markersGroup, locationId) => {
  return markersGroup.children.find((marker) => marker.userData.id === locationId);
};