import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, ScrollView, TouchableWithoutFeedback, TextInput } from "react-native"
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { assets, Colors } from '../constants';
import useColorScheme from '../hooks/useColorScheme';
import StyledTextInput from './StyledTextInput';
import { BoldText } from './StyledText';
import ProfileButton from './ProfileButton';
import Button from './Button';
import CustomImage from './CustomImage';
import { useSelector } from 'react-redux';
import SendButton from './SendButton';
import ChatMessage from './ChatMessage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDefaultImage } from '../utils';


const ChatInput = ({ inputRef, replyingMessage, setReplyingMessage, onCameraPress, onDeskPress, onSendPress, onBurningQuestionPress, onImagePress, loading, ...props }) => {
    const colorScheme = useColorScheme()
    const currentUser = useSelector(state => state.userState.currentUser);

    const insets = useSafeAreaInsets();
    return (

        <View style={[{ position: 'absolute', width: '100%', bottom: 0, backgroundColor: 'transparent', }]}>
            {replyingMessage &&
                <View

                    style={{ backgroundColor: 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 10 }}>

                    <View style={{ backgroundColor: Colors[colorScheme].invertedTint, padding: 5, borderWidth: 1, borderColor: Colors[colorScheme].gray, borderRadius: 8, marginBottom: 10, flex: 1, marginRight: 5 }}>
                        <ChatMessage
                            disabled
                            style={{ marginBottom: 0 }}
                            message={replyingMessage}
                            useCase={'reply'} />
                    </View>




                    <TouchableOpacity

                        onPress={() => { setReplyingMessage(null); }}
                        style={{ backgroundColor: Colors[colorScheme].gray, borderRadius: 50, padding: 8, justifyContent: 'center', alignItems: 'center' }}>

                        <Image source={assets.close} style={{ width: 15, height: 15, tintColor: Colors[colorScheme].veryDarkGray }} />
                    </TouchableOpacity>
                </View>



            }
            <View

                style={[styles.container, { backgroundColor: Colors[colorScheme].invertedTint, borderTopColor: Colors[colorScheme].gray }]}>


                <StyledTextInput
                    inputRef={inputRef}
                    containerStyle={{ flex: 1, marginRight: 10 }}
                    multiline
                    enablesReturnKeyAutomatically
                    style={{ maxHeight: 150, paddingLeft: 45 }}
                    icon={

                        <ProfileButton
                            size={35}
                            defaultImage={getDefaultImage('private')}
                            imageURL={currentUser.photoURL}
                        />
                    }
                    {...props}

                />
                <SendButton
                    style={{ width: 40, maxHeight: 40, paddingHorizontal: 0 }}
                    onPress={onSendPress}
                    loading={loading}
                    animationEnabled={false}
                    disabled={!props.vale && !props.content}

                />

            </View>
            <View style={{ backgroundColor: Colors[colorScheme].invertedTint, height: insets.bottom + 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

                <TouchableOpacity onPress={onCameraPress}>
                    <Image source={assets.camera_o} style={{ width: 28, height: 28, tintColor: Colors[colorScheme].darkGray }} />
                </TouchableOpacity>


                <TouchableOpacity onPress={onImagePress}>
                    <Image source={assets.image} style={{ width: 28, height: 28, tintColor: Colors[colorScheme].darkGray }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDeskPress}>
                    <Image source={assets.desk} style={{ width: 28, height: 28, tintColor: Colors[colorScheme].darkGray }} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onBurningQuestionPress}>
                    <Image source={assets.burning_question} style={{ width: 28, height: 28, tintColor: Colors[colorScheme].darkGray }} />
                </TouchableOpacity>
            </View>

        </View>

    )
}

const styles = StyleSheet.create({

    container: {
        paddingHorizontal: 15,
        bottom: 0,
        borderTopWidth: 1,
        flexDirection: 'row',
        paddingTop: 10,
        alignItems: 'center'
    },

    textInput: {
        maxHeight: 200,
        fontSize: 16
    },

    rightContainer: {
        flexDirection: 'row',
        marginRight: 10,
        alignItems: 'center'
    },
    cameraButton: {
        borderRadius: 50,
        backgroundColor: Colors.accent,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center'
    }
})



export default ChatInput