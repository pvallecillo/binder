import { View, FlatList, Image, TouchableWithoutFeedback, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { assets, Colors } from '../constants'
import useColorScheme from '../hooks/useColorScheme'
import { auth, db } from '../Firebase/firebase'
import { Dropdown } from 'react-native-element-dropdown'
import { LightText, MediumText } from '../components/StyledText'

import { bindActionCreators } from 'redux'
import { connect, useSelector } from 'react-redux'
import DeskItemThumbnail from '../components/DeskItemThumbnail'
import CustomImage from '../components/CustomImage'
import { fetchUserDeskItems } from '../redux/actions'
import { getDefaultImage, getProfileItemsSubtitle } from '../utils'
import FilterButton from '../components/FilterButton'
import Header from '../components/Header'
import Button from '../components/Button'
import { useDeskItems } from '../hooks/useDeskItems'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SelectDeskItem = (props) => {
    const colorScheme = useColorScheme();
    const chats = useSelector(state => state.userChatsState.chats)
    const classes = chats.filter(item => item.type == 'class');
    const insets = useSafeAreaInsets();
    const [deskType, setDeskType] = useState('Notes');
    const { onSubmit } = props.route.params;
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeskTypes, setShowDeskTypes] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const { deskItems } = useDeskItems(auth.currentUser.uid);
    const [deskItemsResults, setDeskItemsResults] = useState(deskItems);
    const users = useSelector(state => state.usersState.users)
    const deskTypes = [
        'Notes',
        'Flashcards',
        'Study Guides',
        'Graded Work',
        'Other',
    ];

    useEffect(() => {
        if (selectedFilter) {
            setDeskItemsResults(deskItems
                .filter(el => el.type == deskType)
                .filter(el => el.classId == selectedFilter.id));
        }
        else {

            setDeskItemsResults(deskItems
                .filter(el => el.type.toLowerCase() == deskType.toLowerCase()));
        }


    }, [deskType, selectedFilter, deskItems])


    const getItemLayout = (data, index) => {
        const productHeight = 80;
        return {
            length: productHeight,
            offset: productHeight * index,
            index,
        };
    };
    const isSelected = (item) => {
        return selectedItem?.id == item.id;
    }
    const onSelect = (item) => {
        if (isSelected(item)) {
            return setSelectedItem(null);
        }
        else {
            return setSelectedItem(item)
        }
    }
    const onRefresh = () => {
        setRefreshing(true);
        setRefreshing(false);
    }

    const isFilterSelected = (item) => {
        if (item?.more) {
            for (let i = 0; i < item.more.length; i++) {
                if (item.more[i].id == selectedFilter?.id) {
                    return true
                }
            }
        }
        else
            return item.id == selectedFilter?.id
        return false
    }



    const filter = (item) => {


        if (item != null && item.id != selectedFilter?.id) {
            setSelectedFilter(item)
        }
        else {

            setSelectedFilter(null)
        }

    }

    const onDonePress = () => {

        props.navigation.goBack();
        setTimeout(() => {
            onSubmit(selectedItem);
        }, 200);
    }

    return (
        <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>

            <Header
                isModal
                title={"Select " + deskType}
                direction={'vertical'}
                headerRight={

                    <TouchableOpacity
                        activeOpacity={0.5}
                        disabled={!selectedItem}
                        onPress={onDonePress}
                    >
                        <MediumText h4 accent={selectedItem} darkgray={!selectedItem}>Add</MediumText>
                    </TouchableOpacity>
                }


            />

            <View style={{ marginVertical: 20 }}>

                <TouchableWithoutFeedback onPress={() => setShowDeskTypes(true)}>

                    <View style={{ backgroundColor: Colors[colorScheme].tint, borderRadius: 50, alignSelf: 'center', padding: 10, paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                        <MediumText white h5>{deskType}</MediumText>
                        <CustomImage source={assets.down_arrow} style={{ marginLeft: 5, width: 28, height: 28, tintColor: Colors[colorScheme].background }} />

                    </View>
                </TouchableWithoutFeedback>



            </View>

            {!showDeskTypes &&
                <View style={{ padding: 10, height: '100%' }}>

                    <FlatList
                        refreshControl={<RefreshControl
                            onRefresh={onRefresh}
                            refreshing={refreshing}
                            color={Colors[colorScheme].darkGray}
                        />}
                        ListEmptyComponent={<MediumText darkgray h5 style={{ alignSelf: 'center', marginTop: 100 }}>No Items</MediumText>}

                        data={deskItemsResults}
                        getItemLayout={getItemLayout}
                        numColumns={2}
                        keyExtractor={(item) => item.id}
                        horizontal={false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator
                        renderItem={({ item }) =>

                            <DeskItemThumbnail
                                style={{ marginRight: 5, marginTop: 10 }}
                                selectionMode={true}
                                onPress={() => onSelect(item)}
                                deskItem={item}
                                isSelected={isSelected(item)}
                                deskType={deskType}

                                user={users.find(user => user.uid == item.uid)}
                            />

                        }

                    />
                </View>
            }


            {
                showDeskTypes && deskItems &&
                <View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {deskTypes.map((item) => {
                            const deskItem = deskItems.find(el => el.type == item);
                            const items = deskItems.filter(el => el.type == item);
                            return (

                                <View
                                    key={item}
                                    style={{ backgroundColor: Colors[colorScheme].darkGray }}>


                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => { setDeskType(item); setShowDeskTypes(false); }}
                                        style={{ backgroundColor: Colors[colorScheme].invertedTint, padding: 20, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: Colors[colorScheme].lightGray, width: 80, height: 80, overflow: 'hidden', borderRadius: 15, borderWidth: 1, borderColor: 'lightgray' }}>
                                                {items.length ?

                                                    deskItem.type != 'Flashcards' ?
                                                        <CustomImage source={{ uri: deskItem.media[0] }} style={{ width: '100%', height: '100%' }} />
                                                        :
                                                        <CustomImage source={assets.flashcards} style={{ width: 38, height: 38, tintColor: Colors[colorScheme].darkGray, transform: [{ rotate: '90deg' }] }} />

                                                    :
                                                    <CustomImage source={assets.desk} style={{ width: 38, height: 38, tintColor: Colors[colorScheme].darkGray }} />

                                                }

                                            </View>
                                            <View style={{ marginLeft: 10 }}>

                                                <MediumText h4 accent={deskType == item} >{item}</MediumText>
                                                <LightText darkgray>{getProfileItemsSubtitle(items, "Item")}</LightText>
                                            </View>



                                        </View>

                                        <CustomImage source={assets.right_arrow} style={{ width: 25, height: 25, tintColor: Colors[colorScheme].darkGray }} />

                                    </TouchableOpacity>
                                </View>)
                        })}
                    </ScrollView>
                </View>
            }


            {!showDeskTypes &&
                <View style={{ position: 'absolute', bottom: 0, padding: 10, backgroundColor: Colors[colorScheme].invertedTint, borderTopColor: 'lightgray', borderTopWidth: 1, width: '100%' }}>

                    <FlatList
                        style={{ paddingBottom: 40, marginBottom: insets.bottom }}
                        data={classes}
                        horizontal
                        renderItem={({ item }) => (
                            <FilterButton
                                onPress={(item) => filter(item)}
                                isSelected={isFilterSelected(item)}
                                item={{
                                    text: item.name,
                                    imageURL: item.photoURL ||
                                        item.emoji ||
                                        item.icon ||
                                        getDefaultImage('class'),
                                    id: item.id,
                                }} />
                        )}
                    />
                </View>}

        </View>
    )
}




export default SelectDeskItem