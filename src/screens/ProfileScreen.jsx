import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { firebase } from "../../firebase-config";
import { useCallback } from "react";

const firestore = firebase.firestore();
const DEFAULT_PROFILE_PIC =
  "https://firebasestorage.googleapis.com/v0/b/syncup-4b36a.appspot.com/o/profilepic.png?alt=media&token=4f9acff6-166b-4e21-9ac8-42bc5f441e63";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const currentUser = firebase.auth().currentUser;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const userDoc = await firestore.collection("users").doc(currentUser.uid).get();
      if (userDoc.exists) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
    setLoading(false);
    }
  };
  // Re-fetch user data when the screen gains focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUserData();
    }, [])
  );
  
  
  if (loading) {
    return (
      <ActivityIndicator
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        color="00adf5"
        size="large"
      />
    );
  } else {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="keyboard-arrow-left" size={24} color="#000" />
          </TouchableOpacity>
        <Text style={styles.headerText}> User Profile </Text>
        </View>

        <ScrollView>
          <View style={styles.contentContainer}>
            <View style={styles.profileImageContainer}>
              <Image
                source={
                  userData?.imageUrl
                    ? { uri: userData.imageUrl }
                    : { uri: DEFAULT_PROFILE_PIC }
                }
                resizeMode="contain"
                style={styles.profileImage}
              />
            </View>
            <View style={styles.infoContainer}>
              <View style={styles.inputBox}>
                <MaterialIcons name="person" size={24} color="#000" />
                <Text style={styles.infoText}>
                  {userData?.firstName} {userData?.lastName}
                </Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.inputBox}>
                <MaterialIcons name="work" size={24} color="#000" />
                <Text style={styles.infoText}>
                  {userData?.occupation || "No set occupation"}
                </Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.inputBox}>
                <MaterialIcons name="email" size={24} color="#000" />
                <Text style={styles.infoText}>
                  {userData?.email || "No set email"}
                </Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.inputBox}>
                <MaterialIcons name="location-on" size={24} color="#000" />
                <Text style={styles.infoText}>
                  {userData?.country || "No set nationality"}
                </Text>
              </View>
            </View>

            <View style={styles.bioContainer}>
              <Text style={styles.bioTitle}>Bio:</Text>
              <Text style={styles.bioText}>
                {userData?.bio || "No set bio"}
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate("EditProfileScreen")}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => firebase.auth().signOut()}
              >
                <Text style={styles.buttonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 25
    
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    borderRadius: 50,
    margin: 20,
  },
  backButton: {
    marginRight: 10,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 50,
    marginRight: 80,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  profileImageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 20,
  },
  profileImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderColor: "#000",
    borderWidth: 2,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8
  },
  infoText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 8,
  },
  bioContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    marginTop: 12,
    width: '100%',
    borderRadius: 10,
    marginRight: 10,
    marginLeft: 10,
  },
  bioTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  bioText: {
    fontSize: 16,
    color: "#000",
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    width: 180,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
  },
});

export default ProfileScreen;
