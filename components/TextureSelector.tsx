import React, { useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useKeyboard } from '../hooks/useKeyboard';
import { TextureType } from '../types';
import { textureImg } from '../utils/textures';

const images: Record<string, string> = {
  dirt: textureImg.dirt,
  grass: textureImg.grass,
  glass: textureImg.glass,
  wood: textureImg.wood,
  log: textureImg.log,
};

export const TextureSelector: React.FC = () => {
  const activeTexture = useStore((state) => state.texture);
  const setTexture = useStore((state) => state.setTexture);
  const { dirt, grass, glass, wood, log } = useKeyboard();

  useEffect(() => {
    const textures: Record<string, boolean> = { dirt, grass, glass, wood, log };
    const pressedTexture = Object.keys(textures).find((k) => textures[k]);
    if (pressedTexture) {
      setTexture(pressedTexture as TextureType);
    }
  }, [setTexture, dirt, grass, glass, wood, log]);

  return (
    <div className="flex bg-slate-800/80 backdrop-blur-md p-2 rounded-xl shadow-lg border border-slate-600 gap-2">
      {Object.entries(images).map(([k, src]) => (
        <div
          key={k}
          className={`
            w-12 h-12 rounded-lg border-2 overflow-hidden transition-all duration-200 cursor-pointer
            ${k === activeTexture ? 'border-sky-500 scale-110 shadow-lg shadow-sky-500/50' : 'border-slate-600 opacity-70 hover:opacity-100'}
          `}
          onClick={() => setTexture(k as TextureType)}
        >
          <img src={src} alt={k} className="w-full h-full object-cover rendering-pixelated" style={{ imageRendering: 'pixelated' }} />
        </div>
      ))}
    </div>
  );
};