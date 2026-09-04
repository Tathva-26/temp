/**
 * Cleanup Utilities Module
 * Handles proper disposal of Three.js resources to prevent memory leaks
 * Important for React component unmounting and hot reloading
 */

/**
 * Properly disposes of a Three.js material
 * @param {THREE.Material|Array<THREE.Material>} material - Material(s) to dispose
 */
const disposeMaterial = (material) => {
  if (Array.isArray(material)) {
    // Handle material arrays
    material.forEach((mat) => {
      if (mat && mat.isMaterial) {
        mat.dispose();
      }
    });
  } else if (material && material.isMaterial) {
    // Handle single material
    material.dispose();
    
    // Dispose textures if present
    if (material.map) material.map.dispose();
    if (material.lightMap) material.lightMap.dispose();
    if (material.bumpMap) material.bumpMap.dispose();
    if (material.normalMap) material.normalMap.dispose();
    if (material.specularMap) material.specularMap.dispose();
    if (material.envMap) material.envMap.dispose();
  }
};

/**
 * Recursively disposes of all geometries and materials in a scene
 * @param {THREE.Scene} scene - Scene to clean up
 */
export const disposeScene = (scene) => {
  if (!scene) return;

  // Traverse entire scene hierarchy
  scene.traverse((object) => {
    // Dispose geometries
    if (object.geometry) {
      object.geometry.dispose();
    }

    // Dispose materials
    if (object.material) {
      disposeMaterial(object.material);
    }

    // Dispose textures on materials
    if (object.material && object.material.map) {
      object.material.map.dispose();
    }
  });

  // Remove all children from scene
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
};

/**
 * Disposes of marker group and its resources
 * @param {THREE.Group} markersGroup - Group containing marker meshes
 */
export const disposeMarkers = (markersGroup) => {
  if (!markersGroup) return;

  markersGroup.children.forEach((marker) => {
    if (marker.isMesh) {
      // Dispose geometry (material is shared, so don't dispose here)
      if (marker.geometry) {
        marker.geometry.dispose();
      }
    }
  });
};

/**
 * Disposes of shared marker materials
 * @param {THREE.Material} markerMaterial - Normal marker material
 * @param {THREE.Material} highlightMaterial - Highlight marker material
 */
export const disposeMarkerMaterials = (markerMaterial, highlightMaterial) => {
  if (markerMaterial) markerMaterial.dispose();
  if (highlightMaterial) highlightMaterial.dispose();
};

/**
 * Main cleanup function to dispose of all Three.js resources
 * Call this when unmounting the component
 * @param {HTMLElement} mount - DOM mount element
 * @param {WebGLRenderer} renderer - Three.js renderer
 * @param {THREE.Scene} scene - Three.js scene
 * @param {THREE.Group} markersGroup - Markers group
 * @param {THREE.Material} markerMaterial - Normal marker material
 * @param {THREE.Material} highlightMaterial - Highlight marker material
 */
export const cleanup = (
  mount,
  renderer,
  scene,
  markersGroup,
  markerMaterial,
  highlightMaterial
) => {
  // Remove renderer from DOM
  if (mount && renderer && renderer.domElement.parentElement === mount) {
    mount.removeChild(renderer.domElement);
  }

  // Dispose renderer
  if (renderer) {
    renderer.dispose();
  }

  // Dispose scene resources
  disposeScene(scene);

  // Dispose marker resources
  disposeMarkers(markersGroup);
  disposeMarkerMaterials(markerMaterial, highlightMaterial);

  console.log("✅ Three.js resources cleaned up");
};