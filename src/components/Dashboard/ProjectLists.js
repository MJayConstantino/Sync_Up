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
      .onSnapshot(async (snapshot) => {
        const fetchedProjects = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const projectData = doc.data();
            const tasksSnapshot = await firebase.firestore().collection(`projects/${doc.id}/tasks`).get();
            const tasks = tasksSnapshot.docs.map((taskDoc) => taskDoc.data());
            const completedTasks = tasks.filter((task) => task.isCompleted).length;
            const totalTasks = tasks.length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return {
              id: doc.id,
              ...projectData,
              tasks,
              progress: progress.toFixed(2),
            };
          })
        );
        setProjects(fetchedProjects);
      });
    return () => unsubscribe();
  }, [currentUser.uid]);

  const getPendingTasksCount = (project) => {
    const pendingTasks = (project.tasks || []).filter((task) => !task.isCompleted);
    return pendingTasks.length;
  };

  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.projectListContainer}>
      {projects.map((project) => (
        <TouchableOpacity
          key={project.id}
          onPress={() => navigation.navigate('Projects', { projectId: project.id })}
          style={styles.projectCard}
        >
          <Text style={styles.projectName}>{project.projectName}</Text>
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
    height: 200, // Reduced height
  },
  projectCard: {
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 8, // Reduced padding
    marginRight: 10,
    width: 200, // Reduced width
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectName: {
    fontSize: 16, // Reduced font size
    fontWeight: 'bold',
    marginBottom: 5, // Reduced margin
    color: 'white',
  },
  projectProgress: {
    fontSize: 14, // Reduced font size
    marginBottom: 5, // Reduced margin
    color: 'white',
  },
  projectTasks: {
    fontSize: 14, // Reduced font size
    fontWeight: 'bold',
    marginBottom: 5, // Reduced margin
    color: 'white',
  },
});

export default ProjectList;