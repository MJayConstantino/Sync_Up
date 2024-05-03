import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { firebase } from '../../firebase-config';
import ProjectTask from '../components/Projects/ProjectTask'; // Import the ProjectTask component

const firestore = firebase.firestore();

const ProjectTasksScreen = ({ route }) => {
  const { projectId } = route.params;
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Fetch tasks for the project from Firestore
    const fetchTasks = async () => {
      try {
        const tasksSnapshot = await firestore.collection(`projects/${projectId}/tasks`).get();
        const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [projectId]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Project Tasks</Text>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          // Render each task as a ProjectTask component
          <ProjectTask
            assignedTo={item.assignedTo}
            taskName={item.name}
            description={item.description}
            time={item.time}
            date={item.date}
            deleteTask={() => {}}
            toggleTaskStatus={() => {}}
            taskId={item.id}
            status={item.status}
          />
        )}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default ProjectTasksScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
