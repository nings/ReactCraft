// This utility generates simple pixel-art style textures using HTML5 Canvas
// and returns them as Data URLs to be used by Three.js TextureLoader.

export const textureColors = {
  dirt: '#5d4037',
  grass: '#4caf50',
  glass: '#a5d6a7',
  wood: '#8d6e63',
  log: '#3e2723',
  fur_dog: '#D2B48C', // Tan
  fur_wolf: '#9E9E9E', // Grey
  skin_zombie: '#2E7D32', // Zombie Green
  blood: '#D32F2F', // Red for hit effect
};

declare var document: any;

const createTexture = (color: string, noiseAlpha: number = 0.1, border: boolean = false): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 64, 64);

  // Add noise
  for (let i = 0; i < 256; i++) {
    const x = Math.floor(Math.random() * 64);
    const y = Math.floor(Math.random() * 64);
    ctx.fillStyle = `rgba(0,0,0,${Math.random() * noiseAlpha})`;
    ctx.fillRect(x, y, 4, 4);
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * noiseAlpha})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Optional border for block definition
  if (border) {
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 64, 64);
  }

  return canvas.toDataURL();
};

export const textures = {
  dirt: createTexture(textureColors.dirt, 0.3),
  grass: createTexture(textureColors.grass, 0.2, true),
  glass: createTexture(textureColors.glass, 0.05), // Light green tint, handling transparency in material usually
  wood: createTexture(textureColors.wood, 0.15, true),
  log: createTexture(textureColors.log, 0.4),
  dog: createTexture(textureColors.fur_dog, 0.15),
  wolf: createTexture(textureColors.fur_wolf, 0.2),
  zombie: createTexture(textureColors.skin_zombie, 0.3),
};

export const textureImg = {
    dirt: textures.dirt,
    grass: textures.grass,
    glass: textures.glass,
    wood: textures.wood,
    log: textures.log,
    dog: textures.dog,
    wolf: textures.wolf,
    zombie: textures.zombie,
}