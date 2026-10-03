import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { Boxes, RotateCcw, ShoppingBag, Sparkles } from 'lucide-react';

import { getProduct, mockProducts } from '../data/mockProducts';
import { buildAvatar, disposeObject } from '../lib/three/avatar';
import { buildGarment, colorToHex, garmentKindFor } from '../lib/three/garment';
import {
  avatarModelUrl,
  fitToHeight,
  garmentModelUrl,
  tryLoadModel,
} from '../lib/three/assets';
import {
  DEFAULT_MEASUREMENTS,
  MEASUREMENT_RANGES,
  SKIN_TONES,
  SIZES,
  clampMeasurement,
} from '../lib/measurements';
import type { MeasurementKey, Measurements } from '../lib/measurements';
import { readStorage, writeStorage, STORAGE_KEYS } from '../lib/storage';
import { discountPercent, formatINR } from '../lib/format';
import { useCart } from '../context/useCart';
import { useToast } from '../context/useToast';
import { Spinner } from './Spinner';
import type { Product } from '../types';

interface World {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  stage: THREE.Group;
  avatarHolder: THREE.Group;
  garmentHolder: THREE.Group;
  observer: ResizeObserver;
  vrButton: HTMLElement | null;
}

/** Keeps async model loads from racing when the shopper changes product fast. */
let loadToken = 0;

export function TryOn() {
  const { productId } = useParams();
  const product = useMemo<Product | null>(
    () => getProduct(productId) ?? mockProducts[0] ?? null,
    [productId],
  );

  const { addItem } = useCart();
  const { show } = useToast();

  const [measurements, setMeasurements] = useState<Measurements>(() =>
    readStorage<Measurements>(STORAGE_KEYS.measurements, DEFAULT_MEASUREMENTS),
  );
  const [size, setSize] = useState('M');
  const [color, setColor] = useState(() => product?.colors[0] ?? 'Black');
  const [autoRotate, setAutoRotate] = useState(true);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [vrSupported, setVrSupported] = useState(false);
  const [modelSource, setModelSource] = useState<'placeholder' | 'model'>(
    'placeholder',
  );

  const mountRef = useRef<HTMLDivElement | null>(null);
  const vrMountRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<World | null>(null);
  const autoRotateRef = useRef(autoRotate);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.measurements, measurements);
  }, [measurements]);

  // A new product resets the colour to something that actually exists on it.
  useEffect(() => {
    setColor(product?.colors[0] ?? 'Black');
  }, [product?.id, product?.colors]);

  /* ---------------------------------------------------------------- scene */
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setStatus('error');
      setErrorMessage('This browser could not start WebGL.');
      return undefined;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth || 640, mount.clientHeight || 480);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f6f5f8');

    const camera = new THREE.PerspectiveCamera(
      38,
      (mount.clientWidth || 640) / (mount.clientHeight || 480),
      0.05,
      100,
    );
    camera.position.set(0, 1.0, 2.6);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.8;
    controls.maxDistance = 6;
    controls.target.set(0, 0.9, 0);

    // Lighting: a soft studio rig so fabric reads correctly.
    scene.add(new THREE.HemisphereLight('#ffffff', '#b9b4c4', 1.1));

    const key = new THREE.DirectionalLight('#ffffff', 2.1);
    key.position.set(2.2, 3.4, 2.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 12;
    scene.add(key);

    const fill = new THREE.DirectionalLight('#c9d4ff', 0.5);
    fill.position.set(-2.5, 1.8, -1.6);
    scene.add(fill);

    const rim = new THREE.DirectionalLight('#ffffff', 0.6);
    rim.position.set(-1.2, 2.0, -2.6);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(4, 64),
      new THREE.MeshStandardMaterial({ color: '#eceaf1', roughness: 0.95 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const stage = new THREE.Group();
    const avatarHolder = new THREE.Group();
    const garmentHolder = new THREE.Group();
    stage.add(avatarHolder, garmentHolder);
    scene.add(stage);

    const observer = new ResizeObserver(() => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    observer.observe(mount);

    // WebXR: use setAnimationLoop so three can take over when a headset
    // session starts, and hand control back when it ends.
    renderer.xr.enabled = true;
    const world: World = {
      renderer,
      scene,
      camera,
      controls,
      stage,
      avatarHolder,
      garmentHolder,
      observer,
      vrButton: null,
    };
    worldRef.current = world;

    renderer.setAnimationLoop(() => {
      if (autoRotateRef.current && !renderer.xr.isPresenting) {
        stage.rotation.y += 0.004;
      }
      controls.update();
      renderer.render(scene, camera);
    });

    if (vrMountRef.current) {
      world.vrButton = VRButton.createButton(renderer);
      vrMountRef.current.appendChild(world.vrButton);
    }

    const xr = (
      navigator as unknown as {
        xr?: { isSessionSupported?: (mode: string) => Promise<boolean> };
      }
    ).xr;
    xr?.isSessionSupported?.('immersive-vr')
      .then(setVrSupported)
      .catch(() => setVrSupported(false));

    setStatus('ready');

    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      world.vrButton?.remove();
      disposeObject(avatarHolder);
      disposeObject(garmentHolder);
      scene.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
      worldRef.current = null;
    };
  }, []);

  /* --------------------------------------------------------------- avatar */
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return undefined;

    let cancelled = false;
    const token = (loadToken += 1);
    disposeObject(world.avatarHolder);
    world.avatarHolder.clear();

    const placeholder = buildAvatar(measurements);
    world.avatarHolder.add(placeholder);

    void tryLoadModel(avatarModelUrl()).then((model) => {
      if (cancelled || !model || token !== loadToken) {
        if (model) disposeObject(model);
        return;
      }
      world.avatarHolder.remove(placeholder);
      disposeObject(placeholder);
      fitToHeight(model, measurements.height / 100);
      model.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh) mesh.castShadow = true;
      });
      world.avatarHolder.add(model);
    });

    // Frame the figure to the current height.
    const heightM = measurements.height / 100;
    world.controls.target.set(0, heightM * 0.52, 0);
    world.camera.position.set(0, heightM * 0.6, heightM * 1.55);
    world.controls.update();

    return () => {
      cancelled = true;
    };
  }, [measurements]);

  /* -------------------------------------------------------------- garment */
  useEffect(() => {
    const world = worldRef.current;
    if (!world || !product) return undefined;

    let cancelled = false;
    const token = (loadToken += 1);
    disposeObject(world.garmentHolder);
    world.garmentHolder.clear();

    const placeholder = buildGarment({
      product,
      measurements,
      size,
      color,
    });
    world.garmentHolder.add(placeholder);
    setModelSource('placeholder');

    void tryLoadModel(garmentModelUrl(product.id)).then((model) => {
      if (cancelled || !model || token !== loadToken) {
        if (model) disposeObject(model);
        return;
      }
      world.garmentHolder.remove(placeholder);
      disposeObject(placeholder);
      fitToHeight(model, measurements.height / 100);
      model.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh) mesh.castShadow = true;
      });
      world.garmentHolder.add(model);
      setModelSource('model');
    });

    return () => {
      cancelled = true;
    };
  }, [product, measurements, size, color]);

  /* ----------------------------------------------------------------- view */
  const resetView = () => {
    const world = worldRef.current;
    if (!world) return;
    world.stage.rotation.set(0, 0, 0);
    const heightM = measurements.height / 100;
    world.camera.position.set(0, heightM * 0.6, heightM * 1.55);
    world.controls.target.set(0, heightM * 0.52, 0);
    world.controls.update();
  };

  const updateMeasurement = (key: MeasurementKey, value: number) => {
    setMeasurements((current) => ({
      ...current,
      [key]: clampMeasurement(key, value),
    }));
  };

  const handleAddToBag = () => {
    if (!product) return;
    addItem({ product, size, color, quantity: 1 });
    show(`${product.name} added to your bag`, 'success');
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold">Nothing to try on</h2>
        <Link to="/" className="btn btn-primary">
          Browse the catalogue
        </Link>
      </div>
    );
  }

  const kind = garmentKindFor(product.subcategory);
  const discount = discountPercent(product.price, product.originalPrice);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to={`/product/${product.id}`}
            className="text-sm text-purple-600 hover:underline"
          >
            ← Back to product
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Virtual Try-On</h1>
          <p className="text-gray-600">
            {product.name} · {product.brand}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold">{formatINR(product.price)}</p>
          {discount > 0 ? (
            <p className="text-sm text-green-600">{discount}% off</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ------------------------------------------------------ 3D stage */}
        <div className="lg:col-span-2">
          <div
            ref={mountRef}
            className="relative h-[65vh] min-h-[420px] w-full overflow-hidden rounded-xl bg-[#f6f5f8] shadow-sm"
          >
            {status !== 'ready' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                {status === 'error' ? (
                  <p className="px-6 text-center text-sm text-red-600">
                    {errorMessage}
                  </p>
                ) : (
                  <Spinner label="Building your fitting room…" />
                )}
              </div>
            ) : null}

            <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                {modelSource === 'model' ? '3D model' : `Procedural ${kind} preview`}
              </span>
              {vrSupported ? (
                <span className="rounded-full bg-purple-600/90 px-3 py-1 text-xs font-medium text-white shadow">
                  VR headset detected
                </span>
              ) : null}
            </div>

            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <button
                type="button"
                onClick={resetView}
                className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow hover:bg-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset view
              </button>
              <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs text-gray-500">
                Drag to rotate · scroll to zoom
              </span>
            </div>
          </div>

          {/* WebXR entry point */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div ref={vrMountRef} />
            {!vrSupported ? (
              <p className="text-xs text-gray-500">
                Immersive VR needs a headset (or a WebXR emulator). The 3D fitting room
                above works on any device.
              </p>
            ) : null}
          </div>
        </div>

        {/* ------------------------------------------------------- controls */}
        <aside className="space-y-6">
          <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Boxes className="h-4 w-4 text-purple-600" />
              Your measurements
            </h2>

            <div className="space-y-4">
              {(Object.keys(MEASUREMENT_RANGES) as MeasurementKey[]).map((key) => {
                const range = MEASUREMENT_RANGES[key];
                return (
                  <div key={key}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <label htmlFor={`m-${key}`}>{range.label}</label>
                      <span className="text-gray-500">{measurements[key]} cm</span>
                    </div>
                    <input
                      id={`m-${key}`}
                      type="range"
                      min={range.min}
                      max={range.max}
                      step={range.step}
                      value={measurements[key]}
                      onChange={(event) =>
                        updateMeasurement(key, Number(event.target.value))
                      }
                      className="w-full accent-purple-600"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-medium">Skin tone</p>
              <div className="flex flex-wrap gap-2">
                {SKIN_TONES.map((tone) => (
                  <button
                    key={tone.hex}
                    type="button"
                    title={tone.label}
                    aria-label={tone.label}
                    aria-pressed={measurements.skinTone === tone.hex}
                    onClick={() =>
                      setMeasurements((current) => ({
                        ...current,
                        skinTone: tone.hex,
                      }))
                    }
                    className={`h-8 w-8 rounded-full border-2 ${
                      measurements.skinTone === tone.hex
                        ? 'border-purple-600'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: tone.hex }}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">Fit & colour</h2>

            <div className="mb-4">
              <p className="mb-2 text-sm font-medium">Size</p>
              <div className="flex gap-2">
                {SIZES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    aria-pressed={size === option}
                    className={`h-10 w-10 rounded-full border-2 ${
                      size === option
                        ? 'border-purple-600 text-purple-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-sm font-medium">Colour</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setColor(option)}
                    aria-pressed={color === option}
                    aria-label={option}
                    title={option}
                    className={`h-8 w-8 rounded-full border-2 ${
                      color === option ? 'border-purple-600' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: colorToHex(option) }}
                  />
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRotate}
                onChange={(event) => setAutoRotate(event.target.checked)}
                className="rounded text-purple-600"
              />
              Auto-rotate
            </label>
          </section>

          <button
            type="button"
            onClick={handleAddToBag}
            className="btn btn-primary w-full"
          >
            <ShoppingBag className="h-5 w-5" />
            Add to bag &amp; start home trial
          </button>

          <p className="text-xs leading-relaxed text-gray-500">
            This is a virtual preview generated from your measurements — it is a guide
            to fit and colour, not a substitute for the 2-hour home trial. You only pay
            for what you keep.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default TryOn;
