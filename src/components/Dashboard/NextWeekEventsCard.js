// NextWeekEventsCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { firebase } from '../../../firebase-config';

const NextWeekEventsCard = () => {
  const [nextWeekEventsCount, setNextWeekEventsCount] = useState(0);

  useEffect(() => {
    const fetchNextWeekEventsCount = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        const eventsCollection = firebase.firestore().collection(`users/${currentUser.uid}/events`);

        // Get the start and end dates for next week
        const today = new Date();
        const nextWeekStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
        const nextWeekEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);

        // Query events for next week
        const snapshot = await eventsCollection.where('date', '>=', nextWeekStartDate).where('date', '<', nextWeekEndDate).get();
        
        // Get the count of documents in the snapshot
        const count = snapshot.size;
        
        // Update state with next week events count
        setNextWeekEventsCount(count);
      } catch (error) {
        console.error('Error fetching next week events count:', error);
      }
    };
  
    fetchNextWeekEventsCount();
  }, []);

  return (
    <View style={[styles.card, styles.weekly]}>
      <Text style={styles.title}>Next Week's Events Count</Text>
      <Text>{nextWeekEventsCount}</Text>
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
  weekly: {
    backgroundColor: '#FFD700', // Orange-yellowish color for weekly cards
  },
});

export default NextWeekEventsCard;