import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Platform, ActivityIndicator, Alert, FlatList } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from 'date-fns';
import { firebase } from '../../firebase-config';
import { Menu, MenuOption, MenuOptions, MenuTrigger, MenuProvider } from 'react-native-popup-menu';

const firestore = firebase.firestore();

const EditProjectScreen = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [projectName, setProjectName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [existingEmails, setExistingEmails] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const currentUser = firebase.auth().currentUser;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExistingEmails = async () => {
      try {
        const usersSnapshot = await firestore.collection("users").get();
        const emails = usersSnapshot.docs.map(doc => doc.data().email);
        setExistingEmails(emails);
      } catch (error) {
        console.error("Error fetching existing emails:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingEmails();
  }, []);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const snapshot = await firestore.collection(`projects`).doc(projectId).get();
        const projectData = snapshot.data();
        if (projectData) {
          setProjectName(projectData.projectName);
          setDeadline(projectData.deadline);
          setCollaborators(projectData.collaborators);
        } else {
          Alert.alert("Project not found!");
          navigation.goBack(); 
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
        Alert.alert("An error occurred while fetching the project. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjectDetails();
  }, [projectId]);


  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      setDeadline(formattedDate);
    }
    closeDatePicker();
  };

  const handleAddCollaborator = async () => {
    try {
      if (!collaboratorEmail.trim()) {
        setErrorMessage("Please enter an email.");
        return;
      }

      const userSnapshot = await firestore.collection("users").where("email", "==", collaboratorEmail).get();
      if (userSnapshot.empty) {
        setErrorMessage("User not found.");
        return;
      }
      const userId = userSnapshot.docs[0].id;
      if (!collaborators.includes(userId)) {
        setCollaborators(prevCollaborators => [...prevCollaborators, userId]);
        setCollaboratorEmail("");
        setErrorMessage("");
      } else {
        setErrorMessage("Collaborator already added.");
      }
    } catch (error) {
      console.error("Error adding collaborator:", error);
      setErrorMessage("Error adding collaborator. Please try again later.");
    }
  };

  const handleRemoveCollaborator = (index) => {
    const updatedCollaborators = [...collaborators];
    updatedCollaborators.splice(index, 1);
    setCollaborators(updatedCollaborators);
  };

  const filterEmails = (text) => {
    return existingEmails.filter(email => email.toLowerCase().startsWith(text.toLowerCase()));
  };

  const handleInputChange = (text) => {
    setCollaboratorEmail(text);
    if (text.trim() !== '') {
      setShowSuggestions(true);
      setSuggestions(filterEmails(text));
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (email) => {
    setCollaboratorEmail(email);
    setShowSuggestions(false);
  };

  const handleSaveChanges = async () => {
    try {
      await firestore.collection('projects').doc(projectId).update({
        projectName,
        deadline,
        collaborators,
      });
      Alert.alert("Project updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating project:", error);
      Alert.alert("An error occurred while updating the project. Please try again.");
    }
  };

  if (loading) {
    return (
      <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="#00adf5" size="large" />
    )
  } else return (
      <MenuProvider>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Project</Text>
          </View>
  
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter project name"
              value={projectName}
              onChangeText={setProjectName}
            />
  
            <View style={styles.collaboratorInputContainer}>
              <TextInput
                style={[styles.input, styles.collaboratorInput]}
                placeholder="Collaborator Email"
                value={collaboratorEmail}
                onChangeText={handleInputChange}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddCollaborator}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
            {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
            <Menu
              opened={showSuggestions}
              onBackdropPress={() => setShowSuggestions(false)}
            >
              <MenuTrigger />
              <MenuOptions>
                <FlatList
                  data={suggestions}
                  renderItem={({ item }) => (
                    <MenuOption onSelect={() => handleSelectSuggestion(item)}>
                      <Text>{item}</Text>
                    </MenuOption>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </MenuOptions>
            </Menu>
            <View style={styles.collaboratorsContainer}>
              {collaborators.map((collaboratorId, index) => (
                <View key={index} style={styles.collaboratorItem}>
                  <Text>{collaboratorId}</Text>
                  <TouchableOpacity onPress={() => handleRemoveCollaborator(index)}>
                    <MaterialIcons name="clear" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
  
            <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
              <Icon name="calendar" size={20} color="#ccc" />
              <Text style={styles.dateButtonText}>
                {deadline ? deadline : 'Set Deadline'}
              </Text>
            </TouchableOpacity>
  
            {showDatePicker && (
              <DateTimePicker
                value={deadline ? new Date(deadline) : new Date()}
                mode="date"
                display={Platform.OS === "android" ? "calendar" : "spinner"}
                onChange={(event, selectedDate) => handleDateChange(event, selectedDate)}
                style={styles.datePicker}
              />
            )}
          </View>
  
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </MenuProvider>
    );
  }
  
  export default EditProjectScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f2f2f2",
      paddingHorizontal: 20,
      paddingTop: 25,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    formContainer: {
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
    },
    collaboratorInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    collaboratorInput: {
      flex: 1,
      marginRight: 10,
    },
    addButton: {
      backgroundColor: "#2196F3",
      borderRadius: 5,
      paddingHorizontal: 15,
      paddingVertical: 8,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
    },
    errorMessage: {
      color: "red",
      marginBottom: 10,
    },
    collaboratorsContainer: {
      marginBottom: 20,
    },
    collaboratorItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#f2f2f2",
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginBottom: 5,
    },
    dateButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f2f2f2",
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginBottom: 20,
    },
    dateButtonText: {
      marginLeft: 10,
      color: "#666",
    },
    datePicker: {
      marginBottom: 20,
    },
    saveButton: {
      backgroundColor: "#2196F3",
      borderRadius: 5,
      paddingVertical: 12,
      alignItems: "center",
    },
    saveButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
  });