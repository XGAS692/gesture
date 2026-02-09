
import { GestureType, Landmark } from '../types';

export function recognizeGesture(landmarks: Landmark[]): GestureType {
  if (!landmarks || landmarks.length < 21) return GestureType.IDLE;

  // Helper to check if finger is raised
  const isRaised = (tipIdx: number, baseIdx: number) => landmarks[tipIdx].y < landmarks[baseIdx].y;
  
  const indexUp = isRaised(8, 6);
  const middleUp = isRaised(12, 10);
  const ringUp = isRaised(16, 14);
  const pinkyUp = isRaised(20, 18);
  
  // Thumb logic: distance between tip (4) and base of index (5)
  const thumbTip = landmarks[4];
  const indexBase = landmarks[5];
  const thumbExtended = Math.abs(thumbTip.x - indexBase.x) > 0.12;

  // 1. Fist: All fingers down
  if (!indexUp && !middleUp && !ringUp && !pinkyUp && !thumbExtended) {
    return GestureType.FIST;
  }

  // 2. Thumbs Up: Only thumb extended
  if (thumbExtended && !indexUp && !middleUp && !ringUp && !pinkyUp) {
    // Also check Y for thumbs up
    if (landmarks[4].y < landmarks[3].y) return GestureType.THUMBSUP;
  }

  // 3. Victory: Index and Middle up
  if (indexUp && middleUp && !ringUp && !pinkyUp) {
    return GestureType.VICTORY;
  }

  // 4. Rock On / I Love You: Thumb, Index, Pinky up
  if (indexUp && pinkyUp && thumbExtended && !middleUp && !ringUp) {
    return GestureType.ILOVEYOU;
  }

  return GestureType.IDLE;
}
