import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { GiftedChat, Message } from 'react-native-gifted-chat';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'; // Import 'where' correctly
import { firebase } from '../../firebase-config';
import { useRoute, useNavigation } from '@react-navigation/native';

const DEFAULT_PROFILE_PIC = 'https://firebasestorage.googleapis.com/v0/b/syncup-4b36a.appspot.com/o/profilepic.png?alt=media&token=4f9acff6-166b-4e21-9ac8-42bc5f441e63';

const database = firebase.firestore();
const auth = firebase.auth();

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAvatar, setUserAvatar] = useState(DEFAULT_PROFILE_PIC);
  const navigation = useNavigation();
  const route = useRoute();
  const chatRoomId = route.params?.chatRoomId;
  const userName = route.params?.userName;

  // Extract the other user's email from chatRoomId
  const currentUserEmail = auth.currentUser?.email;
  const otherUserEmail = chatRoomId
    .split('_')
    .find((email) => email !== currentUserEmail);

  // Retrieve other user's profile picture
  useEffect(() => {
    const userDocRef = collection(database, 'users');
    const userQuery = query(userDocRef, ('email', '==', otherUserEmail)); // Correct use of 'where'

    const unsubscribe = onSnapshot(userQuery, (snapshot) => {
      if (snapshot.docs.length > 0) {
        const userData = snapshot.docs[0].data();
        setUserAvatar(userData.imageUrl || DEFAULT_PROFILE_PIC); // Update avatar
      }
    });

    return () => unsubscribe();
  }, [otherUserEmail]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `${userName}`,
    });
  }, [navigation, userName]);

  useLayoutEffect(() => {
    const messagesRef = collection(database, 'chats', chatRoomId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        _id: doc.id,
        createdAt: doc.data().createdAt.toDate(),
        text: doc.data().text,
        user: {
          _id: doc.data().user._id,
          name: doc.data().user.name,
          avatar: doc.data().user.avatar || DEFAULT_PROFILE_PIC,
        },
      }));

      setMessages(fetchedMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatRoomId]);

  const onSend = useCallback(
    (messages = []) => {
      const newMessage = messages[0];
      setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));

      addDoc(collection(database, 'chats', chatRoomId, 'messages'), {
        _id: newMessage._id,
        createdAt: newMessage.createdAt,
        text: newMessage.text,
        user: {
          _id: auth.currentUser?.email,
          name: auth.currentUser?.displayName,
          avatar: auth.currentUser?.imageUrl || DEFAULT_PROFILE_PIC,
        },
      });
    },
    [chatRoomId]
  );

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} color="00adf5" size="large" />;
  } else {
    return (
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: auth.currentUser?.email,
          name: auth.currentUser?.displayName,
          avatar: auth.currentUser?.imageUrl || DEFAULT_PROFILE_PIC,
        }}
        renderMessage={(props) => {
          const { currentMessage, previousMessage } = props;
          const isMostRecentRead = previousMessage ? !previousMessage.read && currentMessage.read : false;

          return (
            <View>
              <Message {...props} />
              {isMostRecentRead && currentMessage.user._id !== auth.currentUser.email ? (
                <Text style={styles.readText}>Read</Text>
              ) : null}
            </View>
          );
        }}
        messagesContainerStyle={{ backgroundColor: '#fff' }}
        textInputStyle={{ backgroundColor: '#fff', borderRadius: 20 }}
      />
    );
  }
}

const styles = StyleSheet.create({
  readText: {
    fontSize: 10,
    color: 'gray',
    alignSelf: 'flex-end',
    marginRight: 10,
  },
});
