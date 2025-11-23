import React, { useRef, useState } from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useTexture, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { AnimalType } from '../types';
import { textureImg, textureColors } from '../utils/textures';
import { useStore, playerRef } from '../hooks/useStore';

interface AnimalProps {
  id: string;
  position: [number, number, number];
  type: AnimalType;
  rotation: number;
  health: number;
}

type AIState = 'idle' | 'patrol' | 'chase' | 'flee';

export const Animal: React.FC<AnimalProps> = ({ id, position, type, rotation: initialRotation, health }) => {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    rotation: [0, initialRotation, 0],
    fixedRotation: true,
    args: [0.6, 0.8, 1.2], // Bounding box
  }));

  const damageAnimal = useStore(state => state.damageAnimal);
  const addEffect = useStore(state => state.addEffect);
  const healthBarRef = useRef<THREE.Group>(null);

  // Max health based on type
  const maxHealth = type === 'zombie' ? 3 : type === 'wolf' ? 2 : 1;

  // Determine texture based on type
  const textureUrl = 
    type === 'dog' ? textureImg.dog : 
    type === 'wolf' ? textureImg.wolf : 
    textureImg.zombie;

  const texture = useTexture(textureUrl);
  texture.magFilter = THREE.NearestFilter;
  
  // Patrol Path Generation
  // We generate this once on mount so the animal has a "territory"
  const patrolWaypoints = useRef<THREE.Vector3[]>([]);
  if (patrolWaypoints.current.length === 0) {
      const startX = position[0];
      const startZ = position[2];
      
      if (type === 'dog') {
          // Dogs guard a tight square area (4x4)
          patrolWaypoints.current = [
              new THREE.Vector3(startX, position[1], startZ),
              new THREE.Vector3(startX + 4, position[1], startZ),
              new THREE.Vector3(startX + 4, position[1], startZ + 4),
              new THREE.Vector3(startX, position[1], startZ + 4),
          ];
      } else if (type === 'wolf') {
          // Wolves roam a wider area (10x10)
          patrolWaypoints.current = [
              new THREE.Vector3(startX, position[1], startZ),
              new THREE.Vector3(startX + 10, position[1], startZ + 5),
              new THREE.Vector3(startX, position[1], startZ + 10),
              new THREE.Vector3(startX - 10, position[1], startZ + 5),
          ];
      } else {
          // Zombies shamble back and forth in a line
          patrolWaypoints.current = [
              new THREE.Vector3(startX, position[1], startZ),
              new THREE.Vector3(startX + 6, position[1], startZ),
          ];
      }
  }

  // Behavior state
  const state = useRef({
      time: Math.random() * 100,
      currentState: 'idle' as AIState, 
      rotation: initialRotation,
      actionDuration: 0,
      isAggro: false,
      fleeTimer: 0,
      waypointIndex: 0, // Current target in patrol path
  });

  const [flash, setFlash] = useState(false);

  useFrame(() => {
    if (!ref.current) return;
    state.current.time += 0.01;

    // Get positions
    const myPos = ref.current.position;
    const playerPos = playerRef.current; // [x, y, z]

    const dx = playerPos[0] - myPos.x;
    const dz = playerPos[2] - myPos.z;
    const distanceToPlayer = Math.sqrt(dx * dx + dz * dz);

    // Update Health Bar Visibility based on distance
    if (healthBarRef.current) {
        healthBarRef.current.visible = distanceToPlayer < 10;
    }

    // --- AI DECISION LOGIC ---

    // 1. Check Flee Timer (Dogs)
    if (state.current.fleeTimer > 0) {
        state.current.currentState = 'flee';
        state.current.fleeTimer--;
    } 
    // 2. Logic Per Type (Aggression overrides patrol)
    else if (type === 'zombie') {
        if (distanceToPlayer < 20) {
            state.current.currentState = 'chase';
        } else {
             // If we lost interest, go back to patrolling (via idle)
             if (state.current.currentState === 'chase') state.current.currentState = 'idle';
        }
    } 
    else if (type === 'wolf') {
        if (state.current.isAggro || distanceToPlayer < 8) {
            state.current.currentState = 'chase';
        } else if (state.current.currentState === 'chase') {
             state.current.currentState = 'idle';
        }
    }

    // 3. Patrol Logic (if not chasing or fleeing)
    if (state.current.currentState === 'idle' || state.current.currentState === 'patrol') {
        if (state.current.actionDuration <= 0) {
            // Time to switch logic
            if (state.current.currentState === 'idle') {
                // Switch to moving to next waypoint
                state.current.currentState = 'patrol';
                // Pick next waypoint index
                state.current.waypointIndex = (state.current.waypointIndex + 1) % patrolWaypoints.current.length;
            } 
            // Note: If we are in 'patrol', we stay in patrol until we reach the destination (handled in movement block)
        } else {
            state.current.actionDuration--;
        }
    }

    // --- MOVEMENT EXECUTION ---

    let speed = 0;
    let targetX = 0;
    let targetZ = 0;
    
    // Determine Target
    if (state.current.currentState === 'chase') {
        targetX = playerPos[0];
        targetZ = playerPos[2];
        if (type === 'zombie') speed = 0.8;
        if (type === 'wolf') speed = 2.8;
    } 
    else if (state.current.currentState === 'flee') {
        // Run away from player
        targetX = myPos.x - dx; 
        targetZ = myPos.z - dz;
        speed = 3.5;
    } 
    else if (state.current.currentState === 'patrol') {
        const wp = patrolWaypoints.current[state.current.waypointIndex];
        targetX = wp.x;
        targetZ = wp.z;
        speed = type === 'wolf' ? 1.5 : type === 'zombie' ? 0.5 : 1.2;

        // Check if reached waypoint
        const distToWp = Math.sqrt(Math.pow(targetX - myPos.x, 2) + Math.pow(targetZ - myPos.z, 2));
        if (distToWp < 1.0) {
            // Arrived at waypoint. Switch to idle for a bit.
            state.current.currentState = 'idle';
            state.current.actionDuration = 100 + Math.random() * 100; // Pause for 1-2 seconds
            speed = 0;
        }
    }

    // Apply Velocity and Rotation
    if (speed > 0 || state.current.currentState === 'chase' || state.current.currentState === 'patrol') {
        const moveDx = targetX - myPos.x;
        const moveDz = targetZ - myPos.z;
        
        // Calculate rotation towards target
        const targetRotation = Math.atan2(moveDx, moveDz);
        
        // Smooth rotation could go here, but instant is fine for low-poly style
        state.current.rotation = targetRotation;

        const xDir = Math.sin(state.current.rotation) * speed;
        const zDir = Math.cos(state.current.rotation) * speed;
        
        // Don't move if speed is 0 (just rotated)
        if (speed > 0) {
            api.velocity.set(xDir, -5, zDir);
        } else {
             api.velocity.set(0, -5, 0);
        }
        
        api.rotation.set(0, state.current.rotation, 0);
    } else {
        api.velocity.set(0, -5, 0);
    }
  });

  const handleAttack = (e: any) => {
    e.stopPropagation();
    
    // Trigger visual hit effect
    setFlash(true);
    setTimeout(() => setFlash(false), 100);
    
    // Add particle effect
    if (ref.current) {
        const { x, y, z } = ref.current.position;
        addEffect(x, y + 0.5, z, textureColors.blood);
    }

    // AI Reaction to Attack
    if (type === 'dog') {
        state.current.fleeTimer = 200; // Run for ~3 seconds
    } else if (type === 'wolf') {
        state.current.isAggro = true; // Permanently angry
    }

    // Damage logic
    damageAnimal(id, 1);
  };

  const bodyMaterial = new THREE.MeshStandardMaterial({ 
      map: texture, 
      color: flash ? 'red' : 'white' 
  });
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: flash ? 'red' : 'black' });
  const noseMaterial = new THREE.MeshStandardMaterial({ color: flash ? 'red' : 'black' });

  const isZombie = type === 'zombie';
  // Zombies raise arms when chasing
  const isChasing = state.current.currentState === 'chase';
  const armRotation: [number, number, number] = (isZombie || (isChasing && isZombie)) ? [-Math.PI / 2, 0, 0] : [0, 0, 0];
  const armZ = isZombie ? 0.4 : 0.35;
  const armY = isZombie ? 0.3 : -0.6;

  // Health Bar Maths
  const healthPercent = Math.max(0, health / maxHealth);
  const barWidth = 0.8;
  const greenWidth = barWidth * healthPercent;
  // Center of green bar needs to be shifted because scaling happens from center
  const greenOffset = -barWidth / 2 + greenWidth / 2;

  return (
    <group ref={ref as any} onClick={handleAttack}>
        {/* Health Bar Billboard */}
        <group position={[0, 1.2, 0]} ref={healthBarRef}>
            <Billboard>
                {/* Background (Red) */}
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[barWidth + 0.04, 0.14]} />
                    <meshBasicMaterial color="#300" />
                </mesh>
                 {/* Background (Black Inner) */}
                 <mesh position={[0, 0, 0.01]}>
                    <planeGeometry args={[barWidth, 0.1]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                {/* Foreground (Green) */}
                {health > 0 && (
                    <mesh position={[greenOffset, 0, 0.02]}>
                        <planeGeometry args={[greenWidth, 0.1]} />
                        <meshBasicMaterial color={healthPercent > 0.5 ? "#0f0" : "#f00"} />
                    </mesh>
                )}
            </Billboard>
        </group>

        {/* Body */}
        <mesh position={[0, -0.2, 0]} castShadow>
            <boxGeometry args={[0.5, 0.5, 0.9]} />
            <primitive object={bodyMaterial} attach="material" />
        </mesh>

        {/* Head */}
        <group position={[0, 0.3, 0.55]}>
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.4, 0.4, 0.5]} />
                <primitive object={bodyMaterial} attach="material" />
            </mesh>
            {/* Eyes */}
            <mesh position={[0.12, 0.05, 0.26]}>
                <boxGeometry args={[0.08, 0.08, 0.05]} />
                <primitive object={eyeMaterial} attach="material" />
            </mesh>
            <mesh position={[-0.12, 0.05, 0.26]}>
                <boxGeometry args={[0.08, 0.08, 0.05]} />
                <primitive object={eyeMaterial} attach="material" />
            </mesh>
            {/* Nose (only for dogs/wolves usually, zombies have flat face) */}
            {!isZombie && (
                <mesh position={[0, -0.1, 0.26]}>
                     <boxGeometry args={[0.1, 0.08, 0.05]} />
                     <primitive object={noseMaterial} attach="material" />
                </mesh>
            )}
             {/* Ears (only for dogs/wolves) */}
             {!isZombie && (
                <>
                    <mesh position={[0.15, 0.25, -0.1]}>
                        <boxGeometry args={[0.1, 0.15, 0.1]} />
                        <primitive object={bodyMaterial} attach="material" />
                    </mesh>
                    <mesh position={[-0.15, 0.25, -0.1]}>
                        <boxGeometry args={[0.1, 0.15, 0.1]} />
                        <primitive object={bodyMaterial} attach="material" />
                    </mesh>
                </>
             )}
        </group>

        {/* Legs / Arms */}
        {/* Front Left */}
        <mesh position={[-0.2, armY, armZ]} rotation={armRotation} castShadow>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <primitive object={bodyMaterial} attach="material" />
        </mesh>
        {/* Front Right */}
        <mesh position={[0.2, armY, armZ]} rotation={armRotation} castShadow>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <primitive object={bodyMaterial} attach="material" />
        </mesh>
        
        {/* Back Legs (Zombies just have legs, animals have 4 legs) */}
        <mesh position={[-0.2, -0.6, -0.35]} castShadow>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <primitive object={bodyMaterial} attach="material" />
        </mesh>
        <mesh position={[0.2, -0.6, -0.35]} castShadow>
            <boxGeometry args={[0.15, 0.5, 0.15]} />
            <primitive object={bodyMaterial} attach="material" />
        </mesh>

        {/* Tail (Animals only) */}
        {!isZombie && (
            <mesh position={[0, 0, -0.5]} rotation={[0.5, 0, 0]} castShadow>
                 <boxGeometry args={[0.1, 0.1, 0.4]} />
                 <primitive object={bodyMaterial} attach="material" />
            </mesh>
        )}
    </group>
  );
};