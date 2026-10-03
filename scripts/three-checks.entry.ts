/**
 * Checks for the procedural try-on geometry, transpiled and run by
 * scripts/test-3d.mjs. three's geometry maths runs headless, so these execute
 * in Node without a GPU.
 */
import * as THREE from 'three';

import { buildAvatar, buildBodyProfile, sampleRadius } from '../src/lib/three/avatar';
import { buildGarment, colorToHex, garmentKindFor } from '../src/lib/three/garment';
import { DEFAULT_MEASUREMENTS, SIZES, easeForSize } from '../src/lib/measurements';
import { CATALOG } from '../shared/catalog.js';

export interface CheckResult {
  passed: number;
  failures: string[];
  log: string[];
}

export function runThreeChecks(): CheckResult {
  const m = DEFAULT_MEASUREMENTS;
  const log: string[] = [];
  const failures: string[] = [];
  let passed = 0;

  const ok = (name: string, condition: boolean, extra = '') => {
    if (condition) {
      passed += 1;
      log.push(`  ✓ ${name}${extra ? ` — ${extra}` : ''}`);
    } else {
      failures.push(`${name}${extra ? ` (${extra})` : ''}`);
      log.push(`  ✗ ${name}${extra ? ` — ${extra}` : ''}`);
    }
  };

  const sizeOf = (object: THREE.Object3D) => {
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    return size;
  };

  /* ------------------------------------------------------------- profile */
  const profile = buildBodyProfile(m);
  ok(
    'body profile has enough samples',
    profile.points.length > 50,
    `${profile.points.length} points`,
  );
  ok(
    'profile height matches the measurement',
    Math.abs(profile.heightM - m.height / 100) < 1e-9,
  );
  ok(
    'every radius is positive and every height >= 0',
    profile.points.every((p) => p.x > 0 && p.y >= -1e-9),
  );
  ok(
    'profile heights are non-decreasing',
    profile.points.every((p, i) => i === 0 || p.y >= profile.points[i - 1]!.y - 1e-9),
  );

  const hipR = sampleRadius(profile, 0.52 * profile.heightM);
  const waistR = sampleRadius(profile, 0.63 * profile.heightM);
  const chestR = sampleRadius(profile, 0.73 * profile.heightM);
  ok(
    'waist is narrower than hips',
    waistR < hipR,
    `${waistR.toFixed(3)} < ${hipR.toFixed(3)}`,
  );
  ok(
    'sampling clamps out-of-range heights',
    sampleRadius(profile, -5) > 0 && sampleRadius(profile, 999) > 0,
  );

  /* A bigger chest must widen the torso itself. Measure the profile radius,
     not the bounding box — the arms sit wider than the torso and would mask it. */
  const broadProfile = buildBodyProfile({ ...m, chest: 130 });
  const broadChest = sampleRadius(broadProfile, 0.73 * broadProfile.heightM);
  ok(
    'a larger chest widens the torso',
    broadChest > chestR + 0.02,
    `${broadChest.toFixed(3)} > ${chestR.toFixed(3)}`,
  );

  const tallProfile = buildBodyProfile({ ...m, height: 200 });
  ok(
    'a taller shopper produces a taller profile',
    tallProfile.heightM > profile.heightM,
    `${tallProfile.heightM} > ${profile.heightM}`,
  );

  /* -------------------------------------------------------------- avatar */
  const avatar = buildAvatar(m);
  const avatarSize = sizeOf(avatar);
  ok(
    'avatar builds with body, arms and base',
    avatar.children.length >= 3,
    `${avatar.children.length} parts`,
  );
  ok(
    'avatar height tracks the measurement',
    Math.abs(avatarSize.y - m.height / 100) < 0.06,
    `${avatarSize.y.toFixed(3)}m vs ${(m.height / 100).toFixed(3)}m`,
  );
  ok(
    'avatar bounds are finite',
    [avatarSize.x, avatarSize.y, avatarSize.z].every(Number.isFinite),
  );
  ok(
    'avatar stands on the floor',
    new THREE.Box3().setFromObject(avatar).min.y <= 0.001,
  );

  const tallAvatar = sizeOf(buildAvatar({ ...m, height: 200 }));
  ok(
    'a taller shopper produces a taller avatar',
    tallAvatar.y > avatarSize.y + 0.2,
    `${tallAvatar.y.toFixed(3)} > ${avatarSize.y.toFixed(3)}`,
  );

  /* ------------------------------------------------------------ garment */
  ok('dresses map to a dress silhouette', garmentKindFor('Bodycon') === 'dress');
  ok('maxi maps to a dress silhouette', garmentKindFor('Maxi') === 'dress');
  ok('jackets map to outerwear', garmentKindFor('Jackets') === 'outerwear');
  ok(
    'hoodies map to outerwear',
    garmentKindFor('Hoodies & Sweatshirts') === 'outerwear',
  );
  ok('jeans map to a bottom', garmentKindFor('Jeans') === 'bottom');
  ok('skirts map to a bottom', garmentKindFor('Skirts') === 'bottom');
  ok('t-shirts map to a top', garmentKindFor('T-Shirts') === 'top');

  let built = 0;
  const broken: string[] = [];
  for (const product of CATALOG) {
    for (const size of SIZES) {
      try {
        const garment = buildGarment({
          product,
          measurements: m,
          size,
          color: product.colors[0]!,
        });
        const size3 = sizeOf(garment);
        if (
          garment.children.length === 0 ||
          !Number.isFinite(size3.y) ||
          size3.y <= 0
        ) {
          broken.push(`${product.id}/${size}`);
        }
        built += 1;
      } catch (error) {
        broken.push(`${product.id}/${size}: ${(error as Error).message}`);
      }
    }
  }
  ok(
    'every product x size builds a garment',
    broken.length === 0,
    `${built} combinations, ${broken.length} bad${broken.length ? `: ${broken.slice(0, 3).join(', ')}` : ''}`,
  );

  const small = sizeOf(
    buildGarment({ product: CATALOG[0]!, measurements: m, size: 'S', color: 'Black' }),
  );
  const extraLarge = sizeOf(
    buildGarment({ product: CATALOG[0]!, measurements: m, size: 'XL', color: 'Black' }),
  );
  ok(
    'XL is looser than S',
    extraLarge.x > small.x,
    `${extraLarge.x.toFixed(4)} > ${small.x.toFixed(4)}`,
  );
  ok(
    'size ease increases monotonically',
    easeForSize('S') < easeForSize('M') && easeForSize('M') < easeForSize('XL'),
  );

  /* -------------------------------------------------------------- colour */
  ok('known colours map to stable hex', colorToHex('Black') === '#1c1c20');
  ok(
    'unknown colours fall back to valid hex',
    /^#[0-9a-f]{6}$/.test(colorToHex('Chartreuse')),
  );
  ok(
    'colour mapping is deterministic',
    colorToHex('Chartreuse') === colorToHex('Chartreuse'),
  );

  return { passed, failures, log };
}
