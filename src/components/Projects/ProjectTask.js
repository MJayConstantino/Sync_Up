import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CheckBox from "./CheckBox";

const ProjectTask = ({ assignedTo, taskName, description, time, date, deleteTask, toggleCompleted, taskId, isCompleted }) => {
  // Function to determine the color of the deadline date text based on completion status
  const getDeadlineColor = () => {
    return isCompleted ? "#00FF00" : "#FF0000"; // Green if completed, red if not completed
  };

  return (
    <View style={styles.item}>
      {/* Deadline container with background color */}
      <View style={[styles.deadlineContainer, { backgroundColor: getDeadlineColor() }]}>
        {/* Deadline icon */}
        <MaterialCommunityIcons name="calendar" size={20} color="#FFFFFF" />
        {/* Deadline text */}
        <Text style={styles.deadlineText}> {date}</Text>
      </View>

      {/* Time container */}
      <View style={styles.timeContainer}>
        {/* Clock icon */}
        <MaterialCommunityIcons name="clock-outline" size={24} color="#000000" />
        {/* Time text */}
        <Text style={styles.time}>{time}</Text>
      </View>

      {/* Main content container */}
      <View style={styles.contentContainer}>
        {/* Description */}
        

        {/* Checkbox and Task Name in one row */}
        <View style={styles.checkboxAndTaskNameContainer}>
          <CheckBox taskId={taskId} isCompleted={isCompleted} toggleCompleted={toggleCompleted} />
          <Text style={styles.taskName}>{taskName}</Text>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>
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
    marginLeft: 5, // Reduced margin
  },
  checkBoxMargin: {
    marginRight: 5, // Adjusted margin for checkbox
  },
  descriptionText: {
    fontSize: 18,
  },
});

export default ProjectTask;