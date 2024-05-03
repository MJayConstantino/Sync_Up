import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DeleteBtn from "../Tasks/DeleteBtn"; // Assuming DeleteBtn component is defined elsewhere
import CheckBox from "../Tasks/CheckBox";

const ProjectTask = ({ assignedTo, taskName, description, time, date, deleteTask, toggleTaskStatus, taskId, status }) => {
  // Function to determine the color of the deadline date based on completion status
  const getDeadlineColor = () => {
    if (status === "completed") {
      return "#00FF00"; // Green if completed before deadline
    } else if (new Date(date) >= new Date()) {
      return "#00adf5"; // Blue if not completed but not yet the deadline
    } else if (status === "pending") {
      return "#FF0000"; // Red if not completed and past the deadline
    }
  };

  return (
    <View style={styles.item}>
      {/* Display the time and deadline */}
      <View style={styles.deadlineContainer}>
        <View style={[styles.oval, { backgroundColor: getDeadlineColor() }]}>
          <MaterialCommunityIcons name="calendar" size={15} color="#FFFFFF" />
        </View>
        <Text style={styles.deadlineText}>{date}</Text>
        <View style={styles.timeOval}>
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.itemLeft}>
          <CheckBox taskId={taskId} status={status} toggleTaskStatus={toggleTaskStatus} style={styles.checkBoxMargin} />
          {/* Display the task name */}
          <Text style={styles.taskName}>{taskName}</Text>
        </View>
        <DeleteBtn deleteTask={deleteTask} />
      </View>
      <View style={styles.bottomRow}>
        {/* Display the description */}
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 0.5,
  },
  deadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5, // Add margin bottom for spacing
  },
  oval: {
    width: 30,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginRight: 5, // Add margin right for spacing
  },
  timeOval: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    marginLeft: "auto", // Align to the right
    paddingLeft: 5, // Add padding left for better spacing
    paddingRight: 5, // Add padding right for better spacing
  },
  deadlineText: {
    fontSize: 14,
  },
  time: {
    fontSize: 12,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  taskName: {
    fontSize: 16, // Increase font size slightly
    marginLeft: 5, // Add margin left for spacing
  },
  checkBoxMargin: {
    marginLeft: 5,
  },
  bottomRow: {
    paddingHorizontal: 10,
    paddingTop: 5,
  },
  descriptionText: {
    fontSize: 12,
  },
});

export default ProjectTask;
