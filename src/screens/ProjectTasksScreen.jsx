import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { firebase } from '../../firebase-config';
import ProjectTask from '../components/Projects/ProjectTask';
import { useNavigation } from '@react-navigation/native';
import AddProjectTaskModal from "../components/Projects/AddProjectTask";
import { Swipeable } from 'react-native-gesture-handler';


const firestore = firebase.firestore();

const ProjectTasksScreen = ({ route }) => {
  const { projectId } = route.params;
  const [tasks, setTasks] = useState([]);
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [taskAdded, setTaskAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const unsubscribe = firestore.collection(`projects/${projectId}/tasks`)
      .onSnapshot(snapshot => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(tasksData);
        setLoading(false);
      });

    return () => unsubscribe(); // Unsubscribe when the component unmounts
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

  const handleProjectTaskPress = (itemId) => {
    navigation.navigate('EditProjectTaskScreen', { projectId: projectId, taskId: itemId });
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

  const renderRightActions = (projectId, taskId) => (
    <View style={styles.rightActions}>
      <TouchableOpacity onPress={() => handleProjectTaskPress(taskId)} style={[styles.actionButton, styles.editButton]}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTask(taskId)} style={[styles.actionButton, styles.deleteButton]}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

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
            <Swipeable key={item.id} renderRightActions={() => renderRightActions(projectId, item.id)}>
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
            </Swipeable>
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
  rightActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: "45%",
    height: '90%',
    borderRadius: 20,
    marginTop: 10,
    marginLeft: 25,
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

export default ProjectTasksScreen;
