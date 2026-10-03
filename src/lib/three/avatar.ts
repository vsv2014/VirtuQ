import * as THREE from 'three';
import type { Measurements } from '../measurements';

export interface BodyProfile {
  /** Sampled silhouette: x = radius in metres, y = height in metres. */
  points: THREE.Vector2[];
  heightM: number;
}

const circumferenceToRadius = (cm: number) => cm / (2 * Math.PI) / 100;

/**
 * Builds a dress-form silhouette from measurements.
 *
 * The key points are fractions of total height paired with a radius derived
 * from the shopper's actual circumference, then spline-sampled so the body
 * reads as smooth rather than a stack of cylinders.
 */
export function buildBodyProfile(m: Measurements): BodyProfile {
  const heightM = m.height / 100;

  const keys: Array<[fraction: number, radius: number]> = [
    [0.0, 0.042], // sole
    [0.025, 0.052],
    [0.1, 0.058], // ankle
    [0.22, 0.072], // calf
    [0.33, 0.062], // knee
    [0.45, 0.092], // thigh
    [0.52, circumferenceToRadius(m.hips)],
    [0.63, circumferenceToRadius(m.waist)],
    [0.73, circumferenceToRadius(m.chest)],
    [0.8, m.shoulder / 200],
    [0.845, 0.052], // neck base
    [0.885, 0.045], // neck
    [0.93, 0.072], // head
    [0.975, 0.082],
    [1.0, 0.015], // crown
  ];

  const control = keys.map(
    ([fraction, radius]) =>
      new THREE.Vector2(Math.max(radius, 0.008), fraction * heightM),
  );

  const spline = new THREE.SplineCurve(control);
  return { points: spline.getPoints(80), heightM };
}

/** Linear interpolation of the silhouette radius at a given height. */
export function sampleRadius(profile: BodyProfile, y: number): number {
  const points = profile.points;
  const first = points[0];
  const last = points[points.length - 1];

  if (!first || !last) return 0.05;
  if (y <= first.y) return first.x;
  if (y >= last.y) return last.x;

  for (let i = 1; i < points.length; i += 1) {
    const current = points[i];
    const previous = points[i - 1];
    if (!current || !previous) break;
    if (current.y >= y) {
      const span = current.y - previous.y;
      const t = span === 0 ? 0 : (y - previous.y) / span;
      return THREE.MathUtils.lerp(previous.x, current.x, t);
    }
  }
  return last.x;
}

/**
 * Procedural placeholder avatar. Drop a real rigged model at
 * `public/models/avatar.glb` to replace it — see public/models/README.md.
 */
export function buildAvatar(m: Measurements): THREE.Group {
  const profile = buildBodyProfile(m);
  const group = new THREE.Group();
  group.name = 'avatar';

  const skin = new THREE.MeshStandardMaterial({
    color: new THREE.Color(m.skinTone),
    roughness: 0.82,
    metalness: 0.02,
  });

  const body = new THREE.Mesh(new THREE.LatheGeometry(profile.points, 56), skin);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Arms, scaled to the shopper's height.
  const scale = profile.heightM / 1.68;
  const shoulderY = 0.8 * profile.heightM;
  const armLength = 0.3 * profile.heightM;
  const armTop = 0.045 * scale;
  const armBottom = 0.032 * scale;
  const shoulderHalf = m.shoulder / 200;

  for (const side of [-1, 1] as const) {
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(armTop, armBottom, armLength, 20),
      skin,
    );
    arm.position.set(
      side * (shoulderHalf + armTop * 0.5),
      shoulderY - armLength / 2,
      0,
    );
    arm.rotation.z = side * 0.16;
    arm.castShadow = true;
    group.add(arm);
  }

  // Display base, so the figure doesn't float.
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.26, 0.02, 48),
    new THREE.MeshStandardMaterial({ color: '#2b2b33', roughness: 0.5 }),
  );
  base.position.y = -0.01;
  base.receiveShadow = true;
  group.add(base);

  return group;
}

export function disposeObject(root: THREE.Object3D): void {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((item) => item.dispose());
    else material?.dispose();
  });
}
