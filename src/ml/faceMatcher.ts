import { StoredFace } from '../storage/faceStorage';
import { cosineSimilarity } from '../utils/vectorMath';

const MATCH_THRESHOLD = 0.85; // 👈 important

export const matchFace = (
    inputVector: number[],
    storedFaces: StoredFace[]
) => {
    let bestMatch = null;
    let highestScore = 0;

    for (const face of storedFaces) {
        const score = cosineSimilarity(inputVector, face.faceVector);

        if (score > highestScore) {
            highestScore = score;
            bestMatch = face;
        }
    }

    if (bestMatch && highestScore >= MATCH_THRESHOLD) {
        return {
            name: bestMatch.name,
            score: highestScore,
        };
    }

    return null;
};
