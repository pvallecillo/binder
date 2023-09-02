import { View, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { assets, Colors } from '../constants';
import useColorScheme from '../hooks/useColorScheme';
import StyledTextInput from './StyledTextInput';
// import { isValidImage } from '../utils';

const FlashcardInput = ({ onAddImagePress, onCorrectPress, isFront, isQuestion, containerStyle, style, type, placeholder, isCorrect, onChangeText, value }) => {
    const colorScheme = useColorScheme();
    const [isImage, setIsImage] = useState(false);
    const checkValidImage = (imageUrl) => {
        console.log("check valid image")

        const isValidImageUrl = (/\.(gif|jpe?g|jpg|tiff?|png|webp|bmp)$/i).test(imageUrl);
        if (imageUrl && isValidImageUrl) {
            console.log("valid url")
            fetch(imageUrl)
                .then(response => {
                    if (response.ok) {
                        console.log("is an image")
                        setIsImage(true);
                    }
                    else {
                        setIsImage(false);
                        console.log("not an image")

                    }

                })
                .catch((e) => console.log(e))

        }
        else {
            setIsImage(false);

        }

    }

    useEffect(() => {
        checkValidImage(value)


    }, [value])


    return (
        <View style={containerStyle}>
            {!isImage ?  //if the back of the card is not an image then render text input

                <View style={[styles.cardContainer, { backgroundColor: Colors[colorScheme].lightGray, ...style }]}>

                    <StyledTextInput

                        style={styles.cardInput}
                        placeholder={placeholder}
                        value={value}
                        multiline
                        numberOfLines={10}
                        onChangeText={onChangeText}
                        placeholderTextColor={'darkgray'}
                        selectionColor={Colors.accent}


                    />
                    <View style={styles.topRightContainer}>
                        {type == "Game" && !isQuestion && <TouchableOpacity
                            onPress={() => isCorrect ? onCorrectPress('') : onCorrectPress(value)}
                            style={[styles.cornerButton, { borderWidth: !isCorrect && 1, borderColor: Colors.green, backgroundColor: isCorrect ? Colors.green : 'transparent', marginRight: 10 }]}>
                            <Image source={assets.check} style={{ width: 15, height: 15, tintColor: isCorrect ? Colors.white : Colors.green }} />
                        </TouchableOpacity>}
                        <TouchableOpacity
                            onPress={onAddImagePress}
                            style={styles.cornerButton}>
                            <Image source={assets.camera_o} style={{ width: 15, height: 15, tintColor: 'white' }} />
                        </TouchableOpacity>

                    </View>

                </View>
                ://otherwise render the image
                <View style={styles.cardContainer}>

                    <Image source={{ uri: value }} style={{ width: '100%', height: '100%' }} />
                    <TouchableOpacity
                        onPress={() => onChangeText('')}
                        style={[styles.cornerButton, { position: 'absolute', top: 10, right: 10, backgroundColor: '#00000080' }]}>
                        <Image source={assets.trash} style={{ width: 15, height: 15, tintColor: 'white' }} />
                    </TouchableOpacity>

                </View>

            }
        </View>
    )
}

const styles = StyleSheet.create({
    cardContainer: {

        width: 175,
        height: 150,


        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flexDirection: 'row',

    },
    topRightContainer: {
        position: 'absolute',
        top: 10,
        right: 5,
        flexDirection: 'row'
    },
    cardContainerLeft: {
        width: 175,
        height: 150,
        backgroundColor: '#00000010',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flexDirection: 'row',

    },

    imageContainer: {
        marginRight: 20,
        width: 150,
        height: 150,
        backgroundColor: 'gray',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },




    cornerButton: {

        backgroundColor: Colors.accent,
        borderRadius: 50,
        width: 30,
        height: 30,

        justifyContent: 'center',
        alignItems: 'center'
    },
    cardInput: {
        flexDirection: 'row',
        textAlign: 'center',
        fontSize: 16,
        padding: 5
    }




})
export default FlashcardInput