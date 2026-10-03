import * as THREE from 'three';
import type { Product } from '../../types';
import type { Measurements } from '../measurements';
import { easeForSize } from '../measurements';
import { buildBodyProfile, sampleRadius } from './avatar';
import type { BodyProfile } from './avatar';

export type GarmentKind = 'top' | 'outerwear' | 'dress' | 'bottom';

/** Maps a catalogue subcategory onto a garment silhouette. */
export function garmentKindFor(subcategory: string): GarmentKind {
  const s = subcategory.toLowerCase();
  if (/dress|gown|bodycon|midi|maxi|jumpsuit/.test(s)) return 'dress';
  if (/jacket|coat|blazer|hoodie|sweatshirt|shacket|shrug/.test(s)) {
    return 'outerwear';
  }
  if (/jean|pant|trouser|short|skirt|jogger|cargo|legging|track/.test(s)) {
    return 'bottom';
  }
  return 'top';
}

const COLOR_HEX: Record<string, string> = {
  black: '#1c1c20',
  white: '#f4f4f2',
  blue: '#2f5fd0',
  red: '#c8362f',
  gray: '#767676',
  grey: '#767676',
  green: '#2f7d4f',
  pink: '#d98ca0',
  navy: '#23304f',
  beige: '#d8c3a5',
};

export function colorToHex(name: string): string {
  const key = name.toLowerCase().trim();
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  if (/^#/.test(key)) return key;
  // Deterministic fallback so an unmapped colour is still stable.
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return `#${(hash & 0xffffff).toString(16).padStart(6, '0')}`;
}

/** Rougher fabrics scatter light; satin and leather don't. */
function fabricRoughness(subcategory: string): number {
  const s = subcategory.toLowerCase();
  if (/denim|jean|cargo|canvas/.test(s)) return 0.92;
  if (/corset|bustier|satin|silk|bodycon/.test(s)) return 0.28;
  if (/leather/.test(s)) return 0.45;
  if (/hoodie|sweatshirt|jogger|wool/.test(s)) return 0.95;
  return 0.78;
}

function hemFractionFor(name: string, fallback: number): number {
  const s = name.toLowerCase();
  if (/maxi/.test(s)) return 0.1;
  if (/midi/.test(s)) return 0.3;
  if (/mini/.test(s)) return 0.44;
  return fallback;
}

function sleeveFraction(subcategory: string, kind: GarmentKind): number {
  const s = subcategory.toLowerCase();
  if (kind === 'bottom' || kind === 'dress') return 0;
  if (/tank|vest|bustier|corset/.test(s)) return 0;
  if (/t-shirt|tee/.test(s)) return 0.13;
  if (/shirt|polo|blazer|hoodie|sweatshirt|jacket|shacket/.test(s)) return 0.32;
  return kind === 'outerwear' ? 0.32 : 0.13;
}

/**
 * A garment shell that hugs the body silhouette, widened by the size ease.
 * `flare` widens the hem; `pad` is the fabric thickness off the skin.
 */
function shell(
  profile: BodyProfile,
  yBottom: number,
  yTop: number,
  { pad, ease, flare = 1 }: { pad: number; ease: number; flare?: number },
): THREE.LatheGeometry {
  const samples = 30;
  const points: THREE.Vector2[] = [];

  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const y = THREE.MathUtils.lerp(yBottom, yTop, t);
    const bodyRadius = sampleRadius(profile, y);
    const flareFactor = 1 + (flare - 1) * Math.pow(1 - t, 1.7);
    points.push(new THREE.Vector2(bodyRadius * ease * flareFactor + pad, y));
  }

  return new THREE.LatheGeometry(points, 56);
}

export interface GarmentOptions {
  product: Product;
  measurements: Measurements;
  size: string;
  color: string;
}

/**
 * Procedural placeholder garment.
 *
 * If `public/models/<productId>.glb` exists the viewer loads that instead —
 * these builders are the fallback so every catalogue item is tryable today.
 */
export function buildGarment({
  product,
  measurements,
  size,
  color,
}: GarmentOptions): THREE.Group {
  const profile = buildBodyProfile(measurements);
  const h = profile.heightM;
  const kind = garmentKindFor(product.subcategory);
  const ease = easeForSize(size);

  const group = new THREE.Group();
  group.name = 'garment';

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorToHex(color)),
    roughness: fabricRoughness(product.subcategory),
    metalness: /satin|silk/.test(product.subcategory.toLowerCase()) ? 0.15 : 0.02,
  });

  const addShell = (
    yBottom: number,
    yTop: number,
    pad: number,
    flare = 1,
    shellEase = ease,
  ) => {
    const mesh = new THREE.Mesh(
      shell(profile, yBottom, yTop, { pad, ease: shellEase, flare }),
      material,
    );
    mesh.castShadow = true;
    group.add(mesh);
    return mesh;
  };

  if (kind === 'bottom' && !/skirt/.test(product.subcategory.toLowerCase())) {
    // Trousers / shorts: one tapered tube per leg.
    const hemY = /short/.test(product.subcategory.toLowerCase())
      ? hemFractionFor(product.name, 0.42)
      : hemFractionFor(product.name, 0.07);
    const waistY = 0.63 * h;
    const scale = h / 1.68;
    const legGap = sampleRadius(profile, waistY) * 0.45;

    for (const side of [-1, 1] as const) {
      const topRadius = sampleRadius(profile, waistY) * ease * 0.55 + 0.012;
      const bottomRadius = 0.055 * scale * ease;
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(topRadius, bottomRadius, waistY - hemY * h, 20),
        material,
      );
      leg.position.set(side * legGap, (waistY + hemY * h) / 2, 0);
      leg.castShadow = true;
      group.add(leg);
    }

    // Waistband
    addShell(hemFractionFor(product.name, 0.5) * h, waistY, 0.01, 1.0, ease);
  } else if (kind === 'bottom') {
    addShell(hemFractionFor(product.name, 0.38) * h, 0.63 * h, 0.012, 1.7);
  } else if (kind === 'dress') {
    addShell(hemFractionFor(product.name, 0.32) * h, 0.81 * h, 0.012, 1.55);
  } else if (kind === 'outerwear') {
    addShell(0.45 * h, 0.82 * h, 0.018, 1.08);
  } else {
    addShell(0.5 * h, 0.81 * h, 0.01, 1.02);
  }

  // Sleeves
  const sleeve = sleeveFraction(product.subcategory, kind);
  if (sleeve > 0) {
    const shoulderY = 0.8 * h;
    const length = sleeve * h;
    const scale = h / 1.68;
    const shoulderHalf = measurements.shoulder / 200;
    const topRadius = 0.05 * scale * ease;
    const bottomRadius = 0.038 * scale * ease;

    for (const side of [-1, 1] as const) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(topRadius, bottomRadius, length, 20),
        material,
      );
      arm.position.set(
        side * (shoulderHalf + topRadius * 0.45),
        shoulderY - length / 2,
        0,
      );
      arm.rotation.z = side * 0.16;
      arm.castShadow = true;
      group.add(arm);
    }
  }

  return group;
}
