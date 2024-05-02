import React from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { firebase } from './config';
import SplashScreen from './src/SplashScreen';
import Login from './src/Login';
import Registration from './src/Registration';
import Dashboards from './src/Dashboards';
import { useState, useEffect } from 'react';

// Custom header component
const Header = ({ title, navigation, canGoBack, onSignOut }) => (
  <View style={styles.headerContainer}>
    {canGoBack && (
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backButton}>&lt; Back</Text> 
      </TouchableOpacity>
    )}
    <Text style={styles.headerTitle}>{title}</Text>
    {onSignOut && (
      <TouchableOpacity onPress={onSignOut}>
        <Text style={styles.signOutButton}>Sign Out</Text>
      </TouchableOpacity>
    )}
  </View>
);

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(setUser);
    return () => subscriber();
  }, []);

  const handleSignOut = () => {
    firebase.auth().signOut().then(() => setUser(null));
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {user === null ? (
            <>
              <Stack.Screen
                name="SplashScreen"
                component={SplashScreen}
                options={{
                  header: ({ navigation }) => (
                    <Header
                      navigation={navigation}
                      canGoBack={false}
                    />
                  ),
                }}
              />
              <Stack.Screen
                name="Login"
                component={Login}
                options={{
                  header: ({ navigation }) => (
                    <Header
                      navigation={navigation}
                    />
                  ),
                }}
              />
              <Stack.Screen
                name="Registration"
                component={Registration}
                options={{
                  header: ({ navigation }) => (
                    <Header
                      navigation={navigation}
                    />
                  ),
                }}
              />
            </>
          ) : (
            <Stack.Screen
              name="Dashboards"
              component={Dashboards}
              initialParams={{ handleSignOut }}
              options={{
                header: ({ navigation }) => (
                  <Header
                    navigation={navigation}
                  />
                ),
              }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#FFF', // Header background color
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    fontSize: 16,
    color: 'white',
  },
  signOutButton: {
    fontSize: 16,
    color: 'white',
  },
});
