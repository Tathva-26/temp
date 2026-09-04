import ReactDOM from 'react-dom/client';
import BuildingMarkersContainer from './BuildingMarkersContainter';

const highlightBuildings = (model, scene, camera) => {
  const buildingGroups = {};
  const buildingMeshMap = new Map();

  // 1️⃣ Group meshes by building name
  model.traverse((child) => {
    if (child.isMesh) {
      let baseName = null;

      if (child.name.includes("maposm_buildings")) {
        const match = child.name.match(/maposm_buildings(\d+)/);
        if (match) baseName = `Building ${match[1]}`;
      } else if (child.name && child.name.length > 0) {
        baseName = child.name.replace(/_\d+$/, '');
      }

      if (baseName) {
        if (!buildingGroups[baseName]) buildingGroups[baseName] = [];
        buildingGroups[baseName].push(child);
        
        buildingMeshMap.set(child, baseName);
        
        // Store original material
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material;
        }
      }
    }
  });

  console.log("🏢 Found buildings:", Object.keys(buildingGroups));

  // 2️⃣ Create container for React markers
  let container = document.getElementById('building-labels');
  if (container) container.remove();

  container = document.createElement('div');
  container.id = 'building-labels';
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.pointerEvents = 'none';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = '1000';
  document.body.appendChild(container);

  const labelData = [];
  let activeBuilding = null;

  // 3️⃣ Prepare label data for React
  Object.entries(buildingGroups).forEach(([buildingName, meshes]) => {
    const box = new THREE.Box3();
    meshes.forEach((m) => box.expandByObject(m));
    const worldCenter = box.getCenter(new THREE.Vector3());
    worldCenter.y = box.max.y + 5;

    labelData.push({ worldCenter, buildingName, meshes });
  });

  // 4️⃣ Function to highlight building with PEACEFUL PULSATING WHITE-GOLD GLOW
  const highlightBuilding = (buildingName) => {
    // Clear previous highlight
    if (activeBuilding) {
      const prevData = labelData.find(d => d.buildingName === activeBuilding);
      if (prevData) {
        prevData.meshes.forEach((mesh) => {
          mesh.material = mesh.userData.originalMaterial;
          mesh.userData.pulsating = false;
        });
      }
    }

    // Apply peaceful pulsating white-gold glow
    if (buildingName) {
      const data = labelData.find(d => d.buildingName === buildingName);
      if (data) {
        // Translucent white-gold color
        const glowColor = new THREE.Color(1.0, 0.95, 0.7); // Soft white-gold

        data.meshes.forEach((mesh) => {
          mesh.material = mesh.userData.originalMaterial.clone();
          mesh.material.transparent = true;
          mesh.material.opacity = 0.85;
          
          // Peaceful pulsating emissive glow
          mesh.material.emissive = glowColor;
          mesh.material.emissiveIntensity = 0.45;
          
          // White-gold tint
          mesh.material.color.lerp(glowColor, 0.3);
          
          // Add pulsating animation
          mesh.userData.pulsating = true;
          mesh.userData.pulseTime = 0;
        });
      }
    }

    activeBuilding = buildingName;
  };

  // 5️⃣ Animate peaceful pulsating effect - SLOW AND CALMING
  const animatePulsating = () => {
    if (activeBuilding) {
      const data = labelData.find(d => d.buildingName === activeBuilding);
      if (data) {
        data.meshes.forEach((mesh) => {
          if (mesh.userData.pulsating) {
            mesh.userData.pulseTime += 0.008; // Very slow, peaceful rhythm
            const intensity = 0.45 + Math.sin(mesh.userData.pulseTime * 2) * 0.15; // Gentle wave
            mesh.material.emissiveIntensity = intensity;
            mesh.material.opacity = 0.82 + Math.sin(mesh.userData.pulseTime * 2) * 0.06; // Subtle opacity
          }
        });
      }
    }
  };

  // 6️⃣ Render React components
  const root = ReactDOM.createRoot(container);
  root.render(
    <BuildingMarkersContainer 
      labelData={labelData} 
      camera={camera}
    />
  );

  // 7️⃣ Update function (call this in your animation loop)
  const updateAllLabels = () => {
    if (!camera || !camera.matrixWorldInverse) return;
    
    // Animate peaceful pulsating buildings
    animatePulsating();
  };

  // Store functions globally
  window.highlightBuilding = highlightBuilding;
  window.getBuildingFromMesh = (mesh) => buildingMeshMap.get(mesh);

  return updateAllLabels;
};

export default highlightBuildings;