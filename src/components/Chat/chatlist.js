import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import React from 'react'
import { FlatList } from 'react-native-gesture-handler';
import ChatItem from './chatitem';

export default function ChatList({users}){
    return(
        <View>
            <FlatList
                data={users} 
                contentContainerStyle={{flex: 1, paddingVertical: 25,}}
                keyExtractor={item=> Math.random()}
                showsVerticalScrollIndicator={false}
                renderItem={({item, index})=> <ChatItem item={item}/>}
                />
        </View>
    );
}
