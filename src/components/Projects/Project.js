import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { firebase } from "../../../firebase-config"; // Import your Firebase configuration file

const Project = ({ projectName, deadline, collaborators, progress }) => {
  const [collaboratorImages, setCollaboratorImages] = useState([]);

  useEffect(() => {
    const unsubscribe = firebase.firestore().collection("collaborators").onSnapshot(snapshot => {
      const images = snapshot.docs.map(doc => doc.data().imageUrl);
      setCollaboratorImages(images);
    });

    return () => unsubscribe();
  }, []);

  // Calculate progress status color based on completion percentage
  let progressColor;
  let statusText;
  if (progress >= 100) {
    progressColor = "#00FF00"; // Green for completed
    statusText = "Completed";
  } else if (progress > 0) {
    progressColor = "#FFA500"; // Orange for in-progress
    statusText = "In Progress";
  } else {
    progressColor = "#FF0000"; // Red for not started
    statusText = "Not Started";
  }

  return (
    <View style={styles.item}>
      <View style={styles.topContainer}>
        <View style={styles.deadlineContainer}>
          <MaterialCommunityIcons name="calendar" size={20} color="#FFFFFF" />
          <View style={styles.deadlineTextContainer}>
            <Text style={styles.deadlineText}>{deadline}</Text>
          </View>
        </View>
        {/* Circular progress bar */}
        <View style={[styles.progressContainer, { borderColor: progressColor }]}>
          <View style={[styles.progressBar, { backgroundColor: progressColor }]}>
            <Text style={[styles.progressText, { color: progress >= 100 ? "#FFFFFF" : "#000000" }]}>
              {progress.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.itemLeft}>
          <Text style={styles.textContainer}>{projectName}</Text>
        </View>
        {/* Placeholder for collaborator images */}
        <View style={styles.collaboratorContainer}>
          {collaboratorImages.map((imageUrl, index) => (
            <Image
              key={index}
              source={{ uri: imageUrl }}
              style={styles.collaboratorAvatar}
            />
          ))}
        </View>
      </View>
      {/* Status box */}
      <View style={[styles.statusBox, { backgroundColor: progressColor }]}>
        <Text style={styles.statusText}>{statusText}</Text>
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
    justifyContent: "space-between",
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
  collaboratorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15, // Make it circular
    marginRight: 5,
  },
  progressContainer: {
    borderWidth: 2,
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    borderRadius: 50,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 12,
  },
  statusBox: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
});

export default Project;
