import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Project = ({ text, groupImage, time, day, progress, collaborators }) => {
  // Calculate the percentage of tasks done
  const percentageDone = Math.round((progress / 100) * 100);

  // Determine progress color based on percentage
  let progressColor = "#FF0000"; // Default color: red
  if (percentageDone >= 50 && percentageDone < 100) {
    progressColor = "#FFFF00"; // Yellow
  } else if (percentageDone === 100) {
    progressColor = "#00FF00"; // Green
  }

  return (
    <View style={styles.item}>
      <View style={styles.topContainer}>
        <View style={styles.timeContainer}>
          <MaterialCommunityIcons name="clock-outline" size={15} color="#000" />
          <Text style={styles.deadlineText}>{time} {day}</Text>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.groupImageContainer}>
          <Image source={{ uri: groupImage }} style={styles.groupImage} />
        </View>
        <View style={styles.itemLeft}>
          <Text style={styles.textContainer}>{text}</Text>
        </View>
      </View>
      <View style={[styles.progressBar, { backgroundColor: progressColor }]} />
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressText}>{percentageDone}% Complete</Text>
      </View>
      <View style={styles.collaboratorContainer}>
        {collaborators.map((collaborator, index) => (
          <View key={index} style={styles.avatarContainer}>
            <Image source={{ uri: collaborator.avatar }} style={styles.avatar} />
          </View>
        ))}
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
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deadlineText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  groupImageContainer: {
    marginRight: 10,
  },
  groupImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  itemLeft: {
    flex: 1,
  },
  textContainer: {
    fontSize: 16,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  progressTextContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
  },
  collaboratorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
    marginRight: 5,
  },
  avatar: {
    flex: 1,
    width: null,
    height: null,
  },
});

export default Project;
