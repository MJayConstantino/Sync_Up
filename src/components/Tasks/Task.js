import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CheckBox from "./CheckBox";

const Task = ({ text, description, category, time, date, toggleCompleted, taskId, isCompleted }) => {
  return (
    <View style={styles.item}>
      <View style={styles.topContainer}>
        <Text style={styles.categoryText}>{category}</Text>
        <View style={styles.timeContainer}>
          <MaterialCommunityIcons name="clock-outline" size={18} color="#000" />
          <Text style={styles.deadlineText}>{time} {date}</Text>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.itemLeft}>
          <CheckBox taskId={taskId} isCompleted={isCompleted} toggleCompleted={toggleCompleted} style={styles.checkBoxMargin} />
          <Text style={styles.textContainer}>{text}</Text>
        </View>
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
    padding: 16,
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
    backgroundColor: "#00adf5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  textContainer: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  checkBoxMargin: {
    marginLeft: 5,
  },
  deadlineText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 5,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    maxHeight: 30
  },
  descriptionText: {
    fontSize: 16,
  },
});

export default Task;