import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, Image, SafeAreaView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../firebase-config';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Importing icon library

const firestore = firebase.firestore();

export default function RFScannerScreen() {
  const [image, setImage] = useState(null);
  const [classSchedule, setClassSchedule] = useState([]);
  const currentUser = firebase.auth().currentUser;

  function parseCourseData(data) {
    const schedules = [];
    const lines = data.split('\n');

    for (let i = 0; i < lines.length; i += 4) {
      const stubCodeSubjectLine = lines[i].trim().split(' ');
      const timeDayLine = lines[i + 1].trim().split(' ');
      const roomLine = lines[i + 2].trim();
      const instructorLine = lines[i + 3].trim();

      let subject = stubCodeSubjectLine.slice(1).join(' ');
      // Check if subject has only one word
      if (subject.split(' ').length === 1) {
        subject = '[LAB]';
      }

      const schedule = {
        stubCode: stubCodeSubjectLine[0],
        subject: subject,
        time: timeDayLine[1],
        day: timeDayLine[2],
        room: roomLine,
        instructor: instructorLine
      };

      schedules.push(schedule);
    }

    return schedules;
  }

  function convertDayAbbreviationToFull(dayAbbreviation) {
    const daysMapping = {
      "M": "Monday",
      "T": "Tuesday",
      "W": "Wednesday",
      "Th": "Thursday",
      "F": "Friday",
      "S": "Saturday",
      "TTh": ["Tuesday", "Thursday"],
      "MW": ["Monday", "Wednesday"],
      "TBA": "TBA"
    };
    return daysMapping[dayAbbreviation] || "Unknown";
  }

  function convertTimeFormat(time) {
    const [startTime, endTime] = time.split('-');
    const convertTo12HourFormat = (rawTime) => {
      const hours = parseInt(rawTime.substring(0, 2));
      const minutes = rawTime.substring(2);
      const period = hours >= 12 ? 'PM' : 'AM';
      const adjustedHours = hours % 12 || 12;
      return `${adjustedHours}:${minutes} ${period}`;
    };
    return {
      timeStart: convertTo12HourFormat(startTime),
      timeEnd: convertTo12HourFormat(endTime)
    };
  }

  const addScheduleToFirestore = (schedule) => {
    firestore.collection(`users/${currentUser.uid}/classSchedules`).add(schedule)
      .then((docRef) => {
        console.log('Schedule added with ID: ', docRef.id);
      })
      .catch((error) => {
        console.error('Error adding schedule: ', error);
      });
  };

  const performOCR = (file) => {
    // Reset classSchedule to clear previous data
    setClassSchedule([]);

    let myHeaders = new Headers();
    myHeaders.append('apikey', 'FEmvQr5uj99ZUvk3essuYb6P5lLLBS20');
    myHeaders.append('Content-Type', 'multipart/form-data');

    let raw = file;
    let requestOptions = {
      method: 'POST',
      redirect: 'follow',
      headers: myHeaders,
      body: raw,
    };

    fetch('https://api.apilayer.com/image_to_text/upload', requestOptions)
      .then((response) => response.json())
      .then((result) => {
        const extractedText = result['all_text'];
        console.log(extractedText);
        const structuredData = parseCourseData(extractedText);
        console.log(structuredData);
        const convertedSchedule = structuredData.map(course => ({
          ...course,
          day: convertDayAbbreviationToFull(course.day),
          time: convertTimeFormat(course.time)
        }));
        console.log(convertedSchedule); // Log convertedSchedule here
        setClassSchedule(convertedSchedule);
        // Add each schedule to Firebase
        convertedSchedule.forEach(schedule => {
          addScheduleToFirestore(schedule);
        });
      })
      .catch((error) => {
        console.log('Error performing OCR:', error.message);
        // Alert the user to capture a clearer picture of the RF
        alert('Error: Unable to extract text from the image. Please capture a clearer picture.');
      });
  };

  const pickImageGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      allowsMultipleSelection: false,
    });
    if (!result.cancelled) {
      performOCR(result.assets[0]);
      setImage(result.assets[0].uri);
    }
  };

  const pickImageCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      allowsMultipleSelection: false,
    });
    if (!result.cancelled) {
      performOCR(result.assets[0]);
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topContainer}>
        {/* <Image source={require('./rf_scanner_image.png')} style={styles.rfImage} /> */}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Pick from Gallery"
          onPress={pickImageGallery}
          icon={<MaterialCommunityIcons name="image-multiple" size={24} color="white" />}
          buttonStyle={styles.button}
        />
        <Button
          title="Pick from Camera"
          onPress={pickImageCamera}
          icon={<MaterialCommunityIcons name="camera" size={24} color="white" />}
          buttonStyle={styles.button}
        />
      </View>
      {image && (
        <View style={styles.imageContainer}>
          <Text>Image Preview:</Text>
          <Image source={{ uri: image }} style={styles.image} />
        </View>
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 50
  },
  topContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  rfImage: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    width: 150,
    backgroundColor: 'green',
    borderRadius: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: 300,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
  },
});
