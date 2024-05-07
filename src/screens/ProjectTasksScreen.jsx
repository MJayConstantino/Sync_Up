import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { firebase } from '../../firebase-config';
import ProjectTask from '../components/Projects/ProjectTask';
import { useNavigation } from '@react-navigation/native';
import AddProjectTaskModal from "../components/Projects/AddProjectTask";

const firestore = firebase.firestore();

const ProjectTasksScreen = ({ route }) => {
  const { projectId } = route.params;
  const [tasks, setTasks] = useState([]);
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [taskAdded, setTaskAdded] = React.useState(false);
  const [loading, setLoading] = useState(true);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksSnapshot = await firestore
          .collection(`projects/${projectId}/tasks`)
          .orderBy("isCompleted", "asc")
          .orderBy("createdAt", "desc")
          .get();
        const tasksData = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId, taskAdded]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleProjectTaskPress = (projectId, item) => {
    navigation.navigate('EditProjectTaskScreen', { projectId: projectId, taskId: item.id });
  };

  const handleSaveTask = async (newTask) => {
    try {
      await firestore.collection(`projects/${projectId}/tasks`).add(newTask);
      setTaskAdded()
      handleCloseModal();
      
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await firestore.collection(`projects/${projectId}/tasks`).doc(taskId).delete();
      setTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleCompleted = async (taskId, completed) => {
    try {
      const status = completed? false : true;
      await firestore.collection(`projects/${projectId}/tasks`).doc(taskId).update({ isCompleted: status });
      setTasks((prevTasks) =>
        prevTasks.map(task => task.id === taskId ? { ...task, completed: status } : task)
      );
    } catch (error) {
      console.error("Error toggling task status:", error);
    }
  };
  
  if (loading) {
    return (
      <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="#00adf5" size="large" />
    )
  } else return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>Project Tasks</Text>
      </View>
      {tasks.length === 0 ? (
        <Text style={styles.noTasksText}>No pending tasks. Create one and assign it to a collaborator.</Text>
      ) : (
        <FlatList
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          data={tasks}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleProjectTaskPress(projectId, item)}>
              <ProjectTask
                assignedTo={item.assignedTo}
                taskName={item.taskName}
                description={item.description}
                time={item.time}
                date={item.date}
                deleteTask={() => deleteTask(item.id)}
                toggleCompleted={() => toggleCompleted(item.id, item.isCompleted)}
                taskId={item.id}
                isCompleted={item.isCompleted}
              />
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
        />
      )}
      <TouchableOpacity style={styles.addButton} onPress={handleOpenModal}>
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>
      <AddProjectTaskModal
        isVisible={isModalVisible}
        onDismiss={handleCloseModal}
        onSave={handleSaveTask}
        projectId={projectId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'blue',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTasksText: {
    textAlign: 'center',
    fontSize: 16,
  },
});

export default ProjectTasksScreen;
