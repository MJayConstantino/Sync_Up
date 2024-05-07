// CurrentEventsCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { firebase } from '../../../firebase-config';

const CurrentEventsCard = () => {
  const [currentEvents, setCurrentEvents] = useState([]);

  useEffect(() => {
    const fetchCurrentEvents = async () => {
      try {
        const currentUser = firebase.auth().currentUser;
        const eventsCollection = firebase.firestore().collection(`users/${currentUser.uid}/events`);

        // Query all current events
        const snapshot = await eventsCollection.get();
        
        // Extract event data from the snapshot
        const currentEventsData = snapshot.docs.map(doc => doc.data());
        
        // Update state with current events
        setCurrentEvents(currentEventsData);
      } catch (error) {
        console.error('Error fetching current events:', error);
      }
    };
  
    fetchCurrentEvents();
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Current Events</Text>
      {currentEvents.map((event, index) => (
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

export default CurrentEventsCard;
