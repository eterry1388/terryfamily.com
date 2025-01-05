import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const baseUrl = `https://eric-terry-public.s3.amazonaws.com/terryfamily.com/real-fpv/worlds/`;

const sceneAssets = {
  sea_keep_lonely_watcher: { path: `${baseUrl}sea_keep_lonely_watcher.glb`, scale: 1.0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  cyberpunk_2077_night_city_3d_map: { path: `${baseUrl}cyberpunk_2077_night_city_3d_map.glb`, scale: 0.03, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  tokyo_shinbashi: { path: `${baseUrl}tokyo_shinbashi.glb`, scale: 100.0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  jinshan_temple_cishou_pagoda: { path: `${baseUrl}jinshan_temple_cishou_pagoda.glb`, scale: 3.0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  k2: { path: `${baseUrl}k2.glb`, scale: 0.3, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  desmoines1: { path: `${baseUrl}desmoines1.glb`, scale: 300, position: { x: 0, y: 500, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  desmoines: { path: `${baseUrl}desmoines.glb`, scale: 300, position: { x: 0, y: 500, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  desmoines3: { path: `${baseUrl}desmoines3.glb`, scale: 5, position: { x: 400, y: -1300, z: -600 }, rotation: { x: 0, y: 250, z: 0 } },
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
    world.position.set(currentScene.position.x, currentScene.position.y, currentScene.position.z);
    world.rotation.set(currentScene.rotation.x, currentScene.rotation.y, currentScene.rotation.z);
    scene.add(world);
  }, undefined, (error) => {
    console.error('An error occurred while loading the GLB file:', error);
  });

  return scene;
}
