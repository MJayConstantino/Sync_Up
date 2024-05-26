import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CheckBox from "./CheckBox";

const ProjectTask = ({ assignedTo, taskName, description, time, date, deleteTask, toggleCompleted, taskId, isCompleted }) => {
  const getDeadlineColor = () => {
    return isCompleted ? "#00FF00" : "#FF0000"; 
  };

  return (
    <View style={styles.item}>
      <View style={[styles.deadlineContainer, { backgroundColor: getDeadlineColor() }]}>
        <MaterialCommunityIcons name="calendar" size={20} color="#FFFFFF" />
        <Text style={styles.deadlineText}> {date}</Text>
      </View>

      <View style={styles.timeContainer}>
        <MaterialCommunityIcons name="clock-outline" size={24} color="#000000" />

        <Text style={styles.time}>{time}</Text>
      </View>

      <View style={styles.contentContainer}>

        <View style={styles.checkboxAndTaskNameContainer}>
          <CheckBox taskId={taskId} isCompleted={isCompleted} toggleCompleted={toggleCompleted} />
          <Text style={styles.taskName}>{taskName}</Text>
        </View>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 12,
    borderRadius: 10,
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 0.5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white'
  },
  deadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 10,
  },
  deadlineText: {
    fontSize: 18,
    color: "#FFFFFF"
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 10
  },
  time: {
    fontSize: 20,
    marginLeft: 5, // Reduced margin
  },
  contentContainer: {
    paddingHorizontal: 0
  },
  checkboxAndTaskNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskName: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 5,
  },
  checkBoxMargin: {
    marginRight: 5
  },
  descriptionText: {
    fontSize: 18,
  },
});

export default ProjectTask;