import {
    View,
    Text,
    Image,
    StyleSheet,
    FlatList,
    Keyboard,
    TouchableOpacity,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    PushNotificationIOS,
    Dimensions
} from 'react-native'
import * as MediaLibrary from 'expo-media-library'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { assets, Colors } from '../constants'
import ChatInput from '../components/ChatInput'
import { auth, db } from '../Firebase/firebase'
import Header from '../components/Header'
import { ProfileButton } from '../components'
import ChatModal from '../components/ChatModal'
import useColorScheme from '../hooks/useColorScheme'
import ChatMessage from '../components/ChatMessage'
import firebase from 'firebase/compat'
import CustomBottomSheet from '../components/CustomBottomSheet'
import { connect, useSelector } from 'react-redux'
import { ConfirmationModal } from '../components/Modals'
import { getDefaultImage, getErrorMessage, getItemLayout, haptics, openMediaLibrary } from '../utils'
import { createChat, pinMessage, sendMessage, unpinMessage, updateChat, updateMessage, updateMessageLikes } from '../services/chats'
import { bindActionCreators } from 'redux'
import { fetchMessages } from '../redux/actions/messages'
import { useMessages } from '../hooks/useMessages'
import { saveMediaToStorage } from '../services/media'
import { addNotification } from '../services/notifications'
import { MediumText, RegularText } from '../components/StyledText'
import { ScrollView } from 'react-native-gesture-handler'
import Button from '../components/Button'
import ScaleButton from '../components/ScaleButton'
import SpecialChatItem from '../components/SpecialChatItem'
import SlideModal from '../components/SlideModal'

const Chat = (props) => {
    const [message, setMessage] = useState({ text: '', specialChatItem: null, contentType: '', deskItem: null, media: null });
    const scrollViewRef = useRef();
    const { photoURL, type, name, users, colors, icon, emoji, user, recentActivity } = props.route.params;
    const [chat, setChat] = useState({
        users,
        type,
        name,
        icon,
        emoji,
        user,
        photoURL,
        colors: typeof colors == 'object' ? colors : null
    })
    const [id, setId] = useState(props.route.params?.id);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showChatActionsModal, setShowChatActionsModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showTimestamp, setShowTimestamp] = useState(false);
    const colorScheme = useColorScheme();
    const [loading, setLoading] = useState(false);
    const inputRef = useRef();
    const [showImagesModal, setShowImagesModal] = useState(false);
    const currentUser = useSelector(state => state.userState.currentUser);
    const { width } = Dimensions.get('window');
    const [files, setFiles] = useState([]);
    const [hasGalleryPermission, setHasGalleryPermission] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const bs = useRef();
    const { messages } = useMessages(id);
    const [replyingMessage, setReplyingMessage] = useState(null);
    console.log(recentActivity)
    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        //if the current user has not seen the last message and the last message was sent by another user, then mark it as seen
        if (!recentActivity?.seenBy?.includes(auth.currentUser.uid) && recentActivity?.uid != auth.currentUser.uid) {
            updateChat(id, {
                recentActivity: {
                    ...recentActivity,
                    seenBy: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
                }
            });
        }



    }, [])



    const onSendPress = () => {

        //if there is no id (chat does not exist yet) then create it
        if (!id) {
            createChat({
                photoURL: photoURL || null,
                colors: colors || null,
                name: name || null,
                type,
                users,
                isPublic: false,

            })
                .then((id) => {
                    //set the chat id
                    setId(id);
                    //send the message
                    handleSend(id);
                })
        }
        else {
            handleSend(id);

        }


    }

    const handleSend = (id) => {
        setLoading(true);


        sendMessage(
            id,
            message.contentType,
            message.text,
            message.media,
            message.specialChatItem,
            replyingMessage

        )

            .then((messageId) => {
                setLoading(false);
                if (message.media != null) {
                    const filename = message.media.substring(message.media.lastIndexOf('/') + 1);
                    const path = `message/${messageId}/${filename}`;
                    saveMediaToStorage(message.media, path).then(url => {
                        updateMessage(id, messageId, { media: url });
                    });
                }
            })

            .catch(e => {
                setLoading(false);
                props.onTaskError(e.message)
            });

        setMessage({ text: null, specialChatItem: null, contentType: null, deskItem: null, media: null });
        setReplyingMessage(null);
    }
    const headerLeft = () => {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableWithoutFeedback onPress={() => props.navigation.goBack()}>

                    <Image source={assets.left_arrow} style={{ marginRight: 10, width: 25, height: 25, tintColor: Colors[colorScheme].tint }} />

                </TouchableWithoutFeedback>

                <ProfileButton
                    size={40}
                    imageURL={chat.type == 'private' ? chat.user?.photoURL || user?.photoURL : chat.photoURL}
                    emoji={chat.emoji}
                    defaultImage={chat.icon || getDefaultImage(chat.type)}
                    onPress={() => props.navigation.navigate('ChatProfile', { id, ...chat, setChat })}
                    name={chat.type == 'private' ? chat.user?.displayName : chat.name}
                    colors={chat.colors}
                    showsName


                />
            </View>
        )
    }



    const onReportPress = () => {

        setShowChatActionsModal(false);
        props.navigation.navigate('SendReport', {
            data: {
                type: 'message',
                id: message.id,
                chatId: id
            },
            title: 'Report',
            useCase: 'report'
        })


    }



    const onReplyPress = () => {

        setShowChatActionsModal(false);
        setReplyingMessage(selectedMessage);

    }

    const onLikePress = (message) => {
        haptics('light');
        const currentLikeState = message?.likes?.includes(auth.currentUser.uid);
        updateMessageLikes(currentLikeState, id, message.id)
            .catch((e) => props.onTaskError(getErrorMessage(e.message)))

    }
    const onCameraPress = () => {
        props.navigation.navigate('Camera', {
            chat: {
                id,
                type,
                users,
                name,
                photoURL,
            },

            useCase: 'chat'
        })
    }

    const onPinPress = (item) => {
        setShowChatActionsModal(false);

        if (item.pinned) {
            unpinMessage(id, item.id)
                .catch((e) => {
                    props.onTaskError(getErrorMessage(e))

                })
        }
        else {
            pinMessage(id, item.id)
                .catch((e) => {
                    props.onTaskError(getErrorMessage(e))

                })
        }

    }
    const isImageSelected = image => image == selectedImage;
    const onBurningQuestionPress = () => {
        props.navigation.navigate('NewBurningQuestion', {
            useCase: 'new',
            onSubmit: (data) => setMessage({ contentType: 'burning question', specialChatItem: data, text: null })
        });
    }


    const onImageSelected = image => {
        console.log(image);
        if (isImageSelected(image)) {
            setSelectedImage(null);
        }
        else {
            setSelectedImage(image);
        }
    }
    useEffect(() => {
        async function fetchAssets() {
            if (hasGalleryPermission) {
                const recentCameraRoll = await MediaLibrary.getAssetsAsync();
                setFiles(recentCameraRoll.assets);
            }

        }
        fetchAssets();
    }, [hasGalleryPermission]);
    const renderBottomSheetContent = () => {

        return (
            <View style={{ alignItems: 'center', height: '100%', backgroundColor: Colors[colorScheme].invertedTint, paddingHorizontal: 2 }}>

                {hasGalleryPermission ?
                    <View>
                        <View style={{ marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 }}>
                            <MediumText h4 onPress={() => setShowImagesModal(false)}>Cancel</MediumText>

                            <MediumText
                                accent={selectedImage}
                                h4
                                disabled={!selectedImage}
                                darkgray={!selectedImage}
                                onPress={() => {
                                    setSelectedImage(null);
                                    setMessage({ contentType: 'photo', text: null, media: selectedImage, specialChatItem: null });
                                    setShowImagesModal(false);
                                }} dis>Add</MediumText>
                        </View>
                        <ScrollView >

                            <FlatList
                                renderItem={({ item }) =>
                                    <ScaleButton onPress={() => onImageSelected(item.uri)}>


                                        <View style={{ width: width / 4 - 2, height: width / 4 - 2, margin: 1 }}>
                                            <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} />
                                            {isImageSelected(item.uri) && <View style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: Colors.accent, borderRadius: 25, padding: 8, justifyContent: 'center', alignItems: 'center' }}>
                                                <Image source={assets.check} style={{ width: 10, height: 10, tintColor: Colors.white }} />

                                            </View>}
                                        </View>
                                    </ScaleButton>
                                }
                                data={files}
                                keyExtractor={item => item.uri}
                                getItemLayout={getItemLayout}
                                numColumns={4}
                            />
                        </ScrollView>
                    </View>
                    :
                    <View>
                        <RegularText h4>Allow Binder to access your photos.</RegularText>
                        <Button
                            style={{ marginTop: 60 }}
                            title="Open Settings"
                            onPress={() => Linking.openSettings()}

                        />
                    </View>
                }
            </View>

        )
    }

    const onImagePress = () => {
        Keyboard.dismiss();
        setShowImagesModal(true);
        if (!hasGalleryPermission) {
            getGalleryPermissions();
        }

    }
    const getGalleryPermissions = async () => {
        if (!hasGalleryPermission) {
            const galleryStatus = await MediaLibrary.getPermissionsAsync();
            setHasGalleryPermission(galleryStatus.status == 'granted');

        }


    }


    const getContent = () => {
        if (message.specialChatItem) {
            return (<SpecialChatItem useCase={'edit'} message={message} />)
        }
        else if (message.media) {
            return (
                <View style={{ width: 100, height: 150, borderRadius: 15, overflow: 'hidden' }}>


                    <Image source={{ uri: message.media }} style={{ width: '100%', height: '100%' }} />
                </View>
            )
        }

    }


    return (

        <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>

            <Header
                headerLeft={headerLeft()}
                border
                headerLeftStyle={{ width: '100%', paddingHorizontal: 15 }}

            />

            <ChatModal
                visible={showChatActionsModal}
                onCancel={() => { setShowChatActionsModal(false); setSelectedMessage(null) }}
                message={selectedMessage}
                onPinPress={() => onPinPress(selectedMessage)}
                onReplyPress={onReplyPress}
                startValue={0}
                onReportPress={onReportPress}

            />
            <SlideModal
                toValue={0.5}
                onCancel={() => setShowConfirmationModal(false)}
                showModal={showConfirmationModal}>


                <ConfirmationModal
                    message={'Are you sure you want to discard this message?'}
                    onConfirmPress={() => { setShowConfirmationModal(false); setMessage({ text: '', contentType: '', specialChatItem: null }) }}
                    onCancelPress={() => setShowConfirmationModal(false)}
                />
            </SlideModal>

            <CustomBottomSheet
                ref={bs}
                snapPoints={[300, 0]}
                show={showImagesModal}
                renderContent={renderBottomSheetContent}
                onCloseEnd={() => setShowImagesModal(false)}

            />



            <KeyboardAvoidingView
                style={styles.keyboardAvoidContainer}
                behavior={Platform.OS == "ios" ? "height" : "height"}>



                <FlatList
                    ListFooterComponent={<View style={{ height: inputRef.current?.isFocused() ? 200 : 120 }} />}
                    ListHeaderComponent={<View style={{ margin: 10 }} />}
                    data={messages}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    onScrollBeginDrag={() => setShowTimestamp(true)}
                    keyboardDismissMode='interactive'
                    keyExtractor={item => item?.id || Math.random(10 ** 10)}
                    onScrollEndDrag={() => setTimeout(() => setShowTimestamp(false), 2000)}
                    renderItem={({ item, index }) =>

                        <ChatMessage
                            useCase='chat'
                            style={{ marginHorizontal: 10 }}
                            showTimestamp={showTimestamp}
                            message={item}
                            messages={messages}
                            nextMessage={index < messages.length ? messages[index + 1] : null}
                            onLongPress={() => { setSelectedMessage(item); setShowChatActionsModal(true) }}
                            previousMessage={index > 0 ? messages[index - 1] : null}
                            onLikePress={() => onLikePress(item)}
                            chatId={id}
                            onPinPress={() => onPinPress(item)}
                        />
                    }
                />



                <ChatInput
                    inputRef={inputRef}
                    setContent={(value) => setMessage({
                        contentType: '',
                        text: null,
                        specialChatItem: typeof value == 'object' && value,
                        media: typeof value == 'string' && value
                    })}
                    placeholder={replyingMessage ? 'Reply' : 'Send a message'}
                    loading={loading}
                    replyingMessage={replyingMessage}
                    setReplyingMessage={setReplyingMessage}
                    onDiscardPress={() => setShowConfirmationModal(true)}
                    onCameraPress={onCameraPress}
                    onSendPress={onSendPress}
                    onBurningQuestionPress={onBurningQuestionPress}
                    value={message.text}
                    onImagePress={onImagePress}
                    photoURL={currentUser.photoURL}
                    content={getContent()}
                    deskItem={message.deskItem}
                    onChangeText={(text) => setMessage({ text, contentType: 'text' })}
                    onDeskPress={() => props.navigation.navigate('SelectDeskItem', {
                        onSubmit: (item) => setMessage({ text: '', specialChatItem: item, contentType: 'desk item', media: null })
                    })}

                />


            </KeyboardAvoidingView>





        </View>
    )
}






const styles = StyleSheet.create({

    keyboardAvoidContainer: {
        flex: 1,

    },
    container: {
        flex: 1
    },
    icon: {
        tintColor: Colors.light.tint,
        width: 30,
        height: 30

    },
    classHeader: {
        padding: 30,
        alignContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },

    headerIcons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        width: '60%'

    },
    bottomSheetHeader: {
        borderTopLeftRadius: 20,
        padding: 20,
        borderTopRightRadius: 20,

    }
})
const mapStateToProps = store => ({
    currentUser: store.userState.currentUser,
    chatrooms: store.userState.chatrooms,
    school: store.schoolState.school,
    messages: store.messagesState.messages,

})
const mapDispatchProps = dispatch => bindActionCreators({ fetchMessages }, dispatch)
export default connect(mapStateToProps, mapDispatchProps)(Chat)