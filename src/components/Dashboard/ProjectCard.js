import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { firebase } from '../../../firebase-config';

const ProjectCard = ({ title, onPress }) => {
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    const projectsCollection = firebase.firestore().collection('projects');
    const unsubscribe = projectsCollection
      .where('collaborators', 'array-contains', currentUser.uid)
      .onSnapshot((snapshot) => {
        setProjectCount(snapshot.size);
      });
    return () => unsubscribe();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.itemCountContainer}>
        <Text style={styles.itemCount}>{projectCount}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 20,
    marginRight: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemCountContainer: {
    backgroundColor: '#4B98FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  itemCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  projectListContainer: {
    height: 200,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.3,
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    width: 250,
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  projectProgress: {
    fontSize: 14,
    marginBottom: 5,
  },
  projectTasks: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 12,
    marginLeft: 10,
  },
});
export default ProjectCard;
