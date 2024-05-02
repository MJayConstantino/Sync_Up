import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import React, {useState, useCallback, useLayoutEffect, useEffect} from 'react'
import { database, auth } from '../../firebase-config'
import { GiftedChat } from 'react-native-gifted-chat';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
    collection,
    addDoc,
    orderBy,
    query,
    onSnapshot
} from 'firebase/firestore'


const Chat = () => {
    return(
        <Text>cHAT</Text>
    );
}

export default Chat;