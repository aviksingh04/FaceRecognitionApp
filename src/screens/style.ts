import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop:50
    },

    registerButton: {
        // marginTop: 50,
        padding: 12,
        backgroundColor: '#2196F3',
        borderRadius: 8,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },

    registerButtonText: {
        color: '#fff',
        fontWeight: '600',
    },

    camera: {
        flex: 1,
    },

    captureButtonContainer: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
    },

    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
    },

    captureButtonDisabled: {
        backgroundColor: 'gray',
    },

    verifyButton: {
        padding: 12,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        alignSelf: 'center',
        // marginBottom: 20,
    },

    verifyButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },

    inputContainer: {
        position: 'absolute',
        top: 40,
        alignSelf: 'center',
        width: '80%',
    },

    textInput: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        textAlign: 'center',
    },
});
