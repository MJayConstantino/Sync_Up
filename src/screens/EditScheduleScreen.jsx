import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Platform } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from 'date-fns';
import { firebase } from '../../firebase-config';

const firestore = firebase.firestore();

const EditScheduleScreen = ({ navigation, route }) => {
  const { scheduleId } = route.params;
  const [scheduleName, setScheduleName] = useState('');
  const [description, setDescription] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [date, setDate] = useState('');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isEditingEndTime, setIsEditingEndTime] = useState(false); // Declare isEditingEndTime state
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      try {
        const snapshot = await firestore.collection(`users/${currentUser.uid}/schedules/`).doc(scheduleId).get();
        const scheduleData = snapshot.data();
        console.log("Schedule data:", scheduleData); // Log the schedule data
        if (scheduleData) {
          setScheduleName(scheduleData.scheduleName);
          setDate(scheduleData.date);
          setTimeStart(scheduleData.timeStart);
          setTimeEnd(scheduleData.timeEnd);
          setDescription(scheduleData.description);
        } else {
          alert("Schedule not found!");
          navigation.goBack(); // Navigate back if schedule not found
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
        alert("An error occurred while fetching the schedule. Please try again.");
      }
    };
  
    if (scheduleId) {
      fetchScheduleDetails();
    }
  }, [scheduleId, currentUser.uid]);

  const openDatePicker = () => {
    setIsDatePickerVisible(true);
    setIsTimePickerVisible(false);
  };

  const openTimePicker = () => {
    setIsTimePickerVisible(true);
    setIsDatePickerVisible(false);
    setIsEditingEndTime(false); // Ensure isEditingEndTime is false when opening time picker for start time
  };

  const openEndTimePicker = () => {
    setIsTimePickerVisible(true);
    setIsDatePickerVisible(false);
    setIsEditingEndTime(true); // Set isEditingEndTime to true when opening time picker for end time
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
        setDate(formattedDate); // If date picker was visible, update date
      }

      closeDateTimePicker();
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const formattedTime = format(selectedTime, "hh:mm aa");
  
      if (isTimePickerVisible) {
        if (isEditingEndTime) {
          // If editing end time, update timeEnd
          setTimeEnd(formattedTime);
        } else {
          // If editing start time, update timeStart
          setTimeStart(formattedTime);
        }
      }
      closeDateTimePicker();
    }
  };
  

  const handleSaveSchedule = async () => {
    if (!scheduleName) {
      alert("Please enter a schedule name.");
      return;
    }

    const editedSchedule = {
      scheduleName,
      timeStart,
      timeEnd,
      date,
      description,
    };

    try {
      // Update schedule in your data store
      await updateScheduleInFirebase(scheduleId, editedSchedule); // Pass schedule ID and edited schedule details
      navigation.goBack();
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const updateScheduleInFirebase = async (taskId, editedSchedule) => {
    try {
      // Update the schedule in Firebase using the taskId
      await firestore.collection(`users/${currentUser.uid}/schedules`).doc(taskId).update(editedSchedule);
    } catch (error) {
      console.error("Error updating schedule in Firebase:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Schedule</Text>
        <TouchableOpacity onPress={handleSaveSchedule}>
          <Icon name="content-save" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter schedule name"
        value={scheduleName}
        onChangeText={setScheduleName}
      />

      <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
        <Icon name="calendar" size={20} color="#ccc" />
        <Text style={styles.dateButtonText}>
          {selectedDate ? format(new Date(selectedDate), "yyyy-MM-dd") : date ? date : 'Set Date'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.timeButton} onPress={openTimePicker}>
        <Icon name="clock" size={20} color="#ccc" />
        <Text style={styles.timeButtonText}>
          {timeStart ? timeStart : 'Set Start Time'}
        </Text>
      </TouchableOpacity>

      {/* New button for selecting end time */}
      <TouchableOpacity style={styles.timeButton} onPress={openEndTimePicker}>
        <Icon name="clock" size={20} color="#ccc" />
        <Text style={styles.timeButtonText}>
          {timeEnd ? timeEnd : 'Set End Time'}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.inputDescription}
        placeholder="Write a description (optional)"
        multiline
        textAlignVertical="top" // Ensure text stays at the top
        value={description}
        onChangeText={setDescription}
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
  );
}

export default EditScheduleScreen;

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
