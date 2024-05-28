import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import mainbg from '../assets/images/mainbg.png';

const LoginPreview = ({ navigation }) => {
    return (
        <ImageBackground source={mainbg} style={styles.background}>
        <Image
                    source={require('../assets/SyncUp Logo.png')}
                    style={styles.logo}
                />
            <View style={styles.container}>
                <Text style={styles.title}>Welcome to SyncUp!</Text>
                <Text style={styles.subtitle}>Revolutionizing productvity management for students.</Text>
                <TouchableOpacity
                    style={[styles.button, styles.loginButton]}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.buttonText}>Log In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.signupButton]}
                    onPress={() => navigation.navigate('Registration')}
                >
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#fff',
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 30,
        color: '#fff',
        textAlign: 'center',
    },
    button: {
        width: '70%',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#007bff', //007bff
        borderWidth: 2,
        borderColor: '#FFF',
    },
    signupButton: {
        backgroundColor: '#28a745', //28a745
        borderWidth: 2,
        borderColor: '#FFF',
    },
    buttonText: {
        fontSize: 18,
        color: '#fff',
        marginLeft: 30,
        marginRight: 30,
    },
});

export default LoginPreview;
