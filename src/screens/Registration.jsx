import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Image,
    ScrollView,
    Alert,
    ImageBackground
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../../firebase-config';
import loginbg from '../assets/images/loginbg.png';

const Registration = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const imageUrl = "https://firebasestorage.googleapis.com/v0/b/syncup-4b36a.appspot.com/o/profilepic.png?alt=media&token=4f9acff6-166b-4e21-9ac8-42bc5f441e63";
    const [bio] = useState('');
    const [birthDate] = useState('');
    const [country] = useState('');
    const [occupation] = useState('');

    const registerUser = async (email, password, firstName, lastName) => {
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
                    bio,
                    birthDate,
                    imageUrl,
                    country,
                    occupation,
                    password,
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
        <ScrollView contentContainerStyle={styles.container} style={styles.scrollView}>
            <ImageBackground
                source={loginbg}
                style={styles.imageBackground}
                resizeMode="contain"
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Image
                    source={require('../assets/SyncUp Logo.png')}
                    style={styles.logo}
                />
                <View style={{ marginTop: 20 }}>
                    <Text style={styles.subtitle}>Register</Text>
                    <Text style={styles.subtitle1}>Create an account.</Text>
                    <Text style={styles.label}>First Name</Text>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your first name"
                            value={firstName}
                            onChangeText={(text) => setFirstName(text)}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <Text style={styles.label}>Last Name</Text>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your last name"
                            value={lastName}
                            onChangeText={(text) => setLastName(text)}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <Text style={styles.label}>Email</Text>
                    <View style={styles.textInputContainer}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <Text style={styles.label}>Password</Text>
                    <View style={[styles.textInputContainer, styles.passwordContainer]}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={(text) => setPassword(text)}
                            autoCapitalize="none"
                            autoCorrect={false}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}
                            style={{ marginRight: 10 }}
                        >
                            <Icon
                                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                size={24}
                                color="#000000"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => registerUser(email, password, firstName, lastName)}
                    style={styles.button}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'white' }}>Register</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={{ marginTop: 20 }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#505050' }}>
                        Already have an account?{' '}
                        <Text style={{ textDecorationLine: 'underline', color: 'black' }}>Login</Text>
                    </Text>
                </TouchableOpacity>
            </ImageBackground>
            <View style={styles.whiteSpace}></View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#FFFFFF',
    },
    container: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#FFFFFF',
        top: -260
    },
    imageBackground: {
        width: '100%',
        alignItems: 'center',
    },
    backButton: {
        top: 560,
        position: 'absolute',
        left: 2,
        margin: 20,
        padding: 5,
        borderWidth: 1,
        borderRadius: 50,
    },
    logo: {
        width: 150,
        height: 150,
        marginLeft: 180,
        marginTop: 520,
    },
    subtitle: {
        fontSize: 35,
        textAlign: 'left',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    subtitle1: {
        fontSize: 30,
        textAlign: 'left',
        marginBottom: 30,
        fontWeight: 'normal',
        color: 'gray',
        opacity: 0.7,
        marginBottom: 40,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'left',
        marginBottom: 10,
    },
    textInput: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        flex: 1,
        fontSize: 15,
    },
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 15,
        marginBottom: 10,
        width: 300,
        borderColor: 'gray',
    },
    passwordContainer: {
        paddingRight: 0,
        marginBottom: 30,
    },
    button: {
        height: 70,
        width: 250,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },
    whiteSpace: {
        backgroundColor: '#FFFFFF',
    },
});

export default Registration;
