import React, { useState, useRef } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Keyboard,
  Platform,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from 'date-fns';
import { Menu, MenuOption, MenuOptions, MenuTrigger, MenuProvider } from 'react-native-popup-menu';

const AddTaskModal = ({
  isVisible,
  onDismiss, // Function to dismiss the modal
  onSave, // Function to save the task to Firebase
  taskName,
  setTaskName,
  taskDescription,
  setTaskDescription,
  selectedCategory,
  setSelectedCategory,
  taskTime,
  setTaskTime,
  taskDate,
  setTaskDate,
}) => {
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(''); // Initialize selectedDate
  const [selectedTime, setSelectedTime] = useState(''); // New state for selected time
  const taskNameInputRef = useRef(null);

  const openDatePicker = () => {
    setIsDatePickerVisible(true);
    setIsTimePickerVisible(false);
    Keyboard.dismiss(); // Close soft keyboard if open
  };

  const openTimePicker = () => {
    setIsTimePickerVisible(true);
    setIsDatePickerVisible(false);
    Keyboard.dismiss(); // Close soft keyboard if open
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
        setTaskDate(formattedDate); // If date picker was visible, update taskDate
      }

      closeDateTimePicker();
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const formattedTime = format(selectedTime, "hh:mm aa");

      if (isTimePickerVisible) {
        setTaskTime(formattedTime); // If time picker was visible, update taskTime
      }
      closeDateTimePicker();
    }
  };

  const handleSaveTask = () => {
    // Basic validation (optional)
    if (!taskName) {
      alert("Please enter a task name.");
      return;
    }
  
    // Set task information with selected category
    const newTask = {
      taskName,
      category: selectedCategory !== "All" ? selectedCategory : null,
      time: taskTime,
      date: taskDate,
      description: taskDescription,
      isCompleted: false
    };
  
    // Invoke onSave function with the newTask object
    onSave(newTask);
  
    // Close the modal
    onDismiss();
  
    // Clear input fields
    setTaskName("");
    setTaskTime("");
    setSelectedTime("");
    setTaskDate(""); // Clear taskDate
    setSelectedDate(""); // Clear selectedDate
    setTaskDescription("");
    setSelectedCategory("All");
  };

  const handleCancel = () => {
    // Clear input if taskName is not empty
    setTaskName("");
    setTaskTime("");
    setSelectedTime("");
    setTaskDate(""); // Clear taskDate
    setSelectedDate(""); // Clear selectedDate
    setTaskDescription("");
    setSelectedCategory("All");
    // Call the onDismiss function to close the modal
    onDismiss();
  };

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
                    <Menu>
                      <MenuTrigger style={styles.categoryButton}>
                        <Text style={styles.categoryButtonText}>
                          {selectedCategory !== null && selectedCategory !== "All" ? `Category: ${selectedCategory}` : "Category: None"}
                        </Text>
                        <Icon name="chevron-down" size={20} color="#ccc" />
                      </MenuTrigger>
                      <MenuOptions>
                        <MenuOption key="none" onSelect={() => setSelectedCategory(null)}>
                          <Text style={styles.categoryMenuText}>None</Text>
                        </MenuOption>
                        <MenuOption key="Work" onSelect={() => setSelectedCategory("Work")}>
                          <Text style={styles.categoryMenuText}>Work</Text>
                        </MenuOption>
                        <MenuOption key="School" onSelect={() => setSelectedCategory("School")}>
                          <Text style={styles.categoryMenuText}>School</Text>
                        </MenuOption>
                        <MenuOption key="Home" onSelect={() => setSelectedCategory("Home")}>
                          <Text style={styles.categoryMenuText}>Home</Text>
                        </MenuOption>
                        <MenuOption key="Personal" onSelect={() => setSelectedCategory("Personal")}>
                          <Text style={styles.categoryMenuText}>Personal</Text>
                        </MenuOption>
                      </MenuOptions>
                    </Menu>
                  {/* Category Button */}
                  <View style={styles.buttonRow}>
                    {/* Category Button */}


                    {/* Date Button */}
                    <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
                      <Icon name="calendar" size={20} color="#ccc" />
                      <Text style={styles.timeButtonText}>
                        {selectedDate ? format(selectedDate, "yyyy-MM-dd") : 'Set Date'}
                      </Text>
                    </TouchableOpacity>

                    {/* Time Button */}
                    <TouchableOpacity style={styles.timeButton} onPress={openTimePicker}>
                      <Icon name="clock" size={20} color="#ccc" />
                      <Text style={styles.timeButtonText}>
                        {selectedTime ? format(new Date(selectedTime), "hh:mm aa") : 'Set Time'}
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

export default AddTaskModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background color
    shadowColor: "#000", // Shadow color
    maxWidth: '100%',
    elevation: 10,
    borderTopLeftRadius: 40,
    borderTopLeftRadius: 40,
    height: 'auto',
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  centeredView: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "100%", // Adjust the width as needed
  },
  buttonRow: {
    flexDirection: "row", // Align buttons horizontally
    alignItems: "center", // Align items vertically
    marginBottom: 10, // Reduce vertical space between category container and other inputs
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  categoryButton: {
    // flex: 1, // Expand to fill available space horizontally
    // marginRight: 5, // Add some space between category button and date/time buttons
    // borderWidth: 1,
    // borderColor: "#ccc",
    // borderRadius: 5,
    // padding: 10,
    // marginBottom: 10,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    // width: "100%",
  },
  categoryButtonText: {
    fontSize: 14,
  },
  dateButton: {
    marginRight: 5, // Add some space between date/time buttons
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 10,
  },
  timeButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  timeButtonText: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: 'center',
  },

  // buttonContainer: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   marginTop: 10,
  // },
  cancelButton: {
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#03a1fc", // Blue background for save button
    borderRadius: 20,
    padding: 10,
  },
  buttonText: {
      color: "#FFF",
      fontSize: 14,
      fontWeight: "bold",
    },

  saveButton: {
    backgroundColor: "#03a1fc",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background color
  },
});
