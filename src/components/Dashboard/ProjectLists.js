import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { firebase } from '../../../firebase-config';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons'; 


const ProjectList = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const currentUser = firebase.auth().currentUser;

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('projects')
      .where('collaborators', 'array-contains', currentUser.uid)
      .onSnapshot((snapshot) => {
        const fetchedProjects = snapshot.docs.map((doc) => {
          const projectData = doc.data();
          return {
            id: doc.id,
            ...projectData,
            tasks: [],
            progress: 0,
          };
        });
        setProjects(fetchedProjects);
      });

    const fetchTasksAndUpdateProgress = async () => {
      const updatedProjects = await Promise.all(
        projects.map(async (project) => {
          const tasksSnapshot = await firebase
            .firestore()
            .collection(`projects/${project.id}/tasks`)
            .get();
          const tasks = tasksSnapshot.docs.map((taskDoc) => taskDoc.data());
          const completedTasks = tasks.filter((task) => task.isCompleted).length;
          const totalTasks = tasks.length;
          const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          return { ...project, tasks, progress: progress.toFixed(2) };
        })
      );
      setProjects(updatedProjects);
    };

    fetchTasksAndUpdateProgress();

    const tasksUnsubscribes = projects.map((project) =>
      firebase
        .firestore()
        .collection(`projects/${project.id}/tasks`)
        .onSnapshot(() => {
          fetchTasksAndUpdateProgress();
        })
    );

    return () => {
      unsubscribe();

      tasksUnsubscribes.forEach((unsubscribe) => unsubscribe());
    };
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
          onPress={() => navigation.navigate('ProjectTasksScreen', { projectId: project.id })}
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
    backgroundColor: '#4B98FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 5, 
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
    backgroundColor: '#4B98FF', 
    borderRadius: 10,
    padding: 8,
    marginRight: 10,
    width: 150, 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  projectName: {
    fontSize: 16, 
    fontWeight: 'bold',
    marginBottom: 5, 
    color: 'white',
  },
  projectProgress: {
    fontSize: 14,
    marginBottom: 5, 
    color: 'white',
  },
  projectTasks: {
    fontSize: 14, 
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'white',
  },
});

export default ProjectList;
