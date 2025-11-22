import { useState, useEffect } from 'react';
import { ParticleSystem } from './ParticleSystem';
import { WebGLParticleSystem } from './WebGLParticleSystem';

interface AdaptiveParticleSystemProps {
  count?: number;
  color?: string;
  speed?: number;
  size?: number;
  className?: string;
}

export function AdaptiveParticleSystem(props: AdaptiveParticleSystemProps) {
  const [useWebGL, setUseWebGL] = useState(false);

  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const supportsWebGL = !!gl;
        
        const particleCount = props.count || 100;
        const shouldUseWebGL = supportsWebGL && particleCount > 250;
        
        setUseWebGL(shouldUseWebGL);
      } catch (e) {
        setUseWebGL(false);
      }
    };

    checkWebGLSupport();
  }, [props.count]);

  if (useWebGL) {
    return <WebGLParticleSystem {...props} />;
  }

  return <ParticleSystem {...props} />;
}
