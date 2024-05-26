import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { firebase } from '../../../firebase-config';

const TaskCard = ({ title, isCompleted, onPress }) => {
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;

    const unsubscribe = firebase.firestore()
      .collection(`users/${currentUser.uid}/tasks`)
      .where('isCompleted', '==', isCompleted)
      .onSnapshot(snapshot => {
        setTaskCount(snapshot.size);
      }, error => {
        console.error('Error fetching task count:', error);
      });

    return () => unsubscribe();
  }, [isCompleted]);

  const cardColor = isCompleted ? '#CCFFCC' : '#FFCCCC';

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: cardColor }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.taskCountContainer}>
        <Text style={styles.taskCount}>{taskCount}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height: 200,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskCountContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  taskCount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default TaskCard;