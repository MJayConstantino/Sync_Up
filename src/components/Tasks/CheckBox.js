import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

function CheckBox({ taskId, currentStatus, toggleTaskStatus }) {
  const [done, setDone] = useState(currentStatus === 'finished');

  const handlePress = () => {
    setDone(!done);
    toggleTaskStatus(taskId, done ? 'finished' : 'not finished');
  };

  return (
    <View style={{ padding: 10 }}>
      <TouchableOpacity onPress={handlePress}>
        {done ? (
          <Feather name="check-circle" size={24} color="black" />
        ) : (
          <Feather name="circle" size={24} color="black" />
        )}
      </TouchableOpacity>
    </View>
  );
}

export default CheckBox;
