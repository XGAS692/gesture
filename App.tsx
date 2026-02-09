
import React, { useState, useCallback } from 'react';
import HandTracker from './components/HandTracker';
import ParticleCanvas from './components/ParticleCanvas';
import { HandData, GestureType, ParticleState } from './types';
import { Heart, Hand, Info, ThumbsUp, Sparkles, MessageSquareHeart } from 'lucide-react';

const App: React.FC = () => {
  const [particleState, setParticleState] = useState<ParticleState>({
    gesture: GestureType.IDLE,
    handPos: { x: 0.5, y: 0.5, z: 0 },
  });

  const handleHandUpdate = useCallback((data: HandData | null) => {
    if (data) {
      setParticleState({
        gesture: data.gesture,
        handPos: data.landmarks[9], // Using middle finger base as palm center
      });
    } else {
      setParticleState(prev => ({
        ...prev,
        gesture: GestureType.IDLE
      }));
    }
  }, []);

  const getGestureLabel = () => {
    switch (particleState.gesture) {
      case GestureType.ILOVEYOU: return { text: "I LOVE YOU", icon: <MessageSquareHeart className="w-5 h-5 text-purple-400" /> };
      case GestureType.VICTORY: return { text: "LOVE HEART", icon: <Heart className="w-5 h-5 text-pink-400 fill-pink-400" /> };
      case GestureType.THUMBSUP: return { text: "CELESTIAL SPHERE", icon: <ThumbsUp className="w-5 h-5 text-green-400" /> };
      case GestureType.FIST: return { text: "GRAVITY WELL", icon: <Hand className="w-5 h-5 text-blue-400" /> };
      default: return { text: "CELESTIAL DUST", icon: <Sparkles className="w-5 h-5 text-white/60" /> };
    }
  };

  const gestureInfo = getGestureLabel();

  return (
    <div className="relative w-full h-full bg-black overflow-hidden font-sans select-none">
      {/* 3D Background */}
      <ParticleCanvas handState={particleState} />

      {/* UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none p-8 flex flex-col justify-between">
        {/* Header */}
        <header className="flex justify-between items-start w-full">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-emerald-400 to-blue-500 tracking-tighter">
              CELESTIAL HANDS
            </h1>
            <p className="text-white/40 text-sm font-medium tracking-widest mt-1">CREATIVE TECH EXPERIMENT v1.0</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Instructions</span>
            </div>
            <ul className="text-[11px] text-white/40 space-y-1 font-medium leading-relaxed">
              <li>• Open Hand: Random Particles</li>
              <li>• Rock On (🤘): Teks "I Love You"</li>
              <li>• Peace (✌️): Heart Shape</li>
              <li>• Thumbs Up (👍): Solid Sphere</li>
              <li>• Fist (✊): Singular Point</li>
            </ul>
          </div>
        </header>

        {/* Footer Info */}
        <footer className="w-full flex justify-between items-end">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-2xl border border-white/10 px-6 py-4 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="p-2 bg-white/10 rounded-xl">
                {gestureInfo.icon}
              </div>
              <div>
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black">Active Gesture</span>
                <h2 className="text-xl font-black text-white tracking-tight">{gestureInfo.text}</h2>
              </div>
            </div>
          </div>
          
          <div className="text-right">
             <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Powered by Gemini & MediaPipe</span>
          </div>
        </footer>
      </div>

      {/* Webcam Component */}
      <HandTracker onHandUpdate={handleHandUpdate} />

      {/* Decorative Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
};

export default App;
