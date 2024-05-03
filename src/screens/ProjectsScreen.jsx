import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native"; // Import TouchableOpacity
import { firebase } from '../../firebase-config';
import Project from "../components/Projects/Project";
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

const firestore = firebase.firestore();

const ProjectsScreen = () => {
  const [projects, setProjects] = useState([]);
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = firebase.auth().currentUser;
        const projectsSnapshot = await firestore.collection("projects").where("collaborators", "array-contains", user.uid).get();
        const createdByProjectsSnapshot = await firestore.collection("projects").where("createdBy", "==", user.uid).get();
        const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const createdByProjectsData = createdByProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const allProjectsData = [...projectsData, ...createdByProjectsData];
        setProjects(allProjectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
  
    fetchProjects();
  }, []);

  // Function to navigate to ProjectTasksScreen
  const handleProjectPress = (projectId) => {
    navigation.navigate('ProjectTasksScreen', { projectId: projectId });
  };
  

  return (
    <View style={styles.container}>
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
});

export default ProjectsScreen;
