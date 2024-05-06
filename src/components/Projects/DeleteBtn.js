import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import { EvilIcons } from '@expo/vector-icons';

const DeleteBtn = ({deleteTask}) => {
    return (
        <View>
            <TouchableOpacity onPress={deleteTask}>
                <EvilIcons name="trash" size={24} style={{ padding: 10 }} color="red" />
            </TouchableOpacity>
        </View>
    )
}

export default DeleteBtn