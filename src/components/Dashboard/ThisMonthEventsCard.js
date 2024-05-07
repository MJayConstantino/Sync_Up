// ThisMonthEventsCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { firebase } from '../../../firebase-config';

const ThisMonthEventsCard = () => {
  const [thisMonthEventsCount, setThisMonthEventsCount] = useState(0);

  useEffect(() => {
    const fetchThisMonthEventsCount = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        const eventsCollection = firebase.firestore().collection(`users/${currentUser.uid}/events`);

        // Get the start and end dates for this month
        const today = new Date();
        const thisMonthStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const nextMonthStartDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        // Query events for this month
        const snapshot = await eventsCollection.where('date', '>=', thisMonthStartDate).where('date', '<', nextMonthStartDate).get();
        
        // Get the count of documents in the snapshot
        const count = snapshot.size;
        
        // Update state with this month events count
        setThisMonthEventsCount(count);
      } catch (error) {
        console.error('Error fetching this month events count:', error);
      }
    };
  
    fetchThisMonthEventsCount();
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>This Month's Events Count</Text>
      <Text>{thisMonthEventsCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.3
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default ThisMonthEventsCard;
