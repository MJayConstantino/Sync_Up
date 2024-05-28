import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { firebase } from '../../../firebase-config';
import { FontAwesome } from '@expo/vector-icons';
import background from '../../assets/bgcp3.png';

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
      <ImageBackground source={background} style={styles.imageBackground} imageStyle={{ borderRadius: 10 }}>
        <FontAwesome
          style={styles.iconContainer}
          name="hourglass-half"
          size={36}
          color="#4B98FF"
        />
        <Text style={styles.title}>{title}</Text>
        <View style={styles.itemCountContainer}>
          <Text style={styles.itemCount}>{projectCount}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    height: 'auto',
    backgroundColor: '#FFFFFF',
    borderWidth: 0.3,
  },
  imageBackground: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  iconContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
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
