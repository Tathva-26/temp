'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// --- 1. GEOSPATIAL CONVERSION UTILITIES ---

/**
 * CONFIGURATION: Calibrated with multiple reference points
 */
const GEOSPATIAL_CONFIG = {
  // Primary reference point - NLHC (New Lecture Hall Complex)
  REFERENCE_POINT_GPS: { lat: 11.321636, lon: 75.933101 },
  REFERENCE_POINT_MODEL: new THREE.Vector3(201.73, 52.24, -445.55),
  
  // Secondary reference points for verification and improved accuracy
  SECONDARY_POINTS: [
    {
      name: 'OAT (Open Air Theatre)',
      gps: { lat: 11.322136, lon: 75.933371 },
      model: new THREE.Vector3(233.37, 53.90, -503.22)
    },
    {
      name: 'ELHC Pits',
      gps: { lat: 11.322564, lon: 75.933865 },
      model: new THREE.Vector3(279.25, 53.93, -549.80)
    },
    {
      name: 'Aryabhatta/Chanakya/Bhaskara Hostels',
      gps: { lat: 11.320844, lon: 75.933944 },
      model: new THREE.Vector3(275.31, 57.48, -354.41)
    }
  ],
  
  // Calculated MODEL_SCALE (will be computed from reference points)
  MODEL_SCALE: 1.0, // Will be auto-calculated
  
  // Rotation offset if your model's north doesn't align with true north (in radians)
  MODEL_ROTATION_OFFSET: 0,
};

// Calculate optimal MODEL_SCALE from multiple reference points
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
    }
  ];

  const scales = points.map(({ gps1, model1, gps2, model2 }) => {
    const realDistance = haversineDistance(gps1, gps2);
    const modelDistance = Math.sqrt(
      Math.pow(model2.x - model1.x, 2) + 
      Math.pow(model2.z - model1.z, 2)
    );
    return realDistance / modelDistance;
  });

  const avgScale = scales.reduce((a, b) => a + b, 0) / scales.length;
  
  console.log('=== MODEL SCALE CALCULATION ===');
  console.log('Individual scales:', scales.map(s => s.toFixed(3)));
  console.log('Average MODEL_SCALE:', avgScale.toFixed(3), 'meters per unit');
  console.log('Scale variance:', Math.max(...scales) - Math.min(...scales));
  console.log('===============================');
  
  GEOSPATIAL_CONFIG.MODEL_SCALE = avgScale;
  return avgScale;
}

// Calculate the center point of all reference points for better framing
function getCampusCenter() {
  const allPoints = [
    GEOSPATIAL_CONFIG.REFERENCE_POINT_MODEL,
    ...GEOSPATIAL_CONFIG.SECONDARY_POINTS.map(p => p.model)
  ];
  
  const center = new THREE.Vector3(
    allPoints.reduce((sum, p) => sum + p.x, 0) / allPoints.length,
    allPoints.reduce((sum, p) => sum + p.y, 0) / allPoints.length,
    allPoints.reduce((sum, p) => sum + p.z, 0) / allPoints.length
  );
  
  console.log('Campus center point:', center);
  return center;
}

const CAMPUS_CENTER = getCampusCenter();

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
  const { REFERENCE_POINT_GPS, REFERENCE_POINT_MODEL, MODEL_SCALE, MODEL_ROTATION_OFFSET } = GEOSPATIAL_CONFIG;

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

  // Apply rotation if model is rotated relative to true north
  if (MODEL_ROTATION_OFFSET !== 0) {
    const rotatedX = xOffset * Math.cos(MODEL_ROTATION_OFFSET) - zOffset * Math.sin(MODEL_ROTATION_OFFSET);
    const rotatedZ = xOffset * Math.sin(MODEL_ROTATION_OFFSET) + zOffset * Math.cos(MODEL_ROTATION_OFFSET);
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

// --- 2. GPS TRACKING HOOK ---

function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
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

// --- 3. 3D COMPONENTS ---

function GpsMarker({ gpsPosition, color = 'red', size = 5, label }) {
  const scenePosition = gpsToScene(gpsPosition);

  return (
    <group position={scenePosition}>
      <mesh position={[0, size, 0]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      {/* Vertical beam to help spot markers */}
      <mesh position={[0, size / 2, 0]}>
        <cylinderGeometry args={[0.5, 0.5, size]} />
        <meshStandardMaterial color={color} transparent opacity={0.5} />
      </mesh>
      {/* Label if provided */}
      {label && (
        <mesh position={[0, size * 2 + 5, 0]}>
          <sphereGeometry args={[2, 8, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}
    </group>
  );
}

// Component to show all calibration points
function CalibrationMarkers() {
  return (
    <>
      {/* Primary reference point */}
      <GpsMarker 
        gpsPosition={GEOSPATIAL_CONFIG.REFERENCE_POINT_GPS} 
        color="green" 
        size={4}
        label="NLHC"
      />
      
      {/* Secondary points */}
      {GEOSPATIAL_CONFIG.SECONDARY_POINTS.map((point, idx) => (
        <GpsMarker 
          key={idx}
          gpsPosition={point.gps} 
          color="orange" 
          size={3}
          label={point.name}
        />
      ))}
    </>
  );
}

function Model({ onTerrainLoad }) {
  const gltf = useGLTF('/models/nitc.glb');
  
  useEffect(() => {
    if (gltf.scene) {
      // Calculate the bounding box to understand model size and position
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      console.log('=== MODEL INFO ===');
      console.log('Center:', center);
      console.log('Size:', size);
      console.log('Min:', box.min);
      console.log('Max:', box.max);
      console.log('==================');
      
      // Pass terrain data to parent
      if (onTerrainLoad) {
        onTerrainLoad(gltf.scene);
      }
    }
  }, [gltf, onTerrainLoad]);
  
  if (!gltf || !gltf.scene) {
    console.error('Model not loaded properly');
    return null;
  }
  
  return <primitive object={gltf.scene} scale={1} />;
}

function FirstPersonControls({ startPosition, keysRef, terrain }) {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef({ forward: false, backward: false, left: false, right: false });
  const initialized = useRef(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const touchMove = useRef({ x: 0, y: 0 });
  const isTouching = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());

  const CAMERA_HEIGHT = 5;
  const MOVE_SPEED = 600;
  const TOUCH_SENSITIVITY = 0.002;

  // Function to get terrain height at a position
  const getTerrainHeight = (x, z) => {
    if (!terrain) return 0;

    raycaster.current.set(
      new THREE.Vector3(x, 1000, z),
      new THREE.Vector3(0, -1, 0)
    );

    const intersects = raycaster.current.intersectObject(terrain, true);
    if (intersects.length > 0) {
      return intersects[0].point.y;
    }
    return 0;
  };

  // Expose keys to parent via ref
  useEffect(() => {
    if (keysRef) {
      keysRef.current = keys.current;
    }
  }, [keysRef]);

  // Set initial camera position based on GPS
  useEffect(() => {
    if (startPosition && !initialized.current) {
      const scenePos = gpsToScene(startPosition);
      
      const distanceFromCenter = Math.sqrt(
        scenePos.x * scenePos.x + scenePos.z * scenePos.z
      );
      
      if (distanceFromCenter > 2000) {
        console.warn('GPS location is too far from model. Using default camera position.');
        console.log('Your GPS would place you at:', scenePos);
        console.log('Distance from model center:', distanceFromCenter.toFixed(0), 'units');
        camera.position.set(CAMPUS_CENTER.x - 100, 250, CAMPUS_CENTER.z + 300);
        camera.lookAt(CAMPUS_CENTER.x, CAMPUS_CENTER.y, CAMPUS_CENTER.z);
      } else {
        camera.position.set(scenePos.x, scenePos.y + CAMERA_HEIGHT, scenePos.z);
        console.log('Camera positioned at GPS location:', scenePos);
      }
      initialized.current = true;
    } else if (!startPosition && !initialized.current) {
      camera.position.set(CAMPUS_CENTER.x - 100, 250, CAMPUS_CENTER.z + 300);
      camera.lookAt(CAMPUS_CENTER.x, CAMPUS_CENTER.y, CAMPUS_CENTER.z);
      console.log('Camera positioned at default location (no GPS)');
      initialized.current = true;
    }
  }, [startPosition, camera]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'ArrowUp': case 'KeyW': keys.current.forward = true; break;
        case 'ArrowDown': case 'KeyS': keys.current.backward = true; break;
        case 'ArrowLeft': case 'KeyA': keys.current.left = true; break;
        case 'ArrowRight': case 'KeyD': keys.current.right = true; break;
      }
    };
    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'ArrowUp': case 'KeyW': keys.current.forward = false; break;
        case 'ArrowDown': case 'KeyS': keys.current.backward = false; break;
        case 'ArrowLeft': case 'KeyA': keys.current.left = false; break;
        case 'ArrowRight': case 'KeyD': keys.current.right = false; break;
      }
    };

    // Touch event handlers for mobile
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchMove.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        isTouching.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && isTouching.current) {
        touchMove.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        
        const deltaX = touchMove.current.x - touchStart.current.x;
        const deltaY = touchMove.current.y - touchStart.current.y;
        
        // Rotate camera based on touch movement
        camera.rotation.y -= deltaX * TOUCH_SENSITIVITY;
        camera.rotation.x -= deltaY * TOUCH_SENSITIVITY;
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
        
        touchStart.current = { x: touchMove.current.x, y: touchMove.current.y };
      }
    };

    const handleTouchEnd = () => {
      isTouching.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [camera]);

  useFrame((_, delta) => {
    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;

    direction.current.z = Number(keys.current.forward) - Number(keys.current.backward);
    direction.current.x = Number(keys.current.right) - Number(keys.current.left);
    direction.current.normalize();

    if (keys.current.forward || keys.current.backward)
      velocity.current.z -= direction.current.z * MOVE_SPEED * delta;
    if (keys.current.left || keys.current.right)
      velocity.current.x -= direction.current.x * MOVE_SPEED * delta;

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    camera.position.addScaledVector(forward, velocity.current.z * delta);
    camera.position.addScaledVector(right, velocity.current.x * delta);

    // Keep camera above terrain
    const terrainHeight = getTerrainHeight(camera.position.x, camera.position.z);
    const minHeight = terrainHeight + CAMERA_HEIGHT;
    
    if (camera.position.y < minHeight) {
      camera.position.y = minHeight;
    }
  });

  return null;
}

// Dynamic location marker that updates with GPS
function DynamicLocationMarker({ gpsPosition }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Animate the marker with a pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  if (!gpsPosition) return null;

  const scenePosition = gpsToScene(gpsPosition);

  return (
    <group position={scenePosition}>
      {/* Pulsing sphere marker */}
      <mesh ref={meshRef} position={[0, 5, 0]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshStandardMaterial 
          color="#0099ff" 
          emissive="#0099ff" 
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Vertical beam */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 5]} />
        <meshStandardMaterial 
          color="#0099ff" 
          transparent 
          opacity={0.6} 
        />
      </mesh>
      
      {/* Ground circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[2, 4, 32]} />
        <meshStandardMaterial 
          color="#0099ff" 
          transparent 
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Arrow pointing up */}
      <mesh position={[0, 10, 0]}>
        <coneGeometry args={[2, 4, 8]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff" 
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

// --- 4. CALIBRATION HELPER ---

function CalibrationHelper() {
  const { camera } = useThree();
  const [showHelper, setShowHelper] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'KeyC') {
        const pos = camera.position;
        console.log('=== CALIBRATION DATA ===');
        console.log('Camera Position:', { x: pos.x.toFixed(2), y: pos.y.toFixed(2), z: pos.z.toFixed(2) });
        console.log('Copy this to REFERENCE_POINT_MODEL: new THREE.Vector3(' + 
          pos.x.toFixed(2) + ', ' + pos.y.toFixed(2) + ', ' + pos.z.toFixed(2) + ')');
        console.log('Now get your GPS coordinates and add them to REFERENCE_POINT_GPS');
        setShowHelper(true);
        setTimeout(() => setShowHelper(false), 3000);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [camera]);

  return showHelper ? (
    <mesh position={[camera.position.x, camera.position.y + 10, camera.position.z]}>
      <sphereGeometry args={[2, 16, 16]} />
      <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={2} />
    </mesh>
  ) : null;
}

// --- 5. MAIN PAGE COMPONENT ---

// Mobile control buttons component
function MobileControls({ onMove }) {
  const buttonStyle = {
    position: 'absolute',
    width: '60px',
    height: '60px',
    background: 'rgba(255, 255, 255, 0.8)',
    border: '2px solid #333',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    userSelect: 'none',
    touchAction: 'none',
    cursor: 'pointer',
  };

  const handleTouchStart = (direction) => (e) => {
    e.preventDefault();
    onMove(direction, true);
  };

  const handleTouchEnd = (direction) => (e) => {
    e.preventDefault();
    onMove(direction, false);
  };

  return (
    <div style={{ position: 'absolute', bottom: '80px', right: '20px', zIndex: 10 }}>
      {/* Forward */}
      <div
        style={{ ...buttonStyle, bottom: '140px', right: '70px' }}
        onTouchStart={handleTouchStart('forward')}
        onTouchEnd={handleTouchEnd('forward')}
        onMouseDown={handleTouchStart('forward')}
        onMouseUp={handleTouchEnd('forward')}
        onMouseLeave={handleTouchEnd('forward')}
      >
        ↑
      </div>
      {/* Left */}
      <div
        style={{ ...buttonStyle, bottom: '70px', right: '140px' }}
        onTouchStart={handleTouchStart('left')}
        onTouchEnd={handleTouchEnd('left')}
        onMouseDown={handleTouchStart('left')}
        onMouseUp={handleTouchEnd('left')}
        onMouseLeave={handleTouchEnd('left')}
      >
        ←
      </div>
      {/* Right */}
      <div
        style={{ ...buttonStyle, bottom: '70px', right: '0px' }}
        onTouchStart={handleTouchStart('right')}
        onTouchEnd={handleTouchEnd('right')}
        onMouseDown={handleTouchStart('right')}
        onMouseUp={handleTouchEnd('right')}
        onMouseLeave={handleTouchEnd('right')}
      >
        →
      </div>
      {/* Backward */}
      <div
        style={{ ...buttonStyle, bottom: '0px', right: '70px' }}
        onTouchStart={handleTouchStart('backward')}
        onTouchEnd={handleTouchEnd('backward')}
        onMouseDown={handleTouchStart('backward')}
        onMouseUp={handleTouchEnd('backward')}
        onMouseLeave={handleTouchEnd('backward')}
      >
        ↓
      </div>
    </div>
  );
}

export default function MapPage() {
  const { position: userGps, error: gpsError, loading: gpsLoading } = useGeolocation();
  const controlsRef = useRef(null);
  const [terrain, setTerrain] = useState(null);

  const handleMobileMove = (direction, isActive) => {
    if (controlsRef.current) {
      controlsRef.current[direction] = isActive;
    }
  };

  const handleTerrainLoad = (terrainObject) => {
    setTerrain(terrainObject);
    console.log('Terrain loaded for collision detection');
  };

  return (
    <>
      {/* Status overlay */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
          background: 'white',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          maxWidth: '300px',
        }}
      >
        <p style={{ margin: 0, fontSize: 14, color: '#333' }}>
          <b>Controls:</b><br />
          - <b>Desktop:</b> W/A/S/D or Arrow keys + Mouse<br />
          - <b>Mobile:</b> Touch screen to look, buttons to move<br />
          - <b>C Key:</b> Log position for calibration<br />
          <br />
          {gpsLoading && '📍 Getting GPS location...'}
          {gpsError && <span style={{ color: 'red' }}>❌ GPS Error: {gpsError}</span>}
          {userGps && (
            <>
              <b>Your GPS:</b><br />
              {userGps.lat.toFixed(6)}, {userGps.lon.toFixed(6)}<br />
              Accuracy: ±{userGps.accuracy?.toFixed(0)}m<br />
              <span style={{ color: userGps && Math.abs(userGps.lat - GEOSPATIAL_CONFIG.REFERENCE_POINT_GPS.lat) > 0.01 ? 'orange' : 'green' }}>
                {Math.abs(userGps.lat - GEOSPATIAL_CONFIG.REFERENCE_POINT_GPS.lat) > 0.01 
                  ? '⚠️ You are far from campus' 
                  : '✓ You are on campus'}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Mobile control buttons */}
      <MobileControls onMove={handleMobileMove} />

      {/* Calibration instructions */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          zIndex: 10,
          background: 'rgba(255, 255, 200, 0.9)',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          maxWidth: '400px',
          fontSize: '12px',
        }}
        className='hidden'
      >
        <b>🎯 Calibration Points:</b><br />
        <span style={{ color: 'green' }}>● NLHC (Primary Reference)</span><br />
        <span style={{ color: 'orange' }}>● OAT</span><br />
        <span style={{ color: 'orange' }}>● ELHC Pits</span><br />
        <span style={{ color: 'orange' }}>● Aryabhatta/Chanakya/Bhaskara</span><br />
        <br />
        Check console (F12) for MODEL_SCALE calculation!
      </div>

      {/* Canvas */}
      <div style={{ width: '100vw', height: '100vh', background: '#87CEEB' }}>
        <Canvas 
          camera={{ 
            position: [CAMPUS_CENTER.x - 100, 250, CAMPUS_CENTER.z + 300],
            fov: 75,
            near: 0.1,
            far: 10000
          }}
          onCreated={({ gl, camera }) => {
            gl.setClearColor('#87CEEB');
            console.log('Canvas created, camera at:', camera.position);
            camera.lookAt(CAMPUS_CENTER.x, CAMPUS_CENTER.y, CAMPUS_CENTER.z);
            camera.updateProjectionMatrix();
            calculateModelScale();
          }}
        >
          <Suspense fallback={
            <mesh position={[0, 5, 0]}>
              <boxGeometry args={[10, 10, 10]} />
              <meshStandardMaterial color="orange" />
            </mesh>
          }>
            <ambientLight intensity={1.2} />
            <directionalLight position={[500, 500, 500]} intensity={1.5} />
            <hemisphereLight args={['#87CEEB', '#6B8E23', 0.6]} />
            
            <axesHelper args={[100]} position={[0, 0, 0]} />
            
            <mesh 
              rotation={[-Math.PI / 2, 0, 0]} 
              position={[0, -0.5, 0]}
            >
              <planeGeometry args={[2000, 2000, 40, 40]} />
              <meshStandardMaterial color="#90EE90" wireframe side={THREE.DoubleSide} />
            </mesh>
            
            <mesh position={[0, 48, 0]}>
              <sphereGeometry args={[10, 16, 16]} />
              <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={1} />
            </mesh>
            
            <Model onTerrainLoad={handleTerrainLoad} />
            <FirstPersonControls startPosition={userGps} keysRef={controlsRef} terrain={terrain} />
            <CalibrationHelper />

            {/* Dynamic user location marker - always visible */}
            {userGps && (
              <DynamicLocationMarker gpsPosition={userGps} />
            )}

            <CalibrationMarkers />

          </Suspense>
        </Canvas>
      </div>
    </>
  );
}

useGLTF.preload('/models/base_osm_model_boxless.glb');