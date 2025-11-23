import React, { useMemo } from 'react';
import { usePlane } from '@react-three/cannon';
import { useStore } from '../hooks/useStore';
import { textureImg } from '../utils/textures';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const Ground: React.FC = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.5, 0],
  }));

  const addCube = useStore((state) => state.addCube);
  
  const texture = useTexture(textureImg.grass);
  
  const grassTexture = useMemo(() => {
      const t = texture.clone();
      t.magFilter = THREE.NearestFilter;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(100, 100);
      return t;
  }, [texture]);

  return (
    <mesh
      ref={ref as any}
      onClick={(e) => {
        e.stopPropagation();
        // Prevent adding cubes under the ground if clicked incorrectly
        // Add cube above the ground click point
        if (e.point.y < 0.1) { 
           addCube(Math.round(e.point.x), 0, Math.round(e.point.z));
        }
      }}
    >
      <planeGeometry attach="geometry" args={[100, 100]} />
      <meshStandardMaterial attach="material" map={grassTexture} />
    </mesh>
  );
};