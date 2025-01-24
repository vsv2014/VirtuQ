import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-webgpu';

export class PoseDetector {
  private detector: poseDetection.PoseDetector | null = null;

  async initialize() {
    try {
      // Try WebGPU first
      try {
        await tf.setBackend('webgpu');
      } catch {
        // Fallback to WebGL
        await tf.setBackend('webgl');
      }

      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        {
          runtime: 'tfjs',
          modelType: 'full'
        }
      );
    } catch (err) {
      console.error('Failed to initialize pose detector:', err);
      throw err;
    }
  }

  async detectPose(image: HTMLVideoElement | HTMLImageElement) {
    if (!this.detector) {
      throw new Error('Pose detector not initialized');
    }

    try {
      const poses = await this.detector.estimatePoses(image, {
        flipHorizontal: false
      });
      return poses;
    } catch (err) {
      console.error('Pose detection failed:', err);
      throw err;
    }
  }
}
