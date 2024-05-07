import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { firebase } from '../../../firebase-config';

const ScheduleCard = ({ title, date, onPress }) => {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const fetchItemCount = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        const snapshot = await firebase.firestore().collection(`users/${currentUser.uid}/schedules`).where('date', '==', date).get();
        setItemCount(snapshot.size);
      } catch (error) {
        console.error('Error fetching item count:', error);
      }
    };

    fetchItemCount();
  }, [date]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.date}>{date}</Text>
      <View style={styles.itemCountContainer}>
        <Text style={styles.itemCount}>{itemCount}</Text>
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
    height: 200,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.3,
    marginRight: 20
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

export default ScheduleCard;
