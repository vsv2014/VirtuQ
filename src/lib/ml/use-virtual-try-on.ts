import { useState, useCallback } from 'react';
import { PoseDetector } from './pose-detection';
import { GarmentOverlay } from './garment-overlay';

export function useVirtualTryOn() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const poseDetector = new PoseDetector();
  const garmentOverlay = new GarmentOverlay();

  const initialize = useCallback(async () => {
    try {
      await Promise.all([
        poseDetector.initialize(),
        garmentOverlay.initialize()
      ]);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError('Failed to initialize virtual try-on');
      console.error('Virtual try-on initialization error:', err);
    }
  }, []);

  const processImage = useCallback(async (
    originalImage: HTMLVideoElement | HTMLImageElement,
    garmentImage: HTMLImageElement
  ) => {
    if (!isInitialized) {
      throw new Error('Virtual try-on not initialized');
    }

    setIsProcessing(true);
    setError(null);

    try {
      const poses = await poseDetector.detectPose(originalImage);
      if (poses.length === 0) {
        throw new Error('No pose detected');
      }

      const result = await garmentOverlay.overlayGarment(
        originalImage,
        garmentImage,
        poses[0]
      );

      return result;
    } catch (err) {
      setError('Failed to process image');
      console.error('Virtual try-on processing error:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [isInitialized]);

  return {
    initialize,
    processImage,
    isInitialized,
    isProcessing,
    error
  };
}
