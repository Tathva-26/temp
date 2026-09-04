/**
 * Scene Setup Module
 * Handles initialization of Three.js scene, camera, renderer, controls, and lighting
 */

import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import { CONFIG } from "./config";

/**
 * Initializes the Three.js scene with camera, renderer, and controls
 * @param {HTMLElement} mount - DOM element to attach the renderer to
 * @returns {Object} - Contains scene, camera, renderer, and controls
 */
export const initializeScene = (mount) => {
  // Create scene with sky-blue background and atmospheric fog
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xabcdef);
  scene.fog = new THREE.Fog(0xabcdef, 100, 500); // Fog for depth perception

  // Setup perspective camera with field of view and aspect ratio
  const camera = new THREE.PerspectiveCamera(
    CONFIG.CAMERA.FOV,
    mount.clientWidth / mount.clientHeight,
    CONFIG.CAMERA.NEAR,
    CONFIG.CAMERA.FAR
  );
  camera.position.copy(CONFIG.CAMERA.DEFAULT_POSITION);

  // Create WebGL renderer with antialiasing and shadows enabled
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio); // Support high-DPI displays
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
  renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic tone mapping
  renderer.outputColorSpace = THREE.SRGBColorSpace; // Correct color space
  mount.appendChild(renderer.domElement);

  // Setup MapControls for intuitive camera movement (like Google Maps)
  const controls = new MapControls(camera, renderer.domElement);
  controls.enableDamping = true; // Smooth camera movement
  controls.dampingFactor = CONFIG.CONTROLS.DAMPING_FACTOR;
  controls.minDistance = CONFIG.CONTROLS.MIN_DISTANCE;
  controls.maxDistance = CONFIG.CONTROLS.MAX_DISTANCE;

  return { scene, camera, renderer, controls };
};

/**
 * Sets up lighting for the scene
 * Uses ambient light, hemisphere light, and directional light with shadows
 * @param {THREE.Scene} scene - The Three.js scene to add lights to
 */
export const setupLighting = (scene) => {
  // Ambient light provides base illumination to all objects
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  // Hemisphere light simulates sky and ground reflection
  // Sky color (white) from above, ground color (dark gray) from below
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  hemisphereLight.position.set(0, 100, 0);
  scene.add(hemisphereLight);

  // Directional light acts as the sun, casting shadows
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
  directionalLight.position.set(50, 100, 75);
  directionalLight.castShadow = true;

  // Configure shadow camera for high-quality shadows over large area
  directionalLight.shadow.mapSize.width = 4096;
  directionalLight.shadow.mapSize.height = 4096;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -200;
  directionalLight.shadow.camera.right = 200;
  directionalLight.shadow.camera.top = 200;
  directionalLight.shadow.camera.bottom = -200;

  scene.add(directionalLight);
};

/**
 * Creates a ground plane for receiving shadows
 * @returns {THREE.Mesh} - Ground plane mesh
 */
export const createGroundPlane = () => {
  const groundPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000), // Large plane covering entire map
    new THREE.MeshStandardMaterial({
      color: 0x888888,
      depthWrite: false, // Don't write to depth buffer (optimization)
    })
  );
  groundPlane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  groundPlane.receiveShadow = true; // Receive shadows from objects above

  return groundPlane;
};