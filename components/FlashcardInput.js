import { View, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React from 'react'
import { assets, Colors } from '../constants';
import useColorScheme from '../hooks/useColorScheme';
import StyledTextInput from './StyledTextInput';

const FlashcardInput = ({ isImage, onAddImagePress, onChangeText, value, onRemovePress, isFront, }) => {
    const colorScheme = useColorScheme();
    return (
        <View>
            {!isImage ?  //if the back of the card is not an image the render text input card

                <View style={[styles.cardContainer, { backgroundColor: Colors[colorScheme].lightGray }]}>

                    <StyledTextInput
                        style={styles.cardInput}
                        placeholder={isFront ? "Term" : 'Definition'}
                        value={value}
                        multiline
                        numberOfLines={10}
                        onChangeText={(value) => onChangeText(value)}


                        placeholderTextColor={'darkgray'}
                        selectionColor={Colors.accent}


                    />
                    <TouchableOpacity
                        onPress={onAddImagePress}
                        style={styles.cornerButton}>
                        <Image source={assets.camera_o} style={{ width: 15, height: 15, tintColor: 'white' }} />
                    </TouchableOpacity>

                </View>
                ://otherwise render the image
                <View style={styles.cardContainer}>

                    <Image source={{ uri: value }} style={{ width: '100%', height: '100%' }} />
                    <TouchableOpacity
                        onPress={onRemovePress}
                        style={styles.cornerButton}>
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
        position: 'absolute',
        top: 10,
        right: 5,
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