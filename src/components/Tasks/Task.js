import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DeleteBtn from "./DeleteBtn"; // Assuming DeleteBtn component is defined elsewhere
import CheckBox from "./CheckBox";

const Task = ({ text, description, category, time, date, deleteTask, toggleTaskStatus, taskId, currentStatus }) => {
  return (
    <View style={styles.item}>
      <View style={styles.topContainer}>
        <Text style={styles.categoryText}>{category}</Text>
        <View style={styles.timeContainer}>
          <MaterialCommunityIcons name="clock-outline" size={15} color="#000" />
          <Text style={styles.deadlineText}>{time} {date}</Text>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.itemLeft}>
          <CheckBox taskId={taskId} currentStatus={currentStatus} toggleTaskStatus={toggleTaskStatus} style={styles.checkBoxMargin} />
          <Text style={styles.textContainer}>{text}</Text>
        </View>
        <DeleteBtn deleteTask={deleteTask} />
      </View>
      <View style={styles.bottomRow}>
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
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#00adf5", // Light blue background
    paddingHorizontal: 10, // Add padding for better spacing
    paddingVertical: 5, // Add padding for better spacing
    borderTopLeftRadius: 10, // Match corner radius of the main item
    borderTopRightRadius: 10, // Match corner radius of the main item
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  textContainer: {
    marginLeft: 5,
  },
  checkBoxMargin: {
    marginLeft: 5,
  },
  deadlineText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  categoryText: {
    fontSize: 12,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  clockIcon: {
    width: 15,
    height: 15,
    marginRight: 5,
  },
  bottomRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  descriptionText: {
    fontSize: 12,
  },
});

export default Task;
