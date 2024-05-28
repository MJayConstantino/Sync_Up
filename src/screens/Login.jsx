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
    BackHandler,
    ImageBackground
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { firebase } from '../../firebase-config';
import google from '../assets/images/google.png';
import loginbg from '../assets/images/loginbg.png';

const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const loginUser = async (email, password) => {
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
        } catch (error) {
            let errorMessage = "An error occurred during login.";

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = "Invalid email address. Please enter a valid email.";
                    break;
                case 'auth/user-not-found':
                    errorMessage = "User not found. Please check your email or register.";
                    break;
                case 'auth/wrong-password':
                    errorMessage = "Incorrect password. Please try again.";
                    break;
                case 'auth/invalid-credential':
                    errorMessage = "Email or password input is incorrect. Please check again.";
                    break;
                default:
                    errorMessage = `Authentication error: ${error.message}`;
                    break;
            }

            Alert.alert("Login Error", errorMessage);
        }
    };

    const forgetPassword = async (email) => {
        try {
            await firebase.auth().sendPasswordResetEmail(email);
            Alert.alert("Password Reset", "Password reset email sent.");
        } catch (error) {
            let errorMessage = "An error occurred while sending the reset email.";

            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = "Invalid email address. Please enter a valid email.";
                    break;
                case 'auth/user-not-found':
                    errorMessage = "User not found. Ensure you entered the correct email.";
                    break;
                default:
                    errorMessage = `Error: ${error.message}`;
                    break;
            }

            Alert.alert("Reset Error", errorMessage);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                return true;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [])
    );

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
                    <Text style={styles.subtitle}>Login</Text>
                    <Text style={styles.subtitle1}>Welcome back.</Text>
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
                    <Text style={styles.orline}>—————————————   or   —————————————</Text>
                </View>
                
                <View style={styles.socialLoginContainer}>
                    <TouchableOpacity
                        onPress={() => {/* handle Google login */}}
                        style={[styles.socialButton, { backgroundColor: '#FFFFFF' }]}
                    >
                        <Image source={google} style={{ width: 32, height: 32 }} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {/* handle Facebook login */}}
                        style={[styles.socialButton, { backgroundColor: '#4267B2' }]}
                    >
                        <Icon name="logo-facebook" size={32} color="white" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => loginUser(email, password)}
                    style={styles.button}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'white' }}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => forgetPassword(email)}
                    style={{ marginTop: 20 }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#000' }}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Registration')}
                    style={{ marginTop: 20 }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#505050' }}>
                        Don't have an account?{' '}
                        <Text style={{ textDecorationLine: 'underline', color: 'black' }}>Register Now!</Text>
                    </Text>
                </TouchableOpacity>
            </ImageBackground>
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
    orline: {
        alignItems: 'center',
        margin: 10,
        marginTop: -5,
        color: 'gray',
        marginBottom: 20,
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
        width: 330,
        borderColor: 'gray',
    },
    passwordContainer: {
        paddingRight: 0,
        marginBottom: 30,
    },
    socialLoginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 20,
    },
    socialButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 50,
        borderRadius: 25,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
    },
    button: {
        height: 70,
        width: 250,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
    },

});

export default Login;
