import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { assets, Colors } from '../constants';
import useColorScheme from '../hooks/useColorScheme';
import FlippableFlashcard from './FlippableFlashcard';


const DeskItemEditPreview = (props) => {
    const colorScheme = useColorScheme();
    return (
        <View style={[{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', ...props.style }]}>

            {props.isFlashcard || false ?
                <View style={[styles.mainContainer]}>

                    <FlippableFlashcard

                        width={240}
                        height={150}
                        card={{
                            cardFront: {
                                data: props.cardFront, isImage: props.isCardFrontImage
                            },
                            cardBack: { data: props.cardBack, isImage: props.isCardBackImage }
                        }}
                    />

                </View>

                :
                <View style={[styles.mainContainer, { ...props.style }]}>
                    <View style={styles.fileContainer}>

                        <Image source={{ uri: props.file }} style={{ width: '100%', height: '100%' }} />
                        <TouchableOpacity
                            onPress={props.onRemovePress}
                            style={[styles.removeButton, { right: 10, top: 10, position: 'absolute' }]}>
                            <Image source={assets.trash} style={{ width: 15, height: 15, tintColor: 'white' }} />
                        </TouchableOpacity>
                    </View>

                </View>
            }

            {props.isFlashcard &&
                <TouchableOpacity
                    onPress={props.onRemovePress}
                    style={[styles.removeButton]}>
                    <Image source={assets.trash} style={{ width: 15, height: 15, tintColor: 'white' }} />
                </TouchableOpacity>}


        </View>
    )
}
const styles = StyleSheet.create({
    mainContainer: {

        borderRadius: 15



    },
    cardContainer: {

        width: 175,
        height: 150,
        backgroundColor: '#00000010',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flexDirection: 'row',

    },

    fileContainer: {
        width: 150,
        height: 150,
        backgroundColor: '#00000010',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flexDirection: 'row',
    },



    removeButton: {

        backgroundColor: '#00000080',
        borderRadius: 50,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },




})
export default DeskItemEditPreview