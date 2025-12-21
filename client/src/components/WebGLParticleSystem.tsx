import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '../lib/stores/useSceneStore';

interface WebGLParticleProps {
  count?: number;
  color?: string;
  speed?: number;
  size?: number;
}

function Particles({ count = 500, color = '#ffffff', speed = 0.5, size = 2 }: WebGLParticleProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Arrays created ONCE
  const positions = useRef<Float32Array>(new Float32Array(count * 3));
  const velocities = useRef<Float32Array>(new Float32Array(count * 3));
  const lifetimes = useRef<Float32Array>(new Float32Array(count));
  const maxLifetimes = useRef<Float32Array>(new Float32Array(count));
  const colorsArray = useRef<Float32Array>(new Float32Array(count * 3));

  // Initialize once
  useEffect(() => {
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions.current[i3] = (Math.random() - 0.5) * 40;
      positions.current[i3 + 1] = (Math.random() - 0.5) * 30;
      positions.current[i3 + 2] = (Math.random() - 0.5) * 10;

      velocities.current[i3] = (Math.random() - 0.5) * 0.02;
      velocities.current[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities.current[i3 + 2] = (Math.random() - 0.5) * 0.01;

      lifetimes.current[i] = 0;
      maxLifetimes.current[i] = Math.random() * 200 + 100;

      colorsArray.current[i3] = 1;
      colorsArray.current[i3 + 1] = 1;
      colorsArray.current[i3 + 2] = 1;
    }
  }, []);
  // No [count] dependency → arrays never recreated

  useFrame(() => {
    const pts = pointsRef.current;
    if (!pts) return;

    const pos = positions.current;
    const vel = velocities.current;
    const life = lifetimes.current;
    const maxLife = maxLifetimes.current;
    const col = colorsArray.current;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      pos[i3] += vel[i3] * speed;
      pos[i3 + 1] += vel[i3 + 1] * speed;
      pos[i3 + 2] += vel[i3 + 2] * speed;

      life[i]++;

      if (life[i] >= maxLife[i]) {
        pos[i3] = (Math.random() - 0.5) * 40;
        pos[i3 + 1] = (Math.random() - 0.5) * 30;
        pos[i3 + 2] = (Math.random() - 0.5) * 10;

        vel[i3] = (Math.random() - 0.5) * 0.02;
        vel[i3 + 1] = (Math.random() - 0.5) * 0.02;
        vel[i3 + 2] = (Math.random() - 0.5) * 0.01;

        life[i] = 0;
        maxLife[i] = Math.random() * 200 + 100;
      }

      const opacity = 1 - life[i] / maxLife[i];
      col[i3] = opacity;
      col[i3 + 1] = opacity;
      col[i3 + 2] = opacity;
    }

    pts.geometry.attributes.position.needsUpdate = true;
    pts.geometry.attributes.color.needsUpdate = true;
  });

  const particleColor = new THREE.Color(color);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions.current}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colorsArray.current}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        size={size * 0.05}
        color={particleColor}
        transparent
        opacity={0.8}
        sizeAttenuation
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function WebGLParticleSystem({
  count = 500,
  color = '#ffffff',
  speed = 0.5,
  size = 2
}: WebGLParticleProps) {

  const { settings } = useSceneStore();

  if (settings.reducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 75 }}
        gl={{ alpha: true, antialias: false }}
        dpr={[1, 1.5]}
      >
        <Particles count={count} color={color} speed={speed} size={size} />
      </Canvas>
    </div>
  );
}
