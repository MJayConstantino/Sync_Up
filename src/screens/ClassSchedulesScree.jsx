// ScheduleScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { firebase } from '../../firebase-config';
import Schedule from '../components/Schedules/Schedule';
import TaskSchedule from '../components/Schedules/TaskSchedule';
import AddScheduleModal from '../components/Schedules/AddSchedule';
import ClassSchedule from '../components/Schedules/ClassSchedule';

const firestore = firebase.firestore();

const ScheduleScreen = ({ navigation }) => {
  const [items, setItems] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    const fetchSchedulesAndTasks = async () => {
      try {
        const schedulesSnapshot = await firestore.collection(`users/${currentUser.uid}/schedules`).get();
        const tasksSnapshot = await firestore.collection(`users/${currentUser.uid}/tasks`).get();
        const snapshotclassSchedules = await firestore.collection(`users/${currentUser.uid}/classSchedules`).get();
        const schedules = schedulesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), type: 'schedule' }));
        const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), type: 'task' }));
        const classSchedules = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), type: 'classSchedule' }));
        const combinedItems = {};

        schedules.forEach(schedule => {
          const date = schedule.date;
          if (!combinedItems[date]) {
            combinedItems[date] = [];
          }
          combinedItems[date].push(schedule);
        });

        tasks.forEach(task => {
          const date = task.date;
          if (!combinedItems[date]) {
            combinedItems[date] = [];
          }
          combinedItems[date].push(task);
        });

        setItems(combinedItems);
      } catch (error) {
        console.error("Error fetching schedules and tasks:", error);
      }
    };

    fetchSchedulesAndTasks();
  }, [currentUser.uid]);

  const addNewSchedule = async (newSchedule) => {
    try {
      await firestore.collection(`users/${currentUser.uid}/schedules`).add(newSchedule);
      console.log("Schedule added successfully!");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };

  const renderItem = (item) => {
    if (item.type === 'schedule') {
      return (
        <TouchableOpacity onPress={() => handleSchedulePress(item)}>
          <Schedule {...item} />
        </TouchableOpacity>
      );
    } else if (item.type === 'task') {
      return (
        <TouchableOpacity onPress={() => handleTaskPress(item)}>
          <TaskSchedule {...item} />
        </TouchableOpacity>
      );
    } else if (item.type === 'classSchedule') {
      return (
        <TouchableOpacity onPress={() => handleTaskPress(item)}>
          <TaskSchedule {...item} />
        </TouchableOpacity>
      );
    }
  };

  const loadItems = async (day) => {
    try {
      const date = day.dateString;
      const snapshotSchedules = await firestore.collection(`users/${currentUser.uid}/schedules`).where('date', '==', date).get();
      const schedules = snapshotSchedules.docs.map((doc) => ({ id: doc.id, ...doc.data(), type: 'schedule' }));
      const snapshotTasks = await firestore.collection(`users/${currentUser.uid}/tasks`).where('date', '==', date).get();
      const tasks = snapshotTasks.docs.map((doc) => ({ id: doc.id, ...doc.data(), type: 'task' }));
      const snapshotclassSchedules = await firestore.collection(`users/${currentUser.uid}/classSchedules`).where('day', '==', day).get();
      const classSchedules = snapshot.docs.map((doc) => doc.data());
      const newItems = {
        [date]: [...schedules, ...tasks],
      };
      
      setItems(newItems);
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  const handleSchedulePress = (item) => {
    // Navigate to EditSchedule screen with schedule ID
    navigation.navigate('EditScheduleScreen', { scheduleId: item.id });
  };

  const handleTaskPress = (item) => {
    // Navigate to EditTask screen with task ID
    navigation.navigate('EditTaskScreen', { taskId: item.id });
  };

  const handleClassSchedulePress = (item) => {
    // Navigate to EditTask screen with task ID
    // navigation.navigate('EditTaskScreen', { taskId: item.id });
    console.log('ehe')
  };

  return (
    <View style={styles.container}>
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        renderItem={renderItem}
        // Other Agenda props
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Schedule</Text>
      </TouchableOpacity>

      <AddScheduleModal 
        isVisible={isModalVisible} 
        onDismiss={() => setIsModalVisible(false)} 
        onSave={addNewSchedule} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#00adf5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default ScheduleScreen;
