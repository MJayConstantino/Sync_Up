import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

function CheckBox({ taskId, isCompleted, toggleCompleted }) {
  const [completed, setCompleted] = useState(isCompleted === true);

  const handlePress = () => {
    setCompleted(!completed);
    toggleCompleted(taskId, isCompleted? true : false);
  };

  return (
    <View style={{ padding: 10 }}>
      <TouchableOpacity onPress={handlePress}>
        {completed ? (
          <Feather name="check-circle" size={24} color="black" />
        ) : (
          <Feather name="circle" size={24} color="black" />
        )}
      </TouchableOpacity>
    </View>
  );
}

export default CheckBox;
