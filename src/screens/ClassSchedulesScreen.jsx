import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SectionList, ActivityIndicator } from 'react-native';
import { firebase } from '../../firebase-config';
import ClassSchedule from '../components/Schedules/ClassSchedule';

const firestore = firebase.firestore();

const ClassScheduleScreen = ({ navigation }) => {
  const [classSchedules, setClassSchedules] = useState([]);
  const currentUser = firebase.auth().currentUser;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassSchedules = async () => {
      try {
        const snapshotClassSchedules = await firestore
          .collection(`users/${currentUser.uid}/classSchedules`)
          .orderBy("timeValue", "asc")
          .get();
        const fetchedClassSchedules = snapshotClassSchedules.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: 'classSchedule',
        }));
        setClassSchedules(fetchedClassSchedules);
      } catch (error) {
        console.error('Error fetching class schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassSchedules();
  }, [currentUser.uid]);

  const handleClassSchedulePress = (classSchedule) => {
    navigation.navigate('EditClassScheduleScreen', { classScheduleId: classSchedule.id });
  };

  const groupClassSchedulesByDay = () => {
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'TBA'];
    const groupedData = {};
    classSchedules.forEach((classSchedule) => {
      const day = classSchedule.day;
      if (!groupedData[day]) {
        groupedData[day] = [];
      }
      groupedData[day].push(classSchedule);
    });
    const sortedData = daysOrder.map((day) => ({
      title: day,
      data: groupedData[day] || [],
    }));
    return sortedData.filter((section) => section.data.length > 0 || section.title === 'TBA');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleClassSchedulePress(item)}>
      <ClassSchedule {...item} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title, data } }) => (
    <View>
      <Text style={styles.sectionHeader}>{title}</Text>
      {data.length === 0 && title !== 'TBA' && (
        <Text style={styles.noClassesText}>No scheduled classes for this day.</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="blue" size="large" />
    )
  } else return (
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
  noClassesText: {
    fontSize: 16,
    color: '#777',
    paddingTop: 8, // or adjust as needed to align with your design
  },
});

export default ClassScheduleScreen;