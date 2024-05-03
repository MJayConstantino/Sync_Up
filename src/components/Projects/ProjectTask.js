import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DeleteBtn from "../Tasks/DeleteBtn"; // Assuming DeleteBtn component is defined elsewhere
import CheckBox from "../Tasks/CheckBox";

const ProjectTask = ({ assignedTo, taskName, description, time, date, deleteTask, toggleTaskStatus, taskId, status }) => {
  return (
    <View style={styles.item}>
      <View style={styles.topContainer}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: assignedTo.avatar }} style={styles.avatar} />
        </View>
        <Text style={styles.deadlineText}>
          <MaterialCommunityIcons name="clock-outline" size={15} color="#000" />
          {time} {date}
        </Text>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.itemLeft}>
          <CheckBox taskId={taskId} status={status} toggleTaskStatus={toggleTaskStatus} style={styles.checkBoxMargin} />
          <Text style={styles.textContainer}>{taskName}</Text>
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
    alignItems: "center",
    backgroundColor: "#00adf5", // Light blue background
    paddingHorizontal: 10, // Add padding for better spacing
    paddingVertical: 5, // Add padding for better spacing
    borderTopLeftRadius: 10, // Match corner radius of the main item
    borderTopRightRadius: 10, // Match corner radius of the main item
  },
  avatarContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
    marginRight: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
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
  textContainer: {
    marginLeft: 5,
  },
  checkBoxMargin: {
    marginLeft: 5,
  },
  deadlineText: {
    fontSize: 12,
    color: "#FFFFFF",
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
