import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firebase } from '../../firebase-config';
import { format } from 'date-fns';
import { Menu, MenuOption, MenuOptions, MenuTrigger, MenuProvider } from 'react-native-popup-menu';

const firestore = firebase.firestore();

const CreateProjectScreen = () => {
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
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    // Fetch existing emails from users collection
    const fetchExistingEmails = async () => {
      try {
        const usersSnapshot = await firestore.collection("users").get();
        const emails = usersSnapshot.docs.map(doc => doc.data().email);
        setExistingEmails(emails);
      } catch (error) {
        console.error("Error fetching existing emails:", error);
      }
    };

    fetchExistingEmails();
  }, []);

  const handleCreateProject = async () => {
    try {
      // Validate input
      if (!projectName.trim()) {
        setErrorMessage("Please enter a project name.");
        return;
      }

      // Create the project data
      const projectData = {
        projectName,
        deadline,
        collaborators,
        createdBy: currentUser.uid,
      };

      // Add the project to Firestore
      await firestore.collection("projects").add(projectData);

      // Reset the form
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

  return (
    <MenuProvider>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Create Project</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Project Name"
          value={projectName}
          onChangeText={text => setProjectName(text)}
        />
        <Text style={styles.deadlineText}>Set Deadline</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text>
            {deadline ? format(deadline, "yyyy-MM-dd") : 'Set Date'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
          value={deadline ? new Date(deadline) : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              const formattedDate = format(selectedDate, "yyyy-MM-dd");
              setDeadline(formattedDate);
            }
          }}
        />
        )}

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
        <TouchableOpacity style={styles.createButton} onPress={handleCreateProject}>
          <Text style={styles.buttonText}>Create Project</Text>
        </TouchableOpacity>
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  deadlineText: {
    fontSize: 16,
    marginBottom: 5,
  },
  collaboratorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  collaboratorInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  createButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  autocompleteContainer: {
    marginBottom: 10,
  },
  collaboratorsContainer: {
    marginBottom: 10,
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  errorMessage: {
    color: "red",
    marginBottom: 10,
  },
});

export default CreateProjectScreen;
