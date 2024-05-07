// NextWeekEventsCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { firebase } from '../../../firebase-config';

const NextWeekEventsCard = () => {
  const [nextWeekEvents, setNextWeekEvents] = useState([]);

  useEffect(() => {
    const fetchNextWeekEvents = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        const eventsCollection = firebase.firestore().collection(`users/${currentUser.uid}/events`);

        // Get the start and end dates for next week
        const today = new Date();
        const nextWeekStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
        const nextWeekEndDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);

        // Query events for next week
        const snapshot = await eventsCollection.where('date', '>=', nextWeekStartDate).where('date', '<', nextWeekEndDate).get();
        
        // Extract event data from the snapshot
        const nextWeekEventsData = snapshot.docs.map(doc => doc.data());
        
        // Update state with next week events
        setNextWeekEvents(nextWeekEventsData);
      } catch (error) {
        console.error('Error fetching next week events:', error);
      }
    };
  
    fetchNextWeekEvents();
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Next Week's Events</Text>
      {nextWeekEvents.map((event, index) => (
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

export default NextWeekEventsCard;
