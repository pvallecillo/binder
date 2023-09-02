import { View, Text, Animated, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Colors } from '../constants';
import { SHADOWS } from '../constants/Theme';
import useColorScheme from '../hooks/useColorScheme';
import { MediumText, RegularText } from './StyledText';

const FlippableFlashcard = (props) => {

    let flipRotation = 0
    const flipAnimation = useRef(new Animated.Value(0)).current;
    const colorScheme = useColorScheme();
    flipAnimation.addListener(({ value }) => {
        flipRotation = value
    })
    useEffect(() => {

        flipToFront()

    }, [])

    const flipToFront = () => {
        Animated.spring(flipAnimation, {
            toValue: 0,
            friction: 8,
            tension: 10,
            useNativeDriver: true
        }).start();
    }

    const flipToBack = () => {
        Animated.spring(flipAnimation, {
            toValue: 180,
            friction: 8,
            tension: 10,
            useNativeDriver: true
        }).start();
    }
    const flipCard = () => {
        if (flipRotation >= 90) {
            flipToFront();
        }
        else {
            flipToBack();
        }

    }


    const flipToFrontStyle = {
        transform: [
            {
                rotateX: flipAnimation.interpolate({
                    inputRange: [0, 180],
                    outputRange: ["0deg", "180deg"]
                })
            }
        ]
    };
    const flipToBackStyle = {
        transform: [
            {
                rotateX: flipAnimation.interpolate({
                    inputRange: [0, 180],
                    outputRange: ["180deg", "360deg"]
                })
            }
        ]
    };

    return (

        <TouchableOpacity
            activeOpacity={1}
            onPress={flipCard}
            style={[styles.cardContainer, { ...SHADOWS[colorScheme], shadowColor: 'lightgray', ...props.style }]}>
            <View>

                <Animated.View style={{ ...styles.flipCard, backgroundColor: Colors[colorScheme].invertedTint, ...flipToFrontStyle, width: props.width || 320, height: props.height || 180 }}>
                    {
                        !props.card.cardA.isImage ?
                            <MediumText h3 accent style={styles.term}>{props.card.cardA.data}</MediumText>
                            :
                            <Image source={{ uri: props.card.cardA.data }} style={{ width: '90%', height: '90%', borderRadius: 10, resizeMode: 'contain' }} />
                    }
                </Animated.View>

                <Animated.View style={{ ...styles.flipCard, backgroundColor: Colors[colorScheme].invertedTint, ...flipToBackStyle, ...styles.cardB, width: props.width || 320, height: props.height || 180 }}>
                    {!props.card.cardB.isImage ?
                        <RegularText numberOfLines={10} style={styles.definition}>{props.card.cardB.data}</RegularText>
                        :
                        <Image source={{ uri: props.card.cardB.data }} style={{ width: '100%', height: '90%', resizeMode: 'contain' }} />

                    }
                </Animated.View>


            </View>

        </TouchableOpacity>
    )

}

const styles = StyleSheet.create({

    flipCard: {
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',

        backfaceVisibility: 'hidden'

    },

    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',


    },

    term: {
        textAlign: 'center',
        width: "100%",
        alignSelf: 'center',
        backfaceVisibility: 'hidden'
    },

    definition: {


        textAlign: 'left',
        width: '80%',
    },

    cardA: {
        padding: 10,



        borderRadius: 15,
        justifyContent: 'center'

    },
    cardB: {
        position: 'absolute'


    },
})


export default FlippableFlashcard
