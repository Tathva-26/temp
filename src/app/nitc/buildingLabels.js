/**
 * Building Labels Module
 * Creates floating labels for buildings and handles building highlighting with subtle glow effects
 */

import * as THREE from "three";

/**
 * Sets up building highlighting system with floating labels
 * Groups building meshes, creates DOM labels, and provides highlight functionality
 * @param {THREE.Object3D} model - The loaded 3D model
 * @param {THREE.Scene} scene - The Three.js scene
 * @param {THREE.Camera} camera - Camera for label positioning
 * @returns {Function} - Update function to call every frame for label positioning
 */
export const highlightBuildings = (model, scene, camera) => {
  // Data structures for tracking buildings and labels
  const buildingGroups = {}; // Groups meshes by building name
  const buildingMeshMap = new Map(); // Maps mesh to building name
  const labelData = []; // Stores label DOM elements and positions
  let activeBuilding = null; // Currently highlighted building

  // ==========================================
  // STEP 1: Group meshes by building name
  // ==========================================
  model.traverse((child) => {
    if (child.isMesh) {
      let baseName = null;

      // Extract building name from mesh name
      if (child.name.includes("maposm_buildings")) {
        // Handle OSM building format: maposm_buildings123 -> "Building 123"
        const match = child.name.match(/maposm_buildings(\d+)/);
        if (match) baseName = `Building ${match[1]}`;
      } else if (child.name && child.name.length > 0) {
        // Remove trailing numbers from other naming patterns
        baseName = child.name.replace(/_\d+$/, '');
      }

      // Group meshes by building name
      if (baseName) {
        if (!buildingGroups[baseName]) buildingGroups[baseName] = [];
        buildingGroups[baseName].push(child);
        
        // Create reverse mapping for quick lookups
        buildingMeshMap.set(child, baseName);
        
        // Store original material for restoration later
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material;
        }
      }
    }
  });

  console.log("🏢 Found buildings:", Object.keys(buildingGroups));

  // ==========================================
  // STEP 2: Create DOM container for labels
  // ==========================================
  // Remove existing container if present (for hot reload)
  let container = document.getElementById('building-labels');
  if (container) container.remove();

  // Create new container overlay
  container = document.createElement('div');
  container.id = 'building-labels';
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.pointerEvents = 'none'; // Don't block mouse events
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = '1000'; // Render above canvas
  document.body.appendChild(container);

  // ==========================================
  // STEP 3: Create labels for each building
  // ==========================================
  Object.entries(buildingGroups).forEach(([buildingName, meshes]) => {
    // Calculate bounding box for entire building group
    const box = new THREE.Box3();
    meshes.forEach((m) => box.expandByObject(m));
    
    // Position label above building
    const worldCenter = box.getCenter(new THREE.Vector3());
    worldCenter.y = box.max.y + 5; // Offset above roof

    // Create DOM label element
    const label = document.createElement('div');
    label.textContent = buildingName;
    
    // Style label with dark background and white text
    label.style.position = 'absolute';
    label.style.padding = '6px 12px';
    label.style.background = 'rgba(0, 0, 0, 0.7)';
    label.style.color = '#fff';
    label.style.fontSize = '13px';
    label.style.fontWeight = '600';
    label.style.borderRadius = '8px';
    label.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    label.style.whiteSpace = 'nowrap';
    label.style.transition = 'all 0.3s ease';
    
    container.appendChild(label);

    // Store label data for updates
    labelData.push({ label, worldCenter, buildingName, meshes });
  });

  // ==========================================
  // STEP 4: Highlight function with minimal glow
  // ==========================================
  /**
   * Highlights a building with subtle glow effect
   * @param {string} buildingName - Name of building to highlight (null to clear)
   */
  const highlightBuilding = (buildingName) => {
    // Clear previous highlight
    if (activeBuilding) {
      const prevData = labelData.find(d => d.buildingName === activeBuilding);
      if (prevData) {
        // Restore original materials
        prevData.meshes.forEach((mesh) => {
          mesh.material = mesh.userData.originalMaterial;
        });
        
        // Reset label style to normal
        prevData.label.style.background = 'rgba(0, 0, 0, 0.7)';
        prevData.label.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        prevData.label.style.boxShadow = 'none';
        prevData.label.style.transform = prevData.label.style.transform.replace(/scale\([^)]+\)/, '');
      }
    }

    // Apply new highlight with MINIMAL glow
    if (buildingName) {
      const data = labelData.find(d => d.buildingName === buildingName);
      if (data) {
        // Soft cyan/blue glow color
        const glowColor = new THREE.Color(0.3, 0.6, 1.0);

        data.meshes.forEach((mesh) => {
          // Clone material to avoid affecting other objects
          mesh.material = mesh.userData.originalMaterial.clone();
          
          // Apply MINIMAL emissive glow (very subtle)
          mesh.material.emissive = glowColor;
          mesh.material.emissiveIntensity = 0.15; // Subtle glow
          
          // Very slight color tint
          mesh.material.color.lerp(glowColor, 0.08);
        });

        // Enhance label appearance
        data.label.style.background = `linear-gradient(135deg, rgba(76, 153, 255, 0.5), rgba(0,0,0,0.8))`;
        data.label.style.border = `1px solid rgba(76, 153, 255, 0.6)`;
        data.label.style.boxShadow = `0 2px 12px rgba(76, 153, 255, 0.4)`;
        
        // Slight scale increase for emphasis
        const currentTransform = data.label.style.transform || '';
        data.label.style.transform = currentTransform + ' scale(1.05)';
      }
    }

    activeBuilding = buildingName;
  };

  // ==========================================
  // STEP 5: Label position update function
  // ==========================================
  /**
   * Updates all label positions based on camera view
   * Should be called every frame in animation loop
   */
  const updateAllLabels = () => {
    if (!camera || !camera.matrixWorldInverse) return;

    labelData.forEach(({ label, worldCenter }) => {
      const distance = camera.position.distanceTo(worldCenter);

      // Hide labels that are too far away
      if (distance > 200) {
        label.style.display = 'none';
        return;
      }

      // Project 3D world position to 2D screen space
      const vector = worldCenter.clone();
      vector.project(camera);

      // Hide labels behind camera or outside frustum
      if (vector.z > 1 || vector.z < -1) {
        label.style.display = 'none';
        return;
      }

      if (vector.x < -1 || vector.x > 1 || vector.y < -1 || vector.y > 1) {
        label.style.display = 'none';
        return;
      }

      // Convert normalized device coordinates to screen pixels
      label.style.display = 'block';
      const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
      label.style.left = `${x}px`;
      label.style.top = `${y}px`;

      // Scale and fade labels based on distance
      const scale = Math.max(0.6, Math.min(1.2, 100 / distance));
      const opacity = Math.max(0.4, Math.min(1, 150 / distance));
      
      // Preserve highlight scale if active
      const baseTransform = `translate(-50%, -100%) scale(${scale})`;
      if (label.style.transform.includes('scale(1.05)')) {
        label.style.transform = baseTransform + ' scale(1.05)';
      } else {
        label.style.transform = baseTransform;
      }
      
      label.style.opacity = opacity;
    });
  };

  // ==========================================
  // STEP 6: Expose functions globally
  // ==========================================
  // Make functions available to other modules
  window.highlightBuilding = highlightBuilding;
  window.getBuildingFromMesh = (mesh) => buildingMeshMap.get(mesh);

  // Return update function for animation loop
  return updateAllLabels;
};

/**
 * Cleanup function to remove building labels container
 * Call this when unmounting the component
 */
export const cleanupBuildingLabels = () => {
  const labelContainer = document.getElementById("building-labels");
  if (labelContainer) labelContainer.remove();
};