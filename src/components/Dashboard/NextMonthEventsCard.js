import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { firebase } from '../../../firebase-config';
import { format } from 'date-fns';

const NextMonthEventsCard = () => {
  const [nextMonthEventsCount, setNextMonthEventsCount] = useState(0);

  useEffect(() => {
    const fetchNextMonthEventsCount = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        const eventsCollection = firebase.firestore().collection(`users/${currentUser.uid}/schedules`);

        // Get the start and end dates for next month
        const today = new Date();
        const nextMonthStartDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextMonthEndDate = new Date(today.getFullYear(), today.getMonth() + 2, 1);

        // Query events for next month
        const snapshot = await eventsCollection.where('date', '>=', nextMonthStartDate).where('date', '<', nextMonthEndDate).get();
        
        // Get the count of documents in the snapshot
        const count = snapshot.size;
        
        // Update state with next month events count
        setNextMonthEventsCount(count);
      } catch (error) {
        console.error('Error fetching next month events count:', error);
      }
    };
  
    fetchNextMonthEventsCount();
  }, []);

  return (
    <View style={[styles.card, styles.monthly]}>
      <Text style={styles.title}>Next Month's Events Count</Text>
      <Text>{nextMonthEventsCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.3,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  monthly: {
    backgroundColor: '#FFA500', // Orange color for monthly cards
  },
});

export default NextMonthEventsCard;