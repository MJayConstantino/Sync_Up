import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Project = ({ projectName, deadline, collaborators, progress }) => {
  // Calculate progress status color based on completion percentage
  let progressColor;
  if (progress >= 100) {
    progressColor = "#00FF00"; // Green for completed
  } else if (progress >= 50) {
    progressColor = "#FFA500"; // Orange for 50% or above done
  } else {
    progressColor = "#FF0000"; // Red for less than 50% or overdue
  }

  return (
    <View style={styles.item}>
      <View style={styles.topContainer}>
        <View style={styles.deadlineContainer}>
          <MaterialCommunityIcons name="clock-outline" size={15} color="#FFFFFF" />
          <View style={styles.deadlineTextContainer}>
            <Text style={styles.deadlineText}>{deadline}</Text>
          </View>
        </View>
        <View style={[styles.statusIndicator, { backgroundColor: progressColor }]}>
          <Text style={styles.statusText}>{progress >= 100 ? "Completed" : progress + "%"}</Text>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.itemLeft}>
          <Text style={styles.textContainer}>{projectName}</Text>
        </View>
      </View>
      <View style={styles.collaboratorContainer}>
        {/* Display collaborators if needed */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    marginBottom: 10,
    padding: 10,
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  deadlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00adf5", // Blue oval
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  deadlineTextContainer: {
    marginLeft: 5,
  },
  deadlineText: {
    fontSize: 16, // Increased font size
    color: "#FFFFFF",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  itemLeft: {
    flex: 1,
  },
  textContainer: {
    fontSize: 25,
  },
  collaboratorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    backgroundColor: "#00FF00", // Default color is green
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
});

export default Project;
