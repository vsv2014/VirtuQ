import * as tf from '@tensorflow/tfjs';
import { Pose } from '@tensorflow-models/pose-detection';

export class GarmentOverlay {
  async initialize() {
    // For now, we'll use a simple implementation without a ML model
  }

  async overlayGarment(
    originalImage: HTMLImageElement | HTMLVideoElement,
    garmentImage: HTMLImageElement,
    pose: Pose
  ) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // Draw the original image
    ctx.drawImage(originalImage, 0, 0);

    // Get body keypoints
    const shoulders = this.getShoulderPoints(pose);
    const torso = this.getTorsoPoints(pose);
    const neck = this.getNeckPoint(pose);

    // Calculate garment dimensions and position
    const shoulderWidth = Math.abs(shoulders.right.x - shoulders.left.x);
    const torsoHeight = Math.abs(torso.top.y - torso.bottom.y);
    
    const garmentWidth = shoulderWidth * 1.3; // Slightly wider than shoulders
    const garmentHeight = torsoHeight * 1.2; // Slightly longer than torso
    
    // Center the garment on the body
    const x = shoulders.left.x - (garmentWidth - shoulderWidth) / 2;
    const y = neck.y - garmentHeight * 0.1; // Slight offset for neck

    // Calculate rotation angle based on shoulders
    const angle = Math.atan2(
      shoulders.right.y - shoulders.left.y,
      shoulders.right.x - shoulders.left.x
    );

    // Save context state
    ctx.save();

    // Translate to center point for rotation
    ctx.translate(x + garmentWidth / 2, y + garmentHeight / 2);
    ctx.rotate(angle);
    ctx.translate(-(x + garmentWidth / 2), -(y + garmentHeight / 2));

    // Draw the garment with proper scaling
    ctx.drawImage(
      garmentImage,
      x,
      y,
      garmentWidth,
      garmentHeight
    );

    // Restore context state
    ctx.restore();

    return canvas.toDataURL('image/png');
  }

  private getShoulderPoints(pose: Pose) {
    const leftShoulder = pose.keypoints.find(kp => kp.name === 'left_shoulder');
    const rightShoulder = pose.keypoints.find(kp => kp.name === 'right_shoulder');

    if (!leftShoulder || !rightShoulder) {
      throw new Error('Could not detect shoulders');
    }

    return {
      left: { x: leftShoulder.x, y: leftShoulder.y },
      right: { x: rightShoulder.x, y: rightShoulder.y }
    };
  }

  private getTorsoPoints(pose: Pose) {
    const leftShoulder = pose.keypoints.find(kp => kp.name === 'left_shoulder');
    const leftHip = pose.keypoints.find(kp => kp.name === 'left_hip');

    if (!leftShoulder || !leftHip) {
      throw new Error('Could not detect torso points');
    }

    return {
      top: { x: leftShoulder.x, y: leftShoulder.y },
      bottom: { x: leftHip.x, y: leftHip.y }
    };
  }

  private getNeckPoint(pose: Pose) {
    const leftShoulder = pose.keypoints.find(kp => kp.name === 'left_shoulder');
    const rightShoulder = pose.keypoints.find(kp => kp.name === 'right_shoulder');

    if (!leftShoulder || !rightShoulder) {
      throw new Error('Could not detect shoulders for neck point');
    }

    // Estimate neck position as midpoint between shoulders, slightly higher
    return {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: Math.min(leftShoulder.y, rightShoulder.y) - 10
    };
  }
}
