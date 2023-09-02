import { View, Text, FlatList, Pressable, StyleSheet, Dimensions } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import { Colors, assets } from '../constants'
import useColorScheme from '../hooks/useColorScheme'
import CustomImage from '../components/CustomImage'
import { MediumText, RegularText } from '../components/StyledText'
import Animated, { FadeIn, FadeOut, SlideInRight, SlideInUp, SlideOutLeft, ZoomIn, ZoomOut, useAnimatedProps, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import Button from '../components/Button'
import { ScrollView } from 'react-native-gesture-handler'
import { SHADOWS } from '../constants/Theme'
import ScaleButton from '../components/ScaleButton'
import { haptics } from '../utils'
import Svg, { Circle } from 'react-native-svg'
import CircularProgress from 'react-native-circular-progress-indicator'
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CIRCLE_LENGTH = 500;

const Game = (props) => {
    const colorScheme = useColorScheme();
    const { game } = props.route.params;
    const { time: timeLimit, questions, type } = game;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const colors = [Colors.red, '#EFB234', Colors.green, Colors.accent, Colors.blue];
    const borderColors = ['#E14949', '#DBA22B', '#2AA374', '#4084C3', '#1656A2'];
    const AnimatedCircle = Animated.createAnimatedComponent(Circle);
    const [score, setScore] = useState(0);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [incorrect, setIncorrect] = useState([]);
    const [correct, setCorrect] = useState([]);
    const [showQuestion, setShowQuestion] = useState(true);
    const [showAnswers, setShowAnswers] = useState(true);
    const [isGameEnded, setIsGameEnded] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const scoreBarProgress = useSharedValue(0);
    const [time, setTime] = useState(0);
    const [showScoreAfterBonus, setShowScoreAfterBonus] = useState(false);

    const startGame = () => {
        setCurrentIndex(0);
        setScore(0);
        setIsGameEnded(false);
        setIsPlaying(true);
        setShowQuestion(true);
        setShowAnswers(true);
        setCorrect([]);
        setIncorrect([]);

    }
    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: CIRCLE_LENGTH * (1 - scoreBarProgress.value)
    }))
    const RADIUS = CIRCLE_LENGTH / (2 * Math.PI);


    useEffect(() => {
        if (isCountingDown) {
            const timer = setTimeout(() => {

                if (countdown > 0) {

                    setCountdown(countdown - 1);

                }
                else {
                    startGame();
                    setIsCountingDown(false);
                    setCountdown(3);

                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [countdown, isCountingDown]);

    useEffect(() => {
        scoreBarProgress.value = withSpring(1)




    }, [])


    const handleAnswer = (selectedAnswer) => {
        haptics('light');
        const correctAnswer = questions[currentIndex].correctAnswer;
        if (correctAnswer == selectedAnswer) {
            setScore(score + 10);
            setCorrect([...correct, questions[currentIndex]]);
        }
        else {
            setScore(score - 5);
            setIncorrect([...incorrect, questions[currentIndex]]);
        }
        setTimeout(() => {
            setShowQuestion(false);
            setShowAnswers(false);
        }, 300);
        const nextQuestion = currentIndex + 1;

        if (nextQuestion < questions.length) {


            setTimeout(() => {
                setCurrentIndex(nextQuestion);
                setShowQuestion(true);
                setShowAnswers(true);

            }, 500);
        }
        else {

            setTimeout(() => {
                setIsGameEnded(true);
                setIsPlaying(false);
            }, 500);


        }
    }
    const getMessage = () => {
        const percentCorrect = (correct.length / questions.length) * 100;

        if (percentCorrect >= 90 && percentCorrect <= 100) {
            return ["Wow! A plus work!", "Someone did their homework."]
        }
        else if (percentCorrect >= 80 && percentCorrect <= 89) {
            return ["What a stellar job!", "Keep this up and you'll be one to beat!"]
        }
        else if (percentCorrect >= 70 && percentCorrect <= 79) {
            return ["Not half bad!", "Nothing less than a success."]
        }
        else if (percentCorrect >= 60 && percentCorrect <= 69) {
            return ["A good effort.", "Just believe in yourself and you can do even better!"]
        }
        else {
            return ["Don't be discouraged.", "You can try and fail but never fail to try!"]
        }

    }
    return (
        <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
            {!isPlaying &&
                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay} />}

            <Header
                backButton={assets.close}
                style={{ zIndex: 3 }}
            />




            {isPlaying &&
                <Animated.View
                    entering={ZoomIn}
                    exiting={ZoomOut}
                    style={{ flexDirection: 'row', alignSelf: 'center' }}>
                    {questions.map((_, index) =>
                        <View
                            key={index}
                            style={[styles.progressBlock, {
                                backgroundColor: index <= currentIndex ? Colors.primary : Colors[colorScheme].gray,
                                borderBottomLeftRadius: index == 0 ? 25 : 0,
                                borderTopLeftRadius: index == 0 ? 25 : 0,
                                borderBottomRightRadius: index == questions.length - 1 ? 25 : 0,
                                borderTopRightRadius: index == questions.length - 1 ? 25 : 0,
                                width: (SCREEN_WIDTH / questions.length) - 30,
                            }]} />
                    )}
                </Animated.View>}
            <View style={{ height: 150, marginTop: 20 }}>


                {showQuestion &&
                    < Animated.View exiting={SlideOutLeft} entering={SlideInRight} style={{ alignSelf: 'center', backgroundColor: Colors[colorScheme].invertedTint, height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 20, ...SHADOWS[colorScheme], shadowColor: "#00000040", width: 300, padding: 25 }}>

                        <MediumText h4 style={{ textAlign: 'center' }}>
                            {isPlaying ? questions[currentIndex].question : ''}
                        </MediumText>
                    </Animated.View>

                }
            </View>

            {
                questions[currentIndex].answerChoices.map((item, index) =>



                    showAnswers &&

                    <ScaleButton
                        exiting={SlideOutLeft.delay(index * 50)}
                        entering={SlideInRight.delay(index * 50)}
                        onPress={() => handleAnswer(item)}
                        key={index}
                        style={[styles.answerChoiceContainer, { zIndex: isPlaying ? 2 : 0, ...SHADOWS[colorScheme], borderColor: borderColors[index], backgroundColor: colors[index], }]}>
                        <MediumText white h5>{isPlaying ? item : ''}</MediumText>
                    </ScaleButton>
                )}

            <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', position: 'absolute', zIndex: 1 }}>

                {isCountingDown &&
                    <Animated.View entering={ZoomIn} exiting={ZoomOut} >


                        <MediumText h1 white>{countdown}</MediumText>
                    </Animated.View>

                }


                {
                    !isPlaying && !isGameEnded && !isCountingDown &&

                    <ScaleButton
                        entering={ZoomIn}
                        exiting={ZoomOut}
                        onPress={() => setIsCountingDown(true)}
                        style={styles.button}>

                        <MediumText white h3 style={{ marginLeft: 10 }}>Start</MediumText>
                    </ScaleButton>

                }


                {isGameEnded && !isCountingDown &&
                    <View style={{ alignItems: 'center', paddingHorizontal: 30 }}>
                        <Animated.View
                            style={{ marginBottom: 50 }}
                            entering={SlideInUp.duration(1000)}>

                            <CircularProgress
                                radius={90}
                                value={(correct.length / questions.length) * 100}
                                progressValueColor={Colors[colorScheme].tint}
                                progressValueFontSize={28}
                                valueSuffix='%'

                                inActiveStrokeColor={Colors[colorScheme].invertedTint}
                                activeStrokeColor={Colors.accent}
                                inActiveStrokeWidth={25}
                                activeStrokeWidth={15}
                                duration={2000}

                            />

                        </Animated.View>

                        <View style={{ flexDirection: 'row', marginBottom: 30 }}>
                            <Animated.View
                                entering={ZoomIn.delay(500).springify()}
                                exiting={ZoomOut}
                                style={{ marginRight: 20, borderRadius: 25, alignItems: 'center', flexDirection: 'row', backgroundColor: Colors[colorScheme].invertedTint, justifyContent: 'center', padding: 10 }}>
                                <CustomImage source={assets.check} style={{ width: 20, height: 20, tintColor: Colors.green }} />

                                <MediumText h3 style={{ marginLeft: 10 }}>{"Correct: "}{correct.length}</MediumText>

                            </Animated.View>

                            <Animated.View
                                entering={ZoomIn.delay(500).springify()}
                                exiting={ZoomOut}
                                style={{ borderRadius: 25, alignItems: 'center', flexDirection: 'row', backgroundColor: Colors[colorScheme].invertedTint, justifyContent: 'center', padding: 10 }}>
                                <CustomImage source={assets.close} style={{ width: 20, height: 20, tintColor: Colors.red }} />

                                <MediumText h3 style={{ marginLeft: 10 }}>{"Incorrect: "}{incorrect.length}</MediumText>

                            </Animated.View>
                        </View>
                        <MediumText white h2 style={{ textAlign: 'center' }}>{getMessage()[0]}</MediumText>
                        <RegularText white h4 style={{ textAlign: 'center', marginBottom: 40 }}>{getMessage()[1]}</RegularText>

                        <ScaleButton
                            entering={ZoomIn.delay(600).springify()}
                            exiting={ZoomOut}

                            style={styles.button}
                            onPress={() => setIsCountingDown(true)}>

                            <CustomImage source={assets.flip} style={{ width: 30, height: 30, tintColor: Colors.white }} />
                            <MediumText white h3 style={{ marginLeft: 10 }}>Restart</MediumText>
                        </ScaleButton>


                        <ScaleButton
                            entering={ZoomIn.delay(1000).springify()}
                            exiting={ZoomOut}

                            style={[styles.button, { backgroundColor: Colors[colorScheme].darkGray, marginTop: 20 }]}
                            onPress={() => props.navigation.goBack()}>

                            <MediumText white h3 >Quit</MediumText>
                        </ScaleButton>
                    </View>



                }

            </View>


        </View >
    )
}
const styles = StyleSheet.create({
    answerChoiceContainer: {
        shadowRadius: 3,
        marginHorizontal: 15,
        shadowColor: '#00000040',
        borderBottomWidth: 8,
        borderWidth: 2,
        padding: 20,
        borderRadius: 10,
        marginVertical: 20
    },
    progressBlock: {
        height: 20,
        marginRight: 8,
    },
    overlay: {
        height: '100%',
        width: '100%',
        backgroundColor: Colors.primary + "50",
        zIndex: 1,
        position: 'absolute'
    },

    button: {
        width: 200,
        borderRadius: 50,
        padding: 15,
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        zIndex: 2
    }
})
export default Game