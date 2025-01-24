import React, { useEffect, useRef, useState } from 'react';
import { useVirtualTryOn } from '../../lib/ml/use-virtual-try-on';

interface VirtualTryOnProps {
  productImage: string;
  onProcessed?: (result: string) => void;
}

export const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ productImage, onProcessed }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  const animationFrameRef = useRef<number>();

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
        video: { facingMode: 'user' }
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
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isInitialized) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the product image URL to an image element
    const garmentImg = new Image();
    garmentImg.src = productImage;
    await new Promise((resolve) => {
      garmentImg.onload = resolve;
    });

    try {
      const result = await processImage(video, garmentImg);
      if (result && onProcessed) {
        onProcessed(result.toString());
      }
    } catch (err) {
      console.error('Error processing image:', err);
    }
  };

  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isInitialized || !isRealTimeMode) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the product image URL to an image element
    const garmentImg = new Image();
    garmentImg.src = productImage;
    await new Promise((resolve) => {
      garmentImg.onload = resolve;
    });

    try {
      const result = await processImage(video, garmentImg);
      if (result && onProcessed) {
        onProcessed(result.toString());
      }
    } catch (err) {
      console.error('Error processing frame:', err);
    }

    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  useEffect(() => {
    if (isRealTimeMode && isStreamActive) {
      processFrame();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRealTimeMode, isStreamActive]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="relative w-full max-w-md aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {!isStreamActive ? (
          <button
            onClick={startCamera}
            className="absolute inset-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <span className="text-gray-600">Start Camera</span>
          </button>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
            <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
              <button
                onClick={() => setIsRealTimeMode(!isRealTimeMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isRealTimeMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {isRealTimeMode ? 'Stop Real-time' : 'Start Real-time'}
              </button>
              {!isRealTimeMode && (
                <button
                  onClick={captureFrame}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Capture'}
                </button>
              )}
              <button
                onClick={stopCamera}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Stop Camera
              </button>
            </div>
          </>
        )}
      </div>
      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};
