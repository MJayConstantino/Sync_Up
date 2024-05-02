import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Button, StyleSheet, Text, Image, SafeAreaView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
    const [image, setImage] = useState(null);
    const [schedule, setSchedule] = useState([]);

    // Function to parse the course data
    function parseCourseData(data) {
        const schedules = [];
        const lines = data.split('\n');

        for (let i = 0; i < lines.length; i += 5) {
            const stubCodeSubjectLine = lines[i].trim().split(' ');
            const timeDayLine = lines[i + 1].trim().split(' ');
            const roomLine = lines[i + 2].trim();
            const instructorLine = lines[i + 3].trim();

            const schedule = {
                stubCode: stubCodeSubjectLine[0],
                subject: stubCodeSubjectLine.slice(1).join(' '),
                time: timeDayLine[1],
                day: timeDayLine[2],
                room: roomLine,
                instructor: instructorLine
            };

            schedules.push(schedule);
        }

        return schedules;
    }

    // Function to pick an image from the gallery
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

    // Function to pick an image from the camera
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

    // Function to perform OCR on the image
    const performOCR = (file) => {
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
                const structuredData = parseCourseData(extractedText);
                setSchedule(structuredData);
            })
            .catch((error) => console.log('error', error));
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.heading}>OCR App</Text>
                <Text style={styles.heading2}>Image to Text App</Text>
            </View>
            <View style={styles.imageContainer}>
                <Button title="Pick an image from gallery" onPress={pickImageGallery} />
                <Button title="Pick an image from camera" onPress={pickImageCamera} />
                {image && <Image source={{ uri: image }} style={styles.image} />}
            </View>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5', // Light gray background
        padding: 20,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    heading: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'green',
        textAlign: 'center',
    },
    heading2: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'black',
        textAlign: 'center',
    },
    imageContainer: {
        alignItems: 'center',
    },
    image: {
        width: 400,
        height: 300,
        marginTop: 20,
        resizeMode: 'contain',
    },
});
