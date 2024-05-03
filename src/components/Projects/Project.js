import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Project = ({ projectName, groupImage, deadline, collaborators }) => {
  return (
    <View style={styles.item}>
      <View style={styles.topContainer}>
        <View style={styles.timeContainer}>
          <MaterialCommunityIcons name="clock-outline" size={15} color="#000" />
          <Text style={styles.deadlineText}>Deadline: {deadline}</Text>
        </View>
      </View>
      <View style={styles.contentContainer}>
        {/* <View style={styles.groupImageContainer}>
          <Image source={{ uri: groupImage }} style={styles.groupImage} />
        </View> */}
        <View style={styles.itemLeft}>
          <Text style={styles.textContainer}>{projectName}</Text>
        </View>
      </View>
      <View style={styles.collaboratorContainer}>
        {/* {collaborators.map((collaborator, index) => (
          <View key={index} style={styles.avatarContainer}>
            <Image source={{ uri: collaborator }} style={styles.avatar} />
          </View>
        ))} */}
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
