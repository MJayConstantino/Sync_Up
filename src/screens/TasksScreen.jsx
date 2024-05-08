import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import Task from "../components/Tasks/Task";
import AddTaskModal from "../components/Tasks/AddTask";
import EditTaskScreen from "./EditTasksScreen";
import { firebase } from "../../firebase-config";

const firestore = firebase.firestore();

export default function TasksScreen({ navigation }) {
  const [taskItems, setTaskItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editTaskName, setEditTaskName] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const categories = ["All", "Work", "School", "Home", "Personal"];
  const currentUser = firebase.auth().currentUser;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const unsubscribe = firestore
      .collection(`users/${currentUser.uid}/tasks`)
      .orderBy("isCompleted", "asc") // Order by isCompleted in ascending order
      .orderBy("createdAt", "desc") // Order by createdAt in descending order
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
      const newTask = {
        taskName: editTaskName,
        category: selectedCategory === "All" ? null : selectedCategory,
        time: taskTime,
        date: taskDate,
        description: taskDescription,
        isCompleted: false,
        createdAt: new Date(),
        timeValue: getTimeValue(taskTime),
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
      const updatedStatus = !isCompleted;
      await firestore.collection(`users/${currentUser.uid}/tasks`).doc(taskId).update({ isCompleted: updatedStatus });
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await firestore.collection(`users/${currentUser.uid}/tasks`).doc(taskId).delete();
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
          {taskItems.length === 0 ? (
            <View style={styles.noTasksContainer}>
              <Text style={styles.noTasksText}>No tasks to do</Text>
              <Text style={styles.noTasksSubText}>Please tap the + button to create one</Text>
            </View>
          ) : (
            <View style={styles.items}>
            {filterTasks(taskItems).map((item, index) => (
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
    justifyContent: "center",
    alignItems: "center",
    marginTop: 250,
  },
  noTasksText: {
    fontSize: 20,
    marginBottom: 10,
  },
  noTasksSubText: {
    fontSize: 14,
    color: "#666",
  },
});
