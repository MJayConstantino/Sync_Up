import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Platform, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from 'date-fns';
import { EvilIcons } from '@expo/vector-icons';
import { firebase } from '../../firebase-config';
import { Menu, MenuOption, MenuOptions, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { ScrollView } from "react-native-gesture-handler";

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
  const [isEditingEndTime, setIsEditingEndTime] = useState(false);
  const [loading, setLoading] = useState(true);
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      try {
        const snapshot = await firestore.collection(`users/${currentUser.uid}/classSchedules/`).doc(classScheduleId).get();
        const classScheduleData = snapshot.data();
        console.log("Class Schedule data:", classScheduleData);
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
          navigation.goBack();
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
    setIsEditingEndTime(false);
  };

  const openEndTimePicker = () => {
    setIsTimePickerVisible(true);
    setIsEditingEndTime(true);
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
        setTimeEnd(formattedTime);
      } else {
        setTimeStart(formattedTime);
        const timeValue = getTimeValue(formattedTime);
        setTimeValue(timeValue);
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
      subject,
      time: {
        timeStart,
        timeEnd,
      },
      day,
      instructor,
      room,
      timeValue,
    };

    try {
      await updateClassScheduleInFirebase(classScheduleId, editedClassSchedule);
      navigation.goBack();
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const deleteClassSchedule = async () => {
    try {
      await firestore.collection(`users/${currentUser.uid}/tasks`).doc(taskId).delete();
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateClassScheduleInFirebase = async (classScheduleId, editedClassSchedule) => {
    try {
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
      <ScrollView>
      <View style={[styles.container, { paddingTop: 25, backgroundColor: '#f0f0f0' }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Class Schedule</Text>

          <TouchableOpacity onPress={deleteClassSchedule}>
            <EvilIcons name="trash" size={24} style={{ padding: 10 }} color="red" />
          </TouchableOpacity>
        </View>

        <View style={styles.rowButton01}> 
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Room</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter room"
              value={room}
              onChangeText={setRoom}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Stub Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter stub code"
              value={stubCode}
              onChangeText={setStubCode}
            />
          </View>
        </View>

        <View style={styles.rowButton02}> 
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Subject</Text>
            <TextInput
            style={styles.input}
            placeholder="Enter subject name"
            value={subject}
            onChangeText={setSubject}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Instructor</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter instructor"
              value={instructor}
              onChangeText={setInstructor}
            />
          </View>


        </View>

        <View style={styles.sectionContainer}>

            <Menu>
              <MenuTrigger style={styles.sectionDay}>
              <Text style={styles.sectionLabel}>Day</Text>
                <View style={styles.dayDropdown}>
                  <Text style={styles.dayDropdownText}>
                    {/* {day.length > 0 ? day.join(', ') : 'Select Day(s)'} */}
                  </Text>
                </View>
              <Icon name="chevron-down" size={30} color="#000" />
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

        <Text style={styles.sectionTitle}>Class Duration</Text>

        <View style={styles.timeContainer}>
          <TouchableOpacity style={styles.timeButton} onPress={openTimePicker}>
          <View style={styles.timeIconandDue}> 
            <Icon name="clock" size={20} color="#ccc" />
            <Text styles={styles.textTime}> Start Time </Text>
          </View>
          <View style={styles.timeButtonShape}> 
            <Text style={styles.timeButtonText}>
              {timeStart ? timeStart : '7:00 AM'}
            </Text>
          </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.timeButton} onPress={openEndTimePicker}>
          <View style={styles.timeIconandDue}> 
            <Icon name="clock" size={20} color="#ccc" />
            <Text styles={styles.textTime}> End TIme </Text>
          </View>
          <View style={styles.timeButtonShape}> 
            <Text style={styles.timeButtonText}>
              {timeEnd ? timeEnd : '8:00 AM'}
            </Text>
          </View>


          </TouchableOpacity>
        </View>

        <View style={styles.savebutonContainer}> 
          <TouchableOpacity onPress={handleSaveClassSchedule}> 
            <View style={styles.savebuton}> 
              <Text style={styles.savebuttonText} > SAVE </Text>
            </View>
          </TouchableOpacity>
        </View>

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
      </ScrollView>
    </MenuProvider>
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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
    width: 150,
  },
  rowButton01: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  rowButton02: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  dayDropdown: {
    marginLeft: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionContainer: {
    marginBottom: 20,
  },
  sectionDay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',

  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
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
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },
  timeButtonShape: {
    alignItems: 'center',
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