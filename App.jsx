import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useState, useEffect } from 'react';
import { firebase } from './firebase-config';
import Login from "./src/screens/Login";
import Registration from "./src/screens/Registration";
import DashboardScreen from "./src/screens/DashboardScreen";
import ProfileScreen from './src/screens/ProfileScreen';
import TasksScreen from './src/screens/TasksScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import ProjectTasksScreen from "./src/screens/ProjectTasksScreen";
import EditScheduleScreen from "./src/screens/EditScheduleScreen";
import RFScannerScreen from "./src/screens/RFScannerScreen";
import AppRoot from './src/screens/SplashScreen';
import EditTaskScreen from "./src/screens/EditTasksScreen";
import EditProjectTaskScreen from "./src/screens/EditProjectTaskScreen";
import EditClassScheduleScreen from "./src/screens/EditClassScheduleScreen";
import CreateProjectScreen from "./src/screens/CreateProjectScreen";
import EditProjectScreen from "./src/screens/EditProjectScreen";
import ClassScheduleScreen from "./src/screens/ClassSchedulesScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import ChatListScreen from "./src/screens/ChatListScreen";
import Chat from "./src/screens/Chat";


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [isSplashVisible, setSplashVisible] = useState(true);

  function onAuthStateChanged(user) {
    setUser(user);
  }

  useEffect(() => {
    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  // After the splash screen animation completes, hide the splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, 3000); // Adjust this value as per your animation duration
    return () => clearTimeout(timer);
  }, []);


  function CustomDrawerContent(props) {
    return (
      <View style={{ flex: 1 }}>
        <DrawerContentScrollView {...props}>
          {/* Custom top section with logo placeholder */}
          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
            <Image
              source={require('./src/assets/icon.png')}
              style={{ width: 100, height: 100, marginBottom: 10, resizeMode: 'contain' }}
            />
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>SyncUp</Text>
          </View>
          {/* Your custom drawer content goes here */}
          <DrawerItem
            label="Profile"
            onPress={() => props.navigation.navigate('Profile')}
            icon={({ color, size }) => <Ionicons name="person" size={size} color={color} />}
          />
          <DrawerItem
            label="Dashboard"
            onPress={() => props.navigation.navigate('Dashboard')}
            icon={({ color, size }) => <Ionicons name="home" size={size} color={color} />}
          />
          <DrawerItem
            label="Scan RF"
            onPress={() => props.navigation.navigate('Scan RF')}
            icon={({ color, size }) => <Ionicons name="barcode" size={size} color={color} />}
          />
          <DrawerItem
            label="Class Schedules"
            onPress={() => props.navigation.navigate('Class Schedules')}
            icon={({ color, size }) => (
              <Ionicons name="book" size={size} color={color} />
            )}
          />
          <DrawerItem
            label="Settings"
            onPress={() => props.navigation.navigate('Settings')}
            icon={({ color, size }) => <Ionicons name="settings" size={size} color={color} />}
          />
        </DrawerContentScrollView>
        {/* Bottom section for Sign Out */}
        <View style={styles.bottomDrawerSection}>
          <DrawerItem
            label="Change Password"
            onPress={() => {
              firebase.auth().sendPasswordResetEmail(firebase.auth().currentUser.email)
              .then(() => {
                alert("Password reset email sent")
              }).catch((error) => {
                alert(error)
              })
            }}
            icon={({ color, size }) => <Ionicons name="key" size={size} color={color} />}
          />
          <DrawerItem
            label="Sign Out"
            onPress={() => {
              firebase.auth().signOut();
            }}
            icon={({ color, size }) => <Ionicons name="log-out" size={size} color={color} />}
          />
        </View>
      </View>
    );
  }

  function DrawerNavigator() {
    return (
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />} // Use CustomDrawerContent for drawer content
        screenOptions={{
          headerShown: false, // Optionally show header
          headerStyle: { backgroundColor: 'blue' }, // Header background color
          headerTintColor: 'white', // Header text color
          headerTitleStyle: { fontWeight: 'bold' }, // Header title style
          drawerActiveBackgroundColor: 'lightblue', // Active screen background color
          drawerActiveTintColor: 'blue', // Active screen text color
          drawerInactiveTintColor: 'black', // Inactive screen text color
        }}
      >
        <Drawer.Screen name="Dashboard" component={HomeTabNavigator} />
        <Drawer.Screen name="Profile" component={ProfileScreenManager} />
        <Drawer.Screen name="Scan RF" component={RFScannerScreen} />
        <Drawer.Screen name="Class Schedules" component={ClassScheduleManager} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    );
  }

  function ClassScheduleManager(){
    return(
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Hide header for all screens in this stack
        }}
      >
        <Stack.Screen name="ClassScheduleScreen" component={ClassScheduleScreen} />
        <Stack.Screen name="EditClassScheduleScreen" component={EditClassScheduleScreen} />
      </Stack.Navigator>
    )
  }

  function ProfileScreenManager(){
    return(
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Hide header for all screens in this stack
        }}
      >
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      </Stack.Navigator>
    )
  }

  function HomeTabNavigator() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
  
            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Schedule') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'Projects') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Tasks') {
              iconName = focused ? 'document-text' : 'document-text-outline';
            } else if (route.name === 'Chat') {
              iconName = focused ? 'chatbox' : 'chatbox-outline'; // Changed the icon name for 'Chat' screen
            }
  
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'blue',
          tabBarInactiveTintColor: 'gray',
          tabBarLabelStyle: { display: 'none' },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Projects" component={ProjectScreenManager} />
        <Tab.Screen name="Schedule" component={ScheduleScreenManager} />
        <Tab.Screen name="Tasks" component={TaskScreenManager} />
        <Tab.Screen name="Chat" component={ChatNavigator} />
      </Tab.Navigator>
    );
  }
  

  function ProjectScreenManager(){
    return(
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Hide header for all screens in this stack
        }}
      >
        <Stack.Screen name="ProjectsScreen" component={ProjectsScreen} />
        <Stack.Screen name="CreateProjectScreen" component={CreateProjectScreen} />
        <Stack.Screen name="EditProjectScreen" component={EditProjectScreen} />
        <Stack.Screen name="ProjectTasksScreen" component={ProjectTasksScreen} />
        <Stack.Screen name="EditProjectTaskScreen" component={EditProjectTaskScreen} />
      </Stack.Navigator>
    )
  }

  function ChatNavigator(){
    return(
      <Stack.Navigator
        screenOptions={{
          headerShown: true, // Hide header for all screens in this stack
        }}
      >
        <Stack.Screen name="Chat" component={ChatListScreen} />
        <Stack.Screen name="ChatScreen" component={Chat} />
      </Stack.Navigator>
    )
  }

  function TaskScreenManager(){
    return(
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Hide header for all screens in this stack
        }}
      >
        <Stack.Screen name="TaskScreen" component={TasksScreen} />
        <Stack.Screen name="EditTaskScreen" component={EditTaskScreen} />
      </Stack.Navigator>
    )
  }

  function ScheduleScreenManager(){
    return(
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Hide header for all screens in this stack
        }}
      >
        <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} />
        <Stack.Screen name="EditScheduleScreen" component={EditScheduleScreen} />
        <Stack.Screen name="EditTaskScreen" component={EditTaskScreen} />
        <Stack.Screen name="EditClassScheduleScreen" component={EditClassScheduleScreen}/>
        <Stack.Screen name="EditProjectTaskScreen" component={EditProjectTaskScreen}/>
        <Stack.Screen name="EditProjectScreen" component={EditProjectScreen}/>
      </Stack.Navigator>
    )
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false, // Apply globally to all screens in the stack
          }}
        >
          {/* AppRoot manages the splash screen and initialization */}
          {isSplashVisible ? (
            <Stack.Screen 
              name="SplashScreen" 
              component={AppRoot}
            />
          ) : (
            // If there's no user, navigate to Login and Registration screens
            !user ? (
              <>
                <Stack.Screen
                  name="Login"
                  component={Login}
                />
                <Stack.Screen
                  name="Registration"
                  component={Registration}
                />
              </>
            ) : (
              // If user is logged in, navigate to Dashboard
              <Stack.Screen
                name="Dashboard"
                component={DrawerNavigator}
              />
            )
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
})