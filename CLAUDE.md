# CLAUDE.md - ReactCraft AI Codebase Guide

This document provides AI assistants with comprehensive information about the ReactCraft AI codebase structure, development workflows, and key conventions.

## Project Overview

**ReactCraft AI** is a 3D voxel-based sandbox building game built with React, Three.js, and Gemini AI. It combines Minecraft-like mechanics with an AI Architect assistant that helps players with building ideas and guidance.

**Key Features:**
- First-person 3D voxel building mechanics
- Physics-based player movement and gravity
- Multiple block types (dirt, grass, glass, wood, log)
- Entity system with animals (dogs, wolves) and enemies (zombies)
- Integrated Gemini AI chat assistant
- Persistent world storage via localStorage
- Real-time particle effects

## Tech Stack

### Core Technologies
- **React 19.2.0** - UI framework with latest concurrent features
- **TypeScript 5.8.2** - Type-safe development
- **Vite 6.2.0** - Build tool and dev server
- **Three.js 0.181.2** - WebGL 3D rendering engine

### 3D & Physics Libraries
- **@react-three/fiber 9.4.0** - React renderer for Three.js
- **@react-three/drei 10.7.7** - Useful helpers for R3F (Sky, Stars, PointerLockControls)
- **@react-three/cannon 6.6.0** - Physics engine integration (based on cannon.js)

### State & Utilities
- **Zustand 5.0.8** - Lightweight state management
- **nanoid 5.1.6** - Unique ID generation for entities
- **@google/genai 1.30.0** - Gemini AI SDK for chat functionality

## Project Structure

```
ReactCraft/
├── components/          # React Three Fiber components
│   ├── Animal.tsx      # Animal/enemy entities (dogs, wolves, zombies)
│   ├── ChatOverlay.tsx # AI chat interface
│   ├── Cube.tsx        # Individual voxel block component
│   ├── Effects.tsx     # Particle effects system
│   ├── Explosion.tsx   # Explosion animation component
│   ├── GameScene.tsx   # Main 3D scene container
│   ├── Ground.tsx      # Ground plane physics body
│   ├── Player.tsx      # First-person player controller
│   └── TextureSelector.tsx # Block type selector UI
├── hooks/
│   ├── useKeyboard.ts  # Keyboard input handling
│   └── useStore.ts     # Zustand store definition
├── services/
│   └── geminiService.ts # Gemini AI integration
├── utils/
│   └── textures.ts     # Procedural texture generation
├── App.tsx             # Root component with UI layout
├── index.tsx           # React entry point
├── types.ts            # TypeScript type definitions
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

## Architecture Overview

### State Management (Zustand)

**File:** `hooks/useStore.ts`

The application uses a single Zustand store for global state management:

**Key State:**
- `texture: TextureType` - Currently selected block type
- `cubes: Cube[]` - All placed blocks in the world
- `particles: Particle[]` - Active particle effects
- `animals: Animal[]` - All entities (dogs, wolves, zombies)

**Key Actions:**
- `addCube(x, y, z)` - Places a block at coordinates
- `removeCube(x, y, z)` - Removes block at coordinates
- `setTexture(texture)` - Changes active block type
- `saveWorld()` - Persists world to localStorage
- `resetWorld()` - Clears all blocks
- `addEffect(x, y, z, color)` - Creates particle effect
- `addAnimal(x, y, z, type)` - Spawns entity
- `damageAnimal(id, damage)` - Damages entity, removes if health <= 0

**Important Pattern:** `playerRef` is a mutable ref exported separately to avoid re-renders on every frame:
```typescript
export const playerRef = { current: [0, 0, 0] };
```

### 3D Scene Architecture

**File:** `components/GameScene.tsx`

The scene uses React Three Fiber's declarative approach:

```typescript
<Canvas shadows camera={{ fov: 45 }}>
  <Physics gravity={[0, -9.81, 0]}>
    <Player />
    <Ground />
    <Effects />
    {cubes.map(cube => <Cube key={cube.id} ... />)}
    {animals.map(animal => <Animal key={animal.id} ... />)}
  </Physics>
  <PointerLockControls />
</Canvas>
```

**Key Points:**
- All physics objects must be inside `<Physics>` component
- `PointerLockControls` locks cursor for FPS-style camera control
- Environmental elements (Sky, Stars, lights) are outside Physics
- `SpawnController` listens for keyboard events to spawn entities

### Player Controller

**File:** `components/Player.tsx`

**Physics-Based Movement:**
- Uses `useSphere` hook from `@react-three/cannon` for collision
- Camera syncs to physics body position every frame
- Movement calculated using camera rotation for proper FPS controls

**Constants:**
```typescript
const JUMP_FORCE = 4;
const SPEED = 4;
```

**Movement Logic:**
1. Calculate direction vector from WASD input
2. Transform by camera rotation (so "forward" is where you look)
3. Apply to physics velocity (preserving Y for gravity)
4. Jump only if grounded (vertical velocity near zero)

### Keyboard Input System

**File:** `hooks/useKeyboard.ts`

**Key Mappings:**
- `WASD` - Movement
- `Space` - Jump
- `1-5` - Select block types (dirt, grass, glass, wood, log)
- `6-8` - Spawn entities (dog, wolf, zombie)

**Pattern:** Uses boolean state object updated on keydown/keyup events. Components consume via custom hook.

### Entity System

**File:** `components/Animal.tsx`

**Entity Types:**
- `dog` - Friendly, 1 HP
- `wolf` - Neutral, 2 HP
- `zombie` - Enemy, 3 HP, can be attacked

**Entity Properties:**
```typescript
interface Animal {
  id: string;
  pos: [number, number, number];
  type: AnimalType;
  rotation: number;
  health: number;
}
```

**Behavior:**
- Physics body with `useSphere` for collisions
- Click detection via raycasting in R3F
- Health bar displayed above entity
- Removal on death via store action

### Texture System

**File:** `utils/textures.ts`

**Approach:** Procedurally generated textures using HTML5 Canvas API

**Process:**
1. Create 64x64 canvas
2. Fill with base color
3. Add noise for variation (randomized alpha rectangles)
4. Optional border for definition
5. Export as Data URL for Three.js TextureLoader

**Colors:**
```typescript
const textureColors = {
  dirt: '#5d4037',
  grass: '#4caf50',
  glass: '#a5d6a7',
  wood: '#8d6e63',
  log: '#3e2723',
  // Entity colors...
};
```

### AI Integration

**File:** `services/geminiService.ts`

**API Configuration:**
- Model: `gemini-2.5-flash`
- API Key: Loaded from `process.env.API_KEY` (injected via Vite)
- System instruction defines AI persona as "ReactCraft Architect"

**Error Handling:**
- Gracefully handles missing API key
- Returns user-friendly error messages on API failures
- Initializes client in try-catch to prevent crashes

**Usage Pattern:**
```typescript
const response = await askArchitect(userMessage);
// Returns string response or error message
```

## Development Workflows

### Environment Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   Create `.env.local` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://0.0.0.0:3000`

4. **Build for production:**
   ```bash
   npm run build
   ```

### Adding New Block Types

1. Add type to `types.ts`:
   ```typescript
   export type TextureType = 'dirt' | 'grass' | 'glass' | 'wood' | 'log' | 'newType';
   ```

2. Add color to `utils/textures.ts`:
   ```typescript
   export const textureColors = {
     // ... existing
     newType: '#hexcolor',
   };

   export const textures = {
     // ... existing
     newType: createTexture(textureColors.newType, 0.2),
   };
   ```

3. Add keyboard mapping in `hooks/useKeyboard.ts`:
   ```typescript
   const keyActionMap = {
     // ... existing
     Digit9: 'newType',
   };
   ```

4. Update state in `hooks/useKeyboard.ts`:
   ```typescript
   const [actions, setActions] = useState({
     // ... existing
     newType: false,
   });
   ```

5. Update `components/TextureSelector.tsx` to show new block in UI

### Adding New Entity Types

1. Add type to `types.ts`:
   ```typescript
   export type AnimalType = 'dog' | 'wolf' | 'zombie' | 'newEntity';
   ```

2. Add texture color to `utils/textures.ts`

3. Add spawn logic in `components/GameScene.tsx` SpawnController

4. Define health in `hooks/useStore.ts` `addAnimal` function

5. Add rendering logic in `components/Animal.tsx`

### Modifying Physics

**Constants to adjust:**
- Gravity: `<Physics gravity={[0, -9.81, 0]}>` in GameScene.tsx
- Player jump force: `JUMP_FORCE` in Player.tsx
- Player speed: `SPEED` in Player.tsx
- Entity physics: Mass, friction in Animal.tsx `useSphere` config

## Key Conventions

### TypeScript Patterns

**Type Assertions:**
- Use `as any` sparingly for Three.js ref types where typing is complex
- Prefer `@ts-ignore` comments for known library typing issues
- All business logic should have proper types

**Coordinates:**
- Always use tuple type: `[number, number, number]` for positions
- Convention: `[x, y, z]` where Y is vertical axis

### Component Patterns

**React Three Fiber Components:**
```typescript
export const MyComponent: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
  }));

  return <mesh ref={ref as any}>...</mesh>;
};
```

**Hooks Usage:**
- `useFrame` for per-frame updates (60 FPS)
- `useThree` to access camera, scene, gl renderer
- `useSphere`/`useBox` for physics bodies

### State Updates

**Zustand Actions:**
```typescript
// Always return new state object
set((state) => ({
  cubes: [...state.cubes, newCube]
}));

// Persist to localStorage after state changes
setLocalStorage('world', newCubes);
```

**Performance:**
- Avoid subscribing to frequently changing state
- Use mutable refs (`playerRef`) for high-frequency updates
- Filter arrays efficiently (single pass)

### File Organization

**Component Files:**
- One component per file
- Named exports for React components
- PascalCase filenames matching component name

**Utility Files:**
- Named exports for functions
- camelCase filenames
- Group related utilities together

## Important Files to Know

### Configuration Files

**vite.config.ts:**
- Defines environment variable injection (`process.env.API_KEY`)
- Sets up path aliases (`@/` maps to root)
- Configures dev server (port 3000, host 0.0.0.0)

**tsconfig.json:**
- Target: ES2022
- Module: ESNext with bundler resolution
- Path aliases enabled
- `allowImportingTsExtensions` for .tsx imports

### Entry Points

**index.html:**
- Contains root div, loaded CSS
- Vite injects script modules automatically

**index.tsx:**
- React root creation with StrictMode
- Mounts App component

**App.tsx:**
- Main layout container
- Combines 3D scene, UI overlays, HUD

## Common Patterns & Best Practices

### Physics Interactions

**Click to Mine/Build:**
```typescript
const handleClick = (e: ThreeEvent<MouseEvent>) => {
  e.stopPropagation();
  const [x, y, z] = e.point; // Click position in 3D space
  if (e.altKey) {
    addCube(x, y, z);
  } else {
    removeCube(x, y, z);
  }
};
```

**Raycasting:** R3F handles automatically via `onClick` props on meshes

### Effect Management

**Temporary Effects Pattern:**
```typescript
// Add effect
addEffect(x, y, z, color);

// Auto-remove after animation
setTimeout(() => removeEffect(id), duration);
```

### World Persistence

**Save Pattern:**
```typescript
// Automatic save on cube add/remove
const addCube = (x, y, z) => {
  set((state) => {
    const newCubes = [...state.cubes, newCube];
    setLocalStorage('world', newCubes); // Auto-persist
    return { cubes: newCubes };
  });
};

// Load on initialization
cubes: getLocalStorage('world'),
```

## Performance Considerations

### Optimization Strategies

1. **Mutable Refs for High-Frequency Data:**
   - Player position uses `playerRef` to avoid re-renders
   - Updated via subscription in Player component

2. **Efficient Array Operations:**
   - Use filter with single condition check
   - Spread operator for immutable updates
   - Keys on all mapped components

3. **Physics Optimization:**
   - Use simple collision shapes (spheres, boxes)
   - Avoid complex meshes for physics bodies
   - Set objects to sleep when stationary

4. **Texture Optimization:**
   - Small canvas size (64x64) for quick generation
   - Data URLs cached in module scope
   - Reuse textures across instances

## Debugging Tips

### Common Issues

**Physics Not Working:**
- Ensure component is inside `<Physics>` wrapper
- Check mass > 0 for dynamic bodies
- Verify collision shapes match visual geometry

**Keyboard Not Responding:**
- Check pointer lock is active (click canvas)
- Verify key mappings in `useKeyboard.ts`
- Console log actions state to debug

**AI Chat Failing:**
- Check `GEMINI_API_KEY` in `.env.local`
- Verify API key has proper permissions
- Check network tab for API errors

**Render Performance Issues:**
- Check cube count (visible in HUD)
- Profile with React DevTools
- Consider frustum culling for many cubes

### Development Tools

**Browser DevTools:**
- Use React DevTools for component inspection
- Three.js Inspector: `await import('three/examples/jsm/libs/stats.module.js')`
- Performance tab for frame rate analysis

**Vite HMR:**
- Fast refresh for React components
- Full reload for config changes
- Check terminal for build errors

## Git Workflow

**Branch Naming:**
- Feature branches: `claude/feature-name-sessionId`
- All work on designated branch (never main directly)

**Commit Guidelines:**
- Clear, concise messages
- Focus on "why" over "what"
- One logical change per commit

**Push Protocol:**
- Always: `git push -u origin <branch-name>`
- Branch must start with `claude/` and end with session ID
- Retry with exponential backoff on network failures

## Testing Strategies

### Manual Testing Checklist

- [ ] Player movement (WASD)
- [ ] Jumping and gravity
- [ ] Block placement (Alt+Click)
- [ ] Block mining (Click)
- [ ] Texture selection (1-5 keys)
- [ ] Entity spawning (6-8 keys)
- [ ] AI chat interaction
- [ ] World persistence (refresh page)
- [ ] Performance with many blocks

### Browser Compatibility

**Target:**
- Modern browsers with WebGL 2 support
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

## Future Enhancement Ideas

When extending the codebase, consider:

1. **Inventory System:** Track collected blocks separately
2. **Multiplayer:** WebSocket sync of world state
3. **Procedural Generation:** Terrain generation algorithms
4. **Save Slots:** Multiple world saves
5. **Creative/Survival Modes:** Different gameplay mechanics
6. **Audio:** Spatial audio for immersion
7. **Mobile Support:** Touch controls adaptation
8. **Advanced AI:** Natural language building commands

## Environment Variables

**Required:**
- `GEMINI_API_KEY` - Google Gemini API key for AI chat

**File:** `.env.local` (gitignored)

**Access Pattern:**
```typescript
// In Vite config, define:
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}

// In code:
const apiKey = process.env.API_KEY || '';
```

## Dependencies Rationale

**Why React 19?** Latest concurrent features, improved performance
**Why Vite?** Fast HMR, native ESM, optimized builds
**Why Zustand over Redux?** Simpler API, less boilerplate, better TypeScript support
**Why cannon.js?** Lightweight, good enough physics for voxel game
**Why procedural textures?** No asset loading, customizable, small bundle size

## Code Style Guidelines

### Formatting
- 2-space indentation
- Single quotes for strings (except JSX)
- Semicolons required
- Trailing commas in multiline objects/arrays

### Naming Conventions
- Components: PascalCase
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Types/Interfaces: PascalCase
- Files: Match primary export name

### Comments
- Use JSDoc for public APIs
- Inline comments for complex logic only
- Avoid obvious comments

### Imports
- React first
- Third-party libraries
- Local imports (hooks, components, utils)
- Type imports last (if separated)

## Security Considerations

**API Key Protection:**
- Never commit `.env.local`
- Use environment variable injection
- Client-side key exposure is unavoidable (consider backend proxy for production)

**User Input:**
- Chat input sanitized by Gemini API
- No eval() or dangerouslySetInnerHTML used
- localStorage trusted (same-origin only)

## Accessibility Notes

**Current State:**
- No keyboard navigation for UI (game controls only)
- No screen reader support (3D content)
- Colorblind-friendly textures could be improved

**Improvement Areas:**
- Add ARIA labels to buttons
- Keyboard navigation for chat
- High contrast mode option
- Configurable control schemes

---

## Quick Reference

### Start Development
```bash
npm install
# Create .env.local with GEMINI_API_KEY
npm run dev
```

### Game Controls
- **WASD** - Move
- **Space** - Jump
- **Click** - Mine block
- **Alt+Click** - Place block
- **1-5** - Select block type
- **6-8** - Spawn entities

### Common Commands
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### File Locations
- Types: `types.ts`
- State: `hooks/useStore.ts`
- 3D Scene: `components/GameScene.tsx`
- Player: `components/Player.tsx`
- AI: `services/geminiService.ts`

---

**Last Updated:** 2025-11-23
**Project Version:** 0.0.0
**Maintained for:** AI Assistant Onboarding
