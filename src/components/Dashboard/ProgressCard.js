import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { firebase } from '../../../firebase-config';
import { PieChart } from 'react-native-chart-kit';
import { ScrollView } from 'react-native-gesture-handler';

const screenWidth = Dimensions.get('window').width;

const ProgressCard = () => {
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const currentUser = firebase.auth().currentUser;

    const unsubscribeCompleted = firebase.firestore()
      .collection(`users/${currentUser.uid}/tasks`)
      .where('isCompleted', '==', true)
      .onSnapshot(snapshot => {
        setCompletedCount(snapshot.size);
      }, error => {
        console.error('Error fetching completed task count:', error);
      });

    const unsubscribePending = firebase.firestore()
      .collection(`users/${currentUser.uid}/tasks`)
      .where('isCompleted', '==', false)
      .onSnapshot(snapshot => {
        setPendingCount(snapshot.size);
      }, error => {
        console.error('Error fetching pending task count:', error);
      });

    return () => {
      unsubscribeCompleted();
      unsubscribePending();
    };
  }, []);

  const data = [
    {
      name: 'Completed',
      count: completedCount,
      color: '#32CD32',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Pending',
      count: pendingCount,
      color: '#FF6347',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ];

  return (
    <ScrollView> 
    <View style={styles.container}>
      <Text style={styles.title}>Task Progress</Text>
      <PieChart
        data={data}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#1cc910',
          backgroundGradientFrom: '#eff3ff',
          backgroundGradientTo: '#efefef',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          strokeWidth: 2,
          barPercentage: 0.5,
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>

    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderColor: 'black',
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default ProgressCard;
