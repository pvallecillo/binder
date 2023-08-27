import { Animated, TouchableOpacity } from 'react-native'
import React, { useRef } from 'react'
import { haptics } from '../utils'


const ScaleButton = (props) => {
    const scaleValue = useRef(new Animated.Value(1)).current
    const animationDuration = 80
    const animationEnabled = props.animationEnabled == null ? true : props.animationEnabled
    const animate = () => {
        Animated.sequence([


            Animated.timing(scaleValue, {
                toValue: props.toValue || 0.9,
                duration: props.duration || animationDuration,
                useNativeDriver: true
            }),
            Animated.timing(scaleValue,
                {
                    toValue: 1,
                    duration: props.duration || animationDuration,
                    useNativeDriver: true
                })
        ]).start()



    }



    const onButtonPress = () => {
        if (animationEnabled)
            animate()
        setTimeout(() => {
            props.onPress()
        }, animationDuration);


    }
    const onButtonLongPress = () => {
        if (!props.disabled) {
            haptics('light')

            props.onLongPress()
        }
    }

    return (

        <TouchableOpacity
            disabled={props.disabled}
            onPress={onButtonPress}
            onLongPress={onButtonLongPress}
            activeOpacity={props.activeOpacity || 1}
            {...props}
        >

            <Animated.View style={{ transform: [{ scale: scaleValue }], ...props.style }}>

                {props.children}


            </Animated.View>
        </TouchableOpacity>
    )
}

export default ScaleButton