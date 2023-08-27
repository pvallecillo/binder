import { View, Animated, Modal, useWindowDimensions, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'

import useColorScheme from '../hooks/useColorScheme';
import { Colors } from '../constants';



const SpringModal = ({ showModal, children, onCancel }) => {
    const { width, height } = useWindowDimensions()
    const colorScheme = useColorScheme()
    const translateValue = useRef(new Animated.Value(0)).current
    const scaleValue = useRef(new Animated.Value(0)).current
    const [visible, setVisible] = useState(showModal)

    const toggleModal = () => {
        if (showModal) {
            setVisible(true)
            Animated.spring(scaleValue, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start()
        }
        else {

            setTimeout(() => setVisible(false), 140)
            Animated.timing(scaleValue, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true
            }).start()
        }
    }

    useEffect(() => {
        toggleModal()

    }, [showModal])





    return (
        <Modal

            animationType='fade'
            visible={visible}
            transparent
        >
            <TouchableWithoutFeedback onPress={onCancel}>


                <View style={styles.modalBackground} >


                    <TouchableWithoutFeedback>

                        <Animated.View style={[, styles.container, {
                            backgroundColor: Colors[colorScheme].background,
                            transform: [{ scale: scaleValue }]
                        }]} >
                            {children}

                        </Animated.View>
                    </TouchableWithoutFeedback>

                </View>

            </TouchableWithoutFeedback>
        </Modal >

    )
}
const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: '#00000020',
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        height: 230,
        padding: 10,
        width: '83%',
        borderRadius: 25,
        justifyContent: 'center',

    }
})
export default SpringModal