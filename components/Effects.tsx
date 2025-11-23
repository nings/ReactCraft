import React from 'react';
import { useStore } from '../hooks/useStore';
import { Explosion } from './Explosion';

export const Effects: React.FC = () => {
    const particles = useStore(state => state.particles);
    return (
        <>
            {particles.map(particle => (
                <Explosion 
                    key={particle.id} 
                    id={particle.id}
                    position={particle.pos} 
                    color={particle.color} 
                />
            ))}
        </>
    );
};