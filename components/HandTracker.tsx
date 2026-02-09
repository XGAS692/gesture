
import React, { useEffect, useRef, useState } from 'react';
import { HandData } from '../types';
import { recognizeGesture } from '../services/gestureService';
import { Camera as CameraIcon, ShieldAlert } from 'lucide-react';

// Access MediaPipe from global window due to legacy module structure
const { Hands, Camera } = window as any;

interface HandTrackerProps {
  onHandUpdate: (data: HandData | null) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current || !Hands || !Camera) {
      if (!Hands || !Camera) {
        setError("MediaPipe dependencies failed to load.");
      }
      return;
    }

    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const gesture = recognizeGesture(landmarks);
        onHandUpdate({ landmarks, gesture });
      } else {
        onHandUpdate(null);
      }
      if (loading) setLoading(false);
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start().catch((err: any) => {
      console.error(err);
      setError("Failed to access camera. Please ensure permissions are granted.");
      setLoading(false);
    });

    return () => {
      camera.stop();
      hands.close();
    };
  }, []);

  if (error) {
    return (
      <div className="absolute top-4 left-4 z-50 bg-red-900/80 text-white p-4 rounded-xl flex items-center gap-3 backdrop-blur-md border border-red-500/30">
        <ShieldAlert className="w-6 h-6" />
        <span className="text-sm font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 z-50">
      <div className="relative w-48 h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/40 backdrop-blur-md">
        <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" />
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-[10px] text-purple-200 uppercase tracking-widest font-bold">Initing AI...</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-center text-white/40 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-1">
        <CameraIcon className="w-3 h-3" />
        Live Feed
      </div>
    </div>
  );
};

export default HandTracker;
