
import * as THREE from 'three';

export const PARTICLE_COUNT = 30000;

export function generateNoisePoints(count: number): Float32Array {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    points[i * 3] = (Math.random() - 0.5) * 15;
    points[i * 3 + 1] = (Math.random() - 0.5) * 15;
    points[i * 3 + 2] = (Math.random() - 0.5) * 15;
  }
  return points;
}

export function generateSpherePoints(count: number, radius: number = 4): Float32Array {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    
    points[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
    points[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
    points[i * 3 + 2] = radius * Math.cos(phi);
  }
  return points;
}

export function generateHeartPoints(count: number): Float32Array {
  const points = new Float32Array(count * 3);
  const scale = 0.25;
  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    // Classic heart parametric equations
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    
    // Add some volume
    const depth = (Math.random() - 0.5) * 4;
    
    points[i * 3] = x * scale;
    points[i * 3 + 1] = y * scale;
    points[i * 3 + 2] = depth * scale;
  }
  return points;
}

export function generateFistPoints(count: number, center: { x: number, y: number, z: number }): Float32Array {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Clustered around center with very small jitter
    points[i * 3] = center.x + (Math.random() - 0.5) * 0.5;
    points[i * 3 + 1] = center.y + (Math.random() - 0.5) * 0.5;
    points[i * 3 + 2] = center.z + (Math.random() - 0.5) * 0.5;
  }
  return points;
}

export function generateTextPoints(count: number, text: string): Float32Array {
  const points = new Float32Array(count * 3);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return points;

  canvas.width = 512;
  canvas.height = 256;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const validPixels: { x: number, y: number }[] = [];

  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      if (imgData.data[(y * canvas.width + x) * 4] > 128) {
        validPixels.push({ x: (x - canvas.width / 2) / 40, y: (canvas.height / 2 - y) / 40 });
      }
    }
  }

  for (let i = 0; i < count; i++) {
    const pixel = validPixels[i % validPixels.length];
    points[i * 3] = pixel.x + (Math.random() - 0.5) * 0.1;
    points[i * 3 + 1] = pixel.y + (Math.random() - 0.5) * 0.1;
    points[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }

  return points;
}
