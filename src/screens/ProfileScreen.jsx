import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  RefreshControl,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../../firebase-config';

const firestore = firebase.firestore();

const ProfileScreen = () => {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const currentUser = firebase.auth().currentUser;
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [profileEdited, setProfileEdited] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firestore.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [profileEdited]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>User Profile</Text>
      <ScrollView
      refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.contentContainer} >
        <View style={styles.profileImageContainer}>
          <Image
            source={userData?.imageUrl ? { uri: userData.imageUrl } : { uri: 'http://www.gravatar.com/avatar/?d=mp' }}
            resizeMode="contain"
            style={styles.profileImage}
          />
        </View>

        <View style={styles.infoContainer}>
          <MaterialIcons name="work" size={24} color="#000" />
          <Text style={styles.infoText}>{userData?.occupation}</Text>
        </View>

        <View style={styles.infoContainer}>
          <MaterialIcons name="email" size={24} color="#000" />
          <Text style={styles.infoText}>{userData?.email}</Text>
        </View>

        <View style={styles.infoContainer}>
          <MaterialIcons name="location-on" size={24} color="#000" />
          <Text style={styles.infoText}>{userData?.country}</Text>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.bioTitle}>Bio:</Text>
          <Text style={styles.bioText}>{userData?.bio}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfileScreen')}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => {
              firebase.auth().signOut();
            }}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 50
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
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
});

export default ProfileScreen;
