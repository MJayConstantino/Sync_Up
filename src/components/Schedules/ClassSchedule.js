import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ClassSchedule = ({ stubCode, subject, time, instructor, room, day }) => {
  return (
    <View style={[styles.item, { backgroundColor: "transparent" }]}>
    <View style={[styles.codeContainer, { backgroundColor: "#90EE90" }]}>
        <Text style={styles.categoryText}>Stub Code - {stubCode}</Text>
      </View>
      <View style={styles.timeContainer}>
        <MaterialCommunityIcons name="clock-outline" size={15} color="#000" />
        <Text style={styles.timeText}>{time.timeStart} - {time.timeEnd} </Text>
      </View>
      <View style={styles.topContainer}>
        <Text style={styles.scheduleName}>{subject}</Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.descriptionText}>{room}</Text>
        <Text style={styles.descriptionText}>{instructor}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 0.5,
    minHeight: 120,
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  scheduleName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 16,
    marginLeft: 5,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 12,
  },
  codeContainer: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
});

export default ClassSchedule;
