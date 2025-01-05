import * as THREE from 'three';
import { Drone } from './Drone.js';
import { InputController } from './InputController.js';
import { sceneSetup } from './sceneSetup.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

const cameraFar = 20000;
const canvas = document.getElementById('webglCanvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener('resize', onWindowResize, false);

const scene = sceneSetup();

// Add a nice sky
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);

const sun = new THREE.Vector3();
const effectController = {
  turbidity: 10,
  rayleigh: 2,
  mieCoefficient: 0.005,
  mieDirectionalG: 0.8,
  elevation: 2,
  azimuth: 240, // Changed azimuth to 0 to put the sun on the opposite side
  exposure: renderer.toneMappingExposure
};

function updateSun() {
  const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
  const theta = THREE.MathUtils.degToRad(effectController.azimuth);
  sun.setFromSphericalCoords(1, phi, theta);

  sky.material.uniforms['sunPosition'].value.copy(sun);
}

updateSun();

// Setting for controlling the camera wide-angle
let cameraFov = 75;
const fpvCamera = new THREE.PerspectiveCamera(cameraFov, window.innerWidth / window.innerHeight, 0.1, cameraFar);
fpvCamera.position.set(0, 0.1, 0.3); // Slightly above and in front of the drone's center
fpvCamera.rotation.x = THREE.MathUtils.degToRad(30); // Point camera 30 degrees up

const drone = new Drone();
drone.mesh.position.set(500, 50, 0);
drone.mesh.add(fpvCamera); // Attach FPV camera to the drone
scene.add(drone.mesh);

const inputController = new InputController();

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, fpvCamera);
composer.addPass(renderPass);

const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
composer.addPass(fxaaPass);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.4, 2);
composer.addPass(bloomPass);

// Animate
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  let deltaTime = clock.getDelta();
  let controls = inputController.update();
  drone.updatePhysics(deltaTime, controls);

  composer.render();
}

function onWindowResize() {
  fpvCamera.aspect = window.innerWidth / window.innerHeight;
  fpvCamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
}

animate();
