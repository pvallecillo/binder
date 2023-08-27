import { View, Text, Image } from 'react-native'
import React, { useState } from 'react'
import FastImage from 'react-native-fast-image'

const CustomImage = ({ source, style, ...rest }) => {

    if (!source?.uri) {
        return <></>
    }
    return (
        <Image
            style={style}
            source={{ uri: source.uri, cache: 'force-cache' }}
            {...rest}
        />

    )
}

export default CustomImage