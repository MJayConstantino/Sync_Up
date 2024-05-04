import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SectionList } from 'react-native';
import { firebase } from '../../firebase-config';
import ClassSchedule from '../components/Schedules/ClassSchedule';

const firestore = firebase.firestore();

const ClassScheduleScreen = ({ navigation }) => {
  const [classSchedules, setClassSchedules] = useState([]);
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    const fetchClassSchedules = async () => {
      try {
        const snapshotClassSchedules = await firestore
          .collection(`users/${currentUser.uid}/classSchedules`)
          .get();
        const fetchedClassSchedules = snapshotClassSchedules.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: 'classSchedule',
        }));
        setClassSchedules(fetchedClassSchedules);
      } catch (error) {
        console.error('Error fetching class schedules:', error);
      }
    };

    fetchClassSchedules();
  }, [currentUser.uid]);

  const handleClassSchedulePress = (classSchedule) => {
    navigation.navigate('EditClassScheduleScreen', { classScheduleId: classSchedule.id });
  };

  const groupClassSchedulesByDay = () => {
    const groupedData = {};

    classSchedules.forEach((classSchedule) => {
      const day = classSchedule.day;
      if (!groupedData[day]) {
        groupedData[day] = [];
      }
      groupedData[day].push(classSchedule);
    });

    return Object.entries(groupedData).map(([day, schedules]) => ({
      title: day,
      data: schedules,
    }));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleClassSchedulePress(item)}>
      <ClassSchedule {...item} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Class Schedules</Text>
      <SectionList
        sections={groupClassSchedulesByDay()}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 8,
  },
});

export default ClassScheduleScreen;