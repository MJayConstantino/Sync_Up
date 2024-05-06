import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useCallback
  } from 'react';
  import { TouchableOpacity } from 'react-native';
  import { GiftedChat } from 'react-native-gifted-chat';
  import {
    collection,
    addDoc,
    orderBy,
    query,
    onSnapshot,
    doc,
    updateDoc
  } from 'firebase/firestore';
  import { signOut } from 'firebase/auth';
  import { auth, database } from '../../firebase-config';
  import { useRoute, useNavigation } from '@react-navigation/native';
  import { AntDesign } from '@expo/vector-icons';
  import colors from '../components/Chat/colors';
  
  export default function Chat() {
    const [messages, setMessages] = useState([]);
    const navigation = useNavigation();
    const route = useRoute();
    const chatRoomId = route.params?.chatRoomId;
    const userName = route.params?.userName;
  
    const onSignOut = () => {
      signOut(auth).catch((error) => console.log('Error logging out:', error));
    };
  
    useLayoutEffect(() => {
      navigation.setOptions({
        title: `${userName}`,
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 10 }}
            onPress={onSignOut}
          >
            <AntDesign name="logout" size={24} color={colors.gray} />
          </TouchableOpacity>
        ),
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
          user: doc.data().user,
          read: doc.data().read, // Include the "read" status
        }));
  
        setMessages(fetchedMessages);
  
        // Mark unread messages as read
        querySnapshot.docs.forEach((doc) => {
          if (!doc.data().read) {
            updateDoc(doc.ref, { read: true }); // Mark as read
          }
        });
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
          user: newMessage.user,
          read: false, // New messages are unread by default
        });
      },
      [chatRoomId]
    );
  
    return (
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: auth.currentUser?.email,
          name: auth.currentUser?.displayName,
        }}
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
  