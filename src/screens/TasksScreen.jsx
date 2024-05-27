import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, RefreshControl, ActivityIndicator, Image } from "react-native";
import Task from "../components/Tasks/Task";
import AddTaskModal from "../components/Tasks/AddTask";
import { firebase } from "../../firebase-config";
import { Swipeable } from 'react-native-gesture-handler';
import { taskNotification, removeAlarm } from '../components/Alarms/Alarm';

const firestore = firebase.firestore();

export default function TasksScreen({ navigation }) {
  const [taskItems, setTaskItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editTaskName, setEditTaskName] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [refreshing, setRefreshing] = React.useState(false);
  const categories = ["All", "Work", "School", "Home", "Personal"];
  const currentUser = firebase.auth().currentUser;
  const [loading, setLoading] = useState(true);

  const gifs = {
    "All": require('../assets/gifs/mochi-peach.gif'),
    "Work": require('../assets/gifs/work.gif'),
    "School": require('../assets/gifs/school.gif'),
    "Home": require('../assets/gifs/home.gif'),
    "Personal": require('../assets/gifs/personal.gif'),
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const unsubscribe = firestore
      .collection(`users/${currentUser.uid}/tasks`)
      .orderBy("isCompleted", "asc")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTaskItems(tasks);
        setLoading(false);
      });
  
    return () => unsubscribe();
  }, [currentUser.uid]);

  const handleTaskPress = (taskId) => {
    navigation.navigate('EditTaskScreen', { taskId: taskId });
  };

  const getTimeValue = (taskTime) => {
    const [time, period] = taskTime.split(' ');
    const [hours, minutes] = time.split(':');
    let timeValue = parseInt(hours) * 100 + parseInt(minutes);
    if (period === 'PM' && hours !== '12') {
      timeValue += 1200;
    }
    return timeValue;
  };

  const addNewTask = async () => {
    try {
      let notificationId;
      if (taskTime) {
        const [time, ampm] = taskTime.split(' ');
        const [hour, minute] = time.split(':');
        const period = ampm.toUpperCase();
        notificationId = await taskNotification(hour, minute, period, editTaskName);
      }
  
      const newTask = {
        taskName: editTaskName,
        category: selectedCategory === "All" ? null : selectedCategory,
        time: taskTime,
        date: taskDate,
        description: taskDescription,
        isCompleted: false,
        createdAt: new Date(),
        timeValue: getTimeValue(taskTime),
        notificationId,
      };
  
      await firestore.collection(`users/${currentUser.uid}/tasks`).add(newTask);
  
      console.log("Task added successfully!");
      setIsAddModalVisible(false);
      setEditTaskName("");
      setTaskTime("");
      setTaskDate("");
      setTaskDescription("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const openAddModal = () => {
    const updatedCategory = selectedCategory.trim() === "" ? "All" : selectedCategory.trim();
    setSelectedCategory(updatedCategory);
    setIsAddModalVisible(true);
  };

  const toggleCompleted = async (taskId, isCompleted) => {
    try {
      const updatedStatus = isCompleted ? false : true;
      await firestore.collection(`users/${currentUser.uid}/tasks`).doc(taskId).update({ isCompleted: updatedStatus });

      const updatedTasks = taskItems.map((task) => {
        if (task.id === taskId) {
          return { ...task, isCompleted: updatedStatus };
        }
        return task;
      });
      setTaskItems(updatedTasks);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const snapshot = await firestore.collection(`users/${currentUser.uid}/tasks`).doc(taskId).get();
      const taskData = snapshot.data();
  
      if (taskData && taskData.notificationId) {
        await removeAlarm(taskData.notificationId, [], () => {}, () => {});
      }
  
      await firestore.collection(`users/${currentUser.uid}/tasks`).doc(taskId).delete();
  
      const updatedTasks = taskItems.filter((task) => task.id !== taskId);
      setTaskItems(updatedTasks);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const filterTasks = (items) => {
    if (selectedCategory === "All") {
      return items;
    } else {
      return items.filter((item) => item.category === selectedCategory);
    }
  };

  const renderRightActions = (taskId) => (
    <View style={styles.rightActions}>
      <TouchableOpacity onPress={() => navigation.navigate('EditTaskScreen', { taskId: taskId })} style={[styles.actionButton, styles.editButton]}>
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => deleteTask(taskId)} style={[styles.actionButton, styles.deleteButton]}>
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
      contentContainerStyle={styles.scrollViewContent} 
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        >
        <View style={styles.taskWrapper}>
          <Text style={styles.sectionTitle}>Tasks</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryWrapper}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryButton, { backgroundColor: selectedCategory === category ? "#03a1fc" : "#D6D6D6" }]}
                onPress={() => setSelectedCategory(category === null ? "All" : category)}
              >
                <Text style={[styles.categoryText, { color: selectedCategory === category ? "#FFFFFF" : "#000000" }]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {filterTasks(taskItems).length === 0 ? (
            <View style={styles.noTasksContainer}>
              <Image 
                  source={gifs[selectedCategory]}
                  style={{width: 180, height: 180 , alignItems: 'center'}}
              />
              <Text style={styles.noTasksText}> You have no pending tasks </Text>
              <Text style={styles.noTasksSubText}>Press + to add task</Text>
            </View>
          ) : (
            <View style={styles.items}>
            {filterTasks(taskItems).map((item, index) => (
            <Swipeable key={item.id} renderRightActions={() => renderRightActions(item.id)}>
            <TouchableOpacity key={item.id} onPress={() => handleTaskPress(item.id)}>
              <Task
                text={item.taskName}
                deleteTask={() => deleteTask(item.id)}
                description={item.description}
                time={item.time}
                date={item.date}
                category={item.category}
                taskId={item.id}
                isCompleted={item.isCompleted}
                toggleCompleted={toggleCompleted} 
              />
            </TouchableOpacity>
            </Swipeable>  
            ))}
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.addText}>+</Text>
      </TouchableOpacity>

      <AddTaskModal
        isVisible={isAddModalVisible}
        onDismiss={() => setIsAddModalVisible(false)}
        onSave={addNewTask}
        taskName={editTaskName}
        setTaskName={setEditTaskName}
        taskDate={taskDate}
        setTaskDate={setTaskDate}
        taskTime={taskTime}
        setTaskTime={setTaskTime}
        taskDescription={taskDescription}
        setTaskDescription={setTaskDescription}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 25
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  categoryWrapper: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 16,
  },
  taskWrapper: {
    paddingTop: 10,
    paddingHorizontal: 21,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: "bold",
  },
  items: {
    marginTop: 20,
    marginBottom: 50
  },
  addText: {
    fontSize: 25,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 85,
    height: 85,
    backgroundColor: "#0384fc",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#FFFFFF",
    borderWidth: 1,
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 180
  },
  noTasksText: {
    fontSize: 20,
    marginBottom: 10,
  },
  noTasksSubText: {
    fontSize: 14,
    color: "#666",
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
    height: '90%',
    borderRadius: 20,
    marginTop: 10,
    marginLeft: 10,
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
