import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, RefreshCw, Check, X } from 'lucide-react';
import { useVirtualTryOn } from '../../lib/ml/use-virtual-try-on';
import styles from './virtual-try-on.module.css';

interface EnhancedVirtualTryOnProps {
  productImage: string;
  productName: string;
  onProcessed?: (result: string) => void;
}

export const EnhancedVirtualTryOn: React.FC<EnhancedVirtualTryOnProps> = ({ 
  productImage, 
  productName,
  onProcessed 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const {
    initialize,
    processImage,
    isInitialized,
    isProcessing,
    error
  } = useVirtualTryOn();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreamActive(false);
      setCapturedImage(null);
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isInitialized) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const capturedImageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(capturedImageData);
  };

  const processCapture = async () => {
    if (!capturedImage) return;

    const garmentImg = new Image();
    garmentImg.src = productImage;
    await new Promise((resolve) => {
      garmentImg.onload = resolve;
    });

    try {
      const result = await processImage(videoRef.current!, garmentImg);
      if (result && onProcessed) {
        onProcessed(result.toString());
        stopCamera();
      }
    } catch (err) {
      console.error('Error processing image:', err);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl"
      >
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="w-full max-w-2xl">
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden">
          {!isStreamActive ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startCamera}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-800/10 hover:bg-gray-800/20 transition-colors"
            >
              <Camera className="w-12 h-12 text-gray-900 dark:text-white" />
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Start Camera
              </span>
            </motion.button>
          ) : (
            <>
              {capturedImage ? (
                <img 
                  src={capturedImage} 
                  alt="Captured frame"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </>
          )}
        </div>

        {isStreamActive && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-4 mt-6"
          >
            {!capturedImage ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={captureFrame}
                  disabled={!isInitialized}
                  className={`${styles['btn-primary']} flex items-center gap-2`}
                >
                  <Camera className="w-5 h-5" />
                  Capture Photo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={stopCamera}
                  className={`${styles['btn-secondary']} flex items-center gap-2`}
                >
                  <X className="w-5 h-5" />
                  Cancel
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={processCapture}
                  disabled={isProcessing}
                  className={`${styles['btn-primary']} flex items-center gap-2`}
                >
                  <Check className="w-5 h-5" />
                  {isProcessing ? 'Processing...' : 'Use This Photo'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={retakePhoto}
                  className={`${styles['btn-secondary']} flex items-center gap-2`}
                >
                  <RefreshCw className="w-5 h-5" />
                  Retake
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </div>

      <div className="w-full max-w-2xl bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          Try On Instructions
        </h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">1</div>
            Position yourself in front of the camera
          </li>
          <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">2</div>
            Ensure good lighting and a clear background
          </li>
          <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">3</div>
            Take a photo when ready to try on {productName}
          </li>
        </ul>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};
