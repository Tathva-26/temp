'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// === GEOSPATIAL CONFIGURATION ===
const GEOSPATIAL_CONFIG = {
  REFERENCE_POINT_GPS: { lat: 11.321636, lon: 75.933101 },
  REFERENCE_POINT_MODEL: new THREE.Vector3(201.73, 52.24, -445.55),
  SECONDARY_POINTS: [
    {
      name: 'OAT',
      gps: { lat: 11.322136, lon: 75.933371 },
      model: new THREE.Vector3(233.37, 53.90, -503.22)
    },
    {
      name: 'ELHC Pits',
      gps: { lat: 11.322564, lon: 75.933865 },
      model: new THREE.Vector3(279.25, 53.93, -549.80)
    },
    {
      name: 'Aryabhatta/Chanakya/Bhaskara',
      gps: { lat: 11.320844, lon: 75.933944 },
      model: new THREE.Vector3(275.31, 57.48, -354.41)
    }
  ],
  MODEL_SCALE: 1.0,
  MODEL_ROTATION_OFFSET: 0,
};

// === UTILITY FUNCTIONS ===
function haversineDistance(p1, p2) {
  const R = 6371e3;
  const phi1 = (p1.lat * Math.PI) / 180;
  const phi2 = (p2.lat * Math.PI) / 180;
  const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
  const deltaLambda = ((p2.lon - p1.lon) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

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
      Math.pow(model2.x - model1.x, 2) + Math.pow(model2.z - model1.z, 2)
    );
    return realDistance / modelDistance;
  });

  const avgScale = scales.reduce((a, b) => a + b, 0) / scales.length;
  GEOSPATIAL_CONFIG.MODEL_SCALE = avgScale;
  return avgScale;
}

function getCampusCenter() {
  const allPoints = [
    GEOSPATIAL_CONFIG.REFERENCE_POINT_MODEL,
    ...GEOSPATIAL_CONFIG.SECONDARY_POINTS.map(p => p.model)
  ];
  
  return new THREE.Vector3(
    allPoints.reduce((sum, p) => sum + p.x, 0) / allPoints.length,
    allPoints.reduce((sum, p) => sum + p.y, 0) / allPoints.length,
    allPoints.reduce((sum, p) => sum + p.z, 0) / allPoints.length
  );
}

const CAMPUS_CENTER = getCampusCenter();

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

  if (MODEL_ROTATION_OFFSET !== 0) {
    const rotatedX = xOffset * Math.cos(MODEL_ROTATION_OFFSET) - zOffset * Math.sin(MODEL_ROTATION_OFFSET);
    const rotatedZ = xOffset * Math.sin(MODEL_ROTATION_OFFSET) + zOffset * Math.cos(MODEL_ROTATION_OFFSET);
    xOffset = rotatedX;
    zOffset = rotatedZ;
  }

  return new THREE.Vector3(
    REFERENCE_POINT_MODEL.x + xOffset,
    REFERENCE_POINT_MODEL.y,
    REFERENCE_POINT_MODEL.z - zOffset
  );
}

// === GPS TRACKING HOOK ===
function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
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

// === 3D COMPONENTS ===
function Model({ onTerrainLoad }) {
  const gltf = useGLTF('/models/nitc.glb');
  
  useEffect(() => {
    if (gltf.scene && onTerrainLoad) {
      onTerrainLoad(gltf.scene);
    }
  }, [gltf, onTerrainLoad]);
  
  if (!gltf?.scene) return null;
  
  return <primitive object={gltf.scene} scale={1} />;
}

function MapControls({ startPosition, terrain, controlMode }) {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef({ forward: false, backward: false, left: false, right: false, up: false, down: false });
  const initialized = useRef(false);
  const mouseDown = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const raycaster = useRef(new THREE.Raycaster());

  const CAMERA_HEIGHT = controlMode === 'firstPerson' ? 5 : 50;
  const MOVE_SPEED = controlMode === 'firstPerson' ? 600 : 400;
  const MOUSE_SENSITIVITY = 0.002;

  const getTerrainHeight = (x, z) => {
    if (!terrain) return 0;
    raycaster.current.set(new THREE.Vector3(x, 1000, z), new THREE.Vector3(0, -1, 0));
    const intersects = raycaster.current.intersectObject(terrain, true);
    return intersects.length > 0 ? intersects[0].point.y : 0;
  };

  useEffect(() => {
    if (startPosition && !initialized.current) {
      const scenePos = gpsToScene(startPosition);
      const distanceFromCenter = Math.sqrt(scenePos.x * scenePos.x + scenePos.z * scenePos.z);
      
      if (distanceFromCenter > 2000) {
        camera.position.set(CAMPUS_CENTER.x - 100, 250, CAMPUS_CENTER.z + 300);
        camera.lookAt(CAMPUS_CENTER);
      } else {
        camera.position.set(scenePos.x, scenePos.y + CAMERA_HEIGHT, scenePos.z);
      }
      initialized.current = true;
    } else if (!startPosition && !initialized.current) {
      camera.position.set(CAMPUS_CENTER.x - 100, 250, CAMPUS_CENTER.z + 300);
      camera.lookAt(CAMPUS_CENTER);
      initialized.current = true;
    }
  }, [startPosition, camera, CAMERA_HEIGHT]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'ArrowUp': case 'KeyW': keys.current.forward = true; break;
        case 'ArrowDown': case 'KeyS': keys.current.backward = true; break;
        case 'ArrowLeft': case 'KeyA': keys.current.left = true; break;
        case 'ArrowRight': case 'KeyD': keys.current.right = true; break;
        case 'Space': keys.current.up = true; break;
        case 'ShiftLeft': keys.current.down = true; break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'ArrowUp': case 'KeyW': keys.current.forward = false; break;
        case 'ArrowDown': case 'KeyS': keys.current.backward = false; break;
        case 'ArrowLeft': case 'KeyA': keys.current.left = false; break;
        case 'ArrowRight': case 'KeyD': keys.current.right = false; break;
        case 'Space': keys.current.up = false; break;
        case 'ShiftLeft': keys.current.down = false; break;
      }
    };

    const handleMouseDown = (e) => {
      if (e.button === 2) { // Right click
        mouseDown.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 2) {
        mouseDown.current = false;
      }
    };

    const handleMouseMove = (e) => {
      if (mouseDown.current && controlMode === 'firstPerson') {
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;
        
        camera.rotation.y -= deltaX * MOUSE_SENSITIVITY;
        camera.rotation.x -= deltaY * MOUSE_SENSITIVITY;
        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
        
        lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleContextMenu = (e) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [camera, controlMode, MOUSE_SENSITIVITY]);

  useFrame((_, delta) => {
    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;
    velocity.current.y -= velocity.current.y * 10.0 * delta;

    direction.current.z = Number(keys.current.forward) - Number(keys.current.backward);
    direction.current.x = Number(keys.current.right) - Number(keys.current.left);
    direction.current.y = Number(keys.current.up) - Number(keys.current.down);
    direction.current.normalize();

    if (keys.current.forward || keys.current.backward)
      velocity.current.z -= direction.current.z * MOVE_SPEED * delta;
    if (keys.current.left || keys.current.right)
      velocity.current.x -= direction.current.x * MOVE_SPEED * delta;
    if (controlMode === 'freefly' && (keys.current.up || keys.current.down))
      velocity.current.y += direction.current.y * MOVE_SPEED * delta;

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0);

    camera.position.addScaledVector(forward, velocity.current.z * delta);
    camera.position.addScaledVector(right, velocity.current.x * delta);
    if (controlMode === 'freefly') {
      camera.position.addScaledVector(up, velocity.current.y * delta);
    }

    // Terrain following for first-person mode
    if (controlMode === 'firstPerson') {
      const terrainHeight = getTerrainHeight(camera.position.x, camera.position.z);
      const minHeight = terrainHeight + CAMERA_HEIGHT;
      if (camera.position.y < minHeight) {
        camera.position.y = minHeight;
      }
    }
  });

  return null;
}

function DynamicLocationMarker({ gpsPosition }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  if (!gpsPosition) return null;

  const scenePosition = gpsToScene(gpsPosition);

  return (
    <group position={scenePosition}>
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
      
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 5]} />
        <meshStandardMaterial color="#0099ff" transparent opacity={0.6} />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[2, 4, 32]} />
        <meshStandardMaterial 
          color="#0099ff" 
          transparent 
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

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

function CalibrationMarkers() {
  return (
    <>
      <GpsMarker 
        gpsPosition={GEOSPATIAL_CONFIG.REFERENCE_POINT_GPS} 
        color="green" 
        size={4}
      />
      {GEOSPATIAL_CONFIG.SECONDARY_POINTS.map((point, idx) => (
        <GpsMarker 
          key={idx}
          gpsPosition={point.gps} 
          color="orange" 
          size={3}
        />
      ))}
    </>
  );
}

function GpsMarker({ gpsPosition, color, size }) {
  const scenePosition = gpsToScene(gpsPosition);

  return (
    <group position={scenePosition}>
      <mesh position={[0, size, 0]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, size / 2, 0]}>
        <cylinderGeometry args={[0.5, 0.5, size]} />
        <meshStandardMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// === MAIN COMPONENT ===
export default function MapPage() {
  const { position: userGps, error: gpsError, loading: gpsLoading } = useGeolocation();
  const [terrain, setTerrain] = useState(null);
  const [controlMode, setControlMode] = useState('firstPerson'); // 'firstPerson' or 'freefly'

  const handleTerrainLoad = (terrainObject) => {
    setTerrain(terrainObject);
  };

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          maxWidth: '320px',
          fontSize: '13px',
        }}
      >
        <div style={{ marginBottom: '10px' }}>
          <strong>Controls:</strong><br />
          • W/A/S/D or Arrows: Move<br />
          • Right Click + Drag: Look around<br />
          • Space/Shift: Up/Down (freefly)<br />
          • Tab: Switch mode<br />
        </div>
        
        <button
          onClick={() => setControlMode(m => m === 'firstPerson' ? 'freefly' : 'firstPerson')}
          style={{
            background: '#0099ff',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px',
            width: '100%',
          }}
        >
          Mode: {controlMode === 'firstPerson' ? 'First Person' : 'Free Fly'}
        </button>

        {gpsLoading && <div>📍 Getting GPS...</div>}
        {gpsError && <div style={{ color: '#ff6b6b' }}>❌ GPS Error: {gpsError}</div>}
        {userGps && (
          <div>
            <strong>Your GPS:</strong><br />
            {userGps.lat.toFixed(6)}, {userGps.lon.toFixed(6)}<br />
            Accuracy: ±{userGps.accuracy?.toFixed(0)}m
          </div>
        )}
      </div>

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
            camera.lookAt(CAMPUS_CENTER);
            camera.updateProjectionMatrix();
            calculateModelScale();
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={1.2} />
            <directionalLight position={[500, 500, 500]} intensity={1.5} />
            <hemisphereLight args={['#87CEEB', '#6B8E23', 0.6]} />
            
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
              <planeGeometry args={[2000, 2000, 40, 40]} />
              <meshStandardMaterial color="#90EE90" wireframe side={THREE.DoubleSide} />
            </mesh>
            
            <Model onTerrainLoad={handleTerrainLoad} />
            <MapControls startPosition={userGps} terrain={terrain} controlMode={controlMode} />

            {userGps && <DynamicLocationMarker gpsPosition={userGps} />}
            <CalibrationMarkers />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}

useGLTF.preload('/models/nitc.glb');