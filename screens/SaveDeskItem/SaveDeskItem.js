import { View, ScrollView, Animated, Dimensions } from 'react-native'
import React, { useState } from 'react'
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
const MAX_IMAGES = 8;
const SaveDeskItem = (props) => {
    const { height } = Dimensions.get('window');
    const { useCase, deskItem, onSave } = props.route.params;
    const colorScheme = useColorScheme();
    const type = props.route.params?.type || deskItem?.type
    const [classId, setClassId] = useState(deskItem?.classId || null);

    const [selectedCard, setSelectedCard] = useState('');
    const [isFrontImage, setIsFrontImage] = useState(false);
    const [isBackImage, setIsBackImage] = useState(false);
    const [cardFront, setCardFront] = useState('');
    const [cardBack, setCardBack] = useState('');
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
    const [showImageOptionsModal, setShowImageOptionsModal] = useState(false);


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



    const addImage = (image) => {
        if (type === "Flashcards") {
            if (selectedCard === "cardFront") {

                setIsFrontImage(true);
                setCardFront(image);
            }


            else {
                setIsBackImage(true);
                setCardBack(image);

            }
        } else {

            setMedia([...media, image]);
        }


    }


    const onLibraryPress = async () => {

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Photos,
            selectionLimit: 3
        });

        if (!result.canceled && result != null) {

            addImage(result.assets[0].uri);
        }
        setShowImageOptionsModal(false)

    }
    const addImages = (images) => {
        const array = []
        for (let i = 0; i < images.length; i++) {
            if (media.length + array.length < MAX_IMAGES)
                array.push(images[i]);
        }
        setMedia([...media, ...array])

    }
    const onTakePicturePress = () => {

        setShowImageOptionsModal(false);
        props.navigation.navigate('Camera', {
            useCase: type === 'Flashcards' ? 'single photo to use' : 'multiple photos to use',

            canRecord: false,
            callback: (result) => {
                if (type == 'Flashcards')
                    addImage(result)

                else
                    addImages(result);
            }
        });
    }

    const deleteCard = (card) => {
        setCards(cards.filter(item => item != card))
    }
    const deleteFile = (file) => {
        setMedia(media.filter(item => item != file))

    }
    const canContinue = () => {
        return (media.length > 0 || cards.length > 0) && title.trim();
    }
    const uploadFlashcards = (id) => new Promise((resolve, reject) => {
        for (let i = 0; i < cards.length; i++) {
            if (cards[i].cardFront.isImage) {
                const media = cards[i].cardFront.data;
                const filename = media.substring(media.lastIndexOf('/') + 1);
                const path = `desk-item/${auth.currentUser.uid}/${id + i}/${filename}`;

                saveMediaToStorage(media, path)
                    .then(url => {
                        cards[i].cardFront.data = url;
                    })
                    .catch(e => console.log(e));
            }

            if (cards[i].cardBack.isImage) {
                const media = cards[i].cardBack.data
                const filename = media.substring(media.lastIndexOf('/') + 1);
                const path = `desk-item/${auth.currentUser.uid}/${id + i}/${filename}`;

                saveMediaToStorage(media, path)
                    .then(url => {
                        cards[i].cardBack.data = url;
                    })
                    .catch(e => console.log(e))
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
                .catch(e => {
                    console.log(e);
                    reject(e);

                })
        }
    })


    const handleSave = async () => {
        setLoading(true);
        props.onTaskStart('Saving...');
        const data = type == 'Flashcards' ? flashcardsData : notesData;

        //id representing the folder that all the uploaded images/videos will be put in
        if (useCase == 'new desk item')
            postDeskItem(data)
                .then((id) => {
                    if (type != 'Flashcards')
                        uploadMedia(id)
                            .then((url) => updateDeskItem(id, { media: url }))
                    else
                        uploadFlashcards(id)
                            .then(() => updateDeskItem(id, { cards }));
                })
                .then(() => {
                    setLoading(false);
                    props.onTaskComplete('Saved!');
                    onSave(data);
                    props.navigation.goBack();


                })

                .catch(e => {
                    console.log(e);
                    props.onTaskError(e.message);
                    props.navigation.goBack();

                })
        else
            updateDeskItem(deskItem.id, data)
                .then(() => {
                    if (type != 'Flashcards')
                        if (deskItem.media != media)
                            uploadMedia(deskItem.id)
                                .then((url) => updateDeskItem(deskItem.id, { media: url }))

                        else
                            if (deskItem.cards != cards)

                                uploadFlashcards(deskItem.id)
                                    .then(() => updateDeskItem(deskItem.id, { cards }));
                })
                .then(() => {
                    setLoading(false);
                    props.onTaskComplete('Saved!');
                    onSave(data);
                    props.navigation.goBack();
                })

                .catch(e => {
                    console.log(e);
                    props.onTaskError(e.message);
                    props.navigation.goBack();

                })



    }
    const onAddCardPress = () => {
        cards.push({
            cardFront: {
                data: cardFront, isImage: isFrontImage
            },
            cardBack: { data: cardBack, isImage: isBackImage }
        });
        setCardBack('');
        setCardFront('');
        setIsBackImage(false);
        setIsFrontImage(false);

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
        <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>


            <AnimatedHeader
                animatedValue={scrollY}
                title={useCase == 'new desk item' ? 'New ' + type : 'Edit ' + type}

                direction={'horizontal'}

            />
            <SlideModal
                onCancel={() => setShowImageOptionsModal(false)}
                showModal={showImageOptionsModal}
                height={height - (3 * 50) - 10}

            >
                <OptionsList

                    options={['Take Photo', 'Upload Photo']}
                    onOptionPress={[onTakePicturePress, onLibraryPress]}
                    onCancel={() => setShowImageOptionsModal(false)}
                />
            </SlideModal>

            <ScrollView
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
                style={{ padding: 15 }}
                ref={(ref) => setScrollRef(ref)}
                showsVerticalScrollIndicator={false}>



                {
                    type !== 'Flashcards' ?
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <MediumText darkgray h3 style={[styles.sectionHeaderText, { marginBottom: 0, marginTop: 0 }]}>{"Media (" + media.length + "/" + MAX_IMAGES + ")"}</MediumText>
                            <MediumText
                                h4
                                accent={media.length < MAX_IMAGES}
                                darkgray={media.length >= MAX_IMAGES}
                                onPress={() => setShowImageOptionsModal(true)}
                                disabled={media.length >= MAX_IMAGES}
                            >Add</MediumText>
                        </View>

                        :

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                            <MediumText verydarkgray h4 style={styles.sectionHeaderText}>{'Cards (' + cards.length + '/9)'}</MediumText>


                            < MediumText
                                accent={cardFront && cardBack && cards.length < 9}
                                darkgray={!cardFront || !cardBack || cards.length >= 9}
                                h4
                                style={{ marginVertical: 20 }}
                                disabled={cards.length == 9}
                                onPress={onAddCardPress}>{'Add'}</MediumText>
                        </View>

                }
                {
                    type === 'Flashcards' &&
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>


                        <FlashcardInput
                            isImage={isFrontImage}
                            onAddImagePress={() => setShowImageOptionsModal(true)}
                            value={cardFront}
                            isFront={true}
                            onChangeText={(value) => setCardFront(value)}
                            onRemovePress={() => { setIsFrontImage(false); setCardFront(''); }} />

                        <FlashcardInput
                            onAddImagePress={() => setShowImageOptionsModal(true)}

                            isImage={isBackImage}
                            value={cardBack}
                            isFront={false}
                            onChangeText={(value) => setCardBack(value)}
                            onRemovePress={() => { setIsBackImage(false); setCardBack(''); }} />

                    </View>
                }




                {
                    type !== "Flashcards" &&
                    <ScrollView contentContainerStyle={{ flexWrap: 'wrap', flexDirection: 'row' }}>
                        {media.map((item, index) =>
                            <View key={index}>


                                <DeskItemEditPreview
                                    onRemovePress={() => deleteFile(item)}
                                    file={item}
                                    style={{ marginRight: 10, marginTop: 20 }}
                                    isFlashcard={false} />


                            </View>
                        )}




                    </ScrollView>
                }

                {
                    type == "Flashcards" &&
                    <View>
                        {cards.map((card, index) =>
                            <View

                                key={index.toString()}>


                                <DeskItemEditPreview
                                    isFlashcard

                                    cardFront={card.cardFront.data}
                                    cardBack={card.cardBack.data}
                                    isCardBackImage={card.cardBack.isImage}
                                    isCardFrontImage={card.cardFront.isImage}
                                    onRemovePress={() => deleteCard(card)}
                                    style={{ marginTop: 20 }} />

                            </View>
                        )}




                    </View>
                }





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
                                        emoji: item.emoji
                                    }}
                                    isSelected={item.id === classId}

                                />

                            )}

                        </ScrollView>
                        <LightText verydarkgray style={{ marginTop: 10, marginBottom: 30 }}>{'Select which class your ' + type + ' are for.'}</LightText>
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


            {canContinue() &&

                <Button
                    title={'Save'}
                    loading={loading}
                    colors={[Colors.primary, Colors.primary]}
                    disabled={
                        deskItem &&
                        deskItem.title == title &&
                        deskItem.description == description &&
                        (deskItem.media == media || deskItem.cards == cards) &&
                        deskItem.classId == classId &&
                        deskItem.divisionNumber == divisionNumber &&
                        deskItem.divisionType == divisionType &&
                        deskItem.isPublic == isPublic &&
                        deskItem.isAnonymous == isAnonymous


                    }
                    onPress={handleSave}
                    style={{ position: 'absolute', bottom: 0, width: '100%', borderRadius: 0, height: 80 }}

                />}

        </View >
    )
}




export default SaveDeskItem