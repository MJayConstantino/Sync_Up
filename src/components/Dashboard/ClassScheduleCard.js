import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { firebase } from '../../../firebase-config';

const ClassScheduleCard = ({ title, date, onPress }) => {
  const [classCount, setClassCount] = useState(0);

  useEffect(() => {
    const fetchClassCount = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        const classSchedulesCollection = firebase.firestore().collection(`users/${currentUser.uid}/classSchedules`);
        
        // Get the snapshot of class schedules where the day matches the current day
        const snapshot = await classSchedulesCollection.where('day', '==', date).get();
        
        // Get the count of documents in the snapshot
        const count = snapshot.size;
        
        // Update the class count state
        setClassCount(count);
      } catch (error) {
        console.error('Error fetching class count:', error);
      }
    };
  
    fetchClassCount();
  }, [date]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{date}</Text>
      <View style={styles.itemCountContainer}>
        <Text style={styles.itemCount}>{classCount}</Text>
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
  date: {
    fontSize: 16,
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

export default ClassScheduleCard;