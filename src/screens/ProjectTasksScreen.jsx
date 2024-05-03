import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from "react-native";
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

  React.useEffect(() => {
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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleSaveTask = async (newTask) => {
    try {
      await firestore.collection(`projects/${projectId}/tasks`).add(newTask);
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

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      await firestore.collection(`projects/${projectId}/tasks`).doc(taskId).update({ status: newStatus });
      setTasks((prevTasks) =>
        prevTasks.map(task => task.id === taskId ? { ...task, status: newStatus } : task)
      );
    } catch (error) {
      console.error("Error toggling task status:", error);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>Project Tasks</Text>
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleTaskStatus(item.id, item.status)}>
            <ProjectTask
              assignedTo={item.assignedTo}
              taskName={item.taskName}
              description={item.description}
              time={item.time}
              date={item.date}
              deleteTask={() => deleteTask(item.id)}
              toggleTaskStatus={() => toggleTaskStatus(item.id, item.status)}
              taskId={item.id}
              status={item.status}
            />
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
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
});

export default ProjectTasksScreen;
