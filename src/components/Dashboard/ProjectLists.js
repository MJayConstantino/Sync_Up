import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { firebase } from '../../../firebase-config';
import { useNavigation } from '@react-navigation/native';

const ProjectList = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    const unsubscribe = firebase.firestore()
      .collection('projects')
      .where('collaborators', 'array-contains', currentUser.uid)
      .onSnapshot((snapshot) => {
        const fetchedProjects = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          tasksCount: (doc.data().tasks || []).filter((task) => task.assignedTo.includes(currentUser.uid)).length,
        }));
        setProjects(fetchedProjects);
      });
    return () => unsubscribe();
  }, [currentUser.uid]);

  const calculateProgress = (project) => {
    const totalTasks = (project.tasks || []).length;
    const completedTasks = (project.tasks || []).filter((task) => task.isCompleted).length;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  };

  const getPendingTasksCount = (project) => {
    const pendingTasks = (project.tasks || []).filter((task) => !task.isCompleted);
    return pendingTasks.length;
  };

  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.projectListContainer}>
      {projects.map((project) => (
        <TouchableOpacity
          key={project.id}
          onPress={() => navigation.navigate('ProjectDetails', { projectId: project.id })}
          style={styles.projectCard}
        >
          <Text style={styles.projectName}>{project.projectName}</Text>
          <Text style={styles.projectProgress}>Progress: {calculateProgress(project)}%</Text>
          <Text style={styles.projectTasks}>Pending Tasks: {getPendingTasksCount(project)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
  
const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 20,
    marginRight: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemCountContainer: {
    backgroundColor: 'blue', // Change to your desired color
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 5, // Adjust spacing
  },
  itemCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  projectListContainer: {
    height: 200,
  },
  projectCard: {
    backgroundColor: 'red', // Change the background color to red
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    width: 250,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  projectName: {
    fontSize: 20, // Increase font size
    fontWeight: 'bold',
    marginBottom: 10, // Increase margin for spacing
    color: 'white', // Set text color to white for better visibility
  },
  projectProgress: {
    fontSize: 16, // Increase font size
    marginBottom: 10, // Increase margin for spacing
    color: 'white', // Set text color to white for better visibility
  },
  projectTasks: {
    fontSize: 16, // Increase font size
    fontWeight: 'bold',
    marginBottom: 10, // Increase margin for spacing
    color: 'white', // Set text color to white for better visibility
  },
});

export default ProjectList;