import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { database, auth } from '../../firebase-config';
import md5 from 'md5';

const ChatListScreen = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [recentMessages, setRecentMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();

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
          setRecentMessages((prev) => ({
            ...prev,
            [chatRoomId]: recentMessage,
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

    // Update the 'read' status to true when the user navigates to the chat
    const chatRef = collection(database, 'chats', chatRoomId, 'messages');
    // The actual query to mark as read would be more complex
    const messageToUpdate = recentMessages[chatRoomId]?.id;
    if (messageToUpdate) {
      const messageDoc = chatRef.doc(messageToUpdate);
      messageDoc.update({ read: true }); // Mark as read when entering the chat
    }

    navigation.navigate('Chat', {
      chatRoomId,
      userName: user.name,
    });
  };

  const usersWithRecentMessages = allUsers.filter((user) => {
    const currentUserEmail = auth.currentUser?.email;
    const userEmails = [currentUserEmail, user.email].sort();
    const chatRoomId = userEmails.join('_');

    return Boolean(recentMessages[chatRoomId]);
  });

  const filteredSearchResults = allUsers.filter((user) => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
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

          const gravatarPic = `https://www.gravatar.com/avatar/${md5(item.email)}?d=identicon`;

          return (
            <TouchableOpacity
              onPress={() => handleUserPress(item)}
              style={styles.userContainer}
            >
              <Image
                source={{
                  uri: item.profilePicture || gravatarPic,
                }}
                style={styles.profileImage}
              />
              <View style={styles.textContainer}>
                <Text style={styles.userName}>{item.name}</Text>
                {recentText && (
                  <Text
                    style={[
                      styles.recentMessage,
                      isUnread && { fontWeight: 'bold', color: 'red' }, // Make the text bold if unread
                    ]}
                  >
                    {recentText}
                  </Text>
                )}
              </View>
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
  },
  searchBar: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
  userName: {
    fontSize: 20,
  },
  recentMessage: {
    fontSize: 16,
    color: 'gray',
  },
});

export default ChatListScreen;
