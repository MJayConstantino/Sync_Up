import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, TextInput, Platform, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { EvilIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { firebase } from '../../firebase-config';
import { scheduleNotification, removeAlarm } from '../components/Alarms/Alarm';

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
  const [isEditingEndTime, setIsEditingEndTime] = useState(false);
  const currentUser = firebase.auth().currentUser;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScheduleDetails = async () => {
      try {
        const snapshot = await firestore.collection(`users/${currentUser.uid}/schedules/`).doc(scheduleId).get();
        const scheduleData = snapshot.data();
        console.log("Schedule data:", scheduleData);
        if (scheduleData) {
          setScheduleName(scheduleData.scheduleName);
          setDate(scheduleData.date);
          setTimeStart(scheduleData.timeStart);
          setTimeEnd(scheduleData.timeEnd);
          setDescription(scheduleData.description);
        } else {
          alert("Schedule not found!");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching schedule details:", error);
        alert("An error occurred while fetching the schedule. Please try again.");
      } finally {
        setLoading(false);
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
    setIsEditingEndTime(false);
  };

  const openEndTimePicker = () => {
    setIsTimePickerVisible(true);
    setIsDatePickerVisible(false);
    setIsEditingEndTime(true);
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
        setDate(formattedDate);
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
          setTimeEnd(formattedTime);
        } else {
          setTimeStart(formattedTime);
        }
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
      timeValue: getTimeValue(timeStart)
    };
    
    try {
      await updateScheduleInFirebase(scheduleId, editedSchedule);
      
      const [time, ampm] = timeStart.split(' ');
      const [hour, minute] = time.split(':');
      const period = ampm.toUpperCase(); 
      const notificationId = await scheduleNotification(hour, minute, period, scheduleName);
  
      await firestore.collection(`users/${currentUser.uid}/schedules`).doc(scheduleId).update({ notificationId });
  
      navigation.goBack();
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const deleteSchedule = async () => {
    try {
      await firestore.collection(`users/${currentUser.uid}/tasks`).doc(taskId).delete();
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  
  const updateScheduleInFirebase = async (taskId, editedSchedule) => {
    try {
      await firestore.collection(`users/${currentUser.uid}/schedules`).doc(taskId).update(editedSchedule);
    } catch (error) {
      console.error("Error updating schedule in Firebase:", error);
    }
  };

  if (loading) {
    return (
      <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="00adf5" size="large" />
    )
  } else return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Schedule</Text>

          <TouchableOpacity onPress={deleteSchedule}>
            <EvilIcons name="trash" size={24} style={{ padding: 10 }} color="red" />
          </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter schedule name"
        value={scheduleName}
        onChangeText={setScheduleName}
      />

      <TextInput
        style={styles.inputDescription}
        placeholder="Write a description (optional)"
        multiline
        textAlignVertical="top"
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
        <View style={styles.dateIconandDue}> 
          <Icon name="calendar" size={20} color="#ccc" />
          <Text styles={styles.textDueDate}>Set Due Date</Text>
        </View>        
        <View style={styles.dateButtonShape}> 
          <Text style={styles.dateButtonText}>
            {selectedDate ? format(new Date(selectedDate), "yyyy-MM-dd") : date ? date : '2020-01-01'}
          </Text>
        </View>



      </TouchableOpacity>

      <TouchableOpacity style={styles.timeButton} onPress={openTimePicker}>
      <View style={styles.timeIconandDue}> 
          <Icon name="clock" size={20} color="#ccc" />
          <Text styles={styles.textTime}> Set Start Time </Text>
        </View>
        <View style={styles.timeButtonShape}> 
          <Text style={styles.timeButtonText}>
            {timeStart ? timeStart : '12:00 AM'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* New button for selecting end time */}
      <TouchableOpacity style={styles.timeButton} onPress={openEndTimePicker}>
        <View style={styles.timeIconandDue}> 
          <Icon name="clock" size={20} color="#ccc" />
          <Text styles={styles.textTime}> Set End Time </Text>
        </View>
        <View style={styles.timeButtonShape}> 
          <Text style={styles.timeButtonText}>
            {timeEnd ? timeEnd : '12:00 AM'}
          </Text>
        </View>

      </TouchableOpacity>

      <View style={styles.savebutonContainer}> 
          <TouchableOpacity onPress={handleSaveSchedule}> 
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
