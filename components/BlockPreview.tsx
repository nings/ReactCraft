import React from 'react';
import { useTexture } from '@react-three/drei';
import { TextureType } from '../types';
import { textureImg } from '../utils/textures';
import * as THREE from 'three';

interface BlockPreviewProps {
  position: [number, number, number];
  texture: TextureType;
}

export const BlockPreview: React.FC<BlockPreviewProps> = ({ position, texture }) => {
  const activeTexture = useTexture(textureImg[texture]);
  activeTexture.magFilter = THREE.NearestFilter;
  activeTexture.minFilter = THREE.LinearMipMapLinearFilter;

  return (
    <mesh position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        map={activeTexture}
        transparent
        opacity={0.5}
        color="#88ff88"
      />
    </mesh>
  );
};
