import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Platform, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { EvilIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { firebase } from '../../firebase-config';
import { Menu, MenuOption, MenuOptions, MenuTrigger, MenuProvider } from 'react-native-popup-menu';

const firestore = firebase.firestore();

const EditProjectTaskScreen = ({ navigation, route }) => {
  const { projectId, taskId } = route.params;
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [assignedTo, setAssignedTo] = useState([]); 
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(true);
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const snapshot = await firestore.collection(`projects/${projectId}/tasks/`).doc(taskId).get();
        const taskData = snapshot.data();
        console.log("Task data:", taskData); 
        if (taskData) {
          setTaskName(taskData.taskName);
          setTaskDate(taskData.date);
          setTaskTime(taskData.time);
          setAssignedTo(taskData.assignedTo);
          setTaskDescription(taskData.description);
        } else {
          alert("Task not found!");
          navigation.goBack(); 
        }
      } catch (error) {
        console.error("Error fetching task details:", error);
        alert("An error occurred while fetching the task. Please try again.");
      } finally {
        setLoading(false);
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
      const formattedTime = format(selectedTime, "hh:mm aa");
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

  const deleteProjectTask = async () => {
    try {
      await firestore.collection(`users/${currentUser.uid}/tasks`).doc(taskId).delete();
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting task:", error);
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
      <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="00adf5" size="large" />
    )
  } else return (
    <MenuProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Task</Text>

          <TouchableOpacity onPress={deleteProjectTask}>
            <EvilIcons name="trash" size={24} style={{ padding: 10 }} color="red" />
          </TouchableOpacity>
        </View>

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

        <TextInput
          style={styles.input}
          placeholder="Enter task name"
          value={taskName}
          onChangeText={setTaskName}
        />

        <TextInput
          style={styles.inputDescription}
          placeholder="Write a description (optional)"
          multiline
          textAlignVertical="top"
          value={taskDescription}
          onChangeText={setTaskDescription}
        />

        <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
        <View style={styles.dateIconandDue}> 
            <Icon name="calendar" size={20} color="#ccc" />
            <Text styles={styles.textDueDate}> Due Date</Text>
          </View>
          <View style={styles.dateButtonShape}> 
            <Text style={styles.dateButtonText}>
              {taskDate ? taskDate : '2020-01-01'}
            </Text>
          </View>


        </TouchableOpacity>

        <TouchableOpacity style={styles.timeButton} onPress={openTimePicker}>
          <View style={styles.timeIconandDue}> 
            <Icon name="clock" size={20} color="#ccc" />
            <Text styles={styles.textTime}> Time and Reminder </Text>
          </View>

          <View style={styles.timeButtonShape}> 
            <Text style={styles.timeButtonText}>
              {taskTime ? taskTime : '12:00 PM'}
            </Text>
          </View>

        </TouchableOpacity>

        <View style={styles.savebutonContainer}> 
          <TouchableOpacity onPress={handleSaveTask}> 
            <View style={styles.savebuton}> 
              <Text style={styles.savebuttonText} > SAVE </Text>
            </View>
          </TouchableOpacity>
        </View>



        {isDatePickerVisible && (
          <DateTimePicker
            value={selectedDate ? new Date(selectedDate) : new Date()}
            mode="date"
            display={Platform.OS === "android" ? "calendar" : "spinner"}
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate)}
            style={styles.datePicker}
          />
        )}

        {isTimePickerVisible && (
          <DateTimePicker
            value={selectedTime ? new Date(selectedTime) : new Date()}
            mode="time"
            display={Platform.OS === "android" ? "clock" : "spinner"}
            onChange={(event, selectedTime) => handleTimeChange(event, selectedTime)}
            style={styles.datePicker}
          />
        )}
      </View>
    </MenuProvider>
  );
}

export default EditProjectTaskScreen;

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
  // Title of Task 
  input: {
    borderBottomWidth: 2,
    borderColor: '#A9A9A9',
    padding: 10,
    marginBottom: 10,
    textAlignVertical: "bottom",
    fontWeight: 'bold',
    fontSize: 30,
    borderTopWidth: 2,
  },
  // Desciption
  inputDescription: {
    // borderWidth: 1,
    // borderColor: "#ccc",
    // borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    flex: 1, // Fill remaining space
    textAlignVertical: "top", // Align text to the top
  },
  //
  dateButton: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },
  dateButtonShape: {
    alignItems: 'center',
    backgroundColor: '#ccc',
    borderRadius: 20,
    padding: 1,
  },
  dateButtonText: {
    fontSize: 14,
    padding: 5,
    width: 'auto',
  },
  dateIconandDue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textDueDate: {
    color: '#ccc',
    fontSize: 20,
    marginLeft: 5,
  },
  //
  timeButton: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    borderTopWidth: 1,
    // borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },
  timeButtonShape: {
    alignItems: 'center',
    backgroundColor: '#ccc',
    borderRadius: 20,
    padding: 1,
    width: "auto",
  },
  timeButtonText: {
    fontSize: 14,
    padding: 5,
    width: 'auto',
  },
  timeIconandDue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textTime: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5,
  },
  datePicker: {
    width: "100%",
  },
  savebutonContainer: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
  },
  savebuton: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#ccc',
    padding: 5,
    backgroundColor: "#03a1fc",
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  savebuttonText: {
    alignItems: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

assignToContainer: {
  marginBottom: 10,
},
assignToLabel: {
  fontSize: 20,
  marginBottom: 5,
  fontWeight: 'bold',
},
menu: {
  marginBottom: 5,
  width: '35%',
  alignItems: 'center',
  borderWidth: 1,
  borderRadius: 20,
},
menuText: {
  fontSize: 14,
  padding: 3,
},
collaboratorBox: {
  flexDirection: "row",
  alignItems: "center",
  borderBottomWidth: 1,
  backgroundColor: '#D3D3D3',
  marginBottom: 5,
},
collaboratorEmail: {
  marginRight: 10,
},
selectedCollaboratorsContainer: {
  flexDirection: 'row',
}
});