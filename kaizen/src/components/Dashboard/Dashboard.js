import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Button } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

export default function Dashboard({route}) {
    const [users, setUsers] = useState([]);
    const [userName, setUserName] = useState("");
    const navigation = useNavigation();
    const isFocused = useIsFocused();


//rest of the code...
}