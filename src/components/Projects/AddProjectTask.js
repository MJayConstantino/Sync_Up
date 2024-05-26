import React, { useState, useRef, useEffect } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View, TextInput, Keyboard, Platform } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from 'date-fns';
import { Menu, MenuOption, MenuOptions, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { firebase } from '../../../firebase-config';

const firestore = firebase.firestore();

const AddProjectTaskModal = ({
  isVisible,
  onDismiss,
  onSave,
  projectId,
}) => {
  const [taskName, setTaskName] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [assignedTo, setAssignedTo] = useState([]);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(""); 
  const [selectedTime, setSelectedTime] = useState(""); 
  const [collaborators, setCollaborators] = useState([]);
  const taskNameInputRef = useRef(null);

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

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const openDatePicker = () => {
    setIsDatePickerVisible(true);
    setIsTimePickerVisible(false);
    Keyboard.dismiss();
  };

  const openTimePicker = () => {
    setIsTimePickerVisible(true);
    setIsDatePickerVisible(false);
    Keyboard.dismiss();
  };

  const closeDateTimePicker = () => {
    setIsDatePickerVisible(false);
    setIsTimePickerVisible(false);
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      setTaskDate(formattedDate);

      closeDateTimePicker();
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const formattedTime = format(selectedTime, "HH:mm aa");
      setTaskTime(formattedTime);

      closeDateTimePicker();
    }
  };

  const handleSaveTask = () => {
    if (!taskName) {
      alert("Please enter a task name.");
      return;
    }

    const newTask = {
      taskName,
      time: taskTime,
      date: taskDate,
      assignedTo, 
      description: "",
      isCompleted: false,
      createdAt: new Date()
    };

    onSave(newTask);

    onDismiss();

    setTaskName("");
    setTaskTime("");
    setTaskDate("");
    setAssignedTo([]);
  };

  const handleCancel = () => {

    setTaskName("");
    setTaskTime("");
    setTaskDate("");
    setAssignedTo([]); 

    onDismiss();
  };

  const handleAddCollaborator = (collaborator) => {
    setAssignedTo((prev) => [...prev, collaborator]);
  };
  
  const handleRemoveCollaborator = (collaborator) => {
    setAssignedTo((prev) => prev.filter((email) => email !== collaborator));
  };
  
  const selectedCollaboratorsUI = assignedTo.map((collaborator, index) => (
    <View key={index} style={styles.collaboratorBox}>
      <Text style={styles.collaboratorEmail}>{collaborator}</Text>
      <TouchableOpacity onPress={() => handleRemoveCollaborator(collaborator)}>
        <Icon name="close" size={20} color="red" />
      </TouchableOpacity>
    </View>
  ));

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onDismiss}>
      <MenuProvider>
        <View style={styles.modalContainer}>
          <View style={styles.shadowContainer}>
            <View style={styles.container}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <TextInput
                    ref={taskNameInputRef}
                    style={styles.input}
                    placeholder="Task Name"
                    value={taskName}
                    onChangeText={setTaskName}
                  />

                  <View style={styles.assignToContainer}>
                  <Text style={styles.assignToLabel}>Assign To:</Text>
                  <Menu style={styles.menu}>
                    <MenuTrigger>
                      <Text style={styles.menuText}>{collaborators.length > 0 ? "Select Collaborator" : "Loading..."}</Text>
                    </MenuTrigger>
                    <MenuOptions>
                      {collaborators.map((collaborator, index) => (
                        <MenuOption key={index} onSelect={() => handleAddCollaborator(collaborator)} text={collaborator} />
                      ))}
                    </MenuOptions>
                  </Menu>

                  <View style={styles.selectedCollaboratorsContainer}>{selectedCollaboratorsUI}</View>
                </View>
                <View style={styles.buttonRow}> 
                  <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
                    <Icon name="calendar" size={20} color="#ccc" />
                    <Text style={styles.dateButtonText}>
                      {selectedDate ? format(selectedDate, "yyyy-MM-dd") : 'Set Date'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.timeButton} onPress={openTimePicker}>
                    <Icon name="clock" size={20} color="#ccc" />
                    <Text style={styles.timeButtonText}>
                      {selectedTime ? format(selectedTime, "hh:mm aa") : 'Set Time'}
                    </Text>
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

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                      <Icon name="close-circle-outline" size={28} color="#FF0000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask}>
                      <Text style={styles.buttonText}>SAVE</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </MenuProvider>
    </Modal>
  );
}

export default AddProjectTaskModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  modalView: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  menu: {
    marginBottom: 10,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    padding: 10,
  },
  assignToLabel: {
    padding: 5,
    marginBottom: 10,
    paddingBottom: 1,
    fontWeight: 'bold',
  },
  assignToContainer: {
    marginBottom: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },

  collaboratorBox: {
    padding: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,

  },

  buttonRow: {
    flexDirection: "row",
    alignItems: "center", 
    marginBottom: 10, 
  },

  dateButton: {
    marginRight: 15,
    marginLeft: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  timeButton: {
    marginRight: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  dateButtonText: {
    fontSize: 16,
  },
  timeButtonText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelButton: {
    borderRadius: 20,
    padding: 10,
  },
  saveButton: {
    backgroundColor: "#03a1fc",
    borderRadius: 20,
    padding: 10,
  },
});
