// NextMonthEventsCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { firebase } from '../../../firebase-config';

const NextMonthEventsCard = () => {
  const [nextMonthEvents, setNextMonthEvents] = useState([]);

  useEffect(() => {
    const fetchNextMonthEvents = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        const eventsCollection = firebase.firestore().collection(`users/${currentUser.uid}/events`);

        // Get the start and end dates for next month
        const today = new Date();
        const nextMonthStartDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextMonthEndDate = new Date(today.getFullYear(), today.getMonth() + 2, 1);

        // Query events for next month
        const snapshot = await eventsCollection.where('date', '>=', nextMonthStartDate).where('date', '<', nextMonthEndDate).get();
        
        // Extract event data from the snapshot
        const nextMonthEventsData = snapshot.docs.map(doc => doc.data());
        
        // Update state with next month events
        setNextMonthEvents(nextMonthEventsData);
      } catch (error) {
        console.error('Error fetching next month events:', error);
      }
    };
  
    fetchNextMonthEvents();
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Next Month's Events</Text>
      {nextMonthEvents.map((event, index) => (
        <Text key={index}>{event.title} - {event.date}</Text>
      ))}
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

export default NextMonthEventsCard;
