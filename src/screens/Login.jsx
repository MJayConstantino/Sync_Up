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
    BackHandler
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { firebase } from '../../firebase-config';

const Login = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to control password visibility

    const loginUser = async (email, password) => {
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            // if (navigation) {
            //     navigation.navigate('Dashboards'); // Fix the destination to a valid screen
            // }
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
                return true; // Returning true stops the back button
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [])
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={require('../assets/SyncUp Logo.png')} // Correct the image source name if required
                style={{ width: 200, height: 200, marginBottom: 20 }}
            />
            {/* <View style={styles.titleContainer}>
                <Text style={styles.title}>pls like hepta uwu</Text>
            </View> */}
            <View style={{ marginTop: 40 }}>
                <Text style={styles.subtitle}>Login</Text>
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
                        secureTextEntry={!showPassword} // Toggle based on showPassword state
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
                onPress={() => loginUser(email, password)}
                style={styles.button}
            >
                <Text style={{ fontWeight: 'bold', fontSize: 22, color: 'white' }}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => forgetPassword(email)}
                style={{ marginTop: 20 }}
            >
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#4B98FF' }}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => navigation.navigate('Registration')}
                style={{ marginTop: 20 }}
            >
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                    Don't have an account?{' '}
                    <Text style={{ color: '#4B98FF', textDecorationLine: 'underline' }}>Register Now!</Text>
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        paddingTop: 100,
        paddingBottom: 50,
    },
    titleContainer: {
        alignItems: 'left', // Center the title components
    },
    // title: {
    //     fontWeight: 'bold',
    //     fontSize: 5,
    //     textAlign: 'center', // Align text to center
    //     fontFamily: 'normal',
    // },
    subtitle: {
        fontSize: 30, // Subtitle font size
        textAlign: 'left',
        marginBottom: 30, // Align subtitle to center
        fontWeight: 'bold',
    },
    label: {
        fontWeight: 'bold',
        fontSize: 18, // Label font size for email and password
        textAlign: 'left', // Align label text to the left
    },
    textInput: {
        paddingTop: 20,
        paddingBottom: 10,
        width: 300,
        fontSize: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        marginBottom: 10,
    },
    passwordContainer: {
        flexDirection: 'row', // Horizontal layout for password input and eye icon
        alignItems: 'center', // Center vertically
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

export default Login;
