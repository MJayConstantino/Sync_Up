import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useState, useEffect } from 'react';
import { firebase } from './firebase-config';
import { LinearGradient } from 'expo-linear-gradient';
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);


  function CustomDrawerContent(props) {
    return (
      <LinearGradient
        colors={['#0859C6', '#0A3D62']}
        start={[0, 0]}
        end={[1, 1]}
        style={{ flex: 1 }}
      >
        <DrawerContentScrollView {...props}>
          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 20, }}>
            <Image
              source={require('./src/assets/icon.png')}
              style={{ width: 100, height: 100, marginBottom: 10, resizeMode: 'contain'}}
            />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: "yellow" }}>SyncUp</Text>
          </View>
          <DrawerItem
            label="Profile"
            onPress={() => props.navigation.navigate('Profile')}
            icon={({ color, size }) => <Ionicons name="person" size={size} color="white" />}
            labelStyle={{ color: "white" }}
            style={{ borderRadius: 10 }}
          />
          <DrawerItem
            label="Dashboard"
            onPress={() => props.navigation.navigate('Dashboard')}
            icon={({ color, size }) => <Ionicons name="home" size={size} color="white" />}
            labelStyle={{ color: "white" }}
            style={{ borderRadius: 10 }}
          />
          <DrawerItem
            label="Scan RF"
            onPress={() => props.navigation.navigate('Scan RF')}
            icon={({ color, size }) => <Ionicons name="barcode" size={size} color="white" />}
            labelStyle={{ color: "white" }}
            style={{ borderRadius: 10 }}
          />
          <DrawerItem
            label="Class Schedules"
            onPress={() => props.navigation.navigate('Class Schedules')}
            icon={({ color, size }) => (
              <Ionicons name="book" size={size} color="white" />
            )}
            labelStyle={{ color: "white" }}
            style={{ borderRadius: 10 }}
          />
          <DrawerItem
            label="Settings"
            onPress={() => props.navigation.navigate('Settings')}
            icon={({ color, size }) => <Ionicons name="settings" size={size} color="white" />}
            labelStyle={{ color: "white" }}
            style={{ borderRadius: 10 }}
          />
        </DrawerContentScrollView>
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
            icon={({ color, size }) => <Ionicons name="key" size={size} color="white" />}
            labelStyle={{ color: "white" }}
            style={{ borderRadius: 10 }}
          />
          <DrawerItem
            label="Sign Out"
            onPress={() => {
              firebase.auth().signOut();
            }}
            icon={({ color, size }) => <Ionicons name="log-out" size={size} color="white" />}
            labelStyle={{ color: "white" }}
            style={{ borderRadius: 10 }}
          />
        </View>
      </LinearGradient>
    );
  }
  
  const styles = StyleSheet.create({
    bottomDrawerSection: {
      marginBottom: 15,
      borderTopColor: "yellow",
      borderTopWidth: 1,
      paddingTop: 15,
      paddingHorizontal: 20,
    },
  });

  function DrawerNavigator() {
    const Drawer = createDrawerNavigator();
  
    return (
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />} 
        screenOptions={{
          headerShown: false, 
          headerStyle: { backgroundColor: 'blue' }, 
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' }, 
          drawerActiveBackgroundColor: '00adf5', 
          drawerActiveTintColor: 'white', 
          drawerInactiveTintColor: 'black', 
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
          headerShown: false,
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
          headerShown: false,
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
              iconName = focused ? 'chatbox' : 'chatbox-outline'; 
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
          headerShown: false,
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
          headerShown: true,
        }}
      >
        <Stack.Screen name="Chat" component={ChatListScreen} />
        <Stack.Screen name="ChatRoom" component={Chat} />
      </Stack.Navigator>
    )
  }

  function TaskScreenManager(){
    return(
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
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
          headerShown: false,
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
            headerShown: false, 
          }}
        >
          {isSplashVisible ? (
            <Stack.Screen 
              name="SplashScreen" 
              component={AppRoot}
            />
          ) : (
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