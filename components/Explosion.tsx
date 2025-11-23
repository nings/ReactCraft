import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../hooks/useStore';

interface ExplosionProps {
  id: string;
  position: [number, number, number];
  color: string;
}

export const Explosion: React.FC<ExplosionProps> = ({ id, position, color }) => {
  const [finished, setFinished] = useState(false);
  const removeEffect = useStore((state) => state.removeEffect);
  const particles = useRef<any[]>([]);

  // Initialize particles once
  if (particles.current.length === 0) {
      for(let i=0; i<8; i++) {
          particles.current.push({
              x: position[0] + (Math.random() - 0.5) * 0.5,
              y: position[1] + (Math.random() - 0.5) * 0.5,
              z: position[2] + (Math.random() - 0.5) * 0.5,
              velX: (Math.random() - 0.5) * 0.2,
              velY: Math.random() * 0.2,
              velZ: (Math.random() - 0.5) * 0.2,
              life: 1.0
          })
      }
  }

  useFrame(() => {
     let alive = false;
     particles.current.forEach(p => {
         p.x += p.velX;
         p.y += p.velY;
         p.z += p.velZ;
         p.velY -= 0.01; // Gravity
         p.life -= 0.05; // Fade out
         if (p.life > 0) alive = true;
     });

     if (!alive && !finished) {
         setFinished(true);
         removeEffect(id);
     }
  });

  if (finished) return null;

  return (
      <group>
          {particles.current.map((p, i) => (
              p.life > 0 && (
                <mesh key={i} position={[p.x, p.y, p.z]} scale={[0.2 * p.life, 0.2 * p.life, 0.2 * p.life]}>
                    <boxGeometry />
                    <meshStandardMaterial color={color} transparent opacity={p.life} />
                </mesh>
              )
          ))}
      </group>
  )
}