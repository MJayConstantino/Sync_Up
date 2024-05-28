import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { firebase } from '../../../firebase-config';
import { FontAwesome } from '@expo/vector-icons';

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
      {isCompleted ? (
        <FontAwesome
          style={styles.iconContainer}
          name="check-circle"
          size={36}
          color="#32CD32"
        />
      ) : (
        <FontAwesome
          style={styles.iconContainer}
          name="hourglass-half"
          size={36}
          color="white"
        />
      )}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.taskCountContainer}>
        <Text style={styles.taskCount}>{taskCount}</Text>
        <Text style={styles.taskCountText}> Tasks </Text>
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
    marginTop: 20,
    textAlign: 'left',
  },
  iconContainer: { 
    size: 20,
  },
  taskCountContainer: {
    flex: 1,
    marginTop: 20,
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 10, 
  },
  taskCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskCountText: { 
    fontSize: 16,
    color: 'gray',
    padding: 5,
  },
});

export default TaskCard;
