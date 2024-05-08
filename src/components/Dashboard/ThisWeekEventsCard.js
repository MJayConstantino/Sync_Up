import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { firebase } from '../../../firebase-config';

const ThisWeekEventsCard = () => {
  const [thisWeekEventsCount, setThisWeekEventsCount] = useState(0);

  useEffect(() => {
    const fetchThisWeekEventsCount = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        const eventsCollection = firebase.firestore().collection(`users/${currentUser.uid}/schedules`);

        // Get the start and end dates for this week
        const today = new Date();
        const thisWeekStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        const thisWeekEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);

        // Query events for this week
        const snapshot = await eventsCollection.where('date', '>=', thisWeekStartDate).where('date', '<', thisWeekEndDate).get();
        
        // Get the count of documents in the snapshot
        const count = snapshot.size;
        
        // Update state with this week events count
        setThisWeekEventsCount(count);
      } catch (error) {
        console.error('Error fetching this week events count:', error);
      }
    };
  
    fetchThisWeekEventsCount();
  }, []);

  return (
    <View style={[styles.card, styles.weekly]}>
      <Text style={styles.title}>This Week's Events Count</Text>
      <Text>{thisWeekEventsCount}</Text>
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

export default ThisWeekEventsCard;