import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, PointerLockControls, Stars } from '@react-three/drei';
import { Physics } from '@react-three/cannon';
import { Player } from './Player';
import { Ground } from './Ground';
import { Cube } from './Cube';
import { Animal } from './Animal';
import { Effects } from './Effects';
import { useStore } from '../hooks/useStore';
import { useKeyboard } from '../hooks/useKeyboard';
import * as THREE from 'three';

// Helper component to listen for global spawn keys inside the Canvas context
const SpawnController = () => {
  const { spawnDog, spawnWolf, spawnZombie } = useKeyboard();
  const addAnimal = useStore(state => state.addAnimal);
  const playerPosRef = useRef(new THREE.Vector3());

  // Debounce to prevent spamming too many on one keypress
  useEffect(() => {
    if (spawnDog) {
        addAnimal(Math.random() * 10 - 5, 2, Math.random() * 10 - 5, 'dog');
    }
  }, [spawnDog, addAnimal]);

  useEffect(() => {
    if (spawnWolf) {
        addAnimal(Math.random() * 10 - 5, 2, Math.random() * 10 - 5, 'wolf');
    }
  }, [spawnWolf, addAnimal]);

  useEffect(() => {
    if (spawnZombie) {
        addAnimal(Math.random() * 10 - 5, 2, Math.random() * 10 - 5, 'zombie');
    }
  }, [spawnZombie, addAnimal]);

  return null;
}

export const GameScene: React.FC = () => {
  const cubes = useStore((state) => state.cubes);
  const animals = useStore((state) => state.animals);

  return (
    <Canvas shadows camera={{ fov: 45 }}>
      <Sky sunPosition={[100, 100, 20]} />
      <Stars />
      {/* @ts-ignore */}
      <ambientLight intensity={0.5} />
      {/* @ts-ignore */}
      <pointLight position={[100, 100, 100]} intensity={1} castShadow />
      
      <Physics gravity={[0, -9.81, 0]}>
        <Player />
        <SpawnController />
        <Ground />
        <Effects />
        {cubes.map((cube) => (
          <Cube key={cube.id} position={cube.pos} texture={cube.texture} />
        ))}
        {animals.map((animal) => (
            <Animal 
              key={animal.id} 
              id={animal.id} 
              position={animal.pos} 
              type={animal.type} 
              rotation={animal.rotation}
              health={animal.health}
            />
        ))}
      </Physics>
      
      <PointerLockControls />
    </Canvas>
  );
};