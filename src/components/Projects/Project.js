import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { firebase } from "../../../firebase-config";

const Project = ({ projectName, deadline, collaborators, progress }) => {
  const [collaboratorImages, setCollaboratorImages] = useState([]);

  useEffect(() => {
    const fetchCollaboratorImages = async () => {
      const promises = collaborators.map(collaboratorId =>
        firebase.firestore().collection("users").doc(collaboratorId).get().then(doc => ({
          userId: collaboratorId,
          imageUrl: doc.data()?.imageUrl || 'https://firebasestorage.googleapis.com/v0/b/syncup-4b36a.appspot.com/o/profilepic.png?alt=media&token=4f9acff6-166b-4e21-9ac8-42bc5f441e63',
        }))
      );

      const results = await Promise.all(promises);
      setCollaboratorImages(results);
    };

    fetchCollaboratorImages();
  }, [collaborators]);

  return (
    <View style={styles.item}>
      <View style={styles.topContainer}>
        <View style={styles.deadlineContainer}>
          <MaterialCommunityIcons name="calendar" size={20} color="#FFFFFF" />
          <View style={styles.deadlineTextContainer}>
            <Text style={styles.deadlineText}>{deadline}</Text>
          </View>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.projectNameContainer}>
          <Text style={styles.textContainer}>{projectName}</Text>
        </View>

        <View style={styles.collaboratorContainer}>
          {collaboratorImages.map((imageUrl, index) => (
            <Image
              key={index}
              source={{ uri: imageUrl.imageUrl }}
              style={styles.collaboratorAvatar}
            />
          ))}
        </View>
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
    fontSize: 16,
    color: "#FFFFFF",
  },
  textContainer: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  projectNameContainer: {
    flex: 1,
    borderBottomWidth: 1,
  },
  collaboratorContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: 'flex-end',
  },
  collaboratorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 50, // Make it circular
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#39e75f',
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
