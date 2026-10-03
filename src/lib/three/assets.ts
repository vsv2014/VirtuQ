import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Asset pipeline for real 3D models.
 *
 * Drop a garment at `public/models/<productId>.glb` and/or an avatar at
 * `public/models/avatar.glb`; the viewer picks them up automatically and falls
 * back to the procedural placeholders when they are absent.
 * See public/models/README.md for the expected conventions.
 */
export const MODEL_BASE = '/models';

export const garmentModelUrl = (productId: string) =>
  `${MODEL_BASE}/${encodeURIComponent(productId)}.glb`;

export const avatarModelUrl = () => `${MODEL_BASE}/avatar.glb`;

let loader: GLTFLoader | null = null;

function getLoader(): GLTFLoader {
  if (!loader) loader = new GLTFLoader();
  return loader;
}

/** Returns the loaded scene, or null when the file is missing or invalid. */
export async function tryLoadModel(url: string): Promise<THREE.Group | null> {
  try {
    const gltf = await getLoader().loadAsync(url);
    return gltf.scene as THREE.Group;
  } catch {
    return null;
  }
}

/** Uniformly scales a model so its bounding box height matches `targetHeight`. */
export function fitToHeight(object: THREE.Object3D, targetHeight: number): void {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (size.y <= 0) return;
  const scale = targetHeight / size.y;
  object.scale.setScalar(scale);

  // Re-measure and sit the model on the floor, centred on X/Z.
  const fitted = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  fitted.getCenter(center);
  object.position.x -= center.x;
  object.position.z -= center.z;
  object.position.y -= fitted.min.y;
}
