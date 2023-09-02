import { Dimensions, StyleSheet, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import BottomSheet from 'reanimated-bottom-sheet'
import { Colors } from '../constants'
import useColorScheme from '../hooks/useColorScheme'
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import { SHADOWS } from '../constants/Theme'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Pressable } from 'react-native'
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomBottomSheet = ({ show, renderContent, onToggle, height }) => {
    const fall = new Animated.Value(1)
    const colorScheme = useColorScheme()
    const bs = useRef(null)
    const offset = useSharedValue(0);
    const context = useSharedValue({ y: 0 });
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
    const [isOpen, setIsOpen] = useState(show);
    const toggleSheet = () => {
        offset.value = 0;
        setIsOpen(!isOpen);
        onToggle();

    }
    useEffect(() => {
        if (show) {

            setIsOpen(true);
        }
        else {
            setIsOpen(false)
        }
    }, [show])

    const gesture = Gesture.Pan().onChange(event => {

        const offsetDelta = event.changeY + offset.value;
        const clamp = Math.max(-20, offsetDelta)
        offset.value = offsetDelta > 0 ? offsetDelta : withSpring(clamp);

    })
        .onFinalize(() => {
            console.log("Final:", offset.value, "<", SCREEN_HEIGHT / 4);
            if (offset.value < SCREEN_HEIGHT / 4) {
                offset.value = withSpring(0);

            }
            else {
                offset.value = withSpring(SCREEN_HEIGHT, {}, () => {
                    runOnJS(toggleSheet)();
                });

            }
        })


    const translateY = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: offset.value }]
        }
    })



    return (
        <>

            {isOpen &&
                <>

                    <AnimatedPressable
                        exiting={FadeOut}
                        entering={FadeIn}
                        style={{ flex: 1, backgroundColor: '#00000020', zIndex: 1, ...StyleSheet.absoluteFillObject }}
                        onPress={toggleSheet}
                    />
                    <GestureDetector gesture={gesture}>

                        <Animated.View
                            entering={SlideInDown.springify().damping(15)}
                            exiting={SlideOutDown}
                            style={[styles.container, translateY, { top: SCREEN_HEIGHT - (height || 300), ...SHADOWS[colorScheme], }]}>
                            <View style={styles.topHandleBar} />

                            {renderContent()}

                        </Animated.View>
                    </GestureDetector>
                </>
            }

        </>
    )
}
const styles = StyleSheet.create({
    container: {
        zIndex: 1,

        height: 500,
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute',

        borderRadius: 25,
        paddingTop: 20,
        shadowOffset: {
            width: 0,
            height: -15
        }
    },

    topHandleBar: {
        width: 75,

        height: 4,
        backgroundColor: 'lightgray',
        alignSelf: 'center',
        marginHorizontal: 15,
        borderRadius: 25

    }
})
export default CustomBottomSheet