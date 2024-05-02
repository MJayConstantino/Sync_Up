import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { firebase } from '../../firebase-config';
import TaskCard from '../components/Dashboard/TasksCard'; // Corrected import path for TaskCard
import { ScheduleCard, ScheduleTaskCard } from '../components/Dashboard/ScheduleCard'; // Importing ScheduleCard and TaskCard components

const DashboardScreen = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const snapshot = await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get();
        if (snapshot.exists) {
          setName(snapshot.data().firstName); // Updated to get the firstName directly
        } else {
          console.log('User does not exist');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {name}</Text>
        <Text style={styles.subgreeting}>Let's see what's in store for you today..</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Tasks</Text>
        </View>
        <View style={styles.taskContainer}>
          <TaskCard title="Unfinished Tasks" status="not finished" />
          <TaskCard title="Finished Tasks" status="finished" />
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Schedule</Text>
        </View>
        <View style={styles.scheduleContainer}>
        <ScheduleCard title="Today's Events" date={getCurrentDate()} />
        <ScheduleTaskCard title="Today's Tasks" date={getCurrentDate()} />
        </View>
      </ScrollView>
    </View>
  );
};

// Function to get the current date in the format YYYY-MM-DD
const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    marginTop: 50
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#4B98FF',
  },
  subgreeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  sectionHeader: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scheduleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  }
});

export default DashboardScreen;
