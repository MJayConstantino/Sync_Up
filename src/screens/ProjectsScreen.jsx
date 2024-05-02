import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import Project from "../components/Projects/Project";
import { firebase } from '../../firebase-config'

const ProjectScreen = ({ userUid }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsRef = firebase.firestore().collection('projects');
        const snapshot = await projectsRef.where('collaborators', 'array-contains', userUid).get();
        const userProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(userProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, [userUid]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Project Collaboration</Text>
      {projects.length === 0 ? (
        <View style={styles.noProjectsContainer}>
          <Text style={styles.noProjectsText}>No current projects</Text>
          <Text style={styles.noProjectsSubText}>Create one or be a collaborator</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Project
              projectName={item.projectName}
              groupImage={item.groupImage}
              time={item.time}
              day={item.day}
              progress={item.progress}
              collaborators={item.collaborators}
            />
          )}
        />
      )}
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Project</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 50,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: "bold",
  },
  noProjectsText: {
    fontSize: 20,
    marginBottom: 10,
  },
  noProjectsSubText: {
    fontSize: 14,
    color: "#666",
  },
  noProjectsContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 300,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#03a1fc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ProjectScreen;
