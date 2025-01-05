import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const sceneAssets = {
  sea_keep_lonely_watcher: { path: 'sea_keep_lonely_watcher.glb', scale: 1.0, position: { x: 0, y: 0, z: 0 } },
  cyberpunk_2077_night_city_3d_map: { path: 'cyberpunk_2077_night_city_3d_map.glb', scale: 0.03, position: { x: 0, y: 0, z: 0 } },
  tokyo_shinbashi: { path: 'tokyo_shinbashi.glb', scale: 100.0, position: { x: 0, y: 0, z: 0 } },
  jinshan_temple_cishou_pagoda: { path: 'jinshan_temple_cishou_pagoda.glb', scale: 3.0, position: { x: 0, y: 0, z: 0 } },
  k2: { path: 'k2.glb', scale: 0.3, position: { x: 0, y: 0, z: 0 } },
  desmoines1: { path: 'desmoines1.glb', scale: 300, position: { x: 0, y: 500, z: 0 } },
  desmoines: { path: 'desmoines.glb', scale: 300, position: { x: 0, y: 500, z: 0 } },
  desmoines3: { path: 'desmoines3.glb', scale: 5, position: { x: 0, y: -100, z: 0 } },
}

const currentScene = sceneAssets.desmoines3;

export function sceneSetup() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  const loader = new GLTFLoader();

  loader.load(currentScene.path, (gltf) => {
    const world = gltf.scene;
    world.scale.set(currentScene.scale, currentScene.scale, currentScene.scale);
    world.position.x = currentScene.position.x;
    world.position.y = currentScene.position.y;
    world.position.z = currentScene.position.z;
    scene.add(world);
  }, undefined, (error) => {
    console.error('An error occurred while loading the GLB file:', error);
  });

  return scene;
}
