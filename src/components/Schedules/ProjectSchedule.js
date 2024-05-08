import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ProjectSchedule = ({ projectName, deadline }) => {
  return (
    <View style={[styles.item, { backgroundColor: "white" }]}>
      <View style={[styles.topContainer, { backgroundColor: "red" }]}>
        <Text style={[styles.scheduleType, { color: "white" }]}>Project</Text>
      </View>
      <View style={styles.timeContainer}>
        <MaterialCommunityIcons name="clock-outline" size={18} color="#000" />
        <Text style={styles.timeText}>{deadline}</Text>
      </View>
      <View style={styles.nameContainer}>
        <Text style={styles.scheduleName}>{projectName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 0.5,
    minHeight: 120,
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  scheduleType: {
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "red",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  scheduleName: {
    fontSize: 25,
    fontWeight: "bold",
  },
  nameContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  timeText: {
    fontSize: 18,
    marginLeft: 5,
  },
});

export default ProjectSchedule;
