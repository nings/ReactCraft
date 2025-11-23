import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Cube, TextureType, Particle, Animal, AnimalType } from '../types';
import { debounce } from '../utils/debounce';

// Mutable ref for player position to avoid React re-render cycles on every frame
export const playerRef = { current: [0, 0, 0] };

interface StoreState {
  texture: TextureType;
  cubes: Cube[];
  particles: Particle[];
  animals: Animal[];
  previewPosition: [number, number, number] | null;
  addCube: (x: number, y: number, z: number) => void;
  removeCube: (x: number, y: number, z: number) => void;
  setTexture: (texture: TextureType) => void;
  saveWorld: () => void;
  resetWorld: () => void;
  addEffect: (x: number, y: number, z: number, color: string) => void;
  removeEffect: (id: string) => void;
  addAnimal: (x: number, y: number, z: number, type: AnimalType) => void;
  removeAnimal: (id: string) => void;
  damageAnimal: (id: string, damage: number) => void;
  setPreviewPosition: (pos: [number, number, number] | null) => void;
}

const getLocalStorage = (key: string) => JSON.parse((window as any).localStorage?.getItem(key) || '[]');
const setLocalStorage = (key: string, value: any) => (window as any).localStorage?.setItem(key, JSON.stringify(value));

// Debounced save to prevent excessive localStorage writes (saves 1 second after last change)
const debouncedSave = debounce((cubes: Cube[]) => {
  setLocalStorage('world', cubes);
}, 1000);

export const useStore = create<StoreState>((set) => ({
  texture: 'dirt',
  cubes: getLocalStorage('world'),
  particles: [],
  animals: [
      { id: 'initial-dog', pos: [5, 1, 5], type: 'dog', rotation: 0, health: 1 },
      { id: 'initial-wolf', pos: [-5, 1, 5], type: 'wolf', rotation: 0, health: 1 }
  ],
  previewPosition: null,
  addCube: (x, y, z) => {
    set((state) => {
        const newCubes = [
            ...state.cubes,
            {
                id: nanoid(),
                pos: [x, y, z] as [number, number, number],
                texture: state.texture
            }
        ];
        debouncedSave(newCubes);
        return { cubes: newCubes };
    });
  },
  removeCube: (x, y, z) => {
    set((state) => {
        const newCubes = state.cubes.filter(cube => {
            const [cx, cy, cz] = cube.pos;
            return cx !== x || cy !== y || cz !== z;
        });
        debouncedSave(newCubes);
        return { cubes: newCubes };
    });
  },
  setTexture: (texture) => {
    set(() => ({ texture }));
  },
  saveWorld: () => {
    set((state) => {
      setLocalStorage('world', state.cubes);
      return state;
    });
  },
  resetWorld: () => {
    set(() => {
        setLocalStorage('world', []);
        return { cubes: [] };
    });
  },
  addEffect: (x, y, z, color) => {
    set((state) => ({
      particles: [...state.particles, { id: nanoid(), pos: [x, y, z], color }]
    }));
  },
  removeEffect: (id) => {
    set((state) => ({
      particles: state.particles.filter(p => p.id !== id)
    }));
  },
  addAnimal: (x, y, z, type) => {
      // Zombies have 3 HP, animals have 1 (basically one-shot)
      const health = type === 'zombie' ? 3 : type === 'wolf' ? 2 : 1;
      set((state) => ({
          animals: [...state.animals, { id: nanoid(), pos: [x, y, z], type, rotation: Math.random() * Math.PI * 2, health }]
      }));
  },
  removeAnimal: (id) => {
      set((state) => ({
          animals: state.animals.filter(a => a.id !== id)
      }));
  },
  damageAnimal: (id, damage) => {
    set((state) => {
        const updatedAnimals = state.animals.map(animal => {
            if (animal.id === id) {
                return { ...animal, health: animal.health - damage };
            }
            return animal;
        });
        // Remove dead animals
        const livingAnimals = updatedAnimals.filter(a => a.health > 0);
        return { animals: livingAnimals };
    });
  },
  setPreviewPosition: (pos) => {
    set(() => ({ previewPosition: pos }));
  }
}));