import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
    Modal,
    StyleSheet,
    ActivityIndicator
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { COLORS, FONTS } from "../constants";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker"
import { firebase } from '../../firebase-config';

const firestore = firebase.firestore();
const DEFAULT_PROFILE_PIC = 'https://firebasestorage.googleapis.com/v0/b/syncup-4b36a.appspot.com/o/profilepic.png?alt=media&token=4f9acff6-166b-4e21-9ac8-42bc5f441e63';


const EditProfileScreen = ({ navigation }) => {
    const [selectedImage, setSelectedImage] = useState(DEFAULT_PROFILE_PIC);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [country, setCountry] = useState("");
    const [selectedStartDate, setSelectedStartDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const currentUser = firebase.auth().currentUser;
    const [occupation, setOccupation] = useState("");
    const [bio, setBio] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userDoc = await firestore.collection("users").doc(currentUser.uid).get();
                const userData = userDoc.data();
                setFirstName(userData.firstName);
                setLastName(userData.lastName); // Assuming firstName is a field in your Firebase user data
                setEmail(userData.email);
                setCountry(userData.country);
                setSelectedStartDate(userData.birthDate ? new Date(userData.birthDate) : new Date()); // Assuming birthDate is a field in your Firebase user data
                setSelectedImage(userData.imageUrl);
                setOccupation(userData.occupation);
                setBio(userData.bio);
            } catch (error) {
                console.log("Error getting profile details", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchUser();
    }, []);

    const handleImageSelection = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        console.log(result);

        if (!result.cancelled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleSaveChanges = async () => {
        try {
            await firestore.collection("users").doc(currentUser.uid).update({
                firstName: name,
                email: email,
                country: country,
                occupation: occupation,
                birthDate: selectedStartDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
                imageUrl: selectedImage,
                bio: bio,
            });
            // Optionally, you can navigate back or show a success message
            navigation.goBack();
        } catch (error) {
            console.log("Error updating profile", error);
        }
    };

    if (loading){
        return (
            <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="00adf5" size="large" />
          )
    } else return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="keyboard-arrow-left" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
                <View style={styles.profileImageContainer}>
                    <TouchableOpacity onPress={handleImageSelection}>
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.profileImage}
                        />
                        <View style={styles.cameraIconContainer}>
                            <MaterialIcons name="photo-camera" size={32} color={COLORS.primary} />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>First Name</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                value={firstName}
                                onChangeText={(value) => setFirstName(value)}
                                style={styles.textInput}
                            />
                        </View>
                        <Text style={styles.label}>Last Name</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                value={lastName}
                                onChangeText={(value) => setLastName(value)}
                                style={styles.textInput}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                value={email}
                                onChangeText={(value) => setEmail(value)}
                                style={styles.textInput}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                value={password}
                                onChangeText={(value) => setPassword(value)}
                                style={styles.textInput}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInputContainer}>
                            <Text>{format(selectedStartDate, 'yyyy-MM-dd')}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={selectedStartDate}
                                mode="date"
                                display="calendar"
                                onChange={(event, date) => {
                                    setShowDatePicker(false);
                                    if (date) {
                                        setSelectedStartDate(date);
                                    }
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Country</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                value={country}
                                onChangeText={(value) => setCountry(value)}
                                style={styles.textInput}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Occupation</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                value={occupation}
                                onChangeText={(value) => setOccupation(value)}
                                style={styles.textInput}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Bio</Text>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                value={bio}
                                onChangeText={(value) => setBio(value)}
                                style={styles.textInput}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity onPress={handleSaveChanges} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save Change</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingHorizontal: 22,
        marginTop: 50
    },
    header: {
        marginHorizontal: 12,
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
    },
    backButton: {
        position: "absolute",
        left: 0,
    },
    headerTitle: {
        ...FONTS.h3,
    },
    profileImageContainer: {
        alignItems: "center",
        marginVertical: 22,
    },
    profileImage: {
        height: 170,
        width: 170,
        borderRadius: 85,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    cameraIconContainer: {
        position: "absolute",
        bottom: 0,
        right: 10,
        zIndex: 9999,
    },
    formContainer: {
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: "column",
        marginBottom: 16,
    },
    label: {
        ...FONTS.h4,
    },
    textInputContainer: {
        height: 44,
        width: "100%",
        borderColor: COLORS.secondaryGray,
        borderWidth: 1,
        borderRadius: 4,
        marginVertical: 6,
        justifyContent: "center",
        paddingLeft: 8,
    },
    textInput: {
        flex: 1,
    },
    dateInputContainer: {
        height: 44,
        width: "100%",
        borderColor: COLORS.secondaryGray,
        borderWidth: 1,
        borderRadius: 4,
        marginVertical: 6,
        justifyContent: "center",
        paddingLeft: 8,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        height: 44,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    saveButtonText: {
        ...FONTS.body3,
        color: COLORS.white,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
});

export default EditProfileScreen;
