import { useCallback, useEffect, useState } from 'react';

declare var document: any;
declare var KeyboardEvent: any;

function actionByKey(key: string) {
  const keyActionMap: Record<string, string> = {
    KeyW: 'moveForward',
    KeyS: 'moveBackward',
    KeyA: 'moveLeft',
    KeyD: 'moveRight',
    Space: 'jump',
    Digit1: 'dirt',
    Digit2: 'grass',
    Digit3: 'glass',
    Digit4: 'wood',
    Digit5: 'log',
    Digit6: 'spawnDog',
    Digit7: 'spawnWolf',
    Digit8: 'spawnZombie',
  };
  return keyActionMap[key];
}

export const useKeyboard = () => {
  const [actions, setActions] = useState({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
    dirt: false,
    grass: false,
    glass: false,
    wood: false,
    log: false,
    spawnDog: false,
    spawnWolf: false,
    spawnZombie: false,
  });

  const handleKeyDown = useCallback((e: any) => {
    const action = actionByKey(e.code);
    if (action) {
      setActions((prev) => {
        // @ts-ignore
        if (prev[action]) return prev;
        return { ...prev, [action]: true };
      });
    }
  }, []);

  const handleKeyUp = useCallback((e: any) => {
    const action = actionByKey(e.code);
    if (action) {
      setActions((prev) => {
        // @ts-ignore
        if (!prev[action]) return prev;
        return { ...prev, [action]: false };
      });
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return actions;
};