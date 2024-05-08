import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View, TextInput, Keyboard, Platform } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from 'date-fns';

const AddScheduleModal = ({
  isVisible,
  onDismiss,
  onSave,
}) => {
  const [scheduleName, setScheduleName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isStartTimePickerVisible, setIsStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setIsEndTimePickerVisible] = useState(false);


  const openDatePicker = () => {
    setIsDatePickerVisible(true);
    setIsStartTimePickerVisible(false);
    setIsEndTimePickerVisible(false);
    Keyboard.dismiss(); // Close soft keyboard if open
  };

  const openStartTimePicker = () => {
    setIsStartTimePickerVisible(true);
    setIsDatePickerVisible(false);
    setIsEndTimePickerVisible(false);
    Keyboard.dismiss(); // Close soft keyboard if open
  };

  const openEndTimePicker = () => {
    setIsEndTimePickerVisible(true);
    setIsDatePickerVisible(false);
    setIsStartTimePickerVisible(false);
    Keyboard.dismiss(); // Close soft keyboard if open
  };

  const closeDateTimePicker = () => {
    setIsDatePickerVisible(false);
    setIsStartTimePickerVisible(false);
    setIsEndTimePickerVisible(false);
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setSelectedDate(selectedDate);
      closeDateTimePicker();
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedStartTime(selectedTime);
      closeDateTimePicker();
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setSelectedEndTime(selectedTime);
      closeDateTimePicker();
    }
  };

  const handleSaveSchedule = () => {
    const newSchedule = {
      scheduleName,
      timeStart: format(selectedStartTime, "hh:mm aa"),
      timeEnd: format(selectedEndTime, "hh:mm aa"),
      date: format(selectedDate, "yyyy-MM-dd"),
      description: 'Sample Description', 
    };

    onSave(newSchedule);
    onDismiss();

    setScheduleName("");
    setSelectedDate(new Date());
    setSelectedStartTime(new Date());
    setSelectedEndTime(new Date());
  };

  const handleCancel = () => {
    // Clear input fields
    setSelectedDate(new Date());
    setSelectedStartTime(new Date());
    setSelectedEndTime(new Date());

    // Call the onDismiss function to close the modal
    onDismiss();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onDismiss}>
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <TextInput
            style={styles.input}
            placeholder="Schedule Name"
            value={scheduleName}
            onChangeText={setScheduleName}
          />

          <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
            <Icon name="calendar" size={20} color="#ccc" />
            <Text style={styles.timeButtonText}>
              {selectedDate ? format(selectedDate, "yyyy-MM-dd") : 'Set Date'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.timeButton} onPress={openStartTimePicker}>
            <Icon name="clock" size={20} color="#ccc" />
            <Text style={styles.timeButtonText}>
              {selectedStartTime ? format(new Date(selectedStartTime), "hh:mm aa") : 'Set Start Time'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.timeButton} onPress={openEndTimePicker}>
            <Icon name="clock" size={20} color="#ccc" />
            <Text style={styles.timeButtonText}>
              {selectedEndTime ? format(new Date(selectedEndTime), "hh:mm aa") : 'Set End Time'}
            </Text>
          </TouchableOpacity>

          {isDatePickerVisible && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === "android" ? "calendar" : "spinner"}
              onChange={handleDateChange}
            />
          )}

          {isStartTimePickerVisible && (
            <DateTimePicker
              value={selectedStartTime}
              mode="time"
              display={Platform.OS === "android" ? "clock" : "spinner"}
              onChange={handleStartTimeChange}
            />
          )}

          {isEndTimePickerVisible && (
            <DateTimePicker
              value={selectedEndTime}
              mode="time"
              display={Platform.OS === "android" ? "clock" : "spinner"}
              onChange={handleEndTimeChange}
            />
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Icon name="close-circle-outline" size={28} color="#FF0000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSchedule}>
              {/* <Icon name="content-save" size={24} color="#FFF" /> */}
              <Text style={styles.saveButtonText}>SAVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default AddScheduleModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background color
  },
  modalView: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%", // Adjust the width as needed
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  dateButton: {
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
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButton: {
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#03a1fc",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
