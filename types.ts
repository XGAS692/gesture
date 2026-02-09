
export enum GestureType {
  IDLE = 'IDLE',
  ILOVEYOU = 'ILOVEYOU',
  VICTORY = 'VICTORY',
  THUMBSUP = 'THUMBSUP',
  FIST = 'FIST'
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  landmarks: Landmark[];
  gesture: GestureType;
}

export interface ParticleState {
  gesture: GestureType;
  handPos: { x: number; y: number; z: number };
}
