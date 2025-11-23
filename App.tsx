import React, { useState, useEffect } from 'react';
import { GameScene } from './components/GameScene';
import { TextureSelector } from './components/TextureSelector';
import { ChatOverlay } from './components/ChatOverlay';
import { useStore } from './hooks/useStore';
import { TextureType } from './types';

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const cubeCount = useStore((state) => state.cubes.length);
  const currentTexture = useStore((state) => state.texture);
  const setTexture = useStore((state) => state.setTexture);

  // Mouse wheel to cycle through block types
  useEffect(() => {
    const textures: TextureType[] = ['dirt', 'grass', 'glass', 'wood', 'log'];

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const currentIndex = textures.indexOf(currentTexture);
      let newIndex: number;

      if (e.deltaY > 0) {
        // Scroll down - next texture
        newIndex = (currentIndex + 1) % textures.length;
      } else {
        // Scroll up - previous texture
        newIndex = (currentIndex - 1 + textures.length) % textures.length;
      }

      setTexture(textures[newIndex]);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentTexture, setTexture]);

  return (
    <div className="relative w-full h-full bg-slate-900 text-white font-sans">
      {/* 3D Game Canvas */}
      <GameScene />

      {/* Crosshair (Pure CSS centered div) */}
      <div id="crosshair">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-white/80 drop-shadow-md">
          <circle cx="50" cy="50" r="5" />
          <line x1="50" y1="30" x2="50" y2="70" stroke="white" strokeWidth="2" />
          <line x1="30" y1="50" x2="70" y2="50" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      {/* HUD & Controls */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <h1 className="text-2xl font-bold drop-shadow-md tracking-tighter">ReactCraft <span className="text-sky-400">AI</span></h1>
        <p className="text-xs text-slate-300 drop-shadow-md mt-1">
          WASD to Move • Space to Jump • Click to Mine • Alt+Click to Build • Scroll to Switch
        </p>
        <p className="text-xs text-slate-300 drop-shadow-md mt-1">
          <span className="text-yellow-400 font-bold">6</span> Dog • <span className="text-yellow-400 font-bold">7</span> Wolf • <span className="text-red-500 font-bold">8</span> Zombie
        </p>
        <p className="text-xs text-red-400 font-bold mt-1">
          Left Click on Zombies to Attack!
        </p>
        <p className="text-xs text-slate-400 mt-1">Cubes: {cubeCount}</p>
      </div>

      {/* Texture Selector Bar */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
        <TextureSelector />
      </div>

      {/* AI Chat Toggle & Overlay */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2">
         <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-sky-600 hover:bg-sky-500 text-white p-2 rounded-lg shadow-lg transition-all active:scale-95 flex items-center gap-2 backdrop-blur-sm bg-opacity-90"
         >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            <span>AI Architect</span>
         </button>
         
         {isChatOpen && (
           <div className="w-80 md:w-96 h-[500px] bg-slate-900/90 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col">
             <ChatOverlay onClose={() => setIsChatOpen(false)} />
           </div>
         )}
      </div>
    </div>
  );
};

export default App;