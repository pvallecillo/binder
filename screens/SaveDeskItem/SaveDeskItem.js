import { View, ScrollView, Animated, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { Picker } from '@react-native-picker/picker'
import { assets, Colors } from '../../constants'
import { Dropdown } from 'react-native-element-dropdown'
import Button from '../../components/Button'
import { auth } from '../../Firebase/firebase'
import firebase from 'firebase/compat/app'
import useColorScheme from '../../hooks/useColorScheme'
import { connect, useSelector } from 'react-redux'
import StyledTextInput from '../../components/StyledTextInput'
import { Switch } from 'react-native-paper'
import FilterButton from '../../components/FilterButton'
import 'firebase/compat/storage';
import { faker } from '@faker-js/faker'
import { postDeskItem, updateDeskItem } from '../../services/desk'
import AnimatedHeader from '../../components/AnimatedHeader'
import SlideModal from '../../components/SlideModal'
import OptionsList from '../../components/OptionsList'
import DeskItemEditPreview from '../../components/DeskItemEditPreview'
import * as ImagePicker from 'expo-image-picker'
import { LightText, MediumText, RegularText } from '../../components/StyledText'
import { getItemLayout } from '../../utils'
import EditFlashcard from '../../components/FlashcardInput'
import styles from './styles'
import ToggleAnonymity from '../../components/ToggleAnonymity'
import { saveMediaToStorage } from '../../services/media'
import FlashcardInput from '../../components/FlashcardInput'
import CustomImage from '../../components/CustomImage'
import CustomBottomSheet from '../../components/CustomBottomSheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Text } from 'react-native'
const SaveDeskItem = (props) => {
    const { useCase, deskItem, onSave, questions } = props.route.params;
    const colorScheme = useColorScheme();
    const type = props.route.params?.type || deskItem?.type
    const [classId, setClassId] = useState(deskItem?.classId || null);
    const [selectedCard, setSelectedCard] = useState('');
    const divisionTypes = [
        { label: 'Chapter', value: 'Chapter' },
        { label: 'Section', value: 'Section' },
        { label: 'Unit', value: 'Unit' },
    ];
    const [title, setTitle] = useState(deskItem?.title || '');
    const [divisionNumber, setDivisionNumber] = useState(deskItem?.divisionNumber ? deskItem.divisionNumber + '' : '');
    const [isPublic, setIsPublic] = useState(deskItem?.isPublic != null ? deskItem?.isPublic : true);
    const [description, setDescription] = useState(deskItem?.description || '');
    const [isAnonymous, setIsAnonymous] = useState(deskItem?.isAnonymous != null ? deskItem.isAnonymous : false);
    const [cards, setCards] = useState(deskItem?.cards || []);
    const [media, setMedia] = useState(deskItem?.media || []);
    const [divisionType, setDivisionType] = useState(deskItem?.divisionType || divisionTypes[0].value);
    const [scrollY, setScrollY] = useState(new Animated.Value(0));
    const [scrollRef, setScrollRef] = useState(null);
    const currentUser = useSelector(state => state.userState.currentUser);
    const chats = useSelector(state => state.userChatsState.chats);
    const classes = chats.filter(item => item.type == 'class');
    const [loading, setLoading] = useState(false);
    const [showBottomSheetModal, setShowBottomSheetModal] = useState(false);
    const [time, setTime] = useState("untimed");
    const MAX = type == 'Flashcards' || type == 'Game' ? 20 : 8;
    const data = {
        classId,
        title: title.trim(),
        divisionType: !divisionNumber ? null : divisionType,
        divisionNumber: divisionNumber ? +divisionNumber : null,
        description: description.trim(),
        isPublic,
        isAnonymous,
        uid: auth.currentUser.uid,
        type: type
    };

    const notesData = {
        ...data,
        media
    };
    const flashcardsData = {
        ...data,
        cards

    };

    const gameData = {
        ...data,
        questions,
        time: time

    };



    const addImages = (images) => {
        const array = []
        for (let i = 0; i < images.length; i++) {
            if (media.length + array.length < MAX)
                array.push(images[i]);
        }
        setMedia([...media, ...array])

    }

    const addImage = (image) => {
        if (type === "Flashcards") {
            if (selectedCard === "cardA") {

                setIsCardAImage(true);
                setCardFront(image);
            }


            else {
                setIsCardBImage(true);
                setCardBack(image);

            }
        } else {

            setMedia([...media, image]);
        }


    }

    const canContinue = () => {
        return title.trim().length > 0;
    }
    const uploadCards = (id) => new Promise((resolve, reject) => {
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].cardA.isImage) {
                const media = cards[i].cardA.data;
                const filename = media.substring(media.lastIndexOf('/') + 1);
                const path = `desk-item/${auth.currentUser.uid}/${id + i}/${filename}`;

                saveMediaToStorage(media, path)
                    .then(url => {
                        cards[i].cardA.data = url;
                    })
                    .catch(reject);
            }

            if (cards[i].cardB.isImage) {
                const media = cards[i].cardB.data
                const filename = media.substring(media.lastIndexOf('/') + 1);
                const path = `desk-item/${auth.currentUser.uid}/${id + i}/${filename}`;

                saveMediaToStorage(media, path)
                    .then(url => {
                        cards[i].cardB.data = url;
                    })
                    .catch(reject)
            }
        }

    })

    const uploadMedia = (id) => new Promise((resolve, reject) => {

        for (let i = 0; i < media.length; i++) {
            //set the filename and path name
            const filename = media[i].substring(media[i].lastIndexOf('/') + 1);
            const path = `desk/${auth.currentUser.uid}/${id + i}/${filename}`;

            saveMediaToStorage(media[i], path)
                .then(url => {
                    resolve(url)

                })
                .catch(reject(e))
        }
    })


    const handleSave = async () => {
        setLoading(true);
        props.onTaskStart('Saving...');
        let data = data;
        if (type == "Flashcards") {
            data = flashcardsData;
        }
        else if (type == "Game") {
            data = gameData;
        }
        else {
            data = notesData;
        }


        //id representing the folder that all the uploaded images/videos will be put in
        if (useCase == 'new desk item')
            postDeskItem(data)
                .then((id) => {
                    if (type != 'Flashcards' && type != "Game")
                        uploadMedia(id)
                            .then((url) => updateDeskItem(id, { media: url }))
                    else
                        uploadCards(id)
                            .then(() => updateDeskItem(id, { cards }));
                })
                .then(() => {
                    setLoading(false);
                    props.onTaskComplete('Saved!');
                    props.navigation.goBack();


                })

                .catch(e => {
                    props.onTaskError(e.message);
                    props.navigation.goBack();

                })
        else
            updateDeskItem(deskItem.id, data)
                .then(() => {
                    if (type != "Flashcards" && type != "Game")
                        if (deskItem.media != media)
                            uploadMedia(deskItem.id)
                                .then((url) => updateDeskItem(deskItem.id, { media: url }))

                        else
                            if (deskItem.cards != cards)

                                uploadCards(deskItem.id)
                                    .then(() => updateDeskItem(deskItem.id, { cards }));
                })
                .then(() => {
                    setLoading(false);
                    props.onTaskComplete('Saved!');
                    onSave(data);
                    props.navigation.goBack();
                })

                .catch(e => {
                    props.onTaskError(e.message);

                })



    }


    const onClassSelect = (item) => {
        if (classId == item.id) {
            return setClassId(null);

        }
        else {
            setClassId(item.id);
        }
    }




    return (


        <GestureHandlerRootView style={{ flex: 1 }}>

            <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
                <CustomBottomSheet
                    height={300}
                    onToggle={() => setShowBottomSheetModal(false)}
                    show={showBottomSheetModal}
                    renderContent={() => <View style={{ paddingHorizontal: 30 }}>

                        <Picker
                            selectedValue={time}
                            style={{ width: '100%', height: 200 }}
                            enableInput={false}

                            onValueChange={(value, index) => {
                                setTime(value)
                            }}
                        >

                            <Picker.Item label='10 sec' value={10} />
                            <Picker.Item label='20 sec' value={20} />
                            <Picker.Item label='30 sec' value={30} />
                            <Picker.Item label='40 sec' value={40} />
                            <Picker.Item label='50 sec' value={50} />
                            <Picker.Item label='60 sec' value={60} />
                            <Picker.Item label='180 sec' value={180} />
                            <Picker.Item label='300 sec' value={300} />
                            <Picker.Item label='∞ no limit' value={"untimed"} />

                        </Picker>
                        <Button title="Done" onPress={() => setShowBottomSheetModal(false)} />

                    </View>}
                />

                <AnimatedHeader
                    animatedValue={scrollY}
                    title={useCase == 'new desk item' ? 'New ' + type : 'Edit ' + type}

                    direction={'horizontal'}

                />


                <ScrollView
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                    scrollEventThrottle={16}
                    style={{ padding: 15 }}
                    ref={(ref) => setScrollRef(ref)}
                    showsVerticalScrollIndicator={false}>





                    <MediumText verydarkgray h4 style={styles.sectionHeaderText}>{'Game Settings'}</MediumText>


                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <RegularText h4 style={{ flex: 1 }}>Time Limit:</RegularText>


                        <StyledTextInput
                            placeholder="Time"
                            editable={false}
                            containerStyle={{ flex: 1 }}
                            value={time.toString()}
                            isClearable={false}
                            onPress={() => setShowBottomSheetModal(true)}
                            rightIcon={<CustomImage source={assets.down_arrow} style={{ width: 28, height: 28, tintColor: Colors[colorScheme].darkGray }}
                            />}

                        />
                        <RegularText h5 style={{ flex: 1, marginLeft: 10 }}>seconds</RegularText>

                    </View>

                    <MediumText verydarkgray h4 style={styles.sectionHeaderText}>{'Topic Information'}</MediumText>

                    {
                        classes.length > 0 &&
                        <View>



                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}>

                                {classes.map((item) =>
                                    <FilterButton
                                        key={item.id}
                                        onPress={(item) => onClassSelect(item)}
                                        item={{
                                            text: item.name,
                                            id: item.id,
                                            imageURL: item.photoURL,
                                            icon: item.icon,
                                            emoji: item.emoji,
                                            colors: item?.colors
                                        }}
                                        isSelected={item.id === classId}

                                    />

                                )}

                            </ScrollView>
                            <LightText verydarkgray style={{ marginTop: 10, marginBottom: 30 }}>
                                {type[type.length - 1] == 's' ? 'Select which class your ' + type + ' are for.' :
                                    'Select which class your ' + type + ' is for'}
                            </LightText>
                        </View>
                    }

                    <View style={{ flexDirection: 'row' }}>
                        <Dropdown
                            data={divisionTypes}
                            value={divisionType}
                            onChange={item => { setDivisionType(item.value) }}
                            placeholderStyle={{ color: 'darkgray', fontFamily: 'Avenir Next' }}
                            style={{ width: '50%', height: 42, borderRadius: 50, backgroundColor: Colors[colorScheme].lightGray, padding: 10 }}
                            maxHeight={400}
                            containerStyle={{ backgroundColor: colorScheme === 'light' ? '#E5E5E5' : 'black', borderWidth: 0, borderRadius: 15 }}
                            labelField="label"
                            valueField="value"
                            itemContainerStyle={{ backgroundColor: colorScheme === 'light' ? '#E5E5E5' : 'black', borderRadius: 15 }}
                            itemTextStyle={{ color: Colors[colorScheme].tint }}
                            selectedTextStyle={{ color: Colors[colorScheme].tint }}
                            fontFamily='Avenir Next'
                            showsVerticalScrollIndicator={false}
                            autoScroll={false}

                            placeholder={divisionType}
                        />


                        <StyledTextInput
                            isClearable
                            containerStyle={{ flex: 1, marginLeft: 20 }}
                            placeholder={divisionType + ' number'}
                            value={divisionNumber}
                            onChangeText={setDivisionNumber}
                            keyboardType='decimal-pad'
                            returnKeyType='done'
                            returnKeyLabel='done'
                        />
                    </View>
                    <View style={{ marginTop: 20 }}>


                        <StyledTextInput
                            isClearable
                            placeholder={'Topic title'}
                            value={title}
                            onChangeText={setTitle}
                        />


                    </View>
                    <MediumText h4 verydarkgray style={styles.sectionHeaderText}>{'Description'}</MediumText>

                    <StyledTextInput
                        multiline
                        placeholder={'Add a Description...'}
                        value={description}
                        onChangeText={setDescription}
                        style={{ height: 100 }}
                        containerStyle={{ borderRadius: 15 }}
                        onFocus={() => scrollRef.scrollToEnd()}
                        isClearable



                    />




                    <MediumText h4 verydarkgray style={styles.sectionHeaderText}>{'Privacy'}</MediumText>

                    <View style={{ borderRadius: 15, padding: 15, backgroundColor: Colors[colorScheme].lightGray }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <RegularText h4 >{"Public"}</RegularText>
                            <Switch color={Colors.accent} value={isPublic} onChange={() => setIsPublic(!isPublic)} />
                        </View>

                        <RegularText darkgray>{isPublic ? 'Anyone can see these ' + type + "." : 'Only you can see these ' + type + "."} </RegularText>
                    </View>

                    <LightText verydarkgray style={{ marginTop: 10 }}>{'Manage who can see your ' + type + ' by making them Public or Private.'}</LightText>


                    <ToggleAnonymity style={{ marginTop: 20 }} action={'Save'} isOn={!isAnonymous} user={currentUser} onToggle={() => setIsAnonymous(!isAnonymous)} />

                    <LightText verydarkgray style={{ marginTop: 10, marginBottom: 100 }}>{"Save your " + type + " anonomously to keep your name and profile picture from appearing on them. This will also hide them from others in your Desk."}</LightText>

                </ScrollView >


                {
                    canContinue() &&

                    <Button
                        title={'Save'}
                        loading={loading}
                        colors={[Colors.primary, Colors.primary]}
                        disabled={
                            deskItem &&
                            deskItem.title == title &&
                            deskItem.description == description &&
                            (deskItem?.media == media || deskItem?.cards == cards || deskItem?.questions == questions) &&
                            deskItem.classId == classId &&
                            deskItem.divisionNumber == divisionNumber &&
                            deskItem.divisionType == divisionType &&
                            deskItem.isPublic == isPublic &&
                            deskItem.isAnonymous == isAnonymous


                        }
                        onPress={handleSave}
                        style={{ position: 'absolute', bottom: 0, width: '100%', borderRadius: 0, height: 80 }}

                    />
                }

            </View >
        </GestureHandlerRootView>


    )
}




export default SaveDeskItem