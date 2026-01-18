export const normalizeVector = (vector: number[]): number[] => {
  const magnitude = Math.sqrt(
    vector.reduce((sum, v) => sum + v * v, 0)
  );

  if (magnitude === 0) return vector;

  return vector.map(v => v / magnitude);
};

export const cosineSimilarity = (v1: number[], v2: number[]): number => {
  if (v1.length !== v2.length) return 0;

  let dot = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (let i = 0; i < v1.length; i++) {
    dot += v1[i] * v2[i];
    mag1 += v1[i] * v1[i];
    mag2 += v2[i] * v2[i];
  }

  return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
};

