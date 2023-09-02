import { Pressable, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import React, { useRef } from 'react'
import { haptics } from '../utils'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'


const ScaleButton = ({ toValue, style, onPress, onLongPress, disabled, ...props }) => {
    const scaleValue = useSharedValue(1);

    const animatedStyles = useAnimatedStyle(() => ({

        transform: [{ scale: withSpring(scaleValue.value) }]
    }))




    return (
        <TouchableWithoutFeedback
            onPressIn={() => scaleValue.value = toValue || 0.9}
            onPressOut={() => scaleValue.value = 1}
            onPress={onPress}
            onLongPress={onLongPress}
            disabled={disabled}
        >

            <Animated.View

                style={[animatedStyles, style]}
                {...props}
            >



                {props.children}


            </Animated.View>
        </TouchableWithoutFeedback>

    )
}

export default ScaleButton