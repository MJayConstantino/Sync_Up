import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Platform, ScrollView, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, setDate } from 'date-fns';
import { firebase } from '../../firebase-config';
import { Menu, MenuOption, MenuOptions, MenuTrigger, MenuProvider } from 'react-native-popup-menu';

const firestore = firebase.firestore();

const EditTaskScreen = ({ navigation, route }) => {
  const { taskId } = route.params;
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const currentUser = firebase.auth().currentUser;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const snapshot = await firestore.collection(`users/${currentUser.uid}/tasks/`).doc(taskId).get();
        const taskData = snapshot.data();
        console.log("Task data:", taskData); // Log the task data
        if (taskData) {
          setTaskName(taskData.taskName);
          setSelectedCategory(taskData.category);
          setTaskDate(taskData.date);
          setTaskTime(taskData.time);
          setTaskDescription(taskData.description);
        } else {
          alert("Task not found!");
          navigation.goBack(); // Navigate back if task not found
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
        setTaskDate(formattedDate); // If date picker was visible, update taskDate
      }

      closeDateTimePicker();
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const formattedTime = format(selectedTime, "HH:mm aa");

      if (isTimePickerVisible) {
        setTaskTime(formattedTime); // If time picker was visible, update taskTime
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
      category: selectedCategory !== "All" ? selectedCategory : null,
      time: taskTime,
      date: taskDate,
      description: taskDescription,
    };

    try {
      // Update task in your data store
      await updateTaskInFirebase(taskId, editedTask); // Pass task ID and edited task details
      navigation.goBack();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const updateTaskInFirebase = async (taskId, editedTask) => {
    try {
      // Update the task in Firebase using the taskId
      await firestore.collection(`users/${currentUser.uid}/tasks`).doc(taskId).update(editedTask);
    } catch (error) {
      console.error("Error updating task in Firebase:", error);
    }
  };

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

        <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
          <Icon name="calendar" size={20} color="#ccc" />
          <Text style={styles.timeButtonText}>
            {selectedDate ? format(new Date(selectedDate), "yyyy-MM-dd") : taskDate ? taskDate : 'Set Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.timeButton} onPress={openTimePicker}>
          <Icon name="clock" size={20} color="#ccc" />
          <Text style={styles.timeButtonText}>
            {selectedTime ? format(new Date(selectedTime), "hh:mm aa") : taskTime ? taskTime : 'Set Time'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.inputDescription}
          placeholder="Write a description (optional)"
          multiline
          textAlignVertical="top" // Ensure text stays at the top
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

export default EditTaskScreen;

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
  inputDescription: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    flex: 1, // Fill remaining space
    textAlignVertical: "top", // Align text to the top
  },
  categoryButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  categoryButtonText: {
    fontSize: 16,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  dateButtonText: {
    fontSize: 16,
    marginLeft: 5,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  timeButtonText: {
    fontSize: 16,
    marginLeft: 5,
  },
  datePicker: {
    width: "100%",
  },
});
