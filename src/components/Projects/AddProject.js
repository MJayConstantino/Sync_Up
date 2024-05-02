import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const AddProject = ({ isVisible, onDismiss, onSave }) => {
  const [projectName, setProjectName] = useState('');

  const handleSave = () => {
    onSave(projectName);
    setProjectName('');
  };

  return (
    <View style={[styles.container, isVisible ? styles.visible : styles.hidden]}>
      <View style={styles.modal}>
        <Text style={styles.title}>Add Project</Text>
        <TextInput
          style={styles.input}
          placeholder="Project Name"
          value={projectName}
          onChangeText={setProjectName}
        />
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onDismiss}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    minWidth: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: 'red',
  },
  saveButton: {
    backgroundColor: 'green',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  visible: {
    display: 'flex',
  },
  hidden: {
    display: 'none',
  },
});

export default AddProject;
