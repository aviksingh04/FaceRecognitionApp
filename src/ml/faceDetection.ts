import FaceDetection from '@react-native-ml-kit/face-detection';

export async function detectFaces(imagePath: string) {
    const faces = await FaceDetection.detect(imagePath, {
        performanceMode: 'accurate',
        landmarkMode: 'all',
        classificationMode: 'none',
    });

    return faces;
}
