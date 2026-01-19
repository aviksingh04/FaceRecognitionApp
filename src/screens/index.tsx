import React, { useEffect, useRef, useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { detectFaces } from '../ml/faceDetection';
import { normalizeVector } from '../utils/vectorMath';
import { generateFaceVector } from '../utils/faceEmbedding';
import { getStoredFaces, saveFace } from '../storage/faceStorage';
import { matchFace } from '../ml/faceMatcher';
import { styles } from './style';
export default function FaceRecognition() {
    const cameraRef = useRef<Camera>(null);

    const devices = useCameraDevices();
    const device = devices.find(d => d.position === 'front') ?? devices.find(d => d.position === 'back');
    const [permission, setPermission] = useState<'granted' | 'authorized' | 'denied' | 'not-determined'>('not-determined');
    const [cameraReady, setCameraReady] = useState(false);
    const [takePermission, setTakePermission] = useState(false);
    const [userName, setUserName] = useState('');

    const [storedUsers, setStoredUsers] = useState<any[]>([]);
    const [showUserList, setShowUserList] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);



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
        })();
    }, []);

    if (permission !== 'granted') {
        return <Text>Camera permission not granted</Text>;
    }

    if (!device) {
        return <Text>Loading camera device...</Text>;
    }

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

    
    // const verifyFace = async () => {
    //     if (!cameraRef.current || !cameraReady) return;

    //     const photo = await cameraRef.current.takePhoto({ flash: 'off' });
    //     const imageUri = `file://${photo.path}`;

    //     // 1️⃣ detect face
    //     const faces = await detectFaces(imageUri);

    //     if (faces.length !== 1) {
    //         Alert.alert(
    //             'Face Error',
    //             faces.length === 0
    //                 ? 'No face detected'
    //                 : 'Multiple faces detected'
    //         );
    //         return;
    //     }

    //     // 2️⃣ generate vector
    //     const rawVector = generateFaceVector(faces[0]);
    //     const inputVector = normalizeVector(rawVector);

    //     // 3️⃣ load AsyncStorage data
    //     const storedFaces = await getStoredFaces();

    //     if (storedFaces.length === 0) {
    //         Alert.alert('No users registered');
    //         return;
    //     }

    //     // 4️⃣ compare
    //     const match = matchFace(inputVector, storedFaces);

    //     // 5️⃣ result
    //     if (match) {
    //         Alert.alert(
    //             'User Verified ✅',
    //             `${match.name}\nSimilarity Score: ${match.score.toFixed(3)}`
    //         );
    //     } else {
    //         Alert.alert('Unknown User ❌');
    //     }
    // };
    const loadStoredUsers = async () => {
        const users = await getStoredFaces();
        setStoredUsers(users);
    };
const verifySelectedUser = async (user: any) => {
  if (!cameraRef.current || !cameraReady || !user) return;

  const photo = await cameraRef.current.takePhoto({ flash: 'off' });
  const imageUri = `file://${photo.path}`;

  const faces = await detectFaces(imageUri);

  if (faces.length !== 1) {
    Alert.alert(
      'Face Error',
      faces.length === 0 ? 'No face detected' : 'Multiple faces detected'
    );
    return;
  }

  const rawVector = generateFaceVector(faces[0]);
  const inputVector = normalizeVector(rawVector);

  const match = matchFace(inputVector, [user]);

  if (match) {
    Alert.alert('Verified ✅', user.name);
  } else {
    Alert.alert('Verification Failed ❌');
  }
};


    return (
        console.log("storedUsers===>", storedUsers),

        <SafeAreaView style={styles.container}>
            {!takePermission ? (
                <TouchableOpacity
                    onPress={() => setTakePermission(true)}
                    style={styles.registerButton}
                >
                    <Text style={styles.registerButtonText}>Register User</Text>
                </TouchableOpacity>
            ) : (
                <>
                    <Camera
                        ref={cameraRef}
                        style={styles.camera}
                        device={device}
                        isActive
                        photo
                        onInitialized={() => setCameraReady(true)}
                    />

                    <View style={styles.captureButtonContainer}>
                        <TouchableOpacity
                            disabled={!cameraReady}
                            onPress={capturePhoto}
                            style={[
                                styles.captureButton,
                                !cameraReady && styles.captureButtonDisabled,
                            ]}
                        />
                    </View>
                    {
                        !showUserList &&
                    
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        // marginBottom: 20,   
                    }}>
                        <TouchableOpacity
                            disabled={!cameraReady}
                            onPress={verifyFace}
                            style={styles.verifyButton}
                        >
                            <Text style={styles.verifyButtonText}>Verify Face</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={async () => {
                                await loadStoredUsers();
                                setShowUserList(true);
                            }}
                            style={[styles.registerButton, { backgroundColor: '#9C27B0' }]}
                        >
                            <Text style={styles.registerButtonText}>Show Registered Users</Text>
                        </TouchableOpacity>
                    </View>
}
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="Enter user name"
                            placeholderTextColor="red"
                            value={userName}
                            onChangeText={setUserName}
                            style={styles.textInput}
                        />
                    </View>


                    {showUserList && (
                        <View style={{ padding: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                                Registered Users
                            </Text>

                            {storedUsers.map((user, index) => (
                                <View
                                    key={index}
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        paddingVertical: 10,
                                        borderBottomWidth: 1,
                                    }}
                                >
                                    <Text>{user.name}</Text>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedUser(user);
                                            setTakePermission(true);
                                            setShowUserList(false);
                                            verifySelectedUser(user)
                                        }}
                                        style={{
                                            backgroundColor: '#4CAF50',
                                            paddingHorizontal: 12,
                                            paddingVertical: 6,
                                            borderRadius: 6,
                                        }}
                                    >
                                        <Text style={{ color: '#fff' }}>Verify</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <TouchableOpacity
                                onPress={() => setShowUserList(false)}
                                style={{ marginTop: 20 }}
                            >
                                <Text style={{ color: 'red', textAlign: 'center' }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    )}


                </>
            )}
        </SafeAreaView>

    );
}
