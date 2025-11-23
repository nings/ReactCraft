import React, { useEffect, useRef } from 'react';
import { useSphere } from '@react-three/cannon';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useKeyboard } from '../hooks/useKeyboard';
import { playerRef } from '../hooks/useStore';

const JUMP_FORCE = 4;
const SPEED = 4;

export const Player: React.FC = () => {
  const { camera } = useThree();
  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [0, 1, 10],
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  const pos = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((p) => {
      pos.current = p;
      // Sync global ref for AI
      playerRef.current = p;
  }), [api.position]);

  const { moveBackward, moveForward, moveLeft, moveRight, jump } = useKeyboard();

  useFrame(() => {
    // Sync camera to physics body
    camera.position.copy(new Vector3(pos.current[0], pos.current[1] + 1, pos.current[2]));

    // Movement Logic
    const direction = new Vector3();
    const frontVector = new Vector3(0, 0, Number(moveBackward) - Number(moveForward));
    const sideVector = new Vector3(Number(moveLeft) - Number(moveRight), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(SPEED)
      .applyEuler(camera.rotation);

    api.velocity.set(direction.x, velocity.current[1], direction.z);

    if (jump && Math.abs(velocity.current[1]) < 0.05) {
      api.velocity.set(velocity.current[0], JUMP_FORCE, velocity.current[2]);
    }
  });

  // @ts-ignore
  return <mesh ref={ref as any} />;
};