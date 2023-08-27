import { TouchableWithoutFeedback, StyleSheet, View } from 'react-native'
import React, { FC } from 'react'
import { assets, Colors } from '../constants'
import useColorScheme from '../hooks/useColorScheme'
import CustomImage from './CustomImage'


const SelectionButton = ({ color, isSelected, onSelect, style }) => {
    const colorScheme = useColorScheme()
    const activeColor = color || Colors.accent
    const inactiveColor = Colors[colorScheme].lightGray
    const styles = StyleSheet.create({
        selectionBtn: {
            padding: 5,
            justifyContent: 'center',
            alignItems: 'center',
            width: 24,
            height: 24,
            borderRadius: 50,
            backgroundColor: !isSelected ? inactiveColor : Colors.accent,
        }

    })
    return (
        <TouchableWithoutFeedback onPress={onSelect}
        >

            <View
                style={[styles.selectionBtn, { ...style }]}>

                {isSelected && <CustomImage source={assets.check} style={{ width: 12, height: 12, tintColor: Colors.white }} />}

            </View>


        </TouchableWithoutFeedback>





    )

}

export default SelectionButton

