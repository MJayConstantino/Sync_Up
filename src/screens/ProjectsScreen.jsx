import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { firebase } from '../../firebase-config';
import Project from "../components/Projects/Project";
import { useNavigation } from '@react-navigation/native';

const firestore = firebase.firestore();

const ProjectsScreen = () => {
  const [projects, setProjects] = useState([]);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [projectAdded, setProjectAdded] = useState(false);
  const [loading, setLoading] = useState(true);

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
        const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const projectsWithTasks = await Promise.all(projectsData.map(async project => {
          const tasksSnapshot = await firestore.collection(`projects/${project.id}/tasks`).get();
          const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          return { ...project, tasks: tasksData };
        }));
        setProjects(projectsWithTasks);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProjects();
  }, [projectAdded]);

  const handleProjectPress = (projectId) => {
    navigation.navigate('ProjectTasksScreen', { projectId: projectId });
  };

  const handleAddProject = () => {
    navigation.navigate('CreateProjectScreen');
  };
  

  if (loading) {
    return (
      <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="#00adf5" size="large" />
    )
  } else return (
    <View style={styles.container}>
      <ScrollView 
       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.header}>Projects</Text>
        {projects.length === 0 ? (
          <Text style={styles.noProjectsText}>No projects and collaborations. Press 'Add Project' to create one or become a collaborator.</Text>
        ) : (
          projects.map(project => (
            <TouchableOpacity key={project.id} onPress={() => handleProjectPress(project.id)}>
              <Project
                projectName={project.projectName}
                deadline={project.deadline}
                progress={calculateProgress(project.tasks)}
                collaborators={project.collaborators}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={handleAddProject}>
        <Text style={styles.addButtonText}>Add Project</Text>
      </TouchableOpacity>
    </View>
  );
};

const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;

  const completedTasks = tasks.filter(task => task.completed === true);
  return (completedTasks.length / tasks.length) * 100;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 25
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: 'rgba(0, 0, 255, 0.7)',
    width: '80%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noProjectsText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
});

export default ProjectsScreen;
