import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ProjectTaskSchedule = ({ taskName, time, description, date }) => {
  return (
    <View style={[styles.item, { backgroundColor: "transparent" }]}>
      <View style={styles.timeContainer}>
        <MaterialCommunityIcons name="clock-outline" size={15} color="#000" />
        <Text style={styles.timeText}>{date}  {time}</Text>
      </View>
      <View style={styles.topContainer}>
        <Text style={styles.scheduleName}>{taskName}</Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.descriptionText}>{description}</Text>
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
  categoryContainer: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    color: "#fff",
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
  scheduleName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 16,
    marginLeft: 5,
  },
  bottomRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 12,
  },
});

export default ProjectTaskSchedule;
