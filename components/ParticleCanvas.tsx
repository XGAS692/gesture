
import React, { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import gsap from 'gsap';
import { GestureType, ParticleState } from '../types';
import { 
  PARTICLE_COUNT, 
  generateNoisePoints, 
  generateSpherePoints, 
  generateHeartPoints, 
  generateFistPoints, 
  generateTextPoints 
} from '../utils/shapes';

interface ParticleCanvasProps {
  handState: ParticleState;
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ handState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    composer: EffectComposer;
    particles: THREE.Points;
    geometry: THREE.BufferGeometry;
    material: THREE.ShaderMaterial;
    prevGesture: GestureType;
  } | null>(null);

  // Pre-calculate shape buffers
  const shapes = useMemo(() => ({
    [GestureType.IDLE]: generateNoisePoints(PARTICLE_COUNT),
    [GestureType.THUMBSUP]: generateSpherePoints(PARTICLE_COUNT, 4),
    [GestureType.VICTORY]: generateHeartPoints(PARTICLE_COUNT),
    [GestureType.ILOVEYOU]: generateTextPoints(PARTICLE_COUNT, "I LOVE YOU"),
    [GestureType.FIST]: generateFistPoints(PARTICLE_COUNT, { x: 0, y: 0, z: 0 }),
  }), []);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- SETUP ---
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- BLOOM ---
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.5;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // --- GEOMETRY ---
    const geometry = new THREE.BufferGeometry();
    const initialPositions = shapes[GestureType.IDLE];
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    targetPositions.set(initialPositions);

    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    const palette = [
      new THREE.Color(0x8a2be2), // Purple
      new THREE.Color(0x00ff7f), // Spring Green
      new THREE.Color(0x00ced1), // Dark Turquoise (Blueish)
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      sizes[i] = Math.random() * 2.0 + 1.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(initialPositions.slice(), 3));
    geometry.setAttribute('targetPosition', new THREE.BufferAttribute(targetPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('lerpFactor', new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT).fill(0), 1));

    // --- SHADER ---
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorphProgress: { value: 0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uMorphProgress;
        attribute vec3 targetPosition;
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        
        void main() {
          vColor = color;
          
          // Smooth transition between current position and target position
          vec3 morphed = mix(position, targetPosition, uMorphProgress);
          
          // Subtle floating animation
          morphed.x += sin(uTime * 0.5 + morphed.y) * 0.05;
          morphed.y += cos(uTime * 0.5 + morphed.x) * 0.05;
          
          vec4 mvPosition = modelViewMatrix * vec4(morphed, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          // Circular particle shape
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.2, dist);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    sceneRef.current = { 
      scene, camera, renderer, composer, particles, geometry, material, 
      prevGesture: GestureType.IDLE 
    };

    // --- LOOP ---
    let frameId: number;
    const animate = (time: number) => {
      if (!sceneRef.current) return;
      const { composer, material } = sceneRef.current;
      material.uniforms.uTime.value = time * 0.001;
      
      particles.rotation.y += 0.002;
      
      composer.render();
      frameId = requestAnimationFrame(animate);
    };
    animate(0);

    // --- RESIZE ---
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Morph particles when gesture or hand position changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const { geometry, material, prevGesture, particles } = sceneRef.current;

    // Determine target positions
    let targetData: Float32Array;
    if (handState.gesture === GestureType.FIST) {
      // Map hand position to scene coordinates
      // MediaPipe coordinates are 0-1 (top-left)
      const mappedX = (handState.handPos.x - 0.5) * -30; // Inverse X for mirroring
      const mappedY = (0.5 - handState.handPos.y) * 20;
      targetData = generateFistPoints(PARTICLE_COUNT, { x: mappedX, y: mappedY, z: 0 });
    } else {
      targetData = shapes[handState.gesture];
    }

    // Trigger GSAP transition if gesture changed
    if (prevGesture !== handState.gesture || handState.gesture === GestureType.FIST) {
      const targetAttr = geometry.getAttribute('targetPosition') as THREE.BufferAttribute;
      const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;

      // Copy current animated position to the base 'position' attribute before starting new transition
      // To prevent jumping if gesture changes mid-morph
      const currentProgress = material.uniforms.uMorphProgress.value;
      const pos = posAttr.array as Float32Array;
      const targets = targetAttr.array as Float32Array;
      
      for(let i = 0; i < pos.length; i++) {
        pos[i] = THREE.MathUtils.lerp(pos[i], targets[i], currentProgress);
      }
      posAttr.needsUpdate = true;
      
      // Update target attribute to the new shape
      targetAttr.array.set(targetData);
      targetAttr.needsUpdate = true;

      // Reset progress and animate to 1
      material.uniforms.uMorphProgress.value = 0;
      gsap.to(material.uniforms.uMorphProgress, {
        value: 1,
        duration: 1.2,
        ease: "expo.out",
        overwrite: true
      });

      sceneRef.current.prevGesture = handState.gesture;
    }
  }, [handState, shapes]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
};

export default ParticleCanvas;
