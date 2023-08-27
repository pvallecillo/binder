import { View, Text, StyleSheet, Animated, TouchableWithoutFeedback, TouchableOpacity } from 'react-native'
import React, { useRef } from 'react'
import { Colors } from '../constants'
import useColorScheme from '../hooks/useColorScheme'
import { LinearGradient } from 'expo-linear-gradient';
import { SHADOWS } from '../constants/Theme';
import { ActivityIndicator } from 'react-native-paper';
import { MediumText } from './StyledText';


/*Renders a styled button 
@param condition: boolean to control whether the button should be touchable
@param onPress: Function that will be called when the button is pressed
@param title: The title of the button
@param backgroud: The background color of the button- defaults to primary color
@param tint: the text color of the button - defualts to white
*/

const Button = ({ disabled, animationEnabled, activeOpacity, onPress, style, title, tint, titleStyle, icon, loading, ...props }) => {
    const scaleValue = useRef(new Animated.Value(1)).current
    const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)
    const colors = !disabled ? props.colors || ['#73C0F8', Colors.blue] : ['#DDDEE5', '#DDDEE5']

    const animate = () => {

        Animated.sequence([

            Animated.timing(scaleValue,
                {
                    toValue: 1.1,
                    duration: 150,
                    useNativeDriver: true
                }),
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true
            })]
        ).start()


    }


    const onButtonPress = () => {

        if (!disabled && !loading && onPress) {
            if (animationEnabled == null || animationEnabled == true)
                animate()
            setTimeout(() => onPress(), 100)

        }

    }

    const styles = StyleSheet.create({
        buttonContainer: {
            borderRadius: 50,
            alignSelf: 'center',
            padding: 5,
            paddingHorizontal: 30,
            alignItems: 'center',
            justifyContent: 'center',
            height: 50,

        },
        title: {
            color: tint || Colors.white,
            fontFamily: "KanitMedium",
            fontSize: 20
        }
    })
    return (

        <TouchableWithoutFeedback onPress={onButtonPress}>


            <AnimatedLinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={colors}
                style={[styles.buttonContainer, { ...style, transform: [{ scale: scaleValue }] }]}>



                {!loading ?
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                        {icon}

                        {title && <MediumText h4 style={{ color: tint || Colors.white, marginLeft: icon && 3, ...titleStyle }}>{title}</MediumText>}
                    </View>
                    :
                    <ActivityIndicator color={tint || Colors.white} size={'small'} />
                }



            </AnimatedLinearGradient>
        </TouchableWithoutFeedback>

    )


}

export default Button