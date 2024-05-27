import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Image } from "react-native";
import { firebase } from '../../firebase-config';
import Project from "../components/Projects/Project";
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';

const firestore = firebase.firestore();

const ProjectsScreen = () => {
  const [projects, setProjects] = useState([]);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const unsubscribe = firestore.collection("projects")
      .onSnapshot(snapshot => {
        const user = firebase.auth().currentUser;
        const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filteredProjects = projectsData.filter(project => project.collaborators.includes(user.uid));
        fetchProjectTasks(filteredProjects);
      });

    return () => unsubscribe();
  }, []);

  const fetchProjectTasks = async (projectsData) => {
    try {
      const projectsWithTasks = await Promise.all(projectsData.map(async project => {
        const tasksSnapshot = await firestore.collection(`projects/${project.id}/tasks`).get();
        const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { ...project, tasks: tasksData };
      }));
      setProjects(projectsWithTasks);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
    }
  };

  const handleProjectPress = (projectId) => {
    navigation.navigate('ProjectTasksScreen', { projectId: projectId });
  };

  const handleAddProject = () => {
    navigation.navigate('CreateProjectScreen');
  };

  const deleteProject = async (projectId) => {
    try {
      await firestore.collection("projects").doc(projectId).delete();
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const renderRightActions = (projectId) => (
    <View style={styles.rightActions}>
      <TouchableOpacity onPress={() => navigation.navigate('EditProjectScreen', { projectId: projectId })} style={[styles.actionButton, styles.editButton]}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteProject(projectId)} style={[styles.actionButton, styles.deleteButton]}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
  

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
          <>
            <Image
              source={require('../assets/gifs/cutiehaha.gif')}
              style={{
                width: 150,
                height: 150,
                alignSelf: "center",
                marginVertical: 20,
              }}
            />
            <Text style={styles.noProjectsText}>
              No projects and collaborations. Press 'Add Project' to create one or become a collaborator.
            </Text>
          </>
        ) : (
          projects.map(project => (
            <Swipeable key={project.id} renderRightActions={() => renderRightActions(project.id)}>  
            <TouchableOpacity key={project.id} onPress={() => handleProjectPress(project.id)}>
              <Project
                projectName={project.projectName}
                deadline={project.deadline}
                progress={calculateProgress(project.tasks)}
                collaborators={project.collaborators}
              />
            </TouchableOpacity>
          </Swipeable>
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

  const completedTasks = tasks.filter(task => task.isCompleted === true);
  return (completedTasks.length / tasks.length) * 100;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50
  },
  header: {
    fontSize: 30,
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
    marginTop: 15,
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 10,
  },
  rightActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '85%',
    borderRadius: 20,
    marginLeft: 20,
    marginVertical: 20
  },
  deleteButton: {
    backgroundColor: 'pink',
  },
  editButton: {
    backgroundColor: 'lightblue',
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProjectsScreen;

