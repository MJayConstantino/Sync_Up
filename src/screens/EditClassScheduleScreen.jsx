import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Platform, ActivityIndicator } from "react-native";
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
  const [subject, setSubject] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [day, setDay] = useState('');
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [isEditingEndTime, setIsEditingEndTime] = useState(false); // Declare isEditingEndTime state
  const [loading, setLoading] = useState(true);
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      try {
        const snapshot = await firestore.collection(`users/${currentUser.uid}/classSchedules/`).doc(classScheduleId).get();
        const classScheduleData = snapshot.data();
        console.log("Class Schedule data:", classScheduleData); // Log the schedule data
        if (classScheduleData) {
          setStubCode(classScheduleData.stubCode);
          setSubject(classScheduleData.subject);
          setDay(classScheduleData.day);
          setTimeStart(classScheduleData.time.timeStart);
          setTimeEnd(classScheduleData.time.timeEnd);
          setInstructor(classScheduleData.instructor);
          setRoom(classScheduleData.room);
          setLoading(false);
        } else {
          alert("Schedule not found!");
          navigation.goBack(); // Navigate back if schedule not found
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
        alert("An error occurred while fetching the schedule. Please try again.");
      } finally {
        setLoading(false)
      };
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
    if (!subject) {
      alert("Please enter a subject name.");
      return;
    }

    const editedClassSchedule = {
      stubCode,
      subject, // Use subjectName instead of subject
      time: { // Create a nested object for time with timeStart and timeEnd
        timeStart,
        timeEnd,
      },
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

  if (loading) {
    return (
      <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="blue" size="large" />
    )
  } else return (
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

      {/* Subject Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter subject name"
          value={subject}
          onChangeText={setSubject}
        />
      </View>

      {/* Stub Code Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Stub Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter stub code"
          value={stubCode}
          onChangeText={setStubCode}
        />
      </View>

      {/* Instructor Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Instructor</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter instructor"
          value={instructor}
          onChangeText={setInstructor}
        />
      </View>

      {/* Room Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Room</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter room"
          value={room}
          onChangeText={setRoom}
        />
      </View>

      {/* Day Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Day</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter day"
          value={day}
          onChangeText={setDay}
        />
      </View>

      {/* Section title for Class Duration */}
      <Text style={styles.sectionTitle}>Class Duration</Text>
      {/* Start Time and End Time in the same row */}
      <View style={styles.timeContainer}>
        <TouchableOpacity style={styles.timeButton} onPress={openTimePicker}>
          <Icon name="clock" size={20} color="#ccc" />
          <Text style={styles.timeButtonText}>
            {timeStart ? timeStart : 'Set Start Time'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.dashText}>-</Text>
        <TouchableOpacity style={styles.timeButton} onPress={openEndTimePicker}>
          <Icon name="clock" size={20} color="#ccc" />
          <Text style={styles.timeButtonText}>
            {timeEnd ? timeEnd : 'Set End Time'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* DateTimePicker component */}
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
  sectionContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginRight: 5,
  },
  timeButtonText: {
    fontSize: 16,
    marginLeft: 5,
  },
  dashText: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 5,
  },
  datePicker: {
    width: "100%",
  },
});