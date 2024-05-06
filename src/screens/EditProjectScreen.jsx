import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Platform, ActivityIndicator } from "react-native";
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
    const fetchTaskDetails = async () => {
      try {
        const snapshot = await firestore.collection(`projects/`).doc(projectId).get();
        const taskData = snapshot.data();
        console.log("Task data:", taskData); 
        if (taskData) {
          setProjectName(taskData.projectName);
          setDeadline(taskData.deadline);
          setCollaborators(taskData.assignedTo);
          setTaskDescription(taskData.description);
        } else {
          alert("Task not found!");
          navigation.goBack(); 
        }
      } catch (error) {
        console.error("Error fetching task details:", error);
        alert("An error occurred while fetching the task. Please try again.");
      }
    };
  
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId, currentUser.uid]);

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const projectDoc = await firestore.collection('projects').doc(projectId).get();
        const collaboratorsIds = projectDoc.data().collaborators || [];
        const collaboratorsData = await Promise.all(
          collaboratorsIds.map(async (collaboratorId) => {
            const userDoc = await firestore.collection('users').doc(collaboratorId).get();
            return userDoc.exists ? userDoc.data().email : null; 
          })
        );
        const validCollaborators = collaboratorsData.filter(collaborator => collaborator !== null);
        setCollaborators(validCollaborators);
      } catch (error) {
        console.error("Error fetching collaborators:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollaborators();
  }, []);

  const handleAddCollaborator = (collaborator) => {
    setAssignedTo((prev) => [...prev, collaborator]);
  };

  const handleRemoveCollaborator = (collaborator) => {
    setAssignedTo((prev) => prev.filter((email) => email !== collaborator));
  };

  const openDatePicker = () => {
    setIsDatePickerVisible(true);
    setIsTimePickerVisible(false);
  };

  const openTimePicker = () => {
    setIsTimePickerVisible(true);
    setIsDatePickerVisible(false);
  };

  const closeDateTimePicker = () => {
    setIsDatePickerVisible(false);
    setIsTimePickerVisible(false);
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      if (isDatePickerVisible) {
        setTaskDate(formattedDate); 
      }
      closeDateTimePicker();
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const formattedTime = format(selectedTime, "HH:mm aa");
      if (isTimePickerVisible) {
        setTaskTime(formattedTime); 
      }
      closeDateTimePicker();
    }
  };

  const handleSaveTask = async () => {
    if (!taskName) {
      alert("Please enter a task name.");
      return;
    }

    const editedTask = {
      taskName,
      time: taskTime,
      date: taskDate,
      assignedTo: assignedTo,
      description: taskDescription,
    };

    try {
      await updateTaskInFirebase(taskId, editedTask); 
      navigation.goBack();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const updateTaskInFirebase = async (taskId, editedTask) => {
    try {
      await firestore.collection(`projects/${projectId}/tasks`).doc(taskId).update(editedTask);
    } catch (error) {
      console.error("Error updating task in Firebase:", error);
    }
  };

  const selectedCollaboratorsUI = assignedTo.map((collaborator, index) => (
    <View key={index} style={styles.collaboratorBox}>
      <Text style={styles.collaboratorEmail}>{collaborator}</Text>
      <TouchableOpacity onPress={() => handleRemoveCollaborator(collaborator)}>
        <Icon name="close" size={20} color="red" />
      </TouchableOpacity>
    </View>
  ));

  if (loading) {
    return (
      <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="blue" size="large" />
    )
  } else return (
    <MenuProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Task</Text>
          <TouchableOpacity onPress={handleSaveTask}>
            <Icon name="content-save" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Enter task name"
          value={taskName}
          onChangeText={setTaskName}
        />

        <View style={styles.assignToContainer}>
          <Text style={styles.assignToLabel}>Assign To:</Text>
          <View style={styles.selectedCollaboratorsContainer}>{selectedCollaboratorsUI}</View>
          <Menu style={styles.menu}>
            <MenuTrigger>
              <Text style={styles.menuText}>{collaborators.length > 0 ? "Select Collaborator" : "Loading..."}</Text>
            </MenuTrigger>
            <MenuOptions>
              {collaborators.map((collaborator, index) => (
                <MenuOption key={index} onSelect={() => handleAddCollaborator(collaborator)} text={collaborator}>
                  <TouchableOpacity onPress={() => handleAddCollaborator(collaborator)}>
                    <Text style={styles.addCollaboratorButton}>+</Text>
                  </TouchableOpacity>
                </MenuOption>
              ))}
            </MenuOptions>
          </Menu>
        </View>

        <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
          <Icon name="calendar" size={20} color="#ccc" />
          <Text style={styles.dateButtonText}>
            {deadline ? deadline : 'Set Date'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.inputDescription}
          placeholder="Write a description (optional)"
          multiline
          textAlignVertical="top"
          value={taskDescription}
          onChangeText={setTaskDescription}
        />

        {isDatePickerVisible && (
          <DateTimePicker
            value={selectedDate ? new Date(selectedDate) : new Date()}
            mode="date"
            display={Platform.OS === "android" ? "calendar" : "spinner"}
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate)}
            style={styles.datePicker}
          />
        )}
      </View>
    </MenuProvider>
  );
}

export default EditProjectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  assignToContainer: {
    marginBottom: 10,
  },
  assignToLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  menu: {
    marginBottom: 10,
  },
  menuText: {
    fontSize: 16,
    padding: 10,
  },
  collaboratorBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  collaboratorEmail: {
    marginRight: 10,
  },
});
