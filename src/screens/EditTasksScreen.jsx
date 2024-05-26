import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Platform, ScrollView, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { EvilIcons } from '@expo/vector-icons';
import { format, setDate } from 'date-fns';
import { firebase } from '../../firebase-config';
import { Menu, MenuOption, MenuOptions, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { taskNotification, removeAlarm } from '../components/Alarms/Alarm';

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
        console.log("Task data:", taskData);
        if (taskData) {
          setTaskName(taskData.taskName);
          setSelectedCategory(taskData.category);
          setTaskDate(taskData.date);
          setTaskTime(taskData.time);
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

  function getTimeValue(taskTime) {
    const [time, period] = taskTime.split(' ');
    const [hours, minutes] = time.split(':');
    let timeValue = parseInt(hours) * 100 + parseInt(minutes);
    if (period === 'PM' && hours !== '12') {
      timeValue += 1200;
    }
    return timeValue;
  }

  const deleteTask = async () => {
    try {
      await firestore.collection(`users/${currentUser.uid}/tasks`).doc(taskId).delete();
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting task:", error);
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
      timeValue: getTimeValue(taskTime),
    };

    try {
      await updateTaskInFirebase(taskId, editedTask);
  
      const [time, ampm] = taskTime.split(' ');
      const [hour, minute] = time.split(':');
      const period = ampm.toUpperCase();
      const notificationId = await taskNotification(hour, minute, period, taskName);
  
      await firestore.collection(`users/${currentUser.uid}/tasks`).doc(taskId).update({ notificationId });

    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      navigation.goBack();
    }
  };

  const updateTaskInFirebase = async (taskId, editedTask) => {
    try {
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
          
          <TouchableOpacity onPress={deleteTask}>
            <EvilIcons name="trash" size={24} style={{ padding: 10 }} color="red" />
          </TouchableOpacity>
         
        </View>

        <Menu>
          <MenuTrigger style={styles.categoryButton}>
            <Text style={styles.categoryButtonText}>
              {selectedCategory !== null && selectedCategory !== "All" ? `Category: ${selectedCategory}` : "Category: None"}
            </Text>
            <Icon name="chevron-down" size={16} color="white" />
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
                {selectedDate ? format(new Date(selectedDate), "yyyy-MM-dd") : taskDate ? taskDate : 'Set Date'}
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
              {selectedTime ? format(new Date(selectedTime), "hh:mm aa") : taskTime ? taskTime : 'Set Time'}
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
    borderBottomWidth: 2,
    borderBottomColor: 'black',
    padding: 10,
    marginBottom: 10,
    textAlignVertical: "bottom",
    fontWeight: 'bold',
    fontSize: 30,
  },
  inputDescription: {
    padding: 10,
    marginBottom: 10,
    flex: 1, 
    textAlignVertical: "top",
  },

  categoryButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#D3D3D3",
    borderRadius: 30,
    padding: 10,
    marginBottom: 10,
    width: "40%",
    height: 'auto',
  },
  categoryButtonText: {
    fontSize: 12,
    color: 'white'
  },
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
  timeButton: {
    flexDirection: "row",
    justifyContent: 'space-between',
    alignItems: "center",
    borderTopWidth: 1,
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

});