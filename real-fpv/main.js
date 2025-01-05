import * as THREE from 'three';
import { Drone } from './Drone.js';
import { InputController } from './InputController.js';
import { sceneSetup } from './sceneSetup.js';

const cameraFar = 20000;
const canvas = document.getElementById('webglCanvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

window.addEventListener('resize', onWindowResize, false);

const scene = sceneSetup();

const fpvCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, cameraFar);
fpvCamera.position.set(0, 0.1, 0.3); // Slightly above and in front of the drone's center
fpvCamera.rotation.x = THREE.MathUtils.degToRad(30); // Point camera 30 degrees up

const drone = new Drone();
drone.mesh.position.set(500, 50, 0);
drone.mesh.add(fpvCamera); // Attach FPV camera to the drone
scene.add(drone.mesh);

const inputController = new InputController();
// Animate
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  let deltaTime = clock.getDelta();
  let controls = inputController.update();
  drone.updatePhysics(deltaTime, controls);

  renderer.render(scene, fpvCamera);
}

function onWindowResize() {
  fpvCamera.aspect = window.innerWidth / window.innerHeight;
  fpvCamera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();
