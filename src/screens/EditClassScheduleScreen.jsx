import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Platform } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from 'date-fns';
import { firebase } from '../../firebase-config';

const firestore = firebase.firestore();

const EditClassScheduleScreen = ({ navigation, route }) => {
  const { classScheduleId } = route.params;
  const [stubCode, setStubCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [day, setDay] = useState('');
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [isEditingEndTime, setIsEditingEndTime] = useState(false); // Declare isEditingEndTime state
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      try {
        const snapshot = await firestore.collection(`users/${currentUser.uid}/classSchedules/`).doc(classScheduleId).get();
        const classScheduleData = snapshot.data();
        console.log("Class Schedule data:", classScheduleData); // Log the schedule data
        if (classScheduleData) {
          setStubCode(classScheduleData.stubCode);
          setSubjectName(classScheduleData.scheduleName);
          setDay(classScheduleData.date);
          setTimeStart(classScheduleData.time.timeStart);
          setTimeEnd(classScheduleData.time.timeEnd);
          setInstructor(classScheduleData.instructor);
          setRoom(classScheduleData.room);
        } else {
          alert("Schedule not found!");
          navigation.goBack(); // Navigate back if schedule not found
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
        alert("An error occurred while fetching the schedule. Please try again.");
      }
    };
  
    if (classScheduleId) {
      fetchScheduleDetails();
    }
  }, [classScheduleId, currentUser.uid]);

  const openTimePicker = () => {
    setIsTimePickerVisible(true);
    setIsEditingEndTime(false); // Ensure isEditingEndTime is false when opening time picker for start time
  };

  const openEndTimePicker = () => {
    setIsTimePickerVisible(true);
    setIsEditingEndTime(true); // Set isEditingEndTime to true when opening time picker for end time
  };

  const closeTimePicker = () => {
    setIsTimePickerVisible(false);
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
      closeTimePicker();
    }
  };
  

  const handleSaveClassSchedule = async () => {
    if (!subjectName) {
      alert("Please enter a subject name.");
      return;
    }

    const editedClassSchedule = {
      stubCode,
      subjectName,
      timeStart,
      timeEnd,
      day,
      instructor,
      room,
    };

    try {
      // Update schedule in your data store
      await updateClassScheduleInFirebase(classScheduleId, editedClassSchedule); // Pass schedule ID and edited schedule details
      navigation.goBack();
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const updateClassScheduleInFirebase = async (classScheduleId, editedClassSchedule) => {
    try {
      // Update the schedule in Firebase using the taskId
      await firestore.collection(`users/${currentUser.uid}/classSchedules`).doc(classScheduleId).update(editedClassSchedule);
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
        <Text style={styles.headerTitle}>Edit Class Schedule</Text>
        <TouchableOpacity onPress={handleSaveClassSchedule}>
          <Icon name="content-save" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter subject name"
        value={subjectName}
        onChangeText={setSubjectName}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter stub code"
        value={stubCode}
        onChangeText={setStubCode}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter instructor"
        value={instructor}
        onChangeText={setInstructor}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter room"
        value={room}
        onChangeText={setRoom}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter day"
        value={day}
        onChangeText={setDay}
      />

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

export default EditClassScheduleScreen;

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
