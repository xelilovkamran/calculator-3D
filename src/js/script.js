import GUI from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { handleCalculator, playSound, renderDisplay } from "./utils";

/**
 * Variables
 */

const numbers = {};
const calculatorParts = [];

let selectedButton = "";

let expression = "";
let displayExpression = "";

const clickSound = new Audio("audio/click.mp3");

/**
 * Base
 */
// Group
const displayGroup = new THREE.Group();
displayGroup.position.set(0, 0.5, 0);

// Debug
const gui = new GUI({
  width: 400,
});
gui.close();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.add(displayGroup);
scene.add(new THREE.GridHelper(10, 10));

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader();

// Draco loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");

// GLTF loader
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load("models/calculator.glb", (gltf) => {
  gltf.scene.children.forEach((child) => {
    calculatorParts.push(child);
  });
  gltf.scene.position.y = -1;

  scene.add(gltf.scene);
});

console.log(calculatorParts);

gltfLoader.load("models/numbers.glb", (gltf) => {
  gltf.scene.children.forEach((child) => {
    child.scale.set(0.01, 0.01, 0.01);
    numbers[child.userData.name] = child;
  });
});

/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(2, 2, 2);
scene.add(directionalLight);

/**
 * Raycaster
 */

const raycaster = new THREE.Raycaster();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.y = 1.5;
camera.position.z = 4;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Mouse
 */

const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
  if (numbers) {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(calculatorParts);

    if (intersects.length && intersects[0]) {
      selectedButton = intersects[0]?.object.userData.name;
      if (numbers[selectedButton]) {
        playSound(clickSound);

        expression = handleCalculator(
          selectedButton,
          expression,
          calculatorParts
        );
      }
    }
  }
});

window.addEventListener("keypress", (e) => {
  if (numbers) {
    selectedButton = e.key;
    if (numbers[selectedButton]) {
      playSound(clickSound);
      expression = handleCalculator(
        selectedButton,
        String(expression),
        calculatorParts
      );
    }
  }
});

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (expression && expression !== displayExpression) {
    displayExpression = expression;

    renderDisplay(String(expression), displayGroup, numbers);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
