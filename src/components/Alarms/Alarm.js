import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from "react-native";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowAlert: true,
    shouldSetBadge: false,
  }),
});

async function taskNotification(hour, minute, ampm, taskName) {
  let newHour = parseInt(hour);
  if (ampm === "PM") {
    newHour = (newHour % 12) + 12;
  } else {
    newHour %= 12;
  }
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Task Reminder",
      body: taskName,
      sound: "default",
    },
    trigger: {
      hour: newHour,
      minute: parseInt(minute),
      repeats: true,
    },
  });
  return identifier;
}

async function scheduleNotification(hour, minute, ampm, scheduleName) {
  let newHour = parseInt(hour);
  if (ampm === "PM") {
    newHour = (newHour % 12) + 12;
  } else {
    newHour %= 12;
  }
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Schedule Reminder",
      body: scheduleName,
      sound: "default",
    },
    trigger: {
      hour: newHour,
      minute: parseInt(minute),
      repeats: true,
    },
  });
  return identifier;
}

async function playAlarmSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/alarm.mp3'));
    await sound.playAsync();
  } catch (error) {
    console.log('Error playing alarm sound:', error);
  }
}

async function addAlarm(hour, minute, ampm, editMode, editId, alarms, setAlarms, clearInputFields, storeAlarms, editTaskName) {
  if (editMode) {
    await removeAlarm(editId, alarms, setAlarms, storeAlarms);
  }
  const newAlarm = {
    hour: hour,
    minute: minute,
    ampm: ampm,
    id: await scheduleNotification(hour, minute, ampm, editTaskName),
  };
  setAlarms([...alarms, newAlarm]);
  clearInputFields();
  storeAlarms([...alarms, newAlarm]);
}

async function removeAlarm(id, alarms, setAlarms, storeAlarms) {
  await Notifications.cancelScheduledNotificationAsync(id);
  const updatedAlarms = alarms.filter((alarm) => alarm.id !== id);
  setAlarms(updatedAlarms);
  storeAlarms(updatedAlarms);
}

async function storeAlarms(alarms) {
  try {
    await AsyncStorage.setItem("alarms", JSON.stringify(alarms));
  } catch (e) {
    console.log(e);
  }
}

async function getData(setAlarms) {
  try {
    const alarmsData = await AsyncStorage.getItem("alarms");
    if (alarmsData) {
      setAlarms(JSON.parse(alarmsData));
    }
  } catch (e) {
    console.log(e);
  }
}

function clearInputFields(setHour, setMinute, setAmpm) {
  setHour("");
  setMinute("");
  setAmpm("AM");
}

function editAlarm(id, alarms, setHour, setMinute, setAmpm, setEditId, setEditMode) {
  const alarmToEdit = alarms.find((alarm) => alarm.id === id);
  setHour(alarmToEdit.hour);
  setMinute(alarmToEdit.minute);
  setAmpm(alarmToEdit.ampm);
  setEditId(id);
  setEditMode(true);
}

const Alarm = () => {
  const notificationListener = useRef();
  const [alarms, setAlarms] = useState([]);
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [ampm, setAmpm] = useState("AM");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");
  const [sound, setSound] = useState(null);

  useEffect(() => {
    getData(setAlarms);
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      if (notification.request.content.title === "Alarm") {
        playAlarmSound();
      }
    });
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
    };
  }, []);

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
      <Pressable style={styles.button} onPress={() => addAlarm(hour, minute, ampm, editMode, editId, alarms, setAlarms, () => clearInputFields(setHour, setMinute, setAmpm), storeAlarms)}>
        <Text style={styles.buttonText}>{editMode ? "Update Alarm" : "Add Alarm"}</Text>
      </Pressable>
      {alarms.map((alarm) => (
        <View key={alarm.id} style={styles.alarm}>
          <Text>{`${alarm.hour}:${alarm.minute} ${alarm.ampm}`}</Text>
          <Pressable style={styles.smallButton} onPress={() => editAlarm(alarm.id, alarms, setHour, setMinute, setAmpm, setEditId, setEditMode)}>
            <Text style={styles.buttonText}>Edit</Text>
          </Pressable>
          <Pressable style={styles.smallButton} onPress={() => removeAlarm(alarm.id, alarms, setAlarms, storeAlarms)}>
            <Text style={styles.buttonText}>Remove</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

export { taskNotification, scheduleNotification, removeAlarm, storeAlarms, getData };

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
