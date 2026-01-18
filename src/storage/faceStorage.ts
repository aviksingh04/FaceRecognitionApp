import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'REGISTERED_FACES';

export interface StoredFace {
    name: string;
    faceVector: number[];
}

// Read all registered faces
export const getStoredFaces = async (): Promise<StoredFace[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Failed to read faces', e);
        return [];
    }
};

// Save a new face
// export const saveFace = async (face: StoredFace) => {
//     try {
//         const existing = await getStoredFaces();

//         const updated = [...existing, face];

//         await AsyncStorage.setItem(
//             STORAGE_KEY,
//             JSON.stringify(updated)
//         );
//     } catch (e) {
//         console.error('Failed to save face', e);
//     }
// };
export const saveFace = async (face: StoredFace) => {
  try {
    const existing = await getStoredFaces();

    // ✅ DUPLICATE NAME CHECK (HERE)
    const exists = existing.some(
      f => f.name.toLowerCase() === face.name.toLowerCase()
    );

    if (exists) {
      throw new Error('User already exists');
    }

    const updated = [...existing, face];

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  } catch (e) {
    console.error('Failed to save face', e);
    throw e;
  }
};

// Clear all faces (dev / testing)
export const clearFaces = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
};
