import React, { useState } from 'react';
import { useBox } from '@react-three/cannon';
import { useStore } from '../hooks/useStore';
import { TextureType } from '../types';
import * as THREE from 'three';
import { textureImg, textureColors } from '../utils/textures';
import { useTexture } from '@react-three/drei';

interface CubeProps {
  position: [number, number, number];
  texture: TextureType;
}

export const Cube: React.FC<CubeProps> = ({ position, texture }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
  }));
  
  // Split selectors to prevent re-renders on every store update
  const addCube = useStore((state) => state.addCube);
  const removeCube = useStore((state) => state.removeCube);
  const addEffect = useStore((state) => state.addEffect);
  const activeTextureType = useStore(state => state.texture);
  const setPreviewPosition = useStore(state => state.setPreviewPosition);

  // Load texture from our generated data URLs
  const activeTexture = useTexture(textureImg[texture]);
  activeTexture.magFilter = THREE.NearestFilter; // Pixel art look
  activeTexture.minFilter = THREE.LinearMipMapLinearFilter;
  activeTexture.wrapS = THREE.RepeatWrapping;
  activeTexture.wrapT = THREE.RepeatWrapping;

  // Handle glass transparency
  const isGlass = texture === 'glass';

  return (
    <mesh
      ref={ref as any}
      onPointerMove={(e) => {
        e.stopPropagation();
        setIsHovered(true);

        // Calculate preview position based on hovered face
        const clickedFace = Math.floor(e.faceIndex! / 2);
        const { x, y, z } = ref.current!.position;
        let newPos: [number, number, number] = [x, y, z];

        if (clickedFace === 0) newPos = [x + 1, y, z];
        else if (clickedFace === 1) newPos = [x - 1, y, z];
        else if (clickedFace === 2) newPos = [x, y + 1, z];
        else if (clickedFace === 3) newPos = [x, y - 1, z];
        else if (clickedFace === 4) newPos = [x, y, z + 1];
        else if (clickedFace === 5) newPos = [x, y, z - 1];

        setPreviewPosition(newPos);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
        setPreviewPosition(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        const clickedFace = Math.floor(e.faceIndex! / 2);
        const { x, y, z } = ref.current!.position;

        if ((e as any).altKey) {
            removeCube(x, y, z);
            addEffect(x, y, z, textureColors[texture]);
            return;
        }

        // Logic to add cube based on face normal
        let newPos: [number, number, number] = [x, y, z];
        if (clickedFace === 0) newPos = [x + 1, y, z];
        else if (clickedFace === 1) newPos = [x - 1, y, z];
        else if (clickedFace === 2) newPos = [x, y + 1, z];
        else if (clickedFace === 3) newPos = [x, y - 1, z];
        else if (clickedFace === 4) newPos = [x, y, z + 1];
        else if (clickedFace === 5) newPos = [x, y, z - 1];

        addCube(...newPos);
        addEffect(...newPos, textureColors[activeTextureType]);
      }}
    >
      <boxGeometry attach="geometry" />
      <meshStandardMaterial 
        attach="material" 
        map={activeTexture} 
        color={isHovered ? 'grey' : 'white'}
        transparent={isGlass}
        opacity={isGlass ? 0.6 : 1}
      />
    </mesh>
  );
};