import { ThreeElements } from '@react-three/fiber';

export type TextureType = 'dirt' | 'grass' | 'glass' | 'wood' | 'log';
export type AnimalType = 'dog' | 'wolf' | 'zombie';

export interface Cube {
  id: string;
  pos: [number, number, number];
  texture: TextureType;
}

export interface Particle {
  id: string;
  pos: [number, number, number];
  color: string;
}

export interface Animal {
  id: string;
  pos: [number, number, number];
  type: AnimalType;
  rotation: number;
  health: number;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isLoading?: boolean;
}

// Remove invalid global augmentation that breaks standard elements