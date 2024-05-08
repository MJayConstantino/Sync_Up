import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Platform, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from 'date-fns';
import { firebase } from '../../firebase-config';
import { Menu, MenuOption, MenuOptions, MenuTrigger, MenuProvider } from 'react-native-popup-menu';

const firestore = firebase.firestore();

const EditClassScheduleScreen = ({ navigation, route }) => {
  const { classScheduleId } = route.params;
  const [stubCode, setStubCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [room, setRoom] = useState('');
  const [subject, setSubject] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [timeValue, setTimeValue] = useState();
  const [day, setDay] = useState([]);
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
          setTimeValue(classScheduleData.timeValue)
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

  function getTimeValue(timeStart) {
    const [time, period] = timeStart.split(' ');
    const [hours, minutes] = time.split(':');
    let timeValue = parseInt(hours) * 100 + parseInt(minutes);
    if (period === 'PM' && hours !== '12') {
      timeValue += 1200;
    }
    return timeValue;
  }

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const formattedTime = format(selectedTime, "hh:mm aa");
  
      if (isEditingEndTime) {
        // If editing end time, update timeEnd
        setTimeEnd(formattedTime);
      } else {
        // If editing start time, update timeStart and timeValue
        setTimeStart(formattedTime);
        const timeValue = getTimeValue(formattedTime);
        setTimeValue(timeValue);
      }
  
      // Close the time picker after selecting a time
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
      subject,
      time: {
        timeStart,
        timeEnd,
      },
      day,
      instructor,
      room,
      timeValue, // Add timeValue to the schedule object
    };

    try {
      await updateClassScheduleInFirebase(classScheduleId, editedClassSchedule);
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
      <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="00adf5" size="large" />
    )
  } else return (
    <MenuProvider>
      <View style={[styles.container, { paddingTop: 25, backgroundColor: '#f0f0f0' }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Class Schedule</Text>
          <TouchableOpacity onPress={handleSaveClassSchedule}>
            <Text style={styles.saveButton}>Save changes</Text>
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
            <Menu>
              <MenuTrigger>
                <View style={styles.dayDropdown}>
                  <Text style={styles.dayDropdownText}>
                    {day.length > 0 ? day.join(', ') : 'Select Day(s)'}
                  </Text>
                  <Icon name="chevron-down" size={24} color="#000" />
                </View>
              </MenuTrigger>
              <MenuOptions>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'TBA'].map((dayOption) => (
                  <MenuOption
                    key={dayOption}
                    onSelect={() => {
                      if (day.includes(dayOption)) {
                        setDay(day.filter((selectedDay) => selectedDay !== dayOption));
                      } else {
                        setDay([...day, dayOption]);
                      }
                    }}
                  >
                    <View style={styles.dayOptionContainer}>
                      <Icon
                        name={day.includes(dayOption) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={24}
                        color="#000"
                      />
                      <Text style={styles.dayOptionText}>{dayOption}</Text>
                    </View>
                  </MenuOption>
                ))}
              </MenuOptions>
            </Menu>
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
    </MenuProvider>
  );
}

export default EditClassScheduleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 20,
    paddingTop: 25,
    marginTop: 50,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
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
  dayOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayOptionText: {
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
