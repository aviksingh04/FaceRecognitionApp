import React, { useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { detectFaces } from './src/ml/faceDetection';
import { normalizeVector } from './src/utils/vectorMath';
import { generateFaceVector } from './src/utils/faceEmbedding';
import { getStoredFaces, saveFace } from './src/storage/faceStorage';
import { matchFace } from './src/ml/faceMatcher';

export default function App() {
    const cameraRef = useRef<Camera>(null);

    const devices = useCameraDevices();
    const device = devices.find(d => d.position === 'front') ?? devices.find(d => d.position === 'back');
    const [permission, setPermission] = useState<'granted' | 'authorized' | 'denied' | 'not-determined'>('not-determined');
    const [cameraReady, setCameraReady] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        (async () => {
            const status = await Camera.getCameraPermissionStatus();
            if (status !== 'granted') {
                const newStatus = await Camera.requestCameraPermission();
                setPermission(newStatus);
            } else {
                setPermission(status);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const stored = await getStoredFaces();
            console.log('Registered users =>useEffect=>', stored);
        })();
    }, []);

    // useEffect(() => {
    //   (async () => {
    //     const status = await Camera.requestCameraPermission();
    //     setPermission(status);
    //   })();
    // }, []);

    if (permission !== 'granted') {
        return <Text>Camera permission not granted</Text>;
    }

    if (!device) {
        return <Text>Loading camera device...</Text>;
    }

    //  const capturePhoto = async () => {
    //   if (!cameraRef.current || !cameraReady) {
    //     console.log('Camera not ready yet');
    //     return;
    //   }

    //   const photo = await cameraRef.current.takePhoto({
    //     flash: 'off',
    //   });

    //   console.log('PHOTO PATH =>', photo.path);
    // };
    const capturePhoto = async () => {
        if (!cameraRef.current || !cameraReady) return;

        if (!userName.trim()) {
            Alert.alert('Validation', 'Please enter user name');
            return;
        }

        const photo = await cameraRef.current.takePhoto({ flash: 'off' });
        const imageUri = `file://${photo.path}`;

        console.log('IMAGE URI =>', imageUri);

        const faces = await detectFaces(imageUri);
        console.log('Faces detected =>', faces.length);

        if (faces.length !== 1) {
            Alert.alert(
                'Face Error',
                faces.length === 0
                    ? 'No face detected'
                    : 'Multiple faces detected'
            );
            return;
        }

        const faceVectorRaw = generateFaceVector(faces[0]);
        const faceVector = normalizeVector(faceVectorRaw);

        console.log('Face vector length =>', faceVector.length);

        // 🔥 STEP 3: SAVE FACE
        // await saveFace({
        //   name: userName.trim(),
        //   faceVector,
        // });
        try {
            await saveFace({
                name: userName.trim(),
                faceVector,
            });


            Alert.alert('Success', 'Face registered successfully');
            const stored = await getStoredFaces();
            console.log('Registered users =>', stored.length);
            setUserName('');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'User already exists');
        }


        setUserName('');
    };

    // const capturePhoto = async () => {
    //   if (!cameraRef.current || !cameraReady) return;

    //   const photo = await cameraRef.current.takePhoto({ flash: 'off' });

    //   const imageUri = `file://${photo.path}`;
    //   console.log('IMAGE URI =>', imageUri);

    //   const faces = await detectFaces(imageUri);

    //   console.log('Faces detected =>', faces.length);

    //   console.log('Faces detected =>', faces.length);

    //   if (faces.length !== 1) {
    //     Alert.alert(
    //       'Face Error',
    //       faces.length === 0
    //         ? 'No face detected'
    //         : 'Multiple faces detected'
    //     );
    //     return;
    //   }
    //   console.log('FACE OBJECT =>', JSON.stringify(faces[0], null, 2));

    //   const faceVectorRaw = generateFaceVector(faces[0]);
    //   const faceVector = normalizeVector(faceVectorRaw);

    //   console.log('Face vector length =>', faceVector.length);
    //   console.log('Face vector sample =>', faceVector.slice(0, 5));


    //   if (faces.length === 0) {
    //     Alert.alert('No face detected. Try again.');
    //     return;
    //   }

    //   if (faces.length > 1) {
    //     Alert.alert('Multiple faces detected. Only one person allowed.');
    //     return;
    //   }

    //   console.log('Face bounds =>', faces[0].boundingBox);
    // };

    const verifyFace = async () => {
        if (!cameraRef.current || !cameraReady) return;

        const photo = await cameraRef.current.takePhoto({ flash: 'off' });
        const imageUri = `file://${photo.path}`;

        const faces = await detectFaces(imageUri);

        if (faces.length !== 1) {
            Alert.alert(
                'Face Error',
                faces.length === 0
                    ? 'No face detected'
                    : 'Multiple faces detected'
            );
            return;
        }

        const rawVector = generateFaceVector(faces[0]);
        const inputVector = normalizeVector(rawVector);

        const storedFaces = await getStoredFaces();

        if (storedFaces.length === 0) {
            Alert.alert('No users registered');
            return;
        }

        const match = matchFace(inputVector, storedFaces);

        if (match) {
            Alert.alert(
                'User Verified',
                `${match.name} (score: ${match.score.toFixed(2)})`
            );
        } else {
            Alert.alert('Unknown User');
        }
    };

    return (
        console.log("permission=========>permission,", device),

        <SafeAreaView style={{ flex: 1 }}>
            <Camera
                ref={cameraRef}
                style={{ flex: 1 }}
                device={device}
                isActive={false}
                photo={true}
                onInitialized={() => setCameraReady(true)}
            />

            <TouchableOpacity
                onPress={verifyFace}
                style={{
                    marginTop: 20,
                    padding: 12,
                    backgroundColor: '#4CAF50',
                    borderRadius: 8,
                }}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    Verify Face
                </Text>
            </TouchableOpacity>
            <View style={{ position: 'absolute', bottom: 40, alignSelf: 'center' }}>
                <TouchableOpacity
                    disabled={!cameraReady}
                    onPress={capturePhoto}
                    style={{
                        width: 70,
                        height: 70,
                        borderRadius: 35,
                        backgroundColor: cameraReady ? 'white' : 'gray',
                    }}
                />
            </View>
            <View style={{ position: 'absolute', top: 40, alignSelf: 'center', width: '80%' }}>
                <TextInput
                    placeholder="Enter user name"
                    value={userName}
                    onChangeText={(val: any) => setUserName(val)}
                    style={{
                        backgroundColor: 'white',
                        padding: 10,
                        borderRadius: 8,
                        textAlign: 'center',
                    }}
                />
                <TouchableOpacity>
                    <Text>

                    </Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}
