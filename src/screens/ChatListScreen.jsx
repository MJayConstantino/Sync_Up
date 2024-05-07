import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, onSnapshot, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { firebase } from '../../firebase-config';
import moment from 'moment';

const DEFAULT_PROFILE_PIC = 'https://firebasestorage.googleapis.com/v0/b/syncup-4b36a.appspot.com/o/profilepic.png?alt=media&token=4f9acff6-166b-4e21-9ac8-42bc5f441e63';

const database = firebase.firestore();
const auth = firebase.auth()

const ChatListScreen = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [recentMessages, setRecentMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collectionRef = collection(database, 'users');
    const q = query(collectionRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const name = `${data.firstName} ${data.lastName}`.trim();
        return {
          id: doc.id,
          name,
          email: data.email,
          profilePicture: data.profilePicture,
        };
      });

      setAllUsers(userList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribes = allUsers.map((user) => {
      const currentUserEmail = auth.currentUser?.email;
      const userEmails = [currentUserEmail, user.email].sort();
      const chatRoomId = userEmails.join('_');

      const chatRef = collection(database, 'chats', chatRoomId, 'messages');
      const recentMessageQuery = query(chatRef, orderBy('createdAt', 'desc'), limit(1));

      const unsubscribe = onSnapshot(recentMessageQuery, (snapshot) => {
        if (snapshot.docs.length > 0) {
          const recentMessage = snapshot.docs[0].data();
          const createdAt = recentMessage.createdAt?.toDate();
          setRecentMessages((prev) => ({
            ...prev,
            [chatRoomId]: {
              ...recentMessage,
              createdAt,
            },
          }));
        }
      });

      return unsubscribe;
    });

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [allUsers]);

  const handleUserPress = (user) => {
    const currentUserEmail = auth.currentUser?.email;
    const userEmails = [currentUserEmail, user.email].sort();
    const chatRoomId = userEmails.join('_');

    const chatRef = collection(database, 'chats', chatRoomId, 'messages');
    const messageToUpdate = recentMessages[chatRoomId]?.id;
    if (messageToUpdate) {
      const messageDoc = doc(chatRef, messageToUpdate);
      updateDoc(messageDoc, { read: true });
    }

    navigation.navigate('ChatScreen', {
      chatRoomId,
      userName: user.name,
    });
  };

  const usersWithRecentMessages = allUsers
    .filter((user) => {
      const currentUserEmail = auth.currentUser?.email;
      const userEmails = [currentUserEmail, user.email].sort();
      const chatRoomId = userEmails.join('_');

      return Boolean(recentMessages[chatRoomId]);
    })
    .sort((a, b) => {
      const currentUserEmail = auth.currentUser?.email;
      const aEmails = [currentUserEmail, a.email].sort();
      const bEmails = [currentUserEmail, b.email].sort();
      const aChatRoomId = aEmails.join('_');
      const bChatRoomId = bEmails.join('_');

      const aMessage = recentMessages[aChatRoomId];
      const bMessage = recentMessages[bChatRoomId];

      if (aMessage?.createdAt && bMessage?.createdAt) {
        return bMessage.createdAt - aMessage.createdAt; // Latest message at the top
      }

      return 0;
    });

  const filteredSearchResults = allUsers.filter((user) => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <ActivityIndicator style={{flex: 1, justifyContent: "center", alignItems: "center"}} color="00adf5" size="large" />
    )
  } else return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search users..."
        value={searchTerm}
        onChangeText={(text) => setSearchTerm(text)}
      />
      <FlatList
        data={searchTerm ? filteredSearchResults : usersWithRecentMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const currentUserEmail = auth.currentUser?.email;
          const userEmails = [currentUserEmail, item.email].sort();
          const chatRoomId = userEmails.join('_');

          const recentMessage = recentMessages[chatRoomId];
          const recentText = recentMessage ? recentMessage.text : '';
          const isUnread = recentMessage && !recentMessage.read;

          const profilePic = item.profilePicture || DEFAULT_PROFILE_PIC;
          const messageTime = recentMessage?.createdAt
            ? moment(recentMessage.createdAt).format('HH:mm')
            : '';

            return (
            <TouchableOpacity
              onPress={() => handleUserPress(item)}
              style={styles.userContainer}
            >
              <View style={styles.mainContent}>
                <Image
                  source={{ uri: profilePic }}
                  style={styles.profileImage}
                />
                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.userName,
                      isUnread ? { fontWeight: 'bold' } : {},
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.recentMessage,
                      isUnread ? { fontWeight: 'bold', color: 'black' } : {},
                    ]}
                  >
                    {recentText}
                  </Text>
                </View>
              </View>

              {messageTime && (  // This is the separate time container
                <View style={styles.timeContainer}>
                  <Text style={styles.messageTime}>{messageTime}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 25
  },
  searchBar: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  userContainer: {
    flexDirection: 'row',            // Keep elements in a row
    alignItems: 'center',            // Align centrally
    padding: 10,                     // Padding for spacing
    borderBottomWidth: 1,            // Bottom border for separation
    borderBottomColor: '#ccc',       // Border color
    justifyContent: 'space-between', // Ensure the time container is on the far right
  },
  mainContent: { // New container for the profile image and text
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  textContainer: {
    flexDirection: 'column',
  },
  recentMessageContainer: {
    flexDirection: 'row',            // Keep elements in a row
    justifyContent: 'space-between', // Ensure spacing between elements
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  recentMessage: {
    fontSize: 16,
    color: 'gray',
  },
  timeContainer: { // New style for the time container
    flex: 1,                          // Take full width
    alignItems: 'flex-end',           // Align time to the right
  },
  messageTime: {
    fontSize: 14,                     // Font size for message time
    color: 'gray',                     // Color for message time
    textAlign: 'right',                // Ensure time is aligned to the right
  },
});

export default ChatListScreen;