import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { firebase } from '../../../firebase-config';

const ScheduleTaskCard = ({ title, date, onPress }) => {
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    const tasksCollection = firebase.firestore().collection(`users/${currentUser.uid}/tasks`);

    const unsubscribe = tasksCollection
      .where('date', '==', date)
      .onSnapshot((snapshot) => {
        setTaskCount(snapshot.size);
      });

    return () => unsubscribe();
  }, [date]);
    
    return (
      <TouchableOpacity onPress={onPress} style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{date}</Text>
        <View style={styles.itemCountContainer}>
          <Text style={styles.itemCount}>{taskCount}</Text>
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
      height: 150,
      backgroundColor: '#FFFFFF',
      borderWidth: 0.3,
      marginRight: 20
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    date: {
      fontSize: 14,
      marginBottom: 5,
    },
    itemCountContainer: {
      backgroundColor: '#4B98FF',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    itemCount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
  });

export default ScheduleTaskCard;
