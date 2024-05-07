import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet, FlatList } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { firebase } from '../../firebase-config';
import { Menu, MenuOption, MenuOptions, MenuTrigger, MenuProvider } from 'react-native-popup-menu';

const firestore = firebase.firestore();

const CreateProjectScreen = ({ navigation }) => {
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

  const handleCreateProject = async () => {
    try {
      if (!projectName.trim()) {
        setErrorMessage("Please enter a project name.");
        return;
      }

      const projectData = {
        projectName,
        deadline,
        collaborators,
        createdBy: currentUser.uid,
        createdAt: new Date()
      };

      await firestore.collection("projects").add(projectData);

      setProjectName("");
      setDeadline("");
      setCollaborators([]);
      setCollaboratorEmail("");
      setErrorMessage("");

      // Navigate back to project screen
      navigation.goBack();
    } catch (error) {
      console.error("Error creating project:", error);
      setErrorMessage("Error creating project. Please try again later.");
    }
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

  if (loading) {
    return (
      <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="#00adf5" size="large" />
    )
  } else return (
    <MenuProvider>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Create Project</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Project Name"
            value={projectName}
            onChangeText={text => setProjectName(text)}
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
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Icon name="calendar" size={20} color="#ccc" />
              <Text style={styles.dateButtonText}>
                {deadline ? format(deadline, "yyyy-MM-dd") : 'Set Date'}
              </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
            value={deadline ? new Date(deadline) : new Date()}
            mode="date"
            display="default"
            style={styles.datePicker}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const formattedDate = format(selectedDate, "yyyy-MM-dd");
                setDeadline(formattedDate);
              }
            }}
          />
          )}
          <TouchableOpacity style={styles.createButton} onPress={handleCreateProject}>
            <Text style={styles.buttonText}>Create Project</Text>
          </TouchableOpacity>
        </View>
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
    paddingTop: 25,
    marginTop: 50
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  createButton: {
    backgroundColor: "#2196F3",
      borderRadius: 5,
      paddingVertical: 12,
      alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  errorMessage: {
    color: "red",
    marginBottom: 10,
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
});

export default CreateProjectScreen;
