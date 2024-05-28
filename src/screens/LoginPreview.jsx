import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import mainbg from '../assets/images/mainbg.png';

const LoginPreview = ({ navigation }) => {
  return (
    <ImageBackground source={mainbg} style={styles.background}>
      <Image source={require('../assets/SyncUp Logo.png')} style={styles.logo} />
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to SyncUp!</Text>
        <Text style={styles.subtitle}>Revolutionizing productivity management for students.</Text>
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText]}>Log In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => navigation.navigate('Registration')}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText]}>Sign Up</Text>
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
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 150,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    width: 260,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
  },
  loginButton: {
    backgroundColor: '#007bff',
    borderColor: '#fff',
  },
  signupButton: {
    backgroundColor: '#fff',
    borderColor: '#007bff',
  },
  buttonText: {
    fontSize: 18,
    marginLeft: 30,
    marginRight: 30,
  },
});

export default LoginPreview;