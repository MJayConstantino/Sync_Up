import { SafeAreaView, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { firebase } from '../config';

const Dashboards = () => {
  const { params } = useRoute(); // Retrieve initial parameters
  const handleSignOut = params.handleSignOut; // Get the sign-out function
  const [name, setName] = useState({});

  const changePassword = () => {
    firebase.auth().sendPasswordResetEmail(firebase.auth().currentUser.email)
      .then(() => alert('Password reset email sent'))
      .catch((error) => alert(error.message));
  };

  useEffect(() => {
    const userId = firebase.auth().currentUser.uid;
    const userDocRef = firebase.firestore().collection('users').doc(userId);

    userDocRef.get()
      .then((snapshot) => {
        if (snapshot.exists) {
          setName(snapshot.data());
        } else {
          console.log('User does not exist');
        }
      })
      .catch((error) => console.error('Error fetching user data:', error));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.greetingText}>Hello, {name.firstName}</Text>
        <Text style={styles.additionalText}>Welcome to your dashboard!</Text>

        <TouchableOpacity onPress={changePassword} style={styles.button}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignOut} style={styles.button}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  additionalText: {
    fontSize: 18,
    marginTop: 10,
  },
  button: {
    marginTop: 30,
    height: 50,
    width: 200,
    backgroundColor: '#4B98FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default Dashboards;
