//note that 12 AM is treated as 00:00 here so 12:34 Am is 00:34 AM
//For some reason the days are still not working, Error is TypeError: The weekday parameter should be a number

import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from "react-native";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av"; // Import Audio from expo-av
import AsyncStorage from "@react-native-async-storage/async-storage";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowAlert: true,
    shouldSetBadge: false,
  }),
});

export default function AlarmClock() {
  const notificationListener = useRef();
  const [alarms, setAlarms] = useState([]);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [ampm, setAmpm] = useState("AM");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");
  const [sound, setSound] = useState(null); // Define sound state

  async function scheduleNotification(hour, minute, ampm) {
    const newHour = ampm === "PM" ? parseInt(hour) + 12 : parseInt(hour);
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Alarm",
        body: "It is time to wake up!",
        data: { data: "Your morning alarm data" },
        sound: "default", // Use default notification sound
      },
      trigger: {
        hour: newHour,
        minute: parseInt(minute),
        repeats: true,
      },
    });
    // No sound is played here
    return identifier;
  }
  
  useEffect(() => {
    getData();
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      // Check if the notification is an alarm
      if (notification.request.content.title === "Alarm") {
        // Play alarm sound
        playAlarmSound();
      }
    });
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
    };
  }, []);
  
  async function playAlarmSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('./sounds/01. Highway To Oblivion.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing alarm sound:', error);
    }
  }  

  async function addAlarm() {
    if (editMode) {
      await removeAlarm(editId);
    }
    const newAlarm = {
      hour: hour,
      minute: minute,
      ampm: ampm,
      id: await scheduleNotification(hour, minute, ampm),
    };
    setAlarms([...alarms, newAlarm]);
    clearInputFields();
    storeAlarms([...alarms, newAlarm]);
  }

  async function removeAlarm(id) {
    await Notifications.cancelScheduledNotificationAsync(id);
    const updatedAlarms = alarms.filter((alarm) => alarm.id !== id);
    setAlarms(updatedAlarms);
    storeAlarms(updatedAlarms);
    if (editMode && editId === id) {
      clearInputFields();
      setEditMode(false);
    }
  }

  async function storeAlarms(alarms) {
    try {
      await AsyncStorage.setItem("alarms", JSON.stringify(alarms));
    } catch (e) {
      console.log(e);
    }
  }

  async function getData() {
    try {
      const alarmsData = await AsyncStorage.getItem("alarms");
      if (alarmsData) {
        setAlarms(JSON.parse(alarmsData));
      }
    } catch (e) {
      console.log(e);
    }
  }

  function clearInputFields() {
    setHour("");
    setMinute("");
    setAmpm("AM");
  }

  function editAlarm(id) {
    const alarmToEdit = alarms.find((alarm) => alarm.id === id);
    setHour(alarmToEdit.hour);
    setMinute(alarmToEdit.minute);
    setAmpm(alarmToEdit.ampm);
    setEditId(id);
    setEditMode(true);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Alarm App</Text>
      <View style={styles.timeInputContainer}>
        <TextInput
          style={styles.timeInput}
          placeholder="Hour"
          keyboardType="numeric"
          value={hour}
          onChangeText={(text) => setHour(text)}
        />
        <Text style={styles.separator}>:</Text>
        <TextInput
          style={styles.timeInput}
          placeholder="Minute"
          keyboardType="numeric"
          value={minute}
          onChangeText={(text) => setMinute(text)}
        />
      </View>
      <View style={styles.ampmContainer}>
        <Pressable
          style={[styles.ampmButton, ampm === "AM" ? styles.ampmButtonSelected : null]}
          onPress={() => setAmpm("AM")}
        >
          <Text style={styles.ampmButtonText}>AM</Text>
        </Pressable>
        <Pressable
          style={[styles.ampmButton, ampm === "PM" ? styles.ampmButtonSelected : null]}
          onPress={() => setAmpm("PM")}
        >
          <Text style={styles.ampmButtonText}>PM</Text>
        </Pressable>
      </View>
      <Pressable style={styles.button} onPress={addAlarm}>
        <Text style={styles.buttonText}>{editMode ? "Update Alarm" : "Add Alarm"}</Text>
      </Pressable>
      {alarms.map((alarm) => (
        <View key={alarm.id} style={styles.alarm}>
          <Text>{`${alarm.hour}:${alarm.minute} ${alarm.ampm}`}</Text>
          <Pressable style={styles.smallButton} onPress={() => editAlarm(alarm.id)}>
            <Text style={styles.buttonText}>Edit</Text>
          </Pressable>
          <Pressable style={styles.smallButton} onPress={() => removeAlarm(alarm.id)}>
            <Text style={styles.buttonText}>Remove</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    color: "blue",
    marginVertical: 20,
    fontSize: 40,
    fontWeight: "bold",
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeInput: {
    width: 60,
    fontSize: 16,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },
  separator: {
    fontSize: 20,
  },
  ampmContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  ampmButton: {
    backgroundColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
  },
  ampmButtonSelected: {
    backgroundColor: "blue",
  },
  ampmButtonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  button: {
    width: "70%",
    backgroundColor: "blue",
    borderRadius: 18,
    marginVertical: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  smallButton: {
    backgroundColor: "blue",
    borderRadius: 18,
    marginVertical: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  alarm: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "70%",
    marginVertical: 10,
  },
});
