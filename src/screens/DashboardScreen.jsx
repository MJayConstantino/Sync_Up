import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { firebase } from '../../firebase-config';
import { useNavigation } from '@react-navigation/native';
import TaskCard from '../components/Dashboard/TasksCard';
import ScheduleCard from '../components/Dashboard/ScheduleCard';
import ScheduleTaskCard from '../components/Dashboard/ScheduleTaskCard';
import ClassScheduleCard from '../components/Dashboard/ClassScheduleCard';
import ProjectCard from '../components/Dashboard/ProjectCard';
import ProjectList from '../components/Dashboard/ProjectLists';

const DEFAULT_PROFILE_PIC = "https://firebasestorage.googleapis.com/v0/b/syncup-4b36a.appspot.com/o/profilepic.png?alt=media&token=4f9acff6-166b-4e21-9ac8-42bc5f441e63";

const DashboardScreen = () => {
  const [name, setName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(DEFAULT_PROFILE_PIC);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setName(userData.firstName);
          setProfileImageUrl(userData.imageUrl || DEFAULT_PROFILE_PIC);
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


  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  if (loading) {
    return (
      <ActivityIndicator style={{ flex: 1, justifyContent: "center", alignItems: "center" }} color="00adf5" size="large" />
    );
  } else   return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Image
            source={{ uri: profileImageUrl }}
            style={styles.profileImage}
          />
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hello, {name}</Text>
            <Text style={styles.subgreeting} numberOfLines={2} adjustsFontSizeToFit>
              Let's see what's in store for you today..
            </Text>
          </View>
        </View>
        {/* Schedule Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Schedules</Text>
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View style={styles.scheduleContainer}>
          <ScheduleCard
            title="Today's Events"
            date={getCurrentDate()}
            onPress={() => navigation.navigate('Schedule', { params: { filter: 'Events' } })}
          />
          <ScheduleTaskCard
            title="Today's Tasks"
            date={getCurrentDate()}
            onPress={() => navigation.navigate('Schedule', { params: { filter: 'Tasks' } })}
          />
          <ClassScheduleCard
            title="Today's Classes"
            date={getCurrentDate()}
            onPress={() => navigation.navigate('Schedule', { params: { filter: 'ClassSchedules' } })}
          />
          </View>
        </ScrollView>

        {/* This Week's and Next Week's Events */}
        {/* <View style={styles.rowContainer}>
          <TouchableOpacity style={styles.smallCardContainer} onPress={() => navigation.navigate('Schedule')}>
            <ThisWeekEventsCard />
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallCardContainer} onPress={() => navigation.navigate('Schedule')}>
            <NextWeekEventsCard />
          </TouchableOpacity>
        </View>

        {/* This Month's and Next Month's Events */}
        {/* <View style={styles.rowContainer}>
          <TouchableOpacity style={styles.smallCardContainer} onPress={() => navigation.navigate('Schedule')}>
            <ThisMonthEventsCard />
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallCardContainer} onPress={() => navigation.navigate('Schedule')}>
            <NextMonthEventsCard />
          </TouchableOpacity>
        </View> */}

        {/* Tasks Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Tasks</Text>
        </View>
        <View style={styles.taskContainer}>
          <TaskCard title="Pending Tasks" isCompleted={false} onPress={() => navigation.navigate('Tasks')} />
          <TaskCard title="Completed Tasks" isCompleted={true} onPress={() => navigation.navigate('Tasks')} />
        </View>

        {/* Projects Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Projects</Text>
        </View>
        <View style={styles.projectsContainer}>
          <ProjectCard title="Current Projects" onPress={() => navigation.navigate('Projects')} />
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.projectListContainer}>
            {/* Render ProjectList component here */}
            <ProjectList />
          </ScrollView>
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
    paddingTop: 25,
    paddingHorizontal: 10
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 10,
  },
  greetingContainer: {
    flexDirection: 'column',
    flex: 1, // This allows the greeting container to take the remaining space
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B98FF',
  },
  subgreeting: {
    fontSize: 16, // Smaller size to fit
    fontWeight: 'normal',
    color: '#333333',
    flexShrink: 1, // Prevents overflow
    textAlign: 'left', // Aligns text to the start
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
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scheduleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  smallCardContainer: {
    width: '45%', // Adjust the width to fit two cards in a row
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.3,
  },
  projectsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    maxHeight: 200, // Set a maximum height to enable scrolling
  },
});

export default DashboardScreen;
