export const generateFaceVector = (face: any): number[] => {
  const vector: number[] = [];

  // ✅ Use frame safely
  const frame = face.frame || face.bounds;

  vector.push(
    frame?.width ?? 0,
    frame?.height ?? 0
  );

  // Head rotation
  vector.push(
    face.headEulerAngleX ?? 0,
    face.headEulerAngleY ?? 0,
    face.headEulerAngleZ ?? 0
  );

  // Eye + smile probabilities
  vector.push(
    face.leftEyeOpenProbability ?? 0,
    face.rightEyeOpenProbability ?? 0,
    face.smilingProbability ?? 0
  );

  // Landmarks
  if (face.landmarks) {
    Object.values(face.landmarks).forEach((lm: any) => {
      if (lm?.position) {
        vector.push(lm.position.x, lm.position.y);
      }
    });
  }

  return vector;
};
