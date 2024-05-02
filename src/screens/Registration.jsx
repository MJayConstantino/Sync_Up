import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import { firebase } from '../../firebase-config';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';

const Registration = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to control password visibility

    const registerUser = async (email, password, firstName, lastName) => {
      // Basic validation to ensure all fields are filled
      if (!firstName || !lastName || !email || !password) {
          Alert.alert(
              "Incomplete Information",
              "Please ensure you have entered your first name, last name, email, and password."
          );
          return;
      }
  
      try {
          await firebase.auth().createUserWithEmailAndPassword(email, password);
  
          await firebase.auth().currentUser.sendEmailVerification({
              handleCodeInApp: true,
              url: 'https://syncup-4b36a.firebaseapp.com',
          });
  
          Alert.alert("Verification Email", "A verification email has been sent. Please check your inbox.");
  
          await firebase.firestore().collection('users')
              .doc(firebase.auth().currentUser.uid)
              .set({
                  firstName,
                  lastName,
                  email,
              });
  
      } catch (error) {
          let errorMessage = "An error occurred during registration.";
  
          switch (error.code) {
              case 'auth/email-already-in-use':
                  errorMessage = "This email is already in use. Please use a different email or reset your password.";
                  break;
              case 'auth/weak-password':
                  errorMessage = "The password is too weak. Please choose a stronger password.";
                  break;
              case 'auth/invalid-email':
                  errorMessage = "Invalid email. Please enter a valid email address.";
                  break;
              default:
                  errorMessage = `Registration error: ${error.message}`;
                  break;
          }
  
          Alert.alert("Registration Error", errorMessage);
      }
  };
  

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={require('../assets/SyncUp Logo.png')} // Same image as in Login
                style={{ width: 200, height: 200, marginBottom: 20 }}
            />
            <Text style={styles.subtitle}>Register Here!</Text>

            <View style={{ marginTop: 40 }}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Enter your first name"
                    value={firstName}
                    onChangeText={(text) => setFirstName(text)}
                    autoCorrect={false}
                />

                <Text style={styles.label}>Last Name</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Enter your last name"
                    value={lastName}
                    onChangeText={(text) => setLastName(text)}
                    autoCorrect={false}
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Icon
                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                            size={24}
                            color="#4B98FF"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => registerUser(email, password, firstName, lastName)}
                style={styles.button}
            >
                <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#FFFFFF' }}>Register</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default Registration;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        paddingTop: 100,
        paddingBottom: 50,
    },
    subtitle: {
        fontSize: 35,
        textAlign: 'left', // Same alignment as Login
        fontWeight: 'bold',
    },
    label: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'left', // Same alignment as Login
    },
    textInput: {
        paddingTop: 20,
        paddingBottom: 10,
        width: 300,
        fontSize: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginBottom: 30,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        marginTop: 50,
        height: 70,
        width: 250,
        backgroundColor: '#4B98FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },
});
