import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Schedule = ({ scheduleName, timeStart, timeEnd, description, date }) => {
  return (
    <View style={[styles.item, { backgroundColor: "transparent" }]}>
      <View style={styles.timeContainer}>
        <MaterialCommunityIcons name="clock-outline" size={15} color="#000" />
        <Text style={styles.timeText}>{timeStart} -{timeEnd}</Text>
      </View>
      <View style={styles.topContainer}>
        <Text style={styles.scheduleName}>{scheduleName}</Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.descriptionText}>{description}</Text>
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
    flexWrap: "wrap",
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 12,
  },
});

export default Schedule;
