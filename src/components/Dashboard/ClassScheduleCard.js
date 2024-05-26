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
        
        const snapshot = await classSchedulesCollection.where('day', 'array-contains', getCurrentDay()).get();
        
        const count = snapshot.size;
        
        setClassCount(count);
      } catch (error) {
        console.error('Error fetching class count:', error);
      }
    };
  
    fetchClassCount();
  }, []);

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay(); 
    return days[todayIndex];
  };

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

export default ClassScheduleCard;
