import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Pressable, TextInput, FlatList } from "react-native";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import { LogBox } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

LogBox.ignoreLogs(["new NativeEventEmitter"]);
LogBox.ignoreAllLogs();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowAlert: true,
    shouldSetBadge: false,
  }),
});

export default function AlarmClock() {
  const notificationListener = useRef();
  const [notifications, setNotifications] = useState([]);
  const [hourr, setHour] = useState("");
  const [minutee, setMinute] = useState("");
  const [ampm, setAmpm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [sound, setSound] = useState();

  useEffect(() => {
    loadSound();
    getData();
    notificationListener.current = Notifications.addNotificationResponseReceivedListener((notification) => {
      setNotifications((prevNotifications) => [...prevNotifications, notification]);
      playSound();
    });
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
    };
  }, []);

  const loadSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/sounds/alarm.mp3")
    );
    setSound(sound);
  };

  const playSound = async () => {
    if (sound) {
      await sound.playAsync();
    }
  };

  async function scheduleOrUpdateNotification(hour, minute, ampm) {
    const newHour = parseInt(hour) + (ampm === "pm" ? 12 : 0);
    if (editingId !== null) {
      await Notifications.cancelScheduledNotificationAsync(editingId);
    }
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Alarm",
        body: "It is time to wake up!",
        data: { data: "Your morning alarm data" },
      },
      trigger: {
        hour: newHour,
        minute: parseInt(minute),
        repeats: true,
      },
    });
    const newNotification = { id: identifier, hour: newHour, minute: parseInt(minute), ampm };
    setNotifications((prevNotifications) => [...prevNotifications, newNotification]);
    setEditingId(null);
    storeData([...notifications, newNotification]);
  }

  function editAlarm(id, hour, minute, ampm) {
    setHour(hour.toString());
    setMinute(minute.toString());
    setAmpm(ampm);
    setEditingId(id);
  }

  async function deleteNotificationHandler(id) {
    // Cancel the scheduled notification
    await Notifications.cancelScheduledNotificationAsync(id);
  
    // Remove the deleted alarm from the notifications state
    const updatedNotifications = notifications.filter((notification) => notification.id !== id);
    setNotifications(updatedNotifications);
  
    // Update AsyncStorage with the updated list of alarms
    try {
      await AsyncStorage.setItem("currentAlarms", JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error("Error updating AsyncStorage:", error);
    }
  }
  

  async function storeData(data) {
    try {
      await AsyncStorage.setItem("currentAlarms", JSON.stringify(data));
    } catch (e) {
      alert(e);
    }
  }

  async function getData() {
    try {
      const data = await AsyncStorage.getItem("currentAlarms");
      if (data) {
        setNotifications(JSON.parse(data));
      }
    } catch (e) {
      alert(e);
    }
  }

  const renderAlarmItem = ({ item }) => (
    <View style={styles.alarmItem}>
      <Text>{`${item.hour}:${item.minute < 10 ? '0' : ''}${item.minute} ${item.ampm}`}</Text>
      <Pressable onPress={() => editAlarm(item.id, item.hour, item.minute, item.ampm)}>
        <Text style={styles.editButton}>Edit</Text>
      </Pressable>
      <Pressable onPress={() => deleteNotificationHandler(item.id)}>
        <Text style={styles.deleteButton}>Delete</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alarms</Text>
      </View>
      <TextInput
        style={styles.textInput}
        placeholder="Enter hour"
        value={hourr}
        onChangeText={(text) => setHour(text)}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Enter minute"
        value={minutee}
        onChangeText={(text) => setMinute(text)}
      />
      <TextInput
        style={styles.textInput}
        placeholder="Enter am or pm"
        value={ampm}
        onChangeText={(text) => setAmpm(text)}
      />
      <Pressable style={styles.button} onPress={() => scheduleOrUpdateNotification(hourr, minutee, ampm)}>
        <Text style={styles.buttonText}>Set Alarm</Text>
      </Pressable>
      <FlatList
        data={notifications}
        renderItem={renderAlarmItem}
        keyExtractor={(item) => item.id} // Assuming notifications have an id property
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 12,
  },
  button: {
    width: "70%",
    backgroundColor: "blue",
    borderRadius: 18,
    margin: 15,
    padding: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 35,
    fontWeight: "bold",
  },
  textInput: {
    fontSize: 30,
    margin: 5,
  },
  alarmItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    marginVertical: 5,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
  },
  editButton: {
    color: "green",
    fontSize: 18,
    marginRight: 10,
  },
  deleteButton: {
    color: "red",
    fontSize: 18,
  },
});
