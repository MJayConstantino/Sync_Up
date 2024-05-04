import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, RefreshControl } from "react-native"; // Import TouchableOpacity
import { firebase } from '../../firebase-config';
import Project from "../components/Projects/Project";
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

const firestore = firebase.firestore();

const ProjectsScreen = () => {
  const [projects, setProjects] = useState([]);
  const navigation = useNavigation(); // Initialize navigation
  const [refreshing, setRefreshing] = React.useState(false);
  const [projectAdded, setprojectAdded] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = firebase.auth().currentUser;
        const projectsSnapshot = await firestore.collection("projects").where("collaborators", "array-contains", user.uid).get();
        const createdByProjectsSnapshot = await firestore.collection("projects").where("createdBy", "==", user.uid).get();
        const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const createdByProjectsData = createdByProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const allProjectsData = [...projectsData, ...createdByProjectsData];

        // Fetch tasks for each project
        const projectsWithTasks = await Promise.all(allProjectsData.map(async project => {
          const tasksSnapshot = await firestore.collection(`projects/${project.id}/tasks`).get();
          const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return { ...project, tasks: tasksData };
        }));

        setProjects(projectsWithTasks);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
  
    fetchProjects();
  }, [projectAdded]);

  // Function to navigate to ProjectTasksScreen
  const handleProjectPress = (projectId) => {
    navigation.navigate('ProjectTasksScreen', { projectId: projectId });
  };

  // Function to handle adding a new project
  const handleAddProject = () => {
    navigation.navigate('CreateProjectScreen');
  };
  

  return (
    <View style={styles.container}>
      <ScrollView 
       refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <Text style={styles.header}>Projects</Text>
        {projects.map(project => (
          <TouchableOpacity key={project.id} onPress={() => handleProjectPress(project.id)}>
            <Project
              projectName={project.projectName}
              // groupImage="group_image_url" // Replace with actual image URL if available
              deadline={project.deadline}
              progress={calculateProgress(project.tasks)} // Pass progress if available
              collaborators={project.collaborators}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Add project button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddProject}>
        <Text style={styles.addButtonText}>Add Project</Text>
      </TouchableOpacity>
    </View>
  );
};

// Function to calculate progress based on tasks
const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;

  const completedTasks = tasks.filter(task => task.status === 'completed');
  return (completedTasks.length / tasks.length) * 100;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: 'rgba(0, 0, 255, 0.7)', // Slightly lighter blue color
    width: '80%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center', // Center the button horizontally
    borderRadius: 10, // Add border radius
    marginBottom: 20, // Add bottom margin
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProjectsScreen;
