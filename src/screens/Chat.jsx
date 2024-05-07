import React, { useState, useLayoutEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { GiftedChat, Message } from 'react-native-gifted-chat';
import { collection, addDoc, orderBy, query, onSnapshot, updateDoc } from 'firebase/firestore';
import { firebase } from '../../firebase-config';
import { useRoute, useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import colors from '../components/Chat/colors';

const DEFAULT_PROFILE_PIC = 'https://firebasestorage.googleapis.com/v0/b/syncup-4b36a.appspot.com/o/profilepic.png?alt=media&token=4f9acff6-166b-4e21-9ac8-42bc5f441e63';

const database = firebase.firestore();
const auth = firebase.auth()

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const chatRoomId = route.params?.chatRoomId;
  const userName = route.params?.userName;
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${userName}`, // Only set the username as the title
      headerRight: undefined, // Remove the header right component
    });
  }, [navigation, userName]);

  useLayoutEffect(() => {
    const collectionRef = collection(database, 'chats', chatRoomId, 'messages');
    const q = query(collectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages = querySnapshot.docs.map((doc) => ({
        _id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        text: doc.data().text,
        user: {
          _id: doc.data().user._id,
          name: doc.data().user.name,
          avatar: doc.data().user.avatar || DEFAULT_PROFILE_PIC,
        },
        read: doc.data().read,
      }));

      setMessages(fetchedMessages);

      // Mark unread messages as read
      querySnapshot.docs.forEach((doc) => {
        if (!doc.data().read) {
          updateDoc(doc.ref, { read: true }); // Mark as read
        }
      });

      setLoading(false); // Set loading to false after data is fetched
    });

    return () => unsubscribe();
  }, [chatRoomId]);

  const onSend = useCallback(
    (messages = []) => {
      const newMessage = messages[0];
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );

      addDoc(collection(database, 'chats', chatRoomId, 'messages'), {
        _id: newMessage._id,
        createdAt: newMessage.createdAt,
        text: newMessage.text,
        user: {
          _id: newMessage.user._id,
          name: newMessage.user.name,
          avatar: DEFAULT_PROFILE_PIC,
        },
        read: false,
      });
    },
    [chatRoomId]
  );

  const renderMessage = (props) => {
    const { currentMessage, previousMessage } = props;

    const isMostRecentRead = previousMessage
      ? !previousMessage.read && currentMessage.read
      : false;

    return (
      <View>
        <Message {...props} />
        {isMostRecentRead && currentMessage.user._id !== auth.currentUser.email ? (
          <Text style={styles.readText}>Read</Text>
        ) : null}
      </View>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="blue" size="large" />
    )
  } else return (
    <GiftedChat
      messages={messages}
      onSend={(newMessages) => onSend(newMessages)}
      user={{
        _id: auth.currentUser?.email,
        name: auth.currentUser?.displayName,
        avatar: DEFAULT_PROFILE_PIC,
      }}
      renderMessage={renderMessage}
      messagesContainerStyle={{
        backgroundColor: '#fff',
      }}
      textInputStyle={{
        backgroundColor: '#fff',
        borderRadius: 20,
      }}
    />
  );
}

const styles = StyleSheet.create({
  readText: {
    fontSize: 10,
    color: 'gray',
    alignSelf: 'flex-end',
    marginRight: 10,
  },
});
