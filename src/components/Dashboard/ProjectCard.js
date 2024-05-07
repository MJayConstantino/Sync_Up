import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { firebase } from '../../../firebase-config';

const ProjectCard = ({ onPress }) => {
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    const fetchProjectsCount = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        const projectsCollection = firebase.firestore().collection('projects');

        // Query projects where the user is a collaborator
        const snapshot = await projectsCollection.where(`collaborators.${currentUser.uid}`, '==', true).get();
        
        // Get the count of documents in the snapshot
        const count = snapshot.size;

        // Update the project count state
        setProjectCount(count);
      } catch (error) {
        console.error('Error fetching project count:', error);
      }
    };

    fetchProjectsCount();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Text style={styles.title}>Projects</Text>
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
    borderWidth: 0.3
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
});

export default ProjectCard;