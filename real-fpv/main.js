import * as THREE from 'three';
import { Drone } from './Drone.js';
import { InputController } from './InputController.js';
import { sceneSetup } from './sceneSetup.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

const cameraFar = 20000;
const canvas = document.getElementById('webglCanvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener('resize', onWindowResize, false);

const scene = sceneSetup();

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

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
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
