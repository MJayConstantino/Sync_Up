import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { firebase } from '../../firebase-config';
import TaskCard from '../components/Dashboard/TasksCard';
import ScheduleCard from '../components/Dashboard/ScheduleCard';
import ScheduleTaskCard from '../components/Dashboard/ScheduleTaskCard';
import ClassScheduleCard from '../components/Dashboard/ClassScheduleCard';
import ProjectCard from '../components/Dashboard/ProjectCard';

const DashboardScreen = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const snapshot = await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get();
        if (snapshot.exists) {
          setName(snapshot.data().firstName);
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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  if (loading) {
    return (
      <ActivityIndicator style={{ flex: 1, justifyContent: "center", alignItems: "center" }} color="00adf5" size="large" />
    )
  } else return (
    <View style={styles.container}>
      <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {name}</Text>
        <Text style={styles.subgreeting}>Let's see what's in store for you today..</Text>
      </View>
      
        {/* Schedule Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Schedules</Text>
        </View>
        <View style={[styles.scheduleContainer, { paddingHorizontal: 10 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 10 }}>
            <ScheduleCard title="Today's Events" date={getCurrentDate()} />
            <ScheduleTaskCard title="Today's Tasks" date={getCurrentDate()} />
            <ClassScheduleCard title="Today's Classes" date={getCurrentDate()} />
          </ScrollView>
        </View>

        {/* Tasks Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Tasks</Text>
        </View>
        <View style={styles.taskContainer}>
          <TaskCard title="Pending Tasks" isCompleted={false} />
          <TaskCard title="Completed Tasks" isCompleted={true} />
        </View>

        {/* Projects Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Projects</Text>
        </View>
        <ProjectCard title="Current Projects" date={getCurrentDate()}/>
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
    paddingTop: 25,
    paddingHorizontal: 10
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
    marginBottom: 20,
  }
});

export default DashboardScreen;
