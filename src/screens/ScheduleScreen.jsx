import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { firebase } from '../../firebase-config';
import Schedule from '../components/Schedules/Schedule';
import TaskSchedule from '../components/Schedules/TaskSchedule';
import AddScheduleModal from '../components/Schedules/AddSchedule';
import ClassSchedule from '../components/Schedules/ClassSchedule';
import { getDayOfYear, startOfISOWeek } from 'date-fns';

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
        const classSchedulesSnapshot = await firestore.collection(`users/${currentUser.uid}/classSchedules`).get();
        
        const schedules = schedulesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), type: 'schedule' }));
        const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), type: 'task' }));
        const classSchedules = classSchedulesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), type: 'classSchedule' }));

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

        classSchedules.forEach(classSchedule => {
          const day = classSchedule.day; // Assuming day is a string like 'Monday', 'Tuesday', etc.
          const occurrences = getOccurrencesOfYear(day);
          occurrences.forEach(date => {
            if (!combinedItems[date]) {
              combinedItems[date] = [];
            }
            combinedItems[date].push(classSchedule);
          });
        });

        setItems(combinedItems);
      } catch (error) {
        console.error("Error fetching schedules and tasks:", error);
      }
    };

    fetchSchedulesAndTasks();
  }, [currentUser.uid]);

  const getOccurrencesOfYear = (dayOfWeek) => {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset() * 60000; // Offset in milliseconds
    const todayUtc = new Date(today.getTime() - timezoneOffset); // Convert to UTC
  
    const dayOfWeekIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(dayOfWeek);
    const firstDayOfWeek = startOfISOWeek(todayUtc);
    const occurrences = [];
  
    for (let i = 0; i < 7; i++) {
      const occurrenceDate = new Date(firstDayOfWeek);
      occurrenceDate.setDate(occurrenceDate.getDate() + i); // Move to the next day
      if (occurrenceDate.getDay() === dayOfWeekIndex) {
        occurrences.push(occurrenceDate.toISOString().split('T')[0]);
        break; // Stop iteration once we find the occurrence for the given day
      }
    }
  
    return occurrences;
  };

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
        <TouchableOpacity onPress={() => handleClassSchedulePress(item)}>
          <ClassSchedule {...item} />
        </TouchableOpacity>
      );
    }
  };

  const handleSchedulePress = (item) => {
    navigation.navigate('EditScheduleScreen', { scheduleId: item.id });
  };

  const handleTaskPress = (item) => {
    navigation.navigate('EditTaskScreen', { taskId: item.id });
  };

  const handleClassSchedulePress = (item) => {
    navigation.navigate('EditClassScheduleScreen', { classScheduleId: item.id });
  };

  return (
    <View style={styles.container}>
      <Agenda
        items={items}
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
