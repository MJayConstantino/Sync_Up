import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Star = ({ filled, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.starContainer}>
      <Ionicons
        name={filled ? 'star' : 'star-outline'}
        size={24}
        color={filled ? 'yellow' : 'gray'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  starContainer: {
    // Add styling options here
    // Example:
    padding: 5,
  },
});

export default Star;